import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-accent text-surface hover:opacity-90",
  secondary: "border border-primary bg-surface text-primary hover:bg-background",
};

export function Button({
  variant = "primary",
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`rounded-card px-4 py-2 text-sm font-semibold transition-opacity ${variantClasses[variant]} ${className}`}
      {...props}
    />
  );
}
