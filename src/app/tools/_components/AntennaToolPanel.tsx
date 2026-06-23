"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis
} from "recharts";
import { Card } from "@/components/Card";
import { NumberField } from "@/components/NumberField";
import { Stat, type StatTone } from "@/components/Stat";
import { Tooltip } from "@/components/Tooltip";
import { chartTheme } from "@/lib/chartTheme";
import {
  calculateAntennaSpacing,
  calculateApertureAntenna,
  calculateEffectiveAperture,
  calculateGratingLobes,
  calculateLargeArrayNearField,
  calculatePatchAntenna,
  calculateRadiationResistance,
  calculateReflectorRisEffect,
  calculateSmallAntennaLimit,
  calculateSmallLoop,
  type ShortAntennaKind
} from "@/lib/rf/antenna";
import { formatMeters, formatNumber } from "@/lib/rf/format";
import { FormulaExplanationCard } from "../rf-basic-link-calculator/components/FormulaExplanationCard";

export type AntennaToolId =
  | "effective-aperture"
  | "aperture-gain-beamwidth"
  | "antenna-spacing"
  | "array-grating-lobe"
  | "patch-antenna-dimensions"
  | "small-loop-resonance"
  | "radiation-resistance"
  | "small-antenna-limit"
  | "large-array-near-field"
  | "reflector-ris-size-effect";

type FieldConfig = {
  key: string;
  label: string;
  unit: string;
  help: string;
  min?: number;
  max?: number;
  step?: number;
  showSlider?: boolean;
};

type Preset = {
  label: string;
  values: Record<string, number>;
  kind?: ShortAntennaKind;
};

type ToolConfig = {
  title: string;
  lead: string;
  defaults: Record<string, number>;
  fields: FieldConfig[];
  presets: Preset[];
};

type ResultCard = {
  label: string;
  value: string;
  unit?: string;
  help: string;
  tone?: StatTone;
};

type ChartPoint = {
  label: string;
  value: number;
  value2?: number;
};

type ChartSeries = {
  key: "value" | "value2";
  name: string;
  color: string;
};

type ToolView = {
  cards: ResultCard[];
  diagram: {
    title: string;
    variant: AntennaToolId;
    labels: string[];
  };
  chart: {
    title: string;
    description: string;
    data: ChartPoint[];
    unit: string;
    series: ChartSeries[];
    reference?: number;
    referenceLabel?: string;
  };
  formula: string;
  explanation: string;
  columnTitle: string;
  column: string[];
  warning?: string;
};

type Guidance = {
  tutorial: string[];
  terms: Array<{ term: string; description: string }>;
};

