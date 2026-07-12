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
import { combinePowersDbm, dbiToDbd, DIPOLE_GAIN_DBI } from "@/lib/rf/dbFamily";
import { formatNumber } from "@/lib/rf/format";
import { FormulaExplanationCard } from "./FormulaExplanationCard";
import { ToolColumnCard } from "@/components/ToolColumnCard";
import { dbFamilyColumn } from "@/data/columns/dbFamily";

// ---- C) 足し算チェッカーの項目定義 ---------------------------------------------------
// kind が単位の正体: "dBm"=絶対値（1mW基準の量そのもの）／"dB"・"dBi"=比率（倍率の対数）。
// 有効な組合せ: dBm+比率=dBm（掛け算の対数）・比率+比率=比率。無効: dBm+dBm（電力の積になってしまう）。

type TermKind = "dBm" | "dB" | "dBi";

type TermOption = {
  id: string;
  /** セレクトに出す説明つきラベル。 */
  label: string;
  /** 式表示用の短い値ラベル（例: 13dBm）。 */
  valueLabel: string;
  kind: TermKind;
  value: number;
};

const TERM_OPTIONS: TermOption[] = [
  { id: "tx13", label: "送信電力 13dBm（≈20mW）", valueLabel: "13dBm", kind: "dBm", value: 13 },
  { id: "tx20", label: "送信電力 20dBm（100mW）", valueLabel: "20dBm", kind: "dBm", value: 20 },
  { id: "ant3", label: "アンテナ利得 3dBi", valueLabel: "3dBi", kind: "dBi", value: 3 },
  { id: "amp10", label: "増幅器の利得 +10dB", valueLabel: "+10dB", kind: "dB", value: 10 },
  { id: "cable2", label: "ケーブル損失 −2dB", valueLabel: "−2dB", kind: "dB", value: -2 }
];

function findTerm(id: string): TermOption {
  return TERM_OPTIONS.find((option) => option.id === id) ?? TERM_OPTIONS[0];
}

type CheckerResult =
  | { valid: true; sum: number; unit: "dBm" | "dBi" | "dB"; note: string }
  | { valid: false; combinedDbm: number };

function evaluateTerms(a: TermOption, b: TermOption): CheckerResult {
  if (a.kind === "dBm" && b.kind === "dBm") {
    // 絶対値＋絶対値は「電力の掛け算」になってしまい無意味。正しくは線形に戻して電力和。
    return { valid: false, combinedDbm: combinePowersDbm(a.value, b.value) };
  }
  const sum = a.value + b.value;
  const hasDbm = a.kind === "dBm" || b.kind === "dBm";
  const dbiCount = (a.kind === "dBi" ? 1 : 0) + (b.kind === "dBi" ? 1 : 0);
  if (hasDbm) {
    return {
      valid: true,
      sum,
      unit: "dBm",
      note:
        dbiCount > 0
          ? "絶対値（dBm）＋比率（dBi）→ 結果は dBm のまま。送信電力にアンテナ利得（dBi）を足した値は EIRP（等方換算の実効放射電力）と呼ばれます。"
          : "絶対値（dBm）＋比率（dB）→ 結果は dBm のまま。「20mWを2倍にする」の掛け算が、対数では足し算になっています。"
    };
  }
  if (dbiCount === 2) {
    return {
      valid: true,
      sum,
      unit: "dB",
      note: "比率（dBi）＋比率（dBi）→ 利得の合計（dB）。Friis の式では送信側・受信側のアンテナ利得をこうして足し込みます。"
    };
  }
  if (dbiCount === 1) {
    return {
      valid: true,
      sum,
      unit: "dBi",
      note: "比率（dBi）＋比率（dB）→ 基準（等方アンテナ）は変わらないので、結果は dBi のままです。"
    };
  }
  return {
    valid: true,
    sum,
    unit: "dB",
    note: "比率（dB）＋比率（dB）→ 結果も比率（dB）。倍率の掛け算が足し算になっただけです。"
  };
}

