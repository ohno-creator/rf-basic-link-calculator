import { describe, expect, it } from "vitest";
import {
  applyMeasuredCorrectionDb,
  calculateNcuFieldAnalysis,
  calculateNcuBelowGround,
  calculateNcuRadioMetricsDiagnosis,
  defaultNcuFieldMeasurements,
  defaultNcuBelowGroundInput,
  defaultNcuRadioMetrics,
  type NcuBelowGroundInput
} from "@/lib/rf/ncuBelowGround";

const baseInput: NcuBelowGroundInput = {
  ...defaultNcuBelowGroundInput,
  distance: 300,
  distanceUnit: "m",
  coverMaterial: "resin",
  boxMaterial: "resin",
  moistureCondition: "dry",
  antennaPosition: "near_lid",
  openingCondition: "open",
  surfaceObstruction: "none",
  depthBelowGroundM: 0.2,
  measuredCorrectionDb: 0
};

describe("NCU below-ground calculator", () => {
  it("calculates outdoor path loss, BOX loss range and link margin range", () => {
    const result = calculateNcuBelowGround(baseInput);

    expect(result.distanceM).toBeCloseTo(300, 6);
    expect(result.outdoorPathLossDb).toBeGreaterThan(90);
    expect(result.belowGroundLossRangeDb.typical).toBeGreaterThan(result.belowGroundLossRangeDb.min);
    expect(result.totalLossRangeDb.max).toBeGreaterThan(result.totalLossRangeDb.min);
    expect(result.linkMarginRangeDb.max).toBeGreaterThan(result.linkMarginRangeDb.min);
    expect(result.warnings.some((warning) => warning.id === "not-negative-height")).toBe(true);
  });

  it("worsens the margin when a metal cover, water and bottom placement are selected", () => {
    const favorable = calculateNcuBelowGround(baseInput);
    const severe = calculateNcuBelowGround({
      ...baseInput,
      coverMaterial: "cast_iron",
      moistureCondition: "standing_water",
      antennaPosition: "bottom",
      openingCondition: "metal_frame",
      surfaceObstruction: "parked_vehicle"
    });

    expect(severe.belowGroundLossRangeDb.typical).toBeGreaterThan(
      favorable.belowGroundLossRangeDb.typical + 50
    );
    expect(severe.linkMarginRangeDb.typical).toBeLessThan(favorable.linkMarginRangeDb.typical - 50);
    expect(severe.warnings.some((warning) => warning.id === "metal-cover")).toBe(true);
    expect(severe.warnings.some((warning) => warning.id === "moisture")).toBe(true);
  });

  it("treats below-ground depth as additional loss instead of negative antenna height", () => {
    const shallow = calculateNcuBelowGround({ ...baseInput, depthBelowGroundM: 0.1 });
    const deep = calculateNcuBelowGround({ ...baseInput, depthBelowGroundM: 1.2 });

    expect(deep.belowGroundLossRangeDb.typical).toBeGreaterThan(shallow.belowGroundLossRangeDb.typical);
    expect(deep.warnings.some((warning) => warning.id === "deep-installation")).toBe(true);
    expect(deep.warnings.find((warning) => warning.id === "not-negative-height")?.message).toContain(
      "マイナス値"
    );
  });

  it("applies measured correction directly to received power and margin", () => {
    const withoutCorrection = calculateNcuBelowGround(baseInput);
    const withCorrection = calculateNcuBelowGround({ ...baseInput, measuredCorrectionDb: 8 });

    expect(withCorrection.receivedPowerRangeDbm.typical).toBeCloseTo(
      withoutCorrection.receivedPowerRangeDbm.typical + 8,
      6
    );
    expect(withCorrection.linkMarginRangeDb.typical).toBeCloseTo(
      withoutCorrection.linkMarginRangeDb.typical + 8,
      6
    );
    expect(withCorrection.warnings.some((warning) => warning.id === "missing-measurement")).toBe(false);
  });

  it("adds the recommended field correction to the current correction", () => {
    expect(applyMeasuredCorrectionDb(8, -3.5)).toBeCloseTo(4.5, 8);
    expect(applyMeasuredCorrectionDb(-6, 2)).toBeCloseTo(-4, 8);
  });

  it("makes the recommended correction approximately zero after applying it once", () => {
    const initialResult = calculateNcuBelowGround(baseInput);
    const measurements = {
      ...defaultNcuFieldMeasurements,
      boxClosedDryDbm: initialResult.receivedPowerRangeDbm.typical - 6
    };
    const initialAnalysis = calculateNcuFieldAnalysis(
      measurements,
      initialResult.receivedPowerRangeDbm.typical
    );
    const appliedCorrectionDb = Number(
      applyMeasuredCorrectionDb(
        baseInput.measuredCorrectionDb,
        initialAnalysis.recommendedCorrectionDb
      ).toFixed(1)
    );
    const correctedResult = calculateNcuBelowGround({
      ...baseInput,
      measuredCorrectionDb: appliedCorrectionDb
    });
    const correctedAnalysis = calculateNcuFieldAnalysis(
      measurements,
      correctedResult.receivedPowerRangeDbm.typical
    );

    expect(appliedCorrectionDb).toBeCloseTo(-6, 6);
    expect(correctedAnalysis.recommendedCorrectionDb).toBeCloseTo(0, 6);
  });

  it("ranks field-analysis causes from RSSI differences", () => {
    const analysis = calculateNcuFieldAnalysis(
      {
        ...defaultNcuFieldMeasurements,
        outsideBoxDbm: -90,
        boxOpenDbm: -98,
        boxClosedDryDbm: -122,
        boxClosedWetDbm: -128,
        antennaImprovedDbm: -111,
        vehicleCoveredDbm: -136,
        nearbyShiftedDbm: -115
      },
      -116
    );

    expect(analysis.primaryFinding.id).toBe("cover");
    expect(analysis.findings.find((finding) => finding.id === "cover")?.valueDb).toBeCloseTo(24, 6);
    expect(analysis.findings.find((finding) => finding.id === "vehicle")?.valueDb).toBeCloseTo(14, 6);
    expect(analysis.recommendedCorrectionDb).toBeCloseTo(-6, 6);
  });

  it("flags measurement contradictions in field analysis", () => {
    const analysis = calculateNcuFieldAnalysis(
      {
        ...defaultNcuFieldMeasurements,
        boxOpenDbm: -110,
        boxClosedDryDbm: -102,
        boxClosedWetDbm: -96
      },
      -103
    );

    expect(analysis.measurementQualityNotes.join(" ")).toContain("蓋閉め時の方が蓋開け時より3dB以上");
    expect(analysis.measurementQualityNotes.join(" ")).toContain("湿潤時の方が乾燥時より3dB以上");
  });

  it("diagnoses weak received power from RSRP/RSSI metrics", () => {
    const diagnosis = calculateNcuRadioMetricsDiagnosis({
      ...defaultNcuRadioMetrics,
      rsrpDbm: -121,
      rssiDbm: -106,
      rsrqDb: -8,
      sinrDb: 12,
      packetSuccessPercent: 99,
      retryCount: 0
    });

    expect(diagnosis.dominantCategory).toBe("power");
    expect(diagnosis.overallSeverity).toBe("poor");
    expect(diagnosis.summary).toContain("受信電力不足");
    expect(diagnosis.items.find((item) => item.id === "rsrpDbm")?.severity).toBe("poor");
  });

  it("diagnoses interference or quality problems when RSRQ and SINR are poor", () => {
    const diagnosis = calculateNcuRadioMetricsDiagnosis({
      ...defaultNcuRadioMetrics,
      rsrpDbm: -92,
      rssiDbm: -82,
      rsrqDb: -17,
      sinrDb: -2,
      packetSuccessPercent: 96,
      retryCount: 1
    });

    expect(diagnosis.dominantCategory).toBe("quality");
    expect(diagnosis.summary).toContain("品質・干渉側");
    expect(diagnosis.items.find((item) => item.id === "rsrqDb")?.severity).toBe("poor");
    expect(diagnosis.items.find((item) => item.id === "sinrDb")?.severity).toBe("poor");
  });

  it("diagnoses reliability problems from packet success and retry count", () => {
    const diagnosis = calculateNcuRadioMetricsDiagnosis({
      rsrpDbm: -90,
      rssiDbm: null,
      rsrqDb: -9,
      sinrDb: 11,
      snrDb: null,
      packetSuccessPercent: 82,
      retryCount: 6
    });

    expect(diagnosis.dominantCategory).toBe("reliability");
    expect(diagnosis.summary).toContain("実通信成功率側");
    expect(diagnosis.items.find((item) => item.id === "packetSuccessPercent")?.severity).toBe("poor");
    expect(diagnosis.items.find((item) => item.id === "retryCount")?.severity).toBe("poor");
  });
});
