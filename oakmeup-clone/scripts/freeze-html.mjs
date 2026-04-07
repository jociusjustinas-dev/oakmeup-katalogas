import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const projectRoot = process.cwd();
const sourceHtmlPath = path.join(projectRoot, "source", "index.html");
const frozenHtmlPath = path.join(projectRoot, "source", "index.frozen.html");
const assetsRoot = path.join(projectRoot, "public", "frozen-assets");
const ALLOWED_HOSTS = new Set(["framerusercontent.com", "fonts.gstatic.com", "events.framer.com"]);

const shouldKeepUrl = (url) => {
  const parsed = new URL(url);
  if (url.startsWith("https://schema.org")) return false;
  if (url === "https://oakmeup.lt") return false;
  if (parsed.pathname === "/" && !parsed.search) return false;
  if (!ALLOWED_HOSTS.has(parsed.hostname)) return false;
  return true;
};

const stripUnneededScripts = (html) => {
  let output = html;
  output = output.replace(/<script[^>]*src=["']https:\/\/www\.googletagmanager\.com\/gtag\/js[^>]*><\/script>/gi, "");
  output = output.replace(/<script>\s*window\.dataLayer[\s\S]*?<\/script>/gi, "");
  output = output.replace(
    /<script[^>]*src=["']https:\/\/t\.contentsquare\.net\/uxa\/[^"']+["'][^>]*><\/script>/gi,
    "",
  );
  output = output.replace(
    /<script[^>]*>\s*\(function\(c,l,a,r,i,t,y\)[\s\S]*?clarity[\s\S]*?<\/script>/gi,
    "",
  );
  output = output.replace(
    /<script>try\{if\(localStorage\.get\("__framer_force_showing_editorbar_since"\)\)[\s\S]*?<\/script>/gi,
    "",
  );
  output = output.replace(/<style id="_10000[^>]*>[\s\S]*?<\/style>/gi, "");
  output = output.replace(/<style>\s*#__framer-editorbar-container[\s\S]*?<\/style>/gi, "");
  output = output.replace(/<style>\s*#__framer-editorbar[\s\S]*?<\/style>/gi, "");
  output = output.replace(/<div id="__framer-editorbar-container"[\s\S]*?<\/div>/gi, "");
  output = output.replace(/<iframe id="__framer-editorbar"[\s\S]*?<\/iframe>/gi, "");
  output = output.replace(/<link[^>]*href=["']https:\/\/fonts\.gstatic\.com["'][^>]*>/gi, "");
  return output;
};

const deFramerizeText = (text) =>
  text
    .replace(/\bframer-/g, "oak-")
    .replace(/\b__framer/g, "__oak")
    .replace(/\bdata-framer/g, "data-oak")
    .replace(/\bframer_variant\b/g, "oak_variant");

const deFramerizeMarkup = (html) => {
  let output = deFramerizeText(html);
  output = output.replace(/\sdata-framer(?:-[\w-]+)?=(?:"[^"]*"|'[^']*'|[^\s>]+)/g, "");
  output = output.replace(/\sdata-framer(?:-[\w-]+)?(?=[\s>])/g, "");
  output = output.replace(/\sclass=""/g, "");
  return output;
};

const buildAssetPath = (urlString) => {
  const url = new URL(urlString);
  const pathname = decodeURIComponent(url.pathname);
  const ext = path.extname(pathname);
  const baseNoExt = ext ? pathname.slice(0, -ext.length) : pathname;
  const querySuffix = url.search
    ? `__${createHash("sha1").update(url.search).digest("hex").slice(0, 8)}`
    : "";
  const finalPath = `${baseNoExt}${querySuffix}${ext || ""}`;
  const trimmed = finalPath.startsWith("/") ? finalPath.slice(1) : finalPath;
  return path.join(assetsRoot, url.hostname, trimmed);
};

const toPublicHref = (absoluteAssetPath) => {
  const relative = path.relative(path.join(projectRoot, "public"), absoluteAssetPath);
  return `/${relative.split(path.sep).join("/")}`;
};

const decodeHtmlUrl = (value) => value.replaceAll("&amp;", "&");

const TEXT_EXTENSIONS = new Set([".mjs", ".js", ".css", ".json", ".svg", ".xml", ".html", ".txt"]);

const downloadAsset = async (url, filePath) => {
  await mkdir(path.dirname(filePath), { recursive: true });
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed ${response.status} for ${url}`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  const contentType = response.headers.get("content-type") || "";
  const extension = path.extname(new URL(url).pathname).toLowerCase();
  const isText =
    TEXT_EXTENSIONS.has(extension) ||
    contentType.startsWith("text/") ||
    contentType.includes("javascript") ||
    contentType.includes("json") ||
    contentType.includes("svg") ||
    contentType.includes("xml");

  if (isText) {
    const text = buffer.toString("utf-8");
    await writeFile(filePath, deFramerizeText(text), "utf-8");
    return;
  }

  await writeFile(filePath, buffer);
};

const main = async () => {
  const sourceHtml = await readFile(sourceHtmlPath, "utf-8");
  let html = stripUnneededScripts(sourceHtml);

  const urlMatches = html.match(/https?:\/\/[^\s"'()<>]+/g) ?? [];
  const uniqueUrls = [...new Set(urlMatches)].filter(shouldKeepUrl);

  const replacements = new Map();
  for (const originalUrl of uniqueUrls) {
    const fetchUrl = decodeHtmlUrl(originalUrl);
    const assetPath = buildAssetPath(fetchUrl);
    const publicHref = toPublicHref(assetPath);
    await downloadAsset(fetchUrl, assetPath);
    replacements.set(originalUrl, publicHref);
  }

  for (const [from, to] of replacements.entries()) {
    html = html.split(from).join(to);
  }

  html = deFramerizeMarkup(html);

  await writeFile(frozenHtmlPath, html, "utf-8");
  console.log(`Frozen HTML written to ${frozenHtmlPath}`);
  console.log(`Downloaded ${replacements.size} assets to public/frozen-assets`);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
