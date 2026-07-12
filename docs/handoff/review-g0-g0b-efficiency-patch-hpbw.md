# レビュー報告 — G-0（放射効率変換）／G-0b（パッチ半値角）（Workflow・敵対的検証済み）

**実施**: Claude Sonnet 5／**日付**: 2026-07-12／**手法**: 2並列レビュー（発注書は`git show`で該当コミットから取得）→検出11件を1件ずつ独立エージェントが反証検証（confirmed=10／refuted=1）
**対象**: `track/term-lab`（Codex未コミットの作業ツリー状態。**両ツールとも実装は完成域**——lib/データ/Panel/Column/page/tools.ts登録/e2eまで揃っている）

## 補足: 並行して実施した技術ゲートチェック（O-6）
Workflowと並行して、作業ツリー全体に対し以下を直接実行し確認した（読み取り専用・非破壊）:
- `npx vitest run` → **661 tests passed (72 files)** — 全緑（G-6のareaCoverage.test.ts 14件含む）
- `npx tsc --noEmit` → エラーなし
- `npx eslint` （新規lib/panel対象） → エラーなし
- `GITHUB_PAGES=true npx next build` → **62ページ静的書き出し成功**（radiation-efficiency-converter・patch-hpbw-explorer・antenna-term-labを含む）
- G-6（`src/lib/rf/areaCoverage.ts`）は発注書 `prompt-codex-e2-area-coverage.md` の設計と完全一致・自己導出7点のテスト値もそのまま採用されており、追加の指摘なし（軽量レビューで確認済み）
- `src/data/columns/noiseFloor.ts` の文字化け修正（G-3fix）が適用済みであることを確認

以上は「動く」ことの確認であり、以下の指摘（発注書との仕様差分・アクセシビリティ・UI論理不整合）は静的テストでは検出されない領域のため、別途レビューで検出したもの。

## P1（1件・要修正）

### 1. PatchHpbwPanel.tsx — 「設置ずれ耐性」のずれ角がHPBW変更時にクランプされず非物理値を無警告表示
`offset`（ずれ角）は`useState`管理でHPBWスライダー(30-120°)とは独立。HPBW=120°でoffsetを110°まで上げた後にHPBWを30°へ下げても、offset状態は再クランプされない。`pointingLossDb(offset, hpbw)`（`L=12(θ/HPBW)²`近似）はこの状態をそのまま計算するため、例えば上記操作で **loss≈161dB という主ローブ外の非物理的値** を注記なしで表示しうる。既存`pointingMargin.ts`には有効域フラグ（`withinMainLobe`相当）があるが、本Panelは未使用。
**修正案**: HPBW変更時に`offset`を`min(offset, hpbw)`等へ再クランプする、または`withinMainLobe`が偽の場合に「近似の適用範囲外」の注記を表示する。

## P2（6件・次点で修正）

| # | ファイル | 内容 |
|---|---|---|
| 2 | efficiencyGuidelines.ts / RadiationEfficiencyPanel.tsx | 発注書指定の関連リンク`radiation-resistance`・金属筐体行の`detuning-estimator`が未配線（両slugとも実在・単純な配線漏れ） |
| 3 | RadiationEfficiencyPanel.tsx | 現在値がどの目安レンジにも該当しない場合の「範囲外表示」（発注書明記）が未実装 |
| 4 | RadiationEfficiencyPanel.tsx | 状況フィルタチップに`aria-pressed`が無い（同種UI6箇所は全て付与済みの既存コンベンションから逸脱） |
| 5 | tools.ts | `patch-hpbw-explorer`の`icon:"compass"`が`ToolDirectoryBrowser.tsx`のiconMapに未登録で、一覧画面では黙ってGaugeアイコンにフォールバックする |
| 6 | PatchHpbwPanel.tsx | 発注書指定の関連ツールリンク3件中、`aperture-gain-beamwidth`・`patch-antenna-dimensions`の2件が未実装（`pointing-margin`のみ実装） |
| 7 | e2e/tools.spec.ts | 「HPBW変更→概算指向性が連動」のアサーションが実質何もテストしていない（固定ラベル文字列の存在確認のみで、指向性の数値更新を検証していないため、計算が壊れても検知できない） |

## P3（2件・軽微）

| # | ファイル | 内容 |
|---|---|---|
| 8 | RadiationEfficiencyPanel.tsx | FormulaExplanationCardが発注書の3段構成のうち「①効率の定義」を欠く（②③のみ） |
| 9 | RadiationEfficiencyPanel.tsx | Callout文言「50%超は良好」と判定ロジック`percent>=50`がちょうど50.0%で意味的にズレる（要確認） |
| 10 | PatchHpbwPanel.tsx | 「ビーム内=着色/外=減光」の解釈が発注書文面から一意に確定できず、実装（マーカー到達時の一瞬の強調のみ）との一致が要確認（実害は小さい表示演出の解釈差） |

## 反証で除外した1件（参考）
`radiationEfficiency.ts`の`efficiencyPercentToDb`が既存`assertPercent`/`RfErrorCode.Percent`を使わず独自に`RfErrorCode.OutOfDomain`を投げている、という指摘 — 検証の結果、**このコードベースでは実は`OutOfDomain`を使う独自レンジチェックの方が支配的な慣習**（`shadowingMargin.ts`・`diversityGain.ts`・`areaCoverage.ts`・`patchHpbw.ts`等20箇所以上）であり、`assertPercent`使用は`antenna.ts`の3箇所のみの少数派。指摘は誇張と判断し反証。

## テスト
P1修正後、`offset`がHPBW変更に追随する境界値のテスト（例: HPBW=30°縮小後にoffset=110°相当の状態が生じないこと）を追加。P2のe2e強化（#7）は`approximateDirectivityDbi`の数値を直接アサートする形に変更。
