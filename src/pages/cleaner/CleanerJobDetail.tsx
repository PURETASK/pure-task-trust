import { useState, useEffect } from "react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { CleanerLayout } from "@/components/cleaner/CleanerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useJob } from "@/hooks/useJob";
import { useJobAuthorization } from "@/hooks/useJobAuthorization";
import { useJobMoney } from "@/hooks/useJobMoney";
import { useJobParticipants } from "@/hooks/useJobParticipants";
import { useStatusPresentation } from "@/hooks/useStatusPresentation";
import { useJobPhotos, useUploadJobPhoto } from "@/hooks/useJobPhotos";
import { useJobCheckins } from "@/hooks/useJobCheckins";
import { useCleanerProfile } from "@/hooks/useCleanerProfile";
import { useJobOfferActions } from "@/hooks/useJobOfferActions";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { PhotoRequirements, useJobPhotoValidation } from "@/components/job/PhotoRequirements";
import { ClientBriefCard } from "@/components/cleaner/ClientBriefCard";
import { JobSupportChat } from "@/components/cleaner/JobSupportChat";
import { ClientRatingForm } from "@/components/cleaner/ClientRatingForm";
import { supabase } from "@/integrations/supabase/client";
import { format, differenceInMinutes } from "date-fns";
import { useParams, useNavigate } from "react-router-dom";
import { 
  MapPin, Clock, Calendar, Camera, CheckCircle, Play, ArrowLeft,
  User, Image, Loader2, Upload, AlertTriangle, Timer, MessageCircle,
  Star, DollarSign, Navigation, HelpCircle, Check, XCircle, Zap,
  Sparkles, Briefcase, Lock, FileText, Home
} from "lucide-react";
import { Pill, SectionLabel } from "@/components/wf";
import { motion } from "framer-motion";

const TYPE_EMOJI: Record<string, string> = {
  standard: "🧹", basic: "🧹", deep: "✨", move_out: "📦", airbnb: "🏠", office: "🏢",
};

const DIRTINESS_LABELS: Record<string, { label: string; emoji: string; tone: string }> = {
  touch_up:   { label: 'Touch-up',   emoji: '✨', tone: 'success' },
  average:    { label: 'Average',    emoji: '🧽', tone: 'info' },
  heavy:      { label: 'Heavy',      emoji: '🧹', tone: 'warning' },
  very_dirty: { label: 'Very dirty', emoji: '🪣', tone: 'destructive' },
};

