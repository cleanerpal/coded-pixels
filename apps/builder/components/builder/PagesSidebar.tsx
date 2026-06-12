import { MOCK_PAGES } from "@/lib/mock-data";

type PagesSidebarProps = {
  activePageId: string;
};

export function PagesSidebar({ activePageId }: PagesSidebarProps) {
  return (
    <aside
      className="flex w-52 shrink-0 flex-col border-r border-border bg-surface"
      aria-label="Pages"
    >
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-text-muted">
          Pages
        </h2>
      </div>

      <ul className="flex-1 overflow-y-auto p-2" role="list">
        {MOCK_PAGES.map((page) => {
          const isActive = page.id === activePageId;
          return (
            <li key={page.id}>
              <button
                type="button"
                className={`builder-focus-ring flex min-h-11 w-full items-center rounded-card px-3 text-left text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-text hover:bg-background"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                {page.title}
              </button>
            </li>
          );
        })}
      </ul>

      <div className="border-t border-border p-2">
        <button
          type="button"
          disabled
          className="builder-focus-ring flex min-h-11 w-full items-center justify-center rounded-card border border-dashed border-border px-3 text-sm font-medium text-text-muted"
          aria-disabled="true"
          title="Add page coming soon"
        >
          + Add page
        </button>
      </div>
    </aside>
  );
}
