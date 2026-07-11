"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Minus, Plus } from "lucide-react";
import { Callout } from "@/components/Callout";
import { Card } from "@/components/Card";
import { ChartFrame } from "@/components/ChartFrame";
import { MobileResultBar } from "@/components/MobileResultBar";
import { ResultBar } from "@/components/ResultBar";
import { chartTheme } from "@/lib/chartTheme";
import { diagramPalette } from "@/lib/ui/diagramTheme";
import { CONTACT_URL } from "@/lib/rf/presets";
import { formatNumber } from "@/lib/rf/format";
import { sumWallLoss, type WallLossBreakdownRow } from "@/lib/rf/wallPenetration";
import {
  WALL_BANDS,
  WALL_MATERIALS,
  WALL_MATERIAL_BY_ID,
  WALL_MATERIAL_SOURCES,
  type WallBandMHz,
  type WallMaterialId
} from "@/data/wallMaterials";
import { FormulaExplanationCard } from "./FormulaExplanationCard";
import { WallPenetrationColumn } from "./WallPenetrationColumn";

const BAND_LABELS: Record<WallBandMHz, string> = {
  920: "920MHz",
  2400: "2.4GHz",
  5000: "5GHz",
  28000: "28GHz（ミリ波）"
};

/** 図中の壁ラベル用の短縮名（凡例は内訳表が担うため1〜6文字に絞る）。 */
const SHORT_LABELS: Record<WallMaterialId, string> = {
  "wood-door": "木ドア",
  plasterboard: "石膏",
  "concrete-interior": "コンクリ内壁",
  "rc-exterior": "RC外壁",
  "single-glass": "単層窓",
  "low-e-glass": "Low-E窓",
  brick: "レンガ"
};

type WallCounts = Record<WallMaterialId, number>;

const ZERO_COUNTS: WallCounts = {
  "wood-door": 0,
  plasterboard: 0,
  "concrete-interior": 0,
  "rc-exterior": 0,
  "single-glass": 0,
  "low-e-glass": 0,
  brick: 0
};

const MAX_COUNT_PER_MATERIAL = 9;

// 生活シーンのプリセット（枚数構成のみ設定。帯域は現在の選択を維持する）
const SCENARIO_PRESETS: readonly { label: string; counts: Partial<WallCounts> }[] = [
  { label: "隣の部屋まで（石膏×2）", counts: { plasterboard: 2 } },
  { label: "フロア横断（石膏×2＋コンクリ内壁×1）", counts: { plasterboard: 2, "concrete-interior": 1 } },
  { label: "屋外→RC屋内（RC外壁×1）", counts: { "rc-exterior": 1 } },
  { label: "省エネ窓越し（Low-E×1）", counts: { "low-e-glass": 1 } }
];

// ---- 壁を通るたび減っていく信号の階段（滝）SVG ----------------------------------
// 左端0dB（壁の手前の相対レベル）から、壁（材質×枚数）を通過するごとに
// min（楽観）/max（悲観）の2本の階段線が下がる。テキストは属性直指定。

