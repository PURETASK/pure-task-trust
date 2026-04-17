import { useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { HelpCircle } from "lucide-react";
import { useHelp } from "./HelpContext";
import { AISupportChat } from "./AISupportChat";
import { useAuth } from "@/contexts/AuthContext";

export function FloatingHelpLauncher() {
  const { isAuthenticated } = useAuth();
  const { isOpen, openLauncher, closeLauncher, page, bookingId, setContext } = useHelp();
  const location = useLocation();
  const params = useParams();

  // Auto-track current page + any :id param that looks like a booking
  useEffect(() => {
    setContext({ page: location.pathname, bookingId: (params as any).id });
  }, [location.pathname, (params as any).id]);

  if (!isAuthenticated) return null;

  // Hide on /help itself (the page already has the chat)
  if (location.pathname.startsWith("/help")) return null;

  return (
    <>
      <Button
        size="icon"
        onClick={openLauncher}
        className="fixed bottom-20 md:bottom-6 right-4 z-40 h-12 w-12 rounded-full shadow-lg hover:scale-105 transition-transform"
        aria-label="Get help"
      >
        <HelpCircle className="h-5 w-5" />
      </Button>

      <Sheet open={isOpen} onOpenChange={(o) => (o ? openLauncher() : closeLauncher())}>
        <SheetContent side="right" className="w-full sm:max-w-md p-4 flex flex-col">
          <SheetHeader className="pb-3">
            <SheetTitle>Need help?</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-hidden">
            <AISupportChat compact contextPage={page} contextBookingId={bookingId} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
