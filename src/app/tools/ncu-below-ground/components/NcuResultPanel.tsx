"use client";

import { Callout } from "@/components/Callout";
import { Card, StateCard } from "@/components/Card";
import { HelpHint as FieldHint } from "@/components/HelpHint";
import { AlertTriangle, CheckCircle2, Layers, Target, Wrench } from "lucide-react";
import {
  formatDbRange,
  type DbRange,
  type NcuBelowGroundInput,
  type NcuBelowGroundResult
} from "@/lib/rf/ncuBelowGround";
import { formatSigned, judgementTone, SectionTitle } from "./ncuShared";

function MetricCard({
  label,
  value,
  sub,
  tone = "slate",
  tip
}: {
  label: string;
  value: string;
  sub: string;
  tone?: "slate" | "sky" | "rose" | "emerald";
  tip?: string;
}) {
  const toneClass = {
    slate: "border-slate-200 bg-white text-slate-950",
    sky: "border-sky-200 bg-sky-50 text-sky-950",
    rose: "border-rose-200 bg-rose-50 text-rose-950",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-950"
  }[tone];

  return (
    <div className={`rounded-lg border p-4 ${toneClass}`} title={tip}>
      <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider opacity-70">
        {label}
        {tip ? <FieldHint text={tip} /> : null}
      </p>
      <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>
      <p className="mt-1 text-xs leading-relaxed opacity-80">{sub}</p>
    </div>
  );
}

export function RangeTriplet({
  title,
  range,
  unit,
  higherIsBetter = true
}: {
  title: string;
  range: DbRange;
  unit: string;
  higherIsBetter?: boolean;
}) {
  const optimistic = higherIsBetter ? range.max : range.min;
  const severe = higherIsBetter ? range.min : range.max;

  return (
    <Card padding="md" shadow={false}>
      <p className="text-sm font-bold text-slate-900">{title}</p>
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <StateCard tone="success" padding="sm" className="text-center" title="楽観＝好条件がそろった最良ケース（材質・水分・配置などが有利な側）。ここまで良くなる可能性の上限の目安です。">
          <p className="text-[11px] font-bold text-emerald-700">楽観</p>
          <p className="text-sm font-bold text-emerald-950">{optimistic.toFixed(1)} {unit}</p>
        </StateCard>
        <StateCard tone="info" padding="sm" className="text-center" title="標準＝平均的・代表的な見積もり。まずはこの値で判断し、実測で補正していきます。">
          <p className="text-[11px] font-bold text-sky-700">標準</p>
          <p className="text-sm font-bold text-sky-950">{range.typical.toFixed(1)} {unit}</p>
        </StateCard>
        <StateCard tone="danger" padding="sm" className="text-center" title="厳しめ＝悪条件が重なった最悪ケース（金属蓋・水溜まり・底面配置・駐車車両など）。ここでも成立すれば安心という下限の目安です。">
          <p className="text-[11px] font-bold text-rose-700">厳しめ</p>
          <p className="text-sm font-bold text-rose-950">{severe.toFixed(1)} {unit}</p>
        </StateCard>
      </div>
    </Card>
  );
}

// 標準損失[dB]の大きさで色分け。どの項目が支配的かを一目で分かるようにする。
function lossBarSeverity(typicalDb: number): { bar: string; chip: string; label: string } {
  if (typicalDb >= 18) {
    return { bar: "bg-rose-500", chip: "bg-rose-100 text-rose-700", label: "支配的" };
  }
  if (typicalDb >= 10) {
    return { bar: "bg-orange-500", chip: "bg-orange-100 text-orange-700", label: "大きい" };
  }
  if (typicalDb >= 4) {
    return { bar: "bg-amber-500", chip: "bg-amber-100 text-amber-700", label: "中くらい" };
  }
  return { bar: "bg-emerald-500", chip: "bg-emerald-100 text-emerald-700", label: "小さい" };
}

