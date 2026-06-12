import type { HTMLAttributes } from "react";

type DarkSectionProps = HTMLAttributes<HTMLElement>;

export function DarkSection({ className = "", ...props }: DarkSectionProps) {
  return (
    <section
      className={`bg-dark text-dark-text border-t border-dark-border ${className}`}
      {...props}
    />
  );
}
