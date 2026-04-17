import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AISupportChat } from "@/components/support/AISupportChat";
import { TopicGrid } from "@/components/support/TopicGrid";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Inbox, Mail, FileText } from "lucide-react";
import { useSupportTickets } from "@/hooks/useSupportTickets";
import { SEO } from "@/components/seo/SEO";
import helpBg from "@/assets/help-bg.png";

export default function Help() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: tickets } = useSupportTickets();
  const unread = (tickets || []).filter((t: any) => t.unread_by_user).length;
  const role = user?.role === "cleaner" ? "cleaner" : user?.role === "client" ? "client" : undefined;

  return (
    <>
      <SEO title="Support Center — PureTask" description="Get help with bookings, payments, and your account. Chat with our AI or talk to a human." />
      <div
        className="relative min-h-screen"
        style={{
          backgroundImage: `url(${helpBg})`,
          backgroundSize: '100% auto',
          backgroundRepeat: 'repeat-y',
          backgroundPosition: 'top center',
        }}
      >
        <div className="absolute inset-0 bg-background/60 pointer-events-none" aria-hidden="true" />
        <div className="container max-w-5xl mx-auto py-6 px-4 space-y-6 relative">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              Hi {user?.name?.split(" ")[0] || "there"}, how can we help?
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Ask the AI, browse articles, or talk to a human.
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate("/help/tickets")} className="relative">
            <Inbox className="h-4 w-4 mr-2" />
            My tickets
            {unread > 0 && (
              <span className="ml-2 bg-primary text-primary-foreground text-xs rounded-full h-5 min-w-5 px-1.5 flex items-center justify-center">
                {unread}
              </span>
            )}
          </Button>
        </div>

        <div className="rounded-2xl border-2 border-[hsl(var(--pt-blue-deep))] bg-[hsl(var(--pt-blue))]/[0.04] p-2">
          <AISupportChat accentVar="pt-blue" />
        </div>

        <div className="rounded-2xl border-2 border-[hsl(var(--pt-green-deep))] bg-[hsl(var(--pt-green))]/[0.04] p-5">
          <h2 className="font-bold text-lg mb-3 text-[hsl(var(--pt-green-deep))]">Browse help</h2>
          <TopicGrid role={role} />
        </div>

        <Card className="p-6 rounded-2xl border-2 border-[hsl(var(--pt-amber-deep))] bg-[hsl(var(--pt-amber))]/[0.05]">
          <div className="flex items-start gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <h3 className="font-bold text-[hsl(var(--pt-amber-deep))]">Need a human?</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Our support team replies within 2 hours during business days.
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                onClick={() => navigate("/help/contact")}
                className="bg-[hsl(var(--pt-amber))] hover:bg-[hsl(var(--pt-amber-deep))] text-white border-2 border-[hsl(var(--pt-amber-deep))]"
              >
                <FileText className="h-4 w-4 mr-2" />
                Open ticket
              </Button>
              <Button
                variant="outline"
                asChild
                className="border-2 border-[hsl(var(--pt-purple-deep))] text-[hsl(var(--pt-purple-deep))] hover:bg-[hsl(var(--pt-purple))]/10"
              >
                <a href="mailto:support@puretask.co">
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </a>
              </Button>
            </div>
          </div>
        </Card>
        </div>
      </div>
    </>
  );
}
