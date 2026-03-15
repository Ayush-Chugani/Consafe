
function initApp() {
  if (window.appInitialized) return;
  window.appInitialized = true;
  
  // Inline script from original HTML
  
gsap.registerPlugin(ScrollTrigger);

// ─── CUSTOM CURSOR ───────────────────────────────────────────────
const cursor = document.getElementById('cursor');
const follower = document.getElementById('cursor-follower');
document.addEventListener('mousemove', e => {
  gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.1 });
  gsap.to(follower, { x: e.clientX, y: e.clientY, duration: 0.5 });
});
document.querySelectorAll('a,button,.btn,.feature-card,.testimonial-card,.pricing-card').forEach(el => {
  el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
  el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
});

// ─── SCROLL PROGRESS BAR ─────────────────────────────────────────
ScrollTrigger.create({
  trigger: 'body',
  start: 'top top',
  end: 'bottom bottom',
  onUpdate: self => gsap.set('#progress-bar', { width: (self.progress * 100) + '%' })
});

// ─── NAV SCROLL BEHAVIOR ─────────────────────────────────────────
gsap.from('#main-nav', { y: -60, opacity: 0, duration: 0.8, ease: 'power3.out' });
ScrollTrigger.create({
  trigger: 'body',
  start: '80px top',
  onEnter: () => gsap.to('#main-nav', { backdropFilter: 'blur(20px)', backgroundColor: 'rgba(7,10,18,0.85)', borderBottom: '1px solid rgba(28,34,56,0.8)', duration: 0.4 }),
  onLeaveBack: () => gsap.to('#main-nav', { backdropFilter: 'blur(0px)', backgroundColor: 'transparent', borderBottom: 'none', duration: 0.4 })
});

// ─── HERO ENTRANCE ───────────────────────────────────────────────
const tl = gsap.timeline({ delay: 0.3 });
tl.from('.hero-badge', { y: 20, opacity: 0, duration: 0.6, ease: 'power3.out' })
  .from('.hero-h1 .line1', { y: 60, opacity: 0, duration: 0.8, ease: 'power3.out' }, '-=0.2')
  .from('.hero-h1 .line2', { y: 60, opacity: 0, duration: 0.8, ease: 'power3.out' }, '-=0.6')
  .from('.hero-h1 .line3', { y: 60, opacity: 0, duration: 0.8, ease: 'power3.out' }, '-=0.6')
  .from('.hero-sub', { y: 30, opacity: 0, duration: 0.7, ease: 'power2.out' }, '-=0.4')
  .from('.hero-ctas', { y: 24, opacity: 0, duration: 0.6, ease: 'power2.out' }, '-=0.3')
  .from('.hero-proof', { y: 16, opacity: 0, duration: 0.5, ease: 'power2.out' }, '-=0.2');

// ─── SCRAMBLE TEXT ───────────────────────────────────────────────
function scrambleText(el, finalText, duration = 800) {
  const chars = '!@#$%^&*<>?/\\|[]{}=+';
  let frame = 0;
  const totalFrames = duration / 30;
  const interval = setInterval(() => {
    el.textContent = finalText.split('').map((char, i) => {
      if (char === ' ') return ' ';
      if (i < (frame / totalFrames) * finalText.length) return char;
      return chars[Math.floor(Math.random() * chars.length)];
    }).join('');
    frame++;
    if (frame > totalFrames) { el.textContent = finalText; clearInterval(interval); }
  }, 30);
}

// ─── SECTION H2 SCROLL ANIMATIONS ───────────────────────────────
gsap.utils.toArray('.section-h2').forEach(el => {
  ScrollTrigger.create({
    trigger: el,
    start: 'top 80%',
    once: true,
    onEnter: () => {
      gsap.from(el, { y: 40, opacity: 0, duration: 0.8, ease: 'power3.out' });
      scrambleText(el.firstChild, el.firstChild.textContent || el.firstChild.nodeValue || '', 600);
    }
  });
});

gsap.utils.toArray('.section-label').forEach(el => {
  gsap.from(el, {
    scrollTrigger: { trigger: el, start: 'top 85%' },
    y: 20, opacity: 0, x: -20, duration: 0.6
  });
});

