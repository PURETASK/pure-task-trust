import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { useCreateTicket } from "@/hooks/useSupportTickets";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const CATEGORIES = [
  { value: "bookings", label: "Bookings & scheduling" },
  { value: "payments", label: "Payments & refunds" },
  { value: "account", label: "Account & security" },
  { value: "jobs", label: "Job issues (cleaner)" },
  { value: "safety", label: "Safety concern" },
  { value: "other", label: "Something else" },
];

export function ContactForm({ defaultBookingId }: { defaultBookingId?: string }) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const createTicket = useCreateTicket();
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("medium");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [bookingId, setBookingId] = useState(defaultBookingId || "");

  const submit = () => {
    if (!category || !subject.trim() || !description.trim()) {
      toast({ title: "Missing info", description: "Please complete all required fields.", variant: "destructive" });
      return;
    }
    createTicket.mutate(
      {
        issueType: category,
        priority,
        subject,
        description,
        bookingId: bookingId || undefined,
      },
      {
        onSuccess: () => navigate("/help/tickets"),
      }
    );
  };

  return (
    <Card className="p-6 space-y-4 max-w-2xl">
      <div>
        <h2 className="font-bold text-lg">Open a ticket</h2>
        <p className="text-sm text-muted-foreground">A human will reply within 2 hours.</p>
      </div>

      <div className="space-y-2">
        <Label>Category *</Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger><SelectValue placeholder="Pick a topic…" /></SelectTrigger>
          <SelectContent>
            {CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Priority</Label>
        <Select value={priority} onValueChange={setPriority}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="urgent">Urgent (safety / payment)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Subject *</Label>
        <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="One-line summary" maxLength={120} />
      </div>

      <div className="space-y-2">
        <Label>Describe the issue *</Label>
        <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={6} placeholder="Give us as much detail as you can…" />
      </div>

      <div className="space-y-2">
        <Label>Booking ID (optional)</Label>
        <Input value={bookingId} onChange={e => setBookingId(e.target.value)} placeholder="Paste booking ID if relevant" />
      </div>

      <Button onClick={submit} disabled={createTicket.isPending} className="w-full">
        {createTicket.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
        Submit ticket
      </Button>
    </Card>
  );
}
