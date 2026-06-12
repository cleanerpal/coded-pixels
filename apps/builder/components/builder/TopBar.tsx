"use client";

import { Button } from "@codedpixels/ui";
import { MOCK_USER } from "@/lib/mock-data";

export type PublishStatus = "idle" | "publishing" | "success" | "error";

type TopBarProps = {
  siteName: string;
  isDesktop: boolean;
  publishStatus: PublishStatus;
  publishError: string | null;
  liveSiteUrl: string | null;
  onPublish: () => void;
  onDismissPublishMessage: () => void;
};

export function TopBar({
  siteName,
  isDesktop,
  publishStatus,
  publishError,
  liveSiteUrl,
  onPublish,
  onDismissPublishMessage,
}: TopBarProps) {
  const isPublishing = publishStatus === "publishing";
  const publishDisabled = !isDesktop || isPublishing;

  return (
    <>
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
            {publishStatus === "success" ? "Published" : "Draft"}
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
            disabled={publishDisabled}
            onClick={onPublish}
            className="builder-focus-ring min-h-11 min-w-11 px-3"
            title={
              !isDesktop
                ? "Publish is available on desktop only"
                : "Publish site"
            }
            aria-busy={isPublishing}
          >
            {isPublishing ? "Publishing…" : "Publish"}
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

      {publishStatus === "success" && liveSiteUrl ? (
        <div
          className="flex items-center justify-between gap-3 border-b border-success/30 bg-success/10 px-4 py-2 text-sm text-text"
          role="status"
          aria-live="polite"
        >
          <span>Site published</span>
          <div className="flex items-center gap-3">
            <a
              href={liveSiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="builder-focus-ring font-semibold text-primary underline"
            >
              View live site
            </a>
            <button
              type="button"
              onClick={onDismissPublishMessage}
              className="builder-focus-ring rounded-card px-2 py-1 text-text-muted"
            >
              Dismiss
            </button>
          </div>
        </div>
      ) : null}

      {publishStatus === "error" && publishError ? (
        <div
          className="flex items-center justify-between gap-3 border-b border-red-200 bg-red-50 px-4 py-2 text-sm text-text"
          role="alert"
          aria-live="assertive"
        >
          <span>{publishError}</span>
          <button
            type="button"
            onClick={onDismissPublishMessage}
            className="builder-focus-ring shrink-0 rounded-card px-2 py-1 text-text-muted"
          >
            Dismiss
          </button>
        </div>
      ) : null}
    </>
  );
}
