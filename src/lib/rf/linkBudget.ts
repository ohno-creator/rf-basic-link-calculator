import { calculateFsplDb } from "./fspl";
import { judgeLinkMargin, type LinkJudgement } from "./judgement";
import { calculatePropagationLoss, type AreaType } from "./propagation";

export type DistanceUnit = "m" | "km";

export type LinkType =
  | "cellular_base_station_to_iot_terminal"
  | "private_base_station_to_iot_terminal"
  | "gateway_to_low_height_terminal"
  | "terminal_to_terminal"
  | "custom";

export type CommunicationMode =
  | "high_base_station_to_iot_terminal"
  | "low_height_terminal_to_terminal"
  | "custom";

export type LinkPropagationModel =
  | "free_space"
  | "two_ray"
  | "log_distance"
  | "measured_correction"
  | "iot_hata_calibrated"
  | "okumura_hata"
  | "cost231_hata";

export type LinkBudgetInput = {
  system: string;
  linkType: LinkType;
  propagationModel: LinkPropagationModel;
  propagationArea: AreaType;
  pathLossExponent: number;
  iotCalibrationDistance: number;
  iotCalibrationDistanceUnit: DistanceUnit;
  iotMeasuredReceivedPowerDbm: number;
  iotSlopeCorrectionDbPerDecade: number;
  frequencyMHz: number;
  distance: number;
  distanceUnit: DistanceUnit;
  txPowerDbm: number;
  txAntennaGainDbi: number;
  rxAntennaGainDbi: number;
  txAntennaHeightM: number;
  rxAntennaHeightM: number;
  cableLossDb: number;
  environmentLossDb: number;
  groundProximityLossDb: number;
  enclosureLossDb: number;
  polarizationMismatchLossDb: number;
  vehicleBodyObstructionLossDb: number;
  installationMarginDb: number;
  calibrationOffsetDb: number;
  receiverSensitivityDbm: number;
};

export type PropagationWarning = {
  id: string;
  message: string;
};

export type LinkBudgetResult = {
  distanceKm: number;
  fsplDb: number;
  pathLossDb: number;
  propagationModelLabel: string;
  communicationMode: CommunicationMode;
  nearTerminalLossDb: number;
  iotCalibration: IotHataCalibrationResult | null;
  receivedPowerDbm: number;
  linkMarginDb: number;
  warnings: PropagationWarning[];
  judgement: LinkJudgement;
};

export type IotHataCalibrationResult = {
  anchorDistanceKm: number;
  measuredPathLossDb: number;
  referencePathLossDb: number;
  modelOffsetDb: number;
  slopeCorrectionDb: number;
  correctedReferenceModel: "Hata" | "COST231-Hata";
};

export type ValidationErrors = Partial<Record<keyof LinkBudgetInput, string>>;

// 初期表示はLoRa（920MHz LPWA）プリセットを既定にする。
// quickStartPresets の "lpwa-920" と同値（循環import回避のためここでは値を直書き）。
// 地上付近1kmのNLOS距離減衰は log_distance(n=3) で見込み、環境損失は端末ローカル分のみとする
// （free_space はNLOS損を含まず、環境損失で代替すると役割が曖昧になるため）。
export const defaultLinkBudgetInput: LinkBudgetInput = {
  system: "LoRa / LoRaWAN",
  linkType: "gateway_to_low_height_terminal",
  propagationModel: "log_distance",
  propagationArea: "urbanMedium",
  pathLossExponent: 3,
  iotCalibrationDistance: 1,
  iotCalibrationDistanceUnit: "km",
  iotMeasuredReceivedPowerDbm: -95,
  iotSlopeCorrectionDbPerDecade: 0,
  frequencyMHz: 920,
  distance: 1,
  distanceUnit: "km",
  txPowerDbm: 13,
  txAntennaGainDbi: 2, // ゲートウェイ側の現実的なアンテナ利得
  rxAntennaGainDbi: -6,
  txAntennaHeightM: 10,
  rxAntennaHeightM: 1.5,
  cableLossDb: 1,
  environmentLossDb: 3, // 端末ローカル損のみ（距離減衰は log_distance 側で計上）
  groundProximityLossDb: 0,
  enclosureLossDb: 0,
  polarizationMismatchLossDb: 0,
  vehicleBodyObstructionLossDb: 0,
  installationMarginDb: 0,
  calibrationOffsetDb: 0,
  receiverSensitivityDbm: -120
};

