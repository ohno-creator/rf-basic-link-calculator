# Antigravity 発注 — 第4波（D4受入・文献裏取り・D8初回運用）

**対象**: feature の最新（D4「RFアンチパターン図鑑」統合後にClaudeが連絡）。それまで①②の準備・③は先行着手可。
**禁止**: CI設定・スナップショット手動更新・lib/rf計算変更（指摘は報告書で）。

## タスク① D4「RFアンチパターン図鑑」（/tools/rf-antipatterns/）実機受入
1. severityフィルタ（すべて/critical/major/minor）の動作と表示件数の整合
2. 各パターンのアコーディオン展開・「ツールへ」リンクの到達性（10件全部を実クリック）
3. モバイル375pxでの読みやすさ・横はみ出しなし・タッチ44px
4. 内容の官能評価: 初心者が「自分もやりそう」と感じる書き味か。表現の改善提案は「現行→提案」で

## タスク② D4定量値・出典の裏取り（最重要）
各パターンの「数字で見る誤差」を独立に検算・出典照合:
- 効率10%=−10dB／dBd=dBi−2.15／Hata適用域（hm 1-10m・d 1-20km・f 150-1500MHz）／10dBm+10dBm=13.01dBm／金属密着ヌルとλ/4で+6dB／CR2032の0.2mA連続基準とパルス制限／フレネル60%則／σ8dB・90%で必要マージン≈10.3dB（σ×1.2816）
- コラム出典（Petroski "To Engineer Is Human" 等）の実在・書誌の正確性確認。
- 誤りがあれば P0/P1 で報告（数値の書き換えは提案まで。確定はClaudeレビュー後）

## タスク③ D8初回運用: コラム出典の生存確認（先行着手可）
- `src/data/columnSources.ts` の ColumnSource 型に `retrievedAt` が定義された。既存コラム（約30本の details 内出典）のhref付きリンクについて:
  1. リンク生存確認（到達性・リダイレクト先の妥当性）
  2. 切れ・移転があれば代替URLを提案
  3. 結果を `docs/handoff/antigravity-source-audit.md` に一覧（ファイル:行・状態・提案）で報告
- 修正の実施はClaude/Codex側で行うため報告のみ

## タスク④ rebaseline6 差分承認
Claudeがrebaseline6（旗艦ResultHero縁線化・クエストp-5・章3ピル・D4新ページ）を回した後、視覚差分が意図どおりかの承認レビュー。

## 報告
`docs/handoff/antigravity-wave4-report.md` へ OK/NG表（P0-P3・再現手順つき）。
