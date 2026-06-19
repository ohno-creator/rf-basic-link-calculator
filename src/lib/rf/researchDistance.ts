import { calculateFsplDb } from "./fspl";

export type ResearchDistanceModel =
  | "ci"
  | "dual_slope"
  | "tr38901_umi_los"
  | "tr38901_umi_nlos"
  | "tr38901_uma_los"
  | "tr38901_uma_nlos";

export type ReliabilityPercent = 50 | 80 | 90 | 95 | 99;

export type ResearchDistanceInput = {
  model: ResearchDistanceModel;
  frequencyGHz: number;
  txPowerDbm: number;
  txAntennaGainDbi: number;
  rxAntennaGainDbi: number;
  txAntennaHeightM: number;
  rxAntennaHeightM: number;
  receiverSensitivityDbm: number;
  cableLossDb: number;
  clutterLossDb: number;
  nearTerminalLossDb: number;
  calibrationOffsetDb: number;
  pathLossExponent: number;
  nearPathLossExponent: number;
  farPathLossExponent: number;
  breakpointM: number;
  shadowFadingStdDb: number;
  reliabilityPercent: ReliabilityPercent;
  fadeMarginDb: number;
  minDistanceM: number;
  maxDistanceKm: number;
};

export type ResearchDistanceWarning = {
  id: string;
  message: string;
};

export type ResearchDistanceResult = {
  maximumDistanceM: number | null;
  medianDistanceM: number | null;
  minimumDistanceM: number;
  searchLimitM: number;
  allowedMedianPathLossDb: number;
  medianAllowedPathLossDb: number;
  reliabilityMarginDb: number;
  extraLossDb: number;
  feasibleAtMinimumDistance: boolean;
  exceedsSearchLimit: boolean;
  modelPathLossAtMaximumDb: number | null;
  warnings: ResearchDistanceWarning[];
};

export type ResearchDistanceCurvePoint = {
  distanceM: number;
  distanceLabel: string;
  linkMarginDb: number;
  pathLossDb: number;
  current?: boolean;
};

export const defaultResearchDistanceInput: ResearchDistanceInput = {
  model: "ci",
  frequencyGHz: 0.92,
  txPowerDbm: 13,
  txAntennaGainDbi: -6,
  rxAntennaGainDbi: -6,
  txAntennaHeightM: 10,
  rxAntennaHeightM: 1.5,
  receiverSensitivityDbm: -120,
  cableLossDb: 1,
  clutterLossDb: 20,
  nearTerminalLossDb: 0,
  calibrationOffsetDb: 0,
  pathLossExponent: 3,
  nearPathLossExponent: 2.1,
  farPathLossExponent: 3.8,
  breakpointM: 150,
  shadowFadingStdDb: 7,
  reliabilityPercent: 90,
  fadeMarginDb: 3,
  minDistanceM: 1,
  maxDistanceKm: 20
};

const RELIABILITY_Z: Record<ReliabilityPercent, number> = {
  50: 0,
  80: 0.842,
  90: 1.282,
  95: 1.645,
  99: 2.326
};

const SPEED_OF_LIGHT_MPS = 299_792_458;

function log10(value: number): number {
  return Math.log10(value);
}

