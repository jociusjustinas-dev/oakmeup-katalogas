/**
 * Sujungia „vartotojišką“ mini kortelę su esamu naraciniu tekstu.
 * Šaltinis narratyvui: sku_descriptions_lt_v1_paragraphs.json
 * Produktų matmenys / serija: index.html → PRODUCTS
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

/** @returns {{total:number|null, wear:number|null, width:number|null, length:string|null, raw:string}} */
function parseDims(dims) {
  const raw = dims.trim();
  const eng = raw.match(/^(\d+)\/(\d+)\s*×\s*(\d+)(?:\s*×\s*([\dRL.\-–—]+))?/i);
  if (eng) {
    return {
      total: +eng[1],
      wear: +eng[2],
      width: +eng[3],
      length: eng[4] ? eng[4] : null,
      raw,
    };
  }
  const sol = raw.match(/^(\d+)\s*×\s*(\d+)(?:\s*×\s*([\dRL.\-–—]+))?/i);
  if (sol) {
    return {
      total: +sol[1],
      wear: +sol[1],
      width: +sol[2],
      length: sol[3] ? sol[3] : null,
      raw,
    };
  }
  return { total: null, wear: null, width: null, length: null, raw };
}

function isEngineered(title, dims) {
  if (/Multiply/i.test(title)) return true;
  if (/^Solid |^OSH|^SC\d/i.test(title)) return false;
  if (/\bEng\.|Engineered|White Oak|French Oak|Am\. Oak|Am\. Walnut|Versailles|Versalio|\bHB\d|\bHB142|\bRH|^C\d|^C1|^ME|^NYC|^WAL|^BL|^EFS|^YE|^OE|^V1|^V19|^RH|^WV|^HB18|^RH/i.test(title))
    return true;
  return /\d+\/\d+\s*×/.test(dims);
}

function isSolidLine(title) {
  return /^Solid |^OSH\d|^SC\d/i.test(title) && !/Multiply/i.test(title);
}

function hasClickSystem(title) {
  return /Click|5G/i.test(title);
}

function has3ply(title) {
  return /3ply|3-ply|3 ply/i.test(title);
}

function isUnfinished(title) {
  return /Unfinished/i.test(title);
}

function isThinEconomy(title, dims) {
  return /\b10\s*mm\b/i.test(title + dims) || /^Eng\. Oak HB.*10/i.test(title);
}

function isComplexPattern(title) {
  return /\bHB\b|Herringbone|Chevron|Versailles|Versalio|eglutė|parketo blok|Parquet block/i.test(title);
}

function narrativeImpliesClick(narrative) {
  return /click|„click“|plūduriuojan/i.test(narrative);
}

