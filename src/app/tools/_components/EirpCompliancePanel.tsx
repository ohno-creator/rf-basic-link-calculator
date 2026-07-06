"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { Callout } from "@/components/Callout";
import { Card } from "@/components/Card";
import { ChartFrame } from "@/components/ChartFrame";
import { Field } from "@/components/Field";
import { MetricCard } from "@/components/MetricCard";
import { MobileResultBar } from "@/components/MobileResultBar";
import { ResultBar } from "@/components/ResultBar";
import { chartTheme } from "@/lib/chartTheme";
import { diagramPalette } from "@/lib/ui/diagramTheme";
import { evaluateEirpCompliance } from "@/lib/rf/eirpCompliance";
import { formatNumber } from "@/lib/rf/format";
import {
  ARIB_T108_POWER_CLASSES,
  type AribT108PowerClass
} from "@/data/aribT108PowerClasses";
import { FormulaExplanationCard } from "./FormulaExplanationCard";
import { EirpComplianceColumn } from "./EirpComplianceColumn";

// 区分の規格値は data 層（src/data/aribT108PowerClasses.ts・出典: ARIB STD-T108／
// 電波法施行規則第6条・一次確認済み）のみを参照する。本ファイルに規格数値を直書きしない。

/** 符号付きの dB 表示（+0.5 / -1.2）。正値に + を付けて余裕/超過を読みやすくする。 */
function signed(value: number, digits = 1): string {
  if (!Number.isFinite(value)) return "-";
  return `${value > 0 ? "+" : ""}${formatNumber(value, digits)}`;
}

// ---- EIRP積み上げ滝グラフ（入力連動の動的SVG） -------------------------------------
// 送信電力→+アンテナ利得→−ケーブル損失→EIRP と積み上げ、選択区分の規制上限を赤破線で重ねる。
// 上限との差は右端の寸法ブラケットで直接ラベリング（以内=緑・超過=赤）。
// テキストは属性直指定（書き出したSVG単体でも画面と同じ見た目: v4 R4方式）。

type BuildupStep = {
  label: string;
  sub: string;
  from: number;
  to: number;
  kind: "start" | "gain" | "loss" | "total";
};

