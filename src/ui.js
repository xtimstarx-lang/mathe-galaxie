'use strict';
/* =====================================================================
   MATHE-GALAXIE – Spiel-Engine & Oberfläche
   ===================================================================== */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const app = $('#app');
const KEY = 'mathe-galaxie-v1';
const DEF = { name: '', xp: 0, cr: 0, crEarned: 0, stars: {}, boss: {}, finalWon: false, stats: {}, lvl: {}, owned: ['ship0', 'hat0'], ship: 'ship0', hat: 'hat0', sound: true, teacher: false, badges: {}, daily: null, games: 0, seen: {} };
const clone = o => JSON.parse(JSON.stringify(o));
let S = load();
function load() { try { const raw = localStorage.getItem(KEY); if (raw) return Object.assign(clone(DEF), JSON.parse(raw)); } catch (e) { /* Speicher blockiert */ } return clone(DEF); }
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* ---------- Texte ---------- */
const PRAISE = ['Galaktisch gut!', 'Volltreffer!', 'Genial!', 'Raketenstark!', 'Perfekt gelandet!', 'Du bist ein Mathe-Komet!', 'Sternenklar richtig!', 'Supernova!'];
const OOPS = ['Knapp daneben!', 'Fast! Schau dir den Lösungsweg an.', 'Kein Problem – daraus lernt man am meisten.', 'Hoppla! Gleich nochmal probieren.', 'Ups, Kurs leicht abgewichen!'];
const PIPI_OK = ['Juhu! 🎉', 'Das war spitze!', 'Meine Antennen glühen vor Freude!', 'Wow, du rechnest schneller als Lichtgeschwindigkeit!', 'Weiter so, Pilot!'];
const PIPI_NO = ['Nicht schlimm! Lies dir den Lösungsweg durch. 👀', 'Fehler sind Treibstoff fürs Gehirn!', 'Auch Raketen brauchen manchmal zwei Anläufe.', 'Schau mal genau auf die Vorzeichen und Einheiten.'];
const JOKES = [
  'Was sagt die Null zur Acht? <b>„Schicker Gürtel!“</b>',
  'Treffen sich zwei Parallelen … <b>nie.</b> 😄',
  'Warum ist der Kreis so entspannt? <b>Er hat keine Ecken und Kanten.</b>',
  'Warum war das Mathebuch traurig? <b>Es hatte zu viele Probleme.</b>',
  'Wie nennt man einen Piraten, der gut rechnen kann? <b>π-rat!</b>',
  'Warum hat die Gerade so wenige Freunde? <b>Sie ist immer so geradlinig.</b>',
  'Was macht eine Wurzel in der Freizeit? <b>Sie hängt im Quadrat herum.</b>',
  'Warum hat der Ausreißer keinen Platz im Bus? <b>Er sitzt immer ganz am Rand.</b>'
];
const SHIPS = [
  { id: 'ship0', name: 'Sternflitzer', price: 0, c: ['#eef0ff', '#ff5a5f', '#58d6ff'] },
  { id: 'ship1', name: 'Goldkomet', price: 40, c: ['#ffd34d', '#ff8a00', '#ffffff'] },
  { id: 'ship2', name: 'Neon-Blitz', price: 70, c: ['#ff4fa3', '#7b3cff', '#b9f5ff'] },
  { id: 'ship3', name: 'Alien-Gleiter', price: 100, c: ['#7dffb2', '#008f6b', '#fffb8a'] },
  { id: 'ship4', name: 'Mitternachts-Jet', price: 150, c: ['#2f347a', '#ffd23f', '#ff4fa3'] }
];
const HATS = [
  { id: 'hat0', name: 'Ohne Hut', price: 0 }, { id: 'hat2', name: 'Partyhut', price: 30 }, { id: 'hat3', name: 'Propellerkappe', price: 45 },
  { id: 'hat1', name: 'Krone', price: 60 }, { id: 'hat4', name: 'Zylinder', price: 80 }, { id: 'hat5', name: 'Raumhelm', price: 120 }
];
const BADGES = [
  { id: 'first', i: '🚀', n: 'Erster Start', d: 'Ein Spiel beendet' },
  { id: 'perfect', i: '💎', n: 'Fehlerfrei', d: 'Ein Spiel ohne einen Fehler' },
  { id: 'combo5', i: '🔥', n: 'Feuerschweif', d: '5 richtige Antworten hintereinander' },
  { id: 'combo10', i: '☄️', n: 'Supernova', d: '10 richtige Antworten hintereinander' },
  { id: 'kommandant', i: '🎖️', n: 'Kommandant', d: '3 Sterne auf der Stufe Kommandant' },
  { id: 'speed', i: '⚡', n: 'Blitzrechner', d: '12 richtige im Zeitrennen' },
  { id: 'boss1', i: '🛡️', n: 'Bossbezwinger', d: 'Den ersten Boss besiegt' },
  { id: 'wurzel', i: '🌱', n: 'Wurzel-Meister', d: 'Boss im Zahlen-Nebel besiegt' },
  { id: 'pyth', i: '📐', n: 'Pythagoras-Profi', d: 'Boss auf Pythagoria besiegt' },
  { id: 'kreis', i: '👑', n: 'Kreis-König', d: 'Boss im Kreis-Karussell besiegt' },
  { id: 'daily', i: '📅', n: 'Pflichtbewusst', d: 'Eine Tagesmission erfüllt' },
  { id: 'rich', i: '💰', n: 'Kristall-Sammler', d: '200 Kristalle verdient' },
  { id: 'stars50', i: '🌟', n: 'Sternensammler', d: '50 Sterne gesammelt' },
  { id: 'galaxy', i: '🏆', n: 'Galaxie-Retter', d: 'NULL-Bot endgültig besiegt' }
];
const LVL = [{ n: 'Kadett', d: 'leicht' }, { n: 'Pilot', d: 'mittel' }, { n: 'Kommandant', d: 'schwer' }];

/* ---------- Grafiken ---------- */
function hatSvg(h) {
  switch (h) {
    case 'hat1': return '<polygon points="31,30 34,12 42,22 50,6 58,22 66,12 69,30" fill="#ffd23f" stroke="#b8890c" stroke-width="2"/><circle cx="50" cy="20" r="3" fill="#ff4fa3"/>';
    case 'hat2': return '<polygon points="38,30 50,-4 62,30" fill="#ff4fa3"/><circle cx="50" cy="-5" r="5" fill="#ffd23f"/><circle cx="46" cy="16" r="2.5" fill="#fff"/><circle cx="54" cy="24" r="2.5" fill="#fff"/>';
    case 'hat3': return '<path d="M30 30 A20 15 0 0 1 70 30 Z" fill="#7b3cff"/><path d="M28 30 H80" stroke="#7b3cff" stroke-width="4" stroke-linecap="round"/><line x1="50" y1="15" x2="50" y2="6" stroke="#fff" stroke-width="2"/><ellipse cx="41" cy="5" rx="10" ry="3" fill="#ffd23f"/><ellipse cx="59" cy="5" rx="10" ry="3" fill="#ff4fa3"/>';
    case 'hat4': return '<rect x="36" y="0" width="28" height="26" rx="2" fill="#1b1c33"/><rect x="28" y="24" width="44" height="7" rx="3" fill="#1b1c33"/><rect x="36" y="18" width="28" height="5" fill="#ff4fa3"/>';
    case 'hat5': return '<circle cx="50" cy="60" r="47" fill="#b9f5ff" fill-opacity=".14" stroke="#dff" stroke-width="3"/><path d="M22 40 A35 35 0 0 1 44 20" stroke="#fff" stroke-width="4" stroke-linecap="round" fill="none" opacity=".6"/>';
    default: return '';
  }
}
function pipiSvg(mood = '', hat = S.hat) {
  const mouth = mood === 'sad' ? '<path d="M40 86 Q50 78 60 86" class="pp-mouth"/>' : mood === 'wow' ? '<ellipse cx="50" cy="82" rx="6" ry="7" fill="#0b3a33"/>' : '<path d="M38 77 Q50 90 62 77" class="pp-mouth"/>';
  return `<svg viewBox="0 -8 100 118" class="pipi ${mood}" aria-hidden="true"><g class="pp-body">
    <line x1="38" y1="30" x2="28" y2="10" class="pp-ant"/><circle cx="28" cy="9" r="5.5" class="pp-ball"/>
    <line x1="62" y1="30" x2="72" y2="10" class="pp-ant"/><circle cx="72" cy="9" r="5.5" class="pp-ball"/>
    <path d="M18 66 Q6 60 10 48" class="pp-arm"/><path d="M82 66 Q94 60 90 48" class="pp-arm"/>
    <ellipse cx="50" cy="62" rx="35" ry="38" class="pp-skin"/><ellipse cx="50" cy="83" rx="21" ry="12" class="pp-belly"/>
    <circle cx="50" cy="52" r="16" class="pp-eye"/><circle cx="53" cy="53" r="8" class="pp-pupil"/><circle cx="56" cy="49" r="3" fill="#fff"/>
    ${mouth}${hatSvg(hat)}</g></svg>`;
}
function shipSvg(id = S.ship) {
  const sh = SHIPS.find(s => s.id === id) || SHIPS[0];
  const [b, f, w] = sh.c;
  return `<svg viewBox="0 0 60 60" aria-hidden="true"><path d="M30 3 C42 14 44 32 40 46 H20 C16 32 18 14 30 3 Z" fill="${b}" stroke="#0a0c24" stroke-width="2"/>
    <path d="M20 34 L9 50 L20 46 Z M40 34 L51 50 L40 46 Z" fill="${f}" stroke="#0a0c24" stroke-width="2"/><circle cx="30" cy="24" r="6.5" fill="${w}" stroke="#0a0c24" stroke-width="2"/>
    <path d="M23 47 L30 58 L37 47 Z" fill="#ffb23f"/><path d="M26 47 L30 54 L34 47 Z" fill="#fff3a0"/></svg>`;
}
function botSvg(mood = '') {
  return `<svg viewBox="0 0 100 100" class="bot ${mood}" aria-hidden="true"><line x1="50" y1="14" x2="50" y2="4" stroke="#ff6b5b" stroke-width="4"/><circle cx="50" cy="4" r="5" fill="#ff6b5b"/>
    <rect x="16" y="14" width="68" height="58" rx="14" fill="#3b3f5c" stroke="#ff6b5b" stroke-width="3"/><rect x="26" y="26" width="48" height="24" rx="8" fill="#0a0c24"/>
    <circle cx="40" cy="38" r="6" fill="#ff6b5b"/><circle cx="60" cy="38" r="6" fill="#ff6b5b"/><text x="50" y="66" text-anchor="middle" font-family="Bungee, Impact, sans-serif" font-size="12" fill="#ffd23f">0</text>
    <rect x="28" y="72" width="44" height="20" rx="6" fill="#2b2e45" stroke="#ff6b5b" stroke-width="2"/><rect x="6" y="34" width="10" height="26" rx="4" fill="#3b3f5c"/><rect x="84" y="34" width="10" height="26" rx="4" fill="#3b3f5c"/></svg>`;
}

