import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "CodedPixels Terms of Service.",
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-text">Terms of Service</h1>
      <p className="mt-4 text-text-muted">
        Full terms of service content will be published in DOC-002. This page is
        a placeholder so footer links resolve correctly.
      </p>
    </main>
  );
}
