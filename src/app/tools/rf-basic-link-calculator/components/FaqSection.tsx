import { Accordion } from "@/components/Accordion";
import { faqItems } from "@/data/faq";
import { CONTACT_URL } from "@/lib/rf/presets";

export function FaqSection() {
  return (
    <section className="mx-auto mt-16 max-w-5xl px-4 sm:px-6 lg:px-8">
      <div className="mb-6 text-center">
        <p className="text-sm font-semibold text-staf-dark">FAQ</p>
        <h2 className="mt-2 text-2xl font-bold text-slate-950">よくある質問</h2>
      </div>
      <div className="space-y-3">
        {faqItems.map((item) => (
          <Accordion key={item.question} title={item.question}>
            <p>{item.answer}</p>
          </Accordion>
        ))}
      </div>
      <div className="mt-6 rounded-lg border border-staf/20 bg-staf-light p-5 text-center">
        <p className="text-sm text-slate-700">
          条件が固まりきっていない段階でも、アンテナ配置や実機評価の進め方を相談できます。
        </p>
        <a
          className="mt-4 inline-flex rounded-md bg-staf px-5 py-3 text-sm font-semibold text-white transition hover:bg-staf-dark"
          href={CONTACT_URL}
        >
          FAQを読んだうえで相談する
        </a>
      </div>
    </section>
  );
}
