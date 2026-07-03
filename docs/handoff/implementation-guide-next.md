# [Handoff] 次期エージェント用実装・改修ガイド (Implementation & Handoff Guide)

**作成日時**: 2026-07-04
**前工程担当**: Antigravity (調査・視覚検証枠)
**次工程対象者**: Claude (草稿・UI改修) / Codex (組み込み・接続・リファクタリング)

---

## 1. 概要

本ガイドは、調査・検証フェーズで得られた成果（12本のコラム文献パックおよびUX-1VのE2E/ビジュアル回帰/見出し/リンク検証の監査結果）を、実際の製品コード（`src/**`）へ適用する**実装担当者用の設計指示書**です。

---

## 2. 【Track D-a / D-b】コラムの実装・接続手順 (Claude / Codex 担当)

現在、[docs/handoff/](file:///Users/pc141/Documents/RF%20Basic%20Link%20Calculator/docs/handoff/) 内に以下の **12本のコラム文献パック** が完全に揃っています。

### 12本の文献パック一覧 (インプットソース)
1. **[column-fresnel.md](file:///Users/pc141/Documents/RF%20Basic%20Link%20Calculator/docs/handoff/column-fresnel.md)** (フレネルゾーン深掘り)
2. **[column-reflector-ris.md](file:///Users/pc141/Documents/RF%20Basic%20Link%20Calculator/docs/handoff/column-reflector-ris.md)** (反射板・RISサイズ効果)
3. **[column-microstrip.md](file:///Users/pc141/Documents/RF%20Basic%20Link%20Calculator/docs/handoff/column-microstrip.md)** (マイクロストリップ線路)
4. **[column-effective-aperture.md](file:///Users/pc141/Documents/RF%20Basic%20Link%20Calculator/docs/handoff/column-effective-aperture.md)** (有効開口面積)
5. **[column-aperture-beamwidth.md](file:///Users/pc141/Documents/RF%20Basic%20Link%20Calculator/docs/handoff/column-aperture-beamwidth.md)** (開口利得・ビーム幅)
6. **[column-antenna-spacing.md](file:///Users/pc141/Documents/RF%20Basic%20Link%20Calculator/docs/handoff/column-antenna-spacing.md)** (アンテナ間隔 λ換算)
7. **[column-array-grating-lobe.md](file:///Users/pc141/Documents/RF%20Basic%20Link%20Calculator/docs/handoff/column-array-grating-lobe.md)** (不要ビーム判定)
8. **[column-large-array-near-field.md](file:///Users/pc141/Documents/RF%20Basic%20Link%20Calculator/docs/handoff/column-large-array-near-field.md)** (大型アレイ近傍界)
9. **[column-patch-antenna.md](file:///Users/pc141/Documents/RF%20Basic%20Link%20Calculator/docs/handoff/column-patch-antenna.md)** (パッチアンテナ寸法)
10. **[column-small-loop.md](file:///Users/pc141/Documents/RF%20Basic%20Link%20Calculator/docs/handoff/column-small-loop.md)** (小型ループ共振)
11. **[column-radiation-resistance.md](file:///Users/pc141/Documents/RF%20Basic%20Link%20Calculator/docs/handoff/column-radiation-resistance.md)** (放射抵抗・効率)
12. **[column-small-antenna-limit.md](file:///Users/pc141/Documents/RF%20Basic%20Link%20Calculator/docs/handoff/column-small-antenna-limit.md)** (小型アンテナ限界)

### 実装ステップ

#### ① コラムデータの新規作成 (Claude 担当)
- `src/data/columns/` 配下に各コラムに対応する TypeScript ファイル（例: `fresnel.ts` など）を新規作成し、[docs/column-guide.md](file:///Users/pc141/Documents/RF%20Basic%20Link%20Calculator/docs/column-guide.md) の **§8 に定義された5層構造テンプレート** を使ってデータオブジェクトとして定義してください。
- 階層構造:
  1. **Hook**: 二層設計。初心者が読んで惹かれる内容
  2. **Body**: 本質・たとえの破れの明記（例: 「〜という比喩は、〜の条件下では破れる」）
  3. **Quantitative (Quant)**: ライブ値バインド（対応する `liveKey` を定義）。`lib/rf/*` をインポートして計算式で数値を導出する。
  4. **Why Formula**: 学術的裏付け（式番号、節番号の特定）
  5. **References**: 生存確認済みのURLリスト

#### ② 共通コラムコンポーネントの構築 (Codex 担当)
- `src/components/ToolColumnCard.tsx` を新規作成し、アコーディオン（折りたたみ）表示、ライブ値バインド機能、およびアコーディオンが閉じている時に「1. Hook」だけが外に見えている状態のUIをマークアップしてください。
- テスト (`foldBudget.spec.ts`) と連動するため、コラム全体には `data-testid="research-column"` などの識別子を設けてください。

#### ③ 既存コラムの移行・接続 (Codex 担当)
- [src/app/tools/_components/AntennaToolPanel.tsx](file:///Users/pc141/Documents/RF%20Basic%20Link%20Calculator/src/app/tools/_components/AntennaToolPanel.tsx) の各ツール設定オブジェクトから、古い形式の `columnTitle: string` および `column: string[]` のベタ書き配列を削除し、新規作成したコラムデータオブジェクト（`ColumnData`）を紐づけて、共通の `ToolColumnCard` コンポーネントを配置してください。

---

## 3. 【UX-1V】検出されたUIアクセシビリティ・品質バグの改修リスト

以下の項目について、順次ソースコードを改修してください。

### 1) 重複見出しの削除 (Claude 担当)
[docs/handoff/heading-audit.md](file:///Users/pc141/Documents/RF%20Basic%20Link%20Calculator/docs/handoff/heading-audit.md) の検出通り、全ツールの計算画面において `<h1>` と `<h2>`/`<h3>` で**同一の文言**が重複出力されています。

- **原因**: レイアウトシェル（`BasicToolPageShell.tsx`）で自動的に `<h1>` を表示しているのに対し、下部コンポーネントの内部（例: 各種 Panel の内部）で重ねて同じ見出しを出力してしまっています。
- **対処**: 各ツールパネル（`CoaxCableLossPanel.tsx` や `AntennaToolPanel.tsx` など）の内部から、ページタイトルと重複している不要な `<h2>` または `<h3>` のタグ・文言を削除してください。

### 2) 階層飛びのマークアップ修正 (Claude 担当)
見出しのレベルがスキップしてしまっているページを修正してください。
- **fresnel-zone**: `<h1>` から直接 `<h3>` へ飛んでいます。`<h3> "フレネルゾーン半径と障害物チェック"` を `<h2>` に変更、または適切な `<h2>` を間に挟んでください。
- **propagation-loss**, **vswr-return-loss**: 同様に `<h1>` から直接 `<h3>` への遷移があるため、マークアップを修正してください。

### 3) 主結果への `data-testid="primary-result"` 付与 (Claude 担当)
フォールド予算の自動監視を行うため、各ツールの「主要計算結果の表示カード（ResultBarや最重要結果数値）」の最親DOM要素に対して、**`data-testid="primary-result"`** を付与してください。
- 対象箇所：各ツールの結果表示エリア（例: コアキシャルでは「減衰量」の表示カード、VSWRでは「反射係数」のカードなど）。

### 4) 自社リンク切れ (404) の修正 (Codex 担当)
既存の以下のコラムで参照されているリンクが 404 になっています。
- ❌ `https://www.staf.co.jp/media/column/ant-c/ant-tools/rf-basic-link-calculator`
- ❌ `https://www.staf.co.jp/tools/rf-basic-link-calculator`
- **対処**: 正しいリダイレクト先または正しい現行のSTAF製品コラムURLに差し替えてください。

### 5) 最初の入力要素のY軸調整 (Claude 担当)
`fold-budget-status.md` の通り、最初の入力フォームが `500px〜700px` の低い位置にあり、目標の `≦ 400px` を満たしていません。
- **対処**: 各ツールパネルの最上部のマージン、パディング、または不要な紹介文スペース（ヒーロー領域のパディング等）を削るか、グリッドのレイアウトを微調整して、最初の入力要素がビューポート上部（400px以内）に現れるようにしてください。

---

## 4. 実行ゲート（PR前確認）
改修完了後、必ずメインディレクトリで以下のコマンドを実行し、エラーがないことを確認してからプッシュしてください：

```bash
npm run test          # vitest (純計算ロジック)
npm run lint          # eslint (コードスタイルチェック)
npx tsc --noEmit      # typescript型チェック (e2e/配下の型エラーを検出するために必須)
GITHUB_PAGES=true npm run build  # 静的エクスポートビルド
npm run test:e2e      # デプロイゲート (tools.spec.ts のみ)
```

また、ビジュアル回帰・フォールド予算テストの実行はローカルではなく **GitHub Actions (Linux/CI)** で実行し、結果を確認（グリーン確認）してください。macOSローカルでスナップショット更新（`--update-snapshots`）をコミットしないよう注意してください。
