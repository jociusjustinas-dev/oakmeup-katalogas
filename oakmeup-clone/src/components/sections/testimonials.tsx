import { Card } from "@/components/ui/card";

const testimonials = [
  {
    quote:
      "Nuo pirmo skambučio iki galutinio priėmimo - viskas buvo aišku. Žinojome kainą, terminus ir kas bus daroma.",
    name: "Rūta ir Tomas",
    detail: "Eglutė · 85 m² · Vilnius",
  },
  {
    quote:
      "Ieškojome meistro patys, bet su Oak Me Up viskas supaprastėjo. Viena kaina, vienas kontaktas. Grindys atrodo nuostabiai.",
    name: "Andrius K.",
    detail: "Chevron · 62 m² · Vilnius",
  },
  {
    quote:
      "Padėjo išsirinkti tinkamą atspalvį pagal interjerą. Apdaila alyva vietoje - galutinis rezultatas pranoko lūkesčius.",
    name: "Laura M.",
    detail: "Parketlentės · 95 m² · Kaunas",
  },
];

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="px-4 py-16 md:px-8 md:py-24">
      <div className="mx-auto w-full max-w-[1320px]">
        <h2 className="text-center text-3xl tracking-tight md:text-5xl">Kodėl klientai renkasi Oak Me Up</h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-zinc-600">
          Kiekvienas projektas individualus, bet visus klientus sieja vienas dalykas - aiškus procesas ir rezultatas be streso.
        </p>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {testimonials.map((item) => (
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
