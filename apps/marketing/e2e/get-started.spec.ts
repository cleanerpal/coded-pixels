import { expect, test, type Page } from '@playwright/test';

import { buildConfigHref } from '../lib/config-url-sync';
import { formatAddonSummary, getTemplateDisplayName } from '../lib/config-snapshot';
import { getLineItems } from '../lib/pricing';
import type { ConfigState } from '@codedpixels/shared-types';

import {
  dismissCookieBanner,
  formatMonthlyTotal,
  formatPence,
  gotoApp,
  mockMarketingCallables,
} from './helpers';

/** Shared URL config — same contract as configurator deep links (ENG-006). */
const sharedConfig: ConfigState = {
  templateId: 'sparkle-clean',
  featureIds: ['crm', 'email-automation'],
  billingCycle: 'monthly',
};

const getStartedPath = buildConfigHref('/get-started', sharedConfig);

async function openGetStarted(page: Page): Promise<void> {
  await gotoApp(page, getStartedPath);
  await expect(page.getByRole('heading', { name: 'Order summary' })).toBeVisible();
}

test.describe('Get started — QA-002', () => {
  test('order summary reflects shared URL config', async ({ page }) => {
    await openGetStarted(page);

    await expect(
      page.getByRole('status').filter({ hasText: 'No payment taken' }),
    ).toBeVisible();

    for (const item of getLineItems(sharedConfig)) {
      await expect(page.getByText(item.label)).toBeVisible();
      await expect(page.getByText(`${formatPence(item.amountPence)}/mo`)).toBeVisible();
    }

    await expect(page.getByText('Monthly total')).toBeVisible();
    await expect(page.getByText(formatMonthlyTotal(sharedConfig)).first()).toBeVisible();
  });

  test('simulation banner stays visible before submit', async ({ page }) => {
    await openGetStarted(page);

    const banner = page.getByRole('status').filter({ hasText: 'No payment taken' });
    await expect(banner).toBeVisible();
    await expect(banner).toContainText('sign-up preview');

    await page.getByLabel('Email address').fill('preview@example.com');
    await expect(banner).toBeVisible();
  });

  test('empty email is blocked before signup', async ({ page }) => {
    await openGetStarted(page);

    await page.getByLabel(/I agree to CodedPixels/i).check();
    await page.getByRole('button', { name: 'Save my plan' }).click();

    const emailInput = page.getByLabel('Email address');
    await expect(emailInput).toHaveJSProperty('validity.valid', false);
    await expect(page.getByRole('heading', { name: 'Order summary' })).toBeVisible();
  });

  test('email submit shows success summary', async ({ page }) => {
    await mockMarketingCallables(page);
    await openGetStarted(page);

    await page.getByLabel('Email address').fill('signup@example.com');
    await page.getByLabel(/I agree to CodedPixels/i).check();
    await page.getByRole('button', { name: 'Save my plan' }).click();

    await expect(
      page.getByRole('heading', { name: /You're in! We've saved your plan\./i }),
    ).toBeVisible();
    await expect(page.getByText("We'll be in touch soon.")).toBeVisible();

    await expect(page.getByText(getTemplateDisplayName(sharedConfig.templateId!))).toBeVisible();
    await expect(page.getByText(formatAddonSummary(sharedConfig.featureIds))).toBeVisible();
    await expect(page.getByText('Monthly')).toBeVisible();
    await expect(page.getByText(formatMonthlyTotal(sharedConfig))).toBeVisible();

    await expect(
      page.getByRole('button', { name: 'Start building my site now' }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Copy configuration link' }),
    ).toBeVisible();
    await expect(page.getByRole('link', { name: 'Back to home' })).toBeVisible();
  });
});
