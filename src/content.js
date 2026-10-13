'use strict';
/* =====================================================================
   MATHE-GALAXIE – Inhalte & Aufgabengeneratoren
   Jede Aufgabe wird zufällig erzeugt; die Lösung berechnet immer der Code.
   ===================================================================== */

/* ---------- Hilfsfunktionen ---------- */
const R = {
  int: (a, b) => a + Math.floor(Math.random() * (b - a + 1)),
  pick: a => a[Math.floor(Math.random() * a.length)],
  shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; },
  nz(a, b) { let v; do { v = R.int(a, b); } while (v === 0); return v; },
  sample(a, n) { return R.shuffle(a).slice(0, n); },
  chance: p => Math.random() < p
};
const MINUS = '−';
const PI = Math.PI;

function fmt(n, dec = 2) {
  if (typeof n !== 'number' || !isFinite(n)) return String(n);
  let v = Math.round(n * Math.pow(10, dec)) / Math.pow(10, dec);
  if (v === 0) v = 0;
  let s = Math.abs(v).toFixed(dec);
  if (s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, '');
  let [ip, fp] = s.split('.');
  if (ip.length > 4) ip = ip.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return (v < 0 ? MINUS : '') + ip + (fp ? ',' + fp : '');
}
function parseNum(str) {
  if (str == null) return NaN;
  let s = String(str).trim().replace(/[\s ]/g, '').replace(/[−–]/g, '-').replace(/,/g, '.');
  if (s === '') return NaN;
  const m = s.match(/^(-?\d+(?:\.\d+)?)\/(-?\d+(?:\.\d+)?)$/);
  if (m) return parseFloat(m[1]) / parseFloat(m[2]);
  if (!/^-?(\d+\.?\d*|\.\d+)$/.test(s)) return NaN;
  return parseFloat(s);
}
const sg = n => '(' + (n < 0 ? MINUS : '+') + Math.abs(n) + ')';
const frac = (a, b) => `<span class="fr"><span>${a}</span><span>${b}</span></span>`;
const rt = x => `<span class="rt">√<span class="rad">${x}</span></span>`;
const cbrt = x => `<span class="rt"><sup class="ix">3</sup>√<span class="rad">${x}</span></span>`;
const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a; };
const sq = '²', cu = '³';

function mono(c, v, first) {
  if (c === 0) return '';
  const a = Math.abs(c);
  const body = (a === 1 && v ? '' : fmt(a)) + v;
  if (first) return (c < 0 ? MINUS : '') + body;
  return (c < 0 ? ' ' + MINUS + ' ' : ' + ') + body;
}
function poly(terms) {
  let s = '', first = true;
  for (const [c, v] of terms) { if (c === 0) continue; s += mono(c, v, first); first = false; }
  return s || '0';
}
const px = (c2, c1, c0) => poly([[c2, 'x²'], [c1, 'x'], [c0, '']]);
const lin = (k, d, v = 'x') => poly([[k, v], [d, '']]);
const signed = n => (n < 0 ? ' ' + MINUS + ' ' : ' + ') + fmt(Math.abs(n));

/* Antwortfelder */
const exact = (answer, unit = '', label = '') => ({ answer, tol: 1e-6, unit, label });
const round2 = (answer, unit = '', label = '') => ({ answer, tol: 0.011, unit, label, round: 2 });
const round1 = (answer, unit = '', label = '') => ({ answer, tol: 0.051, unit, label, round: 1 });
const piF = (answer, unit = '', label = '') => ({ answer, tol: Math.max(0.02, Math.abs(answer) * 0.012), unit, label, round: 2 });

/* Auswahl-Optionen: korrekte Antwort zuerst, Duplikate raus, auf 4 auffüllen */
function mkOpts(correct, cands, fill) {
  const out = [correct];
  for (const c of cands) { if (out.length >= 4) break; if (c != null && c !== '' && !out.includes(c)) out.push(c); }
  let guard = 0;
  while (out.length < 4 && fill && guard++ < 80) { const c = fill(); if (c != null && !out.includes(c)) out.push(c); }
  return out;
}
function choice(q, correct, cands, extra = {}) {
  const { fill, ...rest } = extra;
  return Object.assign({ type: 'choice', q, options: mkOpts(correct, cands, fill), correct: 0 }, rest);
}
const svg = (w, h, inner, cls = '') => `<svg viewBox="0 0 ${w} ${h}" class="vis ${cls}" role="img" aria-hidden="true">${inner}</svg>`;
const T = (x, y, s, cls = 'tx', anchor = 'middle') => `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" class="${cls}" text-anchor="${anchor}" dominant-baseline="middle">${s}</text>`;
const L = (x1, y1, x2, y2, cls = 'ln') => `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" class="${cls}"/>`;
function unused(ctx, pool, keyFn = x => x) {
  const fresh = pool.filter(p => !ctx.used.has(keyFn(p)));
  const p = R.pick(fresh.length ? fresh : pool);
  ctx.used.add(keyFn(p));
  return p;
}

/* =====================================================================
   PLANET 1 – Startrampe (Wiederholung 3. Klasse)
   ===================================================================== */
function genSigned(lvl) {
  let expr, ans, exp, step;
  if (lvl === 1) {
    const a = R.nz(-20, 20), b = R.nz(-20, 20), plus = R.chance(.5);
    ans = plus ? a + b : a - b;
    expr = `${sg(a)} ${plus ? '+' : MINUS} ${sg(b)}`;
    if (plus) {
      step = b > 0 ? `Plus eine positive Zahl: ${Math.abs(b)} Schritte nach rechts.` : `Plus eine negative Zahl ist dasselbe wie minus ${Math.abs(b)}.`;
      exp = `${expr} = ${fmt(a)} ${b < 0 ? MINUS : '+'} ${Math.abs(b)} = <b>${fmt(ans)}</b>`;
    } else {
      step = `Minus vor der Klammer dreht das Vorzeichen: aus ${MINUS} ${sg(b)} wird ${b < 0 ? '+' : MINUS} ${Math.abs(b)}.`;
      exp = `${expr} = ${fmt(a)} ${b < 0 ? '+' : MINUS} ${Math.abs(b)} = <b>${fmt(ans)}</b>`;
    }
  } else if (lvl === 2) {
    if (R.chance(.5)) { const a = R.nz(-12, 12), b = R.nz(-12, 12); ans = a * b; expr = `${sg(a)} · ${sg(b)}`; }
    else { const b = R.nz(-12, 12), q = R.nz(-12, 12); ans = q; expr = `${sg(b * q)} : ${sg(b)}`; }
    step = 'Gleiche Vorzeichen ergeben Plus, verschiedene Vorzeichen ergeben Minus.';
    exp = `${expr} = <b>${fmt(ans)}</b> (${ans > 0 ? 'gleiche Vorzeichen → plus' : 'verschiedene Vorzeichen → minus'})`;
  } else {
    const t = R.int(0, 3);
    if (t === 0) { const a = R.nz(-9, 9), b = R.nz(-9, 9), c = R.nz(-20, 20); ans = a * b + c; expr = `${sg(a)} · ${sg(b)} + ${sg(c)}`; step = `Punkt vor Strich: zuerst ${sg(a)} · ${sg(b)} = ${fmt(a * b)}.`; exp = `${sg(a * b)} + ${sg(c)} = <b>${fmt(ans)}</b>`; }
    else if (t === 1) { const b = R.nz(-9, 9), q = R.nz(-9, 9), c = R.nz(-20, 20); ans = c - q; expr = `${sg(c)} ${MINUS} ${sg(b * q)} : ${sg(b)}`; step = `Punkt vor Strich: zuerst ${sg(b * q)} : ${sg(b)} = ${fmt(q)}.`; exp = `${sg(c)} ${MINUS} ${sg(q)} = <b>${fmt(ans)}</b>`; }
    else if (t === 2) { const a = R.nz(-12, 12), b = R.nz(-12, 12), c = R.nz(-6, 6); ans = (a + b) * c; expr = `[${sg(a)} + ${sg(b)}] · ${sg(c)}`; step = `Klammer zuerst: ${sg(a)} + ${sg(b)} = ${fmt(a + b)}.`; exp = `${sg(a + b)} · ${sg(c)} = <b>${fmt(ans)}</b>`; }
    else { const a = R.nz(-9, 9), b = R.nz(-9, 9), c = R.nz(-9, 9), d = R.nz(-9, 9); ans = a * b - c * d; expr = `${sg(a)} · ${sg(b)} ${MINUS} ${sg(c)} · ${sg(d)}`; step = `Zuerst beide Produkte: ${fmt(a * b)} und ${fmt(c * d)}.`; exp = `${sg(a * b)} ${MINUS} ${sg(c * d)} = <b>${fmt(ans)}</b>`; }
  }
  return { type: 'input', q: 'Berechne!', visual: `<div class="expr">${expr} = ?</div>`, fields: [exact(ans)], explain: exp, step, hint: 'Klammer vor Punkt vor Strich. Gleiche Vorzeichen → +, verschiedene Vorzeichen → −.' };
}

const powHtml = (b, e) => `${b < 0 ? `(${MINUS}${-b})` : b}<sup>${e}</sup>`;
const xp = n => n === 1 ? 'x' : (n === 0 ? '1' : `x<sup>${n}</sup>`);
function genPotenz(lvl) {
  const pairs = [], used = new Set();
  const add = (l, r) => { if (used.has(r)) return; used.add(r); pairs.push([l, r]); };
  const powPair = () => { const b = R.pick([2, 3, 4, 5, -2, -3, 10]); const e = Math.abs(b) === 10 ? R.int(2, 5) : R.int(2, Math.abs(b) <= 3 ? 5 : 3); add(powHtml(b, e), fmt(Math.pow(b, e))); };
  const rulePair = () => {
    const t = R.int(0, 4); let a = R.int(2, 6); const b = R.int(2, 5);
    if (t === 0) add(`${xp(a)} · ${xp(b)}`, xp(a + b));
    else if (t === 1) { if (a <= b) a = b + R.int(1, 3); add(`${xp(a)} : ${xp(b)}`, xp(a - b)); }
    else if (t === 2) add(`(${xp(a)})<sup>${b}</sup>`, xp(a * b));
    else if (t === 3) { const k = R.int(2, 5); add(`(${k}x)<sup>2</sup>`, `${k * k}x<sup>2</sup>`); }
    else { const k = R.int(2, 9); add(`${MINUS}${k}<sup>2</sup>`, fmt(-k * k)); }
  };
  const sciPair = () => { const m = R.pick([1.5, 2, 2.5, 3.2, 4, 6.4, 7, 8.1]); const e = R.pick([-3, -2, -1, 2, 3, 4, 5]); add(`${fmt(m)} · 10<sup>${e < 0 ? MINUS + (-e) : e}</sup>`, fmt(m * Math.pow(10, e), 6)); };
  let g = 0;
  while (pairs.length < 4 && g++ < 300) {
    if (lvl === 1) powPair(); else if (lvl === 2) (R.chance(.75) ? rulePair : powPair)(); else (R.chance(.5) ? sciPair : rulePair)();
  }
  return { type: 'match', q: 'Verbinde jede Potenz mit ihrem Wert!', left: pairs.map(p => p[0]), right: pairs.map(p => p[1]),
    hint: 'Gleiche Basis: beim Multiplizieren Hochzahlen addieren, beim Dividieren subtrahieren, beim Potenzieren multiplizieren.',
    step: `Beispiel: 2<sup>3</sup> = 2 · 2 · 2 = 8 und x<sup>2</sup> · x<sup>3</sup> = x<sup>5</sup>.` };
}

function genProzent(lvl) {
  const items = ['Laser-Schwert', 'Jetpack', 'Sternenkarte', 'Raumanzug', 'Alien-Plüschtier', 'Mondstein'];
  const it = R.pick(items);
  if (lvl === 1) {
    const p = R.int(4, 40) * 5, r = R.pick([10, 20, 25, 50, 30, 15]), off = p * r / 100, np = p - off;
    return { type: 'input', q: `Im Weltraum-Shop kostet ein ${it} <b>${fmt(p)} €</b>. Heute gibt es <b>${r} % Rabatt</b>. Wie viel kostet es jetzt?`, fields: [round2(np, '€')],
      explain: `${r} % von ${fmt(p)} € = ${fmt(p)} · ${r} : 100 = ${fmt(off)} €.<br>${fmt(p)} € ${MINUS} ${fmt(off)} € = <b>${fmt(np)} €</b>`,
      hint: 'Rabatt = Grundwert · Prozentsatz : 100', step: `Berechne zuerst den Rabatt: ${fmt(p)} · ${r} : 100.` };
  }
  if (lvl === 2) {
    const p = R.int(4, 40) * 5, r = R.pick([10, 15, 20, 25, 30, 40, 50, 60, 75]), np = p * (100 - r) / 100;
    return { type: 'input', q: `Ein ${it} kostete <b>${fmt(p)} €</b>, jetzt nur noch <b>${fmt(np)} €</b>. Wie viel Prozent Rabatt sind das?`, fields: [round2(r, '%')],
      explain: `Ersparnis: ${fmt(p)} € ${MINUS} ${fmt(np)} € = ${fmt(p - np)} €.<br>${fmt(p - np)} : ${fmt(p)} · 100 = <b>${r} %</b>`,
      hint: 'Prozentsatz = Prozentwert : Grundwert · 100', step: `Wie viele Euro sparst du? ${fmt(p)} ${MINUS} ${fmt(np)}.` };
  }
  const p = R.int(4, 40) * 5;
  if (R.chance(.5)) {
    const r = R.pick([10, 20, 25, 50, 40]), np = p * (100 - r) / 100;
    return { type: 'input', q: `Nach <b>${r} % Rabatt</b> kostet ein ${it} noch <b>${fmt(np)} €</b>. Wie viel kostete es vorher?`, fields: [round2(p, '€')],
      explain: `${fmt(np)} € sind ${100 - r} % vom alten Preis.<br>${fmt(np)} : ${100 - r} · 100 = <b>${fmt(p)} €</b>`,
      hint: 'Der neue Preis entspricht (100 − Rabatt) % des alten Preises.', step: `${fmt(np)} € entsprechen ${100 - r} %. Wie viel ist 1 %?` };
  }
  const r = R.pick([10, 20, 25, 50]), np = p * (100 + r) / 100;
  return { type: 'input', q: `Wegen der Sonnenwind-Saison wurde ein ${it} um <b>${r} %</b> teurer und kostet jetzt <b>${fmt(np)} €</b>. Wie viel kostete es vorher?`, fields: [round2(p, '€')],
    explain: `${fmt(np)} € sind ${100 + r} % vom alten Preis.<br>${fmt(np)} : ${100 + r} · 100 = <b>${fmt(p)} €</b>`,
    hint: 'Nach einer Erhöhung um r % zahlt man (100 + r) %.', step: `${fmt(np)} € entsprechen ${100 + r} %.` };
}

/* =====================================================================
   PLANET 2 – Zahlen-Nebel (rationale, irrationale, reelle Zahlen; Wurzeln)
   ===================================================================== */
const ZOO_BINS = ['ℕ natürlich', 'ℤ ganz, nicht natürlich', 'ℚ rational, nicht ganz', 'irrational'];
const ZOO = [
  ['7', 0, 1], ['12', 0, 1], ['1', 0, 1], ['100', 0, 1], [rt(25), 0, 2], [frac(8, 2), 0, 3], [rt(49), 0, 2],
  [MINUS + '5', 1, 1], [MINUS + '12', 1, 1], [MINUS + '1', 1, 1], [MINUS + rt(9), 1, 2], [MINUS + frac(6, 3), 1, 3],
  [frac(3, 4), 2, 1], ['0,25', 2, 1], [MINUS + '1,5', 2, 1], [frac(7, 2), 2, 1], ['0,<span class="per">3</span>', 2, 2], [MINUS + frac(2, 3), 2, 2], [rt(frac(1, 4)), 2, 3], ['3,14', 2, 3],
  [rt(2), 3, 1], ['π', 3, 1], [rt(10), 3, 1], [`2 + ${rt(3)}`, 3, 2], [cbrt(5), 3, 2], [rt(8), 3, 2], [MINUS + rt(5), 3, 2], ['0,1010010001…', 3, 3]
];
function genZoo(lvl) {
  const pool = ZOO.filter(z => z[2] <= lvl);
  const items = [];
  for (let b = 0; b < 4; b++) items.push(R.pick(pool.filter(z => z[1] === b && !items.includes(z))));
  const rest = R.sample(pool.filter(z => !items.includes(z)), 2);
  return { type: 'bins', q: 'Bring jede Zahl ins <b>kleinste</b> passende Gehege!', bins: ZOO_BINS,
    items: R.shuffle(items.concat(rest)).map(z => ({ html: z[0], bin: z[1] })),
    hint: 'ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ. Rechne Wurzeln und Brüche zuerst aus: √25 = 5 ist natürlich!',
    step: 'Frag dich: Kann man die Zahl als Bruch schreiben? Wenn nein → irrational. Wenn ja: ist sie ganz? positiv?' };
}

function genRadar(lvl) {
  let n, v, label, min, tol, why;
  if (lvl === 1) { const k = R.int(1, 12); n = k * k; v = k; label = rt(n); min = Math.max(0, k - 2); tol = .25; why = `${k} · ${k} = ${n}, also ist ${rt(n)} = ${k}.`; }
  else if (lvl === 2) { do { n = R.int(2, 99); } while (Number.isInteger(Math.sqrt(n))); v = Math.sqrt(n); label = rt(n); min = Math.max(0, Math.floor(v) - 1); tol = .2; const f = Math.floor(v); why = `${f}² = ${f * f} < ${n} < ${(f + 1) * (f + 1)} = ${f + 1}², also liegt ${rt(n)} ≈ ${fmt(v)} zwischen ${f} und ${f + 1}.`; }
  else { do { n = R.int(2, 120); } while (Number.isInteger(Math.round(Math.cbrt(n) * 1e6) / 1e6)); v = Math.cbrt(n); label = cbrt(n); min = Math.max(0, Math.floor(v) - 1); tol = .15; const f = Math.floor(v); why = `${f}³ = ${f ** 3} < ${n} < ${(f + 1) ** 3} = ${f + 1}³, also ist ${cbrt(n)} ≈ ${fmt(v)}.`; }
  return { type: 'numberline', q: `Wo liegt ${label}? Setze den Radar-Punkt auf die richtige Stelle!`, label, value: v, min, max: min + 4, tol,
    explain: why, hint: 'Suche die Quadratzahlen (bzw. Kubikzahlen) direkt unter und über der Zahl.', step: why.split(',')[0] + '.' };
}

function genQuadrat(lvl) {
  const t = lvl === 1 ? 0 : lvl === 2 ? 1 : R.int(2, 3);
  if (t === 0) {
    const s = R.int(2, 20), A = s * s;
    return { type: 'input', q: `Ein quadratisches Landefeld hat den Flächeninhalt <b>A = ${fmt(A)} m²</b>. Wie lang ist eine Seite?`, visual: squareSvg(`A = ${fmt(A)} m²`, 's = ?'),
      fields: [exact(s, 'm')], explain: `s = ${rt(fmt(A))} = <b>${s} m</b>, weil ${s} · ${s} = ${A}.`, hint: 'Beim Quadrat ist A = s · s, also s = √A.', step: `Welche Zahl mal sich selbst ergibt ${A}?` };
  }
  if (t === 1) {
    const a = R.int(2, 15), V = a ** 3;
    return { type: 'input', q: `Ein würfelförmiger Frachtcontainer hat das Volumen <b>V = ${fmt(V)} dm³</b>. Wie lang ist eine Kante?`, visual: cubeSvg(`V = ${fmt(V)} dm³`),
      fields: [exact(a, 'dm')], explain: `a = ${cbrt(fmt(V))} = <b>${a} dm</b>, weil ${a} · ${a} · ${a} = ${V}.`, hint: 'Beim Würfel ist V = a · a · a, also a = ∛V.', step: `Welche Zahl dreimal mit sich selbst multipliziert ergibt ${V}?` };
  }
  if (t === 2) {
    let A; do { A = R.int(20, 500); } while (Number.isInteger(Math.sqrt(A)));
    const s = Math.sqrt(A);
    return { type: 'input', q: `Ein quadratisches Solarpaneel hat <b>A = ${A} cm²</b>. Berechne die Seitenlänge (auf 2 Dezimalen).`, visual: squareSvg(`A = ${A} cm²`, 's = ?'),
      fields: [round2(s, 'cm')], explain: `s = ${rt(A)} ≈ <b>${fmt(s)} cm</b>`, hint: 'Nimm den Taschenrechner: s = √A.', step: `s = ${rt(A)}` };
  }
  let V; do { V = R.int(20, 900); } while (Number.isInteger(Math.round(Math.cbrt(V) * 1e6) / 1e6));
  const a = Math.cbrt(V);
  return { type: 'input', q: `Ein Würfel-Tank fasst <b>V = ${V} cm³</b>. Wie lang ist eine Kante (auf 2 Dezimalen)?`, visual: cubeSvg(`V = ${V} cm³`),
    fields: [round2(a, 'cm')], explain: `a = ${cbrt(V)} ≈ <b>${fmt(a)} cm</b>`, hint: 'a = ∛V – am Taschenrechner meist mit der Taste ∛ oder x^(1/3).', step: `a = ${cbrt(V)}` };
}
function squareSvg(lbl, side) {
  return svg(260, 190, `<rect x="70" y="20" width="120" height="120" class="fl2" rx="4"/><rect x="70" y="20" width="120" height="120" class="ln" fill="none" rx="4"/>${T(130, 80, lbl)}${T(130, 165, side, 'tx ac')}`);
}
function cubeSvg(lbl) {
  return svg(260, 200, `<path d="M70 70 L170 70 L170 170 L70 170 Z" class="fl2"/><path d="M70 70 L110 35 L210 35 L170 70 Z" class="fl3"/><path d="M170 70 L210 35 L210 135 L170 170 Z" class="fl1"/>
  <path d="M70 70 L170 70 L170 170 L70 170 Z M70 70 L110 35 L210 35 L170 70 M170 170 L210 135 L210 35" class="ln" fill="none"/>${T(120, 120, lbl)}${T(120, 188, 'a = ?', 'tx ac')}`);
}

const TF_ZAHLEN = [
  [1, `${rt(49)} ist eine natürliche Zahl.`, true, `${rt(49)} = 7, und 7 ∈ ℕ.`],
  [1, `${MINUS}5 ist eine natürliche Zahl.`, false, 'Natürliche Zahlen sind 0, 1, 2, 3, … Negative Zahlen gehören zu ℤ.'],
  [1, 'π ist eine irrationale Zahl.', true, 'π = 3,14159… hat unendlich viele Nachkommastellen ohne Periode.'],
  [1, `${rt(2)} ist rational.`, false, `${rt(2)} = 1,41421356… hat keine Periode und lässt sich nicht als Bruch schreiben.`],
  [1, 'Jede ganze Zahl ist auch eine rationale Zahl.', true, `Jede ganze Zahl kann man als Bruch schreiben, z. B. ${MINUS}3 = ${frac(MINUS + '3', 1)}.`],
  [1, `${frac(3, 4)} ist eine rationale Zahl.`, true, 'Ein Bruch aus ganzen Zahlen ist immer rational.'],
  [1, `${rt(16)} = 4`, true, '4 · 4 = 16.'],
  [2, '0,333… (Periode 3) ist rational.', true, `0,333… = ${frac(1, 3)}. Periodische Dezimalzahlen sind rational.`],
  [2, `${rt(50)} liegt zwischen 7 und 8.`, true, '7² = 49 und 8² = 64, also liegt √50 dazwischen.'],
  [2, `${rt(20)} liegt zwischen 5 und 6.`, false, '4² = 16 und 5² = 25, also liegt √20 zwischen 4 und 5.'],
  [2, `${rt(9)} = ±3`, false, 'Die Quadratwurzel ist immer die nicht-negative Lösung: √9 = 3.'],
  [2, `${cbrt(27)} = 3`, true, '3 · 3 · 3 = 27.'],
  [2, `${cbrt(MINUS + '8')} = ${MINUS}2`, true, `(${MINUS}2) · (${MINUS}2) · (${MINUS}2) = ${MINUS}8. Kubikwurzeln aus negativen Zahlen gibt es!`],
  [2, `${rt(MINUS + '4')} ist eine reelle Zahl.`, false, `Keine reelle Zahl ergibt quadriert ${MINUS}4.`],
  [3, 'Zwischen 1 und 2 liegen unendlich viele rationale Zahlen.', true, 'Zwischen zwei Brüchen findet man immer einen weiteren, z. B. ihren Mittelwert.'],
  [3, `1,41 = ${rt(2)}`, false, '1,41 ist nur gerundet: 1,41² = 1,9881.'],
  [3, 'Jede reelle Zahl ist rational.', false, 'Irrationale Zahlen wie π oder √2 sind reell, aber nicht rational.'],
  [3, `${rt(16)} + ${rt(9)} = ${rt(25)}`, false, '4 + 3 = 7, aber √25 = 5. Wurzeln darf man nicht einfach addieren!'],
  [3, `${rt(4)} · ${rt(9)} = ${rt(36)}`, true, '2 · 3 = 6 = √36. Beim Multiplizieren klappt es.'],
  [3, `${rt(8)} ist irrational.`, true, '8 ist keine Quadratzahl, darum ist √8 irrational.'],
  [3, '0,1010010001… (immer eine Null mehr) ist rational.', false, 'Es gibt ein Muster, aber keine Periode – also irrational.']
];
function genTFZahlen(lvl, ctx) {
  const it = unused(ctx, TF_ZAHLEN.filter(t => t[0] <= lvl), t => t[1]);
  return { type: 'tf', statement: it[1], answer: it[2], explain: it[3], hint: 'Rechne Wurzeln aus, wo es geht. Irrational = unendlich viele Nachkommastellen ohne Periode.' };
}

/* =====================================================================
   PLANET 3 – Pythagoria
   ===================================================================== */
