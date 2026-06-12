import type { HTMLAttributes } from "react";

type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className = "", ...props }: CardProps) {
  return (
    <div
      className={`rounded-card border border-border bg-surface p-4 shadow-rest transition-shadow hover:shadow-hover ${className}`}
      {...props}
    />
  );
}