/* ---------- Sound ---------- */
const Snd = {
  ctx: null,
  init() { if (this.ctx) return; try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { this.ctx = null; } },
  tone(f, d, type = 'sine', vol = .13, delay = 0) {
    if (!S.sound || !this.ctx) return;
    try {
      const t = this.ctx.currentTime + delay, o = this.ctx.createOscillator(), g = this.ctx.createGain();
      o.type = type; o.frequency.setValueAtTime(f, t); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.001, t + d);
      o.connect(g); g.connect(this.ctx.destination); o.start(t); o.stop(t + d + .03);
    } catch (e) { /* ignorieren */ }
  },
  ok() { this.tone(660, .12, 'triangle'); this.tone(990, .2, 'triangle', .13, .1); },
  bad() { this.tone(220, .22, 'sawtooth', .06); this.tone(160, .3, 'sawtooth', .06, .12); },
  click() { this.tone(520, .05, 'square', .04); },
  combo(n) { this.tone(700 + n * 60, .12, 'square', .06); this.tone(1000 + n * 60, .14, 'square', .06, .08); },
  win() { [523, 659, 784, 1047, 1319].forEach((f, i) => this.tone(f, .3, 'triangle', .13, i * .12)); },
  lose() { [392, 330, 262].forEach((f, i) => this.tone(f, .35, 'triangle', .1, i * .18)); },
  hit() { this.tone(140, .15, 'square', .08); this.tone(90, .25, 'sawtooth', .07, .05); }
};
document.addEventListener('pointerdown', () => Snd.init(), { once: true });
document.addEventListener('keydown', () => Snd.init(), { once: true });

/* ---------- Effekte ---------- */
const reduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
const fx = $('#fx'), fxc = fx.getContext('2d');
let parts = [], fxRun = false;
function confetti(n = 60, x = innerWidth / 2, y = innerHeight * .45) {
  if (reduced) return;
  fx.width = innerWidth; fx.height = innerHeight;
  const cols = ['#ffd23f', '#ff4fa3', '#3de8c7', '#8b7bff', '#ffffff'];
  for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, v = 4 + Math.random() * 7; parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 4, s: 4 + Math.random() * 5, c: cols[i % cols.length], r: Math.random() * 6, life: 70 + Math.random() * 40 }); }
  if (!fxRun) { fxRun = true; requestAnimationFrame(fxLoop); }
}
function fxLoop() {
  fxc.clearRect(0, 0, fx.width, fx.height);
  parts = parts.filter(p => p.life > 0);
  for (const p of parts) { p.x += p.vx; p.y += p.vy; p.vy += .25; p.vx *= .99; p.r += .2; p.life--; fxc.save(); fxc.translate(p.x, p.y); fxc.rotate(p.r); fxc.globalAlpha = Math.min(1, p.life / 30); fxc.fillStyle = p.c; fxc.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); fxc.restore(); }
  if (parts.length) requestAnimationFrame(fxLoop); else { fxRun = false; fxc.clearRect(0, 0, fx.width, fx.height); }
}
function drawStars() {
  const c = $('#stars'), x = c.getContext('2d'), w = c.width = innerWidth, h = c.height = innerHeight;
  const g = x.createRadialGradient(w * .8, h * .1, 0, w * .8, h * .1, Math.max(w, h) * .8);
  g.addColorStop(0, '#1d1650'); g.addColorStop(1, '#090b22'); x.fillStyle = g; x.fillRect(0, 0, w, h);
  const g2 = x.createRadialGradient(w * .1, h * .9, 0, w * .1, h * .9, Math.max(w, h) * .6);
  g2.addColorStop(0, 'rgba(255,79,163,.16)'); g2.addColorStop(1, 'rgba(255,79,163,0)'); x.fillStyle = g2; x.fillRect(0, 0, w, h);
  const n = Math.round(w * h / 2600);
  for (let i = 0; i < n; i++) { const r = Math.random(); x.fillStyle = `rgba(255,255,255,${.25 + Math.random() * .7})`; x.beginPath(); x.arc(Math.random() * w, Math.random() * h, r < .92 ? Math.random() * 1.1 + .2 : 1.6, 0, 7); x.fill(); }
}
let toastT = null;
function toast(html, icon = '✨') {
  const t = $('#toast'); t.innerHTML = `<span class="ti">${icon}</span><span>${html}</span>`; t.hidden = false;
  clearTimeout(toastT); toastT = setTimeout(() => { t.hidden = true; }, 3200);
}
function modal(html, buttons) {
  const m = $('#modal');
  m.innerHTML = `<div class="modal-in" role="dialog" aria-modal="true">${html}<div class="modal-actions">${buttons.map((b, i) => `<button class="btn ${b.cls || ''}" data-i="${i}">${b.label}</button>`).join('')}</div></div>`;
  m.hidden = false;
  $$('.modal-actions button', m).forEach(btn => btn.onclick = () => { const b = buttons[+btn.dataset.i]; if (!b.keep) m.hidden = true; b.fn && b.fn(); });
  const f = $('input', m) || $('.modal-actions button', m); f && f.focus();
}

/* ---------- Fortschritt ---------- */
function levelOf(xp) { const level = Math.floor(Math.sqrt(xp / 60)) + 1, a = 60 * (level - 1) ** 2, b = 60 * level ** 2; return { level, prog: (xp - a) / (b - a) }; }
function updateTop() {
  const lv = levelOf(S.xp);
  $('#lvNum').textContent = 'Lv ' + lv.level; $('#xpFill').style.width = Math.round(lv.prog * 100) + '%';
  $('#crNum').textContent = S.cr; $('#sndBtn').textContent = S.sound ? '🔊' : '🔇';
  $('#sndBtn').setAttribute('aria-label', S.sound ? 'Ton ausschalten' : 'Ton einschalten');
}
const gkey = (p, g) => `${p.id}.${g.id}`;
const planetStars = p => p.games.reduce((s, g) => s + (S.stars[gkey(p, g)] || 0), 0);
const totalStars = () => PLANETS.reduce((s, p) => s + planetStars(p), 0);
const MAIN = PLANETS.slice(0, 10);
function unlocked(i) {
  if (S.teacher || i === 0) return true;
  const p = PLANETS[i];
  if (p.id === 'bonus') return Object.keys(S.boss).length >= 2;
  const prev = PLANETS[i - 1];
  return !!S.boss[prev.id] || planetStars(prev) >= 6;
}
const finalUnlocked = () => S.teacher || MAIN.every(p => S.boss[p.id]);
function addCr(n) { S.cr += n; S.crEarned += n; if (S.crEarned >= 200) award('rich'); }
function award(id) {
  if (S.badges[id]) return;
  S.badges[id] = Date.now(); save();
  const b = BADGES.find(x => x.id === id);
  if (b) { toast(`Abzeichen freigeschaltet: <b>${b.n}</b>`, b.i); Snd.combo(4); }
}
function today() { const d = new Date(); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; }
function daily() {
  const t = today();
  if (!S.daily || S.daily.date !== t) {
    const open = PLANETS.map((p, i) => i).filter(i => unlocked(i));
    let h = 0; for (const ch of t) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    S.daily = { date: t, pid: PLANETS[open[h % open.length]].id, count: 0, done: false }; save();
  }
  return S.daily;
}
function stat(pid, ok) { const s = S.stats[pid] || (S.stats[pid] = { c: 0, w: 0 }); ok ? s.c++ : s.w++; }

/* =====================================================================
   STERNENKARTE
   ===================================================================== */
const MAPX = [24, 70, 34, 76, 24, 68, 30, 74, 34, 70, 22, 54];
function showMap() {
  stopGame();
  const d = daily(), dp = PLANETS.find(p => p.id === d.pid);
  const gap = 156, top = 64, nodes = PLANETS.length + 1, H = top + nodes * gap - 40;
  let cur = 0; PLANETS.forEach((p, i) => { if (unlocked(i) && i < 10) cur = i; });
  const pts = Array.from({ length: nodes }, (_, i) => [MAPX[i], top + i * gap + 46]);
  const path = pts.map((p, i) => (i ? 'L' : 'M') + p[0] + ' ' + p[1]).join(' ');
  const planetBtn = (p, i) => {
    const lk = !unlocked(i), st = planetStars(p), mx = p.games.length * 3, fixed = !!S.boss[p.id];
    const sat = fixed ? 1.15 : .35 + .6 * (st / mx);
    return `<button class="pl ${lk ? 'locked' : ''} ${fixed ? 'fixed' : ''}" data-i="${i}" style="left:${MAPX[i]}%;top:${top + i * gap}px;--h:${p.hue}">
      <span class="orb ${p.ring ? 'ringed' : ''} ${p.moon ? 'moon' : ''}" style="--sat:${sat.toFixed(2)}"></span>${fixed ? '<span class="crown" aria-hidden="true">👑</span>' : ''}
      <span class="pl-name">${p.name}</span><span class="pl-sub">${lk ? '🔒 gesperrt' : `★ ${st}/${mx}${fixed ? ' · repariert' : ''}`}</span></button>`;
  };
  const fl = finalUnlocked();
  const nm = S.name ? esc(S.name) : 'Pilot';
  app.innerHTML = `<div class="screen">
    <div class="hero"><button class="pp-big" id="ppJoke" aria-label="Pi-Pi erzählt einen Witz">${pipiSvg()}</button>
      <div><h1><span>Mission Genial</span>Mathe-Galaxie</h1><p>Hallo ${nm}! Der fiese Roboter <b>NULL-Bot</b> hat die Galaxie durcheinandergebracht und alle Zahlen gestohlen. Repariere Planet für Planet – ich, Pi-Pi, helfe dir!</p></div></div>
    <div class="joke"><div></div><div class="bubble" id="jokeB">${R.pick(JOKES)}</div></div>
    <div class="cards-row">
      <div class="panel mission ${d.done ? 'done' : ''}"><div class="mi-ico">${d.done ? '✓' : '📅'}</div><div class="mi-txt"><div class="eyebrow">Tagesmission</div>
        <b>${d.done ? 'Erledigt! +25 Kristalle' : `Löse 10 Aufgaben auf ${dp.name}`}</b><div class="mi-bar"><i style="width:${Math.min(100, d.count * 10)}%"></i></div></div></div>
      <div class="panel mission"><div class="mi-ico">🌟</div><div class="mi-txt"><div class="eyebrow">Fortschritt</div><b>${totalStars()} Sterne · ${Object.keys(S.boss).length} von 11 Bossen besiegt</b>
        <div class="mi-bar"><i style="width:${Math.round(Object.keys(S.boss).length / 11 * 100)}%;background:var(--nova)"></i></div></div></div>
    </div>
    <div class="map" style="height:${H}px"><svg class="path" viewBox="0 0 100 ${H}" preserveAspectRatio="none"><path d="${path}" vector-effect="non-scaling-stroke"/></svg>
      ${PLANETS.map(planetBtn).join('')}
      <button class="pl final ${fl ? '' : 'locked'}" data-final="1" style="left:${MAPX[nodes - 1]}%;top:${top + (nodes - 1) * gap}px;--h:0"><span class="orb">${botSvg()}</span>
        <span class="pl-name">NULL-Bots Station</span><span class="pl-sub">${S.finalWon ? '🏆 besiegt' : fl ? 'Endkampf!' : '🔒 alle 10 Bosse nötig'}</span></button>
      <div class="ship" style="left:calc(${MAPX[cur]}% ${MAPX[cur] > 50 ? '-' : '+'} 62px);top:${top + cur * gap + 24}px">${shipSvg()}</div>
    </div></div>`;
  $('#ppJoke').onclick = () => { $('#jokeB').innerHTML = R.pick(JOKES); Snd.click(); };
  $$('.pl[data-i]').forEach(b => b.onclick = () => {
    const i = +b.dataset.i;
    if (!unlocked(i)) { const p = PLANETS[i]; toast(p.id === 'bonus' ? 'Der Rätsel-Mond öffnet sich, sobald du 2 Bosse besiegt hast.' : `Besiege zuerst den Boss von <b>${PLANETS[i - 1].name}</b> oder sammle dort 6 Sterne.`, '🔒'); return; }
    Snd.click(); showPlanet(i);
  });
  $('.pl[data-final]').onclick = () => {
    if (!finalUnlocked()) { toast('Besiege zuerst die Bosse aller 10 Planeten!', '🔒'); return; }
    modal(`<div class="pw">${botSvg()}</div><h2>Endkampf</h2><p>NULL-Bot wartet mit 15 gemischten Aufgaben aus der ganzen Galaxie. Du hast 5 Leben. Bereit?</p>`,
      [{ label: 'Noch nicht', cls: 'sec' }, { label: 'Kampf starten!', cls: 'pink', fn: () => startGame(-1, -1, 'final') }]);
  };
  window.scrollTo(0, 0);
}