function triangleGeom() {
  const L1 = R.int(90, 170), L2 = R.int(70, 150), th = Math.random() * PI * 2;
  const rot = ([x, y]) => [x * Math.cos(th) - y * Math.sin(th), x * Math.sin(th) + y * Math.cos(th)];
  const pts = [[0, 0], rot([L1, 0]), rot([0, L2])];
  const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
  const mnx = Math.min(...xs), mxx = Math.max(...xs), mny = Math.min(...ys), mxy = Math.max(...ys);
  const sc = Math.min(220 / (mxx - mnx), 160 / (mxy - mny), 1.3);
  const ox = 50 + (220 - (mxx - mnx) * sc) / 2, oy = 40 + (160 - (mxy - mny) * sc) / 2;
  return pts.map(p => [ox + (p[0] - mnx) * sc, oy + (p[1] - mny) * sc]);
}
function triangleSvg(P, Q, S, names, opts = {}) {
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1]], len = v => Math.hypot(v[0], v[1]), un = v => [v[0] / len(v), v[1] / len(v)];
  const u = un(sub(Q, P)), v = un(sub(S, P));
  const m = (a, b, k) => [P[0] + u[0] * a + v[0] * b, P[1] + u[1] * a + v[1] * b];
  const r1 = m(16, 0), r2 = m(16, 16), r3 = m(0, 16);
  const G = [(P[0] + Q[0] + S[0]) / 3, (P[1] + Q[1] + S[1]) / 3];
  const lab = (X, n) => { const d = un(sub(X, G)); return T(X[0] + d[0] * 18, X[1] + d[1] * 18, n, 'tx b'); };
  const side = (A, B, id, name) => {
    const hit = opts.tap ? `<line x1="${A[0]}" y1="${A[1]}" x2="${B[0]}" y2="${B[1]}" class="hit" data-hit="${id}"/>` : '';
    let nm = '';
    if (name) { const mid = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2], d = un(sub(mid, G)); nm = T(mid[0] + d[0] * 16, mid[1] + d[1] * 16, name, 'tx ac it'); }
    return `<line x1="${A[0]}" y1="${A[1]}" x2="${B[0]}" y2="${B[1]}" class="ln side" data-side="${id}"/>${hit}${nm}`;
  };
  const sn = opts.sideNames || {};
  return svg(320, 250, `<polygon points="${P} ${Q} ${S}" class="fl2"/>
    <polyline points="${r1} ${r2} ${r3}" class="ln thin"/>
    ${side(Q, S, 'hyp', sn.hyp)}${side(P, Q, 'pq', sn.pq)}${side(P, S, 'ps', sn.ps)}
    ${lab(P, names[0])}${lab(Q, names[1])}${lab(S, names[2])}`, opts.tap ? 'tapsvg' : '');
}
function genDetektiv(lvl) {
  const [P, Q, S] = triangleGeom();
  const names = lvl === 1 ? R.shuffle(['A', 'B', 'C']) : R.sample(['K', 'L', 'M', 'P', 'Q', 'R', 'U', 'V', 'W', 'E', 'F', 'G'], 3);
  const lc = n => n.toLowerCase();
  if (lvl === 3) {
    const hy = lc(names[0]), k1 = lc(names[1]), k2 = lc(names[2]);
    const sideNames = { hyp: hy, pq: k2, ps: k1 };
    return choice(`Der rechte Winkel liegt bei <b>${names[0]}</b>. Welche Formel stimmt für dieses Dreieck?`,
      `${k1}² + ${k2}² = ${hy}²`, [`${hy}² + ${k1}² = ${k2}²`, `${hy}² + ${k2}² = ${k1}²`, `${k1}² ${MINUS} ${k2}² = ${hy}²`],
      { visual: triangleSvg(P, Q, S, names, { sideNames }), explain: `Die Hypotenuse liegt dem rechten Winkel gegenüber, also ist ${hy} die Hypotenuse: <b>${k1}² + ${k2}² = ${hy}²</b>.`,
        hint: 'Die Hypotenuse ist die längste Seite und liegt dem rechten Winkel gegenüber.', step: `Die Seite gegenüber von ${names[0]} heißt ${hy}.` });
  }
  let correct = 'hyp', q = 'Tippe auf die <b>Hypotenuse</b>!';
  if (lvl === 2 && R.chance(.6)) {
    if (R.chance(.5)) { correct = 'ps'; q = `Tippe auf die <b>Kathete</b>, die dem Punkt <b>${names[1]}</b> gegenüberliegt!`; }
    else { correct = 'pq'; q = `Tippe auf die <b>Kathete</b>, die dem Punkt <b>${names[2]}</b> gegenüberliegt!`; }
  }
  return { type: 'tapsvg', q, visual: triangleSvg(P, Q, S, names, { tap: true }), correct,
    explain: correct === 'hyp' ? `Die Hypotenuse liegt dem rechten Winkel (bei ${names[0]}) gegenüber – sie ist die längste Seite.` : `Gegenüber eines Punktes liegt die Seite, die ihn nicht berührt.`,
    hint: 'Das kleine Quadrat markiert den rechten Winkel. Die beiden Seiten daran sind die Katheten.' };
}

function ladderSvg(h, d, top) {
  const s = Math.min(150 / h, 170 / d);
  const wx = 240, gy = 205, tx = wx, ty = gy - h * s, fx = wx - d * s;
  return svg(330, 230, `<rect x="0" y="${gy}" width="330" height="25" class="fl3"/>
    <rect x="${wx}" y="${ty}" width="70" height="${h * s}" class="fl2"/><polygon points="${wx - 8},${ty} ${wx + 35},${ty - 28} ${wx + 78},${ty}" class="fl1"/>
    <rect x="${wx + 26}" y="${gy - 38}" width="20" height="38" class="fl3"/>
    ${alienMini(wx + 40, ty - 40)}
    <line x1="${fx}" y1="${gy}" x2="${tx}" y2="${ty}" class="ln ac thick" stroke-dasharray="${top ? '0' : '8 6'}"/>
    ${L(wx - 4, ty, wx - 4, gy, 'ln thin mu')}${T(wx - 18, (ty + gy) / 2, 'h', 'tx it')}
    ${L(fx, gy + 12, wx, gy + 12, 'ln thin mu')}${T((fx + wx) / 2, gy + 20, 'd', 'tx it sm')}
    ${T((fx + tx) / 2 - 16, (gy + ty) / 2 - 12, top || '?', 'tx ac b')}`);
}
function alienMini(x, y) {
  return `<g transform="translate(${x} ${y})"><ellipse cx="0" cy="8" rx="13" ry="12" class="alien"/><circle cx="0" cy="5" r="5" class="eye"/><circle cx="1" cy="5" r="2.2" class="pupil"/><line x1="-4" y1="-3" x2="-8" y2="-12" class="ln thin al"/><circle cx="-8" cy="-13" r="2.5" class="alien"/></g>`;
}
function genLeiter(lvl) {
  if (lvl === 1) {
    const [a, b, c] = R.pick([[3, 4, 5], [6, 8, 10], [5, 12, 13], [9, 12, 15], [8, 15, 17]]);
    const [h, d] = R.chance(.5) ? [b, a] : [a, b];
    if (h < d) return genLeiter(1);
    return choice(`Pi-Pi sitzt auf einem <b>${h} m</b> hohen Dach fest! Der Fuß der Leiter steht <b>${d} m</b> von der Wand entfernt. Welche Leiter reicht <b>genau</b> bis zur Dachkante?`,
      `${c} m`, [`${h + d} m`, `${c - 1} m`, `${c + 2} m`, `${h} m`, `${c + 1} m`, `${c + 3} m`], { visual: ladderSvg(h, d), explain: `Leiter = ${rt(`${h}² + ${d}²`)} = ${rt(h * h + d * d)} = <b>${c} m</b>`, hint: 'Die Leiter ist die Hypotenuse: c² = a² + b².', step: `${h}² + ${d}² = ${h * h} + ${d * d} = ${h * h + d * d}` });
  }
  if (lvl === 2) {
    const h = R.int(40, 110) / 10, d = R.int(10, 35) / 10, c = Math.round(Math.hypot(h, d) * 10) / 10;
    return choice(`Das Dach ist <b>${fmt(h)} m</b> hoch, der Leiterfuß steht <b>${fmt(d)} m</b> von der Wand. Welche Leiter passt (gerundet)?`,
      `${fmt(c)} m`, [`${fmt(h + d)} m`, `${fmt(c - .6)} m`, `${fmt(c + 1.3)} m`, `${fmt(Math.sqrt(h * h - d * d))} m`], { visual: ladderSvg(h, d), explain: `Leiter = ${rt(`${fmt(h)}² + ${fmt(d)}²`)} = ${rt(fmt(h * h + d * d))} ≈ <b>${fmt(c)} m</b>`, hint: 'c = √(a² + b²)', step: `${fmt(h)}² + ${fmt(d)}² = ${fmt(h * h + d * d)}` });
  }
  const c = R.int(50, 120) / 10, d = R.int(10, 30) / 10, h = Math.sqrt(c * c - d * d);
  return { type: 'input', q: `Eine <b>${fmt(c)} m</b> lange Leiter lehnt an der Wand, der Fuß steht <b>${fmt(d)} m</b> entfernt. Wie hoch reicht sie? (2 Dezimalen)`, visual: ladderSvg(h, d, fmt(c) + ' m'),
    fields: [round2(h, 'm')], explain: `h = ${rt(`${fmt(c)}² ${MINUS} ${fmt(d)}²`)} = ${rt(fmt(c * c - d * d))} ≈ <b>${fmt(h)} m</b>`, hint: 'Gesucht ist eine Kathete: a² = c² − b².', step: `${fmt(c)}² ${MINUS} ${fmt(d)}² = ${fmt(c * c - d * d)}` };
}

function boxSvg(a, b, c, mode) {
  const W = 150, H = 80, D = 45;
  let inner = `<path d="M40 90 L${40 + W} 90 L${40 + W} ${90 + H} L40 ${90 + H} Z" class="fl2"/><path d="M40 90 L${40 + D} ${90 - D * .7} L${40 + W + D} ${90 - D * .7} L${40 + W} 90 Z" class="fl3"/><path d="M${40 + W} 90 L${40 + W + D} ${90 - D * .7} L${40 + W + D} ${90 + H - D * .7} L${40 + W} ${90 + H} Z" class="fl1"/>
  <path d="M40 90 L${40 + W} 90 L${40 + W} ${90 + H} L40 ${90 + H} Z M40 90 L${40 + D} ${90 - D * .7} L${40 + W + D} ${90 - D * .7} L${40 + W} 90 M${40 + W} ${90 + H} L${40 + W + D} ${90 + H - D * .7} L${40 + W + D} ${90 - D * .7}" class="ln" fill="none"/>`;
  inner += T(40 + W / 2, 90 + H + 16, a, 'tx sm') + T(40 + W + D / 2 + 14, 90 + H - D * .35 + 4, b, 'tx sm', 'start') + T(26, 90 + H / 2, c, 'tx sm', 'end');
  if (mode === 'space') inner += `<line x1="40" y1="${90 + H}" x2="${40 + W + D}" y2="${90 - D * .7}" class="ln ac thick" stroke-dasharray="7 5"/>${T(40 + W / 2 + 12, 92 + H / 2 - 18, 'd = ?', 'tx ac b')}`;
  return svg(300, 200, inner);
}
function rectDiagSvg(a, b) {
  return svg(300, 180, `<rect x="40" y="30" width="200" height="110" class="fl2"/><rect x="40" y="30" width="200" height="110" class="ln" fill="none"/>
  <line x1="40" y1="140" x2="240" y2="30" class="ln ac thick" stroke-dasharray="7 5"/>${T(140, 158, a, 'tx sm')}${T(258, 85, b, 'tx sm', 'start')}${T(130, 72, 'd = ?', 'tx ac b')}`);
}
function pyramidSvg(a, ha) {
  return svg(300, 210, `<polygon points="50,170 190,170 250,130 150,30" class="fl2"/><polygon points="50,170 190,170 150,30" class="fl1"/>
  <path d="M50 170 L190 170 L250 130 M50 170 L150 30 L190 170 M150 30 L250 130" class="ln" fill="none"/><path d="M50 170 L110 130 L250 130" class="ln thin mu" stroke-dasharray="5 4"/>
  <line x1="150" y1="30" x2="150" y2="150" class="ln ac thick" stroke-dasharray="7 5"/><line x1="150" y1="30" x2="120" y2="170" class="ln thin"/>
  ${T(120, 190, a, 'tx sm')}${T(112, 120, ha, 'tx sm', 'end')}${T(160, 95, 'h = ?', 'tx ac b', 'start')}`);
}
function genDiagonale(lvl) {
  if (lvl === 1) {
    const a = R.int(3, 15), b = R.int(2, 12), d = Math.hypot(a, b);
    return { type: 'input', q: `Ein rechteckiges Raumschiff-Fenster ist <b>${a} dm</b> breit und <b>${b} dm</b> hoch. Wie lang ist die Diagonale? (2 Dezimalen)`, visual: rectDiagSvg(`${a} dm`, `${b} dm`),
      fields: [round2(d, 'dm')], explain: `d = ${rt(`${a}² + ${b}²`)} = ${rt(a * a + b * b)} ≈ <b>${fmt(d)} dm</b>`, hint: 'Die Diagonale teilt das Rechteck in zwei rechtwinklige Dreiecke.', step: `d² = ${a}² + ${b}² = ${a * a + b * b}` };
  }
  if (lvl === 2) {
    const a = R.int(3, 12), b = R.int(2, 10), c = R.int(2, 9), d = Math.sqrt(a * a + b * b + c * c);
    return { type: 'input', q: `Ein quaderförmiger Frachtraum ist <b>${a} m</b> lang, <b>${b} m</b> breit und <b>${c} m</b> hoch. Wie lang ist die <b>Raumdiagonale</b>? (2 Dezimalen)`, visual: boxSvg(`${a} m`, `${b} m`, `${c} m`, 'space'),
      fields: [round2(d, 'm')], explain: `d = ${rt(`${a}² + ${b}² + ${c}²`)} = ${rt(a * a + b * b + c * c)} ≈ <b>${fmt(d)} m</b>`, hint: 'Raumdiagonale: d = √(a² + b² + c²)', step: `${a}² + ${b}² + ${c}² = ${a * a + b * b + c * c}` };
  }
  const a = R.int(4, 16), ha = R.int(Math.ceil(a / 2) + 2, a + 8), h = Math.sqrt(ha * ha - (a / 2) ** 2);
  return { type: 'input', q: `Eine quadratische Pyramide (Raumstation) hat die Grundkante <b>a = ${a} m</b> und die Höhe der Seitenfläche <b>h<sub>a</sub> = ${ha} m</b>. Wie hoch ist die Pyramide? (2 Dezimalen)`, visual: pyramidSvg(`a = ${a} m`, `hₐ = ${ha} m`),
    fields: [round2(h, 'm')], explain: `h = ${rt(`h<sub>a</sub>² ${MINUS} (a/2)²`)} = ${rt(`${ha}² ${MINUS} ${fmt(a / 2)}²`)} = ${rt(fmt(ha * ha - (a / 2) ** 2))} ≈ <b>${fmt(h)} m</b>`,
    hint: 'Im Inneren steckt ein rechtwinkliges Dreieck aus h, a/2 und hₐ.', step: `a/2 = ${fmt(a / 2)} m. Dann h² = ${ha}² ${MINUS} ${fmt(a / 2)}².` };
}

function altitudeSvg(labels = true) {
  return svg(320, 200, `<polygon points="20,170 300,170 120,40" class="fl2"/><path d="M20 170 L300 170 L120 40 Z" class="ln" fill="none"/>
  <line x1="120" y1="40" x2="120" y2="170" class="ln ac" stroke-dasharray="6 4"/><polyline points="120,158 132,158 132,170" class="ln thin"/>
  ${labels ? T(120, 28, 'C', 'tx b') + T(10, 178, 'A', 'tx b') + T(310, 178, 'B', 'tx b') + T(62, 96, 'b', 'tx it') + T(220, 96, 'a', 'tx it') + T(70, 186, 'q', 'tx it sm') + T(210, 186, 'p', 'tx it sm') + T(130, 110, 'h', 'tx it ac', 'start') : ''}`);
}
function genFormeln(lvl, ctx) {
  const first = !ctx.didMatch;
  if (first || R.chance(.2)) {
    ctx.didMatch = true;
    return { type: 'match', q: 'Verbinde jede Formel mit ihrem Namen!', visual: altitudeSvg(), left: ['a² + b² = c²', 'h² = p · q', 'a² = c · p', 'b² = c · q'], right: ['Satz des Pythagoras', 'Höhensatz', 'Kathetensatz für a', 'Kathetensatz für b'],
      hint: 'p liegt unter a, q liegt unter b. Die Höhe h teilt c in p und q.' };
  }
  const t = lvl === 1 ? 0 : lvl === 2 ? R.int(0, 1) : R.int(1, 2);
  if (t === 0) {
    const [x, y, z] = R.pick([[3, 4, 5], [6, 8, 10], [5, 12, 13], [9, 12, 15], [8, 15, 17], [12, 16, 20], [7, 24, 25]]);
    return { type: 'input', q: `Im rechtwinkligen Dreieck ist <b>a = ${x} cm</b> und <b>b = ${y} cm</b>. Wie lang ist die Hypotenuse c?`, visual: altitudeSvg(), fields: [exact(z, 'cm')],
      explain: `c = ${rt(`${x}² + ${y}²`)} = ${rt(x * x + y * y)} = <b>${z} cm</b>`, hint: 'Satz des Pythagoras: c² = a² + b²', step: `${x}² + ${y}² = ${x * x + y * y}` };
  }
  if (t === 1) {
    const p = R.int(2, 16), q = R.int(2, 16), h = Math.sqrt(p * q);
    return { type: 'input', q: `Die Höhe teilt die Hypotenuse in <b>p = ${p} cm</b> und <b>q = ${q} cm</b>. Wie lang ist h? (2 Dezimalen)`, visual: altitudeSvg(), fields: [round2(h, 'cm')],
      explain: `Höhensatz: h² = p · q = ${p} · ${q} = ${p * q}, also h = ${rt(p * q)} ≈ <b>${fmt(h)} cm</b>`, hint: 'Höhensatz: h² = p · q', step: `h² = ${p} · ${q}` };
  }
  const c = R.int(8, 20), p = R.int(2, c - 2), a = Math.sqrt(c * p);
  return { type: 'input', q: `Die Hypotenuse ist <b>c = ${c} cm</b> lang, der Hypotenusenabschnitt <b>p = ${p} cm</b>. Berechne die Kathete a. (2 Dezimalen)`, visual: altitudeSvg(), fields: [round2(a, 'cm')],
    explain: `Kathetensatz: a² = c · p = ${c} · ${p} = ${c * p}, also a = ${rt(c * p)} ≈ <b>${fmt(a)} cm</b>`, hint: 'Kathetensatz: a² = c · p', step: `a² = ${c} · ${p}` };
}

/* =====================================================================
   PLANET 4 – Term-Schmiede
   ===================================================================== */
const VAR_ORDER = ['x²', 'xy', 'x', 'y', 'y²', ''];
function polyFromMap(m) { return poly(VAR_ORDER.map(v => [m[v] || 0, v])); }
function genOfen(lvl, ctx) {
  ctx.n = (ctx.n || 0) + 1;
  const vars = lvl === 1 ? ['x', ''] : lvl === 2 ? ['x²', 'x', ''] : ['x²', 'xy', 'x', ''];
  if (ctx.n % 2 === 1) {
    const items = vars.map(v => [R.nz(-9, 9), v]);
    while (items.length < 7) items.push([R.nz(-9, 9), R.pick(vars)]);
    const names = { 'x²': 'x²-Ofen', 'xy': 'xy-Ofen', 'x': 'x-Ofen', '': 'Zahlen-Ofen' };
    return { type: 'bins', q: 'Wirf gleichartige Terme in denselben Schmelzofen!', bins: vars.map(v => names[v]),
      items: R.shuffle(items).map(([c, v]) => ({ html: mono(c, v, true), bin: vars.indexOf(v) })), hint: 'Gleichartig heißt: gleiche Variable mit gleicher Hochzahl. x und x² sind verschieden!' };
  }
  const n = lvl === 1 ? 4 : lvl === 2 ? 5 : 6;
  const terms = vars.map(v => [R.nz(-9, 9), v]);
  while (terms.length < n) terms.push([R.nz(-9, 9), R.pick(vars)]);
  const sh = R.shuffle(terms);
  const m = {}; sh.forEach(([c, v]) => m[v] = (m[v] || 0) + c);
  if (Object.values(m).every(c => c === 0)) return genOfen(lvl, ctx);
  const correct = polyFromMap(m);
  const d1 = { ...m }; const fv = R.pick(vars); d1[fv] = (d1[fv] || 0) - 2 * sh.find(t => t[1] === fv)[0];
  const d2 = { ...m }; const fv2 = R.pick(vars); d2[fv2] = (d2[fv2] || 0) + R.pick([1, -1, 2]);
  const total = sh.reduce((s, t) => s + t[0], 0);
  return choice(`Schmelze zusammen: <div class="expr">${poly(sh)}</div>`, correct, [polyFromMap(d1), polyFromMap(d2), total ? mono(total, vars[0], true) : null],
    { fill: () => { const d = { ...m }; const v = R.pick(vars); d[v] = (d[v] || 0) + R.nz(-3, 3); return polyFromMap(d); },
      explain: vars.map(v => `${v || 'Zahlen'}: ${sh.filter(t => t[1] === v).map(t => fmt(t[0])).join(' + ').replace(/\+ −/g, MINUS + ' ')} = ${fmt(m[v] || 0)}`).join('<br>') + `<br>Ergebnis: <b>${correct}</b>`,
      hint: 'Nur gleichartige Terme zusammenrechnen. Das Vorzeichen gehört zum Term dahinter.', step: `Sammle zuerst alle ${vars[0]}-Terme.` });
}

function genKlammer(lvl) {
  if (lvl === 1) {
    const a = R.nz(-9, 9), b = R.nz(-6, 9), c = R.nz(-9, 9);
    const correct = lin(a * b, a * c);
    return choice(`Löse die Klammer auf: <div class="expr">${a === -1 ? MINUS : a === 1 ? '' : fmt(a)}(${lin(b, c)})</div>`, correct, [lin(a * b, c), lin(b, a * c), lin(a * b, -a * c)],
      { fill: () => lin(a * b + R.nz(-2, 2), a * c), explain: `Jeder Summand in der Klammer wird mit ${fmt(a)} multipliziert: ${fmt(a)} · ${mono(b, 'x', true)} = ${mono(a * b, 'x', true)} und ${fmt(a)} · ${fmt(c)} = ${fmt(a * c)}.<br><b>${correct}</b>`,
        hint: 'Der Faktor vor der Klammer wird mit JEDEM Glied multipliziert.', step: `${fmt(a)} · ${mono(b, 'x', true)} = ?` });
  }
  if (lvl === 2) {
    const a = R.nz(1, 4), b = R.nz(-7, 7), c = R.nz(1, 4), d = R.nz(-7, 7);
    const correct = px(a * c, a * d + b * c, b * d);
    return choice(`Multipliziere aus: <div class="expr">(${lin(a, b)}) · (${lin(c, d)})</div>`, correct,
      [px(a * c, 0, b * d), px(a * c, a * d - b * c, b * d), px(a * c, a * d + b * c, -b * d), px(a + c, a * d + b * c, b * d)],
      { fill: () => px(a * c, a * d + b * c + R.nz(-3, 3), b * d), explain: `Jedes Glied mal jedes Glied:<br>${mono(a, 'x', true)} · ${mono(c, 'x', true)} = ${mono(a * c, 'x²', true)}, ${mono(a, 'x', true)} · ${fmt(d)} = ${mono(a * d, 'x', true)}, ${fmt(b)} · ${mono(c, 'x', true)} = ${mono(b * c, 'x', true)}, ${fmt(b)} · ${fmt(d)} = ${fmt(b * d)}<br>= <b>${correct}</b>`,
        hint: 'Jedes Glied der ersten Klammer mal jedes Glied der zweiten Klammer – das sind 4 Produkte.', step: `Erstes Produkt: ${mono(a, 'x', true)} · ${mono(c, 'x', true)} = ${mono(a * c, 'x²', true)}` });
  }
  const k = R.int(2, 6); let p, q; do { p = R.int(1, 7); q = R.nz(-7, 7); } while (gcd(p, q) !== 1);
  const kx = `${k}x`;
  const correct = `${kx}(${lin(p, q)})`;
  return choice(`Hebe den größten gemeinsamen Faktor heraus: <div class="expr">${px(k * p, k * q, 0)}</div>`, correct,
    [`${kx}(${lin(p, k * q)})`, `${k}(${lin(p, q)})`, `x(${lin(k * p, q)})`, `${kx}(${poly([[p, 'x²'], [q, '']])})`],
    { fill: () => `${kx}(${lin(p + R.nz(-2, 2), q)})`, explain: `Beide Glieder enthalten ${kx}: ${mono(k * p, 'x²', true)} = ${kx} · ${mono(p, 'x', true)} und ${mono(k * q, 'x', true)} = ${kx} · ${fmt(q)}.<br><b>${correct}</b><br>Probe: Ausmultiplizieren ergibt wieder ${px(k * p, k * q, 0)}.`,
      hint: 'Suche die größte Zahl und die höchste x-Potenz, die in beiden Gliedern steckt. Mach am Ende die Probe!', step: `Der gemeinsame Faktor ist ${kx}.` });
}

function binomPair(lvl, used) {
  for (let g = 0; g < 50; g++) {
    const t = R.int(0, 2), a = R.int(1, 9);
    let L, Rr;
    if (lvl === 1) {
      if (t === 0) { L = `(x + ${a})²`; Rr = px(1, 2 * a, a * a); }
      else if (t === 1) { L = `(x ${MINUS} ${a})²`; Rr = px(1, -2 * a, a * a); }
      else { L = `(x + ${a})(x ${MINUS} ${a})`; Rr = px(1, 0, -a * a); }
    } else if (lvl === 2) {
      const b = R.int(1, 3), aa = R.int(1, 6);
      const bx = b === 1 ? 'x' : `${b}x`;
      if (t === 0) { L = `(${bx} + ${aa})²`; Rr = px(b * b, 2 * aa * b, aa * aa); }
      else if (t === 1) { L = `(${bx} ${MINUS} ${aa})²`; Rr = px(b * b, -2 * aa * b, aa * aa); }
      else { L = `(${bx} + ${aa})(${bx} ${MINUS} ${aa})`; Rr = px(b * b, 0, -aa * aa); }
    } else {
      const b = R.int(1, 3), c = R.int(1, 4);
      const bx = b === 1 ? 'x' : `${b}x`, cy = c === 1 ? 'y' : `${c}y`;
      if (t === 0) { L = `(${bx} + ${cy})²`; Rr = poly([[b * b, 'x²'], [2 * b * c, 'xy'], [c * c, 'y²']]); }
      else if (t === 1) { L = `(${bx} ${MINUS} ${cy})²`; Rr = poly([[b * b, 'x²'], [-2 * b * c, 'xy'], [c * c, 'y²']]); }
      else { L = `(${bx} + ${cy})(${bx} ${MINUS} ${cy})`; Rr = poly([[b * b, 'x²'], [-c * c, 'y²']]); }
    }
    if (!used.has(L) && !used.has(Rr)) { used.add(L); used.add(Rr); return [L, Rr]; }
  }
  return null;
}
function genBinom(lvl) {
  const n = lvl === 1 ? 4 : lvl === 2 ? 5 : 6, used = new Set(), pairs = [];
  while (pairs.length < n) { const p = binomPair(lvl, used); if (!p) break; pairs.push(p); }
  return { type: 'memory', q: 'Finde die Paare: Binom und ausmultiplizierte Form!', pairs,
    hint: '(a + b)² = a² + 2ab + b² · (a − b)² = a² − 2ab + b² · (a + b)(a − b) = a² − b²' };
}

