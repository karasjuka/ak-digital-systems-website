# Website-Redesign ak-digital-systems.de — Implementierungsplan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Statischer One-Pager im „C-Light Immersive 3D"-Design (Spec: `docs/superpowers/specs/2026-06-10-website-redesign-design.md`) mit Three.js-Szene, GSAP-Scroll-Animationen, verifiziert via Chrome DevTools.

**Architecture:** Statische Dateien ohne Build (Push = Cloudflare-Pages-Deploy). Fixiertes Three.js-Canvas hinter dem Inhalt, Morph-Stationen per GSAP ScrollTrigger. Inhalte/Sektionen laut Spec verbindlich.

**Tech Stack:** HTML/CSS/Vanilla JS, GSAP 3 + ScrollTrigger (UMD, lokal in `vendor/`), Three.js (ES Module, lokal), Google Fonts (Space Grotesk + Inter).

**Arbeitsverzeichnis:** `/Users/alexanderkarasjuk/Documents/mema/mema_v47_scenePhase_fix/ak-digital-systems-website`

**Verifikation statt Unit-Tests:** Statische Visual-Site ohne Test-Framework — jede Task endet mit einem konkreten, prüfbaren Verifikationsschritt (Datei existiert / Server liefert 200 / Headless-Chrome-Konsole fehlerfrei / Screenshot zeigt Erwartetes). Lighthouse ≥ 90 (Performance, Accessibility, SEO) als Definition of Done.

**WICHTIG — kein Push ohne Freigabe:** Push auf `main` deployt live. Alle Tasks committen nur lokal. Push erst nach expliziter Freigabe durch Alexander (Task 8).

---

### Task 1: Scaffold + Vendor-Bibliotheken

**Files:**
- Create: `vendor/gsap.min.js`, `vendor/ScrollTrigger.min.js`, `vendor/three.module.min.js`
- Create: `css/`, `js/`, `assets/` (Verzeichnisse)

- [ ] **Step 1: Verzeichnisse anlegen und Bibliotheken herunterladen**

```bash
cd /Users/alexanderkarasjuk/Documents/mema/mema_v47_scenePhase_fix/ak-digital-systems-website
mkdir -p vendor css js assets
curl -fsSL https://unpkg.com/gsap@3.13.0/dist/gsap.min.js -o vendor/gsap.min.js
curl -fsSL https://unpkg.com/gsap@3.13.0/dist/ScrollTrigger.min.js -o vendor/ScrollTrigger.min.js
curl -fsSL https://unpkg.com/three@0.182.0/build/three.module.min.js -o vendor/three.module.min.js
```

Falls eine Version 404 liefert: verfügbare Version via `npm view gsap version` / `npm view three version` ermitteln und URL anpassen.

- [ ] **Step 2: Verifizieren**

```bash
ls -la vendor/ && head -c 200 vendor/gsap.min.js && echo && head -c 200 vendor/three.module.min.js
```

Erwartet: 3 Dateien, jede > 50 KB, Inhalt beginnt mit Minified-JS (kein HTML-Fehlertext).

- [ ] **Step 3: Commit**

```bash
git add vendor/ && git commit -m "feat: GSAP + ScrollTrigger + Three.js lokal gebündelt (vendor/)"
```

---

### Task 2: Assets (Foto, Screenshots, Favicon)

**Files:**
- Create: `assets/alexander-karasjuk.webp` (Fallback: `.jpg`), `assets/mema-home.png`, `assets/mema-meds.png`, `assets/favicon.svg`

- [ ] **Step 1: Foto optimieren (Ziel ≤ 120 KB, Breite 800px)**

```bash
cd /Users/alexanderkarasjuk/Documents/mema/mema_v47_scenePhase_fix/ak-digital-systems-website
sips -Z 1000 --setProperty formatOptions 80 -s format webp ~/Downloads/AK-profile-picture.jpeg --out assets/alexander-karasjuk.webp 2>/dev/null \
  || sips -Z 1000 --setProperty formatOptions 80 -s format jpeg ~/Downloads/AK-profile-picture.jpeg --out assets/alexander-karasjuk.jpg
```

(WebP-Encode klappt auf macOS 14+; sonst JPEG-Fallback verwenden und `<img>`-Pfad in Task 3 entsprechend setzen.)

- [ ] **Step 2: mema-Screenshots kopieren**

