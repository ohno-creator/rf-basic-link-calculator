import { Accordion } from "@/components/Accordion";
import { CONTACT_URL } from "@/lib/rf/presets";
import { formatDb, formatDbm, formatSigned } from "@/lib/rf/format";
import type {
  LinkBudgetInput,
  LinkBudgetResult,
  ValidationErrors
} from "@/lib/rf/linkBudget";
import { BeginnerExplanation } from "./BeginnerExplanation";
import { ConsultationCta } from "./ConsultationCta";
import { DistancePowerChart } from "./DistancePowerChart";
import { ImprovementSimulator } from "./ImprovementSimulator";
import { LinkBudgetWaterfallChart } from "./LinkBudgetWaterfallChart";
import { LinkMarginGauge } from "./LinkMarginGauge";
import { NextCheckpoints } from "./NextCheckpoints";
import { RadioPathDiagram } from "./RadioPathDiagram";
import { SensitivityLineVisual } from "./SensitivityLineVisual";
import { SignalFlowDiagram } from "./SignalFlowDiagram";

type ResultCardProps = {
  input: LinkBudgetInput;
  result: LinkBudgetResult | null;
  errors: ValidationErrors;
};

const levelStyles = {
  excellent: "border-emerald-200 bg-emerald-50 text-emerald-950",
  good: "border-sky-200 bg-sky-50 text-sky-950",
  caution: "border-amber-200 bg-amber-50 text-amber-950",
  poor: "border-rose-200 bg-rose-50 text-rose-950"
};

function riskItems(input: LinkBudgetInput, result: LinkBudgetResult) {
  const risks = [
    "筐体内蔵アンテナによる効率低下",
    "金属部品近接による放射性能低下",
    "屋内・工場・倉庫での反射や遮蔽",
    "量産時の組立ばらつき",
    "ノイズ源近接",
    "アンテナ配置スペース不足"
  ];

  if (input.cableLossDb >= 1) {
    risks.push("ケーブル・コネクタ損失");
  }
  if (input.frequencyMHz <= 920) {
    risks.push("低周波LTE帯でのアンテナサイズ不足");
  }
  if (input.frequencyMHz >= 2400) {
    risks.push("高周波帯での距離損失増加");
  }
  if (result.linkMarginDb < 10) {
    risks.push("受信感度条件の不足");
  }

  return risks;
}

export function ResultCard({ input, result, errors }: ResultCardProps) {
  const errorMessages = Object.values(errors);

  if (!result) {
    return (
      <section className="rounded-lg border border-rose-200 bg-rose-50 p-5 text-rose-950">
        <h3 className="text-lg font-bold">入力値を確認してください</h3>
        <ul className="mt-3 space-y-2 text-sm">
          {errorMessages.map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      </section>
    );
  }

  return (
    <div className="space-y-5">
      <section
        className={`rounded-lg border p-5 shadow-sm ${levelStyles[result.judgement.level]}`}
      >
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold">判定</p>
            <h2 className="mt-1 text-3xl font-bold">{result.judgement.label}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed">
              {result.judgement.summary}
            </p>
          </div>
          <div className="rounded-lg bg-white/75 px-5 py-4 text-right shadow-sm">
            <p className="text-xs font-semibold text-slate-500">リンクマージン</p>
            <p className="text-4xl font-bold text-staf">
              {formatSigned(result.linkMarginDb, "dB")}
            </p>
            <p className="mt-1 text-xs text-slate-600">
              受信電力 {formatDbm(result.receivedPowerDbm)}
            </p>
          </div>
        </div>
        <Accordion title="なぜこの判定？">
          <p>{result.judgement.technicalComment}</p>
          <p className="mt-2">
            自由空間損失は {formatDb(result.fsplDb)}、環境補正損失は{" "}
            {formatDb(input.environmentLossDb)} として計算しています。
          </p>
        </Accordion>
        <a
          className="mt-4 inline-flex rounded-md bg-white px-4 py-2 text-sm font-semibold text-staf shadow-sm transition hover:bg-white/80"
          href={CONTACT_URL}
        >
          {result.judgement.ctaLabel}
        </a>
      </section>

      <BeginnerExplanation input={input} result={result} />
      <LinkBudgetWaterfallChart input={input} result={result} />
      <RadioPathDiagram input={input} result={result} />
      <SignalFlowDiagram input={input} result={result} />
      <LinkMarginGauge result={result} />
      <DistancePowerChart input={input} />
      <SensitivityLineVisual input={input} result={result} />

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-base font-semibold text-slate-950">主なリスク</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {riskItems(input, result).map((risk) => (
            <span
              key={risk}
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700"
            >
              {risk}
            </span>
          ))}
        </div>
      </section>

      <Accordion title="技術者向けの説明を見る">
        <p>
          受信電力[dBm] = 送信出力[dBm] + 送信アンテナ利得[dBi] + 受信アンテナ利得[dBi] -
          自由空間損失[dB] - ケーブル・コネクタ損失[dB] - 環境補正損失[dB] です。
        </p>
        <p className="mt-2">
          リンクマージン[dB] = 受信電力[dBm] - 受信感度[dBm] で、現在は{" "}
          {formatSigned(result.linkMarginDb, "dB")} です。
        </p>
      </Accordion>

      <ImprovementSimulator input={input} result={result} />
      <NextCheckpoints />
      <ConsultationCta
        input={input}
        result={result}
        ctaLabel={result.judgement.ctaLabel}
      />
    </div>
  );
}
