import { AlertTriangle, Ruler, Settings2 } from "lucide-react";
import { Callout } from "@/components/Callout";
import { Card } from "@/components/Card";
import { DiagramDefs } from "@/components/diagrams/DiagramDefs";
import {
  getLinkTypeLabel,
  getPropagationAreaOption,
  getPropagationModelOption
} from "@/data/linkBudgetOptions";
import { formatDb, formatDbm, formatSigned } from "@/lib/rf/format";
import { normalizeDistanceKm, type LinkBudgetInput, type LinkBudgetResult } from "@/lib/rf/linkBudget";
import { DIAGRAM_DEF_IDS, diagramPalette, diagramRef, diagramStroke } from "@/lib/ui/diagramTheme";

type LinkAssumptionDiagramProps = {
  input: LinkBudgetInput;
  result: LinkBudgetResult;
};

const drawing = {
  width: 980,
  height: 430,
  groundY: 318,
  txX: 126,
  rxX: 854
};

function formatDistance(input: LinkBudgetInput): string {
  const distanceKm = normalizeDistanceKm(input.distance, input.distanceUnit);
  if (distanceKm >= 1) {
    return `${distanceKm.toFixed(2)} km`;
  }

  return `${(distanceKm * 1000).toFixed(0)} m`;
}

function visualHeight(heightM: number, maxHeightM: number): number {
  const normalized = Math.sqrt(Math.max(0, heightM) / Math.max(1, maxHeightM));
  return 64 + normalized * 188;
}

function modelAssumption(input: LinkBudgetInput): string {
  switch (input.propagationModel) {
    case "free_space":
      return "反射・遮蔽を含まない見通し基準として計算します。低高度端末では地面反射や筐体の影響を別途損失へ入れます。";
    case "two_ray":
      return "直接波と地面反射波の2経路を単純化して扱います。地面状態や近距離側の深いフェージングは実測確認が必要です。";
    case "log_distance":
      return `距離損失指数 n=${input.pathLossExponent.toFixed(1)} で環境の距離減衰を近似します。nは現地RSSI/RSRPで調整してください。`;
    case "measured_correction":
      return `自由空間損失を基準に、現地との差分 ${formatSigned(input.calibrationOffsetDb, "dB")} をまとめて反映します。原因別損失との重複に注意します。`;
    case "iot_hata_calibrated":
      return `Hata系モデルを基準線に、実測アンカー距離 ${input.iotCalibrationDistance} ${input.iotCalibrationDistanceUnit} のRSSI/RSRPで校正します。通常の実測補正値との二重計上に注意します。`;
    case "okumura_hata":
      return "高所基地局と移動局の広域平均損失を参考値として計算します。低高度端末や短距離では適用範囲警告を確認します。";
    case "cost231_hata":
      return "Hata系の1.5〜2GHz帯拡張モデルとして参考値を計算します。低高度端末同士や屋内・筐体条件は別途損失で扱います。";
  }
}