export default function CleanerJobDetail() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: job, isLoading } = useJob(jobId || "");
  const { data: photos = [] } = useJobPhotos(jobId || "");
  const { profile } = useCleanerProfile();
  const uploadPhoto = useUploadJobPhoto(jobId || "");
  const { checkIn, checkOut, hasCheckedIn, hasCheckedOut } = useJobCheckins(jobId);
  const { acceptOffer, declineOffer } = useJobOfferActions();
  const [selectedPhotoType, setSelectedPhotoType] = useState<"before" | "after">("before");
  const fileInputRef = useState<HTMLInputElement | null>(null);
  const [fileEl, setFileEl] = useState<HTMLInputElement | null>(null);
  const [elapsedMin, setElapsedMin] = useState(0);
  const [supportOpen, setSupportOpen] = useState(false);
  const [ratingOpen, setRatingOpen] = useState(false);
  const [declineOpen, setDeclineOpen] = useState(false);
  const [declineReason, setDeclineReason] = useState("");

  // Has this cleaner already rated this client for this job?
  const { data: existingClientRating } = useQuery({
    queryKey: ["client-rating", jobId, profile?.id],
    enabled: !!jobId && !!profile?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("client_ratings" as any)
        .select("id")
        .eq("job_id", jobId!)
        .eq("cleaner_id", profile!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
  const hasRatedClient = !!existingClientRating;

  const { beforeCount, afterCount, canCheckout, missingBefore, missingAfter } = useJobPhotoValidation(photos);

  // Display primitives — safe with undefined job
  const participants = useJobParticipants(job ?? null);
  const status = useStatusPresentation(job?.status);
  const money = useJobMoney({
    escrow_credits_reserved: job?.escrow_credits_reserved,
    estimated_hours: job?.estimated_hours,
    actual_hours: job?.actual_hours,
    final_charge_credits: job?.final_charge_credits,
    rush_fee_credits: (job as any)?.rush_fee_credits,
    cleaner_tier: (job?.cleaner as any)?.tier,
  });

  // IMPORTANT: this hook must run on every render — keep it ABOVE any early
  // returns so the hook count stays stable when `job` transitions from
  // undefined → loaded. (Previously placed below the !job guard, which
  // caused "Rendered more hooks than during the previous render" and crashed
  // the page when a cleaner clicked "View" on a job.)
  const auth = useJobAuthorization({
    id: job?.id ?? '',
    status: job?.status ?? null,
    client_user_id: job?.client?.user_id ?? null,
    cleaner_user_id: job?.cleaner?.user_id ?? null,
    scheduled_start_at: job?.scheduled_start_at ?? null,
    check_in_at: job?.check_in_at ?? null,
    check_out_at: job?.check_out_at ?? null,
    actual_end_at: job?.actual_end_at ?? null,
    final_charge_credits: job?.final_charge_credits ?? null,
  });

  // Live elapsed timer
  useEffect(() => {
    if (!job?.check_in_at || job.status !== 'in_progress') return;
    const interval = setInterval(() => {
      setElapsedMin(differenceInMinutes(new Date(), new Date(job.check_in_at!)));
    }, 60000);
    setElapsedMin(differenceInMinutes(new Date(), new Date(job.check_in_at)));
    return () => clearInterval(interval);
  }, [job?.check_in_at, job?.status]);

  // Realtime job status subscription
  useEffect(() => {
    if (!jobId) return;
    const channel = supabase
      .channel(`cleaner-job:${jobId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'jobs', filter: `id=eq.${jobId}` }, () => {
        queryClient.invalidateQueries({ queryKey: ['job', jobId] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [jobId, queryClient]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await uploadPhoto.mutateAsync({ file, type: selectedPhotoType });
      toast({ title: `${selectedPhotoType === "before" ? "Before" : "After"} photo uploaded!` });
    } catch (error: any) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    }
  };

  const handleCheckin = async () => {
    if (!profile?.id || !job) return;
    try {
      await checkIn.mutateAsync({ 
        jobId: jobId!,
        jobLat: job.checkin_lat || 0,
        jobLng: job.checkin_lng || 0,
      });
      toast({ title: "Checked in successfully! Job is now in progress." });
    } catch (error: any) {
      toast({ title: "Check-in failed", description: error.message, variant: "destructive" });
    }
  };

  const handleCheckout = async () => {
    if (!profile?.id || !job) return;
    if (!canCheckout) {
      toast({
        title: "Photos Required",
        description: `Upload at least 1 before and 1 after photo to complete the job`,
        variant: "destructive",
      });
      return;
    }
    try {
      await checkOut.mutateAsync({ 
        jobId: jobId!,
        jobLat: job.checkin_lat || 0,
        jobLng: job.checkin_lng || 0,
      });
      toast({ title: "Job completed! Great work.", description: "The client will review and approve your payment." });
      navigate("/cleaner/jobs");
    } catch (error: any) {
      toast({ title: "Checkout failed", description: error.message, variant: "destructive" });
    }
  };

  const photoProgress = Math.min(100, ((beforeCount + afterCount) / 2) * 100);
  const jobStep = job?.status === 'confirmed' ? 1 : job?.status === 'in_progress' ? 2 : job?.status === 'completed' ? 3 : 0;

  if (isLoading) {
    return (
      <CleanerLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      </CleanerLayout>
    );
  }

  if (!job) {
    return (
      <CleanerLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Job not found</p>
          <Button variant="link" onClick={() => navigate("/cleaner/jobs")}>Back to Jobs</Button>
        </div>
      </CleanerLayout>
    );
  }

  const isInProgress = job.status === "in_progress";
  const isCompleted = job.status === "completed";
  const isPending = job.status === "pending" || job.status === "created";
  const isCancelled = job.status === "cancelled";
  // canStart guards "Check In" (confirmed + cleaner-owned); UX still requires !hasCheckedIn
  const canCheckin = auth.canStart && !hasCheckedIn;
  // canComplete guards "Check Out" (in_progress + has check_in); UX still requires !hasCheckedOut
  const canCheckoutNow = auth.canComplete && !hasCheckedOut;

  // Client data for brief card
  const jobWithAddress = job as any;
  const clientPrefs = jobWithAddress.client?.preferences_json ?? null;
  const emoji = TYPE_EMOJI[job.cleaning_type as string] || "🧹";
  const cleaningTypeLabel = (job.cleaning_type || "standard").replace(/_/g, " ");
  const scheduledDate = job.scheduled_start_at ? new Date(job.scheduled_start_at) : null;
  const isRush = !!(job as any).is_rush;
  const paymentMode = (job as any).payment_mode;
  const addrFull = (job as any).address_line1
    ? [(job as any).address_line1, (job as any).address_city, (job as any).address_state, (job as any).address_postal_code].filter(Boolean).join(", ")
    : (job as any).address || null;
  const addrCityState = [(job as any).address_city, (job as any).address_state].filter(Boolean).join(", ");

  return (
    <CleanerLayout>
      <div className="space-y-5 max-w-2xl relative">
        {/* ── HERO HEADER ────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl border border-hairline-soft shadow-wf"
          style={{
            background: isPending
              ? "linear-gradient(135deg, hsl(38,95%,18%) 0%, hsl(38,95%,28%) 50%, hsl(210,100%,28%) 100%)"
              : isCompleted
              ? "linear-gradient(135deg, hsl(150,60%,18%) 0%, hsl(160,60%,25%) 50%, hsl(210,100%,28%) 100%)"
              : "linear-gradient(135deg, hsl(210,100%,18%) 0%, hsl(210,100%,28%) 50%, hsl(195,80%,32%) 100%)",
          }}
        >
          <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full blur-3xl opacity-25"
            style={{ background: "hsl(195,90%,60%)" }} />
          <div className="absolute bottom-0 left-12 w-36 h-36 rounded-full blur-3xl opacity-20"
            style={{ background: "hsl(180,80%,60%)" }} />

          <div className="relative p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-3">
              <Button
                variant="ghost" size="icon"
                className="h-9 w-9 text-white/80 hover:text-white hover:bg-white/10 rounded-xl"
                onClick={() => navigate("/cleaner/jobs")}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <span className="text-white/60 text-[10px] font-bold tracking-[0.12em] uppercase">Job · {String(job.id).slice(0, 8)}</span>
              <span className="ml-auto inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/15 border border-white/20 text-white backdrop-blur-sm">
                {status.label}
              </span>
            </div>

            <div className="flex items-start gap-4">
              <div className="h-16 w-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-4xl backdrop-blur-sm shrink-0">
                {emoji}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl font-poppins font-bold text-white capitalize leading-tight">
                  {cleaningTypeLabel} Clean
                </h1>
                <p className="text-white/70 text-sm mt-1 flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" />
                  {participants.client.fullName}
                </p>

                <div className="flex flex-wrap gap-1.5 mt-3">
                  {isRush && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold bg-warning/20 border border-warning/40 text-warning">
                      <Zap className="h-2.5 w-2.5" /> Rush
                    </span>
                  )}
                  {paymentMode === "direct" && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold bg-white/15 border border-white/20 text-white">
                      <DollarSign className="h-2.5 w-2.5" /> Direct pay
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold bg-success/20 border border-success/40 text-success">
                    <DollarSign className="h-2.5 w-2.5" /> {money.cleanerNet} cr est.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── PENDING OFFER: Accept / Decline ─────────────────────────────── */}
        {isPending && (
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border-2 border-warning/60 bg-warning/[0.06] shadow-wf p-5"
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-warning/20 border border-warning/40 flex items-center justify-center shrink-0">
                <Sparkles className="h-5 w-5 text-warning" />
              </div>
              <div>
                <h3 className="font-bold text-base">Respond to this job offer</h3>
                <p className="text-xs text-ink-muted mt-0.5">
                  Client credits are on hold. Decide quickly to keep your acceptance rate high.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="lg"
                className="rounded-xl border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive gap-1.5"
                onClick={() => setDeclineOpen(true)}
                disabled={acceptOffer.isPending || declineOffer.isPending}
              >
                <XCircle className="h-4 w-4" /> Decline
              </Button>
              <Button
                size="lg"
                className="rounded-xl bg-success hover:bg-success/90 text-white gap-1.5"
                onClick={() => acceptOffer.mutate(job.id, {
                  onSuccess: () => {
                    queryClient.invalidateQueries({ queryKey: ["job", job.id] });
                    navigate(`/cleaner/jobs/${job.id}`, { replace: true });
                  },
                })}
                disabled={acceptOffer.isPending || declineOffer.isPending}
              >
                {acceptOffer.isPending
                  ? <><Loader2 className="h-4 w-4 animate-spin" /> Accepting…</>
                  : <><Check className="h-4 w-4" /> Accept job</>}
              </Button>
            </div>
          </motion.div>
        )}

        {/* ── CANCELLED notice ────────────────────────────────────────────── */}
        {isCancelled && (
          <div className="rounded-3xl border border-destructive/30 bg-destructive/[0.06] shadow-wf p-5 flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-destructive/15 border border-destructive/30 flex items-center justify-center shrink-0">
              <XCircle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <h3 className="font-bold text-sm">This job was cancelled</h3>
              <p className="text-xs text-ink-muted mt-0.5">
                The client's credits have been released back to their wallet.
              </p>
            </div>
          </div>
        )}

        {/* Client Brief Card — shows for confirmed/in_progress */}
        {(job.status === 'confirmed' || job.status === 'in_progress') && (
          <ClientBriefCard
            notes={jobWithAddress.notes || jobWithAddress.address_notes}
            clientFirstName={participants.client.firstName}
            cleaningType={job.cleaning_type}
            preferences={clientPrefs}
          />
        )}

        {/* Progress Steps — only for confirmed+ */}
        {!isPending && !isCancelled && (
        <Card className="rounded-3xl border border-hairline-soft bg-app-surface shadow-wf">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              {['Check In', 'In Progress', 'Complete'].map((step, i) => (
                <div key={step} className="flex items-center gap-2 flex-1">
                  <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${
                    jobStep > i ? 'bg-primary text-primary-foreground' :
                    jobStep === i + 1 ? 'bg-primary/20 text-primary border-2 border-primary' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {jobStep > i ? '✓' : i + 1}
                  </div>
                  <span className={`text-xs font-medium ${jobStep > i ? 'text-primary' : jobStep === i + 1 ? 'text-primary' : 'text-muted-foreground'}`}>
                    {step}
                  </span>
                  {i < 2 && <div className={`flex-1 h-0.5 ${jobStep > i ? 'bg-primary' : 'bg-border'}`} />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        )}

        {/* Job Details — accent bubbles */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <Briefcase className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-ink-muted">Job Details</h2>
          </div>

          {/* Address bubble — full width, prominent */}
          <div className={`relative overflow-hidden rounded-3xl p-5 border-2 shadow-wf ${
            isPending
              ? "bg-muted/40 border-dashed border-hairline"
              : "bg-gradient-to-br from-primary/15 via-primary/5 to-transparent border-primary/30"
          }`}>
            <div className="flex items-start gap-3">
              <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 ${
                isPending ? "bg-muted" : "bg-primary/20"
              }`}>
                {isPending
                  ? <Lock className="h-6 w-6 text-ink-muted" />
                  : <MapPin className="h-6 w-6 text-primary" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] uppercase tracking-[0.14em] font-bold text-ink-muted mb-1">
                  Service Address
                </p>
                {isPending ? (
                  <>
                    <p className="font-bold text-xl leading-tight">{addrCityState || "Area hidden"}</p>
                    <p className="text-xs text-ink-muted mt-1">🔒 Full address unlocks when you accept</p>
                  </>
                ) : addrFull ? (
                  <>
                    <p className="font-bold text-xl leading-snug break-words">{addrFull}</p>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(addrFull)}`}
                      target="_blank" rel="noreferrer"
                      className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors"
                    >
                      <Navigation className="h-3.5 w-3.5" /> Get directions
                    </a>
                  </>
                ) : (
                  <p className="font-medium text-base text-ink-muted">Address not available</p>
                )}
              </div>
            </div>
          </div>

          {/* Stat bubbles */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-3xl p-4 bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/25 shadow-wf flex flex-col items-center text-center">
              <span className="inline-block px-2.5 py-1 rounded-full border border-primary/30 bg-background/60 text-[10px] uppercase tracking-[0.14em] font-bold text-ink-muted mb-3">Date</span>
              <div className="h-10 w-10 rounded-2xl bg-primary/20 flex items-center justify-center mb-2.5">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <p className="font-bold text-xl leading-tight">
                {scheduledDate ? format(scheduledDate, "MMM d") : "TBD"}
              </p>
              <p className="text-xs text-ink-muted mt-0.5">
                {scheduledDate ? format(scheduledDate, "EEEE") : "—"}
              </p>
            </div>

            <div className="rounded-3xl p-4 bg-gradient-to-br from-info/15 to-info/5 border border-info/25 shadow-wf flex flex-col items-center text-center">
              <span className="inline-block px-2.5 py-1 rounded-full border border-info/30 bg-background/60 text-[10px] uppercase tracking-[0.14em] font-bold text-ink-muted mb-3">Start Time</span>
              <div className="h-10 w-10 rounded-2xl bg-info/20 flex items-center justify-center mb-2.5">
                <Clock className="h-5 w-5 text-info" />
              </div>
              <p className="font-bold text-xl leading-tight">
                {scheduledDate ? format(scheduledDate, "h:mm a") : "TBD"}
              </p>
              <p className="text-xs text-ink-muted mt-0.5">
                {scheduledDate ? format(scheduledDate, "zzz") : "—"}
              </p>
            </div>

            <div className="rounded-3xl p-4 bg-gradient-to-br from-aqua/20 to-aqua/5 border border-aqua/30 shadow-wf flex flex-col items-center text-center">
              <span className="inline-block px-2.5 py-1 rounded-full border border-aqua/40 bg-background/60 text-[10px] uppercase tracking-[0.14em] font-bold text-ink-muted mb-3">Duration</span>
              <div className="h-10 w-10 rounded-2xl bg-aqua/25 flex items-center justify-center mb-2.5">
                <Timer className="h-5 w-5 text-primary" />
              </div>
              <p className="font-bold text-xl leading-tight">{job.estimated_hours || 2} hrs</p>
              <p className="text-xs text-ink-muted mt-0.5">
                {job.actual_hours ? `${job.actual_hours}h actual` : "estimated"}
              </p>
            </div>

            <div className="rounded-3xl p-4 bg-gradient-to-br from-success/20 to-success/5 border border-success/30 shadow-wf flex flex-col items-center text-center">
              <span className="inline-block px-2.5 py-1 rounded-full border border-success/40 bg-background/60 text-[10px] uppercase tracking-[0.14em] font-bold text-ink-muted mb-3">You Earn</span>
              <div className="h-10 w-10 rounded-2xl bg-success/25 flex items-center justify-center mb-2.5">
                <DollarSign className="h-5 w-5 text-success" />
              </div>
              <p className="font-bold text-xl leading-tight text-success">{money.cleanerNet} cr</p>
              <p className="text-xs text-ink-muted mt-0.5">after fee</p>
            </div>

            <div className="rounded-3xl p-4 bg-gradient-to-br from-secondary/40 to-secondary/10 border border-hairline-soft shadow-wf flex flex-col items-center text-center">
              <span className="inline-block px-2.5 py-1 rounded-full border border-hairline-soft bg-background/60 text-[10px] uppercase tracking-[0.14em] font-bold text-ink-muted mb-3">Service</span>
              <div className="h-10 w-10 rounded-2xl bg-primary/15 flex items-center justify-center mb-2.5 text-2xl">
                {emoji}
              </div>
              <p className="font-bold text-xl leading-tight capitalize">{cleaningTypeLabel}</p>
              <p className="text-xs text-ink-muted mt-0.5">cleaning</p>
            </div>

            <div className="rounded-3xl p-4 bg-gradient-to-br from-secondary/40 to-secondary/10 border border-hairline-soft shadow-wf flex flex-col items-center text-center">
              <span className="inline-block px-2.5 py-1 rounded-full border border-hairline-soft bg-background/60 text-[10px] uppercase tracking-[0.14em] font-bold text-ink-muted mb-3">Client</span>
              <div className="h-10 w-10 rounded-2xl bg-primary/15 flex items-center justify-center mb-2.5">
                <User className="h-5 w-5 text-primary" />
              </div>
              <p className="font-bold text-xl leading-tight truncate max-w-full">
                {participants.client.firstName || "Client"}
              </p>
              <p className="text-xs text-ink-muted mt-0.5">
                {paymentMode === "direct" ? "Direct pay" : "Escrow"}
              </p>
            </div>

            {(job as any).square_footage && (
              <div className="rounded-3xl p-4 bg-gradient-to-br from-info/15 to-info/5 border border-info/25 shadow-wf flex flex-col items-center text-center">
                <span className="inline-block px-2.5 py-1 rounded-full border border-info/30 bg-background/60 text-[10px] uppercase tracking-[0.14em] font-bold text-ink-muted mb-3">Home Size</span>
                <div className="h-10 w-10 rounded-2xl bg-info/20 flex items-center justify-center mb-2.5">
                  <Home className="h-5 w-5 text-info" />
                </div>
                <p className="font-bold text-xl leading-tight">
                  {(job as any).square_footage.toLocaleString()}
                </p>
                <p className="text-xs text-ink-muted mt-0.5">sq ft</p>
              </div>
            )}

            {(job as any).dirtiness_level && DIRTINESS_LABELS[(job as any).dirtiness_level] && (
              <div className="rounded-3xl p-4 bg-gradient-to-br from-warning/15 to-warning/5 border border-warning/25 shadow-wf flex flex-col items-center text-center">
                <span className="inline-block px-2.5 py-1 rounded-full border border-warning/30 bg-background/60 text-[10px] uppercase tracking-[0.14em] font-bold text-ink-muted mb-3">Condition</span>
                <div className="h-10 w-10 rounded-2xl bg-warning/20 flex items-center justify-center mb-2.5 text-2xl">
                  {DIRTINESS_LABELS[(job as any).dirtiness_level].emoji}
                </div>
                <p className="font-bold text-xl leading-tight">
                  {DIRTINESS_LABELS[(job as any).dirtiness_level].label}
                </p>
                <p className="text-xs text-ink-muted mt-0.5">client-rated</p>
              </div>
            )}
          </div>

          {isInProgress && job.check_in_at && (
              <div className="mt-3 pt-3 border-t border-border flex items-center gap-3 p-3 rounded-lg bg-primary/5">
                <Timer className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Time elapsed</p>
                  <p className="font-semibold text-sm">
                    {Math.floor(elapsedMin / 60)}h {elapsedMin % 60}m
                  </p>
                </div>
                <div className="flex-1">
                  <Progress value={Math.min(100, (elapsedMin / ((job.estimated_hours || 2) * 60)) * 100)} className="h-1.5" />
                </div>
              </div>
            )}
            
            {job.notes && (
            <div className="rounded-3xl p-4 bg-gradient-to-br from-warning/10 to-warning/5 border border-warning/25 shadow-wf">
              <p className="text-[11px] uppercase tracking-[0.14em] font-bold text-ink-muted mb-2 flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5" /> Client Notes
              </p>
              <p className="text-base italic leading-relaxed">"{job.notes}"</p>
            </div>
          )}
        </div>

        {/* Check-in Action */}
        {canCheckin && (
          <Card className="rounded-3xl border border-primary/30 bg-primary/5 shadow-wf">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Navigation className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-0.5">Ready to start?</h3>
                  <p className="text-sm text-muted-foreground mb-3">GPS check-in verifies your location and starts the job timer</p>
                  <Button size="lg" className="w-full" onClick={handleCheckin} disabled={checkIn.isPending}>
                    {checkIn.isPending ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <Play className="h-5 w-5 mr-2" />}
                    Check In & Start Job
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Photo Upload — Numbered Stepper */}
        {isInProgress && (
          <Card className="rounded-3xl border border-hairline-soft bg-app-surface shadow-wf">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Camera className="h-4 w-4" />
                Photo Documentation
                <Badge variant={canCheckout ? "success" : "warning"} className="ml-auto text-xs">
                  {beforeCount + afterCount} uploaded
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Numbered photo stepper */}
              <div className="space-y-2">
                {([
                  { step: 1, type: 'before' as const, label: 'Before Photos', desc: 'Capture the space before you start cleaning', count: beforeCount, done: beforeCount >= 1, locked: false },
                  { step: 2, type: 'after' as const, label: 'After Photos', desc: 'Show your completed work', count: afterCount, done: afterCount >= 1, locked: beforeCount === 0 },
                ]).map(({ step, type, label, desc, count, done, locked }) => (
                  <button
                    key={type}
                    onClick={() => { if (!locked) { setSelectedPhotoType(type); fileEl?.click(); } }}
                    disabled={!!locked}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                      done
                        ? 'border-success/40 bg-success/5'
                        : selectedPhotoType === type && !locked
                        ? 'border-primary bg-primary/5'
                        : locked
                        ? 'border-border bg-muted/30 opacity-50 cursor-not-allowed'
                        : 'border-border hover:border-primary/40 hover:bg-muted/50'
                    }`}
                  >
                    {/* Step number / checkmark */}
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold ${
                      done ? 'bg-success text-white' : locked ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary'
                    }`}>
                      {done ? '✓' : step}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{label}</p>
                        {count > 0 && (
                          <Badge variant="secondary" className="text-xs">{count} uploaded</Badge>
                        )}
                        {locked && (
                          <span className="text-xs text-muted-foreground">Upload before photos first</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{desc}</p>
                    </div>
                    {!done && !locked && (
                      <Upload className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    )}
                    {uploadPhoto.isPending && selectedPhotoType === type && (
                      <Loader2 className="h-4 w-4 animate-spin text-primary flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>

              <input
                ref={setFileEl}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileSelect}
                className="hidden"
              />

              {!canCheckout && (beforeCount > 0 || afterCount > 0) && (
                <div className="flex items-start gap-2 p-3 bg-warning/10 border border-warning/30 rounded-lg text-sm">
                  <AlertTriangle className="h-4 w-4 text-warning flex-shrink-0 mt-0.5" />
                  <span className="text-warning">
                    {beforeCount === 0 ? "Upload at least 1 before photo to continue." : "Upload at least 1 after photo to complete the job."}
                  </span>
                </div>
              )}

              {/* Photos grid */}
              {photos.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {photos.map((photo) => {
                    const isBefore = photo.photo_type === 'before' || photo.photo_url.includes('/before-');
                    return (
                      <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                        <img src={photo.photo_url} alt="Job photo" className="w-full h-full object-cover" />
                        <Badge className={`absolute top-1 left-1 text-xs ${isBefore ? '' : 'bg-success'}`} variant={isBefore ? 'secondary' : 'success'}>
                          {isBefore ? 'Before' : 'After'}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Checkout */}
        {canCheckoutNow && (
          <Card className={`rounded-3xl shadow-wf ${canCheckout ? "border border-state-success-fg/30 bg-state-success-bg" : "border border-warning/30 bg-warning/5"}`}>
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${canCheckout ? 'bg-success/10' : 'bg-warning/10'}`}>
                  <CheckCircle className={`h-6 w-6 ${canCheckout ? 'text-success' : 'text-warning'}`} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-0.5">
                    {canCheckout ? "Ready to complete?" : "Almost done!"}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {canCheckout
                      ? `In progress for ${Math.floor(elapsedMin / 60)}h ${elapsedMin % 60}m`
                      : "Upload required photos before completing"}
                  </p>
                  <Button
                    size="lg"
                    variant={canCheckout ? "success" : "outline"}
                    className="w-full"
                    onClick={handleCheckout}
                    disabled={checkOut.isPending || !canCheckout}
                  >
                    {checkOut.isPending ? (
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="h-5 w-5 mr-2" />
                    )}
                    {canCheckout ? "Complete & Check Out" : "Upload Photos First"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Completed state */}
        {isCompleted && (
          <Card className="rounded-3xl border border-state-success-fg/30 bg-state-success-bg shadow-wf">
            <CardContent className="p-5 text-center">
              <CheckCircle className="h-12 w-12 text-state-success-fg mx-auto mb-3" />
              <h3 className="font-bold text-lg mb-1">Job Complete!</h3>
              <p className="text-sm text-ink-muted mb-4">
                Waiting for client approval. Your {money.cleanerNet} credits will be released after review.
              </p>
              {photos.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {photos.slice(0, 6).map((photo) => (
                    <div key={photo.id} className="aspect-square rounded-lg overflow-hidden bg-muted">
                      <img src={photo.photo_url} alt="Job photo" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
              {profile?.id && job.client_id && (
                <Button variant="outline" size="sm" className="gap-2" onClick={() => setRatingOpen(true)}>
                  <Star className="h-4 w-4" /> Rate this client
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Floating Help Button */}
        {!isCompleted && (
          <div className="fixed bottom-24 right-4 z-50 md:absolute md:bottom-0 md:right-0">
            <Button
              size="icon"
              variant="outline"
              className="h-12 w-12 rounded-full shadow-lg border-2"
              onClick={() => setSupportOpen(true)}
              title="Need help?"
            >
              <HelpCircle className="h-5 w-5" />
            </Button>
          </div>
        )}
      </div>

      {/* Support Chat Sheet */}
      {jobId && (
        <JobSupportChat open={supportOpen} onOpenChange={setSupportOpen} jobId={jobId} />
      )}

      {/* Client Rating Dialog — shows after completion */}
      {isCompleted && profile?.id && job.client_id && (
        <ClientRatingForm
          open={ratingOpen}
          onOpenChange={setRatingOpen}
          jobId={jobId!}
          cleanerId={profile.id}
          clientId={job.client_id}
          clientFirstName={participants.client.firstName}
          onSubmitted={() => navigate("/cleaner/jobs")}
        />
      )}

      {/* Decline Offer Dialog */}
      <Dialog open={declineOpen} onOpenChange={setDeclineOpen}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle>Decline this job?</DialogTitle>
            <DialogDescription>
              The client's held credits will be released back to their wallet immediately,
              and they'll be prompted to pick another cleaner.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-ink-muted">Reason (optional)</label>
            <Textarea
              placeholder="e.g. Schedule conflict, too far from my service area…"
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              className="rounded-2xl min-h-[80px]"
              maxLength={500}
            />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="ghost" className="rounded-xl" onClick={() => setDeclineOpen(false)} disabled={declineOffer.isPending}>
              Keep offer
            </Button>
            <Button
              variant="destructive"
              className="rounded-xl gap-1.5"
              onClick={() => declineOffer.mutate(
                { jobId: job.id, reason: declineReason.trim() || undefined },
                { onSuccess: () => { setDeclineOpen(false); setDeclineReason(""); navigate("/cleaner/jobs"); } }
              )}
              disabled={declineOffer.isPending}
            >
              {declineOffer.isPending
                ? <><Loader2 className="h-4 w-4 animate-spin" /> Declining…</>
                : <><XCircle className="h-4 w-4" /> Confirm decline</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CleanerLayout>
  );
}
