import { calculateFsplDb } from "./fspl";
import { judgeLinkMargin, type LinkJudgement } from "./judgement";
import { type DistanceUnit, normalizeDistanceKm } from "./linkBudget";

export type NcuOutdoorModel = "free_space" | "log_distance";

export type NcuCoverMaterial = "open" | "resin" | "concrete" | "cast_iron" | "steel" | "unknown";
export type NcuBoxMaterial = "resin" | "concrete" | "metal" | "unknown";
export type NcuMoistureCondition = "dry" | "damp" | "wet" | "standing_water";
export type NcuAntennaPosition = "near_lid" | "middle" | "bottom" | "near_metal";
export type NcuOpeningCondition = "open" | "narrow_gap" | "sealed" | "metal_frame";
export type NcuSurfaceObstruction = "none" | "pedestrian" | "vehicle" | "parked_vehicle";

export type DbRange = {
  min: number;
  typical: number;
  max: number;
};

export type NcuBelowGroundInput = {
  system: string;
  outdoorModel: NcuOutdoorModel;
  frequencyMHz: number;
  distance: number;
  distanceUnit: DistanceUnit;
  pathLossExponent: number;
  txPowerDbm: number;
  gatewayAntennaGainDbi: number;
  ncuAntennaGainDbi: number;
  receiverSensitivityDbm: number;
  cableLossDb: number;
  aboveGroundClutterLossDb: number;
  depthBelowGroundM: number;
  coverMaterial: NcuCoverMaterial;
  boxMaterial: NcuBoxMaterial;
  moistureCondition: NcuMoistureCondition;
  antennaPosition: NcuAntennaPosition;
  openingCondition: NcuOpeningCondition;
  surfaceObstruction: NcuSurfaceObstruction;
  measuredCorrectionDb: number;
};

export type NcuLossBreakdownItem = {
  id: string;
  label: string;
  valueLabel: string;
  range: DbRange;
  note: string;
};

export type NcuBelowGroundWarning = {
  id: string;
  message: string;
};

export type NcuBelowGroundResult = {
  distanceKm: number;
  distanceM: number;
  outdoorPathLossDb: number;
  belowGroundLossRangeDb: DbRange;
  totalLossRangeDb: DbRange;
  receivedPowerRangeDbm: DbRange;
  linkMarginRangeDb: DbRange;
  judgement: LinkJudgement;
  breakdown: NcuLossBreakdownItem[];
  warnings: NcuBelowGroundWarning[];
};

export type NcuFieldMeasurementsInput = {
  outsideBoxDbm: number;
  boxOpenDbm: number;
  boxClosedDryDbm: number;
  boxClosedWetDbm: number;
  antennaImprovedDbm: number;
  vehicleCoveredDbm: number;
  nearbyShiftedDbm: number;
};

export type NcuFieldFindingSeverity = "none" | "low" | "medium" | "high";

export type NcuFieldFinding = {
  id: string;
  label: string;
  valueDb: number;
  impactDb: number;
  severity: NcuFieldFindingSeverity;
  summary: string;
  nextAction: string;
};

export type NcuFieldAnalysisResult = {
  recommendedCorrectionDb: number;
  predictedClosedDryDbm: number;
  findings: NcuFieldFinding[];
  primaryFinding: NcuFieldFinding;
  measurementQualityNotes: string[];
};

export type NcuRadioMetricsInput = {
  rsrpDbm: number | null;
  rssiDbm: number | null;
  rsrqDb: number | null;
  sinrDb: number | null;
  snrDb: number | null;
  packetSuccessPercent: number | null;
  retryCount: number | null;
};

export type NcuRadioMetricSeverity = "unknown" | "good" | "caution" | "poor";
export type NcuRadioMetricCategory = "power" | "quality" | "reliability";

export type NcuRadioMetricDiagnosisItem = {
  id: keyof NcuRadioMetricsInput;
  label: string;
  value: number | null;
  unit: string;
  category: NcuRadioMetricCategory;
  severity: NcuRadioMetricSeverity;
  summary: string;
  detail: string;
  nextAction: string;
};

export type NcuRadioMetricsDiagnosisResult = {
  availableCount: number;
  overallSeverity: NcuRadioMetricSeverity;
  dominantCategory: NcuRadioMetricCategory | "unknown";
  summary: string;
  items: NcuRadioMetricDiagnosisItem[];
  recommendedActions: string[];
  caveats: string[];
};

export type NcuOption<T extends string> = {
  value: T;
  label: string;
  description: string;
};

export const ncuOutdoorModelOptions: NcuOption<NcuOutdoorModel>[] = [
  {
    value: "log_distance",
    label: "Log-distanceモデル",
    description:
      "Log-distance（ログディスタンス）：距離が2倍になるごとに何dB弱まるかを『距離損失指数 n』で決める経験式です。nが大きいほど距離で急に弱まります（開けた場所n≈2、市街地・遮蔽ありn≈3〜4が目安）。迷ったらこちらを選び、現地RSSIに合うようnを調整します。"
  },
  {
    value: "free_space",
    label: "自由空間損失モデル",
    description:
      "自由空間損失：障害物がまったく無い理想状態の最小損失（基準値）です。実際の地下設置では必ずこれより悪くなるので、楽観値として使い、建物・地形の遮蔽はクラッタ損失、蓋・BOXの損失は別項目で必ず足してください。"
  }
];

