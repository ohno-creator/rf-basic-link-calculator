import { Globe } from "lucide-react";

import { Callout } from "@/components/Callout";

// Google Earth で記録を取り、実測値をページに重ねて考察する手順を伝えるコラム。

export function PropagationMeasurementColumn() {
  return (
    <Callout tone="info" size="lg" icon={<Globe aria-hidden="true" className="h-5 w-5" />}>
      <h2 className="text-lg font-bold">コラム：実測で深掘りする — Google Earth × モデル比較</h2>

      <div className="mt-3 space-y-3 text-sm leading-relaxed">
        <p>
          ここで並ぶ各モデルは、あくまで「平均的な環境」を仮定した中央値・基準値の推定です。実際の現場では、地形の起伏、建物や樹木の遮蔽、見通し（LOS/NLOS）、反射や回折によって、同じ距離でも損失は大きく変わります。
          そこで役立つのが、<span className="font-semibold">Google Earth を使って現地の条件を記録し、実測値をこのページに入れてモデルと重ねる</span>方法です。机上のモデルと現実のギャップを、自分の目で確かめながら理解できます。
        </p>

        <div>
          <p className="font-semibold text-sky-950">Google Earth での記録手順</p>
          <ol className="mt-2 list-decimal space-y-1.5 pl-5">
            <li>送信点（基地局・ゲートウェイ）と受信点（端末）に目印（ピン）を置く。</li>
            <li>「ものさし（定規）」ツールで2点間の直線距離を測る（km）。</li>
            <li>
              地形プロファイルで標高差・尾根や谷越えを確認し、見通しが通るか（LOS/NLOS）、間にある建物・樹木・その高さをメモする。
              幾何学的に見通しが通っても、第1フレネルゾーン（経路中央での半径の目安 ≈ 8.66×√(距離km ÷ 周波数GHz) m）が地形・建物・樹木でふさがれると回折損が出ます。標高データは地表ベースで植生や建物高を含まない場合がある点にも注意。
            </li>
            <li>
              現地の受信電力（RSSI / RSRP）から経路損失を概算する：
              <span className="font-semibold"> 経路損失 ≒ 送信電力 ＋ 送受信アンテナ利得 − 受信電力</span>
              （送受信機とアンテナの間にケーブル・コネクタ損失があれば、その分を含める）。
              RSSIは機器・規格で定義や確度が異なり、絶対値の経路損失への換算には数dBの系統誤差を含みます。可能なら校正済みの測定器やRSRPなど定義の明確な指標を使ってください。
            </li>
            <li>このページの「実測値を重ねる」に <span className="font-semibold">距離（km）と経路損失（dB）</span> を入力すると、グラフに黒点で重なります。</li>
          </ol>
        </div>

        <p>
          重ねてみると、<span className="font-semibold">どのモデル・どの距離損失指数 n が現地に最も近いか</span>が一目で分かります。
          実測がどのモデルからも外れるときは、地形による回折、建物・樹木のクラッタ、地面反射、マルチパス、屋内侵入損、給電系（ケーブル・整合）損失などを疑うサインです。
          複数地点（最大10点）を入れると、点の並びから現地の減衰の傾き（実効的な n）が見えてきて、考察が一段深まります。
        </p>

        <p className="rounded-md border border-sky-200 bg-white/70 p-3 text-xs text-sky-900">
          <span className="font-semibold">ヒント：</span>
          「結果をコピー」で条件・各モデルの損失・実測値をまとめて書き出し、ChatGPT などに貼り付けると、実測に合うモデルの選定理由や設計上の注意点まで踏み込んだ考察を補助できます。「PDFで印刷・保存」で測定記録として残せます。
          地図上の距離は水平直線距離なので、実際の反射・回折経路とは差が出る点、電波は時間変動する点に注意し、できれば複数回・複数地点で確認してください。
        </p>
      </div>
    </Callout>
  );
}
