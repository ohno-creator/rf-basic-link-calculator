# O-1／O-1b レビュー報告 — term-lab 21語 ＋ OTAエキスパートlib（Workflow・敵対的検証済み）

**実施**: Claude Sonnet 5／**日付**: 2026-07-12／**手法**: 5並列レビュー（term-lab4群＋OTAlib）→検出24件を1件ずつ独立エージェントが反証検証（confirmed=18／refuted=6）
**対象**: `track/term-lab`（origin/feature由来・**Codex未コミットの作業ツリー状態**に対する読み取り専用レビュー。コミット前に拾えたのは好機——このままpushされる前に直してもらうのが目的）

## 結論
物理式の**数値自体**はほぼ全て正しい（21語・OTAlib双方とも）。一方で①**体感パーツの見た目が主張と矛盾する**実装バグが3件、②**libのフォールバック握りつぶし**が実データを歪める1件、③**貼り付けインポートの無言データ欠落**1件——計5件のP1は、term-lab/OTAエキスパートをmainへ出す前に必ず修正してほしい。P2の6件（lib再利用ルール違反5件・放射効率の仕様未達1件）とP3の7件は次点で、まとめて1コミットでの対応で構わない。

## P1（確定・要修正——コミット前に対応推奨）

### 1. TermDielectricConstant.tsx — εr=1.0でlibエラーを握りつぶし別式にすり替わる
スライダー最小値 `min="1.0"` を選ぶと、lib `calculatePatchAntenna`（`src/lib/rf/antenna.ts:181-183`）が `dielectricConstant <= 1` でドメインエラーを投げる。これをbare catchで拾い、`{ widthM: 0.05, lengthM: 0.05/√εr, wavelengthM: lambda0 }` という物理的根拠のない固定値に無警告ですり替えている（TermDielectricConstant.tsx:27-42）。εr=1.1等の隣接値はlib計算（フリンジ補正込み）を使うため、**境界のεr=1.0だけ計算式が変わり数値が不連続**になる。
**修正案**: スライダーmin を1.01等の安全域へ寄せる、またはεr=1.0を専用の特殊値として明示計算（フリンジ補正なしの理論値であることを深掘りに明記）する。bare catchでの無警告フォールバックは廃止。

### 2. TermAntennaGain.tsx — 「全放射電力は不変」の表示が実際の図形と矛盾
「総放射電力」ボックス（L118-129）は `gainDbi` に依存しない固定文字列 `100%（増幅なし・一定）` を表示するのみ。しかし実際にビームを描くパターン形状（L33-59、`factor=(gainDbi/15)*1.5, beamPow=1+gainDbi/2` による cosᵇᵉᵃᵐᴾᵒʷ モーフィング）を面積積分すると、gainDbi=0で面積≈11,310に対しgainDbi=15では≈13,527と**約+20%増加**しており保存されていない（Claudeがnode.jsで数値確認）。発注書の核心コンセプト「利得は増幅ではなく集中」を、体感パーツ自体が裏付けていない。
**修正案**: パターン形状の面積（=放射電力の幾何学的表現）が gainDbi によらず一定になるよう正規化するか、正規化が困難ならビジュアルの限界として深掘りに開示する。

### 3. TermEffectiveAperture.tsx — 内部リンクが404
`iotPerspective.toolHref="/tools/fspl"` は存在しないルート。正しいslugは `free-space-loss`（`src/data/tools.ts:133`、ディレクトリ `src/app/tools/free-space-loss` 実在）。
**修正案**: `/tools/fspl` → `/tools/free-space-loss` に1行修正。

### 4. TermVSWR.tsx — 定在波アニメが「腹と節の比」を表現できていない
描画式 `y=90-35*(Math.sin(i/18)+Γ*Math.sin(-i/18))` は sin(-x)=-sin(x) で展開すると振幅 `35*(1-Γ)` の**位置iに依らない一様振幅の正弦波**に潰れる（Claudeがnode.jsで複数Γ値を数値検算し確認）。発注書要求「VSWRスライダー1〜10→腹と節の比が変わる」を満たしておらず、実際の定在波包絡線（腹は増大・節は減少）とは逆に、VSWRが増えるほど振幅が一様に縮小するように見える。テキスト表示のΓ・反射電力%自体（`convertVswr`由来）は正しい。
**修正案**: 進行波＋反射波を別々に合成し、位置に応じて振幅が `(1-Γ)`〜`(1+Γ)` の間で変化する包絡線として描画し直す。

### 5. otaImportParser.ts — ヘッダー行誤判定で正当データが無言欠落
1行目判定（L45-59）に `isNaN(Number(parts[1])) || isNaN(Number(parts[2]))` が含まれるため、ヘッダー行なしでPc/Scが数値として不正な1行のみの貼り付け（例: `B9,abc,-108,-3,20,-105`）は「ヘッダーとみなしてスキップ」され、`rows=[]・errors=[]・success=false` となって**何が悪いのか一切通知されない**。さらに2行目以降は `parts[0]` に"band"/"バンド"を**部分一致**で含むだけでヘッダー扱いされ、Band名の表記ゆれ次第でデータ行が無言廃棄されうる。発注書の「不正行への行番号付きエラー」要件に反する。現状はUIから未参照のため実害は未発現だが、UI結線時に顕在化するリスクがある。
**修正案**: ヘッダー判定はヘッダー専用のキーワード完全一致（1列目が"Band"のみ等）に限定し、数値パース失敗による誤爆を無くす。パース失敗は必ず行番号付きエラーとして返す。

