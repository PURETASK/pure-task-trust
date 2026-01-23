import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileCheck, Loader2, Upload, CheckCircle2, ArrowLeft, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface IDVerificationStepProps {
  onSubmit: (params: { file: File; documentType: string }) => Promise<void>;
  onBack: () => void;
  isSubmitting: boolean;
}

const DOCUMENT_TYPES = [
  { value: 'drivers_license', label: "Driver's License" },
  { value: 'passport', label: 'Passport' },
  { value: 'state_id', label: 'State ID' },
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

    // Validate file type (images and PDFs)
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload an image (JPEG, PNG) or PDF.',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 10MB for documents)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please select a file under 10MB.',
        variant: 'destructive',
      });
      return;
    }

    setSelectedFile(file);
    setFileName(file.name);
  };

  const handleSubmit = async () => {
    if (!selectedFile || !documentType) return;
    
    try {
      await onSubmit({ file: selectedFile, documentType });
      toast({
        title: 'Document uploaded!',
        description: 'Your ID is pending verification.',
      });
    } catch (error: any) {
      toast({
        title: 'Upload failed',
        description: error.message || 'Failed to upload document',
        variant: 'destructive',
      });
    }
  };

  const isValid = selectedFile && documentType;

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <FileCheck className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-2xl">Verify your identity</CardTitle>
        <CardDescription>
          Upload a government-issued ID to build trust with clients
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Document type selection */}
        <div className="space-y-2">
          <Label htmlFor="documentType">Document Type *</Label>
          <Select value={documentType} onValueChange={setDocumentType}>
            <SelectTrigger id="documentType">
              <SelectValue placeholder="Select document type" />
            </SelectTrigger>
            <SelectContent>
              {DOCUMENT_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Upload area */}
        <div 
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            selectedFile 
              ? 'border-success bg-success/5' 
              : 'border-muted-foreground/30 hover:border-primary/50'
          }`}
        >
          {selectedFile ? (
            <div className="flex items-center justify-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-success" />
              <div className="text-left">
                <p className="font-medium text-sm">{fileName}</p>
                <p className="text-xs text-muted-foreground">Document ready to upload</p>
              </div>
            </div>
          ) : (
            <>
              <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-3">
                Upload a clear photo or scan of your ID
              </p>
            </>
          )}
          
          <Button
            type="button"
            variant={selectedFile ? 'outline' : 'secondary'}
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isSubmitting}
          >
            {selectedFile ? 'Change Document' : 'Select Document'}
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* Privacy notice */}
        <div className="bg-muted/50 rounded-lg p-4 flex gap-3">
          <Shield className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Your privacy is protected</p>
            <p className="mt-1">
              Your ID is stored securely and only used for verification. 
              It's never shared with clients.
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onBack}
            disabled={isSubmitting}
            className="flex-1"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button 
            type="button" 
            onClick={handleSubmit}
            disabled={!isValid || isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              'Continue'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
