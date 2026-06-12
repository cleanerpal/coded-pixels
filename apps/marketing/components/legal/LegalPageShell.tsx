import type { ReactNode } from "react";

type LegalPageShellProps = {
  title: string;
  lastUpdated: string;
  children: ReactNode;
};

export function LegalPageShell({
  title,
  lastUpdated,
  children,
}: LegalPageShellProps) {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <header>
        <h1 className="text-3xl font-bold text-text">{title}</h1>
        <p className="mt-2 text-sm text-text-muted">
          Last updated: {lastUpdated}
        </p>
      </header>
      <article className="mt-10">{children}</article>
    </main>
  );
}

type LegalSectionProps = {
  id: string;
  title: string;
  children: ReactNode;
};

export function LegalSection({ id, title, children }: LegalSectionProps) {
  return (
    <section id={id} className="mt-10 scroll-mt-24 first:mt-0">
      <h2 className="text-xl font-semibold text-text">{title}</h2>
      <div className="mt-4 space-y-4 text-base leading-relaxed text-text-muted">
        {children}
      </div>
    </section>
  );
}

type LegalTableProps = {
  caption: string;
  headers: readonly string[];
  rows: readonly (readonly string[])[];
};

export function LegalTable({ caption, headers, rows }: LegalTableProps) {
  return (
    <div className="overflow-x-auto rounded-card border border-border">
      <table className="w-full min-w-[32rem] text-left text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead className="border-b border-border bg-background">
          <tr>
            {headers.map((header) => (
              <th
                key={header}
                scope="col"
                className="px-4 py-3 font-medium text-text"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-surface">
          {rows.map((row) => (
            <tr key={row.join("|")}>
              {row.map((cell, index) => (
                <td key={`${row[0]}-${index}`} className="px-4 py-3 align-top">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
