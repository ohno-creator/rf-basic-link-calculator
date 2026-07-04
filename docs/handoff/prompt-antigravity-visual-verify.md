# Antigravity 発注プロンプト — UX-3 §4.1 入力移行の視覚回帰検証（＋E4規格調査）

> このファイルをそのまま Antigravity（`agy`）に貼り付けて着手してください。
> あなたは **視覚検証・ブラウザ実機操作・Web調査担当**。担当境界は **`e2e/**`・`docs/**` と `-linux` スクショ基準線のみ**。
> `src/lib/rf/**` の計算ロジックと `src/components/**`・`src/app/tools/**` のソースは変更禁止（見つけた不具合は直さず `docs/handoff/` に記録）。

---

## 役割と前提

Claude が旗艦（rf-basic-link-calculator）の **全数値入力19件を共通 `Field` へ移行**した（UX-3 §4.1・入力密度削減）。**機能ゲート（tsc/vitest/lint/build/e2e）は全緑**だが、描画が変わるため `-linux` 視覚回帰での確認と再ベースラインが必要。これがあなたの主タスク。

視覚回帰インフラは導入済み（あなたが UX-0/UX-1V で整備）:
- `npm run test:visual`（`TEST_VISUAL=true playwright test`）で `e2e/visual.spec.ts` を実行。基準線は `e2e/*-snapshots/*-linux.png`（25ページ×2VP=50枚）。
- 運用手順は `docs/handoff/visual-regression-runbook.md`。
- **`-linux` 基準線は Linux/CI でのみ生成・比較**（mac は font 差で不一致）。

---

## Git 隔離（必須・恒久ルール / roadmap §8.2）

```bash
git fetch origin
git worktree add ../agy-ux3 origin/track/ux3-flagship-visual
cd ../agy-ux3 && npm ci
```
- **`git add -A` / `git add .` 禁止**（変更ファイルはパス指定）。`reset`/`stash`/`push --force` 禁止。
- 完了後 `git worktree remove ../agy-ux3`、`git worktree prune`。

---

## 対象ブランチと変更内容（意図した変更）

- ブランチ: **`track/ux3-flagship-visual`**（origin にあり。base は feature）。
- 変わったこと:
  1. 旗艦の全入力を `Field` へ移行（旧 `LinkBudgetNumberField` 18件＋距離の生input1件）。距離は `Field` の `unitSelect`（m/km切替＋換算）で吸収。
  2. 各入力の「常時表示の説明文・推奨レンジ行・Card枠・レンジスライダー」を撤去し、説明と推奨レンジは HelpHint(?) アイコンへ集約 → **入力列が大幅に短くなる**（狙い 4,000px→2,000px方向）。
  3. 入力 role が spinbutton→textbox（アプリ標準 NumberInput=type text）。見た目はほぼ不変。e2e 2ロケータを textbox へ更新済み。
- 変更ファイル: `LinkBudgetPanel.tsx` / `IotHataCalibrationPanel.tsx`（`LinkBudgetNumberField.tsx` は削除）/ `e2e/tools.spec.ts`。他ツールのソースは不変（Field/ChoiceChips は追加のみ）。

---

## WO-1: 旗艦の視覚回帰検証＋再ベースライン

1. **CI(Linux) で `TEST_VISUAL=true npm run test:visual` を実行**し、差分を確認。
2. **旗艦（`rf-basic-link-calculator-desktop` / `-mobile`）の差分が「意図した密度低下」か**を目視確認（before/after 差分画像を添付）。
3. **他ツール（残り24ページ）のスナップショットに予期せぬ差分が無い**ことを確認（Field/ChoiceChips は追加のみ＝他ツール不変のはず。差分が出たら回帰の疑いとして記録）。
4. 意図どおりなら **CI 上で旗艦の `-linux` 基準線のみ `--update-snapshots` で再生成**し、生成PNGをブランチにコミットバック（runbook 準拠）。

## WO-2: ★要判断ポイントの視覚評価（Claude→ユーザー/あなたへ申し送り）

以下は「Claude が見えない視覚結果」。desktop/mobile のスクショ付きで是非を判定してほしい:
1. **レンジスライダー18個の消滅**: 旧実装は各入力にスライダーを常設。`Field` 既定は非表示のため全消滅。§4.1の密度削減には沿うが**機能変更**。「残すべき入力（例: 距離・周波数）」があれば具体的に指摘 → Claude が `showSlider` を該当フィールドへ再付与する。
2. **help への文章集約**: `txAntennaHeightM`/`rxAntennaHeightM` は旧 description と tooltip が同義で help がやや反復的。読みやすさの観点で一文化すべきか（情報欠落は無い）。
3. **HelpHint 内の長文折返し**: 長い help がツールチップ内で崩れていないか。

## WO-3（調査・任意）: E4 EIRP法規の ARIB STD-T108 規格値の一次確認

`docs/handoff/E4-E5-data-followup.md` 参照。EIRP計算エンジンは実装済だが、規格数値（空中線電力区分・EIRP上限・キャリアセンス閾値・送信時間/デューティ）が一次未確認。ARIB STD-T108 一次規格（https://www.arib.or.jp/english/std_tr/telecommunications/desc/std-t108.html ）を当たり、`docs/handoff/E4-aribT108-values.md` に「区分/上限値/出典/確度(confirmed|needs_check)」の表で整理（推測値を confirmed にしない）。

---

## 共通ゲート（差分を出す場合）
- `npx tsc --noEmit` / `npm run test` / `npm run lint` / `GITHUB_PAGES=true npm run build` / `npm run test:e2e`（=tools.spec のみ・デプロイゲート）がすべて緑であること。
- あなたの追加は `test:e2e`（デプロイゲート）を汚さないこと（視覚系は TEST_VISUAL 隔離のまま）。

## 完了報告フォーマット
```markdown
## 完了: WO-<n>
- 旗艦 desktop/mobile の before/after（差分画像）
- 他ツールの予期せぬ差分: 有無と該当
- ★要判断: スライダー消滅／help集約の視覚評価（残す/畳む の推奨）
- 再ベースライン: 実施済み/未（コミットハッシュ）
- src への申し送り（自分では変更していないこと）: <あれば>
- 判定: 「意図どおり・マージ可」／「要修正: <具体箇所>」
```

不明点は本プロンプトと `visual-regression-runbook.md` の範囲で判断。src を変えたくなったら止めて `docs/handoff/` に記録し Claude へ申し送る。
