import { calculateWavelengthFromMHz } from "@/lib/rf/frequency";
import { formatMeters } from "@/lib/rf/format";

type WavelengthVisualProps = {
  frequencyMHz: number;
};

const baseRows = [
  { label: "920MHz", frequencyMHz: 920 },
  { label: "2.4GHz", frequencyMHz: 2400 },
  { label: "5GHz", frequencyMHz: 5000 },
  { label: "6GHz", frequencyMHz: 6000 }
];

export function WavelengthVisual({ frequencyMHz }: WavelengthVisualProps) {
  const rows = [
    ...baseRows,
    { label: "入力値", frequencyMHz }
  ].map((row) => {
    const wavelengthM = calculateWavelengthFromMHz(row.frequencyMHz);
    const width = Math.max(14, Math.min(100, (wavelengthM / 0.326) * 100));

    return { ...row, wavelengthM, width };
  });

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-base font-semibold text-slate-950">Wavelength Visual</h3>
      <div className="mt-4 space-y-3">
        {rows.map((row) => {
          const current = row.label === "入力値";

          return (
            <div key={`${row.label}-${row.frequencyMHz}`} className="grid grid-cols-[80px_1fr_90px] items-center gap-3 text-sm">
              <span className={current ? "font-semibold text-staf" : "text-slate-600"}>
                {row.label}
              </span>
              <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full ${current ? "bg-staf" : "bg-slate-400"}`}
                  style={{ width: `${row.width}%` }}
                />
              </div>
              <span className="text-right font-medium text-slate-800">
                {formatMeters(row.wavelengthM)}
              </span>
            </div>
          );
        })}
      </div>
      <p className="mt-4 text-sm leading-relaxed text-slate-600">
        周波数が高いほど波長は短くなります。アンテナのサイズ感は波長と関係しますが、実際のアンテナでは筐体、GND、誘電体、マッチング回路の影響を受けます。
      </p>
    </section>
  );
}
