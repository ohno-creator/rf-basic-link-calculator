export type BasicToolMeta = {
  slug: string;
  /** カード・ページ見出し用の短いタイトル */
  title: string;
  /** SEOタイトル（layoutのtemplateで「｜スタッフ株式会社」が付く） */
  metaTitle: string;
  /** カード説明・meta description 兼用 */
  description: string;
  /** カードに出す代表式 */
  formula: string;
  /** 結果の本質を一言で */
  essenceLead: string;
  canonical: string;
};

const SITE_TOOLS = "https://www.staf.co.jp/tools";

export const basicTools: BasicToolMeta[] = [
  {
    slug: "vswr-return-loss",
    title: "VSWR・リターンロス変換",
    metaTitle: "VSWR・リターンロス変換ツール｜反射係数・反射電力も計算",
    description:
      "VSWR、リターンロス、反射係数、反射電力を相互変換します。アンテナや伝送線路の整合の良し悪しを、定在波の図で直感的に確認できます。",
    formula: "VSWR = (1 + Γ) / (1 - Γ)",
    essenceLead: "整合が悪いほど、反射波が増えて定在波の山と谷が深くなります。",
    canonical: `${SITE_TOOLS}/vswr-return-loss`
  },
  {
    slug: "coaxial-cable-loss",
    title: "同軸ケーブル損失",
    metaTitle: "同軸ケーブル損失 計算ツール｜標準品の実測ロスを品番×周波数で",
    description:
      "標準品（変換・延長用）の同軸ケーブルについて、品番と周波数から1本あたりの挿入損失（実測値）を求めます。求めた合計を、リンクバジェットの「ケーブル・コネクタ損失」に入れて使えます。",
    formula: "合計損失[dB] = 1本あたり損失（実測の補間値） × 本数",
    essenceLead: "標準品の実測ロスを品番×周波数で。高周波ほど、本数が増えるほど損失は増えます。",
    canonical: `${SITE_TOOLS}/coaxial-cable-loss`
  },
  {
    slug: "microstrip-line",
    title: "マイクロストリップ線路",
    metaTitle: "マイクロストリップ線路シミュレーション｜特性インピーダンス・マイター曲げ設計",
    description:
      "基板上のマイクロストリップ線路の特性インピーダンス・実効比誘電率・電気長（λg・Vp・度）を計算し、曲げ（マイター）やグラウンドのスルーホール（ビア）ピッチの設計目安まで提案します。断面図・上面図つき。",
    formula: "Z0・εeff・λg＝f(W,h,εr,周波数)　ビアピッチ≈λg/10",
    essenceLead: "Z0と電気長はW・h・εr・周波数で決まり、ビアはλgの数分の1以下のピッチで打ちます。",
    canonical: `${SITE_TOOLS}/microstrip-line`
  },
  {
    slug: "fresnel-zone",
    title: "フレネルゾーン半径",
    metaTitle: "フレネルゾーン半径計算ツール｜見通し・クリアランスの目安",
    description:
      "周波数・距離・障害物位置から第1フレネルゾーン半径と60%クリアランスを計算します。経路の断面図で、どれだけ空けるべきかを確認できます。",
    formula: "r1 = √( λ × d1 × d2 / (d1 + d2) )",
    essenceLead: "電波は直線ではなく、楕円体の空間（フレネルゾーン）を通って伝わります。",
    canonical: `${SITE_TOOLS}/fresnel-zone`
  },
  {
    slug: "propagation-loss",
    title: "伝搬損失モデル比較",
    metaTitle: "伝搬損失モデル比較ツール｜自由空間・2波・Log-distance・奥村-秦/COST231-Hata",
    description:
      "自由空間損失、2波モデル、Log-distance、奥村-秦／COST 231-Hata を同じ条件で並べて比較できます。距離・周波数・アンテナ高を変えながら、2D断面図、距離カーブ、2波干渉の山谷を確認できます。",
    formula: "FSPL = 32.44 + 20·log10(f) + 20·log10(d) ／ Hata = 69.55 + 26.16·log10(f) − …",
    essenceLead: "同じ条件でも、選ぶモデルで伝搬損失の見積もりは大きく変わります。2波では直接波と反射波の干渉で局所的な山谷も出ます。",
    canonical: `${SITE_TOOLS}/propagation-loss`
  },
  {
    slug: "ncu-below-ground",
    title: "GL以下NCU・水道BOX診断",
    metaTitle: "GL以下NCU・水道BOX通信診断｜地下・メーターボックス内端末の追加損失を評価",
    description:
      "水道BOX、メーターボックス、マンホール、地下ピット内のNCU端末について、地上側伝搬と蓋・BOX・水分・アンテナ位置による追加損失を分けて、通信余裕をレンジで簡易評価します。",
    formula: "受信電力 = 送信電力 + 利得 − 地上側伝搬損失 − BOX追加損失 ± 実測補正",
    essenceLead: "GL以下の端末は、アンテナ高をマイナスにせず、蓋・BOX・水分・配置の追加損失として分けて評価します。",
    canonical: `${SITE_TOOLS}/ncu-below-ground`
  },
  {
    slug: "frequency-wavelength",
    title: "周波数・波長",
    metaTitle: "周波数・波長 計算ツール｜λ・λ/2・λ/4 とアンテナサイズ",
    description:
      "周波数から波長 λ、λ/2、λ/4、λ/8 を計算します。半波長アンテナの目安や、誘電率による波長短縮も図で確認できます。",
    formula: "λ[m] = 299,792,458 / 周波数[Hz]",
    essenceLead: "周波数が高いほど波長は短くなり、アンテナも小さくできます。",
    canonical: `${SITE_TOOLS}/frequency-wavelength`
  },
  {
    slug: "dbm-converter",
    title: "dBm 変換",
    metaTitle: "dBm / mW / W 変換ツール｜電力単位の相互変換",
    description:
      "dBm、mW、W のいずれか1つを入力すると、他の単位へ自動変換します。+10dBで10倍などのdBの感覚もデシベルスケールで確認できます。",
    formula: "mW = 10 ^ (dBm / 10)",
    essenceLead: "dBmは電力そのもの、dBは比率。リンクバジェットは足し引きで扱います。",
    canonical: `${SITE_TOOLS}/dbm-converter`
  },
  {
    slug: "db-feel",
    title: "dBを体感する",
    metaTitle: "dBを体感する｜+3dBで2倍・+6dBで距離2倍を直感理解",
    description:
      "dBは掛け算を足し算にするものさし。スライダーでdB→電力倍率・距離倍率を体感し、+3dBで約2倍・+6dBで距離2倍を直感的に理解できます。",
    formula: "電力倍率 = 10^(dB/10)　距離倍率 = 10^(dB/20)",
    essenceLead: "10倍ごとに+10dB。dBは掛け算を足し算にする『ものさし』です。",
    canonical: `${SITE_TOOLS}/db-feel`
  },
  {
    slug: "free-space-loss",
    title: "自由空間損失（FSPL）",
    metaTitle: "自由空間損失 FSPL 計算ツール｜距離と周波数による損失",
    description:
      "障害物のない理想空間で、距離により電波が弱くなる量（自由空間損失）を計算します。距離2倍で約6dB増えることも確認できます。",
    formula: "FSPL[dB] = 32.44 + 20log10(距離[km]) + 20log10(周波数[MHz])",
    essenceLead: "距離が伸びるほど、また周波数が高いほど、自由空間損失は大きくなります。",
    canonical: `${SITE_TOOLS}/free-space-loss`
  },
  {
    slug: "effective-aperture",
    title: "有効開口面積・受信面積",
    metaTitle: "有効開口面積 計算ツール｜アンテナ利得dBiを受信面積へ換算",
    description:
      "周波数とアンテナ利得から、有効開口面積 Ae を計算します。dBiを「電波を受ける面積」として理解でき、920MHz、Wi-Fi、Sub6などのサイズ感を比較できます。",
    formula: "Ae = λ²G / (4π)",
    essenceLead: "同じ利得でも、低い周波数ほど有効開口面積は大きくなります。",
    canonical: `${SITE_TOOLS}/effective-aperture`
  },
  {
    slug: "aperture-gain-beamwidth",
    title: "開口アンテナ利得・ビーム幅",
    metaTitle: "開口アンテナ利得・ビーム幅 計算ツール｜ホーン・レンズ・パラボラの概算",
    description:
      "開口径、周波数、開口効率から、ホーン・レンズ・パラボラなどの概算利得、半値ビーム幅、遠方界開始距離を計算します。",
    formula: "G = η(πD/λ)²　HPBW≈70λ/D",
    essenceLead: "開口が大きいほど利得は上がり、ビームは細くなります。",
    canonical: `${SITE_TOOLS}/aperture-gain-beamwidth`
  },
  {
    slug: "antenna-spacing",
    title: "アンテナ間隔 λ換算",
    metaTitle: "アンテナ間隔 λ換算ツール｜MIMO・複数アンテナ配置の基準",
    description:
      "アンテナ間隔を波長比 λ へ換算し、MIMOや複数アンテナ配置の距離感を周波数横断で比較します。",
    formula: "間隔[λ] = 物理間隔[m] / λ[m]",
    essenceLead: "アンテナ間隔はcmではなく、まずλで見ます。",
    canonical: `${SITE_TOOLS}/antenna-spacing`
  },
  {
    slug: "array-grating-lobe",
    title: "アレイ素子間隔・グレーティングローブ",
    metaTitle: "グレーティングローブ判定ツール｜アレイアンテナ素子間隔と走査角",
    description:
      "アレイアンテナの素子間隔とビーム走査角から、可視領域にグレーティングローブが出るかを判定します。",
    formula: "|sinθ0 + mλ/d| ≤ 1",
    essenceLead: "素子間隔が広いほど不要ローブが出やすく、広角走査ほど厳しくなります。",
    canonical: `${SITE_TOOLS}/array-grating-lobe`
  },
  {
    slug: "patch-antenna-dimensions",
    title: "矩形パッチアンテナ寸法",
    metaTitle: "矩形パッチアンテナ寸法計算ツール｜周波数・基板εr・厚みから概算",
    description:
      "中心周波数、基板の比誘電率、基板厚から、矩形マイクロストリップパッチアンテナの幅と長さを概算します。",
    formula: "W = c/(2f)√(2/(εr+1))　L = c/(2f√εeff) − 2ΔL",
    essenceLead: "パッチは基板上の実効波長で決まるため、自由空間のλ/2より短くなります。",
    canonical: `${SITE_TOOLS}/patch-antenna-dimensions`
  },
  {
    slug: "small-loop-resonance",
    title: "小型ループアンテナ共振",
    metaTitle: "小型ループアンテナ共振計算ツール｜インダクタンスと必要容量",
    description:
      "小型ループの直径、線径、巻数からインダクタンスを近似し、指定周波数で共振させるための容量を計算します。",
    formula: "L≈μ0N²r(ln(8r/a)-2)　C=1/((2πf)²L)",
    essenceLead: "小型ループは同調容量に敏感で、共振させるほど帯域とばらつきに注意が必要です。",
    canonical: `${SITE_TOOLS}/small-loop-resonance`
  },
  {
    slug: "radiation-resistance",
    title: "短縮アンテナ放射抵抗・効率",
    metaTitle: "短縮アンテナ放射抵抗・効率計算ツール｜短いモノポール/ダイポールの厳しさ",
    description:
      "波長より短いモノポール/ダイポールの放射抵抗を概算し、損失抵抗との比から効率目安を計算します。",
    formula: "Rr≈40π²(h/λ)² または 80π²(l/λ)²",
    essenceLead: "短いアンテナは放射抵抗が小さく、わずかな損失抵抗でも効率が下がります。",
    canonical: `${SITE_TOOLS}/radiation-resistance`
  },
  {
    slug: "small-antenna-limit",
    title: "小型アンテナ限界（ka・Q・帯域）",
    metaTitle: "小型アンテナ限界計算ツール｜ka・Chu限界Q・比帯域",
    description:
      "アンテナ外形を外接球半径で見た ka とChu限界Qを計算し、小型化と帯域の物理的な厳しさを可視化します。",
    formula: "ka = 2πa/λ　Qmin≈1/(ka)³+1/(ka)",
    essenceLead: "小さくするほどQが上がり、帯域は急に狭くなります。",
    canonical: `${SITE_TOOLS}/small-antenna-limit`
  },
  {
    slug: "large-array-near-field",
    title: "大型アレイ近傍界・遠方界判定",
    metaTitle: "大型アレイ近傍界判定ツール｜Fraunhofer距離とFresnel数",
    description:
      "周波数、アレイ開口、評価距離から、Fraunhofer距離、Fresnel数、近傍界/遠方界の目安を計算します。",
    formula: "Rff = 2D²/λ　F = D²/(λR)",
    essenceLead: "5G/6Gや大型開口では、遠方界の前提が想像以上に遠くなります。",
    canonical: `${SITE_TOOLS}/large-array-near-field`
  },
  {
    slug: "reflector-ris-size-effect",
    title: "反射板・RISサイズ効果",
    metaTitle: "反射板・RISサイズ効果計算ツール｜面積・距離・波長による概算",
    description:
      "反射板やRISを面積を持つ受動開口として見たときの上限利得、近傍界距離、2ホップ損失の目安を計算します。",
    formula: "Gsurface≈4πAη/λ²　L≈FSPL(d1)+FSPL(d2)-Gsurface",
    essenceLead: "反射面は面積、距離、波長、近傍/遠方界で効き方が変わります。",
    canonical: `${SITE_TOOLS}/reflector-ris-size-effect`
  }
];

export function getBasicTool(slug: string): BasicToolMeta | undefined {
  return basicTools.find((tool) => tool.slug === slug);
}