export const ncuCoverMaterialOptions: NcuOption<NcuCoverMaterial>[] = [
  { value: "open", label: "開放・蓋なし", description: "NCUの上に蓋がなく、電波を遮るものがほぼない状態。最も有利で追加損失はわずかです。" },
  { value: "resin", label: "樹脂蓋", description: "プラスチック・複合材の蓋。電波を比較的よく通します。ただし厚み・水濡れ・泥汚れで通りにくくなることがあります（金属蓋より大幅に有利）。" },
  { value: "concrete", label: "コンクリート蓋", description: "そこそこ電波を弱めます。中の鉄筋・金具や、雨で濡れているかで損失が大きく変わります（おおむね10〜20dB級）。" },
  { value: "cast_iron", label: "鋳鉄蓋", description: "鋳鉄（ちゅうてつ）＝水道BOXやマンホールで最も多い金属の蓋。電波を強く反射・遮断し、閉めた瞬間に20〜30dBほど落ちることがある厳しい条件です。" },
  { value: "steel", label: "鋼板・金属蓋", description: "金属で開口がほとんどない蓋。鋳鉄以上に厳しいことがあり、外部アンテナ化や蓋直下配置を強く検討します。" },
  { value: "unknown", label: "不明", description: "材質が分からないとき。安全側に損失を広いレンジ（楽観〜厳しめ）で見ます。現地写真で材質を確認できると精度が上がります。" }
];

export const ncuBoxMaterialOptions: NcuOption<NcuBoxMaterial>[] = [
  { value: "resin", label: "樹脂BOX", description: "箱自体は電波を比較的通します。遮蔽は小さめですが、中の水分やアンテナの置き場所の影響は残ります。" },
  { value: "concrete", label: "コンクリートBOX", description: "壁が厚い・濡れている・鉄筋が入っているほど電波を弱めます。地下ピットで一般的な条件です。" },
  { value: "metal", label: "金属BOX", description: "開口以外が金属で囲まれ電波が閉じ込められます。アンテナの向き・位置で結果が大きく変わるため、外部アンテナ化が有効なことが多いです。" },
  { value: "unknown", label: "不明", description: "BOX材質が分からないとき。追加損失を広いレンジで見積もります。" }
];

export const ncuMoistureOptions: NcuOption<NcuMoistureCondition>[] = [
  { value: "dry", label: "乾燥", description: "晴天続きで土・コンクリート・蓋が乾いている状態。水による追加の弱まりは小さめです。" },
  { value: "damp", label: "湿り気あり", description: "うっすら湿っている状態。水を含むと電波は通りにくくなるため、乾燥時よりばらつきが増えます。" },
  { value: "wet", label: "濡れている", description: "雨上がりや水膜がある状態。水は電波を強く吸収するため、損失がはっきり増えます。" },
  { value: "standing_water", label: "水が溜まる", description: "BOX内に水たまり/水没気味の状態。吸収に加えアンテナの同調（共振点）もずれて性能が落ちる、最も厳しい水分条件です。乾燥時と雨天後の両方で実測を。" }
];

export const ncuAntennaPositionOptions: NcuOption<NcuAntennaPosition>[] = [
  { value: "near_lid", label: "蓋の直下", description: "アンテナを地表の開口（蓋）にいちばん近づけた配置。電波が外へ抜けやすく比較的有利。改善の目標位置にもなります。" },
  { value: "middle", label: "BOX中央付近", description: "標準的な置き方。可もなく不可もない基準条件として扱います。" },
  { value: "bottom", label: "BOX底面付近", description: "地表から遠く、底の水分・遮蔽・見通しの欠け（フレネル欠損）の影響を受けやすい不利な配置です。" },
  { value: "near_metal", label: "金属近傍", description: "金属の壁・金具のすぐ近く。アンテナの整合（インピーダンス）・放射効率・偏波が崩れ利得が大きく落ちることがあります。数cm離すだけで改善する場合も。" }
];

export const ncuOpeningOptions: NcuOption<NcuOpeningCondition>[] = [
  { value: "open", label: "開口がある", description: "地表側へ電波が抜ける隙間・樹脂窓・非金属部がある状態。電波の『出口』があるほど有利です。" },
  { value: "narrow_gap", label: "小さな隙間のみ", description: "わずかな隙間から漏れる成分に頼る状態。アンテナの向き・位置で結果が変わりやすくなります。" },
  { value: "sealed", label: "ほぼ密閉", description: "蓋・筐体・地面で電波が閉じ込められた状態。出口が乏しく厳しい条件として扱います。" },
  { value: "metal_frame", label: "金属枠が強い", description: "金属の枠や蓋で開口が狭い状態。金属が出口をふさぐため、密閉に近い厳しさになります。" }
];

export const ncuSurfaceObstructionOptions: NcuOption<NcuSurfaceObstruction>[] = [
  { value: "none", label: "特になし", description: "地表面の上に電波を遮るもの（車・人）が少ない状態。" },
  { value: "pedestrian", label: "人の通行あり", description: "人体は水分が多く電波を吸収します。通行のたびに一時的に弱まる（フェージング）ことを少し見込みます。" },
  { value: "vehicle", label: "車両通過あり", description: "金属の車体が上を通ると短時間に大きく落ち込みます。瞬断の原因になり得ます。" },
  { value: "parked_vehicle", label: "駐車車両で覆われる", description: "金属の車体が長時間ふたをする最も厳しい地表条件。通信断の主因になりやすく、設置位置をずらす検討を。" }
];

export const defaultNcuBelowGroundInput: NcuBelowGroundInput = {
  system: "920MHz帯 LPWA（LoRaWAN／特定小電力）",
  outdoorModel: "log_distance",
  frequencyMHz: 920,
  distance: 300,
  distanceUnit: "m",
  pathLossExponent: 2.8,
  txPowerDbm: 13,
  gatewayAntennaGainDbi: 2,
  ncuAntennaGainDbi: -6,
  receiverSensitivityDbm: -130,
  cableLossDb: 1,
  aboveGroundClutterLossDb: 5,
  depthBelowGroundM: 0.4,
  coverMaterial: "concrete",
  boxMaterial: "concrete",
  moistureCondition: "damp",
  antennaPosition: "middle",
  openingCondition: "narrow_gap",
  surfaceObstruction: "none",
  measuredCorrectionDb: 0
};

export const defaultNcuFieldMeasurements: NcuFieldMeasurementsInput = {
  outsideBoxDbm: -92,
  boxOpenDbm: -101,
  boxClosedDryDbm: -116,
  boxClosedWetDbm: -123,
  antennaImprovedDbm: -108,
  vehicleCoveredDbm: -130,
  nearbyShiftedDbm: -110
};

