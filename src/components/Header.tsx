"use client";

import { useState } from "react";

const links = [
  { href: "#stay", label: "Stay" },
  { href: "#rooms", label: "Rooms" },
  { href: "#gallery", label: "Gallery" },
  { href: "#reviews", label: "Reviews" },
  { href: "#location", label: "Location" },
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="absolute inset-x-0 top-0 z-40">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 md:px-8">
        <a href="#top" className="text-white">
          <span className="block font-serif text-xl tracking-[0.18em] uppercase">
            Villa Lim Silent
          </span>
          <span className="mt-0.5 block text-[11px] tracking-[0.28em] text-white/70 uppercase">
            Rovinj · Istria
          </span>
        </a>
        <nav className="hidden items-center gap-8 text-sm tracking-wide text-white/85 lg:flex">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="hover:text-white">
              {link.label}
            </a>
          ))}
          <a
            href="#enquire"
            className="rounded-full bg-gold px-5 py-2.5 text-ink hover:bg-white"
          >
            Enquire
          </a>
        </nav>
        <button
          type="button"
          className="rounded-md border border-white/30 p-2 text-white lg:hidden"
          aria-expanded={open}
          aria-label="Open menu"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="block h-0.5 w-5 bg-current" />
          <span className="mt-1.5 block h-0.5 w-5 bg-current" />
        </button>
      </div>
      {open ? (
        <div className="mx-5 rounded-2xl bg-ink/95 p-6 text-white backdrop-blur lg:hidden">
          <div className="flex flex-col gap-4 text-lg">
            {links.map((link) => (
              <a key={link.href} href={link.href} onClick={() => setOpen(false)}>
                {link.label}
              </a>
            ))}
            <a
              href="#enquire"
              className="mt-2 rounded-full bg-gold px-5 py-3 text-center text-ink"
              onClick={() => setOpen(false)}
            >
              Enquire
            </a>
          </div>
        </div>
      ) : null}
    </header>
  );
}
