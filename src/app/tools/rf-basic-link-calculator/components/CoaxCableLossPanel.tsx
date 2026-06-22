"use client";

import { useMemo, useState } from "react";
import { Stat } from "@/components/Stat";
import { Tooltip } from "@/components/Tooltip";
import { cableAssemblies, referenceCables } from "@/data/coaxCables";
import { cableAssemblyLoss, interpolateCableLoss } from "@/lib/rf/coax";
import { formatNumber } from "@/lib/rf/format";
import { CableLossCurveDiagram } from "./CableLossCurveDiagram";
import { FormulaExplanationCard } from "./FormulaExplanationCard";

export function CoaxCableLossPanel() {
  const [cableIndex, setCableIndex] = useState(0);
  const [frequencyMHz, setFrequencyMHz] = useState(2400);
  const [quantity, setQuantity] = useState(1);

  const cable = cableAssemblies[cableIndex] ?? cableAssemblies[0];

  const result = useMemo(() => {
    try {
      return cableAssemblyLoss(cable.points, frequencyMHz, quantity);
    } catch {
      return null;
    }
  }, [cable.points, frequencyMHz, quantity]);

  const outOfRange = frequencyMHz < 500 || frequencyMHz > 8000;

  return (
    <section className="flex flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-card">
      <h2 className="text-xl font-bold text-slate-950">同軸ケーブル損失（実測値）</h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        標準品（変換・延長用）の同軸ケーブルについて、品番と周波数から1本あたりの挿入損失（実測値）を求めます。求めた合計を、リンクバジェットの「ケーブル・コネクタ損失」に入れて使えます。
      </p>

      <div className="mt-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label htmlFor="cablePart" className="text-sm font-semibold text-slate-950">
            品番
          </label>
          <Tooltip term="品番">
            使う同軸ケーブルの品番を選択します。各選択肢は変換・延長用の標準品で、括弧内の「@2GHz ≈ ○○dB」は2GHz時の1本あたり実測挿入損失の目安（数値が小さいほど低損失）。003B / 015A / 016A は約0.4dBの低損失系、004A / 013A / 017A / 018A は数dBの延長系です。長尺・高周波の用途では損失の大きい品番に注意し、運用する周波数帯で比較してください。
          </Tooltip>
        </div>
        <select
          id="cablePart"
          value={cableIndex}
          className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-950 focus:border-staf focus:outline-none focus:ring-2 focus:ring-staf/20"
          onChange={(event) => setCableIndex(Number(event.target.value))}
        >
          {cableAssemblies.map((item, index) => (
            <option key={item.partNumber} value={index}>
              {item.partNumber}（{item.description}・@2GHz ≈ {formatNumber(interpolateCableLoss(item.points, 2000), 2)}dB）
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label htmlFor="cableFreq" className="text-sm font-semibold text-slate-950">
              周波数（MHz）
            </label>
            <Tooltip term="周波数">
              損失を求めたい運用周波数をMHzで入力します。実測点は500〜8000MHzで、範囲外は線形外挿の参考値です。代表例: Wi-Fi 2.4GHz帯 → 2400、5GHz帯 → 5200。高周波ほど損失は増えます。
            </Tooltip>
          </div>
          <input
            id="cableFreq"
            type="number"
            min={1}
            step={10}
            value={Number.isFinite(frequencyMHz) ? frequencyMHz : ""}
            aria-invalid={!result}
            className="mt-2 h-11 w-full rounded-md border border-slate-300 px-3 text-base font-semibold text-slate-950 focus:border-staf focus:outline-none focus:ring-2 focus:ring-staf/20"
            onChange={(event) => setFrequencyMHz(event.target.value === "" ? Number.NaN : Number(event.target.value))}
          />
        </div>
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label htmlFor="cableQty" className="text-sm font-semibold text-slate-950">
              本数（直列に繋ぐ数）
            </label>
            <Tooltip term="本数">
              同じ品番を直列に何本つなぐかを整数（1以上）で入力します。合計損失 ＝ 1本あたり × 本数。延長や中継で複数本使う場合に本数分の損失が加算されます。通常は1です。
            </Tooltip>
          </div>
          <input
            id="cableQty"
            type="number"
            min={1}
            step={1}
            value={Number.isFinite(quantity) ? quantity : ""}
            aria-invalid={!result}
            className="mt-2 h-11 w-full rounded-md border border-slate-300 px-3 text-base font-semibold text-slate-950 focus:border-staf focus:outline-none focus:ring-2 focus:ring-staf/20"
            onChange={(event) => setQuantity(event.target.value === "" ? Number.NaN : Number(event.target.value))}
          />
        </div>
      </div>

      {result ? (
        <>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg bg-staf-light p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-semibold text-staf-dark">1本あたり損失</p>
                <Tooltip term="1本あたり損失">
                  選択品番のケーブル1本を、指定周波数で通したときの挿入損失（dB）。実測値を周波数で補間した目安で、個体差・コネクタ・曲げ・温度で変動します。グラフの黒点と同じ値です。
                </Tooltip>
              </div>
              <Stat className="mt-1" value={formatNumber(result.perPieceDb, 2)} unit="dB" tone="neutral" size="md" />
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs text-slate-500">合計損失（{Number.isFinite(quantity) ? quantity : 1}本）</p>
                <Tooltip term="合計損失">
                  1本あたり損失 × 本数の合計（dB）。この値をリンクバジェットの「ケーブル・コネクタ損失」に入力して使います。3dBで電力が半分、6dBで1/4になります。
                </Tooltip>
              </div>
              <Stat className="mt-1" value={formatNumber(result.totalDb, 2)} unit="dB" tone="staf" size="md" />
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs text-slate-500">アンテナに残る電力</p>
                <Tooltip term="残る電力">
                  合計損失を電力比に直した残存率 ＝ 10^(−合計損失 / 10) × 100。ケーブルで失われずアンテナへ届く割合（%）です。例: 3dB → 約50%、6dB → 約25%。
                </Tooltip>
              </div>
              <Stat className="mt-1" value={formatNumber(result.powerRemainingPercent, 0)} unit="%" tone="staf" size="md" />
            </div>
          </div>

          {outOfRange ? (
            <p className="mt-2 text-xs leading-relaxed text-amber-700">
              指定周波数が測定点の範囲（500〜8000MHz）の外側です。外挿による参考値としてご利用ください。
            </p>
          ) : null}

          <div className="mt-5">
            <CableLossCurveDiagram
              partNumber={cable.partNumber}
              points={cable.points}
              frequencyMHz={frequencyMHz}
              currentLossDb={result.perPieceDb}
              quantity={quantity}
              referenceCables={referenceCables}
            />
          </div>
        </>
      ) : (
        <p className="mt-4 text-sm font-medium text-rose-700">
          周波数は0より大きい値、本数は1以上で入力してください。
        </p>
      )}

      <div className="mt-5">
        <FormulaExplanationCard
          title="損失の見方を見る"
          formula={"合計損失[dB] = 1本あたり損失（実測の補間値） × 本数\n残る電力[%] = 10^(-損失/10) × 100"}
        >
          <p>
            数値はスタッフ標準品の実測挿入損失（S12, 100〜9000MHz）を、指定周波数で補間したものです。高周波ほど損失は増えます。3dBで電力は半分、6dBで1/4になります。複数本を直列に繋ぐ場合は本数を入れてください。実測値ですが、個体差・コネクタ品質・曲げ・温度で多少変わる目安です。
          </p>
        </FormulaExplanationCard>
      </div>
    </section>
  );
}