export const defaultNcuRadioMetrics: NcuRadioMetricsInput = {
  rsrpDbm: -116,
  rssiDbm: null,
  rsrqDb: -14,
  sinrDb: 1,
  snrDb: null,
  packetSuccessPercent: 88,
  retryCount: 3
};

const coverLossRanges: Record<NcuCoverMaterial, DbRange> = {
  open: { min: 0, typical: 1, max: 2 },
  resin: { min: 1, typical: 3, max: 6 },
  concrete: { min: 5, typical: 10, max: 18 },
  cast_iron: { min: 12, typical: 22, max: 38 },
  steel: { min: 18, typical: 30, max: 50 },
  unknown: { min: 6, typical: 15, max: 35 }
};

const boxLossRanges: Record<NcuBoxMaterial, DbRange> = {
  resin: { min: 0, typical: 1, max: 3 },
  concrete: { min: 2, typical: 6, max: 14 },
  metal: { min: 8, typical: 18, max: 35 },
  unknown: { min: 2, typical: 8, max: 20 }
};

const moistureLossRanges: Record<NcuMoistureCondition, DbRange> = {
  dry: { min: 0, typical: 1, max: 3 },
  damp: { min: 2, typical: 5, max: 10 },
  wet: { min: 5, typical: 10, max: 20 },
  standing_water: { min: 10, typical: 20, max: 35 }
};

const antennaPositionLossRanges: Record<NcuAntennaPosition, DbRange> = {
  near_lid: { min: 0, typical: 2, max: 5 },
  middle: { min: 2, typical: 6, max: 12 },
  bottom: { min: 5, typical: 12, max: 24 },
  near_metal: { min: 8, typical: 18, max: 35 }
};

const openingLossRanges: Record<NcuOpeningCondition, DbRange> = {
  open: { min: 0, typical: 1, max: 3 },
  narrow_gap: { min: 2, typical: 5, max: 10 },
  sealed: { min: 5, typical: 12, max: 24 },
  metal_frame: { min: 8, typical: 18, max: 35 }
};

const surfaceObstructionLossRanges: Record<NcuSurfaceObstruction, DbRange> = {
  none: { min: 0, typical: 1, max: 3 },
  pedestrian: { min: 1, typical: 3, max: 8 },
  vehicle: { min: 6, typical: 13, max: 25 },
  parked_vehicle: { min: 10, typical: 20, max: 35 }
};

function addRanges(ranges: DbRange[]): DbRange {
  return ranges.reduce(
    (sum, range) => ({
      min: sum.min + range.min,
      typical: sum.typical + range.typical,
      max: sum.max + range.max
    }),
    { min: 0, typical: 0, max: 0 }
  );
}

function buildDepthLossRange(depthBelowGroundM: number): DbRange {
  const depth = Math.max(0, depthBelowGroundM);

  return {
    min: depth * 3,
    typical: depth * 7,
    max: depth * 14
  };
}

function optionLabel<T extends string>(options: NcuOption<T>[], value: T): string {
  return options.find((option) => option.value === value)?.label ?? value;
}

function calculateOutdoorPathLossDb(input: NcuBelowGroundInput, distanceKm: number): number {
  if (input.outdoorModel === "free_space") {
    return calculateFsplDb(input.frequencyMHz, distanceKm);
  }

  const distanceM = Math.max(1, distanceKm * 1000);
  const referenceLossDb = calculateFsplDb(input.frequencyMHz, 0.001);

  return referenceLossDb + 10 * input.pathLossExponent * Math.log10(distanceM);
}

function buildLossBreakdown(input: NcuBelowGroundInput): NcuLossBreakdownItem[] {
  return [
    {
      id: "cover",
      label: "蓋・地表面の遮蔽",
      valueLabel: optionLabel(ncuCoverMaterialOptions, input.coverMaterial),
      range: coverLossRanges[input.coverMaterial],
      note: "GL以下NCUでは、蓋の材質と開口が支配的になりやすい項目です。"
    },
    {
      id: "box",
      label: "BOX・ピット筐体",
      valueLabel: optionLabel(ncuBoxMaterialOptions, input.boxMaterial),
      range: boxLossRanges[input.boxMaterial],
      note: "BOX壁・鉄筋・金属面に囲まれるほど、アンテナ効率と放射方向が崩れやすくなります。"
    },
    {
      id: "depth",
      label: "GL下深さ",
      valueLabel: `${input.depthBelowGroundM.toFixed(2)} m`,
      range: buildDepthLossRange(input.depthBelowGroundM),
      note: "深さをアンテナ高のマイナス値として使わず、地表開口までの追加損失として扱います。"
    },
    {
      id: "moisture",
      label: "水分・湿潤",
      valueLabel: optionLabel(ncuMoistureOptions, input.moistureCondition),
      range: moistureLossRanges[input.moistureCondition],
      note: "湿った土壌・水膜・水没気味の状態は、吸収とアンテナ detuning の両方を悪化させます。"
    },
    {
      id: "antenna",
      label: "アンテナ位置・金属近接",
      valueLabel: optionLabel(ncuAntennaPositionOptions, input.antennaPosition),
      range: antennaPositionLossRanges[input.antennaPosition],
      note: "蓋直下は比較的有利、底面や金属近傍は整合・偏波・指向性の崩れを強く疑います。"
    },
    {
      id: "opening",
      label: "開口・隙間条件",
      valueLabel: optionLabel(ncuOpeningOptions, input.openingCondition),
      range: openingLossRanges[input.openingCondition],
      note: "地表側へ電波が抜ける経路があるかどうかを、独立した損失として見ます。"
    },
    {
      id: "surface",
      label: "地表上の一時遮蔽",
      valueLabel: optionLabel(ncuSurfaceObstructionOptions, input.surfaceObstruction),
      range: surfaceObstructionLossRanges[input.surfaceObstruction],
      note: "歩行者や車両は、短時間または長時間の深いフェージング要因になります。"
    }
  ];
}

function validateFinite(value: number, fallback: number): number {
  return Number.isFinite(value) ? value : fallback;
}

