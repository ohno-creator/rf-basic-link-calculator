import type { Config } from "tailwindcss";
import colors from "tailwindcss/colors";
import defaultTheme from "tailwindcss/defaultTheme";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      // 自己ホストフォント（layout.tsx の next/font 変数）。欧文数字=Inter、和文=Noto Sans JP。
      fontFamily: {
        sans: ["var(--font-inter)", "var(--font-noto-sans-jp)", ...defaultTheme.fontFamily.sans]
      },
      colors: {
        staf: {
          DEFAULT: "#0071BD",
          dark: "#005A95",
          light: "#E8F4FC"
        },
        ink: "#1F2933",
        // 状態色のセマンティックトークン（意味の単一ソース）。既存パレットへのエイリアス。
        // 良い=success / 情報=info / 軽い注意=caution / 強い注意=warning / 危険=danger
        success: colors.emerald,
        info: colors.sky,
        caution: colors.amber,
        warning: colors.orange,
        danger: colors.rose
      },
      boxShadow: {
        soft: "0 18px 60px rgba(15, 23, 42, 0.08)",
        // 層状の控えめな影。カード/ボタンのエレベーションを均一に上質化する。
        card: "0 1px 2px rgba(15, 23, 42, 0.04), 0 2px 6px rgba(15, 23, 42, 0.05)",
        "card-hover": "0 4px 10px rgba(15, 23, 42, 0.07), 0 10px 24px rgba(15, 23, 42, 0.06)"
      }
    }
  },
  plugins: []
};

export default config;