export function normalizeDistanceKm(distance: number, unit: DistanceUnit): number {
  if (unit === "m") {
    return distance / 1000;
  }

  return distance;
}

export function getCommunicationMode(linkType: LinkType): CommunicationMode {
  if (
    linkType === "cellular_base_station_to_iot_terminal" ||
    linkType === "private_base_station_to_iot_terminal"
  ) {
    return "high_base_station_to_iot_terminal";
  }

  if (linkType === "terminal_to_terminal" || linkType === "gateway_to_low_height_terminal") {
    return "low_height_terminal_to_terminal";
  }

  return "custom";
}

function isMissingNumber(value: number) {
  return !Number.isFinite(value);
}

function validateNonNegative(errors: ValidationErrors, key: keyof LinkBudgetInput, value: number, label: string) {
  if (isMissingNumber(value) || value < 0) {
    errors[key] = `${label}は0以上の値を入力してください。`;
  }
}

export function validateLinkBudgetInput(input: LinkBudgetInput): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!input.system.trim()) {
    errors.system = "通信方式を選択してください。";
  }

  if (!input.linkType) {
    errors.linkType = "通信形態を選択してください。";
  }

  if (!input.propagationModel) {
    errors.propagationModel = "伝搬モデルを選択してください。";
  }

  if (!["urbanLarge", "urbanMedium", "suburban", "open"].includes(input.propagationArea)) {
    errors.propagationArea = "奥村・秦モデルのエリア種別を選択してください。";
  }

  if (isMissingNumber(input.pathLossExponent) || input.pathLossExponent < 1 || input.pathLossExponent > 6) {
    errors.pathLossExponent = "Log-distanceの距離損失指数は1〜6の範囲で入力してください。";
  }

  if (isMissingNumber(input.iotCalibrationDistance) || input.iotCalibrationDistance <= 0) {
    errors.iotCalibrationDistance = "IoT実測アンカー距離は0より大きい値を入力してください。";
  }

  if (input.iotCalibrationDistanceUnit !== "m" && input.iotCalibrationDistanceUnit !== "km") {
    errors.iotCalibrationDistanceUnit = "IoT実測アンカー距離の単位を選択してください。";
  }

  if (isMissingNumber(input.iotMeasuredReceivedPowerDbm)) {
    errors.iotMeasuredReceivedPowerDbm = "IoT実測受信電力をdBmで入力してください。";
  }

  if (
    isMissingNumber(input.iotSlopeCorrectionDbPerDecade) ||
    input.iotSlopeCorrectionDbPerDecade < -40 ||
    input.iotSlopeCorrectionDbPerDecade > 40
  ) {
    errors.iotSlopeCorrectionDbPerDecade = "距離勾配補正は-40〜40dB/decadeの範囲で入力してください。";
  }

  if (isMissingNumber(input.frequencyMHz) || input.frequencyMHz <= 0) {
    errors.frequencyMHz = "周波数は0より大きい値をMHzで入力してください。";
  } else if (input.frequencyMHz > 1_000_000) {
    errors.frequencyMHz = "周波数が大きすぎます。MHz単位で入力してください。";
  }

  if (isMissingNumber(input.distance) || input.distance <= 0) {
    errors.distance = "通信距離は0より大きい値を入力してください。";
  } else if (normalizeDistanceKm(input.distance, input.distanceUnit) > 1_000_000) {
    errors.distance = "通信距離が大きすぎます。初期検討に適した範囲で入力してください。";
  }

  if (isMissingNumber(input.txPowerDbm)) {
    errors.txPowerDbm = "送信電力をdBmで入力してください。";
  }

  if (isMissingNumber(input.txAntennaGainDbi)) {
    errors.txAntennaGainDbi = "送信アンテナ利得をdBiで入力してください。";
  }

  if (isMissingNumber(input.rxAntennaGainDbi)) {
    errors.rxAntennaGainDbi = "受信アンテナ利得をdBiで入力してください。";
  }

  if (isMissingNumber(input.txAntennaHeightM) || input.txAntennaHeightM <= 0) {
    errors.txAntennaHeightM = "送信側アンテナ高は0より大きい値をmで入力してください。";
  }

  if (isMissingNumber(input.rxAntennaHeightM) || input.rxAntennaHeightM <= 0) {
    errors.rxAntennaHeightM = "受信側アンテナ高は0より大きい値をmで入力してください。";
  }

  validateNonNegative(errors, "cableLossDb", input.cableLossDb, "ケーブル・コネクタ損失");
  validateNonNegative(errors, "environmentLossDb", input.environmentLossDb, "環境損失");
  validateNonNegative(errors, "groundProximityLossDb", input.groundProximityLossDb, "地面近接損失");
  validateNonNegative(errors, "enclosureLossDb", input.enclosureLossDb, "筐体損失");
  validateNonNegative(
    errors,
    "polarizationMismatchLossDb",
    input.polarizationMismatchLossDb,
    "偏波ミスマッチ損失"
  );
  validateNonNegative(
    errors,
    "vehicleBodyObstructionLossDb",
    input.vehicleBodyObstructionLossDb,
    "車両・人体遮蔽損失"
  );
  validateNonNegative(errors, "installationMarginDb", input.installationMarginDb, "設置ばらつきマージン");

  if (isMissingNumber(input.calibrationOffsetDb)) {
    errors.calibrationOffsetDb = "実測補正値をdBで入力してください。未入力の場合は0dBにしてください。";
  }

  if (isMissingNumber(input.receiverSensitivityDbm)) {
    errors.receiverSensitivityDbm = "受信感度をdBmで入力してください。";
  }

  return errors;
}

