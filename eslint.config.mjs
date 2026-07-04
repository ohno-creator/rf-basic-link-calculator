import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "coverage/**",
      "dist/**",
      "out/**",
      "next-env.d.ts"
    ]
  },
  {
    // 依存の向きを機械的に強制する。あるツール固有の components（例:
    // @/app/tools/<slug>/components/*）を別ツールや共有UIから絶対パスで import する
    // 「逆向き結合」を禁止する。共有する部品は src/app/tools/_components/ へ置き、そこから
    // import する（_components は上記パターンに一致しないため許可される）。各ツールが自分の
    // components を参照する相対 import（./components/... や ./Sibling）は対象外。
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/app/tools/*/components/*"],
              message:
                "ツール固有の components を他所から import しないでください。共有部品は src/app/tools/_components/ へ移し、そこから import してください。"
            }
          ]
        }
      ]
    }
  },
  {
    files: ["src/lib/**/*.{js,jsx,ts,tsx}"],
    // libは純粋な計算・データ・UI非依存ロジック層。type importも含め、app/componentsから
    // libへ依存が逆流することを禁止する。共有型はsrc/lib配下へ置く。
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "@/app/**",
                "@/components/**",
                "../app/**",
                "../components/**",
                "../../app/**",
                "../../components/**",
                "../../../app/**",
                "../../../components/**"
              ],
              message:
                "src/lib から src/app・src/components を import しないでください。共有ロジック・型は src/lib 配下へ移してください。"
            }
          ]
        }
      ]
    }
  }
];

export default eslintConfig;
