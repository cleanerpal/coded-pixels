import { describe, expect, it } from 'vitest';

import type { ConfigState } from '@codedpixels/shared-types';

import {
  CONFIG_URL_DEBOUNCE_MS,
  buildConfigHref,
  canonicalConfigQueryFromSearchString,
  configHrefDiffers,
} from './config-url-sync';

function config(overrides: Partial<ConfigState> = {}): ConfigState {
  return {
    templateId: null,
    featureIds: [],
    billingCycle: 'monthly',
    ...overrides,
  };
}

describe('CONFIG_URL_DEBOUNCE_MS', () => {
  it('is 300ms per project plan', () => {
    expect(CONFIG_URL_DEBOUNCE_MS).toBe(300);
  });
});

describe('buildConfigHref', () => {
  it('returns pathname only for starter defaults', () => {
    expect(buildConfigHref('/configurator', config())).toBe('/configurator');
  });

  it('appends encoded query for non-default config', () => {
    expect(
      buildConfigHref(
        '/',
        config({
          templateId: 'sparkle-clean',
          featureIds: ['crm', 'email-automation'],
          billingCycle: 'monthly',
        }),
      ),
    ).toBe('/?template=sparkle-clean&features=crm%2Cemail-automation');
  });
});

describe('canonicalConfigQueryFromSearchString', () => {
  it('returns empty string for missing params', () => {
    expect(canonicalConfigQueryFromSearchString('')).toBe('');
  });

  it('normalizes param order to encoded canonical form', () => {
    const forward = canonicalConfigQueryFromSearchString(
      'template=sparkle-clean&features=crm&billing=annual',
    );
    const reversed = canonicalConfigQueryFromSearchString(
      'billing=annual&features=crm&template=sparkle-clean',
    );
    expect(forward).toBe(reversed);
    expect(forward).toBe(
      'template=sparkle-clean&features=crm&billing=annual',
    );
  });
});

describe('configHrefDiffers', () => {
  it('is false when URL matches config semantically', () => {
    const search = 'billing=annual&template=sparkle-clean&features=crm';
    const state = config({
      templateId: 'sparkle-clean',
      featureIds: ['crm'],
      billingCycle: 'annual',
    });
    expect(configHrefDiffers(search, state)).toBe(false);
  });

  it('is true when config diverges from URL', () => {
    expect(
      configHrefDiffers(
        'template=sparkle-clean',
        config({ templateId: 'sparkle-clean', featureIds: ['crm'] }),
      ),
    ).toBe(true);
  });
});
