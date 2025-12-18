import { CleanerLayout } from "@/components/cleaner/CleanerLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Gift, Users, Clock, CheckCircle, DollarSign, Copy, Mail, MessageSquare } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function CleanerReferral() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Generate a simple referral code from user ID
  const referralCode = user?.id ? user.id.slice(0, 8).toUpperCase() : "LOADING";
  const referralLink = `${window.location.origin}/auth?ref=${referralCode}`;

  const stats = {
    totalReferrals: 0,
    pending: 0,
    completed: 0,
    creditsEarned: 0,
  };

  const copyCode = () => {
    navigator.clipboard.writeText(referralCode);
    toast({
      title: "Copied!",
      description: "Referral code copied to clipboard",
    });
  };

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast({
      title: "Copied!",
      description: "Referral link copied to clipboard",
    });
  };

  return (
    <CleanerLayout>
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="h-20 w-20 mx-auto rounded-2xl bg-pink-500/10 flex items-center justify-center mb-4">
            <Gift className="h-10 w-10 text-pink-500" />
          </div>
          <h1 className="text-3xl font-bold">Refer & Earn</h1>
          <p className="text-muted-foreground mt-2">Give 500 credits, Get 500 credits</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800">
            <CardContent className="p-5 text-center">
              <Users className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.totalReferrals}</div>
              <div className="text-sm text-muted-foreground">Total Referrals</div>
            </CardContent>
          </Card>
          <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
            <CardContent className="p-5 text-center">
              <Clock className="h-8 w-8 text-amber-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.pending}</div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </CardContent>
          </Card>
          <Card className="bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800">
            <CardContent className="p-5 text-center">
              <CheckCircle className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.completed}</div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </CardContent>
          </Card>
          <Card className="bg-cyan-50 dark:bg-cyan-950/20 border-cyan-200 dark:border-cyan-800">
            <CardContent className="p-5 text-center">
              <DollarSign className="h-8 w-8 text-cyan-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.creditsEarned}</div>
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
                    <span className="text-lg font-bold text-primary">{referralCode}</span>
                  </div>
                  <Button onClick={copyCode} className="gap-2">
                    <Copy className="h-4 w-4" />
                    Copy Code
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Full Referral Link</label>
                <div className="flex gap-2">
                  <Input value={referralLink} readOnly className="text-sm" />
                  <Button variant="outline" size="icon" onClick={copyLink}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <Button variant="outline" className="gap-2">
                  <Mail className="h-4 w-4" />
                  Share via Email
                </Button>
                <Button variant="outline" className="gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Share via SMS
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

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
                <p className="text-sm text-muted-foreground">You both get 500 credits!</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </CleanerLayout>
  );
}
