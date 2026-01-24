import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps extends React.ComponentProps<"input"> {
  inputMode?: "none" | "text" | "decimal" | "numeric" | "tel" | "search" | "email" | "url";
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, inputMode, ...props }, ref) => {
    return (
      <input
        type={type}
        inputMode={inputMode}
        className={cn(
          // Base: 48px height on mobile (min-h-12), 44px on desktop (h-11)
          // 16px font size prevents iOS zoom on focus
          "flex h-12 md:h-11 min-h-[48px] md:min-h-[44px] w-full rounded-xl border border-input bg-background px-4 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary transition-all disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
