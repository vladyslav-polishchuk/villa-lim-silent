import { distances } from "@/lib/content";

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
        </div>
        <div className="min-h-[360px] overflow-hidden rounded-3xl">
          <iframe
            title="Map of Matohanci near Rovinj"
            className="h-full min-h-[360px] w-full border-0"
            src="https://www.openstreetmap.org/export/embed.html?bbox=13.70%2C45.10%2C13.85%2C45.18&layer=mapnik&marker=45.145%2C13.755"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
}