function EirpBuildupWaterfall({
  ptxDbm,
  antennaGainDbi,
  cableLossDb,
  eirpDbm,
  eirpLimitDbm,
  marginDb,
  pass,
  classLabel
}: {
  ptxDbm: number;
  antennaGainDbi: number;
  cableLossDb: number;
  eirpDbm: number;
  eirpLimitDbm: number;
  marginDb: number;
  pass: boolean;
  classLabel: string;
}) {
  // 右余白は寸法ブラケット＋余裕ラベルのために広めに取る。
  const chart = { width: 640, height: 320, top: 30, right: 128, bottom: 56, left: 56, barWidth: 78 };
  const afterGain = ptxDbm + antennaGainDbi;

  const steps: BuildupStep[] = [
    {
      label: "送信電力",
      sub: `${formatNumber(ptxDbm, 1)}dBm`,
      from: ptxDbm,
      to: ptxDbm,
      kind: "start"
    },
    {
      label: "+ アンテナ利得",
      sub: `${signed(antennaGainDbi)}dBi`,
      from: ptxDbm,
      to: afterGain,
      kind: antennaGainDbi >= 0 ? "gain" : "loss"
    },
    {
      label: "− ケーブル損失",
      sub: `-${formatNumber(cableLossDb, 1)}dB`,
      from: afterGain,
      to: eirpDbm,
      kind: "loss"
    },
    {
      label: "EIRP",
      sub: `${formatNumber(eirpDbm, 1)}dBm`,
      from: eirpDbm,
      to: eirpDbm,
      kind: "total"
    }
  ];

  const values = [...steps.flatMap((s) => [s.from, s.to]), eirpLimitDbm];
  const maxValue = Math.ceil((Math.max(...values) + 3) / 5) * 5;
  const minValue = Math.floor((Math.min(...values) - 3) / 5) * 5;
  const span = Math.max(1, maxValue - minValue);
  const plotHeight = chart.height - chart.top - chart.bottom;
  const plotRight = chart.width - chart.right;
  const stepGap = (plotRight - chart.left) / steps.length;
  const y = (v: number) => chart.top + ((maxValue - v) / span) * plotHeight;
  const x = (i: number) => chart.left + i * stepGap + (stepGap - chart.barWidth) / 2;
  const ticks = Array.from({ length: Math.floor(span / 5) + 1 }, (_, i) => maxValue - i * 5);

  const styleFor = (kind: BuildupStep["kind"]) => {
    if (kind === "gain") return { fill: chartTheme.series.gain, stroke: chartTheme.seriesText.gain };
    if (kind === "loss") return { fill: chartTheme.series.loss, stroke: chartTheme.seriesText.loss };
    if (kind === "total") return { fill: chartTheme.series.total, stroke: chartTheme.seriesText.total };
    return { fill: chartTheme.series.source, stroke: chartTheme.seriesText.source };
  };

  // 上限との差を示す寸法ブラケット（以内=緑・超過=赤）。
  const limitY = y(eirpLimitDbm);
  const eirpY = y(eirpDbm);
  const bracketX = plotRight + 30;
  const bracketColor = pass ? diagramPalette.successDeep : diagramPalette.dangerDeep;
  const bracketMidY = (limitY + eirpY) / 2;
  const bracketLabel = pass ? `余裕 ${signed(marginDb)}dB` : `超過 ${formatNumber(-marginDb, 1)}dB`;

  return (
    <svg
      role="img"
      aria-label={`送信電力${formatNumber(ptxDbm, 1)}dBmからEIRP${formatNumber(eirpDbm, 1)}dBmへの積み上げ。${classLabel}の上限${formatNumber(eirpLimitDbm, 1)}dBmに対し${bracketLabel}`}
      viewBox={`0 0 ${chart.width} ${chart.height}`}
      className="h-auto w-full"
    >
      <rect width={chart.width} height={chart.height} fill={chartTheme.surface.canvas} />
      {ticks.map((tick) => (
        <g key={tick}>
          <line x1={chart.left} x2={plotRight} y1={y(tick)} y2={y(tick)} stroke={chartTheme.grid.primary} />
          <text
            x={chart.left - 8}
            y={y(tick) + 4}
            textAnchor="end"
            fill={diagramPalette.muted}
            fontSize={11}
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {tick}
          </text>
        </g>
      ))}
      <text x={chart.left} y={chart.top - 12} fill={diagramPalette.muted} fontSize={12} fontWeight={600}>
        dBm
      </text>

      {/* 規制上限の赤破線（選択区分のEIRP上限・ARIB STD-T108のdata層値） */}
      <line
        x1={chart.left}
        x2={bracketX + 8}
        y1={limitY}
        y2={limitY}
        stroke={chartTheme.reference.sensitivity}
        strokeWidth={1.5}
        strokeDasharray={chartTheme.reference.sensitivityDash}
      />
      <text
        x={chart.left + 4}
        y={limitY - 6}
        fill={diagramPalette.dangerDeep}
        fontSize={11}
        fontWeight={700}
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        上限 {formatNumber(eirpLimitDbm, 1)}dBm（{classLabel}）
      </text>

      {steps.map((step, index) => {
        const style = styleFor(step.kind);
        const top = Math.min(y(step.from), y(step.to));
        const height = Math.max(4, Math.abs(y(step.to) - y(step.from)));
        const centerX = x(index) + chart.barWidth / 2;
        return (
          <g key={step.label}>
            {index > 0 ? (
              <line
                x1={x(index - 1) + chart.barWidth}
                x2={x(index)}
                y1={y(steps[index - 1].to)}
                y2={y(steps[index - 1].to)}
                stroke={diagramPalette.faint}
                strokeDasharray="4 4"
              />
            ) : null}
            <rect
              x={x(index)}
              y={top}
              width={chart.barWidth}
              height={height}
              rx={6}
              fill={style.fill}
              stroke={style.stroke}
              strokeWidth={1.5}
              opacity={step.kind === "start" || step.kind === "total" ? 1 : 0.9}
            />
            <text
              x={centerX}
              y={top - 8}
              textAnchor="middle"
              fill={style.stroke}
              fontSize={11}
              fontWeight={700}
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {step.sub}
            </text>
            <text
              x={centerX}
              y={chart.height - 32}
              textAnchor="middle"
              fill={diagramPalette.inkSoft}
              fontSize={12}
              fontWeight={600}
            >
              {step.label}
            </text>
          </g>
        );
      })}

      {/* EIRPバーからブラケットへの引き出し線 */}
      <line
        x1={x(steps.length - 1) + chart.barWidth}
        x2={bracketX + 8}
        y1={eirpY}
        y2={eirpY}
        stroke={bracketColor}
        strokeDasharray="4 4"
      />
      {/* 上限との差の寸法ブラケット */}
      <line x1={bracketX} x2={bracketX} y1={limitY} y2={eirpY} stroke={bracketColor} strokeWidth={1.5} />
      <line x1={bracketX - 5} x2={bracketX + 5} y1={limitY} y2={limitY} stroke={bracketColor} strokeWidth={1.5} />
      <line x1={bracketX - 5} x2={bracketX + 5} y1={eirpY} y2={eirpY} stroke={bracketColor} strokeWidth={1.5} />
      <text
        x={bracketX + 10}
        y={bracketMidY + 4}
        fill={bracketColor}
        fontSize={11}
        fontWeight={700}
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {bracketLabel}
      </text>
    </svg>
  );
}

