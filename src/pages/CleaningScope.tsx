import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { CheckCircle, Info, Sparkles, Home as HomeIcon, Key, Calendar, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const CLEANING_DUTIES = {
  basic: {
    title: 'Basic Cleaning (2 Bed / 2 Bath)',
    subtitle: 'Standard maintenance cleaning - typical 2-3 hours',
    icon: '🏠',
    color: 'blue',
    duties: {
      'Kitchen': [
        'Wipe down all countertops and backsplash',
        'Clean exterior of appliances (fridge, stove, microwave, dishwasher)',
        'Clean sink and faucet',
        'Wipe cabinet fronts',
        'Sweep and mop floor',
        'Empty trash and replace liner'
      ],
      'Bathrooms (Both)': [
        'Clean and disinfect toilet (bowl, seat, exterior)',
        'Clean and disinfect sink, faucet, and counter',
        'Clean mirror',
        'Wipe down exterior of cabinets',
        'Clean tub/shower (walls, fixtures, glass door if applicable)',
        'Sweep and mop floor',
        'Empty trash and replace liner'
      ],
      'Bedrooms (Both)': [
        'Make beds (if linens are present)',
        'Dust all accessible surfaces',
        'Vacuum or sweep floors',
        'Empty trash'
      ],
      'Living/Dining Areas': [
        'Dust all accessible surfaces (tables, shelves, TV stands)',
        'Vacuum carpets or sweep/mop hard floors',
        'Wipe down light switches and doorknobs',
        'Straighten pillows/cushions'
      ],
      'General (All Rooms)': [
        'Spot clean walls and light switches',
        'Empty all trash bins',
        'Light dusting of accessible surfaces'
      ]
    }
  },
  deep: {
    title: 'Deep Clean Add-Ons',
    subtitle: 'Everything in Basic Clean PLUS these additional tasks (+$3-8/hour)',
    icon: '✨',
    color: 'purple',
    duties: {
      '✓ Includes All Basic Clean Tasks': [
        'All kitchen, bathroom, bedroom, and living area tasks from Basic Clean are included',
        'Floors, surfaces, appliances, fixtures - everything covered in Basic'
      ],
      'Additional Deep Clean Tasks': [
        'Baseboards - wipe down all baseboards in every room',
        'Ceiling fans - dust and wipe blades',
        'Light fixtures - dust and clean',
        'Window sills and tracks - thorough cleaning',
        'Inside windows - clean interior glass',
        'Door frames and trim - wipe down',
        'Behind toilet deep clean',
        'Inside cabinets and drawers (if empty)',
        'Inside microwave - thorough cleaning',
        'Walls - spot cleaning or full wipe down'
      ]
    }
  },
  specialRequests: {
    title: 'Special Request Items',
    subtitle: 'Individual tasks priced separately - discuss with your cleaner',
    icon: '💎',
    color: 'rose',
    duties: {
      'Kitchen Special Requests': [
        'Inside oven - detailed cleaning',
        'Inside refrigerator - remove items, clean shelves',
        'Behind appliances (if accessible)',
        'Degrease range hood and filter'
      ],
      'Bathroom Special Requests': [
        'Grout scrubbing and whitening',
        'Deep descale fixtures and showerheads',
        'Tile scrubbing'
      ],
      'Other Special Requests': [
        'Blinds and shutters - dust each slat',
        'Vents and air returns - dust and wipe',
        'Inside cabinets and drawers (detailed)'
      ]
    }
  },
  moveout: {
    title: 'Move-Out Clean',
    subtitle: 'Comprehensive cleaning for vacant properties - 4-6+ hours',
    icon: '📦',
    color: 'amber',
    duties: {
      'Includes Everything in Basic & Deep, Plus': [
        'All light fixtures and ceiling fans',
        'All baseboards throughout property',
        'Inside all cabinets, drawers, and closets',
        'Inside oven and refrigerator',
        'Inside dishwasher',
        'All windows (interior)',
        'All blinds/shutters',
        'Garage floor sweep (if applicable)',
        'Patio/balcony sweep (if applicable)'
      ],
      'Focus Areas': [
        'Property must be completely vacant',
        'All personal items and debris removed',
        'Goal: Return property to "rental ready" condition',
        'Photo documentation of completed work',
        'Ideal for security deposit returns'
      ],
      'Not Included': [
        'Carpet steam cleaning (refer to specialist)',
        'Wall repair or painting',
        'Window screens',
        'Exterior windows',
        'Pest control',
        'Biohazard cleaning'
      ]
    }
  },
  airbnb: {
    title: 'Airbnb / Turnover Clean',
    subtitle: 'Quick turnaround between guests - 2-4 hours',
    icon: '🏨',
    color: 'cyan',
    duties: {
      'Priority Tasks': [
        'Strip and remake all beds with fresh linens',
        'Replace all towels',
        'Full bathroom sanitization',
        'Kitchen reset to guest-ready',
        'Restock consumables (if provided)',
        'Check for guest left-behinds',
        'Empty all trash'
      ],
      'Standard Cleaning': [
        'All surfaces wiped and sanitized',
        'Floors vacuumed/mopped throughout',
        'Mirrors and glass cleaned',
        'Appliances wiped down',
        'Light switches and remotes sanitized'
      ],
      'Guest-Ready Touches': [
        'Arrange amenities attractively',
        'Fold towels decoratively',
        'Set thermostat to welcome temperature',
        'Open blinds/curtains',
        'Final walkthrough inspection',
        'Photo documentation for host'
      ]
    }
  }
};

const colorMap: Record<string, string> = {
  blue: 'bg-primary/10 text-primary border-primary/20',
  purple: 'bg-pt-purple/10 text-pt-purple border-pt-purple/20',
  amber: 'bg-pt-amber/10 text-pt-amber border-pt-amber/20',
  cyan: 'bg-pt-cyan/10 text-pt-cyan border-pt-cyan/20',
  rose: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
};

const iconColorMap: Record<string, string> = {
  blue: 'text-primary',
  purple: 'text-pt-purple',
  amber: 'text-pt-amber',
  cyan: 'text-pt-cyan',
  rose: 'text-rose-600',
};

const tabActiveColorMap: Record<string, string> = {
  blue: 'data-[state=active]:border-primary data-[state=active]:bg-primary/10',
  purple: 'data-[state=active]:border-pt-purple data-[state=active]:bg-pt-purple/10',
  amber: 'data-[state=active]:border-pt-amber data-[state=active]:bg-pt-amber/10',
  cyan: 'data-[state=active]:border-pt-cyan data-[state=active]:bg-pt-cyan/10',
  rose: 'data-[state=active]:border-rose-500 data-[state=active]:bg-rose-500/10',
};

export default function CleaningScope() {
  const [activeTab, setActiveTab] = useState('basic');

  return (
    <main className="py-12">
      {/* Hero */}
      <section className="py-16 md:py-20 bg-gradient-to-b from-secondary/50 to-background">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <Badge variant="outline" className="mb-6">
              <Sparkles className="h-4 w-4 mr-2" />
              Scope of Work
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              What's Included in{' '}
              <span className="text-primary">Your Cleaning</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              A friendly guide to help you understand what cleaning services <strong className="underline">typically</strong> include.
            </p>
            
            {/* Disclaimer */}
            <Alert className="max-w-2xl mx-auto bg-amber-500/10 border-amber-500/30 text-left">
              <Info className="h-5 w-5 text-amber-600" />
              <AlertDescription className="text-amber-800 dark:text-amber-200">
                <strong className="block mb-1">Important: This is a Guide Only</strong>
                All cleaners on PureTask are independent contractors who set their own standards and methods. 
                Nothing described on this page is mandatory. Each cleaner decides how they clean and what 
                tasks they perform. We recommend discussing specific expectations directly with your cleaner 
                before booking.
              </AlertDescription>
            </Alert>
            
            {/* Cleaner-focused message */}
            <Alert className="max-w-2xl mx-auto mt-4 bg-primary/10 border-primary/30 text-left">
              <Sparkles className="h-5 w-5 text-primary" />
              <AlertDescription className="text-foreground/80">
                <strong className="block mb-1">For Our Cleaners</strong>
                Our goal is to help cleaners on PureTask understand what customers typically expect when 
                booking through our platform. We hope this guide serves as a helpful reference that you 
                can use and build upon over time to deliver great experiences.
              </AlertDescription>
            </Alert>
          </motion.div>
        </div>
      </section>

      {/* Cleaning Types Tabs */}
      <section className="py-12">
        <div className="container max-w-5xl">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto gap-2 bg-transparent p-0 mb-8">
              {Object.entries(CLEANING_DUTIES).map(([key, value]) => (
                <TabsTrigger
                  key={key}
                  value={key}
                  className={`flex flex-col items-center gap-1 p-4 rounded-xl border-2 transition-all ${tabActiveColorMap[value.color]}`}
                >
                  <span className="text-2xl">{value.icon}</span>
                  <span className="text-sm font-medium">{value.title.split('(')[0].trim()}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {Object.entries(CLEANING_DUTIES).map(([key, value]) => (
              <TabsContent key={key} value={key} className="mt-0">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className={`mb-8 ${colorMap[value.color]}`}>
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <span className="text-4xl">{value.icon}</span>
                        <div>
                          <CardTitle className="text-2xl">{value.title}</CardTitle>
                          <p className="text-muted-foreground mt-1">{value.subtitle}</p>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>

                  <div className="grid md:grid-cols-2 gap-6">
                    {Object.entries(value.duties).map(([room, tasks], index) => (
                      <motion.div
                        key={room}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card className={`h-full ${colorMap[value.color]}`}>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2">
                              {room.includes('Not') ? (
                                <Info className={`h-5 w-5 ${iconColorMap[value.color]}`} />
                              ) : (
                                <CheckCircle className={`h-5 w-5 ${iconColorMap[value.color]}`} />
                              )}
                              {room}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="space-y-2">
                              {tasks.map((task, taskIndex) => (
                                <li 
                                  key={taskIndex} 
                                  className="flex items-start gap-2 text-sm text-muted-foreground"
                                >
                                  <span className={`mt-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0 ${
                                    room.includes('Not') ? 'bg-muted-foreground' : 'bg-primary'
                                  }`} />
                                  {task}
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      {/* Important Notes */}
      <section className="py-12 bg-secondary/30">
        <div className="container max-w-5xl">
          <h2 className="text-2xl font-bold mb-6 text-center">Important Notes</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Alert className="bg-primary/10 border-primary/30">
              <Info className="h-4 w-4 text-primary" />
              <AlertDescription>
                <strong>Time Estimates:</strong> All cleaning times vary. Duration depends primarily on the 
                individual cleaner and how dirty the property is. Times shown are rough estimates only.
              </AlertDescription>
            </Alert>
            
            <Alert className="bg-pt-purple/10 border-pt-purple/30">
              <Info className="h-4 w-4 text-pt-purple" />
              <AlertDescription>
                <strong>Supplies:</strong> Most cleaners bring their own supplies. If you have specific product 
                preferences (eco-friendly, allergen-free) or special requests, please mention during booking. 
                If you require a specific product or have an out-of-the-ordinary request, you should supply it yourself.
              </AlertDescription>
            </Alert>
            
            <Alert className="bg-pt-amber/10 border-pt-amber/30">
              <Info className="h-4 w-4 text-pt-amber" />
              <AlertDescription>
                <strong>Access:</strong> Please ensure the cleaner can access all areas needing cleaning. 
                Locked rooms or areas with pets may affect the scope.
              </AlertDescription>
            </Alert>
            
            <Alert className="bg-pt-cyan/10 border-pt-cyan/30">
              <Info className="h-4 w-4 text-pt-cyan" />
              <AlertDescription>
                <strong>Special Requests:</strong> Need something specific? Add notes during booking or message 
                your cleaner directly to discuss custom requirements.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container">
          <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground max-w-3xl mx-auto">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Ready to Book Your Cleaning?
              </h2>
              <p className="text-primary-foreground/90 mb-6">
                Now that you know what's included, find a verified cleaner in your area.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary" asChild>
                  <Link to="/book">
                    Book a Cleaning
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-white/40 text-white bg-white/10 hover:bg-white/20" asChild>
                  <Link to="/discover">Browse Cleaners</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