```bash
cp /Users/alexanderkarasjuk/Documents/mema/mema-care/images/hero-home.png assets/mema-home.png
cp /Users/alexanderkarasjuk/Documents/mema/mema-care/images/hero-meds.png assets/mema-meds.png
```

- [ ] **Step 3: Favicon als SVG schreiben** (Ring-Motiv passend zur 3D-Szene)

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="#0f1a30"/>
  <g fill="none" stroke-linecap="round" transform="rotate(-18 32 32)">
    <ellipse cx="32" cy="32" rx="22" ry="9" stroke="#60a5fa" stroke-width="3"/>
    <ellipse cx="32" cy="32" rx="14" ry="5.5" stroke="#818cf8" stroke-width="2.5" transform="rotate(28 32 32)"/>
  </g>
  <circle cx="32" cy="32" r="4" fill="#2563eb"/>
</svg>
```

- [ ] **Step 4: Verifizieren + Commit**

```bash
sips -g pixelWidth assets/alexander-karasjuk.webp 2>/dev/null || sips -g pixelWidth assets/alexander-karasjuk.jpg
ls -la assets/
git add assets/ && git commit -m "feat: Assets — Porträt (optimiert), mema-Screenshots, Favicon"
```

Erwartet: Foto-Breite ≤ 1000px, alle 4 Dateien vorhanden.

---

### Task 3: index.html — Struktur & Inhalte

**Files:**
- Modify: `index.html` (komplett ersetzen)

- [ ] **Step 1: Neues index.html schreiben.** Verbindliche Punkte:

**Head:** `lang="de"`, Title „AK Digital Systems — Software & Digitale Produkte", Description, OG-Tags (og:image → `assets/og-image.png`, wird in Task 7 erzeugt), `<link rel="icon" href="assets/favicon.svg">`, Canonical `https://ak-digital-systems.de`, Google Fonts (Space Grotesk 500/700 + Inter 400/600, `display=swap`, preconnect), JSON-LD:

```html
<script type="application/ld+json">
{"@context":"https://schema.org","@graph":[
 {"@type":"Organization","name":"AK Digital Systems","url":"https://ak-digital-systems.de","founder":{"@id":"#ak"},"address":{"@type":"PostalAddress","streetAddress":"Jägerstr. 4","postalCode":"34431","addressLocality":"Marsberg","addressCountry":"DE"}},
 {"@type":"Person","@id":"#ak","name":"Alexander Karasjuk","jobTitle":"IT Consultant — Observability, Industrial IoT & Data Analytics","worksFor":{"@type":"Organization","name":"Manage Now"}}
]}
</script>
```

**Body-Gerüst** (Reihenfolge fix, IDs verbindlich — CSS/JS referenzieren sie):

```html
<a href="#main" class="skip-nav">Zum Inhalt springen</a>
<canvas id="scene" aria-hidden="true"></canvas>   <!-- fixed, hinter Inhalt -->
<div id="scene-fallback" aria-hidden="true" hidden><!-- statisches SVG (Ring-Motiv wie Favicon, groß) --></div>
<nav class="site-nav" aria-label="Hauptnavigation"> … Logo „AK Digital Systems" + Links: #leistungen #produkt #person #kontakt + CTA „Kontakt aufnehmen" … </nav>
<main id="main">
  <section class="hero" id="top">           <!-- ① -->
  <section class="stats" id="zahlen">       <!-- ② dunkel -->
  <section class="services" id="leistungen"><!-- ③ -->
  <section class="product" id="produkt">    <!-- ④ -->
  <section class="person" id="person">      <!-- ⑤ -->
  <section class="timeline" id="werdegang"> <!-- ⑥ -->
  <section class="stack" id="stack">        <!-- ⑦ -->
  <section class="contact" id="kontakt">    <!-- ⑧ dunkel, enthält Impressum -->
</main>
<footer class="site-footer"> … © Jahr · Impressum-Anker … </footer>
<script src="vendor/gsap.min.js"></script>
<script src="vendor/ScrollTrigger.min.js"></script>
<script type="module" src="js/scene.js"></script>
<script src="js/main.js" defer></script>
```

**Verbindliche Texte** (aus Spec/LinkedIn destilliert — wörtlich übernehmen):

