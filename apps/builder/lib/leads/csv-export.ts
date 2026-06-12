import type { LeadStatus } from '@codedpixels/shared-types';

import type { LeadWithId } from './status';
import { formatLeadSubmittedAt, leadSourceLabel } from './status';

export interface LeadFilterOptions {
  status?: LeadStatus | 'all';
  search?: string;
  sourcePage?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

function leadSubmittedDate(lead: LeadWithId): Date | null {
  const value = lead.submittedAt;
  if (value instanceof Date) {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  if (value && typeof value === 'object' && 'seconds' in value) {
    return new Date(value.seconds * 1000);
  }
  return null;
}

function escapeCsvValue(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function filterLeads(
  leads: LeadWithId[],
  options: LeadFilterOptions,
): LeadWithId[] {
  const search = options.search?.trim().toLowerCase() ?? '';

  return leads.filter((lead) => {
    if (options.status && options.status !== 'all' && lead.status !== options.status) {
      return false;
    }

    if (options.sourcePage && lead.source.pageSlug !== options.sourcePage) {
      return false;
    }

    if (search.length > 0) {
      const haystack = [
        lead.contact.name ?? '',
        lead.contact.email ?? '',
        lead.contact.phone ?? '',
      ]
        .join(' ')
        .toLowerCase();

      if (!haystack.includes(search)) {
        return false;
      }
    }

    const submitted = leadSubmittedDate(lead);
    if (submitted) {
      if (options.dateFrom && submitted < options.dateFrom) {
        return false;
      }
      if (options.dateTo && submitted > options.dateTo) {
        return false;
      }
    }

    return true;
  });
}

export function sortLeadsNewestFirst(leads: LeadWithId[]): LeadWithId[] {
  return [...leads].sort((a, b) => {
    const aDate = leadSubmittedDate(a)?.getTime() ?? 0;
    const bDate = leadSubmittedDate(b)?.getTime() ?? 0;
    return bDate - aDate;
  });
}

export function exportLeadsToCsv(leads: LeadWithId[]): string {
  const headers = [
    'id',
    'name',
    'email',
    'phone',
    'source',
    'formType',
    'status',
    'submittedAt',
    'message',
  ];

  const rows = leads.map((lead) =>
    [
      lead.id,
      lead.contact.name ?? '',
      lead.contact.email ?? '',
      lead.contact.phone ?? '',
      leadSourceLabel(lead),
      lead.source.formType,
      lead.status,
      formatLeadSubmittedAt(lead.submittedAt),
      String(lead.fields.message ?? ''),
    ].map(escapeCsvValue),
  );

  return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
}

export function downloadLeadsCsv(leads: LeadWithId[], filename = 'leads.csv'): void {
  const csv = exportLeadsToCsv(leads);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
