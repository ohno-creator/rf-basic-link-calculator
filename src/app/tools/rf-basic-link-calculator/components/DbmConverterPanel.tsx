"use client";

import { useMemo, useState } from "react";
import { Tooltip } from "@/components/Tooltip";
import { glossary } from "@/data/glossary";
import { dbmToMw, mwToDbm, mwToW, wToDbm, wToMw } from "@/lib/rf/db";
import { FormulaExplanationCard } from "./FormulaExplanationCard";
import { DecibelScaleVisual } from "./DecibelScaleVisual";

type Mode = "dbm" | "mw" | "w";

export function DbmConverterPanel() {
  const [mode, setMode] = useState<Mode>("dbm");
  const [value, setValue] = useState(20);

  const result = useMemo(() => {
    try {
      if (mode === "dbm") {
        const mw = dbmToMw(value);
        return { dbm: value, mw, w: mwToW(mw) };
      }
      if (mode === "mw") {
        const dbm = mwToDbm(value);
        return { dbm, mw: value, w: mwToW(value) };
      }
      const mw = wToMw(value);
      return { dbm: wToDbm(value), mw, w: value };
    } catch {
      return null;
    }
  }, [mode, value]);

  return (
    <section className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-bold text-slate-950">dBm / mW / W 変換</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          どれか1つを入力すると、他の単位へ自動変換します。
        </p>

        <div className="mt-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label htmlFor="dbInput" className="text-sm font-semibold text-slate-950">
              入力値
            </label>
            <Tooltip term={glossary.dbm.term}>{glossary.dbm.description}</Tooltip>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_120px]">
            <input
              id="dbInput"
              type="number"
              step={mode === "dbm" ? 0.5 : 0.001}
              min={mode === "dbm" ? undefined : 0.000001}
              value={Number.isFinite(value) ? value : ""}
              className="h-11 rounded-md border border-slate-300 px-3 text-base font-semibold text-slate-950 focus:border-staf focus:outline-none focus:ring-2 focus:ring-staf/20"
              onChange={(event) => setValue(event.target.value === "" ? Number.NaN : Number(event.target.value))}
              aria-invalid={!result}
            />
            <select
              value={mode}
              className="h-11 rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-950 focus:border-staf focus:outline-none focus:ring-2 focus:ring-staf/20"
              onChange={(event) => setMode(event.target.value as Mode)}
            >
              <option value="dbm">dBm</option>
              <option value="mw">mW</option>
              <option value="w">W</option>
            </select>
          </div>
          {!result ? (
            <p className="mt-2 text-sm font-medium text-rose-700">
              mWやWは0より大きい値を入力してください。
            </p>
          ) : null}
        </div>

        {result ? (
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-xs text-slate-500">dBm</p>
              <p className="mt-1 text-2xl font-bold text-staf">{result.dbm.toFixed(1)}</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-xs text-slate-500">mW</p>
              <p className="mt-1 text-2xl font-bold text-staf">{result.mw.toFixed(3)}</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-xs text-slate-500">W</p>
              <p className="mt-1 text-2xl font-bold text-staf">{result.w.toFixed(6)}</p>
            </div>
          </div>
        ) : null}

        <div className="mt-5 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
          <p>0dBm = 1mW</p>
          <p>10dBm = 10mW</p>
          <p>20dBm = 100mW</p>
          <p>30dBm = 1W</p>
          <p>+3dB は約2倍</p>
          <p>-10dB は1/10</p>
        </div>

        <div className="mt-5">
          <FormulaExplanationCard
            title="dB/dBm/dBiの違いを見る"
            formula={"mW = 10 ^ (dBm / 10)\ndBm = 10 × log10(mW)\nW = mW / 1000"}
          >
            <p>
              dBmは電力そのもの、dBは比率や損失、dBiはアンテナ利得の単位です。リンクバジェットではこれらを足し算・引き算で扱います。
            </p>
          </FormulaExplanationCard>
        </div>
      </div>
      <DecibelScaleVisual />
    </section>
  );
}
