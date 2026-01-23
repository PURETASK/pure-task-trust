import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, User, ArrowLeft } from 'lucide-react';
import type { BasicInfoData } from '@/hooks/useCleanerOnboarding';

interface BasicInfoStepProps {
  initialData?: {
    firstName?: string | null;
    lastName?: string | null;
    bio?: string | null;
  };
  onSubmit: (data: BasicInfoData) => Promise<void>;
  onBack?: () => void;
  isSubmitting: boolean;
}

export function BasicInfoStep({ initialData, onSubmit, onBack, isSubmitting }: BasicInfoStepProps) {
  const [firstName, setFirstName] = useState(initialData?.firstName || '');
  const [lastName, setLastName] = useState(initialData?.lastName || '');
  const [bio, setBio] = useState(initialData?.bio || '');

  useEffect(() => {
    if (initialData) {
      setFirstName(initialData.firstName || '');
      setLastName(initialData.lastName || '');
      setBio(initialData.bio || '');
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ firstName, lastName, bio });
  };

  const isValid = firstName.trim() && lastName.trim() && bio.trim().length >= 20;

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <User className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-2xl">Tell us about yourself</CardTitle>
        <CardDescription>
          Help clients get to know you before they book
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Jane"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Smith"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Your Bio *</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell clients about your experience, specialties, and what makes you great at what you do..."
              className="min-h-[120px] resize-none"
              required
            />
            <p className="text-xs text-muted-foreground">
              {bio.length < 20 
                ? `At least ${20 - bio.length} more characters needed`
                : `${bio.length} characters`
              }
            </p>
          </div>

          <div className="flex gap-3">
            {onBack && (
              <Button type="button" variant="outline" onClick={onBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            )}
            <Button 
              type="submit" 
              className="flex-1" 
              size="lg"
              disabled={!isValid || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Continue'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
