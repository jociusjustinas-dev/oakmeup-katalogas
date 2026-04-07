"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "#features", label: "Kolekcijos" },
  { href: "#how-it-works", label: "Procesas" },
  { href: "#pricing", label: "Kainos" },
  { href: "#faq", label: "DUK" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b border-transparent transition-all",
        scrolled && "border-zinc-200 bg-white/90 backdrop-blur",
      )}
    >
      <div className="mx-auto flex w-full max-w-[1320px] items-center justify-between px-4 py-4 md:px-8">
        <a href="#hero" className="text-xl tracking-tight text-brand-dark">
          Oak Me Up
        </a>
        <nav className="hidden items-center gap-7 text-sm text-zinc-600 md:flex">
          {navItems.map((item) => (
            <a key={item.href} href={item.href} className="transition-colors hover:text-zinc-900">
              {item.label}
            </a>
          ))}
        </nav>
        <a href="#contact">
          <Button variant="accent">Gauti sąmatą</Button>
        </a>
      </div>
    </header>
  );
}
