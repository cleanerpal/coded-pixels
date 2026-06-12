import type { Lead, LeadStatus } from '@codedpixels/shared-types';

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

export interface LeadWithId extends Lead {
  id: string;
}

export function formatLeadSubmittedAt(value: Lead['submittedAt']): string {
  if (value instanceof Date) {
    return value.toLocaleString('en-GB');
  }
  if (typeof value === 'string') {
    return new Date(value).toLocaleString('en-GB');
  }
  if (value && typeof value === 'object' && 'seconds' in value) {
    return new Date(value.seconds * 1000).toLocaleString('en-GB');
  }
  return '—';
}

export function leadSourceLabel(lead: Lead): string {
  return lead.source.pageSlug || lead.source.formType;
}
