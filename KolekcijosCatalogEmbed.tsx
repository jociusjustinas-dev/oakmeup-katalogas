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

const DEFAULT_DATA_URL =
    "https://cdn.jsdelivr.net/gh/jociusjustinas-dev/oakmeup-katalogas@main/index.html"
const DEFAULT_BASE_URL =
    "https://cdn.jsdelivr.net/gh/jociusjustinas-dev/oakmeup-katalogas@main/"

function escapeHtmlAttr(value: string) {
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
    if (view !== "grid") return html
    let next = html.replace(
        /let\s+viewMode\s*=\s*['"](?:list|grid)['"]\s*;/,
        "let viewMode='grid';",
    )
    next = next
        .replace(
            'id="view-list" class="view-toggle-btn active" onclick="setView(\'list\')" title="Sąrašas" aria-pressed="true"',
            'id="view-list" class="view-toggle-btn" onclick="setView(\'list\')" title="Sąrašas" aria-pressed="false"',
        )
        .replace(
            'id="view-grid" class="view-toggle-btn" onclick="setView(\'grid\')" title="Tinklelis" aria-pressed="false"',
            'id="view-grid" class="view-toggle-btn active" onclick="setView(\'grid\')" title="Tinklelis" aria-pressed="true"',
        )
    return next
}

function prepareHtml(
    html: string,
    sourceUrl: string,
    hideHeader: boolean,
    initialView: ViewMode,
    headerOffset: number,
    cardsPerRow: number,
): string {
    const baseUrl = getBaseUrl(sourceUrl)
    const escapedBase = escapeHtmlAttr(baseUrl)
    const logoUrl = `${baseUrl}Frame%208.svg`
    const cols = Math.max(1, Math.min(6, Math.round(cardsPerRow || 4)))

    // ── CSS overrides injected into <head> ────────────────────────────────
    // Only adjust sizing / layout. Do NOT touch z-indexes of overlays.
    // position:fixed elements (overlay, lightbox) work fine inside same-origin
    // iframes as long as <html> has overflow:visible (Chrome requirement).
    const overrides = `<style id="omu-embed-overrides">
html{height:auto!important;overflow:visible!important}
body{height:auto!important;min-height:0!important;overflow-x:clip;overflow-y:visible!important}
.header{display:${hideHeader ? "none" : "flex"}!important}
.layout{padding-top:${hideHeader ? "0px" : `${Math.max(0, Math.round(headerOffset || 0))}px`}!important;min-height:auto!important;box-sizing:border-box}
.catalog-root--grid .sub-block{grid-template-columns:repeat(${cols},minmax(0,1fr))!important;gap:14px!important;padding:12px 14px 16px!important}
@media(max-width:1180px){.catalog-root--grid .sub-block{grid-template-columns:repeat(${Math.min(cols,3)},minmax(0,1fr))!important}}
@media(max-width:900px){.catalog-root--grid .sub-block{grid-template-columns:repeat(2,minmax(0,1fr))!important}}
@media(max-width:640px){.catalog-root--grid .sub-block{grid-template-columns:1fr!important}}
/* Dark card style for Framer */
.catalog-root--grid .prod-card{background:#1C3A13!important;color:#FBFAF9!important;border:0!important;border-radius:8px!important;min-height:470px!important;overflow:visible!important}
.catalog-root--grid .prod-card:hover{transform:translateY(-2px)!important}
.catalog-root--grid .prod-card.selected{box-shadow:0 0 0 2px #D3FA99 inset!important}
.catalog-root--grid .prod-card-media{height:218px!important;border-radius:8px!important;overflow:hidden!important;background:#EDEBE4!important}
.catalog-root--grid .prod-card-pick-row{background:rgba(28,58,19,.7)!important;backdrop-filter:blur(24px)!important;color:#D3FA99!important;border-radius:0!important;border-bottom:1px solid rgba(211,250,153,.18)!important}
.catalog-root--grid .prod-card-body{background:#1C3A13!important;color:#FBFAF9!important}
.catalog-root--grid .prod-card-name{color:#FBFAF9!important;font-size:17px!important}
.catalog-root--grid .prod-card-dims,.catalog-root--grid .prod-subtitle{color:#D3FA99!important}
.catalog-root--grid .card-desc{color:rgba(251,250,249,.88)!important}
.catalog-root--grid .grade{border:1px solid rgba(211,250,153,.28)!important;background:rgba(211,250,153,.1)!important;color:#D3FA99!important}
.catalog-root--grid .prod-card-foot{background:#1C3A13!important;padding:0 18px 18px!important}
.catalog-root--grid .cmp-btn{border:1.5px solid rgba(211,250,153,.45)!important;border-radius:200px!important;background:transparent!important;color:#D3FA99!important;min-height:44px!important;padding:12px 20px!important}
.catalog-root--grid .cmp-btn.cmp-on{background:#D3FA99!important;color:#1C3A13!important}
.catalog-root--grid .card-nav{background:rgba(28,58,19,.64)!important;color:#D3FA99!important}
.catalog-root--grid .card-dot.active{background:#D3FA99!important}
</style>`

    // ── Tiny embed script: height reporting + scroll-to-top on modal open ─
    // When a modal opens, the overlay is position:fixed inside the iframe.
    // The iframe is as tall as its content, so fixed = top of iframe.
    // We notify the parent to scroll up so the user can see the modal.
    const embedScript = `<script id="omu-embed-script">
(function(){
var _pending=false;
function _h(){
  var d=document.documentElement,b=document.body;
  return Math.ceil(Math.max(d?d.scrollHeight:0,d?d.offsetHeight:0,b?b.scrollHeight:0,b?b.offsetHeight:0));
}
function postH(){ if(window.parent) window.parent.postMessage({type:'omu-catalog-height',height:_h()},'*'); }
function postScroll(){ if(window.parent) window.parent.postMessage({type:'omu-scroll-to-iframe'},'*'); }
function wrap(name){
  var fn=window[name];
  if(typeof fn!=='function'||fn.__omuW) return;
  var orig=fn;
  window[name]=function(){ postScroll(); return orig.apply(this,arguments); };
  window[name].__omuW=true;
}
function setup(){
  wrap('openForm');
  wrap('openLightbox');
  wrap('openCompare');
  postH();
}
document.addEventListener('DOMContentLoaded',setup);
window.addEventListener('load',setup);
setTimeout(setup,80);
setTimeout(postH,400);
setTimeout(postH,1200);
var _mo=new MutationObserver(function(){
  if(_pending)return; _pending=true;
  requestAnimationFrame(function(){ _pending=false; postH(); });
});
_mo.observe(document.documentElement,{childList:true,subtree:true,attributes:false,characterData:false});
if(window.ResizeObserver) new ResizeObserver(postH).observe(document.documentElement);
})();
</script>`

    let doc = html
        .replace(/<base\b[^>]*>/i, "")
        .replace(/<head>/i, `<head><base href="${escapedBase}">`)
        .replaceAll("Frame 8.svg", logoUrl)

    doc = setDefaultView(doc, initialView)

    // Remove footer (clean embed look)
    doc = doc.replace(/<footer\b[\s\S]*?<\/footer>/i, "")

    doc = doc.replace(/<\/head>/i, `${overrides}</head>`)
    doc = doc.replace(/<\/body>/i, `${embedScript}</body>`)
    return doc
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
        headerOffset = 0,
        cardsPerRow = 4,
        minHeight = 640,
        style,
    } = props

    const [rawHtml, setRawHtml] = useState("")
    const [status, setStatus] = useState("Kraunamas katalogas…")
    const [frameHeight, setFrameHeight] = useState(0)
    const iframeRef = useRef<HTMLIFrameElement>(null)
    const cleanupRef = useRef<(() => void) | null>(null)

    // Measure iframe document height
    const measureDoc = useCallback((doc: Document) => {
        const root = doc.documentElement
        const body = doc.body
        const h = Math.ceil(
            Math.max(
                root?.scrollHeight ?? 0,
                root?.offsetHeight ?? 0,
                body?.scrollHeight ?? 0,
                body?.offsetHeight ?? 0,
            ),
        )
        if (Number.isFinite(h) && h > 0) setFrameHeight(Math.max(1, h))
    }, [])

    const handleIframeLoad = useCallback(() => {
        cleanupRef.current?.()
        cleanupRef.current = null
        const iframe = iframeRef.current
        const doc = iframe?.contentDocument
        if (!doc?.documentElement) return
        measureDoc(doc)
        let raf = 0
        const schedule = () => {
            cancelAnimationFrame(raf)
            raf = requestAnimationFrame(() => measureDoc(doc))
        }
        const ro =
            typeof ResizeObserver !== "undefined" ? new ResizeObserver(schedule) : null
        ro?.observe(doc.documentElement)
        if (doc.body) ro?.observe(doc.body)
        const mo = new MutationObserver(schedule)
        mo.observe(doc.documentElement, { childList: true, subtree: true, attributes: true })
        const ids = [80, 300, 800, 2000].map((ms) => window.setTimeout(schedule, ms))
        cleanupRef.current = () => {
            cancelAnimationFrame(raf)
            ro?.disconnect()
            mo.disconnect()
            ids.forEach(clearTimeout)
        }
    }, [measureDoc])

    useEffect(() => () => { cleanupRef.current?.() }, [])

    // Fetch catalog HTML
    useEffect(() => {
        let cancelled = false
        setStatus("Kraunamas katalogas…")
        setRawHtml("")
        setFrameHeight(0)
        fetch(dataUrl || DEFAULT_DATA_URL, { cache: "no-cache" })
            .then((r) => {
                if (!r.ok) throw new Error(`HTTP ${r.status}`)
                return r.text()
            })
            .then((html) => { if (!cancelled) { setRawHtml(html); setStatus("") } })
            .catch((err) => {
                if (!cancelled)
                    setStatus(`Nepavyko užkrauti: ${err instanceof Error ? err.message : err}`)
            })
        return () => { cancelled = true }
    }, [dataUrl])

    // Listen for messages from iframe
    useEffect(() => {
        function onMessage(ev: MessageEvent) {
            const d = ev.data as { type?: string; height?: number } | undefined
            if (!d) return
            if (d.type === "omu-catalog-height" && typeof d.height === "number" && Number.isFinite(d.height)) {
                setFrameHeight(Math.max(1, Math.ceil(d.height)))
            } else if (d.type === "omu-scroll-to-iframe") {
                // Scroll parent so user sees the top of the iframe (where the modal opens)
                iframeRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
            }
        }
        window.addEventListener("message", onMessage)
        return () => window.removeEventListener("message", onMessage)
    }, [])

    const documentHtml = useMemo(() => {
        if (!rawHtml) return ""
        return prepareHtml(rawHtml, dataUrl || DEFAULT_DATA_URL, hideHeader, initialView, headerOffset, cardsPerRow)
    }, [rawHtml, dataUrl, hideHeader, initialView, headerOffset, cardsPerRow])

    useEffect(() => { setFrameHeight(0) }, [documentHtml])

    const fallback = Math.max(1, Math.round(minHeight || 640))
    const height = documentHtml ? (frameHeight || fallback) : fallback

    return (
        <div style={{ width: "100%", maxWidth: "100%", height: "auto", background: "#F7F5F0", boxSizing: "border-box", ...style }}>
            {documentHtml ? (
                <iframe
                    ref={iframeRef}
                    title="Oak Me Up kolekcijos"
                    srcDoc={documentHtml}
                    onLoad={handleIframeLoad}
                    style={{ display: "block", width: "100%", height, border: 0, background: "#F7F5F0", verticalAlign: "top" }}
                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-modals allow-top-navigation-by-user-activation"
                />
            ) : (
                <div style={{ height: fallback, display: "flex", alignItems: "center", justifyContent: "center", background: "#F7F5F0", color: "#1C3A13", fontFamily: "'Geist Mono', monospace", fontSize: 12, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {status}
                </div>
            )}
        </div>
    )
}

addPropertyControls<Props>(KolekcijosCatalogEmbed, {
    dataUrl: { type: ControlType.String, title: "Data URL", defaultValue: DEFAULT_DATA_URL },
    initialView: {
        type: ControlType.Enum, title: "View",
        options: ["grid", "rows"], optionTitles: ["Grid", "Row by row"],
        defaultValue: "grid", displaySegmentedControl: true,
    },
    hideHeader: {
        type: ControlType.Boolean, title: "Header",
        defaultValue: true, enabledTitle: "Hide", disabledTitle: "Show",
    },
    headerOffset: {
        type: ControlType.Number, title: "Header Offset",
        defaultValue: 0, min: 0, max: 200, step: 4, unit: "px",
    },
    cardsPerRow: {
        type: ControlType.Number, title: "Cards / Row",
        defaultValue: 4, min: 1, max: 6, step: 1,
    },
    minHeight: {
        type: ControlType.Number, title: "Fallback Height",
        defaultValue: 640, min: 200, max: 4000, step: 20, unit: "px",
    },
})
