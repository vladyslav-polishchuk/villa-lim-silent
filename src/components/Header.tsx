"use client";

import Link from "next/link";
import { useState } from "react";
import type { Dictionary } from "@/dictionaries/en";
import { localeNames, locales, type Locale } from "@/lib/i18n";

const sections = ["stay", "rooms", "gallery", "reviews", "location", "contact"] as const;

function LanguageSwitcher({
  lang,
  label,
  onSelect,
}: {
  lang: Locale;
  label: string;
  onSelect?: () => void;
}) {
  return (
    <div role="group" aria-label={label} className="flex items-center gap-1 text-xs tracking-[0.18em] uppercase">
      {locales.map((locale) => (
        <Link
          key={locale}
          href={`/${locale}`}
          hrefLang={locale}
          lang={locale}
          title={localeNames[locale]}
          aria-current={locale === lang ? "page" : undefined}
          onClick={onSelect}
          className={`rounded-full px-2 py-1 ${
            locale === lang ? "bg-white/15 text-white" : "text-white/60 hover:text-white"
          }`}
        >
          {locale}
        </Link>
      ))}
    </div>
  );
}

export function Header({ lang, t }: { lang: Locale; t: Dictionary["header"] }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="absolute inset-x-0 top-0 z-40">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 md:px-8">
        <a href="#top" className="text-white">
          <span className="block font-serif text-xl tracking-[0.18em] uppercase">
            Villa Lim Silent
          </span>
          <span className="mt-0.5 block text-[11px] tracking-[0.28em] text-white/70 uppercase">
            {t.tagline}
          </span>
        </a>
        <nav className="hidden items-center gap-6 text-sm tracking-wide text-white/85 xl:flex">
          {sections.map((id) => (
            <a key={id} href={`#${id}`} className="hover:text-white">
              {t.links[id]}
            </a>
          ))}
          <LanguageSwitcher lang={lang} label={t.language} />
          <a
            href="#enquire"
            className="rounded-full bg-gold px-5 py-2.5 text-ink hover:bg-white"
          >
            {t.enquire}
          </a>
        </nav>
        <button
          type="button"
          className="rounded-md border border-white/30 p-2 text-white xl:hidden"
          aria-expanded={open}
          aria-label={t.openMenu}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="block h-0.5 w-5 bg-current" />
          <span className="mt-1.5 block h-0.5 w-5 bg-current" />
        </button>
      </div>
      {open ? (
        <div className="mx-5 rounded-2xl bg-ink/95 p-6 text-white backdrop-blur xl:hidden">
          <div className="flex flex-col gap-4 text-lg">
            {sections.map((id) => (
              <a key={id} href={`#${id}`} onClick={() => setOpen(false)}>
                {t.links[id]}
              </a>
            ))}
            <LanguageSwitcher lang={lang} label={t.language} onSelect={() => setOpen(false)} />
            <a
              href="#enquire"
              className="mt-2 rounded-full bg-gold px-5 py-3 text-center text-ink"
              onClick={() => setOpen(false)}
            >
              {t.enquire}
            </a>
          </div>
        </div>
      ) : null}
    </header>
  );
}
