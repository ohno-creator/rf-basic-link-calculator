"use client";

import { useMemo, useState } from "react";
import { Stat } from "@/components/Stat";
import { Tooltip } from "@/components/Tooltip";
import { glossary } from "@/data/glossary";
import { dbmToMw, mwToDbm, mwToW, wToDbm, wToMw } from "@/lib/rf/db";
import { FormulaExplanationCard } from "./FormulaExplanationCard";
import { DecibelScaleVisual } from "./DecibelScaleVisual";

type Mode = "dbm" | "mw" | "w";

/** 値の桁に応じて有効数字で表示し、極大・極小値の丸めや桁あふれを防ぐ。 */
function formatPower(value: number): string {
  if (!Number.isFinite(value)) {
    return "—";
  }
  if (value === 0) {
    return "0";
  }
  const abs = Math.abs(value);
  // 極端に大きい/小さい値は指数表記でつぶれを防ぐ。
  if (abs !== 0 && (abs >= 1e6 || abs < 1e-4)) {
    return value.toExponential(3);
  }
  // 通常域は有効数字4桁。末尾の不要な0を落とす。
  return Number.parseFloat(value.toPrecision(4)).toString();
}

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

  // 単位を切り替えたら、現在の物理量を保ったまま新単位の数値に換算する。
  // 例: 20dBm → mW切替なら value を 100mW にする。
  const handleModeChange = (nextMode: Mode) => {
    if (nextMode === mode) {
      return;
    }

    try {
      // 現在の入力を一旦 mW（共通の物理量）に変換する。
      let mw: number;
      if (mode === "dbm") {
        mw = dbmToMw(value);
      } else if (mode === "mw") {
        mw = value;
      } else {
        mw = wToMw(value);
      }

      // 共通の mW から新単位の数値へ換算する。
      let nextValue: number;
      if (nextMode === "dbm") {
        nextValue = mwToDbm(mw);
      } else if (nextMode === "mw") {
        nextValue = mw;
      } else {
        nextValue = mwToW(mw);
      }

      // 表示桁の都合で過剰な桁が出ないように丸める。
      setValue(Number.parseFloat(nextValue.toPrecision(6)));
    } catch {
      // 換算できない入力（空欄など）はそのまま値を保持する。
    }

    setMode(nextMode);
  };

  const errorMessage =
    mode === "dbm"
      ? "数値を入力してください。"
      : "0より大きい値を入力してください。";

  return (
    <section className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-card">
        <h2 className="text-xl font-bold text-slate-950">dBm / mW / W 変換</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          どれか1つを入力すると、他の単位へ自動変換します。
        </p>

        <div className="mt-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label htmlFor="dbInput" className="text-sm font-semibold text-slate-950">
              入力値
            </label>
            <Tooltip term={glossary.dbm.term}>
              1mWを基準にした電力の対数単位です。0dBm=1mW、20dBm=100mW。リンクバジェットの基本単位で、利得・損失をdBで加減算できます。
            </Tooltip>
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
            <div className="flex items-center gap-1.5">
              <select
                value={mode}
                aria-label="単位選択"
                className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-950 focus:border-staf focus:outline-none focus:ring-2 focus:ring-staf/20"
                onChange={(event) => handleModeChange(event.target.value as Mode)}
              >
                <option value="dbm">dBm</option>
                <option value="mw">mW</option>
                <option value="w">W</option>
              </select>
              <Tooltip term="単位">
                入力値の単位を選びます。選んだ単位として数値が解釈され、他の2単位へ自動換算されます。単位を切り替えると、入力値は物理量を保ったまま新しい単位へ換算されます。送信出力なら通常dBmかmWを使用します。
              </Tooltip>
            </div>
          </div>
          {!result ? (
            <p className="mt-2 text-sm font-medium text-rose-700">{errorMessage}</p>
          ) : null}
        </div>

        {result ? (
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-1">
                <p className="text-xs text-slate-500">dBm</p>
                <Tooltip term="dBm換算">
                  入力値を換算した電力（dBm）。+10dBごとに10倍、+3dBで約2倍になります。0dBm=1mWが基準です。
                </Tooltip>
              </div>
              <Stat className="mt-1" value={formatPower(result.dbm)} tone="staf" size="md" />
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-1">
                <p className="text-xs text-slate-500">mW</p>
                <Tooltip term="mW換算">
                  入力値をミリワット換算した電力です。0dBm=1mW、20dBm=100mW。小電力IoT機器の出力表記でよく使います。
                </Tooltip>
              </div>
              <Stat className="mt-1" value={formatPower(result.mw)} tone="staf" size="md" />
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-1">
                <p className="text-xs text-slate-500">W</p>
                <Tooltip term="W換算">
                  入力値をワット換算した電力です。1W=30dBm=1000mW。比較的大出力の送信機の表記に使います。
                </Tooltip>
              </div>
              <Stat className="mt-1" value={formatPower(result.w)} tone="staf" size="md" />
            </div>
          </div>
        ) : null}

        <div className="mt-5">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-slate-950">早見表</h3>
            <Tooltip term="早見表">
              代表的な対応関係の早見です。+10dBで10倍、+3dBで約2倍、-10dBで1/10という対数の感覚をつかむ目安にしてください。
            </Tooltip>
          </div>
          <div className="mt-2 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
            <p>0dBm = 1mW</p>
            <p>10dBm = 10mW</p>
            <p>20dBm = 100mW</p>
            <p>30dBm = 1W</p>
            <p>+3dB は約2倍</p>
            <p>-10dB は1/10</p>
          </div>
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
      <DecibelScaleVisual currentDbm={result ? result.dbm : null} />
    </section>
  );
}
