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
  guidedWavelengthMm,
  phasePerMmDeg,
  physicalLengthToElectricalLengthLambda,
  physicalLengthToPhaseDeg,
  wrappedPhaseDeg
} from "@/lib/rf/electricalLength";
import { formatNumber } from "@/lib/rf/format";
import { FormulaExplanationCard } from "./FormulaExplanationCard";
import { ElectricalLengthColumn } from "./ElectricalLengthColumn";

// 速度係数 VF のプリセット。誘電体で一意に決まる「固い値」のみを採用する。
// VF = 1/√εr（TEM同軸）。マイクロストリップは εeff（線幅依存）で近似のため注記付き。
// 出典:
//  ・充実PTFE εr≈2.07 → VF≈0.695（本ツール既定・セミリジッド同軸標準。D. M. Pozar,
//    "Microwave Engineering", 4th ed., App.）。
//  ・充実ポリエチレン εr≈2.25 → VF≈0.667（RG-58/RG-213 等の代表値）。
//  ・発泡ポリエチレン VF≈0.80〜0.86（発泡率依存。代表値 0.82）。
//  ・FR-4 の 50Ω マイクロストリップ εeff≈3.3 → VF≈0.55（Hammerstad 近似・線幅で変動）。
const VF_PRESETS = [
  { label: "自由空間 1.0", vf: 1.0, note: "誘電体なし（基準）" },
  { label: "発泡PE同軸 0.82", vf: 0.82, note: "発泡ポリエチレン（0.80〜0.86）" },
  { label: "PTFE同軸 0.695", vf: 0.695, note: "充実PTFE εr≈2.07・セミリジッド標準" },
  { label: "充実PE同軸 0.66", vf: 0.66, note: "充実ポリエチレン εr≈2.25（RG-58/213）" },
  { label: "FR-4 μstrip ≈0.55", vf: 0.55, note: "FR-4 50Ω線 εeff≈3.3・線幅で変動" }
] as const;

// ---- 位相の進みを可視化する動的SVG（入力連動） -------------------------------------
// 「線路の帯（長さL）」に沿って、その線路の管内波長 λg で決まる正弦波を描く。
// 0/90/180/270° … の位置に目盛りマーカーを立て、終端に到達した総位相を表示する。
// 周波数↑・VF↓ で λg が縮み、同じ L でも波数（=電気長）が増える様子が1枚で伝わる。
// テキストは属性直指定（書き出したSVG単体でも画面と同じ見た目: v4 R4方式）。

