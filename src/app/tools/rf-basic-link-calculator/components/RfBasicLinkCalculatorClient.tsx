"use client";

import { useMemo, useRef, useState } from "react";
import { quickStartPresets, type QuickStartPreset } from "@/data/quickStartPresets";
import {
  calculateLinkBudget,
  defaultLinkBudgetInput,
  hasValidationErrors,
  validateLinkBudgetInput
} from "@/lib/rf/linkBudget";
import { ConsultationCta } from "./ConsultationCta";
import { CalculatorTabs } from "./CalculatorTabs";
import { FaqSection } from "./FaqSection";
import { HeroSection } from "./HeroSection";
import { QuickStartPresets } from "./QuickStartPresets";
import { SeoLinks } from "./SeoLinks";

export function RfBasicLinkCalculatorClient() {
  const [input, setInput] = useState(defaultLinkBudgetInput);
  const calculatorRef = useRef<HTMLDivElement | null>(null);
  const presetRef = useRef<HTMLDivElement | null>(null);

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

  return (
    <>
      <HeroSection onStart={scrollToCalculator} onSample={selectSample} />
      <div ref={presetRef}>
        <QuickStartPresets onSelect={selectPreset} />
      </div>
      <div ref={calculatorRef}>
        <CalculatorTabs input={input} onInputChange={setInput} />
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
