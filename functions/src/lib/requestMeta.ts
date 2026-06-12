import { createHash } from 'node:crypto';
import type { Request } from 'express';

const USER_AGENT_MAX_LENGTH = 256;

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function hashIp(ip: string): string {
  return createHash('sha256').update(ip).digest('hex');
}

export function extractClientIp(rawRequest: Request | undefined): string {
  if (!rawRequest) {
    return 'unknown';
  }

  const forwarded = rawRequest.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0]?.trim() || 'unknown';
  }

  if (Array.isArray(forwarded) && forwarded[0]) {
    return forwarded[0].split(',')[0]?.trim() || 'unknown';
  }

  return rawRequest.ip ?? 'unknown';
}

export function truncateUserAgent(
  rawRequest: Request | undefined,
): string | undefined {
  const userAgent = rawRequest?.headers['user-agent'];
  if (typeof userAgent !== 'string' || userAgent.length === 0) {
    return undefined;
  }

  return userAgent.slice(0, USER_AGENT_MAX_LENGTH);
}