function genBruch(lvl) {
  const t = lvl === 1 ? R.int(0, 1) : lvl === 2 ? R.int(2, 3) : 4;
  if (t === 0) {
    const a = R.int(1, 9), b = R.int(1, 9);
    return choice(`Addiere: <div class="expr">${frac(a, 'x')} + ${frac(b, 'x')}</div>`, frac(a + b, 'x'), [frac(a + b, '2x'), frac(a + b, 'x²'), frac(a * b, 'x'), frac(a + b + 1, 'x'), frac(a + b, 'x + x')],
      { explain: `Gleicher Nenner: nur die Zähler addieren. ${a} + ${b} = ${a + b} → <b>${frac(a + b, 'x')}</b>`, hint: 'Bei gleichem Nenner werden nur die Zähler addiert – der Nenner bleibt!' });
  }
  if (t === 1) {
    const a = R.int(5, 12), b = R.int(1, a - 1);
    return choice(`Subtrahiere: <div class="expr">${frac(`${a}y`, 7)} ${MINUS} ${frac(`${b}y`, 7)}</div>`, frac(`${a - b}y`, 7), [frac(`${a - b}y`, 0 + 14), frac(`${a + b}y`, 7), frac(`${a - b}`, 7)],
      { explain: `Gleicher Nenner 7: ${a}y ${MINUS} ${b}y = ${a - b}y → <b>${frac(`${a - b}y`, 7)}</b>`, hint: 'Gleicher Nenner: Zähler subtrahieren, Nenner bleibt.' });
  }
  if (t === 2) {
    const a = R.int(1, 9), b = R.int(1, 9);
    return choice(`Addiere: <div class="expr">${frac(a, 'x')} + ${frac(b, '2x')}</div>`, frac(2 * a + b, '2x'), [frac(a + b, '3x'), frac(a + b, '2x'), frac(a + 2 * b, '2x'), frac(2 * a + b, 'x'), frac(2 * a + b, '3x')],
      { explain: `Gemeinsamer Nenner 2x: ${frac(a, 'x')} = ${frac(2 * a, '2x')}.<br>${frac(2 * a, '2x')} + ${frac(b, '2x')} = <b>${frac(2 * a + b, '2x')}</b>`, hint: 'Erweitere den ersten Bruch mit 2, damit beide Nenner 2x sind.', step: `${frac(a, 'x')} = ${frac(2 * a, '2x')}` });
  }
  if (t === 3) {
    let a, b; do { a = R.int(1, 9); b = R.int(2, 9); } while (gcd(a, b) !== 1);
    return choice(`Multipliziere und kürze: <div class="expr">${frac(a, 'x')} · ${frac('x²', b)}</div>`, frac(`${a === 1 ? '' : a}x`, b), [frac(a, `${b}x`), frac(`${a}x³`, b), frac(`${a + 1}x`, b)],
      { explain: `Zähler mal Zähler, Nenner mal Nenner: ${frac(`${a}x²`, `${b}x`)}. Kürzen durch x → <b>${frac(`${a === 1 ? '' : a}x`, b)}</b>`, hint: 'Zähler · Zähler und Nenner · Nenner, dann kürzen.' });
  }
  const m = R.int(1, 12), n = R.int(1, 12);
  const correct = frac(lin(1, 3 * m + 2 * n), 6);
  return choice(`Subtrahiere: <div class="expr">${frac(lin(1, m), 2)} ${MINUS} ${frac(lin(1, -n), 3)}</div>`, correct, [frac(lin(1, 3 * m - 2 * n), 6), frac(lin(5, 3 * m + 2 * n), 6), frac(lin(1, m + n), 6), frac(lin(1, 3 * m + 2 * n), 5), frac(lin(5, 3 * m - 2 * n), 6)],
    { explain: `Gemeinsamer Nenner 6: ${frac(`3(${lin(1, m)})`, 6)} ${MINUS} ${frac(`2(${lin(1, -n)})`, 6)} = ${frac(`${lin(3, 3 * m)} ${MINUS} ${lin(2, -2 * n).replace(/^/, '(') + ')'}`, 6)}<br>= <b>${correct}</b>. Achtung: Das Minus vor dem Bruchstrich gilt für den ganzen Zähler!`,
      hint: 'Erweitere auf den Nenner 6 und setze den zweiten Zähler in Klammern.', step: `${frac(lin(1, m), 2)} = ${frac(lin(3, 3 * m), 6)} und ${frac(lin(1, -n), 3)} = ${frac(lin(2, -2 * n), 6)}` });
}

function genFehler(lvl, ctx) {
  const t = R.int(0, 4);
  let lines, wrong, fix;
  if (t === 0) { const a = R.int(5, 9), b = R.int(2, a - 1), c = R.int(2, 9); lines = [`${a}x ${MINUS} (${b}x ${MINUS} ${c})`, `= ${a}x ${MINUS} ${b}x ${MINUS} ${c}`, `= ${a - b}x ${MINUS} ${c}`]; wrong = 1; fix = `Richtig wäre: = ${a}x ${MINUS} ${b}x + ${c}. Ein Minus vor der Klammer dreht ALLE Vorzeichen um.`; }
  else if (t === 1) { const a = R.int(5, 9), b = R.int(2, a - 1), c = R.int(2, 9); lines = [`${a}x ${MINUS} (${b}x ${MINUS} ${c})`, `= ${a}x ${MINUS} ${b}x + ${c}`, `= ${a + b}x + ${c}`]; wrong = 2; fix = `Richtig wäre: = ${a - b}x + ${c}, denn ${a}x ${MINUS} ${b}x = ${a - b}x.`; }
  else if (t === 2) { const k = R.int(2, 9); lines = [`(x + ${k})² ${MINUS} x²`, `= x² + ${k * k} ${MINUS} x²`, `= ${k * k}`]; wrong = 1; fix = `Richtig: (x + ${k})² = x² + ${2 * k}x + ${k * k}. Das Ergebnis ist ${2 * k}x + ${k * k}.`; }
  else if (t === 3) { const m = R.int(2, 7), n = R.int(2, 8), p = R.int(1, 9); lines = [`${m}(x + ${n}) + ${p}`, `= ${m}x + ${n} + ${p}`, `= ${m}x + ${n + p}`]; wrong = 1; fix = `Richtig: ${m} · ${n} = ${m * n}, also ${m}x + ${m * n} + ${p} = ${m}x + ${m * n + p}.`; }
  else { const a = R.int(2, 5), b = R.int(2, 5), e = R.int(2, 4), f = R.int(2, 5); lines = [`${a}x<sup>${e}</sup> · ${b}x<sup>${f}</sup>`, `= ${a} · ${b} · x<sup>${e}</sup> · x<sup>${f}</sup>`, `= ${a * b}x<sup>${e * f}</sup>`]; wrong = 2; fix = `Richtig: x<sup>${e}</sup> · x<sup>${f}</sup> = x<sup>${e + f}</sup>. Ergebnis: ${a * b}x<sup>${e + f}</sup>.`; }
  return { type: 'steps', q: 'Der Rechenroboter hat einen Fehler gemacht! Tippe auf die <b>erste falsche Zeile</b>.', lines, wrong, explain: fix, hint: 'Rechne jede Zeile selbst nach. Achte besonders auf Vorzeichen und Hochzahlen.' };
}

/* =====================================================================
   PLANET 5 – Waagen-Welt
   ===================================================================== */
function genWaage(lvl) {
  const x0 = lvl === 1 ? R.int(1, 12) : R.nz(-9, 9);
  const a = R.int(2, 9);
  const c = lvl === 1 ? 0 : R.int(1, a - 1);
  const t = { x0, a, c, bracket: null };
  if (lvl === 3) { t.bracket = R.nz(-6, 6); t.b = a * t.bracket; }
  else t.b = R.nz(-15, 15);
  t.d = a * x0 + t.b - c * x0;
  return { type: 'balance', q: 'Bring die Waage ins Gleichgewicht und stelle <b>x</b> frei! Wähle immer den besten nächsten Schritt.', state: t,
    hint: 'Was du links machst, musst du auch rechts machen! Zuerst die x auf eine Seite, dann die Zahlen, dann dividieren.' };
}
function balanceMoves(s) {
  const { a, b, c, d } = s;
  const pm = n => (n < 0 ? '+ ' + Math.abs(n) : MINUS + ' ' + n);
  if (s.bracket != null) return { correct: 'Klammer auflösen', apply: () => ({ ...s, bracket: null }), why: `${a} mal jedes Glied in der Klammer: ${a}(x ${signed(s.bracket).trim()}) = ${lin(a, b)}.`,
    wrong: [`Nur links ${pm(s.bracket)}`, `Beide Seiten · 0`, `Nur rechts : ${a}`] };
  if (c !== 0) return { correct: `Beide Seiten ${MINUS} ${c === 1 ? '' : c}x`, apply: () => ({ ...s, a: a - c, c: 0 }), why: `Damit verschwinden die x auf der rechten Seite.`,
    wrong: [`Nur rechts ${MINUS} ${c === 1 ? '' : c}x`, `Beide Seiten + ${c === 1 ? '' : c}x`, `Beide Seiten · 0`] };
  if (b !== 0) return { correct: `Beide Seiten ${pm(b)}`, apply: () => ({ ...s, b: 0, d: d - b }), why: `So bleibt links nur noch ${mono(a, 'x', true)} stehen.`,
    wrong: [`Nur links ${pm(b)}`, `Beide Seiten ${pm(-b)}`, `Beide Seiten : ${Math.abs(b) === 1 ? 2 : Math.abs(b)}`].filter(w => w !== `Beide Seiten ${pm(b)}`) };
  if (a !== 1) return { correct: `Beide Seiten : ${a}`, apply: () => ({ ...s, a: 1, d: d / a }), why: `${mono(a, 'x', true)} : ${a} = x.`,
    wrong: [`Beide Seiten ${MINUS} ${a}`, `Nur links : ${a}`, `Beide Seiten · ${a}`] };
  return null;
}
const balanceSides = s => [s.bracket != null ? `${s.a === 1 ? '' : s.a}(x${signed(s.bracket)})` : lin(s.a, s.b), lin(s.c, s.d)];

const KINO = [
  () => { const x = R.int(3, 20), k = R.int(2, 5), S = x * (k + 1); return { story: `Zorp hat x Kristalle. Seine Schwester Blip hat ${k}-mal so viele. Zusammen haben sie <b>${S}</b> Kristalle.`, ask: 'Wie viele Kristalle hat Zorp?', eq: `x + ${k}x = ${S}`, wrong: [`x + ${k} = ${S}`, `${k}x = ${S}`, `x · ${k}x = ${S}`], x, unit: 'Kristalle' }; },
  () => { const x = R.int(2, 15), m = R.int(2, 6), n = R.int(1, 15), r = m * x + n; return { story: `Pi-Pi denkt sich eine Zahl, multipliziert sie mit ${m} und addiert ${n}. Heraus kommt <b>${r}</b>.`, ask: 'Welche Zahl hat Pi-Pi gedacht?', eq: `${m}x + ${n} = ${r}`, wrong: [`${m}(x + ${n}) = ${r}`, `x + ${m} + ${n} = ${r}`, `${m}x ${MINUS} ${n} = ${r}`], x, unit: '' }; },
  () => { const x = R.int(4, 20), e = R.int(2, 10), U = 2 * x + 2 * (x + e); return { story: `Eine rechteckige Landebahn ist ${e} m länger als breit. Ihr Umfang beträgt <b>${U} m</b>.`, ask: 'Wie breit ist die Landebahn?', eq: `2x + 2(x + ${e}) = ${U}`, wrong: [`x + (x + ${e}) = ${U}`, `2x + ${e} = ${U}`, `x · (x + ${e}) = ${U}`], x, unit: 'm' }; },
  () => { const x = R.int(5, 40), S = 3 * x + 3; return { story: `Drei aufeinanderfolgende ganze Zahlen ergeben zusammen <b>${S}</b>.`, ask: 'Wie heißt die kleinste Zahl?', eq: `x + (x + 1) + (x + 2) = ${S}`, wrong: [`x + 2x + 3x = ${S}`, `x + 1 + 2 = ${S}`, `3x + 1 = ${S}`], x, unit: '' }; },
  () => { const x = R.int(6, 16), e = R.int(20, 32), S = 2 * x + e; return { story: `Die Mama von Blip ist ${e} Jahre älter als Blip. Zusammen sind sie <b>${S}</b> Jahre alt.`, ask: 'Wie alt ist Blip?', eq: `x + (x + ${e}) = ${S}`, wrong: [`x + ${e} = ${S}`, `x + ${e}x = ${S}`, `2x = ${S} + ${e}`], x, unit: 'Jahre' }; },
  () => { const x = R.int(4, 12), e = R.int(2, 6), S = 3 * x + 2 * (x + e); return { story: `Im Alien-Kino kostet ein Erwachsenen-Ticket ${e} € mehr als ein Kinder-Ticket. Für 3 Kinder und 2 Erwachsene zahlt die Familie <b>${S} €</b>.`, ask: 'Wie viel kostet ein Kinder-Ticket?', eq: `3x + 2(x + ${e}) = ${S}`, wrong: [`3x + 2x + ${e} = ${S}`, `3x + 2x = ${S} + ${e}`, `5(x + ${e}) = ${S}`], x, unit: '€' }; }
];
function genKino(lvl, ctx) {
  const i = unused(ctx, [0, 1, 2, 3, 4, 5]);
  const s = KINO[i]();
  if (lvl === 1) return choice(`<span class="story">🎬 ${s.story}</span><br>Welche Gleichung passt?`, s.eq, s.wrong,
    { explain: `<b>${s.eq}</b> → x = ${s.x}${s.unit ? ' ' + s.unit : ''}`, hint: 'Überlege zuerst: Wofür steht x? Dann übersetze Satz für Satz.' });
  return { type: 'input', q: `<span class="story">🎬 ${s.story}</span><br><b>${s.ask}</b>`, fields: [exact(s.x, s.unit)],
    explain: `Gleichung: <b>${s.eq}</b><br>Lösung: x = <b>${s.x}</b>${s.unit ? ' ' + s.unit : ''}`, hint: 'Stelle zuerst eine Gleichung auf und löse sie dann.', step: `Die Gleichung lautet: ${s.eq}` };
}

function genEnergie(lvl) {
  if (lvl === 1) {
    const n = R.int(2, 6), k = R.int(5, 40) * 10, P = n * k; let m; do { m = R.int(2, 12); } while (m === n);
    return { type: 'input', q: `<b>${n}</b> Solarpaneele liefern zusammen <b>${P} W</b>. Wie viel Leistung liefern <b>${m}</b> gleiche Paneele?`, fields: [exact(m * k, 'W')],
      explain: `1 Paneel: ${P} : ${n} = ${k} W.<br>${m} Paneele: ${m} · ${k} = <b>${m * k} W</b>`, hint: 'Direkt proportional: Berechne zuerst, wie viel EIN Paneel liefert.', step: `${P} : ${n} = ?` };
  }
  if (lvl === 2) {
    if (R.chance(.5)) {
      const n = R.pick([2, 3, 4, 6]), h = R.pick([12, 24, 36, 48]); let m; do { m = R.pick([2, 3, 4, 6, 8, 12]); } while (m === n || (n * h) % m);
      return { type: 'input', q: `<b>${n}</b> Reparatur-Roboter brauchen <b>${h} Stunden</b> für ein Raumschiff. Wie lange brauchen <b>${m}</b> gleich schnelle Roboter?`, fields: [exact(n * h / m, 'h')],
        explain: `Indirekt proportional: Mehr Roboter → weniger Zeit.<br>1 Roboter: ${n} · ${h} = ${n * h} h. ${m} Roboter: ${n * h} : ${m} = <b>${fmt(n * h / m)} h</b>`, hint: 'Indirekt proportional: Doppelt so viele Roboter brauchen halb so lang.', step: `Ein einzelner Roboter bräuchte ${n} · ${h} Stunden.` };
    }
    let a, b, c; do { a = R.int(2, 12); b = R.int(2, 12); c = R.int(2, 12); } while ((a * b) % c);
    return { type: 'input', q: `Löse die Verhältnisgleichung: <div class="expr">x : ${a} = ${b} : ${c}</div>`, fields: [exact(a * b / c, '', 'x =')],
      explain: `Produkt der Außenglieder = Produkt der Innenglieder: x · ${c} = ${a} · ${b} = ${a * b}<br>x = ${a * b} : ${c} = <b>${fmt(a * b / c)}</b>`, hint: 'Außenglieder mal = Innenglieder mal.', step: `x · ${c} = ${a} · ${b}` };
  }
  const [a, b] = R.pick([[2, 3], [3, 4], [2, 5], [3, 6], [4, 6], [2, 6], [4, 5]]);
  const l = a * b / gcd(a, b), x = l * R.int(1, 4), c = x / a + x / b;
  return { type: 'input', q: `Löse die Bruchgleichung: <div class="expr">${frac('x', a)} + ${frac('x', b)} = ${fmt(c)}</div>`, fields: [exact(x, '', 'x =')],
    explain: `Mal ${l} (gemeinsamer Nenner): ${l / a}x + ${l / b}x = ${fmt(c * l)}<br>${l / a + l / b}x = ${fmt(c * l)} → x = <b>${x}</b>`, hint: 'Multipliziere die ganze Gleichung mit dem gemeinsamen Nenner.', step: `Gemeinsamer Nenner: ${l}` };
}

/* =====================================================================
   PLANET 6 – Kreis-Karussell
   ===================================================================== */
