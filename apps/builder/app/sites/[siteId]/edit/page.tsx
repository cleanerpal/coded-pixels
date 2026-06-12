import type { Metadata } from "next";
import { BuilderShell } from "@/components/builder/BuilderShell";
import { getMockSiteName } from "@/lib/mock-data";

type EditPageProps = {
  params: Promise<{ siteId: string }>;
};

export async function generateMetadata({
  params,
}: EditPageProps): Promise<Metadata> {
  const { siteId } = await params;
  return {
    title: `Edit ${getMockSiteName(siteId)}`,
  };
}

export default async function EditPage({ params }: EditPageProps) {
  const { siteId } = await params;

  return <BuilderShell siteId={siteId} />;
}
