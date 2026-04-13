import { Card } from "@/components/ui/card";

const collections = [
  {
    title: "Eglutė",
    details: "2 dydžiai • Be apdailos / su apdaila",
    desc: "Dažniausias pasirinkimas butams ir namams, kai norisi klasikos.",
    floorPrice: "nuo €59/m²",
    installPrice: "nuo €102/m²",
  },
  {
    title: "V formos eglutė",
    details: "2 dydžiai • Be apdailos / su apdaila",
    desc: "Kai norisi ryškaus rašto ir premium įspūdžio - svetainėms, holams.",
    floorPrice: "nuo €82/m²",
    installPrice: "nuo €126/m²",
  },
  {
    title: "Versalio panelės",
    details: "2 dydžiai • Be apdailos / su apdaila",
    desc: "Didelėms erdvėms ir reprezentacinėms patalpoms - ryškus interjero akcentas.",
    floorPrice: "nuo €124/m²",
    installPrice: "nuo €168/m²",
  },
  {
    title: "Parketlentės",
    details: "5 dydžiai • Be apdailos / su apdaila",
    desc: "Minimalistiniams interjerams ir didesnėms patalpoms.",
    floorPrice: "nuo €48/m²",
    installPrice: "nuo €82/m²",
  },
];

export function FeaturesSection() {
  return (
    <section id="kolekcija" className="px-4 py-16 md:px-8 md:py-24">
      <div className="mx-auto w-full max-w-[1320px]">
        <h2 className="text-3xl tracking-tight md:text-5xl">Atrinktos ąžuolo grindys - lengva išsirinkti</h2>
        <p className="mt-4 max-w-3xl text-zinc-600">
          Mažiau pasirinkimų, bet teisingi: aiški struktūra, aiškūs parametrai, aiškūs terminai.
        </p>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {collections.map((item) => (
            <Card key={item.title} className="rounded-2xl bg-white p-6">
              <p className="text-xs uppercase tracking-wider text-zinc-500">{item.details}</p>
              <h3 className="mt-2 text-2xl">{item.title}</h3>
              <p className="mt-2 text-sm text-zinc-600">{item.desc}</p>
              <div className="mt-5 space-y-1 text-sm">
                <p>
                  <span className="text-zinc-500">Tik grindys:</span> {item.floorPrice}
                </p>
                <p>
                  <span className="text-zinc-500">Su montavimu ir medžiagomis:</span> {item.installPrice}
                </p>
              </div>
            </Card>
          ))}
        </div>
        <p className="mt-6 text-sm text-zinc-500">
          Visos kainos su PVM · Montavimo kaina apima: pagrindo patikrinimą, STAUF klijus, Osmo apdailą ir grindjuosčių montavimą.
        </p>
      </div>
    </section>
  );
}
