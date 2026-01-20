import { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CleanerLayout } from "@/components/cleaner/CleanerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useJob } from "@/hooks/useJob";
import { useJobPhotos, useUploadJobPhoto } from "@/hooks/useJobPhotos";
import { useJobCheckins } from "@/hooks/useJobCheckins";
import { useCleanerProfile } from "@/hooks/useCleanerProfile";
import { PhotoRequirements, useJobPhotoValidation } from "@/components/job/PhotoRequirements";
import { format } from "date-fns";
import { 
  MapPin, 
  Clock, 
  Calendar, 
  Camera, 
  CheckCircle, 
  Play, 
  ArrowLeft,
  User,
  Image,
  Loader2,
  Upload,
  AlertTriangle
} from "lucide-react";

export default function CleanerJobDetail() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: job, isLoading } = useJob(jobId || "");
  const { data: photos = [] } = useJobPhotos(jobId || "");
  const { profile } = useCleanerProfile();
  const uploadPhoto = useUploadJobPhoto(jobId || "");
  const { checkIn, checkOut, hasCheckedIn, hasCheckedOut } = useJobCheckins(jobId);
  
  const [selectedPhotoType, setSelectedPhotoType] = useState<"before" | "after">("before");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Photo validation
  const { beforeCount, afterCount, canCheckout, missingBefore, missingAfter } = useJobPhotoValidation(photos);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await uploadPhoto.mutateAsync({ file, type: selectedPhotoType });
      toast({ title: `${selectedPhotoType === "before" ? "Before" : "After"} photo uploaded!` });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
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
    } catch (error: any) {
      toast({
        title: "Check-in failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleCheckout = async () => {
    if (!profile?.id || !job) return;
    
    // Validate photos before allowing checkout
    if (!canCheckout) {
      let description = "Please upload required photos before completing the job:";
      if (missingBefore) description += " • At least 1 before photo";
      if (missingAfter) description += " • At least 1 after photo";
      
      toast({
        title: "Photos Required",
        description,
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
      navigate("/cleaner/jobs");
    } catch (error: any) {
      toast({
        title: "Checkout failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
      case "created":
        return <Badge variant="warning">Pending</Badge>;
      case "confirmed":
        return <Badge variant="default">Confirmed</Badge>;
      case "on_way":
        return <Badge className="bg-blue-500">On the Way</Badge>;
      case "arrived":
        return <Badge className="bg-indigo-500">Arrived</Badge>;
      case "in_progress":
        return <Badge className="bg-violet-500">In Progress</Badge>;
      case "completed":
        return <Badge variant="success">Completed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getCleaningTypeLabel = (type: string) => {
    switch (type) {
      case "deep":
        return "Deep Clean";
      case "move_out":
        return "Move-out Clean";
      default:
        return "Standard Clean";
    }
  };

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
          <Button variant="link" onClick={() => navigate("/cleaner/jobs")}>
            Back to Jobs
          </Button>
        </div>
      </CleanerLayout>
    );
  }

  const isInProgress = job.status === "in_progress";
  const canCheckin = job.status === "confirmed" && !hasCheckedIn;
  const canCheckoutNow = job.status === "in_progress" && !hasCheckedOut;

  return (
    <CleanerLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/cleaner/jobs")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{getCleaningTypeLabel(job.cleaning_type)}</h1>
            <p className="text-muted-foreground">
              {job.client?.first_name} {job.client?.last_name}
            </p>
          </div>
          {getStatusBadge(job.status)}
        </div>

        {/* Job Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Job Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">
                    {job.scheduled_start_at
                      ? format(new Date(job.scheduled_start_at), "EEE, MMM d")
                      : "TBD"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Time</p>
                  <p className="font-medium">
                    {job.scheduled_start_at
                      ? format(new Date(job.scheduled_start_at), "h:mm a")
                      : "TBD"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="font-medium">{job.estimated_hours || 2} hours</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Earnings</p>
                  <p className="font-medium text-success">{job.escrow_credits_reserved} credits</p>
                </div>
              </div>
            </div>
            
            {job.notes && (
              <div className="pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground mb-1">Notes</p>
                <p className="text-sm">{job.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Check-in Action */}
        {canCheckin && (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-6">
              <div className="text-center mb-4">
                <h3 className="font-semibold mb-1">Ready to start?</h3>
                <p className="text-sm text-muted-foreground">
                  Check in with GPS to begin the job
                </p>
              </div>
              <Button 
                size="lg" 
                className="w-full"
                onClick={handleCheckin}
                disabled={checkIn.isPending}
              >
                {checkIn.isPending ? (
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                ) : (
                  <Play className="h-5 w-5 mr-2" />
                )}
                Check In & Start Job
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Photo Upload Section (in progress) */}
        {isInProgress && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Camera className="h-5 w-5" />
                Job Photos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Photo Requirements */}
              <PhotoRequirements 
                beforeCount={beforeCount} 
                afterCount={afterCount} 
              />
              
              {!canCheckout && (
                <div className="flex items-start gap-2 p-3 bg-warning/10 border border-warning/30 rounded-lg text-sm">
                  <AlertTriangle className="h-4 w-4 text-warning flex-shrink-0 mt-0.5" />
                  <span className="text-warning">
                    Upload at least 1 before photo and 1 after photo to complete the job
                  </span>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant={selectedPhotoType === "before" ? "default" : "outline"}
                  onClick={() => setSelectedPhotoType("before")}
                  className="flex-1"
                >
                  Before ({beforeCount})
                </Button>
                <Button
                  variant={selectedPhotoType === "after" ? "default" : "outline"}
                  onClick={() => setSelectedPhotoType("after")}
                  className="flex-1"
                >
                  After ({afterCount})
                </Button>
              </div>

              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
              >
                {uploadPhoto.isPending ? (
                  <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
                ) : (
                  <>
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Tap to upload {selectedPhotoType} photo
                    </p>
                  </>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileSelect}
                className="hidden"
              />

              {/* Photo Grid */}
              {photos.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {photos.map((photo) => (
                    <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                      <img 
                        src={photo.photo_url} 
                        alt="Job photo"
                        className="w-full h-full object-cover"
                      />
                      <Badge 
                        className="absolute top-1 left-1 text-xs"
                        variant={photo.photo_type === 'before' || photo.photo_url.includes('/before-') ? 'secondary' : 'success'}
                      >
                        {photo.photo_type === 'before' || photo.photo_url.includes('/before-') ? 'B' : 'A'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Checkout Action */}
        {canCheckoutNow && (
          <Card className={canCheckout ? "border-success/20 bg-success/5" : "border-warning/20 bg-warning/5"}>
            <CardContent className="p-6">
              <div className="text-center mb-4">
                <p className="text-sm text-muted-foreground mb-1">Job in progress since</p>
                <p className="font-medium">
                  {job.check_in_at 
                    ? format(new Date(job.check_in_at), "h:mm a")
                    : "Just now"}
                </p>
              </div>
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
                {canCheckout ? "Complete & Check Out" : "Upload Required Photos First"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Completed Job Photos */}
        {job.status === "completed" && photos.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Image className="h-5 w-5" />
                Job Photos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2">
                {photos.map((photo) => (
                  <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                    <img 
                      src={photo.photo_url} 
                      alt="Job photo"
                      className="w-full h-full object-cover"
                    />
                    <Badge 
                      className="absolute top-1 left-1 text-xs"
                      variant={photo.photo_type === 'before' || photo.photo_url.includes('/before-') ? 'secondary' : 'success'}
                    >
                      {photo.photo_type === 'before' || photo.photo_url.includes('/before-') ? 'Before' : 'After'}
                    </Badge>
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
