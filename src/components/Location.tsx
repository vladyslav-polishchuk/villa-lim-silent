import { distances, villa } from "@/lib/content";

const { lat, lng } = villa.coordinates;
const { name: placeName, featureId, url: mapsLink } = villa.mapsPlace;
const mapsEmbedSrc = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d12000!2d${lng}!3d${lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s${encodeURIComponent(featureId)}!2s${encodeURIComponent(placeName)}!5e0!3m2!1sen!2shr`;

export function Location() {
  return (
    <section id="location" className="bg-cream">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-20 md:grid-cols-[1fr_1.2fr] md:px-8 md:py-24">
        <div>
          <p className="text-xs tracking-[0.28em] text-gold-deep uppercase">
            On the map
          </p>
          <h2 className="mt-3 font-serif text-4xl md:text-5xl">
            Matohanci, near Rovinj
          </h2>
          <p className="mt-5 leading-8 text-ink-soft">
            A quiet, green village with car access and a fully private garden.
            Lim Bay is the nearest swimming water; Rovinj is an easy evening
            trip. Nearby: cycling, diving, tennis, and horseback riding.
          </p>
          <ul className="mt-8 space-y-3">
            {distances.map((item) => (
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
            Open in Google Maps
          </a>
        </div>
        <div className="min-h-[360px] overflow-hidden rounded-3xl">
          <iframe
            title="Google Map of Villa Lim Silent"
            className="h-full min-h-[360px] w-full border-0"
            src={mapsEmbedSrc}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
      </div>
    </section>
  );
}
