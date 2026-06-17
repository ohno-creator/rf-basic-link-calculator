import { formatDbm, formatSigned } from "@/lib/rf/format";
import type {
  LinkBudgetInput,
  LinkBudgetResult,
  ValidationErrors
} from "@/lib/rf/linkBudget";
import { LinkBudgetWaterfallChart } from "./LinkBudgetWaterfallChart";

type ResultHeroProps = {
  input: LinkBudgetInput;
  result: LinkBudgetResult | null;
  errors: ValidationErrors;
  onStepSelect?: (key: keyof LinkBudgetInput) => void;
};

export const levelStyles = {
  excellent: "border-emerald-200 bg-emerald-50 text-emerald-950",
  good: "border-sky-200 bg-sky-50 text-sky-950",
  caution: "border-amber-200 bg-amber-50 text-amber-950",
  poor: "border-rose-200 bg-rose-50 text-rose-950"
};

/**
 * 結果の主役（判定・リンクマージン・滝グラフ）だけをまとめたヒーロー。
 * デスクトップでは sticky にして、入力を動かしている間も滝グラフが常に見えるようにする。
 */
export function ResultHero({ input, result, errors, onStepSelect }: ResultHeroProps) {
  if (!result) {
    const errorMessages = Object.values(errors);
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
      <section className={`rounded-lg border p-5 shadow-sm ${levelStyles[result.judgement.level]}`}>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold">判定</p>
            <h2 className="mt-1 text-3xl font-bold">{result.judgement.label}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed">{result.judgement.summary}</p>
          </div>
          <div className="rounded-lg bg-white/75 px-5 py-4 text-right shadow-sm">
            <p className="text-xs font-semibold text-slate-500">リンクマージン</p>
            <p className="text-4xl font-bold text-staf">{formatSigned(result.linkMarginDb, "dB")}</p>
            <p className="mt-1 text-xs text-slate-600">受信電力 {formatDbm(result.receivedPowerDbm)}</p>
          </div>
        </div>
      </section>

      <LinkBudgetWaterfallChart input={input} result={result} onStepSelect={onStepSelect} />
    </div>
  );
}
