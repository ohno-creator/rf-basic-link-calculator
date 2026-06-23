"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/Card";
import { Stat } from "@/components/Stat";
import { Tooltip } from "@/components/Tooltip";
import { calculateFresnel } from "@/lib/rf/fresnel";
import { formatMeters, formatNumber } from "@/lib/rf/format";
import { FormulaExplanationCard } from "./FormulaExplanationCard";
import { FresnelZoneDiagram } from "./FresnelZoneDiagram";

export function FresnelZonePanel() {
  const [frequencyMHz, setFrequencyMHz] = useState(2400);
  const [distanceKm, setDistanceKm] = useState(1);
  const [positionPercent, setPositionPercent] = useState(50);

  const result = useMemo(() => {
    try {
      return calculateFresnel(frequencyMHz, distanceKm, positionPercent / 100);
    } catch {
      return null;
    }
  }, [frequencyMHz, distanceKm, positionPercent]);

  // 楕円の縦スケール用に、中央（最大）の半径も求めておく。
  const midRadiusM = useMemo(() => {
    try {
      return calculateFresnel(frequencyMHz, distanceKm, 0.5).firstZoneRadiusM;
    } catch {
      return null;
    }
  }, [frequencyMHz, distanceKm]);

  return (
    <Card as="section" padding="lg" className="flex flex-col">
      <h3 className="text-lg font-bold text-slate-950">フレネルゾーン半径</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        見通し通信で「どれだけ障害物を空けるべきか」の目安になる、第1フレネルゾーンの半径を計算します。
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label htmlFor="fresnelFreq" className="text-sm font-semibold text-slate-950">
              周波数 MHz
            </label>
            <Tooltip term="周波数">
              電波の周波数です。高いほどフレネルゾーン半径は小さくなります（半径は波長の平方根に比例）。代表値: 920MHz=LPWA、2400MHz=Wi-Fi/BLE、5800MHz。MHz単位で入力してください。
            </Tooltip>
          </div>
          <input
            id="fresnelFreq"
            type="number"
            min={1}
            step={1}
            value={Number.isFinite(frequencyMHz) ? frequencyMHz : ""}
            aria-invalid={!result}
            className="mt-2 h-11 w-full rounded-md border border-slate-300 px-3 text-base font-semibold text-slate-950 focus:border-staf focus:outline-none focus:ring-2 focus:ring-staf/20"
            onChange={(event) => setFrequencyMHz(event.target.value === "" ? Number.NaN : Number(event.target.value))}
          />
        </div>
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label htmlFor="fresnelDist" className="text-sm font-semibold text-slate-950">
              通信距離 km
            </label>
            <Tooltip term="距離">
              送信点と受信点の直線距離です。長いほどゾーン半径は大きくなります（経路の中央で最大）。屋内は0.01〜0.1km、屋外の見通しは数km程度が目安です。km単位で入力してください。
            </Tooltip>
          </div>
          <input
            id="fresnelDist"
            type="number"
            min={0.001}
            step={0.1}
            value={Number.isFinite(distanceKm) ? distanceKm : ""}
            aria-invalid={!result}
            className="mt-2 h-11 w-full rounded-md border border-slate-300 px-3 text-base font-semibold text-slate-950 focus:border-staf focus:outline-none focus:ring-2 focus:ring-staf/20"
            onChange={(event) => setDistanceKm(event.target.value === "" ? Number.NaN : Number(event.target.value))}
          />
        </div>
      </div>

      <div className="mt-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <label htmlFor="fresnelPos" className="text-sm font-semibold text-slate-950">
              障害物の位置
            </label>
            <Tooltip term="障害物の位置">
              障害物がある地点を送信側からの割合で指定します。50%（中央）でゾーン半径が最大、両端ほど小さくなります。5〜95%の範囲で指定できます。
            </Tooltip>
          </div>
          <span className="text-sm font-semibold text-staf-dark">送信側から {positionPercent}%</span>
        </div>
        <input
          id="fresnelPos"
          type="range"
          min={5}
          max={95}
          step={1}
          value={positionPercent}
          className="mt-3 w-full"
          aria-label="障害物の位置"
          onChange={(event) => setPositionPercent(Number(event.target.value))}
        />
      </div>

      {result ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg bg-staf-light p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-semibold text-staf-dark">第1フレネルゾーン半径</p>
              <Tooltip term="r1">
                その地点での第1フレネルゾーンの半径です。電波が通る楕円体の太さの半分にあたり、この範囲に障害物が入ると損失が増えます。見通し通信では半径の60%以上を障害物から空けるのが目安です。
              </Tooltip>
            </div>
            <Stat className="mt-1" value={formatMeters(result.firstZoneRadiusM)} tone="neutral" size="md" />
          </div>
          <div className="rounded-lg bg-slate-50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-slate-500">60%クリアランス</p>
              <Tooltip term="60%クリアランス">
                第1フレネルゾーン半径(r1)の60%です。見通し通信では、この高さ以上を障害物から空けておけば回り込みによる損失をほぼ無視できる、という実務上の目安（≧60%が判断基準）です。
              </Tooltip>
            </div>
            <Stat className="mt-1" value={formatMeters(result.clearance60M)} tone="staf" size="md" />
          </div>
          <div className="rounded-lg bg-slate-50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-slate-500">波長</p>
              <Tooltip term="波長">
                周波数に対応する電波の波長(λ=c/f)です。フレネルゾーン半径はλの平方根に比例します。周波数が高いほど波長は短く、ゾーン半径も小さくなります。
              </Tooltip>
            </div>
            <Stat className="mt-1" value={formatNumber(result.wavelengthM, 3)} unit="m" tone="staf" size="md" />
          </div>
        </div>
      ) : (
        <p className="mt-4 text-sm font-medium text-rose-700">
          周波数と距離は0より大きい値を入力してください。
        </p>
      )}

      {result && midRadiusM !== null ? (
        <div className="mt-5">
          <FresnelZoneDiagram
            midRadiusM={midRadiusM}
            positionRatio={positionPercent / 100}
            firstZoneRadiusM={result.firstZoneRadiusM}
            clearance60M={result.clearance60M}
          />
        </div>
      ) : null}

      <div className="mt-5">
        <FormulaExplanationCard
          title="フレネルゾーンの意味を見る"
          formula={"r1 = √( λ × d1 × d2 / (d1 + d2) )"}
        >
          <p>
            電波は直線だけでなく、その周囲の楕円体（フレネルゾーン）を通って伝わります。第1フレネルゾーンの60%以上を障害物から空けると、回り込みによる損失を抑えられます。建物や樹木が半径内に入る場合は、アンテナ高や経路の見直しを検討してください。
          </p>
        </FormulaExplanationCard>
      </div>
    </Card>
  );
}
