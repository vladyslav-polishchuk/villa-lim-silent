import type { Dictionary } from "@/dictionaries/en";
import { formatRating, villa } from "@/lib/content";
import { fill, type Locale } from "@/lib/i18n";

export function Reviews({ lang, t }: { lang: Locale; t: Dictionary["reviews"] }) {
  return (
    <section id="reviews" className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-24">
      <p className="text-xs tracking-[0.28em] text-gold-deep uppercase">
        {t.eyebrow}
      </p>
      <h2 className="mt-3 font-serif text-4xl md:text-5xl">
        {fill(t.title, { rating: formatRating(villa.rating, lang), count: villa.reviewCount })}
      </h2>
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {t.items.map((review) => (
          <blockquote
            key={review.name}
            className="flex flex-col rounded-3xl border border-line bg-cream p-8"
          >
            <p className="text-gold">★★★★★</p>
            <p className="mt-4 flex-1 leading-7 text-ink-soft">“{review.text}”</p>
            <footer className="mt-6 text-sm">
              <cite className="not-italic font-medium">{review.name}</cite>
              <span className="block text-ink-soft">{review.date}</span>
            </footer>
          </blockquote>
        ))}
      </div>
    </section>
  );
}
