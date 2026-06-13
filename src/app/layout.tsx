import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.staf.co.jp"),
  title: {
    default: "通信距離・リンクバジェット簡易診断｜スタッフ株式会社",
    template: "%s｜スタッフ株式会社"
  },
  description:
    "周波数、距離、送信出力、アンテナ利得、受信感度から、無線通信のリンクマージンを簡易計算できます。",
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
    <html lang="ja">
      <body className="antialiased">{children}</body>
    </html>
  );
}
