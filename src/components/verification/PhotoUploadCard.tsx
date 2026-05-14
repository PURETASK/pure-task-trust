import { useState, useRef } from 'react';
import { Camera, Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PhotoBox, SectionLabel } from '@/components/wf';
import { useJobPhotos, useUploadJobPhoto } from '@/hooks/useJobPhotos';

interface PhotoUploadCardProps {
  jobId: string;
  type: 'before' | 'after';
  title?: string;
}

export function PhotoUploadCard({ jobId, type, title }: PhotoUploadCardProps) {
  const { data: photos, isLoading } = useJobPhotos(jobId);
  const uploadPhoto = useUploadJobPhoto(jobId);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload
    await uploadPhoto.mutateAsync({ file, type });
    setPreview(null);
  };

  const typePhotos = photos?.filter(p => {
    // Simple heuristic: check if URL contains type
    return p.photo_url.includes(type);
  }) || [];

  return (
    <div className="rounded-[10px] bg-app-surface border border-hairline-soft shadow-wf p-4 sm:p-5 space-y-4">
      <div className="flex items-center justify-between">
        <SectionLabel className="!mb-0 flex items-center gap-2">
          <Camera className="h-3.5 w-3.5" />
          {title || `${type === 'before' ? 'Before' : 'After'} Photos`}
        </SectionLabel>
        {typePhotos.length > 0 && (
          <Badge variant="success">{typePhotos.length} uploaded</Badge>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <Loader2 className="h-6 w-6 animate-spin text-ink-muted" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-2">
            {typePhotos.map((photo) => (
              <PhotoBox
                key={photo.id}
                state="done"
                src={photo.photo_url}
                onClick={() => window.open(photo.photo_url, '_blank')}
              />
            ))}
            {preview && (
              <div className="relative">
                <PhotoBox src={preview} state="default" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-md">
                  <Loader2 className="h-6 w-6 animate-spin text-white" />
                </div>
              </div>
            )}
            <PhotoBox
              state={typePhotos.length === 0 ? 'dashed' : 'default'}
              label="Add"
              onClick={() => fileInputRef.current?.click()}
            />
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*"
            capture="environment"
            className="hidden"
          />
          <Button
            variant="outline"
            className="w-full gap-2 rounded-xl"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadPhoto.isPending}
          >
            {uploadPhoto.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            Upload Photo
          </Button>
        </>
      )}
    </div>
  );
}