export function hasValidationErrors(errors: ValidationErrors): boolean {
  return Object.keys(errors).length > 0;
}

export function calculateNearTerminalLossDb(input: Pick<
  LinkBudgetInput,
  | "groundProximityLossDb"
  | "enclosureLossDb"
  | "polarizationMismatchLossDb"
  | "vehicleBodyObstructionLossDb"
  | "installationMarginDb"
>): number {
  return (
    input.groundProximityLossDb +
    input.enclosureLossDb +
    input.polarizationMismatchLossDb +
    input.vehicleBodyObstructionLossDb +
    input.installationMarginDb
  );
}

function calculateTwoRayPathLossDb(
  frequencyMHz: number,
  distanceKm: number,
  txAntennaHeightM: number,
  rxAntennaHeightM: number
): number {
  const distanceM = distanceKm * 1000;
  const fsplDb = calculateFsplDb(frequencyMHz, distanceKm);
  const twoRayDb =
    40 * Math.log10(distanceM) -
    20 * Math.log10(txAntennaHeightM) -
    20 * Math.log10(rxAntennaHeightM);

  return Math.max(fsplDb, twoRayDb);
}

function calculateLogDistancePathLossDb(
  frequencyMHz: number,
  distanceKm: number,
  pathLossExponent: number
): number {
  const distanceM = distanceKm * 1000;
  const referenceDistanceM = 1;
  const referenceLossDb = calculateFsplDb(frequencyMHz, referenceDistanceM / 1000);

  return referenceLossDb + 10 * pathLossExponent * Math.log10(distanceM / referenceDistanceM);
}

function calculateTwoRayBreakpointM(frequencyMHz: number, txAntennaHeightM: number, rxAntennaHeightM: number) {
  const wavelengthM = 299_792_458 / (frequencyMHz * 1_000_000);
  return (4 * Math.PI * txAntennaHeightM * rxAntennaHeightM) / wavelengthM;
}

function getPropagationModelLabel(model: LinkPropagationModel): string {
  switch (model) {
    case "free_space":
      return "自由空間損失モデル";
    case "two_ray":
      return "2波モデル";
    case "log_distance":
      return "Log-distanceモデル";
    case "measured_correction":
      return "実測補正モデル";
    case "iot_hata_calibrated":
      return "IoT実測補正Hataモード";
    case "okumura_hata":
      return "奥村・秦モデル（参考）";
    case "cost231_hata":
      return "COST231-Hataモデル（参考）";
  }
}

