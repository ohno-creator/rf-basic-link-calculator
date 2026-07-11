import { BookOpen } from "lucide-react";
import { Callout } from "@/components/Callout";

/**
 * OTA実装損失・デセンス分析のコラム（二層読者設計: 表面=物語 / 深層=折りたたみの検証可能な出典）。
 * 題材: 「TISだけ悪いとき、犯人はたいてい自分の中にいる」— OTAラボの定番デバッグ劇。
 */
export function OtaImplementationLossColumn() {
  return (
    <Callout tone="info" size="lg" icon={<BookOpen aria-hidden="true" className="h-5 w-5 text-sky-700" />}>
      <h2 className="text-base font-bold">コラム：TISだけ悪いとき、犯人はたいてい自分の中にいる</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-sky-950/90">
        <p>
          OTAラボで何度も繰り返される光景があります。TRPはほぼ計算どおりなのに、TISだけが数dB悪い。
          会議では真っ先にアンテナが疑われますが、アンテナ担当はこう反論できます——
          「効率が悪いなら、<strong>送信も同じだけ落ちるはず</strong>です」。整合やケーブル、筐体の吸収と
          いった受動的な損失は、行きも帰りも同じ道を通るぶん送受に対称に効きます。
          TISだけが沈むのは、その対称性が破れている証拠。つまり端末は、
          <strong>自分自身が出す雑音を聞いてしまっている</strong>のです。
        </p>
        <p>
          容疑者リストはいつも似ています。DC-DCコンバータのスイッチング高調波、カメラや
          ディスプレイのクロックとその高調波、メモリバスの放射。基本波は数百kHz〜数十MHzでも、
          高調波の櫛はGHz帯まで届き、その1本が運悪くRX帯に落ちると、受信機のノイズフロアが
          底上げされて感度がそのまま失われます。デバッグは地道です——カメラを止めてTISを測る、
          表示を止めて測る、電源の負荷を変えて測る。ある機能を止めた瞬間に数dB戻れば犯人確定。
          対策はシールド缶、スイッチング周波数の変更やスペクトラム拡散クロック、
          そして雑音源とハーネスをアンテナから遠ざけるレイアウトです。
        </p>
        <p>
          このツールがやっているのは、その切り分けの最初の一歩です。「隣の人のいびきがうるさくて
          相手の声が聞こえない。しかもいびきの主は自分」——という構図ですが、このたとえには破れが
          あります: 実際の受信機は眠って聞き逃すのではなく、自己雑音がSNRを連続的に削るため、
          劣化は「聞こえる/聞こえない」の二択ではなくdB単位でじわじわ効きます。
        </p>
      </div>
      <details className="mt-4 rounded-lg border border-sky-200 bg-white/70 p-4">
        <summary className="cursor-pointer text-sm font-semibold text-sky-900">
          深掘り（定義と出典）
        </summary>
        <div className="mt-3 space-y-2 text-xs leading-relaxed text-sky-950/80">
          <p>
            TRP（Total Radiated Power）は全球面で積分した放射電力、TIS（Total Isotropic
            Sensitivity）は全球面で平均した実効感度で、いずれも放射パターンの重み付き積分として
            定義される。受動的損失の送受対称性（相反性）を仮定すると、期待TRP = Pc + η、
            期待TIS = Sc − η となり、TISギャップとTRPギャップの差がノイズ性デセンスの推定値になる。
          </p>
          <p>
            デセンス（RF desense / platform noise）は、端末内部のディジタル・電源系ノイズが
            受信帯域へ結合し、実効ノイズフロアを底上げして感度を劣化させる現象の業界用語。
            TIS測定はBER/スループットの合否基準に依存するため、伝導感度と同一の判定条件で
            比較する必要がある。
          </p>
          <p>
            出典: CTIA, &quot;Test Plan for Wireless Device Over-the-Air Performance&quot;
            （TRP/TISの定義・測定手順）／3GPP TS 34.114, &quot;User Equipment (UE) / Mobile
            Station (MS) Over The Air (OTA) antenna performance; Conformance testing&quot;／
            3GPP TS 36.101（UE Power Class 3 = 23dBm。プリセットの伝導出力の根拠）。
          </p>
        </div>
      </details>
    </Callout>
  );
}
