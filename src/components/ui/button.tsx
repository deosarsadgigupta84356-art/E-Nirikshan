import type { ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-sm font-semibold tracking-tight transition-colors duration-150 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/40",
  {
    variants: {
      variant: {
        primary: "bg-navy text-surface hover:bg-navy-deep",
        accent: "bg-accent text-surface hover:bg-accent/90",
        verified: "bg-verified text-surface hover:bg-verified/90",
        outline: "border border-line bg-transparent text-navy hover:bg-paper-2",
        ghost: "text-navy hover:bg-paper-2",
        danger: "bg-failure text-surface",
      },
      size: {
        sm: "h-9 px-3 text-xs",
        md: "h-11 px-4 text-sm",
        lg: "h-12 px-5 text-sm min-w-40",
        icon: "size-11",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export function Button({
  className,
  variant,
  size,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
