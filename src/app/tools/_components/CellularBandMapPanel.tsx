"use client";

import { useMemo, useState, type KeyboardEvent } from "react";
import { Card } from "@/components/Card";
import { ChartFrame } from "@/components/ChartFrame";
import { Field } from "@/components/Field";
import { MetricCard } from "@/components/MetricCard";
import { MobileResultBar } from "@/components/MobileResultBar";
import { ResultBar } from "@/components/ResultBar";
import { chartTheme } from "@/lib/chartTheme";
import { diagramPalette } from "@/lib/ui/diagramTheme";
import {
  CELLULAR_BANDS,
  PLATINUM_RANGE_MHZ,
  type CellularBand
} from "@/data/cellularBands";
import {
  bandRepresentativeFrequencyMHz,
  bandSpan,
  findBandsByFrequency,
  halfWavelengthMm,
  wavelengthMm,
  type BandMatch
} from "@/lib/rf/cellularBandLookup";
import { formatNumber } from "@/lib/rf/format";
import { FormulaExplanationCard } from "./FormulaExplanationCard";
import { CellularBandMapColumn } from "./CellularBandMapColumn";

// ---- 周波数プリセット（値は src/data/cellularBands.ts のバンドレンジ内の代表点） ----
const FREQUENCY_PRESETS = [
  { label: "700MHz（B28）", valueMHz: 720 },
  { label: "900MHz（B8）", valueMHz: 900 },
  { label: "2.1GHz（B1）", valueMHz: 2140 },
  { label: "3.5GHz（Sub6）", valueMHz: 3500 },
  { label: "4.7GHz（n79）", valueMHz: 4700 },
  { label: "28GHz（ミリ波）", valueMHz: 28000 }
] as const;

// 地図の横軸レンジ（対数）: 600MHz〜30GHz。B28下端703〜n257上端29500を余白込みで収める。
const MAP_MIN_MHZ = 600;
const MAP_MAX_MHZ = 30000;
const LOG_MIN = Math.log10(MAP_MIN_MHZ);
const LOG_MAX = Math.log10(MAP_MAX_MHZ);

// ---- バンド地図SVG（主役・入力連動） -------------------------------------------------
// 横軸=対数周波数。5G=上段2レーン・4G=下段2レーン（周波数が重なるバンドを別レーンへ）。
// レーンとラベル位置は静的データ（ラベル衝突を目視確認済み）。テキストは属性直指定。

type LaneLayout = { lane: number; labelBelow: boolean };

const LANE_LAYOUT: Record<string, LaneLayout> = {
  n77: { lane: 0, labelBelow: false },
  n257: { lane: 0, labelBelow: false },
  n78: { lane: 1, labelBelow: false },
  n79: { lane: 1, labelBelow: false },
  B28: { lane: 2, labelBelow: false },
  B19: { lane: 2, labelBelow: false },
  B3: { lane: 2, labelBelow: false },
  B41: { lane: 2, labelBelow: false },
  B18: { lane: 3, labelBelow: false },
  B8: { lane: 3, labelBelow: true },
  B1: { lane: 3, labelBelow: false },
  B42: { lane: 3, labelBelow: true }
};

const AXIS_TICKS_MHZ = [700, 1000, 2000, 3000, 5000, 10000, 20000, 28000] as const;

