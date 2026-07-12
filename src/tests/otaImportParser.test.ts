import { describe, expect, it } from "vitest";
import { parseOtaImport } from "@/lib/rf/otaImportParser";

describe("otaImportParser", () => {
  it("successfully parses valid comma-separated and tab-separated inputs", () => {
    const csvInput = `
Band,Pc,Sc,η,TRP,TIS
B1,23,-108,-3,20,-105
B8,23,-108,-3,19,-101
    `;

    const result = parseOtaImport(csvInput);
    expect(result.success).toBe(true);
    expect(result.errors.length).toBe(0);
    expect(result.data.length).toBe(2);

    expect(result.data[0]).toEqual({
      label: "B1",
      conductedPowerDbm: 23,
      conductedSensitivityDbm: -108,
      antennaEfficiencyDb: -3,
      trpDbm: 20,
      tisDbm: -105
    });

    expect(result.data[1]).toEqual({
      label: "B8",
      conductedPowerDbm: 23,
      conductedSensitivityDbm: -108,
      antennaEfficiencyDb: -3,
      trpDbm: 19,
      tisDbm: -101
    });

    // Tab-separated
    const tsvInput = "Band\tPc\tSc\tη\tTRP\tTIS\nB3\t22.5\t-107.5\t-2.5\t19.5\t-104.5";
    const tsvResult = parseOtaImport(tsvInput);
    expect(tsvResult.success).toBe(true);
    expect(tsvResult.data[0].label).toBe("B3");
    expect(tsvResult.data[0].conductedPowerDbm).toBe(22.5);
    expect(tsvResult.data[0].conductedSensitivityDbm).toBe(-107.5);
    expect(tsvResult.data[0].antennaEfficiencyDb).toBe(-2.5);
    expect(tsvResult.data[0].trpDbm).toBe(19.5);
    expect(tsvResult.data[0].tisDbm).toBe(-104.5);
  });

  it("handles empty lines and skips headers properly", () => {
    const input = `
    
    
B1,23,-108,-3,20,-105

    `;
    const result = parseOtaImport(input);
    expect(result.success).toBe(true);
    expect(result.data.length).toBe(1);
    expect(result.data[0].label).toBe("B1");
  });

  it("reports line-by-line validation errors with line numbers", () => {
    const input = `Band,Pc,Sc,η,TRP,TIS
B1,abc,-108,-3,20,-105
B2,23,-108,1.5,20,-105
B3,23
`;
    const result = parseOtaImport(input);
    expect(result.success).toBe(false);
    expect(result.errors.length).toBe(3);
    expect(result.errors[0]).toContain("行 2: 伝導出力 Pc が数値ではありません");
    expect(result.errors[1]).toContain("行 3: 放射効率 η は 0dB 以下である必要があります");
    expect(result.errors[2]).toContain("行 4: 6列のデータ");
  });

  it("does not silently treat an invalid first data row as a header", () => {
    const result = parseOtaImport("B9,abc,-108,-3,20,-105");
    expect(result.success).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toContain("行 1: 伝導出力 Pc が数値ではありません");
  });

  it("does not skip a band label merely containing the word band", () => {
    const result = parseOtaImport("Band,Pc,Sc,η,TRP,TIS\nBroadband-1,23,-108,-3,20,-105");
    expect(result.success).toBe(true);
    expect(result.data[0].label).toBe("Broadband-1");
  });
});
