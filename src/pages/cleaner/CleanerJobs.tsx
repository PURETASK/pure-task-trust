import { useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { CleanerLayout } from "@/components/cleaner/CleanerLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  MapPin, Clock, Calendar, MessageCircle, Navigation,
  DollarSign, Briefcase, CheckCircle, Flame, Zap, Timer,
  TrendingUp, Play, Camera, Upload, Loader2, ExternalLink,
  LogIn, LogOut, Image as ImageIcon, ChevronDown, ChevronUp,
  AlertCircle, X, Star, ArrowLeft
} from "lucide-react";
import {
  format, isToday, isThisWeek, isThisMonth,
  differenceInMinutes, startOfWeek, endOfWeek,
  startOfMonth, endOfMonth, isSameDay
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

// ─── Individual job card for Today section (with clock in/out + photos) ──────
function TodayJobCard({ job, feeRate }: { job: CleanerJobWithClient; feeRate: number }) {
  const [expanded, setExpanded] = useState(false);
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
  const isCompleted = job.status === "completed";

  const lastCheckin = checkins?.filter(c => c.type === "check_in").pop();
  const lastCheckout = checkins?.filter(c => c.type === "check_out").pop();

  // elapsed timer
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
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
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

  const stepIndex = isConfirmed ? 0 : isInProgress ? 1 : isCompleted ? 2 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-3xl border-2 overflow-hidden transition-all duration-200 ${
        isInProgress
          ? "border-warning/60 ring-2 ring-warning/20"
          : isCompleted
          ? "border-success/60"
          : "border-primary/40"
      }`}
      style={{ background: "hsl(var(--card))" }}
    >
      {/* accent stripe */}
      <div className={`h-1.5 w-full ${
        isInProgress ? "bg-gradient-to-r from-warning to-warning/70"
        : isCompleted ? "bg-success"
        : "bg-gradient-to-r from-primary to-primary/70"
      }`} />

      <div className="p-5 space-y-4">
        {/* ── TOP ROW ── */}
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
          {/* Status badge */}
          <div className={`shrink-0 text-xs font-bold px-3 py-1 rounded-full border-2 ${
            isInProgress ? "border-warning/60 text-warning bg-warning/10"
            : isCompleted ? "border-success/60 text-success bg-success/10"
            : "border-primary/60 text-primary bg-primary/10"
          }`}>
            {isInProgress ? "🔥 In Progress" : isCompleted ? "✅ Done" : "✅ Confirmed"}
          </div>
        </div>

        {/* ── ADDRESS ── */}
        <div className="flex items-start gap-2.5 p-3 rounded-2xl border-2 border-border/60 bg-muted/30">
          <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground font-medium mb-0.5">Service Address</p>
            <p className="text-sm font-medium leading-snug">{address}</p>
          </div>
          <a
            href={googleMapsUrl(address)}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/10 border border-primary/30 rounded-xl px-3 py-1.5 hover:bg-primary/20 transition-colors"
          >
            <Navigation className="h-3.5 w-3.5" /> Directions
          </a>
        </div>

        {/* ── PROGRESS STEPPER ── */}
        {!isCompleted && (
          <div className="flex items-center gap-2">
            {["Clock In", "Upload Photos", "Clock Out"].map((step, i) => (
              <div key={step} className="flex items-center gap-1 flex-1">
                <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                  stepIndex > i ? "bg-success text-white"
                  : stepIndex === i ? "bg-primary text-white"
                  : "bg-muted text-muted-foreground"
                }`}>
                  {stepIndex > i ? "✓" : i + 1}
                </div>
                <span className={`text-[10px] font-medium hidden sm:block ${stepIndex >= i ? "text-foreground" : "text-muted-foreground"}`}>{step}</span>
                {i < 2 && <div className={`flex-1 h-0.5 rounded-full ${stepIndex > i ? "bg-success" : "bg-border"}`} />}
              </div>
            ))}
          </div>
        )}

        {/* ── CLOCK IN/OUT SECTION ── */}
        {!isCompleted && (
          <div className="rounded-2xl border-2 border-primary/30 bg-primary/5 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Navigation className="h-4 w-4 text-primary" />
              <span className="font-bold text-sm text-primary">GPS Clock-In / Clock-Out</span>
            </div>

            {/* Clock-in row */}
            <div className="flex items-center justify-between p-3 rounded-xl border-2 border-border/60 bg-card">
              <div className="flex items-center gap-2">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${hasCheckedIn ? "bg-success" : "bg-muted"}`}>
                  <LogIn className={`h-4 w-4 ${hasCheckedIn ? "text-white" : "text-muted-foreground"}`} />
                </div>
                <div>
                  <p className="text-sm font-semibold">Clock In</p>
                  {lastCheckin && (
                    <p className="text-xs text-muted-foreground">{format(new Date(lastCheckin.created_at), "h:mm a")}</p>
                  )}
                </div>
              </div>
              {hasCheckedIn ? (
                <Badge className="bg-success/20 text-success border border-success/40 rounded-xl text-xs font-bold">
                  {lastCheckin?.is_within_radius ? "✓ Verified" : `${lastCheckin?.distance_from_job_meters}m away`}
                </Badge>
              ) : (
                <Button
                  size="sm"
                  className="rounded-xl bg-success text-white border-2 border-success font-bold"
                  onClick={handleCheckin}
                  disabled={checkIn.isPending}
                >
                  {checkIn.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Play className="h-3.5 w-3.5 mr-1" />Clock In</>}
                </Button>
              )}
            </div>

            {/* Clock-out row */}
            <div className={`flex items-center justify-between p-3 rounded-xl border-2 border-border/60 bg-card ${!hasCheckedIn ? "opacity-50 pointer-events-none" : ""}`}>
              <div className="flex items-center gap-2">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${hasCheckedOut ? "bg-success" : "bg-muted"}`}>
                  <LogOut className={`h-4 w-4 ${hasCheckedOut ? "text-white" : "text-muted-foreground"}`} />
                </div>
                <div>
                  <p className="text-sm font-semibold">Clock Out</p>
                  {lastCheckout && (
                    <p className="text-xs text-muted-foreground">{format(new Date(lastCheckout.created_at), "h:mm a")}</p>
                  )}
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
                <Button
                  size="sm"
                  className="rounded-xl bg-destructive text-white border-2 border-destructive font-bold"
                  onClick={handleCheckout}
                  disabled={checkOut.isPending || !hasCheckedIn || hasCheckedOut || !canCheckout}
                >
                  {checkOut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><LogOut className="h-3.5 w-3.5 mr-1" />Clock Out</>}
                </Button>
              )}
            </div>

            {/* GPS Coordinates display */}
            {(userLocation || lastCheckin) && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-xl p-2.5">
                <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                <span className="font-medium">Your location:</span>
                <span className="font-mono">
                  {userLocation
                    ? `${userLocation.lat.toFixed(6)}, ${userLocation.lng.toFixed(6)}`
                    : lastCheckin
                    ? `${(lastCheckin.lat || 0).toFixed(6)}, ${(lastCheckin.lng || 0).toFixed(6)}`
                    : "—"}
                </span>
                <button
                  onClick={fetchLocation}
                  className="ml-auto text-primary underline-offset-2 hover:underline"
                >
                  {locating ? <Loader2 className="h-3 w-3 animate-spin" /> : "refresh"}
                </button>
              </div>
            )}

            {/* In-progress timer */}
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
        )}

        {/* ── PHOTOS SECTION ── */}
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

            {/* Photo type toggle */}
            <div className="flex gap-2 p-1 bg-muted/50 rounded-xl">
              {(["before", "after"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setPhotoType(t)}
                  disabled={t === "after" && beforeCount === 0}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                    photoType === t
                      ? "bg-warning text-white shadow"
                      : "text-muted-foreground hover:text-foreground disabled:opacity-40"
                  }`}
                >
                  {t === "before" ? `📷 Before (${beforeCount})` : `✨ After (${afterCount})`}
                </button>
              ))}
            </div>

            {/* Photo thumbnails */}
            {photos.filter(p => p.photo_type === photoType).length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {photos.filter(p => p.photo_type === photoType).map((photo) => (
                  <div key={photo.id} className="relative aspect-square rounded-xl overflow-hidden border-2 border-border/60">
                    <img src={photo.photo_url} alt={`${photoType} photo`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}

            {/* Upload button */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              variant="outline"
              className="w-full border-2 border-warning/50 text-warning hover:bg-warning/10 rounded-xl font-semibold gap-2"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadPhoto.isPending || (photoType === "after" && beforeCount === 0)}
            >
              {uploadPhoto.isPending ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Uploading...</>
              ) : (
                <><Upload className="h-4 w-4" /> Upload {photoType === "before" ? "Before" : "After"} Photo</>
              )}
            </Button>

            {!canCheckout && (beforeCount > 0 || afterCount > 0) && (
              <div className="flex items-start gap-2 text-xs text-warning bg-warning/10 rounded-xl p-2.5">
                <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                <span>Need at least 1 before photo AND 1 after photo before clocking out. The full set will be sent to the client for review.</span>
              </div>
            )}

            {canCheckout && (
              <div className="flex items-center gap-2 text-xs text-success bg-success/10 rounded-xl p-2.5">
                <CheckCircle className="h-3.5 w-3.5 shrink-0" />
                <span className="font-semibold">All photos uploaded! You can now clock out — the client will receive everything for review.</span>
              </div>
            )}
          </div>
        )}

        {/* ── COMPLETED NOTICE ── */}
        {isCompleted && (
          <div className="flex items-center gap-3 p-3 rounded-2xl border-2 border-success/40 bg-success/8">
            <CheckCircle className="h-5 w-5 text-success shrink-0" />
            <div>
              <p className="text-sm font-bold text-success">Job Complete — Awaiting Client Approval</p>
              <p className="text-xs text-muted-foreground">Photos and summary sent to client. Payment releases upon approval.</p>
            </div>
          </div>
        )}

        {/* ── ACTIONS ROW ── */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1 rounded-xl border-2 border-border/60 gap-1.5" asChild>
            <Link to={`/cleaner/messages?job=${job.id}`}>
              <MessageCircle className="h-4 w-4" /> Message
            </Link>
          </Button>
          <Button variant="outline" size="sm" className="flex-1 rounded-xl border-2 border-border/60 gap-1.5" asChild>
            <Link to={`/cleaner/jobs/${job.id}`}>
              <ExternalLink className="h-4 w-4" /> Full Details
            </Link>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Simple compact job card for Week/Month sections ────────────────────────
function CompactJobCard({ job, feeRate }: { job: CleanerJobWithClient; feeRate: number }) {
  const gross = job.escrow_credits_reserved || 0;
  const net = Math.round(gross * (1 - feeRate));
  const address = formatAddress(job);
  const emoji = TYPE_EMOJI[job.cleaning_type] || "🧹";
  const date = job.scheduled_start_at ? new Date(job.scheduled_start_at) : null;
  const isCompleted = job.status === "completed";
  const isInProgress = job.status === "in_progress";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border-2 overflow-hidden transition-all hover:shadow-md ${
        isCompleted ? "border-success/40" : isInProgress ? "border-warning/50" : "border-border/60"
      }`}
      style={{ background: "hsl(var(--card))" }}
    >
      <div className="p-4 flex items-center gap-3">
        {/* emoji + type */}
        <div className={`h-11 w-11 rounded-xl flex items-center justify-center text-xl shrink-0 border-2 ${
          isCompleted ? "border-success/30 bg-success/8" : "border-border/60 bg-muted/40"
        }`}>{emoji}</div>

        {/* main info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-sm capitalize">{(job.cleaning_type || "standard").replace(/_/g, " ")} Clean</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
              isCompleted ? "border-success/40 text-success bg-success/10"
              : isInProgress ? "border-warning/40 text-warning bg-warning/10"
              : "border-primary/40 text-primary bg-primary/10"
            }`}>
              {isCompleted ? "Done" : isInProgress ? "Active" : "Confirmed"}
            </span>
          </div>
          <div className="flex flex-wrap gap-2 mt-1 text-xs text-muted-foreground">
            {date && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {format(date, "EEE, MMM d")}
              </span>
            )}
            {date && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {format(date, "h:mm a")}
              </span>
            )}
            <span className="flex items-center gap-1 text-success font-semibold">
              <DollarSign className="h-3 w-3" />${net}
            </span>
          </div>
          {/* address + maps */}
          <div className="flex items-center gap-1.5 mt-1.5">
            <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
            <span className="text-xs text-muted-foreground truncate">{address}</span>
            <a
              href={googleMapsUrl(address)}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 flex items-center gap-0.5 text-[10px] font-semibold text-primary hover:underline"
            >
              <ExternalLink className="h-3 w-3" /> Map
            </a>
          </div>
        </div>

        {/* action */}
        <Button variant="ghost" size="sm" className="shrink-0 rounded-xl h-8 px-3 text-xs gap-1" asChild>
          <Link to={`/cleaner/jobs/${job.id}`}>View</Link>
        </Button>
      </div>
    </motion.div>
  );
}

