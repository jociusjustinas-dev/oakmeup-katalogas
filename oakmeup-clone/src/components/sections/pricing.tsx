import { Card } from "@/components/ui/card";

const plans = [
  {
    name: "Parketlentės",
    price: "Nuo €95/m²",
    items: ["Pagrindo paruošimas", "STAUF klijai", "Montavimas", "Osmo apdaila"],
  },
  {
    name: "Eglutė / Chevron",
    price: "Nuo €115/m²",
    items: ["Pagrindo paruošimas", "STAUF klijai", "Montavimas", "Osmo apdaila"],
    highlight: true,
  },
  {
    name: "Versalio panelės",
    price: "Nuo €195/m²",
    items: ["Pagrindo paruošimas", "STAUF klijai", "Montavimas", "Osmo apdaila"],
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="bg-brand-dark px-4 py-16 text-white md:px-8 md:py-24">
      <div className="mx-auto w-full max-w-[1320px]">
        <h2 className="text-3xl tracking-tight md:text-5xl">Montavimas iki rakto - viena kaina</h2>
        <p className="mt-4 max-w-3xl text-white/75">
          Atsiųsime detalią sąmatą su kainomis. Nemokama ir neįpareigoja.
        </p>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`rounded-2xl p-6 ${plan.highlight ? "border-brand-accent bg-brand-accent text-brand-dark" : "border-white/15 bg-white/5 text-white"}`}
            >
              <h3 className="text-xl">{plan.name}</h3>
              <p className="mt-2 text-3xl tracking-tight">{plan.price}</p>
              <ul className={`mt-4 space-y-2 text-sm ${plan.highlight ? "text-brand-dark/90" : "text-white/80"}`}>
                {plan.items.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
        <p className="mt-5 text-sm text-white/70">Kainos su PVM</p>
      </div>
    </section>
  );
}
