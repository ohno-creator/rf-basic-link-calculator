"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/Card";
import { Callout } from "@/components/Callout";
import { ChartFrame } from "@/components/ChartFrame";
import { Field } from "@/components/Field";
import { MetricCard } from "@/components/MetricCard";
import { MobileResultBar } from "@/components/MobileResultBar";
import { ResultBar } from "@/components/ResultBar";
import { chartTheme } from "@/lib/chartTheme";
import { diagramPalette } from "@/lib/ui/diagramTheme";
import { judgeKeepout, type KeepoutJudgement, type KeepoutVerdict } from "@/lib/rf/antennaKeepout";
import {
  KEEPOUT_ANTENNA_TYPES,
  KEEPOUT_BANDS,
  KEEPOUT_SOURCES,
  type KeepoutAntennaType,
  type KeepoutBand
} from "@/data/antennaKeepout";
import { formatNumber } from "@/lib/rf/format";
import { CONTACT_URL } from "@/lib/rf/presets";
import type { LinkJudgementLevel } from "@/lib/rf/judgement";
import { FormulaExplanationCard } from "./FormulaExplanationCard";
import { AntennaKeepoutColumn } from "./AntennaKeepoutColumn";

// 判定 → 表示メタ（面色は ResultBar の LEVEL_TO_TONE 経由で意味トークンへ写像）。
const VERDICT_META: Record<
  KeepoutVerdict,
  { level: LinkJudgementLevel; label: string; lead: string }
> = {
  success: {
    level: "excellent",
    label: "判定：OK — キープアウト充足",
    lead: "必要な空き地を幅・奥行きとも確保できています。この配置を基準に実測で追い込めます。"
  },
  caution: {
    level: "caution",
    label: "判定：注意 — わずかに不足（不足率20%未満）",
    lead: "同調ずれ・効率低下の可能性があります。整合調整と実測評価を前提に進めてください。"
  },
  danger: {
    level: "poor",
    label: "判定：NG — 20%以上不足",
    lead: "この配置では所定の性能が出ない可能性が高い状態です。配置見直しか外付けアンテナ等の方式変更を検討してください。"
  }
};

// ---- キープアウト重ね描き図（入力連動の動的SVG） -------------------------------------
// 基板の上端（アンテナ搭載端）を基準に、確保できた空き地と必要キープアウトを重ねる。
// 充足部分は success 色の面、不足部分は danger 色の帯で可視化する。
// テキストは属性直指定（書き出したSVG単体でも画面と同じ見た目）。

