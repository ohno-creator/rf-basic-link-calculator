// ナミゲート（窓ガラス用 電波改善デバイス・30cm×30cm固定）の室内受信電力を、営業提案向けに
// 概算する2Dモデル。窓面に設置したナミゲートの設置前(OFF)／設置後(ON)／改善量(差分)を、
// 室内を格子状(34×24)に区切って計算する。
//
// ── 係数はすべて暫定値（実測値差し替え前提）──
// 周波数ごとの利得テーブル NAMI_GATE_GAIN_TABLE、ガラス損失 GLASS_TYPES、指向性補正・入射角
// 損失の各係数は、実測 or 電磁界解析の結果に置き換える前提のプレースホルダです。精度を上げる
// ときは、この最上部の定数群だけを差し替えれば表示・計算ロジックは変えずに済みます。
//
// ── モデル上の前提（顧客提示時の注意）──
// ・距離損失は「屋外（基地局→窓）＝絶対FSPL」＋「屋内（窓→受信点）＝窓面基準の相対スプレッド損失」
//   の2段で構成。屋内側は 20·log10(d/d_ref) の相対損失とし、自由空間定数の二重計上を避ける。
// ・開口は NAMI_GATE_SPEC.apertureEfficiency（0.72）として利得側に一度だけ反映（別途の開口補正は持たない）。
// ・入射角損失はガラス透過の角度依存として OFF 電力に反映し、利得側にも off-axis ロールオフとして一部反映する。
// ・反射・什器・人体・実機アンテナ指向性・MIMO等は含まない。色は固定dBmスケールの相対比較で、絶対値は未校正。

import type { CalloutTone } from "@/components/Callout";

export type GlassType = "standard" | "double" | "lowe" | "reinforced";

export type GlassOption = {
  id: GlassType;
  label: string;
  /** 窓ガラス単体の代表的な透過損失[dB]（概算・要実測裏取り）。 */
  lossDb: number;
  note: string;
};

export const GLASS_TYPES: GlassOption[] = [
  { id: "standard", label: "一般ガラス", lossDb: 3, note: "単板ガラスを想定。損失は小さめ。" },
  { id: "double", label: "複層ガラス", lossDb: 6, note: "一般的な複層（ペア）ガラスを想定。" },
  { id: "lowe", label: "Low-Eガラス", lossDb: 12, note: "金属膜による反射・遮蔽影響を想定。" },
  { id: "reinforced", label: "網入り・特殊ガラス", lossDb: 15, note: "金属線・特殊構造による損失を想定。" }
];

/** ナミゲートの固定仕様（30cm×30cm）。 */
export const NAMI_GATE_SPEC = {
  widthM: 0.3,
  heightM: 0.3,
  centerFrequencyGHz: 4.8,
  apertureEfficiency: 0.72,
  polarizationLossDb: 1.5
} as const;

export type GainPoint = { freqGHz: number; gainDb: number };

/** 周波数ごとのナミゲート透過改善の基準利得[dB]（暫定値・要実測裏取り）。線形補間して使う。 */
export const NAMI_GATE_GAIN_TABLE: GainPoint[] = [
  { freqGHz: 4.6, gainDb: 5.0 },
  { freqGHz: 4.7, gainDb: 6.5 },
  { freqGHz: 4.8, gainDb: 8.0 },
  { freqGHz: 4.9, gainDb: 7.2 },
  { freqGHz: 5.0, gainDb: 6.0 },
  { freqGHz: 5.1, gainDb: 4.8 },
  { freqGHz: 5.2, gainDb: 3.8 }
];

export const GRID_COLS = 34;
export const GRID_ROWS = 24;

// 屋内側スプレッド損失の基準距離[m]と一定の侵入・クラッタ超過損失[dB]（暫定値）。
const INDOOR_REF_M = 0.2;
const INDOOR_EXCESS_DB = 4.0;

// 指向性補正の係数（暫定値）。boresight(差0°)で +4.0dB、±90°で -1.5dB、120°で -4.25dB。
const DIR_CORR_AMPLITUDE_DB = 5.5;
const DIR_CORR_OFFSET_DB = 1.5;
const DIR_CORR_MAX_DIFF_DEG = 120;
// 入射角損失を利得側 off-axis ロールオフへ反映する割合（暫定値）。
const GAIN_ANGLE_PENALTY_RATIO = 0.35;

