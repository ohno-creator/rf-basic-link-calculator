import { calculateFsplDb } from "./fspl";
import { judgeLinkMargin, type LinkJudgement } from "./judgement";

export type SimpleDistanceUnit = "m" | "km";

export type SimpleLinkBudgetInput = {
  frequencyMHz: number;
  distance: number;
  distanceUnit: SimpleDistanceUnit;
  txPowerDbm: number;
  antennaGainTotalDbi: number;
  extraLossDb: number;
  receiverSensitivityDbm: number;
};

export type SimpleLinkBudgetResult = {
  distanceKm: number;
  fsplDb: number;
  receivedPowerDbm: number;
  linkMarginDb: number;
  judgement: LinkJudgement;
};

function assertFinite(value: number, label: string) {
  if (!Number.isFinite(value)) {
    throw new Error(`${label}を数値で入力してください。`);
  }
}

function assertPositive(value: number, label: string) {
  assertFinite(value, label);
  if (value <= 0) {
    throw new Error(`${label}は0より大きい値を入力してください。`);
  }
}

function assertNonNegative(value: number, label: string) {
  assertFinite(value, label);
  if (value < 0) {
    throw new Error(`${label}は0以上の値を入力してください。`);
  }
}

function normalizeDistanceKm(distance: number, unit: SimpleDistanceUnit): number {
  return unit === "m" ? distance / 1000 : distance;
}

export function calculateSimpleLinkBudget(input: SimpleLinkBudgetInput): SimpleLinkBudgetResult {
  assertPositive(input.frequencyMHz, "周波数");
  assertPositive(input.distance, "通信距離");
  assertFinite(input.txPowerDbm, "送信電力");
  assertFinite(input.antennaGainTotalDbi, "アンテナ利得");
  assertNonNegative(input.extraLossDb, "追加損失");
  assertFinite(input.receiverSensitivityDbm, "受信感度");

  const distanceKm = normalizeDistanceKm(input.distance, input.distanceUnit);
  const fsplDb = calculateFsplDb(input.frequencyMHz, distanceKm);
  const receivedPowerDbm =
    input.txPowerDbm + input.antennaGainTotalDbi - fsplDb - input.extraLossDb;
  const linkMarginDb = receivedPowerDbm - input.receiverSensitivityDbm;

  return {
    distanceKm,
    fsplDb,
    receivedPowerDbm,
    linkMarginDb,
    judgement: judgeLinkMargin(linkMarginDb)
  };
}
