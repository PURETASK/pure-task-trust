import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Loader2, ArrowLeft, ArrowRight, Upload, CheckCircle2, Lock,
  ShieldCheck, TrendingUp, Star, ScanFace,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useConsentLogger } from '@/hooks/useConsentLogger';
import { LEGAL_CONSTANTS } from '@/lib/legal-constants';

type SubStep = 'id' | 'accurate' | 'fcra';

interface VerificationPhaseProps {
  onSaveIdDocument: (data: { file: File; documentType: string }) => Promise<void>;
  isSavingIdDocument: boolean;
  onSaveBackgroundConsent: () => Promise<void>;
  isSavingBackgroundConsent: boolean;
  onComplete: () => void;
  onBack: () => void;
}

const DOC_TYPES = [
  { value: 'drivers_license', label: "Driver's License", icon: '🪪' },
  { value: 'passport', label: 'Passport', icon: '📘' },
  { value: 'state_id', label: 'State ID', icon: '🪪' },
];

const BENEFITS = [
  { icon: TrendingUp, text: 'Verified cleaners get 4× more bookings' },
  { icon: Star, text: 'Unlock the "Verified Pro" badge' },
  { icon: ShieldCheck, text: 'Clients trust you before you arrive' },
];

export function VerificationPhase({
  onSaveIdDocument, isSavingIdDocument,
  onSaveBackgroundConsent, isSavingBackgroundConsent,
  onComplete, onBack,
}: VerificationPhaseProps) {
  const [sub, setSub] = useState<SubStep>('id');
  const logConsent = useConsentLogger();

  // ID state
  const fileRef = useRef<HTMLInputElement>(null);
  const [docType, setDocType] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');

  // Consent state
  const [fcra, setFcra] = useState(false);
  const [accurate, setAccurate] = useState(false);
  const [fcraSignature, setFcraSignature] = useState('');

  const btnCls = 'h-12 rounded-xl border-0 font-semibold text-white';
  const gradientBtn = { background: 'linear-gradient(135deg, #ec4899, #a855f7)' };
  const backBtn = 'h-12 rounded-xl border-white/15 bg-white/5 text-white hover:bg-white/10 px-5';

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp', 'application/pdf'].includes(file.type)) { toast.error('Upload an image or PDF'); return; }
    if (file.size > 10 * 1024 * 1024) { toast.error('Max 10MB'); return; }
    setSelectedFile(file);
    setFileName(file.name);
  };

  const SUBS: SubStep[] = ['id', 'accurate', 'fcra'];
  const subIdx = SUBS.indexOf(sub);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 mb-1">
        {SUBS.map((s, i) => (
          <div key={s} className="h-1.5 rounded-full transition-all duration-300"
            style={{ width: i === subIdx ? 32 : i < subIdx ? 32 : 12, background: i < subIdx ? '#ec4899' : i === subIdx ? '#f472b6' : 'rgba(255,255,255,0.15)' }} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* ── ID Upload ── */}
        {sub === 'id' && (
          <motion.div key="id" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-white">Verify your identity</h2>
              <p className="text-white/50 text-sm mt-1">Upload a government-issued ID for client trust.</p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-white/60 text-xs font-medium uppercase tracking-wide">Document type</Label>
              <Select value={docType} onValueChange={setDocType}>
                <SelectTrigger className="h-12 rounded-xl bg-white/8 border-white/15 text-white data-[placeholder]:text-white/30 focus:border-destructive">
                  <SelectValue placeholder="Choose document type…" />
                </SelectTrigger>
                <SelectContent>
                  {DOC_TYPES.map(t => <SelectItem key={t.value} value={t.value}><span className="flex items-center gap-2">{t.icon} {t.label}</span></SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div
              onClick={() => fileRef.current?.click()}
              className="flex flex-col items-center justify-center rounded-2xl cursor-pointer p-8 text-center transition-all"
              style={{ border: `2px dashed ${selectedFile ? 'rgba(244,114,182,0.5)' : 'rgba(255,255,255,0.12)'}`, background: selectedFile ? 'rgba(244,114,182,0.06)' : 'rgba(255,255,255,0.03)' }}
            >
              {selectedFile ? (
                <div className="flex flex-col items-center gap-2">
                  <CheckCircle2 className="h-8 w-8 text-destructive" />
                  <p className="font-semibold text-sm text-white">{fileName}</p>
                  <p className="text-xs text-white/30">Click to change</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <Upload className="h-6 w-6 text-white/30" />
                  </div>
                  <p className="text-sm text-white/60 font-medium">Upload your document</p>
                  <p className="text-xs text-white/30">JPG, PNG or PDF — max 10MB</p>
                </div>
              )}
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={handleFileSelect} className="hidden" />
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <Lock className="h-4 w-4 text-white/30 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-white/40"><span className="text-white/60 font-semibold">Encrypted & private.</span> Never shown to clients.</p>
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={onBack} className={backBtn}><ArrowLeft className="h-4 w-4" /></Button>
              <Button
                onClick={async () => {
                  if (selectedFile && docType) {
                    try { await onSaveIdDocument({ file: selectedFile, documentType: docType }); setSub('accurate'); }
                    catch { /* error already toasted */ }
                  }
                }}
                disabled={!selectedFile || !docType || isSavingIdDocument}
                className={`flex-1 ${btnCls}`} style={gradientBtn}
              >
                {isSavingIdDocument ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Uploading…</> : <><span>Next: Accuracy Attestation</span><ArrowRight className="h-4 w-4 ml-2" /></>}
              </Button>
            </div>
          </motion.div>
        )}

        {/* ── Information Accuracy Attestation (kept OUT of the FCRA disclosure) ── */}
        {sub === 'accurate' && (
          <motion.div key="accurate" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-white">Information accuracy</h2>
              <p className="text-white/50 text-sm mt-1">Before we run a background check, confirm everything you've told us is correct.</p>
            </div>

            <div className="grid gap-2">
              {BENEFITS.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3 px-4 py-2.5 rounded-xl" style={{ background: 'rgba(244,114,182,0.06)', border: '1px solid rgba(244,114,182,0.2)' }}>
                  <Icon className="h-4 w-4 text-destructive flex-shrink-0" />
                  <span className="text-sm text-white/70 font-medium">{text}</span>
                </div>
              ))}
            </div>

            <label htmlFor="accurate" className="flex items-start gap-3 px-4 py-3 rounded-xl cursor-pointer hover:bg-white/5 transition-colors" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
              <Checkbox id="accurate" checked={accurate} onCheckedChange={c => setAccurate(c === true)} className="mt-0.5 border-white/20 data-[state=checked]:bg-destructive data-[state=checked]:border-destructive" />
              <span className="text-sm text-white/70 leading-relaxed">
                I certify that all information I have provided to PureTask is true, accurate, and complete to the best of my knowledge. I understand that providing false information may result in account termination.
              </span>
            </label>

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setSub('id')} className={backBtn}><ArrowLeft className="h-4 w-4" /></Button>
              <Button
                onClick={() => setSub('fcra')}
                disabled={!accurate}
                className={`flex-1 ${btnCls}`} style={gradientBtn}
              >
                <span>Next: Background Check Disclosure</span><ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* ── FCRA Standalone Disclosure & Authorization (FCRA §604(b)(2)(A)) ── */}
        {/*    This screen MUST contain solely the FCRA disclosure + authorization. */}
        {/*    Do NOT add benefits, marketing, other consents, or unrelated copy. */}
        {sub === 'fcra' && (
          <motion.div key="fcra" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-white">Disclosure Regarding Background Investigation</h2>
              <p className="text-white/50 text-sm mt-1">Required by the Fair Credit Reporting Act. Read carefully — this page contains only this disclosure.</p>
            </div>

            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="flex items-center gap-2 px-4 py-2.5" style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <ScanFace className="h-4 w-4 text-white/50" />
                <span className="text-white/70 font-semibold text-sm">FCRA Disclosure & Authorization (v{LEGAL_CONSTANTS.DOCUMENT_VERSIONS.FCRA_DISCLOSURE})</span>
              </div>
              <ScrollArea className="h-64 px-4 py-3">
                <div className="text-xs text-white/60 space-y-2.5 leading-relaxed">
                  <p className="text-white/80 font-semibold">Disclosure</p>
                  <p>PureTask LLC ("PureTask") may obtain information about you from a third-party consumer reporting agency in connection with your engagement as an independent contractor. Thus, you may be the subject of a "consumer report" and/or an "investigative consumer report" which may include information about your character, general reputation, personal characteristics, and mode of living.</p>
                  <p>These reports may contain information regarding your criminal history, sex-offender registry status, social security number verification, motor vehicle records, address history, and verification of education or employment history. The scope of this notice and authorization is all-encompassing and authorizes PureTask to obtain any and all background information, however collected, except as otherwise prohibited by applicable law.</p>
                  <p>You may request a copy of the report and may inspect and dispute its accuracy and completeness by contacting the consumer reporting agency identified at the time of the report.</p>
                  <p className="text-white/80 font-semibold pt-1">Authorization</p>
                  <p>I have read the foregoing Disclosure carefully. I authorize PureTask LLC and its designated agents, including its consumer reporting agency, to procure a consumer report and/or investigative consumer report about me, on a one-time or ongoing basis during my engagement with PureTask.</p>
                  <p>I understand this authorization will remain on file and serve as ongoing authorization for PureTask to procure such reports during my engagement.</p>
                </div>
              </ScrollArea>
              <label htmlFor="fcra" className="flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-white/5 transition-colors" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <Checkbox id="fcra" checked={fcra} onCheckedChange={c => setFcra(c === true)} className="mt-0.5 border-white/20 data-[state=checked]:bg-destructive data-[state=checked]:border-destructive" />
                <span className="text-sm text-white/80 leading-relaxed font-medium">
                  I have read and understand the above FCRA Disclosure and I authorize PureTask LLC to procure a consumer report and/or investigative consumer report about me.
                </span>
              </label>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="fcra-sig" className="text-white/60 text-xs font-medium uppercase tracking-wide">Type your full legal name as your electronic signature</Label>
              <input
                id="fcra-sig"
                type="text"
                value={fcraSignature}
                onChange={(e) => setFcraSignature(e.target.value)}
                placeholder="Full legal name"
                className="w-full h-12 px-4 rounded-xl bg-white/8 border border-white/15 text-white placeholder:text-white/30 focus:border-destructive focus:outline-none"
              />
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setSub('accurate')} className={backBtn}><ArrowLeft className="h-4 w-4" /></Button>
              <Button
                onClick={async () => {
                  try {
                    await onSaveBackgroundConsent();
                    await logConsent({
                      documentType: 'fcra_disclosure',
                      documentVersion: LEGAL_CONSTANTS.DOCUMENT_VERSIONS.FCRA_DISCLOSURE,
                      consentGiven: true,
                      exactTextShown: `Standalone FCRA disclosure & authorization signed by: ${fcraSignature.trim()}. I authorize PureTask LLC to procure a consumer report and/or investigative consumer report about me on a one-time or ongoing basis during my engagement.`,
                      method: 'signup_clickwrap',
                    });
                    onComplete();
                  }
                  catch { /* error already toasted */ }
                }}
                disabled={!fcra || fcraSignature.trim().length < 3 || isSavingBackgroundConsent}
                className={`flex-1 ${btnCls}`} style={gradientBtn}
              >
                {isSavingBackgroundConsent ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving…</> : <><span>Authorize & Continue</span><ArrowRight className="h-4 w-4 ml-2" /></>}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
