/**
 * Band 地図 v3 の国・事業者別データ。
 *
 * standardRange は 3GPP の Band 全体、deployment は事業者での利用状況を表す。
 * 事業者が Band 全域を保有・全国利用している意味ではない。確認日: 2026-07-12。
 */

export type WorldRegion = "japan" | "north-america" | "europe" | "china" | "korea" | "india";
export type DeploymentStatus = "confirmed-current" | "confirmed-historical" | "unverified-current" | "revoked";
export type IotTechnology = "LTE-M" | "NB-IoT";
export type AllocationScope = "national" | "shared" | "regional" | "unpublished" | "revoked";

export type CarrierBandDetail = {
  /** 事業者の実割当・実利用範囲。Band標準全域を代用しない。 */
  allocation: string;
  allocationScope: AllocationScope;
  /** その事業者のネットワークでこのBandが担う具体的な役割。 */
  role: string;
};

export type CarrierBandDetailSet = {
  sourceLabel: string;
  sourceUrl: string;
  bands: Readonly<Record<string, CarrierBandDetail>>;
};

export type StandardBandRange = {
  key: string;
  generation: "4G" | "5G";
  duplex: "FDD" | "TDD";
  uplinkMHz?: readonly [number, number];
  downlinkMHz?: readonly [number, number];
  tddMHz?: readonly [number, number];
};

export type CarrierBandDeployment = {
  band: string;
  positioning: string;
  status?: DeploymentStatus;
  iot?: readonly IotTechnology[];
};

export type CarrierProfile = {
  id: string;
  region: WorldRegion;
  country: string;
  carrier: string;
  bands: readonly CarrierBandDeployment[];
  iotSummary: string;
  sourceLabel: string;
  sourceUrl: string;
  checkedAt: "2026-07-12";
  allocationNote?: string;
};

const fdd = (
  key: string,
  generation: "4G" | "5G",
  uplinkMHz: readonly [number, number],
  downlinkMHz: readonly [number, number]
): StandardBandRange => ({ key, generation, duplex: "FDD", uplinkMHz, downlinkMHz });

const tdd = (key: string, generation: "4G" | "5G", tddMHz: readonly [number, number]): StandardBandRange => ({
  key,
  generation,
  duplex: "TDD",
  tddMHz
});

/** UI に登場する世界の代表 Band。周波数は MHz。 */
export const STANDARD_BAND_RANGES: readonly StandardBandRange[] = [
  fdd("B1", "4G", [1920, 1980], [2110, 2170]), fdd("B2", "4G", [1850, 1910], [1930, 1990]),
  fdd("B3", "4G", [1710, 1785], [1805, 1880]), fdd("B4", "4G", [1710, 1755], [2110, 2155]),
  fdd("B5", "4G", [824, 849], [869, 894]), fdd("B7", "4G", [2500, 2570], [2620, 2690]),
  fdd("B8", "4G", [880, 915], [925, 960]), fdd("B11", "4G", [1427.9, 1447.9], [1475.9, 1495.9]),
  fdd("B12", "4G", [699, 716], [729, 746]), fdd("B13", "4G", [777, 787], [746, 756]),
  fdd("B14", "4G", [788, 798], [758, 768]), fdd("B18", "4G", [815, 830], [860, 875]),
  fdd("B19", "4G", [830, 845], [875, 890]), fdd("B20", "4G", [832, 862], [791, 821]),
  fdd("B21", "4G", [1447.9, 1462.9], [1495.9, 1510.9]), fdd("B26", "4G", [814, 849], [859, 894]),
  fdd("B28", "4G", [703, 748], [758, 803]), fdd("B30", "4G", [2305, 2315], [2350, 2360]),
  tdd("B34", "4G", [2010, 2025]), tdd("B39", "4G", [1880, 1920]), tdd("B40", "4G", [2300, 2400]),
  tdd("B41", "4G", [2496, 2690]), tdd("B42", "4G", [3400, 3600]), tdd("B48", "4G", [3550, 3700]),
  fdd("B66", "4G", [1710, 1780], [2110, 2200]), fdd("B71", "4G", [663, 698], [617, 652]),
  fdd("n1", "5G", [1920, 1980], [2110, 2170]), fdd("n2", "5G", [1850, 1910], [1930, 1990]),
  fdd("n3", "5G", [1710, 1785], [1805, 1880]), fdd("n5", "5G", [824, 849], [869, 894]),
  fdd("n8", "5G", [880, 915], [925, 960]), fdd("n14", "5G", [788, 798], [758, 768]),
  fdd("n25", "5G", [1850, 1915], [1930, 1995]), fdd("n28", "5G", [703, 748], [758, 803]),
  fdd("n66", "5G", [1710, 1780], [2110, 2200]), fdd("n71", "5G", [663, 698], [617, 652]),
  tdd("n41", "5G", [2496, 2690]), tdd("n77", "5G", [3300, 4200]), tdd("n78", "5G", [3300, 3800]),
  tdd("n79", "5G", [4400, 5000]), tdd("n257", "5G", [26500, 29500]), tdd("n258", "5G", [24250, 27500]),
  tdd("n260", "5G", [37000, 40000]), tdd("n261", "5G", [27500, 28350])
];

const d = (band: string, positioning: string, options: Partial<CarrierBandDeployment> = {}): CarrierBandDeployment => ({
  band,
  positioning,
  ...options
});

const checkedAt = "2026-07-12" as const;

