import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@codedpixels/ui";
import { MOCK_USER } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <span className="text-sm font-bold text-primary">
            Coded<span className="text-accent">Pixels</span>
          </span>
          <span className="text-sm text-text-muted">{MOCK_USER.displayName}</span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="text-2xl font-bold text-text">Your sites</h1>
        <p className="mt-2 text-text-muted">
          Manage and edit the websites you build with CodedPixels.
        </p>

        <Card className="mt-8 flex flex-col items-center justify-center py-16 text-center">
          <p className="text-lg font-semibold text-text">
            Your sites will appear here
          </p>
          <p className="mt-2 max-w-md text-sm text-text-muted">
            Once you complete onboarding, your site will show up on this
            dashboard. For now, explore the builder shell with a demo site.
          </p>
          <Link
            href="/sites/demo-site/edit"
            className="builder-focus-ring mt-6 inline-flex min-h-11 items-center rounded-card bg-accent px-5 text-sm font-semibold text-surface transition-opacity hover:opacity-90"
          >
            Open demo editor
          </Link>
        </Card>
      </main>
    </div>
  );
}
