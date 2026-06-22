import type { Metadata } from "next";
import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  BookOpenCheck,
  Box,
  Building2,
  Cable,
  CircuitBoard,
  Gauge,
  type LucideIcon,
  RadioTower,
  Repeat,
  Ruler,
  Spline,
  Waves
} from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";
import { CONTACT_URL } from "@/lib/rf/presets";
import { toolCategories, toolDirectory } from "@/data/toolDirectory";

export const metadata: Metadata = {
  title: {
    absolute: "アンテナ・無線 基礎計算ツール｜スタッフ株式会社"
  },
  description:
    "周波数・損失・整合・伝搬など、無線設計でよく使う基礎計算を1ツール1ページでまとめたツール集です。入力するとその場で図と意味がわかります。スタッフ株式会社。"
};

const iconMap: Record<string, LucideIcon> = {
  gauge: Gauge,
  waves: Waves,
  spline: Spline,
  building: Building2,
  book: BookOpenCheck,
  radio: RadioTower,
  repeat: Repeat,
  ruler: Ruler,
  activity: Activity,
  cable: Cable,
  circuit: CircuitBoard,
  box: Box
};

export default function HomePage() {
  return (
    <ToolLayout>
      <section className="mx-auto max-w-6xl px-6 pb-12 pt-16 sm:pb-16 sm:pt-24">
        <p className="text-sm font-semibold text-staf">アンテナ・無線 基礎計算ツール</p>
        <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-6xl">
          無線設計の計算を、ひとつずつ。
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-500">
          周波数、損失、整合、伝搬。よく使う基礎計算を、1ツール1ページで。入力すると、その場で図と意味がわかります。
        </p>
      </section>

      <div className="space-y-10 pb-16">
        {toolCategories.map((category) => {
          const tools = toolDirectory.filter((tool) => tool.category === category.id);

          return (
            <section key={category.id} className="mx-auto max-w-6xl px-6">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                {category.label}
              </h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {tools.map((tool) => {
                  const Icon = iconMap[tool.icon] ?? Gauge;

                  return (
                    <Link
                      key={tool.href}
                      href={tool.href}
                      className="group flex items-start gap-4 rounded-2xl border border-slate-200/70 bg-white p-6 transition hover:-translate-y-0.5 hover:border-staf/30 hover:shadow-lg hover:shadow-slate-200/60"
                    >
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-staf/10 text-staf">
                        <Icon aria-hidden="true" className="h-5 w-5" />
                      </span>
                      <span className="min-w-0">
                        <span className="flex items-center gap-1 text-base font-semibold text-slate-900">
                          {tool.name}
                          <ArrowUpRight
                            aria-hidden="true"
                            className="h-4 w-4 text-slate-300 transition group-hover:text-staf"
                          />
                        </span>
                        <span className="mt-1 block text-sm leading-relaxed text-slate-500">
                          {tool.tagline}
                        </span>
                      </span>
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}

        <section className="mx-auto max-w-6xl px-6">
          <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-6 py-8 sm:px-10 sm:py-10">
            <h2 className="text-xl font-semibold tracking-tight text-slate-950">
              実機評価・アンテナ選定でお困りですか？
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">
              計算は初期検討の目安です。筐体・基板GND・設置環境を含む実機評価は、スタッフ株式会社にご相談ください。
            </p>
            <a
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-staf px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-staf-dark"
              href={CONTACT_URL}
            >
              相談する
              <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
            </a>
          </div>
        </section>
      </div>
    </ToolLayout>
  );
}
