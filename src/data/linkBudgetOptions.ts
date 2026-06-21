import type { LinkPropagationModel, LinkType } from "@/lib/rf/linkBudget";
import type { AreaType } from "@/lib/rf/propagation";

export const linkTypeOptions: Array<{
  value: LinkType;
  label: string;
  description: string;
  /** 送信側・受信側アンテナ高の目安 */
  heights: string;
  /** 代表的な通信例 */
  examples: string;
  /** 相性の良い伝搬モデル（表示用テキスト） */
  recommendedModels: string;
  /** 相性の良い伝搬モデル（判定用の値。空配列なら全モデル可） */
  recommendedModelValues: LinkPropagationModel[];
}> = [
  {
    value: "cellular_base_station_to_iot_terminal",
    label: "携帯基地局 → IoT端末",
    description: "LTE-M、NB-IoT、セルラーIoTなど、高所基地局と地上近傍端末の通信を評価します。",
    heights: "基地局 30〜200m ／ 端末 1〜1.5m",
    examples: "LTE-M・NB-IoT・セルラーIoT",
    recommendedModels: "奥村・秦／COST231-Hata（参考）＋端末近傍損失",
    recommendedModelValues: ["okumura_hata", "cost231_hata", "iot_hata_calibrated"]
  },
  {
    value: "private_base_station_to_iot_terminal",
    label: "プライベート基地局 → IoT端末",
    description: "ローカル5G、プライベートLTE、自営無線基地局などとIoT端末の通信を評価します。",
    heights: "基地局 5〜30m ／ 端末 1〜1.5m",
    examples: "ローカル5G・自営LTE・自営無線",
    recommendedModels: "Log-distance／実測補正（Hataは参考）",
    recommendedModelValues: ["log_distance", "measured_correction", "iot_hata_calibrated"]
  },
  {
    value: "gateway_to_low_height_terminal",
    label: "ゲートウェイ → 低高度端末",
    description: "比較的低い位置に設置されたゲートウェイと、地上近傍端末の通信を評価します。",
    heights: "ゲートウェイ 3〜10m ／ 端末 0.5〜1.5m",
    examples: "LoRaWAN・Wi-SUN・私設ゲートウェイ",
    recommendedModels: "Log-distance／2波／実測補正",
    recommendedModelValues: ["log_distance", "two_ray", "measured_correction"]
  },
  {
    value: "terminal_to_terminal",
    label: "低高度端末 ↔ 低高度端末",
    description: "送受信機の双方が地上近傍にある端末間通信を評価します。",
    heights: "両端とも 0.5〜2m",
    examples: "BLE・端末間メッシュ・近距離無線",
    recommendedModels: "自由空間／2波／Log-distance",
    recommendedModelValues: ["free_space", "two_ray", "log_distance"]
  },
  {
    value: "custom",
    label: "カスタム",
    description: "任意のアンテナ高、距離、環境損失を設定して評価します。",
    heights: "任意（高さ・距離を自由に設定）",
    examples: "特殊な設置・実験的な構成",
    recommendedModels: "全モデル（適用範囲の警告を確認）",
    recommendedModelValues: []
  }
];

export const propagationModelOptions: Array<{
  value: LinkPropagationModel;
  label: string;
  description: string;
  /** 向いている状況 */
  bestFor: string;
  /** 使う際の注意 */
  caution: string;
}> = [
  {
    value: "free_space",
    label: "自由空間損失モデル",
    description: "見通し条件の基本損失を評価します。低高度端末では追加損失を必ず別途見ます。",
    bestFor: "見通し（LOS）の基準値・損失の下限の目安",
    caution: "地面反射・遮蔽を含まない。低高度では追加損失を別途加算"
  },
  {
    value: "two_ray",
    label: "2波モデル",
    description: "直接波と地面反射波の合成を、リンク判定では平滑化した包絡線として扱う低高度通信向けの参考モデルです。",
    bestFor: "地面反射が効く屋外・中〜遠距離。図解タブで干渉の山谷も確認できます。",
    caution: "実際は強め合い・弱め合いで波打つ。深い谷は実測・端末近傍損失で確認"
  },
  {
    value: "log_distance",
    label: "Log-distanceモデル",
    description: "実環境の距離減衰を指数で近似するモデルです。距離損失指数は現地環境や実測値に合わせて調整してください。",
    bestFor: "屋内・市街地などNLOSの距離減衰を近似したいとき",
    caution: "距離損失指数 n は現地・実測に合わせて調整する"
  },
  {
    value: "measured_correction",
    label: "実測補正モデル",
    description: "自由空間損失を基準に、現地RSSI/RSRPとの差分を実測補正値として加えます。",
    bestFor: "現地のRSSI/RSRP実測値があるとき",
    caution: "実測補正値が0dBのままだと自由空間と同じ結果"
  },
  {
    value: "iot_hata_calibrated",
    label: "IoT実測補正Hataモード",
    description: "奥村・秦/COST231-Hataを基準に、現地のRSSIまたはRSRP実測点でオフセットと距離勾配を補正します。",
    bestFor: "現地1点の実測でHataを校正するIoT用途",
    caution: "アンカーから遠い距離は外挿。実測補正値との二重計上に注意"
  },
  {
    value: "okumura_hata",
    label: "奥村・秦モデル（参考）",
    description: "高所基地局と移動局間の広域平均伝搬損失を評価する経験式です。低高度端末では参考値扱いにします。",
    bestFor: "高所基地局↔移動局の広域（150〜1500MHz）",
    caution: "低高度端末同士は非推奨。適用範囲外は参考値"
  },
  {
    value: "cost231_hata",
    label: "COST231-Hataモデル（参考）",
    description: "奥村・秦モデルを高周波帯へ拡張した参考モデルです。適用範囲外では警告を表示します。",
    bestFor: "1500〜2000MHzへ拡張したHata系の広域評価",
    caution: "適用範囲外では警告。郊外/開放地補正は外挿"
  }
];

export const propagationAreaOptions: Array<{
  value: AreaType;
  label: string;
  description: string;
}> = [
  {
    value: "urbanLarge",
    label: "市街地（大都市）",
    description: "大都市中心部など、建物密度が高い環境として評価します。COST231-Hataでは大都市補正を加えます。"
  },
  {
    value: "urbanMedium",
    label: "市街地（中小都市）",
    description: "標準的な市街地条件です。迷った場合の初期値ですが、固定値ではありません。"
  },
  {
    value: "suburban",
    label: "郊外",
    description: "市街地より建物密度が低い郊外環境として評価します。"
  },
  {
    value: "open",
    label: "開放地",
    description: "遮蔽物の少ない開放地として評価します。市街地より伝搬損失が小さく出やすい条件です。"
  }
];

export function getLinkTypeLabel(value: LinkType): string {
  return linkTypeOptions.find((option) => option.value === value)?.label ?? "カスタム";
}

export function getPropagationModelOption(value: LinkPropagationModel) {
  return propagationModelOptions.find((option) => option.value === value) ?? propagationModelOptions[0];
}

export function getPropagationAreaOption(value: AreaType) {
  return propagationAreaOptions.find((option) => option.value === value) ?? propagationAreaOptions[1];
}