- **Hero:** Eyebrow „Software & Digitale Produkte — Marsberg"; H1 `Digitale Produkte, durchdacht bis ins System.` (Wörter einzeln in `<span class="w">` für Stagger-Reveal); Lead „AK Digital Systems entwickelt und betreibt eigene mobile Apps, webbasierte Plattformen und digitale Dienste — von der ersten Idee bis zum produktiven Betrieb."; CTAs „Produkt ansehen" (→ #produkt, primär) + „Die Person dahinter" (→ #person, sekundär); Scroll-Hinweis.
- **Stats (4 Items, `data-count` für Count-Up):** `11+` Jahre Enterprise-IT · `2` Stores — App Store & Google Play · `3` Sprachen — DE · EN · ES · `B.Sc.` Wirtschaftsinformatik (kein Count-Up beim letzten).
- **Leistungen (3 Karten):**
  1. *Mobile Apps* — „iOS- und Android-Apps mit Flutter: eine Codebasis, native Performance — vom Prototyp bis zum Store-Release."
  2. *Web-Plattformen* — „Skalierbare Web-Anwendungen und SaaS-Dienste mit Cloud-Backend, Authentifizierung und Abo-Modellen."
  3. *Betrieb & Infrastruktur* — „Laufender Betrieb, Monitoring und Weiterentwicklung — zuverlässig, sicher und auf Wachstum ausgelegt."
- **mema-Showcase:** Badge „Eigenes Produkt · Live in beiden Stores"; H3 „mema"; Tagline „Medikamenten-Management & Erinnerungen"; Text „Von der Idee bis zum Store-Release in Eigenregie: mema erinnert zuverlässig an Medikamente und verbindet Anwender mit ihren Angehörigen über Cloud-Sync — offline-fähig, datenschutzkonform, im Abo-Modell betrieben."; Tech-Pills: Flutter · Supabase · Cloud-Sync · In-App-Subscriptions · 3 Sprachen; Link-Button „mema-care.de ↗" (target _blank, rel noopener); beide Screenshots in `.phone-frame`-Wrappern (`assets/mema-home.png`, `assets/mema-meds.png`, alt-Texte „mema App — Startbildschirm mit Tagesübersicht" / „mema App — Medikamentenliste", `loading="lazy"`, width/height-Attribute).
- **Person:** Foto (`assets/alexander-karasjuk.webp`, alt „Porträt von Alexander Karasjuk"); H2 „Die Person dahinter"; Name „Alexander Karasjuk"; Rolle „Gründer von AK Digital Systems · IT Consultant für Observability, Industrial IoT & Data Analytics"; Text „Seit über elf Jahren mache ich Daten sichtbar — vom Serverraum bis zur Produktionshalle. Bei Manage Now (ehemals Fujitsu Technology Solutions) verbinde ich Maschinensignale, IT-Infrastruktur und Geschäftsprozesse zu Entscheidungsgrundlagen. Mit AK Digital Systems bringe ich dieselbe Sorgfalt in eigene Produkte: Software, die nicht nur funktioniert, sondern betrieben, gewartet und weitergedacht wird."
- **Timeline (7 Stationen, je `.tl-item` mit Jahr + Titel + Zeile):** exakt die 7 Einträge aus Spec Abschnitt 3 („Inhalte Werdegang"), absteigend ab Okt. 2025.
- **Stack (2 Gruppen-Karten):** „Produkt-Entwicklung": Flutter · Dart · Supabase · PostgreSQL · Cloudflare · Store-Releases (App Store / Google Play). „Enterprise & Data": Grafana · Prometheus · OpenSearch · Kubernetes · Python · OPC-UA / MQTT. Subline: „Bewusst kuratiert — die Werkzeuge, mit denen ich aktuell arbeite."
- **Kontakt:** H2 „Lass uns sprechen."; E-Mail `kontakt@ak-digital-systems.de` (mailto), Adresse (AK Digital Systems, Jägerstr. 4, 34431 Marsberg, Deutschland), Web-Links ak-digital-systems.de + mema-care.de. **Impressum:** kompletter Block (Angaben § 5 TMG, Kontakt, Verantwortlich § 18 Abs. 2 MStV, Haftungsausschluss) wörtlich aus der alten `index.html` (Zeilen 1393–1436 der Vorversion, via `git show HEAD~1:index.html` abrufbar).

- [ ] **Step 2: Verifizieren** — `python3 -m http.server 8765 &` starten, `curl -s localhost:8765 | grep -c "<section"` → Erwartet: `8`. Alle Asset-Pfade prüfen: `curl -s -o /dev/null -w "%{http_code}" localhost:8765/assets/mema-home.png` → `200`.

- [ ] **Step 3: Commit** — `git add index.html && git commit -m "feat: neue One-Pager-Struktur mit allen 8 Sektionen + Inhalten"`

---

### Task 4: css/style.css — Design-System

**Files:**
- Create: `css/style.css` (in Task 3 bereits via `<link>` referenziert)

- [ ] **Step 1: Stylesheet schreiben.** Verbindliche Tokens:

```css
:root {
  --bg: #fafbfd; --bg-2: #eef2f7;            /* heller Grund (Verlauf) */
  --ink: #0f1a30; --ink-soft: #33415e; --ink-dim: #5a6b88;
  --primary: #2563eb; --indigo: #4f46e5; --violet: #9333ea;
  --card: #ffffff; --line: #e2e8f2;
  --dark-bg: #0f1a30; --dark-ink: #f1f5f9; --dark-dim: #8da3c8;
  --font-head: 'Space Grotesk', sans-serif; --font-body: 'Inter', system-ui, sans-serif;
  --radius: 14px; --radius-lg: 22px; --max-w: 1140px;
  --shadow-soft: 0 18px 40px -18px rgba(15, 26, 48, 0.18);
}
```

Kernregeln (Auszug — Rest analog im Stil des Mockups):

```css
body { background: linear-gradient(170deg, var(--bg), var(--bg-2)); color: var(--ink); font-family: var(--font-body); }
#scene { position: fixed; inset: 0; z-index: 0; pointer-events: none; }
main, .site-nav, .site-footer { position: relative; z-index: 1; }
.section-dark { background: var(--dark-bg); color: var(--dark-ink); }   /* Stats + Kontakt */
.hero h1 { font-family: var(--font-head); font-size: clamp(2.5rem, 7vw, 4.5rem); letter-spacing: -0.03em; line-height: 1.04; }
.hero h1 .w { display: inline-block; }                                   /* Reveal-Einheit */
.card { background: var(--card); border: 1px solid var(--line); border-radius: var(--radius); transition: transform .25s, box-shadow .25s; }
.card:hover { transform: translateY(-4px); box-shadow: var(--shadow-soft); }
.phone-frame { border-radius: 28px; border: 6px solid var(--ink); overflow: hidden; box-shadow: var(--shadow-soft); transform: perspective(900px) rotateY(-12deg) rotateX(4deg); }
.tl-line { position: absolute; left: 0; top: 0; width: 2px; height: 100%; background: var(--primary); transform-origin: top; transform: scaleY(0); } /* JS scrubbt scaleY */
@media (prefers-reduced-motion: reduce) { .hero h1 .w, .reveal { opacity: 1 !important; transform: none !important; } }
```

Responsive: Mobile-first; ab 768px 2-spaltige Grids (Stack, Person), ab 1024px 3-spaltig (Leistungen), Phone-Frames nebeneinander. Nav: auf Mobile nur Logo + CTA (Links versteckt — identisch zum Verhalten der alten Seite).

- [ ] **Step 2: Verifizieren** — Headless-Screenshot Desktop:

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu \
  --screenshot=/tmp/akds-desktop.png --window-size=1440,2400 http://localhost:8765
```

Screenshot mit Read-Tool ansehen: helles Layout, dunkle Bänder bei Stats + Kontakt, Karten/Typo wie Mockup.

- [ ] **Step 3: Commit** — `git add css/ && git commit -m "feat: Design-System C-Light (Tokens, Sektionen, Responsive)"`

---

### Task 5: js/scene.js — Three.js-Szene

**Files:**
- Create: `js/scene.js` (ES Module)

- [ ] **Step 1: Szene implementieren.** Architektur (verbindlich):

```js
import * as THREE from '../vendor/three.module.min.js';

const canvas = document.getElementById('scene');
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const isMobile = matchMedia('(max-width: 768px)').matches;

// --- WebGL-Fallback ---
function webglOk() { try { const c = document.createElement('canvas');
  return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; } }
if (!webglOk()) { canvas.remove(); document.getElementById('scene-fallback').hidden = false; }
else init();

function init() {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));            // DPR-Cap
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, innerWidth/innerHeight, 0.1, 60);
  camera.position.set(0, 0.4, 9);

  // 4 konzentrische Ringe (TorusGeometry, dünn) + Knoten (kleine Spheres auf Ringbahn)
  // Farben: #2563eb / #4f46e5 / #9333ea / #60a5fa — MeshBasicMaterial-Linienlook +
  // ein „Kern" (Sphere, #2563eb). Boden-Schatten: Plane mit radialem Gradient-Sprite.
  const rings = makeRings(isMobile ? 48 : 128);                     // Segment-Reduktion mobil
  const group = new THREE.Group(); group.add(...rings); scene.add(group);

  // Maus-Parallax nur Desktop, sanft via gsap.quickTo
  // Morph-Stationen: pro Sektion ein GSAP-Timeline-Segment mit ScrollTrigger scrub —
  // Hero:  group.rotation.y langsam, Ringe koplanar
  // #leistungen: Ringe separieren (positions y: -1.2/0/1.2), Neigung auf
  // #produkt: group.position.x → +3.5 (weicht den Screenshots aus), scale 0.6
  // #person/#werdegang: group zentriert hinter Inhalt, opacity der Materials 0.25
  // #kontakt: kompakte Endform (Ringe konzentrisch, scale 0.8), Farben → hell (#93c5fd)
  buildScrollMorphs(group, rings);

  // Render-Loop: pausiert via IntersectionObserver auf document.body-Sichtbarkeit
  // + document.visibilitychange; bei reduced-motion: genau 1 Frame rendern, kein Loop.
}
```

Vollständige Implementierung ausformulieren (makeRings, buildScrollMorphs mit `gsap.timeline({scrollTrigger:{trigger,start,end,scrub:0.6}})` pro Station, Resize-Handler mit Debounce). Kein Glow/Bloom — nur klare Linien + weicher Schatten (Sprite-Textur, canvas-generiert).

- [ ] **Step 2: Verifizieren — Konsole muss fehlerfrei sein**

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu \
  --enable-logging=stderr --v=0 --virtual-time-budget=5000 \
  --dump-dom http://localhost:8765 2>&1 >/dev/null | grep -iE "console|error" | grep -v "deprecat" || echo "KONSOLE SAUBER"
```

