# Antigravity 発注 — Track I3 シェルv3（デザインベース基準実装）の視覚検証

**ブランチ**: `track/i3-shell-v3`（origin にあり・base=feature）
**正本**: `docs/design-base-v3.md`（Fable作成のデザインベース）
機能ゲート全緑（tsc/vitest432/lint/build/e2e37）。`-linux` 視覚回帰の確認と再ベースラインを依頼。

## 変更内容（`BasicToolPageShell.tsx` 1ファイル・全基本ツール約22ページに波及）
design-base-v3 のトークンへ共通シェルを整合（純クラス調整・構造/文言/挙動は不変）:
- h1 に `tracking-tight`、説明文を `max-w-prose`（可読行長45–75ch）・本文色 `slate-700→slate-600`（Bodyロール）
- ヘッダ縦余白 `py-5 → pt-6 pb-4`（8ptリズム）
- 「ほかのツール」h2 を `font-semibold→bold`（Headingロール）、グリッド `gap-3→gap-4`
- 「ほかのツール」カードに **resting `shadow-card`** 付与（2層エレベーション: Flat/Raised規約。従来はhover時のみ影）

## 手順
1. CI(Linux)で `TEST_VISUAL=true npm run test:visual`。全ツールページ（共通シェル）に軽微な差分が出るのが正常。
2. **要目視**: (a) 説明文がprose幅で読みやすくなったか（旧max-w-4xlより短い行長）、(b) 「ほかのツール」カードのresting影が上質か・重すぎないか、(c) ヘッダ余白のリズム。
3. 問題なければ一括で `-linux` 基準線を再生成・コミットバック。

## 位置づけ（Track I 全体）
本I3は design-base-v3 の**基準実装**。以降の量産WO（I1タイポ7ロール統一／I2余白リズム／I4エレベーション監査）は各ツールパネルへ Fable/Codex が同トークンで展開し、本ループで検証する。受け入れ基準（grep-able）は design-base-v3 §4。
