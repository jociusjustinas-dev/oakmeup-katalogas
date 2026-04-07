"use client";

import Image from "next/image";
import { motion } from "framer-motion";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const heroImages = [
  "https://framerusercontent.com/images/fzUaYMkm0FOFXRknN6t6FQRG6c.jpg",
  "https://framerusercontent.com/images/H5W6qZErqnE0jAZjJMUE3cmak.jpg",
  "https://framerusercontent.com/images/u6iGyVq7o7Q9ZoFnkQ1gveBPS4.jpg",
  "https://framerusercontent.com/images/JKv9zfHoFAByxNaLNHfjJBRVo0Y.jpg",
];

const points = ["Sąmata per 24 h", "Pristatymas per ~7 d.", "Tinka šildomoms grindims", "Spalvą deriname prie interjero"];

export function HeroSection() {
  return (
    <section id="hero" className="bg-brand-dark px-4 pb-14 pt-16 text-white md:px-8 md:pb-20">
      <div className="mx-auto grid w-full max-w-[1320px] gap-10 lg:grid-cols-[1fr_520px] lg:items-end">
        <div>
          <Badge className="bg-white/20 text-brand-accent">Įrengta 1 000+ m² ąžuolo grindų</Badge>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="mt-5 text-4xl leading-tight tracking-tight md:text-6xl"
          >
            Ąžuolinės grindys
            <br />
            su montavimu
          </motion.h1>
          <p className="mt-5 max-w-2xl text-base text-white/80 md:text-lg">
            Padėsime išsirinkti raštą ir atspalvį, paruošime aiškią sąmatą, pristatysime ir sumontuosime.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a href="#valuation-form">
              <Button variant="accent" size="lg">
                Gauti sąmatą per 24 h
              </Button>
            </a>
            <a href="#kolekcija">
              <Button variant="outline" size="lg" className="border-white/35 bg-transparent text-white hover:bg-white/10">
                Peržiūrėti kolekciją
              </Button>
            </a>
          </div>
          <div className="mt-8 grid gap-2 text-sm text-white/80 md:grid-cols-2">
            {points.map((point) => (
              <p key={point}>• {point}</p>
            ))}
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="grid grid-cols-2 gap-3"
        >
          {heroImages.map((src) => (
            <div key={src} className="relative h-44 overflow-hidden rounded-lg md:h-56">
              <Image src={src} alt="Oak Me Up projektas" fill sizes="(max-width: 768px) 50vw, 260px" className="object-cover" />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
