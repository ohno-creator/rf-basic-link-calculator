import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpenCheck,
  Bug,
  CheckCircle2,
  CircuitBoard,
  RadioTower
} from "lucide-react";
import { ButtonLink, buttonClasses } from "@/components/Button";
import { ToolLayout } from "@/components/ToolLayout";
import { CONTACT_URL } from "@/lib/rf/presets";
import { toolDirectory } from "@/data/toolDirectory";
import { ToolDirectoryBrowser } from "./components/ToolDirectoryBrowser";

export const metadata: Metadata = {
  title: {
    absolute: "アンテナ・無線 基礎計算ツール｜スタッフ株式会社"
  },
  description:
    "周波数・損失・整合・伝搬など、無線設計でよく使う基礎計算を1ツール1ページでまとめたツール集です。初心者でも目的から選べ、入力するとその場で図と意味がわかります。スタッフ株式会社。"
};

const purposeRoutes = [
  {
    label: "通信成立性を見積もる",
    title: "電波が届くか確認したい",
    body: "通信距離と余裕を計算し、壁やばらつきまで順番に追加します。",
    icon: RadioTower,
    steps: [
      { label: "リンクバジェットを計算", href: "/tools/rf-basic-link-calculator" },
      { label: "壁・建材の損失を追加", href: "/tools/wall-penetration" },
      { label: "必要な信頼性マージンを確認", href: "/tools/shadowing-margin" }
    ]
  },
  {
    label: "基板・筐体へ組み込む",
    title: "アンテナを実装したい",
    body: "波長から必要寸法をつかみ、GNDとアンテナ周囲の空き地を確認します。",
    icon: CircuitBoard,
    steps: [
      { label: "周波数から波長を確認", href: "/tools/frequency-wavelength" },
      { label: "GNDプレーン寸法を確認", href: "/tools/ground-plane-size" },
      { label: "キープアウト領域を確認", href: "/tools/antenna-keepout" }
    ]
  },
  {
    label: "測定値から原因を探す",
    title: "通信不良を切り分けたい",
    body: "受信品質、ノイズ、筐体による離調を分けて、疑う順番を整理します。",
    icon: Bug,
    steps: [
      { label: "LTEの受信品質を読む", href: "/tools/lte-signal-metrics" },
      { label: "受信感度の劣化を確認", href: "/tools/desense" },
      { label: "筐体・近接物の離調を確認", href: "/tools/detuning-estimator" }
    ]
  },
  {
    label: "用語と判断軸を学ぶ",
    title: "基礎から理解したい",
    body: "dBの感覚から始め、問題形式で無線設計の判断を身につけます。",
    icon: BookOpenCheck,
    steps: [
      { label: "dBの増減を体感", href: "/tools/db-feel" },
      { label: "dBmと電力を変換", href: "/tools/dbm-converter" },
      { label: "RF学習クエストへ進む", href: "/tools/rf-learning-quest" }
    ]
  }
];

export default function HomePage() {
  return (
    <ToolLayout>
      <section className="relative mx-auto max-w-6xl overflow-hidden px-6 pb-10 pt-12 sm:pb-12 sm:pt-20">
        {/* 計測方眼（v4-3: 主題を語る極薄モチーフ。線は不透明度4%・印刷非表示・読み上げ対象外） */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.04)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(90%_80%_at_30%_20%,black,transparent)] print:hidden"
        />
        <div className="relative grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold text-staf-dark">アンテナ・無線 基礎計算ツール</p>
            <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-6xl">
              無線設計を、目的から迷わず計算。
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-600">
              通信が届くか、アンテナをどう実装するか、なぜ通信が不安定なのか。知りたいことから計算の順番を選べます。
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <a href="#purpose-routes" className={buttonClasses("primary")}>
                目的から選ぶ
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </a>
              <a href="#tools" className={buttonClasses("secondary")}>
                全{toolDirectory.length}ツールを検索
              </a>
            </div>
            <p className="mt-6 text-sm text-slate-500">
              全{toolDirectory.length}ツール無料・登録不要 ／ 数式・単位・適用条件を明示
            </p>
          </div>

          <aside aria-labelledby="start-here-title" className="rounded-2xl border border-staf/20 bg-white p-5 shadow-soft sm:p-6">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-staf-dark">Start here</p>
            <h2 id="start-here-title" className="mt-2 text-2xl font-bold text-slate-950">まずは総合診断</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              周波数・距離・送信電力・アンテナ利得・損失から、受信電力とリンクマージンをまとめて確認します。
            </p>
            <ul className="mt-4 grid gap-2 text-sm text-slate-700">
              {["代表条件からすぐ試せる", "滝グラフを見ながら調整できる", "条件をURLで共有できる"].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <CheckCircle2 aria-hidden="true" className="h-4 w-4 shrink-0 text-emerald-600" />
                  {item}
                </li>
              ))}
            </ul>
            <ButtonLink href="/tools/rf-basic-link-calculator" variant="primary" className="mt-5 w-full justify-center">
              リンクバジェット診断を開く
              <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
            </ButtonLink>
            <Link href="/tools/simple-link-budget" className="mt-3 block text-center text-xs font-semibold text-staf-dark hover:underline">
              もっと簡単な5項目だけの計算はこちら
            </Link>
          </aside>
        </div>
      </section>

      <section id="purpose-routes" className="mx-auto max-w-6xl scroll-mt-24 px-6 pb-14">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold text-staf-dark">目的別ガイド</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">やりたいことに沿って、上から順に確認</h2>
          </div>
          <p className="max-w-xl text-sm leading-relaxed text-slate-600">
            すべて使う必要はありません。今の課題に近いルートを1つ選び、必要なところまで進めます。
          </p>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {purposeRoutes.map((route) => {
            const Icon = route.icon;
            return (
              <article key={route.title} className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-staf-light text-staf-dark">
                    <Icon aria-hidden="true" className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-staf-dark">{route.label}</p>
                    <h3 className="mt-1 text-lg font-bold text-slate-950">{route.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">{route.body}</p>
                  </div>
                </div>
                <ol className="mt-4 grid gap-2">
                  {route.steps.map((step, index) => (
                    <li key={step.href}>
                      <Link href={step.href} className="group flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 transition hover:border-staf/40 hover:bg-staf-light/60">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-staf-dark ring-1 ring-slate-200">{index + 1}</span>
                        <span className="min-w-0 flex-1 text-sm font-semibold text-slate-700 group-hover:text-staf-dark">{step.label}</span>
                        <ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-staf-dark" />
                      </Link>
                    </li>
                  ))}
                </ol>
              </article>
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
