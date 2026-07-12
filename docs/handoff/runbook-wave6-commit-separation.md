# ランブック — track/term-lab 混在差分のコミット分離と統合（第6波仕上げ）

**背景**: Codex固有規約によりCodexは git add/commit/push/ブランチ切替を行わない。G-0/G-0b/G-1/G-2/G-6の実装が track/term-lab の作業ツリーに**全て未コミットで混在**している。本ランブックはClaude（またはユーザー）がgit操作を代行するための正本。
**絶対禁止**: `git clean`（OTA検算報告書と21語のterm-labファイルが消失する）／`git stash`（復元事故リスク）／パス指定なしの `git add .`

## 0. 棚卸し（2026-07-12時点・確定）

| 案件 | 対象ファイル |
|---|---|
| **G-6＋G-3fix** | `src/lib/rf/areaCoverage.ts`＋test／`src/data/columns/areaCoverage.ts`／`src/app/tools/_components/ShadowingMarginPanel.tsx`(M)／`src/data/columns/noiseFloor.ts`(M・文字化け修正)／e2e該当ブロック（@@996付近・shadowing margin直後） |
| **G-2 OTA** | `src/lib/rf/harmonicHunter.ts`・`otaExpert.ts`・`otaImportParser.ts`＋test3本／`src/app/tools/_components/OtaExpertPanel.tsx`(新)・`OtaImplementationLossPanel.tsx`(M)／**`docs/handoff/antigravity-ota-expert-verification.md`（必ず同梱）**／e2e「OTA expert workflow」describe |
| **G-1 term-lab** | `src/app/tools/antenna-term-lab/**`（全て）／e2e term-lab describe |
| **G-0 効率変換** | `src/lib/rf/radiationEfficiency.ts`＋test／`src/data/efficiencyGuidelines.ts`／`RadiationEfficiencyPanel.tsx`・`RadiationEfficiencyColumn.tsx`／`src/app/tools/radiation-efficiency-converter/`／e2e 1本 |
| **G-0b 半値角** | `src/lib/rf/patchHpbw.ts`＋test／`PatchHpbwPanel.tsx`・`PatchHpbwColumn.tsx`／`src/app/tools/patch-hpbw-explorer/`／e2e 1本 |
| **結線（共有）** | `src/data/tools.ts`（3エントリ=3ハンクで分離可能を確認済み）／`src/tests/__snapshots__/toolsRegistry.test.ts.snap`（+51行）／e2eの分離しきれない残り |

⚠️ **追加発見（v10で最重要）**: track/term-labの履歴に**不採用判定済みF1スパイクコミット `0c5aa81e` が混入**している。HEADでは `src/app/tools/[slug]/`（manifestルート）が存在し、`vswr-bandwidth-q`・`electrical-length`・`pointing-margin` の個別page.tsxが**削除されたまま**。判定文書（f1-manifest-spike-verdict.md）の通り本方式はFirst Load +19kBで不採用のため、**featureへ統合する前に必ずrevertする**。

## 1. コミット分離手順（この順で実行）

前提: 各ステップ後に `git status -sb` で意図した差分だけが消化されたことを確認。コミットは全てパス指定。

