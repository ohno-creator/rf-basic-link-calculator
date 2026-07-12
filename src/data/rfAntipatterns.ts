// RFアンチパターン図鑑（/tools/rf-antipatterns）の収録データ。
// 「症状 → なぜ起きる → 数字で見る誤差 → 正しいやり方 → 検証ツール」の5点セットで
// 繰り返される設計ミスを定量的に記録する。数値は lib/rf の各モデル・本サイトの
// 各ツールの前提（AGENTS.md の RF計算ルール: dB/線形の別・単位・適用条件）と整合させる。

import type { ColumnSource } from "./columnSources";

/** 深刻度: critical=現場で通信が成立しない級 / major=数dB〜10dB級の見積もり崩れ / minor=系統誤差・過剰設計。 */
export type AntipatternSeverity = "critical" | "major" | "minor";

export type RfAntipattern = {
  /** URLフラグメント・data-testid に使う安定ID（ケバブケース）。 */
  id: string;
  title: string;
  /** 症状の一言（現場で最初に観測される事象）。 */
  symptom: string;
  /** なぜ起きるか（誤解の構造）。 */
  whyItHappens: string;
  /** 数字で見る誤差（具体例つきの定量的な帰結）。 */
  quantifiedError: string;
  /** 正しいやり方（回避策・確認手順）。 */
  correctApproach: string;
  /** 数字を自分で再現できる本サイトのツール。 */
  toolHref: string;
  toolLabel: string;
  severity: AntipatternSeverity;
  sources: ColumnSource[];
};

/** 深刻度 → 表示ラベル。 */
export const antipatternSeverityLabel: Record<AntipatternSeverity, string> = {
  critical: "致命的",
  major: "重大",
  minor: "軽微"
};

/** 表示順を固定するための深刻度の並び（重い順）。 */
export const ANTIPATTERN_SEVERITY_ORDER: readonly AntipatternSeverity[] = [
  "critical",
  "major",
  "minor"
];

