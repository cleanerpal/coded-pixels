const FAQ_ITEMS = [
  {
    question: "Can I change my plan later?",
    answer:
      "Yes. Upgrade or downgrade anytime — no lock-in contracts. Your live total updates as you change features.",
  },
  {
    question: "What is included in the base price?",
    answer:
      "The base plan includes hosting, SSL, and a professional template. Add-ons such as CRM or booking are optional and priced clearly.",
  },
  {
    question: "Do I need technical skills?",
    answer:
      "No. Choose a template, toggle the features you need, and preview your site in minutes — no coding required.",
  },
  {
    question: "How does custom template pricing work?",
    answer:
      "Prefer a one-time fee? Switch to £149 for a bespoke design, or add custom template as a recurring add-on. Exact totals appear in your summary.",
  },
  {
    question: "Is there a contract?",
    answer:
      "No long-term contract. Cancel anytime — we keep pricing honest and flexible.",
  },
  {
    question: "Are prices VAT-inclusive?",
    answer:
      "Yes. All customer-facing prices include UK VAT where applicable.",
  },
  {
    question: "What about Making Tax Digital (MTD)?",
    answer:
      "VAT / MTD integration is available as an optional add-on. Full details will be published in our FAQ update.",
  },
  {
    question: "What is your refund and cancellation policy?",
    answer:
      "Cancel anytime from your account when billing goes live. Refund terms will be confirmed before any payment is taken.",
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
            Prices include VAT. More answers coming as we launch.
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
