import "server-only";
import type { Locale } from "@/lib/i18n";
import type { Dictionary } from "./en";

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  en: () => import("./en").then((m) => m.en),
  hr: () => import("./hr").then((m) => m.hr),
  de: () => import("./de").then((m) => m.de),
};

export const getDictionary = (locale: Locale) => dictionaries[locale]();

export type { Dictionary };
