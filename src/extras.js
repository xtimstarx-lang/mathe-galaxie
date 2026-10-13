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
  const O = [['Zylinder', 'O = 2r²π + 2rπh'], ['Kegel', 'O = r²π + rπs'], ['Kugel', 'O = 4r²π'], ['Würfel', 'O = 6a²'], ['Quader', 'O = 2(ab + ac + bc)']];
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
  if (t === 0) { const a = R.int(1, 9), d = R.int(2, 9); seq = []; for (let i = 0; i < 6; i++) seq.push(i % 2 ? seq[i - 1] - 1 : (seq[i - 1] || a) + (i ? d : 0)); next = seq.pop(); seq = []; let v = a; for (let i = 0; i < 6; i++) { seq.push(v); v = i % 2 === 0 ? v + d : v - 1; } next = seq.pop(); why = `Abwechselnd +${d} und ${MINUS}1.`; }
  else if (t === 1) { const a = R.int(200, 900); seq = [0, 1, 2, 3, 4, 5].map(i => a - i * R.int(0, 0) - i * 7 * (lvl + 1)); next = seq.pop(); why = `Immer ${MINUS} ${7 * (lvl + 1)}.`; }
  else if (t === 2) { const a = R.pick([1024, 729, 512, 2048, 4096]), q = a === 729 ? 3 : 2; seq = [0, 1, 2, 3, 4, 5].map(i => a / q ** i); next = seq.pop(); why = `Immer durch ${q}.`; }
  else { seq = [1, 2, 3, 4, 5, 6].map(i => i * (i + 1)); const s = R.int(0, 3); seq = seq.map((v, i) => (i + 1 + s) * (i + 2 + s)); next = seq.pop(); why = 'n · (n + 1): 1·2, 2·3, 3·4, …'; }
  return { type: 'input', q: 'Welche Zahl kommt als Nächstes?', visual: `<div class="expr">${seq.map(v => fmt(v)).join(' · ')} · ?</div>`, fields: [exact(next)], explain: `${why} → <b>${fmt(next)}</b>`, hint: 'Schau dir die Unterschiede zwischen den Zahlen an – oder ob immer multipliziert/dividiert wird.' };
}
