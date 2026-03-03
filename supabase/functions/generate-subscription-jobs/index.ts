import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Subscription {
  id: string;
  client_id: string;
  cleaner_id: string | null;
  property_id: string | null;
  frequency: string;
  preferred_day: string | null;
  preferred_time: string | null;
  services: string[] | null;
  status: string;
  next_job_date: string | null;
  credits_per_job: number | null;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Starting subscription job generation...");

    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    // Get active subscriptions due for job creation
    const { data: subscriptions, error: subError } = await supabase
      .from("cleaning_subscriptions")
      .select("*")
      .eq("status", "active")
      .lte("next_job_date", todayStr);

    if (subError) {
      console.error("Failed to fetch subscriptions:", subError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch subscriptions" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${subscriptions?.length || 0} subscriptions needing jobs`);

    const results = {
      jobsCreated: 0,
      subscriptionsProcessed: 0,
      errors: [] as string[],
    };

    for (const sub of (subscriptions || []) as Subscription[]) {
      try {
        // Build scheduled_start_at from next_job_date + preferred_time
        const timeStr = sub.preferred_time || "09:00";
        const scheduledStartAt = `${sub.next_job_date}T${timeStr}:00`;

        // Create the job with correct column names
        const { data: job, error: jobError } = await supabase
          .from("jobs")
          .insert({
            client_id: sub.client_id,
            cleaner_id: sub.cleaner_id,
            property_id: sub.property_id,
            scheduled_start_at: scheduledStartAt,
            status: sub.cleaner_id ? "confirmed" : "pending",
            escrow_credits_reserved: sub.credits_per_job,
            subscription_id: sub.id,
            notes: `Recurring ${sub.frequency} cleaning`,
          })
          .select()
          .single();

        if (jobError) {
          results.errors.push(`Job creation failed for sub ${sub.id}: ${jobError.message}`);
          continue;
        }

        results.jobsCreated++;

        // Calculate next job date based on frequency
        const nextDate = new Date(sub.next_job_date!);
        switch (sub.frequency) {
          case "weekly":
            nextDate.setDate(nextDate.getDate() + 7);
            break;
          case "biweekly":
            nextDate.setDate(nextDate.getDate() + 14);
            break;
          case "monthly":
            nextDate.setMonth(nextDate.getMonth() + 1);
            break;
          default:
            nextDate.setDate(nextDate.getDate() + 7);
        }

        // Update subscription with next job date
        await supabase
          .from("cleaning_subscriptions")
          .update({ next_job_date: nextDate.toISOString().split("T")[0] })
          .eq("id", sub.id);

        results.subscriptionsProcessed++;

        // Log the job creation with correct column names
        await supabase.from("job_status_history").insert({
          job_id: job.id,
          to_status: job.status,
          reason: `Auto-generated from subscription ${sub.id}`,
          changed_by_type: "system",
        });

      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        results.errors.push(`Error processing subscription ${sub.id}: ${errorMessage}`);
      }
    }

    console.log("Subscription job generation completed:", results);

    return new Response(
      JSON.stringify({ success: true, results }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in generate-subscription-jobs:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
