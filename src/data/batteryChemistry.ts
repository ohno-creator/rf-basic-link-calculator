/**
 * 電池化学特性データ（Track G19 エキスパートモード用）
 * All values are based on official manufacturer datasheets.
 */

export interface BatteryChemistryProfile {
  id: string;
  name: string;
  nominalVoltageV: number;
  defaultCapacityMah: number;
  selfDischargeRatePerYear: number;
  minTempC: number;
  maxTempC: number;
  tempCoefficients: {
    [-20]: number;
    [0]: number;
    [25]: number;
    [60]: number;
  };
  pulseCoefficients: {
    low: number;     // ピーク/平均電流比 <10x
    medium: number;  // ピーク/平均電流比 10-100x
    high: number;    // ピーク/平均電流比 >100x
  };
  description: string;
  datasource: string;
  passivationRisk: boolean;
}

export const batteryChemistryProfiles: Record<string, BatteryChemistryProfile> = {
  lisocl2_bobbin: {
    id: "lisocl2_bobbin",
    name: "Li-SOCl2ボビン型",
    nominalVoltageV: 3.6,
    defaultCapacityMah: 2400, // ER14505 AA
    selfDischargeRatePerYear: 0.01, // 約1%/年
    minTempC: -55,
    maxTempC: 85,
    tempCoefficients: {
      [-20]: 0.80,
      [0]: 0.90,
      [25]: 1.00,
      [60]: 0.95
    },
    pulseCoefficients: {
      low: 1.00,
      medium: 0.70,
      high: 0.40 // パルスに弱い
    },
    description: "自己放電率が年1%と極めて低く、非常に長期（10年超）の動作に適しますが、内部抵抗が高く高パルス（大電流）負荷では電圧降下を引き起こしやすい特徴があります。また長期スリープで不動態化被膜が形成され、起動時に一時的な電圧遅延（電圧降下）が発生するリスクがあります。",
    datasource: "Tadiran TL-4903 / Saft LS14500",
    passivationRisk: true
  },
  lisocl2_spiral: {
    id: "lisocl2_spiral",
    name: "Li-SOCl2スパイラル型",
    nominalVoltageV: 3.6,
    defaultCapacityMah: 5800, // LSH14 C
    selfDischargeRatePerYear: 0.02, // 約2%/年
    minTempC: -60,
    maxTempC: 85,
    tempCoefficients: {
      [-20]: 0.85,
      [0]: 0.95,
      [25]: 1.00,
      [60]: 0.95
    },
    pulseCoefficients: {
      low: 1.00,
      medium: 0.95,
      high: 0.85 // 高パルス対応
    },
    description: "スパイラル（渦巻き）電極構造により電極面積を広げ、高パルス・大電流動作に対応させた塩化チオニルリチウム電池。自己放電は年約2%とわずかに増えますが、高出力と低温性能を両立しています。",
    datasource: "Saft LSHシリーズ",
    passivationRisk: true
  },
  limno2: {
    id: "limno2",
    name: "Li-MnO2",
    nominalVoltageV: 3.0,
    defaultCapacityMah: 1500, // CR123A
    selfDischargeRatePerYear: 0.01, // 約1%/年
    minTempC: -40,
    maxTempC: 70,
    tempCoefficients: {
      [-20]: 0.70,
      [0]: 0.85,
      [25]: 1.00,
      [60]: 0.95
    },
    pulseCoefficients: {
      low: 1.00,
      medium: 0.90,
      high: 0.75 // 中パルス対応
    },
    description: "自己放電が年1%程度と低く、カメラや防犯センサーなどの中パルス負荷に適した3Vリチウム一次電池。不動態化のリスクがほぼありません。",
    datasource: "Panasonic CR123A",
    passivationRisk: false
  },
  cr2032: {
    id: "cr2032",
    name: "コイン形CR2032",
    nominalVoltageV: 3.0,
    defaultCapacityMah: 225, // CR2032
    selfDischargeRatePerYear: 0.01, // 約1%/年
    minTempC: -30,
    maxTempC: 60,
    tempCoefficients: {
      [-20]: 0.50, // 低温で大幅低下
      [0]: 0.80,
      [25]: 1.00,
      [60]: 0.95
    },
    pulseCoefficients: {
      low: 0.90,
      medium: 0.60,
      high: 0.25 // 大パルスで実効容量が大幅低下
    },
    description: "小型BLEビーコンなどで標準的ですが、内部抵抗が極めて大きく（数十〜数百Ω）、パルス電流（特に15mA超など）が流れると内部の電圧降下により実効容量が極端に低下します。",
    datasource: "Panasonic CR2032",
    passivationRisk: false
  },
  alkaline_aa: {
    id: "alkaline_aa",
    name: "アルカリAA",
    nominalVoltageV: 1.5,
    defaultCapacityMah: 2800, // アルカリ単3 (低負荷時)
    selfDischargeRatePerYear: 0.025, // 2-3%/年 (中間をとって2.5%)
    minTempC: -20,
    maxTempC: 50,
    tempCoefficients: {
      [-20]: 0.30, // -20℃で容量半分以下
      [0]: 0.70,
      [25]: 1.00,
      [60]: 0.90
    },
    pulseCoefficients: {
      low: 1.00,
      medium: 0.80,
      high: 0.50
    },
    description: "安価で入手性が高い汎用の1.5Vアルカリ乾電池。低温下（-20℃など）では容量が半分以下（30%程度）まで著しく低下し、自己放電も年率2.5%程度とリチウム系に比べて高めです。",
    datasource: "Panasonic / Energizer",
    passivationRisk: false
  }
};
