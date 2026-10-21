"use client";

import { useEffect, useRef, useState } from "react";
import type { Dictionary } from "@/dictionaries/en";
import type { Review } from "@/lib/reviews";

const CLAMP_THRESHOLD = 320;

type Item = Review & { date: string };

function ReviewCard({ review, t }: { review: Item; t: Dictionary["reviews"] }) {
  const [expanded, setExpanded] = useState(false);
  const long = review.text.length > CLAMP_THRESHOLD;

  return (
    <blockquote className="flex h-full flex-col rounded-3xl border border-line bg-cream p-8">
      <p className="text-gold" aria-label={`${review.rating} / 5`}>
        {"★".repeat(review.rating)}
      </p>
      <p
        className={`mt-4 flex-1 leading-7 whitespace-pre-line text-ink-soft ${
          long ? (expanded ? "max-h-[28rem] overflow-y-auto pr-2" : "line-clamp-7") : ""
        }`}
      >
        “{review.text}”
      </p>
      {long ? (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          aria-expanded={expanded}
          className="mt-3 self-start text-sm text-gold-deep underline-offset-4 hover:underline"
        >
          {expanded ? t.showLess : t.readMore}
        </button>
      ) : null}
      <footer className="mt-6 text-sm">
        <cite className="not-italic font-medium">{review.name}</cite>
        <span className="block text-ink-soft">{review.date}</span>
      </footer>
    </blockquote>
  );
}

export function ReviewsCarousel({ items, t }: { items: Item[]; t: Dictionary["reviews"] }) {
  const track = useRef<HTMLUListElement>(null);
  const [position, setPosition] = useState({ first: 0, last: 0 });

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const update = () => {
      const slides = Array.from(el.children) as HTMLElement[];
      const left = el.scrollLeft;
      const right = left + el.clientWidth;
      const visible = slides
        .map((slide, index) => ({ index, start: slide.offsetLeft, end: slide.offsetLeft + slide.offsetWidth }))
        .filter((s) => s.start >= left - 2 && s.end <= right + 2)
        .map((s) => s.index);
      if (visible.length) setPosition({ first: visible[0], last: visible[visible.length - 1] });
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const scrollBy = (direction: 1 | -1) => {
    const el = track.current;
    const slide = el?.firstElementChild as HTMLElement | null;
    if (!el || !slide) return;
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
    el.scrollBy({ left: direction * (slide.offsetWidth + gap), behavior: "smooth" });
  };

  const atStart = position.first === 0;
  const atEnd = position.last >= items.length - 1;

  return (
    <div className="mt-12">
      <ul
        ref={track}
        aria-label={t.carouselLabel}
        className="relative -mx-5 flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-px-5 px-5 pb-4 [scrollbar-width:none] md:mx-0 md:scroll-px-0 md:px-0 [&::-webkit-scrollbar]:hidden"
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") scrollBy(1);
          if (event.key === "ArrowLeft") scrollBy(-1);
        }}
        tabIndex={0}
      >
        {items.map((review, index) => (
          <li
            key={`${review.name}-${review.month}`}
            aria-roledescription="slide"
            aria-label={`${index + 1} / ${items.length}`}
            className="w-[85%] shrink-0 snap-start sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)]"
          >
            <ReviewCard review={review} t={t} />
          </li>
        ))}
      </ul>
      <div className="mt-6 flex items-center justify-between gap-4">
        <p className="text-sm text-ink-soft" aria-live="polite">
          {position.first === position.last
            ? position.first + 1
            : `${position.first + 1}–${position.last + 1}`}{" "}
          / {items.length}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            aria-label={t.previous}
            onClick={() => scrollBy(-1)}
            disabled={atStart}
            className="rounded-full border border-line px-4 py-2 text-lg leading-none hover:bg-cream disabled:opacity-40 disabled:hover:bg-transparent"
          >
            ‹
          </button>
          <button
            type="button"
            aria-label={t.next}
            onClick={() => scrollBy(1)}
            disabled={atEnd}
            className="rounded-full border border-line px-4 py-2 text-lg leading-none hover:bg-cream disabled:opacity-40 disabled:hover:bg-transparent"
          >
            ›
          </button>
        </div>
      </div>
    </div>
  );
}
