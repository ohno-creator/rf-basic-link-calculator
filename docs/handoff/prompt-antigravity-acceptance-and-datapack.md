# Antigravity 発注 — ①新13ツール実機受入 ②文献パック裏取り

## タスク① 新ツール13本の実機受入（優先）
**対象**: feature の新ツール（E1 noise-floor は統合済み・E2〜E5とG Tier1 8本は `track/e2-e5-tools` ブランチ→統合後はfeature）
noise-floor / shadowing-margin / polarization-loss / eirp-compliance / rain-attenuation ＋ G Tier1（metal-plane-effect / vswr-bandwidth-q / mismatch-range-impact / electrical-length / pointing-margin / lte-signal-metrics / desense / measurement-sampling）

**各ツール共通チェック**（デスクトップ1280/モバイル390）:
1. 主結果（primary-result）が既定値で表示され、入力・プリセットチップで即応答する
2. 動的SVG図が入力に連動して動く／「図を保存」SVG・PNGが開けて文字が画面と同一
3. 「わかること」ピル・基礎解説（FormulaExplanationCard）・コラム（details深掘り含む）が表示される
4. スライダー・チップのタッチ操作44px・フォーカスリング・reduced-motion
5. 数値の妥当性スポット: 各ツールのe2e期待値（e2e/tools.spec.ts の該当test参照）を手入力で再現

**報告**: ツール×項目のOK/NG表（P0崩れ/P1違和感/P2提案）。NGは再現手順つき。

## タスク② 文献パックの裏取り（docs/handoff/track-g-data-literature-pack.md）
既存パック（G2/G3/G4/G5/G14/G15判定/G18・159行）の各数値について:
1. 記載出典のリンク到達性・版の確認（ITU-R/3GPP/ARIB/論文）
2. 数値の転記ミスチェック（原典と突き合わせ）
3. 出典が二次資料のものは一次資料へ差し替え候補を提示
**成果物**: 同ファイルへの検証結果追記（✅確認済/⚠要差し替え の行内マーク＋修正提案）。**数値の書き換えは提案までとし、確定はClaudeレビュー後**。

## 禁止事項
- CI設定（deploy-pages.yml）に触れない。視覚トグルをfeature/mainに向けない
- スナップショットの手動更新不要（CIループ管理）
