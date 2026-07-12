# 第6波 実行プラン（2026-07-12 改訂v4・3者分担の正本）

**担当体制**: Claude Sonnet 5（設計・レビュー・リリース統括）／GPT-5.6=Codex（実装量産）／Antigravity（実機検証・文献・裏取り）

## 1. 現況（確定事実）
- main = e6f7cb1d（56ツール・CI緑・Pages配信済み）
- 完了: 第2〜5波の全成果／rebaseline7（Band地図v3の視覚基準線・手順確認済み）／**コラム構造化移行の1本目（NoiseFloorColumn・レビュー済み＝軽微な文言化け1件のみ要修正）**
- 進行中: **term-lab（アンテナ用語ラボ21語）** — Codexがtrack/term-labで実装中（確定6語＋作業ツリーに追加分。発注書: prompt-codex-term-lab.md）
- 進行中（未コミット確認のみ）: **OTAエキスパートモード**のlib（harmonicHunter.ts等）とAntigravity検算報告が作業ツリーに存在（発注書: prompt-codex-ota-expert.md）
- 判定済み設計: **F1改**=手書きmanifestルートは不採用→レジストリからのページ雛形コード生成＋F3スモーク自動生成を採用（判定: f1-manifest-spike-verdict.md）
- **新規**: **E2第2段（エリアカバレッジ・Jakes近似）の設計完了**——自己導出した閉形式を数値積分で検証済み、実装発注書を作成（prompt-codex-e2-area-coverage.md）
- 未完の検証: Band地図v3データの一次情報裏取り（`unverified-current` 4件含む・発注書: prompt-wave5-codex-antigravity.md A-1）

## 2. 分担表（優先度順）

### Claude Sonnet 5（レビュー・統括レーン）
| # | タスク | 状態 |
|---|---|---|
| O-1 | **Codex納品の技術レビュー**: rebaseline7／NoiseFloorColumn移行／term-lab物理正確性 | ✅rebaseline7・NoiseFloorColumn分は完了（review-o1-wave6-codex-deliverables.md）。term-lab/OTAエキスパートはCodex確定コミット後に実施 |
| O-2 | **コラム移行のレビューゲート運用**（1本1コミットごとに column-guide §3 チェックリストでレビュー） | G-3開始待ち（NoiseFloorColumn分はO-1で実施済み） |
| O-3 | **リリース統括**: 各波のfeature→main PR作成・CI緑確認・マージ・視覚ループ指揮 | 継続（次回はterm-lab/G-0/G-0b確定後） |
| O-4 | E2第2段（エリアカバレッジ・Jakes近似）の設計＋期待値テスト定義→Codexへ実装発注 | ✅完了（prompt-codex-e2-area-coverage.md・自己導出式を数値積分で検証済み） |
| O-5 | F1改/F3の設計レビュー（Codex実装後のscaffold出力とスモーク生成の検収） | Codex未着手（G-4待ち） |

### GPT-5.6 / Codex（実装レーン・現行順序で直列推奨）
| # | タスク | 参照 |
|---|---|---|
| G-0 | **放射効率dB⇔%変換ツール**（小粒・実務目安表＋Wheelerキャップコラム。先行実施可） | prompt-codex-efficiency-converter.md |
| G-0b | **パッチアンテナ半値角アプリ**（とは何か/なぜ重要/どう使うの3部・カバレッジ円体感・「65°に収斂する理由」コラム） | prompt-codex-patch-hpbw.md |
| G-1 | **term-lab完遂**（21語＋シェル＋e2e＋tools.ts結線＋視覚ループ→main） | prompt-codex-term-lab.md |
| G-2 | **OTAエキスパートモード**（干渉源ハンター・要求値合否・距離換算・Excel連携） | prompt-codex-ota-expert.md |
| G-3 | **コラム構造化移行の量産**（残り約29本・1本=1コミット・**D2として quant ブロックをlib関数compute()で同時付与**・既存e2e文字列互換を都度確認）。**移行時にNoiseFloorColumn同様の文字化け混入がないか自己チェック** | 手本: fresnelDeepDive.ts / NoiseFloorColumn移行コミット |
| G-3fix | **軽微修正**: `src/data/columns/noiseFloor.ts` の hook文中「地球 of 自転」→「地球の自転」（移行時のテキスト破損）。G-3の最初のコミットに含めてよい | review-o1-wave6-codex-deliverables.md §1 |
| G-4 | **F1改＋F3実装**: `scripts/scaffold-tool-page.mjs`（tools.tsから個別page.tsx生成）＋レジストリ走査のe2eスモーク自動生成（手書きシナリオと分離） | f1-manifest-spike-verdict.md |
| G-5 | Antigravity裏取り結果のデータ反映（Band v3・随時） | A-1報告書 |
| G-6 | **【新規】E2第2段実装**: `areaCoverageFraction`/`standardNormalCdf`＋shadowing-marginツールへのエキスパートモード（n選択・エリアカバレッジ表・同心円ディスク図） | prompt-codex-e2-area-coverage.md |
| 規約 | 専用worktree・パス指定add・`Tests N passed`行確認・build前にdev停止・視覚変更はrebaselineループ | roadmap §11 |

### Antigravity（検証・文献レーン・並行可）
| # | タスク | 報告先 |
|---|---|---|
| A-1 | **Band地図v3の全数裏取り**（最優先・unverified 4件→確定。日本4社IoT提供状況・米欧中韓印の各キャリアBand/UL/DL/IoT展開を一次情報で） | antigravity-band-v3-verification.md |
| A-2 | **term-lab実機受入**（21語の体感が本質を突くかの官能評価・モバイル375px・reduced-motion・進捗保存） | antigravity-term-lab-report.md |
| A-2b | 放射効率変換の受入（変換値の手計算照合・目安表の妥当性官能評価） | antigravity-term-lab-report.md 併記可 |
| A-2c | 半値角アプリの受入（3つの問いに答えているかの官能評価・カバレッジ円等の手計算5点照合） | 同上 |
| A-3 | **OTAエキスパート受入＋検算**（干渉源ハンター: 任意クロック×次数の手計算照合5件・貼り付けインポートの異常系） | antigravity-ota-expert-report.md |
| A-4 | 移行済みコラムの出典リンク鮮度チェック（D8定期運用・移行10本ごと） | antigravity-source-audit.md 追記 |
| A-5 | 各rebaselineの視覚差分承認（rebaseline7分含む） | 各報告書 |
| A-6 | **【新規】E2第2段の受入**: prompt-codex-e2-area-coverage.md記載の7点（都市/郊外/開放×各エッジ信頼率）の照合＋同心円ディスク図の「エッジ50%でも面積75%」体感評価 | antigravity-e2-area-coverage-report.md |

## 3. リリース順序（推奨）
効率変換（G-0）・半値角アプリ（G-0b）・term-lab（G-1）を先行（→A-2群→O-3）→ OTAエキスパート（G-2→A-3）→ コラム移行は10本単位でまとめてmain（G-3・最初のコミットにG-3fix同梱）→ F1改/F3（G-4→O-5）→ **E2第2段（G-6→A-6）**。
Band v3裏取り（A-1→G-5）は上記と独立に随時反映。

## 4. 掃除メモ
残骸ブランチ: `rebaseline3`/`rebaseline7`/`r5-diagram-hex`/`ux1v-visual-loop` は役目済みなら削除可（スパイク2本 `h6-3d-spike`/`f1-manifest-spike` は判定記録として**保持**）。