function buildCard(sku, title, dims, grade, filterLabel, narrative) {
  const eng = isEngineered(title, dims);
  const solid = isSolidLine(title);
  const dm = parseDims(dims);
  const click = hasClickSystem(title) || narrativeImpliesClick(narrative);
  const threePly = has3ply(title);
  const unf = isUnfinished(title);
  const thin = isThinEconomy(title, dims);
  const complex = isComplexPattern(title) || /EGLUTĖ|CHEVRON|VERSALIO|HERRINGBONE/i.test(filterLabel);

  const lines = [];

  lines.push("━━━ Klientui svarbu ━━━");

  if (thin) {
    lines.push(
      "✓ Šildomos grindys: dažniausiai tinka, jei laikomasi temperatūros rekomendacijų ir gamintojo instrukcijos (yp. plonesnių dangų atveju).",
    );
    lines.push("○ Komercinės patalpos: įvertinkite apkrovą; dažniausiai labiau tinka gyvenamosioms ir lengvesniam praėjimui.");
  } else if (solid && complex) {
    lines.push(
      "✓ Šildomos grindys: paprastai galima, tačiau svarbu tinkami klijai, apkrova ir montuotojo rekomendacijos.",
    );
    lines.push("✓ Komercija: įmanoma su reguliaria priežiūra; intensyviai naudojamoms zonoms – pasitarkite dėl pabaigos ir priežiūros grafiko.");
  } else {
    lines.push(
      "✓ Šildomos grindys: tinka, kai laikomasi tipinių paviršiaus temperatūros ribų (dažniausiai iki ~27 °C) ir taisyklingo pakloto bei montažo.",
    );
    lines.push("✓ Komercija: tinka tipinėms komercinėms patalpoms su įprastu praėjimu (ne sunkioji pramonė).");
  }

  const wear = dm.wear;
  if (solid && dm.total && dm.total >= 15) {
    lines.push("✓ Atnaujinimas: masyvi lentą galima kelis kartus šlifuoti ir perdažyti/peralieti per eksploatacijos laiką.");
  } else if (eng && wear != null && wear >= 4) {
    lines.push("✓ Atnaujinimas: storesnis viršutinis sluoksnis leidžia šlifuoti ir atnaujinti pabaigą (dažniau po ilgesnio eksploatavimo).");
  } else if (eng && wear != null && wear === 3) {
    lines.push(
      "✓ Atnaujinimas: ribota apimtimi galima šlifuoti ir atnaujinti (priklausomai nuo likusio sluoksnio; tipiškai po 10–15 m. eksploatacijos).",
    );
  } else if (eng && wear != null && wear <= 2) {
    lines.push("○ Atnaujinimas: plonesnis viršutinis sluoksnis – atnaujinimo galimybės ribotesnės; aktualu prieš užsakant visą plotą.");
  } else if (unf) {
    lines.push("✓ Atnaujinimas: po pasirinktos gamyklos arba projekto pabaigos – tolesnis gyvavimo ciklas priklauso nuo uždėto sluoksnio storio.");
  } else {
    lines.push("✓ Priežiūra: reguliarus valymas ir gamintojo rekomenduojamos priemonės; kai kuriuos variantus galima atnaujinti pagal sluoksnio storį.");
  }

  if (click) {
    lines.push(
      "✓ Montažas: galimas „click“ / plūduriuojantis ar klijuojamas variantas (priklausomai nuo projekto); patyręs meistras sumažina rizikas.",
    );
  } else if (complex || (!click && eng && /T&G|Tongue|3ply|3-ply/i.test(title))) {
    lines.push("✗ Montažas: dažniausiai klijuojamas ir/ar reikalaujantis patirties; praktiškai rekomenduojamas meistro darbas.");
  } else if (solid && !complex) {
    lines.push("○ Montažas: masyvios lentos – klijavimas / mechaninis tvirtinimas pagal instrukciją; dažniau samdomas meistras.");
  } else {
    lines.push("✗ Montažas: klijuojamas / tikslus montažas; savadarbis įmanomas tik turint patirtį – rekomenduojama pas meistrą.");
  }

  lines.push("○ Kaina: orientacinė suma nėra vieša – nurodoma individualioje užklausoje (partija, apimtis, pristatymas).");
  lines.push("○ Garantija: konkretų terminą ir sąlygas gausite sutartyje / tiekėjo pasiūlyme užsakymo metu.");

  lines.push("");
  lines.push("━━━ Matmenys ir konstrukcija ━━━");
  if (dm.total != null && /\d+\/\d+/.test(dm.raw)) {
    lines.push(`Katalogo matmuo: ${dm.raw}`);
    lines.push(`Bendra storis: ~${dm.total} mm | Kietmedžio sluoksnis (nusidėvėjimas): ~${dm.wear} mm | Plotis: ${dm.width} mm${dm.length ? ` | Ilgis / išdėstymas: ${dm.length}` : ""}`);
    lines.push(
      "Multiply / „kelių sluoksnių“ lenta – keli suklijuoti medienos sluoksniai: viršuje matomas ąžuolas, apačioje stabilizuojantis pagrindas (mažiau „veda“ nei viena storio lenta).",
    );
    if (threePly) {
      lines.push(
        "3ply (three-ply) – trijų sluoksnių sandara; dažnai geresnis matmenų stabilumas ir atsparumas klimato svyravimams.",
      );
    }
  } else if (dm.total != null) {
    lines.push(`Katalogo matmuo: ${dm.raw}`);
    lines.push(`Vientisa (masyvi) lentos storis: ~${dm.total} mm | Plotis: ${dm.width} mm${dm.length ? ` | Ilgis: ${dm.length}` : ""}`);
  } else {
    lines.push(`Katalogo matmuo: ${dm.raw}`);
  }

  if (filterLabel && filterLabel.trim()) {
    lines.push(`Katalogo eilutė / filtras: ${filterLabel}`);
  }
  lines.push(`Rūšies žyma kataloge: ${grade} | SKU: ${sku}`);

  if (filterLabel.includes("(OE)")) {
    lines.push(
      "Skirtingai nuo „YE“ to paties matmens: filtre pažymėta „(OE)“ – atskira tiekimo / katalogo eilutė (gali skirtis partija, logistika, kodas).",
    );
  } else if (/^OE/i.test(sku)) {
    lines.push(
      'Panašūs produktai: „OE“ serija – atskira katalogo pozicija; jei matmuo toks pat kaip „YE“, palyginkite filtro eilutę ir užklausą.',
    );
  } else if (/^YE/i.test(sku)) {
    lines.push('Panašūs produktai: „YE“ serija – tipinė pagrindinė katalogo pozicija šiam formatui.');
  }

  lines.push("");
  lines.push("━━━ Išsamiau (techninė / stiliaus santrauka) ━━━");
  lines.push(narrative.trim());

  return lines.join("\n");
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
    const [ , title, dims, grade, , filterLabel] = pr;
    out[sku] = buildCard(sku, title, dims, grade, filterLabel || "", narratives[sku]);
  }
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2) + "\n", "utf8");
  console.log("Wrote", outPath, Object.keys(out).length, "keys");
}

main();
