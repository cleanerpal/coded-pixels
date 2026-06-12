import type { LeadWithId } from '@/lib/leads/status';

export const MOCK_LEADS: LeadWithId[] = [
  {
    id: 'mock-lead-1',
    status: 'new',
    source: {
      pageId: 'home',
      pageSlug: 'home',
      formSectionId: 'section-contact',
      formType: 'contact',
    },
    contact: {
      name: 'Sarah Mitchell',
      email: 'sarah@example.com',
      phone: '07700900456',
    },
    fields: {
      name: 'Sarah Mitchell',
      email: 'sarah@example.com',
      phone: '07700900456',
      message: 'I would like a quote for weekly cleaning.',
    },
    submittedAt: '2026-06-12T08:15:00.000Z',
  },
  {
    id: 'mock-lead-2',
    status: 'read',
    source: {
      pageId: 'services',
      pageSlug: 'services',
      formSectionId: 'section-booking',
      formType: 'booking',
    },
    contact: {
      name: 'Tom Hughes',
      email: 'tom@example.com',
      phone: '07700900789',
    },
    fields: {
      name: 'Tom Hughes',
      email: 'tom@example.com',
      phone: '07700900789',
      preferredDate: '2026-06-18',
      preferredTime: '10:00',
      notes: 'Deep clean before event',
    },
    submittedAt: '2026-06-10T16:40:00.000Z',
    readAt: '2026-06-10T17:05:00.000Z',
  },
  {
    id: 'mock-lead-3',
    status: 'archived',
    source: {
      pageId: 'contact',
      pageSlug: 'contact',
      formSectionId: 'section-contact-footer',
      formType: 'contact',
    },
    contact: {
      name: 'Priya Khan',
      email: 'priya@example.com',
    },
    fields: {
      name: 'Priya Khan',
      email: 'priya@example.com',
      message: 'General enquiry — resolved.',
    },
    submittedAt: '2026-05-28T11:20:00.000Z',
    readAt: '2026-05-28T12:00:00.000Z',
    archivedAt: '2026-06-01T09:00:00.000Z',
  },
];
