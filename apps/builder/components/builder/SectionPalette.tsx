import { SECTION_PALETTE } from "@/lib/mock-data";

export function SectionPalette() {
  return (
    <footer
      className="shrink-0 border-t border-border bg-surface"
      aria-label="Section palette"
    >
      <div className="flex items-center gap-2 border-b border-border px-4 py-2">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-text-muted">
          Add section
        </h2>
        <span className="text-xs text-text-muted">(add actions — B3+)</span>
      </div>

      <div className="overflow-x-auto px-4 py-3">
        <div className="flex min-w-max gap-2">
          {SECTION_PALETTE.map((item) => (
            <button
              key={item.type}
              type="button"
              disabled
              title={`${item.label} — coming in B2-002`}
              className="builder-focus-ring flex min-h-11 min-w-[7rem] flex-col items-center justify-center rounded-card border border-border bg-background px-3 py-2 text-center opacity-60"
              aria-disabled="true"
            >
              <span className="text-xs font-semibold text-text">
                {item.label}
              </span>
              <span className="text-[10px] text-text-muted">
                {item.category}
              </span>
            </button>
          ))}
        </div>
      </div>
    </footer>
  );
}
