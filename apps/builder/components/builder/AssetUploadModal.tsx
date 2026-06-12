"use client";

import { Button } from "@codedpixels/ui";
import { useCallback, useId, useState } from "react";

import { validateAssetUploadForm } from "@/lib/assets/upload-validation";

type AssetUploadModalProps = {
  siteId: string;
  open: boolean;
  onClose: () => void;
  onUploadComplete?: (assetId: string) => void;
};

/**
 * Minimal asset upload modal stub — builder-ui-spec.md §14 (B7-001).
 * Wired to createAssetUpload Callable in a follow-up ticket.
 */
export function AssetUploadModal({
  siteId,
  open,
  onClose,
  onUploadComplete,
}: AssetUploadModalProps) {
  const titleId = useId();
  const altTextId = useId();
  const fileId = useId();
  const [altText, setAltText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reset = useCallback(() => {
    setAltText("");
    setFile(null);
    setError(null);
    setIsSubmitting(false);
  }, []);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [onClose, reset]);

  const handleSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      setError(null);

      const validation = validateAssetUploadForm({ altText, file });
      if (!validation.success) {
        setError(validation.error);
        return;
      }

      setIsSubmitting(true);
      try {
        // TODO(B7): call createAssetUpload + PUT to signed URL (siteId={siteId})
        void siteId;
        void validation.data;
        onUploadComplete?.("pending-stub");
        handleClose();
      } catch {
        setError("Upload failed. Please try again.");
        setIsSubmitting(false);
      }
    },
    [altText, file, handleClose, onUploadComplete, siteId],
  );

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-primary/40 p-4"
      role="presentation"
      onClick={handleClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-md rounded-card border border-border bg-surface p-6 shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id={titleId} className="text-lg font-semibold text-primary">
          Upload image
        </h2>
        <p className="mt-1 text-sm text-text-muted">
          JPEG, PNG, WebP, or GIF up to 5 MB. Alt text is required.
        </p>

        <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor={fileId}
              className="block text-xs font-semibold uppercase tracking-wide text-text-muted"
            >
              Image file
            </label>
            <input
              id={fileId}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="mt-1 block w-full text-sm text-primary file:mr-3 file:rounded-card file:border-0 file:bg-accent file:px-3 file:py-2 file:text-sm file:font-semibold file:text-surface"
              onChange={(event) => {
                setFile(event.target.files?.[0] ?? null);
                setError(null);
              }}
            />
          </div>

          <div>
            <label
              htmlFor={altTextId}
              className="block text-xs font-semibold uppercase tracking-wide text-text-muted"
            >
              Alt text <span className="text-accent">*</span>
            </label>
            <textarea
              id={altTextId}
              required
              rows={3}
              value={altText}
              onChange={(event) => {
                setAltText(event.target.value);
                setError(null);
              }}
              placeholder="Describe the image for screen readers"
              className="mt-1 w-full rounded-card border border-border bg-background px-3 py-2 text-sm text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
            />
          </div>

          {error ? (
            <p className="text-sm text-accent" role="alert">
              {error}
            </p>
          ) : null}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Uploading…" : "Upload"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
