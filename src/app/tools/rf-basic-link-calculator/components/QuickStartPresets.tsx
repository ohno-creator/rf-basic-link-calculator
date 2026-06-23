import { ArrowRight } from "lucide-react";
import { Card } from "@/components/Card";
import type { QuickStartPreset } from "@/data/quickStartPresets";
import { quickStartPresets } from "@/data/quickStartPresets";

type QuickStartPresetsProps = {
  onSelect: (preset: QuickStartPreset) => void;
};

export function QuickStartPresets({ onSelect }: QuickStartPresetsProps) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-staf-dark">まず試すプリセット</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-950">
            数値が分からなくても、代表条件から始められます
          </h2>
        </div>
        <p className="max-w-2xl text-sm leading-relaxed text-slate-600">
          カードを選ぶと、リンクバジェット診断の入力フォームへ値が反映されます。
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {quickStartPresets.map((preset) => (
          <Card
            as="article"
            key={preset.id}
            padding="lg"
            className="flex flex-col"
          >
            <span className="w-fit rounded-full bg-staf-light px-3 py-1 text-xs font-semibold text-staf-dark">
              {preset.label}
            </span>
            <h3 className="mt-4 text-lg font-bold text-slate-950">{preset.system}</h3>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-md bg-slate-50 p-2">
                <span className="block text-xs text-slate-500">周波数</span>
                <span className="font-semibold text-slate-900">{preset.frequencyLabel}</span>
              </div>
              <div className="rounded-md bg-slate-50 p-2">
                <span className="block text-xs text-slate-500">距離</span>
                <span className="font-semibold text-slate-900">{preset.distanceLabel}</span>
              </div>
            </div>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">
              {preset.description}
            </p>
            <p className="mt-3 text-xs font-medium text-slate-500">{preset.difficulty}</p>
            <button
              type="button"
              className="mt-4 inline-flex items-center justify-center gap-2 rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-staf"
              onClick={() => onSelect(preset)}
            >
              この条件で試す
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </button>
          </Card>
        ))}
      </div>
    </section>
  );
}
