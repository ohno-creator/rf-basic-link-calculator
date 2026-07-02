# RF Basic Link Calculator 統合改善ロードマップ v2

**ステータス**: 計画（本書によるコード変更なし）。
**読者**: 実装を分担する AI エージェント（Claude Opus / GPT系=Codex / Antigravity）と人間のレビュアー。
**正本の関係**: UX大改修の詳細仕様は [docs/ui-redesign-plan.md](./ui-redesign-plan.md) が正。本書は全トラックの統合・順序・分担を定める。
**共通規約**: `AGENTS.md`（Git規則・RF計算規則・P0-P3/確度）に従う。計算ロジック変更は必ずテスト先行。

---

## 0. 全体像

```
完了済み ──────────────────────────────────────────────
  P0 残存バグ完済＋e2e CIゲート / P1 横断基盤（エラーコード化・NumberField統一・FSPL床）
  P2-1 逆向き結合解消＋ESLint境界 / P2-2 レジストリ単一ソース化 / P2-3(1/3) NCU分割

残トラック ────────────────────────────────────────────
  Track A  品質残件（監査で確定済みのP3群＋テスト強度）        … 小粒・独立・並行可
  Track B  アーキテクチャ残件（ValidationErrorsコード化 ほか）  … 中粒
  Track C  UX大改修（UX-0〜UX-4）= ui-redesign-plan.md         … 本丸。旧2-3残り(Antenna/LinkBudget分割)を吸収
  Track D  コラム高度化（玄人が感心するレベル）                 … コンテンツ＋軽い実装
  Track E  RF理論拡張・新ツール6本                             … lib先行・テスト駆動
  Track F  プラットフォーム化（manifest駆動・単位ブランド型）    … 最後
  Track G  新規基礎ツール20本（事業直結） = new-tools-proposal.md … E完了を待たずTier順に並行可
```

**推奨ウェーブ**（並行実行の束）:

| ウェーブ | 並行タスク（→担当） |
|---|---|
| W1 | UX-0 計測基盤（→Antigravity）／UX-1 UI Kit v2（→Claude）／Track A 一括（→Codex） |
| W2 | UX-2 22ツール移行（→Codex）／B1（→Claude）／D パイロット3本（→Antigravity調査+Claude執筆） |
| W3 | UX-3 大型3ツール（→Claude）／E1-E3 lib＋テスト（→Claude設計・Codex実装）／UX-4 掃討（→Codex）／**G Tier1 8本**（→Claude lib・Codexパネル） |
| W4 | E4-E6／D 全展開（→Codex統合）／**G Tier2-3**（[DATA]は文献パック先行→Antigravity）／F1-F3（→Claude設計・Codex実装） |

---

## 1. 完了済み（参照情報・変更禁止領域の明示）

| 完了項目 | コミット | 備考 |
|---|---|---|
| RISミラー極限クランプ／namiGate非有限ガード／ヒートマップ座標／error.tsx／e2e修復 | `c385221` | |
| e2e を deploy 前 CI ゲート化（Playwrightキャッシュ付き） | `c03d18c` | **CI構成は Track F まで変更禁止** |
| テスト補充・HataのFSPL床・研究距離入力ドラフト化＋バナー | `09b81ef` | |
| lib層エラーコード化（B群10＋A群 antenna/vswr＋C群 judgement）＋ `rfErrorMessages.ts` | `5d3d0f4`, `f8bea0c` | lib/rf に日本語throwゼロ |
| NumberField/NumberInput 統一（emptyBehavior: preserve/invalid） | `dcf2e76` | **preserve/invalid の二挙動は仕様。壊さない** |
| 逆向き結合解消＋ESLint境界（`@/app/tools/*/components/*` 外部import禁止） | `aaa81ef` | |
| レジストリ単一ソース化（`src/data/tools.ts`、旧2ファイルは派生） | `8b6c5eb` | **ツール追加は tools.ts のみ編集** |
| NCUクライアント分割（2392→956行＋5ファイル） | `c446439` | |

**維持すべき優良実装**（改修時に壊すと差し戻し）: ResultHero sticky／StickyResultSummary の IntersectionObserver退避／滝グラフ→入力ジャンプ／NumberInputドラフト方式／`LEVEL_TO_TONE`／chartTheme seriesText（軸AA）／ヒートマップのキーボード操作・数値テーブル／skip link・reduced-motion・印刷CSS。

