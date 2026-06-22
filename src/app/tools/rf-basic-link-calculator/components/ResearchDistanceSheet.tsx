"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, BookOpen, Calculator, RefreshCw, Route, ShieldCheck } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis
} from "recharts";
import {
  calculateNearTerminalLossDb,
  normalizeDistanceKm,
  type LinkBudgetInput
} from "@/lib/rf/linkBudget";
import {
  calculateResearchDistance,
  defaultResearchDistanceInput,
  formatResearchDistance,
  generateResearchDistanceCurveData,
  type ReliabilityPercent,
  type ResearchDistanceInput,
  type ResearchDistanceModel
} from "@/lib/rf/researchDistance";

type ResearchDistanceSheetProps = {
  baseInput: LinkBudgetInput;
};

type NumericResearchKey = {
  [K in keyof ResearchDistanceInput]: ResearchDistanceInput[K] extends number ? K : never;
}[keyof ResearchDistanceInput];

type NumberFieldProps = {
  id: NumericResearchKey;
  label: string;
  unit: string;
  description: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
};

const modelOptions: Array<{
  value: ResearchDistanceModel;
  label: string;
  description: string;
}> = [
  {
    value: "ci",
    label: "CIモデル（1m基準 + 距離損失指数）",
    description:
      "1mの自由空間損失を基準に、距離損失指数nとシャドウフェージングσで現地環境を近似します。実測フィットに向いた汎用モデルです。"
  },
  {
    value: "dual_slope",
    label: "Dual-slope CIモデル",
    description:
      "近距離と遠距離で減衰勾配を切り替えます。道路沿い、地面反射、見通しが途中で崩れる環境の一次評価に使います。"
  },
  {
    value: "sui_terrain_a",
    label: "IEEE 802.16 SUI Terrain A",
    description:
      "丘陵・樹木密度が高い郊外や厳しい地形を想定する固定無線アクセス系モデルです。基地局距離設計の保守的な比較に使えます。"
  },
  {
    value: "sui_terrain_b",
    label: "IEEE 802.16 SUI Terrain B",
    description:
      "中間的な郊外地形を想定するSUIモデルです。Terrain AとCの間の距離感を比較できます。"
  },
  {
    value: "sui_terrain_c",
    label: "IEEE 802.16 SUI Terrain C",
    description:
      "平坦で開けた地形を想定するSUIモデルです。固定無線・広めのセル設計の楽観側比較に使います。"
  },
  {
    value: "cost231_wi_nlos",
    label: "COST231 Walfisch-Ikegami NLOS",
    description:
      "都市街路で、屋根越し回折、街路幅、建物間隔、道路角度を使ってNLOS損失を見積もるモデルです。街中の基地局設計らしい比較に向きます。"
  },
  {
    value: "tr38901_umi_los",
    label: "3GPP TR 38.901 UMi LOS",
    description:
      "基地局高10m級の都市マイクロセルで、見通しがある条件の標準評価モデルです。"
  },
  {
    value: "tr38901_umi_nlos",
    label: "3GPP TR 38.901 UMi NLOS",
    description:
      "基地局高10m級の都市マイクロセルで、建物角や遮蔽を含む非見通し条件の標準評価モデルです。"
  },
  {
    value: "tr38901_uma_los",
    label: "3GPP TR 38.901 UMa LOS",
    description:
      "基地局高25m級の都市マクロセルで、見通しがある条件の標準評価モデルです。"
  },
  {
    value: "tr38901_uma_nlos",
    label: "3GPP TR 38.901 UMa NLOS",
    description:
      "基地局高25m級の都市マクロセルで、非見通し条件を含める標準評価モデルです。"
  }
];

const reliabilityOptions: ReliabilityPercent[] = [50, 80, 90, 95, 99];