export type NamiGateInput = {
  /** 周波数[GHz]（4.6〜5.2）。 */
  frequencyGHz: number;
  /** 窓面法線に対する電波の入射角[deg]（-60〜60）。 */
  incidentAngleDeg: number;
  /** 送信電力[dBm]（基地局EIRP相当）。 */
  txPowerDbm: number;
  /** 屋外（基地局→窓）の距離[m]。 */
  outdoorDistanceM: number;
  /** 室内幅[m]（窓面に平行）。 */
  roomWidthM: number;
  /** 室内奥行[m]（窓面から室内方向）。 */
  roomDepthM: number;
  glassType: GlassType;
};

export const defaultNamiGateInput: NamiGateInput = {
  frequencyGHz: 4.8,
  incidentAngleDeg: 0,
  txPowerDbm: 23,
  outdoorDistanceM: 10,
  roomWidthM: 6,
  roomDepthM: 5,
  glassType: "lowe"
};

export type HeatmapMode = "off" | "on" | "diff";

export const HEATMAP_MODES: { id: HeatmapMode; label: string; short: string }[] = [
  { id: "off", label: "設置なし", short: "OFF" },
  { id: "on", label: "設置あり", short: "ON" },
  { id: "diff", label: "改善量", short: "差分" }
];

// ── 純粋関数（単体テスト可能・係数差し替えの単一ソース）──

/** 周波数[GHz]からナミゲート基準利得[dB]を線形補間（テーブル端でクランプ）。 */
export function interpGain(freqGHz: number): number {
  const table = NAMI_GATE_GAIN_TABLE;
  if (freqGHz <= table[0].freqGHz) return table[0].gainDb;
  const last = table[table.length - 1];
  if (freqGHz >= last.freqGHz) return last.gainDb;
  for (let i = 0; i < table.length - 1; i += 1) {
    const left = table[i];
    const right = table[i + 1];
    if (freqGHz >= left.freqGHz && freqGHz <= right.freqGHz) {
      const ratio = (freqGHz - left.freqGHz) / (right.freqGHz - left.freqGHz);
      return left.gainDb + ratio * (right.gainDb - left.gainDb);
    }
  }
  return table[0].gainDb;
}

/** 自由空間損失[dB]。屋外（基地局→窓）の絶対損失に使う。 */
export function calculateFsplDb(distanceM: number, freqGHz: number): number {
  const safeKm = Math.max(distanceM, 0.1) / 1000;
  const freqMHz = freqGHz * 1000;
  return 32.44 + 20 * Math.log10(safeKm) + 20 * Math.log10(freqMHz);
}

/**
 * 屋内（窓→受信点）の相対スプレッド損失[dB]。窓面の基準距離 INDOOR_REF_M を 0dB 基準とした
 * 20·log10(d/d_ref) ＋ 一定の侵入・クラッタ超過損失。自由空間定数を二重計上しないための相対量。
 */
export function calculateIndoorLossDb(distanceM: number): number {
  const d = Math.max(distanceM, INDOOR_REF_M);
  return 20 * Math.log10(d / INDOOR_REF_M) + INDOOR_EXCESS_DB;
}

/** 窓ガラス透過の入射角依存損失[dB]。cosθで結合効率を近似（0.08で飽和）。 */
export function calculateAngleLossDb(angleDeg: number): number {
  const rad = (Math.abs(angleDeg) * Math.PI) / 180;
  const coupling = Math.max(Math.cos(rad), 0.08);
  return -20 * Math.log10(coupling);
}

/** ナミゲートの実効透過改善[dB]。利得テーブル − off-axis penalty − 偏波損失 ＋ 開口効率（一度だけ反映）。 */
export function calculateNamiGateGainDb(freqGHz: number, incidentAngleDeg: number): number {
  const base = interpGain(freqGHz);
  const anglePenaltyDb = calculateAngleLossDb(incidentAngleDeg) * GAIN_ANGLE_PENALTY_RATIO;
  const apertureEfficiencyDb = 10 * Math.log10(NAMI_GATE_SPEC.apertureEfficiency);
  return Math.max(base - anglePenaltyDb - NAMI_GATE_SPEC.polarizationLossDb + apertureEfficiencyDb, 0);
}

