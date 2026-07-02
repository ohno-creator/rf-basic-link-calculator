"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Legend,
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
import { rfErrorMessage } from "@/lib/rfErrorMessages";
import { FormulaExplanationCard } from "@/app/tools/_components/FormulaExplanationCard";

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
  /** 値の桁が大きく違う系列は右軸に分ける（既定は左軸）。 */
  axis?: "left" | "right";
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
    /** 横軸の名前（例: 周波数 MHz）。 */
    xLabel?: string;
    /** 左Y軸の名前。 */
    leftLabel?: string;
    /** 右Y軸の名前（右軸の系列がある場合）。 */
    rightLabel?: string;
    /** 基準線をどちらの軸に合わせるか（既定は左）。 */
    referenceAxis?: "left" | "right";
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

type ResearchBridge = {
  plainTitle: string;
  plainSummary: string;
  everydayImage: string;
  realUse: string;
  firstAction: string;
  glossary: Array<{ term: string; description: string }>;
};

const configs: Record<AntennaToolId, ToolConfig> = {
  "effective-aperture": {
    title: "有効開口面積・受信面積",
    lead:
      "このアンテナが電波をどれくらい拾える規模なのかを、利得dBiから面積に戻して見ます。仕様書のdBiを、受信しやすさやアンテナサイズ感の説明に使うための計算です。",
    defaults: { frequencyMHz: 920, gainDbi: 2.15 },
    fields: [
      {
        key: "frequencyMHz",
        label: "使う周波数",
        unit: "MHz",
        min: 1,
        step: 1,
        help: "同じ利得でも、低い周波数ほど受け取れる面積は大きくなります。920MHz、2.4GHz、5GHzの違いを見る入口です。"
      },
      {
        key: "gainDbi",
        label: "仕様書の利得",
        unit: "dBi",
        step: 0.1,
        help: "アンテナ仕様にあるdBi値を入れます。この値を、受信面積という直感しやすい量に換算します。"
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
      "ホーン、パラボラ、レンズなどで、開口の大きさから「どれくらい強く飛ばせるか」と「どれくらい細いビームになるか」を見ます。アンテナ径の候補決めや、向き合わせの難しさの確認に使います。",
    defaults: { frequencyMHz: 60000, diameterM: 0.05, efficiencyPercent: 60 },
    fields: [
      {
        key: "frequencyMHz",
        label: "使う周波数",
        unit: "MHz",
        min: 1,
        step: 100,
        help: "周波数が高いほど波長が短くなり、同じ直径でも強く細いビームになります。60GHzなら60000MHzです。"
      },
      {
        key: "diameterM",
        label: "開口の直径",
        unit: "m",
        min: 0.001,
        step: 0.005,
        help: "ホーンの口、レンズ径、パラボラ径など、電波を出し入れする面の代表寸法です。ここを大きくすると利得は上がります。"
      },
      {
        key: "efficiencyPercent",
        label: "見込む効率",
        unit: "%",
        min: 1,
        max: 100,
        step: 1,
        help: "開口をどれだけ有効に使えるかの見込みです。迷ったら50〜70%で感度を見ます。"
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
      "筐体や基板に複数アンテナを置くとき、今のcm間隔が電波的に近すぎるのか、広すぎるのかを見ます。MIMO配置、アンテナ同士の結合、アレイ設計の最初の当たりを付けるための計算です。",
    defaults: { frequencyMHz: 2400, spacingM: 0.0625 },
    fields: [
      {
        key: "frequencyMHz",
        label: "使う周波数",
        unit: "MHz",
        min: 1,
        step: 1,
        help: "同じcm間隔でも、周波数が高いほど電波的には広い間隔になります。"
      },
      {
        key: "spacingM",
        label: "実際に置ける間隔",
        unit: "m",
        min: 0.001,
        step: 0.001,
        help: "給電点どうし、またはアンテナ中心どうしの距離を入れます。実装上置ける距離が、λで見るとどの程度か確認します。"
      }
    ],
    presets: [
      { label: "2.4GHz λ/2", values: { frequencyMHz: 2400, spacingM: 0.0625 } },
      { label: "920MHz 10cm", values: { frequencyMHz: 920, spacingM: 0.1 } },
      { label: "Sub6 5cm", values: { frequencyMHz: 4800, spacingM: 0.05 } }
    ]
  },
  "array-grating-lobe": {
    title: "狙っていない方向にも強い電波が出るか",
    lead:
      "アレイアンテナ／フェーズドアレイで素子の間隔を広げすぎると、狙った方向のほかにも「グレーティングローブ」と呼ばれる強い不要ビームが現れます。このページは、それが出る条件を周波数・素子間隔・走査角（向けたい方向）から確認します。",
    defaults: { frequencyMHz: 4800, spacingM: 0.031, scanAngleDeg: 45 },
    fields: [
      {
        key: "frequencyMHz",
        label: "使う周波数",
        unit: "MHz",
        min: 1,
        step: 1,
        help: "波長を決める値です。同じ3cm間隔でも、周波数が上がるほど電気的には広い間隔になります。"
      },
      {
        key: "spacingM",
        label: "アンテナ同士の間隔",
        unit: "m",
        min: 0.001,
        step: 0.001,
        help: "隣り合うアンテナ中心どうしの距離です。広すぎると、狙っていない方向にも強いビームが出やすくなります。"
      },
      {
        key: "scanAngleDeg",
        label: "向けたい方向",
        unit: "deg",
        min: -80,
        max: 80,
        step: 1,
        showSlider: true,
        help: "正面からどれだけ横へビームを向けるかです。横へ大きく向けるほど、許される間隔は狭くなります。"
      }
    ],
    presets: [
      { label: "Sub6 安全寄り", values: { frequencyMHz: 4800, spacingM: 0.031, scanAngleDeg: 45 } },
      { label: "28GHz 広角確認", values: { frequencyMHz: 28000, spacingM: 0.00535, scanAngleDeg: 60 } },
      { label: "間隔が広すぎる例", values: { frequencyMHz: 4800, spacingM: 0.06, scanAngleDeg: 45 } }
    ]
  },
  "patch-antenna-dimensions": {
    title: "矩形パッチアンテナ寸法",
    lead:
      "基板上に四角い金属パターンでアンテナを作るとき、最初に引く幅と長さを決めるための計算です。EMシミュレーションや試作で追い込む前の、CAD初期寸法を出します。",
    defaults: { frequencyMHz: 1575.42, dielectricConstant: 3.38, substrateHeightMm: 1.6 },
    fields: [
      {
        key: "frequencyMHz",
        label: "狙う周波数",
        unit: "MHz",
        min: 1,
        step: 0.1,
        help: "アンテナを一番よく反応させたい周波数です。GNSS L1は1575.42MHz、2.4GHzなら2400MHzです。"
      },
      {
        key: "dielectricConstant",
        label: "基板の比誘電率",
        unit: "εr",
        min: 1.01,
        step: 0.01,
        help: "基板材料の値です。値が大きいほどパッチは小さくなりますが、材料差や周波数差でずれるため仕様値を確認します。"
      },
      {
        key: "substrateHeightMm",
        label: "基板厚",
        unit: "mm",
        min: 0.05,
        step: 0.05,
        help: "パッチとGND面の距離です。厚いほど帯域は広がりやすい一方、表面波や実装制約も効きます。"
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
      "小さな輪っか状アンテナを狙った周波数に合わせるため、どのくらいのコンデンサを入れればよいかを見ます。NFC、RFID、近距離センサーの部品選定の入口です。",
    defaults: { frequencyMHz: 13.56, loopDiameterMm: 40, wireDiameterMm: 1, turns: 1 },
    fields: [
      {
        key: "frequencyMHz",
        label: "共振周波数",
        unit: "MHz",
        min: 0.001,
        step: 0.01,
        help: "ループを合わせたい周波数です。NFCなら13.56MHz。低い周波数ほど、巻数やコンデンサ容量の選び方が効きます。"
      },
      {
        key: "loopDiameterMm",
        label: "ループ直径",
        unit: "mm",
        min: 1,
        step: 1,
        help: "円形ループに置き換えた直径です。四角いパターンなら、周囲長が近い円として入れると初期値を見られます。"
      },
      {
        key: "wireDiameterMm",
        label: "導体の線径",
        unit: "mm",
        min: 0.01,
        step: 0.1,
        help: "ループ導体の太さです。プリント配線ならパターン幅の目安を入れます。インダクタンスと必要容量に効きます。"
      },
      {
        key: "turns",
        label: "巻数",
        unit: "turn",
        min: 1,
        step: 1,
        help: "ループを何回巻くかです。巻数を増やすと必要なコンデンサ容量は大きく変わります。"
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
      "短いアンテナが、S11やVSWRを合わせてもなぜ飛びにくいことがあるのかを見ます。アンテナ長と損失抵抗から、入力電力のうち電波として外へ出る割合を概算します。",
    defaults: { frequencyMHz: 920, lengthMm: 30, lossResistanceOhm: 2 },
    fields: [
      {
        key: "frequencyMHz",
        label: "使う周波数",
        unit: "MHz",
        min: 1,
        step: 1,
        help: "波長を決める値です。同じ30mmアンテナでも、920MHzではかなり短く、2.4GHzでは少し余裕が出ます。"
      },
      {
        key: "lengthMm",
        label: "アンテナの長さ",
        unit: "mm",
        min: 0.1,
        step: 1,
        help: "モノポールならGNDから先端まで、ダイポールなら全長の目安です。短いほど電波として外へ出る力が小さくなります。"
      },
      {
        key: "lossResistanceOhm",
        label: "損として見込む抵抗",
        unit: "Ω",
        min: 0,
        step: 0.1,
        help: "コイル損、導体損、GND損など、熱になる分をまとめた値です。数Ωでも短いアンテナでは大きく効きます。"
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
      "その筐体サイズで、必要な帯域のアンテナを作るのが物理的にどれくらい厳しいかを見ます。小型化の要求が現実的か、試作前に無理度を確認するための計算です。",
    defaults: { frequencyMHz: 920, radiusMm: 20, targetBandwidthPercent: 2 },
    fields: [
      {
        key: "frequencyMHz",
        label: "使う周波数",
        unit: "MHz",
        min: 1,
        step: 1,
        help: "波長を決める値です。低い周波数ほど同じ筐体サイズでは小型化が厳しくなります。"
      },
      {
        key: "radiusMm",
        label: "入れられる半径",
        unit: "mm",
        min: 0.1,
        step: 1,
        help: "アンテナ全体が入る空間を球で包んだときの半径です。筐体内で許されるアンテナスペースとして入れます。"
      },
      {
        key: "targetBandwidthPercent",
        label: "必要な帯域",
        unit: "%",
        min: 0.001,
        step: 0.1,
        help: "中心周波数に対して何%の帯域が必要かです。例: 920MHzで20MHz必要なら約2.2%です。"
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
      "大型アレイや高周波アンテナで、相手や測定点を「十分遠い」とみなしてよいかを確認します。測定距離、ビーム計算、近傍界補正が必要かを判断するための計算です。",
    defaults: { frequencyMHz: 28000, apertureSizeM: 0.5, distanceM: 10 },
    fields: [
      {
        key: "frequencyMHz",
        label: "使う周波数",
        unit: "MHz",
        min: 1,
        step: 10,
        help: "周波数が高く波長が短いほど、同じ開口でも遠方界として扱える距離が長くなります。"
      },
      {
        key: "apertureSizeM",
        label: "一番大きい幅",
        unit: "m",
        min: 0.001,
        step: 0.01,
        help: "アンテナ面やアレイ全体の最大寸法です。正方形なら一辺、長方形なら長辺、円形なら直径を入れます。"
      },
      {
        key: "distanceM",
        label: "相手までの距離",
        unit: "m",
        min: 0.001,
        step: 0.1,
        help: "通信相手、測定点、ターゲットまでの距離です。この距離が短いと、遠方界前提では外すことがあります。"
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
      "反射板やRISを置いたとき、面積と距離の条件から本当に効きそうかを見ます。反射面を大きくする効果と、送信機→反射面→受信機という遠回りの損失をまとめて確認します。",
    defaults: { frequencyMHz: 4800, widthM: 1, heightM: 1, txDistanceM: 30, rxDistanceM: 30, efficiencyPercent: 50 },
    fields: [
      {
        key: "frequencyMHz",
        label: "使う周波数",
        unit: "MHz",
        min: 1,
        step: 10,
        help: "同じ反射面でも、周波数が高いほど電波的には大きな面に見えます。Sub6、Wi-Fi、ミリ波で比較できます。"
      },
      {
        key: "widthM",
        label: "置く面の幅",
        unit: "m",
        min: 0.01,
        step: 0.01,
        help: "設置できる反射板やRISの幅です。面積が足りないと、反射経路の改善は限定的になります。"
      },
      {
        key: "heightM",
        label: "置く面の高さ",
        unit: "m",
        min: 0.01,
        step: 0.01,
        help: "設置できる反射板やRISの高さです。幅と高さで、電波を受けて再放射する面積が決まります。"
      },
      {
        key: "txDistanceM",
        label: "送信側から反射面",
        unit: "m",
        min: 0.01,
        step: 1,
        help: "送信アンテナから反射面までの距離です。遠いほど、反射面へ届く電力が小さくなります。"
      },
      {
        key: "rxDistanceM",
        label: "反射面から受信側",
        unit: "m",
        min: 0.01,
        step: 1,
        help: "反射面から受信アンテナまでの距離です。ここも遠いほど、反射後の電力が小さくなります。"
      },
      {
        key: "efficiencyPercent",
        label: "見込む効率",
        unit: "%",
        min: 1,
        max: 100,
        step: 1,
        help: "反射面の損失、位相制御、照明むらをまとめた見込みです。初期検討では30〜70%程度で感度を見ます。"
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
      "まず、実際に使う無線帯を入れます。920MHzと2.4GHzで、同じdBiでも受信面積がどれだけ違うかを見ます。",
      "次に、仕様書や候補アンテナの利得dBiを入れます。結果の「電波を拾う面積」が、このアンテナが電波を拾う規模感です。",
      "最後に正方形換算の一辺を見ます。営業説明や設計レビューでは「この利得は受信面積で言うとこのくらい」と説明できます。"
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
      "まず、候補にしているアンテナ径と周波数を入れます。結果の「飛ばせる強さ」で、必要なリンク余裕に届きそうかを見ます。",
      "次に「ビームの太さ」を見ます。細すぎる場合は、向き合わせや取り付け誤差が厳しくなります。",
      "最後に遠方界開始距離を確認します。測定室や評価距離が足りない場合、測定結果の読み方を変える必要があります。"
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
      "まず、筐体や基板で実際に置けるアンテナ間隔を入れます。cmではなく「間隔/波長」を主役として見ます。",
      "間隔/λが0.25未満なら近すぎ、0.5付近ならよく使われる目安、0.75超えならアレイ用途では広すぎる可能性があります。",
      "最後に周波数を変え、同じ筐体寸法が別の無線帯では近いのか広いのかを比較します。"
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
      "まずプリセット「Sub6 安全寄り」を押します。判定が「出にくい」なら、狙った方向以外に強い山が出にくい条件です。",
      "次に「向けたい方向」を大きくします。横へ向けるほど、安全に使えるアンテナ間隔が狭くなることを見ます。",
      "「間隔が広すぎる例」を押すと、なぜ問題になるかが分かります。出る可能性ありなら、間隔を狭めるか、向ける角度を小さくします。"
    ],
    terms: [
      { term: "不要ビーム", description: "本来向けたい方向とは別に出てしまう強い電波の山です。専門的にはグレーティングローブと呼びます。" },
      { term: "アレイ", description: "複数のアンテナを並べ、タイミングをずらして電波の向きを作る仕組みです。" },
      { term: "向けたい方向", description: "正面からどれだけ横へ電波を向けるかです。専門的には走査角と呼びます。" },
      { term: "λ/2", description: "波長の半分の間隔です。不要ビームを避けるときの代表的な目安です。" }
    ]
  },
  "patch-antenna-dimensions": {
    tutorial: [
      "まず、狙う周波数と使う基板材料を入れます。結果のWとLが、CADで最初に描くパッチ寸法の目安です。",
      "基板の比誘電率を変えて、材料を替えるとサイズがどれだけ変わるかを見ます。大きすぎる場合の材料選定に使えます。",
      "最後に、基板サイズ、GND余白、給電位置を検討します。この計算値は完成寸法ではなく、EMシミュレーションや試作調整の出発点です。"
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
      "まず、狙う周波数とループの大きさを入れます。結果の「必要な共振容量」が、部品選定の最初の候補です。",
      "巻数や線径を動かし、必要容量が手に入りやすい範囲に入るかを見ます。極端な容量ならループ形状を見直します。",
      "最後に周長/λを見ます。値が大きくなると、小型ループとしての単純近似から外れやすくなります。"
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
      "まず、実際のアンテナ長を入れます。結果の「長さ/波長」で、どれくらい短縮しているかを確認します。",
      "次に、コイル損やGND損を想定して損失抵抗を1〜5Ωで動かします。効率が急に落ちるなら、短さと損失が主犯です。",
      "最後にモノポール/ダイポールを切り替えます。S11が良くても飛ばない時の説明材料として使えます。"
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
      "まず、アンテナに使える実装空間を半径として入れます。結果のkaが小さいほど、小型化の無理度が高い状態です。",
      "次に、必要な帯域を入れます。理想上限の比帯域より大きい要求なら、受動アンテナだけではかなり厳しい目安です。",
      "最後に半径を少し大きくしてみます。筐体スペースを増やすことが、帯域確保にどれだけ効くかを説明できます。"
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
      "まず、アンテナ面の最大寸法と、相手や測定点までの距離を入れます。結果の「遠方界になる目安」を見ます。",
      "相手までの距離がその目安より短い場合、遠方界前提の利得測定やビーム計算では外す可能性があります。",
      "最後に開口サイズを2倍にしてみます。遠方界距離が急に伸びるため、大型アレイほど測定距離が問題になることが分かります。"
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
      "まず、置ける反射面の幅・高さと、送信側/受信側までの距離を入れます。面積が足りるかを見ます。",
      "次に「直接経路との差」を見ます。正のdBが大きいほど、反射経路は直接届く場合より厳しい条件です。",
      "最後に反射面サイズと効率を動かします。面を大きくすべきか、設置距離を短くすべきかの当たりを付けられます。"
    ],
    terms: [
      { term: "RIS", description: "反射の強さや向きを調整できる面です。電波を届きにくい場所へ回り込ませる研究・設計で扱います。" },
      { term: "受動開口", description: "増幅器を持たず、面積で電波を受けて再放射する開口として見る考え方です。" },
      { term: "2ホップ損失", description: "送信機から反射面、反射面から受信機までの2つの距離損失を合わせた見方です。" },
      { term: "近傍/遠方界", description: "反射面の大きさと距離によって、鏡のような幾何光学近似だけでは足りない場合があります。" }
    ]
  }
};

const researchBridgeByTool: Partial<Record<AntennaToolId, ResearchBridge>> = {
  "effective-aperture": {
    plainTitle: "要するに：dBiを、電波を拾う面積として説明するためのツール",
    plainSummary:
      "アンテナ利得はdBiで書かれますが、初めて見る人には大きさの感覚が分かりにくい値です。このページでは、利得を受信面積に戻して、どれくらいの規模で電波を受け取れるアンテナなのかを説明しやすくします。",
    everydayImage:
      "雨を受けるバケツを想像すると近いです。同じ雨でも、口が広いバケツほど多く受け取れます。有効開口は、電波に対するその受け口の大きさです。",
    realUse:
      "アンテナ選定、リンクバジェット説明、低周波と高周波のアンテナサイズ比較で、dBiだけでは伝わりにくい受信しやすさを説明する時に使います。",
    firstAction:
      "まず見る結果は「電波を拾う面積」です。同じ利得のまま周波数を変えると、受信面積がどれだけ変わるかが分かります。",
    glossary: [
      { term: "有効開口", description: "アンテナが電波から電力を取り出す等価的な面積です。実物の見た目の面積とは一致しないことがあります。" },
      { term: "dBi", description: "理想的に全方向へ同じ強さで出すアンテナを基準にした利得です。" },
      { term: "受信面積", description: "利得を直感的に説明するための言い換えです。低周波ほど同じ利得に必要な面積は大きくなります。" }
    ]
  },
  "aperture-gain-beamwidth": {
    plainTitle: "要するに：アンテナの口をどれくらい大きくすれば、必要な強さとビーム幅になるかを見るツール",
    plainSummary:
      "開口アンテナは、口の大きさで利得とビームの細さが大きく決まります。大きくすれば遠くへ届きやすくなりますが、向き合わせはシビアになり、測定に必要な距離も伸びます。",
    everydayImage:
      "懐中電灯の反射板が大きいほど光を遠くへ集められますが、照らす範囲は細くなります。開口アンテナでも同じような設計判断が起きます。",
    realUse:
      "ホーン、レンズ、パラボラ、ミリ波アンテナで、アンテナ径の候補、必要な取り付け精度、測定距離の見積もりを出す時に使います。",
    firstAction:
      "まず見る結果は「飛ばせる強さ」と「ビームの太さ」です。強さが足りないなら開口を大きくし、ビームが細すぎるなら向き合わせの余裕を確認します。",
    glossary: [
      { term: "開口", description: "電波を出し入れする面です。ホーンの口、レンズ径、パラボラ径などが該当します。" },
      { term: "半値ビーム幅", description: "ピークから3dB下がるまでの角度幅です。小さいほど細く狙うアンテナです。" },
      { term: "遠方界", description: "アンテナを十分遠くから見た状態です。開口が大きいほど、その距離は長くなります。" }
    ]
  },
  "antenna-spacing": {
    plainTitle: "要するに：複数アンテナを、近すぎず広すぎず置けているかを見るツール",
    plainSummary:
      "アンテナ間隔はcmだけでは判断できません。同じ5cmでも、周波数が変わると電波的な距離は変わります。このページでは、実装上の距離を波長に対する割合へ直して、配置の当たりを付けます。",
    everydayImage:
      "人の間隔を『何cm』ではなく『肩幅何個分』で見るようなものです。波長を基準にすると、違う周波数の配置を同じものさしで比べられます。",
    realUse:
      "MIMOアンテナ、複数無線を載せた端末、アレイ配置の初期検討で、筐体上の限られたスペースにどの程度の間隔で置けるかを判断します。",
    firstAction:
      "まず見る結果は「間隔/波長」です。0.5λ前後はよく使われる基準、0.25λ未満なら近接結合や相関に注意します。",
    glossary: [
      { term: "λ", description: "波長です。電波1周期分の長さで、周波数が高いほど短くなります。" },
      { term: "相関", description: "複数アンテナが似た信号を受けてしまう度合いです。近すぎると高くなりやすいです。" },
      { term: "結合", description: "アンテナ同士が互いに影響し合うことです。近い配置では無視しにくくなります。" }
    ]
  },
  "array-grating-lobe": {
    plainTitle: "要するに：複数アンテナで、狙っていない方向に強く飛ばないかを見るツール",
    plainSummary:
      "アレイアンテナは、複数のアンテナを並べて電波の向きを作ります。ただ、アンテナ同士の間隔が広すぎると、狙った方向とは別の方向にも強い電波の山が出ます。通信なら干渉やムダ打ち、センサーなら誤検知の原因になります。",
    everydayImage:
      "懐中電灯を1本だけ向けるなら分かりやすいですが、ライトを等間隔にたくさん並べると、正面以外にも明るい筋が出ることがあります。ここでは、その余計な明るい筋が出るかを見ます。",
    realUse:
      "ローカル5G、5G基地局、ミリ波レーダー、MIMOアンテナで、アンテナを何cm間隔で並べるか、どこまで横へビームを向けてよいかを決める初期チェックに使います。",
    firstAction:
      "見るべき結果は「不要ビーム」です。出にくいならまず安心、出る可能性ありならアンテナ間隔を狭めるか、向けたい方向を正面寄りにします。",
    glossary: [
      { term: "グレーティングローブ", description: "不要ビームの専門名です。狙った方向以外に出る強い山を指します。" },
      { term: "走査角", description: "ここでは「向けたい方向」のことです。正面から横へどれだけ振るかを角度で表します。" },
      { term: "λ/2", description: "波長の半分の間隔です。アレイでよく使われる安全寄りの基準です。" }
    ]
  },
  "patch-antenna-dimensions": {
    plainTitle: "要するに：基板に描くパッチアンテナの最初の幅と長さを決めるツール",
    plainSummary:
      "パッチアンテナは、基板上の四角い金属板を共振させるアンテナです。このページでは、狙う周波数と基板材料から、最初にCADへ描く幅Wと長さLを出します。",
    everydayImage:
      "楽器の弦を狙った音に合わせて長さを決めるように、パッチも狙った周波数で反応する長さがあります。基板の材料によって、その長さは変わります。",
    realUse:
      "GNSS、2.4GHz、920MHzなどの基板アンテナで、基板サイズに入るか、どの材料なら小さくできるか、EMシミュレーションの初期形状をどうするかを決める時に使います。",
    firstAction:
      "まず見る結果は「CADで引く幅W」と「CADで引く長さL」です。大きすぎる場合は周波数、基板材料、アンテナ方式の見直し候補になります。",
    glossary: [
      { term: "パッチ", description: "GND面の上に置く金属板です。形状と基板条件で共振周波数が決まります。" },
      { term: "比誘電率", description: "基板内で電波がどれだけ遅く進むかに関係する値です。大きいほど寸法は小さくなります。" },
      { term: "初期寸法", description: "そのまま完成値にする寸法ではなく、シミュレーションや試作調整を始めるための出発点です。" }
    ]
  },
  "small-loop-resonance": {
    plainTitle: "要するに：小さな輪っかに、どのコンデンサを載せれば狙いの周波数になるかを見るツール",
    plainSummary:
      "小型ループは、そのままでは狙いの周波数に合わないことが多いので、コンデンサを足して共振させます。このページは、ループのLと必要なCの目安を出します。",
    everydayImage:
      "ギターの弦を張り具合でチューニングするように、ループも容量で『その周波数に合わせる』と考えると入りやすいです。",
    realUse:
      "NFC、RFID、近距離センサー、低周波の小型アンテナで、試作前に必要な容量レンジや、巻数を増やした時の変化を確認します。",
    firstAction:
      "NFC 13.56MHzプリセットを押し、ループ直径と巻数を動かしてください。必要容量が大きく変わることを見るのがポイントです。",
    glossary: [
      { term: "L", description: "インダクタンスです。ループが磁界としてエネルギーをためる力です。" },
      { term: "C", description: "容量です。Lと組み合わせると特定の周波数で共振します。" },
      { term: "共振", description: "アンテナや回路が特定の周波数で反応しやすくなる状態です。" }
    ]
  },
  "radiation-resistance": {
    plainTitle: "要するに：短いアンテナが、なぜ『整合しても飛ばない』ことがあるかを見るツール",
    plainSummary:
      "短いアンテナは、電波として外へ出る成分である放射抵抗が小さくなります。そこにコイルやGNDの損失が少しあるだけで、効率が大きく落ちます。",
    everydayImage:
      "細い水路から水を出したいのに、途中の漏れが同じくらい大きい状態です。水は流れているのに、外へ出る量が少なくなります。",
    realUse:
      "920MHzの小型端末、BLE/Wi-Fi内蔵アンテナ、コイルで短縮したアンテナで、VSWRだけでは説明できない飛びの悪さを説明する時に使います。",
    firstAction:
      "損失抵抗を1Ω、2Ω、5Ωと動かしてください。放射抵抗が小さい時、たった数Ωで効率が大きく落ちるのが見えます。",
    glossary: [
      { term: "放射抵抗", description: "電力が電波として外へ出る分を抵抗に置き換えたものです。" },
      { term: "損失抵抗", description: "熱になる分です。コイル損、導体損、GND損などをまとめて見ます。" },
      { term: "効率", description: "入力した電力のうち、実際に電波として出た割合です。" }
    ]
  },
  "small-antenna-limit": {
    plainTitle: "要するに：その筐体サイズで、必要な帯域を狙うのが無理筋かを見るツール",
    plainSummary:
      "アンテナは小さくできますが、小さくするほど帯域が狭くなり、効率も厳しくなります。kaとQは、その無理度を数値で見るための入口です。",
    everydayImage:
      "大きな楽器ほど低い音を豊かに鳴らしやすく、小さな楽器で同じ音を出すのは難しい。アンテナにも似た物理的な制約があります。",
    realUse:
      "『この小さな筐体で920MHzを広帯域にできますか？』という初期相談で、物理的にどれくらい厳しい要求かを説明する時に使います。",
    firstAction:
      "入れられる半径を半分にしてみてください。Qが急に上がり、狙える帯域が狭くなるのがこのツールのポイントです。",
    glossary: [
      { term: "ka", description: "アンテナサイズを波長で割ったような数です。小さいほど小型化が厳しい状態です。" },
      { term: "Q", description: "共振の鋭さです。高いほど帯域が狭く、調整がシビアになります。" },
      { term: "Chu限界", description: "小型アンテナの帯域とQに関する物理限界の目安です。" }
    ]
  },
  "large-array-near-field": {
    plainTitle: "要するに：大型アレイを、遠方界として扱ってよい距離かを見るツール",
    plainSummary:
      "アンテナの開口が大きくなると、遠方界になる距離が想像以上に長くなります。近い相手には、角度だけでなく距離方向の焦点も効いてきます。",
    everydayImage:
      "遠くの山は平らな背景のように見えますが、目の前の大きな看板は端と中央で見える角度が違います。大型アレイでも似た見え方の差が出ます。",
    realUse:
      "Sub6の大きな反射板、ミリ波アレイ、6G/XL-MIMO、アンテナ測定距離の検討で、遠方界前提でよいかを確認します。",
    firstAction:
      "一番大きい幅を2倍にしてください。遠方界になる目安距離が4倍近く伸びることを見ると、大型アレイの測定距離が問題になる理由が分かります。",
    glossary: [
      { term: "近傍界", description: "アンテナに近く、波の曲がりや距離方向の違いを無視しにくい領域です。" },
      { term: "遠方界", description: "十分遠く、波を平面波として扱いやすい領域です。" },
      { term: "Fraunhofer距離", description: "遠方界とみなす代表的な目安距離です。開口サイズの2乗に比例します。" }
    ]
  },
  "reflector-ris-size-effect": {
    plainTitle: "要するに：反射板やRISを置いて効きそうなサイズ・距離かを見るツール",
    plainSummary:
      "反射板やRISは、置けば必ず良くなる魔法の板ではありません。面積が足りるか、距離が長すぎないか、効率をどれくらい見込むかで結果が変わります。",
    everydayImage:
      "鏡で光を反射させる時、小さな鏡を遠くに置いても届く光は少ない。電波の反射面も、面積と距離が効きます。",
    realUse:
      "ローカル5G、Wi-Fi、ミリ波で、直接届かない場所へ反射板を置く初期検討や、RIS研究の結果を実務の距離感に戻す時に使います。",
    firstAction:
      "反射面の幅と高さを半分にしてみてください。開口上限利得と直接経路との差がどう悪化するかを見るのが入口です。",
    glossary: [
      { term: "RIS", description: "電波の反射や向きを調整できる面です。届きにくい場所へ電波を回り込ませる目的で使われます。" },
      { term: "2ホップ", description: "送信機→反射面、反射面→受信機という2つの経路で考えることです。" },
      { term: "開口利得", description: "面の大きさを電波を集める力として見た利得です。" }
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
          card("電波を拾う面積", formatArea(result.areaM2), undefined, "このアンテナが電波から電力を取り出す等価的な受け口の大きさです。"),
          card("面積換算の一辺", formatMeters(result.squareSideM), undefined, "同じ面積の正方形に置き換えたときの一辺です。サイズ感の説明に使えます。"),
          card("dBiの電力倍率", `×${smart(result.gainLinear, 2)}`, undefined, "仕様書のdBiを、電力で何倍かに戻した値です。")
        ],
        diagram: {
          title: "dBiを受信面積に戻す",
          variant: toolId,
          labels: [`Ae ${formatArea(result.areaM2)}`, `λ ${formatMeters(result.wavelengthM)}`, `${smart(values.gainDbi, 1)} dBi`]
        },
        chart: {
          title: "周波数が変わると、受信面積はどう変わるか",
          description: "同じ利得なら、低い周波数ほど受信面積は大きくなります。周波数違いのアンテナサイズ感を比べる時に見ます。",
          data: chart,
          unit: "cm²",
          xLabel: "周波数 MHz",
          leftLabel: "有効開口 cm²",
          series: [{ key: "value", name: "有効開口", color: chartTheme.series.source }]
        },
        formula: "Ae = λ²G / (4π)\nG = 10^(dBi / 10)",
        explanation: "アンテナ利得は、受信側では有効開口面積として解釈できます。この計算は、仕様書のdBiを『どれくらいの受け口で電波を拾うか』に言い換えるためのものです。dBiが同じでも、周波数が低いほど波長が長く、等価面積は大きくなります。",
        columnTitle: "コラム：dBiを面積で見ると説明しやすい",
        column: [
          "920MHzと5GHzで同じ2dBiでも、有効開口は大きく違います。サブGHzのアンテナが物理的に大きくなりやすい理由を説明できます。",
          "受信電力の議論では利得だけを見がちですが、開口面積で見ると「電波をどれだけ拾えるか」の話にできます。",
          "小型アンテナで実効利得が落ちる場合、受信面積も小さくなったと考えるとリンク余裕の説明がしやすくなります。"
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
          card("飛ばせる強さ", smart(result.gainDbi, 1), "dBi", "開口径と効率から見た、正面方向にどれくらい強く集められるかの目安です。"),
          card("ビームの太さ", smart(result.hpbwDeg, 1), "deg", "主ビームのおおよその幅です。小さいほど細く、向き合わせがシビアになります。"),
          card("測定で必要な距離", formatMeters(result.fraunhoferM), undefined, "遠方界として測りたい時に必要になりやすい距離の目安です。")
        ],
        diagram: {
          title: "開口を大きくすると強く細くなる",
          variant: toolId,
          labels: [`D ${formatMeters(values.diameterM)}`, `${smart(result.gainDbi, 1)} dBi`, `HPBW ${smart(result.hpbwDeg, 1)}°`]
        },
        chart: {
          title: "開口径で、強さとビーム幅がどう変わるか",
          description: "青＝利得（dBi・左軸）、赤＝ビーム幅（deg・右軸）。開口径が大きいほど利得は上がり、ビームは狭くなります。届きやすさと向き合わせの難しさを同時に見ます。",
          data: chart,
          unit: "dBi / deg",
          xLabel: "開口径 mm",
          leftLabel: "利得 dBi",
          rightLabel: "ビーム幅 deg",
          series: [
            { key: "value", name: "利得 dBi", color: chartTheme.series.source, axis: "left" },
            { key: "value2", name: "ビーム幅 deg", color: chartTheme.series.loss, axis: "right" }
          ]
        },
        formula: "G = η(πD/λ)²\nG[dBi] = 10log10(G)\nHPBW[deg] ≈ 70λ/D",
        explanation: "円形開口アンテナの一次近似です。この計算は、アンテナ径の候補が必要利得に届くか、ビームが細すぎないか、測定距離が足りるかをざっくり確認するために使います。実際のビーム幅やサイドローブは照明分布、レンズ/ホーン形状、エッジ処理で変わります。",
        columnTitle: "コラム：強くするほど、狙いは細くなる",
        column: [
          "利得はD/λの2乗で増えます。60GHzではλが約5mmなので、5cmの開口でもかなり大きな電気的サイズになります。",
          "高利得化は同時にビームを細くします。通信距離は伸びますが、取り付け角度や筐体公差は厳しくなります。",
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
          card("今の間隔", smart(result.spacingLambda, 2), "λ", "実際のアンテナ間隔を波長で割った値です。配置判断ではこの値を主に見ます。"),
          card("位相差の目安", smart(result.phaseDeg, 0), "deg", "正面から来る波ではなく、横方向の波を考えたときに効く位相差の目安です。"),
          card("λ/2なら何cmか", formatMeters(result.halfWaveM), undefined, "同じ周波数で、よく使われるλ/2間隔を物理長に戻した値です。")
        ],
        diagram: {
          title: "cmの距離を波長のものさしで見る",
          variant: toolId,
          labels: [`間隔 ${formatMeters(values.spacingM)}`, `${smart(result.spacingLambda, 2)} λ`, `λ/2 ${formatMeters(result.halfWaveM)}`]
        },
        chart: {
          title: "同じ配置でも、周波数が上がると広く見える",
          description: "筐体上の距離が同じでも、周波数が上がると波長に対する間隔は大きくなります。複数帯域で同じ配置を使う時に確認します。",
          data: chart,
          unit: "λ",
          xLabel: "周波数 MHz",
          leftLabel: "間隔 / λ",
          series: [{ key: "value", name: "間隔/λ", color: chartTheme.series.source }],
          reference: 0.5,
          referenceLabel: "λ/2"
        },
        formula: "間隔[λ] = 物理間隔[m] / λ[m]\n位相差[deg] = 間隔[λ] × 360",
        explanation: "MIMOや複数アンテナ配置では、cmではなくλで距離を見ると周波数をまたいで比較できます。この計算は、限られた筐体内で近すぎるか、アレイ用途で広すぎるかの初期判断に使います。λ/2はよく使われる基準ですが、筐体、偏波、グランド、相関の実測で最終判断します。",
        columnTitle: "コラム：アンテナ間隔はcmだけでは判断できない",
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
          card("今の間隔", smart(result.spacingLambda, 2), "λ", "アンテナ同士の距離を波長で見た値です。0.5λ前後なら安全寄りです。"),
          card("安全に使える上限", smart(result.limitLambda, 2), "λ", "指定した向きまでビームを振っても、不要ビームを出しにくい間隔の目安です。"),
          card("不要ビーム", result.hasVisibleGratingLobe ? "出る可能性あり" : "出にくい", undefined, "狙っていない方向にも強い電波の山が出るかを判定します。", result.hasVisibleGratingLobe ? "rose" : "emerald")
        ],
        diagram: {
          title: "狙う方向と余計な方向",
          variant: toolId,
          labels: [
            `間隔 ${smart(result.spacingLambda, 2)}λ`,
            `向ける ${smart(values.scanAngleDeg, 0)}°`,
            result.lobes[0] ? `余計な山 ${smart(result.lobes[0].angleDeg, 0)}°` : "余計な山なし"
          ]
        },
        chart: {
          title: "横へ向けるほど、許される間隔は狭くなる",
          description: "赤い線が今の間隔、青い線が安全寄りの上限です。赤が青を超えると、狙っていない方向にも強く出る可能性があります。",
          data: chart,
          unit: "mm",
          xLabel: "走査角 deg",
          leftLabel: "間隔 mm",
          series: [
            { key: "value", name: "安全に使える上限 mm", color: chartTheme.series.source },
            { key: "value2", name: "今の間隔 mm", color: chartTheme.series.loss }
          ]
        },
        formula: "不要ビームが実際に出る条件: |sinθ0 + mλ/d| ≤ 1\n安全目安: d/λ ≤ 1 / (1 + |sinθmax|)",
        explanation: "等間隔に並べたアンテナでは、間隔dが広いほど別方向にも同じような山が出やすくなります。式はその山が実空間に現れる条件です。実際の強さはアンテナ単体の形、振幅の付け方、筐体、相互結合で変わりますが、まず危ない配置を見つける一次判定として使えます。",
        columnTitle: "コラム：なぜ「間隔を広げればよい」ではないのか",
        column: [
          "アンテナを離すと、アンテナ同士の影響は減り、実装もしやすく見えます。しかし離しすぎると、複数アンテナの周期性が目立ち、狙った方向以外にも強い山が出ます。",
          "正面だけを見るならλ/2はよく使われる基準ですが、横へ大きく向けるほど安全な上限はλ/2より小さくなります。",
          "このトレードオフをスライダーで動かすと、アレイ設計で『詰めたい理由』と『離したい理由』が同時に見えます。"
        ],
        warning: result.hasVisibleGratingLobe
          ? "この条件では、狙っていない方向にも強い電波の山が出る可能性があります。アンテナ間隔を狭める、向けたい角度を小さくする、アンテナ単体の指向性で抑える、の順に検討してください。"
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
          card("CADで引く幅 W", formatMm(result.widthM), undefined, "最初に基板CADへ置くパッチ幅の目安です。放射効率や入力抵抗にも効きます。"),
          card("CADで引く長さ L", formatMm(result.lengthM), undefined, "狙う周波数で共振させるための長さの初期値です。試作やEM解析で追い込みます。"),
          card("基板中の見かけε", smart(result.effectiveEr, 2), undefined, "空気と基板をまたいで進む電波が、実際に感じる誘電率の目安です。")
        ],
        diagram: {
          title: "最初に描くパッチ寸法",
          variant: toolId,
          labels: [`W ${formatMm(result.widthM)}`, `L ${formatMm(result.lengthM)}`, `εeff ${smart(result.effectiveEr, 2)}`]
        },
        chart: {
          title: "周波数を上げると、パッチはどれだけ小さくなるか",
          description: "同じ基板なら、狙う周波数が上がるほどパッチの幅と長さは小さくなります。基板に入るかの初期確認に使います。",
          data: chart,
          unit: "mm",
          xLabel: "周波数 MHz",
          leftLabel: "寸法 mm",
          series: [
            { key: "value", name: "幅 W", color: chartTheme.series.source },
            { key: "value2", name: "長さ L", color: chartTheme.series.gain }
          ]
        },
        formula: "W = c/(2f)√(2/(εr+1))\nεeff = (εr+1)/2 + (εr-1)/(2√(1+12h/W))\nL = c/(2f√εeff) - 2ΔL",
        explanation: "矩形マイクロストリップパッチの伝送線路モデルによる初期寸法です。この計算は、CADに最初の形を置くためのものです。給電位置、GNDサイズ、基板損失、銅厚、筐体で共振点はずれるため、EMシミュレーションや試作調整の出発点として使います。",
        columnTitle: "コラム：完成寸法ではなく、最初の当たりを出す",
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
          card("ループのL", smart(result.inductanceH * 1e9, 1), "nH", "ループが磁界としてエネルギーをためる量です。ここから必要容量を決めます。"),
          card("載せる容量の目安", smart(result.capacitanceF * 1e12, 1), "pF", "指定周波数でループを合わせるためのコンデンサ容量の初期候補です。"),
          card("小型近似の確認", smart(result.circumferenceLambda, 3), "λ", "ループ周囲長が波長に対して十分小さいかを見る目安です。")
        ],
        diagram: {
          title: "ループに足すコンデンサを決める",
          variant: toolId,
          labels: [`D ${smart(values.loopDiameterMm, 0)} mm`, `L ${smart(result.inductanceH * 1e9, 1)} nH`, `C ${smart(result.capacitanceF * 1e12, 1)} pF`]
        },
        chart: {
          title: "狙う周波数で、必要容量がどう変わるか",
          description: "同じループなら、周波数が高いほど必要な同調容量は小さくなります。部品値の候補が現実的かを見ます。",
          data: chart,
          unit: "pF",
          xLabel: "周波数 MHz",
          leftLabel: "必要容量 pF",
          series: [{ key: "value", name: "必要容量", color: chartTheme.series.source }]
        },
        formula: "L ≈ μ0N²r(ln(8r/a)-2)\nC = 1 / ((2πf)²L)",
        explanation: "単純な円形導体ループの近似です。この計算は、狙う周波数に合わせるためのコンデンサ容量レンジを決める入口です。プリントループや多巻きコイルでは寄生容量、近接効果、基板、手や筐体の影響が大きいため、初期値として扱ってください。",
        columnTitle: "コラム：部品値が極端なら、形状から見直す",
        column: [
          "必要容量が極端に小さい、または大きい場合は、コンデンサ選定だけでなくループ径や巻数を見直した方が早いことがあります。",
          "小型ループは磁界結合や近距離用途で便利ですが、寄生容量や手・筐体の影響を受けやすい構造です。",
          "高いQは選択度を上げる一方、帯域や量産ばらつきの許容を狭くします。試作では可変容量や複数値で追い込みます。"
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
          card("電波に変わる抵抗", smart(result.radiationResistanceOhm, 2), "Ω", "入力電力のうち、電波として外へ出る成分を抵抗に置き換えた値です。"),
          card("外へ出る割合", smart(result.efficiencyPercent, 1), "%", "放射抵抗/(放射抵抗+損失抵抗) の単純モデルです。低いほど熱として失われます。", result.efficiencyPercent < 50 ? "amber" : "emerald"),
          card("短さの度合い", smart(result.lengthRatio, 3), "λ", "アンテナ長が波長に対してどれだけ短いかを示します。小さいほど損失に弱くなります。")
        ],
        diagram: {
          title: "短いアンテナは、少しの損でも効率が落ちる",
          variant: toolId,
          labels: [`${shortKind === "monopole" ? "モノポール" : "ダイポール"}`, `Rr ${smart(result.radiationResistanceOhm, 2)}Ω`, `η ${smart(result.efficiencyPercent, 1)}%`]
        },
        chart: {
          title: "短いほど、損が効率を奪いやすい",
          description: "青＝放射抵抗（Ω・左軸）、緑＝効率（％・右軸）。アンテナ長が短いほど放射抵抗が小さくなり、コイルやGNDの数Ωが効率を大きく下げます。",
          data: chart,
          unit: "Ω / %",
          xLabel: "アンテナ長 / λ",
          leftLabel: "放射抵抗 Ω",
          rightLabel: "効率 %",
          series: [
            { key: "value", name: "放射抵抗 Ω", color: chartTheme.series.source, axis: "left" },
            { key: "value2", name: "効率 %", color: chartTheme.series.gain, axis: "right" }
          ]
        },
        formula: shortKind === "monopole"
          ? "Rr ≈ 40π²(h/λ)²\n効率 η = Rr / (Rr + Rloss)"
          : "Rr ≈ 20π²(l/λ)²\n効率 η = Rr / (Rr + Rloss)",
        explanation: "短いモノポール/ダイポールの低次近似です。この計算は、S11やVSWRが良くても飛びが悪い時に、短さと損失がどれほど効いているかを説明するために使います。実アンテナでは整合回路やGND、コイル、筐体電流も効きます。",
        columnTitle: "コラム：S11が良いのに飛ばない理由を分ける",
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
          card("小ささの指標 ka", smart(result.ka, 3), undefined, "アンテナ外形が波長に対してどれだけ小さいかを示します。小さいほど帯域確保が厳しくなります。"),
          card("最低限のQ目安", smart(result.chuQ, 1), undefined, "小型アンテナで避けにくい共振の鋭さの目安です。高いほど帯域は狭くなります。"),
          card("狙える帯域の目安", smart(result.maxFractionalBandwidthPercent, 2), "%", "1/Qから見た粗い帯域上限です。必要帯域より小さい場合は要注意です。", result.targetToLimitRatio > 1 ? "rose" : "emerald")
        ],
        diagram: {
          title: "筐体サイズで帯域の無理度を見る",
          variant: toolId,
          labels: [`a ${smart(values.radiusMm, 0)} mm`, `ka ${smart(result.ka, 3)}`, `Qmin ${smart(result.chuQ, 1)}`]
        },
        chart: {
          title: "小さくするほど、帯域上限は急に狭くなる",
          description:
            "青＝狙える帯域上限（％・左軸）、赤＝最低限のQ（右軸）。kaが小さくなるほどQが急増し、狙える帯域は急に狭くなります。筐体サイズの交渉材料になります。",
          data: chart,
          unit: "% / Q",
          xLabel: "ka（小さいほど厳しい）",
          leftLabel: "比帯域上限 %",
          rightLabel: "最低限のQ",
          series: [
            { key: "value", name: "比帯域上限 %", color: chartTheme.series.source, axis: "left" },
            { key: "value2", name: "最低限のQ", color: chartTheme.series.loss, axis: "right" }
          ],
          reference: values.targetBandwidthPercent,
          referenceLabel: "目標帯域",
          referenceAxis: "left"
        },
        formula: "ka = 2πa / λ\nQmin ≈ 1/(ka)³ + 1/(ka)\n比帯域上限 ≈ 1/Q",
        explanation: "Chu限界に基づく小型アンテナの物理限界の粗い可視化です。この計算は、与えられた筐体サイズで必要帯域を狙うのが現実的かを、試作前に説明するために使います。整合回路や能動回路で見かけの帯域を工夫できても、受動・小型・高効率を同時に満たす難しさは残ります。",
        columnTitle: "コラム：小型化で一番つらいのは帯域",
        column: [
          "近年も小型アンテナの帯域拡張は研究されていますが、受動共振器のサイズと帯域の制約は設計判断の中心にあります。",
          "時間変調抵抗など限界を工学的に押し広げる研究もありますが、量産端末ではまずkaとQで無理度を見積もるのが実務的です。",
          "玄人向けには「この筐体サイズでその帯域は物理的に厳しい」を数値で説明できるのが価値です。"
        ],
        warning: result.targetToLimitRatio > 1
          ? "必要な帯域が、単純な物理限界の目安を上回っています。アンテナスペース拡大、筐体全体の利用、複共振化、効率低下の許容などを検討する領域です。"
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
          card("遠方界になる目安", formatMeters(result.fraunhoferM), undefined, "この距離より十分遠いと、平面波・遠方界として扱いやすくなります。"),
          card("近さの指標", smart(result.fresnelNumber, 2), undefined, "D²/(λR)。1以上なら近傍界性が強く、距離方向の違いを無視しにくい目安です。"),
          card("遠方界扱い", result.isRadiatingNearField ? "要注意" : "おおむねOK", undefined, "評価距離が遠方界の目安より近いかどうかを見ます。", result.isRadiatingNearField ? "amber" : "emerald")
        ],
        diagram: {
          title: "測定点や相手が十分遠いかを見る",
          variant: toolId,
          labels: [`D ${formatMeters(values.apertureSizeM)}`, `Rff ${formatMeters(result.fraunhoferM)}`, `R ${formatMeters(values.distanceM)}`]
        },
        chart: {
          title: "アンテナ面が大きいほど、必要距離は急に伸びる",
          description: "遠方界距離はD²/λで増えるため、開口を大きくすると急に伸びます。測定環境や解析モデルの確認に使います。",
          data: chart,
          unit: "m",
          xLabel: "開口の最大幅 m",
          leftLabel: "距離 m",
          series: [
            { key: "value", name: "遠方界目安距離", color: chartTheme.series.source },
            { key: "value2", name: "評価距離", color: chartTheme.series.loss }
          ]
        },
        formula: "Rff = 2D² / λ\nFresnel数 = D² / (λR)\n端部の経路差 = √(R²+(D/2)²)-R",
        explanation: "大型アレイや高周波アンテナでは、相手が遠方界にいるとは限りません。この計算は、測定距離や通信距離で遠方界前提を使ってよいかを確認するためのものです。近傍界では平面波ではなく球面波として扱う必要があり、ビームは角度だけでなく距離にも焦点を持ちます。",
        columnTitle: "コラム：大型アレイでは『十分遠い』が意外と遠い",
        column: [
          "6G/XL-MIMOではアンテナ数や開口が大きくなり、従来の平面波・遠方界モデルだけでは足りない場面が増えています。",
          "近傍界ではビームステアリングだけでなく、ビームフォーカシング、球面波、空間非定常性が問題になります。",
          "このツールは発展的な計算の入口として、まず2D²/λがどれほど大きくなるかを体感するためのものです。"
        ],
        warning: result.isRadiatingNearField
          ? "この距離では遠方界前提に注意が必要です。近傍界ビーム、測定距離、位相補正、距離方向の焦点を確認してください。"
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
          card("面で稼げる上限", smart(result.apertureGainDbi, 1), "dBi", "反射面の面積を有効に使えた場合に期待できる上限寄りの利得です。"),
          card("反射経路の損失", smart(result.twoHopLossUpperBoundDb, 1), "dB", "送信機→反射面、反射面→受信機の2区間を通る時の粗い損失目安です。"),
          card("置く意味の目安", smart(result.excessVsDirectDb, 1), "dB", "同じ総距離を直接進む場合との差です。正の値が大きいほど反射経路は厳しい条件です。", result.excessVsDirectDb > 0 ? "amber" : "emerald")
        ],
        diagram: {
          title: "反射面は面積と距離で効き方が決まる",
          variant: toolId,
          labels: [`A ${formatArea(result.areaM2)}`, `${smart(result.apertureGainDbi, 1)} dBi`, `Rff ${formatMeters(result.fraunhoferM)}`]
        },
        chart: {
          title: "反射面を大きくすると、どこまで効くか",
          description: "面積を大きくすると開口利得は増えますが、2ホップ距離の損失も効きます。設置サイズを増やす意味があるかを見ます。",
          data: chart,
          unit: "dB",
          xLabel: "反射面の幅 m",
          leftLabel: "dB",
          series: [
            { key: "value", name: "面で稼げる上限", color: chartTheme.series.source },
            { key: "value2", name: "直接経路との差", color: chartTheme.series.loss }
          ],
          reference: 0,
          referenceLabel: "直接FSPL"
        },
        formula: "Gsurface ≈ 4πAη / λ²\nL2hop ≈ max(FSPL(d1)+FSPL(d2)-2·Gsurface, FSPL(d1+d2))\nRff ≈ 2D²/λ",
        explanation: "反射板/RISを面積を持つ受動開口として見た上限寄りの概算です。この計算は、反射面を置く価値がありそうか、面積不足か、距離が厳しすぎるかを一次判断するために使います。実際のRISパスロスは偏波、散乱、位相分布、照明、近傍/遠方界条件で変わります。",
        columnTitle: "コラム：反射板は、置けば必ず効くわけではない",
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

  const hasRight = chart.series.some((s) => s.axis === "right");
  const leftSeriesColor = chart.series.find((s) => (s.axis ?? "left") === "left")?.color ?? chartTheme.series.source;
  const rightSeriesColor = chart.series.find((s) => s.axis === "right")?.color ?? chartTheme.series.loss;
  // 右軸がある（＝軸ごとに1系列）ときは、軸を線の色に対応させて一目で分かるようにする。
  // ただし淡い系列色のままだと小さな軸文字が低コントラストになるため、軸線・目盛り・軸名には
  // 対応する濃い同系色（chartTheme.seriesText）を使ってWCAG-AAを満たす。
  const axisHueColor = (color: string): string =>
    color === chartTheme.series.loss
      ? chartTheme.seriesText.loss
      : color === chartTheme.series.gain
        ? chartTheme.seriesText.gain
        : color === chartTheme.series.source
          ? chartTheme.seriesText.source
          : chartTheme.axis.label.fill;
  const leftAxisColor = hasRight ? axisHueColor(leftSeriesColor) : chartTheme.axis.label.fill;
  const leftAxisStroke = hasRight ? axisHueColor(leftSeriesColor) : chartTheme.axis.tick.fill;
  const rightAxisColor = axisHueColor(rightSeriesColor);

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
      <div className="mt-4 h-72 w-full">
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={288}>
            <LineChart
              data={chart.data}
              margin={{
                left: chart.leftLabel ? 16 : 6,
                right: hasRight && chart.rightLabel ? 16 : 18,
                top: 8,
                bottom: chart.xLabel ? 16 : 8
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid.primary} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: chartTheme.axis.label.fontSize, fill: chartTheme.axis.label.fill }}
                label={
                  chart.xLabel
                    ? {
                        value: chart.xLabel,
                        position: "insideBottom",
                        offset: -6,
                        fontSize: 11,
                        fill: chartTheme.axis.label.fill
                      }
                    : undefined
                }
              />
              <YAxis
                yAxisId="left"
                tick={{ fontSize: chartTheme.axis.label.fontSize, fill: leftAxisColor }}
                stroke={leftAxisStroke}
                domain={["auto", "auto"]}
                label={
                  chart.leftLabel
                    ? {
                        value: chart.leftLabel,
                        angle: -90,
                        position: "insideLeft",
                        style: { textAnchor: "middle", fontSize: 11, fontWeight: 600, fill: leftAxisColor }
                      }
                    : undefined
                }
              />
              {hasRight ? (
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: chartTheme.axis.label.fontSize, fill: rightAxisColor }}
                  stroke={rightAxisColor}
                  domain={["auto", "auto"]}
                  label={
                    chart.rightLabel
                      ? {
                          value: chart.rightLabel,
                          angle: 90,
                          position: "insideRight",
                          style: { textAnchor: "middle", fontSize: 11, fontWeight: 600, fill: rightAxisColor }
                        }
                      : undefined
                  }
                />
              ) : null}
              <RechartsTooltip formatter={(value, name) => [`${value}`, name]} />
              <Legend verticalAlign="top" align="right" height={22} wrapperStyle={{ fontSize: 12 }} />
              {typeof chart.reference === "number" ? (
                <ReferenceLine
                  yAxisId={chart.referenceAxis ?? "left"}
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
                  yAxisId={series.axis ?? "left"}
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
          <h3 className="text-base font-semibold text-slate-950">使い方と判断ポイント・用語ミニ辞典</h3>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">
            どの順番で入力し、結果を何の判断に使うのかをこのページ内で確認できます。
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

function ResearchBridgeSection({ toolId }: { toolId: AntennaToolId }) {
  const bridge = researchBridgeByTool[toolId];
  if (!bridge) {
    return null;
  }

  return (
    <Card as="section" padding="lg" className="border-indigo-100 bg-indigo-50/40">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-indigo-700">この計算で決められること</p>
          <h3 className="mt-1 text-base font-semibold text-slate-950">{bridge.plainTitle}</h3>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-700">{bridge.plainSummary}</p>
        </div>
        <Tooltip term="最初の見方">
          式を暗記するより、入力を少し動かして結果が急変する場所を見るのが近道です。まず主役の数値、判定、グラフの傾きを見てください。
        </Tooltip>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <div className="border-l-2 border-indigo-300 bg-white/50 py-1 pl-4">
          <p className="text-sm font-semibold text-slate-950">日常イメージ</p>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">{bridge.everydayImage}</p>
        </div>
        <div className="border-l-2 border-indigo-300 bg-white/50 py-1 pl-4">
          <p className="text-sm font-semibold text-slate-950">実際の使われ方</p>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">{bridge.realUse}</p>
        </div>
        <div className="border-l-2 border-indigo-300 bg-white/50 py-1 pl-4">
          <p className="text-sm font-semibold text-slate-950">まず触るところ</p>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">{bridge.firstAction}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-slate-500">このページでつまずきやすい語：</span>
        {bridge.glossary.map((item) => (
          <Tooltip key={item.term} term={item.term}>
            {item.description}
          </Tooltip>
        ))}
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
        error: rfErrorMessage(error)
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
          <ResearchBridgeSection toolId={toolId} />

          <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
            <Card as="section" padding="lg">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-base font-semibold text-slate-950">計算結果（まずここを見る）</h3>
                <Tooltip term="結果の読み方">
                  主役の値は大きく表示し、その値で何を判断するかは各カードの補足と下の解説にまとめています。dB、長さ、割合など単位も必ず確認してください。
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
