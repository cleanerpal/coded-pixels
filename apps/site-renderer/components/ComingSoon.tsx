interface ComingSoonProps {
  siteName: string;
}

export function ComingSoon({ siteName }: ComingSoonProps) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-sm font-medium uppercase tracking-wide text-text-muted">
        {siteName}
      </p>
      <h1 className="max-w-lg text-3xl font-bold text-text">Coming soon</h1>
      <p className="max-w-md text-text-muted">
        This site is being set up. Check back shortly for the published homepage.
      </p>
    </main>
  );
}