function PhaseWaveDiagram({
  lengthMm,
  guidedWavelength,
  phaseDeg
}: {
  lengthMm: number;
  guidedWavelength: number;
  phaseDeg: number;
}) {
  const chart = { width: 640, height: 260, top: 34, bottom: 66, left: 46, right: 30 };
  const plotW = chart.width - chart.left - chart.right;
  const plotH = chart.height - chart.top - chart.bottom;
  const midY = chart.top + plotH / 2;
  const amp = plotH / 2 - 6;

  // x スケールは L と 1波長 λg の大きい方に合わせ、両方が図に収まるようにする。
  const spanMm = Math.max(lengthMm, guidedWavelength, 1) * 1.08;
  const xOf = (mm: number) => chart.left + (mm / spanMm) * plotW;

  // 線路に沿った正弦波（0..L を 60 分割 = 61点）。位相(mm)=360·mm/λg → rad=2π·mm/λg。
  const SAMPLES = 60;
  const wavePoints = Array.from({ length: SAMPLES + 1 }, (_, i) => {
    const mm = (lengthMm * i) / SAMPLES;
    const rad = (2 * Math.PI * mm) / guidedWavelength;
    const yy = midY - amp * Math.sin(rad);
    return `${xOf(mm).toFixed(2)},${yy.toFixed(2)}`;
  }).join(" ");

  // 90°ごとの目盛り位置（mm = k·λg/4）。L に収まる範囲だけ立てる。
  const quarterMm = guidedWavelength / 4;
  const markerCount = Math.floor(phaseDeg / 90);
  const markers = Array.from({ length: markerCount + 1 }, (_, k) => ({
    deg: k * 90,
    mm: k * quarterMm
  }));
  const labelEvery = markers.length > 10 ? 2 : 1;

  const cableLeft = xOf(0);
  const cableRight = xOf(lengthMm);
  const endY = midY - amp * Math.sin((2 * Math.PI * lengthMm) / guidedWavelength);
  const lambdaRight = xOf(guidedWavelength);
  const turns = Math.floor(phaseDeg / 360);

  return (
    <svg
      role="img"
      aria-label={`長さ${formatNumber(lengthMm, 0)}mmの線路に沿った位相の進み。管内波長${formatNumber(
        guidedWavelength,
        1
      )}mm、終端の総位相${formatNumber(phaseDeg, 1)}度`}
      viewBox={`0 0 ${chart.width} ${chart.height}`}
      className="h-auto w-full"
    >
      <rect width={chart.width} height={chart.height} fill={chartTheme.surface.canvas} />

      {/* 線路の帯（物理長 L）。この帯の中を波が進む */}
      <rect
        x={cableLeft}
        y={midY - amp - 10}
        width={Math.max(0, cableRight - cableLeft)}
        height={2 * amp + 20}
        rx={8}
        fill={chartTheme.surface.plain}
        stroke={diagramPalette.line}
        strokeWidth={1.5}
      />
      {/* 中心（0レベル）線 */}
      <line
        x1={cableLeft}
        x2={cableRight}
        y1={midY}
        y2={midY}
        stroke={chartTheme.grid.secondary}
        strokeDasharray="4 4"
      />

      {/* 位相の進みを表す正弦波 */}
      <polyline
        points={wavePoints}
        fill="none"
        stroke={diagramPalette.staf}
        strokeWidth={chartTheme.stroke.series}
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* 90°ごとの目盛りマーカー */}
      {markers.map((marker, index) => {
        const mx = xOf(marker.mm);
        return (
          <g key={marker.deg}>
            <line
              x1={mx}
              x2={mx}
              y1={midY - amp - 4}
              y2={midY + amp + 4}
              stroke={diagramPalette.faint}
              strokeWidth={1}
            />
            {index % labelEvery === 0 ? (
              <text
                x={mx}
                y={chart.top - 12}
                textAnchor="middle"
                fill={diagramPalette.muted}
                fontSize={10}
                fontWeight={600}
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {marker.deg}°
              </text>
            ) : null}
          </g>
        );
      })}

      {/* 終端（L）の到達点と総位相 */}
      <line
        x1={cableRight}
        x2={cableRight}
        y1={midY - amp - 10}
        y2={midY + amp + 10}
        stroke={chartTheme.seriesText.source}
        strokeWidth={1.5}
      />
      <circle cx={cableRight} cy={endY} r={4.5} fill={chartTheme.seriesText.source} stroke={chartTheme.surface.plain} strokeWidth={1.5} />
      <text
        x={cableRight}
        y={chart.top - 12}
        textAnchor={cableRight > chart.width - 90 ? "end" : "middle"}
        fill={chartTheme.seriesText.source}
        fontSize={12}
        fontWeight={700}
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {formatNumber(phaseDeg, 1)}°{turns >= 1 ? `（${turns}周+${formatNumber(wrappedPhaseDeg(phaseDeg), 0)}°）` : ""}
      </text>

      {/* 長さ軸 */}
      <text x={cableLeft} y={chart.height - 40} textAnchor="middle" fill={diagramPalette.muted} fontSize={11}>
        0
      </text>
      <text
        x={cableRight}
        y={chart.height - 40}
        textAnchor={cableRight > chart.width - 70 ? "end" : "middle"}
        fill={diagramPalette.inkSoft}
        fontSize={11}
        fontWeight={600}
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        L = {formatNumber(lengthMm, 0)}mm
      </text>

      {/* λg（1波長＝360°）の参照ブラケット */}
      <line x1={cableLeft} x2={lambdaRight} y1={chart.height - 24} y2={chart.height - 24} stroke={diagramPalette.muted} strokeWidth={1} />
      <line x1={cableLeft} x2={cableLeft} y1={chart.height - 28} y2={chart.height - 20} stroke={diagramPalette.muted} strokeWidth={1} />
      <line x1={lambdaRight} x2={lambdaRight} y1={chart.height - 28} y2={chart.height - 20} stroke={diagramPalette.muted} strokeWidth={1} />
      <text
        x={(cableLeft + lambdaRight) / 2}
        y={chart.height - 8}
        textAnchor="middle"
        fill={diagramPalette.muted}
        fontSize={10}
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        λg = {formatNumber(guidedWavelength, 1)}mm（1周 = 360°）
      </text>
    </svg>
  );
}