---

## 2. Track A: 品質残件（全て監査で確定済み・P3中心・互いに独立）

> 担当想定: **Codex**（機械的・小粒）。各項目 1PR。テスト先行（`src/tests/*` に期待値を先に追加）。

| ID | 内容 | 対象 | 修正方針 | テスト |
|---|---|---|---|---|
| A1 | VSWRの入力境界非一貫: `returnLoss=0`→Γ=1受理（∞表示）だが `reflection=1` は拒否 | `src/lib/rf/vswr.ts` | **【決定】Γ=1 も受理**し、VSWR/ML は既存どおり `Number.POSITIVE_INFINITY` を返す（`convertVswr` の分岐 `value >= 1`→`value > 1` に変更）。∞表示は `VswrConverterPanel` の `formatInfinite` が既対応のためUI変更なし | RL=0 と Γ=1 が同一結果を返す対称性テスト＋Γ=1.0001 は throw |
| A2 | coax補間: 測定点昇順の未検証＋√f外挿の無制限 | `src/lib/rf/coax.ts:44-73` | **【決定】throwせず入口で昇順ソート**（`[...points].sort((a,b)=>a.freqMHz-b.freqMHz)`）。外挿は最終点の2倍周波数で頭打ち。`CableLossResult` に `extrapolated: boolean` を追加し、`CoaxCableLossPanel` で true 時に caution 注記「測定範囲外のため√f外挿（上限あり）」 | 逆順配列＝ソート後と同値／24GHz入力が16GHz(=8GHz×2)値と等しい／範囲内で extrapolated=false |
| A3a | フレネルLOS高: 地球曲率(k=4/3)未考慮（10km中点で約2.9m過大） | `src/lib/rf/fresnel.ts:136` | **【決定】既定は従来動作（後方互換・既存テスト非破壊）**。`analyzeObstacle` に省略可能引数 `options?: { earthCurvatureK?: number }` を追加し、指定時のみ `curvatureDropM = d1M*d2M/(2*k*6371000)` をLOS高から控除。UI表出は E6（長距離モードのトグル）で行う。**A3a単体ではlibのみ変更しUIは触らない** | 未指定＝従来値と同一／k=4/3・10km中点で降下2.94m／1kmで<3cm |
| A3b | knife-edge: NaN入力がサイレントに0dB（=クリア扱い） | `src/lib/rf/fresnel.ts:74` | `RfErrorCode.NonFinite` を投げる（analyzeObstacle経由は既ガードで影響なし） | NaN→throw |
| A4 | microstrip: `miterCutbackMm` の負値/100%超を未検証＋u=1の約0.4%不連続が未記載 | `src/lib/rf/microstrip.ts:117-120,52-55` | miterPercent を [0,100] で assert。u=1不連続は既知性質としてコメント明記のみ | 負値throw・境界値 |
| A5 | Hata FSPL床: 極端開放地(f=1500,hb=200,hm=10,open)では適用範囲内でも床が効くが `outOfRange` が立たない | `src/lib/rf/propagation.ts` | `PropagationResult` に `flooredByFspl: boolean` を追加（既存フィールドは不変＝追加のみで消費者非破壊）。**消費者の確認先**: `propagationLossModels.ts`（透過のみ・変更不要）／`PropagationExplorer`・`PropagationModelComparisonChart`（true時に caution 1行「経験式が自由空間損失を下回ったため下限値を表示」を追加）。確認コマンド: `grep -rn "calculatePropagationLoss\|PropagationResult" src` | 床bind条件で true／通常市街地(hb30/hm1.5/1km)で false |
| A6 | RIS: 鏡面クランプ発動時のUI警告がない＋`twoHopLossUpperBoundDb` の命名がクランプ域で不正確 | `src/lib/rf/antenna.ts`、`AntennaToolPanel` reflectorビュー | 戻り値に `clampedToMirrorLimit: boolean` を追加、発動時のみ caution 表示「大開口・近距離のため鏡面反射の下限で評価」 | 2m×2m/30mで true |
| A7 | テスト強度: chartData「ケーブル2dB削減」ラベルと実挙動(min(2,cableLoss)=1dB)の乖離検出不可／formatMeters 0.999境界／presets.tsテストゼロ／NCU反映ボタン冪等性の統合テスト | `src/tests/*` | ラベル整合はデルタ等価アサート（+3/+1/+3/+9.03/+10）。冪等性は「2回適用で推奨≈0」 | 追加のみ（実装バグが出たら別PR） |
| A8 | 研究距離: 周波数`0.`打鍵中のバナー一瞬点滅＋`buildResearchWarnings` がraw値0で範囲外警告を重複表示 | `ResearchDistanceSheet.tsx`、`researchDistance.ts:419-` | **【決定】2段構え**: ①警告生成は `normalizeResearchFrequencyGHz` 適用後の値で評価（lib側）、②バナーは `useDeferredValue`＋300msのdebounce後に表示（blur条件は採らない: スライダー操作でblurが発生しないため） | 打鍵直後300ms以内はバナー非表示のe2e／warnings重複なしのunit |
| A9 | coax.test.ts の変数名 `at2400` が実際は2000MHz点 | `src/tests/coax.test.ts` | リネームのみ | — |

