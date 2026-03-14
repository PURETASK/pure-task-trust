import { Link } from "react-router-dom";
import {
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  LayoutDashboard, Calendar, DollarSign, Shield, Search,
  Settings, Wallet, Star, TrendingUp, Users, Bot,
} from "lucide-react";

interface RoleQuickLinksProps {
  role: string;
}

/**
 * Role-specific navigation shortcuts rendered inside the user dropdown menu.
 */
export function RoleQuickLinks({ role }: RoleQuickLinksProps) {
  if (role === "admin") {
    return (
      <>
        <DropdownMenuItem asChild>
          <Link to="/admin/hub" className="flex items-center gap-2 cursor-pointer">
            <LayoutDashboard className="h-4 w-4 text-destructive" />Admin Hub
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/admin/analytics" className="flex items-center gap-2 cursor-pointer">
            <TrendingUp className="h-4 w-4 text-destructive" />Analytics
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/admin/trust-safety" className="flex items-center gap-2 cursor-pointer">
            <Shield className="h-4 w-4 text-destructive" />Trust & Safety
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/admin/users" className="flex items-center gap-2 cursor-pointer">
            <Users className="h-4 w-4 text-destructive" />Users
          </Link>
        </DropdownMenuItem>
      </>
    );
  }

  if (role === "cleaner") {
    return (
      <>
        <DropdownMenuItem asChild>
          <Link to="/cleaner/dashboard" className="flex items-center gap-2 cursor-pointer">
            <LayoutDashboard className="h-4 w-4 text-success" />Dashboard
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/cleaner/schedule" className="flex items-center gap-2 cursor-pointer">
            <Calendar className="h-4 w-4 text-success" />My Schedule
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/cleaner/earnings" className="flex items-center gap-2 cursor-pointer">
            <DollarSign className="h-4 w-4 text-success" />Earnings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/cleaner/ai-assistant" className="flex items-center gap-2 cursor-pointer">
            <Bot className="h-4 w-4 text-success" />AI Assistant
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/cleaner/settings" className="flex items-center gap-2 cursor-pointer">
            <Settings className="h-4 w-4 text-success" />Settings
          </Link>
        </DropdownMenuItem>
      </>
    );
  }

  // Client (default)
  return (
    <>
      <DropdownMenuItem asChild>
        <Link to="/dashboard" className="flex items-center gap-2 cursor-pointer">
          <LayoutDashboard className="h-4 w-4 text-primary" />Dashboard
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem asChild>
        <Link to="/discover" className="flex items-center gap-2 cursor-pointer">
          <Search className="h-4 w-4 text-primary" />Find Cleaners
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem asChild>
        <Link to="/wallet" className="flex items-center gap-2 cursor-pointer">
          <Wallet className="h-4 w-4 text-primary" />Wallet & Credits
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem asChild>
        <Link to="/referral" className="flex items-center gap-2 cursor-pointer">
          <Star className="h-4 w-4 text-primary" />Referral Program
        </Link>
      </DropdownMenuItem>
    </>
  );
}
