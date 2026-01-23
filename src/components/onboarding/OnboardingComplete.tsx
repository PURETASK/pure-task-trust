import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Loader2, Sparkles, Calendar, DollarSign, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

interface OnboardingCompleteProps {
  onComplete: () => Promise<void>;
  isCompleting: boolean;
}

export function OnboardingComplete({ onComplete, isCompleting }: OnboardingCompleteProps) {
  const navigate = useNavigate();

  const handleGoToDashboard = async () => {
    await onComplete();
    navigate('/cleaner/dashboard');
  };

  const features = [
    { icon: Calendar, text: 'Set your availability' },
    { icon: DollarSign, text: 'Start earning' },
    { icon: Shield, text: 'ID verification pending' },
  ];

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="text-center pb-2">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="mx-auto h-20 w-20 rounded-full bg-success/10 flex items-center justify-center mb-4"
        >
          <CheckCircle2 className="h-10 w-10 text-success" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <CardTitle className="text-2xl">You're all set!</CardTitle>
          <CardDescription className="mt-2">
            Your profile is ready. Let's start finding clients.
          </CardDescription>
        </motion.div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* What's next */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          <h4 className="font-medium text-sm flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            What's next
          </h4>
          <div className="space-y-2">
            {features.map((feature, index) => (
              <motion.div
                key={feature.text}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
              >
                <feature.icon className="h-5 w-5 text-primary" />
                <span className="text-sm">{feature.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ID verification notice */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-warning/10 border border-warning/20 rounded-lg p-4 text-sm"
        >
          <p className="font-medium text-warning-foreground">
            ID Verification Pending
          </p>
          <p className="text-muted-foreground mt-1">
            Your ID is being reviewed. You can start accepting jobs while we verify your identity.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Button 
            onClick={handleGoToDashboard}
            disabled={isCompleting}
            className="w-full"
            size="lg"
          >
            {isCompleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Finishing up...
              </>
            ) : (
              'Go to Dashboard'
            )}
          </Button>
        </motion.div>
      </CardContent>
    </Card>
  );
}
