import type { Dictionary } from "@/dictionaries/en";
import { FeatureList } from "@/components/FeatureList";

export function Amenities({ t }: { t: Dictionary["amenities"] }) {
  return (
    <section className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-24">
      <p className="text-xs tracking-[0.28em] text-gold-deep uppercase">{t.eyebrow}</p>
      <h2 className="mt-3 font-serif text-4xl md:text-5xl">{t.title}</h2>
      <div className="mt-12 grid gap-10 md:grid-cols-3">
        {t.groups.map((group) => (
          <div key={group.title}>
            <h3 className="border-b border-line pb-3 font-serif text-2xl">
              {group.title}
            </h3>
            <div className="mt-5">
              <FeatureList items={group.items} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