**受け入れ基準（Track A共通）**: 各PRで unit/lint/build/e2e 緑。lib変更はテスト先行のコミット順（test→fix）を守る。

---

## 3. Track B: アーキテクチャ残件

| ID | 内容 | 方針 | 担当想定 |
|---|---|---|---|
| B1 | **linkBudget ValidationErrors の文字列→コード化**。`validateLinkBudgetInput` が約30箇所で日本語文字列を代入し、`ResultHero.tsx:30` が `Object.values(errors)` を直接表示 | `ValidationErrors = Partial<Record<keyof LinkBudgetInput, RfErrorCode | {code, params}>>` へ移行し、表示は `rfErrorMessages` を拡張して解決。**フィールド名→日本語ラベルのマップはUI層**。`linkBudget.ts:707` の再throwも RfError 化。テスト（`linkBudget.test.ts:119` 等の文言依存）を同時更新 | **Claude**（型変更が広く波及するため） |
| B2 | 旗艦の残フラット構成30ファイルの自己完結パターン化 | **UX-3に統合**（同じファイルを2度触らない）。ui-redesign-plan.md §4.1 の分割と同時に `rf-basic-link-calculator/components/` 内をセクション別サブフォルダへ | Claude |
| B3 | import境界の拡張 | ESLintに「`src/lib/**` から `src/app/**`・`src/components/**` への import 禁止」を追加（現状違反ゼロを grep 確認済みの状態で固定化） | Codex |

---

## 4. Track C: UX大改修（UX-0〜UX-4）

**正本**: [docs/ui-redesign-plan.md](./ui-redesign-plan.md)。KPI・部品仕様・ページ別仕様・受け入れ基準はそちらに全て記載。ここでは分担と順序のみ:

| フェーズ | 内容（要約） | 担当想定 | 依存 |
|---|---|---|---|
| UX-0 | 計測基盤: フォールド可視性・総高・スクショ基準線（24ツール×2ビューポート）、axe-core組込み | **Antigravity**（ブラウザ実機検証が主務） | なし |
| UX-1 | UI Kit v2: MetricCard／Field（help二重表示廃止）／ヘルプ一本化／SegmentedControl／ChoiceChips／CollapsibleSection／トークン確定 | **Claude**（API設計と後方互換の判断が必要） | UX-0 |
| UX-2 | ToolShell v2＋基本22ツール移行（**AntennaToolPanel 1,908行の分割を含む**） | **Codex**（パターン適用の物量。Claudeが最初の2ツールで手本PR） | UX-1 |
| UX-3 | 大型3ツール: 旗艦（**LinkBudgetPanel 1,245行の分割を含む**）／NCU／ナミ | **Claude**（状態管理・sticky・既存優良実装の保全判断） | UX-1 |
| UX-4 | 掃討: chartTheme hex54箇所・タップターゲット残・視覚回帰の基準線更新 | **Codex** | UX-2/3 |

---

## 5. Track D: コラム高度化 — 二層読者設計（素人に面白く、玄人が感心する）

> **正本**: 解剖学・品質基準・データモデル・制作パイプラインの詳細は [docs/column-guide.md](./column-guide.md)。本節は要約と施策一覧。

