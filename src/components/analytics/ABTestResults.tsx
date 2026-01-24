import { Trophy, TrendingUp, Users, Percent } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useABTestResults } from "@/hooks/useABTest";
import { Skeleton } from "@/components/ui/skeleton";

interface ABTestResultsProps {
  testId: string;
  testName: string;
  variants: string[];
}

export function ABTestResults({ testId, testName, variants }: ABTestResultsProps) {
  const { data: results, isLoading } = useABTestResults(testId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!results) return null;

  const totalParticipants = results.totalParticipants;
  const variantData = variants.map((variant) => ({
    name: variant,
    participants: results.variantCounts[variant] || 0,
    percentage: totalParticipants > 0
      ? ((results.variantCounts[variant] || 0) / totalParticipants) * 100
      : 0,
  }));

  // Find the variant with most participants (could be winner indicator in real scenario)
  const leadingVariant = variantData.reduce((prev, current) =>
    current.participants > prev.participants ? current : prev
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg capitalize">
            {testName.replace(/_/g, " ")}
          </CardTitle>
          <Badge variant="outline" className="gap-1">
            <Users className="h-3 w-3" />
            {totalParticipants.toLocaleString()} participants
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {variantData.map((variant) => (
          <div key={variant.name} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="font-medium capitalize">
                  {variant.name.replace(/_/g, " ")}
                </span>
                {variant.name === leadingVariant.name && totalParticipants > 10 && (
                  <Badge className="gap-1 bg-pt-green/10 text-pt-green border-0">
                    <Trophy className="h-3 w-3" />
                    Leading
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <span>{variant.participants.toLocaleString()}</span>
                <span className="text-xs">({variant.percentage.toFixed(1)}%)</span>
              </div>
            </div>
            <Progress value={variant.percentage} className="h-2" />
          </div>
        ))}

        {totalParticipants < 100 && (
          <p className="text-xs text-muted-foreground text-center pt-2">
            Need more data for statistical significance (min. 100 participants)
          </p>
        )}
      </CardContent>
    </Card>
  );
}
