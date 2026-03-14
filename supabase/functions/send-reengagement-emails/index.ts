import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ClientProfileData {
  id: string;
  user_id: string | null;
  first_name: string | null;
}

interface CleanerProfileData {
  id: string;
  user_id: string | null;
  first_name: string | null;
  onboarding_completed_at: string | null;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const cronSecret = Deno.env.get("CRON_SECRET");
  const authHeader = req.headers.get("Authorization");
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Starting re-engagement emails job...");

    const results = {
      clientsProcessed: 0,
      cleanersProcessed: 0,
      emailsSent: 0,
      errors: [] as string[],
    };

    // ============================================
    // INACTIVE CLIENTS (No jobs in 30 days)
    // ============================================
    const clientCutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const reengagementCooldown = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(); // Don't re-send within 14 days

    // Get clients
    const { data: clients, error: clientsError } = await supabase
      .from("client_profiles")
      .select("id, user_id, first_name")
      .not("user_id", "is", null);

    if (clientsError) {
      console.error("Failed to fetch clients:", clientsError);
      results.errors.push(`Failed to fetch clients: ${clientsError.message}`);
    } else {
      for (const client of (clients || []) as ClientProfileData[]) {
        try {
          if (!client.user_id) continue;

          // Get profile
          const { data: profile } = await supabase
            .from("profiles")
            .select("email, full_name, last_reengagement_sent_at")
            .eq("id", client.user_id)
            .single();

          if (!profile?.email) continue;

          // Skip if reengagement email sent recently
          if (profile.last_reengagement_sent_at && profile.last_reengagement_sent_at > reengagementCooldown) {
            continue;
          }

          // Check for recent jobs
          const { data: recentJobs } = await supabase
            .from("jobs")
            .select("id")
            .eq("client_id", client.id)
            .gte("created_at", clientCutoff)
            .limit(1);

          // Check if they've ever had a job
          const { data: anyJobs } = await supabase
            .from("jobs")
            .select("id")
            .eq("client_id", client.id)
            .limit(1);

          // Only send if they had jobs before but none recently
          if (anyJobs?.length && !recentJobs?.length) {
            const { error: emailError } = await supabase.functions.invoke("send-email", {
              body: {
                to: profile.email,
                template: "inactive_client",
                data: {
                  name: profile.full_name || client.first_name,
                },
              },
            });

            if (emailError) {
              results.errors.push(`Client email failed for ${client.id}: ${emailError.message}`);
            } else {
              // Update last reengagement sent
              await supabase
                .from("profiles")
                .update({ last_reengagement_sent_at: new Date().toISOString() })
                .eq("id", client.user_id);

              // Log notification
              await supabase.from("notification_logs").insert({
                user_id: client.user_id,
                channel: "email",
                type: "inactive_client",
                recipient: profile.email,
                subject: "We miss you! Here's 50 bonus credits 💚",
                status: "sent",
              });

              results.emailsSent++;
            }
            results.clientsProcessed++;
          }
        } catch (clientError: unknown) {
          const errorMessage = clientError instanceof Error ? clientError.message : "Unknown error";
          results.errors.push(`Error processing client ${client.id}: ${errorMessage}`);
        }
      }
    }

    // ============================================
    // INACTIVE CLEANERS (No jobs in 14 days)
    // ============================================
    const cleanerCutoff = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();

    // Get cleaners who have completed onboarding
    const { data: cleaners, error: cleanersError } = await supabase
      .from("cleaner_profiles")
      .select("id, user_id, first_name, onboarding_completed_at")
      .not("user_id", "is", null)
      .not("onboarding_completed_at", "is", null);

    if (cleanersError) {
      console.error("Failed to fetch cleaners:", cleanersError);
      results.errors.push(`Failed to fetch cleaners: ${cleanersError.message}`);
    } else {
      // Count available jobs for context
      const { count: jobCount } = await supabase
        .from("jobs")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending");

      for (const cleaner of (cleaners || []) as CleanerProfileData[]) {
        try {
          if (!cleaner.user_id) continue;

          // Get profile
          const { data: profile } = await supabase
            .from("profiles")
            .select("email, full_name, last_reengagement_sent_at")
            .eq("id", cleaner.user_id)
            .single();

          if (!profile?.email) continue;

          // Skip if reengagement email sent recently
          if (profile.last_reengagement_sent_at && profile.last_reengagement_sent_at > reengagementCooldown) {
            continue;
          }

          // Check for recent jobs
          const { data: recentJobs } = await supabase
            .from("jobs")
            .select("id")
            .eq("cleaner_id", cleaner.id)
            .gte("created_at", cleanerCutoff)
            .limit(1);

          if (!recentJobs?.length) {
            const { error: emailError } = await supabase.functions.invoke("send-email", {
              body: {
                to: profile.email,
                template: "inactive_cleaner",
                data: {
                  name: profile.full_name || cleaner.first_name,
                  jobCount: jobCount || "Several",
                  avgEarnings: "$80-150",
                },
              },
            });

            if (emailError) {
              results.errors.push(`Cleaner email failed for ${cleaner.id}: ${emailError.message}`);
            } else {
              // Update last reengagement sent
              await supabase
                .from("profiles")
                .update({ last_reengagement_sent_at: new Date().toISOString() })
                .eq("id", cleaner.user_id);

              // Log notification
              await supabase.from("notification_logs").insert({
                user_id: cleaner.user_id,
                channel: "email",
                type: "inactive_cleaner",
                recipient: profile.email,
                subject: "New jobs waiting for you! 🧹",
                status: "sent",
              });

              results.emailsSent++;
            }
            results.cleanersProcessed++;
          }
        } catch (cleanerError: unknown) {
          const errorMessage = cleanerError instanceof Error ? cleanerError.message : "Unknown error";
          results.errors.push(`Error processing cleaner ${cleaner.id}: ${errorMessage}`);
        }
      }
    }

    console.log("Re-engagement emails job completed:", results);

    return new Response(
      JSON.stringify({ success: true, results }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in send-reengagement-emails function:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
