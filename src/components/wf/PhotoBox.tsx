import { cn } from "@/lib/utils";
import { Camera, Check } from "lucide-react";

/**
 * Wireframe photo placeholder. States:
 *  - default: outlined frame + camera glyph
 *  - dashed:  optional / suggested upload
 *  - done:    success-tinted with check
 * Pass `src` to render an actual photo inside the same frame.
 */
export function PhotoBox({
  state = "default",
  src,
  label,
  onClick,
  className,
}: {
  state?: "default" | "dashed" | "done";
  src?: string;
  label?: string;
  onClick?: () => void;
  className?: string;
}) {
  const Comp = onClick ? "button" : "div";
  return (
    <Comp
      onClick={onClick}
      className={cn(
        "relative w-full aspect-square rounded-md flex items-center justify-center overflow-hidden bg-app-surface",
        state === "default" && "border border-hairline",
        state === "dashed" && "border border-dashed border-hairline",
        state === "done" && "border border-state-success-fg bg-state-success-bg",
        className,
      )}
    >
      {src ? (
        <img src={src} alt={label ?? "photo"} className="absolute inset-0 h-full w-full object-cover" />
      ) : state === "done" ? (
        <Check className="h-5 w-5 text-state-success-fg" strokeWidth={2.5} />
      ) : (
        <Camera className={cn("h-5 w-5", state === "dashed" ? "text-ink-faint/50" : "text-ink-faint")} />
      )}
      {label && (
        <span
          className={cn(
            "absolute bottom-1.5 left-1.5 z-10 rounded-[3px] px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-[0.05em]",
            state === "done"
              ? "bg-state-success-fg text-app-surface"
              : "bg-app-surface text-ink-faint",
          )}
        >
          {label}
        </span>
      )}
    </Comp>
  );
}