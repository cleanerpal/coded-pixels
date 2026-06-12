import Link from "next/link";
import { LogoWordmark } from "@/components/layout/LogoWordmark";

const legalLinks = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
] as const;

export function Footer() {
  return (
    <footer className="border-t border-dark-border bg-dark text-dark-text">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <Link
              href="/"
              className="inline-block rounded-card focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <LogoWordmark />
            </Link>
            <p className="max-w-md text-sm text-dark-text-muted">
              Professional websites without agency prices.
            </p>
          </div>

          <nav aria-label="Legal">
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {legalLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm font-medium text-dark-text-muted transition-colors hover:text-dark-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-8 border-t border-dark-border pt-6">
          <p className="text-center text-sm text-dark-text-muted sm:text-left">
            UK-based · Secure payments · GDPR compliant · Cancel anytime
          </p>
        </div>
      </div>
    </footer>
  );
}
