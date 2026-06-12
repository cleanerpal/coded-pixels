export function PlatformNotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center">
      <h1 className="text-3xl font-bold text-text">Site not found</h1>
      <p className="max-w-md text-text-muted">
        We could not find a CodedPixels site for this address.
      </p>
    </main>
  );
}