const configs: Record<AntennaToolId, ToolConfig> = {
  "effective-aperture": {
    title: "有効開口面積・受信面積",
    lead:
      "アンテナ利得を「どれくらいの面積で電波を受けているか」に変換します。dBiの感覚を、面積として掴めます。",
    defaults: { frequencyMHz: 920, gainDbi: 2.15 },
    fields: [
      {
        key: "frequencyMHz",
        label: "周波数",
        unit: "MHz",
        min: 1,
        step: 1,
        help: "有効開口は波長の2乗に比例します。同じ利得でも、920MHzでは面積が大きく、2.4GHzや5GHzでは小さくなります。"
      },
      {
        key: "gainDbi",
        label: "アンテナ利得",
        unit: "dBi",
        step: 0.1,
        help: "等方性アンテナを基準にした利得です。受信有効開口 Ae = λ²G/(4π) で面積に換算します。"
      }
    ],
    presets: [
      { label: "920MHz 2.15dBi", values: { frequencyMHz: 920, gainDbi: 2.15 } },
      { label: "Wi-Fi 2.4GHz 3dBi", values: { frequencyMHz: 2400, gainDbi: 3 } },
      { label: "Sub6 4.8GHz 8dBi", values: { frequencyMHz: 4800, gainDbi: 8 } }
    ]
  },
  "aperture-gain-beamwidth": {
    title: "開口アンテナ利得・ビーム幅",
    lead:
      "ホーン、パラボラ、レンズ、ミリ波アンテナの開口径から、概算利得とビーム幅を計算します。",
    defaults: { frequencyMHz: 60000, diameterM: 0.05, efficiencyPercent: 60 },
    fields: [
      {
        key: "frequencyMHz",
        label: "周波数",
        unit: "MHz",
        min: 1,
        step: 100,
        help: "周波数が高いほど波長が短くなり、同じ開口径でも高利得・細ビームになります。60GHzなら60000MHzです。"
      },
      {
        key: "diameterM",
        label: "開口径",
        unit: "m",
        min: 0.001,
        step: 0.005,
        help: "円形開口の直径です。ホーン開口、レンズ径、パラボラ径などの代表寸法を入れます。"
      },
      {
        key: "efficiencyPercent",
        label: "開口効率",
        unit: "%",
        min: 1,
        max: 100,
        step: 1,
        help: "開口をどれだけ有効に使えているかの係数です。初期検討では50〜70%を目安にします。"
      }
    ],
    presets: [
      { label: "60GHz 小型レンズ", values: { frequencyMHz: 60000, diameterM: 0.05, efficiencyPercent: 60 } },
      { label: "5GHz 小型パラボラ", values: { frequencyMHz: 5000, diameterM: 0.3, efficiencyPercent: 55 } },
      { label: "24GHz ホーン", values: { frequencyMHz: 24000, diameterM: 0.08, efficiencyPercent: 65 } }
    ]
  },
  "antenna-spacing": {
    title: "アンテナ間隔 λ換算",
    lead:
      "MIMOや複数アンテナ配置の間隔を、波長に対する割合で評価します。mmやcmの距離を電気的な距離へ変換します。",
    defaults: { frequencyMHz: 2400, spacingM: 0.0625 },
    fields: [
      {
        key: "frequencyMHz",
        label: "周波数",
        unit: "MHz",
        min: 1,
        step: 1,
        help: "同じ物理間隔でも、周波数が高いほどλ換算では広くなります。"
      },
      {
        key: "spacingM",
        label: "アンテナ間隔",
        unit: "m",
        min: 0.001,
        step: 0.001,
        help: "アンテナ給電点どうし、または素子中心どうしの距離を入れます。MIMOではλ/2前後がよく使われます。"
      }
    ],
    presets: [
      { label: "2.4GHz λ/2", values: { frequencyMHz: 2400, spacingM: 0.0625 } },
      { label: "920MHz 10cm", values: { frequencyMHz: 920, spacingM: 0.1 } },
      { label: "Sub6 5cm", values: { frequencyMHz: 4800, spacingM: 0.05 } }
    ]
  },
  "array-grating-lobe": {
    title: "アレイ素子間隔・グレーティングローブ",
    lead:
      "アレイアンテナの素子間隔と走査角から、不要なグレーティングローブが見えるかを判定します。",
    defaults: { frequencyMHz: 4800, spacingM: 0.031, scanAngleDeg: 45 },
    fields: [
      {
        key: "frequencyMHz",
        label: "周波数",
        unit: "MHz",
        min: 1,
        step: 1,
        help: "波長を決める周波数です。Sub6やミリ波のアレイ設計では素子間隔がλに対して何倍かが重要です。"
      },
      {
        key: "spacingM",
        label: "素子間隔",
        unit: "m",
        min: 0.001,
        step: 0.001,
        help: "隣り合う素子中心の間隔です。広すぎるとビーム走査時に不要ローブが現れます。"
      },
      {
        key: "scanAngleDeg",
        label: "走査角",
        unit: "deg",
        min: -80,
        max: 80,
        step: 1,
        showSlider: true,
        help: "正面（ブロードサイド）からどれだけビームを傾けるかです。大きく振るほど安全な素子間隔は狭くなります。"
      }
    ],
    presets: [
      { label: "Sub6 λ/2・45°", values: { frequencyMHz: 4800, spacingM: 0.031, scanAngleDeg: 45 } },
      { label: "28GHz λ/2・60°", values: { frequencyMHz: 28000, spacingM: 0.00535, scanAngleDeg: 60 } },
      { label: "広め間隔の失敗例", values: { frequencyMHz: 4800, spacingM: 0.06, scanAngleDeg: 45 } }
    ]
  },
  "patch-antenna-dimensions": {
    title: "矩形パッチアンテナ寸法",
    lead:
      "周波数、基板厚、比誘電率から、矩形マイクロストリップパッチの幅と長さを概算します。",
    defaults: { frequencyMHz: 1575.42, dielectricConstant: 3.38, substrateHeightMm: 1.6 },
    fields: [
      {
        key: "frequencyMHz",
        label: "中心周波数",
        unit: "MHz",
        min: 1,
        step: 0.1,
        help: "共振させたい周波数です。GNSS L1は1575.42MHz、2.4GHzなら2400MHzです。"
      },
      {
        key: "dielectricConstant",
        label: "基板の比誘電率",
        unit: "εr",
        min: 1.01,
        step: 0.01,
        help: "基板材料の比誘電率です。FR-4はおおよそ4前後ですが周波数や材料で変わります。"
      },
      {
        key: "substrateHeightMm",
        label: "基板厚",
        unit: "mm",
        min: 0.05,
        step: 0.05,
        help: "パッチとGND面の距離です。厚いほど帯域は広がりやすい一方、表面波などの影響も出ます。"
      }
    ],
    presets: [
      { label: "GNSS L1", values: { frequencyMHz: 1575.42, dielectricConstant: 3.38, substrateHeightMm: 1.6 } },
      { label: "2.4GHz FR-4", values: { frequencyMHz: 2400, dielectricConstant: 4.3, substrateHeightMm: 1.6 } },
      { label: "920MHz 低εr", values: { frequencyMHz: 920, dielectricConstant: 2.2, substrateHeightMm: 3.2 } }
    ]
  },
  "small-loop-resonance": {
    title: "小型ループアンテナ共振",
    lead:
      "小型ループのインダクタンスを近似し、指定周波数で共振させるための容量を計算します。",
    defaults: { frequencyMHz: 13.56, loopDiameterMm: 40, wireDiameterMm: 1, turns: 1 },
    fields: [
      {
        key: "frequencyMHz",
        label: "共振周波数",
        unit: "MHz",
        min: 0.001,
        step: 0.01,
        help: "共振させたい周波数です。NFCなら13.56MHz、低い周波数ほど必要容量や巻数の影響が大きくなります。"
      },
      {
        key: "loopDiameterMm",
        label: "ループ直径",
        unit: "mm",
        min: 1,
        step: 1,
        help: "円形ループに置き換えた直径です。四角ループの場合は同程度の周長になる円径を目安にします。"
      },
      {
        key: "wireDiameterMm",
        label: "導体の線径",
        unit: "mm",
        min: 0.01,
        step: 0.1,
        help: "ループ導体の太さです。インダクタンス近似に効きます。プリント配線なら同等の導体幅として見ます。"
      },
      {
        key: "turns",
        label: "巻数",
        unit: "turn",
        min: 1,
        step: 1,
        help: "ループの巻数です。インダクタンスは概ね巻数の2乗で増えます。"
      }
    ],
    presets: [
      { label: "NFC 13.56MHz", values: { frequencyMHz: 13.56, loopDiameterMm: 40, wireDiameterMm: 1, turns: 1 } },
      { label: "315MHz 小型ループ", values: { frequencyMHz: 315, loopDiameterMm: 25, wireDiameterMm: 0.8, turns: 1 } },
      { label: "125kHz 多巻き", values: { frequencyMHz: 0.125, loopDiameterMm: 50, wireDiameterMm: 0.3, turns: 30 } }
    ]
  },
  "radiation-resistance": {
    title: "短縮アンテナ放射抵抗・効率",
    lead:
      "波長より短いモノポール/ダイポールの放射抵抗を概算し、損失抵抗との比で効率を見ます。",
    defaults: { frequencyMHz: 920, lengthMm: 30, lossResistanceOhm: 2 },
    fields: [
      {
        key: "frequencyMHz",
        label: "周波数",
        unit: "MHz",
        min: 1,
        step: 1,
        help: "波長を決める周波数です。アンテナ長が同じでも、周波数が低いほど短縮度が大きくなります。"
      },
      {
        key: "lengthMm",
        label: "導体長",
        unit: "mm",
        min: 0.1,
        step: 1,
        help: "モノポールなら地板から先端まで、短いダイポールなら全長の目安です。短いほど放射抵抗が小さくなります。"
      },
      {
        key: "lossResistanceOhm",
        label: "損失抵抗",
        unit: "Ω",
        min: 0,
        step: 0.1,
        help: "導体損、コイル損、接地損などをまとめた抵抗です。放射抵抗より大きいと効率が急に下がります。"
      }
    ],
    presets: [
      { label: "920MHz 30mmモノポール", values: { frequencyMHz: 920, lengthMm: 30, lossResistanceOhm: 2 }, kind: "monopole" },
      { label: "2.4GHz 20mm", values: { frequencyMHz: 2400, lengthMm: 20, lossResistanceOhm: 1 }, kind: "monopole" },
      { label: "920MHz 短いダイポール", values: { frequencyMHz: 920, lengthMm: 60, lossResistanceOhm: 2 }, kind: "dipole" }
    ]
  },
  "small-antenna-limit": {
    title: "小型アンテナ限界（ka・Q・帯域）",
    lead:
      "アンテナを外接球半径で見たときの ka とChu限界Qを計算し、小型化と帯域の厳しさを見ます。",
    defaults: { frequencyMHz: 920, radiusMm: 20, targetBandwidthPercent: 2 },
    fields: [
      {
        key: "frequencyMHz",
        label: "周波数",
        unit: "MHz",
        min: 1,
        step: 1,
        help: "小型アンテナの厳しさは、アンテナ外形が波長に対してどれだけ小さいか（ka）で決まります。"
      },
      {
        key: "radiusMm",
        label: "外接球半径",
        unit: "mm",
        min: 0.1,
        step: 1,
        help: "アンテナ全体を包む球の半径です。筐体内蔵アンテナでは、許される実装空間の半径として入力します。"
      },
      {
        key: "targetBandwidthPercent",
        label: "目標比帯域",
        unit: "%",
        min: 0.001,
        step: 0.1,
        help: "中心周波数に対する必要帯域幅の割合です。例: 920MHzで20MHzなら約2.2%。"
      }
    ],
    presets: [
      { label: "920MHz 半径20mm", values: { frequencyMHz: 920, radiusMm: 20, targetBandwidthPercent: 2 } },
      { label: "2.4GHz 半径10mm", values: { frequencyMHz: 2400, radiusMm: 10, targetBandwidthPercent: 4 } },
      { label: "GNSS L1 半径8mm", values: { frequencyMHz: 1575.42, radiusMm: 8, targetBandwidthPercent: 1.5 } }
    ]
  },
  "large-array-near-field": {
    title: "大型アレイ近傍界・遠方界判定",
    lead:
      "アレイ開口が大きいと、従来の遠方界前提が想像以上に遠くなります。Fraunhofer距離と位相差を計算します。",
    defaults: { frequencyMHz: 28000, apertureSizeM: 0.5, distanceM: 10 },
    fields: [
      {
        key: "frequencyMHz",
        label: "周波数",
        unit: "MHz",
        min: 1,
        step: 10,
        help: "周波数が高く波長が短いほど、同じ開口でも遠方界距離が長くなります。"
      },
      {
        key: "apertureSizeM",
        label: "アレイ開口サイズ",
        unit: "m",
        min: 0.001,
        step: 0.01,
        help: "アレイの最大寸法です。正方形や円形なら直径/幅、長方形なら長辺を入れます。"
      },
      {
        key: "distanceM",
        label: "評価距離",
        unit: "m",
        min: 0.001,
        step: 0.1,
        help: "アンテナから相手端末、または測定点までの距離です。Fraunhofer距離より近いと近傍界効果が残ります。"
      }
    ],
    presets: [
      { label: "28GHz 50cmアレイ", values: { frequencyMHz: 28000, apertureSizeM: 0.5, distanceM: 10 } },
      { label: "Sub6 1m反射板", values: { frequencyMHz: 4800, apertureSizeM: 1, distanceM: 20 } },
      { label: "60GHz 10cm", values: { frequencyMHz: 60000, apertureSizeM: 0.1, distanceM: 2 } }
    ]
  },
  "reflector-ris-size-effect": {
    title: "反射板・RISサイズ効果",
    lead:
      "反射板やRISを、面積を持つ受動開口として見たときの上限利得、近傍界距離、2ホップ損失の目安を計算します。",
    defaults: { frequencyMHz: 4800, widthM: 1, heightM: 1, txDistanceM: 30, rxDistanceM: 30, efficiencyPercent: 50 },
    fields: [
      {
        key: "frequencyMHz",
        label: "周波数",
        unit: "MHz",
        min: 1,
        step: 10,
        help: "反射面の電気的な大きさは面積/λ²で効きます。Sub6、ミリ波、Wi-Fiなどで比較できます。"
      },
      {
        key: "widthM",
        label: "反射面の幅",
        unit: "m",
        min: 0.01,
        step: 0.01,
        help: "反射板またはRISの物理幅です。"
      },
      {
        key: "heightM",
        label: "反射面の高さ",
        unit: "m",
        min: 0.01,
        step: 0.01,
        help: "反射板またはRISの物理高さです。"
      },
      {
        key: "txDistanceM",
        label: "送信側から反射面",
        unit: "m",
        min: 0.01,
        step: 1,
        help: "送信アンテナから反射面までの距離です。"
      },
      {
        key: "rxDistanceM",
        label: "反射面から受信側",
        unit: "m",
        min: 0.01,
        step: 1,
        help: "反射面から受信アンテナまでの距離です。"
      },
      {
        key: "efficiencyPercent",
        label: "有効効率",
        unit: "%",
        min: 1,
        max: 100,
        step: 1,
        help: "反射面の位相制御、照明むら、損失をまとめた係数です。初期検討では30〜70%程度で感度を見ます。"
      }
    ],
    presets: [
      { label: "Sub6 1m角", values: { frequencyMHz: 4800, widthM: 1, heightM: 1, txDistanceM: 30, rxDistanceM: 30, efficiencyPercent: 50 } },
      { label: "28GHz 30cm角", values: { frequencyMHz: 28000, widthM: 0.3, heightM: 0.3, txDistanceM: 10, rxDistanceM: 10, efficiencyPercent: 60 } },
      { label: "Wi-Fi 5GHz 60cm角", values: { frequencyMHz: 5200, widthM: 0.6, heightM: 0.6, txDistanceM: 15, rxDistanceM: 15, efficiencyPercent: 45 } }
    ]
  }
};

