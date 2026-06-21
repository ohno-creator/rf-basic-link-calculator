import type { Metadata } from "next";
import { ToolLayout } from "@/components/ToolLayout";
import { RfLearningQuestClient } from "./components/RfLearningQuestClient";

const title = "RF学習クエスト｜問題と解説でリンク設計を学ぶ｜スタッフ株式会社";
const description =
  "初心者、見習い、実務者、玄人、研究者の5モード合計250問で、dB、自由空間損失、2波モデル、端末近傍損失、Hata系モデル、信頼率マージン、最新IoT伝搬研究を学べるRF学習ページです。";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "https://www.staf.co.jp/tools/rf-learning-quest"
  },
  openGraph: {
    title,
    description,
    type: "website",
    siteName: "スタッフ株式会社",
    url: "https://www.staf.co.jp/tools/rf-learning-quest"
  }
};

export default function RfLearningQuestPage() {
  return (
    <ToolLayout>
      <RfLearningQuestClient />
    </ToolLayout>
  );
}
