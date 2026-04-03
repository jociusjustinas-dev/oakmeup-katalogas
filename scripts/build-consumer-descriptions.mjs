/**
 * Paprastas LT tekstas: 3–4 sakiniai kasdienine kalba.
 * Šaltinis: sku_descriptions_lt_v1_paragraphs.json
 * Produktai: index.html → PRODUCTS
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const htmlPath = path.join(root, "index.html");
const narrativePath = path.join(root, "sku_descriptions_lt_v1_paragraphs.json");
const outPath = path.join(root, "sku_descriptions_lt.json");

function loadProducts() {
  const html = fs.readFileSync(htmlPath, "utf8");
  const m = html.match(/const PRODUCTS=\[([\s\S]*?)\];/);
  if (!m) throw new Error("PRODUCTS not found");
  return Function("return [" + m[1].replace(/^\[/, "").replace(/\]$/, "") + "]")();
}

function isEngineered(title, dims) {
  if (/Multiply/i.test(title)) return true;
  if (/^Solid |^OSH|^SC\d/i.test(title)) return false;
  if (
    /\bEng\.|Engineered|White Oak|French Oak|Am\. Oak|Am\. Walnut|Versailles|Versalio|\bHB\d|^C\d|^ME|^NYC|^WAL|^BL|^EFS|^YE|^OE|^V1|^V19|^RH|^WV|^HB18/i.test(
      title,
    )
  )
    return true;
  return /\d+\/\d+\s*×/.test(dims);
}

function isSolidLine(title) {
  return /^Solid |^OSH\d|^SC\d/i.test(title) && !/Multiply/i.test(title);
}

function isComplexPattern(title, filterLabel) {
  return (
    /\bHB\b|Herringbone|Chevron|Versailles|Versalio/i.test(title) ||
    /EGLUTĖ|CHEVRON|VERSALIO|HERRINGBONE/i.test(filterLabel || "")
  );
}

function woodWord(title) {
  if (/Walnut|WAL|riešut/i.test(title)) return "riešutmedžio";
  return "ąžuolo";
}

/** Stabilus variantas pagal SKU, kad tekstas nesikristų kiekvieną kartą iš naujo. */
function variantIndex(sku, len) {
  if (len <= 1) return 0;
  const s = String(sku);
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h % len;
}

function openingLine(sku, title, dims, eng, solid, complex) {
  const d = dims.replace(/\s+/g, " ").trim();
  const wood = woodWord(title);
  const Wood = wood.charAt(0).toUpperCase() + wood.slice(1);

  if (solid) {
    const opts = [
      `${Wood} grindys iš vientisos lentos – visas storis tos pačios medienos. Kataloge: ${d}.`,
      `Vientisa ${wood} mediena grindims, be daugiasluoksnio pagrindo. Matmenys: ${d}.`,
      `Masyvios ${wood} grindys, kai visa lenta „visa tikra mediena“. Kataloge nurodyta: ${d}.`,
      `Tradicinis masyvumas: grindys iš vientisos ${wood} lentos. Dydis: ${d}.`,
    ];
    return opts[variantIndex(sku, opts.length)];
  }

  if (eng) {
    if (complex) {
      const cOpts = [
        `Raštuotos ${wood} grindys su kelių sluoksnių konstrukcija – viršuje matomas tikras medienos sluoksnis. Formatas: ${d}.`,
        `Šis ${wood} variantas skirtas dekoratyviam raštui (eglutė, V ir pan.) ir turi stabilizuojantį pagrindą. Matmenys: ${d}.`,
        `Įmantresnis išdėstymas, bet sandara įprasta: ${wood} paviršius ant daugiasluoksnio pagrindo. ${d}.`,
        `${Wood} grindys su raštu – „sumuštinė“ konstrukcija dažnai stabiliau laikosi nei viena storio lenta. Kataloge: ${d}.`,
      ];
      return cOpts[variantIndex(sku, cOpts.length)];
    }
    const opts = [
      `Šios ${wood} grindys sutvirtintos keliais sluoksniais: viršuje tikra mediena, apačia padeda išlaikyti formą. Formatas: ${d}.`,
      `${Wood} grindų lentelės su kelių sluoksnių konstrukcija – dažnas pasirinkimas butuose ir biuruose. Matmenys: ${d}.`,
      `Įprastas inžinerinis parketas: plonas ${wood} sluoksnis ant stabilaus pagrindo. Kataloge: ${d}.`,
      `Parketlentės iš ${wood}: viršuje matomas medienos sluoksnis, žemiau – sluoksniai stabilumui. Nurodyta: ${d}.`,
      `${Wood} grindų danga su pagrindu po plonu kietmedžio paviršiumi. Matmuo: ${d}.`,
    ];
    return opts[variantIndex(sku, opts.length)];
  }

  const fb = [
    `Grindys iš ${wood}, matmenys kataloge: ${d}.`,
    `Ši pozicija – ${wood} grindų danga. Kataloge: ${d}.`,
  ];
  return fb[variantIndex(sku, fb.length)];
}

