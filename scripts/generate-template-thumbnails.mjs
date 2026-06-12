#!/usr/bin/env node
/**
 * INF-006 — Playwright WebP thumbnails from platform demo tenant homepages.
 * Aligned with Dr. Daniel Moreau on CI thumbnail job · Dr. Marcus Chen on renderer-only captures.
 *
 * Prerequisites (marketing-template-preview-spec §7):
 *   1. Firestore emulator + seed:templates:emulator + seed:template-demos:emulator
 *   2. Site-renderer on :3002 (FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 npm run dev:renderer)
 *
 * Usage:
 *   npm run generate:template-thumbnails
 *
 * Env:
 *   TEMPLATE_PREVIEW_BASE_URL — optional URL template with `{templateId}` placeholder
 *                             (default: http://{templateId}.localhost:3002/)
 *   TEMPLATE_THUMBNAIL_VIEWPORT_WIDTH — default 1280
 *   TEMPLATE_THUMBNAIL_VIEWPORT_HEIGHT — default 800
 *   TEMPLATE_THUMBNAIL_TIMEOUT_MS — navigation timeout (default 60000)
 */
import { mkdir, unlink } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from 'playwright';
import sharp from 'sharp';
/** @codedpixels/shared-types — direct dist import (barrel lacks .js extensions for Node ESM) */
import { RESERVED_TEMPLATE_SLUGS } from '../packages/shared-types/dist/constants/reserved-template-slugs.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUTPUT_DIR = join(ROOT, 'apps/marketing/public/templates/previews');

const DEFAULT_BASE_URL_TEMPLATE = 'http://{templateId}.localhost:3002/';
const VIEWPORT_WIDTH = Number(process.env.TEMPLATE_THUMBNAIL_VIEWPORT_WIDTH ?? 1280);
const VIEWPORT_HEIGHT = Number(process.env.TEMPLATE_THUMBNAIL_VIEWPORT_HEIGHT ?? 800);
const TIMEOUT_MS = Number(process.env.TEMPLATE_THUMBNAIL_TIMEOUT_MS ?? 60_000);

/**
 * @param {string} templateId
 */
export function buildTemplatePreviewUrl(templateId) {
  const template =
    process.env.TEMPLATE_PREVIEW_BASE_URL ?? DEFAULT_BASE_URL_TEMPLATE;

  if (!template.includes('{templateId}')) {
    throw new Error(
      'TEMPLATE_PREVIEW_BASE_URL must include `{templateId}` placeholder',
    );
  }

  return template.replaceAll('{templateId}', templateId);
}

/**
 * Atomic WebP write — temp file then rename (spec §4.5).
 * @param {import('playwright').Page} page
 * @param {string} templateId
 */
export async function captureTemplateThumbnail(page, templateId) {
  await mkdir(OUTPUT_DIR, { recursive: true });

  const finalPath = join(OUTPUT_DIR, `${templateId}.webp`);
  const tempPath = join(OUTPUT_DIR, `.${templateId}.png.tmp`);

  try {
    await page.screenshot({
      path: tempPath,
      type: 'png',
      fullPage: false,
    });
    await sharp(tempPath).webp({ quality: 85 }).toFile(finalPath);
    await unlink(tempPath);
  } catch (error) {
    await unlink(tempPath).catch(() => {});
    throw error;
  }
}

/**
 * @param {import('playwright').Browser} browser
 * @param {string} templateId
 */
async function screenshotTemplate(browser, templateId) {
  const url = buildTemplatePreviewUrl(templateId);
  const page = await browser.newPage({
    viewport: { width: VIEWPORT_WIDTH, height: VIEWPORT_HEIGHT },
  });

  try {
    const response = await page.goto(url, {
      waitUntil: 'load',
      timeout: TIMEOUT_MS,
    });

    if (!response || !response.ok()) {
      throw new Error(
        `HTTP ${response?.status() ?? 'no response'} for ${url}`,
      );
    }

    await page.waitForSelector('body', { timeout: TIMEOUT_MS });
    await captureTemplateThumbnail(page, templateId);
    console.log(`thumbnail ${templateId} → ${finalRelativePath(templateId)}`);
  } finally {
    await page.close();
  }
}

/**
 * @param {string} templateId
 */
function finalRelativePath(templateId) {
  return `apps/marketing/public/templates/previews/${templateId}.webp`;
}

async function assertPreviewStackReady() {
  const probeUrl = buildTemplatePreviewUrl('sparkle-clean');

  let response;
  try {
    response = await fetch(probeUrl, { signal: AbortSignal.timeout(10_000) });
  } catch {
    throw new Error(
      `Cannot reach site-renderer at ${probeUrl}. Run npm run dev:preview (or start apps/site-renderer with FIRESTORE_EMULATOR_HOST=127.0.0.1:8080).`,
    );
  }

  if (response.status === 404) {
    throw new Error(
      'Demo tenants missing in Firestore (HTTP 404). With emulators running: FIREBASE_PROJECT_ID=codedpixels npm run seed:templates:emulator && npm run seed:template-demos:emulator',
    );
  }

  if (!response.ok) {
    throw new Error(
      `Preview stack not ready (HTTP ${response.status} for ${probeUrl}). Restart site-renderer after seeding, then retry.`,
    );
  }
}

async function main() {
  console.log('INF-006 generate:template-thumbnails');
  console.log(`  output: ${OUTPUT_DIR}`);
  console.log(
    `  base URL: ${process.env.TEMPLATE_PREVIEW_BASE_URL ?? DEFAULT_BASE_URL_TEMPLATE}`,
  );
  console.log(`  templates: ${RESERVED_TEMPLATE_SLUGS.length} library IDs`);

  await assertPreviewStackReady();

  await mkdir(OUTPUT_DIR, { recursive: true });

  const failed = [];
  const browser = await chromium.launch({ headless: true });

  try {
    for (const templateId of RESERVED_TEMPLATE_SLUGS) {
      try {
        await screenshotTemplate(browser, templateId);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : String(error);
        console.error(`FAIL ${templateId}: ${message}`);
        failed.push(templateId);
      }
    }
  } finally {
    await browser.close();
  }

  if (failed.length > 0) {
    console.error(
      `generate:template-thumbnails — failed (${failed.length}/${RESERVED_TEMPLATE_SLUGS.length}): ${failed.join(', ')}`,
    );
    process.exit(1);
  }

  console.log(
    `generate:template-thumbnails — done (${RESERVED_TEMPLATE_SLUGS.length} WebP)`,
  );
}

const isMainModule =
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMainModule) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
