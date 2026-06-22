"use client";

import { useMemo, useState } from "react";
import { dbToDistanceRatio, dbToPowerRatio } from "@/lib/rf/db";
import { Tooltip } from "@/components/Tooltip";
import { FormulaExplanationCard } from "./FormulaExplanationCard";
import { DbFeelDiagram } from "./DbFeelDiagram";

export function formatRatio(ratio: number): string {
  if (ratio >= 100) return `×${Math.round(ratio).toLocaleString()}`;
  if (ratio >= 10) return `×${ratio.toFixed(1)}`;
  if (ratio >= 1) return `×${ratio.toFixed(2)}`;
  return `×${ratio.toFixed(3)}`;
}

const stackChips = [3, 6, 10, 20];
const tableRows = [3, 6, 10, 20, 30];

const chipTooltips: Record<number, string> = {
  3: "このチップを足すと合計に+3dB（電力約2倍）。複数選ぶと合計dBは足し算、倍率は掛け算で増えます。",
  6: "+6dBを合計に加算（電力×4／距離2倍相当）。選択ON/OFFで合計dBと倍率が変わります。",
  10: "+10dBを合計に加算（電力×10）。dBは足すだけ、倍率は10倍ずつ掛かることを体験できます。",
  20: "+20dBを合計に加算（電力×100／距離×10）。大きな利得・損失の効きを試すチップです。"
};

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
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <label htmlFor="dbValue" className="text-sm font-semibold text-slate-950">
              dB（プラスで強く・遠く）
            </label>
            <Tooltip term="dBスライダー">
              相対的な強さ・距離の余裕をdBで指定します。+10dBで電力10倍、+3dBで約2倍、+6dBで到達距離2倍。0dBは基準（×1）です。可動範囲は -30〜+30 dB。
            </Tooltip>
          </div>
          <span className="flex items-center gap-2">
            <span className="text-lg font-bold text-staf-dark">
              {db > 0 ? `+${db}` : db} dB
            </span>
            <Tooltip term="現在のdB値">
              スライダーで選んだ相対dB値です。正で強く・遠く、負で弱く・近くなります。下の倍率・距離・図に即時反映されます。
            </Tooltip>
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
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold text-staf-dark">電力の倍率</p>
            <Tooltip term="電力の倍率">
              10^(dB/10)。dBが示す電力の倍率です。+10dB=×10、+3dB≒×2、-3dB≒1/2。送信電力や利得の効きを表します。距離の倍率は10^(dB/20)で、指数の分母が異なる点に注意してください。
            </Tooltip>
          </div>
          <p className="mt-1 text-3xl font-bold text-slate-950">{formatRatio(powerRatio)}</p>
          <p className="mt-1 text-xs text-slate-500">+10dBで10倍、+3dBで約2倍</p>
        </div>
        <div className="rounded-lg bg-slate-50 p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs text-slate-500">到達距離の倍率（自由空間の目安）</p>
            <Tooltip term="距離の倍率">
              10^(dB/20)。自由空間損失は距離の2乗（20log）で効くため、電力(10log)より緩やかに伸び、+6dBで距離2倍／+20dBで10倍になります。屋内や障害物では目安より短くなります。
            </Tooltip>
          </div>
          <p className="mt-1 text-3xl font-bold text-staf-dark">{formatRatio(distanceRatio)}</p>
          <p className="mt-1 text-xs text-slate-500">+6dBで距離2倍、+20dBで距離10倍</p>
        </div>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-950">ものさし図</span>
          <Tooltip term="ものさし図">
            スライダーのdBを軸上のマーカー（青い▼）で表示します。目盛りは等間隔でも倍率は×2・×10・×100と急増します。表示域はスライダーと同じ±30dB。チップ合計はグレーの▽で同じ軸に重ねて表示されます。
          </Tooltip>
        </div>
        <DbFeelDiagram db={db} stackTotalDb={stackTotalDb} />
      </div>

      <div className="mt-6 border-t border-slate-200 pt-5">
        <h3 className="text-lg font-bold text-slate-950">掛け算を足し算にする体験</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          dBは「足すだけ」。でも倍率は「掛け算」で増えます。チップを選んで、合計dBと倍率の関係を確かめてください。
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {stackChips.map((value) => {
            const active = selectedChips.includes(value);
            return (
              <span key={value} className="inline-flex items-center gap-1">
                <button
                  type="button"
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                    active ? "border-staf bg-staf text-white" : "border-slate-200 bg-white text-slate-600 hover:border-staf/40"
                  }`}
                  onClick={() => toggleChip(value)}
                >
                  +{value} dB
                </button>
                <Tooltip term={`+${value} dB`}>{chipTooltips[value]}</Tooltip>
              </span>
            );
          })}
        </div>
        <div className="mt-3 rounded-lg bg-slate-50 p-4">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm text-slate-700">
              選んだdBの<span className="font-semibold">合計</span> ={" "}
              <span className="font-bold text-staf-dark">+{stackTotalDb} dB</span>
              <span className="mx-2 text-slate-400">→</span>
              電力は <span className="font-bold text-staf-dark">{formatRatio(stackRatio)}</span>
            </p>
            <Tooltip term="合計dBと倍率">
              選択チップのdBを単純加算した合計と、その電力倍率10^(合計/10)です。dBは足し算、倍率は掛け算で増えます（例：+3と+10で+13dB=×20）。上の図にグレーの▽で重ねて表示されます。
            </Tooltip>
          </div>
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
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-bold text-slate-950">早見表</h3>
          <Tooltip term="早見表">
            代表的なdBに対する電力倍率(10^(dB/10))と距離倍率(10^(dB/20))の早見です。マイナスは逆数になります（-3dB≒1/2）。距離は自由空間の目安です。
          </Tooltip>
        </div>
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
                  <td className="px-3 py-2 font-semibold text-staf-dark">{formatRatio(dbToPowerRatio(value))}</td>
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
