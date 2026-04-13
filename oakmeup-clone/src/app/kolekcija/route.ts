import { readFile } from "node:fs/promises";
import path from "node:path";

import { isProduktaiSubdomain, produktaiRedirectResponse } from "@/lib/produktai-subdomain";

const CATALOG_HTML_PATH = path.join(process.cwd(), "..", "index.html");

const PAGE_SHELL_STYLES = `
<style id="catalog-home-shell">
  .home-shell-header{position:sticky;top:0;z-index:120;background:#fff;border-bottom:1px solid #ececec}
  .home-shell-wrap{max-width:1320px;margin:0 auto;padding:14px 16px;display:flex;align-items:center;justify-content:space-between;gap:16px}
  .home-shell-brand{display:flex;align-items:center}
  .home-shell-brand svg{display:block;width:68px;height:auto}
  .home-shell-nav{display:flex;align-items:center;gap:28px}
  .home-shell-nav a{color:#111;text-decoration:none;font-size:14px;line-height:1}
  .home-shell-cta{margin-left:16px;background:#1C3A13;color:#D3FA99 !important;border-radius:999px;padding:12px 18px;font-weight:500}
  .home-shell-footer{background:#F4F4F5;padding:42px 0;position:relative;overflow:hidden}
  .home-shell-footer::after{content:"Oak me up";position:absolute;left:24px;bottom:-40px;font-size:180px;line-height:1;color:rgba(0,0,0,0.04);font-weight:500;pointer-events:none;white-space:nowrap}
  .home-shell-footer-wrap{max-width:1320px;margin:0 auto;padding:0 16px;display:flex;justify-content:space-between;gap:24px;position:relative;z-index:1}
  .home-shell-footer-left{max-width:420px}
  .home-shell-footer-left svg{display:block;width:72px;height:auto;margin-bottom:20px}
  .home-shell-footer-left p{margin:0;color:#1f2937;font-size:31px}
  .home-shell-footer-right{display:grid;grid-template-columns:1fr 1fr;gap:44px}
  .home-shell-footer-block-title{font-size:24px;color:#6b7280;margin:0 0 8px}
  .home-shell-footer-block-value{font-size:28px;color:#111827;text-decoration:none;display:block;line-height:1.3}
  .home-shell-footer-tax{grid-column:1 / -1;margin-top:8px}
  @media (max-width: 1024px){
    .home-shell-nav{gap:18px}
    .home-shell-footer::after{font-size:120px}
    .home-shell-footer-right{gap:26px}
  }
  @media (max-width: 809px){
    .home-shell-wrap{padding:12px 14px}
    .home-shell-nav{gap:12px;flex-wrap:wrap;justify-content:flex-end}
    .home-shell-nav a{font-size:13px}
    .home-shell-cta{padding:10px 14px}
    .home-shell-footer-wrap{flex-direction:column}
    .home-shell-footer-left p{font-size:18px}
    .home-shell-footer-block-title{font-size:14px}
    .home-shell-footer-block-value{font-size:20px}
    .home-shell-footer::after{font-size:80px;bottom:-18px}
  }
</style>
`;

