import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, Award, CheckCircle, Clock, Camera, MessageSquare,
  Star, XCircle, AlertTriangle, DollarSign, Zap, Shield, Info
} from 'lucide-react';
import { motion } from 'framer-motion';
import { SEO } from '@/components/seo';

export default function ReliabilityScoreExplained() {
  return (
    <main className="container py-12">
      <SEO 
        title="Reliability Score Explained"
        description="Learn how PureTask calculates cleaner reliability scores, tier system benefits, and how cleaners can improve their ratings for more bookings."
        url="/reliability-score"
        keywords="cleaner reliability score, cleaning service rating, how to improve cleaner score, cleaning service tiers"
      />
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
          <TrendingUp className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Reliability Score Guide
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          How we calculate your score and what it means for your success
        </p>
      </motion.div>

      {/* Score Overview */}
      <Card className="mb-8 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="p-8 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Your Score Matters</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Higher scores mean more bookings, higher rates, and better client trust. 
            Your reliability score ranges from 0-100 and updates after each job.
          </p>
        </CardContent>
      </Card>

      {/* Tier System */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            Tier System
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <TierCard 
              tier="Bronze"
              score="0-69"
              rateRange="80-100"
              color="amber"
              features={[
                "Standard visibility",
                "Basic support",
                "Limited marketplace access"
              ]}
            />
            <TierCard 
              tier="Silver"
              score="70-84"
              rateRange="100-130"
              color="slate"
              features={[
                "Improved visibility",
                "Priority job matching",
                "Full marketplace access"
              ]}
            />
            <TierCard 
              tier="Gold"
              score="85-94"
              rateRange="130-170"
              color="yellow"
              features={[
                "Top search results",
                "Premium client matching",
                "Early job notifications"
              ]}
              highlight
            />
            <TierCard 
              tier="Platinum"
              score="95-100"
              rateRange="170-220"
              color="violet"
              features={[
                "VIP client access",
                "Exclusive job offers",
                "Maximum earning potential"
              ]}
            />
          </div>
        </CardContent>
      </Card>

      {/* Scoring Components */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-primary" />
            How Your Score is Calculated
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ComponentExplanation 
            icon={CheckCircle}
            name="Job Completion"
            points={25}
            description="Complete jobs on time without issues. Each successful completion adds to your score."
            color="green"
          />
          <ComponentExplanation 
            icon={Clock}
            name="On-Time Check-ins"
            points={20}
            description="GPS check-in within 15 minutes of scheduled start time. Punctuality builds trust."
            color="blue"
          />
          <ComponentExplanation 
            icon={Camera}
            name="Photo Documentation"
            points={20}
            description="Submit clear before/after photos for every job. Photos protect you and verify quality."
            color="purple"
          />
          <ComponentExplanation 
            icon={MessageSquare}
            name="Communication"
            points={15}
            description="Respond to messages promptly and keep clients informed about any changes."
            color="teal"
          />
          <ComponentExplanation 
            icon={Star}
            name="Client Ratings"
            points={20}
            description="Average rating from client reviews. Great service = great ratings = higher score."
            color="amber"
          />

          <div className="mt-8 pt-6 border-t border-border">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Penalties (Things to Avoid)
            </h3>
            <div className="grid gap-4 md:grid-cols-3">
              <PenaltyExplanation 
                name="No-Shows"
                maxPoints="-30"
                description="Missing a scheduled job without notice severely impacts your score."
              />
              <PenaltyExplanation 
                name="Late Cancellations"
                maxPoints="-15"
                description="Canceling within 24 hours of a job start time."
              />
              <PenaltyExplanation 
                name="Disputes Lost"
                maxPoints="-20"
                description="Client disputes resolved against you affect your reliability."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Wins */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Easy Ways to Improve Your Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <QuickWin 
              icon={Clock}
              title="Arrive 10 Minutes Early"
              description="Check in via GPS right when you arrive. On-time check-ins are the easiest points to earn."
            />
            <QuickWin 
              icon={Camera}
              title="Take Clear Photos"
              description="Before and after photos for every room. Good lighting and clear angles make a difference."
            />
            <QuickWin 
              icon={MessageSquare}
              title="Communicate Proactively"
              description="Send a quick message when you're on your way. Clients love being informed."
            />
            <QuickWin 
              icon={Star}
              title="Go the Extra Mile"
              description="Small touches like straightening pillows or wiping doorknobs lead to 5-star reviews."
            />
          </div>
        </CardContent>
      </Card>

      {/* Benefits of High Score */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            Why a High Score Matters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            <BenefitItem 
              icon={DollarSign}
              text="Earn up to 2x higher rates than lower-tier cleaners"
            />
            <BenefitItem 
              icon={Star}
              text="Appear first in client search results"
            />
            <BenefitItem 
              icon={Zap}
              text="Get notified about premium jobs before others"
            />
            <BenefitItem 
              icon={Shield}
              text="Build long-term relationships with repeat clients"
            />
            <BenefitItem 
              icon={Award}
              text="Unlock exclusive bonuses and promotions"
            />
          </div>
        </CardContent>
      </Card>

      {/* FAQs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5 text-primary" />
            Frequently Asked Questions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FAQItem 
            question="How often does my score update?"
            answer="Your score updates after each completed job, typically within 24 hours. Major events like no-shows update immediately."
          />
          <FAQItem 
            question="Can I recover from a low score?"
            answer="Yes! Your score is based on your last 30 jobs, so consistent good performance will improve your score over time. Focus on completing jobs well and avoiding penalties."
          />
          <FAQItem 
            question="What happens if I get a bad review?"
            answer="One bad review won't tank your score. It's averaged with all your other reviews. Focus on addressing the feedback and delivering great service going forward."
          />
          <FAQItem 
            question="Do cancellations always hurt my score?"
            answer="Not always. Cancellations with 48+ hours notice have minimal impact. Emergency cancellations with documentation are also handled fairly. It's last-minute cancellations and no-shows that hurt most."
          />
          <FAQItem 
            question="How do I see my current score breakdown?"
            answer="Visit your Cleaner Dashboard to see your overall score and individual component scores. You can track your progress and identify areas for improvement."
          />
        </CardContent>
      </Card>
    </main>
  );
}

interface TierCardProps {
  tier: string;
  score: string;
  rateRange: string;
  color: string;
  features: string[];
  highlight?: boolean;
}

function TierCard({ tier, score, rateRange, color, features, highlight = false }: TierCardProps) {
  const colorClasses: Record<string, string> = {
    amber: 'border-amber-300 bg-amber-50 dark:bg-amber-950/20',
    slate: 'border-slate-300 bg-slate-50 dark:bg-slate-950/20',
    yellow: 'border-yellow-400 bg-yellow-50 dark:bg-yellow-950/20',
    violet: 'border-violet-400 bg-violet-50 dark:bg-violet-950/20'
  };

  return (
    <Card className={`relative ${colorClasses[color] || ''} ${highlight ? 'ring-2 ring-primary' : ''}`}>
      <CardContent className="p-6 text-center">
        {highlight && (
          <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary">
            Best Rate
          </Badge>
        )}
        <h3 className="text-xl font-bold text-foreground mb-1">{tier}</h3>
        <p className="text-2xl font-bold text-primary mb-1">{score}</p>
        <p className="text-sm text-muted-foreground mb-4">${rateRange}/hr</p>
        <ul className="space-y-2 text-left">
          {features.map((feature, idx) => (
            <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
              {feature}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

interface ComponentExplanationProps {
  icon: React.ComponentType<{ className?: string }>;
  name: string;
  points: number;
  description: string;
  color: string;
}

function ComponentExplanation({ icon: Icon, name, points, description, color }: ComponentExplanationProps) {
  const colorClasses: Record<string, string> = {
    green: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400',
    blue: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400',
    purple: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400',
    teal: 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-400',
    amber: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
  };

  return (
    <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
      <div className={`p-2 rounded-lg ${colorClasses[color] || 'bg-primary/10 text-primary'}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <h4 className="font-semibold text-foreground">{name}</h4>
          <Badge variant="secondary" className="text-green-600">
            +{points} pts
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

interface PenaltyExplanationProps {
  name: string;
  maxPoints: string;
  description: string;
}

function PenaltyExplanation({ name, maxPoints, description }: PenaltyExplanationProps) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-lg bg-destructive/5 border border-destructive/20">
      <XCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-semibold text-foreground">{name}</h4>
          <Badge variant="destructive" className="text-xs">
            {maxPoints} pts
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

interface QuickWinProps {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

function QuickWin({ title, description, icon: Icon }: QuickWinProps) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors">
      <div className="p-2 rounded-lg bg-primary/10">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div>
        <h4 className="font-semibold text-foreground mb-1">{title}</h4>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

interface BenefitItemProps {
  icon: React.ComponentType<{ className?: string }>;
  text: string;
}

function BenefitItem({ icon: Icon, text }: BenefitItemProps) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900">
      <Icon className="w-5 h-5 text-green-600 shrink-0" />
      <span className="text-sm text-foreground">{text}</span>
    </div>
  );
}

interface FAQItemProps {
  question: string;
  answer: string;
}

function FAQItem({ question, answer }: FAQItemProps) {
  return (
    <div className="p-4 rounded-lg bg-muted/50">
      <h4 className="font-semibold text-foreground mb-2">{question}</h4>
      <p className="text-sm text-muted-foreground">{answer}</p>
    </div>
  );
}
