"use client";

import { getComponentDefinition } from "@codedpixels/component-registry";
import type { Section } from "@codedpixels/shared-types";

type PropertiesPanelProps = {
  selectedSection: Section | null;
};

export function PropertiesPanel({ selectedSection }: PropertiesPanelProps) {
  const definition = selectedSection
    ? getComponentDefinition(selectedSection.type)
    : null;

  const EditorPanel = definition?.EditorPanel;

  const parsed =
    definition && selectedSection
      ? definition.schema.safeParse(selectedSection.props)
      : null;

  const props =
    parsed?.success && parsed.data
      ? parsed.data
      : definition?.defaultProps;

  return (
    <aside
      className="hidden w-72 shrink-0 flex-col border-l border-border bg-surface md:flex"
      aria-label="Section properties"
    >
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-text-muted">
          Properties
        </h2>
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto p-4">
        {selectedSection && EditorPanel && props ? (
          <EditorPanel props={props} onChange={() => undefined} />
        ) : (
          <p className="text-sm text-text-muted">Select a section to edit</p>
        )}
      </div>
    </aside>
  );
}
