/**
 * Generates SKU_DESC strings from PRODUCTS[]-equivalent rows.
 * Style: 2–3 sentences, ~40–60 words, LT, B2C-friendly.
 */
import fs from "fs";

const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");

function getSpecies(name) {
  const n = name;
  if (n.includes("Am. Walnut") || n.includes("Walnut HB")) return "Amerikiečių riešutmedis";
  if (n.includes("Am. Oak")) return "Amerikiečių ąžuolas";
  if (n.includes("French Oak") || n.includes("Versailles")) return "Prancūziškas ąžuolas";
  if (n.includes("White Oak")) return "Baltasis ąžuolas";
  if (n.includes("Solid Oak")) return "Masyvas ąžuolas";
  return "Daugiasluoksnis ąžuolas";
}

function getFinish(name) {
  const n = name.toLowerCase();
  if (n.includes("unfinished")) return "Be apdailos";
  if (n.includes("smoked")) return "Dūmintas";
  if (
    n.includes("white washed") ||
    n.includes("whitewashed") ||
    n.includes("cotton white") ||
    n.includes("grey washed")
  )
    return "Baltas ir pilkas tonas";
  if (
    n.includes("handscraped") ||
    n.includes("hand scraped") ||
    n.includes("distressed") ||
    n.includes("antique") ||
    n.includes("vintage")
  )
    return "Sendintas";
  if (n.includes("oil") || n.includes("oiled") || n.includes("hard wax")) return "Aliejuotas";
  if (n.includes("lac") || n.includes("lacquered") || n.includes("lacq")) return "Lakuotas";
  return "Lakuotas";
}

function getColorGroup(name) {
  const n = String(name || "").toLowerCase();
  const tamsios = [
    "double smoked",
    "luxe smoked",
    "walnut stain",
    "mississippi",
    "bronx",
    "putnam",
    "twilight",
    "hazelnut",
    "cinnamon",
    "mocha",
    "coffee",
    "espresso",
    "antique",
    "distressed",
    "vintage",
    "dark",
    "black",
  ];
  for (const kw of tamsios) {
    if (n.includes(kw)) return "Tamsios";
  }
  const pilkos = [
    "sandy grey",
    "rock grey",
    "driftwood",
    "moonstone",
    "charcoal",
    "graphite",
    "gunmetal",
    "livingston",
    "smoke",
    "smoked",
    "grey",
    "gray",
    "dove",
  ];
  for (const kw of pilkos) {
    if (n.includes(kw)) return "Pilkos / Dūmintos";
  }
  const sviesios = [
    "whitewashed",
    "white washed",
    "invisible",
    "scandi",
    "cotton",
    "ivory",
    "cream",
    "light",
    "white",
    "washed",
    "natural",
  ];
  for (const kw of sviesios) {
    if (n.includes(kw)) return "Šviesios";
  }
  const nat = ["oiled", "brushed", "golden", "honey", "wheat", "cognac", "brandy", "classic", "rustic", "warm"];
  for (const kw of nat) {
    if (n.includes(kw)) return "Natūralios";
  }
  return "Natūralios";
}

function firstLine(cat, species, dims) {
  const d = String(dims || "").trim();
  const isPattern = cat !== "PARKETLENTĖS";

  let woodIn = "";
  if (species === "Amerikiečių riešutmedis") {
    woodIn = "daugiasluoksnio riešutmedžio";
  } else if (species === "Daugiasluoksnis ąžuolas") {
    woodIn = "daugiasluoksnio ąžuolo";
  } else if (species === "Baltasis ąžuolas") {
    woodIn = "daugiasluoksnio baltojo ąžuolo";
  } else if (species === "Masyvas ąžuolas") {
    woodIn = "masyvaus ąžuolo";
  } else if (species === "Amerikiečių ąžuolas") {
    woodIn = "daugiasluoksnio amerikietiško ąžuolo";
  } else if (species === "Prancūziškas ąžuolas") {
    woodIn = "daugiasluoksnio prancūziško ąžuolo";
  } else {
    woodIn = "daugiasluoksnio ąžuolo";
  }

  if (species === "Amerikiečių riešutmedis" && !isPattern) {
    return `Riešutmedžio grindys su daugiasluoksniu pagrindu, matmenys ${d}.`;
  }
  if (species === "Masyvas ąžuolas" && !isPattern) {
    return `Masyvios ąžuolo grindys, matmenys ${d}.`;
  }
  if (cat === "CHEVRON (V RAŠTAS)") {
    return `Chevron rašto grindys iš ${woodIn}, matmenys ${d}.`;
  }
  if (cat === "EGLUTĖ (HERRINGBONE)") {
    return `Eglutės rašto grindys iš ${woodIn}, matmenys ${d}.`;
  }
  if (cat === "VERSALIO PANELĖS") {
    return `Versalio tipo grindų panelės iš ${woodIn}, matmenys ${d}.`;
  }
  if (species === "Baltasis ąžuolas") {
    return `Daugiasluoksnės baltojo ąžuolo grindys, matmenys ${d}.`;
  }
  if (species === "Amerikiečių ąžuolas") {
    return `Daugiasluoksnės amerikietiško ąžuolo grindys, matmenys ${d}.`;
  }
  if (species === "Prancūziškas ąžuolas") {
    return `Daugiasluoksnės prancūziško ąžuolo grindys, matmenys ${d}.`;
  }
  return `Daugiasluoksnės ąžuolo grindys, matmenys ${d}.`;
}

