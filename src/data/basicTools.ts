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
    metaTitle: "同軸ケーブル損失 計算ツール｜フィードライン損失をdBで",
    description:
      "U.FLピッグテールやSMAケーブルなど、同軸フィードラインの損失をdBで見積もります。ケーブル種別・長さ・周波数から、リンクバジェットの「ケーブル・コネクタ損失」に入れる値を求められます。",
    formula: "損失[dB] = α(f) × 長さ,  α(f) = α₂.₄GHz × √(f/2400)",
    essenceLead: "細い・長い・高周波のケーブルほど、フィードラインで失われるdBは増えます。",
    canonical: `${SITE_TOOLS}/coaxial-cable-loss`
  },
  {
    slug: "microstrip-line",
    title: "マイクロストリップ線路",
    metaTitle: "マイクロストリップ線路シミュレーション｜特性インピーダンス・マイター曲げ設計",
    description:
      "基板上のマイクロストリップ線路の特性インピーダンスを計算し、曲げについては動作周波数から「気にすべきか」を判定してマイター・45°・円弧の対策を提案します。断面図と上面図つき。",
    formula: "Z0 = f(W, h, εr)　曲げの要否は W と λg=c/(f√εeff) の比で判定",
    essenceLead: "特性インピーダンスはW・h・εrで決まり、曲げが効くかは周波数（波長）次第です。",
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
    title: "伝搬損失（奥村-秦）",
    metaTitle: "伝搬損失計算ツール｜奥村-秦・COST 231-Hata モデル",
    description:
      "市街地・郊外などの実環境の伝搬損失を、奥村-秦／COST 231-Hata モデルで推定します。距離に対する損失カーブで、エリアと距離の効きを確認できます。",
    formula: "L = 69.55 + 26.16·log10(f) − 13.82·log10(hb) − a(hm) + …",
    essenceLead: "実環境の損失は、自由空間損失に建物や地形の影響を足したものです。",
    canonical: `${SITE_TOOLS}/propagation-loss`
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
