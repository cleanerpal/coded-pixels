import {
  decodeConfigFromParams,
  encodeConfigToQueryString,
} from '@/lib/config-state';
import type { ConfigState } from '@codedpixels/shared-types';

/** Debounce interval for configurator URL updates (project plan § State persistence). */
export const CONFIG_URL_DEBOUNCE_MS = 300;

/** Canonical query string for URL params — stable regardless of param order. */
export function canonicalConfigQueryFromSearchString(search: string): string {
  const params = search ? new URLSearchParams(search) : new URLSearchParams();
  const { config } = decodeConfigFromParams(params);
  return encodeConfigToQueryString(config);
}

/** Canonical query string from live search params. */
export function canonicalConfigQueryFromParams(
  params: URLSearchParams | { toString(): string },
): string {
  return canonicalConfigQueryFromSearchString(params.toString());
}

/** Build an App Router href for the given config (no history entry). */
export function buildConfigHref(pathname: string, config: ConfigState): string {
  const query = encodeConfigToQueryString(config);
  return query ? `${pathname}?${query}` : pathname;
}

/** True when encoded config differs from the current URL search string. */
export function configHrefDiffers(
  search: string,
  config: ConfigState,
): boolean {
  return (
    canonicalConfigQueryFromSearchString(search) !==
    encodeConfigToQueryString(config)
  );
}