const guidanceByTool: Record<AntennaToolId, Guidance> = {
  "effective-aperture": {
    tutorial: [
      "まず周波数を、実際に使う無線帯に合わせます。920MHz、2.4GHz、Sub6などで面積がどれだけ変わるかを見ます。",
      "次にアンテナ利得を仕様書のdBiで入れます。利得を上げると有効開口がどれだけ増えるか、グラフで傾きを確認します。",
      "最後に正方形換算の一辺を見て、アンテナサイズ感や受信しやすさの説明に使います。"
    ],
    terms: [
      { term: "有効開口 Ae", description: "アンテナが電波から電力を取り出す等価面積です。実物の投影面積と同じとは限りません。" },
      { term: "dBi", description: "等方性アンテナを基準にした利得です。3dBiは電力倍率で約2倍です。" },
      { term: "λ²比例", description: "同じ利得なら、有効開口は波長の2乗に比例します。低周波ほど面積が大きくなります。" },
      { term: "受信面積", description: "利得を直感的に説明するための見方です。リンクバジェットの受信側理解に役立ちます。" }
    ]
  },
  "aperture-gain-beamwidth": {
    tutorial: [
      "周波数と開口径を入れ、まず利得dBiと半値ビーム幅を見ます。",
      "開口効率を50〜70%で動かして、理想値からどれくらい下がるかを確認します。",
      "グラフで開口径を大きくした時の利得上昇とビーム幅低下を同時に見ます。"
    ],
    terms: [
      { term: "開口径 D", description: "ホーン、レンズ、パラボラなどの電波を受ける/出す面の代表寸法です。" },
      { term: "開口効率 η", description: "開口をどれだけ有効に使えているかの係数です。照明むらや損失で100%未満になります。" },
      { term: "半値ビーム幅", description: "主ビームがピークから3dB下がる角度幅です。小さいほど細いビームです。" },
      { term: "遠方界開始距離", description: "開口アンテナを平面波近似で測りやすくなる距離の目安です。" }
    ]
  },
  "antenna-spacing": {
    tutorial: [
      "周波数を入力し、実際のアンテナ間隔をm単位で入れます。",
      "間隔/λが0.25未満、0.5付近、0.75超えのどこにいるかを見ます。",
      "周波数を変えて、同じ筐体寸法が別の無線帯でどう見えるか比較します。"
    ],
    terms: [
      { term: "λ換算", description: "物理距離を波長で割った値です。周波数が違う配置を同じ尺度で比較できます。" },
      { term: "λ/2", description: "複数アンテナやアレイでよく使われる基準間隔です。" },
      { term: "相関", description: "MIMOアンテナ同士が似た信号を受けてしまう度合いです。近すぎると高くなりがちです。" },
      { term: "結合", description: "アンテナ同士が電磁的に影響し合うことです。近接配置では無視できません。" }
    ]
  },
  "array-grating-lobe": {
    tutorial: [
      "周波数と素子間隔を入れ、まず現在の間隔が何λかを確認します。",
      "走査角スライダーを動かして、安全上限がどこまで下がるかを見ます。",
      "判定が発生ありになったら、間隔を狭めるか走査角を小さくした時の変化を試します。"
    ],
    terms: [
      { term: "グレーティングローブ", description: "アレイの周期構造で生じる不要な強いビームです。意図しない方向へ電力が出ます。" },
      { term: "走査角", description: "アレイの主ビームを正面からどれだけ傾けるかを表す角度です。" },
      { term: "可視領域", description: "sinθが-1〜1に入る、実空間に放射される角度範囲です。" },
      { term: "素子間隔", description: "隣り合うアンテナ素子の中心間距離です。広すぎると不要ローブが出やすくなります。" }
    ]
  },
  "patch-antenna-dimensions": {
    tutorial: [
      "中心周波数、基板εr、基板厚を入れて、まずWとLの概算を見ます。",
      "εrを上げ下げして、基板材料でサイズがどう変わるか確認します。",
      "得られた寸法を、基板サイズやGND余白、給電位置の初期検討に使います。"
    ],
    terms: [
      { term: "矩形パッチ", description: "GND面上の金属板を共振させる平面アンテナです。基板上で作りやすい形式です。" },
      { term: "実効比誘電率", description: "電界が空気と基板の両方を通ることを考慮した見かけの誘電率です。" },
      { term: "フリンジ効果", description: "パッチ端から外へ回り込む電界により、電気的には物理長より長く見える現象です。" },
      { term: "基板厚 h", description: "パッチとGNDの距離です。帯域や効率、表面波に影響します。" }
    ]
  },
  "small-loop-resonance": {
    tutorial: [
      "共振周波数とループ直径を入れ、インダクタンスと必要容量を確認します。",
      "巻数や線径を動かして、必要容量がどれくらい変わるかを見ます。",
      "周長/λが大きすぎる場合は、小型ループ近似から外れる点に注意します。"
    ],
    terms: [
      { term: "インダクタンス L", description: "ループが磁界としてエネルギーを蓄える度合いです。巻数の2乗で増えやすい量です。" },
      { term: "共振容量 C", description: "指定周波数でLC共振させるために必要な容量です。寄生容量も含めて考えます。" },
      { term: "周長/λ", description: "ループ周囲長が波長に対してどれだけ大きいかの比です。小型近似の目安になります。" },
      { term: "Q", description: "共振の鋭さです。高いほど選択度は高い一方、帯域は狭くなります。" }
    ]
  },
  "radiation-resistance": {
    tutorial: [
      "周波数とアンテナ長を入れ、長さ/λと放射抵抗を確認します。",
      "損失抵抗を1〜5Ωで動かして、効率がどれだけ落ちるかを見ます。",
      "モノポール/ダイポールを切り替え、形式で放射抵抗の目安が変わることを確認します。"
    ],
    terms: [
      { term: "放射抵抗", description: "電波として出ていく電力を、抵抗で表現した等価量です。" },
      { term: "損失抵抗", description: "導体損、コイル損、接地損など、熱として失われる成分です。" },
      { term: "効率 η", description: "入力電力のうち放射へ回る割合です。ここではRr/(Rr+Rloss)で単純化しています。" },
      { term: "短縮アンテナ", description: "λ/4やλ/2よりかなり短いアンテナです。整合できても効率が落ちやすくなります。" }
    ]
  },
  "small-antenna-limit": {
    tutorial: [
      "外接球半径を、アンテナが入る実装空間の半径として入れます。",
      "kaとChu限界Qを見て、小型化の厳しさを確認します。",
      "目標比帯域を入れ、理想上限帯域を超えていないか判定します。"
    ],
    terms: [
      { term: "ka", description: "波数kと外接球半径aの積です。アンテナが波長に対してどれだけ小さいかを表します。" },
      { term: "Chu限界", description: "小型アンテナのQと帯域に関する古典的な物理限界の目安です。" },
      { term: "比帯域", description: "中心周波数に対する帯域幅の割合です。小型アンテナほど確保が難しくなります。" },
      { term: "外接球", description: "アンテナ全体を包む最小の球です。限界評価ではこの半径を使います。" }
    ]
  },
  "large-array-near-field": {
    tutorial: [
      "アレイの最大寸法と評価距離を入れ、Fraunhofer距離を確認します。",
      "評価距離がFraunhofer距離より近い場合、近傍界として扱うべき可能性を見ます。",
      "開口サイズを変えて、遠方界距離がD²で急増する感覚を掴みます。"
    ],
    terms: [
      { term: "Fraunhofer距離", description: "遠方界とみなす代表的な距離目安です。2D²/λで計算します。" },
      { term: "Fresnel数", description: "D²/(λR)で表す近傍界性の目安です。大きいほど球面波性が強くなります。" },
      { term: "近傍界", description: "波面の曲率や距離方向の焦点が無視できない領域です。" },
      { term: "XL-MIMO", description: "非常に大きなアンテナ数/開口を持つMIMOです。6G研究で近傍界性が注目されています。" }
    ]
  },
  "reflector-ris-size-effect": {
    tutorial: [
      "反射面の幅・高さと、送信側/受信側までの距離を入れます。",
      "開口上限利得と2ホップ損失を見て、面積を増やす効果を確認します。",
      "直接経路との差が大きい場合は、距離、面積、効率のどれが効いているかをグラフで見ます。"
    ],
    terms: [
      { term: "RIS", description: "Reconfigurable Intelligent Surface。反射/透過面の位相などを制御して電波環境を変える面です。" },
      { term: "受動開口", description: "増幅器を持たず、面積で電波を受けて再放射する開口として見る考え方です。" },
      { term: "2ホップ損失", description: "送信機から反射面、反射面から受信機までの2つの距離損失を合わせた見方です。" },
      { term: "近傍/遠方界", description: "反射面の大きさと距離によって、鏡のような幾何光学近似だけでは足りない場合があります。" }
    ]
  }
};

