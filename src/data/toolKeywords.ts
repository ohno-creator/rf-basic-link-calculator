/**
 * ツール検索の別名辞書（slug → 検索キーワード）。
 *
 * name / tagline に「含まれない」言い換え・英語名・略語・ひらがな読み・困りごと語を
 * 登録し、検索の取りこぼし（例:「技適」「fresnel」「パスロス」で0件）を防ぐ。
 * name / tagline 自体は検索側（src/lib/toolSearch.ts）が常に照合するため再掲不要。
 * キーの実在性は src/tests/toolSearch.test.ts がレジストリと突き合わせて検証する。
 */

export const toolKeywords: Record<string, string[]> = {
  // ── link ──
  "rf-basic-link-calculator": ["link budget", "回線設計", "リンク設計", "通信距離", "飛距離", "受信電力", "マージン", "エリア設計", "届かない", "飛ばない", "でんぱ"],
  "simple-link-budget": ["リンクバジェット", "link budget", "リンクマージン", "link margin", "受信感度", "簡易計算", "入門", "初心者", "届かない", "りんく"],
  "free-space-loss": ["伝搬損失", "パスロス", "経路損失", "距離減衰", "path loss", "free space", "通信距離", "飛距離", "届かない", "そんしつ", "じゆうくうかん"],
  "noise-floor": ["noise floor", "sensitivity", "NF", "雑音指数", "SNR", "熱雑音", "kTB", "LoRa", "最小受信電力", "届かない", "かんど", "ざつおん"],
  "eirp-compliance": ["技適", "電波法", "ARIB", "STD-T108", "等価等方輻射電力", "特定小電力", "登録局", "LoRa", "Wi-SUN", "サブギガ", "20mW", "ぎてき"],
  "rain-attenuation": ["rain attenuation", "ミリ波", "雨マージン", "酸素吸収", "水蒸気", "60GHz", "衛星通信", "FWA", "P.838", "雨で切れる", "あめ", "げんすい"],
  "shadowing-margin": ["shadowing", "フェージング", "対数正規", "log-normal", "標準偏差", "シグマ", "セルエッジ", "信頼率", "遮蔽", "途切れる", "まーじん"],
  "fresnel-zone": ["fresnel", "LOS", "障害物", "アンテナ高", "楕円体", "マイクロ波回線", "固定無線", "遮られる", "ふれねる"],
  "propagation-loss": ["パスロス", "path loss", "経路損失", "距離減衰", "奥村秦", "Okumura", "COST231", "2波モデル", "カバレッジ", "届かない", "でんぱん"],
  "ncu-below-ground": ["スマートメーター", "メーターボックス", "マンホール", "検針", "テレメトリ", "LPWA", "Wi-SUN", "埋設", "届かない", "ちか"],
  "nami-gate-window": ["ローカル5G", "Wi-Fi", "メタサーフェス", "Low-E", "ガラス透過", "屋内圏外", "電波弱い", "不感地帯", "圏外対策", "なみげーと"],
  "mismatch-range-impact": ["リターンロス", "return loss", "S11", "反射係数", "定在波比", "SWR", "インピーダンス", "mismatch loss", "飛ばない", "せいごう"],
  "desense": ["desense", "desensitization", "EMI", "妨害波", "自家中毒", "電源ノイズ", "高調波", "スプリアス", "繋がらない", "かんど"],
  "lte-signal-metrics": ["4G", "SINR", "電波強度", "dBm", "圏外", "受信レベル", "リソースブロック", "3GPP", "LTE-M", "アンテナピクト", "けんがい"],
  "wall-penetration": ["コンクリート", "鉄筋", "石膏ボード", "Low-Eガラス", "窓", "penetration", "屋内エリア", "ビル内", "届かない", "かべ", "とうか"],
  "diffraction-shadow": ["diffraction", "ナイフエッジ", "knife edge", "NLOS", "見通し外", "遮蔽損失", "障害物", "P.526", "届かない", "かいせつ"],
  // ── antenna ──
  "polarization-loss": ["polarization", "PLF", "円偏波", "直線偏波", "垂直偏波", "水平偏波", "交差偏波", "クロスポール", "軸比", "へんぱ", "RFID", "読めない"],
  "effective-aperture": ["aperture", "Ae", "effective area", "実効面積", "実効開口", "アンテナ面積", "捕捉面積", "dBi", "かいこう", "受け口"],
  "aperture-gain-beamwidth": ["パラボラ", "ホーン", "レンズアンテナ", "HPBW", "半値角", "半値幅", "指向性", "開口径", "dish", "horn", "beamwidth", "りとく"],
  "antenna-spacing": ["MIMO", "ダイバーシティ", "アレイ", "素子間隔", "半波長", "0.5λ", "spacing", "相互結合", "離隔", "かんかく", "はちょう", "近すぎ"],
  "patch-antenna-dimensions": ["マイクロストリップ", "microstrip", "patch", "平面アンテナ", "プリントアンテナ", "比誘電率", "誘電率", "εr", "矩形", "アンテナ設計", "すんぽう", "ゆうでんりつ"],
  "diversity-gain": ["diversity", "ECC", "選択合成", "フェージング", "レイリー", "アウテージ", "outage", "相関係数", "MIMO", "受信断", "途切れる", "りとく"],
  "antenna-isolation": ["isolation", "coupling", "結合", "相互結合", "カップリング", "干渉", "共存", "デセンス", "分離度", "Sパラメータ", "けつごう", "MIMO"],
  "vswr-bandwidth-q": ["Q値", "Q factor", "比帯域", "FBW", "bandwidth", "リターンロス", "定在波比", "SWR", "整合", "Chu限界", "狭い", "たいいき"],
  "pointing-margin": ["pointing", "HPBW", "半値角", "アライメント", "方向調整", "施工誤差", "追尾", "ビーム幅", "利得低下", "ミリ波", "FWA", "しこうごさ"],
  "metal-plane-effect": ["イメージ理論", "鏡像", "reflector", "反射板", "リフレクタ", "λ/4", "金属筐体", "ベタ付け", "飛ばない", "シャーシ", "取付距離", "きょうぞう"],
  "resonant-element-length": ["λ/4", "λ/2", "エレメント", "アンテナ長さ", "ホイップ", "whip", "dipole", "monopole", "短縮率", "波長", "何cm", "きょうしん"],
  "far-field-distance": ["far field", "near field", "フラウンホーファ", "近傍界", "2D²/λ", "電波暗室", "チャンバー", "CATR", "パターン測定", "アンテナ評価", "えんぽうかい"],
  "realized-gain": ["realized gain", "dBi", "dBd", "絶対利得", "相対利得", "動作利得", "directivity", "放射効率", "VSWR", "2.15dB", "カタログ値", "りとく"],
  // ── basics ──
  "spectrum-use-atlas": ["ISMバンド", "Sub-GHz", "サブギガ", "920MHz", "2.4GHz", "免許不要", "特定小電力", "周波数割当", "バンドプラン", "LoRa", "技適", "しゅうはすう"],
  "frequency-wavelength": ["wavelength", "frequency", "ラムダ", "半波長", "1/4波長", "ダイポール", "モノポール", "波長短縮", "誘電率", "アンテナ長", "小型化", "はちょう"],
  "radiation-efficiency-converter": ["アンテナ効率", "総合効率", "efficiency", "OTA", "TRP", "TIS", "デシベル", "内蔵アンテナ", "飛ばない", "届かない", "ほうしゃこうりつ"],
  "dbm-converter": ["ミリワット", "ワット", "dBW", "milliwatt", "power", "電力単位", "単位換算", "送信電力", "受信感度", "何ワット", "デシベルミリ", "でんりょく"],
  "db-feel": ["デシベル", "decibel", "対数", "log", "倍率", "何倍", "電力比", "利得", "減衰", "dB計算", "でしべる"],
  "db-family": ["デシベル", "単位", "使い分け", "換算", "アンテナ利得", "等方性", "アイソトロピック", "ダイポール", "2.15dB", "isotropic", "カタログ表記", "りとく"],
  "cellular-band-map": ["LTE", "NR", "プラチナバンド", "対応バンド", "n78", "Sub6", "ミリ波", "セルラー", "キャリア", "つながらない", "3GPP", "しゅうはすう"],
  "field-strength": ["V/m", "dBuV/m", "W/m2", "field strength", "power density", "電波防護指針", "電磁界", "曝露", "ERP", "EMC", "規制", "でんかいきょうど"],
  // ── line ──
  "vswr-return-loss": ["定在波比", "電圧定在波比", "SWR", "S11", "return loss", "反射係数", "ミスマッチ", "VNA", "ネットワークアナライザ", "ていざいはひ", "はんしゃ", "戻り電力"],
  "coaxial-cable-loss": ["挿入損失", "減衰量", "coax", "insertion loss", "attenuation", "フィーダー", "給電線", "ピグテール", "コネクタ", "延長", "どうじく", "げんすい"],
  "microstrip-line": ["特性インピーダンス", "50Ω", "microstrip", "MSL", "impedance", "パターン幅", "線幅", "マイター", "ビア", "PCB", "きばん", "せんろ"],
  "l-match": ["マッチング", "matching", "Lマッチ", "LC整合", "インピーダンス変換", "スミスチャート", "リアクタンス", "同調", "Q値", "インダクタ", "せいごう", "ずれる"],
  "electrical-length": ["速度係数", "VF", "波長短縮", "管内波長", "λg", "等長配線", "差動", "スキュー", "遅延", "phase", "でんきちょう", "いそう"],
  // ── implementation ──
  "ifa-initial-dimensions": ["PIFA", "inverted-F", "プリントアンテナ", "内蔵アンテナ", "実効誘電率", "波長短縮", "λ/4", "短絡ピン", "給電点", "モノポール", "ぎゃくえふ", "すんぽう"],
  "antenna-keepout": ["keepout", "keep-out", "clearance", "クリアランス", "禁止領域", "実装禁止", "アートワーク", "基板レイアウト", "チップアンテナ", "スペース不足", "きーぷあうと", "あきち"],
  "body-loss": ["body loss", "ファントム", "ウェアラブル", "スマートウォッチ", "頭部近接", "人体吸収", "感度低下", "届かない", "じんたい", "ぼでぃろす"],
  "detuning-estimator": ["detuning", "デチューン", "frequency shift", "周波数シフト", "誘電体", "プラスチック", "樹脂カバー", "VSWR", "飛ばない", "りちょう", "きょうたい"],
  "ground-plane-size": ["ground plane", "グランドプレーン", "グラウンド", "地板", "ベタGND", "鏡像", "モノポール", "チップアンテナ", "小型化", "飛ばない", "じばん", "ぐらんど"],
  "ota-implementation-loss": ["desense", "感度抑圧", "感度劣化", "自己干渉", "放射効率", "伝導測定", "CTIA", "認証試験", "でせんす", "かんど"],
  // ── system ──
  "lora-airtime": ["Time on Air", "エアタイム", "占有時間", "デューティ比", "拡散率", "ARIB", "T108", "特定小電力", "LPWA", "電波法", "技適", "ろら"],
  "battery-life": ["バッテリー", "battery", "電池持ち", "駆動時間", "消費電流", "mAh", "間欠動作", "スリープ", "IoT", "でんち", "じゅみょう", "持たない"],
  "gnss-cn0": ["GPS", "測位", "衛星", "QZSS", "みちびき", "LNA", "雑音指数", "NF", "受信感度", "dB-Hz", "そくい", "測位できない"],
  // ── learning ──
  "rf-learning-quest": ["クイズ", "問題集", "ドリル", "演習", "研修", "初心者", "入門", "quiz", "training", "ゲーム", "がくしゅう", "苦手"],
  "antenna-term-lab": ["用語集", "辞典", "glossary", "専門用語", "利得", "VSWR", "指向性", "入門", "初心者", "りとく", "意味", "わからない"],
  "radio-wave-intuition": ["電磁波", "無線", "基礎", "入門", "仕組み", "波長", "減衰", "偏波", "radio wave", "RF", "でんぱ", "届かない"],
  "patch-hpbw-explorer": ["HPBW", "ビーム幅", "半値幅", "beamwidth", "指向性", "放射パターン", "3dB", "カバレッジ", "照射範囲", "patch", "はんちかく", "ずれる"],
  "rf-antipatterns": ["失敗例", "落とし穴", "よくある間違い", "NG集", "注意点", "トラブル", "不具合", "pitfall", "飛ばない", "届かない", "ノウハウ", "しっぱい"],
  // ── research ──
  "array-grating-lobe": ["グレーティングローブ", "grating lobe", "フェーズドアレイ", "phased array", "アレイアンテナ", "素子間隔", "走査角", "サイドローブ", "ビーム走査", "半波長間隔", "ビーム割れ", "そし"],
  "small-loop-resonance": ["NFC", "RFID", "ループアンテナ", "コイルアンテナ", "インダクタンス", "13.56MHz", "loop antenna", "tuning capacitor", "キャパシタ", "チューニング", "きょうしん", "ずれる"],
  "radiation-resistance": ["radiation resistance", "antenna efficiency", "放射効率", "短縮アンテナ", "モノポール", "ダイポール", "損失抵抗", "ESA", "飛ばない", "届かない", "こうりつ", "ほうしゃ"],
  "small-antenna-limit": ["Chu限界", "チュー限界", "Chu limit", "Q値", "比帯域", "ka値", "ESA", "電気的小型アンテナ", "狭帯域", "帯域が狭い", "げんかい", "こがた"],
  "large-array-near-field": ["フラウンホーファー", "Fraunhofer", "フレネル", "Fresnel", "near field", "far field", "OTA", "電波暗室", "アンテナ測定", "測定距離", "CATR", "きんぼうかい"],
  "reflector-ris-size-effect": ["メタサーフェス", "IRS", "reflector", "リフレクター", "パッシブ中継", "不感地帯", "デッドスポット", "遮蔽", "回り込み", "届かない", "はんしゃ", "ミリ波"],
  "measurement-sampling": ["ドライブテスト", "drive test", "Lee基準", "リー窓", "サンプル数", "測定点数", "電界強度", "信頼区間", "シャドウイング", "ばらつき", "でんそく", "サイトサーベイ"],
};