export function EirpCompliancePanel() {
  // 既定は 20mW型でよくある構成: 13dBm（=空中線電力上限）＋3dBi（=基準利得）−0.5dB
  // → EIRP 15.5dBm・上限16dBmに対し余裕+0.5dB。「ぎりぎり収まる」現実的な例を最初に見せる。
  const [ptxDbm, setPtxDbm] = useState(13);
  const [antennaGainDbi, setAntennaGainDbi] = useState(3);
  const [cableLossDb, setCableLossDb] = useState(0.5);
  const [powerClassId, setPowerClassId] = useState(ARIB_T108_POWER_CLASSES[0].id);

  const powerClass: AribT108PowerClass =
    ARIB_T108_POWER_CLASSES.find((item) => item.id === powerClassId) ?? ARIB_T108_POWER_CLASSES[0];

  const result = useMemo(() => {
    try {
      return evaluateEirpCompliance({
        ptxDbm,
        antennaGainDbi,
        cableLossDb,
        eirpLimitDbm: powerClass.eirpLimitDbm
      });
    } catch {
      return null;
    }
  }, [ptxDbm, antennaGainDbi, cableLossDb, powerClass.eirpLimitDbm]);

  // 法規は EIRP と空中線電力の両方に上限がある（②）。空中線電力側もdata層の上限で照合する。
  const antennaPowerMarginDb = powerClass.maxAntennaPowerDbm - ptxDbm;
  const antennaPowerPass = Number.isFinite(antennaPowerMarginDb) && antennaPowerMarginDb >= 0;
  const overallPass = result !== null && result.pass && antennaPowerPass;

  const ptxError = !Number.isFinite(ptxDbm) ? "送信電力を入力してください。" : undefined;
  const gainError = !Number.isFinite(antennaGainDbi) ? "アンテナ利得を入力してください。" : undefined;
  const lossError =
    !Number.isFinite(cableLossDb) || cableLossDb < 0
      ? "ケーブル損失は0以上で入力してください。"
      : undefined;

  const primary = {
    label: "EIRP（等価等方輻射電力）",
    value: result === null ? "—" : formatNumber(result.eirpDbm, 1),
    unit: "dBm"
  };

  const chipClass = (active: boolean) =>
    `inline-flex min-h-11 items-center rounded-full border px-3 py-1.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-staf/40 ${
      active
        ? "border-staf bg-staf text-white"
        : "border-slate-200 bg-white text-slate-600 hover:border-staf/40 hover:text-staf-dark"
    }`;

  return (
    <>
      <section className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,4fr)]">
        <Card as="section" padding="lg">
          <h2 className="text-base font-bold text-slate-950">入力条件</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            EIRPは「アンテナから見かけ上どれだけ強く電波を飛ばしているか」です。送信電力に
            アンテナ利得を足し、ケーブル損失を引くだけで求まります。920MHz帯（ARIB STD-T108）の
            区分を選ぶと、法規上限との余裕を判定します。
          </p>

          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-500">
              区分（上限値はARIB STD-T108・電波法施行規則第6条の一次確認値）
            </p>
            <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="920MHz帯の区分">
              {ARIB_T108_POWER_CLASSES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={chipClass(item.id === powerClass.id)}
                  onClick={() => setPowerClassId(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">
              選択中: 空中線電力上限 {formatNumber(powerClass.maxAntennaPowerDbm, 0)}dBm（
              {powerClass.maxAntennaPowerMw}mW）・EIRP上限 {formatNumber(powerClass.eirpLimitDbm, 1)}dBm
              {powerClass.relaxedEirpLimitDbm !== null
                ? `（指向性緩和時 ${formatNumber(powerClass.relaxedEirpLimitDbm, 1)}dBm）`
                : ""}
            </p>
          </div>

          <div className="mt-5 space-y-4">
            <Field
              id="eirpTxPower"
              label="送信電力 Ptx"
              unit="dBm"
              value={ptxDbm}
              min={0}
              max={24}
              step={0.5}
              showSlider
              emptyBehavior="preserve"
              onChange={setPtxDbm}
              help="無線機がアンテナ端子へ送り出す電力（空中線電力）です。920MHz帯モジュールの設定値やデータシートの出力値を入れます。"
              example="13"
              error={ptxError}
            />
            <Field
              id="eirpAntennaGain"
              label="アンテナ利得 Gant"
              unit="dBi"
              value={antennaGainDbi}
              min={-5}
              max={10}
              step={0.5}
              showSlider
              emptyBehavior="preserve"
              onChange={setAntennaGainDbi}
              help="アンテナが電波を特定方向へ集める度合いです。小型基板アンテナは0dBi前後、外付けホイップで2〜5dBi程度。利得が高いほどEIRPは増えます。"
              example="3"
              error={gainError}
            />
            <Field
              id="eirpCableLoss"
              label="ケーブル損失 Lcable"
              unit="dB"
              value={cableLossDb}
              min={0}
              max={5}
              step={0.1}
              showSlider
              emptyBehavior="preserve"
              onChange={setCableLossDb}
              help="無線機とアンテナの間の同軸ケーブル・コネクタで失われる電力です。短い直結なら0.5dB程度、長い引き回しでは数dBになります。"
              example="0.5"
              error={lossError}
            />
          </div>

          {result !== null && antennaGainDbi > powerClass.referenceAntennaGainDbi ? (
            <div className="mt-4">
              <Callout tone="caution" size="sm">
                基準利得 {formatNumber(powerClass.referenceAntennaGainDbi, 0)}dBi
                を超えるアンテナです。EIRP上限 {formatNumber(powerClass.eirpLimitDbm, 1)}dBm
                を超えないよう、送信電力の抑制が必要になる構成です（ARIB STD-T108）。
              </Callout>
            </div>
          ) : null}
        </Card>

        <div className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <div id="eirp-compliance-primary-result">
            <ResultBar primary={primary} />
          </div>

          {result !== null ? (
            <Callout
              tone={overallPass ? "success" : "danger"}
              size="lg"
              icon={
                overallPass ? (
                  <CheckCircle2 aria-hidden="true" className="h-5 w-5 text-emerald-700" />
                ) : (
                  <XCircle aria-hidden="true" className="h-5 w-5 text-rose-700" />
                )
              }
              title={overallPass ? "適合（上限以下）" : "上限超過"}
            >
              <ul className="mt-1 space-y-1 text-sm">
                <li className="tabular-nums">
                  EIRP {formatNumber(result.eirpDbm, 1)}dBm ／ 上限{" "}
                  {formatNumber(result.eirpLimitDbm, 1)}dBm（余裕 {signed(result.marginDb)}dB）
                </li>
                <li className="tabular-nums">
                  送信電力 {formatNumber(ptxDbm, 1)}dBm ／ 上限{" "}
                  {formatNumber(powerClass.maxAntennaPowerDbm, 0)}dBm（余裕 {signed(antennaPowerMarginDb)}dB）
                </li>
              </ul>
            </Callout>
          ) : (
            <Callout tone="neutral" size="lg">
              入力値を確認すると判定が表示されます。
            </Callout>
          )}

          {result !== null ? (
            <div className="grid grid-cols-2 gap-3">
              <MetricCard
                label="EIRP上限との余裕"
                value={signed(result.marginDb)}
                unit="dB"
                tone={result.pass ? "success" : "danger"}
                sub={`上限 ${formatNumber(result.eirpLimitDbm, 1)}dBm（${powerClass.label}）`}
              />
              <MetricCard
                label="空中線電力の余裕"
                value={signed(antennaPowerMarginDb)}
                unit="dB"
                tone={antennaPowerPass ? "success" : "danger"}
                sub={`上限 ${formatNumber(powerClass.maxAntennaPowerDbm, 0)}dBm（${powerClass.maxAntennaPowerMw}mW）`}
              />
            </div>
          ) : null}

          <Card as="section" padding="lg">
            <h2 className="text-base font-bold text-slate-950">この区分の主な法規条件</h2>
            <dl className="mt-3 space-y-1.5 text-sm">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-slate-600">キャリアセンス（LBT）</dt>
                <dd className="font-semibold tabular-nums text-slate-900">
                  {formatNumber(powerClass.carrierSenseThresholdDbm, 0)}dBm・
                  {powerClass.carrierSenseDurationMs}ms
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-slate-600">連続送信時間の上限</dt>
                <dd className="font-semibold tabular-nums text-slate-900">{powerClass.maxTxDurationSec}秒</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-slate-600">送信休止時間</dt>
                <dd className="font-semibold tabular-nums text-slate-900">{powerClass.txPauseMs}ms</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-slate-600">1時間の総送信時間</dt>
                <dd className="font-semibold tabular-nums text-slate-900">
                  {powerClass.maxTotalTxPerHourSec}秒以下
                </dd>
              </div>
            </dl>
            <p className="mt-3 text-xs leading-relaxed text-slate-500">出典: {powerClass.source}</p>
          </Card>
        </div>
      </section>

      <div className="mt-6">
        <ChartFrame
          eyebrow="滝グラフ"
          title="送信電力からEIRPへの積み上げと規制上限"
          description="送信電力にアンテナ利得を足し、ケーブル損失を引いた到達点がEIRPです。赤い破線が選択区分の法規上限で、右端のブラケットが上限との差（余裕または超過）です。入力に連動して動きます。"
          exportName="eirp-compliance-buildup"
          caption={
            result !== null
              ? `条件: Ptx=${formatNumber(ptxDbm, 1)}dBm / Gant=${formatNumber(antennaGainDbi, 1)}dBi / Lcable=${formatNumber(cableLossDb, 1)}dB ─ EIRP ${formatNumber(result.eirpDbm, 1)}dBm・上限 ${formatNumber(result.eirpLimitDbm, 1)}dBm（${powerClass.label}・ARIB STD-T108）・余裕 ${signed(result.marginDb)}dB`
              : "入力値を確認してください。"
          }
        >
          {result !== null ? (
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
              <EirpBuildupWaterfall
                ptxDbm={ptxDbm}
                antennaGainDbi={antennaGainDbi}
                cableLossDb={cableLossDb}
                eirpDbm={result.eirpDbm}
                eirpLimitDbm={result.eirpLimitDbm}
                marginDb={result.marginDb}
                pass={result.pass}
                classLabel={powerClass.label}
              />
            </div>
          ) : (
            <p className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
              入力値を確認すると積み上げグラフが表示されます。
            </p>
          )}
        </ChartFrame>
      </div>

      <div className="mt-6">
        <FormulaExplanationCard
          title="基礎から: なぜ送信電力だけでは法規を語れないのか"
          formula="EIRP[dBm] = 送信電力[dBm] + アンテナ利得[dBi] − ケーブル損失[dB]"
          showColumnLink={false}
        >
          <p>
            <strong>① EIRPは「見かけ上どれだけ強く飛ばしているか」です。</strong>
            同じ60Wの電球でも、裸電球は全方向を薄く照らし、レフ球（反射板つき）は正面だけを強く照らします。
            正面に立った人には、レフ球のほうがずっと明るい電球に見える——アンテナ利得はこの反射板で、
            EIRPは「正面から見た明るさを、全方向に均等に飛ばすアンテナに換算した値」です。
            ※このたとえには破れがあります。EIRPは最大放射方向で測った換算値であり、
            他の方向には実際それより弱くしか飛んでいません（総放射電力が増えるわけではない）。
          </p>
          <p>
            <strong>② 法規は送信電力とEIRPの両方に上限を課しています。</strong>
            920MHz帯の特定小電力（20mW型）では、空中線電力13dBm（20mW）とEIRP16dBm
            （基準利得3dBi込み）の両方が上限です（出典: ARIB STD-T108・電波法施行規則第6条。
            数値は本ツールのdata層の一次確認値）。送信電力が合法でも、
            利得の高いアンテナをつなげばEIRP側の上限を破ることがあります。
          </p>
          <p>
            <strong>③ 高利得アンテナへの交換は「無料の改善」ではありません。</strong>
            例えば13dBm＋3dBiでEIRP16dBmちょうどの構成から、アンテナだけ6dBi品に替えると
            EIRPは19dBmになり3dB超過します。合法に戻すには送信電力を10dBmへ下げる必要があり、
            利得で稼いだ3dBは送信電力で相殺されます——これが実務でいちばん踏みやすい落とし穴です。
            高利得化が効くのは「受信側の利得」や「指向性による干渉低減」であって、
            送信EIRPは上限で頭打ちになります。
          </p>
        </FormulaExplanationCard>
      </div>

      <div className="mt-6">
        <EirpComplianceColumn />
      </div>

      <MobileResultBar primary={primary} targetId="eirp-compliance-primary-result" />
    </>
  );
}
