import { Accordion } from "@/components/Accordion";
import { Card } from "@/components/Card";
import { CONTACT_URL } from "@/lib/rf/presets";

// フレネルゾーン半径が「理想的な見通しが稀なIoT現場」で持つ意味を掘り下げる解説。

export function FresnelDeepDive() {
  return (
    <Card as="section" padding="lg">
      <h2 className="text-lg font-bold text-slate-950">IoTの現場でフレネルゾーンをどう活かすか</h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-700">
        フレネルゾーンは「見通しが取れている理想的な状況」を前提に語られがちです。しかし実際のIoT現場では、送受信点の間に什器、棚、在庫、配管、人、車などが入り込み、第1フレネルゾーンの60%を常に確保できる環境はむしろ稀です。だからこそこの半径は、「どれだけ余裕（クリアランス）を見込むべきか」「どこに置けば損をしにくいか」を考えるための“ものさし”になります。
      </p>

      <div className="mt-4 space-y-3">
        <Accordion title="送信側の観点" defaultOpen>
          <p>
            送信アンテナは、できるだけ高く・周囲の障害物の上にゾーンを通すのが基本です。第1フレネルゾーンは経路の中央付近が最も太いため、送信点の近くより中央の遮蔽が効きます。設置高さ、向き（指向性・偏波）、壁や金属からの離隔を確保し、見通しに近い状態を作るほど安定します。
          </p>
        </Accordion>
        <Accordion title="受信側の観点">
          <p>
            受信側も高さと位置で改善できますが、IoT端末は動く・向きが変わる・人が持つことを前提に考える必要があります。反射波が重なって生じる深いフェージング（特定の場所だけ急に弱くなる）に備え、受信感度に余裕のあるモジュール選定や、アンテナダイバーシティ、設置位置の微調整が効きます。
          </p>
        </Accordion>
        <Accordion title="機器の設置場所の工夫">
          <p>
            ゾーンは中央が最も太いので、避けられない障害物は経路の端（送信点・受信点の近く）に寄せると影響が小さくなります。金属面・金属棚・配管から離す、部屋の隅を避ける、できるだけ高い位置や開口部の近くに置く、といった工夫でクリアランスを稼げます。数十cmずらすだけで通信が安定することも珍しくありません。
          </p>
        </Accordion>
        <Accordion title="物理限界">
          <p>
            フレネルゾーンの半径は波長で決まり、小さくはできません。アンテナをいくら小型化してもゾーンは縮みません。周波数が低いほどゾーンは太く障害物の影響を受けやすい一方、回折で回り込みやすくなります。高い周波数はゾーンが細い反面、遮蔽や反射に弱くなります。「完全な見通し」を現実の現場で作るのは難しい、という前提で設計するのが現実的です。
          </p>
        </Accordion>
        <Accordion title="車・人・建物の増設などの変化">
          <p>
            設置した瞬間は見通せていても、運用中に環境は変わります。人の往来、フォークリフトや駐車車両の移動、在庫・什器の増減、後からの増築やレイアウト変更で、経路が遮られることがあります。特に人体は2.4GHz帯をよく吸収します。「設置直後は動いていたのに、ある日つながらない」の多くは、この環境変化が原因です。
          </p>
        </Accordion>
      </div>

      <div className="mt-4 rounded-lg border border-staf/20 bg-staf-light p-4">
        <p className="text-sm font-semibold text-slate-950">だからこそ、マージンが重要</p>
        <p className="mt-2 text-sm leading-relaxed text-slate-700">
          見通しが不確実で、環境も時間とともに変わる以上、ぎりぎりの設計は危険です。フレネルゾーンの確保には限界があるからこそ、リンクバジェット上のリンクマージンに、フェージングや遮蔽、将来の環境変化を見込んだ余裕（数dB〜十数dB）を上乗せしておくことが、現場で「止まらない」無線をつくる鍵になります。
        </p>
        <a
          className="mt-3 inline-flex rounded-md bg-staf px-4 py-2 text-sm font-semibold text-white transition hover:bg-staf-dark"
          href={CONTACT_URL}
        >
          設置条件・マージン設計を相談する
        </a>
      </div>
    </Card>
  );
}
