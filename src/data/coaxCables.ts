export type CoaxCable = {
  label: string;
  /** 2.4GHz での代表減衰量[dB/m]（メーカーや個体で変わる目安値） */
  attAt2400: number;
  /** 外径の目安[mm] */
  outerDiameterMm: number;
  note: string;
};

/**
 * IoT・無線機器でよく使う同軸フィードラインの代表値（おおよその目安）。
 * 細いケーブルほど損失は大きい。値は各社データシートの代表値をもとにした概算。
 */
export const coaxCables: CoaxCable[] = [
  { label: "U.FL 1.13mm 同軸", attAt2400: 2.0, outerDiameterMm: 1.13, note: "極細・短距離向け" },
  { label: "U.FL 1.37mm 同軸", attAt2400: 1.5, outerDiameterMm: 1.37, note: "極細・短距離向け" },
  { label: "RG-178", attAt2400: 1.7, outerDiameterMm: 1.8, note: "細径・テフロン" },
  { label: "RG-316", attAt2400: 1.2, outerDiameterMm: 2.5, note: "細径・テフロン" },
  { label: "RG-174", attAt2400: 1.0, outerDiameterMm: 2.8, note: "汎用細径" },
  { label: "RG-58", attAt2400: 0.9, outerDiameterMm: 5.0, note: "汎用" },
  { label: "LMR-195 相当", attAt2400: 0.6, outerDiameterMm: 5.0, note: "低損失" }
];
