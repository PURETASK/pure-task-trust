import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { withCronMonitor } from "../_shared/sentry.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CleanerWithEmail {
  id: string;
  first_name: string | null;
  user_id: string;
  onboarding_current_step: string | null;
  email: string;
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
    const sendgridApiKey = Deno.env.get("SENDGRID_API_KEY");

    if (!sendgridApiKey) {
      console.error("SENDGRID_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find cleaners who:
    // 1. Haven't completed onboarding (onboarding_completed_at IS NULL)
    // 2. Started more than 24 hours ago
    // 3. Haven't received a reminder yet (onboarding_reminder_sent_at IS NULL)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data: abandonedCleaners, error: queryError } = await supabase
      .from("cleaner_profiles")
      .select("id, first_name, user_id, onboarding_current_step")
      .is("onboarding_completed_at", null)
      .is("onboarding_reminder_sent_at", null)
      .lt("created_at", twentyFourHoursAgo);

    if (queryError) {
      console.error("Error querying abandoned cleaners:", queryError);
      throw queryError;
    }

    if (!abandonedCleaners || abandonedCleaners.length === 0) {
      console.log("No abandoned onboarding cleaners found");
      return new Response(
        JSON.stringify({ success: true, message: "No reminders to send", count: 0 }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${abandonedCleaners.length} cleaners with abandoned onboarding`);

    // Get emails from auth.users
    const userIds = abandonedCleaners.map((c) => c.user_id);
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();

    if (usersError) {
      console.error("Error fetching users:", usersError);
      throw usersError;
    }

    const userEmailMap = new Map(
      users.users.filter((u) => userIds.includes(u.id)).map((u) => [u.id, u.email])
    );

    const cleanersWithEmails: CleanerWithEmail[] = abandonedCleaners
      .map((c) => ({
        ...c,
        email: userEmailMap.get(c.user_id) || "",
      }))
      .filter((c) => c.email);

    let sentCount = 0;
    const errors: string[] = [];

    for (const cleaner of cleanersWithEmails) {
      const stepName = getStepDisplayName(cleaner.onboarding_current_step);
      const firstName = cleaner.first_name || "there";

      const emailHtml = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #8b5cf6; margin-bottom: 20px;">Complete Your Profile 🎯</h1>
          <p>Hi ${firstName},</p>
          <p>You're so close to joining PureTask! We noticed you started setting up your cleaner profile but haven't finished yet.</p>
          <div style="background: #f9fafb; border-radius: 12px; padding: 20px; margin: 20px 0;">
            <p style="margin: 0;"><strong>📍 You left off at:</strong> ${stepName}</p>
          </div>
          <p>Complete your profile now to start receiving job offers and earning money!</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://pure-task-trust.lovable.app/cleaner/onboarding" 
               style="display: inline-block; background: linear-gradient(135deg, #8b5cf6, #6366f1); color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600;">
              Continue Setup →
            </a>
          </div>
          <p style="color: #6b7280; font-size: 14px;">The process only takes a few more minutes!</p>
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">- The PureTask Team</p>
        </div>
      `;

      try {
        const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${sendgridApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            personalizations: [{ to: [{ email: cleaner.email }] }],
            from: { email: "noreply@puretask.app", name: "PureTask" },
            subject: "Complete Your PureTask Profile 🧹",
            content: [{ type: "text/html", value: emailHtml }],
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`SendGrid error for ${cleaner.email}:`, errorText);
          errors.push(`Failed to send to ${cleaner.email}: ${response.status}`);
          continue;
        }

        // Mark as reminder sent
        await supabase
          .from("cleaner_profiles")
          .update({ onboarding_reminder_sent_at: new Date().toISOString() })
          .eq("id", cleaner.id);

        sentCount++;
        console.log(`Reminder sent to ${cleaner.email}`);
      } catch (err) {
        console.error(`Error sending to ${cleaner.email}:`, err);
        errors.push(`Error for ${cleaner.email}: ${err}`);
      }
    }

    console.log(`Successfully sent ${sentCount} reminders`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Sent ${sentCount} reminder(s)`,
        count: sentCount,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in send-onboarding-reminder:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve((req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  return withCronMonitor("send-onboarding-reminder", () => handler(req));
});

function getStepDisplayName(step: string | null): string {
  const stepNames: Record<string, string> = {
    terms: "Terms & Agreements",
    "basic-info": "Basic Information",
    "phone-verification": "Phone Verification",
    "face-verification": "Profile Photo",
    "id-verification": "ID Verification",
    "background-consent": "Background Check",
    "service-areas": "Service Areas",
    availability: "Availability",
    rates: "Rates & Pricing",
    review: "Final Review",
  };
  return stepNames[step || "terms"] || "Getting Started";
}
