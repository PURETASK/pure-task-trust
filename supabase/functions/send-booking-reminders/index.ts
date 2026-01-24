import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface JobWithProfiles {
  id: string;
  scheduled_date: string;
  scheduled_time: string | null;
  total_credits: number | null;
  reminder_sent_at: string | null;
  client_id: string | null;
  cleaner_id: string | null;
  property_id: string | null;
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

    console.log("Starting booking reminders job...");

    // Calculate time window: jobs scheduled for next 24-25 hours
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const tomorrowEnd = new Date(now.getTime() + 25 * 60 * 60 * 1000);

    // Fetch jobs scheduled for tomorrow that haven't received reminders
    const { data: jobs, error: jobsError } = await supabase
      .from("jobs")
      .select("id, scheduled_date, scheduled_time, total_credits, reminder_sent_at, client_id, cleaner_id, property_id")
      .gte("scheduled_date", tomorrow.toISOString().split("T")[0])
      .lte("scheduled_date", tomorrowEnd.toISOString().split("T")[0])
      .is("reminder_sent_at", null)
      .in("status", ["confirmed", "scheduled"]);

    if (jobsError) {
      console.error("Failed to fetch jobs:", jobsError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch jobs" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${jobs?.length || 0} jobs needing reminders`);

    const results = {
      processed: 0,
      clientEmails: 0,
      cleanerEmails: 0,
      errors: [] as string[],
    };

    for (const job of (jobs || []) as JobWithProfiles[]) {
      try {
        // Get property details
        let address = "Your address";
        if (job.property_id) {
          const { data: property } = await supabase
            .from("properties")
            .select("address_line1, city, state")
            .eq("id", job.property_id)
            .single();
          
          if (property) {
            address = `${property.address_line1}, ${property.city}, ${property.state}`;
          }
        }

        const scheduledTime = job.scheduled_time || "Scheduled time";
        const scheduledDate = job.scheduled_date;

        // Get client profile
        if (job.client_id) {
          const { data: clientProfile } = await supabase
            .from("client_profiles")
            .select("user_id, first_name")
            .eq("id", job.client_id)
            .single();

          if (clientProfile?.user_id) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("email, full_name")
              .eq("id", clientProfile.user_id)
              .single();

            // Get cleaner name
            let cleanerName = "Your cleaner";
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

            if (profile?.email) {
              // Send client reminder
              const { error: clientEmailError } = await supabase.functions.invoke("send-email", {
                body: {
                  to: profile.email,
                  template: "booking_reminder",
                  data: {
                    clientName: profile.full_name || clientProfile.first_name,
                    cleanerName,
                    date: scheduledDate,
                    time: scheduledTime,
                    address,
                    jobId: job.id,
                  },
                },
              });

              if (clientEmailError) {
                results.errors.push(`Client email failed for job ${job.id}: ${clientEmailError.message}`);
              } else {
                results.clientEmails++;
                
                // Log notification
                await supabase.from("notification_logs").insert({
                  user_id: clientProfile.user_id,
                  channel: "email",
                  type: "booking_reminder",
                  recipient: profile.email,
                  subject: `Reminder: Cleaning Tomorrow at ${scheduledTime} 🧹`,
                  status: "sent",
                });
              }
            }
          }
        }

        // Get cleaner profile
        if (job.cleaner_id) {
          const { data: cleanerProfile } = await supabase
            .from("cleaner_profiles")
            .select("user_id, first_name")
            .eq("id", job.cleaner_id)
            .single();

          if (cleanerProfile?.user_id) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("email, full_name")
              .eq("id", cleanerProfile.user_id)
              .single();

            // Get client name
            let clientName = "Your client";
            if (job.client_id) {
              const { data: clientData } = await supabase
                .from("client_profiles")
                .select("first_name")
                .eq("id", job.client_id)
                .single();
              if (clientData) {
                clientName = clientData.first_name || clientName;
              }
            }

            if (profile?.email) {
              // Send cleaner reminder
              const { error: cleanerEmailError } = await supabase.functions.invoke("send-email", {
                body: {
                  to: profile.email,
                  template: "cleaner_job_reminder",
                  data: {
                    cleanerName: profile.full_name || cleanerProfile.first_name,
                    clientName,
                    date: scheduledDate,
                    time: scheduledTime,
                    address,
                    credits: job.total_credits,
                    jobId: job.id,
                  },
                },
              });

              if (cleanerEmailError) {
                results.errors.push(`Cleaner email failed for job ${job.id}: ${cleanerEmailError.message}`);
              } else {
                results.cleanerEmails++;
                
                // Log notification
                await supabase.from("notification_logs").insert({
                  user_id: cleanerProfile.user_id,
                  channel: "email",
                  type: "cleaner_job_reminder",
                  recipient: profile.email,
                  subject: `Job Reminder: Tomorrow at ${scheduledTime} 📍`,
                  status: "sent",
                });
              }
            }
          }
        }

        // Mark job as reminder sent
        await supabase
          .from("jobs")
          .update({ reminder_sent_at: new Date().toISOString() })
          .eq("id", job.id);

        results.processed++;
      } catch (jobError: unknown) {
        const errorMessage = jobError instanceof Error ? jobError.message : "Unknown error";
        results.errors.push(`Error processing job ${job.id}: ${errorMessage}`);
      }
    }

    console.log("Booking reminders job completed:", results);

    return new Response(
      JSON.stringify({ success: true, results }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in send-booking-reminders function:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
