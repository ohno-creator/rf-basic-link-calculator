import { BookOpen } from "lucide-react";
import { Callout } from "@/components/Callout";
import { DETUNING_SOURCES } from "@/data/detuningScenarios";

/**
 * 離調推定のコラム（二層読者設計: 表面=物語 / 深層=折りたたみの検証可能な出典）。
 * 題材: 「ケースに入れたら飛ばなくなった」— 誘電体装荷と近傍界の物語。
 */
export function DetuningEstimatorColumn() {
  return (
    <Callout tone="info" size="lg" icon={<BookOpen aria-hidden="true" className="h-5 w-5 text-sky-700" />}>
      <h2 className="text-base font-bold">コラム：「ケースに入れたら飛ばなくなった」——アンテナは裸で調整して、筐体で死ぬ</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-sky-950/90">
        <p>
          評価ボードでは完璧だったアンテナが、量産用の樹脂ケースに収めた瞬間に飛ばなくなる——
          IoT機器の開発で最も多い「最後の1週間の悲劇」です。犯人は不良品でも半田不良でもなく、
          <strong>アンテナのすぐそばに来た「モノ」そのもの</strong>。アンテナは自分の周囲の空間まで
          含めて共振器であり、裸の状態で合わせ込んだ調整は、周囲が空気であることを前提にしています。
        </p>
        <p>
          樹脂のような誘電体が近づくと、アンテナ周囲の電気力線の一部が誘電率の高い材料の中を
          通るようになります。材料の中では電波の波長が縮む（波長短縮）ため、同じ長さの素子が
          「電気的にはより長い」アンテナとして振る舞い、<strong>共振は必ず低い周波数へずれます</strong>。
          ずれるのは常に下方向——このツールのシフト率がすべて負値なのはそのためです。
          手で握れば人体（比誘電率が数十）でさらに大きくずれ、金属面が1mmまで迫れば
          鏡像電流で共振構造そのものが作り替えられて、整合はほぼ崩壊します。
        </p>
        <p>
          では、なぜ「3mm離す」だけでほぼ収まるのでしょうか。小形アンテナのごく近くには、
          放射せずに素子へ戻ってくる強い電磁界（近傍界）がまとわりついていて、その強さは
          距離とともに急激に——遠方界の距離減衰よりはるかに速く——弱まります。誘電体が
          この濃い領域に浸かるかどうかが勝負で、密着なら-3〜-5%だったシフトが、3mmの空隙で
          -1%以下まで縮むのはこの急峻な減衰のおかげです。筐体設計で「アンテナの周りに
          数mmの禁足地を確保する」のは、飾りではなく物理です。
          ※「近傍界の濃い霧を抜ける」というたとえは直感用で、実際の離調量は材料の誘電率・
          厚み・かかる面積・GND条件で連続的に変わり、3mmという距離自体に魔法があるわけでは
          ありません。
        </p>
        <p>
          だからこそ、アンテナの最終調整は<strong>量産筐体に組み込んだ状態</strong>で行うのが
          鉄則です。裸のアンテナの特性表は「筐体で下へずれる前の姿」にすぎず、ベンダの
          設計資料も一様に、最終判断は筐体込みの実測（できれば手把持や設置状態まで含めて）を
          求めています。このツールは、その実測の前に「どれくらいずれ得るか」の当たりを
          付けるための地図です。
        </p>
      </div>
      <details className="mt-4 rounded-lg border border-sky-200 bg-white/70 p-4">
        <summary className="cursor-pointer text-sm font-semibold text-sky-900">
          深掘り（数値レンジの出典）
        </summary>
        <div className="mt-3 space-y-2 text-xs leading-relaxed text-sky-950/80">
          <p>
            誘電体装荷による共振周波数低下の目安: 実効誘電率 εeff が上がると共振周波数は
            およそ 1/√εeff に比例して下がる。樹脂カバー（密着/1mm/3mm）・手把持・金属面近接の
            シフト率とVSWRレンジは、本ツールのデータ表（@/data/detuningScenarios）が転記した
            以下の公開資料による。
          </p>
          <ul className="list-disc space-y-1 pl-4">
            {DETUNING_SOURCES.map((source) => (
              <li key={source.label}>
                {source.href ? (
                  <a
                    href={source.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold underline decoration-sky-300 underline-offset-2 hover:text-sky-700"
                  >
                    {source.label}
                  </a>
                ) : (
                  <span className="font-semibold">{source.label}</span>
                )}
                <span className="ml-1">— {source.note}</span>
              </li>
            ))}
          </ul>
        </div>
      </details>
    </Callout>
  );
}