// ─── FEATURE CARDS STAGGER ───────────────────────────────────────
gsap.from('.feature-card', {
  scrollTrigger: { trigger: '.features-grid', start: 'top 85%' },
  opacity: 0, y: 60, rotationX: 15, stagger: 0.12, duration: 0.8, ease: 'power3.out'
});

// ─── CONFIDENCE COUNTER HOVER ────────────────────────────────────
const confEl = document.getElementById('conf-counter');
const firstCard = document.querySelector('.feature-card');
if (firstCard && confEl) {
  firstCard.addEventListener('mouseenter', () => {
    const obj = { val: 0.26 };
    gsap.to(obj, { val: 0.87, duration: 1.2, ease: 'power2.out', onUpdate: () => { confEl.textContent = obj.val.toFixed(2); } });
  });
  firstCard.addEventListener('mouseleave', () => {
    const obj = { val: 0.87 };
    gsap.to(obj, { val: 0.26, duration: 0.4, onUpdate: () => { confEl.textContent = obj.val.toFixed(2); } });
  });
}

// ─── STEP ANIMATIONS ─────────────────────────────────────────────
gsap.from('.step', {
  scrollTrigger: { trigger: '.steps-wrapper', start: 'top 75%' },
  opacity: 0, x: -40, stagger: 0.2, duration: 0.7, ease: 'power3.out'
});

// ─── SHOWCASE SLIDE-IN ───────────────────────────────────────────
gsap.from('#ppe-showcase .canvas-wrapper', {
  scrollTrigger: { trigger: '#ppe-showcase', start: 'top 75%' },
  x: -80, opacity: 0, duration: 0.9, ease: 'power3.out'
});
gsap.from('#ppe-showcase .showcase-text', {
  scrollTrigger: { trigger: '#ppe-showcase', start: 'top 75%' },
  x: 80, opacity: 0, duration: 0.9, ease: 'power3.out'
});
gsap.from('#ppe-showcase .showcase-feats li', {
  scrollTrigger: { trigger: '#ppe-showcase .showcase-feats', start: 'top 80%' },
  y: 20, opacity: 0, stagger: 0.1, duration: 0.5
});
gsap.from('.face-showcase .canvas-wrapper', {
  scrollTrigger: { trigger: '.face-showcase', start: 'top 75%' },
  x: 80, opacity: 0, duration: 0.9, ease: 'power3.out'
});
gsap.from('.face-showcase .showcase-text', {
  scrollTrigger: { trigger: '.face-showcase', start: 'top 75%' },
  x: -80, opacity: 0, duration: 0.9, ease: 'power3.out'
});

// ─── ANALYTICS DASHBOARD ANIMATION ──────────────────────────────
gsap.from('.browser-frame', {
  scrollTrigger: { trigger: '.browser-frame', start: 'top 80%' },
  scale: 0.85, opacity: 0, duration: 0.9, ease: 'power3.out'
});
gsap.from('.kpi-card', {
  scrollTrigger: { trigger: '.kpi-row', start: 'top 85%' },
  y: 30, opacity: 0, stagger: 0.1, duration: 0.6
});
gsap.from('.ppe-bar-fill', {
  scrollTrigger: { trigger: '.charts-row', start: 'top 85%' },
  scaleX: 0, transformOrigin: 'left', stagger: 0.1, duration: 0.8, ease: 'power2.out'
});
gsap.from('.worker-row', {
  scrollTrigger: { trigger: '.worker-table', start: 'top 85%' },
  x: -30, opacity: 0, stagger: 0.12, duration: 0.5
});

// ─── NUMBER COUNT-UP ─────────────────────────────────────────────
function animateCounter(el, end, suffix = '') {
  const obj = { val: 0 };
  gsap.to(obj, {
    val: end, duration: 2, ease: 'power2.out',
    scrollTrigger: { trigger: el, start: 'top 85%', once: true },
    onUpdate: () => { el.textContent = Math.round(obj.val) + suffix; }
  });
}
document.querySelectorAll('.kpi-num[data-count]').forEach(el => {
  const end = parseFloat(el.dataset.count);
  const suffix = el.dataset.suffix || '';
  animateCounter(el, end, suffix);
});

