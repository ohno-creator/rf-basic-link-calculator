import { RfError, RfErrorCode } from "./errors";

const MAX_FREQUENCY_MHZ = 1_000_000;
const MAX_DISTANCE_KM = 1_000_000;

function assertReasonablePositive(value: number, field: string, max: number) {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RfError(RfErrorCode.NonPositive, { field });
  }

  if (value > max) {
    throw new RfError(RfErrorCode.TooLarge, { field, max });
  }
}

export function calculateFsplDb(frequencyMHz: number, distanceKm: number): number {
  assertReasonablePositive(frequencyMHz, "frequency", MAX_FREQUENCY_MHZ);
  assertReasonablePositive(distanceKm, "distance", MAX_DISTANCE_KM);

  return 32.44 + 20 * Math.log10(distanceKm) + 20 * Math.log10(frequencyMHz);
}
