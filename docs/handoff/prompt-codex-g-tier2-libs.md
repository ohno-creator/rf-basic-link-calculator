# Codex 発注 — G Tier2 非[DATA] lib 5本（テスト先行）

**目的**: Track G Tier2 のうち文献パック不要（閉形式）の5ツールの **lib＋期待値テストのみ** を実装する。UIパネルは後工程（Claudeのアップグレード便）が担当するため作らない。

**ブランチ**: `track/g2nd-libs`（origin/feature から作成）。**メインworktreeは使用中のため、必ず自分のworktree（rf-codex等）で作業**。

## 対象（仕様の正本: docs/new-tools-proposal.md の各節）
| ID | lib ファイル | 中核式（proposalの節を精読） |
|---|---|---|
| G1 | `src/lib/rf/ifaDimensions.ts` | 逆F/IFA初期寸法（λ/4短縮・板厚/幅補正の一次式。proposal §G1） |
| G7 | `src/lib/rf/lMatch.ts` | L型整合（Q=√(Rh/Rl−1)、L/C値の閉形式。§G7） |
| G11 | `src/lib/rf/antennaIsolation.ts` | 2アンテナ間結合の目安（自由空間+平行/直交係数。§G11） |
| G19 | `src/lib/rf/batteryLife.ts` | 電池寿命（容量mAh÷平均電流。送信duty×TX電流+スリープ。§G19） |
| G20 | `src/lib/rf/gnssCn0.ts` | GNSS C/N0バジェット（受信電力−雑音密度−NF。§G20） |

## 実装規約（AGENTS.md準拠・逸脱はマージ不可）
1. **テスト先行**: `src/tests/<name>.test.ts` に期待値を先にコミット→lib実装のコミット順。
2. 入力検証は `src/lib/rf/errors.ts` の assert語彙（assertFinite/assertPositiveFinite等）＋RfErrorCode。日本語throw禁止。
3. dB/線形・単位（mm/MHz/mAh/dBHz等）をJSDocに明記。近似式は出典（proposalに記載の式・一般教科書）をコメントで。
4. -0を返さない（`x === 0 ? 0 : x` パターン）。極端値・境界のテストを含める。
5. 共有ファイル（tools.ts・e2e・既存lib）は変更しない。新規2ファイル×5のみ。
6. ゲート: `npx tsc --noEmit`／`npm run test`／`npm run lint` 全緑でpush。push後にPR作成（feature向け）。

## 完了条件
5 lib × (テスト＋実装) がゲート緑でPR。1ツール=1コミット単位（test→impl の2コミット可）。
