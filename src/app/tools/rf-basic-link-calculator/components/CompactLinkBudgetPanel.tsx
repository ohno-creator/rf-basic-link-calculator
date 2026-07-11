"use client";

import type { ReactNode } from "react";
import { NumberInput } from "@/components/NumberField";
import {
  getPropagationAreaOption,
  linkTypeOptions,
  propagationAreaOptions,
  propagationModelOptions
} from "@/data/linkBudgetOptions";
import { wirelessSystemPresets } from "@/data/wirelessSystemPresets";
import { calculateNearTerminalLossDb, type DistanceUnit, type LinkBudgetInput } from "@/lib/rf/linkBudget";
import type { LinkBudgetErrorMessages } from "@/lib/linkBudgetErrorMessages";
import { isHataFamily } from "./linkBudgetPanelShared";

type Props = {
  input: LinkBudgetInput;
  errors: LinkBudgetErrorMessages;
  onChange: (input: LinkBudgetInput) => void;
};

type NumberFieldProps = {
  id: keyof LinkBudgetInput;
  label: string;
  unit: string;
  value: number;
  min: number;
  max: number;
  step: number;
  error?: string;
  onChange: (value: number) => void;
  unitSelect?: { value: DistanceUnit; onChange: (unit: DistanceUnit) => void };
};

const selectClass = "mt-1 h-9 w-full min-w-0 rounded-md border border-slate-300 bg-white px-2 text-sm font-semibold text-slate-900 outline-none focus:border-staf focus:ring-2 focus:ring-staf/30";

function Group({ title, summary, children }: { title: string; summary: string; children: ReactNode }) {
  return (
    <details open className="group border-b border-slate-200 last:border-b-0">
      <summary className="flex cursor-pointer items-center justify-between gap-3 px-3 py-2.5 hover:bg-slate-50">
        <span className="text-sm font-bold text-slate-900">{title}</span>
        <span className="truncate text-xs text-slate-500">{summary}</span>
      </summary>
      <div className="grid grid-cols-2 gap-x-3 gap-y-2.5 border-t border-slate-100 bg-slate-50/50 p-3">{children}</div>
    </details>
  );
}

function SelectField({ id, label, value, onChange, children, wide = false }: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <label className={wide ? "col-span-2 min-w-0" : "min-w-0"} htmlFor={id}>
      <span className="block truncate text-[11px] font-semibold text-slate-600">{label}</span>
      <select id={id} value={value} className={selectClass} onChange={(event) => onChange(event.target.value)}>{children}</select>
    </label>
  );
}

function LiveSlider({ id, label, valueLabel, value, min, max, step, onChange }: {
  id: string;
  label: string;
  valueLabel: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="min-w-0 rounded-md border border-sky-100 bg-white px-2.5 py-2" htmlFor={id}>
      <span className="flex items-center justify-between gap-2">
        <span className="truncate text-[11px] font-semibold text-slate-600">{label}</span>
        <span className="shrink-0 text-xs font-bold tabular-nums text-staf-dark">{valueLabel}</span>
      </span>
      <input
        id={id}
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-1 block h-4 w-full cursor-pointer"
      />
    </label>
  );
}