export function calculateNcuBelowGround(input: NcuBelowGroundInput): NcuBelowGroundResult {
  const safeInput = {
    ...input,
    frequencyMHz: Math.max(0.001, validateFinite(input.frequencyMHz, defaultNcuBelowGroundInput.frequencyMHz)),
    distance: Math.max(0.001, validateFinite(input.distance, defaultNcuBelowGroundInput.distance)),
    pathLossExponent: Math.min(6, Math.max(1, validateFinite(input.pathLossExponent, 2.8))),
    depthBelowGroundM: Math.min(5, Math.max(0, validateFinite(input.depthBelowGroundM, 0))),
    cableLossDb: Math.max(0, validateFinite(input.cableLossDb, 0)),
    aboveGroundClutterLossDb: Math.max(0, validateFinite(input.aboveGroundClutterLossDb, 0)),
    measuredCorrectionDb: Math.min(60, Math.max(-60, validateFinite(input.measuredCorrectionDb, 0)))
  };
  const distanceKm = normalizeDistanceKm(safeInput.distance, safeInput.distanceUnit);
  const distanceM = distanceKm * 1000;
  const outdoorPathLossDb = calculateOutdoorPathLossDb(safeInput, distanceKm);
  const breakdown = buildLossBreakdown(safeInput);
  const belowGroundLossRangeDb = addRanges(breakdown.map((item) => item.range));
  const fixedLossDb = outdoorPathLossDb + safeInput.cableLossDb + safeInput.aboveGroundClutterLossDb;
  const linkBudgetStartDbm =
    safeInput.txPowerDbm + safeInput.gatewayAntennaGainDbi + safeInput.ncuAntennaGainDbi;
  const receivedPowerRangeDbm = {
    min: linkBudgetStartDbm - fixedLossDb - belowGroundLossRangeDb.max + safeInput.measuredCorrectionDb,
    typical:
      linkBudgetStartDbm - fixedLossDb - belowGroundLossRangeDb.typical + safeInput.measuredCorrectionDb,
    max: linkBudgetStartDbm - fixedLossDb - belowGroundLossRangeDb.min + safeInput.measuredCorrectionDb
  };
  const linkMarginRangeDb = {
    min: receivedPowerRangeDbm.min - safeInput.receiverSensitivityDbm,
    typical: receivedPowerRangeDbm.typical - safeInput.receiverSensitivityDbm,
    max: receivedPowerRangeDbm.max - safeInput.receiverSensitivityDbm
  };
  const totalLossRangeDb = {
    min: fixedLossDb + belowGroundLossRangeDb.min,
    typical: fixedLossDb + belowGroundLossRangeDb.typical,
    max: fixedLossDb + belowGroundLossRangeDb.max
  };

  return {
    distanceKm,
    distanceM,
    outdoorPathLossDb,
    belowGroundLossRangeDb,
    totalLossRangeDb,
    receivedPowerRangeDbm,
    linkMarginRangeDb,
    judgement: judgeLinkMargin(linkMarginRangeDb.typical),
    breakdown,
    warnings: buildNcuBelowGroundWarnings(safeInput, {
      belowGroundLossRangeDb,
      linkMarginRangeDb
    })
  };
}

function buildNcuBelowGroundWarnings(
  input: NcuBelowGroundInput,
  result: Pick<NcuBelowGroundResult, "belowGroundLossRangeDb" | "linkMarginRangeDb">
): NcuBelowGroundWarning[] {
  const warnings: NcuBelowGroundWarning[] = [];
  const rangeWidthDb = result.belowGroundLossRangeDb.max - result.belowGroundLossRangeDb.min;

  warnings.push({
    id: "not-negative-height",
    message:
      "GL以下のNCUは、奥村・秦モデルや2波モデルのアンテナ高にマイナス値を入れて扱う条件ではありません。このページでは、地上側伝搬とBOX・蓋・水分・配置による追加損失を分けて評価します。"
  });

  if (input.outdoorModel === "free_space") {
    warnings.push({
      id: "free-space-optimistic",
      message:
        "自由空間損失は見通し基準値です。水道BOX・地下ピットでは、地上側の建物・車両・地形の遮蔽をクラッタ損失として別途加算してください。"
    });
  }

  if (input.coverMaterial === "cast_iron" || input.coverMaterial === "steel") {
    warnings.push({
      id: "metal-cover",
      message:
        "金属蓋は強い遮蔽とアンテナ近傍影響を起こしやすい条件です。蓋直下へのアンテナ配置、非金属部・開口の利用、外部アンテナ化を優先して検討してください。"
    });
  }

  if (input.moistureCondition === "wet" || input.moistureCondition === "standing_water") {
    warnings.push({
      id: "moisture",
      message:
        "濡れ・水溜まりがある条件では、吸収だけでなくアンテナ整合のずれも起きます。乾燥時と降雨後の両方でRSSI/RSRPを確認してください。"
    });
  }

  if (input.depthBelowGroundM >= 1) {
    warnings.push({
      id: "deep-installation",
      message:
        "GL下深さが1m以上です。地表への抜け道、蓋材質、周辺構造物の影響が大きく、机上計算の不確かさが増えます。複数地点での実測補正を推奨します。"
    });
  }

  if (rangeWidthDb >= 45) {
    warnings.push({
      id: "wide-range",
      message:
        "推定損失レンジが非常に広い条件です。材質・開口・水分・アンテナ位置が未確定のままでは判定がぶれやすいため、写真・図面・実測値で条件を絞ってください。"
    });
  }

  if (input.measuredCorrectionDb === 0) {
    warnings.push({
      id: "missing-measurement",
      message:
        "実測補正が未入力です。GL以下NCUは設置差が大きいため、現地RSSI/RSRPを1点でも取得し、計算値との差分を実測補正として入れることを推奨します。"
    });
  }

  if (result.linkMarginRangeDb.typical < 0 && result.linkMarginRangeDb.max >= 0) {
    warnings.push({
      id: "range-crosses-threshold",
      message:
        "楽観条件では成立余地がありますが、標準条件では受信感度を下回ります。蓋・開口・アンテナ位置の改善でどの損失を減らせるかを優先的に確認してください。"
    });
  } else if (result.linkMarginRangeDb.typical >= 0 && result.linkMarginRangeDb.min < 0) {
    warnings.push({
      id: "range-crosses-threshold-pessimistic",
      message:
        "標準条件では成立しますが、厳しめ条件（金属蓋・水溜まり・底面配置・駐車車両など）が重なると受信感度を下回る余地があります。雨天後や車両ありなど悪条件での実測確認を推奨します。"
    });
  }

  return warnings;
}