// ─── Section wrapper ─────────────────────────────────────────────────────────
function Section({
  title, icon: Icon, count, color, borderColor, bgColor, children, defaultOpen = true
}: {
  title: string; icon: React.ElementType; count: number;
  color: string; borderColor: string; bgColor: string;
  children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`rounded-3xl border-2 ${borderColor} overflow-hidden`} style={{ background: "hsl(var(--card))" }}>
      <button
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center justify-between px-5 py-4 ${bgColor} border-b-2 ${open ? borderColor : "border-transparent"} transition-all`}
      >
        <div className="flex items-center gap-3">
          <div className={`h-9 w-9 rounded-xl flex items-center justify-center border-2 ${borderColor} bg-card`}>
            <Icon className={`h-4.5 w-4.5 ${color}`} />
          </div>
          <div className="text-left">
            <p className={`font-black text-base ${color}`}>{title}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full border-2 ${borderColor} ${color} bg-card`}>
            {count} {count === 1 ? "job" : "jobs"}
          </span>
          {open ? <ChevronUp className={`h-4 w-4 ${color}`} /> : <ChevronDown className={`h-4 w-4 ${color}`} />}
        </div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 space-y-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────
export default function CleanerJobs() {
  const { jobs, isLoading } = useCleanerJobs();
  const { profile } = useCleanerProfile();

  const tier = profile?.tier || "bronze";
  const feeRate = TIER_FEE[tier] ?? 0.20;
  const getNet = (gross: number) => Math.round(gross * (1 - feeRate));

  const now = new Date();

  // filter to accepted/active jobs (confirmed, in_progress)
  const acceptedJobs = jobs
    .filter(j => ["confirmed", "in_progress", "on_way", "arrived", "completed"].includes(j.status))
    .sort((a, b) => new Date(a.scheduled_start_at || 0).getTime() - new Date(b.scheduled_start_at || 0).getTime());

  const todayJobs   = acceptedJobs.filter(j => j.scheduled_start_at && isToday(new Date(j.scheduled_start_at)));
  const weekJobs    = acceptedJobs.filter(j => j.scheduled_start_at && isThisWeek(new Date(j.scheduled_start_at), { weekStartsOn: 1 }) && !isToday(new Date(j.scheduled_start_at)));
  const monthJobs   = acceptedJobs.filter(j => j.scheduled_start_at && isThisMonth(new Date(j.scheduled_start_at)) && !isThisWeek(new Date(j.scheduled_start_at), { weekStartsOn: 1 }));

  const todayEarnings = todayJobs.reduce((s, j) => s + getNet(j.escrow_credits_reserved || 0), 0);
  const weekEarnings  = [...todayJobs, ...weekJobs].reduce((s, j) => s + getNet(j.escrow_credits_reserved || 0), 0);
  const monthEarnings = acceptedJobs.filter(j => j.scheduled_start_at && isThisMonth(new Date(j.scheduled_start_at))).reduce((s, j) => s + getNet(j.escrow_credits_reserved || 0), 0);

  const weekStart = format(startOfWeek(now, { weekStartsOn: 1 }), "MMM d");
  const weekEnd   = format(endOfWeek(now, { weekStartsOn: 1 }), "MMM d");
  const monthName = format(now, "MMMM");

  return (
    <CleanerLayout>
      <Helmet><title>Active Jobs | PureTask</title></Helmet>
      <div className="space-y-6 max-w-3xl">

        {/* ── HEADER ── */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="rounded-3xl border-2 border-primary/40 bg-primary/8 p-5">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h1 className="text-3xl font-black flex items-center gap-2 text-primary">
                  <Briefcase className="h-7 w-7" /> Active Jobs
                </h1>
                <p className="text-muted-foreground text-sm mt-0.5">All accepted jobs — clock in, upload photos, clock out</p>
              </div>
              <div className="flex gap-3 flex-wrap">
                <div className="flex flex-col items-center bg-card border-2 border-success/40 rounded-2xl px-4 py-2.5">
                  <span className="text-xl font-black text-success">${todayEarnings}</span>
                  <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Today</span>
                </div>
                <div className="flex flex-col items-center bg-card border-2 border-primary/40 rounded-2xl px-4 py-2.5">
                  <span className="text-xl font-black text-primary">${weekEarnings}</span>
                  <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">This Week</span>
                </div>
                <div className="flex flex-col items-center bg-card border-2 border-warning/40 rounded-2xl px-4 py-2.5">
                  <span className="text-xl font-black text-warning">${monthEarnings}</span>
                  <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">{monthName}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-40 rounded-3xl" />)}
          </div>
        ) : acceptedJobs.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="rounded-3xl border-2 border-dashed border-muted-foreground/20 py-20 text-center">
            <div className="h-20 w-20 rounded-3xl bg-muted flex items-center justify-center mx-auto mb-4">
              <Briefcase className="h-10 w-10 text-muted-foreground/30" />
            </div>
            <p className="font-bold text-lg text-muted-foreground mb-2">No accepted jobs yet</p>
            <p className="text-sm text-muted-foreground mb-5">Browse the marketplace to find and accept your next job</p>
            <Button className="gap-2 rounded-xl" asChild>
              <Link to="/cleaner/marketplace"><Zap className="h-4 w-4" />Browse Marketplace</Link>
            </Button>
          </motion.div>
        ) : (
          <>
            {/* ── TODAY ── */}
            <Section
              title={`Today — ${format(now, "EEEE, MMMM d")}`}
              icon={Flame}
              count={todayJobs.length}
              color="text-destructive"
              borderColor="border-destructive/40"
              bgColor="bg-destructive/5"
              defaultOpen
            >
              {todayJobs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No jobs scheduled for today</p>
              ) : (
                todayJobs.map(job => <TodayJobCard key={job.id} job={job} feeRate={feeRate} />)
              )}
            </Section>

            {/* ── THIS WEEK ── */}
            <Section
              title={`This Week — ${weekStart} – ${weekEnd}`}
              icon={Calendar}
              count={weekJobs.length}
              color="text-primary"
              borderColor="border-primary/40"
              bgColor="bg-primary/5"
              defaultOpen={weekJobs.length > 0}
            >
              {weekJobs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No other jobs this week</p>
              ) : (
                weekJobs.map(job => <CompactJobCard key={job.id} job={job} feeRate={feeRate} />)
              )}
            </Section>

            {/* ── THIS MONTH ── */}
            <Section
              title={`${monthName} — Rest of Month`}
              icon={TrendingUp}
              count={monthJobs.length}
              color="text-warning"
              borderColor="border-warning/40"
              bgColor="bg-warning/5"
              defaultOpen={false}
            >
              {monthJobs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No other jobs this month</p>
              ) : (
                monthJobs.map(job => <CompactJobCard key={job.id} job={job} feeRate={feeRate} />)
              )}
            </Section>
          </>
        )}

        {/* ── MARKETPLACE NUDGE ── */}
        {!isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <div className="rounded-3xl border-2 border-success/40 bg-success/5 p-5 flex items-center justify-between gap-4">
              <div>
                <p className="font-bold text-success">Looking for more work?</p>
                <p className="text-sm text-muted-foreground">Browse available jobs in your area</p>
              </div>
              <Button className="shrink-0 rounded-xl bg-success text-white border-2 border-success gap-2 font-bold hover:bg-success/90" asChild>
                <Link to="/cleaner/marketplace"><Zap className="h-4 w-4" /> Marketplace</Link>
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </CleanerLayout>
  );
}
