import {
  defaultLinkBudgetInput,
  type DistanceUnit,
  type LinkBudgetInput
} from "./linkBudget";

/**
 * 入力条件をURLクエリ・localStorageへ保存し、共有リンクとして復元するための
 * シリアライズ/サニタイズ処理。外部から渡される値（URL・保存値）は信頼できないため、
 * 必ず sanitizeInput を通して既定値とマージし、不正値を除去する。
 */

const STORAGE_KEY = "rf-basic-link-calculator:input";

// URLを短く保つための短縮キー。値はLinkBudgetInputのキーに対応する。
const QUERY_KEYS = {
  system: "sys",
  frequencyMHz: "f",
  distance: "d",
  distanceUnit: "du",
  txPowerDbm: "tx",
  txAntennaGainDbi: "tg",
  rxAntennaGainDbi: "rg",
  cableLossDb: "cl",
  environmentLossDb: "el",
  receiverSensitivityDbm: "rs"
} as const;

function toFiniteNumber(value: unknown, fallback: number): number {
  // 空文字や空白は Number("") === 0 になってしまうため、欠損として扱う。
  if (value === null || value === undefined || (typeof value === "string" && value.trim() === "")) {
    return fallback;
  }

  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toDistanceUnit(value: unknown): DistanceUnit {
  return value === "m" || value === "km" ? value : defaultLinkBudgetInput.distanceUnit;
}

function toSystem(value: unknown): string {
  return typeof value === "string" && value.trim() ? value : defaultLinkBudgetInput.system;
}

/**
 * 任意の入力（部分オブジェクト・URL由来・localStorage由来）を既定値とマージし、
 * すべてのフィールドが有効な型・有限値になったLinkBudgetInputを返す。
 */
export function sanitizeInput(raw: Partial<Record<keyof LinkBudgetInput, unknown>>): LinkBudgetInput {
  return {
    system: toSystem(raw.system),
    frequencyMHz: toFiniteNumber(raw.frequencyMHz, defaultLinkBudgetInput.frequencyMHz),
    distance: toFiniteNumber(raw.distance, defaultLinkBudgetInput.distance),
    distanceUnit: toDistanceUnit(raw.distanceUnit),
    txPowerDbm: toFiniteNumber(raw.txPowerDbm, defaultLinkBudgetInput.txPowerDbm),
    txAntennaGainDbi: toFiniteNumber(raw.txAntennaGainDbi, defaultLinkBudgetInput.txAntennaGainDbi),
    rxAntennaGainDbi: toFiniteNumber(raw.rxAntennaGainDbi, defaultLinkBudgetInput.rxAntennaGainDbi),
    cableLossDb: toFiniteNumber(raw.cableLossDb, defaultLinkBudgetInput.cableLossDb),
    environmentLossDb: toFiniteNumber(raw.environmentLossDb, defaultLinkBudgetInput.environmentLossDb),
    receiverSensitivityDbm: toFiniteNumber(
      raw.receiverSensitivityDbm,
      defaultLinkBudgetInput.receiverSensitivityDbm
    )
  };
}

/** 入力が既定値と完全に一致するか。既定状態ではURL・保存をクリーンに保つために使う。 */
export function isDefaultInput(input: LinkBudgetInput): boolean {
  return (Object.keys(defaultLinkBudgetInput) as Array<keyof LinkBudgetInput>).every(
    (key) => input[key] === defaultLinkBudgetInput[key]
  );
}

export function encodeInputToQuery(input: LinkBudgetInput): string {
  const params = new URLSearchParams();
  params.set(QUERY_KEYS.system, input.system);
  params.set(QUERY_KEYS.frequencyMHz, String(input.frequencyMHz));
  params.set(QUERY_KEYS.distance, String(input.distance));
  params.set(QUERY_KEYS.distanceUnit, input.distanceUnit);
  params.set(QUERY_KEYS.txPowerDbm, String(input.txPowerDbm));
  params.set(QUERY_KEYS.txAntennaGainDbi, String(input.txAntennaGainDbi));
  params.set(QUERY_KEYS.rxAntennaGainDbi, String(input.rxAntennaGainDbi));
  params.set(QUERY_KEYS.cableLossDb, String(input.cableLossDb));
  params.set(QUERY_KEYS.environmentLossDb, String(input.environmentLossDb));
  params.set(QUERY_KEYS.receiverSensitivityDbm, String(input.receiverSensitivityDbm));
  return params.toString();
}

/**
 * URLクエリ文字列から入力条件を復元する。共有リンクに含まれるキーが
 * 1つも無い場合は null（＝共有リンクではない）を返す。
 */
export function decodeInputFromQuery(query: string): LinkBudgetInput | null {
  const params = new URLSearchParams(query);
  const hasSharedInput = Object.values(QUERY_KEYS).some((key) => params.has(key));
  if (!hasSharedInput) {
    return null;
  }

  return sanitizeInput({
    system: params.get(QUERY_KEYS.system) ?? undefined,
    frequencyMHz: params.get(QUERY_KEYS.frequencyMHz) ?? undefined,
    distance: params.get(QUERY_KEYS.distance) ?? undefined,
    distanceUnit: params.get(QUERY_KEYS.distanceUnit) ?? undefined,
    txPowerDbm: params.get(QUERY_KEYS.txPowerDbm) ?? undefined,
    txAntennaGainDbi: params.get(QUERY_KEYS.txAntennaGainDbi) ?? undefined,
    rxAntennaGainDbi: params.get(QUERY_KEYS.rxAntennaGainDbi) ?? undefined,
    cableLossDb: params.get(QUERY_KEYS.cableLossDb) ?? undefined,
    environmentLossDb: params.get(QUERY_KEYS.environmentLossDb) ?? undefined,
    receiverSensitivityDbm: params.get(QUERY_KEYS.receiverSensitivityDbm) ?? undefined
  });
}

/** 現在のURL（origin + path）に共有用クエリを付けた絶対URLを返す。 */
export function buildShareUrl(input: LinkBudgetInput, baseUrl: string): string {
  const query = encodeInputToQuery(input);
  const [path] = baseUrl.split("?");
  return `${path}?${query}`;
}

export function loadStoredInput(): LinkBudgetInput | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }

    return sanitizeInput(JSON.parse(raw) as Partial<Record<keyof LinkBudgetInput, unknown>>);
  } catch {
    return null;
  }
}

export function saveStoredInput(input: LinkBudgetInput): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(input));
  } catch {
    // localStorageが使えない環境では保存をスキップする。
  }
}

export function clearStoredInput(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // 失敗しても致命的ではないため無視する。
  }
}