// ─── SECURITY PILLARS ────────────────────────────────────────────
gsap.from('.pillar', {
  scrollTrigger: { trigger: '.security-pillars', start: 'top 80%' },
  y: 40, opacity: 0, stagger: 0.12, duration: 0.7
});

// ─── TESTIMONIALS ────────────────────────────────────────────────
gsap.from('.testimonial-card', {
  scrollTrigger: { trigger: '.testimonials-grid', start: 'top 80%' },
  y: 50, opacity: 0, stagger: 0.15, duration: 0.8, ease: 'power3.out'
});

// ─── PRICING CARDS ───────────────────────────────────────────────
gsap.from('.pricing-card', {
  scrollTrigger: { trigger: '.pricing-grid', start: 'top 80%' },
  y: 40, opacity: 0, stagger: 0.12, duration: 0.7
});

// ─── CTA SECTION CHAR ANIMATION ──────────────────────────────────
ScrollTrigger.create({
  trigger: '#cta-section',
  start: 'top 75%',
  once: true,
  onEnter: () => {
    gsap.from('#cta-section .cta-inner > *', {
      y: 40, opacity: 0, stagger: 0.15, duration: 0.8, ease: 'power3.out'
    });
  }
});

// ─── MAGNETIC BUTTONS ────────────────────────────────────────────
document.querySelectorAll('.btn-magnetic').forEach(btn => {
  btn.addEventListener('mousemove', e => {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    gsap.to(btn, { x: x * 0.3, y: y * 0.3, duration: 0.3, ease: 'power2.out' });
  });
  btn.addEventListener('mouseleave', () => {
    gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.5)' });
  });
});

// ─── CTA FLOATING PARTICLES ──────────────────────────────────────
const ctaParticles = document.getElementById('cta-particles');
for (let i = 0; i < 14; i++) {
  const p = document.createElement('div');
  p.className = 'cta-particle';
  p.style.cssText = `left:${Math.random()*100}%;top:${Math.random()*100}%;animation:floatDot ${3+Math.random()*4}s ${Math.random()*3}s ease-in-out infinite;opacity:${0.1+Math.random()*0.3};`;
  ctaParticles.appendChild(p);
}

