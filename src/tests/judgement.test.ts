import { describe, expect, it } from "vitest";
import { RfError, RfErrorCode } from "@/lib/rf/errors";
import { judgeLinkMargin } from "@/lib/rf/judgement";

describe("judgeLinkMargin", () => {
  it.each([
    [25, "excellent"],
    [20, "excellent"],
    [19.9, "good"],
    [10, "good"],
    [9.9, "caution"],
    [3, "caution"],
    [2.9, "unstable"],
    [0, "unstable"],
    [-0.1, "poor"],
    [-30, "poor"]
  ] as const)("maps margin %s dB to level %s", (marginDb, level) => {
    expect(judgeLinkMargin(marginDb).level).toBe(level);
  });

  it("returns the required presentation fields for every level", () => {
    for (const marginDb of [25, 15, 5, 1, -5]) {
      const judgement = judgeLinkMargin(marginDb);
      expect(judgement.label.length).toBeGreaterThan(0);
      expect(judgement.summary.length).toBeGreaterThan(0);
      expect(judgement.technicalComment.length).toBeGreaterThan(0);
      expect(judgement.recommendation.length).toBeGreaterThan(0);
      expect(judgement.ctaLabel.length).toBeGreaterThan(0);
    }
  });

  it.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
    "throws for non-finite margin %s",
    (marginDb) => {
      expect(() => judgeLinkMargin(marginDb)).toThrow();
    }
  );

  it("identifies non-finite margins with a coded error", () => {
    let thrown: unknown;
    try {
      judgeLinkMargin(Number.NaN);
    } catch (error) {
      thrown = error;
    }
    expect(thrown).toBeInstanceOf(RfError);
    expect((thrown as RfError).code).toBe(RfErrorCode.NonFinite);
    expect((thrown as RfError).field).toBe("link_margin");
  });
});
