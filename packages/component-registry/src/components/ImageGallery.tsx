import type { SectionComponentProps } from '../types';
import type { ImageGalleryProps } from '../schemas/image-gallery';

export function ImageGallery({ props }: SectionComponentProps) {
  const gallery = props as ImageGalleryProps;
  return (
    <section className="bg-background px-6 py-12">
      <div className="mx-auto max-w-5xl">
        {gallery.headline ? (
          <h2 className="mb-8 text-center text-2xl font-semibold text-primary">
            {gallery.headline}
          </h2>
        ) : null}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {gallery.images.map((image, index) => (
            <figure key={`${image.src}-${index}`} className="overflow-hidden rounded-card">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image.src} alt={image.alt} className="h-48 w-full object-cover" />
              {image.caption ? (
                <figcaption className="bg-surface px-3 py-2 text-sm text-muted">
                  {image.caption}
                </figcaption>
              ) : null}
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
