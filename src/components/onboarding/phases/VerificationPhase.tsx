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

type SubStep = 'id' | 'consent';

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

  // ID state
  const fileRef = useRef<HTMLInputElement>(null);
  const [docType, setDocType] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');

  // Consent state
  const [fcra, setFcra] = useState(false);
  const [accurate, setAccurate] = useState(false);

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

  const SUBS: SubStep[] = ['id', 'consent'];
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
                <SelectTrigger className="h-12 rounded-xl bg-white/8 border-white/15 text-white data-[placeholder]:text-white/30 focus:border-pink-400">
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
                  <CheckCircle2 className="h-8 w-8 text-pink-400" />
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
                    try { await onSaveIdDocument({ file: selectedFile, documentType: docType }); setSub('consent'); }
                    catch {} // error already toasted
                  }
                }}
                disabled={!selectedFile || !docType || isSavingIdDocument}
                className={`flex-1 ${btnCls}`} style={gradientBtn}
              >
                {isSavingIdDocument ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Uploading…</> : <><span>Next: Background Check</span><ArrowRight className="h-4 w-4 ml-2" /></>}
              </Button>
            </div>
          </motion.div>
        )}

        {/* ── Background Consent ── */}
        {sub === 'consent' && (
          <motion.div key="consent" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-white">Background check consent</h2>
              <p className="text-white/50 text-sm mt-1">This directly benefits your booking rate.</p>
            </div>

            <div className="grid gap-2">
              {BENEFITS.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3 px-4 py-2.5 rounded-xl" style={{ background: 'rgba(244,114,182,0.06)', border: '1px solid rgba(244,114,182,0.2)' }}>
                  <Icon className="h-4 w-4 text-pink-400 flex-shrink-0" />
                  <span className="text-sm text-white/70 font-medium">{text}</span>
                </div>
              ))}
            </div>

            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="flex items-center gap-2 px-4 py-2.5" style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <ScanFace className="h-4 w-4 text-white/50" />
                <span className="text-white/70 font-semibold text-sm">FCRA Disclosure</span>
              </div>
              <ScrollArea className="h-28 px-4 py-2.5">
                <div className="text-xs text-white/35 space-y-2 leading-relaxed">
                  <p>PureTask may obtain information about you from a third-party consumer reporting agency for employment purposes. You may be the subject of a "consumer report" which may include information about your character, general reputation, personal characteristics, and mode of living.</p>
                  <p>These reports may contain information regarding criminal history, social security verification, motor vehicle records, and verification of education or employment history.</p>
                </div>
              </ScrollArea>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                {[
                  { id: 'fcra', state: fcra, set: setFcra, label: 'I authorize PureTask to obtain a consumer report about me.' },
                  { id: 'accurate', state: accurate, set: setAccurate, label: 'I certify all information I have provided is true and accurate.' },
                ].map(({ id, state, set, label }) => (
                  <label key={id} htmlFor={id} className="flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-white/5 transition-colors" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                    <Checkbox id={id} checked={state} onCheckedChange={c => set(c === true)} className="mt-0.5 border-white/20 data-[state=checked]:bg-pink-500 data-[state=checked]:border-pink-500" />
                    <span className="text-sm text-white/60 leading-relaxed">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setSub('id')} className={backBtn}><ArrowLeft className="h-4 w-4" /></Button>
              <Button
                onClick={async () => {
                  try { await onSaveBackgroundConsent(); onComplete(); }
                  catch {} // error already toasted
                }}
                disabled={!fcra || !accurate || isSavingBackgroundConsent}
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
