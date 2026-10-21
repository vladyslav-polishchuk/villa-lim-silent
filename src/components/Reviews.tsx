import type { Dictionary } from "@/dictionaries/en";
import { formatRating, villa } from "@/lib/content";
import { fill, intlLocales, type Locale } from "@/lib/i18n";
import { reviews } from "@/lib/reviews";
import { ReviewsCarousel } from "./ReviewsCarousel";

export function Reviews({ lang, t }: { lang: Locale; t: Dictionary["reviews"] }) {
  const monthFormat = new Intl.DateTimeFormat(intlLocales[lang], { month: "long", year: "numeric" });
  const items = reviews.map((review) => ({
    ...review,
    date: monthFormat.format(new Date(`${review.month}-15T12:00:00`)),
  }));

  return (
    <section id="reviews" className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-24">
      <p className="text-xs tracking-[0.28em] text-gold-deep uppercase">
        {t.eyebrow}
      </p>
      <h2 className="mt-3 font-serif text-4xl md:text-5xl">
        {fill(t.title, { rating: formatRating(villa.rating, lang), count: villa.reviewCount })}
      </h2>
      <ReviewsCarousel items={items} t={t} />
    </section>
  );
}
