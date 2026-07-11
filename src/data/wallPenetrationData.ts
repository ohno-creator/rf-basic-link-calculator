/**
 * Track G14 建材1枚あたりの透過損失レンジ[dB]。
 * 正本: docs/handoff/track-g-data-literature-pack.md §5（Antigravity確認済み）。
 * 出典モデル・実測値には含水率、厚さ、入射角、鉄筋間隔による大きな幅があるため、
 * 単一値ではなく設計レンジとして保持する。
 */

export type WallMaterial =
  | "wood"
  | "drywall"
  | "concrete"
  | "reinforced_concrete"
  | "glass"
  | "low_e_glass"
  | "brick";
export type WallFrequencyBand = "920" | "2400" | "5000" | "28000";

export const WALL_MATERIAL_LABELS: Record<WallMaterial, string> = {
  wood: "木製ドア・木製内壁",
  drywall: "乾式石膏ボード",
  concrete: "コンクリート内壁",
  reinforced_concrete: "鉄筋コンクリート外壁",
  glass: "標準単層ガラス窓",
  low_e_glass: "Low-E（金属複層ガラス）",
  brick: "レンガ壁"
};

export const WALL_FREQUENCY_LABELS: Record<WallFrequencyBand, string> = {
  "920": "920MHz",
  "2400": "2400MHz",
  "5000": "5000MHz",
  "28000": "28GHz"
};

export const WALL_PENETRATION_SOURCES = {
  itu: "ITU-R P.2040-2, Effects of building materials and structures on radiowave propagation",
  nist: "NISTIR 6055, Electromagnetic Signal Attenuation in Construction Materials",
  ibwave: "iBwave Material Penetration Loss Database"
} as const;

export type WallPenetrationData = {
  material: WallMaterial;
  band: WallFrequencyBand;
  minimumLossDb: number;
  maximumLossDb: number;
  maximumIsOpenEnded: boolean;
  sourceRefs: readonly (keyof typeof WALL_PENETRATION_SOURCES)[];
  confidence: "confirmed";
};

type Range = readonly [number, number, boolean?];
const ranges: Record<WallMaterial, Record<WallFrequencyBand, Range>> = {
  wood: { "920": [1.5, 3], "2400": [2.5, 4.5], "5000": [3.5, 6], "28000": [5, 9] },
  drywall: { "920": [1, 2], "2400": [1.5, 3], "5000": [2.5, 4.5], "28000": [4, 7] },
  concrete: { "920": [8, 15], "2400": [12, 20], "5000": [15, 25], "28000": [25, 40] },
  reinforced_concrete: { "920": [15, 25], "2400": [20, 35], "5000": [25, 45], "28000": [40, 60, true] },
  glass: { "920": [2, 4], "2400": [3, 5.5], "5000": [4, 8], "28000": [6, 12] },
  low_e_glass: { "920": [15, 25], "2400": [20, 30], "5000": [24, 35], "28000": [30, 45] },
  brick: { "920": [5, 10], "2400": [7, 15], "5000": [10, 20], "28000": [20, 35] }
};

export const WALL_PENETRATION_DATA: readonly WallPenetrationData[] =
  (Object.keys(ranges) as WallMaterial[]).flatMap((material) =>
    (Object.keys(ranges[material]) as WallFrequencyBand[]).map((band) => {
      const range = ranges[material][band];
      return {
        material,
        band,
        minimumLossDb: range[0],
        maximumLossDb: range[1],
        maximumIsOpenEnded: range[2] ?? false,
        sourceRefs: ["itu", "nist", "ibwave"] as const,
        confidence: "confirmed" as const
      };
    })
  );

export function getWallPenetrationRange(
  material: string,
  band: string
): WallPenetrationData | undefined {
  return WALL_PENETRATION_DATA.find(
    (item) => item.material === material && item.band === band
  );
}
