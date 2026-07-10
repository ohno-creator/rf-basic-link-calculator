import { BookOpen } from "lucide-react";
import { Callout } from "@/components/Callout";

/**
 * IFA初期寸法のコラム（二層読者設計: 表面=物語 / 深層=折りたたみの検証可能な出典）。
 * 題材: 「板の上の逆F—スマホに必ず入っているアンテナ」— λ/4を折り曲げて基板に載せる工夫。
 */
export function IfaDimensionsColumn() {
  return (
    <Callout tone="info" size="lg" icon={<BookOpen aria-hidden="true" className="h-5 w-5 text-sky-700" />}>
      <h2 className="text-base font-bold">コラム：板の上の逆F—スマホに必ず入っているアンテナ</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-sky-950/90">
        <p>
          昔の携帯電話やトランシーバには、必ず銀色のロッドアンテナが飛び出していました。あれは
          <strong>4分の1波長のモノポール</strong>——地面（GNDプレーン）に対して垂直に立てた棒です。
          ところが端末が薄く小さくなると、棒を突き出す余地は消えていきます。そこでエンジニアは棒を
          根元から折り曲げ、基板の上に寝かせてしまいました。横から見るとアルファベットの「F」に
          見えるので<strong>逆Fアンテナ（IFA）</strong>と呼ばれます。短い縦棒が短絡ピン、その隣が
          給電ピン、長い横棒が放射体です。棒を板状に太らせて帯域を広げたものが
          <strong>PIFA（平面逆F）</strong>で、いまやスマホやBLEモジュールの定番になりました。
        </p>
        <p>
          折り曲げたおかげでアンテナは筐体の中に隠れましたが、代償もあります。2010年のiPhone 4は、
          金属フレームそのものをアンテナにした挑戦的な設計でした。ところが左下のすき間を指で握ると
          2本のアンテナがつながって同調がずれ、受信が急落する——いわゆる
          <strong>「アンテナゲート」</strong>です。ジョブズは「そう持たなければいい」と言い放ちましたが、
          これは小型アンテナが手や筐体にどれほど敏感かを示す象徴的な事件でした。このツールが
          「初期寸法」と念を押し、<span className="tabular-nums">±10〜20%</span>のずれを警告するのも
          まったく同じ理由です。
        </p>
        <p>
          ※「棒を折りたたむだけ」というたとえは形の直感用です。実際には折り曲げると放射体上の電流分布と
          GNDとの結合が変わり、共振周波数も帯域も動きます——だから小さく折り込むほど帯域は狭くなる、
          という代償を必ず払います。
        </p>
      </div>
      <details className="mt-4 rounded-lg border border-sky-200 bg-white/70 p-4">
        <summary className="cursor-pointer text-sm font-semibold text-sky-900">
          深掘り（式と出典）
        </summary>
        <div className="mt-3 space-y-2 text-xs leading-relaxed text-sky-950/80">
          <p>
            IFAは接地された折り返しモノポールで、短絡ピンが接地端（電圧0・電流最大）を作り、開放端との
            間で1/4波長共振する。放射体の展開長は一次近似で
            L ≈ <span className="tabular-nums">λ/4</span>、基板上では実効誘電率で短縮して
            L ≈ λ₀/(4√εeff)。給電点は短絡点の近傍に置き、その位置（短絡点で0Ω、開放端で最大）で
            入力インピーダンスを50Ωへ整合させる——本ツールの給電間隔
            <span className="tabular-nums"> L/12〜L/8</span> はその整合探索の初期範囲にあたる設計目安。
          </p>
          <p>
            線幅・GND寸法・筐体・手・部品配置は本簡易式に含まれないため、共振は実装で±10〜20%程度ずれる。
            最終寸法はEMシミュレーションまたは実測で追い込む前提の初期値として扱う。
          </p>
          <p>
            出典: C. A. Balanis, &quot;Antenna Theory: Analysis and Design,&quot; Wiley（逆F/PIFAの節）／
            K. Fujimoto &amp; J. R. James (eds.), &quot;Mobile Antenna Systems Handbook,&quot;
            Artech House／K. Hirasawa &amp; M. Haneishi, &quot;Analysis, Design, and Measurement of Small
            and Low-Profile Antennas,&quot; Artech House。
          </p>
        </div>
      </details>
    </Callout>
  );
}