function WallStepWaterfall({
  breakdown,
  totalMinDb,
  totalMaxDb
}: {
  breakdown: readonly WallLossBreakdownRow[];
  totalMinDb: number;
  totalMaxDb: number;
}) {
  const chart = { width: 640, height: 320, top: 28, right: 88, bottom: 56, left: 56 };
  const plotWidth = chart.width - chart.left - chart.right;
  const plotHeight = chart.height - chart.top - chart.bottom;
  const n = breakdown.length;

  // 縦軸: 0dB（上端）〜 -(合計max) を10刻みの切りの良い下端へ丸める
  const floorDb = -Math.max(10, Math.ceil((totalMaxDb + 4) / 10) * 10);
  const y = (levelDb: number) => chart.top + ((0 - levelDb) / (0 - floorDb)) * plotHeight;
  const tickStep = [5, 10, 20, 50, 100, 200, 500].find((step) => -floorDb / step <= 8) ?? 500;
  const ticks = Array.from({ length: Math.floor(-floorDb / tickStep) + 1 }, (_, i) => -i * tickStep);

  // 横方向: 壁 n 枚で区間は n+1 個。壁は区間境界に立つ
  const spanWidth = plotWidth / (n + 1);
  const wallX = (i: number) => chart.left + (i + 1) * spanWidth;

  // 累積レベル（0 → -total）
  const minLevels = [0];
  const maxLevels = [0];
  for (const row of breakdown) {
    minLevels.push(minLevels[minLevels.length - 1] - row.minDb);
    maxLevels.push(maxLevels[maxLevels.length - 1] - row.maxDb);
  }

  const stepPath = (levels: readonly number[]) => {
    let d = `M ${chart.left} ${y(levels[0])}`;
    for (let i = 0; i < n; i += 1) {
      d += ` H ${wallX(i)} V ${y(levels[i + 1])}`;
    }
    d += ` H ${chart.width - chart.right}`;
    return d;
  };

  // min（上側の線）と max（下側の線）に挟まれた不確かさ帯
  const bandPath = (() => {
    let d = `M ${chart.left} ${y(minLevels[0])}`;
    for (let i = 0; i < n; i += 1) {
      d += ` H ${wallX(i)} V ${y(minLevels[i + 1])}`;
    }
    d += ` H ${chart.width - chart.right} V ${y(maxLevels[n])}`;
    for (let i = n - 1; i >= 0; i -= 1) {
      d += ` H ${wallX(i)} V ${y(maxLevels[i])}`;
    }
    d += ` H ${chart.left} Z`;
    return d;
  })();

  return (
    <svg
      role="img"
      aria-label={`壁を通過するごとに信号が下がる階段グラフ。合計透過損失は最小${formatNumber(totalMinDb, 1)}dB、最大${formatNumber(totalMaxDb, 1)}dB`}
      viewBox={`0 0 ${chart.width} ${chart.height}`}
      className="h-auto w-full"
    >
      <rect width={chart.width} height={chart.height} fill={chartTheme.surface.canvas} />
      {ticks.map((tick) => (
        <g key={tick}>
          <line
            x1={chart.left}
            x2={chart.width - chart.right}
            y1={y(tick)}
            y2={y(tick)}
            stroke={chartTheme.grid.primary}
          />
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
      <text x={chart.left} y={chart.top - 10} fill={diagramPalette.muted} fontSize={12} fontWeight={600}>
        相対レベル dB（壁の手前=0）
      </text>

      {/* 壁のスラブ（区間境界に立てる） */}
      {breakdown.map((row, i) => {
        const material = WALL_MATERIAL_BY_ID.get(row.material);
        const label = `${SHORT_LABELS[row.material]}×${row.count}`;
        return (
          <g key={`${row.material}-${i}`}>
            <rect
              x={wallX(i) - 6}
              y={chart.top}
              width={12}
              height={plotHeight}
              rx={3}
              fill={diagramPalette.line}
              stroke={diagramPalette.faint}
              strokeWidth={1}
            />
            <text
              x={wallX(i)}
              y={chart.height - 32}
              textAnchor="middle"
              fill={diagramPalette.inkSoft}
              fontSize={11}
              fontWeight={600}
            >
              {label}
            </text>
            <text
              x={wallX(i)}
              y={chart.height - 16}
              textAnchor="middle"
              fill={diagramPalette.muted}
              fontSize={10}
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {material ? `-${formatNumber(row.minDb, 1)}〜-${formatNumber(row.maxDb, 1)}dB` : ""}
            </text>
          </g>
        );
      })}

      {/* min〜max の不確かさ帯と2本の階段線 */}
      <path d={bandPath} fill={chartTheme.series.loss} opacity={chartTheme.overlay.primary} />
      <path
        d={stepPath(minLevels)}
        fill="none"
        stroke={chartTheme.series.gain}
        strokeWidth={chartTheme.stroke.series}
      />
      <path
        d={stepPath(maxLevels)}
        fill="none"
        stroke={chartTheme.reference.sensitivity}
        strokeWidth={chartTheme.stroke.series}
        strokeDasharray={chartTheme.reference.sensitivityDash}
      />

      {/* 右端の到達レベル注記 */}
      <text
        x={chart.width - chart.right + 6}
        y={y(minLevels[n]) + 4}
        fill={chartTheme.seriesText.gain}
        fontSize={11}
        fontWeight={700}
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        楽観 -{formatNumber(totalMinDb, 1)}dB
      </text>
      <text
        x={chart.width - chart.right + 6}
        y={y(maxLevels[n]) + (Math.abs(y(maxLevels[n]) - y(minLevels[n])) < 14 ? 16 : 4)}
        fill={chartTheme.seriesText.loss}
        fontSize={11}
        fontWeight={700}
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        悲観 -{formatNumber(totalMaxDb, 1)}dB
      </text>
    </svg>
  );
}

export function WallPenetrationPanel() {
  // 既定は「920MHz・フロア横断（石膏×2＋コンクリ内壁×1）」= 10.0〜19.0dB。
  // スマートメーター等のSub-GHz屋内侵入でまず問題になる典型構成を最初に見せる。
  const [band, setBand] = useState<WallBandMHz>(920);
  const [counts, setCounts] = useState<WallCounts>({
    ...ZERO_COUNTS,
    plasterboard: 2,
    "concrete-interior": 1
  });

  const walls = useMemo(
    () => WALL_MATERIALS.map((material) => ({ material: material.id, count: counts[material.id] })),
    [counts]
  );

  const result = useMemo(() => {
    try {
      return sumWallLoss({ band, walls });
    } catch {
      return null;
    }
  }, [band, walls]);

  const totalWalls = WALL_MATERIALS.reduce((sum, material) => sum + counts[material.id], 0);

  const setCount = (id: WallMaterialId, next: number) => {
    setCounts((prev) => ({ ...prev, [id]: Math.min(MAX_COUNT_PER_MATERIAL, Math.max(0, next)) }));
  };

  const applyScenario = (preset: Partial<WallCounts>) => {
    setCounts({ ...ZERO_COUNTS, ...preset });
  };

  const matchesScenario = (preset: Partial<WallCounts>) =>
    WALL_MATERIALS.every((material) => counts[material.id] === (preset[material.id] ?? 0));

  const chipClass = (active: boolean) =>
    `inline-flex min-h-11 items-center rounded-full border px-3 py-1.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-staf/40 ${
      active
        ? "border-staf bg-staf text-white"
        : "border-slate-200 bg-white text-slate-600 hover:border-staf/40 hover:text-staf-dark"
    }`;

  const counterButtonClass =
    "inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-staf/40 hover:text-staf-dark disabled:cursor-not-allowed disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-staf/40";

  const primary = {
    label: "合計透過損失（目安レンジ）",
    value: result === null ? "—" : `${formatNumber(result.totalMinDb, 1)}〜${formatNumber(result.totalMaxDb, 1)}`,
    unit: "dB"
  };

  return (
    <>
      <section className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,4fr)]">
        <Card as="section" padding="lg">
          <h2 className="text-base font-bold text-slate-950">入力条件</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            電波が通り抜ける壁・窓を数えるだけです。①周波数帯を選ぶ
            ②通過する建材の枚数を＋/−で数える。dBは足し算できるので、合計＝各壁の損失の和になります。
          </p>

          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-500">周波数帯</p>
            <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="周波数帯の選択">
              {WALL_BANDS.map((value) => (
                <button
                  key={value}
                  type="button"
                  className={chipClass(band === value)}
                  onClick={() => setBand(value)}
                >
                  {BAND_LABELS[value]}
                </button>
              ))}
            </div>

            <p className="mt-3 text-xs font-semibold text-slate-500">シーンから選ぶ（枚数を一括設定）</p>
            <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="壁構成プリセット">
              {SCENARIO_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  className={chipClass(matchesScenario(preset.counts))}
                  onClick={() => applyScenario(preset.counts)}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 space-y-2">
            {WALL_MATERIALS.map((material) => {
              const count = counts[material.id];
              const range = material.lossDbPerWall[band];
              return (
                <div
                  key={material.id}
                  className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2 ${
                    count > 0 ? "border-staf/30 bg-staf-light/60" : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900">{material.label}</p>
                    <p className="text-xs text-slate-500">
                      {material.note}・
                      <span className="tabular-nums">
                        {formatNumber(range.minDb, 1)}〜{formatNumber(range.maxDb, 1)}dB/枚
                      </span>
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      className={counterButtonClass}
                      onClick={() => setCount(material.id, count - 1)}
                      disabled={count <= 0}
                      aria-label={`${material.label}を1枚減らす`}
                    >
                      <Minus aria-hidden="true" className="h-4 w-4" />
                    </button>
                    <span
                      className="w-8 text-center text-base font-bold tabular-nums text-slate-900"
                      aria-live="polite"
                    >
                      {count}
                    </span>
                    <button
                      type="button"
                      className={counterButtonClass}
                      onClick={() => setCount(material.id, count + 1)}
                      disabled={count >= MAX_COUNT_PER_MATERIAL}
                      aria-label={`${material.label}を1枚増やす`}
                    >
                      <Plus aria-hidden="true" className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <div className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <div id="wall-penetration-primary-result">
            <ResultBar primary={primary} />
          </div>

          <Card as="section" padding="lg">
            <h2 className="text-base font-bold text-slate-950">内訳（{BAND_LABELS[band]}・dB/枚×枚数）</h2>
            {result && result.breakdown.length > 0 ? (
              <div className="mt-3 space-y-1.5">
                {result.breakdown.map((row) => {
                  const material = WALL_MATERIAL_BY_ID.get(row.material);
                  return (
                    <div
                      key={row.material}
                      className="grid grid-cols-[1fr_44px_110px] items-center gap-2 rounded-lg px-2 py-1 text-sm"
                    >
                      <span className="truncate text-slate-600">{material?.label ?? row.material}</span>
                      <span className="text-right text-xs tabular-nums text-slate-500">×{row.count}</span>
                      <span className="text-right font-semibold tabular-nums text-slate-900">
                        {formatNumber(row.minDb, 1)}〜{formatNumber(row.maxDb, 1)}dB
                      </span>
                    </div>
                  );
                })}
                <div className="mt-1 grid grid-cols-[1fr_110px] items-center gap-2 border-t border-slate-200 px-2 pt-2 text-sm">
                  <span className="font-semibold text-slate-900">合計（線形和）</span>
                  <span className="text-right font-bold tabular-nums text-staf-dark">
                    {formatNumber(result.totalMinDb, 1)}〜{formatNumber(result.totalMaxDb, 1)}dB
                  </span>
                </div>
              </div>
            ) : (
              <p className="mt-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
                壁がまだ0枚です。左の＋ボタンかシーンのチップで、通過する壁を追加してください。
              </p>
            )}
            <p className="mt-4 text-sm leading-relaxed text-slate-600">
              この合計（悲観側のmaxを推奨）を
              <Link
                href="/tools/rf-basic-link-calculator"
                className="mx-1 inline-flex items-center gap-1 rounded font-semibold text-staf-dark transition hover:text-staf focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-staf/40"
              >
                リンクバジェット診断の環境損失
                <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
              </Link>
              に入れると、屋内へどこまで届くかの見積もりにつながります。
            </p>
          </Card>

          <Callout tone="caution" title="目安値・実測前提です">
            <p className="text-sm leading-relaxed">
              本表は ITU-R P.2040-2／NISTIR 6055／iBwave データベースの公表値を帯域別レンジに整理した
              目安です。実際の損失は壁厚・含水率・鉄筋ピッチ・金属膜・入射角で大きく変わり、
              窓や廊下経由の回り込み（本計算に含まない）で強く受かることもあります。
              最終判断は現場実測を前提にしてください。建物・筐体込みの実測評価は
              <a
                href={CONTACT_URL}
                className="mx-1 font-semibold text-staf-dark underline decoration-staf/40 underline-offset-2 hover:text-staf"
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
          eyebrow="階段グラフ"
          title="壁を1枚通るたびに信号が下がる"
          description="左端（壁の手前）を0dBとして、壁を通過するごとに信号レベルが階段状に下がります。実線が楽観（各材質のmin）、破線が悲観（max）。2線の間が目安レンジの不確かさです。"
          exportName="wall-penetration-steps"
          caption={
            result && result.breakdown.length > 0
              ? `条件: ${BAND_LABELS[band]}・壁${totalWalls}枚 ─ 合計透過損失 ${formatNumber(result.totalMinDb, 1)}〜${formatNumber(result.totalMaxDb, 1)}dB（各建材の目安レンジの線形和）`
              : "壁を1枚以上追加すると表示されます。"
          }
        >
          {result && result.breakdown.length > 0 ? (
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
              <WallStepWaterfall
                breakdown={result.breakdown}
                totalMinDb={result.totalMinDb}
                totalMaxDb={result.totalMaxDb}
              />
            </div>
          ) : (
            <p className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
              壁を1枚以上追加すると階段グラフが表示されます。
            </p>
          )}
        </ChartFrame>
      </div>

      <div className="mt-6">
        <FormulaExplanationCard
          title="基礎から: なぜ壁の損失は「足し算」でいいのか"
          formula="合計透過損失[dB] = Σ ( 1枚あたり損失[dB/枚] × 枚数 )"
          showColumnLink={false}
        >
          <p>
            <strong>① dBは「掛け算を足し算に変える」ものさしです。</strong>
            壁を1枚通ると電波の電力は「何分の1」という比率で減ります。半分×半分×半分…という
            掛け算を毎回やるのは大変なので、比率を対数（dB）にすると足し算で済みます。
            3dBはおよそ半分、10dBで1/10、20dBで1/100です。
          </p>
          <p>
            <strong>② 1枚あたりの損失は「材質×周波数」で決まります。</strong>
            乾いた石膏ボードはほぼ素通し（1〜2dB）、水分と鉄筋を含むコンクリートは大食い
            （920MHzで8〜15dB）、金属膜をまとったLow-E複層ガラスは見た目に反して最大級
            （15〜25dB）です。周波数が上がるほどどの材質も損失が増えるため、
            同じ間取りでも2.4GHz・5GHz・ミリ波では届き方が別物になります。
          </p>
          <p>
            <strong>③ 直列に並んだ壁は、dBの線形和で見積もれます。</strong>
            壁A→壁Bと通り抜ける電波の電力比は「Aの透過率×Bの透過率」なので、dBでは
            「Aの損失＋Bの損失」。これがこのツールの計算のすべてです。ただしこれは
            最短の直線経路だけを見た一次近似で、実際の屋内では窓・ドア・廊下を経由する
            回り込みや反射があり、直線経路の合計より強く受かることも珍しくありません。
            だからこの値は「最悪これだけ食われ得る」という予算（バジェット）として使います。
          </p>
        </FormulaExplanationCard>
        <p className="mt-2 text-xs leading-relaxed text-slate-500">
          数値の出典: {WALL_MATERIAL_SOURCES.map((source) => source.label.split(":")[0]).join(" / ")}
          （各建材の公表値を帯域別のmin〜maxレンジに整理した目安値）
        </p>
      </div>

      <div className="mt-6">
        <WallPenetrationColumn />
      </div>

      <MobileResultBar primary={primary} targetId="wall-penetration-primary-result" />
    </>
  );
}
