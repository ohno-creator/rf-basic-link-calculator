# 第6波 実行プラン（2026-07-12 改訂v11・3者分担の正本）

**担当体制**: Claude（設計・レビュー・統括・git実行）／GPT-5.6=Codex（実装）／Antigravity（休止中・復帰待ち）

**v11時点の要約**: **第6波の主要5案件（term-lab/OTA/効率変換/半値角/エリアカバレッジ）はmainへ着地済み**。並行して別セッション（推定）が同一作業ツリーでC-1〜C-4相当を実行し、Claudeも合流してP0データ消失バグの発見・修正、G-4/G-7の実装・レビュー・修正まで完了。**feature = main の状態からG-4/G-7がfeatureに乗り、mainへの次PRを待つ段階**。

## 1. 現況（v11・確定事実）
- **main = origin/main = 9a75b9a4**（term-lab21語／OTAエキスパート／効率変換／半値角／エリアカバレッジの5案件・P1×6件修正・F1スパイクrevert・rebaseline8を経て着地済み）
- **feature = origin/feature = f8ba4771**（main+3コミット: G-4基盤／G-7本体／G-7のtools.ts登録修正）。**mainへは未統合**（視覚差分のrebaselineが必要）
- ✅**P0発見・修正**: track/term-lab初期コミットに、不採用F1スパイク実験の未コミット削除が混入し `vswr-bandwidth-q`/`electrical-length`/`pointing-margin` の3ページが履歴上ずっと欠落していた。origin/feature基準で復元・コミット（`e1a8e316`）・build確認済み
- ✅レビュー完了（Claude単独実行・サブエージェント不使用）: `review-g4-g7.md`
  - G-4（F1改/F3）: 契約通りの基盤実装済みだが**panelフィールドが1件も未設定で実運用ゼロ**（P2）。`--check`が候補0件で例外終了する粗さ（P2）
  - G-7（周波数用途地図）: **P1修正済み**（tools.ts未登録→登録し到達可能化）。残課題: コラム9本の出典が全カテゴリ同一（P2）、非日本52件が既定`confirmed-current`で個別裏取りなし（P2・WebSearch2件抜き取りではCBRS完全一致／ITS-G5はやや不正確）、バンド重複（P3）
- 技術ゲート: `npx tsc --noEmit`緑／`vitest run`＝**672 tests passed (74 files)**／`GITHUB_PAGES=true next build`＝**63ページ成功**（spectrum-use-atlas含む）
- **Claudeのサブエージェント（Agent/Workflow）は月次上限のまま**。以降も単独実行を継続

## 2. 分担表（v11）

### Claude（統括・レビュー・git実行）
| # | タスク | 状態 |
|---|---|---|
| 済 | C-1〜C-4相当（コミット分離・P1修正反映・rebaseline8・main統合） | ✅完了（別セッションと合流して実施） |
| 済 | P0データ消失バグの発見・修正 | ✅完了（e1a8e316） |
| 済 | G-4/G-7の直接レビュー＋G-7のP1修正 | ✅完了（review-g4-g7.md、f8ba4771） |
| **C-6** | **G-7 P2修正**: `e()`ヘルパーの既定ステータスを`unverified-current`へ反転し、個別裏取り済みのみ`confirmed-current`を明示 | 次点（優先度中） |
| **C-7** | **G-4 P2修正の確認**: Codexが`--check`の0件例外終了を直せば検収 | Codex対応待ち |
| C-5 | **G-3文献パック直接執筆**（第1弾10本） | 着手（本ターンより開始） |
| **C-8** | **feature→mainのPR＋rebaseline9指揮**（G-4/G-7分の視覚差分） | C-5と並行可 |
| A-7先取り | 周波数用途地図の一次情報裏取り（O-7相当・Antigravity休止中の代行） | C-6と合わせて実施可 |

### GPT-5.6 / Codex
| # | タスク | 参照 |
|---|---|---|
| X-5 | G-4: `--check`候補0件を正常系扱いへ修正。ToolEntryへの`panel`フィールド追加は次段の別作業として着手可否をユーザー/Claudeと相談 | review-g4-g7.md |
| X-6 | G-7: コラム9本への個別出典追加（優先度低） | review-g4-g7.md |
| 済 | G-0/G-0b/G-1/G-2/G-6/G-4/G-7実装・P1修正 ✅ | — |

### Antigravity（休止中）
| # | タスク | 前提 |
|---|---|---|
| A-2群/A-3実機/A-6 | term-lab/OTA/効率変換/半値角/エリアカバレッジの実機受入 | main反映済みにつき復帰後即着手可 |
| A-5 | rebaseline8の視覚差分の目視承認 | 復帰後即 |
| A-7 | spectrum-use-atlasの実機受入＋C-6と独立の追加裏取り | C-8後 |
| A-8 | C-5文献パックの出典鮮度の二重確認 | C-5進行に応じ |

## 3. 実行順序（v11）
```
【完了】main = 5案件+P1修正+rebaseline8
feature = main + G-4基盤 + G-7本体 + G-7 P1修正（f8ba4771）
 ├→ C-6 G-7 P2修正（ステータス既定値反転）
 ├→ C-5 G-3文献パック執筆 → X-?（次段でCodex量産）
 └→ C-8 rebaseline9 → feature→main PR
```

## 4. リスクと手当（継続）
- 複数主体が同一working treeを操作する状況が実際に発生した。以後、git操作前に必ず `git status -sb` で予期しない変化がないか確認し、ブランチが想定外に変わっていたら操作を停止して調査する運用を継続
- G-7のP0データ消失事故を教訓に、**新規ブランチの初回コミット後は必ず `git diff --diff-filter=D --stat <base>...HEAD` で意図しない削除がないか確認**する手順をランブックへ今後追記
