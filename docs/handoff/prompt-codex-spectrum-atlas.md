# Codex 発注 — 周波数の用途地図（非セルラー編・世界9地域＋日本深掘り）

**目的**: 4G/5G携帯網「以外」の周波数用途（Wi-Fi/LPWA/放送/衛星/レーダー/V2X/公共業務/アマチュア等）を、日本＋世界8地域で見渡せる新ツール。日本は**周波数共用・再編・周波数再編アクションプラン・WG活動**まで深掘りする（ユーザー明示要求）。
**新ツール**: slug `spectrum-use-atlas`「周波数の用途地図（非セルラー編）」category "basics" icon "radio"（cellular-band-map の隣に登録・basic{}なしのクライアント型＝rf-learning-quest/cellular-band-map型）
**ブランチ**: `track/spectrum-atlas`（origin/feature から・専用worktree必須）
**手本を必ずRead**: `src/data/cellularCarrierBands.ts`（データ型の流儀＝status/sourceLabel/sourceUrl/checkedAt）／`src/app/tools/_components/CellularBandModes.tsx`（5モードUI）／`src/lib/rf/cellularCarrierCatalog.ts`＋テスト（カタログ関数の流儀）

## データモデル（`src/data/spectrumUses.ts`・テスト先行でカタログ関数も）

```ts
export type SpectrumRegion =
  | "japan" | "usa" | "china" | "europe" | "southeast-asia"
  | "oceania" | "africa" | "india" | "others";

export type SpectrumUseCategory =
  | "wifi-unlicensed"   // Wi-Fi・アンライセンス（2.4/5/6GHz）
  | "lpwa-ism"          // LPWA・ISM・短距離（920MHz帯/433MHz/13.56MHz等）
  | "broadcast"         // 放送（地デジ/FM/衛星放送）
  | "satellite"         // 衛星通信・測位（GNSS/Ku/Ka/NTN）
  | "radar-weather"     // レーダー・気象・航空・海上
  | "v2x-its"           // V2X・ITS
  | "public-safety"     // 公共業務・防災・消防救急
  | "amateur"           // アマチュア無線
  | "fixed-links";      // 固定マイクロ波・FPU・放送素材伝送

export type SpectrumEntryStatus = "confirmed-current" | "unverified-current" | "planned" | "sunsetting";

export type SharingInfo = {
  partners: string[];            // 共用相手（例: ["放送事業用", "公共業務"]）
  mechanism: "dynamic" | "geographic" | "time" | "carrier-sense" | "coordination" | "dfs";
  note: string;                  // 共用の仕組みの1-3文解説
};

export type RefarmingInfo = {
  status: "planned" | "in-progress" | "completed";
  timeline: string;              // "2025年度中に技術的条件" 等
  note: string;                  // 何から何へ・なぜ
};

export type SpectrumEntry = {
  id: string;
  region: SpectrumRegion;
  bandLabel: string;             // "920MHz帯" "5.9GHz帯" 等
  rangeMHz: { low: number; high: number };
  category: SpectrumUseCategory;
  useSummary: string;            // 用途の2-3文
  iotRelevance: string;          // IoT設計者にとっての意味 1-2文
  sharing?: SharingInfo;         // 共用があるエントリのみ
  refarming?: RefarmingInfo;     // 再編中/予定のエントリのみ
  status: SpectrumEntryStatus;
  sourceLabel: string;
  sourceUrl: string;
  checkedAt: string;             // "2026-07"
};
```

### 日本深掘り用の追加データ（同ファイルまたは `src/data/japanSpectrumPolicy.ts`）

```ts
export type ActionPlanItem = { title: string; summary: string; timeline: string; relatedBands: string[] };
export type WgActivity = { wgName: string; parentBody: string; scope: string; recentOutput: string; sourceLabel: string; sourceUrl: string; checkedAt: string };
```

## データ内容（数値の発明禁止・以下のアンカーは Claude が2026-07-12にWebSearchで確認済み）

