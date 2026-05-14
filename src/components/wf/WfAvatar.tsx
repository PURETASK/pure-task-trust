import { cn } from "@/lib/utils";

export function WfAvatar({
  src, name, size = 36, className,
}: {
  src?: string;
  name?: string;
  size?: 28 | 36 | 48 | 64;
  className?: string;
}) {
  const initials = (name ?? "")
    .split(" ")
    .map(s => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const fontSize = size <= 28 ? 10 : size <= 36 ? 12 : size <= 48 ? 14 : 18;

  return (
    <div
      className={cn(
        "shrink-0 rounded-full bg-app-canvas border border-hairline flex items-center justify-center text-ink-muted font-semibold overflow-hidden",
        className,
      )}
      style={{ width: size, height: size, fontSize }}
    >
      {src
        ? <img src={src} alt={name ?? ""} className="h-full w-full object-cover" />
        : (initials || "·")}
    </div>
  );
}