function smart(value: number, digits = 2): string {
  if (!Number.isFinite(value)) {
    return "-";
  }
  const abs = Math.abs(value);
  if (abs !== 0 && (abs >= 100_000 || abs < 0.001)) {
    return value.toExponential(2);
  }
  return formatNumber(value, digits);
}

function formatMm(valueM: number, digits = 1): string {
  return `${smart(valueM * 1000, digits)} mm`;
}

function formatArea(valueM2: number): string {
  if (valueM2 >= 1) {
    return `${smart(valueM2, 2)} m²`;
  }
  if (valueM2 >= 0.0001) {
    return `${smart(valueM2 * 10_000, 1)} cm²`;
  }
  return `${smart(valueM2 * 1_000_000, 1)} mm²`;
}

function card(label: string, value: string, unit: string | undefined, help: string, tone: StatTone = "staf"): ResultCard {
  return { label, value, unit, help, tone };
}

function frequencySweep(centerMHz: number): number[] {
  return [0.5, 0.75, 1, 1.5, 2].map((ratio) => Math.max(0.001, centerMHz * ratio));
}

function buildView(toolId: AntennaToolId, values: Record<string, number>, shortKind: ShortAntennaKind): ToolView {
  switch (toolId) {
    case "effective-aperture": {
      const result = calculateEffectiveAperture(values.frequencyMHz, values.gainDbi);
      const chart = frequencySweep(values.frequencyMHz).map((frequency) => ({
        label: `${smart(frequency, frequency >= 1000 ? 0 : 1)}`,
        value: calculateEffectiveAperture(frequency, values.gainDbi).areaCm2
      }));
      return {
        cards: [
          card("有効開口面積", formatArea(result.areaM2), undefined, "受信アンテナが電波から電力を取り出す等価面積です。"),
          card("正方形換算の一辺", formatMeters(result.squareSideM), undefined, "同じ面積の正方形に置き換えたときの一辺です。"),
          card("利得倍率", `×${smart(result.gainLinear, 2)}`, undefined, "dBiを電力倍率に換算した値です。")
        ],
        diagram: {
          title: "利得を受信面積として見る",
          variant: toolId,
          labels: [`Ae ${formatArea(result.areaM2)}`, `λ ${formatMeters(result.wavelengthM)}`, `${smart(values.gainDbi, 1)} dBi`]
        },
        chart: {
          title: "周波数を変えたときの有効開口",
          description: "同じ利得なら、有効開口はλ²に比例します。低い周波数ほど面積は急に大きくなります。",
          data: chart,
          unit: "cm²",
          series: [{ key: "value", name: "有効開口", color: chartTheme.series.source }]
        },
        formula: "Ae = λ²G / (4π)\nG = 10^(dBi / 10)",
        explanation: "アンテナ利得は、受信側では有効開口面積として解釈できます。dBiが同じでも、周波数が低いほど波長が長く、同じ利得を実現するための等価面積は大きくなります。",
        columnTitle: "コラム：dBiを面積に戻すとアンテナの実感が出る",
        column: [
          "920MHzと5GHzで同じ2dBiでも、有効開口は大きく違います。サブGHzのアンテナが物理的に大きくなりやすい理由が直感できます。",
          "受信電力の議論では利得だけを見がちですが、開口面積で見ると「電波をどれだけ拾えるか」の説明がしやすくなります。",
          "小型アンテナの実効利得が落ちると、リンクバジェットだけでなく受信面積も小さくなったと考えられます。"
        ]
      };
    }
    case "aperture-gain-beamwidth": {
      const result = calculateApertureAntenna({
        frequencyMHz: values.frequencyMHz,
        diameterM: values.diameterM,
        efficiencyPercent: values.efficiencyPercent
      });
      const chart = [0.4, 0.6, 0.8, 1, 1.25, 1.5].map((ratio) => {
        const diameter = Math.max(0.001, values.diameterM * ratio);
        const point = calculateApertureAntenna({
          frequencyMHz: values.frequencyMHz,
          diameterM: diameter,
          efficiencyPercent: values.efficiencyPercent
        });
        return {
          label: `${smart(diameter * 1000, 0)}`,
          value: point.gainDbi,
          value2: point.hpbwDeg
        };
      });
      return {
        cards: [
          card("概算利得", smart(result.gainDbi, 1), "dBi", "開口径と効率から求める理想寄りの利得です。"),
          card("半値ビーム幅", smart(result.hpbwDeg, 1), "deg", "主ビームのおおよその-3dB幅です。"),
          card("遠方界開始距離", formatMeters(result.fraunhoferM), undefined, "開口アンテナの測定で遠方界とみなす目安です。")
        ],
        diagram: {
          title: "開口径が利得とビーム幅を決める",
          variant: toolId,
          labels: [`D ${formatMeters(values.diameterM)}`, `${smart(result.gainDbi, 1)} dBi`, `HPBW ${smart(result.hpbwDeg, 1)}°`]
        },
        chart: {
          title: "開口径を変えたときの利得とビーム幅",
          description: "開口径が大きいほど利得は上がり、ビーム幅は狭くなります。",
          data: chart,
          unit: "dBi / deg",
          series: [
            { key: "value", name: "利得 dBi", color: chartTheme.series.source },
            { key: "value2", name: "ビーム幅 deg", color: chartTheme.series.loss }
          ]
        },
        formula: "G = η(πD/λ)²\nG[dBi] = 10log10(G)\nHPBW[deg] ≈ 70λ/D",
        explanation: "円形開口アンテナの一次近似です。実際のビーム幅やサイドローブは照明分布、レンズ/ホーン形状、エッジ処理で変わります。",
        columnTitle: "コラム：ミリ波で小さなレンズが高利得になる理由",
        column: [
          "利得はD/λの2乗で増えます。60GHzではλが約5mmなので、5cmの開口でもかなり大きな電気的サイズになります。",
          "高利得化は同時にビームを細くします。通信距離は伸びますが、向き合わせや筐体公差は厳しくなります。",
          "測定距離も2D²/λで伸びるため、開口が大きいアンテナほど近距離測定の解釈に注意が必要です。"
        ]
      };
    }
    case "antenna-spacing": {
      const result = calculateAntennaSpacing(values.frequencyMHz, values.spacingM);
      const chart = frequencySweep(values.frequencyMHz).map((frequency) => ({
        label: `${smart(frequency, frequency >= 1000 ? 0 : 1)}`,
        value: calculateAntennaSpacing(frequency, values.spacingM).spacingLambda
      }));
      const warning =
        result.spacingLambda < 0.25
          ? "λ/4未満です。MIMOでは相関が高くなりやすく、近接結合にも注意が必要です。"
          : result.spacingLambda > 0.75
            ? "λ/2を大きく超えています。アレイ用途では不要ローブ、筐体用途では配置自由度との兼ね合いを確認してください。"
            : undefined;
      return {
        cards: [
          card("間隔/波長", smart(result.spacingLambda, 2), "λ", "物理間隔を波長で割った値です。"),
          card("位相差換算", smart(result.phaseDeg, 0), "deg", "平面波がアンテナ間を進むときの1周期あたりの位相差です。"),
          card("λ/2の物理長", formatMeters(result.halfWaveM), undefined, "同じ周波数でλ/2を物理長に戻した値です。")
        ],
        diagram: {
          title: "物理距離をλで見る",
          variant: toolId,
          labels: [`間隔 ${formatMeters(values.spacingM)}`, `${smart(result.spacingLambda, 2)} λ`, `λ/2 ${formatMeters(result.halfWaveM)}`]
        },
        chart: {
          title: "周波数を変えたときのλ換算間隔",
          description: "同じ配置でも、周波数が上がると電気的な間隔は広くなります。",
          data: chart,
          unit: "λ",
          series: [{ key: "value", name: "間隔/λ", color: chartTheme.series.source }],
          reference: 0.5,
          referenceLabel: "λ/2"
        },
        formula: "間隔[λ] = 物理間隔[m] / λ[m]\n位相差[deg] = 間隔[λ] × 360",
        explanation: "MIMOや複数アンテナ配置では、cmではなくλで距離を見ると周波数をまたいで比較できます。λ/2はよく使われる基準ですが、筐体、偏波、グランド、相関の実測で最終判断します。",
        columnTitle: "コラム：アンテナ間隔はcmではなくλで考える",
        column: [
          "920MHzで10cmは約0.31λですが、2.4GHzで10cmは約0.8λです。同じ筐体寸法でも意味が変わります。",
          "MIMOでは離せば必ず良いわけではなく、相関、結合、放射パターン、筐体モードが絡みます。まずλ換算で初期判断します。",
          "複数無線を載せる端末では、最低限このλ換算を見てからアンテナの向きや偏波を決めると、手戻りが減ります。"
        ],
        warning
      };
    }
    case "array-grating-lobe": {
      const result = calculateGratingLobes({
        frequencyMHz: values.frequencyMHz,
        spacingM: values.spacingM,
        scanAngleDeg: values.scanAngleDeg
      });
      const chart = [-70, -50, -30, -10, 0, 10, 30, 50, 70].map((angle) => ({
        label: `${angle}`,
        value: calculateGratingLobes({
          frequencyMHz: values.frequencyMHz,
          spacingM: values.spacingM,
          scanAngleDeg: angle
        }).limitM * 1000,
        value2: values.spacingM * 1000
      }));
      return {
        cards: [
          card("現在の素子間隔", smart(result.spacingLambda, 2), "λ", "λ換算の素子間隔です。"),
          card("安全目安の上限", smart(result.limitLambda, 2), "λ", "指定走査角までグレーティングローブを避ける上限目安です。"),
          card("判定", result.hasVisibleGratingLobe ? "発生あり" : "発生なし", undefined, "m=±1以上のローブが可視領域に入るかを判定します。", result.hasVisibleGratingLobe ? "rose" : "emerald")
        ],
        diagram: {
          title: "走査角と不要ローブ",
          variant: toolId,
          labels: [
            `d ${smart(result.spacingLambda, 2)}λ`,
            `scan ${smart(values.scanAngleDeg, 0)}°`,
            result.lobes[0] ? `GL ${smart(result.lobes[0].angleDeg, 0)}°` : "no visible GL"
          ]
        },
        chart: {
          title: "走査角ごとの安全な素子間隔",
          description: "走査角が大きいほど、グレーティングローブを避けるための上限間隔は小さくなります。",
          data: chart,
          unit: "mm",
          series: [
            { key: "value", name: "安全上限 mm", color: chartTheme.series.source },
            { key: "value2", name: "現在の間隔 mm", color: chartTheme.series.loss }
          ]
        },
        formula: "可視グレーティング条件: |sinθ0 + mλ/d| ≤ 1\n安全目安: d/λ ≤ 1 / (1 + |sinθmax|)",
        explanation: "等間隔リニアアレイの基本式です。実際には素子パターン、振幅重み、筐体、相互結合でローブ強度は変わりますが、発生条件の一次判定として有効です。",
        columnTitle: "コラム：λ/2でも広角走査ではギリギリになる",
        column: [
          "正面だけを見るならλ/2は定番ですが、広い角度へビームを振るほど安全な間隔はλ/2より小さくなります。",
          "Sub6やミリ波のアレイでは、素子を詰めるほど結合や実装が難しく、広げるほどグレーティングローブが出やすくなります。",
          "このトレードオフをスライダーで動かすと、アレイ設計の難しさが直感的に見えます。"
        ],
        warning: result.hasVisibleGratingLobe
          ? "指定条件では可視領域にグレーティングローブ候補があります。素子間隔を狭める、走査角を抑える、素子パターンで抑圧するなどを検討してください。"
          : undefined
      };
    }
    case "patch-antenna-dimensions": {
      const result = calculatePatchAntenna({
        frequencyMHz: values.frequencyMHz,
        dielectricConstant: values.dielectricConstant,
        substrateHeightMm: values.substrateHeightMm
      });
      const chart = frequencySweep(values.frequencyMHz).map((frequency) => {
        const point = calculatePatchAntenna({
          frequencyMHz: frequency,
          dielectricConstant: values.dielectricConstant,
          substrateHeightMm: values.substrateHeightMm
        });
        return {
          label: `${smart(frequency, frequency >= 1000 ? 0 : 1)}`,
          value: point.widthM * 1000,
          value2: point.lengthM * 1000
        };
      });
      return {
        cards: [
          card("パッチ幅 W", formatMm(result.widthM), undefined, "放射効率と入力抵抗に効く幅の目安です。"),
          card("パッチ長 L", formatMm(result.lengthM), undefined, "端部効果補正後の共振長の目安です。"),
          card("実効比誘電率", smart(result.effectiveEr, 2), undefined, "空気と基板をまたぐ電界を考慮した実効値です。")
        ],
        diagram: {
          title: "矩形パッチの初期寸法",
          variant: toolId,
          labels: [`W ${formatMm(result.widthM)}`, `L ${formatMm(result.lengthM)}`, `εeff ${smart(result.effectiveEr, 2)}`]
        },
        chart: {
          title: "周波数を変えたときのパッチ寸法",
          description: "周波数が上がると、幅・長さとも小さくなります。",
          data: chart,
          unit: "mm",
          series: [
            { key: "value", name: "幅 W", color: chartTheme.series.source },
            { key: "value2", name: "長さ L", color: chartTheme.series.gain }
          ]
        },
        formula: "W = c/(2f)√(2/(εr+1))\nεeff = (εr+1)/2 + (εr-1)/(2√(1+12h/W))\nL = c/(2f√εeff) - 2ΔL",
        explanation: "矩形マイクロストリップパッチの伝送線路モデルによる初期寸法です。給電位置、GNDサイズ、基板損失、銅厚、筐体で共振点はずれるため、EMシミュレーションや試作調整の出発点として使います。",
        columnTitle: "コラム：パッチはλ/2だが、基板の中では短くなる",
        column: [
          "パッチ長は自由空間のλ/2ではなく、実効比誘電率で短縮されたλg/2に近づきます。",
          "端部のフリンジ電界により、見かけの電気長は物理長より少し長くなります。その分、計算上の物理長は短く補正します。",
          "920MHzパッチはかなり大きく、GNSSや2.4GHzでは現実的なサイズに近づきます。この比較が初期提案で効きます。"
        ]
      };
    }
    case "small-loop-resonance": {
      const result = calculateSmallLoop({
        frequencyMHz: values.frequencyMHz,
        loopDiameterMm: values.loopDiameterMm,
        wireDiameterMm: values.wireDiameterMm,
        turns: values.turns
      });
      const chart = frequencySweep(values.frequencyMHz).map((frequency) => ({
        label: `${smart(frequency, frequency >= 1000 ? 0 : 2)}`,
        value:
          calculateSmallLoop({
            frequencyMHz: frequency,
            loopDiameterMm: values.loopDiameterMm,
            wireDiameterMm: values.wireDiameterMm,
            turns: values.turns
          }).capacitanceF * 1e12
      }));
      return {
        cards: [
          card("インダクタンス", smart(result.inductanceH * 1e9, 1), "nH", "円形ループ近似のインダクタンスです。"),
          card("必要な共振容量", smart(result.capacitanceF * 1e12, 1), "pF", "指定周波数でLC共振するための容量です。"),
          card("周長/波長", smart(result.circumferenceLambda, 3), "λ", "小型ループとして見てよいかの目安です。")
        ],
        diagram: {
          title: "ループと同調容量",
          variant: toolId,
          labels: [`D ${smart(values.loopDiameterMm, 0)} mm`, `L ${smart(result.inductanceH * 1e9, 1)} nH`, `C ${smart(result.capacitanceF * 1e12, 1)} pF`]
        },
        chart: {
          title: "周波数を変えたときの必要容量",
          description: "同じループなら、周波数が高いほど必要な同調容量は小さくなります。",
          data: chart,
          unit: "pF",
          series: [{ key: "value", name: "必要容量", color: chartTheme.series.source }]
        },
        formula: "L ≈ μ0N²r(ln(8r/a)-2)\nC = 1 / ((2πf)²L)",
        explanation: "単純な円形導体ループの近似です。プリントループや多巻きコイルでは寄生容量、近接効果、基板、手や筐体の影響が大きいため、初期値として扱ってください。",
        columnTitle: "コラム：ループは共振させると小さくても使えるがQが上がる",
        column: [
          "小型ループは磁界結合や近距離用途で便利ですが、共振容量や寄生容量に敏感です。",
          "周長が波長に対して十分小さい場合、放射アンテナというより磁界プローブに近い振る舞いになります。",
          "高いQは選択度を上げる一方、帯域や量産ばらつきの許容を狭くします。"
        ]
      };
    }
    case "radiation-resistance": {
      const result = calculateRadiationResistance({
        frequencyMHz: values.frequencyMHz,
        lengthMm: values.lengthMm,
        lossResistanceOhm: values.lossResistanceOhm,
        kind: shortKind
      });
      const chart = [0.03, 0.05, 0.08, 0.1, 0.15, 0.2, 0.25].map((ratio) => {
        const lengthMm = result.wavelengthM * ratio * 1000;
        const point = calculateRadiationResistance({
          frequencyMHz: values.frequencyMHz,
          lengthMm,
          lossResistanceOhm: values.lossResistanceOhm,
          kind: shortKind
        });
        return {
          label: `${smart(ratio, 2)}`,
          value: point.radiationResistanceOhm,
          value2: point.efficiencyPercent
        };
      });
      return {
        cards: [
          card("放射抵抗", smart(result.radiationResistanceOhm, 2), "Ω", "電波として放射される成分を抵抗に置き換えた値です。"),
          card("効率目安", smart(result.efficiencyPercent, 1), "%", "放射抵抗/(放射抵抗+損失抵抗) の単純モデルです。", result.efficiencyPercent < 50 ? "amber" : "emerald"),
          card("長さ/波長", smart(result.lengthRatio, 3), "λ", "アンテナ長が波長に対してどれだけ短いかを示します。")
        ],
        diagram: {
          title: "短いアンテナは放射抵抗が小さい",
          variant: toolId,
          labels: [`${shortKind === "monopole" ? "Monopole" : "Dipole"}`, `Rr ${smart(result.radiationResistanceOhm, 2)}Ω`, `η ${smart(result.efficiencyPercent, 1)}%`]
        },
        chart: {
          title: "長さ/λと放射抵抗・効率",
          description: "短いアンテナでは放射抵抗が急に小さくなり、少しの損失抵抗でも効率を奪います。",
          data: chart,
          unit: "Ω / %",
          series: [
            { key: "value", name: "放射抵抗 Ω", color: chartTheme.series.source },
            { key: "value2", name: "効率 %", color: chartTheme.series.gain }
          ]
        },
        formula: shortKind === "monopole"
          ? "Rr ≈ 40π²(h/λ)²\n効率 η = Rr / (Rr + Rloss)"
          : "Rr ≈ 80π²(l/λ)²\n効率 η = Rr / (Rr + Rloss)",
        explanation: "短いモノポール/ダイポールの低次近似です。実アンテナでは整合回路やGND、コイル、筐体電流が効きますが、「短いほど放射抵抗が小さく、損失に弱い」ことを定量的に見せられます。",
        columnTitle: "コラム：小型アンテナでコイル損が痛い理由",
        column: [
          "放射抵抗が数Ω以下になると、コイルや接地の1〜2Ωが効率を大きく落とします。",
          "整合が取れてVSWRが良く見えても、放射抵抗ではなく損失抵抗へ電力が入っている場合があります。",
          "「S11が良い」と「よく飛ぶ」は同じではありません。放射抵抗の視点はその違いを説明する助けになります。"
        ],
        warning: result.lengthRatio > 0.25 ? "短縮アンテナの近似範囲を超え気味です。λ/4以上では通常のモノポール/ダイポールとして別途評価してください。" : undefined
      };
    }
    case "small-antenna-limit": {
      const result = calculateSmallAntennaLimit({
        frequencyMHz: values.frequencyMHz,
        radiusMm: values.radiusMm,
        targetBandwidthPercent: values.targetBandwidthPercent
      });
      const chart = [0.1, 0.15, 0.2, 0.3, 0.5, 0.8, 1].map((ka) => ({
        label: `${smart(ka, 2)}`,
        value: 1 / (1 / ka ** 3 + 1 / ka) * 100,
        value2: 1 / ka ** 3 + 1 / ka
      }));
      return {
        cards: [
          card("ka", smart(result.ka, 3), undefined, "アンテナ外形の電気的小ささを示す無次元量です。"),
          card("Chu限界Q", smart(result.chuQ, 1), undefined, "小型アンテナが避けにくい最小Qの目安です。"),
          card("理想上限の比帯域", smart(result.maxFractionalBandwidthPercent, 2), "%", "1/Qから見た粗い帯域上限です。", result.targetToLimitRatio > 1 ? "rose" : "emerald")
        ],
        diagram: {
          title: "外接球半径で見る小型化限界",
          variant: toolId,
          labels: [`a ${smart(values.radiusMm, 0)} mm`, `ka ${smart(result.ka, 3)}`, `Qmin ${smart(result.chuQ, 1)}`]
        },
        chart: {
          title: "kaと理想上限帯域",
          description: "kaが小さくなるほどQが急増し、帯域上限は急に狭くなります。",
          data: chart,
          unit: "% / Q",
          series: [
            { key: "value", name: "比帯域上限 %", color: chartTheme.series.source },
            { key: "value2", name: "Qmin", color: chartTheme.series.loss }
          ],
          reference: values.targetBandwidthPercent,
          referenceLabel: "目標帯域"
        },
        formula: "ka = 2πa / λ\nQmin ≈ 1/(ka)³ + 1/(ka)\n比帯域上限 ≈ 1/Q",
        explanation: "Chu限界に基づく小型アンテナの物理限界の粗い可視化です。整合回路や能動回路で見かけの帯域を工夫できても、受動・小型・高効率を同時に満たす難しさは残ります。",
        columnTitle: "研究メモ：小型アンテナの帯域限界はまだ重要な設計原理",
        column: [
          "近年も小型アンテナの帯域拡張は研究されていますが、受動共振器のサイズと帯域の制約は設計判断の中心にあります。",
          "時間変調抵抗など限界を工学的に押し広げる研究もありますが、量産端末ではまずkaとQで無理度を見積もるのが実務的です。",
          "玄人向けには「この筐体サイズでその帯域は物理的に厳しい」を数値で説明できるのが価値です。"
        ],
        warning: result.targetToLimitRatio > 1
          ? "目標比帯域が単純なChu限界目安を上回っています。効率低下、能動/非フォスター整合、複共振化、筐体全体の利用などを検討する領域です。"
          : undefined
      };
    }
    case "large-array-near-field": {
      const result = calculateLargeArrayNearField({
        frequencyMHz: values.frequencyMHz,
        apertureSizeM: values.apertureSizeM,
        distanceM: values.distanceM
      });
      const chart = [0.25, 0.5, 0.75, 1, 1.25, 1.5].map((ratio) => {
        const aperture = values.apertureSizeM * ratio;
        const point = calculateLargeArrayNearField({
          frequencyMHz: values.frequencyMHz,
          apertureSizeM: aperture,
          distanceM: values.distanceM
        });
        return {
          label: `${smart(aperture, 2)}`,
          value: point.fraunhoferM,
          value2: values.distanceM
        };
      });
      return {
        cards: [
          card("Fraunhofer距離", formatMeters(result.fraunhoferM), undefined, "遠方界とみなす代表的な開始距離です。"),
          card("Fresnel数", smart(result.fresnelNumber, 2), undefined, "D²/(λR)。1以上なら近傍界性が強い目安です。"),
          card("判定", result.isRadiatingNearField ? "近傍界" : "遠方界寄り", undefined, "評価距離がFraunhofer距離より近いかで判定します。", result.isRadiatingNearField ? "amber" : "emerald")
        ],
        diagram: {
          title: "大型アレイでは遠方界が遠くなる",
          variant: toolId,
          labels: [`D ${formatMeters(values.apertureSizeM)}`, `Rff ${formatMeters(result.fraunhoferM)}`, `R ${formatMeters(values.distanceM)}`]
        },
        chart: {
          title: "開口サイズを変えたときの遠方界距離",
          description: "遠方界距離はD²/λで増えるため、開口を大きくすると急に伸びます。",
          data: chart,
          unit: "m",
          series: [
            { key: "value", name: "Fraunhofer距離", color: chartTheme.series.source },
            { key: "value2", name: "評価距離", color: chartTheme.series.loss }
          ]
        },
        formula: "Rff = 2D² / λ\nFresnel数 = D² / (λR)\n端部の経路差 = √(R²+(D/2)²)-R",
        explanation: "大型アレイや高周波アンテナでは、相手が遠方界にいるとは限りません。近傍界では平面波ではなく球面波として扱う必要があり、ビームは角度だけでなく距離にも焦点を持ちます。",
        columnTitle: "研究メモ：XL-MIMOでは近傍界が主役になりつつある",
        column: [
          "6G/XL-MIMOではアンテナ数や開口が大きくなり、従来の平面波・遠方界モデルだけでは足りない場面が増えています。",
          "近傍界ではビームステアリングだけでなく、ビームフォーカシング、球面波、空間非定常性が問題になります。",
          "このツールは研究式の入口として、まず2D²/λがどれほど大きくなるかを体感するためのものです。"
        ],
        warning: result.isRadiatingNearField
          ? "評価距離はFraunhofer距離より近いです。近傍界ビーム、測定距離、位相補正の影響を確認してください。"
          : undefined
      };
    }
    case "reflector-ris-size-effect": {
      const result = calculateReflectorRisEffect({
        frequencyMHz: values.frequencyMHz,
        widthM: values.widthM,
        heightM: values.heightM,
        txDistanceM: values.txDistanceM,
        rxDistanceM: values.rxDistanceM,
        efficiencyPercent: values.efficiencyPercent
      });
      const chart = [0.4, 0.6, 0.8, 1, 1.25, 1.5].map((ratio) => {
        const point = calculateReflectorRisEffect({
          frequencyMHz: values.frequencyMHz,
          widthM: values.widthM * ratio,
          heightM: values.heightM * ratio,
          txDistanceM: values.txDistanceM,
          rxDistanceM: values.rxDistanceM,
          efficiencyPercent: values.efficiencyPercent
        });
        return {
          label: `${smart(values.widthM * ratio, 2)}`,
          value: point.apertureGainDbi,
          value2: point.excessVsDirectDb
        };
      });
      return {
        cards: [
          card("開口上限利得", smart(result.apertureGainDbi, 1), "dBi", "面積を有効開口として使えた場合の上限寄り利得です。"),
          card("2ホップ損失目安", smart(result.twoHopLossUpperBoundDb, 1), "dB", "FSPL2本分から開口効果を差し引いた粗い上限目安です。"),
          card("直接経路との差", smart(result.excessVsDirectDb, 1), "dB", "同じ総距離の直接波FSPLとの差です。正なら反射経路の方が厳しい目安です。", result.excessVsDirectDb > 0 ? "amber" : "emerald")
        ],
        diagram: {
          title: "反射面は面積・距離・波長で効き方が変わる",
          variant: toolId,
          labels: [`A ${formatArea(result.areaM2)}`, `${smart(result.apertureGainDbi, 1)} dBi`, `Rff ${formatMeters(result.fraunhoferM)}`]
        },
        chart: {
          title: "反射面サイズを変えたときの効果",
          description: "面積を大きくすると開口利得は増えますが、2ホップ距離の損失も効きます。",
          data: chart,
          unit: "dB",
          series: [
            { key: "value", name: "開口上限利得", color: chartTheme.series.source },
            { key: "value2", name: "直接経路との差", color: chartTheme.series.loss }
          ],
          reference: 0,
          referenceLabel: "直接FSPL"
        },
        formula: "Gsurface ≈ 4πAη / λ²\nL2hop ≈ FSPL(d1)+FSPL(d2)-Gsurface\nRff ≈ 2D²/λ",
        explanation: "反射板/RISを面積を持つ受動開口として見た上限寄りの概算です。実際のRISパスロスは偏波、散乱、位相分布、照明、近傍/遠方界条件で変わるため、ここでは『面積を増やすと何が効くか』を見る一次ツールとして扱います。",
        columnTitle: "研究メモ：RISは鏡を置けば単純に良くなる、ではない",
        column: [
          "RISや反射板の効果は、面積、距離、波長、偏波、近傍/遠方界で大きく変わります。",
          "近年のRISパスロス研究では、単純な距離損失ではなく、有限面積の電磁界積分や近傍界/遠方界の違いが重視されています。",
          "このツールは厳密設計ではなく、反射面を大きくする意味と2ホップ損失の厳しさを同時に見せるための入口です。"
        ],
        warning: "RIS/反射板の厳密な回線設計には、面の位相分布、反射係数、偏波、入射角、設置環境を含む電磁界解析または実測が必要です。"
      };
    }
  }
}

