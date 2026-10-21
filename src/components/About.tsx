import Image from "next/image";
import type { Dictionary } from "@/dictionaries/en";
import { villa } from "@/lib/content";

export function About({ t }: { t: Dictionary["about"] }) {
  return (
    <section id="stay" className="mx-auto grid max-w-6xl gap-12 px-5 py-20 md:grid-cols-2 md:px-8 md:py-28">
      <div>
        <p className="text-xs tracking-[0.28em] text-gold-deep uppercase">
          {t.eyebrow}
        </p>
        <h2 className="mt-3 font-serif text-4xl md:text-5xl">{t.title}</h2>
        <div className="mt-8 space-y-5 text-lg leading-8 text-ink-soft">
          {t.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <dl className="mt-10 grid grid-cols-2 gap-6 text-sm">
          <div>
            <dt className="tracking-[0.18em] text-gold-deep uppercase">{t.livingArea}</dt>
            <dd className="mt-1 font-serif text-2xl">{villa.livingArea} m²</dd>
          </div>
          <div>
            <dt className="tracking-[0.18em] text-gold-deep uppercase">{t.garden}</dt>
            <dd className="mt-1 font-serif text-2xl">{villa.plotArea} m²</dd>
          </div>
          <div>
            <dt className="tracking-[0.18em] text-gold-deep uppercase">{t.checkIn}</dt>
            <dd className="mt-1 font-serif text-2xl">{villa.checkIn}</dd>
          </div>
          <div>
            <dt className="tracking-[0.18em] text-gold-deep uppercase">{t.checkOut}</dt>
            <dd className="mt-1 font-serif text-2xl">{villa.checkOut}</dd>
          </div>
        </dl>
      </div>
      <div className="grid gap-4">
        <div className="relative min-h-[280px] overflow-hidden rounded-3xl">
          <Image
            src="/sections/house-1.jpg"
            alt={t.images.pool}
            fill
            sizes="(min-width: 768px) 560px, 100vw"
            className="object-cover"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="relative min-h-[180px] overflow-hidden rounded-3xl">
            <Image
              src="/sections/house-2.jpg"
              alt={t.images.dining}
              fill
              sizes="(min-width: 768px) 280px, 50vw"
              className="object-cover"
            />
          </div>
          <div className="relative min-h-[180px] overflow-hidden rounded-3xl">
            <Image
              src="/sections/house-3.jpg"
              alt={t.images.living}
              fill
              sizes="(min-width: 768px) 280px, 50vw"
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
