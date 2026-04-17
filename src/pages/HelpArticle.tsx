import { useParams, Link, useNavigate } from "react-router-dom";
import { useHelpArticle, useHelpArticles } from "@/hooks/useSupportHub";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, ThumbsUp, ThumbsDown } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Skeleton } from "@/components/ui/skeleton";
import { SEO } from "@/components/seo/SEO";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function HelpArticle() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: article, isLoading } = useHelpArticle(slug);
  const { data: all } = useHelpArticles();
  const [voted, setVoted] = useState<"up" | "down" | null>(null);

  const related = (all || [])
    .filter(a => a.slug !== slug && a.category === article?.category)
    .slice(0, 4);

  return (
    <>
      <SEO title={article ? `${article.title} — Help` : "Help"} description={article?.summary || ""} />
      <div className="container max-w-3xl mx-auto py-6 px-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : !article ? (
          <p className="text-muted-foreground">Article not found.</p>
        ) : (
          <>
            <article className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
              <h1>{article.title}</h1>
              {article.summary && <p className="lead text-muted-foreground">{article.summary}</p>}
              <ReactMarkdown>{article.body}</ReactMarkdown>
            </article>

            <Card className="p-4 mt-8 flex items-center justify-between flex-wrap gap-3">
              <p className="text-sm font-medium">Was this helpful?</p>
              <div className="flex gap-2">
                <Button
                  variant={voted === "up" ? "default" : "outline"}
                  size="sm"
                  onClick={() => { setVoted("up"); toast({ title: "Thanks for the feedback!" }); }}
                  disabled={voted !== null}
                >
                  <ThumbsUp className="h-4 w-4 mr-1.5" /> Yes
                </Button>
                <Button
                  variant={voted === "down" ? "default" : "outline"}
                  size="sm"
                  onClick={() => { setVoted("down"); navigate("/help/contact"); }}
                  disabled={voted !== null}
                >
                  <ThumbsDown className="h-4 w-4 mr-1.5" /> No, contact support
                </Button>
              </div>
            </Card>

            {related.length > 0 && (
              <div className="mt-8">
                <h2 className="font-bold mb-3">Related articles</h2>
                <div className="grid sm:grid-cols-2 gap-2">
                  {related.map(r => (
                    <Link key={r.id} to={`/help/articles/${r.slug}`}>
                      <Card className="p-3 hover:border-primary/50 transition-all">
                        <p className="font-semibold text-sm">{r.title}</p>
                        {r.summary && <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{r.summary}</p>}
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
