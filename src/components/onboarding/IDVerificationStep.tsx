import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Upload, CheckCircle2, ArrowLeft, ArrowRight, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

interface IDVerificationStepProps {
  onSubmit: (params: { file: File; documentType: string }) => Promise<void>;
  onBack: () => void;
  isSubmitting: boolean;
}

const DOCUMENT_TYPES = [
  { value: 'drivers_license', label: "Driver's License", icon: '🪪' },
  { value: 'passport', label: 'Passport', icon: '📘' },
  { value: 'state_id', label: 'State ID', icon: '🪪' },
];

export function IDVerificationStep({ onSubmit, onBack, isSubmitting }: IDVerificationStepProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [documentType, setDocumentType] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp', 'application/pdf'].includes(file.type)) { toast({ title: 'Invalid file type', description: 'Please upload an image or PDF.', variant: 'destructive' }); return; }
    if (file.size > 10 * 1024 * 1024) { toast({ title: 'File too large', description: 'Please select a file under 10MB.', variant: 'destructive' }); return; }
    setSelectedFile(file); setFileName(file.name);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.3 }} className="space-y-5">
      <div>
        <p className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-1">Step 5 of 10</p>
        <h2 className="text-2xl font-bold text-white">Verify your identity</h2>
        <p className="text-white/60 text-sm mt-1">A government-issued ID lets clients know exactly who's coming to their home.</p>
      </div>

      <div className="space-y-1.5">
        <Label className="text-white/70 text-xs font-medium uppercase tracking-wide">Document type</Label>
        <Select value={documentType} onValueChange={setDocumentType}>
          <SelectTrigger className="h-12 rounded-xl bg-white/10 border-white/20 text-white data-[placeholder]:text-white/40 focus:border-green-400">
            <SelectValue placeholder="Choose your document type…" />
          </SelectTrigger>
          <SelectContent>
            {DOCUMENT_TYPES.map(t => (
              <SelectItem key={t.value} value={t.value}>
                <span className="flex items-center gap-2"><span>{t.icon}</span><span>{t.label}</span></span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div
        onClick={() => fileInputRef.current?.click()}
        className="flex flex-col items-center justify-center rounded-2xl cursor-pointer p-8 text-center transition-all"
        style={{ border: `2px dashed ${selectedFile ? 'rgba(74,222,128,0.5)' : 'rgba(255,255,255,0.15)'}`, background: selectedFile ? 'rgba(74,222,128,0.06)' : 'rgba(255,255,255,0.04)' }}
      >
        {selectedFile ? (
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center gap-2">
            <CheckCircle2 className="h-10 w-10 text-green-400" />
            <p className="font-semibold text-sm text-white">{fileName}</p>
            <p className="text-xs text-white/40">Click to change document</p>
          </motion.div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="h-14 w-14 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <Upload className="h-7 w-7 text-white/40" />
            </div>
            <div>
              <p className="font-semibold text-sm text-white/80">Upload your document</p>
              <p className="text-xs text-white/40 mt-0.5">JPG, PNG or PDF — max 10MB</p>
            </div>
          </div>
        )}
        <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={handleFileSelect} className="hidden" />
      </div>

      <div className="flex items-start gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <Lock className="h-4 w-4 text-white/40 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-white/50"><span className="text-white/80 font-semibold">Encrypted & private.</span> Your ID is only used for identity verification and is never shown to clients.</p>
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting} className="h-12 rounded-xl border-white/20 bg-white/5 text-white hover:bg-white/10 px-5"><ArrowLeft className="h-4 w-4" /></Button>
        <Button onClick={async () => { if (selectedFile && documentType) { try { await onSubmit({ file: selectedFile, documentType }); } catch (e: any) { toast({ title: 'Upload failed', description: e.message, variant: 'destructive' }); } } }} disabled={!selectedFile || !documentType || isSubmitting} className="flex-1 h-12 font-semibold rounded-xl bg-green-500 hover:bg-green-400 text-white border-0">
          {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Uploading…</> : <><span>Continue</span><ArrowRight className="h-4 w-4 ml-2" /></>}
        </Button>
      </div>
    </motion.div>
  );
}