function softenTechnicalJargon(text) {
  let t = String(text || "").trim();
  t = t.replace(/^Daugiasluoksnė\s+/i, "Lentos su keliais sluoksniais – ");
  t = t.replace(/^Daugiasluoksnės\s+/i, "Lentos su keliais sluoksniais – ");
  t = t.replace(/\bfrezuota jungtimi\b/gi, "sujungiamos mechaniškai į tą pačią plokštumą");
  t = t.replace(/\bmultiply konstrukcija\b/gi, "kelių sluoksnių pagrindu");
  t = t.replace(/\bUV aliej\w*\b/gi, "aliejumi su apsauga nuo dėvėjimosi");
  t = t.replace(/\s*Rustiko klasė[^.]*\.?/gi, ".");
  t = t.replace(/\s*Klasikinė klasė\.?/gi, ".");
  t = t.replace(/\s*Prime AB klasė\.?/gi, ".");
  t = t.replace(/\s*Rustic klasė\.?/gi, ".");
  t = t.replace(/\s*Antique klasė\.?/gi, ".");
  t = t.replace(/\s+/g, " ");
  t = t.replace(/^\.+|\.+$/g, "");
  return t.trim();
}

function firstSentences(text, max) {
  const t = text.replace(/\s+/g, " ").trim();
  const parts = t.split(/(?<=[.!?])\s+/).filter((s) => s.trim().length > 12);
  if (parts.length === 0) return t.length > 200 ? t.slice(0, 197) + "…" : t;
  return parts.slice(0, max).join(" ").trim();
}

function closingLine(title, narrative, _solid, complex) {
  const click = /click|5g|„click“/i.test(title + narrative);
  if (complex) {
    return "Tinka šildomoms grindims.";
  }
  if (click) {
    return "Dalį variantų galima kloti ir „užsispaudžiančia“ sistema – verta pasitarti su montuotoju. Tinka šildomoms grindims.";
  }
  return "Tinka šildomoms grindims.";
}

function oeNote(filterLabel, sku) {
  if (filterLabel.includes("(OE)") && /^OE/i.test(sku)) {
    return " Filtre pažymėta „(OE)“ – tai atskira tiekimo eilutė; panašų matmenį turite ir „YE“ serijoje, palyginkite.";
  }
  return "";
}

function buildSimple(sku, title, dims, _grade, filterLabel, narrative) {
  const eng = isEngineered(title, dims);
  const solid = isSolidLine(title);
  const complex = isComplexPattern(title, filterLabel);
  const open = openingLine(sku, title, dims, eng, solid, complex);
  const narr = String(narrative || "").trim();
  let soft = narr ? softenTechnicalJargon(narr) : "";
  if (eng && soft.startsWith("Lentos su keliais sluoksniais – ")) {
    soft = soft.replace(/^Lentos su keliais sluoksniais – /, "");
  }
  let mid = soft ? firstSentences(soft, 2) : "";
  if (mid && !/[.!?]$/.test(mid)) mid = `${mid.trim()}.`;
  const close = closingLine(title, narr, solid, complex) + oeNote(filterLabel || "", sku);
  return [open, mid, close].filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .replace(/\s+([.!?])/g, "$1")
    .replace(/\.{2,}/g, ".")
    .replace(/\s*\.\s*\./g, ".")
    .trim();
}

function main() {
  const products = loadProducts();
  const bySku = Object.fromEntries(products.map((p) => [p[0], p]));
  const narratives = JSON.parse(fs.readFileSync(narrativePath, "utf8"));
  const out = {};
  for (const sku of Object.keys(narratives)) {
    const pr = bySku[sku];
    if (!pr) {
      console.warn("Missing product row for", sku);
      out[sku] = narratives[sku];
      continue;
    }
    const [, title, dims, grade, , filterLabel] = pr;
    out[sku] = buildSimple(sku, title, dims, grade, filterLabel || "", narratives[sku] || "");
  }
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2) + "\n", "utf8");
  console.log("Wrote", outPath, Object.keys(out).length, "keys (simple prose)");
}

main();
