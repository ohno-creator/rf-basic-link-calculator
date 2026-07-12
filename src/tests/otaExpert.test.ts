import { describe, expect, it } from "vitest";
import { classifyRequirementMargin, desenseDistanceImpact, parseOtaMeasurementRows, tisRequirementMargin, trpRequirementMargin } from "@/lib/rf/otaExpert";

describe("OTA expert helpers", () => {
  it("judges TRP/TIS requirements with the correct sign", () => {
    expect(trpRequirementMargin(19, 18)).toBe(1);
    expect(tisRequirementMargin(-101, -99)).toBe(2);
    expect(classifyRequirementMargin(-0.1)).toBe("fail");
    expect(classifyRequirementMargin(0)).toBe("caution");
    expect(classifyRequirementMargin(2)).toBe("pass");
  });

  it("translates desense into range impact for n=2/3", () => {
    expect(desenseDistanceImpact(3, 2).distanceReductionPercent).toBeCloseTo(29.2, 1);
    expect(desenseDistanceImpact(3, 3).distanceReductionPercent).toBeCloseTo(20.6, 1);
  });

  it("parses tab/comma rows, skips header/blank rows, and reports line errors", () => {
    const result = parseOtaMeasurementRows("Band\tPc\tSc\tη\tTRP\tTIS\nB8\t23\t-108\t-4\t18\t-99\n\nB1,23,-108,-3,19.5,-102\nbad,23,x,-3,19,-101");
    expect(result.rows).toHaveLength(2);
    expect(result.rows[0].band).toBe("B8");
    expect(result.errors).toEqual(["5行目: Band名と5つの数値を確認してください。"]);
  });
});
