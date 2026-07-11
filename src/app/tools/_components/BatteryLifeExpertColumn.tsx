import { BatteryWarning } from "lucide-react";
import { Callout } from "@/components/Callout";

/**
 * 電池寿命エキスパートモードのコラム（E1様式：二層読者設計）。
 * 題材: 「10年電池の落とし穴」— 不動態化、CR2032のパルス、自己放電の壁。
 */
export function BatteryLifeExpertColumn() {
  return (
    <Callout
      tone="caution"
      size="lg"
      icon={<BatteryWarning aria-hidden="true" className="h-5 w-5 text-amber-700" />}
    >
      <h2 className="text-base font-bold">コラム：10年電池の落とし穴（不動態化・パルス・自己放電の壁）</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-amber-950/90">
        <p>
          「10年間メンテナンスフリー」を謳うIoTデバイスの開発において、最も陥りやすい罠が電池の「実効容量」の見落としです。
          単純計算（容量 ÷ 平均電流）では10年持つ計算でも、実地テストや量産後に3年経たずに動かなくなる——そんなトラブルが後を絶ちません。
          その主な原因が、<strong>不動態化（パッシベーション）</strong>、<strong>高パルス負荷による容量激減</strong>、そして<strong>自己放電の壁</strong>です。
        </p>
        <p>
          IoTセンサーの定番であるLi-SOCl2（塩化チオニルリチウム）電池は、長期間スリープが続くと電極に絶縁性の被膜（不動態化被膜）が成長します。
          これが原因で、送信時に突然大電流を引こうとすると、被膜による内部抵抗のために電圧が急降下（電圧遅延）し、マイコンが起動前に低電圧リセットを起こします。
          また、BLEビーコン等でよく使われるCR2032コイン電池は内部抵抗が数十Ωと高いため、LoRaやLTE-Mのような十数〜数十mAのパルス電流が流れると、実効容量が公称値の4分の1以下に激減してしまいます。
        </p>
        <p>
          スリープ電流を極限まで絞り込んでも、電池には棚に置くだけで失われる「自己放電」が存在します。
          年率1〜2.5%の自己放電は、10年間のスパンでは全容量の10〜25%を奪い去ります。
          10年動作を設計する際は、単純な加重平均ではなく、これら化学電池の実特性とパルス特性を織り込んだ「実効容量」での評価が不可欠です。
        </p>
      </div>
      <details className="mt-4 rounded-lg border border-amber-200 bg-white/70 p-4">
        <summary className="cursor-pointer text-sm font-semibold text-amber-900">
          深掘り（式と出典）
        </summary>
        <div className="mt-3 space-y-2 text-xs leading-relaxed text-amber-950/80">
          <p>
            不動態化（Passivation）は塩化チオニルリチウム電池の正極リチウム金属と電解液が反応し、LiCl被膜が形成される自己防御機構です。
            自己放電を抑える反面、起動時に一時的な電圧低下（Voltage Delay）を引き起こします。これを防ぐには、定期的に数十mAの負荷をかけて被膜を破壊する「パルス放電シーケンス」の設計が必要です。
          </p>
          <p>
            CR2032などのコイン電池は等価直列抵抗（ESR）が常温で10〜30Ω、低温（-20℃）では数百Ωに跳ね上がります。
            ピーク電流 I_peak 印加時の電圧降下 V_drop = I_peak × ESR によって瞬時に終止電圧（カットオフ）に達するため、
            エネルギー利用効率 k_pulse は25%以下まで落ち込みます。これを緩和するには、大容量コンデンサ（スーパーキャパシタ等）を並列配置しパルスを吸収させます。
          </p>
          <p>
            出典: Tadiran Batteries Technical Brochure &quot;LTC Batteries&quot;（不動態化と電圧遅延のメカニズム）／
            Panasonic &quot;Lithium Handbook&quot;（CR2032のパルス放電特性と制限）／
            L. Casals et al., &quot;Modeling the Energy Performance of LoRaWAN,&quot; Sensors 2017（LoRaWANの電力消費モデルと電池実効特性評価）。
          </p>
        </div>
      </details>
    </Callout>
  );
}
