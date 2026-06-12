"use client";

import { useMemo, useState } from "react";
import { getMockSiteName, MOCK_SECTIONS } from "@/lib/mock-data";
import { Canvas } from "./Canvas";
import { PagesSidebar } from "./PagesSidebar";
import { PropertiesPanel } from "./PropertiesPanel";
import { SectionPalette } from "./SectionPalette";
import { TopBar } from "./TopBar";

type BuilderShellProps = {
  siteId: string;
};

export function BuilderShell({ siteId }: BuilderShellProps) {
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);

  const selectedSection = useMemo(
    () => MOCK_SECTIONS.find((s) => s.id === selectedSectionId) ?? null,
    [selectedSectionId],
  );

  return (
    <div className="flex h-screen flex-col">
      <a
        href="#builder-canvas"
        className="builder-focus-ring sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-card focus:bg-surface focus:px-4 focus:py-2 focus:shadow-hover"
      >
        Skip to canvas
      </a>

      <TopBar siteName={getMockSiteName(siteId)} />

      <div className="flex min-h-0 flex-1">
        <PagesSidebar activePageId="home" />
        <Canvas
          selectedSectionId={selectedSectionId}
          onSelectSection={setSelectedSectionId}
        />
        <PropertiesPanel selectedSection={selectedSection} />
      </div>

      <SectionPalette />
    </div>
  );
}
