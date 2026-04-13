import { readFile } from "node:fs/promises";
import path from "node:path";

import { isProduktaiSubdomain, produktaiRedirectResponse } from "@/lib/produktai-subdomain";

const SOURCE_HTML_PATH = path.join(process.cwd(), "source", "index.frozen.html");
const CATALOG_PATH = "/kolekcija";

const injectCollectionRouting = (html: string) => {
  const clientPatch = `
<script>
(() => {
  const TARGET = ${JSON.stringify(CATALOG_PATH)};
  const HASH = "#kolekcija";
  const hashNeedle = "kolekcija";

  const redirectNow = () => {
    if (window.location.pathname === TARGET) return;
    window.location.assign(TARGET);
  };

  const hasCollectionHash = (value) => {
    if (!value) return false;
    const normalized = String(value).toLowerCase();
    return normalized.includes("#" + hashNeedle) || normalized.includes("%23" + hashNeedle);
  };

  const shouldRedirect = (anchor) => {
    if (!anchor) return false;
    const rawHref = anchor.getAttribute("href") || "";
    if (rawHref === HASH || rawHref.endsWith(HASH) || hasCollectionHash(rawHref)) {
      return true;
    }
    const label = (anchor.textContent || "").trim().toLowerCase();
    return label === "kolekcija";
  };

  const rewriteAnchors = () => {
    const anchors = document.querySelectorAll("a[href], [role='link'][href]");
    for (const anchor of anchors) {
      if (shouldRedirect(anchor)) {
        anchor.setAttribute("href", TARGET);
      }
    }
  };

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const anchor = target.closest("a[href], [role='link'][href]");
    if (!shouldRedirect(anchor)) return;

    event.preventDefault();
    event.stopPropagation();
    redirectNow();
  }, true);

  const wrapHistory = (methodName) => {
    const original = history[methodName];
    history[methodName] = function (...args) {
      const result = original.apply(this, args);
      const nextUrl = args[2];
      if (hasCollectionHash(nextUrl) || hasCollectionHash(window.location.hash)) {
        redirectNow();
      }
      return result;
    };
  };

  wrapHistory("pushState");
  wrapHistory("replaceState");
  window.addEventListener("hashchange", () => {
    if (hasCollectionHash(window.location.hash)) {
      redirectNow();
    }
  });
  if (hasCollectionHash(window.location.hash)) {
    redirectNow();
    return;
  }

  rewriteAnchors();
  new MutationObserver(rewriteAnchors).observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["href"]
  });
})();
</script>`;

  return html.replace("</body>", `${clientPatch}</body>`);
};

export async function GET(request: Request) {
  if (isProduktaiSubdomain(request.headers.get("host"))) {
    return produktaiRedirectResponse();
  }

  try {
    const html = await readFile(SOURCE_HTML_PATH, "utf-8");
    const linkedHtml = html.replace(/href="#kolekcija"/g, `href="${CATALOG_PATH}"`);
    const patchedHtml = injectCollectionRouting(linkedHtml);

    return new Response(patchedHtml, {
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
