"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

type AccordionItemProps = {
  question: string;
  answer: string;
  defaultOpen?: boolean;
};

export function AccordionItem({ question, answer, defaultOpen }: AccordionItemProps) {
  const [open, setOpen] = React.useState(Boolean(defaultOpen));

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 text-left"
        onClick={() => setOpen((value) => !value)}
      >
        <span className="text-base font-medium text-zinc-900">{question}</span>
        <ChevronDown className={cn("h-5 w-5 shrink-0 text-zinc-500 transition-transform", open && "rotate-180")} />
      </button>
      {open ? <p className="mt-3 text-sm leading-6 text-zinc-600">{answer}</p> : null}
    </div>
  );
}
