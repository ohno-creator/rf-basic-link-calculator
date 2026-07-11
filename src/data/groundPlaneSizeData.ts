/**
 * Track G2 λ/4系アンテナのGND長/λに対する効率変化目安。
 * 正本: docs/handoff/track-g-data-literature-pack.md §1（Antigravity確認済み）。
 * 負値は十分なGND状態からの効率悪化[dB]。区分線形補間して使用する。
 */
import type { GroundPlaneEfficiencyPoint } from "@/lib/rf/groundPlaneSize";

export const GROUND_PLANE_SIZE_SOURCES = {
  tiAn058: "Texas Instruments AN058, Antenna Selection Guide §3.1.2 Ground Plane",
  tiDn035: "Texas Instruments DN035, Antenna Selection Quick Guide",
  enoceanAn102: "EnOcean AN102, Antenna Basics §4 Ground Plane"
} as const;

export const GROUND_PLANE_EFFICIENCY_TABLE: readonly GroundPlaneEfficiencyPoint[] = [
  { ratio: 0, efficiencyChangeDb: -20 },
  { ratio: 0.05, efficiencyChangeDb: -12 },
  { ratio: 0.1, efficiencyChangeDb: -6 },
  { ratio: 0.15, efficiencyChangeDb: -3 },
  { ratio: 0.2, efficiencyChangeDb: -1 },
  { ratio: 0.25, efficiencyChangeDb: 0 }
];

export const GROUND_PLANE_SIZE_DATA_CONFIDENCE = "confirmed" as const;