/* =====================================================================
   PLANET
   ===================================================================== */
const INTRO = {
  p1: 'Hier startet deine Reise! Wärm dich mit Vorzeichen, Potenzen und Prozenten auf.',
  p2: 'Im Nebel schwirren Zahlen durcheinander: natürliche, ganze, rationale und irrationale. Bring Ordnung hinein!',
  p3: 'Alle Dreiecke hier sind rechtwinklig – und NULL-Bot hat die Hypotenusen versteckt.',
  p4: 'In der Schmiede werden Terme geschmolzen, ausmultipliziert und herausgehoben. Vorsicht, heiß!',
  p5: 'Die Waagen sind aus dem Gleichgewicht! Löse Gleichungen, damit alles wieder stimmt.',
  p6: 'Pizza, Donuts und Umlaufbahnen – hier dreht sich alles um den Kreis.',
  p7: 'Zylinder, Kegel und Kugeln: Berechne Volumen und Oberflächen für die Fabriken.',
  p8: 'Laser, Graphen und Steigungen. Triff die Asteroiden mit der richtigen Funktion!',
  p9: 'Zwei Sonnen, zwei Gleichungen. Finde Lösungen, die beide erfüllen.',
  p10: 'Die Daten-Station spinnt: Finde Mittelwerte, Mediane und entlarve schummelnde Diagramme.',
  bonus: 'Auf dem Rätsel-Mond trainierst du dein räumliches und logisches Denken.'
};
function showPlanet(i) {
  stopGame();
  const p = PLANETS[i], lvl = S.lvl[p.id] || 1, st = planetStars(p), mx = p.games.length * 3, beaten = !!S.boss[p.id];
  app.innerHTML = `<div class="screen" style="--h:${p.hue}">
    <button class="back" id="back">← Sternenkarte</button>
    <div class="ph"><span class="orb ${p.ring ? 'ringed' : ''} ${p.moon ? 'moon' : ''}" style="--sat:${beaten ? 1.15 : .4 + .6 * st / mx}"></span>
      <div><div class="eyebrow">${p.id === 'bonus' ? 'Bonus-Mond' : 'Planet ' + (i + 1)}</div><h1>${p.name}</h1><p>${p.topic}</p><div class="prog"><i style="width:${Math.round(st / mx * 100)}%"></i></div><div class="sm" style="margin-top:4px">★ ${st} von ${mx} Sternen</div></div></div>
    <div class="pl-intro"><div class="pw">${pipiSvg()}</div><div class="bubble">${INTRO[p.id]}</div></div>
    <div class="diff" role="radiogroup" aria-label="Schwierigkeit">${LVL.map((l, k) => `<button role="radio" aria-checked="${lvl === k + 1}" data-l="${k + 1}">${l.n}<small>${l.d}</small></button>`).join('')}</div>
    <div class="games">${p.games.map((g, gi) => { const s = S.stars[gkey(p, g)] || 0; return `<button class="gcard" data-g="${gi}"><span class="gi">${g.icon}</span><span><h3>${g.name}</h3><p>${g.desc}</p><span class="stars" aria-label="${s} von 3 Sternen">${'★'.repeat(s)}<span class="off">${'★'.repeat(3 - s)}</span></span></span></button>`; }).join('')}</div>
    <div class="bosscard ${beaten ? 'beaten' : ''}">${botSvg()}<div><div class="eyebrow">${beaten ? 'Besiegt' : 'Boss-Kampf'}</div><h3>${p.boss}</h3>
      <p>${beaten ? 'Der Planet ist repariert. Du kannst trotzdem nochmal kämpfen und Kristalle sammeln.' : '8 gemischte Aufgaben, 3 Leben. Besiege den Boss, um den Planeten zu reparieren!'}</p><button class="btn pink" id="bossBtn">Kampf starten</button></div></div>
  </div>`;
  $('#back').onclick = showMap;
  $$('.diff button').forEach(b => b.onclick = () => { S.lvl[p.id] = +b.dataset.l; save(); $$('.diff button').forEach(x => x.setAttribute('aria-checked', x === b)); Snd.click(); });
  $$('.gcard').forEach(b => b.onclick = () => { Snd.click(); startGame(i, +b.dataset.g, 'play'); });
  $('#bossBtn').onclick = () => { Snd.click(); startGame(i, -1, 'boss'); };
  window.scrollTo(0, 0);
}

/* =====================================================================
   SPIEL-ABLAUF
   ===================================================================== */
let G = null;
function stopGame() { if (G && G.timer) clearInterval(G.timer); if (G && G.autoT) clearTimeout(G.autoT); G = null; $('#fb').hidden = true; }
function startGame(pi, gi, mode) {
  stopGame();
  const planet = pi >= 0 ? PLANETS[pi] : null, game = gi >= 0 ? planet.games[gi] : null;
  const lvl = mode === 'final' ? 2 : (S.lvl[planet.id] || 1);
  G = { mode, pi, gi, planet, game, lvl, round: 0, results: [], mistakes: 0, correct: 0, streak: 0, best: 0, jokers: 3, ctxs: {}, xpGain: 0, locked: false };
  if (mode === 'play') {
    if (game.kind === 'word') { G.word = R.pick(WORDS); G.total = G.word.length; }
    else if (game.kind === 'timed') { G.total = Infinity; G.timeLeft = 60; }
    else G.total = game.rounds || 6;
  } else if (mode === 'boss') { G.total = 99; G.bossMax = G.bossHP = 8; G.hearts = G.maxHearts = 3; }
  else { G.total = 99; G.bossMax = G.bossHP = 15; G.hearts = G.maxHearts = 5; }
  renderShell();
  if (G.mode === 'play' && game.kind === 'timed') {
    G.timer = setInterval(() => { if (!G) return; G.timeLeft--; renderStatus(); if (G.timeLeft <= 0) { clearInterval(G.timer); G.timer = null; finish(); } }, 1000);
  }
  nextTask();
}
function title() {
  if (G.mode === 'final') return ['Endkampf', 'NULL-Bot'];
  if (G.mode === 'boss') return [G.planet.name + ' · Boss', G.planet.boss];
  return [G.planet.name + ' · ' + LVL[G.lvl - 1].n, G.game.name];
}
function renderShell() {
  const [eb, nm] = title();
  app.innerHTML = `<div class="screen">
    <div class="g-top"><button class="iconbtn" id="quit" aria-label="Spiel verlassen">✕</button><div><div class="eyebrow">${eb}</div><div class="g-name">${nm}</div></div><div class="combo" id="combo" hidden></div></div>
    <div class="g-status" id="gstatus"></div>
    <div class="g-pipi"><div class="pw" id="gpipi">${pipiSvg()}</div><div class="bubble" id="gbub">Los geht's! Du schaffst das. 🚀</div></div>
    <div class="task" id="task"></div>
    <div class="jokers"><span class="jk-n" id="jkN"></span><button class="jk" id="jkTip">💡 Tipp</button><button class="jk" id="jkStep">🪜 Schritt</button><button class="jk" id="jk50">✂️ 50:50</button></div>
  </div>`;
  $('#quit').onclick = () => {
    if (G.mode === 'play' && G.round === 0 && !G.results.length) { const pi = G.pi; stopGame(); pi >= 0 ? showPlanet(pi) : showMap(); return; }
    modal(`<div class="pw">${pipiSvg('sad')}</div><h2>Spiel verlassen?</h2><p>Dein Fortschritt in dieser Runde geht verloren.</p>`,
      [{ label: 'Weiterspielen', cls: 'sec' }, { label: 'Verlassen', cls: 'pink', fn: () => { const pi = G ? G.pi : -1; stopGame(); pi >= 0 ? showPlanet(pi) : showMap(); } }]);
  };
  $('#jkTip').onclick = () => useJoker('tip');
  $('#jkStep').onclick = () => useJoker('step');
  $('#jk50').onclick = () => useJoker('fifty');
  renderStatus();
}
function say(html, mood = '') {
  const b = $('#gbub'); if (!b) return;
  b.innerHTML = html;
  $('#gpipi').innerHTML = pipiSvg(mood);
}
function renderStatus() {
  const el = $('#gstatus'); if (!el || !G) return;
  if (G.mode === 'boss' || G.mode === 'final') {
    el.innerHTML = `<div class="bossrow"><div id="gbot">${botSvg()}</div><div><div class="hp-l">${G.mode === 'final' ? 'NULL-Bot' : esc(G.planet.boss)} · ${G.bossHP}/${G.bossMax}</div><div class="hp"><i style="width:${G.bossHP / G.bossMax * 100}%"></i></div></div>
      <div class="hearts" aria-label="${G.hearts} Leben">${Array.from({ length: G.maxHearts }, (_, k) => `<span class="${k < G.hearts ? '' : 'lost'}">❤️</span>`).join('')}</div></div>`;
  } else if (G.game.kind === 'timed') {
    el.innerHTML = `<div class="timer-row"><span>⏱️ ${Math.max(0, G.timeLeft)} s</span><span>✓ ${G.correct} richtig</span></div><div class="timer"><i style="width:${Math.max(0, G.timeLeft) / 60 * 100}%"></i></div>`;
  } else if (G.game.kind === 'word') {
    el.innerHTML = `<div class="word" aria-label="Lösungswort">${G.word.split('').map((ch, k) => k < G.results.length ? `<span class="${G.results[k] ? 'ok' : 'no'}">${ch}</span>` : '<span></span>').join('')}</div>`;
  } else {
    el.innerHTML = `<div class="pbar" aria-label="Runde ${Math.min(G.round + 1, G.total)} von ${G.total}">${Array.from({ length: G.total }, (_, k) => `<span class="${k < G.results.length ? (G.results[k] ? 'ok' : 'no') : k === G.round ? 'cur' : ''}"></span>`).join('')}</div>`;
  }
  $('#jkN').textContent = `Joker: ${G.jokers}`;
}
function pickTaskSource() {
  if (G.mode === 'play') return { p: G.planet, g: G.game };
  const pool = G.mode === 'boss' ? [G.planet] : PLANETS;
  const p = R.pick(pool), games = p.games.filter(g => !g.noBoss);
  return { p, g: R.pick(games) };
}
function nextTask() {
  if (!G) return;
  if (G.mode === 'play' && G.round >= G.total) return finish();
  G.locked = false; G.jk = {};
  const src = pickTaskSource();
  const k = gkey(src.p, src.g), ctx = G.ctxs[k] || (G.ctxs[k] = { used: new Set() });
  const seen = S.seen[k + G.lvl] || (S.seen[k + G.lvl] = []);
  let t = null, sig = '', bestAge = Infinity;
  for (let tries = 0; tries < 30; tries++) {
    let c;
    try { c = src.g.gen(G.lvl, ctx); } catch (e) { console.error(e); c = genSigned(G.lvl); }
    const s = sigOf(c), age = seen.indexOf(s);
    if (age < 0) { t = c; sig = s; break; }
    if (age < bestAge) { bestAge = age; t = c; sig = s; }
  }
  const old = seen.indexOf(sig); if (old >= 0) seen.splice(old, 1);
  seen.push(sig); if (seen.length > 80) seen.splice(0, seen.length - 80);
  t.src = src;
  G.task = t;
  renderTask(t);
  renderStatus();
  updateJokers();
  if (G.mode !== 'play' && G.round > 0) say(`Aufgabe aus <b>${src.p.name}</b> · ${src.g.name}`);
}
function sigOf(t) {
  const parts = [t.type, t.q, t.statement, t.key, t.label,
    t.fields && t.fields.map(f => f.answer).join('|'), t.options && t.options[t.correct || 0],
    t.left && t.left.slice().sort().join('|'), t.lines && t.lines.join('|'), t.items && t.items.map(i => i.html).sort().join('|'),
    t.pairs && t.pairs.map(p => p[0]).sort().join('|'), t.state && JSON.stringify(t.state), t.points && JSON.stringify(t.points),
    t.x != null ? t.x + ',' + t.y : null, (t.type === 'tapsvg' || t.type === 'tapgrid') ? t.visual : (t.visual || '').replace(/<svg[\s\S]*?<\/svg>/g, '')];
  const s = parts.filter(v => v != null && v !== false).join('#');
  let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}
