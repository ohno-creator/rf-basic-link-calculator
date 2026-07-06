"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/Card";
import { ChartFrame } from "@/components/ChartFrame";
import { Field } from "@/components/Field";
import { MobileResultBar } from "@/components/MobileResultBar";
import { ResultBar } from "@/components/ResultBar";
import { chartTheme } from "@/lib/chartTheme";
import { diagramPalette } from "@/lib/ui/diagramTheme";
import {
  allowableOffsetDeg,
  buildPointingMarginTable,
  MAIN_LOBE_EDGE_LOSS_DB,
  pointingLossDb
} from "@/lib/rf/pointingMargin";
import { formatNumber } from "@/lib/rf/format";
import { FormulaExplanationCard } from "./FormulaExplanationCard";
import { PointingMarginColumn } from "./PointingMarginColumn";

// 計算モード。ずれ角→利得低下 / 許容損失→許容ずれ角 の双方向。
type Mode = "offsetToLoss" | "lossToOffset";

// HPBW（半値角）プリセット。値はいずれも一次的な根拠のあるもののみ（曖昧値はプリセット化しない）。
// ・基地局セクタ水平65°/垂直10°: 3GPP TR 36.814 Table A.2.1.1-2 の基準アンテナ θ3dB（本libの出典と同一）。
// ・半波長ダイポール78°: 理想λ/2ダイポールのE面HPBW（Balanis "Antenna Theory" 4th ed. §4.6, 78°）。
// ・小型パラボラ2.5°: 0.6m径・14GHz（Ku帯）を HPBW≈70λ/D（Balanis 開口アンテナの経験則）で概算した代表例。
const HPBW_PRESETS = [
  { label: "小型パラボラ 2.5°", hpbwDeg: 2.5 },
  { label: "セクタ垂直 10°", hpbwDeg: 10 },
  { label: "セクタ水平 65°", hpbwDeg: 65 },
  { label: "λ/2ダイポール 78°", hpbwDeg: 78 }
] as const;

// 許容損失プリセット[dB]。3dB=半値角の端、1dB/0.5dBは高利得リンクの実務的な指向マージン。
const LOSS_PRESETS = [3, 1, 0.5] as const;

// 損失量に応じた色トークン（3dB以内=許容, 12dBの主ローブ端まで=注意, 超過=危険）。生hex禁止のためトークン参照。
function lossTone(lossDb: number): string {
  if (!Number.isFinite(lossDb)) return diagramPalette.muted;
  if (lossDb <= 3) return diagramPalette.successDeep;
  if (lossDb <= MAIN_LOBE_EDGE_LOSS_DB) return diagramPalette.amberDeep;
  return diagramPalette.dangerDeep;
}

