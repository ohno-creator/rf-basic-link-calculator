import { BookOpen } from "lucide-react";
import { Callout } from "@/components/Callout";

/**
 * 同軸ケーブル損失のコラム（二層読者設計: 表面=物語 / 深層=折りたたみの検証可能な出典）。
 * 題材: 「同軸は長くするほど損をする、では基地局はなぜ塔の上に無線機を置くのか」
 *       — √f損失とフィーダーの足かせ、RRH/マストヘッドアンプが生まれた必然。
 */
export function CoaxCableLossColumn() {
  return (
    <Callout tone="info" size="lg" icon={<BookOpen aria-hidden="true" className="h-5 w-5 text-sky-700" />}>
      <h2 className="text-base font-bold">コラム：同軸は長いほど損をする。では基地局はなぜ塔の上に無線機を置くのか</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-sky-950/90">
        <p>
          昔の携帯基地局は、塔のふもとの小屋に無線機（BTS）を置き、太い同軸フィーダーで塔上の
          アンテナまで数十メートルの銅線を引き上げていました。この配置には避けられない税金があります——
          <strong>フィーダー損失</strong>。50mの7/8インチ同軸でも、2GHzでは片道で数dBが熱に化ける。
          送信では出力を、受信では感度を、行きも帰りも削られていきます。
        </p>
        <p>
          しかも損失は周波数とともに増えます。800MHz時代はまだ我慢できた損失が、2GHz、3.5GHzと
          上がるにつれ効いてくる。<strong>同軸の損失は周波数の平方根（√f）に比例して増え、長さには
          単純に比例</strong>する。塔の高さはそのままに周波数だけが上がっていくので、フィーダーは
          年々重い足かせになりました。
        </p>
        <p>
          答えは拍子抜けするほど素直でした——<strong>同軸が長いほど損をするなら、同軸を無くせばいい</strong>。
          無線機そのものをアンテナの真下、塔のてっぺんへ持ち上げる。これが RRH（リモート・ラジオ・ヘッド）です。
          塔の上と下を結ぶのは、もはや損失のほとんど無い光ファイバー（とDC給電）だけ。長い銅の同軸は
          50cmまで縮みました。受信側では塔上に低雑音増幅器（マストヘッドアンプ）を先に置き、
          フィーダー損失が感度を殺す前に信号を持ち上げます。
        </p>
        <p>
          たとえるなら、高いビルの屋上へ水を届けるのに、地上の1台のポンプで押し上げるのをやめて
          屋上にポンプを据えるようなもの。※このたとえは破れます: 水道管の圧力損は摩擦で周波数に
          関係しませんが、同軸の損失は<strong>表皮効果で周波数依存</strong>——高い周波数ほど電流が
          導体表面の薄い層に集まり抵抗が増える。だからミリ波では「塔の上に無線機」どころか、
          アンテナと無線機を一体化した AAU が必然になりました。
        </p>
      </div>
      <details className="mt-4 rounded-lg border border-sky-200 bg-white/70 p-4">
        <summary className="cursor-pointer text-sm font-semibold text-sky-900">
          深掘り（式と出典）
        </summary>
        <div className="mt-3 space-y-2 text-xs leading-relaxed text-sky-950/80">
          <p>
            同軸の減衰 α = α_c + α_d。導体損 α_c は表皮抵抗 R_s = √(πfμ/σ) に比例するため
            <span className="tabular-nums"> α_c ∝ √f</span>。誘電体損は α_d ∝ f·tanδ。低〜中周波では
            α_c が支配的なので、実務では「損失 ∝ √f」の近似（このツールの測定範囲外の外挿と同じ考え方）が
            使われる。長さには線形で、総損失[dB] = 単位長損失 × 長さ。
          </p>
          <p>
            表皮深さ δ = √(2/(ωμσ)) ∝ <span className="tabular-nums">1/√f</span>。周波数が4倍になると
            表皮抵抗は2倍、導体損もおよそ2倍になる。これが「√fで損をする」正体。
          </p>
          <p>
            受信側でフィーダー損失が効く理由は Friis の縦続雑音式 F = F₁ + (F₂−1)/G₁。フィーダー
            （受動損失 L・利得 G=1/L）を LNA の前に置くと、系の雑音指数はフィーダー損失ぶん丸ごと悪化する。
            LNA を塔上（フィーダーより前段）へ置けば系NF ≈ LNA の NF で済む——これがマストヘッドアンプ／
            RRH の受信側の狙い。
          </p>
          <p>
            出典: D. M. Pozar, &quot;Microwave Engineering,&quot; 4th ed., Wiley (2011), §2.7
            （同軸の減衰・表皮効果）／H. T. Friis, &quot;Noise Figures of Radio Receivers,&quot;
            Proc. IRE (1944)（縦続雑音指数）／CPRI Specification V7.0 (2015)
            （基地局のベースバンド REC と無線部 RE=RRH を結ぶフロントホール）。
          </p>
        </div>
      </details>
    </Callout>
  );
}
