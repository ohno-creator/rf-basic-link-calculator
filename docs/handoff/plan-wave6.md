# 第6波 実行プラン（2026-07-12 改訂v5・Antigravity一時休止対応）

**担当体制**: Claude Sonnet 5（設計・レビュー・統括／**Antigravity休止中は代行可能な検証を引き取る**）／GPT-5.6=Codex（実装量産・変更なし）／Antigravity（**本日リミット到達につき活動休止・復帰待ち**）

**Claude Sonnet 5の代行範囲（重要な限界）**: WebSearch/WebFetchによる一次情報裏取り・lib計算の独立検算・コードレベルの技術的整合性チェックは代行可能。**ブラウザでの実機操作・視覚官能評価（「見た目が気持ちいいか」等の主観評価）はツール制約上代行不可**——この種のタスクはAntigravity復帰まで滞留する。既存e2e/視覚回帰テストの自動実行（pass/fail・pixel-diff）までは代行できるが、diffの「意図した変更か」の最終判断はAntigravity依存のまま。

## 1. 現況（再確認・確定事実）
- main = e6f7cb1d（56ツール・CI緑・Pages配信済み）／feature = fb825914
- ✅**A-1クローズ確認**: `src/data/cellularCarrierBands.ts` の `unverified-current` は**残0件**（Antigravityの裏取り report `antigravity-band-v3-verification.md` をCodexが commit `80274e4b` [C-1] で全反映済み）
- ✅**A-3検算部分クローズ確認**: OTAエキスパート「干渉源ハンター」の手計算5点（26MHz×36次=936MHz→B8DL内／26×35=910→B8DL外／48×45=2160→B1DL内／48×41=1968→B1DL外／133×7=931→B8DL内）を、Antigravity報告（作業ツリーに未コミットで存在: `docs/handoff/antigravity-ota-expert-verification.md`）に対し**Claude Sonnet 5が独立に再計算し全5点一致を確認**。ただし**実機受入テスト部分は未実施**（Codexの機能コミット確定後・Antigravity復帰待ち）
- ⚠️**リスク**: 上記Antigravity報告書は作業ツリーに**未コミット**のまま。Codexが `git clean` 等を行うと消失する。G-2のコミット時に同梱するようCodexへ明記（下表G-2注記）
- 進行中: **term-lab（アンテナ用語ラボ21語）** — 作業ツリー上で21語すべての実装ファイルが揃った（コミット6・未コミット15、うち今回新たにEIRP/グランドプレーン/アイソレーション/マルチパスの4語を確認）。`e2e/tools.spec.ts` も更新中。**まだpush/コミット未確定**
- 未着手: **G-0（放射効率変換）・G-0b（パッチ半値角）** — ブランチ・ファイルとも存在せず
- 完了: rebaseline7（手順確認済み）／NoiseFloorColumn移行（レビュー済み・文字化け1件→G-3fix）／**E2第2段の設計＋発注書**（`prompt-codex-e2-area-coverage.md`。3GPP TR 38.901の出典URLをWebSearchで確認しhrefを補完済み）

## 2. 分担表（優先度順）

### Claude Sonnet 5（レビュー・統括レーン＋Antigravity代行）
| # | タスク | 状態 |
|---|---|---|
| O-1 | Codex納品の技術レビュー（rebaseline7／NoiseFloorColumn／term-lab物理精度） | rebaseline7・NoiseFloor分は完了。term-lab/OTAエキスパートはCodexコミット確定後 |
| O-2 | コラム移行のレビューゲート運用 | G-3開始待ち |
| O-3 | リリース統括（feature→main PR・CI緑確認・視覚ループ指揮） | 継続 |
| O-4 | E2第2段の設計＋期待値テスト定義 | ✅完了（fb825914） |
| O-5 | F1改/F3の設計レビュー | G-4未着手のため待機 |
| **O-6** | **【新規】Antigravity休止中の代行検証**: Web調査・出典裏取り・物理/lib計算の独立検算に限定 | ✅今回: A-1クローズ確認・A-3検算5点の独立再計算・E2出典URL確認。ブラウザ実機/官能評価は対象外（下表Antigravity欄に滞留） |

