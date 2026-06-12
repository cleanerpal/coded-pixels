import type { Metadata } from "next";
import Link from "next/link";

import {
  LegalPageShell,
  LegalSection,
  LegalTable,
} from "@/components/legal/LegalPageShell";
import { LEGAL_PLACEHOLDERS } from "@/components/legal/legal-placeholders";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How CodedPixels collects, uses, and protects your personal data.",
};

const LAST_UPDATED = "12 June 2026";

export default function PrivacyPage() {
  return (
    <LegalPageShell title="Privacy Policy" lastUpdated={LAST_UPDATED}>
      <LegalSection id="who-we-are" title="Who we are">
        <p>
          {LEGAL_PLACEHOLDERS.companyLegalName} ({LEGAL_PLACEHOLDERS.registeredAddress})
          runs CodedPixels — a website builder for UK small businesses. We help
          you design a website plan and, when our full platform launches, build
          and host your site.
        </p>
      </LegalSection>

      <LegalSection id="what-we-collect" title="What data we collect">
        <p>On our marketing site today, we may collect:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="font-medium text-text">Email address</strong> —
            when you join the Site Import waitlist or complete Get Started
          </li>
          <li>
            <strong className="font-medium text-text">Configurator choices</strong>{" "}
            — template, features, package, and price totals you select
          </li>
          <li>
            <strong className="font-medium text-text">Consent records</strong> —
            when you tick form consent or accept or reject analytics cookies
          </li>
          <li>
            <strong className="font-medium text-text">Technical data</strong> —
            optional hashed IP address or truncated user agent to prevent abuse
            on public forms
          </li>
        </ul>
        <p>
          We do <strong className="font-medium text-text">not</strong> collect
          passwords or payment card details in MVP sign-up. Checkout is
          simulated — no payment is taken.
        </p>
      </LegalSection>

      <LegalSection id="why-we-use-it" title="Why we use it">
        <ul className="list-disc space-y-2 pl-5">
          <li>Respond to your interest and follow up on your plan</li>
          <li>Save and restore your configurator choices</li>
          <li>Improve our product and understand how the site is used</li>
          <li>Prevent abuse and keep the service secure</li>
          <li>Meet legal and regulatory obligations</li>
        </ul>
      </LegalSection>

      <LegalSection id="legal-bases" title="Legal bases (UK GDPR)">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="font-medium text-text">
              Contract / steps at your request
            </strong>{" "}
            — processing needed when you sign up or ask us to save your plan
          </li>
          <li>
            <strong className="font-medium text-text">Consent</strong> — analytics
            cookies (only after you click Accept) and marketing emails when you
            opt in
          </li>
          <li>
            <strong className="font-medium text-text">Legitimate interest</strong>{" "}
            — security, fraud prevention, and aggregated analytics where
            applicable. Analytics cookies remain consent-gated.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="cookies" title="Cookies">
        <p>
          We use essential cookies and local storage so the site works, including
          remembering your cookie choice. With your permission, we also use
          analytics cookies (Google Analytics 4) to see how people use our
          configurator.
        </p>
        <LegalTable
          caption="Cookie categories"
          headers={["Category", "Purpose", "Default", "Legal basis"]}
          rows={[
            [
              "Strictly necessary",
              "Site works; security; consent storage",
              "Always on",
              "Legitimate interest / essential",
            ],
            [
              "Analytics",
              "Understand configurator usage (GA4)",
              "Off until you opt in",
              "Consent (UK GDPR / PECR)",
            ],
            [
              "Marketing",
              "Advertising / remarketing",
              "Off — none in MVP",
              "Consent (reserved for later)",
            ],
          ]}
        />
        <p>
          We do not load Google Analytics until you click{" "}
          <strong className="font-medium text-text">Accept analytics cookies</strong>
          . IP anonymisation is enabled in our GA4 property settings.
        </p>
        <p>
          To change your choice, clear site data in your browser or wait for our
          re-consent prompt (we ask again after 12 months). Cookie consent and
          form consent are independent — you may reject analytics cookies and
          still sign up with the form checkbox ticked.
        </p>
      </LegalSection>

      <LegalSection id="subprocessors" title="Who we share data with">
        <p>
          We do not sell your personal data. We use trusted providers
          (subprocessors) to run the service:
        </p>
        <LegalTable
          caption="Subprocessors"
          headers={["Provider", "Purpose", "Data shared", "Location"]}
          rows={[
            [
              "Google Firebase",
              "Database, serverless functions, hosting",
              "Email, config snapshots, timestamps",
              "UK (europe-west2) + Auth global",
            ],
            [
              "Google Analytics 4",
              "Website analytics (consent only)",
              "Pseudonymous usage events, device/browser metadata",
              "Google — see Google Ads Data Processing Terms",
            ],
            [
              "Google reCAPTCHA",
              "Bot protection on public forms",
              "Interaction signals",
              "Google",
            ],
            [
              "SendGrid (Twilio)",
              "Transactional email (Phase 2 sign-up; waitlist confirmations when added)",
              "Email address",
              "US — SCCs / DPA",
            ],
            [
              "Sentry",
              "Error monitoring",
              "Scrubbed technical logs — no raw email in payloads",
              "US/EU per project config",
            ],
          ]}
        />
        <p>We will update this list when our providers change.</p>
      </LegalSection>

      <LegalSection id="where-we-store" title="Where we store data">
        <p>
          Your data is stored in Google Firebase (Firestore, Cloud Functions, Cloud
          Storage) in <strong className="font-medium text-text">europe-west2 (London)</strong>.
        </p>
        <p>
          When we launch full accounts (Phase 2+), Firebase Authentication runs on
          Google&apos;s global infrastructure. We will tell you clearly when that
          applies to your account.
        </p>
      </LegalSection>

      <LegalSection id="retention" title="How long we keep data">
        <p>
          We keep personal data only as long as needed for the purposes above.
          Retention periods follow our data schema (Dr. Patrick O&apos;Brien):
        </p>
        <LegalTable
          caption="Data retention periods"
          headers={["Collection", "Retention", "Erasure"]}
          rows={[
            ["signups", "12 months", "Scheduled Function or manual"],
            [
              "waitlist_site_import",
              "24 months post Site Import launch",
              "On request + scheduled",
            ],
            [
              "companies/**",
              "Life of subscription + 30 days",
              "Delete User Data Extension",
            ],
            [
              "leads",
              "Life of account",
              "Deleted with company; CSV export anytime",
            ],
            ["auditLogs", "24 months", "Automated purge"],
            [
              ".../versions archived",
              "Max 5 published + 1 draft per page",
              "Trim on publish",
            ],
            ["users/{uid}", "Until Auth user deleted", "With company deletion"],
          ]}
        />
        <p>
          When our builder ships (Phase 2), you can export your leads at any time
          from your account.
        </p>
      </LegalSection>

      <LegalSection id="your-rights" title="Your rights">
        <p>Under UK GDPR, you have the right to:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="font-medium text-text">Access</strong> — ask for a
            copy of your personal data
          </li>
          <li>
            <strong className="font-medium text-text">Correction</strong> — ask us
            to fix inaccurate data
          </li>
          <li>
            <strong className="font-medium text-text">Deletion</strong> — ask us to
            delete your data in certain circumstances
          </li>
          <li>
            <strong className="font-medium text-text">Restrict processing</strong>{" "}
            — ask us to limit how we use your data
          </li>
          <li>
            <strong className="font-medium text-text">Object</strong> — object to
            processing based on legitimate interest
          </li>
          <li>
            <strong className="font-medium text-text">Withdraw consent</strong> —
            where we rely on consent, you can withdraw it at any time
          </li>
        </ul>
        <p>
          You can also complain to the UK Information Commissioner&apos;s Office
          (ICO) at{" "}
          <a
            href="https://ico.org.uk"
            className="font-medium text-primary underline underline-offset-2 hover:text-primary/80"
          >
            ico.org.uk
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection id="children" title="Children">
        <p>
          CodedPixels is not aimed at anyone under 18. We do not knowingly collect
          data from children.
        </p>
      </LegalSection>

      <LegalSection id="changes" title="Changes">
        <p>
          We may update this policy from time to time. We will post changes on this
          page. If we make material changes to how we use cookies, we will ask for
          your consent again where required.
        </p>
      </LegalSection>

      <LegalSection id="contact" title="Contact us">
        <p>
          For privacy questions or to exercise your rights, contact our{" "}
          {LEGAL_PLACEHOLDERS.dpoName} at{" "}
          <a
            href={`mailto:${LEGAL_PLACEHOLDERS.privacyEmail}`}
            className="font-medium text-primary underline underline-offset-2 hover:text-primary/80"
          >
            {LEGAL_PLACEHOLDERS.privacyEmail}
          </a>
          .
        </p>
        <p>
          See also our{" "}
          <Link
            href="/terms"
            className="font-medium text-primary underline underline-offset-2 hover:text-primary/80"
          >
            Terms of Service
          </Link>
          .
        </p>
      </LegalSection>
    </LegalPageShell>
  );
}
