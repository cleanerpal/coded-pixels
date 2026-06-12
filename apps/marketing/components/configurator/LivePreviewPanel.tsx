'use client';

import { useId, useState, type CSSProperties } from 'react';

import { Badge } from '@codedpixels/ui';
import {
  getPreviewFeatureBadges,
  resolvePreviewTemplate,
  type PreviewThemeStyle,
} from '@/lib/template-themes';
import type { ConfigState } from '@codedpixels/shared-types';

export interface LivePreviewPanelProps {
  config: ConfigState;
}

function PreviewBrowserChrome({
  templateName,
  categoryLabel,
}: {
  templateName: string;
  categoryLabel: string;
}) {
  return (
    <div
      aria-hidden="true"
      className="flex items-center gap-1.5 border-b border-border bg-background px-3 py-2"
    >
      <span className="size-2.5 shrink-0 rounded-full bg-border" />
      <span className="size-2.5 shrink-0 rounded-full bg-border" />
      <span className="size-2.5 shrink-0 rounded-full bg-border" />
      <span className="ml-1 min-w-0 flex-1 truncate rounded bg-surface px-2 py-0.5 text-xs text-text-muted">
        {templateName.toLowerCase().replace(/\s+/g, '-')}.codedpixels.site
      </span>
      <span className="hidden shrink-0 text-[10px] font-medium uppercase tracking-wide text-text-muted sm:inline">
        {categoryLabel}
      </span>
    </div>
  );
}

function PreviewCanvas({
  themeStyle,
  featureBadges,
  templateSelected,
}: {
  themeStyle: PreviewThemeStyle;
  featureBadges: string[];
  templateSelected: boolean;
}) {
  return (
    <div
      className="preview-theme-canvas space-y-4 p-6 transition-[background-color] duration-500 ease-in-out"
      style={themeStyle as CSSProperties}
    >
      <div
        aria-hidden="true"
        className="preview-theme-hero h-24 rounded-card transition-[background] duration-500 ease-in-out"
      />
      <div aria-hidden="true" className="space-y-2">
        <div
          className="preview-theme-line h-3 w-3/4 rounded transition-colors duration-500 ease-in-out"
          style={{ width: '75%' }}
        />
        <div className="preview-theme-line-muted h-3 w-full rounded transition-colors duration-500 ease-in-out" />
        <div
          className="preview-theme-line-muted h-3 rounded transition-colors duration-500 ease-in-out"
          style={{ width: '83%' }}
        />
      </div>

      {featureBadges.length > 0 ? (
        <ul className="flex flex-wrap gap-2" aria-label="Enabled features">
          {featureBadges.map((label) => (
            <li key={label}>
              <Badge variant="primary" className="bg-[var(--preview-accent)]">
                {label}
              </Badge>
            </li>
          ))}
        </ul>
      ) : templateSelected ? (
        <p className="text-sm text-text-muted">
          Enable add-ons to see feature badges on your site preview.
        </p>
      ) : (
        <p className="text-sm text-text-muted">
          Pick a template to preview your site theme.
        </p>
      )}
    </div>
  );
}

function PreviewPanelBody({ config }: LivePreviewPanelProps) {
  const { name, theme } = resolvePreviewTemplate(config.templateId);
  const featureBadges = getPreviewFeatureBadges(config.featureIds);
  const templateSelected = config.templateId !== null;

  return (
    <>
      <PreviewBrowserChrome templateName={name} categoryLabel={theme.categoryLabel} />
      <PreviewCanvas
        themeStyle={theme.style}
        featureBadges={featureBadges}
        templateSelected={templateSelected}
      />
    </>
  );
}

/** Desktop live preview — left column on lg+ (project plan §6). */
export function LivePreviewPanelDesktop({ config }: LivePreviewPanelProps) {
  return (
    <aside
      aria-label="Site preview"
      className="hidden lg:flex lg:flex-col lg:gap-3"
    >
      <h2 className="text-sm font-semibold uppercase tracking-wide text-text-muted">
        Live preview
      </h2>
      <div className="overflow-hidden rounded-card border border-border bg-surface shadow-rest">
        <PreviewPanelBody config={config} />
      </div>
      <p className="text-xs text-text-muted">
        Preview updates as you configure — mock wireframe, not your live site.
      </p>
    </aside>
  );
}

/** Mobile collapsible Preview tab above sticky pricing bar (project plan §6). */
export function LivePreviewPanelMobile({ config }: LivePreviewPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const panelId = useId();
  const { name } = resolvePreviewTemplate(config.templateId);
  const badgeCount = getPreviewFeatureBadges(config.featureIds).length;

  return (
    <div className="lg:hidden" aria-label="Mobile site preview">
      <div className="overflow-hidden rounded-card border border-border bg-surface shadow-rest">
        <button
          type="button"
          className="flex w-full items-center gap-2 px-4 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          aria-expanded={expanded}
          aria-controls={panelId}
          onClick={() => setExpanded((open) => !open)}
        >
          <span className="min-w-0 flex-1">
            <span className="block text-xs font-semibold uppercase tracking-wide text-text-muted">
              Preview
            </span>
            <span className="block truncate text-sm font-medium text-text">
              {name}
              {badgeCount > 0 ? (
                <span className="ml-2 text-text-muted">
                  · {badgeCount} feature{badgeCount === 1 ? '' : 's'}
                </span>
              ) : null}
            </span>
          </span>
          <span
            className={`inline-flex shrink-0 text-xs font-medium text-primary transition-transform ${expanded ? 'rotate-180' : ''}`}
            aria-hidden="true"
          >
            ▼
          </span>
          <span className="sr-only">
            {expanded ? 'Collapse preview' : 'Expand preview'}
          </span>
        </button>

        {expanded ? (
          <div id={panelId} className="border-t border-border">
            <PreviewPanelBody config={config} />
          </div>
        ) : null}
      </div>
    </div>
  );
}

/** Live preview panel — desktop column + mobile collapsible tab. */
export function LivePreviewPanel({ config }: LivePreviewPanelProps) {
  return (
    <>
      <LivePreviewPanelDesktop config={config} />
      <LivePreviewPanelMobile config={config} />
    </>
  );
}
