#!/usr/bin/env node
/**
 * Sujungia sku_descriptions.json (EN iš partnerio) su rankiniu LT vertimu.
 * Unikalūs EN tekstai turi sutarti su _unique_order.json (sugeneruoti prieš vertimą).
 *
 * node scripts/compose-sku-descriptions-lt.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { LT_TRANSLATIONS } from "./sku-descriptions-lt-data.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const uniquePath = path.join(ROOT, "_unique_order.json");
const enSkuPath = path.join(ROOT, "sku_descriptions.json");
const outPath = path.join(ROOT, "sku_descriptions_lt.json");

const unique = JSON.parse(fs.readFileSync(uniquePath, "utf8"));
if (LT_TRANSLATIONS.length !== unique.length) {
  console.error(`LT_TRANSLATIONS: ${LT_TRANSLATIONS.length}, unique EN: ${unique.length}`);
  process.exit(1);
}

const map = new Map(unique.map((en, i) => [en, LT_TRANSLATIONS[i]]));
const skuEn = JSON.parse(fs.readFileSync(enSkuPath, "utf8"));
const out = {};
for (const [sku, enText] of Object.entries(skuEn)) {
  const lt = map.get(enText);
  if (!lt) {
    console.error(`No LT for SKU ${sku}, en prefix: ${String(enText).slice(0, 80)}…`);
    process.exit(1);
  }
  out[sku] = lt;
}

fs.writeFileSync(outPath, JSON.stringify(out, null, 2), "utf8");
console.log(`Wrote ${path.basename(outPath)} (${Object.keys(out).length} SKUs).`);
