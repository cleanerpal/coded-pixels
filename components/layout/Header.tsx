"use client";

import Link from "next/link";
import { useState } from "react";
import { LogoWordmark } from "@/components/layout/LogoWordmark";

const navLinks = [
  { href: "/templates", label: "Templates" },
  { href: "/pricing", label: "Pricing" },
] as const;

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="rounded-card focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          onClick={() => setMenuOpen(false)}
        >
          <LogoWordmark />
        </Link>

        <nav
          className="hidden items-center gap-6 md:flex"
          aria-label="Main navigation"
        >
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-sm font-medium text-text-muted transition-colors hover:text-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              {label}
            </Link>
          ))}
          <Link
            href="/get-started"
            className="rounded-card bg-accent px-4 py-2 text-sm font-semibold text-surface transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Get Started
          </Link>
        </nav>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-card p-2 text-text md:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="sr-only">{menuOpen ? "Close menu" : "Open menu"}</span>
          <span className="flex h-5 w-5 flex-col justify-center gap-1" aria-hidden="true">
            <span
              className={`block h-0.5 w-5 bg-text transition-transform ${menuOpen ? "translate-y-1.5 rotate-45" : ""}`}
            />
            <span
              className={`block h-0.5 w-5 bg-text transition-opacity ${menuOpen ? "opacity-0" : ""}`}
            />
            <span
              className={`block h-0.5 w-5 bg-text transition-transform ${menuOpen ? "-translate-y-1.5 -rotate-45" : ""}`}
            />
          </span>
        </button>
      </div>

      {menuOpen ? (
        <nav
          id="mobile-nav"
          className="border-t border-border bg-surface px-4 py-4 md:hidden"
          aria-label="Main navigation"
        >
          <ul className="flex flex-col gap-3">
            {navLinks.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="block rounded-card px-2 py-2 text-sm font-medium text-text-muted transition-colors hover:bg-background hover:text-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  onClick={() => setMenuOpen(false)}
                >
                  {label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/get-started"
                className="block rounded-card bg-accent px-4 py-2 text-center text-sm font-semibold text-surface transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                onClick={() => setMenuOpen(false)}
              >
                Get Started
              </Link>
            </li>
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
