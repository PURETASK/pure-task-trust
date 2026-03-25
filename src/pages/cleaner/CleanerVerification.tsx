import { useState, useRef } from "react";
import { CleanerLayout } from "@/components/cleaner/CleanerLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  BadgeCheck, ScanFace
} from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

// ── ID Document Type Selector ─────────────────────────────────────────
const ID_TYPES = [
  { value: "drivers_license", label: "Driver's License", icon: CreditCard },
  { value: "passport", label: "Passport", icon: FileCheck },
  { value: "state_id", label: "State / National ID", icon: BadgeCheck },
  { value: "other", label: "Other Government ID", icon: Shield },
];

// ── Photo Upload Box ──────────────────────────────────────────────────
function PhotoUploadBox({
  label, hint, icon: Icon, onFile, preview, loading, accepted
}: {
  label: string;
  hint: string;
  icon: React.ElementType;
  onFile: (f: File) => void;
  preview?: string | null;
  loading?: boolean;
  accepted?: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className="space-y-2">
      <Label className="text-sm font-semibold">{label}</Label>
      <p className="text-xs text-muted-foreground">{hint}</p>
      <div
        onClick={() => !loading && ref.current?.click()}
        className={`relative cursor-pointer rounded-2xl border-2 border-dashed transition-all overflow-hidden
          ${accepted ? "border-success/50 bg-success/5" : "border-border/60 bg-muted/30 hover:border-primary/40 hover:bg-primary/5"}`}
        style={{ minHeight: 160 }}
      >
        {preview ? (
          <img src={preview} alt={label} className="w-full h-full object-cover" style={{ maxHeight: 200 }} />
        ) : (
          <div className="flex flex-col items-center justify-center py-10 gap-3">
            <div className={`h-14 w-14 rounded-2xl flex items-center justify-center ${accepted ? "bg-success/20" : "bg-muted"}`}>
              {accepted
                ? <CheckCircle className="h-7 w-7 text-success" />
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
          <div className="absolute top-2 right-2 h-7 w-7 rounded-full bg-success flex items-center justify-center shadow-lg">
            <CheckCircle className="h-4 w-4 text-white" />
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

export default function CleanerVerification() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { profile, isLoading: profileLoading } = useCleanerProfile();
  const { latestCheck, isVerified, isLoading, requestCheck } = useBackgroundChecks();
  const isRequesting = requestCheck.isPending;

  // ID verification state
  const [selectedIdType, setSelectedIdType] = useState("drivers_license");
  const [idFrontPreview, setIdFrontPreview] = useState<string | null>(null);
  const [idBackPreview, setIdBackPreview] = useState<string | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [uploadingFront, setUploadingFront] = useState(false);
  const [uploadingBack, setUploadingBack] = useState(false);
  const [uploadingSelfie, setUploadingSelfie] = useState(false);
  const [idFrontUploaded, setIdFrontUploaded] = useState(false);
  const [idBackUploaded, setIdBackUploaded] = useState(false);
  const [selfieUploaded, setSelfieUploaded] = useState(false);

  // Background check state
  const [bgConsentGiven, setBgConsentGiven] = useState(false);
  const [bgConsentName, setBgConsentName] = useState("");
  const [submittingBg, setSubmittingBg] = useState(false);

  const uploadFile = async (
    file: File,
    path: string,
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
      const { error } = await supabase.storage
        .from("identity-documents")
        .upload(filePath, file, { upsert: true });

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
    const fullName = profile?.first_name
      ? `${profile.first_name} ${profile.last_name || ""}`.trim()
      : "";
    if (!bgConsentGiven) {
      toast({ title: "Consent required", description: "Please enable the consent toggle.", variant: "destructive" });
      return;
    }
    if (!bgConsentName.trim()) {
      toast({ title: "Name required", description: "Please type your full name to confirm.", variant: "destructive" });
      return;
    }
    if (bgConsentName.trim().toLowerCase() !== fullName.toLowerCase() && fullName) {
      toast({ title: "Name doesn't match", description: "Please type your name exactly as it appears on your profile.", variant: "destructive" });
      return;
    }
    setSubmittingBg(true);
    try {
      await requestCheck.mutateAsync("checkr");
      toast({ title: "Background check submitted ✓", description: "We'll notify you when your results are ready." });
    } catch (e: any) {
      toast({ title: "Submission failed", description: e.message, variant: "destructive" });
    } finally {
      setSubmittingBg(false);
    }
  };

  const idComplete = idFrontUploaded && selfieUploaded;
  const bgComplete = isVerified;

  return (
    <CleanerLayout>
      <div className="max-w-2xl mx-auto space-y-6 pb-12">

        {/* ── Page Header ─────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className={`relative overflow-hidden rounded-3xl p-8 border ${idComplete && bgComplete
            ? "bg-gradient-to-br from-success/10 to-emerald-500/5 border-success/30"
            : "bg-gradient-to-br from-primary/10 to-violet-500/5 border-primary/30"}`}>
            <div className="flex items-center gap-5">
              <div className={`h-20 w-20 rounded-3xl flex items-center justify-center shadow-lg flex-shrink-0 ${idComplete && bgComplete
                ? "bg-gradient-to-br from-success to-emerald-600 shadow-success/25"
                : "bg-gradient-to-br from-primary to-violet-600 shadow-primary/25"}`}>
                <Shield className="h-10 w-10 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-bold">Identity Verification</h1>
                  {idComplete && bgComplete && (
                    <Badge className="bg-success/20 text-success border-success/30">
                      <CheckCircle className="h-3.5 w-3.5 mr-1" />Fully Verified
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground text-sm">
                  Verify your identity to unlock higher booking rates and build client trust.
                  Your documents are encrypted and never shared without your consent.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Benefits ─────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: "3×", label: "More Bookings", color: "text-primary" },
            { value: "Top", label: "Search Rank", color: "text-success" },
            { value: "VIP", label: "Trust Badge", color: "text-violet-500" },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.08 }}>
              <Card className="border-border/60 text-center">
                <CardContent className="p-4">
                  <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* ── SECTION 1: Identity Document ─────────────────────── */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
          <Card className={`border-2 ${idComplete ? "border-success/40 bg-success/5" : "border-border/60"}`}>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Government ID</CardTitle>
                    <CardDescription className="text-xs">Upload a valid photo ID</CardDescription>
                  </div>
                </div>
                {idComplete
                  ? <Badge className="bg-success/10 text-success border-success/30"><CheckCircle className="h-3 w-3 mr-1" />Complete</Badge>
                  : <Badge variant="outline" className="text-xs">Required</Badge>
                }
              </div>
            </CardHeader>
            <CardContent className="space-y-5">

              {/* ID Type selector */}
              <div>
                <Label className="text-sm font-semibold mb-3 block">Select ID Type</Label>
                <div className="grid grid-cols-2 gap-2">
                  {ID_TYPES.map(t => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setSelectedIdType(t.value)}
                      className={`flex items-center gap-2.5 p-3 rounded-xl border text-left text-sm font-medium transition-all ${selectedIdType === t.value
                        ? "border-primary bg-primary/10 text-primary shadow-sm"
                        : "border-border/60 bg-muted/30 text-muted-foreground hover:border-primary/40"}`}
                    >
                      <t.icon className="h-4 w-4 shrink-0" />
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Front of ID */}
              <PhotoUploadBox
                label="Front of ID"
                hint="Make sure all four corners are visible and the image is clear and well-lit."
                icon={CreditCard}
                onFile={f => uploadFile(f, "id-front", setUploadingFront, setIdFrontPreview, setIdFrontUploaded)}
                preview={idFrontPreview}
                loading={uploadingFront}
                accepted={idFrontUploaded}
              />

              {/* Back of ID (not required for passport) */}
              {selectedIdType !== "passport" && (
                <PhotoUploadBox
                  label="Back of ID"
                  hint="Upload the back side of your ID if applicable."
                  icon={CreditCard}
                  onFile={f => uploadFile(f, "id-back", setUploadingBack, setIdBackPreview, setIdBackUploaded)}
                  preview={idBackPreview}
                  loading={uploadingBack}
                  accepted={idBackUploaded}
                />
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* ── SECTION 2: Selfie ────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
          <Card className={`border-2 ${selfieUploaded ? "border-success/40 bg-success/5" : "border-border/60"}`}>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-xl bg-accent flex items-center justify-center">
                    <Camera className="h-5 w-5 text-accent-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Selfie Photo</CardTitle>
                    <CardDescription className="text-xs">A clear photo of your face</CardDescription>
                  </div>
                </div>
                {selfieUploaded
                  ? <Badge className="bg-success/10 text-success border-success/30"><CheckCircle className="h-3 w-3 mr-1" />Complete</Badge>
                  : <Badge variant="outline" className="text-xs">Required</Badge>
                }
              </div>
            </CardHeader>
            <CardContent className="space-y-4">

              {/* Selfie tips */}
              <div className="rounded-xl bg-muted/40 border border-border/60 p-4 space-y-2">
                <p className="text-xs font-semibold text-foreground mb-2">📸 Selfie Requirements</p>
                {[
                  "Your entire face must be visible — no sunglasses or hats",
                  "Good lighting — no shadows across your face",
                  "Neutral expression, looking directly at the camera",
                  "Hold your ID next to your face for best results",
                ].map(tip => (
                  <div key={tip} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <CheckCircle className="h-3.5 w-3.5 text-success mt-0.5 shrink-0" />
                    {tip}
                  </div>
                ))}
              </div>

              <PhotoUploadBox
                label="Upload Selfie"
                hint="Take a clear photo with your face fully in frame."
                icon={Camera}
                onFile={f => uploadFile(f, "selfie", setUploadingSelfie, setSelfiePreview, setSelfieUploaded)}
                preview={selfiePreview}
                loading={uploadingSelfie}
                accepted={selfieUploaded}
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* ── SECTION 3: Background Check ──────────────────────── */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
          <Card className={`border-2 ${bgComplete ? "border-success/40 bg-success/5" : latestCheck?.status === "pending" ? "border-warning/40 bg-warning/5" : "border-border/60"}`}>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-xl bg-destructive/10 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-destructive" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Background Check</CardTitle>
                    <CardDescription className="text-xs">National criminal & identity screening</CardDescription>
                  </div>
                </div>
                {isLoading || profileLoading
                  ? <Skeleton className="h-6 w-20" />
                  : bgComplete
                  ? <Badge className="bg-success/10 text-success border-success/30"><CheckCircle className="h-3 w-3 mr-1" />Passed</Badge>
                  : latestCheck?.status === "pending"
                  ? <Badge className="bg-warning/10 text-warning border-warning/30"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
                  : <Badge variant="outline" className="text-xs">Not Started</Badge>
                }
              </div>
            </CardHeader>
            <CardContent className="space-y-5">

              {/* If already verified */}
              {bgComplete && latestCheck ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-success/10 border border-success/30">
                    <CheckCircle className="h-6 w-6 text-success shrink-0" />
                    <div>
                      <p className="font-semibold text-success text-sm">Background check passed</p>
                      {latestCheck.completed_at && (
                        <p className="text-xs text-muted-foreground">
                          Completed {format(new Date(latestCheck.completed_at), "MMM d, yyyy")}
                          {latestCheck.expires_at && ` · Expires ${format(new Date(latestCheck.expires_at), "MMM d, yyyy")}`}
                        </p>
                      )}
                    </div>
                  </div>
                  {latestCheck.report_url && (
                    <Button variant="outline" size="sm" asChild className="gap-2">
                      <a href={latestCheck.report_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3.5 w-3.5" />View Report
                      </a>
                    </Button>
                  )}
                </div>
              ) : latestCheck?.status === "pending" ? (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-warning/10 border border-warning/30">
                  <Clock className="h-6 w-6 text-warning shrink-0" />
                  <div>
                    <p className="font-semibold text-warning text-sm">Check in progress</p>
                    <p className="text-xs text-muted-foreground">Usually takes 2–5 business days. We'll email you with results.</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* What's included info */}
                  <div className="rounded-xl bg-muted/40 border border-border/60 p-4 space-y-2">
                    <p className="text-xs font-semibold mb-2">🔍 What's included in your background check:</p>
                    {[
                      "National criminal record search",
                      "Sex offender registry check",
                      "Identity verification",
                      "County court records (7 years)",
                    ].map(item => (
                      <div key={item} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <CheckCircle className="h-3.5 w-3.5 text-success shrink-0" />
                        {item}
                      </div>
                    ))}
                  </div>

                  {/* Consent toggle */}
                  <div className={`rounded-xl border-2 p-4 transition-all ${bgConsentGiven ? "border-success/40 bg-success/5" : "border-border/60 bg-muted/20"}`}>
                    <div className="flex items-start gap-4">
                      <Switch
                        checked={bgConsentGiven}
                        onCheckedChange={setBgConsentGiven}
                        className="mt-0.5"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-semibold leading-tight">
                          I authorize PureTask to conduct a background check
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          By enabling this, you authorize PureTask and its partners to conduct a comprehensive background check using the information you've provided. Results are confidential and only used to verify your eligibility as an independent contractor.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Name confirmation */}
                  <AnimatePresence>
                    {bgConsentGiven && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-3 overflow-hidden"
                      >
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold">
                            Type your full legal name to confirm
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            Please type:{" "}
                            <span className="font-semibold text-foreground">
                              {profile?.first_name
                                ? `${profile.first_name} ${profile.last_name || ""}`.trim()
                                : "your full name"}
                            </span>
                          </p>
                          <Input
                            placeholder="Type your full legal name…"
                            value={bgConsentName}
                            onChange={e => setBgConsentName(e.target.value)}
                            className={`rounded-xl ${bgConsentName && profile?.first_name &&
                              bgConsentName.trim().toLowerCase() === `${profile.first_name} ${profile.last_name || ""}`.trim().toLowerCase()
                              ? "border-success ring-1 ring-success/30"
                              : ""}`}
                          />
                          {bgConsentName && profile?.first_name &&
                            bgConsentName.trim().toLowerCase() === `${profile.first_name} ${profile.last_name || ""}`.trim().toLowerCase() && (
                            <p className="text-xs text-success flex items-center gap-1">
                              <CheckCircle className="h-3.5 w-3.5" />Name confirmed
                            </p>
                          )}
                        </div>

                        <Button
                          onClick={handleBgSubmit}
                          disabled={submittingBg || isRequesting || !bgConsentName.trim()}
                          className="w-full rounded-xl h-11 gap-2 bg-gradient-to-r from-rose-500 to-primary font-semibold"
                        >
                          {submittingBg || isRequesting ? (
                            <><Loader2 className="h-4 w-4 animate-spin" />Submitting…</>
                          ) : (
                            <><Shield className="h-4 w-4" />Submit Background Check</>
                          )}
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Security footer ───────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <Card className="overflow-hidden border-0">
            <div className="bg-gradient-to-br from-primary to-violet-600 p-7 text-white text-center">
              <Lock className="h-10 w-10 mx-auto mb-3 opacity-80" />
              <h3 className="text-xl font-bold mb-1">Your Data is Secure</h3>
              <p className="text-white/75 text-sm max-w-md mx-auto">
                All documents are encrypted with AES-256 and stored securely. We never share your information with third parties without your explicit consent.
              </p>
            </div>
          </Card>
        </motion.div>

      </div>
    </CleanerLayout>
  );
}
