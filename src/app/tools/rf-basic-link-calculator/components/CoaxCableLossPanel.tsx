"use client";

import { useMemo, useState } from "react";
import { coaxCables } from "@/data/coaxCables";
import { coaxCableLoss } from "@/lib/rf/coax";
import { formatNumber } from "@/lib/rf/format";
import { CoaxLossDiagram } from "./CoaxLossDiagram";
import { FormulaExplanationCard } from "./FormulaExplanationCard";

export function CoaxCableLossPanel() {
  const [cableIndex, setCableIndex] = useState(3); // RG-316
  const [lengthM, setLengthM] = useState(1);
  const [frequencyMHz, setFrequencyMHz] = useState(2400);
  const [connectorCount, setConnectorCount] = useState(2);

  const cable = coaxCables[cableIndex] ?? coaxCables[0];

  const result = useMemo(() => {
    try {
      return coaxCableLoss(cable.attAt2400, frequencyMHz, lengthM, connectorCount);
    } catch {
      return null;
    }
  }, [cable.attAt2400, frequencyMHz, lengthM, connectorCount]);

  return (
    <section className="flex flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-bold text-slate-950">同軸ケーブル損失（フィードライン損失）</h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        U.FLピッグテールやSMAケーブルなど、同軸フィードラインの損失をdBで見積もります。求めた合計を、リンクバジェットの「ケーブル・コネクタ損失」に入れて使えます。
      </p>

      <div className="mt-4">
        <label htmlFor="cableType" className="text-sm font-semibold text-slate-950">
          ケーブル種別
        </label>
        <select
          id="cableType"
          value={cableIndex}
          className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-950 focus:border-staf focus:outline-none focus:ring-2 focus:ring-staf/20"
          onChange={(event) => setCableIndex(Number(event.target.value))}
        >
          {coaxCables.map((item, index) => (
            <option key={item.label} value={index}>
              {item.label}（{item.note}・約{item.attAt2400}dB/m @2.4GHz）
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div>
          <label htmlFor="cableLength" className="text-sm font-semibold text-slate-950">
            ケーブル長（m）
          </label>
          <input
            id="cableLength"
            type="number"
            min={0.01}
            step={0.1}
            value={Number.isFinite(lengthM) ? lengthM : ""}
            aria-invalid={!result}
            className="mt-2 h-11 w-full rounded-md border border-slate-300 px-3 text-base font-semibold text-slate-950 focus:border-staf focus:outline-none focus:ring-2 focus:ring-staf/20"
            onChange={(event) => setLengthM(event.target.value === "" ? Number.NaN : Number(event.target.value))}
          />
        </div>
        <div>
          <label htmlFor="cableFreq" className="text-sm font-semibold text-slate-950">
            周波数（MHz）
          </label>
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
          <label htmlFor="connectorCount" className="text-sm font-semibold text-slate-950">
            コネクタ数
          </label>
          <input
            id="connectorCount"
            type="number"
            min={0}
            step={1}
            value={Number.isFinite(connectorCount) ? connectorCount : ""}
            aria-invalid={!result}
            className="mt-2 h-11 w-full rounded-md border border-slate-300 px-3 text-base font-semibold text-slate-950 focus:border-staf focus:outline-none focus:ring-2 focus:ring-staf/20"
            onChange={(event) => setConnectorCount(event.target.value === "" ? Number.NaN : Number(event.target.value))}
          />
        </div>
      </div>

      {result ? (
        <>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg bg-staf-light p-4">
              <p className="text-xs font-semibold text-staf">合計損失</p>
              <p className="mt-1 text-2xl font-bold text-slate-950">{formatNumber(result.totalDb, 2)} dB</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-xs text-slate-500">うちケーブル</p>
              <p className="mt-1 text-2xl font-bold text-staf">{formatNumber(result.cableDb, 2)} dB</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-xs text-slate-500">うちコネクタ</p>
              <p className="mt-1 text-2xl font-bold text-staf">{formatNumber(result.connectorDb, 2)} dB</p>
            </div>
          </div>

          <div className="mt-5">
            <CoaxLossDiagram
              lengthM={lengthM}
              totalDb={result.totalDb}
              perMeterDb={result.perMeterDb}
              powerRemainingPercent={result.powerRemainingPercent}
              connectorCount={connectorCount}
            />
          </div>
        </>
      ) : (
        <p className="mt-4 text-sm font-medium text-rose-700">
          ケーブル長・周波数は0より大きい値、コネクタ数は0以上で入力してください。
        </p>
      )}

      <div className="mt-5">
        <FormulaExplanationCard
          title="損失の考え方を見る"
          formula={"α(f)[dB/m] = α(2.4GHz) × √(f[MHz] / 2400)\n合計損失[dB] = α(f) × 長さ + コネクタ数 × 約0.15dB\n残る電力[%] = 10^(-損失/10) × 100"}
        >
          <p>
            同軸ケーブルの減衰は周波数が高いほど増え、表皮効果が支配的な範囲ではおおむね√fに比例します。細いケーブルほど、長いほど損失は大きくなります。IoT機器では市販の50Ω品（U.FL/SMA/RG系）を使うのが普通なので、ここでは種別を選ぶだけで目安が出ます。コネクタは1個あたり約0.15dBで概算しています。値はあくまで目安で、ケーブル個体・コネクタ品質・曲げ・温度で変わります。
          </p>
        </FormulaExplanationCard>
      </div>
    </section>
  );
}
