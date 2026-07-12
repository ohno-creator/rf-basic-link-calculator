"use client";

import { useEffect, useRef, useState } from "react";

export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(query.matches);
    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return reduced;
}

export function useIntuitionAnimation(callback: (elapsedMs: number) => void, playing: boolean): void {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;
  const elapsedRef = useRef(0);

  useEffect(() => {
    if (!playing) {
      return;
    }
    let rafId = 0;
    let last = performance.now();
    const tick = (now: number) => {
      elapsedRef.current += now - last;
      last = now;
      callbackRef.current(elapsedRef.current);
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [playing]);
}

export function useExperiencePlayback(): { playing: boolean; toggle: () => void } {
  const reduced = usePrefersReducedMotion();
  const [userChoice, setUserChoice] = useState<boolean | null>(null);
  const playing = userChoice ?? !reduced;
  return { playing, toggle: () => setUserChoice(!playing) };
}
