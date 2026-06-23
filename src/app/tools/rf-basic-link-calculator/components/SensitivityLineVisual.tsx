import { Card } from "@/components/Card";
import { formatDbm } from "@/lib/rf/format";
import type { LinkBudgetInput, LinkBudgetResult } from "@/lib/rf/linkBudget";

type SensitivityLineVisualProps = {
  input: LinkBudgetInput;
  result: LinkBudgetResult;
};

function position(value: number) {
  const top = 0;
  const bottom = -130;
  const clamped = Math.min(top, Math.max(bottom, value));

  return ((top - clamped) / (top - bottom)) * 100;
}

export function SensitivityLineVisual({ input, result }: SensitivityLineVisualProps) {
  const receivedTop = position(result.receivedPowerDbm);
  const sensitivityTop = position(input.receiverSensitivityDbm);

  return (
    <Card as="section" padding="lg">
      <h3 className="text-base font-semibold text-slate-950">Sensitivity Line Visual</h3>
      <p className="mt-1 text-sm leading-relaxed text-slate-600">
        受信感度は「ここまで弱い電波なら受け取れる」という最低ラインです。受信電力がこのラインより上にあれば、通信できる可能性があります。
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-[110px_1fr]">
        <div className="flex h-72 flex-col justify-between text-xs text-slate-500">
          <span>強い電波 0 dBm</span>
          <span>-50 dBm</span>
          <span>-80 dBm</span>
          <span>-105 dBm</span>
          <span>弱い電波 -130 dBm</span>
        </div>
        <div className="relative h-72 rounded-lg border border-slate-200 bg-gradient-to-b from-emerald-50 via-sky-50 to-slate-100">
          <div
            className="absolute left-0 right-0 border-t-2 border-staf"
            style={{ top: `${receivedTop}%` }}
          >
            <span className="absolute -top-4 left-3 rounded-full bg-staf px-2 py-1 text-xs font-semibold text-white">
              受信電力 {formatDbm(result.receivedPowerDbm)}
            </span>
          </div>
          <div
            className="absolute left-0 right-0 border-t-2 border-dashed border-rose-500"
            style={{ top: `${sensitivityTop}%` }}
          >
            <span className="absolute top-1 left-3 rounded-full bg-white px-2 py-1 text-xs font-semibold text-rose-700 shadow-card">
              受信感度 {formatDbm(input.receiverSensitivityDbm)}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