function MiniChart({ chart }: { chart: ToolView["chart"] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Card as="section" padding="lg" shadow={false} className="bg-slate-50">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold text-slate-950">{chart.title}</h3>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">{chart.description}</p>
        </div>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-500 shadow-card">
          {chart.unit}
        </span>
      </div>
      <div className="mt-4 h-64 w-full">
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={256}>
            <LineChart data={chart.data} margin={{ left: 6, right: 18, top: 12, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid.primary} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: chartTheme.axis.label.fontSize, fill: chartTheme.axis.label.fill }}
              />
              <YAxis
                tick={{ fontSize: chartTheme.axis.label.fontSize, fill: chartTheme.axis.label.fill }}
                domain={["auto", "auto"]}
              />
              <RechartsTooltip formatter={(value, name) => [`${value}`, name]} />
              {typeof chart.reference === "number" ? (
                <ReferenceLine
                  y={chart.reference}
                  stroke={chartTheme.reference.sensitivity}
                  strokeDasharray={chartTheme.reference.sensitivityDash}
                  label={{
                    value: chart.referenceLabel ?? "基準",
                    position: "insideTopRight",
                    fill: chartTheme.reference.sensitivity,
                    fontSize: 12
                  }}
                />
              ) : null}
              {chart.series.map((series) => (
                <Line
                  key={series.key}
                  type="monotone"
                  dataKey={series.key}
                  name={series.name}
                  stroke={series.color}
                  strokeWidth={chartTheme.stroke.emphasis}
                  dot={{ r: 3, strokeWidth: 1.5, fill: "#FFFFFF" }}
                  activeDot={{ r: 5 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center rounded-lg bg-white text-sm text-slate-500">
            グラフを読み込み中
          </div>
        )}
      </div>
    </Card>
  );
}

function AntennaDiagram({ diagram }: { diagram: ToolView["diagram"] }) {
  const [a, b, c] = diagram.labels;
  const variant = diagram.variant;

  return (
    <Card as="section" padding="lg" shadow={false} className="bg-white">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-base font-semibold text-slate-950">{diagram.title}</h3>
        <Tooltip term="図の見方">
          入力値から計算した主要指標を、アンテナの形やビーム、距離関係に重ねた概念図です。寸法比は見やすさ優先の模式図です。
        </Tooltip>
      </div>
      <svg
        role="img"
        aria-label={diagram.title}
        viewBox="0 0 560 260"
        className="mt-4 h-auto w-full rounded-lg bg-slate-50"
      >
        <defs>
          <linearGradient id={`beam-${variant}`} x1="0%" x2="100%" y1="0%" y2="0%">
            <stop offset="0%" stopColor="#0071BD" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0.08" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="560" height="260" rx="12" fill="#F8FAFC" />
        <line x1="38" y1="214" x2="522" y2="214" stroke="#CBD5E1" strokeWidth="2" />

        {variant === "effective-aperture" ? (
          <>
            <circle cx="120" cy="128" r="34" fill="#0071BD" opacity="0.16" />
            <path d="M88 128h64M120 96v64" stroke="#0071BD" strokeWidth="4" strokeLinecap="round" />
            <rect x="276" y="62" width="140" height="140" rx="10" fill="#10B981" opacity="0.18" stroke="#10B981" strokeWidth="3" />
            <path d="M165 128 C210 86 234 86 276 104" fill="none" stroke="#0071BD" strokeWidth="3" strokeDasharray="8 6" />
            <path d="M165 128 C210 170 234 170 276 156" fill="none" stroke="#0071BD" strokeWidth="3" strokeDasharray="8 6" />
          </>
        ) : null}

        {variant === "aperture-gain-beamwidth" ? (
          <>
            <path d="M116 62 Q72 130 116 198" fill="none" stroke="#0071BD" strokeWidth="8" strokeLinecap="round" />
            <path d="M122 86 L492 124 L122 174 Z" fill={`url(#beam-${variant})`} stroke="#0071BD" strokeWidth="2" />
            <line x1="122" y1="130" x2="492" y2="130" stroke="#0071BD" strokeWidth="2" strokeDasharray="7 6" />
          </>
        ) : null}

        {variant === "antenna-spacing" ? (
          <>
            {[190, 350].map((x) => (
              <g key={x}>
                <line x1={x} y1="90" x2={x} y2="214" stroke="#0071BD" strokeWidth="6" strokeLinecap="round" />
                <circle cx={x} cy="84" r="10" fill="#0071BD" />
                <path d={`M${x - 38} 118 Q${x} 84 ${x + 38} 118`} fill="none" stroke="#10B981" strokeWidth="2" />
              </g>
            ))}
            <line x1="190" y1="184" x2="350" y2="184" stroke="#0F172A" strokeWidth="2" markerEnd="url(#arrow)" />
            <line x1="350" y1="184" x2="190" y2="184" stroke="#0F172A" strokeWidth="2" />
          </>
        ) : null}

        {variant === "array-grating-lobe" ? (
          <>
            {[150, 200, 250, 300, 350, 400].map((x) => (
              <circle key={x} cx={x} cy="194" r="9" fill="#0071BD" />
            ))}
            <path d="M278 190 L396 52" stroke="#0071BD" strokeWidth="5" strokeLinecap="round" />
            <path d="M282 190 L152 72" stroke="#FB7185" strokeWidth="4" strokeLinecap="round" strokeDasharray="8 8" />
            <path d="M250 194h150" stroke="#0F172A" strokeWidth="2" />
          </>
        ) : null}

        {variant === "patch-antenna-dimensions" ? (
          <>
            <rect x="178" y="70" width="210" height="128" rx="8" fill="#0071BD" opacity="0.16" stroke="#0071BD" strokeWidth="4" />
            <rect x="145" y="214" width="276" height="14" rx="3" fill="#475569" />
            <line x1="178" y1="50" x2="388" y2="50" stroke="#0F172A" strokeWidth="2" />
            <line x1="408" y1="70" x2="408" y2="198" stroke="#0F172A" strokeWidth="2" />
            <path d="M258 198 v30" stroke="#10B981" strokeWidth="6" />
          </>
        ) : null}

        {variant === "small-loop-resonance" ? (
          <>
            <circle cx="246" cy="132" r="72" fill="none" stroke="#0071BD" strokeWidth="8" />
            <rect x="330" y="112" width="48" height="40" rx="5" fill="#FFFFFF" stroke="#0F172A" strokeWidth="3" />
            <line x1="342" y1="112" x2="342" y2="152" stroke="#0F172A" strokeWidth="3" />
            <line x1="366" y1="112" x2="366" y2="152" stroke="#0F172A" strokeWidth="3" />
            <path d="M318 132h12M378 132h24" stroke="#0071BD" strokeWidth="5" strokeLinecap="round" />
          </>
        ) : null}

        {variant === "radiation-resistance" ? (
          <>
            <line x1="272" y1="88" x2="272" y2="214" stroke="#0071BD" strokeWidth="8" strokeLinecap="round" />
            <path d="M210 214h124" stroke="#475569" strokeWidth="5" />
            <path d="M294 98 C386 98 430 132 464 178" fill="none" stroke="#10B981" strokeWidth="4" />
            <path d="M250 98 C158 98 114 132 80 178" fill="none" stroke="#10B981" strokeWidth="4" />
            <rect x="318" y="157" width="58" height="34" rx="6" fill="#FFFFFF" stroke="#FB7185" strokeWidth="3" />
          </>
        ) : null}

        {variant === "small-antenna-limit" ? (
          <>
            <circle cx="278" cy="132" r="82" fill="#0071BD" opacity="0.08" stroke="#0071BD" strokeWidth="3" strokeDasharray="9 7" />
            <path d="M254 164 C268 112 288 112 302 164" fill="none" stroke="#0071BD" strokeWidth="7" strokeLinecap="round" />
            <line x1="278" y1="132" x2="360" y2="132" stroke="#0F172A" strokeWidth="2" />
            <circle cx="278" cy="132" r="4" fill="#0F172A" />
          </>
        ) : null}

        {variant === "large-array-near-field" ? (
          <>
            <rect x="84" y="58" width="28" height="150" rx="6" fill="#0071BD" />
            <path d="M112 58 C220 68 282 98 360 130 C282 162 220 192 112 208 Z" fill={`url(#beam-${variant})`} stroke="#0071BD" strokeWidth="2" />
            <line x1="112" y1="130" x2="482" y2="130" stroke="#0F172A" strokeWidth="2" strokeDasharray="7 6" />
            <circle cx="438" cy="130" r="12" fill="#10B981" />
            <path d="M260 56v150" stroke="#FB7185" strokeWidth="2" strokeDasharray="7 6" />
          </>
        ) : null}

        {variant === "reflector-ris-size-effect" ? (
          <>
            <circle cx="82" cy="170" r="12" fill="#0071BD" />
            <rect x="252" y="56" width="34" height="150" rx="5" fill="#10B981" opacity="0.32" stroke="#10B981" strokeWidth="4" />
            <circle cx="478" cy="104" r="12" fill="#FB7185" />
            <path d="M94 166 L252 106" stroke="#0071BD" strokeWidth="4" />
            <path d="M286 106 L466 106" stroke="#FB7185" strokeWidth="4" />
            <path d="M94 177 C210 228 342 220 466 116" fill="none" stroke="#94A3B8" strokeWidth="2" strokeDasharray="7 6" />
          </>
        ) : null}

        <g>
          <rect x="34" y="18" width="492" height="32" rx="16" fill="#FFFFFF" opacity="0.92" />
          <text x="54" y="39" fill="#0F172A" fontSize="13" fontWeight="700">{a}</text>
          <text x="240" y="39" fill="#0071BD" fontSize="13" fontWeight="700">{b}</text>
          <text x="396" y="39" fill="#047857" fontSize="13" fontWeight="700">{c}</text>
        </g>
      </svg>
    </Card>
  );
}

function GuidanceSection({ toolId }: { toolId: AntennaToolId }) {
  const guidance = guidanceByTool[toolId];

  return (
    <Card as="section" padding="lg">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold text-slate-950">使い方チュートリアルと用語ミニ辞典</h3>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">
            入力の順番と、結果を読むために必要な用語をこのページ内で確認できます。
          </p>
        </div>
        <Tooltip term="迷ったら">
          プリセットを押してから、1つの入力だけを動かしてください。グラフと模式図がどう変わるかを見ると、このツールで何を判断できるかが掴みやすくなります。
        </Tooltip>
      </div>

      <div className="mt-5 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <h4 className="text-sm font-semibold text-slate-950">3ステップで使う</h4>
          <ol className="mt-3 space-y-3">
            {guidance.tutorial.map((step, index) => (
              <li key={step} className="grid grid-cols-[28px_1fr] gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-staf text-xs font-bold text-white">
                  {index + 1}
                </span>
                <span className="text-sm leading-relaxed text-slate-700">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-slate-950">このページの用語</h4>
          <dl className="mt-3 grid gap-3 sm:grid-cols-2">
            {guidance.terms.map((item) => (
              <div key={item.term} className="border-l-2 border-staf/40 pl-3">
                <dt className="text-sm font-semibold text-slate-950">{item.term}</dt>
                <dd className="mt-1 text-xs leading-relaxed text-slate-600">{item.description}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </Card>
  );
}

export function AntennaToolPanel({ toolId }: { toolId: AntennaToolId }) {
  const config = configs[toolId];
  const [values, setValues] = useState(config.defaults);
  const [shortKind, setShortKind] = useState<ShortAntennaKind>("monopole");

  useEffect(() => {
    setValues(config.defaults);
    setShortKind("monopole");
  }, [config.defaults]);

  const computation = useMemo(() => {
    try {
      return { view: buildView(toolId, values, shortKind), error: null as string | null };
    } catch (error) {
      return {
        view: null,
        error: error instanceof Error ? error.message : "入力値を確認してください。"
      };
    }
  }, [shortKind, toolId, values]);

  const applyPreset = (preset: Preset) => {
    setValues((current) => ({ ...current, ...preset.values }));
    if (preset.kind) {
      setShortKind(preset.kind);
    }
  };

  return (
    <section className="space-y-5">
      <Card as="section" padding="lg">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-950">{config.title}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">{config.lead}</p>
          </div>
          <Tooltip term="入力のコツ">
            周波数プリセットを起点に、寸法を少しずつ動かしてグラフの傾きを見てください。アンテナ計算では単一の答えより、どの入力が効くかを掴むことが重要です。
          </Tooltip>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {config.presets.map((preset) => (
            <button
              key={preset.label}
              type="button"
              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-staf/40 hover:text-staf focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-staf/40"
              onClick={() => applyPreset(preset)}
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {config.fields.map((field) => (
            <NumberField
              key={field.key}
              id={`${toolId}-${field.key}`}
              label={field.label}
              unit={field.unit}
              value={values[field.key] ?? 0}
              min={field.min}
              max={field.max}
              step={field.step}
              showSlider={field.showSlider}
              help={field.help}
              onChange={(next) => setValues((current) => ({ ...current, [field.key]: next }))}
            />
          ))}
          {toolId === "radiation-resistance" ? (
            <label className="block" htmlFor="short-antenna-kind">
              <span className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                アンテナ形式
                <Tooltip term="形式">
                  モノポールは完全導体地板上の短い垂直素子、ダイポールは短い線状アンテナ全長として近似します。
                </Tooltip>
              </span>
              <select
                id="short-antenna-kind"
                value={shortKind}
                className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-950 focus:border-staf focus:outline-none focus:ring-2 focus:ring-staf/20"
                onChange={(event) => setShortKind(event.target.value as ShortAntennaKind)}
              >
                <option value="monopole">短いモノポール</option>
                <option value="dipole">短いダイポール</option>
              </select>
            </label>
          ) : null}
        </div>

        {computation.error ? (
          <p className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700">
            {computation.error}
          </p>
        ) : null}
      </Card>

      {computation.view ? (
        <>
          <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
            <Card as="section" padding="lg">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-base font-semibold text-slate-950">計算結果</h3>
                <Tooltip term="結果の読み方">
                  主役の値は大きく表示し、式の前提や実務上の注意は下の解説にまとめています。dBと線形量が混ざるため、単位を必ず確認してください。
                </Tooltip>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {computation.view.cards.map((item) => (
                  <div key={item.label} className="rounded-lg bg-slate-50 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-semibold text-slate-500">{item.label}</p>
                      <Tooltip term="i">{item.help}</Tooltip>
                    </div>
                    <Stat className="mt-1" value={item.value} unit={item.unit} tone={item.tone} size="md" />
                  </div>
                ))}
              </div>
              {computation.view.warning ? (
                <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm leading-relaxed text-amber-800">
                  {computation.view.warning}
                </p>
              ) : null}
              <div className="mt-5">
                <FormulaExplanationCard title="式と前提を見る" formula={computation.view.formula}>
                  <p>{computation.view.explanation}</p>
                </FormulaExplanationCard>
              </div>
            </Card>
            <AntennaDiagram diagram={computation.view.diagram} />
          </div>

          <MiniChart chart={computation.view.chart} />

          <GuidanceSection toolId={toolId} />

          <Card as="section" padding="lg">
            <h3 className="text-base font-semibold text-slate-950">{computation.view.columnTitle}</h3>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              {computation.view.column.map((paragraph, index) => (
                <div key={paragraph} className="rounded-lg bg-slate-50 p-4">
                  <p className="text-xs font-semibold text-staf-dark">Point {index + 1}</p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-700">{paragraph}</p>
                </div>
              ))}
            </div>
          </Card>
        </>
      ) : null}
    </section>
  );
}
