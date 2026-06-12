'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { decodeConfigFromParams } from '@/lib/config-state';
import {
  CONFIG_URL_DEBOUNCE_MS,
  buildConfigHref,
  configHrefDiffers,
} from '@/lib/config-url-sync';
import type { ConfigState } from '@/types';

export type SetConfigState = (
  value: ConfigState | ((previous: ConfigState) => ConfigState),
) => void;

export interface UseConfigUrlStateResult {
  config: ConfigState;
  setConfig: SetConfigState;
  /** True when URL contained invalid params — show Q40 restore toast. */
  hadInvalidParams: boolean;
}

/**
 * Syncs configurator state with shareable URL search params.
 *
 * - Initial load + refresh: state restored via decode (Q40 partial restore).
 * - Local changes: debounced `router.replace` (no history spam per toggle).
 *
 * Wrap the consumer in `<Suspense>` — required by `useSearchParams` in App Router.
 */
export function useConfigUrlState(): UseConfigUrlStateResult {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamsKey = searchParams.toString();

  const [config, setConfigState] = useState<ConfigState>(() => {
    return decodeConfigFromParams(searchParams).config;
  });
  const [hadInvalidParams, setHadInvalidParams] = useState(() => {
    return decodeConfigFromParams(searchParams).hadInvalidParams;
  });

  const isReplacingUrlRef = useRef(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Back/forward or pasted link — prefer URL over stale local state.
  useEffect(() => {
    if (isReplacingUrlRef.current) {
      isReplacingUrlRef.current = false;
      return;
    }

    const decoded = decodeConfigFromParams(
      new URLSearchParams(searchParamsKey),
    );
    setConfigState(decoded.config);
    setHadInvalidParams(decoded.hadInvalidParams);
  }, [searchParamsKey]);

  // Debounced replace when local config diverges from the URL.
  useEffect(() => {
    if (!configHrefDiffers(searchParamsKey, config)) {
      return;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      debounceTimerRef.current = null;
      const href = buildConfigHref(pathname, config);
      isReplacingUrlRef.current = true;
      router.replace(href, { scroll: false });
    }, CONFIG_URL_DEBOUNCE_MS);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [config, pathname, router, searchParamsKey]);

  const setConfig: SetConfigState = useCallback((value) => {
    setConfigState((previous) =>
      typeof value === 'function' ? value(previous) : value,
    );
  }, []);

  return { config, setConfig, hadInvalidParams };
}
