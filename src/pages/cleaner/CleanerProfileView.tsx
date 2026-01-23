import { Link } from "react-router-dom";
import { CleanerLayout } from "@/components/cleaner/CleanerLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useCleanerProfile } from "@/hooks/useCleanerProfile";
import { useBackgroundChecks } from "@/hooks/useBackgroundChecks";
import { getTierFromScore, getTierConfig, CleanerTier } from "@/lib/tier-config";
import { 
  User, 
  Mail, 
  Phone, 
  Edit, 
  MapPin, 
  DollarSign, 
  Wallet, 
  Bell, 
  Calendar,
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  ChevronRight,
  Award,
  Briefcase,
  TrendingUp,
  Home,
  Dog,
  Leaf,
  Package,
  Users,
  Map
} from "lucide-react";

export default function CleanerProfileView() {
  const { user } = useAuth();
  const { profile, isLoading } = useCleanerProfile();
  const { latestCheck, isVerified: bgCheckVerified } = useBackgroundChecks();

  const reliabilityScore = profile?.reliability_score || 0;
  const tier = getTierFromScore(reliabilityScore) as CleanerTier;
  const tierConfig = getTierConfig(tier);

  const getInitials = (name?: string | null) => {
    if (!name) return "C";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const getVerificationStatusBadge = (status: string | null | undefined) => {
    if (!status || status === "pending") {
      return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" />Pending</Badge>;
    }
    if (status === "passed" || status === "verified") {
      return <Badge className="gap-1 bg-success"><CheckCircle className="h-3 w-3" />Verified</Badge>;
    }
    return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" />Failed</Badge>;
  };

  if (isLoading) {
    return (
      <CleanerLayout>
        <div className="max-w-3xl mx-auto space-y-6">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      </CleanerLayout>
    );
  }

  return (
    <CleanerLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Profile</h1>
            <p className="text-muted-foreground mt-1">View and manage your professional profile</p>
          </div>
          <Button asChild>
            <Link to="/cleaner/profile" className="gap-2">
              <Edit className="h-4 w-4" />
              Edit Profile
            </Link>
          </Button>
        </div>

        {/* Tier Status Banner */}
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-primary/20 flex items-center justify-center">
                <Award className="h-7 w-7 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-lg">{tier.charAt(0).toUpperCase() + tier.slice(1)} Tier</h3>
                  <Badge variant="outline">{reliabilityScore} points</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Rate range: ${tierConfig.hourlyRateRange.min}-${tierConfig.hourlyRateRange.max}/hr • Platform fee: {tierConfig.platformFeePercent}%
                </p>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {tier === 'platinum' ? 'Max tier!' : 'Keep improving to unlock higher rates'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Professional Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Professional Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile?.profile_photo_url || undefined} />
                <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                  {getInitials(`${profile?.first_name} ${profile?.last_name}`)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium text-lg">
                    {profile?.first_name} {profile?.last_name || ""}
                  </p>
                </div>
                {profile?.professional_headline && (
                  <div>
                    <p className="text-sm text-muted-foreground">Headline</p>
                    <p className="font-medium">{profile.professional_headline}</p>
                  </div>
                )}
                <div className="flex gap-6">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{user?.email}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-success" />
                    <span className="font-semibold">${profile?.hourly_rate_credits || tierConfig.hourlyRateRange.min}/hr</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{profile?.travel_radius_km || 15} mile radius</span>
                  </div>
                </div>
                {profile?.bio && (
                  <div>
                    <p className="text-sm text-muted-foreground">About</p>
                    <p className="text-sm mt-1">{profile.bio}</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Service Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" />
              Service Preferences
            </CardTitle>
            <CardDescription>Your cleaning specialties and capabilities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="gap-1">
                <Home className="h-3 w-3" /> Basic Cleaning
              </Badge>
              {profile?.bio?.toLowerCase().includes("deep") && (
                <Badge variant="secondary" className="gap-1">
                  Deep Cleaning
                </Badge>
              )}
              <Badge variant="secondary" className="gap-1">
                <Dog className="h-3 w-3" /> Pet Friendly
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <Leaf className="h-3 w-3" /> Eco-Friendly
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <Package className="h-3 w-3" /> Own Supplies
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Verification Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Verification Status
            </CardTitle>
            <CardDescription>Your trust and verification badges</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                <Shield className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm font-medium">Background Check</p>
                  {getVerificationStatusBadge(latestCheck?.status)}
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                <User className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm font-medium">ID Verification</p>
                  {getVerificationStatusBadge(profile?.background_check_status)}
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                <Phone className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm font-medium">Phone Verified</p>
                  <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" />Not Set</Badge>
                </div>
              </div>
            </div>
            <Button variant="outline" asChild className="w-full">
              <Link to="/cleaner/verification">Manage Verifications</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Links</CardTitle>
            <CardDescription>Access your account features</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              <Link 
                to="/cleaner/earnings" 
                className="flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                    <Wallet className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="font-medium">Earnings & Payouts</p>
                    <p className="text-sm text-muted-foreground">View your earnings and payout history</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </Link>

              <Link 
                to="/cleaner/availability" 
                className="flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-medium">Availability</p>
                    <p className="text-sm text-muted-foreground">Set your working hours and time off</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </Link>

              <Link 
                to="/cleaner/service-areas" 
                className="flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <Map className="h-5 w-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="font-medium">Service Areas</p>
                    <p className="text-sm text-muted-foreground">Manage where you work</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </Link>

              <Link 
                to="/cleaner/team" 
                className="flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-violet-500" />
                  </div>
                  <div>
                    <p className="font-medium">My Team</p>
                    <p className="text-sm text-muted-foreground">Manage your cleaning team</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </Link>

              <Link 
                to="/notification-settings" 
                className="flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-rose-500/10 flex items-center justify-center">
                    <Bell className="h-5 w-5 text-rose-500" />
                  </div>
                  <div>
                    <p className="font-medium">Notifications</p>
                    <p className="text-sm text-muted-foreground">Email, push, and SMS preferences</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </CleanerLayout>
  );
}
