import { Separator } from "@/components/ui/separator";

export function Footer() {
  return (
    <footer id="footer" className="bg-brand-dark px-4 py-14 text-white md:px-8">
      <div className="mx-auto flex w-full max-w-[1320px] flex-col gap-10">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-1">
            <p className="text-2xl">Oak Me Up</p>
            <p className="mt-3 max-w-sm text-sm text-white/65">
              Inžinerinės ąžuolo grindys su montavimu iki rakto - viena kaina, vienas kontaktas, viena garantija.
            </p>
            <div className="mt-4 space-y-1 text-sm text-brand-accent">
              <a className="block" href="tel:+37061569962">
                +370 615 69 962
              </a>
              <a className="block" href="mailto:edgaras@oakmeup.lt">
                edgaras@oakmeup.lt
              </a>
            </div>
          </div>
          <div className="space-y-2 text-sm text-white/75">
            <p className="text-white">Kolekcijos</p>
            <p>Eglutė</p>
            <p>V formos eglutė</p>
            <p>Versalio panelės</p>
            <p>Parketlentės</p>
          </div>
          <div className="space-y-2 text-sm text-white/75">
            <p className="text-white">Paslaugos</p>
            <p>Montavimas iki rakto</p>
            <p>Projektai</p>
            <p>Kodėl Oak Me Up</p>
          </div>
          <div className="space-y-2 text-sm text-white/75">
            <p className="text-white">Informacija</p>
            <p>Kontaktai</p>
            <p>DUK</p>
            <p>Privatumo politika</p>
          </div>
        </div>
        <Separator className="bg-white/20" />
        <div className="flex flex-col gap-3 text-xs text-white/60 md:flex-row md:items-center md:justify-between">
          <p>© 2025 Oak Me Up (Pikantišumas MB). Visos teisės saugomos.</p>
          <p>2 m. darbų garantija • 15 m. gamintojo garantija • Osmo • STAUF</p>
        </div>
      </div>
    </footer>
  );
}
