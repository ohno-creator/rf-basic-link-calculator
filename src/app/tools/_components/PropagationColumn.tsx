import { Map } from "lucide-react";
import { Callout } from "@/components/Callout";

/**
 * 伝搬損失モデルのコラム（二層読者設計: 表面=物語 / 深層=折りたたみの検証可能な出典）。
 * 題材: 「奥村カーブから3GPPまで、電波はどう地図に描かれてきたか」
 * — 実測（奥村）→式化（秦）→統計モデル（3GPP TR38.901）の系譜と、市街地で式が乱立する理由。
 */
export function PropagationColumn() {
  return (
    <Callout tone="info" size="lg" icon={<Map aria-hidden="true" className="h-5 w-5 text-sky-700" />}>
      <h2 className="text-base font-bold">コラム：奥村カーブから3GPPまで、電波はどう地図に描かれてきたか</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-sky-950/90">
        <p>
          1960年代の東京。電電公社（現NTT）の<strong>奥村善久</strong>らは測定車を市街地に走らせ、
          距離・周波数・アンテナ高を変えながら電界強度を膨大に測り続けました。その成果は数式ではなく
          <strong>一群の「曲線」</strong>——エンジニアは定規で曲線を読み取り、地形や街並みごとの
          補正項を足し引きして損失を見積もったのです。式ではなくグラフを読む時代でした。
        </p>
        <p>
          1980年、<strong>秦正治</strong>がその奥村カーブを1本の閉じた式に押し込めました。定規はいらず、
          電卓さえあれば市街地の伝搬損失が計算できる。この「式化」で携帯電話の基地局設計は一気に回り始め、
          <strong>奥村・秦（Okumura-Hata）</strong>は移動通信の共通言語になります。周波数帯を上へ広げた
          COST231-Hata も、この延長線上の兄弟です。
        </p>
        <p>
          やがて周波数がGHz帯へ上がり、都市の姿も複雑になると、単一の「中央値の式」では足りなくなりました。
          <strong>3GPP TR38.901</strong> は損失の平均だけでなく、場所ごとの<strong>ばらつき（シャドウイング）</strong>や
          見通し／非見通しの<strong>確率</strong>まで数式で記述する統計モデルへ進みます。UMa（都市マクロ）・
          UMi（都市マイクロ）・RMa（田園）と環境を分け、電波を「決めうちの一本線」ではなく「確率の帯」で描くのです。
        </p>
        <p>
          なぜ市街地だけ式が乱立するのか。建物の高さ、街路の幅、クラッタ（雑然とした遮蔽物）は場所ごとに違い、
          単一の決定論では捉えきれないからです。各モデルは結局「ある都市群を測った中央値」でしかなく、
          対象都市と周波数帯が変わるたびに係数が組み替えられ、新しい式が生まれます。これは
          <strong>地図に海岸線を描く作業</strong>に似ています——細部を覗くほど輪郭が複雑になり、
          一本の線では表しきれない。※ただしたとえは破れます。海岸線の複雑さは縮尺の問題ですが、電波の乱立は
          縮尺ではなく、建物ごとに反射・回折・散乱する物理そのものが原因です。
        </p>
      </div>
      <details className="mt-4 rounded-lg border border-sky-200 bg-white/70 p-4">
        <summary className="cursor-pointer text-sm font-semibold text-sky-900">
          深掘り（式・適用域と出典）
        </summary>
        <div className="mt-3 space-y-2 text-xs leading-relaxed text-sky-950/80">
          <p>
            <strong>奥村（1968）</strong>: 東京周辺の実測から得た「基準電界（自由空間比の中央値補正）＋各種補正曲線」。
            数式ではなくグラフ（曲線群）で提供され、150MHz〜1920MHz、距離1〜100km、基地局高30〜1000mを対象とした。
          </p>
          <p>
            <strong>秦（1980）</strong>: 奥村カーブを回帰した市街地の閉形式。
            <span className="tabular-nums">
              {" "}L = 69.55 + 26.16·log₁₀(f) − 13.82·log₁₀(h_b) − a(h_m) + (44.9 − 6.55·log₁₀(h_b))·log₁₀(d)
            </span>
            （f=150〜1500MHz、d=1〜20km、h_b=30〜200m、h_m=1〜10m。a(h_m)は移動局高の補正項）。
            郊外・開放地は市街地値からの補正で導く。COST231-Hata は係数を差し替え1500〜2000MHzへ拡張した。
          </p>
          <p>
            <strong>3GPP TR38.901</strong>: 0.5〜100GHz対象。ブレークポイント付き2傾斜のパスロスに、対数正規の
            シャドウフェージング σ_SF と LOS確率 P_LOS(d) を重ねた確率モデル（UMa/UMi/RMa/InH等のシナリオ別）。
          </p>
          <p>
            出典: Y. Okumura, E. Ohmori, T. Kawano, K. Fukuda, &quot;Field Strength and Its Variability in
            VHF and UHF Land-Mobile Radio Service,&quot; Rev. Elec. Commun. Lab., 16(9-10) (1968)／
            M. Hata, &quot;Empirical Formula for Propagation Loss in Land Mobile Radio Services,&quot;
            IEEE Trans. Veh. Technol., VT-29(3) (1980)／COST 231 Final Report (EUR 18957), &quot;Digital
            Mobile Radio Towards Future Generation Systems&quot; (1999)／3GPP TR 38.901, &quot;Study on
            channel model for frequencies from 0.5 to 100 GHz&quot;.
          </p>
        </div>
      </details>
    </Callout>
  );
}
