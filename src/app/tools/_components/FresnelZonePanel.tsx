"use client";

import { useMemo, useState } from "react";
import { Callout, type CalloutTone } from "@/components/Callout";
import { Card } from "@/components/Card";
import { Field } from "@/components/Field";
import { MetricCard } from "@/components/MetricCard";
import { Tooltip } from "@/components/Tooltip";
import {
  fresnelFrequencyPresets,
  fresnelObstaclePresets,
  type ObstacleKind
} from "@/data/fresnelPresets";
import { analyzeObstacle, calculateFresnel, type ObstacleVerdict } from "@/lib/rf/fresnel";
import { formatMeters, formatNumber } from "@/lib/rf/format";
import { FormulaExplanationCard } from "./FormulaExplanationCard";
import { FresnelZoneDiagram } from "./FresnelZoneDiagram";

const VERDICT_META: Record<ObstacleVerdict, { tone: CalloutTone; label: string; lead: string }> = {
  clear: {
    tone: "success",
    label: "良好",
    lead: "障害物は第1フレネルゾーンの60%より下で、回り込み損失はほぼ無視できます。"
  },
  caution: {
    tone: "caution",
    label: "注意",
    lead: "障害物が第1フレネルゾーンに食い込んでいます。見通しはあっても損失が増えます。"
  },
  blocked: {
    tone: "danger",
    label: "遮断",
    lead: "障害物が見通し線(LOS)を越えています。回折損失が大きく、通信が不安定になりやすい状態です。"
  }
};

