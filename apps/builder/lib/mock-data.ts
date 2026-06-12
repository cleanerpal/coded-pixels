import { componentRegistry } from "@codedpixels/component-registry";
import type { Section } from "@codedpixels/shared-types";

export const MOCK_USER = {
  displayName: "Alex Builder",
  email: "alex@example.com",
};

export const MOCK_PAGES = [
  { id: "home", slug: "/", title: "Home" },
] as const;

export const MOCK_SECTIONS: Section[] = [
  {
    id: "section-hero",
    type: "hero",
    props: {
      headline: "Welcome to your new site",
      subheadline: "Edit this section to make it yours",
      ctaText: "Get in touch",
      ctaLink: "#contact",
      alignment: "center",
    },
  },
  {
    id: "section-text",
    type: "text-block",
    props: {
      headline: "About your business",
      body: "Add your story here. Tell visitors what makes your business special.",
    },
  },
];

export const SECTION_PALETTE = Object.values(componentRegistry).map(
  (definition) => ({
    type: definition.type,
    label: definition.label,
    category: definition.category,
  }),
);

export function getMockSiteName(siteId: string): string {
  if (siteId === "demo-site") {
    return "My Business Site";
  }
  return `Site ${siteId}`;
}

export function getMockSiteSlug(siteId: string): string {
  if (siteId === "demo-site") {
    return "my-business";
  }
  return siteId;
}
