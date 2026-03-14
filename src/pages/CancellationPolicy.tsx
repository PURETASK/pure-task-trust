import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, Gift, AlertTriangle, DollarSign, 
  CheckCircle, Users, CloudRain, Mail, HelpCircle,
  Zap, Calendar, Info, ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SEO } from '@/components/seo';

export default function CancellationPolicy() {
  return (
    <main className="container max-w-4xl py-8">
      <SEO
        title="Cancellation Policy"
        description="Understand PureTask's cancellation policy, fees, grace periods, and emergency cancellation rules for clients and cleaners."
        url="/cancellationpolicy"
        keywords="cancellation policy, cleaning cancellation, refund policy, PureTask cancellation"
      />
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <h1 className="text-4xl font-bold text-foreground mb-2">
          Cancellation Policy
        </h1>
        <p className="text-muted-foreground">
          Last updated: November 9, 2024
        </p>
      </motion.div>

      {/* Intro */}
      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-lg text-foreground mb-10"
      >
        We understand that plans change. This policy explains the cancellation fees for both clients and 
        cleaners, designed to be fair while protecting everyone's time.
      </motion.p>

      {/* Client Cancellation Fees Section */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-12"
      >
        <div className="flex items-center gap-3 mb-4">
          <Clock className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Client Cancellation Fees</h2>
        </div>
        <p className="text-muted-foreground mb-6">
          Cancellation fees are based on how much notice you give before the scheduled cleaning time:
        </p>

        {/* Fee Cards */}
        <div className="space-y-4">
          {/* Free Cancellation */}
          <div className="flex items-start justify-between p-6 rounded-lg border border-border bg-background">
            <div>
              <h3 className="text-xl font-bold text-green-600 mb-1">Free Cancellation</h3>
              <p className="text-green-600 mb-2">More than 48 hours before booking</p>
              <p className="text-muted-foreground text-sm">
                Full refund of escrowed credits back to your account
              </p>
            </div>
            <Badge className="bg-green-500 text-white shrink-0">0% Fee</Badge>
          </div>

          {/* Partial Fee */}
          <Card className="bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900">
            <CardContent className="p-6 flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold text-amber-600 mb-1">Partial Fee</h3>
                <p className="text-amber-600 mb-2">24-48 hours before booking</p>
                <p className="text-muted-foreground text-sm">
                  Half of booking amount charged, remaining 50% refunded
                </p>
              </div>
              <Badge className="bg-amber-500 text-white shrink-0">50% Fee</Badge>
            </CardContent>
          </Card>

          {/* Full Fee */}
          <div className="flex items-start justify-between p-6 rounded-lg border border-border bg-background">
            <div>
              <h3 className="text-xl font-bold text-red-500 mb-1">Full Fee</h3>
              <p className="text-red-500 mb-2">Less than 24 hours before booking</p>
              <p className="text-muted-foreground text-sm">
                Full booking amount charged, no refund (cleaner has reserved the time)
              </p>
            </div>
            <Badge className="bg-red-500 text-white shrink-0">100% Fee</Badge>
          </div>
        </div>
      </motion.section>

      {/* Example Calculation */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-12"
      >
        <div className="flex items-center gap-3 mb-4">
          <Zap className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-bold text-foreground">Example Calculation</h2>
        </div>
        <Card className="border-border">
          <CardContent className="p-6">
            <p className="font-medium text-foreground mb-4">
              <strong>Booking:</strong> $150 for 3-hour cleaning on Saturday at 10:00 AM
            </p>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-green-600">
                <span>• Cancel on</span>
                <strong>Thursday 9:00 AM</strong>
                <span>(49h notice) →</span>
                <span className="font-medium">$0 fee (free cancellation)</span>
              </li>
              <li className="flex items-center gap-2 text-amber-600">
                <span>• Cancel on</span>
                <strong>Friday 9:00 AM</strong>
                <span>(25h notice) →</span>
                <span className="font-medium">$75 fee (50%)</span>
              </li>
              <li className="flex items-center gap-2 text-red-500">
                <span>• Cancel on</span>
                <strong>Saturday 8:00 AM</strong>
                <span>(2h notice) →</span>
                <span className="font-medium">$150 fee (100%)</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </motion.section>

      {/* Grace Cancellations */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-12"
      >
        <div className="flex items-center gap-3 mb-4">
          <Gift className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Grace Cancellations</h2>
        </div>
        
        <h3 className="text-xl font-bold text-primary mb-4">2 Free "Grace" Cancellations</h3>
        <p className="text-foreground mb-6">
          We understand emergencies happen! Every client gets <strong className="text-primary">2 grace cancellations</strong> that can be used to waive 
          any cancellation fee, regardless of timing.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-border">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-5 h-5 text-primary" />
                <h4 className="font-semibold text-foreground">How It Works:</h4>
              </div>
              <ul className="space-y-2 text-amber-600">
                <li>• Use when you need to cancel with short notice</li>
                <li>• Waives the 50% or 100% cancellation fee</li>
                <li>• Automatically offered when applicable during cancellation</li>
                <li>• Tracked in your account settings</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <h4 className="font-semibold text-foreground">Important Notes:</h4>
              </div>
              <ul className="space-y-2 text-amber-600">
                <li>• Once used, grace cancellations don't replenish</li>
                <li>• Not applicable to no-shows (must cancel before booking time)</li>
                <li>• Can only be used for client-initiated cancellations</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6 bg-muted/50 border-primary/20">
          <CardContent className="p-4">
            <p className="text-muted-foreground">
              <strong className="text-foreground">Pro tip:</strong> Save your grace cancellations for true emergencies. For planned changes, try to give 48+ hours notice for free 
              cancellation.
            </p>
          </CardContent>
        </Card>
      </motion.section>

      {/* Cleaner Cancellations */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mb-12"
      >
        <div className="flex items-center gap-3 mb-4">
          <Users className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Cleaner Cancellations</h2>
        </div>
        <p className="text-muted-foreground mb-4">
          When a cleaner cancels a confirmed booking:
        </p>

        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <DollarSign className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
            <p><strong className="text-foreground">No charge to client</strong> <span className="text-muted-foreground">- Full refund of escrowed credits</span></p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
            <p><strong className="text-foreground">Reliability score impact</strong> <span className="text-muted-foreground">- Cancellations affect cleaner's rating</span></p>
          </div>
          <div className="flex items-start gap-3">
            <Gift className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
            <p><strong className="text-foreground">Backup cleaner offered</strong> <span className="text-muted-foreground">- We'll try to match you with another verified cleaner</span></p>
          </div>
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
            <p><strong className="text-foreground">Multiple cancellations</strong> <span className="text-muted-foreground">- May result in account suspension</span></p>
          </div>
        </div>
      </motion.section>

      {/* No-Show Policy */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mb-12"
      >
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="w-6 h-6 text-red-500" />
          <h2 className="text-2xl font-bold text-foreground">No-Show Policy</h2>
        </div>

        {/* Client No-Show */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-red-500 mb-3">Client No-Show</h3>
          <p className="text-red-500 mb-4">
            If a client is not present or accessible at the scheduled time:
          </p>
          <ul className="space-y-2 text-amber-600">
            <li>• Cleaner will wait 15 minutes and attempt contact</li>
            <li>• <strong>100% booking fee charged</strong> (no grace cancellations applicable)</li>
            <li>• Full payment released to cleaner for their time</li>
            <li>• Repeated no-shows may result in account restrictions</li>
          </ul>
        </div>

        {/* Cleaner No-Show */}
        <div>
          <h3 className="text-xl font-bold text-red-500 mb-3">Cleaner No-Show</h3>
          <p className="text-red-500 mb-4">
            If a cleaner doesn't arrive within 30 minutes of scheduled time:
          </p>
          <ul className="space-y-2 text-amber-600">
            <li>• Client receives <strong>full refund + $50 bonus</strong></li>
            <li>• Serious reliability score penalty for cleaner</li>
            <li>• Account suspension after multiple no-shows</li>
            <li>• We'll help find a backup cleaner if possible</li>
          </ul>
        </div>
      </motion.section>

      {/* Rescheduling */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mb-12"
      >
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Rescheduling</h2>
        </div>
        <p className="text-primary mb-4">
          Rescheduling to a different date/time follows the same fee structure as cancellations:
        </p>
        <ul className="space-y-2 text-foreground mb-4">
          <li>• <strong>More than 48 hours:</strong> <span className="text-green-600">Free rescheduling</span></li>
          <li>• <strong>24-48 hours:</strong> <span className="text-amber-600">50% fee applies (unless using grace cancellation)</span></li>
          <li>• <strong>Less than 24 hours:</strong> <span className="text-red-500">100% fee applies (unless using grace cancellation)</span></li>
        </ul>
        <p className="text-primary">
          Cleaners can propose alternative times, subject to mutual agreement and availability.
        </p>
      </motion.section>

      {/* Refund Processing */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mb-12"
      >
        <div className="flex items-center gap-3 mb-4">
          <DollarSign className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Refund Processing</h2>
        </div>
        <ul className="space-y-2 text-primary">
          <li>• Refunds issued as credits to your PureTask account immediately</li>
          <li>• Credits can be used for future bookings</li>
          <li>• Cash refunds to original payment method upon request (3-5 business days)</li>
          <li>• Partial refunds calculated automatically based on timing</li>
        </ul>
      </motion.section>

      {/* Weather & Emergencies */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="mb-12"
      >
        <div className="flex items-center gap-3 mb-4">
          <CloudRain className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Weather & Emergencies</h2>
        </div>
        <Card className="bg-muted/50 border-border">
          <CardContent className="p-6">
            <p className="text-primary mb-4">
              In case of severe weather, natural disasters, or other emergencies:
            </p>
            <ul className="space-y-2 text-primary">
              <li>• Cancellation fees may be waived at PureTask's discretion</li>
              <li>• Safety always comes first for both parties</li>
              <li>• Contact support for emergency cancellation assistance</li>
              <li>• Document emergency situations when possible</li>
            </ul>
          </CardContent>
        </Card>
      </motion.section>

      {/* Questions or Concerns */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
        className="mb-12"
      >
        <div className="flex items-center gap-3 mb-4">
          <HelpCircle className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Questions or Concerns?</h2>
        </div>
        <p className="text-muted-foreground mb-4">
          If you have questions about cancellation fees or need assistance with a cancellation:
        </p>
        <Card className="bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900">
          <CardContent className="p-6">
            <p className="mb-2">
              <strong className="text-foreground">Email:</strong>{' '}
              <a href="mailto:support@puretask.com" className="text-primary hover:underline">
                support@puretask.com
              </a>
            </p>
            <p>
              <strong className="text-foreground">Support Center:</strong>{' '}
              <Link to="/help" className="text-primary hover:underline">
                Visit Help Center
              </Link>
            </p>
          </CardContent>
        </Card>
      </motion.section>

      {/* Quick Reference Table */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1 }}
      >
        <h2 className="text-2xl font-bold text-foreground mb-4">Quick Reference</h2>
        <Card className="border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-bold text-foreground">Notice Given</TableHead>
                <TableHead className="font-bold text-foreground">Cancellation Fee</TableHead>
                <TableHead className="font-bold text-foreground">Grace Available?</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">More than 48 hours</TableCell>
                <TableCell className="text-green-600 font-medium">0% (Free)</TableCell>
                <TableCell className="text-muted-foreground">N/A</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">24-48 hours</TableCell>
                <TableCell className="text-amber-600 font-medium">50%</TableCell>
                <TableCell className="text-green-600">Yes</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Less than 24 hours</TableCell>
                <TableCell className="text-red-500 font-medium">100%</TableCell>
                <TableCell className="text-green-600">Yes</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">No-Show</TableCell>
                <TableCell className="text-red-500 font-medium">100%</TableCell>
                <TableCell className="text-red-500">No</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>
      </motion.section>
    </main>
  );
}
