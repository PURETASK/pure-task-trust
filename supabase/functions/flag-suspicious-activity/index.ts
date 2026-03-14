import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { withCronMonitor } from "../_shared/sentry.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
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

    console.log("Starting suspicious activity detection...");

    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const alerts: Array<{ type: string; details: Record<string, unknown> }> = [];

    // 1. Multiple failed login attempts
    const { data: failedLogins } = await supabase
      .from("auth_logs")
      .select("user_id")
      .eq("event", "login_failed")
      .gte("created_at", last24h);

    // Count by user
    const loginAttempts: Record<string, number> = {};
    for (const log of failedLogins || []) {
      if (log.user_id) {
        loginAttempts[log.user_id] = (loginAttempts[log.user_id] || 0) + 1;
      }
    }

    for (const [userId, count] of Object.entries(loginAttempts)) {
      if (count >= 5) {
        alerts.push({
          type: "multiple_failed_logins",
          details: { user_id: userId, attempts: count },
        });
      }
    }

    // 2. Unusual booking patterns (same client booking >5 jobs in 24h)
    const { data: recentBookings } = await supabase
      .from("jobs")
      .select("client_id")
      .gte("created_at", last24h);

    const bookingsByClient: Record<string, number> = {};
    for (const booking of recentBookings || []) {
      if (booking.client_id) {
        bookingsByClient[booking.client_id] = (bookingsByClient[booking.client_id] || 0) + 1;
      }
    }

    for (const [clientId, count] of Object.entries(bookingsByClient)) {
      if (count > 5) {
        alerts.push({
          type: "unusual_booking_volume",
          details: { client_id: clientId, bookings_24h: count },
        });
      }
    }

    // 3. Rapid credit purchases (>$500 in credits in 24h)
    const { data: creditPurchases } = await supabase
      .from("credit_purchases")
      .select("user_id, amount")
      .gte("created_at", last24h);

    const purchasesByUser: Record<string, number> = {};
    for (const purchase of creditPurchases || []) {
      if (purchase.user_id) {
        purchasesByUser[purchase.user_id] = (purchasesByUser[purchase.user_id] || 0) + (purchase.amount || 0);
      }
    }

    for (const [userId, total] of Object.entries(purchasesByUser)) {
      if (total > 500) {
        alerts.push({
          type: "high_credit_purchases",
          details: { user_id: userId, total_credits: total },
        });
      }
    }

    // 4. Multiple cancellations by same cleaner
    const { data: cancellations } = await supabase
      .from("jobs")
      .select("cleaner_id")
      .eq("status", "cancelled")
      .gte("cancelled_at", last24h);

    const cancellationsByCleaner: Record<string, number> = {};
    for (const job of cancellations || []) {
      if (job.cleaner_id) {
        cancellationsByCleaner[job.cleaner_id] = (cancellationsByCleaner[job.cleaner_id] || 0) + 1;
      }
    }

    for (const [cleanerId, count] of Object.entries(cancellationsByCleaner)) {
      if (count >= 3) {
        alerts.push({
          type: "multiple_cleaner_cancellations",
          details: { cleaner_id: cleanerId, cancellations_24h: count },
        });
      }
    }

    console.log(`Detected ${alerts.length} suspicious activities`);

    // Insert fraud alerts
    for (const alert of alerts) {
      // Check if similar alert already exists
      const { data: existing } = await supabase
        .from("fraud_alerts")
        .select("id")
        .eq("alert_type", alert.type)
        .eq("details", alert.details)
        .gte("created_at", last24h)
        .maybeSingle();

      if (!existing) {
        await supabase.from("fraud_alerts").insert({
          alert_type: alert.type,
          severity: alert.type === "multiple_failed_logins" ? "high" : "medium",
          details: alert.details,
          status: "pending",
        });
      }
    }

    return new Response(
      JSON.stringify({ success: true, alertsCreated: alerts.length }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in flag-suspicious-activity:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
