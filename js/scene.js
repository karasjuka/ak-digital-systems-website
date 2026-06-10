/* AK Digital Systems — Three.js-Studioszene
   Konzentrische Ringe mit Knoten, Studio-Licht, weicher Bodenschatten.
   Morpht per GSAP ScrollTrigger über die Sektionen. Kein Glow (C-Light). */

import * as THREE from '../vendor/three.module.min.js';

const canvas = document.getElementById('scene');
const fallback = document.getElementById('scene-fallback');
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const isMobile = matchMedia('(max-width: 768px)').matches;

function webglOk() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch (_) {
    return false;
  }
}

if (!webglOk() || typeof gsap === 'undefined') {
  canvas.remove();
  fallback.hidden = false;
} else {
  init();
}

function init() {
  gsap.registerPlugin(ScrollTrigger);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(innerWidth, innerHeight);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, innerWidth / innerHeight, 0.1, 60);
  camera.position.set(0, 0.35, 9);

  // Studio-Licht: weiches Key-Light + Aufheller, keine Effekte
  scene.add(new THREE.AmbientLight(0xffffff, 0.85));
  const key = new THREE.DirectionalLight(0xffffff, 1.6);
  key.position.set(4, 6, 7);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xbfd3f5, 0.5);
  fill.position.set(-5, -2, 4);
  scene.add(fill);

  const COLORS = [0x2563eb, 0x4f46e5, 0x9333ea, 0x60a5fa];
  const segments = isMobile ? 64 : 160;

  const group = new THREE.Group();
  scene.add(group);
  // Eigene Drehgruppe für die Idle-Rotation — getrennt von group.rotation.y,
  // das die Scroll-Timeline absolut steuert (sonst Sprünge beim Scroll-Start).
  const spin = new THREE.Group();
  group.add(spin);

  // --- Ringe + Knoten ---
  const rings = [];
  const RING_DEFS = [
    { radius: 2.6, tube: 0.030, tilt: 0.42, nodes: 5 },
    { radius: 2.0, tube: 0.026, tilt: 0.42, nodes: 4 },
    { radius: 1.45, tube: 0.022, tilt: 0.42, nodes: 3 },
    { radius: 0.95, tube: 0.020, tilt: 0.42, nodes: 2 },
  ];

  RING_DEFS.forEach((def, i) => {
    const ringGroup = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({
      color: COLORS[i], roughness: 0.45, metalness: 0.15,
      transparent: true, opacity: 0.95,
    });
    const torus = new THREE.Mesh(
      new THREE.TorusGeometry(def.radius, def.tube, 12, segments), mat
    );
    ringGroup.add(torus);

    // Knoten auf der Ringbahn
    const nodeMat = new THREE.MeshStandardMaterial({
      color: COLORS[i], roughness: 0.3, metalness: 0.2,
      transparent: true, opacity: 0.95,
    });
    for (let n = 0; n < def.nodes; n++) {
      const a = (n / def.nodes) * Math.PI * 2 + i;
      const node = new THREE.Mesh(new THREE.SphereGeometry(0.055, 14, 14), nodeMat);
      node.position.set(Math.cos(a) * def.radius, Math.sin(a) * def.radius, 0);
      ringGroup.add(node);
    }

    ringGroup.rotation.x = Math.PI / 2 - def.tilt;
    ringGroup.rotation.z = i * 0.5;
    spin.add(ringGroup);
    rings.push({ g: ringGroup, mat, nodeMat, def });
  });

  // --- Kern ---
  const coreMat = new THREE.MeshStandardMaterial({
    color: 0x2563eb, roughness: 0.25, metalness: 0.3,
    transparent: true, opacity: 1,
  });
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.16, 24, 24), coreMat);
  spin.add(core);

  // --- Weicher Bodenschatten (Canvas-Sprite, kein echtes Shadow-Mapping nötig) ---
  const shadowCanvas = document.createElement('canvas');
  shadowCanvas.width = shadowCanvas.height = 256;
  const sctx = shadowCanvas.getContext('2d');
  const grad = sctx.createRadialGradient(128, 128, 8, 128, 128, 120);
  grad.addColorStop(0, 'rgba(15, 26, 48, 0.30)');
  grad.addColorStop(1, 'rgba(15, 26, 48, 0)');
  sctx.fillStyle = grad;
  sctx.fillRect(0, 0, 256, 256);
  const shadowMat = new THREE.MeshBasicMaterial({
    map: new THREE.CanvasTexture(shadowCanvas), transparent: true, depthWrite: false,
  });
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(6.5, 6.5), shadowMat);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = -2.6;
  group.add(shadow);

  // --- Grundposition: rechts neben dem Hero-Text (mobil: oben rechts, kleiner) ---
  function basePose() {
    if (matchMedia('(max-width: 768px)').matches) {
      group.position.set(1.75, 2.35, 0);
      group.scale.setScalar(0.36);
    } else {
      group.position.set(2.6, 0.1, 0);
      group.scale.setScalar(1);
    }
  }
  basePose();
  group.rotation.set(0.15, -0.3, 0);

  // --- Reduced Motion: genau ein Frame, fertig ---
  if (reduced) {
    renderer.render(scene, camera);
    canvas.classList.add('ready');
    return;
  }
  canvas.classList.add('ready');

  // --- Idle-Rotation ---
  const idle = { speed: 0.0016 };

  // --- Maus-Parallax (nur Desktop) ---
  // Bewusst nur auf Properties, die die Scroll-Timeline NICHT anfasst
  // (group.rotation.x + Kamera), sonst kämpfen Tweens gegeneinander.
  if (!isMobile) {
    const rotX = gsap.quickTo(group.rotation, 'x', { duration: 1.2, ease: 'power2.out' });
    const camX = gsap.quickTo(camera.position, 'x', { duration: 1.6, ease: 'power2.out' });
    addEventListener('pointermove', (e) => {
      const nx = (e.clientX / innerWidth) - 0.5;
      const ny = (e.clientY / innerHeight) - 0.5;
      rotX(0.15 + ny * 0.16);
      camX(nx * -0.18);
    }, { passive: true });
  }

  // --- Scroll-Morph: EINE Master-Timeline über die ganze Seite ---
  // Pro Sektion eine definierte Pose; das Objekt bleibt konsequent in den
  // Randzonen (nie hinter Textspalten). Eine einzige scrub-Timeline statt
  // mehrerer Trigger verhindert konkurrierende Tweens (Ruckler/Sprünge).
  const allMats = [coreMat, ...rings.flatMap(r => [r.mat, r.nodeMat])];
  const NORMAL = COLORS.map(c => new THREE.Color(c));
  const LIGHT = [0x93c5fd, 0xa5b4fc, 0xc4b5fd, 0xbfdbfe].map(c => new THREE.Color(c));
  let master = null;

  // Pose: x/y/scale/rotY, op (Material-Opazität), spread (Ring-Separation),
  // shadow (Schatten-Opazität), light (helle Farben für dunklen Grund)
  function poses(mobileNow) {
    if (mobileNow) {
      return [
        { sel: '#top',       x: 1.75, y: 2.35, s: 0.36, rotY: -0.3, op: 0.95, spread: 0,   shadow: 0.55, light: false },
        { sel: '#zahlen',    x: 1.6,  y: 2.9,  s: 0.30, rotY: 0.3,  op: 0.35, spread: 0.4, shadow: 0,    light: false },
        { sel: '#leistungen',x: 1.7,  y: 3.1,  s: 0.28, rotY: 0.8,  op: 0.22, spread: 0.5, shadow: 0,    light: false },
        { sel: '#produkt',   x: 1.8,  y: 3.2,  s: 0.26, rotY: 1.2,  op: 0.15, spread: 0,   shadow: 0,    light: false },
        { sel: '#person',    x: 1.8,  y: 3.2,  s: 0.26, rotY: 1.6,  op: 0.12, spread: 0,   shadow: 0,    light: false },
        { sel: '#werdegang', x: 1.6,  y: 3.0,  s: 0.30, rotY: 2.0,  op: 0.18, spread: 0.3, shadow: 0,    light: false },
        { sel: '#stack',     x: 1.7,  y: 3.1,  s: 0.28, rotY: 2.4,  op: 0.15, spread: 0,   shadow: 0,    light: false },
        { sel: '#kontakt',   x: 1.2,  y: 2.4,  s: 0.34, rotY: 3.0,  op: 0.55, spread: 0,   shadow: 0,    light: true },
      ];
    }
    return [
      { sel: '#top',       x: 2.6,  y: 0.1,  s: 1.0,  rotY: -0.3, op: 0.95, spread: 0,   shadow: 0.55, light: false },
      { sel: '#zahlen',    x: 4.6,  y: -0.4, s: 0.7,  rotY: 0.3,  op: 0.45, spread: 0.5, shadow: 0.2,  light: false },
      { sel: '#leistungen',x: -4.8, y: -0.6, s: 0.65, rotY: 0.9,  op: 0.30, spread: 0.6, shadow: 0,    light: false },
      { sel: '#produkt',   x: -5.2, y: 0.2,  s: 0.45, rotY: 1.3,  op: 0.18, spread: 0,   shadow: 0,    light: false },
      { sel: '#person',    x: 4.9,  y: -2.1, s: 0.55, rotY: 1.7,  op: 0.14, spread: 0,   shadow: 0,    light: false },
      { sel: '#werdegang', x: 3.5,  y: -0.8, s: 0.75, rotY: 2.1,  op: 0.28, spread: 0.3, shadow: 0.12, light: false },
      { sel: '#stack',     x: 4.8,  y: -0.5, s: 0.6,  rotY: 2.5,  op: 0.20, spread: 0,   shadow: 0,    light: false },
      { sel: '#kontakt',   x: 3.3,  y: 0.6,  s: 0.8,  rotY: 3.1,  op: 0.60, spread: 0,   shadow: 0,    light: true },
    ];
  }

  function buildMaster() {
    if (master) { master.scrollTrigger && master.scrollTrigger.kill(); master.kill(); }
    const mobileNow = matchMedia('(max-width: 768px)').matches;
    const list = poses(mobileNow);
    const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);

    master = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 1 },
    });

    // Zeitpunkte: Pose i ist erreicht, wenn ihre Sektion den Viewport-Top
    // erreicht (normalisiert auf 0..1 der Gesamt-Scrollstrecke).
    let prevT = 0;
    list.forEach((p, i) => {
      const el = document.querySelector(p.sel);
      if (!el) return;
      const t = Math.min(1, Math.max(0, (el.offsetTop - innerHeight * 0.35) / max));
      const d = Math.max(0.001, t - prevT);
      const at = prevT;
      if (i > 0) {
        master.to(group.position, { x: p.x, y: p.y, duration: d }, at);
        master.to(group.scale, { x: p.s, y: p.s, z: p.s, duration: d }, at);
        master.to(group.rotation, { y: p.rotY, duration: d }, at);
        master.to(allMats, { opacity: p.op, duration: d }, at);
        master.to(shadowMat, { opacity: p.shadow, duration: d }, at);
        rings.forEach((r, ri) => {
          master.to(r.g.position, { y: (ri - 1.5) * p.spread, duration: d }, at);
          master.to(r.g.rotation, { z: ri * 0.5 + p.rotY * (0.4 + ri * 0.15), duration: d }, at);
        });
        const palette = p.light ? LIGHT : NORMAL;
        rings.forEach((r, ri) => {
          const c = palette[ri];
          master.to(r.mat.color, { r: c.r, g: c.g, b: c.b, duration: d }, at);
          master.to(r.nodeMat.color, { r: c.r, g: c.g, b: c.b, duration: d }, at);
        });
        const cc = p.light ? LIGHT[0] : new THREE.Color(0x2563eb);
        master.to(coreMat.color, { r: cc.r, g: cc.g, b: cc.b, duration: d }, at);
      }
      prevT = t;
    });
  }
  buildMaster();

  // --- Render-Loop: pausiert bei verstecktem Tab ---
  let running = true;
  document.addEventListener('visibilitychange', () => {
    running = !document.hidden;
    if (running) requestAnimationFrame(tick);
  });

  function tick() {
    if (!running) return;
    spin.rotation.y += idle.speed;
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  // --- Resize (debounced) ---
  let rto;
  addEventListener('resize', () => {
    clearTimeout(rto);
    rto = setTimeout(() => {
      camera.aspect = innerWidth / innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(innerWidth, innerHeight);
      buildMaster();
      ScrollTrigger.refresh();
    }, 150);
  }, { passive: true });
}
