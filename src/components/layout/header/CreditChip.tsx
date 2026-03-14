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
      className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 hover:bg-primary/15 border border-primary/20 transition-colors group"
    >
      <Wallet className="h-3.5 w-3.5 text-primary" />
      <span className="text-xs font-bold text-primary">{available}</span>
      <span className="text-xs text-primary/60 font-medium">cr</span>
    </Link>
  );
}
