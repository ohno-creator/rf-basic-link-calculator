/**
 * ツールレジストリの icon 文字列 → lucide コンポーネントの対応表。
 * 一覧（ToolDirectoryBrowser）と検索パレット（ToolSearchPalette）で共有する単一ソース。
 * 未知キーは Gauge にフォールバックする（resolveToolIcon）。
 */

import {
  Activity,
  AppWindow,
  BookOpenCheck,
  Box,
  Bug,
  Building2,
  Cable,
  Calculator,
  CircuitBoard,
  Compass,
  Gauge,
  type LucideIcon,
  RadioTower,
  Repeat,
  Ruler,
  Spline,
  Waves
} from "lucide-react";

export const toolIconMap: Record<string, LucideIcon> = {
  bug: Bug,
  gauge: Gauge,
  calculator: Calculator,
  waves: Waves,
  spline: Spline,
  building: Building2,
  book: BookOpenCheck,
  radio: RadioTower,
  repeat: Repeat,
  ruler: Ruler,
  activity: Activity,
  cable: Cable,
  circuit: CircuitBoard,
  box: Box,
  window: AppWindow,
  aperture: Spline,
  satellite: RadioTower,
  scan: Ruler,
  radar: Waves,
  panel: CircuitBoard,
  refresh: Repeat,
  antenna: RadioTower,
  orbit: Activity,
  grid: CircuitBoard,
  mirror: Box,
  compass: Compass
};

export function resolveToolIcon(icon: string): LucideIcon {
  return toolIconMap[icon] ?? Gauge;
}
