export type QuestModeId = "beginner" | "apprentice" | "practitioner" | "expert" | "researcher";

export type QuestMode = {
  id: QuestModeId;
  label: string;
  title: string;
  description: string;
  badge: string;
};

export type QuestSource = {
  label: string;
  href: string;
};

export type QuestLesson = {
  id: string;
  mode: QuestModeId;
  stage: number;
  title: string;
  enemy: string;
  reward: string;
  question: string;
  choices: string[];
  correctIndex: number;
  immediateAnswer: string;
  explanation: string;
  appLink: {
    href: string;
    label: string;
  };
  column: string;
  sources?: QuestSource[];
};

const toolLinks = {
  calculator: { href: "/tools/rf-basic-link-calculator", label: "リンクバジェット診断を開く" },
  dbFeel: { href: "/tools/db-feel", label: "dBを体感する" },
  dbm: { href: "/tools/dbm-converter", label: "dBm変換を試す" },
  fspl: { href: "/tools/free-space-loss", label: "自由空間損失を試す" },
  propagation: { href: "/tools/propagation-loss", label: "伝搬損失モデル比較を開く" },
  fresnel: { href: "/tools/fresnel-zone", label: "フレネルゾーンを確認する" },
  wavelength: { href: "/tools/frequency-wavelength", label: "周波数・波長を見る" }
} as const;

const sources = {
  loraDataset2025: {
    label: "2025 Indoor LoRaWAN environmental dataset",
    href: "https://arxiv.org/abs/2505.06375"
  },
  envAware2025: {
    label: "2025 Environment-aware LoRaWAN fade margins",
    href: "https://arxiv.org/abs/2510.04346"
  },
  envKal2025: {
    label: "2025 EnviKal-Loc",
    href: "https://arxiv.org/abs/2505.01185"
  },
  aerpaw2026: {
    label: "2026 AERPAW LoRaWAN field measurements",
    href: "https://arxiv.org/abs/2604.06444"
  },
  p1812Geo2025: {
    label: "2025 ITU-R P.1812-7 geospatial inputs",
    href: "https://arxiv.org/abs/2501.11708"
  },
  rel19: {
    label: "2025 3GPP Rel-19 TR 38.901 overview",
    href: "https://arxiv.org/abs/2507.19266"
  }
} as const;

function lesson(lessonInput: QuestLesson): QuestLesson {
  return lessonInput;
}

export const questModes: QuestMode[] = [
  {
    id: "beginner",
    label: "初心者モード",
    title: "dBと距離の城下町",
    description: "dB、dBm、周波数、距離、受信感度など、リンク計算の入口を固めます。",
    badge: "Lv.1-10"
  },
  {
    id: "apprentice",
    label: "見習いモード",
    title: "反射と近傍損失の洞窟",
    description: "2波、フレネル、端末近傍損失、実測補正の基本を扱います。",
    badge: "Lv.11-20"
  },
  {
    id: "practitioner",
    label: "実務者モード",
    title: "モデル選択の砦",
    description: "通信形態ごとのモデル選択、Hata系の適用範囲、信頼率評価を確認します。",
    badge: "Lv.21-30"
  },
  {
    id: "expert",
    label: "玄人モード",
    title: "基地局設計の迷宮",
    description: "SUI、COST231 WI、3GPP、GIS、複数実測点など、設計実務寄りの判断を学びます。",
    badge: "Lv.31-40"
  },
  {
    id: "researcher",
    label: "研究者モード",
    title: "最新研究の塔",
    description: "2025〜2026年の測定研究、環境特徴量、残差分布、Rel-19の論点を織り込みます。",
    badge: "Lv.41-50"
  }
];

