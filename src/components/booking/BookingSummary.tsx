import { useState } from "react";
import { ChevronUp, ChevronDown, Wallet, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface SummaryLine {
  label: string;
  value: string;
  highlight?: boolean;
}

interface Props {
  lines: SummaryLine[];
  subtotal: number;
  rushFee?: number;
  total: number;
  walletBalance?: number;
  ctaLabel: string;
  onCta: () => void;
  ctaDisabled?: boolean;
  ctaLoading?: boolean;
  showBack?: boolean;
  onBack?: () => void;
}

export function BookingSummary({
  lines, subtotal, rushFee = 0, total, walletBalance,
  ctaLabel, onCta, ctaDisabled, ctaLoading, showBack, onBack,
}: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const lowBalance = walletBalance != null && walletBalance < total;

  return (
    <>
      {/* Desktop: sticky right rail */}
      <aside className="hidden lg:block">
        <div className="sticky top-24">
          <div
            className="rounded-2xl border-2 p-5 bg-background"
            style={{ borderColor: "hsl(var(--pt-green-deep))", backgroundColor: "hsl(var(--pt-green)/0.04)" }}
          >
            <h3 className="text-xs uppercase tracking-widest font-poppins font-bold mb-4" style={{ color: "hsl(var(--pt-green-deep))" }}>
              Booking Summary
            </h3>
            <div className="space-y-2.5 text-sm">
              {lines.map((l, i) => (
                <div key={i} className="flex items-start justify-between gap-3">
                  <span className="text-muted-foreground">{l.label}</span>
                  <span className={cn("text-right font-semibold", l.highlight && "text-warning")}>
                    {l.value}
                  </span>
                </div>
              ))}
            </div>
            <div className="my-4 border-t border-border" />
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="font-semibold tabular-nums">${subtotal}</span>
              </div>
              {rushFee > 0 && (
                <div className="flex justify-between text-warning">
                  <span>Same-day rush</span>
                  <span className="font-semibold tabular-nums">+${rushFee}</span>
                </div>
              )}
            </div>
            <div className="my-3 border-t-2 border-dashed border-border" />
            <div className="flex items-end justify-between mb-1">
              <span className="text-sm font-bold">Total</span>
              <span className="text-3xl font-poppins font-bold tabular-nums" style={{ color: "hsl(var(--pt-green-deep))" }}>
                ${total}
              </span>
            </div>
            {walletBalance != null && (
              <div
                className={cn(
                  "flex items-center gap-1.5 text-[11px] font-bold mb-4 mt-2 rounded-full px-2.5 py-1 w-fit",
                  lowBalance ? "text-destructive bg-destructive/10" : "bg-background"
                )}
                style={!lowBalance ? { color: "hsl(var(--pt-green-deep))", border: "2px solid hsl(var(--pt-green-deep))" } : undefined}
              >
                <Wallet className="h-3 w-3" />
                Wallet: ${walletBalance}
              </div>
            )}
            <Button
              className="w-full gap-2 h-11 text-white border-2 border-white mt-2"
              style={{
                background: "linear-gradient(135deg, hsl(var(--pt-green-deep)) 0%, hsl(var(--pt-green)) 100%)",
                boxShadow: "0 8px 24px -6px hsl(var(--pt-green-deep)/0.45)",
              }}
              disabled={ctaDisabled || ctaLoading}
              onClick={onCta}
            >
              {ctaLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>{ctaLabel} <ArrowRight className="h-4 w-4" /></>}
            </Button>
            {showBack && (
              <Button variant="ghost" size="sm" className="w-full mt-2" onClick={onBack}>
                Back
              </Button>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile: sticky bottom bar */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t-2 bg-background/95 backdrop-blur-md"
        style={{ borderColor: "hsl(var(--pt-green-deep))" }}>
        {mobileOpen && (
          <div className="px-4 py-3 max-h-[40vh] overflow-y-auto border-b border-border space-y-2 text-sm">
            {lines.map((l, i) => (
              <div key={i} className="flex justify-between gap-3">
                <span className="text-muted-foreground">{l.label}</span>
                <span className="font-semibold text-right">{l.value}</span>
              </div>
            ))}
            {rushFee > 0 && (
              <div className="flex justify-between text-warning pt-2 border-t border-border">
                <span>Same-day rush</span>
                <span className="font-semibold">+${rushFee}</span>
              </div>
            )}
          </div>
        )}
        <div className="flex items-center gap-3 p-3">
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="flex flex-col items-start min-w-0"
          >
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold flex items-center gap-1">
              Total {mobileOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
            </span>
            <span className="text-2xl font-poppins font-bold tabular-nums" style={{ color: "hsl(var(--pt-green-deep))" }}>
              ${total}
            </span>
          </button>
          <Button
            className="flex-1 gap-2 h-12 text-white border-2 border-white"
            style={{
              background: "linear-gradient(135deg, hsl(var(--pt-green-deep)) 0%, hsl(var(--pt-green)) 100%)",
              boxShadow: "0 8px 24px -6px hsl(var(--pt-green-deep)/0.45)",
            }}
            disabled={ctaDisabled || ctaLoading}
            onClick={onCta}
          >
            {ctaLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>{ctaLabel} <ArrowRight className="h-4 w-4" /></>}
          </Button>
        </div>
      </div>
    </>
  );
}
