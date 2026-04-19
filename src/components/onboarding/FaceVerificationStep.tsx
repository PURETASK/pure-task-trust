import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Loader2, CheckCircle2, ArrowLeft, ArrowRight, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

interface FaceVerificationStepProps {
  onSubmit: (file: File) => Promise<string>;
  onBack: () => void;
  isSubmitting: boolean;
  userName?: string;
}

export function FaceVerificationStep({ onSubmit, onBack, isSubmitting, userName = 'User' }: FaceVerificationStepProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast({ title: 'Invalid file type', description: 'Please select an image file.', variant: 'destructive' }); return; }
    if (file.size > 5 * 1024 * 1024) { toast({ title: 'File too large', description: 'Please select an image under 5MB.', variant: 'destructive' }); return; }
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreviewUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.3 }} className="space-y-5">
      <div>
        <p className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-1">Step 4 of 10</p>
        <h2 className="text-2xl font-bold text-white">Add your profile photo</h2>
        <p className="text-white/60 text-sm mt-1">Cleaners with photos get <span className="text-success font-semibold">3× more job matches</span>. Make it count.</p>
      </div>

      {/* Upload zone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="relative flex flex-col items-center justify-center h-52 rounded-2xl cursor-pointer overflow-hidden transition-all"
        style={{ border: `2px dashed ${previewUrl ? 'rgba(74,222,128,0.5)' : 'rgba(255,255,255,0.15)'}`, background: previewUrl ? 'rgba(74,222,128,0.08)' : 'rgba(255,255,255,0.04)' }}
      >
        {previewUrl ? (
          <>
            <img src={previewUrl} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.45)' }} />
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative z-10 flex flex-col items-center gap-2">
              <div className="h-12 w-12 rounded-full bg-success flex items-center justify-center">
                <CheckCircle2 className="h-7 w-7 text-white" />
              </div>
              <span className="text-white font-semibold text-sm">Photo selected</span>
              <span className="text-white/60 text-xs flex items-center gap-1"><RefreshCw className="h-3 w-3" />Click to change</span>
            </motion.div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-3 p-6 text-center">
            <div className="h-16 w-16 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.08)', border: '2px dashed rgba(255,255,255,0.2)' }}>
              {initials ? <span className="text-xl font-bold text-white/50">{initials}</span> : <Camera className="h-7 w-7 text-white/40" />}
            </div>
            <div>
              <p className="font-semibold text-white/80 text-sm">Click to upload your photo</p>
              <p className="text-white/40 text-xs mt-0.5">JPG, PNG up to 5MB</p>
            </div>
          </div>
        )}
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
      </div>

      {/* Guidelines */}
      <div className="grid grid-cols-2 gap-2">
        {['Clear face, good lighting', 'Face the camera directly', 'No sunglasses or filters', 'No group photos'].map((tip) => (
          <div key={tip} className="flex items-center gap-2 text-xs text-white/50">
            <div className="h-1.5 w-1.5 rounded-full bg-success flex-shrink-0" />
            {tip}
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting} className="h-12 rounded-xl border-white/20 bg-white/5 text-white hover:bg-white/10 px-5"><ArrowLeft className="h-4 w-4" /></Button>
        <Button onClick={async () => { if (selectedFile) { try { await onSubmit(selectedFile); } catch (e: any) { toast({ title: 'Upload failed', description: e.message, variant: 'destructive' }); } } }} disabled={!selectedFile || isSubmitting} className="flex-1 h-12 font-semibold rounded-xl bg-success hover:bg-success text-white border-0">
          {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Uploading…</> : <><span>Continue</span><ArrowRight className="h-4 w-4 ml-2" /></>}
        </Button>
      </div>
    </motion.div>
  );
}
