import { notFound } from "next/navigation";
import { isProduktaiSubdomain, produktaiRedirectResponse } from "@/lib/produktai-subdomain";

export async function GET(request: Request) {
  if (!isProduktaiSubdomain(request.headers.get("host"))) {
    notFound();
  }
  return produktaiRedirectResponse();
}