### 方向性（確定）
目標は「**素人・初心者が読んで面白く理解でき、玄人が読んで感心する**」の両立。ただし**同じ一本の文章で両方を狙わない**（中間の凡文になる）。解は**レイヤリング**:
- 表面（常時表示）＝素人が読み切れる物語（フック→歴史→本質→実務、600〜800字）。面白さの源泉は問い・逸話・失敗談・意外性。
- 深層（折りたたみ）＝玄人向けの検証可能性（式番号レベルの出典・定量表・導出の要点）。
- たとえを使う場合は**「たとえの破れ」を必ず1文添える**（玄人の信頼を落とす最大要因は誤った比喩の放置）。

### 品質基準（素人テスト5項目＋玄人テスト5項目 = column-guide.md §3）
素人側: フック2〜3文に専門用語ゼロ／本文だけで結論が分かる／「へえ」が1つ以上／常時表示≤800字。
玄人側: 一次出典が式番号まで／定量主張が本ツールで再現可能／適用範囲・典型誤差の数値化／技術的誤りゼロ（Claudeレビュー必須）／読後に意思決定が変わる。

### 現状診断
**HataColumn は既に目標水準**（秦正治氏の逸話＋適用範囲の数値＋2025年研究リンク6件＝物語と検証可能性の共存を実証）。学習クエスト探究モードの問題文も同水準。一方 **AntennaToolPanel の column は出典ゼロの3点テキスト**で格差が大きい。

### 効率化（column-guide.md §4-6 の要約）
- コラムを **構造化データ（`src/data/columns/<id>.ts`・5層スキーマ）＋共通レンダラー1個** に分離。新規=データファイル1個、改稿=データ差分のみ。
- **定量値は手書き禁止**: `compute: () => lib関数` でビルド/実行時計算（式修正に自動追随）。`liveKey` で現在入力に連動するライブコラム化。
- `lastReviewed`/`retrievedAt` 必須化＋年次レビューの機械抽出で鮮度を運用。

### 施策（D1〜D8）

| ID | 施策 | 内容 |
|---|---|---|
| D1 | **出典データモデルの共通化** | learning quest の `QuestSource` 型を一般化した `ColumnSource {label, href, kind: "paper"\|"standard"\|"dataset"\|"book", note}` を `src/data/columnSources.ts` に集約。全コラムは最低1つの一次出典を持つ。AntennaToolPanel の `column: string[]` を `{points: string[], sources: ColumnSource[]}` へ拡張 |
| D2 | **定量レイヤ** | 各コラムに「数値で見る」ブロック: モデル間差・適用範囲・典型誤差を表1枚で。値は lib/rf の関数で**ビルド時に計算**（手書き数値の陳腐化防止） |
| D3 | **導出レイヤ（1段だけ深く）** | 折り畳み「なぜこの式か」: 20log10=球面波の電力束密度∝1/d²、FSPL定数32.44のkm/MHz単位系導出、√f=表皮効果、像理論(monopole=½dipole)、Chu限界のQ下限、鏡面極限FSPL(d1+d2)の幾何。**式は導出の要点2〜3行＋原典参照**に留める |
| D4 | **アンチパターン集** | 「S11が良いのに飛ばない（放射抵抗vs損失抵抗）」「dBi/dBd混同の2.15dB」「Hataにアンテナ高10mを入れる」「ケーブル損失をdB/線形で二重計上」等を、**本ツールの入力例＋誤差dB付き**で提示 |
| D5 | **法規レイヤ** | 920MHz帯（ARIB STD-T108: 空中線電力・キャリアセンス・送信時間制限）、EIRP上限とアンテナ利得の関係。**E4（EIRP法規チェックツール）と相互リンク** |
| D6 | **実測方法論の標準化** | HataColumn の「1点校正＋残差→信頼率余裕＋10倍距離外挿の禁止」を方法論テンプレとして全伝搬系コラム（研究距離・NCU・propagation-loss）へ展開 |
| D7 | **ライブコラム** | コラム内の例示数値を現在の入力値で再計算する `<LiveExample>` 部品（例:「いまの条件では都市↔開放地の差は◯dB」）。静的文章と計算機の分断を解消（世界的にも稀な差別化要素） |
| D8 | **更新運用** | `ColumnSource` に `retrievedAt` を持たせ、年1回のリンク切れ・新研究レビューをTrack運用に組み込む。learning quest researcher モードの新規研究をコラムへも反映する一方向フロー |

