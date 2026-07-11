/**
 * 日本の主要 4G(LTE)/5G(NR) バンドの周波数レンジ定義。
 *
 * 出典:
 *   - 4G(LTE) B1/B3/B8/B18/B19/B28/B41/B42:
 *     3GPP TS 36.101 "E-UTRA; User Equipment (UE) radio transmission and reception",
 *     Table 5.5-1 "E-UTRA operating bands"
 *   - 5G(NR) n77/n78/n79:
 *     3GPP TS 38.101-1 "NR; UE radio transmission and reception; Part 1: Range 1 Standalone",
 *     Table 5.2-1 "NR operating bands in FR1"
 *   - 5G(NR) n257（28GHzミリ波）:
 *     3GPP TS 38.101-2 "Part 2: Range 2 Standalone", Table 5.2-1 "NR operating bands in FR2"
 *     （TS 38.101-1 の姉妹編。FR2 バンドは -2 側に定義される）
 *   - 通称・国内の主な利用キャリア: 総務省 周波数割当計画・電波政策資料（2026年時点の目安。
 *     割当は再編で変わり得るため、最新は総務省の公表資料を確認すること）
 *
 * 単位: すべて MHz。FDD は UL/DL のペア、TDD は単一レンジ（上り下り時分割）を持つ。
 * プラチナバンド区分: 700〜900MHz帯（B8/B18/B19/B28）を isPlatinum=true とする。
 */

export type CellularGeneration = "4G" | "5G";
export type DuplexMode = "FDD" | "TDD";

export type CellularBandRange = {
  /** レンジ下限 [MHz]（含む）。 */
  minMHz: number;
  /** レンジ上限 [MHz]（含む）。 */
  maxMHz: number;
};

export type CellularBand = {
  /** バンド名（3GPP表記。LTE=Bxx / NR=nxx）。 */
  key: string;
  generation: CellularGeneration;
  duplex: DuplexMode;
  /** 「2GHz帯」などの通称。 */
  nickname: string;
  /** FDD の上り（端末→基地局）レンジ。TDD では undefined。 */
  uplink?: CellularBandRange;
  /** FDD の下り（基地局→端末）レンジ。TDD では undefined。 */
  downlink?: CellularBandRange;
  /** TDD の共用レンジ（上り下りを時分割）。FDD では undefined。 */
  tdd?: CellularBandRange;
  /** プラチナバンド区分（700〜900MHz帯）。 */
  isPlatinum: boolean;
  /** 初心者向けの特徴解説（1〜2文）。 */
  note: string;
};

/** 日本の主要バンド（4G→5Gの順、各世代内は周波数昇順ではなくBand番号順）。 */
export const CELLULAR_BANDS: readonly CellularBand[] = [
  {
    key: "B1",
    generation: "4G",
    duplex: "FDD",
    nickname: "2GHz帯",
    uplink: { minMHz: 1920, maxMHz: 1980 },
    downlink: { minMHz: 2110, maxMHz: 2170 },
    isPlatinum: false,
    note: "3G時代からの国内主力バンド。都市部の容量確保に広く使われますが、屋内の奥までは届きにくい帯域です。"
  },
  {
    key: "B3",
    generation: "4G",
    duplex: "FDD",
    nickname: "1.7GHz帯",
    uplink: { minMHz: 1710, maxMHz: 1785 },
    downlink: { minMHz: 1805, maxMHz: 1880 },
    isPlatinum: false,
    note: "都市部で広く使われる1.7GHz帯。楽天モバイルが参入時の主力としたバンドでもあります。"
  },
  {
    key: "B8",
    generation: "4G",
    duplex: "FDD",
    nickname: "900MHz帯",
    uplink: { minMHz: 880, maxMHz: 915 },
    downlink: { minMHz: 925, maxMHz: 960 },
    isPlatinum: true,
    note: "ソフトバンクが2012年に獲得した900MHz帯。同社が「プラチナバンド」の呼び名を広めたバンドです。"
  },
  {
    key: "B18",
    generation: "4G",
    duplex: "FDD",
    nickname: "800MHz帯（au）",
    uplink: { minMHz: 815, maxMHz: 830 },
    downlink: { minMHz: 860, maxMHz: 875 },
    isPlatinum: true,
    note: "auのエリアを支える800MHz帯。山間部・屋内への回り込みに強いプラチナバンドです。"
  },
  {
    key: "B19",
    generation: "4G",
    duplex: "FDD",
    nickname: "800MHz帯（docomo）",
    uplink: { minMHz: 830, maxMHz: 845 },
    downlink: { minMHz: 875, maxMHz: 890 },
    isPlatinum: true,
    note: "docomoの800MHz帯。ガラケー時代から日本の広域カバーを担ってきたプラチナバンドです。"
  },
  {
    key: "B28",
    generation: "4G",
    duplex: "FDD",
    nickname: "700MHz帯",
    uplink: { minMHz: 703, maxMHz: 748 },
    downlink: { minMHz: 758, maxMHz: 803 },
    isPlatinum: true,
    note: "地デジ移行で空いた700MHz帯。2023年には楽天モバイルにも割り当てられた、最後発のプラチナバンドです。"
  },
  {
    key: "B41",
    generation: "4G",
    duplex: "TDD",
    nickname: "2.5GHz帯",
    tdd: { minMHz: 2496, maxMHz: 2690 },
    isPlatinum: false,
    note: "WiMAX/AXGP由来のTDDバンド。上り下りを時間で切り替えて同じ周波数を使います。"
  },
  {
    key: "B42",
    generation: "4G",
    duplex: "TDD",
    nickname: "3.5GHz帯",
    tdd: { minMHz: 3400, maxMHz: 3600 },
    isPlatinum: false,
    note: "LTEの3.5GHz帯TDD。のちに5G n78と重なる周波数で、4G→5Gの転用が進む帯域です。"
  },
  {
    key: "n77",
    generation: "5G",
    duplex: "TDD",
    nickname: "3.7GHz帯",
    tdd: { minMHz: 3300, maxMHz: 4200 },
    isPlatinum: false,
    note: "Sub6 5Gの主力。n78を丸ごと含む広いレンジ定義で、日本では3.7GHz帯の割当がここに入ります。"
  },
  {
    key: "n78",
    generation: "5G",
    duplex: "TDD",
    nickname: "3.5GHz帯",
    tdd: { minMHz: 3300, maxMHz: 3800 },
    isPlatinum: false,
    note: "世界で最も広く使われる5Gバンド。n77の部分集合で、対応スマホが最も多い帯域です。"
  },
  {
    key: "n79",
    generation: "5G",
    duplex: "TDD",
    nickname: "4.5GHz帯",
    tdd: { minMHz: 4400, maxMHz: 5000 },
    isPlatinum: false,
    note: "日本（docomo）などが使う4.5GHz帯。海外での採用が少なく、対応端末を選ぶバンドです。"
  },
  {
    key: "n257",
    generation: "5G",
    duplex: "TDD",
    nickname: "28GHzミリ波",
    tdd: { minMHz: 26500, maxMHz: 29500 },
    isPlatinum: false,
    note: "28GHzのミリ波。桁違いの帯域幅で超高速ですが、遮蔽に極端に弱く、スポット利用が前提です。"
  }
];

/** プラチナバンド区分の周波数範囲 [MHz]（総務省資料での通称は700〜900MHz帯）。 */
export const PLATINUM_RANGE_MHZ = { minMHz: 700, maxMHz: 960 } as const;
