import {
  ArrowDownRight,
  ArrowUpRight,
  Gauge,
  RadioTower,
  ShieldAlert,
  Waves
} from "lucide-react";

const impacts = [
  {
    title: "距離・周波数",
    change: "長くなる / 高くなる",
    result: "自由空間損失が増えて、受信電力が下がる",
    example: "距離2倍で約 -6dB",
    icon: Waves,
    effectIcon: ArrowDownRight,
    tone: "border-sky-200 bg-sky-50 text-sky-800"
  },
  {
    title: "送信出力・アンテナ利得",
    change: "大きくする",
    result: "受信電力が上がり、リンクマージンが増える",
    example: "+3dBで電力感覚は約2倍",
    icon: RadioTower,
    effectIcon: ArrowUpRight,
    tone: "border-emerald-200 bg-emerald-50 text-emerald-800"
  },
  {
    title: "ケーブル・環境損失",
    change: "大きくなる",
    result: "途中で電波が失われ、リンクマージンが減る",
    example: "金属近接や筐体内蔵で悪化",
    icon: ShieldAlert,
    effectIcon: ArrowDownRight,
    tone: "border-rose-200 bg-rose-50 text-rose-800"
  },
  {
    title: "受信感度",
    change: "より小さいdBmにする",
    result: "弱い電波まで受けられ、判定ラインに余裕が出る",
    example: "-100dBmは-90dBmより高感度",
    icon: Gauge,
    effectIcon: ArrowUpRight,
    tone: "border-amber-200 bg-amber-50 text-amber-800"
  }
];

export function InputImpactGuide() {
  return (
    <section className="mb-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-staf">入力で何が変わるか</p>
          <h3 className="mt-1 text-xl font-bold text-slate-950">
            数値を動かす前に、結果への効き方を確認
          </h3>
        </div>
        <p className="max-w-2xl text-sm leading-relaxed text-slate-600">
          迷ったら「距離・損失はマージンを減らす」「利得・高感度はマージンを増やす」と覚えると読みやすくなります。
        </p>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {impacts.map((impact) => {
          const Icon = impact.icon;
          const EffectIcon = impact.effectIcon;

          return (
            <article key={impact.title} className={`rounded-lg border p-4 ${impact.tone}`}>
              <div className="flex items-center justify-between gap-3">
                <Icon aria-hidden="true" className="h-7 w-7" />
                <EffectIcon aria-hidden="true" className="h-6 w-6" />
              </div>
              <h4 className="mt-3 text-sm font-bold text-slate-950">{impact.title}</h4>
              <p className="mt-1 text-xs font-semibold text-slate-500">{impact.change}</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">{impact.result}</p>
              <p className="mt-3 rounded-md bg-white/70 px-3 py-2 text-xs font-semibold text-slate-700">
                {impact.example}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
