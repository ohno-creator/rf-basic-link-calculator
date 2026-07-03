# 統合レポート: 待機ブランチ7本の反証レビュー＆マージ（2026-07-04）

Claude（レビュー統括）が並行エージェントの待機ブランチを反証レビュー（7エージェント並行）し、
feature へ統合した記録。全ブランチ correctness=confirmed、統合後ゲート全緑。

## 統合後ゲート
`tsc --noEmit` 0 / `vitest` 288 / `eslint` / `build` / `test:e2e` 31 すべて緑。

## マージ結果

| ブランチ | 統合コミット | 対応した指摘 |
| --- | --- | --- |
| track/a1-vswr-boundary | merge(a1) | Γ=1受理。指摘なし |
| track/a2-coax-extrapolation | merge(a2) | √f外挿上限・extrapolatedフラグ。P3(trueケーステスト未追加)は残 |
| track/a4-microstrip-validation | merge(a4)＋`bbdc8eb` | **回帰修正**: 細線でマイター率>100%→曲げセクション消失を、パネル側[0,100]クランプで解消 |
| track/a5-propagation-fspl-floor | merge(a5) | flooredByFsplフラグ追加のみ。後方互換 |
| track/a3b-fresnel-nonfinite | merge(a3b) `b76afbd` | knifeEdge非有限→RfError。fresnel.tsはE6と自動マージ、test import衝突のみ解消 |
| track/da-column-research | merge(da)＋`603a539` | 文献パック8本。**丸め誤記2件訂正**(grating 0.535→0.536、有効開口20.3→20.4cm²) |
| track/ux1v-visual-loop | merge(ux1v) 選択 | 良ファイルのみ。**deploy-pages.yml除外**(トラック専用暫定ロジック＋concurrency分割=本流デプロイ競合リスク) |

## ⚠️ a3a: 重複につきドロップ推奨（→ Codex）

`track/a3a-fresnel-earth-curvature`（Codex）は **E6コミット631151d（既にfeatureにマージ済）と完全に同一機能**：
- 同じ `options?:{ earthCurvatureK?: number }` シグネチャ／同じ式／同じガード
- Codexも独立に正しい1.4715m へ到達（roadmap 2.9mも訂正済）
- E6は `radioHorizonKm`＋`EARTH_RADIUS_M` を含む**上位互換**

→ **a3a はマージ不要**。機能はE6が提供済で失われるものなし。Codex側で `git branch -D track/a3a-fresnel-earth-curvature` ＋ リモート削除を推奨（roadmap §8.2 の「同一ファイル2エージェント」事例として記録）。

## フォロー状況
- **a2(P3・解消済み)**: PR #9（`f9cf90d`）で9000MHz時の `extrapolated===true` を直接検証。
- **a5(P3・解消済み)**: PR #10（`ce22a05`）でFSPL床発動時のcaution 2箇所と、非発動時の非表示をE2E検証。
- **ux1v(P3)**: `e2e/foldBudget.spec.ts` は未達を `test.fixme()` で扱う計測ハーネス＋`fold-budget-status.md`書き込みの副作用あり。TEST_VISUAL隔離でdeploy gate不参加につき実害なし。
- **CI視覚回帰**: `-linux`基準線の更新運用は `docs/handoff/visual-regression-runbook.md`（ux1vで追加）を参照。

Track AのCodexフォロー残件はなし。

## 後続の統合結果
- `track/a3a-*`: E6との重複によりPR #4をクローズし、ブランチを削除済み。
- `track/a6-ris-mirror-warning`: PR #7（`5768be5`）で統合済み。
- `track/a8-research-warning-debounce`: PR #8（`7e77258`）で統合済み。
