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
  },
  antennaGain: {
    label: "Antenna gain / dBi-dBd reference",
    href: "https://en.wikipedia.org/wiki/Gain_%28antenna%29"
  },
  monopoleGround: {
    label: "Monopole antenna and ground plane",
    href: "https://en.wikipedia.org/wiki/Monopole_antenna"
  },
  groundPlane: {
    label: "Ground plane reference",
    href: "https://en.wikipedia.org/wiki/Ground_plane"
  },
  counterpoise: {
    label: "Counterpoise ground system",
    href: "https://en.wikipedia.org/wiki/Counterpoise_%28ground_system%29"
  },
  swr: {
    label: "Standing wave ratio",
    href: "https://en.wikipedia.org/wiki/Standing_wave_ratio"
  },
  antennaTuner: {
    label: "Antenna tuner and feedline loss",
    href: "https://en.wikipedia.org/wiki/Antenna_tuner"
  },
  commonMode: {
    label: "Common-mode current",
    href: "https://en.wikipedia.org/wiki/Common_mode_current"
  },
  coaxialCable: {
    label: "Coaxial cable common-mode note",
    href: "https://en.wikipedia.org/wiki/Coaxial_cable"
  },
  loraBasics: {
    label: "LoRa PHY and spreading factor",
    href: "https://en.wikipedia.org/wiki/LoRa"
  },
  loraRssiSnr2022: {
    label: "2022 LoRa RSSI/SNR comparison",
    href: "https://arxiv.org/abs/2210.15122"
  },
  loraRapidFading2020: {
    label: "2020 LoRa high-SF robustness caveat",
    href: "https://arxiv.org/abs/2009.01176"
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
    badge: "100問"
  },
  {
    id: "apprentice",
    label: "見習いモード",
    title: "反射と近傍損失の洞窟",
    description: "2波、フレネル、端末近傍損失、実測補正の基本を扱います。",
    badge: "100問"
  },
  {
    id: "practitioner",
    label: "実務者モード",
    title: "モデル選択の砦",
    description: "通信形態ごとのモデル選択、Hata系の適用範囲、信頼率評価を確認します。",
    badge: "100問"
  },
  {
    id: "expert",
    label: "玄人モード",
    title: "基地局設計の迷宮",
    description: "SUI、COST231 WI、3GPP、GIS、複数実測点など、設計実務寄りの判断を学びます。",
    badge: "100問"
  },
  {
    id: "researcher",
    label: "研究者モード",
    title: "最新研究の塔",
    description: "2025〜2026年の測定研究、環境特徴量、残差分布、Rel-19の論点を織り込みます。",
    badge: "100問"
  }
];

