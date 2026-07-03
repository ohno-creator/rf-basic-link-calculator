import { describe, expect, it } from "vitest";
import {
  collapsibleStorageKey,
  judgementDotClass,
  judgementStatTone,
  metricStatTone,
  metricSurfaceTone,
  nextRovingIndex,
  resolveCollapsibleOpen,
  shouldShowMobileResultBar,
  type MetricTone
} from "@/lib/ui/kit";
import type { LinkJudgementLevel } from "@/lib/rf/judgement";

const ALL_TONES: MetricTone[] = [
  "neutral",
  "primary",
  "success",
  "info",
  "caution",
  "warning",
  "danger"
];

describe("metric tone maps", () => {
  it("cover every MetricTone", () => {
    for (const tone of ALL_TONES) {
      expect(metricStatTone[tone]).toBeDefined();
      expect(metricSurfaceTone[tone]).toBeDefined();
    }
  });

  it("map judgement tones to distinct value colors, neutral/primary to plain surface", () => {
    expect(metricStatTone.primary).toBe("staf");
    expect(metricStatTone.success).toBe("emerald");
    expect(metricStatTone.danger).toBe("rose");
    // Stat には orange が無いため warning は amber に寄せる（面のトーンで区別する）。
    expect(metricStatTone.warning).toBe("amber");
    expect(metricStatTone.caution).toBe("amber");
    // 面: neutral/primary は素の白面、warning と caution は別トーンで区別される。
    expect(metricSurfaceTone.neutral).toBe("neutral");
    expect(metricSurfaceTone.primary).toBe("neutral");
    expect(metricSurfaceTone.warning).toBe("warning");
    expect(metricSurfaceTone.caution).toBe("caution");
  });
});

describe("nextRovingIndex", () => {
  it("moves forward and wraps at the end", () => {
    expect(nextRovingIndex(0, "ArrowRight", 3)).toBe(1);
    expect(nextRovingIndex(2, "ArrowRight", 3)).toBe(0);
    expect(nextRovingIndex(1, "ArrowDown", 3)).toBe(2);
  });

  it("moves backward and wraps at the start", () => {
    expect(nextRovingIndex(2, "ArrowLeft", 3)).toBe(1);
    expect(nextRovingIndex(0, "ArrowLeft", 3)).toBe(2);
    expect(nextRovingIndex(0, "ArrowUp", 3)).toBe(2);
  });

  it("returns -1 for non-arrow keys and empty lists", () => {
    expect(nextRovingIndex(0, "Enter", 3)).toBe(-1);
    expect(nextRovingIndex(0, " ", 3)).toBe(-1);
    expect(nextRovingIndex(0, "ArrowRight", 0)).toBe(-1);
  });
});

const ALL_LEVELS: LinkJudgementLevel[] = ["excellent", "good", "caution", "unstable", "poor"];

describe("judgement maps", () => {
  it("cover every LinkJudgementLevel", () => {
    for (const level of ALL_LEVELS) {
      expect(judgementStatTone[level]).toBeDefined();
      expect(judgementDotClass[level]).toBeDefined();
    }
  });

  it("distinguish unstable via the dot even though the value color collapses to amber", () => {
    expect(judgementStatTone.unstable).toBe("amber");
    expect(judgementStatTone.caution).toBe("amber");
    expect(judgementDotClass.unstable).toBe("bg-orange-500");
    expect(judgementDotClass.caution).toBe("bg-amber-500");
    expect(judgementStatTone.excellent).toBe("emerald");
    expect(judgementStatTone.poor).toBe("rose");
  });
});

describe("shouldShowMobileResultBar", () => {
  it("shows only while the result is below the fold (not intersecting, top > 0)", () => {
    expect(shouldShowMobileResultBar(false, 500)).toBe(true);
    // 交差中（結果が画面内）は隠す
    expect(shouldShowMobileResultBar(true, 500)).toBe(false);
    // 上に通り過ぎた（top <= 0）は隠す
    expect(shouldShowMobileResultBar(false, 0)).toBe(false);
    expect(shouldShowMobileResultBar(false, -100)).toBe(false);
  });
});

describe("resolveCollapsibleOpen", () => {
  it("honors stored open/closed and falls back to default", () => {
    expect(resolveCollapsibleOpen("open", false)).toBe(true);
    expect(resolveCollapsibleOpen("closed", true)).toBe(false);
    expect(resolveCollapsibleOpen(null, true)).toBe(true);
    expect(resolveCollapsibleOpen(null, false)).toBe(false);
    expect(resolveCollapsibleOpen("garbage", true)).toBe(true);
  });

  it("namespaces the storage key", () => {
    expect(collapsibleStorageKey("fspl:beginner-guide")).toBe("collapsible:fspl:beginner-guide");
  });
});
