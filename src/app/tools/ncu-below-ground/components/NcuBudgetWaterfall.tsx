import { Callout } from "@/components/Callout";
import { Card } from "@/components/Card";
import { DiagramExportButton } from "@/components/DiagramExportButton";
import { chartTheme } from "@/lib/chartTheme";
import { formatDb, formatDbm, formatSigned } from "@/lib/rf/format";
import type { NcuBelowGroundInput, NcuBelowGroundResult } from "@/lib/rf/ncuBelowGround";

type NcuBudgetWaterfallProps = {
  input: NcuBelowGroundInput;
  result: NcuBelowGroundResult;
};

type StepGroup = "source" | "gain" | "ground" | "below" | "correction" | "total";

type WaterfallStep = {
  key: string;
  label: string;
  short: string;
  start: number;
  end: number;
  delta: number;
  group: StepGroup;
  note: string;
  isDominant?: boolean;
};

const chart = {
  top: 48,
  bottom: 96,
  left: 54,
  right: 136,
  barWidth: 42,
  stepGap: 62,
  height: 432
};

// 地上側（寒色スレート）と地下の追加損失（暖色＝重症度）を色で分け、
// 「どこで予算を食っているか」を一目で読めるようにする。
function belowGroundTone(abs: number): { fill: string; stroke: string } {
  if (abs >= 18) {
    return { fill: "#e11d48", stroke: "#9f1239" };
  }
  if (abs >= 10) {
    return { fill: "#f97316", stroke: "#c2410c" };
  }
  if (abs >= 4) {
    return { fill: "#f59e0b", stroke: "#b45309" };
  }
  return { fill: "#fbbf24", stroke: "#b45309" };
}

function stepTone(step: WaterfallStep): { fill: string; stroke: string } {
  // 系列色は chartTheme を単一ソースに（リンクバジェット滝グラフと双子に揃える）。
  // ground（スレート）と below（重症度ヒート）はNCU固有のドメイン表現として個別に保つ。
  switch (step.group) {
    case "source":
      return { fill: chartTheme.series.source, stroke: "#005A95" };
    case "gain":
    case "correction":
      return step.delta >= 0
        ? { fill: chartTheme.series.gain, stroke: "#047857" }
        : { fill: chartTheme.series.loss, stroke: "#be123c" };
    case "ground":
      return { fill: "#94a3b8", stroke: "#64748b" };
    case "below":
      return belowGroundTone(Math.abs(step.delta));
    case "total":
      return { fill: chartTheme.series.total, stroke: "#0f172a" };
  }
}

const belowShortLabelById: Record<string, string> = {
  cover: "蓋",
  box: "BOX",
  depth: "深さ",
  moisture: "水分",
  antenna: "位置",
  opening: "開口",
  surface: "地表"
};

function buildSteps(input: NcuBelowGroundInput, result: NcuBelowGroundResult): WaterfallStep[] {
  const steps: WaterfallStep[] = [];
  let current = 0;

  const add = (
    key: string,
    label: string,
    short: string,
    delta: number,
    group: StepGroup,
    note: string,
    options?: { skipIfZero?: boolean; isDominant?: boolean }
  ) => {
    if (options?.skipIfZero && Math.abs(delta) < 0.05) {
      return;
    }
    const start = current;
    const end = current + delta;
    steps.push({ key, label, short, start, end, delta, group, note, isDominant: options?.isDominant });
    current = end;
  };

  add("tx", "送信電力", "送信", input.txPowerDbm, "source", "送信機から出る電波の強さ");
  add("gwGain", "地上側アンテナ利得", "GW利得", input.gatewayAntennaGainDbi, "gain", "ゲートウェイ・基地局側アンテナの利得");
  add("ncuGain", "NCUアンテナ利得", "NCU利得", input.ncuAntennaGainDbi, "gain", "BOX内アンテナの実効利得（小型・筐体内では負になりやすい）");
  add("outdoor", "地上側伝搬損失", "地上伝搬", -result.outdoorPathLossDb, "ground", "ゲートウェイからBOX付近までの距離減衰", { skipIfZero: true });
  add("cable", "ケーブル・コネクタ損失", "ケーブル", -input.cableLossDb, "ground", "給電系で失う電力", { skipIfZero: true });
  add("clutter", "地上側クラッタ損失", "クラッタ", -input.aboveGroundClutterLossDb, "ground", "建物・樹木・地形など地上側の遮蔽（島田さんの『障害物ぶん』）", { skipIfZero: true });

  // 地下の追加損失を、最大寄与（主因）にマーク付きで積み上げる。
  const belowItems = result.breakdown.map((item) => ({ ...item, abs: Math.abs(item.range.typical) }));
  const dominantId = belowItems.reduce(
    (max, item) => (item.abs > max.abs ? item : max),
    { id: "", abs: -1 } as { id: string; abs: number }
  ).id;

  for (const item of result.breakdown) {
    add(
      `below-${item.id}`,
      item.label,
      belowShortLabelById[item.id] ?? item.label,
      -item.range.typical,
      "below",
      item.note,
      { skipIfZero: true, isDominant: item.id === dominantId && item.range.typical >= 0.05 }
    );
  }

  add("correction", "実測補正値", "補正", input.measuredCorrectionDb, "correction", "現地RSSI/RSRP実測で補正する差分", { skipIfZero: true });

  steps.push({
    key: "received",
    label: "受信電力",
    short: "受信電力",
    start: 0,
    end: result.receivedPowerRangeDbm.typical,
    delta: result.receivedPowerRangeDbm.typical,
    group: "total",
    note: "BOX内のNCUに届くと推定される電波の強さ（標準条件）"
  });

  return steps;
}

