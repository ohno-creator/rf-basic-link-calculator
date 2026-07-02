import { calculateFsplDb } from "./fspl";
import { SPEED_OF_LIGHT_M_PER_S } from "./frequency";
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

// 公開純関数も fspl/propagation と同じ防御レベルに揃える。0や負・非有限の入力で
// ±Infinity/NaN を黙って下流へ流さないようにする。
function assertPositiveFinite(value: number, label: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${label}は0より大きい値を入力してください。`);
  }
}

/**
 * 平面大地2波の遠方近似（一点見積り用の包絡線）。ブレークポイント手前では自由空間損失に張り付く。
 * 注意：この max(FSPL, 40log d…) 包絡線が FSPL から 40log d へ切り替わる数学的なクロスオーバーは
 * d = 4π·ht·hr/λ で、twoRayBreakpointM が返す教科書的ブレークポイント d_bp = 4·ht·hr/λ（最後の
 * 強め合いピーク）とは π 倍ずれる。両者は別定義で用途も異なるため、一方に合わせて他方を変更しないこと。
 */
function twoRayPathLossDb(params: PropagationLossParams): number {
  assertPositiveFinite(params.txHeightM, "送信側アンテナ高");
  assertPositiveFinite(params.rxHeightM, "受信側アンテナ高");
  const distanceM = params.distanceKm * 1000;
  const fsplDb = calculateFsplDb(params.frequencyMHz, params.distanceKm);
  const twoRayDb =
    40 * log10(distanceM) - 20 * log10(params.txHeightM) - 20 * log10(params.rxHeightM);

  return Math.max(fsplDb, twoRayDb);
}

/** 1m基準（close-in）の Log-distance：L = FSPL(1m) + 10·n·log10(d[m])。 */
function logDistancePathLossDb(params: PropagationLossParams): number {
  assertPositiveFinite(params.distanceKm, "距離");
  assertPositiveFinite(params.pathLossExponent, "距離損失指数n");
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

/**
 * 完全な2波（直接波＋地面反射波）モデルの伝搬損失。直接波と反射波を位相込みで合成（コヒーレント和）するため、
 * 距離に対して強め合い（最大 +6dB のピーク）と弱め合い（深い谷＝ヌル）が交互に現れ、グラフが「波打つ」。
 * ブレークポイント d_bp = 4·ht·hr/λ 付近から、平均的には 40·log10(d) の遠方近似へ近づく。
 *
 *   直接波経路長 r1 = √(d² + (ht−hr)²),  反射波経路長 r2 = √(d² + (ht+hr)²)
 *   電界 E ∝ e^(-jkr1)/r1 + Γ·e^(-jkr2)/r2
 *   損失[dB] = -20·log10((λ/4π)·|E|)   （深い谷は直接波のみのFSPL + maxFadeDbで底打ち）
 *
 * 注: リンクバジェットの一点見積もりでは、安定した判定のため平滑化した包絡線（two_ray）を使う。
 *     この関数は干渉の山谷をグラフ表示・学習用途へ反映するための完全版。
 */
export function twoRayInterferencePathLossDb(
  frequencyMHz: number,
  distanceKm: number,
  txHeightM: number,
  rxHeightM: number,
  reflectionCoefficient = -1,
  maxFadeDb = 40
): number {
  assertPositiveFinite(frequencyMHz, "周波数");
  assertPositiveFinite(distanceKm, "距離");
  assertPositiveFinite(txHeightM, "送信側アンテナ高");
  assertPositiveFinite(rxHeightM, "受信側アンテナ高");
  if (!Number.isFinite(reflectionCoefficient)) {
    throw new Error("反射係数は有限の値を入力してください。");
  }
  assertPositiveFinite(maxFadeDb, "最大フェード量");

  const wavelengthM = SPEED_OF_LIGHT_M_PER_S / (frequencyMHz * 1_000_000);
  const distanceM = distanceKm * 1000;
  const directM = Math.hypot(distanceM, txHeightM - rxHeightM);
  const reflectedM = Math.hypot(distanceM, txHeightM + rxHeightM);
  const waveNumber = (2 * Math.PI) / wavelengthM;
  const directPhase = waveNumber * directM;
  const reflectedPhase = waveNumber * reflectedM;
  const realField =
    Math.cos(directPhase) / directM +
    (reflectionCoefficient * Math.cos(reflectedPhase)) / reflectedM;
  const imaginaryField =
    -Math.sin(directPhase) / directM -
    (reflectionCoefficient * Math.sin(reflectedPhase)) / reflectedM;
  const fieldMagnitudeSquared = realField ** 2 + imaginaryField ** 2;
  const pathGain = (wavelengthM / (4 * Math.PI)) ** 2 * fieldMagnitudeSquared;
  const pathLossDb = -10 * Math.log10(Math.max(pathGain, 1e-30));
  const directOnlyLossDb = calculateFsplDb(frequencyMHz, directM / 1000);

  return Math.min(pathLossDb, directOnlyLossDb + maxFadeDb);
}

/**
 * 距離カーブ描画用の伝搬損失。2波だけは干渉込みの完全版を使い、その他は
 * 一点見積もりと同じ式を使う。リンク判定の `calculatePropagationLossResult`
 * と表示カーブを分けることで、二波の局所的な山谷をグラフへ正しく出す。
 */
export function calculatePropagationLossCurveDb(
  model: GeometricPropagationModel,
  params: PropagationLossParams
): number {
  if (model === "two_ray") {
    return twoRayInterferencePathLossDb(
      params.frequencyMHz,
      params.distanceKm,
      params.txHeightM,
      params.rxHeightM
    );
  }

  return calculatePropagationLossResult(model, params).pathLossDb;
}

/** 2波モデルのブレークポイント距離 d_bp = 4·ht·hr/λ [m]。 */
export function twoRayBreakpointM(
  frequencyMHz: number,
  txHeightM: number,
  rxHeightM: number
): number {
  assertPositiveFinite(frequencyMHz, "周波数");
  assertPositiveFinite(txHeightM, "送信側アンテナ高");
  assertPositiveFinite(rxHeightM, "受信側アンテナ高");
  const wavelengthM = SPEED_OF_LIGHT_M_PER_S / (frequencyMHz * 1_000_000);
  return (4 * txHeightM * rxHeightM) / wavelengthM;
}