function getLinkTypeLabel(linkType: LinkType): string {
  switch (linkType) {
    case "cellular_base_station_to_iot_terminal":
      return "携帯基地局 → IoT端末";
    case "private_base_station_to_iot_terminal":
      return "プライベート基地局 → IoT端末";
    case "gateway_to_low_height_terminal":
      return "ゲートウェイ → 低高度端末";
    case "terminal_to_terminal":
      return "低高度端末 ↔ 低高度端末";
    case "custom":
      return "カスタム";
  }
}

function getPropagationAreaLabel(area: AreaType): string {
  switch (area) {
    case "urbanLarge":
      return "市街地（大都市）";
    case "urbanMedium":
      return "市街地（中小都市）";
    case "suburban":
      return "郊外";
    case "open":
      return "開放地";
  }
}

function isHataFamily(model: LinkPropagationModel): boolean {
  return model === "okumura_hata" || model === "cost231_hata" || model === "iot_hata_calibrated";
}

function calculateHataReferenceLoss(input: LinkBudgetInput, distanceKm: number) {
  return calculatePropagationLoss({
    frequencyMHz: input.frequencyMHz,
    baseHeightM: input.txAntennaHeightM,
    mobileHeightM: input.rxAntennaHeightM,
    distanceKm,
    area: input.propagationArea,
    preferredModel:
      input.propagationModel === "okumura_hata"
        ? "Hata"
        : input.propagationModel === "cost231_hata"
          ? "COST231-Hata"
          : undefined
  });
}

function calculateMeasuredPathLossAtAnchorDb(input: LinkBudgetInput) {
  return (
    input.txPowerDbm +
    input.txAntennaGainDbi +
    input.rxAntennaGainDbi -
    input.cableLossDb -
    input.environmentLossDb -
    calculateNearTerminalLossDb(input) -
    input.iotMeasuredReceivedPowerDbm
  );
}

function calculateIotHataCalibratedPathLoss(
  input: LinkBudgetInput,
  distanceKm: number
): { pathLossDb: number; iotCalibration: IotHataCalibrationResult } {
  const anchorDistanceKm = normalizeDistanceKm(
    input.iotCalibrationDistance,
    input.iotCalibrationDistanceUnit
  );
  const currentReference = calculateHataReferenceLoss(input, distanceKm);
  const anchorReference = calculateHataReferenceLoss(input, anchorDistanceKm);
  const measuredPathLossDb = calculateMeasuredPathLossAtAnchorDb(input);
  const modelOffsetDb = measuredPathLossDb - anchorReference.pathLossDb;
  const slopeCorrectionDb = input.iotSlopeCorrectionDbPerDecade * Math.log10(distanceKm / anchorDistanceKm);

  return {
    pathLossDb: currentReference.pathLossDb + modelOffsetDb + slopeCorrectionDb,
    iotCalibration: {
      anchorDistanceKm,
      measuredPathLossDb,
      referencePathLossDb: anchorReference.pathLossDb,
      modelOffsetDb,
      slopeCorrectionDb,
      correctedReferenceModel: anchorReference.model
    }
  };
}

function calculatePathLoss(
  input: LinkBudgetInput,
  distanceKm: number,
  fsplDb: number
): { pathLossDb: number; propagationModelLabel: string; iotCalibration: IotHataCalibrationResult | null } {
  if (input.propagationModel === "two_ray") {
    return {
      pathLossDb: calculateTwoRayPathLossDb(
        input.frequencyMHz,
        distanceKm,
        input.txAntennaHeightM,
        input.rxAntennaHeightM
      ),
      propagationModelLabel: getPropagationModelLabel(input.propagationModel),
      iotCalibration: null
    };
  }

  if (input.propagationModel === "log_distance") {
    return {
      pathLossDb: calculateLogDistancePathLossDb(
        input.frequencyMHz,
        distanceKm,
        input.pathLossExponent
      ),
      propagationModelLabel: getPropagationModelLabel(input.propagationModel),
      iotCalibration: null
    };
  }

  if (input.propagationModel === "iot_hata_calibrated") {
    const calibrated = calculateIotHataCalibratedPathLoss(input, distanceKm);

    return {
      pathLossDb: calibrated.pathLossDb,
      propagationModelLabel: getPropagationModelLabel(input.propagationModel),
      iotCalibration: calibrated.iotCalibration
    };
  }

  if (input.propagationModel === "okumura_hata" || input.propagationModel === "cost231_hata") {
    const propagation = calculateHataReferenceLoss(input, distanceKm);

    return {
      pathLossDb: propagation.pathLossDb,
      propagationModelLabel: getPropagationModelLabel(input.propagationModel),
      iotCalibration: null
    };
  }

  return {
    pathLossDb: fsplDb,
    propagationModelLabel: getPropagationModelLabel(input.propagationModel),
    iotCalibration: null
  };
}