function updateJokers() {
  const t = G.task, used = G.jk;
  $('#jkTip').disabled = !G.jokers || used.tip;
  $('#jkStep').disabled = !G.jokers || used.step || !t.step;
  $('#jk50').disabled = !G.jokers || used.fifty || !G.fifty;
  $('#jkN').textContent = `Joker: ${G.jokers}`;
}
function useJoker(kind) {
  if (!G || G.locked || !G.jokers || G.jk[kind]) return;
  const t = G.task;
  if (kind === 'tip') say('💡 ' + (t.hint || 'Lies die Aufgabe nochmal ganz genau.'), 'wow');
  if (kind === 'step') { if (!t.step) return; say('🪜 Erster Schritt: ' + t.step, 'wow'); }
  if (kind === 'fifty') { if (!G.fifty) return; G.fifty(); say('✂️ Zwei falsche Antworten sind weg!', 'wow'); }
  G.jk[kind] = true; G.jokers--; Snd.click(); updateJokers();
}

function renderTask(t) {
  const card = $('#task');
  card.classList.remove('shake'); void card.offsetWidth;
  card.style.animation = 'none'; void card.offsetWidth; card.style.animation = '';
  G.fifty = null; G.redraw = null;
  const showVis = t.visual && t.type !== 'tf';
  card.innerHTML = `${t.type === 'tf' ? '<div class="q">Wahr oder falsch?</div>' : `<div class="q">${t.q || ''}</div>`}${showVis ? `<div class="visual">${t.visual}</div>` : ''}<div class="body"></div>`;
  const body = $('.body', card);
  (RENDER[t.type] || RENDER.choice)(t, body, card);
}

/* Antwort auswerten */
function answer(ok, opt = {}) {
  if (!G || G.locked) return;
  G.locked = true;
  const t = G.task, pid = t.src.p.id;
  stat(pid, ok);
  const d = daily();
  if (ok && !d.done && d.pid === pid) { d.count++; if (d.count >= 10) { d.done = true; addCr(25); award('daily'); toast('Tagesmission erfüllt! +25 Kristalle', '📅'); } }
  G.results.push(ok);
  let xp = 0;
  if (ok) {
    G.correct++; G.streak++; G.best = Math.max(G.best, G.streak);
    const mult = G.streak >= 6 ? 3 : G.streak >= 3 ? 2 : 1;
    xp = 10 * G.lvl * mult; S.xp += xp; G.xpGain += xp;
    Snd.ok(); if (mult > 1) Snd.combo(mult);
    confetti(G.streak >= 3 ? 70 : 36);
    say(R.pick(PIPI_OK), 'happy');
    const c = $('#combo'); if (mult > 1) { c.hidden = false; c.textContent = `🔥 ×${mult}`; c.style.animation = 'none'; void c.offsetWidth; c.style.animation = ''; } else c.hidden = true;
    if (G.streak >= 5) award('combo5'); if (G.streak >= 10) award('combo10');
    if (G.mode !== 'play') { G.bossHP--; Snd.hit(); setTimeout(() => { const b = $('#gbot .bot'); b && b.classList.add('hit'); }, 30); }
  } else {
    G.mistakes++; G.streak = 0; $('#combo').hidden = true;
    Snd.bad(); const card = $('#task'); card.classList.remove('shake'); void card.offsetWidth; card.classList.add('shake');
    say(R.pick(PIPI_NO), 'sad');
    if (G.mode !== 'play') G.hearts--;
  }
  save(); updateTop(); renderStatus();
  const explain = opt.explain || t.explain || '';
  if (G.mode === 'play' && G.game.kind === 'timed') {
    if (!ok) say(`Richtig wäre: <b>${t.fields ? t.fields.map(f => fmt(f.answer)).join(', ') : ''}</b>`, 'sad');
    setTimeout(() => { if (G && G.timeLeft > 0) { G.round++; nextTask(); } }, ok ? 450 : 1600);
    return;
  }
  const done = G.mode === 'play' ? G.round + 1 >= G.total : (G.bossHP <= 0 || G.hearts <= 0);
  showFeedback(ok, explain, xp, done);
}
function showFeedback(ok, explain, xp, done) {
  const fb = $('#fb');
  fb.innerHTML = `<div class="fb-in ${ok ? 'ok' : 'no'}" role="status"><div><div class="fb-h">${ok ? R.pick(PRAISE) : R.pick(OOPS)}</div>${ok ? `<span class="xp">+${xp} XP</span>` : ''}</div>
    <div class="fb-actions">${ok && explain ? '<button class="linkbtn" id="fbWhy">Lösungsweg</button>' : ''}<button class="btn ${ok ? 'good' : ''}" id="fbNext">${done ? 'Ergebnis' : 'Weiter'} →</button></div>
    <div class="fb-x" id="fbX" ${ok ? 'hidden' : ''}>${explain || ''}</div></div>`;
  fb.hidden = false;
  const go = () => { if (!G) return; clearTimeout(G.autoT); fb.hidden = true; G.round++; done ? finish() : nextTask(); };
  $('#fbNext').onclick = go;
  $('#fbNext').focus({ preventScroll: true });
  const why = $('#fbWhy');
  if (why) why.onclick = () => { clearTimeout(G.autoT); $('#fbX').hidden = false; why.remove(); };
  if (ok && !done) G.autoT = setTimeout(go, 2200);
}

/* Ende einer Runde */
function finish() {
  if (!G) return;
  const g = G; stopGame(); $('#fb').hidden = true;
  S.games++;
  award('first');
  let stars = 0, crGain = 0, head = '', sub = '', won = true, mood = 'happy';
  if (g.mode === 'play') {
    if (g.game.kind === 'timed') { stars = g.correct >= 10 ? 3 : g.correct >= 6 ? 2 : g.correct >= 1 ? 1 : 0; if (g.correct >= 12) award('speed'); }
    else stars = g.mistakes === 0 ? 3 : g.mistakes <= Math.max(1, Math.round(g.total * .25)) ? 2 : 1;
    if (g.mistakes === 0 && g.game.kind !== 'timed') award('perfect');
    if (stars === 3 && g.lvl === 3) award('kommandant');
    const k = gkey(g.planet, g.game), before = S.stars[k] || 0;
    if (stars > before) S.stars[k] = stars;
    crGain = stars * 3 * g.lvl + (g.mistakes === 0 && g.game.kind !== 'timed' ? 5 : 0);
    head = stars === 3 ? 'Galaktisch!' : stars === 2 ? 'Stark gemacht!' : stars === 1 ? 'Geschafft!' : 'Zeit ist um!';
    sub = g.game.kind === 'word' ? `Das Lösungswort war <b>${g.word}</b>.` : g.game.kind === 'timed' ? `Du hast ${g.correct} Aufgaben in 60 Sekunden gelöst.` : stars < 3 ? 'Spiel es nochmal für 3 Sterne!' : 'Keine Fehler – perfekt!';
  } else {
    won = g.bossHP <= 0;
    if (won) {
      if (g.mode === 'boss') {
        const first = !S.boss[g.planet.id]; S.boss[g.planet.id] = Date.now();
        crGain = (first ? 30 : 10) * g.lvl;
        award('boss1');
        if (g.planet.id === 'p2') award('wurzel'); if (g.planet.id === 'p3') award('pyth'); if (g.planet.id === 'p6') award('kreis');
        head = 'Boss besiegt!'; sub = first ? `<b>${g.planet.name}</b> ist repariert und leuchtet wieder! ${nextUnlockText(g.pi)}` : 'Du hast den Boss erneut besiegt.';
      } else { S.finalWon = true; crGain = 200; award('galaxy'); head = 'Galaxie gerettet!'; sub = 'NULL-Bot ist besiegt. Alle Zahlen sind wieder da!'; }
    } else { head = 'Der Boss war diesmal stärker'; sub = 'Kein Problem! Übe die Mini-Spiele und versuch es nochmal.'; mood = 'sad'; }
  }
  addCr(crGain);
  if (totalStars() >= 50) award('stars50');
  save(); updateTop();
  if (won) { Snd.win(); confetti(140); setTimeout(() => confetti(100, innerWidth * .25, innerHeight * .35), 350); setTimeout(() => confetti(100, innerWidth * .75, innerHeight * .35), 650); } else Snd.lose();
  if (g.mode === 'final' && won) return showCertificate();
  const starHtml = g.mode === 'play' ? `<div class="bigstars" aria-label="${stars} von 3 Sternen">${[0, 1, 2].map(k => `<span class="${k < stars ? '' : 'off'}" style="animation-delay:${.2 + k * .25}s">⭐</span>`).join('')}</div>` : '';
  app.innerHTML = `<div class="screen"><div class="panel result"><div class="pw">${g.mode === 'play' || won ? pipiSvg(mood) : botSvg()}</div><h2>${head}</h2>${starHtml}<p>${sub}</p>
    <div class="rstats"><div><b>${g.correct}</b><span>richtig</span></div><div><b>${g.mistakes}</b><span>Fehler</span></div><div><b>+${g.xpGain}</b><span>XP</span></div><div><b>+${crGain}</b><span>Kristalle</span></div><div><b>${g.best}</b><span>beste Serie</span></div></div>
    <div class="ractions"><button class="btn sec" id="rBack">${g.pi >= 0 ? 'Zum Planeten' : 'Sternenkarte'}</button><button class="btn" id="rAgain">Nochmal</button>${g.mode === 'play' && g.gi + 1 < g.planet.games.length ? '<button class="btn pink" id="rNext">Nächstes Spiel</button>' : ''}${g.mode === 'boss' && won ? '<button class="btn pink" id="rMap">Sternenkarte</button>' : ''}</div></div></div>`;
  $('#rBack').onclick = () => g.pi >= 0 ? showPlanet(g.pi) : showMap();
  $('#rAgain').onclick = () => startGame(g.pi, g.gi, g.mode);
  const n = $('#rNext'); if (n) n.onclick = () => startGame(g.pi, g.gi + 1, 'play');
  const m = $('#rMap'); if (m) m.onclick = showMap;
  window.scrollTo(0, 0);
}
function nextUnlockText(pi) { const n = PLANETS[pi + 1]; return n && n.id !== 'bonus' ? `Neuer Planet freigeschaltet: <b>${n.name}</b>.` : ''; }

