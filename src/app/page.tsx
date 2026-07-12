import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Activity,
  Building2,
  BookOpenCheck,
  Cable,
  FlaskConical,
  Gauge,
  RadioTower,
  Spline
} from "lucide-react";
import { ButtonLink, buttonClasses } from "@/components/Button";
import { ToolLayout } from "@/components/ToolLayout";
import { CONTACT_URL } from "@/lib/rf/presets";
import { toolCategories, toolDirectory, type ToolCategoryId } from "@/data/toolDirectory";
import { ToolDirectoryBrowser } from "./components/ToolDirectoryBrowser";

export const metadata: Metadata = {
  title: {
    absolute: "アンテナ・無線 基礎計算ツール｜スタッフ株式会社"
  },
  description:
    "周波数・損失・整合・伝搬など、無線設計でよく使う基礎計算を1ツール1ページでまとめたツール集です。初心者でも目的から選べ、入力するとその場で図と意味がわかります。スタッフ株式会社。"
};

// 「目的別ガイド」と「カテゴリ一覧」の二重ナビを統合した単一の入口。
// カテゴリ1件=1カード。質問形の見出しで目的別ガイドの分かりやすさを残しつつ、
// クリックで /?category=<id>#tools（ToolDirectoryBrowserの既存フィルタ機構）へ渡す。
const categoryGuides: Record<
  ToolCategoryId,
  { question: string; icon: typeof RadioTower; examples: Array<{ label: string; href: string }> }
> = {
  link: {
    question: "電波が届くか確認したい",
    icon: RadioTower,
    examples: [
      { label: "リンクバジェット診断", href: "/tools/rf-basic-link-calculator" },
      { label: "壁・建材の透過損失", href: "/tools/wall-penetration" },
      { label: "デセンス（感度劣化）", href: "/tools/desense" }
    ]
  },
  antenna: {
    question: "アンテナの性能を見積もりたい",
    icon: Spline,
    examples: [
      { label: "VSWR帯域幅とQ", href: "/tools/vswr-bandwidth-q" },
      { label: "偏波不整合損失", href: "/tools/polarization-loss" },
      { label: "パッチアンテナ寸法", href: "/tools/patch-antenna-dimensions" }
    ]
  },
  basics: {
    question: "単位・基礎から理解したい",
    icon: Gauge,
    examples: [
      { label: "dBを体感する", href: "/tools/db-feel" },
      { label: "dBm変換", href: "/tools/dbm-converter" },
      { label: "周波数・波長", href: "/tools/frequency-wavelength" }
    ]
  },
  line: {
    question: "ケーブル・整合を検討したい",
    icon: Cable,
    examples: [
      { label: "VSWR・リターンロス", href: "/tools/vswr-return-loss" },
      { label: "同軸ケーブル損失", href: "/tools/coaxial-cable-loss" },
      { label: "L型整合回路", href: "/tools/l-match" }
    ]
  },
  implementation: {
    question: "アンテナを実装したい",
    icon: Building2,
    examples: [
      { label: "GNDプレーン寸法と効率", href: "/tools/ground-plane-size" },
      { label: "アンテナ・キープアウト領域", href: "/tools/antenna-keepout" },
      { label: "筐体・近接物の離調推定", href: "/tools/detuning-estimator" }
    ]
  },
  system: {
    question: "電池・システム全体で見積もりたい",
    icon: Activity,
    examples: [
      { label: "無線端末の電池寿命", href: "/tools/battery-life" },
      { label: "LoRa送信時間・920MHz制限", href: "/tools/lora-airtime" },
      { label: "GNSS C/N0バジェット", href: "/tools/gnss-cn0" }
    ]
  },
  learning: {
    question: "用語と判断軸を学びたい",
    icon: BookOpenCheck,
    examples: [
      { label: "RF学習クエスト", href: "/tools/rf-learning-quest" },
      { label: "アンテナ用語の直感ラボ", href: "/tools/antenna-term-lab" },
      { label: "感覚でわかる電波", href: "/tools/radio-wave-intuition" }
    ]
  },
  research: {
    question: "発展的な設計限界を確認したい",
    icon: FlaskConical,
    examples: [
      { label: "小型アンテナ限界", href: "/tools/small-antenna-limit" },
      { label: "大型アレイ近傍界", href: "/tools/large-array-near-field" },
      { label: "反射板・RISサイズ効果", href: "/tools/reflector-ris-size-effect" }
    ]
  }
};

