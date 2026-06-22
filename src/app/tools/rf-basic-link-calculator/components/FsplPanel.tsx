"use client";

import { useMemo, useState } from "react";
import { Tooltip } from "@/components/Tooltip";
import { glossary } from "@/data/glossary";
import { calculateFsplDb } from "@/lib/rf/fspl";
import { formatDb } from "@/lib/rf/format";
import { FormulaExplanationCard } from "./FormulaExplanationCard";

export function FsplPanel() {
  const [frequencyMHz, setFrequencyMHz] = useState(920);
  const [distance, setDistance] = useState(1);
  const [distanceUnit, setDistanceUnit] = useState<"m" | "km">("km");
  const distanceKm = distanceUnit === "m" ? distance / 1000 : distance;

  const result = useMemo(() => {
    try {
      const fspl = calculateFsplDb(frequencyMHz, distanceKm);
      // FSPLが負になるのは、遠方界前提のFSPL式が崩れる極端な近距離・低周波の領域。
      // 非物理な負の損失は表示せず、無効（注記表示）として扱う。
      return fspl >= 0 ? fspl : null;
    } catch {
      return null;
    }
  }, [frequencyMHz, distanceKm]);

  const sampleDistances = useMemo(() => {
    return [0.01, 0.1, 1, 10].map((distanceValue) => {
      try {
        const fspl = calculateFsplDb(frequencyMHz, distanceValue);
        return { distance: distanceValue, fspl: fspl >= 0 ? fspl : Number.NaN };
      } catch {
        return { distance: distanceValue, fspl: Number.NaN };
      }
    });
  }, [frequencyMHz]);

  // バー幅は固定の dB レンジ（60〜140dB）で正規化し、定量比較できるようにする。
  const FSPL_BAR_MIN_DB = 60;
  const FSPL_BAR_MAX_DB = 140;
  const barWidthPercent = (fspl: number) => {
    if (!Number.isFinite(fspl)) {
      return 0;
    }
    const ratio = (fspl - FSPL_BAR_MIN_DB) / (FSPL_BAR_MAX_DB - FSPL_BAR_MIN_DB);
    return Math.min(100, Math.max(2, ratio * 100));
  };

  return (
    <section className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-bold text-slate-950">自由空間損失 FSPL 計算</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          障害物や反射がない理想的な空間で、距離により電波が弱くなる量を計算します。
        </p>

        <div className="mt-5 space-y-4">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label htmlFor="fsplFrequency" className="text-sm font-semibold text-slate-950">
                周波数 MHz
              </label>
              <Tooltip term={glossary.fspl.term}>{glossary.fspl.description}</Tooltip>
            </div>
            <input
              id="fsplFrequency"
              type="number"
              min={1}
              step={1}
              value={Number.isFinite(frequencyMHz) ? frequencyMHz : ""}
              className="mt-3 h-11 w-full rounded-md border border-slate-300 px-3 text-base font-semibold text-slate-950 focus:border-staf focus:outline-none focus:ring-2 focus:ring-staf/20"
              onChange={(event) => setFrequencyMHz(event.target.value === "" ? Number.NaN : Number(event.target.value))}
              aria-invalid={!result}
            />
          </div>

          <div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label htmlFor="fsplDistance" className="text-sm font-semibold text-slate-950">
                距離
              </label>
              <Tooltip term="距離">
                送受信間の直線距離です。右の単位で解釈します。屋内は数m〜数十m、屋外の見通しは数百m〜数km程度が目安です。例: 1km。
              </Tooltip>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_120px]">
              <input
                id="fsplDistance"
                type="number"
                min={distanceUnit === "m" ? 1 : 0.001}
                step={distanceUnit === "m" ? 1 : 0.01}
                value={Number.isFinite(distance) ? distance : ""}
                className="h-11 rounded-md border border-slate-300 px-3 text-base font-semibold text-slate-950 focus:border-staf focus:outline-none focus:ring-2 focus:ring-staf/20"
                onChange={(event) => setDistance(event.target.value === "" ? Number.NaN : Number(event.target.value))}
                aria-invalid={!result}
              />
              <div className="flex items-center gap-2">
                <select
                  aria-label="距離の単位"
                  value={distanceUnit}
                  className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-950 focus:border-staf focus:outline-none focus:ring-2 focus:ring-staf/20"
                  onChange={(event) => setDistanceUnit(event.target.value as "m" | "km")}
                >
                  <option value="m">m（屋内・近距離 / 1m刻み）</option>
                  <option value="km">km（屋外・見通し / 0.01km刻み）</option>
                </select>
                <Tooltip term="単位">
                  距離の単位を切り替えます。m=屋内・近距離向け（1〜数百mを1m刻みで検討）、km=屋外・見通し向け（0.001km=1mから0.01km刻み）。選択で入力値の意味と最小刻みが変わります。
                </Tooltip>
              </div>
            </div>
          </div>
        </div>

        {result ? (
          <div className="mt-5 rounded-lg bg-staf-light p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-staf-dark">自由空間損失</p>
              <Tooltip term="この値">
                理想空間での距離による減衰量[dB]です。実環境では壁・人体・マルチパス等で更に増えます。値が大きいほど電波は届きにくくなります。
              </Tooltip>
            </div>
            <p className="mt-1 text-4xl font-bold text-slate-950">{formatDb(result)}</p>
          </div>
        ) : (
          <p className="mt-4 text-sm font-medium text-rose-700">
            周波数・距離は0より大きい値を入力してください。距離が波長に対して極端に短い（近距離×低周波）組み合わせでは、遠方界を前提とする自由空間損失の式が成立しません。
          </p>
        )}

        <div className="mt-5">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm font-semibold text-slate-950">計算式の確認</span>
            <Tooltip term="意味を見る">
              FSPL=32.44+20log10(距離km)+20log10(周波数MHz)の式と前提（理想空間）を表示します。壁・人体などの実環境補正は別途必要です。
            </Tooltip>
          </div>
          <FormulaExplanationCard
            title="自由空間損失の意味を見る"
            formula="FSPL[dB] = 32.44 + 20log10(距離[km]) + 20log10(周波数[MHz])"
          >
            <p>
              自由空間損失は理想環境での損失です。実際の環境では、壁、床、金属、人体、筐体、ノイズ、マルチパスの影響が加わります。
            </p>
          </FormulaExplanationCard>
        </div>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-base font-semibold text-slate-950">FSPL Visual</h3>
        <div className="mt-4 rounded-lg bg-slate-50 p-5 text-center text-sm text-slate-700">
          <div className="flex items-center justify-between gap-2">
            <p className="text-left font-semibold">送信機 ● ))) ))) ))) ))) 受信機</p>
            <Tooltip term="概念図">
              距離が伸びると電波が球面状に広がり、受信点での密度が下がるため損失が増える、という定性的な説明です。入力値には連動しない固定の概念図です。
            </Tooltip>
          </div>
          <div className="mt-4 grid gap-2 text-left sm:grid-cols-4">
            {["距離が伸びる", "電波が広がる", "受信点で小さくなる", "損失が大きくなる"].map((item) => (
              <div key={item} className="rounded-md bg-white p-3 text-center shadow-sm">
                {item}
              </div>
            ))}
          </div>
          <p className="mt-3 text-left text-xs text-slate-500">
            ※ この概念図は仕組みを示す固定の模式図です。入力値に応じて変化する数値は下のサンプルをご覧ください。
          </p>
        </div>

        <div className="mt-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="text-sm font-semibold text-slate-950">代表距離での損失（現在の周波数）</h4>
            <Tooltip term="サンプル距離">
              現在の周波数での代表距離4点の損失です。距離が10倍になると損失は約20dB増えます。バーは固定の基準（60〜140dB）で正規化した相対比較用で、入力距離とは独立しています。
            </Tooltip>
          </div>

          {Number.isFinite(frequencyMHz) ? (
            <>
              <div className="mt-4 space-y-3">
                {sampleDistances.map((item) => {
                  const isCurrent =
                    Number.isFinite(distanceKm) &&
                    Math.abs(distanceKm - item.distance) < item.distance * 0.001;
                  return (
                    <div
                      key={item.distance}
                      className={`grid grid-cols-[80px_1fr_80px] items-center gap-3 rounded-md px-2 py-1 text-sm ${
                        isCurrent ? "bg-staf-light ring-1 ring-staf/40" : ""
                      }`}
                    >
                      <span className={isCurrent ? "font-semibold text-staf-dark" : "text-slate-600"}>
                        {item.distance < 1 ? `${item.distance * 1000}m` : `${item.distance}km`}
                      </span>
                      <div className="h-3 rounded-full bg-slate-100">
                        <div
                          className="h-3 rounded-full bg-staf"
                          style={{ width: `${barWidthPercent(item.fspl)}%` }}
                        />
                      </div>
                      <span className="text-right font-semibold text-slate-900">
                        {Number.isFinite(item.fspl) ? formatDb(item.fspl, 0) : "-"}
                      </span>
                    </div>
                  );
                })}
              </div>

              {result && Number.isFinite(distanceKm) ? (
                <div className="mt-4 grid grid-cols-[80px_1fr_80px] items-center gap-3 rounded-md border border-staf/40 bg-staf-light px-2 py-2 text-sm">
                  <span className="font-semibold text-staf-dark">入力距離</span>
                  <div className="h-3 rounded-full bg-white/70">
                    <div
                      className="h-3 rounded-full bg-staf-dark"
                      style={{ width: `${barWidthPercent(result)}%` }}
                    />
                  </div>
                  <span className="text-right font-bold text-slate-950">{formatDb(result, 0)}</span>
                </div>
              ) : null}

              <p className="mt-3 text-xs text-slate-500">
                バー幅は損失60〜140dBを0〜100%に正規化した相対表示です。上のサンプルは固定基準で、
                <span className="font-semibold text-staf-dark">入力距離</span>の行があなたの条件の損失です。
              </p>
            </>
          ) : (
            <p className="mt-4 rounded-md bg-slate-50 p-4 text-sm text-slate-500">
              周波数を入力するとサンプル距離の損失が表示されます。
            </p>
          )}
        </div>
      </section>
    </section>
  );
}
