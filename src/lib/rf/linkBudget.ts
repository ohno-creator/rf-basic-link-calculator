import { calculateFsplDb } from "./fspl";
import { judgeLinkMargin, type LinkJudgement } from "./judgement";

export type DistanceUnit = "m" | "km";

export type LinkBudgetInput = {
  system: string;
  frequencyMHz: number;
  distance: number;
  distanceUnit: DistanceUnit;
  txPowerDbm: number;
  txAntennaGainDbi: number;
  rxAntennaGainDbi: number;
  cableLossDb: number;
  environmentLossDb: number;
  receiverSensitivityDbm: number;
};

export type LinkBudgetResult = {
  distanceKm: number;
  fsplDb: number;
  receivedPowerDbm: number;
  linkMarginDb: number;
  judgement: LinkJudgement;
};

export type ValidationErrors = Partial<Record<keyof LinkBudgetInput, string>>;

// 初期表示はLoRa（920MHz LPWA）プリセットを既定にする。
// quickStartPresets の "lpwa-920" と同じ値（循環import回避のためここでは値を直書き）。
export const defaultLinkBudgetInput: LinkBudgetInput = {
  system: "LoRa / LoRaWAN",
  frequencyMHz: 920,
  distance: 1,
  distanceUnit: "km",
  txPowerDbm: 13,
  txAntennaGainDbi: -6,
  rxAntennaGainDbi: -6,
  cableLossDb: 1,
  environmentLossDb: 0,
  receiverSensitivityDbm: -120
};

export function normalizeDistanceKm(distance: number, unit: DistanceUnit): number {
  if (unit === "m") {
    return distance / 1000;
  }

  return distance;
}

function isMissingNumber(value: number) {
  return !Number.isFinite(value);
}

export function validateLinkBudgetInput(input: LinkBudgetInput): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!input.system.trim()) {
    errors.system = "通信方式を選択してください。";
  }

  if (isMissingNumber(input.frequencyMHz) || input.frequencyMHz <= 0) {
    errors.frequencyMHz = "周波数は0より大きい値をMHzで入力してください。";
  } else if (input.frequencyMHz > 1_000_000) {
    errors.frequencyMHz = "周波数が大きすぎます。MHz単位で入力してください。";
  }

  if (isMissingNumber(input.distance) || input.distance <= 0) {
    errors.distance = "距離は0より大きい値を入力してください。";
  } else if (normalizeDistanceKm(input.distance, input.distanceUnit) > 1_000_000) {
    errors.distance = "距離が大きすぎます。初期検討に適した範囲で入力してください。";
  }

  if (isMissingNumber(input.txPowerDbm)) {
    errors.txPowerDbm = "送信出力をdBmで入力してください。";
  }

  if (isMissingNumber(input.txAntennaGainDbi)) {
    errors.txAntennaGainDbi = "送信アンテナ利得をdBiで入力してください。";
  }

  if (isMissingNumber(input.rxAntennaGainDbi)) {
    errors.rxAntennaGainDbi = "受信アンテナ利得をdBiで入力してください。";
  }

  if (isMissingNumber(input.cableLossDb) || input.cableLossDb < 0) {
    errors.cableLossDb = "ケーブル・コネクタ損失は0以上の値を入力してください。";
  }

  if (isMissingNumber(input.environmentLossDb) || input.environmentLossDb < 0) {
    errors.environmentLossDb = "環境補正損失は0以上の値を入力してください。";
  }

  if (isMissingNumber(input.receiverSensitivityDbm)) {
    errors.receiverSensitivityDbm = "受信感度をdBmで入力してください。";
  }

  return errors;
}

export function hasValidationErrors(errors: ValidationErrors): boolean {
  return Object.keys(errors).length > 0;
}

export function calculateReceivedPowerDbm(input: {
  txPowerDbm: number;
  txAntennaGainDbi: number;
  rxAntennaGainDbi: number;
  fsplDb: number;
  cableLossDb: number;
  environmentLossDb: number;
}): number {
  return (
    input.txPowerDbm +
    input.txAntennaGainDbi +
    input.rxAntennaGainDbi -
    input.fsplDb -
    input.cableLossDb -
    input.environmentLossDb
  );
}

export function calculateLinkMarginDb(
  receivedPowerDbm: number,
  receiverSensitivityDbm: number
): number {
  if (!Number.isFinite(receivedPowerDbm) || !Number.isFinite(receiverSensitivityDbm)) {
    throw new Error("受信電力または受信感度を計算できません。");
  }

  return receivedPowerDbm - receiverSensitivityDbm;
}

export function calculateLinkBudget(input: LinkBudgetInput): LinkBudgetResult {
  const errors = validateLinkBudgetInput(input);
  if (hasValidationErrors(errors)) {
    throw new Error(Object.values(errors)[0]);
  }

  const distanceKm = normalizeDistanceKm(input.distance, input.distanceUnit);
  const fsplDb = calculateFsplDb(input.frequencyMHz, distanceKm);
  const receivedPowerDbm = calculateReceivedPowerDbm({
    txPowerDbm: input.txPowerDbm,
    txAntennaGainDbi: input.txAntennaGainDbi,
    rxAntennaGainDbi: input.rxAntennaGainDbi,
    fsplDb,
    cableLossDb: input.cableLossDb,
    environmentLossDb: input.environmentLossDb
  });
  const linkMarginDb = calculateLinkMarginDb(
    receivedPowerDbm,
    input.receiverSensitivityDbm
  );

  return {
    distanceKm,
    fsplDb,
    receivedPowerDbm,
    linkMarginDb,
    judgement: judgeLinkMargin(linkMarginDb)
  };
}

export function buildConsultationText(input: LinkBudgetInput, result: LinkBudgetResult): string {
  return `通信距離・リンクバジェット簡易診断を行ったところ、以下の条件となりました。
アンテナ選定および実機評価について相談したく、ご連絡いたしました。

通信方式：${input.system}
周波数：${input.frequencyMHz} MHz
距離：${input.distance} ${input.distanceUnit}
送信出力：${input.txPowerDbm} dBm
送信アンテナ利得：${input.txAntennaGainDbi} dBi
受信アンテナ利得：${input.rxAntennaGainDbi} dBi
ケーブル損失：${input.cableLossDb} dB
環境補正損失：${input.environmentLossDb} dB
受信感度：${input.receiverSensitivityDbm} dBm
推定受信電力：${result.receivedPowerDbm.toFixed(1)} dBm
リンクマージン：${result.linkMarginDb.toFixed(1)} dB
判定：${result.judgement.label}
相談したい内容：`;
}
