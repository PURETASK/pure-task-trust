import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { CleanerLayout } from "@/components/cleaner/CleanerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useJob } from "@/hooks/useJob";
import { useJobPhotos, useUploadJobPhoto } from "@/hooks/useJobPhotos";
import { useJobCheckins } from "@/hooks/useJobCheckins";
import { useCleanerProfile } from "@/hooks/useCleanerProfile";
import { PhotoRequirements, useJobPhotoValidation } from "@/components/job/PhotoRequirements";
import { supabase } from "@/integrations/supabase/client";
import { format, differenceInMinutes } from "date-fns";
import { useParams, useNavigate } from "react-router-dom";
import { 
  MapPin, Clock, Calendar, Camera, CheckCircle, Play, ArrowLeft,
  User, Image, Loader2, Upload, AlertTriangle, Timer, MessageCircle,
  Star, DollarSign, Navigation
} from "lucide-react";

export default function CleanerJobDetail() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: job, isLoading } = useJob(jobId || "");
  const { data: photos = [] } = useJobPhotos(jobId || "");
  const { profile } = useCleanerProfile();
  const uploadPhoto = useUploadJobPhoto(jobId || "");
  const { checkIn, checkOut, hasCheckedIn, hasCheckedOut } = useJobCheckins(jobId);
  const [selectedPhotoType, setSelectedPhotoType] = useState<"before" | "after">("before");
  const fileInputRef = useState<HTMLInputElement | null>(null);
  const [fileEl, setFileEl] = useState<HTMLInputElement | null>(null);
  const [elapsedMin, setElapsedMin] = useState(0);

  const { beforeCount, afterCount, canCheckout, missingBefore, missingAfter } = useJobPhotoValidation(photos);

  // Live elapsed timer
  useEffect(() => {
    if (!job?.check_in_at || job.status !== 'in_progress') return;
    const interval = setInterval(() => {
      setElapsedMin(differenceInMinutes(new Date(), new Date(job.check_in_at!)));
    }, 60000);
    setElapsedMin(differenceInMinutes(new Date(), new Date(job.check_in_at)));
    return () => clearInterval(interval);
  }, [job?.check_in_at, job?.status]);

  // Realtime job status subscription
  useEffect(() => {
    if (!jobId) return;
    const channel = supabase
      .channel(`cleaner-job:${jobId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'jobs', filter: `id=eq.${jobId}` }, () => {
        queryClient.invalidateQueries({ queryKey: ['job', jobId] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [jobId, queryClient]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await uploadPhoto.mutateAsync({ file, type: selectedPhotoType });
      toast({ title: `${selectedPhotoType === "before" ? "Before" : "After"} photo uploaded!` });
    } catch (error: any) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    }
  };

  const handleCheckin = async () => {
    if (!profile?.id || !job) return;
    try {
      await checkIn.mutateAsync({ 
        jobId: jobId!,
        jobLat: job.checkin_lat || 0,
        jobLng: job.checkin_lng || 0,
      });
      toast({ title: "Checked in successfully! Job is now in progress." });
    } catch (error: any) {
      toast({ title: "Check-in failed", description: error.message, variant: "destructive" });
    }
  };

  const handleCheckout = async () => {
    if (!profile?.id || !job) return;
    if (!canCheckout) {
      toast({
        title: "Photos Required",
        description: `Upload at least 1 before and 1 after photo to complete the job`,
        variant: "destructive",
      });
      return;
    }
    try {
      await checkOut.mutateAsync({ 
        jobId: jobId!,
        jobLat: job.checkin_lat || 0,
        jobLng: job.checkin_lng || 0,
      });
      toast({ title: "Job completed! Great work.", description: "The client will review and approve your payment." });
      navigate("/cleaner/jobs");
    } catch (error: any) {
      toast({ title: "Checkout failed", description: error.message, variant: "destructive" });
    }
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, JSX.Element> = {
      pending: <Badge variant="warning">Pending</Badge>,
      created: <Badge variant="warning">Pending</Badge>,
      confirmed: <Badge variant="default">Confirmed</Badge>,
      in_progress: <Badge className="bg-violet-500 text-white">In Progress</Badge>,
      completed: <Badge variant="success">Completed</Badge>,
    };
    return map[status] || <Badge variant="secondary">{status}</Badge>;
  };

  const photoProgress = Math.min(100, ((beforeCount + afterCount) / 2) * 100);
  const jobStep = job?.status === 'confirmed' ? 1 : job?.status === 'in_progress' ? 2 : job?.status === 'completed' ? 3 : 0;

  if (isLoading) {
    return (
      <CleanerLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      </CleanerLayout>
    );
  }

  if (!job) {
    return (
      <CleanerLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Job not found</p>
          <Button variant="link" onClick={() => navigate("/cleaner/jobs")}>Back to Jobs</Button>
        </div>
      </CleanerLayout>
    );
  }

  const isInProgress = job.status === "in_progress";
  const canCheckin = job.status === "confirmed" && !hasCheckedIn;
  const canCheckoutNow = job.status === "in_progress" && !hasCheckedOut;
  const isCompleted = job.status === "completed";

  return (
    <CleanerLayout>
      <div className="space-y-5 max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/cleaner/jobs")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold capitalize">
              {(job.cleaning_type || '').replace('_', ' ')} Clean
            </h1>
            <p className="text-muted-foreground text-sm">
              {job.client?.first_name} {job.client?.last_name}
            </p>
          </div>
          {getStatusBadge(job.status)}
        </div>

        {/* Progress Steps */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              {['Check In', 'In Progress', 'Complete'].map((step, i) => (
                <div key={step} className="flex items-center gap-2 flex-1">
                  <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${
                    jobStep > i ? 'bg-primary text-primary-foreground' :
                    jobStep === i + 1 ? 'bg-primary/20 text-primary border-2 border-primary' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {jobStep > i ? '✓' : i + 1}
                  </div>
                  <span className={`text-xs font-medium ${jobStep > i ? 'text-primary' : jobStep === i + 1 ? 'text-primary' : 'text-muted-foreground'}`}>
                    {step}
                  </span>
                  {i < 2 && <div className={`flex-1 h-0.5 ${jobStep > i ? 'bg-primary' : 'bg-border'}`} />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Job Details */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Job Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Date</p>
                  <p className="font-medium text-sm">
                    {job.scheduled_start_at ? format(new Date(job.scheduled_start_at), "EEE, MMM d") : "TBD"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Start Time</p>
                  <p className="font-medium text-sm">
                    {job.scheduled_start_at ? format(new Date(job.scheduled_start_at), "h:mm a") : "TBD"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Timer className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Duration</p>
                  <p className="font-medium text-sm">{job.estimated_hours || 2} hrs est.</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-lg bg-success/10 flex items-center justify-center">
                  <DollarSign className="h-4 w-4 text-success" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Your Earnings</p>
                  <p className="font-medium text-sm text-success">{job.escrow_credits_reserved || 0} cr</p>
                </div>
              </div>
            </div>

            {/* Service Address — shown once job is accepted */}
            {(() => {
              const addr = (job as any).address_line1
                ? [(job as any).address_line1, (job as any).address_city, (job as any).address_state].filter(Boolean).join(', ')
                : (job as any).address || null;
              return addr ? (
                <div className="pt-3 border-t border-border flex items-start gap-2.5">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Service Address</p>
                    <p className="font-medium text-sm">{addr}</p>
                  </div>
                </div>
              ) : null;
            })()}

            {isInProgress && job.check_in_at && (
              <div className="mt-3 pt-3 border-t border-border flex items-center gap-3 p-3 rounded-lg bg-primary/5">
                <Timer className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Time elapsed</p>
                  <p className="font-semibold text-sm">
                    {Math.floor(elapsedMin / 60)}h {elapsedMin % 60}m
                  </p>
                </div>
                <div className="flex-1">
                  <Progress value={Math.min(100, (elapsedMin / ((job.estimated_hours || 2) * 60)) * 100)} className="h-1.5" />
                </div>
              </div>
            )}
            
            {job.notes && (
              <div className="pt-3 border-t border-border">
                <p className="text-xs text-muted-foreground mb-1">Client Notes</p>
                <p className="text-sm bg-muted/50 p-3 rounded-lg">{job.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Check-in Action */}
        {canCheckin && (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Navigation className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-0.5">Ready to start?</h3>
                  <p className="text-sm text-muted-foreground mb-3">GPS check-in verifies your location and starts the job timer</p>
                  <Button size="lg" className="w-full" onClick={handleCheckin} disabled={checkIn.isPending}>
                    {checkIn.isPending ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <Play className="h-5 w-5 mr-2" />}
                    Check In & Start Job
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Photo Upload — Numbered Stepper */}
        {isInProgress && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Camera className="h-4 w-4" />
                Photo Documentation
                <Badge variant={canCheckout ? "success" : "warning"} className="ml-auto text-xs">
                  {beforeCount + afterCount} uploaded
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Numbered photo stepper */}
              <div className="space-y-2">
                {([
                  { step: 1, type: 'before' as const, label: 'Before Photos', desc: 'Capture the space before you start cleaning', count: beforeCount, done: beforeCount >= 1 },
                  { step: 2, type: 'after' as const, label: 'After Photos', desc: 'Show your completed work', count: afterCount, done: afterCount >= 1, locked: beforeCount === 0 },
                ] as const).map(({ step, type, label, desc, count, done, locked }) => (
                  <button
                    key={type}
                    onClick={() => { if (!locked) { setSelectedPhotoType(type); fileEl?.click(); } }}
                    disabled={!!locked}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                      done
                        ? 'border-success/40 bg-success/5'
                        : selectedPhotoType === type && !locked
                        ? 'border-primary bg-primary/5'
                        : locked
                        ? 'border-border bg-muted/30 opacity-50 cursor-not-allowed'
                        : 'border-border hover:border-primary/40 hover:bg-muted/50'
                    }`}
                  >
                    {/* Step number / checkmark */}
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold ${
                      done ? 'bg-success text-white' : locked ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary'
                    }`}>
                      {done ? '✓' : step}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{label}</p>
                        {count > 0 && (
                          <Badge variant="secondary" className="text-xs">{count} uploaded</Badge>
                        )}
                        {locked && (
                          <span className="text-xs text-muted-foreground">Upload before photos first</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{desc}</p>
                    </div>
                    {!done && !locked && (
                      <Upload className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    )}
                    {uploadPhoto.isPending && selectedPhotoType === type && (
                      <Loader2 className="h-4 w-4 animate-spin text-primary flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>

              <input
                ref={setFileEl}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileSelect}
                className="hidden"
              />

              {!canCheckout && (beforeCount > 0 || afterCount > 0) && (
                <div className="flex items-start gap-2 p-3 bg-warning/10 border border-warning/30 rounded-lg text-sm">
                  <AlertTriangle className="h-4 w-4 text-warning flex-shrink-0 mt-0.5" />
                  <span className="text-warning">
                    {beforeCount === 0 ? "Upload at least 1 before photo to continue." : "Upload at least 1 after photo to complete the job."}
                  </span>
                </div>
              )}

              {/* Photos grid */}
              {photos.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {photos.map((photo) => {
                    const isBefore = photo.photo_type === 'before' || photo.photo_url.includes('/before-');
                    return (
                      <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                        <img src={photo.photo_url} alt="Job photo" className="w-full h-full object-cover" />
                        <Badge className={`absolute top-1 left-1 text-xs ${isBefore ? '' : 'bg-success'}`} variant={isBefore ? 'secondary' : 'success'}>
                          {isBefore ? 'Before' : 'After'}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Checkout */}
        {canCheckoutNow && (
          <Card className={`${canCheckout ? "border-success/20 bg-success/5" : "border-warning/20 bg-warning/5"}`}>
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${canCheckout ? 'bg-success/10' : 'bg-warning/10'}`}>
                  <CheckCircle className={`h-6 w-6 ${canCheckout ? 'text-success' : 'text-warning'}`} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-0.5">
                    {canCheckout ? "Ready to complete?" : "Almost done!"}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {canCheckout
                      ? `In progress for ${Math.floor(elapsedMin / 60)}h ${elapsedMin % 60}m`
                      : "Upload required photos before completing"}
                  </p>
                  <Button
                    size="lg"
                    variant={canCheckout ? "success" : "outline"}
                    className="w-full"
                    onClick={handleCheckout}
                    disabled={checkOut.isPending || !canCheckout}
                  >
                    {checkOut.isPending ? (
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="h-5 w-5 mr-2" />
                    )}
                    {canCheckout ? "Complete & Check Out" : "Upload Photos First"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Completed state */}
        {isCompleted && (
          <Card className="border-success/20 bg-success/5">
            <CardContent className="p-5 text-center">
              <CheckCircle className="h-12 w-12 text-success mx-auto mb-3" />
              <h3 className="font-bold text-lg mb-1">Job Complete!</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Waiting for client approval. Your {job.escrow_credits_reserved || 0} credits will be released after review.
              </p>
              {photos.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {photos.slice(0, 6).map((photo) => (
                    <div key={photo.id} className="aspect-square rounded-lg overflow-hidden bg-muted">
                      <img src={photo.photo_url} alt="Job photo" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </CleanerLayout>
  );
}
