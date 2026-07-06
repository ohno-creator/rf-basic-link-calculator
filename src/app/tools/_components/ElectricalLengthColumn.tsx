import { BookOpen } from "lucide-react";
import { Callout } from "@/components/Callout";

/**
 * 電気長・位相換算のコラム（二層読者設計: 表面=物語 / 深層=折りたたみの検証可能な出典）。
 * 題材: 「1mmの遅刻が波を壊す」— 基板でわざと蛇行する配線と、フェーズドアレイの等長給電。
 */
export function ElectricalLengthColumn() {
  return (
    <Callout tone="info" size="lg" icon={<BookOpen aria-hidden="true" className="h-5 w-5 text-sky-700" />}>
      <h2 className="text-base font-bold">コラム：1mmの遅刻が、波を壊す</h2>
      <div className="mt-3 space-y-3 text-sky-950/90">
        <p className="text-sm leading-relaxed">
          高速基板の写真を見ると、まっすぐ引けばいいはずの配線が、わざわざヘビのようにくねくねと
          蛇行している箇所があります。素人目には無駄な回り道ですが、あれは
          <strong>「長さを合わせるために、わざと遠回りさせている」</strong>設計です。
          DDRメモリやPCI Expressのように何本もの信号を同時に届けたい配線群では、短い線と長い線で
          電気長が違うと、到着タイミング＝位相がずれてデータが壊れます。だから短い線に蛇行（ミアンダ）を
          足し、全員の電気長を数十µm単位でそろえる。基板設計者はミリではなく、位相の言葉で長さを見ています。
        </p>
        <p className="text-sm leading-relaxed">
          もっと劇的なのがフェーズドアレイ・アンテナです。多数の素子の位相を少しずつずらすと、
          電波の波面が傾き、機械を動かさずにビームの向きを変えられる——気象レーダーも、衛星通信の
          平面アンテナも、5Gのミリ波基地局もこの原理で「首を振って」います。ここで配線長は
          <strong>意図的にずらす制御量そのもの</strong>。裏を返せば、意図しない1mmの誤差は、
          そのままビームを狙いから外す誤差になります。28GHzでは自由空間の波長がわずか約10.7mm。
          基板上ではさらに縮むので、<strong>1mmの配線差が数十度の位相誤差</strong>に化けます。
        </p>
        <p className="text-sm leading-relaxed">
          Sub-GHz時代は「配線は電気を運ぶただの線」でした。しかしGHzを超えると、線路の長さは
          位相を作る立派な回路定数になります。<strong>GHz時代の配線は、部品です。</strong>
          このツールが出している deg/mm は、その部品の「効き目」——1mmあたり何度回るか——を
          数字にしたものです。※「歩幅をそろえれば隊列は揃う」というたとえは直感用で、実際には
          線路の歩幅（λg）は周波数で伸び縮みするため、広い帯域では全周波数で位相を一定に保てません。
          そこを埋めるのが、位相器ではなく実長の遅延で合わせる真の時間遅延（TTD）です。
        </p>
      </div>
      <details className="mt-4 rounded-lg border border-sky-200 bg-white/70 p-4">
        <summary className="cursor-pointer text-sm font-semibold text-sky-900">
          深掘り（式と出典）
        </summary>
        <div className="mt-3 space-y-2 text-xs leading-relaxed text-sky-950/80">
          <p>
            管内波長 λg = VF·λ₀ = (1/√εeff)·(c/f)。位相 φ = 360·L/λg = 360·L·√εeff·f/c。
            1mmあたりの位相回転 deg/mm = 360/λg は周波数に比例して増える。例: 28GHz・自由空間で
            λ₀≈10.7mm → 33.6°/mm、基板（VF≈0.5）では λg≈5.35mm → <span className="tabular-nums">約67°/mm</span>。
            1mmの配線差がそのまま約67°の位相誤差になる。
          </p>
          <p>
            分散（dispersion）の注意: マイクロストリップは空気と基板にまたがる準TEMのため εeff が
            周波数とともに緩やかに増え、VFが一定という本ツールの前提は広帯域では近似になる。導波管では
            さらに強く分散する。位相を全帯域でそろえたい用途では、周波数依存の位相器ではなく物理的な
            遅延長で合わせる真の時間遅延（True-Time-Delay）が使われる。
          </p>
          <p>
            出典: D. M. Pozar, &quot;Microwave Engineering,&quot; 4th ed., Wiley (2012), Ch.3
            （伝送線路・位相定数 β と電気長 βℓ）。フェーズドアレイの走査条件と素子間位相は
            C. A. Balanis, &quot;Antenna Theory,&quot; 4th ed., Wiley (2016), Ch.6。マイクロストリップの
            εeff と分散は Hammerstad-Jensen モデル（Pozar §3.8）。
          </p>
        </div>
      </details>
    </Callout>
  );
}
