"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Callout, type CalloutTone } from "@/components/Callout";
import { Card } from "@/components/Card";
import { ChartFrame } from "@/components/ChartFrame";
import { Field } from "@/components/Field";
import { MetricCard } from "@/components/MetricCard";
import { MobileResultBar } from "@/components/MobileResultBar";
import { ResultBar } from "@/components/ResultBar";
import { chartTheme } from "@/lib/chartTheme";
import { diagramPalette, diagramStroke } from "@/lib/ui/diagramTheme";
import {
  diffractionLossByBand,
  diffractionShadowLoss,
  type BandDiffractionLoss
} from "@/lib/rf/diffractionShadow";
import { formatMeters, formatNumber } from "@/lib/rf/format";
import { FormulaExplanationCard } from "./FormulaExplanationCard";
import { DiffractionShadowColumn } from "./DiffractionShadowColumn";

// 比較する6バンド（同一ジオメトリで一括計算し「同じ影・違う損失」を見せる）。
const BANDS = [
  { frequencyMHz: 150, label: "150MHz" },
  { frequencyMHz: 430, label: "430MHz" },
  { frequencyMHz: 920, label: "920MHz" },
  { frequencyMHz: 2400, label: "2.4GHz" },
  { frequencyMHz: 5600, label: "5.6GHz" },
  { frequencyMHz: 28000, label: "28GHz" }
] as const;

type ObstacleKind = "building" | "hill" | "mountain";

// 障害物プリセット（高さは代表値。選択後に手動で調整できる）。
const OBSTACLE_PRESETS: ReadonlyArray<{ id: ObstacleKind; label: string; heightM: number }> = [
  { id: "building", label: "ビル（20m）", heightM: 20 },
  { id: "hill", label: "丘（50m）", heightM: 50 },
  { id: "mountain", label: "山（200m）", heightM: 200 }
];

// d1/d2 の対数スライダー（100m〜10km）。t∈[0,200] ↔ 距離[m] = 100·10^(t/100)。
const DISTANCE_MIN_M = 100;
const DISTANCE_MAX_M = 10_000;
const sliderFromM = (m: number) =>
  100 * Math.log10(Math.max(DISTANCE_MIN_M, Math.min(DISTANCE_MAX_M, m)) / DISTANCE_MIN_M);
const mFromSlider = (t: number) => Math.round(DISTANCE_MIN_M * 10 ** (t / 100));

function bandLabelOf(frequencyMHz: number): string {
  return BANDS.find((band) => band.frequencyMHz === frequencyMHz)?.label ?? `${frequencyMHz}MHz`;
}

// ---- 周波数比較の横棒グラフ（入力連動の動的SVG） -------------------------------------
// 同じ障害物ジオメトリに対する6バンドの回折損失を横棒で並べる。
// テキストは属性直指定（書き出したSVG単体でも画面と同じ見た目）。