function clampPositive(value: number, fallback: number): number {
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function distanceLabel(distanceM: number): string {
  if (distanceM >= 1000) {
    return `${(distanceM / 1000).toFixed(distanceM >= 10_000 ? 0 : 1)}km`;
  }

  return `${distanceM.toFixed(distanceM >= 100 ? 0 : 1)}m`;
}

export function calculateReliabilityMarginDb(input: Pick<
  ResearchDistanceInput,
  "reliabilityPercent" | "shadowFadingStdDb" | "fadeMarginDb"
>): number {
  return RELIABILITY_Z[input.reliabilityPercent] * input.shadowFadingStdDb + input.fadeMarginDb;
}

export function calculateExtraLossDb(input: Pick<
  ResearchDistanceInput,
  "cableLossDb" | "clutterLossDb" | "nearTerminalLossDb"
>): number {
  return input.cableLossDb + input.clutterLossDb + input.nearTerminalLossDb;
}

export function calculateAllowedMedianPathLossDb(input: ResearchDistanceInput): number {
  return (
    input.txPowerDbm +
    input.txAntennaGainDbi +
    input.rxAntennaGainDbi -
    calculateExtraLossDb(input) +
    input.calibrationOffsetDb -
    input.receiverSensitivityDbm -
    calculateReliabilityMarginDb(input)
  );
}

function calculateCiPathLossDb(frequencyGHz: number, distanceM: number, pathLossExponent: number): number {
  const referenceLossDb = calculateFsplDb(frequencyGHz * 1000, 0.001);
  const effectiveDistanceM = Math.max(1, distanceM);

  return referenceLossDb + 10 * pathLossExponent * log10(effectiveDistanceM);
}

function calculateDualSlopePathLossDb(input: ResearchDistanceInput, distanceM: number): number {
  const breakpointM = clampPositive(input.breakpointM, defaultResearchDistanceInput.breakpointM);
  const effectiveDistanceM = Math.max(1, distanceM);
  const referenceLossDb = calculateFsplDb(input.frequencyGHz * 1000, 0.001);

  if (effectiveDistanceM <= breakpointM) {
    return referenceLossDb + 10 * input.nearPathLossExponent * log10(effectiveDistanceM);
  }

  return (
    referenceLossDb +
    10 * input.nearPathLossExponent * log10(breakpointM) +
    10 * input.farPathLossExponent * log10(effectiveDistanceM / breakpointM)
  );
}

function calculate3dDistanceM(input: ResearchDistanceInput, distanceM: number): number {
  return Math.sqrt(distanceM ** 2 + (input.txAntennaHeightM - input.rxAntennaHeightM) ** 2);
}

function calculate3gppBreakpointM(input: ResearchDistanceInput): number {
  const environmentHeightM = 1;
  const effectiveBaseHeightM = Math.max(0.1, input.txAntennaHeightM - environmentHeightM);
  const effectiveTerminalHeightM = Math.max(0.1, input.rxAntennaHeightM - environmentHeightM);

  return (
    (4 * effectiveBaseHeightM * effectiveTerminalHeightM * input.frequencyGHz * 1_000_000_000) /
    SPEED_OF_LIGHT_MPS
  );
}

function calculate3gppUmiLosPathLossDb(input: ResearchDistanceInput, distanceM: number): number {
  const d3dM = calculate3dDistanceM(input, distanceM);
  const breakpointM = calculate3gppBreakpointM(input);

  if (distanceM <= breakpointM) {
    return 32.4 + 21 * log10(d3dM) + 20 * log10(input.frequencyGHz);
  }

  return (
    32.4 +
    40 * log10(d3dM) +
    20 * log10(input.frequencyGHz) -
    9.5 * log10(breakpointM ** 2 + (input.txAntennaHeightM - input.rxAntennaHeightM) ** 2)
  );
}

function calculate3gppUmiNlosPathLossDb(input: ResearchDistanceInput, distanceM: number): number {
  const d3dM = calculate3dDistanceM(input, distanceM);
  const losDb = calculate3gppUmiLosPathLossDb(input, distanceM);
  const nlosDb =
    22.4 +
    35.3 * log10(d3dM) +
    21.3 * log10(input.frequencyGHz) -
    0.3 * (input.rxAntennaHeightM - 1.5);

  return Math.max(losDb, nlosDb);
}

function calculate3gppUmaLosPathLossDb(input: ResearchDistanceInput, distanceM: number): number {
  const d3dM = calculate3dDistanceM(input, distanceM);
  const breakpointM = calculate3gppBreakpointM(input);

  if (distanceM <= breakpointM) {
    return 28 + 22 * log10(d3dM) + 20 * log10(input.frequencyGHz);
  }

  return (
    28 +
    40 * log10(d3dM) +
    20 * log10(input.frequencyGHz) -
    9 * log10(breakpointM ** 2 + (input.txAntennaHeightM - input.rxAntennaHeightM) ** 2)
  );
}

function calculate3gppUmaNlosPathLossDb(input: ResearchDistanceInput, distanceM: number): number {
  const d3dM = calculate3dDistanceM(input, distanceM);
  const losDb = calculate3gppUmaLosPathLossDb(input, distanceM);
  const nlosDb =
    13.54 +
    39.08 * log10(d3dM) +
    20 * log10(input.frequencyGHz) -
    0.6 * (input.rxAntennaHeightM - 1.5);

  return Math.max(losDb, nlosDb);
}

export function calculateResearchPathLossDb(input: ResearchDistanceInput, distanceM: number): number {
  const effectiveDistanceM = Math.max(1, distanceM);

  switch (input.model) {
    case "ci":
      return calculateCiPathLossDb(input.frequencyGHz, effectiveDistanceM, input.pathLossExponent);
    case "dual_slope":
      return calculateDualSlopePathLossDb(input, effectiveDistanceM);
    case "tr38901_umi_los":
      return calculate3gppUmiLosPathLossDb(input, effectiveDistanceM);
    case "tr38901_umi_nlos":
      return calculate3gppUmiNlosPathLossDb(input, effectiveDistanceM);
    case "tr38901_uma_los":
      return calculate3gppUmaLosPathLossDb(input, effectiveDistanceM);
    case "tr38901_uma_nlos":
      return calculate3gppUmaNlosPathLossDb(input, effectiveDistanceM);
  }
}

function solveMaximumDistanceM(
  input: ResearchDistanceInput,
  allowedPathLossDb: number
): Pick<ResearchDistanceResult, "maximumDistanceM" | "feasibleAtMinimumDistance" | "exceedsSearchLimit"> {
  const minimumDistanceM = clampPositive(input.minDistanceM, defaultResearchDistanceInput.minDistanceM);
  const searchLimitM = clampPositive(input.maxDistanceKm, defaultResearchDistanceInput.maxDistanceKm) * 1000;

  if (calculateResearchPathLossDb(input, minimumDistanceM) > allowedPathLossDb) {
    return {
      maximumDistanceM: null,
      feasibleAtMinimumDistance: false,
      exceedsSearchLimit: false
    };
  }

  if (calculateResearchPathLossDb(input, searchLimitM) <= allowedPathLossDb) {
    return {
      maximumDistanceM: searchLimitM,
      feasibleAtMinimumDistance: true,
      exceedsSearchLimit: true
    };
  }

  let lowM = minimumDistanceM;
  let highM = searchLimitM;

  for (let index = 0; index < 70; index += 1) {
    const midM = (lowM + highM) / 2;
    const pathLossDb = calculateResearchPathLossDb(input, midM);

    if (pathLossDb <= allowedPathLossDb) {
      lowM = midM;
    } else {
      highM = midM;
    }
  }

  return {
    maximumDistanceM: lowM,
    feasibleAtMinimumDistance: true,
    exceedsSearchLimit: false
  };
}

function buildResearchWarnings(input: ResearchDistanceInput, result: Omit<ResearchDistanceResult, "warnings">) {
  const warnings: ResearchDistanceWarning[] = [];
  const is3gppModel = input.model.startsWith("tr38901");
  const isUmi = input.model.includes("umi");
  const isUma = input.model.includes("uma");
  const representativeDistanceM = result.maximumDistanceM ?? result.minimumDistanceM;

  if (input.shadowFadingStdDb === 0) {
    warnings.push({
      id: "shadow-fading-zero",
      message:
        "シャドウフェージングσが0dBです。現実の屋外・低高度通信では建物、車両、人体、植栽、設置方向によるばらつきが出るため、信頼率つき距離評価では0dBのまま使わないことを推奨します。"
    });
  }

  if (input.calibrationOffsetDb === 0) {
    warnings.push({
      id: "calibration-missing",
      message:
        "実測補正値が0dBです。研究・標準モデルは平均的な環境を扱うため、現地RSSI/RSRPとの差分を入れると距離見積もりの現実とのずれを小さくできます。"
    });
  }

  if (input.model === "ci") {
    warnings.push({
      id: "ci-needs-local-exponent",
      message:
        "CIモデルは1m基準の物理的な基準損失に距離損失指数を足す実測フィット型モデルです。距離損失指数nは環境依存のため、初期値のまま通信可否を断定せず、現地測定で補正してください。"
    });
  }

  if (input.model === "dual_slope") {
    warnings.push({
      id: "dual-slope-needs-breakpoint",
      message:
        "Dual-slopeモデルはブレークポイントの前後で減衰勾配を変える近似です。交差点、道路幅、アンテナ高、地面反射の状態によりブレークポイントは変わるため、実測またはレイトレースで確認してください。"
    });
  }

  if (is3gppModel) {
    if (input.frequencyGHz < 0.5 || input.frequencyGHz > 100) {
      warnings.push({
        id: "tr38901-frequency-range",
        message:
          "3GPP TR 38.901のUMi/UMaモデルは0.5〜100GHzを対象にしています。現在の周波数は一般的な適用範囲外のため、結果は参考値として扱ってください。"
      });
    }

    if (representativeDistanceM < 10 || representativeDistanceM > 5000) {
      warnings.push({
        id: "tr38901-distance-range",
        message:
          "3GPP TR 38.901のUMi/UMa距離式は、概ね10m〜5kmの2D距離を想定します。表示距離が範囲外に出る場合は、外挿値として扱ってください。"
      });
    }

    if (input.rxAntennaHeightM < 1.5 || input.rxAntennaHeightM > 22.5) {
      warnings.push({
        id: "tr38901-terminal-height",
        message:
          "3GPP TR 38.901のUMi/UMaでは、端末高は主に1.5〜22.5mの範囲で扱われます。地面近傍IoT端末では端末近傍損失と実測補正を別途確認してください。"
      });
    }

    if (isUmi && Math.abs(input.txAntennaHeightM - 10) > 5) {
      warnings.push({
        id: "tr38901-umi-base-height",
        message:
          "UMi Street Canyonは基地局高10m程度の都市マイクロセルを想定するモデルです。送信側アンテナ高が大きく外れる場合は、UMa、CI、Dual-slope、実測補正との比較を推奨します。"
      });
    }

    if (isUma && Math.abs(input.txAntennaHeightM - 25) > 10) {
      warnings.push({
        id: "tr38901-uma-base-height",
        message:
          "UMaは基地局高25m程度の都市マクロセルを想定するモデルです。低いゲートウェイや端末間通信には、CI、Dual-slope、実測補正を主モデルとして検討してください。"
      });
    }

    if (input.txAntennaHeightM < 3 && input.rxAntennaHeightM < 3) {
      warnings.push({
        id: "low-height-3gpp",
        message:
          "送受信機の双方が低高度です。3GPPのUMi/UMaは基地局-端末リンクの標準評価用モデルであり、端末同士の通信距離は地面反射、フレネルゾーン欠損、遮蔽、実測補正を重視してください。"
      });
    }

    if (input.frequencyGHz >= 7 && input.frequencyGHz <= 24) {
      warnings.push({
        id: "rel19-fr3-note",
        message:
          "7〜24GHz帯は3GPP Release 19で測定・補正の議論が進んだ帯域です。この簡易シートは距離損失とシャドウフェージング中心の一次評価であり、近傍界、大規模アレイ、空間非定常性までは再現しません。"
      });
    }
  }

  if (!result.feasibleAtMinimumDistance) {
    warnings.push({
      id: "not-feasible-at-minimum",
      message:
        "最小距離でも許容伝搬損失を超えています。送信電力、アンテナ利得、受信感度、追加損失、目標信頼率を見直してください。"
    });
  }

  if (result.exceedsSearchLimit) {
    warnings.push({
      id: "exceeds-search-limit",
      message:
        "上限距離でもリンク余裕があります。探索上限を広げるか、規制上の送信電力、実際の見通し、フレネルゾーン、遅延・干渉条件で制約を確認してください。"
    });
  }

  return warnings;
}

export function calculateResearchDistance(input: ResearchDistanceInput): ResearchDistanceResult {
  const allowedMedianPathLossDb = calculateAllowedMedianPathLossDb(input);
  const medianInput: ResearchDistanceInput = {
    ...input,
    reliabilityPercent: 50,
    fadeMarginDb: 0
  };
  const medianAllowedPathLossDb = calculateAllowedMedianPathLossDb(medianInput);
  const distanceSolve = solveMaximumDistanceM(input, allowedMedianPathLossDb);
  const medianSolve = solveMaximumDistanceM(medianInput, medianAllowedPathLossDb);
  const minimumDistanceM = clampPositive(input.minDistanceM, defaultResearchDistanceInput.minDistanceM);
  const searchLimitM = clampPositive(input.maxDistanceKm, defaultResearchDistanceInput.maxDistanceKm) * 1000;
  const modelPathLossAtMaximumDb = distanceSolve.maximumDistanceM
    ? calculateResearchPathLossDb(input, distanceSolve.maximumDistanceM)
    : null;

  const resultWithoutWarnings: Omit<ResearchDistanceResult, "warnings"> = {
    maximumDistanceM: distanceSolve.maximumDistanceM,
    medianDistanceM: medianSolve.maximumDistanceM,
    minimumDistanceM,
    searchLimitM,
    allowedMedianPathLossDb,
    medianAllowedPathLossDb,
    reliabilityMarginDb: calculateReliabilityMarginDb(input),
    extraLossDb: calculateExtraLossDb(input),
    feasibleAtMinimumDistance: distanceSolve.feasibleAtMinimumDistance,
    exceedsSearchLimit: distanceSolve.exceedsSearchLimit,
    modelPathLossAtMaximumDb
  };

  return {
    ...resultWithoutWarnings,
    warnings: buildResearchWarnings(input, resultWithoutWarnings)
  };
}

export function generateResearchDistanceCurveData(
  input: ResearchDistanceInput,
  result: ResearchDistanceResult,
  pointCount = 14
): ResearchDistanceCurvePoint[] {
  const startM = result.minimumDistanceM;
  const endM = result.searchLimitM;
  const logStart = log10(startM);
  const logEnd = log10(endM);

  return Array.from({ length: pointCount }, (_, index) => {
    const ratio = pointCount === 1 ? 0 : index / (pointCount - 1);
    const distanceM = 10 ** (logStart + (logEnd - logStart) * ratio);
    const pathLossDb = calculateResearchPathLossDb(input, distanceM);

    return {
      distanceM,
      distanceLabel: distanceLabel(distanceM),
      linkMarginDb: Number((result.allowedMedianPathLossDb - pathLossDb).toFixed(1)),
      pathLossDb: Number(pathLossDb.toFixed(1)),
      current: result.maximumDistanceM
        ? Math.abs(log10(distanceM) - log10(result.maximumDistanceM)) < 0.08
        : false
    };
  });
}

export function formatResearchDistance(distanceM: number | null): string {
  if (distanceM === null) {
    return "成立しません";
  }

  if (distanceM >= 1000) {
    return `${(distanceM / 1000).toFixed(distanceM >= 10_000 ? 1 : 2)} km`;
  }

  return `${distanceM.toFixed(distanceM >= 100 ? 0 : 1)} m`;
}