### 確定アンカー（そのまま使用可・出典明記）
- **周波数再編アクションプラン（令和7年度版）**: 2025年11月28日公表。[総務省 報道資料](https://www.soumu.go.jp/menu_news/s-news/01kiban09_02000563.html)／[本文PDF](https://www.soumu.go.jp/main_content/001042686.pdf)
  - 目標: **2040年末までに＋約47GHz幅**の帯域確保（2023年末時点で約26.5GHz幅確保済み）
  - **7つの重点的取組**（本文PDFから正確に転記すること）。うち確認済み3件:
    1. **26GHz帯5Gオークション**: 令和7年度内目途に技術基準・価額競争指針を整備→速やかに価額競争で割当（日本初の周波数オークション）
    2. **Wi-Fi周波数の拡張**: 6GHz帯無線LANのSPモード屋外利用＋**6.5GHz帯（6425〜7125MHz）への拡張**の周波数共用technical条件を令和7年度中目途に取りまとめ
    3. **V2X**: 5.9GHz帯（5850-5925MHz）のうち**5895-5925MHzの最大30MHz幅**をV2X通信向けに割当てる方向
  - 700MHz帯の**衛星直接通信（NTN, スマホ直接接続）**制度整備は令和8年目途（[ケータイWatch報道](https://k-tai.watch.impress.co.jp/docs/news/2068058.html)）
- **2.3GHz帯ダイナミック周波数共用**: 放送事業用等と携帯（KDDIが2022年割当済み）が場所・時間で共用する国内初のDSS運用。※本ツールでは「共用の代表例」として日本詳細モードに掲載
- **6GHz帯Wi-Fi**: 5925-6425MHzは屋内LPI等で2022年開放済み。SP屋外・上部6GHz拡張は上記アクションプラン参照

### 各地域のエントリ（Codexが調査して作成・最低数の目安）
- **日本: 20エントリ以上**（920MHz LPWA[ARIB STD-T108・キャリアセンス共用]/2.4GHz ISM/5GHz W52-W56[DFS=気象レーダー共用]/6GHz/13.56MHz NFC/地デジ470-710MHz[700MHz再編の歴史含む]/FM・ワイドFM[AMからの移行=再編中]/GPS L1・みちびき/BS・CS/Ku・Ka衛星/ETC 5.8GHz/ITS Connect 760MHz/V2X 5.9GHz[planned]/防災行政無線/消防救急デジタル/アマチュア430MHz・1200MHz[アマ×業務共用]/航空管制/船舶AIS/23GHz固定/FPU・ラジオマイク[ホワイトスペース共用]）
- **米国・欧州・中国・インド: 各8エントリ以上**（例: 米CBRS 3.5GHz[3層共用=連邦レーダー/優先/一般]・6GHz全開放1200MHz・TVWS／欧州863-868MHz SRD・5.9GHz ITS-G5／中国470-510MHz LoRa・北斗／印度865-867MHz・NavIC）
- **東南アジア・オセアニア・アフリカ・その他: 各5エントリ以上**（AS923/AU915/ANZ、アフリカのTVWS実証、その他=中南米AU915系等、ITU地域1/2/3の違いに言及）
- **裏取りできないエントリは必ず `status: "unverified-current"`** とし、後段の検証（O-6/Antigravity復帰後A-7）で確定させる。**もっともらしい数値の創作は絶対禁止**（周波数レンジはITU/各国規制当局/ARIB・ETSI・FCC規格の一次情報のみ）

## UI（5モード・CellularBandModes.tsx の様式踏襲・`SpectrumAtlasModes.tsx`）
1. **入門（周波数ものさし）**: 30MHz〜30GHzの対数軸ルーラーに用途カテゴリを色帯で積層表示（生hex禁止・カテゴリ→diagramPalette割当）。周波数スライダーの縦カーソルで「その周波数で世界は何をしているか」を連動表示
2. **用途別**: カテゴリタブ（Wi-Fi/LPWA/放送/衛星/レーダー/V2X/公共/アマチュア/固定）→ 地域×バンドの比較表。「同じ用途でも地域で周波数が違う」を見せる（例: LPWAの920/868/915/923）
3. **日本詳細（本命・最も作り込む）**: 3タブ構成
   - 共用タブ: sharing付きエントリ一覧＋共用方式バッジ（DSS/DFS/キャリアセンス/地理的/協調）＋方式の仕組み解説
   - 再編タブ: refarming付きエントリのタイムライン表示（planned/in-progress/completed）＋700MHz再編の完了事例
   - 政策タブ: アクションプラン令和7年度版の7つの重点的取組カード＋WG活動テーブル（WgActivity）
4. **世界比較**: 地域選択→カテゴリ→バンド表のドリルダウン（cellular-band-map v3の世界モードと同一UX）
5. **検索一覧**: 周波数・用途名・地域でインクリメンタル検索（例:「5.9」「LoRa」「DFS」）

## カタログ関数（`src/lib/rf/spectrumAtlas.ts`・テスト先行）
- `findUsesAtFrequency(freqMHz)`: 全地域から該当エントリ抽出（境界含む・-0/非有限ガード）
- `filterByRegionAndCategory(region, category?)`
- `searchSpectrumEntries(query)`: bandLabel/useSummary/カテゴリ和名の部分一致
- テスト期待値の例（データ確定後に自己検算して固定）: 920.5MHz→日本のLPWA帯ヒット／5900MHz→日本V2X(planned)＋欧州ITS-G5／2450MHz→全地域のISM

## コラム（**用途カテゴリごとに1本=計9本**・D1構造化形式 `ToolColumn`＋`ToolColumnCard`・`src/data/columns/spectrumAtlas/*.ts`）
各コラム: フック（専門用語なし2-3文）→本文600-800字→たとえ＋破れ→数値で見る（compute()でlib関数呼び・波長換算等）→深掘り→一次出典（locator＋retrievedAt）。テーマ指定:
1. **Wi-Fi/アンライセンス**: 「電子レンジがWi-Fiの居場所を決めた」——2.4GHz ISMバンドの由来（出典: ITU RR footnote 5.150／FCC Part 15）
2. **LPWA/ISM**: 「日本の920MHzが"世界の島"である理由」——ARIB STD-T108のキャリアセンス・送信時間制限と各国SRD規制の分岐（ETSI EN 300 220との対比）
3. **放送**: 「テレビの引っ越しがスマホの電波を生んだ」——地デジ化→700MHz再編→携帯割当の日本史（総務省再編資料）
4. **衛星**: 「静止軌道は27万kmの椅子取りゲーム」——ITUファイリングと周波数調整（ITU RR Article 9）
5. **レーダー/気象**: 「Wi-Fiが1分黙る理由」——5GHz DFSと気象レーダー保護（ITU-R M.1652）
6. **V2X**: 「世界で割れた5.9GHz」——DSRC vs C-V2Xの規格競争と日本の760MHz→5.9GHz移行（令和7年度アクションプラン）
7. **公共業務**: 「災害の日に混まない周波数」——専用帯が存在する理由と平時の"空き"の共用議論（2.3GHz DSS）
8. **アマチュア**: 「実験する権利の帯」——アマチュアバンドが技術者を育てた歴史（IARU）
9. **固定/FPU**: 「マラソン中継が走る周波数」——FPU・ラジオマイクとホワイトスペース共用（700MHz特定ラジオマイク再編）

## e2e（納品に含める・tool-calculator配下・既存名と重複回避）
1. 5モード切替→日本詳細の3タブ（共用/再編/政策）→アクションプラン令和7年度版カード表示→WGテーブル表示
2. ものさしモードで周波数入力（920MHz）→該当用途表示＋検索モード（「DFS」）→ヒット表示

## 規約
専用worktree・1モード=1コミット目安・tools.tsとe2eは最後に1コミット・生hex禁止・数値の発明禁止（unverified-currentを恐れない——創作より正直な未確認）・全ゲート緑（`Tests N passed`行確認）→push→視覚ベースライン（rebaselineループ）→feature→main。
検証: 完成後、日本エントリ全数＋各地域サンプルの裏取りをO-6（Claude）が実施し、Antigravity復帰後にA-7として実機受入＋残り全数裏取りを依頼。
