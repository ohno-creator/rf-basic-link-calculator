import { CheckCircle2 } from "lucide-react";

const checkpoints = [
  "使用する通信方式・周波数帯",
  "通信モジュールの型番",
  "送信電力・受信感度",
  "アンテナの内蔵/外付け条件",
  "筐体材質",
  "基板GNDサイズ",
  "アンテナ配置スペース",
  "ケーブル長・コネクタ構成",
  "屋内/屋外/金属近接などの設置環境",
  "試作・量産スケジュール",
  "実機筐体の有無",
  "評価基板の有無"
];

export function NextCheckpoints() {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-base font-semibold text-slate-950">次に確認すること</h3>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {checkpoints.map((checkpoint) => (
          <div key={checkpoint} className="flex items-start gap-2 text-sm text-slate-700">
            <CheckCircle2 aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-staf-dark" />
            <span>{checkpoint}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