export function FresnelZonePanel() {
  const [frequencyMHz, setFrequencyMHz] = useState(2400);
  const [distanceKm, setDistanceKm] = useState(0.1);
  const [positionPercent, setPositionPercent] = useState(50);
  const [txHeightM, setTxHeightM] = useState(3);
  const [rxHeightM, setRxHeightM] = useState(2);
  const [obstacleId, setObstacleId] = useState("car-sedan");
  const [obstacleHeightM, setObstacleHeightM] = useState(1.5);

  const selectedObstacle = fresnelObstaclePresets.find((item) => item.id === obstacleId);
  const obstacleKind: ObstacleKind = selectedObstacle?.kind ?? "car";

  const result = useMemo(() => {
    try {
      return calculateFresnel(frequencyMHz, distanceKm, positionPercent / 100);
    } catch {
      return null;
    }
  }, [frequencyMHz, distanceKm, positionPercent]);

  const midRadiusM = useMemo(() => {
    try {
      return calculateFresnel(frequencyMHz, distanceKm, 0.5).firstZoneRadiusM;
    } catch {
      return null;
    }
  }, [frequencyMHz, distanceKm]);

  const analysis = useMemo(() => {
    try {
      return analyzeObstacle(
        frequencyMHz,
        distanceKm,
        positionPercent / 100,
        txHeightM,
        rxHeightM,
        obstacleHeightM
      );
    } catch {
      return null;
    }
  }, [frequencyMHz, distanceKm, positionPercent, txHeightM, rxHeightM, obstacleHeightM]);

  const applyFrequencyPreset = (preset: (typeof fresnelFrequencyPresets)[number]) => {
    setFrequencyMHz(preset.frequencyMHz);
    setDistanceKm(preset.distanceKm);
    setTxHeightM(preset.txHeightM);
    setRxHeightM(preset.rxHeightM);
  };

  const applyObstaclePreset = (preset: (typeof fresnelObstaclePresets)[number]) => {
    setObstacleId(preset.id);
    setObstacleHeightM(preset.heightM);
  };

  const activeFrequencyPreset = fresnelFrequencyPresets.find(
    (preset) => preset.frequencyMHz === frequencyMHz && preset.distanceKm === distanceKm
  );

  return (
    <Card as="section" padding="lg" className="flex flex-col">
      <h3 className="text-lg font-bold text-slate-950">フレネルゾーン半径と障害物チェック</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        見通し通信で「どれだけ障害物を空けるべきか」の目安になる第1フレネルゾーン半径を計算し、送受間に置いた障害物（車・建物・木・人・丘）が電波を遮るかどうかを判定します。
      </p>

      {/* 無線プリセット */}
      <div className="mt-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-950">無線プリセット</span>
          <Tooltip term="プリセット">
            代表的な無線方式の周波数・距離・アンテナ高をまとめて設定します。各プリセットの前提条件は選択後に下へ表示します。
          </Tooltip>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {fresnelFrequencyPresets.map((preset) => {
            const active = activeFrequencyPreset?.id === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyFrequencyPreset(preset)}
                aria-pressed={active}
                className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                  active
                    ? "border-staf bg-staf text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-staf/40 hover:text-staf-dark"
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
        {activeFrequencyPreset ? (
          <p className="mt-2 text-xs leading-relaxed text-slate-500">
            <span className="font-semibold text-slate-600">前提：</span>
            {activeFrequencyPreset.note}
          </p>
        ) : null}
      </div>

      {/* 基本入力 */}
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Field
          id="fresnelFreq"
          label="周波数"
          unit="MHz"
          help="電波の周波数です。高いほどフレネルゾーン半径は小さくなります（半径は波長の平方根に比例）。MHz単位で入力してください。"
          value={frequencyMHz}
          min={1}
          step={1}
          onChange={setFrequencyMHz}
          emptyBehavior="invalid"
        />
        <Field
          id="fresnelDist"
          label="通信距離"
          unit="km"
          help="送信点と受信点の直線距離です。長いほどゾーン半径は大きくなります（経路の中央で最大）。km単位で入力してください。"
          value={distanceKm}
          min={0.001}
          step={0.05}
          onChange={setDistanceKm}
          emptyBehavior="invalid"
        />
        <Field
          id="fresnelTxH"
          label="送信アンテナ高"
          unit="m"
          help="送信アンテナの地上高です。受信側との高さで見通し線(LOS)の傾きが決まり、障害物が遮るかの判定に使います。"
          value={txHeightM}
          min={0}
          step={0.5}
          onChange={setTxHeightM}
          emptyBehavior="invalid"
        />
        <Field
          id="fresnelRxH"
          label="受信アンテナ高"
          unit="m"
          help="受信アンテナの地上高です。低いほどLOSが下がり、障害物に遮られやすくなります。"
          value={rxHeightM}
          min={0}
          step={0.5}
          onChange={setRxHeightM}
          emptyBehavior="invalid"
        />
      </div>

      {/* 障害物 */}
      <div className="mt-5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-950">送受間に置く障害物</span>
          <Tooltip term="障害物">
            経路上に置く物体を選びます。代表的な高さを自動入力しますが、下の「障害物の高さ」で微調整できます。前提条件は選択後に表示します。
          </Tooltip>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {fresnelObstaclePresets.map((preset) => {
            const active = obstacleId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyObstaclePreset(preset)}
                aria-pressed={active}
                className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                  active
                    ? "border-staf bg-staf text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-staf/40 hover:text-staf-dark"
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
        {selectedObstacle ? (
          <p className="mt-2 text-xs leading-relaxed text-slate-500">
            <span className="font-semibold text-slate-600">前提：</span>
            {selectedObstacle.note}
          </p>
        ) : null}
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <Field
          id="fresnelObsH"
          label="障害物の高さ"
          unit="m"
          help="障害物の地上高です。プリセット選択で代表値が入りますが、現場に合わせて変更できます。"
          value={obstacleHeightM}
          min={0}
          step={0.1}
          onChange={setObstacleHeightM}
          emptyBehavior="invalid"
        />
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <label htmlFor="fresnelPos" className="text-sm font-semibold text-slate-950">
                障害物の位置
              </label>
              <Tooltip term="障害物の位置">
                障害物がある地点を送信側からの割合で指定します。50%（中央）でゾーン半径が最大、両端ほど小さくなります。
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
      </div>

      {/* 障害物の判定 */}
      {analysis ? (
        <Callout
          tone={VERDICT_META[analysis.verdict].tone}
          size="md"
          className="mt-4"
          title={`判定：${VERDICT_META[analysis.verdict].label}（回折損失の目安 ${formatNumber(analysis.diffractionLossDb, 1)} dB）`}
        >
          <p className="mt-1">{VERDICT_META[analysis.verdict].lead}</p>
          <p className="mt-2 text-xs">
            この位置の見通し線(LOS)高 {formatMeters(analysis.losHeightM)} − 障害物高 {formatMeters(analysis.obstacleHeightM)} ＝ クリアランス
            <span className="font-bold"> {formatMeters(analysis.clearanceM)}</span>
            （第1フレネル半径 {formatMeters(analysis.firstZoneRadiusM)} の {formatNumber(analysis.clearanceRatio * 100, 0)}%）。
            目安は60%以上の確保です。
          </p>
        </Callout>
      ) : (
        <p className="mt-4 text-sm font-medium text-rose-700">
          周波数・距離は0より大きい値、アンテナ高・障害物高は0以上を入力してください。
        </p>
      )}

      {/* 主要な数値 */}
      {result ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <MetricCard
            label="この位置の第1フレネル半径"
            value={formatMeters(result.firstZoneRadiusM)}
            hint="障害物位置での第1フレネルゾーンの半径です。この60%以上を障害物から空けるのが目安です。"
          />
          <MetricCard
            label="60%クリアランス目安"
            value={formatMeters(result.clearance60M)}
            hint="第1フレネル半径の60%。見通し通信でこの高さ以上を空けると回り込み損失をほぼ無視できる、という実務則です。"
          />
          <MetricCard
            label="波長 λ"
            value={formatNumber(result.wavelengthM, 3)}
            unit="m"
            hint="周波数に対応する波長(λ=c/f)です。フレネル半径はλの平方根に比例します。"
          />
        </div>
      ) : null}

      {/* 断面図 */}
      <div className="mt-5">
        {result && analysis && midRadiusM ? (
          <FresnelZoneDiagram
            midRadiusM={midRadiusM}
            positionRatio={positionPercent / 100}
            txHeightM={txHeightM}
            rxHeightM={rxHeightM}
            obstacleKind={obstacleKind}
            obstacleHeightM={obstacleHeightM}
            obstacleLabel={selectedObstacle?.label ?? "障害物"}
            analysis={analysis}
          />
        ) : null}
      </div>

      <div className="mt-5">
        <FormulaExplanationCard
          title="計算式・判定のしくみを見る"
          formula={"r1[m] = √( λ × d1 × d2 / (d1 + d2) )\nクリアランス = LOS高 − 障害物高\n回折パラメータ v = -(クリアランス / r1) × √2\n回折損失 ≈ 6.9 + 20log10( √((v-0.1)²+1) + v - 0.1 )  [v>-0.78]"}
        >
          <p>
            電波は直線ではなく楕円体（フレネルゾーン）を通ります。障害物がこの楕円に食い込むほど損失が増えます。
            「60%クリアランス確保」は回折パラメータ v≈-0.85（損失ほぼ0dB）に対応し、フレネルの実務則とナイフエッジ回折モデルが一致します。
            v=0（障害物がLOSと同じ高さ）で約6dB、さらに上回ると急増します。
          </p>
        </FormulaExplanationCard>
      </div>
    </Card>
  );
}