/** 一次情報で現行利用を確認できた代表 Band を中心に収録する。 */
export const CARRIER_PROFILES: readonly CarrierProfile[] = [
  {
    id: "jp-docomo", region: "japan", country: "日本", carrier: "NTTドコモ", checkedAt,
    bands: [d("B1", "2GHz基幹容量"), d("B3", "1.7GHz容量"), d("B19", "800MHz広域・屋内", { iot: ["LTE-M"] }), d("B21", "1.5GHz補完"), d("B28", "700MHz広域"), d("B42", "3.5GHz容量"), d("n1", "既存帯5G"), d("n28", "面的5G"), d("n77", "3.7GHz Sub6"), d("n78", "3.4/3.5GHz Sub6"), d("n79", "4.5GHz Sub6"), d("n257", "28GHz局所")],
    iotSummary: "LTE-Mは継続。NB-IoTは2020-03-31終了。", sourceLabel: "NTTドコモ 周波数について", sourceUrl: "https://www.docomo.ne.jp/corporate/csr/network/radio/about.html"
  },
  {
    id: "jp-au", region: "japan", country: "日本", carrier: "KDDI au", checkedAt,
    bands: [d("B1", "2GHz基幹"), d("B3", "1.7GHz補完"), d("B11", "1.5GHz補完"), d("B18", "800MHz広域", { iot: ["LTE-M"] }), d("B28", "700MHz広域"), d("B41", "WiMAX 2+容量"), d("B42", "3.5GHz容量"), d("n28", "700MHz面的5G"), d("n77", "3.7/4.0GHz Sub6"), d("n78", "3.5GHz Sub6"), d("n257", "28GHz局所")],
    iotSummary: "LTE-Mは全都道府県で商用提供。NB-IoTの国内商用提供は未確認。", sourceLabel: "KDDI LTE-M全国展開", sourceUrl: "https://news.kddi.com/kddi/corporate/newsrelease/2018/06/26/3227.html"
  },
  {
    id: "jp-softbank", region: "japan", country: "日本", carrier: "SoftBank", checkedAt,
    bands: [d("B1", "2GHz基幹", { iot: ["LTE-M"] }), d("B3", "1.7GHz容量"), d("B8", "900MHz広域・屋内", { iot: ["LTE-M", "NB-IoT"] }), d("B11", "1.5GHz補完"), d("B28", "700MHz広域"), d("B41", "AXGP容量"), d("B42", "3.5GHz容量"), d("n1", "既存帯5G"), d("n3", "既存帯5G"), d("n28", "面的5G"), d("n77", "Sub6"), d("n257", "28GHz局所")],
    iotSummary: "LTE-MおよびNB-IoTを全国商用網で提供中。", sourceLabel: "SoftBank IoT 1NCE", sourceUrl: "https://www.softbank.jp/business/service/iot/1nce/"
  },
  {
    id: "jp-rakuten", region: "japan", country: "日本", carrier: "楽天モバイル", checkedAt,
    bands: [d("B3", "全国マクロ主力", { iot: ["NB-IoT"] }), d("B28", "700MHz補完・2024年商用開始"), d("n77", "3.7GHz Sub6"), d("n257", "28GHz局所")],
    iotSummary: "NB-IoTは商用提供中（Band 3）。LTE-Mはテスト利用・未商用。", sourceLabel: "楽天モバイル 700MHz商用開始", sourceUrl: "https://corp.mobile.rakuten.co.jp/english/news/press/2024/0627_02/"
  },
  {
    id: "us-att", region: "north-america", country: "米国", carrier: "AT&T / FirstNet", checkedAt,
    bands: [d("B2", "PCS容量"), d("B4", "AWS容量"), d("B5", "850MHz広域"), d("B12", "700MHz広域"), d("B14", "FirstNet公共安全専用20MHz"), d("B30", "WCS容量補完"), d("B66", "AWS容量"), d("n5", "低帯5G"), d("n77", "C-band/3.45GHz 5G+"), d("n260", "mmWave局所")],
    iotSummary: "LTE-Mは現行プランあり。NB-IoTは導入実績あり、2026年の提供範囲は未確認。", sourceLabel: "FirstNet Band 14", sourceUrl: "https://www.firstnet.com/coverage/band-14.html"
  },
  {
    id: "us-verizon", region: "north-america", country: "米国", carrier: "Verizon", checkedAt,
    bands: [d("B13", "700MHz全国LTE基盤"), d("B4", "AWS容量"), d("B48", "CBRS企業用途"), d("n77", "C-band Ultra Wideband"), d("n260", "mmWave局所"), d("n261", "mmWave局所")],
    iotSummary: "LTE-MとNB-IoTを現行4G LTE網で提供。使用Bandは未確認。", sourceLabel: "Verizon LTE-M & NB-IoT", sourceUrl: "https://www.verizon.com/business/products/internet-of-things/iot-networks/lte-m-narrowband-iot/"
  },
  {
    id: "us-tmobile", region: "north-america", country: "米国", carrier: "T-Mobile US", checkedAt,
    bands: [d("B12", "700MHz Extended Range"), d("B71", "600MHz Extended Range"), d("B66", "AWS容量"), d("n71", "600MHz全国5G"), d("n41", "2.5GHz 5G UC主力"), d("n25", "1900MHz容量"), d("n260", "mmWave局所"), d("n261", "mmWave局所")],
    iotSummary: "NB-IoTは現行料金ページあり。LTE-Mも技術選択肢として掲載、使用Bandは未確認。", sourceLabel: "T-Mobile network bands", sourceUrl: "https://www.t-mobile.com/support/coverage/t-mobile-network"
  },
  {
    id: "de-telekom", region: "europe", country: "ドイツ", carrier: "Deutsche Telekom", checkedAt,
    bands: [d("B20", "800MHz広域", { iot: ["LTE-M"] }), d("B8", "900MHz屋内・郊外", { iot: ["NB-IoT"] }), d("B3", "1800MHz容量", { iot: ["LTE-M"] }), d("B1", "2100MHz DSS"), d("B7", "2600MHz容量"), d("n28", "700MHz面的5G"), d("n1", "2.1GHz 5G"), d("n78", "3.6GHz都市容量")],
    iotSummary: "LTE-M/NB-IoTとも人口99%超。LTE-M=B20/B3、NB-IoT=B8を現行資料で確認。", sourceLabel: "DT IoT roaming network info", sourceUrl: "https://hub.iot.telekom.com/docs/device-to-cloud/general-info/roaming-network-info/"
  },
  {
    id: "de-vodafone", region: "europe", country: "ドイツ", carrier: "Vodafone Germany", checkedAt,
    bands: [d("B20", "800MHz広域"), d("B8", "900MHz低帯"), d("B3", "1800MHz容量"), d("B1", "2100MHz容量"), d("B7", "2600MHz容量"), d("n28", "700MHz 5G+"), d("n3", "1800MHz 5G+"), d("n78", "3.5GHz容量")],
    iotSummary: "LTE-M/NB-IoTを提供。試験対応Bandと全国商用Bandは同一視しない。", sourceLabel: "Vodafone Germany 2G migration", sourceUrl: "https://www.vodafone.de/business/hilfe-support/2g-abschaltung/"
  },
  {
    id: "fr-orange", region: "europe", country: "フランス", carrier: "Orange France", checkedAt,
    bands: [d("B28", "700MHz広域"), d("B20", "800MHz広域", { iot: ["LTE-M"] }), d("B3", "1800MHz容量"), d("B1", "2100MHz容量"), d("B7", "2600MHz容量"), d("n28", "700MHz 5G+補完"), d("n1", "地方5G"), d("n78", "3.5GHz 5G中核")],
    iotSummary: "LTE-MはB20で人口99%超。Orange FranceのNB-IoTは未確認。", sourceLabel: "Orange LTE-M", sourceUrl: "https://www.orange-business.com/fr/reseau-LTE-M"
  },
  {
    id: "cn-mobile", region: "china", country: "中国", carrier: "中国移動", checkedAt,
    bands: [d("B8", "900MHz広域", { iot: ["NB-IoT"] }), d("B3", "1800MHz"), d("B39", "1900MHz TDD"), d("B40", "2300MHz"), d("B41", "2600MHz"), d("n41", "2.6GHz 5G主力"), d("n79", "4.9GHz産業・補完"), d("n28", "中国広電との700MHz共同網")],
    iotSummary: "NB-IoTを確認。LTE-M/eMTCの現行商用提供は未確認。", sourceLabel: "MIIT 事業者別周波数", sourceUrl: "https://wap.miit.gov.cn/jgsj/wgj/kpzs/art/2021/art_9105abf8095d49bd9065c1b6ebb06d2a.html",
    allocationNote: "700MHzは中国広電免許の共同網。中国移動単独保有ではない。"
  },
  {
    id: "cn-telecom", region: "china", country: "中国", carrier: "中国電信", checkedAt,
    bands: [d("B5", "850MHz広域", { iot: ["NB-IoT"] }), d("B3", "1800MHz"), d("B1", "2100MHz"), d("n5", "800MHz 5G再耕"), d("n78", "3.4GHz・聯通と共同")],
    iotSummary: "NB-IoT現行商品を確認。LTE-Mは未確認。", sourceLabel: "中国電信 NB-IoT", sourceUrl: "https://gd.189.cn/biz/product/wlw/wlw02.html"
  },
  {
    id: "cn-unicom", region: "china", country: "中国", carrier: "中国聯通", checkedAt,
    bands: [d("B8", "900MHz広域", { iot: ["NB-IoT"] }), d("B3", "1800MHz", { iot: ["NB-IoT"] }), d("B1", "2100MHz"), d("B40", "2300MHz"), d("n8", "900MHz 5G再耕"), d("n1", "2100MHz 5G再耕"), d("n78", "3.5GHz・電信と共同")],
    iotSummary: "NB-IoTは商用提供中（Band 3 / Band 8）。LTE-Mは未確認。", sourceLabel: "China Unicom 2024 annual report", sourceUrl: "https://ar2024.chinaunicom.com.hk/English/business-overview.html"
  },
  {
    id: "kr-skt", region: "korea", country: "韓国", carrier: "SK Telecom", checkedAt,
    bands: [d("B5", "850MHz", { status: "confirmed-current" }), d("B3", "1800MHz", { status: "confirmed-current" }), d("B1", "2100MHz", { status: "confirmed-current" }), d("B7", "2600MHz", { status: "confirmed-current" }), d("n78", "3.6–3.7GHz 5G"), d("n257", "旧28GHz・免許取消", { status: "revoked" })],
    iotSummary: "LTE-Mは2017年導入実績あり、2026年の新規提供は未確認。NB-IoT未確認。", sourceLabel: "韓国政府 SKT 28GHz取消", sourceUrl: "https://www.korea.kr/briefing/pressReleaseView.do?newsId=156572781"
  },
  {
    id: "kr-kt", region: "korea", country: "韓国", carrier: "KT", checkedAt,
    bands: [d("B8", "900MHz", { status: "confirmed-current" }), d("B3", "1800MHz", { status: "confirmed-current" }), d("B1", "2100MHz", { status: "confirmed-current" }), d("B26", "保有するが商業LTEは非稼働", { status: "revoked" }), d("n78", "3.5–3.6GHz 5G"), d("n257", "旧28GHz・免許取消", { status: "revoked" })],
    iotSummary: "NB-IoTの料金・モジュール提供を2024資料で確認。LTE-Mは未確認。", sourceLabel: "韓国政府 KT/LG U+ 28GHz取消", sourceUrl: "https://www.korea.kr/news/policyNewsView.do?newsId=148909781"
  },
  {
    id: "kr-lgu", region: "korea", country: "韓国", carrier: "LG U+", checkedAt,
    bands: [d("B5", "850MHz", { iot: ["NB-IoT"], status: "confirmed-current" }), d("B3", "商業非稼働（LG U+はB3不使用）", { status: "revoked" }), d("B1", "2100MHz", { status: "confirmed-current" }), d("B7", "2600MHz", { status: "confirmed-current" }), d("n78", "3.42–3.5GHz 5G"), d("n257", "旧28GHz・免許取消", { status: "revoked" })],
    iotSummary: "NB-IoTは現行大規模利用を確認。LTE-Mは導入実績あり、現行提供は要確認。", sourceLabel: "LG U+ NB-IoT", sourceUrl: "https://www.lguplus.com/about/en/corporation/promotion/press-kit/detail?atclNo=2000001510&pageNo=1&srchCond=titCon"
  },
  {
    id: "in-jio", region: "india", country: "インド", carrier: "Reliance Jio", checkedAt,
    bands: [d("B5", "850MHz"), d("B3", "1800MHz"), d("B40", "2300MHz"), d("n28", "700MHz広域"), d("n78", "3.5GHz容量主力"), d("n258", "26GHz企業/FWA")],
    iotSummary: "NB-IoTおよびLTE-Mを商用網（JioThings）で全国展開中。", sourceLabel: "Jio True 5G bands", sourceUrl: "https://www.jio.com/help/faq/mobile/jio-true-5g/about-5g/what-are-the-bands-on-which-jio-5g-is-available.html",
    allocationNote: "4G実割当はLSA（サービスエリア）ごとに異なる。"
  },
  {
    id: "in-airtel", region: "india", country: "インド", carrier: "Bharti Airtel", checkedAt,
    bands: [d("B8", "900MHz"), d("B3", "1800MHz"), d("B1", "2100MHz"), d("B40", "2300MHz"), d("n8", "低帯5G"), d("n3", "1800MHz再耕"), d("n1", "2100MHz再耕"), d("n78", "3.5GHz容量主力"), d("n258", "26GHz容量")],
    iotSummary: "NB-IoTを商用展開。現行IoT商品はNB-IoT/LTE-M双方を掲載。", sourceLabel: "Airtel IoT connectivity", sourceUrl: "https://www.airtel.in/b2b/iot-connectivity/",
    allocationNote: "4G実割当はLSA（サービスエリア）ごとに異なる。"
  }
];

