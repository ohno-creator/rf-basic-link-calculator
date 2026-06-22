import { BookOpen, MessageSquareText } from "lucide-react";
import { COLUMN_URL, CONTACT_URL } from "@/lib/rf/presets";

const cards = [
  {
    title: "リンクバジェットとは？通信距離・受信電力・アンテナ利得の基礎を解説",
    description:
      "自由空間損失、受信電力、受信感度、リンクマージンの考え方を初心者向けに解説します。",
    href: COLUMN_URL,
    icon: BookOpen
  },
  {
    title: "アンテナ選定・内蔵アンテナ配置・実機評価について相談する",
    description:
      "IoT機器のアンテナ選定、筐体組込み、量産前評価についてスタッフ株式会社へご相談いただけます。",
    href: CONTACT_URL,
    icon: MessageSquareText
  }
];

export function SeoLinks() {
  return (
    <section className="mx-auto mt-16 max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mb-5">
        <p className="text-sm font-semibold text-staf-dark">関連情報</p>
        <h2 className="mt-2 text-2xl font-bold text-slate-950">詳しい解説と技術相談</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <a
              key={card.title}
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:border-staf/40 hover:shadow-card-hover"
              href={card.href}
            >
              <Icon aria-hidden="true" className="h-6 w-6 text-staf-dark" />
              <h3 className="mt-3 text-lg font-semibold text-slate-950">{card.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{card.description}</p>
            </a>
          );
        })}
      </div>
    </section>
  );
}
