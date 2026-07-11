/**
 * λ/4モノポール系アンテナの「GNDプレーン最長辺 Lg と効率低下」の目安表。
 *
 * λ/4モノポール（チップアンテナ・IFA・ワイヤ等の不平衡系）は、GNDプレーンに映る鏡像が
 * アンテナの残り半分を担う。GND最長辺 Lg が λ/4 を切ると鏡像が不完全になり、放射効率が
 * 段階的に低下する。本表はベンダーのアプリケーションノート（下記出典）に示される
 * 実測ベースの目安を、無次元比 Lg/λ に対する区分線形カーブとして転記したもの。
 *
 * 適用条件: Lg/λ ≥ 0.25 は低下 0dB（λ/4確保）にクランプ、Lg/λ < 0 は入力エラー。
 * 効率低下[dB] のみを扱い、共振周波数ずれ・整合ずれの影響は含まない（実機ではさらに悪化しうる）。
 */

export type GroundPlaneEfficiencyPoint = {
  /** GNDプレーン最長辺の波長比 Lg/λ（無次元）。 */
  lgOverLambda: number;
  /** 効率低下[dB]（0 = 低下なし、負値 = 低下）。 */
  efficiencyDropDb: number;
};

/**
 * Lg/λ → 効率低下[dB] の目安表（Lg/λ 昇順）。
 * λ/4（0.25）で低下なし、λ/10（0.10）で -6dB（電力1/4）、GNDなし（0）で -20dB。
 */
export const GROUND_PLANE_EFFICIENCY_TABLE: readonly GroundPlaneEfficiencyPoint[] = [
  { lgOverLambda: 0, efficiencyDropDb: -20 },
  { lgOverLambda: 0.05, efficiencyDropDb: -12 },
  { lgOverLambda: 0.1, efficiencyDropDb: -6 },
  { lgOverLambda: 0.15, efficiencyDropDb: -3 },
  { lgOverLambda: 0.2, efficiencyDropDb: -1 },
  { lgOverLambda: 0.25, efficiencyDropDb: 0 }
];

export type GroundPlaneEffectSource = {
  /** 出典の表示名。 */
  label: string;
  /** 参照先URL。 */
  href: string;
  /** 出典の種別。 */
  kind: "application-note" | "vendor-page";
  /** どの数値・主張の根拠かの注記。 */
  note: string;
};

/** 目安表の根拠となる一次出典。UI（適用条件の注記・コラム深掘り）から参照する。 */
export const GROUND_PLANE_EFFECT_SOURCES: readonly GroundPlaneEffectSource[] = [
  {
    label: "TI AN058 (SWRA161) \"Antenna Selection Guide\" §3.1.2",
    href: "https://www.ti.com/lit/pdf/swra161",
    kind: "application-note",
    note: "GNDプレーンがλ/4モノポールの「残り半分」であり、寸法不足で効率・整合が劣化するという設計指針の一次出典。"
  },
  {
    label: "TI DN035 (SWRA351) \"Antenna Quick Guide\"",
    href: "https://www.ti.com/lit/pdf/swra351",
    kind: "application-note",
    note: "Sub-GHz/2.4GHz帯の各アンテナに必要なGNDプレーン寸法の推奨値（λ/4目安）の早見。"
  },
  {
    label: "EnOcean AN102 \"Antenna Basics\" §4",
    href: "https://www.enocean.com/en/support/knowledge-base/",
    kind: "vendor-page",
    note: "小型モジュールでGNDプレーンが縮むほど放射効率が急落するという実測系の記述（配布ページ）。"
  }
];
