"use client";

import { useState } from "react";
import type { Section } from "@codedpixels/shared-types";
import { MOCK_SECTIONS } from "@/lib/mock-data";
import { RegistrySectionPreview } from "./RegistrySectionPreview";

type CanvasProps = {
  selectedSectionId: string | null;
  onSelectSection: (sectionId: string | null) => void;
};

export function Canvas({ selectedSectionId, onSelectSection }: CanvasProps) {
  const [sections] = useState<Section[]>(MOCK_SECTIONS);

  return (
    <section
      id="builder-canvas"
      role="region"
      aria-label="Page canvas"
      className="flex-1 overflow-y-auto bg-background p-4 md:p-6"
      tabIndex={-1}
    >
      {sections.length === 0 ? (
        <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 text-center">
          <p className="text-lg font-semibold text-text">
            Add your first section
          </p>
          <p className="max-w-sm text-sm text-text-muted">
            Choose a block from the section palette below to start building
            your page.
          </p>
        </div>
      ) : (
        <div
          className="mx-auto flex max-w-3xl flex-col gap-4"
          role="listbox"
          aria-label="Page sections"
        >
          {sections.map((section) => (
            <RegistrySectionPreview
              key={section.id}
              section={section}
              isSelected={selectedSectionId === section.id}
              onSelect={() => onSelectSection(section.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
