import { formatDb, formatDbm, formatSigned } from "@/lib/rf/format";
import type { LinkBudgetInput, LinkBudgetResult } from "@/lib/rf/linkBudget";

type LinkBudgetWaterfallChartProps = {
  input: LinkBudgetInput;
  result: LinkBudgetResult;
  /** バーをクリックしたとき、対応する入力キーを通知する（入力へジャンプ用） */
  onStepSelect?: (key: keyof LinkBudgetInput) => void;
};

type WaterfallStep = {
  label: string;
  shortLabel: string;
  start: number;
  end: number;
  delta: number;
  kind: "source" | "gain" | "loss" | "total";
  note: string;
  /** このバーを動かす入力（クリックでジャンプ） */
  inputKey?: keyof LinkBudgetInput;
};

const chart = {
  width: 860,
  height: 380,
  top: 42,
  right: 42,
  bottom: 74,
  left: 58,
  barWidth: 54
};

export const stepStyles = {
  source: { fill: "#0071BD", stroke: "#005A95", text: "#005A95" },
  gain: { fill: "#10B981", stroke: "#047857", text: "#047857" },
  loss: { fill: "#FB7185", stroke: "#BE123C", text: "#BE123C" },
  total: { fill: "#334155", stroke: "#0F172A", text: "#0F172A" }
};

function buildSteps(input: LinkBudgetInput, result: LinkBudgetResult): WaterfallStep[] {
  const steps: WaterfallStep[] = [];
  let current = 0;

  const addStep = (
    label: string,
    shortLabel: string,
    delta: number,
    kind: WaterfallStep["kind"],
    note: string,
    inputKey?: keyof LinkBudgetInput
  ) => {
    const start = current;
    const end = current + delta;
    steps.push({ label, shortLabel, start, end, delta, kind, note, inputKey });
    current = end;
  };

  addStep("送信出力", "送信", input.txPowerDbm, "source", "送信機から出る電波の強さ", "txPowerDbm");
  addStep(
    "送信アンテナ利得",
    "Tx利得",
    input.txAntennaGainDbi,
    input.txAntennaGainDbi >= 0 ? "gain" : "loss",
    "送信側アンテナで足される要素",
    "txAntennaGainDbi"
  );
  addStep(
    "受信アンテナ利得",
    "Rx利得",
    input.rxAntennaGainDbi,
    input.rxAntennaGainDbi >= 0 ? "gain" : "loss",
    "受信側アンテナで足される要素",
    "rxAntennaGainDbi"
  );
  addStep("自由空間損失", "FSPL", -result.fsplDb, "loss", "距離と周波数で弱くなる量", "distance");
  addStep("ケーブル損失", "ケーブル", -input.cableLossDb, "loss", "ケーブルやコネクタで失われる量", "cableLossDb");
  addStep(
    "環境補正損失",
    "環境",
    -input.environmentLossDb,
    "loss",
    "筐体、壁、金属、設置環境で弱くなる目安",
    "environmentLossDb"
  );

  return [
    ...steps,
    {
      label: "推定受信電力",
      shortLabel: "受信電力",
      start: 0,
      end: result.receivedPowerDbm,
      delta: result.receivedPowerDbm,
      kind: "total",
      note: "受信機に届くと推定される電波の強さ"
    }
  ];
}

function roundedTick(value: number, direction: "up" | "down") {
  const rounded = direction === "up" ? Math.ceil(value / 10) * 10 : Math.floor(value / 10) * 10;
  return rounded;
}

