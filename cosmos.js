/* ORBITA — procedural universe. No external images or dependencies. */
(() => {
  'use strict';
  const TAU = Math.PI * 2;
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const mix = (a, b, t) => a + (b - a) * t;
  function random(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  const surface = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  function rgb(hex) { const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || ''); return m ? m.slice(1).map(s => parseInt(s, 16)) : [115, 174, 220]; }
  function glowSprite(color = '255,190,120') {
    const c = surface(128, 128), x = c.getContext('2d');
    const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, `rgba(${color},0.95)`); g.addColorStop(.08, `rgba(${color},0.7)`); g.addColorStop(.24, `rgba(${color},0.18)`); g.addColorStop(1, `rgba(${color},0)`);
    x.fillStyle = g; x.fillRect(0, 0, 128, 128); return c;
  }
  function blackHoleArt() {
    const c = surface(1600, 1100), x = c.getContext('2d'), r = random(1827);
    x.translate(800, 550);
    x.scale(1, 1);
    // The accretion flow is baked once; its fine grains remain inexpensive to animate.
    x.save(); x.scale(1, .32);
    const atmosphere = x.createRadialGradient(0, 0, 70, 0, 0, 770);
    atmosphere.addColorStop(0, 'rgba(255,136,57,.12)'); atmosphere.addColorStop(.25, 'rgba(255,133,47,.2)'); atmosphere.addColorStop(.55, 'rgba(221,80,19,.065)'); atmosphere.addColorStop(1, 'rgba(116,38,14,0)');
    x.fillStyle = atmosphere; x.fillRect(-800, -800, 1600, 1600); x.restore();
    x.globalCompositeOperation = 'screen';
    for (let i = 0; i < 250; i++) {
      const rad = 166 + i * 2.05;
      const a = Math.pow(1 - i / 250, 2) * .25;
      x.beginPath(); x.ellipse(0, 0, rad, rad * .255, 0, 0, TAU);
      x.strokeStyle = `rgba(255,${Math.round(153 + 88 * (1 - i / 250))},${Math.round(65 + 110 * (1 - i / 250))},${a})`;
      x.lineWidth = 1.8 + r() * 2; x.stroke();
    }
    for (let i = 0; i < 17000; i++) {
      const rad = 167 + Math.pow(r(), 1.65) * 530, angle = r() * TAU;
      const px = Math.cos(angle) * rad, py = Math.sin(angle) * rad * .255 + (r() - .5) * (6 + rad * .022);
      const alpha = (1 - (rad - 167) / 600) * (.07 + r() * .5);
      x.fillStyle = `rgba(255,${Math.round(137 + r() * 100)},${Math.round(54 + r() * 125)},${alpha})`;
      x.fillRect(px, py, .8 + r() * 2.8, .4 + r() * .9);
    }
    // Light bent around the event horizon forms the tall rear image of the disk.
    for (let i = 48; i >= 0; i--) {
      const rad = 158 + i * .9;
      x.beginPath(); x.ellipse(0, -2, rad * 1.02, rad, 0, Math.PI, TAU);
      x.strokeStyle = `rgba(255,${190 + Math.round((1 - i / 48) * 55)},${105 + Math.round((1 - i / 48) * 119)},${.014 + Math.pow(1 - i / 49, 5) * .32})`;
      x.lineWidth = 2 + i * .07; x.stroke();
    }
    const halo = x.createRadialGradient(0, 0, 137, 0, 0, 228);
    halo.addColorStop(0, 'rgba(255,231,178,0)'); halo.addColorStop(.23, 'rgba(255,179,89,.26)'); halo.addColorStop(.46, 'rgba(249,116,41,.08)'); halo.addColorStop(1, 'rgba(160,48,13,0)');
    x.fillStyle = halo; x.beginPath(); x.arc(0, 0, 228, 0, TAU); x.fill();
    x.globalCompositeOperation = 'source-over';
    // An opaque shadow is essential: background stars never show through the hole.
    x.fillStyle = '#010205'; x.beginPath(); x.arc(0, 0, 153, 0, TAU); x.fill();
    x.globalCompositeOperation = 'screen';
    for (let i = 18; i >= 0; i--) {
      x.beginPath(); x.arc(0, 0, 155.5 + i * .24, 0, TAU);
      x.lineWidth = 1 + i * .65;
      x.strokeStyle = `rgba(255,${217 - i * 3},${167 - i * 4},${i === 0 ? .98 : .018})`; x.stroke();
    }
    // Near-side arc: the disk wraps around the lower edge of the silhouette.
    for (let i = 0; i < 125; i++) {
      const rad = 163 + i * 3.9;
      x.beginPath(); x.ellipse(0, 7, rad, rad * .255, 0, 0, Math.PI);
      x.lineWidth = 1 + r() * 2;
      x.strokeStyle = `rgba(255,${Math.round(213 - i * .52)},${Math.round(133 - i * .65)},${.22 * Math.pow(1 - i / 125, 1.6)})`; x.stroke();
    }
    // A Doppler-brightened edge makes the asymmetry feel alive.
    const hot = x.createRadialGradient(-168, 12, 0, -168, 12, 100);
    hot.addColorStop(0, 'rgba(255,240,204,.6)'); hot.addColorStop(.13, 'rgba(255,197,120,.3)'); hot.addColorStop(1, 'rgba(255,116,38,0)');
    x.save(); x.scale(1, .38); x.fillStyle = hot; x.fillRect(-280, -100, 260, 240); x.restore();
    return c;
  }
  function nebulaArt() {
    const c = surface(1100, 800), x = c.getContext('2d'), r = random(83149);
    const sprites = ['119,62,237', '64,103,196', '216,89,155', '76,162,209'].map(glowSprite);
    x.globalCompositeOperation = 'screen';
    for (let i = 0; i < 520; i++) {
      const t = r() * TAU * 1.32, reach = 90 + r() * 360;
      const px = 590 + Math.cos(t) * reach * .95 + (r() - .5) * 120;
      const py = 390 + Math.sin(t * 1.3) * reach * .65 + (r() - .5) * 110;
      const size = 110 + r() * 290;
      x.globalAlpha = .012 + r() * .047;
      x.drawImage(sprites[Math.floor(r() * sprites.length)], px - size / 2, py - size / 2, size, size);
    }
    x.globalCompositeOperation = 'destination-out';
    const dark = glowSprite('255,255,255');
    for (let i = 0; i < 100; i++) {
      const t = i / 100, px = 150 + t * 760, py = 410 + Math.sin(t * 8) * 105;
      const size = 90 + r() * 130; x.globalAlpha = .085;
      x.drawImage(dark, px - size / 2, py - size / 2, size, size);
    }
    x.globalAlpha = 1; return c;
  }
  function planetArt(color, rings, seed) {
    const c = surface(200, 200), x = c.getContext('2d'), r = random(seed), col = rgb(color), radius = 47;
    x.translate(100, 100);
    if (rings) { x.save(); x.rotate(-.37); x.beginPath(); x.ellipse(0, 0, 83, 25, 0, Math.PI, TAU); x.strokeStyle = `rgba(${col.join(',')},.53)`; x.lineWidth = 13; x.stroke(); x.restore(); }
    const g = x.createRadialGradient(-18, -19, 2, 6, 8, 61);
    g.addColorStop(0, `rgb(${col.map(v => Math.min(255, v + 65)).join(',')})`); g.addColorStop(.42, color); g.addColorStop(.8, `rgb(${col.map(v => Math.round(v * .3)).join(',')})`); g.addColorStop(1, '#060912');
    x.fillStyle = g; x.beginPath(); x.arc(0, 0, radius, 0, TAU); x.fill();
    x.save(); x.beginPath(); x.arc(0, 0, radius - .5, 0, TAU); x.clip();
    for (let i = 0; i < 45; i++) {
      x.beginPath(); x.ellipse((r() - .5) * 55, (r() - .5) * 95, 3 + r() * 45, 1 + r() * 4, -.28, 0, TAU);
      x.fillStyle = r() > .5 ? `rgba(255,255,255,${.02 + r() * .09})` : `rgba(0,10,30,${.04 + r() * .12})`; x.fill();
    }
    const shade = x.createLinearGradient(-40, -20, 40, 25); shade.addColorStop(0, 'rgba(0,0,0,0)'); shade.addColorStop(.5, 'rgba(0,0,0,0)'); shade.addColorStop(1, 'rgba(0,2,12,.7)'); x.fillStyle = shade; x.fillRect(-50, -50, 100, 100); x.restore();
    x.beginPath(); x.arc(0, 0, radius + .5, 0, TAU); x.strokeStyle = `rgba(${col.join(',')},.3)`; x.lineWidth = 1.5; x.stroke();
    if (rings) { x.save(); x.rotate(-.37); for (let i = 0; i < 9; i++) { x.beginPath(); x.ellipse(0, 0, 73 + i * 1.8, 21 + i * .6, 0, 0, Math.PI); x.strokeStyle = `rgba(${col.join(',')},${.2 + r() * .35})`; x.lineWidth = 1.2; x.stroke(); } x.restore(); }
    return c;
  }
  class CosmosRenderer {
    constructor(canvas, options = {}) {
      this.canvas = canvas; this.ctx = canvas.getContext('2d', { alpha: false });
      if (!this.ctx) throw new Error('Canvas 2D is unavailable');
      this.onObjectClick = options.onObjectClick;
      this.scene = 'horizon'; this.previousScene = null; this.transition = 1;
      this.speed = 1; this.paused = false; this.reduced = false; this.time = 0; this.last = 0; this.dead = false;
      this.pointer = { x: 0, y: 0 }; this.smoothPointer = { x: 0, y: 0 }; this.drag = null; this.rotation = 0; this.hitTargets = [];
      this.blackHole = blackHoleArt(); this.nebula = nebulaArt();
      this.goldGlow = glowSprite('255,181,88'); this.blueGlow = glowSprite('167,204,255'); this.purpleGlow = glowSprite('185,136,255');
      const r = random(39815);
      this.stars = Array.from({ length: 730 }, () => ({ x: r(), y: r(), z: .15 + r() * .85, size: .25 + Math.pow(r(), 5) * 1.7, phase: r() * TAU, hue: r() }));
      this.warpStars = Array.from({ length: 200 }, () => ({ angle: r() * TAU, distance: .08 + r() * 1.2, length: .04 + r() * .18 }));
      this.planets = [];
      const defaults = [
        ['Элиос', '#df9a72', .75, false, 'Тёплый каменный мир. Его медные равнины освещают сразу две луны.'],
        ['Таласса', '#6eb9cc', 1.05, false, 'Океаническая планета. Под синими облаками может скрываться целый мир.'],
        ['Аурелия', '#c9a47d', 1.32, true, 'Газовый гигант с кольцами из миллиардов ледяных частиц.'],
        ['Никс', '#a18ade', .85, false, 'Тихий ледяной мир на окраине системы. Один год здесь длится десятилетия.']
      ];
      defaults.forEach(([name, color, size, rings, description], i) => this._addPlanet({ name, color, size, rings, description, phase: [.8, 3.65, 2.35, 5.65][i] }));
      this._resize = this.resize.bind(this); this._move = this.pointerMove.bind(this); this._down = this.pointerDown.bind(this); this._up = this.pointerUp.bind(this);
      this._leave = () => { if (!this.drag) this.pointer = { x: 0, y: 0 }; };
      canvas.addEventListener('pointermove', this._move); canvas.addEventListener('pointerdown', this._down); canvas.addEventListener('pointerup', this._up); canvas.addEventListener('pointercancel', this._up); canvas.addEventListener('pointerleave', this._leave);
      this.resizeObserver = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(this._resize) : null;
      if (this.resizeObserver) this.resizeObserver.observe(canvas); window.addEventListener('resize', this._resize);
      this.resize(); this.frame = this.frame.bind(this); this.raf = requestAnimationFrame(this.frame);
    }
    resize() {
      const rect = this.canvas.getBoundingClientRect(); this.w = Math.max(1, rect.width || window.innerWidth); this.h = Math.max(1, rect.height || window.innerHeight);
      this.dpr = Math.min(window.devicePixelRatio || 1, 2); this.canvas.width = Math.round(this.w * this.dpr); this.canvas.height = Math.round(this.h * this.dpr);
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    }
    setScene(scene) { if (!['horizon', 'nebula', 'system'].includes(scene) || scene === this.scene) return; this.previousScene = this.scene; this.scene = scene; this.transition = this.reduced ? 1 : 0; this.hitTargets = []; }
    setSpeed(speed) { this.speed = clamp(Number(speed) || 0, 0, 3); }
    setPaused(paused) { this.paused = Boolean(paused); }
    setReducedMotion(reduced) { this.reduced = Boolean(reduced); }
    getPlanetCount() { return this.planets.length; }
    _addPlanet(p) {
      const i = this.planets.length;
      const planet = { name: String(p.name || `Новый мир ${i + 1}`).slice(0, 40), color: /^#[0-9a-f]{6}$/i.test(p.color || '') ? p.color : '#8ca5dd', size: clamp(Number(p.size) || 1, .5, 2), rings: Boolean(p.rings), phase: Number.isFinite(p.phase) ? p.phase : i * 2.399, description: p.description || 'Ты создал этот мир. У каждой новой планеты — своя орбита и своя история.', id: i };
      planet.sprite = planetArt(planet.color, planet.rings, 1028 + i * 813); this.planets.push(planet); return { name: planet.name, description: planet.description };
    }
    createPlanet(config = {}) { return this._addPlanet(config); }
    warp() {
      if (this.warpResolve) this.warpResolve(); this.warpStart = performance.now();
      return new Promise(resolve => { this.warpResolve = resolve; });
    }
    pointerDown(e) { if (e.button && e.button !== 0) return; this.drag = { x: e.clientX, y: e.clientY, rotation: this.rotation }; try { this.canvas.setPointerCapture(e.pointerId); } catch (_) {} }
    pointerMove(e) {
      const rect = this.canvas.getBoundingClientRect(); this.pointer = { x: ((e.clientX - rect.left) / this.w - .5) * 2, y: ((e.clientY - rect.top) / this.h - .5) * 2 };
      if (this.drag) this.rotation = clamp(this.drag.rotation + (e.clientX - this.drag.x) / this.w * .6, -.6, .6);
      if (this.scene === 'system') { const px = e.clientX - rect.left, py = e.clientY - rect.top; this.canvas.style.cursor = this.hitTargets.some(p => Math.hypot(px - p.x, py - p.y) < p.r) ? 'pointer' : 'grab'; }
    }
    pointerUp(e) {
      if (!this.drag) return; const distance = Math.hypot(e.clientX - this.drag.x, e.clientY - this.drag.y); this.drag = null;
      if (distance > 8 || e.type === 'pointercancel' || this.scene !== 'system') return;
      const rect = this.canvas.getBoundingClientRect(), px = e.clientX - rect.left, py = e.clientY - rect.top;
      const planet = [...this.hitTargets].reverse().find(p => Math.hypot(px - p.x, py - p.y) <= p.r);
      if (planet && this.onObjectClick) this.onObjectClick({ name: planet.name, description: planet.description });
    }
    frame(now) {
      if (this.dead) return;
      const dt = Math.min(.05, (now - (this.last || now)) / 1000); this.last = now;
      if (!this.paused && !this.reduced) this.time += dt * this.speed;
      this.transition = Math.min(1, this.transition + dt * 1.25);
      const smoothing = 1 - Math.exp(-dt * 4);
      this.smoothPointer.x = mix(this.smoothPointer.x, this.reduced ? 0 : this.pointer.x, smoothing); this.smoothPointer.y = mix(this.smoothPointer.y, this.reduced ? 0 : this.pointer.y, smoothing);
      this.draw(now); this.raf = requestAnimationFrame(this.frame);
    }
    center() { return { x: this.w <= 760 ? this.w * .5 : this.w * .68, y: this.w <= 760 ? this.h * .68 : this.h * .46 }; }
    draw(now) {
      const x = this.ctx; x.setTransform(this.dpr, 0, 0, this.dpr, 0, 0); x.globalAlpha = 1; x.globalCompositeOperation = 'source-over';
      x.fillStyle = '#03050a'; x.fillRect(0, 0, this.w, this.h);
      this.drawStars();
      if (this.previousScene && this.transition < 1) this.drawScene(this.previousScene, 1 - this.transition);
      this.drawScene(this.scene, this.transition);
      if (this.warpResolve) {
        const progress = (now - this.warpStart) / (this.reduced ? 450 : 2150);
        this.drawWarp(clamp(progress, 0, 1));
        if (progress >= 1) { const resolve = this.warpResolve; this.warpResolve = null; resolve(); }
      }
      // Keep the edges quiet and the center of the composition luminous.
      x.globalAlpha = 1; x.globalCompositeOperation = 'source-over';
      const vignette = x.createRadialGradient(this.w * .6, this.h * .45, this.h * .15, this.w * .55, this.h * .5, Math.max(this.w, this.h) * .69);
      vignette.addColorStop(0, 'rgba(1,3,9,0)'); vignette.addColorStop(1, 'rgba(1,3,9,.68)'); x.fillStyle = vignette; x.fillRect(0, 0, this.w, this.h);
    }
    drawStars() {
      const x = this.ctx, p = this.smoothPointer;
      for (const star of this.stars) {
        const sx = ((star.x * this.w + p.x * star.z * 15 + this.time * star.z * .4) % this.w + this.w) % this.w;
        const sy = star.y * this.h + p.y * star.z * 12;
        const alpha = (.25 + star.z * .55) * (.82 + Math.sin(this.time * .5 + star.phase) * .18);
        x.fillStyle = star.hue > .82 ? `rgba(236,191,145,${alpha})` : `rgba(186,205,231,${alpha})`;
        x.beginPath(); x.arc(sx, sy, star.size, 0, TAU); x.fill();
        if (star.size > 1.4) { x.globalAlpha = alpha * .4; x.drawImage(this.blueGlow, sx - 10, sy - 10, 20, 20); x.globalAlpha = 1; }
      }
    }
    drawScene(scene, alpha) { if (alpha <= 0) return; this.ctx.save(); this.ctx.globalAlpha = alpha; if (scene === 'horizon') this.drawHorizon(); else if (scene === 'nebula') this.drawNebula(); else this.drawSystem(); this.ctx.restore(); }
    drawHorizon() {
      const x = this.ctx, c = this.center(), radius = Math.min(this.w * (this.w <= 760 ? .18 : .16), this.h * .19);
      const scale = radius / 156, p = this.smoothPointer;
      x.translate(c.x + p.x * 11, c.y + p.y * 7); x.rotate(-.19 + this.rotation + p.x * .025);
      x.drawImage(this.blackHole, -800 * scale, -550 * scale, 1600 * scale, 1100 * scale);
      x.globalCompositeOperation = 'screen';
      // A thin drifting hot spot follows the photon ring.
      const a = this.time * .09 + 3.5;
      x.globalAlpha *= .3 + Math.sin(this.time * .7) * .04;
      const spot = radius * .45; x.drawImage(this.goldGlow, Math.cos(a) * radius - spot / 2, Math.sin(a) * radius - spot / 2, spot, spot);
    }
    drawNebula() {
      const x = this.ctx, c = this.center(), p = this.smoothPointer;
      const scale = Math.max(this.w / 1000, this.h / 750) * 1.25;
      x.save(); x.translate(c.x + p.x * 20, c.y + p.y * 13); x.rotate(Math.sin(this.time * .018) * .04 + this.rotation * .2);
      x.globalCompositeOperation = 'screen'; x.drawImage(this.nebula, -550 * scale, -400 * scale, 1100 * scale, 800 * scale);
      x.globalAlpha *= .55; x.drawImage(this.nebula, -580 * scale + Math.sin(this.time * .06) * 15, -430 * scale, 1150 * scale, 860 * scale); x.restore();
      x.globalCompositeOperation = 'screen';
      for (let i = 0; i < 32; i++) {
        const a = i * 2.39996, r = Math.sqrt(i / 32) * Math.min(this.w * .34, this.h * .36), px = c.x + Math.cos(a) * r, py = c.y + Math.sin(a) * r * .72;
        const size = 8 + (i % 5) * 4, pulse = .35 + .2 * Math.sin(this.time * .6 + i);
        x.save(); x.globalAlpha *= pulse; x.drawImage(i % 3 ? this.blueGlow : this.purpleGlow, px - size, py - size, size * 2, size * 2); x.restore();
      }
    }
    drawSystem() {
      const x = this.ctx, c = this.center(), base = Math.min(this.w <= 760 ? this.w * .46 : this.w * .29, this.h * .58), p = this.smoothPointer;
      c.x += p.x * 9; c.y += p.y * 6;
      const rotation = -.24 + this.rotation * .4, cr = Math.cos(rotation), sr = Math.sin(rotation), project = (px, py) => ({ x: c.x + px * cr - py * sr, y: c.y + px * sr + py * cr });
      this.hitTargets = [];
      const positions = this.planets.map((planet, i) => {
        const orbit = base * (.29 + i / Math.max(4, this.planets.length) * .78), angle = planet.phase + this.time * .16 / Math.pow(1 + i, 1.25);
        x.save(); x.translate(c.x, c.y); x.rotate(rotation); x.beginPath(); x.ellipse(0, 0, orbit, orbit * .58, 0, 0, TAU); x.strokeStyle = 'rgba(134,151,185,.16)'; x.lineWidth = 1; x.stroke(); x.restore();
        return { planet, ...project(Math.cos(angle) * orbit, Math.sin(angle) * orbit * .58), depth: Math.sin(angle), size: clamp(base * .038, 8, 16) * planet.size };
      });
      const paintPlanet = pos => {
        const { planet, x: px, y: py, size } = pos;
        x.drawImage(planet.sprite, px - size * 2.13, py - size * 2.13, size * 4.26, size * 4.26);
        this.hitTargets.push({ ...planet, x: px, y: py, r: Math.max(21, size * (planet.rings ? 1.8 : 1.2)) });
        if (this.w > 640) { x.font = '10px system-ui, sans-serif'; x.fillStyle = 'rgba(188,200,222,.65)'; x.textAlign = 'center'; x.fillText(planet.name, px, py + size + 20); }
      };
      positions.filter(pos => pos.depth < 0).sort((a,b) => a.y-b.y).forEach(paintPlanet);
      const sun = clamp(base * .079, 18, 35);
      x.save(); x.globalCompositeOperation = 'screen'; x.drawImage(this.goldGlow, c.x - sun * 5, c.y - sun * 5, sun * 10, sun * 10); x.restore();
      const g = x.createRadialGradient(c.x - sun * .3, c.y - sun * .3, 0, c.x, c.y, sun); g.addColorStop(0, '#fff9db'); g.addColorStop(.45, '#ffe8a6'); g.addColorStop(.82, '#ffc263'); g.addColorStop(1, '#f78b37'); x.fillStyle = g; x.beginPath(); x.arc(c.x, c.y, sun, 0, TAU); x.fill();
      this.hitTargets.push({ x: c.x, y: c.y, r: sun * 1.2, name: 'Солярис', description: 'Сердце вашей системы. Эта звезда согревает каждый созданный вами мир.' });
      positions.filter(pos => pos.depth >= 0).sort((a,b) => a.y-b.y).forEach(paintPlanet);
    }
    drawWarp(progress) {
      const x = this.ctx, c = this.center(), strength = Math.pow(Math.sin(progress * Math.PI), 1.2);
      if (this.reduced) { x.fillStyle = `rgba(122,151,227,${strength * .14})`; x.fillRect(0, 0, this.w, this.h); return; }
      x.save(); x.globalCompositeOperation = 'screen';
      for (const s of this.warpStars) {
        const travel = (s.distance + progress * 1.8) % 1.3, d = (travel * travel + .01) * Math.max(this.w, this.h), length = strength * s.length * d;
        const ca = Math.cos(s.angle), sa = Math.sin(s.angle); x.beginPath(); x.moveTo(c.x + ca * d, c.y + sa * d); x.lineTo(c.x + ca * (d + length), c.y + sa * (d + length));
        x.strokeStyle = `rgba(176,209,255,${strength * clamp(travel, .1, .85)})`; x.lineWidth = .6 + travel * 1.8; x.stroke();
      }
      x.globalAlpha = strength * .22; x.drawImage(this.blueGlow, c.x - this.w * .55, c.y - this.w * .55, this.w * 1.1, this.w * 1.1); x.restore();
    }
    destroy() {
      this.dead = true; cancelAnimationFrame(this.raf); if (this.resizeObserver) this.resizeObserver.disconnect(); window.removeEventListener('resize', this._resize);
      this.canvas.removeEventListener('pointermove', this._move); this.canvas.removeEventListener('pointerdown', this._down); this.canvas.removeEventListener('pointerup', this._up); this.canvas.removeEventListener('pointercancel', this._up); this.canvas.removeEventListener('pointerleave', this._leave);
      if (this.warpResolve) { this.warpResolve(); this.warpResolve = null; }
    }
  }
  window.CosmosRenderer = CosmosRenderer;
})();
