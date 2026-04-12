import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useRefundRequests } from "@/hooks/useRefundRequests";
import { DollarSign, Check, X, Clock } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useState } from "react";

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'pending': return <Badge className="bg-warning/15 text-warning border-warning/30"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
    case 'approved': return <Badge className="bg-success/15 text-success border-success/30"><Check className="h-3 w-3 mr-1" />Approved</Badge>;
    case 'denied': return <Badge className="bg-destructive/15 text-destructive border-destructive/30"><X className="h-3 w-3 mr-1" />Denied</Badge>;
    default: return <Badge>{status}</Badge>;
  }
}

export default function AdminRefundQueue() {
  const { refunds, isLoading, decideRefund } = useRefundRequests();
  const [notes, setNotes] = useState<Record<string, string>>({});

  const handleDecide = async (id: string, status: 'approved' | 'denied') => {
    await decideRefund.mutateAsync({ id, status, adminNotes: notes[id] });
    toast.success(`Refund ${status}`);
  };

  return (
    <div className="container py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <DollarSign className="h-6 w-6 text-primary" /> Refund Queue
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Review and process client refund requests</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}</div>
      ) : refunds.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No refund requests</CardContent></Card>
      ) : (
        <div className="space-y-4">
          {refunds.map(refund => (
            <Card key={refund.id}>
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <StatusBadge status={refund.status} />
                      <span className="text-lg font-bold">${refund.amount_credits}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{refund.reason}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Requested {format(new Date(refund.created_at), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                </div>
                
                {refund.status === 'pending' && (
                  <div className="space-y-2 pt-2 border-t">
                    <Textarea
                      placeholder="Admin notes (optional)..."
                      className="text-sm"
                      rows={2}
                      value={notes[refund.id] || ''}
                      onChange={e => setNotes(n => ({ ...n, [refund.id]: e.target.value }))}
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleDecide(refund.id, 'approved')} disabled={decideRefund.isPending}>
                        <Check className="h-4 w-4 mr-1" /> Approve
                      </Button>
                      <Button size="sm" variant="outline" className="text-destructive" onClick={() => handleDecide(refund.id, 'denied')} disabled={decideRefund.isPending}>
                        <X className="h-4 w-4 mr-1" /> Deny
                      </Button>
                    </div>
                  </div>
                )}

                {refund.admin_notes && (
                  <div className="bg-muted/50 rounded-lg p-3 text-sm">
                    <p className="font-medium text-xs text-muted-foreground mb-1">Admin Notes</p>
                    {refund.admin_notes}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