const coreQuestLessons: QuestLesson[] = [
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

type QuestExpansionSeed = {
  slug: string;
  title: string;
  question: string;
  correct: string;
  wrong: [string, string];
  explanation: string;
  appLink: QuestLesson["appLink"];
  column?: string;
  sources?: QuestSource[];
};

function q(
  slug: string,
  title: string,
  question: string,
  correct: string,
  wrong1: string,
  wrong2: string,
  explanation: string,
  appLink: QuestLesson["appLink"],
  column?: string,
  sourcesForLesson?: QuestSource[]
): QuestExpansionSeed {
  return {
    slug,
    title,
    question,
    correct,
    wrong: [wrong1, wrong2],
    explanation,
    appLink,
    column,
    sources: sourcesForLesson
  };
}

const enemyPrefixes: Record<QuestModeId, string[]> = {
  beginner: ["単位の小部屋", "距離の草原", "アンテナ工房", "判定の広場", "掲示板の酒場", "SWRの橋", "設置あるある横丁", "LoRa小径", "測定メモの広場", "誤解退治の門"],
  apprentice: ["反射洞窟", "近傍損失の沼", "実測の祠", "設置ばらつきの谷", "多重波の水路", "フレネル峠", "筐体実装の工房", "RSSI観測所", "整合と給電線の橋", "現場判断の門"],
  practitioner: ["モデル選択の砦", "Hata審問室", "信頼率の城壁", "校正の作戦室", "損失仕分け所", "規格と法規の門", "品質指標の広場", "実測計画の幕舎", "説明責任の書庫", "設計レビューの間"],
  expert: ["基地局設計の迷宮", "都市街路の屋根上", "GISの地図塔", "容量干渉の戦場", "アンテナ方位の塔", "ドライブテスト街道", "アップリンクの要塞", "MIMO散乱の庭", "運用最適化の城", "玄人豆知識の間"],
  researcher: ["測定論文の書庫", "環境特徴量の研究棟", "残差分布の実験室", "標準化会議の塔", "再現性の図書館", "LoRa測定の温室", "統計検証の天文台", "地理データの鉱山", "6Gチャネルの回廊", "研究者トリビアの塔"]
};

const defaultColumns: Record<QuestModeId, string> = {
  beginner:
    "初心者モードでは、まず符号と単位の取り違えを減らすことが最優先です。1つの入力を動かし、滝グラフで結果がどう変わるか確認してください。",
  apprentice:
    "見習いモードでは、机上の平均損失と現場のばらつきを分けて考えます。低高度端末では、地面・筐体・人体・設置向きが効きます。",
  practitioner:
    "実務者モードでは、モデルの適用範囲、損失の入れ分け、警告の読み方が重要です。数値だけでなく、前提条件を一緒に説明できる状態を目指します。",
  expert:
    "玄人モードでは、標準式だけでなく、地図クラッタ、アンテナパターン、容量、干渉、実測補正まで含めて距離の意味を読み替えます。",
  researcher:
    "研究者モードでは、単一式の精度だけでなく、測定設計、特徴量、残差分布、検証方法、信頼率マージンまで確認します。"
};

function makeExpansionLessons(mode: QuestModeId, seeds: QuestExpansionSeed[], startStage = 11): QuestLesson[] {
  return seeds.map((seed, index) => {
    const stage = startStage + index;
    const chapterIndex = Math.floor((stage - 1) / 10);
    const boss = stage % 10 === 0 ? "章ボス" : enemyPrefixes[mode][chapterIndex] ?? "クエスト";

    return lesson({
      id: `${mode}-${seed.slug}`,
      mode,
      stage,
      title: seed.title,
      enemy: `${boss}：${seed.title}`,
      reward: `${seed.title}の心得`,
      question: seed.question,
      choices: [seed.correct, ...seed.wrong],
      correctIndex: 0,
      immediateAnswer: `${seed.correct} が正解です。`,
      explanation: seed.explanation,
      appLink: seed.appLink,
      column: seed.column ?? defaultColumns[mode],
      sources: seed.sources
    });
  });
}

const beginnerExpansionSeeds: QuestExpansionSeed[] = [
  q("db-addition", "dB足し算", "送信電力を+3dB、アンテナ利得を+3dB改善した場合、合計の改善量は？", "+6dB", "+3dB", "+9dB", "dBは倍率を足し算で扱います。別々の+3dB改善が2つあれば合計は+6dBです。", toolLinks.dbFeel),
  q("minus-3db", "-3dBの意味", "-3dBは電力で見るとおおよそどうなりますか？", "約半分", "約2倍", "約10倍", "-3dBは10^(-3/10)で約0.5倍です。損失3dBは電力が半分になる目安です。", toolLinks.dbFeel),
  q("plus-10db", "+10dBの意味", "+10dBは電力倍率で見るとおおよそ何倍ですか？", "10倍", "2倍", "100倍", "電力比のdBは10log10(P2/P1)なので、+10dBは10倍です。", toolLinks.dbFeel),
  q("twenty-dbm", "20dBmの電力", "20dBmは何mWですか？", "100mW", "20mW", "1W", "dBmは0dBm=1mW、+10dBで10倍です。20dBmは100mWです。", toolLinks.dbm),
  q("thirty-dbm", "30dBmの電力", "30dBmは何Wですか？", "1W", "30W", "1mW", "30dBmは1mWの1000倍なので1000mW、つまり1Wです。", toolLinks.dbm),
  q("negative-dbm", "負のdBm", "-90dBmと-110dBmでは、どちらが弱い電力ですか？", "-110dBm", "-90dBm", "同じ", "dBmは値が小さいほど弱い電力です。-110dBmは-90dBmより20dB弱い値です。", toolLinks.dbm),
  q("distance-ten-times", "距離10倍", "自由空間損失で距離が10倍になると、損失はおおよそ何dB増えますか？", "20dB", "10dB", "3dB", "FSPLは20log10(d)なので、距離10倍で20dB増えます。", toolLinks.fspl),
  q("frequency-ten-times", "周波数10倍", "同じ距離で周波数が10倍になると、自由空間損失はおおよそ何dB増えますか？", "20dB", "10dB", "0dB", "FSPLは20log10(f)も含むため、周波数10倍で20dB増えます。", toolLinks.fspl),
  q("eirp-basic", "EIRPの入口", "送信電力20dBm、送信アンテナ利得2dBi、送信側ケーブル損失1dBならEIRPの目安は？", "21dBm", "23dBm", "17dBm", "EIRPは送信電力+アンテナ利得-送信側損失で見ます。20+2-1=21dBmです。", toolLinks.calculator),
  q("loss-sign", "損失の符号", "リンクバジェットで環境損失10dBはどう扱いますか？", "受信電力から引く", "受信電力に足す", "周波数に掛ける", "損失は受信電力を下げる要因なので、リンクバジェットではマイナス側に効きます。", toolLinks.calculator),
  q("receiver-line", "受信感度ライン", "受信電力-100dBm、受信感度-110dBmのリンクマージンは？", "+10dB", "-10dB", "+210dB", "リンクマージンは受信電力-受信感度です。-100-(-110)=+10dBです。", toolLinks.calculator),
  q("negative-margin", "負のマージン", "受信電力-125dBm、受信感度-120dBmの場合の判定として近いものは？", "通信困難", "安定", "周波数不明なので必ず安定", "リンクマージンは-5dBで、受信感度を下回っています。条件見直しが必要です。", toolLinks.calculator),
  q("good-margin", "良好マージン", "リンクマージンが15dBの場合、本ツールの日本語判定はどれに近いですか？", "良好", "通信困難", "不安定", "10dB以上20dB未満は『良好』です。多くの条件で成立が期待できますが、設置環境には注意します。", toolLinks.calculator),
  q("stable-margin", "安定マージン", "リンクマージンが20dB以上の場合の判定は？", "安定", "条件付き", "通信困難", "20dB以上は十分な余裕がある状態として『安定』と表示します。", toolLinks.calculator),
  q("marginal-margin", "条件付きの境界", "リンクマージン5dBの判定として近いものは？", "条件付き", "安定", "通信困難", "3dB以上10dB未満は条件付きです。実測補正や設置条件の確認が必要です。", toolLinks.calculator),
  q("unstable-margin", "不安定の境界", "リンクマージン1dBの判定として近いものは？", "不安定", "安定", "良好", "0dB以上3dB未満は不安定です。環境変動で通信が切れる可能性があります。", toolLinks.calculator),
  q("wavelength-quarter", "λ/4の感覚", "アンテナ寸法の目安で、λ/4とは何を表しますか？", "波長の4分の1", "周波数の4倍", "受信感度の4分の1", "λは波長です。λ/4はモノポールアンテナなどでよく出る寸法目安です。", toolLinks.wavelength),
  q("wavelength-920", "920MHzの波長", "920MHzの波長の目安として近いものはどれですか？", "約0.33m", "約3.3m", "約3.3mm", "波長は約3億m/sを周波数で割ります。920MHzでは約0.326mです。", toolLinks.wavelength),
  q("wavelength-24g", "2.4GHzの波長", "2.4GHzの波長の目安として近いものはどれですか？", "約12.5cm", "約1.25m", "約1.25mm", "3億m/s ÷ 2.4GHz ≒0.125m、つまり約12.5cmです。", toolLinks.wavelength),
  q("antenna-size", "小型アンテナの注意", "アンテナを波長に対して極端に小さくすると起きやすいことは？", "効率や帯域が悪化しやすい", "必ず利得が無限大になる", "周波数が消える", "小型化は便利ですが、効率低下や帯域狭窄が起きやすくなります。", toolLinks.wavelength),
  q("ground-plane", "基板GND", "内蔵アンテナで基板GNDが効く理由として近いものは？", "アンテナの一部のように働くため", "dBmをなくすため", "受信感度を固定するため", "小型アンテナでは基板GNDや筐体が放射特性に強く影響します。", toolLinks.wavelength),
  q("near-metal", "金属近接", "アンテナ近くの金属部品で起きやすいことは？", "共振ずれや効率低下", "必ず10倍届く", "距離がゼロになる", "金属近接はアンテナの共振、放射効率、指向性を変えることがあります。", toolLinks.calculator),
  q("indoor-loss", "屋内損失", "屋内に入る通信で追加損失として見込みたいものは？", "壁・床・什器などの損失", "HTMLタグ", "Gitブランチ", "屋内では壁、床、什器、人の動きなどが追加損失やばらつきになります。", toolLinks.calculator),
  q("rssi-basic", "RSSIの基本", "RSSIは一般に何を示す指標ですか？", "受信信号強度の目安", "送信機の色", "アンテナの長さだけ", "RSSIは受信した信号の強さを示す指標です。方式によって意味や測定対象が異なる点に注意します。", toolLinks.calculator),
  q("rsrp-basic", "RSRPの基本", "LTE系でよく使うRSRPは、何の評価に近いですか？", "参照信号の受信電力", "電源電圧", "アンテナの重さ", "RSRPはLTE系で参照信号の受信電力を表す指標です。RSSIとは対象が異なります。", toolLinks.calculator),
  q("share-url", "共有リンク", "条件を他の人へ見せたいとき、本ツールで便利な機能は？", "共有リンク生成", "周波数削除", "警告非表示", "共有リンクに入力条件を持たせると、同じ条件でレビューしやすくなります。", toolLinks.calculator),
  q("preset-start", "プリセット開始", "初心者が最初にやるとよい操作は？", "近い用途のプリセットから始める", "全欄に999を入れる", "警告を消す", "プリセットから始めて、分かる値を1つずつ現実へ寄せると理解しやすくなります。", toolLinks.calculator),
  q("waterfall-read", "滝グラフ読み", "滝グラフで見たいことは？", "どこで利得・損失が大きく効くか", "文字の長さだけ", "ページのURLだけ", "滝グラフは送信電力から受信電力まで、どこで増減するかを追う図です。", toolLinks.calculator),
  q("gauge-read", "ゲージ読み", "リンクマージンゲージの目的として近いものは？", "余裕が判定基準のどこにあるか見る", "周波数を変換する", "ケーブルを選ぶ", "ゲージは0dB、10dB、20dBの基準に対して現在値を見るためのものです。", toolLinks.calculator),
  q("diagram-read", "2D前提図", "2D前提図は何を説明する図ですか？", "入力した距離・高さ・反射経路などの前提", "実際の地形を完全再現", "GitHubの画面", "2D前提図は計算条件の模式図です。実地形や建物を完全再現するものではありません。", toolLinks.calculator),
  q("calibration-zero", "未測定なら0", "実測補正値が未測定のときの初期扱いとして自然なのは？", "0dBのまま", "+50dBを入れる", "-100dBを入れる", "測定がなければ補正値は0dBから始め、現地RSSI/RSRP取得後に差分を入れます。", toolLinks.calculator),
  q("environment-preset", "環境プリセット", "環境損失プリセットの役割は？", "初期検討用の追加損失目安", "厳密な保証値", "周波数の単位", "プリセットは目安です。実際の損失は筐体、建物、人、設置条件で変わります。", toolLinks.calculator),
  q("near-loss-total", "端末近傍合計", "端末近傍損失の合計は何に使われますか？", "受信電力から引く追加損失", "送信電力の単位変換", "HTMLの見出し", "地面近接、筐体、偏波、遮蔽、設置ばらつきを合計してリンクバジェットへ反映します。", toolLinks.calculator),
  q("tx-rx-gain", "送受信利得", "送信アンテナ利得と受信アンテナ利得はリンクバジェットでどう扱いますか？", "どちらも足す", "どちらも必ず引く", "片方だけ使う", "送信側・受信側のアンテナ利得は、理想的には受信電力を上げる方向に足されます。", toolLinks.calculator),
  q("distance-unit", "距離単位", "1kmは何mですか？", "1000m", "100m", "10m", "距離単位の取り違えは結果を大きく変えます。1km=1000mです。", toolLinks.fspl),
  q("mhz-ghz", "MHzとGHz", "2.4GHzは何MHzですか？", "2400MHz", "24MHz", "0.24MHz", "1GHz=1000MHzです。2.4GHzは2400MHzです。", toolLinks.wavelength),
  q("result-copy", "相談メモ", "計算結果を相談に使うとき有効なのは？", "条件と判定をまとめて共有する", "数値だけ隠す", "警告だけ消す", "周波数、距離、損失、判定、警告をセットで共有すると、レビューが早くなります。", toolLinks.calculator),
  q("warning-basic", "警告の入口", "警告バナーが出たときの基本姿勢は？", "前提が合っているか確認する", "必ず無視する", "結果を必ず保証値にする", "警告はモデルの適用範囲や前提のズレを知らせます。数値と一緒に理由を確認します。", toolLinks.calculator),
  q("one-change", "1つずつ動かす", "入力の効き方を学ぶとき有効な操作は？", "1項目ずつ変えて結果を見る", "全項目を同時に変える", "結果だけ見る", "1項目ずつ変えると、どのパラメータがリンクマージンへ効くか理解しやすくなります。", toolLinks.calculator),
  q("field-check", "最後は実測", "計算後に最終確認として重要なのは？", "現地RSSI/RSRP測定", "画面の色確認だけ", "タイトル変更", "計算は一次評価です。最終的な通信可否は現地測定で確認します。", toolLinks.calculator)
];

const apprenticeExpansionSeeds: QuestExpansionSeed[] = [
  q("reflection-phase", "反射波の位相", "2波干渉で山谷が変わる直接の要因は？", "直接波と反射波の位相差", "送信機の色", "HTMLの余白", "直接波と地面反射波の経路長差が位相差を作り、強め合い・弱め合いが変わります。", toolLinks.propagation),
  q("reflection-coefficient", "反射係数", "2波実験室で簡略値として使っている反射係数の目安は？", "Γ=-1", "Γ=100", "Γは使わない", "低仰角の理想化としてΓ=-1を使い、干渉の山谷を見やすくしています。", toolLinks.propagation),
  q("null-risk", "深いヌル", "2波完全版の深い谷をリンク判定でそのまま過信しない理由は？", "地面材質や偏波で谷の深さが変わるため", "谷は必ず存在しないため", "FSPLが使えないため", "完全な反射条件は現実と異なります。平滑化線と実測補正を併用します。", toolLinks.propagation),
  q("envelope", "平滑化線", "リンクバジェット側の2波値は何として扱いますか？", "平滑化した包絡線", "瞬間的な最深ヌル", "受信感度そのもの", "一点の干渉谷を過信しないため、リンク判定では平滑化した2波近似を使います。", toolLinks.calculator),
  q("height-sensitivity", "高さ感度", "低高度端末でアンテナ高を少し変えるとRSSIが変わる理由として近いものは？", "反射経路差とフレネル条件が変わるため", "dBm定義が変わるため", "周波数単位が消えるため", "低高度では地面反射やフレネル欠損が効き、高さの小さな差がRSSIに出ます。", toolLinks.propagation),
  q("fresnel-sixty", "60%クリアランス", "フレネルゾーンでよく見る60%クリアランスは何の目安ですか？", "第1フレネルゾーンを十分空ける目安", "電力を60倍にする目安", "受信感度を60dBにする目安", "見通し線だけでなく第1フレネルゾーンの一部を空けると、回折損を抑えやすくなります。", toolLinks.fresnel),
  q("obstruction-midpoint", "中央障害物", "フレネルゾーン半径が大きくなりやすい位置は？", "経路の中央付近", "送信機の中だけ", "URLの末尾", "第1フレネルゾーンは経路中央付近で太くなります。中央障害物は影響が大きくなりやすいです。", toolLinks.fresnel),
  q("vegetation", "樹木の季節差", "屋外IoTで季節により通信が変わる理由として近いものは？", "樹木や葉の水分・密度が変わるため", "dBmが季節で別単位になるため", "距離が消えるため", "植生は水分や密度で損失が変わります。季節差は実測で確認します。", toolLinks.calculator),
  q("body-shadow", "人体遮蔽", "人体が端末近くに来る用途で見込む損失は？", "車両・人体遮蔽損失", "周波数プリセット", "Hataエリア種別だけ", "人体や車両がアンテナ近傍を遮る場合、近傍損失として別枠で見ます。", toolLinks.calculator),
  q("vehicle-shadow", "車両遮蔽", "車載・物流端末でRSSIが設置場所に強く依存する理由として近いものは？", "車体金属や荷物が遮蔽するため", "2.4GHzがMHzでないため", "受信感度が不要なため", "車体や荷物は大きな遮蔽・反射体です。設置場所と向きで受信状態が変わります。", toolLinks.calculator),
  q("enclosure-material", "筐体材質", "樹脂筐体でもアンテナ特性が変わる理由は？", "誘電率や配置、近傍部品が効くため", "樹脂は電波に絶対影響しないため", "距離が常に短くなるため", "樹脂でも誘電率や厚み、アンテナとの距離で共振や効率が変わることがあります。", toolLinks.wavelength),
  q("polarization-random", "姿勢ばらつき", "端末姿勢がランダムな用途で必要になりやすい余裕は？", "偏波ミスマッチや設置ばらつきマージン", "Git設定", "画面幅", "姿勢が変わると偏波や指向性の合い方が変わるため、余裕を見込みます。", toolLinks.calculator),
  q("installation-margin", "施工ばらつき", "量産・施工で個体差を吸収するための欄は？", "設置ばらつきマージン", "周波数プリセット", "ページタイトル", "設置方向、個体差、施工差はマージンとしてリンクバジェットへ入れます。", toolLinks.calculator),
  q("near-loss-separate", "近傍損失の分離", "端末近傍損失を分ける利点は？", "改善すべき物理要因を見つけやすい", "計算を不可能にする", "周波数を消す", "筐体、偏波、遮蔽などを分けると、改善策の優先度を考えやすくなります。", toolLinks.calculator),
  q("double-count-body", "人体損失の二重計上", "人体遮蔽を車両・人体遮蔽損失に入れた場合、同じ差分を実測補正にも入れると？", "二重計上になり得る", "必ず精度が上がる", "Hata範囲内になる", "同じ原因を複数欄に入れると悲観的すぎる結果になります。", toolLinks.calculator),
  q("measured-anchor", "アンカー測定", "実測補正でアンカー点を使う目的は？", "計算と現地測定のずれを合わせる", "周波数をMHzへ変換する", "画面を保存する", "既知距離で測ったRSSI/RSRPから、基準モデルとの差分を推定します。", toolLinks.calculator),
  q("single-point-risk", "一点補正の限界", "単一点補正を遠距離へ外挿するときの注意は？", "距離勾配が合っているとは限らない", "必ず全距離で完全一致", "周波数が不要になる", "一点補正は主にアンカー近傍の補正です。複数距離で勾配を確認します。", toolLinks.propagation),
  q("multi-point-n", "複数点でn推定", "Log-distanceのnを現地に合わせるには何が有効ですか？", "複数距離のRSSI/RSRP測定", "1つのスクリーンショットだけ", "送信機の色", "距離ごとの受信電力から、損失の傾きを推定できます。", toolLinks.propagation),
  q("rssi-noise", "RSSI揺れ", "RSSIが時間で揺れるときの実務対応として自然なのは？", "複数回測定し中央値や分布を見る", "1回だけで断定する", "単位を消す", "短時間のマルチパスや人の動きでRSSIは揺れます。複数回測定します。", toolLinks.calculator),
  q("snr-role", "SNRの役割", "RSSIだけでなくSNRを見る理由は？", "復調しやすさに効くため", "アンテナの色を決めるため", "距離をゼロにするため", "同じRSSIでもノイズが大きいと復調しにくくなります。SNRも確認します。", toolLinks.calculator),
  q("path-loss-from-rssi", "実測伝搬損失", "実測受信電力から伝搬損失を概算するとき、送信電力と利得から何を引きますか？", "受信電力", "ページ名", "周波数単位", "送信電力+利得-各種既知損失-受信電力で、実測ベースの経路損失を見積もります。", toolLinks.propagation),
  q("ground-reflection-not-wall", "地面反射と壁反射", "2波モデルが主に扱う反射は？", "地面反射", "室内の全壁反射を完全再現", "電源反射だけ", "2波モデルは直接波と地面反射波に単純化したモデルです。複雑な室内多重反射は完全には扱いません。", toolLinks.propagation),
  q("log-distance-use", "Log-distanceの用途", "Log-distanceモデルが使いやすい場面は？", "現地測定で距離勾配を合わせたい場面", "アンテナの色を選ぶ場面", "GitHubへログインする場面", "距離損失指数nを実測に合わせられるため、現場データとの相性が良いモデルです。", toolLinks.propagation),
  q("free-space-baseline", "FSPLの位置づけ", "FSPLはどんな基準として使うのが自然ですか？", "障害物のない見通しの下限的な基準", "屋内の全損失を含む保証値", "人体遮蔽そのもの", "自由空間損失は理想的な見通し条件の基準です。現場損失は別途見込みます。", toolLinks.fspl),
  q("low-height-model", "低高度の主役", "低高度端末同士で特に効きやすいものは？", "地面反射とフレネルゾーン欠損", "Hataだけ", "dBm変換だけ", "双方が低いと地面や周辺遮蔽物が経路へ入りやすくなります。", toolLinks.calculator),
  q("gateway-height", "ゲートウェイ高", "ゲートウェイを少し高くする効果として期待しやすいものは？", "見通しやフレネルクリアランス改善", "dBm単位の消滅", "受信感度の悪化のみ", "高さを上げると障害物や地面の影響が減り、経路条件が改善する場合があります。", toolLinks.calculator),
  q("obstacle-margin", "遮蔽マージン", "遮蔽物が一時的に増える現場で必要な考え方は？", "フェード余裕や設置ばらつきマージン", "警告を消す", "距離を未入力にする", "人や車両、荷物の移動がある現場では、一時的な悪化分を見込みます。", toolLinks.calculator),
  q("antenna-orientation", "アンテナ向き", "アンテナ向きを変えたらRSSIが変わる理由として近いものは？", "指向性と偏波が変わるため", "MHzがGHzになるため", "距離が自動で変わるため", "アンテナには方向性と偏波があります。向きが変わると受け取れる電力が変わります。", toolLinks.calculator),
  q("housing-test", "筐体あり試験", "アンテナ単体で良くても筐体組込みで確認する理由は？", "筐体・基板・電池で特性が変わるため", "単体測定が常に無意味なため", "dBが使えないため", "組込み後の近傍環境がアンテナ性能を変えるため、実機状態で確認します。", toolLinks.calculator),
  q("near-field", "近傍界の直感", "アンテナのすぐ近くに手や金属を置くと影響が大きい理由は？", "近傍界でアンテナ特性を乱すため", "地球の半径が変わるため", "周波数が消えるため", "アンテナ近傍では電磁界が強く、物体が特性へ影響しやすくなります。", toolLinks.wavelength),
  q("cable-vs-antenna", "ケーブルとアンテナ", "ケーブル損失とアンテナ利得の扱いで正しいものは？", "利得は足し、損失は引く", "どちらも足す", "どちらも無視する", "リンクバジェットでは利得と損失を符号で整理します。", toolLinks.calculator),
  q("floor-loss", "階差損失", "階をまたぐ屋内通信で見込みたい損失は？", "床や階差による追加損失", "dBm変換だけ", "GitHub Pages設定", "床・天井は大きな遮蔽物です。屋内通信では階差損失を考えます。", toolLinks.calculator),
  q("human-occupancy", "人の密度", "人の出入りでRSSIが変わる理由として近いものは？", "人体遮蔽や反射環境が変わるため", "周波数が変わるため", "アンテナ高が自動で200mになるため", "人は水分を含む遮蔽物であり、移動する反射体でもあります。", toolLinks.calculator),
  q("rain-basic", "雨の扱い", "920MHzや2.4GHzの短距離IoTで、雨より先に確認したいことは？", "筐体・設置・遮蔽・見通し", "ページタイトル", "Gitの履歴", "雨の影響もありますが、多くの低高度IoTではまず設置環境や遮蔽が支配的になりやすいです。", toolLinks.calculator),
  q("two-ray-vs-fspl", "2波とFSPL", "2波完全版がFSPLより良く見える距離がある理由は？", "強め合いが起きるため", "送信電力が増えるため", "受信感度が消えるため", "直接波と反射波が同相に近いと、局所的にFSPLより受信が強くなる場合があります。", toolLinks.propagation),
  q("two-ray-null-measure", "ヌル確認", "2波の谷が疑われるときの確認方法は？", "位置や高さを少し変えてRSSIを測る", "単位を消す", "警告を隠す", "干渉谷なら、数十cm〜数mの移動でRSSIが大きく変わることがあります。", toolLinks.propagation),
  q("terminal-height-record", "高さ記録", "実測時に端末アンテナ高を記録する理由は？", "伝搬条件の再現性に効くため", "表示色を決めるため", "GitHubに必要なため", "高さは2波、フレネル、Hata系で重要です。測定条件として記録します。", toolLinks.calculator),
  q("measurement-log", "測定ログ", "RSSI測定ログに残すべき情報として自然なのは？", "距離、周波数、高さ、姿勢、周辺状況", "好きな色だけ", "スクロール位置だけ", "後でモデル補正するには、測定条件と環境情報が必要です。", toolLinks.calculator),
  q("loss-bucket-audit", "損失棚卸し", "現場でRSSIが悪いとき、最初に行うとよい整理は？", "環境損失・近傍損失・実測残差を分ける", "全部を実測補正に入れる", "原因を見ない", "原因が分かる損失を個別欄へ分け、最後に残差を補正値へ入れると二重計上を避けられます。", toolLinks.calculator),
  q("apprentice-boss", "見習い章ボス", "低高度IoT通信の一次評価で最も避けたいことは？", "平均モデル単独で断定する", "実測を併用する", "近傍損失を分ける", "低高度では平均モデルに加え、近傍損失、2波、フレネル、実測補正を組み合わせます。", toolLinks.calculator)
];

const practitionerExpansionSeeds: QuestExpansionSeed[] = [
  q("mode-high-base", "高所基地局モード", "高所基地局→IoT端末でHata系を使うときの扱いは？", "広域平均損失の参考値", "端末近傍損失を完全に含む値", "受信感度の別名", "Hata系は基地局から移動局への平均損失を扱います。端末近傍損失は別に加算します。", toolLinks.calculator),
  q("mode-private-base", "プライベート基地局", "プライベート基地局→IoT端末で確認すべきものは？", "基地局高、端末高、環境損失、近傍損失", "ページの背景色だけ", "Gitのユーザー名だけ", "ローカル5Gや自営基地局でも、高さと端末周りの損失が評価に効きます。", toolLinks.calculator),
  q("mode-gateway-low", "低いゲートウェイ", "低いゲートウェイ→低高度端末で特に注意すべきものは？", "2波・フレネル・周辺遮蔽", "Hataだけで断定", "dBm変換だけ", "双方の高さが低い場合、地面や障害物の影響が強くなります。", toolLinks.calculator),
  q("mode-custom", "カスタムモード", "カスタムモードで大事な姿勢は？", "モデル警告を読みながら前提を明示する", "何を入れても保証値にする", "計算式を隠す", "カスタム条件では前提が多様です。入力値と警告を合わせて説明します。", toolLinks.calculator),
  q("hata-distance-range", "Hata距離範囲", "奥村・秦モデルの距離範囲目安として近いものは？", "1〜20km", "1〜20mm", "100〜200kmだけ", "一般的なHataの適用目安は1〜20kmです。範囲外は参考値として扱います。", toolLinks.propagation),
  q("hata-base-height", "Hata基地局高", "Hata系の基地局アンテナ高目安として近いものは？", "30〜200m", "0.01〜0.1m", "5000〜10000m", "Hata系は高所基地局を前提にした経験式です。基地局高30〜200mが目安です。", toolLinks.propagation),
  q("hata-mobile-height", "Hata移動局高", "Hata系の移動局アンテナ高目安として近いものは？", "1〜10m", "100〜200m", "0m固定", "移動局高は1〜10mが一般的な目安です。地上近傍では別途近傍損失を見ます。", toolLinks.propagation),
  q("cost-frequency", "COST231周波数", "COST231-Hataの周波数目安として近いものは？", "1500〜2000MHz付近", "1〜10Hz", "100GHzだけ", "COST231-HataはHataをより高い周波数の都市マクロへ拡張したモデルです。", toolLinks.propagation),
  q("area-open", "開放地補正", "Hata系で開放地を選ぶと、市街地に比べて損失はどうなりやすいですか？", "小さくなりやすい", "必ず大きくなる", "変化しない", "開放地補正では、市街地より遮蔽物が少ない前提として損失が下がります。", toolLinks.propagation),
  q("area-urban-large", "大都市補正", "Hata系の大都市設定で意識するものは？", "都市クラッタによる移動局高補正", "ケーブル色", "ブラウザ幅", "Hata系では都市規模に応じた移動局アンテナ高補正が入ります。", toolLinks.propagation),
  q("warning-out-of-range", "範囲外警告", "適用範囲外警告が出た結果の扱いは？", "参考値として扱い、他モデルや実測を併用する", "保証値として扱う", "必ず削除する", "範囲外でも比較材料にはなりますが、判断はリンクバジェットや実測補正と併用します。", toolLinks.calculator),
  q("low-height-hata-warning", "低高度Hata警告", "低高度端末同士でHataを選んだときの注意は？", "主モデルとして推奨しない", "最も正確と断定", "近傍損失が不要", "低高度端末同士は地面反射や遮蔽が支配的で、Hata単独判定は避けます。", toolLinks.calculator),
  q("measured-correction-missing", "実測未入力警告", "実測補正が未入力の場合に推奨されることは？", "現地RSSI/RSRPで補正する", "測定しない", "警告を隠す", "低高度IoTでは設置環境ばらつきが大きいため、現地測定で補正することを推奨します。", toolLinks.calculator),
  q("clutter-loss", "クラッタ損失", "研究ベース距離計算でクラッタ・環境損失はどう扱われますか？", "許容中央値損失から差し引く追加損失", "送信利得に足す固定値", "周波数単位", "環境損失は通信に使える余力を減らすため、最大距離を短くする方向に効きます。", toolLinks.calculator),
  q("reliability-z", "z値", "目標信頼率が上がると、信頼率マージンはどうなりやすいですか？", "大きくなる", "必ずゼロになる", "負になる", "高い信頼率では、悪い側のばらつきを見込むためz×σが大きくなります。", toolLinks.calculator),
  q("fade-margin", "追加フェード余裕", "追加フェード余裕は何のために入れますか？", "未モデル化の時間変動や悪条件への余裕", "画面の余白調整", "単位変換", "雨、人、車両、干渉など式に入れきれない変動への余裕として使います。", toolLinks.calculator),
  q("ci-model", "CIモデル", "CIモデルの基準点としてよく使う距離は？", "1m", "1km固定のみ", "0m", "Close-inモデルは1m基準の自由空間損失から距離勾配を足します。", toolLinks.calculator),
  q("dual-slope", "Dual-slope", "Dual-slope CIモデルの特徴は？", "途中で距離勾配が変わる", "常にn=0", "周波数を使わない", "近距離と遠距離で損失傾きが変わる環境を近似します。", toolLinks.calculator),
  q("sui-compare", "SUI比較", "SUI Terrain A/B/Cを比較する目的は？", "地形・クラッタ条件による距離差を見る", "dBmをmWへ変換する", "VSWRを下げる", "丘陵・平坦などの環境差をモデルの幅として確認します。", toolLinks.calculator),
  q("cost-wi-parameters", "COST WI入力", "COST231 Walfisch-Ikegamiで都市街路評価に効く入力は？", "建物高、道路幅、道路角度など", "ボタン色", "GitHubトークン", "都市街路NLOSでは屋根越しや街路回折を近似するため、街路形状の入力が効きます。", toolLinks.calculator),
  q("calibration-anchor-distance", "アンカー距離外挿", "実測アンカー距離と評価距離が大きく離れるときの注意は？", "外挿になり、勾配確認が必要", "必ず精度が上がる", "距離は無関係", "単一点補正はアンカー近傍向けです。離れた距離では複数点確認が必要です。", toolLinks.calculator),
  q("slope-correction", "勾配補正", "IoT実測補正Hataの距離勾配補正はいつ使うと自然ですか？", "複数距離でHata基準より傾きがずれるとき", "測定が全くないとき", "ページを印刷するとき", "複数測定で遠距離側が悪いなどの傾向が分かる場合に使います。", toolLinks.calculator),
  q("same-metric", "同じ測定指標", "実測補正でRSSI/RSRPを比較するとき重要なのは？", "同じ指標・同じ条件で比較する", "毎回違う指標にする", "単位を消す", "RSSIとRSRPは意味が違います。同じ指標で継続比較します。", toolLinks.calculator),
  q("receiver-sensitivity-condition", "感度条件", "仕様書の受信感度を見るとき確認したい条件は？", "帯域幅、データレート、変調、品質条件", "ページの色", "Gitのブランチ名", "感度は通信条件で変わります。仕様条件と実運用条件を合わせます。", toolLinks.calculator),
  q("tx-power-limit", "送信電力制約", "送信電力を上げれば常に解決と言えない理由は？", "法規制、消費電力、干渉があるため", "dBmが使えないため", "距離が不要になるため", "送信電力には規制や電池寿命、周辺干渉の制約があります。", toolLinks.calculator),
  q("antenna-gain-tradeoff", "利得のトレードオフ", "高利得アンテナの注意点は？", "向きや設置ずれに敏感になりやすい", "必ず全方向に強くなる", "ケーブル損失が消える", "高利得は方向性を持つことが多く、狙う方向と姿勢が重要です。", toolLinks.calculator),
  q("practical-review", "設計レビュー", "リンク計算レビューで一緒に出すべきものは？", "入力前提、モデル警告、測定有無", "正解だけ", "画像サイズだけ", "数値だけでなく、どの前提で計算したかが重要です。", toolLinks.calculator),
  q("result-not-guarantee", "一次評価", "本ツールの結果の位置づけとして正しいものは？", "一次評価であり最終可否は実測確認", "保証値", "法規証明書", "計算は設計初期の判断材料です。最終判断には現地測定が必要です。", toolLinks.calculator),
  q("hata-area-lock", "エリア固定ではない", "Hata系のエリア種別について正しい説明は？", "市街地・郊外・開放地を選択して補正する", "常に大都市固定", "使わない", "エリア種別は伝搬損失に影響するため、条件に近いものを選びます。", toolLinks.propagation),
  q("height-not-fixed", "高さ固定ではない", "Hata系の空中線地上高について正しい説明は？", "入力した送信高・受信高をhb/hmとして使う", "常に固定値", "式に入らない", "本ツールでは送信側アンテナ高をhb、受信側をhmとして反映します。", toolLinks.calculator),
  q("model-family", "モデル族の使い分け", "低高度端末同士で主に比較したいモデル群は？", "FSPL、2波、Log-distance、実測補正", "Hataのみ", "VSWRのみ", "低高度では地面反射や現地勾配を扱いやすいモデルを中心に比較します。", toolLinks.calculator),
  q("budget-plus-calibration", "組み合わせ判定", "通信可否判定でHata単独ではなく組み合わせたいものは？", "リンクバジェット、近傍損失、実測補正", "ページ背景", "Gitログ", "広域平均モデルに、端末近傍の現実要因と実測差分を組み合わせます。", toolLinks.calculator),
  q("sensitivity-line", "感度ライン図", "受信電力と受信感度ラインの図で分かることは？", "余裕が感度線の上か下か", "基板厚", "GitHubのURL", "受信電力が感度線より上なら余裕、下なら成立が難しいことを直感的に見られます。", toolLinks.calculator),
  q("distance-chart", "距離カーブ", "距離別受信電力グラフで見るべき点は？", "どの距離で感度線を下回るか", "CSSの影", "ヘッダーの高さ", "距離を伸ばしたときに受信電力がどこで限界を超えるかを確認します。", toolLinks.calculator),
  q("research-sheet-not-final", "研究シートの限界", "研究ベース距離計算シートでも最終確認が必要な理由は？", "地形・建物・筐体の全詳細は再現しないため", "計算していないため", "距離を使わないため", "標準モデルは有用ですが、現場固有の詳細は実測で閉じる必要があります。", toolLinks.calculator),
  q("model-compare-width", "モデル差の幅", "複数モデルの結果が大きく違うときの実務対応は？", "前提差を確認し、実測で絞り込む", "一番長い距離だけ採用する", "警告を非表示にする", "モデル差は不確かさのサインです。通信形態や適用範囲を確認し、測定で補正します。", toolLinks.calculator),
  q("field-note-template", "現地メモ", "現地評価で写真やメモを残す理由は？", "後から損失原因を説明しやすくするため", "計算式を消すため", "RSSIを不要にするため", "端末位置、筐体向き、遮蔽物、周辺設備を記録すると、補正値の理由を説明できます。", toolLinks.calculator),
  q("acceptance-criteria", "合格条件", "量産前評価で決めておきたいものは？", "必要リンクマージンや測定条件の合格基準", "ボタン色だけ", "問題番号だけ", "評価の合否基準がないと、測定結果をどう判断するかが曖昧になります。", toolLinks.calculator),
  q("workflow-order", "実務フロー", "一次評価の自然な順番は？", "プリセット→入力調整→警告確認→実測補正→再評価", "警告非表示→断定", "実測なしで終了", "段階的に前提を現実へ寄せると、説明可能な判断になります。", toolLinks.calculator),
  q("practitioner-boss", "実務者章ボス", "実務者として最も重要な姿勢は？", "モデルの前提と現場差を説明できること", "数値を大きく見せること", "警告を無視すること", "モデル選択、損失の入れ分け、実測補正の理由を説明できると、設計レビューに耐えます。", toolLinks.calculator)
];

const expertExpansionSeeds: QuestExpansionSeed[] = [
  q("carrier-cell-edge", "セル端設計", "基地局設計でセル端を評価するとき重要な観点は？", "目標品質とカバレッジ確率", "画面の角丸", "GitHubスター数", "セル端では平均値だけでなく、どの確率で品質を満たすかが重要です。", toolLinks.calculator),
  q("interference-limited", "干渉制限", "受信電力が十分でも通信品質が悪い場合に疑うものは？", "干渉やノイズ", "ページタイトル", "アンテナ長だけ", "無線品質は受信電力だけでなく、干渉やSNR/SINRにも左右されます。", toolLinks.calculator),
  q("capacity-coverage", "容量とカバレッジ", "基地局設計でカバレッジだけでは不足する理由は？", "収容台数やトラフィックも効くため", "距離が存在しないため", "dBmが使えないため", "届く範囲と、何台をどの速度・品質で収容するかは別の設計軸です。", toolLinks.calculator),
  q("antenna-tilt", "アンテナチルト", "基地局アンテナのチルトを調整する目的として近いものは？", "カバレッジと干渉範囲を制御する", "dBmをmWにする", "ケーブル色を変える", "チルトはセル範囲や隣接セル干渉に影響します。", toolLinks.calculator),
  q("antenna-pattern", "アンテナパターン", "基地局設計でアンテナパターンを考慮する理由は？", "方向ごとの利得が異なるため", "周波数が不要になるため", "距離が固定になるため", "実アンテナの利得は方向で変わります。全方向同じとは限りません。", toolLinks.calculator),
  q("downtilt-risk", "過大チルト", "ダウンチルトを強くしすぎると起き得ることは？", "遠方カバレッジが縮む", "受信感度が必ず改善", "周波数がゼロになる", "下向きにしすぎるとセル端へ届く電力が減る場合があります。", toolLinks.calculator),
  q("sectorization", "セクタ化", "セクタアンテナを使う主な狙いは？", "方向別に容量や干渉を制御する", "単位を変える", "距離を消す", "セクタ化は方向ごとに電波を分け、容量や干渉制御に使います。", toolLinks.calculator),
  q("drive-test", "ドライブテスト", "ドライブテストや現地測定を行う目的は？", "モデルと実環境の差を補正する", "ページを飾る", "計算式を不要にするだけ", "実測により地形、建物、クラッタ、干渉の影響を確認し、モデルを補正します。", toolLinks.calculator),
  q("gis-building", "建物高GIS", "都市部で建物高データが効く理由は？", "遮蔽や屋根越し回折に影響するため", "dBm変換のため", "VSWR計算のため", "建物高はLOS/NLOSや回折損、街路伝搬に大きく影響します。", toolLinks.calculator),
  q("clutter-class", "クラッタ分類", "クラッタ分類の例として自然なのは？", "市街地、森林、水面、開放地", "ボタン、フォーム、リンク", "Git、commit、push", "土地利用や障害物密度の分類を使い、追加損失やモデル選択を調整します。", toolLinks.calculator),
  q("wi-rooftop", "屋根越し回折", "COST231 Walfisch-Ikegami NLOSで意識する伝搬は？", "屋根越しと街路回折", "dBm/mW変換", "基板インピーダンスだけ", "都市街路NLOSで、建物列による屋根越し・街路方向の影響を扱います。", toolLinks.calculator),
  q("street-angle", "道路角度", "都市街路モデルで道路角度が効く理由は？", "街路方向と到来方向の関係が損失に効くため", "アンテナ色が変わるため", "距離が必ずゼロになるため", "街路に沿うか横切るかで伝搬しやすさが変わります。", toolLinks.calculator),
  q("sui-terrain-b", "Terrain B", "SUI Terrain BはA/Cの中でどの位置づけに近いですか？", "中間的な地形・クラッタ", "最も平坦だけ", "最も厳しいだけ", "Terrain BはAとCの中間的な条件として比較に使います。", toolLinks.calculator),
  q("3gpp-los", "LOS/NLOS分岐", "3GPPモデルでLOS/NLOSを分ける理由は？", "見通し有無で損失とばらつきが変わるため", "dBm単位のため", "アンテナ色のため", "LOSとNLOSでは距離損失、シャドウフェージング、到来波の性質が変わります。", toolLinks.calculator),
  q("uma-vs-umi", "UMaとUMi", "UMaとUMiの違いとして近いものは？", "都市マクロと都市マイクロ", "dBとdBm", "VSWRとSWR", "UMaはUrban Macro、UMiはUrban Microです。基地局高や街区条件が異なります。", toolLinks.calculator),
  q("height-above-rooftop", "屋根上条件", "マクロセルモデルで基地局アンテナ高が重要な理由は？", "周辺屋根や遮蔽との関係が変わるため", "単位が変わるため", "周波数が消えるため", "基地局高が周辺屋根より高いかどうかで、見通しや回折条件が変わります。", toolLinks.calculator),
  q("planning-margin", "設計マージン", "キャリア設計で余裕を取る理由は？", "端末差、場所差、時間変動、干渉を吸収するため", "見た目をよくするため", "距離を消すため", "現実の通信は平均値から揺れるため、設計マージンで品質を安定させます。", toolLinks.calculator),
  q("handover-overlap", "重なりカバレッジ", "セル同士のカバレッジ重なりが必要になる理由は？", "移動時の切替や冗長性に効くため", "dBmを消すため", "アンテナを短くするため", "移動端末ではセル間の切替が必要です。重なりが少ないと切断しやすくなります。", toolLinks.calculator),
  q("uplink-downlink", "上り下り差", "セルラーIoTで上りと下りを分けて考える理由は？", "送信電力やアンテナ条件が異なるため", "距離が違う単位になるため", "Hataが使えないため", "基地局と端末では送信電力、アンテナ、受信性能が異なります。", toolLinks.calculator),
  q("battery-tradeoff", "電池寿命", "IoT端末で通信距離だけを伸ばせばよいと言えない理由は？", "送信電力や再送が電池寿命に効くため", "RSSIが不要なため", "アンテナが不要なため", "遠距離・悪環境では送信電力や再送が増え、電池寿命へ影響します。", toolLinks.calculator),
  q("adaptive-data-rate", "ADR的発想", "LPWAで環境に応じてデータレートや送信条件を変える狙いは？", "信頼性と電池・容量のバランスを取る", "距離を計算しない", "周波数を固定しない", "余裕がある端末は軽い設定、厳しい端末は堅い設定にすることで全体最適を狙います。", toolLinks.calculator),
  q("gateway-density", "ゲートウェイ密度", "ゲートウェイ数を増やす効果として自然なのは？", "距離短縮や冗長性向上", "単位変換", "アンテナ利得の定義変更", "複数ゲートウェイにより端末から近い受信点が増え、成功率や冗長性が上がります。", toolLinks.calculator),
  q("site-selection", "局設置候補", "基地局・ゲートウェイ設置候補で見るべきものは？", "高さ、見通し、電源、回線、保守性", "背景色だけ", "問題数だけ", "電波だけでなく、設置・運用・保守の条件も局選定に効きます。", toolLinks.calculator),
  q("indoor-penetration", "屋内侵入", "屋外基地局から屋内端末を見るとき追加で意識するものは？", "建物侵入損失", "dBm/mW変換だけ", "VSWRだけ", "外壁や窓、階数により屋内へ入る損失が大きく変わります。", toolLinks.calculator),
  q("basement", "地下・深部屋内", "地下や深部屋内IoTで特に厳しい要因は？", "建物侵入・階差・遮蔽損失", "アンテナ色", "ページURL", "深部屋内では外壁や床を何枚も通るため、通常より大きな損失を見込みます。", toolLinks.calculator),
  q("roaming-variance", "端末分布", "端末が広く分散するIoTで平均距離だけでは危ない理由は？", "端末ごとに遮蔽・高さ・方位が違うため", "全端末が同じ場所にあるため", "dBが使えないため", "端末ごとの環境差が大きいため、分布やワーストケースも見ます。", toolLinks.calculator),
  q("coverage-probability", "カバレッジ確率", "カバレッジ確率の考え方として近いものは？", "場所や端末の何%で条件を満たすか", "ページの何%が青いか", "Gitの成功率だけ", "通信成立を平均値ではなく確率で評価する考え方です。", toolLinks.calculator),
  q("monte-carlo", "ばらつきシミュレーション", "多数端末の設計でモンテカルロ的に見る意義は？", "ばらつき込みの成立率を見る", "単位を消す", "送信電力を固定しない", "端末位置や遮蔽、フェージングばらつきをランダムに振り、成立率を見ます。", toolLinks.calculator),
  q("ray-trace", "レイトレース", "詳細な都市部設計でレイトレースが使われる理由は？", "建物反射・回折・遮蔽を幾何的に扱うため", "dBm変換のため", "GitHub Pagesのため", "建物形状が分かる場合、反射や回折経路を詳細に推定できます。", toolLinks.calculator),
  q("calibrated-model", "校正済みモデル", "標準モデルを現地実測で校正する理由は？", "地域固有のクラッタや設置差を吸収するため", "モデルを使わないため", "周波数を変えるため", "標準式は一般化された式です。地域・建物・植生の差は実測で補正します。", toolLinks.calculator),
  q("measurement-density", "測定密度", "ドライブテストで測定点密度が低いと起きる問題は？", "局所的な影や谷を見逃しやすい", "計算が必ず正確", "RSSIが消える", "測定点が粗いと、小さな遮蔽やマルチパスの谷を拾えない場合があります。", toolLinks.calculator),
  q("time-variation", "時間変動", "同じ場所でも時間でRSSIが変わる理由として近いものは？", "人・車両・環境・干渉が変わるため", "距離が毎秒単位変換されるため", "dBが消えるため", "現場環境は動的です。時間帯や稼働状況による変化も考慮します。", toolLinks.calculator),
  q("regulatory", "法規制", "送信電力やチャネル設定で確認すべきものは？", "各国・各帯域の法規制", "CSS設定", "コミットメッセージ", "無線設備は法規制に従う必要があります。計算上届いても規制範囲内で設計します。", toolLinks.calculator),
  q("spatial-nonstationarity", "空間非定常性", "大規模アレイや高周波で空間非定常性が話題になる理由は？", "アンテナ位置により見える散乱体が変わるため", "dBmが使えないため", "HTML構造のため", "大きなアレイや高周波では、アレイ全体で同じチャネルとみなせないことがあります。", toolLinks.calculator),
  q("near-field-expert", "近傍界設計", "大規模アレイや近距離高周波で近傍界が問題になる理由は？", "平面波近似が崩れる場合があるため", "距離が不要なため", "受信感度が消えるため", "距離が近い・開口が大きい場合、波面の曲率を考慮する必要が出ます。", toolLinks.calculator),
  q("beamforming", "ビームフォーミング", "ビームフォーミングで距離評価が単純でなくなる理由は？", "方向ごとの利得と干渉条件が変わるため", "dBmが使えないため", "周波数が不要になるため", "ビーム方向、サイドローブ、端末姿勢により実効利得が変わります。", toolLinks.calculator),
  q("network-kpi", "ネットワークKPI", "距離計算後に運用で見るKPIとして自然なのは？", "接続率、再送率、SNR、電池消費", "CSSサイズ", "コミット数", "通信距離の机上値だけでなく、運用中の成功率や再送、電池消費を確認します。", toolLinks.calculator),
  q("multi-band", "マルチバンド", "複数周波数帯で距離見積りが変わる理由は？", "周波数ごとに損失・回折・アンテナ特性が違うため", "単位が同じだから変わらない", "Git設定が違うため", "低周波と高周波ではFSPL、遮蔽、アンテナサイズが変わります。", toolLinks.calculator),
  q("link-budget-limit", "リンクバジェットの限界", "リンクバジェットだけでは直接見えにくいものは？", "干渉、容量、プロトコル再送、時間変動", "送信電力", "アンテナ利得", "リンクバジェットは受信電力の一次評価です。ネットワーク品質の全てではありません。", toolLinks.calculator),
  q("expert-boss", "玄人章ボス", "玄人として距離計算を扱う最もよい姿勢は？", "標準式、地図、実測、運用条件を組み合わせる", "式1つで全て断定する", "警告を削除する", "実務の距離設計は複数の根拠を重ねる作業です。単一モデルに寄せすぎないことが大切です。", toolLinks.calculator)
];

const researcherExpansionSeeds: QuestExpansionSeed[] = [
  q("env-covariates-temperature", "温度特徴量", "屋内LoRaWAN環境特徴量で温度を入れる狙いとして近いものは？", "環境変動とRSSI残差の関係を見る", "送信電力を増やす", "距離を消す", "温度は人の活動や空調状態とも関係し、RSSI変動の説明変数になり得ます。", toolLinks.calculator, "環境特徴量は物理モデルを置き換える魔法ではなく、残差の説明を助ける補助情報です。", [sources.loraDataset2025, sources.envAware2025]),
  q("env-covariates-humidity", "湿度特徴量", "湿度を特徴量に入れる研究上の狙いは？", "伝搬環境や占有状態の変化を説明するため", "Git操作を省くため", "波長を固定するため", "湿度単体が全てを決めるわけではありませんが、屋内環境の変動を表す候補になります。", toolLinks.calculator, "2025年の屋内LoRaWAN研究では、温湿度やCO2など複数特徴量を組み合わせています。", [sources.loraDataset2025]),
  q("co2-occupancy", "CO2と人の活動", "CO2濃度がIoT伝搬研究で使われる理由として近いものは？", "人の占有状態の代理変数になり得るため", "周波数をGHzへ変換するため", "アンテナ長を測るため", "CO2は人の滞在や換気状態に関係し、人体遮蔽や環境変化の説明に役立つ場合があります。", toolLinks.calculator, "環境特徴量は直接の電波物理だけでなく、占有状態の代理情報として使われます。", [sources.loraDataset2025, sources.envAware2025]),
  q("pm25-scattering", "粒子状物質", "PM2.5など粒子状物質を特徴量に含める意味として近いものは？", "環境状態の変化を統計的に捉える候補", "必ず主要損失になる", "dBmを定義する", "粒子状物質が常に支配的とは限りませんが、環境変動の特徴量として評価対象になります。", toolLinks.calculator, "特徴量の有効性はデータで検証します。入れれば必ず良くなるわけではありません。", [sources.loraDataset2025]),
  q("barometric-pressure", "気圧特徴量", "気圧を特徴量に入れる研究の狙いとして近いものは？", "環境状態の時系列変化を捉える", "アンテナ利得を固定する", "距離を削除する", "気圧は空調や天候、環境変化の一部を表す候補です。統計的に有意かを検証します。", toolLinks.calculator, "環境特徴量は、測定キャンペーンの文脈で意味を持ちます。別現場へ外挿するには注意が必要です。", [sources.envAware2025]),
  q("rmse-vs-reliability", "RMSEと信頼性", "RMSEが下がっても、それだけで十分と言えない理由は？", "高信頼率では残差上側分位も重要だから", "平均が不要だから", "距離が使えないから", "平均誤差が小さくても、悪い側の外れが大きいと通信失敗が残ります。", toolLinks.calculator, "研究者モードではRMSEだけでなく、残差分布とフェードマージンを合わせて見ます。", [sources.envAware2025]),
  q("gaussian-mixture", "混合分布", "残差に混合分布を使う理由として近いものは？", "鋭い中心と広い裾を同時に表すため", "平均を消すため", "周波数を増やすため", "屋内RSSI残差は単純な正規分布だけでは表しにくいことがあります。", toolLinks.calculator, "環境認識型研究では、残差の非ガウス性を見て信頼率マージンへつなげています。", [sources.envAware2025]),
  q("student-t", "Student-t分布", "残差評価でStudent-t分布を候補にする理由は？", "重い裾を表しやすいため", "必ず平均をゼロにするため", "dBを線形にするため", "外れ値や重い裾がある場合、正規分布より合うことがあります。", toolLinks.calculator, "分布選択は、通信失敗側のリスク見積もりに直結します。", [sources.envAware2025]),
  q("bootstrap", "ブートストラップ", "フェードマージン推定でブートストラップを使う狙いは？", "不確かさを推定するため", "距離を固定するため", "単位変換のため", "有限の測定データから推定した分位点には不確かさがあります。", toolLinks.calculator, "2025年の研究では、移動ブロックブートストラップで時間相関を考慮した不確かさ評価も行っています。", [sources.envAware2025]),
  q("moving-block", "移動ブロック", "時系列測定で移動ブロックブートストラップを使う理由は？", "時間相関を壊しすぎないため", "全データを捨てるため", "Hata式を消すため", "連続測定は独立ではない場合があります。ブロック化で相関を保ちます。", toolLinks.calculator, "測定データの独立性を仮定しすぎると、信頼区間が楽観的になることがあります。", [sources.envAware2025]),
  q("leakage-safe", "リーク防止", "クロスバリデーションでリークを避ける理由は？", "未知データでの性能を過大評価しないため", "正答を隠すため", "単位を変えるため", "同じ環境の情報が学習と検証に漏れると、性能が良く見えすぎます。", toolLinks.propagation, "測定研究では、評価方法そのものが結果の信頼性を左右します。", [sources.envAware2025, sources.envKal2025]),
  q("holdout", "ホールドアウト", "ホールドアウト検証の目的は？", "未使用データで汎化性能を見る", "全部を学習に使う", "RSSIを消す", "モデル作成に使っていないデータで確認することで、過学習を見つけやすくなります。", toolLinks.propagation, "現場展開を考えるなら、未知条件への外挿を意識した検証が必要です。", [sources.envAware2025]),
  q("adaptive-kalman", "適応カルマン", "EnviKal-LocでRSSI平滑化に使われた手法は？", "適応カルマンフィルタ", "フーリエ変換だけ", "Hata固定値だけ", "適応カルマンフィルタにより、一時的な揺れと持続的な傾向を分けようとしています。", toolLinks.propagation, "RSSIは瞬間値だけで判断すると危険です。時系列処理で安定した特徴を抽出する研究が進んでいます。", [sources.envKal2025]),
  q("kalman-mae", "測位誤差改善", "EnviKal-Locの文脈で、環境特徴量と平滑化が狙ったものは？", "屋内LoRaWAN測位誤差の低減", "送信電力の法規変更", "GitHub Pagesの高速化", "環境特徴量とRSSI平滑化を組み合わせ、屋内測位精度を改善する研究です。", toolLinks.propagation, "リンク距離評価にも、時系列RSSIの扱いは参考になります。", [sources.envKal2025]),
  q("million-samples", "大規模測定", "132万件規模の測定データから学べることは？", "ばらつきと再現性を統計的に見られる", "1点だけで十分", "距離は不要", "大規模データは、平均だけでなく分布や条件依存性を見る力を持ちます。", toolLinks.propagation, "測定点数が多いほど、環境や時間のばらつきを評価しやすくなります。", [sources.envKal2025]),
  q("aerpaw-platforms", "AERPAWプラットフォーム", "2026年AERPAW LoRaWAN実測で比較されたものは？", "地上車両、ドローン、ヘリカイト", "机、椅子、棚", "HTML、CSS、JS", "高度や移動状態の違いがRSSI/SNRや成功率へどう効くかを比較しています。", toolLinks.calculator, "高度と移動体の違いは、低高度IoTの距離評価にも示唆があります。", [sources.aerpaw2026]),
  q("helikite-stability", "ヘリカイト安定性", "AERPAW研究でヘリカイトが安定しやすかった理由として近いものは？", "高高度で安定した位置を保てたため", "RSSIを使わないため", "地上遮蔽を増やしたため", "安定した高高度プラットフォームは遮蔽や地形の影響を受けにくくなります。", toolLinks.calculator, "高度を上げる効果は、ゲートウェイ設置高を考えるときにも参考になります。", [sources.aerpaw2026]),
  q("ground-vehicle-variability", "地上車両ばらつき", "地上車両測定でばらつきが増えやすい理由は？", "地形、遮蔽、移動によるマルチパスが効くため", "単位が変わるため", "測定しないため", "低高度・移動体では周辺遮蔽や反射条件が時々刻々と変わります。", toolLinks.calculator, "低高度端末では、車両や人体遮蔽を近傍損失として分ける設計が重要です。", [sources.aerpaw2026]),
  q("spreading-factor", "Spreading Factor", "LoRaWANでSFを見る理由は？", "復調しきい値とデータレートに効くため", "周波数単位を変えるため", "アンテナ長を固定するため", "SFにより感度やデータレートが変わり、距離と信頼性のバランスが変わります。", toolLinks.calculator, "距離評価ではRSSIだけでなく、SNR、SF、成功率も見ると実態へ近づきます。", [sources.aerpaw2026]),
  q("snr-boxplot", "SNR箱ひげ", "距離ビンごとのSNR箱ひげ図を見る意味は？", "距離ごとのばらつきを見る", "平均だけを隠す", "単位を消す", "同じ距離帯でもSNRには分布があります。箱ひげ図はばらつきを直感的に示します。", toolLinks.calculator, "平均値だけでは、通信失敗側の尾を見逃すことがあります。", [sources.aerpaw2026]),
  q("packet-success", "成功確率", "RSSI/SNRに加えてパケット成功率を見る理由は？", "最終的な通信成立に近い指標だから", "距離を計算しないため", "dBmが不要だから", "実運用では信号強度だけでなく、実際に届いたかが重要です。", toolLinks.calculator, "成功率を距離別に見ると、リンクマージンと実通信品質の関係が分かりやすくなります。", [sources.aerpaw2026]),
  q("p1812-clutter", "P.1812クラッタ", "P.1812-7の農村推定で重要な地理入力は？", "標高、土地被覆、クラッタ高さ", "ページ色", "Git設定", "地理データの選択が伝搬推定の精度に影響します。", toolLinks.calculator, "農村部でも、森林や地形の扱いは距離推定に効きます。", [sources.p1812Geo2025]),
  q("gfch", "樹冠高データ", "GFCHのような樹冠高データが使われる理由は？", "森林クラッタ高さの目安になるため", "RSSIを直接測るため", "受信感度を定義するため", "森林は遮蔽や回折に効くため、樹冠高データが有用な場合があります。", toolLinks.calculator, "高解像度データが常に最良とは限らず、利用可能性や更新性も重要です。", [sources.p1812Geo2025]),
  q("worldcover", "土地被覆", "土地被覆データを使う目的は？", "地表のクラッタ種別を推定する", "dBmを変換する", "アンテナ重さを測る", "市街地、森林、農地、水面などで伝搬条件が変わるため、土地被覆を使います。", toolLinks.calculator, "クラッタ分類は標準モデルと実地形の橋渡しです。", [sources.p1812Geo2025]),
  q("resolution-tradeoff", "解像度の罠", "地理データの高解像度化について正しい注意は？", "高解像度が常に良いとは限らない", "必ず誤差ゼロ", "低解像度は必ず無価値", "分類品質、更新性、代表クラッタ高さの割当が結果を左右します。", toolLinks.calculator, "データの細かさだけでなく、正しさと現場への適合性が重要です。", [sources.p1812Geo2025]),
  q("rel19-gap", "7〜24GHzギャップ", "Rel-19 TR 38.901拡張で注目された周波数ギャップは？", "7〜24GHz", "1〜2Hz", "音声帯域だけ", "sub-6GHzとmmWaveの間の帯域をより正確に扱う議論があります。", toolLinks.calculator, "6G候補帯として、中間周波数帯のモデル整備が重要になっています。", [sources.rel19]),
  q("rel19-sma", "Suburban Macro", "Rel-19拡張で強化対象として挙げられるシナリオの一つは？", "Suburban Macro", "dBm Converter", "VSWRだけ", "郊外マクロセルの現実的なモデル化が拡張論点に含まれます。", toolLinks.calculator, "標準モデルも、利用帯域や展開形態の変化に合わせて見直されます。", [sources.rel19]),
  q("ut-antenna", "UTアンテナモデル", "Rel-19でUTアンテナモデルが重要になる理由は？", "端末アンテナの現実的な特性がチャネルに効くため", "HTML構造のため", "距離を不要にするため", "端末側アンテナの向きや偏波、実装はチャネル評価に影響します。", toolLinks.calculator, "IoT端末でも、アンテナ実装と筐体は距離見積りに直結します。", [sources.rel19]),
  q("polarization-framework", "偏波パワー変動", "Rel-19で偏波に関する議論が重要な理由は？", "全偏波間の電力変動を扱うため", "dBmを使わないため", "周波数を固定するため", "偏波の扱いはMIMOや端末姿勢、実アンテナ評価に関わります。", toolLinks.calculator, "偏波ミスマッチ損失を別枠で見る設計思想にもつながります。", [sources.rel19]),
  q("cluster-rays", "クラスタとレイ", "チャネルモデルでクラスタ数やレイ数の変動を扱う理由は？", "多重波環境のばらつきを表すため", "受信感度を固定するため", "Gitを速くするため", "反射・散乱の集合をクラスタやレイとして表し、環境差をモデル化します。", toolLinks.calculator, "単純な距離損失だけでは、MIMOや高周波のチャネル構造を表しきれません。", [sources.rel19]),
  q("near-field-rel19", "近傍界Rel-19", "Rel-19で近傍界が論点になる理由は？", "大規模アレイや近距離で平面波近似が崩れるため", "RSSIを使わないため", "HTMLが必要なため", "高周波・大開口では近傍界効果が無視できない場合があります。", toolLinks.calculator, "IoT低高度でもアンテナ近傍の物体影響は重要です。スケールは違っても前提確認の姿勢は同じです。", [sources.rel19]),
  q("spatial-nonstationarity-research", "空間非定常性", "空間非定常性とは何に近い考え方ですか？", "場所によりチャネル統計が同じでないこと", "全場所で同じRSSIになること", "距離が不要になること", "大規模アレイや複雑環境では、空間内で見える散乱体が変わります。", toolLinks.calculator, "平均モデルの限界を理解し、場所差を測定で補正する考え方につながります。", [sources.rel19]),
  q("measurement-metadata", "測定メタデータ", "研究データでRSSI値と一緒に残したいものは？", "距離、高さ、時刻、環境、端末姿勢", "色名だけ", "GitHubのスター数", "メタデータがないと、残差の理由を後から説明しにくくなります。", toolLinks.propagation, "実測補正を研究レベルで扱うには、測定条件の記録が不可欠です。", [sources.loraDataset2025, sources.envAware2025]),
  q("feature-selection", "特徴量選択", "環境特徴量を増やすときの注意は？", "有意性と汎化性能を検証する", "全部入れれば必ず良い", "測定しない", "特徴量が多いほど過学習リスクも増えます。検証データで確認します。", toolLinks.propagation, "2025年研究では統計検定や正則化も使い、特徴量の有効性を慎重に見ています。", [sources.envAware2025]),
  q("regularization", "正則化", "回帰モデルで正則化を使う目的は？", "過学習を抑える", "距離を消す", "受信感度を固定する", "係数を抑制し、未知データでの性能低下を防ぐ狙いがあります。", toolLinks.propagation, "特徴量モデルを現場展開するには、説明性と過学習対策が重要です。", [sources.envAware2025]),
  q("bayesian-regression", "ベイズ回帰", "ベイズ回帰を比較する意義として近いものは？", "係数や予測の不確かさを扱いやすい", "RSSIを使わない", "単位を消す", "ベイズ的手法は不確かさを明示しやすく、信頼性評価と相性があります。", toolLinks.propagation, "リンク設計では、点推定だけでなく不確かさをどう持つかが大切です。", [sources.envAware2025]),
  q("nonlinear-polynomial", "非線形項", "環境特徴量の二次項を検討する理由は？", "影響が線形とは限らないため", "距離を無効にするため", "dBmを線形に戻すため", "環境変数と損失の関係が単純な直線ではない場合があります。", toolLinks.propagation, "多項式平均モデルでRMSE改善が報告されていますが、検証が必須です。", [sources.envAware2025]),
  q("domain-shift", "ドメインシフト", "ある建物で学習したモデルを別建物へ使うときの注意は？", "環境分布が変わり精度が落ち得る", "必ず精度が上がる", "距離が不要になる", "壁材、人の動き、什器、ゲートウェイ位置が変わると、学習時の関係が崩れることがあります。", toolLinks.propagation, "環境特徴量モデルは、現場固有性と汎化性能を分けて検証する必要があります。", [sources.loraDataset2025, sources.envAware2025]),
  q("open-dataset-value", "公開データの価値", "測定データセットを公開・整理する価値は？", "別研究者が比較・再検証しやすくなる", "現地測定が不要になる", "物理モデルを消せる", "データ記述が丁寧だと、モデル比較や再現性確認がしやすくなります。", toolLinks.propagation, "2025年のデータ記述論文は、屋内LoRaWAN測定を再利用可能な形で整理している点が重要です。", [sources.loraDataset2025]),
  q("researcher-boss", "研究者章ボス", "研究者モードの最終判断として最も妥当なのは？", "標準モデル、実測校正、環境特徴量、残差分布を組み合わせる", "単一式だけで全環境を保証する", "測定条件を残さない", "ここ数年の研究は、万能式探しよりも、測定と統計で不確かさを管理する方向が強いです。", toolLinks.calculator, "本ツールの研究者モードも、標準モデルを基準にしつつ、現地実測と信頼率マージンへつなげる設計です。", [sources.loraDataset2025, sources.envAware2025, sources.envKal2025, sources.aerpaw2026, sources.p1812Geo2025, sources.rel19])
];

const beginnerCommunitySeeds: QuestExpansionSeed[] = [
  q("dbi-dbd", "dBiとdBd", "アンテナ利得でdBiとdBdを見比べるとき、まず確認することは？", "基準アンテナが違う", "距離の単位が違う", "受信感度の単位が違う", "dBiは等方性アンテナ基準、dBdは半波長ダイポール基準です。数字だけを見ると誤解します。", toolLinks.wavelength, "掲示板でも定番の混乱です。dBdはdBiより約2.15dB小さく表示されます。", [sources.antennaGain]),
  q("gain-not-amp", "利得は増幅器ではない", "アンテナ利得の説明として近いものは？", "特定方向へ電波を集中する性質", "電源なしで総電力を増やす装置", "周波数を下げる機能", "アンテナ利得は主に指向性と効率の結果です。総放射電力が魔法のように増えるわけではありません。", toolLinks.wavelength, "高利得アンテナはよく飛びますが、向きと設置が合っていることが前提です。", [sources.antennaGain]),
  q("high-gain-narrow", "高利得の代償", "高利得アンテナで起きやすい実務上の注意は？", "向き合わせがシビアになる", "受信感度が不要になる", "ケーブル損失が消える", "利得が高いほどビームが狭くなりやすく、向きや高さのズレが効きます。", toolLinks.calculator, "長距離化だけを見て高利得にすると、現場で向き合わせが難しくなることがあります。", [sources.antennaGain]),
  q("omni-doughnut", "無指向性の穴", "垂直アンテナの無指向性で見落としやすいことは？", "上下方向には弱い角度がある", "全方向に完全同じ強さ", "地面に必ず吸い込まれる", "一般的な垂直アンテナは水平面に広がり、真上方向などにヌルが出ることがあります。", toolLinks.wavelength, "無指向性は主に方位角の話です。上下角まで万能という意味ではありません。", [sources.monopoleGround]),
  q("polarization-name", "偏波の向き", "送受信アンテナの向きが90度ずれると起きやすいことは？", "偏波ミスマッチ損失", "周波数が2倍になる", "距離がゼロになる", "偏波が合わないと受信電力が落ちます。端末姿勢が変わる用途ではマージンで見ます。", toolLinks.calculator),
  q("hand-effect", "手で持つだけ", "小型端末のアンテナを手で覆うと起きやすいことは？", "効率や共振が変わる", "必ず感度が上がる", "dBmがmWになる", "人体は水分を含む大きな近傍物体です。手や体の近接はRSSIに影響します。", toolLinks.calculator),
  q("metal-case", "金属筐体", "金属筐体でアンテナ設計が難しくなる主な理由は？", "遮蔽や共振ずれが起きる", "電波が必ず強くなる", "送信電力が無限になる", "金属はアンテナ周辺の電界と電流分布を大きく変えます。外出しや窓、絶縁距離を検討します。", toolLinks.calculator),
  q("quarter-wave-ground", "1/4波長と相手", "1/4波長モノポールで重要になりやすい相手は？", "グランドプレーン", "ページタイトル", "温度単位だけ", "モノポールはグランドプレーンや筐体を含めてアンテナ系になります。素子だけで完結しません。", toolLinks.wavelength, "小型IoT端末では基板GNDがアンテナ性能の一部になります。", [sources.monopoleGround]),
  q("rubber-duck", "ラバーダックの現実", "短いラバーダックアンテナの性格として近いものは？", "小型化の代わりに効率や帯域を犠牲にしやすい", "必ず八木より高利得", "ケーブル損失を回復する", "短縮アンテナは便利ですが、理想的な長さのアンテナより損失や帯域の課題が出やすいです。", toolLinks.wavelength, "小型アンテナのカタログ利得は、実装状態と一緒に確認します。", [sources.monopoleGround]),
  q("mag-mount", "マグネット基台", "車載マグネット基台アンテナで車体が効く理由は？", "車体がグランドプレーンとして働くため", "車体が受信感度になるため", "タイヤが周波数を決めるため", "車体金属面はアンテナの相手側として働き、パターンや整合に影響します。", toolLinks.calculator, "同じアンテナでも机上、車体中央、端部で性能は変わります。", [sources.groundPlane]),
  q("counterpoise-basic", "カウンターポイズ", "良い接地が取れないアンテナで使われることがあるものは？", "カウンターポイズ", "受信感度の削除", "HTMLタグ", "カウンターポイズは接地の代替や相手側導体として使われることがあります。", toolLinks.wavelength, "小型端末では専用線だけでなく、基板や筐体全体が相手側になります。", [sources.counterpoise]),
  q("wrong-band", "違う帯域のアンテナ", "920MHz用アンテナを2.4GHzで使うときの注意は？", "整合や放射効率が合わない可能性", "必ず2倍飛ぶ", "受信感度が不要になる", "アンテナは周波数に強く依存します。対応帯域外では性能が大きく落ちます。", toolLinks.wavelength),
  q("longer-not-always", "長ければ良い？", "アンテナは長いほど常に良い、という考えは？", "誤り", "常に正しい", "周波数と無関係", "アンテナ長は波長や方式、グランド、整合とセットで決まります。長ければ万能ではありません。", toolLinks.wavelength),
  q("same-frequency", "同じ周波数", "送信側と受信側でまず合わせる必要があるものは？", "周波数と方式", "筐体の色", "ページの余白", "周波数、帯域幅、変調方式、プロトコルが合わなければ通信できません。", toolLinks.calculator),
  q("busy-channel", "混雑チャネル", "距離が近いのに通信が悪い原因としてあり得るものは？", "同じチャネルの混雑や干渉", "距離が近いほど必ず良いだけ", "アンテナが不要になる", "受信電力が十分でも、干渉や同時送信が多いと通信品質が落ちます。", toolLinks.calculator),
  q("indoor-shelf", "棚の奥", "屋内端末を金属棚の奥に置くと何が起きやすいですか？", "遮蔽と反射でRSSIが変わる", "必ず屋外より良い", "周波数がゼロになる", "棚、什器、壁、人の動きは屋内IoTの大きなばらつき要因です。", toolLinks.calculator),
  q("line-of-sight", "見通しの意味", "見通しが良い状態で主に減るリスクは？", "遮蔽や回折による追加損失", "自由空間損失そのもの", "受信感度の必要性", "見通しは有利ですが、距離による基本損失は残ります。フレネルゾーンも確認します。", toolLinks.fresnel),
  q("bars-throughput", "アンテナバー", "スマホのアンテナバーだけで分からないことは？", "SINRや混雑による実効速度", "電波があるかの雰囲気", "基地局の存在", "表示バーは簡略表示です。速度や安定性はSINR、混雑、方式にも左右されます。", toolLinks.calculator),
  q("rssi-quality", "RSSIだけではない", "RSSIが強くても通信が悪いとき、追加で見るべき代表は？", "SNRや干渉状況", "筐体の色", "URLの長さ", "信号が強くてもノイズや干渉が強いと復調しにくくなります。", toolLinks.calculator),
  q("snr-simple", "SNRの一言", "SNRは何と何の比に近い指標ですか？", "信号と雑音", "距離と高さ", "dBiとdBd", "SNRは信号がノイズに対してどれだけ目立つかを見る指標です。", toolLinks.calculator),
  q("negative-dbm-quiz", "マイナスdBm", "-70dBmと-100dBmでは、一般に強い信号は？", "-70dBm", "-100dBm", "同じ強さ", "dBmは値が大きいほど電力が強いです。マイナス値ではゼロに近い方が強いと考えます。", toolLinks.dbm),
  q("cable-before-antenna", "アンテナ前の損失", "送信側ケーブル損失はリンクバジェットでどこに効きますか？", "アンテナへ届く前に引かれる", "受信感度を上げる", "距離を短縮する単位になる", "送信機からアンテナまでのケーブルで失われた電力は、放射される前に減ります。", toolLinks.calculator),
  q("connector-loss", "変換コネクタ", "変換コネクタや延長ケーブルを増やすと注意することは？", "挿入損失と接触不良", "必ず利得が増える", "周波数が消える", "小さな損失でも積み上がります。高周波ではコネクタ品質も効きます。", toolLinks.calculator),
  q("foliage-water", "葉っぱと水", "樹木や葉が通信へ効く理由として近いものは？", "水分を含み損失や散乱が増えるため", "葉がdBを足すため", "木が受信感度になるため", "植生は季節や濡れ具合で損失が変わることがあります。", toolLinks.calculator),
  q("rain-basic", "雨の影響", "920MHz程度のIoTで雨だけを過大評価しすぎない方がよい理由は？", "建物・地形・設置の方が支配的な場合が多い", "雨は必ず無影響", "雨で送信電力が増える", "周波数帯や距離によりますが、低GHz以下では雨そのものより遮蔽や設置条件が効く場面が多いです。", toolLinks.calculator),
  q("legal-power", "送信電力の上限", "通信距離を伸ばすとき送信電力で必ず確認することは？", "法規制と機器仕様", "ページ背景色", "問題数", "無線方式ごとに出力やEIRPの上限があります。勝手に増やせません。", toolLinks.calculator),
  q("orientation-check", "向き合わせ", "指向性アンテナを使うとき重要な作業は？", "方位と上下角を合わせる", "ケーブルを必ず長くする", "受信感度を無視する", "ビームが狭いアンテナほど、方位角と仰角のズレが大きな損失になります。", toolLinks.calculator),
  q("fresnel-not-line", "見通し線だけ？", "フレネルゾーンの考え方として正しいものは？", "見通し線の周りの空間も大切", "線だけ空けば完全", "距離とは無関係", "見通し線が空いていても、周辺が塞がると回折損が増えます。", toolLinks.fresnel),
  q("height-helps-caveat", "高くすれば万能？", "アンテナ高を上げるときの正しい見方は？", "見通し改善と干渉環境の両方を見る", "必ず全方向で良くなる", "送信電力が不要になる", "高くすると遮蔽は減りやすい一方、干渉を拾いやすくなる場合もあります。", toolLinks.calculator),
  q("range-spec", "カタログ距離", "カタログの最大通信距離でよくある前提は？", "好条件の見通し環境", "金属箱の中", "地下室の奥", "最大距離は理想に近い条件のことが多く、現場条件では短くなります。", toolLinks.calculator),
  q("environment-separate", "損失の置き場所", "壁や人体の影響を入れる欄として自然なのは？", "環境損失や端末近傍損失", "送信電力の単位欄", "ページ説明欄", "物理要因ごとに損失を分けると、改善策が見えやすくなります。", toolLinks.calculator),
  q("measure-last", "最後は現地", "机上計算の後に必要な確認は？", "現地RSSI/RSRPや成功率の測定", "画面の拡大率だけ", "ファイル名だけ", "リンク計算は一次評価です。最終判断は現地測定で確認します。", toolLinks.calculator),
  q("swr-name", "SWRとは", "SWRは主に何の不整合を示す指標ですか？", "給電線と負荷の整合", "受信感度の順位", "距離の倍率", "SWRは反射の程度を見る指標です。低いほど送信機から見た負荷が扱いやすくなります。", toolLinks.calculator, "SWRが低くても、アンテナ効率や設置が良いとは限りません。", [sources.swr]),
  q("tuner-name", "チューナの名前", "アンテナチューナが主に合わせるものは？", "送信機から見たインピーダンス", "アンテナの物理長そのもの", "電波の法規", "チューナは整合を取りますが、悪い設置や損失を消す魔法ではありません。", toolLinks.calculator, "掲示板でよく出る誤解は、チューナがアンテナ効率を必ず上げるというものです。", [sources.antennaTuner]),
  q("wifi-band", "Wi-Fi帯域", "同じ条件なら2.4GHzと5GHzで届きやすい傾向があるのは？", "2.4GHz", "5GHz", "必ず同じ", "低い周波数の方が自由空間損失や回り込みで有利な場面が多いです。混雑は別問題です。", toolLinks.fspl),
  q("body-bluetooth", "Bluetoothと人体", "人体がBluetooth機器の近くにあると起きやすいことは？", "遮蔽や吸収で通信が不安定になる", "必ず通信距離が伸びる", "周波数が920MHzになる", "2.4GHz帯は人体や水分の近接影響を受けやすい場面があります。", toolLinks.calculator),
  q("lpwa-trade", "LPWAの交換条件", "LPWAが長距離化しやすい代わりに犠牲にしやすいものは？", "データレートや送信時間", "アンテナの存在", "受信感度の意味", "長距離・低消費電力の方式では、低速化や送信時間増加とのトレードオフがあります。", toolLinks.calculator, "LoRaではSFを上げると感度は上がりやすい一方、Time-on-Airが増えます。", [sources.loraBasics]),
  q("throughput-distance", "距離と速度", "距離が伸びるほど一般に厳しくなりやすいものは？", "高いデータレートの維持", "周波数の定義", "アンテナの向き不要化", "遠距離では変調や符号化を堅牢側に寄せ、速度を落として成立させることがあります。", toolLinks.calculator),
  q("rssi-vendor", "RSSIの読み方", "RSSI値を機器間で比較するときの注意は？", "測定定義や校正が違う場合がある", "全メーカーで完全同一", "dBmではないものは存在しない", "RSSIは実装依存の表示もあります。絶対値だけでなく同一条件の相対比較を重視します。", toolLinks.calculator),
  q("share-full-condition", "条件共有", "通信相談で数値を伝えるとき最も助かる情報は？", "周波数、距離、高さ、損失、モデルのセット", "判定結果だけ", "アンテナの色だけ", "前提条件がない数値は判断できません。共有リンクや入力一覧で条件も渡します。", toolLinks.calculator),
  q("eirp-vs-power", "出力とEIRP", "送信電力だけでなくEIRPを見る理由は？", "アンテナ利得と損失込みの放射方向電力を見るため", "受信感度を消すため", "周波数をHzにするため", "法規や距離評価では、送信機出力だけでなくアンテナ利得と損失を含むEIRPが重要です。", toolLinks.calculator),
  q("erp-vs-eirp", "ERPとEIRP", "ERPとEIRPで違うのは主に何ですか？", "基準アンテナ", "距離の単位", "ケーブルの色", "ERPはダイポール基準、EIRPは等方性アンテナ基準です。基準差を混同しないようにします。", toolLinks.calculator, "dBi/dBdと同じく、基準が違う数字をそのまま比べると誤解します。", [sources.antennaGain]),
  q("noise-floor", "ノイズ床", "受信感度に近い弱信号で効くものは？", "ノイズフロア", "ページ余白", "Gitブランチ", "弱い信号では、受信機の雑音や周囲ノイズに埋もれないかが重要です。", toolLinks.calculator),
  q("antenna-pattern", "パターン図", "アンテナパターン図で確認したいことは？", "強い方向と弱い方向", "ファイル名", "問題数", "利得は方向で変わります。設置方向と相手方向がパターンの強い側に入るか確認します。", toolLinks.wavelength),
  q("datasheet-condition", "データシート条件", "アンテナデータシートを見るとき大切なことは？", "測定時の基板やグランド条件", "表紙の色", "メーカー名だけ", "小型アンテナの性能は評価基板や実装条件に依存します。条件が違えば結果も変わります。", toolLinks.wavelength),
  q("sensitivity-data-rate", "感度と速度", "同じ無線機でも受信感度が変わることがある条件は？", "データレートや帯域幅", "筐体色", "問題番号", "低速・狭帯域ほど感度が良くなる方式があります。仕様表の条件を確認します。", toolLinks.calculator),
  q("retry-not-range", "再送の見え方", "再送で通信できている場合、距離設計で注意することは？", "安定リンクとは限らない", "必ず余裕十分", "RSSIが不要", "再送で見かけ上届いても、電池寿命や遅延、混雑に影響します。", toolLinks.calculator),
  q("latency-trade", "遅延の交換条件", "遠距離・高信頼化で増えやすいものは？", "送信時間や遅延", "アンテナ利得の単位数", "基板サイズだけ", "堅牢な通信設定は通信時間が長くなることがあります。用途の遅延許容も見ます。", toolLinks.calculator),
  q("question-template", "質問テンプレ", "掲示板で通信距離の相談をするとき有効なのは？", "周波数・距離・高さ・アンテナ・RSSIを最初に書く", "届かないとだけ書く", "写真だけ載せる", "前提を書けば、回答者がモデル選択や損失要因を切り分けやすくなります。", toolLinks.calculator),
  q("beginner-tavern-boss", "掲示板あるあるボス", "初心者が最初に避けたい落とし穴は？", "単位・前提・設置条件を混ぜて語ること", "質問を短くすること", "現地測定をすること", "無線の話は、単位、アンテナ、環境、方式が絡みます。切り分けるほど答えに近づきます。", toolLinks.calculator)
];

const apprenticeCommunitySeeds: QuestExpansionSeed[] = [
  q("tworay-wave", "波打つ2波", "2波モデルのグラフが波打つ主な理由は？", "直接波と反射波の干渉", "dBmの丸め", "ページの配色", "直接波と地面反射波が強め合ったり弱め合ったりするため、距離で山谷が出ます。", toolLinks.propagation),
  q("null-moves", "ヌルは動く", "深いヌルの位置が少し動く原因として近いものは？", "アンテナ高や地面条件の変化", "選択肢の順番", "GitHubの星数", "高さや反射係数が変わると経路差と位相が変わり、谷の位置も変わります。", toolLinks.propagation),
  q("smooth-vs-coherent", "平滑と完全版", "リンク判定で平滑化線も見る理由は？", "一点の深い谷を過信しないため", "干渉を完全に消すため", "距離を不要にするため", "現実の地面は完全反射ではなく、端末位置も揺れるため、包絡的な見方も必要です。", toolLinks.propagation),
  q("fresnel-fat", "太るフレネル", "第1フレネルゾーンが太くなりやすい位置は？", "経路中央付近", "送信機の内部だけ", "受信感度の欄", "障害物が中央付近にあるとフレネル欠損の影響が大きくなりやすいです。", toolLinks.fresnel),
  q("ground-bounce", "地面バウンド", "低高度端末同士で地面反射が効きやすい理由は？", "直接波と反射波の経路差が小さく干渉しやすい", "周波数が消える", "受信感度が上がる", "端末が低いと地面が近く、反射波の寄与やフレネル欠損を無視しにくくなります。", toolLinks.propagation),
  q("height-centimeters", "数十cmの差", "低高度IoTで数十cmの高さ差が効くことがある理由は？", "反射とフレネル条件が変わるため", "dBm定義が変わるため", "送信電力が自動で増えるため", "地面に近いほど、少しの高さ差で見通しや反射条件が変わります。", toolLinks.calculator),
  q("enclosure-window", "アンテナ窓", "金属筐体で内蔵アンテナを使うとき有効になりやすい工夫は？", "樹脂窓や外部アンテナを検討する", "筐体を完全密閉するだけ", "アンテナを基板下に隠すだけ", "金属が遮蔽するため、アンテナ周りの逃げ場を設計します。", toolLinks.calculator),
  q("body-margin", "人体マージン", "作業者が近くを通る端末で追加したい損失は？", "車両・人体遮蔽損失", "Hataの基地局高", "周波数単位", "人体の近接や遮蔽は端末近傍損失として扱うと説明しやすくなります。", toolLinks.calculator),
  q("orientation-random", "姿勢ランダム", "端末の向きが毎回変わる用途で見るべきものは？", "偏波ミスマッチと指向性", "ページのフォント", "Gitのremote", "アンテナの向きが変わると、偏波とパターンが変わり受信電力が揺れます。", toolLinks.calculator),
  q("near-loss-not-path", "近傍損失は別", "筐体や手の影響を伝搬モデルだけに押し込めない理由は？", "端末近くの実装要因だから", "距離式が不要だから", "自由空間損失が消えるから", "伝搬モデルは主に空間側の平均損失です。端末周りの損失は別枠にすると現実に寄ります。", toolLinks.calculator),
  q("field-calibration-sign", "補正の符号", "実測が計算より10dB悪かった場合、補正値の扱いとして自然なのは？", "受信電力を下げる方向に入れる", "必ず+10dB改善として入れる", "距離を削除する", "実測補正は計算と現地の差を合わせるための値です。符号を間違えると逆効果です。", toolLinks.calculator),
  q("single-measure-risk", "一回測定の罠", "1回だけのRSSIで断定しにくい理由は？", "時間変動やマルチパスがあるため", "RSSIが存在しないため", "dBmが使えないため", "RSSIは揺れます。複数回、複数位置で分布を見る方が堅実です。", toolLinks.calculator),
  q("median-measure", "中央値", "RSSI測定で平均だけでなく中央値を見る利点は？", "外れ値に引っ張られにくい", "全ての値を無視する", "距離を増やす", "一時的な落ち込みや上振れがあると、中央値の方が代表値として安定する場合があります。", toolLinks.calculator),
  q("packet-success-basic", "届いたか", "RSSI/SNR以外に現場で見たいものは？", "パケット成功率", "ページタイトル", "線の色", "実運用では、信号が見えるだけでなく通信が成立した割合が重要です。", toolLinks.calculator),
  q("sf-trade-basic", "SFの取引", "LoRaでSFを上げると一般に起きるトレードオフは？", "感度は上がりやすいが送信時間が増える", "必ず速度が上がる", "周波数が変わる", "SFは距離と電池寿命、混雑のバランスに関わります。", toolLinks.calculator, "SFを上げれば万能ではなく、送信時間や衝突リスクも見ます。", [sources.loraBasics]),
  q("near-far-basic", "近遠問題", "同じゲートウェイに近い端末と遠い端末が混在すると起き得ることは？", "強い信号が弱い信号を邪魔する", "全端末が同じRSSIになる", "距離が無効になる", "近遠問題では、近い端末の強い信号が遠い端末の受信を難しくする場合があります。", toolLinks.calculator, "LoRaでもゲートウェイ周りの端末配置や電力制御が話題になります。", [sources.loraRssiSnr2022]),
  q("capture-effect-basic", "キャプチャ効果", "同時送信で片方だけ受かる現象に近い言葉は？", "キャプチャ効果", "フレネル半径", "dBi変換", "受信機が強い方の信号を捕まえることがあります。衝突が単純な全滅とは限りません。", toolLinks.calculator, "成功率を見るときは、RSSIだけでなく同時送信や近遠問題も考えます。", [sources.loraRssiSnr2022]),
  q("common-mode-feedline", "同軸がアンテナ化", "同軸外皮に不要な電流が流れると起き得ることは？", "給電線が放射してパターンが崩れる", "必ず損失ゼロになる", "受信感度が消える", "コモンモード電流により、給電線自体がアンテナの一部のように振る舞う場合があります。", toolLinks.calculator, "掲示板でチョークが話題になる理由の一つです。", [sources.commonMode, sources.coaxialCable]),
  q("choke-role", "チョークの役割", "コモンモードチョークの狙いとして近いものは？", "不要な同相電流を抑える", "送信電力を必ず増やす", "周波数を変える", "チョークは意図しない外皮電流やEMIを抑えるために使われます。", toolLinks.calculator, "チョークは万能薬ではなく、原因がコモンモードかを切り分けて使います。", [sources.commonMode]),
  q("swr-efficiency", "低SWRと効率", "SWRが低ければ必ずよく飛ぶ、は正しいですか？", "正しくない", "常に正しい", "距離だけで決まる", "ダミーロードもSWRは低くできますが、電波は飛びません。効率と放射パターンも見ます。", toolLinks.calculator, "SWRは整合の指標であり、放射効率そのものではありません。", [sources.swr]),
  q("atu-location", "チューナ位置", "長い同軸でアンテナが不整合なとき、損失を減らしやすいチューナ位置は？", "アンテナに近い位置", "必ず送信機の隣", "受信機の画面内", "送信機側で整合しても、給電線上の高SWR損失が残ることがあります。", toolLinks.calculator, "アンテナチューナは給電線損失を消す装置ではありません。", [sources.antennaTuner]),
  q("coax-length-myth", "同軸長の神話", "SWRが同軸長でよく見える場合に疑うことは？", "測定位置の見え方が変わっただけ", "アンテナ効率が必ず上がった", "距離が伸びた証拠", "同軸長で送信機から見たインピーダンスが変わることがあります。放射効率改善とは別です。", toolLinks.calculator, "測定器の位置とアンテナ端の状態を分けて考えます。", [sources.swr]),
  q("balun-purpose", "バランの目的", "バランを使う代表的な理由は？", "平衡・不平衡の変換や不要電流抑制", "法規制の回避", "周波数の削除", "ダイポールなど平衡系を同軸で給電するとき、バランやチョークが重要になります。", toolLinks.calculator, "給電方法はアンテナ性能の一部です。", [sources.commonMode]),
  q("detuning-by-case", "ケースで離調", "試作裸基板では良かったアンテナが筐体組込後に悪くなる理由は？", "筐体や部品で共振がずれるため", "測定器が消えるため", "送信電力が必ず下がるため", "筐体、バッテリー、ネジ、ケーブルが近傍物体として効きます。", toolLinks.calculator),
  q("antenna-clearance", "アンテナ周辺余白", "内蔵アンテナ周りで確保したいものは？", "金属やGNDからの距離", "問題番号", "説明文の長さ", "アンテナ近くの金属や配線は放射効率と整合を崩すことがあります。", toolLinks.wavelength),
  q("battery-cable", "電池と配線", "小型端末で電池やケーブルがアンテナに影響する理由は？", "近傍導体として振る舞うことがあるため", "電池が周波数を決めるため", "ケーブルがdBmになるため", "端末内部の大きな導体は、アンテナパターンや共振へ影響します。", toolLinks.calculator),
  q("multipath-indoor", "屋内マルチパス", "屋内でRSSIが数歩で変わる理由として近いものは？", "反射波の合成が場所で変わる", "受信感度が歩くため", "単位が変化するため", "壁や床、棚からの反射により、場所ごとの強め合い・弱め合いが起きます。", toolLinks.propagation),
  q("diversity-basic", "ダイバーシティ", "アンテナダイバーシティの基本的な狙いは？", "深いフェージングを避けやすくする", "法律を変える", "距離を消す", "位置や偏波の異なるアンテナで、片方が谷に入るリスクを下げます。", toolLinks.calculator),
  q("margin-for-fading", "フェージング余裕", "短時間でRSSIが揺れる現場で必要になりやすいものは？", "フェードマージン", "ページ背景", "Gitタグ", "平均値だけでギリギリだと、谷で通信が落ちます。余裕を持たせます。", toolLinks.calculator),
  q("environment-repeat", "時間帯差", "同じ場所でも時間帯で通信が変わる理由は？", "人、車両、扉、機械の状態が変わるため", "dB定義が変わるため", "周波数が消えるため", "現場は静止していません。時間帯や運用状態を変えて測るとリスクが見えます。", toolLinks.calculator),
  q("season-repeat", "季節差", "屋外IoTで春夏と冬の差が出ることがある理由は？", "植生や水分、利用環境が変わるため", "RSSIの単位が変わるため", "距離が変わるため", "葉や雨、積雪、周辺利用状況で損失や反射が変わることがあります。", toolLinks.calculator),
  q("obstruction-class", "遮蔽物分類", "現場メモで遮蔽物を分類する利点は？", "再現性のある補正にしやすい", "測定を不要にする", "全てFSPLにする", "金属、人体、車両、樹木、壁を分けて記録すると後から見直しやすくなります。", toolLinks.calculator),
  q("anchor-distance", "アンカー距離", "実測補正のアンカー点で大切なことは？", "距離と高さと設置状態も記録する", "RSSIだけ残せば十分", "写真は禁止する", "測定値だけでは理由を追えません。条件をセットで残します。", toolLinks.calculator),
  q("photo-log", "写真ログ", "現地測定で写真を残す価値は？", "後から遮蔽物や設置向きを確認できる", "dBmを増やせる", "周波数を測れる", "数値だけでは見えない設置条件を補えます。", toolLinks.calculator),
  q("height-log", "高さログ", "アンテナ高を記録する理由は？", "モデル入力と反射条件に効くため", "問題文を短くするため", "GitHubへ必要だから", "Hata系、2波、フレネルではアンテナ高が効きます。固定と思い込まないことが大切です。", toolLinks.calculator),
  q("calibration-not-magic", "補正は魔法でない", "実測補正値の正しい理解は？", "測定点周辺のずれを合わせる値", "全距離を必ず完全予測する値", "電波を増やす装置", "補正は現場へ寄せるための手段ですが、外挿には限界があります。", toolLinks.calculator),
  q("antenna-move-test", "少し動かす測定", "端末を少し動かしてRSSIを見る意味は？", "局所的なフェージングを見つけるため", "問題数を増やすため", "dBmを消すため", "数十cmの移動で山谷が変わるなら、設置位置の余裕を見直します。", toolLinks.calculator),
  q("rotate-test", "回転テスト", "端末を回転させて測る目的は？", "偏波と指向性の影響を見る", "周波数を下げる", "受信感度を固定する", "姿勢が変わる用途では、向きごとのRSSI差を確認します。", toolLinks.calculator),
  q("door-test", "扉テスト", "扉やシャッターを開閉して測る理由は？", "遮蔽状態の変化を確認する", "アンテナ長を伸ばす", "距離を変換する", "金属扉やシャッターは大きな遮蔽物です。運用状態で測ります。", toolLinks.calculator),
  q("vehicle-position-test", "車両位置テスト", "駐車車両がある現場で試したいことは？", "車両あり・なしで測る", "周波数を隠す", "受信感度を消す", "車両は反射体にも遮蔽物にもなります。想定状態を分けて記録します。", toolLinks.calculator),
  q("wet-test", "濡れた日の確認", "屋外設備で雨上がりにも確認したい理由は？", "水分で損失や反射が変わることがある", "雨で必ず利得が増える", "距離が半分になる規則がある", "地面や樹木、筐体表面の水分で条件が変わる場合があります。", toolLinks.calculator),
  q("antenna-cable-strain", "ケーブル取り回し", "アンテナケーブルの取り回しが効くことがある理由は？", "近傍導体や不要電流の経路になるため", "ケーブルが電池になるため", "dBiをdBmへ変えるため", "ケーブル位置がアンテナ近傍に入るとパターンや整合へ影響することがあります。", toolLinks.calculator),
  q("gateway-height-test", "ゲートウェイ高", "ゲートウェイを高くしたときまず確認することは？", "見通し改善と干渉増加の両方", "必ず全端末が安定する", "端末側損失が消える", "高所化は有効なことが多いですが、干渉やセル範囲の広がりも確認します。", toolLinks.calculator),
  q("map-not-terrain", "地図と現地", "地図で見通しに見えても現地確認が必要な理由は？", "小さな建物や樹木、設置高さが抜けるため", "地図は常に間違いだから", "距離が不要だから", "地図データは便利ですが、現地の細部と設置状態は別途確認します。", toolLinks.calculator),
  q("gateway-indoor-window", "窓際ゲートウェイ", "屋内ゲートウェイを窓際へ動かすと改善しやすい理由は？", "建物貫通損失を減らせるため", "受信感度が消えるため", "周波数が固定されるため", "外部端末との通信では、壁や金属膜入りガラスの影響を確認します。", toolLinks.calculator),
  q("metal-film-glass", "金属膜ガラス", "窓越し通信で注意したいガラスは？", "金属膜入りや遮熱ガラス", "透明なら全て無損失", "厚さゼロのガラス", "遮熱・Low-Eガラスなどは電波を減衰させる場合があります。現地で確認します。", toolLinks.calculator),
  q("pipe-and-cable", "配管とケーブル", "設備室でアンテナ近くの配管が効く理由は？", "金属反射や遮蔽が起きるため", "配管が感度になるため", "距離を消すため", "金属配管やラックは反射体にも遮蔽物にもなります。設置場所を少し変えて比較します。", toolLinks.calculator),
  q("low-height-warning", "低高度警告", "低高度端末同士でHataを主モデルにしない理由は？", "地面反射や近傍損失が支配的になりやすい", "Hataに距離がないため", "FSPLが禁止されるため", "Hataは高所基地局と移動局の広域平均向けです。低高度同士は2波、FSPL、Log-distance、実測を中心にします。", toolLinks.calculator),
  q("measurement-repeatability", "再現性チェック", "同じ条件で再測定して値が大きく違うとき疑うことは？", "環境変化や測定手順のばらつき", "必ず計算式の誤りだけ", "dBm単位の消失", "再現性が低い場合、測定方法、端末姿勢、人や車両の位置を見直します。", toolLinks.calculator),
  q("apprentice-community-boss", "現場判断ボス", "見習いを卒業する判断として最も大切なのは？", "平均式と近傍損失と実測を分けて説明できる", "SWRだけで全て決める", "距離だけを眺める", "低高度IoTでは、伝搬路、端末周り、実測差分を分けると現実に近づきます。", toolLinks.calculator)
];

const practitionerCommunitySeeds: QuestExpansionSeed[] = [
  q("community-mode-choice", "通信形態の選択", "モデル選択の最初に決めるべきものは？", "通信形態", "背景色", "問題番号", "高所基地局なのか低高度端末同士なのかで、使うべき主モデルが変わります。", toolLinks.calculator),
  q("community-hata-domain", "Hataの領域", "奥村・秦モデルが得意とする評価は？", "高所基地局と移動局の広域平均", "机の上の数m通信", "筐体内の結合", "Hata系は広域セルラーの平均伝搬損失を見る経験式です。低高度端末近傍の損失は別途扱います。", toolLinks.propagation),
  q("community-hata-terminal-low", "低い端末", "基地局条件がHata範囲内でも、端末が地上近傍なら必要なことは？", "端末近傍損失を加える", "警告を消す", "距離を0にする", "地面反射、筐体、人体・車両、設置方向の影響はHata単独では表しにくいです。", toolLinks.calculator),
  q("community-terminal-hata-warning", "端末同士とHata", "低高度端末同士でHataを選んだ場合の扱いは？", "参考値として警告付きで見る", "主判定に単独使用する", "計算を必ず隠す", "低高度同士ではFSPL、2波、Log-distance、実測補正を中心にします。", toolLinks.calculator),
  q("community-cost231-band", "COST231の帯域", "COST231-Hataを使うとき特に確認したい入力は？", "周波数とアンテナ高の範囲", "ページ名", "回答履歴", "経験式は適用範囲外でも数値は出ますが、参考値として扱うべきです。", toolLinks.propagation),
  q("community-fspl-reference", "FSPL基準線", "自由空間損失モデルの使いどころは？", "見通し条件の基本損失", "屋内遮蔽の完全再現", "人体損失の自動推定", "FSPLは最も基本的な基準線です。現実の追加損失は別途足します。", toolLinks.fspl),
  q("community-logdistance-n", "nの意味", "Log-distanceモデルの距離損失指数nが大きいほど何を意味しますか？", "距離で損失が増えやすい", "アンテナ利得が高い", "感度が良い", "nは環境の厳しさを表す傾きです。実測で合わせると現場寄りになります。", toolLinks.propagation),
  q("community-measured-offset-role", "実測オフセット", "実測補正値の主な役割は？", "モデルと現地測定のずれを合わせる", "法規制を変える", "アンテナを長くする", "現地RSSI/RSRPとの差分を補正し、机上モデルを現場へ寄せます。", toolLinks.calculator),
  q("community-loss-double-count", "二重計上注意", "筐体損失を端末近傍損失に入れたあと、同じ差を実測補正にも入れると？", "二重計上になり得る", "必ず正確になる", "Hataが不要になる", "同じ原因を複数欄に入れると悲観的すぎます。損失の由来を分けて記録します。", toolLinks.calculator),
  q("community-near-env-split", "環境と近傍", "壁損失と筐体損失を分ける利点は？", "改善策を切り分けやすい", "計算不能にする", "距離を隠す", "建物側の問題か端末実装側の問題かを分けると、対策を選びやすくなります。", toolLinks.calculator),
  q("community-calibration-split", "補正の入れ分け", "IoT実測補正Hataでアンカー補正を使うとき、追加の実測補正欄は何に使うべきですか？", "別要因の追加補正", "同じ差分の再入力", "送信電力の単位変更", "アンカー補正と同じ差分を重ねると二重計上になります。", toolLinks.calculator),
  q("community-confidence-target", "信頼率目標", "距離逆算で目標信頼率を入れる理由は？", "平均ではなく失敗側の余裕を見るため", "計算を速くするため", "周波数を固定するため", "平均値でギリギリだと実運用で落ちます。信頼率に応じた余裕を持ちます。", toolLinks.calculator),
  q("community-sigma", "σの意味", "シャドウフェージング標準偏差σが大きい環境は？", "ばらつきが大きい", "損失が必ず小さい", "アンテナ利得が一定", "σが大きいほど、同じ平均損失でも悪い側の外れが大きくなります。", toolLinks.calculator),
  q("community-z-margin", "z×σ", "信頼率つき距離計算でz×σを差し引く意味は？", "悪い側のばらつき余裕", "送信電力の増加", "周波数変換", "目標信頼率を満たすため、中央値からフェード余裕を引いて考えます。", toolLinks.calculator),
  q("community-median-link", "中央値の距離", "研究ベース距離シートで中央値損失だけを過信しない理由は？", "端末ごとのばらつきが残るため", "中央値が存在しないため", "全て同じ値だから", "平均や中央値は代表値です。信頼率、実測、マージンと合わせます。", toolLinks.calculator),
  q("community-indoor-outdoor", "屋内外の切替", "屋内端末と屋外端末を同じ条件で扱いにくい理由は？", "壁・床・什器・人体の影響が違う", "dBmが違う単位になる", "周波数が消える", "屋内外でクラッタと近傍条件が変わるため、環境損失を分けます。", toolLinks.calculator),
  q("community-hb-hm", "hb/hm入力", "Hata系モデルで固定してはいけない重要入力は？", "基地局高hbと移動局高hm", "ページタイトル", "選択肢の数", "空中線地上高は伝搬損失に効きます。問い合わせ対応でも明示すべき点です。", toolLinks.propagation),
  q("community-frequency-check", "周波数範囲", "伝搬モデルの適用範囲チェックで見るものは？", "周波数", "フォント", "GitHubアイコン", "モデルには想定周波数範囲があります。範囲外では警告付き参考値にします。", toolLinks.propagation),
  q("community-distance-check", "距離範囲", "Hata系で短すぎる距離を入れたときの扱いは？", "警告して参考値にする", "結果を保証する", "自動で隠す", "経験式の適用範囲外でも計算値は出ますが、通信判定には別モデルと実測を併用します。", toolLinks.calculator),
  q("community-area-type", "エリア種別", "Hata系の市街地・郊外・開放地を選ぶ理由は？", "地物条件で補正が変わるため", "言語を変えるため", "送信電力を消すため", "環境種別により平均伝搬損失の補正が変わります。", toolLinks.propagation),
  q("community-open-area", "開放地補正", "開放地モデルを市街地へそのまま使うと？", "楽観的になりやすい", "必ず悲観的", "差は出ない", "建物やクラッタが多い場所では、開放地より損失が増えやすいです。", toolLinks.propagation),
  q("community-suburban", "郊外の扱い", "郊外補正で確認したいことは？", "実際の建物密度や樹木", "画面幅", "問題文の長さ", "郊外といっても住宅密度や樹木で条件が変わるため、現地情報と合わせます。", toolLinks.calculator),
  q("community-urban", "市街地クラッタ", "市街地で距離が伸びにくい代表要因は？", "建物遮蔽とマルチパス", "受信感度の消滅", "距離単位の変更", "都市では建物、道路幅、基地局高、端末位置が大きく効きます。", toolLinks.calculator),
  q("community-clutter-map", "クラッタ地図", "地図クラッタを使う狙いは？", "場所ごとの地物差をモデルに入れる", "計算式を隠す", "受信機を増幅する", "森林、市街地、農地などの違いを平均モデルへ反映しやすくなります。", toolLinks.calculator),
  q("community-building-height", "建物高", "建物高データが距離推定へ効く理由は？", "遮蔽や屋根越し回折に関係するため", "電波の色を決めるため", "dBmを変換するため", "街路や屋上条件では建物高がパスの成立に関わります。", toolLinks.calculator),
  q("community-road-width", "道路幅", "都市街路モデルで道路幅を見る理由は？", "街路回折や見通し条件に効くため", "ページ名に効くため", "アンテナ長にだけ効くため", "COST231 Walfisch-Ikegami系では街路条件が損失へ効きます。", toolLinks.calculator),
  q("community-street-orientation", "街路方向", "道路方向と基地局方向の関係が効くことがある理由は？", "街路に沿った伝搬が変わるため", "受信感度を変換するため", "周波数単位だから", "都市では道路の向きと建物配置で電波の通り道が変わります。", toolLinks.calculator),
  q("community-terminal-height", "端末高の実務", "端末アンテナ高を入力する理由は？", "反射・フレネル・Hata補正に効くため", "表示だけの飾りだから", "法規を変えるため", "低高度IoTでは端末高が特に重要です。固定値と思い込まないようにします。", toolLinks.calculator),
  q("community-gateway-height", "ゲートウェイ高", "ゲートウェイ高を変えると主に何が変わりますか？", "見通しと反射条件", "選択肢の数", "dBmの定義", "高さは遮蔽、フレネル、2波ブレークポイントに効きます。", toolLinks.calculator),
  q("community-private-base", "プライベート基地局", "プライベート基地局→IoT端末で見るべき組み合わせは？", "基地局高、端末近傍損失、実測補正", "画面色だけ", "問題数だけ", "屋内外や構内環境に合わせ、標準式と実測を組み合わせます。", toolLinks.calculator),
  q("community-cellular-base", "セルラー基地局", "携帯基地局→IoT端末でHataを使うときの位置づけは？", "広域平均の参考値", "端末筐体損失の完全推定", "通信可否の唯一の根拠", "高所基地局の平均伝搬損失を見つつ、端末周りと実測で補正します。", toolLinks.calculator),
  q("community-terminal-mode", "端末間通信", "低高度端末↔低高度端末で主に使うモデルは？", "FSPL、2波、Log-distance、実測補正", "Hata単独", "COST231だけ", "地面反射と近傍損失が効くため、低高度向けの見方にします。", toolLinks.calculator),
  q("community-custom-mode", "カスタム", "カスタムモードで特に必要な姿勢は？", "前提条件を自分で説明する", "警告を読まない", "単位を混ぜる", "自由度が高い分、距離・高さ・損失の根拠を明確にします。", toolLinks.calculator),
  q("community-uplink-downlink", "上りと下り", "基地局設計で上り下りを分ける理由は？", "送信電力や受信性能が非対称だから", "周波数が必ず同じだから", "距離が不要だから", "IoT端末は送信電力やアンテナが弱く、上りがボトルネックになることがあります。", toolLinks.calculator),
  q("community-sensitivity-condition", "感度条件", "受信感度仕様で確認すべきことは？", "変調、データレート、帯域幅、PER条件", "筐体の色", "ページURL", "感度は測定条件込みの値です。方式設定が変わると同じ値ではありません。", toolLinks.calculator),
  q("community-data-rate-sensitivity", "速度と感度", "データレートを下げると期待しやすい効果は？", "受信感度が良くなる場合がある", "ケーブル損失が消える", "アンテナが不要になる", "方式によっては低速設定で復調しやすくなります。電池や混雑とのトレードオフです。", toolLinks.calculator),
  q("community-packet-success", "成功率判定", "リンクマージン以外に通信可否判断で見たいものは？", "パケット成功率", "フォントサイズ", "GitHubスター", "運用では届いた割合が重要です。RSSI/SNRと成功率を合わせて評価します。", toolLinks.calculator),
  q("community-retry-policy", "再送設計", "再送で補える通信の注意点は？", "電池、遅延、混雑が悪化し得る", "必ず無料で改善", "リンクマージンが不要", "再送は便利ですが、根本的なリンク不足を隠すことがあります。", toolLinks.calculator),
  q("community-battery-budget", "電池予算", "通信距離を伸ばす設定で見直すべきものは？", "電池寿命", "ページ名", "アイコン", "高出力、長い送信時間、再送増加は電池へ効きます。", toolLinks.calculator),
  q("community-regulatory-eirp", "法規EIRP", "高利得アンテナへ変えるとき必ず見るべきものは？", "EIRP上限", "回答数", "背景画像", "アンテナ利得を上げるとEIRPが増え、法規上限に近づくことがあります。", toolLinks.calculator),
  q("community-duty-cycle", "送信時間制約", "LPWAで通信回数を増やすとき見るべき制約は？", "送信時間やチャネル利用制限", "アンテナ色", "距離単位", "地域や方式により送信時間・チャネル利用の制約があります。", toolLinks.calculator),
  q("community-pattern-input", "パターン反映", "アンテナ利得を入れるとき気をつけることは？", "相手方向の実効利得を見る", "最大値だけなら常にOK", "受信感度へ足す", "最大利得方向と実際の相手方向が違うと、期待利得は出ません。", toolLinks.calculator),
  q("community-connector-loss", "細かな損失", "実務で忘れやすい小さな損失は？", "変換コネクタや短い同軸", "ページ余白", "問題番号", "0.5〜1dB級でも複数積み重なるとリンクマージンに効きます。", toolLinks.calculator),
  q("community-temperature-aging", "温度と経年", "長期運用で余裕を見たい理由は？", "温度変化や経年で特性が変わるため", "単位が消えるため", "距離が伸びるため", "部品、電池、筐体、設置環境は時間で変わります。量産品では余裕を持ちます。", toolLinks.calculator),
  q("community-production-margin", "量産ばらつき", "試作1台で成立した通信を量産へ展開するとき必要なものは？", "個体差マージン", "ページ名変更", "受信感度削除", "アンテナ実装、部品公差、組立差で性能がばらつきます。", toolLinks.calculator),
  q("community-weather-margin", "天候マージン", "屋外常設機で天候マージンを考える理由は？", "雨、濡れ、積雪、風で条件が変わるため", "天候でdBmが無効になるため", "法律が変わるため", "常設用途では晴天だけでなく悪条件も想定します。", toolLinks.calculator),
  q("community-measurement-plan", "測定計画", "現地測定の計画で最初に決めたいことは？", "測定点、姿勢、時間帯、記録項目", "スクリーン色", "問題文の長さ", "測定条件を揃えないと、差分の理由が分からなくなります。", toolLinks.calculator),
  q("community-multipoint-fit", "複数点フィット", "複数距離の実測が役立つ理由は？", "損失の傾きとオフセットを分けやすい", "一つの値だけを強くする", "測定を不要にする", "一点だけではずれの原因を切り分けにくいです。複数点でnや補正を見ます。", toolLinks.propagation),
  q("community-reporting", "説明資料", "顧客や社内へ通信可否を説明するとき必要なものは？", "前提、モデル、警告、実測予定", "結果の一言だけ", "画面色だけ", "数値の根拠と限界を併記すると、後工程で誤解が減ります。", toolLinks.calculator),
  q("community-practitioner-boss", "実務レビューの門番", "実務者として妥当な最終確認は？", "モデル範囲、損失入れ分け、実測計画を確認する", "最大距離だけを読む", "警告を非表示にする", "通信距離は式だけでなく前提の整合性で決まります。レビューではそこを見ます。", toolLinks.calculator)
];

const expertCommunitySeeds: QuestExpansionSeed[] = [
  q("community-planning-not-one", "設計は単一式でない", "基地局設計で距離式だけでは足りない理由は？", "容量、干渉、地形、運用条件も効くため", "距離が不要だから", "アンテナが不要だから", "セル設計はカバレッジだけでなく、容量と干渉も同時に見ます。", toolLinks.calculator),
  q("community-coverage-capacity", "カバレッジと容量", "基地局を増やすと改善しやすいものは？", "カバレッジと容量の両方", "必ず干渉ゼロ", "端末筐体損失", "基地局密度は届きやすさと収容力に効きますが、干渉設計も必要です。", toolLinks.calculator),
  q("community-uplink-bottleneck", "上りボトルネック", "IoT端末で上りが厳しくなりやすい理由は？", "端末の送信電力とアンテナが小さいため", "基地局が送信しないため", "距離式がないため", "基地局は高性能でも、端末側の出力・高さ・アンテナが弱いと上りが先に限界になります。", toolLinks.calculator),
  q("community-downtilt", "ダウンチルト", "基地局アンテナのダウンチルトで調整するものは？", "カバレッジ範囲と干渉", "受信感度の単位", "端末の色", "傾け方でセル端の強さや隣接セルへの漏れが変わります。", toolLinks.calculator),
  q("community-azimuth", "方位角", "セクタアンテナの方位角を決める目的は？", "狙うエリアへ主ビームを向ける", "dBmを増やす", "距離を非表示にする", "アンテナの主ビーム方向と対象エリアが合うかを確認します。", toolLinks.calculator),
  q("community-vertical-beam", "垂直ビーム", "垂直ビーム幅が狭いアンテナで注意することは？", "近距離や高低差で外れやすい", "全高さで同じ", "必ず屋内が良くなる", "垂直方向のヌルやビーム外れは、近距離端末や高低差で問題になります。", toolLinks.calculator),
  q("community-sectorization", "セクタ化", "基地局をセクタ化する主な狙いは？", "方向ごとの容量と干渉制御", "周波数の削除", "アンテナ高の固定", "セクタでエリアを分けると、指向性を活かして収容と干渉を制御できます。", toolLinks.calculator),
  q("community-cell-edge", "セル端", "セル端設計で特に見る指標は？", "悪条件側のリンクマージン", "平均だけ", "ページ名", "セル中心で良くても端で落ちると実運用に効きます。信頼率と余裕を見ます。", toolLinks.calculator),
  q("community-handover", "ハンドオーバ余裕", "移動体通信でセル境界に必要な設計は？", "ハンドオーバできる重なり", "全セルを孤立させる", "受信感度を消す", "隣接セルとの重なりや品質差が移動時の安定性に関わります。", toolLinks.calculator),
  q("community-interference-limited", "干渉律速", "受信電力は十分なのに速度が出ない原因として近いものは？", "干渉でSINRが悪い", "距離が必ず長い", "アンテナが存在しない", "セルラーではノイズより干渉が支配する場面があります。", toolLinks.calculator),
  q("community-noise-limited", "雑音律速", "人の少ない遠距離で支配的になりやすいものは？", "熱雑音と受信感度", "隣接セルだけ", "ページ背景", "郊外や孤立リンクでは雑音床に対する余裕が重要になります。", toolLinks.calculator),
  q("community-sinr", "SINR", "SINRがRSSIより実効速度に近い理由は？", "信号、干渉、雑音を一緒に見るため", "距離だけを見るため", "アンテナの色を示すため", "強い信号でも干渉が強ければ速度や安定性は落ちます。", toolLinks.calculator),
  q("community-rsrq", "RSRQ", "RSRQが悪いとき疑うものは？", "セル負荷や干渉", "アンテナ長だけ", "dBm変換だけ", "RSRPが十分でも、RSRQやSINRが悪いと品質が伸びません。", toolLinks.calculator),
  q("community-pci-neighbor", "隣接関係", "移動通信の現場で隣接セル設定が重要な理由は？", "接続先切替に効くため", "周波数を決めないため", "RSSIを消すため", "無線品質だけでなく、ネットワーク設定も実運用品質に効きます。", toolLinks.calculator),
  q("community-drive-test", "ドライブテスト", "ドライブテストの目的は？", "広域の受信品質を実走行で確認する", "机上式を隠す", "アンテナを交換するだけ", "地図上の推定と現地の差を見つけ、モデル補正や基地局調整に使います。", toolLinks.calculator),
  q("community-walk-test", "ウォークテスト", "屋内や構内でウォークテストが有効な理由は？", "人の高さ・実経路で品質を確認できる", "GPSだけで十分だから", "建物を無視できるから", "屋内は地図式だけでは難しいため、実際の利用動線で測ります。", toolLinks.calculator),
  q("community-clutter-map-expert", "クラッタマップ", "クラッタマップを基地局設計へ入れる理由は？", "土地利用ごとの損失差を反映する", "全場所をFSPLにする", "受信感度を上げる", "市街地、森林、水面、農地で伝搬条件が違います。", toolLinks.calculator),
  q("community-dem", "標高データ", "DEMが距離設計で効く理由は？", "地形遮蔽と見通しに関係するため", "アンテナ利得を測るため", "dBiをdBmにするため", "丘陵や谷では標高差が見通しと回折に効きます。", toolLinks.calculator),
  q("community-building-height-expert", "建物高データ", "3D都市モデルが役立つ場面は？", "街路や屋上遮蔽を詳しく見る", "単位を変える", "送信出力を増やす", "都市部では建物高と道路幅が伝搬路を決める大きな要因です。", toolLinks.calculator),
  q("community-ray-tracing", "レイトレース", "詳細レイトレースが必要になりやすい場面は？", "ミリ波や複雑な都市街区", "数mのFSPLだけ", "問題文の検査", "高周波や遮蔽が多い環境では、反射・回折・透過を詳細に見る価値があります。", toolLinks.calculator),
  q("community-model-tuning", "モデルチューニング", "現地測定で伝搬モデルを補正する目的は？", "対象エリア固有のずれを減らす", "法規を変える", "距離を消す", "標準モデルと現地差を合わせ、予測の偏りを減らします。", toolLinks.calculator),
  q("community-drive-calibration", "測定校正", "ドライブテスト結果をモデルへ反映するとき大切なことは？", "測定条件と位置精度を管理する", "悪い点を全て捨てる", "平均だけを見る", "位置ずれや測定端末差があると、補正の品質に影響します。", toolLinks.calculator),
  q("community-scanner-device", "スキャナと実端末", "測定スキャナと実端末の結果が違うことがある理由は？", "アンテナや受信機性能が違うため", "周波数が存在しないため", "測定値が必ず同じだから", "実端末の筐体、持ち方、アンテナ性能も通信品質に効きます。", toolLinks.calculator),
  q("community-pattern-file", "アンテナパターン", "基地局設計でアンテナパターンを入れる理由は？", "方向ごとの利得差を見るため", "計算を遅くするため", "受信感度をなくすため", "水平・垂直パターン、サイドローブ、ヌルがエリア品質へ効きます。", toolLinks.calculator),
  q("community-mech-elec-tilt", "機械チルトと電気チルト", "機械チルトと電気チルトで変わるものは？", "ビーム方向とパターンの出方", "周波数単位", "問題数", "チルト方法によりセル端、近傍、隣接セル干渉の出方が変わります。", toolLinks.calculator),
  q("community-feeder-loss", "給電線損失", "基地局でも給電線損失を無視できない理由は？", "アンテナ前後の実効電力に効くため", "距離を消すため", "法規不要にするため", "長い同軸や変換部品はEIRPや受信系ノイズに効きます。", toolLinks.calculator),
  q("community-mimo-diversity", "MIMOと多重波", "MIMOが多重波環境で有利になることがある理由は？", "複数経路を情報として使えるため", "反射が必ずゼロだから", "アンテナが1本だから", "MIMOは単に強く飛ばすだけでなく、空間チャネルを活用します。", toolLinks.calculator),
  q("community-polarization-diversity", "偏波ダイバーシティ", "偏波ダイバーシティの狙いは？", "姿勢や反射による偏波差を吸収する", "周波数を変更する", "ケーブルを短くする", "偏波が変わる現場では、複数偏波を使うと安定しやすくなります。", toolLinks.calculator),
  q("community-cross-pol", "交差偏波", "基地局アンテナで交差偏波を使う理由として近いものは？", "同じ場所で複数系統を扱いやすい", "全ての損失を消す", "距離を固定する", "MIMOやダイバーシティで偏波を分ける設計があります。", toolLinks.calculator),
  q("community-beamforming", "ビームフォーミング", "ビームフォーミングの基本的な狙いは？", "必要な方向へエネルギーを寄せる", "受信感度を削除する", "周波数を低くする", "アンテナアレイで位相を制御し、方向性を作ります。", toolLinks.calculator),
  q("community-power-control", "電力制御", "セルラーの電力制御が重要な理由は？", "近遠問題と干渉を抑えるため", "端末を必ず最大出力にするため", "測定を不要にするため", "必要以上の送信は干渉と電池消費を増やします。", toolLinks.calculator),
  q("community-iot-repetition", "IoT反復送信", "NB-IoTなどのカバレッジ強化で使われる考え方は？", "繰り返し送信で受信しやすくする", "アンテナを消す", "距離をゼロにする", "反復は弱信号に有効ですが、時間と容量を使います。", toolLinks.calculator),
  q("community-coverage-enhancement", "CEレベル", "カバレッジ強化設定で見るべきトレードオフは？", "到達性と遅延・容量", "画面色と文字数", "モデル名とURL", "遠距離や屋内深部を狙うほど、通信時間や収容に影響します。", toolLinks.calculator),
  q("community-nb-iot", "NB-IoTの強み", "NB-IoTが深い屋内に向きやすい理由は？", "狭帯域・反復などでリンクバジェットを稼げる", "周波数が存在しない", "アンテナ不要", "方式の強みはありますが、端末近傍損失と実測確認は残ります。", toolLinks.calculator),
  q("community-ltem-mobility", "LTE-Mの性格", "LTE-MがNB-IoTより向きやすい用途は？", "移動性や比較的高いデータレートが必要な用途", "必ず最長距離だけ", "アンテナなし用途", "方式選定は距離だけでなく、移動性、速度、電池、網対応で決めます。", toolLinks.calculator),
  q("community-lora-density", "LoRaゲートウェイ密度", "LoRaでゲートウェイを増やす効果は？", "受信機会と冗長性が増える", "全端末の送信時間がゼロになる", "法規制が消える", "複数ゲートウェイで受かると成功率や位置推定に有利ですが、チャネル設計も必要です。", toolLinks.calculator),
  q("community-capture-expert", "キャプチャ効果", "キャプチャ効果を考える理由は？", "同時送信時の成功率が単純でないため", "電波が必ず消えるため", "アンテナ利得を固定するため", "強い信号だけが受かることがあり、近遠問題と合わせて評価します。", toolLinks.calculator),
  q("community-cochannel", "同一チャネル干渉", "同一チャネル干渉を下げる方法として近いものは？", "周波数計画や出力・アンテナ調整", "全端末を最大出力にする", "距離式を削除する", "同じチャネルを使うセル同士は、再利用距離やビームで制御します。", toolLinks.calculator),
  q("community-adjacent-channel", "隣接チャネル", "隣接チャネルで問題になるものは？", "フィルタ特性や漏れ込み", "ページ名", "問題数", "隣のチャネルでも受信機や送信機の特性で干渉が起きることがあります。", toolLinks.calculator),
  q("community-load", "負荷の時間変動", "昼夜で通信品質が変わる理由として近いものは？", "セル負荷や干渉が変わるため", "距離が変わるため", "周波数が消えるため", "ユーザー数やIoT送信集中でネットワーク負荷が変わります。", toolLinks.calculator),
  q("community-time-of-day", "時間帯測定", "基地局設計の測定で複数時間帯を見る理由は？", "負荷と環境が変わるため", "測定器を休ませるため", "アンテナを増やすため", "人流、車両、通信負荷は時間帯で変わります。", toolLinks.calculator),
  q("community-highband-rain", "高周波の雨", "高い周波数帯で雨減衰を気にしやすい理由は？", "波長が短く雨粒の影響が増えるため", "雨で送信電力が増えるため", "dBmが無効になるため", "低GHzとmmWaveでは支配要因が変わります。帯域ごとの前提を確認します。", toolLinks.calculator),
  q("community-foliage-season", "樹木の季節", "基地局エリアで季節差が出る代表要因は？", "葉の繁り方や水分", "ページ色", "GitHub状態", "植生の多いエリアでは夏と冬で損失が変わることがあります。", toolLinks.calculator),
  q("community-penetration", "屋内浸透", "屋外基地局から屋内端末を見るとき追加で必要な評価は？", "建物侵入損失", "問題文の長さ", "同軸長だけ", "壁材、窓、階数、室内位置で大きく変わります。", toolLinks.calculator),
  q("community-rooftop-street", "屋上と街路", "屋上基地局から街路端末への伝搬で効くものは？", "屋根越し回折や街路方向", "受信感度の色", "問題数", "都市では高所から地上へ届く経路が建物配置に左右されます。", toolLinks.calculator),
  q("community-emergency", "非常時余裕", "重要インフラ用途でリンクマージンを厚く見る理由は？", "悪天候や障害時も成立させたいため", "平均値だけで良いため", "測定が不要なため", "通常時だけでなく、停電・混雑・悪天候時の条件を考えます。", toolLinks.calculator),
  q("community-sla", "SLA視点", "通信距離設計でSLA視点が必要な理由は？", "どの確率で成立するかが重要だから", "最大距離の一発値で十分だから", "単位をなくせるから", "顧客説明では平均ではなく、期待する稼働率や失敗時の影響を示します。", toolLinks.calculator),
  q("community-uncertainty", "不確かさ説明", "玄人が距離結果に添えるべき一言は？", "前提と不確かさ", "結果だけ", "警告非表示", "モデルは現実の近似です。適用範囲と未測定リスクを明示します。", toolLinks.calculator),
  q("community-peer-review", "レビュー観点", "設計レビューで最初に見るべき観点は？", "入力値の根拠とモデル適用範囲", "ボタンの色だけ", "問題数だけ", "数式が正しくても入力前提が違えば結果はずれます。", toolLinks.calculator),
  q("community-expert-boss", "玄人豆知識ボス", "玄人らしい基地局距離設計の姿勢は？", "標準式、地図、干渉、容量、実測を重ねる", "最大距離だけで決める", "警告を消す", "携帯キャリア級の設計では、リンクバジェットだけでなく運用全体で検証します。", toolLinks.calculator)
];

const researcherCommunitySeeds: QuestExpansionSeed[] = [
  q("community-forum-evidence", "掲示板と根拠", "掲示板の定番回答を研究者目線で扱う姿勢は？", "経験談を一次資料や実測で裏取りする", "経験談だけで断定する", "論文だけ見て現場を見ない", "SWR、チューナ、アンテナ利得の話は経験談が多いほど、測定条件と根拠を確認します。", toolLinks.calculator, "コミュニティ知を否定せず、標準資料や現地測定で検証する姿勢が重要です。", [sources.swr, sources.antennaTuner, sources.antennaGain]),
  q("community-rssi-snr", "RSSIとSNR研究", "LoRaの実験でRSSIとSNRを分けて見る理由は？", "強度と復調しやすさが別だから", "同じ値だから", "距離が不要だから", "RSSIは強度、SNRは雑音に対する余裕です。近遠問題や衝突で意味が変わります。", toolLinks.calculator, "2022年のLoRa実験ではRSSI/SNR、近遠問題、クラスタ分けが議論されています。", [sources.loraRssiSnr2022]),
  q("community-sf-caveat", "高SFの注意", "LoRaで高いSFが常に最も頑健とは言い切れない理由は？", "チャネル変動やペイロード長で不利になる場合がある", "高SFは禁止だから", "RSSIが消えるから", "高SFは感度に有利ですが、送信時間が長くなり動的チャネルでは別の弱点が出ます。", toolLinks.calculator, "2020年研究は、高SFの頑健性を時間変動チャネルで再検討しています。", [sources.loraRapidFading2020, sources.loraBasics]),
  q("community-env-features", "環境特徴量", "近年の屋内LoRa研究で温湿度やCO2を入れる狙いは？", "RSSI残差の説明候補にするため", "送信電力を上げるため", "波長を固定するため", "人の活動や空調、環境変化を特徴量として扱い、モデル残差を減らす試みです。", toolLinks.calculator, "特徴量は魔法ではなく、測定環境で有効性を検証します。", [sources.loraDataset2025, sources.envAware2025]),
  q("community-residual-tail", "残差の裾", "平均誤差が小さくても通信設計で心配なものは？", "悪い側の重い裾", "平均値そのもの", "ページ名", "残差の裾が重いと、まれな大きな落ち込みが通信失敗につながります。", toolLinks.calculator, "環境認識型フェードマージンでは、非ガウス残差や分位点が重要になります。", [sources.envAware2025]),
  q("community-quantile-margin", "分位点マージン", "信頼率95%の設計で見るべき値は？", "悪い側5%付近の余裕", "平均だけ", "最大RSSIだけ", "通信失敗を減らすには、平均ではなく分位点で余裕を見ます。", toolLinks.calculator, "フェードマージンは分布の上側・下側の扱いで変わります。", [sources.envAware2025]),
  q("community-bootstrap-research", "ブートストラップ", "有限測定データでブートストラップを使う目的は？", "推定値の不確かさを見る", "データを全部捨てる", "周波数を増やす", "測定数が有限なら、推定した分位点にも不確かさがあります。", toolLinks.calculator, "通信可否の余裕を数値化するには、不確かさも併記します。", [sources.envAware2025]),
  q("community-block-bootstrap", "ブロック再標本化", "時系列RSSIでブロック化する理由は？", "時間相関を保つため", "単位を変えるため", "外れ値を全削除するため", "連続測定は独立でないため、相関を壊しすぎない再標本化が有効です。", toolLinks.calculator, "時系列の揺れを扱う研究では、独立同分布を雑に仮定しないことが大切です。", [sources.envAware2025]),
  q("community-leakage", "評価リーク", "測定研究で評価リークを避ける理由は？", "未知環境性能を過大評価しないため", "平均を大きくするため", "距離を消すため", "同じ環境の情報が学習と評価に漏れると、実力より良く見えます。", toolLinks.propagation, "モデル評価は、式そのものと同じくらい重要です。", [sources.envAware2025, sources.envKal2025]),
  q("community-domain-shift", "ドメインシフト", "別建物へモデルを移すと精度が落ちる理由は？", "環境分布が変わるため", "RSSIが存在しないため", "周波数が違う単位だから", "壁材、什器、人流、ゲートウェイ位置が違えば特徴量とRSSIの関係も変わります。", toolLinks.propagation, "現場展開では、学習環境と運用環境の差を確認します。", [sources.loraDataset2025, sources.envAware2025]),
  q("community-metadata", "メタデータ", "研究用RSSIデータに必須に近い情報は？", "距離、高さ、時刻、姿勢、環境", "色名だけ", "CSVの行数だけ", "メタデータがないと、なぜRSSIが変わったか後から検証できません。", toolLinks.propagation, "公開データセットの価値は、数値だけでなく条件記録にもあります。", [sources.loraDataset2025]),
  q("community-kalman", "適応カルマン", "RSSI平滑化で適応カルマンを使う狙いは？", "一時的な揺れと傾向を分ける", "送信電力を増やす", "距離を消す", "瞬間RSSIは揺れるため、時系列処理で安定した特徴を作ります。", toolLinks.propagation, "EnviKal-Locは環境特徴量とRSSI平滑化を組み合わせた例です。", [sources.envKal2025]),
  q("community-localization-link", "測位とリンク", "LoRa測位研究が距離評価にも参考になる理由は？", "RSSI変動と環境特徴量を扱うため", "距離計算を禁止するため", "周波数を隠すため", "測位とリンク設計は目的が違っても、RSSIの揺れをどう扱うかは共通します。", toolLinks.propagation, "RSSIを位置推定へ使う研究は、測定のばらつき理解にも役立ちます。", [sources.envKal2025]),
  q("community-aerpaw-altitude", "高度プラットフォーム", "AERPAW実測で高度差を見る意義は？", "遮蔽と見通し条件の差を見るため", "RSSIを消すため", "端末を増やさないため", "ドローンやヘリカイトは、地上車両と違う見通し条件を作ります。", toolLinks.calculator, "高度を変える実測は、ゲートウェイ設置高の効果を考える手掛かりになります。", [sources.aerpaw2026]),
  q("community-aerpaw-ground", "地上車両", "地上移動体のRSSIが揺れやすい理由は？", "地形・遮蔽・マルチパスが変化するため", "単位が変わるため", "電波が直線だけだから", "低高度移動は地面と周辺物体の影響を強く受けます。", toolLinks.calculator, "AERPAWの地上車両測定は、低高度IoTのばらつき理解に近い題材です。", [sources.aerpaw2026]),
  q("community-packet-success-research", "成功率研究", "RSSI/SNRに加えて成功率を記録する理由は？", "実際に通信できたかを示すため", "平均を隠すため", "アンテナ長を測るため", "物理指標が良くても、衝突や復調条件で失敗することがあります。", toolLinks.calculator, "距離評価は受信電力だけでなく、パケット成功率と合わせると実用に近づきます。", [sources.aerpaw2026]),
  q("community-geodata", "地理データ", "P.1812系で地理データが重要な理由は？", "地形やクラッタが損失に効くため", "dBmをmWへ変えるため", "問題数を増やすため", "標高、土地被覆、クラッタ高さは、長距離推定の前提になります。", toolLinks.calculator, "2025年研究では、P.1812-7に使う地理入力の選択が議論されています。", [sources.p1812Geo2025]),
  q("community-tree-height", "樹冠高", "樹冠高データを入れる狙いは？", "森林クラッタの高さを表すため", "アンテナ利得を固定するため", "RSSIを直接測るため", "森林は遮蔽と回折に効くため、高さ情報が推定に役立つ場合があります。", toolLinks.calculator, "ただしデータ解像度や分類品質の確認が必要です。", [sources.p1812Geo2025]),
  q("community-landcover", "土地被覆", "土地被覆データで分かることは？", "市街地・森林・農地などの地表種別", "受信機の色", "SWR値", "地表種別はクラッタ損失の目安になります。", toolLinks.calculator, "地図クラッタは平均モデルと現地条件をつなぐ補助情報です。", [sources.p1812Geo2025]),
  q("community-resolution", "解像度の罠", "地理データは高解像度なら常に良い、は？", "正しくない", "常に正しい", "使ってはいけない", "分類品質、更新性、代表値の割当が悪いと、高解像度でも精度は上がりません。", toolLinks.calculator, "地理データは細かさだけでなく、目的への適合性で選びます。", [sources.p1812Geo2025]),
  q("community-rel19-gap", "7〜24GHz", "Rel-19で注目される7〜24GHz帯の論点は？", "sub-6とmmWaveの間のモデル整備", "音声帯域だけ", "920MHz専用化", "中間周波数帯は6G候補としてモデル拡張が議論されています。", toolLinks.calculator, "標準モデルも新しい周波数利用に合わせて更新されます。", [sources.rel19]),
  q("community-uma-umi", "UMa/UMi", "UMa/UMiシナリオを分ける理由は？", "基地局高や街区スケールが違うため", "単位が違うため", "アンテナが不要だから", "マクロとマイクロでは見通し、建物高さ、距離スケールが変わります。", toolLinks.calculator, "3GPP系モデルはシナリオ前提が重要です。", [sources.rel19]),
  q("community-ut-antenna", "UTアンテナ", "端末アンテナモデルが重要な理由は？", "姿勢や実装でチャネルが変わるため", "ページ色が変わるため", "距離が不要になるため", "端末側のアンテナ特性はIoTでも大きな前提です。", toolLinks.calculator, "筐体・人体・偏波の扱いは、低高度IoTにも直結します。", [sources.rel19]),
  q("community-polarization-research", "偏波研究", "偏波を詳しく扱う理由は？", "端末姿勢や反射で受信電力が変わるため", "SWRを無視するため", "周波数を固定するため", "偏波ミスマッチはリンクマージンに直接効きます。", toolLinks.calculator, "Rel-19でも偏波パワー変動が論点に含まれます。", [sources.rel19]),
  q("community-near-field", "近傍界", "大規模アレイで近傍界が論点になる理由は？", "平面波近似が崩れる距離が伸びるため", "RSSIが使えないため", "単位が消えるため", "高周波・大開口では、近距離でも従来近似が合わない場合があります。", toolLinks.calculator, "IoT端末でも別スケールで近傍物体影響を確認します。", [sources.rel19]),
  q("community-nonstationarity", "空間非定常性", "空間非定常性とは？", "場所によりチャネル統計が変わること", "全地点でRSSIが同じこと", "距離が不要なこと", "大規模アレイや複雑環境では、見える散乱体が位置で変わります。", toolLinks.calculator, "平均モデルの限界を知るキーワードです。", [sources.rel19]),
  q("community-gain-reference", "利得基準", "アンテナ利得の論文や仕様で確認することは？", "dBiかdBdか、測定条件は何か", "文字数だけ", "周波数を隠しているか", "利得の基準と測定治具が違うと比較できません。", toolLinks.wavelength, "掲示板でもdBi/dBd混同は頻出です。", [sources.antennaGain]),
  q("community-ground-plane-research", "グランド面", "モノポールの研究・実装でグランド面を記録する理由は？", "アンテナの一部として効くため", "単なるネジ穴だから", "距離式に不要だから", "基板や筐体のサイズ・形状で放射特性が変わります。", toolLinks.wavelength, "小型端末では評価基板と実機基板の差が重要です。", [sources.monopoleGround, sources.groundPlane]),
  q("community-common-mode", "コモンモード", "コモンモード電流を研究・測定で疑う理由は？", "給電線が意図せず放射するため", "アンテナ利得が常にゼロだから", "受信感度が不要だから", "外皮電流があると、測定したアンテナパターンが給電線込みになります。", toolLinks.calculator, "測定系そのものが結果を変える典型例です。", [sources.commonMode, sources.coaxialCable]),
  q("community-tuner-loss", "チューナ損失", "アンテナチューナを研究者目線で評価するとき見るものは？", "整合だけでなく挿入損失", "SWRだけ", "外観だけ", "チューナは反射を見かけ上減らせても、内部損失や給電線損失が残ります。", toolLinks.calculator, "SWR低下と放射効率改善を分けて測ります。", [sources.antennaTuner, sources.swr]),
  q("community-swr-efficiency", "SWRと効率", "SWRだけでアンテナ性能を断定できない理由は？", "放射効率やパターンを示さないため", "SWRが存在しないため", "距離だけで決まるため", "ダミーロードは整合しても放射しません。効率と電界強度測定が必要です。", toolLinks.calculator, "コミュニティで最も長く続く話題の一つです。", [sources.swr, sources.antennaTuner]),
  q("community-capture-effect", "LoRaキャプチャ", "LoRaの同時送信評価でキャプチャ効果を見る理由は？", "強い信号だけ成功する場合があるため", "全衝突が必ず成功するため", "RSSIが不要だから", "衝突時の成功率は受信電力差や設定に依存します。", toolLinks.calculator, "近遠問題と合わせて、配置設計に効く論点です。", [sources.loraRssiSnr2022]),
  q("community-near-far-cluster", "近遠クラスタ", "端末をクラスタ分けする研究上の狙いは？", "近遠問題を緩和しやすくする", "測定を減らすだけ", "周波数を変えるだけ", "ゲートウェイ周りの端末分布を整理し、RSSI/SNRや電力制御を扱いやすくします。", toolLinks.calculator, "2022年LoRa-ESL研究は、クラスタと動的設定を扱っています。", [sources.loraRssiSnr2022]),
  q("community-large-dataset", "大規模データ", "100万件級のRSSIデータで見やすくなるものは？", "分布とばらつき", "単発の最大値だけ", "ページタイトル", "大量データでは平均だけでなく、時間・環境・外れ値を統計的に見られます。", toolLinks.propagation, "EnviKal-Loc系の大規模データは再現性評価にも意味があります。", [sources.envKal2025]),
  q("community-model-selection", "モデル比較", "研究で複数モデルを比較する理由は？", "条件により得意不得意が違うため", "正解を隠すため", "全部同じだから", "FSPL、Log-distance、Hata、特徴量モデルは前提が違います。", toolLinks.propagation, "万能モデル探しより、適用条件を明示することが重要です。", [sources.envAware2025, sources.loraDataset2025]),
  q("community-prediction-interval", "予測区間", "点推定だけでなく予測区間を見る理由は？", "通信失敗側のリスクを見るため", "平均を消すため", "RSSIを使わないため", "設計では一点の予測値より、どれだけ外れ得るかが重要です。", toolLinks.calculator, "信頼率つき距離計算は、予測区間的な考え方を簡易化したものです。", [sources.envAware2025]),
  q("community-non-gaussian", "非ガウス残差", "RSSI残差が正規分布だけで表しにくい場合に困ることは？", "フェードマージン推定がずれる", "平均が存在しない", "距離が使えない", "重い裾や混合状態があると、単純なσだけではリスクを見誤ります。", toolLinks.calculator, "Student-tや混合分布を候補にする研究の背景です。", [sources.envAware2025]),
  q("community-feature-selection", "特徴量選択", "環境特徴量を増やすほど必ず良い、は？", "正しくない", "常に正しい", "測定不要になる", "特徴量が多いほど過学習のリスクがあります。検証データで確認します。", toolLinks.propagation, "正則化や統計検定で有効性を確認します。", [sources.envAware2025]),
  q("community-open-data", "公開データ", "公開測定データの価値は？", "他者が再検証できる", "現地測定が永久不要になる", "全環境で同じになる", "条件付きで再利用できるデータは、モデル比較と教育に役立ちます。", toolLinks.propagation, "ただし別環境への外挿には注意が必要です。", [sources.loraDataset2025]),
  q("community-reproducibility", "再現性", "無線測定研究で再現性を高める要素は？", "手順、機材、位置、時刻、環境の記録", "結果だけ掲載", "悪い値を削除", "測定条件が残っていれば、別チームが結果を比較しやすくなります。", toolLinks.propagation, "研究と実務の橋渡しにはメタデータが欠かせません。", [sources.loraDataset2025, sources.aerpaw2026]),
  q("community-baseline", "ベースライン", "新しい補正モデルで必ず比較したい相手は？", "単純な基準モデル", "最も複雑なモデルだけ", "比較不要", "FSPLやLog-distanceなどの基準線と比べないと、改善の意味が分かりません。", toolLinks.propagation, "研究ベース距離シートでも複数モデル比較を重視しています。", [sources.envAware2025, sources.p1812Geo2025]),
  q("community-confidence", "信頼区間", "論文の改善値を見るとき確認したいものは？", "ばらつきや信頼区間", "平均値だけ", "タイトルだけ", "改善が偶然か、どの条件で有効かを判断するには不確かさの表示が必要です。", toolLinks.propagation, "平均改善だけでは現場判断に足りません。", [sources.envAware2025]),
  q("community-measurement-uncertainty", "測定不確かさ", "RSSI測定の不確かさに含まれるものは？", "端末個体差、姿勢、時刻、位置誤差", "ページ余白", "問題番号", "同じ条件に見えても、測定器や設置の差で結果は揺れます。", toolLinks.calculator, "AERPAWのようなフィールド測定でも、プラットフォーム差を分けて見ます。", [sources.aerpaw2026, sources.loraDataset2025]),
  q("community-human-blockage", "人体遮蔽研究", "人体遮蔽を端末近傍損失へ分ける発想が重要な理由は？", "端末周りの一時的損失だから", "Hataが完全に表すから", "距離と無関係だから", "人の動きは時間変動する近傍要因です。平均モデルだけでは説明しにくいです。", toolLinks.calculator, "Rel-19の端末アンテナや偏波議論とも、端末実装影響を意識する点でつながります。", [sources.rel19, sources.envAware2025]),
  q("community-high-band-clutter", "高周波クラッタ", "周波数が上がるほど詳細な遮蔽モデルが欲しくなる理由は？", "波長が短く物体影響が強くなるため", "低周波が存在しないため", "距離が不要になるため", "サブ6、7〜24GHz、mmWaveでは支配要因が変わります。", toolLinks.calculator, "Rel-19のモデル拡張はこの周波数帯の現実的な扱いにも関わります。", [sources.rel19]),
  q("community-iot-hata-correction", "IoT向けHata補正", "IoT向けにHataを使うなら現実的な扱いは？", "基準線として実測で補正する", "単独で全て保証する", "端末近傍損失を消す", "Hataは広域平均の参考にし、低高度IoTの実測差分や近傍損失を併用します。", toolLinks.calculator, "近年研究は万能な置換式より、測定・特徴量・残差管理を重視する流れです。", [sources.loraDataset2025, sources.envAware2025]),
  q("community-no-universal", "万能式はない", "最新研究から読み取れる現実的な結論は？", "万能な単一距離式はまだ難しい", "Hataだけで全環境OK", "FSPLだけで屋内OK", "環境、実装、時間変動、干渉が絡むため、複数の根拠を重ねます。", toolLinks.calculator, "本ツールも標準モデル、端末近傍損失、実測補正、信頼率を組み合わせます。", [sources.envAware2025, sources.aerpaw2026, sources.p1812Geo2025, sources.rel19]),
  q("community-governance", "モデル管理", "組織で伝搬モデルを使うとき必要な管理は？", "適用範囲、版、補正履歴の記録", "計算者の記憶だけ", "警告削除", "同じモデル名でも版や補正条件が違うと結果が変わります。", toolLinks.calculator, "標準化や地理データ研究を使うほど、前提管理が重要になります。", [sources.rel19, sources.p1812Geo2025]),
  q("community-field-validation", "フィールド検証", "研究モデルを現場導入する最後の確認は？", "実地測定での検証", "論文タイトルだけ", "シミュレーションだけ", "現地のアンテナ、筐体、遮蔽、運用条件で確認して初めて判断できます。", toolLinks.calculator, "AERPAWのようなフィールド測定は、机上モデルの限界を知る材料になります。", [sources.aerpaw2026]),
  q("community-researcher-boss", "研究者トリビアボス", "研究者モードで一番大切な考え方は？", "物理、統計、実測、運用をつなげて検証する", "新しい論文名だけ覚える", "式を一つだけ信じる", "最新研究は、単一式で断定するより、データと不確かさを管理する方向へ進んでいます。", toolLinks.calculator, "掲示板の知恵も論文も、最後は現場の測定で接続します。", [sources.loraDataset2025, sources.envAware2025, sources.envKal2025, sources.aerpaw2026, sources.p1812Geo2025, sources.rel19, sources.swr, sources.antennaTuner])
];

export const rfQuestLessons: QuestLesson[] = [
  ...coreQuestLessons,
  ...makeExpansionLessons("beginner", beginnerExpansionSeeds),
  ...makeExpansionLessons("beginner", beginnerCommunitySeeds, 51),
  ...makeExpansionLessons("apprentice", apprenticeExpansionSeeds),
  ...makeExpansionLessons("apprentice", apprenticeCommunitySeeds, 51),
  ...makeExpansionLessons("practitioner", practitionerExpansionSeeds),
  ...makeExpansionLessons("practitioner", practitionerCommunitySeeds, 51),
  ...makeExpansionLessons("expert", expertExpansionSeeds),
  ...makeExpansionLessons("expert", expertCommunitySeeds, 51),
  ...makeExpansionLessons("researcher", researcherExpansionSeeds),
  ...makeExpansionLessons("researcher", researcherCommunitySeeds, 51)
];
