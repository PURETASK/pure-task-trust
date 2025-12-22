import { CleanerLayout } from "@/components/cleaner/CleanerLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useBackgroundChecks } from "@/hooks/useBackgroundChecks";
import { useCleanerProfile } from "@/hooks/useCleanerProfile";
import { useToast } from "@/hooks/use-toast";
import { 
  Shield, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  ExternalLink,
  Camera,
  MapPin,
  FileCheck,
  Loader2
} from "lucide-react";
import { format } from "date-fns";

export default function CleanerVerification() {
  const { toast } = useToast();
  const { profile, isLoading: profileLoading } = useCleanerProfile();
  const { checks, latestCheck, isVerified, isLoading, requestCheck } = useBackgroundChecks();
  const isRequesting = requestCheck.isPending;

  const handleRequestCheck = async () => {
    try {
      await requestCheck.mutateAsync("checkr");
      toast({ 
        title: "Background check requested",
        description: "You'll receive an email with next steps."
      });
    } catch (error: any) {
      toast({ 
        title: "Request failed", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="success" className="gap-1"><CheckCircle className="h-3 w-3" />Verified</Badge>;
      case 'pending':
        return <Badge variant="warning" className="gap-1"><Clock className="h-3 w-3" />Pending</Badge>;
      case 'failed':
        return <Badge variant="destructive" className="gap-1"><AlertTriangle className="h-3 w-3" />Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <CleanerLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Verification & Trust</h1>
          <p className="text-muted-foreground mt-1">
            Build trust with clients by completing verification steps
          </p>
        </div>

        {/* Overall Status */}
        <Card className={isVerified ? "border-success/50 bg-success/5" : "border-warning/50 bg-warning/5"}>
          <CardContent className="py-6">
            <div className="flex items-center gap-4">
              <div className={`h-16 w-16 rounded-2xl flex items-center justify-center ${
                isVerified ? "bg-success/10" : "bg-warning/10"
              }`}>
                <Shield className={`h-8 w-8 ${isVerified ? "text-success" : "text-warning"}`} />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold">
                  {isVerified ? "Verified Cleaner" : "Verification Incomplete"}
                </h2>
                <p className="text-muted-foreground">
                  {isVerified 
                    ? "Your profile is fully verified. Clients can see your trust badges."
                    : "Complete the steps below to become a verified cleaner."
                  }
                </p>
              </div>
              {isVerified && (
                <Badge variant="success" className="text-lg py-2 px-4">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Verified
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Background Check */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-primary" />
              Background Check
            </CardTitle>
            <CardDescription>
              A background check helps build trust with clients
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading || profileLoading ? (
              <Skeleton className="h-24 rounded-lg" />
            ) : latestCheck ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium capitalize">{latestCheck.provider} Check</h3>
                      {getStatusBadge(latestCheck.status)}
                    </div>
                    {latestCheck.completed_at && (
                      <p className="text-sm text-muted-foreground">
                        Completed: {format(new Date(latestCheck.completed_at), 'MMM d, yyyy')}
                      </p>
                    )}
                    {latestCheck.expires_at && (
                      <p className="text-sm text-muted-foreground">
                        Expires: {format(new Date(latestCheck.expires_at), 'MMM d, yyyy')}
                      </p>
                    )}
                  </div>
                  {latestCheck.report_url && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={latestCheck.report_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Report
                      </a>
                    </Button>
                  )}
                </div>
                
                {latestCheck.status !== 'pending' && (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={handleRequestCheck}
                    disabled={isRequesting}
                  >
                    {isRequesting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Request New Background Check
                  </Button>
                )}
              </div>
            ) : (
              <div className="text-center py-6">
                <Shield className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground mb-4">
                  No background check on file
                </p>
                <Button 
                  onClick={handleRequestCheck}
                  disabled={isRequesting}
                >
                  {isRequesting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Start Background Check
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Additional Verifications */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Camera className="h-5 w-5 text-violet-500" />
                Photo Verification
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Upload before & after photos for each job
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Auto-enabled</Badge>
                    <CheckCircle className="h-4 w-4 text-success" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MapPin className="h-5 w-5 text-rose-500" />
                GPS Check-in
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Location verified when checking into jobs
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Auto-enabled</Badge>
                    <CheckCircle className="h-4 w-4 text-success" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Trust Benefits */}
        <Card>
          <CardHeader>
            <CardTitle>Benefits of Verification</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="h-6 w-6 text-success" />
                </div>
                <h4 className="font-medium mb-1">Trust Badge</h4>
                <p className="text-sm text-muted-foreground">
                  Display a verified badge on your profile
                </p>
              </div>
              <div className="text-center">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-medium mb-1">More Bookings</h4>
                <p className="text-sm text-muted-foreground">
                  Verified cleaners get 3x more bookings
                </p>
              </div>
              <div className="text-center">
                <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center mx-auto mb-3">
                  <FileCheck className="h-6 w-6 text-amber-500" />
                </div>
                <h4 className="font-medium mb-1">Priority Access</h4>
                <p className="text-sm text-muted-foreground">
                  See premium jobs before others
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </CleanerLayout>
  );
}
