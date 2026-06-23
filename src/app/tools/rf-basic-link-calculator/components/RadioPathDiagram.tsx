import { Box, Cable, RadioReceiver, RadioTower, Waves } from "lucide-react";
import { Card, StateCard } from "@/components/Card";
import { formatDb, formatDbm } from "@/lib/rf/format";
import type { LinkBudgetInput, LinkBudgetResult } from "@/lib/rf/linkBudget";

type RadioPathDiagramProps = {
  input: LinkBudgetInput;
  result: LinkBudgetResult;
};

export function RadioPathDiagram({ input, result }: RadioPathDiagramProps) {
  const distanceLabel =
    input.distanceUnit === "km"
      ? `${input.distance} km`
      : `${input.distance} m`;

  return (
    <Card as="section" padding="lg">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-staf-dark">経路図</p>
          <h3 className="mt-1 text-lg font-bold text-slate-950">
            電波が弱くなる場所を分けて見る
          </h3>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">
            同じリンクバジェットでも、弱くなる理由は「伝搬」「ケーブル」「環境」「端末近傍」で分けて考えると改善点を見つけやすくなります。
          </p>
        </div>
        <div className="rounded-lg bg-staf-light px-4 py-3 text-right">
          <p className="text-xs font-semibold text-staf-dark">受信電力</p>
          <p className="text-2xl font-bold text-slate-950">{formatDbm(result.receivedPowerDbm)}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-3 lg:grid-cols-[1fr_1.2fr_1fr_1fr]">
        <StateCard tone="success" padding="md">
          <RadioTower aria-hidden="true" className="h-7 w-7 text-emerald-700" />
          <p className="mt-3 text-sm font-semibold text-emerald-950">送信側</p>
          <p className="mt-1 text-2xl font-bold text-emerald-950">
            {formatDbm(input.txPowerDbm)}
          </p>
          <p className="mt-1 text-xs text-emerald-800">
            Txアンテナ {input.txAntennaGainDbi >= 0 ? "+" : ""}
            {input.txAntennaGainDbi} dBi
          </p>
        </StateCard>

        <StateCard tone="info" padding="md" className="relative overflow-hidden">
          <div className="absolute inset-x-5 top-1/2 h-1 -translate-y-1/2 rounded-full bg-sky-200" />
          <div className="relative flex h-full min-h-32 items-center justify-between gap-3">
            <Waves aria-hidden="true" className="h-9 w-9 text-sky-700" />
            <div className="text-center">
              <p className="text-sm font-semibold text-sky-950">伝搬で弱くなる</p>
              <p className="mt-1 text-2xl font-bold text-sky-950">-{formatDb(result.pathLossDb)}</p>
              <p className="mt-1 text-xs text-sky-800">
                {result.propagationModelLabel} / {distanceLabel} / {input.frequencyMHz} MHz
              </p>
            </div>
            <Waves aria-hidden="true" className="h-9 w-9 rotate-180 text-sky-700" />
          </div>
        </StateCard>

        <StateCard tone="danger" padding="md">
          <div className="flex items-center gap-2">
            <Cable aria-hidden="true" className="h-6 w-6 text-rose-700" />
            <Box aria-hidden="true" className="h-6 w-6 text-rose-700" />
          </div>
          <p className="mt-3 text-sm font-semibold text-rose-950">ケーブル・環境・端末近傍</p>
          <p className="mt-1 text-2xl font-bold text-rose-950">
            -{formatDb(input.cableLossDb + input.environmentLossDb + result.nearTerminalLossDb)}
          </p>
          <p className="mt-1 text-xs text-rose-800">
            ケーブル {input.cableLossDb} dB / 環境 {input.environmentLossDb} dB / 近傍{" "}
            {result.nearTerminalLossDb.toFixed(1)} dB
          </p>
        </StateCard>

        <Card variant="slate" padding="md" shadow={false}>
          <RadioReceiver aria-hidden="true" className="h-7 w-7 text-slate-700" />
          <p className="mt-3 text-sm font-semibold text-slate-950">受信側</p>
          <p className="mt-1 text-2xl font-bold text-slate-950">
            {formatDbm(result.receivedPowerDbm)}
          </p>
          <p className="mt-1 text-xs text-slate-600">
            受信感度 {formatDbm(input.receiverSensitivityDbm)}
          </p>
        </Card>
      </div>

      <Card variant="slate" padding="md" shadow={false} className="mt-4">
        <p className="text-sm font-semibold text-slate-950">改善の読み方</p>
        <p className="mt-1 text-sm leading-relaxed text-slate-600">
          滝グラフで大きく落ちている部分が、通信余裕を削っている主因です。伝搬損失が大きい場合は距離・周波数・アンテナ高、端末近傍損失が大きい場合は地面近接・筐体・偏波・遮蔽・設置方向を重点的に確認します。
        </p>
      </Card>
    </Card>
  );
}