Erwartet: `KONSOLE SAUBER` (keine JS-Errors).

- [ ] **Step 3: Commit** — `git add js/scene.js && git commit -m "feat: Three.js-Studioszene mit Scroll-Morphs, DPR-Cap, Fallback"`

---

### Task 6: js/main.js — GSAP-Animationen & Interaktion

**Files:**
- Create: `js/main.js`

- [ ] **Step 1: Implementieren.** Verbindliche Bausteine:

```js
gsap.registerPlugin(ScrollTrigger);
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!reduced) {
  // 1) Hero-Headline: Wörter staggern (.hero h1 .w) — y:40, opacity:0 → stagger 0.08
  // 2) Count-Up: alle [data-count] — gsap.from mit snap:1, ScrollTrigger once
  // 3) Karten-Stagger: .services .card / .stack .card — y:32, stagger 0.12
  // 4) Phone-Frames: rotateY(-12deg) → 0 bei Scroll in #produkt (scrub 0.5)
  // 5) Foto-Parallax: .person img — yPercent ±8 (scrub)
  // 6) Timeline-Linie: .tl-line scaleY 0→1 (scrub) + .tl-item Stagger-Fade
  // 7) Sektion-Reveals: .reveal — opacity/y, einmalig
}
// Immer (auch reduced): Footer-Jahr, Nav-Scroll-Zustand (Schatten ab 10px),
// sanftes Anchor-Scrolling (CSS scroll-behavior reicht; bei reduced: auto).
document.getElementById('year').textContent = new Date().getFullYear();
```