```bash
# Commit 1: G-6＋G-3fix（tools.ts非依存・最も独立）
git add src/lib/rf/areaCoverage.ts src/tests/areaCoverage.test.ts \
        src/data/columns/areaCoverage.ts src/app/tools/_components/ShadowingMarginPanel.tsx \
        src/data/columns/noiseFloor.ts
git add -p e2e/tools.spec.ts   # @@996付近のshadowing marginブロックのみ 'y'、他は 'n'（'s'で分割）
git commit -m "feat(shadowing-margin): エリアカバレッジ(Jakes近似)エキスパートモード [G-6]＋noiseFloor文字化け修正 [G-3fix]"

# Commit 2: G-2 OTAエキスパート（検算報告書を必ず同梱）
git add src/lib/rf/harmonicHunter.ts src/lib/rf/otaExpert.ts src/lib/rf/otaImportParser.ts \
        src/tests/harmonicHunter.test.ts src/tests/otaExpert.test.ts src/tests/otaImportParser.test.ts \
        src/app/tools/_components/OtaExpertPanel.tsx src/app/tools/_components/OtaImplementationLossPanel.tsx \
        docs/handoff/antigravity-ota-expert-verification.md
git add -p e2e/tools.spec.ts   # 「OTA expert workflow」describeのみ
git commit -m "feat(ota): エキスパートモード——干渉源ハンター・要求値合否・距離換算・Excel連携 [G-2]"

# Commit 3: G-1 term-lab本体
git add "src/app/tools/antenna-term-lab"
git add -p e2e/tools.spec.ts   # term-lab describeのみ
git commit -m "feat(antenna-term-lab): 用語7〜21実装・シェル完成・e2e [G-1]"

# Commit 4: G-0 効率変換
git add src/lib/rf/radiationEfficiency.ts src/tests/radiationEfficiency.test.ts \
        src/data/efficiencyGuidelines.ts src/app/tools/_components/RadiationEfficiencyPanel.tsx \
        src/app/tools/_components/RadiationEfficiencyColumn.tsx "src/app/tools/radiation-efficiency-converter"
git add -p e2e/tools.spec.ts   # radiation efficiencyテストのみ
git commit -m "feat(radiation-efficiency): dB⇔%変換・実務目安表・Wheelerキャップコラム [G-0]"

# Commit 5: G-0b 半値角
git add src/lib/rf/patchHpbw.ts src/tests/patchHpbw.test.ts \
        src/app/tools/_components/PatchHpbwPanel.tsx src/app/tools/_components/PatchHpbwColumn.tsx \
        "src/app/tools/patch-hpbw-explorer"
git add -p e2e/tools.spec.ts   # patch HPBWテストのみ
git commit -m "feat(patch-hpbw): 半値角エクスプローラ——極座標体感・カバレッジ円・照準損失 [G-0b]"

# Commit 6: 結線（3ツールのレジストリ登録＋スナップショット＋e2e残り）
git add src/data/tools.ts src/tests/__snapshots__/toolsRegistry.test.ts.snap e2e/tools.spec.ts
git commit -m "feat(tools): antenna-term-lab / patch-hpbw-explorer / radiation-efficiency-converter を登録 [G-0/G-0b/G-1結線]"
```

注: e2eのハンク分離が `git add -p` で困難な場合（ブロックが1ハンクに融合している場合）は、無理をせず**e2e全差分をCommit 6に一括同梱**してよい（コード本体の案件分離が主目的。e2eは追記のみで衝突リスクが低い）。

```bash
# Commit 7: F1スパイクのrevert（ツリーがクリーンになってから）
git status -sb   # クリーン確認
git revert --no-edit 0c5aa81e
# → src/app/tools/[slug]/ が消え、個別ページ3本が復活する。GITHUB_PAGES=true npm run build で
#   /tools/vswr-bandwidth-q 等が個別ルートに戻り [slug] が消えることを確認
```

## 2. 分離後の残作業（順に）

1. **レビュー文書のツリーへの取り込み**: `git merge origin/feature/initial-rf-basic-link-calculator`（docsのみの差分・衝突なし想定）。これで**Codexが3本のレビュー報告を作業ツリー内で読める**ようになる（Codexはブランチ切替不可のため、これまでfeature上のレビュー文書が見えていなかった）
2. **P1修正×6件**（Codexがツリー内で編集→Claudeが案件別にコミット）: 全件 `review-o1-term-lab-ota-expert.md`／`review-g0-g0b-efficiency-patch-hpbw.md` 参照。①TermDielectricConstant εr=1.0握りつぶし ②TermAntennaGain保存則表示 ③TermEffectiveAperture `/tools/fspl`→`/tools/free-space-loss` ④TermVSWR定在波式 ⑤otaImportParserヘッダー誤判定 ⑥PatchHpbwPanel offset非クランプ。**P2のうち軽微な3件（icon"compass"未登録・関連リンク配線・aria-pressed）も同時対応推奨**
3. **Playwright実行**（Claude環境で `npm run test:e2e`。Codex環境はMachPort/EMFILEで実行不能だった。Claude環境でも失敗する場合はCIで実行: 過去のvisual-loop手順でtrackブランチをon.pushに一時追加→Actions上のe2eゲートで検証）
4. **push→feature統合**: `git push origin track/term-lab` → feature へマージ（PRまたはfast-forward運用は現行慣行に従う）
5. **rebaseline8（視覚ベースライン・一括方式）**: 5案件を**個別ではなく統合後に一括で1回**実施（正本: 記憶済み運用——並列・分割rebaselineはPNGバイナリ競合を生むため。ランブック: prompt-wave5-codex-antigravity.md C-2の toggle→snapshot自動更新→revert 手順）
6. **feature→main PR**: CI全緑確認後にマージ。Antigravity復帰後にA-2/A-2b/A-2c/A-3実機/A-5の官能評価ラベルを後付け

## 3. 検証コマンド（各コミット後の最低限）
```bash
npx tsc --noEmit && npx vitest run 2>&1 | grep -E "Tests .+ passed"   # 「Tests 661 passed」以上を明示確認
```
ビルド確認はCommit 6と7の後に: `GITHUB_PAGES=true npm run build`（dev server停止確認後）。
