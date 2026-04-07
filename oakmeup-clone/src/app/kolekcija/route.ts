import { readFile } from "node:fs/promises";

const DEPLOYED_CATALOG_URL = "https://produktai.oakmeup.lt";
const HOME_SOURCE_HTML_PATH = "/Users/justinasjocius/Downloads/index.html";
const GRID_OVERRIDE = `
<style id="catalog-grid-default-override">
  .catalog-root--grid .sub-block{grid-template-columns:repeat(4,minmax(0,1fr)) !important;}
  @media (max-width: 1024px){.catalog-root--grid .sub-block{grid-template-columns:repeat(3,minmax(0,1fr)) !important;}}
  @media (max-width: 820px){.catalog-root--grid .sub-block{grid-template-columns:repeat(2,minmax(0,1fr)) !important;}}
  @media (max-width: 560px){.catalog-root--grid .sub-block{grid-template-columns:1fr !important;}}
</style>
`;

const extractFirstTag = (html: string, tag: "header" | "footer") => {
  const match = html.match(new RegExp(`<${tag}\\b[\\s\\S]*?<\\/${tag}>`, "i"));
  return match ? match[0] : null;
};

const extractFramerStyles = (html: string) => {
  const styles = html.match(/<style\b[\s\S]*?<\/style>/gi) ?? [];
  return styles.filter((block) => block.includes("data-framer") || block.includes("framer-")).join("\n");
};

const applyCatalogOverrides = (
  html: string,
  shell?: { header: string; footer: string; styles: string },
) => {
  let output = html;
  if (shell) {
    output = output.replace(/<header\b[\s\S]*?<\/header>/i, "");
    output = output.replace(/<footer\b[\s\S]*?<\/footer>/i, "");
    output = output.replace(/<body>/i, `<body>\n${shell.header}`);
    output = output.replace(/<\/body>/i, `${shell.footer}\n</body>`);
  }
  output = output.replace("let viewMode='list';", "let viewMode='grid';");
  output = output.replace(
    'id="view-list" class="view-toggle-btn active" onclick="setView(\'list\')" title="Sąrašas" aria-pressed="true"',
    'id="view-list" class="view-toggle-btn" onclick="setView(\'list\')" title="Sąrašas" aria-pressed="false"',
  );
  output = output.replace(
    'id="view-grid" class="view-toggle-btn" onclick="setView(\'grid\')" title="Tinklelis" aria-pressed="false"',
    'id="view-grid" class="view-toggle-btn active" onclick="setView(\'grid\')" title="Tinklelis" aria-pressed="true"',
  );
  if (shell?.styles) {
    output = output.replace(/<\/head>/i, `${shell.styles}\n${GRID_OVERRIDE}\n</head>`);
  } else {
    output = output.replace(/<\/head>/i, `${GRID_OVERRIDE}\n</head>`);
  }
  return output;
};

export async function GET() {
  try {
    const [catalogResponse, homeSourceHtml] = await Promise.all([
      fetch(DEPLOYED_CATALOG_URL, { cache: "no-store" }),
      readFile(HOME_SOURCE_HTML_PATH, "utf-8"),
    ]);

    if (!catalogResponse.ok) {
      throw new Error(`Failed to fetch deployed catalog: ${catalogResponse.status}`);
    }

    const header = extractFirstTag(homeSourceHtml, "header");
    const footer = extractFirstTag(homeSourceHtml, "footer");
    const styles = extractFramerStyles(homeSourceHtml);
    const shell = header && footer ? { header, footer, styles } : undefined;

    const catalogHtml = await catalogResponse.text();
    const patchedHtml = applyCatalogOverrides(catalogHtml, shell);
    return new Response(patchedHtml, {
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "no-store",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      `<html><body><h1>Cannot load deployed catalog</h1><p>${DEPLOYED_CATALOG_URL}</p><pre>${message}</pre></body></html>`,
      {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      },
    );
  }
}
