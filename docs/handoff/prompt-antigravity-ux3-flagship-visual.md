# Antigravity 発注: `track/ux3-flagship-visual` の視覚回帰検証（UX-3 §4.1 第1弾）

Claude が旗艦の数値入力18件を新共通部品 `Field` へ移行した（入力密度削減）。**機能ゲートは全緑**だが、
描画が変わるため `-linux` 視覚回帰での確認と再ベースラインが必要。あなた（Antigravity）に検証を依頼する。

## 対象ブランチ
`track/ux3-flagship-visual`（`origin` に push 済み）。ベースは feature。

## 何が変わったか（意図した変更）
- **旗艦の全数値入力を共通 `Field` へ移行**（旧LinkBudgetNumberField 18件＋距離入力の生input1件）。距離は `Field` の `unitSelect`（m/km切替＋換算）で吸収。
- 各入力の「常時表示の説明文・推奨レンジ行・Card枠・レンジスライダー」を撤去し、説明・推奨レンジは HelpHint(?) アイコンへ集約 → **入力列が大幅に短くなる**（狙い: 4,000px→2,000px方向）。
- 入力の role が spinbutton→textbox（アプリ標準 NumberInput= type text）。見た目はほぼ不変。
- **本ブランチの範囲は入力のField化のみ**。Hero圧縮・CTA削減・上級入力のCollapsibleSection格納・ステップ体系統一は次段（この増分の視覚確認後に別途）。

## 検証手順（visual-regression-runbook.md 準拠）
```bash
git fetch origin
git worktree add ../agy-ux3 origin/track/ux3-flagship-visual
cd ../agy-ux3 && npm ci
# CI(Linux)で:
TEST_VISUAL=true npm run test:visual   # 旗艦 rf-basic-link-calculator の desktop/mobile 差分を確認
```
- **旗艦ページ（`rf-basic-link-calculator-desktop`/`-mobile`）のスナップショット差分は「意図した密度低下」か**を目視確認。
- 意図どおりなら `--update-snapshots` で旗艦の `-linux` 基準線のみ再生成しコミットバック。
- 他ツールのスナップショットに**予期せぬ差分が無い**ことも確認（Field/ChoiceChipsは追加のみ＝他ツールは不変のはず）。

## ★要判断（Claude→ユーザー/Antigravityへ申し送り）
1. **レンジスライダー18個の消滅**: 旧 `LinkBudgetNumberField` は各フィールドにスライダーを常設していた。`Field` 既定は非表示のため全消滅。§4.1の密度削減には沿うが**機能変更**。視覚上の是非を確認し、「残すべき」なら Claude が `showSlider` を必要フィールドへ再付与する（1行/箇所）。
2. **help への文章集約**: `txAntennaHeightM`/`rxAntennaHeightM` は旧 description と tooltip が同義で help がやや反復的。読みやすさ観点で一文化の余地（情報欠落はなし）。

## フィードバック様式
- 旗艦 desktop/mobile の before/after スクショ（差分画像）
- 予期せぬ差分の有無（他ツール）
- スライダー消滅・help集約の視覚評価（残す/畳むの推奨）
- 問題なければ「再ベースライン済・マージ可」、要修正なら具体箇所

## 次段（本ブランチ確認後）
§4.1の残り（距離入力の unitSelect 化・上級入力の CollapsibleSection 格納・Hero圧縮・CTA削減）を
同様に Claude が実装→本ループで検証、を繰り返す。
