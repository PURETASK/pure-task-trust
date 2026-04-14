import { useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { CleanerLayout } from "@/components/cleaner/CleanerLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MapPin, Clock, Calendar, MessageCircle, Navigation,
  DollarSign, Briefcase, CheckCircle, Flame, Zap, Timer,
  TrendingUp, Play, Camera, Upload, Loader2, ExternalLink,
  LogIn, LogOut, Image as ImageIcon, ChevronDown, ChevronUp,
  AlertCircle, X, Star, ArrowLeft, Bell, Hourglass
} from "lucide-react";
import {
  format, isToday, differenceInMinutes
} from "date-fns";
import { useCleanerJobs, useCleanerProfile } from "@/hooks/useCleanerProfile";
import { useJobCheckins } from "@/hooks/useJobCheckins";
import { useJobPhotos, useUploadJobPhoto } from "@/hooks/useJobPhotos";
import { useJobPhotoValidation } from "@/components/job/PhotoRequirements";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import type { CleanerJobWithClient } from "@/hooks/useCleanerProfile";

const TIER_FEE: Record<string, number> = { platinum: 0.15, gold: 0.16, silver: 0.18, bronze: 0.20 };

const TYPE_EMOJI: Record<string, string> = {
  standard: "🧹", deep: "✨", move_out: "📦", airbnb: "🏠", office: "🏢",
};

function formatAddress(job: any): string {
  const parts = [
    job.address_line1,
    job.address_city,
    job.address_state,
    job.address_postal_code,
  ].filter(Boolean);
  if (parts.length) return parts.join(", ");
  return job.address || "Address not available";
}

function googleMapsUrl(address: string) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
}

