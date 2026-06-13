import { ArrowDown, BookOpen, MessageSquareText, PlayCircle } from "lucide-react";
import { COLUMN_URL, CONTACT_URL } from "@/lib/rf/presets";

type HeroSectionProps = {
  onStart: () => void;
  onSample: () => void;
};

const flow = [
  { label: "送信する", value: "+23 dBm" },
  { label: "空間で弱くなる", value: "-91.7 dB" },
  { label: "筐体・環境でさらに弱くなる", value: "-10 dB" },
  { label: "受信機に届く", value: "-78.7 dBm" },
  { label: "受信に必要な強さとの差", value: "+26.3 dB" }
];

export function HeroSection({ onStart, onSample }: HeroSectionProps) {
  return (
    <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-14">
      <div>
        <p className="text-sm font-semibold text-staf">アンテナ・無線 基礎計算ツール</p>
        <h1 className="mt-3 text-4xl font-bold tracking-normal text-slate-950 sm:text-5xl">
          通信距離・リンクバジェット簡易診断
        </h1>
        <p className="mt-5 max-w-3xl text-lg leading-relaxed text-slate-700">
          周波数、距離、送信出力、アンテナ利得、受信感度から、無線通信の「届きやすさ」を簡易チェックできます。
        </p>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600">
          IoT機器、LTE-M/NB-IoT、BLE、Wi-Fi、920MHz帯、LPWA、センサー端末などのアンテナ検討にご活用ください。
        </p>

        <div className="mt-7 flex flex-wrap gap-3">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-md bg-staf px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-staf-dark"
            onClick={onStart}
          >
            <PlayCircle aria-hidden="true" className="h-4 w-4" />
            すぐに診断する
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-md border border-staf/30 bg-white px-5 py-3 text-sm font-semibold text-staf transition hover:bg-staf-light"
            onClick={onSample}
          >
            <ArrowDown aria-hidden="true" className="h-4 w-4" />
            まずはサンプル条件で試す
          </button>
          <a
            className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-staf/30 hover:text-staf"
            href={COLUMN_URL}
          >
            <BookOpen aria-hidden="true" className="h-4 w-4" />
            詳しい解説を読む
          </a>
          <a
            className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-staf/30 hover:text-staf"
            href={CONTACT_URL}
          >
            <MessageSquareText aria-hidden="true" className="h-4 w-4" />
            アンテナ選定を相談する
          </a>
        </div>

        <div className="mt-7 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-950">
          本ツールの計算結果は初期検討用の概算です。実際の通信性能は、筐体、基板GND、アンテナ配置、金属部品、ケーブル、設置環境、ノイズ、通信モジュールの性能により変動します。量産前には実機状態での測定・評価を推奨します。
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-slate-950">足し算と引き算で見る通信余裕</h2>
          <p className="mt-1 text-sm text-slate-600">
            電波が届くまでの流れを、リンクバジェットとして整理します。
          </p>
        </div>
        <div className="space-y-3">
          {flow.map((item, index) => (
            <div key={item.label}>
              <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                <span className="text-sm font-medium text-slate-700">{item.label}</span>
                <span className="text-lg font-bold text-staf">{item.value}</span>
              </div>
              {index < flow.length - 1 ? (
                <div className="flex justify-center py-1 text-slate-400">↓</div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
