import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ReliabilityScoreProps {
  score: number;
  tier: "bronze" | "silver" | "gold" | "elite";
}

const tierConfig = {
  bronze: { label: "Bronze", color: "bg-amber-600", textColor: "text-amber-600" },
  silver: { label: "Silver", color: "bg-slate-400", textColor: "text-slate-400" },
  gold: { label: "Gold", color: "bg-yellow-500", textColor: "text-yellow-500" },
  elite: { label: "Elite", color: "bg-orange-500", textColor: "text-orange-500" },
};

export function ReliabilityScore({ score, tier }: ReliabilityScoreProps) {
  const config = tierConfig[tier];
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <Card className="bg-muted/30 border-border/50">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Award className="h-5 w-5" />
          Reliability Score
        </CardTitle>
        <Badge className={`${config.color} text-white`}>
          <Award className="h-3 w-3 mr-1" />
          {config.label}
        </Badge>
      </CardHeader>
      <CardContent className="flex items-center gap-6">
        <div className="relative w-24 h-24">
          <svg className="w-24 h-24 transform -rotate-90">
            <circle
              cx="48"
              cy="48"
              r="45"
              stroke="currentColor"
              strokeWidth="6"
              fill="none"
              className="text-muted"
            />
            <circle
              cx="48"
              cy="48"
              r="45"
              stroke="currentColor"
              strokeWidth="6"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className={config.textColor}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl font-bold">{score}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-success" />
          <span className="text-muted-foreground">Growing & Learning</span>
        </div>
      </CardContent>
    </Card>
  );
}
