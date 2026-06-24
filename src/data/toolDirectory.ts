export type ToolCategory = {
  id: string;
  label: string;
  /** カテゴリ見出しに添える1〜2文の用途説明（何のための区画か）。 */
  description: string;
};

export const toolCategories: ToolCategory[] = [
  {
    id: "link",
    label: "リンク設計",
    description: "通信が届くかどうかを、送受信電力・距離・損失から見積もる基本系。まずはここから。"
  },
  {
    id: "antenna",
    label: "アンテナ設計",
    description: "アンテナの寸法・利得・配置を、波長と基板条件から実務的に概算するツール。"
  },
  {
    id: "basics",
    label: "単位・基礎",
    description: "dB・dBm・波長など、RFで使う共通言語を直感的につかむための入口。"
  },
  {
    id: "line",
    label: "線路・整合",
    description: "ケーブル・基板配線・整合の損失と反射を扱う、ハードウェア寄りのツール。"
  },
  {
    id: "learning",
    label: "学習クエスト",
    description: "用語から実測レビューまで、RF設計の判断を問題形式で身につける。"
  },
  {
    id: "research",
    label: "研究者モード",
    description:
      "難しそうな研究用語を、設計判断に使える形へほどく区画です。『なぜ小型アンテナは難しいのか』『なぜ大きなアレイは近距離でも普通に扱えないのか』を、数値と図で確認できます。"
  }
];

export type DirectoryTool = {
  href: string;
  name: string;
  tagline: string;
  /** lucide アイコンのキー（表示側でコンポーネントに対応付け） */
  icon: string;
  category: string;
};

export const toolDirectory: DirectoryTool[] = [
  {
    href: "/tools/rf-basic-link-calculator",
    name: "リンクバジェット診断",
    tagline: "通信が届くかを総合的に判定",
    icon: "gauge",
    category: "link"
  },
  {
    href: "/tools/free-space-loss",
    name: "自由空間損失（FSPL）",
    tagline: "距離と周波数による基本損失",
    icon: "waves",
    category: "link"
  },
  {
    href: "/tools/fresnel-zone",
    name: "フレネルゾーン半径",
    tagline: "見通しと必要クリアランス",
    icon: "spline",
    category: "link"
  },
  {
    href: "/tools/propagation-loss",
    name: "伝搬損失モデル比較",
    tagline: "自由空間〜Hata系を一括比較",
    icon: "building",
    category: "link"
  },
  {
    href: "/tools/ncu-below-ground",
    name: "GL以下NCU・水道BOX診断",
    tagline: "地下・BOX内端末の追加損失を分解",
    icon: "box",
    category: "link"
  },
  {
    href: "/tools/rf-learning-quest",
    name: "RF学習クエスト",
    tagline: "700問のアンテナ設計RPG",
    icon: "book",
    category: "learning"
  },
  {
    href: "/tools/frequency-wavelength",
    name: "周波数・波長",
    tagline: "波長とアンテナのサイズ感",
    icon: "radio",
    category: "basics"
  },
  {
    href: "/tools/dbm-converter",
    name: "dBm 変換",
    tagline: "dBm / mW / W を相互変換",
    icon: "repeat",
    category: "basics"
  },
  {
    href: "/tools/db-feel",
    name: "dBを体感する",
    tagline: "+3dBで2倍・+6dBで距離2倍",
    icon: "ruler",
    category: "basics"
  },
  {
    href: "/tools/vswr-return-loss",
    name: "VSWR・リターンロス",
    tagline: "整合の良し悪しを見る",
    icon: "activity",
    category: "line"
  },
  {
    href: "/tools/coaxial-cable-loss",
    name: "同軸ケーブル損失",
    tagline: "標準品の実測ロスを品番×周波数で",
    icon: "cable",
    category: "line"
  },
  {
    href: "/tools/microstrip-line",
    name: "マイクロストリップ線路",
    tagline: "基板配線の Z0 と曲げ設計",
    icon: "circuit",
    category: "line"
  },
  {
    href: "/tools/effective-aperture",
    name: "有効開口面積",
    tagline: "dBiを受信面積として理解",
    icon: "aperture",
    category: "antenna"
  },
  {
    href: "/tools/aperture-gain-beamwidth",
    name: "開口利得・ビーム幅",
    tagline: "ホーン/レンズ/パラボラの概算",
    icon: "satellite",
    category: "antenna"
  },
  {
    href: "/tools/antenna-spacing",
    name: "アンテナ間隔 λ換算",
    tagline: "MIMO配置を波長で評価",
    icon: "scan",
    category: "antenna"
  },
  {
    href: "/tools/array-grating-lobe",
    name: "グレーティングローブ判定",
    tagline: "アレイ素子間隔と走査角",
    icon: "radar",
    category: "research"
  },
  {
    href: "/tools/patch-antenna-dimensions",
    name: "パッチアンテナ寸法",
    tagline: "基板εrと厚みから概算",
    icon: "panel",
    category: "antenna"
  },
  {
    href: "/tools/small-loop-resonance",
    name: "小型ループ共振",
    tagline: "ループLと必要Cを計算",
    icon: "refresh",
    category: "research"
  },
  {
    href: "/tools/radiation-resistance",
    name: "放射抵抗・効率",
    tagline: "短いアンテナの損失感度",
    icon: "antenna",
    category: "research"
  },
  {
    href: "/tools/small-antenna-limit",
    name: "小型アンテナ限界",
    tagline: "ka・Q・帯域の物理限界",
    icon: "orbit",
    category: "research"
  },
  {
    href: "/tools/large-array-near-field",
    name: "大型アレイ近傍界",
    tagline: "Fraunhofer距離とFresnel数",
    icon: "grid",
    category: "research"
  },
  {
    href: "/tools/reflector-ris-size-effect",
    name: "反射板・RISサイズ効果",
    tagline: "面積・距離・波長の効き方",
    icon: "mirror",
    category: "research"
  }
];
