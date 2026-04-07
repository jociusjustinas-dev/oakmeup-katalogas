import { AccordionItem } from "@/components/ui/accordion";

const faqs = [
  {
    q: "Ar jūsų grindys tinka šildomoms grindims?",
    a: "Taip. Visos mūsų grindys pagamintos su beržinės faneros pagrindu, kuris idealiai perduoda šilumą ir išlaiko stabilumą. Montavimą atliekame pagal UFH protokolą su drėgmės matavimu, tinkamais klijais ir šildymo paleidimo seka.",
  },
  {
    q: "Ką apima „iki rakto“ kaina?",
    a: "Viskas - grindys, klijai, gruntas, pagrindo paruošimas, montavimas ir apdaila alyva arba laku. Jokių papildomų kaštų.",
  },
  {
    q: "Kiek kainuoja montavimas?",
    a: "Orientacinės kainos su montavimu: parketlentės nuo 91 €/m², eglutė nuo 103 €/m², chevron nuo 126 €/m², Versalio panelės nuo 169 €/m².",
  },
  {
    q: "Per kiek laiko atliekamas montavimas?",
    a: "Vidutiniškai 50-80 m² montuojame per 5-7 darbo dienas, įskaitant pagrindo paruošimą, montavimą ir apdailą.",
  },
  {
    q: "Ar galiu gyventi bute montavimo metu?",
    a: "Rekomenduojame montavimo metu nebūti patalpose dėl dulkių ir apdailos medžiagų kvapo. Paprastai tai trunka 3-5 dienas.",
  },
  {
    q: "Koks skirtumas tarp „finished“ ir „unfinished“ grindų?",
    a: "Finished - gamykloje padengtos alyva arba laku. Unfinished - šlifuojamos ir apdailinamos vietoje, todėl galima tiksliai pritaikyti spalvą interjerui.",
  },
  {
    q: "Kaip prižiūrėti ąžuolo grindis?",
    a: "Kasdienei priežiūrai pakanka sauso arba drėgno šluostymo. Rekomenduojame Osmo priežiūros priemones.",
  },
];

export function FaqSection() {
  return (
    <section id="faq" className="px-4 py-16 md:px-8 md:py-24">
      <div className="mx-auto w-full max-w-[900px]">
        <h2 className="text-center text-3xl tracking-tight md:text-5xl">Dažniausiai užduodami klausimai</h2>
        <div className="mt-8 space-y-3">
          {faqs.map((faq, i) => (
            <AccordionItem key={faq.q} question={faq.q} answer={faq.a} defaultOpen={i === 0} />
          ))}
        </div>
      </div>
    </section>
  );
}
