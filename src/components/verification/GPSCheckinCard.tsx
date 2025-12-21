import { MapPin, Navigation, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useJobCheckins } from '@/hooks/useJobCheckins';
import { format } from 'date-fns';

interface GPSCheckinCardProps {
  jobId: string;
  jobLat: number;
  jobLng: number;
  jobAddress: string;
}

export function GPSCheckinCard({ jobId, jobLat, jobLng, jobAddress }: GPSCheckinCardProps) {
  const { checkins, hasCheckedIn, hasCheckedOut, checkIn, checkOut } = useJobCheckins(jobId);

  const lastCheckin = checkins?.filter(c => c.type === 'check_in').pop();
  const lastCheckout = checkins?.filter(c => c.type === 'check_out').pop();

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Navigation className="h-5 w-5" />
          GPS Verification
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Job location */}
        <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
          <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div>
            <p className="text-sm font-medium">Job Location</p>
            <p className="text-sm text-muted-foreground">{jobAddress}</p>
          </div>
        </div>

        {/* Check-in status */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`h-3 w-3 rounded-full ${hasCheckedIn ? 'bg-success' : 'bg-muted'}`} />
              <span className="text-sm">Check-in</span>
            </div>
            {lastCheckin ? (
              <div className="text-right">
                <Badge variant={lastCheckin.is_within_radius ? 'success' : 'secondary'} className="text-xs">
                  {lastCheckin.is_within_radius ? 'Verified' : `${lastCheckin.distance_from_job_meters}m away`}
                </Badge>
                <p className="text-xs text-muted-foreground mt-1">
                  {format(new Date(lastCheckin.created_at), 'h:mm a')}
                </p>
              </div>
            ) : (
              <Button
                size="sm"
                onClick={() => checkIn.mutate({ jobId, jobLat, jobLng })}
                disabled={checkIn.isPending || hasCheckedIn}
              >
                {checkIn.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Check In'
                )}
              </Button>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`h-3 w-3 rounded-full ${hasCheckedOut ? 'bg-success' : 'bg-muted'}`} />
              <span className="text-sm">Check-out</span>
            </div>
            {lastCheckout ? (
              <div className="text-right">
                <Badge variant={lastCheckout.is_within_radius ? 'success' : 'secondary'} className="text-xs">
                  {lastCheckout.is_within_radius ? 'Verified' : `${lastCheckout.distance_from_job_meters}m away`}
                </Badge>
                <p className="text-xs text-muted-foreground mt-1">
                  {format(new Date(lastCheckout.created_at), 'h:mm a')}
                </p>
              </div>
            ) : (
              <Button
                size="sm"
                onClick={() => checkOut.mutate({ jobId, jobLat, jobLng })}
                disabled={checkOut.isPending || !hasCheckedIn || hasCheckedOut}
                variant={hasCheckedIn ? 'default' : 'outline'}
              >
                {checkOut.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Check Out'
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Distance warning */}
        {(lastCheckin && !lastCheckin.is_within_radius) && (
          <div className="flex items-start gap-2 p-3 bg-warning/10 rounded-lg text-warning">
            <AlertCircle className="h-4 w-4 mt-0.5" />
            <p className="text-sm">
              Check-in recorded but you were {lastCheckin.distance_from_job_meters}m from the job site. 
              Please ensure you're at the correct location.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
