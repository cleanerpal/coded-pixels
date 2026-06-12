import { Button } from "@codedpixels/ui";
import { MOCK_USER } from "@/lib/mock-data";

type TopBarProps = {
  siteName: string;
};

export function TopBar({ siteName }: TopBarProps) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-surface px-4">
      <div className="flex min-w-0 items-center gap-4">
        <a
          href="/dashboard"
          className="builder-focus-ring shrink-0 text-sm font-bold text-primary"
        >
          Coded<span className="text-accent">Pixels</span>
        </a>
        <span
          className="truncate text-sm font-semibold text-text"
          aria-live="polite"
        >
          {siteName}
        </span>
        <span className="hidden rounded-pill bg-background px-2 py-0.5 text-xs text-text-muted sm:inline">
          Draft
        </span>
      </div>

      <nav
        className="flex items-center gap-1 sm:gap-2"
        aria-label="Builder actions"
      >
        <Button
          variant="secondary"
          disabled
          className="builder-focus-ring min-h-11 min-w-11 px-3"
          title="Preview coming in B3"
        >
          Preview
        </Button>
        <Button
          disabled
          className="builder-focus-ring min-h-11 min-w-11 px-3"
          title="Publish coming in B3"
        >
          Publish
        </Button>
        <button
          type="button"
          disabled
          className="builder-focus-ring min-h-11 min-w-11 rounded-card px-3 text-sm font-medium text-text-muted"
          aria-disabled="true"
          title="Settings coming soon"
        >
          Settings
        </button>
        <button
          type="button"
          className="builder-focus-ring flex min-h-11 min-w-11 items-center gap-2 rounded-card px-3 text-sm font-medium text-text"
          aria-label={`Account: ${MOCK_USER.displayName}`}
        >
          <span
            className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-surface"
            aria-hidden="true"
          >
            {MOCK_USER.displayName.charAt(0)}
          </span>
          <span className="hidden sm:inline">{MOCK_USER.displayName}</span>
        </button>
      </nav>
    </header>
  );
}
