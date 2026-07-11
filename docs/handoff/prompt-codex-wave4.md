# Codex 発注 — 第4波（Track I残リファクタ・F2単位ブランド型）

**ブランチ**: `track/codex-wave4`（origin/feature から作成）。**必ず自分のworktree（rf-codex等）で作業**。メインworktree・claude-gdata・claude-intuitionは使用中のため触らない。
**共通禁止**: `src/data/tools.ts`・`e2e/tools.spec.ts`・`.github/workflows/**` の編集禁止（結線・視覚ループはClaude）。`git add -A`禁止。push前に tsc/vitest/lint 緑を確認し、**vitestは必ず `Tests N passed` の行まで確認**（tail切りで失敗を見落とさない）。

## タスク① Track I残の機械的リファクタ（1PR=1目的で3コミット）

### 1-a. ナミゲートの手書きセグメントを共有部品へ置換
- 対象: `src/app/tools/nami-gate-window/components/NamiGateClient.tsx` 323行付近の手書きセグメント（`bg-white text-staf-dark shadow-sm` のトグル群）
- `src/components/SegmentedControl.tsx` へ置換（矢印キー操作・aria挙動は部品側に集約）。**選択状態・onChangeの挙動を変えない**。既存e2e（nami系）が緑のままであること
- 見た目の微差はrebaselineで吸収するので気にしない（機能不変が絶対条件）

### 1-b. Card padding="xs" 拡張＋タブ容器の部品化
- `src/components/Card.tsx` の `CardPadding` に `"xs"`（p-2）を追加（既存呼び出しに影響なし・追加のみ）
- `src/app/tools/ncu-below-ground/components/NcuFieldAnalysisPanel.tsx` 350行付近のタブストリップ容器（rounded-lg border bg-white p-2 shadow-card の手書きsection）を `<Card as="section" padding="xs">` へ置換

### 1-c. デザイン規約の追記（ドキュメントのみ）
- `docs/design-base-v3.md` §2.4（エレベーション）へ1行追記: 「コントロールの操作子（SegmentedControlのthumb等）に限り `shadow-sm` を許可（面のエレベーションではなく操作アフォーダンス）」

## タスク② F2: 単位ブランド型の導入（先行適用1本）

- 新規 `src/lib/rf/units.ts`:
  ```ts
  export type Db = number & { readonly __brand: "dB" };
  export type Dbm = number & { readonly __brand: "dBm" };
  export type Dbi = number & { readonly __brand: "dBi" };
  export type MHz = number & { readonly __brand: "MHz" };
  export type Meters = number & { readonly __brand: "m" };
  ```
  ＋ コンストラクタ関数（`db(x)`, `dbm(x)`…: Number.isFiniteガード付き）と `addDb(dbm: Dbm, delta: Db): Dbm` 等の型安全演算3-4個。JSDocに「dBm+dBmを型で禁止する」意図を明記
- 先行適用: `src/lib/rf/dbFamily.ts`（新しく依存が少ない）の公開APIへ**後方互換のオーバーロード追加**として適用（既存number引数の呼び出しを壊さない）。既存テスト緑＋brand型の誤用がtscで弾かれることを確認するコンパイルテスト（`// @ts-expect-error`つきの型テストファイル `src/tests/units.typetest.ts`）を追加
- **既存libの一斉置換はしない**（価値実証の1本のみ。roadmap F2の方針どおり漸進）

## 納品
push後、`docs/handoff/codex-wave4-report.md` に変更ファイル・検証結果（`Tests N passed` 行を転記）を記載。
