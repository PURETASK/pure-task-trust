import { CleanerLayout } from "@/components/cleaner/CleanerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Gift, Users, Clock, CheckCircle, DollarSign, Copy, Mail, MessageSquare, TrendingUp } from "lucide-react";
import { useReferrals } from "@/hooks/useReferrals";
import { toast } from "sonner";
import { format } from "date-fns";

export default function CleanerReferral() {
  const { 
    referralCode, 
    referrals, 
    tracking, 
    stats, 
    isLoadingCode, 
    isLoadingReferrals 
  } = useReferrals();

  const referralLink = referralCode 
    ? `${window.location.origin}/auth?ref=${referralCode.code}` 
    : '';

  const copyCode = () => {
    if (!referralCode) return;
    navigator.clipboard.writeText(referralCode.code);
    toast.success("Referral code copied to clipboard!");
  };

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success("Referral link copied to clipboard!");
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent("Join PureTask and get 500 credits!");
    const body = encodeURIComponent(
      `Hey! I've been using PureTask for cleaning services and it's been great. Use my referral link to sign up and we'll both get 500 credits!\n\n${referralLink}`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const shareViaSMS = () => {
    const text = encodeURIComponent(
      `Join PureTask using my referral link and we'll both get 500 credits! ${referralLink}`
    );
    window.open(`sms:?body=${text}`);
  };

  return (
    <CleanerLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="h-20 w-20 mx-auto rounded-2xl bg-pink-500/10 flex items-center justify-center mb-4">
            <Gift className="h-10 w-10 text-pink-500" />
          </div>
          <h1 className="text-3xl font-bold">Refer & Earn</h1>
          <p className="text-muted-foreground mt-2">
            Give {referralCode?.referee_credits || 500} credits, Get {referralCode?.reward_credits || 500} credits
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800">
            <CardContent className="p-5 text-center">
              <Users className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              {isLoadingReferrals ? (
                <Skeleton className="h-8 w-12 mx-auto mb-1" />
              ) : (
                <div className="text-2xl font-bold">{stats.totalReferrals}</div>
              )}
              <div className="text-sm text-muted-foreground">Total Referrals</div>
            </CardContent>
          </Card>
          <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
            <CardContent className="p-5 text-center">
              <Clock className="h-8 w-8 text-amber-500 mx-auto mb-2" />
              {isLoadingReferrals ? (
                <Skeleton className="h-8 w-12 mx-auto mb-1" />
              ) : (
                <div className="text-2xl font-bold">{stats.pendingReferrals}</div>
              )}
              <div className="text-sm text-muted-foreground">Pending</div>
            </CardContent>
          </Card>
          <Card className="bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800">
            <CardContent className="p-5 text-center">
              <CheckCircle className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
              {isLoadingReferrals ? (
                <Skeleton className="h-8 w-12 mx-auto mb-1" />
              ) : (
                <div className="text-2xl font-bold">{stats.completedReferrals}</div>
              )}
              <div className="text-sm text-muted-foreground">Completed</div>
            </CardContent>
          </Card>
          <Card className="bg-cyan-50 dark:bg-cyan-950/20 border-cyan-200 dark:border-cyan-800">
            <CardContent className="p-5 text-center">
              <DollarSign className="h-8 w-8 text-cyan-500 mx-auto mb-2" />
              {isLoadingReferrals ? (
                <Skeleton className="h-8 w-12 mx-auto mb-1" />
              ) : (
                <div className="text-2xl font-bold">{stats.totalCreditsEarned}</div>
              )}
              <div className="text-sm text-muted-foreground">Credits Earned</div>
            </CardContent>
          </Card>
        </div>

        {/* Referral Link Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Gift className="h-5 w-5 text-pink-500" />
              <h2 className="font-semibold">Your Referral Link</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Your Referral Code</label>
                <div className="flex gap-2">
                  <div className="flex-1 bg-muted rounded-lg px-4 py-3 text-center">
                    {isLoadingCode ? (
                      <Skeleton className="h-6 w-24 mx-auto" />
                    ) : (
                      <span className="text-lg font-bold text-primary">{referralCode?.code || 'Loading...'}</span>
                    )}
                  </div>
                  <Button onClick={copyCode} className="gap-2" disabled={!referralCode}>
                    <Copy className="h-4 w-4" />
                    Copy Code
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Full Referral Link</label>
                <div className="flex gap-2">
                  <Input value={referralLink} readOnly className="text-sm" />
                  <Button variant="outline" size="icon" onClick={copyLink} disabled={!referralCode}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <Button variant="outline" className="gap-2" onClick={shareViaEmail}>
                  <Mail className="h-4 w-4" />
                  Share via Email
                </Button>
                <Button variant="outline" className="gap-2" onClick={shareViaSMS}>
                  <MessageSquare className="h-4 w-4" />
                  Share via SMS
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Referral Tracking */}
        {tracking.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5" />
                Referral Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tracking.map((t) => (
                  <div key={t.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">
                        {t.referee_role === 'cleaner' ? 'New Cleaner' : 'New Client'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Joined {format(new Date(t.created_at), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant={t.status === 'completed' ? 'default' : 'secondary'}>
                        {t.status === 'completed' ? 'Completed' : `${t.jobs_completed}/${t.jobs_required} jobs`}
                      </Badge>
                      {t.status === 'completed' && (
                        <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1">
                          +{t.referrer_reward} credits
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* How It Works */}
        <Card>
          <CardContent className="p-6">
            <h2 className="font-semibold mb-4">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <span className="font-bold text-primary">1</span>
                </div>
                <h3 className="font-medium mb-1">Share Your Link</h3>
                <p className="text-sm text-muted-foreground">Send your referral link to friends</p>
              </div>
              <div className="text-center p-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <span className="font-bold text-primary">2</span>
                </div>
                <h3 className="font-medium mb-1">They Sign Up</h3>
                <p className="text-sm text-muted-foreground">Friend creates an account and books</p>
              </div>
              <div className="text-center p-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <span className="font-bold text-primary">3</span>
                </div>
                <h3 className="font-medium mb-1">Both Earn Credits</h3>
                <p className="text-sm text-muted-foreground">
                  You both get {referralCode?.reward_credits || 500} credits!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Referrals */}
        {referrals.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Referrals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {referrals.slice(0, 10).map((referral) => (
                  <div key={referral.id} className="flex items-center justify-between py-3 border-b last:border-0">
                    <div>
                      <p className="font-medium">Referral #{referral.id.slice(0, 8)}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(referral.created_at), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge 
                        variant={
                          referral.status === 'completed' ? 'default' : 
                          referral.status === 'pending' ? 'secondary' : 'destructive'
                        }
                      >
                        {referral.status}
                      </Badge>
                      {referral.credits_earned && referral.credits_earned > 0 && (
                        <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1">
                          +{referral.credits_earned} credits
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </CleanerLayout>
  );
}
