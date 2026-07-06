import { BookOpen } from "lucide-react";
import { Callout } from "@/components/Callout";

/**
 * 周波数と波長のコラム（二層読者設計: 表面=物語 / 深層=折りたたみの検証可能な出典）。
 * 題材: 「なぜ920MHzのアンテナは手のひらサイズなのか」— 波長と共振長、短縮技術の物語。
 */
export function FrequencyWavelengthColumn() {
  return (
    <Callout tone="info" size="lg" icon={<BookOpen aria-hidden="true" className="h-5 w-5 text-sky-700" />}>
      <h2 className="text-base font-bold">コラム：なぜ920MHzのアンテナは手のひらサイズなのか</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-sky-950/90">
        <p>
          アンテナが電波を効率よく出せるかどうかは、長さが波長と釣り合っているかで決まります。
          これは<strong>ブランコを固有の周期で押すと大きく揺れる</strong>のと同じ共振現象で、
          長さがちょうど半波長（λ/2）のとき、導体上の電流がきれいな定在波として収まり、
          給電した電力が電波に化けます。※このブランコのたとえは直感用で、ブランコの固有周期が
          基本1つなのに対し、アンテナは長さの整数比でつながる高調波でも共振する点が違います。
        </p>
        <p>
          さて920MHzの波長は約<strong>32cm</strong>。半波長ダイポールなら16cm、
          λ/4のモノポールなら約8cm——ちょうど手のひらに収まります。サブGHz帯（920MHz）は
          障害物を回り込みやすく遠くまで届くのでLPWAやRFIDで人気ですが、
          <strong>波長が長い＝本来はアンテナが大きくなる</strong>という宿命を抱えています。
          それでも小型で済むのは、地面（GND面）を鏡に見立てて残り半分を省略するλ/4接地アンテナや、
          導体を蛇行させるメアンダ、誘電体で波長そのものを縮める装荷といった工夫のおかげです。
        </p>
        <p>
          身近な波長早見を持っておくと寸法の勘が働きます。Wi-Fi（2.4GHz）は約
          <strong>12.5cm</strong>でλ/4は約3cm、920MHzは約32cmでλ/4は約8cm、
          FMラジオ（80MHz）に至っては約3.7mもあります。カーラジオのアンテナが長いのも、
          そこを短縮技術で縮めているのも、すべてこの「λ=光速÷周波数」という一本の式が根っこにあります。
        </p>
      </div>
      <details className="mt-4 rounded-lg border border-sky-200 bg-white/70 p-4">
        <summary className="cursor-pointer text-sm font-semibold text-sky-900">
          深掘り（式と出典）
        </summary>
        <div className="mt-3 space-y-2 text-xs leading-relaxed text-sky-950/80">
          <p>
            波長 λ = c / f（c = 299,792,458 m/s は SI が定義する真空中の光速）。920MHz なら
            λ = <span className="tabular-nums">0.326m ≒ 32.6cm</span>。周波数を上げると波長は
            反比例で縮み、共振に必要なアンテナ長も同じ割合で短くなる。
          </p>
          <p>
            λ/4 接地（モノポール）は、導体GND面が作る鏡像で見かけ上 λ/2 ダイポール相当となり、
            給電点インピーダンスは約36Ω（半波長ダイポール約73Ωの半分）。実際の物理長は
            端部効果・誘電体で電気長より短くなり、<span className="tabular-nums">物理長 = 電気長 × 短縮率</span>。
            誘電体中では <span className="tabular-nums">λg = λ0 / √εr</span> で波長自体が縮む。
          </p>
          <p>
            小型化は放射効率・帯域とのトレードオフで、電気的サイズに対する下限（Chu限界）がある。
            出典: C. A. Balanis, <em>Antenna Theory: Analysis and Design</em>, Wiley／
            J. D. Kraus, <em>Antennas</em>, McGraw-Hill／L. J. Chu, &quot;Physical Limitations of
            Omni-Directional Antennas,&quot; J. Appl. Phys. 19 (1948)／光速の定義値は 2019 SI（CGPM）。
          </p>
        </div>
      </details>
    </Callout>
  );
}
