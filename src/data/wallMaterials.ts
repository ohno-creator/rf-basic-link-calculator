/**
 * 建材の電波透過損失テーブル（dB/枚・帯域別の目安レンジ）。
 *
 * 値は ITU-R P.2040-2（建材の電気定数と透過損失の測定法・代表値）、NISTIR 6055
 * （NISTによる建材減衰の実測レポート）、iBwave の材質透過損失データベースに載る
 * 公表値の範囲を、周波数帯ごとに min〜max の「目安レンジ」として整理したもの。
 * 実際の損失は壁厚・含水率・鉄筋ピッチ・金属膜の有無・入射角で大きく変わるため、
 * 本表は当たり付け用であり、最終判断は現場実測を前提とする。
 *
 * 出典:
 * - Recommendation ITU-R P.2040-2, "Effects of building materials and structures on
 *   radiowave propagation above about 100 MHz" (2021).
 *   https://www.itu.int/rec/R-REC-P.2040/en
 * - NISTIR 6055, "Electromagnetic Signal Attenuation in Construction Materials" (1997).
 *   https://nvlpubs.nist.gov/nistpubs/Legacy/IR/nistir6055.pdf
 * - iBwave Material Penetration Loss Database.
 *   https://www.ibwave.com/
 */

/** 対応帯域の中心周波数[MHz]（920MHz帯 / 2.4GHz帯 / 5GHz帯 / 28GHz帯）。 */
export type WallBandMHz = 920 | 2400 | 5000 | 28000;

/** 対応帯域の一覧（昇順）。 */
export const WALL_BANDS: readonly WallBandMHz[] = [920, 2400, 5000, 28000];

/** 材質の機械キー（ascii）。UI が日本語ラベルへ写像する。 */
export type WallMaterialId =
  | "wood-door"
  | "plasterboard"
  | "concrete-interior"
  | "rc-exterior"
  | "single-glass"
  | "low-e-glass"
  | "brick";

/** 1枚（1面）あたりの透過損失レンジ[dB]。 */
export type WallLossRange = {
  minDb: number;
  maxDb: number;
};

export type WallMaterial = {
  id: WallMaterialId;
  /** UI 表示用の日本語ラベル。 */
  label: string;
  /** 材質の一言補足（UI のヒント用）。 */
  note: string;
  /** 帯域別の 1枚あたり透過損失レンジ[dB]。 */
  lossDbPerWall: Record<WallBandMHz, WallLossRange>;
};

/**
 * 建材別・帯域別の透過損失テーブル（dB/枚・min〜max）。
 * 行の順序は「損失が小さい内装材 → 大きい構造材・特殊ガラス」の並び。
 */
export const WALL_MATERIALS: readonly WallMaterial[] = [
  {
    id: "plasterboard",
    label: "石膏ボード（内壁）",
    note: "一般的な間仕切り壁。乾式壁1面ぶん",
    lossDbPerWall: {
      920: { minDb: 1.0, maxDb: 2.0 },
      2400: { minDb: 1.5, maxDb: 3.0 },
      5000: { minDb: 2.5, maxDb: 4.5 },
      28000: { minDb: 4.0, maxDb: 7.0 }
    }
  },
  {
    id: "wood-door",
    label: "木製ドア・木質内壁",
    note: "木製建具・合板壁1面ぶん",
    lossDbPerWall: {
      920: { minDb: 1.5, maxDb: 3.0 },
      2400: { minDb: 2.5, maxDb: 4.5 },
      5000: { minDb: 3.5, maxDb: 6.0 },
      28000: { minDb: 5.0, maxDb: 9.0 }
    }
  },
  {
    id: "single-glass",
    label: "単層ガラス窓",
    note: "金属膜なしの普通ガラス",
    lossDbPerWall: {
      920: { minDb: 2.0, maxDb: 4.0 },
      2400: { minDb: 3.0, maxDb: 5.5 },
      5000: { minDb: 4.0, maxDb: 8.0 },
      28000: { minDb: 6.0, maxDb: 12.0 }
    }
  },
  {
    id: "brick",
    label: "レンガ壁",
    note: "組積造の外装・間仕切り",
    lossDbPerWall: {
      920: { minDb: 5.0, maxDb: 10.0 },
      2400: { minDb: 7.0, maxDb: 15.0 },
      5000: { minDb: 10.0, maxDb: 20.0 },
      28000: { minDb: 20.0, maxDb: 35.0 }
    }
  },
  {
    id: "concrete-interior",
    label: "コンクリート内壁",
    note: "内部の構造壁・戸境壁",
    lossDbPerWall: {
      920: { minDb: 8.0, maxDb: 15.0 },
      2400: { minDb: 12.0, maxDb: 20.0 },
      5000: { minDb: 15.0, maxDb: 25.0 },
      28000: { minDb: 25.0, maxDb: 40.0 }
    }
  },
  {
    id: "low-e-glass",
    label: "Low-E複層ガラス",
    note: "省エネ窓。金属膜が電波も強く遮る",
    lossDbPerWall: {
      920: { minDb: 15.0, maxDb: 25.0 },
      2400: { minDb: 20.0, maxDb: 30.0 },
      5000: { minDb: 24.0, maxDb: 35.0 },
      28000: { minDb: 30.0, maxDb: 45.0 }
    }
  },
  {
    id: "rc-exterior",
    label: "鉄筋コンクリート外壁",
    note: "RC造の外周壁。鉄筋＋厚みで最大級",
    lossDbPerWall: {
      920: { minDb: 15.0, maxDb: 25.0 },
      2400: { minDb: 20.0, maxDb: 35.0 },
      5000: { minDb: 25.0, maxDb: 45.0 },
      28000: { minDb: 40.0, maxDb: 60.0 }
    }
  }
];

/** id → 材質定義の索引。 */
export const WALL_MATERIAL_BY_ID: ReadonlyMap<WallMaterialId, WallMaterial> = new Map(
  WALL_MATERIALS.map((material) => [material.id, material])
);

export type WallMaterialSource = {
  label: string;
  href: string;
  kind: "recommendation" | "report" | "database";
  note: string;
};

/** 本表の一次出典（UI の出典表示・コラム深掘りから参照）。 */
export const WALL_MATERIAL_SOURCES: readonly WallMaterialSource[] = [
  {
    label: "ITU-R P.2040-2: Effects of building materials and structures on radiowave propagation above about 100 MHz",
    href: "https://www.itu.int/rec/R-REC-P.2040/en",
    kind: "recommendation",
    note: "建材の電気定数モデルと透過損失の測定法・代表値をまとめたITU-R勧告（2021）。"
  },
  {
    label: "NISTIR 6055: Electromagnetic Signal Attenuation in Construction Materials",
    href: "https://nvlpubs.nist.gov/nistpubs/Legacy/IR/nistir6055.pdf",
    kind: "report",
    note: "NISTによるコンクリート・レンガ・木材等の減衰実測レポート（1997）。厚さ・含水率依存の実測データを含む。"
  },
  {
    label: "iBwave Material Penetration Loss Database",
    href: "https://www.ibwave.com/",
    kind: "database",
    note: "屋内設計ツールiBwaveが保守する建材別透過損失データベース。実務の設計初期値として広く参照される。"
  }
];