// ---- B) 同じアンテナ、違う数字（2本のものさしSVG） -----------------------------------
// 1本の横軸（アンテナの実力＝等方基準の利得）に、ゼロ点の違う2本のものさしを当てる。
// マーカー（アンテナ）は1つなのに、dBiとdBdで読みが2.15ずれることを直接見せる。
// テキストは属性直指定（書き出したSVG単体でも画面と同じ見た目: v4 R4方式）。

const VIEW_W = 560;
const VIEW_H = 232;
const X0 = 36;
const PLOT_W = 504;
const G_MIN = -3.5;
const G_MAX = 16;

const DBI_TRACK_Y = 26;
const DBD_TRACK_Y = 116;
const TRACK_H = 16;

function xOf(gainDbi: number): number {
  return X0 + ((gainDbi - G_MIN) / (G_MAX - G_MIN)) * PLOT_W;
}

function GainScaleDiagram({ gainDbi, gainDbd }: { gainDbi: number; gainDbd: number }) {
  const markerX = xOf(gainDbi);
  const dbiZeroX = xOf(0);
  const dbdZeroX = xOf(DIPOLE_GAIN_DBI);
  const dbdPositive = gainDbd >= 0;
  const dbdBarColor = dbdPositive ? chartTheme.series.gain : chartTheme.series.loss;
  const dbdTextColor = dbdPositive ? chartTheme.seriesText.gain : chartTheme.seriesText.loss;

  const dbiTicks = [0, 3, 6, 9, 12, 15];
  const dbdTicks = [-2, 0, 3, 6, 9, 12];

  return (
    <svg
      role="img"
      aria-label={`アンテナ利得 ${formatNumber(gainDbi, 2)}dBi を、等方基準（dBi）と半波長ダイポール基準（dBd）の2本のものさしで表示。dBd では ${formatNumber(gainDbd, 2)}dBd と、2.15 小さく読める。`}
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      className="h-auto w-full"
      data-testid="db-family-gain-svg"
      data-dbi={gainDbi.toFixed(2)}
      data-dbd={gainDbd.toFixed(2)}
    >
      <rect width={VIEW_W} height={VIEW_H} fill={chartTheme.surface.canvas} />

      {/* ── 上段: dBi のものさし ── */}
      <text x={X0} y={16} fill={diagramPalette.inkSoft} fontSize={12} fontWeight={700}>
        dBi のものさし（0dBi ＝ 等方アンテナが基準）
      </text>
      <text
        x={X0 + PLOT_W}
        y={16}
        textAnchor="end"
        fill={diagramPalette.stafDark}
        fontSize={13}
        fontWeight={700}
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {formatNumber(gainDbi, 2)} dBi
      </text>
      <rect x={X0} y={DBI_TRACK_Y} width={PLOT_W} height={TRACK_H} fill={diagramPalette.white} stroke={diagramPalette.line} />
      <rect
        x={Math.min(dbiZeroX, markerX)}
        y={DBI_TRACK_Y}
        width={Math.abs(markerX - dbiZeroX)}
        height={TRACK_H}
        fill={diagramPalette.staf}
      />
      {dbiTicks.map((tick) => (
        <g key={tick}>
          <line
            x1={xOf(tick)}
            y1={DBI_TRACK_Y + TRACK_H}
            x2={xOf(tick)}
            y2={DBI_TRACK_Y + TRACK_H + 5}
            stroke={diagramPalette.faint}
            strokeWidth={1}
          />
          <text
            x={xOf(tick)}
            y={DBI_TRACK_Y + TRACK_H + 17}
            textAnchor="middle"
            fill={diagramPalette.muted}
            fontSize={10}
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {tick}
          </text>
        </g>
      ))}

      {/* ── ゼロ点のずれ（2.15dB）: 2本の基準線と双方向矢印 ── */}
      <line
        x1={dbiZeroX}
        y1={DBI_TRACK_Y - 4}
        x2={dbiZeroX}
        y2={DBD_TRACK_Y + TRACK_H + 4}
        stroke={diagramPalette.stafDark}
        strokeWidth={1.25}
        strokeDasharray="3 3"
      />
      <line
        x1={dbdZeroX}
        y1={DBI_TRACK_Y - 4}
        x2={dbdZeroX}
        y2={DBD_TRACK_Y + TRACK_H + 4}
        stroke={diagramPalette.successDeep}
        strokeWidth={1.25}
        strokeDasharray="3 3"
      />
      <line x1={dbiZeroX} y1={84} x2={dbdZeroX} y2={84} stroke={diagramPalette.inkMuted} strokeWidth={1.25} />
      <polygon points={`${dbiZeroX},84 ${dbiZeroX + 8},80.5 ${dbiZeroX + 8},87.5`} fill={diagramPalette.inkMuted} />
      <polygon points={`${dbdZeroX},84 ${dbdZeroX - 8},80.5 ${dbdZeroX - 8},87.5`} fill={diagramPalette.inkMuted} />
      <text x={dbdZeroX + 10} y={88} fill={diagramPalette.ink} fontSize={11} fontWeight={700} style={{ fontVariantNumeric: "tabular-nums" }}>
        基準（ゼロ点）のずれ 2.15dB ＝ ダイポール自身の利得
      </text>

      {/* ── 下段: dBd のものさし ── */}
      <text x={X0} y={108} fill={diagramPalette.inkSoft} fontSize={12} fontWeight={700}>
        dBd のものさし（0dBd ＝ 半波長ダイポール ＝ 2.15dBi が基準）
      </text>
      <text
        x={X0 + PLOT_W}
        y={108}
        textAnchor="end"
        fill={dbdTextColor}
        fontSize={13}
        fontWeight={700}
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {formatNumber(gainDbd, 2)} dBd
      </text>
      <rect x={X0} y={DBD_TRACK_Y} width={PLOT_W} height={TRACK_H} fill={diagramPalette.white} stroke={diagramPalette.line} />
      <rect
        x={Math.min(dbdZeroX, markerX)}
        y={DBD_TRACK_Y}
        width={Math.abs(markerX - dbdZeroX)}
        height={TRACK_H}
        fill={dbdBarColor}
      />
      {dbdTicks.map((tick) => (
        <g key={tick}>
          <line
            x1={xOf(tick + DIPOLE_GAIN_DBI)}
            y1={DBD_TRACK_Y + TRACK_H}
            x2={xOf(tick + DIPOLE_GAIN_DBI)}
            y2={DBD_TRACK_Y + TRACK_H + 5}
            stroke={diagramPalette.faint}
            strokeWidth={1}
          />
          <text
            x={xOf(tick + DIPOLE_GAIN_DBI)}
            y={DBD_TRACK_Y + TRACK_H + 17}
            textAnchor="middle"
            fill={diagramPalette.muted}
            fontSize={10}
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {tick}
          </text>
        </g>
      ))}

      {/* ── マーカー（同じ1本のアンテナ）: 2本のものさしを貫く ── */}
      <line x1={markerX} y1={DBI_TRACK_Y - 6} x2={markerX} y2={DBD_TRACK_Y + TRACK_H + 6} stroke={diagramPalette.danger} strokeWidth={1.5} />
      <circle cx={markerX} cy={DBI_TRACK_Y + TRACK_H / 2} r={5} fill={diagramPalette.white} stroke={diagramPalette.danger} strokeWidth={2} />
      <circle cx={markerX} cy={DBD_TRACK_Y + TRACK_H / 2} r={5} fill={diagramPalette.white} stroke={diagramPalette.danger} strokeWidth={2} />

      <text
        x={X0 + PLOT_W / 2}
        y={182}
        textAnchor="middle"
        fill={diagramPalette.ink}
        fontSize={12}
        fontWeight={700}
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        同じアンテナ: {formatNumber(gainDbi, 2)} dBi ＝ {formatNumber(gainDbd, 2)} dBd
      </text>
      <text x={X0} y={204} fill={diagramPalette.faint} fontSize={10}>
        マーカーの位置（アンテナの実力）は1つ。ゼロ点が2.15dBずれているので、dBd の数字はいつも小さく出ます。
      </text>
      <text x={X0} y={219} fill={diagramPalette.faint} fontSize={10}>
        カタログで dBd 表記のアンテナは、dBi 表記の同等品より数字が小さく「見える」だけです。
      </text>
    </svg>
  );
}

