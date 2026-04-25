import { FlowCard, FlowProgress } from "@/components/flow";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Home, Heart } from "lucide-react";
import dashImg from "@/assets/brand/dash-front.png";

interface Props {
  total: number;
  onStart: () => void;
}

export function StepWelcome({ total, onStart }: Props) {
  return (
    <div className="space-y-6">
      <FlowProgress current={1} total={total} />
      <FlowCard glow className="text-center relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-56 h-56 rounded-full bg-gradient-aero opacity-10 blur-3xl pointer-events-none" />
        <div className="relative">
          <img
            src={dashImg}
            alt=""
            loading="lazy"
            width={160}
            height={160}
            className="mx-auto h-32 w-32 sm:h-40 sm:w-40 drop-shadow-[0_10px_30px_hsl(var(--aero-cyan)/0.35)]"
          />
          <h1 className="font-poppins text-3xl sm:text-4xl font-semibold tracking-tight mt-4">
            Welcome to <span className="text-gradient-aero">PureTask</span>
          </h1>
          <p className="mt-3 text-aero-soft max-w-md mx-auto leading-relaxed">
            Let&apos;s set up your home profile so we can match you with the right cleaner faster
            and deliver a better experience every visit.
          </p>

          <div className="mt-8 grid sm:grid-cols-3 gap-3 text-left">
            {[
              { icon: Home, title: "Your home", body: "Tell us about your space once." },
              { icon: Heart, title: "Your preferences", body: "Set what matters most to you." },
              { icon: Sparkles, title: "Better matches", body: "We match smarter with context." },
            ].map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="rounded-2xl bg-aero-bg border border-aero p-4"
              >
                <div className="h-9 w-9 rounded-xl bg-gradient-aero text-white grid place-items-center mb-2">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="font-medium text-sm">{title}</div>
                <div className="text-xs text-aero-soft mt-0.5">{body}</div>
              </div>
            ))}
          </div>

          <Button
            onClick={onStart}
            size="lg"
            className="mt-8 rounded-full bg-aero-trust hover:bg-aero-trust/90 text-aero-trust-foreground"
          >
            Get started
            <ArrowRight className="size-4" />
          </Button>
          <p className="mt-3 text-xs text-aero-soft">Takes about 2 minutes • {total - 1} quick steps</p>
        </div>
      </FlowCard>
    </div>
  );
}
