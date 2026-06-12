import { getComponentDefinition } from "@codedpixels/component-registry";
import type { Section } from "@codedpixels/shared-types";

type RegistrySectionPreviewProps = {
  section: Section;
  isSelected: boolean;
  onSelect: () => void;
};

export function RegistrySectionPreview({
  section,
  isSelected,
  onSelect,
}: RegistrySectionPreviewProps) {
  const definition = getComponentDefinition(section.type);

  if (!definition) {
    return null;
  }

  const parsed = definition.schema.safeParse(section.props);
  const props = parsed.success ? parsed.data : definition.defaultProps;
  const Component = definition.Component;

  return (
    <div
      role="option"
      aria-label={`${definition.label} section`}
      aria-selected={isSelected}
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
      className={`builder-focus-ring cursor-pointer rounded-card border-2 bg-surface transition-colors ${
        isSelected
          ? "border-primary shadow-rest"
          : "border-transparent hover:border-border"
      }`}
    >
      <Component props={props} />
    </div>
  );
}
