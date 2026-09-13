# 画面別対応・検証範囲

全64ツール。表示確認は390px DOM/見出し/ページ幅の取得であり、全画面の個別操作合格を意味しない。重点8画面は1440pxも取得。別途、デスクトップのホーム＋64ツールはaxe-coreのWCAG 2.1 A/AA・serious/critical走査で65/65件合格。390×844のaxe走査はChromium起動前に停止したため未完了。

|ルート|対応|操作検証|
|---|---|---|
|antenna-isolation|共通変更のみ|表示確認のみ・詳細操作未検証|
|antenna-keepout|共通変更のみ|表示確認のみ・詳細操作未検証|
|antenna-spacing|共通変更のみ|表示確認のみ・詳細操作未検証|
|antenna-term-lab|共通変更のみ|表示確認のみ・詳細操作未検証|
|aperture-gain-beamwidth|共通変更のみ|表示確認のみ・詳細操作未検証|
|array-grating-lobe|共通変更のみ|表示確認のみ・詳細操作未検証|
|battery-life|個別UI変更あり|1時間→60分の結果維持、容量空欄・周期超過・エキスパート温度/経年範囲外、標準値復帰、結果の成立条件・用途限定LoRa導線、390px入力表示を操作/E2E確認・残り未検証|
|body-loss|共通変更のみ|表示確認のみ・詳細操作未検証|
|cable-position-comparison|個別UI変更あり|1440/390表示、予測/実測/不明、実測差、相談・印刷対象本文、画面内確認のTab循環/Escape/フォーカス復帰、保存・復元、JSON書出し、貼付とOSファイル選択経由の不正拒否・正常復元を操作確認。削除、OS印刷完了は未検証|
|cellular-band-map|共通変更のみ|表示確認のみ・詳細操作未検証|
|coaxial-cable-loss|個別UI変更あり|1440/390表示、周波数空欄の項目別エラー、1.5本の拒否、10GHz外挿警告、標準値復帰を操作確認・残り未検証|
|db-family|共通変更のみ|表示確認のみ・詳細操作未検証|
|db-feel|個別UI変更あり|表示確認のみ・詳細操作未検証|
|dbm-converter|共通変更のみ|表示確認のみ・詳細操作未検証|
|desense|共通変更のみ|表示確認のみ・詳細操作未検証|
|detuning-estimator|共通変更のみ|表示確認のみ・詳細操作未検証|
|diffraction-shadow|共通変更のみ|表示確認のみ・詳細操作未検証|
|diversity-gain|共通変更のみ|表示確認のみ・詳細操作未検証|
|effective-aperture|共通変更のみ|表示確認のみ・詳細操作未検証|
|eirp-compliance|共通変更のみ|表示確認のみ・詳細操作未検証|
|electrical-length|共通変更のみ|表示確認のみ・詳細操作未検証|
|far-field-distance|個別UI変更あり|100mm→0.1mの結果維持、空欄時の未算出と次リンク非表示、成立条件・電界強度導線、390px結果表示を操作/E2E確認・残り未検証|
|field-strength|個別UI変更あり|10m→0.01kmの結果維持、空欄時の未算出、受信周波数0の項目エラーと受信電力だけの未算出、成立条件・遠方界導線を操作/E2E確認・残り未検証|
|free-space-loss|個別UI変更あり|1440/390表示、1km→1000mの結果維持、空欄・0・負数・不正文字・標準値復帰を操作確認・残り未検証|
|frequency-wavelength|個別UI変更あり|表示確認のみ・詳細操作未検証|
|fresnel-zone|共通変更のみ|表示確認のみ・詳細操作未検証|
|gnss-cn0|共通変更のみ|表示確認のみ・詳細操作未検証|
|ground-plane-size|共通変更のみ|表示確認のみ・詳細操作未検証|
|ifa-initial-dimensions|共通変更のみ|表示確認のみ・詳細操作未検証|
|l-match|共通変更のみ|表示確認のみ・詳細操作未検証|
|large-array-near-field|共通変更のみ|表示確認のみ・詳細操作未検証|
|lora-airtime|共通変更のみ|表示確認のみ・詳細操作未検証|
|lte-signal-metrics|共通変更のみ|表示確認のみ・詳細操作未検証|
|measurement-sampling|共通変更のみ|表示確認のみ・詳細操作未検証|
|metal-plane-effect|共通変更のみ|表示確認のみ・詳細操作未検証|
|microstrip-line|共通変更のみ|表示確認のみ・詳細操作未検証|
|mismatch-range-impact|共通変更のみ|表示確認のみ・詳細操作未検証|
|nami-gate-window|共通変更のみ|表示確認のみ・詳細操作未検証|
|ncu-below-ground|個別UI変更あり|300m→0.3kmの結果・判定維持を操作確認・残り未検証|
|noise-floor|個別UI変更あり|1440/390表示、125kHz→125000Hzの結果維持、空欄・0・不正文字・プリセット復帰を操作確認・残り未検証|
|ota-implementation-loss|共通変更のみ|表示確認のみ・詳細操作未検証|
|patch-antenna-dimensions|共通変更のみ|表示確認のみ・詳細操作未検証|
|patch-hpbw-explorer|共通変更のみ|表示確認のみ・詳細操作未検証|
|pointing-margin|共通変更のみ|表示確認のみ・詳細操作未検証|
|polarization-loss|共通変更のみ|表示確認のみ・詳細操作未検証|
|propagation-loss|共通変更のみ|表示確認のみ・詳細操作未検証|
|radiation-efficiency-converter|共通変更のみ|表示確認のみ・詳細操作未検証|
|radiation-resistance|共通変更のみ|表示確認のみ・詳細操作未検証|
|radio-wave-intuition|共通変更のみ|表示確認のみ・詳細操作未検証|
|rain-attenuation|共通変更のみ|表示確認のみ・詳細操作未検証|
|realized-gain|共通変更のみ|表示確認のみ・詳細操作未検証|
|reflector-ris-size-effect|共通変更のみ|表示確認のみ・詳細操作未検証|
|resonant-element-length|共通変更のみ|表示確認のみ・詳細操作未検証|
|rf-antipatterns|共通変更のみ|表示確認のみ・詳細操作未検証|
|rf-basic-link-calculator|個別UI変更あり|結果初期折りたたみ、STEP4展開・フォーカス、390px幅、実測アンカー1234.5m→1.2345kmの結果維持を操作確認・残り未検証|
|rf-learning-quest|共通変更のみ|表示確認のみ・詳細操作未検証|
|shadowing-margin|共通変更のみ|表示確認のみ・詳細操作未検証|
|simple-link-budget|個別UI変更あり|1440/390表示、周波数空欄、距離0、追加損失-1、送信電力/利得/追加損失の有効な0、1km→1000mの結果維持を操作確認・残り未検証|
|small-antenna-limit|共通変更のみ|表示確認のみ・詳細操作未検証|
|small-loop-resonance|共通変更のみ|表示確認のみ・詳細操作未検証|
|spectrum-use-atlas|個別不具合修正あり|入門表示、用途切替、開発/Pages console 0件を確認・残り未検証|
|vswr-bandwidth-q|共通変更のみ|表示確認のみ・詳細操作未検証|
|vswr-return-loss|個別UI変更あり|1440/390表示、空欄・VSWR 0・反射損失0dB境界・負数を操作確認・残り未検証|
|wall-penetration|共通変更のみ|表示確認のみ・詳細操作未検証|

トップと検索は別途目的入口/キーボード検索を検証。比較の保存/復元、JSON書出し、貼付とOSファイル選択経由の読込は確認済み。削除とOS印刷完了は未検証。用途地図のReact418は公開版と修正前ローカルで再現し、修正版は開発/Pages静的版とも新規タブでconsole error/warning 0件。詳細はWORKLOG。
