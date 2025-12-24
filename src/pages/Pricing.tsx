import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  CheckCircle, Award, Shield, Star, Zap, Clock, Camera, Info,
  TrendingUp, DollarSign, Users, Sparkles, Target
} from 'lucide-react';

export default function Pricing() {
  const [userType, setUserType] = useState('client');

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Transparent, Fair Pricing
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            No hidden fees. Pay for quality service at rates you choose.
          </p>
          <div className="flex justify-center gap-8 mb-8">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">10 credits = $1</p>
              <p className="text-muted-foreground">Simple conversion</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">15%</p>
              <p className="text-muted-foreground">Platform fee</p>
            </div>
          </div>

          <Tabs value={userType} onValueChange={setUserType} className="max-w-md mx-auto">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="client">
                For Clients
              </TabsTrigger>
              <TabsTrigger value="cleaner">
                For Cleaners
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Client Pricing */}
      {userType === 'client' && (
        <>
          <div className="py-16 bg-background">
            <div className="max-w-6xl mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-foreground mb-2">Choose Your Cleaner Tier</h2>
                <p className="text-muted-foreground">Higher reliability = Better service • All cleaners are verified</p>
              </div>

              {/* Tier Cards */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                {[
                  {
                    tier: 'Developing',
                    score: '0-59',
                    creditsRange: '150-350',
                    usdRange: '$15-35',
                    color: 'slate',
                    description: 'Great for regular maintenance and budget-friendly options',
                    features: [
                      'ID verified & background checked',
                      'GPS tracking & photo proof',
                      'Standard cleaning supplies',
                      'Building their reputation',
                      'Often new to platform',
                      'Great value for basic cleans'
                    ]
                  },
                  {
                    tier: 'Semi Pro',
                    score: '60-74',
                    creditsRange: '350-450',
                    usdRange: '$35-45',
                    color: 'blue',
                    description: 'Consistent performers with proven track records',
                    features: [
                      'All Developing features',
                      'Proven reliability (60-74 score)',
                      'Quality cleaning products',
                      'Priority scheduling available',
                      'Specialty services offered',
                      'Detailed work and communication'
                    ]
                  },
                  {
                    tier: 'Pro',
                    score: '75-89',
                    creditsRange: '450-600',
                    usdRange: '$45-60',
                    color: 'purple',
                    popular: true,
                    description: 'Experienced professionals - our most popular tier',
                    features: [
                      'All Semi Pro features',
                      'High reliability score (75-89)',
                      'Professional/eco-friendly products',
                      'Same-day booking accepted',
                      'Guaranteed on-time arrival',
                      'Advanced cleaning techniques'
                    ]
                  },
                  {
                    tier: 'Elite',
                    score: '90-100',
                    creditsRange: '600-850',
                    usdRange: '$60-85',
                    color: 'emerald',
                    description: 'Top 10% of all cleaners - exceptional service',
                    features: [
                      'All Pro features',
                      'Elite reliability (90-100)',
                      'Premium professional products',
                      'White-glove service',
                      'Highest priority scheduling',
                      'Expert certifications & training'
                    ]
                  }
                ].map((plan, idx) => (
                  <Card key={idx} className={`relative ${plan.popular ? 'ring-2 ring-primary shadow-lg' : ''}`}>
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-primary text-primary-foreground">
                          Most Popular
                        </Badge>
                      </div>
                    )}
                    <CardHeader className="text-center pb-4">
                      <CardTitle className="flex items-center justify-center gap-2">
                        <Award className="h-5 w-5 text-primary" />
                        {plan.tier} Tier
                      </CardTitle>
                      <div className="mt-4">
                        <p className="text-sm text-muted-foreground">Reliability Score: {plan.score}</p>
                        <p className="text-3xl font-bold text-foreground mt-2">{plan.creditsRange}</p>
                        <p className="text-muted-foreground">credits/hour</p>
                      </div>
                      <p className="text-sm font-medium text-primary mt-2">≈ {plan.usdRange}/hour</p>
                      <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 mb-6">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <Button asChild className="w-full" variant={plan.popular ? 'default' : 'outline'}>
                        <Link to="/discover">
                          Browse {plan.tier} Cleaners
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Add-Ons */}
              <div className="mb-16">
                <h3 className="text-2xl font-bold text-foreground text-center mb-8">Service Add-Ons</h3>
                <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <div className="text-4xl mb-4">🏠</div>
                      <h4 className="font-semibold text-foreground mb-2">Basic Cleaning</h4>
                      <p className="text-sm text-muted-foreground mb-4">Standard maintenance and tidying</p>
                      <Badge variant="secondary">Base Rate Only</Badge>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6 text-center">
                      <div className="text-4xl mb-4">
                        <Sparkles className="h-10 w-10 mx-auto text-primary" />
                      </div>
                      <h4 className="font-semibold text-foreground mb-2">Deep Clean</h4>
                      <p className="text-sm text-muted-foreground mb-4">Baseboards, fans, inside appliances</p>
                      <Badge className="bg-primary/10 text-primary">+30-80 credits/hr</Badge>
                      <p className="text-xs text-muted-foreground mt-2">≈ +$3-8/hour</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6 text-center">
                      <div className="text-4xl mb-4">📦</div>
                      <h4 className="font-semibold text-foreground mb-2">Move-Out/In</h4>
                      <p className="text-sm text-muted-foreground mb-4">Complete vacant property deep clean</p>
                      <Badge className="bg-primary/10 text-primary">+30-80 credits/hr</Badge>
                      <p className="text-xs text-muted-foreground mt-2">≈ +$3-8/hour</p>
                    </CardContent>
                  </Card>
                </div>

                <Alert className="max-w-4xl mx-auto mt-8">
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Add-on Pricing: Each cleaner sets their own add-on rate within the $3-8/hour range based on their experience and the extra work involved. Deep cleans and move-outs take significantly more time and effort than basic cleaning.
                  </AlertDescription>
                </Alert>
              </div>

              {/* Platform Fee */}
              <div className="mb-16">
                <Card className="max-w-4xl mx-auto bg-muted/50">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <Shield className="h-8 w-8 text-primary flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-foreground text-lg mb-2">Platform Fee: 15%</h4>
                        <p className="text-muted-foreground mb-4">
                          Our 15% platform fee covers the costs and features that make PureTask the safest, most transparent cleaning marketplace:
                        </p>
                        <div className="grid sm:grid-cols-2 gap-2">
                          {[
                            'Identity & background verification',
                            'GPS tracking & geolocation',
                            'Before/after photo storage',
                            'Secure escrow payment system',
                            '24/7 customer support',
                            'Dispute resolution services',
                            'Platform maintenance & development',
                            'Trust & safety monitoring'
                          ].map((item, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm">
                              <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                              {item}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Example Pricing */}
          <div className="py-16 bg-muted/30">
            <div className="max-w-6xl mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-foreground mb-2">Example Pricing</h2>
                <p className="text-muted-foreground">See how it all works out</p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Basic Clean Example</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Semi Pro cleaner</span>
                        <span className="font-medium">400 credits/hr</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">3 hours × 400</span>
                        <span className="font-medium">1,200 credits</span>
                      </div>
                      <div className="border-t pt-3 flex justify-between">
                        <span className="font-semibold">Total Cost</span>
                        <span className="font-bold text-primary text-xl">$120</span>
                      </div>
                      <p className="text-xs text-muted-foreground">You pay $120 • Cleaner earns $102 • Platform: $18</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Deep Clean Example</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Pro cleaner base</span>
                        <span className="font-medium">500 credits/hr</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Deep clean add-on</span>
                        <span className="font-medium">+50 credits/hr</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">4 hours × 550</span>
                        <span className="font-medium">2,200 credits</span>
                      </div>
                      <div className="border-t pt-3 flex justify-between">
                        <span className="font-semibold">Total Cost</span>
                        <span className="font-bold text-primary text-xl">$220</span>
                      </div>
                      <p className="text-xs text-muted-foreground">You pay $220 • Cleaner earns $187 • Platform: $33</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Move-Out Example</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Elite cleaner base</span>
                        <span className="font-medium">700 credits/hr</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Move-out add-on</span>
                        <span className="font-medium">+60 credits/hr</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">5 hours × 760</span>
                        <span className="font-medium">3,800 credits</span>
                      </div>
                      <div className="border-t pt-3 flex justify-between">
                        <span className="font-semibold">Total Cost</span>
                        <span className="font-bold text-primary text-xl">$380</span>
                      </div>
                      <p className="text-xs text-muted-foreground">You pay $380 • Cleaner earns $323 • Platform: $57</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Cleaner Earnings */}
      {userType === 'cleaner' && (
        <div className="py-16 bg-background">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-2">Your Earning Potential</h2>
              <p className="text-muted-foreground">Keep 80-85% of every booking • Set your own rates</p>
            </div>

            {/* Tier Earnings */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {[
                { tier: 'Developing', baseRange: '150-350', earnRange: '$12-28/hr', score: '0-59', payout: '80%' },
                { tier: 'Semi Pro', baseRange: '350-450', earnRange: '$28-36/hr', score: '60-74', payout: '80%' },
                { tier: 'Pro', baseRange: '450-600', earnRange: '$36-48/hr', score: '75-89', payout: '80%', popular: true },
                { tier: 'Elite', baseRange: '600-850', earnRange: '$51-72/hr', score: '90-100', payout: '85%' }
              ].map((tier, idx) => (
                <Card key={idx} className={tier.popular ? 'ring-2 ring-primary' : ''}>
                  <CardContent className="pt-6 text-center">
                    {tier.popular && (
                      <Badge className="mb-2 bg-primary text-primary-foreground">Most Cleaners</Badge>
                    )}
                    <h3 className="text-xl font-bold text-foreground mb-1">{tier.tier}</h3>
                    <Badge variant="outline" className="mb-4">Score: {tier.score}</Badge>
                    <div className="mb-4">
                      <p className="text-sm text-muted-foreground">You charge:</p>
                      <p className="text-2xl font-bold text-foreground">{tier.baseRange}</p>
                      <p className="text-muted-foreground text-sm">credits/hour</p>
                    </div>
                    <div className="bg-primary/10 rounded-lg p-4">
                      <p className="text-sm text-muted-foreground">You earn ({tier.payout}):</p>
                      <p className="text-2xl font-bold text-primary">{tier.earnRange}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-4">Plus add-ons: +$2.40-6.40/hr</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Payout Options */}
            <div className="max-w-4xl mx-auto">
              <h3 className="text-2xl font-bold text-foreground text-center mb-8">Payout Options</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-primary" />
                      Weekly Payouts (Free)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {[
                        'Automatic weekly deposits',
                        'No fees - 100% of earnings',
                        'Direct deposit to your bank',
                        'Processing time: 2-3 business days'
                      ].map((item, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-primary" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-amber-500" />
                      Instant Payout (5% fee)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {[
                        'Cash out anytime',
                        '5% convenience fee',
                        'Money in your account within hours',
                        'FREE for milestone achievements!'
                      ].map((item, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-primary" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="py-16 bg-gradient-to-r from-primary to-primary/80">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-primary-foreground mb-4">
            {userType === 'client' ? 'Ready to Book?' : 'Ready to Start Earning?'}
          </h2>
          <p className="text-primary-foreground/80 mb-8">
            {userType === 'client'
              ? 'Find your perfect cleaner and book in minutes'
              : 'Join hundreds of cleaners earning on their own terms'}
          </p>
          <Button asChild size="lg" variant="secondary">
            <Link to={userType === 'client' ? '/discover' : '/auth'}>
              <Sparkles className="mr-2 h-5 w-5" />
              Get Started Now
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