function toneHint(cg) {
  if (cg === "Tamsios") return "sodrus, tamsesnis tonas";
  if (cg === "Šviesios") return "šviesus, erdvės pojūtį didinantis tonas";
  if (cg === "Pilkos / Dūmintos") return "pilkas, šiuolaikiškai ramus tonas";
  return "natūralus, šiltas tonas";
}

function secondLine(name, finish, cg) {
  const n = name.toLowerCase();
  const brushed = n.includes("brushed");
  const smooth = n.includes("smooth") && !brushed;
  let tex = "";
  if (brushed) tex = " Šukuotas paviršius išryškina medienos raštą.";
  else if (smooth) tex = " Lygus paviršius atrodo švariai ir šiuolaikiškai.";

  const th = toneHint(cg);

  if (finish === "Be apdailos") {
    return `Be gamyklinės pabaigos išlieka ${th}; galėsite pasirinkti laką ar aliejų pagal interjerą.${tex}`;
  }
  if (finish === "Lakuotas") {
    return `Matomas ${th}, paviršius užbaigtas matiniu arba blizgiančiu laku, kuris išlaiko spalvą ir apsaugo medieną.${tex}`;
  }
  if (finish === "Aliejuotas") {
    return `Aliejumi baigtame paviršuje atsiskleidžia ${th} ir natūrali medienos šiluma.${tex}`;
  }
  if (finish === "Dūmintas") {
    return `Dūminis atspalvis suteikia gylio ir prabangos įspūdį; derės tiek šiuolaikiniame, tiek klasikiniame interjere.${tex}`;
  }
  if (finish === "Baltas ir pilkas tonas") {
    return `Baltas ir pilkas tonas suteikia lengvą, gaivų stilių ir švelniai praskaidrina bendrą kambario vaizdą.${tex}`;
  }
  if (finish === "Sendintas") {
    return `Sendintas paviršius sukuria gyvą tekstūrą ir geriau slepia smulkius kasdienius pėdsakus.${tex}`;
  }
  return `Paviršius paruoštas naudojimui; ${th} išlieka aiškiai matomas.${tex}`;
}

function thirdLine() {
  return "Tinka ir šildomoms grindims, gyvenamosioms ir komercinėms patalpoms.";
}

function buildDesc(row) {
  const finish = getFinish(row.name);
  const cg = getColorGroup(row.name);
  const species = getSpecies(row.name);
  const a = firstLine(row.cat, species, row.dims);
  const b = secondLine(row.name, finish, cg);
  const c = thirdLine();
  return `${a} ${b} ${c}`.replace(/\s+/g, " ").trim();
}

function parseProducts(html) {
  const s = html.indexOf("const PRODUCTS=[") + "const PRODUCTS=[".length;
  const e = html.indexOf("\n];\n\nconst SKU_IMAGES");
  const chunk = html.slice(s, e);
  const rows = [];
  const re = /\["([^"]*)","([^"]*)","([^"]*)","([^"]*)","([^"]*)"/g;
  let m;
  while ((m = re.exec(chunk))) {
    rows.push({ sku: m[1], name: m[2], dims: m[3], grade: m[4], cat: m[5] });
  }
  return rows;
}

function escapeJsString(s) {
  return JSON.stringify(s).slice(1, -1);
}

const rows = parseProducts(html);
const lines = ['const SKU_DESC={'];
for (const row of rows) {
  const text = buildDesc(row);
  const wc = text.split(/\s+/).filter(Boolean).length;
  if (wc > 65) {
    console.warn(row.sku, "word count", wc);
  }
  lines.push(`  "${row.sku}": "${escapeJsString(text)}",`);
}
lines[lines.length - 1] = lines[lines.length - 1].replace(/,$/, "");
lines.push("};");
console.log(lines.join("\n"));
