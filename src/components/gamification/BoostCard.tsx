import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Zap, Rocket, Star, Clock, TrendingUp } from "lucide-react";
import { useCleanerBoosts } from "@/hooks/useCleanerGamification";
import { useWallet } from "@/hooks/useWallet";
import { format, formatDistanceToNow } from "date-fns";

const boostOptions = [
  {
    type: 'visibility',
    name: 'Visibility Boost',
    description: 'Appear higher in search results',
    icon: TrendingUp,
    multiplier: '2x',
    durations: [
      { hours: 2, credits: 50 },
      { hours: 6, credits: 100 },
      { hours: 24, credits: 300 },
    ],
  },
  {
    type: 'priority',
    name: 'Priority Matching',
    description: 'Get job offers before others',
    icon: Zap,
    multiplier: '1.5x',
    durations: [
      { hours: 4, credits: 75 },
      { hours: 12, credits: 150 },
      { hours: 48, credits: 400 },
    ],
  },
  {
    type: 'featured',
    name: 'Featured Profile',
    description: 'Stand out with a featured badge',
    icon: Star,
    multiplier: '3x',
    durations: [
      { hours: 24, credits: 200 },
      { hours: 72, credits: 500 },
      { hours: 168, credits: 1000 },
    ],
  },
];

interface BoostCardProps {
  cleanerId?: string;
  compact?: boolean;
}

export function BoostCard({ cleanerId, compact = false }: BoostCardProps) {
  const { boosts, activeBoost, isLoading, createBoost, isCreatingBoost } = useCleanerBoosts(cleanerId);
  const { account } = useWallet();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleBoost = (type: string, hours: number, credits: number) => {
    if (!account || account.current_balance < credits) {
      return;
    }
    
    createBoost({ boostType: type, durationHours: hours, creditsToSpend: credits });
    setIsDialogOpen(false);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className={compact ? "pb-2" : undefined}>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Rocket className="h-5 w-5 text-blue-500" />
            Profile Boost
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className={compact ? "pb-2" : undefined}>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Rocket className={`h-5 w-5 ${activeBoost ? 'text-blue-500' : 'text-muted-foreground'}`} />
          Profile Boost
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activeBoost ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-medium capitalize">{activeBoost.boost_type} Boost</p>
                  <p className="text-sm text-muted-foreground">
                    {activeBoost.multiplier}x visibility
                  </p>
                </div>
              </div>
              <Badge className="bg-blue-500 hover:bg-blue-600">Active</Badge>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Expires {formatDistanceToNow(new Date(activeBoost.ends_at), { addSuffix: true })}</span>
            </div>

            {!compact && activeBoost.jobs_during > 0 && (
              <p className="text-sm text-emerald-600 dark:text-emerald-400">
                {activeBoost.jobs_during} jobs received during this boost!
              </p>
            )}
          </div>
        ) : (
          <div className="text-center py-2">
            <p className="text-sm text-muted-foreground mb-3">
              Boost your profile to get more job offers
            </p>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Rocket className="h-4 w-4" />
                  Activate Boost
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Choose a Boost</DialogTitle>
                  <DialogDescription>
                    Boost your profile visibility to get more job offers
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 mt-4">
                  {boostOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <div key={option.type} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Icon className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{option.name}</p>
                            <p className="text-sm text-muted-foreground">{option.description}</p>
                          </div>
                          <Badge variant="secondary" className="ml-auto">
                            {option.multiplier}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-2">
                          {option.durations.map((dur) => {
                            const canAfford = account && account.current_balance >= dur.credits;
                            return (
                              <Button
                                key={dur.hours}
                                variant={canAfford ? "outline" : "ghost"}
                                size="sm"
                                disabled={!canAfford || isCreatingBoost}
                                onClick={() => handleBoost(option.type, dur.hours, dur.credits)}
                                className="flex-col h-auto py-2"
                              >
                                <span className="font-medium">
                                  {dur.hours < 24 ? `${dur.hours}h` : `${dur.hours / 24}d`}
                                </span>
                                <span className={`text-xs ${canAfford ? 'text-muted-foreground' : 'text-destructive'}`}>
                                  ${dur.credits}
                                </span>
                              </Button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <p className="text-sm">
                    Your balance: <span className="font-bold">${account?.current_balance || 0}</span>
                  </p>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}

        {/* Recent Boosts History */}
        {!compact && boosts.length > 1 && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-xs text-muted-foreground mb-2">Recent boosts</p>
            <div className="space-y-2">
              {boosts.slice(1, 4).map((boost) => (
                <div key={boost.id} className="flex items-center justify-between text-sm">
                  <span className="capitalize">{boost.boost_type}</span>
                  <span className="text-muted-foreground">
                    {format(new Date(boost.created_at), 'MMM d')} • {boost.jobs_during} jobs
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
