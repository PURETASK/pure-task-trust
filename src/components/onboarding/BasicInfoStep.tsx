import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, ArrowLeft, ArrowRight, Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';
import type { BasicInfoData } from '@/hooks/useCleanerOnboarding';

interface BasicInfoStepProps {
  initialData?: { firstName?: string | null; lastName?: string | null; bio?: string | null };
  onSubmit: (data: BasicInfoData) => Promise<void>;
  onBack?: () => void;
  isSubmitting: boolean;
}

const BIO_TIPS = [
  '"I have 5 years of experience with deep cleaning..."',
  '"Specialised in eco-friendly products..."',
  '"Detail-oriented and always on time..."',
];

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

  const bioLen = bio.trim().length;
  const isValid = firstName.trim() && lastName.trim() && bioLen >= 20;
  const bioProgress = Math.min((bioLen / 20) * 100, 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold text-foreground">Tell us about yourself</h2>
        <p className="text-muted-foreground mt-1">Clients choose cleaners by how much they connect with their story.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName" className="font-medium">First Name</Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Jane"
              className="h-11 rounded-xl"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName" className="font-medium">Last Name</Label>
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Smith"
              className="h-11 rounded-xl"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="bio" className="font-medium">Your Bio</Label>
            <span className={`text-xs font-medium ${bioLen >= 20 ? 'text-success' : 'text-muted-foreground'}`}>
              {bioLen < 20 ? `${20 - bioLen} more chars` : `${bioLen} chars ✓`}
            </span>
          </div>
          <Textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell clients about your experience, specialties, and what makes you stand out…"
            className="min-h-[110px] resize-none rounded-xl"
            required
          />
          {/* Progress bar */}
          <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${bioProgress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Bio tip */}
        <div className="flex items-start gap-3 p-4 bg-primary/5 rounded-xl border border-primary/10">
          <Lightbulb className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
          <div className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Pro tip: </span>
            {BIO_TIPS[Math.floor(Math.random() * BIO_TIPS.length)]} Get specific — it converts 3× better.
          </div>
        </div>

        <div className="flex gap-3 pt-1">
          {onBack && (
            <Button type="button" variant="outline" onClick={onBack} className="h-12 rounded-xl px-5">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <Button
            type="submit"
            className="flex-1 h-12 text-base font-semibold rounded-xl"
            disabled={!isValid || isSubmitting}
          >
            {isSubmitting ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>
            ) : (
              <><span>Continue</span><ArrowRight className="h-4 w-4 ml-2" /></>
            )}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
