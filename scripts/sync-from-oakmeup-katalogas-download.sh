#!/usr/bin/env bash
# Sinchronizuoja GitHub ZIP (oakmeup-katalogas-main) su šiuo repo.
# Po šito paleiskite diff su repo index.html: jei kopijuotas švarus ZIP be Framer tilto,
# į index.html reikia įterpti try{ window.__omuCatalogGlobalsBridged ... } bloką
# (žr. dabartinį repo index.html arba KolekcijosCatalogEmbed.tsx → injectCatalogGlobalBridge).
set -euo pipefail
SRC="${1:-$HOME/Downloads/oakmeup-katalogas-main}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
if [[ ! -d "$SRC" ]]; then
  echo "Nerasta: $SRC" >&2
  echo "Naudojimas: $0 [/kelias/į/oakmeup-katalogas-main]" >&2
  exit 1
fi
cp "$SRC/index.html" "$ROOT/index.html"
cp "$SRC/Frame 8.svg" "$ROOT/Frame 8.svg"
cp "$SRC/sku_descriptions_lt.json" "$ROOT/sku_descriptions_lt.json"
cp "$SRC/sku_descriptions_lt_v1_paragraphs.json" "$ROOT/sku_descriptions_lt_v1_paragraphs.json"
cp "$SRC/scripts/generate-sku-desc.mjs" "$ROOT/scripts/generate-sku-desc.mjs"
cp "$SRC/scripts/build-consumer-descriptions.mjs" "$ROOT/scripts/build-consumer-descriptions.mjs"
echo "OK: nukopijuota iš $SRC"
echo "Jei index.html neturi __omuCatalogGlobalsBridged, atkurkite tiltą iš git arba ranka."
echo "Sinchronizuoti oakmeup-clone freeze šaltinį:"
echo "  cp \"$ROOT/index.html\" \"$ROOT/oakmeup-clone/source/index.html\""