// ---- 主ローブ放物線カーブ（入力連動の動的SVG） -------------------------------------
// 横軸 θ/HPBW、縦軸 -利得低下[dB]。L(θ)=12·(θ/HPBW)² を主ローブ内の下向き放物線として描く。
// 半値角(-3dB, θ=HPBW/2)と主ローブ端(-12dB, θ=HPBW)の水平基準線を右端に直接ラベリングする。
// テキストは属性直指定（書き出したSVG単体でも画面と同じ見た目）。
function PointingLossCurve({
  hpbwDeg,
  currentOffsetDeg,
  currentLossDb
}: {
  hpbwDeg: number;
  currentOffsetDeg: number;
  currentLossDb: number;
}) {
  const chart = { width: 640, height: 360, top: 28, right: 96, bottom: 52, left: 58 };
  const rMin = -1.35;
  const rMax = 1.35;
  const gMin = -15; // 縦軸の下端[dB]
  const gMax = 0;
  const plotW = chart.width - chart.left - chart.right;
  const plotH = chart.height - chart.top - chart.bottom;

  const x = (r: number) => chart.left + ((r - rMin) / (rMax - rMin)) * plotW;
  const y = (g: number) => chart.top + ((gMax - g) / (gMax - gMin)) * plotH;

  // 放物線カーブ（61点）。θ/HPBW=r に対して gain=-min(12r², 15)。
  const N = 61;
  const points = Array.from({ length: N }, (_, i) => {
    const r = rMin + (i / (N - 1)) * (rMax - rMin);
    const loss = MAIN_LOBE_EDGE_LOSS_DB * r * r;
    const g = Math.max(gMin, -loss);
    return { r, g };
  });
  const polyline = points.map((p) => `${x(p.r).toFixed(1)},${y(p.g).toFixed(1)}`).join(" ");
  const areaPath = `${polyline} ${x(rMax).toFixed(1)},${y(gMin).toFixed(1)} ${x(rMin).toFixed(1)},${y(gMin).toFixed(1)}`;

  const gTicks = [0, -3, -6, -9, -12, -15];
  const rTicks = [-1, -0.5, 0, 0.5, 1];
  const refLines = [
    { loss: 3, label: "半値角 -3dB（θ=HPBW/2）", color: diagramPalette.amberDeep },
    { loss: 12, label: "主ローブ端 -12dB（θ=HPBW）", color: diagramPalette.dangerDeep }
  ];

  const hasPoint = Number.isFinite(currentOffsetDeg) && Number.isFinite(currentLossDb) && hpbwDeg > 0;
  const rNow = hasPoint ? currentOffsetDeg / hpbwDeg : Number.NaN;
  const gNow = hasPoint ? Math.max(gMin, -currentLossDb) : Number.NaN;
  const rNowClamped = Math.max(rMin, Math.min(rMax, rNow));
  const tone = lossTone(currentLossDb);

  return (
    <svg
      role="img"
      aria-label={
        hasPoint
          ? `主ローブ放物線。ずれ角 θ/HPBW=${formatNumber(rNow, 2)} で利得低下 ${formatNumber(currentLossDb, 2)}dB`
          : "主ローブ放物線カーブ"
      }
      viewBox={`0 0 ${chart.width} ${chart.height}`}
      className="h-auto w-full"
    >
      <rect width={chart.width} height={chart.height} fill={chartTheme.surface.canvas} />

      {/* 横グリッド + dB目盛り */}
      {gTicks.map((g) => (
        <g key={g}>
          <line x1={chart.left} x2={chart.left + plotW} y1={y(g)} y2={y(g)} stroke={chartTheme.grid.primary} />
          <text
            x={chart.left - 8}
            y={y(g) + 4}
            textAnchor="end"
            fill={diagramPalette.muted}
            fontSize={11}
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {g}
          </text>
        </g>
      ))}
      <text x={chart.left} y={chart.top - 12} fill={diagramPalette.muted} fontSize={12} fontWeight={600}>
        利得低下 [dB]
      </text>

      {/* 縦グリッド + θ/HPBW目盛り */}
      {rTicks.map((r) => (
        <g key={r}>
          <line
            x1={x(r)}
            x2={x(r)}
            y1={chart.top}
            y2={chart.top + plotH}
            stroke={chartTheme.grid.primary}
            strokeDasharray={r === 0 ? undefined : "3 5"}
          />
          <text
            x={x(r)}
            y={chart.height - chart.bottom + 18}
            textAnchor="middle"
            fill={diagramPalette.muted}
            fontSize={11}
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {r}
          </text>
        </g>
      ))}
      <text
        x={chart.left + plotW}
        y={chart.height - 8}
        textAnchor="end"
        fill={diagramPalette.muted}
        fontSize={12}
        fontWeight={600}
      >
        ずれ角 θ / HPBW
      </text>

      {/* カーブ本体（塗り+線） */}
      <polygon points={areaPath} fill={chartTheme.series.source} opacity={chartTheme.overlay.secondary} />
      <polyline
        points={polyline}
        fill="none"
        stroke={chartTheme.series.source}
        strokeWidth={chartTheme.stroke.series}
      />

      {/* 半値角・主ローブ端の水平基準線（右端に直接ラベル） */}
      {refLines.map((ref) => (
        <g key={ref.loss}>
          <line
            x1={chart.left}
            x2={chart.left + plotW}
            y1={y(-ref.loss)}
            y2={y(-ref.loss)}
            stroke={ref.color}
            strokeDasharray={chartTheme.reference.sensitivityDash}
          />
          <text
            x={chart.left + plotW + 6}
            y={y(-ref.loss) + 4}
            fill={ref.color}
            fontSize={10}
            fontWeight={700}
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {ref.label.split("（")[0]}
          </text>
          <text x={chart.left + plotW + 6} y={y(-ref.loss) + 17} fill={ref.color} fontSize={9}>
            {`（${ref.label.split("（")[1] ?? ""}`}
          </text>
        </g>
      ))}

      {/* 現在点（ずれ角と利得低下）＋対称点＋読み取り補助線 */}
      {hasPoint ? (
        <g>
          {/* 対称位置（逆方向のずれ）を淡く */}
          <circle cx={x(-rNowClamped)} cy={y(gNow)} r={4} fill={tone} opacity={0.35} />
          {/* 読み取り補助線 */}
          <line x1={x(rNowClamped)} x2={x(rNowClamped)} y1={y(0)} y2={y(gNow)} stroke={tone} strokeDasharray="3 3" />
          <line x1={chart.left} x2={x(rNowClamped)} y1={y(gNow)} y2={y(gNow)} stroke={tone} strokeDasharray="3 3" />
          <circle cx={x(rNowClamped)} cy={y(gNow)} r={6} fill={tone} stroke={chartTheme.surface.plain} strokeWidth={2} />
          <text
            x={x(rNowClamped) + (rNowClamped > 0.6 ? -10 : 10)}
            y={y(gNow) - 10}
            textAnchor={rNowClamped > 0.6 ? "end" : "start"}
            fill={tone}
            fontSize={12}
            fontWeight={700}
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {`θ=${formatNumber(currentOffsetDeg, 1)}° → -${formatNumber(currentLossDb, 2)}dB`}
          </text>
        </g>
      ) : null}
    </svg>
  );
}