export default function HomePage() {
  const categoryCounts = new Map<string, number>();
  for (const tool of toolDirectory) {
    categoryCounts.set(tool.category, (categoryCounts.get(tool.category) ?? 0) + 1);
  }

  return (
    <ToolLayout>
      <section className="relative mx-auto max-w-6xl overflow-hidden px-6 pb-6 pt-10 sm:pb-8 sm:pt-12">
        {/* 計測方眼（v4-3: 主題を語る極薄モチーフ。線は不透明度4%・印刷非表示・読み上げ対象外） */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.04)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(90%_80%_at_30%_20%,black,transparent)] print:hidden"
        />
        <div className="relative grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold text-staf-dark">アンテナ・無線 基礎計算ツール</p>
            <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              無線設計を、目的から迷わず計算。
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-600">
              通信が届くか、アンテナをどう実装するか、なぜ通信が不安定なのか。知りたいことから計算の順番を選べます。
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <a href="#purpose-routes" className={buttonClasses("primary")}>
                目的から選ぶ
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </a>
              <a href="#tools" className={buttonClasses("secondary")}>
                全{toolDirectory.length}ツールを検索
              </a>
              <span className="text-xs text-slate-500">無料・登録不要／数式・単位・適用条件を明示</span>
            </div>
          </div>

          <aside aria-labelledby="start-here-title" className="rounded-2xl border border-staf/20 bg-white p-4 shadow-soft sm:p-5">
            <div className="flex items-baseline justify-between gap-2">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-staf-dark">Start here</p>
              <span className="flex flex-wrap justify-end gap-x-2 text-[11px] text-slate-500">
                <span>すぐ試せる</span>
                <span>URLで共有</span>
              </span>
            </div>
            <h2 id="start-here-title" className="mt-1.5 text-xl font-bold text-slate-950">まずは総合診断</h2>
            <p className="mt-1.5 text-sm leading-snug text-slate-600">
              周波数・距離・送信電力・アンテナ利得・損失から、受信電力とリンクマージンをまとめて確認します。
            </p>
            <ButtonLink href="/tools/rf-basic-link-calculator" variant="primary" className="mt-4 w-full justify-center">
              リンクバジェット診断を開く
              <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
            </ButtonLink>
            <Link href="/tools/simple-link-budget" className="mt-2 block text-center text-xs font-semibold text-staf-dark hover:underline">
              もっと簡単な5項目だけの計算はこちら
            </Link>
          </aside>
        </div>
      </section>

      <section id="purpose-routes" className="mx-auto max-w-6xl scroll-mt-24 px-6 pb-10">
        <div className="flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold text-staf-dark">目的から探す</p>
            <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-950">知りたいことに近いカードを選ぶ</h2>
          </div>
          <p className="max-w-xl text-xs leading-relaxed text-slate-500">
            そのままツール一覧の該当カテゴリへ絞り込まれます。全部見たい場合は下の一覧へ。
          </p>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {toolCategories.map((category) => {
            const guide = categoryGuides[category.id];
            const Icon = guide.icon;
            const count = categoryCounts.get(category.id) ?? 0;
            return (
              <Link
                key={category.id}
                href={`/?category=${category.id}#tools`}
                className="group flex flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-card transition hover:-translate-y-0.5 hover:border-staf/30 hover:shadow-card-hover"
              >
                <div className="flex items-start gap-2.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-staf-light text-staf-dark transition group-hover:bg-staf group-hover:text-white">
                    <Icon aria-hidden="true" className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="flex items-center gap-1.5 text-[11px] font-semibold text-staf-dark">
                      {category.label}
                      <span className="text-slate-400">{count}件</span>
                    </p>
                    <h3 className="mt-0.5 text-base font-bold leading-snug text-slate-950">{guide.question}</h3>
                  </div>
                </div>
                <ul className="mt-3 grid gap-1">
                  {guide.examples.map((example) => (
                    <li key={example.href} className="truncate text-xs text-slate-600">
                      ・{example.label}
                    </li>
                  ))}
                </ul>
                <span className="mt-3 flex items-center gap-1 text-xs font-semibold text-staf-dark opacity-0 transition group-hover:opacity-100">
                  このカテゴリを見る
                  <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <div className="pb-16">
        <ToolDirectoryBrowser />

        <section className="mx-auto mt-12 max-w-6xl px-6">
          {/* 最終CTA＝ブランド面（v4-2: 深色グラデ面は1ページ1回・ページ末のみ） */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-staf to-staf-dark px-6 py-8 shadow-card sm:px-10 sm:py-10">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_60%_at_20%_0%,rgba(255,255,255,0.14),transparent_60%)]"
            />
            <div className="relative">
              <h2 className="text-xl font-semibold tracking-tight text-white">
                実機評価・アンテナ選定でお困りですか？
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/90">
                計算は初期検討の目安です。建物・筐体込みの実測評価は技術相談窓口へどうぞ。
              </p>
              <a
                href={CONTACT_URL}
                className="mt-5 inline-flex items-center justify-center gap-2 rounded-md bg-white px-4 py-3 text-sm font-semibold text-staf-dark transition hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              >
                相談する
                <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
              </a>
            </div>
          </div>
        </section>
      </div>
    </ToolLayout>
  );
}
