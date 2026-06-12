import type { LeadContact, LeadStatus } from '@codedpixels/shared-types';

/** Valid lead status transitions for CRM inbox (Q50). */
const STATUS_TRANSITIONS: Record<LeadStatus, LeadStatus[]> = {
  new: ['read', 'archived'],
  read: ['archived'],
  archived: [],
};

export function canTransitionLeadStatus(
  from: LeadStatus,
  to: LeadStatus,
): boolean {
  if (from === to) {
    return true;
  }
  return STATUS_TRANSITIONS[from].includes(to);
}

export function nextLeadStatusFields(
  from: LeadStatus,
  to: LeadStatus,
  now: Date = new Date(),
): { status: LeadStatus; readAt?: Date; archivedAt?: Date } | null {
  if (!canTransitionLeadStatus(from, to)) {
    return null;
  }

  if (from === to) {
    return { status: to };
  }

  const patch: { status: LeadStatus; readAt?: Date; archivedAt?: Date } = {
    status: to,
  };

  if (to === 'read' && from === 'new') {
    patch.readAt = now;
  }

  if (to === 'archived') {
    patch.archivedAt = now;
  }

  return patch;
}

export function extractLeadContact(
  fields: Record<string, string | number | boolean>,
): LeadContact {
  const readString = (key: string): string | undefined => {
    const value = fields[key];
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }
    return undefined;
  };

  return {
    name: readString('name'),
    email: readString('email'),
    phone: readString('phone'),
  };
}
