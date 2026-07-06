// 全ツールの単一レジストリ。ツールの追加・変更はこのファイルだけを編集する。
// 一覧表示(toolDirectory)・基本ツールのメタ(basicTools)はここから派生させる。

const SITE_TOOLS = "https://www.staf.co.jp/tools";

export type ToolCategoryId = "link" | "antenna" | "basics" | "line" | "learning" | "research";

export type ToolCategory = {
  id: ToolCategoryId;
  label: string;
  /** カテゴリ見出しに添える1〜2文の用途説明（何のための区画か）。 */
  description: string;
};

export const toolCategories: ToolCategory[] = [
  {
    "id": "link",
    "label": "リンク設計",
    "description": "通信が届くかどうかを、送受信電力・距離・損失から見積もる基本系。まずはここから。"
  },
  {
    "id": "antenna",
    "label": "アンテナ設計",
    "description": "アンテナの寸法・利得・配置を、波長と基板条件から実務的に概算するツール。"
  },
  {
    "id": "basics",
    "label": "単位・基礎",
    "description": "dB・dBm・波長など、他の計算結果を読む前に押さえる入口。無線に慣れていない方はここから。"
  },
  {
    "id": "line",
    "label": "線路・整合",
    "description": "ケーブル・基板配線・整合の損失と反射を扱う、ハードウェア寄りのツール。"
  },
  {
    "id": "learning",
    "label": "学習クエスト",
    "description": "用語から実測レビューまで、RF設計の判断を問題形式で身につける。"
  },
  {
    "id": "research",
    "label": "発展・設計限界",
    "description": "少し難しいテーマを、設計判断に使える形へほどく区画です。小型化、近距離の大型アレイ、反射面の効き方など、無理が出やすい条件を確認できます。"
  }
];

export type BasicToolMeta = {
  slug: string;
  /** カード・ページ見出し用の短いタイトル */
  title: string;
  /** SEOタイトル（layoutのtemplateで「｜スタッフ株式会社」が付く） */
  metaTitle: string;
  /** カード説明・meta description 兼用 */
  description: string;
  /** カードに出す代表式 */
  formula: string;
  /** 結果の本質を一言で */
  essenceLead: string;
  /** 初心者向けに、計算の目的・入力・結果の読み方を短く示す */
  beginnerGuide: {
    purpose: string;
    inputs: string;
    result: string;
  };
  /** 対象読者・用途の補足（任意）。定義とは分けて、見出し直下に淡色のノートで表示する。 */
  scopeNote?: string;
  canonical: string;
};

/** BasicToolMeta のうち、slug と canonical（slugから導出）を除いたページメタ本体。 */
type BasicToolFields = Omit<BasicToolMeta, "slug" | "canonical">;

/** 単一レジストリの1エントリ。basic を持つツールは BasicToolPageShell 用のメタも備える。 */
export type ToolEntry = {
  slug: string;
  /** 一覧カードに出す短い名称 */
  name: string;
  tagline: string;
  /** lucide アイコンのキー（表示側でコンポーネントに対応付け） */
  icon: string;
  category: ToolCategoryId;
  basic?: BasicToolFields;
};

