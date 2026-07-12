import type { Metadata } from "next";
import { Card } from "@/components/Card";
import { ToolLayout } from "@/components/ToolLayout";
import { AntennaTermLabClient } from "./components/AntennaTermLabClient";

const title = "アンテナ用語の直感ラボ｜触って体感するアンテナ基礎用語21｜スタッフ株式会社";
const description =
  "アンテナ設計やIoT機器開発で重要な基礎用語21個を、動くインタラクティブな体感図面とIoTの観点、計算ツールへの連携で直感的に学べる学習室。周波数・波長、VSWR、指向性、インピーダンス整合、グランドプレーンなど、つまずきやすい概念を網羅。";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "アンテナ 基礎用語",
    "アンテナ 仕組み",
    "VSWR",
    "放射効率",
    "指向性",
    "グランドプレーン",
    "インピーダンス整合",
    "EIRP",
    "アイソレーション",
    "電波 入門",
    "スタッフ株式会社"
  ],
  alternates: {
    canonical: "https://www.staf.co.jp/tools/antenna-term-lab"
  },
  openGraph: {
    title,
    description,
    type: "website",
    siteName: "スタッフ株式会社",
    url: "https://www.staf.co.jp/tools/antenna-term-lab"
  }
};

export default function AntennaTermLabPage() {
  return (
    <ToolLayout>
      <h1 className="sr-only">アンテナ用語の直感ラボ——アンテナ・電波シリーズ</h1>
      <AntennaTermLabClient />
      <section className="mx-auto max-w-5xl px-4 pb-12 sm:px-6 lg:px-8">
        <Card padding="lg">
          <p className="text-sm font-bold text-staf-dark">つぎの一歩</p>
          <h2 className="mt-1 text-xl font-bold text-slate-950">体感した直感を、クイズで試す</h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">
            アンテナ用語の直感がつかめたら、ロールプレイングゲーム形式の「RF学習クエスト」でさらに腕試しをしてみてください。
            また、実務の計算ツールを組み合わせて、実際の設計やアンテナ選定、通信距離の診断を進めることができます。
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { href: "/tools/rf-learning-quest", label: "RF学習クエスト（腕試し）" },
              { href: "/tools/radio-wave-intuition", label: "感覚でわかる電波" },
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
