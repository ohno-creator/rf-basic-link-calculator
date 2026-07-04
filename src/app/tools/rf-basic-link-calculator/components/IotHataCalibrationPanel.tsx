"use client";

import type { LinkBudgetErrorMessages } from "@/lib/linkBudgetErrorMessages";
import { Field } from "@/components/Field";
import { normalizeDistanceKm, type LinkBudgetInput } from "@/lib/rf/linkBudget";

export function IotHataCalibrationPanel({
  input,
  errors,
  onChange,
  update
}: {
  input: LinkBudgetInput;
  errors: LinkBudgetErrorMessages;
  onChange: (input: LinkBudgetInput) => void;
  update: <K extends keyof LinkBudgetInput>(key: K, value: LinkBudgetInput[K]) => void;
}) {
  if (input.propagationModel !== "iot_hata_calibrated") {
    return null;
  }

  const currentDistanceKm = normalizeDistanceKm(input.distance, input.distanceUnit);
  const anchorDistanceKm = normalizeDistanceKm(input.iotCalibrationDistance, input.iotCalibrationDistanceUnit);
  const extrapolationRatio =
    currentDistanceKm > 0 && anchorDistanceKm > 0
      ? Math.max(currentDistanceKm, anchorDistanceKm) / Math.min(currentDistanceKm, anchorDistanceKm)
      : 0;

  return (
    <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-4">
      <p className="text-sm font-semibold text-indigo-950">IoT実測補正Hataモードの校正点</p>
      <p className="mt-1 text-xs leading-relaxed text-indigo-900">
        奥村・秦/COST231-Hataを基準値として、現地で測ったRSSIまたはRSRPからモデルのずれを補正します。
        測定時と同じ送信電力、アンテナ利得、環境損失、端末近傍損失を入力してください。
      </p>
      {input.calibrationOffsetDb !== 0 ? (
        <div className="mt-3 rounded-md border border-amber-300 bg-amber-50 p-4 text-xs leading-relaxed text-amber-950">
          <p className="font-semibold">実測補正値との二重計上を確認してください</p>
          <p className="mt-1">
            このモードは実測受信電力からHata基準との差分を推定します。ステップ4の実測補正値
            {input.calibrationOffsetDb.toFixed(1)}dB は、アンカー補正とは別の追加補正だけにしてください。
          </p>
        </div>
      ) : null}
      {extrapolationRatio >= 10 ? (
        <div className="mt-3 rounded-md border border-amber-300 bg-amber-50 p-4 text-xs leading-relaxed text-amber-950">
          <p className="font-semibold">アンカー距離から大きく外挿しています</p>
          <p className="mt-1">
            現在の通信距離と実測アンカー距離が約{extrapolationRatio.toFixed(1)}倍離れています。
            1点補正だけでは距離勾配を判断しにくいため、複数地点のRSSI/RSRPで確認してください。
          </p>
        </div>
      ) : null}

      <div className="mt-4 grid gap-4">
        <div className="rounded-lg border border-indigo-100 bg-white p-4">
          <label htmlFor="iotCalibrationDistance" className="text-sm font-semibold text-slate-950">
            実測アンカー距離
          </label>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            RSSI/RSRPを取得した測定点の距離です。現在の評価距離と大きく離れる場合は外挿になります。
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_120px]">
            <input
              id="iotCalibrationDistance"
              type="number"
              min={input.iotCalibrationDistanceUnit === "m" ? 1 : 0.001}
              step={input.iotCalibrationDistanceUnit === "m" ? 1 : 0.01}
              value={Number.isFinite(input.iotCalibrationDistance) ? input.iotCalibrationDistance : ""}
              className="h-11 rounded-md border border-slate-300 px-3 text-base font-semibold text-slate-950 shadow-card focus:border-staf focus:outline-none focus:ring-2 focus:ring-staf/40"
              onChange={(event) =>
                update("iotCalibrationDistance", event.target.value === "" ? Number.NaN : Number(event.target.value))
              }
              aria-invalid={Boolean(errors.iotCalibrationDistance)}
            />
            <select
              value={input.iotCalibrationDistanceUnit}
              className="h-11 rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-950 focus:border-staf focus:outline-none focus:ring-2 focus:ring-staf/40"
              onChange={(event) => {
                const nextUnit = event.target.value as LinkBudgetInput["iotCalibrationDistanceUnit"];
                const converted =
                  input.iotCalibrationDistanceUnit === nextUnit
                    ? input.iotCalibrationDistance
                    : nextUnit === "km"
                      ? input.iotCalibrationDistance / 1000
                      : input.iotCalibrationDistance * 1000;
                onChange({
                  ...input,
                  iotCalibrationDistanceUnit: nextUnit,
                  iotCalibrationDistance: Number(converted.toFixed(3))
                });
              }}
            >
              <option value="m">m</option>
              <option value="km">km</option>
            </select>
          </div>
          {errors.iotCalibrationDistance ? (
            <p className="mt-2 text-sm font-medium text-rose-700">{errors.iotCalibrationDistance}</p>
          ) : null}
        </div>

        <Field
          id="iotMeasuredReceivedPowerDbm"
          label="実測受信電力"
          unit="dBm"
          help="アンカー距離で取得したRSSIまたはRSRPです。値が小さいほどHata基準から大きな追加損失として校正されます。RSSIとRSRPは意味が異なります。セルラーではRSRP、LPWAではRSSIなど、実機で継続的に取得できる同じ指標で比較してください。（推奨レンジ: -150--20dBm）"
          example="-80 / -95 / -110"
          min={-150}
          max={-20}
          step={0.5}
          value={input.iotMeasuredReceivedPowerDbm}
          error={errors.iotMeasuredReceivedPowerDbm}
          emptyBehavior="invalid"
          onChange={(value) => update("iotMeasuredReceivedPowerDbm", value)}
        />

        <Field
          id="iotSlopeCorrectionDbPerDecade"
          label="距離勾配補正"
          unit="dB/decade"
          help="距離が10倍になったときにHata基準へ加える補正です。1点実測のみなら0、複数点で遠距離側が悪い場合は正の値を入れます。近年のIoT測定研究では、現地データに合わせた距離勾配や環境特徴量の補正が有効です。単一点だけでは勾配は推定できないため、通常は0から始めます。（推奨レンジ: -40-40dB/decade）"
          example="0 / 5 / 10"
          min={-40}
          max={40}
          step={0.5}
          value={input.iotSlopeCorrectionDbPerDecade}
          error={errors.iotSlopeCorrectionDbPerDecade}
          emptyBehavior="invalid"
          onChange={(value) => update("iotSlopeCorrectionDbPerDecade", value)}
        />
      </div>

      <div className="mt-4 rounded-md border border-indigo-200 bg-white/80 p-4 text-xs leading-relaxed text-indigo-950">
        <p className="font-semibold">根拠</p>
        <p className="mt-1">
          都市LoRaの大規模測定では、Okumura系やLog-distance系は有効な候補ですが、現地データで係数を求めることが重要とされています。
          屋内LoRaWAN/NB-IoTの研究では、距離だけでは説明できない損失があり、構造物、環境、実測補正を組み込むと誤差が下がることが示されています。
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <a
            href="https://arxiv.org/abs/2109.07768"
            className="rounded-full border border-indigo-200 px-2.5 py-1 font-semibold text-indigo-700 transition hover:bg-indigo-100"
          >
            Urban LoRa大規模測定
          </a>
          <a
            href="https://arxiv.org/abs/2505.06375"
            className="rounded-full border border-indigo-200 px-2.5 py-1 font-semibold text-indigo-700 transition hover:bg-indigo-100"
          >
            LoRaWAN環境要因データ
          </a>
          <a
            href="https://arxiv.org/abs/2006.00880"
            className="rounded-full border border-indigo-200 px-2.5 py-1 font-semibold text-indigo-700 transition hover:bg-indigo-100"
          >
            NB-IoT深部屋内評価
          </a>
        </div>
      </div>
    </div>
  );
}
