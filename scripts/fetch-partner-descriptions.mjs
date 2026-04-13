#!/usr/bin/env node
/**
 * Pulls product body_html from homesandfloors.com (Shopify products.json).
 * Matches catalog SKU by: (1) variant SKU / -B -P base, (2) product tags,
 * (3) CDN filename prefix — same idea as SKU_IMAGES (e.g. EV143125BUVO in URL).
 *
 * Run: node scripts/fetch-partner-descriptions.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const INDEX = path.join(ROOT, "index.html");
const OUT_JSON = path.join(ROOT, "sku_descriptions.json");
const OUT_META = path.join(ROOT, "sku_descriptions_meta.json");
const OUT_TXT = path.join(ROOT, "sku_descriptions_report.txt");
const OUT_MISSING = path.join(ROOT, "sku_descriptions_missing.json");

const BASE = "https://homesandfloors.com";

function stripHtml(html) {
  if (!html) return "";
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function parseProductSkus() {
  const text = fs.readFileSync(INDEX, "utf8");
  const start = text.indexOf("const PRODUCTS=[");
  if (start < 0) throw new Error("PRODUCTS not found");
  const sub = text.slice(start + "const PRODUCTS=".length);
  const endMarker = sub.indexOf("];");
  if (endMarker < 0) throw new Error("PRODUCTS end ]; not found");
  const chunk = sub.slice(0, endMarker);
  const ordered = [];
  const re = /\["([A-Za-z0-9._-]+)"/g;
  let m;
  while ((m = re.exec(chunk)) !== null) ordered.push(m[1]);
  return ordered;
}

/** Balanced { … } after const SKU_IMAGES= */
function extractSkuImagesJsonText() {
  const text = fs.readFileSync(INDEX, "utf8");
  const key = "const SKU_IMAGES=";
  const start = text.indexOf(key);
  if (start < 0) return null;
  const brace = text.indexOf("{", start);
  if (brace < 0) return null;
  let depth = 0;
  for (let i = brace; i < text.length; i++) {
    const c = text[i];
    if (c === "{") depth++;
    else if (c === "}") {
      depth--;
      if (depth === 0) return text.slice(brace, i + 1);
    }
  }
  return null;
}

/** First image URL per catalog SKU */
function parseSkuImagesFromIndex() {
  const raw = extractSkuImagesJsonText();
  if (!raw) return {};
  let obj;
  try {
    obj = JSON.parse(raw);
  } catch {
    return {};
  }
  const firstUrl = {};
  for (const [k, arr] of Object.entries(obj)) {
    if (Array.isArray(arr) && arr[0]) firstUrl[k] = arr[0];
  }
  return firstUrl;
}

function prefixFromCdnFilename(url) {
  try {
    const seg = decodeURIComponent(url.split("?")[0].split("/").pop() || "");
    const base = seg.replace(/\.(jpg|jpeg|png|webp|gif)$/i, "");
    const head = base.split("_")[0];
    if (/^[A-Za-z][A-Za-z0-9-]{3,}$/.test(head)) return head.toUpperCase();
  } catch {
    /* ignore */
  }
  return null;
}

function looksLikeSkuToken(s) {
  return /^[A-Za-z]{1,3}[A-Za-z0-9._-]{3,}$/.test(s);
}

async function fetchAllProducts() {
  const bySku = new Map();
  const metaBySku = new Map();
  const byImagePrefix = new Map();
  const metaByImagePrefix = new Map();
  let page = 1;

  for (;;) {
    const url = `${BASE}/products.json?limit=250&page=${page}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${url} -> ${res.status}`);
    const data = await res.json();
    const products = data.products || [];
    if (products.length === 0) break;

    for (const p of products) {
      const bodyText = stripHtml(p.body_html);
      const title = (p.title || "").trim();
      const handle = p.handle || "";
      const productUrl = `${BASE}/products/${handle}`;
      const meta = { title, handle, productUrl };

      const registerImageUrl = (src) => {
        if (!src || typeof src !== "string") return;
        const prefix = prefixFromCdnFilename(src);
        if (!prefix) return;
        if (!byImagePrefix.has(prefix)) {
          byImagePrefix.set(prefix, bodyText);
          metaByImagePrefix.set(prefix, { ...meta, match: "image-filename" });
        }
      };

      for (const im of p.images || []) registerImageUrl(im.src);
      for (const v of p.variants || []) registerImageUrl(v.featured_image?.src);

      for (const v of p.variants || []) {
        const raw = (v.sku || "").trim();
        if (!raw) continue;
        const key = raw.toUpperCase();
        if (!bySku.has(key)) {
          bySku.set(key, bodyText);
          metaBySku.set(key, { ...meta, variantTitle: (v.title || "").trim(), match: "variant-sku" });
        }
        const suffix = raw.match(/^(.+)-([BP])$/i);
        if (suffix) {
          const base = suffix[1].toUpperCase();
          if (!bySku.has(base)) {
            bySku.set(base, bodyText);
            metaBySku.set(base, {
              ...meta,
              variantTitle: "(base from box/pallet sku)",
              match: "variant-sku-base",
            });
          }
        }
      }

      const tags = String(p.tags || "")
        .split(",")
        .map((t) => t.trim())
        .filter(looksLikeSkuToken);
      for (const tag of tags) {
        const u = tag.toUpperCase();
        if (!bySku.has(u)) {
          bySku.set(u, bodyText);
          metaBySku.set(u, { ...meta, variantTitle: "(from product tag)", match: "tag" });
        }
      }
    }
    page += 1;
    if (products.length < 250) break;
  }

  return { bySku, metaBySku, byImagePrefix, metaByImagePrefix };
}