- [ ] **Step 2: Verifizieren** — Konsolen-Check wie Task 5 Step 2 (weiterhin `KONSOLE SAUBER`) **und** Mobile-Screenshot:

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu \
  --screenshot=/tmp/akds-mobile.png --window-size=375,3000 http://localhost:8765
```

Screenshot ansehen: kein horizontales Overflow, Sektionen sauber gestapelt, Texte lesbar.

- [ ] **Step 3: Commit** — `git add js/main.js && git commit -m "feat: GSAP-Reveals, Count-Up, Timeline-Scrub, Nav-Verhalten"`

---

### Task 7: DevTools-Verifikation, OG-Bild, Lighthouse

**Files:**
- Create: `assets/og-image.png`
- Modify: ggf. Fixes in allen Dateien

- [ ] **Step 1: Screenshots aller 3 Viewports erstellen und MIT READ-TOOL ANSEHEN**

```bash
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
"$CHROME" --headless=new --disable-gpu --screenshot=/tmp/akds-1440.png --window-size=1440,4200 http://localhost:8765
"$CHROME" --headless=new --disable-gpu --screenshot=/tmp/akds-768.png  --window-size=768,4600  http://localhost:8765
"$CHROME" --headless=new --disable-gpu --screenshot=/tmp/akds-375.png  --window-size=375,5200  http://localhost:8765
```

Jeden Screenshot prüfen: Layout-Brüche, Kontrast, Überlappungen des Canvas mit Text, Phone-Frames, dunkle Sektionen. Gefundene Probleme sofort fixen, Screenshot wiederholen.

- [ ] **Step 2: OG-Bild aus Hero erzeugen**

```bash
"$CHROME" --headless=new --disable-gpu --screenshot=assets/og-image.png --window-size=1200,630 http://localhost:8765
```

Ansehen; wenn der Ausschnitt unglücklich ist: eigene minimale `og.html` (Headline + Ringe, 1200×630) bauen und abfotografieren, danach `og.html` wieder löschen.

- [ ] **Step 3: Lighthouse (mobil + desktop)**

```bash
npx --yes lighthouse@latest http://localhost:8765 --quiet --chrome-flags="--headless=new" \
  --only-categories=performance,accessibility,seo --output=json --output-path=/tmp/lh-mobile.json
