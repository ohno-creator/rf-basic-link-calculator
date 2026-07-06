import { BatteryCharging } from "lucide-react";
import { Callout } from "@/components/Callout";

/**
 * 電池寿命のコラム（二層読者設計: 表面=物語 / 深層=折りたたみの検証可能な出典）。
 * 題材: 「10年電池のIoTはどうやって実現するか」— 間欠送信＋深いスリープと、送信1回のコスト。
 */
export function BatteryLifeColumn() {
  return (
    <Callout
      tone="info"
      size="lg"
      icon={<BatteryCharging aria-hidden="true" className="h-5 w-5 text-sky-700" />}
    >
      <h2 className="text-base font-bold">コラム：10年電池のIoTは、どうやって実現するのか</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-sky-950/90">
        <p>
          水道メーターやガスメーター、農地に置かれたLPWAセンサー——電池交換なしで10年動く機器が、
          いまや当たり前になりました。種明かしはシンプルです。<strong>マイコンは、動いている時間より
          寝ている時間が圧倒的に長い</strong>。センサーが実際に電波を出すのは1日に数回、1回あたり
          数十ミリ秒から数秒だけ。その一瞬だけ数十mAを食いますが、これはスリープ中の数µA（マイクロアンペア）
          の実に数千〜1万倍もの電流です。
        </p>
        <p>
          だから設計思想はただ一つ、<strong>「どれだけ深く、どれだけ長く寝かせるか」</strong>。
          LoRaやNB-IoTのようなLPWAは、決めた周期にだけ起き上がって一発送信し、あとは時計（RTC）だけを
          生かした深いスリープに沈みます。送信1回のコストは電流×時間、つまり奪われる電荷（mA·s）で数える。
          送信を1時間に1回から1分に1回へ増やすと、この電荷が60倍積み上がり、寿命は年単位から
          月単位へと<strong>非線形に急落</strong>します。上の曲線が、その崖です。
        </p>
        <p>
          イメージは家計に似ています。貯金（電池容量）を、毎月の固定費（スリープ時の消費と自己放電）と、
          たまの大きな買い物（送信）で少しずつ取り崩す。買い物の回数を増やすほど貯金は早く尽きます。
          ——ただし<strong>たとえは一点で破れます</strong>。家計のお金は使わなければ減りませんが、
          電池は棚に置くだけでも自己放電で少しずつ抜けていく。だから「10年」の最後の壁は送信設計ではなく、
          電池そのものの自己放電率なのです。
        </p>
      </div>
      <details className="mt-4 rounded-lg border border-sky-200 bg-white/70 p-4">
        <summary className="cursor-pointer text-sm font-semibold text-sky-900">
          深掘り（式と出典）
        </summary>
        <div className="mt-3 space-y-2 text-xs leading-relaxed text-sky-950/80">
          <p>
            平均電流 Iavg = (Itx·ttx + Irx·trx)/T + Isleep（T=動作周期）。送信1回で奪われる電荷は
            Q = Itx·ttx［mA·s］で、周期Tで割った Q/T が送信の平均寄与になる。寿命[h] = 容量[mAh]·derate / Iavg[mA]
            （<span className="tabular-nums">1年 = 8760h</span>）。送信頻度 f=1/T を上げると平均電流が
            Iavg ≈ Q·f + Isleep と直線的に増え、寿命 ∝ 1/Iavg は反比例で崖のように落ちる。
          </p>
          <p>
            スリープ電流が支配的な領域では寿命 ≈ 容量·derate/Isleep の「天井」で頭打ちになるが、
            その天井を最終的に決めるのが電池の<strong>自己放電</strong>だ。塩化チオニルリチウム（Li-SOCl₂）
            一次電池は自己放電が +20℃で年1%未満と極めて低く、超長寿命IoTの定番になっている。
          </p>
          <p>
            出典: SAFT &quot;LS 14500&quot; Primary lithium (Li-SOCl₂) cell datasheet（self-discharge
            &lt; 1%/year @ +20℃）／Semtech &quot;SX1276/77/78/79&quot; Datasheet（TX/RX/Sleep 各電流）／
            Texas Instruments Application Report &quot;Coin Cells and Peak Current Draw&quot; SWRA349
            （duty-cycle平均電流とパルス負荷の扱い）。
          </p>
        </div>
      </details>
    </Callout>
  );
}
