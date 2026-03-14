import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type EmailTemplate = 
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

export function useEmailCampaigns() {
  // Send welcome email to new user
  const sendWelcomeEmail = useMutation({
    mutationFn: async ({ userId, role, name, email }: {
      userId: string;
      role: "client" | "cleaner";
      name?: string;
      email?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke("send-email", {
        body: {
          to: email,
          template: role === "cleaner" ? "welcome_cleaner" : "welcome_client",
          data: {
            name: name || email?.split("@")[0] || "there",
            userId,
            role,
          },
        },
      });

      if (error) throw error;
      return data;
    },
    onError: (error) => {
      console.error("Failed to send welcome email:", error);
    },
  });

  // Trigger booking reminders (for admin/cron use)
  const triggerBookingReminders = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("send-booking-reminders", {
        body: {},
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success(`Sent ${data.results?.clientEmails || 0} client and ${data.results?.cleanerEmails || 0} cleaner reminders`);
    },
    onError: (error) => {
      toast.error("Failed to send booking reminders");
      console.error(error);
    },
  });

  // Trigger review nudges (for admin/cron use)
  const triggerReviewNudges = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("send-review-nudge", {
        body: {},
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success(`Sent ${data.results?.emailsSent || 0} review nudge emails`);
    },
    onError: (error) => {
      toast.error("Failed to send review nudges");
      console.error(error);
    },
  });

  // Trigger re-engagement emails (for admin/cron use)
  const triggerReengagementEmails = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("send-reengagement-emails", {
        body: {},
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success(
        `Sent ${data.results?.emailsSent || 0} re-engagement emails (${data.results?.clientsProcessed || 0} clients, ${data.results?.cleanersProcessed || 0} cleaners)`
      );
    },
    onError: (error) => {
      toast.error("Failed to send re-engagement emails");
      console.error(error);
    },
  });

  // Send a single email using any template
  const sendEmail = useMutation({
    mutationFn: async ({ to, template, subject, data }: {
      to: string | string[];
      template: EmailTemplate;
      subject?: string;
      data?: Record<string, unknown>;
    }) => {
      const { data: result, error } = await supabase.functions.invoke("send-email", {
        body: { to, template, subject, data },
      });

      if (error) throw error;
      return result;
    },
    onError: (error) => {
      console.error("Failed to send email:", error);
    },
  });

  // Send referral success notification
  const sendReferralSuccessEmail = useMutation({
    mutationFn: async ({ referrerEmail, referrerName, refereeName, credits, referralCode }: {
      referrerEmail: string;
      referrerName: string;
      refereeName: string;
      credits: number;
      referralCode: string;
    }) => {
      const { data, error } = await supabase.functions.invoke("send-email", {
        body: {
          to: referrerEmail,
          template: "referral_success",
          data: {
            name: referrerName,
            refereeName,
            credits,
            referralCode,
          },
        },
      });

      if (error) throw error;
      return data;
    },
    onError: (error) => {
      console.error("Failed to send referral success email:", error);
    },
  });

  return {
    sendWelcomeEmail,
    triggerBookingReminders,
    triggerReviewNudges,
    triggerReengagementEmails,
    sendEmail,
    sendReferralSuccessEmail,
  };
}
