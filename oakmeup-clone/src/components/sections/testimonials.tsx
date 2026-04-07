import { Card } from "@/components/ui/card";

const projects = [
  {
    quote: "Eglutė, 85 m², Vilnius - aiškus procesas nuo sąmatos iki pilno įrengimo.",
    name: "Rūta ir Tomas",
    detail: "Sumontuota per 6 darbo dienas",
  },
  {
    quote: "Chevron, 62 m², Vilnius - viena komanda, viena kaina, rezultatas be streso.",
    name: "Andrius K.",
    detail: "UFH protokolas + Osmo apdaila",
  },
  {
    quote: "Parketlentės, 95 m², Kaunas - spalva suderinta pagal interjerą, galutinis vaizdas premium.",
    name: "Laura M.",
    detail: "Paruošimas + montavimas iki rakto",
  },
];

export function TestimonialsSection() {
  return (
    <section id="projektai" className="px-4 py-16 md:px-8 md:py-24">
      <div className="mx-auto w-full max-w-[1320px]">
        <h2 className="text-center text-3xl tracking-tight md:text-5xl">Mūsų įgyvendinti projektai</h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-zinc-600">
          Kiekvienos grindys - individualus projektas. Štai keli mūsų atliktų darbų pavyzdžiai.
        </p>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {projects.map((item) => (
            <Card key={item.name} className="rounded-2xl bg-white p-6">
              <p className="text-4xl leading-none text-brand-accent">“</p>
              <p className="mt-3 text-sm leading-6 text-zinc-700">{item.quote}</p>
              <div className="mt-5 border-t border-zinc-200 pt-4">
                <p className="font-medium">{item.name}</p>
                <p className="text-xs text-zinc-500">{item.detail}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
