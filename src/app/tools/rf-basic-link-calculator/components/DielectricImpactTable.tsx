import { dielectricPresets } from "@/data/dielectricPresets";
import {
  type DielectricImpact,
  dielectricImpactLevel,
  relativeBandwidth,
  wavelengthShorteningFactor
} from "@/lib/rf/dielectric";

const impactStyles: Record<DielectricImpact, string> = {
  ほぼなし: "bg-slate-100 text-slate-600",
  小: "bg-emerald-100 text-emerald-800",
  中: "bg-sky-100 text-sky-800",
  大: "bg-amber-100 text-amber-900",
  特大: "bg-rose-100 text-rose-800"
};

export function DielectricImpactTable() {
  const rows = dielectricPresets.map((preset) => ({
    ...preset,
    shortening: wavelengthShorteningFactor(preset.er),
    bandwidth: relativeBandwidth(preset.er),
    impact: dielectricImpactLevel(preset.er)
  }));

  return (
    <div className="mt-4">
      <p className="text-sm font-semibold text-slate-950">誘電率による波長短縮と特性への影響（目安）</p>
      <p className="mt-1 text-xs leading-relaxed text-slate-500">
        高い比誘電率εrの材料を使うほどアンテナを小さくできますが、その分だけ帯域や効率は犠牲になります。
      </p>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[420px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs text-slate-500">
              <th className="py-2 pr-3 font-semibold">材料（εr）</th>
              <th className="px-3 py-2 font-semibold">波長短縮率</th>
              <th className="px-3 py-2 font-semibold">帯域の目安</th>
              <th className="py-2 pl-3 font-semibold">影響</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.material} className="border-b border-slate-100 align-top">
                <td className="py-2 pr-3">
                  <span className="font-semibold text-slate-900">{row.material}</span>
                  <span className="ml-1 text-xs text-slate-500">εr {row.er}</span>
                  <span className="block text-xs text-slate-400">{row.note}</span>
                </td>
                <td className="px-3 py-2 font-semibold text-staf-dark">×{row.shortening.toFixed(2)}</td>
                <td className="px-3 py-2 text-slate-700">{Math.round(row.bandwidth * 100)}%</td>
                <td className="py-2 pl-3">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${impactStyles[row.impact]}`}
                  >
                    {row.impact}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs leading-relaxed text-slate-500">
        表の波長短縮率は λg/λ0 = 1/√εr で、エレメントを誘電体で完全に囲んだ理想（最大）の値です。実際の基板やチップアンテナでは電界の一部しか誘電体内を通らないため、効くのは実効比誘電率
        εeff（1〜εr の間）で、短縮量はこれより小さくなります。εeff
        は、誘電体の<span className="font-semibold text-slate-700">厚さ</span>（厚く・十分に囲むほど
        εr に近づく）と、エレメントの<span className="font-semibold text-slate-700">片面だけか両面を覆うか</span>（両面ほど効く）で変わります。帯域の目安は空気（εr
        1.0）を100%とした相対値で、寸法縮小に比例させた簡易目安です。実際の帯域・効率は、形状、材料損失（tanδ）、基板GND、実装条件にも左右されます。
      </p>
    </div>
  );
}
