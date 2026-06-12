import type { Metadata } from "next";
import Link from "next/link";

import {
  LegalPageShell,
  LegalSection,
} from "@/components/legal/LegalPageShell";
import { LEGAL_PLACEHOLDERS } from "@/components/legal/legal-placeholders";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms for using the CodedPixels website and configurator.",
};

const LAST_UPDATED = "12 June 2026";

export default function TermsPage() {
  return (
    <LegalPageShell title="Terms of Service" lastUpdated={LAST_UPDATED}>
      <LegalSection id="about-these-terms" title="About these terms">
        <p>
          By using codedpixels.co.uk, you agree to these terms. If you do not
          agree, please do not use the site.
        </p>
      </LegalSection>

      <LegalSection id="who-we-are" title="Who we are">
        <p>
          The site is operated by {LEGAL_PLACEHOLDERS.companyLegalName},{" "}
          {LEGAL_PLACEHOLDERS.registeredAddress}.
        </p>
      </LegalSection>

      <LegalSection id="what-we-provide" title="What CodedPixels provides">
        <p>
          CodedPixels offers a marketing site and configurator so you can design
          a website plan — choose a template, add features, and see pricing in
          real time.
        </p>
        <p>
          <strong className="font-medium text-text">MVP note:</strong> sign-up is
          a preview. There is no live website or builder dashboard yet. We will
          contact you about next steps when the full platform is ready.
        </p>
      </LegalSection>

      <LegalSection id="simulated-checkout" title="Simulated checkout (important)">
        <p>
          <strong className="font-medium text-text">No payment is taken</strong> on
          the MVP Get Started flow. Submitting your email does{" "}
          <strong className="font-medium text-text">not</strong> form a contract
          for paid services. We will be in touch about next steps before any
          subscription begins.
        </p>
      </LegalSection>

      <LegalSection id="pricing" title="Pricing">
        <p>
          Prices shown in the configurator are{" "}
          <strong className="font-medium text-text">VAT-inclusive</strong> for UK
          customers. The live total in your order summary is the authoritative
          price. Package cards may round for display — see our FAQ for details.
        </p>
        <p>
          Any final price for a paid subscription will be confirmed before payment
          is taken.
        </p>
      </LegalSection>

      <LegalSection id="your-account" title="Your account (Phase 2+)">
        <p>
          When full accounts launch, you are responsible for keeping your login
          details secure, providing accurate information, and telling us promptly
          if you suspect unauthorised use of your account.
        </p>
      </LegalSection>

      <LegalSection id="acceptable-use" title="Acceptable use">
        <p>You agree not to:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Use the site for anything unlawful</li>
          <li>Abuse forms, waitlists, or sign-up flows</li>
          <li>Scrape or harvest data without permission</li>
          <li>Attempt to break security or disrupt the service</li>
        </ul>
      </LegalSection>

      <LegalSection id="intellectual-property" title="Intellectual property">
        <p>
          We own the CodedPixels platform, templates, software, and brand. You
          retain ownership of your business content. We grant you a limited
          licence to use the configurator to design your plan.
        </p>
      </LegalSection>

      <LegalSection id="availability" title="Availability">
        <p>
          We use reasonable efforts to keep the site available, but we do not
          guarantee uninterrupted service during beta or MVP. Maintenance and
          updates may cause temporary downtime.
        </p>
      </LegalSection>

      <LegalSection id="limitation-of-liability" title="Limitation of liability">
        <p>
          To the fullest extent permitted by UK law, we are not liable for
          indirect or consequential loss. Our total liability to you is capped at
          the fees you paid us in the 12 months before the claim — or{" "}
          <strong className="font-medium text-text">£0</strong> during free MVP
          sign-up.
        </p>
        <p>
          Nothing in these terms excludes or limits liability for death or personal
          injury caused by negligence, fraud, or any rights under the Consumer
          Rights Act 2015 that cannot be excluded by law.
        </p>
      </LegalSection>

      <LegalSection id="cancellation" title="Cancellation">
        <p>
          MVP: there is no subscription yet, so nothing to cancel. When billing
          goes live (Phase 2), you can cancel anytime — aligned with our trust
          line &ldquo;Cancel anytime&rdquo;.
        </p>
      </LegalSection>

      <LegalSection id="changes" title="Changes">
        <p>
          We may update these terms from time to time. Continued use after we post
          changes means you accept the updated terms. For material changes, we will
          notify you by email or a notice on the site.
        </p>
      </LegalSection>

      <LegalSection id="governing-law" title="Governing law">
        <p>
          These terms are governed by the laws of England and Wales. Disputes are
          subject to the courts of England and Wales. If you are a consumer, you
          may also have mandatory rights in your home jurisdiction.
        </p>
      </LegalSection>

      <LegalSection id="contact" title="Contact">
        <p>
          For legal or privacy queries, email{" "}
          <a
            href={`mailto:${LEGAL_PLACEHOLDERS.privacyEmail}`}
            className="font-medium text-primary underline underline-offset-2 hover:text-primary/80"
          >
            {LEGAL_PLACEHOLDERS.privacyEmail}
          </a>
          . See our{" "}
          <Link
            href="/privacy"
            className="font-medium text-primary underline underline-offset-2 hover:text-primary/80"
          >
            Privacy Policy
          </Link>{" "}
          for how we handle your data.
        </p>
      </LegalSection>
    </LegalPageShell>
  );
}
