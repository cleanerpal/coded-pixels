import { expect, test, type Page } from '@playwright/test';

import { buildPreviewUrl } from '../lib/template-preview-urls';
import { CUSTOM_TEMPLATE_CARD, TEMPLATES } from '../lib/templates';
import {
  gotoApp,
  selectTemplate,
  SPINE_TEMPLATE_ID,
  waitForUrlConfig,
} from './helpers';

/**
 * QA-007 · Template preview + starter selection
 * Aligned with Dr. Sophia Moreau on marketing-template-preview-spec §9.
 */

function desktopPricingSummary(page: Page) {
  return page.getByRole('complementary', { name: 'Pricing summary' });
}

async function gotoConfigurator(page: Page, path = '/#configurator') {
  await gotoApp(page, path);
  await expect(
    page.getByRole('heading', { name: 'Configure your website' }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Choose your starter website' }),
  ).toBeVisible();
}

function assertHrefContainsTemplateId(href: string, templateId: string): void {
  expect(href).toContain(templateId);
  expect(href).toMatch(/localhost:3002|codedpixels\.co\.uk/);
}

test.describe('Template preview — QA-007', () => {
  test('homepage Step 1: category filter → select starter → preview link href', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await gotoConfigurator(page);

    await page.getByRole('radio', { name: 'Cleaning & Trades' }).click();
    await expect(page.getByText('Showing 2 starter designs')).toBeVisible();

    await selectTemplate(page, /Sparkle Clean/i);
    await waitForUrlConfig(page, {
      templateId: SPINE_TEMPLATE_ID,
      featureIds: [],
      billingCycle: 'monthly',
    });

    const previewLink = page
      .getByRole('group', { name: 'Cleaning & Trades' })
      .getByRole('link', { name: /Preview Sparkle Clean template in new tab/i });
    await expect(previewLink).toBeVisible();
    await expect(previewLink).toHaveAttribute('target', '_blank');
    await expect(previewLink).toHaveAttribute('rel', 'noopener noreferrer');

    const href = await previewLink.getAttribute('href');
    expect(href).toBeTruthy();
    assertHrefContainsTemplateId(href!, SPINE_TEMPLATE_ID);
    expect(href).toBe(buildPreviewUrl(SPINE_TEMPLATE_ID));
  });

  test('/templates: preview links on library cards; bespoke custom has none', async ({
    page,
  }) => {
    await gotoApp(page, '/templates');
    await expect(
      page.getByRole('heading', { name: 'Starter designs for your business' }),
    ).toBeVisible();

    for (const template of TEMPLATES) {
      const previewLink = page.getByRole('link', {
        name: `Preview ${template.name} template in new tab`,
      });
      await expect(previewLink).toBeVisible();

      const href = await previewLink.getAttribute('href');
      expect(href).toBeTruthy();
      assertHrefContainsTemplateId(href!, template.id);
      expect(href).toBe(buildPreviewUrl(template.id));
    }

    const customCard = page
      .getByRole('article')
      .filter({ hasText: CUSTOM_TEMPLATE_CARD.name });
    await expect(customCard).toBeVisible();
    await expect(
      customCard.getByRole('link', { name: /Preview .* template in new tab/i }),
    ).toHaveCount(0);
    await expect(
      customCard.getByRole('link', { name: 'Start with this design' }),
    ).toBeVisible();

    await page.getByRole('button', { name: 'Bespoke', pressed: false }).click();
    await expect(page.getByText('Showing 1 template')).toBeVisible();
    await expect(
      page.getByRole('link', { name: /Preview .* template in new tab/i }),
    ).toHaveCount(0);
  });

  test('get-started regression: CTA disabled until starter selected', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await gotoConfigurator(page);

    const getStarted = desktopPricingSummary(page).getByRole('button', {
      name: 'Get Started',
    });
    await expect(getStarted).toBeDisabled();

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

  test('get-started regression: ?template= preserved after category filter change', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await gotoConfigurator(page);

    await page.getByRole('radio', { name: 'Cleaning & Trades' }).click();
    await selectTemplate(page, /Sparkle Clean/i);
    await waitForUrlConfig(page, {
      templateId: SPINE_TEMPLATE_ID,
      featureIds: [],
      billingCycle: 'monthly',
    });

    await page.getByRole('radio', { name: 'Beauty & Wellness' }).click();
    await expect(page.getByText('Showing 2 starter designs')).toBeVisible();

    const search = new URL(page.url()).search;
    expect(search).toContain(`template=${SPINE_TEMPLATE_ID}`);

    await expect(
      desktopPricingSummary(page).getByRole('link', { name: 'Get Started' }),
    ).toBeVisible();
  });
});

test.describe('@template-preview-smoke', () => {
  test('sparkle-clean demo tenant returns 200 with hero headline', async ({
    request,
  }) => {
    test.skip(
      !process.env.FIRESTORE_EMULATOR_HOST,
      'Requires FIRESTORE_EMULATOR_HOST, seed:template-demos:emulator, and site-renderer on :3002',
    );

    const response = await request.get('http://sparkle-clean.localhost:3002/');
    expect(response.status()).toBe(200);

    const body = await response.text();
    expect(body).toContain('Spotless homes, every visit');
  });
});
