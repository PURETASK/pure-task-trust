import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useHelpArticles } from "@/hooks/useSupportHub";
import { Calendar, CreditCard, User, Shield, Wrench, Award, Sparkles, AlertTriangle, HeartHandshake, Bug } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const ICONS: Record<string, any> = {
  bookings: Calendar,
  payments: CreditCard,
  account: User,
  trust: Shield,
  jobs: Wrench,
  earnings: CreditCard,
  performance: Award,
  verification: Shield,
  contact: HeartHandshake,
  troubleshooting: Bug,
  rewards: Sparkles,
  safety: AlertTriangle,
};

interface TopicGridProps {
  role?: "client" | "cleaner";
}

export function TopicGrid({ role }: TopicGridProps) {
  const { data: articles, isLoading } = useHelpArticles(role);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-28" />)}
      </div>
    );
  }

  // Group by category
  const byCategory = (articles || []).reduce<Record<string, typeof articles>>((acc, a) => {
    (acc[a.category] = acc[a.category] || []).push(a);
    return acc;
  }, {} as any);

  const categories = Object.keys(byCategory);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {categories.map(cat => {
        const Icon = ICONS[cat] || Sparkles;
        const items = byCategory[cat] || [];
        return (
          <Link to={`/help/category/${cat}`} key={cat}>
            <Card className="p-4 h-full hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-sm capitalize">{cat.replace(/-/g, " ")}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{items.length} article{items.length !== 1 ? "s" : ""}</p>
                </div>
              </div>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
