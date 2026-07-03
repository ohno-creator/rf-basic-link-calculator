# Handoff: 旗艦 LinkBudgetPanel 分割（B2完了）と UX-3 §4.1 残作業

## 完了（B2・構造分割）: `refactor(flagship)` コミット f7815f6

旗艦 `LinkBudgetPanel.tsx`（**1245→732行**）から自己完結サブコンポーネントを兄弟ファイルへ
**挙動・描画を完全保存**して抽出（tsc/vitest/lint/build/e2e 全緑で同一性確認）。

### 現在のファイル構成（`src/app/tools/rf-basic-link-calculator/components/`）
| ファイル | 行 | 役割 |
| --- | --- | --- |
| `LinkBudgetPanel.tsx` | 732 | オーケストレータ（本体return・`InputGroup`・入力セクション群） |
| `LinkBudgetNumberField.tsx` | 85 | 数値入力フィールド（Card+slider）。**§4.1でFieldへ移行予定** |
| `LinkTypeCards.tsx` | 101 | 回線種別カード選択 |
| `HataAntennaHeightNotice.tsx` | 57 | Hata系のアンテナ高注意書き |
| `InputAssumptionMenu.tsx` | 137 | 入力前提メニュー |
| `IotHataCalibrationPanel.tsx` | 165 | IoT向けHata実測校正パネル |
| `linkBudgetPanelShared.ts` | 5 | 共有純関数 `isHataFamily` |

- 循環import注意点: `IotHataCalibrationPanel` は `LinkBudgetNumberField` を**独立ファイルから**import（`./LinkBudgetPanel` 経由にすると循環になるため不可）。
- `InputGroup` と本体 return の入力セクションは**未変更**（§4.1の視覚再設計で扱うため据え置き）。

## 残作業: UX-3 §4.1（旗艦の視覚再設計）＝ **視覚回帰ループ前提**

`docs/ui-redesign-plan.md §4.1` の以下は**描画が変わる**ため、`-linux` 視覚回帰（Antigravity/CI）での確認が必須。mac単独では基準線を作れないため未着手:
- Hero圧縮（650→約280px）／BeginnerRoadmap・QuickStartPresets の CollapsibleSection・チップ化
- `LinkBudgetNumberField` → 共通 `Field` 移行（入力密度 4,000→2,000px）。移行完了後に本ファイルは削除
- 上級入力の CollapsibleSection 格納／相談CTA 6→2／ステップ体系の1系統化

### 進め方（推奨）
1. Claude/Codex が §4.1 の変更を `track/ux3-flagship-visual` で実施。
2. 非視覚ゲート（tsc/vitest/lint/build/e2e）をローカルで緑にする。
3. Antigravity が `docs/handoff/visual-regression-runbook.md` に従い CI で `test:visual` を実行し、意図した差分のみか確認 → `-linux` 基準線を更新。
4. レビュー後マージ。

## 他の大型ツール（UX-3 §4.2/§4.3）
- NCU（`ncu-below-ground`）: 既にクライアント分割済み（コミット c446439）。§4.2 の視覚改修が残。
- ナミゲート: §4.3 の視覚改修が残。いずれも視覚ループ前提。
