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
    group.add(ringGroup);
    rings.push({ g: ringGroup, mat, nodeMat, def });
  });

  // --- Kern ---
  const coreMat = new THREE.MeshStandardMaterial({
    color: 0x2563eb, roughness: 0.25, metalness: 0.3,
    transparent: true, opacity: 1,
  });
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.16, 24, 24), coreMat);
  group.add(core);

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
      group.position.set(1.1, 1.7, 0);
      group.scale.setScalar(0.52);
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
    return;
  }

  // --- Idle-Rotation ---
  const idle = { speed: 0.0016 };

  // --- Maus-Parallax (nur Desktop) ---
  if (!isMobile) {
    const rotX = gsap.quickTo(group.rotation, 'x', { duration: 1.2, ease: 'power2.out' });
    const posY = gsap.quickTo(group.position, 'y', { duration: 1.4, ease: 'power2.out' });
    const baseY = group.position.y;
    addEventListener('pointermove', (e) => {
      const nx = (e.clientX / innerWidth) - 0.5;
      const ny = (e.clientY / innerHeight) - 0.5;
      rotX(0.15 + ny * 0.18);
      posY(baseY - ny * 0.25 + nx * 0.05);
    }, { passive: true });
  }

  // --- Scroll-Morph-Stationen ---
  const mb = isMobile;

  // ② Stats + ③ Leistungen: Ringe separieren sich vertikal zu "Modulen"
  const tlServices = gsap.timeline({
    scrollTrigger: { trigger: '#zahlen', start: 'top bottom', endTrigger: '#leistungen', end: 'center center', scrub: 0.6 },
  });
  rings.forEach((r, i) => {
    tlServices.to(r.g.position, { y: (i - 1.5) * 1.05, ease: 'none' }, 0);
    tlServices.to(r.g.rotation, { z: `+=${0.6 + i * 0.2}`, ease: 'none' }, 0);
  });
  tlServices.to(group.position, { x: mb ? 0.9 : -2.4, y: mb ? 1.4 : -0.2, ease: 'none' }, 0)
            .to(group.rotation, { y: 0.5, ease: 'none' }, 0)
            .to(group.scale, { x: mb ? 0.45 : 0.8, y: mb ? 0.45 : 0.8, z: mb ? 0.45 : 0.8, ease: 'none' }, 0)
            .to(shadowMat, { opacity: 0.35, ease: 'none' }, 0);

  // ④ Produkt: Objekt weicht den Screenshots aus (nach links, klein)
  const tlProduct = gsap.timeline({
    scrollTrigger: { trigger: '#produkt', start: 'top 80%', end: 'center center', scrub: 0.6 },
  });
  rings.forEach((r) => {
    tlProduct.to(r.g.position, { y: 0, ease: 'none' }, 0);
  });
  tlProduct.to(group.position, { x: mb ? 1.2 : -3.4, y: mb ? 2.2 : 0.6, ease: 'none' }, 0)
           .to(group.scale, { x: 0.5, y: 0.5, z: 0.5, ease: 'none' }, 0)
           .to([coreMat, ...rings.flatMap(r => [r.mat, r.nodeMat])], { opacity: 0.5, ease: 'none' }, 0)
           .to(shadowMat, { opacity: 0.12, ease: 'none' }, 0);

  // ⑤/⑥ Person + Werdegang: dezent zentriert im Hintergrund
  const tlPerson = gsap.timeline({
    scrollTrigger: { trigger: '#person', start: 'top 80%', endTrigger: '#werdegang', end: 'center center', scrub: 0.6 },
  });
  tlPerson.to(group.position, { x: mb ? 0 : 3.2, y: mb ? 2.6 : -0.4, ease: 'none' }, 0)
          .to(group.rotation, { y: 1.4, ease: 'none' }, 0)
          .to([coreMat, ...rings.flatMap(r => [r.mat, r.nodeMat])], { opacity: 0.22, ease: 'none' }, 0)
          .to(shadowMat, { opacity: 0, ease: 'none' }, 0);

  // ⑧ Kontakt (dunkler Grund): kompakte helle Endform
  const LIGHT = [0x93c5fd, 0xa5b4fc, 0xc4b5fd, 0xbfdbfe];
  const tlContact = gsap.timeline({
    scrollTrigger: { trigger: '#kontakt', start: 'top 75%', end: 'center center', scrub: 0.6 },
  });
  rings.forEach((r, i) => {
    const c = new THREE.Color(LIGHT[i]);
    tlContact.to(r.mat.color, { r: c.r, g: c.g, b: c.b, ease: 'none' }, 0);
    tlContact.to(r.nodeMat.color, { r: c.r, g: c.g, b: c.b, ease: 'none' }, 0);
    tlContact.to(r.g.rotation, { z: i * 0.5, ease: 'none' }, 0);
  });
  const lc = new THREE.Color(0x93c5fd);
  tlContact.to(coreMat.color, { r: lc.r, g: lc.g, b: lc.b, ease: 'none' }, 0)
           .to([coreMat, ...rings.flatMap(r => [r.mat, r.nodeMat])], { opacity: 0.6, ease: 'none' }, 0)
           .to(group.position, { x: mb ? 0.8 : 2.8, y: mb ? 1.8 : 0.2, ease: 'none' }, 0)
           .to(group.scale, { x: mb ? 0.4 : 0.75, y: mb ? 0.4 : 0.75, z: mb ? 0.4 : 0.75, ease: 'none' }, 0);

  // --- Render-Loop: pausiert bei verstecktem Tab ---
  let running = true;
  document.addEventListener('visibilitychange', () => {
    running = !document.hidden;
    if (running) requestAnimationFrame(tick);
  });

  function tick() {
    if (!running) return;
    group.rotation.y += idle.speed;
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
      ScrollTrigger.refresh();
    }, 150);
  }, { passive: true });
}
