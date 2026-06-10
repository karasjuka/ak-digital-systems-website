# Design-Spec: Redesign ak-digital-systems.de — „Immersive 3D, Light"

**Datum:** 10.06.2026
**Status:** Entwurf zur Freigabe
**Repo:** `ak-digital-systems-website` (Cloudflare Pages, Auto-Deploy bei Push auf `main`)

---

## 1. Ziel & Positionierung

Die Seite ist eine **professionelle Visitenkarte** für AK Digital Systems (Einzelunternehmen von Alexander Karasjuk). Sie soll Erfahrung und Person glaubwürdig und hochwertig präsentieren — auf dem visuellen Niveau moderner Award-Seiten (GSAP + Three.js), ohne aktiv Aufträge zu akquirieren.

**Wichtige Abgrenzung:** Die Observability-/IIoT-Expertise stammt aus der Anstellung bei Manage Now (ehem. Fujitsu Technology Solutions) und erscheint ausschließlich als **Erfahrungs-Beleg** (Werdegang, Stack) — nicht als Dienstleistungsangebot von AK Digital Systems. Die Leistungen des Unternehmens bleiben: eigene digitale Produkte, Apps, Web-Plattformen, Betrieb.

**Sprache:** Deutsch (wie bisher).

## 2. Design-Richtung: „C-Light — Studio-Inszenierung"

Gewählt aus drei Richtungen (Luminous Dark / Editorial Light / Immersive 3D) plus Dark-Light-Vergleich:

- **Helles, luftiges Grundlayout:** Off-White/Hellgrau-Verlauf (`#fafbfd` → `#eef2f7`), Tinte `#0f1a30`, Primärblau `#2563eb`, Akzente Indigo/Violett.
- **Zentrales Three.js-3D-Objekt** im Studio-Look: präzise Linien, Tiefe, weiche Schlagschatten — **kein Glow/Bloom** (verpufft auf hellem Grund). Wirkung: Architektur-Modell unter Studio-Licht.
- **Dunkle Akzent-Streifen** als Kontrast: Zahlen-Band (Sektion 2) und Kontakt/Footer (Sektion 8) in `#0f1a30`.
- **Typografie:** Space Grotesk (Headlines) + Inter (Fließtext), via Google Fonts mit `font-display: swap`.

## 3. Seitenstruktur (One-Pager, 8 Sektionen)

Dramaturgie: **Unternehmen → Beweis → Person → Kontakt.** Das 3D-Objekt begleitet den Scroll und morpht an jedem Sektionswechsel.

