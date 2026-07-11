import { BookOpen } from "lucide-react";
import { Callout } from "@/components/Callout";

/**
 * 周波数と4G/5G Band早わかりのコラム（二層読者設計: 表面=物語 / 深層=折りたたみの検証可能な出典）。
 * 題材: 「プラチナバンド争奪戦」— なぜ800MHz帯が『プラチナ』と呼ばれるのか。
 */
export function CellularBandMapColumn() {
  return (
    <Callout tone="info" size="lg" icon={<BookOpen aria-hidden="true" className="h-5 w-5 text-sky-700" />}>
      <h2 className="text-base font-bold">コラム：プラチナバンド争奪戦——800MHzはなぜ「宝」になったのか</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-sky-950/90">
        <p>
          ガラケー時代の日本で、山あいの温泉宿でもビルの奥の会議室でも「つながる」と言われたのは、
          docomoとauでした。理由は企業努力だけではありません。両社は<strong>800MHz帯</strong>という
          低い周波数を握っていたのです。低い電波は波長が長く、障害物の裏へ回り込み、壁も透過する。
          同じ数の基地局を建てても、カバーできる面積がまるで違いました。
        </p>
        <p>
          その差を痛感したのがソフトバンクです。2006年にボーダフォン日本法人を買収したとき、
          手元にあった主力は2GHz帯（B1）。高い周波数は直進しかできず、ビルの谷間や屋内で途切れます。
          基地局を必死に増やしても「つながらない」という評判に苦しんだ同社は、低い帯の割当を
          総務省に求め続け、<strong>2012年にようやく900MHz帯（B8）を獲得</strong>します。このとき
          宣伝に使われた言葉が「プラチナバンド」——低い帯は貴金属に例えられるほどの資産だ、という
          わけです。
        </p>
        <p>
          歴史は繰り返します。2020年に本格参入した楽天モバイルの手元も1.7GHz帯（B3）だけでした。
          「地下や屋内で入らない」という同じ壁にぶつかった末、<strong>2023年10月、総務省は700MHz帯
          （B28の一部・わずか3MHz幅×2）を楽天に割り当て</strong>ます。テレビの地デジ移行で空いた帯域の
          再割当をめぐる、十数年越しの争奪戦の最新ラウンドでした。
        </p>
        <p>
          ただし「プラチナ＝万能の宝」というたとえはここで破れます——低い帯は物理的に幅が狭く、
          1社が持てるのは数MHz〜十数MHz。帯域幅こそ速度の原資なので、プラチナバンドでは高速通信は
          出せません。実際の網は、低い帯が「届く係」として面をつくり、n77/n78やミリ波が「速い係」
          として容量を稼ぐ分業で成り立っています。地図でバンドが低い側と高い側に散らばっているのは、
          この分業の見取り図なのです。
        </p>
      </div>
      <details className="mt-4 rounded-lg border border-sky-200 bg-white/70 p-4">
        <summary className="cursor-pointer text-sm font-semibold text-sky-900">
          深掘り（数字と出典）
        </summary>
        <div className="mt-3 space-y-2 text-xs leading-relaxed text-sky-950/80">
          <p>
            バンドの周波数レンジ: 3GPP TS 36.101 Table 5.5-1（E-UTRA operating bands。
            B8: UL 880–915 / DL 925–960MHz、B28: UL 703–748 / DL 758–803MHz など）／
            3GPP TS 38.101-1 Table 5.2-1（NR FR1: n77/n78/n79）・TS 38.101-2 Table 5.2-1（FR2: n257）。
          </p>
          <p>
            900MHz帯のソフトバンクへの割当は2012年（総務省 900MHz帯移動通信システムの開設計画の認定）。
            700MHz帯の楽天モバイルへの割当は2023年10月（総務省 700MHz帯における特定基地局の
            開設計画の認定。715–718MHz／770–773MHzの3MHz幅×2）。国内の割当状況は総務省
            「周波数割当計画」・電波政策資料（本ツールの通称表記は2026年時点）による。
          </p>
          <p>
            出典: 3GPP TS 36.101 / TS 38.101-1 / TS 38.101-2／総務省 周波数割当計画・
            700MHz帯および900MHz帯の開設計画認定資料／ソフトバンク・楽天モバイル各社の公開資料
            （プレスリリース・電波改善の説明資料）。
          </p>
        </div>
      </details>
    </Callout>
  );
}
