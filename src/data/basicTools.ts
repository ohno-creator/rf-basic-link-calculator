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
  }
];

export function getBasicTool(slug: string): BasicToolMeta | undefined {
  return basicTools.find((tool) => tool.slug === slug);
}
