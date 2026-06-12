'use client';

import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
  type QueryConstraint,
} from 'firebase/firestore';
import { useEffect, useMemo, useState } from 'react';

import { Badge, Button } from '@codedpixels/ui';
import type { FeatureId, Lead, LeadStatus } from '@codedpixels/shared-types';

import { FeatureUpgradeCta } from '@/components/dashboard/FeatureUpgradeCta';
import { LeadDetailDrawer } from '@/components/dashboard/leads/LeadDetailDrawer';
import { hasCrm } from '@/lib/features/has-feature';
import { getFirebaseFirestore } from '@/lib/firebase';
import {
  downloadLeadsCsv,
  filterLeads,
  sortLeadsNewestFirst,
} from '@/lib/leads/csv-export';
import { MOCK_LEADS } from '@/lib/leads/mock-leads';
import {
  formatLeadSubmittedAt,
  leadSourceLabel,
  nextLeadStatusFields,
  type LeadWithId,
} from '@/lib/leads/status';

interface LeadsInboxProps {
  companyId: string;
  siteId: string;
  featureIds: readonly FeatureId[];
  isMock: boolean;
}

const STATUS_OPTIONS: Array<{ value: LeadStatus | 'all'; label: string }> = [
  { value: 'all', label: 'All statuses' },
  { value: 'new', label: 'New' },
  { value: 'read', label: 'Read' },
  { value: 'archived', label: 'Archived' },
];

function statusBadgeVariant(
  status: LeadStatus,
): 'primary' | 'accent' | 'success' {
  if (status === 'new') {
    return 'accent';
  }
  if (status === 'read') {
    return 'primary';
  }
  return 'success';
}

export function LeadsInbox({
  companyId,
  siteId,
  featureIds,
  isMock,
}: LeadsInboxProps) {
  const crmEnabled = hasCrm(featureIds);
  const [leads, setLeads] = useState<LeadWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  useEffect(() => {
    if (!crmEnabled) {
      setLoading(false);
      return;
    }

    if (isMock) {
      setLeads(MOCK_LEADS);
      setLoading(false);
      return;
    }

    const db = getFirebaseFirestore();
    const constraints: QueryConstraint[] = [orderBy('submittedAt', 'desc')];

    if (statusFilter !== 'all') {
      constraints.unshift(where('status', '==', statusFilter));
    }

    const leadsQuery = query(
      collection(db, 'companies', companyId, 'sites', siteId, 'leads'),
      ...constraints,
    );

    const unsubscribe = onSnapshot(
      leadsQuery,
      (snapshot) => {
        const nextLeads = snapshot.docs.map((leadDoc) => ({
          id: leadDoc.id,
          ...(leadDoc.data() as Lead),
        }));
        setLeads(nextLeads);
        setLoading(false);
      },
      () => {
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [companyId, crmEnabled, isMock, siteId, statusFilter]);

  const filteredLeads = useMemo(() => {
    const sorted = sortLeadsNewestFirst(leads);
    return filterLeads(sorted, {
      status: isMock ? statusFilter : 'all',
      search,
    });
  }, [isMock, leads, search, statusFilter]);

  const selectedLead =
    filteredLeads.find((lead) => lead.id === selectedLeadId) ??
    leads.find((lead) => lead.id === selectedLeadId) ??
    null;

  async function handleStatusChange(
    leadId: string,
    currentStatus: LeadStatus,
    nextStatus: LeadStatus,
  ) {
    const patch = nextLeadStatusFields(currentStatus, nextStatus);
    if (!patch) {
      return;
    }

    if (isMock) {
      setLeads((current) =>
        current.map((lead) =>
          lead.id === leadId
            ? {
                ...lead,
                ...patch,
                readAt: patch.readAt?.toISOString() ?? lead.readAt,
                archivedAt: patch.archivedAt?.toISOString() ?? lead.archivedAt,
              }
            : lead,
        ),
      );
      return;
    }

    const db = getFirebaseFirestore();
    await updateDoc(
      doc(db, 'companies', companyId, 'sites', siteId, 'leads', leadId),
      patch,
    );
  }

  if (!crmEnabled) {
    return (
      <FeatureUpgradeCta
        featureId="crm"
        title="Unlock your leads inbox"
        description="Upgrade to CRM & Lead Management to view, filter, and export form submissions from your live site."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row">
          <label className="sr-only" htmlFor="lead-search">
            Search leads
          </label>
          <input
            id="lead-search"
            type="search"
            placeholder="Search name or email"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="builder-focus-ring min-h-11 flex-1 rounded-card border border-border bg-surface px-3 text-sm"
          />
          <label className="sr-only" htmlFor="lead-status-filter">
            Filter by status
          </label>
          <select
            id="lead-status-filter"
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as LeadStatus | 'all')
            }
            className="builder-focus-ring min-h-11 rounded-card border border-border bg-surface px-3 text-sm"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <Button
          variant="secondary"
          onClick={() => downloadLeadsCsv(filteredLeads)}
          disabled={filteredLeads.length === 0}
        >
          Export CSV
        </Button>
      </div>

      <div className="overflow-x-auto rounded-card border border-border bg-surface">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-border bg-background text-text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Phone</th>
              <th className="px-4 py-3 font-medium">Source</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-text-muted">
                  Loading leads…
                </td>
              </tr>
            ) : filteredLeads.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-text-muted">
                  No leads match your filters.
                </td>
              </tr>
            ) : (
              filteredLeads.map((lead) => (
                <tr
                  key={lead.id}
                  className="cursor-pointer border-b border-border last:border-b-0 hover:bg-background"
                  onClick={() => setSelectedLeadId(lead.id)}
                >
                  <td className="px-4 py-3 font-medium text-text">
                    {lead.contact.name ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-text-muted">
                    {lead.contact.email ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-text-muted">
                    {lead.contact.phone ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-text-muted">
                    {leadSourceLabel(lead)}
                  </td>
                  <td className="px-4 py-3 text-text-muted">
                    {formatLeadSubmittedAt(lead.submittedAt)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusBadgeVariant(lead.status)}>
                      {lead.status}
                    </Badge>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <LeadDetailDrawer
        lead={selectedLead}
        onClose={() => setSelectedLeadId(null)}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
