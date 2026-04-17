import { useNavigate, useSearchParams } from "react-router-dom";
import { ContactForm } from "@/components/support/ContactForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function HelpContact() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const bookingId = params.get("bookingId") || undefined;

  return (
    <div className="container max-w-3xl mx-auto py-6 px-4">
      <Button variant="ghost" size="sm" onClick={() => navigate("/help")} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to support
      </Button>
      <ContactForm defaultBookingId={bookingId} />
    </div>
  );
}