function BandMapSvg({
  freqMHz,
  hitKeys,
  selectedKey,
  showPlatinum,
  onSelect
}: {
  freqMHz: number | null;
  hitKeys: string[];
  selectedKey: string;
  showPlatinum: boolean;
  onSelect: (key: string) => void;
}) {
  const chart = { width: 760, height: 340, left: 44, right: 16, axisY: 296 };
  const plotWidth = chart.width - chart.left - chart.right;
  const laneY = [56, 96, 160, 204];
  const rectH = 20;

  const x = (mhz: number) =>
    chart.left + ((Math.log10(mhz) - LOG_MIN) / (LOG_MAX - LOG_MIN)) * plotWidth;

  const fillFor = (band: CellularBand) => {
    if (showPlatinum && band.isPlatinum) return diagramPalette.amber;
    return band.generation === "5G" ? chartTheme.series.gain : chartTheme.series.source;
  };
  const strokeFor = (band: CellularBand) => {
    if (showPlatinum && band.isPlatinum) return diagramPalette.amberDeep;
    return band.generation === "5G" ? chartTheme.seriesText.gain : chartTheme.seriesText.source;
  };

  const cursorX = freqMHz !== null && freqMHz >= MAP_MIN_MHZ && freqMHz <= MAP_MAX_MHZ ? x(freqMHz) : null;

  const handleKeyDown = (event: KeyboardEvent<SVGGElement>, key: string) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect(key);
    }
  };

  return (
    <svg
      data-testid="cellular-band-map"
      data-selected-band={selectedKey}
      data-hit-bands={hitKeys.join(",")}
      data-cursor-mhz={freqMHz === null ? "" : String(freqMHz)}
      aria-label={`4G/5Gバンド地図。選択中: ${selectedKey}。カーソル周波数${freqMHz ?? "—"}MHzの該当バンド: ${hitKeys.join("・") || "なし"}`}
      viewBox={`0 0 ${chart.width} ${chart.height}`}
      className="h-auto w-full"
    >
      <rect width={chart.width} height={chart.height} fill={chartTheme.surface.canvas} />

      {/* 縦グリッドと周波数目盛り（対数軸） */}
      {AXIS_TICKS_MHZ.map((tick) => (
        <g key={tick}>
          <line x1={x(tick)} x2={x(tick)} y1={40} y2={chart.axisY} stroke={chartTheme.grid.primary} />
          <text
            x={x(tick)}
            y={chart.axisY + 18}
            textAnchor="middle"
            fill={diagramPalette.muted}
            fontSize={11}
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {tick >= 1000 ? `${tick / 1000}G` : `0.${Math.round(tick / 100)}G`}
          </text>
        </g>
      ))}
      <line
        x1={chart.left}
        x2={chart.width - chart.right}
        y1={chart.axisY}
        y2={chart.axisY}
        stroke={diagramPalette.faint}
      />
      <text x={chart.width - chart.right} y={chart.axisY + 34} textAnchor="end" fill={diagramPalette.muted} fontSize={11}>
        周波数（対数軸・Hz表記はG=GHz）
      </text>

      {/* 世代ラベル */}
      <text x={20} y={laneY[0] + 34} textAnchor="middle" fill={chartTheme.seriesText.gain} fontSize={13} fontWeight={700}>
        5G
      </text>
      <text x={20} y={laneY[2] + 34} textAnchor="middle" fill={chartTheme.seriesText.source} fontSize={13} fontWeight={700}>
        4G
      </text>

      {/* プラチナバンド帯（トグルON時に金色ハイライト） */}
      {showPlatinum ? (
        <g>
          <rect
            x={x(PLATINUM_RANGE_MHZ.minMHz)}
            y={148}
            width={x(PLATINUM_RANGE_MHZ.maxMHz) - x(PLATINUM_RANGE_MHZ.minMHz)}
            height={84}
            fill={diagramPalette.amber}
            opacity={0.16}
            stroke={diagramPalette.amberDeep}
            strokeDasharray="4 4"
          />
          <text x={x(PLATINUM_RANGE_MHZ.minMHz)} y={142} fill={diagramPalette.amberDeep} fontSize={10} fontWeight={700}>
            プラチナバンド（700〜900MHz帯）
          </text>
        </g>
      ) : null}

      {/* バンド帯: FDDはUL+DLの2枠＋点線コネクタ、TDDは1枠。クリック/Enterで選択 */}
      {CELLULAR_BANDS.map((band) => {
        const layout = LANE_LAYOUT[band.key];
        const y = laneY[layout.lane];
        const span = bandSpan(band);
        const spanCenterX = (x(span.minMHz) + x(span.maxMHz)) / 2;
        const isHit = hitKeys.includes(band.key);
        const isSelected = band.key === selectedKey;
        const fill = fillFor(band);
        const stroke = strokeFor(band);
        const opacity = isHit || isSelected ? 1 : 0.55;
        const rects = band.tdd
          ? [{ range: band.tdd, ul: false }]
          : [
              { range: band.uplink!, ul: true },
              { range: band.downlink!, ul: false }
            ];
        const labelY = layout.labelBelow ? y + rectH + 13 : y - 7;
        return (
          <g
            key={band.key}
            data-band-key={band.key}
            data-hit={isHit ? "1" : "0"}
            role="button"
            tabIndex={0}
            aria-label={`${band.key}（${band.nickname}・${band.generation} ${band.duplex}）を選択`}
            aria-pressed={isSelected}
            className="cursor-pointer focus:outline-none"
            onClick={() => onSelect(band.key)}
            onKeyDown={(event) => handleKeyDown(event, band.key)}
          >
            {/* FDDのUL-DL間コネクタ（同じBandの2枠を結ぶ） */}
            {band.tdd ? null : (
              <line
                x1={x(band.uplink!.maxMHz)}
                x2={x(band.downlink!.minMHz)}
                y1={y + rectH / 2}
                y2={y + rectH / 2}
                stroke={stroke}
                strokeDasharray="2 3"
                opacity={opacity}
              />
            )}
            {rects.map(({ range, ul }) => (
              <rect
                key={`${band.key}-${ul ? "ul" : "dl"}`}
                x={x(range.minMHz)}
                y={y}
                width={Math.max(3, x(range.maxMHz) - x(range.minMHz))}
                height={rectH}
                rx={3}
                fill={fill}
                opacity={ul ? opacity * 0.6 : opacity}
                stroke={isSelected ? diagramPalette.ink : isHit ? stroke : "none"}
                strokeWidth={isSelected ? 2.5 : 1.5}
              />
            ))}
            <text
              x={spanCenterX}
              y={labelY}
              textAnchor="middle"
              fill={isSelected ? diagramPalette.ink : stroke}
              fontSize={10}
              fontWeight={isSelected || isHit ? 700 : 600}
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {band.key}
            </text>
          </g>
        );
      })}

      {/* 周波数カーソル（入力連動の縦線） */}
      {cursorX !== null ? (
        <g>
          <line
            x1={cursorX}
            x2={cursorX}
            y1={34}
            y2={chart.axisY}
            stroke={chartTheme.reference.sensitivity}
            strokeDasharray={chartTheme.reference.sensitivityDash}
            strokeWidth={1.5}
          />
          <text
            x={cursorX}
            y={26}
            textAnchor={cursorX > chart.width * 0.85 ? "end" : cursorX < chart.width * 0.15 ? "start" : "middle"}
            fill={chartTheme.reference.sensitivity}
            fontSize={11}
            fontWeight={700}
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {formatNumber(freqMHz!, 0)}MHz
          </text>
        </g>
      ) : null}
    </svg>
  );
}

