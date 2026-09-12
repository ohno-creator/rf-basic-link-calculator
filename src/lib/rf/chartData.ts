import { calculateLinkBudget, type LinkBudgetInput } from "./linkBudget";

export type DistancePowerPoint = {
  distanceKm: number;
  distanceLabel: string;
  receivedPowerDbm: number;
  sensitivityDbm: number;
  current: boolean;
};

export type ImprovementSimulation = {
  label: string;
  description: string;
  marginDb: number;
  deltaDb: number;
};

export type ReachCurvePoint = {
  distanceM: number;
  distanceLabel: string;
  linkMarginDb: number;
};

function formatDistanceLabel(distanceKm: number) {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)}m`;
  }

  return `${Number(distanceKm.toFixed(distanceKm >= 10 ? 0 : 2))}km`;
}

/** 距離[m]を軸目盛り向けに短く表記（1000m以上はkm）。 */
export function formatReachDistanceLabel(distanceM: number): string {
  if (!Number.isFinite(distanceM)) {
    return "-";
  }
  if (distanceM >= 1000) {
    const km = distanceM / 1000;
    return `${km >= 10 ? Math.round(km) : Number(km.toFixed(1))}km`;
  }
  if (distanceM >= 1) {
    return `${Math.round(distanceM)}m`;
  }
  return `${Number(distanceM.toFixed(1))}m`;
}

/**
 * 距離–リンクマージン曲線用のデータ点を対数等間隔で生成する。
 * 現在距離と到達限界（maxReachM）の両方が視野に入るよう範囲を決め、
 * 選択中の伝搬モデルのまま距離だけ変えて margin を評価する。
 */
export function generateReachCurveData(
  input: LinkBudgetInput,
  maxReachM: number | null
): ReachCurvePoint[] {
  const currentM = input.distanceUnit === "km" ? input.distance * 1000 : input.distance;
  const anchorHi = Math.max(currentM, maxReachM ?? currentM);
  const anchorLo = Math.min(currentM, maxReachM ?? currentM);
  // 到達限界の少し先まで（マージンが負に入る様子）と、現在点の手前まで見せる。
  const hi = Math.min(40_000, Math.max(anchorHi * 2, currentM * 4, 10));
  const lo = Math.max(0.5, Math.min(anchorLo / 3, currentM / 4));
  const logLo = Math.log10(lo);
  const logHi = Math.log10(Math.max(hi, lo * 10));
  const steps = 48;

  const points: ReachCurvePoint[] = [];
  for (let i = 0; i <= steps; i += 1) {
    const distanceM = 10 ** (logLo + ((logHi - logLo) * i) / steps);
    let marginDb: number;
    try {
      marginDb = calculateLinkBudget({ ...input, distance: distanceM, distanceUnit: "m" }).linkMarginDb;
    } catch {
      continue;
    }
    if (!Number.isFinite(marginDb)) {
      continue;
    }
    points.push({
      distanceM,
      distanceLabel: formatReachDistanceLabel(distanceM),
      linkMarginDb: Number(marginDb.toFixed(2))
    });
  }
  return points;
}

export function generateDistancePowerData(input: LinkBudgetInput): DistancePowerPoint[] {
  const current = calculateLinkBudget(input);
  const multipliers = [0.1, 0.25, 0.5, 1, 2, 5, 10];

  return multipliers.map((multiplier) => {
    const distanceKm = Math.max(current.distanceKm * multiplier, 0.0001);
    const simulated = calculateLinkBudget({
      ...input,
      distance: input.distanceUnit === "m" ? distanceKm * 1000 : distanceKm,
      distanceUnit: input.distanceUnit
    });

    return {
      distanceKm,
      distanceLabel: formatDistanceLabel(distanceKm),
      receivedPowerDbm: Number(simulated.receivedPowerDbm.toFixed(1)),
      sensitivityDbm: input.receiverSensitivityDbm,
      current: multiplier === 1
    };
  });
}

export function simulateImprovements(input: LinkBudgetInput): ImprovementSimulation[] {
  const current = calculateLinkBudget(input);
  const currentMargin = current.linkMarginDb;
  const cableReduction = Math.min(2, input.cableLossDb);

  const simulations: Array<[string, string, LinkBudgetInput]> = [
    [
      "アンテナ利得を +3dB 改善",
      "送信側または受信側のアンテナ効率・配置を改善した想定です。",
      { ...input, txAntennaGainDbi: input.txAntennaGainDbi + 3 }
    ],
    [
      "ケーブル損失を 2dB 削減",
      "ケーブル長やコネクタ構成を見直し、失われる電力を減らす想定です。",
      { ...input, cableLossDb: Math.max(0, input.cableLossDb - cableReduction) }
    ],
    [
      "環境補正損失を 10dB 削減",
      "金属近接や筐体配置を見直し、追加損失を抑えた想定です。",
      { ...input, environmentLossDb: Math.max(0, input.environmentLossDb - 10) }
    ],
    [
      "距離を半分にする",
      "送受信点の距離を短くした場合の効果を確認します。",
      { ...input, distance: Math.max(input.distance / 2, 0.0001) }
    ],
    [
      "受信感度が 10dB 良いモジュールを使う",
      "より弱い電波まで受けられる通信モジュールを使う想定です。",
      { ...input, receiverSensitivityDbm: input.receiverSensitivityDbm - 10 }
    ]
  ];

  return simulations.map(([label, description, simulatedInput]) => {
    const result = calculateLinkBudget(simulatedInput);

    return {
      label,
      description,
      marginDb: result.linkMarginDb,
      deltaDb: result.linkMarginDb - currentMargin
    };
  });
}
