import type { ErrorEvent } from "@sentry/nextjs";
import { describe, expect, it } from "vitest";

import { scrubPiiFromSentryEvent } from "./pii-scrubber";

const TEST_EMAIL = "waitlist.user@codedpixels.co.uk";

function scrub(partial: Record<string, unknown>): ErrorEvent | null {
  return scrubPiiFromSentryEvent(partial as unknown as ErrorEvent);
}

function serialized(event: ErrorEvent | null): string {
  return JSON.stringify(event);
}

describe("scrubPiiFromSentryEvent", () => {
  it("redacts email addresses from signup test error messages", () => {
    const event = scrub({
      message: `Signup failed for ${TEST_EMAIL}`,
      exception: {
        values: [
          {
            type: "Error",
            value: `Unable to submit signup for ${TEST_EMAIL}`,
          },
        ],
      },
    });

    expect(event?.message).toBe("Signup failed for [Filtered]");
    expect(event?.exception?.values?.[0]?.value).toBe(
      "Unable to submit signup for [Filtered]",
    );
    expect(serialized(event)).not.toContain(TEST_EMAIL);
  });

  it("denylists email fields from request and extra payloads", () => {
    const event = scrub({
      request: {
        data: {
          email: TEST_EMAIL,
          consent: true,
        },
      },
      extra: {
        userEmail: TEST_EMAIL,
        route: "/get-started",
      },
    });

    expect(event?.request?.data).toEqual({
      email: "[Filtered]",
      consent: true,
    });
    expect(event?.extra).toEqual({
      userEmail: "[Filtered]",
      route: "/get-started",
    });
    expect(serialized(event)).not.toContain(TEST_EMAIL);
  });

  it("denylists config snapshot payloads from error context", () => {
    const event = scrub({
      extra: {
        config: {
          templateId: "growth-pro",
          featureIds: ["crm", "sms"],
        },
        configSnapshot: {
          billingCycle: "monthly",
        },
      },
    });

    expect(event?.extra).toEqual({
      config: "[Filtered]",
      configSnapshot: "[Filtered]",
    });
  });

  it("scrubs email from breadcrumbs without removing non-PII fields", () => {
    const event = scrub({
      breadcrumbs: [
        {
          message: `Submitted waitlist for ${TEST_EMAIL}`,
          data: {
            email: TEST_EMAIL,
            source: "site-import",
          },
        },
      ],
    });

    expect(event?.breadcrumbs?.[0]?.message).toBe(
      "Submitted waitlist for [Filtered]",
    );
    expect(event?.breadcrumbs?.[0]?.data).toEqual({
      email: "[Filtered]",
      source: "site-import",
    });
    expect(serialized(event)).not.toContain(TEST_EMAIL);
  });
});
