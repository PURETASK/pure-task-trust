import { Helmet } from "react-helmet-async";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useCleanerReviews } from "@/hooks/useReviews";
import { useCleanerProfile } from "@/hooks/useCleanerProfile";
import { ProResponseEditor } from "@/components/reviews/ProResponseEditor";

export default function CleanerReviewsPage() {
  const { profile, isLoading: loadingProfile } = useCleanerProfile();
  const cleanerId = profile?.id ?? "";
  const { data: reviews, isLoading } = useCleanerReviews(cleanerId);

  return (
    <main className="container max-w-3xl py-8 px-4">
      <Helmet><title>My Reviews | PureTask</title></Helmet>
      <header className="mb-6">
        <h1 className="text-2xl font-bold mb-1">My Reviews</h1>
        <p className="text-sm text-ink-muted">
          Reply to clients publicly. Responses appear on your profile and the reviews page.
        </p>
      </header>

      {(loadingProfile || isLoading) ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-2xl" />)}
        </div>
      ) : !reviews?.length ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquare className="h-10 w-10 text-ink-muted/40 mx-auto mb-3" />
            <p className="font-semibold">No reviews yet</p>
            <p className="text-sm text-ink-muted mt-1">After your first completed jobs, client reviews show here.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < review.rating ? "fill-warning text-warning" : "text-ink-muted/30"}`}
                      />
                    ))}
                  </div>
                  <time className="text-xs text-ink-muted" dateTime={review.created_at}>
                    {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                  </time>
                </div>
                {review.review_text ? (
                  <p className="text-sm leading-relaxed">"{review.review_text}"</p>
                ) : (
                  <p className="text-sm italic text-ink-muted">No written review — rating only.</p>
                )}
                <ProResponseEditor
                  reviewId={review.id}
                  cleanerId={cleanerId}
                  existingResponse={review.pro_response}
                  respondedAt={review.pro_response_at}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}