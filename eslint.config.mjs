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
  }
];

export default eslintConfig;
