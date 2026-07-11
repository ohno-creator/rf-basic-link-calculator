/**
 * Band 地図 v3 の国・事業者別データ。
 *
 * standardRange は 3GPP の Band 全体、deployment は事業者での利用状況を表す。
 * 事業者が Band 全域を保有・全国利用している意味ではない。確認日: 2026-07-12。
 */

export type WorldRegion = "japan" | "north-america" | "europe" | "china" | "korea" | "india";
export type DeploymentStatus = "confirmed-current" | "confirmed-historical" | "unverified-current" | "revoked";
export type IotTechnology = "LTE-M" | "NB-IoT";

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
    bands: [d("B1", "2GHz基幹", { iot: ["LTE-M"] }), d("B3", "1.7GHz容量"), d("B8", "900MHz広域・屋内", { iot: ["LTE-M"] }), d("B11", "1.5GHz補完"), d("B28", "700MHz広域"), d("B41", "AXGP容量"), d("B42", "3.5GHz容量"), d("n1", "既存帯5G"), d("n3", "既存帯5G"), d("n28", "面的5G"), d("n77", "Sub6"), d("n257", "28GHz局所")],
    iotSummary: "LTE-Mは現行提供を確認。NB-IoTは2018年開始実績あり、2026年の現行提供は未確認。", sourceLabel: "SoftBank IoT 1NCE", sourceUrl: "https://www.softbank.jp/business/service/iot/1nce/"
  },
  {
    id: "jp-rakuten", region: "japan", country: "日本", carrier: "楽天モバイル", checkedAt,
    bands: [d("B3", "全国マクロ主力"), d("B28", "700MHz補完・2024年商用開始"), d("n77", "3.7GHz Sub6"), d("n257", "28GHz局所")],
    iotSummary: "LTE-M/NB-IoTはテスト利用段階。商用開始時期は別途案内。", sourceLabel: "楽天モバイル 700MHz商用開始", sourceUrl: "https://corp.mobile.rakuten.co.jp/english/news/press/2024/0627_02/"
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
    bands: [d("B8", "900MHz広域"), d("B3", "1800MHz"), d("B1", "2100MHz"), d("B40", "2300MHz"), d("n8", "900MHz 5G再耕"), d("n1", "2100MHz 5G再耕"), d("n78", "3.5GHz・電信と共同")],
    iotSummary: "IoT接続規模は確認済み。NB-IoT/LTE-Mの現行提供は未確認。", sourceLabel: "China Unicom 2024 annual report", sourceUrl: "https://ar2024.chinaunicom.com.hk/English/business-overview.html"
  },
  {
    id: "kr-skt", region: "korea", country: "韓国", carrier: "SK Telecom", checkedAt,
    bands: [d("B5", "850MHz", { status: "unverified-current" }), d("B3", "1800MHz", { status: "unverified-current" }), d("B1", "2100MHz", { status: "unverified-current" }), d("B7", "2600MHz", { status: "unverified-current" }), d("n78", "3.6–3.7GHz 5G"), d("n257", "旧28GHz・免許取消", { status: "revoked" })],
    iotSummary: "LTE-Mは2017年導入実績あり、2026年の新規提供は未確認。NB-IoT未確認。", sourceLabel: "韓国政府 SKT 28GHz取消", sourceUrl: "https://www.korea.kr/briefing/pressReleaseView.do?newsId=156572781"
  },
  {
    id: "kr-kt", region: "korea", country: "韓国", carrier: "KT", checkedAt,
    bands: [d("B8", "900MHz", { status: "unverified-current" }), d("B3", "1800MHz", { status: "unverified-current" }), d("B1", "2100MHz", { status: "unverified-current" }), d("B26", "800MHz", { status: "unverified-current" }), d("n78", "3.5–3.6GHz 5G"), d("n257", "旧28GHz・免許取消", { status: "revoked" })],
    iotSummary: "NB-IoTの料金・モジュール提供を2024資料で確認。LTE-Mは未確認。", sourceLabel: "韓国政府 KT/LG U+ 28GHz取消", sourceUrl: "https://www.korea.kr/news/policyNewsView.do?newsId=148909781"
  },
  {
    id: "kr-lgu", region: "korea", country: "韓国", carrier: "LG U+", checkedAt,
    bands: [d("B5", "850MHz", { iot: ["NB-IoT"], status: "confirmed-current" }), d("B3", "1800MHz", { status: "unverified-current" }), d("B1", "2100MHz", { status: "unverified-current" }), d("B7", "2600MHz", { status: "unverified-current" }), d("n78", "3.42–3.5GHz 5G"), d("n257", "旧28GHz・免許取消", { status: "revoked" })],
    iotSummary: "NB-IoTは現行大規模利用を確認。LTE-Mは導入実績あり、現行提供は要確認。", sourceLabel: "LG U+ NB-IoT", sourceUrl: "https://www.lguplus.com/about/en/corporation/promotion/press-kit/detail?atclNo=2000001510&pageNo=1&srchCond=titCon"
  },
  {
    id: "in-jio", region: "india", country: "インド", carrier: "Reliance Jio", checkedAt,
    bands: [d("B5", "850MHz"), d("B3", "1800MHz"), d("B40", "2300MHz"), d("n28", "700MHz広域"), d("n78", "3.5GHz容量主力"), d("n258", "26GHz企業/FWA")],
    iotSummary: "製品はNB-IoT/LTE-M対応。公衆網での全国商用提供状態は未確認。", sourceLabel: "Jio True 5G bands", sourceUrl: "https://www.jio.com/help/faq/mobile/jio-true-5g/about-5g/what-are-the-bands-on-which-jio-5g-is-available.html",
    allocationNote: "4G実割当はLSA（サービスエリア）ごとに異なる。"
  },
  {
    id: "in-airtel", region: "india", country: "インド", carrier: "Bharti Airtel", checkedAt,
    bands: [d("B8", "900MHz"), d("B3", "1800MHz"), d("B1", "2100MHz"), d("B40", "2300MHz"), d("n8", "低帯5G"), d("n3", "1800MHz再耕"), d("n1", "2100MHz再耕"), d("n78", "3.5GHz容量主力"), d("n258", "26GHz容量")],
    iotSummary: "NB-IoTを商用展開。現行IoT商品はNB-IoT/LTE-M双方を掲載。", sourceLabel: "Airtel IoT connectivity", sourceUrl: "https://www.airtel.in/b2b/iot-connectivity/",
    allocationNote: "4G実割当はLSA（サービスエリア）ごとに異なる。"
  }
];
