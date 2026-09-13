import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpenCheck, Cable, Gauge, RadioTower, Ruler } from "lucide-react";
import { buttonClasses } from "@/components/Button";
import { ToolLayout } from "@/components/ToolLayout";
import { CONTACT_URL } from "@/lib/rf/presets";
import { ToolDirectoryBrowser } from "./components/ToolDirectoryBrowser";

export const metadata: Metadata = {
  title: { absolute: "アンテナ・無線 基礎計算ツール｜スタッフ株式会社" },
  description: "目的から選べる、アンテナ・無線設計の基礎計算ツール集です。"
};

const workRoutes = [
  { title: "届く距離を見積もる", description: "送信電力、感度、距離から通信余裕を確認します。見通しや障害物などの条件で結果は変わります。", icon: RadioTower, links: [{ label: "総合診断", href: "/tools/rf-basic-link-calculator" }, { label: "簡易計算", href: "/tools/simple-link-budget" }] },
  { title: "ケーブル・位置を比較する", description: "ケーブル損失と測定で分かった差を分け、変更前後を同じ条件で比べます。", icon: Cable, links: [{ label: "比較を始める", href: "/tools/cable-position-comparison" }] },
  { title: "整合と損失を確かめる", description: "反射による不整合と、周波数・長さによるケーブル損失を個別に見積もります。", icon: Gauge, links: [{ label: "VSWR・反射", href: "/tools/vswr-return-loss" }, { label: "同軸損失", href: "/tools/coaxial-cable-loss" }] },
  { title: "アンテナ形状を決める", description: "周波数と基板条件から、共振素子やパッチの初期寸法を求めます。実機での調整が前提です。", icon: Ruler, links: [{ label: "共振素子長", href: "/tools/resonant-element-length" }, { label: "パッチ寸法", href: "/tools/patch-antenna-dimensions" }] },
  { title: "基礎から理解する", description: "dB系単位の違いを整理し、問題形式でRF設計の判断を身につけます。", icon: BookOpenCheck, links: [{ label: "dB系単位", href: "/tools/db-family" }, { label: "学習クエスト", href: "/tools/rf-learning-quest" }] }
];

export default function HomePage() {
  return (
    <ToolLayout>
      <section className="mx-auto max-w-6xl px-4 pb-8 pt-8 sm:px-6 sm:pt-12">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold text-staf-dark">アンテナ・無線 基礎計算ツール</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-5xl">いまの仕事から、使う計算を選ぶ。</h1>
          <p className="mt-4 text-base leading-relaxed text-slate-600">64のツールを、営業の初期確認と設計の概算に使えます。まず目的を選ぶか、一覧から名前やキーワードで探してください。</p>
          <a href="#tools" className={`${buttonClasses("primary")} mt-6`}>全64ツールを検索する<ArrowRight aria-hidden="true" className="h-4 w-4" /></a>
        </div>
      </section>

      <section id="purpose-routes" className="mx-auto max-w-6xl px-4 pb-12 sm:px-6">
        <p className="text-sm font-semibold text-staf-dark">5つの仕事から探す</p>
        <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">まず知りたいことを選ぶ</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {workRoutes.map((route) => {
            const Icon = route.icon;
            return (
              <article key={route.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-staf-light text-staf-dark"><Icon aria-hidden="true" className="h-5 w-5" /></span>
                <h3 className="mt-4 text-lg font-bold text-slate-950">{route.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{route.description}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {route.links.map((link) => (
                    <Link key={link.href} href={link.href} className="inline-flex min-h-11 items-center gap-1 rounded-lg border border-staf/30 px-3 py-2 text-sm font-semibold text-staf-dark transition hover:bg-staf-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-staf/40">
                      {link.label}<ArrowRight aria-hidden="true" className="h-4 w-4" />
                    </Link>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <div className="pb-16">
        <ToolDirectoryBrowser />
        <section className="mx-auto mt-12 max-w-6xl px-4 sm:px-6">
          <div className="rounded-2xl bg-gradient-to-br from-staf to-staf-dark px-6 py-8 text-white shadow-card sm:px-10">
            <h2 className="text-xl font-semibold">実機評価・アンテナ選定でお困りですか？</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/90">計算は初期検討の目安です。筐体や設置環境を含む評価は技術相談窓口へどうぞ。</p>
            <a href={CONTACT_URL} className="mt-5 inline-flex min-h-11 items-center rounded-md bg-white px-4 py-2 text-sm font-semibold text-staf-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">相談する</a>
          </div>
        </section>
      </div>
    </ToolLayout>
  );
}