function KeepoutOverlayDiagram({
  availableWidthMm,
  availableHeightMm,
  judgement
}: {
  availableWidthMm: number;
  availableHeightMm: number;
  judgement: KeepoutJudgement;
}) {
  const chart = { width: 640, height: 320, top: 56, bottom: 40, left: 48, right: 48 };
  const { requiredWidthMm, requiredHeightMm, verdict } = judgement;

  const maxWmm = Math.max(requiredWidthMm, availableWidthMm);
  const maxHmm = Math.max(requiredHeightMm, availableHeightMm);
  const plotW = chart.width - chart.left - chart.right;
  const plotH = chart.height - chart.top - chart.bottom;
  // 基板は空き地より一回り大きく描く（横 +30%・下 +40%）。
  const scale = Math.min(plotW / (maxWmm * 1.3), plotH / (maxHmm * 1.4));
  const x0 = chart.left + (plotW - maxWmm * scale) / 2;
  const y0 = chart.top;

  const availW = availableWidthMm * scale;
  const availH = availableHeightMm * scale;
  const reqW = requiredWidthMm * scale;
  const reqH = requiredHeightMm * scale;
  const boardX = x0 - maxWmm * scale * 0.15;
  const boardW = maxWmm * scale * 1.3;
  const boardH = maxHmm * scale * 1.4;

  const overlapW = Math.min(availW, reqW);
  const overlapH = Math.min(availH, reqH);
  const outlineColor = verdict === "success" ? diagramPalette.successDeep : diagramPalette.dangerDeep;

  return (
    <svg
      role="img"
      aria-label={`必要キープアウト${formatNumber(requiredWidthMm, 0)}×${formatNumber(requiredHeightMm, 0)}mmと確保領域${formatNumber(availableWidthMm, 1)}×${formatNumber(availableHeightMm, 1)}mmの重ね描き`}
      viewBox={`0 0 ${chart.width} ${chart.height}`}
      className="h-auto w-full"
    >
      <rect width={chart.width} height={chart.height} fill={chartTheme.surface.canvas} />

      {/* 凡例 */}
      <g>
        <rect x={chart.left} y={16} width={12} height={12} rx={2} fill={diagramPalette.success} opacity={0.35} />
        <text x={chart.left + 18} y={26} fill={diagramPalette.inkSoft} fontSize={11} fontWeight={600}>
          充足している空き地
        </text>
        <rect x={chart.left + 140} y={16} width={12} height={12} rx={2} fill={diagramPalette.loss} opacity={0.6} />
        <text x={chart.left + 158} y={26} fill={diagramPalette.inkSoft} fontSize={11} fontWeight={600}>
          不足している帯
        </text>
        <rect
          x={chart.left + 260}
          y={16}
          width={12}
          height={12}
          rx={2}
          fill="none"
          stroke={outlineColor}
          strokeWidth={1.5}
          strokeDasharray="4 3"
        />
        <text x={chart.left + 278} y={26} fill={diagramPalette.inkSoft} fontSize={11} fontWeight={600}>
          必要キープアウト（破線）
        </text>
      </g>

      {/* 基板（GND・部品エリア） */}
      <rect x={boardX} y={y0} width={boardW} height={boardH} rx={6} fill={diagramPalette.grid} stroke={diagramPalette.faint} strokeWidth={1} />
      <text
        x={boardX + boardW - 8}
        y={y0 + boardH - 10}
        textAnchor="end"
        fill={diagramPalette.muted}
        fontSize={11}
        fontWeight={600}
      >
        基板（GND・部品エリア）
      </text>

      {/* 確保できた空き地（銅箔・部品なし） */}
      <rect
        x={x0}
        y={y0}
        width={availW}
        height={availH}
        fill={diagramPalette.white}
        stroke={diagramPalette.staf}
        strokeWidth={1.5}
      />

      {/* 充足部分（確保∩必要）を success 面で示す */}
      <rect x={x0} y={y0} width={overlapW} height={overlapH} fill={diagramPalette.success} opacity={0.28} />

      {/* 不足帯（必要が確保をはみ出す部分）: 幅方向 */}
      {reqW > availW ? (
        <rect
          x={x0 + availW}
          y={y0}
          width={reqW - availW}
          height={reqH}
          fill={diagramPalette.loss}
          opacity={0.6}
          stroke={diagramPalette.dangerDeep}
          strokeWidth={0.75}
        />
      ) : null}
      {/* 不足帯: 奥行き方向（角の二重塗りを避けるため幅は overlapW まで） */}
      {reqH > availH ? (
        <rect
          x={x0}
          y={y0 + availH}
          width={overlapW}
          height={reqH - availH}
          fill={diagramPalette.loss}
          opacity={0.6}
          stroke={diagramPalette.dangerDeep}
          strokeWidth={0.75}
        />
      ) : null}

      {/* 必要キープアウトの外形（破線） */}
      <rect
        x={x0}
        y={y0}
        width={reqW}
        height={reqH}
        fill="none"
        stroke={outlineColor}
        strokeWidth={1.5}
        strokeDasharray="6 4"
      />

      {/* アンテナ素子（基板端に実装） */}
      <rect
        x={x0 + 4}
        y={y0 + 3}
        width={Math.max(16, reqW * 0.3)}
        height={7}
        rx={2}
        fill={diagramPalette.inkSoft}
      />
      <text x={x0 + 4} y={y0 - 6} fill={diagramPalette.inkSoft} fontSize={11} fontWeight={600}>
        アンテナ素子（基板端）
      </text>

      {/* 寸法ラベル */}
      <text
        x={x0 + reqW + 8}
        y={y0 + reqH / 2 + 4}
        fill={outlineColor}
        fontSize={11}
        fontWeight={700}
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        必要 {formatNumber(requiredWidthMm, 0)}×{formatNumber(requiredHeightMm, 0)}mm
      </text>
      <text
        x={x0}
        y={y0 + Math.max(availH, reqH) + 16}
        fill={diagramPalette.stafDark}
        fontSize={11}
        fontWeight={700}
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        確保 {formatNumber(availableWidthMm, 1)}×{formatNumber(availableHeightMm, 1)}mm
      </text>
    </svg>
  );
}