| # | Sektion | Inhalt & Animation |
|---|---------|--------------------|
| 1 | **Hero** (hell) | Nav (Leistungen · Produkt · Person · Kontakt + CTA). Große Headline (wortweiser GSAP-Reveal) — Arbeitsstand: „Digitale Produkte, durchdacht bis ins System." —, Subline, 3D-Objekt rechts mit langsamer Rotation + Maus-Parallax. Scroll-Hinweis. |
| 2 | **Zahlen-Band** (dunkel) | 4 Kennzahlen mit GSAP Count-Up: „11+ Jahre Enterprise-IT", „2 Stores (App Store & Google Play)", „3 Sprachen (DE/EN/ES)", „B.Sc. Wirtschaftsinformatik". |
| 3 | **Leistungen** (hell) | 3 klare Kompetenzfelder statt 6 generischer Karten: Mobile Apps (Flutter, iOS & Android) · Web-Plattformen (SaaS & Cloud-Backends) · Betrieb (Infrastruktur & Monitoring). Karten staggern per ScrollTrigger, Hover hebt mit Schatten an. 3D-Objekt morpht zu „Modulen". |
| 4 | **mema-Showcase** (hell, leicht abgesetzt) | Case Study: „Von der Idee bis zum Store-Release" — Flutter-App, Cloud-Sync, Multi-User-Betreuung, Abo-Modell, live in beiden Stores. Echte App-Screenshots in 3D-geneigten Phone-Frames, die sich beim Scrollen aufrichten. Tech-Pills (Flutter, Supabase, In-App-Subscriptions). Store-Badges + Link mema-care.de. 3D-Objekt zieht sich zurück. |
| 5 | **Die Person dahinter** (hell) | Foto (854×1074-Porträt, warmer Bildton — harmoniert mit hellem Layout) mit subtilem Parallax. Name, Rolle „Gründer · IT Consultant — Observability, IIoT & Data Analytics", Kurzprofil destilliert aus LinkedIn-About (Daten sichtbar machen, vom Maschinensignal zur Management-Entscheidung, 11+ Jahre Enterprise-IT, eigene Produkte). |
| 6 | **Werdegang-Timeline** (hell) | Vertikale Linie zeichnet sich per ScrollTrigger-scrub, Stationen blenden nacheinander ein. |
| 7 | **Stack** (hell) | Bewusst kuratiert auf ~12 Einträge in 2 Gruppen (statt ~40 LinkedIn-Skills — Vorgabe „nicht überladen"). |
| 8 | **Kontakt + Impressum + Footer** (dunkel) | „Lass uns sprechen." E-Mail, Adresse Marsberg, Web-Links, LinkedIn. Impressum als kompakter Block (Inhalte unverändert von aktueller Seite übernehmen). 3D-Objekt „landet" in finaler kompakter Form, Linienfarben wechseln auf hell. |

### Inhalte Werdegang (Sektion 6, aus LinkedIn — verbindlich)

- **Okt. 2025 – heute · Manage Now** — IT Consultant: Observability, Industrial IoT & Data Analytics
- **Juli 2024 · Manage Now** — Weiterbeschäftigung nach Übernahme & Rebranding von Fujitsu Technology Solutions (Hannover, hybrid)
- **Okt. 2021 – Juli 2024 · Fujitsu** — IT Consultant: Enterprise-Observability-Plattformen für Datacenter & IT-Infrastruktur
- **2022 · B.Sc. Wirtschaftsinformatik** — FH Südwestfalen (berufsbegleitend, 2014–2022)
- **Juni 2019 – Sept. 2021 · Fujitsu** — System Engineer: Monitoring-Lösungen für Enterprise-Kunden
- **Juni 2017 – Mai 2019 · Fujitsu** — Assistant Service Manager
- **Sept. 2014 – Mai 2017 · Fujitsu / ATIW Paderborn** — Ausbildung Fachinformatiker Systemintegration (IHK)

### Inhalte Stack (Sektion 7 — verbindlich, max. 12 Einträge)

- **Produkt-Entwicklung:** Flutter · Dart · Supabase · PostgreSQL · Cloudflare · Store-Releases (App Store / Google Play)
- **Enterprise & Data:** Grafana · Prometheus · OpenSearch · Kubernetes · Python · OPC-UA / MQTT

## 4. Technische Architektur

**Statisch ohne Build-Schritt** (gewählt gegen Vite): Push = live, nichts kann am Build scheitern.

```
ak-digital-systems-website/
├── index.html          # Struktur + Inhalte
├── css/style.css       # Design-System (Custom Properties, Sektionen, Responsive)
├── js/main.js          # GSAP-Setup, ScrollTrigger-Animationen, Nav, Count-Up
├── js/scene.js         # Three.js-Szene (ES Module)
├── vendor/             # gsap.min.js, ScrollTrigger.min.js, three.module.js — lokal gebündelt, kein CDN-Risiko
├── assets/             # Foto (WebP), mema-Screenshots, Favicon, OG-Bild
├── docs/superpowers/   # Specs & Pläne
├── _headers            # Bestehende Security-Header (beibehalten)
└── _redirects          # Beibehalten
```

### Three.js-Szene

- Abstraktes „System" aus 3–4 konzentrischen, leicht gekippten Ringen mit Knotenpunkten und feinen Verbindungslinien (Line-/Tube-Geometrie, dünne Materials in Blau/Indigo/Violett-Abstufung), weicher Boden-Schatten.
- Fixiertes `<canvas>` hinter dem Inhalt (`position: fixed`, `z-index` unter Content, `pointer-events: none`).
- **Morph-Stationen** via GSAP ScrollTrigger (scrub): Hero = ruhige Rotation + Maus-Parallax → Leistungen = Ringe separieren sich zu „Modulen" → mema = Objekt weicht zur Seite/verkleinert sich → Person/Timeline = dezent im Hintergrund → Kontakt = finale kompakte Form, Linienfarben hell (dunkler Grund).

### GSAP-Animationen

Headline-Reveal (wortweise, beim Laden), Count-Up Zahlen-Band, Karten-Stagger (Leistungen), Phone-Frame-Aufrichtung (mema), Foto-Parallax (Person), Timeline-Linie (scrub), sanfte Section-Fades.

## 5. Performance, Mobile, Zugänglichkeit

- **Mobile:** reduzierte 3D-Komplexität (weniger Segmente), `devicePixelRatio` gedeckelt auf 2, kein Maus-Parallax (stattdessen sanfte Auto-Rotation), kürzere Animationsdistanzen.
- **`prefers-reduced-motion`:** alle Scroll-/Reveal-Animationen aus, 3D-Objekt statisch (ein gerendertes Frame).
- **Energie:** `IntersectionObserver` pausiert den Render-Loop, wenn der Canvas nicht sichtbar ist; `requestAnimationFrame` stoppt bei Tab-Wechsel.
- **WebGL-Fallback:** ohne WebGL erscheint eine statische SVG-Variante des Objekts.
- **Assets:** Foto + Screenshots als WebP (Original-JPEG als Fallback nur falls nötig), `loading="lazy"` unterhalb des Folds, explizite `width`/`height` gegen Layout-Shift.
- **A11y:** Skip-Nav, semantische Landmarks, ARIA-Labels, Fokus-Stile, Kontrast AA auf hellem Grund (Tinte `#0f1a30` auf `#fafbfd`), dekorative Elemente `aria-hidden`.
- **SEO:** Title/Description aktualisiert, Open-Graph-Bild (neu erstellt, 1200×630), strukturierte Daten (`Person` + `Organization` JSON-LD), Canonical.

## 6. Verifikation (Definition of Done)

1. Lokaler Server + **Chrome DevTools**: Konsole fehlerfrei, Screenshots bei 1440px / 768px / 375px, alle Sektionen + Animationen geprüft.
2. **Lighthouse:** Performance, Accessibility, SEO jeweils ≥ 90 (mobil & Desktop).
3. `prefers-reduced-motion` und WebGL-Fallback manuell verifiziert.
4. Erst nach Freigabe durch Alexander: Push auf `main` (= Live-Deploy via Cloudflare Pages).

## 7. Assets & Quellen

- **Foto:** `~/Downloads/AK-profile-picture.jpeg` (854×1074) → optimiert nach `assets/`.
- **mema-Screenshots:** aus vorhandenen Brand-Assets (mema-marketing / mema-assets-Bucket); bei Bedarf liefert Alexander aktuelle Store-Screenshots nach.
- **Impressum-Inhalte:** unverändert aus aktueller `index.html` übernehmen.
- **Texte:** destilliert aus LinkedIn-Profil (About, Erfahrung, Ausbildung) — keine erfundenen Fakten.

## 8. Nicht im Scope

- Mehrsprachigkeit (EN/ES), Blog, CMS, Kontaktformular (E-Mail-Link genügt), Analytics/Tracking, Vite/Build-Tooling, Consulting-Angebotsseiten.
