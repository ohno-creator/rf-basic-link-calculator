/**
 * 筐体・近接物によるアンテナ離調（detuning）の典型シナリオ表。
 *
 * 各シナリオは「共振周波数のシフト率[%]（負値=低周波側へ移動）」と
 * 「劣化後VSWRの典型レンジ」を持つ。値はアンテナベンダの公開資料・査読論文が示す
 * 典型レンジの転記であり、実際のシフト量は筐体材質・厚み・離隔・GND条件で変わる。
 * **目安値（実測前提）**として扱い、量産判断は筐体込みの実測で行うこと。
 *
 * 出典（DETUNING_SOURCES に詳細）:
 * - Antenova White Paper: Antenna Detuning Explained
 * - Laird Connectivity Application Note: Antenna Selection and Integration in IoT Enclosures
 * - 査読論文 (2024): Evaluating Antenna Performance in Confined Plastic Housings for Wearables
 */

export type DetuningScenarioId =
  | "resin-cover-contact"
  | "resin-cover-1mm"
  | "resin-cover-3mm"
  | "hand-grip"
  | "metal-plane-1mm";

export type DetuningScenario = {
  /** シナリオの機械キー。 */
  id: DetuningScenarioId;
  /** UI表示名（日本語）。 */
  label: string;
  /** 共振周波数シフト率の下限側[%]（絶対値が小さい側・負値）。 */
  shiftMinPercent: number;
  /** 共振周波数シフト率の上限側[%]（絶対値が大きい側・負値）。 */
  shiftMaxPercent: number;
  /** 劣化後VSWRの典型レンジ下限。 */
  vswrMin: number;
  /** 劣化後VSWRの典型レンジ上限。 */
  vswrMax: number;
  /** 1行の状況説明（UIのチップ補足用）。 */
  note: string;
};

/** 離調シナリオ表（影響の軽い順ではなく、樹脂→人体→金属の物理的な系列順）。 */
export const DETUNING_SCENARIOS: readonly DetuningScenario[] = [
  {
    id: "resin-cover-contact",
    label: "樹脂カバー密着",
    shiftMinPercent: -3.0,
    shiftMaxPercent: -5.0,
    vswrMin: 2.5,
    vswrMax: 4.0,
    note: "ABS/PC等の樹脂がアンテナ素子に接触。誘電体装荷で共振が大きく下がる最悪級の樹脂条件。"
  },
  {
    id: "resin-cover-1mm",
    label: "樹脂カバー1mm",
    shiftMinPercent: -1.5,
    shiftMaxPercent: -2.5,
    vswrMin: 2.0,
    vswrMax: 3.0,
    note: "素子とカバーの間に約1mmの空隙。近傍界の一部が樹脂にかかり、まだ無視できない離調が残る。"
  },
  {
    id: "resin-cover-3mm",
    label: "樹脂カバー3mm",
    shiftMinPercent: -0.5,
    shiftMaxPercent: -1.0,
    vswrMin: 1.6,
    vswrMax: 2.0,
    note: "約3mmの空隙を確保。近傍界の強い領域を外れ、離調はほぼ許容範囲に収まることが多い。"
  },
  {
    id: "hand-grip",
    label: "手把持",
    shiftMinPercent: -4.0,
    shiftMaxPercent: -8.0,
    vswrMin: 3.5,
    vswrMax: 6.0,
    note: "手（高誘電率・損失性の人体組織）がアンテナ付近を覆う。ハンドヘルド機の代表的な劣化条件。"
  },
  {
    id: "metal-plane-1mm",
    label: "金属面近接1mm",
    shiftMinPercent: -10.0,
    shiftMaxPercent: -20.0,
    vswrMin: 5.0,
    vswrMax: 10.0,
    note: "金属板が素子から約1mm。鏡像電流で共振構造そのものが変わり、整合はほぼ崩壊する。"
  }
];

/** id からシナリオを引く（見つからなければ undefined）。 */
export function findDetuningScenario(id: DetuningScenarioId): DetuningScenario | undefined {
  return DETUNING_SCENARIOS.find((scenario) => scenario.id === id);
}

export type DetuningSourceKind = "whitepaper" | "application-note" | "paper";

export type DetuningSource = {
  /** 文献名。 */
  label: string;
  /** 公開元URL（DOI等が特定できない文献は省略し、書誌情報のみ示す）。 */
  href?: string;
  /** 文献種別。 */
  kind: DetuningSourceKind;
  /** この表のどの値の根拠かの注記。 */
  note: string;
};

/** 上表の数値レンジの出典。 */
export const DETUNING_SOURCES: readonly DetuningSource[] = [
  {
    label: "Antenova White Paper: Antenna Detuning Explained",
    href: "https://www.antenova.com/",
    kind: "whitepaper",
    note: "樹脂・人体・金属の近接による共振周波数の低下（低周波側シフト）とVSWR劣化の典型レンジ。"
  },
  {
    label: "Laird Connectivity Application Note: Antenna Selection and Integration in IoT Enclosures",
    href: "https://www.lairdconnect.com/",
    kind: "application-note",
    note: "筐体材質と素子〜カバー離隔（密着/1mm/3mm）ごとの離調量・整合劣化の設計指針。"
  },
  {
    label:
      "Evaluating Antenna Performance in Confined Plastic Housings for Wearables（査読論文, 2024）",
    kind: "paper",
    note: "樹脂筐体内・装着（手把持相当）状態でのアンテナ離調とVSWR劣化の実測評価。"
  }
];