/* =====================================================================
   AUFGABEN-RENDERER
   ===================================================================== */
const RENDER = {};
function onActivate(el, fn) { el.addEventListener('click', fn); }

RENDER.choice = (t, body) => {
  const order = t.fixed ? t.options.map((_, i) => i) : R.shuffle(t.options.map((_, i) => i));
  body.innerHTML = `<div class="opts ${t.wide ? 'wide' : ''}">${order.map(i => `<button class="opt" data-i="${i}">${t.options[i]}</button>`).join('')}</div>`;
  const btns = $$('.opt', body);
  btns.forEach(b => onActivate(b, () => {
    if (G.locked) return;
    const i = +b.dataset.i, ok = i === t.correct;
    b.classList.add(ok ? 'right' : 'wrong');
    if (!ok) $(`.opt[data-i="${t.correct}"]`, body).classList.add('right');
    btns.forEach(x => x.disabled = true);
    answer(ok);
  }));
  if (t.options.length >= 3) G.fifty = () => { const w = btns.filter(b => +b.dataset.i !== t.correct && !b.disabled); R.sample(w, Math.min(2, w.length - (t.options.length > 3 ? 0 : 1))).forEach(b => { b.disabled = true; b.classList.add('gone'); }); };
};

RENDER.steps = (t, body) => {
  body.innerHTML = `<div class="steps">${t.lines.map((l, i) => i === 0 ? `<div class="line">${l}</div>` : `<button class="line" data-i="${i}">${l}</button>`).join('')}</div>`;
  const btns = $$('button.line', body);
  btns.forEach(b => onActivate(b, () => {
    if (G.locked) return;
    const i = +b.dataset.i, ok = i === t.wrong;
    b.classList.add(ok ? 'right' : 'wrong'); if (!ok) $(`.line[data-i="${t.wrong}"]`, body).classList.add('right');
    btns.forEach(x => x.disabled = true);
    answer(ok, { explain: (ok ? 'Genau, Zeile ' + t.wrong + ' ist falsch. ' : `Der Fehler steckt in Zeile ${t.wrong}. `) + t.explain });
  }));
};

RENDER.input = (t, body) => {
  const coarse = window.matchMedia && matchMedia('(pointer: coarse)').matches;
  body.innerHTML = `<div class="fields">${t.fields.map((f, i) => `<label class="field"><span>${f.label || ''}</span><input id="ans${i}" class="inp" autocomplete="off" spellcheck="false" inputmode="${coarse ? 'none' : 'decimal'}" aria-label="${f.label ? f.label.replace(/[:=]/g, '') : 'Antwort'}"><span>${f.unit || ''}</span></label>`).join('')}</div>
    <div class="pad">${['7', '8', '9', 'del', '4', '5', '6', '−', '1', '2', '3', ',', '0', 'ok'].map(k => `<button class="key ${k === 'ok' ? 'ok' : ''} ${k === '0' ? 'zero' : ''}" data-k="${k}" ${k === 'del' ? 'aria-label="Löschen"' : ''}>${k === 'del' ? '⌫' : k === 'ok' ? 'Prüfen' : k}</button>`).join('')}</div>`;
  const inps = $$('.inp', body);
  let act = inps[0];
  const setAct = el => { act = el; inps.forEach(x => x.classList.toggle('active', x === el)); };
  setAct(act);
  if (!coarse) setTimeout(() => act && act.focus({ preventScroll: true }), 50);
  inps.forEach(inp => {
    inp.addEventListener('focus', () => setAct(inp));
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); check(); } });
  });
  const check = () => {
    if (G.locked) return;
    const vals = inps.map(i => parseNum(i.value));
    if (vals.some(v => isNaN(v))) { const bad = inps[vals.findIndex(v => isNaN(v))]; setAct(bad); say('Gib bitte eine Zahl ein (Komma oder Punkt geht beides).', 'wow'); bad.focus({ preventScroll: true }); return; }
    let ok = true;
    t.fields.forEach((f, i) => { const good = Math.abs(vals[i] - f.answer) <= (f.tol != null ? f.tol : 1e-6) + 1e-9; inps[i].classList.add(good ? 'right' : 'wrong'); if (!good) ok = false; inps[i].readOnly = true; });
    $$('.key', body).forEach(k => k.disabled = true);
    const sol = t.fields.map(f => `${f.label ? f.label + ' ' : ''}${fmt(f.answer, f.round != null ? f.round : 2)}${f.unit ? ' ' + f.unit : ''}`).join(', ');
    answer(ok, { explain: (ok ? '' : `Richtige Lösung: <b>${sol}</b><br>`) + (t.explain || '') });
  };
  $$('.key', body).forEach(k => k.addEventListener('click', () => {
    if (G.locked) return;
    const v = k.dataset.k;
    if (v === 'ok') return check();
    if (!act) return;
    if (v === 'del') act.value = act.value.slice(0, -1);
    else if (v === '−') act.value = act.value.startsWith('−') || act.value.startsWith('-') ? act.value.slice(1) : '−' + act.value;
    else act.value += v;
    Snd.click();
  }));
};

RENDER.match = (t, body) => {
  const n = t.left.length, rOrder = R.shuffle([...Array(n).keys()]);
  body.innerHTML = `<div class="match"><svg class="mlines"></svg><div class="mcol ml">${t.left.map((h, i) => `<button class="mi" data-s="l" data-i="${i}"><span class="mtxt">${h}</span><span class="dot"></span></button>`).join('')}</div>
    <div class="mcol mr">${rOrder.map(i => `<button class="mi" data-s="r" data-i="${i}"><span class="dot"></span><span class="mtxt">${t.right[i]}</span></button>`).join('')}</div></div>
    <p class="hint-s" style="margin:0 0 10px">Ziehe eine Linie von links nach rechts – oder tippe nacheinander auf zwei Felder.</p><button class="btn check" id="mCheck" disabled>Prüfen</button>`;
  const box = $('.match', body), svgEl = $('.mlines', box);
  const conn = new Map();
  let sel = null, tmp = null, checked = null;
  const item = (s, i) => $(`.mi[data-s="${s}"][data-i="${i}"]`, box);
  const dotPos = (s, i) => { const b = box.getBoundingClientRect(), d = $('.dot', item(s, i)).getBoundingClientRect(); return [d.left + d.width / 2 - b.left, d.top + d.height / 2 - b.top]; };
  const draw = () => {
    let h = '';
    conn.forEach((r, l) => { const a = dotPos('l', l), b = dotPos('r', r); const cls = checked ? (r === l ? 'right' : 'wrong') : ''; h += `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" class="${cls}"/>`; });
    if (checked) for (let l = 0; l < n; l++) if (conn.get(l) !== l) { const a = dotPos('l', l), b = dotPos('r', l); h += `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" class="show"/>`; }
    if (tmp) h += `<line x1="${tmp[0]}" y1="${tmp[1]}" x2="${tmp[2]}" y2="${tmp[3]}" class="tmp"/>`;
    svgEl.innerHTML = h;
    $$('.mi', box).forEach(el => { const s = el.dataset.s, i = +el.dataset.i; el.classList.toggle('linked', s === 'l' ? conn.has(i) : [...conn.values()].includes(i)); el.classList.toggle('sel', !!sel && sel.s === s && sel.i === i); });
    $('#mCheck').disabled = conn.size !== n || !!checked;
  };
  G.redraw = draw;
  const link = (a, b) => {
    const [l, r] = a.s === 'l' ? [a.i, b.i] : [b.i, a.i];
    for (const [k, v] of [...conn]) if (k === l || v === r) conn.delete(k);
    conn.set(l, r); Snd.click();
  };
  const unlink = (s, i) => { for (const [k, v] of [...conn]) if ((s === 'l' && k === i) || (s === 'r' && v === i)) conn.delete(k); };
  let drag = null;
  $$('.mi', box).forEach(el => {
    el.addEventListener('pointerdown', e => { if (G.locked || checked) return; e.preventDefault(); drag = { s: el.dataset.s, i: +el.dataset.i, x: e.clientX, y: e.clientY, moved: false, id: e.pointerId }; try { el.setPointerCapture(e.pointerId); } catch (_) { } });
    el.addEventListener('pointermove', e => {
      if (!drag || drag.id !== e.pointerId) return;
      if (!drag.moved && Math.hypot(e.clientX - drag.x, e.clientY - drag.y) > 8) drag.moved = true;
      if (drag.moved) { const b = box.getBoundingClientRect(), a = dotPos(drag.s, drag.i); tmp = [a[0], a[1], e.clientX - b.left, e.clientY - b.top]; draw(); }
    });
    const end = e => {
      if (!drag || drag.id !== e.pointerId) return;
      const d = drag; drag = null; tmp = null;
      try { el.releasePointerCapture(e.pointerId); } catch (_) { }
      if (d.moved) {
        const target = document.elementFromPoint(e.clientX, e.clientY);
        const t2 = target && target.closest('.mi');
        if (t2 && box.contains(t2) && t2.dataset.s !== d.s) { link(d, { s: t2.dataset.s, i: +t2.dataset.i }); sel = null; }
        draw(); return;
      }
      tapItem(d.s, d.i);
    };
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', () => { drag = null; tmp = null; draw(); });
    el.addEventListener('click', e => { if (e.detail === 0) tapItem(el.dataset.s, +el.dataset.i); });
  });
  function tapItem(s, i) {
    if (G.locked || checked) return;
    if (sel && sel.s !== s) { link(sel, { s, i }); sel = null; }
    else if (sel && sel.s === s && sel.i === i) sel = null;
    else { if (!sel) unlink(s, i); sel = { s, i }; }
    draw();
  }
  $('#mCheck').onclick = () => {
    if (G.locked || conn.size !== n) return;
    checked = true; sel = null;
    let ok = true; conn.forEach((r, l) => { if (r !== l) ok = false; });
    draw();
    const list = t.left.map((l, i) => `${l} ⟶ ${t.right[i]}`).join('<br>');
    answer(ok, { explain: (ok ? '' : 'Die gestrichelten Linien zeigen die richtigen Paare:<br>') + list + (t.hint && !ok ? `<br><i>${t.hint}</i>` : '') });
  };
  requestAnimationFrame(draw);
};

