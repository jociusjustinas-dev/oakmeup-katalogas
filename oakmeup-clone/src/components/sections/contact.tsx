"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { type ContactFormValues, contactSchema } from "@/lib/validations/contact";

export function ContactSection() {
  const [submitted, setSubmitted] = useState(false);
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", message: "" },
  });

  const onSubmit = (values: ContactFormValues) => {
    console.log("contact-form-submit", values);
    setSubmitted(true);
    form.reset();
  };

  return (
    <section id="contact" className="px-4 py-16 md:px-8 md:py-24">
      <div className="mx-auto grid w-full max-w-[1320px] gap-8 rounded-3xl bg-brand-soft p-6 md:grid-cols-2 md:p-10">
        <div>
          <h2 className="text-3xl tracking-tight md:text-5xl">Pasitarkime dėl jūsų grindų</h2>
          <p className="mt-4 text-zinc-700">
            Atsiųskite patalpų plotą ir norimą produktą - paruošime sąmatą per 24 val. Sąmata nemokama ir neįpareigoja.
          </p>
        </div>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div>
            <Input placeholder="Vardas" {...form.register("name")} />
            {form.formState.errors.name ? <p className="mt-1 text-xs text-red-600">{form.formState.errors.name.message}</p> : null}
          </div>
          <div>
            <Input placeholder="El. paštas" type="email" {...form.register("email")} />
            {form.formState.errors.email ? (
              <p className="mt-1 text-xs text-red-600">{form.formState.errors.email.message}</p>
            ) : null}
          </div>
          <div>
            <Textarea placeholder="Žinutė" {...form.register("message")} />
            {form.formState.errors.message ? (
              <p className="mt-1 text-xs text-red-600">{form.formState.errors.message.message}</p>
            ) : null}
          </div>
          <Button type="submit" variant="default" className="w-full">
            Siųsti užklausą
          </Button>
          <p className="text-xs text-zinc-500">Jūsų duomenys yra saugūs. Nebus jokio šlamšto, niekada.</p>
          {submitted ? <p className="text-sm text-green-700">Ačiū! Užklausa išsiųsta.</p> : null}
        </form>
      </div>
    </section>
  );
}
