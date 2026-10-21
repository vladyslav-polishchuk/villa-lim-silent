import { bedrooms } from "@/lib/content";

export function Rooms() {
  return (
    <section id="rooms" className="bg-cream">
      <div className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-24">
        <p className="text-xs tracking-[0.28em] text-gold-deep uppercase">Sleep</p>
        <h2 className="mt-3 font-serif text-4xl md:text-5xl">Three king bedrooms</h2>
        <p className="mt-4 max-w-2xl text-ink-soft">
          Each room sleeps two, with air conditioning and a TV. Two modern
          bathrooms with showers sit between the wings of the house.
        </p>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {bedrooms.map((room) => (
            <article
              key={room.name}
              className="rounded-3xl bg-paper p-8 shadow-[0_20px_50px_-32px_rgba(27,34,40,0.4)]"
            >
              <h3 className="font-serif text-3xl">{room.name}</h3>
              <ul className="mt-6 space-y-2 text-ink-soft">
                {room.details.map((detail) => (
                  <li key={detail} className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-gold" />
                    {detail}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
