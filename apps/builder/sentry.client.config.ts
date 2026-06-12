import * as Sentry from "@sentry/nextjs";

import { getSharedSentryOptions } from "./lib/sentry/shared-options";

Sentry.init({
  ...getSharedSentryOptions(process.env.NEXT_PUBLIC_SENTRY_DSN),
});
