const MAX_FREQUENCY_MHZ = 1_000_000;
const MAX_DISTANCE_KM = 1_000_000;

function assertReasonablePositive(value: number, label: string, max: number) {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${label}は0より大きい値を入力してください。`);
  }

  if (value > max) {
    throw new Error(`${label}が大きすぎます。初期検討に適した範囲で入力してください。`);
  }
}

export function calculateFsplDb(frequencyMHz: number, distanceKm: number): number {
  assertReasonablePositive(frequencyMHz, "周波数", MAX_FREQUENCY_MHZ);
  assertReasonablePositive(distanceKm, "距離", MAX_DISTANCE_KM);

  return 32.44 + 20 * Math.log10(distanceKm) + 20 * Math.log10(frequencyMHz);
}
