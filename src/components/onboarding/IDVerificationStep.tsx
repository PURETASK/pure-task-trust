import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileCheck, Loader2, Upload, CheckCircle2, ArrowLeft, ArrowRight, Lock } from 'lucide-react';
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
  const [fileName, setFileName] = useState<string>('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      toast({ title: 'Invalid file type', description: 'Please upload an image (JPEG, PNG) or PDF.', variant: 'destructive' });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Please select a file under 10MB.', variant: 'destructive' });
      return;
    }
    setSelectedFile(file);
    setFileName(file.name);
  };

  const handleSubmit = async () => {
    if (!selectedFile || !documentType) return;
    try {
      await onSubmit({ file: selectedFile, documentType });
    } catch (error: any) {
      toast({ title: 'Upload failed', description: error.message || 'Failed to upload document', variant: 'destructive' });
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
        <h2 className="text-2xl font-bold text-foreground">Verify your identity</h2>
        <p className="text-muted-foreground mt-1">A government-issued ID lets clients know exactly who's coming to their home.</p>
      </div>

      {/* Document type selector */}
      <div className="space-y-2">
        <Label className="font-medium">Document type</Label>
        <Select value={documentType} onValueChange={setDocumentType}>
          <SelectTrigger className="h-12 rounded-xl">
            <SelectValue placeholder="Choose your document type…" />
          </SelectTrigger>
          <SelectContent>
            {DOCUMENT_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                <span className="flex items-center gap-2">
                  <span>{type.icon}</span>
                  <span>{type.label}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Upload zone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed cursor-pointer transition-all p-8 text-center
          ${selectedFile
            ? 'border-success bg-success/5'
            : 'border-muted-foreground/25 bg-muted/30 hover:border-primary/50 hover:bg-primary/5'
          }`}
      >
        {selectedFile ? (
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center gap-3">
            <div className="h-14 w-14 rounded-2xl bg-success/10 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-success" />
            </div>
            <div>
              <p className="font-semibold text-sm text-foreground">{fileName}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Click to change document</p>
            </div>
          </motion.div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center">
              <Upload className="h-7 w-7 text-muted-foreground" />
            </div>
            <div>
              <p className="font-semibold text-sm text-foreground">Upload your document</p>
              <p className="text-xs text-muted-foreground mt-0.5">JPG, PNG or PDF — max 10MB</p>
            </div>
          </div>
        )}
        <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={handleFileSelect} className="hidden" />
      </div>

      {/* Privacy notice */}
      <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-xl">
        <Lock className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">Your privacy is protected.</span>{' '}
          Your ID is encrypted and stored securely. It's only used for identity verification and is never shared with clients.
        </p>
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting} className="h-12 rounded-xl px-5">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={!selectedFile || !documentType || isSubmitting}
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
