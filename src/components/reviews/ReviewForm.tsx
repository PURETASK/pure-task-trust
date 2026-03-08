import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { useCreateReview } from '@/hooks/useReviews';
import { Star, Loader2, Clock, Sparkles, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReviewFormProps {
  jobId: string;
  cleanerId: string;
  cleanerName: string;
  onSuccess?: () => void;
}

const SUB_RATINGS = [
  { id: "punctuality", label: "Punctuality", icon: Clock },
  { id: "cleanliness", label: "Cleanliness", icon: Sparkles },
  { id: "communication", label: "Communication", icon: MessageCircle },
] as const;

function StarRow({ value, hover, onChange, onHover, onLeave }: {
  value: number; hover: number;
  onChange: (v: number) => void; onHover: (v: number) => void; onLeave: () => void;
}) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => onHover(star)}
          onMouseLeave={onLeave}
          className="p-0.5 transition-transform hover:scale-110"
        >
          <Star className={cn('h-7 w-7 transition-colors', (hover || value) >= star ? 'fill-warning text-warning' : 'text-border')} />
        </button>
      ))}
    </div>
  );
}

export function ReviewForm({ jobId, cleanerId, cleanerName, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [subRatings, setSubRatings] = useState<Record<string, number>>({
    punctuality: 5, cleanliness: 5, communication: 5,
  });
  const { mutateAsync: createReview, isPending } = useCreateReview();

  const handleSubmit = async () => {
    if (rating === 0) return;
    await createReview({
      jobId,
      cleanerId,
      rating,
      reviewText: reviewText.trim() || undefined,
    });
    onSuccess?.();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Rate your experience with {cleanerName}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall star rating */}
        <div>
          <p className="text-sm text-muted-foreground mb-3">Overall rating</p>
          <StarRow value={rating} hover={hoverRating} onChange={setRating} onHover={setHoverRating} onLeave={() => setHoverRating(0)} />
          {rating > 0 && (
            <p className="text-sm text-muted-foreground mt-2">
              {rating === 5 && 'Excellent! 🌟'}{rating === 4 && 'Great! 👍'}{rating === 3 && 'Good'}{rating === 2 && 'Fair'}{rating === 1 && 'Poor'}
            </p>
          )}
        </div>

        {/* Sub-category ratings */}
        <div className="space-y-4 border rounded-xl p-4 bg-muted/30">
          <p className="text-sm font-medium">Category ratings <span className="text-muted-foreground font-normal">(optional)</span></p>
          {SUB_RATINGS.map(({ id, label, icon: Icon }) => (
            <div key={id} className="flex items-center gap-4">
              <div className="flex items-center gap-2 w-36">
                <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm">{label}</span>
              </div>
              <Slider
                min={1} max={5} step={1}
                value={[subRatings[id]]}
                onValueChange={([v]) => setSubRatings(prev => ({ ...prev, [id]: v }))}
                className="flex-1"
              />
              <span className="text-sm font-semibold w-6 text-right text-primary">{subRatings[id]}</span>
            </div>
          ))}
        </div>

        {/* Review text */}
        <div>
          <p className="text-sm text-muted-foreground mb-2">Share your experience (optional)</p>
          <Textarea placeholder="Tell others about your experience..." value={reviewText} onChange={(e) => setReviewText(e.target.value)} rows={4} />
        </div>

        {/* Submit */}
        <Button className="w-full" onClick={handleSubmit} disabled={rating === 0 || isPending}>
          {isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Submitting...</> : 'Submit Review'}
        </Button>
      </CardContent>
    </Card>
  );
}
