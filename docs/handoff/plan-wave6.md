# 第6波 実行プラン（2026-07-12 改訂v8・3者分担の正本）

**担当体制**: Claude Sonnet 5（設計・レビュー・統括／Antigravity休止中の代行検証）／GPT-5.6=Codex（実装量産）／Antigravity（**リミット到達につき休止中・復帰待ち**）

**Claude Sonnet 5の代行範囲（v5から不変）**: WebSearch/WebFetchによる一次情報裏取り・lib計算の独立検算・コードレベルの整合性チェックは代行可能。**ブラウザ実機操作・視覚官能評価は代行不可**——Antigravity復帰まで滞留。e2e/視覚回帰の自動実行（pass/fail・pixel-diff）は代行できるが、diffが「意図した変更か」の最終目視承認はAntigravity依存のまま。

## 1. 現況（v8時点の確定事実）
- main = e6f7cb1d（56ツール・CI緑・Pages配信済み）／feature = 42b97ae9（main+ドキュメントのみ・コード差分なし）
- **term-lab / OTAエキスパート: レビュー完了（O-1/O-1b）——push前に18件の指摘を検出**（Workflow 5並列レビュー→24件の指摘候補を1件ずつ独立に敵対的検証→確定18件/反証除外6件）。**内訳: P1(要修正) 5件・P2(次点) 6件・P3(軽微) 7件**。詳細は `review-o1-term-lab-ota-expert.md`。**Codexはこれらの修正をコミット前に取り込むこと**（まだpushされていないため今が直しやすいタイミング）
  - P1の代表例: TermDielectricConstant.tsx（εr=1.0でlibエラーを握りつぶし別式にすり替わる）／TermAntennaGain.tsx（「全放射電力は不変」の表示と実際の図形面積が+20%不一致）／TermEffectiveAperture.tsx（`/tools/fspl`が404・正しくは`/tools/free-space-loss`）／TermVSWR.tsx（定在波アニメが腹と節の空間変化を表現できず一様振幅に潰れている）／otaImportParser.ts（ヘッダー行誤判定で正当データが無言欠落）
  - P2の共通パターン: 6件中5件が「既存lib関数を再利用せず物理式をインライン再実装」という発注書ルール違反（TermPolarization/TermDielectricConstant/TermEffectiveAperture/TermResonanceの4語＋TermRadiationEfficiencyの仕様未達1件・TermRadiationPatternの簡略化未開示1件）
- **term-lab実装は21語とも作業ツリーに存在・`terms/index.ts`全登録・`src/data/tools.ts`も編集済み（コミット未確定）**。OTAエキスパートは lib3本＋UI（`OtaExpertPanel.tsx`新規・`OtaImplementationLossPanel.tsx`修正）ともレビュー中に完成が進み、作業ツリー上でほぼ結線済みと見られる
- ⚠️**消失リスク継続**: `docs/handoff/antigravity-ota-expert-verification.md`（Antigravity検算済み報告）が依然**未コミット**。**G-1かG-2の直近コミットに必ず同梱すること**
- ✅クローズ済み: A-1（Band v3裏取り）／A-3検算（干渉源ハンター5点）／rebaseline7手順確認／NoiseFloorColumnレビュー／E2第2段の設計・発注書
- 未着手: G-0（放射効率変換）・G-0b（パッチ半値角）・G-3量産・G-4・G-6 — ブランチ・ファイルとも無し
- **v7で追加（ユーザー発注）**: **周波数の用途地図（非セルラー編）**——発注書 `prompt-codex-spectrum-atlas.md`。周波数再編アクションプラン（令和7年度版）の主要数値は独立2ソースで相互照合済み（高確度）

## 2. 分担表（優先度順）

### Claude Sonnet 5（レビュー・統括レーン＋Antigravity代行）
| # | タスク | 状態 |
|---|---|---|
| O-1 | term-lab物理正確性レビュー（21語） | ✅**完了**（review-o1-term-lab-ota-expert.md。P1×3語+P2×4語+P3×5語の指摘） |
| O-1b | OTAエキスパートlibレビュー | ✅**完了**（同上。P1×1+P3×1の指摘） |
| O-2 | コラム移行レビューゲート（column-guide §3・1本1コミットごと） | G-3開始待ち |
| O-3 | **リリース統括**: term-lab確定後の feature→main PR・CI緑確認・視覚ループ指揮（rebaseline8） | Codexのpush待ち（P1修正の反映を確認してから） |
| O-5 | F1改/F3の検収 | G-4待ち |
| O-6 | Antigravity代行検証（Web調査・出典裏取り・検算に限定） | 継続 |
| O-7 | 周波数用途地図のデータ裏取り | G-7納品待ち |
| 済 | O-4: E2第2段設計（fb825914）✅ | — |

