import { Shield, Check, AlertTriangle, Clock, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useBackgroundChecks } from '@/hooks/useBackgroundChecks';
import { format } from 'date-fns';

export function BackgroundCheckCard() {
  const { latestCheck, isVerified, isLoading, requestCheck } = useBackgroundChecks();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse h-20 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Shield className="h-5 w-5" />
          Background Check
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {latestCheck ? (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isVerified ? (
                  <>
                    <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center">
                      <Check className="h-5 w-5 text-success" />
                    </div>
                    <div>
                      <p className="font-medium">Verified</p>
                      <p className="text-sm text-muted-foreground">
                        {latestCheck.provider} background check passed
                      </p>
                    </div>
                  </>
                ) : latestCheck.status === 'pending' ? (
                  <>
                    <div className="h-10 w-10 rounded-full bg-warning/10 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-warning" />
                    </div>
                    <div>
                      <p className="font-medium">In Progress</p>
                      <p className="text-sm text-muted-foreground">
                        Background check is being processed
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center">
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                    </div>
                    <div>
                      <p className="font-medium">Action Required</p>
                      <p className="text-sm text-muted-foreground">
                        Please complete your background check
                      </p>
                    </div>
                  </>
                )}
              </div>
              <Badge variant={isVerified ? 'success' : latestCheck.status === 'pending' ? 'secondary' : 'destructive'}>
                {latestCheck.status}
              </Badge>
            </div>

            {latestCheck.expires_at && isVerified && (
              <div className="text-sm text-muted-foreground">
                Expires: {format(new Date(latestCheck.expires_at), 'MMM d, yyyy')}
              </div>
            )}

            {latestCheck.report_url && (
              <Button variant="outline" size="sm" className="gap-2" asChild>
                <a href={latestCheck.report_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                  View Report
                </a>
              </Button>
            )}
          </>
        ) : (
          <div className="text-center py-4">
            <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground mb-4">
              Complete a background check to build trust with clients
            </p>
            <Button 
              onClick={() => requestCheck.mutate('checkr')}
              disabled={requestCheck.isPending}
            >
              Start Background Check
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
