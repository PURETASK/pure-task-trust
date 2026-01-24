import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface JobData {
  id: string;
  completed_at: string | null;
  review_nudge_sent_at: string | null;
  client_id: string | null;
  cleaner_id: string | null;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Starting review nudge job...");

    // Find jobs completed 48+ hours ago without a review and no nudge sent
    const cutoffTime = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

    // Get completed jobs without review nudge
    const { data: jobs, error: jobsError } = await supabase
      .from("jobs")
      .select("id, completed_at, review_nudge_sent_at, client_id, cleaner_id")
      .eq("status", "completed")
      .lte("completed_at", cutoffTime)
      .is("review_nudge_sent_at", null);

    if (jobsError) {
      console.error("Failed to fetch jobs:", jobsError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch jobs" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${jobs?.length || 0} jobs needing review nudges`);

    const results = {
      processed: 0,
      emailsSent: 0,
      skipped: 0,
      errors: [] as string[],
    };

    for (const job of (jobs || []) as JobData[]) {
      try {
        // Check if a review already exists for this job
        const { data: existingReview } = await supabase
          .from("reviews")
          .select("id")
          .eq("job_id", job.id)
          .maybeSingle();

        if (existingReview) {
          // Review already exists, mark as nudge sent to prevent future checks
          await supabase
            .from("jobs")
            .update({ review_nudge_sent_at: new Date().toISOString() })
            .eq("id", job.id);
          results.skipped++;
          continue;
        }

        // Get client profile
        if (!job.client_id) {
          results.errors.push(`No client_id for job ${job.id}`);
          continue;
        }

        const { data: clientProfile } = await supabase
          .from("client_profiles")
          .select("user_id, first_name")
          .eq("id", job.client_id)
          .single();

        if (!clientProfile?.user_id) {
          results.errors.push(`No user_id for client of job ${job.id}`);
          continue;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("email, full_name")
          .eq("id", clientProfile.user_id)
          .single();

        if (!profile?.email) {
          results.errors.push(`No email for client of job ${job.id}`);
          continue;
        }

        // Get cleaner name
        let cleanerName = "your cleaner";
        if (job.cleaner_id) {
          const { data: cleanerProfile } = await supabase
            .from("cleaner_profiles")
            .select("first_name")
            .eq("id", job.cleaner_id)
            .single();
          if (cleanerProfile) {
            cleanerName = cleanerProfile.first_name || cleanerName;
          }
        }

        // Send review nudge email
        const { error: emailError } = await supabase.functions.invoke("send-email", {
          body: {
            to: profile.email,
            template: "review_nudge",
            data: {
              clientName: profile.full_name || clientProfile.first_name,
              cleanerName,
              jobId: job.id,
            },
          },
        });

        if (emailError) {
          results.errors.push(`Email failed for job ${job.id}: ${emailError.message}`);
          continue;
        }

        // Mark job as nudge sent
        await supabase
          .from("jobs")
          .update({ review_nudge_sent_at: new Date().toISOString() })
          .eq("id", job.id);

        // Log notification
        await supabase.from("notification_logs").insert({
          user_id: clientProfile.user_id,
          channel: "email",
          type: "review_nudge",
          recipient: profile.email,
          subject: "We'd love your feedback! ⭐",
          status: "sent",
        });

        results.emailsSent++;
        results.processed++;
      } catch (jobError: unknown) {
        const errorMessage = jobError instanceof Error ? jobError.message : "Unknown error";
        results.errors.push(`Error processing job ${job.id}: ${errorMessage}`);
      }
    }

    console.log("Review nudge job completed:", results);

    return new Response(
      JSON.stringify({ success: true, results }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in send-review-nudge function:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
