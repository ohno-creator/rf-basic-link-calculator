import { calculateFsplDb } from "./fspl";
import { type AreaType, calculatePropagationLoss } from "./propagation";

/**
 * リンクバジェットページに組み込まれている「幾何条件で決まる」伝搬モデルを、
 * 1つの純関数 `calculatePropagationLossResult(model, params)` で評価できるようまとめたもの。
 * 各式は linkBudget.ts / propagation.ts の実装と一致させている（自由空間・Hata系は同じ関数を再利用）。
 *
 * 実測値が前提の measured_correction / iot_hata_calibrated は、入力にRSSI/RSRPが要るため
 * ここには含めず、リンクバジェット計算機側で扱う。
 */
export type GeometricPropagationModel =
  | "free_space"
  | "two_ray"
  | "log_distance"
  | "okumura_hata"
  | "cost231_hata";

export const geometricPropagationModels: GeometricPropagationModel[] = [
  "free_space",
  "two_ray",
  "log_distance",
  "okumura_hata",
  "cost231_hata"
];

export type PropagationLossParams = {
  frequencyMHz: number;
  distanceKm: number;
  /** 送信側（基地局/ゲートウェイ）アンテナ高 hb [m] */
  txHeightM: number;
  /** 受信側（端末/移動局）アンテナ高 hm [m] */
  rxHeightM: number;
  /** Hata系のエリア種別 */
  area: AreaType;
  /** Log-distance の距離損失指数 n */
  pathLossExponent: number;
};

export type PropagationLossResult = {
  model: GeometricPropagationModel;
  pathLossDb: number;
  /** モデルの一般的な適用目安の外側か（Hata系のみ判定。他は false） */
  outOfRange: boolean;
};

function log10(value: number): number {
  return Math.log10(value);
}

/** 平面大地2波の遠方近似。ブレークポイント手前では自由空間損失に張り付く。 */
function twoRayPathLossDb(params: PropagationLossParams): number {
  const distanceM = params.distanceKm * 1000;
  const fsplDb = calculateFsplDb(params.frequencyMHz, params.distanceKm);
  const twoRayDb =
    40 * log10(distanceM) - 20 * log10(params.txHeightM) - 20 * log10(params.rxHeightM);

  return Math.max(fsplDb, twoRayDb);
}

/** 1m基準（close-in）の Log-distance：L = FSPL(1m) + 10·n·log10(d[m])。 */
function logDistancePathLossDb(params: PropagationLossParams): number {
  const distanceM = params.distanceKm * 1000;
  const referenceLossDb = calculateFsplDb(params.frequencyMHz, 0.001);

  return referenceLossDb + 10 * params.pathLossExponent * log10(distanceM);
}

export function calculatePropagationLossResult(
  model: GeometricPropagationModel,
  params: PropagationLossParams
): PropagationLossResult {
  switch (model) {
    case "free_space":
      return {
        model,
        pathLossDb: calculateFsplDb(params.frequencyMHz, params.distanceKm),
        outOfRange: false
      };
    case "two_ray":
      return { model, pathLossDb: twoRayPathLossDb(params), outOfRange: false };
    case "log_distance":
      return { model, pathLossDb: logDistancePathLossDb(params), outOfRange: false };
    case "okumura_hata":
    case "cost231_hata": {
      const propagation = calculatePropagationLoss({
        frequencyMHz: params.frequencyMHz,
        baseHeightM: params.txHeightM,
        mobileHeightM: params.rxHeightM,
        distanceKm: params.distanceKm,
        area: params.area,
        preferredModel: model === "okumura_hata" ? "Hata" : "COST231-Hata"
      });

      return { model, pathLossDb: propagation.pathLossDb, outOfRange: propagation.outOfRange };
    }
  }
}

/** 指定モデル群を、現在条件の伝搬損失が小さい順（届きやすい順）に並べて返す。 */
export function comparePropagationModels(
  models: GeometricPropagationModel[],
  params: PropagationLossParams
): PropagationLossResult[] {
  return models
    .map((model) => calculatePropagationLossResult(model, params))
    .filter((result) => Number.isFinite(result.pathLossDb))
    .sort((a, b) => a.pathLossDb - b.pathLossDb);
}
