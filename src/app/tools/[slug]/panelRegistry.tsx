import dynamic from "next/dynamic";
import type { ComponentType } from "react";

/**
 * F1スパイク: manifest駆動ページのパネル台帳（チャンク分割版）。
 * next/dynamic により各パネルは独立チャンクになり、[slug]ルートの共有バンドルに
 * 全パネルが同梱されない（静的importマップ版はFirst Load +19kB/3本を確認→本方式を採用）。
 * ここに登録した slug は個別 page.tsx を持たず、/tools/[slug] が静的書き出しする。
 */
export const manifestPanels: Record<string, ComponentType> = {
  "vswr-bandwidth-q": dynamic(() =>
    import("@/app/tools/_components/VswrBandwidthQPanel").then((m) => m.VswrBandwidthQPanel)
  ),
  "electrical-length": dynamic(() =>
    import("@/app/tools/_components/ElectricalLengthPanel").then((m) => m.ElectricalLengthPanel)
  ),
  "pointing-margin": dynamic(() =>
    import("@/app/tools/_components/PointingMarginPanel").then((m) => m.PointingMarginPanel)
  )
};

export const manifestSlugs = Object.keys(manifestPanels);
