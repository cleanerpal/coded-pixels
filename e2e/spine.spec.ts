import { expect, test } from '@playwright/test';

import { decodeConfigFromParams } from '../lib/config-state';
import { ONE_TIME_CUSTOM_TEMPLATE_PENCE } from '../lib/features';
import { applyPackage, monthlyTotalPence } from '../lib/pricing';
import { CUSTOM_TEMPLATE_CARD } from '../lib/templates';
import {
  EMULATORS_ENABLED,
  assertOneTimeFee,
  assertPricingSidebarTotal,
  attachFirestoreWriteGuard,
  buildSpineConfig,
  configFromCurrentUrl,
  formatMonthlyTotal,
  formatPence,
  mockMarketingCallables,
  openConfiguratorWithGrowth,
  selectTemplate,
  SPINE_TEMPLATE_ID,
  waitForUrlConfig,
} from './helpers';

/**
 * QA-006 · Integration spine — one spec, named steps per lane.
 * Aligned with Dr. Sophia Moreau on E2E; Dr. Nathan Cole on integration gate.
 */
test.describe('CodedPixels integration spine (QA-006)', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page, context }) => {
    await mockMarketingCallables(page);
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  });

  test('full spine: configure → price → signup → success → copy link', async ({
    page,
  }) => {
    const firestoreWrites = attachFirestoreWriteGuard(page);
    const spineConfig = buildSpineConfig();
    const signupEmail = `spine-${Date.now()}@codedpixels.test`;

    await test.step('ENG-006 / configurator: template + Growth preset on /', async () => {
      await openConfiguratorWithGrowth(page);
      await selectTemplate(page, /Sparkle Clean/i);
      await waitForUrlConfig(page, spineConfig);
    });

    await test.step('ENG-006: URL encodes configurator state', async () => {
      const decoded = configFromCurrentUrl(page);
      expect(decoded.templateId).toBe(SPINE_TEMPLATE_ID);
      expect(decoded.packageId).toBe('growth');
      expect(decoded.featureIds.sort()).toEqual(
        applyPackage('growth').featureIds.sort(),
      );
      expect(decoded.billingCycle).toBe('monthly');

      const roundTrip = decodeConfigFromParams(
        new URL(page.url()).searchParams,
      ).config;
      expect(roundTrip).toEqual(decoded);
    });

    await test.step('ENG-004 / ENG-010: pricing sidebar matches lib/pricing.ts', async () => {
      await assertPricingSidebarTotal(page, spineConfig);
      expect(monthlyTotalPence(spineConfig)).toBe(2496);
    });

    await test.step('ENG-020: /get-started order summary matches config', async () => {
      const getStartedLink = page
        .getByRole('complementary', { name: 'Pricing summary' })
        .getByRole('link', { name: 'Get Started' });
      await expect(getStartedLink).toBeVisible();

      await Promise.all([
        page.waitForURL(/\/get-started\?/),
        getStartedLink.click(),
      ]);

      await expect(
        page.getByRole('heading', { name: 'Order summary' }),
      ).toBeVisible();
      await expect(page.getByText(formatMonthlyTotal(spineConfig))).toBeVisible();
      await expect(page.getByText('CRM & Lead Management')).toBeVisible();
    });

    await test.step('INF-003: submit email via Callable (emulator or mock)', async () => {
      test.info().annotations.push({
        type: 'firebase',
        description: EMULATORS_ENABLED
          ? 'Using Firebase emulators (NEXT_PUBLIC_USE_FIREBASE_EMULATORS=true)'
          : 'Callables mocked — see e2e/README.md for emulator setup',
      });

      await expect(page.getByLabel('Email address')).toBeVisible();
      await page.getByLabel('Email address').fill(signupEmail);
      await page.locator('#signup-consent').check();
      await page.getByRole('button', { name: 'Save my plan' }).click();

      await expect(
        page.getByRole('heading', {
          name: "You're in! We've saved your plan.",
        }),
      ).toBeVisible({ timeout: 15_000 });
    });

    await test.step('ENG-020: success page compact summary + copy link restores config', async () => {
      await expect(page.getByText("We'll be in touch soon.")).toBeVisible();
      await expect(page.getByText('Sparkle Clean')).toBeVisible();
      await expect(page.getByText(formatMonthlyTotal(spineConfig))).toBeVisible();

      await page.getByRole('button', { name: 'Copy configuration link' }).click();
      await expect(page.getByText('Configuration link copied!')).toBeVisible();

      const copiedLink = await page.evaluate(() =>
        navigator.clipboard.readText(),
      );
      expect(copiedLink).toContain('template=sparkle-clean');
      expect(copiedLink).toContain('features=');

      await page.goto(copiedLink);
      await expect(
        page.getByRole('heading', { name: 'Order summary' }),
      ).toBeVisible();
      await expect(page.getByText(formatMonthlyTotal(spineConfig))).toBeVisible();
      await expect(page.getByText('CRM & Lead Management')).toBeVisible();
    });

    await test.step('security: no direct client Firestore writes', async () => {
      expect(firestoreWrites).toEqual([]);
    });
  });

  test('ENG-004 / Q13: one-time £149 when custom template one-time mode', async ({
    page,
  }) => {
    test.setTimeout(60_000);
    const firestoreWrites = attachFirestoreWriteGuard(page);

    const oneTimeConfig = {
      ...applyPackage('growth'),
      templateId: CUSTOM_TEMPLATE_CARD.id,
      featureIds: [
        ...new Set([
          ...applyPackage('growth').featureIds,
          'custom-template' as const,
        ]),
      ].sort((a, b) => a.localeCompare(b)),
      customTemplateBilling: 'one-time' as const,
    };

    await test.step('Select custom template with one-time billing', async () => {
      await openConfiguratorWithGrowth(page);

      const customTemplate = page.getByRole('radio', { name: /Custom Template/i });
      await customTemplate.scrollIntoViewIfNeeded();
      await customTemplate.click();

      await expect(
        page.getByRole('radiogroup', { name: 'Custom template billing' }),
      ).toBeVisible();

      const oneTimeBilling = page.getByRole('radio', { name: 'One-time £149' });
      await oneTimeBilling.scrollIntoViewIfNeeded();
      await oneTimeBilling.click();

      await waitForUrlConfig(page, oneTimeConfig);
    });

    await test.step('Pricing sidebar shows £149 one-time fee', async () => {
      await assertOneTimeFee(page, oneTimeConfig);
      await expect(
        page.getByRole('complementary', { name: 'Pricing summary' }),
      ).toContainText('Custom Template Design (one-time)');
      expect(ONE_TIME_CUSTOM_TEMPLATE_PENCE).toBe(14900);
      expect(formatPence(ONE_TIME_CUSTOM_TEMPLATE_PENCE)).toBe('£149.00');
    });

    await test.step('Get Started order summary includes one-time line', async () => {
      await page
        .getByRole('complementary', { name: 'Pricing summary' })
        .getByRole('link', { name: 'Get Started' })
        .click();

      await expect(page.getByText('£149.00')).toBeVisible();
      await expect(page.getByText('One-time fees')).toBeVisible();
    });

    expect(firestoreWrites).toEqual([]);
  });

  test('ENG-023 / INF-003: waitlist path stores config snapshot', async ({
    page,
  }) => {
    const firestoreWrites = attachFirestoreWriteGuard(page);
    const spineConfig = buildSpineConfig();
    const waitlistEmail = `waitlist-${Date.now()}@codedpixels.test`;

    await openConfiguratorWithGrowth(page);
    await selectTemplate(page, /Sparkle Clean/i);
    await waitForUrlConfig(page, spineConfig);

    await test.step('Expand Site Import waitlist and submit', async () => {
      await page.getByRole('button', { name: 'Step 2: Add Features' }).click();
      await page.getByRole('button', { name: 'Join waitlist' }).first().click();
      await page
        .getByLabel('Email address for Site Import waitlist')
        .fill(waitlistEmail);
      await page.locator('#site-import-waitlist-consent').check();

      const callablePromise = page.waitForRequest(
        (request) =>
          request.method() === 'POST' &&
          request.url().includes('submitSiteImportWaitlist'),
        { timeout: 15_000 },
      );

      await page
        .getByRole('button', { name: 'Join waitlist' })
        .last()
        .click();

      const callableRequest = await callablePromise;
      const body = callableRequest.postDataJSON() as {
        data?: {
          email: string;
          config: { templateId: string; featureIds: string[] };
        };
      };

      expect(body.data?.email).toBe(waitlistEmail);
      expect(body.data?.config.templateId).toBe(SPINE_TEMPLATE_ID);
      expect(body.data?.config.featureIds.sort()).toEqual(
        spineConfig.featureIds.sort(),
      );

      await expect(page.getByText("You're on the list!")).toBeVisible();
    });

    expect(firestoreWrites).toEqual([]);
  });
});
