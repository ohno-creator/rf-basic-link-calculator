import type { Metadata } from "next";
import { ToolLayout } from "@/components/ToolLayout";
import { RfLearningQuestClient } from "./components/RfLearningQuestClient";

const title = "RF学習クエスト｜問題と解説でリンク設計を学ぶ｜スタッフ株式会社";
const description =
  "入門、初心者、見習い、実務者、玄人、研究者の6モード合計700問で、RF用語、dB、伝搬モデル、最新IoT伝搬研究、掲示板で定番の誤解を学べるRF学習ページです。選択肢ランダム化、モード別ランダム修了試験、PDF修了書出力にも対応します。";

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
