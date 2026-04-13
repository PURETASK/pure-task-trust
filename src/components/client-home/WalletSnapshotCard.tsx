import { Link } from "react-router-dom";
import { Wallet, AlertTriangle, Info, CreditCard, Zap } from "lucide-react";
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
      ? "border-destructive/30"
      : walletState === "low_balance"
      ? "border-warning/30"
      : "border-border/60";

  return (
    <Card className={`${borderClass} h-full`}>
      <CardContent className="p-5 sm:p-6 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Wallet className="h-4 w-4 text-primary" />
            </div>
            <h3 className="font-semibold text-sm">Wallet</h3>
          </div>
          <Badge variant="outline" className="text-[10px] font-medium gap-1">
            <Zap className="h-2.5 w-2.5" />
            Auto Top-Up: Off
          </Badge>
        </div>

        {/* Warning banners */}
        {walletState === "payment_issue" && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2.5 mb-4 flex items-center gap-2">
            <AlertTriangle className="h-3.5 w-3.5 text-destructive flex-shrink-0" />
            <p className="text-xs font-medium text-destructive">
              Your last payment failed. Update your payment method.
            </p>
          </div>
        )}
        {walletState === "low_balance" && (
          <div className="rounded-lg bg-warning/10 border border-warning/20 px-3 py-2.5 mb-4 flex items-center gap-2">
            <AlertTriangle className="h-3.5 w-3.5 text-warning flex-shrink-0" />
            <p className="text-xs font-medium text-warning">
              Your balance is low. Top up to avoid booking interruptions.
            </p>
          </div>
        )}

        {/* Balance display */}
        <div className="flex-1">
          <div className="mb-1">
            <span className="text-xs text-muted-foreground font-medium">Available</span>
            <p className="text-3xl font-bold tracking-tight">
              {availableBalance.toLocaleString()}
              <span className="text-sm font-medium text-muted-foreground ml-1">cr</span>
            </p>
          </div>

          {heldBalance > 0 && (
            <div className="flex items-center justify-between mt-2 py-2 border-t border-border/50">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-xs text-muted-foreground flex items-center gap-1 cursor-help">
                      Held <Info className="h-3 w-3" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p className="text-xs max-w-[200px]">
                      Held for upcoming cleaning. Released after approval.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <span className="text-sm font-medium text-muted-foreground">{heldBalance.toLocaleString()} cr</span>
            </div>
          )}
        </div>

        <p className="text-[11px] text-muted-foreground mt-3 mb-4">
          Unused held credits are returned automatically.
        </p>

        <Button size="sm" variant="outline" asChild className="w-full gap-2">
          <Link to="/wallet">
            <CreditCard className="h-3.5 w-3.5" />
            Add Credits
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
