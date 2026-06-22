import { Callout, calloutToneClass, LEVEL_TO_TONE } from "@/components/Callout";
import { Stat } from "@/components/Stat";
import { formatDbm } from "@/lib/rf/format";
import type {
  LinkBudgetInput,
  LinkBudgetResult,
  ValidationErrors
} from "@/lib/rf/linkBudget";
import { LinkBudgetWaterfallChart } from "./LinkBudgetWaterfallChart";
import { PropagationWarnings } from "./PropagationWarnings";

type ResultHeroProps = {
  input: LinkBudgetInput;
  result: LinkBudgetResult | null;
  errors: ValidationErrors;
  onStepSelect?: (key: keyof LinkBudgetInput) => void;
};

// 判定レベル→帯の配色は Callout のトーン体系（LEVEL_TO_TONE）に一本化。
function levelToneClass(level: keyof typeof LEVEL_TO_TONE): string {
  return calloutToneClass[LEVEL_TO_TONE[level]];
}

/**
 * 結果の主役（判定・リンクマージン・滝グラフ）だけをまとめたヒーロー。
 * デスクトップでは sticky にして、入力を動かしている間も滝グラフが常に見えるようにする。
 */
export function ResultHero({ input, result, errors, onStepSelect }: ResultHeroProps) {
  if (!result) {
    const errorMessages = Object.values(errors);
    return (
      <Callout tone="danger" size="lg">
        <h3 className="text-lg font-bold">入力値を確認してください</h3>
        <ul className="mt-3 space-y-2 text-sm">
          {errorMessages.map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      </Callout>
    );
  }

  const margin = result.linkMarginDb;
  const marginValue = Number.isFinite(margin) ? `${margin > 0 ? "+" : ""}${margin.toFixed(1)}` : "-";

  return (
    <div className="space-y-5">
      <section className={`rounded-lg border p-5 shadow-card ${levelToneClass(result.judgement.level)}`}>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold">判定</p>
            <h2 className="mt-1 text-3xl font-bold">{result.judgement.label}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed">{result.judgement.summary}</p>
          </div>
          <div className="rounded-lg bg-white/75 px-5 py-4 shadow-card">
            <Stat
              label="リンクマージン"
              value={marginValue}
              unit="dB"
              tone="staf"
              size="lg"
              align="right"
              note={`受信電力 ${formatDbm(result.receivedPowerDbm)}`}
            />
          </div>
        </div>
      </section>

      <PropagationWarnings warnings={result.warnings} />
      <LinkBudgetWaterfallChart input={input} result={result} onStepSelect={onStepSelect} />
    </div>
  );
}
