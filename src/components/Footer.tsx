import { villa } from "@/lib/content";

export function Footer() {
  return (
    <footer className="border-t border-line bg-paper">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-10 text-sm text-ink-soft md:flex-row md:items-center md:justify-between md:px-8">
        <p className="font-serif text-xl text-ink">{villa.name}</p>
        <p>Private holiday home · Matohanci, Rovinj, Istria</p>
        <p>© 2026</p>
      </div>
    </footer>
  );
}
