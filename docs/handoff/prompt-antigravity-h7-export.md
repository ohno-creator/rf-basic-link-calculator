# Antigravity 発注 — Track H7 図版エクスポートの視覚/機能検証

**ブランチ**: `track/h7-export`（origin・base=feature）
機能ゲート全緑（tsc/vitest440/lint/build/e2e40）。

## 変更内容
図版（SVG）を**SVG/PNGで保存**できる共通部品を追加（追加のみ・レポート/提案書貼付用途）:
- `src/lib/ui/svgExport.ts`（純ロジック・テスト8件）: xmlns/XML宣言補完・data URI(Unicode安全)・ファイル名slug化・PNG倍率。
- `src/components/DiagramExportButton.tsx`（client）: 内包`<svg>`を outerHTML でシリアライズ→ **SVG**は data URI DL、**PNG**は img→canvas（白地・2倍スケール）→Blob DL。
- 手本として**旗艦の滝グラフ**の上に「図を保存 [SVG][PNG]」ボタンを配置。

## 検証手順
1. `TEST_VISUAL=true npm run test:visual`：旗艦ページに小さな差分（滝グラフ上部に保存ボタン行）。意図どおりか確認。
2. **機能の実機確認**（ブラウザ操作）: 旗艦ページで
   - 「SVG」→ `link-budget-waterfall.svg` がDL・単体で開ける（xmlns付き）か
   - 「PNG」→ 白地・2倍解像度の `link-budget-waterfall.png` がDLされ、日本語ラベルが化けず描画されるか
   - PNGの日本語フォント（外部フォント非読込のため system font でレンダされる）が崩れないか
3. 問題なければ再ベースライン。

## 展開（量産・工程②）
同 `DiagramExportButton` で内包する SVG図（NCU断面・フレネル・定在波・NCU滝 等）を順次ラップすれば横展開可能。チャート（recharts）はSVG出力のため同部品でラップ可（要 responsive container の実寸確認）。

## 既知の注意
- PNGの日本語は Web フォント非読込方針のため OS フォント依存。崩れる場合は SVG 保存を主導線にする案を検討（申し送り）。
