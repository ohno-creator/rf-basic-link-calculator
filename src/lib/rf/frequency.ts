import { assertPositiveFinite } from "./errors";

export const SPEED_OF_LIGHT_M_PER_S = 299_792_458;

export function calculateWavelength(frequencyHz: number): number {
  assertPositiveFinite(frequencyHz, "frequency");
  return SPEED_OF_LIGHT_M_PER_S / frequencyHz;
}

export function calculateWavelengthFromMHz(frequencyMHz: number): number {
  assertPositiveFinite(frequencyMHz, "frequency");
  return calculateWavelength(frequencyMHz * 1_000_000);
}

export function calculateWavelengthFractions(frequencyMHz: number): {
  wavelengthM: number;
  halfM: number;
  quarterM: number;
  eighthM: number;
} {
  const wavelengthM = calculateWavelengthFromMHz(frequencyMHz);

  return {
    wavelengthM,
    halfM: wavelengthM / 2,
    quarterM: wavelengthM / 4,
    eighthM: wavelengthM / 8
  };
}