function isHataRangeOutside(input: LinkBudgetInput, distanceKm: number): boolean {
  if (
    input.propagationModel === "okumura_hata" ||
    (input.propagationModel === "iot_hata_calibrated" && input.frequencyMHz < 1500)
  ) {
    return (
      input.frequencyMHz < 150 ||
      input.frequencyMHz > 1500 ||
      distanceKm < 1 ||
      distanceKm > 20 ||
      input.txAntennaHeightM < 30 ||
      input.txAntennaHeightM > 200 ||
      input.rxAntennaHeightM < 1 ||
      input.rxAntennaHeightM > 10
    );
  }

  if (
    input.propagationModel === "cost231_hata" ||
    (input.propagationModel === "iot_hata_calibrated" && input.frequencyMHz >= 1500)
  ) {
    return (
      input.frequencyMHz < 1500 ||
      input.frequencyMHz > 2000 ||
      distanceKm < 1 ||
      distanceKm > 20 ||
      input.txAntennaHeightM < 30 ||
      input.txAntennaHeightM > 200 ||
      input.rxAntennaHeightM < 1 ||
      input.rxAntennaHeightM > 10
    );
  }

  return false;
}

function buildPropagationWarnings(input: LinkBudgetInput, distanceKm: number): PropagationWarning[] {
  const warnings: PropagationWarning[] = [];
  const communicationMode = getCommunicationMode(input.linkType);
  const distanceM = distanceKm * 1000;
  const nearTerminalLossDb = calculateNearTerminalLossDb(input);

  if (isHataFamily(input.propagationModel) && isHataRangeOutside(input, distanceKm)) {
    warnings.push({
      id: "hata-out-of-range",
      message:
        "注意：奥村・秦モデルは、主に高所基地局と移動局間の広域セルラー通信を想定した経験式です。現在の入力条件は、モデルの一般的な適用範囲外です。計算結果は参考値として扱い、通信可否判定にはリンクバジェット、端末近傍損失、実測補正を併用してください。"
    });
  }

  if (input.propagationModel === "iot_hata_calibrated") {
    const anchorDistanceKm = normalizeDistanceKm(
      input.iotCalibrationDistance,
      input.iotCalibrationDistanceUnit
    );
    const extrapolationRatio = Math.max(distanceKm, anchorDistanceKm) / Math.min(distanceKm, anchorDistanceKm);
    const calibration = calculateIotHataCalibratedPathLoss(input, distanceKm).iotCalibration;

    warnings.push({
      id: "iot-hata-calibrated-basis",
      message:
        "IoT実測補正Hataモードは、奥村・秦/COST231-Hataの中央値損失を基準に、現地のRSSIまたはRSRP実測値からモデルオフセットを校正するモードです。近年のLPWA/NB-IoT測定研究では、固定の経験式だけでなく、現地測定によるオフセット、距離勾配、環境特徴量の補正が重要であることが示されています。"
    });

    if (Math.abs(calibration.modelOffsetDb) >= 25) {
      warnings.push({
        id: "iot-hata-large-offset",
        message: `実測から推定したHata補正量が${calibration.modelOffsetDb.toFixed(
          1
        )}dBです。25dB以上の差は、周波数・距離・アンテナ高・送信電力・アンテナ利得・端末近傍損失の入力違い、またはHataモデルの適用外条件を疑ってください。`
      });
    }

    if (extrapolationRatio >= 10) {
      warnings.push({
        id: "iot-hata-anchor-extrapolation",
        message:
          "実測アンカー距離と現在の通信距離が10倍以上離れています。1点補正はアンカー近傍では有効ですが、遠い距離への外挿では距離勾配補正や複数地点の実測確認を推奨します。"
      });
    }

    if (input.calibrationOffsetDb !== 0) {
      warnings.push({
        id: "iot-hata-double-calibration",
        message:
          "IoT実測補正Hataモードに加えて、実測補正値も入力されています。意図した追加補正であれば問題ありませんが、同じ測定差分を二重に入れていないか確認してください。"
      });
    }
  }

  if (
    isHataFamily(input.propagationModel) &&
    input.txAntennaHeightM >= 30 &&
    input.txAntennaHeightM <= 200 &&
    input.rxAntennaHeightM <= 1.5
  ) {
    warnings.push({
      id: "low-terminal-near-base",
      message:
        "基地局側の条件は奥村・秦モデルの前提に近いですが、端末側アンテナが地上近傍にあるため、端末近傍損失を別途加算する必要があります。地面反射、フレネルゾーン欠損、筐体損失、車両・人体遮蔽、設置方向の影響を考慮してください。"
    });
  }

  if (isHataFamily(input.propagationModel) && communicationMode === "low_height_terminal_to_terminal") {
    warnings.push({
      id: "low-terminal-hata",
      message:
        "注意：低高度端末同士の通信では、奥村・秦モデルの使用は推奨されません。この通信形態では、自由空間損失、2波モデル、Log-distanceモデル、実測補正モデルを主モデルとして使用してください。"
    });
  }

  if (
    input.propagationModel === "free_space" &&
    communicationMode === "low_height_terminal_to_terminal" &&
    (input.txAntennaHeightM <= 2 || input.rxAntennaHeightM <= 2 || nearTerminalLossDb === 0)
  ) {
    warnings.push({
      id: "free-space-low-height",
      message:
        "自由空間損失モデルは、障害物や地面反射を含まない見通し条件の基準値です。低高度端末では、地面反射、フレネルゾーン欠損、筐体、人体・車両遮蔽の影響を端末近傍損失や環境損失として別途加算してください。"
    });
  }

  if (input.propagationModel === "two_ray") {
    const breakpointM = calculateTwoRayBreakpointM(
      input.frequencyMHz,
      input.txAntennaHeightM,
      input.rxAntennaHeightM
    );

    if (distanceM < breakpointM) {
      warnings.push({
        id: "two-ray-before-breakpoint",
        message: `2波モデルの遠方近似は、概ねブレークポイント以遠で使う参考式です。現在の通信距離は約${distanceM.toFixed(
          1
        )}m、ブレークポイント目安は約${breakpointM.toFixed(
          1
        )}mです。この範囲では自由空間損失に近い結果として扱い、反射による深い落ち込みは実測または端末近傍損失で確認してください。`
      });
    }
  }

  if (input.propagationModel === "log_distance") {
    warnings.push({
      id: "log-distance-exponent",
      message: `Log-distanceモデルは、距離損失指数を現地環境に合わせる経験モデルです。現在は n=${input.pathLossExponent.toFixed(
        1
      )} として計算しています。屋内、屋外、遮蔽物、アンテナ高により最適値は変わるため、RSSIまたはRSRP実測で指数や実測補正値を調整してください。`
    });
  }

  if (input.propagationModel === "measured_correction" && input.calibrationOffsetDb === 0) {
    warnings.push({
      id: "measured-model-without-calibration",
      message:
        "実測補正モデルを選択していますが、実測補正値が0dBです。このモデルでは現地で取得したRSSIまたはRSRPと計算値の差分を入力して評価することを前提にしてください。"
    });
  }

  if (input.calibrationOffsetDb === 0 && input.propagationModel !== "iot_hata_calibrated") {
    warnings.push({
      id: "missing-calibration",
      message:
        "実測補正が入力されていません。低高度IoT通信では設置環境によるばらつきが大きいため、現地で取得したRSSIまたはRSRPを入力して補正することを推奨します。"
    });
  }

  return warnings;
}

