import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { CheckCircle2, Circle, ChevronDown, ChevronUp, X } from "lucide-react";

interface ProfileData {
  profile_photo_url?: string | null;
  bio?: string | null;
  professional_headline?: string | null;
  stripe_connect_id?: string | null;
}

interface ProfileCompletionProps {
  profile: ProfileData;
  hasServiceAreas?: boolean;
  hasAvailability?: boolean;
}

const ITEMS = [
  { key: "photo", label: "Add profile photo", benefit: "Get 40% more clicks", href: "/cleaner/profile", points: 20 },
  { key: "bio", label: "Write your bio", benefit: "Appear in 30% more searches", href: "/cleaner/profile", points: 15 },
  { key: "headline", label: "Add a professional headline", benefit: "Boost trust with clients", href: "/cleaner/profile", points: 15 },
  { key: "service_areas", label: "Set service areas", benefit: "Get matched to nearby jobs", href: "/cleaner/service-areas", points: 20 },
  { key: "availability", label: "Set your availability", benefit: "Enable auto-assign matching", href: "/cleaner/availability", points: 20 },
  { key: "bank", label: "Connect bank account", benefit: "Enable weekly payouts", href: "/cleaner/earnings", points: 10 },
] as const;

export function ProfileCompletion({ profile, hasServiceAreas = false, hasAvailability = false }: ProfileCompletionProps) {
  const [dismissed, setDismissed] = useState(() => localStorage.getItem("profile_completion_dismissed") === "true");
  const [expanded, setExpanded] = useState(true);

  const completedKeys = new Set<string>();
  if (profile.profile_photo_url) completedKeys.add("photo");
  if (profile.bio) completedKeys.add("bio");
  if (profile.professional_headline) completedKeys.add("headline");
  if (hasServiceAreas) completedKeys.add("service_areas");
  if (hasAvailability) completedKeys.add("availability");
  if (profile.stripe_connect_id) completedKeys.add("bank");

  const totalScore = ITEMS.filter(i => completedKeys.has(i.key)).reduce((s, i) => s + i.points, 0);
  const incomplete = ITEMS.filter(i => !completedKeys.has(i.key));

  if (dismissed || totalScore === 100) return null;

  const handleDismiss = () => {
    localStorage.setItem("profile_completion_dismissed", "true");
    setDismissed(true);
  };

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold flex-shrink-0">
              {totalScore}%
            </div>
            <div>
              <p className="font-semibold text-sm">Complete your profile</p>
              <p className="text-xs text-muted-foreground">
                {incomplete.length} item{incomplete.length !== 1 ? "s" : ""} left to unlock full visibility
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setExpanded(v => !v)}>
              {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleDismiss}>
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        <Progress value={totalScore} className="h-1.5 mb-3" />

        {expanded && (
          <div className="space-y-2 mt-3">
            {ITEMS.map(item => {
              const done = completedKeys.has(item.key);
              return (
                <div key={item.key} className={`flex items-center justify-between py-2 px-2.5 rounded-lg transition-colors ${done ? "opacity-50" : "hover:bg-primary/5"}`}>
                  <div className="flex items-center gap-2.5">
                    {done
                      ? <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />
                      : <Circle className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
                    <div>
                      <p className="text-sm font-medium">{item.label}</p>
                      {!done && <p className="text-xs text-primary">{item.benefit}</p>}
                    </div>
                  </div>
                  {!done && (
                    <Button variant="ghost" size="sm" asChild className="h-7 text-xs text-primary px-2">
                      <Link to={item.href}>Add →</Link>
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
