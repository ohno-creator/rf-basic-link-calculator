"use client";

import { type ReactNode, useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Accordion } from "@/components/Accordion";
import { Card, StateCard } from "@/components/Card";
import { Field } from "@/components/Field";
import { Tooltip } from "@/components/Tooltip";
import { environmentLossPresets } from "@/data/environmentLossPresets";
import { frequencyPresets } from "@/data/frequencyPresets";
import { glossary } from "@/data/glossary";
import {
  getPropagationAreaOption,
  getPropagationModelOption,
  linkTypeOptions,
  propagationAreaOptions,
  propagationModelOptions
} from "@/data/linkBudgetOptions";
import { wirelessSystemPresets } from "@/data/wirelessSystemPresets";
import {
  calculateNearTerminalLossDb,
  getCommunicationMode,
  type LinkBudgetInput
} from "@/lib/rf/linkBudget";
import type { LinkBudgetErrorMessages } from "@/lib/linkBudgetErrorMessages";
import { HataAntennaHeightNotice } from "./HataAntennaHeightNotice";
import { InputAssumptionMenu } from "./InputAssumptionMenu";
import { InputImpactGuide } from "./InputImpactGuide";
import { IotHataCalibrationPanel } from "./IotHataCalibrationPanel";
import { isHataFamily } from "./linkBudgetPanelShared";
import { LinkTypeCards } from "./LinkTypeCards";
import { ModelAssumptionGuide } from "./ModelAssumptionGuide";

