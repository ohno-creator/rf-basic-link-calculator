import { dbToDistanceRatio } from "./db";
import { assertFinite, RfError, RfErrorCode } from "./errors";

export type RequirementVerdict = "pass" | "caution" | "fail";

export function classifyRequirementMargin(marginDb: number): RequirementVerdict {
  assertFinite(marginDb, "requirement_margin");
  return marginDb < 0 ? "fail" : marginDb < 2 ? "caution" : "pass";
}

export function trpRequirementMargin(measuredDbm: number, minimumDbm: number): number {
  assertFinite(measuredDbm, "trp");
  assertFinite(minimumDbm, "trp_requirement");
  return measuredDbm - minimumDbm;
}

export function tisRequirementMargin(measuredDbm: number, maximumDbm: number): number {
  assertFinite(measuredDbm, "tis");
  assertFinite(maximumDbm, "tis_requirement");
  // TISは小さいほど良いため、要求上限−実測を余裕とする。
  return maximumDbm - measuredDbm;
}

export function desenseDistanceImpact(desenseDb: number, pathLossExponent: 2 | 3 | 4) {
  assertFinite(desenseDb, "desense");
  if (desenseDb < 0) throw new RfError(RfErrorCode.TooSmall, { field: "desense", min: 0 });
  // Pr∝d^-n より距離比=10^(-desense/(10n))。n=2は既存の自由空間変換を再利用する。
  const distanceRatio = pathLossExponent === 2
    ? dbToDistanceRatio(-desenseDb)
    : 10 ** (-desenseDb / (10 * pathLossExponent));
  return { distanceRatio, distanceReductionPercent: (1 - distanceRatio) * 100 };
}

export type OtaImportRow = {
  band: string;
  conductedPowerDbm: number;
  conductedSensitivityDbm: number;
  antennaEfficiencyDb: number;
  trpDbm: number;
  tisDbm: number;
};

export function parseOtaMeasurementRows(text: string): { rows: OtaImportRow[]; errors: string[] } {
  const rows: OtaImportRow[] = [];
  const errors: string[] = [];
  text.split(/\r?\n/).forEach((raw, index) => {
    const line = raw.trim();
    if (!line) return;
    const columns = line.split(line.includes("\t") ? "\t" : ",").map((value) => value.trim());
    if (index === 0 && /^(band|バンド)$/i.test(columns[0] ?? "")) return;
    if (columns.length !== 6) {
      errors.push(`${index + 1}行目: 6列で入力してください。`);
      return;
    }
    const values = columns.slice(1).map(Number);
    if (!columns[0] || values.some((value) => !Number.isFinite(value))) {
      errors.push(`${index + 1}行目: Band名と5つの数値を確認してください。`);
      return;
    }
    if (values[2] > 0) {
      errors.push(`${index + 1}行目: ηは0dB以下で入力してください。`);
      return;
    }
    rows.push({
      band: columns[0], conductedPowerDbm: values[0], conductedSensitivityDbm: values[1],
      antennaEfficiencyDb: values[2], trpDbm: values[3], tisDbm: values[4]
    });
  });
  return { rows, errors };
}
