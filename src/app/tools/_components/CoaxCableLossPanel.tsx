"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/Card";
import { Callout } from "@/components/Callout";
import { Field } from "@/components/Field";
import { MetricCard } from "@/components/MetricCard";
import { MobileResultBar } from "@/components/MobileResultBar";
import { ResultBar } from "@/components/ResultBar";
import { Tooltip } from "@/components/Tooltip";
import { cableAssemblies, referenceCables } from "@/data/coaxCables";
import { calculateEirp } from "@/lib/rf/antenna";
import { cableAssemblyLoss, interpolateCableLoss } from "@/lib/rf/coax";
import { formatNumber } from "@/lib/rf/format";
import { CableLossCurveDiagram } from "./CableLossCurveDiagram";
import { FormulaExplanationCard } from "./FormulaExplanationCard";

export function CoaxCableLossPanel() {
  const [cableIndex, setCableIndex] = useState(0);
  const [frequencyMHz, setFrequencyMHz] = useState(2400);
  const [quantity, setQuantity] = useState(1);
  const [txPowerDbm, setTxPowerDbm] = useState(20);
  const [antennaGainDbi, setAntennaGainDbi] = useState(2.15);

  const cable = cableAssemblies[cableIndex] ?? cableAssemblies[0];

  const result = useMemo(() => {
    try {
      return cableAssemblyLoss(cable.points, frequencyMHz, quantity);
    } catch {
      return null;
    }
  }, [cable.points, frequencyMHz, quantity]);

  const eirp = result
    ? calculateEirp({
        txPowerDbm,
        antennaGainDbi,
        cableLossDb: result.totalDb
      })
    : null;
  const primary = {
    label: "合計損失",
    value: result ? formatNumber(result.totalDb, 2) : "—",
    unit: "dB"
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[5fr_4fr]">
      <Card as="section" padding="lg" className="flex flex-col">
      <h2 className="text-lg font-bold text-slate-950">入力条件</h2>

      <div className="mt-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label htmlFor="cablePart" className="text-sm font-semibold text-slate-950">
            品番
          </label>
          <Tooltip term="品番">
            使う同軸ケーブルの品番を選択します。各選択肢は変換・延長用の標準品で、括弧内の「@2GHz ≈ ○○dB」は2GHz時の1本あたり実測挿入損失の目安（数値が小さいほど低損失）。003B / 015A / 016A は約0.4dBの低損失系、004A / 013A / 017A / 018A は数dBの延長系です。長尺・高周波の用途では損失の大きい品番に注意し、運用する周波数帯で比較してください。
          </Tooltip>
        </div>
        <select
          id="cablePart"
          value={cableIndex}
          className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-950 focus:border-staf focus:outline-none focus:ring-2 focus:ring-staf/40"
          onChange={(event) => setCableIndex(Number(event.target.value))}
        >
          {cableAssemblies.map((item, index) => (
            <option key={item.partNumber} value={index}>
              {item.partNumber}（{item.description}・@2GHz ≈ {formatNumber(interpolateCableLoss(item.points, 2000), 2)}dB）
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Field
          id="cableFreq"
          label="周波数"
          unit="MHz"
          help="損失を求めたい運用周波数をMHzで入力します。実測点は500〜8000MHzで、範囲外は√f外挿（最終測定周波数の2倍を上限）の参考値です。代表例: Wi-Fi 2.4GHz帯 → 2400、5GHz帯 → 5200。高周波ほど損失は増えます。"
          min={1}
          step={10}
          value={frequencyMHz}
          onChange={setFrequencyMHz}
          error={result ? undefined : "周波数は0より大きい値で入力してください。"}
          emptyBehavior="preserve"
        />
        <Field
          id="cableQty"
          label="本数（直列に繋ぐ数）"
          help="同じ品番を直列に何本つなぐかを整数（1以上）で入力します。合計損失 ＝ 1本あたり × 本数。延長や中継で複数本使う場合に本数分の損失が加算されます。通常は1です。"
          min={1}
          step={1}
          value={quantity}
          onChange={setQuantity}
          error={result ? undefined : "本数は1以上で入力してください。"}
          emptyBehavior="preserve"
        />
      </div>

      {result ? (
        <>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <MetricCard
              label="1本あたり損失"
              value={formatNumber(result.perPieceDb, 2)}
              unit="dB"
              hint="選択品番のケーブル1本を、指定周波数で通したときの挿入損失（dB）。実測値を周波数で補間した目安で、個体差・コネクタ・曲げ・温度で変動します。グラフの黒点と同じ値です。"
            />
            <MetricCard
              label="アンテナに残る電力"
              value={formatNumber(result.powerRemainingPercent, 0)}
              unit="%"
              hint="合計損失を電力比に直した残存率 ＝ 10^(−合計損失 / 10) × 100。ケーブルで失われずアンテナへ届く割合（%）です。例: 3dB → 約50%、6dB → 約25%。"
            />
          </div>

          {result.extrapolated ? (
            <Callout tone="caution" size="sm" className="mt-2">
              <p className="text-xs leading-relaxed">測定範囲外のため√f外挿（上限あり）</p>
            </Callout>
          ) : null}

          {eirp ? (
            <div className="mt-5 rounded-lg border border-staf/20 bg-staf-light p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-slate-950">
                    ケーブル後EIRP
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600">
                    送信機出力、ケーブル損失、アンテナ利得をつないで、実際の実効放射電力を確認します。
                  </p>
                </div>
                <Tooltip term="ケーブル後EIRP">
                  EIRP = 送信電力 + アンテナ利得 - ケーブル損失。ケーブルが長い/高周波/本数が多いほど、アンテナ利得を食いつぶします。
                </Tooltip>
              </div>
              <div className="mt-3 grid gap-4 md:grid-cols-2">
                <Field
                  id="coaxTxPower"
                  label="送信機出力"
                  unit="dBm"
                  value={txPowerDbm}
                  step={0.5}
                  emptyBehavior="preserve"
                  onChange={setTxPowerDbm}
                />
                <Field
                  id="coaxAntennaGain"
                  label="アンテナ利得"
                  unit="dBi"
                  value={antennaGainDbi}
                  step={0.1}
                  emptyBehavior="preserve"
                  onChange={setAntennaGainDbi}
                />
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <MetricCard
                  label="アンテナ端子電力"
                  value={formatNumber(eirp.antennaInputDbm, 1)}
                  unit="dBm"
                  size="sm"
                  sub={`送信機から ${formatNumber(result.totalDb, 2)} dB 減`}
                />
                <MetricCard
                  label="EIRP"
                  value={formatNumber(eirp.eirpDbm, 1)}
                  unit="dBm"
                  size="sm"
                  sub={`${formatNumber(eirp.eirpW, 3)} W`}
                />
                <MetricCard
                  label="ERP"
                  value={formatNumber(eirp.erpDbm, 1)}
                  unit="dBm"
                  size="sm"
                  sub={`${formatNumber(eirp.erpW, 3)} W`}
                />
              </div>
            </div>
          ) : null}

          <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-sm font-semibold text-slate-950">使い方チュートリアル</h3>
            <div className="mt-3 grid gap-4 md:grid-cols-2">
              <ol className="space-y-2 text-sm leading-relaxed text-slate-600">
                <li>
                  <span className="font-semibold text-staf-dark">1.</span> 使う品番を選び、運用周波数をMHzで入力します。
                </li>
                <li>
                  <span className="font-semibold text-staf-dark">2.</span> 直列に入る本数を合わせ、合計損失と残る電力%を確認します。
                </li>
                <li>
                  <span className="font-semibold text-staf-dark">3.</span> 送信機出力とアンテナ利得を入れ、ケーブル後EIRPまで見て設置可否を判断します。
                </li>
              </ol>
              <dl className="grid gap-2 text-xs leading-relaxed text-slate-600">
                <div>
                  <dt className="font-semibold text-slate-900">挿入損失</dt>
                  <dd>ケーブルやコネクタを通ることで失われる電力です。dBで足し算できます。</dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-900">残る電力%</dt>
                  <dd>損失を線形の割合に戻した値です。3dBで約50%、6dBで約25%が残ります。</dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-900">ケーブル後EIRP</dt>
                  <dd>送信機出力からケーブル損失を引き、アンテナ利得を足した実効放射電力です。</dd>
                </div>
              </dl>
            </div>
          </div>
        </>
      ) : null}

      <div className="mt-5">
        <FormulaExplanationCard
          title="損失の見方を見る"
          formula={"合計損失[dB] = 1本あたり損失（実測の補間値） × 本数\n残る電力[%] = 10^(-損失/10) × 100"}
          showColumnLink={false}
        >
          <p>
            数値はスタッフ標準品の実測挿入損失（S12, 100〜9000MHz）を、指定周波数で補間したものです。高周波ほど損失は増えます。3dBで電力は半分、6dBで1/4になります。複数本を直列に繋ぐ場合は本数を入れてください。実測値ですが、個体差・コネクタ品質・曲げ・温度で多少変わる目安です。
          </p>
        </FormulaExplanationCard>
      </div>
      </Card>
      <div id="coax-primary-result" className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        <ResultBar primary={primary} />
        {result ? (
          <CableLossCurveDiagram
            partNumber={cable.partNumber}
            points={cable.points}
            frequencyMHz={frequencyMHz}
            currentLossDb={result.perPieceDb}
            quantity={quantity}
            referenceCables={referenceCables}
          />
        ) : null}
      </div>
      </div>
      <MobileResultBar primary={primary} targetId="coax-primary-result" />
    </div>
  );
}
