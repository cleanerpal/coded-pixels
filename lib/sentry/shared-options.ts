import type { BrowserOptions, EdgeOptions, NodeOptions } from "@sentry/nextjs";

import { scrubPiiFromSentryEvent } from "./pii-scrubber";

type SharedSentryOptions = Pick<
  BrowserOptions & NodeOptions & EdgeOptions,
  "beforeSend" | "dsn" | "enabled" | "environment" | "sendDefaultPii" | "tracesSampleRate"
>;

export function getSharedSentryOptions(dsn: string | undefined): SharedSentryOptions {
  return {
    dsn,
    enabled: Boolean(dsn),
    environment: process.env.SENTRY_ENVIRONMENT ?? process.env.NODE_ENV,
    sendDefaultPii: false,
    tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,
    beforeSend: scrubPiiFromSentryEvent,
  };
}
