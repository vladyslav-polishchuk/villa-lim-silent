export const locales = ["en", "hr", "de"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export const localeNames: Record<Locale, string> = {
  en: "English",
  hr: "Hrvatski",
  de: "Deutsch",
};

export const intlLocales: Record<Locale, string> = {
  en: "en-GB",
  hr: "hr-HR",
  de: "de-DE",
};

export const hasLocale = (value: string): value is Locale =>
  (locales as readonly string[]).includes(value);

export type PluralForms = { one: string; few?: string; other: string };

export function plural(locale: Locale, count: number, forms: PluralForms) {
  const category = new Intl.PluralRules(intlLocales[locale]).select(count);
  if (category === "one") return forms.one;
  if (category === "few" && forms.few) return forms.few;
  return forms.other;
}

export function fill(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}
