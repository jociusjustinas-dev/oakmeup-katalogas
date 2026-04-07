import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().min(2, "Įveskite vardą (bent 2 simboliai)"),
  email: z.string().email("Įveskite teisingą el. pašto adresą"),
  message: z.string().min(10, "Žinutė turi būti bent 10 simbolių"),
});

export type ContactFormValues = z.infer<typeof contactSchema>;
