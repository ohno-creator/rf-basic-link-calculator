import { BookOpen } from "lucide-react";
import { Callout } from "@/components/Callout";
import { columnSourceKindLabel, type ColumnSource } from "@/data/columnSources";

/**
 * RFアンチパターン図鑑のコラム（二層読者設計: 表面=物語 / 深層=折りたたみの検証可能な出典）。
 * 題材: 「失敗は仕様書に書かれない——アンチパターンが繰り返される理由」。
 * 出典は共有型 ColumnSource（@/data/columnSources）で保持する。
 */
const COLUMN_SOURCES: ColumnSource[] = [
  {
    label: "H. Petroski, \"To Engineer Is Human: The Role of Failure in Successful Design\" (1985)",
    kind: "book",
    note: "工学の知識は成功の模倣ではなく失敗の解析から蓄積される、という古典的整理",
    retrievedAt: "2026-07"
  },
  {
    label: "NASA Aviation Safety Reporting System (ASRS)",
    href: "https://asrs.arc.nasa.gov/",
    kind: "dataset",
    note: "1976年開設。匿名・免責つきで運航上のヒヤリハットを産業全体へ共有する報告データベース",
    retrievedAt: "2026-07"
  },
  {
    label: "IEEE Std 1028-2008 (Standard for Software Reviews and Audits)",
    kind: "standard",
    locator: "§6（インスペクション）",
    note: "欠陥を個人の記憶ではなく組織のプロセスとして検出・記録するレビュー体系の規格",
    retrievedAt: "2026-07"
  }
];

export function RfAntipatternsColumn() {
  return (
    <Callout tone="info" size="lg" icon={<BookOpen aria-hidden="true" className="h-5 w-5 text-sky-700" />}>
      <h2 className="text-base font-bold">コラム：失敗は仕様書に書かれない——アンチパターンが繰り返される理由</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-sky-950/90">
        <p>
          1974年、ワシントン近郊で旅客機が丘に激突しました。調査で分かった衝撃の事実は、
          そのわずか6週間前に別の航空会社の便が同じ場所で同じ勘違いをし、間一髪で難を逃れていたこと。
          教訓は社内には回覧されていましたが、<strong>会社の壁を越えなかった</strong>のです。
          この事故を機に生まれたのが、NASAが運営する匿名・免責つきの報告制度ASRSでした。
          「失敗の知識を組織の外へ流す配管」を業界ぐるみで作ったわけです。
        </p>
        <p>
          工学の世界では、成功は製品・カタログ・仕様書という形で自動的に残ります。ところが失敗は、
          担当者の記憶と恥の中にしか残りません。仕様書は「こう作れ」を書く文書であって、
          「こう作るな」を書く欄がないからです。土木技術者ペトロスキーは著書で、
          <strong>工学の進歩は成功の模倣ではなく失敗の解析から生まれる</strong>と喝破しました。
          橋の設計が進歩したのは、落ちた橋を徹底的に調べた人たちがいたからです。
        </p>
        <p>
          無線設計も同じです。「整合が良いのに飛ばない」「金属に貼ったら圏外」「コイン電池が冬に死ぬ」——
          この図鑑の10パターンは、どれも何十年も前から知られていて、いまも新しい製品で繰り返されています。
          うまくいく理由は製品ごとに違いますが、<strong>壊れる理由は物理で決まっているので毎回同じ</strong>。
          だから「うまくいった設計」を1つ真似るより、「壊れ方」を10個知るほうが応用が利くのです。
        </p>
        <p>
          アンチパターン集は予防接種に似ています。弱毒化した失敗を、安全な机の上で先に経験しておく。
          ※ただしこのたとえには破れがあります——ワクチンと違って、<strong>読むだけでは免疫はつきません</strong>。
          自分の設計条件を各パターンのリンク先ツールに入れ、誤差を自分の数字として一度見たときに、
          初めて身体に入ります。
        </p>
      </div>
      <details className="mt-4 rounded-lg border border-sky-200 bg-white/70 p-4">
        <summary className="cursor-pointer text-sm font-semibold text-sky-900">
          深掘り（出典）
        </summary>
        <ul className="mt-3 space-y-2 text-xs leading-relaxed text-sky-950/80">
          {COLUMN_SOURCES.map((source) => (
            <li key={source.label}>
              <span className="mr-1.5 inline-flex items-center rounded-full bg-sky-100 px-2 py-0.5 text-[11px] font-semibold text-sky-800">
                {columnSourceKindLabel[source.kind]}
              </span>
              {source.href ? (
                <a
                  href={source.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold underline decoration-sky-300 underline-offset-2 hover:decoration-sky-600"
                >
                  {source.label}
                </a>
              ) : (
                <span className="font-semibold">{source.label}</span>
              )}
              {source.locator ? <span className="ml-1 text-sky-900/70">{source.locator}</span> : null}
              {source.note ? <span className="ml-1">— {source.note}</span> : null}
              {source.retrievedAt ? <span className="ml-1 text-sky-900/60">（確認: {source.retrievedAt}）</span> : null}
            </li>
          ))}
        </ul>
      </details>
    </Callout>
  );
}
