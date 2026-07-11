import { CONTACT_URL } from "@/lib/rf/presets";
import { ToolColumnCard } from "@/components/ToolColumnCard";
import { fresnelDeepDiveColumn } from "@/data/columns/fresnelDeepDive";
import type { ObstacleAnalysis } from "@/lib/rf/fresnel";
import { formatMeters } from "@/lib/rf/format";

// D1パイロット: 構造化コラム（データ＋共通レンダラー）へ移行済み。
// 現在入力のフレネル半径を「いまの条件では」として層3に連動表示する。

export function FresnelDeepDive({ analysis }: { analysis?: ObstacleAnalysis | null }) {
  const live = analysis ? { firstZoneRadius: formatMeters(analysis.firstZoneRadiusM) } : undefined;
  return (
    <div className="space-y-4">
      <ToolColumnCard column={fresnelDeepDiveColumn} live={live} />
      <div className="rounded-lg border border-staf/20 bg-staf-light p-4">
        <p className="text-sm font-semibold text-slate-950">設置条件に迷ったら</p>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          フレネルゾーンの確保には現場ごとの制約があります。設置高さ・離隔・マージン設計は実測込みでご相談いただけます。
        </p>
        <a
          className="mt-3 inline-flex rounded-md bg-staf px-4 py-2 text-sm font-semibold text-white transition hover:bg-staf-dark"
          href={CONTACT_URL}
        >
          設置条件・マージン設計を相談する
        </a>
      </div>
    </div>
  );
}
