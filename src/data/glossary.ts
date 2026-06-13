export type GlossaryEntry = {
  term: string;
  description: string;
};

export const glossary = {
  frequency: {
    term: "周波数",
    description: "電波が1秒間に振動する回数です。周波数が高いほど波長は短くなります。"
  },
  wavelength: {
    term: "波長",
    description: "電波1周期分の長さです。アンテナのサイズ感と関係します。"
  },
  db: {
    term: "dB",
    description: "倍率や損失を対数で表す単位です。+10dBは10倍、-10dBは1/10を意味します。"
  },
  dbm: {
    term: "dBm",
    description: "1mWを基準にした電力の単位です。0dBmは1mWです。"
  },
  dbi: {
    term: "dBi",
    description: "理想的な等方性アンテナを基準にしたアンテナ利得の単位です。"
  },
  fspl: {
    term: "自由空間損失",
    description:
      "障害物や反射のない理想的な空間で、電波が距離によって弱くなる量です。"
  },
  linkBudget: {
    term: "リンクバジェット",
    description:
      "送信側から受信側までの利得と損失を整理し、受信電力や通信余裕を見積もる考え方です。"
  },
  receivedPower: {
    term: "受信電力",
    description: "受信機に届くと推定される電波の強さです。"
  },
  receiverSensitivity: {
    term: "受信感度",
    description: "受信機がどれくらい弱い電波まで受け取れるかを示す値です。"
  },
  linkMargin: {
    term: "リンクマージン",
    description:
      "受信感度に対して、受信電力がどれくらい上回っているかを示す余裕です。"
  },
  antennaGain: {
    term: "アンテナ利得",
    description:
      "アンテナが特定方向へどれだけ効率よく電波を出せるか、または受けられるかの目安です。"
  },
  cableLoss: {
    term: "ケーブル損失",
    description: "アンテナケーブルやコネクタで失われる電力です。"
  },
  environmentLoss: {
    term: "環境補正損失",
    description:
      "壁、筐体、金属部品、人体、設置環境などによる追加損失の目安です。"
  }
} satisfies Record<string, GlossaryEntry>;

export type GlossaryKey = keyof typeof glossary;
