export const SPEED_OF_LIGHT_M_PER_S = 299_792_458;

function assertPositiveFinite(value: number, label: string) {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${label}は0より大きい数値を入力してください。`);
  }
}

export function calculateWavelength(frequencyHz: number): number {
  assertPositiveFinite(frequencyHz, "周波数");
  return SPEED_OF_LIGHT_M_PER_S / frequencyHz;
}

export function calculateWavelengthFromMHz(frequencyMHz: number): number {
  assertPositiveFinite(frequencyMHz, "周波数");
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
