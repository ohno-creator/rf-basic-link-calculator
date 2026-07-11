/** Track G5 人体・手の追加損失[dB]。正本: 文献パック§4。 */
export type BodyLossScenario = "handheld" | "wrist" | "head" | "torso" | "shadowing";
export type BodyLossBand = "920" | "1575" | "2400" | "sub6";
export const BODY_LOSS_SCENARIO_LABELS: Record<BodyLossScenario, string> = { handheld: "手持ち", wrist: "手首装着", head: "頭部近接", torso: "体表密着", shadowing: "体による遮蔽" };
export const BODY_LOSS_BAND_LABELS: Record<BodyLossBand, string> = { "920": "920MHz（LPWA）", "1575": "1575MHz（GNSS）", "2400": "2400MHz（BLE）", sub6: "Sub-6GHz（5G）" };
export const BODY_LOSS_SOURCES = { threeGpp: "3GPP TR 36.814 §8.2 / TR 37.840 body blockage models", ctia: "CTIA OTA Test Plan, Head and Hand Phantoms", wearable: "AntennaWare, wearable Bluetooth/LPWAN body-loss data" } as const;
export type BodyLossData = { scenario: BodyLossScenario; band: BodyLossBand; typicalLossDb: number; worstLossDb: number; sourceRefs: readonly (keyof typeof BODY_LOSS_SOURCES)[]; confidence: "confirmed" };
type Pair = readonly [number, number] | null;
const values: Record<BodyLossScenario, Record<BodyLossBand, Pair>> = {
  handheld: { "920": [3, 6], "1575": [4.5, 8], "2400": [5, 10], sub6: [4, 8] },
  wrist: { "920": [8, 15], "1575": [10, 18], "2400": [12, 20], sub6: [9, 16] },
  head: { "920": [5, 10], "1575": null, "2400": [8, 15], sub6: [7, 12] },
  torso: { "920": [10, 18], "1575": [12, 22], "2400": [15, 25], sub6: [12, 20] },
  shadowing: { "920": [12, 20], "1575": [15, 25], "2400": [18, 30], sub6: [15, 25] }
};
export const BODY_LOSS_DATA: readonly BodyLossData[] = (Object.keys(values) as BodyLossScenario[]).flatMap((scenario) => (Object.keys(values[scenario]) as BodyLossBand[]).flatMap((band) => { const pair = values[scenario][band]; return pair ? [{ scenario, band, typicalLossDb: pair[0], worstLossDb: pair[1], sourceRefs: ["threeGpp", "ctia", "wearable"] as const, confidence: "confirmed" as const }] : []; }));
export function getBodyLossData(scenario: string, band: string): BodyLossData | undefined { return BODY_LOSS_DATA.find((item) => item.scenario === scenario && item.band === band); }