/** セルのビーム差角[deg]に対する指向性補正[dB]（deg→rad 変換に注意）。 */
export function calculateDirectionalCorrectionDb(beamDifferenceDeg: number): number {
  const limited = Math.min(Math.abs(beamDifferenceDeg), DIR_CORR_MAX_DIFF_DEG);
  const rad = (limited * Math.PI) / 180;
  return DIR_CORR_AMPLITUDE_DB * Math.cos(rad) - DIR_CORR_OFFSET_DB;
}

export type SimStats = { min: number; max: number; avg: number };

export type Derived = {
  glassLossDb: number;
  angleLossDb: number;
  outdoorLossDb: number;
  namiGateGainDb: number;
};

export type EvalLevel = "effective" | "promising" | "check" | "tough";

export type Evaluation = {
  level: EvalLevel;
  label: string;
  detail: string;
  tone: CalloutTone;
};

export type NamiGateSimulation = {
  /** 行優先(row-major, index = row*GRID_COLS + col)の受信電力[dBm] / 改善量[dB]。 */
  off: Float32Array;
  on: Float32Array;
  diff: Float32Array;
  offStats: SimStats;
  onStats: SimStats;
  diffStats: SimStats;
  derived: Derived;
  evaluation: Evaluation;
};

function statsOf(values: Float32Array): SimStats {
  let min = Infinity;
  let max = -Infinity;
  let sum = 0;
  for (let i = 0; i < values.length; i += 1) {
    const v = values[i];
    if (v < min) min = v;
    if (v > max) max = v;
    sum += v;
  }
  return { min, max, avg: sum / values.length };
}

/**
 * 室内格子の OFF/ON/差分マップを計算する。
 * 幾何の約束：窓は室内上辺の中央 (x=roomWidth/2, y=0)。+x は右、+y は室内奥方向。
 * beamAngle = atan2(dx, dy)（正面=0°, 右=+, 左=-）。これは入射角 incidentAngle の符号と整合する。
 * この約束はヒートマップ描画（窓マーカー・入射ray）と入力の符号を一致させるため変更しないこと。
 */
export function calculateSimulation(input: NamiGateInput): NamiGateSimulation {
  const { frequencyGHz, incidentAngleDeg, txPowerDbm, outdoorDistanceM, roomWidthM, roomDepthM, glassType } = input;

  const glassLossDb = (GLASS_TYPES.find((g) => g.id === glassType) ?? GLASS_TYPES[0]).lossDb;
  const angleLossDb = calculateAngleLossDb(incidentAngleDeg);
  const outdoorLossDb = calculateFsplDb(outdoorDistanceM, frequencyGHz);
  const namiGateGainDb = calculateNamiGateGainDb(frequencyGHz, incidentAngleDeg);

  const size = GRID_COLS * GRID_ROWS;
  const off = new Float32Array(size);
  const on = new Float32Array(size);
  const diff = new Float32Array(size);

  const windowX = roomWidthM / 2;

  for (let row = 0; row < GRID_ROWS; row += 1) {
    const y = ((row + 1) / GRID_ROWS) * roomDepthM;
    for (let col = 0; col < GRID_COLS; col += 1) {
      const x = (col / (GRID_COLS - 1)) * roomWidthM;
      const dx = x - windowX;
      const dy = y;
      const indoorDistanceM = Math.max(Math.hypot(dx, dy), 0.2);
      const indoorLossDb = calculateIndoorLossDb(indoorDistanceM);

      const beamAngleDeg = (Math.atan2(dx, dy) * 180) / Math.PI;
      const beamDifferenceDeg = Math.abs(beamAngleDeg - incidentAngleDeg);
      const directionalCorrectionDb = calculateDirectionalCorrectionDb(beamDifferenceDeg);

      const offPower = txPowerDbm - outdoorLossDb - glassLossDb - angleLossDb - indoorLossDb;
      // 設置効果は0未満にしない：受動デバイスは設置でOFFを下回らない前提（指向性補正が利得を上回る
      // off-axis端でもONはOFF以上）。係数差し替えで負側に振れても改善量は0で下げ止まる。
      const deviceGainDb = Math.max(namiGateGainDb + directionalCorrectionDb, 0);
      const onPower = offPower + deviceGainDb;

      const index = row * GRID_COLS + col;
      off[index] = offPower;
      on[index] = onPower;
      diff[index] = deviceGainDb;
    }
  }

  const onStats = statsOf(on);
  const diffStats = statsOf(diff);

  return {
    off,
    on,
    diff,
    offStats: statsOf(off),
    onStats,
    diffStats,
    derived: { glassLossDb, angleLossDb, outdoorLossDb, namiGateGainDb },
    evaluation: getEvaluation(onStats.avg, diffStats.avg)
  };
}

