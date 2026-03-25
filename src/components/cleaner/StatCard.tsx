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
    <Card className="border-border/50 active:scale-[0.97] transition-transform">
      <CardContent className="p-3 sm:p-5">
        <div className={`h-8 w-8 sm:h-10 sm:w-10 rounded-xl ${iconBgColor} flex items-center justify-center mb-2 sm:mb-3`}>
          <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${iconColor}`} />
        </div>
        <div className="text-xl sm:text-2xl font-bold">{value}</div>
        <div className="text-xs sm:text-sm text-muted-foreground">{label}</div>
      </CardContent>
    </Card>
  );
}