// ---- 「この周波数の性質」4軸ミニ表示 -------------------------------------------------
// 定性3段階（低い=届く・高い=速い の入口理解用）。しきい値は帯域の慣用区分による目安。

type PropertyRow = { label: string; level: 1 | 2 | 3; text: string };

function frequencyProperties(freqMHz: number): PropertyRow[] {
  const low = freqMHz <= 1000;
  const mid = freqMHz > 1000 && freqMHz <= 6000;
  return [
    {
      label: "回り込み（回折）",
      level: low ? 3 : mid ? 2 : 1,
      text: low ? "障害物の裏へ回り込みやすい" : mid ? "見通し外はやや苦手" : "ほぼ直進のみ（影に弱い）"
    },
    {
      label: "建物への透過",
      level: low ? 3 : mid ? 2 : 1,
      text: low ? "壁を抜けて屋内に届きやすい" : mid ? "壁で目に見えて減る" : "壁・窓でほぼ止まる"
    },
    {
      label: "アンテナ（λ/2）",
      level: low ? 1 : mid ? 2 : 3,
      text: `目安 ${formatNumber(halfWavelengthMm(freqMHz), 1)}mm（低いほど大型）`
    },
    {
      label: "速度（帯域幅）",
      level: low ? 1 : mid ? 2 : 3,
      text: low ? "幅が狭く高速化は苦手" : mid ? "百MHz級の幅を確保できる" : "GHz級の幅＝桁違いの速度"
    }
  ];
}

