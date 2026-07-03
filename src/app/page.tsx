import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Calculator, Compass, RadioTower, Waves } from "lucide-react";
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

const beginnerPaths = [
  {
    label: "まず通信が届くか知りたい",
    title: "かんたんリンク計算から始める",
    body: "送信電力、距離、受信感度だけで、まず通信余裕がどれくらいあるかを見ます。",
    href: "/tools/simple-link-budget",
    icon: Compass
  },
  {
    label: "dBやdBmが分からない",
    title: "単位の感覚を先につかむ",
    body: "+3dBで約2倍、dBmは電力そのもの。結果を読むためのものさしを先に作れます。",
    href: "/tools/db-feel",
    icon: Calculator
  },
  {
    label: "距離や障害物が不安",
    title: "電波が弱くなる理由を見る",
    body: "自由空間損失、フレネルゾーン、伝搬モデルで、距離・見通し・環境の効き方を確認します。",
    href: "/tools/free-space-loss",
    icon: Waves
  },
  {
    label: "アンテナの大きさを決めたい",
    title: "波長からサイズ感を見る",
    body: "周波数から波長を出し、アンテナ長、複数アンテナ間隔、基板アンテナ寸法の入口にします。",
    href: "/tools/frequency-wavelength",
    icon: RadioTower
  }
];

export default function HomePage() {
  return (
    <ToolLayout>
      <section className="mx-auto max-w-6xl px-6 pb-10 pt-16 sm:pb-12 sm:pt-24">
        <p className="text-sm font-semibold text-staf-dark">アンテナ・無線 基礎計算ツール</p>
        <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-6xl">
          無線設計の計算を、ひとつずつ。
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-500">
          周波数、損失、整合、伝搬。専門用語に慣れていなくても、目的から選び、入力し、結果の意味まで追えるようにした基礎計算ツール集です。
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <ButtonLink href="/tools/rf-basic-link-calculator" variant="primary">
            リンクバジェット診断をはじめる
            <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
          </ButtonLink>
          <a href="#tools" className={buttonClasses("secondary")}>
            全{toolDirectory.length}ツールを見る
          </a>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-12">
        <div className="border-y border-slate-200 bg-slate-50/80 px-4 py-6 sm:px-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold text-staf-dark">無線に詳しくない方へ</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
                ツール名ではなく、知りたいことから選べます
              </h2>
            </div>
            <p className="max-w-2xl text-sm leading-relaxed text-slate-600">
              迷ったら左から順番に見てください。計算値そのものより、どの入力が結果を悪くするかをつかむのが近道です。
            </p>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {beginnerPaths.map((path) => {
              const Icon = path.icon;
              return (
                <Link
                  key={path.href}
                  href={path.href}
                  className="group flex min-h-full flex-col border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-staf/40 hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-staf/40"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex h-9 w-9 items-center justify-center bg-staf/10 text-staf-dark transition group-hover:bg-staf group-hover:text-white">
                      <Icon aria-hidden="true" className="h-5 w-5" />
                    </span>
                    <ArrowUpRight aria-hidden="true" className="h-4 w-4 text-staf-dark opacity-0 transition group-hover:opacity-100" />
                  </div>
                  <p className="mt-4 text-xs font-semibold text-staf-dark">{path.label}</p>
                  <h3 className="mt-1 text-base font-bold leading-snug text-slate-950 group-hover:text-staf-dark">
                    {path.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{path.body}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <div className="pb-16">
        <ToolDirectoryBrowser />

        <section className="mx-auto mt-12 max-w-6xl px-6">
          <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-6 py-8 sm:px-10 sm:py-10">
            <h2 className="text-xl font-semibold tracking-tight text-slate-950">
              実機評価・アンテナ選定でお困りですか？
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">
              計算は初期検討の目安です。筐体・基板GND・設置環境を含む実機評価は、スタッフ株式会社にご相談ください。
            </p>
            <ButtonLink href={CONTACT_URL} variant="primary" className="mt-5">
              相談する
              <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
            </ButtonLink>
          </div>
        </section>
      </div>
    </ToolLayout>
  );
}
