# Handoff: UX-0 計測基盤 (Antigravity枠)

## 概要
改修前の基準線として、全24ツール＋ホームページの (A) 現状の計測値、および (C) アクセシビリティ重大違反の測定と記録を完了しました。

## 成果物
- **E2Eテストコード**
  - [e2e/measure.spec.ts](file:///Users/pc141/Documents/rf-ux0/e2e/measure.spec.ts): 各ツールの `firstInputY` (最初の入力の高さ), `totalHeight` (ページ総高), `headings` (見出し構成) を測定。
  - [e2e/axe.spec.ts](file:///Users/pc141/Documents/rf-ux0/e2e/axe.spec.ts): `@axe-core/playwright` によるアクセシビリティ自動スキャン。
  - [e2e/visual.spec.ts](file:///Users/pc141/Documents/rf-ux0/e2e/visual.spec.ts): 将来的なビジュアル回帰用テストコード（スクリーンショットチェック）。
- **計測データ・レポート（自動生成）**
  - [docs/handoff/ux0-metrics.json](file:///Users/pc141/Documents/rf-ux0/docs/handoff/ux0-metrics.json): 50通り（25ページ × 2ビューポート）の計測データの生JSON。
  - [docs/handoff/ux0-baseline.md](file:///Users/pc141/Documents/rf-ux0/docs/handoff/ux0-baseline.md): 計測結果の人間可読要約。
  - [docs/handoff/ux0-axe.md](file:///Users/pc141/Documents/rf-ux0/docs/handoff/ux0-axe.md): アクセシビリティ重大違反の発生個所と修正方針のレポート。
- **設定変更**
  - [package.json](file:///Users/pc141/Documents/rf-ux0/package.json): `"test:visual"` スクリプトおよび `"@axe-core/playwright"` の追加。
  - [playwright.config.ts](file:///Users/pc141/Documents/rf-ux0/playwright.config.ts): デプロイCIゲート（`tools.spec.ts`のみ実行）と、測定テスト（`TEST_VISUAL=true` 時のみ実行）を切り分ける `testMatch` 制御を追加。

---

## 協調・引き継ぎ事項 (Claude / Codex へ)

### 1. (B) スクリーンショット基準線のLinux版生成について
- ローカルマシン（Mac）に Docker 環境がないため、Linux (CI) 用の正しいスクリーンショット（`-snapshots/`）はローカルで生成していません（Mac上で生成するとフォントの差異でCIビルドが落ちるため）。
- 現在 `visual.spec.ts` は基準スナップショットがないため実行すると失敗する状態です。
- **対応方針**: 本ブランチをプッシュ後、CI（GitHub Actions）上で一度 `--update-snapshots` を走らせ、生成された画像をコミットバックさせるか、アーティファクトからローカルに回収してコミットするフローを予定しています。

### 2. 今後のUI改修（UX-1 〜 UX-3）での計測アサーション
- UI大改修計画（`ui-redesign-plan.md`）のKPI「最初の入力 top <= 400px」「主結果が viewport 内に表示される（フォールド予算）」などの機械検証アサーションを実装する際、今回作成した `measure.spec.ts` の計測ロジックを拡張・再利用してアサーションへ昇格させてください。
- すべてのツールで `h1` と `h2` の文言重複（例: `fresnel-zone` における「フレネルゾーン半径」など）が発生しているため、改修時に重複見出しの削除を行ってください。
