import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Loader2, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FaceVerificationStepProps {
  onSubmit: (file: File) => Promise<string>;
  onBack: () => void;
  isSubmitting: boolean;
  userName?: string;
}

export function FaceVerificationStep({ 
  onSubmit, 
  onBack, 
  isSubmitting, 
  userName = 'User' 
}: FaceVerificationStepProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please select an image file.',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please select an image under 5MB.',
        variant: 'destructive',
      });
      return;
    }

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;
    
    try {
      await onSubmit(selectedFile);
      toast({
        title: 'Photo uploaded!',
        description: 'Your profile photo has been saved.',
      });
    } catch (error: any) {
      toast({
        title: 'Upload failed',
        description: error.message || 'Failed to upload photo',
        variant: 'destructive',
      });
    }
  };

  const initials = userName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Camera className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-2xl">Add a profile photo</CardTitle>
        <CardDescription>
          Help clients recognize you — a clear face photo builds trust
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Photo preview area */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <Avatar className="h-32 w-32 border-4 border-dashed border-muted-foreground/30">
              <AvatarImage src={previewUrl || undefined} alt="Your photo" />
              <AvatarFallback className="text-3xl bg-muted text-muted-foreground">
                {previewUrl ? null : initials}
              </AvatarFallback>
            </Avatar>
            {previewUrl && (
              <div className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-success text-success-foreground flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            )}
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isSubmitting}
          >
            <Camera className="mr-2 h-4 w-4" />
            {previewUrl ? 'Change Photo' : 'Upload Photo'}
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* Guidelines */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <h4 className="font-medium text-sm flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
            Photo guidelines
          </h4>
          <ul className="text-sm text-muted-foreground space-y-1 pl-6">
            <li>• Clear photo of your face</li>
            <li>• Good lighting, no shadows</li>
            <li>• Face the camera directly</li>
            <li>• No sunglasses or face coverings</li>
          </ul>
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
            disabled={!selectedFile || isSubmitting}
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
