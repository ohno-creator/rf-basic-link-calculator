import type { Metadata } from "next";
import { Card } from "@/components/Card";
import { ToolLayout } from "@/components/ToolLayout";
import { RadioIntuitionClient } from "./components/RadioIntuitionClient";

const title = "感覚でわかる電波｜触って学ぶアンテナ・電波の直感6章｜スタッフ株式会社";
const description =
  "式を覚える前に、スライダーを触って電波の性質を体感する初心者向け学習モード。波と波長、dB、距離の2乗、アンテナの共振、障害物と回折、ノイズとSNRの6つの直感を、動くインタラクティブ図とコラムで身体に入れます。各章から実務の計算ツールへ直結。玄人向けの深掘り（式・一次出典）つき。";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "電波 入門",
    "アンテナ 仕組み",
    "電波 学習",
    "波長 周波数",
    "デシベル とは",
    "自由空間損失",
    "アンテナ 共振",
    "回折",
    "SNR ノイズ",
    "スタッフ株式会社"
  ],
  alternates: {
    canonical: "https://www.staf.co.jp/tools/radio-wave-intuition"
  },
  openGraph: {
    title,
    description,
    type: "website",
    siteName: "スタッフ株式会社",
    url: "https://www.staf.co.jp/tools/radio-wave-intuition"
  }
};

export default function RadioWaveIntuitionPage() {
  return (
    <ToolLayout>
      <h1 className="sr-only">感覚でわかる電波——アンテナ・電波シリーズ</h1>
      <RadioIntuitionClient />
      <section className="mx-auto max-w-5xl px-4 pb-12 sm:px-6 lg:px-8">
        <Card padding="lg">
          <p className="text-sm font-bold text-staf-dark">つぎの一歩</p>
          <h2 className="mt-1 text-xl font-bold text-slate-950">体感した直感を、数字にする</h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">
            6章の直感がつかめたら、クイズ形式の「RF学習クエスト」で知識を確かめるか、実務の計算ツールで実際の数字を出してみてください。
            アンテナ選定や通信距離の検討は、製品ページ・相談窓口にもつながっています。
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { href: "/tools/rf-learning-quest", label: "RF学習クエスト（腕試し）" },
              { href: "/tools/simple-link-budget", label: "かんたんリンクバジェット" },
              { href: "https://www.staf.co.jp/product/antenna.html", label: "アンテナ製品を見る" },
              { href: "https://www.staf.co.jp/contact.html", label: "アンテナ相談" }
            ].map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-md border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-bold text-staf-dark transition hover:border-staf/40 hover:bg-staf-light"
              >
                {link.label}
              </a>
            ))}
          </div>
        </Card>
      </section>
    </ToolLayout>
  );
}
