import { describe, expect, it } from "vitest";
import { judgeLinkMargin } from "@/lib/rf/judgement";
import { buildConsultationText, calculateLinkBudget, type LinkBudgetInput } from "@/lib/rf/linkBudget";

const baseInput: LinkBudgetInput = {
  system: "LTE-M / NB-IoT",
  linkType: "cellular_base_station_to_iot_terminal",
  propagationModel: "free_space",
  propagationArea: "urbanMedium",
  pathLossExponent: 3,
  iotCalibrationDistance: 1,
  iotCalibrationDistanceUnit: "km",
  iotMeasuredReceivedPowerDbm: -80,
  iotSlopeCorrectionDbPerDecade: 0,
  frequencyMHz: 800,
  distance: 1,
  distanceUnit: "km",
  txPowerDbm: 23,
  txAntennaGainDbi: -2,
  rxAntennaGainDbi: 0,
  txAntennaHeightM: 30,
  rxAntennaHeightM: 1.5,
  cableLossDb: 0.5,
  environmentLossDb: 10,
  groundProximityLossDb: 0,
  enclosureLossDb: 0,
  polarizationMismatchLossDb: 0,
  vehicleBodyObstructionLossDb: 0,
  installationMarginDb: 0,
  calibrationOffsetDb: 0,
  receiverSensitivityDbm: -105
};