### GPT-5.6 / Codex（実装レーン・直列推奨）
| # | タスク | 参照 |
|---|---|---|
| G-1 | **term-lab仕上げ（最優先）**: **①review-o1-term-lab-ota-expert.mdのP1×3語（誘電率/利得/実効面積/VSWR）を修正**（可能ならP2も） ②tools.tsへの登録（作業ツリーで編集途中の様子・完了させる） ③未コミット15語＋e2eのコミット確定 ④`antigravity-ota-expert-verification.md`を同梱 ⑤全ゲート緑→push→視覚ループ→main | prompt-codex-term-lab.md ＋ review-o1-term-lab-ota-expert.md |
| G-2 | **OTAエキスパートモード仕上げ**: **①otaImportParser.tsのヘッダー誤判定バグ（P1）を修正** ②harmonicHunter.test.tsに異常系・UL帯除外テスト追加（P3） ③lib3本+UI(OtaExpertPanel.tsx)+e2eの結線を完了しコミット確定 | prompt-codex-ota-expert.md ＋ review-o1-term-lab-ota-expert.md |
| G-0 | 放射効率dB⇔%変換ツール | prompt-codex-efficiency-converter.md |
| G-0b | パッチアンテナ半値角アプリ | prompt-codex-patch-hpbw.md |
| G-3 | コラム構造化移行の量産（残り約29本・quant=compute()同時付与） | 手本: fresnelDeepDive.ts |
| G-3fix | `noiseFloor.ts` hook「地球 of 自転」→「地球の自転」（G-3初回コミットに同梱可） | review-o1-wave6-codex-deliverables.md §1 |
| G-4 | F1改＋F3（scaffold script＋e2eスモーク自動生成） | f1-manifest-spike-verdict.md |
| G-6 | E2第2段実装（areaCoverageFraction＋shadowing-marginエキスパートモード） | prompt-codex-e2-area-coverage.md |
| G-7 | 周波数の用途地図（非セルラー編）: 5モードUI＋SpectrumEntry型データ＋コラム9本 | prompt-codex-spectrum-atlas.md |
| 済 | G-5: Band v3データ反映（80274e4b）✅ | — |
| 規約 | 専用worktree・パス指定add・`Tests N passed`行確認・build前にdev停止・視覚変更はrebaselineループ | roadmap §11 |

### Antigravity（休止中——復帰後の実機・目視タスクのみ残置）
| # | タスク | 前提 |
|---|---|---|
| A-2 | term-lab実機受入（21語官能評価・375px・reduced-motion・進捗保存） | G-1確定後（P1修正の反映込み） |
| A-3実機 | OTAエキスパート実機受入（検算5点は済・実機とインポート異常系のみ） | G-2確定後 |
| A-2b / A-2c | 効率変換／半値角アプリの受入 | G-0 / G-0b後 |
| A-5 | rebaseline7＋今後のrebaseline8等の視覚差分の目視承認 | 復帰後即 |
| A-4 | コラム出典リンク鮮度チェック（移行10本ごと） | G-3進行中 |
| A-6 | E2第2段の実機受入（数値7点はClaude検証済み・同心円図の体感評価のみ） | G-6後 |
| A-7 | 周波数用途地図の実機受入＋残数裏取り（5モード官能評価・375px） | G-7＋O-7後 |
| 済 | ~~A-1~~ Band v3裏取り✅／~~A-3検算~~ 5点照合✅（いずれもクローズ） | — |

## 3. リリース順序（推奨・v8改訂）
**① term-lab（G-1）を最優先で確定**（P1修正込み・実装済み資産を早くmainへ）→ ② OTAエキスパート（G-2・P1修正込み）→ ③ 効率変換（G-0）・半値角（G-0b）→ ④ 周波数用途地図（G-7→O-7）——並行着手も可 → ⑤ コラム移行10本単位（G-3+G-3fix）→ ⑥ F1改/F3（G-4→O-5）→ ⑦ E2第2段（G-6）。
Antigravity依存タスクは復帰まで滞留——技術ゲート緑でのマージは可・「実機官能評価済み」ラベルは復帰後付与。

## 4. 掃除メモ
残骸ブランチ: `rebaseline3`/`rebaseline7`/`r5-diagram-hex`/`ux1v-visual-loop` は役目済みなら削除可（スパイク2本 `h6-3d-spike`/`f1-manifest-spike` は判定記録として保持）。