### パイロット3本（この順で品質基準を確立）
1. **FresnelDeepDive**: ITU-R P.526 の knife-edge 式番号、60%基準の根拠、地球曲率 k=4/3（A3aと連動）、実測での回折損失の典型値。
2. **反射板/RIS コラム**（AntennaToolPanel）: 鏡面極限とRffの関係（今回実装したクランプの理論背景）、近年のRISパスロス研究（有限面積の電磁界積分）への橋渡し。A6と連動。
3. **マイクロストリップ コラム**: Hammerstad-Jensen 1980 の精度（±0.4%級）と適用範囲、u=1不連続の性質（A4と連動）、実基板での誘電正接の影響。

**分担**: 文献調査・リンク検証＝**Antigravity**（Web閲覧）→ 草稿＝**Claude**（RF理論の正確性・定量値のlib照合）→ データモデル移行と組み込み＝**Codex**。**全コラムはClaudeが技術レビュー**（AGENTS.md「数式・定数の根拠明示」に準拠）。

---

## 6. Track E: RF理論拡張・新ツール6本

> 進め方（全ツール共通）: ①lib純関数＋期待値テスト（テスト先行）→ ②tools.ts に1エントリ追加 → ③ToolShell v2 上にパネル実装 → ④e2eスモーク。**設計・式・テスト＝Claude、パネル実装＝Codex、実機確認＝Antigravity**。

| ID | ツール | 中核式・仕様 | 主要テスト |
|---|---|---|---|
| E1 | **雑音床・感度導出**（最優先） | 感度[dBm] = −174 + 10log₁₀(BW[Hz]) + NF[dB] + 所要SNR[dB]。プリセット: LoRa(SF7-12はSNR負値: −7.5〜−20dB)/NB-IoT/Wi-Fi/BLE。出力: 雑音床・感度・**既存リンクバジェットの感度入力との突き合わせ導線** | BW=1Hz→−174、LoRa SF12/125kHz≈−137dBm、NF加算の線形性 |
| E2 | **フェージング統計マージン** | 対数正規シャドウイング: 必要マージン = σ·Q⁻¹(1−p)。**【決定】第1段はセルエッジ信頼率のみ**（エリアカバレッジのJakes近似は第2段として別Work Order化）。Q⁻¹はRational近似(Acklam系)をlibに実装し係数出典を明記。σプリセット(都市8dB/郊外6dB/開放4dB・出典付き)。出力: 信頼率50/80/90/95/99%のマージン表＋研究距離シートの `shadowFadingStdDb`・`reliabilityPercent` と同一値になる整合テスト | Q⁻¹(0.1)σ=1.2816σ／p=50%→0／研究距離シートの既存 `reliabilityMarginDb` と一致 |
| E3 | **偏波不整合損失** | 直線-直線: 20log₁₀\|cosθ\|（クランプ表示）、直線-円: 3dB、円-円(同旋/逆旋): 0/20dB超。軸比考慮の一般式は第2段 | θ=0/45/90°、LP-CP=3dB |
| E4 | **EIRP法規チェック（920MHz帯）** | EIRP = Ptx + Gant − Lcable を ARIB STD-T108 の区分（20mW/250mW、空中線電力・EIRP条件）と照合し合否＋余裕を表示。**規格値はdata層に出典付きで分離**（改定追随を容易に） | 境界値（ちょうど上限/±0.1dB） |
| E5 | **降雨・大気減衰（簡易）** | ITU-R P.838-3 の k·R^α（周波数・偏波別係数テーブル）＋P.676簡易大気。適用: 5GHz以上を主対象、Sub-GHzでは「無視可能」を数値で示す | 28GHz/25mm/h の文献値照合 |
| E6 | **フレネル長距離モード** | A3a の k=4/3 曲率を fresnel ツールUIに表出（見通し距離 4.12(√h1+√h2) km も併記） | 曲率降下の期待値 |

---

## 7. Track F: プラットフォーム化（最後に実施）

| ID | 内容 | 備考 |
|---|---|---|
| F1 | **manifest駆動**: `tools.ts` の各エントリに `panel`(dynamic import)・`e2eSmoke` 情報を持たせ、`/tools/[slug]/page.tsx` の generateStaticParams 一本化と e2e スモークの自動生成 | `output: export` との両立を最初に検証（generateStaticParams で静的化） |
| F2 | **単位ブランド型**: `type Db = number & {__brand:"dB"}` 等を `lib/rf/units.ts` に導入し、新規コード（Track E）から適用開始→既存へ漸進 | 全面適用はコスト大。E系で先行採用し価値を実証 |
| F3 | **e2eの階層化**: 自動生成スモーク（全ツール描画＋主結果表示）と手書きシナリオを分離 | UX-0 の資産を移管 |

