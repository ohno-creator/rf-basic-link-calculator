import { formatSigned } from "@/lib/rf/format";
import type { LinkBudgetResult } from "@/lib/rf/linkBudget";

type LinkMarginGaugeProps = {
  result: LinkBudgetResult;
};

const zones = [
  { label: "条件見直し推奨", range: "0dB未満", className: "bg-rose-100 text-rose-900" },
  { label: "要注意", range: "0-10dB", className: "bg-amber-100 text-amber-900" },
  { label: "概ね可能性あり", range: "10-20dB", className: "bg-sky-100 text-sky-900" },
  { label: "余裕あり", range: "20dB以上", className: "bg-emerald-100 text-emerald-900" }
];

function markerPosition(marginDb: number) {
  const min = -20;
  const max = 40;
  const clamped = Math.min(max, Math.max(min, marginDb));

  return ((clamped - min) / (max - min)) * 100;
}

export function LinkMarginGauge({ result }: LinkMarginGaugeProps) {
  const left = markerPosition(result.linkMarginDb);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-950">リンクマージンゲージ</h3>
          <p className="mt-1 text-sm text-slate-600">
            受信に必要な最低ラインに対して、どれくらい余裕があるかを示します。
          </p>
        </div>
        <p className="text-2xl font-bold text-staf">
          {formatSigned(result.linkMarginDb, "dB")}
        </p>
      </div>

      <div className="mt-5">
        <div className="grid grid-cols-4 overflow-hidden rounded-lg border border-slate-200 text-center text-xs font-semibold">
          {zones.map((zone) => (
            <div key={zone.label} className={`px-2 py-3 ${zone.className}`}>
              <span className="block">{zone.label}</span>
              <span className="mt-1 block text-[11px] font-medium opacity-75">{zone.range}</span>
            </div>
          ))}
        </div>
        <div className="relative h-11">
          <div
            className="absolute top-1 flex -translate-x-1/2 flex-col items-center"
            style={{ left: `${left}%` }}
          >
            <span className="h-0 w-0 border-x-[7px] border-b-[10px] border-x-transparent border-b-staf" />
            <span className="mt-1 rounded-full bg-staf px-2 py-1 text-xs font-semibold text-white shadow-sm">
              {result.judgement.label}
            </span>
          </div>
        </div>
      </div>

      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        {result.judgement.summary} 色だけでなく、判定名と説明で状態を確認できます。
      </p>
    </section>
  );
}
