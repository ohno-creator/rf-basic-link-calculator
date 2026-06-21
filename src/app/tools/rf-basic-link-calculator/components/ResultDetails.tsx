import { Accordion } from "@/components/Accordion";
import { getPropagationAreaOption } from "@/data/linkBudgetOptions";
import { formatDb, formatSigned } from "@/lib/rf/format";
import type { LinkBudgetInput, LinkBudgetResult } from "@/lib/rf/linkBudget";
import { ConsultationCta } from "./ConsultationCta";
import { ResultTabs } from "./ResultTabs";

type ResultDetailsProps = {
  input: LinkBudgetInput;
  result: LinkBudgetResult | null;
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
  if (result.nearTerminalLossDb >= 3) {
    risks.push("端末近傍損失");
  }
  if (input.calibrationOffsetDb === 0) {
    risks.push("実測補正未入力");
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

function isHataFamily(input: LinkBudgetInput): boolean {
  return input.propagationModel === "okumura_hata" || input.propagationModel === "cost231_hata";
}

/**
 * 結果の脇情報。図解はタブにまとめ、リスク・数式・相談CTAは常時表示にする。
 */
export function ResultDetails({ input, result }: ResultDetailsProps) {
  if (!result) {
    return null;
  }
  const propagationArea = getPropagationAreaOption(input.propagationArea);

  return (
    <div className="space-y-5">
      <Accordion title="なぜこの判定？" defaultOpen>
        <p>{result.judgement.technicalComment}</p>
        <p className="mt-2">
          採用した伝搬モデルは「{result.propagationModelLabel}」です。伝搬損失は{" "}
          {formatDb(result.pathLossDb)}、環境損失は {formatDb(input.environmentLossDb)}、
          端末近傍損失は {formatDb(result.nearTerminalLossDb)}、実測補正値は{" "}
          {formatSigned(input.calibrationOffsetDb, "dB")} として計算しています。
          Log-distanceモデルでは距離損失指数 n={input.pathLossExponent.toFixed(1)} を使います。
        </p>
        {isHataFamily(input) ? (
          <p className="mt-2">
            奥村・秦/COST231-Hataでは、送信側アンテナ高{" "}
            {input.txAntennaHeightM.toFixed(1)}m を基地局高 hb、受信側アンテナ高{" "}
            {input.rxAntennaHeightM.toFixed(1)}m を移動局高 hm として計算しています。
            空中線地上高は固定値ではなく、入力値として伝搬損失に反映されます。
            エリア種別は「{propagationArea.label}」として計算しています。
          </p>
        ) : null}
      </Accordion>

      <ResultTabs input={input} result={result} />

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
          受信電力[dBm] = 送信電力[dBm] + 送信アンテナ利得[dBi] + 受信アンテナ利得[dBi] -
          伝搬損失[dB] - ケーブル・コネクタ損失[dB] - 環境損失[dB] - 端末近傍損失[dB] +
          実測補正値[dB] です。
        </p>
        {isHataFamily(input) ? (
          <p className="mt-2">
            奥村・秦モデルの市街地式では、基地局高 hb と移動局高 hm が式に含まれます。
            本ツールでは hb=送信側アンテナ高、hm=受信側アンテナ高として扱います。
            また、市街地、郊外、開放地の補正も「奥村・秦モデルのエリア種別」の入力値で切り替えます。
          </p>
        ) : null}
        <p className="mt-2">
          リンクマージン[dB] = 受信電力[dBm] - 受信感度[dBm] で、現在は{" "}
          {formatSigned(result.linkMarginDb, "dB")} です。
        </p>
      </Accordion>

      <ConsultationCta input={input} result={result} ctaLabel={result.judgement.ctaLabel} />
    </div>
  );
}
