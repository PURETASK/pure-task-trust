import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCreateReview } from '@/hooks/useReviews';
import { Star, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReviewFormProps {
  jobId: string;
  cleanerId: string;
  cleanerName: string;
  onSuccess?: () => void;
}

export function ReviewForm({ jobId, cleanerId, cleanerName, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
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
        {/* Star Rating */}
        <div>
          <p className="text-sm text-muted-foreground mb-3">How would you rate the cleaning?</p>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-1 transition-transform hover:scale-110"
              >
                <Star
                  className={cn(
                    'h-8 w-8 transition-colors',
                    (hoverRating || rating) >= star
                      ? 'fill-warning text-warning'
                      : 'text-border'
                  )}
                />
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="text-sm text-muted-foreground mt-2">
              {rating === 5 && 'Excellent! 🌟'}
              {rating === 4 && 'Great! 👍'}
              {rating === 3 && 'Good'}
              {rating === 2 && 'Fair'}
              {rating === 1 && 'Poor'}
            </p>
          )}
        </div>

        {/* Review Text */}
        <div>
          <p className="text-sm text-muted-foreground mb-2">Share your experience (optional)</p>
          <Textarea
            placeholder="Tell others about your experience..."
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            rows={4}
          />
        </div>

        {/* Submit */}
        <Button
          className="w-full"
          onClick={handleSubmit}
          disabled={rating === 0 || isPending}
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit Review'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