function buildParameterRows(input: LinkBudgetInput, result: LinkBudgetResult) {
  const area = getPropagationAreaOption(input.propagationArea);

  return [
    ["通信形態", getLinkTypeLabel(input.linkType)],
    ["伝搬モデル", result.propagationModelLabel],
    ["周波数", `${input.frequencyMHz.toFixed(0)} MHz`],
    ["2D距離", formatDistance(input)],
    ["送信側アンテナ高", `${input.txAntennaHeightM.toFixed(1)} m`],
    ["受信側アンテナ高", `${input.rxAntennaHeightM.toFixed(1)} m`],
    ["送信/受信アンテナ利得", `${formatSigned(input.txAntennaGainDbi, "dBi")} / ${formatSigned(input.rxAntennaGainDbi, "dBi")}`],
    ["伝搬損失", formatDb(result.pathLossDb)],
    ["環境損失", formatDb(input.environmentLossDb)],
    ["端末近傍損失", formatDb(result.nearTerminalLossDb)],
    ["実測補正値", formatSigned(input.calibrationOffsetDb, "dB")],
    ["受信感度", formatDbm(input.receiverSensitivityDbm)],
    ...(input.propagationModel === "log_distance"
      ? ([["距離損失指数", `n=${input.pathLossExponent.toFixed(1)}`]] as Array<[string, string]>)
      : []),
    ...(input.propagationModel === "okumura_hata" ||
    input.propagationModel === "cost231_hata" ||
    input.propagationModel === "iot_hata_calibrated"
      ? ([["Hataエリア種別", area.label]] as Array<[string, string]>)
      : []),
    ...(input.propagationModel === "iot_hata_calibrated"
      ? ([
          ["実測アンカー", `${input.iotCalibrationDistance} ${input.iotCalibrationDistanceUnit}`],
          ["実測受信電力", formatDbm(input.iotMeasuredReceivedPowerDbm)],
          ["距離勾配補正", `${input.iotSlopeCorrectionDbPerDecade.toFixed(1)} dB/decade`]
        ] as Array<[string, string]>)
      : [])
  ];
}

function buildCautionItems(input: LinkBudgetInput, result: LinkBudgetResult) {
  const items = [
    "この図は2D断面の概念図です。建物配置、地形起伏、屋内侵入、時間変動するマルチパスは個別には再現しません。",
    "伝搬損失は選択モデルの中央値または基準値です。環境損失、端末近傍損失、実測補正値で現地差分を補います。"
  ];

  if (input.propagationModel === "free_space") {
    items.push("自由空間損失は見通し条件の下限寄りです。低高度端末では実際より良く見えることがあります。");
  }

  if (input.propagationModel === "two_ray") {
    items.push("2波モデルは反射面を単純化します。地面材質、凹凸、周辺金属、近距離の深い落ち込みは実測で確認してください。");
  }

  if (input.propagationModel === "log_distance") {
    items.push("Log-distanceの距離損失指数は現地固有です。複数距離のRSSI/RSRPでnと補正値を合わせると精度が上がります。");
  }

  if (
    input.propagationModel === "okumura_hata" ||
    input.propagationModel === "cost231_hata" ||
    input.propagationModel === "iot_hata_calibrated"
  ) {
    items.push("Hata系では送信側アンテナ高をhb、受信側アンテナ高をhmとして使います。適用範囲外では参考値として扱います。");
  }

  if (input.propagationModel === "iot_hata_calibrated") {
    items.push("IoT実測補正Hataではアンカー点の差分を既に校正します。同じ差分を実測補正値にも入れないよう確認してください。");
  }

  if (input.calibrationOffsetDb !== 0) {
    items.push("実測補正値は原因別に入力した損失の残差だけを入れる欄です。筐体損失や遮蔽損失との二重計上に注意します。");
  }

  return [...items, ...result.warnings.slice(0, 2).map((warning) => warning.message)];
}

