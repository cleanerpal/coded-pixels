import { describe, expect, it } from 'vitest';

import type { LeadWithId } from './status';
import { canTransitionLeadStatus, nextLeadStatusFields } from './status';
import { exportLeadsToCsv, filterLeads } from './csv-export';

const sampleLeads: LeadWithId[] = [
  {
    id: 'lead-1',
    status: 'new',
    source: {
      pageId: 'home',
      pageSlug: 'home',
      formSectionId: 'contact-1',
      formType: 'contact',
    },
    contact: {
      name: 'Jane Doe',
      email: 'jane@example.com',
      phone: '07700900123',
    },
    fields: {
      name: 'Jane Doe',
      email: 'jane@example.com',
      message: 'Interested in a quote',
    },
    submittedAt: '2026-06-12T09:00:00.000Z',
  },
  {
    id: 'lead-2',
    status: 'read',
    source: {
      pageId: 'contact',
      pageSlug: 'contact',
      formSectionId: 'contact-2',
      formType: 'booking',
    },
    contact: {
      name: 'John Smith',
      email: 'john@example.com',
    },
    fields: {
      name: 'John Smith',
      email: 'john@example.com',
      preferredDate: '2026-06-20',
    },
    submittedAt: '2026-06-11T14:30:00.000Z',
    readAt: '2026-06-11T15:00:00.000Z',
  },
];

describe('lead status transitions', () => {
  it('allows new → read', () => {
    expect(canTransitionLeadStatus('new', 'read')).toBe(true);
  });

  it('blocks archived → new', () => {
    expect(canTransitionLeadStatus('archived', 'new')).toBe(false);
  });

  it('returns readAt patch when marking new as read', () => {
    const now = new Date('2026-06-12T10:00:00.000Z');
    expect(nextLeadStatusFields('new', 'read', now)).toEqual({
      status: 'read',
      readAt: now,
    });
  });
});

describe('filterLeads', () => {
  it('filters by status', () => {
    expect(filterLeads(sampleLeads, { status: 'new' })).toHaveLength(1);
  });

  it('filters by search query on name and email', () => {
    expect(filterLeads(sampleLeads, { search: 'jane' })).toHaveLength(1);
    expect(filterLeads(sampleLeads, { search: 'john@example.com' })).toHaveLength(1);
  });

  it('filters by source page slug', () => {
    expect(filterLeads(sampleLeads, { sourcePage: 'contact' })).toHaveLength(1);
  });
});

describe('exportLeadsToCsv', () => {
  it('includes header row and escaped values', () => {
    const csv = exportLeadsToCsv(sampleLeads);
    expect(csv.split('\n')[0]).toBe(
      'id,name,email,phone,source,formType,status,submittedAt,message',
    );
    expect(csv).toContain('Jane Doe');
    expect(csv).toContain('jane@example.com');
  });

  it('returns header only for empty list', () => {
    const csv = exportLeadsToCsv([]);
    expect(csv).toBe(
      'id,name,email,phone,source,formType,status,submittedAt,message',
    );
  });
});
