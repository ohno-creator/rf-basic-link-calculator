# Codex 発注 — F1改（ページ雛形コード生成）＋ F3（e2eスモーク自動生成）実装契約

**前提**: F1スパイク判定（`f1-manifest-spike-verdict.md`）により実行時manifest方式は**不採用**。本契約はその代替=開発時コード生成の実装仕様。track/term-labに混入したスパイクコミット `0c5aa81e` はランブック（runbook-wave6-commit-separation.md §1 Commit 7）でrevert済みであることを前提とする（`src/app/tools/[slug]/` は存在しない状態から始める）。

## 1. レジストリ契約（コード生成の単一の真実）
- 生成元は `src/data/tools.ts` の `ToolEntry`。**`basic` フィールドを持つエントリのみが生成対象**（rf-learning-quest型のクライアントツールは対象外）
- `ToolEntry` に任意フィールド `panel?: string` を追加する（例: `"panel": "VswrBandwidthQPanel"`）。値は `src/app/tools/_components/` 配下のexport名。**未指定のエントリは生成対象外**（既存ページを手書きのまま維持する明示的なopt-out）
- 型変更は `basicTools.ts` 派生ビューに波及しないこと（純追加・既存API不変）

## 2. scaffoldスクリプト入出力（`scripts/scaffold-tool-page.mjs`）
- 入力: `node scripts/scaffold-tool-page.mjs <slug>`（単一）／`--all`（panel指定のある全エントリ）／`--check`（後述）
- 出力: `src/app/tools/<slug>/page.tsx`。テンプレートはスパイクで正規化diff 0行を確認済みの現行ボイラープレート形（metadata生成・BasicToolPageShell・ToolLayout・panelのimport。`src/app/tools/vswr-bandwidth-q/page.tsx`（revert後に復活する実物）を正とする）
- tools.tsの読み込みは `tsx` 実行（`npx tsx`）でモジュールとしてimportする（正規表現パースは禁止——エントリ書式の揺れに脆い）

## 3. 上書き防止ルール
- 生成先が**存在しない**場合のみ書き込む（既定）
- 存在する場合: 正規化（空白・改行・クォート統一）した現内容とテンプレート出力を比較し、**一致すればskip・不一致なら書き込まずエラー終了**（手作業カスタムの黙殺防止）。`--force` でのみ上書き可
- 生成ファイルにマーカーコメントは**入れない**（現行ページと完全同型を保つ——マーカー導入は全ページ差分を生むため）

## 4. F3: e2eスモーク自動生成（`scripts/generate-e2e-smoke.mjs`）
- 同じレジストリ走査で `e2e/smoke.generated.spec.ts` を生成: 各basicツールについて「ページ表示→ `tool-calculator` 可視→ `primary-result`（存在するツールのみ）attached」の最小スモーク1本ずつ
- 生成ファイルは**コミットする**（CIで再生成せず差分検出に使う）
- 手書きシナリオ（`e2e/tools.spec.ts`）はそのまま・スモークと重複する単純表示チェックは今後書かない（分離の徹底）

## 5. CI差分検出
- `deploy-pages.yml` のe2e前段に1ステップ追加: `node scripts/generate-e2e-smoke.mjs && node scripts/scaffold-tool-page.mjs --check && git diff --exit-code e2e/smoke.generated.spec.ts`
- 意味: レジストリとページ/スモークの乖離（追加し忘れ・手動改変）をCIで落とす。**Track F以外のCI構成変更は引き続き禁止**のため、このステップ追加のみを最小差分で行い、ワークフローの他の部分は触らない

## 6. スパイク差分の扱い
- `track/f1-manifest-spike` ブランチは判定記録として**保持・マージ禁止**（現状維持）
- track/term-lab上のスパイク混入はランブックのrevertで解消済み（本契約の前提）。revert漏れがある状態でF1改を実装しないこと（[slug]ルートと生成ページが衝突する）

## 7. テスト・納品条件
- scaffoldの正規化比較ロジックは純関数に切り出し、vitestでテスト（同一内容→skip判定／空白差→skip判定／実質差→エラー判定の3ケース以上）
- 全ゲート緑（`Tests N passed`行確認）→ 生成スモークがCIのPlaywrightで緑 → docs（README or roadmap §11）に開発フロー1段落追記（「新ツール追加=tools.tsにエントリ→scaffold実行」）
- レビュー: Claude（O-5検収——scaffold出力と手書きページの正規化diff 0行を確認する）
