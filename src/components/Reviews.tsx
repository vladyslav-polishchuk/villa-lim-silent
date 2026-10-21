import { reviews, villa } from "@/lib/content";

export function Reviews() {
  return (
    <section id="reviews" className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-24">
      <p className="text-xs tracking-[0.28em] text-gold-deep uppercase">
        Shared moments
      </p>
      <h2 className="mt-3 font-serif text-4xl md:text-5xl">
        {villa.rating} from {villa.reviewCount} guest reviews
      </h2>
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {reviews.map((review) => (
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
