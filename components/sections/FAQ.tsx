const FAQ_ITEMS = [
  {
    question: "Can I change my plan later?",
    answer:
      "Yes. Upgrade or downgrade anytime — no lock-in contracts. Your live total updates as you change templates or features.",
  },
  {
    question: "What is included in the base price?",
    answer:
      "The £9.99/mo base plan includes a professional website, hosting, custom domain and SSL, mobile-responsive layout, a basic contact or quote form, and access to our template library. Add-ons such as CRM, booking, or e-commerce are optional.",
  },
  {
    question: "Do I need technical skills?",
    answer:
      "No. Pick a template, toggle the features you need, and preview your site in minutes. No coding or design software required.",
  },
  {
    question: "How does custom template pricing work?",
    answer:
      "Custom Template Design is +£14.99/mo by default. Prefer a one-time fee? Use the toggle on the Custom Template card to switch to £149 — shown separately on Get Started, not added to your monthly total.",
  },
  {
    question: "Is there a contract?",
    answer:
      "No long-term contract. On the MVP site, Get Started is a sign-up preview — no payment is taken and submitting your email does not form a paid subscription. When billing launches, you can cancel anytime.",
  },
  {
    question: "Are prices VAT-inclusive?",
    answer:
      "Yes. All customer-facing prices include UK VAT where applicable. The live total in your pricing summary is the authoritative amount.",
  },
  {
    question: "What about Making Tax Digital (MTD)?",
    answer:
      "VAT & Tax Automation is an optional add-on at +£4.99/mo. It is designed for HMRC Making Tax Digital compliance with Xero sync — add it when you need it, same as any other feature.",
  },
  {
    question: "What is your refund and cancellation policy?",
    answer:
      "MVP sign-up takes no payment, so there is nothing to refund yet. When paid subscriptions launch, you can cancel anytime from your account — no lock-in. We will confirm full refund terms before any charge is taken.",
  },
  {
    question: "Do I pay when I sign up?",
    answer:
      "Not on the MVP site. Get Started saves your plan and email so we can follow up — no card details, no payment taken. A clear banner on the sign-up page explains this is a preview.",
  },
  {
    question: "Why does my total differ from a package card?",
    answer:
      "Package cards may round for display (for example, Growth shows £24.99/mo). Your configurator summary shows the exact live total — that figure is always the one to trust when you change features.",
  },
] as const;

export function FAQ() {
  return (
    <section
      aria-labelledby="faq-heading"
      className="bg-background py-12 sm:py-16"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 id="faq-heading" className="text-2xl font-bold text-text sm:text-3xl">
            Frequently asked questions
          </h2>
          <p className="mt-3 text-text-muted">
            Straight answers on pricing, plans, and how sign-up works today.
          </p>
        </div>

        <dl className="mx-auto mt-10 max-w-3xl divide-y divide-border">
          {FAQ_ITEMS.map((item) => (
            <div key={item.question} className="py-5">
              <dt className="text-base font-semibold text-text">
                {item.question}
              </dt>
              <dd className="mt-2 text-sm text-text-muted">{item.answer}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
