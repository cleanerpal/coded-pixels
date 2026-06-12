import { expect, type Page } from '@playwright/test';

import {
  decodeConfigFromParams,
  encodeConfigToParams,
} from '../lib/config-state';
import {
  applyPackage,
  monthlyTotalPence,
  oneTimeFeesPence,
} from '../lib/pricing';
import type { ConfigState } from '@codedpixels/shared-types';

/** Growth preset with Sparkle Clean — canonical spine configuration. */
export const SPINE_TEMPLATE_ID = 'sparkle-clean';

export function buildSpineConfig(
  overrides: Partial<ConfigState> = {},
): ConfigState {
  return {
    ...applyPackage('growth'),
    templateId: SPINE_TEMPLATE_ID,
    ...overrides,
  };
}

export function formatPence(pence: number): string {
  return `£${(pence / 100).toFixed(2)}`;
}

export function formatMonthlyTotal(config: ConfigState): string {
  return `${formatPence(monthlyTotalPence(config))}/mo`;
}

/** Pre-seed consent so the banner does not block bottom UI (mobile pricing bar). */
export async function seedRejectedConsent(page: Page): Promise<void> {
  await page.addInitScript(() => {
    localStorage.setItem(
      'cp_cookie_consent_v1',
      JSON.stringify({
        choice: 'rejected',
        recordedAt: new Date().toISOString(),
        version: 'cookie-v1',
      }),
    );
  });
}

/** Dismiss cookie banner when shown (ENG-021). */
export async function dismissCookieBanner(page: Page): Promise<void> {
  const banner = page.getByRole('region', { name: 'Cookie consent' });
  const reject = page.getByRole('button', {
    name: 'Reject analytics cookies',
  });

  const visible = await banner.isVisible().catch(() => false);
  if (!visible) {
    return;
  }

  await reject.click();
  await expect(banner).toBeHidden({ timeout: 5000 });
}

/** Navigate with consent pre-seeded and banner dismissed. */
export async function gotoApp(page: Page, path: string): Promise<void> {
  await seedRejectedConsent(page);
  await page.goto(path);
  await dismissCookieBanner(page);
}

/** Scroll to configurator with Growth preset from URL (ENG-006 package param). */
export async function openConfiguratorWithGrowth(page: Page): Promise<void> {
  await gotoApp(page, '/?package=growth#configurator');
  await expect(
    page.getByRole('heading', { name: 'Choose your template' }),
  ).toBeVisible();
}

/** Wait for debounced URL sync (CONFIG_URL_DEBOUNCE_MS = 300). */
export async function waitForUrlConfig(
  page: Page,
  expected: ConfigState,
  timeoutMs = 8000,
): Promise<void> {
  const expectedQuery = encodeConfigToParams(expected).toString();

  await expect
    .poll(
      () => {
        const url = new URL(page.url());
        return url.searchParams.toString();
      },
      { timeout: timeoutMs },
    )
    .toBe(expectedQuery);
}

export function configFromCurrentUrl(page: Page): ConfigState {
  const url = new URL(page.url());
  return decodeConfigFromParams(url.searchParams).config;
}

/** Enable Growth preset features in step 2 when package UI is not wired to configurator. */
export async function applyGrowthFeaturesInStep2(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Step 2: Add Features' }).click();
  await expect(
    page.getByRole('heading', { name: 'Choose your features' }),
  ).toBeVisible();

  for (const label of [
    'CRM & Lead Management',
    'Email Automation Sequences',
    'Advanced Analytics & SEO Tools',
  ]) {
    const toggle = page.getByRole('switch', { name: new RegExp(label) });
    const checked = await toggle.getAttribute('aria-checked');
    if (checked !== 'true') {
      await toggle.click();
    }
  }
}

export async function selectTemplate(
  page: Page,
  templateName: string | RegExp,
): Promise<void> {
  await page.getByRole('radio', { name: templateName }).click();
}

/** Track client Firestore write attempts — must stay empty (Callable-only PII). */
export function attachFirestoreWriteGuard(page: Page): string[] {
  const writes: string[] = [];

  page.on('request', (request) => {
    const url = request.url();
    const method = request.method();
    const isFirestore =
      url.includes('firestore.googleapis.com') ||
      url.includes('/google.firestore.v1.Firestore/');
    const isWrite = method === 'POST' || method === 'PUT' || method === 'PATCH';

    if (isFirestore && isWrite) {
      writes.push(`${method} ${url}`);
    }
  });

  return writes;
}

export function assertPricingSidebarTotal(
  page: Page,
  config: ConfigState,
): Promise<void> {
  const expected = formatMonthlyTotal(config);
  const sidebar = page.getByRole('complementary', { name: 'Pricing summary' });
  return expect(sidebar.getByText(expected)).toBeVisible();
}

export function assertOneTimeFee(
  page: Page,
  config: ConfigState,
): Promise<void> {
  const expected = formatPence(oneTimeFeesPence(config));
  const sidebar = page.getByRole('complementary', { name: 'Pricing summary' });
  return expect(sidebar.getByText(expected)).toBeVisible();
}

/** Mock Callable when Firebase emulators are not running (CI-friendly). */
export async function mockMarketingCallables(page: Page): Promise<void> {
  const fulfillSuccess = async (route: {
    request: () => { method: () => string };
    fulfill: (options: {
      status: number;
      contentType: string;
      body: string;
    }) => Promise<void>;
    continue: () => Promise<void>;
  }) => {
    if (route.request().method() !== 'POST') {
      await route.continue();
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ result: { success: true } }),
    });
  };

  await page.route('**/*submitSignup*', fulfillSuccess);
  await page.route('**/*submitSiteImportWaitlist*', fulfillSuccess);
}

export const EMULATORS_ENABLED =
  process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === 'true';
