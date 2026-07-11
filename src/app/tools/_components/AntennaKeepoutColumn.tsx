import { BookOpen } from "lucide-react";
import { Callout } from "@/components/Callout";
import { KEEPOUT_SOURCES } from "@/data/antennaKeepout";

/**
 * アンテナ・キープアウトのコラム（二層読者設計: 表面=物語 / 深層=折りたたみの検証可能な出典）。
 * 題材: 「アンテナの周りに『何も置かない勇気』」— データシートが要求する空き地の正体（近傍界と結合）。
 */
export function AntennaKeepoutColumn() {
  return (
    <Callout tone="info" size="lg" icon={<BookOpen aria-hidden="true" className="h-5 w-5 text-sky-700" />}>
      <h2 className="text-base font-bold">コラム：アンテナの周りに「何も置かない勇気」</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-sky-950/90">
        <p>
          基板は完成、ファームも動く、なのに<strong>電波だけ飛ばない</strong>——量産直前の定番トラブルです。
          原因を追うと、たいていアンテナの隣にシールド缶や電池、ネジボスがぴったり寄り添っています。
          チップアンテナのデータシートを開き直すと、必ず1枚の図があります。「この範囲には銅箔も部品も
          置かないこと」——キープアウト（実装禁止領域）。数mm角の部品のために、その何倍もの
          <strong>空き地</strong>を要求する図です。詰め込み設計の現場では、この空き地が真っ先に
          削られます。何も載っていない基板面積は、原価表の上では「無駄」に見えるからです。
        </p>
        <p>
          しかしその空き地こそがアンテナの本体です。チップアンテナは部品の顔をしていますが、
          実際に電波を放つのは素子そのものではなく、<strong>素子の周囲の空間に広がる電磁界（近傍界）</strong>
          です。太鼓にたとえるなら、セラミックの素子は「膜」、キープアウトは「胴の空洞」。膜だけ叩いても
          太鼓は鳴らず、空洞に手を突っ込めば音は死にます。同じように、近傍界の中に金属や部品が入ると
          共振周波数がずれ（同調ずれ）、誘起された電流が電力を熱に変えて奪います（結合損失）。
          ——ただしこのたとえは直感用で、実際に起きているのは音の共鳴ではなく近傍界の電磁結合であり、
          「どれだけ離せば安全か」は波長と構造で決まります。
        </p>
        <p>
          だからキープアウトを守れないときの正解は、「性能の出ないアンテナを我慢して内蔵し続ける」
          ことではありません。出口を変えるのです。FPCアンテナでケーブルごと筐体の空きスペースへ逃がす、
          コネクタ経由で<strong>外付けアンテナ</strong>にする、より小さな空き地で済む製品へ替える——
          いずれも「空き地を確保できない」と早く認めた設計だけが選べる手です。
          空き地は削れば削るほど、効率と帯域という形で必ず請求書が届きます。
          何も置かない勇気は、電波にとって最高の投資です。
        </p>
      </div>
      <details className="mt-4 rounded-lg border border-sky-200 bg-white/70 p-4">
        <summary className="cursor-pointer text-sm font-semibold text-sky-900">
          深掘り（レイアウトガイドと出典）
        </summary>
        <div className="mt-3 space-y-2 text-xs leading-relaxed text-sky-950/80">
          <p>
            Johanson の 2.4GHz チップアンテナ（2450AT42B100E）のレイアウトガイドは、素子の直下と周囲に
            GNDベタ・配線を置かないクリアランス領域を図面で指定し、GNDプレーンの大きさ・基板端からの
            位置まで含めて評価条件を定めている。Ignion の NN02-220 / NN02-224 データシートも同様に、
            基板端のクリアランス面積（空き地）を帯域ごとに指定し、面積が小さいほど効率・帯域が
            低下することを性能表で示している。本ツールの表は、これらの一次資料の代表値を丸めた目安である。
          </p>
          <p>
            近傍界の目安はおおむね半径 λ/2π（リアクティブ近傍界）で、920MHz では約5cm。
            2.4GHz より 920MHz 帯のキープアウトが大きいのは波長が長い（近傍界が広い）ためで、
            さらに 920MHz 帯ではアンテナだけでなく<strong>GNDプレーン全体が放射体</strong>として働くので、
            基板そのものの大きさも性能を左右する。
          </p>
          <p>出典（一次資料）:</p>
          <ul className="list-disc space-y-1 pl-4">
            {KEEPOUT_SOURCES.map((source) => (
              <li key={source.label}>
                <a
                  href={source.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-sky-900 underline decoration-sky-300 underline-offset-2 hover:text-sky-700"
                >
                  {source.label}
                </a>
                ｜{source.note}
              </li>
            ))}
          </ul>
        </div>
      </details>
    </Callout>
  );
}
