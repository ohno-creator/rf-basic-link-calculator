import { type LossPoint, referenceLossPoints } from "@/lib/rf/coax";

export type CableAssembly = {
  partNumber: string;
  description: string;
  /** 挿入損失（S12）の実測値[dB]。周波数昇順。 */
  points: LossPoint[];
};

export type ReferenceCable = {
  label: string;
  color: string;
  points: LossPoint[];
};

/**
 * 比較用：一般的な同軸ケーブルの参考ロス曲線（1m相当の目安）。
 * 2.4GHzでの代表減衰量[dB/m]を基準に √(f/2400) でスケールした概算
 * （各社データシートの代表値ベース・非実測）。
 */
export const referenceCables: ReferenceCable[] = [
  { label: "一般 細径 RG-178 相当（参考・1m）", color: "#f59e0b", points: referenceLossPoints(1.7, 1) },
  { label: "一般 RG-316 相当（参考・1m）", color: "#94a3b8", points: referenceLossPoints(1.2, 1) }
];

/**
 * 標準品（変換・延長用）同軸ケーブルの挿入損失 実測値。
 * 測定：スタッフ株式会社、500〜8000MHz の S12（マーカー読み値）、2026/5/11。
 */
export const cableAssemblies: CableAssembly[] = [
  {
    partNumber: "1702-003B",
    description: "標準品（変換・延長用）",
    points: [
      { freqMHz: 500, lossDb: 0.16 },
      { freqMHz: 800, lossDb: 0.21 },
      { freqMHz: 2000, lossDb: 0.36 },
      { freqMHz: 3000, lossDb: 0.41 },
      { freqMHz: 4000, lossDb: 0.5 },
      { freqMHz: 5000, lossDb: 0.49 },
      { freqMHz: 6000, lossDb: 0.51 },
      { freqMHz: 7000, lossDb: 0.68 },
      { freqMHz: 8000, lossDb: 0.88 }
    ]
  },
  {
    partNumber: "1702-004A",
    description: "標準品（変換・延長用）",
    points: [
      { freqMHz: 500, lossDb: 1.39 },
      { freqMHz: 800, lossDb: 1.8 },
      { freqMHz: 2000, lossDb: 2.97 },
      { freqMHz: 3000, lossDb: 3.72 },
      { freqMHz: 4000, lossDb: 4.38 },
      { freqMHz: 5000, lossDb: 5.0 },
      { freqMHz: 6000, lossDb: 5.73 },
      { freqMHz: 7000, lossDb: 6.22 },
      { freqMHz: 8000, lossDb: 6.77 }
    ]
  },
  {
    partNumber: "1702-013A",
    description: "標準品（変換・延長用）",
    points: [
      { freqMHz: 500, lossDb: 1.95 },
      { freqMHz: 800, lossDb: 2.53 },
      { freqMHz: 2000, lossDb: 4.25 },
      { freqMHz: 3000, lossDb: 5.36 },
      { freqMHz: 4000, lossDb: 6.4 },
      { freqMHz: 5000, lossDb: 7.34 },
      { freqMHz: 6000, lossDb: 8.21 },
      { freqMHz: 7000, lossDb: 8.97 },
      { freqMHz: 8000, lossDb: 9.85 }
    ]
  },
  {
    partNumber: "1702-015A",
    description: "標準品（変換・延長用）",
    points: [
      { freqMHz: 500, lossDb: 0.15 },
      { freqMHz: 800, lossDb: 0.21 },
      { freqMHz: 2000, lossDb: 0.37 },
      { freqMHz: 3000, lossDb: 0.47 },
      { freqMHz: 4000, lossDb: 0.59 },
      { freqMHz: 5000, lossDb: 0.87 },
      { freqMHz: 6000, lossDb: 0.74 },
      { freqMHz: 7000, lossDb: 0.76 },
      { freqMHz: 8000, lossDb: 1.04 }
    ]
  },
  {
    partNumber: "1702-016A",
    description: "標準品（変換・延長用）",
    points: [
      { freqMHz: 500, lossDb: 0.14 },
      { freqMHz: 800, lossDb: 0.21 },
      { freqMHz: 2000, lossDb: 0.4 },
      { freqMHz: 3000, lossDb: 0.43 },
      { freqMHz: 4000, lossDb: 0.48 },
      { freqMHz: 5000, lossDb: 0.44 },
      { freqMHz: 6000, lossDb: 0.52 },
      { freqMHz: 7000, lossDb: 0.58 },
      { freqMHz: 8000, lossDb: 0.68 }
    ]
  },
  {
    partNumber: "1702-017A",
    description: "標準品（変換・延長用）",
    points: [
      { freqMHz: 500, lossDb: 1.84 },
      { freqMHz: 800, lossDb: 2.42 },
      { freqMHz: 2000, lossDb: 3.95 },
      { freqMHz: 3000, lossDb: 4.89 },
      { freqMHz: 4000, lossDb: 5.72 },
      { freqMHz: 5000, lossDb: 6.41 },
      { freqMHz: 6000, lossDb: 7.25 },
      { freqMHz: 7000, lossDb: 7.89 },
      { freqMHz: 8000, lossDb: 8.65 }
    ]
  },
  {
    partNumber: "1702-018A",
    description: "標準品（変換・延長用）",
    points: [
      { freqMHz: 500, lossDb: 1.38 },
      { freqMHz: 800, lossDb: 1.77 },
      { freqMHz: 2000, lossDb: 2.91 },
      { freqMHz: 3000, lossDb: 3.63 },
      { freqMHz: 4000, lossDb: 4.33 },
      { freqMHz: 5000, lossDb: 4.93 },
      { freqMHz: 6000, lossDb: 5.65 },
      { freqMHz: 7000, lossDb: 6.27 },
      { freqMHz: 8000, lossDb: 6.79 }
    ]
  }
];
