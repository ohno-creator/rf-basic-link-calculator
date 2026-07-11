import { BookOpen } from "lucide-react";
import { Callout } from "@/components/Callout";
import { GROUND_PLANE_EFFECT_SOURCES } from "@/data/groundPlaneEffect";

/**
 * GNDプレーン寸法のコラム（二層読者設計: 表面=物語 / 深層=折りたたみの検証可能な出典）。
 * 題材: 「基板の裏側がアンテナの半分」— λ/4モノポールとGND鏡像、小型化で効率が消える実務の話。
 */
export function GroundPlaneSizeColumn() {
  return (
    <Callout tone="info" size="lg" icon={<BookOpen aria-hidden="true" className="h-5 w-5 text-sky-700" />}>
      <h2 className="text-base font-bold">コラム：基板の裏側がアンテナの半分</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-sky-950/90">
        <p>
          アンテナの教科書で最初に習うダイポールは、全長λ/2の一対の素子です。これを半分に切って
          大地に立てたのがモノポールで、マルコーニの長波送信以来の定番です。なぜ半分で済むのか。
          導体の大地が鏡になり、地面の下に逆さまの<strong>鏡像アンテナ</strong>が映るからです。
          本物のλ/4と鏡像のλ/4が合わさって1本のλ/2ダイポールとして動く——つまり
          <strong>アンテナの半分は、導体面の中にいます</strong>。
        </p>
        <p>
          IoT機器のチップアンテナやIFAも、この構図はまったく同じです。大地の代役を務めるのが
          基板のGNDプレーン。アンテナ部品のデータシートに載る性能は、たいてい推奨サイズの
          評価基板——つまり「十分に大きな鏡」——での値です。ところが920MHzのλ/4は約8.1cm。
          名刺（55×91mm）の短辺方向では足りません。基板を小型化するたびに、部品は同じでも
          <strong>アンテナの残り半分が物理的に削られていく</strong>のです。
        </p>
        <p>
          現場でよくあるのが「前の基板と同じアンテナ部品なのに、小型化した新基板では飛ばない」
          という相談です。犯人は部品ではなく、削られたGND。このツールの目安表のとおり、
          GND最長辺がλ/10だと約-6dB（電力で1/4）、λ/20なら約-12dB（1/16）です。しかもGNDが
          短いと共振周波数がずれて整合も外れるため、実際の落ち込みはこれに上乗せされます。
          外形寸法が決まった瞬間に、その基板のアンテナ性能の上限も決まっている——RF担当が
          企画段階で真っ先に外形図を欲しがるのは、このためです。
          ※「鏡」のたとえが厳密に成り立つのは無限に広い完全導体面だけで、実際の小さな基板では
          GND上を流れる有限のRF電流そのものがアンテナの一部として放射しています。
        </p>
      </div>
      <details className="mt-4 rounded-lg border border-sky-200 bg-white/70 p-4">
        <summary className="cursor-pointer text-sm font-semibold text-sky-900">
          深掘り（イメージ理論と出典）
        </summary>
        <div className="mt-3 space-y-2 text-xs leading-relaxed text-sky-950/80">
          <p>
            イメージ理論: 無限完全導体（PEC）面上のλ/4モノポールは、面下の鏡像と合わせて
            λ/2ダイポールと等価になる。放射は上半空間のみで、入力インピーダンスはダイポールの
            半分（約36.6Ω）。GNDが有限になると鏡像が不完全になり、放射抵抗の低下（効率低下）に
            加えて、電気長不足による共振周波数の上昇と整合ずれが同時に起きる。
          </p>
          <p>
            本ツールの目安表（λ/4→0dB・λ/10→-6dB・λ/20→-12dB・GNDなし→-20dB）は、下記の
            ベンダーアプリケーションノートに示される「GND最長辺とアンテナ性能」の実測系の目安を、
            Lg/λ の区分線形カーブとして転記したものです（src/data/groundPlaneEffect.ts）。
          </p>
          <ul className="list-disc space-y-1 pl-4">
            {GROUND_PLANE_EFFECT_SOURCES.map((source) => (
              <li key={source.href}>
                <a
                  className="font-semibold text-sky-900 underline decoration-sky-300 underline-offset-2 hover:text-sky-700"
                  href={source.href}
                  target="_blank"
                  rel="noreferrer"
                >
                  {source.label}
                </a>
                ：{source.note}
              </li>
            ))}
          </ul>
        </div>
      </details>
    </Callout>
  );
}
