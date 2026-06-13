import type { Metadata } from "next";
import { ToolLayout } from "@/components/ToolLayout";
import { COLUMN_URL, TOOL_URL } from "@/lib/rf/presets";
import { JsonLd } from "./components/JsonLd";
import { RfBasicLinkCalculatorClient } from "./components/RfBasicLinkCalculatorClient";

const title =
  "通信距離・リンクバジェット簡易診断｜アンテナ・無線 基礎計算ツール｜スタッフ株式会社";
const description =
  "周波数、距離、送信出力、アンテナ利得、受信感度から、無線通信のリンクマージンを簡易計算できます。IoT機器、LTE-M/NB-IoT、Wi-Fi、BLE、920MHz帯機器などのアンテナ検討にご活用ください。スタッフ株式会社が提供するアンテナ・無線設計支援ツールです。";
const keywords = [
  "リンクバジェット",
  "通信距離 計算",
  "自由空間損失",
  "アンテナ 利得",
  "dBm 変換",
  "周波数 波長",
  "IoT アンテナ",
  "LTE-M アンテナ",
  "BLE アンテナ",
  "Wi-Fi アンテナ",
  "920MHz アンテナ",
  "LPWA アンテナ",
  "内蔵アンテナ",
  "アンテナ選定",
  "スタッフ株式会社"
];

export const metadata: Metadata = {
  title: {
    absolute: title
  },
  description,
  keywords,
  alternates: {
    canonical: TOOL_URL
  },
  openGraph: {
    title,
    description,
    type: "website",
    siteName: "スタッフ株式会社",
    url: TOOL_URL
  },
  other: {
    "staf:related-column": COLUMN_URL
  }
};

export default function RfBasicLinkCalculatorPage() {
  return (
    <ToolLayout>
      <JsonLd />
      <RfBasicLinkCalculatorClient />
    </ToolLayout>
  );
}