export function DbFamilyPanel() {
  // 既定は 6dBi（小型の外付けアンテナ級）: dBd では 3.85 と、2.15 の差が一目で分かる値から始める。
  const [gainDbi, setGainDbi] = useState(6);
  // 既定の足し算はスペック例そのもの: 送信電力13dBm ＋ アンテナ利得3dBi ＝ 16dBm（EIRP）。
  const [termAId, setTermAId] = useState("tx13");
  const [termBId, setTermBId] = useState("ant3");

  const gainError =
    !Number.isFinite(gainDbi) || gainDbi < 0 || gainDbi > 15
      ? "アンテナ利得は0〜15dBiで入力してください。"
      : undefined;
  const gainDbd = useMemo(
    () => (Number.isFinite(gainDbi) ? dbiToDbd(gainDbi) : Number.NaN),
    [gainDbi]
  );

  const termA = findTerm(termAId);
  const termB = findTerm(termBId);
  const checker = useMemo(() => evaluateTerms(termA, termB), [termA, termB]);

  const primary = checker.valid
    ? {
        label: "足し算チェッカーの結果",
        value: formatNumber(checker.sum, 1),
        unit: checker.unit
      }
    : {
        label: "正しい合成（電力和）",
        value: formatNumber(checker.combinedDbm, 1),
        unit: "dBm"
      };

  const selectClass =
    "min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-staf/40";

  return (
    <>
      {/* ── A) 正体マップ: 4つのバッジを2チームに色分け ── */}
      <Card as="section" padding="lg">
        <h2 className="text-base font-bold text-slate-950">正体マップ: dBの仲間は2チームに分かれる</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          見分け方は2つだけ。<strong>比率か絶対値か</strong>、そして<strong>基準（何で割ったか）は何か</strong>。
          dB・dBi・dBd は「割り算の答え」（単位のない倍率）、dBm だけが 1mW 基準の「量そのもの」です。
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-sky-200 bg-sky-50 p-4">
            <p className="text-xs font-bold text-sky-800">比率チーム（単位のない倍率）</p>
            <div className="mt-3 space-y-2">
              <div className="flex items-baseline gap-3">
                <span className="inline-flex min-w-12 justify-center rounded-full border border-sky-300 bg-white px-3 py-1 text-sm font-bold text-sky-800">
                  dB
                </span>
                <span className="text-sm text-slate-700">任意の2つの量の比（何倍か）</span>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="inline-flex min-w-12 justify-center rounded-full border border-sky-300 bg-white px-3 py-1 text-sm font-bold text-sky-800">
                  dBi
                </span>
                <span className="text-sm text-slate-700">基準 ＝ 等方アンテナ（全方向に均等な架空のアンテナ）</span>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="inline-flex min-w-12 justify-center rounded-full border border-sky-300 bg-white px-3 py-1 text-sm font-bold text-sky-800">
                  dBd
                </span>
                <span className="text-sm text-slate-700">基準 ＝ 半波長ダイポール（実在の基準アンテナ）</span>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-xs font-bold text-emerald-800">絶対値チーム（量そのもの）</p>
            <div className="mt-3 flex items-baseline gap-3">
              <span className="inline-flex min-w-12 justify-center rounded-full border border-emerald-300 bg-white px-3 py-1 text-sm font-bold text-emerald-800">
                dBm
              </span>
              <span className="text-sm text-slate-700">基準 ＝ 1mW に固定 → 電力の絶対値（0dBm＝1mW）</span>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-slate-600">
              基準を1つに固定した瞬間、比率は絶対値になります。「1mWの何倍か」は「何mWか」と同じ情報だからです。
            </p>
          </div>
        </div>
      </Card>

      <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,4.5fr)_minmax(0,5.5fr)] lg:items-start">
        {/* 左カラム: 体感入力とチェッカー */}
        <div className="space-y-4">
          {/* ── B) 同じアンテナ、違う数字 ── */}
          <Card as="section" padding="lg">
            <h2 className="text-base font-bold text-slate-950">同じアンテナ、違う数字</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              アンテナ利得のスライダーを動かすと、右の図で dBi と dBd の2つの読みが並んで動きます。
              dBd の基準（半波長ダイポール）自体が等方アンテナより 2.15dB 強く飛ぶため、
              <strong>同じアンテナでも dBd 表記は 2.15 小さい数字</strong>になります。
            </p>
            <div className="mt-4">
              <Field
                id="dbFamilyGain"
                label="アンテナ利得（カタログのdBi表記）"
                unit="dBi"
                value={gainDbi}
                min={0}
                max={15}
                step={0.05}
                showSlider
                emptyBehavior="preserve"
                onChange={setGainDbi}
                help="等方アンテナ基準の利得です。dBd表記へは −2.15 するだけ。0dBiにすると、dBd では −2.15dBd（＝ダイポールより弱い）になります。"
                example="6"
                error={gainError}
              />
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              いまの値:{" "}
              <span className="font-bold tabular-nums text-staf-dark">{formatNumber(gainDbi, 2)} dBi</span>
              {" ＝ "}
              <span className="font-bold tabular-nums text-slate-900">{formatNumber(gainDbd, 2)} dBd</span>
              。カタログで dBd 表記だと、同じアンテナが 2.15dB ぶん控えめに見えます。
            </p>
          </Card>

          {/* ── C) 足し算チェッカー ── */}
          <Card as="section" padding="lg">
            <h2 className="text-base font-bold text-slate-950">足し算チェッカー: その足し算、意味がありますか？</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              dBの足し算は「掛け算の対数」です。絶対値（dBm）に比率（dB/dBi）を掛けるのは意味がありますが、
              電力（dBm）同士は掛け算できません。2つの量を選んで確かめてください。
            </p>
            <div data-testid="db-family-checker" data-valid={checker.valid ? "true" : "false"} className="mt-4">
              <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-end">
                <div>
                  <label htmlFor="dbFamilyTermA" className="text-xs font-semibold text-slate-500">
                    1つ目の量
                  </label>
                  <select
                    id="dbFamilyTermA"
                    className={`mt-1 ${selectClass}`}
                    value={termAId}
                    onChange={(event) => setTermAId(event.target.value)}
                  >
                    {TERM_OPTIONS.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <span aria-hidden="true" className="hidden pb-2 text-lg font-bold text-slate-500 sm:block">
                  ＋
                </span>
                <div>
                  <label htmlFor="dbFamilyTermB" className="text-xs font-semibold text-slate-500">
                    2つ目の量
                  </label>
                  <select
                    id="dbFamilyTermB"
                    className={`mt-1 ${selectClass}`}
                    value={termBId}
                    onChange={(event) => setTermBId(event.target.value)}
                  >
                    {TERM_OPTIONS.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {checker.valid ? (
                <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                  <p className="text-sm font-bold tabular-nums text-emerald-900">
                    {termA.valueLabel} ＋ {termB.valueLabel} ＝ {formatNumber(checker.sum, 1)}
                    {checker.unit}（有効な足し算）
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600">{checker.note}</p>
                </div>
              ) : (
                <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-4">
                  <p className="text-sm font-bold text-rose-900">
                    電力同士は足し算できません（合成は電力和: 10log10(10^(P1/10)+10^(P2/10))）
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600">
                    <span className="tabular-nums">
                      {termA.valueLabel} と {termB.valueLabel} の正しい合成は{" "}
                      <strong className="text-slate-900">{formatNumber(checker.combinedDbm, 1)}dBm</strong>
                    </span>
                    （無相関な2波の電力和）。dBm は「量そのもの」なので、対数のまま足すと電力の掛け算に
                    なってしまいます。同じ値同士の合成は +3.01dB（2倍）です。
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* ── 使い分け: 既存dB系ツールとの役割分担 ── */}
          <Card as="section" padding="lg">
            <h2 className="text-base font-bold text-slate-950">使い分け: dB系ツールの役割分担</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              このツールの担当は「単位の意味の違い」（比率か絶対値か・基準は何か）。量感と数値換算は姉妹ツールへ。
            </p>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-slate-600">
              <li>
                <Link
                  href="/tools/db-feel"
                  className="inline-flex items-center gap-1 rounded font-semibold text-staf-dark transition hover:text-staf focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-staf/40"
                >
                  dBを体感する
                  <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
                </Link>
                {" "}— +3dBで2倍・+6dBで距離2倍という「量感」を手に馴染ませる
              </li>
              <li>
                <Link
                  href="/tools/dbm-converter"
                  className="inline-flex items-center gap-1 rounded font-semibold text-staf-dark transition hover:text-staf focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-staf/40"
                >
                  dBm 変換
                  <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
                </Link>
                {" "}— dBm⇔mW⇔W の数値換算（仕様書の値を線形に戻す）
              </li>
            </ul>
          </Card>
        </div>

        {/* 右カラム: 主結果と2本のものさし図（スクロール追従） */}
        <div className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <div id="db-family-primary-result">
            <ResultBar primary={primary} />
          </div>

          <ChartFrame
            eyebrow="2本のものさし"
            title="同じアンテナに、dBiとdBdのものさしを当てる"
            description="横軸はアンテナの実力（等方基準の利得）。上下2本のものさしはゼロ点が2.15dBずれているだけで、マーカー（アンテナ）は1つです。スライダーに連動します。"
            exportName="db-family-gain-scales"
            caption={
              Number.isFinite(gainDbd)
                ? `条件: アンテナ利得 ${formatNumber(gainDbi, 2)}dBi ─ dBd表記では ${formatNumber(gainDbd, 2)}dBd（dBd = dBi − 2.15。IEEE Std 145 / 半波長ダイポールの指向性1.64 = 2.15dB）。`
                : "入力値を確認してください。"
            }
          >
            {Number.isFinite(gainDbd) ? (
              <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                <GainScaleDiagram gainDbi={gainDbi} gainDbd={gainDbd} />
              </div>
            ) : (
              <p className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
                入力値を確認すると2本のものさし図が表示されます。
              </p>
            )}
          </ChartFrame>
        </div>
      </section>

      <div className="mt-6">
        <FormulaExplanationCard
          title="基礎から: なぜ4つも「dB」があるのか"
          formula={
            "dB = 10·log10(P2/P1)　…任意の比率（無次元）\ndBm = 10·log10(P/1mW)　…基準を1mWに固定 → 絶対値（0dBm = 1mW）\ndBi = 基準:等方アンテナ　dBd = 基準:半波長ダイポール　dBd = dBi − 2.15"
          }
          showColumnLink={false}
        >
          <p>
            <strong>① dBは「割り算の答え」を対数で書いたものです。</strong>
            2つの量を割って「何倍か」を出し、その対数を10倍したのが dB。割り算の答えなので単位はなく、
            「何と何を割ったか」を言わない限り、dB単独では大きさを表せません。
          </p>
          <p>
            <strong>② dBmは「1mWとの割り算」——だから絶対値です。</strong>
            割る相手（基準）を 1mW に固定すると、「1mWの何倍か」は「何mWか」と同じ情報になります。
            比率だったdBが、基準の固定によって電力の絶対値に変わる——これが dBm の正体です。
            0dBm＝1mW、+20dBm＝100mW。
          </p>
          <p>
            <strong>③ dBi/dBdは「基準アンテナとの割り算」——基準が違えば数字がずれます。</strong>
            アンテナ利得は「基準アンテナの何倍飛ぶか」。基準が架空の等方アンテナなら dBi、
            実在する半波長ダイポールなら dBd です。ダイポール自身が等方より 2.15dB 強く飛ぶので、
            同じアンテナでも dBd の数字は必ず 2.15 小さくなります。単位を書き忘れると、
            この 2.15dB がそのまま読み違いになります。
          </p>
        </FormulaExplanationCard>
      </div>

      <div className="mt-6">
        <ToolColumnCard
          column={dbFamilyColumn}
          live={Number.isFinite(gainDbd) ? { dbiToDbd: `${formatNumber(gainDbd, 2)}dBd` } : undefined}
        />
      </div>

      <MobileResultBar primary={primary} targetId="db-family-primary-result" />
    </>
  );
}
