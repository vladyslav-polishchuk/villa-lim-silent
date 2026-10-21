import type { Dictionary } from "@/dictionaries/en";

export function Highlights({ items }: { items: Dictionary["highlights"] }) {
  return (
    <section className="bg-ink text-cream">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-px border-t border-gold/30 md:grid-cols-4">
        {items.map((item) => (
          <div key={item.label} className="px-6 py-8 md:px-8">
            <p className="text-xs tracking-[0.22em] text-gold uppercase">
              {item.label}
            </p>
            <p className="mt-2 font-serif text-2xl">{item.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
