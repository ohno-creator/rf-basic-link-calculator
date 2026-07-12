# 第5波 引き継ぎ書 — Band地図v3の仕上げ（Codex／Antigravity自走用）

**作成**: Claude（2026-07-12・リミット到達前の引き継ぎ）
**現況**: Band地図v3（5モード・国→キャリア→Band表ドリルダウン・IoT位置づけ）はCodexが実装しmain反映済み（a0a7a2c5）。データ確認日2026-07-12・`unverified-current` 4件が残存。**視覚ベースラインはv3反映前のまま**（band-mapスナップショット最終更新2026-07-11 20:27=rebaseline5時点）。

## 状況サマリー
- main = feature = d079e594（56ツール・CI緑・Pages配信済み）
- Band地図v3: `src/data/cellularCarrierBands.ts`（CarrierProfile: region/country/carrier/bands[positioning/status/iot]/iotSummary/sources/checkedAt）＋`CellularBandModes.tsx`＋lib/テスト51行＋e2e追加31行
- Claudeの worktree `claude-band`（track/band-map-v2）は**作業不要になったため削除してよい**（`git worktree remove /Users/pc141/Documents/claude-band --force && git branch -D track/band-map-v2`）
- 参照ランブック: docs/improvement-roadmap.md §11（運用リスク）・memory化済みの鉄則（パス指定commit・`Tests N passed`行の明示確認・build前にdev停止・ポート3000占有確認）

---

## Antigravity 分担（先行着手可）

### A-1. データ最新性の裏取り（最優先・ユーザー要望「最新の状況を確認して反映」）
`src/data/cellularCarrierBands.ts` の全CarrierProfileについて一次情報（総務省 周波数割当・各キャリア公式・GSMA Mobile IoT Deployment Map・GSA）で照合:
1. **`status: "unverified-current"` の4件を最優先で確定**（confirmed-current か revoked/修正へ）
2. 日本4社: 割当帯・LTE-M/NB-IoT提供状況（ドコモNB-IoT終了・楽天LTE-M有無・楽天700MHz商用状況）
3. 米欧中韓印: 各キャリアのBand・UL/DL・IoT展開Band（FirstNet B14・600MHz B71・韓国28GHz返納後・中国NB-IoT・印n78）
4. 各Bandの `positioning` コメントが事実と整合するか（IoT観点の記述の妥当性）
**報告**: `docs/handoff/antigravity-band-v3-verification.md` へ「項目・現行値・一次情報値・出典URL・確認日・判定（一致/要修正+提案値）」の表。**数値の書き換えは提案まで**（反映はCodex、レビュー記録を残す）

### A-2. Band地図v3の実機受入
- 5モード切替（入門/実務/設計/世界/検索一覧）の動作・表示件数整合
- **ドリルダウン**: 国選択→キャリア一覧→キャリア選択→4G/5G Band表（UL/DL周波数）＋Band別IoT位置づけコメントの表示（ユーザー要望の中核。この流れが直感的か官能評価）
- 検索一覧: "B19"/"800"/"ドコモ"/"NB-IoT" でのヒットとソート
- モバイル375px: 横はみ出しなし・タッチ44px・表の横スクロール容器
- 報告: 同上ファイルにOK/NG表（P0-P3・再現手順）

### A-3. rebaseline7の差分承認（Codexのループ実行後）

---

## Codex 分担

### C-1. Antigravity裏取り結果の反映
A-1報告書の「要修正」をデータへ反映（`checkedAt`更新・statusをconfirmed-currentへ）。テスト（cellularCarrierCatalog.test.ts）の期待値も同時更新。**vitestは `Tests N passed` の行まで確認**。

### C-2. 視覚ベースライン（rebaseline7）→main反映【重要・未実施】
Band地図v3で見た目が大幅変更されたが基準線が古い。確立済みランブックで実施:
1. `track/rebaseline7` をfeatureから作成し、`.github/workflows/deploy-pages.yml` に視覚トグルを適用（過去例: `git show 5edb52ce:.github/workflows/deploy-pages.yml` をsedでブランチ名置換——rebaseline6までの各コミット参照）
2. push→CIがスナップショット自動コミット→**トグルrevertコミット**→feature/mainへマージ
3. 注意: `concurrency.group: pages-${{ github.ref }}` 化を含むトグル一式・revert漏れ厳禁

### C-3. ゲートと後片付け
- 全ゲート: `npx tsc --noEmit`／`npm run test`（Tests行確認）／`npm run lint`／`GITHUB_PAGES=true npm run build`（**dev server停止後**）／`npx playwright test`（ポート3000の占有プロセス確認後）
- `claude-band` worktreeと `track/band-map-v2` ローカル枝の削除

### C-4.（余力あれば・次波本命）コラム構造化移行の量産
手本: `src/data/columns/fresnelDeepDive.ts`＋`src/components/ToolColumnCard.tsx`＋ラッパー化した`FresnelDeepDive.tsx`（D1パイロット）。
既存TSX直書きコラム（NoiseFloorColumn/HataColumn/各<Xxx>Column 約30本）を同形式へ移行。**1コラム=1コミット・出典はlocator付きColumnSource・quantはcompute()でlib関数から**。ライブ値が必要なコラム（PatchAntenna等の入力連動）はliveKey＋panel側live propで。移行のたびに該当ページのe2e文字列互換を確認。

## 共通規約（再掲・違反はマージ不可）
- 専用worktreeで作業・`git add -A`禁止（パス指定）・共有ファイル編集時はブランチ/HEADを`git status -sb`で確認
- 数値の発明禁止（出典必須）・「未確認」を確認せずconfirmedにしない
- push前に全ゲート緑・視覚変更はrebaselineループへ