export function LinkAssumptionDiagram({ input, result }: LinkAssumptionDiagramProps) {
  const model = getPropagationModelOption(input.propagationModel);
  const maxHeightM = Math.max(input.txAntennaHeightM, input.rxAntennaHeightM, 2);
  const txHeightPx = visualHeight(input.txAntennaHeightM, maxHeightM);
  const rxHeightPx = visualHeight(input.rxAntennaHeightM, maxHeightM);
  const txAntennaY = drawing.groundY - txHeightPx;
  const rxAntennaY = drawing.groundY - rxHeightPx;
  const midX = (drawing.txX + drawing.rxX) / 2;
  const reflectionY = drawing.groundY - 5;
  const fresnelCy = (txAntennaY + rxAntennaY) / 2;
  const fresnelRx = Math.max(170, Math.abs(drawing.rxX - drawing.txX) / 2 - 50);
  const fresnelRy = input.propagationModel === "two_ray" ? 54 : 38;
  const parameterRows = buildParameterRows(input, result);
  const cautionItems = buildCautionItems(input, result);
  const showReflection =
    input.propagationModel === "two_ray" ||
    result.communicationMode === "low_height_terminal_to_terminal" ||
    result.communicationMode === "gateway_to_low_height_terminal";

  return (
    <Card as="section" padding="lg">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-staf-dark">設定前提の2D図</p>
          <h3 className="mt-1 text-base font-bold text-slate-950">計算・シミュレーション前提と指定パラメータ</h3>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">
            現在の入力を、送信側・受信側・地面・見通し線・反射経路の2D断面として整理します。
            図は計算の前提を説明するための模式図で、実際の地形や建物を再現するものではありません。
          </p>
        </div>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700">
          {model.label}
        </span>
      </div>

      <div className="mt-4 grid gap-5">
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
          <svg
            role="img"
            aria-label="リンク計算の2D前提図"
            viewBox={`0 0 ${drawing.width} ${drawing.height}`}
            className="h-auto w-full"
          >
            <DiagramDefs />

            <rect width={drawing.width} height={drawing.height} fill={diagramRef(DIAGRAM_DEF_IDS.gradientSky)} />
            <rect x="0" y={drawing.groundY} width={drawing.width} height={drawing.height - drawing.groundY} fill={diagramRef(DIAGRAM_DEF_IDS.gradientSoil)} />
            <rect x="0" y={drawing.groundY} width={drawing.width} height={drawing.height - drawing.groundY} fill={diagramRef(DIAGRAM_DEF_IDS.hatchGround)} opacity="0.25" />
            <line x1="70" x2="910" y1={drawing.groundY} y2={drawing.groundY} stroke={diagramPalette.muted} strokeWidth={diagramStroke.emphasis} />

            <ellipse
              cx={midX}
              cy={fresnelCy}
              rx={fresnelRx}
              ry={fresnelRy}
              fill={diagramPalette.skyFill}
              opacity="0.22"
              stroke={diagramPalette.skyStroke}
              strokeDasharray="7 6"
            />
            <text x={midX} y={fresnelCy - fresnelRy - 14} textAnchor="middle" className="fill-sky-700 text-[18px] font-bold">
              見通し・フレネルゾーンの概念
            </text>

            <line
              x1={drawing.txX}
              x2={drawing.rxX}
              y1={txAntennaY}
              y2={rxAntennaY}
              stroke={diagramPalette.ink}
              strokeWidth="5"
            />
            <text x={midX} y={(txAntennaY + rxAntennaY) / 2 - 20} textAnchor="middle" className="fill-slate-900 text-[20px] font-bold">
              2D距離 {formatDistance(input)}
            </text>

            <path
              d={`M ${drawing.txX} ${txAntennaY} Q ${midX} ${reflectionY} ${drawing.rxX} ${rxAntennaY}`}
              fill="none"
              stroke={showReflection ? diagramPalette.warn : diagramPalette.faint}
              strokeWidth={showReflection ? 5 : 3}
              strokeDasharray={showReflection ? "0" : "8 6"}
              opacity={showReflection ? 0.9 : 0.55}
            />
            <text x={midX} y={reflectionY - 20} textAnchor="middle" className={showReflection ? "fill-orange-700 text-[18px] font-bold" : "fill-slate-500 text-[18px] font-semibold"}>
              地面反射・低高度影響
            </text>

            <g filter={diagramRef(DIAGRAM_DEF_IDS.softShadow)}>
              <line x1={drawing.txX} x2={drawing.txX} y1={drawing.groundY} y2={txAntennaY} stroke={diagramPalette.staf} strokeWidth="11" strokeLinecap="round" />
              <circle cx={drawing.txX} cy={txAntennaY} r="16" fill={diagramPalette.staf} stroke={diagramPalette.white} strokeWidth="4" />
            </g>
            <g filter={diagramRef(DIAGRAM_DEF_IDS.softShadow)}>
              <line x1={drawing.rxX} x2={drawing.rxX} y1={drawing.groundY} y2={rxAntennaY} stroke={diagramPalette.success} strokeWidth="11" strokeLinecap="round" />
              <circle cx={drawing.rxX} cy={rxAntennaY} r="16" fill={diagramPalette.success} stroke={diagramPalette.white} strokeWidth="4" />
            </g>

            <rect x={drawing.txX - 72} y={drawing.groundY + 16} width="144" height="42" rx="8" fill={diagramPalette.white} stroke={diagramPalette.line} />
            <text x={drawing.txX} y={drawing.groundY + 43} textAnchor="middle" className="fill-slate-800 text-[18px] font-bold">
              送信側
            </text>
            <rect x={drawing.rxX - 72} y={drawing.groundY + 16} width="144" height="42" rx="8" fill={diagramPalette.white} stroke={diagramPalette.line} />
            <text x={drawing.rxX} y={drawing.groundY + 43} textAnchor="middle" className="fill-slate-800 text-[18px] font-bold">
              受信側
            </text>

            <line x1={drawing.txX + 18} x2={drawing.txX + 18} y1={drawing.groundY} y2={txAntennaY} stroke={diagramPalette.staf} strokeDasharray="5 5" />
            <text x={drawing.txX + 34} y={(drawing.groundY + txAntennaY) / 2} className="fill-staf text-[18px] font-bold">
              Tx高 {input.txAntennaHeightM.toFixed(1)}m
            </text>
            <line x1={drawing.rxX - 18} x2={drawing.rxX - 18} y1={drawing.groundY} y2={rxAntennaY} stroke={diagramPalette.successDeep} strokeDasharray="5 5" />
            <text x={drawing.rxX - 34} y={(drawing.groundY + rxAntennaY) / 2} textAnchor="end" className="fill-emerald-700 text-[18px] font-bold">
              Rx高 {input.rxAntennaHeightM.toFixed(1)}m
            </text>

            <g>
              <rect x="282" y="18" width="416" height="72" rx="12" fill={diagramPalette.white} stroke={diagramPalette.line} />
              <text x="490" y="47" textAnchor="middle" className="fill-slate-950 text-[18px] font-bold">
                {input.frequencyMHz.toFixed(0)} MHz / {result.propagationModelLabel}
              </text>
              <text x="490" y="72" textAnchor="middle" className="fill-slate-600 text-[16px] font-semibold">
                伝搬損失 {formatDb(result.pathLossDb)} ・ 受信電力 {formatDbm(result.receivedPowerDbm)}
              </text>
            </g>
          </svg>
        </div>

        <section>
          <div className="flex items-center gap-2">
            <Settings2 aria-hidden="true" className="h-4 w-4 text-staf-dark" />
            <h4 className="text-sm font-bold text-slate-950">指定パラメータ</h4>
          </div>
          <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-2 2xl:grid-cols-3">
            {parameterRows.map(([label, value]) => (
              <div key={label} className="rounded-md border border-slate-200 bg-white p-4">
                <dt className="font-semibold text-slate-500">{label}</dt>
                <dd className="mt-1 font-bold text-slate-900">{value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <Callout
          tone="info"
          size="md"
          icon={<Ruler aria-hidden="true" className="h-5 w-5" />}
          title="モデル前提"
        >
          <p className="leading-relaxed">{modelAssumption(input)}</p>
        </Callout>
      </div>

      <Callout
        tone="caution"
        size="md"
        className="mt-4"
        icon={<AlertTriangle aria-hidden="true" className="h-5 w-5" />}
        title="この図と計算を見るときの注意点"
      >
        <ul className="grid gap-2 text-xs leading-relaxed md:grid-cols-2">
          {cautionItems.map((item) => (
            <li key={item} className="rounded-md bg-white/65 p-4">
              {item}
            </li>
          ))}
        </ul>
      </Callout>
    </Card>
  );
}
