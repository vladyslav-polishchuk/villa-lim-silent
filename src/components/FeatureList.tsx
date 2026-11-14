import { featureIconPaths, type Feature } from "@/lib/features";

export function FeatureList({ items }: { items: Feature[] }) {
  return (
    <ul className="space-y-3 text-ink-soft">
      {items.map(({ icon, label }) => (
        <li key={label} className="flex items-start gap-3">
          <span className="grid size-8 shrink-0 place-items-center rounded-xl border border-gold/20 bg-gold/5 text-gold-deep">
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              focusable="false"
              className="size-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d={featureIconPaths[icon]} />
            </svg>
          </span>
          <span className="min-w-0 py-1 leading-6">{label}</span>
        </li>
      ))}
    </ul>
  );
}