function dragChip(el, { onDrop, onTap }) {
  let st = null;
  el.addEventListener('pointerdown', e => { if (G.locked) return; st = { x: e.clientX, y: e.clientY, id: e.pointerId, drag: false }; try { el.setPointerCapture(e.pointerId); } catch (_) { } });
  el.addEventListener('pointermove', e => {
    if (!st || st.id !== e.pointerId) return;
    const dx = e.clientX - st.x, dy = e.clientY - st.y;
    if (!st.drag && Math.hypot(dx, dy) > 8) { st.drag = true; el.classList.add('dragging'); }
    if (st.drag) { el.style.transform = `translate(${dx}px,${dy}px)`; const tg = hitBin(e); $$('.bin').forEach(b => b.classList.toggle('hot', b === tg)); }
  });
  function hitBin(e) { el.style.visibility = 'hidden'; const tg = document.elementFromPoint(e.clientX, e.clientY); el.style.visibility = ''; return tg && tg.closest('.bin'); }
  el.addEventListener('pointerup', e => {
    if (!st || st.id !== e.pointerId) return;
    const was = st.drag; st = null;
    try { el.releasePointerCapture(e.pointerId); } catch (_) { }
    el.classList.remove('dragging'); el.style.transform = ''; $$('.bin').forEach(b => b.classList.remove('hot'));
    if (was) onDrop(hitBin(e)); else onTap();
  });
  el.addEventListener('pointercancel', () => { st = null; el.classList.remove('dragging'); el.style.transform = ''; });
  el.addEventListener('click', e => { if (e.detail === 0) onTap(); });
}
RENDER.bins = (t, body) => {
  body.innerHTML = `<div class="pool" id="pool"></div><div class="bins">${t.bins.map((b, j) => `<div class="bin" data-j="${j}"><div class="bin-l">${b}</div><div class="bin-c"></div></div>`).join('')}</div>
    <p class="hint-s" style="margin:0 0 10px">Ziehe die Kärtchen in die Fächer – oder tippe ein Kärtchen und dann ein Fach an.</p><button class="btn check" id="bCheck" disabled>Prüfen</button>`;
  const pool = $('#pool', body), place = new Map();
  let sel = null;
  const chips = t.items.map((it, i) => { const c = document.createElement('button'); c.className = 'chip'; c.innerHTML = it.html; c.dataset.i = i; pool.appendChild(c); return c; });
  const refresh = () => { chips.forEach(c => c.classList.toggle('sel', sel === c)); $('#bCheck').disabled = place.size !== chips.length; };
  const moveTo = (c, bin) => {
    const i = +c.dataset.i;
    if (bin) { $('.bin-c', bin).appendChild(c); place.set(i, +bin.dataset.j); } else { pool.appendChild(c); place.delete(i); }
    sel = null; Snd.click(); refresh();
  };
  chips.forEach(c => dragChip(c, {
    onDrop: bin => { if (bin) moveTo(c, bin); },
    onTap: () => { if (G.locked) return; if (place.has(+c.dataset.i)) { moveTo(c, null); return; } sel = sel === c ? null : c; refresh(); }
  }));
  $$('.bin', body).forEach(b => b.addEventListener('click', e => { if (G.locked || !sel || e.target.closest('.chip')) return; moveTo(sel, b); }));
  $('#bCheck').onclick = () => {
    if (G.locked || place.size !== chips.length) return;
    let ok = true; const wrong = [];
    chips.forEach(c => { const i = +c.dataset.i, good = place.get(i) === t.items[i].bin; c.classList.add(good ? 'right' : 'wrong'); c.disabled = true; if (!good) { ok = false; wrong.push(`${t.items[i].html} gehört zu <b>${t.bins[t.items[i].bin]}</b>`); } });
    answer(ok, { explain: ok ? 'Alles richtig einsortiert!' : wrong.join('<br>') + (t.hint ? `<br><i>${t.hint}</i>` : '') });
  };
  refresh();
};

RENDER.tf = (t, body) => {
  body.innerHTML = `<div class="swipe-wrap"><div class="swipe-card" tabindex="0" aria-label="Aussage"><div>${t.statement}</div>${t.visual || ''}</div></div>
    <div class="tf-btns"><button class="btn bad" data-v="0">✗ Falsch</button><button class="btn good" data-v="1">✓ Wahr</button></div><p class="hint-s">Du kannst die Karte auch nach links (falsch) oder rechts (wahr) wischen.</p>`;
  const card = $('.swipe-card', body);
  const decide = v => {
    if (G.locked) return;
    card.style.transform = `translateX(${v ? 420 : -420}px) rotate(${v ? 25 : -25}deg)`; card.classList.add('fly');
    $$('.tf-btns button', body).forEach(b => b.disabled = true);
    const ok = v === t.answer;
    answer(ok, { explain: `Die Aussage ist <b>${t.answer ? 'wahr' : 'falsch'}</b>. ${t.explain}` });
  };
  $$('.tf-btns button', body).forEach(b => b.onclick = () => decide(b.dataset.v === '1'));
  card.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') decide(false); if (e.key === 'ArrowRight') decide(true); });
  let st = null;
  card.addEventListener('pointerdown', e => { if (G.locked) return; st = { x: e.clientX, id: e.pointerId }; try { card.setPointerCapture(e.pointerId); } catch (_) { } });
  card.addEventListener('pointermove', e => { if (!st || st.id !== e.pointerId) return; const dx = e.clientX - st.x; card.style.transform = `translateX(${dx}px) rotate(${dx / 18}deg)`; card.classList.toggle('l', dx < -40); card.classList.toggle('r', dx > 40); });
  const up = e => { if (!st || st.id !== e.pointerId) return; const dx = e.clientX - st.x; st = null; card.classList.remove('l', 'r'); if (Math.abs(dx) > 90) decide(dx > 0); else card.style.transform = ''; };
  card.addEventListener('pointerup', up); card.addEventListener('pointercancel', () => { st = null; card.style.transform = ''; card.classList.remove('l', 'r'); });
};

RENDER.memory = (t, body) => {
  const cards = R.shuffle(t.pairs.flatMap((p, i) => [{ p: i, h: p[0] }, { p: i, h: p[1] }]));
  body.innerHTML = `<div class="memo">${cards.map((c, i) => `<button class="mcard" data-i="${i}" aria-label="Karte ${i + 1}"><span class="back">?</span><span class="face">${c.h}</span></button>`).join('')}</div><div class="memo-info" id="memInfo">Fehlversuche: 0 · erlaubt für 3 Sterne-Wertung: ${t.pairs.length}</div>`;
  let open = [], miss = 0, found = 0, busy = false;
  $$('.mcard', body).forEach(b => b.onclick = () => {
    if (G.locked || busy || b.classList.contains('open') || b.classList.contains('done')) return;
    b.classList.add('open'); open.push(b); Snd.click();
    if (open.length < 2) return;
    const [a, c] = open; open = [];
    if (cards[+a.dataset.i].p === cards[+c.dataset.i].p) {
      a.classList.replace('open', 'done'); c.classList.replace('open', 'done'); found++; Snd.ok();
      if (found === t.pairs.length) answer(miss <= t.pairs.length, { explain: `Du hast alle ${t.pairs.length} Paare gefunden – mit ${miss} Fehlversuchen.${miss > t.pairs.length ? ' Für eine richtige Runde brauchst du höchstens ' + t.pairs.length + ' Fehlversuche.' : ''}<br><i>${t.hint}</i>` });
    } else {
      miss++; busy = true; a.classList.add('miss'); c.classList.add('miss');
      $('#memInfo').textContent = `Fehlversuche: ${miss} · erlaubt: ${t.pairs.length}`;
      setTimeout(() => { a.classList.remove('open', 'miss'); c.classList.remove('open', 'miss'); busy = false; }, 900);
    }
  });
};

function svgPoint(svgEl, e) { const p = svgEl.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; const m = svgEl.getScreenCTM(); return m ? p.matrixTransform(m.inverse()) : { x: 0, y: 0 }; }
RENDER.numberline = (t, body) => {
  const x0 = 30, x1 = 490, X = v => x0 + (v - t.min) / (t.max - t.min) * (x1 - x0), V = x => t.min + (x - x0) / (x1 - x0) * (t.max - t.min);
  let ticks = '';
  for (let v = t.min; v <= t.max + 1e-9; v += .5) { const big = Math.abs(v - Math.round(v)) < 1e-9; ticks += `<line x1="${X(v)}" y1="${big ? 58 : 64}" x2="${X(v)}" y2="${big ? 82 : 76}" class="tick"/>${big ? `<text x="${X(v)}" y="102" text-anchor="middle" class="num">${fmt(v)}</text>` : ''}`; }
  for (let v = t.min; v <= t.max + 1e-9; v += .1) { if (Math.abs(v * 2 - Math.round(v * 2)) > 1e-6) ticks += `<line x1="${X(v)}" y1="66" x2="${X(v)}" y2="74" class="tick" stroke-width="1"/>`; }
  body.innerHTML = `<svg class="nl" viewBox="0 0 520 130"><line x1="${x0 - 10}" y1="70" x2="${x1 + 10}" y2="70" class="base"/>${ticks}<g id="mk" visibility="hidden"><polygon points="0,52 -10,30 10,30" class="mk"/><circle cx="0" cy="70" r="7" class="mk"/></g><g id="tr"></g></svg>
    <p class="center" id="nlv" style="font-weight:900;margin:0 0 10px">Tippe auf den Zahlenstrahl!</p><button class="btn check" id="nlCheck" disabled>📡 Radar aktivieren</button>`;
  const s = $('.nl', body), mk = $('#mk', body);
  let val = null, down = false;
  const set = e => { if (G.locked) return; const p = svgPoint(s, e); const x = Math.max(x0, Math.min(x1, p.x)); val = V(x); mk.setAttribute('transform', `translate(${x} 0)`); mk.setAttribute('visibility', 'visible'); $('#nlv', body).textContent = 'Dein Punkt ≈ ' + fmt(val, 1); $('#nlCheck').disabled = false; };
  s.addEventListener('pointerdown', e => { down = true; try { s.setPointerCapture(e.pointerId); } catch (_) { } set(e); });
  s.addEventListener('pointermove', e => { if (down) set(e); });
  s.addEventListener('pointerup', () => { down = false; });
  $('#nlCheck').onclick = () => {
    if (G.locked || val == null) return;
    const ok = Math.abs(val - t.value) <= t.tol;
    $('#tr', body).innerHTML = `<line x1="${X(t.value)}" y1="40" x2="${X(t.value)}" y2="90" stroke="var(--ion)" stroke-width="4"/><circle cx="${X(t.value)}" cy="70" r="6" class="true"/><text x="${X(t.value)}" y="24" text-anchor="middle" class="truel">≈ ${fmt(t.value)}</text>`;
    answer(ok, { explain: `${ok ? 'Super gezielt! ' : `Dein Punkt lag bei ≈ ${fmt(val, 1)}. `}${t.explain}` });
  };
};

