export type FrequencyPreset = {
  label: string;
  frequencyMHz: number;
  description: string;
};

export const frequencyPresets: FrequencyPreset[] = [
  { label: "920MHz", frequencyMHz: 920, description: "LPWA / Wi-SUN / LoRa" },
  { label: "2.4GHz", frequencyMHz: 2400, description: "BLE / Wi-Fi" },
  { label: "5GHz", frequencyMHz: 5000, description: "Wi-Fi" },
  { label: "6GHz", frequencyMHz: 6000, description: "Wi-Fi 6E / Wi-Fi 7" },
  { label: "700MHz", frequencyMHz: 700, description: "LTE低周波帯" },
  { label: "800MHz", frequencyMHz: 800, description: "LTE低周波帯" },
  { label: "1.5GHz", frequencyMHz: 1500, description: "LTE" },
  { label: "1.7GHz", frequencyMHz: 1700, description: "LTE" },
  { label: "2.1GHz", frequencyMHz: 2100, description: "LTE" },
  { label: "3.7GHz", frequencyMHz: 3700, description: "5G Sub6 n77/n78" },
  { label: "4.5GHz", frequencyMHz: 4500, description: "5G Sub6 n79" }
];