export function formatDbRange(range: DbRange, unit = "dB"): string {
  return `${range.min.toFixed(1)}〜${range.max.toFixed(1)} ${unit}`;
}

function fieldSeverity(impactDb: number): NcuFieldFindingSeverity {
  if (impactDb >= 15) {
    return "high";
  }

  if (impactDb >= 8) {
    return "medium";
  }

  if (impactDb >= 3) {
    return "low";
  }

  return "none";
}

function normalizeMeasurement(value: number, fallback: number): number {
  return Number.isFinite(value) ? value : fallback;
}

function createFinding(
  id: string,
  label: string,
  valueDb: number,
  impactDb: number,
  summary: string,
  nextAction: string
): NcuFieldFinding {
  return {
    id,
    label,
    valueDb,
    impactDb,
    severity: fieldSeverity(impactDb),
    summary,
    nextAction
  };
}

export function calculateNcuFieldAnalysis(
  measurements: NcuFieldMeasurementsInput,
  predictedClosedDryDbm: number
): NcuFieldAnalysisResult {
  const safeMeasurements: NcuFieldMeasurementsInput = {
    outsideBoxDbm: normalizeMeasurement(measurements.outsideBoxDbm, defaultNcuFieldMeasurements.outsideBoxDbm),
    boxOpenDbm: normalizeMeasurement(measurements.boxOpenDbm, defaultNcuFieldMeasurements.boxOpenDbm),
    boxClosedDryDbm: normalizeMeasurement(
      measurements.boxClosedDryDbm,
      defaultNcuFieldMeasurements.boxClosedDryDbm
    ),
    boxClosedWetDbm: normalizeMeasurement(
      measurements.boxClosedWetDbm,
      defaultNcuFieldMeasurements.boxClosedWetDbm
    ),
    antennaImprovedDbm: normalizeMeasurement(
      measurements.antennaImprovedDbm,
      defaultNcuFieldMeasurements.antennaImprovedDbm
    ),
    vehicleCoveredDbm: normalizeMeasurement(
      measurements.vehicleCoveredDbm,
      defaultNcuFieldMeasurements.vehicleCoveredDbm
    ),
    nearbyShiftedDbm: normalizeMeasurement(
      measurements.nearbyShiftedDbm,
      defaultNcuFieldMeasurements.nearbyShiftedDbm
    )
  };

  const safePredictedClosedDryDbm = normalizeMeasurement(
    predictedClosedDryDbm,
    defaultNcuFieldMeasurements.boxClosedDryDbm
  );
  const boxInternalLossDb = safeMeasurements.outsideBoxDbm - safeMeasurements.boxOpenDbm;
  const coverLossDb = safeMeasurements.boxOpenDbm - safeMeasurements.boxClosedDryDbm;
  const moistureLossDb = safeMeasurements.boxClosedDryDbm - safeMeasurements.boxClosedWetDbm;
  const antennaImprovementDb = safeMeasurements.antennaImprovedDbm - safeMeasurements.boxClosedDryDbm;
  const vehicleLossDb = safeMeasurements.boxClosedDryDbm - safeMeasurements.vehicleCoveredDbm;
  const localFadingSpreadDb = Math.abs(safeMeasurements.nearbyShiftedDbm - safeMeasurements.boxClosedDryDbm);
  const recommendedCorrectionDb = safeMeasurements.boxClosedDryDbm - safePredictedClosedDryDbm;

  const findings = [
    createFinding(
      "box-internal",
      "BOX内配置・深さ",
      boxInternalLossDb,
      Math.max(0, boxInternalLossDb),
      "BOX外の地表付近では受かるのに、蓋を開けたBOX内で落ちる差です。深さ、BOX壁、金属近接、アンテナが底面寄りかどうかを疑います。",
      "蓋を開けたまま、アンテナを蓋直下・側面・底面で動かしてRSSI/RSRPを比較してください。"
    ),
    createFinding(
      "cover",
      "蓋・金属枠",
      coverLossDb,
      Math.max(0, coverLossDb),
      "蓋を閉めた瞬間に落ちる差です。鋳鉄蓋、鋼板、金属枠、コンクリート含水、開口不足が主因候補になります。",
      "蓋あり/なし、蓋を少しずらす、樹脂窓や非金属部の近くへアンテナを寄せる比較をしてください。"
    ),
    createFinding(
      "moisture",
      "水分・雨天後",
      moistureLossDb,
      Math.max(0, moistureLossDb),
      "乾燥時と湿潤時の差です。水膜、水溜まり、湿ったコンクリート、アンテナ整合ずれが重なる場合があります。",
      "雨天後と乾燥時を同じ測定条件で比較し、水位・結露・アンテナ防水位置を記録してください。"
    ),
    createFinding(
      "antenna-placement",
      "アンテナ配置改善余地",
      antennaImprovementDb,
      Math.max(0, antennaImprovementDb),
      "アンテナを蓋直下や非金属部へ寄せたときの改善量です。大きいほど、伝搬距離よりアンテナ近傍条件の改善が効きます。",
      "改善後配置を量産・施工で再現できるか、固定方法とケーブル取り回しを確認してください。"
    ),
    createFinding(
      "vehicle",
      "車両・地表遮蔽",
      vehicleLossDb,
      Math.max(0, vehicleLossDb),
      "車両や金属体が上に来たときの落ち込みです。駐車車両で長時間覆われる現場では通信断の主因になり得ます。",
      "車両あり/なし、車両位置、時間帯を変えて測り、必要なら設置位置や通信方式を見直してください。"
    ),
    createFinding(
      "local-fading",
      "反射・近傍フェージング",
      safeMeasurements.nearbyShiftedDbm - safeMeasurements.boxClosedDryDbm,
      localFadingSpreadDb,
      "数十cmの移動や向き変更で変わる差です。地面反射、BOX内反射、偏波、アンテナ向きの影響を疑います。",
      "30cm程度の位置変更、90度回転、蓋直下への移動でRSSI/RSRPの山谷を探してください。"
    ),
    createFinding(
      "model-correction",
      "計算値とのズレ",
      recommendedCorrectionDb,
      Math.abs(recommendedCorrectionDb),
      "標準条件の計算受信電力と、蓋閉め・乾燥時の実測値との差です。実測補正値として転記できます。",
      "この値を実測補正に入れ、別地点でも同じ傾向か確認してください。"
    )
  ].sort((a, b) => b.impactDb - a.impactDb);

  const measurementQualityNotes: string[] = [];
  if (safeMeasurements.boxClosedDryDbm > safeMeasurements.boxOpenDbm + 3) {
    measurementQualityNotes.push(
      "蓋閉め時の方が蓋開け時より3dB以上良くなっています。測定タイミング、通信方向、基地局側負荷、平均化回数を確認してください。"
    );
  }
  if (safeMeasurements.boxClosedWetDbm > safeMeasurements.boxClosedDryDbm + 3) {
    measurementQualityNotes.push(
      "湿潤時の方が乾燥時より3dB以上良くなっています。水分以外の変動、基地局側条件、測定位置の違いを疑ってください。"
    );
  }
  if (Math.abs(recommendedCorrectionDb) >= 25) {
    measurementQualityNotes.push(
      "計算値と実測値の差が25dB以上あります。送信電力、アンテナ利得、受信感度、距離、通信方向、蓋条件の入力違いを先に確認してください。"
    );
  }
  if (measurementQualityNotes.length === 0) {
    measurementQualityNotes.push(
      "測定差分に大きな矛盾は見当たりません。主因候補の大きい順に現場条件を潰していくと、説明しやすい解析になります。"
    );
  }

  return {
    recommendedCorrectionDb,
    predictedClosedDryDbm: safePredictedClosedDryDbm,
    findings,
    primaryFinding: findings[0],
    measurementQualityNotes
  };
}

