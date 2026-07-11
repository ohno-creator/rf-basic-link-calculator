import type { Metadata } from "next";
import { Card } from "@/components/Card";
import { ToolLayout } from "@/components/ToolLayout";
import { RfAntipatternsColumn } from "@/app/tools/_components/RfAntipatternsColumn";
import { RfAntipatternsPanel } from "@/app/tools/_components/RfAntipatternsPanel";

const title = "RFアンチパターン図鑑｜無線設計で繰り返される間違い10選を数字で学ぶ｜スタッフ株式会社";
const description =
  "S11が良いのに飛ばない、dBiとdBdの取り違え、伝搬モデルの適用域外への外挿、dBm同士の足し算、金属面へのベタ付け設置、CR2032でのLoRa送信、キープアウト無視、フレネルゾーン未確保、一点RSSIでの距離断定——無線・アンテナ設計で繰り返される代表的な失敗10パターンを、症状→原因→数字で見る誤差→正しいやり方の順で図鑑形式にまとめました。各パターンは本サイトの計算ツールで誤差を自分の条件で再現できます。";
const keywords = [
  "RF 設計 失敗例",
  "アンテナ 設計 ミス",
  "アンチパターン",
  "S11 放射効率",
  "dBi dBd 違い",
  "奥村秦モデル 適用範囲",
  "dBm 足し算",
  "アンテナ 金属 影響",
  "CR2032 LoRa",
  "チップアンテナ キープアウト",
  "フレネルゾーン",
  "RSSI ばらつき",
  "リンクバジェット",
  "スタッフ株式会社"
];

export const metadata: Metadata = {
  title,
  description,
  keywords,
  alternates: {
    canonical: "https://www.staf.co.jp/tools/rf-antipatterns"
  },
  openGraph: {
    title,
    description,
    type: "website",
    siteName: "スタッフ株式会社",
    url: "https://www.staf.co.jp/tools/rf-antipatterns"
  }
};

export default function RfAntipatternsPage() {
  return (
    <ToolLayout>
      <RfAntipatternsPanel />
      <section className="mx-auto max-w-5xl px-4 pb-8 sm:px-6 lg:px-8">
        <RfAntipatternsColumn />
      </section>
      <section className="mx-auto max-w-5xl px-4 pb-12 sm:px-6 lg:px-8">
        <Card padding="lg">
          <p className="text-sm font-bold text-staf-dark">アンテナ設計・選定の関連ページ</p>
          <h2 className="mt-1 text-xl font-bold text-slate-950">壊れ方を知ったら、次は自分の設計で数字を出す</h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">
            図鑑で確認したアンチパターンは、実際の製品設計ではアンテナ選定・設置条件・リンクバジェットの
            見積もりとして現れます。周波数帯や用途が決まっている場合は、関連ページも合わせて確認してください。
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {[
              { href: "https://www.staf.co.jp/product/antenna.html", label: "アンテナ製品を見る" },
              { href: "https://www.staf.co.jp/frequency.html", label: "周波数から探す" },
              { href: "https://www.staf.co.jp/media/", label: "アンテナ基礎コラム" },
              { href: "https://www.staf.co.jp/download.html", label: "資料ダウンロード" },
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