/** 平均ON受信電力と平均改善量から営業判定を返す（しきい値は暫定）。 */
export function getEvaluation(avgOnPowerDbm: number, avgDiffDb: number): Evaluation {
  const p = avgOnPowerDbm.toFixed(1);
  const d = avgDiffDb.toFixed(1);
  if (avgOnPowerDbm >= -65 && avgDiffDb >= 5) {
    return {
      level: "effective",
      label: "有効",
      tone: "success",
      detail: `平均受信電力 ${p}dBm／平均改善量 +${d}dB のため、本提案条件では室内通信品質の改善が期待できます。`
    };
  }
  if (avgOnPowerDbm >= -75 && avgDiffDb >= 3) {
    return {
      level: "promising",
      label: "改善見込み",
      tone: "info",
      detail: `平均受信電力 ${p}dBm／平均改善量 +${d}dB。一定の改善が見込めます。設置位置の最適化を推奨します。`
    };
  }
  if (avgDiffDb >= 3) {
    return {
      level: "check",
      label: "要確認",
      tone: "caution",
      detail: `平均改善量 +${d}dB の傾向はありますが、平均受信電力 ${p}dBm と低めです。現地測定での確認を推奨します。`
    };
  }
  return {
    level: "tough",
    label: "厳しい",
    tone: "warning",
    detail: `平均受信電力 ${p}dBm／平均改善量 +${d}dB。条件が厳しいため、別配置または複数設置の検討が必要です。`
  };
}

// ── 配色（固定しきい値・CVD配慮の輝度単調パレット）──
// 受信電力：cividis系（弱=暗い青 → 強=明るい黄）。輝度が単調なのでグレースケール／色覚特性でも順序が読める。
// 改善量：単一色相のstaf青ランプ（小=淡い → 大=濃い）。発散配色を避け色覚に安全。

export type CellMode = "power" | "diff";

export const modeToCellMode = (mode: HeatmapMode): CellMode => (mode === "diff" ? "diff" : "power");

export type HeatStop = { /** この色になる下限値 */ min: number; label: string; fill: string; text: string };

// 受信電力 dBm（強→弱）。
export const POWER_STOPS: HeatStop[] = [
  { min: -50, label: "-50dBm〜", fill: "#ffe945", text: "#1f2933" },
  { min: -60, label: "-60", fill: "#c6ab48", text: "#1f2933" },
  // -70帯は白文字がAA(4.5:1)を満たすよう、cividis経路上で少し暗いグレーへ（#8a865d=3.7:1は不足）。
  { min: -70, label: "-70", fill: "#6d7178", text: "#ffffff" },
  { min: -80, label: "-80", fill: "#57607a", text: "#ffffff" },
  { min: -90, label: "-90", fill: "#2c3e72", text: "#ffffff" },
  { min: -Infinity, label: "-90未満", fill: "#00204d", text: "#ffffff" }
];

// 改善量 dB（大→小）。
export const DIFF_STOPS: HeatStop[] = [
  { min: 8, label: "+8dB〜", fill: "#00396b", text: "#ffffff" },
  { min: 6, label: "+6", fill: "#005a95", text: "#ffffff" },
  { min: 4, label: "+4", fill: "#0071bd", text: "#ffffff" },
  { min: 2, label: "+2", fill: "#5aa6d8", text: "#1f2933" },
  { min: 0, label: "+0", fill: "#b3d7ef", text: "#1f2933" },
  { min: -Infinity, label: "0未満", fill: "#cbd5e1", text: "#1f2933" }
];

