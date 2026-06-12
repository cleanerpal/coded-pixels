#!/usr/bin/env node
/**
 * B1-001 — seed templates to Firestore (template-seeding-ci-spec §5.2, §6.3)
 * Aligned with Dr. Rafael Ortiz on firestore-schema §5.2 · Dr. Daniel Moreau on CI scripts
 *
 * Usage:
 *   node scripts/seed.mjs --emulator   (FIRESTORE_EMULATOR_HOST required)
 *   node scripts/seed.mjs              (production/staging — GOOGLE_APPLICATION_CREDENTIALS)
 */
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { computeContentHash } from './lib/hash.mjs';
import { loadAllSeeds, loadManifest } from './lib/load-seeds.mjs';

const useEmulator = process.argv.includes('--emulator');
const projectId =
  process.env.FIREBASE_PROJECT_ID ??
  process.env.GCLOUD_PROJECT ??
  process.env.GOOGLE_CLOUD_PROJECT ??
  'demo-codedpixels';

function initAdmin() {
  if (getApps().length > 0) {
    return getFirestore();
  }

  if (useEmulator) {
    process.env.FIRESTORE_EMULATOR_HOST ??= '127.0.0.1:8080';
    initializeApp({ projectId });
  } else {
    initializeApp({ projectId });
  }

  return getFirestore();
}

/**
 * @param {import('./lib/schemas.mjs').TemplateSeed} seed
 * @param {number} seedVersion
 */
function assembleFirestoreDoc(seed, seedVersion) {
  return {
    name: seed.metadata.name,
    category: seed.metadata.category,
    description: seed.metadata.description,
    sortOrder: seed.metadata.sortOrder,
    isCustomTemplate: seed.metadata.isCustomTemplate,
    defaultPage: {
      title: seed.defaultPage.title,
      slug: seed.defaultPage.slug,
      seo: seed.defaultPage.seo,
      sections: seed.defaultSections,
    },
    seedVersion,
    contentHash: computeContentHash(seed),
  };
}

async function main() {
  const manifest = loadManifest();
  const seeds = loadAllSeeds();
  const db = initAdmin();

  let upserted = 0;
  let skipped = 0;

  for (const seed of seeds) {
    const ref = db.collection('templates').doc(seed.templateId);
    const payload = assembleFirestoreDoc(seed, manifest.seedVersion);
    const existing = await ref.get();

    if (existing.exists && existing.get('contentHash') === payload.contentHash) {
      console.log(`skip ${seed.templateId} — unchanged`);
      skipped += 1;
      continue;
    }

    await ref.set(
      {
        ...payload,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: false },
    );
    console.log(`upserted ${seed.templateId} seedVersion=${manifest.seedVersion}`);
    upserted += 1;
  }

  console.log(
    `seed:templates${useEmulator ? ':emulator' : ''} — done (upserted ${upserted}, skipped ${skipped})`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