// ═══════════════════════════════════════════════════════════════
//  THREE.JS — HERO PARTICLE FIELD
// ═══════════════════════════════════════════════════════════════
window.addEventListener('load', () => {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas || window.innerWidth < 480) return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;

  const sceneGroup = new THREE.Group();
  scene.add(sceneGroup);

  const particleCount = window.innerWidth < 768 ? 80 : 200;
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount);
  const types = new Uint8Array(particleCount);
  const phases = new Float32Array(particleCount);

  const c_compliant = new THREE.Color('#00ff88');
  const c_atrisk = new THREE.Color('#f59e0b');
  const c_violation = new THREE.Color('#ff3366');

  for (let i = 0; i < particleCount; i++) {
    const r = 8;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
    phases[i] = Math.random() * Math.PI * 2;

    const rand = Math.random();
    if (rand < 0.60) {
      types[i] = 0;
      c_compliant.toArray(colors, i * 3);
      sizes[i] = 0.04;
    } else if (rand < 0.85) {
      types[i] = 1;
      c_atrisk.toArray(colors, i * 3);
      sizes[i] = 0.05;
    } else {
      types[i] = 2;
      c_violation.toArray(colors, i * 3);
      sizes[i] = 0.06;
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  const vertexShader = `
    attribute float size;
    attribute vec3 color;
    varying vec3 vColor;
    varying float vSize;
    void main() {
      vColor = color;
      vSize = size;
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      gl_PointSize = size * (400.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
    }
  `;
  const fragmentShader = `
    varying vec3 vColor;
    void main() {
      vec2 uv = gl_PointCoord - vec2(0.5);
      float d = length(uv);
      if (d > 0.5) discard;
      float alpha = (1.0 - d * 2.0);
      alpha = alpha * alpha * 0.9 + 0.1;
      gl_FragColor = vec4(vColor, alpha);
    }
  `;

  const mat = new THREE.ShaderMaterial({ vertexShader, fragmentShader, vertexColors: true, transparent: true, depthWrite: false });
  const points = new THREE.Points(geo, mat);
  sceneGroup.add(points);

  // Connection lines
  const linePairs = [];
  const maxLines = 400;
  const lineGeo = new THREE.BufferGeometry();
  const linePositions = [];
  for (let i = 0; i < particleCount && linePositions.length / 6 < maxLines; i++) {
    const ax = positions[i*3], ay = positions[i*3+1], az = positions[i*3+2];
    for (let j = i + 1; j < particleCount && linePositions.length / 6 < maxLines; j++) {
      const bx = positions[j*3], by = positions[j*3+1], bz = positions[j*3+2];
      const dist = Math.sqrt((bx-ax)**2+(by-ay)**2+(bz-az)**2);
      if (dist < 2.0) {
        linePositions.push(ax, ay, az, bx, by, bz);
      }
    }
  }
  lineGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(linePositions), 3));
  const lineMat = new THREE.LineBasicMaterial({ color: 0x00d4ff, transparent: true, opacity: 0.08 });
  const lines = new THREE.LineSegments(lineGeo, lineMat);
  sceneGroup.add(lines);

  // Mouse parallax
  document.addEventListener('mousemove', e => {
    if (document.documentElement.scrollTop > window.innerHeight) return;
    const x = (e.clientX / window.innerWidth  - 0.5) * 2;
    const y = (e.clientY / window.innerHeight - 0.5) * 2;
    gsap.to(sceneGroup.rotation, { x: -y * 0.15, y: x * 0.20, duration: 2, ease: 'power2.out' });
  });

  // Pulse rings
  const rings = [];
  function spawnRing(idx) {
    const ringGeo = new THREE.RingGeometry(0.05, 0.12, 32);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xff3366, transparent: true, opacity: 0.8, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.set(positions[idx*3], positions[idx*3+1], positions[idx*3+2]);
    ring.lookAt(camera.position);
    sceneGroup.add(ring);
    rings.push(ring);
    gsap.to(ring.scale, { x: 8, y: 8, z: 8, duration: 1.5, ease: 'power2.out', onComplete: () => {
      sceneGroup.remove(ring);
      rings.splice(rings.indexOf(ring), 1);
    }});
    gsap.to(ringMat, { opacity: 0, duration: 1.5, ease: 'power2.out' });
  }

  const violationIdxs = Array.from({length: particleCount}, (_, i) => i).filter(i => types[i] === 2);
  setInterval(() => {
    if (violationIdxs.length > 0) spawnRing(violationIdxs[Math.floor(Math.random() * violationIdxs.length)]);
  }, 3000);

  // Resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // Animation loop
  let animTime = 0;
  const posAttr = geo.attributes.position;
  const sizeAttr = geo.attributes.size;

  function animate() {
    requestAnimationFrame(animate);
    animTime += 0.016;
    sceneGroup.rotation.y += 0.0008;
    camera.position.y = Math.sin(animTime * 0.3) * 0.1;

    // Pulse violation nodes
    for (let i = 0; i < particleCount; i++) {
      if (types[i] === 2) {
        const scale = 0.8 + 0.6 * (0.5 + 0.5 * Math.sin(animTime * 2 + phases[i]));
        sizeAttr.array[i] = 0.06 * scale;
      }
    }
    sizeAttr.needsUpdate = true;
    renderer.render(scene, camera);
  }
  animate();
});

