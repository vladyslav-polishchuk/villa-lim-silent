import Image from "next/image";
import type { Dictionary } from "@/dictionaries/en";
import { formatRating, villa } from "@/lib/content";
import type { Locale } from "@/lib/i18n";

export function Hero({ lang, t }: { lang: Locale; t: Dictionary["hero"] }) {
  return (
    <section id="top" className="relative h-svh overflow-hidden">
      <Image
        src="/sections/hero.jpg"
        alt={t.imageAlt}
        fill
        priority
        className="hero-scene object-cover"
      />
      <div className="absolute inset-0 bg-linear-to-t from-ink via-ink/35 to-ink/25" />
      <div className="relative mx-auto flex h-full max-w-6xl flex-col justify-end px-5 pb-16 md:px-8 md:pb-20">
        <p className="hero-enter mb-4 flex w-fit items-center gap-3 rounded-full border border-white/15 bg-ink/45 px-4 py-2 text-sm font-medium tracking-[0.22em] text-[color-mix(in_srgb,var(--gold)_55%,white)] uppercase backdrop-blur-md">
          <span>★ {formatRating(villa.rating, lang)}</span>
          <span className="h-px w-8 bg-current opacity-60" />
          <span>
            {villa.location}, {t.country}
          </span>
        </p>
        <h1 className="hero-enter max-w-3xl font-serif text-5xl leading-tight font-medium text-white md:text-7xl">
          {villa.name}
        </h1>
        <p className="hero-enter mt-4 max-w-xl text-lg text-white/80">
          {t.intro}
        </p>
        <div className="hero-enter mt-8 flex flex-wrap gap-3">
          <a
            href="#gallery"
            className="rounded-full border border-white/40 bg-white/10 px-5 py-3 text-sm text-white backdrop-blur hover:bg-white/20"
          >
            {t.viewGallery}
          </a>
          <a
            href="#enquire"
            className="rounded-full bg-gold px-5 py-3 text-sm text-ink hover:bg-white"
          >
            {t.checkAvailability}
          </a>
        </div>
      </div>
    </section>
  );
}
