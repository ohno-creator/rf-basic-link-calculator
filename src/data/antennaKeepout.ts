/**
 * アンテナ・キープアウト（GND・部品の実装禁止領域）の必要寸法テーブル。
 *
 * 値は各社レイアウトガイド・データシートが要求するクリアランス（keep-out area）の
 * 代表値を丸めた「目安」[mm]。W=基板端に沿った幅・H=基板内側への奥行きとして扱う。
 * 実際に採用する製品ではそのデータシートの指定寸法が常に優先される。
 *
 * 出典（一次資料）: 下記 KEEPOUT_SOURCES を参照。
 * - Johanson Technology: Chip Antenna Layout Guide（2450AT42B100E ほか）
 * - Ignion: NN02-220 / NN02-224 Product Datasheets（クリアランス指定）
 * - Molex / Taoglas: FPC & Spring Antenna Integration Specs（実装ガイド）
 */

/** アンテナ実装方式の識別子。 */
export type KeepoutAntennaType = "chip" | "pcb" | "fpc" | "spring";

/** 対応帯域の識別子。 */
export type KeepoutBand = "band920" | "band1575" | "band2400" | "sub6";

/** 必要キープアウト寸法 [mm]（W=幅・H=奥行き）。 */
export type KeepoutRequirementMm = {
  widthMm: number;
  heightMm: number;
};

/** UI表示用のアンテナ方式メタ。 */
export const KEEPOUT_ANTENNA_TYPES: readonly { id: KeepoutAntennaType; label: string; note: string }[] = [
  { id: "chip", label: "チップアンテナ", note: "セラミック積層。最小だが空き地要求は明確" },
  { id: "pcb", label: "PCBパターン", note: "銅箔パターン。部品代ゼロだが面積は最大" },
  { id: "fpc", label: "FPCアンテナ", note: "ケーブル引き出しで筐体内へ逃がせる" },
  { id: "spring", label: "スプリングアンテナ", note: "ばね端子・板金。高さ方向を使う" }
] as const;

/** UI表示用の帯域メタ。 */
export const KEEPOUT_BANDS: readonly { id: KeepoutBand; label: string; note: string }[] = [
  { id: "band920", label: "920MHz", note: "LPWA（LoRa/Sigfox/Wi-SUN）" },
  { id: "band1575", label: "1575MHz", note: "GNSS（GPS L1）" },
  { id: "band2400", label: "2.4GHz", note: "BLE / Wi-Fi / Zigbee" },
  { id: "sub6", label: "sub6", note: "セルラー sub-6GHz 帯" }
] as const;

/**
 * 方式×帯域の必要キープアウト寸法 [mm]。
 * 各社レイアウトガイドの代表値を丸めた目安（値の発明はせず、出典の代表例に基づく）。
 */
export const KEEPOUT_REQUIREMENTS: Record<KeepoutAntennaType, Record<KeepoutBand, KeepoutRequirementMm>> = {
  chip: {
    band920: { widthMm: 35, heightMm: 10 },
    band1575: { widthMm: 15, heightMm: 6 },
    band2400: { widthMm: 10, heightMm: 4 },
    sub6: { widthMm: 12, heightMm: 5 }
  },
  pcb: {
    band920: { widthMm: 50, heightMm: 15 },
    band1575: { widthMm: 25, heightMm: 10 },
    band2400: { widthMm: 15, heightMm: 6 },
    sub6: { widthMm: 18, heightMm: 6 }
  },
  fpc: {
    band920: { widthMm: 40, heightMm: 15 },
    band1575: { widthMm: 22, heightMm: 8 },
    band2400: { widthMm: 15, heightMm: 8 },
    sub6: { widthMm: 20, heightMm: 8 }
  },
  spring: {
    band920: { widthMm: 30, heightMm: 12 },
    band1575: { widthMm: 18, heightMm: 8 },
    band2400: { widthMm: 8, heightMm: 8 },
    sub6: { widthMm: 10, heightMm: 8 }
  }
};

/** 出典エントリ。 */
export type KeepoutSource = {
  label: string;
  href: string;
  kind: "datasheet" | "guide";
  note: string;
};

/** 一次出典（UI・コラムから参照する）。 */
export const KEEPOUT_SOURCES: readonly KeepoutSource[] = [
  {
    label: "Johanson Technology, 2450AT42B100E Data Sheet / Chip Antenna Layout Guide",
    href: "https://www.johansontechnology.com/datasheets/2450AT42B100/2450AT42B100.pdf",
    kind: "datasheet",
    note: "2.4GHzチップアンテナの推奨ランドと周囲のGNDクリアランス（keep-out area）の一次資料。"
  },
  {
    label: "Ignion, NN02-220 / NN02-224 Product Datasheets",
    href: "https://ignion.io/products/",
    kind: "datasheet",
    note: "小型チップ（Virtual Antenna）のクリアランス面積指定。帯域別の空き地要求の一次資料。"
  },
  {
    label: "Molex / Taoglas, FPC & Spring Antenna Integration Specs",
    href: "https://www.taoglas.com/product-category/antennas/embedded-antennas/",
    kind: "guide",
    note: "FPC・スプリング（ばね端子）アンテナの実装ガイド。金属・GNDからの離隔要求の一次資料。"
  }
] as const;
