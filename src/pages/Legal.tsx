import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Shield, FileText, Camera, Clock, AlertTriangle, 
  Scale, Eye, Lock, CheckCircle, DollarSign, Gift,
  ArrowRight, Download, Mail
} from 'lucide-react';
import { motion } from 'framer-motion';
import { SEO } from '@/components/seo';
import legalBg from '@/assets/legal-hero-bg.png';

export default function Legal() {
  const [activeTab, setActiveTab] = useState('privacy');

  const tabs = [
    { id: 'privacy', label: 'Privacy Policy', icon: Shield },
    { id: 'terms', label: 'Terms of Service', icon: FileText },
    { id: 'photo', label: 'Photo Consent', icon: Camera },
    { id: 'cancellation', label: 'Cancellation Policy', icon: Clock },
    { id: 'damage', label: 'Damage & Claims', icon: AlertTriangle }
  ];

  const quickLinks = [
    { 
      icon: Shield, 
      title: 'Privacy Policy', 
      desc: 'How we protect your data',
      tabId: 'privacy',
      href: undefined
    },
    { 
      icon: FileText, 
      title: 'Terms of Service', 
      desc: 'Platform rules & guidelines',
      tabId: 'terms',
      href: undefined
    },
    { 
      icon: Camera, 
      title: 'Photo Consent', 
      desc: 'Transparency through photos',
      tabId: 'photo',
      href: undefined
    },
    { 
      icon: Clock, 
      title: 'Cancellation Policy', 
      desc: 'Fees & grace cancellations',
      tabId: undefined,
      href: '/cancellationpolicy'
    },
    { 
      icon: AlertTriangle, 
      title: 'Damage & Claims', 
      desc: 'Property protection policy',
      tabId: 'damage',
      href: undefined
    },
    { 
      icon: Mail, 
      title: 'Contact Legal', 
      desc: 'Get help with legal matters',
      tabId: undefined,
      href: 'mailto:legal@puretask.com'
    }
  ];

  return (
    <div
      className="relative min-h-screen"
      style={{
        backgroundImage: `url(${legalBg})`,
        backgroundSize: '100% auto',
        backgroundRepeat: 'repeat-y',
        backgroundPosition: 'top center',
      }}
    >
      <div className="absolute inset-0 bg-background/60 pointer-events-none" aria-hidden="true" />
      <main className="container py-6 sm:py-8 px-4 relative">
      <SEO 
        title="Terms of Service & Privacy Policy"
        description="Read PureTask's Privacy Policy, Terms of Service, Photo Consent, Cancellation, and Damage Claims policies. Updated and written in plain language."
        url="/legal"
        keywords="privacy policy, terms of service, cleaning service terms, photo consent, cancellation policy"
      />
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 sm:mb-12"
        >
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary/10 mb-3 sm:mb-4">
            <Scale className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3 sm:mb-4">
            Legal Center
          </h1>
          <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto px-2">
            Your guide to PureTask policies, terms, and protections
          </p>
          <Badge variant="secondary" className="mt-3 sm:mt-4">
            Last updated: December 2024
          </Badge>
        </motion.div>

        {/* Quick Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-8 sm:mb-12">
          {quickLinks.map((item, idx) => {
            const Icon = item.icon;
            const content = (
              <Card className="h-full hover:shadow-lg transition-all cursor-pointer border-border hover:border-primary/50">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="p-2.5 sm:p-3 rounded-xl bg-primary/10 flex-shrink-0">
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground mb-1 text-sm sm:text-base">
                        {item.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">
                        {item.desc}
                      </p>
                      <span className="text-xs sm:text-sm text-primary font-medium inline-flex items-center gap-1">
                        Read More
                        <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );

            // External links (mailto, etc)
            if (item.href && item.href.startsWith('mailto:')) {
              return (
                <motion.a
                  key={idx}
                  href={item.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  {content}
                </motion.a>
              );
            }

            // Internal page links
            if (item.href && item.href.startsWith('/')) {
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Link to={item.href}>
                    {content}
                  </Link>
                </motion.div>
              );
            }

            // Tab switching
            return (
              <motion.div
                key={idx}
                onClick={() => item.tabId && setActiveTab(item.tabId)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                {content}
              </motion.div>
            );
          })}
        </div>

        {/* Tabbed Content Section */}
        <Card className="mb-8 sm:mb-12">
          {/* Tab Navigation */}
          <div className="border-b border-border overflow-x-auto scrollbar-hide">
            <div className="flex min-w-max">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-base font-semibold whitespace-nowrap transition-all border-b-2 ${
                      isActive 
                        ? 'border-primary text-primary bg-primary/5' 
                        : 'border-transparent text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content */}
          <CardContent className="p-4 sm:p-6 md:p-8">
            {activeTab === 'privacy' && <PrivacyContent />}
            {activeTab === 'terms' && <TermsContent />}
            {activeTab === 'photo' && <PhotoContent />}
            {activeTab === 'cancellation' && <CancellationContent />}
            {activeTab === 'damage' && <DamageContent />}
          </CardContent>
        </Card>

        {/* Contact Footer */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-3">
              Have Questions About Our Policies?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Our team is here to help clarify any legal questions or concerns you may have.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild>
                <a href="mailto:legal@puretask.com">
                  <Mail className="w-4 h-4 mr-2" />
                  Contact Legal Team
                </a>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/help">
                  Visit Support Center
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
    </main>
    </div>
  );
}

// Privacy Policy Content
function PrivacyContent() {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-8 h-8 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Privacy Policy</h2>
        </div>
        <p className="text-muted-foreground">
          How we protect and handle your information
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <InfoSection 
          icon={Eye}
          title="Information We Collect"
          items={[
            "Account information (name, email, phone)",
            "Service addresses and preferences",
            "Payment information (securely processed)",
            "Photos for job verification"
          ]}
        />
        <InfoSection 
          icon={Lock}
          title="How We Protect Your Data"
          items={[
            "End-to-end encryption for sensitive data",
            "Secure payment processing via Stripe",
            "Regular security audits",
            "GDPR and CCPA compliant"
          ]}
        />
        <InfoSection 
          icon={CheckCircle}
          title="Your Rights"
          items={[
            "Access your personal data anytime",
            "Request data deletion",
            "Opt-out of marketing communications",
            "Data portability options"
          ]}
        />
      </div>

      <div className="pt-6">
        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Download Full Privacy Policy
        </Button>
      </div>
    </div>
  );
}

// Terms of Service Content
function TermsContent() {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <FileText className="w-8 h-8 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Terms of Service</h2>
        </div>
        <p className="text-muted-foreground">
          Platform rules, user responsibilities, and legal agreements
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <InfoSection 
          icon={CheckCircle}
          title="User Responsibilities"
          items={[
            "Provide accurate account information",
            "Maintain secure login credentials",
            "Respect cleaner schedules and time",
            "Pay for services as agreed"
          ]}
        />
        <InfoSection 
          icon={Shield}
          title="Platform Guarantees"
          items={[
            "Verified and vetted cleaners",
            "Secure payment processing",
            "24-hour dispute resolution",
            "Satisfaction guarantee on all services"
          ]}
        />
        <InfoSection 
          icon={AlertTriangle}
          title="Prohibited Activities"
          items={[
            "Fraudulent bookings or payments",
            "Harassment of cleaners or staff",
            "Circumventing platform fees",
            "Sharing account credentials"
          ]}
        />
      </div>

      <div className="pt-6">
        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Download Full Terms of Service
        </Button>
      </div>
    </div>
  );
}