function gridBase(range = 6, size = 320) {
  const sc = size / (2 * range + 1), o = size / 2, X = x => o + x * sc, Y = y => o - y * sc;
  let g = '';
  for (let i = -range; i <= range; i++) { g += `<line x1="${X(i)}" y1="0" x2="${X(i)}" y2="${size}" class="grid"/><line x1="0" y1="${Y(i)}" x2="${size}" y2="${Y(i)}" class="grid"/>`; if (i && i % 2 === 0) g += `<text x="${X(i)}" y="${o + 13}" text-anchor="middle" class="num">${fmt(i)}</text><text x="${o - 5}" y="${Y(i) + 3}" text-anchor="end" class="num">${fmt(i)}</text>`; }
  g += `<line x1="0" y1="${o}" x2="${size}" y2="${o}" class="axis"/><line x1="${o}" y1="0" x2="${o}" y2="${size}" class="axis"/><text x="${size - 6}" y="${o - 6}" text-anchor="end" class="num">x</text><text x="${o + 6}" y="10" class="num">y</text>`;
  return { g, X, Y, sc, size, range };
}
const lineSeg = (gb, k, d, cls) => `<line x1="${gb.X(-gb.range - 1)}" y1="${gb.Y(k * (-gb.range - 1) + d)}" x2="${gb.X(gb.range + 1)}" y2="${gb.Y(k * (gb.range + 1) + d)}" class="${cls}"/>`;
RENDER.laser = (t, body) => {
  const gb = gridBase();
  let k = 0, d = 0; if (k === t.k && d === t.d) k = 1;
  body.innerHTML = `<svg class="gridsvg" viewBox="0 0 ${gb.size} ${gb.size}"><defs><clipPath id="lc"><rect width="${gb.size}" height="${gb.size}"/></clipPath></defs>${gb.g}<g clip-path="url(#lc)"><g id="aim"></g><g id="beam"></g></g>${t.points.map(([x, y], i) => `<circle cx="${gb.X(x)}" cy="${gb.Y(y)}" r="9" class="ast" id="a${i}"/>`).join('')}</svg>
    <div class="eqline" id="eq"></div>
    <div class="sliders"><label class="slider"><span>k</span><input type="range" id="sk" min="-4" max="4" step="0.5" value="${k}"><output id="ok"></output></label>
    ${t.lockD ? '' : `<label class="slider"><span>d</span><input type="range" id="sd" min="-6" max="6" step="1" value="${d}"><output id="od"></output></label>`}</div>
    <button class="btn pink check" id="fire">🔫 Feuer!</button>`;
  const upd = () => {
    k = +$('#sk', body).value; d = t.lockD ? 0 : +$('#sd', body).value;
    $('#ok', body).textContent = fmt(k); if (!t.lockD) $('#od', body).textContent = fmt(d);
    $('#eq', body).textContent = 'y = ' + lin(k, d);
    $('#aim', body).innerHTML = t.preview ? lineSeg(gb, k, d, 'aim') : '';
  };
  $('#sk', body).oninput = upd; if (!t.lockD) $('#sd', body).oninput = upd; upd();
  $('#fire', body).onclick = () => {
    if (G.locked) return;
    $('#beam', body).innerHTML = lineSeg(gb, k, d, 'laser');
    $$('input', body).forEach(i => i.disabled = true);
    let hits = 0;
    t.points.forEach(([x, y], i) => { if (Math.abs(k * x + d - y) < 1e-9) { hits++; $('#a' + i, body).classList.add('boom'); } });
    const ok = hits === t.points.length;
    if (!ok) $('#aim', body).innerHTML = lineSeg(gb, t.k, t.d, 'aim');
    answer(ok, { explain: `${ok ? 'Alle Asteroiden getroffen! ' : `Du hast ${hits} von ${t.points.length} getroffen. `}${t.explain}` });
  };
};

RENDER.tapgrid = (t, body) => {
  const gb = gridBase();
  const cols = ['gl', 'gl2'];
  const lines = t.lines.map((l, i) => t.showLines ? lineSeg(gb, l.k, l.d, cols[i]) : '').join('');
  body.innerHTML = `${t.showEq ? `<div class="system" style="display:flex;width:fit-content"><div style="color:var(--nova)">y = ${lin(t.lines[0].k, t.lines[0].d)}</div><div style="color:var(--plasma)">y = ${lin(t.lines[1].k, t.lines[1].d)}</div></div>` : ''}
    <svg class="gridsvg" viewBox="0 0 ${gb.size} ${gb.size}" style="cursor:crosshair"><defs><clipPath id="tc"><rect width="${gb.size}" height="${gb.size}"/></clipPath></defs>${gb.g}<g clip-path="url(#tc)">${lines}<g id="sol"></g></g><g id="mkg"></g></svg><p class="hint-s" style="margin-top:0">Tippe auf einen Gitterpunkt.</p>`;
  const s = $('.gridsvg', body);
  s.addEventListener('click', e => {
    if (G.locked) return;
    const p = svgPoint(s, e), x = Math.max(-6, Math.min(6, Math.round((p.x - gb.size / 2) / gb.sc))), y = Math.max(-6, Math.min(6, Math.round((gb.size / 2 - p.y) / gb.sc)));
    const ok = x === t.x && y === t.y;
    $('#mkg', body).innerHTML = `<circle cx="${gb.X(x)}" cy="${gb.Y(y)}" r="9" class="mk"/>`;
    $('#sol', body).innerHTML = (t.showLines ? '' : t.lines.map((l, i) => lineSeg(gb, l.k, l.d, cols[i])).join('')) + `<circle cx="${gb.X(t.x)}" cy="${gb.Y(t.y)}" r="7" class="true"/>`;
    answer(ok, { explain: `${ok ? '' : `Du hast (${fmt(x)} | ${fmt(y)}) angetippt. `}${t.explain}` });
  });
};

RENDER.tapsvg = (t, body, card) => {
  body.innerHTML = '<p class="hint-s" style="margin:0">Tippe direkt auf die Seite im Dreieck.</p>';
  const hits = $$('[data-hit]', card);
  hits.forEach(h => {
    const side = $(`.side[data-side="${h.dataset.hit}"]`, card);
    h.addEventListener('pointerenter', () => side.classList.add('hl'));
    h.addEventListener('pointerleave', () => side.classList.remove('hl'));
    h.addEventListener('click', () => {
      if (G.locked) return;
      const ok = h.dataset.hit === t.correct;
      side.classList.remove('hl'); side.classList.add(ok ? 'right' : 'wrong');
      if (!ok) $(`.side[data-side="${t.correct}"]`, card).classList.add('right');
      answer(ok);
    });
  });
};

RENDER.order = (t, body) => {
  const idx = R.shuffle(t.items.map((_, i) => i));
  body.innerHTML = `<div class="order">${idx.map(i => `<button class="ordb" data-i="${i}">${t.items[i].html}</button>`).join('')}</div><div class="center"><button class="btn sec" id="oReset">Zurücksetzen</button></div>`;
  let seq = [];
  const btns = $$('.ordb', body);
  const draw = () => btns.forEach(b => { const p = seq.indexOf(+b.dataset.i); $('.n', b) && $('.n', b).remove(); if (p >= 0) b.insertAdjacentHTML('afterbegin', `<span class="n">${p + 1}</span>`); });
  btns.forEach(b => b.onclick = () => {
    if (G.locked) return;
    const i = +b.dataset.i; if (seq.includes(i)) return;
    seq.push(i); Snd.click(); draw();
    if (seq.length === t.items.length) {
      const sorted = t.items.map((_, j) => j).sort((a, c) => t.items[a].value - t.items[c].value);
      const ok = seq.every((v, j) => v === sorted[j]);
      btns.forEach(x => { const pos = seq.indexOf(+x.dataset.i); x.classList.add(sorted[pos] === +x.dataset.i ? 'right' : 'wrong'); x.disabled = true; });
      $('#oReset', body).disabled = true;
      answer(ok);
    }
  });
  $('#oReset', body).onclick = () => { if (G.locked) return; seq = []; draw(); };
};

RENDER.balance = (t, body) => {
  let s = { ...t.state }, wrongs = 0;
  const hist = [];
  const view = () => {
    const [l, r] = balanceSides(s);
    const m = balanceMoves(s);
    body.innerHTML = `<svg class="bal" viewBox="0 0 440 200"><polygon points="200,190 240,190 226,72 214,72" class="stand"/><rect x="150" y="186" width="140" height="10" rx="5" class="stand"/>
      <g class="beam"><line x1="60" y1="70" x2="380" y2="70" class="bar2"/><circle cx="220" cy="70" r="7" fill="var(--nova)"/>
      <line x1="70" y1="70" x2="40" y2="128" class="rope"/><line x1="70" y1="70" x2="100" y2="128" class="rope"/><line x1="370" y1="70" x2="340" y2="128" class="rope"/><line x1="370" y1="70" x2="400" y2="128" class="rope"/>
      <path d="M8 128 H132 Q120 152 70 152 Q20 152 8 128 Z" class="pan"/><path d="M308 128 H432 Q420 152 370 152 Q320 152 308 128 Z" class="pan"/>
      <text x="70" y="112" text-anchor="middle" class="ex">${l}</text><text x="370" y="112" text-anchor="middle" class="ex">${r}</text></g></svg>
      <div class="hist">${hist.map(h => `<div>${h.eq} <span class="act">| ${h.act}</span></div>`).join('')}<div style="color:var(--ink);font-size:20px;font-weight:900">${l} = ${r}</div></div>
      ${m ? `<div class="moves">${R.shuffle([m.correct, ...m.wrong.slice(0, 3)]).map(o => `<button class="opt" data-m="${esc(o)}">${o}</button>`).join('')}</div>` : ''}`;
    if (!m) {
      const sol = `x = ${fmt(s.d)}`;
      const steps = hist.map(h => `${h.eq} <span style="opacity:.75">| ${h.act}</span>`).join('<br>') + `<br><b>${sol}</b>`;
      setTimeout(() => answer(wrongs === 0, { explain: (wrongs ? `Du hast ${wrongs}-mal die Waage zum Kippen gebracht. ` : '') + 'Lösungsweg:<br>' + steps }), 300);
      return;
    }
    $$('.moves .opt', body).forEach(b => b.onclick = () => {
      if (G.locked) return;
      if (b.dataset.m === m.correct) {
        hist.push({ eq: `${l} = ${r}`, act: m.correct }); s = m.apply(); Snd.click(); say('✔️ ' + m.why, 'happy'); view();
      } else {
        wrongs++; Snd.bad(); b.classList.add('wrong'); b.disabled = true;
        const bal = $('.bal', body); bal.classList.remove('tilt'); bal.getBoundingClientRect(); bal.classList.add('tilt');
        say(b.dataset.m.startsWith('Nur') ? 'Die Waage kippt! Was du auf einer Seite machst, musst du auch auf der anderen machen.' : 'Hmm, das hilft nicht weiter. Welcher Schritt bringt x näher zur Freiheit?', 'sad');
      }
    });
  };
  view();
};