describe("link budget calculations", () => {
  it("calculates received power and link margin", () => {
    const result = calculateLinkBudget(baseInput);

    expect(result.fsplDb).toBeCloseTo(90.5, 1);
    expect(result.receivedPowerDbm).toBeCloseTo(-80.0, 1);
    expect(result.linkMarginDb).toBeCloseTo(25.0, 1);
  });

  it("reduces margin when losses increase", () => {
    const base = calculateLinkBudget(baseInput);
    const worse = calculateLinkBudget({ ...baseInput, environmentLossDb: 20 });

    expect(worse.linkMarginDb).toBeLessThan(base.linkMarginDb);
  });

  it("reduces margin when near-terminal losses increase", () => {
    const base = calculateLinkBudget(baseInput);
    const worse = calculateLinkBudget({ ...baseInput, groundProximityLossDb: 4, enclosureLossDb: 6 });

    expect(worse.nearTerminalLossDb).toBeCloseTo(10, 6);
    expect(worse.linkMarginDb).toBeCloseTo(base.linkMarginDb - 10, 6);
  });

  it("increases margin when antenna gain improves", () => {
    const base = calculateLinkBudget(baseInput);
    const improved = calculateLinkBudget({
      ...baseInput,
      txAntennaGainDbi: baseInput.txAntennaGainDbi + 3
    });

    expect(improved.linkMarginDb).toBeCloseTo(base.linkMarginDb + 3, 6);
  });

  it("judges margins by the required thresholds", () => {
    expect(judgeLinkMargin(20).level).toBe("excellent");
    expect(judgeLinkMargin(10).level).toBe("good");
    expect(judgeLinkMargin(3).level).toBe("caution");
    expect(judgeLinkMargin(0).level).toBe("unstable");
    expect(judgeLinkMargin(-0.1).level).toBe("poor");
  });

  it("warns when Hata is used for low-height terminal links", () => {
    const result = calculateLinkBudget({
      ...baseInput,
      linkType: "terminal_to_terminal",
      propagationModel: "okumura_hata",
      txAntennaHeightM: 1,
      rxAntennaHeightM: 1
    });

    expect(result.warnings.some((warning) => warning.id === "low-terminal-hata")).toBe(true);
    expect(result.warnings.some((warning) => warning.id === "hata-out-of-range")).toBe(true);
  });

  it("does not show the Hata out-of-range warning when Hata inputs are inside the general range", () => {
    const result = calculateLinkBudget({
      ...baseInput,
      linkType: "cellular_base_station_to_iot_terminal",
      propagationModel: "okumura_hata",
      frequencyMHz: 920,
      distance: 1,
      distanceUnit: "km",
      txAntennaHeightM: 30,
      rxAntennaHeightM: 1.5
    });

    expect(result.warnings.some((warning) => warning.id === "hata-out-of-range")).toBe(false);
    expect(result.warnings.some((warning) => warning.id === "low-terminal-near-base")).toBe(true);
  });

  it("uses a gateway-specific Hata warning and reports the range issue details", () => {
    const result = calculateLinkBudget({
      ...baseInput,
      linkType: "gateway_to_low_height_terminal",
      propagationModel: "okumura_hata",
      frequencyMHz: 920,
      distance: 1,
      distanceUnit: "km",
      txAntennaHeightM: 10,
      rxAntennaHeightM: 1.5
    });
    const rangeWarning = result.warnings.find((warning) => warning.id === "hata-out-of-range");

    expect(result.communicationMode).toBe("gateway_to_low_height_terminal");
    expect(rangeWarning?.message).toContain("送信側空中線地上高 10.0m");
    expect(result.warnings.some((warning) => warning.id === "low-gateway-hata")).toBe(true);
    expect(result.warnings.some((warning) => warning.id === "low-terminal-hata")).toBe(false);
  });

  it("warns when two-ray is used before the breakpoint", () => {
    const result = calculateLinkBudget({
      ...baseInput,
      linkType: "terminal_to_terminal",
      propagationModel: "two_ray",
      frequencyMHz: 2400,
      distance: 10,
      distanceUnit: "m",
      txAntennaHeightM: 1.2,
      rxAntennaHeightM: 1.2
    });

    expect(result.warnings.some((warning) => warning.id === "two-ray-before-breakpoint")).toBe(true);
  });

  it("uses the configured log-distance exponent", () => {
    const lower = calculateLinkBudget({
      ...baseInput,
      propagationModel: "log_distance",
      pathLossExponent: 2.2
    });
    const higher = calculateLinkBudget({
      ...baseInput,
      propagationModel: "log_distance",
      pathLossExponent: 3.5
    });

    expect(higher.pathLossDb).toBeGreaterThan(lower.pathLossDb);
    expect(higher.warnings.some((warning) => warning.id === "log-distance-exponent")).toBe(true);
  });

  it("uses the configured Hata area correction", () => {
    const urban = calculateLinkBudget({
      ...baseInput,
      propagationModel: "okumura_hata",
      propagationArea: "urbanMedium"
    });
    const open = calculateLinkBudget({
      ...baseInput,
      propagationModel: "okumura_hata",
      propagationArea: "open"
    });

    expect(open.pathLossDb).toBeLessThan(urban.pathLossDb);
  });

  it("calibrates Hata to a measured IoT anchor point", () => {
    const reference = calculateLinkBudget({
      ...baseInput,
      propagationModel: "okumura_hata",
      propagationArea: "urbanMedium"
    });
    const measuredReceivedPowerDbm =
      baseInput.txPowerDbm +
      baseInput.txAntennaGainDbi +
      baseInput.rxAntennaGainDbi -
      reference.pathLossDb -
      baseInput.cableLossDb -
      baseInput.environmentLossDb -
      10;
    const calibrated = calculateLinkBudget({
      ...baseInput,
      propagationModel: "iot_hata_calibrated",
      iotCalibrationDistance: 1,
      iotCalibrationDistanceUnit: "km",
      iotMeasuredReceivedPowerDbm: measuredReceivedPowerDbm
    });

    expect(calibrated.iotCalibration?.modelOffsetDb).toBeCloseTo(10, 6);
    expect(calibrated.pathLossDb).toBeCloseTo(reference.pathLossDb + 10, 6);
    expect(calibrated.receivedPowerDbm).toBeCloseTo(measuredReceivedPowerDbm, 6);
  });

  it("applies the IoT Hata distance-slope correction around the anchor", () => {
    const withoutSlope = calculateLinkBudget({
      ...baseInput,
      distance: 10,
      propagationModel: "iot_hata_calibrated",
      iotCalibrationDistance: 1,
      iotCalibrationDistanceUnit: "km",
      iotSlopeCorrectionDbPerDecade: 0
    });
    const withSlope = calculateLinkBudget({
      ...baseInput,
      distance: 10,
      propagationModel: "iot_hata_calibrated",
      iotCalibrationDistance: 1,
      iotCalibrationDistanceUnit: "km",
      iotSlopeCorrectionDbPerDecade: 5
    });

    expect(withSlope.iotCalibration?.slopeCorrectionDb).toBeCloseTo(5, 6);
    expect(withSlope.pathLossDb).toBeCloseTo(withoutSlope.pathLossDb + 5, 6);
  });

  it("builds Japanese consultation text without internal link type ids", () => {
    const result = calculateLinkBudget(baseInput);
    const text = buildConsultationText(baseInput, result);

    expect(text).toContain("通信形態：携帯基地局 → IoT端末");
    expect(text).not.toContain("cellular_base_station_to_iot_terminal");
    expect(text).not.toContain("IoT実測アンカー距離");
  });

  it("includes IoT calibration details in consultation text only for calibrated Hata mode", () => {
    const input: LinkBudgetInput = {
      ...baseInput,
      propagationModel: "iot_hata_calibrated",
      iotCalibrationDistance: 500,
      iotCalibrationDistanceUnit: "m",
      iotMeasuredReceivedPowerDbm: -93,
      iotSlopeCorrectionDbPerDecade: 4
    };
    const result = calculateLinkBudget(input);
    const text = buildConsultationText(input, result);

    expect(text).toContain("伝搬モデル：IoT実測補正Hataモード");
    expect(text).toContain("Hataエリア種別：市街地（中小都市）");
    expect(text).toContain("IoT実測アンカー距離：500 m");
    expect(text).toContain("IoT距離勾配補正：4 dB/decade");
  });
});