export const tools: ToolEntry[] = [
  {
    "slug": "rf-basic-link-calculator",
    "name": "リンクバジェット診断",
    "tagline": "通信が届くかを総合的に判定",
    "icon": "gauge",
    "category": "link"
  },
  {
    "slug": "simple-link-budget",
    "name": "かんたんリンク計算",
    "tagline": "受信電力と通信余裕だけを見る",
    "icon": "calculator",
    "category": "link",
    "basic": {
      "title": "かんたんリンク計算",
      "metaTitle": "かんたんリンク計算ツール｜受信電力とリンクマージンを1行で確認",
      "description": "送信電力、アンテナ利得、自由空間損失、追加損失、受信感度だけで、受信電力とリンクマージンを計算します。RFリンクバジェットの足し引きを最小構成で確認できます。",
      "scopeNote": "リンクバジェットの考え方を最短で確認する入口です。壁・地面反射・筐体・実測補正まで分けたい場合は、総合版のリンクバジェット診断を使います。",
      "formula": "受信電力 = 送信電力 + 利得 − FSPL − 追加損失",
      "essenceLead": "dBmとdBは足し引きでき、受信電力が受信感度を何dB上回るかが通信余裕です。",
      "beginnerGuide": {
        "purpose": "通信が届きそうかを、受信電力と受信感度の差だけでまず確認します。",
        "inputs": "周波数、距離、送信電力、受信感度を入れます。分かる場合だけアンテナ利得や追加損失を足します。",
        "result": "リンク余裕が0dBを下回ると厳しく、10〜20dB以上あるほど設置ばらつきに強くなります。"
      }
    }
  },
  {
    "slug": "free-space-loss",
    "name": "自由空間損失（FSPL）",
    "tagline": "距離と周波数による基本損失",
    "icon": "waves",
    "category": "link",
    "basic": {
      "title": "自由空間損失（FSPL）",
      "metaTitle": "自由空間損失 FSPL 計算ツール｜距離と周波数による損失",
      "description": "障害物のない理想空間で、距離により電波が弱くなる量（自由空間損失）を計算します。距離2倍で約6dB増えることも確認できます。",
      "formula": "FSPL[dB] = 32.44 + 20log10(距離[km]) + 20log10(周波数[MHz])",
      "essenceLead": "距離が伸びるほど、また周波数が高いほど、自由空間損失は大きくなります。",
      "beginnerGuide": {
        "purpose": "障害物がない理想条件で、距離と周波数だけで電波がどれくらい弱くなるかを見ます。",
        "inputs": "使う周波数と通信距離を入れます。まず基本損失だけを知りたい時に使います。",
        "result": "この損失に、ケーブル損、アンテナ利得、環境損を足し引きして受信電力を見積もります。"
      }
    }
  },
  {
    "slug": "noise-floor",
    "name": "雑音床・受信感度",
    "tagline": "帯域幅とNFから感度を導出",
    "icon": "activity",
    "category": "link",
    "basic": {
      "title": "雑音床・受信感度の導出",
      "metaTitle": "雑音床・受信感度 計算ツール｜帯域幅・NF・所要SNRから導出",
      "description": "帯域幅・雑音指数（NF）・所要SNRから、熱雑音の床（ノイズフロア）と受信感度を計算します。LoRaのSF別感度も確認できます。",
      "formula": "感度[dBm] = -174 + 10log10(BW[Hz]) + NF[dB] + 所要SNR[dB]",
      "essenceLead": "受信感度は、-174dBm/Hzの熱雑音に帯域幅・NF・所要SNRを足しただけの物理量です。",
      "beginnerGuide": {
        "purpose": "データシートの受信感度が物理的に妥当か、自分の方式ならどこまで感度を狙えるかを確かめます。",
        "inputs": "帯域幅、受信機の雑音指数（NF）、復調に必要なSNRを入れます。LoRaはSF別プリセットで選べます。",
        "result": "雑音床と受信感度が出ます。リンクバジェット計算の「受信感度」入力の妥当性チェックに使えます。"
      }
    }
  },
  {
    "slug": "fresnel-zone",
    "name": "フレネルゾーン半径",
    "tagline": "見通しと必要クリアランス",
    "icon": "spline",
    "category": "link",
    "basic": {
      "title": "フレネルゾーン半径",
      "metaTitle": "フレネルゾーン半径計算ツール｜見通し・クリアランスの目安",
      "description": "周波数・距離・障害物位置から第1フレネルゾーン半径と60%クリアランスを計算します。経路の断面図で、どれだけ空けるべきかを確認できます。",
      "formula": "r1 = √( λ × d1 × d2 / (d1 + d2) )",
      "essenceLead": "電波は直線ではなく、楕円体の空間（フレネルゾーン）を通って伝わります。",
      "beginnerGuide": {
        "purpose": "見通し通信で、直線上だけでなく周囲の空間をどれくらい空ける必要があるかを確認します。",
        "inputs": "周波数、通信距離、障害物がある位置を入れます。屋外の見通し経路で特に役立ちます。",
        "result": "60%クリアランスを確保できない場合は、アンテナ高、設置場所、経路を見直します。"
      }
    }
  },
  {
    "slug": "propagation-loss",
    "name": "伝搬損失モデル比較",
    "tagline": "自由空間〜Hata系を一括比較",
    "icon": "building",
    "category": "link",
    "basic": {
      "title": "伝搬損失モデル比較",
      "metaTitle": "伝搬損失モデル比較ツール｜自由空間・2波・Log-distance・奥村-秦/COST231-Hata",
      "description": "自由空間損失、2波モデル、Log-distance、奥村-秦／COST 231-Hata を同じ条件で並べて比較できます。距離・周波数・アンテナ高を変えながら、2D断面図、距離カーブ、2波干渉の山谷を確認できます。",
      "formula": "FSPL = 32.44 + 20·log10(f) + 20·log10(d) ／ Hata = 69.55 + 26.16·log10(f) − …",
      "essenceLead": "同じ条件でも、選ぶモデルで伝搬損失の見積もりは大きく変わります。2波では直接波と反射波の干渉で局所的な山谷も出ます。",
      "beginnerGuide": {
        "purpose": "距離が伸びたときに電波がどれくらい弱くなるかを、複数の考え方で見比べます。",
        "inputs": "周波数、距離、アンテナ高、環境を入れます。屋外・市街地・反射の有無で結果が変わります。",
        "result": "モデル差が大きい場合は、現場に近いモデルを選び、実測や追加余裕を前提に判断します。"
      }
    }
  },
  {
    "slug": "ncu-below-ground",
    "name": "GL以下NCU・水道BOX診断",
    "tagline": "地下・BOX内端末の追加損失を分解",
    "icon": "box",
    "category": "link",
    "basic": {
      "title": "GL以下NCU・水道BOX診断",
      "metaTitle": "GL以下NCU・水道BOX通信診断｜地下・メーターボックス内端末の追加損失を評価",
      "description": "水道BOX、メーターボックス、マンホール、地下ピット内のNCU端末について、地上側伝搬と蓋・BOX・水分・アンテナ位置による追加損失を分けて、通信余裕をレンジで簡易評価します。",
      "formula": "受信電力 = 送信電力 + 利得 − 地上側伝搬損失 − BOX追加損失 ± 実測補正",
      "essenceLead": "GL以下の端末は、アンテナ高をマイナスにせず、蓋・BOX・水分・配置の追加損失として分けて評価します。",
      "beginnerGuide": {
        "purpose": "水道BOXやマンホール内の端末が、蓋・水分・地下配置でどれくらい不利になるかを見積もります。",
        "inputs": "BOX種類、蓋の材質、湿り具合、地上側距離、アンテナ位置を選びます。",
        "result": "通信余裕が小さい場合は、アンテナ位置、蓋条件、中継、地上側設備の見直しを検討します。"
      }
    }
  },
  {
    "slug": "nami-gate-window",
    "name": "ナミゲート 室内受信電力シミュレーター",
    "tagline": "窓設置30cm角・室内分布をOFF/ON/差分で可視化",
    "icon": "window",
    "category": "link",
    "basic": {
      "title": "ナミゲート 室内受信電力シミュレーター",
      "metaTitle": "ナミゲート室内受信電力シミュレーター｜窓設置30cm角・OFF/ON/差分ヒートマップ",
      "description": "ローカル5G／Wi-Fi 5GHzで、窓面に30cm×30cmのナミゲートを設置した場合の室内受信電力分布を、設置なし（OFF）／設置あり（ON）／改善量（差分）のヒートマップで概算します。周波数・入射角・ガラス種類・送信電力・室内寸法を変えて、設置前後の改善傾向と営業判定を確認できる商用デモ用ツールです。",
      "scopeNote": "室内を格子状に区切り、入射角・ガラス透過損失・ナミゲート利得から設置前後の受信電力分布を概算する営業提案ツールです。利得テーブル・補正係数は暫定値（実測値差し替え前提）で、色は固定dBmスケールの相対比較・絶対値は未校正、反射・什器・人体・実機指向性は含みません。設計判断には実測と追加余裕を前提にしてください。",
      "formula": "各セルの受信電力 = 送信電力 − 屋外損失 − ガラス損失 − 入射角損失 − 屋内スプレッド損失 ＋ ナミゲート利得 ＋ 指向性補正",
      "essenceLead": "窓面のナミゲートが透過損失を補い、室内の受信電力分布（OFF→ON）と改善量を面で可視化します。",
      "beginnerGuide": {
        "purpose": "窓際に30cm角のナミゲートを設置すると、室内のどこがどれだけ改善しそうかを面で概算します。",
        "inputs": "周波数・入射角・ガラス種類・送信電力・屋外距離・室内寸法を入れます。",
        "result": "OFF/ON/差分のヒートマップと、平均受信電力・平均改善量・営業判定を読み取ります（概算）。"
      }
    }
  },
  {
    "slug": "rf-learning-quest",
    "name": "RF学習クエスト",
    "tagline": "1000問のアンテナ設計RPG",
    "icon": "book",
    "category": "learning"
  },
  {
    "slug": "frequency-wavelength",
    "name": "周波数・波長",
    "tagline": "波長とアンテナのサイズ感",
    "icon": "radio",
    "category": "basics",
    "basic": {
      "title": "周波数・波長",
      "metaTitle": "周波数・波長 計算ツール｜λ・λ/2・λ/4 とアンテナサイズ",
      "description": "周波数から波長 λ、λ/2、λ/4、λ/8 を計算します。半波長アンテナの目安や、誘電率による波長短縮も図で確認できます。",
      "formula": "λ[m] = 299,792,458 / 周波数[Hz]",
      "essenceLead": "周波数が高いほど波長は短くなり、アンテナも小さくできます。",
      "beginnerGuide": {
        "purpose": "周波数から波長を出し、アンテナ長やアンテナ間隔のサイズ感をつかみます。",
        "inputs": "使う周波数を入れます。基板上や材料中で考える場合は誘電率も確認します。",
        "result": "λ/2やλ/4を、アンテナ長、配置間隔、基板配線の最初の目安にします。"
      }
    }
  },
  {
    "slug": "dbm-converter",
    "name": "dBm 変換",
    "tagline": "dBm / mW / W を相互変換",
    "icon": "repeat",
    "category": "basics",
    "basic": {
      "title": "dBm 変換",
      "metaTitle": "dBm / mW / W 変換ツール｜電力単位の相互変換",
      "description": "dBm、mW、W のいずれか1つを入力すると、他の単位へ自動変換します。+10dBで10倍などのdBの感覚もデシベルスケールで確認できます。",
      "formula": "mW = 10 ^ (dBm / 10)",
      "essenceLead": "dBmは電力そのもの、dBは比率。リンクバジェットは足し引きで扱います。",
      "beginnerGuide": {
        "purpose": "送信電力や受信感度を、dBm・mW・Wのどの単位でも同じ意味として読めるようにします。",
        "inputs": "分かっている電力値を1つ入れます。機器仕様書ではdBm表記がよく出ます。",
        "result": "リンクバジェットではdBmにそろえ、損失や利得はdBとして足し引きします。"
      }
    }
  },
  {
    "slug": "db-feel",
    "name": "dBを体感する",
    "tagline": "+3dBで2倍・+6dBで距離2倍",
    "icon": "ruler",
    "category": "basics",
    "basic": {
      "title": "dBを体感する",
      "metaTitle": "dBを体感する｜+3dBで2倍・+6dBで距離2倍を直感理解",
      "description": "dBは掛け算を足し算にするものさし。スライダーでdB→電力倍率・距離倍率を体感し、+3dBで約2倍・+6dBで距離2倍を直感的に理解できます。",
      "formula": "電力倍率 = 10^(dB/10)　距離倍率 = 10^(dB/20)",
      "essenceLead": "10倍ごとに+10dB。dBは掛け算を足し算にする『ものさし』です。",
      "beginnerGuide": {
        "purpose": "dBが何倍・何分の1を表すのかを体感し、他の計算結果を読みやすくします。",
        "inputs": "dBスライダーを動かします。プラスなら増える、マイナスなら減ると見ます。",
        "result": "+3dBで約2倍、+10dBで10倍、距離2倍で約6dB増える感覚を他ツールの読み取りに使います。"
      }
    }
  },
  {
    "slug": "vswr-return-loss",
    "name": "VSWR・リターンロス",
    "tagline": "整合の良し悪しを見る",
    "icon": "activity",
    "category": "line",
    "basic": {
      "title": "VSWR・リターンロス変換",
      "metaTitle": "VSWR・リターンロス変換ツール｜反射係数・反射電力も計算",
      "description": "VSWR、リターンロス、反射係数、反射電力を相互変換します。アンテナや伝送線路の整合の良し悪しを、定在波の図で直感的に確認できます。",
      "formula": "VSWR = (1 + Γ) / (1 - Γ)",
      "essenceLead": "整合が悪いほど、反射波が増えて定在波の山と谷が深くなります。",
      "beginnerGuide": {
        "purpose": "アンテナやケーブルの整合が悪く、送信した電力が戻ってきていないかを確認します。",
        "inputs": "VSWR、リターンロス、反射係数など、分かっている値を1つ入れます。",
        "result": "反射電力が大きいほど、アンテナ調整、コネクタ、ケーブル、整合回路を見直します。"
      }
    }
  },
  {
    "slug": "coaxial-cable-loss",
    "name": "同軸ケーブル損失",
    "tagline": "標準品の実測ロスを品番×周波数で",
    "icon": "cable",
    "category": "line",
    "basic": {
      "title": "同軸ケーブル損失",
      "metaTitle": "同軸ケーブル損失 計算ツール｜標準品の実測ロスを品番×周波数で",
      "description": "標準品（変換・延長用）の同軸ケーブルについて、品番と周波数から1本あたりの挿入損失（実測値）を求めます。求めた合計を、リンクバジェットの「ケーブル・コネクタ損失」に入れて使えます。",
      "formula": "合計損失[dB] = 1本あたり損失（実測の補間値） × 本数",
      "essenceLead": "標準品の実測ロスを品番×周波数で。高周波ほど、本数が増えるほど損失は増えます。",
      "beginnerGuide": {
        "purpose": "ケーブルや変換アダプタで何dB失うかを見積もり、通信余裕から差し引く損失を決めます。",
        "inputs": "使う標準品、周波数、本数を選びます。実機に近い組み合わせから始めるのがコツです。",
        "result": "合計損失を、リンクバジェットのケーブル・コネクタ損失に入れて使います。"
      }
    }
  },
  {
    "slug": "microstrip-line",
    "name": "マイクロストリップ線路",
    "tagline": "基板配線の Z0 と曲げ設計",
    "icon": "circuit",
    "category": "line",
    "basic": {
      "title": "マイクロストリップ線路",
      "metaTitle": "マイクロストリップ線路シミュレーション｜特性インピーダンス・マイター曲げ設計",
      "description": "基板上のマイクロストリップ線路の特性インピーダンス・実効比誘電率・電気長（λg・Vp・度）を計算し、曲げ（マイター）やグラウンドのスルーホール（ビア）ピッチの設計目安まで提案します。断面図・上面図つき。",
      "formula": "Z0・εeff・λg＝f(W,h,εr,周波数)　ビアピッチ≈λg/10",
      "essenceLead": "Z0と電気長はW・h・εr・周波数で決まり、ビアはλgの数分の1以下のピッチで打ちます。",
      "beginnerGuide": {
        "purpose": "基板上のRF配線を、50Ωなど狙った特性インピーダンスに近づける初期寸法を決めます。",
        "inputs": "基板厚、比誘電率、配線幅、周波数を入れます。基板メーカーの仕様値を使うと現実に近づきます。",
        "result": "Z0が目標から外れる場合は、配線幅や基板条件を調整します。ビアピッチや曲げも初期確認できます。"
      }
    }
  },
  {
    "slug": "effective-aperture",
    "name": "有効開口面積",
    "tagline": "利得を受信面積に換算",
    "icon": "aperture",
    "category": "antenna",
    "basic": {
      "title": "有効開口面積・受信面積",
      "metaTitle": "有効開口面積 計算ツール｜アンテナ利得dBiを受信面積へ換算",
      "description": "アンテナ利得dBiを「電波を受け取れる面積」に換算します。仕様書のdBiだけでは分かりにくい受信しやすさを、920MHz、Wi-Fi、Sub6などの周波数違いで比較できます。",
      "formula": "Ae = λ²G / (4π)",
      "essenceLead": "同じ利得でも、低い周波数ほど有効開口面積は大きくなります。",
      "beginnerGuide": {
        "purpose": "アンテナ利得dBiを、電波を拾う面積として説明しやすい形に変換します。",
        "inputs": "使う周波数と、仕様書にあるアンテナ利得dBiを入れます。",
        "result": "有効開口が大きいほど受け口が大きいと考え、周波数違いのアンテナサイズ感を比較します。"
      }
    }
  },
  {
    "slug": "aperture-gain-beamwidth",
    "name": "開口利得・ビーム幅",
    "tagline": "必要利得とビーム幅を確認",
    "icon": "satellite",
    "category": "antenna",
    "basic": {
      "title": "開口アンテナ利得・ビーム幅",
      "metaTitle": "開口アンテナ利得・ビーム幅 計算ツール｜ホーン・レンズ・パラボラの概算",
      "description": "ホーン、レンズ、パラボラなどの開口径から、必要な利得が出るか、ビームが細すぎないか、測定距離が足りるかを概算します。",
      "formula": "G = η(πD/λ)²　HPBW≈70λ/D",
      "essenceLead": "開口が大きいほど利得は上がり、ビームは細くなります。",
      "beginnerGuide": {
        "purpose": "ホーン、レンズ、パラボラなどの直径候補で、必要な強さとビーム幅になるかを確認します。",
        "inputs": "周波数、開口の直径、見込む効率を入れます。効率は迷ったら50〜70%で見ます。",
        "result": "利得が足りないなら大きくし、ビームが細すぎるなら取り付け誤差や測定距離を確認します。"
      }
    }
  },
  {
    "slug": "antenna-spacing",
    "name": "アンテナ間隔 λ換算",
    "tagline": "複数アンテナの離し方を判断",
    "icon": "scan",
    "category": "antenna",
    "basic": {
      "title": "アンテナ間隔 λ換算",
      "metaTitle": "アンテナ間隔 λ換算ツール｜MIMO・複数アンテナ配置の基準",
      "description": "複数アンテナを筐体や基板上で何cm離せばよいかを、波長に対する間隔で確認します。MIMO配置、近接結合、アレイ設計の初期判断に使えます。",
      "formula": "間隔[λ] = 物理間隔[m] / λ[m]",
      "essenceLead": "アンテナ間隔はcmではなく、まずλで見ます。",
      "beginnerGuide": {
        "purpose": "複数アンテナを、近すぎず広すぎず置けているかを波長基準で確認します。",
        "inputs": "使う周波数と、実際に置けるアンテナ間隔を入れます。",
        "result": "0.5λ前後はよく使われる目安です。近すぎる場合は結合、広すぎる場合は不要ビームに注意します。"
      }
    }
  },
  {
    "slug": "array-grating-lobe",
    "name": "不要ビーム判定",
    "tagline": "狙っていない方向に強く出ないか確認",
    "icon": "radar",
    "category": "research",
    "basic": {
      "title": "不要ビーム判定（アレイ間隔）",
      "metaTitle": "不要ビーム判定ツール｜アレイアンテナの間隔と走査角",
      "description": "アレイアンテナ／フェーズドアレイで、アンテナ素子の間隔が広すぎると現れる不要な強いビーム「グレーティングローブ」が出る条件を確認する計算ツールです。狙った方向のほかに電波の山ができてしまうかを、周波数・素子間隔・走査角から判定します。",
      "scopeNote": "一般的なIoT端末の2本アンテナMIMOというより、ビームを作って方向を振るアレイアンテナ／フェーズドアレイの初期検討に使います。",
      "formula": "|sinθ0 + mλ/d| ≤ 1",
      "essenceLead": "狙った方向以外にも強いビームが出るかどうかを、間隔と向きから確認します。",
      "beginnerGuide": {
        "purpose": "複数の素子でビームを作るとき、狙った方向以外にも強いグレーティングローブが出ないかを確認します。",
        "inputs": "周波数、素子同士の間隔、ビームを向けたい方向（走査角）を入れます。",
        "result": "不要ビームが出る可能性ありなら、素子間隔を狭めるか、振る角度を小さくします。"
      }
    }
  },
  {
    "slug": "patch-antenna-dimensions",
    "name": "パッチアンテナ寸法",
    "tagline": "基板CADの初期寸法を決める",
    "icon": "panel",
    "category": "antenna",
    "basic": {
      "title": "矩形パッチアンテナ寸法",
      "metaTitle": "矩形パッチアンテナ寸法計算ツール｜周波数・基板εr・厚みから概算",
      "description": "基板上に作る四角いパッチアンテナの最初のCAD寸法を決めるため、中心周波数、比誘電率、基板厚から幅と長さを概算します。",
      "formula": "W = c/(2f)√(2/(εr+1))　L = c/(2f√εeff) − 2ΔL",
      "essenceLead": "パッチは基板上の実効波長で決まるため、自由空間のλ/2より短くなります。",
      "beginnerGuide": {
        "purpose": "基板に描くパッチアンテナの、最初の幅と長さを決めます。",
        "inputs": "狙う周波数、基板の比誘電率、基板厚を入れます。",
        "result": "出た寸法をCADやEMシミュレーションの出発点にし、給電位置やGND条件で追い込みます。"
      }
    }
  },
  {
    "slug": "small-loop-resonance",
    "name": "小型ループ共振",
    "tagline": "同調コンデンサ容量を決める",
    "icon": "refresh",
    "category": "research",
    "basic": {
      "title": "小型ループアンテナ共振",
      "metaTitle": "小型ループアンテナ共振計算ツール｜インダクタンスと必要容量",
      "description": "NFCやRFIDなどの小さなループを狙った周波数に合わせるため、ループ形状からインダクタンスと必要な同調コンデンサ容量を概算します。",
      "formula": "L≈μ0N²r(ln(8r/a)-2)　C=1/((2πf)²L)",
      "essenceLead": "小型ループは同調容量に敏感で、共振させるほど帯域とばらつきに注意が必要です。",
      "beginnerGuide": {
        "purpose": "小さなループを狙った周波数に合わせるため、載せるコンデンサ容量の目安を出します。",
        "inputs": "狙う周波数、ループ直径、導体の太さ、巻数を入れます。",
        "result": "必要容量が極端なら、コンデンサだけでなくループ径や巻数を見直します。"
      }
    }
  },
  {
    "slug": "radiation-resistance",
    "name": "放射抵抗・効率",
    "tagline": "短いアンテナの飛びにくさを確認",
    "icon": "antenna",
    "category": "research",
    "basic": {
      "title": "短縮アンテナ放射抵抗・効率",
      "metaTitle": "短縮アンテナ放射抵抗・効率計算ツール｜短いモノポール/ダイポールの厳しさ",
      "description": "短いアンテナが、整合しているのに飛びにくい理由を確認します。アンテナ長と損失抵抗から、電波として外へ出る割合の目安を計算します。",
      "formula": "Rr≈40π²(h/λ)² または 20π²(l/λ)²",
      "essenceLead": "短いアンテナは放射抵抗が小さく、わずかな損失抵抗でも効率が下がります。",
      "beginnerGuide": {
        "purpose": "短いアンテナが、整合しているのに飛びにくい理由を効率の面から確認します。",
        "inputs": "使う周波数、アンテナ長、コイルやGNDなどの損失抵抗を入れます。",
        "result": "外へ出る割合が低い場合は、アンテナを長くする、損失を減らす、GNDや筐体を見直します。"
      }
    }
  },
  {
    "slug": "small-antenna-limit",
    "name": "小型アンテナ限界",
    "tagline": "筐体サイズで帯域が足りるか確認",
    "icon": "orbit",
    "category": "research",
    "basic": {
      "title": "小型アンテナ限界（ka・Q・帯域）",
      "metaTitle": "小型アンテナ限界計算ツール｜ka・Chu限界Q・比帯域",
      "description": "その筐体サイズで必要なアンテナ帯域を狙えるかを、物理限界の目安から確認します。小さすぎて無理筋な要求かどうかの初期判断に使います。",
      "formula": "ka = 2πa/λ　Qmin≈1/(ka)³+1/(ka)",
      "essenceLead": "小さくするほどQが上がり、帯域は急に狭くなります。",
      "beginnerGuide": {
        "purpose": "その筐体サイズで、必要な帯域のアンテナを作るのが現実的かを確認します。",
        "inputs": "使う周波数、アンテナに使える半径、必要な帯域を入れます。",
        "result": "必要帯域が目安を超える場合は、アンテナスペース拡大や複共振化などを検討します。"
      }
    }
  },
  {
    "slug": "large-array-near-field",
    "name": "大型アレイ近傍界",
    "tagline": "遠方界扱いでよいか確認",
    "icon": "grid",
    "category": "research",
    "basic": {
      "title": "大型アレイ近傍界・遠方界判定",
      "metaTitle": "大型アレイ近傍界判定ツール｜Fraunhofer距離とFresnel数",
      "description": "大型アレイや高周波アンテナを、相手や測定点から見て遠方界として扱ってよいかを確認します。測定距離、ビーム設計、近傍界補正の判断に使えます。",
      "formula": "Rff = 2D²/λ　F = D²/(λR)",
      "essenceLead": "5G/6Gや大型開口では、遠方界の前提が想像以上に遠くなります。",
      "beginnerGuide": {
        "purpose": "大型アレイや高周波アンテナを、遠方界として扱ってよい距離かを確認します。",
        "inputs": "周波数、アンテナ面の一番大きい幅、相手や測定点までの距離を入れます。",
        "result": "要注意なら、測定距離、近傍界補正、距離方向の焦点を確認します。"
      }
    }
  },
  {
    "slug": "reflector-ris-size-effect",
    "name": "反射板・RISサイズ効果",
    "tagline": "反射面を置く効果を見積もる",
    "icon": "mirror",
    "category": "research",
    "basic": {
      "title": "反射板・RISサイズ効果",
      "metaTitle": "反射板・RISサイズ効果計算ツール｜面積・距離・波長による概算",
      "description": "反射板やRISを置いたときに、そもそも効きそうな面積・距離かを概算します。面を大きくする効果と、2ホップ経路の損失を同時に確認できます。",
      "formula": "Gsurface≈4πAη/λ²　L2hop≈max(FSPL(d1)+FSPL(d2)-2·Gsurface, FSPL(d1+d2))",
      "essenceLead": "反射面は面積、距離、波長、近傍/遠方界で効き方が変わります。",
      "beginnerGuide": {
        "purpose": "反射板やRISを置いて、効きそうな面積と距離条件かを概算します。",
        "inputs": "周波数、反射面の幅と高さ、送信側・受信側までの距離、見込む効率を入れます。",
        "result": "反射経路が厳しい場合は、面積を増やす、距離を短くする、設置角度や方式を見直します。"
      }
    }
  }
];

// ── 派生ビュー（後方互換） ──

export type DirectoryTool = {
  href: string;
  name: string;
  tagline: string;
  icon: string;
  category: string;
};

export const toolDirectory: DirectoryTool[] = tools.map((tool) => ({
  href: `/tools/${tool.slug}`,
  name: tool.name,
  tagline: tool.tagline,
  icon: tool.icon,
  category: tool.category
}));

export const basicTools: BasicToolMeta[] = tools
  .filter((tool): tool is ToolEntry & { basic: BasicToolFields } => Boolean(tool.basic))
  .map((tool) => ({
    slug: tool.slug,
    ...tool.basic,
    canonical: `${SITE_TOOLS}/${tool.slug}`
  }));

export function getBasicTool(slug: string): BasicToolMeta | undefined {
  return basicTools.find((tool) => tool.slug === slug);
}