// ═══════════════════════════════════════════════════════════════
//  THREE.JS — PPE DETECTION CANVAS
// ═══════════════════════════════════════════════════════════════
(function initPPECanvas() {
  const canvasEl = document.getElementById('ppe-canvas');
  if (!canvasEl) return;
  const wrapper = canvasEl.parentElement;
  canvasEl.width = wrapper.offsetWidth;
  canvasEl.height = wrapper.offsetHeight;
  const ctx = canvasEl.getContext('2d');

  const W = canvasEl.width, H = canvasEl.height;
  const cx = W / 2, cy = H / 2;

  // Worker silhouette keypoints (normalized 0–1)
  const keypoints = [
    { name: 'head',   x: 0.5,  y: 0.15, w: 0.14, h: 0.12 },
    { name: 'torso',  x: 0.5,  y: 0.38, w: 0.28, h: 0.30 },
    { name: 'hand_l', x: 0.28, y: 0.50, w: 0.12, h: 0.10 },
    { name: 'hand_r', x: 0.72, y: 0.50, w: 0.12, h: 0.10 },
    { name: 'boot_l', x: 0.38, y: 0.82, w: 0.14, h: 0.10 },
    { name: 'boot_r', x: 0.62, y: 0.82, w: 0.14, h: 0.10 },
  ];
  const ppeBoxes = [
    { kp: 'head',   label: 'Helmet',  color: '#00d4ff', conf: 0.94 },
    { kp: 'torso',  label: 'Vest',    color: '#a855f7', conf: 0.88 },
    { kp: 'hand_l', label: 'Gloves',  color: '#00ff88', conf: 0.76 },
    { kp: 'hand_r', label: 'Gloves',  color: '#00ff88', conf: 0.82 },
    { kp: 'boot_l', label: 'Boots',   color: '#f59e0b', conf: 0.91 },
    { kp: 'boot_r', label: 'Boots',   color: '#f59e0b', conf: 0.89 },
  ];

  let scanY = 0;
  let phase = 'scanning'; // scanning, showing, clearing
  let phaseT = 0;
  let boxProgress = new Array(ppeBoxes.length).fill(0);
  let boxVisible = new Array(ppeBoxes.length).fill(false);

  function drawWorker() {
    ctx.strokeStyle = 'rgba(136,150,179,0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    // Head circle
    ctx.arc(cx, H*0.15, W*0.07, 0, Math.PI*2);
    ctx.stroke();
    // Torso
    ctx.beginPath();
    ctx.moveTo(cx, H*0.21);
    ctx.lineTo(cx, H*0.55);
    ctx.stroke();
    // Arms
    ctx.beginPath();
    ctx.moveTo(cx, H*0.28);
    ctx.lineTo(cx - W*0.18, H*0.48);
    ctx.moveTo(cx, H*0.28);
    ctx.lineTo(cx + W*0.18, H*0.48);
    ctx.stroke();
    // Legs
    ctx.beginPath();
    ctx.moveTo(cx, H*0.55);
    ctx.lineTo(cx - W*0.1, H*0.8);
    ctx.moveTo(cx, H*0.55);
    ctx.lineTo(cx + W*0.1, H*0.8);
    ctx.stroke();
  }

  function drawBox(kp, color, progress, label, conf) {
    const x = kp.x * W, y = kp.y * H, w = kp.w * W, h = kp.h * H;
    const l = x - w/2, t = y - h/2;
    const edge = Math.min(w, h) * 0.3;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = progress;
    // Corner brackets
    ctx.beginPath();
    ctx.moveTo(l, t+edge); ctx.lineTo(l, t); ctx.lineTo(l+edge, t);
    ctx.moveTo(l+w-edge, t); ctx.lineTo(l+w, t); ctx.lineTo(l+w, t+edge);
    ctx.moveTo(l+w, t+h-edge); ctx.lineTo(l+w, t+h); ctx.lineTo(l+w-edge, t+h);
    ctx.moveTo(l+edge, t+h); ctx.lineTo(l, t+h); ctx.lineTo(l, t+h-edge);
    ctx.stroke();
    // Label
    ctx.globalAlpha = progress;
    ctx.fillStyle = color;
    ctx.font = `500 10px 'DM Mono', monospace`;
    ctx.fillText(`${label} ${(conf*100).toFixed(0)}%`, l, t - 4);
    ctx.globalAlpha = 1;
  }

  function ppeTick() {
    ctx.clearRect(0, 0, W, H);

    // Background grid
    ctx.strokeStyle = 'rgba(28,34,56,0.5)';
    ctx.lineWidth = 0.5;
    for (let gx = 0; gx < W; gx += 40) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke(); }
    for (let gy = 0; gy < H; gy += 40) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke(); }

    drawWorker();
    phaseT++;

    if (phase === 'scanning') {
      scanY = (phaseT / 80) * H;
      // Scan line
      const grad = ctx.createLinearGradient(0, scanY-20, 0, scanY+4);
      grad.addColorStop(0, 'transparent');
      grad.addColorStop(1, 'rgba(0,212,255,0.8)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, scanY-20, W, 24);
      ctx.fillStyle = '#00d4ff';
      ctx.fillRect(0, scanY, W, 1.5);

      // Reveal boxes as scan passes
      ppeBoxes.forEach((box, i) => {
        const kp = keypoints.find(k => k.name === box.kp);
        if (kp && kp.y * H < scanY) {
          boxVisible[i] = true;
          boxProgress[i] = Math.min(1, boxProgress[i] + 0.06);
        }
      });
      ppeBoxes.forEach((box, i) => { if (boxVisible[i]) { const kp = keypoints.find(k => k.name === box.kp); drawBox(kp, box.color, boxProgress[i], box.label, box.conf); }});

      if (phaseT >= 80) { phase = 'showing'; phaseT = 0; }
    } else if (phase === 'showing') {
      ppeBoxes.forEach((box, i) => { if (boxVisible[i]) { const kp = keypoints.find(k => k.name === box.kp); drawBox(kp, box.color, 1, box.label, box.conf); }});
      if (phaseT >= 80) { phase = 'clearing'; phaseT = 0; }
    } else if (phase === 'clearing') {
      const fade = 1 - phaseT / 30;
      ppeBoxes.forEach((box, i) => { const kp = keypoints.find(k => k.name === box.kp); drawBox(kp, box.color, Math.max(0, fade), box.label, box.conf); });
      if (phaseT >= 30) {
        phase = 'scanning'; phaseT = 0; scanY = 0;
        boxProgress.fill(0); boxVisible.fill(false);
      }
    }

    // Corner overlay
    ctx.fillStyle = 'rgba(0,212,255,0.6)';
    ctx.font = '9px DM Mono';
    ctx.fillText('LIVE DETECTION', 12, 20);
    ctx.fillStyle = 'rgba(136,150,179,0.5)';
    ctx.fillText('FRAME 0' + (phaseT + 100), W-80, 20);

    requestAnimationFrame(ppeTick);
  }
  ppeTick();

  const obs = new IntersectionObserver(entries => {
    entries[0].isIntersecting ? null : null; // pausing handled by raf
  });
  obs.observe(canvasEl);
})();