export function LinkBudgetWaterfallChart({
  input,
  result,
  onStepSelect
}: LinkBudgetWaterfallChartProps) {
  const steps = buildSteps(input, result);
  const values = steps.flatMap((step) => [step.start, step.end]);
  const maxValue = roundedTick(Math.max(...values, input.receiverSensitivityDbm) + 10, "up");
  const minValue = roundedTick(Math.min(...values, input.receiverSensitivityDbm) - 10, "down");
  const plotWidth = chart.width - chart.left - chart.right;
  const plotHeight = chart.height - chart.top - chart.bottom;
  const stepGap = plotWidth / steps.length;
  const zeroY =
    chart.top + ((maxValue - 0) / Math.max(1, maxValue - minValue)) * plotHeight;

  const y = (value: number) =>
    chart.top + ((maxValue - value) / Math.max(1, maxValue - minValue)) * plotHeight;
  const x = (index: number) =>
    chart.left + index * stepGap + (stepGap - chart.barWidth) / 2;
  const ticks = Array.from(
    { length: Math.floor((maxValue - minValue) / 20) + 1 },
    (_, index) => maxValue - index * 20
  );
  const sensitivityY = y(input.receiverSensitivityDbm);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-staf">Waterfall Chart</p>
          <h3 className="mt-1 text-lg font-bold text-slate-950">リンクバジェット滝グラフ</h3>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">
            送信出力からスタートし、アンテナ利得で増え、距離・ケーブル・環境の損失で落ちていく流れをdBm軸で表示します。
            {onStepSelect ? "バーをクリックすると、その入力スライダーへジャンプします。" : null}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs font-semibold sm:grid-cols-4">
          <span className="rounded-full bg-staf-light px-3 py-1 text-staf">開始値</span>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">利得</span>
          <span className="rounded-full bg-rose-50 px-3 py-1 text-rose-700">損失</span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">結果</span>
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
        <svg
          role="img"
          aria-label="送信出力から推定受信電力までのリンクバジェット滝グラフ"
          viewBox={`0 0 ${chart.width} ${chart.height}`}
          className="h-auto w-full"
        >
          <rect width={chart.width} height={chart.height} fill="#F8FAFC" />
          {ticks.map((tick) => (
            <g key={tick}>
              <line
                x1={chart.left}
                x2={chart.width - chart.right}
                y1={y(tick)}
                y2={y(tick)}
                stroke="#E2E8F0"
              />
              <text
                x={chart.left - 12}
                y={y(tick) + 4}
                textAnchor="end"
                className="fill-slate-500 text-[11px]"
              >
                {tick}
              </text>
            </g>
          ))}
          <line
            x1={chart.left}
            x2={chart.width - chart.right}
            y1={zeroY}
            y2={zeroY}
            stroke="#94A3B8"
            strokeDasharray="4 4"
          />
          <line
            x1={chart.left}
            x2={chart.width - chart.right}
            y1={sensitivityY}
            y2={sensitivityY}
            stroke="#E11D48"
            strokeDasharray="7 5"
            strokeWidth={2}
          />
          <text
            x={chart.width - chart.right}
            y={sensitivityY - 8}
            textAnchor="end"
            className="fill-rose-700 text-[12px] font-semibold"
          >
            受信感度 {formatDbm(input.receiverSensitivityDbm)}
          </text>

          {steps.map((step, index) => {
            const startY = y(step.start);
            const endY = y(step.end);
            const top = Math.min(startY, endY);
            const height = Math.max(3, Math.abs(endY - startY));
            const style = stepStyles[step.kind];
            const centerX = x(index) + chart.barWidth / 2;
            const clickable = Boolean(onStepSelect && step.inputKey);
            const valueLabel =
              step.kind === "total"
                ? formatDbm(step.end)
                : formatSigned(step.delta, step.kind === "source" ? "dBm" : "dB");

            return (
              <g
                key={step.label}
                className={clickable ? "cursor-pointer" : undefined}
                role={clickable ? "button" : undefined}
                tabIndex={clickable ? 0 : undefined}
                aria-label={clickable ? `${step.label}の入力へ移動` : undefined}
                onClick={
                  clickable ? () => onStepSelect?.(step.inputKey as keyof LinkBudgetInput) : undefined
                }
                onKeyDown={
                  clickable
                    ? (event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          onStepSelect?.(step.inputKey as keyof LinkBudgetInput);
                        }
                      }
                    : undefined
                }
              >
                {index > 0 ? (
                  <line
                    x1={x(index - 1) + chart.barWidth}
                    x2={x(index)}
                    y1={y(steps[index - 1].end)}
                    y2={y(steps[index - 1].end)}
                    stroke="#94A3B8"
                    strokeDasharray="4 4"
                  />
                ) : null}
                <rect
                  x={x(index)}
                  y={top}
                  width={chart.barWidth}
                  height={height}
                  rx={8}
                  fill={style.fill}
                  stroke={style.stroke}
                  strokeWidth={1.5}
                />
                <text
                  x={centerX}
                  y={step.delta >= 0 || step.kind === "total" ? top - 8 : top + height + 16}
                  textAnchor="middle"
                  className="fill-slate-900 text-[12px] font-bold"
                >
                  {valueLabel}
                </text>
                <text
                  x={centerX}
                  y={chart.height - 36}
                  textAnchor="middle"
                  className="fill-slate-700 text-[12px] font-semibold"
                >
                  {step.shortLabel}
                </text>
              </g>
            );
          })}
          <text
            x={chart.left}
            y={chart.top - 16}
            className="fill-slate-500 text-[12px] font-semibold"
          >
            dBm
          </text>
        </svg>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-slate-600">
        最後の推定受信電力 {formatDbm(result.receivedPowerDbm)} が、受信感度{" "}
        {formatDbm(input.receiverSensitivityDbm)} より上にあるほど通信の余裕が大きくなります。現在のリンクマージンは{" "}
        {formatDb(result.linkMarginDb)} です。
      </p>
    </section>
  );
}
