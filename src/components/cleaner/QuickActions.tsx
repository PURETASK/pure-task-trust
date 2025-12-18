import { Link } from "react-router-dom";
import { LucideIcon, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface QuickActionProps {
  icon: LucideIcon;
  label: string;
  href: string;
  iconColor?: string;
  iconBgColor?: string;
}

export function QuickAction({ 
  icon: Icon, 
  label, 
  href,
  iconColor = "text-foreground",
  iconBgColor = "bg-muted"
}: QuickActionProps) {
  return (
    <Link to={href}>
      <Card className="hover:border-primary/50 hover:shadow-sm transition-all cursor-pointer h-full">
        <CardContent className="flex flex-col items-center justify-center p-6 text-center">
          <div className={`h-12 w-12 rounded-xl ${iconBgColor} flex items-center justify-center mb-3`}>
            <Icon className={`h-6 w-6 ${iconColor}`} />
          </div>
          <span className="text-sm font-medium">{label}</span>
        </CardContent>
      </Card>
    </Link>
  );
}

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
  iconColor?: string;
  iconBgColor?: string;
}

export function FeatureCard({ 
  icon: Icon, 
  title, 
  description, 
  href,
  iconColor = "text-primary",
  iconBgColor = "bg-primary/10"
}: FeatureCardProps) {
  return (
    <Link to={href}>
      <Card className="hover:border-primary/50 hover:shadow-sm transition-all cursor-pointer h-full">
        <CardContent className="p-5">
          <div className={`h-10 w-10 rounded-xl ${iconBgColor} flex items-center justify-center mb-4`}>
            <Icon className={`h-5 w-5 ${iconColor}`} />
          </div>
          <h3 className="font-semibold mb-1">{title}</h3>
          <p className="text-sm text-muted-foreground mb-3">{description}</p>
          <div className="flex items-center gap-1 text-sm font-medium text-primary">
            Open <ChevronRight className="h-4 w-4" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