export function ElectricalLengthPanel() {
  // 既定は 920MHz・VF0.695（充実PTFE同軸）・L=100mm。位相 ≈ 159°（1波長に届かない ≈0.44λ）。
  const [frequencyMHz, setFrequencyMHz] = useState(920);
  const [velocityFactor, setVelocityFactor] = useState(0.695);
  const [lengthMm, setLengthMm] = useState(100);

  const result = useMemo(() => {
    try {
      const guidedWavelength = guidedWavelengthMm(frequencyMHz, velocityFactor);
      const phaseDeg = physicalLengthToPhaseDeg(lengthMm, frequencyMHz, velocityFactor);
      const electricalLengthLambda = physicalLengthToElectricalLengthLambda(
        lengthMm,
        frequencyMHz,
        velocityFactor
      );
      const degPerMm = phasePerMmDeg(frequencyMHz, velocityFactor);
      return {
        guidedWavelength,
        phaseDeg,
        electricalLengthLambda,
        degPerMm,
        turns: Math.floor(phaseDeg / 360),
        wrapped: wrappedPhaseDeg(phaseDeg)
      };
    } catch {
      return null;
    }
  }, [frequencyMHz, velocityFactor, lengthMm]);

  const frequencyError =
    !Number.isFinite(frequencyMHz) || frequencyMHz <= 0
      ? "周波数は0より大きい値を入力してください。"
      : undefined;
  const vfError =
    !Number.isFinite(velocityFactor) || velocityFactor <= 0 || velocityFactor > 1
      ? "速度係数VFは0より大きく1以下で入力してください。"
      : undefined;
  const lengthError =
    !Number.isFinite(lengthMm) || lengthMm < 0
      ? "物理長は0以上の値を入力してください。"
      : undefined;

  const primary = {
    label: "位相（電気長）",
    value: result === null ? "—" : formatNumber(result.phaseDeg, 1),
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
            電気長は次の3つで決まります。①周波数（波長の元）②速度係数VF（線路の中で波がどれだけ遅いか）
            ③物理長L。まず管内波長 λg=VF·λ₀ を出し、Lが λg の何倍かで位相[°]が決まります。
          </p>

          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-500">
              速度係数VFプリセット（誘電体で決まる代表値・出典はコード注記）
            </p>
            <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="速度係数VFプリセット">
              {VF_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  className={chipClass(Math.abs(velocityFactor - preset.vf) < 0.001)}
                  onClick={() => setVelocityFactor(preset.vf)}
                  title={preset.note}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <Field
              id="elFrequency"
              label="周波数 f"
              unit="MHz"
              value={frequencyMHz}
              min={0.001}
              step={1}
              emptyBehavior="preserve"
              onChange={setFrequencyMHz}
              help="波長の元です。周波数が高いほど波長は短くなり、同じ長さの線路でも位相の進みは大きくなります。"
              example="920"
              error={frequencyError}
            />
            <Field
              id="elVelocityFactor"
              label="速度係数 VF"
              value={velocityFactor}
              min={0.5}
              max={1.0}
              step={0.005}
              showSlider
              emptyBehavior="preserve"
              onChange={setVelocityFactor}
              help="線路の中で波が真空中の何倍の速さで進むか（0〜1）。VF=1/√εr。充実PTFE同軸で0.695、充実PE同軸で0.66前後。基板マイクロストリップは実効εeffで決まり線幅に依存します。"
              example="0.695"
              error={vfError}
            />
            <Field
              id="elLength"
              label="物理長 L"
              unit="mm"
              value={lengthMm}
              min={0}
              step={1}
              emptyBehavior="preserve"
              onChange={setLengthMm}
              help="線路の物理的な長さです。回路の言葉では「何mm」より「何λ・何度」が本質で、分配・アレイ・差動配線ではこの長さの差が位相のずれになります。"
              example="100"
              error={lengthError}
            />
          </div>
        </Card>

        <div className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <div id="electrical-length-primary-result">
            <ResultBar primary={primary} />
          </div>

          <Card as="section" padding="lg">
            <h2 className="text-base font-bold text-slate-950">この線路の内訳</h2>
            {result ? (
              <>
                <div className="mt-3 space-y-1.5 text-sm">
                  <div className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-lg px-2 py-1">
                    <span className="text-slate-600">電気長</span>
                    <span className="text-right font-semibold tabular-nums text-slate-900">
                      {formatNumber(result.electricalLengthLambda, 3)} λ
                    </span>
                  </div>
                  <div className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-lg px-2 py-1">
                    <span className="text-slate-600">管内波長 λg</span>
                    <span className="text-right font-semibold tabular-nums text-slate-900">
                      {formatNumber(result.guidedWavelength, 1)} mm
                    </span>
                  </div>
                  <div className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-lg px-2 py-1">
                    <span className="text-slate-600">1mmあたりの位相</span>
                    <span className="text-right font-semibold tabular-nums text-slate-900">
                      {formatNumber(result.degPerMm, 2)} °/mm
                    </span>
                  </div>
                  {result.turns >= 1 ? (
                    <div className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-lg bg-staf-light px-2 py-1 ring-1 ring-staf/40">
                      <span className="text-staf-dark">周回数（wrap後）</span>
                      <span className="text-right font-semibold tabular-nums text-staf-dark">
                        {result.turns}周 + {formatNumber(result.wrapped, 1)}°
                      </span>
                    </div>
                  ) : null}
                </div>
                <p className="mt-4 text-sm leading-relaxed text-slate-600">
                  この線路では <strong className="tabular-nums">1mm の長さ違い = {formatNumber(result.degPerMm, 2)}°</strong>{" "}
                  の位相ずれになります。分配やフェーズドアレイの等長配線では、この値が「許される製造公差」の物差しです。
                </p>
              </>
            ) : (
              <p className="mt-3 text-sm text-slate-500">入力値を確認してください。</p>
            )}
            <p className="mt-4 text-sm leading-relaxed text-slate-600">
              基板配線で λg を詰めたいときは
              <Link
                href="/tools/microstrip-line"
                className="mx-1 inline-flex items-center gap-1 rounded font-semibold text-staf-dark transition hover:text-staf focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-staf/40"
              >
                マイクロストリップ線路
                <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
              </Link>
              で εeff から λg を求められます。
            </p>
          </Card>
        </div>
      </section>

      <div className="mt-6">
        <ChartFrame
          eyebrow="位相ダイアグラム"
          title="線路に沿って位相はどう進むか"
          description="線路の帯（物理長L）の中を、管内波長 λg で決まる波が進みます。0/90/180/270°の目盛りで進みを、終端バッジで到達した総位相を確認できます。周波数・VF・L に連動して波の数が変わります。"
          exportName="electrical-length-phase"
          caption={
            result
              ? `条件: f=${formatNumber(frequencyMHz, 0)}MHz / VF=${formatNumber(velocityFactor, 3)} / L=${formatNumber(lengthMm, 0)}mm ─ λg ${formatNumber(result.guidedWavelength, 1)}mm・電気長 ${formatNumber(result.electricalLengthLambda, 3)}λ・位相 ${formatNumber(result.phaseDeg, 1)}°`
              : "入力値を確認してください。"
          }
        >
          {result ? (
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
              <PhaseWaveDiagram
                lengthMm={lengthMm}
                guidedWavelength={result.guidedWavelength}
                phaseDeg={result.phaseDeg}
              />
            </div>
          ) : (
            <p className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
              入力値を確認すると位相ダイアグラムが表示されます。
            </p>
          )}
        </ChartFrame>
      </div>

      <div className="mt-6">
        <FormulaExplanationCard
          title="基礎から: なぜ「何mm」を「何度」に直すのか"
          formula={"λg[mm] = VF × λ0 = VF × (c / f) × 1000\n位相 φ[deg] = 360 × L / λg\ndeg/mm = 360 / λg"}
          showColumnLink={false}
        >
          <p>
            <strong>① ケーブルの中では、光より遅い。</strong>
            真空では電波は光速 c で進みますが、ケーブルや基板の中は誘電体で満たされ、波はそれより遅くなります。
            その「遅さ」の割合が速度係数VFです（VF = 1/√εr）。遅くなると波長も VF 倍に縮み、これが管内波長
            <strong> λg = VF · λ₀</strong> です。同じ100mmでも、VFが小さい線路ほど中には多くの波が詰まります。
          </p>
          <p>
            <strong>② 回路の言葉は「何mm」ではなく「何λ・何度」。</strong>
            電波にとって意味があるのは絶対長さではなく、波長に対してどれだけ進んだかです。1波長進めば360°、
            半波長で180°。だから物理長Lを λg で割った<strong>電気長 N=L/λg</strong>と、
            それを角度にした<strong>位相 φ=360·L/λg</strong>が回路の共通言語になります。
          </p>
          <p>
            <strong>③ 実務では「長さの差」が「位相のずれ」になる。</strong>
            分配器で複数のアンテナへ同じ位相で給電したい、フェーズドアレイで狙った角度に波面を揃えたい、
            差動配線で+と−を同時に届けたい——どれも「電気長を合わせる」設計です。行進にたとえるなら、
            全員が同じ歩幅（λ）で同じ歩数を刻めば隊列（波面）は揃う。歩数がひとりだけ違うと列が崩れます。
            ※ただし兵士の歩幅は一定でも、線路の「歩幅」λg は周波数が上がると縮みます——だから同じ配線でも
            高い周波数ほど歩数（位相）が増え、広帯域では位相を一定に保てません（分散）。
          </p>
          <p>
            結論: 位相 = 360 × L / λg。データシートの「電気長」や基板の蛇行配線は魔法ではなく、
            この一本の式で長さを角度に翻訳しているだけです。
          </p>
        </FormulaExplanationCard>
      </div>

      <div className="mt-6">
        <ElectricalLengthColumn />
      </div>

      <MobileResultBar primary={primary} targetId="electrical-length-primary-result" />
    </>
  );
}
