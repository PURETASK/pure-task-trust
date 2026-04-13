import { Link } from "react-router-dom";
import { Wallet, AlertTriangle, Info, CreditCard, Zap, Eye } from "lucide-react";
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
      ? "border-destructive/50"
      : walletState === "low_balance"
      ? "border-warning/50"
      : "border-success/50";

  return (
    <Card className={`border-2 ${borderClass} rounded-3xl h-full`}>
      <CardContent className="p-5 sm:p-6 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-success/10 border-2 border-success/30 flex items-center justify-center">
              <Wallet className="h-4 w-4 text-success" />
            </div>
            <h3 className="font-bold text-sm">Wallet</h3>
          </div>
          <Badge variant="outline" className="text-[10px] font-bold gap-1 border-2 border-[hsl(var(--pt-purple))]/30 text-[hsl(var(--pt-purple))]">
            <Zap className="h-2.5 w-2.5" />
            Auto Top-Up: Off
          </Badge>
        </div>

        {/* Warning banners */}
        {walletState === "payment_issue" && (
          <div className="rounded-xl bg-destructive/10 border-2 border-destructive/30 px-3 py-2.5 mb-4 flex items-center gap-2">
            <AlertTriangle className="h-3.5 w-3.5 text-destructive flex-shrink-0" />
            <p className="text-xs font-bold text-destructive">
              Payment method needs attention.
            </p>
          </div>
        )}
        {walletState === "low_balance" && (
          <div className="rounded-xl bg-warning/10 border-2 border-warning/30 px-3 py-2.5 mb-4 flex items-center gap-2">
            <AlertTriangle className="h-3.5 w-3.5 text-warning flex-shrink-0" />
            <p className="text-xs font-bold text-warning">
              Low balance — top up before your next cleaning.
            </p>
          </div>
        )}

        {/* Balance display */}
        <div className="flex-1">
          <div className="mb-1">
            <span className="text-xs text-muted-foreground font-medium">Available</span>
            <p className="text-3xl font-black tracking-tight">
              ${availableBalance.toLocaleString()}
            </p>
          </div>

          {heldBalance > 0 && (
            <div className="flex items-center justify-between mt-2 py-2 border-t-2 border-border/50">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-xs text-muted-foreground flex items-center gap-1 cursor-help">
                      Held <Info className="h-3 w-3" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p className="text-xs max-w-[200px]">
                      Held credits are only finalized after job completion.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <span className="text-sm font-bold text-muted-foreground">${heldBalance.toLocaleString()}</span>
            </div>
          )}
        </div>

        <p className="text-[11px] text-muted-foreground mt-3 mb-4">
          Unused held credits are returned automatically.
        </p>

        {/* Actions: Add Credits + View Wallet */}
        <div className="flex gap-2">
          <Button size="sm" variant="default" asChild className="flex-1 gap-1.5 h-9 text-xs rounded-xl">
            <Link to="/wallet">
              <CreditCard className="h-3.5 w-3.5" />
              Add Credits
            </Link>
          </Button>
          <Button size="sm" variant="outline" asChild className="gap-1.5 h-9 text-xs rounded-xl border-2">
            <Link to="/wallet">
              <Eye className="h-3.5 w-3.5" />
              View Wallet
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
