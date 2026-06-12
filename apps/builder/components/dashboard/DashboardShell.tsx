'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { MOCK_USER } from '@/lib/mock-data';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Sites' },
  { href: '/dashboard/leads', label: 'Leads' },
  { href: '/dashboard/products', label: 'Products' },
  { href: '/dashboard/billing', label: 'Billing' },
] as const;

interface DashboardShellProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function DashboardShell({
  title,
  description,
  children,
}: DashboardShellProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link href="/dashboard" className="text-sm font-bold text-primary">
            Coded<span className="text-accent">Pixels</span>
          </Link>
          <span className="text-sm text-text-muted">{MOCK_USER.displayName}</span>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl gap-8 px-4 py-8">
        <nav
          aria-label="Dashboard"
          className="hidden w-44 shrink-0 md:block"
        >
          <ul className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const active =
                item.href === '/dashboard'
                  ? pathname === '/dashboard'
                  : pathname.startsWith(item.href);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`builder-focus-ring block rounded-card px-3 py-2 text-sm font-medium ${
                      active
                        ? 'bg-primary text-surface'
                        : 'text-text-muted hover:bg-background hover:text-text'
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <main className="min-w-0 flex-1">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-text">{title}</h1>
            {description ? (
              <p className="mt-1 text-sm text-text-muted">{description}</p>
            ) : null}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
