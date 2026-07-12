"use client";

import { useMemo, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Callout } from "@/components/Callout";
import { Card } from "@/components/Card";
import { ChartFrame } from "@/components/ChartFrame";
import { Field } from "@/components/Field";
import { MetricCard } from "@/components/MetricCard";
import { MobileResultBar } from "@/components/MobileResultBar";
import { ResultBar } from "@/components/ResultBar";
import { SegmentedControl } from "@/components/SegmentedControl";
import { chartTheme } from "@/lib/chartTheme";
import { diagramPalette } from "@/lib/ui/diagramTheme";
import {
  analyzeOtaBand,
  DESENSE_CAUTION_MAX_DB,
  DESENSE_CLEAN_MAX_DB,
  type OtaBandAnalysis,
  type OtaDesenseVerdict
} from "@/lib/rf/otaImplementationLoss";
import { formatNumber, formatSigned } from "@/lib/rf/format";
import type { LinkJudgementLevel } from "@/lib/rf/judgement";
import { MAX_OTA_BANDS, OTA_BAND_PRESETS } from "@/data/otaBandPresets";
import { FormulaExplanationCard } from "./FormulaExplanationCard";
import { OtaImplementationLossColumn } from "./OtaImplementationLossColumn";
import { OtaExpertPanel } from "./OtaExpertPanel";

export type OtaBandRow = {
  id: number;
  label: string;
  conductedPowerDbm: number;
  conductedSensitivityDbm: number;
  antennaEfficiencyDb: number;
  trpDbm: number;
  tisDbm: number;
};

// 判定（verdict）→ 表示ラベルと ResultBar の判定レベルへの写像。
const VERDICT_UI: Record<OtaDesenseVerdict, { label: string; level: LinkJudgementLevel }> = {
  clean: { label: "クリーン：自己雑音の兆候は小さい", level: "good" },
  caution: { label: "要注意：ノイズ性デセンスの疑い", level: "caution" },
  noisy: { label: "ノイジー：自己雑音デセンスが濃厚", level: "poor" }
};

// ---- Band別ギャップ比較図（入力連動の動的SVG） -------------------------------------
// 各Bandについて TRPギャップ（送信側）と TISギャップ（受信側）を横棒ペアで並べ、
// 両者の差分＝デセンス推定を強調色の差分バーで見せる。受動損失は送受対称に効くため、
// 2本の棒が同じ長さなら「アンテナ以外の受動損失だけ」、TIS側だけ長ければ自己雑音の疑い。
// テキストは属性直指定（書き出したSVG単体でも画面と同じ見た目）。

type BandBarDatum = {
  id: number;
  label: string;
  trpGapDb: number;
  tisGapDb: number;
  desenseDb: number;
  selected: boolean;
};

