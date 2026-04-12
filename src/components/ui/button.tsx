import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-95 select-none",
  {
    variants: {
      variant: {
        default:
          "gradient-brand text-white shadow-soft hover:shadow-card hover:-translate-y-0.5 active:translate-y-0",
        destructive:
          "bg-destructive text-destructive-foreground shadow-soft hover:bg-destructive/90",
        outline:
          "border-2 border-border bg-background hover:bg-secondary hover:border-primary/30 text-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-secondary hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        glass: "bg-white/90 backdrop-blur-sm text-pt-blue hover:bg-white border border-white/20 shadow-soft",
        success: "bg-pt-green text-white shadow-soft hover:bg-pt-green/90",
        trust: "bg-pt-blue/10 text-pt-blue border border-pt-blue/20 hover:bg-pt-blue/20",
      },
      size: {
        default: "h-11 min-h-[44px] px-6 py-2 text-sm",
        sm: "h-9 min-h-[44px] md:min-h-0 px-4 text-sm",
        lg: "h-12 min-h-[48px] px-8 text-base",
        xl: "h-14 min-h-[56px] px-10 text-lg",
        icon: "h-10 w-10 min-h-[44px] min-w-[44px]",
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
