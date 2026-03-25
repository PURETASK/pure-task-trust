import { Link } from "react-router-dom";
import { Wallet } from "lucide-react";
import { useWallet } from "@/hooks/useWallet";

/**
 * Displays the client's available credit balance as a pill chip in the header.
 */
export function CreditChip() {
  const { account } = useWallet();
  if (account === null || account === undefined) return null;

  const available = (account.current_balance || 0) - (account.held_balance || 0);

  return (
    <Link
      to="/wallet"
      className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-primary/10 hover:bg-primary/15 border border-primary/20 transition-colors active:scale-95 group"
    >
      <Wallet className="h-3.5 w-3.5 text-primary flex-shrink-0" />
      <span className="text-xs font-bold text-primary">{available}</span>
      <span className="text-[10px] text-primary/60 font-medium hidden xs:inline">cr</span>
    </Link>
  );
}
