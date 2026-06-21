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
    badge: "50問"
  },
  {
    id: "apprentice",
    label: "見習いモード",
    title: "反射と近傍損失の洞窟",
    description: "2波、フレネル、端末近傍損失、実測補正の基本を扱います。",
    badge: "50問"
  },
  {
    id: "practitioner",
    label: "実務者モード",
    title: "モデル選択の砦",
    description: "通信形態ごとのモデル選択、Hata系の適用範囲、信頼率評価を確認します。",
    badge: "50問"
  },
  {
    id: "expert",
    label: "玄人モード",
    title: "基地局設計の迷宮",
    description: "SUI、COST231 WI、3GPP、GIS、複数実測点など、設計実務寄りの判断を学びます。",
    badge: "50問"
  },
  {
    id: "researcher",
    label: "研究者モード",
    title: "最新研究の塔",
    description: "2025〜2026年の測定研究、環境特徴量、残差分布、Rel-19の論点を織り込みます。",
    badge: "50問"
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
  beginner: ["単位の小部屋", "距離の草原", "アンテナ工房", "判定の広場"],
  apprentice: ["反射洞窟", "近傍損失の沼", "実測の祠", "設置ばらつきの谷"],
  practitioner: ["モデル選択の砦", "Hata審問室", "信頼率の城壁", "校正の作戦室"],
  expert: ["基地局設計の迷宮", "都市街路の屋根上", "GISの地図塔", "容量干渉の戦場"],
  researcher: ["測定論文の書庫", "環境特徴量の研究棟", "残差分布の実験室", "標準化会議の塔"]
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

function makeExpansionLessons(mode: QuestModeId, seeds: QuestExpansionSeed[]): QuestLesson[] {
  return seeds.map((seed, index) => {
    const stage = index + 11;
    const chapterIndex = Math.floor(index / 10);
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

export const rfQuestLessons: QuestLesson[] = [
  ...coreQuestLessons,
  ...makeExpansionLessons("beginner", beginnerExpansionSeeds),
  ...makeExpansionLessons("apprentice", apprenticeExpansionSeeds),
  ...makeExpansionLessons("practitioner", practitionerExpansionSeeds),
  ...makeExpansionLessons("expert", expertExpansionSeeds),
  ...makeExpansionLessons("researcher", researcherExpansionSeeds)
];
