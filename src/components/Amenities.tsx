import { amenityGroups } from "@/lib/content";

export function Amenities() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-24">
      <p className="text-xs tracking-[0.28em] text-gold-deep uppercase">Comforts</p>
      <h2 className="mt-3 font-serif text-4xl md:text-5xl">What is included</h2>
      <div className="mt-12 grid gap-10 md:grid-cols-3">
        {amenityGroups.map((group) => (
          <div key={group.title}>
            <h3 className="border-b border-line pb-3 font-serif text-2xl">
              {group.title}
            </h3>
            <ul className="mt-5 space-y-2 text-ink-soft">
              {group.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