const detail = (allocation: string, role: string, allocationScope: AllocationScope = "national"): CarrierBandDetail => ({
  allocation,
  allocationScope,
  role
});

/**
 * 事業者別の実割当・役割。標準Bandレンジとは分離し、端点を確認できない地域はその事実を表示する。
 * 確認日: 2026-07-12。米国は市場別、中国は一部端点非公表、インドは22 LSA別。
 */
export const CARRIER_BAND_DETAILS: Readonly<Record<string, CarrierBandDetailSet>> = {
  "jp-docomo": {
    sourceLabel: "総務省 携帯電話・全国BWA電波利用評価",
    sourceUrl: "https://public-comment.e-gov.go.jp/pcm/download?seqNo=0000288495",
    bands: {
      B1: detail("UL 1940–1960 / DL 2130–2150 MHz", "全国4Gの基幹容量を担う2GHz帯。旧3G帯を4G・5Gへ移行しており、n1と同じ免許ブロックを共用する。"),
      B3: detail("UL 1765–1785 / DL 1860–1880 MHz（東名阪限定）", "東名阪の高トラヒック局へ重ねる増容量帯。全国割当ではなく、800MHz・2GHz基盤の混雑をオフロードする。", "regional"),
      B19: detail("UL 830–845 / DL 875–890 MHz", "人口カバー率99%超の800MHz広域基盤。郊外・屋内を含むエリア確保を担い、LTE-Mサービスもこの低帯LTE網を利用する。"),
      B21: detail("UL 1447.9–1462.9 / DL 1495.9–1510.9 MHz", "800MHz・2GHzでトラヒックが高い基地局へ追加する1.5GHz増容量帯。単独の全国カバレッジ層ではない。"),
      B28: detail("UL 718–728 / DL 773–783 MHz", "700MHzの到達性を使う4Gエリア層。n28と免許ブロックを共用し、LTE/NRの配分は局・地域で変わる。", "shared"),
      B42: detail("TDD 3440–3520 MHz", "3.4/3.5GHzを束ねた高トラヒック対策帯。低帯の面カバーではなく、需要地点のスループット向上を担う。"),
      n1: detail("UL 1940–1960 / DL 2130–2150 MHz内", "B1の既存2GHz免許を5Gへ移行・共用するエリア拡張帯。5G専用の追加割当ではない。", "shared"),
      n28: detail("UL 718–728 / DL 773–783 MHz内", "700MHzによる5Gカバレッジ層。B28と同一割当で、Sub6新規帯ほどの広帯域容量は担わない。", "shared"),
      n77: detail("TDD 3600–3700 MHz", "100MHz幅の5G専用Sub6で、面的5Gとトラヒック対策を担う主容量層。"),
      n78: detail("TDD 3440–3520 MHz内", "既存3.4/3.5GHzをB42からNRへ順次転用する増容量層。4G/5G配分には地域差がある。", "shared"),
      n79: detail("TDD 4500–4600 MHz", "ドコモ固有の100MHz幅4.5GHz帯。3.7GHzと組み合わせ、高速・大容量を担う。"),
      n257: detail("TDD 27400–27800 MHz", "400MHz幅の28GHz局所容量層。混雑地点へ重点展開し、面的カバレッジ用途ではない。")
    }
  },
  "jp-au": {
    sourceLabel: "総務省 携帯電話・全国BWA電波利用評価",
    sourceUrl: "https://public-comment.e-gov.go.jp/pcm/download?seqNo=0000288495",
    bands: {
      B1: detail("UL 1920–1940 / DL 2110–2130 MHz", "全国4Gのエリアと基幹容量を支える2GHz帯。旧3G終了後の帯域を4Gへ移行している。"),
      B3: detail("UL 1710–1730 / DL 1805–1825 MHz", "4G/5Gのエリアと容量を担う全国ミッドバンド。基地局数・カバー率とも拡張中の主要層。", "shared"),
      B11: detail("UL 1437.9–1447.9 / DL 1485.9–1495.9 MHz", "都心など高トラヒック地点へ選択的に重ねる1.5GHz増容量帯。"),
      B18: detail("UL 815–830 / DL 860–875 MHz", "人口カバー率99%超の800MHz広域基盤。屋内・郊外のエリア確保とIoT LTEの低帯カバレッジを担う。"),
      B28: detail("UL 728–738 / DL 783–793 MHz", "4G/5Gの700MHzカバレッジとトラヒック対策に使用。n28と免許ブロックを共用する。", "shared"),
      B41: detail("TDD 2595–2645 MHz（免許人UQ Communications）", "WiMAX 2+／高度化BWAの大容量層。KDDIグループの容量を担うが、免許人はUQである。", "shared"),
      B42: detail("TDD 3520–3560 MHz", "3.5GHzの4G/5Gトラヒック対策帯。高需要地点へ容量を追加する。", "shared"),
      n28: detail("UL 728–738 / DL 783–793 MHz内", "700MHzによる5Gエリア層。B28と共用し、LTE/NR配分は地域・基地局で変わる。", "shared"),
      n77: detail("TDD 3700–3800 / 4000–4100 MHz", "合計200MHzの5G増容量層。3.7GHzを基盤とし、4.0GHzは収容しきれない需要地点の追加容量を担う。"),
      n78: detail("TDD 3520–3560 MHz内", "B42の既存3.5GHzをNRへ転用・共用する増容量帯。全国一律の5G専用40MHzではない。", "shared"),
      n257: detail("TDD 27800–28200 MHz", "400MHz幅のスポット容量層。混雑地点や局所高速通信を担う。")
    }
  },
  "jp-softbank": {
    sourceLabel: "総務省 携帯電話・全国BWA電波利用評価",
    sourceUrl: "https://public-comment.e-gov.go.jp/pcm/download?seqNo=0000288495",
    bands: {
      B1: detail("UL 1960–1980 / DL 2150–2170 MHz", "全国4Gの2GHz基盤。3G終了後の移行を進め、n1との4G/5G共用にも使う。", "shared"),
      B3: detail("UL 1750–1765 / DL 1845–1860 MHz", "4G/5G双方の全国1.7GHzカバレッジ層。NR転用とNSA用LTE容量の配分を調整する。", "shared"),
      B8: detail("UL 900–915 / DL 945–960 MHz", "人口カバー率99%超の900MHz広域・屋内基盤。LTE-MおよびNB-IoTを提供する低帯層。"),
      B11: detail("UL 1427.9–1437.9 / DL 1475.9–1485.9 MHz", "人口カバー率約94%の1.5GHz中帯カバレッジ層。低帯を容量面から補う。"),
      B28: detail("UL 738–748 / DL 793–803 MHz", "700MHzの広域4G/5Gカバレッジ層。n28転用と共用する。", "shared"),
      B41: detail("TDD 2545–2575 MHz（免許人WCP）", "AXGP／高度化BWAの容量層。免許人はWireless City Planningで、5G利用は屋内中心。", "shared"),
      B42: detail("TDD 3400–3440 / 3560–3600 MHz", "3.4/3.5GHzの混雑対策帯。NR化時は4Gトラヒックを他Bandへオフロードする。", "shared"),
      n1: detail("UL 1960–1980 / DL 2150–2170 MHz内", "B1の2GHz免許を5Gへ転用・共用するエリア拡張帯。独立した追加割当ではない。", "shared"),
      n3: detail("UL 1750–1765 / DL 1845–1860 MHz内", "B3を用いる5Gエリア層。既存LTE資産を順次NRへ転用する。", "shared"),
      n28: detail("UL 738–748 / DL 793–803 MHz内", "700MHzの到達性で5Gエリアを広げる層。既存帯転用のため速度は4G相当の場合がある。", "shared"),
      n77: detail("TDD 3400–3440 / 3560–3600 / 3900–4000 MHz内", "3.9GHzの100MHz新規割当が高速5Gの中心。既存3.4/3.5GHzもNR化するが、衛星共用制約で地域差がある。", "regional"),
      n257: detail("TDD 29100–29500 MHz", "400MHz幅の局所容量層。大容量地点・産業用途向けで全国面カバー用ではない。")
    }
  },
  "jp-rakuten": {
    sourceLabel: "総務省 携帯電話・全国BWA電波利用評価",
    sourceUrl: "https://public-comment.e-gov.go.jp/pcm/download?seqNo=0000288495",
    bands: {
      B3: detail("全国 UL 1730–1750 / DL 1825–1845 MHz、東名阪外は UL 1765–1785 / DL 1860–1880 MHzも", "自社4G網の全国主力帯。東名阪外では追加20MHz×2を利用でき、保有幅に地域差がある。", "regional"),
      B28: detail("UL 715–718 / DL 770–773 MHz", "3MHz×2の700MHzプラチナバンド。1.7GHz網のカバレッジ穴を補うが、容量は他社の10MHz×2より小さい。"),
      n77: detail("TDD 3800–3900 MHz", "100MHz幅の5G Sub6主力。エリア基盤と容量を担うが、展開密度には地域差がある。"),
      n257: detail("TDD 27000–27400 MHz", "400MHz幅の局所容量層。基地局・対応端末・実利用が限定されるスポットBand。")
    }
  },
  "us-att": {
    sourceLabel: "FCC ULS / FirstNet Band 14",
    sourceUrl: "https://opendata.fcc.gov/Wireless/FCC-Universal-Licensing-System-ULS-/x28i-i4z4",
    bands: {
      B2: detail("B2内の市場・ブロック別FCC免許（全国固定端点なし）", "1900MHz PCSの容量層。市場別免許のためBand全域をAT&T割当として合算しない。", "regional"),
      B4: detail("B4内の市場・ブロック別FCC免許", "AWS-1容量層。B66に包含されるためB4/B66を別資産として単純加算しない。", "regional"),
      B5: detail("B5内の市場・ブロック別FCC免許", "850MHzの広域・屋内層。n5と同じ低帯資産をLTE/NRで配分する。", "regional"),
      B12: detail("B12内の市場・ブロック別FCC免許", "Lower 700MHzの広域・屋内層。保有ブロックは市場ごとに異なる。", "regional"),
      B14: detail("UL 788–798 / DL 758–768 MHz（FirstNet全国免許）", "公共安全専用10×10MHz帯。緊急時は公共安全が常時優先され、商用通信はプリエンプション対象になる。"),
      B30: detail("UL 2305–2315 / DL 2350–2360 MHz（WCS A/B）", "AT&Tが全免許を保有する容量補完帯。ただし免許地域内でも一様運用ではない。", "regional"),
      B66: detail("B66内の市場・ブロック別FCC免許", "AWS拡張容量層でB4を内包。市場別保有のため全国共通端点はない。", "regional"),
      n5: detail("n5内の市場別850MHz免許", "低帯5Gのカバレッジ層。n77とのCAで広域性と容量を組み合わせる。", "regional"),
      n77: detail("3.45GHz帯とC-bandの市場別・非連続免許", "5G+の中帯容量層。3.45GHzとC-bandは別免許で、単一連続レンジではない。", "regional"),
      n260: detail("n260内の地理別FCC免許", "空港・スタジアム等の限定地点向け高帯5G+。面的カバレッジではなく局所超容量を担う。", "regional")
    }
  },
  "us-verizon": {
    sourceLabel: "FCC ULS / Verizon C-band",
    sourceUrl: "https://opendata.fcc.gov/Wireless/FCC-Universal-Licensing-System-ULS-/x28i-i4z4",
    bands: {
      B13: detail("UL 777–787 / DL 746–756 MHz（9 REAG）", "Upper 700MHz C BlockのLTE広域基盤。米本土48州等を覆うが、全米領土一律ではない。", "regional"),
      B4: detail("B4内の市場別AWS-1免許", "AWS-1のLTE容量層。市場ごとに保有ブロックが異なる。", "regional"),
      B48: detail("TDD 3550–3700 MHzの郡別PAL／共有GAA", "CBRSの企業・構内ネットワーク補完。帯域全体は共有枠で、Verizon専有ではない。", "shared"),
      n77: detail("C-band 3700–3980 MHz内のPEA別免許（平均161MHz、最大200MHz）", "Ultra Widebandの面的容量・FWA中核。具体ブロックは市場別。", "regional"),
      n260: detail("n260内の地理別FCC免許", "高密度都市・繁忙会場へ限定展開する短距離の超容量層。面的カバレッジは担わない。", "regional"),
      n261: detail("n261内の地理別FCC免許", "28GHzの局所超容量層。Band全域が全国割当ではない。", "regional")
    }
  },
  "us-tmobile": {
    sourceLabel: "FCC ULS / T-Mobile network bands",
    sourceUrl: "https://www.t-mobile.com/support/coverage/t-mobile-network",
    bands: {
      B12: detail("B12内の市場別Lower 700MHz免許", "Extended Range LTEの広域・屋内補完。", "regional"),
      B71: detail("B71内の600MHz PEA別免許", "Extended Range LTEの全国カバレッジ基盤。n71と低帯資産を共用する。", "regional"),
      B66: detail("B66内の市場別AWS免許", "AWSのLTE容量層。全国共通の連続割当ではない。", "regional"),
      n71: detail("n71内の600MHz PEA別免許", "Extended Range 5Gの低帯基盤。都市・農村・屋内外の到達性を担う。", "regional"),
      n41: detail("TDD 2496–2690 MHz内の地域別BRS/EBS権利・リース", "Ultra Capacity 5Gの2.5GHz主力。速度と到達範囲の均衡を担い、実利用幅は地域別。", "regional"),
      n25: detail("n25内の市場別PCS免許", "1900MHz Ultra Capacityの補完層。全国一律の連続端点はない。", "regional"),
      n260: detail("n260内の地理別FCC免許", "mmWaveの極小エリア向け超容量層。", "regional"),
      n261: detail("n261内の地理別FCC免許", "28GHz mmWaveの局所Ultra Capacity層。", "regional")
    }
  },
  "de-telekom": {
    sourceLabel: "Bundesnetzagentur 周波数割当一覧（2026-01-29）",
    sourceUrl: "https://www.bundesnetzagentur.de/SharedDocs/Downloads/DE/Sachgebiete/Telekommunikation/Unternehmen_Institutionen/Frequenzen/OffentlicheNetze/Mobilfunk/DrahtloserNetzzugang/UebersichtFrequenzbereiche.pdf?__blob=publicationFile&v=1",
    bands: {
      B20: detail("UL 811–821 / DL 852–862 MHz", "800MHzの広域・屋内基盤。LTE-Mもこの低帯で提供する。"),
      B8: detail("UL 900–915 / DL 945–960 MHz", "900MHzの広域・屋内基盤。NB-IoTの現行利用帯。"),
      B3: detail("UL 1710–1740 / DL 1805–1835 MHz", "1800MHzの高レート主力。LTE-Mもこの帯で提供する。"),
      B1: detail("UL 1960–1980 / DL 2150–2170 MHz", "2100MHzは2026年にDSSを終了しn1へ専用化。旧LTE表示は移行履歴として扱う。", "shared"),
      B7: detail("UL 2520–2540 / DL 2640–2660 MHz", "2600MHzの追加容量層。低帯の面的カバレッジを需要地点で補う。"),
      n28: detail("UL 713–723 / DL 768–778 MHz", "700MHz 5Gの農村・屋内カバレッジ層。大セルで面的な穴を埋める。"),
      n1: detail("UL 1960–1980 / DL 2150–2170 MHz", "DSS終了後の2100MHz 5G専用層。容量と安定性を強化する。"),
      n78: detail("TDD 3610–3700 MHz", "3.6GHzの高容量層。交通結節点など高需要地点へ重点配置する。")
    }
  },
  "de-vodafone": {
    sourceLabel: "Bundesnetzagentur 周波数割当一覧（2026-01-29）",
    sourceUrl: "https://www.bundesnetzagentur.de/SharedDocs/Downloads/DE/Sachgebiete/Telekommunikation/Unternehmen_Institutionen/Frequenzen/OffentlicheNetze/Mobilfunk/DrahtloserNetzzugang/UebersichtFrequenzbereiche.pdf?__blob=publicationFile&v=1",
    bands: {
      B20: detail("UL 801–811 / DL 842–852 MHz", "800MHzの広域・屋内基盤。農村を大セルで覆う低帯層。"),
      B8: detail("UL 890–900 / DL 935–945 MHz", "900MHzの広域・屋内補完。LPWA対応にも使う低帯層。"),
      B3: detail("UL 1760–1785 / DL 1855–1880 MHz", "1800MHzの都市容量層。n3と免許ブロックを共用する。", "shared"),
      B1: detail("UL 1920–1940 / DL 2110–2130 MHz", "2100MHzの4G容量層。都市部で低帯を補完する。"),
      B7: detail("UL 2500–2520 / DL 2620–2640 MHz", "2600MHzの高需要地点向け容量層。"),
      n28: detail("UL 723–733 / DL 778–788 MHz", "700MHz低帯5G。農村・屋内を大セルで面的に覆う。"),
      n3: detail("UL 1760–1785 / DL 1855–1880 MHz", "1800MHz中帯5G。都市を面的に覆い、速度と到達距離を両立する。", "shared"),
      n78: detail("TDD 3400–3490 MHz", "3.5GHz高容量5G。都心・スタジアム・産業拠点など高需要地点を担う。")
    }
  },
  "fr-orange": {
    sourceLabel: "ARCEP 周波数資産一覧（2026-02-09）",
    sourceUrl: "https://www.arcep.fr/la-regulation/grands-dossiers-reseaux-mobiles/la-couverture-mobile-en-metropole/le-patrimoine-de-frequences-des-operateurs-mobiles.html",
    bands: {
      B28: detail("UL 708–718 / DL 763–773 MHz", "700MHz低帯4Gの広域補完。n28では5G+の3.5GHz CA補助にも使う。", "shared"),
      B20: detail("UL 811–821 / DL 852–862 MHz", "800MHzの広域・屋内基盤。LTE-M専用運用は人口99%超をカバーする。"),
      B3: detail("UL 1710–1730 / DL 1805–1825 MHz", "1800MHzの4G容量層。複数帯CAで5G体感も支える。"),
      B1: detail("UL 1964.9–1974.9 / DL 2154.9–2164.9 MHz", "2100MHzの4G容量層。n1の地方5Gと免許資産を共用する。", "shared"),
      B7: detail("UL 2515–2535 / DL 2635–2655 MHz", "2600MHzの都市4G容量層。密集地で低帯を補う。"),
      n28: detail("UL 708–718 / DL 763–773 MHz", "700MHzを5G+時のn78とのCA補助に使い、カバレッジを補完する。", "shared"),
      n1: detail("UL 1964.9–1974.9 / DL 2154.9–2164.9 MHz", "2100MHzの地方・広域5G補完。3.5GHzより広い地域を覆う。", "shared"),
      n78: detail("TDD 3710–3800 MHz", "3.5GHzの5G中核・高容量層。密集地の混雑緩和と高スループットを担う。")
    }
  },
  "cn-mobile": {
    sourceLabel: "中国MIIT 事業者別周波数許可（2024-04基準）",
    sourceUrl: "https://wap.miit.gov.cn/jgsj/wgj/kpzs/art/2021/art_9105abf8095d49bd9065c1b6ebb06d2a.html",
    bands: {
      B8: detail("900MHz FDD LTE（事業者別免許端点は非公表）", "既存FDD LTE層。MIIT資料から広域主力などの優先度までは断定しない。", "unpublished"),
      B3: detail("1700/1800MHz FDD LTE（端点非公表）", "既存FDD LTE容量層。事業者別の連続端点は公開されていない。", "unpublished"),
      B39: detail("1900MHz TDD LTE（端点非公表）", "既存TDD LTE層。Band標準全域を中国移動の割当として表示しない。", "unpublished"),
      B40: detail("2300MHz TDD LTE（端点非公表）", "既存TDD LTE層。具体的な免許幅は公開一次表で確認できない。", "unpublished"),
      B41: detail("2600MHz TDD LTE（端点非公表）", "2.6GHzのLTE容量層。n41への5G移行・共有と同じ資産を使う。", "unpublished"),
      n41: detail("2.6GHz 5G（端点非公表）", "5Gの主容量層。中国広電にも有償共有され、700MHz共同網を容量面から補う。", "shared"),
      n79: detail("4.9GHz 5G（端点非公表）", "産業用途・需要地点の精密増強層。全国一様な面カバーとは断定しない。", "unpublished"),
      n28: detail("中国広電700MHz免許の共同網（移動単独割当ではない）", "全国低帯5Gのカバレッジ層。中国広電と共同投資・共同所有する。", "shared")
    }
  },
  "cn-telecom": {
    sourceLabel: "中国MIIT 事業者別周波数許可（2024-04基準）",
    sourceUrl: "https://wap.miit.gov.cn/jgsj/wgj/kpzs/art/2021/art_9105abf8095d49bd9065c1b6ebb06d2a.html",
    bands: {
      B5: detail("850MHz FDD LTE（端点非公表）", "低帯LTEのカバレッジ層。NB-IoTサービスにも使う既存網。", "unpublished"),
      B3: detail("1700/1800MHz FDD LTE（端点非公表）", "1800MHzのLTE容量層。低帯のカバレッジ網へトラヒック容量を重ねる。", "unpublished"),
      B1: detail("1900/2100MHz FDD LTE（端点非公表）", "2100MHzの既存LTE容量層。5G再耕に使う既存免許資産でもある。", "unpublished"),
      n5: detail("850MHz既存帯5G（端点非公表）", "低帯の5G再耕層。農村・屋内のカバレッジを補う。", "unpublished"),
      n78: detail("3.5GHz 5G（聯通と共同網、個別端点は非公表）", "中国聯通と全国一つのアクセス網を地域分担で共同構築する主容量層。", "shared")
    }
  },
  "cn-unicom": {
    sourceLabel: "中国MIIT 事業者別周波数許可（2024-04基準）",
    sourceUrl: "https://wap.miit.gov.cn/jgsj/wgj/kpzs/art/2021/art_9105abf8095d49bd9065c1b6ebb06d2a.html",
    bands: {
      B8: detail("900MHz FDD LTE（端点非公表）", "低帯LTEのカバレッジ層。n8への5G再耕資産でもある。", "unpublished"),
      B3: detail("1700/1800MHz FDD LTE（端点非公表）", "1800MHzのLTE容量層。低帯の面的網へ都市部のトラヒック容量を追加する。", "unpublished"),
      B1: detail("1900/2100MHz FDD LTE（端点非公表）", "2100MHzのLTE容量層。n1と共用・再耕する。", "unpublished"),
      B40: detail("2300MHz TDD LTE（端点非公表）", "2300MHzのTDD LTE容量層。下り需要が大きい地点の容量を時分割で補う。", "unpublished"),
      n8: detail("900MHz既存帯5G（端点非公表）", "低帯5Gのカバレッジ層。既存900MHz資産を再耕する。", "unpublished"),
      n1: detail("2100MHz既存帯5G（端点非公表）", "2100MHzのLTE/NR共用層。", "shared"),
      n78: detail("3.5GHz 5G（電信と共同網、個別端点は非公表）", "中国電信と周波数を共有し、地域分担で共同構築する主容量層。", "shared")
    }
  },
  "kr-skt": {
    sourceLabel: "韓国MSIT 5G競売・再割当資料",
    sourceUrl: "https://www.korea.kr/briefing/stateCouncilView.do?newsId=156275478",
    bands: {
      B5: detail("事業者別端点未確認（MSIT再割当対象）", "850MHzの既存LTE層。現行端点は公開一次資料で確認できない。", "unpublished"),
      B3: detail("事業者別端点未確認（MSIT再割当対象）", "1800MHzの既存LTE容量層。", "unpublished"),
      B1: detail("事業者別端点未確認（MSIT再割当対象）", "2100MHzの既存LTE容量層。", "unpublished"),
      B7: detail("事業者別端点未確認（MSIT再割当対象）", "2600MHzの既存LTE容量層。", "unpublished"),
      n78: detail("TDD 3600–3700 MHz", "全国5Gの3.5GHz主容量帯。MSITの履行評価基準を充足している。"),
      n257: detail("旧 TDD 28100–28900 MHz、2023-05-31免許取消", "旧ホットスポット超容量候補だったが構築条件未達で取消。現在の実割当ではない。", "revoked")
    }
  },
  "kr-kt": {
    sourceLabel: "韓国MSIT 5G競売・再割当資料",
    sourceUrl: "https://www.korea.kr/briefing/stateCouncilView.do?newsId=156275478",
    bands: {
      B8: detail("事業者別端点未確認（MSIT再割当対象）", "900MHzの既存LTEカバレッジ層。", "unpublished"),
      B3: detail("事業者別端点未確認（MSIT再割当対象）", "1800MHzの既存LTE容量層。", "unpublished"),
      B1: detail("事業者別端点未確認（MSIT再割当対象）", "2100MHzの既存LTE容量層。", "unpublished"),
      B26: detail("事業者別端点未確認（MSIT再割当対象）", "保有するが商業LTEは非稼働（公共安全専用のみ）。", "revoked"),
      n78: detail("TDD 3500–3600 MHz", "全国5Gの3.5GHz主容量帯。MSITの履行評価基準を充足している。"),
      n257: detail("旧 TDD 26500–27300 MHz、2022-12-23免許取消", "旧28GHz超容量候補だったが構築条件未達で取消。現在の実割当ではない。", "revoked")
    }
  },
  "kr-lgu": {
    sourceLabel: "韓国MSIT 5G競売・再割当資料",
    sourceUrl: "https://www.korea.kr/briefing/stateCouncilView.do?newsId=156275478",
    bands: {
      B5: detail("事業者別端点未確認（MSIT再割当対象）", "850MHzのLTE/NB-IoTカバレッジ層。", "unpublished"),
      B3: detail("事業者別端点未確認（MSIT再割当対象）", "商業非稼働（LG U+はB3不使用）。", "revoked"),
      B1: detail("事業者別端点未確認（MSIT再割当対象）", "2100MHzの既存LTE容量層。", "unpublished"),
      B7: detail("事業者別端点未確認（MSIT再割当対象）", "2600MHzの既存LTE容量層。", "unpublished"),
      n78: detail("TDD 3420–3500 MHz", "全国5Gの3.5GHz主容量帯。追加20MHzの最終取得は未確認のため80MHzだけを表示する。"),
      n257: detail("旧 TDD 27300–28100 MHz、2022-12-23免許取消", "旧28GHz超容量候補だったが構築条件未達で取消。現在の実割当ではない。", "revoked")
    }
  },
  "in-jio": {
    sourceLabel: "Jio True 5G / DoT LSA割当",
    sourceUrl: "https://www.jio.com/help/faq/mobile/jio-true-5g/about-5g/what-are-the-bands-on-which-jio-5g-is-available.html",
    bands: {
      B5: detail("22 LSA別の800MHz免許（全国固定端点なし）", "850MHz系の4Gカバレッジ層。保有ブロックはサービスエリアごとに異なる。", "regional"),
      B3: detail("22 LSA別の1800MHz免許（全国固定端点なし）", "1800MHzの4G容量層。LSAごとに保有幅が異なる。", "regional"),
      B40: detail("22 LSA別の2300MHz TDD免許（全国固定端点なし）", "2300MHzの4G容量層。全国一律の連続割当ではない。", "regional"),
      n28: detail("22 LSA別の700MHz免許", "700MHzの5G面的カバレッジ層。具体ブロックはDoT assignment letter単位。", "regional"),
      n78: detail("22 LSA別の3300MHz帯免許", "3.5GHzの5G主容量層。広い帯域でSA網のスループットを担う。", "regional"),
      n258: detail("22 LSA別の26GHz免許", "企業・FWA・限定エリアの超広帯域容量層。", "regional")
    }
  },
  "in-airtel": {
    sourceLabel: "Airtel 2022 spectrum acquisition",
    sourceUrl: "https://www.airtel.in/press-release/08-2022/airtel-set-to-lead-indias-5g-revolution/",
    bands: {
      B8: detail("22 LSA別の900MHz免許", "低帯カバレッジ層。屋内・農村を補強し、保有幅はLSAごとに異なる。", "regional"),
      B3: detail("22 LSA別の1800MHz免許", "ミッドバンドの4G容量・体感品質層。", "regional"),
      B1: detail("22 LSA別の2100MHz免許", "2100MHzの4G容量層。取得・保有幅はLSA別。", "regional"),
      B40: detail("22 LSA別の2300MHz TDD免許", "4Gの容量増強用TDD層。下りトラヒックが多い地域でミッドバンド容量を補う。", "regional"),
      n8: detail("現行NR実割当端点未確認", "900MHz NR商用運用の一次根拠が不足しているため、候補帯としてのみ扱う。", "unpublished"),
      n3: detail("現行NR実割当端点未確認", "1800MHz再耕候補。現行NR運用を確認できるまでは容量へ算入しない。", "unpublished"),
      n1: detail("現行NR実割当端点未確認", "2100MHz再耕候補。現行NR運用は未確認。", "unpublished"),
      n78: detail("全22 LSAで各100MHz幅（具体端点はLSA別）", "Airtel 5Gの主容量層。全サービスエリアで100MHz幅を取得している。", "regional"),
      n258: detail("全22 LSAで各800MHz幅（具体端点はLSA別）", "26GHzの超広帯域容量層。企業・FWAなど需要地点を担う。", "regional")
    }
  }
};

export function carrierBandDetail(profileId: string, band: string): CarrierBandDetail | undefined {
  return CARRIER_BAND_DETAILS[profileId]?.bands[band];
}
