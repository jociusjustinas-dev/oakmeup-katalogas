"use client";

import { motion } from "framer-motion";

const steps = [
  ["01", "Išsirenkate raštą ir atspalvį", "Padėsime pasirinkti iš 4 kolekcijų pagal jūsų erdvę, stilių ir biudžetą."],
  ["02", "Gausite sąmatą per 24 val.", "Aiški kaina, darbų apimtis ir terminai - viename dokumente, be paslėptų kaštų."],
  ["03", "Pamatote spalvą gyvai", "Atsiųsime mėginukus į namus prieš galutinį sprendimą."],
  ["04", "Pristatome ir sumontuojame", "Dirbame visoje Lietuvoje - Vilnius, Kaunas, Klaipėda ir kiti miestai."],
];

const ufh = [
  "Drėgmės patikra prieš montavimą",
  "UFH klijai ir patvirtintos medžiagos",
  "Šildymo paleidimo protokolas",
  "Garantija pagal protokolą",
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="bg-brand-dark px-4 py-16 text-white md:px-8 md:py-24">
      <div className="mx-auto w-full max-w-[1320px]">
        <h2 className="text-3xl tracking-tight md:text-5xl">Mūsų procesas - nuo pasirinkimo iki įrengtų grindų</h2>
        <p className="mt-4 text-white/75">Aiškus planas, viena komanda, vienas atsakingas žmogus.</p>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {steps.map(([index, title, desc], i) => (
            <motion.article
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45, delay: i * 0.06 }}
              className="rounded-2xl border border-white/15 bg-white/5 p-6"
            >
              <p className="text-brand-accent">{index}</p>
              <h3 className="mt-2 text-xl">{title}</h3>
              <p className="mt-2 text-sm text-white/75">{desc}</p>
            </motion.article>
          ))}
        </div>
        <div className="mt-12 rounded-2xl bg-black/20 p-6 md:p-8">
          <h3 className="text-2xl">Saugus ąžuolas šildomoms grindims</h3>
          <p className="mt-2 text-sm text-white/75">
            Mūsų UFH protokolas užtikrina, kad jūsų grindys būtų įrengtos pagal aukščiausius standartus.
          </p>
          <div className="mt-5 grid gap-2 text-sm md:grid-cols-2">
            {ufh.map((item) => (
              <p key={item}>• {item}</p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
