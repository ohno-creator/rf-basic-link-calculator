"use client";

import { useMemo, useState } from "react";
import { Callout } from "@/components/Callout";
import { Card } from "@/components/Card";
import { Field } from "@/components/Field";
import { MetricCard } from "@/components/MetricCard";
import { MobileResultBar } from "@/components/MobileResultBar";
import { ResultBar } from "@/components/ResultBar";
import { calculateActiveGnssCn0, calculateGnssCn0, type GnssCn0Quality } from "@/lib/rf/gnssCn0";
import { formatNumber } from "@/lib/rf/format";
import type { LinkJudgementLevel } from "@/lib/rf/judgement";
import { FormulaExplanationCard } from "./FormulaExplanationCard";

const qualityMeta: Record<GnssCn0Quality, { label: string; level: LinkJudgementLevel }> = {
  good: { label: "C/N0目安：良好", level: "excellent" },
  usable: { label: "C/N0目安：使用可", level: "caution" },
  difficult: { label: "C/N0目安：厳しい", level: "poor" }
};

export function GnssCn0Panel() {
  const [receivedPowerDbm, setReceivedPowerDbm] = useState(-130);
  const [antennaGainDbi, setAntennaGainDbi] = useState(3);
  const [cableLossDb, setCableLossDb] = useState(3);
  const [receiverNoiseFigureDb, setReceiverNoiseFigureDb] = useState(4);
  const [lnaGainDb, setLnaGainDb] = useState(20);
  const [lnaNoiseFigureDb, setLnaNoiseFigureDb] = useState(1.5);

  const results = useMemo(() => {
    try {
      return {
        passive: calculateGnssCn0({
          receivedPowerDbm,
          antennaGainDbi,
          preLnaLossDb: cableLossDb,
          receiverNoiseFigureDb
        }),
        active: calculateActiveGnssCn0({
          receivedPowerDbm,
          antennaGainDbi,
          preLnaLossDb: 0,
          postLnaLossDb: cableLossDb,
          lnaGainDb,
          lnaNoiseFigureDb,
          receiverNoiseFigureDb
        })
      };
    } catch {
      return null;
    }
  }, [receivedPowerDbm, antennaGainDbi, cableLossDb, receiverNoiseFigureDb, lnaGainDb, lnaNoiseFigureDb]);

  const judgement = results ? qualityMeta[results.active.quality] : undefined;
  const primary = {
    label: "アクティブ構成 C/N0",
    value: results ? formatNumber(results.active.cn0DbHz, 1) : "—",
    unit: "dB-Hz"
  };

  return (
    <>
      <section className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,4fr)] lg:items-start">
        <Card as="section" padding="lg">
          <h2 className="text-base font-bold text-slate-950">入力条件</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">同じアンテナとケーブルを、パッシブ構成とLNA内蔵構成で比較します。</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field id="gnssReceivedPower" label="受信信号レベル" unit="dBm" value={receivedPowerDbm} step={1} emptyBehavior="invalid" onChange={setReceivedPowerDbm} help="アンテナ利得を加える前のGNSS搬送波レベルです。GPS L1オープンスカイの初期値として−130dBmを置いています。" />
            <Field id="gnssAntennaGain" label="アンテナ利得" unit="dBi" value={antennaGainDbi} step={0.1} emptyBehavior="invalid" onChange={setAntennaGainDbi} help="衛星方向のアンテナ利得です。" />
            <Field id="gnssCableLoss" label="ケーブル損失" unit="dB" value={cableLossDb} min={0} step={0.1} emptyBehavior="invalid" onChange={setCableLossDb} help="パッシブでは受信機前、アクティブではLNA後にある損失として比較します。" />
            <Field id="gnssReceiverNf" label="受信機NF" unit="dB" value={receiverNoiseFigureDb} min={0} step={0.1} emptyBehavior="invalid" onChange={setReceiverNoiseFigureDb} help="GNSS受信機入力段の雑音指数です。" />
            <Field id="gnssLnaGain" label="LNA利得" unit="dB" value={lnaGainDb} min={0} step={1} emptyBehavior="invalid" onChange={setLnaGainDb} help="アクティブアンテナ内LNAの利得です。後段雑音をこの利得で抑えます。" />
            <Field id="gnssLnaNf" label="LNA NF" unit="dB" value={lnaNoiseFigureDb} min={0} step={0.1} emptyBehavior="invalid" onChange={setLnaNoiseFigureDb} help="アンテナ直後のLNA雑音指数です。小さいほどC/N0が良くなります。" />
          </div>
        </Card>

        <div id="gnss-primary-result" className="space-y-4 lg:sticky lg:top-20">
          <ResultBar primary={primary} judgement={judgement} />
          {results ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <MetricCard label="パッシブ C/N0" value={formatNumber(results.passive.cn0DbHz, 1)} unit="dB-Hz" tone={results.passive.quality === "good" ? "success" : results.passive.quality === "usable" ? "caution" : "danger"} />
              <MetricCard label="アクティブ C/N0" value={formatNumber(results.active.cn0DbHz, 1)} unit="dB-Hz" tone={results.active.quality === "good" ? "success" : results.active.quality === "usable" ? "caution" : "danger"} />
              <MetricCard label="アクティブ構成 NFsys" value={formatNumber(results.active.systemNoiseFigureDb, 2)} unit="dB" />
              <MetricCard label="アクティブ化の差" value={formatNumber(results.active.cn0DbHz - results.passive.cn0DbHz, 1)} unit="dB" />
            </div>
          ) : (
            <Callout tone="danger">損失・NF・LNA利得は0以上の有限値を入力してください。</Callout>
          )}
          <Callout tone="info" title="判定目安">
            40dB-Hz超は良好、35〜40dB-Hzは使用可、35dB-Hz未満は厳しい目安です。実機のマルチパス・遮蔽は別途評価します。
          </Callout>
        </div>
      </section>

      {results ? (
        <Card as="figure" padding="lg" className="mt-6">
          <figcaption className="text-base font-bold text-slate-950">LNAを置く位置と後段雑音</figcaption>
          <div className="mt-4 grid items-center gap-3 md:grid-cols-[1fr_auto_1fr_auto_1fr]">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-center"><p className="text-xs font-semibold text-slate-500">アンテナ</p><p className="mt-1 font-bold text-slate-950">G {formatNumber(antennaGainDbi, 1)}dBi</p></div>
            <span className="text-center text-xl text-slate-400">→</span>
            <div className="rounded-lg border border-staf/30 bg-staf-light p-4 text-center"><p className="text-xs font-semibold text-staf-dark">LNA</p><p className="mt-1 font-bold text-slate-950">+{formatNumber(lnaGainDb, 1)}dB / NF {formatNumber(lnaNoiseFigureDb, 1)}dB</p></div>
            <span className="text-center text-xl text-slate-400">→</span>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-center"><p className="text-xs font-semibold text-slate-500">ケーブル＋受信機</p><p className="mt-1 font-bold text-slate-950">損失 {formatNumber(cableLossDb, 1)}dB</p></div>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">LNAをケーブルより前へ置くと、ケーブルと受信機の雑音寄与はLNA利得で割られます。</p>
        </Card>
      ) : null}

      <div className="mt-6">
        <FormulaExplanationCard title="C/N0とFriis縦続NF" formula={"C/N0 = Pr + Gant − Lpre − (−174 + NFsys)\nFsys = Flna + (Lcable−1)/Glna + (Frx−1)·Lcable/Glna"} showColumnLink={false}>
          <p className="text-sm leading-relaxed text-slate-600">NF計算ではdBを線形雑音因子Fへ変換して縦続し、最後にdBへ戻します。</p>
        </FormulaExplanationCard>
      </div>
      <MobileResultBar primary={primary} judgement={judgement} targetId="gnss-primary-result" />
    </>
  );
}
