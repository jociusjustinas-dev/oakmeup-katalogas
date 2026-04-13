import { addPropertyControls, ControlType } from "framer"
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react"

type ViewMode = "grid" | "rows"

type Props = {
    dataUrl: string
    initialView: ViewMode
    hideHeader: boolean
    headerOffset: number
    cardsPerRow: number
    minHeight: number
    style?: CSSProperties
}

/** Pin a commit in Framer if you need a frozen build; @main tracks latest catalog HTML. */
const DEFAULT_DATA_URL =
    "https://cdn.jsdelivr.net/gh/jociusjustinas-dev/oakmeup-katalogas@main/index.html"
const DEFAULT_BASE_URL =
    "https://cdn.jsdelivr.net/gh/jociusjustinas-dev/oakmeup-katalogas@main/"

function escapeHtmlAttribute(value: string) {
    return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;")
}

function getBaseUrl(sourceUrl: string) {
    try {
        return new URL(".", sourceUrl || DEFAULT_DATA_URL).toString()
    } catch {
        return DEFAULT_BASE_URL
    }
}

function setDefaultView(html: string, view: ViewMode) {
    const scriptValue = view === "grid" ? "grid" : "list"
    let next = html.replace(
        /let\s+viewMode\s*=\s*['"](?:list|grid)['"]\s*;/,
        `let viewMode='${scriptValue}';`,
    )

    if (view === "grid") {
        next = next
            .replace(
                'id="view-list" class="view-toggle-btn active" onclick="setView(\'list\')" title="Sąrašas" aria-pressed="true"',
                'id="view-list" class="view-toggle-btn" onclick="setView(\'list\')" title="Sąrašas" aria-pressed="false"',
            )
            .replace(
                'id="view-grid" class="view-toggle-btn" onclick="setView(\'grid\')" title="Tinklelis" aria-pressed="false"',
                'id="view-grid" class="view-toggle-btn active" onclick="setView(\'grid\')" title="Tinklelis" aria-pressed="true"',
            )
    }

    return next
}

function removeEmbeddedFooter(html: string) {
    return html.replace(/<footer\b[\s\S]*?<\/footer>/i, "")
}

/** Inserts grid "Pridėti į užklausą" into the catalog's formatProductItem template (CDN main lacks it). */
function injectGridInquiryRow(html: string) {
    if (html.includes('class="prod-card-add-inquiry${sel')) return html
    const re = /<div class="prod-card-foot">\s*<button type="button" class="cmp-btn/
    if (!re.test(html)) return html
    const row =
        '<div class="prod-card-foot">\n' +
        '        <button type="button" class="prod-card-add-inquiry${sel?\' prod-card-add-inquiry--on\':\'\'}" onclick="event.stopPropagation();toggleProd(\'${p[0]}\')">${sel?\'Išimti iš užklausos\':\'Pridėti į užklausą\'}</button>\n' +
        '        <button type="button" class="cmp-btn'
    return html.replace(re, row)
}

/** Lexical `let`/`const` catalog globals are not on `window`; Framer compare script reads `window.*`. */
function injectCatalogGlobalBridge(html: string) {
    if (html.includes("__omuCatalogGlobalsBridged")) return html
    const needle =
        "let compareImgIndex={}; // sku -> current image index\nlet gridImgIndex={}; // sku -> katalogo tinklelio karuselė"
    if (!html.includes(needle)) return html
    const bridge = `let compareImgIndex={}; // sku -> current image index
try{
  window.__omuCatalogGlobalsBridged=1;
  Object.defineProperty(window,'selected',{get(){return selected;},configurable:true});
  Object.defineProperty(window,'compareSelected',{get(){return compareSelected;},set(v){compareSelected=v;},configurable:true});
  Object.defineProperty(window,'compareImgIndex',{get(){return compareImgIndex;},set(v){compareImgIndex=v;},configurable:true});
  Object.defineProperty(window,'PRODUCTS',{get(){return PRODUCTS;},configurable:true});
  Object.defineProperty(window,'SKU_IMAGES',{get(){return SKU_IMAGES;},configurable:true});
}catch(_e){}
let gridImgIndex={}; // sku -> katalogo tinklelio karuselė`
    return html.replace(needle, bridge)
}

/** Self-contained compare UI for Framer iframe (native fixed bar/modal often off-screen when iframe height = full document). */
const OMU_FRAMER_COMPARE_SHELL = `
<div id="omu-framer-compare-sticky" class="omu-framer-compare-sticky" aria-hidden="true">
  <button type="button" id="omu-framer-compare-sticky-btn" class="omu-framer-compare-sticky-btn" onclick="window.omuFrCompareOpen && window.omuFrCompareOpen()">Palyginti (0)</button>
</div>
<div id="omu-framer-compare-overlay" class="omu-framer-compare-overlay" aria-hidden="true" onclick="if(event.target===this &amp;&amp; window.omuFrCompareClose)window.omuFrCompareClose(event)">
  <div class="omu-framer-compare-modal compare-modal" role="dialog" aria-modal="true" aria-label="Palyginti produktus" onclick="event.stopPropagation()">
    <div class="omu-framer-compare-top compare-top">
      <div class="omu-framer-compare-title compare-title">Palyginti produktus (<span id="omu-framer-compare-count">0</span>)</div>
      <button type="button" class="omu-framer-compare-x compare-close" onclick="window.omuFrCompareClose && window.omuFrCompareClose(event)" aria-label="Uždaryti"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
    </div>
    <div id="omu-framer-compare-body" class="compare-body"></div>
    <div class="omu-framer-compare-cta compare-cta">
      <p class="compare-cta-text">Norite sužinoti šių produktų kainą? Užpildykite užklausą — atsakysime su pasiūlymu.</p>
      <div class="compare-cta-actions">
        <button type="button" class="compare-cta-btn" onclick="window.omuFrCompareOpenInquiry && window.omuFrCompareOpenInquiry()">Pateikti užklausą</button>
      </div>
    </div>
    <div id="omu-framer-compare-inquiry" class="compare-inquiry omu-framer-compare-inquiry" aria-hidden="true">
      <div id="omu-framer-compare-inquiry-inner"></div>
    </div>
  </div>
</div>
`

function prepareHtml(
    html: string,
    sourceUrl: string,
    hideHeader: boolean,
    initialView: ViewMode,
    headerOffset: number,
    cardsPerRow: number,
) {
    const baseUrl = getBaseUrl(sourceUrl)
    const escapedBase = escapeHtmlAttribute(baseUrl)
    const logoUrl = `${baseUrl}Frame%208.svg`
    const safeHeaderOffset = Math.max(0, Math.round(headerOffset || 0))
    const safeCardsPerRow = Math.max(1, Math.min(6, Math.round(cardsPerRow || 4)))
    const overrides = `
<style id="omu-framer-overrides">
:root{--omu-host-header:${safeHeaderOffset}px;--omu-grid-cols:${safeCardsPerRow};--omu-sidebar-bottom:80px}
html{scroll-padding-top:var(--omu-host-header);overflow-x:hidden;overflow-y:visible;height:auto!important}
body{overflow-x:hidden;overflow-y:visible;height:auto!important;min-height:0!important}
.header{display:${hideHeader ? "none" : "flex"}!important}
.layout{padding-top:var(--omu-host-header)!important;box-sizing:border-box;min-height:auto!important;max-width:100%!important;overflow-x:hidden!important;overflow-y:visible!important;align-items:stretch!important}
.main{min-width:0!important;max-width:100%!important;overflow-x:hidden!important;overflow-y:visible!important;box-sizing:border-box!important}
.main-top{display:flex!important;visibility:visible!important;opacity:1!important;position:relative;z-index:4}
.catalog-root,.catalog-root--grid{width:100%!important;max-width:100%!important;overflow-x:hidden!important;box-sizing:border-box!important}
.result-count{display:block!important;visibility:visible!important;opacity:1!important}.result-count strong{margin-right:4px}.view-toggle{display:flex!important;visibility:visible!important;opacity:1!important}
.sidebar{position:relative!important;top:auto!important;align-self:stretch!important;height:auto!important;max-height:none!important;min-height:auto!important;overflow:visible!important;overflow-x:hidden!important;padding-bottom:24px!important;box-sizing:border-box!important}.sidebar-content{padding-bottom:16px!important}
.catalog-root--grid .sub-block{grid-template-columns:repeat(var(--omu-grid-cols),minmax(0,1fr))!important;gap:14px!important;padding:12px 14px 16px!important;width:100%!important;max-width:100%!important;box-sizing:border-box!important}
.catalog-root--grid .prod-card{position:relative!important;border:0!important;border-radius:8px!important;overflow:visible!important;background:#1C3A13!important;color:#FBFAF9!important;box-shadow:none!important;display:flex!important;flex-direction:column!important;min-height:470px!important;padding:10px!important;box-sizing:border-box!important;transition:transform .18s ease!important}
.catalog-root--grid .prod-card:hover{transform:translateY(-2px)!important;background:#1C3A13!important}.catalog-root--grid .prod-card.selected,.catalog-root--grid .prod-card.cmp-on{box-shadow:0 0 0 2px #D3FA99 inset!important;background:#1C3A13!important}.catalog-root--grid .prod-card::after{content:none!important}
.catalog-root--grid .prod-card-media{position:relative!important;inset:auto!important;z-index:1!important;width:100%!important;height:218px!important;aspect-ratio:auto!important;background:#EDEBE4!important;overflow:hidden!important;flex:0 0 auto!important;border-radius:8px!important}
.catalog-root--grid .prod-card-slide,.catalog-root--grid .prod-card-slide img,.catalog-root--grid .prod-card-media-ph{width:100%!important;height:100%!important;min-height:100%!important;display:block!important;object-fit:cover!important}.catalog-root--grid .prod-card-slide img{transition:transform .35s ease!important}.catalog-root--grid .prod-card:hover .prod-card-slide img{transform:scale(1.025)!important}
.catalog-root--grid .prod-card-pick-row{position:absolute!important;top:18px!important;left:18px!important;right:auto!important;z-index:5!important;display:inline-flex!important;align-items:center!important;gap:7px!important;width:auto!important;max-width:calc(100% - 36px)!important;padding:7px 10px!important;border:1px solid rgba(211,250,153,.28)!important;border-radius:6px!important;background:rgba(28,58,19,.7)!important;backdrop-filter:blur(24px)!important;color:#D3FA99!important;cursor:pointer!important}
.catalog-root--grid .prod-card.selected .prod-card-pick-row{border-color:rgba(211,250,153,.55)!important;background:rgba(211,250,153,.14)!important}
.catalog-root--grid .prod-card .cb{width:14px!important;height:14px!important;border:1.5px solid rgba(211,250,153,.86)!important;border-radius:4px!important;background:rgba(255,255,255,.08)!important;color:#1C3A13!important;flex-shrink:0!important;display:flex!important;align-items:center!important;justify-content:center!important}.catalog-root--grid .prod-card .cb svg{display:none!important;width:10px!important;height:10px!important}.catalog-root--grid .prod-card.selected .cb{background:#D3FA99!important;border-color:#D3FA99!important;color:#1C3A13!important}.catalog-root--grid .prod-card.selected .cb svg{display:block!important;color:#1C3A13!important;fill:none!important;stroke:#1C3A13!important}.catalog-root--grid .prod-card.selected .cb svg *,.catalog-root--grid .prod-card.selected .cb svg path,.catalog-root--grid .prod-card.selected .cb svg polyline,.catalog-root--grid .prod-card.selected .cb svg line,.catalog-root--grid .prod-card.selected .cb svg circle,.catalog-root--grid .prod-card.selected .cb svg g{stroke:#1C3A13!important;fill:none!important;stroke-width:2px!important}
.catalog-root--grid .prod-card-pick-label{position:relative!important;font-family:'Geist Mono',monospace!important;font-size:9px!important;line-height:1.15!important;font-weight:500!important;letter-spacing:.04em!important;text-transform:uppercase!important;color:#D3FA99!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
.catalog-root--grid .prod-card-body{position:relative!important;z-index:0!important;display:flex!important;flex-direction:column!important;gap:7px!important;padding:18px 18px 16px!important;color:#FBFAF9!important;background:#1C3A13!important;flex:1 1 auto!important;min-height:0!important;overflow:visible!important}
.catalog-root--grid .prod-card-body>.card-inquiry-link{display:none!important}
.catalog-root--grid .prod-subtitle{order:0!important;font-family:'Geist Mono',monospace!important;font-size:10px!important;line-height:1.25!important;font-weight:500!important;letter-spacing:.04em!important;text-transform:uppercase!important;color:#D3FA99!important;opacity:1!important}
.catalog-root--grid .prod-card-name{order:1!important;font-family:Geist,Inter,Arial,sans-serif!important;font-size:17px!important;line-height:1.1!important;font-weight:500!important;letter-spacing:-.02em!important;color:#FBFAF9!important;margin:0!important;text-wrap:balance!important}
.catalog-root--grid .prod-card-dims{order:2!important;font-family:'Geist Mono',monospace!important;font-size:10px!important;line-height:1.35!important;font-weight:500!important;letter-spacing:.03em!important;color:#D3FA99!important;margin-top:1px!important;text-transform:uppercase!important}
.catalog-root--grid .card-desc{order:3!important;font-family:Geist,Inter,Arial,sans-serif!important;font-size:12px!important;line-height:1.32!important;color:rgba(251,250,249,.88)!important;opacity:1!important;-webkit-line-clamp:2!important;margin-top:1px!important}
.catalog-root--grid .grade{order:4!important;width:max-content!important;max-width:100%!important;border:1px solid rgba(211,250,153,.28)!important;border-radius:6px!important;background:rgba(211,250,153,.1)!important;color:#D3FA99!important;font-family:'Geist Mono',monospace!important;font-size:9px!important;font-weight:500!important;letter-spacing:.04em!important;text-transform:uppercase!important;padding:6px 8px!important;margin-top:2px!important;overflow:hidden!important;text-overflow:ellipsis!important}
.catalog-root--grid .card-inquiry-link{display:flex!important;align-items:center!important;justify-content:center!important;gap:10px!important;width:100%!important;max-width:100%!important;min-width:0!important;border:1.5px solid rgba(255,255,255,.25)!important;border-radius:200px!important;background:#fff!important;color:#1C3A13!important;backdrop-filter:blur(40px)!important;font-family:Geist,Inter,Arial,sans-serif!important;font-size:14px!important;line-height:1!important;font-weight:600!important;text-align:center!important;text-decoration:none!important;padding:12px 20px!important;cursor:pointer!important;min-height:44px!important;white-space:nowrap!important;opacity:1!important;visibility:visible!important;transition:background .15s,color .15s,border-color .15s!important}
.catalog-root--grid .prod-card.selected .card-inquiry-link,.catalog-root--grid .omu-inquiry-btn[aria-pressed="true"]{background:#1C3A13!important;color:#fff!important;border:1.5px solid #D3FA99!important}
.catalog-root--grid .cmp-btn{box-sizing:border-box!important;display:flex!important;align-items:center!important;justify-content:center!important;width:100%!important;max-width:100%!important;min-height:44px!important;padding:12px 20px!important;margin:0!important;flex-shrink:0!important;border:1.5px solid rgba(211,250,153,.45)!important;border-radius:200px!important;background:transparent!important;color:#D3FA99!important;font-family:Geist,Inter,Arial,sans-serif!important;font-size:14px!important;font-weight:600!important;line-height:1!important;cursor:pointer!important;white-space:nowrap!important;transition:background .15s,color .15s,border-color .15s!important;-webkit-appearance:none!important;appearance:none!important}
.catalog-root--grid .cmp-btn:hover{border-color:#D3FA99!important;background:rgba(211,250,153,.1)!important}
.catalog-root--grid .cmp-btn.cmp-on{background:#D3FA99!important;color:#1C3A13!important;border-color:#D3FA99!important}
.catalog-root--grid .cmp-btn.cmp-locked{opacity:.55!important;cursor:not-allowed!important}
.catalog-root--grid .prod-card-foot{position:relative!important;z-index:6!important;display:flex!important;flex-direction:column!important;gap:10px!important;padding:0 18px 18px!important;margin-top:auto!important;background:#1C3A13!important;box-sizing:border-box!important;flex-shrink:0!important}
.catalog-root--grid .prod-card-add-inquiry{box-sizing:border-box!important;display:flex!important;align-items:center!important;justify-content:center!important;width:100%!important;max-width:100%!important;min-width:0!important;margin:0!important;padding:12px 20px!important;min-height:44px!important;flex-shrink:0!important;border:1.5px solid rgba(255,255,255,.25)!important;border-radius:200px!important;background:#fff!important;color:#1C3A13!important;font-family:Geist,Inter,Arial,sans-serif!important;font-size:14px!important;font-weight:600!important;line-height:1!important;cursor:pointer!important;white-space:nowrap!important;transition:background .15s,color .15s,border-color .15s!important;box-shadow:0 1px 0 rgba(0,0,0,.04)!important;opacity:1!important;visibility:visible!important;-webkit-appearance:none!important;appearance:none!important}
.catalog-root--grid .prod-card-add-inquiry:hover{background:#FBFAF9!important;border-color:rgba(255,255,255,.45)!important}
.catalog-root--grid .prod-card.selected .prod-card-add-inquiry,.catalog-root--grid .prod-card-add-inquiry.prod-card-add-inquiry--on{background:#1C3A13!important;color:#fff!important;border:1.5px solid #D3FA99!important;box-shadow:none!important}
.catalog-root--grid .prod-card.selected .prod-card-add-inquiry:hover,.catalog-root--grid .prod-card-add-inquiry.prod-card-add-inquiry--on:hover{background:#234a18!important;border-color:#D3FA99!important;color:#fff!important}
.catalog-root--grid .omu-inline-inquiry{order:10!important;margin-top:auto!important;width:100%!important;display:flex!important;visibility:visible!important;padding-top:10px!important}
.catalog-root--grid .omu-inline-inquiry .omu-inquiry-btn{display:flex!important;visibility:visible!important;pointer-events:auto!important;box-shadow:0 1px 0 rgba(0,0,0,.04)!important}
.catalog-root--grid .card-nav{z-index:5!important;background:rgba(28,58,19,.64)!important;color:#D3FA99!important;border:1px solid rgba(211,250,153,.24)!important;backdrop-filter:blur(16px)!important}.catalog-root--grid .card-dots{z-index:5!important;bottom:10px!important}.catalog-root--grid .card-dot{background:rgba(255,255,255,.52)!important}.catalog-root--grid .card-dot.active{background:#D3FA99!important}
#compare-sticky,#compare-overlay{display:none!important;visibility:hidden!important;pointer-events:none!important}
.cmp-limit-tooltip{z-index:2147483645!important}
.omu-framer-compare-sticky{position:fixed!important;left:0!important;right:0!important;bottom:0!important;z-index:2147483646!important;display:flex!important;justify-content:center!important;padding:12px 20px!important;background:#1C3A13!important;box-shadow:0 -10px 40px rgba(0,0,0,.18)!important;transform:translateY(120%)!important;opacity:0!important;pointer-events:none!important;transition:transform .28s ease,opacity .28s ease!important;box-sizing:border-box!important}
.omu-framer-compare-sticky.omu-framer-compare-sticky--visible{transform:translateY(0)!important;opacity:1!important;pointer-events:auto!important}
.omu-framer-compare-sticky-btn{background:#D3FA99!important;border:none!important;border-radius:999px!important;padding:12px 22px!important;color:#1C3A13!important;font-weight:700!important;font-size:14px!important;font-family:Geist,Inter,Arial,sans-serif!important;cursor:pointer!important;box-shadow:0 10px 28px rgba(0,0,0,.22)!important}
.omu-framer-compare-overlay{position:fixed!important;inset:0!important;background:rgba(0,0,0,.55)!important;z-index:2147483647!important;display:none!important;align-items:flex-start!important;justify-content:center!important;padding:26px 16px!important;overflow:auto!important;box-sizing:border-box!important}
.omu-framer-compare-overlay.omu-framer-compare-overlay--open{display:flex!important}
.omu-framer-compare-modal{background:var(--white,#FBFAF9)!important;border-radius:14px!important;width:min(1200px,96vw)!important;max-height:calc(100vh - 26px)!important;overflow:auto!important;padding:18px!important;box-shadow:0 22px 62px rgba(0,0,0,.35)!important;box-sizing:border-box!important}
.omu-framer-compare-inquiry.compare-inquiry{display:none!important;margin-top:4px!important;padding-top:18px!important;border-top:1px solid var(--border,rgba(0,0,0,.08))!important}
.omu-framer-compare-inquiry.compare-inquiry.open{display:block!important}
@media(max-width:640px){.omu-framer-compare-overlay{padding:12px 10px!important;align-items:stretch!important}.omu-framer-compare-modal{width:100%!important;max-width:none!important;border-radius:12px!important;padding:14px!important;max-height:calc(100vh - 24px)!important}}
@supports (height:100dvh){.sidebar{height:auto!important;max-height:none!important;overflow:visible!important}}
@media(max-width:1180px){.catalog-root--grid .sub-block{grid-template-columns:repeat(3,minmax(0,1fr))!important}.catalog-root--grid .prod-card{min-height:450px!important}.catalog-root--grid .prod-card-media{height:200px!important}.catalog-root--grid .prod-card-name{font-size:17px!important}}
@media(max-width:900px){.catalog-root--grid .sub-block{grid-template-columns:repeat(2,minmax(0,1fr))!important}.catalog-root--grid .prod-card{min-height:440px!important}.catalog-root--grid .prod-card-media{height:198px!important}}
@media(max-width:1024px){.layout{padding-top:var(--omu-host-header)!important;min-height:auto!important}.sidebar{position:relative!important;top:auto!important;height:auto!important;max-height:none!important;overflow-y:visible!important;overflow-x:hidden!important;padding-bottom:20px!important;z-index:48!important}.sidebar-content{padding-bottom:20px!important}.catalog-root--grid .sub-block{grid-template-columns:1fr!important}.catalog-root--grid .prod-card{min-height:450px!important}.catalog-root--grid .prod-card-media{height:220px!important}.catalog-root--grid .prod-card-body{padding:18px 18px 16px!important}.catalog-root--grid .prod-card-name{font-size:18px!important}.catalog-root--grid .card-inquiry-link{font-size:14px!important;min-height:44px!important;padding:12px 18px!important}}
</style>`
    const actionSwapScript = `
<script id="omu-action-swap">
(function(){
    var pending = false;
    function getDocumentHeight(){
        var doc = document.documentElement;
        var body = document.body;
        return Math.ceil(Math.max(
            doc ? doc.scrollHeight : 0,
            doc ? doc.offsetHeight : 0,
            body ? body.scrollHeight : 0,
            body ? body.offsetHeight : 0
        ));
    }
    function postHeight(){
        if (!window.parent) return;
        window.parent.postMessage({ type: 'omu-catalog-height', height: getDocumentHeight() }, '*');
    }
    function triggerMailto(href){
        if (!href) return;
        try {
            var link = document.createElement('a');
            link.href = href;
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            window.location.href = href;
        }
    }
    function omuFrEscapeHtml(s){
        if (s == null || s === undefined) return '';
        return String(s)
            .replace(/&/g,'&amp;')
            .replace(/</g,'&lt;')
            .replace(/"/g,'&quot;')
            .replace(/'/g,'&#39;');
    }
    window.omuFrCompareModalIsOpen = function(){
        var ov = document.getElementById('omu-framer-compare-overlay');
        return !!(ov && ov.classList.contains('omu-framer-compare-overlay--open'));
    };
    window.omuFrCompareSyncSticky = function(){
        var sel = window.compareSelected;
        var n = Array.isArray(sel) ? sel.length : 0;
        var sticky = document.getElementById('omu-framer-compare-sticky');
        var btn = document.getElementById('omu-framer-compare-sticky-btn');
        if (!sticky || !btn) return;
        var show = n >= 2 && n <= 4;
        sticky.setAttribute('aria-hidden', show ? 'false' : 'true');
        sticky.classList.toggle('omu-framer-compare-sticky--visible', show);
        btn.textContent = 'Palyginti (' + n + ')';
        if (document.body) document.body.style.paddingBottom = show ? '76px' : '';
    };
    window.omuFrCompareRefreshBody = function(){
        var bodyEl = document.getElementById('omu-framer-compare-body');
        var cnt = document.getElementById('omu-framer-compare-count');
        var compareSelected = window.compareSelected || [];
        var n = compareSelected.length;
        if (cnt) cnt.textContent = String(n);
        if (!bodyEl) return;
        var PRODUCTS = window.PRODUCTS || [];
        var SKU_IMAGES = window.SKU_IMAGES || {};
        var compareImgIndex = window.compareImgIndex || {};
        var html = '<div class="compare-grid" style="--compare-cols:' + Math.max(n, 1) + '">';
        compareSelected.forEach(function(sku){
            var p = PRODUCTS.find(function(x){ return x[0] === sku; });
            if (!p) return;
            var imgs = SKU_IMAGES[sku];
            var hasGallery = Array.isArray(imgs) && imgs.length > 0;
            var cur = compareImgIndex[sku] != null ? compareImgIndex[sku] : 0;
            var idx = hasGallery ? (cur % imgs.length) : 0;
            var img = hasGallery ? imgs[idx] : null;
            var showNav = hasGallery && imgs.length > 1;
            var finish = typeof window.getFinish === 'function' ? window.getFinish(p[1]) : '';
            var sq = JSON.stringify(sku);
            html += '<div class="compare-col">';
            html += '<div class="compare-img">';
            if (img) {
                html += '<img src="' + omuFrEscapeHtml(img) + '" alt="">';
            } else {
                html += '<div class="compare-img-placeholder" style="background:' + omuFrEscapeHtml(p[6] || '#EDEBE4') + ';"></div>';
            }
            if (showNav) {
                html += "<button type=\\"button\\" class=\\"cmp-nav cmp-nav-left\\" onclick='cmpImgPrev(" + sq + ");event.stopPropagation()' aria-label=\\"Ankstesnė\\">‹</button>";
                html += "<button type=\\"button\\" class=\\"cmp-nav cmp-nav-right\\" onclick='cmpImgNext(" + sq + ");event.stopPropagation()' aria-label=\\"Kita\\">›</button>";
                html += '<div class="cmp-dots">';
                imgs.forEach(function(_, i){
                    html += "<button type=\\"button\\" class=\\"cmp-dot" + (i === idx ? ' active' : '') + "\\" onclick='cmpImgGoto(" + sq + "," + i + ");event.stopPropagation()' aria-label=\\"Nuotrauka " + (i + 1) + "\\"></button>";
                });
                html += '</div>';
            }
            html += '</div>';
            html += '<div class="compare-details">';
            html += '<div class="compare-name">' + omuFrEscapeHtml(p[1]) + '</div>';
            html += '<div class="compare-meta"><b>SKU</b>: ' + omuFrEscapeHtml(p[0]) + '</div>';
            html += '<div class="compare-meta"><b>Matmenys</b>: ' + omuFrEscapeHtml(p[2]) + '</div>';
            html += '<div class="compare-meta"><b>Rūšis</b>: ' + omuFrEscapeHtml(p[3]) + '</div>';
            html += '<div class="compare-meta"><b>Apdaila</b>: ' + omuFrEscapeHtml(finish) + '</div>';
            html += '</div>';
            html += "<button type=\\"button\\" class=\\"compare-remove\\" onclick='removeCompare(" + sq + ");event.stopPropagation()'>Pašalinti</button>";
            html += '</div>';
        });
        html += '</div>';
        bodyEl.innerHTML = html;
    };
    window.omuFrCompareClose = function(ev){
        if (ev && ev.stopPropagation) ev.stopPropagation();
        var ov = document.getElementById('omu-framer-compare-overlay');
        if (ov) {
            ov.classList.remove('omu-framer-compare-overlay--open');
            ov.setAttribute('aria-hidden', 'true');
        }
        var inv = document.getElementById('omu-framer-compare-inquiry');
        if (inv) {
            inv.classList.remove('open');
            inv.setAttribute('aria-hidden', 'true');
        }
        var inner = document.getElementById('omu-framer-compare-inquiry-inner');
        if (inner) inner.innerHTML = '';
        setTimeout(postHeight, 0);
    };
    window.omuFrCompareOpen = function(){
        var n = (window.compareSelected || []).length;
        if (n < 2) return;
        window.omuFrCompareRefreshBody();
        var ov = document.getElementById('omu-framer-compare-overlay');
        if (ov) {
            ov.classList.add('omu-framer-compare-overlay--open');
            ov.setAttribute('aria-hidden', 'false');
        }
        setTimeout(postHeight, 0);
    };
    window.omuFrCompareCollapseInquiry = function(){
        var el = document.getElementById('omu-framer-compare-inquiry');
        if (!el) return;
        el.classList.remove('open');
        el.setAttribute('aria-hidden', 'true');
    };
    window.omuFrCompareOpenInquiry = function(){
        var n = (window.compareSelected || []).length;
        if (n < 2) return;
        var el = document.getElementById('omu-framer-compare-inquiry');
        var root = document.getElementById('omu-framer-compare-inquiry-inner');
        if (!el || !root) return;
        var chips = (window.compareSelected || []).map(function(sku){
            var p = (window.PRODUCTS || []).find(function(x){ return x[0] === sku; });
            var sq = JSON.stringify(sku);
            return p
                ? "<div class=\\"chip\\"><span>" + omuFrEscapeHtml(sku) + " — " + omuFrEscapeHtml(p[1]) + "</span><span class=\\"chip-rm\\" onclick='removeCompare(" + sq + ");event.stopPropagation()'>×</span></div>"
                : '';
        }).join('');
        root.innerHTML =
            '<div class="compare-inquiry-head">' +
            '<div class="compare-inquiry-title">Užklausa dėl kainos</div>' +
            '<button type="button" class="compare-inquiry-hide" onclick="window.omuFrCompareCollapseInquiry && window.omuFrCompareCollapseInquiry()">Slėpti formą</button>' +
            '</div>' +
            '<div class="form-sub">Šie produktai bus įtraukti į el. laišką</div>' +
            '<div class="sel-chips">' + chips + '</div>' +
            '<div class="field-row">' +
            '<div class="field"><label>Vardas, pavardė *</label><input id="cf-name" placeholder="Vardas Pavardė" autocomplete="name"></div>' +
            '<div class="field"><label>El. paštas *</label><input id="cf-email" type="email" placeholder="el@pastas.lt" autocomplete="email"></div>' +
            '</div>' +
            '<div class="field-row">' +
            '<div class="field"><label>Telefonas</label><input id="cf-tel" placeholder="+370..." autocomplete="tel"></div>' +
            '<div class="field"><label>Plotas (m²)</label><input id="cf-area" type="number" placeholder="pvz. 45"></div>' +
            '</div>' +
            '<div class="field"><label>Pastabos</label><textarea id="cf-msg" placeholder="Papildoma informacija..."></textarea></div>' +
            '<div class="form-actions">' +
            '<button type="button" class="form-btn-primary" onclick="submitCompareInquiryForm()">Siųsti užklausą</button>' +
            '<button type="button" class="form-btn-sec" onclick="window.omuFrCompareCollapseInquiry && window.omuFrCompareCollapseInquiry()">Atšaukti</button>' +
            '</div>';
        el.classList.add('open');
        el.setAttribute('aria-hidden', 'false');
        try { el.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); } catch (e0) {}
        setTimeout(postHeight, 0);
    };
    function wrapCmp(fnName){
        var fn = window[fnName];
        if (typeof fn !== 'function' || fn.__omuFrWrapped) return;
        var orig = fn;
        window[fnName] = function(){
            var o = orig.apply(this, arguments);
            if (window.omuFrCompareModalIsOpen()) window.omuFrCompareRefreshBody();
            return o;
        };
        window[fnName].__omuFrWrapped = true;
    }
    function installOmuFrCompareHooks(){
        if (typeof window.render === 'function' && !window.__omuFrCompareHooksInstalled) {
            window.__omuFrCompareHooksInstalled = true;
            var r0 = window.render;
            window.render = function(){
                var out = r0.apply(this, arguments);
                try {
                    window.omuFrCompareSyncSticky();
                    if (window.omuFrCompareModalIsOpen()) {
                        var nn = (window.compareSelected || []).length;
                        if (nn < 2) window.omuFrCompareClose();
                        else window.omuFrCompareRefreshBody();
                    }
                } catch (e1) {}
                return out;
            };
            if (typeof window.removeCompare === 'function') {
                var r1 = window.removeCompare;
                window.removeCompare = function(sku){
                    r1(sku);
                    try {
                        window.omuFrCompareSyncSticky();
                        if (window.omuFrCompareModalIsOpen()) {
                            var nn = (window.compareSelected || []).length;
                            if (nn < 2) window.omuFrCompareClose();
                            else window.omuFrCompareRefreshBody();
                        }
                    } catch (e2) {}
                };
            }
            if (typeof window.toggleCompareFromUI === 'function' && !window.toggleCompareFromUI.__omuFrWrapped) {
                var r2 = window.toggleCompareFromUI;
                window.toggleCompareFromUI = function(sku, anchor){
                    r2(sku, anchor);
                    try { window.omuFrCompareSyncSticky(); } catch (e3) {}
                    setTimeout(postHeight, 0);
                };
                window.toggleCompareFromUI.__omuFrWrapped = true;
            }
            document.addEventListener('keydown', function(e){
                if (e.key === 'Escape' && window.omuFrCompareModalIsOpen()) window.omuFrCompareClose(e);
            });
        }
        wrapCmp('cmpImgPrev');
        wrapCmp('cmpImgNext');
        wrapCmp('cmpImgGoto');
        try { window.omuFrCompareSyncSticky(); } catch (e4) {}
    }
    function patchSubmitHandlers(){
        if (typeof window.submitForm === 'function' && !window.submitForm.__omuPatched) {
            window.submitForm = function(){
                var nameEl = document.getElementById('f-name');
                var emailEl = document.getElementById('f-email');
                var name = nameEl && nameEl.value ? nameEl.value.trim() : '';
                var email = emailEl && emailEl.value ? emailEl.value.trim() : '';
                if (!name || !email) { alert('Prašome užpildyti vardą ir el. paštą'); return; }
                var prods = Array.from(window.selected || []).map(function(sku){
                    var p = (window.PRODUCTS || []).find(function(x){ return x[0] === sku; });
                    return p ? '• ' + sku + ' — ' + p[1] + ' (' + p[2] + ')' : sku;
                }).join('\n');
                var area = (document.getElementById('f-area') || { value: '' }).value || '—';
                var msg = (document.getElementById('f-msg') || { value: '' }).value || '—';
                var tel = (document.getElementById('f-tel') || { value: '' }).value || '';
                var txt = 'Sveiki,\n\nNorėčiau gauti pasiūlymą šiems produktams:\n\n' + prods + '\n\nPlotas: ' + area + ' m²\nPastabos: ' + msg + '\n\nKontaktai: ' + name + ', ' + email + ', ' + tel;
                var href = 'mailto:edgaras@oakmeup.lt?subject=' + encodeURIComponent('Produktų užklausa — ' + name) + '&body=' + encodeURIComponent(txt);
                var root = document.getElementById('form-body');
                if (root) {
                    root.innerHTML = '<div class="success-box"><h3>Užklausa suformuota!</h3><p>Atidaromas el. pašto klientas su visu sąrašu.</p><a href="' + href + '">Spustelėkite čia jei neatsidaro</a></div>';
                }
                triggerMailto(href);
                setTimeout(postHeight, 0);
            };
            window.submitForm.__omuPatched = true;
        }
        if (typeof window.submitCompareInquiryForm === 'function' && !window.submitCompareInquiryForm.__omuPatched) {
            window.submitCompareInquiryForm = function(){
                var nameEl = document.getElementById('cf-name');
                var emailEl = document.getElementById('cf-email');
                var name = nameEl && nameEl.value ? nameEl.value.trim() : '';
                var email = emailEl && emailEl.value ? emailEl.value.trim() : '';
                if (!name || !email) { alert('Prašome užpildyti vardą ir el. paštą'); return; }
                var prods = (window.compareSelected || []).map(function(sku){
                    var p = (window.PRODUCTS || []).find(function(x){ return x[0] === sku; });
                    return p ? '• ' + sku + ' — ' + p[1] + ' (' + p[2] + ')' : sku;
                }).join('\n');
                var area = (document.getElementById('cf-area') || { value: '' }).value || '—';
                var msg = (document.getElementById('cf-msg') || { value: '' }).value || '—';
                var tel = (document.getElementById('cf-tel') || { value: '' }).value || '';
                var txt = 'Sveiki,\n\nKreipiuosi dėl kainos šiems produktams (palyginimas kataloge):\n\n' + prods + '\n\nPlotas: ' + area + ' m²\nPastabos: ' + msg + '\n\nKontaktai: ' + name + ', ' + email + ', ' + tel;
                var href = 'mailto:edgaras@oakmeup.lt?subject=' + encodeURIComponent('Produktų užklausa (palyginimas) — ' + name) + '&body=' + encodeURIComponent(txt);
                var root = document.getElementById('omu-framer-compare-inquiry-inner') || document.getElementById('compare-inquiry-inner');
                if (root) {
                    root.innerHTML = '<div class="success-box"><h3>Užklausa suformuota!</h3><p>Atidaromas el. pašto klientas su visu sąrašu.</p><a href="' + href + '">Spustelėkite čia jei neatsidaro</a></div>';
                }
                triggerMailto(href);
                setTimeout(postHeight, 0);
            };
            window.submitCompareInquiryForm.__omuPatched = true;
        }
    }
    function getCompareSku(compare){
        var raw = compare && compare.getAttribute ? compare.getAttribute('onclick') : '';
        var match = raw && raw.match(/toggleCompareFromUI\('([^']+)'/);
        return match ? match[1] : '';
    }
    function getInquirySkuFromCard(card){
        var raw = card && card.getAttribute ? card.getAttribute('onclick') : '';
        var match = raw && raw.match(/toggleProd\('([^']+)'/);
        return match ? match[1] : '';
    }
    function paintComparePickIcons(){
        var shapeSel = 'path,polyline,line,circle,polygon,rect,g';
        document.querySelectorAll('.catalog-root--grid .prod-card').forEach(function(card){
            var cb = card.querySelector('.prod-card-pick-row .cb');
            if (!cb) return;
            var svg = cb.querySelector('svg');
            if (!svg) return;
            var on = card.classList.contains('selected');
            if (on) {
                svg.style.setProperty('color', '#1C3A13', 'important');
                svg.style.setProperty('stroke', '#1C3A13', 'important');
                svg.style.setProperty('fill', 'none', 'important');
                svg.style.setProperty('filter', 'none', 'important');
                [].forEach.call(svg.querySelectorAll(shapeSel), function(el){
                    el.style.setProperty('stroke', '#1C3A13', 'important');
                    el.style.setProperty('fill', 'none', 'important');
                });
            } else {
                svg.style.removeProperty('color');
                svg.style.removeProperty('stroke');
                svg.style.removeProperty('fill');
                svg.style.removeProperty('filter');
                [].forEach.call(svg.querySelectorAll(shapeSel), function(el){
                    el.style.removeProperty('stroke');
                    el.style.removeProperty('fill');
                });
            }
        });
    }
    function moveActions(){
        patchSubmitHandlers();
        installOmuFrCompareHooks();
        if (window.omuFrCompareSyncSticky) window.omuFrCompareSyncSticky();
        var cards = document.querySelectorAll('.catalog-root--grid .prod-card');
        cards.forEach(function(card){
            var body = card.querySelector('.prod-card-body');
            var compare = card.querySelector('.cmp-btn');
            var sku = getCompareSku(compare) || getInquirySkuFromCard(card);
            if (!body || !sku) return;

            var legacy = body.querySelector('.omu-inline-inquiry');
            if (legacy && legacy.parentNode === body) legacy.remove();
            var ghost = body.querySelector('.omu-grid-inquiry-btn');
            if (ghost) ghost.remove();

            var addInq = card.querySelector('.prod-card-add-inquiry');
            if (addInq) {
                var selOn = card.classList.contains('selected');
                addInq.textContent = selOn ? 'Išimti iš užklausos' : 'Pridėti į užklausą';
                addInq.setAttribute('aria-pressed', selOn ? 'true' : 'false');
                addInq.classList.toggle('prod-card-add-inquiry--on', selOn);
            }
        });
        paintComparePickIcons();
        postHeight();
    }
    function schedule(){
        if (pending) return;
        pending = true;
        requestAnimationFrame(function(){
            pending = false;
            moveActions();
        });
    }
    document.addEventListener('DOMContentLoaded', schedule);
    window.addEventListener('load', schedule);
    window.addEventListener('resize', schedule);
    setTimeout(schedule, 50);
    setTimeout(schedule, 300);
    setTimeout(schedule, 1000);
    var observer = new MutationObserver(schedule);
    observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true });
    if (window.ResizeObserver) {
        var resizeObserver = new ResizeObserver(schedule);
        resizeObserver.observe(document.documentElement);
        if (document.body) resizeObserver.observe(document.body);
    }
    try {
        moveActions();
    } catch (e) {}
})();
</script>`

    let documentHtml = html
        .replace(/<base\b[^>]*>/i, "")
        .replace(/<head>/i, `<head><base href="${escapedBase}">`)
        .replaceAll("Frame 8.svg", logoUrl)

    documentHtml = setDefaultView(documentHtml, initialView)
    documentHtml = removeEmbeddedFooter(documentHtml)
    documentHtml = injectCatalogGlobalBridge(documentHtml)
    documentHtml = injectGridInquiryRow(documentHtml)
    documentHtml = documentHtml.replace(/Pats švaresnis pasirinkimas/g, "Pats švariausias pasirinkimas")
    documentHtml = documentHtml.replace(/<\/head>/i, `${overrides}</head>`)
    return documentHtml.replace(/<\/body>/i, `${OMU_FRAMER_COMPARE_SHELL}${actionSwapScript}</body>`)
}

function LoadingDocument({ label }: { label: string }) {
    return (
        <div style={loadingStyle}>
            <div style={loadingLabelStyle}>{label}</div>
        </div>
    )
}

/**
 * Oak Me Up catalogue HTML embed.
 *
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight auto
 * @framerIntrinsicWidth 1440
 * @framerIntrinsicHeight 400
 */
export default function KolekcijosCatalogEmbed(props: Props) {
    const {
        dataUrl = DEFAULT_DATA_URL,
        initialView = "grid",
        hideHeader = true,
        headerOffset = 112,
        cardsPerRow = 4,
        minHeight = 640,
        style,
    } = props
    const [rawHtml, setRawHtml] = useState("")
    const [status, setStatus] = useState("Kraunamas katalogas")
    const [frameHeight, setFrameHeight] = useState(0)
    const iframeRef = useRef<HTMLIFrameElement>(null)
    const iframeMeasureCleanup = useRef<(() => void) | null>(null)

    const measureIframeDoc = useCallback((doc: Document) => {
        const root = doc.documentElement
        const body = doc.body
        const h = Math.ceil(
            Math.max(
                root ? root.scrollHeight : 0,
                root ? root.offsetHeight : 0,
                body ? body.scrollHeight : 0,
                body ? body.offsetHeight : 0,
            ),
        )
        if (Number.isFinite(h) && h > 0) {
            setFrameHeight(Math.max(1, h))
        }
    }, [])

    const handleIframeLoad = useCallback(() => {
        iframeMeasureCleanup.current?.()
        iframeMeasureCleanup.current = null

        const iframe = iframeRef.current
        const doc = iframe?.contentDocument
        if (!doc?.documentElement) return

        let raf = 0
        const schedule = () => {
            cancelAnimationFrame(raf)
            raf = requestAnimationFrame(() => measureIframeDoc(doc))
        }

        measureIframeDoc(doc)

        const ro =
            typeof ResizeObserver !== "undefined" ? new ResizeObserver(schedule) : null
        if (ro) {
            ro.observe(doc.documentElement)
            if (doc.body) ro.observe(doc.body)
        }
        const mo = new MutationObserver(schedule)
        mo.observe(doc.documentElement, { childList: true, subtree: true, attributes: true })

        const timeouts = [80, 250, 600, 1500, 3000].map((ms) =>
            window.setTimeout(schedule, ms),
        )

        iframeMeasureCleanup.current = () => {
            cancelAnimationFrame(raf)
            ro?.disconnect()
            mo.disconnect()
            timeouts.forEach((id) => window.clearTimeout(id))
        }
    }, [measureIframeDoc])

    useEffect(() => {
        return () => {
            iframeMeasureCleanup.current?.()
            iframeMeasureCleanup.current = null
        }
    }, [])

    useEffect(() => {
        let cancelled = false

        async function load() {
            setStatus("Kraunamas katalogas")
            setRawHtml("")
            setFrameHeight(0)

            try {
                const response = await fetch(dataUrl || DEFAULT_DATA_URL, {
                    cache: "force-cache",
                })

                if (!response.ok) throw new Error(`HTTP ${response.status}`)

                const html = await response.text()
                if (!cancelled) {
                    setRawHtml(html)
                    setStatus("")
                }
            } catch (error) {
                const message = error instanceof Error ? error.message : "nezinoma klaida"
                if (!cancelled) setStatus(`Katalogo nepavyko uzkrauti: ${message}`)
            }
        }

        load()

        return () => {
            cancelled = true
        }
    }, [dataUrl])

    useEffect(() => {
        function handleMessage(event: MessageEvent) {
            const data = event.data as { type?: string; height?: number } | undefined
            if (data?.type !== "omu-catalog-height") return
            if (typeof data.height !== "number" || !Number.isFinite(data.height)) return
            setFrameHeight(Math.max(1, Math.ceil(data.height)))
        }

        window.addEventListener("message", handleMessage)
        return () => window.removeEventListener("message", handleMessage)
    }, [])

    const documentHtml = useMemo(() => {
        if (!rawHtml) return ""
        return prepareHtml(
            rawHtml,
            dataUrl || DEFAULT_DATA_URL,
            hideHeader,
            initialView,
            headerOffset,
            cardsPerRow,
        )
    }, [cardsPerRow, dataUrl, headerOffset, hideHeader, initialView, rawHtml])

    useEffect(() => {
        setFrameHeight(0)
    }, [documentHtml])

    const fallbackHeight = Math.max(1, Math.round(minHeight || 640))
    const contentHeight = documentHtml ? frameHeight || fallbackHeight : fallbackHeight

    return (
        <div
            style={{
                ...containerStyle,
                ...(documentHtml ? {} : { minHeight: fallbackHeight }),
                ...style,
            }}
        >
            {documentHtml ? (
                <iframe
                    ref={iframeRef}
                    title="Oak Me Up kolekcijos"
                    srcDoc={documentHtml}
                    onLoad={handleIframeLoad}
                    style={{
                        ...iframeStyle,
                        height: contentHeight,
                    }}
                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-modals allow-top-navigation-by-user-activation"
                />
            ) : (
                <LoadingDocument label={status} />
            )}
        </div>
    )
}

addPropertyControls<Props>(KolekcijosCatalogEmbed, {
    dataUrl: {
        type: ControlType.String,
        title: "Data URL",
        defaultValue: DEFAULT_DATA_URL,
    },
    initialView: {
        type: ControlType.Enum,
        title: "View",
        options: ["grid", "rows"],
        optionTitles: ["Grid", "Row by row"],
        defaultValue: "grid",
        displaySegmentedControl: true,
    },
    hideHeader: {
        type: ControlType.Boolean,
        title: "Header",
        defaultValue: true,
        enabledTitle: "Hide",
        disabledTitle: "Show",
    },
    headerOffset: {
        type: ControlType.Number,
        title: "Header Offset",
        defaultValue: 112,
        min: 0,
        max: 200,
        step: 4,
        unit: "px",
    },
    cardsPerRow: {
        type: ControlType.Number,
        title: "Cards / Row",
        defaultValue: 4,
        min: 1,
        max: 6,
        step: 1,
    },
    minHeight: {
        type: ControlType.Number,
        title: "Fallback Height",
        defaultValue: 640,
        min: 200,
        max: 4000,
        step: 20,
        unit: "px",
    },
})

const containerStyle: CSSProperties = {
    width: "100%",
    maxWidth: "100%",
    height: "auto",
    background: "#F7F5F0",
    overflowX: "hidden",
    boxSizing: "border-box",
}

const iframeStyle: CSSProperties = {
    display: "block",
    width: "100%",
    border: 0,
    background: "#F7F5F0",
    overflow: "hidden",
    verticalAlign: "top",
}

const loadingStyle: CSSProperties = {
    height: "100%",
    minHeight: 320,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#F7F5F0",
    color: "#1C3A13",
}

const loadingLabelStyle: CSSProperties = {
    fontFamily: "'Geist Mono', monospace",
    fontSize: 12,
    fontWeight: 500,
    letterSpacing: "0.05em",
    textTransform: "uppercase",
}
