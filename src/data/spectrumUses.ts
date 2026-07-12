export type SpectrumRegion = "japan" | "usa" | "china" | "europe" | "southeast-asia" | "oceania" | "africa" | "india" | "others";
export type SpectrumUseCategory = "wifi-unlicensed" | "lpwa-ism" | "broadcast" | "satellite" | "radar-weather" | "v2x-its" | "public-safety" | "amateur" | "fixed-links";
export type SpectrumEntryStatus = "confirmed-current" | "unverified-current" | "planned" | "sunsetting";
export type SharingInfo = { partners: string[]; mechanism: "dynamic" | "geographic" | "time" | "carrier-sense" | "coordination" | "dfs"; note: string };
export type RefarmingInfo = { status: "planned" | "in-progress" | "completed"; timeline: string; note: string };
export type SpectrumEntry = { id: string; region: SpectrumRegion; bandLabel: string; rangeMHz: { low: number; high: number }; category: SpectrumUseCategory; useSummary: string; iotRelevance: string; sharing?: SharingInfo; refarming?: RefarmingInfo; status: SpectrumEntryStatus; sourceLabel: string; sourceUrl: string; checkedAt: "2026-07" };
export type ActionPlanItem = { title: string; summary: string; timeline: string; relatedBands: string[] };
export type WgActivity = { wgName: string; parentBody: string; scope: string; recentOutput: string; sourceLabel: string; sourceUrl: string; checkedAt: "2026-07" };

const MIC = "https://www.tele.soumu.go.jp/j/adm/freq/search/myuse/summary/";
const FCC = "https://www.fcc.gov/engineering-technology/policy-and-rules-division/general/radio-spectrum-allocation";
const ETSI = "https://www.etsi.org/deliver/etsi_en/300200_300299/30022001/";
const ITU = "https://www.itu.int/pub/R-REG-RR";
const ACMA = "https://www.acma.gov.au/licence-exempt-transmitters";
const INDIA = "https://dot.gov.in/spectrum-management/2469";
const MIIT = "https://www.miit.gov.cn/";
const checkedAt = "2026-07" as const;
const e = (id:string,region:SpectrumRegion,bandLabel:string,low:number,high:number,category:SpectrumUseCategory,useSummary:string,sourceUrl:string,status:SpectrumEntryStatus="confirmed-current",extra:Partial<SpectrumEntry>={}):SpectrumEntry => ({id,region,bandLabel,rangeMHz:{low,high},category,useSummary,iotRelevance:"地域ごとの制度・出力・占有時間条件を確認して無線方式を選定する。",status,sourceLabel:region==="japan"?"総務省 周波数利用状況":region==="usa"?"FCC spectrum allocation":region==="europe"?"ETSI/European spectrum rules":"各地域規制当局・ITU資料",sourceUrl,checkedAt,...extra});

