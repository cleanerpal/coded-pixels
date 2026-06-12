import type { EditorPanelProps } from '../types';
import type { ImageGalleryProps } from '../schemas/image-gallery';
import { TextAreaField, TextField } from './fields';

export function ImageGalleryEditorPanel({ props, onChange }: EditorPanelProps) {
  const gallery = props as ImageGalleryProps;
  const imagesText = gallery.images
    .map((image) => `${image.src}|${image.alt}|${image.caption ?? ''}`)
    .join('\n');

  return (
    <div className="space-y-4">
      <TextField
        id="gallery-headline"
        label="Headline"
        value={gallery.headline ?? ''}
        onChange={(event) => onChange({ ...gallery, headline: event.target.value || undefined })}
      />
      <TextAreaField
        id="gallery-images"
        label="Images (src|alt|caption per line)"
        value={imagesText}
        onChange={(event) => {
          const images = event.target.value
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean)
            .map((line) => {
              const [src, alt, caption] = line.split('|');
              return {
                src: src?.trim() ?? '',
                alt: alt?.trim() ?? 'Image',
                caption: caption?.trim() || undefined,
              };
            })
            .filter((image) => image.src);
          onChange({ ...gallery, images: images.length ? images : gallery.images });
        }}
      />
    </div>
  );
}
