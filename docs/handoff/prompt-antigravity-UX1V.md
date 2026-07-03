# Antigravity 発注プロンプト — UX-1V / 視覚回帰ループ運用＋KPI計測昇格

> このファイルをそのまま Antigravity（`agy`）に貼り付けて着手してください。
> ベースブランチ: `feature/initial-rf-basic-link-calculator`（最新を fetch してから開始）。
> 参照正典: `AGENTS.md`（共通・Gitルール・RF計算ルール） / `docs/improvement-roadmap.md`（§8 分担・ゲート） / `docs/ui-redesign-plan.md`（UX KPI） / `docs/handoff/UX-0.md`（前工程の引き継ぎ）。

---

## あなたの役割（再確認）

あなたは **視覚検証・ブラウザ実機操作・Web調査担当**です。今回の担当境界は **`e2e/**` と `docs/**` のみ**。
以下は**禁止**（レビュー体制外のため）:

- `src/lib/rf/**` の計算ロジック変更（テスト先行必須の聖域。触らない）
- `src/components/**`（UI Kit v2）と `src/app/tools/**` のソース変更（Codex/Claude の担当）

計測・スクショ・アサーション・ドキュメントだけで完結させてください。ソースの不具合を見つけたら**直さず** `docs/handoff/` に記録して申し送る。

---

## Git 隔離（必須・恒久ルール / roadmap §8.2）

```bash
git fetch origin
git worktree add ../agy-ux1v origin/feature/initial-rf-basic-link-calculator
cd ../agy-ux1v && npm ci
git switch -c track/ux1v-visual-loop
```

- **`git add -A` / `git add .` は全面禁止**。変更ファイルを必ずパス指定で add する（過去に混線事故が1件）。
- `git reset` / `git stash` / `git push --force` 禁止。`git push`（通常）と `git commit` は明示合意後のみ。
- 完了後 `git worktree remove ../agy-ux1v`、`git worktree prune`。

---

## 前提（現状の視覚回帰インフラ — すでに完成している）

UX-0 で以下が導入済み。**基準線はCI(Linux)生成済みで有効**（コミット `5c07e1b`、25ページ×2ビューポート=50枚）:

- `e2e/visual.spec.ts` … `toHaveScreenshot('<page>-<vp>.png', {fullPage:true})`。基準線は `e2e/*-snapshots/*-linux.png`。
- `e2e/measure.spec.ts` … 各ページの `firstInputY` / `totalHeight` / `headings` を計測しJSON出力。
- `e2e/axe.spec.ts` … `@axe-core/playwright` で重大違反スキャン。
- `package.json`: `test:visual`（`TEST_VISUAL=true playwright test`）。デプロイゲートの `test:e2e` は `tools.spec.ts` のみ実行（`playwright.config.ts` の `testMatch` で切替）。

> **重要**: `-linux` 基準線は **Linux/CI でのみ生成・比較**する。macローカルで `--update-snapshots` すると font 差でCIが落ちる。ローカルは「テストコードの構文・ロジック確認」まで、スクショ比較はCIに任せる。

---

## 発注（WO）

### WO-UX1V-1: 視覚回帰レビューのランブック整備＋現状グリーン確認
- **目的**: UX-1/UX-2 のUI改修PRごとに「意図した差分か」を判定できる運用手順を確定し、現行基準線がCIで緑であることを確認する。
- **作業**:
  1. CI（GitHub Actions）で `npm run test:visual` を1回走らせ、現行50枚が**差分ゼロで緑**であることを確認（ログを添付）。
  2. `docs/handoff/visual-regression-runbook.md` を新規作成。内容:
     - PRで意図的にUIを変えた場合の手順（CIで `test:visual` 実行 → 差分画像を確認 → 妥当なら CI 上で `--update-snapshots` → 生成PNGをコミットバック）。
     - 差分の読み方（`test-results/**/*-diff.png` の見方、許容/非許容の判断基準）。
     - macで基準線を生成してはいけない理由（font差）。
- **成果物**: `docs/handoff/visual-regression-runbook.md`、CIグリーンのログ。
- **さわってよい**: `docs/**` のみ（テストコード変更なし）。

