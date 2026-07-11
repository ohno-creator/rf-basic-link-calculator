"use client";

import { useMemo, useState } from "react";
import { Callout } from "@/components/Callout";
import { Card } from "@/components/Card";
import { DiagramDefs } from "@/components/diagrams/DiagramDefs";
import { Field } from "@/components/Field";
import { MetricCard } from "@/components/MetricCard";
import { MobileResultBar } from "@/components/MobileResultBar";
import { ResultBar } from "@/components/ResultBar";
import { calculateIfaDimensions } from "@/lib/rf/ifaDimensions";
import { formatNumber } from "@/lib/rf/format";
import {
  DIAGRAM_DEF_IDS,
  diagramPalette,
  diagramRef,
  diagramStroke,
  diagramText
} from "@/lib/ui/diagramTheme";
import { FormulaExplanationCard } from "./FormulaExplanationCard";
import { IfaDimensionsColumn } from "./IfaDimensionsColumn";

const presets = [
  { label: "LTE-M 800", frequencyMHz: 800 },
  { label: "LPWA 920", frequencyMHz: 920 },
  { label: "GNSS L1", frequencyMHz: 1575.42 },
  { label: "BLE 2.4G", frequencyMHz: 2400 }
] as const;

export function IfaDimensionsPanel() {
  const [frequencyMHz, setFrequencyMHz] = useState(920);
  const [relativePermittivity, setRelativePermittivity] = useState(4.4);
  const [substrateThicknessMm, setSubstrateThicknessMm] = useState(1);

  const result = useMemo(() => {
    try {
      return calculateIfaDimensions({ frequencyMHz, relativePermittivity, substrateThicknessMm });
    } catch {
      return null;
    }
  }, [frequencyMHz, relativePermittivity, substrateThicknessMm]);

  const primary = {
    label: "IFA全長の初期値",
    value: result ? formatNumber(result.initialLengthMm, 1) : "—",
    unit: "mm"
  };
  // 100〜6000MHzでは実寸の幅が大きいため、図形長は対数スケール、寸法値は実数で示す。
  const radiatorStartX = 112;
  const radiatorMinEndX = 300;
  const radiatorMaxEndX = 570;
  const minModelLengthMm = 299_792_458 / (6000 * 1e6) * 1000 / 4 / Math.sqrt((12 + 1) / 2);
  const maxModelLengthMm = 299_792_458 / (100 * 1e6) * 1000 / 4;
  const lengthRatio = result
    ? Math.min(
        1,
        Math.max(
          0,
          (Math.log(result.initialLengthMm) - Math.log(minModelLengthMm)) /
            (Math.log(maxModelLengthMm) - Math.log(minModelLengthMm))
        )
      )
    : 0.5;
  const radiatorEndX = radiatorMinEndX + lengthRatio * (radiatorMaxEndX - radiatorMinEndX);
  const horizontalLength = radiatorEndX - radiatorStartX;
  const feedMinX = radiatorStartX + horizontalLength / 12;
  const feedMaxX = radiatorStartX + horizontalLength / 8;
  const feedX = (feedMinX + feedMaxX) / 2;
  const radiatorLabelX = (radiatorStartX + radiatorEndX) / 2;

  return (
    <>
      <section className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,4fr)] lg:items-start">
        <Card as="section" padding="lg">
          <h2 className="text-base font-bold text-slate-950">入力条件</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            周波数プリセットを起点に、使用する基板の比誘電率を合わせます。
          </p>
          <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="周波数プリセット">
            {presets.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => setFrequencyMHz(preset.frequencyMHz)}
                className={`inline-flex min-h-11 items-center rounded-full border px-3 py-2 text-sm font-semibold transition ${
                  frequencyMHz === preset.frequencyMHz
                    ? "border-staf bg-staf text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-staf/40 hover:text-staf-dark"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field
              id="ifaFrequency"
              label="動作周波数"
              unit="MHz"
              value={frequencyMHz}
              min={100}
              max={6000}
              step={1}
              showSlider
              emptyBehavior="invalid"
              onChange={setFrequencyMHz}
              error={Number.isFinite(frequencyMHz) && frequencyMHz > 0 ? undefined : "0より大きい値を入力してください。"}
              help="アンテナを合わせたい中心周波数です。高いほど必要なパターン長は短くなります。"
            />
            <Field
              id="ifaPermittivity"
              label="基板の比誘電率 εr"
              value={relativePermittivity}
              min={1}
              max={12}
              step={0.1}
              showSlider
              emptyBehavior="invalid"
              onChange={setRelativePermittivity}
              error={Number.isFinite(relativePermittivity) && relativePermittivity >= 1 ? undefined : "1以上を入力してください。"}
              help="FR4は概ね4.4です。値が大きいほど基板上の波長が短くなります。"
            />
            <Field
              id="ifaThickness"
              label="基板厚"
              unit="mm"
              value={substrateThicknessMm}
              min={0.1}
              max={5}
              step={0.1}
              emptyBehavior="invalid"
              onChange={setSubstrateThicknessMm}
              error={Number.isFinite(substrateThicknessMm) && substrateThicknessMm > 0 ? undefined : "0より大きい値を入力してください。"}
              help="本簡易式の長さ補正には使いません。設計条件として記録し、EM解析・実測で評価します。"
            />
          </div>
        </Card>

        <div id="ifa-primary-result" className="space-y-4 lg:sticky lg:top-20">
          <ResultBar primary={primary} />
          {result ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <MetricCard label="自由空間 λ/4" value={formatNumber(result.freeSpaceQuarterWavelengthMm, 1)} unit="mm" />
              <MetricCard label="短縮率" value={formatNumber(result.shorteningRatio * 100, 1)} unit="%" />
              <MetricCard label="給電間隔の下限 L/12" value={formatNumber(result.feedSpacingMinMm, 1)} unit="mm" />
              <MetricCard label="給電間隔の上限 L/8" value={formatNumber(result.feedSpacingMaxMm, 1)} unit="mm" />
            </div>
          ) : (
            <Callout tone="danger">入力値を確認してください。</Callout>
          )}
          <Callout tone="caution" title="初期寸法です">
            筐体・GND・部品配置で共振は±10〜20%程度ずれ得ます。最終寸法は実測またはEM解析で追い込んでください。
          </Callout>
        </div>
      </section>

      {result ? (
        <Card as="figure" padding="md" className="mt-6">
          <figcaption className="text-base font-bold text-slate-950">IFA上面図の読み方</figcaption>
          <svg
            data-testid="ifa-dimensions-diagram"
            data-radiator-end-x={radiatorEndX.toFixed(2)}
            data-feed-min-x={feedMinX.toFixed(2)}
            data-feed-max-x={feedMaxX.toFixed(2)}
            role="img"
            aria-label={`逆Fアンテナの全長約${formatNumber(result.initialLengthMm, 1)}mm、短絡点から給電点まで${formatNumber(result.feedSpacingMinMm, 1)}〜${formatNumber(result.feedSpacingMaxMm, 1)}mmの初期寸法図`}
            viewBox="0 0 640 250"
            className="mt-3 h-auto w-full"
          >
            <DiagramDefs />
            <rect
              x="30"
              y="42"
              width="580"
              height="170"
              rx="12"
              fill={diagramRef(DIAGRAM_DEF_IDS.gradientResin)}
              fillOpacity={0.28}
              stroke={diagramPalette.line}
              strokeWidth={diagramStroke.main}
              filter={diagramRef(DIAGRAM_DEF_IDS.softShadow)}
            />
            <rect x="48" y="146" width="544" height="48" rx="5" fill={diagramPalette.canvas} stroke={diagramPalette.faint} strokeWidth={diagramStroke.support} />
            <path
              d={`M${radiatorStartX} 166 V88 H${radiatorEndX}`}
              fill="none"
              stroke={diagramPalette.staf}
              strokeWidth="11"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter={diagramRef(DIAGRAM_DEF_IDS.softShadow)}
            />
            <line x1={feedX} y1="166" x2={feedX} y2="88" stroke={diagramPalette.warnDeep} strokeWidth="4" />
            <circle cx={radiatorStartX} cy="174" r="6" fill={diagramRef(DIAGRAM_DEF_IDS.gradientMetal)} stroke={diagramPalette.inkSoft} strokeWidth={diagramStroke.main} />
            <circle cx={feedX} cy="174" r="6" fill={diagramPalette.warn} stroke={diagramPalette.white} strokeWidth={diagramStroke.main} />

            <line
              x1={radiatorStartX}
              x2={radiatorEndX}
              y1="66"
              y2="66"
              stroke={diagramPalette.muted}
              strokeWidth={diagramStroke.support}
              markerStart={diagramRef(DIAGRAM_DEF_IDS.arrowHeadMuted)}
              markerEnd={diagramRef(DIAGRAM_DEF_IDS.arrowHeadMuted)}
            />
            <text
              x={radiatorLabelX}
              y="55"
              textAnchor="middle"
              fill={diagramText.value.fill}
              fontSize={diagramText.value.fontSize}
              fontWeight={diagramText.value.fontWeight}
              style={{ fontVariantNumeric: diagramText.value.fontVariantNumeric }}
            >
              全長 約 {formatNumber(result.initialLengthMm, 1)}mm
            </text>

            <rect x={feedMinX} y="198" width={Math.max(8, feedMaxX - feedMinX)} height="8" rx="4" fill={diagramPalette.warn} fillOpacity={0.35} />
            <line
              x1={radiatorStartX}
              x2={feedMaxX}
              y1="202"
              y2="202"
              stroke={diagramPalette.warnDeep}
              strokeWidth={diagramStroke.support}
              markerStart={diagramRef(DIAGRAM_DEF_IDS.arrowHeadMuted)}
              markerEnd={diagramRef(DIAGRAM_DEF_IDS.arrowHeadMuted)}
            />
            <text x={(radiatorStartX + feedMaxX) / 2} y="225" textAnchor="middle" {...diagramText.label}>
              給電間隔 {formatNumber(result.feedSpacingMinMm, 1)}〜{formatNumber(result.feedSpacingMaxMm, 1)}mm
            </text>
            <text x={radiatorStartX - 8} y="188" textAnchor="end" {...diagramText.caption}>短絡</text>
            <text x={feedX + 8} y="188" textAnchor="start" {...diagramText.caption}>給電</text>
            <text x="575" y="178" textAnchor="end" {...diagramText.label}>GNDプレーン</text>
            <text x="600" y="238" textAnchor="end" {...diagramText.caption}>形状は相対表示</text>
          </svg>
        </Card>
      ) : null}

      <div className="mt-6">
        <FormulaExplanationCard
          title="簡易モデルの式と適用条件"
          formula={"εeff = (εr + 1) / 2\nL[mm] ≈ λ0[mm] / (4√εeff)\n給電間隔 ≈ L/12〜L/8"}
          showColumnLink={false}
        >
          <p className="text-sm leading-relaxed text-slate-600">
            線幅を使わない簡易εeffモデルです。基板厚は記録しますが、この式の短縮率には含めません。
          </p>
        </FormulaExplanationCard>
      </div>
      <div className="mt-6">
        <IfaDimensionsColumn />
      </div>
      <MobileResultBar primary={primary} targetId="ifa-primary-result" />
    </>
  );
}
