// フレネルゾーンツールのプリセット定義。
// 周波数プリセットは「代表的な無線方式」、障害物プリセットは「送受間に置く物体」。
// それぞれに前提条件(note)を明記し、数値の根拠を画面に出せるようにする。

export type FresnelFrequencyPreset = {
  id: string;
  label: string;
  frequencyMHz: number;
  distanceKm: number;
  txHeightM: number;
  rxHeightM: number;
  /** このプリセットが想定している前提条件。 */
  note: string;
};

export const fresnelFrequencyPresets: FresnelFrequencyPreset[] = [
  {
    id: "tokutei-426",
    label: "特定小電力 426MHz",
    frequencyMHz: 426,
    distanceKm: 0.3,
    txHeightM: 3,
    rxHeightM: 1.5,
    note: "テレメータ/テレコントロール等の特定小電力(426/429MHz帯)。基地3m・端末1.5m、見通し約300mを想定。"
  },
  {
    id: "lpwa-920",
    label: "LPWA 920MHz",
    frequencyMHz: 920,
    distanceKm: 2,
    txHeightM: 10,
    rxHeightM: 3,
    note: "LoRa/Wi-SUN/ELTRES等のサブGHz帯。基地局10m・端末3m、見通し約2kmを想定。"
  },
  {
    id: "wifi-ble-2g4",
    label: "Wi-Fi/BLE 2.4GHz",
    frequencyMHz: 2400,
    distanceKm: 0.1,
    txHeightM: 3,
    rxHeightM: 2,
    note: "Wi-Fi(2.4GHz)/Bluetooth。屋内〜近距離の見通し(約100m)を想定。"
  },
  {
    id: "wifi-5g",
    label: "Wi-Fi 5GHz",
    frequencyMHz: 5200,
    distanceKm: 0.05,
    txHeightM: 3,
    rxHeightM: 2,
    note: "Wi-Fi 5GHz帯(5.2/5.6GHz)。屋内近距離(約50m)。波長が短くゾーンは細い。"
  },
  {
    id: "fwa-5g8",
    label: "5.8GHz 屋外FWA",
    frequencyMHz: 5800,
    distanceKm: 1,
    txHeightM: 10,
    rxHeightM: 10,
    note: "5.8GHz帯の屋外固定無線(FWA)等。両端とも高所10m設置・見通し約1kmを想定。"
  }
];

export type ObstacleKind = "person" | "car" | "tree" | "building" | "hill";

export type FresnelObstaclePreset = {
  id: string;
  label: string;
  kind: ObstacleKind;
  heightM: number;
  /** この高さの前提条件。 */
  note: string;
};

export const fresnelObstaclePresets: FresnelObstaclePreset[] = [
  {
    id: "person",
    label: "人間",
    kind: "person",
    heightM: 1.7,
    note: "立っている成人の平均的な高さ(約1.7m)。人体は水分が多く、近接すると数dBの遮蔽になり得ます。"
  },
  {
    id: "car-sedan",
    label: "車（乗用車）",
    kind: "car",
    heightM: 1.5,
    note: "セダン/コンパクトカーの全高(約1.5m)。金属ボディは反射・遮蔽源になります。"
  },
  {
    id: "car-suv",
    label: "車（SUV/ミニバン）",
    kind: "car",
    heightM: 1.9,
    note: "SUV・ミニバンの全高(約1.8〜2.0m)。"
  },
  {
    id: "car-truck",
    label: "車（トラック/バス）",
    kind: "car",
    heightM: 3.5,
    note: "中〜大型トラック・バスの全高(約3.5〜3.8m)。通過時に一時的な遮断を起こしやすい。"
  },
  {
    id: "tree-hedge",
    label: "木（生垣・低木）",
    kind: "tree",
    heightM: 3,
    note: "生垣・低木(約2〜4m)。葉の量・季節(落葉/着葉)で減衰は大きく変動します。"
  },
  {
    id: "tree-street",
    label: "木（街路樹）",
    kind: "tree",
    heightM: 10,
    note: "街路樹・中木(約8〜12m)。樹冠は電波を散乱・吸収します。"
  },
  {
    id: "tree-tall",
    label: "木（高木・林）",
    kind: "tree",
    heightM: 20,
    note: "高木・林(約15〜25m)。森林通過は距離あたりの追加損失も大きくなります。"
  },
  {
    id: "bldg-2f",
    label: "建物（戸建2階）",
    kind: "building",
    heightM: 6,
    note: "木造2階建ての軒高(約6m、1階あたり約3m)。"
  },
  {
    id: "bldg-mid",
    label: "建物（3〜4階）",
    kind: "building",
    heightM: 12,
    note: "中層建築(3〜4階、1フロア約3m換算)。"
  },
  {
    id: "bldg-tall",
    label: "建物（ビル）",
    kind: "building",
    heightM: 30,
    note: "中高層ビル(約30m〜、概算)。鉄筋コンクリートは強い遮蔽源です。"
  },
  {
    id: "hill-low",
    label: "丘（緩やかな丘）",
    kind: "hill",
    heightM: 20,
    note: "緩やかな丘(経路上の比高 約20m)。稜線はナイフエッジ回折で評価します。"
  },
  {
    id: "hill-mid",
    label: "小山",
    kind: "hill",
    heightM: 50,
    note: "小山(比高 約50m)。"
  },
  {
    id: "mountain",
    label: "山",
    kind: "hill",
    heightM: 150,
    note: "山地(比高 100m以上、ここでは150m概算)。本来は地形断面での評価を推奨します。"
  }
];