### WO-UX1V-2: KPI計測のアサーション昇格（UX-0 引き継ぎ #2）
- **目的**: `ui-redesign-plan.md` のフォールド予算KPIを、計測値から**自動判定（assert）**へ昇格する。
- **背景**: 現状 `measure.spec.ts` は数値を出力するだけ。改修効果を機械で守るためアサーション化する。
- **作業**: `e2e/foldBudget.spec.ts` を新規作成（`measure.spec.ts` の計測ロジックを流用）。KPI（`ui-redesign-plan.md` の該当節を正とする。目安）:
  - デスクトップで **最初の入力の top ≤ 400px**。
  - 主結果（`data-testid="primary-result"` / 各ツールの主要指標）が**初期ビューポート内**に入る（フォールド予算）。
  - **未達ツールは即失敗にせず**、まず `test.fixme` かソフトアサーション＋一覧レポート（`docs/handoff/fold-budget-status.md`）で「現状の達成/未達マップ」を作る。改修が進むにつれ `fixme` を外していく運用。
- **注意**: このspecは**デプロイゲート（`test:e2e`=tools.specのみ）に含めない**。`TEST_VISUAL` 系と同じく別枠で回す（`playwright.config.ts` の `testMatch` 方針を踏襲。設定変更が必要なら最小差分で）。
- **成果物**: `e2e/foldBudget.spec.ts`、`docs/handoff/fold-budget-status.md`。
- **さわってよい**: `e2e/**`・`docs/**`。**`data-testid` の付与など src 変更が必要になった場合は、自分で付けずに** `docs/handoff/` に「どのツールのどの要素に `data-testid="primary-result"` が必要か」を列挙してClaudeへ申し送る。

### WO-UX1V-3: 重複見出し監査（UX-0 引き継ぎ #2）
- **目的**: 全ツールで `h1` と `h2` の文言重複（例: `fresnel-zone` の「フレネルゾーン半径」）を洗い出し、改修時の削除対象リストを作る。
- **作業**: `measure.spec.ts` の `headings` 出力、または新規の軽い計測で、25ページの見出し構成を収集。`h1`≒`h2` の重複、階層飛び（h2→h4等）、空見出しを検出し `docs/handoff/heading-audit.md` に「ページ / 重複文言 / 推奨アクション」の表で出力。
- **成果物**: `docs/handoff/heading-audit.md`。**src は変更しない**（申し送りのみ）。
- **さわってよい**: `e2e/**`・`docs/**`。

### WO-UX1V-4（調査）: D系コラムの出典・リンク検証
- **目的**: `docs/column-guide.md` / `docs/new-tools-proposal.md` が要求する「玄人が感心する出典明記」を満たすため、既存コラムの参照リンク・数式出典の生存確認と一次情報照合を行う。
- **作業**: 各ツールのコラム内リンク（ITU-R/IEC/文献URL等）を実際に開いて 200/リンク切れ/リダイレクトを記録し、式番号・係数の一次情報一致を確認。`docs/handoff/column-source-audit.md` に「ツール / 主張 / 出典URL / 生存 / 一致可否 / 備考」で出力。
- **成果物**: `docs/handoff/column-source-audit.md`。
- **注意**: 計算式の**修正提案はしてよいが実装はしない**（lib/rf は聖域）。疑義は roadmap / column-guide の更新提案として記す。

---

## 共通ゲート（PR前に全部緑 / roadmap §8.3）

```bash
npm run test          # vitest（純TSロジック）
npm run lint          # eslint
npx tsc --noEmit      # 全体型チェック（next build が見逃す e2e/ の型エラーを検出。必須）
GITHUB_PAGES=true npm run build
npm run test:e2e      # デプロイゲート（tools.spec のみ）— あなたの追加specがこれを汚さないこと
```

- 視覚回帰（`test:visual`）と新規計測spec（`foldBudget`）は **Linux/CI で実行**。macローカルでスクショ基準線を作らない。
- 1PR=1目的。コミットは `docs|test(scope): 日本語要約`＋本文にトラックID（例 `[UX-1V]`）。

---

## 完了報告フォーマット（各WOごと）

```markdown
## 完了: WO-UX1V-<n> <題名>
- 成果物: <パス列挙>
- 実行ゲート結果: test / lint / tsc / build / e2e（+ CIの test:visual）— 各 pass/fail
- src への申し送り（あれば）: <どのファイルに何が必要か。自分では変更していないこと>
- 既知の罠・残作業: <あれば>
```

不明点は**このプロンプトと roadmap / ui-redesign-plan の更新で解消**してから進める（口頭合意で進めない）。src を変更したくなったら止めて申し送る。
