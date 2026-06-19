import type { LinkBudgetInput } from "@/lib/rf/linkBudget";

export type QuickStartPreset = {
  id: string;
  label: string;
  system: string;
  frequencyLabel: string;
  distanceLabel: string;
  difficulty: string;
  description: string;
  input: LinkBudgetInput;
};

export const quickStartPresets: QuickStartPreset[] = [
  {
    id: "lpwa-920",
    label: "IoT・LPWA向け",
    system: "LoRa / Wi-SUN / LPWA",
    frequencyLabel: "920MHz",
    distanceLabel: "1km",
    difficulty: "金属近接では余裕が小さく要注意",
    description:
      "920MHz帯のセンサー端末を想定したサンプルです。長距離・低データ量のIoT用途で、金属近接（環境補正20dB）の条件を含みます。",
    input: {
      system: "LoRa / LoRaWAN",
      linkType: "gateway_to_low_height_terminal",
      propagationModel: "free_space",
      pathLossExponent: 3,
      frequencyMHz: 920,
      distance: 1,
      distanceUnit: "km",
      txPowerDbm: 13,
      txAntennaGainDbi: -6,
      rxAntennaGainDbi: -6,
      txAntennaHeightM: 10,
      rxAntennaHeightM: 1.5,
      cableLossDb: 1,
      environmentLossDb: 20,
      groundProximityLossDb: 0,
      enclosureLossDb: 0,
      polarizationMismatchLossDb: 0,
      vehicleBodyObstructionLossDb: 0,
      installationMarginDb: 0,
      calibrationOffsetDb: 0,
      receiverSensitivityDbm: -120
    }
  },
  {
    id: "ble-near",
    label: "BLE・近距離向け",
    system: "BLE",
    frequencyLabel: "2.4GHz",
    distanceLabel: "10m",
    difficulty: "近距離向け",
    description: "BLEセンサーやスマホ連携機器を想定したサンプルです。",
    input: {
      system: "BLE",
      linkType: "terminal_to_terminal",
      propagationModel: "two_ray",
      pathLossExponent: 3,
      frequencyMHz: 2400,
      distance: 10,
      distanceUnit: "m",
      txPowerDbm: 0,
      txAntennaGainDbi: 0,
      rxAntennaGainDbi: 0,
      txAntennaHeightM: 1.2,
      rxAntennaHeightM: 1.2,
      cableLossDb: 0,
      environmentLossDb: 10,
      groundProximityLossDb: 0,
      enclosureLossDb: 0,
      polarizationMismatchLossDb: 0,
      vehicleBodyObstructionLossDb: 0,
      installationMarginDb: 0,
      calibrationOffsetDb: 0,
      receiverSensitivityDbm: -90
    }
  },
  {
    id: "wifi-indoor",
    label: "Wi-Fi・屋内向け",
    system: "Wi-Fi",
    frequencyLabel: "2.4GHz",
    distanceLabel: "30m",
    difficulty: "屋内条件の影響を受けやすい",
    description: "屋内Wi-Fi機器を想定したサンプルです。",
    input: {
      system: "Wi-Fi",
      linkType: "gateway_to_low_height_terminal",
      propagationModel: "log_distance",
      pathLossExponent: 3,
      frequencyMHz: 2400,
      distance: 30,
      distanceUnit: "m",
      txPowerDbm: 15,
      txAntennaGainDbi: 2,
      rxAntennaGainDbi: 2,
      txAntennaHeightM: 2.5,
      rxAntennaHeightM: 1.2,
      cableLossDb: 1,
      environmentLossDb: 10,
      groundProximityLossDb: 0,
      enclosureLossDb: 0,
      polarizationMismatchLossDb: 0,
      vehicleBodyObstructionLossDb: 0,
      installationMarginDb: 0,
      calibrationOffsetDb: 0,
      receiverSensitivityDbm: -75
    }
  },
  {
    id: "lte-m-embedded",
    label: "LTE-M・内蔵アンテナ向け",
    system: "LTE-M / NB-IoT",
    frequencyLabel: "800MHz",
    distanceLabel: "1km",
    difficulty: "筐体・GND条件の確認が重要",
    description:
      "LTE-Mモジュールと内蔵アンテナを使うIoT機器を想定したサンプルです。筐体やGND条件により性能が変動しやすい例です。",
    input: {
      system: "LTE-M / NB-IoT",
      linkType: "cellular_base_station_to_iot_terminal",
      propagationModel: "okumura_hata",
      pathLossExponent: 3,
      frequencyMHz: 800,
      distance: 1,
      distanceUnit: "km",
      txPowerDbm: 23,
      txAntennaGainDbi: -2,
      rxAntennaGainDbi: 0,
      txAntennaHeightM: 30,
      rxAntennaHeightM: 1.5,
      cableLossDb: 0.5,
      environmentLossDb: 10,
      groundProximityLossDb: 0,
      enclosureLossDb: 0,
      polarizationMismatchLossDb: 0,
      vehicleBodyObstructionLossDb: 0,
      installationMarginDb: 0,
      calibrationOffsetDb: 0,
      receiverSensitivityDbm: -105
    }
  },
  {
    id: "metal-bad-example",
    label: "悪い例・要注意",
    system: "BLE / Wi-Fi",
    frequencyLabel: "2.4GHz",
    distanceLabel: "30m",
    difficulty: "リンクマージンが小さくなりやすい",
    description:
      "金属近接や筐体内蔵の影響で、リンクマージンが小さくなりやすい例です。アンテナ配置や筐体条件の重要性を理解するためのサンプルです。",
    input: {
      system: "BLE",
      linkType: "terminal_to_terminal",
      propagationModel: "two_ray",
      pathLossExponent: 3,
      frequencyMHz: 2400,
      distance: 30,
      distanceUnit: "m",
      txPowerDbm: 0,
      txAntennaGainDbi: -3,
      rxAntennaGainDbi: 0,
      txAntennaHeightM: 0.8,
      rxAntennaHeightM: 0.8,
      cableLossDb: 0,
      environmentLossDb: 20,
      groundProximityLossDb: 0,
      enclosureLossDb: 0,
      polarizationMismatchLossDb: 0,
      vehicleBodyObstructionLossDb: 0,
      installationMarginDb: 0,
      calibrationOffsetDb: 0,
      receiverSensitivityDbm: -90
    }
  }
];
