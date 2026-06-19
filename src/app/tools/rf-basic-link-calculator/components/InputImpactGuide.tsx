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
    result: "伝搬損失が増えて、受信電力が下がる",
    example: "距離2倍で約 -6dB",
    icon: Waves,
    effectIcon: ArrowDownRight,
    tone: "border-sky-200 bg-sky-50 text-sky-800"
  },
  {
    title: "送信電力・アンテナ利得・高さ",
    change: "大きくする / 高くする",
    result: "受信電力が上がり、リンクマージンが増える",
    example: "+3dBで電力感覚は約2倍",
    icon: RadioTower,
    effectIcon: ArrowUpRight,
    tone: "border-emerald-200 bg-emerald-50 text-emerald-800"
  },
  {
    title: "ケーブル・環境・端末近傍損失",
    change: "大きくなる",
    result: "途中で電波が失われ、リンクマージンが減る",
    example: "地面近接・筐体・遮蔽で悪化",
    icon: ShieldAlert,
    effectIcon: ArrowDownRight,
    tone: "border-rose-200 bg-rose-50 text-rose-800"
  },
  {
    title: "受信感度・実測補正値",
    change: "高感度化 / 現地測定で補正",
    result: "判定ラインと現地との差分を見て、評価の確度を上げる",
    example: "-100dBmは-90dBmより高感度",
    icon: Gauge,
    effectIcon: ArrowUpRight,
    tone: "border-amber-200 bg-amber-50 text-amber-800"
  }
];

export function InputImpactGuide() {
  return (
    <div>
      <p className="text-sm leading-relaxed text-slate-600">
        迷ったら「距離・損失はマージンを減らす」「利得・アンテナ高・高感度はマージンを増やす」「実測補正値は現地差分を反映する」と覚えると読みやすくなります。
      </p>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {impacts.map((impact) => {
          const Icon = impact.icon;
          const EffectIcon = impact.effectIcon;

          return (
            <article key={impact.title} className={`rounded-lg border p-4 ${impact.tone}`}>
              <div className="flex items-center justify-between gap-3">
                <Icon aria-hidden="true" className="h-7 w-7" />
                <EffectIcon aria-hidden="true" className="h-6 w-6" />
              </div>
              <p className="mt-3 text-sm font-bold text-slate-950">{impact.title}</p>
              <p className="mt-1 text-xs font-semibold text-slate-500">{impact.change}</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">{impact.result}</p>
              <p className="mt-3 rounded-md bg-white/70 px-3 py-2 text-xs font-semibold text-slate-700">
                {impact.example}
              </p>
            </article>
          );
        })}
      </div>
    </div>
  );
}
