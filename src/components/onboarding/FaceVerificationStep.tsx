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
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Invalid file type', description: 'Please select an image file.', variant: 'destructive' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Please select an image under 5MB.', variant: 'destructive' });
      return;
    }
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreviewUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;
    try {
      await onSubmit(selectedFile);
    } catch (error: any) {
      toast({ title: 'Upload failed', description: error.message || 'Failed to upload photo', variant: 'destructive' });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold text-foreground">Add your profile photo</h2>
        <p className="text-muted-foreground mt-1">Cleaners with photos get 3× more job matches. Make it count.</p>
      </div>

      {/* Upload zone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed cursor-pointer transition-all overflow-hidden
          ${previewUrl
            ? 'border-success bg-success/5 h-56'
            : 'border-muted-foreground/25 bg-muted/30 hover:border-primary/50 hover:bg-primary/5 h-56'
          }`}
      >
        {previewUrl ? (
          <>
            <img src={previewUrl} alt="Profile preview" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-foreground/40" />
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="relative z-10 flex flex-col items-center gap-2"
            >
              <div className="h-12 w-12 rounded-full bg-success flex items-center justify-center">
                <CheckCircle2 className="h-7 w-7 text-success-foreground" />
              </div>
              <span className="text-white font-semibold text-sm">Photo selected</span>
              <span className="text-white/70 text-xs flex items-center gap-1"><RefreshCw className="h-3 w-3" />Click to change</span>
            </motion.div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-3 p-8 text-center">
            <div className="h-16 w-16 rounded-full bg-muted border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
              {initials ? (
                <span className="text-xl font-bold text-muted-foreground">{initials}</span>
              ) : (
                <Camera className="h-7 w-7 text-muted-foreground" />
              )}
            </div>
            <div>
              <p className="font-semibold text-foreground text-sm">Click to upload your photo</p>
              <p className="text-muted-foreground text-xs mt-1">JPG, PNG up to 5MB</p>
            </div>
          </div>
        )}
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
      </div>

      {/* Guidelines */}
      <div className="grid grid-cols-2 gap-2">
        {['Clear face, good lighting', 'Face the camera directly', 'No sunglasses', 'No group photos'].map((tip) => (
          <div key={tip} className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
            {tip}
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting} className="h-12 rounded-xl px-5">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={!selectedFile || isSubmitting}
          className="flex-1 h-12 text-base font-semibold rounded-xl"
        >
          {isSubmitting ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Uploading…</>
          ) : (
            <><span>Continue</span><ArrowRight className="h-4 w-4 ml-2" /></>
          )}
        </Button>
      </div>
    </motion.div>
  );
}