export function calculateReceivedPowerDbm(input: {
  txPowerDbm: number;
  txAntennaGainDbi: number;
  rxAntennaGainDbi: number;
  pathLossDb: number;
  cableLossDb: number;
  environmentLossDb: number;
  nearTerminalLossDb: number;
  calibrationOffsetDb: number;
}): number {
  return (
    input.txPowerDbm +
    input.txAntennaGainDbi +
    input.rxAntennaGainDbi -
    input.pathLossDb -
    input.cableLossDb -
    input.environmentLossDb -
    input.nearTerminalLossDb +
    input.calibrationOffsetDb
  );
}

export function calculateLinkMarginDb(
  receivedPowerDbm: number,
  receiverSensitivityDbm: number
): number {
  if (!Number.isFinite(receivedPowerDbm) || !Number.isFinite(receiverSensitivityDbm)) {
    throw new Error("受信電力または受信感度を計算できません。");
  }

  return receivedPowerDbm - receiverSensitivityDbm;
}

export function calculateLinkBudget(input: LinkBudgetInput): LinkBudgetResult {
  const errors = validateLinkBudgetInput(input);
  if (hasValidationErrors(errors)) {
    throw new Error(Object.values(errors)[0]);
  }

  const distanceKm = normalizeDistanceKm(input.distance, input.distanceUnit);
  const fsplDb = calculateFsplDb(input.frequencyMHz, distanceKm);
  const { pathLossDb, propagationModelLabel, iotCalibration } = calculatePathLoss(input, distanceKm, fsplDb);
  const nearTerminalLossDb = calculateNearTerminalLossDb(input);
  const receivedPowerDbm = calculateReceivedPowerDbm({
    txPowerDbm: input.txPowerDbm,
    txAntennaGainDbi: input.txAntennaGainDbi,
    rxAntennaGainDbi: input.rxAntennaGainDbi,
    pathLossDb,
    cableLossDb: input.cableLossDb,
    environmentLossDb: input.environmentLossDb,
    nearTerminalLossDb,
    calibrationOffsetDb: input.calibrationOffsetDb
  });
  const linkMarginDb = calculateLinkMarginDb(
    receivedPowerDbm,
    input.receiverSensitivityDbm
  );

  return {
    distanceKm,
    fsplDb,
    pathLossDb,
    propagationModelLabel,
    communicationMode: getCommunicationMode(input.linkType),
    nearTerminalLossDb,
    iotCalibration,
    receivedPowerDbm,
    linkMarginDb,
    warnings: buildPropagationWarnings(input, distanceKm),
    judgement: judgeLinkMargin(linkMarginDb)
  };
}

