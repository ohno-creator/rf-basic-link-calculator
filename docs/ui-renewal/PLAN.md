> 最新運転方針: ユーザーの利用枠保全指示を優先し、クラウド範囲拡大停止。週間55%は申告基準、現在残量・5時間残量・双方リセットは不明。03時は締切で稼働目標ではない。現在の実装/検証状態はSUBMISSION.md、1操作再検証はHANDOFF.md。旧23時開始計画は21:52の即時開始許可で置換。

# UI刷新の基準・実装計画

状態: 優先範囲を実装・統合し、2026-09-14 01:14 JSTに「確認済み範囲のレビュー候補」としてローカル提出。全操作の完了判定ではない。最新の検証区分はSUBMISSION.mdとCOVERAGE.md。

## 基底と隔離
- 公開元: 9aab9eb5635afd08327b2069542746f3a4344562（2026-09-12）。GitHub Pages gh-pages=049b626daf333372518b4c473d04de2ad098cdf3、deployメッセージと成功Actions 34685445107が一致。
- リモート既定: feature/initial-rf-basic-link-calculator。元チェックアウト: feature/reach-distance-ui @410e1d7c（8月7日）。既存チェックアウトは変更しない。
- 作業正本: /Users/pc141/Documents/RF Basic Link Calculator/.ui-renewal-20260913/app
- Git管理領域が読み取り専用なので独立コピー。ローカル公開用repoの上記コミットをgit archiveで抽出。未コミット差分・認証情報・過去ログはコピーしていない。base-extraction-check.json参照。
- integration/は先に始めたリモートアーカイブ取得先で、作業正本にしない。
- 委任コード: ../control/scripts/delegate。原本scripts/delegateは未追跡だが保護。ROOTだけappへ、STATE_DIRは元プロジェクトの.claude/delegateへ固定。通常設定・回数上限は変更していない。
- GPT-6が受付・設計・採否・統合・最終判断。Claude/Fable/Opusは呼ばない。RF関数・比較保存形式・承認カタログは変更対象外。

## 第一群の仕様（開始30分以内に固定）
利用者: RFに詳しくない営業担当と設計担当。仕事: 目的に合うツールで条件を入れ、結果と適用条件から次の評価を決める。
障害: 目的カードがカテゴリ絞込みに留まる、全リストの反復、比較機能が検索レジストリにない。
1. 5つの目的から推奨ツールに直接進む。各入口に分かることと前提を短く表示。8カテゴリは一覧の絞込みとして保持し、目的カードを二重に並べない。
2. 64ルート全部を検索・一覧に登録。検索・カテゴリをURLと同期して戻る操作を検証。0件、現在カテゴリ、件数を文字で示す。
3. Headerはホーム・検索・一覧・既存相談を中心に整理。Footerは一覧へのリンクと運営・既存相談へ短縮。全URL保持。
4. 入力→結果と重要な適用条件→次の確認の順。式や長い説明は折りたたむが、重要な警告は隠さない。
5. NumberInputは既にドラフトを持つ。全体の空欄を一律NaNに変えず、各画面の検証との接続を調査して局所修正。未入力・0・無効を分ける。

## 割当と所有
- GPT-5.6-sol: 初回はsrc/app/page.tsx、src/app/components/ToolDirectoryBrowser.tsx、src/components/Header.tsx、Footer.tsx、src/data/tools.ts、toolKeywords.ts、関連e2eのみ。23時以降、専用独立コピーwriter-gpt56を上記コミットから抽出して割当。統合appを直接編集させない。
- GPT-6: docs/ui-renewal、統合と検証、次の画面群の仕様。各差分を順に確認し採用部分だけ統合。
- Gemini gemini-3.8-flash-high: 読み取り・独立反証。文章批評の実疎通成功。UI操作は未実施。
- Qwen3.6: 仕様批評。Gemma4: 営業向け文言。qwen3-coder:30b: 差分レビューと境界値。Ollama推論は1件ずつ。
- CLI書き込みは管理DB権限で不可。このセッションのGPT-5.6サブエージェント経路は確認済み。既存の1時間上限8回内で共用回数に記録する。新しい総量上限は設けていない。

## 受入条件
- 全64ルートへの一覧・検索経路、直接アクセス、basePath付き静的成果物を検証。機能削除なし。
- 1440/390px、キーボード操作、戻る・0件・カテゴリ解除、横はみ出しを検証。
- 比較の未知/0/予測/実測、保存復元、入力保護、印刷、非送信相談を回帰確認。
- 正常、空欄、0、負数、不正値、単位変更、適用外を優先画面で実操作。結果の数値は基底版と比較。
- lint、tsc --noEmit、Vitest、GITHUB_PAGES=true build、Playwright。削除・skipで通さない。
- 共通UI変更後は64画面の表示・リンク・consoleを確認。個別操作と表示のみを別記。

## 時刻
23:00実装開始、02:30新規実装凍結、02:50提出準備、03:00ローカル提出目標。
現在のツールに実行予約スケジューラはない。プロンプトだけで自動起動を保証しない。23時に同じセッションへ「開始」と送る1操作で再開できるよう記録を残す。日付超過時は運転時間を一度確認。

