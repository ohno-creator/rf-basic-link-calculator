# デザインベース v4 — 「リッチで、プロフェッショナルで、わかりやすい」追補

**位置づけ**: [design-base-v3.md](./design-base-v3.md)（計測器の精度、教科書の親しみ）の**上に重ねる追補**。v3の3原則（数値が主役／視線は1方向／色は意味）とトークンは維持し、**質感（リッチさ）と信頼感（プロフェッショナル）を面・文字・図の3層で足す**。破壊的リブランドではない。

**根拠**: 5視点並列診断（landing/surfaces/typography/toolpage/dataviz）41提案を設計リードが裁定。トップ企業のセオリー（Stripe=CTAだけ彩度解禁・Linear=Inter一本とduotoneタイル・Vercel=欧文のみ配信・Tufte=直接ラベリング・JIS製図=寸法線）を適用先つきで採用。

---

## 1. v4で新しく許可・規定するもの

| # | 規定 | 内容 |
|---|---|---|
| v4-1 | **自己ホストWebフォント** | 欧文数字=Inter／和文=Noto Sans JP 400/500/700（next/font・実行時外部読込ゼロ）。tailwind `font-sans` が単一ソース。 |
| v4-2 | **ブランド面（10%）はCTAパネルだけ** | `bg-gradient-to-br from-staf to-staf-dark`＋radialハイライト白14%＋白文字。**1ページ1回・ページ末CTAのみ**。判定連動CTA等は現行 staf-light を維持（深色面の乱用禁止）。 |
| v4-3 | **意味のあるモチーフのみ背景可** | v3 §3.2「装飾背景禁止」の例外を明文化: 主題を語る線画（FSPLカーブ・フレネル楕円・計測方眼）に限り、極薄（不透明度≤8%・staf/slate系・aria-hidden・print:hidden・lg以上）で敷いてよい。イラスト・写真・無意味な図形は引き続き禁止。 |
| v4-4 | **カード面の2.5D化** | Card白面に「トップハイライト」（上辺1px内側の白高光 or `bg-gradient-to-b from-white to-slate-50/40`）を標準装備してよい。影は既存2層（card/soft）のまま。 |
| v4-5 | **図版はChartFrame（figure化）** | 図は `figure > (タイトル行＋actions) + 図 + figcaption(条件・出典)` の統一フレームに収める。エクスポート(H7)ボタンはこの actions スロットに置く。 |
| v4-6 | **図中の直接ラベリング** | 結論数値（リンクマージン等）は図の外でなく**図中に寸法線・ブラケットで焼き付ける**（JIS寸法線／Tufte直接ラベリング）。色は判定連動（seriesText.gain/loss）。 |
| v4-7 | **信頼要素の常設** | ヒーロー直下にトラストストリップ（運営社名＋プルーフ3点・1行）、フッターに会社情報/所在地/リンク列。リード獲得サイトとして運営者の実在を最上部から明示。 |
| v4-8 | **アイコンタイルの2トーン** | `bg-gradient-to-br from-staf/15 to-staf/5 ring-1 ring-inset ring-staf/15`＋lucide `strokeWidth={1.75}`。色相はstaf系に限定（60-30-10維持）。 |

**引き続き禁止**: 外部リソースの実行時読込／意味のない色面／shadow-md·lg·xl／3種を超えるフォント／アニメーション過多（reduced-motion尊重）。

---

## 2. 実装ウェーブ（Track R）

| Wave | 内容（診断提案の裁定結果） | 状態 |
|---|---|---|
| **R1 タイポ基盤** | v4-1 フォント導入（Inter＋Noto Sans JP・woff2自己ホスト131スライス） | ✅ 統合済（2026-07-05） |
| **R2 ホーム/信頼/CTA** | トラストストリップ／CTAブランド面（v4-2）／フッター強化／アイコンタイル2トーン＋ツール名タイポ是正／初心者カード角丸是正／ヒーロー計測方眼（v4-3） | ✅ 統合済 |
| **R3 ツールページ主役化** | essenceLead「わかること」行／ResultBar主役化／Stat=Metric仕様／Card 2.5D（v4-4）／同カテゴリ回遊 | ✅ 統合済（警告集約・パンくずはR5へ） |
| **R4 図版レポート品質** | **エクスポート忠実度バグ根治**（属性化＋computed style焼き込み）／旗艦・NCU滝のマージン寸法ブラケット（v4-6）／保存ボタンをNCU滝・断面へ横展開 | ✅ 統合済（ChartFrame/凡例定型はR5へ） |
| **R5 磨き（低優先）** | ChartFrame＋凡例/軸タイトル定型／ブランドロックアップ／sticky filter／ToolTwoPane部品化／負号U+2212／警告のResultBar集約／パンくず | 任意 |
| **R5b 図版hex掃除** | 残SVG図版のdiagramPalette同値置換 | 🔄 Antigravityが track/r5-diagram-hex（agy worktree）で実施中 |

**運用**: 各Waveは trackブランチ→全ゲート→CI視覚ループ（push→スナップショット自動更新→revert→統合）。**直列に統合**（R1統合後にR2着手…）でスナップショット競合を避ける。

**不採用/保留の主な裁定**: 深色面の複数配置（乱用でCTAが埋没）／カテゴリ別色相分け（色は意味の原則に反する）／和文ロゴタイプの新規制作（ブランド資産はユーザー確認要）。

---

## 3. 受け入れ基準（v4追加分・grep可能）

- フォント: `font-sans` が var(--font-inter) 起点であること。`next/font` 以外のフォント読込 0。
- ブランド面: `from-staf to-staf-dark` の出現はページ末CTAコンポーネントのみ（grep で1コンポーネント）。
- 背景モチーフ: 不透明度>8%・print非表示漏れ・aria-hidden漏れ 0。
- 図版: 主要図が ChartFrame 配下（figure/figcaption）であること。書き出したSVGが単体で画面と同じ見た目（Tailwindクラス依存の `<text>` 0）。
- 既存: AA・44px・fold予算e2e・reduced-motion・印刷CSS・150KB予算をすべて維持。
