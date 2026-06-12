/** Provisional tenant slug before onboarding wizard step 2 (Q36). */
export function buildProvisionalSlug(signupId: string): string {
  const suffix = signupId.replace(/[^a-z0-9]/gi, '').slice(0, 8).toLowerCase();
  return `tenant-${suffix || 'new'}`;
}

export function businessNameFromEmail(email: string): string {
  const local = email.split('@')[0] ?? 'business';
  const cleaned = local.replace(/[._+-]+/g, ' ').trim();
  if (!cleaned) {
    return 'My Business';
  }

  return cleaned
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
