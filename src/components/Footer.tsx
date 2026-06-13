import { COLUMN_URL, CONTACT_URL } from "@/lib/rf/presets";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 text-sm text-slate-600 sm:px-6 md:grid-cols-[1.2fr_1fr] lg:px-8">
        <div>
          <p className="font-semibold text-slate-950">スタッフ株式会社 / Staf Corporation</p>
          <p className="mt-2 max-w-2xl leading-relaxed">
            IoTアンテナ、LTE/LPWA/5G/Wi-Fi/BLE向けアンテナ、小型内蔵アンテナ、FPC/SMDアンテナ、宇宙用パッチアンテナ、ヒンジ・機構部品の技術支援を行います。
          </p>
        </div>
        <div className="flex flex-wrap gap-4 md:justify-end">
          <a className="font-medium text-staf hover:text-staf-dark" href={COLUMN_URL}>
            リンクバジェットの解説
          </a>
          <a className="font-medium text-staf hover:text-staf-dark" href={CONTACT_URL}>
            お問い合わせ
          </a>
        </div>
      </div>
    </footer>
  );
}
