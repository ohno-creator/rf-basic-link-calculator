import type { LinkPropagationModel, LinkType } from "@/lib/rf/linkBudget";

export const linkTypeOptions: Array<{
  value: LinkType;
  label: string;
  description: string;
}> = [
  {
    value: "cellular_base_station_to_iot_terminal",
    label: "携帯基地局 → IoT端末",
    description: "LTE-M、NB-IoT、セルラーIoTなど、高所基地局と地上近傍端末の通信を評価します。"
  },
  {
    value: "private_base_station_to_iot_terminal",
    label: "プライベート基地局 → IoT端末",
    description: "ローカル5G、プライベートLTE、自営無線基地局などとIoT端末の通信を評価します。"
  },
  {
    value: "gateway_to_low_height_terminal",
    label: "ゲートウェイ → 低高度端末",
    description: "比較的低い位置に設置されたゲートウェイと、地上近傍端末の通信を評価します。"
  },
  {
    value: "terminal_to_terminal",
    label: "低高度端末 ↔ 低高度端末",
    description: "送受信機の双方が地上近傍にある端末間通信を評価します。"
  },
  {
    value: "custom",
    label: "カスタム",
    description: "任意のアンテナ高、距離、環境損失を設定して評価します。"
  }
];

export const propagationModelOptions: Array<{
  value: LinkPropagationModel;
  label: string;
  description: string;
}> = [
  {
    value: "free_space",
    label: "自由空間損失モデル",
    description: "見通し条件の基本損失を評価します。低高度端末では追加損失を必ず別途見ます。"
  },
  {
    value: "two_ray",
    label: "2波モデル",
    description: "直接波と地面反射の影響を考える低高度通信向けの参考モデルです。"
  },
  {
    value: "log_distance",
    label: "Log-distanceモデル",
    description: "実環境の距離減衰を指数で近似するモデルです。距離損失指数は現地環境や実測値に合わせて調整してください。"
  },
  {
    value: "measured_correction",
    label: "実測補正モデル",
    description: "自由空間損失を基準に、現地RSSI/RSRPとの差分を実測補正値として加えます。"
  },
  {
    value: "okumura_hata",
    label: "奥村・秦モデル（参考）",
    description: "高所基地局と移動局間の広域平均伝搬損失を評価する経験式です。低高度端末では参考値扱いにします。"
  },
  {
    value: "cost231_hata",
    label: "COST231-Hataモデル（参考）",
    description: "奥村・秦モデルを高周波帯へ拡張した参考モデルです。適用範囲外では警告を表示します。"
  }
];

export function getLinkTypeLabel(value: LinkType): string {
  return linkTypeOptions.find((option) => option.value === value)?.label ?? "カスタム";
}

export function getPropagationModelOption(value: LinkPropagationModel) {
  return propagationModelOptions.find((option) => option.value === value) ?? propagationModelOptions[0];
}
