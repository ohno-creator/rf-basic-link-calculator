import { assertFinite, assertNonNegative, assertPositiveFinite } from "./errors";
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

function normalizeDistanceKm(distance: number, unit: SimpleDistanceUnit): number {
  return unit === "m" ? distance / 1000 : distance;
}

export function calculateSimpleLinkBudget(input: SimpleLinkBudgetInput): SimpleLinkBudgetResult {
  assertPositiveFinite(input.frequencyMHz, "frequency");
  assertPositiveFinite(input.distance, "distance");
  assertFinite(input.txPowerDbm, "tx_power");
  assertFinite(input.antennaGainTotalDbi, "antenna_gain");
  assertNonNegative(input.extraLossDb, "extra_loss");
  assertFinite(input.receiverSensitivityDbm, "sensitivity");

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
