import Link from "next/link";
import { ArrowRight, RadioTower } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";
import { COLUMN_URL, CONTACT_URL } from "@/lib/rf/presets";

export default function HomePage() {
  return (
    <ToolLayout>
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:px-8">
        <div>
          <p className="text-sm font-semibold text-staf">RF Basic Link Calculator</p>
          <h1 className="mt-3 text-4xl font-bold text-slate-950 sm:text-5xl">
            アンテナ・無線設計の初期検討を、見える形で。
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-relaxed text-slate-700">
            周波数、距離、送信出力、アンテナ利得、受信感度から、通信距離とリンクマージンを簡易診断できます。
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              className="inline-flex items-center gap-2 rounded-md bg-staf px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-staf-dark"
              href="/tools/rf-basic-link-calculator"
            >
              ツールを開く
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
            <a
              className="inline-flex items-center rounded-md border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-staf/30 hover:text-staf"
              href={COLUMN_URL}
            >
              詳しい解説を読む
            </a>
            <a
              className="inline-flex items-center rounded-md border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-staf/30 hover:text-staf"
              href={CONTACT_URL}
            >
              アンテナ選定を相談する
            </a>
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
          <RadioTower aria-hidden="true" className="h-9 w-9 text-staf" />
          <h2 className="mt-4 text-xl font-bold text-slate-950">通信距離・リンクバジェット簡易診断</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            LPWA、BLE、Wi-Fi、LTE-Mなどのプリセットから始め、スライダーで距離や損失を動かしながら通信余裕を確認できます。
          </p>
          <ul className="mt-5 space-y-2 text-sm text-slate-700">
            <li>周波数・波長計算</li>
            <li>dBm / mW / W 変換</li>
            <li>自由空間損失 FSPL 計算</li>
            <li>リンクバジェット簡易診断</li>
          </ul>
        </div>
      </section>
    </ToolLayout>
  );
}