export const stopsFor = (mode: CellMode): HeatStop[] => (mode === "diff" ? DIFF_STOPS : POWER_STOPS);

/** 値→セル配色。非有限値は最弱色にフォールバック。 */
export function cellColor(value: number, mode: CellMode): { fill: string; text: string } {
  const stops = stopsFor(mode);
  if (!Number.isFinite(value)) {
    const last = stops[stops.length - 1];
    return { fill: last.fill, text: last.text };
  }
  for (const stop of stops) {
    if (value >= stop.min) return { fill: stop.fill, text: stop.text };
  }
  const last = stops[stops.length - 1];
  return { fill: last.fill, text: last.text };
}

/** 符号付き整形（+/-）。改善量など、係数差し替えで負に振れ得る値の表示に使う（"+-3.2"を防ぐ）。 */
export const signed = (value: number, digits = 1): string => `${value >= 0 ? "+" : ""}${value.toFixed(digits)}`;

// ── 書き出し（提案資料への転用）──

const glassLabel = (id: GlassType) => (GLASS_TYPES.find((g) => g.id === id) ?? GLASS_TYPES[0]).label;

/** 提案書に貼れる日本語サマリ（条件＋判定＋主要数値＋注意書き）。 */
export function buildProposalSummary(input: NamiGateInput, sim: NamiGateSimulation): string {
  const lines = [
    "■ ナミゲート 室内受信電力シミュレーション（概算）",
    "",
    "【条件】",
    `・周波数: ${input.frequencyGHz.toFixed(2)} GHz`,
    `・ガラス種類: ${glassLabel(input.glassType)}（透過損失 約${sim.derived.glassLossDb}dB）`,
    `・入射角: ${input.incidentAngleDeg}°`,
    `・送信電力: ${input.txPowerDbm} dBm／屋外距離: ${input.outdoorDistanceM} m`,
    `・室内寸法: ${input.roomWidthM}m × ${input.roomDepthM}m`,
    `・ナミゲート: 30cm×30cm（開口効率 ${Math.round(NAMI_GATE_SPEC.apertureEfficiency * 100)}%）`,
    "",
    "【結果（設置あり）】",
    `・平均受信電力: ${sim.onStats.avg.toFixed(1)} dBm（最大 ${sim.onStats.max.toFixed(1)} / 最小 ${sim.onStats.min.toFixed(1)}）`,
    `・平均改善量: ${signed(sim.diffStats.avg)} dB（最大 ${signed(sim.diffStats.max)}）`,
    `・判定: ${sim.evaluation.label} — ${sim.evaluation.detail}`,
    "",
    "※本数値は営業提案用の概算です。利得・補正係数は暫定値（実測値差し替え前提）、色は相対比較で絶対dBmは未校正です。",
    "　実際の通信品質は基地局・端末アンテナ、偏波、窓枠、反射、什器、人体遮蔽、マルチパス等で変動します。",
    "　最終判断には現地測定または電磁界解析を推奨します。"
  ];
  return lines.join("\n");
}

/** 室内格子の受信電力/改善量をCSV化（行=奥行y, 列=幅x）。 */
export function toCsv(sim: NamiGateSimulation, mode: HeatmapMode): string {
  const data = mode === "off" ? sim.off : mode === "diff" ? sim.diff : sim.on;
  const unit = mode === "diff" ? "dB" : "dBm";
  const header = ["row\\col", ...Array.from({ length: GRID_COLS }, (_, c) => `c${c}`)].join(",");
  const rows: string[] = [`# NamiGate ${mode} (${unit})`, header];
  for (let row = 0; row < GRID_ROWS; row += 1) {
    const cells: string[] = [`r${row}`];
    for (let col = 0; col < GRID_COLS; col += 1) {
      cells.push(data[row * GRID_COLS + col].toFixed(1));
    }
    rows.push(cells.join(","));
  }
  return rows.join("\n");
}