const BRAND_SVG = `
<svg viewBox="0 0 92 57" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Oak Me Up">
<rect width="91.954" height="57" rx="1.96136" fill="#1C3A13"/>
<path d="M19.8245 25.5456H21.996L22.5639 28.9532V35H20.3924V28.6358L19.8245 25.5456ZM26.0551 25.3117C26.8903 25.3117 27.5974 25.4899 28.1765 25.8462C28.7667 26.2026 29.2121 26.7148 29.5128 27.383C29.8246 28.04 29.9805 28.8362 29.9805 29.7717V35H27.809V30.1224C27.809 29.1313 27.5974 28.3852 27.1742 27.8841C26.7622 27.3719 26.1553 27.1157 25.3535 27.1157C24.7856 27.1157 24.29 27.2549 23.8668 27.5333C23.4548 27.8006 23.1319 28.1792 22.898 28.6692C22.6753 29.1592 22.5639 29.7327 22.5639 30.3897L21.7956 29.9721C21.8958 28.9921 22.1352 28.1569 22.5138 27.4665C22.9036 26.7761 23.3991 26.2471 24.0005 25.8796C24.613 25.501 25.2978 25.3117 26.0551 25.3117ZM33.4549 25.3117C34.2901 25.3117 35.0028 25.4899 35.593 25.8462C36.1832 26.2026 36.6287 26.7148 36.9293 27.383C37.2411 28.04 37.397 28.8362 37.397 29.7717V35H35.2255V30.1224C35.2255 29.1313 35.0139 28.3852 34.5908 27.8841C34.1788 27.3719 33.5718 27.1157 32.7701 27.1157C32.2021 27.1157 31.7066 27.2549 31.2834 27.5333C30.8714 27.8006 30.5484 28.1792 30.3146 28.6692C30.0919 29.1592 29.9805 29.7327 29.9805 30.3897L29.2121 29.9721C29.3123 28.9921 29.5518 28.1569 29.9304 27.4665C30.3201 26.7761 30.8157 26.2471 31.417 25.8796C32.0295 25.501 32.7088 25.3117 33.4549 25.3117ZM44.7346 35.2339C43.6322 35.2339 42.6522 35.0278 41.7948 34.6158C40.9373 34.1926 40.2636 33.608 39.7736 32.8619C39.2836 32.1158 39.0386 31.2472 39.0386 30.2561C39.0386 29.2761 39.2669 28.4186 39.7235 27.6837C40.1912 26.9376 40.8315 26.3585 41.6444 25.9465C42.4685 25.5233 43.4095 25.3117 44.4674 25.3117C45.5253 25.3117 46.4384 25.5511 47.2068 26.03C47.9863 26.4977 48.5877 27.1603 49.0109 28.0177C49.434 28.8752 49.6456 29.883 49.6456 31.0412H40.7424V29.3875H48.5599L47.4741 30.0055C47.4407 29.3819 47.2904 28.8474 47.0231 28.4019C46.767 27.9565 46.4162 27.6169 45.9707 27.383C45.5364 27.138 45.0186 27.0155 44.4173 27.0155C43.7825 27.0155 43.2257 27.1436 42.7469 27.3997C42.2792 27.6558 41.9117 28.0177 41.6444 28.4855C41.3772 28.942 41.2435 29.4877 41.2435 30.1224C41.2435 30.824 41.3994 31.4309 41.7112 31.9432C42.0342 32.4554 42.4852 32.8508 43.0643 33.1292C43.6545 33.3964 44.3505 33.5301 45.1522 33.5301C45.8761 33.5301 46.6166 33.4187 47.3739 33.196C48.1311 32.9621 48.7993 32.6392 49.3783 32.2271V33.7973C48.7993 34.2428 48.0921 34.5935 47.2569 34.8497C46.4329 35.1058 45.5921 35.2339 44.7346 35.2339Z" fill="#D3FA99"/>
<path d="M69.6954 7.35498C70.2976 7.9579 74.3351 11.892 75.1626 12.726L79.5736 17.1504C80.4689 18.1292 81.6757 19.336 82.5089 20.2899C80.9286 21.9219 79.2622 23.6459 77.56 25.3892C76.3889 24.2205 74.9923 22.7346 73.7892 21.5014C72.5951 20.2774 71.1021 18.7613 69.9172 17.5134C69.4931 17.8994 62.8271 24.5653 62.0514 25.3401C61.0457 24.3354 57.6553 20.7151 57.0071 20.0319C57.8277 19.2211 58.9609 18.0788 59.7838 17.2398C61.9215 15.0466 64.0753 12.8676 66.2429 10.7032C67.3094 9.6422 68.6311 8.36016 69.6954 7.35498Z" fill="#D3FA99"/>
<path d="M69.9457 19.3953C70.24 19.6806 72.5708 22.1235 73.1718 22.708C76.3313 25.7804 79.8366 29.3348 82.7651 32.3396C81.6755 33.3573 77.9403 36.8052 77.4266 37.2859C76.5037 36.3455 65.8152 25.5421 64.6613 24.3413C65.9876 23.0711 68.8033 20.4277 69.9457 19.3953Z" fill="#D3FA99"/>
</svg>
`;

const DESIRED_HEADER = `
<header class="home-shell-header">
  <div class="home-shell-wrap">
    <a class="home-shell-brand" href="/" aria-label="Oak Me Up">${BRAND_SVG}</a>
    <nav class="home-shell-nav" aria-label="Pagrindinė navigacija">
      <a href="/kolekcija">Kolekcija</a>
      <a href="/#procesas">Procesas</a>
      <a href="/#privalumai">Privalumai</a>
      <a href="/#montavimas">Montavimas</a>
      <a href="/#projektai">Projektai</a>
      <a href="/#valuation-form">Kontaktai</a>
      <a class="home-shell-cta" href="/#valuation-form">Gauti sąmatą per 24 h</a>
    </nav>
  </div>
</header>
`;

const DESIRED_FOOTER = `
<footer class="home-shell-footer">
  <div class="home-shell-footer-wrap">
    <div class="home-shell-footer-left">
      ${BRAND_SVG}
      <p>Inžinerinės ąžuolo grindys su montavimu "iki rakto" - viena kaina, vienas kontaktas, viena garantija.</p>
    </div>
    <div class="home-shell-footer-right">
      <div>
        <p class="home-shell-footer-block-title">El. paštas</p>
        <a class="home-shell-footer-block-value" href="mailto:info@oakmeup.lt">info@oakmeup.lt</a>
      </div>
      <div>
        <p class="home-shell-footer-block-title">Telefono numeris</p>
        <a class="home-shell-footer-block-value" href="tel:+37061569962">+370 615 69 962</a>
      </div>
      <div class="home-shell-footer-tax">
        <p class="home-shell-footer-block-title">Įmonės rekvizitai</p>
        <span class="home-shell-footer-block-value">Pikantiškumas MB</span>
        <span class="home-shell-footer-block-value">304214969</span>
        <span class="home-shell-footer-block-value">LT100010042810</span>
      </div>
    </div>
  </div>
</footer>
`;

const applyDesiredShell = (catalogHtml: string) => {
  let output = catalogHtml;
  output = output.replace(/<header class="header">[\s\S]*?<\/header>/i, "");
  output = output.replace(/<footer[^>]*>[\s\S]*?<\/footer>/i, "");
  output = output.replace(/<\/head>/i, `${PAGE_SHELL_STYLES}\n</head>`);
  output = output.replace(/<body>/i, `<body>\n${DESIRED_HEADER}`);
  output = output.replace(/<\/body>/i, `${DESIRED_FOOTER}\n</body>`);
  return output;
};

export async function GET(request: Request) {
  if (isProduktaiSubdomain(request.headers.get("host"))) {
    return produktaiRedirectResponse();
  }

  try {
    const catalogHtml = await readFile(CATALOG_HTML_PATH, "utf-8");
    const shelledHtml = applyDesiredShell(catalogHtml);
    return new Response(shelledHtml, {
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "no-store",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      `<html><body><h1>Missing catalog file</h1><p>${CATALOG_HTML_PATH}</p><pre>${message}</pre></body></html>`,
      {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      },
    );
  }
}
