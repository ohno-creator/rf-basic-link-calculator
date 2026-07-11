import { describe, expect, it } from "vitest";
import { judgeKeepout, KEEPOUT_DANGER_SHORTFALL_RATIO } from "@/lib/rf/antennaKeepout";
import { KEEPOUT_REQUIREMENTS } from "@/data/antennaKeepout";
import { RfError } from "@/lib/rf/errors";

describe("judgeKeepout", () => {
  it("returns success when the available area exactly meets the requirement (chip 2400MHz, 10x4)", () => {
    const result = judgeKeepout({
      antennaType: "chip",
      band: "band2400",
      availableWidthMm: 10,
      availableHeightMm: 4
    });
    expect(result.requiredWidthMm).toBe(10);
    expect(result.requiredHeightMm).toBe(4);
    expect(result.verdict).toBe("success");
    expect(result.shortfallWidthMm).toBe(0);
    expect(result.shortfallHeightMm).toBe(0);
  });

  it("returns caution when the only shortfall is under 20% (chip 2400MHz, W9 = 10% short)", () => {
    const result = judgeKeepout({
      antennaType: "chip",
      band: "band2400",
      availableWidthMm: 9,
      availableHeightMm: 4
    });
    expect(result.verdict).toBe("caution");
    expect(result.shortfallWidthMm).toBeCloseTo(1, 10);
    expect(result.shortfallHeightMm).toBe(0);
  });

  it("returns danger when a side is 20% or more short (chip 2400MHz, W7.9 = 21% short)", () => {
    const result = judgeKeepout({
      antennaType: "chip",
      band: "band2400",
      availableWidthMm: 7.9,
      availableHeightMm: 4
    });
    expect(result.verdict).toBe("danger");
    expect(result.shortfallWidthMm).toBeCloseTo(2.1, 10);
  });

  it("treats exactly 20% shortfall as danger (boundary, chip 2400MHz W8)", () => {
    expect(KEEPOUT_DANGER_SHORTFALL_RATIO).toBe(0.2);
    const result = judgeKeepout({
      antennaType: "chip",
      band: "band2400",
      availableWidthMm: 8,
      availableHeightMm: 4
    });
    expect(result.verdict).toBe("danger");
  });

  it("returns success for the PCB pattern at 920MHz with W50 x H15", () => {
    const result = judgeKeepout({
      antennaType: "pcb",
      band: "band920",
      availableWidthMm: 50,
      availableHeightMm: 15
    });
    expect(result.requiredWidthMm).toBe(50);
    expect(result.requiredHeightMm).toBe(15);
    expect(result.verdict).toBe("success");
  });

  it("returns danger when both sides are short and one exceeds 20%", () => {
    // FPC sub6: 必要 20x8。W15(25%不足)・H7(12.5%不足) → いずれかの辺で20%以上 → danger
    const result = judgeKeepout({
      antennaType: "fpc",
      band: "sub6",
      availableWidthMm: 15,
      availableHeightMm: 7
    });
    expect(result.verdict).toBe("danger");
    expect(result.shortfallWidthMm).toBeCloseTo(5, 10);
    expect(result.shortfallHeightMm).toBeCloseTo(1, 10);
  });

  it("returns caution when both sides are short but each is under 20%", () => {
    // spring 920MHz: 必要 30x12。W28(6.7%不足)・H11(8.3%不足) → 全ての不足辺が20%未満 → caution
    const result = judgeKeepout({
      antennaType: "spring",
      band: "band920",
      availableWidthMm: 28,
      availableHeightMm: 11
    });
    expect(result.verdict).toBe("caution");
  });

  it("never returns -0 for the shortfalls (oversized area)", () => {
    const result = judgeKeepout({
      antennaType: "chip",
      band: "band2400",
      availableWidthMm: 30,
      availableHeightMm: 20
    });
    expect(Object.is(result.shortfallWidthMm, -0)).toBe(false);
    expect(Object.is(result.shortfallHeightMm, -0)).toBe(false);
    expect(result.verdict).toBe("success");
  });

  it("mirrors the data table for every type x band", () => {
    for (const [type, byBand] of Object.entries(KEEPOUT_REQUIREMENTS)) {
      for (const [band, req] of Object.entries(byBand)) {
        const result = judgeKeepout({
          antennaType: type as keyof typeof KEEPOUT_REQUIREMENTS,
          band: band as keyof typeof byBand,
          availableWidthMm: req.widthMm,
          availableHeightMm: req.heightMm
        });
        expect(result.requiredWidthMm).toBe(req.widthMm);
        expect(result.requiredHeightMm).toBe(req.heightMm);
        expect(result.verdict).toBe("success");
      }
    }
  });

  it("guards non-positive and non-finite available dimensions", () => {
    expect(() =>
      judgeKeepout({ antennaType: "chip", band: "band2400", availableWidthMm: 0, availableHeightMm: 4 })
    ).toThrowError(RfError);
    expect(() =>
      judgeKeepout({ antennaType: "chip", band: "band2400", availableWidthMm: -1, availableHeightMm: 4 })
    ).toThrowError(RfError);
    expect(() =>
      judgeKeepout({
        antennaType: "chip",
        band: "band2400",
        availableWidthMm: 10,
        availableHeightMm: Number.NaN
      })
    ).toThrowError(RfError);
  });
});
