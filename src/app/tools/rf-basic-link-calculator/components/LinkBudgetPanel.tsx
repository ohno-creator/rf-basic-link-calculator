"use client";

import { type ReactNode, useMemo } from "react";
import { Accordion } from "@/components/Accordion";
import { Tooltip } from "@/components/Tooltip";
import { environmentLossPresets } from "@/data/environmentLossPresets";
import { frequencyPresets } from "@/data/frequencyPresets";
import { glossary } from "@/data/glossary";
import {
  getPropagationModelOption,
  linkTypeOptions,
  propagationModelOptions
} from "@/data/linkBudgetOptions";
import { wirelessSystemPresets } from "@/data/wirelessSystemPresets";
import {
  calculateNearTerminalLossDb,
  getCommunicationMode,
  type LinkBudgetInput,
  type ValidationErrors
} from "@/lib/rf/linkBudget";
import { InputImpactGuide } from "./InputImpactGuide";

type LinkBudgetPanelProps = {
  input: LinkBudgetInput;
  errors: ValidationErrors;
  onChange: (input: LinkBudgetInput) => void;
};

type NumberFieldProps = {
  id: keyof LinkBudgetInput;
  label: string;
  unit: string;
  description: string;
  tooltip: string;
  example: string;
  range: string;
  min: number;
  max: number;
  step: number;
  value: number;
  error?: string;
  onChange: (value: number) => void;
};

type InputGroupProps = {
  step: string;
  title: string;
  description: string;
  tone: "sky" | "emerald" | "rose" | "amber";
  children: ReactNode;
};

const stepToneClasses = {
  sky: "bg-sky-100 text-sky-800",
  emerald: "bg-emerald-100 text-emerald-800",
  rose: "bg-rose-100 text-rose-800",
  amber: "bg-amber-100 text-amber-800"
};

const stepBorderClasses = {
  sky: "border-sky-200",
  emerald: "border-emerald-200",
  rose: "border-rose-200",
  amber: "border-amber-200"
};