export function AntennaKeepoutPanel() {
  // 既定はチップ×2.4GHz（必要10×4mm）に確保12×5mm: まず「充足」の状態を見せる。
  const [antennaType, setAntennaType] = useState<KeepoutAntennaType>("chip");
  const [band, setBand] = useState<KeepoutBand>("band2400");
  const [availableWidthMm, setAvailableWidthMm] = useState(12);
  const [availableHeightMm, setAvailableHeightMm] = useState(5);

  const result = useMemo(() => {
    try {
      return judgeKeepout({ antennaType, band, availableWidthMm, availableHeightMm });
    } catch {
      return null;
    }
  }, [antennaType, band, availableWidthMm, availableHeightMm]);

  const widthError =
    !Number.isFinite(availableWidthMm) || availableWidthMm <= 0
      ? "確保幅は0より大きい値を入力してください。"
      : undefined;
  const heightError =
    !Number.isFinite(availableHeightMm) || availableHeightMm <= 0
      ? "確保奥行きは0より大きい値を入力してください。"
      : undefined;

  const meta = result ? VERDICT_META[result.verdict] : null;

  const primary = {
    label: "不足量（幅 / 奥行き）",
    value:
      result === null
        ? "—"
        : `${formatNumber(result.shortfallWidthMm, 1)} / ${formatNumber(result.shortfallHeightMm, 1)}`,
    unit: "mm"
  };

  const maxShortfallRatio =
    result === null
      ? null
      : Math.max(
          result.shortfallWidthMm / result.requiredWidthMm,
          result.shortfallHeightMm / result.requiredHeightMm
        );

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
            アンテナの方式と帯域を選び、基板上に確保できた「銅箔も部品も置かない空き地」の
            幅と奥行きを入れてください。データシートが要求する必要キープアウト（目安）と比べて判定します。
          </p>

          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-500">アンテナ方式</p>
            <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="アンテナ方式">
              {KEEPOUT_ANTENNA_TYPES.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  className={chipClass(antennaType === type.id)}
                  onClick={() => setAntennaType(type.id)}
                  title={type.note}
                >
                  {type.label}
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs font-semibold text-slate-500">周波数帯</p>
            <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="周波数帯">
              {KEEPOUT_BANDS.map((bandOption) => (
                <button
                  key={bandOption.id}
                  type="button"
                  className={chipClass(band === bandOption.id)}
                  onClick={() => setBand(bandOption.id)}
                  title={bandOption.note}
                >
                  {bandOption.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <Field
              id="keepoutWidth"
              label="確保できた幅 W"
              unit="mm"
              value={availableWidthMm}
              min={0.1}
              step={0.5}
              emptyBehavior="preserve"
              onChange={setAvailableWidthMm}
              help="基板端に沿った方向の、銅箔・部品を置かない領域の幅です。アンテナ素子だけでなく周囲の空間まで含めて確保します。"
              example="12"
              error={widthError}
            />
            <Field
              id="keepoutHeight"
              label="確保できた奥行き H"
              unit="mm"
              value={availableHeightMm}
              min={0.1}
              step={0.5}
              emptyBehavior="preserve"
              onChange={setAvailableHeightMm}
              help="基板端から内側へ向かう方向の空き地の奥行きです。この先にGNDベタや部品が始まります。"
              example="5"
              error={heightError}
            />
          </div>
        </Card>

        <div className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <div id="antenna-keepout-primary-result">
            <ResultBar
              primary={primary}
              judgement={meta ? { label: meta.label, level: meta.level } : undefined}
            />
          </div>

          <Card as="section" padding="lg">
            <h2 className="text-base font-bold text-slate-950">必要キープアウト（目安）</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <MetricCard
                label="必要寸法 W × H"
                value={
                  result
                    ? `${formatNumber(result.requiredWidthMm, 0)} × ${formatNumber(result.requiredHeightMm, 0)}`
                    : "—"
                }
                unit="mm"
                sub="選択した方式×帯域のデータ表の値"
              />
              <MetricCard
                label="最大不足率"
                value={maxShortfallRatio === null ? "—" : formatNumber(maxShortfallRatio * 100, 0)}
                unit="%"
                tone={
                  result?.verdict === "success"
                    ? "success"
                    : result?.verdict === "caution"
                      ? "caution"
                      : result
                        ? "danger"
                        : "neutral"
                }
                sub="20%以上の辺が1つでもあるとNG"
              />
            </div>
            {meta ? <p className="mt-3 text-sm leading-relaxed text-slate-600">{meta.lead}</p> : null}
          </Card>

          <Callout tone="caution" title="目安値・実測前提">
            <p>
              必要寸法は各社レイアウトガイド（
              {KEEPOUT_SOURCES.map((source) => source.label.split(",")[0]).join("・")}
              ）の代表値を丸めた目安で、採用する製品のデータシート指定が優先です。
              筐体・電池・ネジなど基板外の近接物の影響は含みません。
              建物・筐体込みの実測評価は
              <a
                href={CONTACT_URL}
                className="mx-0.5 font-semibold text-staf-dark underline decoration-staf/40 underline-offset-2 hover:text-staf"
              >
                技術相談窓口
              </a>
              へどうぞ。
            </p>
          </Callout>
        </div>
      </section>

      <div className="mt-6">
        <ChartFrame
          eyebrow="重ね描き図"
          title="確保した空き地と必要キープアウトの重なり"
          description="基板の上端（アンテナ搭載端）を基準に、確保できた空き地（青枠）と必要キープアウト（破線）を重ねます。充足している面は緑、はみ出した不足分は赤い帯で表示します。入力に連動して動きます。"
          exportName="antenna-keepout-overlay"
          caption={
            result
              ? `条件: ${KEEPOUT_ANTENNA_TYPES.find((t) => t.id === antennaType)?.label} / ${KEEPOUT_BANDS.find((b) => b.id === band)?.label}帯 ─ 必要 ${formatNumber(result.requiredWidthMm, 0)}×${formatNumber(result.requiredHeightMm, 0)}mm・確保 ${formatNumber(availableWidthMm, 1)}×${formatNumber(availableHeightMm, 1)}mm（出典: 各社レイアウトガイドの代表値）`
              : "入力値を確認してください。"
          }
        >
          {result ? (
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
              <KeepoutOverlayDiagram
                availableWidthMm={availableWidthMm}
                availableHeightMm={availableHeightMm}
                judgement={result}
              />
            </div>
          ) : (
            <p className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
              入力値を確認すると重ね描き図が表示されます。
            </p>
          )}
        </ChartFrame>
      </div>

      <div className="mt-6">
        <FormulaExplanationCard
          title="基礎から: なぜ「空き地」の寸法だけで判定できるのか"
          formula="不足量 = max(0, 必要寸法 − 確保寸法)　不足率 = 不足量 ÷ 必要寸法　判定: 両辺充足→OK／全不足辺<20%→注意／いずれか≥20%→NG"
          showColumnLink={false}
        >
          <p>
            <strong>① アンテナは素子単体では動きません。</strong>
            電波を実際に放つのは、素子の周囲の空間に広がる電磁界（近傍界）です。
            そこに銅箔や部品が入ると、共振周波数がずれ（同調ずれ）、誘起された電流が電力を
            熱として奪います（結合損失）。だからデータシートは素子の何倍もの「空き地」を要求します。
          </p>
          <p>
            <strong>② 必要寸法は方式と帯域でほぼ決まります。</strong>
            波長が長い920MHz帯ほど近傍界が広く、必要な空き地も大きくなります。
            また、部品を使わないPCBパターンは素子が大きいぶん面積要求が最大、
            チップアンテナは最小です。このツールの表は各社レイアウトガイドの代表値です。
          </p>
          <p>
            <strong>③ 不足率20%が「調整で追い込めるか」の当たりです。</strong>
            わずかな不足（20%未満）は、同調ずれを整合回路の再調整で吸収できる可能性が残ります。
            一方どこかの辺が20%以上欠けると、効率・帯域の低下が大きく、整合だけでは取り返せないのが通例です。
            その場合は配置の見直しか、FPC・外付けアンテナへの方式変更が現実的な出口になります。
          </p>
          <p>
            結論: 判定は「必要な空き地を確保できているか」の単純比較ですが、
            その背後にあるのは近傍界という物理です。境界の20%は設計初期の目安であり、最終判断は実測で行ってください。
          </p>
        </FormulaExplanationCard>
      </div>

      <div className="mt-6">
        <AntennaKeepoutColumn />
      </div>

      <MobileResultBar primary={primary} targetId="antenna-keepout-primary-result" />
    </>
  );
}