// 主因ごとの「まず何をすると効くか」の一言。結果パネルと内訳の両方で使う。
const bottleneckHintById: Record<string, string> = {
  cover: "蓋を樹脂・複合材へ替える、または蓋直下・非金属部へアンテナを寄せると効きやすいです。",
  box: "金属BOXは外部アンテナ化を検討し、アンテナを壁・取付金具から離します。",
  depth: "アンテナを地表開口の近くまで引き上げる、または外部アンテナを地上へ出します。",
  moisture: "排水・防水を行い、アンテナを想定水位より高く保ち、乾燥時と雨天後の両方で実測します。",
  antenna: "アンテナを蓋直下・非金属部へ移し、金属から離して整合を確認します。",
  opening: "樹脂窓・開口部・隙間の近くへアンテナを寄せ、地表側への抜け道をつくります。",
  surface: "設置位置をずらし、駐車車両や金属体に覆われにくい場所を選びます。"
};

export function LossBreakdown({ result }: { result: NcuBelowGroundResult }) {
  const items = [...result.breakdown].sort((a, b) => b.range.typical - a.range.typical);
  const max = Math.max(...items.map((item) => item.range.max), 1);

  return (
    <Card as="section">
      <SectionTitle icon={Layers} eyebrow="Loss decomposition" title="BOX・地下まわりの追加損失を分解">
        効いている順に並べています。いちばん上（主因）から現場で潰すと、いちばん少ない手間で通信余裕を稼げます。
      </SectionTitle>

      <div className="space-y-3">
        {items.map((item, index) => {
          const severity = lossBarSeverity(item.range.typical);
          const hint = bottleneckHintById[item.id];
          return (
            <details
              key={item.id}
              title={`${item.label}（${item.valueLabel}）：${item.note}`}
              className="rounded-lg border border-slate-200 bg-slate-50 p-4"
              open={index === 0}
            >
              <summary className="cursor-pointer list-none">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {index === 0 ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-600 px-2 py-0.5 text-[10px] font-bold text-white">
                        <Target aria-hidden="true" className="h-3 w-3" />
                        主因
                      </span>
                    ) : (
                      <span className="inline-flex w-5 justify-center text-xs font-bold text-slate-400">
                        {index + 1}
                      </span>
                    )}
                    <div>
                      <p className="text-sm font-bold text-slate-950">{item.label}</p>
                      <p className="text-xs text-slate-500">{item.valueLabel}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-950">{formatDbRange(item.range)}</p>
                    <span className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${severity.chip}`}>
                      標準 {item.range.typical.toFixed(1)}dB・{severity.label}
                    </span>
                  </div>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white">
                  <div
                    className={`h-full rounded-full ${severity.bar}`}
                    style={{ width: `${Math.max(3, (item.range.typical / max) * 100)}%` }}
                  />
                </div>
              </summary>
              <p className="mt-3 text-xs leading-relaxed text-slate-600">{item.note}</p>
              {hint ? (
                <p className="mt-2 flex items-start gap-1.5 rounded-md bg-white p-2 text-xs leading-relaxed text-slate-600">
                  <Wrench aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-staf-dark" />
                  <span>
                    <span className="font-bold">改善案：</span>
                    {hint}
                  </span>
                </p>
              ) : null}
            </details>
          );
        })}
      </div>
    </Card>
  );
}

export function ResultPanel({ input, result }: { input: NcuBelowGroundInput; result: NcuBelowGroundResult }) {
  const totalFixedLossDb = result.outdoorPathLossDb + input.cableLossDb + input.aboveGroundClutterLossDb;
  const dominant = [...result.breakdown].sort((a, b) => b.range.typical - a.range.typical)[0];
  const dominantHint = bottleneckHintById[dominant.id];

  return (
    <aside className="space-y-4 lg:sticky lg:top-20">
      <section
        data-testid="primary-result"
        className={`rounded-lg border p-4 shadow-card ${judgementTone[result.judgement.level]}`}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold opacity-80">標準条件の判定</p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight">{result.judgement.label}</h2>
          </div>
          {result.judgement.level === "poor" ? (
            <AlertTriangle aria-hidden="true" className="h-7 w-7 shrink-0" />
          ) : (
            <CheckCircle2 aria-hidden="true" className="h-7 w-7 shrink-0" />
          )}
        </div>
        <p className="mt-2 text-xs leading-relaxed">{result.judgement.summary}</p>
      </section>

      <Callout tone="danger" size="md">
        <div className="flex items-center gap-2 text-rose-700">
          <Target aria-hidden="true" className="h-4 w-4" />
          <p className="text-xs font-bold uppercase tracking-wider">いちばん効いている損失（主因）</p>
        </div>
        <p className="mt-1 text-xl font-bold">
          {dominant.label}
          <span className="ml-2 text-base font-bold">標準 {dominant.range.typical.toFixed(1)} dB</span>
        </p>
        <p className="mt-0.5 text-xs leading-relaxed text-rose-900/80">
          {dominant.valueLabel}（{formatDbRange(dominant.range)}）
        </p>
        {dominantHint ? (
          <p className="mt-2 flex items-start gap-1.5 text-xs leading-relaxed text-rose-900">
            <Wrench aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>
              <span className="font-bold">まずここから：</span>
              {dominantHint}
            </span>
          </p>
        ) : null}
      </Callout>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
        <MetricCard
          label="標準リンクマージン"
          tip="リンクマージン＝受信電力 − 受信感度（dB）。通信の『余裕』です。プラスなら届く見込み、0付近はギリギリ、マイナスは不足。一般に数dB〜10dB以上の余裕を確保すると安定します。"
          value={formatSigned(result.linkMarginRangeDb.typical)}
          sub={`楽観 ${formatSigned(result.linkMarginRangeDb.max)} / 厳しめ ${formatSigned(result.linkMarginRangeDb.min)}`}
          tone={result.linkMarginRangeDb.typical >= 0 ? "emerald" : "rose"}
        />
        <MetricCard
          label="標準受信電力"
          tip="受信電力＝相手に届くと推定される電波の強さ（dBm）。送信出力＋利得から各損失を差し引いた結果。これが受信感度より上なら通信成立です。"
          value={`${result.receivedPowerRangeDbm.typical.toFixed(1)} dBm`}
          sub={`受信感度 ${input.receiverSensitivityDbm.toFixed(1)} dBm との比較`}
          tone="sky"
        />
      </div>

      <Card as="section">
        <h2 className="text-base font-bold text-slate-950">計算の流れ</h2>
        <div className="mt-4 space-y-2 text-sm">
          <Row label="送信電力 + アンテナ利得" value={`${(input.txPowerDbm + input.gatewayAntennaGainDbi + input.ncuAntennaGainDbi).toFixed(1)} dBm`} />
          <Row label="地上側伝搬損失" value={`-${result.outdoorPathLossDb.toFixed(1)} dB`} />
          <Row label="ケーブル・地上クラッタ" value={`-${(input.cableLossDb + input.aboveGroundClutterLossDb).toFixed(1)} dB`} />
          <Row label="BOX・地下追加損失" value={`-${result.belowGroundLossRangeDb.typical.toFixed(1)} dB`} />
          <Row label="実測補正" value={formatSigned(input.measuredCorrectionDb)} />
          <Row label="合計損失レンジ" value={formatDbRange(result.totalLossRangeDb)} strong />
          <Row label="地上側固定損失" value={`${totalFixedLossDb.toFixed(1)} dB`} />
        </div>
      </Card>

      <Callout tone="caution" size="lg" icon={<AlertTriangle aria-hidden="true" className="h-5 w-5 text-amber-700" />}>
        <h2 className="font-bold">注意と次の確認</h2>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed">
          {result.warnings.map((warning) => (
            <li key={warning.id}>{warning.message}</li>
          ))}
        </ul>
      </Callout>
    </aside>
  );
}

function Row({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex items-center justify-between gap-3 border-b border-slate-100 py-2 ${strong ? "font-bold text-slate-950" : "text-slate-700"}`}>
      <span>{label}</span>
      <span className="text-right tabular-nums">{value}</span>
    </div>
  );
}