function OtaGapBars({
  bands,
  selectedDesenseDb
}: {
  bands: BandBarDatum[];
  selectedDesenseDb: number | null;
}) {
  const rowH = 66;
  const chart = { width: 640, top: 48, bottom: 38, left: 128, right: 96 };
  const height = chart.top + bands.length * rowH + chart.bottom;
  const gapValues = bands.flatMap((band) => [band.trpGapDb, band.tisGapDb]);
  const maxV = Math.ceil(Math.max(1, ...gapValues) + 0.5);
  const minV = Math.floor(Math.min(-1, ...gapValues) - 0.5);
  const span = Math.max(1, maxV - minV);
  const plotW = chart.width - chart.left - chart.right;
  const x = (v: number) => chart.left + ((v - minV) / span) * plotW;
  const tickStep = span > 16 ? 4 : span > 8 ? 2 : 1;
  const ticks: number[] = [];
  for (let t = Math.ceil(minV / tickStep) * tickStep; t <= maxV; t += tickStep) {
    ticks.push(t);
  }

  const bar = (v: number) => ({
    x: Math.min(x(0), x(v)),
    width: Math.max(2, Math.abs(x(v) - x(0)))
  });

  const legend = [
    { label: "TRPギャップ（送信側）", fill: chartTheme.series.source },
    { label: "TISギャップ（受信側）", fill: chartTheme.series.loss },
    { label: "差分＝デセンス推定", fill: diagramPalette.danger }
  ];

  return (
    <svg
      role="img"
      data-testid="ota-desense-diagram"
      data-desense={selectedDesenseDb === null ? "invalid" : formatNumber(selectedDesenseDb, 2)}
      aria-label={`Band別のTRPギャップとTISギャップの比較。選択Bandのデセンス推定 ${
        selectedDesenseDb === null ? "計算不可" : `${formatNumber(selectedDesenseDb, 1)}dB`
      }`}
      viewBox={`0 0 ${chart.width} ${height}`}
      className="h-auto w-full"
    >
      <rect width={chart.width} height={height} fill={chartTheme.surface.canvas} />

      {/* 凡例 */}
      {legend.map((item, index) => {
        const lx = 12 + index * 180;
        return (
          <g key={item.label}>
            <rect x={lx} y={12} width={12} height={12} rx={3} fill={item.fill} />
            <text x={lx + 17} y={22} fill={diagramPalette.inkSoft} fontSize={11} fontWeight={600}>
              {item.label}
            </text>
          </g>
        );
      })}

      {/* 目盛りグリッドと軸ラベル */}
      {ticks.map((tick) => (
        <g key={tick}>
          <line
            x1={x(tick)}
            x2={x(tick)}
            y1={chart.top - 6}
            y2={height - chart.bottom + 6}
            stroke={chartTheme.grid.primary}
          />
          <text
            x={x(tick)}
            y={height - chart.bottom + 22}
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
        y={height - chart.bottom + 22}
        textAnchor="start"
        fill={diagramPalette.muted}
        fontSize={11}
        fontWeight={600}
      >
        　ギャップ[dB]
      </text>

      {/* 0dB基準線: ここより右＝説明のつかない劣化 */}
      <line
        x1={x(0)}
        x2={x(0)}
        y1={chart.top - 10}
        y2={height - chart.bottom + 10}
        stroke={chartTheme.reference.baseline}
        strokeDasharray={chartTheme.reference.baselineDash}
        strokeWidth={1.5}
      />

      {bands.map((band, index) => {
        const rowTop = chart.top + index * rowH;
        const trpBar = bar(band.trpGapDb);
        const tisBar = bar(band.tisGapDb);
        const diffStart = x(Math.min(band.trpGapDb, band.tisGapDb));
        const diffEnd = x(Math.max(band.trpGapDb, band.tisGapDb));
        const diffFill = band.desenseDb > 0 ? diagramPalette.danger : diagramPalette.success;
        const diffText = band.desenseDb > 0 ? diagramPalette.dangerDeep : diagramPalette.successDeep;
        const valueLabel = (v: number, y: number, fill: string) => (
          <text
            x={v >= 0 ? x(v) + 5 : x(v) - 5}
            y={y}
            textAnchor={v >= 0 ? "start" : "end"}
            fill={fill}
            fontSize={10}
            fontWeight={700}
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {formatSigned(v, "dB")}
          </text>
        );
        return (
          <g key={band.id}>
            {band.selected ? (
              <rect
                x={2}
                y={rowTop - 6}
                width={chart.width - 4}
                height={rowH - 6}
                rx={8}
                fill={diagramPalette.skyPale}
              />
            ) : null}
            <text
              x={10}
              y={rowTop + 20}
              fill={band.selected ? diagramPalette.stafDark : diagramPalette.inkSoft}
              fontSize={12}
              fontWeight={band.selected ? 700 : 600}
            >
              {band.label}
            </text>
            {/* TRPギャップ（送信側） */}
            <rect
              x={trpBar.x}
              y={rowTop + 2}
              width={trpBar.width}
              height={12}
              rx={3}
              fill={chartTheme.series.source}
              stroke={chartTheme.seriesText.source}
              strokeWidth={1}
            />
            {valueLabel(band.trpGapDb, rowTop + 12, chartTheme.seriesText.source)}
            {/* TISギャップ（受信側） */}
            <rect
              x={tisBar.x}
              y={rowTop + 18}
              width={tisBar.width}
              height={12}
              rx={3}
              fill={chartTheme.series.loss}
              stroke={chartTheme.seriesText.loss}
              strokeWidth={1}
            />
            {valueLabel(band.tisGapDb, rowTop + 28, chartTheme.seriesText.loss)}
            {/* 差分＝デセンス推定（TISだけ余計に悪い分） */}
            <rect
              x={diffStart}
              y={rowTop + 36}
              width={Math.max(2, diffEnd - diffStart)}
              height={8}
              rx={2}
              fill={diffFill}
              opacity={0.9}
            />
            <text
              x={diffEnd + 6}
              y={rowTop + 44}
              textAnchor="start"
              fill={diffText}
              fontSize={10}
              fontWeight={700}
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              デセンス {formatSigned(band.desenseDb, "dB")}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function OtaImplementationLossPanel() {
  const [mode, setMode] = useState<"standard" | "expert">("standard");
  // 既定はLTE-M 3Bandのサンプル値（教材用の例。実測値に置き換えて使う）。
  const [rows, setRows] = useState<OtaBandRow[]>(() =>
    OTA_BAND_PRESETS.map((preset, index) => ({ id: index + 1, ...preset }))
  );
  const [selectedId, setSelectedId] = useState(1);
  const [nextId, setNextId] = useState(OTA_BAND_PRESETS.length + 1);

  const selectedIndex = Math.max(
    0,
    rows.findIndex((row) => row.id === selectedId)
  );
  const selected = rows[selectedIndex];

  const analyses = useMemo(
    () =>
      rows.map((row): OtaBandAnalysis | null => {
        try {
          return analyzeOtaBand({
            conductedPowerDbm: row.conductedPowerDbm,
            conductedSensitivityDbm: row.conductedSensitivityDbm,
            antennaEfficiencyDb: row.antennaEfficiencyDb,
            trpDbm: row.trpDbm,
            tisDbm: row.tisDbm
          });
        } catch {
          return null;
        }
      }),
    [rows]
  );
  const selectedAnalysis = analyses[selectedIndex];

  const updateSelected = (patch: Partial<OtaBandRow>) => {
    setRows((prev) => prev.map((row) => (row.id === selected.id ? { ...row, ...patch } : row)));
  };

  const addBand = () => {
    if (rows.length >= MAX_OTA_BANDS) return;
    // 追加行は「期待値どおり（全ギャップ0）」の中立サンプルから始める。
    const id = nextId;
    setRows((prev) => [
      ...prev,
      {
        id,
        label: `追加Band ${id}`,
        conductedPowerDbm: 23,
        conductedSensitivityDbm: -108,
        antennaEfficiencyDb: -3,
        trpDbm: 20,
        tisDbm: -105
      }
    ]);
    setNextId(id + 1);
    setSelectedId(id);
  };

  const removeBand = (id: number) => {
    if (rows.length <= 1) return;
    const next = rows.filter((row) => row.id !== id);
    setRows(next);
    if (id === selectedId && next.length > 0) {
      setSelectedId(next[0].id);
    }
  };

  const efficiencyError = !Number.isFinite(selected.antennaEfficiencyDb)
    ? "放射効率を入力してください。"
    : selected.antennaEfficiencyDb > 0
      ? "放射効率は0dB以下で入力してください（100%=0dB、50%≈-3dB）。"
      : undefined;
  const finiteError = (value: number, label: string) =>
    !Number.isFinite(value) ? `${label}を入力してください。` : undefined;

  const verdictUi = selectedAnalysis ? VERDICT_UI[selectedAnalysis.verdict] : undefined;
  const primary = {
    label: `デセンス推定値（${selected.label}）`,
    value: selectedAnalysis ? formatNumber(selectedAnalysis.desenseDb, 1) : "—",
    unit: "dB"
  };
  const judgement = verdictUi ? { label: verdictUi.label, level: verdictUi.level } : undefined;

  const barData: BandBarDatum[] = rows.flatMap((row, index) => {
    const analysis = analyses[index];
    if (!analysis) return [];
    return [
      {
        id: row.id,
        label: row.label,
        trpGapDb: analysis.trpGapDb,
        tisGapDb: analysis.tisGapDb,
        desenseDb: analysis.desenseDb,
        selected: row.id === selected.id
      }
    ];
  });

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
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-950">Band別の測定値</h2>
            <SegmentedControl options={[{ id: "standard", label: "標準" }, { id: "expert", label: "エキスパート" }]} value={mode} onChange={setMode} ariaLabel="OTA動作モード切替" />
          </div>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Bandごとに、伝導測定（無線機コネクタ端の出力・感度）とアンテナ放射効率、OTA実測
            （TRP/TIS）を入力します。初期値はLTE-M端末を想定した<strong>サンプル値（例）</strong>です。
          </p>

          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-500">
              分析するBand（最大{MAX_OTA_BANDS}行。チップで選択して下の欄を編集）
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2" role="group" aria-label="Band行の選択">
              {rows.map((row) => (
                <span key={row.id} className="inline-flex items-center gap-1">
                  <button
                    type="button"
                    className={chipClass(row.id === selected.id)}
                    onClick={() => setSelectedId(row.id)}
                  >
                    {row.label}
                  </button>
                  <button
                    type="button"
                    aria-label={`${row.label}を削除`}
                    disabled={rows.length <= 1}
                    onClick={() => removeBand(row.id)}
                    className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-xs font-bold text-slate-500 transition hover:border-rose-300 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    ×
                  </button>
                </span>
              ))}
              <button
                type="button"
                onClick={addBand}
                disabled={rows.length >= MAX_OTA_BANDS}
                className="inline-flex min-h-11 items-center rounded-full border border-dashed border-staf/50 bg-white px-3 py-1.5 text-sm font-semibold text-staf-dark transition hover:border-staf disabled:cursor-not-allowed disabled:opacity-40"
              >
                ＋ Band行を追加
              </button>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <Field
              id="otaConductedPower"
              label="伝導出力 Pc"
              unit="dBm"
              value={selected.conductedPowerDbm}
              min={-20}
              max={40}
              step={0.5}
              emptyBehavior="preserve"
              onChange={(value) => updateSelected({ conductedPowerDbm: value })}
              help="アンテナを外し、無線機のコネクタ端で測った送信出力です。LTE-MのPower Class 3では23dBmが公称値です。"
              example="23"
              error={finiteError(selected.conductedPowerDbm, "伝導出力")}
            />
            <Field
              id="otaConductedSensitivity"
              label="伝導感度 Sc"
              unit="dBm"
              value={selected.conductedSensitivityDbm}
              min={-140}
              max={-40}
              step={0.5}
              emptyBehavior="preserve"
              onChange={(value) => updateSelected({ conductedSensitivityDbm: value })}
              help="コネクタ端で測った受信感度（小さいほど良い）です。TIS測定と同じBER/スループット条件の値を使ってください。"
              example="-108"
              error={finiteError(selected.conductedSensitivityDbm, "伝導感度")}
            />
            <Field
              id="otaEfficiency"
              label="アンテナ放射効率 η"
              unit="dB"
              value={selected.antennaEfficiencyDb}
              min={-20}
              max={0}
              step={0.5}
              emptyBehavior="preserve"
              onChange={(value) => updateSelected({ antennaEfficiencyDb: value })}
              help="放射効率のdB値です（100%=0dB、50%≈-3dB）。TRP/TISと同一実装状態・同一条件（自由空間/ファントム）の値を使います。"
              example="-3"
              error={efficiencyError}
            />
            <Field
              id="otaTrp"
              label="OTA実測 TRP"
              unit="dBm"
              value={selected.trpDbm}
              min={-30}
              max={40}
              step={0.5}
              emptyBehavior="preserve"
              onChange={(value) => updateSelected({ trpDbm: value })}
              help="OTA測定した全放射電力です。期待値（Pc+η）より低い分が、送信側の説明のつかない実装損失になります。"
              example="19.5"
              error={finiteError(selected.trpDbm, "TRP")}
            />
            <Field
              id="otaTis"
              label="OTA実測 TIS"
              unit="dBm"
              value={selected.tisDbm}
              min={-130}
              max={-30}
              step={0.5}
              emptyBehavior="preserve"
              onChange={(value) => updateSelected({ tisDbm: value })}
              help="OTA測定した全等方感度です（小さいほど良い）。期待値（Sc−η）より数値が大きい分が受信側の劣化です。"
              example="-102"
              error={finiteError(selected.tisDbm, "TIS")}
            />
          </div>
        </Card>

        <div className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <div id="ota-implementation-loss-primary-result">
            <ResultBar primary={primary} judgement={judgement} />
          </div>

          {selectedAnalysis ? (
            <>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                <MetricCard
                  label="TRPギャップ（送信側）"
                  value={formatNumber(selectedAnalysis.trpGapDb, 1)}
                  unit="dB"
                  sub={`期待TRP ${formatNumber(selectedAnalysis.expectedTrpDbm, 1)}dBm − 実測 ${formatNumber(selected.trpDbm, 1)}dBm`}
                  hint="正の値は、アンテナ効率では説明できない送信側の実装損失（整合ずれ・筐体吸収など）です。"
                />
                <MetricCard
                  label="TISギャップ（受信側）"
                  value={formatNumber(selectedAnalysis.tisGapDb, 1)}
                  unit="dB"
                  sub={`実測 ${formatNumber(selected.tisDbm, 1)}dBm − 期待TIS ${formatNumber(selectedAnalysis.expectedTisDbm, 1)}dBm`}
                  hint="正の値は受信側の説明のつかない劣化です。TRPギャップより大きい分が自己雑音（デセンス）の疑いになります。"
                />
              </div>
              <Callout
                tone={selectedAnalysis.verdict === "clean" ? "success" : selectedAnalysis.verdict === "caution" ? "caution" : "danger"}
                title={`デセンス推定 ${formatSigned(selectedAnalysis.desenseDb, "dB")}`}
              >
                受動的な実装損失は送受に同量効くため、TISギャップからTRPギャップを引いた残り＝
                TIS側だけ余計に悪い分を、端末自身の雑音による自己デセンスとして推定します
                （≤{DESENSE_CLEAN_MAX_DB}dB: クリーン ／ ≤{DESENSE_CAUTION_MAX_DB}dB: 要注意 ／
                それ超: ノイジー）。
              </Callout>
            </>
          ) : (
            <Callout tone="danger">入力値を確認してください（放射効率は0dB以下）。</Callout>
          )}
        </div>
      </section>

      {mode === "expert" ? <OtaExpertPanel rows={rows} setRows={setRows} nextId={nextId} setNextId={setNextId} setSelectedId={setSelectedId} /> : null}

      <div className="mt-6">
        <ChartFrame
          eyebrow="Band別比較"
          title="TRPギャップ vs TISギャップ — 差分がデセンス推定"
          description="Bandごとに送信側ギャップ（青）と受信側ギャップ（ロゼ）を並べます。2本が同じ長さなら受動損失だけ。TIS側だけ長い分（強調色の差分バー）が、自分の雑音を聞いている量の推定です。入力に連動して動きます。"
          exportName="ota-implementation-loss-gaps"
          caption={
            selectedAnalysis
              ? `選択Band: ${selected.label} ─ TRPギャップ ${formatSigned(selectedAnalysis.trpGapDb, "dB")}・TISギャップ ${formatSigned(selectedAnalysis.tisGapDb, "dB")}・デセンス推定 ${formatSigned(selectedAnalysis.desenseDb, "dB")}（初期値は教材用のサンプル例）`
              : "入力値を確認してください。"
          }
        >
          {barData.length > 0 ? (
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
              <OtaGapBars
                bands={barData}
                selectedDesenseDb={selectedAnalysis ? selectedAnalysis.desenseDb : null}
              />
            </div>
          ) : (
            <p className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
              入力値を確認するとBand別の比較グラフが表示されます。
            </p>
          )}
        </ChartFrame>
      </div>

      <div className="mt-6">
        <Callout
          tone="caution"
          icon={<AlertTriangle aria-hidden="true" className="h-5 w-5 text-amber-700" />}
          title="実務での前提合わせ（この3つがずれると分離が壊れます）"
        >
          <ul className="mt-1 list-disc space-y-1 pl-5">
            <li>
              放射効率は、TRP/TISと<strong>同一実装状態・同一条件</strong>（自由空間かファントムか、
              同じ姿勢・同じ治具）で測った値を使うこと。
            </li>
            <li>
              TIS測定の判定条件（BER/スループットの基準）を伝導感度Scの測定条件と揃えること。
              条件が違うと、その差がそのまま偽のギャップになります。
            </li>
            <li>
              CA（キャリアアグリゲーション）動作時の相互干渉や、隣接Band・外来波によるデセンスは
              本ツールの分離対象外の<strong>別要因</strong>です。疑わしい場合は単独Band・
              シールドルームで測り直してください。
            </li>
          </ul>
        </Callout>
      </div>

      <div className="mt-6">
        <FormulaExplanationCard
          title="基礎から: なぜ引き算2回でノイズが見えるのか"
          formula={
            "期待TRP[dBm] = Pc + η　　trpGap = 期待TRP − TRP実測\n期待TIS[dBm] = Sc − η　　tisGap = TIS実測 − 期待TIS\nデセンス推定[dB] = tisGap − trpGap"
          }
          showColumnLink={false}
        >
          <p>
            <strong>① TRPは「送る力の総和」、TISは「聞き取れる下限」です。</strong>
            伝導測定はコネクタ端の実力（Pc・Sc）を、OTA測定はアンテナと筐体を含めた完成品の実力
            （TRP・TIS）を測ります。アンテナの放射効率ηが分かっていれば、完成品がどうあるべきか
            （期待TRP＝Pc+η、期待TIS＝Sc−η）を先に計算できます。
          </p>
          <p>
            <strong>② 受動的な損失は、送信と受信に同じだけ効きます。</strong>
            整合のずれ、ケーブルやコネクタの損失、筐体やユーザーの手による吸収——こうした
            「部品としての損失」は電波の行きも帰りも同じ道を通るため（相反性）、TRPとTISを
            <strong>同じdB数だけ</strong>悪化させます。だからTRPギャップとTISギャップが同じなら、
            犯人はアンテナ周りの受動損失で、ノイズではありません。
          </p>
          <p>
            <strong>③ TISだけ悪い＝自分のノイズを聞いています。</strong>
            端末内部のDC-DCコンバータやクロックの高調波がRX帯に落ちると、受信機のノイズフロアが
            底上げされます。これは受信にしか効かない劣化なので、TISギャップからTRPギャップを引いた
            残りが「自己雑音によるデセンス」の推定値になります。この値が大きいBandから、
            スペクトラム測定と機能ブロックの切り分けに進むのが定石です。
          </p>
        </FormulaExplanationCard>
      </div>

      <div className="mt-6">
        <OtaImplementationLossColumn />
      </div>

      <MobileResultBar primary={primary} judgement={judgement} targetId="ota-implementation-loss-primary-result" />
    </>
  );
}
