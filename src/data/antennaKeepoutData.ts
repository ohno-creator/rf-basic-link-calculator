/**
 * Track G3 アンテナ・キープアウト代表値。
 * 正本: docs/handoff/track-g-data-literature-pack.md §2（Antigravity確認済み）。
 *
 * 値は個別アンテナの保証寸法ではなく、主要メーカ推奨実装から作った初期配置の目安。
 * 製品選定後は必ず対象品番の最新データシートを優先する。
 */

import type { AntennaKeepoutRequirement } from "@/lib/rf/antennaKeepout";

export type AntennaKind = "chip" | "pcb" | "fpc" | "spring";
export type AntennaBand = "920" | "1575" | "2400" | "sub6";

export const ANTENNA_KIND_LABELS: Record<AntennaKind, string> = {
  chip: "チップアンテナ",
  pcb: "PCBパターン",
  fpc: "FPC（フレキ）",
  spring: "スプリング"
};

export const ANTENNA_BAND_LABELS: Record<AntennaBand, string> = {
  "920": "920MHz（LPWA）",
  "1575": "1575MHz（GNSS）",
  "2400": "2400MHz（BLE/Wi-Fi）",
  sub6: "Sub-6GHz（5G FR1）"
};

export const ANTENNA_KEEPOUT_SOURCES = {
  johanson: "Johanson Technology, Chip Antenna Layout Guide / 2450AT42B100E layout",
  ignion: "Ignion, NN02-220 reference design / NN02-224 RUN mXTEND user manual",
  integration: "Molex / Taoglas, FPC and spring antenna integration specifications"
} as const;

export type AntennaKeepoutData = AntennaKeepoutRequirement & {
  kind: AntennaKind;
  band: AntennaBand;
  sourceRefs: readonly (keyof typeof ANTENNA_KEEPOUT_SOURCES)[];
  confidence: "confirmed";
};

const dimensions: Record<AntennaKind, Record<AntennaBand, readonly [number, number]>> = {
  chip: { "920": [35, 10], "1575": [15, 6], "2400": [10, 4], sub6: [12, 5] },
  pcb: { "920": [50, 15], "1575": [25, 10], "2400": [15, 6], sub6: [18, 6] },
  fpc: { "920": [40, 15], "1575": [22, 8], "2400": [15, 8], sub6: [20, 8] },
  spring: { "920": [30, 12], "1575": [18, 8], "2400": [8, 8], sub6: [10, 8] }
};

const sourceRefs: Record<AntennaKind, AntennaKeepoutData["sourceRefs"]> = {
  chip: ["johanson", "ignion"],
  pcb: ["ignion"],
  fpc: ["integration"],
  spring: ["integration"]
};

export const ANTENNA_KEEPOUT_REQUIREMENTS: readonly AntennaKeepoutData[] =
  (Object.keys(dimensions) as AntennaKind[]).flatMap((kind) =>
    (Object.keys(dimensions[kind]) as AntennaBand[]).map((band) => ({
      kind,
      band,
      requiredWidthMm: dimensions[kind][band][0],
      requiredHeightMm: dimensions[kind][band][1],
      sourceRefs: sourceRefs[kind],
      confidence: "confirmed" as const
    }))
  );

export function getAntennaKeepoutRequirement(
  kind: string,
  band: string
): AntennaKeepoutData | undefined {
  return ANTENNA_KEEPOUT_REQUIREMENTS.find(
    (item) => item.kind === kind && item.band === band
  );
}