export const rfQuestLessons: QuestLesson[] = [
  lesson({
    id: "beginner-db-3db",
    mode: "beginner",
    stage: 1,
    title: "dBのものさし",
    enemy: "dBゼリー",
    reward: "電力倍率の勘",
    question: "+3dBは、電力で見るとおおよそ何倍ですか？",
    choices: ["約1.2倍", "約2倍", "約10倍"],
    correctIndex: 1,
    immediateAnswer: "+3dBは電力で約2倍です。",
    explanation:
      "dBは倍率を足し算で扱うための単位です。+10dBで10倍、+3dBで約2倍、-3dBで約半分と覚えるとリンクバジェットの足し引きが読みやすくなります。",
    appLink: toolLinks.dbFeel,
    column:
      "リンクバジェットは、送信電力、アンテナ利得、損失、補正値をdB系で足し引きします。最初の武器は、+3dB、+6dB、+10dBの感覚です。"
  }),
  lesson({
    id: "beginner-dbm-zero",
    mode: "beginner",
    stage: 2,
    title: "dBmの巻物",
    enemy: "単位の番人",
    reward: "dBm/mW変換",
    question: "0dBmは何mWですか？",
    choices: ["0mW", "1mW", "10mW"],
    correctIndex: 1,
    immediateAnswer: "0dBmは1mWです。",
    explanation:
      "dBmは1mWを0dBmとする絶対電力です。10dBmは10mW、20dBmは100mW、30dBmは1Wです。",
    appLink: toolLinks.dbm,
    column:
      "dBは比率、dBmは絶対電力、dBiはアンテナ利得です。似た名前ですが、リンク計算では役割が違います。"
  }),
  lesson({
    id: "beginner-fspl-double-distance",
    mode: "beginner",
    stage: 3,
    title: "距離2倍の試練",
    enemy: "距離の壁",
    reward: "FSPLの感覚",
    question: "自由空間損失では、距離が2倍になると損失はおおよそどう変わりますか？",
    choices: ["約3dB増える", "約6dB増える", "約20dB増える"],
    correctIndex: 1,
    immediateAnswer: "距離2倍で自由空間損失は約6dB増えます。",
    explanation:
      "FSPLは距離に対して20log10(d)で増えます。2倍なら20log10(2)≒6dBです。これは見通し条件の基準で、実環境では遮蔽や反射がさらに乗ります。",
    appLink: toolLinks.fspl,
    column:
      "セル半径を倍に伸ばすには、単純なFSPLだけでも約6dBの余裕が必要です。現場では建物、地形、人体、筐体も加わります。"
  }),
  lesson({
    id: "beginner-frequency-loss",
    mode: "beginner",
    stage: 4,
    title: "周波数の塔",
    enemy: "高周波の影",
    reward: "周波数と損失",
    question: "同じ距離なら、自由空間損失が大きくなりやすいのはどちらですか？",
    choices: ["920MHz", "2.4GHz", "周波数では変わらない"],
    correctIndex: 1,
    immediateAnswer: "同じ距離なら、2.4GHzのほうが自由空間損失は大きくなります。",
    explanation:
      "FSPLには20log10(f)が入ります。周波数が高いほど波長は短くなり、同じ距離での基本損失は増えます。",
    appLink: toolLinks.wavelength,
    column:
      "低い周波数は回り込みやすい一方、アンテナが大きくなりがちです。高い周波数はアンテナを小さくしやすい一方、遮蔽や損失に注意します。"
  }),
  lesson({
    id: "beginner-antenna-gain",
    mode: "beginner",
    stage: 5,
    title: "アンテナ利得の剣",
    enemy: "向きの試練",
    reward: "dBiの意味",
    question: "送信アンテナ利得を+3dB上げると、リンクバジェット上では何が起きますか？",
    choices: ["受信電力が約3dB増える", "周波数が半分になる", "受信感度が悪くなる"],
    correctIndex: 0,
    immediateAnswer: "リンクバジェット上では受信電力が約3dB増えます。",
    explanation:
      "アンテナ利得は送信側・受信側ともリンクバジェットに足し算します。ただし実アンテナでは向き、偏波、筐体、近傍金属で利得が変わります。",
    appLink: toolLinks.calculator,
    column:
      "利得は魔法の増幅ではなく、空間のどの方向へ電力を配るかの性質です。指向性が強いアンテナは向きのずれにも敏感になります。"
  }),
  lesson({
    id: "beginner-sensitivity",
    mode: "beginner",
    stage: 6,
    title: "受信感度の盾",
    enemy: "微弱信号の門",
    reward: "合格ラインの読み方",
    question: "受信感度として、より弱い電波まで受けられるのはどちらですか？",
    choices: ["-80dBm", "-120dBm", "0dBm"],
    correctIndex: 1,
    immediateAnswer: "-120dBmのほうが、より弱い電波まで受けられます。",
    explanation:
      "dBmは値が小さいほど弱い電力です。受信感度が-120dBmなら、-80dBmよりかなり弱い信号でも受信できる可能性があります。",
    appLink: toolLinks.calculator,
    column:
      "受信感度は変調方式、帯域幅、データレート、必要な品質で変わります。仕様書の条件と、実際の運用条件が一致しているか確認します。"
  }),
  lesson({
    id: "beginner-margin",
    mode: "beginner",
    stage: 7,
    title: "リンクマージンの宝箱",
    enemy: "0dBの境界",
    reward: "判定結果の読み方",
    question: "リンクマージンは何と何の差ですか？",
    choices: ["受信電力 - 受信感度", "周波数 - 距離", "送信高 - 受信高"],
    correctIndex: 0,
    immediateAnswer: "リンクマージンは、受信電力から受信感度を引いた値です。",
    explanation:
      "受信電力が受信感度を上回るほど余裕があります。0dB未満なら感度を下回るため、通信困難と判断します。",
    appLink: toolLinks.calculator,
    column:
      "20dB以上なら安定、10dB以上なら良好、3dB以上なら条件付き、0〜3dBなら不安定、0dB未満なら通信困難という目安で読みます。"
  }),
  lesson({
    id: "beginner-cable-loss",
    mode: "beginner",
    stage: 8,
    title: "ケーブル損失の落とし穴",
    enemy: "同軸の迷路",
    reward: "損失の足し引き",
    question: "ケーブル・コネクタ損失はリンクバジェットでどう扱いますか？",
    choices: ["受信電力から引く", "受信電力に足す", "距離をゼロにする"],
    correctIndex: 0,
    immediateAnswer: "ケーブル・コネクタ損失は受信電力から引きます。",
    explanation:
      "送信機からアンテナまで、またはアンテナから受信機までの経路で失われる電力なので、リンクバジェットでは損失として引きます。",
    appLink: toolLinks.calculator,
    column:
      "高周波ほどケーブル損失は増えやすく、細いケーブルや変換コネクタの多用も効きます。実機の構成に合わせて入れます。"
  }),
  lesson({
    id: "beginner-wavelength",
    mode: "beginner",
    stage: 9,
    title: "波長の地図",
    enemy: "サイズの幻",
    reward: "アンテナ寸法の目安",
    question: "同じ空気中なら、波長が短いのはどちらですか？",
    choices: ["920MHz", "2.4GHz", "同じ"],
    correctIndex: 1,
    immediateAnswer: "2.4GHzのほうが波長は短くなります。",
    explanation:
      "波長は光速を周波数で割った値です。周波数が高いほど波長は短くなり、アンテナの基準寸法も小さくなります。",
    appLink: toolLinks.wavelength,
    column:
      "内蔵アンテナでは、波長だけでなく基板GND、筐体、人体、金属部品が共振や効率に影響します。"
  }),
  lesson({
    id: "beginner-preset",
    mode: "beginner",
    stage: 10,
    title: "最初のプリセット",
    enemy: "空欄の迷い",
    reward: "診断の始め方",
    question: "初めてリンクバジェットを見るとき、まず何を使うと理解しやすいですか？",
    choices: ["近い用途のプリセット", "全欄を空にする", "警告を隠す"],
    correctIndex: 0,
    immediateAnswer: "まず近い用途のプリセットから始めると全体像をつかみやすくなります。",
    explanation:
      "プリセットで初期条件を入れてから、距離、周波数、損失、受信感度を1つずつ変えると、どの入力が効くか見やすくなります。",
    appLink: toolLinks.calculator,
    column:
      "最初から完璧な数値を入れるより、近い用途から始めて、分かる値を順に現実へ寄せる方が設計の迷子になりにくいです。"
  }),

  lesson({
    id: "apprentice-two-ray-wave",
    mode: "apprentice",
    stage: 1,
    title: "地面反射の山谷",
    enemy: "反射の鏡",
    reward: "干渉の読み方",
    question: "2波モデルで、距離に対して損失グラフが波打つ主な理由はどれですか？",
    choices: ["直接波と地面反射波が干渉するため", "送信電力が周期的に変わるため", "受信感度が距離で変わるため"],
    correctIndex: 0,
    immediateAnswer: "直接波と地面反射波の位相差で、強め合い・弱め合いが起きます。",
    explanation:
      "2波モデルの完全版では、直接波と反射波を位相込みで合成します。少し位置が変わるだけで強め合いから弱め合いへ移るため、局所的な山谷が出ます。",
    appLink: toolLinks.propagation,
    column:
      "実機を数十cm動かすだけでRSSIが大きく変わる現象は、この干渉の谷を踏んだ可能性があります。低高度端末では設置高さと向きが効きます。"
  }),
  lesson({
    id: "apprentice-breakpoint",
    mode: "apprentice",
    stage: 2,
    title: "ブレークポイントの扉",
    enemy: "遠方近似の門",
    reward: "2波の距離目安",
    question: "2波モデルのブレークポイント距離 d_bp の形として正しいものはどれですか？",
    choices: ["4·ht·hr/λ", "20log10(f)", "送信電力 - 受信感度"],
    correctIndex: 0,
    immediateAnswer: "ブレークポイント目安は d_bp = 4·ht·hr/λ です。",
    explanation:
      "送信高ht、受信高hr、波長λで決まります。高さを上げる、または周波数を上げて波長が短くなると、ブレークポイントは遠くなります。",
    appLink: toolLinks.propagation,
    column:
      "ブレークポイントは、平均的な傾きが自由空間的な振る舞いから2波遠方近似へ寄っていく目安です。完全な境界線ではありません。"
  }),
  lesson({
    id: "apprentice-fresnel",
    mode: "apprentice",
    stage: 3,
    title: "フレネルの橋",
    enemy: "見通し線の罠",
    reward: "クリアランス確認",
    question: "見通し線が通っていても、通信が悪化することがある主な理由はどれですか？",
    choices: ["第1フレネルゾーンがふさがるため", "dBmが使えないため", "周波数が単位を失うため"],
    correctIndex: 0,
    immediateAnswer: "第1フレネルゾーンが地形・建物・樹木などで欠けると、追加損失が出ます。",
    explanation:
      "電波は線だけでなく、経路の周りの楕円体の空間を使って伝わります。見通し線だけでなくフレネルゾーンの空きも確認します。",
    appLink: toolLinks.fresnel,
    column:
      "低高度端末では、地面や車両、設備がフレネルゾーンへ入りやすくなります。リンクマージンに余裕を持たせる理由の1つです。"
  }),
  lesson({
    id: "apprentice-ground-proximity",
    mode: "apprentice",
    stage: 4,
    title: "地面近接の沼",
    enemy: "低高度の影",
    reward: "近傍損失の分離",
    question: "地面近くに置いたIoT端末で、HataやFSPLとは別に見たい損失はどれですか？",
    choices: ["地面近接損失", "周波数プリセット名", "ページタイトル"],
    correctIndex: 0,
    immediateAnswer: "地面近接損失を端末近傍損失として別に見ます。",
    explanation:
      "端末が地面に近いと、反射、フレネルゾーン欠損、アンテナ効率低下が効きやすくなります。広域平均モデルだけでは拾いにくい要因です。",
    appLink: toolLinks.calculator,
    column:
      "スマートメーター、車載、路面近くのセンサーでは、端末高が数十cm違うだけでもRSSIが変わることがあります。"
  }),
  lesson({
    id: "apprentice-enclosure",
    mode: "apprentice",
    stage: 5,
    title: "筐体の封印",
    enemy: "金属シールド",
    reward: "筐体損失の扱い",
    question: "金属筐体や金属近接で悪化した分は、どこへ入れるのが自然ですか？",
    choices: ["筐体損失", "送信周波数", "受信感度の単位"],
    correctIndex: 0,
    immediateAnswer: "原因が筐体なら、筐体損失として端末近傍損失に入れます。",
    explanation:
      "原因が分かる損失は個別の欄へ入れると、あとから設計改善の打ち手を考えやすくなります。",
    appLink: toolLinks.calculator,
    column:
      "筐体損失を環境損失にも実測補正にも重ねて入れると二重計上になります。原因別に分けるのが実務の基本です。"
  }),
  lesson({
    id: "apprentice-polarization",
    mode: "apprentice",
    stage: 6,
    title: "偏波のねじれ",
    enemy: "向き違いの幻",
    reward: "設置方向の見積もり",
    question: "アンテナの向きや偏波がずれると、主に何が増えますか？",
    choices: ["偏波ミスマッチ損失", "送信電力", "波長"],
    correctIndex: 0,
    immediateAnswer: "偏波ミスマッチ損失が増えます。",
    explanation:
      "送受信アンテナの偏波が合わないと、受け取れる電力が減ります。設置方向がばらつく用途では余裕として見込むことがあります。",
    appLink: toolLinks.calculator,
    column:
      "現場では端末が回転したり傾いたりします。机上の最大利得だけでなく、姿勢ばらつき込みで見ると判断が安定します。"
  }),
  lesson({
    id: "apprentice-environment-vs-near",
    mode: "apprentice",
    stage: 7,
    title: "損失の仕分け",
    enemy: "二重計上の霧",
    reward: "損失分類",
    question: "環境損失と端末近傍損失の使い分けとして自然なのはどれですか？",
    choices: ["経路全体の壁やクラッタは環境、筐体や人体遮蔽は近傍", "全部を全欄に入れる", "損失は入力しない"],
    correctIndex: 0,
    immediateAnswer: "経路全体と端末周りを分けると、二重計上を避けやすくなります。",
    explanation:
      "壁や屋内外、周辺クラッタは環境損失、筐体、地面近接、人体・車両遮蔽、設置ばらつきは端末近傍損失に分けます。",
    appLink: toolLinks.calculator,
    column:
      "分類は厳密な境界ではありませんが、同じ原因を複数欄に入れないことが重要です。"
  }),
  lesson({
    id: "apprentice-calibration-sign",
    mode: "apprentice",
    stage: 8,
    title: "実測補正の符号",
    enemy: "符号反転の罠",
    reward: "RSSI補正の向き",
    question: "現地RSSI/RSRPが計算より10dB弱かった場合、実測補正値はどう入れるのが自然ですか？",
    choices: ["-10dB", "+10dB", "+100dB"],
    correctIndex: 0,
    immediateAnswer: "計算より弱いなら、実測補正値は-10dBとして入れるのが自然です。",
    explanation:
      "実測補正値は受信電力へ足されます。実測が計算より弱い場合はマイナス、強い場合はプラスです。",
    appLink: toolLinks.calculator,
    column:
      "補正値は便利ですが、原因が筐体や遮蔽だと分かっているなら個別損失へ入れ、残差だけを補正値へ入れます。"
  }),
  lesson({
    id: "apprentice-log-distance-n",
    mode: "apprentice",
    stage: 9,
    title: "距離指数nの鍵",
    enemy: "指数の迷い",
    reward: "Log-distanceの基礎",
    question: "Log-distanceモデルで、自由空間に近い距離損失指数nはどれですか？",
    choices: ["2", "6", "20"],
    correctIndex: 0,
    immediateAnswer: "自由空間に近い距離損失指数は n=2 です。",
    explanation:
      "Log-distanceモデルは1m基準損失に10nlog10(d)を足します。遮蔽物やNLOSが増えると、nは3以上になることがあります。",
    appLink: toolLinks.propagation,
    column:
      "nは現場で変わります。複数距離のRSSI/RSRPを取ると、その環境に合った距離勾配を推定しやすくなります。"
  }),
  lesson({
    id: "apprentice-hata-height",
    mode: "apprentice",
    stage: 10,
    title: "hb/hmの門番",
    enemy: "高さ入力の番人",
    reward: "Hata高さ条件",
    question: "奥村・秦モデルで式に入る高さ条件として正しいものはどれですか？",
    choices: ["基地局高hbと移動局高hm", "ケーブル色", "受信機メーカー名"],
    correctIndex: 0,
    immediateAnswer: "奥村・秦モデルでは基地局高hbと移動局高hmが式に入ります。",
    explanation:
      "Hata系では周波数、距離、基地局高、移動局高、エリア種別が伝搬損失に効きます。高さは固定ではありません。",
    appLink: toolLinks.propagation,
    column:
      "問い合わせで指摘されやすいポイントです。画面上でも送信側アンテナ高をhb、受信側アンテナ高をhmとして明示しています。"
  }),

  lesson({
    id: "practitioner-link-type",
    mode: "practitioner",
    stage: 1,
    title: "通信形態の旗",
    enemy: "モード選択の壁",
    reward: "評価軸の切替",
    question: "高所基地局から地上近傍IoT端末を見るとき、Hata系はどう扱うのが自然ですか？",
    choices: ["広域平均損失の参考として使い、端末近傍損失を別加算する", "端末近傍損失も完全に含む", "距離を使わない"],
    correctIndex: 0,
    immediateAnswer: "Hata系は広域平均損失の参考として使い、端末近傍損失は別に加算します。",
    explanation:
      "高所基地局から端末までのマクロな平均損失と、端末周辺の地面・筐体・人体遮蔽は分けて扱います。",
    appLink: toolLinks.calculator,
    column:
      "基地局側の条件がHataの前提に近くても、端末側が地上近傍なら端末近傍損失の確認が必要です。"
  }),
  lesson({
    id: "practitioner-low-terminal",
    mode: "practitioner",
    stage: 2,
    title: "低高度同士の分岐",
    enemy: "Hata過信の影",
    reward: "主モデル選択",
    question: "低高度端末同士の通信で、主モデルとして推奨しにくいものはどれですか？",
    choices: ["奥村・秦モデル単独", "2波モデル", "Log-distanceモデル"],
    correctIndex: 0,
    immediateAnswer: "低高度端末同士では、奥村・秦モデル単独を主モデルにするのは推奨しません。",
    explanation:
      "低高度端末同士では、地面反射、フレネルゾーン欠損、設置高さ、周辺遮蔽物が支配的になりやすいからです。",
    appLink: toolLinks.calculator,
    column:
      "Hata系を表示する場合も比較値として扱い、自由空間、2波、Log-distance、実測補正を中心に見ます。"
  }),
  lesson({
    id: "practitioner-hata-range",
    mode: "practitioner",
    stage: 3,
    title: "Hata適用範囲",
    enemy: "範囲外の門",
    reward: "警告の読み方",
    question: "奥村・秦モデルの一般的な周波数範囲の目安として近いものはどれですか？",
    choices: ["150〜1500MHz", "1〜10MHz", "60〜100GHz"],
    correctIndex: 0,
    immediateAnswer: "奥村・秦モデルの一般的な周波数範囲は150〜1500MHzが目安です。",
    explanation:
      "距離は1〜20km、基地局高30〜200m、移動局高1〜10mも目安です。範囲外でも計算結果は参考値として表示し、警告を読みます。",
    appLink: toolLinks.propagation,
    column:
      "モデルの適用範囲外で数値が出ることと、結果をそのまま信じてよいことは別です。警告は設計レビューの入口です。"
  }),
  lesson({
    id: "practitioner-cost231",
    mode: "practitioner",
    stage: 4,
    title: "COST231の市街地",
    enemy: "PCS拡張の番人",
    reward: "COST231-Hataの位置づけ",
    question: "COST231-Hataは主に何を拡張したモデルですか？",
    choices: ["Hata系をより高い周波数帯の都市マクロへ拡張", "dBmをmWへ変換", "VSWRを測る"],
    correctIndex: 0,
    immediateAnswer: "COST231-HataはHata系を都市マクロ向けに拡張したモデルです。",
    explanation:
      "一般に1500〜2000MHz付近の都市マクロ評価で使われます。基地局高や移動局高の前提も確認します。",
    appLink: toolLinks.propagation,
    column:
      "COST231-Hataも低高度端末同士の地面近傍や筐体損失を直接表す万能式ではありません。"
  }),
  lesson({
    id: "practitioner-near-components",
    mode: "practitioner",
    stage: 5,
    title: "近傍損失の五つの札",
    enemy: "端末周りの影",
    reward: "損失内訳",
    question: "端末近傍損失として本ツールで分けているものはどれですか？",
    choices: ["地面近接、筐体、偏波、車両・人体遮蔽、設置ばらつき", "曜日、天気予報、担当者名", "HTML、CSS、Git"],
    correctIndex: 0,
    immediateAnswer: "地面近接、筐体、偏波、車両・人体遮蔽、設置ばらつきを分けています。",
    explanation:
      "端末周りで起きる損失を分けると、アンテナ位置、筐体、設置向き、遮蔽のどこを改善するべきか見やすくなります。",
    appLink: toolLinks.calculator,
    column:
      "現地で悪い結果が出たとき、どの損失を減らせるかを議論できることが、単なる計算表との違いです。"
  }),
  lesson({
    id: "practitioner-iot-hata-anchor",
    mode: "practitioner",
    stage: 6,
    title: "実測アンカー",
    enemy: "校正点の守護者",
    reward: "IoT実測補正Hata",
    question: "IoT実測補正Hataモードで必要になる代表的な入力はどれですか？",
    choices: ["実測アンカー距離と実測受信電力", "画面の背景色", "ボタンの角丸"],
    correctIndex: 0,
    immediateAnswer: "実測アンカー距離と実測受信電力を使ってHata基準との差分を校正します。",
    explanation:
      "既知距離で測ったRSSI/RSRPから、基準モデルに対するオフセットを推定します。単一点補正はアンカー近傍の補正として扱います。",
    appLink: toolLinks.calculator,
    column:
      "広い距離範囲へ外挿する場合は、複数距離の測定で距離勾配を確認します。"
  }),
  lesson({
    id: "practitioner-double-count",
    mode: "practitioner",
    stage: 7,
    title: "二重計上の罠",
    enemy: "過剰悲観の幻",
    reward: "補正の整理",
    question: "IoT実測補正Hataでアンカー補正を使ったうえで、同じ測定差分を通常の実測補正値にも入れるとどうなりますか？",
    choices: ["二重計上になり得る", "必ず精度が上がる", "伝搬損失が消える"],
    correctIndex: 0,
    immediateAnswer: "同じ測定差分を重ねると二重計上になり得ます。",
    explanation:
      "アンカー補正はすでに実測との差分を含みます。通常の実測補正値は、別要因の追加補正だけに使います。",
    appLink: toolLinks.calculator,
    column:
      "『原因別損失に入れたもの』『アンカーで吸収したもの』『残差として補正するもの』を分けると、レビューが楽になります。"
  }),
  lesson({
    id: "practitioner-reliability",
    mode: "practitioner",
    stage: 8,
    title: "信頼率マージン",
    enemy: "シャドウフェード",
    reward: "確率込み距離",
    question: "90%や95%の信頼率つき距離評価で、最大距離が短くなりやすい理由はどれですか？",
    choices: ["シャドウフェージング分の余裕を差し引くため", "周波数が自動で下がるため", "アンテナ利得が消えるため"],
    correctIndex: 0,
    immediateAnswer: "信頼率を上げると、場所ばらつき分の余裕を差し引くため最大距離は短くなります。",
    explanation:
      "平均損失だけで届く距離は中央値に近い評価です。実務ではσと目標信頼率から余裕を取り、成立確率込みで距離を見ます。",
    appLink: toolLinks.calculator,
    column:
      "平均値でギリギリ届く設計は、場所や時間が少し変わるだけで不安定になりがちです。"
  }),
  lesson({
    id: "practitioner-research-sheet",
    mode: "practitioner",
    stage: 9,
    title: "研究ベース距離計算",
    enemy: "最大距離の問い",
    reward: "距離逆算",
    question: "研究ベース距離計算シートで、平均損失だけでなく入力するものはどれですか？",
    choices: ["目標信頼率、シャドウフェージングσ、追加フェード余裕", "ページのフォント名", "GitHubのスター数"],
    correctIndex: 0,
    immediateAnswer: "目標信頼率、σ、追加フェード余裕を使って最大距離を逆算します。",
    explanation:
      "中央値の許容伝搬損失から、信頼率マージンを差し引くことで、より現実寄りの距離目安を出します。",
    appLink: toolLinks.calculator,
    column:
      "基地局設計では、単に『平均で届く』ではなく『どれくらいの確率で届くか』を確認します。"
  }),
  lesson({
    id: "practitioner-waterfall",
    mode: "practitioner",
    stage: 10,
    title: "滝グラフの読み筋",
    enemy: "改善順序の迷宮",
    reward: "改善優先度",
    question: "滝グラフで最初に見るべき観点として自然なのはどれですか？",
    choices: ["どの利得・損失が受信電力を大きく動かしているか", "色の好み", "カードの影の濃さ"],
    correctIndex: 0,
    immediateAnswer: "どの利得・損失が受信電力を大きく動かしているかを見ます。",
    explanation:
      "送信電力、アンテナ利得、伝搬損失、環境損失、端末近傍損失、実測補正のどこが支配的かを見ると改善策を選びやすくなります。",
    appLink: toolLinks.calculator,
    column:
      "設計改善では、送信電力を上げるより、筐体損失や設置方向を直す方が効くこともあります。"
  }),

  lesson({
    id: "expert-cost-wi",
    mode: "expert",
    stage: 1,
    title: "都市街路NLOS",
    enemy: "屋根越し回折の影",
    reward: "COST231 WI",
    question: "都市街路NLOSの屋根越し・街路回折を簡易的に見るモデルとして近いものはどれですか？",
    choices: ["COST231 Walfisch-Ikegami", "dBm/mW変換", "VSWR変換"],
    correctIndex: 0,
    immediateAnswer: "COST231 Walfisch-Ikegamiは都市街路NLOSの簡易比較に使えます。",
    explanation:
      "街路幅、平均建物高、建物間隔、道路角度などを使い、都市の屋根越し・街路回折を近似します。",
    appLink: toolLinks.calculator,
    column:
      "実キャリア設計では、COST231 WIのような式だけでなく、GIS、クラッタ、アンテナパターン、レイトレース、実測補正も重ねます。"
  }),
  lesson({
    id: "expert-sui",
    mode: "expert",
    stage: 2,
    title: "SUIの地形札",
    enemy: "丘陵地形の番人",
    reward: "Terrain A/B/C",
    question: "IEEE 802.16 SUI Terrain A/B/Cで、より厳しい地形・クラッタ条件を表しやすいのはどれですか？",
    choices: ["Terrain A", "Terrain C", "どれも同じ"],
    correctIndex: 0,
    immediateAnswer: "Terrain Aが、より厳しい地形・クラッタ条件を表す側です。",
    explanation:
      "SUI Terrain A/B/Cは地形タイプによって距離損失の係数が変わります。Aは丘陵・高クラッタ、Cは平坦・低クラッタ寄りです。",
    appLink: toolLinks.calculator,
    column:
      "モデル比較では、同じ入力でもTerrainの選択で最大距離が大きく変わります。環境の分類が曖昧なら複数モデルで幅を見ます。"
  }),
  lesson({
    id: "expert-tr38901",
    mode: "expert",
    stage: 3,
    title: "3GPPの街区",
    enemy: "LOS/NLOSの分岐",
    reward: "UMi/UMa比較",
    question: "3GPP TR 38.901系で、都市マイクロセルを表す略称として近いものはどれですか？",
    choices: ["UMi", "FSPL", "dBm"],
    correctIndex: 0,
    immediateAnswer: "UMiはUrban Micro、都市マイクロセルを表します。",
    explanation:
      "UMi/UMa、LOS/NLOS、周波数、アンテナ高などの前提があり、標準評価用モデルとして使われます。",
    appLink: toolLinks.calculator,
    column:
      "低高度IoT端末の筐体損失や地面近接まで完全に含むわけではないため、近傍損失と実測補正も併用します。"
  }),
  lesson({
    id: "expert-shadow-sigma",
    mode: "expert",
    stage: 4,
    title: "σの盾",
    enemy: "場所ばらつき",
    reward: "シャドウフェージング",
    question: "シャドウフェージングσを大きくすると、同じ信頼率で最大距離はどうなりやすいですか？",
    choices: ["短くなる", "必ず長くなる", "変わらない"],
    correctIndex: 0,
    immediateAnswer: "σが大きいほど、必要な余裕が増えるため最大距離は短くなりやすいです。",
    explanation:
      "ばらつきが大きい環境では、平均値より悪い場所を見込むためのマージンが増えます。",
    appLink: toolLinks.calculator,
    column:
      "同じ平均受信電力でも、ばらつきが大きい環境は通信品質の予測が難しくなります。"
  }),
  lesson({
    id: "expert-interference-coverage",
    mode: "expert",
    stage: 5,
    title: "距離だけではない設計",
    enemy: "容量の壁",
    reward: "カバレッジと干渉",
    question: "基地局設計で、通信距離だけでは足りない理由として自然なのはどれですか？",
    choices: ["干渉、容量、トラフィック、アンテナパターンも効くため", "距離は存在しないため", "周波数を入力しないため"],
    correctIndex: 0,
    immediateAnswer: "基地局設計では距離に加えて、干渉、容量、トラフィック、アンテナパターンも効きます。",
    explanation:
      "届くかだけでなく、どの品質で、何台を、どの干渉条件で収容するかが設計対象になります。",
    appLink: toolLinks.calculator,
    column:
      "本ツールは一次評価です。実セル設計では電波伝搬、容量、干渉、運用パラメータを合わせて見ます。"
  }),
  lesson({
    id: "expert-measurement-loop",
    mode: "expert",
    stage: 6,
    title: "複数実測点",
    enemy: "残差の迷宮",
    reward: "モデル校正",
    question: "1点実測だけでなく複数距離の実測を取る主な理由はどれですか？",
    choices: ["オフセットだけでなく距離勾配も確認するため", "ボタン数を増やすため", "dBmを使わないため"],
    correctIndex: 0,
    immediateAnswer: "複数距離があると、オフセットだけでなく距離勾配も確認できます。",
    explanation:
      "単一点補正はアンカー近傍には有効ですが、遠距離へ外挿すると勾配がずれることがあります。",
    appLink: toolLinks.propagation,
    column:
      "Log-distanceのnやIoT実測補正Hataの勾配補正は、複数距離のRSSI/RSRPがあるほど判断しやすくなります。"
  }),
  lesson({
    id: "expert-height-two-ray",
    mode: "expert",
    stage: 7,
    title: "高さで変わる谷",
    enemy: "反射谷の操り手",
    reward: "設置高さ感度",
    question: "2波干渉で、送受信アンテナ高を変えると主に何が変わりますか？",
    choices: ["山谷の位置やブレークポイント", "dBmの定義", "GitのリモートURL"],
    correctIndex: 0,
    immediateAnswer: "山谷の位置やブレークポイントが変わります。",
    explanation:
      "直接波と反射波の経路差が変わるため、強め合い・弱め合いが起きる距離も変わります。",
    appLink: toolLinks.propagation,
    column:
      "低高度端末でRSSIが不安定なとき、アンテナ高や向きを少し変えるだけで改善することがあります。"
  }),
  lesson({
    id: "expert-lora-sf",
    mode: "expert",
    stage: 8,
    title: "LoRaのSF判断",
    enemy: "復調しきい値の門",
    reward: "SNRと信頼性",
    question: "LoRaWANの距離評価で、RSSIだけでなくSNRやSFを見る理由として自然なのはどれですか？",
    choices: ["復調しきい値や信頼性に効くため", "周波数が不要になるため", "アンテナが消えるため"],
    correctIndex: 0,
    immediateAnswer: "SNRやSFは復調しきい値や通信信頼性に効きます。",
    explanation:
      "LoRaではSpreading Factorにより感度やデータレートが変わります。RSSIだけでなくSNRや成功率も見ると実態に近づきます。",
    appLink: toolLinks.calculator,
    column:
      "研究ベースの評価でも、距離ごとのSNR、成功率、変調条件を合わせて見る例が増えています。"
  }),
  lesson({
    id: "expert-gis-clutter",
    mode: "expert",
    stage: 9,
    title: "地図クラッタ",
    enemy: "建物影の地図",
    reward: "GISの考え方",
    question: "キャリアの基地局設計で、標準式に加えてよく使う情報はどれですか？",
    choices: ["地図、建物高、クラッタ、実測補正", "文字色だけ", "ページ幅だけ"],
    correctIndex: 0,
    immediateAnswer: "地図、建物高、クラッタ、実測補正などを重ねます。",
    explanation:
      "都市・郊外・農村で、地形や建物、植生、道路幅は大きく変わります。標準式だけでは現場差を吸収しきれません。",
    appLink: toolLinks.calculator,
    column:
      "詳細設計では、GIS、レイトレース、ドライブテスト、統計補正を組み合わせます。本ツールはその前段の一次評価です。"
  }),
  lesson({
    id: "expert-warning",
    mode: "expert",
    stage: 10,
    title: "警告を読む力",
    enemy: "範囲外の誘惑",
    reward: "レビューの目",
    question: "モデル適用範囲外でも計算結果を非表示にしない理由として自然なのはどれですか？",
    choices: ["参考値として比較しつつ、警告で判断を促すため", "警告を無視するため", "必ず正確だから"],
    correctIndex: 0,
    immediateAnswer: "参考値として比較しつつ、警告で判断を促すためです。",
    explanation:
      "範囲外の値は設計判断の主根拠にしにくいですが、モデル間の違いや危険な前提を見つける材料になります。",
    appLink: toolLinks.calculator,
    column:
      "良いツールは、計算を止めるだけでなく、なぜ危ないかを説明します。設計者は警告の理由を読む必要があります。"
  }),

  lesson({
    id: "researcher-lora-env-dataset",
    mode: "researcher",
    stage: 1,
    title: "環境特徴量の研究",
    enemy: "温湿度の影響",
    reward: "環境補正の視点",
    question: "2025年の屋内LoRaWAN測定データ研究で、構造物に加えて使われた特徴量として近いものはどれですか？",
    choices: ["温湿度、CO2、気圧、粒子状物質など", "ページの余白だけ", "GitHubのIssue数だけ"],
    correctIndex: 0,
    immediateAnswer: "温湿度、CO2、気圧、粒子状物質などの環境特徴量が扱われています。",
    explanation:
      "距離と壁だけでは説明しにくい屋内LoRaWANの変動を、環境・占有状態に関係する特徴量も含めて分析しています。",
    appLink: toolLinks.calculator,
    column:
      "2025年のデータ論文では、壁だけのモデルより環境特徴量を含むモデルでRMSEが10.58dBから8.04dBへ改善したと報告されています。これは『距離だけでは足りない』ことを示す良い教材です。",
    sources: [sources.loraDataset2025]
  }),
  lesson({
    id: "researcher-calibrated-margin",
    mode: "researcher",
    stage: 2,
    title: "残差分布の上側",
    enemy: "非ガウス残差",
    reward: "信頼率マージン",
    question: "2025年の環境認識型LoRaWAN研究で、信頼性設計として重要視された考え方はどれですか？",
    choices: ["残差分布の上側分位からフェードマージンを決める", "平均値だけを使う", "RSSIを見ない"],
    correctIndex: 0,
    immediateAnswer: "残差分布の上側分位からフェードマージンを決める考え方です。",
    explanation:
      "平均誤差だけでなく、外れやすい側の残差を見て、目標信頼率に合わせた余裕を設定します。",
    appLink: toolLinks.calculator,
    column:
      "同研究では環境特徴量を含む多項式平均モデルでRMSEが8.07dBから7.09dBへ改善し、99%の信頼性に必要なマージンも比較しています。平均だけでなく分布を見るのが研究者モードの勘所です。",
    sources: [sources.envAware2025]
  }),
  lesson({
    id: "researcher-kalman",
    mode: "researcher",
    stage: 3,
    title: "RSSI平滑化",
    enemy: "揺れるRSSI",
    reward: "時系列処理",
    question: "2025年のEnviKal-Locで、RSSIの揺れに対して使われた代表的な工夫はどれですか？",
    choices: ["適応カルマンフィルタ", "送信電力を無限大にする", "距離を固定値にする"],
    correctIndex: 0,
    immediateAnswer: "適応カルマンフィルタでRSSI変動を平滑化しています。",
    explanation:
      "環境特徴量を含むモデルにRSSI平滑化を組み合わせ、短期的な揺れと持続的な傾向を分けようとしています。",
    appLink: toolLinks.propagation,
    column:
      "この研究では、6か月・約132万件の測定で、環境特徴量とカルマン平滑化を組み合わせた手法が測位誤差を大きく下げたと報告されています。リンク設計でも、単発RSSIだけで判断しない姿勢が重要です。",
    sources: [sources.envKal2025]
  }),
  lesson({
    id: "researcher-aerpaw-altitude",
    mode: "researcher",
    stage: 4,
    title: "高度と移動体",
    enemy: "空中プラットフォーム",
    reward: "高度差の読み方",
    question: "2026年のAERPAW LoRaWAN実測で比較されたプラットフォームとして近いものはどれですか？",
    choices: ["地上車両、ドローン、ヘリカイト", "机、椅子、棚だけ", "ブラウザ、タブ、URLだけ"],
    correctIndex: 0,
    immediateAnswer: "地上車両、ドローン、ヘリカイトが比較されています。",
    explanation:
      "高度、移動、地形、NLOS条件がRSSI/SNRや成功率に影響することを、フィールド測定で見ています。",
    appLink: toolLinks.calculator,
    column:
      "同研究では、安定した高高度のヘリカイトが一貫したリンク性能を示し、移動するドローンや地上車両は遮蔽・地形・マルチパスによるばらつきが大きいと整理されています。",
    sources: [sources.aerpaw2026]
  }),
  lesson({
    id: "researcher-p1812-geodata",
    mode: "researcher",
    stage: 5,
    title: "地理データの精度",
    enemy: "クラッタ地図",
    reward: "P.1812の視点",
    question: "2025年のITU-R P.1812-7農村部研究で示された注意点として近いものはどれですか？",
    choices: ["高解像度データが常に最良とは限らず、クラッタ情報の選び方が効く", "地図データは不要", "標高は必ずゼロ"],
    correctIndex: 0,
    immediateAnswer: "高解像度データが常に最良とは限らず、クラッタ情報の選び方が効くという注意点です。",
    explanation:
      "標高、土地被覆、樹冠高などの地理データは、伝搬推定の精度に効きます。ただしデータの更新性や分類の代表性も問題になります。",
    appLink: toolLinks.calculator,
    column:
      "農村・山間部では、地図の解像度だけでなく、植生やクラッタ高さの割り当てが結果を左右します。現場実測で補正する理由にもつながります。",
    sources: [sources.p1812Geo2025]
  }),
  lesson({
    id: "researcher-rel19",
    mode: "researcher",
    stage: 6,
    title: "Rel-19の窓",
    enemy: "7-24GHzの空白",
    reward: "標準化動向",
    question: "3GPP Release 19のTR 38.901拡張議論で、注目された周波数帯のギャップとして近いものはどれですか？",
    choices: ["7〜24GHz帯", "1Hzだけ", "音声周波数だけ"],
    correctIndex: 0,
    immediateAnswer: "7〜24GHz帯のモデルギャップが注目されています。",
    explanation:
      "従来はsub-6GHzやmmWaveに焦点が当たりやすく、7〜24GHz帯をより正確に扱うための拡張が議論されています。",
    appLink: toolLinks.calculator,
    column:
      "Rel-19の概要論文では、Suburban Macro、UTアンテナ、クラスタ/レイ数の変動、偏波、近傍界、空間非定常性などが拡張論点として整理されています。",
    sources: [sources.rel19]
  }),
  lesson({
    id: "researcher-residual-mixture",
    mode: "researcher",
    stage: 7,
    title: "残差は正規分布だけではない",
    enemy: "重い裾の幻",
    reward: "残差分布の検査",
    question: "環境認識型LoRaWAN研究で、残差評価について注意されている考え方はどれですか？",
    choices: ["正規分布だけに決め打ちせず、歪みや混合分布も見る", "残差は必ずゼロ", "外れ値は存在しない"],
    correctIndex: 0,
    immediateAnswer: "正規分布だけに決め打ちせず、歪みや混合分布も見る考え方です。",
    explanation:
      "屋内IoTでは人の動き、家具配置、反射、干渉で残差の分布が単純な正規分布から外れることがあります。",
    appLink: toolLinks.calculator,
    column:
      "平均誤差だけでなく、残差の上側分位を見ると、99%のような高信頼率で必要なマージンが変わります。研究者モードでは『分布の形』まで見ます。",
    sources: [sources.envAware2025]
  }),
  lesson({
    id: "researcher-cross-validation",
    mode: "researcher",
    stage: 8,
    title: "検証データの封印",
    enemy: "リークの罠",
    reward: "検証設計",
    question: "測定データでモデルを評価するとき、過大評価を避ける工夫として自然なのはどれですか？",
    choices: ["学習と検証を分け、リークを避ける", "同じデータで何度も答え合わせするだけ", "悪い測定点を全部消す"],
    correctIndex: 0,
    immediateAnswer: "学習と検証を分け、リークを避けることが重要です。",
    explanation:
      "同じ場所・同じ期間のデータで調整して同じデータで評価すると、現場へ持ち出したときの誤差を過小評価しやすくなります。",
    appLink: toolLinks.propagation,
    column:
      "近年の測定研究では、クロスバリデーションやホールドアウト検証で、現場展開時の再現性を確認する姿勢が強くなっています。",
    sources: [sources.envAware2025, sources.envKal2025]
  }),
  lesson({
    id: "researcher-ml-not-magic",
    mode: "researcher",
    stage: 9,
    title: "機械学習は万能薬ではない",
    enemy: "ブラックボックスの影",
    reward: "説明可能な補正",
    question: "環境特徴量や機械学習を使うときの実務的な注意として自然なのはどれですか？",
    choices: ["リンクバジェットや物理モデルと併用し、説明可能な残差補正として扱う", "物理モデルを完全に捨てる", "測定条件を記録しない"],
    correctIndex: 0,
    immediateAnswer: "リンクバジェットや物理モデルと併用し、説明可能な残差補正として扱うのが安全です。",
    explanation:
      "特徴量モデルは有効ですが、測定範囲外へ外挿すると危険です。まず物理モデルで基準を持ち、残差を現地データで補正します。",
    appLink: toolLinks.calculator,
    column:
      "研究の流れは『万能な新式』ではなく、『標準モデル＋実測＋環境特徴量＋信頼率マージン』で誤差を管理する方向です。",
    sources: [sources.envAware2025, sources.envKal2025]
  }),
  lesson({
    id: "researcher-no-universal-hata",
    mode: "researcher",
    stage: 10,
    title: "万能Hataを探さない",
    enemy: "単一式の誘惑",
    reward: "研究者のまとめ",
    question: "ここ数年のIoT伝搬研究の流れとして、最も安全な理解はどれですか？",
    choices: ["単一の万能式ではなく、測定校正・環境特徴量・信頼率マージンを組み合わせる", "Hataだけで全IoTを判定する", "距離計算は不要"],
    correctIndex: 0,
    immediateAnswer: "単一の万能式ではなく、測定校正・環境特徴量・信頼率マージンを組み合わせます。",
    explanation:
      "低高度IoTでは、地面、筐体、人体、建物、環境変動、残差分布が効きます。標準モデルを基準にしつつ、現地実測で閉じるのが現実的です。",
    appLink: toolLinks.calculator,
    column:
      "本ツールの設計もこの考え方です。Hata系は参考基準として残し、2波、Log-distance、端末近傍損失、研究ベース距離、実測補正を組み合わせて一次評価します。",
    sources: [
      sources.loraDataset2025,
      sources.envAware2025,
      sources.aerpaw2026,
      sources.p1812Geo2025,
      sources.rel19
    ]
  })
];