node -e "const r=require('/tmp/lh-mobile.json').categories; console.log(Object.entries(r).map(([k,v])=>k+': '+Math.round(v.score*100)).join(' | '))"
npx --yes lighthouse@latest http://localhost:8765 --quiet --preset=desktop --chrome-flags="--headless=new" \
  --only-categories=performance,accessibility,seo --output=json --output-path=/tmp/lh-desktop.json
node -e "const r=require('/tmp/lh-desktop.json').categories; console.log(Object.entries(r).map(([k,v])=>k+': '+Math.round(v.score*100)).join(' | '))"
```

Erwartet: alle Werte ≥ 90. Bei Unterschreitung: Findings aus dem JSON lesen, fixen, wiederholen.

- [ ] **Step 4: Reduced-Motion-Check** — Screenshot mit emulierter Einstellung; Inhalte müssen ohne Animation sichtbar sein (keine `opacity:0`-Leichen):

```bash
"$CHROME" --headless=new --disable-gpu --force-prefers-reduced-motion \
  --screenshot=/tmp/akds-reduced.png --window-size=1440,4200 http://localhost:8765
```

- [ ] **Step 5: Commit** — `git add -A && git commit -m "feat: OG-Bild + Fixes aus DevTools-/Lighthouse-Verifikation"`

---

### Task 8: Abnahme & Deploy

- [ ] **Step 1:** Lokalen Server-Link + Screenshots an Alexander geben, Feedback einarbeiten.
- [ ] **Step 2:** Erst nach expliziter Freigabe: `git push origin main` (= Live-Deploy via Cloudflare Pages). Danach Live-URL prüfen (https://ak-digital-systems.de) + `python3`-Server beenden.

---

## Offene Punkte (vor/bei Task 3 klären)

1. **LinkedIn-Link im Kontakt:** Profil-URL von Alexander erfragen — bis dahin keinen LinkedIn-Button einbauen (keine geratenen URLs).

## Self-Review-Ergebnis

- Spec-Abdeckung: alle 8 Sektionen (Task 3), 3D-Morphs (Task 5), GSAP-Animationen (Task 6), Performance/Mobile/A11y (Tasks 4–6), Verifikation/Lighthouse (Task 7), Assets (Task 2), kein Push ohne Freigabe (Task 8) ✓
- Platzhalter: keine — alle Texte wörtlich definiert, Befehle vollständig ✓
- Konsistenz: IDs (`#scene`, `#leistungen`, `#produkt`, `#person`, `#werdegang`, `#kontakt`, `[data-count]`, `.tl-line`, `.phone-frame`, `.hero h1 .w`) werden in Tasks 3/4/5/6 identisch verwendet ✓
