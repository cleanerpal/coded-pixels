import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "CodedPixels Privacy Policy — how we handle your data.",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-text">Privacy Policy</h1>
      <p className="mt-4 text-text-muted">
        Full privacy policy content will be published in DOC-002. This page is a
        placeholder so footer links resolve correctly.
      </p>
    </main>
  );
}
