import { useState, useRef } from "react";
import { CleanerLayout } from "@/components/cleaner/CleanerLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { useBackgroundChecks } from "@/hooks/useBackgroundChecks";
import { useCleanerProfile } from "@/hooks/useCleanerProfile";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Shield, CheckCircle, Clock, ExternalLink, Camera,
  FileCheck, Loader2, Lock, CreditCard,
  BadgeCheck, ScanFace, Star, Zap, TrendingUp
} from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

const ID_TYPES = [
  { value: "drivers_license", label: "Driver's License", icon: CreditCard },
  { value: "passport",        label: "Passport",         icon: FileCheck   },
  { value: "state_id",        label: "State / National ID", icon: BadgeCheck },
  { value: "other",           label: "Other Gov't ID",   icon: Shield      },
];

// ── Upload box ─────────────────────────────────────────────────────────────
function PhotoUploadBox({
  label, hint, icon: Icon, onFile, preview, loading, accepted, color,
}: {
  label: string; hint: string; icon: React.ElementType;
  onFile: (f: File) => void; preview?: string | null;
  loading?: boolean; accepted?: boolean;
  color: { border: string; bg: string; icon: string };
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className="space-y-2">
      <Label className="text-sm font-semibold">{label}</Label>
      <p className="text-xs text-muted-foreground">{hint}</p>
      <div
        onClick={() => !loading && ref.current?.click()}
        className={`relative cursor-pointer rounded-2xl border-2 transition-all overflow-hidden
          ${accepted ? `${color.border} ${color.bg}` : "border-border/50 bg-muted/20 hover:border-primary/50 hover:bg-primary/5"}`}
        style={{ minHeight: 160 }}
      >
        {preview ? (
          <img src={preview} alt={label} className="w-full h-full object-cover" style={{ maxHeight: 200 }} />
        ) : (
          <div className="flex flex-col items-center justify-center py-10 gap-3">
            <div className={`h-14 w-14 rounded-2xl flex items-center justify-center ${accepted ? color.bg : "bg-muted"}`}>
              {accepted
                ? <CheckCircle className={`h-7 w-7 ${color.icon}`} />
                : <Icon className="h-7 w-7 text-muted-foreground" />
              }
            </div>
            <div className="text-center">
              <p className="text-sm font-medium">{accepted ? "Uploaded ✓" : "Tap to upload"}</p>
              <p className="text-xs text-muted-foreground">JPG, PNG, HEIC up to 10MB</p>
            </div>
          </div>
        )}
        {loading && (
          <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        {accepted && preview && (
          <div className={`absolute top-2 right-2 h-7 w-7 rounded-full flex items-center justify-center shadow-lg ${color.bg} border-2 ${color.border}`}>
            <CheckCircle className={`h-4 w-4 ${color.icon}`} />
          </div>
        )}
      </div>
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={e => {
        const f = e.target.files?.[0];
        if (f) onFile(f);
        e.target.value = "";
      }} />
    </div>
  );
}

// ── Step indicator ─────────────────────────────────────────────────────────
function StepPill({ num, label, done, active }: { num: number; label: string; done: boolean; active: boolean }) {
  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all
      ${done ? "border-success/60 bg-success/10 text-success"
        : active ? "border-primary/60 bg-primary/10 text-primary"
        : "border-border/40 bg-muted/20 text-muted-foreground"}`}
    >
      <div className={`h-5 w-5 rounded-full flex items-center justify-center text-xs font-black
        ${done ? "bg-success text-white" : active ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>
        {done ? <CheckCircle className="h-3 w-3" /> : num}
      </div>
      <span className="text-xs font-semibold">{label}</span>
    </div>
  );
}

export default function CleanerVerification() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { profile, isLoading: profileLoading } = useCleanerProfile();
  const { latestCheck, isVerified, isLoading, requestCheck } = useBackgroundChecks();
  const isRequesting = requestCheck.isPending;

  const [selectedIdType, setSelectedIdType]   = useState("drivers_license");
  const [idFrontPreview, setIdFrontPreview]   = useState<string | null>(null);
  const [idBackPreview, setIdBackPreview]     = useState<string | null>(null);
  const [selfiePreview, setSelfiePreview]     = useState<string | null>(null);
  const [uploadingFront, setUploadingFront]   = useState(false);
  const [uploadingBack, setUploadingBack]     = useState(false);
  const [uploadingSelfie, setUploadingSelfie] = useState(false);
  const [idFrontUploaded, setIdFrontUploaded] = useState(false);
  const [idBackUploaded, setIdBackUploaded]   = useState(false);
  const [selfieUploaded, setSelfieUploaded]   = useState(false);
  const [bgConsentGiven, setBgConsentGiven]   = useState(false);
  const [bgConsentName, setBgConsentName]     = useState("");
  const [submittingBg, setSubmittingBg]       = useState(false);

  const uploadFile = async (
    file: File, path: string,
    setLoading: (v: boolean) => void,
    setPreview: (v: string) => void,
    setDone: (v: boolean) => void
  ) => {
    setLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = e => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);
      const ext = file.name.split(".").pop();
      const filePath = `${user?.id}/${path}-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("identity-documents").upload(filePath, file, { upsert: true });
      if (error) throw error;
      setDone(true);
      toast({ title: "Uploaded ✓", description: `${path.replace(/-/g, " ")} uploaded successfully.` });
    } catch (e: any) {
      toast({ title: "Upload failed", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleBgSubmit = async () => {
    const fullName = profile?.first_name ? `${profile.first_name} ${profile.last_name || ""}`.trim() : "";
    if (!bgConsentGiven) { toast({ title: "Consent required", variant: "destructive" }); return; }
    if (!bgConsentName.trim()) { toast({ title: "Name required", variant: "destructive" }); return; }
    if (bgConsentName.trim().toLowerCase() !== fullName.toLowerCase() && fullName) {
      toast({ title: "Name doesn't match", variant: "destructive" }); return;
    }
    setSubmittingBg(true);
    try {
      await requestCheck.mutateAsync("checkr");
      toast({ title: "Background check submitted ✓" });
    } catch (e: any) {
      toast({ title: "Submission failed", description: e.message, variant: "destructive" });
    } finally { setSubmittingBg(false); }
  };

  const idComplete = idFrontUploaded && selfieUploaded;
  const bgComplete = isVerified;
  const allDone    = idComplete && bgComplete;

  const uploadColor = { border: "border-success/60", bg: "bg-success/10", icon: "text-success" };
  const warnColor   = { border: "border-warning/60",  bg: "bg-warning/10",  icon: "text-warning"  };

  return (
    <CleanerLayout>
      <div className="max-w-2xl mx-auto space-y-6 pb-12">

        {/* ── HERO ──────────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className={`relative overflow-hidden rounded-3xl p-7 border-2 ${
            allDone ? "border-success/60" : "border-primary/50"
          }`} style={{
            background: allDone
              ? "linear-gradient(135deg, hsl(145,65%,28%) 0%, hsl(145,65%,18%) 100%)"
              : "linear-gradient(135deg, hsl(210,100%,22%) 0%, hsl(280,65%,25%) 100%)",
            boxShadow: allDone
              ? "0 16px 48px -8px hsl(145,65%,30%/0.45)"
              : "0 16px 48px -8px hsl(210,100%,30%/0.45)",
          }}>
            <div className="absolute -top-12 -right-12 w-52 h-52 rounded-full blur-3xl opacity-20"
              style={{ background: allDone ? "hsl(145,65%,55%)" : "hsl(280,70%,60%)" }} />

            <div className="relative flex items-center gap-5">
              <div className={`h-20 w-20 rounded-3xl flex items-center justify-center shadow-lg border-2 flex-shrink-0 ${
                allDone ? "border-success/60 bg-success/20" : "border-primary/50 bg-primary/20"
              }`}>
                <Shield className="h-10 w-10 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-black text-white">Identity Verification</h1>
                  {allDone && (
                    <Badge className="bg-success/30 text-success border-success/50 border">
                      <CheckCircle className="h-3.5 w-3.5 mr-1" />Fully Verified
                    </Badge>
                  )}
                </div>
                <p className="text-white/60 text-sm max-w-sm">
                  Verify your identity to unlock higher rates and build client trust. Documents are encrypted and never shared without consent.
                </p>
              </div>
            </div>

            {/* Step pills */}
            <div className="relative mt-5 flex gap-2 flex-wrap">
              <StepPill num={1} label="Government ID" done={idFrontUploaded} active={!idFrontUploaded} />
              <StepPill num={2} label="Selfie" done={selfieUploaded} active={idFrontUploaded && !selfieUploaded} />
              <StepPill num={3} label="Background Check" done={bgComplete} active={idComplete && !bgComplete} />
            </div>
          </div>
        </motion.div>

        {/* ── BENEFITS STRIP ───────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: "3×", label: "More Bookings",  border: "border-primary/50",  bg: "bg-primary/8",  icon: TrendingUp, iconCls: "text-primary"  },
            { value: "Top", label: "Search Rank",   border: "border-success/50",  bg: "bg-success/8",  icon: Star,       iconCls: "text-success"  },
            { value: "VIP", label: "Trust Badge",   border: "border-[hsl(280,70%,55%)]/50", bg: "bg-[hsl(280,70%,55%)]/8", icon: Zap, iconCls: "text-[hsl(280,70%,55%)]" },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.07 }}>
              <div className={`rounded-2xl border-2 ${s.border} ${s.bg} text-center p-4`}>
                <s.icon className={`h-5 w-5 mx-auto mb-1 ${s.iconCls}`} />
                <p className={`text-2xl font-black ${s.iconCls}`}>{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── SECTION 1: Government ID ──────────────────────────────── */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
          <div className={`rounded-3xl border-2 overflow-hidden ${idComplete ? "border-success/60" : "border-primary/50"}`}
            style={{ background: "hsl(var(--card))" }}>

            {/* Section header */}
            <div className={`p-5 border-b-2 flex items-center justify-between ${
              idComplete ? "border-success/20 bg-success/5" : "border-primary/20 bg-primary/5"
            }`}>
              <div className="flex items-center gap-3">
                <div className={`h-11 w-11 rounded-2xl border-2 flex items-center justify-center ${
                  idComplete ? "border-success/50 bg-success/15" : "border-primary/40 bg-primary/10"
                }`}>
                  <CreditCard className={`h-5 w-5 ${idComplete ? "text-success" : "text-primary"}`} />
                </div>
                <div>
                  <h2 className="font-bold text-base">Government ID</h2>
                  <p className="text-xs text-muted-foreground">Upload a valid government-issued photo ID</p>
                </div>
              </div>
              {idComplete
                ? <Badge className="bg-success/15 text-success border-success/40 border gap-1"><CheckCircle className="h-3 w-3" />Complete</Badge>
                : <Badge variant="outline" className="text-xs border-primary/40 text-primary">Required</Badge>
              }
            </div>

            <div className="p-5 space-y-5">
              {/* ID type buttons */}
              <div>
                <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3 block">Select ID Type</Label>
                <div className="grid grid-cols-2 gap-2">
                  {ID_TYPES.map(t => (
                    <button key={t.value} type="button" onClick={() => setSelectedIdType(t.value)}
                      className={`flex items-center gap-2.5 p-3 rounded-2xl border-2 text-left text-sm font-semibold transition-all ${
                        selectedIdType === t.value
                          ? "border-primary/70 bg-primary/10 text-primary"
                          : "border-border/40 bg-muted/20 text-muted-foreground hover:border-primary/40"
                      }`}>
                      <t.icon className="h-4 w-4 shrink-0" />{t.label}
                    </button>
                  ))}
                </div>
              </div>

              <PhotoUploadBox label="Front of ID"
                hint="All four corners visible, clear and well-lit."
                icon={CreditCard}
                onFile={f => uploadFile(f, "id-front", setUploadingFront, setIdFrontPreview, setIdFrontUploaded)}
                preview={idFrontPreview} loading={uploadingFront} accepted={idFrontUploaded}
                color={uploadColor}
              />

              {selectedIdType !== "passport" && (
                <PhotoUploadBox label="Back of ID"
                  hint="Upload the reverse side if applicable."
                  icon={CreditCard}
                  onFile={f => uploadFile(f, "id-back", setUploadingBack, setIdBackPreview, setIdBackUploaded)}
                  preview={idBackPreview} loading={uploadingBack} accepted={idBackUploaded}
                  color={uploadColor}
                />
              )}
            </div>
          </div>
        </motion.div>

        {/* ── SECTION 2: Selfie ─────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
          <div className={`rounded-3xl border-2 overflow-hidden ${selfieUploaded ? "border-success/60" : "border-[hsl(280,70%,55%)]/50"}`}
            style={{ background: "hsl(var(--card))" }}>

            <div className={`p-5 border-b-2 flex items-center justify-between ${
              selfieUploaded ? "border-success/20 bg-success/5" : "border-[hsl(280,70%,55%)]/20 bg-[hsl(280,70%,55%)]/5"
            }`}>
              <div className="flex items-center gap-3">
                <div className={`h-11 w-11 rounded-2xl border-2 flex items-center justify-center ${
                  selfieUploaded ? "border-success/50 bg-success/15" : "border-[hsl(280,70%,55%)]/40 bg-[hsl(280,70%,55%)]/10"
                }`}>
                  <ScanFace className={`h-5 w-5 ${selfieUploaded ? "text-success" : "text-[hsl(280,70%,55%)]"}`} />
                </div>
                <div>
                  <h2 className="font-bold text-base">Selfie / Face Photo</h2>
                  <p className="text-xs text-muted-foreground">A clear, unobstructed photo of your face</p>
                </div>
              </div>
              {selfieUploaded
                ? <Badge className="bg-success/15 text-success border-success/40 border gap-1"><CheckCircle className="h-3 w-3" />Complete</Badge>
                : <Badge variant="outline" className="text-xs border-[hsl(280,70%,55%)]/40 text-[hsl(280,70%,55%)]">Required</Badge>
              }
            </div>

            <div className="p-5 space-y-4">
              {/* Tips panel */}
              <div className="rounded-2xl border-2 border-warning/40 bg-warning/5 p-4 space-y-2">
                <p className="text-xs font-bold text-warning uppercase tracking-wide mb-2">📸 Selfie Requirements</p>
                {[
                  "Entire face visible — no sunglasses or hats",
                  "Good lighting — no shadows across your face",
                  "Neutral expression, looking directly at camera",
                  "Hold your ID next to your face for best results",
                ].map(tip => (
                  <div key={tip} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <CheckCircle className="h-3.5 w-3.5 text-success mt-0.5 shrink-0" />{tip}
                  </div>
                ))}
              </div>

              <PhotoUploadBox label="Upload Selfie"
                hint="Take a clear photo with your full face in frame."
                icon={Camera}
                onFile={f => uploadFile(f, "selfie", setUploadingSelfie, setSelfiePreview, setSelfieUploaded)}
                preview={selfiePreview} loading={uploadingSelfie} accepted={selfieUploaded}
                color={uploadColor}
              />
            </div>
          </div>
        </motion.div>

        {/* ── SECTION 3: Background Check ───────────────────────────── */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
          <div className={`rounded-3xl border-2 overflow-hidden ${
            bgComplete ? "border-success/60"
            : latestCheck?.status === "pending" ? "border-warning/60"
            : "border-destructive/40"
          }`} style={{ background: "hsl(var(--card))" }}>

            <div className={`p-5 border-b-2 flex items-center justify-between ${
              bgComplete ? "border-success/20 bg-success/5"
              : latestCheck?.status === "pending" ? "border-warning/20 bg-warning/5"
              : "border-destructive/20 bg-destructive/5"
            }`}>
              <div className="flex items-center gap-3">
                <div className={`h-11 w-11 rounded-2xl border-2 flex items-center justify-center ${
                  bgComplete ? "border-success/50 bg-success/15"
                  : latestCheck?.status === "pending" ? "border-warning/50 bg-warning/15"
                  : "border-destructive/40 bg-destructive/10"
                }`}>
                  <Shield className={`h-5 w-5 ${
                    bgComplete ? "text-success"
                    : latestCheck?.status === "pending" ? "text-warning"
                    : "text-destructive"
                  }`} />
                </div>
                <div>
                  <h2 className="font-bold text-base">Background Check</h2>
                  <p className="text-xs text-muted-foreground">National criminal & identity screening</p>
                </div>
              </div>
              {isLoading || profileLoading ? <Skeleton className="h-6 w-20" />
                : bgComplete ? <Badge className="bg-success/15 text-success border-success/40 border gap-1"><CheckCircle className="h-3 w-3" />Passed</Badge>
                : latestCheck?.status === "pending" ? <Badge className="bg-warning/15 text-warning border-warning/40 border gap-1"><Clock className="h-3 w-3" />Pending</Badge>
                : <Badge variant="outline" className="text-xs border-destructive/40 text-destructive">Not Started</Badge>
              }
            </div>

            <div className="p-5 space-y-5">
              {bgComplete && latestCheck ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-4 rounded-2xl border-2 border-success/40 bg-success/8">
                    <CheckCircle className="h-6 w-6 text-success shrink-0" />
                    <div>
                      <p className="font-bold text-success text-sm">Background check passed ✓</p>
                      {latestCheck.completed_at && (
                        <p className="text-xs text-muted-foreground">
                          Completed {format(new Date(latestCheck.completed_at), "MMM d, yyyy")}
                          {latestCheck.expires_at && ` · Expires ${format(new Date(latestCheck.expires_at), "MMM d, yyyy")}`}
                        </p>
                      )}
                    </div>
                  </div>
                  {latestCheck.report_url && (
                    <Button variant="outline" size="sm" asChild className="gap-2 rounded-xl border-2 border-success/40">
                      <a href={latestCheck.report_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3.5 w-3.5" />View Report
                      </a>
                    </Button>
                  )}
                </div>
              ) : latestCheck?.status === "pending" ? (
                <div className="flex items-center gap-3 p-4 rounded-2xl border-2 border-warning/40 bg-warning/8">
                  <Clock className="h-6 w-6 text-warning shrink-0" />
                  <div>
                    <p className="font-bold text-warning text-sm">Check in progress</p>
                    <p className="text-xs text-muted-foreground">Usually 2–5 business days. We'll email you with results.</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* What's included */}
                  <div className="rounded-2xl border-2 border-primary/30 bg-primary/5 p-4 space-y-2">
                    <p className="text-xs font-bold text-primary uppercase tracking-wide mb-2">🔍 What's included:</p>
                    {[
                      "National criminal record search",
                      "Sex offender registry check",
                      "Identity verification",
                      "County court records (7 years)",
                    ].map(item => (
                      <div key={item} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <CheckCircle className="h-3.5 w-3.5 text-success shrink-0" />{item}
                      </div>
                    ))}
                  </div>

                  {/* Consent toggle */}
                  <div className={`rounded-2xl border-2 p-4 transition-all ${bgConsentGiven ? "border-success/50 bg-success/5" : "border-border/50 bg-muted/20"}`}>
                    <div className="flex items-start gap-4">
                      <Switch checked={bgConsentGiven} onCheckedChange={setBgConsentGiven} className="mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-bold leading-tight">I authorize PureTask to conduct a background check</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          By enabling this, you authorize PureTask and its partners to conduct a comprehensive background check. Results are confidential and only used to verify your eligibility.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Name confirmation */}
                  <AnimatePresence>
                    {bgConsentGiven && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }} className="space-y-3 overflow-hidden">
                        <div className="space-y-2">
                          <Label className="text-sm font-bold">Type your full legal name to confirm</Label>
                          <p className="text-xs text-muted-foreground">
                            Please type:{" "}
                            <span className="font-bold text-foreground">
                              {profile?.first_name ? `${profile.first_name} ${profile.last_name || ""}`.trim() : "your full name"}
                            </span>
                          </p>
                          <Input
                            placeholder="Type your full legal name…"
                            value={bgConsentName}
                            onChange={e => setBgConsentName(e.target.value)}
                            className={`rounded-xl border-2 ${bgConsentName && profile?.first_name &&
                              bgConsentName.trim().toLowerCase() === `${profile.first_name} ${profile.last_name || ""}`.trim().toLowerCase()
                              ? "border-success/60 ring-1 ring-success/30" : "border-border/50"}`}
                          />
                          {bgConsentName && profile?.first_name &&
                            bgConsentName.trim().toLowerCase() === `${profile.first_name} ${profile.last_name || ""}`.trim().toLowerCase() && (
                            <p className="text-xs text-success flex items-center gap-1 font-semibold">
                              <CheckCircle className="h-3.5 w-3.5" />Name confirmed ✓
                            </p>
                          )}
                        </div>

                        <Button
                          onClick={handleBgSubmit}
                          disabled={submittingBg || isRequesting || !bgConsentName.trim()}
                          className="w-full rounded-2xl h-12 gap-2 font-bold border-0"
                          style={{ background: "linear-gradient(135deg, hsl(var(--destructive)), hsl(var(--primary)))" }}
                        >
                          {submittingBg || isRequesting
                            ? <><Loader2 className="h-4 w-4 animate-spin" />Submitting…</>
                            : <><Shield className="h-4 w-4" />Submit Background Check</>
                          }
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* ── SECURITY FOOTER ───────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="rounded-3xl border-2 border-[hsl(280,70%,55%)]/50 overflow-hidden"
            style={{ background: "linear-gradient(135deg, hsl(280,70%,18%) 0%, hsl(210,100%,22%) 100%)" }}>
            <div className="p-7 text-center">
              <div className="h-14 w-14 rounded-2xl border-2 border-white/20 bg-white/10 flex items-center justify-center mx-auto mb-4">
                <Lock className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-black text-white mb-1">Your Data is Secure</h3>
              <p className="text-white/60 text-sm max-w-md mx-auto">
                All documents are encrypted with AES-256 and stored securely. We never share your information with third parties without your explicit consent.
              </p>
              <div className="flex gap-3 justify-center mt-4">
                {["AES-256", "Zero-Share", "GDPR Ready"].map(tag => (
                  <div key={tag} className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-white/70 font-semibold">{tag}</div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </CleanerLayout>
  );
}