export const RF_ANTIPATTERNS: RfAntipattern[] = [
  {
    id: "s11-good-but-no-range",
    title: "S11が良いのに飛ばない",
    symptom: "「アンテナ整合は完璧（S11=-20dB）」と判断したのに、実機での屋外通信テストを行うと仕様の1/3の距離しか届かない。",
    whyItHappens:
      "S11（反射係数）は「アンテナに電力が入ったか」しか見ていません。入った電力が電波として放射されるか、損失抵抗（導体損・誘電体損・筐体への吸収）で熱になるかは、S11には一切現れません。整合と放射は別物です。",
    quantifiedError:
      "放射効率10%のアンテナは、整合が完璧（S11=-∞dB）でも実効利得が-10dBです。自由空間なら通信距離は10^(-10/20)≈0.32倍——距離が約1/3になります。小型化したアンテナほど放射抵抗が下がり、損失抵抗が相対的に電力を食います。",
    correctApproach:
      "S11に加えて放射効率（または全放射電力TRP）を必ず評価します。設計段階では放射抵抗と損失抵抗の比で効率の当たりを付け、最終判断はOTA測定で行います。",
    toolHref: "/tools/radiation-resistance",
    toolLabel: "放射抵抗と効率で確認する",
    severity: "critical",
    sources: [
      {
        label: "C. A. Balanis, Antenna Theory: Analysis and Design",
        kind: "book",
        locator: "第2章（放射効率 e_cd = R_r/(R_r+R_L) の定義）",
        note: "放射効率は放射抵抗と損失抵抗の分圧で決まり、整合とは独立",
        retrievedAt: "2026-07"
      },
      {
        label: "IEEE Std 145-2013 (Definitions of Terms for Antennas)",
        kind: "standard",
        locator: "radiation efficiency / gain の定義",
        note: "利得=指向性×放射効率。S11は定義に含まれない",
        retrievedAt: "2026-07"
      }
    ]
  },
  {
    id: "dbi-dbd-mixup",
    title: "dBiとdBdの取り違え",
    symptom: "カタログ利得どおりのはずが、リンクバジェットが常に2dBほど合わない。",
    whyItHappens:
      "dBiは等方性アンテナ基準、dBdは半波長ダイポール基準の利得で、同じアンテナでも数字が2.15dB違います（0dBd=2.15dBi）。カタログやカタログ転記の資料で単位表記が省略され、「5dB」とだけ書かれた数字をどちらかに思い込んで使うと系統誤差になります。",
    quantifiedError:
      "取り違え1箇所で2.15dBの系統誤差。送信側・受信側の両方で取り違えると最大4.3dB——自由空間の距離換算で約1.6倍の見込み違いになります。誤差は毎回同じ向きに出るため、実測との差として発見されにくいのが特徴です。",
    correctApproach:
      "利得は必ず単位（dBi/dBd）まで確認し、社内資料はdBiに統一して転記します。dBd表記を見たら+2.15dBしてdBiへ換算してから計算に入れます。",
    toolHref: "/tools/db-family",
    toolLabel: "dBの仲間たちで換算する",
    severity: "minor",
    sources: [
      {
        label: "IEEE Std 145-2013 (Definitions of Terms for Antennas)",
        kind: "standard",
        locator: "gain, isotropic / gain, relative の定義",
        note: "半波長ダイポールの利得は約1.64倍=2.15dBi",
        retrievedAt: "2026-07"
      }
    ]
  },
  {
    id: "hata-out-of-range",
    title: "奥村・秦モデルの適用域外への外挿",
    symptom: "伝搬モデルの計算値と実測が10dB以上ずれる。特に近距離・高所端末で顕著。",
    whyItHappens:
      "奥村・秦（Okumura-Hata）モデルは、東京での実測カーブを回帰した経験式です。適用域は周波数150〜1500MHz・基地局高30〜200m・端末高1〜10m・距離1〜20km。式は適用域外の値を入れても数字を返してしまうため、検証データが存在しない領域への外挿だと気づきにくいのです。",
    quantifiedError:
      "端末高10m超（ビル屋上設置など）や距離500m（下限1kmの半分）は、そもそも回帰の元データがない領域です。数字は出ますが精度の保証はゼロで、環境タイプの選び間違いだけでも900MHz・1kmで都市↔開放地の差が28dB級あることを考えると、域外外挿の誤差は容易に10dBを超えます。",
    correctApproach:
      "入力が適用域に収まっているかを毎回確認します。近距離・特殊高さの条件では、自由空間損失＋実測ベースの補正、または適用域が合う別モデルを使い、最終的には現地実測で較正します。",
    toolHref: "/tools/propagation-loss",
    toolLabel: "伝搬損失モデル比較で適用域を確認する",
    severity: "major",
    sources: [
      {
        label: "M. Hata (1980) IEEE Trans. Veh. Technol. VT-29, pp.317-325",
        href: "https://doi.org/10.1109/T-VT.1980.23859",
        kind: "paper",
        locator: "式(16)-(20)・適用範囲の記述",
        note: "適用域（f 150-1500MHz / hb 30-200m / hm 1-10m / d 1-20km）の原典",
        retrievedAt: "2026-07"
      }
    ]
  },
  {
    id: "double-counted-loss",
    title: "同じ損失の二重計上",
    symptom: "リンクバジェットが常に悲観的で、「届かないはず」の現場で普通に届く。",
    whyItHappens:
      "環境損失のプリセット（例: 屋内・壁2枚相当）を選んだうえで、さらに「筐体・設置損失」に同じ壁の分を手で足してしまうミスです。損失項目の名前が違うだけで物理的な中身が同じものを、気づかず2回引いています。",
    quantifiedError:
      "壁1枚10dBを二重計上すると、リンクマージンを10dB少なく見積もります。距離換算で約3倍ぶんの到達力を捨てる計算になり、不要な高利得アンテナ・送信電力アップ・中継器追加という過剰設計（コスト増）に直結します。",
    correctApproach:
      "損失項目ごとに「物理的に何の損失か」を1行で書き出し、同じ障害物が2項目に現れていないか照合します。プリセットを使うときは、その中に何が含まれているかを必ず確認してから追加損失を足します。",
    toolHref: "/tools/rf-basic-link-calculator",
    toolLabel: "リンクバジェット診断で内訳を見る",
    severity: "minor",
    sources: [
      {
        label: "ITU-R P.2109-1 (Prediction of building entry loss)",
        href: "https://www.itu.int/rec/R-REC-P.2109",
        kind: "standard",
        locator: "§1（モデルの適用範囲）",
        note: "建物侵入損失の統計モデル。外壁の透過はここに含まれ、壁ごとの加算と併用すると二重計上になる",
        retrievedAt: "2026-07"
      }
    ]
  },
  {
    id: "dbm-plus-dbm",
    title: "dBm＋dBmの足し算",
    symptom: "送信機2台の合成出力や干渉電力の合計が、実測より常に大きく出る。",
    whyItHappens:
      "dBmは絶対電力の対数表記なので、dBm同士は足せません。足してよいのは「dBm＋dB（利得・損失）」だけです。電力の合成は一度mWなどの線形値に戻してから加算し、再びdBmへ変換する必要があります。",
    quantifiedError:
      "10dBm＋10dBmを「20dBm」とすると誤りです。正しくは10mW＋10mW＝20mW＝13dBm。7dBの過大評価＝電力で5倍の見込み違いになります。等電力2波の合成は常に+3dB（2倍）です。",
    correctApproach:
      "「dBmは掛け算の世界の数字」と覚え、電力の合計が必要な場面では線形（mW）へ戻して足します。dBmに足してよいのは無次元のdB（利得・損失）だけ、という規律を計算シートにも明記します。",
    toolHref: "/tools/db-family",
    toolLabel: "dBの仲間たちで単位の規律を確認する",
    severity: "major",
    sources: [
      {
        label: "T. S. Rappaport, Wireless Communications: Principles and Practice",
        kind: "book",
        locator: "第3章（リンクバジェットとdB演算の基礎）",
        note: "dBm/dBの演算規則（絶対値と比の区別）の標準的教科書",
        retrievedAt: "2026-07"
      }
    ]
  },
  {
    id: "flush-on-metal",
    title: "金属面へのアンテナのベタ付け設置",
    symptom: "開発室の木製デスク上では良好だったのに、現地で金属製の制御盤や配電盤の扉へ直貼りした途端、ほぼ圏外になる。",
    whyItHappens:
      "金属面と平行に置いたアンテナは、イメージ理論により面の奥に逆位相の鏡像アンテナを持ちます。面との距離d→0では直接波と鏡像波が打ち消し合い、正面方向の放射がヌル（理論上-∞dB）になります。「金属に貼れば背面が反射板になって強くなる」という直感が逆に働く典型例です。",
    quantifiedError:
      "d=0でヌル（実環境でも-20dB以下の深い落ち込み）、d=λ/4で+6dB（電界2倍）。その差は26dB以上です。920MHzならλ/4≈81mm、2.4GHzなら≈31mm——数cmの離隔で「圏外」と「+6dB」が分かれます。",
    correctApproach:
      "金属面からλ/4を目安に離隔します。離せない場合は、金属面をGNDとして使う前提のアンテナ（パッチ・逆Fなど）へ設計を切り替えます。",
    toolHref: "/tools/metal-plane-effect",
    toolLabel: "金属板の影響を距離で確認する",
    severity: "critical",
    sources: [
      {
        label: "C. A. Balanis, Antenna Theory: Analysis and Design",
        kind: "book",
        locator: "第4章（イメージ理論・導体面上のアンテナ）",
        note: "完全導体面に平行な電流素子の鏡像は逆位相（反射係数-1）",
        retrievedAt: "2026-07"
      }
    ]
  },
  {
    id: "cr2032-lora",
    title: "CR2032でLoRa送信",
    symptom: "平均消費電流から電池容量（225mAh）を単純に割り算した計算では2年持つはずが、実機は数週間〜数か月で動作停止。冬場の低温時に特に早く停止する。",
    whyItHappens:
      "CR2032の公称容量（約225mAh）は標準負荷0.2mAの連続放電で規定された値です。内部抵抗が数十Ω以上と高いため、LoRa送信の数十mA級パルスが流れると内部の電圧降下で端子電圧が機器のカットオフを割り、容量を使い切る前にシステムが落ちます。低温では内部抵抗がさらに上がり悪化します。",
    quantifiedError:
      "大電流パルス負荷では実効容量が公称の1/4以下に落ち得ます。例えば内部抵抗30Ωに30mAのパルスが流れるだけで0.9Vの降下——3Vのコイン電池では即座に2.1V付近まで沈む計算で、多くのMCU/無線ICのブラウンアウト閾値に触れます。",
    correctApproach:
      "データシートの放電条件（連続0.2mA基準か、パルス条件の規定があるか）を確認し、パルス電流に耐える電池（スパイラル形リチウム塩化チオニル、リチウムマンガンの円筒形など）を選ぶか、大容量コンデンサでパルスを平均化します。寿命計算にはパルス劣化係数を入れます。",
    toolHref: "/tools/battery-life",
    toolLabel: "電池寿命をパルス条件込みで見積もる",
    severity: "critical",
    sources: [
      {
        label: "Panasonic コイン形リチウム電池 CR2032 データシート",
        kind: "datasheet",
        locator: "定格（公称容量225mAh・標準放電電流0.2mA）",
        note: "公称容量は0.2mA連続放電基準。パルス負荷特性は別掲",
        retrievedAt: "2026-07"
      },
      {
        label: "T. S. Rappaport, Wireless Communications: Principles and Practice",
        kind: "book",
        locator: "第1章（無線端末の電源設計に関する一般論）",
        note: "デューティ比の低い無線送信のピーク/平均電流比の考え方",
        retrievedAt: "2026-07"
      }
    ]
  },
  {
    id: "keepout-ignored",
    title: "キープアウト無視の詰め込み実装",
    symptom: "評価ボードでは飛んだのに、量産基板に載せ替えたら感度が明らかに悪い。",
    whyItHappens:
      "チップアンテナのカタログ特性は、データシート指定のGNDクリアランス（キープアウト領域）と基板寸法での測定値です。実装密度を優先してキープアウトに部品や配線・GNDを侵入させると、アンテナの近傍界が乱されて共振周波数がずれ、効率が落ちます。アンテナは「その部品単体」ではなく「空き地込みの構造」で動いています。",
    quantifiedError:
      "電気的に小さいアンテナほど周囲の体積を放射に使っており（Wheelerの小形アンテナ限界）、キープアウト不足は共振ずれ＋効率低下として現れます。効率が半分になれば-3dB、1/4なら-6dB——リンクバジェットの利得欄がまるごと嘘になります。本サイトの判定でも必要寸法に対し不足率20%以上をdanger（要再設計）としています。",
    correctApproach:
      "アートワーク開始前にデータシートのキープアウト寸法を配置図へ落とし、確保できない場合はアンテナ選定からやり直します。「あとで詰める」は不可逆で、切削での後修正はできません。",
    toolHref: "/tools/antenna-keepout",
    toolLabel: "キープアウト充足を判定する",
    severity: "major",
    sources: [
      {
        label: "H. A. Wheeler (1947) \"Fundamental Limitations of Small Antennas,\" Proc. IRE",
        kind: "paper",
        locator: "小形アンテナの放射Q と占有体積の関係",
        note: "小さいアンテナは周囲の体積（空き地）を放射に使うという物理的根拠",
        retrievedAt: "2026-07"
      },
      {
        label: "各社チップアンテナ データシート（推奨ランドパターン・GNDクリアランス）",
        kind: "datasheet",
        note: "カタログ利得・効率は指定キープアウトと指定基板寸法での測定値",
        retrievedAt: "2026-07"
      }
    ]
  },
  {
    id: "los-equals-link",
    title: "「見通しがある＝届く」",
    symptom: "送受信点はお互いに見えているのに、リンクマージンが計算より数dB足りない。",
    whyItHappens:
      "電波は光線ではなく、経路の周囲に広がる楕円体（フレネルゾーン）を使って伝わります。幾何学的な見通し線が通っていても、第1フレネルゾーンに地面・建物・樹木が食い込んでいれば回折損失が発生します。「目で見えるか」と「電波が通るか」は基準が違うのです。",
    quantifiedError:
      "障害物が見通し線ぎりぎり（ナイフエッジのv=0）にあるだけで約6dBの回折損失。実務則の「第1フレネルゾーンの60%を確保」（v≈-0.85）でようやく回折損失≈0dBです。900MHz・1kmリンクの中点では第1フレネル半径は約9m——アンテナ高が数mだと地面だけで容易に食い込みます。",
    correctApproach:
      "距離・周波数から第1フレネル半径を計算し、経路の最悪地点で60%クリアランスが取れるアンテナ高を確保します。取れない場合は回折損失を数dB〜十数dB、リンクバジェットに明示的に積みます。",
    toolHref: "/tools/fresnel-zone",
    toolLabel: "フレネルゾーン半径を計算する",
    severity: "major",
    sources: [
      {
        label: "ITU-R P.526 (Propagation by diffraction)",
        href: "https://www.itu.int/rec/R-REC-P.526",
        kind: "standard",
        locator: "単一ナイフエッジ回折の節（v=0で約6dB）",
        note: "回折損失とフレネル・キルヒホッフ回折パラメータvの関係",
        retrievedAt: "2026-07"
      }
    ]
  },
  {
    id: "single-rssi-distance",
    title: "一点のRSSIで到達距離を断定",
    symptom: "現地試験では良好だったのに、量産設置後に一定割合の局が不安定になる。",
    whyItHappens:
      "受信電力の実測値は、遮蔽物の配置で決まるシャドウイングにより、同じ距離でも場所ごとに対数正規分布でばらつきます（標準偏差σは都市部で8dB級）。一点のRSSIはその分布からの1サンプルにすぎず、「この距離なら届く」の代表値にはなりません。感度ぎりぎりの一点測定は、実は50%の地点で切れる設計です。",
    quantifiedError:
      "σ=8dBの環境で信頼率90%を狙うなら、必要マージンはσ×1.28≈10.3dB。「実測RSSI-100dBm・感度-105dBmだから5dB余裕」は50%地点の話で、90%設計にはさらに約10dBの上積みが要ります。99%ならσ×2.33≈18.6dBです。",
    correctApproach:
      "目標信頼率を先に決め、環境に応じたσから統計マージンを計算してリンクバジェットに積みます。実測するなら複数地点・複数回で中央値とばらつきの両方を取ります。",
    toolHref: "/tools/shadowing-margin",
    toolLabel: "シャドウイング統計マージンを計算する",
    severity: "major",
    sources: [
      {
        label: "3GPP TR 38.901 (Study on channel model for frequencies from 0.5 to 100 GHz)",
        href: "https://www.3gpp.org/DynaReport/38901.htm",
        kind: "standard",
        locator: "Table 7.4.1-1（σ_SF）",
        note: "シナリオ別のシャドウフェージング標準偏差の代表値",
        retrievedAt: "2026-07"
      },
      {
        label: "T. S. Rappaport, Wireless Communications: Principles and Practice",
        kind: "book",
        locator: "第4章（対数正規シャドウイングとカバレッジ信頼率）",
        note: "必要マージン=σ·Q⁻¹(1-p) の標準的定義",
        retrievedAt: "2026-07"
      }
    ]
  }
];
