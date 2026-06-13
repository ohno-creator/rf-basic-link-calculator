export function formatNumber(value: number, digits = 1): string {
  if (!Number.isFinite(value)) {
    return "-";
  }

  return value.toFixed(digits);
}

export function formatSigned(value: number, unit: string, digits = 1): string {
  if (!Number.isFinite(value)) {
    return `- ${unit}`;
  }

  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(digits)} ${unit}`;
}

export function formatDb(value: number, digits = 1): string {
  return `${formatNumber(value, digits)} dB`;
}

export function formatDbm(value: number, digits = 1): string {
  return `${formatNumber(value, digits)} dBm`;
}

export function formatMeters(valueM: number): string {
  if (!Number.isFinite(valueM)) {
    return "-";
  }

  if (valueM >= 1) {
    return `${valueM.toFixed(2)}m`;
  }

  return `${(valueM * 100).toFixed(1)}cm`;
}
