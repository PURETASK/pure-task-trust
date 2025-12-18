import { useState } from 'react';
import { ArrowLeft, ArrowRight, X, ZoomIn } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface PhotoPair {
  before: string;
  after: string;
  label?: string;
}

interface PhotoProofGridProps {
  photos: PhotoPair[];
  className?: string;
}

export function PhotoProofGrid({ photos, className }: PhotoProofGridProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<{ url: string; type: 'before' | 'after' } | null>(null);

  const currentPair = photos[currentIndex];

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(photos.length - 1, prev + 1));
  };

  const openLightbox = (url: string, type: 'before' | 'after') => {
    setLightboxImage({ url, type });
    setLightboxOpen(true);
  };

  if (!photos.length) {
    return (
      <div className={cn("p-8 bg-secondary/50 rounded-xl text-center", className)}>
        <p className="text-muted-foreground">No photos available</p>
      </div>
    );
  }

  return (
    <>
      <div className={cn("relative", className)}>
        <div className="grid grid-cols-2 gap-1 rounded-xl overflow-hidden">
          <PhotoCard
            src={currentPair.before}
            label="Before"
            labelPosition="left"
            onClick={() => openLightbox(currentPair.before, 'before')}
          />
          <PhotoCard
            src={currentPair.after}
            label="After"
            labelPosition="right"
            variant="after"
            onClick={() => openLightbox(currentPair.after, 'after')}
          />
        </div>

        {/* Navigation */}
        {photos.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-card/80 backdrop-blur-sm rounded-full px-3 py-1.5">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="p-1 disabled:opacity-50 transition-opacity"
              aria-label="Previous photo"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-medium min-w-[3rem] text-center">
              {currentIndex + 1} / {photos.length}
            </span>
            <button
              onClick={handleNext}
              disabled={currentIndex === photos.length - 1}
              className="p-1 disabled:opacity-50 transition-opacity"
              aria-label="Next photo"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Photo label if provided */}
        {currentPair.label && (
          <p className="text-xs text-center text-muted-foreground mt-2">
            {currentPair.label}
          </p>
        )}
      </div>

      {/* Lightbox */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-4xl p-0 bg-black/95">
          <DialogTitle className="sr-only">
            {lightboxImage?.type === 'before' ? 'Before photo' : 'After photo'}
          </DialogTitle>
          <div className="relative">
            <Badge 
              variant={lightboxImage?.type === 'after' ? 'success' : 'secondary'}
              className="absolute top-4 left-4 z-10"
            >
              {lightboxImage?.type === 'before' ? 'Before' : 'After'}
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
              onClick={() => setLightboxOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
            {lightboxImage && (
              <img
                src={lightboxImage.url}
                alt={lightboxImage.type}
                className="w-full h-auto max-h-[80vh] object-contain"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function PhotoCard({ 
  src, 
  label, 
  labelPosition,
  variant = 'before',
  onClick 
}: { 
  src: string; 
  label: string;
  labelPosition: 'left' | 'right';
  variant?: 'before' | 'after';
  onClick: () => void;
}) {
  return (
    <div 
      className="relative group cursor-pointer"
      onClick={onClick}
    >
      <img
        src={src}
        alt={label}
        className="w-full h-48 object-cover transition-transform group-hover:scale-105"
      />
      <Badge 
        variant={variant === 'after' ? 'success' : 'secondary'}
        className={cn(
          "absolute top-3",
          labelPosition === 'left' ? 'left-3' : 'right-3'
        )}
      >
        {label}
      </Badge>
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
        <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
  );
}

// Compact version for lists
export function PhotoProofThumbnails({ photos, maxShow = 3 }: { photos: PhotoPair[]; maxShow?: number }) {
  const displayPhotos = photos.slice(0, maxShow);
  const remaining = photos.length - maxShow;

  return (
    <div className="flex items-center gap-1">
      {displayPhotos.map((pair, i) => (
        <div key={i} className="relative h-10 w-10 rounded-lg overflow-hidden">
          <img
            src={pair.after}
            alt={`Photo ${i + 1}`}
            className="h-full w-full object-cover"
          />
        </div>
      ))}
      {remaining > 0 && (
        <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
          <span className="text-xs font-medium">+{remaining}</span>
        </div>
      )}
    </div>
  );
}
