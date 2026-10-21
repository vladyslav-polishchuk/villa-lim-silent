"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { gallery } from "@/lib/content";

export function Gallery() {
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    if (active === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActive(null);
      if (event.key === "ArrowRight") {
        setActive((i) => (i === null ? i : (i + 1) % gallery.length));
      }
      if (event.key === "ArrowLeft") {
        setActive((i) =>
          i === null ? i : (i - 1 + gallery.length) % gallery.length,
        );
      }
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
          {gallery.map((image, index) => (
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
                className="object-cover transition duration-500 hover:scale-105"
              />
            </button>
          ))}
        </div>
      </div>
      {active !== null ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/90 p-4"
          onClick={() => setActive(null)}
        >
          <div className="relative h-[80vh] w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
            <Image
              src={gallery[active].src}
              alt={gallery[active].alt}
              fill
              className="object-contain"
            />
            <button
              type="button"
              className="absolute top-0 right-0 rounded-full bg-white/10 px-4 py-2 text-white"
              onClick={() => setActive(null)}
            >
              Close
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
