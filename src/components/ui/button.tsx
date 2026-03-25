import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary/90 text-primary-foreground backdrop-blur-glass-sm border border-primary/30 shadow-glass-glow hover:bg-primary hover:scale-[1.03] hover:brightness-110 active:scale-[0.98]",
        destructive:
          "bg-destructive/80 text-destructive-foreground backdrop-blur-glass-sm border border-destructive/30 shadow-sm hover:bg-destructive/90 active:scale-[0.98]",
        outline:
          "border border-[var(--glass-border-strong)] bg-[var(--glass-bg)] backdrop-blur-glass-sm hover:bg-[var(--glass-bg-strong)] hover:border-primary/30 hover:text-accent-foreground active:scale-[0.98]",
        secondary:
          "bg-secondary/80 text-secondary-foreground backdrop-blur-glass-sm border border-[var(--glass-border)] hover:bg-secondary/60 active:scale-[0.98]",
        ghost: "hover:bg-[var(--glass-bg-strong)] hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-9 rounded-xl px-3.5",
        lg: "h-12 rounded-xl px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
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
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
