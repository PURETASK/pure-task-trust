import { CleanerLayout } from "@/components/cleaner/CleanerLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Package } from "lucide-react";

export default function CleanerMessages() {
  return (
    <CleanerLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Messages</h1>
        
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Package className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">No messages yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Messages from clients will appear here
            </p>
          </CardContent>
        </Card>
      </div>
    </CleanerLayout>
  );
}