// ---- ビーム扇形ミニ図（θずれを矢印で表示） -----------------------------------------
function BeamFanDiagram({
  hpbwDeg,
  currentOffsetDeg,
  currentLossDb
}: {
  hpbwDeg: number;
  currentOffsetDeg: number;
  currentLossDb: number;
}) {
  const w = 260;
  const h = 300;
  const apex = { x: w / 2, y: 250 };
  const R = 178; // ビーム描画半径
  const valid = Number.isFinite(hpbwDeg) && hpbwDeg > 0;
  const half = valid ? Math.min(hpbwDeg / 2, 70) : 0; // 描画用の半角（見やすさのため上限クランプ）

  const dir = (deg: number, radius: number) => {
    const a = (deg * Math.PI) / 180;
    return { x: apex.x + radius * Math.sin(a), y: apex.y - radius * Math.cos(a) };
  };

  const p1 = dir(-half, R);
  const p2 = dir(half, R);
  const sector = `M ${apex.x} ${apex.y} L ${p1.x.toFixed(1)} ${p1.y.toFixed(1)} A ${R} ${R} 0 0 1 ${p2.x.toFixed(1)} ${p2.y.toFixed(1)} Z`;

  const tone = lossTone(currentLossDb);
  const drawOffset = Number.isFinite(currentOffsetDeg) ? Math.min(Math.abs(currentOffsetDeg), 90) : 0;
  const tip = dir(drawOffset, R + 6);
  // 矢じり（進行方向 u と直交 perp から二等辺三角形を作る）
  const a = (drawOffset * Math.PI) / 180;
  const u = { x: Math.sin(a), y: -Math.cos(a) };
  const perp = { x: Math.cos(a), y: Math.sin(a) };
  const base = { x: tip.x - 13 * u.x, y: tip.y - 13 * u.y };
  const aL = { x: base.x + 6 * perp.x, y: base.y + 6 * perp.y };
  const aR = { x: base.x - 6 * perp.x, y: base.y - 6 * perp.y };

  return (
    <svg
      role="img"
      aria-label={
        valid
          ? `ビーム扇形。HPBW ${formatNumber(hpbwDeg, 1)}度に対しずれ角 ${formatNumber(currentOffsetDeg, 1)}度`
          : "ビーム扇形の模式図"
      }
      viewBox={`0 0 ${w} ${h}`}
      className="h-auto w-full"
    >
      <rect width={w} height={h} fill={chartTheme.surface.canvas} />

      {/* 主ローブ（半値ビーム幅の扇形） */}
      <path d={sector} fill={diagramPalette.skyFill} opacity={0.5} stroke={diagramPalette.skyStroke} strokeWidth={1} />

      {/* ビーム中心（ボアサイト） */}
      {(() => {
        const b = dir(0, R);
        return (
          <line
            x1={apex.x}
            y1={apex.y}
            x2={b.x}
            y2={b.y}
            stroke={diagramPalette.staf}
            strokeWidth={1.5}
            strokeDasharray="5 4"
          />
        );
      })()}

      {/* ずれ方向の矢印（現在のθ） */}
      {valid && Number.isFinite(currentOffsetDeg) ? (
        <g>
          <line x1={apex.x} y1={apex.y} x2={tip.x} y2={tip.y} stroke={tone} strokeWidth={2.5} />
          <polygon points={`${tip.x},${tip.y} ${aL.x},${aL.y} ${aR.x},${aR.y}`} fill={tone} />
        </g>
      ) : null}

      {/* アンテナ（頂点） */}
      <circle cx={apex.x} cy={apex.y} r={5} fill={diagramPalette.inkSoft} />

      {/* ラベル */}
      <text x={apex.x} y={70} textAnchor="middle" fill={diagramPalette.stafDark} fontSize={11} fontWeight={600}>
        ビーム中心
      </text>
      {valid ? (
        <text
          x={p2.x + 4}
          y={p2.y + 14}
          fill={diagramPalette.stafDark}
          fontSize={11}
          fontWeight={600}
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {`HPBW ${formatNumber(hpbwDeg, 0)}°`}
        </text>
      ) : null}
      {valid && Number.isFinite(currentOffsetDeg) ? (
        <text
          x={tip.x + (drawOffset > 0 ? 6 : -6)}
          y={tip.y - 6}
          textAnchor={drawOffset > 0 ? "start" : "end"}
          fill={tone}
          fontSize={12}
          fontWeight={700}
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {`θ=${formatNumber(currentOffsetDeg, 1)}°`}
        </text>
      ) : null}
      <text
        x={apex.x}
        y={h - 10}
        textAnchor="middle"
        fill={diagramPalette.muted}
        fontSize={10}
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {Number.isFinite(currentLossDb) ? `利得低下 -${formatNumber(currentLossDb, 2)}dB` : "—"}
      </text>
    </svg>
  );
}

