import { onObjectFinalized } from 'firebase-functions/v2/storage';
import { handleAssetObjectFinalized } from '../lib/handleAssetScan';

/** ClamAV scan + thumb sync on asset uploads — Q64 (B7-001) */
export const onAssetObjectFinalized = onObjectFinalized(
  {
    region: 'europe-west2',
    memory: '512MiB',
  },
  handleAssetObjectFinalized,
);
