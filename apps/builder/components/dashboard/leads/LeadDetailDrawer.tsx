'use client';

import { Badge, Button } from '@codedpixels/ui';
import type { LeadStatus } from '@codedpixels/shared-types';

import {
  canTransitionLeadStatus,
  formatLeadSubmittedAt,
  type LeadWithId,
} from '@/lib/leads/status';

interface LeadDetailDrawerProps {
  lead: LeadWithId | null;
  onClose: () => void;
  onStatusChange: (
    leadId: string,
    currentStatus: LeadStatus,
    nextStatus: LeadStatus,
  ) => void;
}

export function LeadDetailDrawer({
  lead,
  onClose,
  onStatusChange,
}: LeadDetailDrawerProps) {
  if (!lead) {
    return null;
  }

  const nextActions: Array<{ label: string; status: LeadStatus }> = [];

  if (canTransitionLeadStatus(lead.status, 'read')) {
    nextActions.push({ label: 'Mark as read', status: 'read' });
  }
  if (canTransitionLeadStatus(lead.status, 'archived')) {
    nextActions.push({ label: 'Archive', status: 'archived' });
  }

  return (
    <>
      <button
        type="button"
        aria-label="Close lead details"
        className="fixed inset-0 z-40 bg-dark/40"
        onClick={onClose}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="lead-detail-title"
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-border bg-surface shadow-hover"
      >
        <div className="flex items-start justify-between border-b border-border px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
              Lead detail
            </p>
            <h2 id="lead-detail-title" className="mt-1 text-lg font-bold text-text">
              {lead.contact.name ?? 'Unnamed lead'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="builder-focus-ring rounded-card px-2 py-1 text-sm text-text-muted hover:bg-background"
          >
            Close
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-5 py-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="accent">{lead.source.formType}</Badge>
            <Badge>{lead.status}</Badge>
          </div>

          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-text-muted">Email</dt>
              <dd className="font-medium text-text">{lead.contact.email ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-text-muted">Phone</dt>
              <dd className="font-medium text-text">{lead.contact.phone ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-text-muted">Source page</dt>
              <dd className="font-medium text-text">{lead.source.pageSlug}</dd>
            </div>
            <div>
              <dt className="text-text-muted">Submitted</dt>
              <dd className="font-medium text-text">
                {formatLeadSubmittedAt(lead.submittedAt)}
              </dd>
            </div>
          </dl>

          <div>
            <h3 className="text-sm font-semibold text-text">Full submission</h3>
            <pre className="mt-2 overflow-x-auto rounded-card bg-background p-3 text-xs text-text">
              {JSON.stringify(lead.fields, null, 2)}
            </pre>
          </div>
        </div>

        {nextActions.length > 0 ? (
          <div className="flex flex-wrap gap-2 border-t border-border px-5 py-4">
            {nextActions.map((action) => (
              <Button
                key={action.status}
                variant="secondary"
                onClick={() =>
                  onStatusChange(lead.id, lead.status, action.status)
                }
              >
                {action.label}
              </Button>
            ))}
          </div>
        ) : null}
      </aside>
    </>
  );
}
