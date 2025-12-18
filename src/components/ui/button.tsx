import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2.5 whitespace-nowrap font-body font-medium tracking-wide transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Primary - Elegant solid with refined hover
        default:
          "bg-primary text-primary-foreground shadow-soft hover:shadow-card hover:-translate-y-0.5 rounded-full",
        destructive:
          "bg-destructive text-destructive-foreground shadow-soft hover:bg-destructive/90 rounded-lg",
        outline:
          "border border-border bg-transparent hover:bg-secondary/50 hover:border-primary/40 rounded-full",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/70 rounded-full",
        ghost: "hover:bg-muted hover:text-foreground rounded-lg",
        link: "text-primary underline-offset-4 hover:underline",
        // Luxury custom variants
        hero: "bg-primary text-primary-foreground shadow-card hover:shadow-elevated hover:-translate-y-1 rounded-full",
        trust: "bg-trust/8 text-trust border border-trust/20 hover:bg-trust/15 hover:border-trust/30 rounded-full",
        success: "bg-success text-success-foreground shadow-soft hover:bg-success/90 rounded-full",
        glass: "bg-card/80 backdrop-blur-xl border border-border/30 hover:bg-card/95 text-foreground rounded-full shadow-soft",
        // Elegant gold accent
        gold: "gradient-gold text-white shadow-soft hover:shadow-card hover:-translate-y-0.5 rounded-full",
        // Minimal elegant
        minimal: "text-foreground hover:text-primary border-b border-transparent hover:border-primary pb-1 rounded-none",
      },
      size: {
        default: "h-12 px-7 py-2.5 text-sm",
        sm: "h-10 px-5 text-sm",
        lg: "h-14 px-9 text-base",
        xl: "h-16 px-12 text-lg",
        icon: "h-11 w-11 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
