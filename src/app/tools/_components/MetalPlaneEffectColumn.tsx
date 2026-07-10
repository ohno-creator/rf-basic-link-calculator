import { BookOpen } from "lucide-react";
import { Callout } from "@/components/Callout";

/**
 * 金属面近接のコラム（二層読者設計: 表面=物語 / 深層=折りたたみの検証可能な出典）。
 * 題材: 「鏡像法」という一つのアイデアが、壁ぎわのアンテナの死因も、
 * 八木アンテナの反射器も、パラボラの効きも、同じ理屈で説明してしまう物語。
 */
export function MetalPlaneEffectColumn() {
  return (
    <Callout tone="info" size="lg" icon={<BookOpen aria-hidden="true" className="h-5 w-5 text-sky-700" />}>
      <h2 className="text-base font-bold">
        コラム：壁ぎわのアンテナはなぜ死ぬのか、そしてなぜ反射板は効くのか
      </h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-sky-950/90">
        <p>
          金属筐体にアンテナをベタ付けした試作機が、まったく飛ばない——量産前の現場でよく起きる事故です。
          原因を「アンテナの不良」と疑う前に、19世紀の一枚の数学的トリックを思い出すと一発で腑に落ちます。
          <strong>鏡像法（method of images）</strong>。ウィリアム・トムソン（後のケルビン卿）が
          静電気の難問を解くために編み出した、「導体面の手前に電荷を置くのは、面の奥に符号を反転した
          『鏡像』の電荷を置くのと数学的に同じ」という発想です。
        </p>
        <p>
          電波でもまったく同じことが起きます。完全な金属面の手前 d にアンテナを置くと、面の奥 d に
          <strong>位相が反転した（逆相の）鏡像アンテナ</strong>ができたのと等価になります。すると空間には、
          本物の電波と鏡像の電波の二つが重なる。二つが強め合えば利得は最大 +6dB 上がり、打ち消し合えば
          消える。板に密着（d→0）させると逆相の二波がぴったり相殺して、電波はほとんど外へ出ません。
          「ベタ付けで飛ばない」の正体は、アンテナの故障ではなく、この<strong>逆相の鏡像による自己相殺</strong>
          だったのです。意外なのは、同じ鏡像が d=λ/4 では強い味方に化けること。
          往復 λ/2 ぶんの遅れが逆相を打ち消して同相にそろい、電波は前方へ +6dB 集中します。
        </p>
        <p>
          この「面を味方につける」設計思想が、そのままアンテナ史の背骨になっています。八木秀次と宇田新太郎が
          1920年代に実現した八木・宇田アンテナは、給電素子のうしろに置いた無給電の
          <strong>反射器（リフレクタ）</strong>で電波を前方へ押し出す——金属面の鏡像効果を一本の棒で
          近似したものです。さらに面を放物線に湾曲させて焦点へ全反射をそろえたのがパラボラアンテナ。
          衛星放送のあの皿も、根っこは「導体面が作る逆相の鏡像」という同じ一行の物理です。
        </p>
        <p>
          ただし現場の板は無限に大きくも、完全な鏡でもありません。<strong>板が有限だとエッジで電波が
          回り込み（エッジ回折）、理論では −∞ になるはずの深いヌルは埋まって −15〜−25dB 程度で底を打ちます。</strong>
          「密着させても少しは飛ぶ」のはこのおかげで、逆に「λ/4 離せば理論どおり +6dB」も、板が小さければ
          +3〜+5dB に目減りします。鏡像法は当たりを付ける地図であって、最後は実測で追い込む——
          それが金属近接設計の鉄則です。
        </p>
      </div>
      <details className="mt-4 rounded-lg border border-sky-200 bg-white/70 p-4">
        <summary className="cursor-pointer text-sm font-semibold text-sky-900">
          深掘り（境界条件・式・出典）
        </summary>
        <div className="mt-3 space-y-2 text-xs leading-relaxed text-sky-950/80">
          <p>
            <strong>境界条件</strong>: 完全導体（PEC）面では、面に接する電界の接線成分がゼロでなければならない。
            この条件を満たすために、面の奥に符号を反転した鏡像源を置く。水平（面に平行）な電流素子は
            <strong>逆相の鏡像</strong>（反射係数 −1）、垂直な素子は同相の鏡像になる。本ツールは面に平行な
            アンテナ（水平素子）を仮定しており、正面方向の電界係数は
            F(x)=2·|sin(2πx)|（x=d/λ、線形・無次元 0..2）、利得変化 ΔG=20·log₁₀(F)[dB]。
            d=λ/4 で F=2（ΔG=+20·log₁₀2≈+6.02dB）、d=n·λ/2 で F=0（ΔG=−∞）。
          </p>
          <p>
            <strong>有限地板の効果</strong>: 実際の地板は波長オーダーの有限平板で、エッジからの回折波が
            主ローブに回り込む。この寄与で理論上の −∞ ヌルは埋まり、ピークもわずかに低下する。厳密には
            幾何光学的回折理論（GTD/UTD）やモーメント法（MoM）で評価する。板が概ね 1λ 角以上あれば
            +6dB ピーク・深いヌルの傾向は良く再現される。
          </p>
          <p>
            出典: W. Thomson, &quot;Geometrical investigations with reference to the distribution of electricity
            on spherical conductors,&quot; Cambridge and Dublin Math. J. (1848)〈鏡像法〉／
            C. A. Balanis, &quot;Antenna Theory: Analysis and Design,&quot; 4th ed., Wiley, Ch.4
            &quot;Image Theory / Antennas above a perfect conductor&quot;／
            H. Yagi, &quot;Beam Transmission of Ultra Short Waves,&quot; Proc. IRE (1928)〈反射器・導波器〉。
          </p>
        </div>
      </details>
    </Callout>
  );
}
