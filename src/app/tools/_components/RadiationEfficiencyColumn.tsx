import { Callout } from "@/components/Callout";
import { Card } from "@/components/Card";

export function RadiationEfficiencyColumn() {
  return <Card as="article" padding="lg"><p className="text-xs font-bold text-staf-dark">測定の発明</p><h2 className="mt-1 text-xl font-bold">箱をかぶせると効率がわかる——Wheelerキャップ</h2><div className="mt-4 space-y-3 text-sm leading-relaxed text-slate-600"><p>小型アンテナへ導体の箱をかぶせると、放射を抑えながら導体・誘電体の損失は残ります。箱の有無で入力抵抗を比べ、放射分と損失分を切り分けるのがWheelerキャップ法です。</p><p>高価な電波暗室がなくても「放射だけを止める」という差分測定で効率へ迫れる、鮮やかな発想です。</p><Callout tone="caution">小型アンテナ・共振近傍を前提とする簡便法です。キャップ寸法や共振ずれの影響を受けるため、広帯域・大型アンテナでは別の測定法を検討します。</Callout><p className="text-xs">出典: H. A. Wheeler, “The Radiansphere around a Small Antenna,” Proc. IRE, 1959／IEEE Std 149／C. A. Balanis, Antenna Theory.</p></div></Card>;
}
