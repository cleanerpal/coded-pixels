interface TenantNotFoundProps {
  siteName: string;
}

export function TenantNotFound({ siteName }: TenantNotFoundProps) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-sm font-medium uppercase tracking-wide text-text-muted">
        {siteName}
      </p>
      <h1 className="max-w-lg text-3xl font-bold text-text">Page not found</h1>
      <p className="max-w-md text-text-muted">
        The page you requested does not exist on this site.
      </p>
    </main>
  );
}
