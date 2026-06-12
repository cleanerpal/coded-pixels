import { describe, expect, it } from 'vitest';

import {
  getPreviewFeatureBadges,
  PREVIEW_FEATURE_BADGE_LABELS,
  resolvePreviewTemplate,
} from '@/lib/template-themes';

describe('resolvePreviewTemplate', () => {
  it('returns default theme when no template selected', () => {
    const result = resolvePreviewTemplate(null);
    expect(result.name).toBe('No template selected');
    expect(result.theme.categoryLabel).toBe('Select a template');
    expect(result.theme.style['--preview-accent']).toBe('var(--color-text-muted)');
  });

  it('returns custom template theme for bespoke selection', () => {
    const result = resolvePreviewTemplate('custom');
    expect(result.name).toBe('Custom Template');
    expect(result.theme.categoryLabel).toBe('Bespoke');
  });

  it('returns category theme for library templates', () => {
    const sparkle = resolvePreviewTemplate('sparkle-clean');
    expect(sparkle.name).toBe('Sparkle Clean');
    expect(sparkle.theme.categoryLabel).toBe('Cleaning & Trades');
    expect(sparkle.theme.style['--preview-accent']).toBe('var(--color-primary)');

    const serenity = resolvePreviewTemplate('serenity-spa');
    expect(serenity.name).toBe('Serenity Spa');
    expect(serenity.theme.style['--preview-accent']).toBe('var(--color-accent)');
  });

  it('animates theme via distinct CSS variables per category', () => {
    const tradePro = resolvePreviewTemplate('trade-pro');
    const glowStudio = resolvePreviewTemplate('glow-studio');
    expect(tradePro.theme.style['--preview-hero-from']).not.toBe(
      glowStudio.theme.style['--preview-hero-from'],
    );
  });
});

describe('getPreviewFeatureBadges', () => {
  it('maps enabled features to short preview labels', () => {
    expect(getPreviewFeatureBadges(['crm', 'ecommerce'])).toEqual([
      'CRM',
      'Shop enabled',
    ]);
  });

  it('covers every feature id with a badge label', () => {
    const ids = Object.keys(PREVIEW_FEATURE_BADGE_LABELS) as Array<
      keyof typeof PREVIEW_FEATURE_BADGE_LABELS
    >;
    for (const id of ids) {
      expect(PREVIEW_FEATURE_BADGE_LABELS[id].length).toBeGreaterThan(0);
    }
  });
});
