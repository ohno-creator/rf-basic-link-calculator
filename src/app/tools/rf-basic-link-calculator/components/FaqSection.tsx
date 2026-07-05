import { Accordion } from "@/components/Accordion";
import { faqItems } from "@/data/faq";

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
    </section>
  );
}