function BandLossBars({
  results,
  selectedMHz
}: {
  results: BandDiffractionLoss[];
  selectedMHz: number;
}) {
  const chart = { width: 640, height: 300, top: 26, right: 84, bottom: 36, left: 80 };
  const maxLossRaw = Math.max(...results.map((r) => r.lossDb));
  const maxLoss = Math.max(12, Math.ceil((maxLossRaw + 2) / 5) * 5);
  const plotW = chart.width - chart.left - chart.right;
  const plotH = chart.height - chart.top - chart.bottom;
  const rowH = plotH / results.length;
  const barH = Math.min(22, rowH - 8);
  const x = (loss: number) => chart.left + (loss / maxLoss) * plotW;
  const tickStep = maxLoss > 30 ? 10 : 5;
  const ticks: number[] = [];
  for (let t = 0; t <= maxLoss; t += tickStep) {
    ticks.push(t);
  }

  return (
    <svg
      role="img"
      aria-label={`同じ障害物ジオメトリでの周波数別回折損失。選択中の${bandLabelOf(selectedMHz)}は${formatNumber(
        results.find((r) => r.frequencyMHz === selectedMHz)?.lossDb ?? Number.NaN,
        1
      )}dB`}
      viewBox={`0 0 ${chart.width} ${chart.height}`}
      className="h-auto w-full"
    >
      <rect width={chart.width} height={chart.height} fill={chartTheme.surface.canvas} />
      {ticks.map((tick) => (
        <g key={tick}>
          <line
            x1={x(tick)}
            x2={x(tick)}
            y1={chart.top}
            y2={chart.height - chart.bottom}
            stroke={chartTheme.grid.primary}
          />
          <text
            x={x(tick)}
            y={chart.height - chart.bottom + 16}
            textAnchor="middle"
            fill={diagramPalette.muted}
            fontSize={11}
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {tick}
          </text>
        </g>
      ))}
      <text
        x={chart.width - chart.right}
        y={chart.height - chart.bottom + 30}
        textAnchor="end"
        fill={diagramPalette.muted}
        fontSize={11}
      >
        回折損失 [dB]
      </text>

      {/* 縁すれすれ（v=0）＝約6dBの基準線 */}
      {maxLoss >= 6.02 ? (
        <g>
          <line
            x1={x(6.02)}
            x2={x(6.02)}
            y1={chart.top - 4}
            y2={chart.height - chart.bottom}
            stroke={chartTheme.reference.baseline}
            strokeDasharray={chartTheme.reference.baselineDash}
          />
          <text
            x={x(6.02) + 4}
            y={chart.top - 8}
            fill={diagramPalette.muted}
            fontSize={10}
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            6dB＝縁すれすれ
          </text>
        </g>
      ) : null}

      {results.map((row, index) => {
        const selected = row.frequencyMHz === selectedMHz;
        const yTop = chart.top + index * rowH + (rowH - barH) / 2;
        const barW = Math.max(2, x(Math.min(row.lossDb, maxLoss)) - chart.left);
        return (
          <g key={row.frequencyMHz}>
            <text
              x={chart.left - 8}
              y={yTop + barH / 2 + 4}
              textAnchor="end"
              fill={selected ? diagramPalette.stafDark : diagramPalette.inkSoft}
              fontSize={12}
              fontWeight={selected ? 700 : 600}
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {bandLabelOf(row.frequencyMHz)}
            </text>
            <rect
              x={chart.left}
              y={yTop}
              width={barW}
              height={barH}
              rx={4}
              fill={selected ? chartTheme.series.source : chartTheme.grid.secondary}
              stroke={selected ? chartTheme.seriesText.source : diagramPalette.faint}
              strokeWidth={chartTheme.stroke.barBorder}
            />
            <text
              x={chart.left + barW + 6}
              y={yTop + barH / 2 + 4}
              fill={selected ? chartTheme.seriesText.source : diagramPalette.muted}
              fontSize={11}
              fontWeight={selected ? 700 : 600}
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {formatNumber(row.lossDb, 1)}dB
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ---- 断面図（送信塔→障害物→受信点。影の濃さ＝選択バンドの損失で塗る動的SVG） --------

function ShadowCrossSection({
  kind,
  obstacleHeightM,
  d1M,
  d2M,
  txHeightM,
  rxHeightM,
  band
}: {
  kind: ObstacleKind;
  obstacleHeightM: number;
  d1M: number;
  d2M: number;
  txHeightM: number;
  rxHeightM: number;
  band: BandDiffractionLoss;
}) {
  const chart = { width: 680, height: 320, top: 30, left: 20, right: 20, bottom: 46 };
  const groundY = chart.height - chart.bottom;
  const plotW = chart.width - chart.left - chart.right;
  const plotH = groundY - chart.top;
  const totalM = d1M + d2M;
  const maxH = Math.max(txHeightM, rxHeightM, obstacleHeightM, 1) * 1.2 + 2;
  const xOf = (m: number) => chart.left + (m / totalM) * plotW;
  const yOf = (h: number) => groundY - (h / maxH) * plotH;

  const xTx = xOf(0);
  const xObst = xOf(d1M);
  const xRx = xOf(totalM);
  const yTx = yOf(txHeightM);
  const yRx = yOf(rxHeightM);
  const yObst = yOf(obstacleHeightM);

  // 影の濃さ: 障害物の背後に受信点を仮想的に振り（水平16×垂直9）、各点の回折損失を
  // 選択バンドで計算して不透明度にマップする（30dBで最濃）。入力に連動する。
  const cells: Array<{ x: number; y: number; w: number; h: number; opacity: number }> = [];
  if (obstacleHeightM > 0) {
    const nx = 16;
    const ny = 9;
    const colW = (xRx - xObst) / nx;
    const rowH = (groundY - yObst) / ny;
    for (let ix = 0; ix < nx; ix += 1) {
      const dM = d1M + ((ix + 0.5) / nx) * d2M;
      const d2v = dM - d1M;
      if (d2v <= 0) continue;
      for (let iy = 0; iy < ny; iy += 1) {
        const hM = ((iy + 0.5) / ny) * obstacleHeightM;
        const losAtObstacle = txHeightM + (hM - txHeightM) * (d1M / dM);
        const hAboveLos = obstacleHeightM - losAtObstacle;
        let lossDb = 0;
        try {
          lossDb = diffractionShadowLoss(
            { obstacleHeightAboveLosM: hAboveLos, d1M, d2M: d2v },
            band.frequencyMHz
          ).lossDb;
        } catch {
          lossDb = 0;
        }
        const opacity = (Math.min(lossDb, 30) / 30) * 0.5;
        if (opacity <= 0.01) continue;
        cells.push({
          x: xObst + ix * colW,
          y: yObst + iy * rowH,
          w: colW + 0.5,
          h: rowH + 0.5,
          opacity
        });
      }
    }
  }

  // 障害物シルエット（ビル=矩形／丘=なだらかな曲線／山=三角）。
  const halfW = kind === "building" ? 11 : Math.min(80, plotW * 0.1);
  let obstacleShape: ReactNode;
  if (kind === "building") {
    obstacleShape = (
      <rect
        x={xObst - halfW}
        y={yObst}
        width={halfW * 2}
        height={groundY - yObst}
        fill={diagramPalette.inkSoft}
        stroke={diagramPalette.ink}
        strokeWidth={diagramStroke.main}
      />
    );
  } else if (kind === "hill") {
    obstacleShape = (
      <path
        d={`M ${xObst - halfW} ${groundY} Q ${xObst} ${2 * yObst - groundY} ${xObst + halfW} ${groundY} Z`}
        fill={diagramPalette.success}
        fillOpacity={0.4}
        stroke={diagramPalette.successDeep}
        strokeWidth={diagramStroke.main}
      />
    );
  } else {
    obstacleShape = (
      <polygon
        points={`${xObst - halfW},${groundY} ${xObst},${yObst} ${xObst + halfW},${groundY}`}
        fill={diagramPalette.faint}
        stroke={diagramPalette.inkMuted}
        strokeWidth={diagramStroke.main}
      />
    );
  }

  return (
    <svg
      role="img"
      aria-label={`断面図。送信塔（高さ${formatNumber(txHeightM, 1)}m）から障害物（高さ${formatNumber(
        obstacleHeightM,
        0
      )}m）を越えて受信点（高さ${formatNumber(rxHeightM, 1)}m）へ。${bandLabelOf(
        band.frequencyMHz
      )}の回折損失は${formatNumber(band.lossDb, 1)}dB`}
      viewBox={`0 0 ${chart.width} ${chart.height}`}
      className="h-auto w-full"
    >
      <rect width={chart.width} height={chart.height} fill={chartTheme.surface.canvas} />

      {/* 影の濃さ（選択バンドの損失→不透明度） */}
      {cells.map((cell, index) => (
        <rect
          key={index}
          x={cell.x}
          y={cell.y}
          width={cell.w}
          height={cell.h}
          fill={diagramPalette.ink}
          opacity={cell.opacity}
        />
      ))}

      {/* 地面 */}
      <rect
        x={0}
        y={groundY}
        width={chart.width}
        height={chart.height - groundY}
        fill={diagramPalette.grid}
      />
      <line x1={0} x2={chart.width} y1={groundY} y2={groundY} stroke={diagramPalette.muted} />

      {/* 障害物 */}
      {obstacleShape}
      <text
        x={xObst}
        y={Math.max(yObst - 6, 12)}
        textAnchor="middle"
        fill={diagramPalette.inkSoft}
        fontSize={11}
        fontWeight={600}
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {formatNumber(obstacleHeightM, 0)}m
      </text>

      {/* 見通し線（LOS）: 破線 */}
      <line
        x1={xTx}
        y1={yTx}
        x2={xRx}
        y2={yRx}
        stroke={chartTheme.reference.baseline}
        strokeDasharray={chartTheme.reference.baselineDash}
        strokeWidth={diagramStroke.main}
      />

      {/* 回折経路: 送信→障害物頂点→受信点の折れ線 */}
      <polyline
        points={`${xTx},${yTx} ${xObst},${yObst} ${xRx},${yRx}`}
        fill="none"
        stroke={diagramPalette.path}
        strokeWidth={diagramStroke.emphasis}
        strokeLinejoin="round"
      />

      {/* 送信塔 */}
      <line x1={xTx} y1={groundY} x2={xTx} y2={yTx} stroke={diagramPalette.staf} strokeWidth={3} />
      <circle cx={xTx} cy={yTx} r={5} fill={diagramPalette.staf} stroke={diagramPalette.white} strokeWidth={1.5} />
      <text x={xTx + 8} y={yTx - 8} fill={diagramPalette.stafDark} fontSize={11} fontWeight={600}>
        送信 {formatNumber(txHeightM, 0)}m
      </text>

      {/* 受信点 */}
      <line x1={xRx} y1={groundY} x2={xRx} y2={yRx} stroke={diagramPalette.stafDeep} strokeWidth={3} />
      <circle cx={xRx} cy={yRx} r={5} fill={diagramPalette.stafDeep} stroke={diagramPalette.white} strokeWidth={1.5} />
      <text
        x={xRx - 8}
        y={Math.min(yRx - 10, groundY - 8)}
        textAnchor="end"
        fill={diagramPalette.stafDark}
        fontSize={11}
        fontWeight={600}
      >
        受信点 {formatNumber(rxHeightM, 1)}m
      </text>

      {/* 距離ラベル */}
      <text
        x={(xTx + xObst) / 2}
        y={groundY + 18}
        textAnchor="middle"
        fill={diagramPalette.muted}
        fontSize={11}
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        d1 = {formatNumber(d1M, 0)}m
      </text>
      <text
        x={(xObst + xRx) / 2}
        y={groundY + 18}
        textAnchor="middle"
        fill={diagramPalette.muted}
        fontSize={11}
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        d2 = {formatNumber(d2M, 0)}m
      </text>

      {/* 選択バンドの注記 */}
      <text
        x={chart.width - chart.right}
        y={chart.top - 12}
        textAnchor="end"
        fill={chartTheme.seriesText.source}
        fontSize={12}
        fontWeight={700}
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {bandLabelOf(band.frequencyMHz)}: 受信点の回折損失 {formatNumber(band.lossDb, 1)}dB
      </text>
    </svg>
  );
}

// ---- 本体 -----------------------------------------------------------------------------

const VERDICT_META: Array<{
  matches: (lossDb: number) => boolean;
  tone: CalloutTone;
  label: string;
  lead: string;
}> = [
  {
    matches: (lossDb) => lossDb === 0,
    tone: "success",
    label: "見通し余裕あり",
    lead: "障害物は見通し線より十分下（v≤-0.78）で、回折損失はほぼ無視できます。"
  },
  {
    matches: (lossDb) => lossDb < 6.5,
    tone: "caution",
    label: "縁すれすれ",
    lead: "見通し線が障害物の縁をかすめています。縁すれすれ（v=0）でも約6dB失われるのがナイフエッジ回折の要点です。"
  },
  {
    matches: (lossDb) => lossDb < 20,
    tone: "caution",
    label: "影の中",
    lead: "受信点は影に入っています。同じ影でも低い周波数（長い波長）ほど損失が小さい＝回り込みで粘れます。"
  },
  {
    matches: () => true,
    tone: "danger",
    label: "深い影",
    lead: "回折だけで20dB以上失われる深い影です。周波数を下げる・アンテナを上げる・経路や中継を変える検討が必要です。"
  }
];

export function DiffractionShadowPanel() {
  // 既定: ビル20m・d1=d2=1000m・送信塔10m・受信点1.5m・920MHz選択
  // → LOS高5.75m・h=14.25m・v≈1.579・J≈17.2dB（libのテストと同式で検算）。
  const [obstacleKind, setObstacleKind] = useState<ObstacleKind>("building");
  const [obstacleHeightM, setObstacleHeightM] = useState(20);
  const [d1M, setD1M] = useState(1000);
  const [d2M, setD2M] = useState(1000);
  const [txHeightM, setTxHeightM] = useState(10);
  const [rxHeightM, setRxHeightM] = useState(1.5);
  const [selectedBandMHz, setSelectedBandMHz] = useState<number>(920);

  // LOS基準の障害物高さ h（正=遮蔽・負=余裕）。LOSは送信頂→受信点の直線。
  const losHeightAtObstacleM = txHeightM + (rxHeightM - txHeightM) * (d1M / (d1M + d2M));
  const hAboveLosM = obstacleHeightM - losHeightAtObstacleM;

  const results = useMemo(() => {
    try {
      return diffractionLossByBand({
        obstacleHeightAboveLosM: hAboveLosM,
        d1M,
        d2M,
        frequenciesMHz: BANDS.map((band) => band.frequencyMHz)
      });
    } catch {
      return null;
    }
  }, [hAboveLosM, d1M, d2M]);

  const selected = results?.find((row) => row.frequencyMHz === selectedBandMHz) ?? null;
  const verdict =
    selected === null ? null : VERDICT_META.find((meta) => meta.matches(selected.lossDb)) ?? null;

  const obstacleHeightError =
    !Number.isFinite(obstacleHeightM) || obstacleHeightM < 0
      ? "障害物の高さは0m以上で入力してください。"
      : undefined;
  const distanceError = (value: number) =>
    !Number.isFinite(value) || value < DISTANCE_MIN_M || value > DISTANCE_MAX_M
      ? "距離は100〜10000mの範囲で入力してください。"
      : undefined;
  const heightError = (value: number) =>
    !Number.isFinite(value) || value < 0 ? "高さは0m以上で入力してください。" : undefined;

  const primary = {
    label: `回折損失（${bandLabelOf(selectedBandMHz)}）`,
    value: selected === null ? "—" : formatNumber(selected.lossDb, 1),
    unit: "dB"
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
            送信塔→障害物→受信点の断面を決めると、障害物の縁を越えて影へ「回り込む」ときの損失を
            6つの周波数で一括計算します。同じ影でも、波長が長い（周波数が低い）ほど損失は小さくなります。
          </p>

          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-500">障害物プリセット（高さは手動調整できます）</p>
            <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="障害物プリセット">
              {OBSTACLE_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  className={chipClass(obstacleKind === preset.id && obstacleHeightM === preset.heightM)}
                  onClick={() => {
                    setObstacleKind(preset.id);
                    setObstacleHeightM(preset.heightM);
                  }}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs font-semibold text-slate-500">主表示のバンド（グラフはいつも6バンド比較）</p>
            <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="表示バンド">
              {BANDS.map((band) => (
                <button
                  key={band.frequencyMHz}
                  type="button"
                  className={chipClass(selectedBandMHz === band.frequencyMHz)}
                  onClick={() => setSelectedBandMHz(band.frequencyMHz)}
                >
                  {band.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <Field
              id="diffractionObstacleHeight"
              label="障害物の高さ"
              unit="m"
              value={obstacleHeightM}
              min={0}
              max={500}
              step={1}
              emptyBehavior="preserve"
              onChange={setObstacleHeightM}
              help="地面から測った障害物頂点の高さです。ビル・丘・山のプリセットから選んで微調整できます。"
              example="20"
              error={obstacleHeightError}
            />
            <div>
              <Field
                id="diffractionD1"
                label="送信塔→障害物の距離 d1"
                unit="m"
                value={d1M}
                min={DISTANCE_MIN_M}
                max={DISTANCE_MAX_M}
                step={10}
                emptyBehavior="preserve"
                onChange={setD1M}
                help="送信アンテナから障害物までの水平距離です。スライダーは100m〜10kmの対数目盛りです。"
                example="1000"
                error={distanceError(d1M)}
              />
              <input
                type="range"
                min={0}
                max={200}
                step={1}
                value={sliderFromM(d1M)}
                onChange={(event) => setD1M(mFromSlider(Number(event.target.value)))}
                aria-label="送信塔→障害物の距離 d1 のスライダー（100m〜10km・対数）"
                className="mt-2 w-full"
              />
            </div>
            <div>
              <Field
                id="diffractionD2"
                label="障害物→受信点の距離 d2"
                unit="m"
                value={d2M}
                min={DISTANCE_MIN_M}
                max={DISTANCE_MAX_M}
                step={10}
                emptyBehavior="preserve"
                onChange={setD2M}
                help="障害物から受信点までの水平距離です。障害物に近いほど影は深くなります。"
                example="1000"
                error={distanceError(d2M)}
              />
              <input
                type="range"
                min={0}
                max={200}
                step={1}
                value={sliderFromM(d2M)}
                onChange={(event) => setD2M(mFromSlider(Number(event.target.value)))}
                aria-label="障害物→受信点の距離 d2 のスライダー（100m〜10km・対数）"
                className="mt-2 w-full"
              />
            </div>
            <Field
              id="diffractionTxHeight"
              label="送信アンテナ高"
              unit="m"
              value={txHeightM}
              min={0}
              max={700}
              step={0.5}
              emptyBehavior="preserve"
              onChange={setTxHeightM}
              help="送信アンテナの地上高です。高くするほど見通し線が持ち上がり、影が浅くなります（スカイツリーが634mになった理由）。"
              example="10"
              error={heightError(txHeightM)}
            />
            <Field
              id="diffractionRxHeight"
              label="受信点の高さ"
              unit="m"
              value={rxHeightM}
              min={0}
              max={100}
              step={0.5}
              emptyBehavior="preserve"
              onChange={setRxHeightM}
              help="受信アンテナの地上高です。手持ち端末なら1.5m程度です。"
              example="1.5"
              error={heightError(rxHeightM)}
            />
          </div>
        </Card>

        <div className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <div id="diffraction-shadow-primary-result">
            <ResultBar primary={primary} />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <MetricCard
              label="回折パラメータ v"
              value={selected === null ? "—" : formatNumber(selected.vParam, 2)}
              sub="食い込み深さの無次元化"
              hint="v = h·√(2(d1+d2)/(λ·d1·d2))。同じ食い込みhでも波長λが短いほどvが大きく＝影が深くなります。v=0が縁すれすれ、v≤-0.78で損失0dBです。"
            />
            <MetricCard
              label="波長 λ"
              value={selected === null ? "—" : formatMeters(selected.wavelengthM)}
              sub={bandLabelOf(selectedBandMHz)}
              hint="回り込みやすさを決めるものさしです。波長が障害物の食い込みに対して長いほど、影の中へ曲がり込めます。"
            />
            <MetricCard
              label="LOSからの食い込み h"
              value={Number.isFinite(hAboveLosM) ? formatNumber(hAboveLosM, 1) : "—"}
              unit="m"
              sub={hAboveLosM > 0 ? "正=見通し線を遮る" : "負=見通し余裕あり"}
              hint="送信頂と受信点を結ぶ見通し線(LOS)から測った、障害物頂点の高さです。"
            />
          </div>

          {verdict && selected ? (
            <Callout tone={verdict.tone}>
              <p className="text-sm font-bold">{verdict.label}</p>
              <p className="mt-1 text-sm leading-relaxed">{verdict.lead}</p>
            </Callout>
          ) : null}

          <Card as="section" padding="lg">
            <h2 className="text-base font-bold text-slate-950">実務への出口</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              この回折損失（{primary.value}dB）を
              <Link
                href="/tools/rf-basic-link-calculator"
                className="mx-1 inline-flex items-center gap-1 rounded font-semibold text-staf-dark transition hover:text-staf focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-staf/40"
              >
                リンクバジェット診断の環境損失
                <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
              </Link>
              に足すと、影の中の受信点まで届くかを見積もれます。見通しがある場合のクリアランス設計は
              <Link
                href="/tools/fresnel-zone"
                className="mx-1 inline-flex items-center gap-1 rounded font-semibold text-staf-dark transition hover:text-staf focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-staf/40"
              >
                フレネルゾーン半径
                <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
              </Link>
              で確認してください。
            </p>
          </Card>
        </div>
      </section>

      <div className="mt-6">
        <ChartFrame
          eyebrow="周波数比較"
          title="同じ影・違う損失 ─ 6バンドの回折損失"
          description="同一の障害物ジオメトリに対して、150MHz〜28GHzの回折損失を並べています。低い周波数（長い波長）ほど影へ回り込みやすく、損失が小さくなります。入力に連動して動きます。"
          exportName="diffraction-shadow-bands"
          caption={
            results
              ? `条件: 障害物${formatNumber(obstacleHeightM, 0)}m / d1=${formatNumber(d1M, 0)}m / d2=${formatNumber(
                  d2M,
                  0
                )}m / 送信${formatNumber(txHeightM, 1)}m / 受信${formatNumber(rxHeightM, 1)}m ─ LOSからの食い込み h=${formatNumber(
                  hAboveLosM,
                  1
                )}m（ITU-R P.526 単一ナイフエッジ近似）`
              : "入力値を確認してください。"
          }
        >
          {results ? (
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
              <BandLossBars results={results} selectedMHz={selectedBandMHz} />
            </div>
          ) : (
            <p className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
              入力値を確認すると比較グラフが表示されます。
            </p>
          )}
        </ChartFrame>
      </div>

      <div className="mt-6">
        <ChartFrame
          eyebrow="断面図"
          title="障害物の影と回折経路"
          description="灰色の濃さが選択バンドの「影の濃さ」（その位置に受信点を置いたときの回折損失）です。青い折れ線が障害物の縁を越える回折経路、破線が遮られた見通し線(LOS)です。"
          exportName="diffraction-shadow-cross-section"
          caption={
            selected
              ? `${bandLabelOf(selectedBandMHz)}（λ=${formatMeters(selected.wavelengthM)}）の影を表示中。バンドを切り替えると影の濃さが変わります。`
              : "入力値を確認してください。"
          }
        >
          {selected ? (
            <div
              data-testid="diffraction-shadow-diagram"
              data-loss={formatNumber(selected.lossDb, 2)}
              className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50"
            >
              <ShadowCrossSection
                kind={obstacleKind}
                obstacleHeightM={obstacleHeightM}
                d1M={d1M}
                d2M={d2M}
                txHeightM={txHeightM}
                rxHeightM={rxHeightM}
                band={selected}
              />
            </div>
          ) : (
            <p className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
              入力値を確認すると断面図が表示されます。
            </p>
          )}
        </ChartFrame>
      </div>

      <div className="mt-6">
        <FormulaExplanationCard
          title="基礎から: なぜ電波は影に回り込むのか"
          formula="J(v) = 6.9 + 20·log10(√((v−0.1)²+1) + v − 0.1)［v > −0.78、それ以下は0dB］　v = h·√(2(d1+d2)/(λ·d1·d2))"
          showColumnLink={false}
        >
          <p>
            <strong>① 電波は波だから、障害物の縁で曲がります。</strong>
            水面の波が防波堤の切れ目から港の中へ広がるのと同じで、波面の各点は新しい波源として
            振る舞います（ホイヘンスの原理）。障害物の縁を通り過ぎた波面が影の側へも広がるので、
            光なら真っ黒な影でも、電波は縁がにじんで「少し届く」のです。
          </p>
          <p>
            <strong>② どれだけ曲がれるかは波長次第——それを1つの数にしたのがvです。</strong>
            v = h·√(2(d1+d2)/(λ·d1·d2)) は、見通し線への食い込み h を
            「その場所のフレネルゾーンの大きさ（＝波長λと距離で決まる波の通り道の太さ）」で
            測り直した無次元の深さです。同じ20mのビルでも、波長2mの150MHzにはvが小さく（浅い影）、
            波長1cmの28GHzにはvが大きい（深い影）。損失 J(v) はvだけで決まるので、
            「影の深さは波長で測る」がこのツールの核心です。
          </p>
          <p>
            <strong>③ 縁すれすれで約6dB＝「ちょうど半分」の直感。</strong>
            障害物の頂点が見通し線にぴったり触れる（v=0）とき、波面の下半分がちょうど遮られ、
            届く電界は半分になります。電界半分は 20·log10(1/2) ≈ −6dB。
            見通しがギリギリ通っていても6dB失われるからこそ、見通し通信では第1フレネルゾーンの
            60%を空ける（v≈−0.85で損失ほぼ0dB）実務則が使われます。
          </p>
        </FormulaExplanationCard>
      </div>

      <div className="mt-6">
        <DiffractionShadowColumn />
      </div>

      <MobileResultBar primary={primary} targetId="diffraction-shadow-primary-result" />
    </>
  );
}