function roundTo(value: number, direction: "up" | "down", step = 10) {
  return direction === "up" ? Math.ceil(value / step) * step : Math.floor(value / step) * step;
}

export function NcuBudgetWaterfall({ input, result }: NcuBudgetWaterfallProps) {
  const steps = buildSteps(input, result);
  const values = steps.flatMap((step) => [step.start, step.end]);
  const sensitivity = input.receiverSensitivityDbm;
  const maxValue = roundTo(Math.max(...values, sensitivity, 0) + 8, "up");
  const minValue = roundTo(
    Math.min(...values, sensitivity, result.receivedPowerRangeDbm.min) - 8,
    "down"
  );

  const width = chart.left + chart.right + steps.length * chart.stepGap;
  const plotHeight = chart.height - chart.top - chart.bottom;
  const span = Math.max(1, maxValue - minValue);

  const y = (value: number) => chart.top + ((maxValue - value) / span) * plotHeight;
  const x = (index: number) => chart.left + index * chart.stepGap + (chart.stepGap - chart.barWidth) / 2;

  const ticks = Array.from({ length: Math.floor((maxValue - minValue) / 20) + 1 }, (_, i) => maxValue - i * 20);
  const sensitivityY = y(sensitivity);
  const zeroY = y(0);

  const totalIndex = steps.length - 1;
  const totalCenterX = x(totalIndex) + chart.barWidth / 2;
  const marginTypical = result.linkMarginRangeDb.typical;
  const marginPass = marginTypical >= 0;

  // マージン寸法ブラケット（v4-6: 旗艦滝グラフと双子の直接ラベリング）。
  const typicalY = y(result.receivedPowerRangeDbm.typical);
  const bracketX = x(totalIndex) + chart.barWidth + 8;
  const bracketTop = Math.min(typicalY, sensitivityY);
  const bracketBottom = Math.max(typicalY, sensitivityY);
  const bracketMidY = (bracketTop + bracketBottom) / 2;
  const bracketColor = marginPass ? chartTheme.seriesText.gain : chartTheme.seriesText.loss;
  // 右余白の受信感度ラベル（sensitivityY±12）との衝突時はラベルを上へ退避。
  const marginLabelY = Math.abs(bracketMidY - sensitivityY) < 30 ? bracketTop - 10 : bracketMidY;

  return (
    <Card as="section" padding="lg" data-testid="ncu-budget-waterfall">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-staf-dark">滝グラフ</p>
          <h2 className="mt-1 text-xl font-bold text-slate-950">リンクバジェット滝グラフ（GL以下NCU）</h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">
            送信電力からスタートし、利得で増え、地上側の損失（青グレー）と
            <span className="font-bold text-orange-700">地下の追加損失（蓋・BOX・深さ・水分など＝暖色）</span>
            で落ちていき、最後の受信電力が<span className="font-bold text-rose-700">受信感度ライン（赤破線）</span>を上回るかを見ます。
          </p>
        </div>
        <div className="grid grid-cols-2 gap-1.5 text-[11px] font-bold sm:grid-cols-3">
          <span className="rounded-full bg-staf-light px-2.5 py-1 text-staf-dark" title="送信出力とアンテナ利得＝電波を増やす要素。青＝送信出力（スタート）、緑＝利得で上に積み上がります。">開始・利得</span>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600" title="地上側の損失（青グレー）＝距離による伝搬損失・ケーブル損・地上クラッタ。電波を弱める分だけ下に伸びます。">地上損失</span>
          <span className="rounded-full bg-orange-50 px-2.5 py-1 text-orange-700" title="地下の追加損失（暖色）＝蓋・BOX・深さ・水分・アンテナ位置・開口・地表遮蔽。色が濃い（赤に近い）ほど大きな損失です。">地下損失</span>
          <span className="rounded-full bg-rose-50 px-2.5 py-1 text-rose-700" title="受信感度＝受信機がぎりぎり受け取れる強さ（赤い破線）。最後の受信電力がこの線より上なら通信成立です。">受信感度</span>
          <span className="rounded-full bg-slate-800 px-2.5 py-1 text-white" title="受信電力＝すべての増減を足し引きした最終結果（dBm）。縦のヒゲは楽観〜厳しめのレンジを表します。">受信電力</span>
        </div>
      </div>

      <p className="mt-5 text-[11px] font-medium text-slate-400 sm:hidden">← 横スクロールで全体を表示できます →</p>
      <DiagramExportButton filenameBase="ncu-link-budget-waterfall">
      <div className="mt-1.5 overflow-x-auto rounded-lg border border-slate-200 bg-slate-50 sm:mt-5">
        <svg
          role="img"
          aria-label="GL以下NCUのリンクバジェット滝グラフ。送信電力から受信電力までの増減と受信感度ラインを表示。"
          viewBox={`0 0 ${width} ${chart.height}`}
          style={{ minWidth: Math.min(width, 760) }}
          className="h-auto w-full"
        >
          <rect width={width} height={chart.height} fill="#F8FAFC" />

          {ticks.map((tick) => (
            <g key={tick}>
              <line x1={chart.left} x2={width - chart.right} y1={y(tick)} y2={y(tick)} stroke="#E2E8F0" />
              <text x={chart.left - 10} y={y(tick) + 4} textAnchor="end" fill="#94a3b8" fontSize="11">
                {tick}
              </text>
            </g>
          ))}

          {/* 0 dBm 基準線 */}
          {zeroY > chart.top && zeroY < chart.height - chart.bottom ? (
            <line x1={chart.left} x2={width - chart.right} y1={zeroY} y2={zeroY} stroke="#cbd5e1" strokeDasharray="4 4" />
          ) : null}

          {/* 受信感度ライン */}
          <line
            x1={chart.left}
            x2={width - chart.right}
            y1={sensitivityY}
            y2={sensitivityY}
            stroke="#E11D48"
            strokeDasharray="7 5"
            strokeWidth={2}
          />
          <text x={width - chart.right + 8} y={sensitivityY - 6} fill="#be123c" fontSize="12" fontWeight="700">
            受信感度
          </text>
          <text x={width - chart.right + 8} y={sensitivityY + 12} fill="#be123c" fontSize="12" fontWeight="700">
            {formatDbm(sensitivity)}
          </text>

          {steps.map((step, index) => {
            const startY = y(step.start);
            const endY = y(step.end);
            const top = Math.min(startY, endY);
            const height = Math.max(3, Math.abs(endY - startY));
            const tone = stepTone(step);
            const centerX = x(index) + chart.barWidth / 2;
            const valueLabel =
              step.group === "total"
                ? formatDbm(step.end)
                : formatSigned(step.delta, step.group === "source" ? "dBm" : "dB");
            const labelAbove = step.delta >= 0 || step.group === "total";

            return (
              <g key={step.key}>
                {/* SVG<title>は特殊コンテンツモデルのため、子を分割するとReactの区切りコメントが
                    ブラウザ解析で併合されハイドレーション不一致になる。単一テキストノードにまとめる。 */}
                <title>{`${step.label}：${valueLabel}\n${step.note}`}</title>
                {index > 0 ? (
                  <line
                    x1={x(index - 1) + chart.barWidth}
                    x2={x(index)}
                    y1={y(steps[index - 1].end)}
                    y2={y(steps[index - 1].end)}
                    stroke="#cbd5e1"
                    strokeDasharray="3 3"
                  />
                ) : null}
                <rect
                  x={x(index)}
                  y={top}
                  width={chart.barWidth}
                  height={height}
                  rx={7}
                  fill={tone.fill}
                  stroke={tone.stroke}
                  strokeWidth={step.isDominant ? 3 : 1.5}
                />
                {step.isDominant ? (
                  <g>
                    <rect x={centerX - 22} y={top - 34} width={44} height={17} rx={8} fill="#e11d48" />
                    <text x={centerX} y={top - 22} textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="700">
                      主因
                    </text>
                  </g>
                ) : null}
                <text
                  x={centerX}
                  y={labelAbove ? top - 8 : top + height + 15}
                  textAnchor="middle"
                  fill="#0f172a"
                  fontSize="11.5"
                  fontWeight="700"
                >
                  {valueLabel}
                </text>
                <text x={centerX} y={chart.height - 56} textAnchor="middle" fill="#334155" fontSize="12" fontWeight="700">
                  {step.short}
                </text>
              </g>
            );
          })}

          {/* 受信電力のレンジ（楽観〜厳しめ）をヒゲで表示 */}
          <g>
            <line
              x1={totalCenterX}
              x2={totalCenterX}
              y1={y(result.receivedPowerRangeDbm.max)}
              y2={y(result.receivedPowerRangeDbm.min)}
              stroke="#0f172a"
              strokeWidth={2}
            />
            <line x1={totalCenterX - 9} x2={totalCenterX + 9} y1={y(result.receivedPowerRangeDbm.max)} y2={y(result.receivedPowerRangeDbm.max)} stroke="#0f172a" strokeWidth={2} />
            <line x1={totalCenterX - 9} x2={totalCenterX + 9} y1={y(result.receivedPowerRangeDbm.min)} y2={y(result.receivedPowerRangeDbm.min)} stroke="#0f172a" strokeWidth={2} />
          </g>

          {/* マージン寸法ブラケット（v4-6: 受信電力(標準)↔受信感度を図中で直接ラベリング） */}
          <g>
            <line x1={bracketX} x2={bracketX} y1={bracketTop} y2={bracketBottom} stroke={bracketColor} strokeWidth={1.5} />
            <line x1={bracketX - 4} x2={bracketX + 4} y1={bracketTop} y2={bracketTop} stroke={bracketColor} strokeWidth={1.5} />
            <line x1={bracketX - 4} x2={bracketX + 4} y1={bracketBottom} y2={bracketBottom} stroke={bracketColor} strokeWidth={1.5} />
            <text x={bracketX + 6} y={marginLabelY - 3} fill={bracketColor} fontSize={11} fontWeight={700}>
              マージン
            </text>
            <text
              x={bracketX + 6}
              y={marginLabelY + 11}
              fill={bracketColor}
              fontSize={11}
              fontWeight={700}
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {formatSigned(marginTypical, "dB")}
            </text>
          </g>

          <text x={chart.left} y={chart.top - 18} fill="#94a3b8" fontSize="12" fontWeight="700">
            dBm
          </text>
        </svg>
      </div>
      </DiagramExportButton>

      <div className="mt-4 grid gap-3 sm:grid-cols-[1.4fr_1fr]">
        <p className="text-sm leading-relaxed text-slate-600">
          受信電力（標準）<span className="font-bold text-slate-900">{formatDbm(result.receivedPowerRangeDbm.typical)}</span> が、受信感度{" "}
          <span className="font-bold text-slate-900">{formatDbm(sensitivity)}</span> より上にあるほど余裕があります。現在の標準リンクマージンは{" "}
          <span className={`font-bold ${marginPass ? "text-emerald-700" : "text-rose-700"}`}>{formatDb(marginTypical)}</span>{" "}
          （楽観 {formatSigned(result.linkMarginRangeDb.max, "dB")} / 厳しめ {formatSigned(result.linkMarginRangeDb.min, "dB")}）です。
        </p>
        <Callout tone="warning" size="sm">
          <p className="text-xs font-bold">読み方のコツ</p>
          <p className="mt-1 text-xs leading-relaxed">
            暖色のバー（地下の追加損失）の合計が大きいほど、受信電力が受信感度ラインを下回りやすくなります。いちばん長い「主因」バーから対策すると効率的です。
          </p>
        </Callout>
      </div>
    </Card>
  );
}