// ─── Live Job Card (full workflow card) ──────────────────────────────────────
function LiveJobCard({ job, feeRate }: { job: CleanerJobWithClient; feeRate: number }) {
  const [photoType, setPhotoType] = useState<"before" | "after">("before");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: photos = [] } = useJobPhotos(job.id);
  const uploadPhoto = useUploadJobPhoto(job.id);
  const { checkins, hasCheckedIn, hasCheckedOut, checkIn, checkOut, isLoading: checkinsLoading } = useJobCheckins(job.id);
  const { beforeCount, afterCount, canCheckout } = useJobPhotoValidation(photos);

  const gross = job.escrow_credits_reserved || 0;
  const net = Math.round(gross * (1 - feeRate));
  const address = formatAddress(job);
  const emoji = TYPE_EMOJI[job.cleaning_type] || "🧹";
  const isInProgress = job.status === "in_progress";
  const isConfirmed = job.status === "confirmed";

  const lastCheckin = checkins?.filter(c => c.type === "check_in").pop();
  const lastCheckout = checkins?.filter(c => c.type === "check_out").pop();

  const [elapsedMin, setElapsedMin] = useState(0);
  useEffect(() => {
    if (!job.check_in_at || job.status !== "in_progress") return;
    const update = () => setElapsedMin(differenceInMinutes(new Date(), new Date(job.check_in_at!)));
    update();
    const t = setInterval(update, 30000);
    return () => clearInterval(t);
  }, [job.check_in_at, job.status]);

  const fetchLocation = () => {
    setLocating(true);
    navigator.geolocation?.getCurrentPosition(
      (pos) => { setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setLocating(false); },
      () => { toast.error("Unable to get location"); setLocating(false); },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleCheckin = async () => {
    try {
      await checkIn.mutateAsync({
        jobId: job.id,
        jobLat: (job as any).checkin_lat || (job as any).address_lat || 0,
        jobLng: (job as any).checkin_lng || (job as any).address_lng || 0,
      });
      fetchLocation();
    } catch { /* handled in hook */ }
  };

  const handleCheckout = async () => {
    if (!canCheckout) {
      toast.error("Upload at least 1 before & 1 after photo before clocking out");
      return;
    }
    try {
      await checkOut.mutateAsync({
        jobId: job.id,
        jobLat: (job as any).checkin_lat || (job as any).address_lat || 0,
        jobLng: (job as any).checkin_lng || (job as any).address_lng || 0,
      });
    } catch { /* handled in hook */ }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await uploadPhoto.mutateAsync({ file, type: photoType });
      toast.success(`${photoType === "before" ? "Before" : "After"} photo uploaded!`);
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const stepIndex = isConfirmed ? 0 : isInProgress ? 1 : 2;

  // Determine the sticky CTA
  const getStickyCta = () => {
    if (!hasCheckedIn) return { label: "Clock In", icon: Play, action: handleCheckin, loading: checkIn.isPending };
    if (beforeCount === 0) return { label: "Take Before Photos", icon: Camera, action: () => { setPhotoType("before"); fileInputRef.current?.click(); }, loading: false };
    if (afterCount === 0 && isInProgress) return { label: "Take After Photos", icon: Camera, action: () => { setPhotoType("after"); fileInputRef.current?.click(); }, loading: false };
    if (canCheckout && !hasCheckedOut) return { label: "Submit for Approval", icon: CheckCircle, action: handleCheckout, loading: checkOut.isPending };
    return null;
  };

  const stickyCta = getStickyCta();

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-3xl border-2 overflow-hidden transition-all duration-200 ${
        isInProgress ? "border-warning/60 ring-2 ring-warning/20" : "border-primary/40"
      }`}
      style={{ background: "hsl(var(--card))" }}
    >
      <div className={`h-1.5 w-full ${isInProgress ? "bg-gradient-to-r from-warning to-warning/70" : "bg-gradient-to-r from-primary to-primary/70"}`} />

      <div className="p-5 space-y-4">
        {/* TOP ROW */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 border-2 ${
              isInProgress ? "border-warning/40 bg-warning/10" : "border-primary/30 bg-primary/8"
            }`}>
              {isInProgress ? <span className="animate-pulse">{emoji}</span> : emoji}
            </div>
            <div>
              <h3 className="font-bold text-base capitalize">
                {(job.cleaning_type || "standard").replace(/_/g, " ")} Clean
              </h3>
              <p className="text-sm text-muted-foreground">
                {job.client?.first_name ? `${job.client.first_name} ${(job.client.last_name || "").charAt(0)}.` : "Private Client"}
              </p>
              <div className="flex flex-wrap gap-2 mt-1.5">
                <span className="flex items-center gap-1 text-xs bg-muted/60 rounded-full px-2.5 py-1">
                  <Clock className="h-3 w-3" />
                  {job.scheduled_start_at ? format(new Date(job.scheduled_start_at), "h:mm a") : "TBD"}
                </span>
                <span className="flex items-center gap-1 text-xs bg-muted/60 rounded-full px-2.5 py-1">
                  <Timer className="h-3 w-3" />
                  {job.estimated_hours || 2}h est.
                </span>
                <span className="flex items-center gap-1 text-xs bg-success/15 border border-success/30 rounded-full px-2.5 py-1 font-bold text-success">
                  <DollarSign className="h-3 w-3" />${net} you earn
                </span>
              </div>
            </div>
          </div>
          <div className={`shrink-0 text-xs font-bold px-3 py-1 rounded-full border-2 ${
            isInProgress ? "border-warning/60 text-warning bg-warning/10" : "border-primary/60 text-primary bg-primary/10"
          }`}>
            {isInProgress ? "🔥 In Progress" : "✅ Confirmed"}
          </div>
        </div>

        {/* ADDRESS */}
        <div className="flex items-start gap-2.5 p-3 rounded-2xl border-2 border-border/60 bg-muted/30">
          <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground font-medium mb-0.5">Service Address</p>
            <p className="text-sm font-medium leading-snug">{address}</p>
          </div>
          <a href={googleMapsUrl(address)} target="_blank" rel="noopener noreferrer"
            className="shrink-0 flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/10 border border-primary/30 rounded-xl px-3 py-1.5 hover:bg-primary/20 transition-colors">
            <Navigation className="h-3.5 w-3.5" /> Directions
          </a>
        </div>

        {/* PROGRESS STEPPER */}
        <div className="flex items-center gap-2">
          {["Clock In", "Upload Photos", "Clock Out"].map((step, i) => (
            <div key={step} className="flex items-center gap-1 flex-1">
              <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                stepIndex > i ? "bg-success text-white" : stepIndex === i ? "bg-primary text-white" : "bg-muted text-muted-foreground"
              }`}>
                {stepIndex > i ? "✓" : i + 1}
              </div>
              <span className={`text-[10px] font-medium hidden sm:block ${stepIndex >= i ? "text-foreground" : "text-muted-foreground"}`}>{step}</span>
              {i < 2 && <div className={`flex-1 h-0.5 rounded-full ${stepIndex > i ? "bg-success" : "bg-border"}`} />}
            </div>
          ))}
        </div>

        {/* GPS CLOCK IN/OUT */}
        <div className="rounded-2xl border-2 border-primary/30 bg-primary/5 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Navigation className="h-4 w-4 text-primary" />
            <span className="font-bold text-sm text-primary">GPS Clock-In / Clock-Out</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl border-2 border-border/60 bg-card">
            <div className="flex items-center gap-2">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center ${hasCheckedIn ? "bg-success" : "bg-muted"}`}>
                <LogIn className={`h-4 w-4 ${hasCheckedIn ? "text-white" : "text-muted-foreground"}`} />
              </div>
              <div>
                <p className="text-sm font-semibold">Clock In</p>
                {lastCheckin && <p className="text-xs text-muted-foreground">{format(new Date(lastCheckin.created_at), "h:mm a")}</p>}
              </div>
            </div>
            {hasCheckedIn ? (
              <Badge className="bg-success/20 text-success border border-success/40 rounded-xl text-xs font-bold">
                {lastCheckin?.is_within_radius ? "✓ Verified" : `${lastCheckin?.distance_from_job_meters}m away`}
              </Badge>
            ) : (
              <Button size="sm" className="rounded-xl bg-success text-white border-2 border-success font-bold"
                onClick={handleCheckin} disabled={checkIn.isPending}>
                {checkIn.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Play className="h-3.5 w-3.5 mr-1" />Clock In</>}
              </Button>
            )}
          </div>
          <div className={`flex items-center justify-between p-3 rounded-xl border-2 border-border/60 bg-card ${!hasCheckedIn ? "opacity-50 pointer-events-none" : ""}`}>
            <div className="flex items-center gap-2">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center ${hasCheckedOut ? "bg-success" : "bg-muted"}`}>
                <LogOut className={`h-4 w-4 ${hasCheckedOut ? "text-white" : "text-muted-foreground"}`} />
              </div>
              <div>
                <p className="text-sm font-semibold">Clock Out</p>
                {lastCheckout && <p className="text-xs text-muted-foreground">{format(new Date(lastCheckout.created_at), "h:mm a")}</p>}
                {!hasCheckedOut && !canCheckout && hasCheckedIn && (
                  <p className="text-xs text-warning font-medium">Need before + after photos first</p>
                )}
              </div>
            </div>
            {hasCheckedOut ? (
              <Badge className="bg-success/20 text-success border border-success/40 rounded-xl text-xs font-bold">
                {lastCheckout?.is_within_radius ? "✓ Verified" : `${lastCheckout?.distance_from_job_meters}m away`}
              </Badge>
            ) : (
              <Button size="sm" className="rounded-xl bg-destructive text-white border-2 border-destructive font-bold"
                onClick={handleCheckout} disabled={checkOut.isPending || !hasCheckedIn || hasCheckedOut || !canCheckout}>
                {checkOut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><LogOut className="h-3.5 w-3.5 mr-1" />Clock Out</>}
              </Button>
            )}
          </div>
          {isInProgress && job.check_in_at && (
            <div className="flex items-center gap-3 bg-warning/10 border border-warning/30 rounded-xl p-3">
              <Timer className="h-4 w-4 text-warning" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Time elapsed</p>
                <p className="font-bold text-sm">{Math.floor(elapsedMin / 60)}h {elapsedMin % 60}m / {job.estimated_hours || 2}h est.</p>
              </div>
              <Progress value={Math.min(100, (elapsedMin / ((job.estimated_hours || 2) * 60)) * 100)} className="w-24 h-2" />
            </div>
          )}
        </div>

        {/* PHOTOS */}
        {(isInProgress || (hasCheckedIn && !hasCheckedOut)) && (
          <div className="rounded-2xl border-2 border-warning/40 bg-warning/5 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="h-4 w-4 text-warning" />
                <span className="font-bold text-sm text-warning">Before & After Photos</span>
              </div>
              <div className="flex gap-2 text-xs font-medium">
                <span className={`px-2 py-0.5 rounded-full border ${beforeCount > 0 ? "bg-success/15 text-success border-success/40" : "bg-muted text-muted-foreground border-border"}`}>
                  {beforeCount} before
                </span>
                <span className={`px-2 py-0.5 rounded-full border ${afterCount > 0 ? "bg-success/15 text-success border-success/40" : "bg-muted text-muted-foreground border-border"}`}>
                  {afterCount} after
                </span>
              </div>
            </div>
            <div className="flex gap-2 p-1 bg-muted/50 rounded-xl">
              {(["before", "after"] as const).map((t) => (
                <button key={t} onClick={() => setPhotoType(t)} disabled={t === "after" && beforeCount === 0}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                    photoType === t ? "bg-warning text-white shadow" : "text-muted-foreground hover:text-foreground disabled:opacity-40"
                  }`}>
                  {t === "before" ? `📷 Before (${beforeCount})` : `✨ After (${afterCount})`}
                </button>
              ))}
            </div>
            {photos.filter(p => p.photo_type === photoType).length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {photos.filter(p => p.photo_type === photoType).map((photo) => (
                  <div key={photo.id} className="relative aspect-square rounded-xl overflow-hidden border-2 border-border/60">
                    <img src={photo.photo_url} alt={`${photoType} photo`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handleFileSelect} className="hidden" />
            <Button variant="outline" className="w-full border-2 border-warning/50 text-warning hover:bg-warning/10 rounded-xl font-semibold gap-2"
              onClick={() => fileInputRef.current?.click()} disabled={uploadPhoto.isPending || (photoType === "after" && beforeCount === 0)}>
              {uploadPhoto.isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Uploading...</> : <><Upload className="h-4 w-4" /> Upload {photoType === "before" ? "Before" : "After"} Photo</>}
            </Button>
          </div>
        )}

        {/* STICKY CTA */}
        {stickyCta && (
          <Button className="w-full rounded-xl font-bold gap-2 h-12 text-base" onClick={stickyCta.action} disabled={stickyCta.loading}>
            {stickyCta.loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <stickyCta.icon className="h-5 w-5" />}
            {stickyCta.label}
          </Button>
        )}

        {/* ACTIONS ROW */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1 rounded-xl border-2 border-border/60 gap-1.5" asChild>
            <Link to={`/cleaner/messages?job=${job.id}`}><MessageCircle className="h-4 w-4" /> Message</Link>
          </Button>
          <Button variant="outline" size="sm" className="flex-1 rounded-xl border-2 border-border/60 gap-1.5" asChild>
            <Link to={`/cleaner/jobs/${job.id}`}><ExternalLink className="h-4 w-4" /> Full Details</Link>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Compact job card for lists ──────────────────────────────────────────────
function CompactJobCard({ job, feeRate }: { job: CleanerJobWithClient; feeRate: number }) {
  const gross = job.escrow_credits_reserved || 0;
  const net = Math.round(gross * (1 - feeRate));
  const address = formatAddress(job);
  const emoji = TYPE_EMOJI[job.cleaning_type] || "🧹";
  const date = job.scheduled_start_at ? new Date(job.scheduled_start_at) : null;
  const isCompleted = job.status === "completed";

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border-2 border-border/60 overflow-hidden transition-all hover:shadow-md" style={{ background: "hsl(var(--card))" }}>
      <div className="p-4 flex items-center gap-3">
        <div className="h-11 w-11 rounded-xl flex items-center justify-center text-xl shrink-0 border-2 border-border/60 bg-muted/40">{emoji}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-sm capitalize">{(job.cleaning_type || "standard").replace(/_/g, " ")} Clean</span>
          </div>
          <div className="flex flex-wrap gap-2 mt-1 text-xs text-muted-foreground">
            {date && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{format(date, "EEE, MMM d")}</span>}
            {date && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{format(date, "h:mm a")}</span>}
            <span className="flex items-center gap-1 text-success font-semibold"><DollarSign className="h-3 w-3" />${net}</span>
          </div>
          <div className="flex items-center gap-1.5 mt-1.5">
            <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
            <span className="text-xs text-muted-foreground truncate">{address}</span>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="shrink-0 rounded-xl h-8 px-3 text-xs gap-1" asChild>
          <Link to={`/cleaner/jobs/${job.id}`}>View</Link>
        </Button>
      </div>
    </motion.div>
  );
}

// ─── Empty state ─────────────────────────────────────────────────────────────
function EmptyTab({ icon: Icon, title, subtitle }: { icon: React.ElementType; title: string; subtitle: string }) {
  return (
    <div className="rounded-3xl border-2 border-dashed border-muted-foreground/20 py-16 text-center">
      <div className="h-16 w-16 rounded-3xl bg-muted flex items-center justify-center mx-auto mb-4">
        <Icon className="h-8 w-8 text-muted-foreground/30" />
      </div>
      <p className="font-bold text-muted-foreground mb-1">{title}</p>
      <p className="text-sm text-muted-foreground">{subtitle}</p>
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────
export default function CleanerJobs() {
  const { jobs, isLoading } = useCleanerJobs();
  const { profile } = useCleanerProfile();

  const tier = profile?.tier || "bronze";
  const feeRate = TIER_FEE[tier] ?? 0.20;

  // Categorize jobs by tab
  const offers = jobs.filter(j => j.status === "pending" || j.status === "created");
  const upcoming = jobs
    .filter(j => j.status === "confirmed")
    .sort((a, b) => new Date(a.scheduled_start_at || 0).getTime() - new Date(b.scheduled_start_at || 0).getTime());
  const liveJobs = jobs.filter(j => j.status === "in_progress");
  const awaitingApproval = jobs.filter(j => j.status === "completed");
  const history = jobs
    .filter(j => j.status === "cancelled" || j.status === "disputed")
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // Determine default tab
  const defaultTab = liveJobs.length > 0 ? "live" : offers.length > 0 ? "offers" : "upcoming";

  return (
    <CleanerLayout>
      <Helmet><title>Jobs | PureTask</title></Helmet>
      <div className="space-y-5 max-w-3xl">

        {/* HEADER */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black flex items-center gap-2">
                <Briefcase className="h-7 w-7 text-success" /> Jobs
              </h1>
              <p className="text-muted-foreground text-sm mt-0.5">Accept, execute, and track your cleaning jobs</p>
            </div>
          </div>
        </motion.div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-40 rounded-3xl" />)}
          </div>
        ) : (
          <Tabs defaultValue={defaultTab} className="space-y-4">
            <TabsList className="w-full grid grid-cols-5 h-auto p-1 gap-1">
              <TabsTrigger value="offers" className="text-xs sm:text-sm py-2 gap-1 data-[state=active]:bg-warning/10 data-[state=active]:text-warning">
                <Bell className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Offers</span>
                {offers.length > 0 && (
                  <Badge variant="secondary" className="h-5 min-w-5 px-1 text-[10px]">{offers.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="upcoming" className="text-xs sm:text-sm py-2 gap-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                <Calendar className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Upcoming</span>
                {upcoming.length > 0 && (
                  <Badge variant="secondary" className="h-5 min-w-5 px-1 text-[10px]">{upcoming.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="live" className="text-xs sm:text-sm py-2 gap-1 data-[state=active]:bg-warning/10 data-[state=active]:text-warning">
                <Flame className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Live Job</span>
                {liveJobs.length > 0 && (
                  <span className="h-2 w-2 rounded-full bg-warning animate-pulse" />
                )}
              </TabsTrigger>
              <TabsTrigger value="approval" className="text-xs sm:text-sm py-2 gap-1 data-[state=active]:bg-[hsl(var(--pt-purple))]/10 data-[state=active]:text-[hsl(var(--pt-purple))]">
                <Hourglass className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Approval</span>
                {awaitingApproval.length > 0 && (
                  <Badge variant="secondary" className="h-5 min-w-5 px-1 text-[10px]">{awaitingApproval.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="history" className="text-xs sm:text-sm py-2 gap-1">
                <Clock className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">History</span>
              </TabsTrigger>
            </TabsList>

            {/* OFFERS */}
            <TabsContent value="offers" className="space-y-3">
              {offers.length === 0 ? (
                <EmptyTab icon={Bell} title="No new offers" subtitle="You'll see new job offers here when clients book you" />
              ) : (
                offers.map(job => <CompactJobCard key={job.id} job={job} feeRate={feeRate} />)
              )}
            </TabsContent>

            {/* UPCOMING */}
            <TabsContent value="upcoming" className="space-y-3">
              {upcoming.length === 0 ? (
                <EmptyTab icon={Calendar} title="No upcoming jobs" subtitle="Confirmed bookings will appear here" />
              ) : (
                upcoming.map(job => <CompactJobCard key={job.id} job={job} feeRate={feeRate} />)
              )}
            </TabsContent>

            {/* LIVE JOB */}
            <TabsContent value="live" className="space-y-3">
              {liveJobs.length === 0 ? (
                <EmptyTab icon={Flame} title="No active job" subtitle="When you clock in to a job, the live workflow appears here" />
              ) : (
                liveJobs.map(job => <LiveJobCard key={job.id} job={job} feeRate={feeRate} />)
              )}
            </TabsContent>

            {/* AWAITING APPROVAL */}
            <TabsContent value="approval" className="space-y-3">
              {awaitingApproval.length === 0 ? (
                <EmptyTab icon={Hourglass} title="Nothing awaiting approval" subtitle="Completed jobs pending client review will show here" />
              ) : (
                awaitingApproval.map(job => (
                  <motion.div key={job.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl border-2 border-primary/40 overflow-hidden" style={{ background: "hsl(var(--card))" }}>
                    <div className="p-4 flex items-center gap-3">
                      <div className="h-11 w-11 rounded-xl flex items-center justify-center text-xl shrink-0 border-2 border-primary/30 bg-primary/8">⏳</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm capitalize">{(job.cleaning_type || "standard").replace(/_/g, " ")} Clean</span>
                          <Badge className="bg-primary/10 text-primary border-primary/30 text-xs">Awaiting Approval</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {job.client?.first_name && `${job.client.first_name} · `}
                          Submitted — payment releases upon client approval
                        </p>
                      </div>
                      <Button variant="outline" size="sm" className="shrink-0 rounded-xl" asChild>
                        <Link to={`/cleaner/jobs/${job.id}`}>View</Link>
                      </Button>
                    </div>
                  </motion.div>
                ))
              )}
            </TabsContent>

            {/* HISTORY */}
            <TabsContent value="history" className="space-y-3">
              {history.length === 0 ? (
                <EmptyTab icon={Clock} title="No history yet" subtitle="Past jobs will appear here over time" />
              ) : (
                history.map(job => <CompactJobCard key={job.id} job={job} feeRate={feeRate} />)
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </CleanerLayout>
  );
}