export function buildConsultationText(input: LinkBudgetInput, result: LinkBudgetResult): string {
  const modelSpecificLines = [
    isHataFamily(input.propagationModel)
      ? `Hataエリア種別：${getPropagationAreaLabel(input.propagationArea)}`
      : null,
    input.propagationModel === "log_distance"
      ? `距離損失指数：${input.pathLossExponent}`
      : null,
    input.propagationModel === "iot_hata_calibrated"
      ? `IoT実測アンカー距離：${input.iotCalibrationDistance} ${input.iotCalibrationDistanceUnit}
IoT実測受信電力：${input.iotMeasuredReceivedPowerDbm} dBm
IoT距離勾配補正：${input.iotSlopeCorrectionDbPerDecade} dB/decade`
      : null
  ]
    .filter(Boolean)
    .join("\n");

  return `通信距離・リンクバジェット簡易診断を行ったところ、以下の条件となりました。
アンテナ選定および実機評価について相談したく、ご連絡いたしました。

通信方式：${input.system}
通信形態：${getLinkTypeLabel(input.linkType)}
伝搬モデル：${result.propagationModelLabel}
${modelSpecificLines ? `${modelSpecificLines}\n` : ""}周波数：${input.frequencyMHz} MHz
通信距離：${input.distance} ${input.distanceUnit}
送信電力：${input.txPowerDbm} dBm
送信アンテナ利得：${input.txAntennaGainDbi} dBi
受信アンテナ利得：${input.rxAntennaGainDbi} dBi
送信側アンテナ高：${input.txAntennaHeightM} m
受信側アンテナ高：${input.rxAntennaHeightM} m
伝搬損失：${result.pathLossDb.toFixed(1)} dB
ケーブル損失：${input.cableLossDb} dB
環境損失：${input.environmentLossDb} dB
端末近傍損失：${result.nearTerminalLossDb.toFixed(1)} dB
実測補正値：${input.calibrationOffsetDb} dB
受信感度：${input.receiverSensitivityDbm} dBm
受信電力：${result.receivedPowerDbm.toFixed(1)} dBm
リンクマージン：${result.linkMarginDb.toFixed(1)} dB
判定結果：${result.judgement.label}
相談したい内容：`;
}
