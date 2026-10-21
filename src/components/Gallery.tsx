"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { gallery } from "@/lib/content";

const PREVIEW_COUNT = 9;

const step = (index: number | null, delta: number) =>
  index === null ? index : (index + delta + gallery.length) % gallery.length;

export function Gallery() {
  const [active, setActive] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? gallery : gallery.slice(0, PREVIEW_COUNT);

  const showNext = () => setActive((i) => step(i, 1));
  const showPrevious = () => setActive((i) => step(i, -1));

  useEffect(() => {
    if (active === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActive(null);
      if (event.key === "ArrowRight") setActive((i) => step(i, 1));
      if (event.key === "ArrowLeft") setActive((i) => step(i, -1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);

  return (
    <section id="gallery" className="bg-ink py-20 text-cream md:py-24">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <p className="text-xs tracking-[0.28em] text-gold uppercase">Images</p>
        <h2 className="mt-3 font-serif text-4xl text-white md:text-5xl">Gallery</h2>
        <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3">
          {visible.map((image, index) => (
            <button
              key={image.src}
              type="button"
              onClick={() => setActive(index)}
              className={`relative overflow-hidden rounded-2xl ${
                index === 0 ? "col-span-2 min-h-[240px] md:min-h-[320px]" : "min-h-[160px] md:min-h-[200px]"
              }`}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes={
                  index === 0
                    ? "(min-width: 1152px) 760px, (min-width: 768px) 66vw, 100vw"
                    : "(min-width: 1152px) 380px, (min-width: 768px) 33vw, 50vw"
                }
                className="object-cover transition duration-500 hover:scale-105"
              />
            </button>
          ))}
        </div>
        {gallery.length > PREVIEW_COUNT ? (
          <div className="mt-10 flex justify-center">
            <button
              type="button"
              onClick={() => setShowAll((value) => !value)}
              className="rounded-full border border-white/40 bg-white/10 px-5 py-3 text-sm text-white hover:bg-white/20"
            >
              {showAll ? "Show fewer photos" : `Show all ${gallery.length} photos`}
            </button>
          </div>
        ) : null}
      </div>
      {active !== null ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/90 p-4"
          onClick={() => setActive(null)}
        >
          <div className="relative h-[80vh] w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
            <Image
              key={gallery[active].src}
              src={gallery[active].src}
              alt={gallery[active].alt}
              fill
              sizes="(min-width: 1024px) 1024px, 100vw"
              quality={90}
              className="object-contain"
            />
            <button
              type="button"
              className="absolute top-0 right-0 rounded-full bg-white/10 px-4 py-2 text-white"
              onClick={() => setActive(null)}
            >
              Close
            </button>
            <button
              type="button"
              aria-label="Previous photo"
              className="absolute top-1/2 left-0 -translate-y-1/2 rounded-full bg-white/10 px-4 py-3 text-white hover:bg-white/20"
              onClick={showPrevious}
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Next photo"
              className="absolute top-1/2 right-0 -translate-y-1/2 rounded-full bg-white/10 px-4 py-3 text-white hover:bg-white/20"
              onClick={showNext}
            >
              ›
            </button>
            <p className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full bg-ink/60 px-4 py-1 text-sm text-white/80">
              {active + 1} / {gallery.length}
            </p>
          </div>
        </div>
      ) : null}
    </section>
  );
}