### GPT-5.6 / Codex（実装レーン・現行順序で直列推奨）
| # | タスク | 参照 |
|---|---|---|
| G-0 | 放射効率dB⇔%変換ツール | prompt-codex-efficiency-converter.md |
| G-0b | パッチアンテナ半値角アプリ | prompt-codex-patch-hpbw.md |
| G-1 | **term-lab完遂**（実装は21語とも作業ツリーに揃った様子。**コミット→push→視覚ループ→main**まで進めてください） | prompt-codex-term-lab.md |
| G-2 | OTAエキスパートモード。**重要: コミット時に作業ツリーの `docs/handoff/antigravity-ota-expert-verification.md`（Antigravity検算済み・未コミット）を必ず同梱してください（消失防止）** | prompt-codex-ota-expert.md |
| G-3 | コラム構造化移行の量産（残り約29本） | 手本: fresnelDeepDive.ts |
| G-3fix | `noiseFloor.ts` hook文の文字化け「地球 of 自転」→「地球の自転」修正 | review-o1-wave6-codex-deliverables.md §1 |
| G-4 | F1改＋F3実装 | f1-manifest-spike-verdict.md |
| G-5 | Band v3データ反映 | ✅**完了**（80274e4b, A-1裏取り分は反映済み） |
| G-6 | E2第2段実装（`areaCoverageFraction`等＋エキスパートモード） | prompt-codex-e2-area-coverage.md |
| 規約 | 専用worktree・パス指定add・`Tests N passed`行確認・build前にdev停止・視覚変更はrebaselineループ | roadmap §11 |

### Antigravity（**休止中・復帰後に着手** — ブラウザ実機操作/視覚官能評価が必須なもののみ残置）
| # | タスク | 状態 |
|---|---|---|
| ~~A-1~~ | Band地図v3裏取り | ✅**完了・クローズ**（Claude O-6で確認） |
| ~~A-3検算~~ | 干渉源ハンター手計算5点 | ✅**完了・クローズ**（Claude O-6で独立再確認） |
| A-2 | term-lab実機受入（21語の官能評価・375px・reduced-motion） | 復帰後（G-1コミット確定が前提） |
| A-2b | 効率変換の受入（官能評価） | 復帰後（G-0未着手） |
| A-2c | 半値角アプリの受入（3つの問いへの官能評価） | 復帰後（G-0b未着手） |
| A-3実機 | OTAエキスパート実機受入（検算は済・実機のみ残） | 復帰後（G-2コミット確定が前提） |
| A-4 | コラム出典リンク鮮度チェック | G-3開始後 |
| A-5 | rebaseline7の視覚差分の最終承認（手順はClaude確認済み・要目視） | 復帰後 |
| A-6 | E2第2段の実機受入・同心円図の体感評価（数値照合はO-4で検証済みのため実機のみ） | 復帰後（G-6未着手） |

## 3. リリース順序（推奨）
term-lab（G-1・実装ほぼ完了→コミット/push優先）→ 効率変換（G-0）・半値角アプリ（G-0b）→ OTAエキスパート（G-2、Antigravity報告同梱）→ コラム移行10本単位（G-3・G-3fix同梱）→ F1改/F3（G-4→O-5）→ E2第2段（G-6）。
**Antigravity依存タスク（A-2/A-2b/A-2c/A-3実機/A-5/A-6）は復帰まで滞留**——CodexはPRのマージ自体は技術ゲート（tsc/vitest/lint/build/e2e）緑を条件に進めてよいが、「実機官能評価済み」の最終承認ラベルはAntigravity復帰後に付与する運用とする。

## 4. 掃除メモ
残骸ブランチ: `rebaseline3`/`rebaseline7`/`r5-diagram-hex`/`ux1v-visual-loop` は役目済みなら削除可（スパイク2本は判定記録として保持）。