function InputGroup({ step, title, description, tone, children }: InputGroupProps) {
  return (
    <section className={`space-y-3 border-l-4 pl-3 sm:pl-4 ${stepBorderClasses[tone]}`}>
      <div className="flex gap-3">
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${stepToneClasses[tone]}`}
        >
          {step}
        </span>
        <div>
          <h3 className="text-base font-bold text-slate-950">{title}</h3>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">{description}</p>
        </div>
      </div>
      <div className="grid gap-4">{children}</div>
    </section>
  );
}

function NumberField({
  id,
  label,
  unit,
  description,
  tooltip,
  example,
  range,
  min,
  max,
  step,
  value,
  error,
  onChange
}: NumberFieldProps) {
  const htmlId = String(id);
  const inputValue = Number.isFinite(value) ? value : "";
  const sliderValue = Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : min;

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label htmlFor={htmlId} className="text-sm font-semibold text-slate-950">
          {label}
        </label>
        <Tooltip term={unit}>{tooltip}</Tooltip>
      </div>
      <p className="mt-1 text-xs leading-relaxed text-slate-500">{description}</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_120px]">
        <input
          id={htmlId}
          type="number"
          value={inputValue}
          min={min}
          max={max}
          step={step}
          className="h-11 rounded-md border border-slate-300 px-3 text-base font-semibold text-slate-950 shadow-sm focus:border-staf focus:outline-none focus:ring-2 focus:ring-staf/20"
          onChange={(event) => onChange(event.target.value === "" ? Number.NaN : Number(event.target.value))}
          aria-invalid={Boolean(error)}
        />
        <div className="flex h-11 items-center justify-center rounded-md bg-slate-50 text-sm font-semibold text-slate-700">
          {unit}
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={sliderValue}
        className="mt-4 w-full"
        onChange={(event) => onChange(Number(event.target.value))}
        aria-label={`${label}のスライダー`}
      />
      <div className="mt-2 flex flex-wrap justify-between gap-2 text-xs text-slate-500">
        <span>入力例: {example}</span>
        <span>推奨レンジ: {range}</span>
      </div>
      {error ? <p className="mt-2 text-sm font-medium text-rose-700">{error}</p> : null}
    </div>
  );
}

function modeDescription(input: LinkBudgetInput): string {
  const mode = getCommunicationMode(input.linkType);

  if (mode === "high_base_station_to_iot_terminal") {
    return "携帯基地局や高所基地局と、地上近傍に設置されたIoT端末との通信を評価するモードです。奥村・秦モデルやCOST231-Hataモデルは、基地局から端末までの広域平均伝搬損失の参考値として利用できます。ただし、端末側が地上近傍にある場合は、地面反射、筐体、車両・人体遮蔽、設置方向などの影響が大きくなるため、端末近傍損失を別途加算して評価します。";
  }

  if (mode === "low_height_terminal_to_terminal") {
    return "送信機・受信機の双方が地上近傍にある通信を評価するモードです。低高度端末同士の通信では、地面反射、フレネルゾーン欠損、設置高さ、周辺遮蔽物の影響が大きくなります。そのため、奥村・秦モデルは主モデルとして使用せず、自由空間損失、2波モデル、Log-distanceモデル、実測補正モデルを中心に評価します。";
  }

  return "任意のアンテナ高、通信距離、環境損失、端末近傍損失、実測補正値を設定して評価します。モデルの適用範囲と警告を確認しながら、一次評価として扱ってください。";
}

export function LinkBudgetPanel({ input, errors, onChange }: LinkBudgetPanelProps) {
  const update = <K extends keyof LinkBudgetInput>(key: K, value: LinkBudgetInput[K]) => {
    onChange({ ...input, [key]: value });
  };

  const environmentLabel = useMemo(() => {
    const match = environmentLossPresets.find((preset) => preset.lossDb === input.environmentLossDb);
    return match?.label ?? "手動入力";
  }, [input.environmentLossDb]);

  const isPresetFrequency = useMemo(
    () => frequencyPresets.some((preset) => preset.frequencyMHz === input.frequencyMHz),
    [input.frequencyMHz]
  );
  const selectedLinkType = useMemo(
    () => linkTypeOptions.find((option) => option.value === input.linkType) ?? linkTypeOptions[0],
    [input.linkType]
  );
  const selectedPropagationModel = useMemo(
    () => getPropagationModelOption(input.propagationModel),
    [input.propagationModel]
  );
  const nearTerminalLossDb = calculateNearTerminalLossDb(input);

  return (
    <section className="space-y-4">
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-bold text-slate-950">リンクバジェット簡易診断</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          送信電力、アンテナ利得、距離による損失、筐体や環境の損失を足し引きして、受信電力とリンクマージンを見積もります。スライダーを動かすと、右の滝グラフがその場で変わります。
        </p>
      </div>

      <Accordion title="入力で何が変わるか（効き方ガイド）">
        <InputImpactGuide />
      </Accordion>

      <div className="grid gap-5">
        <InputGroup
          step="1"
          title="通信形態・伝搬モデル・距離を決める"
          description="まず通信形態と伝搬モデルを選びます。奥村・秦モデルは参考値として残し、適用範囲外では警告します。"
          tone="sky"
        >
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <label htmlFor="linkType" className="text-sm font-semibold text-slate-950">
              通信形態
            </label>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              送信側と受信側の高さ関係に近い通信形態を選んでください。
            </p>
            <select
              id="linkType"
              value={input.linkType}
              className="mt-3 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-950 focus:border-staf focus:outline-none focus:ring-2 focus:ring-staf/20"
              onChange={(event) => update("linkType", event.target.value as LinkBudgetInput["linkType"])}
            >
              {linkTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs leading-relaxed text-slate-600">{selectedLinkType.description}</p>
            <div className="mt-3 rounded-md border border-sky-200 bg-sky-50 p-3 text-xs leading-relaxed text-sky-950">
              {modeDescription(input)}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <label htmlFor="propagationModel" className="text-sm font-semibold text-slate-950">
              伝搬モデル
            </label>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              伝搬損失の主モデルを選びます。低高度端末同士では奥村・秦モデルを主モデルとして推奨しません。
            </p>
            <select
              id="propagationModel"
              value={input.propagationModel}
              className="mt-3 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-950 focus:border-staf focus:outline-none focus:ring-2 focus:ring-staf/20"
              onChange={(event) =>
                update("propagationModel", event.target.value as LinkBudgetInput["propagationModel"])
              }
            >
              {propagationModelOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs leading-relaxed text-slate-600">
              {selectedPropagationModel.description}
            </p>
          </div>

          <NumberField
            id="pathLossExponent"
            label="距離損失指数"
            unit="n"
            description="Log-distanceモデルで使う距離減衰の指数です。自由空間は2、遮蔽物が多い環境では3以上が目安です。"
            tooltip="距離損失指数は現地環境に依存します。本ツールの初期値3.0は一次評価用の仮定で、RSSIまたはRSRP実測に合わせて調整してください。"
            example="2 / 3 / 4"
            range="1-6"
            min={1}
            max={6}
            step={0.1}
            value={input.pathLossExponent}
            error={errors.pathLossExponent}
            onChange={(value) => update("pathLossExponent", value)}
          />

          <div className="rounded-lg border border-slate-200 bg-white p-4">
          <label htmlFor="system" className="text-sm font-semibold text-slate-950">
            通信方式
          </label>
          <p className="mt-1 text-xs text-slate-500">近い通信方式を選んでください。</p>
          <select
            id="system"
            value={input.system}
            className="mt-3 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-950 focus:border-staf focus:outline-none focus:ring-2 focus:ring-staf/20"
            onChange={(event) => update("system", event.target.value)}
          >
            {wirelessSystemPresets.map((system) => (
              <option key={system} value={system}>
                {system}
              </option>
            ))}
          </select>
          {errors.system ? <p className="mt-2 text-sm font-medium text-rose-700">{errors.system}</p> : null}
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label htmlFor="frequencyPreset" className="text-sm font-semibold text-slate-950">
              周波数プリセット
            </label>
            <Tooltip term={glossary.frequency.term}>{glossary.frequency.description}</Tooltip>
          </div>
          <select
            id="frequencyPreset"
            value={input.frequencyMHz}
            className="mt-3 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-950 focus:border-staf focus:outline-none focus:ring-2 focus:ring-staf/20"
            onChange={(event) => update("frequencyMHz", Number(event.target.value))}
          >
            {frequencyPresets.map((preset) => (
              <option key={preset.label} value={preset.frequencyMHz}>
                {preset.label}：{preset.description}
              </option>
            ))}
            {!isPresetFrequency ? (
              <option value={input.frequencyMHz}>手動入力中: {input.frequencyMHz}MHz</option>
            ) : null}
          </select>
          </div>

          <NumberField
            id="frequencyMHz"
            label="周波数"
            unit="MHz"
            description="使用する無線方式の中心周波数です。"
            tooltip="周波数が高いほど波長は短くなり、同じ距離でも自由空間損失は大きくなります。"
            example="920 / 2400 / 3700"
            range="100-6000MHz"
            min={100}
            max={6000}
            step={1}
            value={input.frequencyMHz}
            error={errors.frequencyMHz}
            onChange={(value) => update("frequencyMHz", value)}
          />

          <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label htmlFor="distance" className="text-sm font-semibold text-slate-950">
              通信距離
            </label>
            <Tooltip term={glossary.fspl.term}>
              距離が2倍になると、自由空間損失は約6dB増えます。距離が伸びるほど、受信電力は小さくなります。
            </Tooltip>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            送信側と受信側のおおよその距離です。
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_120px]">
            <input
              id="distance"
              type="number"
              value={Number.isFinite(input.distance) ? input.distance : ""}
              min={input.distanceUnit === "m" ? 1 : 0.001}
              max={input.distanceUnit === "m" ? 10000 : 100}
              step={input.distanceUnit === "m" ? 1 : 0.01}
              className="h-11 rounded-md border border-slate-300 px-3 text-base font-semibold text-slate-950 shadow-sm focus:border-staf focus:outline-none focus:ring-2 focus:ring-staf/20"
              onChange={(event) => update("distance", event.target.value === "" ? Number.NaN : Number(event.target.value))}
              aria-invalid={Boolean(errors.distance)}
            />
            <select
              value={input.distanceUnit}
              className="h-11 rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-950 focus:border-staf focus:outline-none focus:ring-2 focus:ring-staf/20"
              onChange={(event) => {
                const nextUnit = event.target.value as LinkBudgetInput["distanceUnit"];
                const converted =
                  input.distanceUnit === nextUnit
                    ? input.distance
                    : nextUnit === "km"
                      ? input.distance / 1000
                      : input.distance * 1000;
                onChange({ ...input, distanceUnit: nextUnit, distance: Number(converted.toFixed(3)) });
              }}
            >
              <option value="m">m</option>
              <option value="km">km</option>
            </select>
          </div>
          <input
            type="range"
            min={input.distanceUnit === "m" ? 1 : 0.01}
            max={input.distanceUnit === "m" ? 10000 : 10}
            step={input.distanceUnit === "m" ? 1 : 0.01}
            value={Number.isFinite(input.distance) ? input.distance : input.distanceUnit === "m" ? 1 : 0.01}
            className="mt-4 w-full"
            onChange={(event) => update("distance", Number(event.target.value))}
            aria-label="通信距離のスライダー"
          />
          <div className="mt-2 flex flex-wrap justify-between gap-2 text-xs text-slate-500">
            <span>入力例: 10m / 1km</span>
            <span>推奨レンジ: 1m-10km</span>
          </div>
          {errors.distance ? <p className="mt-2 text-sm font-medium text-rose-700">{errors.distance}</p> : null}
          </div>
        </InputGroup>

        <InputGroup
          step="2"
          title="送信側・受信側のアンテナ条件を入れる"
          description="送信電力、アンテナ利得、アンテナ高を入れます。2波モデルや奥村・秦モデルではアンテナ高が伝搬損失に効きます。"
          tone="emerald"
        >
          <NumberField
            id="txPowerDbm"
            label="送信電力"
            unit="dBm"
            description="無線モジュールや送信機から出る電波の強さです。"
            tooltip="0dBm = 1mW、10dBm = 10mW、20dBm = 100mWです。LTE-Mでは23dBm程度の出力が使われる場合があります。"
            example="0 / 13 / 23"
            range="-20-30dBm"
            min={-20}
            max={30}
            step={0.5}
            value={input.txPowerDbm}
            error={errors.txPowerDbm}
            onChange={(value) => update("txPowerDbm", value)}
          />

          <NumberField
            id="txAntennaGainDbi"
            label="送信アンテナ利得"
            unit="dBi"
            description="送信側アンテナの効率や方向性による利得です。"
            tooltip={glossary.antennaGain.description}
            example="-3 / 0 / 2"
            range="-10-10dBi"
            min={-10}
            max={10}
            step={0.5}
            value={input.txAntennaGainDbi}
            error={errors.txAntennaGainDbi}
            onChange={(value) => update("txAntennaGainDbi", value)}
          />

          <NumberField
            id="rxAntennaGainDbi"
            label="受信アンテナ利得"
            unit="dBi"
            description="受信側アンテナの効率や方向性による利得です。"
            tooltip={glossary.dbi.description}
            example="0 / 2 / 5"
            range="-10-15dBi"
            min={-10}
            max={15}
            step={0.5}
            value={input.rxAntennaGainDbi}
            error={errors.rxAntennaGainDbi}
            onChange={(value) => update("rxAntennaGainDbi", value)}
          />

          <NumberField
            id="txAntennaHeightM"
            label="送信側アンテナ高"
            unit="m"
            description="送信側アンテナの地上高です。基地局やゲートウェイでは重要な条件です。"
            tooltip="奥村・秦モデルの一般的な基地局アンテナ高の目安は30m〜200mです。低高度端末同士では地面反射やフレネルゾーン欠損に効きます。"
            example="1.5 / 10 / 30"
            range="0.1-200m"
            min={0.1}
            max={200}
            step={0.1}
            value={input.txAntennaHeightM}
            error={errors.txAntennaHeightM}
            onChange={(value) => update("txAntennaHeightM", value)}
          />

          <NumberField
            id="rxAntennaHeightM"
            label="受信側アンテナ高"
            unit="m"
            description="受信側アンテナの地上高です。地上近傍端末では近傍損失を別途見ます。"
            tooltip="奥村・秦モデルの移動局アンテナ高の目安は1m〜10mです。地上近傍では地面反射、筐体、車両・人体遮蔽の影響が大きくなります。"
            example="0.8 / 1.5 / 10"
            range="0.1-50m"
            min={0.1}
            max={50}
            step={0.1}
            value={input.rxAntennaHeightM}
            error={errors.rxAntennaHeightM}
            onChange={(value) => update("rxAntennaHeightM", value)}
          />
        </InputGroup>

        <InputGroup
          step="3"
          title="環境損失と端末近傍損失を入れる"
          description="ケーブル、環境、地面近接、筐体、偏波、車両・人体遮蔽、設置ばらつきを分けて入力します。"
          tone="rose"
        >
          <NumberField
            id="cableLossDb"
            label="ケーブル・コネクタ損失"
            unit="dB"
            description="ケーブルやコネクタで失われる電力です。"
            tooltip={glossary.cableLoss.description}
            example="0 / 0.5 / 1"
            range="0-10dB"
            min={0}
            max={10}
            step={0.1}
            value={input.cableLossDb}
            error={errors.cableLossDb}
            onChange={(value) => update("cableLossDb", value)}
          />

          <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label htmlFor="environmentPreset" className="text-sm font-semibold text-slate-950">
              環境損失プリセット
            </label>
            <Tooltip term={glossary.environmentLoss.term}>{glossary.environmentLoss.description}</Tooltip>
          </div>
          <select
            id="environmentPreset"
            value={environmentLabel}
            className="mt-3 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-950 focus:border-staf focus:outline-none focus:ring-2 focus:ring-staf/20"
            onChange={(event) => {
              const preset = environmentLossPresets.find((item) => item.label === event.target.value);
              if (preset?.lossDb !== null && preset?.lossDb !== undefined) {
                update("environmentLossDb", preset.lossDb);
              }
            }}
          >
            {environmentLossPresets.map((preset) => (
              <option key={preset.label} value={preset.label}>
                {preset.label}
                {preset.lossDb === null ? "" : `：${preset.lossDb}dB`}
              </option>
            ))}
          </select>
          <p className="mt-2 text-xs leading-relaxed text-slate-500">
            環境損失は初期検討用の目安です。実際の損失は筐体材質、金属部品、設置姿勢、周辺環境、ノイズ条件によって大きく変動します。
          </p>
          </div>

          <NumberField
            id="environmentLossDb"
            label="環境損失"
            unit="dB"
            description="壁、筐体、金属部品、設置環境などによる追加損失の目安です。"
            tooltip="金属近接や筐体内蔵では追加損失が大きくなることがあります。値はあくまで初期検討用の目安です。"
            example="0 / 10 / 20"
            range="0-40dB"
            min={0}
            max={40}
            step={0.5}
            value={input.environmentLossDb}
            error={errors.environmentLossDb}
            onChange={(value) => update("environmentLossDb", value)}
          />

          <div className="rounded-lg border border-rose-200 bg-rose-50 p-4">
            <p className="text-sm font-semibold text-rose-950">端末近傍損失</p>
            <p className="mt-1 text-2xl font-bold text-rose-950">
              {nearTerminalLossDb.toFixed(1)} dB
            </p>
            <p className="mt-1 text-xs leading-relaxed text-rose-800">
              Hataモデルなどの広域平均伝搬損失だけでは表しにくい、端末のすぐ近くで起きる損失を合算します。
            </p>
          </div>

          <NumberField
            id="groundProximityLossDb"
            label="地面近接損失"
            unit="dB"
            description="端末アンテナが地面に近いことで発生する追加損失です。"
            tooltip="地面反射やフレネルゾーン欠損により、低高度端末では追加損失が出やすくなります。"
            example="0 / 3 / 6"
            range="0-30dB"
            min={0}
            max={30}
            step={0.5}
            value={input.groundProximityLossDb}
            error={errors.groundProximityLossDb}
            onChange={(value) => update("groundProximityLossDb", value)}
          />

          <NumberField
            id="enclosureLossDb"
            label="筐体損失"
            unit="dB"
            description="端末筐体、基板GND、金属部品、内蔵アンテナ配置による追加損失です。"
            tooltip="樹脂筐体でも配置次第で損失が出ます。金属筐体や金属近接では大きく悪化することがあります。"
            example="0 / 5 / 15"
            range="0-40dB"
            min={0}
            max={40}
            step={0.5}
            value={input.enclosureLossDb}
            error={errors.enclosureLossDb}
            onChange={(value) => update("enclosureLossDb", value)}
          />

          <NumberField
            id="polarizationMismatchLossDb"
            label="偏波ミスマッチ損失"
            unit="dB"
            description="送信側と受信側の偏波や設置向きがずれることで発生する損失です。"
            tooltip="端末の設置方向が変わる用途では、偏波ミスマッチ損失を見込むと安全側の評価になります。"
            example="0 / 3 / 10"
            range="0-30dB"
            min={0}
            max={30}
            step={0.5}
            value={input.polarizationMismatchLossDb}
            error={errors.polarizationMismatchLossDb}
            onChange={(value) => update("polarizationMismatchLossDb", value)}
          />

          <NumberField
            id="vehicleBodyObstructionLossDb"
            label="車両・人体遮蔽損失"
            unit="dB"
            description="車両、人体、荷物、設備などが端末の近くで電波を遮る損失です。"
            tooltip="スマートメーター、物流、車載・人の近くで使う端末では、遮蔽条件を別枠で見込むと判断しやすくなります。"
            example="0 / 5 / 20"
            range="0-40dB"
            min={0}
            max={40}
            step={0.5}
            value={input.vehicleBodyObstructionLossDb}
            error={errors.vehicleBodyObstructionLossDb}
            onChange={(value) => update("vehicleBodyObstructionLossDb", value)}
          />

          <NumberField
            id="installationMarginDb"
            label="設置ばらつきマージン"
            unit="dB"
            description="設置方向、個体差、量産ばらつき、施工ばらつきに備える余裕分です。"
            tooltip="量産・現地施工ではアンテナ向きや周辺物が揃わないため、余裕分を損失として引いて評価します。"
            example="0 / 3 / 10"
            range="0-30dB"
            min={0}
            max={30}
            step={0.5}
            value={input.installationMarginDb}
            error={errors.installationMarginDb}
            onChange={(value) => update("installationMarginDb", value)}
          />
        </InputGroup>

        <InputGroup
          step="4"
          title="受信感度と実測補正を入れる"
          description="受信感度は合格ラインです。現地測定がある場合は、RSSI/RSRPから得た差分を実測補正値として入れます。"
          tone="amber"
        >
          <NumberField
            id="receiverSensitivityDbm"
            label="受信感度"
            unit="dBm"
            description="受信機がどれくらい弱い電波まで受け取れるかを示します。"
            tooltip="-100dBmのように数値が小さいほど、より弱い電波を受信できます。受信電力が受信感度を上回ると、通信できる可能性があります。"
            example="-75 / -90 / -120"
            range="-130--50dBm"
            min={-130}
            max={-50}
            step={1}
            value={input.receiverSensitivityDbm}
            error={errors.receiverSensitivityDbm}
            onChange={(value) => update("receiverSensitivityDbm", value)}
          />

          <NumberField
            id="calibrationOffsetDb"
            label="実測補正値"
            unit="dB"
            description="現地RSSI/RSRP測定と計算値の差分です。実測が弱い場合はマイナス、強い場合はプラスで入力します。"
            tooltip="未測定の場合は0dBのままです。低高度IoT通信では現地測定で補正することを推奨します。"
            example="-10 / 0 / 5"
            range="-40-40dB"
            min={-40}
            max={40}
            step={0.5}
            value={input.calibrationOffsetDb}
            error={errors.calibrationOffsetDb}
            onChange={(value) => update("calibrationOffsetDb", value)}
          />
        </InputGroup>
      </div>
    </section>
  );
}
