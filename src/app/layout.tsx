import type { Metadata } from "next";
import { Inter, Noto_Sans_JP } from "next/font/google";
import "./globals.css";

// 自己ホストWebフォント（next/font: ビルド時に取得し静的アセット化。実行時の外部読込なし）。
// 欧文・数字 = Inter（計測器の精度: tabular figures が明瞭で計算結果の桁が揃う）
// 和文 = Noto Sans JP（教科書の親しみ: 標準的で可読性が高い）
// フォールバック順: Inter → Noto Sans JP → システム。JPグリフは Noto が受け持つ。
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap"
});

const notoSansJP = Noto_Sans_JP({
  weight: ["400", "500", "700"],
  preload: false, // JPフォントは unicode-range 分割で必要スライスのみ取得（自己ホスト）
  variable: "--font-noto-sans-jp",
  display: "swap"
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.staf.co.jp"),
  title: {
    default: "通信距離・リンクバジェット簡易診断｜スタッフ株式会社",
    template: "%s｜スタッフ株式会社"
  },
  description:
    "周波数、距離、送信電力、アンテナ利得、受信感度から、無線通信のリンクマージンを簡易計算できます。",
  openGraph: {
    siteName: "スタッフ株式会社",
    type: "website"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${inter.variable} ${notoSansJP.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
