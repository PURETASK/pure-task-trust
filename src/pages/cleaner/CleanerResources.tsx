import { CleanerLayout } from "@/components/cleaner/CleanerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Video, 
  FileText, 
  ExternalLink,
  ShoppingBag,
  Award,
  Lightbulb,
  HeartHandshake
} from "lucide-react";

const resources = [
  {
    category: "Training",
    items: [
      {
        title: "New Cleaner Onboarding",
        description: "Essential guide for getting started on PureTask",
        icon: BookOpen,
        badge: "Required",
        badgeVariant: "destructive" as const,
      },
      {
        title: "Deep Cleaning Masterclass",
        description: "Advanced techniques for thorough cleaning",
        icon: Video,
        badge: "Video",
        badgeVariant: "secondary" as const,
      },
      {
        title: "Customer Service Excellence",
        description: "How to exceed client expectations",
        icon: HeartHandshake,
        badge: "Popular",
        badgeVariant: "default" as const,
      },
    ],
  },
  {
    category: "Documents",
    items: [
      {
        title: "Cleaning Checklist",
        description: "Room-by-room cleaning guide",
        icon: FileText,
        badge: "PDF",
        badgeVariant: "secondary" as const,
      },
      {
        title: "Safety Guidelines",
        description: "Important health and safety information",
        icon: FileText,
        badge: "PDF",
        badgeVariant: "secondary" as const,
      },
    ],
  },
];

const discounts = [
  {
    brand: "CleanCo Supplies",
    discount: "20% off",
    description: "Professional cleaning products",
    code: "PURETASK20",
  },
  {
    brand: "EcoClean",
    discount: "15% off",
    description: "Eco-friendly cleaning solutions",
    code: "PURE15",
  },
  {
    brand: "ProGear",
    discount: "25% off",
    description: "Professional equipment and tools",
    code: "PTPRO25",
  },
];

const tips = [
  "Always arrive 5 minutes early to make a great impression",
  "Take before/after photos for every room you clean",
  "Communicate proactively if you're running late",
  "Ask clients about their preferences and allergies",
  "Leave a personal touch like arranged pillows or folded towels",
];

export default function CleanerResources() {
  return (
    <CleanerLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Resources & Education</h1>
          <p className="text-muted-foreground mt-1">Training, tips, and exclusive discounts</p>
        </div>

        {/* Training & Documents */}
        {resources.map((section) => (
          <div key={section.category}>
            <h2 className="text-xl font-semibold mb-4">{section.category}</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {section.items.map((item) => (
                <Card key={item.title} className="hover:shadow-elevated transition-all cursor-pointer">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <item.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold truncate">{item.title}</h3>
                          <Badge variant={item.badgeVariant}>{item.badge}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}

        {/* Partner Discounts */}
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Partner Discounts
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {discounts.map((discount) => (
              <Card key={discount.brand} className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="success">{discount.discount}</Badge>
                    <Award className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-1">{discount.brand}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{discount.description}</p>
                  <div className="bg-background rounded-lg p-2 text-center">
                    <p className="text-xs text-muted-foreground">Use code</p>
                    <p className="font-mono font-bold text-primary">{discount.code}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Pro Tips */}
        <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-amber-500" />
              Pro Tips from Top Cleaners
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {tips.map((tip, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="h-6 w-6 rounded-full bg-amber-500/10 flex items-center justify-center text-sm font-semibold text-amber-600 flex-shrink-0">
                    {index + 1}
                  </span>
                  <span className="text-sm">{tip}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Help Section */}
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <h3 className="font-semibold mb-1">Need Help?</h3>
              <p className="text-sm text-muted-foreground">
                Contact our support team for any questions
              </p>
            </div>
            <Button variant="outline" className="gap-2">
              <ExternalLink className="h-4 w-4" />
              Contact Support
            </Button>
          </CardContent>
        </Card>
      </div>
    </CleanerLayout>
  );
}
