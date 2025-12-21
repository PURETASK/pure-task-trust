import { useState, useRef } from 'react';
import { Camera, Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Camera className="h-5 w-5" />
            {title || `${type === 'before' ? 'Before' : 'After'} Photos`}
          </CardTitle>
          {typePhotos.length > 0 && (
            <Badge variant="success">{typePhotos.length} uploaded</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Photo grid */}
            {(typePhotos.length > 0 || preview) && (
              <div className="grid grid-cols-2 gap-2">
                {typePhotos.map((photo) => (
                  <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden">
                    <img 
                      src={photo.photo_url} 
                      alt={`${type} photo`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
                {preview && (
                  <div className="relative aspect-square rounded-lg overflow-hidden">
                    <img 
                      src={preview} 
                      alt="Uploading..."
                      className="w-full h-full object-cover opacity-50"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Empty state */}
            {typePhotos.length === 0 && !preview && (
              <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed rounded-lg">
                <ImageIcon className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground mb-4">
                  No {type} photos yet
                </p>
              </div>
            )}

            {/* Upload button */}
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
              className="w-full gap-2"
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
      </CardContent>
    </Card>
  );
}
