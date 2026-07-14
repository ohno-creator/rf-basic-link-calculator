# レビュー報告 — G-4（F1改/F3）／G-7（周波数の用途地図）

**実施**: Claude／**日付**: 2026-07-12／**手法**: 直接レビュー（Read/Grep/Bash・自前検算・WebSearch2件でのデータ抜き取り検証。サブエージェント/Workflowは月次上限のため不使用）
**対象**: `feature/initial-rf-basic-link-calculator` の `a4763212`（G-4）／`753c2eb9`（G-7）

## 結論
両案件とも技術ゲート（tsc/vitest 672 passed・build 60ページ+spectrum-use-atlas成功）は緑。G-4は契約通りの基盤が実装済みだが**実運用ゼロ件**、G-7は5モード・9コラムとも機能するが**tools.ts未登録で製品としては未到達**という、それぞれ「動くが仕上げ半歩手前」の状態。

## G-4（F1改/F3）— P2×2

### 1. panelフィールドが1件も設定されておらず、scaffoldが実運用されていない
`prompt-codex-f1kai-f3.md` §1で指定した `ToolEntry.panel?: string` フィールドが型定義にもデータにも一切追加されていない（`grep '"panel"'` は無関係な `"icon": "panel"` 1件のみ）。`node scripts/scaffold-tool-page.mjs --check` は候補0件で例外終了する。**基盤は正しく実装されているが、既存40本超のボイラープレートページを実際にscaffold管理下へ移す作業は未着手**。
**修正案**: 型に `panel?: string` を追加し、まず正規化diff 0行が確認済みの3本（vswr-bandwidth-q/electrical-length/pointing-margin）で試験運用→問題なければ順次拡大。

### 2. --checkが候補0件で例外終了（CI導入時に即失敗する）
候補が0件のケースを異常系として例外を投げる実装（L42）になっており、CIへの導入初期（panelが少数のみ設定された段階）で `--check` が「0件だから」という理由だけで失敗しうる。
**修正案**: 候補0件は正常系として扱い、`console.log("candidates: 0")` で正常終了させる（真にレジストリと乖離がある場合のみ失敗させる）。

## G-7（周波数の用途地図）— P1×1・P2×2・P3×1

### 1. 【P1】tools.tsに未登録——製品として到達不能
`src/app/tools/spectrum-use-atlas/page.tsx` は独立ページとして正しく動作し、buildにも含まれる（15.7kB, 152kB First Load）が、`src/data/tools.ts` に対応エントリが無いため**ツール一覧（ToolDirectoryBrowser）に一切表示されない**。直接URLを知っている人以外は到達できない。antenna-term-lab・cellular-band-map等の同種クライアント型ツールは全て`basic`なしでもtools.tsへ登録されている既存慣行から外れている。
**修正案**: `{"slug":"spectrum-use-atlas","name":"周波数の用途地図（非セルラー編）","tagline":"...","icon":"radio","category":"basics"}`（basicフィールドなし）をtools.tsへ追加。

### 2. 【P2】用途カテゴリコラム9本の出典が全カテゴリ同一（MIC＋ITUの2件のみ）
発注書ではカテゴリごとに異なる一次出典（Wi-Fi=ITU RR footnote 5.150/FCC Part 15、LPWA=ARIB STD-T108、レーダー=ITU-R M.1652等）を指定したが、実装は9カテゴリ全てで同じ2件（総務省電波利用ホームページ＋ITU Radio Regulations）を使い回している。本文の技術的内容自体は妥当（読了・査読した限り誤りは無い）が、各カテゴリの主張を裏付ける個別出典としての厳密性は発注書の水準に届いていない。
**修正案**: 優先度は低いが、次段でカテゴリ別の一次出典を追加すると玄人テスト（column-guide.md §3）の「主要な主張それぞれに一次出典が紐づく」基準に近づく。

### 3. 【P2】非日本エントリの大半が個別裏取りなしで既定値 `confirmed-current` になっている
`SpectrumEntry` 生成ヘルパー `e()`（spectrumUses.ts:18）は `status` 省略時に `"confirmed-current"` を既定値とする。日本20件はunverified-current等が個別に明示されているが、米欧中印・その他地域（約52件）の多くは省略＝確認済み扱いになっている。発注書の「裏取りできないエントリは必ずunverified-current」という規律に対し、個別裏取りをしていないのに既定で確認済み扱いになる設計は本来のリスクの向きと逆。
実際に2件をWebSearchで抜き取り検証した結果:
  - `us-cbrs`（3.5GHz CBRS, 3550-3700MHz, 3層共用）: **完全一致**（FCC公式資料で確認）
  - `eu-59`（5.9GHz ITS-G5, 5875-5925MHz）: ETSI標準ではITS-G5A=5875-5905MHz・G5B=5855-5875MHzで、5875-5925という区切りは実際の規格上の帯域割りとは**やや不正確**（大枠は合っているが上限が規格値と20MHzずれている）
どちらも致命的な誤りではないが、個別裏取りをしていないデータが既定で「確認済み」表示になる設計は今後リスクが積み重なる。
**修正案**: `e()` の既定値を `"unverified-current"` に変更し、個別に裏取りできたものだけ明示的に `"confirmed-current"` を渡す方式へ反転。既存データの一括ステータス見直しはAntigravity復帰後のA-7と合わせて実施。

### 4. 【P3】バンド粒度の重複（2.4GHz ISM・70cmアマチュア・GNSS L1が8地域でほぼ同一内容）
「同じ用途でも地域で周波数が違う」を見せる狙いに対し、多くの地域でほぼ同一の帯域・説明文が並ぶ（世界的にほぼ共通なバンドのため内容としては正しいが、差分情報量は小さい）。実害はなく優先度は低い。

## テスト
上記のうち技術的に重要なのはP1（tools.ts登録）のみ。テスト追加は不要（既存のtoolsRegistry.test.tsが新規エントリを自動的に拾う設計のため、登録すれば既存テストでカバーされる）。
