"use client";

import { useMemo, useState } from "react";
import { dbToDistanceRatio, dbToPowerRatio } from "@/lib/rf/db";
import { FormulaExplanationCard } from "./FormulaExplanationCard";
import { DbFeelDiagram } from "./DbFeelDiagram";

function formatRatio(ratio: number): string {
  if (ratio >= 100) return `×${Math.round(ratio).toLocaleString()}`;
  if (ratio >= 10) return `×${ratio.toFixed(1)}`;
  if (ratio >= 1) return `×${ratio.toFixed(2)}`;
  return `×${ratio.toFixed(3)}`;
}

const stackChips = [3, 6, 10, 20];
const tableRows = [3, 6, 10, 20, 30];

export function DbFeelPanel() {
  const [db, setDb] = useState(6);
  const [selectedChips, setSelectedChips] = useState<number[]>([3, 10]);

  const powerRatio = useMemo(() => dbToPowerRatio(db), [db]);
  const distanceRatio = useMemo(() => dbToDistanceRatio(db), [db]);

  const stackTotalDb = selectedChips.reduce((sum, value) => sum + value, 0);
  const stackRatio = dbToPowerRatio(stackTotalDb);

  function toggleChip(value: number) {
    setSelectedChips((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value]
    );
  }

  return (
    <section className="flex flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-bold text-slate-950">dBを体感する</h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        dBは「掛け算を足し算にするものさし」です。スライダーを動かして、dBが電力の倍率・到達距離の倍率にどう効くかを体感してください。
      </p>

      <div className="mt-4">
        <div className="flex items-center justify-between">
          <label htmlFor="dbValue" className="text-sm font-semibold text-slate-950">
            dB（プラスで強く・遠く）
          </label>
          <span className="text-lg font-bold text-staf">
            {db > 0 ? `+${db}` : db} dB
          </span>
        </div>
        <input
          id="dbValue"
          type="range"
          min={-30}
          max={30}
          step={1}
          value={db}
          className="mt-3 w-full"
          aria-label="dB"
          onChange={(event) => setDb(Number(event.target.value))}
        />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg bg-staf-light p-4">
          <p className="text-xs font-semibold text-staf">電力の倍率</p>
          <p className="mt-1 text-3xl font-bold text-slate-950">{formatRatio(powerRatio)}</p>
          <p className="mt-1 text-xs text-slate-500">+10dBで10倍、+3dBで約2倍</p>
        </div>
        <div className="rounded-lg bg-slate-50 p-4">
          <p className="text-xs text-slate-500">到達距離の倍率（自由空間の目安）</p>
          <p className="mt-1 text-3xl font-bold text-staf">{formatRatio(distanceRatio)}</p>
          <p className="mt-1 text-xs text-slate-500">+6dBで距離2倍、+20dBで距離10倍</p>
        </div>
      </div>

      <div className="mt-5">
        <DbFeelDiagram db={db} />
      </div>

      <div className="mt-6 border-t border-slate-200 pt-5">
        <h3 className="text-lg font-bold text-slate-950">掛け算を足し算にする体験</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          dBは「足すだけ」。でも倍率は「掛け算」で増えます。チップを選んで、合計dBと倍率の関係を確かめてください。
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {stackChips.map((value) => {
            const active = selectedChips.includes(value);
            return (
              <button
                key={value}
                type="button"
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  active ? "border-staf bg-staf text-white" : "border-slate-200 bg-white text-slate-600 hover:border-staf/40"
                }`}
                onClick={() => toggleChip(value)}
              >
                +{value} dB
              </button>
            );
          })}
        </div>
        <div className="mt-3 rounded-lg bg-slate-50 p-4">
          <p className="text-sm text-slate-700">
            選んだdBの<span className="font-semibold">合計</span> ={" "}
            <span className="font-bold text-staf">+{stackTotalDb} dB</span>
            <span className="mx-2 text-slate-400">→</span>
            電力は <span className="font-bold text-staf">{formatRatio(stackRatio)}</span>
          </p>
          <p className="mt-1 text-xs text-slate-500">
            dBは足すだけ、倍率は掛け算（例：+3dB×+10dB = +13dB = ×2×10 = ×20）。
          </p>
        </div>
      </div>

      <div className="mt-6 border-t border-slate-200 pt-5">
        <h3 className="text-lg font-bold text-slate-950">なぜ体感が「鈍い」のか</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          身近な音で考えると分かります。出力を10倍（+10dB）にしても、音の体感は「少し大きい」だけ。人の感覚も電波の減衰も「割合（対数）」で効くので、dBで扱うと自然なのです。
        </p>
        <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
          <div className="rounded-md bg-slate-50 p-3">会話：約 60 dB</div>
          <div className="rounded-md bg-slate-50 p-3">掃除機：約 70 dB（出力10倍でも体感は少し大きいだけ）</div>
        </div>
      </div>

      <div className="mt-6 border-t border-slate-200 pt-5">
        <h3 className="text-lg font-bold text-slate-950">早見表</h3>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[360px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs text-slate-500">
                <th className="py-2 pr-3 font-semibold">dB</th>
                <th className="px-3 py-2 font-semibold">電力の倍率</th>
                <th className="py-2 pl-3 font-semibold">距離の倍率（目安）</th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map((value) => (
                <tr key={value} className="border-b border-slate-100">
                  <td className="py-2 pr-3 font-semibold text-slate-900">+{value} dB</td>
                  <td className="px-3 py-2 font-semibold text-staf">{formatRatio(dbToPowerRatio(value))}</td>
                  <td className="py-2 pl-3 text-slate-700">{formatRatio(dbToDistanceRatio(value))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-slate-500">
          マイナスは逆数になります（-3dB=約1/2、-6dB=1/4、-10dB=1/10）。距離は自由空間の目安で、環境により増減します。
        </p>
      </div>

      <div className="mt-5">
        <FormulaExplanationCard
          title="dBの本質を見る"
          formula={"電力の倍率 = 10^(dB/10)\n距離の倍率（自由空間） = 10^(dB/20)\n10倍 = +10dB,  2倍 ≈ +3dB,  距離2倍 = +6dB"}
        >
          <p>
            dBは比（倍率）の対数で、10倍ごとに+10dBになります。1,000,000,000,000倍も「120dB」と3桁で書け、掛け算を足し算で扱えます（送信電力＋利得−損失…）。電波は距離・壁・天候で割合的に減るため、リンクバジェットはまさにこのdBの足し引きで「どこまで届くか」を見積もります。距離は自由空間損失が距離の2乗（20log10）で効くので、6dBの上積みで到達距離が2倍になります。
          </p>
        </FormulaExplanationCard>
      </div>
    </section>
  );
}
