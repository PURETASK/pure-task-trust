import { Helmet } from "react-helmet-async";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useDataExport } from "@/hooks/useDataExport";
import { Download, Clock, CheckCircle, FileText } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function DataExport() {
  const { exports, isLoading, requestExport } = useDataExport();

  const handleRequest = async () => {
    await requestExport.mutateAsync();
    toast.success('Data export requested. You will be notified when it is ready.');
  };

  return (
    <>
      <Helmet><title>Data Export | PureTask</title></Helmet>
      <div className="container max-w-2xl py-8 space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-poppins font-bold text-gradient-aero flex items-center gap-2">
            <Download className="h-6 w-6 text-primary" /> Data Export
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Download a copy of all your personal data (GDPR compliant)</p>
        </div>

        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold">What's included</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Profile information and settings</li>
                <li>• Booking history and job details</li>
                <li>• Payment and credit transactions</li>
                <li>• Reviews you've given and received</li>
                <li>• Messages and notification history</li>
              </ul>
            </div>
            <Button onClick={handleRequest} disabled={requestExport.isPending}>
              <FileText className="h-4 w-4 mr-2" /> Request Data Export
            </Button>
          </CardContent>
        </Card>

        {isLoading ? (
          <Skeleton className="h-20 rounded-xl" />
        ) : exports.length > 0 && (
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {exports.map(exp => (
                  <div key={exp.id} className="px-4 py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Export requested {format(new Date(exp.requested_at), 'MMM d, yyyy')}</p>
                      {exp.completed_at && <p className="text-xs text-muted-foreground">Completed {format(new Date(exp.completed_at), 'MMM d, yyyy')}</p>}
                    </div>
                    {exp.status === 'pending' ? (
                      <Badge className="bg-warning/15 text-warning"><Clock className="h-3 w-3 mr-1" />Processing</Badge>
                    ) : exp.status === 'completed' ? (
                      <Badge className="bg-success/15 text-success"><CheckCircle className="h-3 w-3 mr-1" />Ready</Badge>
                    ) : (
                      <Badge>{exp.status}</Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