const CX = 150, CY = 120, CR = 85;
const cp = (ang, r = CR) => [CX + r * Math.cos(ang), CY + r * Math.sin(ang)];
const pt = p => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`;
function circleSvg(what) {
  const a = Math.random() * PI * 2;
  let base = `<circle cx="${CX}" cy="${CY}" r="${CR}" class="ln mu"/>`, hl = '';
  const dot = (p, cls = 'dotc') => `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="5" class="${cls}"/>`;
  const C = [CX, CY];
  switch (what) {
    case 'Mittelpunkt': hl = `<circle cx="${CX}" cy="${CY}" r="9" class="dota"/>`; break;
    case 'Radius': hl = L(CX, CY, ...cp(a), 'ln ac thick') + dot(C); break;
    case 'Durchmesser': { const p = cp(a), q = cp(a + PI); hl = L(...p, ...q, 'ln ac thick') + dot(C); break; }
    case 'Sehne': { const p = cp(a), q = cp(a + 1.7); hl = L(...p, ...q, 'ln ac thick') + dot(C); break; }
    case 'Sekante': { const p = cp(a), q = cp(a + 2); const dx = q[0] - p[0], dy = q[1] - p[1], l = Math.hypot(dx, dy); hl = L(p[0] - dx / l * 45, p[1] - dy / l * 45, q[0] + dx / l * 45, q[1] + dy / l * 45, 'ln ac thick') + dot(p, 'dota') + dot(q, 'dota') + dot(C); break; }
    case 'Tangente': { const p = cp(a), dx = -Math.sin(a), dy = Math.cos(a); hl = L(p[0] - dx * 120, p[1] - dy * 120, p[0] + dx * 120, p[1] + dy * 120, 'ln ac thick') + dot(p, 'dota') + dot(C); break; }
    case 'Passante': { const p = cp(a, CR + 22), dx = -Math.sin(a), dy = Math.cos(a); hl = L(p[0] - dx * 130, p[1] - dy * 130, p[0] + dx * 130, p[1] + dy * 130, 'ln ac thick') + dot(C); break; }
    case 'Kreisbogen': { const p = cp(a), q = cp(a + 1.5); hl = `<path d="M${pt(p)} A${CR} ${CR} 0 0 1 ${pt(q)}" class="ln ac xthick"/>` + dot(C); break; }
    case 'Kreisausschnitt (Sektor)': { const p = cp(a), q = cp(a + 1.6); hl = `<path d="M${CX} ${CY} L${pt(p)} A${CR} ${CR} 0 0 1 ${pt(q)} Z" class="fla"/>` + dot(C); break; }
    case 'Kreisabschnitt (Segment)': { const p = cp(a), q = cp(a + 2.1); hl = `<path d="M${pt(p)} A${CR} ${CR} 0 0 1 ${pt(q)} Z" class="fla"/>` + dot(C); break; }
    case 'Kreisring': hl = `<path d="M${CX - CR} ${CY} a${CR} ${CR} 0 1 0 ${2 * CR} 0 a${CR} ${CR} 0 1 0 ${-2 * CR} 0 Z M${CX - 45} ${CY} a45 45 0 1 0 90 0 a45 45 0 1 0 -90 0 Z" fill-rule="evenodd" class="fla"/><circle cx="${CX}" cy="${CY}" r="45" class="ln mu"/>` + dot(C); break;
  }
  return svg(300, 240, base + hl);
}
const KREIS_BEGRIFFE = [
  ['Mittelpunkt', 1, 'Der Punkt in der Mitte – alle Kreispunkte sind gleich weit von ihm entfernt.'],
  ['Radius', 1, 'Verbindet den Mittelpunkt mit einem Punkt auf der Kreislinie.'],
  ['Durchmesser', 1, 'Geht durch den Mittelpunkt von Rand zu Rand: d = 2r.'],
  ['Sehne', 1, 'Verbindet zwei Punkte der Kreislinie, geht aber nicht durch den Mittelpunkt.'],
  ['Tangente', 1, 'Berührt den Kreis in genau einem Punkt und steht dort normal auf den Radius.'],
  ['Kreisbogen', 1, 'Ein Stück der Kreislinie.'],
  ['Sekante', 2, 'Eine Gerade, die den Kreis in zwei Punkten schneidet.'],
  ['Kreisausschnitt (Sektor)', 2, 'Ein „Tortenstück“: begrenzt von zwei Radien und einem Bogen.'],
  ['Kreisring', 2, 'Die Fläche zwischen zwei Kreisen mit gleichem Mittelpunkt.'],
  ['Passante', 3, 'Eine Gerade, die den Kreis gar nicht trifft.'],
  ['Kreisabschnitt (Segment)', 3, 'Die Fläche zwischen einer Sehne und dem Kreisbogen.']
];
function genBegriffe(lvl, ctx) {
  const pool = KREIS_BEGRIFFE.filter(k => k[1] <= lvl);
  const it = unused(ctx, pool, k => k[0]);
  return choice('Wie heißt das leuchtende Teil?', it[0], R.shuffle(pool.filter(k => k[0] !== it[0]).map(k => k[0])),
    { visual: circleSvg(it[0]), explain: `<b>${it[0]}</b>: ${it[2]}`, hint: 'Achte darauf, ob die Linie durch den Mittelpunkt geht oder über den Kreis hinausreicht.' });
}

function pizzaSvg(alpha) {
  const a0 = -PI / 2, a1 = a0 + alpha * PI / 180, mid = (a0 + a1) / 2, off = 14;
  const ox = Math.cos(mid) * off, oy = Math.sin(mid) * off, r = 80;
  const P = a => [CX + r * Math.cos(a), CY + r * Math.sin(a)];
  const large = alpha > 180 ? 1 : 0;
  let tops = '';
  for (let i = 0; i < 14; i++) { const ang = Math.random() * PI * 2, rr = 15 + Math.random() * 55; tops += `<circle cx="${(CX + rr * Math.cos(ang)).toFixed(1)}" cy="${(CY + rr * Math.sin(ang)).toFixed(1)}" r="${(4 + Math.random() * 4).toFixed(1)}" class="topping"/>`; }
  const sliceInRest = alpha >= 360;
  return svg(300, 240, `<defs><clipPath id="pz"><circle cx="${CX}" cy="${CY}" r="${r}"/></clipPath></defs>
    <circle cx="${CX}" cy="${CY}" r="${r + 6}" class="crust"/><circle cx="${CX}" cy="${CY}" r="${r}" class="cheese"/><g clip-path="url(#pz)">${tops}</g>
    ${sliceInRest ? '' : `<g transform="translate(${ox.toFixed(1)} ${oy.toFixed(1)})"><path d="M${CX} ${CY} L${pt(P(a0))} A${r} ${r} 0 ${large} 1 ${pt(P(a1))} Z" class="slice"/></g>`}
    ${T(CX + Math.cos(mid) * 34 + ox, CY + Math.sin(mid) * 34 + oy, `${alpha}°`, 'tx b dark')}
    ${L(CX, CY, CX + r, CY, 'ln thin dark')}${T(CX + r / 2, CY + 12, 'r', 'tx it dark')}`);
}
function genPizza(lvl) {
  const r = R.int(10, 22);
  if (lvl === 1) {
    const alpha = R.pick([45, 60, 90, 120, 180, 270, 30]), A = r * r * PI * alpha / 360;
    return { type: 'input', q: `Ein Alien bestellt ein Pizzastück mit <b>α = ${alpha}°</b>. Die Pizza hat <b>r = ${r} cm</b>. Wie groß ist die Fläche des Stücks? (2 Dezimalen)`, visual: pizzaSvg(alpha), fields: [piF(A, 'cm²')],
      explain: `A = r² · π · ${frac('α', 360)} = ${r}² · π · ${frac(alpha, 360)} ≈ <b>${fmt(A)} cm²</b>`, hint: 'Kreisausschnitt: A = r²π · α/360', step: `Ganze Pizza: ${r}² · π ≈ ${fmt(r * r * PI)} cm². Davon ${alpha}/360.` };
  }
  if (lvl === 2) {
    const alpha = R.int(2, 22) * 15, b = 2 * r * PI * alpha / 360;
    return { type: 'input', q: `Wie lang ist der knusprige Rand (Kreisbogen) eines Stücks mit <b>α = ${alpha}°</b> bei <b>r = ${r} cm</b>? (2 Dezimalen)`, visual: pizzaSvg(alpha), fields: [piF(b, 'cm')],
      explain: `b = 2rπ · ${frac('α', 360)} = 2 · ${r} · π · ${frac(alpha, 360)} ≈ <b>${fmt(b)} cm</b>`, hint: 'Kreisbogen: b = 2rπ · α/360', step: `Ganzer Umfang: 2 · ${r} · π ≈ ${fmt(2 * r * PI)} cm` };
  }
  const alpha = R.int(4, 60) * 5, A = Math.round(r * r * PI * alpha / 360 * 100) / 100;
  return { type: 'input', q: `Ein Pizzastück hat <b>A = ${fmt(A)} cm²</b>, die Pizza hat <b>r = ${r} cm</b>. Wie groß ist der Winkel α? (ganze Grad)`, visual: pizzaSvg(alpha), fields: [{ answer: alpha, tol: 1, unit: '°', label: 'α =' }],
    explain: `α = ${frac('A · 360', 'r² · π')} = ${frac(`${fmt(A)} · 360`, `${r}² · π`)} ≈ <b>${alpha}°</b>`, hint: 'Forme A = r²π · α/360 nach α um.', step: `α = A · 360 : (r² · π)` };
}

function ringSvg(Rr, r) {
  return svg(300, 240, `<path d="M${CX - 95} ${CY} a95 95 0 1 0 190 0 a95 95 0 1 0 -190 0 Z M${CX - 45} ${CY} a45 45 0 1 0 90 0 a45 45 0 1 0 -90 0 Z" fill-rule="evenodd" class="donut"/>
  <path d="M${CX - 95} ${CY} a95 95 0 1 0 190 0 a95 95 0 1 0 -190 0 Z M${CX - 45} ${CY} a45 45 0 1 0 90 0 a45 45 0 1 0 -90 0 Z" fill-rule="evenodd" class="ln" fill="none"/>
  ${L(CX, CY, CX + 95 * Math.cos(-.5), CY + 95 * Math.sin(-.5), 'ln thin')}${T(CX + 70, CY - 50, Rr, 'tx sm', 'start')}
  ${L(CX, CY, CX - 45, CY, 'ln thin ac')}${T(CX - 22, CY + 12, r, 'tx sm ac')}<circle cx="${CX}" cy="${CY}" r="3" class="dotc"/>`);
}
function genDonut(lvl) {
  if (lvl === 1) {
    const r = R.chance(.7) ? R.int(2, 30) : R.int(15, 95) / 10, useD = R.chance(.5), A = r * r * PI;
    return { type: 'input', q: `${r < 6 ? R.pick(['Ein runder Keks', 'Eine Münze aus Mondsilber', 'Ein Knopf']) : R.pick(['Eine Pizza', 'Ein runder Tisch', 'Ein Trampolin', 'Ein Landeplatz für Ufos'])} hat ${useD ? `den Durchmesser <b>d = ${fmt(2 * r)} cm</b>` : `den Radius <b>r = ${fmt(r)} cm</b>`}. Berechne den Flächeninhalt. (2 Dezimalen)`, visual: ringSvg(`r = ${useD ? '?' : fmt(r) + ' cm'}`, ''), fields: [piF(A, 'cm²')],
      explain: `${useD ? `r = d : 2 = ${fmt(r)} cm.<br>` : ''}A = r² · π = ${fmt(r)}² · π ≈ <b>${fmt(A)} cm²</b>`, hint: 'Kreisfläche: A = r² · π', step: useD ? `Zuerst den Radius: ${fmt(2 * r)} : 2 = ${fmt(r)}` : `${fmt(r)}² = ${fmt(r * r)}` };
  }
  const Rr = R.int(5, 20), r = R.int(2, Rr - 2);
  if (lvl === 2) {
    const A = PI * (Rr * Rr - r * r);
    return { type: 'input', q: `Ein Weltraum-Donut hat außen <b>R = ${Rr} cm</b> und innen <b>r = ${r} cm</b>. Wie groß ist seine Fläche (Kreisring)? (2 Dezimalen)`, visual: ringSvg(`R = ${Rr}`, `r = ${r}`), fields: [piF(A, 'cm²')],
      explain: `A = (R² ${MINUS} r²) · π = (${Rr * Rr} ${MINUS} ${r * r}) · π = ${Rr * Rr - r * r} · π ≈ <b>${fmt(A)} cm²</b>`, hint: 'Kreisring = großer Kreis minus kleiner Kreis: A = (R² − r²) · π', step: `${Rr}² ${MINUS} ${r}² = ${Rr * Rr - r * r}` };
  }
  const A = Math.round(PI * (Rr * Rr - r * r) * 100) / 100;
  return { type: 'input', q: `Ein Donut hat außen <b>R = ${Rr} cm</b> und die Ringfläche <b>A = ${fmt(A)} cm²</b>. Wie groß ist der Innenradius r? (2 Dezimalen)`, visual: ringSvg(`R = ${Rr}`, 'r = ?'), fields: [{ answer: r, tol: .06, unit: 'cm', label: 'r =' }],
    explain: `R² ${MINUS} r² = A : π = ${fmt(A / PI)}<br>r² = ${Rr * Rr} ${MINUS} ${fmt(A / PI)} = ${fmt(Rr * Rr - A / PI)}<br>r ≈ <b>${fmt(r)} cm</b>`, hint: 'Teile zuerst durch π, dann löse nach r² auf.', step: `A : π = ${fmt(A / PI)} = R² ${MINUS} r²` };
}

function orbitSvg(lbl) {
  return svg(300, 230, `<circle cx="150" cy="115" r="90" class="ln mu" stroke-dasharray="6 6"/><circle cx="150" cy="115" r="26" class="planetfill"/>
  ${L(150, 115, 150 + 90 * Math.cos(-.7), 115 + 90 * Math.sin(-.7), 'ln thin ac')}${T(195, 100, lbl, 'tx sm ac', 'start')}
  <g transform="translate(${150 + 90 * Math.cos(-.7)} ${115 + 90 * Math.sin(-.7)}) rotate(-40)"><rect x="-9" y="-5" width="18" height="10" rx="2" class="sat"/><rect x="-24" y="-3" width="12" height="6" class="fl1"/><rect x="12" y="-3" width="12" height="6" class="fl1"/></g>`);
}
function genUmlauf(lvl) {
  const names = ['Zorbon', 'Kepleria', 'Nova-7', 'Glimmus', 'Quark-Prime'];
  const n = R.pick(names);
  if (lvl === 1) {
    const r = R.int(12, 90) * 100, u = 2 * r * PI;
    return { type: 'input', q: `Ein Satellit umkreist den Planeten ${n} auf einer Kreisbahn mit <b>r = ${fmt(r)} km</b>. Wie lang ist eine Runde? (ganze km)`, visual: orbitSvg(`r = ${fmt(r)} km`), fields: [{ answer: u, tol: Math.max(1, u * .012), unit: 'km' }],
      explain: `u = 2 · r · π = 2 · ${fmt(r)} · π ≈ <b>${fmt(u, 0)} km</b>`, hint: 'Kreisumfang: u = 2rπ = dπ', step: `2 · ${fmt(r)} = ${fmt(2 * r)}` };
  }
  if (lvl === 2) {
    const r = R.int(12, 90) * 100, u = Math.round(2 * r * PI);
    return { type: 'input', q: `Eine Runde um ${n} ist <b>${fmt(u)} km</b> lang. Welchen Radius hat die Umlaufbahn? (ganze km)`, visual: orbitSvg('r = ?'), fields: [{ answer: r, tol: Math.max(2, r * .012), unit: 'km', label: 'r =' }],
      explain: `r = ${frac('u', '2π')} = ${frac(fmt(u), '2π')} ≈ <b>${fmt(r)} km</b>`, hint: 'Forme u = 2rπ nach r um: r = u : (2π)', step: `2π ≈ ${fmt(2 * PI)}` };
  }
  const r = R.int(5, 40), u = Math.round(2 * r * PI * 100) / 100, A = r * r * PI;
  return { type: 'input', q: `Ein kreisrunder Krater auf ${n} hat den Umfang <b>${fmt(u)} m</b>. Wie groß ist seine Fläche? (2 Dezimalen)`, visual: orbitSvg('u bekannt'), fields: [piF(A, 'm²')],
    explain: `Zuerst r = u : 2π ≈ ${fmt(r)} m.<br>A = r² · π ≈ <b>${fmt(A)} m²</b>`, hint: 'Berechne zuerst den Radius aus dem Umfang.', step: `r = ${fmt(u)} : (2π)` };
}

/* =====================================================================
   PLANET 7 – Körper-Kosmos
   ===================================================================== */
function coneSvg(rl, hl, scoop) {
  return svg(260, 250, `${scoop ? `<path d="M80 95 A50 50 0 0 1 180 95 Z" class="scoop"/><path d="M80 95 A50 50 0 0 1 180 95" class="ln" fill="none"/>` : ''}
    <polygon points="80,95 180,95 130,235" class="cone"/><path d="M80 95 L130 235 L180 95" class="ln" fill="none"/><ellipse cx="130" cy="95" rx="50" ry="10" class="ln" fill="none"/>
    ${L(130, 95, 180, 95, 'ln thin ac')}${T(155, 84, rl, 'tx sm ac')}${L(130, 95, 130, 235, 'ln thin mu')}${T(138, 165, hl, 'tx sm', 'start')}`);
}
function cylSvg(rl, hl) {
  return svg(260, 230, `<rect x="60" y="40" width="140" height="150" class="can"/><ellipse cx="130" cy="190" rx="70" ry="16" class="can"/><ellipse cx="130" cy="40" rx="70" ry="16" class="fl3"/>
    <path d="M60 40 L60 190 A70 16 0 0 0 200 190 L200 40" class="ln" fill="none"/><ellipse cx="130" cy="40" rx="70" ry="16" class="ln" fill="none"/>
    ${L(130, 40, 200, 40, 'ln thin ac')}${T(165, 30, rl, 'tx sm ac')}${L(214, 40, 214, 190, 'ln thin mu')}${T(220, 115, hl, 'tx sm', 'start')}`);
}
function ballSvg(lbl) {
  return svg(260, 220, `<circle cx="130" cy="110" r="85" class="ball"/><path d="M45 110 A85 25 0 0 0 215 110" class="ln thin" fill="none"/><path d="M130 25 A30 85 0 0 0 130 195" class="ln thin" fill="none"/>
    <circle cx="130" cy="110" r="85" class="ln" fill="none"/>${L(130, 110, 215, 110, 'ln ac thick')}${T(172, 98, lbl, 'tx b ac')}`);
}
function genEis(lvl) {
  const r = R.int(2, 7), h = R.int(6, 20);
  if (lvl === 1) {
    const V = r * r * PI * h / 3;
    return { type: 'input', q: `Eine Eistüte (Drehkegel) hat <b>r = ${r} cm</b> und <b>h = ${h} cm</b>. Wie viel Eis passt hinein? (2 Dezimalen)`, visual: coneSvg(`r = ${r}`, `h = ${h}`), fields: [piF(V, 'cm³')],
      explain: `V = ${frac('r² · π · h', 3)} = ${frac(`${r}² · π · ${h}`, 3)} ≈ <b>${fmt(V)} cm³</b>`, hint: 'Kegel: V = r²π · h : 3 (ein Drittel vom Zylinder!)', step: `${r}² · π · ${h} ≈ ${fmt(r * r * PI * h)}, dann : 3` };
  }
  if (lvl === 2) {
    const Vk = r * r * PI * h / 3, Vh = 2 / 3 * r ** 3 * PI, V = Vk + Vh;
    return { type: 'input', q: `Tüte (r = ${r} cm, h = ${h} cm) <b>plus</b> eine Halbkugel Eis obendrauf. Wie viel Eis ist das insgesamt? (2 Dezimalen)`, visual: coneSvg(`r = ${r}`, `h = ${h}`, true), fields: [piF(V, 'cm³')],
      explain: `Kegel: ${frac(`${r}² · π · ${h}`, 3)} ≈ ${fmt(Vk)} cm³<br>Halbkugel: ${frac(2, 3)} · ${r}³ · π ≈ ${fmt(Vh)} cm³<br>Summe ≈ <b>${fmt(V)} cm³</b>`, hint: 'Halbkugel = halbe Kugel: V = 2/3 · r³ · π', step: `Kegel ≈ ${fmt(Vk)} cm³` };
  }
  const V = Math.round(r * r * PI * h / 3 * 100) / 100;
  return { type: 'input', q: `Eine Eistüte fasst <b>V = ${fmt(V)} cm³</b> und hat <b>r = ${r} cm</b>. Wie hoch ist sie? (2 Dezimalen)`, visual: coneSvg(`r = ${r}`, 'h = ?'), fields: [{ answer: h, tol: .06, unit: 'cm', label: 'h =' }],
    explain: `h = ${frac('3 · V', 'r² · π')} = ${frac(`3 · ${fmt(V)}`, `${r}² · π`)} ≈ <b>${fmt(h)} cm</b>`, hint: 'Forme V = r²π · h : 3 nach h um.', step: `3 · V = ${fmt(3 * V)}` };
}
function genDose(lvl) {
  const r = R.int(2, 8), h = R.int(5, 20);
  if (lvl === 1) {
    const M = 2 * r * PI * h;
    return { type: 'input', q: `Für das Etikett einer Dose (r = ${r} cm, h = ${h} cm) brauchst du den <b>Mantel</b>. Wie groß ist er? (2 Dezimalen)`, visual: cylSvg(`r = ${r}`, `h = ${h}`), fields: [piF(M, 'cm²')],
      explain: `M = 2rπ · h = 2 · ${r} · π · ${h} ≈ <b>${fmt(M)} cm²</b><br>Aufgerollt ist der Mantel ein Rechteck: Umfang mal Höhe.`, hint: 'Mantel = Umfang · Höhe = 2rπ · h', step: `Umfang: 2 · ${r} · π ≈ ${fmt(2 * r * PI)} cm` };
  }
  if (lvl === 2) {
    const O = 2 * r * r * PI + 2 * r * PI * h;
    return { type: 'input', q: `Wie viel Blech braucht die Dosen-Fabrik für eine ganze Dose (r = ${r} cm, h = ${h} cm)? Berechne die <b>Oberfläche</b>. (2 Dezimalen)`, visual: cylSvg(`r = ${r}`, `h = ${h}`), fields: [piF(O, 'cm²')],
      explain: `O = 2 · G + M = 2 · ${r}² · π + 2 · ${r} · π · ${h}<br>≈ ${fmt(2 * r * r * PI)} + ${fmt(2 * r * PI * h)} ≈ <b>${fmt(O)} cm²</b>`, hint: 'O = 2r²π + 2rπh (Boden + Deckel + Mantel)', step: `Boden: ${r}² · π ≈ ${fmt(r * r * PI)} cm²` };
  }
  const V = r * r * PI * h / 1000;
  return { type: 'input', q: `Wie viele <b>Liter</b> Saft passen in einen Tank mit r = ${r * 3} cm und h = ${h * 2} cm? (2 Dezimalen)`, visual: cylSvg(`r = ${r * 3}`, `h = ${h * 2}`), fields: [piF((r * 3) ** 2 * PI * h * 2 / 1000, 'l')],
    explain: `V = r²π · h = ${r * 3}² · π · ${h * 2} ≈ ${fmt((r * 3) ** 2 * PI * h * 2)} cm³<br>1 l = 1 dm³ = 1000 cm³ → <b>${fmt((r * 3) ** 2 * PI * h * 2 / 1000)} l</b>`, hint: 'V = r²πh, dann durch 1000 (cm³ → Liter).', step: `${r * 3}² · π · ${h * 2} = ?` };
}
const BALLS = [['Tischtennisball', 4], ['Golfball', 4.3], ['Tennisball', 6.7], ['Handball', 18.5], ['Volleyball', 21], ['Fußball', 22], ['Basketball', 24]];
function genBall(lvl, ctx) {
  if (lvl === 3 && R.chance(.5)) {
    const picks = R.sample(BALLS, 4);
    const items = picks.map(([n, d]) => {
      const r = d / 2, V = 4 / 3 * r ** 3 * PI, O = 4 * r * r * PI, k = R.int(0, 3);
      const info = k === 0 ? `d = ${fmt(d)} cm` : k === 1 ? `r = ${fmt(r)} cm` : k === 2 ? `O ≈ ${fmt(O, 0)} cm²` : `V ≈ ${fmt(V, 0)} cm³`;
      return { html: `<b>${n}</b><br><span class="sm">${info}</span>`, value: V, name: n, V };
    });
    const sorted = items.slice().sort((a, b) => a.value - b.value);
    return { type: 'order', q: 'Tippe die Bälle der Reihe nach an – vom <b>kleinsten</b> bis zum <b>größten Volumen</b>!', items,
      explain: sorted.map(i => `${i.name}: V ≈ ${fmt(i.V, 0)} cm³`).join('<br>'), hint: 'Rechne alle Angaben auf den Radius um – dann kannst du direkt vergleichen.' };
  }
  const [name, d] = R.chance(.5) ? R.pick(BALLS) : [R.pick(['Planetenmodell', 'Murmel aus Mondglas', 'Kristallkugel', 'Wasserball', 'Seifenblase', 'Gummiball', 'Christbaumkugel']), R.int(4, 60) / 2], r = d / 2;
  if (lvl === 1) {
    const O = 4 * r * r * PI;
    return { type: 'input', q: `Wie viel Leder braucht ein <b>${name}</b> mit <b>r = ${fmt(r)} cm</b>? Berechne die Oberfläche. (2 Dezimalen)`, visual: ballSvg(`r = ${fmt(r)}`), fields: [piF(O, 'cm²')],
      explain: `O = 4 · r² · π = 4 · ${fmt(r)}² · π ≈ <b>${fmt(O)} cm²</b>`, hint: 'Kugeloberfläche: O = 4r²π', step: `${fmt(r)}² = ${fmt(r * r)}` };
  }
  if (lvl === 2) {
    const V = 4 / 3 * r ** 3 * PI;
    return { type: 'input', q: `Ein <b>${name}</b> hat den Durchmesser <b>d = ${fmt(d)} cm</b>. Wie groß ist sein Volumen? (2 Dezimalen)`, visual: ballSvg(`d = ${fmt(d)}`), fields: [piF(V, 'cm³')],
      explain: `r = d : 2 = ${fmt(r)} cm<br>V = ${frac(4, 3)} · r³ · π = ${frac(4, 3)} · ${fmt(r)}³ · π ≈ <b>${fmt(V)} cm³</b>`, hint: 'Achtung: Durchmesser! Zuerst halbieren. Dann V = 4/3 · r³ · π', step: `r = ${fmt(d)} : 2 = ${fmt(r)}` };
  }
  const rr = R.int(3, 15), O = Math.round(4 * rr * rr * PI * 100) / 100;
  return { type: 'input', q: `Ein Ball hat die Oberfläche <b>O = ${fmt(O)} cm²</b>. Wie groß ist sein Radius? (2 Dezimalen)`, visual: ballSvg('r = ?'), fields: [{ answer: rr, tol: .06, unit: 'cm', label: 'r =' }],
    explain: `r = ${rt(frac('O', '4π'))} = ${rt(frac(fmt(O), '4π'))} ≈ <b>${fmt(rr)} cm</b>`, hint: 'O = 4r²π → r² = O : (4π) → r = √(…)', step: `O : (4π) ≈ ${fmt(O / 4 / PI)}` };
}
function bodyIcon(t) {
  const s = (inner) => `<svg viewBox="0 0 60 60" class="ico">${inner}</svg>`;
  if (t === 'Zylinder') return s(`<rect x="15" y="12" width="30" height="36" class="fl2"/><ellipse cx="30" cy="48" rx="15" ry="5" class="fl2"/><ellipse cx="30" cy="12" rx="15" ry="5" class="fl3"/><path d="M15 12 V48 A15 5 0 0 0 45 48 V12" class="ln thin" fill="none"/><ellipse cx="30" cy="12" rx="15" ry="5" class="ln thin" fill="none"/>`);
  if (t === 'Kegel') return s(`<polygon points="30,8 14,48 46,48" class="fl2"/><ellipse cx="30" cy="48" rx="16" ry="5" class="fl3"/><path d="M14 48 L30 8 L46 48" class="ln thin" fill="none"/><ellipse cx="30" cy="48" rx="16" ry="5" class="ln thin" fill="none"/>`);
  if (t === 'Kugel') return s(`<circle cx="30" cy="30" r="20" class="fl2"/><ellipse cx="30" cy="30" rx="20" ry="6" class="ln thin" fill="none"/><circle cx="30" cy="30" r="20" class="ln thin" fill="none"/>`);
  return s(`<path d="M12 22 H38 V48 H12 Z" class="fl2"/><path d="M12 22 L22 12 H48 L38 22 Z" class="fl3"/><path d="M38 22 L48 12 V38 L38 48 Z" class="fl1"/><path d="M12 22 H38 V48 H12 Z M12 22 L22 12 H48 V38 L38 48 M38 22 L48 12" class="ln thin" fill="none"/>`);
}
function genKoerper(lvl) {
  const V = [['Zylinder', 'V = r²π · h'], ['Kegel', `V = ${frac('r²π · h', 3)}`], ['Kugel', `V = ${frac(4, 3)} · r³π`], ['Würfel', 'V = a³']];
  const O = [['Zylinder', 'O = 2r²π + 2rπh'], ['Kegel', 'O = r²π + rπs'], ['Kugel', 'O = 4r²π'], ['Würfel', 'O = 6a²']];
  if (lvl < 3) {
    const set = lvl === 1 ? V : O;
    return { type: 'match', q: `Verbinde jeden Körper mit der Formel für ${lvl === 1 ? 'sein <b>Volumen</b>' : 'seine <b>Oberfläche</b>'}!`, left: set.map(s => `<span class="bodyl">${bodyIcon(s[0])}${s[0]}</span>`), right: set.map(s => s[1]),
      hint: lvl === 1 ? 'Spitze Körper (Kegel) haben ein Drittel vom Volumen des passenden Zylinders.' : 'Der Kegel hat eine Mantellinie s. Die Kugel hat keine Grundfläche.' };
  }
  const mix = [['Volumen Zylinder', V[0][1]], ['Volumen Kegel', V[1][1]], ['Volumen Kugel', V[2][1]], ['Oberfläche Kugel', O[2][1]], ['Mantel Zylinder', 'M = 2rπ · h'], ['Mantel Kegel', 'M = rπs'], ['Grundfläche Kegel', 'G = r²π'], ['Oberfläche Zylinder', O[0][1]]];
  const pick = R.sample(mix, 4);
  return { type: 'match', q: 'Verbinde jede Größe mit der richtigen Formel!', left: pick.map(p => p[0]), right: pick.map(p => p[1]), hint: 'Mantel = nur die gebogene Seitenfläche, Oberfläche = alles zusammen.' };
}
function rocketSvg(type) {
  if (type === 0) return svg(220, 260, `<polygon points="70,90 150,90 110,15" class="cone"/><rect x="70" y="90" width="80" height="140" class="can"/><path d="M70 90 L110 15 L150 90 Z M70 90 H150 V230 H70 Z" class="ln" fill="none"/>
    <path d="M70 200 L45 240 L70 230 Z M150 200 L175 240 L150 230 Z" class="fl1"/><circle cx="110" cy="135" r="13" class="fl3"/>
    ${T(162, 160, 'h₁', 'tx it', 'start')}${T(140, 55, 'h₂', 'tx it', 'start')}${L(110, 230, 150, 230, 'ln ac thin')}${T(130, 245, 'r', 'tx it ac')}`);
  if (type === 1) return svg(220, 260, `<path d="M60 100 A50 50 0 0 1 160 100 Z" class="scoop"/><rect x="60" y="100" width="100" height="135" class="can"/><path d="M60 100 A50 50 0 0 1 160 100 M60 100 V235 H160 V100" class="ln" fill="none"/>
    ${T(172, 170, 'h', 'tx it', 'start')}${L(110, 100, 160, 100, 'ln ac thin')}${T(135, 90, 'r', 'tx it ac')}`);
  return svg(220, 260, `<rect x="45" y="40" width="130" height="180" class="can"/><polygon points="65,40 155,40 110,150" class="hole"/><path d="M45 40 H175 V220 H45 Z M65 40 L110 150 L155 40" class="ln" fill="none"/>
    ${T(185, 130, 'h', 'tx it', 'start')}${T(118, 100, 'h₂', 'tx it ac', 'start')}`);
}
function genBau(lvl) {
  const r = R.int(2, 6);
  if (lvl === 1) {
    const h1 = R.int(8, 20), h2 = R.int(4, 10), Vz = r * r * PI * h1, Vk = r * r * PI * h2 / 3, V = Vz + Vk;
    return { type: 'input', q: `Die Rakete besteht aus einem Zylinder (r = ${r} m, h₁ = ${h1} m) und einer Kegelspitze (h₂ = ${h2} m). Wie groß ist ihr Volumen? (2 Dezimalen)`, visual: rocketSvg(0), fields: [piF(V, 'm³')],
      explain: `Zylinder: ${r}² · π · ${h1} ≈ ${fmt(Vz)} m³<br>Kegel: ${frac(`${r}² · π · ${h2}`, 3)} ≈ ${fmt(Vk)} m³<br>Summe ≈ <b>${fmt(V)} m³</b>`, hint: 'Teile den Körper in einfache Teile und addiere die Volumen.', step: `Zylinder: ${r}² · π · ${h1}` };
  }
  if (lvl === 2) {
    const h = R.int(6, 18), Vz = r * r * PI * h, Vh = 2 / 3 * r ** 3 * PI, V = Vz + Vh;
    return { type: 'input', q: `Ein Getreide-Silo auf dem Mars: Zylinder (r = ${r} m, h = ${h} m) mit einer Halbkugel als Dach. Wie viel passt hinein? (2 Dezimalen)`, visual: rocketSvg(1), fields: [piF(V, 'm³')],
      explain: `Zylinder: ${r}² · π · ${h} ≈ ${fmt(Vz)} m³<br>Halbkugel: ${frac(2, 3)} · ${r}³ · π ≈ ${fmt(Vh)} m³<br>Summe ≈ <b>${fmt(V)} m³</b>`, hint: 'Halbkugel: V = 2/3 · r³π', step: `Zylinder ≈ ${fmt(Vz)} m³` };
  }
  const h = R.int(8, 16), h2 = R.int(3, h - 2), Vz = r * r * PI * h, Vk = r * r * PI * h2 / 3, V = Vz - Vk;
  return { type: 'input', q: `Aus einem Metallzylinder (r = ${r} cm, h = ${h} cm) wird ein Kegel mit gleichem Radius und h₂ = ${h2} cm herausgefräst. Wie viel Metall bleibt übrig? (2 Dezimalen)`, visual: rocketSvg(2), fields: [piF(V, 'cm³')],
    explain: `Zylinder ≈ ${fmt(Vz)} cm³, Kegel ≈ ${fmt(Vk)} cm³<br>Rest ≈ <b>${fmt(V)} cm³</b>`, hint: 'Ausgehöhlt heißt: abziehen!', step: `Zylinder: ${r}² · π · ${h} ≈ ${fmt(Vz)} cm³` };
}

/* =====================================================================
   PLANET 8 – Funktions-Galaxie
   ===================================================================== */
const KSET = [-3, -2, -1.5, -1, -0.5, 0.5, 1, 1.5, 2, 3];
function genLaser(lvl) {
  let k, d, pts = [];
  for (let g = 0; g < 200; g++) {
    k = lvl === 1 ? R.pick([-3, -2, -1, -0.5, 0.5, 1, 2, 3]) : R.pick(KSET.concat(lvl === 3 ? [-2.5, 2.5, 0] : []));
    d = lvl === 1 ? 0 : R.int(-4, 4);
    const xs = R.shuffle([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5]);
    pts = [];
    for (const x of xs) { const y = k * x + d; if (Number.isInteger(y) && Math.abs(y) <= 5 && !(x === 0)) pts.push([x, y]); if (pts.length >= (lvl === 3 ? 3 : lvl === 2 ? 2 : 1)) break; }
    if (pts.length >= (lvl === 3 ? 3 : lvl === 2 ? 2 : 1)) break;
  }
  return { type: 'laser', q: lvl === 1 ? 'Stelle die Steigung <b>k</b> so ein, dass der Laser y = k · x den Asteroiden trifft!' : `Stelle <b>k</b> und <b>d</b> ein, damit der Laser y = k · x + d ${pts.length > 2 ? 'alle drei' : 'beide'} Asteroiden trifft!`,
    points: pts, k, d, lockD: lvl === 1, preview: lvl < 3,
    explain: `Richtig ist <b>y = ${lin(k, d)}</b>.<br>k = Steigung (pro 1 nach rechts ${fmt(Math.abs(k))} ${k >= 0 ? 'hinauf' : 'hinunter'}), d = Schnittpunkt mit der y-Achse.`,
    hint: 'k: Wie viel geht es nach oben, wenn du 1 nach rechts gehst? d: Wo schneidet die Gerade die y-Achse?', step: lvl === 1 ? `Der Asteroid liegt bei (${pts[0][0]} | ${pts[0][1]}). k = y : x.` : `d ist der y-Wert bei x = 0: d = ${fmt(d)}.` };
}
function miniGraph(k, d, id) {
  const s = 8, o = 50, X = x => o + x * s, Y = y => o - y * s;
  let grid = '';
  for (let i = -5; i <= 5; i++) { grid += `<line x1="${X(i)}" y1="2" x2="${X(i)}" y2="98" class="grid"/><line x1="2" y1="${Y(i)}" x2="98" y2="${Y(i)}" class="grid"/>`; }
  return `<svg viewBox="0 0 100 100" class="mini">${grid}<line x1="0" y1="50" x2="100" y2="50" class="axis"/><line x1="50" y1="0" x2="50" y2="100" class="axis"/><line x1="${X(-7)}" y1="${Y(k * -7 + d)}" x2="${X(7)}" y2="${Y(k * 7 + d)}" class="ln ac"/></svg>`;
}
function genZuordnung(lvl) {
  const used = new Set(), items = [];
  let g = 0;
  while (items.length < (lvl === 1 ? 3 : 4) && g++ < 300) {
    const k = R.pick([-2, -1, -0.5, 0.5, 1, 2, 3, -3]), d = lvl === 1 ? 0 : R.int(-3, 3);
    const key = k + '|' + d; if (used.has(key)) continue;
    if (lvl === 1 && items.some(i => i.k === k)) continue;
    used.add(key); items.push({ k, d });
  }
  const left = items.map(i => `y = ${lin(i.k, i.d)}`);
  const right = items.map(i => lvl === 3 ? `<table class="wt"><tr><th>x</th><td>0</td><td>1</td><td>2</td></tr><tr><th>y</th><td>${fmt(i.d)}</td><td>${fmt(i.k + i.d)}</td><td>${fmt(2 * i.k + i.d)}</td></tr></table>` : miniGraph(i.k, i.d));
  return { type: 'match', q: lvl === 3 ? 'Verbinde jede Funktion mit ihrer Wertetabelle!' : 'Verbinde jede Funktion mit ihrem Graphen!', left, right,
    hint: lvl === 3 ? 'Setze x = 0, 1, 2 in die Gleichung ein.' : 'Schau zuerst auf d (Schnitt mit der y-Achse), dann auf k (steigt oder fällt?).' };
}
function shapeSvg(t) {
  const ax = `<line x1="0" y1="60" x2="120" y2="60" class="axis"/><line x1="60" y1="0" x2="60" y2="120" class="axis"/>`;
  const p = {
    parabel: '<path d="M15 10 Q60 150 105 10" class="ln ac" fill="none"/>',
    kreis: '<circle cx="60" cy="60" r="35" class="ln ac" fill="none"/>',
    senkrecht: '<line x1="80" y1="5" x2="80" y2="115" class="ln ac"/>',
    seitlich: '<path d="M110 15 Q-20 60 110 105" class="ln ac" fill="none"/>',
    waag: '<line x1="5" y1="40" x2="115" y2="40" class="ln ac"/>',
    welle: '<path d="M5 60 C25 10 35 10 50 60 S80 110 95 60 S110 20 118 30" class="ln ac" fill="none"/>',
    gerade: '<line x1="10" y1="105" x2="110" y2="15" class="ln ac"/>',
    schleife: '<path d="M10 90 C60 90 100 70 80 40 C60 10 30 40 70 60 C95 72 105 40 115 20" class="ln ac" fill="none"/>'
  };
  return `<svg viewBox="0 0 120 120" class="vis small">${ax}${p[t]}</svg>`;
}
const TF_FUNK = [
  [1, 'Dieser Graph gehört zu einer Funktion.', 'parabel', true, 'Jede senkrechte Linie trifft den Graphen höchstens einmal → Funktion.'],
  [1, 'Dieser Graph gehört zu einer Funktion.', 'kreis', false, 'Eine senkrechte Linie trifft den Kreis zweimal – zu einem x gibt es zwei y-Werte.'],
  [1, 'Dieser Graph gehört zu einer Funktion.', 'senkrecht', false, 'Zu einem einzigen x-Wert gehören unendlich viele y-Werte.'],
  [1, 'Dieser Graph gehört zu einer Funktion.', 'gerade', true, 'Jedem x ist genau ein y zugeordnet.'],
  [2, 'Dieser Graph gehört zu einer Funktion.', 'seitlich', false, 'Senkrechte Linien schneiden diese Kurve zweimal.'],
  [2, 'Dieser Graph gehört zu einer Funktion.', 'waag', true, 'Eine waagrechte Gerade ist eine (konstante) Funktion.'],
  [2, 'Dieser Graph gehört zu einer Funktion.', 'welle', true, 'Senkrechte Linien treffen die Welle nur einmal.'],
  [3, 'Dieser Graph gehört zu einer Funktion.', 'schleife', false, 'Die Kurve läuft zurück – manche x-Werte haben mehrere y-Werte.'],
  [1, 'y = 3x + 2 hat die Steigung 3.', null, true, 'In y = kx + d ist k die Steigung, hier k = 3.'],
  [1, `y = ${MINUS}2x + 5 schneidet die y-Achse bei 5.`, null, true, 'd = 5 ist der y-Achsenabschnitt.'],
  [2, 'y = 4x ist eine inhomogene lineare Funktion.', null, false, 'Ohne d (d = 0) heißt sie homogen. Ihr Graph geht durch den Ursprung.'],
  [2, 'Wenn k negativ ist, fällt der Graph.', null, true, 'k < 0: Nach rechts geht es bergab.'],
  [2, 'y = x² ist eine lineare Funktion.', null, false, 'x² macht daraus eine quadratische Funktion (Parabel).'],
  [3, 'Jedem Schüler wird sein Geburtstag zugeordnet. Das ist eine Funktion.', null, true, 'Jeder Schüler hat genau einen Geburtstag.'],
  [3, 'Jedem Geburtstag wird ein Schüler zugeordnet. Das ist immer eine Funktion.', null, false, 'Mehrere Schüler können am selben Tag Geburtstag haben.'],
  [3, 'Der Graph von y = 2x + 1 geht durch den Punkt (3 | 7).', null, true, '2 · 3 + 1 = 7 ✓'],
  [3, `Der Graph von y = ${MINUS}x + 4 geht durch den Punkt (2 | 6).`, null, false, `${MINUS}2 + 4 = 2, nicht 6.`]
];
function genFunkTF(lvl, ctx) {
  const it = unused(ctx, TF_FUNK.filter(t => t[0] <= lvl), t => t[1] + t[2]);
  return { type: 'tf', statement: it[1], visual: it[2] ? shapeSvg(it[2]) : '', answer: it[3], explain: it[4], hint: 'Senkrechten-Test: Trifft jede senkrechte Linie den Graphen höchstens einmal? Dann ist es eine Funktion.' };
}
function genWerte(lvl) {
  if (lvl === 1) {
    const k = R.nz(-5, 5), d = R.int(-9, 9), x = R.int(-6, 6);
    return { type: 'input', q: `Gegeben ist f(x) = ${lin(k, d)}. Berechne <b>f(${fmt(x)})</b>.`, fields: [exact(k * x + d, '', `f(${fmt(x)}) =`)],
      explain: `f(${fmt(x)}) = ${fmt(k)} · ${sg(x)} ${d < 0 ? MINUS : '+'} ${Math.abs(d)} = <b>${fmt(k * x + d)}</b>`, hint: 'Setze die Zahl für x ein.', step: `${fmt(k)} · ${sg(x)} = ${fmt(k * x)}` };
  }
  if (lvl === 2) {
    const k = R.pick([-3, -2, -1.5, -1, -0.5, 0.5, 1, 1.5, 2, 3, 4]), x1 = R.int(-5, 3), dx = R.pick([2, 4]), d = R.int(-5, 5);
    const x2 = x1 + dx, y1 = k * x1 + d, y2 = k * x2 + d;
    return { type: 'input', q: `Eine Gerade geht durch A(${fmt(x1)} | ${fmt(y1)}) und B(${fmt(x2)} | ${fmt(y2)}). Wie groß ist die Steigung k?`, fields: [exact(k, '', 'k =')],
      explain: `k = ${frac('y₂ − y₁', 'x₂ − x₁')} = ${frac(`${fmt(y2)} ${MINUS} ${sg(y1)}`, `${fmt(x2)} ${MINUS} ${sg(x1)}`)} = ${frac(fmt(y2 - y1), fmt(dx))} = <b>${fmt(k)}</b>`, hint: 'Steigung = Höhenunterschied : Seitenunterschied', step: `y₂ ${MINUS} y₁ = ${fmt(y2 - y1)}` };
  }
  if (R.chance(.5)) {
    const k = R.nz(-4, 4), x0 = R.int(-5, 5), d = -k * x0;
    return { type: 'input', q: `Wo schneidet die Gerade y = ${lin(k, d)} die <b>x-Achse</b>? (Nullstelle)`, fields: [exact(x0, '', 'x =')],
      explain: `y = 0 setzen: 0 = ${lin(k, d)} → ${mono(k, 'x', true)} = ${fmt(-d)} → x = <b>${fmt(x0)}</b>`, hint: 'Auf der x-Achse ist y = 0.', step: `0 = ${lin(k, d)}` };
  }
  const k = R.nz(-3, 3), d = R.int(-5, 5), x1 = R.int(-3, 0), x2 = x1 + R.int(1, 3);
  return choice(`Welche Gerade geht durch A(${fmt(x1)} | ${fmt(k * x1 + d)}) und B(${fmt(x2)} | ${fmt(k * x2 + d)})?`, `y = ${lin(k, d)}`, [`y = ${lin(-k, d)}`, `y = ${lin(k, -d)}`, `y = ${lin(d || 1, k)}`],
    { fill: () => `y = ${lin(k + R.nz(-2, 2), d)}`, explain: `k = ${frac(fmt(k * (x2 - x1)), fmt(x2 - x1))} = ${fmt(k)}, d durch Einsetzen von A: ${fmt(k * x1 + d)} = ${fmt(k)} · ${sg(x1)} + d → d = ${fmt(d)}.<br><b>y = ${lin(k, d)}</b>`, hint: 'Berechne zuerst k, dann setze einen Punkt ein, um d zu finden.' });
}

/* =====================================================================
   PLANET 9 – Doppelstern (Gleichungssysteme)
   ===================================================================== */
const eq2 = (a, b, c) => `${poly([[a, 'x'], [b, 'y']])} = ${fmt(c)}`;
function genTresor(lvl) {
  let a1, b1, a2, b2, x, y;
  for (let g = 0; g < 200; g++) {
    x = lvl === 1 ? R.int(1, 9) : R.int(-5, 9); y = lvl === 1 ? R.int(1, 9) : R.int(-5, 9);
    if (lvl === 1) { a1 = 1; b1 = 1; a2 = 1; b2 = -1; if (x === y) continue; }
    else if (lvl === 2) { a1 = R.int(1, 4); b1 = R.int(1, 4); a2 = R.int(1, 4); b2 = R.nz(-4, 4); }
    else { a1 = R.nz(-5, 5); b1 = R.nz(-5, 5); a2 = R.nz(-5, 5); b2 = R.nz(-5, 5); }
    if (a1 * b2 - a2 * b1 !== 0) break;
  }
  const c1 = a1 * x + b1 * y, c2 = a2 * x + b2 * y;
  return { type: 'input', q: 'Der Tresor hat zwei Schlösser. Er öffnet sich nur, wenn x und y <b>beide</b> Gleichungen erfüllen!', visual: `<div class="system"><div>I: ${eq2(a1, b1, c1)}</div><div>II: ${eq2(a2, b2, c2)}</div></div>`,
    fields: [exact(x, '', 'x ='), exact(y, '', 'y =')],
    explain: `x = <b>${fmt(x)}</b>, y = <b>${fmt(y)}</b><br>Probe I: ${fmt(a1)} · ${sg(x)} + ${fmt(b1)} · ${sg(y)} = ${fmt(c1)} ✓<br>Probe II: ${fmt(a2)} · ${sg(x)} + ${fmt(b2)} · ${sg(y)} = ${fmt(c2)} ✓`,
    hint: lvl === 1 ? 'Addiere die beiden Gleichungen – dann fällt y weg!' : 'Multipliziere eine Gleichung so, dass beim Addieren eine Variable wegfällt.', step: lvl === 1 ? `I + II: 2x = ${c1 + c2}` : `Versuche das Additions- oder Einsetzungsverfahren.` };
}
function genSchnitt(lvl) {
  let L1, L2, x0, y0;
  for (let g = 0; g < 400; g++) {
    x0 = R.int(-4, 4); y0 = R.int(-4, 4);
    const k1 = R.pick([-3, -2, -1, -0.5, 0.5, 1, 2, 3]), k2 = R.pick([-3, -2, -1, -0.5, 0.5, 1, 2, 3]);
    if (k1 === k2) continue;
    const d1 = y0 - k1 * x0, d2 = y0 - k2 * x0;
    if (!Number.isInteger(d1) || !Number.isInteger(d2) || Math.abs(d1) > 8 || Math.abs(d2) > 8) continue;
    L1 = { k: k1, d: d1 }; L2 = { k: k2, d: d2 }; break;
  }
  if (!L1) { x0 = 1; y0 = 2; L1 = { k: 1, d: 1 }; L2 = { k: -1, d: 3 }; }
  return { type: 'tapgrid', q: lvl === 3 ? 'Die Laserstrahlen sind unsichtbar! Berechne den Schnittpunkt und tippe ihn an:' : 'Tippe auf den <b>Schnittpunkt</b> der beiden Geraden!',
    lines: [L1, L2], showLines: lvl < 3, showEq: lvl > 1, x: x0, y: y0,
    explain: `Schnittpunkt <b>S(${fmt(x0)} | ${fmt(y0)})</b><br>Probe: ${fmt(L1.k)} · ${sg(x0)} ${signed(L1.d)} = ${fmt(y0)} und ${fmt(L2.k)} · ${sg(x0)} ${signed(L2.d)} = ${fmt(y0)}`,
    hint: lvl === 3 ? 'Gleichsetzungsverfahren: Setze die beiden rechten Seiten gleich.' : 'Der Schnittpunkt liegt auf beiden Geraden gleichzeitig.', step: `${lin(L1.k, L1.d)} = ${lin(L2.k, L2.d)}` };
}
function genVerfahren(lvl) {
  if (lvl < 3) {
    const m = R.nz(-4, 4), c = R.int(-6, 6), a = R.int(1, 5), b = R.int(2, 5), e = R.int(-12, 20);
    const mc = c === 0 ? mono(m, 'x', true) : lin(m, c);
    if (lvl === 1) {
      return choice(`<div class="system"><div>I: y = ${mc}</div><div>II: ${eq2(a, b, e)}</div></div>Setze I in II ein. Was erhältst du?`,
        `${mono(a, 'x', true)} + ${b}(${mc}) = ${fmt(e)}`, [`${mono(a, 'x', true)} + ${b} · ${mono(m, 'x', true)}${c ? signed(c) : ''} = ${fmt(e)}`, `${a}(${mc}) + ${b}y = ${fmt(e)}`, `${mono(a, 'x', true)} + ${mc} = ${fmt(e)}`],
        { explain: `Für y wird der ganze Term (${mc}) eingesetzt – mit Klammer, weil er mit ${b} multipliziert wird.`, hint: 'Ersetze y in Gleichung II durch die rechte Seite von I. Klammern nicht vergessen!' });
    }
    const correct = `${lin(a + b * m, b * c)} = ${fmt(e)}`;
    return choice(`<div class="system"><div>I: y = ${mc}</div><div>II: ${eq2(a, b, e)}</div></div>Nach dem Einsetzen und Vereinfachen erhältst du:`, correct,
      [`${lin(a + m, c)} = ${fmt(e)}`, `${lin(a + b * m, c)} = ${fmt(e)}`, `${lin(a - b * m, b * c)} = ${fmt(e)}`], { fill: () => `${lin(a + b * m + R.nz(-2, 2), b * c)} = ${fmt(e)}`,
        explain: `${mono(a, 'x', true)} + ${b}(${mc}) = ${fmt(e)}<br>${mono(a, 'x', true)} + ${lin(b * m, b * c)} = ${fmt(e)}<br><b>${correct}</b>`, hint: 'Klammer ausmultiplizieren, dann die x-Terme zusammenfassen.' });
  }
  const a1 = R.int(1, 6), a2 = R.int(1, 6), b = R.int(1, 6), c1 = R.int(-10, 20), c2 = R.int(-10, 20);
  return choice(`<div class="system"><div>I: ${eq2(a1, b, c1)}</div><div>II: ${eq2(a2, -b, c2)}</div></div>Addiere I und II. Welche Gleichung entsteht?`, `${mono(a1 + a2, 'x', true)} = ${fmt(c1 + c2)}`,
    [`${mono(a1 - a2 || 7, 'x', true)} = ${fmt(c1 - c2)}`, `${poly([[a1 + a2, 'x'], [2 * b, 'y']])} = ${fmt(c1 + c2)}`, `${mono(a1 + a2, 'x', true)} = ${fmt(c1 - c2)}`, `${mono(a1 + a2, 'x', true)} = ${fmt(c1 + c2 + 2 * b)}`, `${mono(a1 * a2, 'x', true)} = ${fmt(c1 + c2)}`],
    { explain: `${b}y + (${MINUS}${b}y) = 0 – das y fällt weg!<br>${mono(a1, 'x', true)} + ${mono(a2, 'x', true)} = ${fmt(c1)} + ${sg(c2)} → <b>${mono(a1 + a2, 'x', true)} = ${fmt(c1 + c2)}</b>`, hint: 'Beim Additionsverfahren werden linke Seiten und rechte Seiten addiert.' });
}
const TEXT2 = [
  () => { const k = R.int(4, 9), e = k + R.int(2, 6), n1 = R.int(1, 4), m1 = R.int(1, 3); let n2, m2; do { n2 = R.int(1, 4); m2 = R.int(1, 3); } while (n1 * m2 === n2 * m1); return { s: `Familie Zorp kauft ${n1} Kinder- und ${m1} Erwachsenen-Ticket${m1 > 1 ? 's' : ''} um <b>${n1 * k + m1 * e} €</b>. Familie Blip kauft ${n2} Kinder- und ${m2} Erwachsenen-Ticket${m2 > 1 ? 's' : ''} um <b>${n2 * k + m2 * e} €</b>.`, f: [exact(k, '€', 'Kind:'), exact(e, '€', 'Erwachsene:')], sys: [`${n1}x + ${m1}y = ${n1 * k + m1 * e}`, `${n2}x + ${m2}y = ${n2 * k + m2 * e}`], vars: 'x = Kinderpreis, y = Erwachsenenpreis' }; },
  () => { const a = R.int(3, 15), r = R.int(3, 15); return { s: `Auf dem Raumhafen stehen Aliens mit <b>3 Beinen</b> und Roboter mit <b>4 Rädern</b>. Insgesamt sind es <b>${a + r}</b> Wesen mit <b>${3 * a + 4 * r}</b> Beinen und Rädern.`, f: [exact(a, '', 'Aliens:'), exact(r, '', 'Roboter:')], sys: [`x + y = ${a + r}`, `3x + 4y = ${3 * a + 4 * r}`], vars: 'x = Aliens, y = Roboter' }; },
  () => { const z = R.int(3, 15), e = R.int(3, 15); return { s: `In Pi-Pis Sparschwein sind nur 2-€- und 1-€-Münzen: <b>${z + e}</b> Münzen mit zusammen <b>${2 * z + e} €</b>.`, f: [exact(z, '', '2-€-Münzen:'), exact(e, '', '1-€-Münzen:')], sys: [`x + y = ${z + e}`, `2x + y = ${2 * z + e}`], vars: 'x = 2-€-Münzen, y = 1-€-Münzen' }; },
  () => { const x = R.int(10, 40), y = R.int(1, x - 1); return { s: `Die Summe zweier Zahlen ist <b>${x + y}</b>, ihre Differenz ist <b>${x - y}</b>.`, f: [exact(x, '', 'größere Zahl:'), exact(y, '', 'kleinere Zahl:')], sys: [`x + y = ${x + y}`, `x ${MINUS} y = ${x - y}`], vars: 'x = größere, y = kleinere Zahl' }; }
];
function genText2(lvl, ctx) {
  const i = unused(ctx, [0, 1, 2, 3]);
  const t = TEXT2[i]();
  return { type: 'input', q: `<span class="story">🎬 ${t.s}</span>`, fields: t.f,
    explain: `${t.vars}<br>I: ${t.sys[0]}<br>II: ${t.sys[1]}<br>Lösung: <b>${t.f.map(f => f.label + ' ' + fmt(f.answer)).join(', ')}</b>`, hint: 'Lege fest, wofür x und y stehen. Dann stelle zwei Gleichungen auf.', step: `I: ${t.sys[0]} · II: ${t.sys[1]}` };
}

/* =====================================================================
   PLANET 10 – Daten-Station (Statistik)
   ===================================================================== */
function barChart(vals, labels, opts = {}) {
  const W = 320, H = 200, pad = 32, n = vals.length;
  const min = opts.min || 0, max = opts.max || Math.ceil(Math.max(...vals) / 10) * 10 || 10;
  const bw = (W - pad - 10) / n;
  const Y = v => H - 28 - (v - min) / (max - min) * (H - 50);
  let g = '';
  const steps = 4;
  for (let i = 0; i <= steps; i++) { const v = min + (max - min) * i / steps; g += `<line x1="${pad}" y1="${Y(v)}" x2="${W - 6}" y2="${Y(v)}" class="grid"/>${T(pad - 5, Y(v), fmt(v, 0), 'tx xs', 'end')}`; }
  vals.forEach((v, i) => { const x = pad + i * bw + bw * .15; g += `<rect x="${x.toFixed(1)}" y="${Y(v).toFixed(1)}" width="${(bw * .7).toFixed(1)}" height="${(Y(min) - Y(v)).toFixed(1)}" rx="3" class="bar"/>${T(x + bw * .35, Y(v) - 8, fmt(v), 'tx xs b')}${T(x + bw * .35, H - 14, labels[i], 'tx xs')}`; });
  g += `<line x1="${pad}" y1="${Y(min)}" x2="${W - 6}" y2="${Y(min)}" class="axis"/>`;
  return svg(W, H, g);
}
const ALIENS = ['Zorp', 'Blip', 'Quix', 'Nova', 'Glim', 'Rax', 'Lumi', 'Tok'];
const median = a => { const s = a.slice().sort((x, y) => x - y), n = s.length; return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; };
const mean = a => a.reduce((s, v) => s + v, 0) / a.length;
function genInfluencer(lvl) {
  const n = lvl === 1 ? 5 : R.int(5, 7);
  const vals = R.sample(Array.from({ length: 86 }, (_, i) => i + 10), n);
  const names = ALIENS.slice(0, n);
  const ask = lvl === 1 ? R.pick(['mean', 'range']) : lvl === 2 ? R.pick(['median', 'mean']) : R.pick(['median', 'mode', 'mean', 'range']);
  if (ask === 'mode') { vals[R.int(1, n - 1)] = vals[0]; }
  const sorted = vals.slice().sort((a, b) => a - b);
  const vis = barChart(vals, names);
  const intro = `Follower (in Tausend) der Alien-Influencer:`;
  if (ask === 'mean') { const m = mean(vals); return { type: 'input', q: `${intro} Berechne das <b>arithmetische Mittel</b>. (2 Dezimalen)`, visual: vis, fields: [round2(m, 'Tsd.')], explain: `(${vals.join(' + ')}) : ${n} = ${vals.reduce((a, b) => a + b, 0)} : ${n} ≈ <b>${fmt(m)}</b>`, hint: 'Mittelwert = Summe aller Werte : Anzahl', step: `Summe: ${vals.reduce((a, b) => a + b, 0)}` }; }
  if (ask === 'range') return { type: 'input', q: `${intro} Wie groß ist die <b>Spannweite</b>?`, visual: vis, fields: [exact(sorted[n - 1] - sorted[0], 'Tsd.')], explain: `Größter Wert ${MINUS} kleinster Wert = ${sorted[n - 1]} ${MINUS} ${sorted[0]} = <b>${sorted[n - 1] - sorted[0]}</b>`, hint: 'Spannweite = Maximum − Minimum' };
  if (ask === 'mode') return { type: 'input', q: `${intro} Welcher Wert ist der <b>Modus</b> (häufigster Wert)?`, visual: vis, fields: [exact(vals[0], 'Tsd.')], explain: `${vals[0]} kommt zweimal vor – das ist der Modus.`, hint: 'Der Modus ist der Wert, der am öftesten vorkommt.' };
  const md = median(vals);
  return { type: 'input', q: `${intro} Bestimme den <b>Median</b>.`, visual: vis, fields: [round2(md, 'Tsd.')], explain: `Geordnet: ${sorted.join(', ')}<br>${n % 2 ? 'Der mittlere Wert' : 'Mittelwert der beiden mittleren Werte'}: <b>${fmt(md)}</b>`, hint: 'Ordne die Werte der Größe nach. Der Median steht genau in der Mitte.', step: `Geordnet: ${sorted.join(', ')}` };
}
function genAusreisser(lvl) {
  const n = 5, vals = Array.from({ length: n }, () => R.int(20, 60)), out = R.int(150, 300);
  const all = vals.concat(out), names = ALIENS.slice(0, n + 1);
  const vis = barChart(all, names, { max: Math.ceil(out / 50) * 50 });
  const intro = `${names[n]} hat plötzlich <b>${out}</b> Tausend Follower – ein Ausreißer!`;
  if (lvl === 1) { const m = mean(all); return { type: 'input', q: `${intro} Wie groß ist jetzt der <b>Mittelwert</b> aller ${n + 1}? (2 Dezimalen)`, visual: vis, fields: [round2(m)], explain: `Ohne Ausreißer: ${fmt(mean(vals))}. Mit Ausreißer: ${all.reduce((a, b) => a + b, 0)} : ${n + 1} ≈ <b>${fmt(m)}</b> – ein großer Sprung!`, hint: 'Alle 6 Werte addieren und durch 6 teilen.' }; }
  if (lvl === 2) { const md = median(all); return { type: 'input', q: `${intro} Wie groß ist jetzt der <b>Median</b> aller ${n + 1}?`, visual: vis, fields: [round2(md)], explain: `Geordnet: ${all.slice().sort((a, b) => a - b).join(', ')}<br>Median = <b>${fmt(md)}</b> (vorher ${fmt(median(vals))}) – kaum Veränderung!`, hint: 'Bei 6 Werten: Mittelwert der beiden mittleren Werte.' }; }
  const dm = mean(all) - mean(vals), dmed = median(all) - median(vals);
  return choice(`${intro} Welcher Kennwert verändert sich dadurch <b>stärker</b>?`, dm > dmed ? 'Der Mittelwert' : 'Der Median', [dm > dmed ? 'Der Median' : 'Der Mittelwert', 'Beide gleich stark', 'Keiner von beiden'],
    { visual: vis, explain: `Mittelwert: ${fmt(mean(vals))} → ${fmt(mean(all))} (+${fmt(dm)})<br>Median: ${fmt(median(vals))} → ${fmt(median(all))} (+${fmt(dmed)})<br>Der Median ist robust gegen Ausreißer.`, hint: 'Der Median schaut nur auf die Mitte, der Mittelwert auf alle Werte.' });
}
const DIAG_TYPES = ['Kreisdiagramm', 'Liniendiagramm', 'Säulendiagramm', 'Punktdiagramm'];
const DIAG_SIT = [
  ['Wie viel Prozent der Klasse mögen welchen Planeten am liebsten? (Anteile an einem Ganzen)', 0],
  ['Die Temperatur auf dem Mars im Laufe eines Tages', 1],
  ['Anzahl der Raketenstarts von 5 Raumhäfen vergleichen', 2],
  ['Zusammenhang zwischen Körpergröße und Schuhgröße von 20 Schülern', 3],
  ['Wofür gibst du dein Taschengeld aus? (Aufteilung in %)', 0],
  ['Die Entwicklung der Follower-Zahl über 12 Monate', 1],
  ['Punkte von 6 Teams beim Mathe-Quiz', 2],
  ['Lernzeit und Testergebnis – gibt es einen Zusammenhang?', 3]
];
const DIAG_WHY = ['Anteile am Ganzen zeigt man als Kreisdiagramm.', 'Entwicklungen über die Zeit zeigt man als Liniendiagramm.', 'Einzelne Werte vergleichen geht am besten mit Säulen.', 'Zusammenhänge zwischen zwei Größen zeigt ein Punktdiagramm (Streudiagramm).'];
function genDiagramm(lvl, ctx) {
  const mis = lvl === 1 ? false : lvl === 2 ? R.chance(.35) : R.chance(.6);
  if (!mis) {
    const s = unused(ctx, DIAG_SIT, s => s[0]);
    return choice(`Welches Diagramm passt am besten?<br><span class="story">${s[0]}</span>`, DIAG_TYPES[s[1]], R.shuffle(DIAG_TYPES.filter(t => t !== DIAG_TYPES[s[1]])),
      { explain: DIAG_WHY[s[1]], hint: 'Anteile → Kreis, Zeitverlauf → Linie, Vergleich → Säulen, Zusammenhang → Punkte.' });
  }
  if (R.chance(.5)) {
    const a = R.int(91, 94), b = a + R.int(2, 5);
    return choice('Diagramm-Doktor: Was ist an diesem Diagramm <b>irreführend</b>?', 'Die y-Achse beginnt nicht bei 0', ['Die Balken sind zu schmal', 'Es fehlt ein Titel in Farbe', 'Die Werte sind falsch beschriftet'],
      { visual: barChart([a, b], ['Team Zorp', 'Team Blip'], { min: 90, max: 100 }), explain: `Weil die Achse bei 90 beginnt, sieht ${b} fast doppelt so groß aus wie ${a} – in Wirklichkeit ist der Unterschied nur ${b - a} Punkte.`, hint: 'Lies die Beschriftung der y-Achse genau.' });
  }
  const p = [R.int(35, 50), R.int(30, 45), R.int(25, 40)];
  const total = p[0] + p[1] + p[2];
  return choice(`Eine Umfrage zeigt: Mars ${p[0]} %, Venus ${p[1]} %, Jupiter ${p[2]} %. Was stimmt da nicht?`, 'Zusammen sind es mehr als 100 %', ['Jupiter ist zu klein', 'Ein Kreisdiagramm darf nur 2 Teile haben', 'Prozentangaben sind bei Planeten verboten'],
    { explain: `${p[0]} + ${p[1]} + ${p[2]} = ${total} %. Teile eines Ganzen müssen genau 100 % ergeben (außer bei Mehrfachantworten – das müsste dann dabeistehen).`, hint: 'Addiere alle Prozentwerte.' });
}
function genHaeufig(lvl) {
  const cats = ['Mars', 'Venus', 'Jupiter', 'Saturn'];
  const n = lvl === 1 ? R.pick([20, 25, 50]) : R.int(21, 39);
  let abs = [];
  for (let g = 0; g < 100; g++) { const a = R.int(1, n - 3), b = R.int(1, n - a - 2), c = R.int(1, n - a - b - 1); abs = R.shuffle([a, b, c, n - a - b - c]); if (abs.every(v => v > 0)) break; }
  const i = R.int(0, 3);
  const table = `<table class="ht"><tr><th>Lieblingsplanet</th>${cats.map(c => `<th>${c}</th>`).join('')}</tr><tr><th>absolute Häufigkeit</th>${abs.map((v, j) => `<td>${lvl === 3 && j === i ? '?' : v}</td>`).join('')}</tr></table>`;
  if (lvl < 3) {
    const rel = abs[i] / n * 100;
    return { type: 'input', q: `${n} Schüler wurden befragt. Wie groß ist die <b>relative Häufigkeit</b> für <b>${cats[i]}</b> in Prozent?${lvl === 2 ? ' (1 Dezimale)' : ''}`, visual: table, fields: [lvl === 1 ? exact(rel, '%') : round1(rel, '%')],
      explain: `${abs[i]} : ${n} = ${fmt(abs[i] / n, 4)} = <b>${fmt(rel, 1)} %</b>`, hint: 'Relative Häufigkeit = absolute Häufigkeit : Gesamtzahl', step: `${abs[i]} : ${n}` };
  }
  const pct = R.pick([10, 20, 25, 30, 40, 50]), N = R.pick([20, 40, 60, 80, 120]), k = N * pct / 100;
  return { type: 'input', q: `In einer anderen Umfrage mit <b>${N}</b> Aliens wählten <b>${pct} %</b> den Saturn. Wie viele Aliens sind das?`, fields: [exact(k, 'Aliens')],
    explain: `${pct} % von ${N} = ${N} · ${pct} : 100 = <b>${k}</b>`, hint: 'Absolute Häufigkeit = relative Häufigkeit · Gesamtzahl' };
}

/* =====================================================================
   BONUS – Rätsel-Mond (Logisches & räumliches Denken)
   ===================================================================== */
const NETS_OK = [
  [[0, 0], [0, 1], [1, 1], [2, 1], [3, 1], [0, 2]], [[0, 0], [0, 1], [1, 1], [2, 1], [3, 1], [1, 2]], [[0, 0], [0, 1], [1, 1], [2, 1], [3, 1], [2, 2]],
  [[0, 0], [0, 1], [1, 1], [2, 1], [3, 1], [3, 2]], [[1, 0], [0, 1], [1, 1], [2, 1], [3, 1], [1, 2]], [[1, 0], [0, 1], [1, 1], [2, 1], [3, 1], [2, 2]],
  [[0, 0], [1, 0], [1, 1], [2, 1], [3, 1], [1, 2]], [[0, 0], [1, 0], [1, 1], [2, 1], [3, 1], [2, 2]], [[0, 0], [1, 0], [1, 1], [2, 1], [3, 1], [3, 2]],
  [[0, 0], [1, 0], [1, 1], [2, 1], [2, 2], [3, 2]], [[0, 0], [1, 0], [2, 0], [2, 1], [3, 1], [4, 1]]
];
const NETS_BAD = [
  [[0, 0], [1, 0], [2, 0], [0, 1], [1, 1], [2, 1]], [[0, 1], [1, 1], [2, 1], [3, 1], [4, 1], [2, 0]], [[0, 0], [3, 0], [0, 1], [1, 1], [2, 1], [3, 1]],
  [[0, 0], [1, 0], [0, 1], [1, 1], [2, 1], [3, 1]], [[0, 0], [1, 0], [2, 0], [0, 1], [0, 2], [0, 3]], [[0, 0], [1, 0], [0, 1], [1, 1], [2, 1], [2, 2]]
];
function transformNet(cells) {
  let c = cells.map(p => p.slice());
  const rot = R.int(0, 3); for (let i = 0; i < rot; i++) c = c.map(([x, y]) => [-y, x]);
  if (R.chance(.5)) c = c.map(([x, y]) => [-x, y]);
  const mx = Math.min(...c.map(p => p[0])), my = Math.min(...c.map(p => p[1]));
  return c.map(([x, y]) => [x - mx, y - my]);
}
function netSvg(cells) {
  const s = 18, w = Math.max(...cells.map(p => p[0])) + 1, h = Math.max(...cells.map(p => p[1])) + 1;
  return `<svg viewBox="-2 -2 ${w * s + 4} ${h * s + 4}" class="net" style="width:${Math.min(130, (w * s + 4) * 1.4)}px">${cells.map(([x, y]) => `<rect x="${x * s}" y="${y * s}" width="${s}" height="${s}" class="netc"/>`).join('')}</svg>`;
}
function genNetz() {
  const good = netSvg(transformNet(R.pick(NETS_OK)));
  const bads = R.sample(NETS_BAD, 3).map(n => netSvg(transformNet(n)));
  return { type: 'choice', q: 'Nur <b>eines</b> dieser Netze lässt sich zu einem Würfel falten. Welches?', options: [good, ...bads], correct: 0, wide: true,
    explain: 'Ein Würfelnetz hat 6 Quadrate, darf keinen 2×2-Block und keine Reihe mit 5 Quadraten enthalten. Bei einer 4er-Reihe muss je ein Quadrat oben und unten hängen.', hint: 'Falte im Kopf: Welche Quadrate würden aufeinander landen?' };
}
function profileSvg(p) {
  const s = 18, h = 3;
  return `<svg viewBox="-2 -2 ${p.length * s + 4} ${h * s + 4}" class="net" style="width:${p.length * s * 1.5}px">${p.map((v, x) => Array.from({ length: v }, (_, k) => `<rect x="${x * s}" y="${(h - 1 - k) * s}" width="${s}" height="${s}" class="netc"/>`).join('')).join('')}<line x1="-2" y1="${h * s}" x2="${p.length * s + 2}" y2="${h * s}" class="axis"/></svg>`;
}
function genAnsicht() {
  let H, front, side;
  for (let g = 0; g < 100; g++) {
    H = [0, 1, 2].map(() => [0, 1, 2].map(() => R.int(0, 3)));
    front = [0, 1, 2].map(c => Math.max(H[0][c], H[1][c], H[2][c]));
    side = [2, 1, 0].map(r => Math.max(...H[r]));
    if (front.every(v => v > 0) && front.join() !== side.join() && H.flat().filter(v => v > 0).length >= 5) break;
  }
  const key = p => p.join(','), opts = [front], seen = new Set([key(front)]);
  const cands = [side, front.slice().reverse(), [0, 1, 2].map(c => Math.min(3, H[0][c] + H[1][c] + H[2][c])), H[2].map(v => v || 1)];
  for (const c of cands) { if (opts.length >= 4) break; if (!seen.has(key(c)) && c.every(v => v > 0)) { seen.add(key(c)); opts.push(c); } }
  let g = 0;
  while (opts.length < 4 && g++ < 50) { const c = front.map(v => Math.max(1, Math.min(3, v + R.int(-1, 1)))); if (!seen.has(key(c))) { seen.add(key(c)); opts.push(c); } }
  const plan = `<div class="plan"><div class="pl-grid">${H.map(r => r.map(v => `<span>${v || ''}</span>`).join('')).join('')}</div><div class="pl-front">▲ vorne ▲</div></div>`;
  return { type: 'choice', q: 'Bauplan von oben: Die Zahlen sagen, wie viele Würfel übereinander stehen. Wie sieht das Gebäude <b>von vorne</b> aus?', visual: plan, options: opts.map(profileSvg), correct: 0, wide: true,
    explain: 'Von vorne siehst du in jeder Spalte den <b>höchsten</b> Turm dieser Spalte.', hint: 'Schau Spalte für Spalte: Welche Zahl ist dort die größte?' };
}
function genFolge(lvl) {
  let seq, next, why;
  const t = lvl === 1 ? R.int(0, 1) : lvl === 2 ? R.int(2, 4) : R.int(4, 6);
  if (t === 0) { const a = R.int(-10, 20), d = R.nz(-9, 12); seq = [0, 1, 2, 3, 4].map(i => a + i * d); next = a + 5 * d; why = `Immer ${d > 0 ? '+' : MINUS} ${Math.abs(d)}.`; }
  else if (t === 1) { const a = R.int(1, 5), q = R.pick([2, 3, -2]); seq = [0, 1, 2, 3, 4].map(i => a * q ** i); next = a * q ** 5; why = `Immer mal ${fmt(q)}.`; }
  else if (t === 2) { const s = R.int(1, 6); seq = [0, 1, 2, 3, 4].map(i => (s + i) ** 2); next = (s + 5) ** 2; why = `Quadratzahlen: ${s}², ${s + 1}², … also ${s + 5}².`; }
  else if (t === 3) { const a = R.int(1, 5), b = R.int(1, 5); seq = [a, b]; for (let i = 2; i < 6; i++) seq.push(seq[i - 1] + seq[i - 2]); next = seq.pop(); why = 'Jede Zahl ist die Summe der beiden davor.'; }
  else if (t === 4) { const a = R.int(1, 10), s = R.int(1, 3); seq = [a]; for (let i = 1; i < 6; i++) seq.push(seq[i - 1] + s + i - 1); next = seq.pop(); why = `Die Abstände wachsen: +${s}, +${s + 1}, +${s + 2}, …`; }
  else if (t === 5) { const s = R.int(1, 3); seq = [0, 1, 2, 3, 4].map(i => (s + i) ** 3); next = (s + 5) ** 3; why = 'Kubikzahlen!'; }
  else { const a = R.int(1, 4); seq = [a]; for (let i = 1; i < 6; i++) seq.push(seq[i - 1] * 2 + 1); next = seq.pop(); why = 'Immer mal 2 plus 1.'; }
  return { type: 'input', q: 'Welche Zahl kommt als Nächstes?', visual: `<div class="expr">${seq.map(v => fmt(v)).join(' · ')} · ?</div>`, fields: [exact(next)], explain: `${why} → <b>${fmt(next)}</b>`, hint: 'Schau dir die Unterschiede zwischen den Zahlen an – oder ob immer multipliziert wird.' };
}

/* =====================================================================
   DIE GALAXIE
   ===================================================================== */
/* =====================================================================
   ERWEITERUNGEN – viel mehr Abwechslung beim Wiederholen
   ===================================================================== */
const NAMES = ['Zorp', 'Blip', 'Quix', 'Nova', 'Glim', 'Rax', 'Lumi', 'Tok', 'Mira', 'Zed', 'Pixi', 'Orla', 'Kosmo', 'Vega', 'Luna', 'Juri', 'Astra', 'Bo'];
const nm = () => R.pick(NAMES);
const isSq = n => Number.isInteger(Math.round(Math.sqrt(n) * 1e9) / 1e9);
const isCu = n => Number.isInteger(Math.round(Math.cbrt(n) * 1e9) / 1e9);
function pyTriple(maxC = 65) {
  for (let g = 0; g < 500; g++) {
    const m = R.int(2, 8), n = R.int(1, m - 1);
    if ((m - n) % 2 === 0 || gcd(m, n) !== 1) continue;
    const k = R.int(1, 5), a = k * (m * m - n * n), b = k * 2 * m * n, c = k * (m * m + n * n);
    if (c <= maxC) return R.chance(.5) ? [a, b, c] : [b, a, c];
  }
  return [3, 4, 5];
}

/* ---------- Planet 1 ---------- */
function genProzent2(lvl) {
  const t = genProzent(lvl);
  const items = ['Laser-Schwert', 'Jetpack', 'Sternenkarte', 'Raumanzug', 'Alien-Plüschtier', 'Mondstein', 'Teleskop', 'Hoverboard', 'Kometen-Eis', 'Roboterhund', 'Gravitationsstiefel', 'Weltraum-Rucksack', 'Sternenlampe', 'Meteoriten-Kette'];
  const shops = ['Weltraum-Shop', 'Mondmarkt', 'Saturn-Kaufhaus', 'Raumhafen-Kiosk', 'Kometen-Laden'];
  t.q = t.q.replace(/Laser-Schwert|Jetpack|Sternenkarte|Raumanzug|Alien-Plüschtier|Mondstein/, R.pick(items)).replace('Weltraum-Shop', R.pick(shops));
  return t;
}

/* ---------- Planet 2 ---------- */
function zooItem(bin, lvl) {
  const sgn = () => R.chance(.35) ? MINUS : '';
  if (bin === 0) {
    const t = R.int(0, lvl === 1 ? 1 : 3);
    if (t === 0) return fmt(R.int(1, 250));
    if (t === 1) { const k = R.int(2, 15); return rt(k * k); }
    if (t === 2) { const b = R.int(2, 6); return frac(b * R.int(2, 9), b); }
    const k = R.int(2, 5); return cbrt(k ** 3);
  }
  if (bin === 1) {
    const t = R.int(0, lvl === 1 ? 0 : 3);
    if (t === 0) return MINUS + R.int(1, 300);
    if (t === 1) { const k = R.int(2, 12); return MINUS + rt(k * k); }
    if (t === 2) { const b = R.int(2, 5); return MINUS + frac(b * R.int(2, 9), b); }
    const k = R.int(2, 4); return cbrt(MINUS + k ** 3);
  }
  if (bin === 2) {
    const t = R.int(0, lvl === 1 ? 1 : 4);
    if (t === 0) { let a, b; do { a = R.int(1, 19); b = R.int(2, 12); } while (a % b === 0); return sgn() + frac(a, b); }
    if (t === 1) { let v; do { v = R.int(1, 999) / 100; } while (Number.isInteger(v)); return sgn() + fmt(v); }
    if (t === 2) return `${R.int(0, 5)},${R.chance(.5) ? R.int(1, 9) : ''}<span class="per">${R.int(1, 9)}</span>`;
    if (t === 3) { let a, b; do { a = R.int(1, 9); b = R.int(2, 9); } while (a % b === 0); return rt(frac(a * a, b * b)); }
    return sgn() + fmt(R.int(1, 99) / 4);
  }
  const t = R.int(0, lvl === 1 ? 1 : 4);
  if (t === 0) { let n; do { n = R.int(2, 99); } while (isSq(n)); return sgn() + rt(n); }
  if (t === 1) return R.pick(['π', '2π', `π + 1`, frac('π', 2), `3 ${MINUS} π`]);
  if (t === 2) { let n; do { n = R.int(2, 60); } while (isCu(n)); return cbrt(n); }
  if (t === 3) { let n; do { n = R.int(2, 30); } while (isSq(n)); return `${R.int(1, 9)} + ${rt(n)}`; }
  return R.pick(['0,1010010001…', '1,2345678910…', '0,12112111211112…', '5,01001000100001…']);
}
function genZoo2(lvl) {
  const bins = [0, 1, 2, 3, R.int(0, 3), R.int(0, 3)], seen = new Set(), items = [];
  for (const b of bins) { let h, g = 0; do { h = zooItem(b, lvl); } while (seen.has(h) && g++ < 30); seen.add(h); items.push({ html: h, bin: b }); }
  return { type: 'bins', q: 'Bring jede Zahl ins <b>kleinste</b> passende Gehege!', bins: ZOO_BINS, items: R.shuffle(items),
    hint: 'ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ. Rechne Wurzeln und Brüche zuerst aus: √25 = 5 ist natürlich!',
    step: 'Frag dich: Kann man die Zahl als Bruch schreiben? Wenn nein → irrational. Wenn ja: ist sie ganz? positiv?' };
}
function genRadar2(lvl) {
  if (lvl === 1 && R.chance(.5)) {
    const dec = R.chance(.4), k = dec ? R.int(11, 39) / 10 : R.int(1, 20), n = k * k;
    const min = Math.max(0, Math.floor(k) - 2);
    return { type: 'numberline', q: `Wo liegt ${rt(fmt(n))}? Setze den Radar-Punkt auf die richtige Stelle!`, label: rt(fmt(n)), value: k, min, max: min + 4, tol: .25,
      explain: `${fmt(k)} · ${fmt(k)} = ${fmt(n)}, also ist ${rt(fmt(n))} = ${fmt(k)}.`, hint: 'Welche Zahl mal sich selbst ergibt die Zahl unter der Wurzel?', step: `Probiere: ${Math.floor(k)} · ${Math.floor(k)} = ${Math.floor(k) ** 2}` };
  }
  if (lvl === 2 && R.chance(.4)) {
    let n; do { n = R.int(101, 400); } while (isSq(n));
    const v = Math.sqrt(n), f = Math.floor(v), min = Math.max(0, f - 1);
    return { type: 'numberline', q: `Wo liegt ${rt(n)}? Setze den Radar-Punkt auf die richtige Stelle!`, label: rt(n), value: v, min, max: min + 4, tol: .2,
      explain: `${f}² = ${f * f} < ${n} < ${(f + 1) ** 2} = ${f + 1}², also ist ${rt(n)} ≈ ${fmt(v)}.`, hint: 'Suche die Quadratzahlen direkt unter und über der Zahl.', step: `${f}² = ${f * f}` };
  }
  return genRadar(lvl);
}
function genQuadrat2(lvl) {
  const t = genQuadrat(lvl);
  const sq = ['quadratisches Landefeld', 'quadratischer Mondgarten', 'quadratisches Schachbrett', 'quadratischer Teppich in der Raumstation', 'quadratisches Fenster', 'quadratischer Spielplatz', 'quadratisches Beet für Weltraum-Tomaten'];
  const cb = ['würfelförmiger Frachtcontainer', 'würfelförmiges Aquarium', 'würfelförmiger Eisblock', 'würfelförmiges Geschenkpaket', 'würfelförmiger Wassertank'];
  t.q = t.q.replace('quadratisches Landefeld', R.pick(sq)).replace('würfelförmiger Frachtcontainer', R.pick(cb));
  if (lvl === 2 && R.chance(.5)) {
    const a = R.int(2, 20), V = a ** 3;
    t.q = `Ein ${R.pick(cb)} hat das Volumen <b>V = ${fmt(V)} cm³</b>. Wie lang ist eine Kante?`; t.fields = [exact(a, 'cm')]; t.visual = cubeSvg(`V = ${fmt(V)} cm³`);
    t.explain = `a = ${cbrt(fmt(V))} = <b>${a} cm</b>, weil ${a} · ${a} · ${a} = ${V}.`; t.step = `Welche Zahl hoch 3 ergibt ${V}?`;
  }
  return t;
}
function genTFZahlen2(lvl, ctx) {
  if (R.chance(.35)) return genTFZahlen(lvl, ctx);
  const t = R.int(0, lvl === 1 ? 4 : 9);
  let s, a, e;
  if (t === 0) { const k = R.int(2, 20), w = R.chance(.5), v = w ? k : k + R.pick([-1, 1, 2]); s = `${rt(k * k)} = ${v}`; a = w; e = `${k} · ${k} = ${k * k}, also ${rt(k * k)} = ${k}.`; }
  else if (t === 1) { const k = R.int(1, 300); const neg = R.chance(.5); s = `${neg ? MINUS : ''}${k} ist eine natürliche Zahl.`; a = !neg; e = neg ? 'Negative Zahlen gehören nicht zu ℕ, aber zu ℤ.' : `${k} ist eine positive ganze Zahl, also natürlich.`; }
  else if (t === 2) { const b = R.int(2, 9), q = R.int(2, 12), div = R.chance(.5), z = div ? b * q : b * q + R.int(1, b - 1); s = `${frac(z, b)} ist eine ganze Zahl.`; a = div; e = div ? `${z} : ${b} = ${q}.` : `${z} : ${b} = ${fmt(z / b, 3)} – keine ganze Zahl.`; }
  else if (t === 3) { const n = R.int(2, 150); s = `${rt(n)} ist irrational.`; a = !isSq(n); e = a ? `${n} ist keine Quadratzahl, darum ist ${rt(n)} irrational.` : `${n} = ${Math.sqrt(n)}², also ist ${rt(n)} = ${Math.sqrt(n)} rational.`; }
  else if (t === 4) { const v = R.int(1, 999) / R.pick([10, 100, 1000]); s = `${fmt(v, 3)} ist eine rationale Zahl.`; a = true; e = `Endliche Dezimalzahlen sind rational, z. B. ${fmt(v, 3)} = ${frac(Math.round(v * 1000), 1000)}.`; }
  else if (t === 5) { let n; do { n = R.int(2, 300); } while (isSq(n)); const f = Math.floor(Math.sqrt(n)), w = R.chance(.5), lo = w ? f : f + R.pick([-1, 1]); s = `${rt(n)} liegt zwischen ${lo} und ${lo + 1}.`; a = w; e = `${f}² = ${f * f} < ${n} < ${(f + 1) ** 2} = ${f + 1}², also liegt ${rt(n)} zwischen ${f} und ${f + 1}.`; }
  else if (t === 6) { const k = R.int(2, 9), w = R.chance(.5), neg = R.chance(.3); s = `${cbrt((neg ? MINUS : '') + k ** 3)} = ${neg ? MINUS : ''}${w ? k : k + 1}`; a = w; e = `${neg ? '(' + MINUS + k + ')' : k}³ = ${neg ? MINUS : ''}${k ** 3}.`; }
  else if (t === 7) { const x = R.int(2, 9), y = R.int(2, 9); s = `${rt(x)} · ${rt(y)} = ${rt(x * y)}`; a = true; e = 'Wurzeln darf man multiplizieren: √a · √b = √(a · b).'; }
  else if (t === 8) { const x = R.int(1, 9) ** 2, y = R.int(1, 9) ** 2; s = `${rt(x)} + ${rt(y)} = ${rt(x + y)}`; a = isSq(x + y) && Math.sqrt(x) + Math.sqrt(y) === Math.sqrt(x + y); e = `${Math.sqrt(x)} + ${Math.sqrt(y)} = ${Math.sqrt(x) + Math.sqrt(y)}, aber ${rt(x + y)} ≈ ${fmt(Math.sqrt(x + y))}. Beim Addieren darf man Wurzeln nicht zusammenfassen!`; }
  else { const k = R.int(2, 15); const w = R.chance(.5); s = `(${rt(k)})² = ${w ? k : k * k}`; a = w; e = `Wurzel und Quadrat heben sich auf: (√${k})² = ${k}.`; }
  return { type: 'tf', statement: s, answer: a, explain: e, hint: 'Rechne Wurzeln aus, wo es geht. Irrational = unendlich viele Nachkommastellen ohne Periode.' };
}

/* ---------- Planet 3 ---------- */
function genLeiter2(lvl) {
  if (lvl !== 1) return genLeiter(lvl);
  let [a, b, c] = pyTriple(30); const h = Math.max(a, b), d = Math.min(a, b);
  const who = R.pick(['Pi-Pi', nm(), 'eine Katze', 'ein Mini-Roboter', nm()]);
  return choice(`${who} sitzt auf einem <b>${h} m</b> hohen Dach fest! Der Fuß der Leiter steht <b>${d} m</b> von der Wand entfernt. Welche Leiter reicht <b>genau</b> bis zur Dachkante?`,
    `${c} m`, R.shuffle([`${h + d} m`, `${c - 1} m`, `${c + 2} m`, `${h} m`, `${c + 1} m`, `${c + 3} m`]), { visual: ladderSvg(h, d), explain: `Leiter = ${rt(`${h}² + ${d}²`)} = ${rt(h * h + d * d)} = <b>${c} m</b>`, hint: 'Die Leiter ist die Hypotenuse: c² = a² + b².', step: `${h}² + ${d}² = ${h * h} + ${d * d} = ${h * h + d * d}` });
}
function genDiagonale2(lvl) {
  const t = genDiagonale(lvl);
  if (lvl === 1 && R.chance(.5)) {
    const [a, b, c] = pyTriple(50), w = R.pick(['Handy-Display', 'Fußballfeld-Modell', 'Tablet', 'Raumschiff-Fenster', 'Fernseher', 'Solarpaneel']);
    return { type: 'input', q: `Ein rechteckiges ${w} ist <b>${a} cm</b> breit und <b>${b} cm</b> hoch. Wie lang ist die Diagonale?`, visual: rectDiagSvg(`${a} cm`, `${b} cm`), fields: [exact(c, 'cm')],
      explain: `d = ${rt(`${a}² + ${b}²`)} = ${rt(a * a + b * b)} = <b>${c} cm</b>`, hint: 'Die Diagonale teilt das Rechteck in zwei rechtwinklige Dreiecke.', step: `d² = ${a}² + ${b}² = ${a * a + b * b}` };
  }
  if (lvl === 2 && R.chance(.4)) {
    const a = R.int(2, 12), d = a * Math.sqrt(3);
    return { type: 'input', q: `Ein Würfel hat die Kante <b>a = ${a} cm</b>. Wie lang ist seine Raumdiagonale? (2 Dezimalen)`, visual: boxSvg(`${a} cm`, `${a} cm`, `${a} cm`, 'space'), fields: [round2(d, 'cm')],
      explain: `d = ${rt(`${a}² + ${a}² + ${a}²`)} = ${rt(3 * a * a)} ≈ <b>${fmt(d)} cm</b>`, hint: 'Raumdiagonale: d = √(a² + b² + c²) – beim Würfel sind alle Kanten gleich.', step: `3 · ${a}² = ${3 * a * a}` };
  }
  return t;
}
const PY_PAIRS = [
  ['a² + b² = c²', 'Satz des Pythagoras'], ['h² = p · q', 'Höhensatz'], ['a² = c · p', 'Kathetensatz für a'], ['b² = c · q', 'Kathetensatz für b'],
  ['c = p + q', 'Hypotenuse aus p und q'], [`c = ${rt('a² + b²')}`, 'Hypotenuse berechnen'], [`a = ${rt(`c² ${MINUS} b²`)}`, 'Kathete a berechnen'],
  [`A = ${frac('a · b', 2)}`, 'Fläche über die Katheten'], [`A = ${frac('c · h', 2)}`, 'Fläche über c und h'], [`h = ${rt('p · q')}`, 'Höhe berechnen']
];
function genFormeln2(lvl, ctx) {
  if (!ctx.didMatch || R.chance(.2)) {
    ctx.didMatch = true;
    const pick = R.sample(PY_PAIRS, 4);
    return { type: 'match', q: 'Verbinde jede Formel mit ihrem Namen!', visual: altitudeSvg(), left: pick.map(p => p[0]), right: pick.map(p => p[1]), hint: 'p liegt unter a, q liegt unter b. Die Höhe h teilt c in p und q.' };
  }
  const t = R.int(0, lvl === 1 ? 1 : lvl === 2 ? 3 : 4);
  if (t === 0) {
    const [x, y, z] = pyTriple(65);
    return { type: 'input', q: `Im rechtwinkligen Dreieck ist <b>a = ${x} cm</b> und <b>b = ${y} cm</b>. Wie lang ist die Hypotenuse c?`, visual: altitudeSvg(), fields: [exact(z, 'cm')], explain: `c = ${rt(`${x}² + ${y}²`)} = ${rt(x * x + y * y)} = <b>${z} cm</b>`, hint: 'Satz des Pythagoras: c² = a² + b²', step: `${x}² + ${y}² = ${x * x + y * y}` };
  }
  if (t === 1) {
    const [x, y, z] = pyTriple(65);
    return { type: 'input', q: `Die Hypotenuse ist <b>c = ${z} cm</b>, die Kathete <b>a = ${x} cm</b>. Wie lang ist b?`, visual: altitudeSvg(), fields: [exact(y, 'cm')], explain: `b = ${rt(`${z}² ${MINUS} ${x}²`)} = ${rt(z * z - x * x)} = <b>${y} cm</b>`, hint: 'Kathete: b² = c² − a²', step: `${z}² ${MINUS} ${x}² = ${z * z - x * x}` };
  }
  if (t === 2) {
    const p = R.int(2, 20), q = R.int(2, 20), c = p + q;
    return { type: 'input', q: `Die Hypotenusenabschnitte sind <b>p = ${p} cm</b> und <b>q = ${q} cm</b>. Wie lang ist die Hypotenuse c?`, visual: altitudeSvg(), fields: [exact(c, 'cm')], explain: `c = p + q = ${p} + ${q} = <b>${c} cm</b>`, hint: 'Die Höhe teilt die Hypotenuse in p und q.' };
  }
  if (t === 3) return genFormeln(lvl === 2 ? 2 : 3, { didMatch: true });
  const [x, y, z] = pyTriple(65), A = x * y / 2, h = x * y / z;
  return { type: 'input', q: `Ein rechtwinkliges Dreieck hat die Katheten <b>${x} cm</b> und <b>${y} cm</b> und die Hypotenuse <b>${z} cm</b>. Wie lang ist die Höhe h auf c? (2 Dezimalen)`, visual: altitudeSvg(), fields: [round2(h, 'cm')],
    explain: `A = ${frac(`${x} · ${y}`, 2)} = ${fmt(A)} cm². Außerdem A = ${frac('c · h', 2)} → h = ${frac('2A', 'c')} = ${frac(fmt(2 * A), z)} ≈ <b>${fmt(h)} cm</b>`, hint: 'Berechne die Fläche zweimal: einmal mit den Katheten, einmal mit c und h.', step: `A = ${x} · ${y} : 2 = ${fmt(A)}` };
}

/* ---------- Planet 4 ---------- */
function genFehler2(lvl, ctx) {
  const t = R.int(0, 11);
  if (t < 4) return genFehler(lvl, ctx);
  let lines, wrong, fix;
  if (t === 4) { const k = R.int(2, 9); lines = [`(x ${MINUS} ${k})² + ${2 * k}x`, `= x² ${MINUS} ${k * k} + ${2 * k}x`, `= x² + ${2 * k}x ${MINUS} ${k * k}`]; wrong = 1; fix = `(x ${MINUS} ${k})² = x² ${MINUS} ${2 * k}x + ${k * k}. Das Ergebnis ist x² + ${k * k}.`; }
  else if (t === 5) { const a = R.int(2, 9), x = R.int(1, 9), b = R.int(1, 15), c = a * x + b; lines = [`${a}x + ${b} = ${c}`, `${a}x = ${c + b}`, `x = ${fmt((c + b) / a)}`]; wrong = 1; fix = `Auf beiden Seiten ${MINUS} ${b}: ${a}x = ${c - b}, also x = ${x}.`; }
  else if (t === 6) { const a = R.int(2, 9), x = R.int(2, 9), b = R.int(1, 15), c = a * x + b; lines = [`${a}x + ${b} = ${c}`, `${a}x = ${c - b}`, `x = ${c - b - a}`]; wrong = 2; fix = `${a}x = ${c - b} → durch ${a} dividieren, nicht ${a} abziehen: x = ${x}.`; }
  else if (t === 7) { const a = R.int(1, 9), b = R.int(1, 9); lines = [`${frac(a, 'x')} + ${frac(b, 'x')}`, `= ${frac(a + b, '2x')}`]; wrong = 1; fix = `Bei gleichem Nenner bleibt der Nenner: ${frac(a + b, 'x')}.`; }
  else if (t === 8) { const k = R.int(2, 6), p = R.int(2, 7), q = R.int(2, 9); lines = [`${k * p}x + ${k * q}`, `= ${k}(${p}x + ${k * q})`]; wrong = 1; fix = `Beide Glieder durch ${k} teilen: ${k}(${p}x + ${q}).`; }
  else if (t === 9) { const e = R.int(2, 5), f = R.int(2, 4); lines = [`(x<sup>${e}</sup>)<sup>${f}</sup> · x`, `= x<sup>${e + f}</sup> · x`, `= x<sup>${e + f + 1}</sup>`]; wrong = 1; fix = `Potenz einer Potenz: Hochzahlen multiplizieren → x<sup>${e * f}</sup> · x = x<sup>${e * f + 1}</sup>.`; }
  else if (t === 10) { const a = R.int(2, 9), b = R.int(2, 9), c = R.int(1, 20); lines = [`(${MINUS}${a}) · (${MINUS}${b}) + ${c}`, `= ${MINUS}${a * b} + ${c}`, `= ${c - a * b}`]; wrong = 1; fix = `Minus mal Minus ergibt Plus: ${a * b} + ${c} = ${a * b + c}.`; }
  else { const a = R.int(2, 6), b = R.int(2, 6); lines = [`${a}x · ${b}x`, `= ${a * b}x`]; wrong = 1; fix = `x · x = x², also ${a * b}x².`; }
  return { type: 'steps', q: 'Der Rechenroboter hat einen Fehler gemacht! Tippe auf die <b>erste falsche Zeile</b>.', lines, wrong, explain: fix, hint: 'Rechne jede Zeile selbst nach. Achte besonders auf Vorzeichen und Hochzahlen.' };
}

/* ---------- Planet 5 ---------- */
KINO.push(
  () => { const n = nm(), a = R.int(5, 60), s = R.int(2, 15), x = R.int(2, 20), Z = a + s * x; return { story: `${n} hat schon ${a} € gespart und legt jede Woche ${s} € dazu. Nach x Wochen hat ${n} <b>${Z} €</b>.`, ask: 'Nach wie vielen Wochen?', eq: `${a} + ${s}x = ${Z}`, wrong: [`${a}x + ${s} = ${Z}`, `${s}x = ${Z}`, `${a} + x = ${Z}`], x, unit: 'Wochen' }; },
  () => { const T = R.int(10, 40) * 10, v = R.int(2, 9), x = R.int(5, 25); if (v * x >= T) return KINO[0](); const Rr = T - v * x; return { story: `Eine Rakete hat ${T} Liter Treibstoff und verbraucht ${v} Liter pro Minute. Nach x Minuten sind noch <b>${Rr} Liter</b> übrig.`, ask: 'Wie viele Minuten ist sie geflogen?', eq: `${T} ${MINUS} ${v}x = ${Rr}`, wrong: [`${T} + ${v}x = ${Rr}`, `${v}x ${MINUS} ${T} = ${Rr}`, `${T} ${MINUS} x = ${Rr}`], x, unit: 'Minuten' }; },
  () => { const x = R.int(3, 50), e = R.int(2, 20), S = 2 * x + e; return { story: `Eine Zahl ist um ${e} größer als eine andere. Zusammen ergeben sie <b>${S}</b>.`, ask: 'Wie heißt die kleinere Zahl?', eq: `x + (x + ${e}) = ${S}`, wrong: [`x + ${e} = ${S}`, `${e}x = ${S}`, `x ${MINUS} (x + ${e}) = ${S}`], x, unit: '' }; },
  () => { let x, e; do { e = R.int(2, 40); } while ((180 - e) % 4); x = (180 - e) / 4; return { story: `In einem Dreieck ist der Winkel β doppelt so groß wie α. Der Winkel γ ist um ${e}° größer als α.`, ask: 'Wie groß ist α (in Grad)?', eq: `x + 2x + (x + ${e}) = 180`, wrong: [`x + 2x + ${e} = 180`, `x + 2x + (x + ${e}) = 360`, `2x + (x + ${e}) = 180`], x, unit: '°' }; },
  () => { const g = R.int(5, 15), p = R.int(2, 6), x = R.int(2, 15), Rr = g + p * x; return { story: `Ein Weltraum-Handytarif kostet ${g} € Grundgebühr plus ${p} € pro GB. Die Rechnung beträgt <b>${Rr} €</b>.`, ask: 'Wie viele GB wurden verbraucht?', eq: `${g} + ${p}x = ${Rr}`, wrong: [`${g}x + ${p} = ${Rr}`, `${p}x = ${Rr} + ${g}`, `(${g} + ${p})x = ${Rr}`], x, unit: 'GB' }; },
  () => { const n1 = nm(); let n2; do { n2 = nm(); } while (n2 === n1); const m = R.int(2, 5), nn = m + R.int(1, 4), x = R.int(2, 12), b = R.int(1, 20), a = b + (nn - m) * x; return { story: `${n1} hat ${a} Kristalle und bekommt jeden Tag ${m} dazu. ${n2} hat ${b} Kristalle und bekommt jeden Tag ${nn} dazu.`, ask: 'Nach wie vielen Tagen haben beide gleich viele?', eq: `${a} + ${m}x = ${b} + ${nn}x`, wrong: [`${a} + ${nn}x = ${b} + ${m}x`, `${a}x + ${m} = ${b}x + ${nn}`, `${a} + ${b} = ${m}x + ${nn}x`], x, unit: 'Tage' }; },
  () => { const x = 2 * R.int(2, 30), k = R.int(1, 20), r = x / 2 + k; return { story: `Wenn man die Hälfte einer Zahl um ${k} vergrößert, erhält man <b>${r}</b>.`, ask: 'Wie heißt die Zahl?', eq: `${frac('x', 2)} + ${k} = ${r}`, wrong: [`2x + ${k} = ${r}`, `${frac(`x + ${k}`, 2)} = ${r}`, `x + ${k} = ${r}`], x, unit: '' }; },
  () => { const n1 = nm(), x = R.int(3, 12), S = x + 2 * x + (2 * x + 3); return { story: `${n1} ist x Jahre alt. Der Bruder ist doppelt so alt, die Schwester ist 3 Jahre älter als der Bruder. Zusammen sind sie <b>${S}</b> Jahre alt.`, ask: `Wie alt ist ${n1}?`, eq: `x + 2x + (2x + 3) = ${S}`, wrong: [`x + 2x + 3 = ${S}`, `x + 2x + (x + 3) = ${S}`, `2x + (2x + 3) = ${S}`], x, unit: 'Jahre' }; },
  () => { const x = R.int(4, 30), k = R.int(2, 4), e = R.int(1, 10), r = k * (x + e); return { story: `Pi-Pi addiert zu einer Zahl ${e} und multipliziert das Ergebnis mit ${k}. Heraus kommt <b>${r}</b>.`, ask: 'Welche Zahl war es?', eq: `${k}(x + ${e}) = ${r}`, wrong: [`${k}x + ${e} = ${r}`, `x + ${e} · ${k} = ${r}`, `${k}x = ${r} + ${e}`], x, unit: '' }; },
  () => { const x = R.int(5, 40), p = R.pick([2, 3, 4]), S = x + p * x + 10; return { story: `Auf der Raumstation leben x Menschen, ${p}-mal so viele Roboter und 10 Aliens. Insgesamt sind es <b>${S}</b> Bewohner.`, ask: 'Wie viele Menschen leben dort?', eq: `x + ${p}x + 10 = ${S}`, wrong: [`x + ${p} + 10 = ${S}`, `${p}x + 10 = ${S}`, `x · ${p}x + 10 = ${S}`], x, unit: 'Menschen' }; }
);
function genKino2(lvl, ctx) {
  const i = unused(ctx, KINO.map((_, k) => k));
  const s = KINO[i]();
  if (lvl === 1) return choice(`<span class="story">🎬 ${s.story}</span><br>Welche Gleichung passt?`, s.eq, s.wrong,
    { explain: `<b>${s.eq}</b> → x = ${s.x}${s.unit ? ' ' + s.unit : ''}`, hint: 'Überlege zuerst: Wofür steht x? Dann übersetze Satz für Satz.' });
  return { type: 'input', q: `<span class="story">🎬 ${s.story}</span><br><b>${s.ask}</b>`, fields: [exact(s.x, s.unit)],
    explain: `Gleichung: <b>${s.eq}</b><br>Lösung: x = <b>${s.x}</b>${s.unit ? ' ' + s.unit : ''}`, hint: 'Stelle zuerst eine Gleichung auf und löse sie dann.', step: `Die Gleichung lautet: ${s.eq}` };
}
function genEnergie2(lvl) {
  if (lvl === 1 && R.chance(.5)) {
    const things = [['Akkus', 'h Laufzeit', 'h'], ['Windräder', 'kW', 'kW'], ['Wasserstoff-Tanks', 'km Reichweite', 'km'], ['Batterien', 'Wh', 'Wh']];
    const [th, what, unit] = R.pick(things), n = R.int(2, 8), k = R.int(3, 60); let m; do { m = R.int(2, 15); } while (m === n);
    return { type: 'input', q: `<b>${n}</b> ${th} ergeben zusammen <b>${n * k} ${what}</b>. Wie viel ergeben <b>${m}</b> ${th}?`, fields: [exact(m * k, unit)],
      explain: `Für 1: ${n * k} : ${n} = ${k} ${unit}. Für ${m}: ${m} · ${k} = <b>${m * k} ${unit}</b>`, hint: 'Direkt proportional: zuerst auf 1 zurückrechnen.', step: `${n * k} : ${n} = ?` };
  }
  if (lvl === 3 && R.chance(.4)) {
    let a, b, x, m, n; for (let g = 0; g < 200; g++) { a = R.int(2, 6); b = R.int(2, 6); x = R.int(-10, 20); m = R.int(1, 9); if (a !== b && (x + m) % a === 0 && b * (x + m) / a - x) { n = b * (x + m) / a - x; break; } }
    if (n == null) return genEnergie(3);
    return { type: 'input', q: `Löse die Bruchgleichung: <div class="expr">${frac(`x + ${m}`, a)} = ${frac(lin(1, n), b)}</div>`, fields: [exact(x, '', 'x =')],
      explain: `Über Kreuz multiplizieren: ${b}(x + ${m}) = ${a}(${lin(1, n)})<br>${lin(b, b * m)} = ${lin(a, a * n)}<br>${mono(b - a, 'x', true)} = ${fmt(a * n - b * m)} → x = <b>${fmt(x)}</b>`, hint: 'Multipliziere über Kreuz (oder mit dem gemeinsamen Nenner).', step: `${b}(x + ${m}) = ${a}(${lin(1, n)})` };
  }
  return genEnergie(lvl);
}

/* ---------- Planet 6 ---------- */
const KREIS_FACTS = [
  ['Wie viele Symmetrieachsen hat ein Kreis?', 'Unendlich viele', ['Genau eine', 'Genau zwei', 'Vier'], 'Jede Gerade durch den Mittelpunkt ist eine Symmetrieachse.'],
  ['Welche Sehne ist die längste?', 'Der Durchmesser', ['Jede ist gleich lang', 'Die Tangente', 'Der Radius'], 'Der Durchmesser ist die Sehne durch den Mittelpunkt – länger geht es nicht.'],
  ['Wie steht die Tangente zum Radius im Berührpunkt?', 'Normal (90°)', ['Parallel', 'Im 45°-Winkel', 'Das ist immer anders'], 'Tangente und Berührradius stehen normal aufeinander.'],
  ['Wie viele gemeinsame Punkte haben Kreis und Sekante?', 'Zwei', ['Einen', 'Keinen', 'Unendlich viele'], 'Eine Sekante schneidet den Kreis in zwei Punkten.'],
  ['Wie viele gemeinsame Punkte haben Kreis und Passante?', 'Keinen', ['Einen', 'Zwei', 'Drei'], 'Eine Passante geht am Kreis vorbei.'],
  ['Was ist π ungefähr?', '3,14', ['3,41', '2,72', '1,41'], 'π ≈ 3,14159… – das Verhältnis von Umfang zu Durchmesser.'],
  ['Wie hängt der Umfang mit dem Durchmesser zusammen?', 'u = d · π', ['u = d²', 'u = 2 · d', 'u = d : π'], 'Der Umfang ist etwas mehr als 3-mal so lang wie der Durchmesser.'],
  ['Was passiert mit der Kreisfläche, wenn man den Radius verdoppelt?', 'Sie wird 4-mal so groß', ['Sie verdoppelt sich', 'Sie bleibt gleich', 'Sie wird 8-mal so groß'], 'A = r²π: Doppelter Radius → (2r)² = 4r².'],
  ['Was passiert mit dem Umfang, wenn man den Radius verdoppelt?', 'Er verdoppelt sich', ['Er wird 4-mal so groß', 'Er bleibt gleich', 'Er halbiert sich'], 'u = 2rπ wächst gleichmäßig mit r.'],
  ['Ein Kreisausschnitt hat α = 90°. Welcher Teil des Kreises ist das?', 'Ein Viertel', ['Ein Drittel', 'Die Hälfte', 'Ein Achtel'], '90° von 360° = 1/4.'],
  ['Ein Kreisausschnitt hat α = 120°. Welcher Teil des Kreises ist das?', 'Ein Drittel', ['Ein Viertel', 'Die Hälfte', 'Ein Sechstel'], '120° von 360° = 1/3.'],
  ['Wie heißen Kreise mit gemeinsamem Mittelpunkt?', 'Konzentrische Kreise', ['Parallele Kreise', 'Tangentenkreise', 'Zwillingskreise'], 'Konzentrisch = gleicher Mittelpunkt, z. B. beim Kreisring.']
];
function genBegriffe2(lvl, ctx) {
  const r = R.int(0, 9);
  if (r < 4) return genBegriffe(lvl, ctx);
  if (r < 6) {
    const pool = KREIS_BEGRIFFE.filter(k => k[1] <= lvl), it = R.pick(pool), others = R.sample(pool.filter(k => k[0] !== it[0]), 3);
    return { type: 'choice', q: `Auf welchem Bild siehst du: <b>${it[0]}</b>?`, options: [circleSvg(it[0]), ...others.map(o => circleSvg(o[0]))], correct: 0, wide: true, key: 'pic' + it[0],
      explain: `<b>${it[0]}</b>: ${it[2]}`, hint: 'Achte darauf, ob die Linie durch den Mittelpunkt geht oder über den Kreis hinausreicht.' };
  }
  if (r < 8) {
    const f = unused(ctx, KREIS_FACTS, x => x[0]);
    return choice(f[0], f[1], f[2], { explain: f[3], hint: 'Denk an die Formeln u = 2rπ und A = r²π.' });
  }
  const k = R.int(2, 40), toD = R.chance(.5);
  return { type: 'input', q: toD ? `Ein Kreis hat den Radius <b>r = ${k} cm</b>. Wie lang ist der Durchmesser?` : `Ein Kreis hat den Durchmesser <b>d = ${2 * k} cm</b>. Wie lang ist der Radius?`, visual: circleSvg(toD ? 'Radius' : 'Durchmesser'),
    fields: [exact(toD ? 2 * k : k, 'cm')], explain: toD ? `d = 2 · r = 2 · ${k} = <b>${2 * k} cm</b>` : `r = d : 2 = ${2 * k} : 2 = <b>${k} cm</b>`, hint: 'Der Durchmesser ist doppelt so lang wie der Radius.' };
}
function genPizza2(lvl) {
  const t = genPizza(lvl);
  const who = R.pick(['Ein Alien', nm(), 'Ein hungriger Roboter', 'Pi-Pi', 'Die Mondfamilie']);
  t.q = t.q.replace('Ein Alien bestellt', `${who} bestellt`);
  return t;
}

/* ---------- Planet 7 ---------- */
function genKoerper2(lvl) {
  const V = [['Zylinder', 'V = r²π · h'], ['Kegel', `V = ${frac('r²π · h', 3)}`], ['Kugel', `V = ${frac(4, 3)} · r³π`], ['Würfel', 'V = a³'], ['Quader', 'V = a · b · c'], ['Pyramide', `V = ${frac('G · h', 3)}`], ['Halbkugel', `V = ${frac(2, 3)} · r³π`], ['Prisma', 'V = G · h']];
  const O = [['Zylinder', 'O = 2r²π + 2rπh'], ['Kegel', 'O = r²π + rπs'], ['Kugel', 'O = 4r²π'], ['Würfel', 'O = 6a²'], ['Quader', 'O = 2(ab + ac + bc)'], ['Prisma', 'O = 2G + M'], ['Pyramide', 'O = G + M']];
  const icon = n => ['Zylinder', 'Kegel', 'Kugel', 'Würfel'].includes(n) ? bodyIcon(n) : '';
  if (lvl < 3) {
    const set = R.sample(lvl === 1 ? V : O, 4);
    return { type: 'match', q: `Verbinde jeden Körper mit der Formel für ${lvl === 1 ? 'sein <b>Volumen</b>' : 'seine <b>Oberfläche</b>'}!`, left: set.map(s => `<span class="bodyl">${icon(s[0])}${s[0]}</span>`), right: set.map(s => s[1]),
      hint: lvl === 1 ? 'Spitze Körper (Kegel, Pyramide) haben ein Drittel vom Volumen des passenden „geraden“ Körpers.' : 'Der Kegel hat eine Mantellinie s. Die Kugel hat keine Grundfläche.' };
  }
  return genKoerper(3);
}
function genEis2(lvl) {
  const t = genEis(lvl);
  t.q = t.q.replace('Eine Eistüte', R.pick(['Eine Eistüte', 'Eine Waffeltüte', 'Ein kegelförmiger Becher', 'Ein Partyhut-Becher']));
  return t;
}

/* ---------- Planet 8 ---------- */
function genFunkTF2(lvl, ctx) {
  if (R.chance(.4)) return genFunkTF(lvl, ctx);
  const k = R.nz(-5, 5), d = R.int(-8, 8), t = R.int(0, lvl === 1 ? 2 : 5), f = `y = ${lin(k, d)}`;
  let s, a, e;
  if (t === 0) { const w = R.chance(.5), kk = w ? k : k + R.nz(-2, 2); s = `${f} hat die Steigung ${fmt(kk)}.`; a = w; e = `In y = kx + d ist k die Steigung, hier k = ${fmt(k)}.`; }
  else if (t === 1) { const w = R.chance(.5), dd = w ? d : d + R.nz(-3, 3); s = `${f} schneidet die y-Achse bei ${fmt(dd)}.`; a = w; e = `Der y-Achsenabschnitt ist d = ${fmt(d)}.`; }
  else if (t === 2) { const up = R.chance(.5); s = `Der Graph von ${f} ${up ? 'steigt' : 'fällt'}.`; a = up === (k > 0); e = `k = ${fmt(k)} ist ${k > 0 ? 'positiv → steigt' : 'negativ → fällt'}.`; }
  else if (t === 3) { const x = R.int(-4, 4), w = R.chance(.5), y = k * x + d + (w ? 0 : R.nz(-3, 3)); s = `Der Graph von ${f} geht durch P(${fmt(x)} | ${fmt(y)}).`; a = w; e = `${fmt(k)} · ${sg(x)} ${signed(d)} = ${fmt(k * x + d)}${w ? ' ✓' : `, nicht ${fmt(y)}`}.`; }
  else if (t === 4) { const hom = R.chance(.5), dd = hom ? 0 : R.nz(-8, 8); s = `y = ${lin(k, dd)} ist eine homogene lineare Funktion.`; a = dd === 0; e = a ? 'Ohne d (d = 0) heißt die Funktion homogen – der Graph geht durch den Ursprung.' : `Mit d = ${fmt(dd)} ist sie inhomogen.`; }
  else { const x0 = -d / k, w = R.chance(.5); const claim = w ? x0 : x0 + R.nz(-3, 3); s = `${f} hat die Nullstelle x = ${fmt(claim)}.`; a = Math.abs(claim - x0) < 1e-9; e = `0 = ${lin(k, d)} → x = ${fmt(x0)}.`; }
  return { type: 'tf', statement: s, answer: a, explain: e, hint: 'y = kx + d: k ist die Steigung, d der Schnitt mit der y-Achse.' };
}

/* ---------- Planet 9 ---------- */
TEXT2.push(
  () => { const s = R.int(2, 6), w = R.int(1, 4); let a1, b1, a2, b2; do { a1 = R.int(1, 5); b1 = R.int(1, 5); a2 = R.int(1, 5); b2 = R.int(1, 5); } while (a1 * b2 === a2 * b1); return { s: `Im Mond-Café kosten ${a1} Säfte und ${b1} Wasser <b>${a1 * s + b1 * w} €</b>, ${a2} Säfte und ${b2} Wasser kosten <b>${a2 * s + b2 * w} €</b>.`, f: [exact(s, '€', 'Saft:'), exact(w, '€', 'Wasser:')], sys: [`${a1}x + ${b1}y = ${a1 * s + b1 * w}`, `${a2}x + ${b2}y = ${a2 * s + b2 * w}`], vars: 'x = Preis Saft, y = Preis Wasser' }; },
  () => { const b = R.int(3, 20), e = R.int(1, 15), l = b + e; return { s: `Ein Rechteck ist ${e} cm länger als breit. Sein Umfang beträgt <b>${2 * (l + b)} cm</b>.`, f: [exact(l, 'cm', 'Länge:'), exact(b, 'cm', 'Breite:')], sys: [`x = y + ${e}`, `2x + 2y = ${2 * (l + b)}`], vars: 'x = Länge, y = Breite' }; },
  () => { const h = R.int(3, 20), k = R.int(3, 20); return { s: `Auf dem Mondbauernhof leben Weltraum-Hühner (2 Beine) und Mondhasen (4 Beine): zusammen <b>${h + k}</b> Tiere mit <b>${2 * h + 4 * k}</b> Beinen.`, f: [exact(h, '', 'Hühner:'), exact(k, '', 'Mondhasen:')], sys: [`x + y = ${h + k}`, `2x + 4y = ${2 * h + 4 * k}`], vars: 'x = Hühner, y = Mondhasen' }; },
  () => { const s = R.int(2, 12), u = R.int(1, 10); return { s: `Team Zorp hat ${s + u} Spiele ohne Niederlage gespielt. Für einen Sieg gibt es 3 Punkte, für ein Unentschieden 1 Punkt. Insgesamt: <b>${3 * s + u}</b> Punkte.`, f: [exact(s, '', 'Siege:'), exact(u, '', 'Unentschieden:')], sys: [`x + y = ${s + u}`, `3x + y = ${3 * s + u}`], vars: 'x = Siege, y = Unentschieden' }; },
  () => { const n1 = nm(); let n2; do { n2 = nm(); } while (n2 === n1); const y = R.int(5, 30), e = R.int(1, 15), x = y + e; return { s: `${n1} ist ${e} Jahre älter als ${n2}. Zusammen sind sie <b>${x + y}</b> Jahre alt.`, f: [exact(x, 'Jahre', `${n1}:`), exact(y, 'Jahre', `${n2}:`)], sys: [`x = y + ${e}`, `x + y = ${x + y}`], vars: `x = Alter von ${n1}, y = Alter von ${n2}` }; },
  () => { const a = R.int(5, 40), b = R.int(5, 40), k = R.int(2, 4); return { s: `Die Summe zweier Zahlen ist <b>${a + b}</b>. Das ${k}-Fache der ersten Zahl ist um <b>${k * a - b}</b> größer als die zweite Zahl.`, f: [exact(a, '', '1. Zahl:'), exact(b, '', '2. Zahl:')], sys: [`x + y = ${a + b}`, `${k}x ${MINUS} y = ${k * a - b}`], vars: 'x = 1. Zahl, y = 2. Zahl' }; }
);
function genText2b(lvl, ctx) {
  const i = unused(ctx, TEXT2.map((_, k) => k));
  const t = TEXT2[i]();
  return { type: 'input', q: `<span class="story">🎬 ${t.s}</span>`, fields: t.f,
    explain: `${t.vars}<br>I: ${t.sys[0]}<br>II: ${t.sys[1]}<br>Lösung: <b>${t.f.map(f => f.label + ' ' + fmt(f.answer)).join(', ')}</b>`, hint: 'Lege fest, wofür x und y stehen. Dann stelle zwei Gleichungen auf.', step: `I: ${t.sys[0]} · II: ${t.sys[1]}` };
}

/* ---------- Planet 10 ---------- */
const DATA_TOPICS = [
  { intro: 'Follower (in Tausend) der Alien-Influencer:', unit: 'Tsd.' }, { intro: 'Sprunghöhen (in cm) beim Mond-Hochsprung:', unit: 'cm' },
  { intro: 'Punkte beim Galaxie-Quiz:', unit: 'Punkte' }, { intro: 'Bildschirmzeit (in Minuten) am Sonntag:', unit: 'min' },
  { intro: 'Gesammelte Sternschnuppen in einer Woche:', unit: 'Stück' }, { intro: 'Laufzeit (in Sekunden) beim Raumhafen-Sprint:', unit: 's' },
  { intro: 'Taschengeld (in €) im Monat:', unit: '€' }, { intro: 'Seiten gelesen in den Ferien:', unit: 'Seiten' }
];
function genInfluencer2(lvl) {
  const t = genInfluencer(lvl), topic = R.pick(DATA_TOPICS);
  t.q = t.q.replace('Follower (in Tausend) der Alien-Influencer:', topic.intro);
  t.fields = t.fields.map(f => ({ ...f, unit: f.unit === 'Tsd.' ? topic.unit : f.unit }));
  const names = R.sample(NAMES, 8); let i = 0;
  t.visual = t.visual.replace(/>(Zorp|Blip|Quix|Nova|Glim|Rax|Lumi|Tok)</g, () => '>' + names[i++] + '<');
  return t;
}
DIAG_SIT.push(
  ['Wie hat sich die Einwohnerzahl einer Stadt von 1950 bis heute verändert?', 1],
  ['Wie viele Tore haben 5 Spieler in der Saison geschossen?', 2],
  ['Wie ist die Zeit eines Tages auf Schule, Schlaf und Freizeit aufgeteilt?', 0],
  ['Hängen Trainingsstunden und Sprintzeit zusammen?', 3],
  ['Der Wasserstand eines Flusses jede Stunde gemessen', 1],
  ['Lieblingsfarben in der Klasse als Anteile', 0],
  ['Verkaufte Eis-Kugeln an jedem Wochentag vergleichen', 2],
  ['Alter und Preis von 30 gebrauchten Fahrrädern', 3],
  ['Wahlergebnis der Klassensprecherwahl in Prozent', 0],
  ['Die Körpergröße eines Kindes von 1 bis 14 Jahren', 1],
  ['Einwohnerzahlen der 6 größten Städte Österreichs vergleichen', 2],
  ['Außentemperatur und verkaufte Getränke an 25 Tagen', 3]
);
function genHaeufig2(lvl) {
  const sets = [['Lieblingsplanet', ['Mars', 'Venus', 'Jupiter', 'Saturn']], ['Lieblingsfach', ['Mathe', 'Sport', 'Englisch', 'Musik']], ['Haustier', ['Hund', 'Katze', 'Hase', 'keines']],
    ['Schulweg', ['zu Fuß', 'Rad', 'Bus', 'Auto']], ['Lieblingsspeise', ['Pizza', 'Nudeln', 'Schnitzel', 'Sushi']], ['Sportart', ['Fußball', 'Schwimmen', 'Tanzen', 'Klettern']]];
  const [title, cats] = R.pick(sets);
  const t = genHaeufig(lvl);
  const old = ['Mars', 'Venus', 'Jupiter', 'Saturn'];
  for (let i = 0; i < 4; i++) { t.q = t.q.split(old[i]).join(cats[i]); if (t.visual) t.visual = t.visual.split(`<th>${old[i]}</th>`).join(`<th>${cats[i]}</th>`); }
  if (t.visual) t.visual = t.visual.replace('Lieblingsplanet', title);
  t.q = t.q.replace('den ' + cats[3], `„${cats[3]}“`).replace('Schüler', R.pick(['Schüler', 'Jugendliche', 'Aliens', 'Kinder']));
  return t;
}

/* ---------- Bonus ---------- */
function genFolge2(lvl) {
  if (R.chance(.6)) return genFolge(lvl);
  let seq, next, why;
  const t = R.int(0, 3);
  if (t === 0) { const a = R.int(1, 9), d = R.int(2, 9); seq = []; let v = a; for (let i = 0; i < 6; i++) { seq.push(v); v = i % 2 === 0 ? v + d : v - 1; } next = seq.pop(); why = `Abwechselnd +${d} und ${MINUS}1.`; }
  else if (t === 1) { const a = R.int(200, 900); seq = [0, 1, 2, 3, 4, 5].map(i => a - i * 7 * (lvl + 1)); next = seq.pop(); why = `Immer ${MINUS} ${7 * (lvl + 1)}.`; }
  else if (t === 2) { const a = R.pick([1024, 729, 512, 2048, 4096]), q = a === 729 ? 3 : 2; seq = [0, 1, 2, 3, 4, 5].map(i => a / q ** i); next = seq.pop(); why = `Immer durch ${q}.`; }
  else { seq = [1, 2, 3, 4, 5, 6].map(i => i * (i + 1)); const s = R.int(0, 3); seq = seq.map((v, i) => (i + 1 + s) * (i + 2 + s)); next = seq.pop(); why = 'n · (n + 1): 1·2, 2·3, 3·4, …'; }
  return { type: 'input', q: 'Welche Zahl kommt als Nächstes?', visual: `<div class="expr">${seq.map(v => fmt(v)).join(' · ')} · ?</div>`, fields: [exact(next)], explain: `${why} → <b>${fmt(next)}</b>`, hint: 'Schau dir die Unterschiede zwischen den Zahlen an – oder ob immer multipliziert/dividiert wird.' };
}

/* ---------- Quadratzahlen 0–20 und ihre Wurzeln ---------- */
const sqMax = lvl => lvl === 1 ? 10 : lvl === 2 ? 15 : 20;
const near = (v, max) => R.shuffle([v - 1, v + 1, v + 2, v - 2, v * 2, v + 10, v - 10].filter(x => x >= 0 && x !== v && x <= max));
function genQuadratBlitz(lvl, ctx) {
  const M = sqMax(lvl), n = R.int(0, M), q = n * n;
  const t = lvl === 1 ? R.pick([0, 1, 2, 3, 5]) : R.int(0, 5);
  if (t === 0) return { type: 'input', q: 'Berechne die Quadratzahl!', visual: `<div class="expr">${n}² = ?</div>`, fields: [exact(q)],
    explain: `${n}² = ${n} · ${n} = <b>${q}</b>`, hint: 'Quadrieren heißt: die Zahl mit sich selbst multiplizieren.', step: `${n} · ${n} = ?` };
  if (t === 1) return { type: 'input', q: 'Berechne die Quadratwurzel!', visual: `<div class="expr">${rt(q)} = ?</div>`, fields: [exact(n)],
    explain: `${rt(q)} = <b>${n}</b>, weil ${n} · ${n} = ${q}.`, hint: 'Welche Zahl mit sich selbst multipliziert ergibt die Zahl unter der Wurzel?', step: `Probiere: ${Math.max(0, n - 1)} · ${Math.max(0, n - 1)} = ${Math.max(0, n - 1) ** 2}` };
  if (t === 2) {
    const sq = R.chance(.5);
    if (sq) return choice(`Was ist <b>${n}²</b>?`, fmt(q), near(q, 400).map(fmt).concat([fmt(2 * n), fmt(n + n + 1)]), { fill: () => fmt(R.int(0, M) ** 2 + R.int(-3, 3)), explain: `${n}² = ${n} · ${n} = <b>${q}</b>. Achtung: ${n}² ist nicht ${n} · 2!`, hint: 'Quadrat = Zahl mal sich selbst.' });
    return choice(`Was ist <b>${rt(q)}</b>?`, fmt(n), near(n, 20).map(fmt).concat([fmt(q / 2)]), { fill: () => fmt(R.int(0, 20)), explain: `${rt(q)} = <b>${n}</b>, weil ${n}² = ${q}.`, hint: 'Die Wurzel ist die Umkehrung vom Quadrieren.' });
  }
  if (t === 3) {
    const isS = R.chance(.5), sqs = Array.from({ length: M + 1 }, (_, i) => i * i);
    let v; if (isS) v = R.pick(sqs.slice(2)); else { do { v = R.int(2, M * M); } while (sqs.includes(v)); }
    const f = Math.floor(Math.sqrt(v));
    return { type: 'tf', statement: `${v} ist eine Quadratzahl.`, answer: isS, explain: isS ? `${v} = ${Math.sqrt(v)}² = ${Math.sqrt(v)} · ${Math.sqrt(v)}.` : `${f}² = ${f * f} und ${f + 1}² = ${(f + 1) ** 2} – ${v} liegt dazwischen, ist also keine Quadratzahl.`, hint: 'Kennst du eine Zahl, die mit sich selbst multipliziert genau diese Zahl ergibt?' };
  }
  if (t === 4) {
    const a = R.int(1, M), b = R.int(0, M), op = R.int(0, 2);
    if (op === 0) return { type: 'input', q: 'Rechne im Kopf!', visual: `<div class="expr">${a}² + ${b}² = ?</div>`, fields: [exact(a * a + b * b)], explain: `${a * a} + ${b * b} = <b>${a * a + b * b}</b>`, hint: 'Zuerst beide Quadrate ausrechnen, dann addieren.', step: `${a}² = ${a * a}` };
    if (op === 1) return { type: 'input', q: 'Rechne im Kopf!', visual: `<div class="expr">${rt(a * a)} + ${rt(b * b)} = ?</div>`, fields: [exact(a + b)], explain: `${rt(a * a)} = ${a}, ${rt(b * b)} = ${b} → <b>${a + b}</b>`, hint: 'Zuerst beide Wurzeln ziehen, dann addieren.', step: `${rt(a * a)} = ${a}` };
    return { type: 'input', q: 'Rechne im Kopf!', visual: `<div class="expr">${rt(a * a)} · ${b}² = ?</div>`, fields: [exact(a * b * b)], explain: `${rt(a * a)} = ${a}, ${b}² = ${b * b} → ${a} · ${b * b} = <b>${a * b * b}</b>`, hint: 'Wurzel und Quadrat zuerst, dann multiplizieren.' };
  }
  const neg = R.chance(.5);
  return { type: 'input', q: neg ? 'Achtung, Vorzeichen-Falle!' : 'Fehlende Zahl gesucht:', visual: neg ? `<div class="expr">(${MINUS}${n})² = ?</div>` : `<div class="expr">? ² = ${q}</div>`, fields: [exact(neg ? q : n)],
    explain: neg ? `(${MINUS}${n}) · (${MINUS}${n}) = <b>${q}</b> – minus mal minus ergibt plus!` : `<b>${n}</b>² = ${q}. (Auch (${MINUS}${n})² = ${q}, aber wir suchen die positive Zahl.)`, hint: neg ? 'Minus mal minus ergibt plus.' : 'Das ist dasselbe wie die Wurzel ziehen.' };
}
function genQuadratMemory(lvl) {
  const M = sqMax(lvl), count = lvl === 1 ? 5 : 6, pairs = [], used = new Set();
  const ns = R.sample(Array.from({ length: M + 1 }, (_, i) => i).filter(i => i > 0 || lvl > 1), count * 2);
  for (const n of ns) {
    if (pairs.length >= count) break;
    const p = R.chance(lvl === 1 ? .7 : .5) ? [`${n}²`, String(n * n)] : [rt(n * n), String(n)];
    if (used.has(p[0]) || used.has(p[1])) continue;
    used.add(p[0]); used.add(p[1]); pairs.push(p);
  }
  return { type: 'memory', q: 'Finde die Paare: Quadrat oder Wurzel und ihr Ergebnis!', pairs, hint: 'n² = n · n und √(n²) = n' };
}
function genQuadratTreppe(lvl) {
  const M = sqMax(lvl), ns = R.sample(Array.from({ length: M + 1 }, (_, i) => i), 4);
  const asRoot = R.chance(.5);
  return { type: 'match', q: asRoot ? 'Verbinde jede Wurzel mit ihrem Wert!' : 'Verbinde jede Zahl mit ihrem Quadrat!',
    left: ns.map(n => asRoot ? rt(n * n) : `${n}²`), right: ns.map(n => String(asRoot ? n : n * n)),
    hint: 'Quadratzahlen bis 20²: 0, 1, 4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144, 169, 196, 225, 256, 289, 324, 361, 400' };
}

const PLANETS = [
  { id: 'p1', name: 'Startrampe', topic: 'Wiederholung 3. Klasse', hue: 28, ring: false, boss: 'NULL-Bot Mk I', games: [
    { id: 'countdown', name: 'Vorzeichen-Countdown', icon: '🚀', desc: 'Rechne mit Vorzeichen – jede Lösung gibt einen Buchstaben für das Startwort.', kind: 'word', gen: genSigned },
    { id: 'potenz', name: 'Potenz-Treppe', icon: '🪜', desc: 'Verbinde Potenzen mit ihren Werten.', rounds: 4, gen: genPotenz },
    { id: 'prozent', name: 'Prozent-Shop', icon: '🛒', desc: 'Rabatte im Weltraum-Shop berechnen.', rounds: 5, gen: genProzent2 },
    { id: 'rennen', name: 'Zeitrennen', icon: '⏱️', desc: '60 Sekunden – wie viele schaffst du?', kind: 'timed', gen: genSigned, noBoss: true }] },
  { id: 'p2', name: 'Zahlen-Nebel', topic: 'Reelle Zahlen & Wurzeln', hue: 265, ring: true, boss: 'Irrational-Bot', games: [
    { id: 'qblitz', name: 'Quadrat-Blitz', icon: '⚡', desc: 'Quadratzahlen von 0² bis 20² und ihre Wurzeln.', rounds: 8, gen: genQuadratBlitz },
    { id: 'qmemo', name: 'Wurzel-Memory', icon: '🃏', desc: 'Finde Quadrate und Wurzeln mit ihren Ergebnissen.', rounds: 2, gen: genQuadratMemory, noBoss: true },
    { id: 'qtreppe', name: 'Quadrat-Verbinder', icon: '🔗', desc: 'Verbinde Zahlen mit ihren Quadraten.', rounds: 4, gen: genQuadratTreppe },
    { id: 'qrennen', name: 'Quadrat-Rennen', icon: '⏱️', desc: '60 Sekunden Quadrate und Wurzeln – wie viele schaffst du?', kind: 'timed', gen: genQuadratBlitz, noBoss: true },
    { id: 'zoo', name: 'Zahlen-Zoo', icon: '🦒', desc: 'Sortiere Zahlen ins richtige Gehege: ℕ, ℤ, ℚ oder irrational.', rounds: 3, gen: genZoo2 },
    { id: 'radar', name: 'Wurzel-Radar', icon: '📡', desc: 'Platziere Wurzeln auf dem Zahlenstrahl.', rounds: 6, gen: genRadar2 },
    { id: 'bauer', name: 'Quadrat-Bauer', icon: '🧱', desc: 'Aus Fläche oder Volumen die Seitenlänge finden.', rounds: 5, gen: genQuadrat2 },
    { id: 'wahr', name: 'Wahr oder Falsch?', icon: '👆', desc: 'Wische nach rechts für wahr, nach links für falsch.', rounds: 8, gen: genTFZahlen2 }] },
  { id: 'p3', name: 'Pythagoria', topic: 'Satz des Pythagoras', hue: 190, ring: false, boss: 'Hypotenusen-Hydra', games: [
    { id: 'detektiv', name: 'Dreieck-Detektiv', icon: '🔍', desc: 'Finde Hypotenuse und Katheten.', rounds: 6, gen: genDetektiv },
    { id: 'leiter', name: 'Leiter-Rettung', icon: '🪜', desc: 'Rette Pi-Pi vom Dach mit der richtigen Leiter.', rounds: 5, gen: genLeiter2 },
    { id: 'diagonale', name: 'Raumschiff-Diagonale', icon: '📦', desc: 'Diagonalen in Rechtecken, Quadern und Pyramiden.', rounds: 5, gen: genDiagonale2 },
    { id: 'formeln', name: 'Formel-Verbinder', icon: '🔗', desc: 'Pythagoras, Höhensatz und Kathetensatz.', rounds: 5, gen: genFormeln2 }] },
  { id: 'p4', name: 'Term-Schmiede', topic: 'Terme & binomische Formeln', hue: 8, ring: true, boss: 'Klammer-Kraken', games: [
    { id: 'ofen', name: 'Term-Schmelzofen', icon: '🔥', desc: 'Gleichartige Terme zusammenschmelzen.', rounds: 6, gen: genOfen },
    { id: 'klammer', name: 'Klammer-Knacker', icon: '🔨', desc: 'Ausmultiplizieren und Herausheben.', rounds: 6, gen: genKlammer },
    { id: 'binom', name: 'Binom-Memory', icon: '🃏', desc: 'Finde Binom-Paare im Memory.', rounds: 2, gen: genBinom, noBoss: true },
    { id: 'bruch', name: 'Bruchterm-Bäckerei', icon: '🥧', desc: 'Bruchterme addieren, multiplizieren, kürzen.', rounds: 5, gen: genBruch },
    { id: 'fehler', name: 'Fehler-Detektiv', icon: '🕵️', desc: 'Finde den Fehler des Rechenroboters.', rounds: 5, gen: genFehler2 }] },
  { id: 'p5', name: 'Waagen-Welt', topic: 'Lineare Gleichungen', hue: 140, ring: false, boss: 'Ungleichgewicht', games: [
    { id: 'waage', name: 'Gleichgewichts-Waage', icon: '⚖️', desc: 'Löse Gleichungen Schritt für Schritt.', rounds: 4, gen: genWaage },
    { id: 'kino', name: 'Textaufgaben-Kino', icon: '🎬', desc: 'Übersetze Geschichten in Gleichungen.', rounds: 5, gen: genKino2 },
    { id: 'energie', name: 'Energie-Station', icon: '🔋', desc: 'Verhältnis- und Bruchgleichungen.', rounds: 5, gen: genEnergie2 }] },
  { id: 'p6', name: 'Kreis-Karussell', topic: 'Der Kreis', hue: 330, ring: true, boss: 'Pi-Rat', games: [
    { id: 'begriffe', name: 'Kreis-Begriffe', icon: '⭕', desc: 'Radius, Sehne, Tangente & Co. erkennen.', rounds: 6, gen: genBegriffe2 },
    { id: 'pizza', name: 'Pizza-Station', icon: '🍕', desc: 'Kreisausschnitt und Kreisbogen berechnen.', rounds: 5, gen: genPizza2 },
    { id: 'donut', name: 'Donut-Fabrik', icon: '🍩', desc: 'Kreisfläche und Kreisring.', rounds: 5, gen: genDonut },
    { id: 'umlauf', name: 'Planeten-Umlauf', icon: '🛰️', desc: 'Umfang und Fläche im Weltall.', rounds: 5, gen: genUmlauf }] },
  { id: 'p7', name: 'Körper-Kosmos', topic: 'Zylinder, Kegel, Kugel', hue: 48, ring: false, boss: 'Kegel-Koloss', games: [
    { id: 'eis', name: 'Eis-Diele im All', icon: '🍦', desc: 'Volumen von Kegel und Halbkugel.', rounds: 5, gen: genEis2 },
    { id: 'dose', name: 'Dosen-Fabrik', icon: '🥫', desc: 'Mantel, Oberfläche und Volumen des Zylinders.', rounds: 5, gen: genDose },
    { id: 'ball', name: 'Ball-Labor', icon: '⚽', desc: 'Kugeln messen und vergleichen.', rounds: 5, gen: genBall },
    { id: 'koerper', name: 'Körper-Verbinder', icon: '🔗', desc: 'Körper und Formeln verbinden.', rounds: 3, gen: genKoerper2 },
    { id: 'bau', name: 'Bau-Werkstatt', icon: '🏗️', desc: 'Zusammengesetzte Körper berechnen.', rounds: 4, gen: genBau }] },
  { id: 'p8', name: 'Funktions-Galaxie', topic: 'Lineare Funktionen', hue: 210, ring: true, boss: 'Steigungs-Sphinx', games: [
    { id: 'laser', name: 'Laser-Kanone', icon: '🔫', desc: 'Stelle k und d ein und triff die Asteroiden.', rounds: 5, gen: genLaser },
    { id: 'zuordnung', name: 'Graph-Zuordnung', icon: '📈', desc: 'Gleichungen, Graphen und Wertetabellen verbinden.', rounds: 4, gen: genZuordnung },
    { id: 'funktion', name: 'Funktion oder nicht?', icon: '👆', desc: 'Wische: Ist das eine Funktion?', rounds: 8, gen: genFunkTF2 },
    { id: 'werte', name: 'Funktions-Werkstatt', icon: '🛠️', desc: 'Funktionswerte, Steigung und Nullstellen.', rounds: 5, gen: genWerte }] },
  { id: 'p9', name: 'Doppelstern', topic: 'Gleichungssysteme', hue: 290, ring: false, boss: 'Zwillings-Zerberus', games: [
    { id: 'tresor', name: 'Tresor mit zwei Schlössern', icon: '🔐', desc: 'Finde x und y, die beide Gleichungen erfüllen.', rounds: 4, gen: genTresor },
    { id: 'schnitt', name: 'Schnittpunkt-Jagd', icon: '🎯', desc: 'Tippe den Schnittpunkt zweier Geraden an.', rounds: 5, gen: genSchnitt },
    { id: 'verfahren', name: 'Verfahrens-Profi', icon: '🧮', desc: 'Einsetzungs- und Additionsverfahren.', rounds: 5, gen: genVerfahren },
    { id: 'text2', name: 'Doppel-Rätsel', icon: '🎬', desc: 'Textaufgaben mit zwei Unbekannten.', rounds: 4, gen: genText2b }] },
  { id: 'p10', name: 'Daten-Station', topic: 'Statistik', hue: 165, ring: true, boss: 'Ausreißer-Asteroid', games: [
    { id: 'influencer', name: 'Influencer-Analyse', icon: '📊', desc: 'Mittelwert, Median, Modus, Spannweite.', rounds: 5, gen: genInfluencer2 },
    { id: 'ausreisser', name: 'Ausreißer-Alarm', icon: '🚨', desc: 'Was macht ein Ausreißer mit den Kennwerten?', rounds: 4, gen: genAusreisser },
    { id: 'diagramm', name: 'Diagramm-Doktor', icon: '🩺', desc: 'Das passende Diagramm wählen – und Tricks entlarven.', rounds: 6, gen: genDiagramm },
    { id: 'haeufig', name: 'Häufigkeiten', icon: '🧾', desc: 'Absolute und relative Häufigkeit.', rounds: 5, gen: genHaeufig2 }] },
  { id: 'bonus', name: 'Rätsel-Mond', topic: 'Logisches & räumliches Denken', hue: 220, ring: false, moon: true, boss: 'Rätsel-Golem', games: [
    { id: 'netz', name: 'Würfelnetze', icon: '🧊', desc: 'Welches Netz faltet sich zum Würfel?', rounds: 5, gen: genNetz },
    { id: 'ansicht', name: 'Bauplan-Blick', icon: '🏙️', desc: 'Wie sieht das Gebäude von vorne aus?', rounds: 5, gen: genAnsicht },
    { id: 'folge', name: 'Zahlenfolgen', icon: '🔢', desc: 'Welche Zahl kommt als Nächstes?', rounds: 6, gen: genFolge2 }] }
];
const WORDS = ['KOMET', 'ORBIT', 'RAKETE', 'PLANET', 'SATURN', 'METEOR', 'PULSAR', 'NEBEL'];

if (typeof module !== 'undefined') module.exports = { PLANETS, fmt, parseNum, balanceMoves, balanceSides, R, WORDS };
