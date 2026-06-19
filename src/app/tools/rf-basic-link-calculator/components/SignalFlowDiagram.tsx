import { formatDb, formatDbm, formatSigned } from "@/lib/rf/format";
import type { LinkBudgetInput, LinkBudgetResult } from "@/lib/rf/linkBudget";

type SignalFlowDiagramProps = {
  input: LinkBudgetInput;
  result: LinkBudgetResult;
};

type FlowItem = {
  title: string;
  value: string;
  helper: string;
  tone: "plus" | "minus" | "result";
};

const toneClasses = {
  plus: "border-emerald-200 bg-emerald-50 text-emerald-950",
  minus: "border-rose-200 bg-rose-50 text-rose-950",
  result: "border-staf/25 bg-staf-light text-slate-950"
};

export function SignalFlowDiagram({ input, result }: SignalFlowDiagramProps) {
  const items: FlowItem[] = [
    {
      title: "送信電力",
      value: formatSigned(input.txPowerDbm, "dBm"),
      helper: "送信機から出る強さ",
      tone: "plus"
    },
    {
      title: "送信アンテナ利得",
      value: formatSigned(input.txAntennaGainDbi, "dBi"),
      helper: "足すもの",
      tone: "plus"
    },
    {
      title: "受信アンテナ利得",
      value: formatSigned(input.rxAntennaGainDbi, "dBi"),
      helper: "足すもの",
      tone: "plus"
    },
    {
      title: "伝搬損失",
      value: `-${formatDb(result.pathLossDb)}`,
      helper: result.propagationModelLabel,
      tone: "minus"
    },
    {
      title: "ケーブル損失",
      value: `-${formatDb(input.cableLossDb)}`,
      helper: "引くもの",
      tone: "minus"
    },
    {
      title: "環境損失",
      value: `-${formatDb(input.environmentLossDb)}`,
      helper: "筐体・壁・金属など",
      tone: "minus"
    },
    {
      title: "端末近傍損失",
      value: `-${formatDb(result.nearTerminalLossDb)}`,
      helper: "地面・筐体・偏波・遮蔽",
      tone: "minus"
    },
    {
      title: "実測補正値",
      value: formatSigned(input.calibrationOffsetDb, "dB"),
      helper: "RSSI/RSRPで補正",
      tone: input.calibrationOffsetDb >= 0 ? "plus" : "minus"
    },
    {
      title: "受信電力",
      value: formatDbm(result.receivedPowerDbm),
      helper: "受信機に届く強さ",
      tone: "result"
    },
    {
      title: "受信感度",
      value: formatDbm(input.receiverSensitivityDbm),
      helper: "受信に必要な最低ライン",
      tone: "result"
    },
    {
      title: "リンクマージン",
      value: formatSigned(result.linkMarginDb, "dB"),
      helper: result.judgement.label,
      tone: "result"
    }
  ];

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-slate-950">信号フロー図</h3>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">
            リンクバジェットは、電波が送信機から出て、伝搬・ケーブル・環境・端末近傍で弱くなり、実測補正も加えたうえで受信機に届いた時点の余裕を見る考え方です。
          </p>
        </div>
        <div className="flex gap-2 text-xs font-semibold">
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-800">足すもの</span>
          <span className="rounded-full bg-rose-50 px-3 py-1 text-rose-800">引くもの</span>
        </div>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, index) => (
          <div
            key={`${item.title}-${index}`}
            className={`relative rounded-lg border p-4 ${toneClasses[item.tone]}`}
          >
            <p className="text-xs font-semibold uppercase tracking-normal opacity-75">
              {item.helper}
            </p>
            <p className="mt-2 text-sm font-semibold">{item.title}</p>
            <p className="mt-1 text-2xl font-bold">{item.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
