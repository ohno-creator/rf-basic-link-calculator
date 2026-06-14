import { ChartColumnIncreasing, CircleDot, Gauge, ListChecks } from "lucide-react";
import { formatDbm, formatSigned } from "@/lib/rf/format";
import type { LinkBudgetInput, LinkBudgetResult } from "@/lib/rf/linkBudget";

type ResultReadingGuideProps = {
  input: LinkBudgetInput;
  result: LinkBudgetResult;
};

const cards = [
  {
    title: "1. 判定を見る",
    body: "まず通信余裕の大まかな評価を確認します。",
    icon: ListChecks,
    tone: "border-sky-200 bg-sky-50 text-sky-800"
  },
  {
    title: "2. 3つの数値を見る",
    body: "推定受信電力、受信感度、リンクマージンの関係を確認します。",
    icon: Gauge,
    tone: "border-emerald-200 bg-emerald-50 text-emerald-800"
  },
  {
    title: "3. 滝グラフを見る",
    body: "どの損失が一番大きく、どこを改善すべきかを探します。",
    icon: ChartColumnIncreasing,
    tone: "border-amber-200 bg-amber-50 text-amber-800"
  }
];

export function ResultReadingGuide({ input, result }: ResultReadingGuideProps) {
  const metrics = [
    {
      label: "推定受信電力",
      value: formatDbm(result.receivedPowerDbm),
      note: "受信機に届く見込みの強さ"
    },
    {
      label: "受信感度",
      value: formatDbm(input.receiverSensitivityDbm),
      note: "受信に必要な最低ライン"
    },
    {
      label: "リンクマージン",
      value: formatSigned(result.linkMarginDb, "dB"),
      note: "上2つの差分。プラスが余裕"
    }
  ];

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-staf">結果の読み方</p>
          <h3 className="mt-1 text-lg font-bold text-slate-950">
            初心者はこの順番で見ればOK
          </h3>
        </div>
        <p className="max-w-2xl text-sm leading-relaxed text-slate-600">
          すべての図を一度に読む必要はありません。まず判定と3つの数値を見てから、滝グラフで原因を探します。
        </p>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <article key={card.title} className={`rounded-lg border p-4 ${card.tone}`}>
              <Icon aria-hidden="true" className="h-7 w-7" />
              <h4 className="mt-3 text-sm font-bold text-slate-950">{card.title}</h4>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">{card.body}</p>
            </article>
          );
        })}
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2">
              <CircleDot aria-hidden="true" className="h-4 w-4 text-staf" />
              <p className="text-xs font-semibold text-slate-500">{metric.label}</p>
            </div>
            <p className="mt-2 text-2xl font-bold text-slate-950">{metric.value}</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">{metric.note}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
