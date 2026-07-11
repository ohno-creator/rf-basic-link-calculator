"use client";

import { useEffect, useRef, useState } from "react";

/** OSの「視差効果を減らす」設定を購読する。SSR中はfalse（アニメなし側に倒すのはマウント後）。 */
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

/**
 * requestAnimationFrame ループ。playing=false で停止。
 * コールバックには「再生中に進んだ累計時間ms」を渡す（停止中は進まない＝再開してもジャンプしない）。
 */
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

/**
 * 章の「体感ゾーン」共通の再生状態。reduced-motion時は初期停止。
 * 返り値の playing をSVGアニメに、toggle を再生ボタンに接続する。
 */
export function useExperiencePlayback(): { playing: boolean; toggle: () => void } {
  const reduced = usePrefersReducedMotion();
  const [userChoice, setUserChoice] = useState<boolean | null>(null);
  const playing = userChoice ?? !reduced;
  return { playing, toggle: () => setUserChoice(!playing) };
}
