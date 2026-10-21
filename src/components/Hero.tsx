import Image from "next/image";
import { villa } from "@/lib/content";

export function Hero() {
  return (
    <section id="top" className="relative min-h-[92vh]">
      <Image
        src="/sections/hero.jpg"
        alt="Villa Lim Silent with heated pool at dusk"
        fill
        priority
        className="object-cover"
      />
      <div className="absolute inset-0 bg-linear-to-t from-ink via-ink/35 to-ink/25" />
      <div className="relative mx-auto flex min-h-[92vh] max-w-6xl flex-col justify-end px-5 pb-16 md:px-8 md:pb-20">
        <p className="mb-3 flex items-center gap-3 text-sm tracking-[0.22em] text-gold uppercase">
          <span>★ {villa.rating}</span>
          <span className="h-px w-8 bg-gold/70" />
          <span>
            {villa.location}, {villa.country}
          </span>
        </p>
        <h1 className="max-w-3xl font-serif text-5xl leading-tight font-medium text-white md:text-7xl">
          {villa.name}
        </h1>
        <p className="mt-4 max-w-xl text-lg text-white/80">
          A quiet contemporary villa for six, with a private heated pool, an
          enclosed garden, and Lim Bay a short drive away.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href="#gallery"
            className="rounded-full border border-white/40 bg-white/10 px-5 py-3 text-sm text-white backdrop-blur hover:bg-white/20"
          >
            View gallery
          </a>
          <a
            href="#enquire"
            className="rounded-full bg-gold px-5 py-3 text-sm text-ink hover:bg-white"
          >
            Check availability
          </a>
        </div>
      </div>
    </section>
  );
}