---

## 7B. Track G: 新規基礎ツール20本（事業直結の拡張）

**正本**: [docs/new-tools-proposal.md](./new-tools-proposal.md)。スタッフ株式会社のアンテナ事業と相性の良い20本（実装・筐体6／整合・給電4／複数アンテナ3／現場4／方式・運用3）を、式・既定値・テスト期待値・UI差分・事業フックまで定義済み。

- 新カテゴリ `implementation`（実装・筐体）/`system`（方式・運用設計）を tools.ts に追加。
- Tier1（8本・閉形式・工数S）: G9 ミスマッチ距離影響／G16 デセンス／G15 RSRP変換／G8 帯域幅Q／G13 角度マージン／G17 測定点数／G10 電気長／G6 金属面 — **W3から着手可**。
- [DATA]マーク7本（G2/G3/G4/G5/G14/G15判定/G18規制）は**出典なしの数値をマージ不可**とし、Antigravityの文献パックを先行成果物とする。
- 全ツール共通: E系と同じ「lib＋テスト先行（Claude）→ tools.tsエントリ＋パネル（Codex）→ 実機確認（Antigravity）」。

## 8. エージェント分担マトリクス

### 8.1 能力プロファイルと主担当

| エージェント | 強み（本プロジェクトでの実績・特性） | 主担当 | 避ける作業 |
|---|---|---|---|
| **Claude（Opus 4.8 / Fable）** | 設計・影響範囲の見極め・反証検証・RF理論の正確性・横断リファクタの安全な実行（CLAUDE.md上の設計レビュー主担当） | UX-1 Kit設計、UX-3 大型3ツール、B1 型移行、E系のlib設計＋テスト先行、D草稿の技術執筆、**全トラックの最終レビュー** | 単純な大量置換（コスト非効率） |
| **GPT系（Codex）** | 実装主担当（.codex/instructions.md）。パターンが確立した後の高スループット適用・テスト量産 | Track A 一括、UX-2 22ツール移行（Claudeの手本PR 2本の後）、UX-4 掃討、B3、D組み込み、E系パネル実装 | 仕様が未確定の設計判断、巨大ファイルの初回分割 |
| **Antigravity** | ブラウザ実機操作・視覚検証・Web調査 | UX-0 計測基盤（スクショ基準線・フォールド計測・axe）、各ウェーブの**視覚回帰レビュー**、D系の文献調査・リンク検証、e2e保守 | lib/rf の計算ロジック変更（レビュー体制外のため禁止） |

### 8.2 コンフリクト回避（ファイル所有権）
同一ウェーブ内で同じファイルを2エージェントが触らないこと。境界:
- W2: Codex=`src/app/tools/_components/**`＋基本ツール22ページ／Claude=`src/lib/rf/linkBudget.ts`系（B1）／Antigravity=`e2e/**`・`docs/**`
- W3: Claude=旗艦・NCU・ナミの `components/**`／Codex=`chartTheme`掃討（対象一覧を事前にgrepで固定しPR分割）
- **`src/components/**`（UI Kit）はUX-1完了後フリーズ**し、変更はClaudeのレビュー必須。
- **`src/lib/rf/**` はテスト先行が無いPRをマージ禁止**（AGENTS.md準拠）。

### 8.3 共通ゲート（全PR）
1. `npm run test` / `npm run lint` / `GITHUB_PAGES=true npm run build` / `npm run test:e2e` すべて緑。
2. UI変更PRは視覚回帰スクショの差分添付（UX-0の基盤で自動化）。
3. `src/lib/rf/**` に差分がある場合: 期待値テストの同時追加＋数式根拠（出典）をPR本文に記載。
4. 1PR=1目的。リネーム/移動と、ロジック変更を同一PRに混ぜない。
5. コミットは `feat|fix|refactor|docs(scope): 日本語要約`、本文にトラックID（例: `[A2]`、`[UX-2]`）を記載。

