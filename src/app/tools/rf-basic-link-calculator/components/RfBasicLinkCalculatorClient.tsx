"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { quickStartPresets, type QuickStartPreset } from "@/data/quickStartPresets";
import {
  calculateLinkBudget,
  defaultLinkBudgetInput,
  hasValidationErrors,
  validateLinkBudgetInput
} from "@/lib/rf/linkBudget";
import {
  buildShareUrl,
  clearStoredInput,
  decodeInputFromQuery,
  encodeInputToQuery,
  isDefaultInput,
  loadStoredInput,
  saveStoredInput
} from "@/lib/rf/share";
import { BeginnerRoadmap } from "./BeginnerRoadmap";
import { ConsultationCta } from "@/app/tools/_components/ConsultationCta";
import { CalculatorTabs, type CalculatorMode } from "./CalculatorTabs";
import { FaqSection } from "./FaqSection";
import { HeroSection } from "./HeroSection";
import { QuickStartPresets } from "./QuickStartPresets";
import { SeoLinks } from "./SeoLinks";

export function RfBasicLinkCalculatorClient() {
  const [input, setInput] = useState(defaultLinkBudgetInput);
  // 既定は迷わない「かんたん」モード。共有URL・保存済み入力から来た人は全項目が見える詳細モードで開く。
  const [mode, setMode] = useState<CalculatorMode>("guided");
  const [isHydrated, setIsHydrated] = useState(false);
  const [shareState, setShareState] = useState<"idle" | "copied" | "error">("idle");
  const calculatorRef = useRef<HTMLDivElement | null>(null);
  const presetRef = useRef<HTMLDivElement | null>(null);
  // 初回マウント時の復元が終わるまでは永続化を走らせないためのフラグ。
  const hydratedRef = useRef(false);

  const result = useMemo(() => {
    const errors = validateLinkBudgetInput(input);
    if (hasValidationErrors(errors)) {
      return null;
    }

    try {
      return calculateLinkBudget(input);
    } catch {
      return null;
    }
  }, [input]);

  function scrollToCalculator() {
    window.setTimeout(() => {
      calculatorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  }

  // マウント後にURLクエリ→localStorageの順で入力条件を復元する。
  // SSR/静的書き出しの初期HTMLは既定値で描画されるため、復元はここで行いハイドレーションのずれを避ける。
  useEffect(() => {
    const fromQuery = decodeInputFromQuery(window.location.search);
    if (fromQuery) {
      setInput(fromQuery);
      setMode("expert");
      hydratedRef.current = true;
      setIsHydrated(true);
      scrollToCalculator();
      return;
    }

    const stored = loadStoredInput();
    if (stored) {
      setInput(stored);
      setMode("expert");
    }
    hydratedRef.current = true;
    setIsHydrated(true);
  }, []);

  // 入力が変わるたびにlocalStorageとURLへ反映する（共有・リロード復元のため）。
  // スライダー操作で多発するのを抑えるため、わずかにデバウンスする。
  useEffect(() => {
    if (!hydratedRef.current) {
      return;
    }

    const timer = window.setTimeout(() => {
      // 既定値のときはURL・保存をクリーンに保ち、変更があるときだけ反映する。
      if (isDefaultInput(input)) {
        clearStoredInput();
        window.history.replaceState(null, "", window.location.pathname);
        return;
      }

      saveStoredInput(input);
      const query = encodeInputToQuery(input);
      window.history.replaceState(null, "", `${window.location.pathname}?${query}`);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [input]);

  function selectPreset(preset: QuickStartPreset) {
    setInput(preset.input);
    scrollToCalculator();
  }

  function selectSample() {
    setInput(quickStartPresets[0].input);
    window.setTimeout(() => {
      presetRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      calculatorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  }

  const resetInput = useCallback(() => {
    setInput(defaultLinkBudgetInput);
    clearStoredInput();
    window.history.replaceState(null, "", window.location.pathname);
    setShareState("idle");
  }, []);

  const copyShareLink = useCallback(async () => {
    try {
      const url = buildShareUrl(input, window.location.href);
      await navigator.clipboard.writeText(url);
      setShareState("copied");
    } catch {
      setShareState("error");
    }
    window.setTimeout(() => setShareState("idle"), 2200);
  }, [input]);

  return (
    <>
      <HeroSection onStart={scrollToCalculator} onSample={selectSample} />
      <BeginnerRoadmap />
      <div ref={presetRef}>
        <QuickStartPresets onSelect={selectPreset} />
      </div>
      <div ref={calculatorRef} data-testid="rf-calculator-shell" data-hydrated={isHydrated ? "true" : "false"}>
        <CalculatorTabs
          input={input}
          onInputChange={setInput}
          onReset={resetInput}
          onShare={copyShareLink}
          shareState={shareState}
          mode={mode}
          onModeChange={setMode}
        />
      </div>
      <SeoLinks />
      <FaqSection />
      <section className="mx-auto mt-10 max-w-5xl px-4 sm:px-6 lg:px-8">
        <ConsultationCta
          input={result ? input : undefined}
          result={result ?? undefined}
          ctaLabel={result?.judgement.ctaLabel}
        />
      </section>
    </>
  );
}
