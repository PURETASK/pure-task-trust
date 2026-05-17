import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import { Shield, Gavel, Trash2, ChevronRight, EyeOff, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";

export default function PrivacyControls() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const { data: profile, refetch } = useQuery({
    queryKey: ["privacy-controls-profile", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("created_at, arbitration_opted_out, arbitration_optout_at, closure_initiated_at, account_status")
        .eq("id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
  const [closureReason, setClosureReason] = useState("");
  const [busy, setBusy] = useState(false);

  const signupAt = profile?.created_at ? new Date(profile.created_at) : null;
  const arbitrationWindowEnd = signupAt
    ? new Date(signupAt.getTime() + 30 * 24 * 60 * 60 * 1000)
    : null;
  const arbitrationWindowOpen = arbitrationWindowEnd ? arbitrationWindowEnd > new Date() : false;
  const alreadyOptedOut = !!(profile as any)?.arbitration_opted_out;
  const closureInitiated = !!(profile as any)?.closure_initiated_at;

  const optOutArbitration = async () => {
    setBusy(true);
    const { error } = await supabase.rpc("request_arbitration_optout");
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("You've opted out of binding arbitration.");
    refetch();
  };

  const closeAccount = async () => {
    setBusy(true);
    const { error } = await supabase.rpc("request_account_closure", { _reason: closureReason || null });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Account scheduled for deletion in 30 days. You can sign in within that window to cancel.");
    await logout();
    navigate("/", { replace: true });
  };

  return (
    <main className="flex-1 bg-background min-h-screen">
      <Helmet>
        <title>Privacy Controls | PureTask</title>
        <meta name="description" content="Manage CCPA opt-outs, arbitration opt-out, and account closure." />
      </Helmet>

      <div className="container px-4 sm:px-6 py-5 sm:py-8 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="palette-icon palette-icon-blue h-10 w-10">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-poppins font-bold">Privacy Controls</h1>
              <p className="text-ink-muted text-sm">Your rights, your data, your choice.</p>
            </div>
          </div>
        </motion.div>

        {/* CCPA links */}
        <section className="space-y-2 mb-6">
          <h2 className="text-xs font-bold uppercase tracking-wide text-ink-muted px-1">California Privacy Rights</h2>
          <Link to="/legal/do-not-sell" className="block">
            <div className="palette-card palette-card-blue p-4 flex items-center gap-4 hover:shadow-elevated transition-all">
              <div className="palette-icon palette-icon-blue h-11 w-11"><EyeOff className="h-5 w-5" /></div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm">Do Not Sell or Share My Personal Info</p>
                <p className="text-xs text-ink-muted">CCPA / CPRA opt-out of sale and sharing for ads.</p>
              </div>
              <ChevronRight className="h-4 w-4 text-ink-muted flex-shrink-0" />
            </div>
          </Link>
          <Link to="/legal/limit-use-spi" className="block">
            <div className="palette-card palette-card-blue p-4 flex items-center gap-4 hover:shadow-elevated transition-all">
              <div className="palette-icon palette-icon-blue h-11 w-11"><Shield className="h-5 w-5" /></div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm">Limit Use of Sensitive Personal Information</p>
                <p className="text-xs text-ink-muted">Restrict how we process sensitive data about you.</p>
              </div>
              <ChevronRight className="h-4 w-4 text-ink-muted flex-shrink-0" />
            </div>
          </Link>
          <Link to="/legal/privacy-requests" className="block">
            <div className="palette-card palette-card-blue p-4 flex items-center gap-4 hover:shadow-elevated transition-all">
              <div className="palette-icon palette-icon-blue h-11 w-11"><FileText className="h-5 w-5" /></div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm">Submit a Privacy Request</p>
                <p className="text-xs text-ink-muted">Access, correct, or delete your personal data.</p>
              </div>
              <ChevronRight className="h-4 w-4 text-ink-muted flex-shrink-0" />
            </div>
          </Link>
        </section>

        {/* Arbitration opt-out */}
        <section className="space-y-2 mb-6">
          <h2 className="text-xs font-bold uppercase tracking-wide text-ink-muted px-1">Arbitration Opt-Out</h2>
          <div className="palette-card palette-card-amber p-5">
            <div className="flex items-start gap-3 mb-3">
              <div className="palette-icon palette-icon-amber h-11 w-11 flex-shrink-0"><Gavel className="h-5 w-5" /></div>
              <div className="flex-1">
                <p className="font-bold text-sm">Opt out of binding arbitration</p>
                <p className="text-xs text-ink-muted mt-1 leading-relaxed">
                  By default, disputes are resolved through binding individual arbitration (see our{" "}
                  <Link to="/legal/terms" className="text-aero-trust underline">Terms of Service</Link>).
                  You may opt out within <strong>30 days of signup</strong> and instead pursue claims in court.
                </p>
                {arbitrationWindowEnd && (
                  <p className="text-xs text-ink-muted mt-2">
                    {alreadyOptedOut
                      ? <span className="text-aero-trust font-semibold">✓ You've opted out of arbitration.</span>
                      : arbitrationWindowOpen
                        ? <>Window closes: <strong>{arbitrationWindowEnd.toLocaleDateString()}</strong></>
                        : <span className="text-destructive">The 30-day window has expired.</span>}
                  </p>
                )}
              </div>
            </div>
            <Button
              disabled={busy || alreadyOptedOut || !arbitrationWindowOpen}
              onClick={optOutArbitration}
              className="rounded-xl"
              variant="outline"
            >
              {alreadyOptedOut ? "Opted out" : "Opt out of arbitration"}
            </Button>
          </div>
        </section>

        {/* Account closure */}
        <section className="space-y-2 mb-6">
          <h2 className="text-xs font-bold uppercase tracking-wide text-ink-muted px-1">Close Account</h2>
          <div className="palette-card palette-card-blue p-5">
            <div className="flex items-start gap-3 mb-3">
              <div className="h-11 w-11 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center flex-shrink-0">
                <Trash2 className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm">Permanently close your account</p>
                <p className="text-xs text-ink-muted mt-1 leading-relaxed">
                  Your account will be deactivated immediately. After <strong>30 days</strong> all personal data
                  not required by law (tax, fraud, audit records) will be permanently deleted. Sign in within
                  30 days to cancel the closure.
                </p>
                {closureInitiated && (
                  <p className="text-xs text-destructive mt-2 font-semibold">
                    Closure already initiated.
                  </p>
                )}
              </div>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button disabled={busy || closureInitiated} variant="destructive" className="rounded-xl">
                  Close my account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Close your PureTask account?</AlertDialogTitle>
                  <AlertDialogDescription>
                    You'll be signed out and your account scheduled for permanent deletion in 30 days.
                    Open bookings, escrowed credits, and payouts must be resolved before final deletion.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <Textarea
                  placeholder="(Optional) Tell us why you're leaving"
                  value={closureReason}
                  onChange={(e) => setClosureReason(e.target.value)}
                  className="rounded-xl"
                />
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={closeAccount} className="bg-destructive hover:bg-destructive/90">
                    Confirm closure
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </section>
      </div>
    </main>
  );
}