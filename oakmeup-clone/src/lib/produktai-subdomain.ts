import { readFile } from "node:fs/promises";
import path from "node:path";

const PRODUKTAI_HOSTS = new Set(["produktai.oakmeup.lt", "www.produktai.oakmeup.lt"]);
const REDIRECT_HTML_PATH = path.join(process.cwd(), "source", "produktai-redirect.html");

export function isProduktaiSubdomain(host: string | null | undefined): boolean {
  const normalized = host?.split(":")[0]?.toLowerCase();
  return !!normalized && PRODUKTAI_HOSTS.has(normalized);
}

export async function produktaiRedirectResponse(): Promise<Response> {
  const body = await readFile(REDIRECT_HTML_PATH, "utf-8");
  return new Response(body, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}
