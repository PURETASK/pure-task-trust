import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import {
  UserCircle2, Building2, Bell, Gift, Shield, CircleHelp, ChevronRight
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";

const sections = [
  { icon: UserCircle2, title: "Personal Info", description: "Name, phone, email, avatar", href: "/profile" },
  { icon: Building2, title: "Saved Properties", description: "Manage your addresses and access notes", href: "/properties" },
  { icon: Bell, title: "Notifications", description: "Push, SMS, and email preferences", href: "/settings/notifications" },
  { icon: Gift, title: "Referral Program", description: "Invite friends and earn credits", href: "/referral" },
  { icon: Shield, title: "Security", description: "Password, sessions, and login activity", href: "/sessions" },
  { icon: CircleHelp, title: "Help & Support", description: "FAQ, contact support, policies", href: "/help" },
];

export default function Account() {
  const { user } = useAuth();
  const name = user?.name || "Your Account";

  return (
    <main className="flex-1 bg-background min-h-screen">
      <Helmet>
        <title>Account | PureTask</title>
        <meta name="description" content="Manage your PureTask account settings and preferences." />
      </Helmet>

      <div className="container px-4 sm:px-6 py-5 sm:py-8 max-w-3xl">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{name}</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your profile, preferences, and support.</p>
        </div>

        <div className="space-y-2">
          {sections.map((section) => (
            <Link key={section.href} to={section.href}>
              <Card className="hover:shadow-card hover:border-primary/20 transition-all cursor-pointer">
                <CardContent className="p-4 sm:p-5 flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <section.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{section.title}</p>
                    <p className="text-xs text-muted-foreground">{section.description}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