function normalizeOptionalMetric(value: number | null): number | null {
  if (value === null || !Number.isFinite(value)) {
    return null;
  }

  return value;
}

function metricSeverityRank(severity: NcuRadioMetricSeverity): number {
  switch (severity) {
    case "poor":
      return 3;
    case "caution":
      return 2;
    case "good":
      return 1;
    case "unknown":
      return 0;
  }
}

function createRadioMetricItem(
  id: keyof NcuRadioMetricsInput,
  label: string,
  value: number | null,
  unit: string,
  category: NcuRadioMetricCategory,
  thresholds: {
    good: (value: number) => boolean;
    caution: (value: number) => boolean;
  },
  messages: Record<Exclude<NcuRadioMetricSeverity, "unknown">, { summary: string; detail: string; nextAction: string }>,
  unknownDetail: string
): NcuRadioMetricDiagnosisItem {
  if (value === null) {
    return {
      id,
      label,
      value,
      unit,
      category,
      severity: "unknown",
      summary: "未入力",
      detail: unknownDetail,
      nextAction: "機器ログ、通信モジュールのATコマンド、管理画面、測定アプリから取得できる場合だけ入力してください。"
    };
  }

  const severity: NcuRadioMetricSeverity = thresholds.good(value)
    ? "good"
    : thresholds.caution(value)
      ? "caution"
      : "poor";
  const message = messages[severity];

  return {
    id,
    label,
    value,
    unit,
    category,
    severity,
    summary: message.summary,
    detail: message.detail,
    nextAction: message.nextAction
  };
}