## 全機能一覧
基底はルート64、メタデータ63で比較のみ未登録。刷新版は比較を追加してルート64、メタデータ64を一致させた。静的HTML生成済みは操作検証済みを意味しない。

| URL | 名称 | 現状 | 改善優先 |
|---|---|---|---|
| /tools/antenna-isolation/ | 2アンテナ間アイソレーション | 共通Shell・詳細操作未検証 | 共通変更後に表示確認 |
| /tools/antenna-keepout/ | アンテナ・キープアウト領域チェック | 共通Shell・詳細操作未検証 | 共通変更後に表示確認 |
| /tools/antenna-spacing/ | アンテナ間隔 λ換算 | 共通Shell・詳細操作未検証 | 共通変更後に表示確認 |
| /tools/antenna-term-lab/ | アンテナ用語の直感ラボ | 個別画面・詳細操作未検証 | 共通変更後に表示確認 |
| /tools/aperture-gain-beamwidth/ | 開口利得・ビーム幅 | 共通Shell・詳細操作未検証 | 共通変更後に表示確認 |
| /tools/array-grating-lobe/ | 不要ビーム判定 | 共通Shell・詳細操作未検証 | 共通変更後に表示確認 |
| /tools/battery-life/ | 無線端末の電池寿命 | 共通Shell・詳細操作未検証 | 共通変更後に表示確認 |
| /tools/body-loss/ | 人体・手の影響ボディロス | 共通Shell・詳細操作未検証 | 共通変更後に表示確認 |
| /tools/cable-position-comparison/ | ケーブル・アンテナ位置比較 | 一覧登録、代表操作、保存復元、JSON書出し、貼付・ファイル選択読込を確認。削除・OS印刷完了は未検証 | 個別優先 |
| /tools/cellular-band-map/ | 周波数と4G/5G Band早わかり | 共通Shell・詳細操作未検証 | 共通変更後に表示確認 |
| /tools/coaxial-cable-loss/ | 同軸ケーブル損失 | 共通Shell・詳細操作未検証 | 個別優先 |
| /tools/db-family/ | dB・dBm・dBi・dBdの違い | 共通Shell・詳細操作未検証 | 共通変更後に表示確認 |
| /tools/db-feel/ | dBを体感する | 共通Shell・詳細操作未検証 | 共通変更後に表示確認 |
| /tools/dbm-converter/ | dBm 変換 | 共通Shell・詳細操作未検証 | 共通変更後に表示確認 |
| /tools/desense/ | デセンス（感度劣化） | 共通Shell・詳細操作未検証 | 共通変更後に表示確認 |
| /tools/detuning-estimator/ | 筐体・近接物の離調推定 | 共通Shell・詳細操作未検証 | 共通変更後に表示確認 |
| /tools/diffraction-shadow/ | 回折・回り込みの見える化 | 共通Shell・詳細操作未検証 | 共通変更後に表示確認 |
| /tools/diversity-gain/ | ダイバーシティ利得 | 共通Shell・詳細操作未検証 | 共通変更後に表示確認 |
| /tools/effective-aperture/ | 有効開口面積 | 共通Shell・詳細操作未検証 | 共通変更後に表示確認 |
| /tools/eirp-compliance/ | EIRP法規チェック（920MHz帯） | 共通Shell・詳細操作未検証 | 共通変更後に表示確認 |
| /tools/electrical-length/ | 電気長・位相換算 | 共通Shell・詳細操作未検証 | 共通変更後に表示確認 |
| /tools/far-field-distance/ | 遠方界距離（測定距離の目安） | 共通Shell・詳細操作未検証 | 共通変更後に表示確認 |
| /tools/field-strength/ | 電界強度・電力密度 | 共通Shell・詳細操作未検証 | 共通変更後に表示確認 |
| /tools/free-space-loss/ | 自由空間損失（FSPL） | 共通Shell・詳細操作未検証 | 個別優先 |
| /tools/frequency-wavelength/ | 周波数・波長 | 共通Shell・詳細操作未検証 | 共通変更後に表示確認 |
| /tools/fresnel-zone/ | フレネルゾーン半径 | 共通Shell・詳細操作未検証 | 共通変更後に表示確認 |
| /tools/gnss-cn0/ | GNSS C/N0バジェット | 共通Shell・詳細操作未検証 | 共通変更後に表示確認 |
| /tools/ground-plane-size/ | GNDプレーン寸法と効率 | 共通Shell・詳細操作未検証 | 共通変更後に表示確認 |
| /tools/ifa-initial-dimensions/ | 逆F・IFA初期寸法 | 共通Shell・詳細操作未検証 | 共通変更後に表示確認 |
| /tools/l-match/ | L型整合回路 | 共通Shell・詳細操作未検証 | 共通変更後に表示確認 |
| /tools/large-array-near-field/ | 大型アレイ近傍界 | 共通Shell・詳細操作未検証 | 共通変更後に表示確認 |
| /tools/lora-airtime/ | LoRa送信時間・920MHz制限 | 共通Shell・詳細操作未検証 | 共通変更後に表示確認 |
| /tools/lte-signal-metrics/ | LTE電波指標の換算（RSSI/RSRP/RSRQ） | 共通Shell・詳細操作未検証 | 共通変更後に表示確認 |
| /tools/measurement-sampling/ | 電測サンプリング設計 | 共通Shell・詳細操作未検証 | 共通変更後に表示確認 |
| /tools/metal-plane-effect/ | 金属面近接の利得変化 | 共通Shell・詳細操作未検証 | 共通変更後に表示確認 |
| /tools/microstrip-line/ | マイクロストリップ線路 | 共通Shell・詳細操作未検証 | 共通変更後に表示確認 |
| /tools/mismatch-range-impact/ | ミスマッチと通信距離 | 共通Shell・詳細操作未検証 | 共通変更後に表示確認 |
| /tools/nami-gate-window/ | ナミゲート 室内受信電力シミュレーター | 共通Shell・詳細操作未検証 | 共通変更後に表示確認 |
| /tools/ncu-below-ground/ | GL以下NCU・水道BOX診断 | 共通Shell・詳細操作未検証 | 共通変更後に表示確認 |
| /tools/noise-floor/ | ノイズフロア・受信感度 | 共通Shell・詳細操作未検証 | 個別優先 |
| /tools/ota-implementation-loss/ | OTA実装損失・デセンス分析 | 共通Shell・詳細操作未検証 | 共通変更後に表示確認 |
| /tools/patch-antenna-dimensions/ | パッチアンテナ寸法 | 共通Shell・詳細操作未検証 | 共通変更後に表示確認 |
| /tools/patch-hpbw-explorer/ | パッチアンテナの半値角 | 共通Shell・詳細操作未検証 | 共通変更後に表示確認 |
| /tools/pointing-margin/ | 指向誤差マージン | 共通Shell・詳細操作未検証 | 共通変更後に表示確認 |
| /tools/polarization-loss/ | 偏波不整合損失 | 共通Shell・詳細操作未検証 | 共通変更後に表示確認 |
| /tools/propagation-loss/ | 伝搬損失モデル比較 | 共通Shell・詳細操作未検証 | 共通変更後に表示確認 |
| /tools/radiation-efficiency-converter/ | 放射効率 dB⇔% 変換 | 共通Shell・詳細操作未検証 | 共通変更後に表示確認 |
| /tools/radiation-resistance/ | 放射抵抗・効率 | 共通Shell・詳細操作未検証 | 共通変更後に表示確認 |
| /tools/radio-wave-intuition/ | 感覚でわかる電波 | 個別画面・詳細操作未検証 | 共通変更後に表示確認 |
| /tools/rain-attenuation/ | 降雨・大気減衰 | 共通Shell・詳細操作未検証 | 共通変更後に表示確認 |
| /tools/realized-gain/ | 実効利得・利得変換 | 共通Shell・詳細操作未検証 | 共通変更後に表示確認 |
| /tools/reflector-ris-size-effect/ | 反射板・RISサイズ効果 | 共通Shell・詳細操作未検証 | 共通変更後に表示確認 |
| /tools/resonant-element-length/ | 共振素子長（モノポール/ダイポール） | 共通Shell・詳細操作未検証 | 共通変更後に表示確認 |
| /tools/rf-antipatterns/ | RFアンチパターン図鑑 | 個別画面・詳細操作未検証 | 共通変更後に表示確認 |
| /tools/rf-basic-link-calculator/ | リンクバジェット診断 | 個別画面・詳細操作未検証 | 個別優先 |
| /tools/rf-learning-quest/ | RF学習クエスト | 個別画面・詳細操作未検証 | 共通変更後に表示確認 |
| /tools/shadowing-margin/ | シャドウイングマージン | 共通Shell・詳細操作未検証 | 共通変更後に表示確認 |
| /tools/simple-link-budget/ | かんたんリンク計算 | 共通Shell・詳細操作未検証 | 個別優先 |
| /tools/small-antenna-limit/ | 小型アンテナ限界 | 共通Shell・詳細操作未検証 | 共通変更後に表示確認 |
| /tools/small-loop-resonance/ | 小型ループ共振 | 共通Shell・詳細操作未検証 | 共通変更後に表示確認 |
| /tools/spectrum-use-atlas/ | 周波数の用途地図（非セルラー編） | 個別画面・詳細操作未検証 | 共通変更後に表示確認 |
| /tools/vswr-bandwidth-q/ | VSWR帯域幅とQ | 共通Shell・詳細操作未検証 | 共通変更後に表示確認 |
| /tools/vswr-return-loss/ | VSWR・リターンロス | 共通Shell・詳細操作未検証 | 個別優先 |
| /tools/wall-penetration/ | 壁・建材の透過損失 | 共通Shell・詳細操作未検証 | 共通変更後に表示確認 |
