import { TemplateGallery } from '@/components/templates/TemplateGallery';
import { createPageMetadata } from '@/lib/seo/page-metadata';

export const metadata = createPageMetadata({
  title: 'Website Templates',
  description:
    'Browse professional website templates for trades, beauty, retail, hospitality, and more. Start with a design and configure your plan in minutes.',
  path: '/templates',
});

export default function TemplatesPage() {
  return (
    <main className="border-b border-border bg-background">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <header className="max-w-2xl">
          <h1 className="text-3xl font-bold text-text sm:text-4xl">
            Starter designs for your business
          </h1>
          <p className="mt-3 text-lg text-text-muted">
            Pick a starting design for your industry — then add features and see
            your price update in real time.
          </p>
        </header>

        <div className="mt-10">
          <TemplateGallery />
        </div>
      </div>
    </main>
  );
}
