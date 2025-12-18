import { CleanerLayout } from "@/components/cleaner/CleanerLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Gift, AlertTriangle, DollarSign, Mail, HelpCircle, CloudRain } from "lucide-react";
import { Link } from "react-router-dom";

export default function CancellationPolicy() {
  return (
    <CleanerLayout>
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Cancellation Policy</h1>
          <p className="text-muted-foreground mt-1">Last updated: November 9, 2024</p>
        </div>

        {/* Intro */}
        <p className="text-muted-foreground">
          We understand that plans change. This policy explains the cancellation fees for both clients and 
          cleaners, designed to be fair while protecting everyone's time.
        </p>

        {/* Client Cancellation Fees */}
        <section>
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
            <Clock className="h-5 w-5" />
            Client Cancellation Fees
          </h2>
          <p className="text-muted-foreground mb-4">
            Cancellation fees are based on how much notice you give before the scheduled cleaning time:
          </p>

          <div className="space-y-4">
            <Card className="border-l-4 border-l-success">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-success">Free Cancellation</h3>
                  <p className="text-sm text-muted-foreground mt-1">More than 48 hours before booking</p>
                  <p className="text-sm text-muted-foreground mt-2">Full refund of escrowed credits back to your account</p>
                </div>
                <Badge className="bg-success text-white">0% Fee</Badge>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-amber-500">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-amber-500">Partial Fee</h3>
                  <p className="text-sm text-muted-foreground mt-1">24-48 hours before booking</p>
                  <p className="text-sm text-amber-600 mt-2">Half of booking amount charged, remaining 50% refunded</p>
                </div>
                <Badge className="bg-amber-500 text-white">50% Fee</Badge>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-destructive">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-destructive">Full Fee</h3>
                  <p className="text-sm text-muted-foreground mt-1">Less than 24 hours before booking</p>
                  <p className="text-sm text-destructive mt-2">Full booking amount charged, no refund (cleaner has reserved the time)</p>
                </div>
                <Badge variant="destructive">100% Fee</Badge>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Example Calculation */}
        <Card className="bg-muted/30">
          <CardContent className="p-5">
            <h3 className="font-semibold flex items-center gap-2 mb-3">
              <DollarSign className="h-5 w-5" />
              Example Calculation
            </h3>
            <p className="text-sm mb-3">
              <strong>Booking:</strong> $150 for 3-hour cleaning on Saturday at 10:00 AM
            </p>
            <ul className="text-sm space-y-2 text-muted-foreground">
              <li>• Cancel on <strong>Thursday 9:00 AM</strong> (49h notice) → <span className="text-success">$0 fee (free cancellation)</span></li>
              <li>• Cancel on <strong>Friday 9:00 AM</strong> (25h notice) → <span className="text-amber-600">$75 fee (50%)</span></li>
              <li>• Cancel on <strong>Saturday 8:00 AM</strong> (2h notice) → <span className="text-destructive">$150 fee (100%)</span></li>
            </ul>
          </CardContent>
        </Card>

        {/* Grace Cancellations */}
        <section>
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
            <Gift className="h-5 w-5" />
            Grace Cancellations
          </h2>

          <Card className="bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800">
            <CardContent className="p-5">
              <h3 className="font-semibold text-emerald-600 mb-3">2 Free "Grace" Cancellations</h3>
              <p className="text-sm text-muted-foreground mb-4">
                We understand emergencies happen! Every client gets <strong>2 grace cancellations</strong> that 
                can be used to waive any cancellation fee, regardless of timing.
              </p>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm flex items-center gap-2 mb-2">
                    <HelpCircle className="h-4 w-4" /> How It Works:
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                    <li>• Use when you need to cancel with short notice</li>
                    <li>• Waives the 50% or 100% cancellation fee</li>
                    <li>• Automatically offered when applicable during cancellation</li>
                    <li>• Tracked in your account settings</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-sm flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500" /> Important Notes:
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                    <li>• Once used, grace cancellations don't replenish</li>
                    <li>• Not applicable to no-shows (must cancel before booking time)</li>
                    <li>• Can only be used for client-initiated cancellations</li>
                  </ul>
                </div>
              </div>

              <p className="text-sm mt-4 text-muted-foreground">
                <strong>Pro tip:</strong> Save your grace cancellations for true emergencies. For planned 
                changes, try to give 48+ hours notice for free cancellation.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Cleaner Cancellations */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Cleaner Cancellations</h2>
          <p className="text-muted-foreground mb-4">When a cleaner cancels a confirmed booking:</p>

          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <DollarSign className="h-4 w-4 text-success mt-0.5" />
              <span><strong>No charge to client</strong> - Full refund of escrowed credits</span>
            </li>
            <li className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
              <span><strong>Reliability score impact</strong> - Cancellations affect cleaner's rating</span>
            </li>
          </ul>
        </section>

        {/* No-Show Policy */}
        <section>
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            No-Show Policy
          </h2>

          <div className="space-y-4">
            <Card className="border-amber-200 dark:border-amber-800">
              <CardContent className="p-5">
                <h3 className="font-semibold text-amber-600 mb-3">Client No-Show</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  If a client is not present or accessible at the scheduled time:
                </p>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Cleaner will wait 15 minutes and attempt contact</li>
                  <li>• <strong className="text-destructive">100% booking fee charged</strong> (no grace cancellations applicable)</li>
                  <li>• Full payment released to cleaner for their time</li>
                  <li>• Repeated no-shows may result in account restrictions</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-amber-200 dark:border-amber-800">
              <CardContent className="p-5">
                <h3 className="font-semibold text-amber-600 mb-3">Cleaner No-Show</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  If a cleaner doesn't arrive within 30 minutes of scheduled time:
                </p>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Client receives <strong className="text-success">full refund + 50 bonus credits</strong></li>
                  <li>• Serious reliability score penalty for cleaner</li>
                  <li>• Account suspension after multiple no-shows</li>
                  <li>• We'll help find a backup cleaner if possible</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Rescheduling */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Rescheduling</h2>
          <p className="text-muted-foreground mb-4">
            Rescheduling to a different date/time follows the same fee structure as cancellations:
          </p>

          <ul className="text-sm space-y-2 text-muted-foreground">
            <li>• <strong>More than 48 hours:</strong> Free rescheduling</li>
            <li>• <strong>24-48 hours:</strong> 50% fee applies (unless using grace cancellation)</li>
            <li>• <strong>Less than 24 hours:</strong> 100% fee applies (unless using grace cancellation)</li>
          </ul>

          <p className="text-sm text-muted-foreground mt-4">
            Cleaners can propose alternative times, subject to mutual agreement and availability.
          </p>
        </section>

        {/* Refund Processing */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Refund Processing</h2>
          <ul className="text-sm space-y-2 text-muted-foreground">
            <li>• Refunds issued as credits to your PureTask account immediately</li>
            <li>• Credits can be used for future bookings</li>
            <li>• Cash refunds to original payment method upon request (3-5 business days)</li>
            <li>• Partial refunds calculated automatically based on timing</li>
          </ul>
        </section>

        {/* Weather & Emergencies */}
        <section>
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
            <CloudRain className="h-5 w-5" />
            Weather & Emergencies
          </h2>

          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground mb-3">
                In case of severe weather, natural disasters, or other emergencies:
              </p>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Cancellation fees may be waived at PureTask's discretion</li>
                <li>• Safety always comes first for both parties</li>
                <li>• Contact support for emergency cancellation assistance</li>
                <li>• Document emergency situations when possible</li>
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* Questions */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-5">
            <h3 className="font-semibold mb-2">Questions or Concerns?</h3>
            <p className="text-sm text-muted-foreground mb-3">
              If you have questions about cancellation fees or need assistance with a cancellation:
            </p>
            <div className="text-sm space-y-1">
              <p>
                <strong>Email:</strong>{" "}
                <a href="mailto:support@puretask.com" className="text-primary hover:underline">
                  support@puretask.com
                </a>
              </p>
              <p>
                <strong>Support Center:</strong>{" "}
                <Link to="/help" className="text-primary hover:underline">
                  Visit Help Center
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Reference */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Quick Reference</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Notice Period</th>
                  <th className="text-left py-3 px-4">Fee</th>
                  <th className="text-left py-3 px-4">Grace Applicable?</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-4">48+ hours</td>
                  <td className="py-3 px-4 text-success font-medium">0% (Free)</td>
                  <td className="py-3 px-4">N/A</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">24-48 hours</td>
                  <td className="py-3 px-4 text-amber-500 font-medium">50%</td>
                  <td className="py-3 px-4">Yes</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">&lt;24 hours</td>
                  <td className="py-3 px-4 text-destructive font-medium">100%</td>
                  <td className="py-3 px-4">Yes</td>
                </tr>
                <tr>
                  <td className="py-3 px-4">No-show</td>
                  <td className="py-3 px-4 text-destructive font-medium">100%</td>
                  <td className="py-3 px-4">No</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </CleanerLayout>
  );
}
