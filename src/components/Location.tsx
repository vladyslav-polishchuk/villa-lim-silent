import type { Dictionary } from "@/dictionaries/en";
import { villa } from "@/lib/content";
import type { Locale } from "@/lib/i18n";

const { lat, lng } = villa.coordinates;
const { name: placeName, featureId, url: mapsLink } = villa.mapsPlace;
const mapsEmbedSrc = (lang: Locale) =>
  `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d100000!2d${lng}!3d${lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s${encodeURIComponent(featureId)}!2s${encodeURIComponent(placeName)}!5e0!3m2!1s${lang}!2shr`;

export function Location({ lang, t }: { lang: Locale; t: Dictionary["location"] }) {
  return (
    <section id="location" className="bg-cream">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-20 md:grid-cols-[1fr_1.2fr] md:px-8 md:py-24">
        <div>
          <p className="text-xs tracking-[0.28em] text-gold-deep uppercase">
            {t.eyebrow}
          </p>
          <h2 className="mt-3 font-serif text-4xl md:text-5xl">
            {t.title}
          </h2>
          <p className="mt-5 leading-8 text-ink-soft">
            {t.intro}
          </p>
          <ul className="mt-8 space-y-3">
            {t.distances.map((item) => (
              <li
                key={item.label}
                className="flex justify-between border-b border-line py-3"
              >
                <span>{item.label}</span>
                <span className="text-ink-soft">{item.value}</span>
              </li>
            ))}
          </ul>
          <a
            href={mapsLink}
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-block text-sm tracking-wide text-gold-deep underline-offset-4 hover:underline"
          >
            {t.openMaps}
          </a>
        </div>
        <div className="min-h-[360px] overflow-hidden rounded-3xl">
          <iframe
            title={t.mapTitle}
            className="h-full min-h-[360px] w-full border-0"
            src={mapsEmbedSrc(lang)}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
      </div>
    </section>
  );
}
