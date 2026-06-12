"use client";

import { useEffect, useState } from "react";

const DESKTOP_MIN_WIDTH_PX = 768;

export function useIsDesktop(): boolean {
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const media = window.matchMedia(`(min-width: ${DESKTOP_MIN_WIDTH_PX}px)`);

    const update = () => {
      setIsDesktop(media.matches);
    };

    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return isDesktop;
}