export const SPECTRUM_ENTRIES: readonly SpectrumEntry[] = [
  e("jp-nfc","japan","13.56MHz NFC",13.553,13.567,"lpwa-ism","NFC・RFIDなど近距離誘導結合。",MIC),
  e("jp-fm","japan","FM・ワイドFM",76,95,"broadcast","FM放送とAM補完放送。",MIC,"confirmed-current",{refarming:{status:"in-progress",timeline:"AM局の運用見直しが進行",note:"AM放送のFM転換・補完を地域ごとに検討。"}}),
  e("jp-air","japan","航空無線",108,137,"public-safety","航空航法・航空移動業務。",MIC),
  e("jp-vhf-public","japan","VHF公共業務",150,170,"public-safety","防災・公共業務のVHF帯。",MIC,"unverified-current"),
  e("jp-dtv","japan","地上デジタルテレビ",470,710,"broadcast","UHFテレビ放送。",MIC,"confirmed-current",{refarming:{status:"completed",timeline:"地デジ移行後",note:"700MHz帯を放送から移動通信等へ再編。"}}),
  e("jp-430-amateur","japan","430MHzアマチュア",430,440,"amateur","アマチュア無線と一部業務の共用帯。",MIC),
  e("jp-760-its","japan","760MHz ITS Connect",755.5,764.5,"v2x-its","車車間・路車間安全運転支援。",MIC),
  e("jp-920","japan","920MHz LPWA",920.5,928.1,"lpwa-ism","特定小電力LPWA・RFID。",MIC,"confirmed-current",{sharing:{partners:["他の特定小電力局","RFID"],mechanism:"carrier-sense",note:"チャネル・送信時間等の条件とキャリアセンスで共存する。"}}),
  e("jp-1200-amateur","japan","1200MHzアマチュア",1260,1300,"amateur","アマチュア無線と他業務の共用。",MIC,"unverified-current"),
  e("jp-gnss-l1","japan","GNSS L1・みちびき",1559,1610,"satellite","GPS・QZSS等の測位信号。",MIC),
  e("jp-23-dss","japan","2.3GHzダイナミック共用",2330,2370,"fixed-links","放送事業用等と移動通信が場所・時間で共用。",MIC,"confirmed-current",{sharing:{partners:["放送事業用","移動通信"],mechanism:"dynamic",note:"場所・時間を管理する国内初の動的周波数共用例。"}}),
  e("jp-24-ism","japan","2.4GHz ISM/Wi-Fi",2400,2483.5,"wifi-unlicensed","Wi-Fi・Bluetooth・ISM機器。",MIC),
  e("jp-5-w52","japan","5GHz W52/W53/W56",5150,5730,"wifi-unlicensed","無線LAN。W53/W56はレーダー保護条件を伴う。",MIC,"confirmed-current",{sharing:{partners:["気象・航空レーダー"],mechanism:"dfs",note:"レーダー波を検出するとチャネルを移動するDFSで共用。"}}),
  e("jp-58-etc","japan","5.8GHz ETC",5770,5850,"v2x-its","料金所・路車間通信。",MIC),
  e("jp-59-v2x","japan","5.9GHz V2X",5895,5925,"v2x-its","次世代V2X向け30MHz幅の割当を調整。",MIC,"planned",{refarming:{status:"planned",timeline:"令和7年度版アクションプラン",note:"V2X通信向け制度整備を検討。"}}),
  e("jp-6-wifi","japan","6GHz Wi-Fi",5925,6425,"wifi-unlicensed","LPI等の6GHz無線LAN。",MIC,"confirmed-current",{sharing:{partners:["固定・衛星等既存業務"],mechanism:"coordination",note:"屋内低電力等の条件で既存業務を保護。"}}),
  e("jp-65-wifi-plan","japan","上部6GHz拡張",6425,7125,"wifi-unlicensed","SP屋外利用と上部6GHz拡張の共用条件を検討。",MIC,"planned",{refarming:{status:"planned",timeline:"令和7年度中目途",note:"技術的条件を取りまとめ予定。"}}),
  e("jp-bs","japan","BS/CS衛星放送",11710,12750,"broadcast","衛星放送のKu帯。",MIC,"unverified-current"),
  e("jp-23-fixed","japan","23GHz固定回線",21700,23700,"fixed-links","固定マイクロ波・素材伝送。",MIC,"unverified-current"),
  e("jp-26-auction","japan","26GHz 5Gオークション",25250,27000,"fixed-links","条件付オークションによる割当準備。",MIC,"planned",{refarming:{status:"planned",timeline:"令和7年度内目途",note:"技術基準・オークション指針を整備。"}}),

  e("us-fm","usa","FM broadcast",88,108,"broadcast","FM broadcasting.",FCC), e("us-433","usa","433MHz ISM",433.05,434.79,"lpwa-ism","Part 15 short-range devices.",FCC,"unverified-current"), e("us-915","usa","902-928MHz ISM",902,928,"lpwa-ism","LoRaWAN/AU915-family and ISM devices.",FCC), e("us-24","usa","2.4GHz ISM",2400,2483.5,"wifi-unlicensed","Wi-Fi/Bluetooth.",FCC), e("us-cbrs","usa","3.5GHz CBRS",3550,3700,"public-safety","Three-tier shared access with federal incumbents.",FCC), e("us-59","usa","5.9GHz C-V2X",5895,5925,"v2x-its","C-V2X allocation.",FCC), e("us-6","usa","6GHz unlicensed",5925,7125,"wifi-unlicensed","1200MHz unlicensed allocation.",FCC), e("us-amateur","usa","70cm amateur",420,450,"amateur","Amateur allocation.",FCC),
  e("eu-fm","europe","FM broadcast",87.5,108,"broadcast","FM broadcasting.",ETSI), e("eu-433","europe","433MHz SRD",433.05,434.79,"lpwa-ism","Short-range devices.",ETSI), e("eu-868","europe","863-868MHz SRD",863,868,"lpwa-ism","LoRaWAN EU868 and SRD.",ETSI), e("eu-24","europe","2.4GHz ISM",2400,2483.5,"wifi-unlicensed","Wi-Fi/Bluetooth.",ETSI), e("eu-5","europe","5GHz RLAN",5150,5725,"wifi-unlicensed","RLAN with DFS portions.",ETSI), e("eu-59","europe","5.9GHz ITS-G5",5875,5925,"v2x-its","Cooperative ITS.",ETSI), e("eu-6","europe","6GHz lower RLAN",5945,6425,"wifi-unlicensed","Lower 6GHz RLAN.",ETSI), e("eu-amateur","europe","70cm amateur",430,440,"amateur","Amateur service.",ITU),
  e("cn-fm","china","FM broadcast",87,108,"broadcast","FM broadcasting.",MIIT,"unverified-current"), e("cn-470-lpwa","china","470-510MHz LPWA",470,510,"lpwa-ism","Metering/LPWA uses.",MIIT,"unverified-current"), e("cn-24","china","2.4GHz ISM",2400,2483.5,"wifi-unlicensed","Wi-Fi/Bluetooth.",MIIT,"unverified-current"), e("cn-5","china","5GHz WLAN",5150,5850,"wifi-unlicensed","WLAN portions.",MIIT,"unverified-current"), e("cn-beidou","china","BeiDou B1",1559,1591,"satellite","BeiDou navigation.",MIIT,"unverified-current"), e("cn-amateur","china","70cm amateur",430,440,"amateur","Amateur service.",MIIT,"unverified-current"), e("cn-radar","china","5GHz radar",5250,5850,"radar-weather","Radar systems sharing 5GHz.",MIIT,"unverified-current"), e("cn-fixed","china","Ku fixed satellite",10700,12750,"satellite","Satellite links.",MIIT,"unverified-current"),
  e("in-fm","india","FM broadcast",88,108,"broadcast","FM broadcasting.",INDIA,"unverified-current"), e("in-433","india","433MHz SRD",433.05,434.79,"lpwa-ism","Short-range devices.",INDIA,"unverified-current"), e("in-866","india","865-867MHz",865,867,"lpwa-ism","LoRaWAN IN865.",INDIA), e("in-24","india","2.4GHz ISM",2400,2483.5,"wifi-unlicensed","Wi-Fi/Bluetooth.",INDIA), e("in-5","india","5GHz WLAN",5150,5875,"wifi-unlicensed","WLAN portions.",INDIA,"unverified-current"), e("in-navic","india","NavIC L5",1164,1189,"satellite","NavIC navigation.",INDIA), e("in-amateur","india","70cm amateur",430,440,"amateur","Amateur service.",INDIA,"unverified-current"), e("in-59","india","5.9GHz ITS",5850,5925,"v2x-its","ITS study/use.",INDIA,"unverified-current"),
  e("sea-as923","southeast-asia","AS923 LPWA",915,928,"lpwa-ism","Country-specific AS923 channel plans.",ITU,"unverified-current"), e("sea-24","southeast-asia","2.4GHz ISM",2400,2483.5,"wifi-unlicensed","Wi-Fi/Bluetooth.",ITU), e("sea-5","southeast-asia","5GHz WLAN",5150,5850,"wifi-unlicensed","Country-specific WLAN rules.",ITU,"unverified-current"), e("sea-gnss","southeast-asia","GNSS L1",1559,1610,"satellite","Satellite navigation.",ITU), e("sea-amateur","southeast-asia","70cm amateur",430,440,"amateur","Amateur allocations vary.",ITU,"unverified-current"),
  e("oc-au915","oceania","AU915 LPWA",915,928,"lpwa-ism","LPWA/ISM under LIPD rules.",ACMA), e("oc-24","oceania","2.4GHz ISM",2400,2483.5,"wifi-unlicensed","Wi-Fi/Bluetooth.",ACMA), e("oc-5","oceania","5GHz WLAN",5150,5850,"wifi-unlicensed","WLAN with radar protection.",ACMA), e("oc-gnss","oceania","GNSS L1",1559,1610,"satellite","Satellite navigation.",ACMA), e("oc-amateur","oceania","70cm amateur",430,450,"amateur","Amateur service.",ACMA,"unverified-current"),
  e("af-868","africa","863-870MHz SRD",863,870,"lpwa-ism","Country-specific SRD/LPWA.",ITU,"unverified-current"), e("af-24","africa","2.4GHz ISM",2400,2483.5,"wifi-unlicensed","Wi-Fi/Bluetooth.",ITU), e("af-tvws","africa","TV white space",470,694,"wifi-unlicensed","TVWS trials and country rules.",ITU,"unverified-current"), e("af-gnss","africa","GNSS L1",1559,1610,"satellite","Satellite navigation.",ITU), e("af-amateur","africa","70cm amateur",430,440,"amateur","Region 1 amateur allocation.",ITU,"unverified-current"),
  e("other-915","others","Americas 915MHz family",902,928,"lpwa-ism","Country-specific AU915/US915 derivatives.",ITU,"unverified-current"), e("other-24","others","2.4GHz ISM",2400,2483.5,"wifi-unlicensed","Global ISM use.",ITU), e("other-5","others","5GHz WLAN",5150,5850,"wifi-unlicensed","Country-specific WLAN rules.",ITU,"unverified-current"), e("other-gnss","others","GNSS L1",1559,1610,"satellite","Satellite navigation.",ITU), e("other-amateur","others","70cm amateur",430,450,"amateur","ITU-region dependent.",ITU,"unverified-current")
];

