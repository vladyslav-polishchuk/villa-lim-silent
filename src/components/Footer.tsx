import type { Dictionary } from "@/dictionaries/en";
import { villa } from "@/lib/content";

export function Footer({ t }: { t: Dictionary["footer"] }) {
  return (
    <footer className="border-t border-line bg-paper">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-10 text-sm text-ink-soft md:flex-row md:items-center md:justify-between md:px-8">
        <p className="font-serif text-xl text-ink">{villa.name}</p>
        <p>{t.tagline}</p>
        <div className="space-y-1 md:text-right">
          <p>© 2026</p>
          <p>
            {t.credit}{" "}
            <a
              href="https://vladpolishchuk.com"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-ink underline decoration-gold underline-offset-4 hover:decoration-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            >
              Vlad Polishchuk
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