function CompactNumberField({ id, label, unit, value, min, max, step, error, onChange, unitSelect }: NumberFieldProps) {
  return (
    <label className="min-w-0" htmlFor={id}>
      <span className="block truncate text-[11px] font-semibold text-slate-600" title={label}>{label}</span>
      <span className={`mt-1 flex h-9 overflow-hidden rounded-md border bg-white focus-within:border-staf focus-within:ring-2 focus-within:ring-staf/30 ${error ? "border-rose-400" : "border-slate-300"}`}>
        <NumberInput
          id={id}
          value={value}
          min={min}
          max={max}
          step={step}
          emptyBehavior="invalid"
          ariaInvalid={Boolean(error)}
          onChange={onChange}
          className="min-w-0 flex-1 px-2 text-sm font-bold tabular-nums text-slate-950 outline-none"
        />
        {unitSelect ? (
          <select
            value={unitSelect.value}
            aria-label={`${label}の単位`}
            onChange={(event) => unitSelect.onChange(event.target.value as DistanceUnit)}
            className="w-12 border-l border-slate-200 bg-slate-50 px-1 text-xs font-semibold text-slate-600 outline-none"
          >
            <option value="m">m</option>
            <option value="km">km</option>
          </select>
        ) : (
          <span className="flex min-w-12 items-center justify-center border-l border-slate-200 bg-slate-50 px-1.5 text-[11px] font-semibold text-slate-500">{unit}</span>
        )}
      </span>
      {error ? <span className="mt-0.5 block truncate text-[10px] font-medium text-rose-700">{error}</span> : null}
    </label>
  );
}

