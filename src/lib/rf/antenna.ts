import { calculateFsplDb } from "./fspl";
import { calculateWavelengthFromMHz, SPEED_OF_LIGHT_M_PER_S } from "./frequency";

const DBI_TO_DBD_OFFSET = 2.15;
const MU_0 = 4 * Math.PI * 1e-7;

function assertPositiveFinite(value: number, label: string) {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${label}は0より大きい数値を入力してください。`);
  }
}

function assertPercent(value: number, label: string) {
  if (!Number.isFinite(value) || value <= 0 || value > 100) {
    throw new Error(`${label}は0より大きく100以下の値を入力してください。`);
  }
}

export function dbiToLinear(dbi: number): number {
  if (!Number.isFinite(dbi)) {
    throw new Error("dBiは数値で入力してください。");
  }
  return 10 ** (dbi / 10);
}

export function linearToDbi(linear: number): number {
  assertPositiveFinite(linear, "倍率");
  return 10 * Math.log10(linear);
}

export function dbiToDbd(dbi: number): number {
  if (!Number.isFinite(dbi)) {
    throw new Error("dBiは数値で入力してください。");
  }
  return dbi - DBI_TO_DBD_OFFSET;
}

export function dbdToDbi(dbd: number): number {
  if (!Number.isFinite(dbd)) {
    throw new Error("dBdは数値で入力してください。");
  }
  return dbd + DBI_TO_DBD_OFFSET;
}

export function dbmToW(dbm: number): number {
  if (!Number.isFinite(dbm)) {
    throw new Error("dBmは数値で入力してください。");
  }
  return 10 ** ((dbm - 30) / 10);
}

export function wToDbm(watts: number): number {
  assertPositiveFinite(watts, "W");
  return 10 * Math.log10(watts) + 30;
}

export function calculateEirp(input: {
  txPowerDbm: number;
  antennaGainDbi: number;
  cableLossDb: number;
  extraLossDb?: number;
}) {
  const extraLossDb = input.extraLossDb ?? 0;
  if (![input.txPowerDbm, input.antennaGainDbi, input.cableLossDb, extraLossDb].every(Number.isFinite)) {
    throw new Error("EIRP計算の入力は数値で入力してください。");
  }
  const eirpDbm = input.txPowerDbm + input.antennaGainDbi - input.cableLossDb - extraLossDb;
  const erpDbm = eirpDbm - DBI_TO_DBD_OFFSET;
  return {
    eirpDbm,
    eirpW: dbmToW(eirpDbm),
    erpDbm,
    erpW: dbmToW(erpDbm),
    antennaInputDbm: input.txPowerDbm - input.cableLossDb - extraLossDb
  };
}

export function calculateAntennaLengths(frequencyMHz: number, velocityFactorPercent: number) {
  assertPositiveFinite(frequencyMHz, "周波数");
  assertPercent(velocityFactorPercent, "短縮率");
  const wavelengthM = calculateWavelengthFromMHz(frequencyMHz);
  const velocityFactor = velocityFactorPercent / 100;
  const electrical = {
    eighthM: wavelengthM / 8,
    quarterM: wavelengthM / 4,
    halfM: wavelengthM / 2,
    fiveEighthM: (wavelengthM * 5) / 8
  };
  return {
    wavelengthM,
    velocityFactor,
    physical: {
      eighthM: electrical.eighthM * velocityFactor,
      quarterM: electrical.quarterM * velocityFactor,
      halfM: electrical.halfM * velocityFactor,
      fiveEighthM: electrical.fiveEighthM * velocityFactor
    },
    electrical
  };
}

export function calculateEffectiveAperture(frequencyMHz: number, gainDbi: number) {
  const wavelengthM = calculateWavelengthFromMHz(frequencyMHz);
  const gainLinear = dbiToLinear(gainDbi);
  const areaM2 = (wavelengthM ** 2 * gainLinear) / (4 * Math.PI);
  return {
    wavelengthM,
    gainLinear,
    areaM2,
    areaCm2: areaM2 * 10_000,
    squareSideM: Math.sqrt(areaM2),
    isotropicAreaM2: wavelengthM ** 2 / (4 * Math.PI)
  };
}

export function calculateApertureAntenna(input: {
  frequencyMHz: number;
  diameterM: number;
  efficiencyPercent: number;
}) {
  const wavelengthM = calculateWavelengthFromMHz(input.frequencyMHz);
  assertPositiveFinite(input.diameterM, "開口径");
  assertPercent(input.efficiencyPercent, "開口効率");
  const efficiency = input.efficiencyPercent / 100;
  const areaM2 = Math.PI * (input.diameterM / 2) ** 2;
  const gainLinear = efficiency * (Math.PI * input.diameterM / wavelengthM) ** 2;
  const hpbwDeg = 70 * (wavelengthM / input.diameterM);
  const firstNullDeg = 140 * (wavelengthM / input.diameterM);
  return {
    wavelengthM,
    areaM2,
    gainLinear,
    gainDbi: linearToDbi(gainLinear),
    hpbwDeg,
    firstNullDeg,
    fraunhoferM: (2 * input.diameterM ** 2) / wavelengthM
  };
}

export function calculateAntennaSpacing(frequencyMHz: number, spacingM: number) {
  const wavelengthM = calculateWavelengthFromMHz(frequencyMHz);
  assertPositiveFinite(spacingM, "アンテナ間隔");
  const spacingLambda = spacingM / wavelengthM;
  return {
    wavelengthM,
    spacingLambda,
    phaseDeg: spacingLambda * 360,
    halfWaveM: wavelengthM / 2,
    quarterWaveM: wavelengthM / 4
  };
}

export function calculateGratingLobes(input: {
  frequencyMHz: number;
  spacingM: number;
  scanAngleDeg: number;
}) {
  const base = calculateAntennaSpacing(input.frequencyMHz, input.spacingM);
  if (!Number.isFinite(input.scanAngleDeg) || Math.abs(input.scanAngleDeg) >= 90) {
    throw new Error("走査角は-90度より大きく90度より小さい値で入力してください。");
  }
  const scanSin = Math.sin((input.scanAngleDeg * Math.PI) / 180);
  const limitLambda = 1 / (1 + Math.abs(scanSin));
  const lobes = [-3, -2, -1, 1, 2, 3]
    .map((m) => {
      const candidate = scanSin + m / base.spacingLambda;
      if (candidate < -1 || candidate > 1) {
        return null;
      }
      return {
        order: m,
        angleDeg: (Math.asin(candidate) * 180) / Math.PI
      };
    })
    .filter((lobe): lobe is { order: number; angleDeg: number } => Boolean(lobe));

  return {
    ...base,
    scanAngleDeg: input.scanAngleDeg,
    limitLambda,
    limitM: limitLambda * base.wavelengthM,
    hasVisibleGratingLobe: lobes.length > 0,
    lobes
  };
}

export function calculatePatchAntenna(input: {
  frequencyMHz: number;
  dielectricConstant: number;
  substrateHeightMm: number;
}) {
  assertPositiveFinite(input.frequencyMHz, "周波数");
  if (!Number.isFinite(input.dielectricConstant) || input.dielectricConstant <= 1) {
    throw new Error("比誘電率は1より大きい値を入力してください。");
  }
  assertPositiveFinite(input.substrateHeightMm, "基板厚");
  const frequencyHz = input.frequencyMHz * 1_000_000;
  const hM = input.substrateHeightMm / 1000;
  const er = input.dielectricConstant;
  const widthM = (SPEED_OF_LIGHT_M_PER_S / (2 * frequencyHz)) * Math.sqrt(2 / (er + 1));
  const effectiveEr = (er + 1) / 2 + ((er - 1) / 2) * (1 / Math.sqrt(1 + (12 * hM) / widthM));
  const wh = widthM / hM;
  const deltaLOverH =
    0.412 *
    ((effectiveEr + 0.3) * (wh + 0.264)) /
    ((effectiveEr - 0.258) * (wh + 0.8));
  const deltaLM = deltaLOverH * hM;
  const effectiveLengthM = SPEED_OF_LIGHT_M_PER_S / (2 * frequencyHz * Math.sqrt(effectiveEr));
  const lengthM = effectiveLengthM - 2 * deltaLM;
  return {
    wavelengthM: calculateWavelengthFromMHz(input.frequencyMHz),
    widthM,
    lengthM,
    effectiveLengthM,
    deltaLM,
    effectiveEr,
    widthToHeight: wh,
    substrateHeightM: hM
  };
}

export function calculateSmallLoop(input: {
  frequencyMHz: number;
  loopDiameterMm: number;
  wireDiameterMm: number;
  turns: number;
}) {
  assertPositiveFinite(input.frequencyMHz, "周波数");
  assertPositiveFinite(input.loopDiameterMm, "ループ径");
  assertPositiveFinite(input.wireDiameterMm, "線径");
  assertPositiveFinite(input.turns, "巻数");
  const radiusM = input.loopDiameterMm / 2000;
  const wireRadiusM = input.wireDiameterMm / 2000;
  if (wireRadiusM >= radiusM) {
    throw new Error("線径はループ径より小さくしてください。");
  }
  const turns = Math.max(1, input.turns);
  const inductanceH = MU_0 * turns ** 2 * radiusM * (Math.log((8 * radiusM) / wireRadiusM) - 2);
  const frequencyHz = input.frequencyMHz * 1_000_000;
  const capacitanceF = 1 / ((2 * Math.PI * frequencyHz) ** 2 * inductanceH);
  const circumferenceM = 2 * Math.PI * radiusM;
  const wavelengthM = calculateWavelengthFromMHz(input.frequencyMHz);
  return {
    radiusM,
    circumferenceM,
    circumferenceLambda: circumferenceM / wavelengthM,
    inductanceH,
    capacitanceF,
    reactanceOhm: 2 * Math.PI * frequencyHz * inductanceH,
    wavelengthM
  };
}

export type ShortAntennaKind = "monopole" | "dipole";

export function calculateRadiationResistance(input: {
  frequencyMHz: number;
  lengthMm: number;
  lossResistanceOhm: number;
  kind: ShortAntennaKind;
}) {
  const wavelengthM = calculateWavelengthFromMHz(input.frequencyMHz);
  assertPositiveFinite(input.lengthMm, "アンテナ長");
  if (!Number.isFinite(input.lossResistanceOhm) || input.lossResistanceOhm < 0) {
    throw new Error("損失抵抗は0以上の値を入力してください。");
  }
  const lengthM = input.lengthMm / 1000;
  const lengthRatio = lengthM / wavelengthM;
  const radiationResistanceOhm =
    input.kind === "monopole"
      ? 40 * Math.PI ** 2 * lengthRatio ** 2
      : 20 * Math.PI ** 2 * lengthRatio ** 2;
  const efficiency = radiationResistanceOhm / (radiationResistanceOhm + input.lossResistanceOhm);
  return {
    wavelengthM,
    lengthM,
    lengthRatio,
    radiationResistanceOhm,
    efficiency,
    efficiencyPercent: efficiency * 100,
    efficiencyDb: 10 * Math.log10(efficiency)
  };
}

export function calculateSmallAntennaLimit(input: {
  frequencyMHz: number;
  radiusMm: number;
  targetBandwidthPercent: number;
}) {
  const wavelengthM = calculateWavelengthFromMHz(input.frequencyMHz);
  assertPositiveFinite(input.radiusMm, "外接球半径");
  assertPositiveFinite(input.targetBandwidthPercent, "目標比帯域");
  const radiusM = input.radiusMm / 1000;
  const ka = (2 * Math.PI * radiusM) / wavelengthM;
  const chuQ = 1 / ka ** 3 + 1 / ka;
  const maxFractionalBandwidthPercent = 100 / chuQ;
  return {
    wavelengthM,
    radiusM,
    ka,
    chuQ,
    maxFractionalBandwidthPercent,
    targetToLimitRatio: input.targetBandwidthPercent / maxFractionalBandwidthPercent
  };
}

export function calculateLargeArrayNearField(input: {
  frequencyMHz: number;
  apertureSizeM: number;
  distanceM: number;
}) {
  const wavelengthM = calculateWavelengthFromMHz(input.frequencyMHz);
  assertPositiveFinite(input.apertureSizeM, "アレイ開口");
  assertPositiveFinite(input.distanceM, "評価距離");
  const fraunhoferM = (2 * input.apertureSizeM ** 2) / wavelengthM;
  const reactiveNearFieldM = 0.62 * Math.sqrt(input.apertureSizeM ** 3 / wavelengthM);
  const pathSagM = Math.sqrt(input.distanceM ** 2 + (input.apertureSizeM / 2) ** 2) - input.distanceM;
  return {
    wavelengthM,
    fraunhoferM,
    reactiveNearFieldM,
    fresnelNumber: input.apertureSizeM ** 2 / (wavelengthM * input.distanceM),
    pathSagM,
    pathSagWavelengths: pathSagM / wavelengthM,
    isRadiatingNearField: input.distanceM < fraunhoferM
  };
}

export function calculateReflectorRisEffect(input: {
  frequencyMHz: number;
  widthM: number;
  heightM: number;
  txDistanceM: number;
  rxDistanceM: number;
  efficiencyPercent: number;
}) {
  assertPositiveFinite(input.widthM, "反射面幅");
  assertPositiveFinite(input.heightM, "反射面高さ");
  assertPositiveFinite(input.txDistanceM, "送信側距離");
  assertPositiveFinite(input.rxDistanceM, "受信側距離");
  assertPercent(input.efficiencyPercent, "開口効率");
  const wavelengthM = calculateWavelengthFromMHz(input.frequencyMHz);
  const areaM2 = input.widthM * input.heightM;
  const efficiency = input.efficiencyPercent / 100;
  const equivalentDiameterM = Math.sqrt((4 * areaM2) / Math.PI);
  const apertureGainDbi = linearToDbi((4 * Math.PI * areaM2 * efficiency) / wavelengthM ** 2);
  // 受動開口の利得[dBi]を、入射波の捕捉と受信方向への再放射の2段に適用する。
  const twoHopLossUpperBoundDb =
    calculateFsplDb(input.frequencyMHz, input.txDistanceM / 1000) +
    calculateFsplDb(input.frequencyMHz, input.rxDistanceM / 1000) -
    2 * apertureGainDbi;
  const directLossDb = calculateFsplDb(
    input.frequencyMHz,
    (input.txDistanceM + input.rxDistanceM) / 1000
  );
  return {
    wavelengthM,
    areaM2,
    equivalentDiameterM,
    apertureGainDbi,
    fraunhoferM: (2 * equivalentDiameterM ** 2) / wavelengthM,
    twoHopLossUpperBoundDb,
    directLossDb,
    excessVsDirectDb: twoHopLossUpperBoundDb - directLossDb,
    fresnelNumberTx: equivalentDiameterM ** 2 / (wavelengthM * input.txDistanceM),
    fresnelNumberRx: equivalentDiameterM ** 2 / (wavelengthM * input.rxDistanceM)
  };
}
