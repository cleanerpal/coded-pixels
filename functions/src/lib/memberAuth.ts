import type { MemberRole } from '@codedpixels/shared-types';
import { HttpsError } from 'firebase-functions/v2/https';
import { db } from './admin';

const EDITOR_PLUS_ROLES: MemberRole[] = ['owner', 'admin', 'editor'];

export async function resolveCompanyId(
  uid: string,
  token: Record<string, unknown>,
): Promise<string> {
  const claimCompanyId = token.companyId;
  if (typeof claimCompanyId === 'string' && claimCompanyId.length > 0) {
    return claimCompanyId;
  }

  const userDoc = await db.collection('users').doc(uid).get();
  if (!userDoc.exists) {
    throw new HttpsError('permission-denied', 'User profile not found');
  }

  const defaultCompanyId = userDoc.data()?.defaultCompanyId;
  if (typeof defaultCompanyId !== 'string' || defaultCompanyId.length === 0) {
    throw new HttpsError('permission-denied', 'No company associated with user');
  }

  return defaultCompanyId;
}

export async function assertEditorPlusMember(
  uid: string,
  companyId: string,
): Promise<MemberRole> {
  const memberDoc = await db
    .collection('companies')
    .doc(companyId)
    .collection('members')
    .doc(uid)
    .get();

  if (!memberDoc.exists) {
    throw new HttpsError('permission-denied', 'Not a member of this company');
  }

  const role = memberDoc.data()?.role as MemberRole | undefined;
  if (!role || !EDITOR_PLUS_ROLES.includes(role)) {
    throw new HttpsError(
      'permission-denied',
      'Editor role or above required to publish',
    );
  }

  return role;
}