### 8.4 引き継ぎ規約
- 各タスクは本書のID（A1〜F3、UX-0〜4、D1〜D8）で参照する。仕様の疑義は**本書とui-redesign-plan.mdの更新で解消**してから実装（口頭合意の禁止）。
- 未完了で手を離す場合、`docs/handoff/<ID>.md` に「完了範囲・残作業・既知の罠」を残す。
- ブランチ命名: `track/<ID>-<slug>`（例: `track/a2-coax-extrapolation`、`track/ux2-toolshell-fspl`）。ベースは `feature/initial-rf-basic-link-calculator`。

### 8.5 Work Order フォーマット（実行エージェントへの発注単位）

判断力の異なるエージェントが同品質で実行できるよう、着手前に各タスクを次の形式に展開する（Track A は本書の表が既にこの情報を含む。UX-2 の22ツール分は ui-redesign-plan.md §3.5 のチェックリストを使用）:

```markdown
## WO-<ID> <題名>
- 目的(1文) / 背景(該当docs節へのリンク)
- 変更対象ファイル（これ以外は変更禁止）
- 変更禁止事項（例: lib/rf の数式・CI・UI Kit）
- 手順（番号付き。判断分岐を含めない＝分岐が要る場合は発注者に差し戻し）
- Definition of Done（機械検証可能な条件のみ）
- 検証コマンド（4ゲート＋タスク固有）
- ロールバック条件（どのテストが落ちたら中断して報告するか）
```

**記入例（WO-A2）**: 目的=coax補間の外挿を物理的に妥当な範囲に制限。対象=`src/lib/rf/coax.ts`・`src/tests/coax.test.ts`・`src/app/tools/_components/CoaxCableLossPanel.tsx`。禁止=補間式(線形)自体の変更・他パネル。手順=(1)テスト3件追加(逆順ソート同値/2倍頭打ち/範囲内false) (2)coax.tsに昇順ソートと`extrapolated`追加 (3)Panelにcaution注記。DoD=新テスト緑＋既存8件緑＋注記はextrapolated時のみDOM存在。検証=4ゲート＋`npx vitest run src/tests/coax.test.ts`。ロールバック=既存coaxテストが1件でも赤なら中断。

---

## 10. コールドスタート・コンテキストパック（本セッション外のエージェント向け）

**必読（この順で15分）**: ① `AGENTS.md`（共通規約・Git禁止事項・P0-P3） → ② 本書 §0-§1 → ③ 担当トラックの節 → ④ UX系なら `docs/ui-redesign-plan.md`、コラム系なら `docs/column-guide.md`。

**壊してはならない不変条件（違反PRは差し戻し）**:
1. `src/lib/rf/**` は純関数・日本語文言なし（エラーは `errors.ts` の RfError＋コード）。文言は `src/lib/rfErrorMessages.ts`（UI層）が持つ。
2. ツールの追加・メタ変更は `src/data/tools.ts` のみ（basicTools/toolDirectory は派生。直接編集禁止）。
3. `@/app/tools/<slug>/components/*` を他所から import しない（ESLintが落とす）。共有部品は `src/app/tools/_components/` か `src/components/`。
4. NumberInput の `emptyBehavior`: LinkBudget系=`"invalid"`（空欄→必須エラー表示）、他=`"preserve"`（空欄→直前値保持）。この二挙動は**仕様**。
5. `output: "export"`（静的書き出し）前提。サーバーAPI・ランタイム依存の持ち込み禁止。
6. CI（`.github/workflows/deploy-pages.yml`）は Track F まで変更禁止。

**セットアップと検証**: `npm ci` → 開発 `npm run dev`。4ゲート= `npm run test`（vitest, 182+件）／`npm run lint`／`GITHUB_PAGES=true npm run build`／`npm run test:e2e`（Playwright, 31+件。初回は `npx playwright install chromium`）。

**現在の規模感**: 24ツール／lib 22モジュール／unitテスト24ファイル／e2e 1ファイル31テスト。直近コミット履歴が各トラックの完了証跡（§1の表参照）。

---

## 9. 直近の実行キュー（提案）

1. **W1着手**: UX-0（Antigravity）＋ UX-1（Claude）＋ A1-A9（Codex、1日粒度で並行）
2. W1完了ゲート: スクショ基準線がコミットされ、UI Kit v2 が2ツール（FSPL・VSWR）でパイロット適用済み
3. **W2**: UX-2 移行開始（Codex）と同時に Dパイロット文献調査（Antigravity）
4. 以降は §0 のウェーブ表どおり

**本書の承認をもって W1 を開始する。**
