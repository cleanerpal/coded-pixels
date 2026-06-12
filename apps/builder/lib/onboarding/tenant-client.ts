import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  type Firestore,
} from 'firebase/firestore';

import type { Company, Site } from '@codedpixels/shared-types';

export interface TenantContext {
  company: Company;
  siteId: string;
  site: Site;
}

export async function fetchTenantContext(
  db: Firestore,
  companyId: string,
  preferredSiteId?: string,
): Promise<TenantContext | null> {
  const companySnap = await getDoc(doc(db, 'companies', companyId));
  if (!companySnap.exists()) {
    return null;
  }

  const company = companySnap.data() as Company;

  if (preferredSiteId) {
    const siteSnap = await getDoc(
      doc(db, 'companies', companyId, 'sites', preferredSiteId),
    );
    if (siteSnap.exists()) {
      return {
        company,
        siteId: preferredSiteId,
        site: siteSnap.data() as Site,
      };
    }
  }

  const sitesSnap = await getDocs(
    query(collection(db, 'companies', companyId, 'sites'), limit(1)),
  );

  const firstSite = sitesSnap.docs[0];
  if (!firstSite) {
    return null;
  }

  return {
    company,
    siteId: firstSite.id,
    site: firstSite.data() as Site,
  };
}
