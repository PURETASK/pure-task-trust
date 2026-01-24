import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type EmailTemplate = 
  | "booking_confirmation" 
  | "job_started" 
  | "job_completed" 
  | "review_request" 
  | "custom"
  | "welcome_client"
  | "welcome_cleaner"
  | "booking_reminder"
  | "cleaner_job_reminder"
  | "review_nudge"
  | "inactive_client"
  | "inactive_cleaner"
  | "referral_success";

interface EmailRequest {
  to: string | string[];
  subject?: string;
  template: EmailTemplate;
  data?: Record<string, unknown>;
}

const APP_URL = "https://puretask.app";

const getEmailTemplate = (template: EmailTemplate, data: Record<string, unknown> = {}) => {
  const templates: Record<EmailTemplate, { subject: string; html: string }> = {
    booking_confirmation: {
      subject: "Booking Confirmed! 🎉",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #16a34a; margin-bottom: 20px;">Your Booking is Confirmed!</h1>
          <p>Hi ${data.clientName || "there"},</p>
          <p>Great news! Your cleaning has been confirmed.</p>
          <div style="background: #f9fafb; border-radius: 12px; padding: 20px; margin: 20px 0;">
            <p style="margin: 8px 0;"><strong>📅 Date:</strong> ${data.scheduledDate || "TBD"}</p>
            <p style="margin: 8px 0;"><strong>🕐 Time:</strong> ${data.scheduledTime || "TBD"}</p>
            ${data.cleanerName ? `<p style="margin: 8px 0;"><strong>👤 Cleaner:</strong> ${data.cleanerName}</p>` : ""}
            ${data.address ? `<p style="margin: 8px 0;"><strong>📍 Address:</strong> ${data.address}</p>` : ""}
            <p style="margin: 8px 0;"><strong>💰 Credits:</strong> ${data.credits || 0} held</p>
          </div>
          <p>We'll notify you when your cleaner is on their way.</p>
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">- The PureTask Team</p>
        </div>
      `,
    },
    job_started: {
      subject: "Your Cleaner Has Started! 🧹",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #8b5cf6; margin-bottom: 20px;">Cleaning in Progress!</h1>
          <p>Hi ${data.clientName || "there"},</p>
          <p>${data.cleanerName || "Your cleaner"} has checked in and started cleaning.</p>
          <p>You'll receive another notification when the job is complete and ready for your review.</p>
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">- The PureTask Team</p>
        </div>
      `,
    },
    job_completed: {
      subject: "Cleaning Complete! ✨",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #16a34a; margin-bottom: 20px;">Your Home is Sparkling Clean!</h1>
          <p>Hi ${data.clientName || "there"},</p>
          <p>${data.cleanerName || "Your cleaner"} has finished the cleaning job.</p>
          <div style="background: #f0fdf4; border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center;">
            <p style="font-size: 18px; margin: 0;">Please review the job and approve the payment</p>
            <a href="${APP_URL}/job/${data.jobId}/approve" 
               style="display: inline-block; background: #16a34a; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 16px; font-weight: 600;">
              Review & Approve
            </a>
          </div>
          <p style="color: #6b7280; font-size: 14px;">You have 24 hours to report any issues before automatic approval.</p>
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">- The PureTask Team</p>
        </div>
      `,
    },
    review_request: {
      subject: "How Was Your Cleaning? ⭐",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #f59e0b; margin-bottom: 20px;">Leave a Review</h1>
          <p>Hi ${data.clientName || "there"},</p>
          <p>How was your cleaning experience with ${data.cleanerName || "your cleaner"}?</p>
          <p>Your feedback helps cleaners improve and helps other clients find great cleaners.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${APP_URL}/job/${data.jobId}/review" 
               style="display: inline-block; background: #f59e0b; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
              Leave a Review
            </a>
          </div>
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">- The PureTask Team</p>
        </div>
      `,
    },
    welcome_client: {
      subject: "Welcome to PureTask! 🏠",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #10b981; margin-bottom: 20px;">Welcome to PureTask!</h1>
          <p>Hi ${data.name || "there"},</p>
          <p>You're now part of a community that trusts verified, background-checked cleaners.</p>
          <div style="background: #f9fafb; border-radius: 12px; padding: 20px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #374151;">Here's what makes PureTask different:</h3>
            <p style="margin: 8px 0;">✅ <strong>GPS-verified check-ins</strong> - Know exactly when your cleaner arrives</p>
            <p style="margin: 8px 0;">✅ <strong>Photo documentation</strong> - Before & after proof of work</p>
            <p style="margin: 8px 0;">✅ <strong>Escrow payment protection</strong> - Pay only when you're satisfied</p>
            <p style="margin: 8px 0;">✅ <strong>Background-checked cleaners</strong> - Your safety is our priority</p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${APP_URL}/book" 
               style="display: inline-block; background: #10b981; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
              Book Your First Cleaning →
            </a>
          </div>
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">- The PureTask Team</p>
        </div>
      `,
    },
    welcome_cleaner: {
      subject: "Welcome to PureTask! Start Earning 💰",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #10b981; margin-bottom: 20px;">Welcome to the PureTask Team!</h1>
          <p>Hi ${data.name || "there"},</p>
          <p>You're on your way to earning with the most trusted cleaning platform.</p>
          <div style="background: #f9fafb; border-radius: 12px; padding: 20px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #374151;">What's Next?</h3>
            <p style="margin: 8px 0;">1️⃣ <strong>Complete your profile</strong> - Add your photo and bio</p>
            <p style="margin: 8px 0;">2️⃣ <strong>Verify your identity</strong> - Quick background check</p>
            <p style="margin: 8px 0;">3️⃣ <strong>Set your availability</strong> - Choose when you work</p>
            <p style="margin: 8px 0;">4️⃣ <strong>Start earning!</strong> - Accept jobs in your area</p>
          </div>
          <div style="background: #ecfdf5; border-radius: 12px; padding: 16px; margin: 20px 0; border-left: 4px solid #10b981;">
            <p style="margin: 0;"><strong>💡 Pro Tip:</strong> Cleaners who complete their profile within 24 hours get 3x more job offers!</p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${APP_URL}/cleaner/onboarding" 
               style="display: inline-block; background: #10b981; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
              Complete Your Profile →
            </a>
          </div>
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">- The PureTask Team</p>
        </div>
      `,
    },
    booking_reminder: {
      subject: `Reminder: Cleaning Tomorrow at ${data.time || "scheduled time"} 🧹`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #10b981; margin-bottom: 20px;">Your Cleaning is Tomorrow!</h1>
          <p>Hi ${data.clientName || "there"},</p>
          <p>Just a friendly reminder - your cleaning is scheduled for tomorrow!</p>
          <div style="background: #f9fafb; border-radius: 12px; padding: 20px; margin: 20px 0;">
            <p style="margin: 8px 0;"><strong>📅 Date:</strong> ${data.date || "Tomorrow"}</p>
            <p style="margin: 8px 0;"><strong>🕐 Time:</strong> ${data.time || "TBD"}</p>
            <p style="margin: 8px 0;"><strong>👤 Cleaner:</strong> ${data.cleanerName || "Your cleaner"}</p>
            <p style="margin: 8px 0;"><strong>📍 Address:</strong> ${data.address || "Your address"}</p>
          </div>
          <div style="background: #fef3c7; border-radius: 12px; padding: 16px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <h4 style="margin-top: 0; color: #92400e;">Prep Tips:</h4>
            <p style="margin-bottom: 0;">• Clear surfaces for easier cleaning<br>• Secure pets if needed<br>• Leave any special instructions in the app</p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${APP_URL}/booking/${data.jobId}" 
               style="display: inline-block; background: #10b981; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
              View Booking Details
            </a>
          </div>
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">- The PureTask Team</p>
        </div>
      `,
    },
    cleaner_job_reminder: {
      subject: `Job Reminder: Tomorrow at ${data.time || "scheduled time"} 📍`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #10b981; margin-bottom: 20px;">You Have a Job Tomorrow!</h1>
          <p>Hi ${data.cleanerName || "there"},</p>
          <p>Just a reminder about your upcoming cleaning job.</p>
          <div style="background: #f9fafb; border-radius: 12px; padding: 20px; margin: 20px 0;">
            <p style="margin: 8px 0;"><strong>📅 Date:</strong> ${data.date || "Tomorrow"}</p>
            <p style="margin: 8px 0;"><strong>🕐 Time:</strong> ${data.time || "TBD"}</p>
            <p style="margin: 8px 0;"><strong>👤 Client:</strong> ${data.clientName || "Your client"}</p>
            <p style="margin: 8px 0;"><strong>📍 Address:</strong> ${data.address || "TBD"}</p>
            <p style="margin: 8px 0;"><strong>💰 Earnings:</strong> ${data.credits || 0} credits</p>
          </div>
          <div style="background: #ecfdf5; border-radius: 12px; padding: 16px; margin: 20px 0; border-left: 4px solid #10b981;">
            <h4 style="margin-top: 0; color: #065f46;">Reminders:</h4>
            <p style="margin-bottom: 0;">• Arrive 5 minutes early<br>• Check in via GPS when you arrive<br>• Take before photos when you start<br>• Take after photos when complete</p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${APP_URL}/cleaner/jobs/${data.jobId}" 
               style="display: inline-block; background: #10b981; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
              View Job Details
            </a>
          </div>
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">- The PureTask Team</p>
        </div>
      `,
    },
    review_nudge: {
      subject: "We'd love your feedback! ⭐",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #f59e0b; margin-bottom: 20px;">How Was Your Cleaning?</h1>
          <p>Hi ${data.clientName || "there"},</p>
          <p>We noticed you haven't left a review for your recent cleaning with <strong>${data.cleanerName || "your cleaner"}</strong>.</p>
          <p>Your feedback only takes 30 seconds and helps:</p>
          <ul style="color: #374151;">
            <li>Cleaners improve their service</li>
            <li>Other clients find great cleaners</li>
            <li>Us maintain quality standards</li>
          </ul>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${APP_URL}/review/${data.jobId}" 
               style="display: inline-block; background: #10b981; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
              Leave a Quick Review →
            </a>
          </div>
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">- The PureTask Team</p>
        </div>
      `,
    },
    inactive_client: {
      subject: "We miss you! Here's 50 bonus credits 💚",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #10b981; margin-bottom: 20px;">We Miss You!</h1>
          <p>Hi ${data.name || "there"},</p>
          <p>It's been a while since your last cleaning with PureTask.</p>
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 12px; margin: 20px 0; text-align: center; color: white;">
            <h2 style="margin: 0 0 10px 0; font-size: 28px;">🎁 50 Bonus Credits</h2>
            <p style="margin: 0; opacity: 0.9;">Book this week and claim your reward!</p>
          </div>
          <p>Your home deserves a refresh. Use your bonus credits on your next booking.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${APP_URL}/book" 
               style="display: inline-block; background: #10b981; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
              Book Now & Claim Credits →
            </a>
          </div>
          <p style="color: #6b7280; font-size: 14px;">Offer expires in 7 days.</p>
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">- The PureTask Team</p>
        </div>
      `,
    },
    inactive_cleaner: {
      subject: "New jobs waiting for you! 🧹",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #10b981; margin-bottom: 20px;">Jobs Are Waiting!</h1>
          <p>Hi ${data.name || "there"},</p>
          <p>We've noticed you haven't been active lately. There are new jobs in your area!</p>
          <div style="background: #f9fafb; border-radius: 12px; padding: 20px; margin: 20px 0;">
            <p style="margin: 8px 0;"><strong>📍 ${data.jobCount || "Several"} jobs</strong> available in your service area</p>
            <p style="margin: 8px 0;"><strong>💰 Average earnings:</strong> ${data.avgEarnings || "$80-150"} per job</p>
          </div>
          <p>Log back in to browse available jobs and start earning again!</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${APP_URL}/cleaner/marketplace" 
               style="display: inline-block; background: #10b981; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
              View Available Jobs →
            </a>
          </div>
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">- The PureTask Team</p>
        </div>
      `,
    },
    referral_success: {
      subject: `You earned ${data.credits || "bonus"} credits! 🎉`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #10b981; margin-bottom: 20px;">Congratulations! 🎉</h1>
          <p>Hi ${data.name || "there"},</p>
          <p>Great news! Your referral <strong>${data.refereeName || "a friend"}</strong> just completed their first job!</p>
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 12px; margin: 20px 0; text-align: center; color: white;">
            <h2 style="margin: 0 0 10px 0; font-size: 32px;">+${data.credits || 500} Credits</h2>
            <p style="margin: 0; opacity: 0.9;">Added to your account!</p>
          </div>
          <p>Keep sharing your referral code to earn more credits!</p>
          <div style="background: #f9fafb; border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center;">
            <p style="margin: 0 0 10px 0; color: #6b7280;">Your Referral Code:</p>
            <p style="margin: 0; font-size: 24px; font-weight: bold; letter-spacing: 2px;">${data.referralCode || "YOURCODE"}</p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${APP_URL}/referral" 
               style="display: inline-block; background: #10b981; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
              Invite More Friends →
            </a>
          </div>
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">- The PureTask Team</p>
        </div>
      `,
    },
    custom: {
      subject: (data.subject as string) || "Message from PureTask",
      html: (data.customHtml as string) || `<p>${data.customText || data.message || "No content"}</p>`,
    },
  };

  return templates[template] || templates.custom;
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const sendgridApiKey = Deno.env.get("SENDGRID_API_KEY");
    
    if (!sendgridApiKey) {
      console.error("SENDGRID_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { to, subject, template, data }: EmailRequest = await req.json();

    if (!to) {
      return new Response(
        JSON.stringify({ error: "to field is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const emailContent = getEmailTemplate(template || "custom", data || {});
    const recipients = Array.isArray(to) ? to : [to];

    console.log(`Sending ${template} email to ${recipients.length} recipients`);

    // Send via SendGrid API
    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${sendgridApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [{ to: recipients.map(email => ({ email })) }],
        from: { email: "noreply@puretask.app", name: "PureTask" },
        subject: subject || emailContent.subject,
        content: [{ type: "text/html", value: emailContent.html }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("SendGrid error:", errorText);
      throw new Error(`SendGrid API error: ${response.status}`);
    }

    console.log("Email sent successfully");

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Email sent to ${recipients.length} recipient(s)` 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in send-email:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
