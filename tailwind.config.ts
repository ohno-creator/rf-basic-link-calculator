import type { Config } from "tailwindcss";
import colors from "tailwindcss/colors";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
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
        soft: "0 18px 60px rgba(15, 23, 42, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
