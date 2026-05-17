import { Link } from "react-router-dom";
import { Wallet, AlertTriangle, Info, CreditCard, Zap, Eye, Clock, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Props {
  availableBalance: number;
  heldBalance: number;
  walletState: "normal" | "low_balance" | "payment_issue";
}

export function WalletSnapshotCard({ availableBalance, heldBalance, walletState }: Props) {
  const borderClass =
    walletState === "payment_issue"
      ? "border-destructive/60"
      : walletState === "low_balance"
      ? "border-warning/60"
      : "border-hairline-soft";

  return (
    <Card
      className={`border-2 ${borderClass} rounded-3xl h-full shadow-wf overflow-hidden relative bg-app-surface`}
    >
      {/* Aero glow accent */}
      <div
        className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-60"
        style={{ background: "hsl(var(--primary) / 0.18)" }}
        aria-hidden
      />
      <CardContent className="p-5 sm:p-6 flex flex-col h-full relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-aero shadow-wf flex items-center justify-center">
              <Wallet className="h-4 w-4 text-white" />
            </div>
            <h3 className="font-poppins font-bold text-sm tracking-tight">Wallet</h3>
          </div>
          <Badge variant="outline" className="text-[10px] font-bold gap-1 border-2 border-[hsl(var(--pt-purple))]/40 text-[hsl(var(--pt-purple))]">
            <Zap className="h-2.5 w-2.5" />
            Auto Top-Up: Off
          </Badge>
        </div>

        {/* Warning banners */}
        {walletState === "payment_issue" && (
          <div className="rounded-2xl bg-destructive/10 border-2 border-destructive/40 px-3 py-2.5 mb-4 flex items-center gap-2">
            <AlertTriangle className="h-3.5 w-3.5 text-destructive flex-shrink-0" />
            <p className="text-xs font-bold text-destructive">
              Payment method needs attention.
            </p>
          </div>
        )}
        {walletState === "low_balance" && (
          <div className="rounded-2xl bg-warning/10 border-2 border-warning/40 px-3 py-2.5 mb-4 flex items-center gap-2">
            <AlertTriangle className="h-3.5 w-3.5 text-warning flex-shrink-0" />
            <p className="text-xs font-bold text-warning">
              Low balance — top up before your next cleaning.
            </p>
          </div>
        )}

        {/* Balance display — boxed like wallet hero */}
        <div className="flex-1">
          <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-ink-faint">Available</span>
          <div className="mt-1 inline-flex items-end gap-1 leading-none rounded-2xl border-2 border-hairline-soft px-4 py-2 bg-background/60">
            <span className="text-4xl sm:text-5xl font-poppins font-bold tracking-tight tabular-nums">
              ${Math.floor(availableBalance).toLocaleString()}
            </span>
            <span className="text-lg font-bold text-ink-muted mb-1.5">
              .{(availableBalance % 1).toFixed(2).slice(2)}
            </span>
          </div>
        </div>

        {/* Tinted stat tiles */}
        <div className="grid grid-cols-2 gap-2.5 mt-4">
          <div className="rounded-2xl border-2 border-warning/30 bg-warning/10 p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Clock className="h-3 w-3 text-warning" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">In Escrow</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger><Info className="h-2.5 w-2.5 text-ink-muted" /></TooltipTrigger>
                  <TooltipContent><p className="text-xs max-w-[200px]">Held for upcoming jobs. Released after completion or auto-returned.</p></TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <p className="text-lg font-poppins font-bold text-warning tabular-nums">${heldBalance.toLocaleString()}</p>
          </div>
          <div className="rounded-2xl border-2 border-success/30 bg-success/10 p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingUp className="h-3 w-3 text-success" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">Ready</span>
            </div>
            <p className="text-lg font-poppins font-bold text-success tabular-nums">
              ${Math.max(0, availableBalance - heldBalance).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Actions: Aero gradient primary + outline secondary */}
        <div className="flex gap-2 mt-4">
          <Button
            size="sm"
            asChild
            className="flex-1 gap-1.5 h-10 text-xs rounded-xl font-semibold text-white border-0 bg-gradient-aero shadow-wf hover:shadow-wf-lg"
          >
            <Link to="/wallet">
              <CreditCard className="h-3.5 w-3.5" />
              Add Credits
            </Link>
          </Button>
          <Button size="sm" variant="outline" asChild className="gap-1.5 h-10 text-xs rounded-xl border-2">
            <Link to="/wallet">
              <Eye className="h-3.5 w-3.5" />
              View
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