/* =====================================================================
   SHOP · ERFOLGE · ELTERN · URKUNDE
   ===================================================================== */
function showShop() {
  stopGame();
  const row = (list, kind) => list.map(it => {
    const own = S.owned.includes(it.id), eq = S[kind] === it.id;
    return `<div class="item ${eq ? 'eq' : ''}"><div class="prev">${kind === 'ship' ? shipSvg(it.id) : pipiSvg('', it.id)}</div><div class="nm">${it.name}</div>
      <button class="btn ${own ? 'sec' : ''}" data-k="${kind}" data-id="${it.id}" ${eq ? 'disabled' : ''}>${eq ? 'Ausgerüstet' : own ? 'Ausrüsten' : `◆ ${it.price}`}</button></div>`;
  }).join('');
  app.innerHTML = `<div class="screen"><button class="back" id="back">← Sternenkarte</button><h2 class="sec-h">Raumhafen-Shop</h2><p class="sec-p">Du hast <b style="color:var(--nova)">◆ ${S.cr}</b> Kristalle. Kristalle bekommst du für Sterne, Bosse und Tagesmissionen.</p>
    <h3 class="eyebrow" style="margin-bottom:10px">Raumschiffe</h3><div class="shopgrid">${row(SHIPS, 'ship')}</div>
    <h3 class="eyebrow" style="margin-bottom:10px">Hüte für Pi-Pi</h3><div class="shopgrid">${row(HATS, 'hat')}</div></div>`;
  $('#back').onclick = showMap;
  $$('.item .btn').forEach(b => b.onclick = () => {
    const kind = b.dataset.k, id = b.dataset.id, it = (kind === 'ship' ? SHIPS : HATS).find(x => x.id === id);
    if (!S.owned.includes(id)) {
      if (S.cr < it.price) { toast(`Dir fehlen noch ${it.price - S.cr} Kristalle.`, '◆'); Snd.bad(); return; }
      S.cr -= it.price; S.owned.push(id); Snd.win(); confetti(60);
    }
    S[kind] = id; save(); updateTop(); paintLogo(); showShop();
  });
  window.scrollTo(0, 0);
}
function showBadges() {
  stopGame();
  const got = BADGES.filter(b => S.badges[b.id]).length;
  app.innerHTML = `<div class="screen"><button class="back" id="back">← Sternenkarte</button><h2 class="sec-h">Abzeichen</h2><p class="sec-p">${got} von ${BADGES.length} freigeschaltet.</p>
    <div class="badges">${BADGES.map(b => `<div class="badge ${S.badges[b.id] ? 'got' : ''}"><div class="bi">${S.badges[b.id] ? b.i : '🔒'}</div><div><b>${b.n}</b><span>${b.d}</span></div></div>`).join('')}</div></div>`;
  $('#back').onclick = showMap;
  window.scrollTo(0, 0);
}
function showParents() {
  stopGame();
  const rows = PLANETS.map(p => { const s = S.stats[p.id] || { c: 0, w: 0 }, n = s.c + s.w; return { p, s, n, pc: n ? s.c / n : null }; });
  const weak = rows.filter(r => r.n >= 5).sort((a, b) => a.pc - b.pc).slice(0, 2).filter(r => r.pc < .8);
  const total = rows.reduce((a, r) => a + r.n, 0), totalC = rows.reduce((a, r) => a + r.s.c, 0);
  app.innerHTML = `<div class="screen"><button class="back" id="back">← Sternenkarte</button><h2 class="sec-h">Eltern & Lehrkräfte</h2>
    <p class="sec-p">${ACC.key ? `Übersicht für den Account <b>${esc(ACC.meta.name)}</b>.` : 'Übersicht über alle gelösten Aufgaben auf diesem Gerät (Gast).'} ${total ? `Insgesamt ${total} Aufgaben, davon ${Math.round(totalC / total * 100)} % richtig.` : 'Noch keine Aufgaben gelöst.'}</p>
    ${weak.length ? `<div class="weak"><b>Hier lohnt sich Üben:</b> ${weak.map(r => `${r.p.name} (${r.p.topic}, ${Math.round(r.pc * 100)} % richtig)`).join(' · ')}</div>` : ''}
    <div class="panel section">${rows.map(r => `<div class="statrow"><span>${r.p.name}</span><div class="sb" title="${r.s.c} richtig, ${r.s.w} falsch">${r.n ? `<i class="c" style="width:${r.s.c / r.n * 100}%"></i><i class="w" style="width:${r.s.w / r.n * 100}%"></i>` : ''}</div><span class="pc">${r.n ? Math.round(r.pc * 100) + ' %' : '–'}</span></div>`).join('')}
      <p class="sm" style="margin:10px 0 0">Grün = richtig, rot = falsch. Prozent = Anteil richtiger Antworten.</p></div>
    <div class="panel section">
      <div class="setrow"><label for="nameIn">Name für die Urkunde</label><input id="nameIn" class="txtin" maxlength="30" value="${esc(S.name)}" placeholder="Vorname"></div>
      <div class="setrow"><label id="tL">Lehrer-Modus: alle Planeten freischalten</label><button class="switch" role="switch" aria-labelledby="tL" aria-checked="${S.teacher}" id="tSw"></button></div>
      <div class="setrow"><label id="sL">Soundeffekte</label><button class="switch" role="switch" aria-labelledby="sL" aria-checked="${S.sound}" id="sSw"></button></div>
      <div class="setrow"><label>Spielstand löschen</label><button class="btn sec" id="reset">Alles zurücksetzen</button></div>
    </div>
    ${ACC.isOwner && ACC.db ? '<div class="panel section"><h3 class="eyebrow" style="margin-bottom:8px">Klassen-Übersicht · alle Accounts</h3><div id="classBox"></div></div>' : ''}
    <p class="sm">Die Aufgaben orientieren sich am Mathematik-Stoff der 4. Klasse (8. Schulstufe) in Österreich. Alle Aufgaben werden zufällig neu erzeugt; ${ACC.key ? 'der Spielstand wird in deinem Account gespeichert.' : 'als Gast wird der Spielstand nur in diesem Browser gespeichert.'}</p></div>`;
  $('#back').onclick = showMap;
  classOverview();
  $('#nameIn').addEventListener('input', e => { S.name = e.target.value.trim().slice(0, 30); save(); });
  $('#tSw').onclick = e => { S.teacher = !S.teacher; e.currentTarget.setAttribute('aria-checked', S.teacher); save(); };
  $('#sSw').onclick = e => { S.sound = !S.sound; e.currentTarget.setAttribute('aria-checked', S.sound); save(); updateTop(); };
  $('#reset').onclick = () => modal('<h2>Wirklich alles löschen?</h2><p>Sterne, Kristalle, Abzeichen und Statistik gehen verloren.</p>',
    [{ label: 'Abbrechen', cls: 'sec' }, { label: 'Ja, löschen', cls: 'pink', fn: () => { const nm0 = ACC.key ? ACC.meta.name : ''; S = clone(DEF); S.name = nm0; save(); updateTop(); paintLogo(); showMap(); if (!ACC.key) welcome(); } }]);
  window.scrollTo(0, 0);
}
function showCertificate() {
  const d = new Date();
  const ds = `${d.getDate()}. ${['Jänner', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'][d.getMonth()]} ${d.getFullYear()}`;
  app.innerHTML = `<div class="screen"><div class="cert"><div class="eyebrow" style="color:#8a6a12">Mathe-Galaxie · Mission Genial</div><h2>Urkunde</h2>
    <p>Hiermit wird bestätigt, dass</p><div class="who">${esc(S.name || 'unser Pilot')}</div>
    <p>NULL-Bot besiegt, alle Planeten repariert und die Mathe-Galaxie gerettet hat – von den reellen Zahlen bis zur Statistik.</p>
    <div class="seal">🏆</div><div class="meta">${ds} · Level ${levelOf(S.xp).level} · ${totalStars()} Sterne · unterzeichnet von Pi-Pi 👽</div></div>
    <p class="center sm" style="margin-top:16px">Tipp: Mach einen Screenshot, um die Urkunde aufzuheben.</p>
    <div class="ractions"><button class="btn" id="cBack">Zur Sternenkarte</button></div></div>`;
  $('#cBack').onclick = showMap;
  window.scrollTo(0, 0);
}
function paintLogo() { $('#logoShip').innerHTML = shipSvg(); }
function welcome() {
  if (S.name) return;
  modal(`<div class="pw">${pipiSvg('happy')}</div><h2>Hallo, ich bin Pi-Pi!</h2><p>NULL-Bot hat die Mathe-Galaxie durcheinandergebracht. Wie heißt du, Pilot?</p><input id="wName" class="txtin" maxlength="30" placeholder="Dein Vorname" style="margin-top:8px">`,
    [{ label: 'Später', cls: 'sec' }, { label: 'Los geht’s!', fn: () => { const v = ($('#wName') || {}).value || ''; S.name = v.trim().slice(0, 30); save(); showMap(); } }]);
  const inp = $('#wName'); if (inp) inp.addEventListener('keydown', e => { if (e.key === 'Enter') { S.name = inp.value.trim().slice(0, 30); save(); $('#modal').hidden = true; showMap(); } });
}

/* ---------- Start ---------- */
$('#homeBtn').onclick = showMap;
$('#shopBtn').onclick = showShop;
$('#badgeBtn').onclick = showBadges;
$('#parentBtn').onclick = showParents;
$('#sndBtn').onclick = () => { S.sound = !S.sound; save(); updateTop(); if (S.sound) { Snd.init(); Snd.click(); } };
addEventListener('resize', () => { drawStars(); if (G && G.redraw) G.redraw(); });
$('#accBtn').onclick = accountMenu;
drawStars(); paintLogo(); updateTop(); paintAcc(); initAccounts();
