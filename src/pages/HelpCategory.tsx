import { useParams, Link, useNavigate } from "react-router-dom";
import { useHelpArticles } from "@/hooks/useSupportHub";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";

export default function HelpCategory() {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const role = user?.role === "cleaner" ? "cleaner" : user?.role === "client" ? "client" : undefined;
  const { data: articles, isLoading } = useHelpArticles(role);

  const filtered = (articles || []).filter(a => a.category === category);

  return (
    <div className="container max-w-3xl mx-auto py-6 px-4">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back
      </Button>
      <h1 className="text-2xl md:text-3xl font-poppins font-bold text-gradient-aero capitalize mb-4">{category?.replace(/-/g, " ")}</h1>

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
      ) : filtered.length === 0 ? (
        <p className="text-muted-foreground text-sm">No articles in this category yet.</p>
      ) : (
        <div className="space-y-2">
          {filtered.map(a => (
            <Link key={a.id} to={`/help/articles/${a.slug}`}>
              <Card className="p-4 hover:border-primary/50 transition-all">
                <p className="font-semibold">{a.title}</p>
                {a.summary && <p className="text-sm text-muted-foreground mt-1">{a.summary}</p>}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
