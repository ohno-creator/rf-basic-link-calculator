import type { Metadata } from "next";
import { ToolLayout } from "@/components/ToolLayout";
import { RfLearningQuestClient } from "./components/RfLearningQuestClient";

const title = "RF学習クエスト｜問題と解説でリンク設計を学ぶ｜スタッフ株式会社";
const description =
  "dB、自由空間損失、2波モデル、端末近傍損失、Hata系モデル、信頼率マージン、実測補正を、問題→即答え→解説→関連ツールで学べるRF学習ページです。";

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
