import { expect, test, type Page } from '@playwright/test';

import { applyPackage } from '../lib/pricing';
import {
  assertPricingSidebarTotal,
  buildSpineConfig,
  dismissCookieBanner,
  formatMonthlyTotal,
  gotoApp,
  openConfiguratorWithGrowth,
  selectTemplate,
  SPINE_TEMPLATE_ID,
  waitForUrlConfig,
} from './helpers';

async function gotoConfigurator(page: Page, path = '/#configurator') {
  await gotoApp(page, path);
  await expect(page.getByRole('heading', { name: 'Configure your website' })).toBeVisible();
}

function desktopPricingSummary(page: Page) {
  return page.getByRole('complementary', { name: 'Pricing summary' });
}

function mobilePricingSummary(page: Page) {
  return page.locator('[aria-label="Mobile pricing summary"]');
}

function sidebarMonthlyTotal(page: Page) {
  return desktopPricingSummary(page).locator('[aria-live="polite"][aria-atomic="true"]');
}

function mobileBarMonthlyTotal(page: Page) {
  return mobilePricingSummary(page).locator('[aria-live="polite"][aria-atomic="true"]');
}

/**
 * QA-001 · Configurator E2E
 * Aligned with Dr. Sophia Moreau on Q40 error cases and Playwright coverage.
 */
test.describe('Configurator E2E — QA-001', () => {
  test('template selection, feature toggle, and live total update', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await gotoConfigurator(page);

    await selectTemplate(page, /Sparkle Clean/i);
    await waitForUrlConfig(page, {
      templateId: SPINE_TEMPLATE_ID,
      featureIds: [],
      billingCycle: 'monthly',
    });

    await expect(sidebarMonthlyTotal(page)).toHaveText('£9.99/mo');

    await page.getByRole('button', { name: /Step 2: Add Features/i }).click();
    await page.locator('#feature-crm').click();

    await waitForUrlConfig(page, {
      templateId: SPINE_TEMPLATE_ID,
      featureIds: ['crm'],
      billingCycle: 'monthly',
    });
    await expect(sidebarMonthlyTotal(page)).toHaveText('£14.98/mo');

    await page.locator('#feature-crm').click();
    await waitForUrlConfig(page, {
      templateId: SPINE_TEMPLATE_ID,
      featureIds: [],
      billingCycle: 'monthly',
    });
    await expect(sidebarMonthlyTotal(page)).toHaveText('£9.99/mo');
  });

  test('Growth package preset shows £24.96/mo live total (Q1)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await openConfiguratorWithGrowth(page);
    await selectTemplate(page, /Sparkle Clean/i);

    const spineConfig = buildSpineConfig();
    await waitForUrlConfig(page, spineConfig);
    await assertPricingSidebarTotal(page, spineConfig);
    expect(spineConfig.featureIds.sort()).toEqual(
      applyPackage('growth').featureIds.sort(),
    );

    await page.getByRole('button', { name: /Step 2: Add Features/i }).click();
    await expect(page.locator('#feature-crm')).toHaveAttribute('aria-checked', 'true');
    await expect(page.locator('#feature-email-automation')).toHaveAttribute(
      'aria-checked',
      'true',
    );
    await expect(page.locator('#feature-analytics-seo')).toHaveAttribute(
      'aria-checked',
      'true',
    );
  });

  test('URL encodes config and refresh restores state', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await gotoConfigurator(page);

    await selectTemplate(page, /Sparkle Clean/i);
    await waitForUrlConfig(page, {
      templateId: SPINE_TEMPLATE_ID,
      featureIds: [],
      billingCycle: 'monthly',
    });

    await page.getByRole('button', { name: /Step 2: Add Features/i }).click();
    await page.locator('#feature-crm').click();

    const withCrm = {
      templateId: SPINE_TEMPLATE_ID,
      featureIds: ['crm'],
      billingCycle: 'monthly' as const,
    };
    await waitForUrlConfig(page, withCrm);

    const searchBeforeReload = new URL(page.url()).search;
    expect(searchBeforeReload).toContain('template=sparkle-clean');
    expect(searchBeforeReload).toContain('features=');

    await page.reload();
    await dismissCookieBanner(page);
    await expect(page.getByRole('heading', { name: 'Configure your website' })).toBeVisible();

    await expect(page.getByRole('radio', { name: /Sparkle Clean/i })).toHaveAttribute(
      'aria-checked',
      'true',
    );

    await page.getByRole('button', { name: /Step 2: Add Features/i }).click();
    await expect(page.locator('#feature-crm')).toHaveAttribute('aria-checked', 'true');
    await expect(sidebarMonthlyTotal(page)).toHaveText('£14.98/mo');
  });

  test.describe('375px mobile viewport', () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test('mobile pricing bar expands with line items', async ({ page }) => {
      await gotoConfigurator(
        page,
        `/?package=growth&template=${SPINE_TEMPLATE_ID}#configurator`,
      );

      const spineConfig = buildSpineConfig();
      const mobileBar = mobilePricingSummary(page);
      await expect(mobileBarMonthlyTotal(page)).toHaveText(formatMonthlyTotal(spineConfig));

      const toggle = mobileBar.locator('button[aria-controls="mobile-pricing-sheet"]');
      await expect(toggle).toHaveAttribute('aria-expanded', 'false');

      await toggle.click();
      await expect(toggle).toHaveAttribute('aria-expanded', 'true');
      await expect(page.locator('#mobile-pricing-sheet')).toBeVisible();
      await expect(
        page.locator('#mobile-pricing-sheet').getByText('CRM & Lead Management'),
      ).toBeVisible();

      await page
        .locator('#mobile-pricing-sheet')
        .getByRole('button', { name: 'Close', exact: true })
        .click();
      await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    });
  });

  test.describe('Q40 — no template selected', () => {
    test('disables Get Started on desktop sidebar', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await gotoConfigurator(page);

      const getStarted = desktopPricingSummary(page).getByRole('button', {
        name: 'Get Started',
      });
      await expect(getStarted).toBeDisabled();
    });

    test.describe('375px mobile viewport', () => {
      test.use({ viewport: { width: 375, height: 667 } });

      test('disables Get Started on mobile bar', async ({ page }) => {
        await gotoConfigurator(page);

        const getStarted = mobilePricingSummary(page).getByRole('button', {
          name: 'Get Started',
        });
        await expect(getStarted).toBeDisabled();
      });
    });

    test('enables Get Started after template is selected', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await gotoConfigurator(page);

      await selectTemplate(page, /Sparkle Clean/i);
      await waitForUrlConfig(page, {
        templateId: SPINE_TEMPLATE_ID,
        featureIds: [],
        billingCycle: 'monthly',
      });

      await expect(
        desktopPricingSummary(page).getByRole('link', { name: 'Get Started' }),
      ).toBeVisible();
    });

    test('invalid template param resets to defaults (Q40 partial restore)', async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await gotoConfigurator(page, '/?template=not-a-real-template#configurator');

      await expect(
        desktopPricingSummary(page).getByRole('button', { name: 'Get Started' }),
      ).toBeDisabled();
      await expect(
        page.getByText('Pick a template to preview your site theme.'),
      ).toBeVisible();
    });
  });
});
