import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  CheckCircle2, 
  Loader2, 
  ArrowLeft, 
  User, 
  Phone, 
  Camera, 
  IdCard, 
  ShieldCheck, 
  MapPin, 
  Calendar, 
  DollarSign,
  Sparkles
} from 'lucide-react';

interface OnboardingReviewStepProps {
  profileData: {
    firstName?: string | null;
    lastName?: string | null;
    bio?: string | null;
    profilePhotoUrl?: string | null;
    hourlyRate?: number | null;
    travelRadius?: number | null;
    phoneVerified?: boolean;
    serviceAreasCount?: number;
    availableDays?: number;
  };
  onComplete: () => Promise<void>;
  onBack: () => void;
  isCompleting: boolean;
}

export function OnboardingReviewStep({ profileData, onComplete, onBack, isCompleting }: OnboardingReviewStepProps) {
  const {
    firstName,
    lastName,
    bio,
    profilePhotoUrl,
    hourlyRate,
    travelRadius,
    phoneVerified,
    serviceAreasCount = 0,
    availableDays = 0,
  } = profileData;

  const fullName = [firstName, lastName].filter(Boolean).join(' ') || 'Your Name';
  const initials = [firstName?.[0], lastName?.[0]].filter(Boolean).join('').toUpperCase() || 'U';

  const handleComplete = async () => {
    await onComplete();
  };

  const completedItems = [
    { icon: User, label: 'Basic Info', completed: !!firstName && !!lastName && !!bio },
    { icon: Phone, label: 'Phone Verified', completed: phoneVerified },
    { icon: Camera, label: 'Profile Photo', completed: !!profilePhotoUrl },
    { icon: IdCard, label: 'ID Uploaded', completed: true }, // If they got here, it's done
    { icon: ShieldCheck, label: 'Background Check', completed: true }, // Consent given
    { icon: MapPin, label: 'Service Areas', completed: serviceAreasCount > 0 },
    { icon: Calendar, label: 'Availability Set', completed: availableDays > 0 },
    { icon: DollarSign, label: 'Rates Configured', completed: !!hourlyRate },
  ];

  return (
    <Card>
      <CardHeader className="text-center pb-2">
        <div className="flex justify-center mb-4">
          <div className="relative">
            <Avatar className="h-24 w-24 border-4 border-primary/20">
              <AvatarImage src={profilePhotoUrl || undefined} alt={fullName} />
              <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 bg-success text-white rounded-full p-1.5">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
        </div>
        <CardTitle className="flex items-center justify-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Almost There, {firstName || 'Pro'}!
        </CardTitle>
        <CardDescription>
          Review your profile before going live on the platform.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Profile Preview */}
        <div className="p-4 bg-muted/50 rounded-lg space-y-3">
          <h4 className="font-medium">{fullName}</h4>
          <p className="text-sm text-muted-foreground line-clamp-2">{bio || 'No bio provided'}</p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">
              <DollarSign className="h-3 w-3 mr-1" />
              {hourlyRate || 35} credits/hr
            </Badge>
            <Badge variant="secondary">
              <MapPin className="h-3 w-3 mr-1" />
              {travelRadius || 15}km radius
            </Badge>
            {serviceAreasCount > 0 && (
              <Badge variant="secondary">
                {serviceAreasCount} service {serviceAreasCount === 1 ? 'area' : 'areas'}
              </Badge>
            )}
            {availableDays > 0 && (
              <Badge variant="secondary">
                <Calendar className="h-3 w-3 mr-1" />
                {availableDays} days/week
              </Badge>
            )}
          </div>
        </div>

        {/* Checklist */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Setup Complete</h4>
          <div className="grid grid-cols-2 gap-2">
            {completedItems.map(({ icon: Icon, label, completed }) => (
              <div
                key={label}
                className="flex items-center gap-2 p-2 rounded-lg bg-muted/30"
              >
                <div className={completed ? 'text-success' : 'text-muted-foreground'}>
                  {completed ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </div>
                <span className="text-xs">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* What's Next */}
        <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
          <h4 className="font-medium text-sm mb-2">What happens next?</h4>
          <ul className="text-xs text-muted-foreground space-y-1.5">
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">1.</span>
              Your background check will be initiated (3-5 business days)
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">2.</span>
              Once approved, you'll start receiving job offers in your service areas
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">3.</span>
              Accept jobs, complete them, and get paid through the platform
            </li>
          </ul>
        </div>

        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button
            className="flex-1"
            onClick={handleComplete}
            disabled={isCompleting}
          >
            {isCompleting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Activating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Activate My Profile
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