export function PointingMarginPanel() {
  // 既定: セクタ水平HPBW=65°・ずれ角θ=10°（施工誤差の代表オーダー）→ 利得低下≈0.28dB。
  const [mode, setMode] = useState<Mode>("offsetToLoss");
  const [hpbwDeg, setHpbwDeg] = useState(65);
  const [offsetDeg, setOffsetDeg] = useState(10);
  const [allowedLossDb, setAllowedLossDb] = useState(1);

  const valid = Number.isFinite(hpbwDeg) && hpbwDeg > 0;

  // モードに依らず「現在のずれ角」「現在の利得低下」を両方求め、図と結果に使う。
  const { currentOffsetDeg, currentLossDb } = useMemo(() => {
    if (!valid) return { currentOffsetDeg: Number.NaN, currentLossDb: Number.NaN };
    if (mode === "offsetToLoss") {
      if (!Number.isFinite(offsetDeg)) return { currentOffsetDeg: Number.NaN, currentLossDb: Number.NaN };
      return { currentOffsetDeg: offsetDeg, currentLossDb: pointingLossDb(offsetDeg, hpbwDeg) };
    }
    if (!Number.isFinite(allowedLossDb) || allowedLossDb <= 0) {
      return { currentOffsetDeg: Number.NaN, currentLossDb: Number.NaN };
    }
    return { currentOffsetDeg: allowableOffsetDeg(allowedLossDb, hpbwDeg), currentLossDb: allowedLossDb };
  }, [valid, mode, offsetDeg, allowedLossDb, hpbwDeg]);

  const marginTable = useMemo(
    () => (valid ? buildPointingMarginTable(hpbwDeg) : []),
    [valid, hpbwDeg]
  );

  const hpbwError =
    !Number.isFinite(hpbwDeg) || hpbwDeg <= 0 ? "半値角HPBWは0より大きい値を入力してください。" : undefined;
  const offsetError =
    mode === "offsetToLoss" && !Number.isFinite(offsetDeg) ? "ずれ角θを入力してください。" : undefined;
  const lossError =
    mode === "lossToOffset" && (!Number.isFinite(allowedLossDb) || allowedLossDb <= 0)
      ? "許容損失は0より大きい値を入力してください。"
      : undefined;

  const withinMainLobe = Number.isFinite(currentLossDb) && currentLossDb <= MAIN_LOBE_EDGE_LOSS_DB;

  const primary =
    mode === "offsetToLoss"
      ? {
          label: "利得低下",
          value: Number.isFinite(currentLossDb) ? formatNumber(currentLossDb, 2) : "—",
          unit: "dB"
        }
      : {
          label: "許容ずれ角",
          value: Number.isFinite(currentOffsetDeg) ? formatNumber(currentOffsetDeg, 1) : "—",
          unit: "°"
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
            アンテナのビーム中心から角度θずれると、利得は放物線近似で
            <strong>L[dB] = 12·(θ/HPBW)²</strong>だけ落ちます。半値角（HPBW）の半分ずれてちょうど-3dB、
            HPBW端で-12dBが目安です。
          </p>

          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-500">計算の向き</p>
            <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="計算モード">
              <button
                type="button"
                className={chipClass(mode === "offsetToLoss")}
                onClick={() => setMode("offsetToLoss")}
              >
                ずれ → 利得低下
              </button>
              <button
                type="button"
                className={chipClass(mode === "lossToOffset")}
                onClick={() => setMode("lossToOffset")}
              >
                損失 → 許容角
              </button>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-500">
              HPBWプリセット（3GPP TR 36.814基準アンテナ・Balanis理論値）
            </p>
            <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="HPBWプリセット">
              {HPBW_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  className={chipClass(Math.abs(hpbwDeg - preset.hpbwDeg) < 0.01)}
                  onClick={() => setHpbwDeg(preset.hpbwDeg)}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <Field
              id="pmHpbw"
              label="半値角 HPBW"
              unit="°"
              value={hpbwDeg}
              min={2}
              max={120}
              step={0.5}
              showSlider
              emptyBehavior="preserve"
              onChange={setHpbwDeg}
              help="ビームの鋭さです。利得が最大から3dB下がる全角（Half Power Beam Width）。鋭いほど利得は高いですが、ずれに弱くなります。パラボラは数度、基地局セクタは数十度です。"
              example="65"
              error={hpbwError}
            />

            {mode === "offsetToLoss" ? (
              <Field
                id="pmOffset"
                label="ずれ角 θ"
                unit="°"
                value={offsetDeg}
                min={0}
                max={120}
                step={0.5}
                showSlider
                emptyBehavior="preserve"
                onChange={setOffsetDeg}
                help="ビーム中心から実際に何度ずれているか。施工誤差・風・熱による鏡面/架台の変位で生じます。値は絶対値で評価します（左右対称）。"
                example="10"
                error={offsetError}
              />
            ) : (
              <>
                <div>
                  <p className="text-xs font-semibold text-slate-500">許容損失プリセット</p>
                  <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="許容損失プリセット">
                    {LOSS_PRESETS.map((db) => (
                      <button
                        key={db}
                        type="button"
                        className={chipClass(Math.abs(allowedLossDb - db) < 0.001)}
                        onClick={() => setAllowedLossDb(db)}
                      >
                        {formatNumber(db, db < 1 ? 1 : 0)}dB
                      </button>
                    ))}
                  </div>
                </div>
                <Field
                  id="pmLoss"
                  label="許容損失"
                  unit="dB"
                  value={allowedLossDb}
                  min={0.1}
                  max={12}
                  step={0.1}
                  showSlider
                  emptyBehavior="preserve"
                  onChange={setAllowedLossDb}
                  help="設計上どこまでの利得低下を許すか。この損失に収まる最大のずれ角（指向マージン）を逆算します。3dB=半値角の端です。"
                  example="1"
                  error={lossError}
                />
              </>
            )}
          </div>

          <p className="mt-4 text-xs leading-relaxed text-slate-500">
            放物線近似は主ローブ内（θ≲HPBW・-12dBまで）が有効域です。それより外はサイドローブ構造が
            支配的になり、本式は損失を過大評価し得ます。
          </p>
        </Card>

        <div className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <div id="pointing-margin-primary-result">
            <ResultBar primary={primary} />
          </div>

          {!withinMainLobe && Number.isFinite(currentLossDb) ? (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-900">
              ずれ角が主ローブ端（θ=HPBW・-12dB）を超えています。放物線近似の有効域外のため、実際の利得は
              サイドローブの影響で本値と大きく異なり得ます。
            </p>
          ) : null}

          <Card as="section" padding="lg">
            <h2 className="text-base font-bold text-slate-950">許容ずれ角の早見表（現在のHPBW）</h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              θ_allow = HPBW·√(L/12)。許容損失ごとに、そこへ収めるための最大ずれ角です。
            </p>
            <div className="mt-3 space-y-1.5">
              {marginTable.map((row) => {
                const isCurrent =
                  mode === "lossToOffset" && Math.abs(allowedLossDb - row.lossDb) < 0.001;
                return (
                  <div
                    key={row.lossDb}
                    className={`grid grid-cols-[72px_1fr_88px] items-center gap-3 rounded-lg px-2 py-1 text-sm ${
                      isCurrent ? "bg-staf-light ring-1 ring-staf/40" : ""
                    }`}
                  >
                    <span className={isCurrent ? "font-semibold text-staf-dark" : "text-slate-600"}>
                      -{formatNumber(row.lossDb, row.lossDb < 1 ? 1 : 0)}dB
                    </span>
                    <span className="text-xs tabular-nums text-slate-500">
                      {row.lossDb === 3 ? "半値角の端" : "指向マージン"}
                    </span>
                    <span className="text-right font-semibold tabular-nums text-slate-900">
                      ±{formatNumber(row.offsetDeg, 1)}°
                    </span>
                  </div>
                );
              })}
              {marginTable.length === 0 ? (
                <p className="text-sm text-slate-500">HPBWを入力すると早見表が表示されます。</p>
              ) : null}
            </div>
            <p className="mt-4 text-sm leading-relaxed text-slate-600">
              口径からHPBWを知りたいときは
              <Link
                href="/tools/aperture-gain-beamwidth"
                className="mx-1 inline-flex items-center gap-1 rounded font-semibold text-staf-dark transition hover:text-staf focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-staf/40"
              >
                開口利得・ビーム幅
                <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
              </Link>
              で HPBW≈70λ/D を先に求めてから、この指向マージンに入れます。
            </p>
          </Card>
        </div>
      </section>

      <div className="mt-6">
        <ChartFrame
          eyebrow="主ローブ放物線"
          title="ずれ角ごとの利得低下カーブ"
          description="横軸はHPBWで正規化したずれ角（θ/HPBW）、縦軸は利得低下[dB]。中心で0dB、θ=HPBW/2で-3dB、θ=HPBWで-12dBです。現在の入力が色付きの点で乗ります。"
          exportName="pointing-margin-curve"
          caption={
            valid && Number.isFinite(currentLossDb)
              ? `条件: HPBW=${formatNumber(hpbwDeg, 1)}° / ずれ角 θ=${formatNumber(currentOffsetDeg, 1)}° ─ 利得低下 ${formatNumber(currentLossDb, 2)}dB（θ/HPBW=${formatNumber(currentOffsetDeg / hpbwDeg, 2)}）`
              : "入力値を確認してください。"
          }
        >
          <div className="grid gap-4 lg:grid-cols-[1.7fr_1fr]">
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
              <PointingLossCurve
                hpbwDeg={hpbwDeg}
                currentOffsetDeg={currentOffsetDeg}
                currentLossDb={currentLossDb}
              />
            </div>
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
              <BeamFanDiagram
                hpbwDeg={hpbwDeg}
                currentOffsetDeg={currentOffsetDeg}
                currentLossDb={currentLossDb}
              />
            </div>
          </div>
        </ChartFrame>
      </div>

      <div className="mt-6">
        <FormulaExplanationCard
          title="基礎から: なぜ鋭いビームはずれに弱いのか"
          formula="利得低下 L[dB] = 12·(θ/HPBW)²　／　許容ずれ角 θ_allow[°] = HPBW·√(L/12)"
          showColumnLink={false}
        >
          <p>
            <strong>① 鋭いビームは強いが、外すと急に落ちます。</strong>
            アンテナの利得を上げるとは、同じ電力を狭い角度に集めることです。懐中電灯のレンズを絞るほど
            中心は明るくなりますが、少し狙いを外すと相手は急に暗くなります。ビームが鋭い（HPBWが小さい）
            ほど、同じ「ずれ角θ」でも利得低下は大きくなります。
            ※このたとえは主ローブの中心付近の話です。実際のアンテナには主ローブの外側にサイドローブ
            （狙っていない方向の弱い山）があり、この放物線近似はあくまで主ローブ内（θ≲HPBW）でだけ成り立ちます。
          </p>
          <p>
            <strong>② HPBWの半分ずれて、ちょうど-3dB。</strong>
            HPBW（半値ビーム幅）は「利得が最大から3dB下がる全角」です。だから中心から片側にHPBW/2
            ずれた点が-3dB、式に入れると 12·(0.5)²=3dB と一致します。同じ式でθ=HPBW（端）まで外すと
            12·1²=12dB。主ローブの端ではもう1/16まで落ちている、という目安です。
          </p>
          <p>
            <strong>③ 実務: 何度ずれるかを見込んで利得を選ぶ。</strong>
            現場ではビームは必ず少しずれます。架台の施工誤差、風によるたわみ、日射や気温差での鏡面/構造の
            熱変形——これらを足したずれ角に対して、許せる利得低下（例: -1dB）に収まるHPBWを選びます。
            逆に言えば「θ_allow = HPBW·√(L/12)」で、許容ずれ角が確保できないほど鋭いビームは、
            利得が高くても現場では使いこなせません。追尾機構のコストと利得は、このマージンで釣り合わせます。
          </p>
          <p>
            結論: 利得（=ビームの鋭さ）とずれ耐性はトレードオフです。カタログ利得だけでなく、
            「何度ずれても許容内か」をHPBWから逆算して初めて、実装できる利得が決まります。
          </p>
        </FormulaExplanationCard>
      </div>

      <div className="mt-6">
        <PointingMarginColumn />
      </div>

      <MobileResultBar primary={primary} targetId="pointing-margin-primary-result" />
    </>
  );
}