export function CompactLinkBudgetPanel({ input, errors, onChange }: Props) {
  const update = <K extends keyof LinkBudgetInput>(key: K, value: LinkBudgetInput[K]) => onChange({ ...input, [key]: value });
  const nearLossDb = calculateNearTerminalLossDb(input);
  const distanceMin = input.distanceUnit === "m" ? 1 : 0.01;
  const distanceMax = input.distanceUnit === "m" ? 10000 : 20;

  function changeDistanceUnit(nextUnit: DistanceUnit) {
    const converted = input.distanceUnit === nextUnit ? input.distance : nextUnit === "km" ? input.distance / 1000 : input.distance * 1000;
    onChange({ ...input, distanceUnit: nextUnit, distance: Number(converted.toFixed(3)) });
  }

  return (
    <section id="compact-input-panel" aria-label="クイック調整" className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card">
      <div className="border-b border-slate-200 bg-slate-950 px-4 py-3 text-white">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-sky-300">Quick controls</p>
            <h2 className="mt-0.5 text-lg font-bold">クイック調整</h2>
          </div>
          <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold text-slate-200">即時反映</span>
        </div>
        <p className="mt-2 truncate text-xs text-slate-300">{input.system} ・ {input.frequencyMHz.toLocaleString("ja-JP")} MHz ・ {input.distance.toLocaleString("ja-JP")} {input.distanceUnit}</p>
      </div>

      <section aria-label="ライブ調整" className="border-b border-sky-200 bg-sky-50/80 p-3">
        <div className="mb-2 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-950">ライブ調整</h3>
            <p className="text-[11px] text-slate-500">動かすと判定と滝グラフへ即時反映</p>
          </div>
          <span className="rounded-full bg-sky-100 px-2 py-1 text-[10px] font-bold text-sky-800">主要4項目</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <LiveSlider
            id="live-distance"
            label="通信距離"
            valueLabel={`${input.distance.toLocaleString("ja-JP")} ${input.distanceUnit}`}
            value={input.distance}
            min={distanceMin}
            max={distanceMax}
            step={input.distanceUnit === "m" ? 1 : 0.01}
            onChange={(value) => update("distance", value)}
          />
          <LiveSlider
            id="live-tx-power"
            label="送信電力"
            valueLabel={`${input.txPowerDbm} dBm`}
            value={input.txPowerDbm}
            min={-20}
            max={30}
            step={0.5}
            onChange={(value) => update("txPowerDbm", value)}
          />
          <LiveSlider
            id="live-environment-loss"
            label="環境損失"
            valueLabel={`${input.environmentLossDb} dB`}
            value={input.environmentLossDb}
            min={0}
            max={40}
            step={0.5}
            onChange={(value) => update("environmentLossDb", value)}
          />
          <LiveSlider
            id="live-sensitivity"
            label="受信感度"
            valueLabel={`${input.receiverSensitivityDbm} dBm`}
            value={input.receiverSensitivityDbm}
            min={-130}
            max={-50}
            step={1}
            onChange={(value) => update("receiverSensitivityDbm", value)}
          />
        </div>
      </section>

      <Group title="基本条件" summary={`${input.frequencyMHz.toLocaleString("ja-JP")} MHz / ${input.distance.toLocaleString("ja-JP")} ${input.distanceUnit}`}>
        <SelectField id="system" label="通信方式" value={input.system} onChange={(value) => update("system", value)}>
          {wirelessSystemPresets.map((system) => <option key={system} value={system}>{system}</option>)}
        </SelectField>
        <SelectField id="linkType" label="通信形態" value={input.linkType} onChange={(value) => update("linkType", value as LinkBudgetInput["linkType"])}>
          {linkTypeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </SelectField>
        <SelectField id="propagationModel" label="伝搬モデル" value={input.propagationModel} onChange={(value) => update("propagationModel", value as LinkBudgetInput["propagationModel"])} wide>
          {propagationModelOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </SelectField>
        {isHataFamily(input.propagationModel) ? (
          <SelectField id="propagationArea" label="エリア" value={input.propagationArea} onChange={(value) => update("propagationArea", value as LinkBudgetInput["propagationArea"])}>
            {propagationAreaOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </SelectField>
        ) : null}
        {input.propagationModel === "log_distance" ? <CompactNumberField id="pathLossExponent" label="距離損失指数" unit="n" value={input.pathLossExponent} min={1} max={6} step={0.1} error={errors.pathLossExponent} onChange={(value) => update("pathLossExponent", value)} /> : null}
        <CompactNumberField id="frequencyMHz" label="周波数" unit="MHz" value={input.frequencyMHz} min={100} max={6000} step={1} error={errors.frequencyMHz} onChange={(value) => update("frequencyMHz", value)} />
        <CompactNumberField id="distance" label="通信距離" unit={input.distanceUnit} value={input.distance} min={distanceMin} max={distanceMax} step={input.distanceUnit === "m" ? 1 : 0.01} error={errors.distance} onChange={(value) => update("distance", value)} unitSelect={{ value: input.distanceUnit, onChange: changeDistanceUnit }} />
      </Group>

      <Group title="送受信・アンテナ" summary={`送信 ${input.txPowerDbm} dBm / 感度 ${input.receiverSensitivityDbm} dBm`}>
        <CompactNumberField id="txPowerDbm" label="送信電力" unit="dBm" value={input.txPowerDbm} min={-20} max={30} step={0.5} error={errors.txPowerDbm} onChange={(value) => update("txPowerDbm", value)} />
        <CompactNumberField id="receiverSensitivityDbm" label="受信感度" unit="dBm" value={input.receiverSensitivityDbm} min={-130} max={-50} step={1} error={errors.receiverSensitivityDbm} onChange={(value) => update("receiverSensitivityDbm", value)} />
        <CompactNumberField id="txAntennaGainDbi" label="送信アンテナ利得" unit="dBi" value={input.txAntennaGainDbi} min={-10} max={10} step={0.5} error={errors.txAntennaGainDbi} onChange={(value) => update("txAntennaGainDbi", value)} />
        <CompactNumberField id="rxAntennaGainDbi" label="受信アンテナ利得" unit="dBi" value={input.rxAntennaGainDbi} min={-10} max={15} step={0.5} error={errors.rxAntennaGainDbi} onChange={(value) => update("rxAntennaGainDbi", value)} />
        <CompactNumberField id="txAntennaHeightM" label="送信アンテナ高" unit="m" value={input.txAntennaHeightM} min={0.1} max={200} step={0.1} error={errors.txAntennaHeightM} onChange={(value) => update("txAntennaHeightM", value)} />
        <CompactNumberField id="rxAntennaHeightM" label="受信アンテナ高" unit="m" value={input.rxAntennaHeightM} min={0.1} max={50} step={0.1} error={errors.rxAntennaHeightM} onChange={(value) => update("rxAntennaHeightM", value)} />
      </Group>

      <Group title="追加損失・補正" summary={`環境 ${input.environmentLossDb} dB / 近傍 ${nearLossDb.toFixed(1)} dB`}>
        <CompactNumberField id="cableLossDb" label="ケーブル損失" unit="dB" value={input.cableLossDb} min={0} max={10} step={0.1} error={errors.cableLossDb} onChange={(value) => update("cableLossDb", value)} />
        <CompactNumberField id="environmentLossDb" label="環境損失" unit="dB" value={input.environmentLossDb} min={0} max={40} step={0.5} error={errors.environmentLossDb} onChange={(value) => update("environmentLossDb", value)} />
        <CompactNumberField id="groundProximityLossDb" label="地面近接損失" unit="dB" value={input.groundProximityLossDb} min={0} max={30} step={0.5} error={errors.groundProximityLossDb} onChange={(value) => update("groundProximityLossDb", value)} />
        <CompactNumberField id="enclosureLossDb" label="筐体損失" unit="dB" value={input.enclosureLossDb} min={0} max={40} step={0.5} error={errors.enclosureLossDb} onChange={(value) => update("enclosureLossDb", value)} />
        <CompactNumberField id="polarizationMismatchLossDb" label="偏波ミスマッチ" unit="dB" value={input.polarizationMismatchLossDb} min={0} max={30} step={0.5} error={errors.polarizationMismatchLossDb} onChange={(value) => update("polarizationMismatchLossDb", value)} />
        <CompactNumberField id="vehicleBodyObstructionLossDb" label="車両・人体遮蔽" unit="dB" value={input.vehicleBodyObstructionLossDb} min={0} max={40} step={0.5} error={errors.vehicleBodyObstructionLossDb} onChange={(value) => update("vehicleBodyObstructionLossDb", value)} />
        <CompactNumberField id="installationMarginDb" label="設置ばらつき" unit="dB" value={input.installationMarginDb} min={0} max={30} step={0.5} error={errors.installationMarginDb} onChange={(value) => update("installationMarginDb", value)} />
        <CompactNumberField id="calibrationOffsetDb" label="実測補正値" unit="dB" value={input.calibrationOffsetDb} min={-40} max={40} step={0.5} error={errors.calibrationOffsetDb} onChange={(value) => update("calibrationOffsetDb", value)} />
      </Group>

      {input.propagationModel === "iot_hata_calibrated" ? (
        <Group title="IoT実測校正" summary={`${getPropagationAreaOption(input.propagationArea).label} / 実測 ${input.iotMeasuredReceivedPowerDbm} dBm`}>
          <CompactNumberField id="iotCalibrationDistance" label="実測アンカー距離" unit={input.iotCalibrationDistanceUnit} value={input.iotCalibrationDistance} min={input.iotCalibrationDistanceUnit === "m" ? 1 : 0.001} max={10000} step={input.iotCalibrationDistanceUnit === "m" ? 1 : 0.01} error={errors.iotCalibrationDistance} onChange={(value) => update("iotCalibrationDistance", value)} unitSelect={{ value: input.iotCalibrationDistanceUnit, onChange: (value) => update("iotCalibrationDistanceUnit", value) }} />
          <CompactNumberField id="iotMeasuredReceivedPowerDbm" label="実測受信電力" unit="dBm" value={input.iotMeasuredReceivedPowerDbm} min={-180} max={0} step={0.5} error={errors.iotMeasuredReceivedPowerDbm} onChange={(value) => update("iotMeasuredReceivedPowerDbm", value)} />
          <CompactNumberField id="iotSlopeCorrectionDbPerDecade" label="距離勾配補正" unit="dB/dec" value={input.iotSlopeCorrectionDbPerDecade} min={-40} max={40} step={0.5} error={errors.iotSlopeCorrectionDbPerDecade} onChange={(value) => update("iotSlopeCorrectionDbPerDecade", value)} />
        </Group>
      ) : null}
    </section>
  );
}
