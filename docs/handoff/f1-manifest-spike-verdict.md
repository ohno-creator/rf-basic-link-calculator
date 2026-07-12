# F1 manifest駆動スパイク判定（track/f1-manifest-spike）

**実施**: Claude 2026-07-12／**判定**: ❌ **単一動的ルート方式は不採用**（代替案を採用推奨）

## 検証したこと
基本ツールの個別 `page.tsx` は正規化diff 0行の完全同一ボイラープレート（56ツール中40本超）。
これを `src/app/tools/[slug]/page.tsx`（generateStaticParams＋panelRegistry）へ集約できるか、`output: "export"` 前提で3ツール（vswr-bandwidth-q / electrical-length / pointing-margin）を移行して実測した。

## 実測結果
| 観点 | 結果 |
|---|---|
| 静的書き出し | ✅ ●SSGで3ルートとも `out/tools/<slug>/index.html` 生成 |
| メタデータ | ✅ title / canonical / OG が個別ページと同一に出力 |
| tsc / build | ✅ 全緑（旧.next型キャッシュの誤検知はビルド再生成で解消） |
| **バンドル** | ❌ First Load 152kB→**171kB**（+19kB/3本）。静的importマップ版・next/dynamic版とも同じ |
| チャンク分析 | ❌ pointing-marginパネルが `[slug]/page-*.js` に同梱・3ページのscript参照集合が完全同一＝**ルート単位で全パネルを共有バンドル化**し、パラメータ別のコード分割は行われない |

## 結論
App Router の動的ルートは「1ルート=1バンドル」で、静的書き出しではパラメータ別分割が効かない。
40本を集約すると全ツールページのFirst Loadが数百kB級に肥大するため、**実行時manifest方式は不採用**。

## 採用推奨の代替（F1改）
ボイラープレート削減の目的は**コード生成**で達成する:
1. `scripts/scaffold-tool-page.mjs`（新設・小物）: tools.ts のエントリから `src/app/tools/<slug>/page.tsx` を生成（テンプレは本スパイクで確認済みの完全同一形）。新ツール追加時に1コマンド。
2. F3と接続: 同じレジストリ走査で e2e スモーク（描画＋primary-result存在）を自動生成し、手書きシナリオと分離。
→ 実行時コスト0・チャンク分割は現状のページ単位を維持・「レジストリが単一の真実」という F1 の狙いは開発時ツールで満たす。

## 後始末
スパイクは本ブランチに封止（feature未マージ）。個別ページ3本はfeature側で健在（本ブランチ上でのみ削除）。