// Photo Consent Content
function PhotoContent() {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Camera className="w-8 h-8 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Photo Proof & Consent</h2>
        </div>
        <p className="text-muted-foreground">
          Transparency through before/after documentation
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <InfoSection 
          icon={Camera}
          title="Why We Use Photos"
          items={[
            "Document job quality and completion",
            "Protect both clients and cleaners",
            "Resolve disputes fairly",
            "Build trust through transparency"
          ]}
        />
        <InfoSection 
          icon={Lock}
          title="Photo Privacy"
          items={[
            "Photos are private to your booking",
            "Deleted after 90 days automatically",
            "Never shared without consent",
            "Encrypted storage and transmission"
          ]}
        />
        <InfoSection 
          icon={CheckCircle}
          title="Your Control"
          items={[
            "Review all photos before approval",
            "Flag inappropriate content",
            "Request early deletion",
            "Opt-out for sensitive areas"
          ]}
        />
      </div>

      <div className="pt-6">
        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Download Full Photo Policy
        </Button>
      </div>
    </div>
  );
}

// Cancellation Policy Content
function CancellationContent() {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Clock className="w-8 h-8 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Cancellation Policy</h2>
        </div>
        <p className="text-muted-foreground">
          Fees, grace cancellations, and refund policies
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card className="border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-900">
          <CardContent className="p-6 text-center">
            <Badge className="bg-green-500 mb-2">0% Fee</Badge>
            <h3 className="font-bold text-foreground text-lg">Free Cancellation</h3>
            <p className="text-sm text-muted-foreground">More than 48 hours notice</p>
          </CardContent>
        </Card>
        
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900">
          <CardContent className="p-6 text-center">
            <Badge className="bg-amber-500 mb-2">50% Fee</Badge>
            <h3 className="font-bold text-foreground text-lg">Partial Fee</h3>
            <p className="text-sm text-muted-foreground">24-48 hours notice</p>
          </CardContent>
        </Card>
        
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900">
          <CardContent className="p-6 text-center">
            <Badge className="bg-red-500 mb-2">100% Fee</Badge>
            <h3 className="font-bold text-foreground text-lg">Full Fee</h3>
            <p className="text-sm text-muted-foreground">Less than 24 hours</p>
          </CardContent>
        </Card>
      </div>

      <InfoSection 
        icon={Gift}
        title="Grace Cancellations"
        items={[
          "2 free grace cancellations per account",
          "Use within 6 months of signup",
          "Waives any cancellation fees",
          "Cannot be transferred or refunded"
        ]}
      />

      <div className="pt-6">
        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Download Full Cancellation Policy
        </Button>
      </div>
    </div>
  );
}

// Damage Claims Content
function DamageContent() {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="w-8 h-8 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Damage & Claims Policy</h2>
        </div>
        <p className="text-muted-foreground">
          How we handle property damage and claims resolution
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <InfoSection 
          icon={Shield}
          title="Protection Coverage"
          items={[
            "Up to $1,000,000 liability coverage",
            "Covers accidental damage during service",
            "Background-checked cleaners",
            "Bonded and insured professionals"
          ]}
        />
        <InfoSection 
          icon={Clock}
          title="Claims Process"
          items={[
            "Report within 24 hours of service",
            "Provide photos and documentation",
            "Review within 48 hours",
            "Resolution within 7 business days"
          ]}
        />
        <InfoSection 
          icon={DollarSign}
          title="Compensation"
          items={[
            "Fair market value assessment",
            "Direct payment or credits",
            "Repair cost coverage",
            "Replacement cost for total loss"
          ]}
        />
      </div>

      <div className="pt-6">
        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Download Full Claims Policy
        </Button>
      </div>
    </div>
  );
}

// Helper Component
interface InfoSectionProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  items: string[];
}

function InfoSection({ icon: Icon, title, items }: InfoSectionProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Icon className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">{title}</h3>
        </div>
        <ul className="space-y-2">
          {items.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