function resolveDescription(sku, skuFirstImageUrl, { bySku, metaBySku, byImagePrefix, metaByImagePrefix }) {
  const skuKey = sku.toUpperCase();
  let text = bySku.get(skuKey);
  if (text)
    return {
      text,
      meta: metaBySku.get(skuKey),
      source: metaBySku.get(skuKey)?.match || "sku",
      imagePrefix: null,
    };

  if (skuFirstImageUrl) {
    const pfx = prefixFromCdnFilename(skuFirstImageUrl);
    if (pfx) {
      text = byImagePrefix.get(pfx);
      if (text)
        return {
          text,
          meta: metaByImagePrefix.get(pfx),
          source: "image-filename",
          imagePrefix: pfx,
        };
    }
  }

  return { text: null, meta: null, source: null, imagePrefix: null };
}

function main() {
  console.log("Parsing catalog SKUs + SKU_IMAGES from index.html…");
  const catalogSkus = parseProductSkus();
  const skuFirstUrl = parseSkuImagesFromIndex();
  console.log(`Catalog SKUs: ${catalogSkus.length}; with images: ${Object.keys(skuFirstUrl).length}`);

  console.log("Fetching Shopify products (homesandfloors.com)…");
  return fetchAllProducts().then((maps) => {
    console.log(`Shopify variant/tag keys: ${maps.bySku.size}; image filename prefixes: ${maps.byImagePrefix.size}`);

    const descriptions = {};
    const metas = {};
    const missing = [];
    const lines = [];

    for (const sku of catalogSkus) {
      const firstUrl = skuFirstUrl[sku];
      const { text, meta, source, imagePrefix } = resolveDescription(sku, firstUrl, maps);
      if (text && text.length) {
        descriptions[sku] = text;
        metas[sku] = {
          source: source || "?",
          partnerTitle: meta?.title || "",
          partnerUrl: meta?.productUrl || "",
          imagePrefix: imagePrefix || null,
        };
        lines.push(`${sku}`);
        lines.push(`  Match: ${source}${imagePrefix ? ` (prefix ${imagePrefix})` : ""}`);
        lines.push(`  URL: ${meta?.productUrl || ""}`);
        lines.push(`  Partner title: ${meta?.title || ""}`);
        lines.push(`  ${text}`);
        lines.push("");
      } else {
        missing.push(sku);
        lines.push(`${sku}`);
        lines.push(`  [NO MATCH — no Shopify SKU/tag; image filename prefix not in partner index]`);
        if (firstUrl) lines.push(`  First image: ${firstUrl}`);
        lines.push("");
      }
    }

    fs.writeFileSync(OUT_JSON, JSON.stringify(descriptions, null, 2), "utf8");
    fs.writeFileSync(OUT_META, JSON.stringify(metas, null, 2), "utf8");
    fs.writeFileSync(OUT_MISSING, JSON.stringify(missing, null, 2), "utf8");
    fs.writeFileSync(OUT_TXT, lines.join("\n"), "utf8");

    const ok = catalogSkus.length - missing.length;
    console.log(`Matched: ${ok} / ${catalogSkus.length}`);
    console.log(`Missing: ${missing.length} (see ${path.basename(OUT_MISSING)})`);
    console.log(`Wrote ${path.basename(OUT_JSON)}, ${path.basename(OUT_META)}, ${path.basename(OUT_TXT)}`);
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