type LinkBudgetPanelProps = {
  input: LinkBudgetInput;
  errors: LinkBudgetErrorMessages;
  onChange: (input: LinkBudgetInput) => void;
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

function modeDescription(input: LinkBudgetInput): string {
  const mode = getCommunicationMode(input.linkType);

  if (mode === "high_base_station_to_iot_terminal") {
    return "携帯基地局や高所基地局と、地上近傍に設置されたIoT端末との通信を評価するモードです。奥村・秦モデルやCOST231-Hataモデルは、基地局から端末までの広域平均伝搬損失の参考値として利用できます。ただし、端末側が地上近傍にある場合は、地面反射、筐体、車両・人体遮蔽、設置方向などの影響が大きくなるため、端末近傍損失を別途加算して評価します。";
  }

  if (mode === "gateway_to_low_height_terminal") {
    return "比較的低い位置に設置されたゲートウェイと、地上近傍端末との通信を評価するモードです。地面反射、フレネルゾーン欠損、設置高さ、周辺遮蔽物の影響が大きくなるため、自由空間損失、2波モデル、Log-distanceモデル、実測補正モデルを中心に評価します。奥村・秦モデルは主モデルではなく参考値として扱います。";
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

  const [nearDetailOpen, setNearDetailOpen] = useState(
    () =>
      input.groundProximityLossDb > 0 ||
      input.enclosureLossDb > 0 ||
      input.polarizationMismatchLossDb > 0 ||
      input.vehicleBodyObstructionLossDb > 0 ||
      input.installationMarginDb > 0
  );

  // 環境損失プリセットは lossDb が重複（屋内・軽度=10dB と 筐体内蔵=10dB）するため、
  // 選択したラベル自体を保持して、選択直後に別ラベルへ化けないようにする。
  const [environmentPresetLabel, setEnvironmentPresetLabel] = useState<string>(() => {
    const match = environmentLossPresets.find((preset) => preset.lossDb === input.environmentLossDb);
    return match?.label ?? "手動入力";
  });
  const selectedEnvironmentPreset = environmentLossPresets.find(
    (preset) => preset.label === environmentPresetLabel
  );
  const environmentSelectValue =
    selectedEnvironmentPreset && selectedEnvironmentPreset.lossDb === input.environmentLossDb
      ? environmentPresetLabel
      : environmentLossPresets.find((preset) => preset.lossDb === input.environmentLossDb)?.label ??
        "手動入力";

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
  const selectedPropagationArea = useMemo(
    () => getPropagationAreaOption(input.propagationArea),
    [input.propagationArea]
  );
  const nearTerminalLossDb = calculateNearTerminalLossDb(input);
  // 通信距離は単位（m/km）で下限・上限が変わる。Field の min/max・クランプに使う。
  const distanceMin = input.distanceUnit === "m" ? 1 : 0.01;
  const distanceMax = input.distanceUnit === "m" ? 10000 : 20;

  return (
    <section className="space-y-4">
      <Card padding="lg">
        <h2 className="text-xl font-bold text-slate-950">リンクバジェット簡易診断</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          送信電力、アンテナ利得、距離による損失、筐体や環境の損失を足し引きして、受信電力とリンクマージンを見積もります。スライダーを動かすと、右の滝グラフがその場で変わります。
        </p>
      </Card>

      <Accordion title="入力で何が変わるか（効き方ガイド）">
        <InputImpactGuide />
      </Accordion>

      <InputAssumptionMenu input={input} />

      <Accordion title="モデルの前提条件・入力の使われ方">
        <ModelAssumptionGuide input={input} />
      </Accordion>

      <div className="grid gap-5">
        <InputGroup
          step="1"
          title="通信形態・伝搬モデル・距離を決める"
          description="まず通信形態と伝搬モデルを選びます。奥村・秦モデルは参考値として残し、適用範囲外では警告します。"
          tone="sky"
        >
          <LinkTypeCards
            value={input.linkType}
            selectedOption={selectedLinkType}
            modeText={modeDescription(input)}
            onSelect={(value) => update("linkType", value)}
          />

          <Card padding="md" shadow={false}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label htmlFor="propagationModel" className="text-sm font-semibold text-slate-950">
                伝搬モデル
              </label>
              <Tooltip term="伝搬モデル">
                距離による電波の減り方をどの式で見積もるかを選びます。自由空間＝見通しの基準、2波＝地面反射、Log-distance＝指数で近似、奥村・秦／COST231-Hata＝市街地の経験式。選ぶモデルで結果が大きく変わるため、通信形態に合うものを選びます。
              </Tooltip>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              伝搬損失の主モデルを選びます。低高度端末同士では奥村・秦モデルを主モデルとして推奨しません。
            </p>
            <select
              id="propagationModel"
              value={input.propagationModel}
              className="mt-3 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-950 focus:border-staf focus:outline-none focus:ring-2 focus:ring-staf/40"
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
            <Card
              variant="slate"
              padding="sm"
              radius="md"
              shadow={false}
              className="mt-2 space-y-1.5 text-xs leading-relaxed"
            >
              <p className="text-slate-600">{selectedPropagationModel.description}</p>
              <p>
                <span className="font-semibold text-slate-900">向いている：</span>
                <span className="text-slate-600">{selectedPropagationModel.bestFor}</span>
              </p>
              <p>
                <span className="font-semibold text-slate-900">注意：</span>
                <span className="text-amber-700">{selectedPropagationModel.caution}</span>
              </p>
            </Card>
            {selectedLinkType.recommendedModelValues.length > 0 &&
            !selectedLinkType.recommendedModelValues.includes(input.propagationModel) ? (
              <StateCard tone="caution" padding="sm" radius="md" className="mt-2 text-xs leading-relaxed">
                <span className="font-semibold">この通信形態での推奨モデル：</span>
                {selectedLinkType.recommendedModels}。現在の「{selectedPropagationModel.label}」は参考として計算します。
              </StateCard>
            ) : null}
          </Card>

          {isHataFamily(input.propagationModel) ? (
            <Card padding="md" shadow={false}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label htmlFor="propagationArea" className="text-sm font-semibold text-slate-950">
                  奥村・秦モデルのエリア種別
                </label>
                <Tooltip term="エリア種別">
                  Hata系で使う環境区分です。市街地（大都市）→市街地（中小都市）→郊外→開放地の順に伝搬損失は小さくなります（届きやすくなります）。迷ったら中小都市から始めます。
                </Tooltip>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                エリア種別も固定ではありません。市街地、郊外、開放地の違いを伝搬損失に反映します。
              </p>
              <select
                id="propagationArea"
                value={input.propagationArea}
                className="mt-3 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-950 focus:border-staf focus:outline-none focus:ring-2 focus:ring-staf/40"
                onChange={(event) =>
                  update("propagationArea", event.target.value as LinkBudgetInput["propagationArea"])
                }
              >
                {propagationAreaOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                {selectedPropagationArea.description}
              </p>
            </Card>
          ) : null}

          <IotHataCalibrationPanel input={input} errors={errors} onChange={onChange} update={update} />

          <HataAntennaHeightNotice input={input} />

          <Field
            id="pathLossExponent"
            label="距離損失指数"
            unit="n"
            help={`${
              input.propagationModel === "log_distance"
                ? "Log-distanceモデルで使う距離減衰の指数です。自由空間は2、遮蔽物が多い環境では3以上が目安です。"
                : "Log-distanceモデル用の値です。現在の伝搬モデルでは計算に使いませんが、モデルを切り替えると反映されます。"
            }距離損失指数は現地環境に依存します。本ツールの初期値3.0は一次評価用の仮定で、RSSIまたはRSRP実測に合わせて調整してください。（推奨レンジ: 1-6）`}
            example="2 / 3 / 4"
            min={1}
            max={6}
            step={0.1}
            value={input.pathLossExponent}
            error={errors.pathLossExponent}
            emptyBehavior="invalid"
            onChange={(value) => update("pathLossExponent", value)}
          />

          <Card padding="md" shadow={false}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label htmlFor="system" className="text-sm font-semibold text-slate-950">
              通信方式
            </label>
            <Tooltip term="通信方式">
              使う無線規格の目安です（LTE-M/NB-IoT、BLE、Wi-Fi、LoRa など）。表示・相談メモ用のラベルで、計算には直接使いません。実際の結果は周波数・送信電力・受信感度で決まります。
            </Tooltip>
          </div>
          <p className="mt-1 text-xs text-slate-500">近い通信方式を選んでください。</p>
          <select
            id="system"
            value={input.system}
            className="mt-3 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-950 focus:border-staf focus:outline-none focus:ring-2 focus:ring-staf/40"
            onChange={(event) => update("system", event.target.value)}
          >
            {wirelessSystemPresets.map((system) => (
              <option key={system} value={system}>
                {system}
              </option>
            ))}
          </select>
          {errors.system ? <p className="mt-2 text-sm font-medium text-rose-700">{errors.system}</p> : null}
          </Card>

          <Card padding="md" shadow={false}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label htmlFor="frequencyPreset" className="text-sm font-semibold text-slate-950">
              周波数プリセット
            </label>
            <Tooltip term={glossary.frequency.term}>{glossary.frequency.description}</Tooltip>
          </div>
          <select
            id="frequencyPreset"
            value={input.frequencyMHz}
            className="mt-3 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-950 focus:border-staf focus:outline-none focus:ring-2 focus:ring-staf/40"
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
          </Card>

          <Field
            id="frequencyMHz"
            showSlider
            label="周波数"
            unit="MHz"
            help="使用する無線方式の中心周波数です。周波数が高いほど波長は短くなり、同じ距離でも自由空間損失は大きくなります。（推奨レンジ: 100-6000MHz）"
            example="920 / 2400 / 3700"
            min={100}
            max={6000}
            step={1}
            value={input.frequencyMHz}
            error={errors.frequencyMHz}
            emptyBehavior="invalid"
            onChange={(value) => update("frequencyMHz", value)}
          />

          <Field
            id="distance"
            showSlider
            label="通信距離"
            help="送信側と受信側のおおよその距離です。距離が2倍になると自由空間損失は約6dB増え、受信電力は小さくなります。（推奨レンジ: 1m-10km）"
            example="10m / 1km"
            unitSelect={{
              value: input.distanceUnit,
              options: [
                { value: "m", label: "m" },
                { value: "km", label: "km" }
              ],
              ariaLabel: "通信距離の単位",
              onChange: (nextUnitRaw) => {
                const nextUnit = nextUnitRaw as LinkBudgetInput["distanceUnit"];
                const converted =
                  input.distanceUnit === nextUnit
                    ? input.distance
                    : nextUnit === "km"
                      ? input.distance / 1000
                      : input.distance * 1000;
                onChange({ ...input, distanceUnit: nextUnit, distance: Number(converted.toFixed(3)) });
              }
            }}
            min={distanceMin}
            max={distanceMax}
            step={input.distanceUnit === "m" ? 1 : 0.01}
            value={input.distance}
            error={errors.distance}
            emptyBehavior="invalid"
            onChange={(value) => update("distance", value)}
          />
        </InputGroup>

        <InputGroup
          step="2"
          title="送信側・受信側のアンテナ条件を入れる"
          description="送信電力、アンテナ利得、アンテナ高を入れます。2波モデルや奥村・秦モデルではアンテナ高が伝搬損失に効きます。"
          tone="emerald"
        >
          <Field
            id="txPowerDbm"
            showSlider
            label="送信電力"
            unit="dBm"
            help="無線モジュールや送信機から出る電波の強さです。0dBm = 1mW、10dBm = 10mW、20dBm = 100mWです。LTE-Mでは23dBm程度の出力が使われる場合があります。（推奨レンジ: -20-30dBm）"
            example="0 / 13 / 23"
            min={-20}
            max={30}
            step={0.5}
            value={input.txPowerDbm}
            error={errors.txPowerDbm}
            emptyBehavior="invalid"
            onChange={(value) => update("txPowerDbm", value)}
          />

          <Field
            id="txAntennaGainDbi"
            label="送信アンテナ利得"
            unit="dBi"
            help={`送信側アンテナの効率や方向性による利得です。${glossary.antennaGain.description}（推奨レンジ: -10-10dBi）`}
            example="-3 / 0 / 2"
            min={-10}
            max={10}
            step={0.5}
            value={input.txAntennaGainDbi}
            error={errors.txAntennaGainDbi}
            emptyBehavior="invalid"
            onChange={(value) => update("txAntennaGainDbi", value)}
          />

          <Field
            id="rxAntennaGainDbi"
            label="受信アンテナ利得"
            unit="dBi"
            help={`受信側アンテナの効率や方向性による利得です。${glossary.dbi.description}（推奨レンジ: -10-15dBi）`}
            example="0 / 2 / 5"
            min={-10}
            max={15}
            step={0.5}
            value={input.rxAntennaGainDbi}
            error={errors.rxAntennaGainDbi}
            emptyBehavior="invalid"
            onChange={(value) => update("rxAntennaGainDbi", value)}
          />

          <Field
            id="txAntennaHeightM"
            showSlider
            label="送信側 空中線地上高（アンテナ高 hb）"
            unit="m"
            help="送信側アンテナの地上高。奥村・秦／COST231-Hataでは基地局高 hb としてこの入力値が伝搬損失計算に反映されます（固定値ではありません。適用目安30〜200m）。低高度端末同士では地面反射やフレネルゾーン欠損にも効きます。（推奨レンジ: 0.1-200m）"
            example="1.5 / 10 / 30"
            min={0.1}
            max={200}
            step={0.1}
            value={input.txAntennaHeightM}
            error={errors.txAntennaHeightM}
            emptyBehavior="invalid"
            onChange={(value) => update("txAntennaHeightM", value)}
          />

          <Field
            id="rxAntennaHeightM"
            showSlider
            label="受信側 空中線地上高（アンテナ高 hm）"
            unit="m"
            help="受信側アンテナの地上高。奥村・秦／COST231-Hataでは移動局高 hm としてこの入力値が伝搬損失計算に反映されます（固定値ではありません。適用目安1〜10m）。地上近傍では地面反射・筐体・車両/人体遮蔽の影響が大きく、近傍損失は別途見ます。（推奨レンジ: 0.1-50m）"
            example="0.8 / 1.5 / 10"
            min={0.1}
            max={50}
            step={0.1}
            value={input.rxAntennaHeightM}
            error={errors.rxAntennaHeightM}
            emptyBehavior="invalid"
            onChange={(value) => update("rxAntennaHeightM", value)}
          />
        </InputGroup>

        <InputGroup
          step="3"
          title="環境損失と端末近傍損失を入れる"
          description="ケーブル、環境、地面近接、筐体、偏波、車両・人体遮蔽、設置ばらつきを分けて入力します。"
          tone="rose"
        >
          <Field
            id="cableLossDb"
            label="ケーブル・コネクタ損失"
            unit="dB"
            help={`ケーブルやコネクタで失われる電力です。${glossary.cableLoss.description}（推奨レンジ: 0-10dB）`}
            example="0 / 0.5 / 1"
            min={0}
            max={10}
            step={0.1}
            value={input.cableLossDb}
            error={errors.cableLossDb}
            emptyBehavior="invalid"
            onChange={(value) => update("cableLossDb", value)}
          />

          <Card padding="md" shadow={false}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label htmlFor="environmentPreset" className="text-sm font-semibold text-slate-950">
              環境損失プリセット
            </label>
            <Tooltip term={glossary.environmentLoss.term}>{glossary.environmentLoss.description}</Tooltip>
          </div>
          <select
            id="environmentPreset"
            value={environmentSelectValue}
            className="mt-3 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-950 focus:border-staf focus:outline-none focus:ring-2 focus:ring-staf/40"
            onChange={(event) => {
              setEnvironmentPresetLabel(event.target.value);
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
          </Card>

          <Field
            id="environmentLossDb"
            label="環境損失"
            unit="dB"
            help="壁、筐体、金属部品、設置環境などによる追加損失の目安です。金属近接や筐体内蔵では追加損失が大きくなることがあります。値はあくまで初期検討用の目安です。（推奨レンジ: 0-40dB）"
            example="0 / 10 / 20"
            min={0}
            max={40}
            step={0.5}
            value={input.environmentLossDb}
            error={errors.environmentLossDb}
            emptyBehavior="invalid"
            onChange={(value) => update("environmentLossDb", value)}
          />

          <StateCard tone="danger" padding="md">
            <p className="text-sm font-semibold">端末近傍損失</p>
            <p className="mt-1 text-2xl font-bold">
              {nearTerminalLossDb.toFixed(1)} dB
            </p>
            <p className="mt-1 text-xs leading-relaxed">
              地面近接・筐体・偏波・車両/人体遮蔽・設置ばらつきの合計です。下の内訳で各要因を入力できます。
            </p>
          </StateCard>

          <details
            id="near-terminal-detail"
            open={nearDetailOpen}
            onToggle={(event) => setNearDetailOpen((event.target as HTMLDetailsElement).open)}
            className="group rounded-lg border border-slate-200 bg-white"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 text-sm font-semibold text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-staf/40">
              <span>端末近傍損失の内訳を入力（地面近接・筐体・偏波・遮蔽・設置ばらつき）</span>
              <ChevronDown
                aria-hidden
                className="h-4 w-4 shrink-0 text-slate-500 transition group-open:rotate-180"
              />
            </summary>
            <div className="grid gap-4 px-4 pb-4">
          <Field
            id="groundProximityLossDb"
            label="地面近接損失"
            unit="dB"
            help="端末アンテナが地面に近いことで発生する追加損失です。地面反射やフレネルゾーン欠損により、低高度端末では追加損失が出やすくなります。（推奨レンジ: 0-30dB）"
            example="0 / 3 / 6"
            min={0}
            max={30}
            step={0.5}
            value={input.groundProximityLossDb}
            error={errors.groundProximityLossDb}
            emptyBehavior="invalid"
            onChange={(value) => update("groundProximityLossDb", value)}
          />

          <Field
            id="enclosureLossDb"
            label="筐体損失"
            unit="dB"
            help="端末筐体、基板GND、金属部品、内蔵アンテナ配置による追加損失です。樹脂筐体でも配置次第で損失が出ます。金属筐体や金属近接では大きく悪化することがあります。（推奨レンジ: 0-40dB）"
            example="0 / 5 / 15"
            min={0}
            max={40}
            step={0.5}
            value={input.enclosureLossDb}
            error={errors.enclosureLossDb}
            emptyBehavior="invalid"
            onChange={(value) => update("enclosureLossDb", value)}
          />

          <Field
            id="polarizationMismatchLossDb"
            label="偏波ミスマッチ損失"
            unit="dB"
            help="送信側と受信側の偏波や設置向きがずれることで発生する損失です。端末の設置方向が変わる用途では、偏波ミスマッチ損失を見込むと安全側の評価になります。（推奨レンジ: 0-30dB）"
            example="0 / 3 / 10"
            min={0}
            max={30}
            step={0.5}
            value={input.polarizationMismatchLossDb}
            error={errors.polarizationMismatchLossDb}
            emptyBehavior="invalid"
            onChange={(value) => update("polarizationMismatchLossDb", value)}
          />

          <Field
            id="vehicleBodyObstructionLossDb"
            label="車両・人体遮蔽損失"
            unit="dB"
            help="車両、人体、荷物、設備などが端末の近くで電波を遮る損失です。スマートメーター、物流、車載・人の近くで使う端末では、遮蔽条件を別枠で見込むと判断しやすくなります。（推奨レンジ: 0-40dB）"
            example="0 / 5 / 20"
            min={0}
            max={40}
            step={0.5}
            value={input.vehicleBodyObstructionLossDb}
            error={errors.vehicleBodyObstructionLossDb}
            emptyBehavior="invalid"
            onChange={(value) => update("vehicleBodyObstructionLossDb", value)}
          />

          <Field
            id="installationMarginDb"
            label="設置ばらつきマージン"
            unit="dB"
            help="設置方向、個体差、量産ばらつき、施工ばらつきに備える余裕分です。量産・現地施工ではアンテナ向きや周辺物が揃わないため、余裕分を損失として引いて評価します。（推奨レンジ: 0-30dB）"
            example="0 / 3 / 10"
            min={0}
            max={30}
            step={0.5}
            value={input.installationMarginDb}
            error={errors.installationMarginDb}
            emptyBehavior="invalid"
            onChange={(value) => update("installationMarginDb", value)}
          />
            </div>
          </details>
        </InputGroup>

        <InputGroup
          step="4"
          title="受信感度と実測補正を入れる"
          description="受信感度は合格ラインです。現地測定がある場合は、RSSI/RSRPから得た差分を実測補正値として入れます。"
          tone="amber"
        >
          <Field
            id="receiverSensitivityDbm"
            label="受信感度"
            unit="dBm"
            help="受信機がどれくらい弱い電波まで受け取れるかを示します。-100dBmのように数値が小さいほど、より弱い電波を受信できます。受信電力が受信感度を上回ると、通信できる可能性があります。（推奨レンジ: -130--50dBm）"
            example="-75 / -90 / -120"
            min={-130}
            max={-50}
            step={1}
            value={input.receiverSensitivityDbm}
            error={errors.receiverSensitivityDbm}
            emptyBehavior="invalid"
            onChange={(value) => update("receiverSensitivityDbm", value)}
          />

          <Field
            id="calibrationOffsetDb"
            label="実測補正値"
            unit="dB"
            help={`${
              input.propagationModel === "iot_hata_calibrated"
                ? "IoT実測補正Hataのアンカー補正とは別に加える補正です。同じ実測差分を二重に入れないよう注意してください。"
                : "現地RSSI/RSRP測定と計算値の差分です。実測が弱い場合はマイナス、強い場合はプラスで入力します。"
            }${
              input.propagationModel === "iot_hata_calibrated"
                ? "IoT実測補正Hataモードでは、実測受信電力から基準モデルとの差分をすでに推定します。この欄は別要因の追加補正だけに使います。"
                : "未測定の場合は0dBのままです。低高度IoT通信では現地測定で補正することを推奨します。"
            }（推奨レンジ: -40-40dB）`}
            example="-10 / 0 / 5"
            min={-40}
            max={40}
            step={0.5}
            value={input.calibrationOffsetDb}
            error={errors.calibrationOffsetDb}
            emptyBehavior="invalid"
            onChange={(value) => update("calibrationOffsetDb", value)}
          />
        </InputGroup>
      </div>
    </section>
  );
}
