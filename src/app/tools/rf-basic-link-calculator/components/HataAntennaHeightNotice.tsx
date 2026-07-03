"use client";

import { Callout } from "@/components/Callout";
import { Card } from "@/components/Card";
import type { LinkBudgetInput } from "@/lib/rf/linkBudget";
import { isHataFamily } from "./linkBudgetPanelShared";

function focusAntennaHeightInput(id: "txAntennaHeightM" | "rxAntennaHeightM") {
  const element = document.getElementById(id);
  element?.scrollIntoView({ behavior: "smooth", block: "center" });
  window.setTimeout(() => {
    (element as HTMLElement | null)?.focus({ preventScroll: true });
  }, 220);
}

export function HataAntennaHeightNotice({ input }: { input: LinkBudgetInput }) {
  if (!isHataFamily(input.propagationModel)) {
    return (
      <Card variant="slate" padding="md" shadow={false}>
        <p className="text-sm font-semibold text-slate-950">空中線地上高も入力パラメータです</p>
        <p className="mt-1 text-xs leading-relaxed text-slate-600">
          2波モデル、奥村・秦モデル、COST231-Hataモデルでは、送信側・受信側の空中線地上高（アンテナ高）が伝搬損失に効きます。高さは固定ではなく「ステップ2：送信側・受信側のアンテナ条件を入れる」で入力できます。
        </p>
      </Card>
    );
  }

  return (
    <Callout tone="success" size="md">
      <p className="text-sm font-semibold">
        奥村・秦モデルの空中線地上高は固定ではなく、入力パラメータです
      </p>
      <p className="mt-1 text-xs leading-relaxed">
        送信側・受信側の空中線地上高は「ステップ2：送信側・受信側のアンテナ条件を入れる」で入力でき、変更するとその場で伝搬損失が再計算されます。
        現在は、送信側 空中線地上高 {input.txAntennaHeightM.toFixed(1)}m を基地局高 hb、
        受信側 空中線地上高 {input.rxAntennaHeightM.toFixed(1)}m を移動局高 hm として計算に反映しています。
        一般的な適用目安は hb 30〜200m、hm 1〜10m、距離1〜20kmです。
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded-md border border-emerald-300 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-300/60"
          onClick={() => focusAntennaHeightInput("txAntennaHeightM")}
        >
          送信側アンテナ高を確認
        </button>
        <button
          type="button"
          className="rounded-md border border-emerald-300 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-300/60"
          onClick={() => focusAntennaHeightInput("rxAntennaHeightM")}
        >
          受信側アンテナ高を確認
        </button>
      </div>
    </Callout>
  );
}
