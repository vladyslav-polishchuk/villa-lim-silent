import type { Dictionary } from "@/dictionaries/en";

// Shown in place of the price table and request form while the prices load from the sheet
// ("loading"), or when they could not be fetched ("failed"). Same section shell as <Enquiry>.
export function EnquiryStatus({
  status,
  t,
}: {
  status: "loading" | "failed";
  t: Dictionary["enquiry"];
}) {
  return (
    <section id="enquire" className="bg-ink text-cream">
      <div className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-24">
        <p className="text-xs tracking-[0.28em] text-gold uppercase">{t.eyebrow}</p>
        <h2 className="mt-3 font-serif text-4xl text-white md:text-5xl">{t.title}</h2>

        {status === "loading" ? (
          <div role="status" aria-live="polite" className="mt-10 max-w-xl">
            <p className="text-white/70">{t.pricesLoading}</p>
            <div aria-hidden="true" className="mt-6 grid animate-pulse gap-3">
              {Array.from({ length: 5 }, (_, i) => (
                <div key={i} className="h-10 rounded-xl bg-white/10" />
              ))}
            </div>
          </div>
        ) : (
          <div role="alert" className="mt-10 max-w-xl rounded-2xl border border-white/10 bg-white/5 p-8">
            <p className="font-serif text-2xl text-white">{t.pricesFailedTitle}</p>
            <p className="mt-3 leading-7 text-white/70">{t.pricesFailed}</p>
          </div>
        )}
      </div>
    </section>
  );
}