// ═══════════════════════════════════════════════════════════════
//  THREE.JS — FACE RECOGNITION CANVAS
// ═══════════════════════════════════════════════════════════════
(function initFaceCanvas() {
  const canvasEl = document.getElementById('face-canvas');
  if (!canvasEl) return;
  const wrapper = canvasEl.parentElement;
  canvasEl.width = wrapper.offsetWidth;
  canvasEl.height = wrapper.offsetHeight;
  const ctx = canvasEl.getContext('2d');
  const W = canvasEl.width, H = canvasEl.height;

  const cols = 4, rows = 3;
  const padX = 40, padY = 40;
  const cellW = (W - padX*2) / cols;
  const cellH = (H - padY*2) / rows;

  const workers = [];
  const ids = ['W-001','W-002','W-003','W-004','W-005','W-006','W-007','W-008','W-009','W-010','W-011','W-012'];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const i = r * cols + c;
      workers.push({
        x: padX + c * cellW + cellW/2,
        y: padY + r * cellH + cellH/2,
        r: Math.min(cellW, cellH) * 0.28,
        id: ids[i] || `W-0${i+10}`,
        recognized: false,
        ringAlpha: 0,
        ringScale: 1,
        unrecognized: Math.random() < 0.2,
      });
    }
  }

  let scanY = -20;
  let animT = 0;

  function drawFace(w) {
    const alpha = w.recognized ? 1 : 0.35;
    ctx.globalAlpha = alpha;

    // Face circle
    if (w.recognized) {
      if (w.unrecognized) {
        ctx.fillStyle = 'rgba(255,51,102,0.15)';
        ctx.strokeStyle = '#ff3366';
      } else {
        ctx.fillStyle = 'rgba(0,255,136,0.12)';
        ctx.strokeStyle = '#00ff88';
      }
    } else {
      ctx.fillStyle = 'rgba(28,34,56,0.6)';
      ctx.strokeStyle = 'rgba(55,66,104,0.5)';
    }
    ctx.lineWidth = w.recognized ? 1.5 : 1;
    ctx.beginPath();
    ctx.arc(w.x, w.y - 4, w.r, 0, Math.PI*2);
    ctx.fill();
    ctx.stroke();

    // Eyes
    const eyeY = w.y - 4 - w.r * 0.1;
    const eyeX = w.r * 0.3;
    ctx.fillStyle = w.recognized ? (w.unrecognized ? '#ff3366' : '#00ff88') : 'rgba(74,85,120,0.6)';
    ctx.beginPath(); ctx.arc(w.x - eyeX, eyeY, 2.5, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(w.x + eyeX, eyeY, 2.5, 0, Math.PI*2); ctx.fill();

    // ID label
    if (w.recognized) {
      ctx.globalAlpha = 1;
      ctx.fillStyle = w.unrecognized ? '#ff3366' : '#00ff88';
      ctx.font = '9px DM Mono';
      ctx.textAlign = 'center';
      ctx.fillText(w.unrecognized ? '⚠ UNKNOWN' : w.id, w.x, w.y + w.r + 14);
    }

    // Cyan ring pulse
    if (w.ringAlpha > 0.01) {
      ctx.globalAlpha = w.ringAlpha;
      ctx.strokeStyle = w.unrecognized ? '#ff3366' : '#00d4ff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(w.x, w.y - 4, w.r * w.ringScale, 0, Math.PI*2);
      ctx.stroke();
      w.ringAlpha -= 0.02;
      w.ringScale += 0.04;
    }

    ctx.globalAlpha = 1;
    ctx.textAlign = 'left';
  }

  function faceTick() {
    ctx.clearRect(0, 0, W, H);

    // BG grid
    ctx.strokeStyle = 'rgba(28,34,56,0.4)';
    ctx.lineWidth = 0.5;
    for (let gx = 0; gx < W; gx += 48) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke(); }
    for (let gy = 0; gy < H; gy += 48) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke(); }

    animT += 0.016;
    scanY += 1.2;
    if (scanY > H + 20) {
      scanY = -20;
      workers.forEach(w => { w.recognized = false; w.ringAlpha = 0; w.ringScale = 1; });
    }

    // Check scan passing worker
    workers.forEach(w => {
      if (!w.recognized && scanY > w.y) {
        w.recognized = true;
        w.ringAlpha = 1;
        w.ringScale = 1;
      }
    });

    workers.forEach(w => drawFace(w));

    // Scan line
    const grad = ctx.createLinearGradient(0, scanY - 16, 0, scanY + 4);
    grad.addColorStop(0, 'transparent');
    grad.addColorStop(1, 'rgba(168,85,247,0.6)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, scanY - 16, W, 20);
    ctx.fillStyle = 'rgba(168,85,247,0.9)';
    ctx.fillRect(0, scanY, W, 1.5);

    // HUD
    ctx.fillStyle = 'rgba(168,85,247,0.7)';
    ctx.font = '9px DM Mono';
    ctx.fillText('FACE RECOGNITION SCAN', 12, 18);
    const recognized = workers.filter(w => w.recognized && !w.unrecognized).length;
    ctx.fillStyle = 'rgba(0,255,136,0.7)';
    ctx.fillText(`MATCHED: ${recognized}/${workers.length}`, W - 100, 18);

    requestAnimationFrame(faceTick);
  }
  faceTick();
})();

// ─── SMOOTH SCROLL FOR NAV LINKS ─────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});


}

// We rely on the page loading dependencies first.
window.addEventListener('load', () => {
    // Wait for three.js and gsap
    const checkDeps = setInterval(() => {
        if (window.THREE && window.gsap && window.ScrollTrigger) {
            clearInterval(checkDeps);
            initApp();
        }
    }, 100);
});
