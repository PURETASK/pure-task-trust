import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
  iconColor?: string;
  iconBgColor?: string;
}

export function StatCard({ 
  icon: Icon, 
  value, 
  label, 
  iconColor = "text-primary",
  iconBgColor = "bg-primary/10"
}: StatCardProps) {
  return (
    <Card className="border-border/50">
      <CardContent className="p-5">
        <div className={`h-10 w-10 rounded-xl ${iconBgColor} flex items-center justify-center mb-3`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-sm text-muted-foreground">{label}</div>
      </CardContent>
    </Card>
  );
}
