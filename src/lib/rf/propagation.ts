/**
 * 伝搬損失（中央値）の推定：奥村-秦（Okumura-Hata）モデルと、その高周波帯拡張である
 * COST 231-Hata モデル。市街地・郊外・開放地のエリア種別に対応する。
 *
 * 適用目安：
 *   - 周波数 f      : 150〜1500MHz（Hata） / 1500〜2000MHz（COST 231-Hata）
 *   - 基地局高 hb   : 30〜200m
 *   - 移動局高 hm   : 1〜10m
 *   - 距離 d        : 1〜20km
 *
 * 移動局アンテナ補正係数 a(hm)：
 *   大都市      : f≤200MHz  a = 8.29(log10(1.54·hm))² − 1.1
 *                f≥400MHz  a = 3.20(log10(11.75·hm))² − 4.97
 *   中小都市     : a = (1.1·log10(f) − 0.7)·hm − (1.56·log10(f) − 0.8)
 *
 * 市街地（中小都市）を基準に、郊外・開放地は次の補正を加える：
 *   郊外   : L = L_urban − 2·(log10(f/28))² − 5.4
 *   開放地 : L = L_urban − 4.78·(log10 f)² + 18.33·log10 f − 40.94
 */

import { calculateFsplDb } from "./fspl";

export type AreaType = "urbanLarge" | "urbanMedium" | "suburban" | "open";

export type PropagationModel = "Hata" | "COST231-Hata";

export type PropagationResult = {
  model: PropagationModel;
  pathLossDb: number;
  /** 適用目安の範囲を外れている場合に true（外挿） */
  outOfRange: boolean;
};

export type PropagationInput = {
  frequencyMHz: number;
  baseHeightM: number;
  mobileHeightM: number;
  distanceKm: number;
  area: AreaType;
  preferredModel?: PropagationModel;
};

function assertPositiveFinite(value: number, label: string) {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${label}は0より大きい値を入力してください。`);
  }
}

function largeCityCorrection(frequencyMHz: number, mobileHeightM: number): number {
  // 大都市の移動局補正 a(hm)。原典は f≤200MHz と f≥400MHz の2式のみで、
  // 200<f<400MHz は未定義。ここでは f>200 を高周波式(≥400用)で外挿する
  // （典型 hm≤3m では2式の差は0.5dB以下）。
  if (frequencyMHz <= 200) {
    return 8.29 * Math.log10(1.54 * mobileHeightM) ** 2 - 1.1;
  }
  return 3.2 * Math.log10(11.75 * mobileHeightM) ** 2 - 4.97;
}

function mediumCityCorrection(frequencyMHz: number, mobileHeightM: number): number {
  const logF = Math.log10(frequencyMHz);
  return (1.1 * logF - 0.7) * mobileHeightM - (1.56 * logF - 0.8);
}

function isOutOfRange(input: PropagationInput, model: PropagationModel): boolean {
  const frequencyOutOfRange =
    model === "Hata"
      ? input.frequencyMHz < 150 || input.frequencyMHz > 1500
      : input.frequencyMHz < 1500 || input.frequencyMHz > 2000;

  return (
    frequencyOutOfRange ||
    input.baseHeightM < 30 ||
    input.baseHeightM > 200 ||
    input.mobileHeightM < 1 ||
    input.mobileHeightM > 10 ||
    input.distanceKm < 1 ||
    input.distanceKm > 20
  );
}

export function calculatePropagationLoss(input: PropagationInput): PropagationResult {
  assertPositiveFinite(input.frequencyMHz, "周波数");
  assertPositiveFinite(input.baseHeightM, "基地局アンテナ高");
  assertPositiveFinite(input.mobileHeightM, "移動局アンテナ高");
  assertPositiveFinite(input.distanceKm, "距離");

  const { frequencyMHz: f, baseHeightM: hb, mobileHeightM: hm, distanceKm: d, area } = input;
  const logF = Math.log10(f);
  const logHb = Math.log10(hb);
  const logD = Math.log10(d);
  const distanceTerm = (44.9 - 6.55 * logHb) * logD;

  // preferredModel を指定すると周波数によらずそのモデルを使う。範囲警告は選択された
  // モデルごとに判定する（Hata: 150〜1500MHz、COST231-Hata: 1500〜2000MHz）。
  const model: PropagationModel = input.preferredModel ?? (f >= 1500 ? "COST231-Hata" : "Hata");

  let urbanLoss: number;
  if (model === "COST231-Hata") {
    // COST 231-Hata は移動局補正に中小都市式を用い、大都市は補正項Cm=3dBで区別する。
    const correction = mediumCityCorrection(f, hm);
    const cm = area === "urbanLarge" ? 3 : 0;
    urbanLoss = 46.3 + 33.9 * logF - 13.82 * logHb - correction + distanceTerm + cm;
  } else {
    // Hata は大都市のみ専用の補正式、その他は中小都市式を用いる。
    const correction =
      area === "urbanLarge" ? largeCityCorrection(f, hm) : mediumCityCorrection(f, hm);
    urbanLoss = 69.55 + 26.16 * logF - 13.82 * logHb - correction + distanceTerm;
  }

  // 郊外・開放地補正は元来 Okumura-Hata（≤1500MHz）由来。COST231-Hata原典は Cm のみで
  // 郊外/開放地補正を定義しないため、1500–2000MHz では実用上の外挿として適用している。
  let pathLossDb = urbanLoss;
  if (area === "suburban") {
    pathLossDb = urbanLoss - 2 * Math.log10(f / 28) ** 2 - 5.4;
  } else if (area === "open") {
    pathLossDb = urbanLoss - 4.78 * logF ** 2 + 18.33 * logF - 40.94;
  }

  // 中央値損失の物理下限として FSPL で床を張る。経験式は近距離(d≪1km)や極端な開放地条件で
  // 自由空間損失を下回る非物理値を返すため。標準的な市街地パラメータ(hb30/hm1.5)では
  // 適用範囲(d≥1km)で床は拘束しないが、開放地×高基地局×高周波では範囲内でも床が効き得る。
  const pathLossFlooredDb = Math.max(pathLossDb, calculateFsplDb(f, d));

  return {
    model,
    pathLossDb: pathLossFlooredDb,
    outOfRange: isOutOfRange(input, model)
  };
}