## P2（確定・次点で修正——lib再利用ルール違反5件＋仕様未達1件）

| # | ファイル | 内容 |
|---|---|---|
| 6 | TermPolarization.tsx | `cos²θ`・`-20log10(cosθ)` を `src/lib/rf/polarizationMismatch.ts` の `polarizationLossFactorLinear`/`linearLinearMismatchLossDb` を使わず再実装（値は一致・ルール違反のみ） |
| 7 | TermDielectricConstant.tsx | `1/√εr` を `src/lib/rf/dielectric.ts` の `wavelengthShorteningFactor` を使わず再実装。加えて基板波形の縮尺は生εr、mm実数値はlibのeffectiveEr（フリンジ補正込み）由来で**εr=4.4で約4%のズレ**あり | 
| 8 | TermEffectiveAperture.tsx | `src/lib/rf/antenna.ts` の `calculateEffectiveAperture` を使わず波長・実効面積を再実装（群2内で唯一lib import皆無） |
| 9 | TermRadiationEfficiency.tsx | 発注書指定「放射/導体損/誘電損/整合損の4区分積み上げバー」ではなく放射/損失の2区分のみ。「S11が良くても効率が悪い」の体感も未実装（文章のみ） |
| 10 | TermRadiationPattern.tsx | 深掘りに正確な半波長ダイポール式 `E(θ)=cos((π/2)cosθ)/sinθ` を掲示しながら、実描画は微小ダイポール近似 `r∝|sinθ|`（θ=30°で0.500 vs 正確値0.416と最大2割ズレ）。簡略化の不一致が開示されていない |
| 11 | TermResonance.tsx | `c/f/4` を `src/lib/rf/antenna.ts` の `calculateAntennaLengths` を使わず再実装（値は一致） |

## P3（軽微——まとめて対応で可）

| # | ファイル | 内容 |
|---|---|---|
| 12 | TermFrequencyWavelength.tsx | 発注書指定の「intuition第1章への誘導リンク」が用語固有の形で存在しない（ページ共通リンクのみ） |
| 13 | TermDielectricConstant.tsx | 「テフロン系: εr≒2.6」がsite内の他箇所（PTFE単体2.1）と食い違う可能性（要確認） |
| 14 | TermImpedanceMatching.tsx | `Γ=\|(R−50)/(R+50)\|` を独自実装（lib側にインピーダンス→Γ直接変換の関数が無いためカバレッジ不足の側面あり。値は正しい） |
| 15 | TermCableLossSqrtF.tsx | 電力残存率を独自式で計算（`db.ts`の`dbToPowerRatio`または`coax.ts`の`cableAssemblyLoss().powerRemainingPercent`で代替可能。値は正しい） |
| 16 | TermVSWR.tsx | ラベルが「反射電力%」表示（発注書は「透過電力%」指定）。同じ群3のTermReturnLossS11.tsxは透過表示で統一性なし |
| 17 | TermEirp.tsx | 発注書指定の「矢印合成」演出が未実装（数式テキストのみ。数値は正しい） |
| 18 | harmonicHunter.test.ts | UL帯を明示的にbandsへ含めて「ヒットしない」ことを検証するテスト・異常系テスト（maxHarmonic<1等）が未実装 |

## 反証により除外した6件（参考・実害なし）
念のため反証で退けた指摘も記録する。うち2件は**レビュー実行中にCodexが実装を進めたことによる誤検出**（OTAエキスパートUI/e2eの「未着手」指摘・harmonicHunterテストの重複実装指摘）——作業ツリーが動いている最中のレビューではこの種の一時的なズレが起こりうる点に留意。
- TermEfficiencyGainDiff.tsx: 「TermAntennaGainが既にlinearToDbiをimport」という前提が誤り（実際はTermAntennaGainも独自実装）
- TermMultipathFading.tsx: 「lib再利用皆無」の指摘は誇張（後続検証で妥当な代替libが無いケースと判明）
- TermEirp.tsx: 「法規オーバー」の洞察配置（grasp vs iotPerspective）は発注書上どちらでも許容範囲
- 群4（Ground/Eirp/Isolation/Multipath）のtabular-nums未適用: 実際は適用済みで誤検出
- otaExpert.ts: 「UIから未参照」は誤り（OtaExpertPanel.tsxから参照済み、レビュー中にCodexが結線）
- OtaImplementationLossPanel.tsx: 「UI/e2e未着手」は誤り（レビュー中にOtaExpertPanel.tsxが作成され解消）

## テスト
上記P1修正後、以下を追加/更新して確認する:
- TermDielectricConstant: εr=1.0の境界値テスト（コンポーネントテストがあれば）または深掘り注記の追加
- otaImportParser.test.ts: ヘッダーなし＋1行目データ不正のケース、Band名部分一致の誤爆ケースを追加
- harmonicHunter.test.ts: UL帯を明示的にbandsへ含めた「ヒットしない」ケース、異常系（maxHarmonic<1・marginMHz<0・rxHigh<rxLow）
既存 `npm run test` の `Tests N passed` 行を必ず確認してからpushすること。
