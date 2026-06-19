import { InfoCard } from "@/components/InfoCard";
import { formatDbm, formatSigned } from "@/lib/rf/format";
import type { LinkBudgetInput, LinkBudgetResult } from "@/lib/rf/linkBudget";
import { COLUMN_URL } from "@/lib/rf/presets";

type BeginnerExplanationProps = {
  input: LinkBudgetInput;
  result: LinkBudgetResult;
};

export function BeginnerExplanation({ input, result }: BeginnerExplanationProps) {
  return (
    <section className="grid gap-4 md:grid-cols-3">
      <InfoCard title="ひとことで言うと" tone="blue">
        <p>{result.judgement.summary}</p>
      </InfoCard>
      <InfoCard title="技術的には">
        <p>
          受信電力は {formatDbm(result.receivedPowerDbm)}、受信感度は{" "}
          {formatDbm(input.receiverSensitivityDbm)} です。リンクマージンは{" "}
          {formatSigned(result.linkMarginDb, "dB")} で、判定は「{result.judgement.label}」です。
        </p>
        <p className="mt-2">{result.judgement.technicalComment}</p>
      </InfoCard>
      <InfoCard title="次に確認すること" tone="amber">
        <p>{result.judgement.recommendation}</p>
        <a className="mt-3 inline-block font-semibold text-staf" href={COLUMN_URL}>
          リンクバジェットの考え方を詳しく読む
        </a>
      </InfoCard>
    </section>
  );
}
