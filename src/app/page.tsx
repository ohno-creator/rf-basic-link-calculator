import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
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
    "周波数・損失・整合・伝搬など、無線設計でよく使う基礎計算を1ツール1ページでまとめたツール集です。入力するとその場で図と意味がわかります。スタッフ株式会社。"
};

export default function HomePage() {
  return (
    <ToolLayout>
      <section className="mx-auto max-w-6xl px-6 pb-10 pt-16 sm:pb-12 sm:pt-24">
        <p className="text-sm font-semibold text-staf">アンテナ・無線 基礎計算ツール</p>
        <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-6xl">
          無線設計の計算を、ひとつずつ。
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-500">
          周波数、損失、整合、伝搬。よく使う基礎計算を、1ツール1ページで。入力すると、その場で図と意味がわかります。
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
