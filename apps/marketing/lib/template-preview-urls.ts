const LOCAL_PREVIEW_URL_TEMPLATE = 'http://{templateId}.localhost:3002/';
const PROD_PREVIEW_URL_TEMPLATE = 'https://{templateId}.codedpixels.co.uk/';

function withTrailingSlash(url: string): string {
  return url.endsWith('/') ? url : `${url}/`;
}

function substituteTemplateId(template: string, templateId: string): string {
  return template.replace(/\{templateId\}/g, templateId);
}

function buildFromOverride(baseUrl: string, templateId: string): string {
  if (baseUrl.includes('{templateId}')) {
    return withTrailingSlash(substituteTemplateId(baseUrl, templateId));
  }

  const withProtocol = baseUrl.includes('://') ? baseUrl : `https://${baseUrl}`;
  const url = new URL(withProtocol);
  url.hostname = `${templateId}.${url.hostname}`;
  url.pathname = '/';
  url.search = '';
  url.hash = '';
  return url.toString();
}

/**
 * Demo tenant preview URL for a library template (Q65 / marketing-template-preview-spec §4.1).
 */
export function buildPreviewUrl(templateId: string): string {
  const override = process.env.NEXT_PUBLIC_TEMPLATE_PREVIEW_BASE_URL?.trim();
  if (override) {
    return buildFromOverride(override, templateId);
  }

  const template =
    process.env.NODE_ENV === 'production'
      ? PROD_PREVIEW_URL_TEMPLATE
      : LOCAL_PREVIEW_URL_TEMPLATE;

  return substituteTemplateId(template, templateId);
}

/** Public WebP thumbnail path — gradient fallback when file missing (spec §4.5). */
export function getTemplatePreviewThumbnailPath(templateId: string): string {
  return `/templates/previews/${templateId}.webp`;
}

/** Library starter templates have demo tenants; bespoke custom card has no preview. */
export function isLibraryTemplateId(templateId: string | null): boolean {
  return templateId !== null && templateId !== 'custom';
}