function buildResearchInputFromLinkBudget(input: LinkBudgetInput): ResearchDistanceInput {
  const distanceKm = normalizeDistanceKm(input.distance, input.distanceUnit);
  const copiedModel: ResearchDistanceModel =
    input.propagationModel === "two_ray"
      ? "dual_slope"
      : input.propagationModel === "okumura_hata" || input.propagationModel === "cost231_hata"
        ? "tr38901_uma_nlos"
        : "ci";

  return {
    ...defaultResearchDistanceInput,
    model: copiedModel,
    frequencyGHz: Number((input.frequencyMHz / 1000).toFixed(4)),
    txPowerDbm: input.txPowerDbm,
    txAntennaGainDbi: input.txAntennaGainDbi,
    rxAntennaGainDbi: input.rxAntennaGainDbi,
    txAntennaHeightM: input.txAntennaHeightM,
    rxAntennaHeightM: input.rxAntennaHeightM,
    receiverSensitivityDbm: input.receiverSensitivityDbm,
    cableLossDb: input.cableLossDb,
    clutterLossDb: input.environmentLossDb,
    nearTerminalLossDb: calculateNearTerminalLossDb(input),
    calibrationOffsetDb: input.calibrationOffsetDb,
    pathLossExponent: input.pathLossExponent,
    maxDistanceKm: Math.max(5, Number((distanceKm * 5).toFixed(1)))
  };
}

function NumberField({
  id,
  label,
  unit,
  description,
  min,
  max,
  step,
  value,
  onChange
}: NumberFieldProps) {
  const inputValue = Number.isFinite(value) ? value : 0;
  const sliderValue = Math.min(max, Math.max(min, inputValue));

  return (
    <label htmlFor={`research-${id}`} className="block rounded-lg border border-slate-200 bg-white p-4">
      <span className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-slate-950">{label}</span>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
          {unit}
        </span>
      </span>
      <span className="mt-1 block text-xs leading-relaxed text-slate-500">{description}</span>
      <span className="mt-3 grid gap-3 sm:grid-cols-[1fr_110px]">
        <input
          id={`research-${id}`}
          type="number"
          min={min}
          max={max}
          step={step}
          value={inputValue}
          className="h-10 rounded-md border border-slate-300 px-3 text-sm font-semibold text-slate-950 shadow-sm focus:border-staf focus:outline-none focus:ring-2 focus:ring-staf/20"
          onChange={(event) => onChange(event.target.value === "" ? 0 : Number(event.target.value))}
        />
        <span className="flex h-10 items-center justify-center rounded-md bg-slate-50 text-sm font-semibold text-slate-700">
          {unit}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={sliderValue}
        className="mt-3 w-full"
        onChange={(event) => onChange(Number(event.target.value))}
        aria-label={`${label}のスライダー`}
      />
    </label>
  );
}

function MetricCard({ label, value, description }: { label: string; value: string; description: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-950">{value}</p>
      <p className="mt-2 text-xs leading-relaxed text-slate-500">{description}</p>
    </div>
  );
}

function CalculationFlow({ input, result }: { input: ResearchDistanceInput; result: ReturnType<typeof calculateResearchDistance> }) {
  const steps = [
    {
      label: "送信余力＋実測補正",
      value: `${(
        input.txPowerDbm +
        input.txAntennaGainDbi +
        input.rxAntennaGainDbi -
        input.receiverSensitivityDbm +
        input.calibrationOffsetDb
      ).toFixed(1)}dB`,
      tone: "bg-sky-50 border-sky-200 text-sky-950"
    },
    {
      label: "追加損失",
      value: `-${result.extraLossDb.toFixed(1)}dB`,
      tone: "bg-amber-50 border-amber-200 text-amber-950"
    },
    {
      label: "信頼率マージン",
      value: `-${result.reliabilityMarginDb.toFixed(1)}dB`,
      tone: "bg-rose-50 border-rose-200 text-rose-950"
    },
    {
      label: "許容中央値損失",
      value: `${result.allowedMedianPathLossDb.toFixed(1)}dB`,
      tone: "bg-emerald-50 border-emerald-200 text-emerald-950"
    },
    {
      label: "最大距離",
      value: formatResearchDistance(result.maximumDistanceM),
      tone: "bg-slate-50 border-slate-200 text-slate-950"
    }
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-5">
      {steps.map((step, index) => (
        <div key={step.label} className={`rounded-lg border p-3 ${step.tone}`}>
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold">{step.label}</p>
            {index < steps.length - 1 ? <span className="text-xs font-bold">→</span> : null}
          </div>
          <p className="mt-2 text-lg font-bold">{step.value}</p>
        </div>
      ))}
    </div>
  );
}

