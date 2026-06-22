import Link from "next/link";
import { COLUMN_URL, CONTACT_URL } from "@/lib/rf/presets";
import { toolCategories, toolDirectory } from "@/data/toolDirectory";

const groupedTools = toolCategories
  .map((category) => ({
    ...category,
    tools: toolDirectory.filter((tool) => tool.category === category.id)
  }))
  .filter((group) => group.tools.length > 0);

export function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_2fr]">
          <div>
            <p className="font-bold text-slate-950">スタッフ株式会社 / Staf Corporation</p>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-600">
              IoTアンテナ、LTE/LPWA/5G/Wi-Fi/BLE向けアンテナ、小型内蔵アンテナ、FPC/SMDアンテナ、宇宙用パッチアンテナ、ヒンジ・機構部品の技術支援を行います。
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <a
                href={CONTACT_URL}
                className="rounded-md bg-staf px-4 py-2 text-sm font-semibold text-white transition hover:bg-staf-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-staf/40"
              >
                お問い合わせ
              </a>
              <a
                href={COLUMN_URL}
                className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-staf/40 hover:text-staf focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-staf/40"
              >
                解説コラム
              </a>
            </div>
          </div>

          <nav aria-label="ツール一覧（フッター）" className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {groupedTools.map((group) => (
              <div key={group.id}>
                <p className="text-xs font-bold tracking-wide text-slate-500">{group.label}</p>
                <ul className="mt-3 space-y-2">
                  {group.tools.map((tool) => (
                    <li key={tool.href}>
                      <Link
                        href={tool.href}
                        className="rounded text-sm text-slate-600 transition hover:text-staf focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-staf/40"
                      >
                        {tool.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-10 border-t border-slate-100 pt-6 text-xs text-slate-400">
          © スタッフ株式会社　アンテナ・無線 基礎計算ツール集
        </div>
      </div>
    </footer>
  );
}
