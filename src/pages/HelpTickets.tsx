import { useNavigate } from "react-router-dom";
import { TicketList } from "@/components/support/TicketList";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus } from "lucide-react";

export default function HelpTickets() {
  const navigate = useNavigate();
  return (
    <div className="container max-w-3xl mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/help")}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <Button size="sm" onClick={() => navigate("/help/contact")}>
          <Plus className="h-4 w-4 mr-1" /> New ticket
        </Button>
      </div>
      <h1 className="text-2xl font-bold mb-4">My tickets</h1>
      <TicketList />
    </div>
  );
}