function DistanceCurve({ input, result }: { input: ResearchDistanceInput; result: ReturnType<typeof calculateResearchDistance> }) {
  const [isMounted, setIsMounted] = useState(false);
  const data = useMemo(() => generateResearchDistanceCurveData(input, result), [input, result]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-950">距離別リンク余裕</h3>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">
            0dBラインを下回る距離から、指定した信頼率では成立しにくくなります。
          </p>
        </div>
        <span className="rounded-full bg-staf-light px-3 py-1 text-xs font-semibold text-staf-dark">
          目標信頼率 {input.reliabilityPercent}%
        </span>
      </div>

      <div className="mt-5 h-72 w-full" aria-label="距離別リンク余裕のグラフ">
        {isMounted ? (
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={288}>
            <LineChart data={data} margin={{ left: 8, right: 18, top: 12, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="distanceLabel" tick={{ fontSize: 12, fill: "#64748B" }} interval="preserveStartEnd" />
              <YAxis unit="dB" tick={{ fontSize: 12, fill: "#64748B" }} domain={["dataMin - 6", "dataMax + 6"]} />
              <RechartsTooltip
                formatter={(value, name) => [
                  `${value} ${name === "pathLossDb" ? "dB" : "dB"}`,
                  name === "pathLossDb" ? "伝搬損失" : "リンク余裕"
                ]}
                labelFormatter={(label) => `距離 ${label}`}
              />
              <ReferenceLine
                y={0}
                stroke="#E11D48"
                strokeDasharray="5 5"
                label={{ value: "成立境界", position: "insideTopRight", fill: "#BE123C", fontSize: 12 }}
              />
              <Line
                type="monotone"
                dataKey="linkMarginDb"
                stroke="#0071BD"
                strokeWidth={3}
                dot={{ r: 4, fill: "#FFFFFF", stroke: "#0071BD", strokeWidth: 2 }}
                name="リンク余裕"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center rounded-lg bg-slate-50 text-sm text-slate-500">
            グラフを読み込み中
          </div>
        )}
      </div>
    </section>
  );
}

export function ResearchDistanceSheet({ baseInput }: ResearchDistanceSheetProps) {
  const [input, setInput] = useState<ResearchDistanceInput>(() => buildResearchInputFromLinkBudget(baseInput));
  const result = useMemo(() => calculateResearchDistance(input), [input]);
  const selectedModel = modelOptions.find((option) => option.value === input.model) ?? modelOptions[0];

  const update = <K extends keyof ResearchDistanceInput>(key: K, value: ResearchDistanceInput[K]) => {
    setInput((current) => ({ ...current, [key]: value }));
  };

  const copyMainConditions = () => {
    setInput(buildResearchInputFromLinkBudget(baseInput));
  };

  return (
    <section className="space-y-5">
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold text-staf-dark">
              <BookOpen className="h-4 w-4" aria-hidden="true" />
              研究・標準ベースの距離逆算
            </p>
            <h2 className="mt-2 text-xl font-bold text-slate-950">
              目標信頼率を満たす最大通信距離を別シートで計算します
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">
              3GPP TR 38.901、CI/Dual-slope、IEEE 802.16 SUI、COST231 Walfisch-Ikegamiを比較し、平均伝搬損失だけでなくシャドウフェージング、クラッタ、端末近傍損失、実測補正を含めて距離を逆算します。
            </p>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-md border border-staf/30 bg-staf-light px-3 py-2 text-sm font-semibold text-staf-dark transition hover:bg-staf/10 focus:outline-none focus:ring-2 focus:ring-staf/25"
            onClick={copyMainConditions}
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            現在のリンク条件を反映
          </button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
        <div className="space-y-5">
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-staf-dark" aria-hidden="true" />
              <h3 className="text-base font-bold text-slate-950">モデルと信頼率</h3>
            </div>

            <div className="mt-4 grid gap-4">
              <label htmlFor="research-model" className="block rounded-lg border border-slate-200 bg-white p-4">
                <span className="text-sm font-semibold text-slate-950">距離計算モデル</span>
                <select
                  id="research-model"
                  value={input.model}
                  className="mt-3 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-950 focus:border-staf focus:outline-none focus:ring-2 focus:ring-staf/20"
                  onChange={(event) => update("model", event.target.value as ResearchDistanceModel)}
                >
                  {modelOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <span className="mt-2 block text-xs leading-relaxed text-slate-600">
                  {selectedModel.description}
                </span>
              </label>

              <label htmlFor="research-reliability" className="block rounded-lg border border-slate-200 bg-white p-4">
                <span className="flex items-center gap-2 text-sm font-semibold text-slate-950">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                  目標信頼率
                </span>
                <select
                  id="research-reliability"
                  value={input.reliabilityPercent}
                  className="mt-3 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-950 focus:border-staf focus:outline-none focus:ring-2 focus:ring-staf/20"
                  onChange={(event) =>
                    update("reliabilityPercent", Number(event.target.value) as ReliabilityPercent)
                  }
                >
                  {reliabilityOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}%の場所で成立させる
                    </option>
                  ))}
                </select>
                <span className="mt-2 block text-xs leading-relaxed text-slate-600">
                  信頼率を上げるほど、シャドウフェージング分の余裕を多く取り、最大距離は短くなります。
                </span>
              </label>

              <NumberField
                id="frequencyGHz"
                label="周波数"
                unit="GHz"
                description="3GPP TR 38.901系モデルではGHz単位で扱います。920MHzは0.92GHzです。"
                min={0.1}
                max={100}
                step={0.01}
                value={input.frequencyGHz}
                onChange={(value) => update("frequencyGHz", value)}
              />
              <NumberField
                id="shadowFadingStdDb"
                label="シャドウフェージング標準偏差 σ"
                unit="dB"
                description="建物、車両、人体、植栽、設置方向などによる場所ばらつきです。屋外では6〜10dB程度を初期目安にします。"
                min={0}
                max={16}
                step={0.5}
                value={input.shadowFadingStdDb}
                onChange={(value) => update("shadowFadingStdDb", value)}
              />
              <NumberField
                id="fadeMarginDb"
                label="追加フェード余裕"
                unit="dB"
                description="雨、人体通過、一時遮蔽、実装ばらつきなど、標準偏差とは別に残す安全余裕です。"
                min={0}
                max={30}
                step={0.5}
                value={input.fadeMarginDb}
                onChange={(value) => update("fadeMarginDb", value)}
              />
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-base font-bold text-slate-950">送受信条件と追加損失</h3>
            <div className="mt-4 grid gap-4">
              <NumberField
                id="txPowerDbm"
                label="送信電力"
                unit="dBm"
                description="無線機の出力です。法規制上の上限や実機設定値を入れてください。"
                min={-30}
                max={60}
                step={0.5}
                value={input.txPowerDbm}
                onChange={(value) => update("txPowerDbm", value)}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <NumberField
                  id="txAntennaGainDbi"
                  label="送信アンテナ利得"
                  unit="dBi"
                  description="送信側アンテナの利得です。"
                  min={-20}
                  max={30}
                  step={0.5}
                  value={input.txAntennaGainDbi}
                  onChange={(value) => update("txAntennaGainDbi", value)}
                />
                <NumberField
                  id="rxAntennaGainDbi"
                  label="受信アンテナ利得"
                  unit="dBi"
                  description="受信側アンテナの利得です。"
                  min={-20}
                  max={30}
                  step={0.5}
                  value={input.rxAntennaGainDbi}
                  onChange={(value) => update("rxAntennaGainDbi", value)}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <NumberField
                  id="txAntennaHeightM"
                  label="送信側アンテナ高"
                  unit="m"
                  description="3GPP UMiは10m級、UMaは25m級が標準想定です。"
                  min={0.1}
                  max={200}
                  step={0.1}
                  value={input.txAntennaHeightM}
                  onChange={(value) => update("txAntennaHeightM", value)}
                />
                <NumberField
                  id="rxAntennaHeightM"
                  label="受信側アンテナ高"
                  unit="m"
                  description="地上近傍IoT端末では、端末近傍損失と実測補正を重視します。"
                  min={0.1}
                  max={30}
                  step={0.1}
                  value={input.rxAntennaHeightM}
                  onChange={(value) => update("rxAntennaHeightM", value)}
                />
              </div>
              <NumberField
                id="receiverSensitivityDbm"
                label="受信感度"
                unit="dBm"
                description="データレート、帯域幅、変調方式で変わります。"
                min={-150}
                max={-20}
                step={0.5}
                value={input.receiverSensitivityDbm}
                onChange={(value) => update("receiverSensitivityDbm", value)}
              />
              <div className="grid gap-4 sm:grid-cols-3">
                <NumberField
                  id="cableLossDb"
                  label="ケーブル損失"
                  unit="dB"
                  description="ケーブル、コネクタ、分配器の損失です。"
                  min={0}
                  max={30}
                  step={0.1}
                  value={input.cableLossDb}
                  onChange={(value) => update("cableLossDb", value)}
                />
                <NumberField
                  id="clutterLossDb"
                  label="クラッタ・環境損失"
                  unit="dB"
                  description="建物、樹木、車両、屋内侵入、回折などをまとめた追加損失です。"
                  min={0}
                  max={80}
                  step={0.5}
                  value={input.clutterLossDb}
                  onChange={(value) => update("clutterLossDb", value)}
                />
                <NumberField
                  id="nearTerminalLossDb"
                  label="端末近傍損失"
                  unit="dB"
                  description="筐体、人体、地面近接、偏波、設置方向など端末直近の損失です。"
                  min={0}
                  max={60}
                  step={0.5}
                  value={input.nearTerminalLossDb}
                  onChange={(value) => update("nearTerminalLossDb", value)}
                />
              </div>
              <NumberField
                id="calibrationOffsetDb"
                label="実測補正値"
                unit="dB"
                description="現地RSSI/RSRPと計算値の差分です。実測が悪い場合はマイナス、良い場合はプラスにします。"
                min={-60}
                max={60}
                step={0.5}
                value={input.calibrationOffsetDb}
                onChange={(value) => update("calibrationOffsetDb", value)}
              />
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-base font-bold text-slate-950">CI / Dual-slope用パラメータ</h3>
            <div className="mt-4 grid gap-4">
              <NumberField
                id="pathLossExponent"
                label="CI距離損失指数 n"
                unit="n"
                description="自由空間に近いと2前後、遮蔽や低高度では3以上になることがあります。"
                min={1}
                max={6}
                step={0.1}
                value={input.pathLossExponent}
                onChange={(value) => update("pathLossExponent", value)}
              />
              <div className="grid gap-4 sm:grid-cols-3">
                <NumberField
                  id="nearPathLossExponent"
                  label="近距離指数"
                  unit="n1"
                  description="Dual-slopeのブレークポイント手前の指数です。"
                  min={1}
                  max={6}
                  step={0.1}
                  value={input.nearPathLossExponent}
                  onChange={(value) => update("nearPathLossExponent", value)}
                />
                <NumberField
                  id="farPathLossExponent"
                  label="遠距離指数"
                  unit="n2"
                  description="Dual-slopeのブレークポイント以遠の指数です。"
                  min={1}
                  max={8}
                  step={0.1}
                  value={input.farPathLossExponent}
                  onChange={(value) => update("farPathLossExponent", value)}
                />
                <NumberField
                  id="breakpointM"
                  label="ブレークポイント"
                  unit="m"
                  description="減衰勾配が変わる距離です。道路幅やアンテナ高で変わります。"
                  min={1}
                  max={5000}
                  step={1}
                  value={input.breakpointM}
                  onChange={(value) => update("breakpointM", value)}
                />
              </div>
              <NumberField
                id="maxDistanceKm"
                label="探索上限距離"
                unit="km"
                description="最大距離を探す上限です。結果が上限に張り付く場合は広げてください。"
                min={0.1}
                max={200}
                step={0.1}
                value={input.maxDistanceKm}
                onChange={(value) => update("maxDistanceKm", value)}
              />
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-base font-bold text-slate-950">基地局・街路設計用パラメータ</h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">
              COST231 Walfisch-Ikegamiで使う都市街路の平均条件です。実際のキャリア設計では、地図・建物高・道路幅・クラッタをGISやレイトレースに渡しますが、このシートでは簡易入力で比較します。
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <NumberField
                id="averageBuildingHeightM"
                label="平均建物高"
                unit="m"
                description="街路周辺の平均的な屋根高です。基地局が屋根上か屋根下かで回折損失が変わります。"
                min={1}
                max={100}
                step={0.5}
                value={input.averageBuildingHeightM}
                onChange={(value) => update("averageBuildingHeightM", value)}
              />
              <NumberField
                id="streetWidthM"
                label="街路幅"
                unit="m"
                description="道路や開口部の幅です。狭い街路ほど屋根から道路への回折損失が大きく出ます。"
                min={1}
                max={100}
                step={0.5}
                value={input.streetWidthM}
                onChange={(value) => update("streetWidthM", value)}
              />
              <NumberField
                id="buildingSeparationM"
                label="建物間隔"
                unit="m"
                description="建物列の平均間隔です。複数スクリーン回折の近似に使います。"
                min={1}
                max={200}
                step={0.5}
                value={input.buildingSeparationM}
                onChange={(value) => update("buildingSeparationM", value)}
              />
              <NumberField
                id="streetOrientationDeg"
                label="道路角度"
                unit="deg"
                description="電波の進行方向と道路方向の角度です。0度に近いほど道路沿い、90度に近いほど横切る条件です。"
                min={0}
                max={90}
                step={1}
                value={input.streetOrientationDeg}
                onChange={(value) => update("streetOrientationDeg", value)}
              />
            </div>
          </section>
        </div>

        <div className="space-y-5 lg:sticky lg:top-20">
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <Route className="h-5 w-5 text-staf-dark" aria-hidden="true" />
              <h3 className="text-base font-bold text-slate-950">距離逆算結果</h3>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <MetricCard
                label={`${input.reliabilityPercent}%信頼率の最大距離`}
                value={formatResearchDistance(result.maximumDistanceM)}
                description="指定した信頼率と追加損失を含めた、一次評価上の最大距離です。"
              />
              <MetricCard
                label="中央値距離"
                value={formatResearchDistance(result.medianDistanceM)}
                description="シャドウフェージング余裕を取らない50%条件の距離です。現場ではこの距離だけで判断しません。"
              />
              <MetricCard
                label="許容中央値伝搬損失"
                value={`${result.allowedMedianPathLossDb.toFixed(1)} dB`}
                description="選択モデルの中央値損失がこの値以下なら、指定信頼率の余裕が残ります。"
              />
              <MetricCard
                label="信頼率マージン"
                value={`${result.reliabilityMarginDb.toFixed(1)} dB`}
                description="シャドウフェージングσと追加フェード余裕から差し引く安全側のマージンです。"
              />
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-base font-bold text-slate-950">計算の流れ</h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">
              送信余力から追加損失と信頼率マージンを引き、残った許容伝搬損失に到達する距離を逆算します。
            </p>
            <div className="mt-4">
              <CalculationFlow input={input} result={result} />
            </div>
          </section>

          {result.warnings.length > 0 ? (
            <section className="rounded-lg border border-amber-200 bg-amber-50 p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-700" aria-hidden="true" />
                <h3 className="text-base font-bold text-amber-950">適用範囲と注意</h3>
              </div>
              <div className="mt-3 space-y-3">
                {result.warnings.map((warning) => (
                  <p key={warning.id} className="rounded-md bg-white/70 p-3 text-sm leading-relaxed text-amber-950">
                    {warning.message}
                  </p>
                ))}
              </div>
            </section>
          ) : null}

          <DistanceCurve input={input} result={result} />

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-base font-bold text-slate-950">このシートで反映した考え方</h3>
            <div className="mt-3 space-y-3 text-sm leading-relaxed text-slate-600">
              <p>
                最近のチャネルモデルでは、単一の平均距離式だけでなく、LOS/NLOS、アンテナ高、クラッタ、シャドウフェージング、端末近傍、実測補正を分けて扱います。このシートは、その考え方を一次評価用の距離逆算に落とし込んでいます。
              </p>
              <p>
                3GPP Release 19では7〜24GHz帯、近傍界、大規模アレイ、空間非定常性などの議論が進んでいます。ただし、このアプリは詳細なMIMOチャネルシミュレータではないため、最終判断には現地測定と必要に応じたレイトレースを併用してください。
              </p>
              <p>
                米国・日本の携帯キャリアが基地局を設計するときも、単一式だけではなく、標準モデル、地図クラッタ、建物高、アンテナパターン、トラフィック、干渉、ドライブテストやRSRP測定による補正を重ねます。このシートでは、既に入っていた3GPP UMi/UMa、CI、Dual-slopeに加え、今回SUI Terrain A/B/CとCOST231 Walfisch-Ikegami NLOSを比較モデルとして追加しました。
              </p>
              <p>
                さらに高精度な設計では、レイトレースや機械学習も使われます。近年の研究では、3GPPモデルと測定で校正したレイトレースを比較し、工場内5Gでは校正RTがRSRPカバレッジ設計に有効であること、またGISや衛星画像を使うデータ駆動型伝搬推定が従来モデルを補う可能性が示されています。
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <a
                  href="https://www.3gpp.org/ftp/Specs/archive/38_series/38.901/38901-j20.zip"
                  className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-staf-dark transition hover:border-staf/40"
                >
                  3GPP TR 38.901 Release 19
                </a>
                <a
                  href="https://arxiv.org/abs/2507.19266"
                  className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-staf-dark transition hover:border-staf/40"
                >
                  Rel-19概要論文
                </a>
                <a
                  href="https://arxiv.org/abs/2603.25927"
                  className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-staf-dark transition hover:border-staf/40"
                >
                  7〜24GHz測定・フィット資料
                </a>
                <a
                  href="https://arxiv.org/abs/1708.02557"
                  className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-staf-dark transition hover:border-staf/40"
                >
                  IEEE TAP mmWave伝搬モデル概説
                </a>
                <a
                  href="https://arxiv.org/abs/2407.16528"
                  className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-staf-dark transition hover:border-staf/40"
                >
                  5G工場RT/3GPP比較
                </a>
                <a
                  href="https://arxiv.org/abs/2110.01848"
                  className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-staf-dark transition hover:border-staf/40"
                >
                  CNN伝搬推定
                </a>
              </div>
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}
