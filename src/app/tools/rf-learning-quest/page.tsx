import type { Metadata } from "next";
import { ToolLayout } from "@/components/ToolLayout";
import { RfLearningQuestClient } from "./components/RfLearningQuestClient";

const title = "アンテナ設計RPG学習クエスト｜VSWR・放射効率・実装レビューを学ぶ｜スタッフ株式会社";
const description =
  "入門、初心者、見習い、実務者、玄人、研究者の6モード合計700問で、アンテナ構造、波長、VSWR、放射効率、GND、筐体影響、通信距離、OTA測定、最新IoT伝搬研究を、RPG形式で楽しみながらメーカーの設計レビュー目線で学べるページです。";
const keywords = [
  "アンテナ 設計 学習",
  "アンテナ 選定",
  "VSWR",
  "放射効率",
  "通信距離 計算",
  "リンクバジェット",
  "920MHz アンテナ",
  "LPWA アンテナ",
  "LTE アンテナ",
  "Wi-Fi アンテナ",
  "BLE アンテナ",
  "FPC アンテナ",
  "PCB アンテナ",
  "板金アンテナ",
  "スタッフ株式会社"
];

export const metadata: Metadata = {
  title,
  description,
  keywords,
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
      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-bold text-staf-dark">アンテナ設計・選定の関連ページ</p>
          <h2 className="mt-1 text-xl font-bold text-slate-950">学んだ内容を製品選定と相談につなげる</h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">
            RPGレッスンで扱う波長、VSWR、放射効率、筐体実装、設置条件は、実際のアンテナ選定や通信距離検討とつながります。周波数帯や用途が決まっている場合は、関連ページも合わせて確認してください。
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {[
              { href: "https://www.staf.co.jp/product/antenna.html", label: "アンテナ製品を見る" },
              { href: "https://www.staf.co.jp/frequency.html", label: "周波数から探す" },
              { href: "https://www.staf.co.jp/media/", label: "アンテナ基礎コラム" },
              { href: "https://www.staf.co.jp/download.html", label: "資料ダウンロード" },
              { href: "https://www.staf.co.jp/contact.html", label: "アンテナ相談" }
            ].map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-md border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-bold text-staf transition hover:border-staf/40 hover:bg-staf-light"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </section>
    </ToolLayout>
  );
}
