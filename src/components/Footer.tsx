import Link from "next/link";
import { ButtonLink } from "@/components/Button";
import { COLUMN_URL, CONTACT_URL } from "@/lib/rf/presets";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-start">
          <div>
            <p className="font-bold text-slate-950">スタッフ株式会社 / Staf Corporation</p>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-600">IoT、LTE/LPWA/5G/Wi-Fi/BLE向けアンテナと機構部品の技術支援を行います。</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <ButtonLink href={CONTACT_URL} variant="primary" size="sm">お問い合わせ</ButtonLink>
              <ButtonLink href={COLUMN_URL} variant="secondary" size="sm">解説コラム</ButtonLink>
            </div>
          </div>
          <nav aria-label="フッターナビゲーション" className="grid gap-2 text-sm font-semibold text-slate-700">
            <Link href="/#tools" className="inline-flex min-h-11 items-center rounded-md px-3 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-staf/40">全64ツールを見る</Link>
            <a href="https://www.staf.co.jp/" className="inline-flex min-h-11 items-center rounded-md px-3 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-staf/40">会社概要</a>
          </nav>
        </div>
        <div className="mt-8 flex flex-col gap-2 border-t border-slate-100 pt-5 text-xs text-slate-500 sm:flex-row sm:justify-between">
          <p>© スタッフ株式会社　アンテナ・無線 基礎計算ツール集</p>
          <p>本ツールの計算値は初期検討の目安です。</p>
        </div>
      </div>
    </footer>
  );
}