export const JAPAN_ACTION_PLAN_ITEMS: readonly ActionPlanItem[] = [
  { title:"26GHz帯5Gオークション",summary:"日本初の条件付周波数オークションに向け技術基準・指針を整備。",timeline:"令和7年度内目途",relatedBands:["25.25〜27GHz"] },
  { title:"Wi-Fi周波数拡張",summary:"6GHz SP屋外利用と6425〜7125MHzへの拡張について共用条件を検討。",timeline:"令和7年度中目途",relatedBands:["5925〜6425MHz","6425〜7125MHz"] },
  { title:"5.9GHz V2X",summary:"5895〜5925MHzの30MHz幅をV2X向けに割り当てる方向で調整。",timeline:"制度整備中",relatedBands:["5895〜5925MHz"] },
  { title:"700MHz衛星直接通信",summary:"スマートフォンとの衛星直接通信（NTN）の制度整備。",timeline:"令和8年中目途",relatedBands:["700MHz帯"] }
];

export const JAPAN_WG_ACTIVITIES: readonly WgActivity[] = [
  { wgName:"無線LAN等作業班",parentBody:"情報通信審議会 情報通信技術分科会",scope:"6GHz帯無線LANと既存業務の共用条件",recentOutput:"SPモード屋外利用・上部6GHz拡張の技術条件を検討",sourceLabel:"総務省 情報通信審議会",sourceUrl:"https://www.soumu.go.jp/main_sosiki/joho_tsusin/policyreports/joho_tsusin/",checkedAt },
  { wgName:"V2X通信検討作業班",parentBody:"情報通信審議会",scope:"5.9GHz帯V2Xの技術条件",recentOutput:"5895〜5925MHzの利用条件を検討",sourceLabel:"総務省 情報通信審議会",sourceUrl:"https://www.soumu.go.jp/main_sosiki/joho_tsusin/policyreports/joho_tsusin/",checkedAt }
];

export const SPECTRUM_CATEGORY_LABELS: Record<SpectrumUseCategory,string> = {"wifi-unlicensed":"Wi-Fi・アンライセンス","lpwa-ism":"LPWA・ISM","broadcast":"放送","satellite":"衛星・測位","radar-weather":"レーダー・気象","v2x-its":"V2X・ITS","public-safety":"公共・防災","amateur":"アマチュア","fixed-links":"固定回線・FPU"};
export const SPECTRUM_REGION_LABELS: Record<SpectrumRegion,string> = {japan:"日本",usa:"米国",china:"中国",europe:"欧州","southeast-asia":"東南アジア",oceania:"オセアニア",africa:"アフリカ",india:"インド",others:"その他"};
