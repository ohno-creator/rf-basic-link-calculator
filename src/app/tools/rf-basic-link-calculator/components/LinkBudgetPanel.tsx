"use client";

import { type ReactNode, useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Accordion } from "@/components/Accordion";
import { Card, StateCard } from "@/components/Card";
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
import { LinkBudgetNumberField } from "./LinkBudgetNumberField";
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
  // 通信距離は数値入力とスライダーで同じ範囲を使い、スライダー値は範囲内にクランプする。
  const distanceMin = input.distanceUnit === "m" ? 1 : 0.01;
  const distanceMax = input.distanceUnit === "m" ? 10000 : 20;
  const distanceSliderValue = Math.min(
    distanceMax,
    Math.max(distanceMin, Number.isFinite(input.distance) ? input.distance : distanceMin)
  );

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
            <Card
              variant="slate"
              padding="sm"
              radius="md"
              shadow={false}
              className="mt-2 space-y-1.5 text-xs leading-relaxed"
            >
              <p className="text-slate-700">{selectedPropagationModel.description}</p>
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
                className="mt-3 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-950 focus:border-staf focus:outline-none focus:ring-2 focus:ring-staf/20"
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

          <LinkBudgetNumberField
            id="pathLossExponent"
            label="距離損失指数"
            unit="n"
            description={
              input.propagationModel === "log_distance"
                ? "Log-distanceモデルで使う距離減衰の指数です。自由空間は2、遮蔽物が多い環境では3以上が目安です。"
                : "Log-distanceモデル用の値です。現在の伝搬モデルでは計算に使いませんが、モデルを切り替えると反映されます。"
            }
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
          </Card>

          <LinkBudgetNumberField
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

          <Card padding="md" shadow={false}>
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
              min={distanceMin}
              max={distanceMax}
              step={input.distanceUnit === "m" ? 1 : 0.01}
              className="h-11 rounded-md border border-slate-300 px-3 text-base font-semibold text-slate-950 shadow-card focus:border-staf focus:outline-none focus:ring-2 focus:ring-staf/20"
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
            min={distanceMin}
            max={distanceMax}
            step={input.distanceUnit === "m" ? 1 : 0.01}
            value={distanceSliderValue}
            className="mt-4 w-full"
            onChange={(event) => update("distance", Number(event.target.value))}
            aria-label="通信距離のスライダー"
          />
          <div className="mt-2 flex flex-wrap justify-between gap-2 text-xs text-slate-500">
            <span>入力例: 10m / 1km</span>
            <span>推奨レンジ: 1m-10km</span>
          </div>
          {errors.distance ? <p className="mt-2 text-sm font-medium text-rose-700">{errors.distance}</p> : null}
          </Card>
        </InputGroup>

        <InputGroup
          step="2"
          title="送信側・受信側のアンテナ条件を入れる"
          description="送信電力、アンテナ利得、アンテナ高を入れます。2波モデルや奥村・秦モデルではアンテナ高が伝搬損失に効きます。"
          tone="emerald"
        >
          <LinkBudgetNumberField
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

          <LinkBudgetNumberField
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

          <LinkBudgetNumberField
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

          <LinkBudgetNumberField
            id="txAntennaHeightM"
            label="送信側 空中線地上高（アンテナ高 hb）"
            unit="m"
            description="送信側アンテナの地上高（空中線地上高）です。奥村・秦／COST231-Hataモデルでは基地局高 hb として伝搬損失に反映されます（固定値ではありません）。"
            tooltip="奥村・秦モデルの基地局空中線地上高 hb は固定ではなく、この入力値が計算に反映されます。一般的な適用目安は30m〜200m。低高度端末同士では地面反射やフレネルゾーン欠損にも効きます。"
            example="1.5 / 10 / 30"
            range="0.1-200m"
            min={0.1}
            max={200}
            step={0.1}
            value={input.txAntennaHeightM}
            error={errors.txAntennaHeightM}
            onChange={(value) => update("txAntennaHeightM", value)}
          />

          <LinkBudgetNumberField
            id="rxAntennaHeightM"
            label="受信側 空中線地上高（アンテナ高 hm）"
            unit="m"
            description="受信側アンテナの地上高（空中線地上高）です。奥村・秦／COST231-Hataモデルでは移動局高 hm として伝搬損失に反映されます（固定値ではありません）。地上近傍端末では近傍損失を別途見ます。"
            tooltip="奥村・秦モデルの移動局空中線地上高 hm は固定ではなく、この入力値が計算に反映されます。一般的な適用目安は1m〜10m。地上近傍では地面反射、筐体、車両・人体遮蔽の影響が大きくなります。"
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
          <LinkBudgetNumberField
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
            className="mt-3 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-950 focus:border-staf focus:outline-none focus:ring-2 focus:ring-staf/20"
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

          <LinkBudgetNumberField
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
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 text-sm font-semibold text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-staf/30">
              <span>端末近傍損失の内訳を入力（地面近接・筐体・偏波・遮蔽・設置ばらつき）</span>
              <ChevronDown
                aria-hidden
                className="h-4 w-4 shrink-0 text-slate-500 transition group-open:rotate-180"
              />
            </summary>
            <div className="grid gap-4 px-4 pb-4">
          <LinkBudgetNumberField
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

          <LinkBudgetNumberField
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

          <LinkBudgetNumberField
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

          <LinkBudgetNumberField
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

          <LinkBudgetNumberField
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
            </div>
          </details>
        </InputGroup>

        <InputGroup
          step="4"
          title="受信感度と実測補正を入れる"
          description="受信感度は合格ラインです。現地測定がある場合は、RSSI/RSRPから得た差分を実測補正値として入れます。"
          tone="amber"
        >
          <LinkBudgetNumberField
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

          <LinkBudgetNumberField
            id="calibrationOffsetDb"
            label="実測補正値"
            unit="dB"
            description={
              input.propagationModel === "iot_hata_calibrated"
                ? "IoT実測補正Hataのアンカー補正とは別に加える補正です。同じ実測差分を二重に入れないよう注意してください。"
                : "現地RSSI/RSRP測定と計算値の差分です。実測が弱い場合はマイナス、強い場合はプラスで入力します。"
            }
            tooltip={
              input.propagationModel === "iot_hata_calibrated"
                ? "IoT実測補正Hataモードでは、実測受信電力から基準モデルとの差分をすでに推定します。この欄は別要因の追加補正だけに使います。"
                : "未測定の場合は0dBのままです。低高度IoT通信では現地測定で補正することを推奨します。"
            }
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