function LevelDots({ level }: { level: 1 | 2 | 3 }) {
  return (
    <span className="flex items-center gap-1" aria-label={`3段階中${level}`}>
      {[1, 2, 3].map((step) => (
        <span
          key={step}
          className={`h-2 w-2 rounded-full ${step <= level ? "bg-staf" : "bg-slate-200"}`}
        />
      ))}
    </span>
  );
}

// ---- パネル本体 -----------------------------------------------------------------------

export function CellularBandMapPanel() {
  // 既定900MHz: プラチナ帯（B8のUL帯）に載せ、「低い帯から地図を読む」導入にする。
  const [freqMHz, setFreqMHz] = useState(900);
  const [selectedKey, setSelectedKey] = useState("B8");
  const [showPlatinum, setShowPlatinum] = useState(false);

  const freqValid = Number.isFinite(freqMHz) && freqMHz > 0;

  const matches: BandMatch[] = useMemo(() => {
    try {
      return findBandsByFrequency(freqMHz);
    } catch {
      return [];
    }
  }, [freqMHz]);

  const hitKeys = matches.map((m) => m.band.key);
  const selectedBand = CELLULAR_BANDS.find((band) => band.key === selectedKey) ?? CELLULAR_BANDS[0];
  const selectedRep = bandRepresentativeFrequencyMHz(selectedBand);

  const freqError = !freqValid ? "周波数は0より大きい値を入力してください。" : undefined;

  const primary = {
    label: "この周波数の該当バンド数",
    value: freqValid ? String(matches.length) : "—",
    unit: "バンド"
  };

  const sliderLog = Math.min(LOG_MAX, Math.max(LOG_MIN, freqValid ? Math.log10(freqMHz) : LOG_MIN));

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
          <h2 className="text-base font-bold text-slate-950">周波数を動かして地図を読む</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            「Band」は3GPPが周波数のレンジに付けた名前です。周波数を動かすと、地図上のカーソルが
            該当するバンドを照らし、その周波数の性質（届きやすさ・速さ・アンテナの大きさ）が連動します。
          </p>

          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-500">代表周波数のプリセット</p>
            <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="周波数プリセット">
              {FREQUENCY_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  className={chipClass(freqMHz === preset.valueMHz)}
                  onClick={() => setFreqMHz(preset.valueMHz)}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <Field
              id="bandMapFrequency"
              label="周波数"
              unit="MHz"
              value={freqMHz}
              min={MAP_MIN_MHZ}
              max={MAP_MAX_MHZ}
              step={1}
              emptyBehavior="preserve"
              onChange={setFreqMHz}
              help="スマホの電波が使う周波数です。低いほど遠く・奥まで届き、高いほど速度を出せます。地図は600MHz〜30GHzを対数軸で表示します。"
              example="900"
              error={freqError}
            />
            <label className="block">
              <span className="text-xs font-semibold text-slate-500">
                スライダー（対数スケール: 低い帯ほど細かく動かせます）
              </span>
              <input
                type="range"
                min={LOG_MIN}
                max={LOG_MAX}
                step={0.005}
                value={sliderLog}
                onChange={(event) => setFreqMHz(Math.round(10 ** Number(event.target.value)))}
                aria-label="周波数のスライダー（対数スケール）"
                className="mt-2 w-full"
              />
            </label>
            <button
              type="button"
              className={chipClass(showPlatinum)}
              aria-pressed={showPlatinum}
              onClick={() => setShowPlatinum((prev) => !prev)}
            >
              プラチナバンド（700〜900MHz帯）を金色で表示
            </button>
            {showPlatinum ? (
              <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-950">
                <strong>なぜ「プラチナ」？</strong>
                　700〜900MHz帯は ①障害物の裏へ回り込む（回折しやすい）②建物の壁を透過しやすい
                ③λ/2アンテナが手頃な大きさ（約150〜210mm）で端末に収めやすい——の3拍子が揃うためです。
                B8・B18・B19・B28がこの区分に入ります。
              </p>
            ) : null}
          </div>
        </Card>

        <div className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <div id="cellular-band-map-primary-result">
            <ResultBar primary={primary} />
          </div>

          <Card as="section" padding="lg">
            <h2 className="text-base font-bold text-slate-950">
              {formatNumber(freqMHz, 0)}MHzの該当バンド
            </h2>
            {matches.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {matches.map(({ band, segment }) => (
                  <button
                    key={band.key}
                    type="button"
                    className={chipClass(band.key === selectedKey)}
                    onClick={() => setSelectedKey(band.key)}
                  >
                    {band.key}（{segment === "TDD" ? "TDD" : `${segment}帯`}）
                  </button>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                この周波数を含む携帯バンドはありません（Wi-Fi・GNSSなど携帯以外の割当か、未割当の帯域です）。
              </p>
            )}
            <div className="mt-4 space-y-2.5">
              {freqValid
                ? frequencyProperties(freqMHz).map((row) => (
                    <div key={row.label} className="grid grid-cols-[128px_44px_1fr] items-center gap-2 text-xs">
                      <span className="font-semibold text-slate-600">{row.label}</span>
                      <LevelDots level={row.level} />
                      <span className="text-slate-500">{row.text}</span>
                    </div>
                  ))
                : null}
            </div>
          </Card>

          <Card as="section" padding="lg" data-testid="band-detail" data-band={selectedBand.key}>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-bold text-slate-950">
                {selectedBand.key}（{selectedBand.nickname}）
              </h2>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                {selectedBand.generation}
              </span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                {selectedBand.duplex}
              </span>
              {selectedBand.isPlatinum ? (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                  プラチナ
                </span>
              ) : null}
            </div>
            <dl className="mt-3 space-y-1.5 text-sm">
              {selectedBand.tdd ? (
                <div className="flex justify-between gap-3">
                  <dt className="text-slate-500">TDD共用</dt>
                  <dd className="font-semibold tabular-nums text-slate-900">
                    {selectedBand.tdd.minMHz}–{selectedBand.tdd.maxMHz} MHz（上り下りを時分割）
                  </dd>
                </div>
              ) : (
                <>
                  <div className="flex justify-between gap-3">
                    <dt className="text-slate-500">上り UL（端末→基地局）</dt>
                    <dd className="font-semibold tabular-nums text-slate-900">
                      {selectedBand.uplink!.minMHz}–{selectedBand.uplink!.maxMHz} MHz
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-slate-500">下り DL（基地局→端末）</dt>
                    <dd className="font-semibold tabular-nums text-slate-900">
                      {selectedBand.downlink!.minMHz}–{selectedBand.downlink!.maxMHz} MHz
                    </dd>
                  </div>
                </>
              )}
            </dl>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <MetricCard
                label="波長 λ"
                value={formatNumber(wavelengthMm(selectedRep), 1)}
                unit="mm"
                sub={`代表 ${formatNumber(selectedRep, 0)}MHz（${selectedBand.tdd ? "レンジ中心" : "DL帯中心"}）`}
                size="sm"
              />
              <MetricCard
                label="λ/2 アンテナ目安"
                value={formatNumber(halfWavelengthMm(selectedRep), 1)}
                unit="mm"
                sub="半波長素子の長さの当たり"
                size="sm"
              />
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">{selectedBand.note}</p>
          </Card>
        </div>
      </section>

      <div className="mt-6">
        <ChartFrame
          eyebrow="バンド地図"
          title="周波数と4G/5Gバンドの地図（600MHz〜30GHz・対数軸）"
          description="下段が4G（LTE）、上段が5G（NR）。FDDバンドは上り（薄い枠）と下り（濃い枠）が離れた周波数のペアで、点線がその対応を示します。帯をクリック/タップすると詳細カードに反映されます。"
          exportName="cellular-band-map"
          aside={
            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-600">
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: chartTheme.series.source }} />
                4G
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: chartTheme.series.gain }} />
                5G
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: diagramPalette.amber }} />
                プラチナ（表示ON時）
              </span>
            </div>
          }
          caption={
            freqValid
              ? `カーソル: ${formatNumber(freqMHz, 0)}MHz ─ 該当バンド: ${hitKeys.join("・") || "なし"} ／ 選択中: ${selectedBand.key}（${selectedBand.nickname}）。レンジは3GPP TS 36.101 / TS 38.101-1 / TS 38.101-2、国内割当の通称は総務省資料（2026年時点）による。`
              : "周波数の入力値を確認してください。"
          }
        >
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
            <BandMapSvg
              freqMHz={freqValid ? freqMHz : null}
              hitKeys={hitKeys}
              selectedKey={selectedKey}
              showPlatinum={showPlatinum}
              onSelect={setSelectedKey}
            />
          </div>
        </ChartFrame>
      </div>

      <div className="mt-6">
        <FormulaExplanationCard
          title="基礎から: Band番号と周波数の関係を読む"
          formula="Band = 3GPPが周波数レンジに付けた名前　λ[mm] ≈ 299792 ÷ f[MHz]（λ/2が基本アンテナ長の目安）"
          showColumnLink={false}
        >
          <p>
            <strong>① Band番号は「周波数レンジの名前」です。</strong>
            B1やn78という記号は、3GPP（携帯通信の国際標準化団体）が「この範囲の周波数をこう呼ぶ」と
            決めたただの名前です。LTEはB＋数字、5G NRはn＋数字。スマホの対応バンド表は
            「この名前のレンジで送受信できます」という宣言にすぎません。
          </p>
          <p>
            <strong>② 低い＝届く、高い＝速い。</strong>
            周波数が低いほど波長が長く、障害物の裏へ回折で回り込み、壁も透過しやすくなります——だから
            700〜900MHz帯は「プラチナ」。一方、高い周波数ほど連続した広い帯域幅を確保でき、
            帯域幅はそのまま速度の原資になります。n77/n78は数百MHz、28GHzミリ波のn257は3GHz幅。
            低い帯は「届く係」、高い帯は「速い係」という分業です。
          </p>
          <p>
            <strong>③ 同じBandでも、上りと下りで周波数が違います（FDD）。</strong>
            たとえばB8は、端末→基地局（UL）が880〜915MHz、基地局→端末（DL）が925〜960MHz。
            送信と受信を別の周波数に分けてすれ違わせる方式がFDDです。対してB41やn78などのTDDは
            1つのレンジを時間で切り替えて共用します。地図でFDDの帯が2つに割れているのはこのためです。
          </p>
        </FormulaExplanationCard>
      </div>

      <div className="mt-6">
        <CellularBandMapColumn />
      </div>

      <MobileResultBar primary={primary} targetId="cellular-band-map-primary-result" />
    </>
  );
}