export function calculateNcuRadioMetricsDiagnosis(
  metrics: NcuRadioMetricsInput
): NcuRadioMetricsDiagnosisResult {
  const safeMetrics: NcuRadioMetricsInput = {
    rsrpDbm: normalizeOptionalMetric(metrics.rsrpDbm),
    rssiDbm: normalizeOptionalMetric(metrics.rssiDbm),
    rsrqDb: normalizeOptionalMetric(metrics.rsrqDb),
    sinrDb: normalizeOptionalMetric(metrics.sinrDb),
    snrDb: normalizeOptionalMetric(metrics.snrDb),
    packetSuccessPercent: normalizeOptionalMetric(metrics.packetSuccessPercent),
    retryCount: normalizeOptionalMetric(metrics.retryCount)
  };

  const items: NcuRadioMetricDiagnosisItem[] = [
    createRadioMetricItem(
      "rsrpDbm",
      "RSRP",
      safeMetrics.rsrpDbm,
      "dBm",
      "power",
      {
        good: (value) => value >= -95,
        caution: (value) => value >= -115
      },
      {
        good: {
          summary: "受信電力は比較的良好",
          detail: "基準信号の受信電力は大きく崩れていません。通信不安定の主因が別にある可能性も見ます。",
          nextAction: "RSRQ/SINR/SNRや再送回数を合わせて確認し、品質劣化や混雑を切り分けてください。"
        },
        caution: {
          summary: "受信電力が弱め",
          detail: "GL以下NCUでは、蓋・BOX・水分・アンテナ位置の数dB差で通信余裕がなくなりやすい領域です。",
          nextAction: "蓋直下への移動、金属から離す、開口側へ寄せる、外部アンテナ化を優先候補にしてください。"
        },
        poor: {
          summary: "受信電力不足が強い",
          detail: "まず電波の入り口が足りない状態です。品質指標を見る前に、BOX外でも弱いのか、蓋で急落するのかを分けます。",
          nextAction: "BOX外・蓋開け・蓋閉めの3点を測り、地上側リンクか地下/蓋損失かを切り分けてください。"
        }
      },
      "LTE-M/NB-IoTなどで取得できる基準信号受信電力です。RSSIより通信路の強さを見やすい場合があります。"
    ),
    createRadioMetricItem(
      "rssiDbm",
      "RSSI",
      safeMetrics.rssiDbm,
      "dBm",
      "power",
      {
        good: (value) => value >= -85,
        caution: (value) => value >= -100
      },
      {
        good: {
          summary: "総受信電力は良好",
          detail: "帯域内の総受信電力は十分に見えます。ただし干渉もRSSIに含まれるため、RSSI単独では判定しません。",
          nextAction: "RSRQ/SINR/SNRも見て、強いが汚い電波になっていないか確認してください。"
        },
        caution: {
          summary: "総受信電力が弱め",
          detail: "リンク余裕が少ない可能性があります。BOXや蓋の追加損失で数dB悪化すると通信が揺れやすくなります。",
          nextAction: "同じ位置で複数回測り、平均値と最悪値を分けて記録してください。"
        },
        poor: {
          summary: "総受信電力不足が強い",
          detail: "地上側の距離・遮蔽、蓋・BOX損失、アンテナ効率低下のいずれかが大きい可能性があります。",
          nextAction: "まずBOX外で測り、BOX外でも悪い場合は基地局/GW位置や地上遮蔽を確認してください。"
        }
      },
      "LPWAや無線モジュールでよく出る受信強度です。方式により意味や帯域幅が異なるため、目安として扱います。"
    ),
    createRadioMetricItem(
      "rsrqDb",
      "RSRQ",
      safeMetrics.rsrqDb,
      "dB",
      "quality",
      {
        good: (value) => value >= -10,
        caution: (value) => value >= -15
      },
      {
        good: {
          summary: "受信品質は比較的良好",
          detail: "RSRPが弱くなければ、混雑・干渉よりも蓋やアンテナ配置の損失を先に見ます。",
          nextAction: "RSRP/RSSIと合わせて、電力不足か品質劣化かを切り分けてください。"
        },
        caution: {
          summary: "受信品質がやや悪い",
          detail: "電波の強さだけでなく、干渉、混雑、反射、基地局選択の影響を受けている可能性があります。",
          nextAction: "時間帯を変える、場所を30cm動かす、蓋あり/なしでRSRQが変わるか確認してください。"
        },
        poor: {
          summary: "品質劣化が強い",
          detail: "RSRPが十分でもRSRQが悪い場合、単純な距離不足ではなく、干渉・反射・セル混雑側を疑います。",
          nextAction: "同じRSRPでRSRQだけ悪い地点を比較し、時間帯・基地局ID・周辺金属・反射条件を記録してください。"
        }
      },
      "LTE系でよく出る品質指標です。値は負のdBで、一般に0に近いほど良好です。"
    ),
    createRadioMetricItem(
      "sinrDb",
      "SINR",
      safeMetrics.sinrDb,
      "dB",
      "quality",
      {
        good: (value) => value >= 10,
        caution: (value) => value >= 0
      },
      {
        good: {
          summary: "干渉余裕は比較的良好",
          detail: "信号が干渉・雑音より十分に強い状態です。通信不安定なら瞬断や設置ばらつきも確認します。",
          nextAction: "パケット成功率、再送回数、時間変動を合わせて確認してください。"
        },
        caution: {
          summary: "干渉余裕が小さい",
          detail: "少しの反射・遮蔽・向きの変化でリンクが不安定化しやすい状態です。",
          nextAction: "30cm移動、アンテナ向き変更、蓋直下配置でSINRが改善するか見てください。"
        },
        poor: {
          summary: "干渉・雑音の影響が強い",
          detail: "信号の強さだけでは説明しにくい品質劣化です。反射、金属近傍、同一/隣接チャネル干渉を疑います。",
          nextAction: "RSRPが悪くないのにSINRが低い場合は、時間帯・周辺設備・金属蓋・BOX内反射を優先確認してください。"
        }
      },
      "信号対干渉雑音比です。セルラー系や一部モジュールの品質ログで確認できます。"
    ),
    createRadioMetricItem(
      "snrDb",
      "SNR",
      safeMetrics.snrDb,
      "dB",
      "quality",
      {
        good: (value) => value >= 5,
        caution: (value) => value >= -10
      },
      {
        good: {
          summary: "信号対雑音比は良好",
          detail: "雑音に対する余裕はあります。低速LPWAでは他の再送・ADR・SF設定も合わせて確認します。",
          nextAction: "RSSI/RSRPやパケット成功率も見て、電力不足や再送増加がないか確認してください。"
        },
        caution: {
          summary: "SNRが低め",
          detail: "方式によっては成立しますが、余裕は限定的です。雨天や車両遮蔽で急に苦しくなる可能性があります。",
          nextAction: "同じ地点で複数回測り、最悪値と平均値を分けて記録してください。"
        },
        poor: {
          summary: "SNRがかなり低い",
          detail: "復調限界に近い、または方式設定に強く依存する領域です。LoRaなどではSFにより成立範囲が変わります。",
          nextAction: "方式別の復調条件を確認し、アンテナ位置改善、送信回数、データレート低下、外部アンテナ化を検討してください。"
        }
      },
      "信号対雑音比です。LoRa系ではマイナス値でも成立する場合がありますが、方式・SFで解釈が変わります。"
    ),
    createRadioMetricItem(
      "packetSuccessPercent",
      "パケット成功率",
      safeMetrics.packetSuccessPercent,
      "%",
      "reliability",
      {
        good: (value) => value >= 98,
        caution: (value) => value >= 90
      },
      {
        good: {
          summary: "実通信は安定寄り",
          detail: "短時間の結果としては良好です。ただし駐車車両や雨天後など、悪い条件の再現も必要です。",
          nextAction: "時間帯、雨天後、車両ありの条件で同じ成功率を確認してください。"
        },
        caution: {
          summary: "成功率に不安あり",
          detail: "見かけのRSSI/RSRPが足りていても、再送や瞬断で実運用に影響が出る可能性があります。",
          nextAction: "RSSI/RSRPの最悪値、RSRQ/SINR/SNR、再送回数を同じタイムスタンプで確認してください。"
        },
        poor: {
          summary: "実通信が不安定",
          detail: "通信成立率が低く、机上マージンより現場条件のばらつきが支配的になっている可能性があります。",
          nextAction: "まず蓋開け/閉め、雨天後、車両ありの再現条件を作り、どの条件で落ちるか確認してください。"
        }
      },
      "送信試行に対してACKや受信成功が返った割合です。短時間ではなく複数回の平均で見ると安定します。"
    ),
    createRadioMetricItem(
      "retryCount",
      "再送回数",
      safeMetrics.retryCount,
      "回",
      "reliability",
      {
        good: (value) => value <= 1,
        caution: (value) => value <= 3
      },
      {
        good: {
          summary: "再送は少ない",
          detail: "同じ条件で再送が少なければ、実運用上は比較的安定している可能性があります。",
          nextAction: "悪条件時にも再送が増えないか、雨天後や車両ありで確認してください。"
        },
        caution: {
          summary: "再送が増え始めている",
          detail: "リンク余裕が少ない、または一時的なフェージング・干渉が出ている可能性があります。",
          nextAction: "成功率、RSSI/RSRPの最悪値、RSRQ/SINR/SNRを同じ測定回で記録してください。"
        },
        poor: {
          summary: "再送が多い",
          detail: "受信電力が見かけ上足りていても、実通信品質としては厳しい状態です。",
          nextAction: "データレート低下、送信タイミング分散、アンテナ位置改善、外部アンテナ化を検討してください。"
        }
      },
      "機器ログで取れる場合の再送回数です。方式により定義が異なるため、同一機器内の比較に向きます。"
    )
  ];

  const availableItems = items.filter((item) => item.severity !== "unknown");
  const availableCount = availableItems.length;
  const overallSeverity =
    availableItems.reduce<NcuRadioMetricSeverity>((worst, item) => {
      return metricSeverityRank(item.severity) > metricSeverityRank(worst) ? item.severity : worst;
    }, "unknown");
  const categoryScores: Record<NcuRadioMetricCategory, number> = {
    power: 0,
    quality: 0,
    reliability: 0
  };

  for (const item of availableItems) {
    if (item.severity === "poor") {
      categoryScores[item.category] += 3;
    } else if (item.severity === "caution") {
      categoryScores[item.category] += 1;
    }
  }

  const categoryEntries = Object.entries(categoryScores) as Array<[NcuRadioMetricCategory, number]>;
  const [dominantCategory, dominantScore] = categoryEntries.sort((a, b) => b[1] - a[1])[0];
  const resolvedDominantCategory: NcuRadioMetricCategory | "unknown" =
    dominantScore > 0 ? dominantCategory : "unknown";

  const summaryByCategory: Record<NcuRadioMetricCategory | "unknown", string> = {
    power:
      "受信電力不足が主因候補です。まずBOX外・蓋開け・蓋閉めの差分で、地上側リンクか地下/蓋損失かを切り分けてください。",
    quality:
      "品質・干渉側が主因候補です。RSRP/RSSIが極端に悪くないのにRSRQ/SINR/SNRが悪い場合は、反射、金属近傍、混雑、干渉を疑います。",
    reliability:
      "実通信成功率側が主因候補です。電界や品質の瞬時値だけでなく、再送・ACK・時間変動を見て運用上の安定性を確認してください。",
    unknown:
      availableCount === 0
        ? "通信品質指標が未入力です。分かる項目だけ入力すると、電界不足・品質劣化・再送増加のどこが怪しいかを簡易診断できます。"
        : "入力された指標に大きな異常は見当たりません。悪条件時の最悪値、時間帯差、雨天後、車両遮蔽時も確認してください。"
  };

  const recommendedActionsByCategory: Record<NcuRadioMetricCategory | "unknown", string[]> = {
    power: [
      "BOX外でRSRP/RSSIを測り、地上側リンク自体が弱いか確認する",
      "蓋開け/蓋閉めの差分を測り、蓋・金属枠・水分の追加損失を分ける",
      "アンテナを蓋直下、非金属部、金属から離した位置へ動かして改善量を見る"
    ],
    quality: [
      "RSRP/RSSIが同程度の場所でRSRQ/SINR/SNRだけ悪いか比較する",
      "30cm移動や90度回転で品質指標が変わるか見て、反射・偏波・近傍金属を疑う",
      "時間帯、基地局/GW、周辺設備の稼働状態を記録して干渉・混雑を切り分ける"
    ],
    reliability: [
      "成功率と再送回数を、蓋開け/閉め、雨天後、車両ありで同じ手順で測る",
      "平均値だけでなく、最悪値と連続失敗の有無を記録する",
      "データレート、送信間隔、再送設定、外部アンテナ化の余地を確認する"
    ],
    unknown: [
      "まずRSRPまたはRSSI、RSRQまたはSINR/SNR、成功率または再送回数のうち、取れるものを1つずつ入力する",
      "機器や方式ごとにログ名が違うため、同一機器・同一条件での相対比較を優先する",
      "瞬時値ではなく、複数回測定した平均値と最悪値を分けて残す"
    ]
  };

  return {
    availableCount,
    overallSeverity,
    dominantCategory: resolvedDominantCategory,
    summary: summaryByCategory[resolvedDominantCategory],
    items,
    recommendedActions: recommendedActionsByCategory[resolvedDominantCategory],
    caveats: [
      "ここでの閾値は簡易目安です。キャリア、通信方式、帯域幅、モジュール実装、ログ定義により判定境界は変わります。",
      "RSRQ/SINR/SNRは、受信電力そのものではなく品質側の指標です。RSRP/RSSIと組み合わせて解釈してください。",
      "LoRaなどのLPWAではSNRがマイナスでも成立する場合があります。SF、データレート、再送設定とセットで確認してください。"
    ]
  };
}
