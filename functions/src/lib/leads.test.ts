import { describe, expect, it } from 'vitest';

import {
  canTransitionLeadStatus,
  extractLeadContact,
  nextLeadStatusFields,
} from './leads';

describe('canTransitionLeadStatus', () => {
  it('allows new → read and new → archived', () => {
    expect(canTransitionLeadStatus('new', 'read')).toBe(true);
    expect(canTransitionLeadStatus('new', 'archived')).toBe(true);
  });

  it('allows read → archived only', () => {
    expect(canTransitionLeadStatus('read', 'archived')).toBe(true);
    expect(canTransitionLeadStatus('read', 'new')).toBe(false);
  });

  it('blocks transitions from archived', () => {
    expect(canTransitionLeadStatus('archived', 'new')).toBe(false);
    expect(canTransitionLeadStatus('archived', 'read')).toBe(false);
  });
});

describe('nextLeadStatusFields', () => {
  const now = new Date('2026-06-12T10:00:00.000Z');

  it('sets readAt when marking new as read', () => {
    expect(nextLeadStatusFields('new', 'read', now)).toEqual({
      status: 'read',
      readAt: now,
    });
  });

  it('sets archivedAt when archiving', () => {
    expect(nextLeadStatusFields('read', 'archived', now)).toEqual({
      status: 'archived',
      archivedAt: now,
    });
  });

  it('returns null for invalid transitions', () => {
    expect(nextLeadStatusFields('archived', 'new', now)).toBeNull();
  });
});

describe('extractLeadContact', () => {
  it('normalises name, email, and phone from fields map', () => {
    expect(
      extractLeadContact({
        name: '  Jane Doe ',
        email: 'jane@example.com',
        phone: '07700900123',
        message: 'Hello',
      }),
    ).toEqual({
      name: 'Jane Doe',
      email: 'jane@example.com',
      phone: '07700900123',
    });
  });
});
