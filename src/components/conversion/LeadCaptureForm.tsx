import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Gift, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAnalytics } from "@/hooks/useAnalytics";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";

const leadSchema = z.object({
  email: z.string().trim().email("Please enter a valid email").max(255),
  name: z.string().trim().max(100).optional(),
});

type LeadFormData = z.infer<typeof leadSchema>;

interface LeadCaptureFormProps {
  source: string;
  onSuccess?: () => void;
  showNameField?: boolean;
  buttonText?: string;
  incentiveText?: string;
}

export function LeadCaptureForm({
  source,
  onSuccess,
  showNameField = false,
  buttonText = "Get My Discount",
  incentiveText = "Get 10% off your first booking!",
}: LeadCaptureFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { trackEvent, trackFormSubmit } = useAnalytics();

  const form = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      email: "",
      name: "",
    },
  });

  const onSubmit = async (data: LeadFormData) => {
    setIsSubmitting(true);

    try {
      // Get UTM params from URL
      const urlParams = new URLSearchParams(window.location.search);
      
      const { error } = await supabase.from("leads").insert({
        email: data.email,
        name: data.name || null,
        source,
        page_path: window.location.pathname,
        utm_source: urlParams.get("utm_source"),
        utm_medium: urlParams.get("utm_medium"),
        utm_campaign: urlParams.get("utm_campaign"),
      });

      if (error) throw error;

      trackEvent("lead_captured", { source, has_name: !!data.name });
      trackFormSubmit("lead_capture", true);
      
      setIsSubmitted(true);
      toast.success("You're in! Check your email for your discount code.");
      onSuccess?.();
    } catch (error) {
      console.error("Lead capture error:", error);
      trackFormSubmit("lead_capture", false);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="text-center py-4">
        <CheckCircle2 className="h-12 w-12 text-pt-green mx-auto mb-3" />
        <p className="font-semibold text-foreground">You're all set!</p>
        <p className="text-sm text-muted-foreground">
          Check your email for your exclusive discount code.
        </p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {incentiveText && (
          <div className="flex items-center justify-center gap-2 text-pt-amber mb-4">
            <Gift className="h-5 w-5" />
            <span className="font-medium">{incentiveText}</span>
          </div>
        )}

        {showNameField && (
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder="Your name (optional)"
                    {...field}
                    className="h-12"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  {...field}
                  className="h-12"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full h-12"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing up...
            </>
          ) : (
            buttonText
          )}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          No spam, ever. Unsubscribe anytime.
        </p>
      </form>
    </Form>
  );
}
