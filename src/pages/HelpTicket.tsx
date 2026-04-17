import { useParams, useNavigate } from "react-router-dom";
import { TicketThread } from "@/components/support/TicketThread";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useSupportTickets } from "@/hooks/useSupportTickets";
import { Badge } from "@/components/ui/badge";

export default function HelpTicket() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: tickets } = useSupportTickets();
  const ticket = tickets?.find((t: any) => t.id === id);

  return (
    <div className="container max-w-3xl mx-auto py-6 px-4 space-y-4">
      <Button variant="ghost" size="sm" onClick={() => navigate("/help/tickets")}>
        <ArrowLeft className="h-4 w-4 mr-1" /> All tickets
      </Button>
      {ticket && (
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold">{ticket.subject}</h1>
            <Badge variant="outline" className="capitalize">{ticket.status?.replace("_", " ")}</Badge>
          </div>
        </div>
      )}
      {id && <TicketThread ticketId={id} />}
    </div>
  );
}
