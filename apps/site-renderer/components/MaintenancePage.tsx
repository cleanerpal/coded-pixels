interface MaintenancePageProps {
  siteName: string;
}

export function MaintenancePage({ siteName }: MaintenancePageProps) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-sm font-medium uppercase tracking-wide text-text-muted">
        {siteName}
      </p>
      <h1 className="max-w-lg text-3xl font-bold text-text">Temporarily unavailable</h1>
      <p className="max-w-md text-text-muted">
        This site is currently offline for maintenance. Please try again later.
      </p>
    </main>
  );
}
