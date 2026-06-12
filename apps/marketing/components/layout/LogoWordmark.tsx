type LogoWordmarkProps = {
  className?: string;
};

export function LogoWordmark({ className = "" }: LogoWordmarkProps) {
  return (
    <span
      className={`text-xl font-bold tracking-tight ${className}`}
      aria-label="CodedPixels"
    >
      <span className="text-primary">Coded</span>
      <span className="text-accent">Pixels</span>
    </span>
  );
}
