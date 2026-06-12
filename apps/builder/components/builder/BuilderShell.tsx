"use client";

import { useCallback, useMemo, useState } from "react";
import { PublishSiteError, publishSite } from "@/lib/callables";
import { getLiveSiteUrl } from "@/lib/live-site-url";
import {
  getMockSiteName,
  getMockSiteSlug,
  MOCK_SECTIONS,
} from "@/lib/mock-data";
import { useIsDesktop } from "@/lib/use-is-desktop";
import { Canvas } from "./Canvas";
import { PagesSidebar } from "./PagesSidebar";
import { PropertiesPanel } from "./PropertiesPanel";
import { SectionPalette } from "./SectionPalette";
import { TopBar, type PublishStatus } from "./TopBar";

type BuilderShellProps = {
  siteId: string;
};

function formatPublishError(error: unknown): string {
  if (error instanceof PublishSiteError) {
    if (error.validationErrors?.length) {
      const first = error.validationErrors[0];
      return `Fix errors to publish: ${first?.message ?? "Validation failed"}`;
    }
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Could not publish site. Please try again.";
}

export function BuilderShell({ siteId }: BuilderShellProps) {
  const isDesktop = useIsDesktop();
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [publishStatus, setPublishStatus] = useState<PublishStatus>("idle");
  const [publishError, setPublishError] = useState<string | null>(null);
  const [liveSiteUrl, setLiveSiteUrl] = useState<string | null>(null);

  const siteSlug = getMockSiteSlug(siteId);

  const selectedSection = useMemo(
    () => MOCK_SECTIONS.find((s) => s.id === selectedSectionId) ?? null,
    [selectedSectionId],
  );

  const handleDismissPublishMessage = useCallback(() => {
    setPublishStatus("idle");
    setPublishError(null);
  }, []);

  const handlePublish = useCallback(async () => {
    if (!isDesktop || publishStatus === "publishing") {
      return;
    }

    setPublishStatus("publishing");
    setPublishError(null);

    try {
      await publishSite({ siteId });
      setPublishStatus("success");
      setLiveSiteUrl(getLiveSiteUrl(siteSlug));
    } catch (error) {
      setPublishStatus("error");
      setPublishError(formatPublishError(error));
    }
  }, [isDesktop, publishStatus, siteId, siteSlug]);

  return (
    <div className="flex h-screen flex-col">
      <a
        href="#builder-canvas"
        className="builder-focus-ring sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-card focus:bg-surface focus:px-4 focus:py-2 focus:shadow-hover"
      >
        Skip to canvas
      </a>

      <TopBar
        siteName={getMockSiteName(siteId)}
        isDesktop={isDesktop}
        publishStatus={publishStatus}
        publishError={publishError}
        liveSiteUrl={liveSiteUrl}
        onPublish={handlePublish}
        onDismissPublishMessage={handleDismissPublishMessage}
      />

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
