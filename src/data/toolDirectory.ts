export type ToolCategory = {
  id: string;
  label: string;
};

export const toolCategories: ToolCategory[] = [
  { id: "link", label: "リンク設計" },
  { id: "learning", label: "学習クエスト" },
  { id: "basics", label: "単位・基礎" },
  { id: "line", label: "線路・整合" }
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
    href: "/tools/rf-learning-quest",
    name: "RF学習クエスト",
    tagline: "50問のRPG形式で基礎から研究者へ",
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
  }
];
