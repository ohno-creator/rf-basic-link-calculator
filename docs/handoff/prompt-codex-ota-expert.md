# Codex 発注 — OTA実装損失ツールのエキスパートモード（IoT設計実務向け）

**対象**: 既存 `/tools/ota-implementation-loss/`。**既存のシンプル表示・既存e2e・data-testidは不変**（battery-lifeエキスパートと同じ「トグルで拡張」流儀）。
**ブランチ**: `track/ota-expert`（origin/feature から・専用worktree）。
**必読**: `src/lib/rf/otaImplementationLoss.ts`＋テスト／`OtaImplementationLossPanel.tsx`／`src/data/otaBandPresets.ts`／`BatteryLifePanel.tsx`のエキスパートトグル様式／`src/data/cellularCarrierBands.ts`（Band別UL/DL周波数の既存データ＝再利用元）

## エキスパートモード仕様（4機能）

### 1. 干渉源ハンター（高調波マップ）——本命機能
IoT機器のデセンス実務は「基板のどのクロックの高調波が受信帯に落ちたか」の特定が核心。
- 入力: クロック源リスト（名称＋周波数MHz・最大8行・行追加/削除）。プリセット例: 26MHz(TCXO)/32.768kHz(RTC)/48MHz(USB)/133MHz(DDR)/25MHz(Ethernet PHY)
- lib新設 `src/lib/rf/harmonicHunter.ts`（テスト先行）:
  `findHarmonicHits({clocks:[{name,freqMHz}], bands:[{band, rxLowMHz, rxHighMHz}], maxHarmonic=200, marginMHz=0})`
  → 各Band RX帯（**FDDはDL帯=端末の受信帯**・TDDはtdd帯）に落ちる {clockName, order, harmonicMHz, band, offsetFromEdgeMHz} の一覧
  - テスト期待値（自己検算して固定）: 26MHz×36次=936MHz→B8 DL(925-960)帯内✓／26×35=910→B8帯外（UL側）✓／48×41=1968→B1 UL(1920-1980)は**RX帯ではない**のでヒットしない（DL 2110-2170に48×45=2160が帯内✓）／32.768kHzのような低周波はmaxHarmonic内で届かない場合ヒット0
  - -0非返却・順序はBand→次数でソート
- UI: デセンス判定が要注意/ノイジーのBandと突き合わせ、「このBandのRX帯に落ちる高調波」を強調表示（例: B8デセンス3.5dB ← 26MHz×36次=936MHz が DL帯内 +11MHz）。ヒット0のときは「基本波リストの見直し・広帯域ノイズ（DCDC）の疑い」を提示
- 免責注記: 高調波の「該当」は当たり付けであり、実際の結合量はレイアウト依存（近傍界測定で確定）

### 2. 要求値との合否判定
- Band行ごとに TRP要求値/TIS要求値[dBm] をユーザー入力（既定空欄=判定なし。「例」プリセット: LTE-M機器の一般的な社内目標例として TRP≧18dBm/TIS≦-99dBm を「例」明記で）
- 実測との余裕dBと合否バッジ（余裕<0=不合格/0-2=注意/≧2=合格）。キャリア認証値は各社NDA資料のため**プリセット化しない**（注記で明示）

### 3. デセンス→距離影響換算
- 各Bandのデセンス推定値を通信距離影響%へ換算（既存 `db.ts` の dbToDistanceRatio 再利用・伝搬指数n選択2/3/4）
- 「B8で3dBデセンス→自由空間なら距離-29%／n=3なら-21%」の実務直訳表示

### 4. 条件管理とデータ入出力
- 測定条件メモ欄（ファントム有無・温度・姿勢・治具）——保存はlocalStorage（`ota-expert-conditions-v1`）
- **クリップボード貼り付けインポート**: タブ/カンマ区切り（Excelコピー想定: Band,Pc,Sc,η,TRP,TIS の6列）をテキストエリアへ貼り付け→行パース→一括投入（パースはlib純関数＋テスト: 空行/ヘッダ行スキップ・数値検証・不正行は行番号付きエラー）
- 全Band結果のCSVコピー（TRPギャップ/TISギャップ/デセンス/判定含む）

## e2e（納品に含める）
エキスパートトグルON→クロック行追加（26MHz）→B8デセンスありで高調波ヒット表示（936MHz/36次）→要求値入力で合否バッジ→距離影響表示、の検証1本＋貼り付けインポートの検証1本（tool-calculator配下・既存テスト名と重複回避）

## 規約
既存API/表示/エクスポート不変（純追加）。tools.ts変更不要（既存ツールの拡張）。数値の発明禁止（Band RX帯はcellularCarrierBands.tsのstandardRangeを再利用）。生hex禁止。1機能=1コミット。全ゲート緑（`Tests N passed`行確認）→push→視覚ベースライン（ページ見た目が変わるためrebaselineループ・ランブック: prompt-wave5-codex-antigravity.md C-2）→feature→main。
Antigravityへ: 完成後、干渉源ハンターの検算（任意のクロック×次数の手計算照合5件）と実機受入を依頼。
