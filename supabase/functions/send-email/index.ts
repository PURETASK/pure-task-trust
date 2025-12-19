import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string | string[];
  subject: string;
  template: "booking_confirmation" | "job_started" | "job_completed" | "review_request" | "custom";
  data?: {
    clientName?: string;
    cleanerName?: string;
    scheduledDate?: string;
    scheduledTime?: string;
    address?: string;
    credits?: number;
    jobId?: string;
    customHtml?: string;
    customText?: string;
  };
}

const getEmailTemplate = (template: string, data: EmailRequest["data"]) => {
  switch (template) {
    case "booking_confirmation":
      return {
        subject: "Booking Confirmed! 🎉",
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #16a34a; margin-bottom: 20px;">Your Booking is Confirmed!</h1>
            <p>Hi ${data?.clientName || "there"},</p>
            <p>Great news! Your cleaning has been confirmed.</p>
            <div style="background: #f9fafb; border-radius: 12px; padding: 20px; margin: 20px 0;">
              <p style="margin: 8px 0;"><strong>📅 Date:</strong> ${data?.scheduledDate || "TBD"}</p>
              <p style="margin: 8px 0;"><strong>🕐 Time:</strong> ${data?.scheduledTime || "TBD"}</p>
              ${data?.cleanerName ? `<p style="margin: 8px 0;"><strong>👤 Cleaner:</strong> ${data.cleanerName}</p>` : ""}
              ${data?.address ? `<p style="margin: 8px 0;"><strong>📍 Address:</strong> ${data.address}</p>` : ""}
              <p style="margin: 8px 0;"><strong>💰 Credits:</strong> ${data?.credits || 0} held</p>
            </div>
            <p>We'll notify you when your cleaner is on their way.</p>
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">- The PureTask Team</p>
          </div>
        `,
      };
      
    case "job_started":
      return {
        subject: "Your Cleaner Has Started! 🧹",
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #8b5cf6; margin-bottom: 20px;">Cleaning in Progress!</h1>
            <p>Hi ${data?.clientName || "there"},</p>
            <p>${data?.cleanerName || "Your cleaner"} has checked in and started cleaning.</p>
            <p>You'll receive another notification when the job is complete and ready for your review.</p>
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">- The PureTask Team</p>
          </div>
        `,
      };
      
    case "job_completed":
      return {
        subject: "Cleaning Complete! ✨",
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #16a34a; margin-bottom: 20px;">Your Home is Sparkling Clean!</h1>
            <p>Hi ${data?.clientName || "there"},</p>
            <p>${data?.cleanerName || "Your cleaner"} has finished the cleaning job.</p>
            <div style="background: #f0fdf4; border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center;">
              <p style="font-size: 18px; margin: 0;">Please review the job and approve the payment</p>
              <a href="https://puretask.app/job/${data?.jobId}/approve" 
                 style="display: inline-block; background: #16a34a; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 16px; font-weight: 600;">
                Review & Approve
              </a>
            </div>
            <p style="color: #6b7280; font-size: 14px;">You have 24 hours to report any issues before automatic approval.</p>
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">- The PureTask Team</p>
          </div>
        `,
      };
      
    case "review_request":
      return {
        subject: "How Was Your Cleaning? ⭐",
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #f59e0b; margin-bottom: 20px;">Leave a Review</h1>
            <p>Hi ${data?.clientName || "there"},</p>
            <p>How was your cleaning experience with ${data?.cleanerName || "your cleaner"}?</p>
            <p>Your feedback helps cleaners improve and helps other clients find great cleaners.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://puretask.app/job/${data?.jobId}/review" 
                 style="display: inline-block; background: #f59e0b; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
                Leave a Review
              </a>
            </div>
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">- The PureTask Team</p>
          </div>
        `,
      };
      
    case "custom":
      return {
        subject: data?.customText || "Message from PureTask",
        html: data?.customHtml || `<p>${data?.customText || "No content"}</p>`,
      };
      
    default:
      return {
        subject: "Notification from PureTask",
        html: "<p>You have a new notification.</p>",
      };
  }
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

    const emailContent = getEmailTemplate(template, data);
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

  } catch (error: any) {
    console.error("Error in send-email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
