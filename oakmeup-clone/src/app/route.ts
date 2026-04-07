import { readFile } from "node:fs/promises";
import path from "node:path";

const SOURCE_HTML_PATH = path.join(process.cwd(), "source", "index.frozen.html");

export async function GET() {
  try {
    const html = await readFile(SOURCE_HTML_PATH, "utf-8");
    return new Response(html, {
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "no-store",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      `<html><body><h1>Missing source file</h1><p>${SOURCE_HTML_PATH}</p><pre>${message}</pre></body></html>`,
      {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      },
    );
  }
}
