import type { HTMLAttributes } from "react";

type BadgeVariant = "primary" | "accent" | "success";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

const variantClasses: Record<BadgeVariant, string> = {
  primary: "bg-primary text-surface",
  accent: "bg-accent text-surface",
  success: "bg-success text-surface",
};

export function Badge({
  variant = "primary",
  className = "",
  ...props
}: BadgeProps) {
  return (
    <span
      className={`inline-flex rounded-pill px-3 py-1 text-xs font-medium ${variantClasses[variant]} ${className}`}
      {...props}
    />
  );
}
