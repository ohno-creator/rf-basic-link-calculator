# 第6波 実行プラン（2026-07-12 改訂v10・3者分担の正本）

**担当体制**: Claude（設計・レビュー・統括・**git操作の実行者**）／GPT-5.6=Codex（実装——**git add/commit/push/ブランチ切替は行わない**規約が判明・v10で役割を再定義）／Antigravity（リミット到達につき休止中・復帰待ち）

**v10の前提変化（Codex申し送りより）**:
1. **Codexはgit操作をしない** → 5案件（G-0/G-0b/G-1/G-2/G-6）の成果が track/term-lab に**全て未コミットで混在**。コミット分離はClaudeが実行する（正本: `runbook-wave6-commit-separation.md`）
2. **Codexはブランチ切替をしない** → feature上のレビュー報告3本がCodexから**見えていなかった**（P1未修正の理由）。分離コミット後にfeatureをマージしてツリー内へ文書を届ける
3. **track/term-labに不採用F1スパイク（0c5aa81e）が混入**（[slug]ルート残存・個別ページ3本削除状態）→ 統合前にrevert必須（ランブック Commit 7）
4. **Codex環境ではPlaywright実行不能**（MachPort/EMFILE）→ e2e実行はClaude環境またはCIで代行
5. **Claudeのサブエージェント発行も月次上限に到達**（G-3文献パック用Workflowが全滅）→ 以降ClaudeはWorkflow/Agentを使わず単独実行。G-3草稿は1〜2本/ターンで直接執筆する方式に変更

## 1. 現況（v10時点の確定事実）
- main = e6f7cb1d（56ツール・CI緑）／feature = e7e46310（main+ドキュメントのみ）／track/term-lab = 694de8d6＋未コミット差分約50ファイル
- **実装は5本柱すべて完成域**（term-lab21語／OTAエキスパート／効率変換／半値角／エリアカバレッジ）。技術ゲート緑をClaude直接確認済み: vitest **661 passed**・tsc緑・eslint緑・build 62ページ成功。**Playwright（追加e2e5本強）のみ未実行**
- **レビュー完了・P1×6件が未修正のまま残存**をClaude再確認済み（εr=1.0握りつぶし／保存則表示矛盾／fspl404／VSWR定在波式／インポートparser無言欠落／offset非クランプ）
- G-3量産は**未着手が正当**（Codex指摘の通り、草稿・文献パックの用意はClaude/Antigravity側工程。Codexが本文と出典を発明するのは工程違反）——v10でClaude直接執筆に切替
- G-4はスパイク判定済み・実装契約を発注（`prompt-codex-f1kai-f3.md`・新規）
- G-7（周波数用途地図）は未着手（発注書は完備・アクションプラン数値2ソース照合済み）

## 2. 分担表（v10・実行順の正本）

### Claude（統括・レビュー・git実行・Antigravity代行）
| # | タスク | 状態 |
|---|---|---|
| **C-1** | **コミット分離の実行**（ランブック§1: Commit1〜6＝案件別、Commit7＝スパイクrevert。git clean絶対禁止） | **次のアクション（ユーザーGOで着手）** |
| **C-2** | featureをtrack/term-labへマージ（レビュー文書をCodexの視界に入れる） | C-1後 |
| **C-3** | P1修正のコミット（Codexの編集を案件別に確定）＋Playwright実行（自環境。不能ならCIで） | C-2＋Codex修正後 |
| **C-4** | push→feature統合→**rebaseline8（5案件一括・1回）**→feature→main PR | C-3後 |
| **C-5** | **G-3文献パック直接執筆**: 第1弾10本（hata/fspl/vswr/dbm-converter/db-family/coax-cable-loss/desense/eirp-compliance/lora-airtime/ground-plane-size）のToolColumn草稿＋出典locator。1〜2本/ターンで積み上げ、旧TSXは削除方針（NoiseFloor前例踏襲）・quantは既存lib関数のみ | 開始待ち（C-1〜C-4優先） |
| 済 | O-1/O-1b/O-1c（3本のレビュー報告）✅／O-4（E2設計）✅／O-6（技術ゲート確認）✅／**G-4実装契約の確定**✅（prompt-codex-f1kai-f3.md） | — |

### GPT-5.6 / Codex（実装のみ・gitはClaudeが代行）
| # | タスク | 参照 |
|---|---|---|
| **X-1** | **P1×6件の修正**（ファイル編集のみ。C-2完了後にツリー内で `docs/handoff/review-o1-term-lab-ota-expert.md`＋`review-g0-g0b-efficiency-patch-hpbw.md` を読むこと）。あわせてP2軽微3件（icon"compass"→iconMap登録or既存icon変更／効率変換の関連リンク配線／aria-pressed）推奨 | 両レビュー報告 |
| X-2 | G-7: 周波数の用途地図（非セルラー編） | prompt-codex-spectrum-atlas.md |
| X-3 | G-3量産: **C-5の文献パック到着後**、草稿→ToolColumnデータ化＋パネル結線（1本ずつ・発明禁止は従来通り） | column-guide.md＋C-5成果物 |
| X-4 | F1改＋F3実装 | **prompt-codex-f1kai-f3.md（v10で契約確定）** |
| 済 | G-0/G-0b/G-1/G-2/G-6実装＋G-3fix ✅ | — |

### Antigravity（休止中・復帰後）
| # | タスク | 前提 |
|---|---|---|
| A-2/A-2b/A-2c | term-lab／効率変換／半値角の実機受入（モバイル375px・reduced-motion含む） | C-4後 |
| A-3実機 | OTAエキスパート実機受入（検算5点は照合済み） | C-4後 |
| A-5 | rebaseline7＋rebaseline8の視覚差分の目視承認 | 復帰後即 |
| A-6 | エリアカバレッジ実機受入（数値7点検証済み・同心円図の体感のみ） | C-4後 |
| A-7 | 周波数用途地図の実機受入＋裏取り | X-2後 |
| A-8 | 【新規】C-5文献パックの出典リンク実在・鮮度の最終確認（ClaudeのWebSearch確認を二重化） | C-5進行に応じ |

## 3. 実行順序（v10・依存関係順）
```
C-1 コミット分離（6+1コミット）
 └→ C-2 featureマージ（レビュー文書をツリーへ）
     └→ X-1 P1修正（Codex編集）→ C-3 修正コミット＋Playwright
         └→ C-4 push→feature→rebaseline8（一括）→main PR
             ├→ X-2 G-7着手（並行可）
             ├→ C-5 G-3文献パック執筆（並行可）→ X-3 量産
             └→ X-4 F1改/F3（契約確定済み・着手可）
```
rebaselineは**案件別ではなく統合後に一括1回**（確立運用: 並列・分割はPNGバイナリ競合を生む）。

## 4. リスクと手当
- **未コミット差分の消失**: git clean/stash禁止を全文書に明記済み。C-1完了までツリーに触るのはコミット分離作業のみ
- **スパイクrevert漏れ**: C-1のCommit 7で必ず実施。確認方法=buildで `/tools/[slug]` が消え `/tools/vswr-bandwidth-q` 等が個別ルートに戻ること
- **e2e未実行のままmain到達**: C-3でブロック（Playwright緑またはCI緑を統合条件にする）
- **エージェント上限**: Claude単独実行に切替済み（本プランの全C項はサブエージェント不要で遂行可能）
