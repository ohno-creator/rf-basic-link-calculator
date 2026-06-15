import { faqItems } from "@/data/faq";
import { COLUMN_URL, CONTACT_URL, TOOL_URL } from "@/lib/rf/presets";

export function JsonLd() {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "RF Basic Link Calculator",
      alternateName: "通信距離・リンクバジェット簡易診断",
      url: TOOL_URL,
      applicationCategory: "EngineeringApplication",
      operatingSystem: "Web",
      featureList: [
        "リンクバジェット簡易診断",
        "周波数・波長計算",
        "dBm / mW / W 変換",
        "自由空間損失 FSPL 計算",
        "VSWR・リターンロス変換",
        "同軸ケーブル損失計算（標準品の実測値）",
        "マイクロストリップ線路計算・マイター曲げ設計",
        "フレネルゾーン半径計算",
        "伝搬損失計算（奥村-秦 / COST 231-Hata）"
      ],
      provider: {
        "@type": "Organization",
        name: "スタッフ株式会社",
        alternateName: "Staf Corporation",
        url: "https://www.staf.co.jp/"
      },
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "JPY"
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "RF Basic Link Calculator",
      applicationCategory: "EngineeringApplication",
      operatingSystem: "Web",
      url: TOOL_URL
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "ホーム",
          item: "https://www.staf.co.jp/"
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "アンテナ・無線 基礎計算ツール",
          item: TOOL_URL
        }
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqItems.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer
        }
      }))
    },
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "通信距離・リンクバジェット簡易診断",
      url: TOOL_URL,
      relatedLink: [COLUMN_URL, CONTACT_URL]
    }
  ];

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
