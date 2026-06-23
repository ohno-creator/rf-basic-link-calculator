import {
  ChartColumnIncreasing,
  ClipboardCheck,
  MousePointerClick,
  SlidersHorizontal
} from "lucide-react";
import { StateCard } from "@/components/Card";
import type { CalloutTone } from "@/components/Callout";

const steps: {
  title: string;
  body: string;
  icon: typeof MousePointerClick;
  tone: CalloutTone;
}[] = [
  {
    title: "1. 近い条件を選ぶ",
    body: "まずは代表プリセットから始めます。周波数や距離が分からない場合でも、近い用途を選ぶと全体像をつかめます。",
    icon: MousePointerClick,
    tone: "info"
  },
  {
    title: "2. 数値を少し動かす",
    body: "距離、アンテナ利得、環境損失を変えて、どの項目がリンクマージンを削るか確認します。",
    icon: SlidersHorizontal,
    tone: "success"
  },
  {
    title: "3. 滝グラフを見る",
    body: "送信電力から受信電力まで、どこで大きく落ちたかを見ます。大きな落ち込みが改善ポイントです。",
    icon: ChartColumnIncreasing,
    tone: "caution"
  },
  {
    title: "4. 実機確認に進む",
    body: "余裕が少ない、または金属・筐体・設置環境が厳しい場合は、実機状態でアンテナ評価します。",
    icon: ClipboardCheck,
    tone: "danger"
  }
];

export function BeginnerRoadmap() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-staf-dark">はじめてでも迷わない見方</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-950">
            入力から判断までを4ステップで追えます
          </h2>
        </div>
        <p className="max-w-2xl text-sm leading-relaxed text-slate-600">
          dBやリンクバジェットに慣れていない方は、この順番で見ると「何が効いているか」を把握しやすくなります。
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        {steps.map((step) => {
          const Icon = step.icon;

          return (
            <StateCard key={step.title} tone={step.tone} padding="md">
              <Icon aria-hidden="true" className="h-7 w-7" />
              <h3 className="mt-3 text-base font-bold text-slate-950">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.body}</p>
            </StateCard>
          );
        })}
      </div>
    </section>
  );
}
