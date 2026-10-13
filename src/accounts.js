/* =====================================================================
   ACCOUNTS – Spielstand wird im Artifact-Speicher (db) pro Account gesichert
   ===================================================================== */
const ACC = { db: null, user: null, key: null, meta: null, timer: null, chain: Promise.resolve(), lastSent: '', canWrite: null, isOwner: false };
const LOGIN_KEY = 'mathe-galaxie-login';
function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
function lsSet(k, v) { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch (e) { /* ignorieren */ } }
function nameKey(n) { return n.trim().toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss').replace(/\s+/g, '-').replace(/[^a-z0-9_-]/g, ''); }
function randHex(n) { const a = new Uint8Array(n); try { crypto.getRandomValues(a); } catch (e) { for (let i = 0; i < n; i++) a[i] = Math.random() * 256; } return [...a].map(b => b.toString(16).padStart(2, '0')).join(''); }
async function hashPw(pw, salt, alg) {
  if (alg === 'pbkdf2') {
    const enc = new TextEncoder();
    const k = await crypto.subtle.importKey('raw', enc.encode(pw), 'PBKDF2', false, ['deriveBits']);
    const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: enc.encode(salt), iterations: 60000, hash: 'SHA-256' }, k, 256);
    return [...new Uint8Array(bits)].map(b => b.toString(16).padStart(2, '0')).join('');
  }
  let h1 = 5381, h2 = 52711; const s = salt + '|' + pw;
  for (let r = 0; r < 3000; r++) for (let i = 0; i < s.length; i++) { const c = s.charCodeAt(i) + r; h1 = ((h1 << 5) + h1 + c) | 0; h2 = ((h2 << 5) + h2 ^ c) | 0; }
  return (h1 >>> 0).toString(16) + (h2 >>> 0).toString(16);
}
const hasSubtle = () => { try { return !!(window.crypto && crypto.subtle && crypto.subtle.deriveBits); } catch (e) { return false; } };

/* Speichern: Gast → Browser, Account → Online-Speicher (gebündelt) */
function save() {
  if (ACC.key) { lsSet(KEY + ':' + ACC.key, JSON.stringify(S)); queueRemote(); }
  else lsSet(KEY, JSON.stringify(S));
}
function queueRemote() { clearTimeout(ACC.timer); ACC.timer = setTimeout(flushRemote, 1800); setSync('wait'); }
function flushRemote() {
  clearTimeout(ACC.timer);
  if (!ACC.key || !ACC.db) return ACC.chain;
  const key = ACC.key, meta = ACC.meta, body = JSON.stringify(S);
  if (body === ACC.lastSent) { setSync('ok'); return ACC.chain; }
  ACC.chain = ACC.chain.then(async () => {
    for (let attempt = 0; attempt < 2; attempt++) {
      try { await ACC.db.doc('accounts/' + key).set({ ...meta, state: JSON.parse(body), updatedAt: Date.now() }); if (ACC.key === key) { ACC.lastSent = body; setSync('ok'); } return; }
      catch (e) {
        if (e && e.code === 'unavailable' && attempt === 0) { await new Promise(r => setTimeout(r, 800 + Math.random() * 1200)); continue; }
        setSync('err', e && e.code); return;
      }
    }
  });
  return ACC.chain;
}
function setSync(st, code) {
  const b = $('#accBtn'); if (!b) return;
  b.dataset.sync = ACC.key ? st : 'guest';
  b.title = !ACC.key ? 'Gast – Fortschritt nur in diesem Browser' : st === 'ok' ? 'Gespeichert in deinem Account' : st === 'wait' ? 'Wird gespeichert …' : 'Speichern fehlgeschlagen' + (code === 'invalid_argument' ? ' – keine Schreibrechte' : '');
  if (st === 'err' && !ACC.errShown) { ACC.errShown = true; toast(code === 'invalid_argument' ? 'Speichern nicht erlaubt. Bitte die Lehrkraft um Zugriff als „Mitwirkender“.' : 'Speichern hat gerade nicht geklappt. Ich versuche es beim nächsten Fortschritt wieder.', '⚠️'); }
  if (st === 'ok') ACC.errShown = false;
}
addEventListener('pagehide', () => { if (ACC.key) flushRemote(); });
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden' && ACC.key) flushRemote(); });

function paintAcc() {
  const b = $('#accBtn'); if (!b) return;
  const n = ACC.key ? ACC.meta.name : '';
  b.innerHTML = ACC.key ? `<span class="acc-av">${esc(n.slice(0, 1).toUpperCase())}</span>` : '👤';
  b.setAttribute('aria-label', ACC.key ? `Account ${n}` : 'Gast – Account');
  setSync(ACC.key ? 'ok' : 'guest');
}

/* ---------- Start: Verbindung & automatisches Einloggen ---------- */
async function initAccounts() {
  if (!window.claude || typeof window.claude.use !== 'function') { const b = $('#accBtn'); if (b) b.hidden = true; playAsGuest(); return; }
  showLogin({ loading: true });
  let db = null, user = null;
  try { if (window.claude && typeof window.claude.use === 'function') [db, user] = await Promise.all([window.claude.use('db'), window.claude.use('user')]); } catch (e) { db = null; }
  ACC.db = db; ACC.user = user;
  if (user) { try { ACC.canWrite = await user.can('data.write'); } catch (e) { /* unbekannt */ } try { ACC.isOwner = !!user.isOwner(); } catch (e) { /* nein */ } }
  let saved = null; try { saved = JSON.parse(lsGet(LOGIN_KEY) || 'null'); } catch (e) { saved = null; }
  if (db && saved && saved.key && saved.hash) {
    try { const snap = await db.doc('accounts/' + saved.key).get(); const d = snap.exists ? snap.data() : null; if (d && d.hash === saved.hash) return enterAccount(saved.key, d, true, true); } catch (e) { /* normal einloggen */ }
  }
  showLogin({ prefill: saved && saved.name });
}

function showLogin(opt = {}) {
  stopGame();
  $('.top').hidden = true;
  const noDb = !opt.loading && !ACC.db;
  const ro = !opt.loading && ACC.db && ACC.canWrite === false;
  const tab = opt.tab || 'login';
  app.innerHTML = `<div class="screen login">
    <div class="login-hero"><div class="pw">${pipiSvg('happy')}</div><h1><span>Mission Genial</span>Mathe-Galaxie</h1></div>
    <div class="panel login-box">
    ${opt.loading ? '<p class="center" style="margin:18px 0;font-weight:800">📡 Verbinde mit der Raumstation …</p>' : noDb ? `
      <h2>Accounts sind hier nicht verfügbar</h2>
      <p class="sm">Um einen Account zu nutzen, musst du bei Claude angemeldet sein und Zugriff auf dieses Spiel haben. Du kannst trotzdem als Gast spielen – dein Fortschritt bleibt dann nur in diesem Browser.</p>` : `
      <div class="tabs" role="tablist"><button role="tab" aria-selected="${tab === 'login'}" data-t="login">Einloggen</button><button role="tab" aria-selected="${tab === 'new'}" data-t="new">Neuer Account</button></div>
      <form id="accForm" autocomplete="off" novalidate>
        <label class="lf"><span>Spielername</span><input id="accName" class="txtin" maxlength="20" autocomplete="username" value="${esc(opt.prefill || '')}" placeholder="z. B. Lena oder Mathe-Max"></label>
        <label class="lf"><span>Passwort</span><input id="accPw" class="txtin" type="password" maxlength="40" autocomplete="${tab === 'new' ? 'new-password' : 'current-password'}" placeholder="mindestens 4 Zeichen"></label>
        ${tab === 'new' ? '<label class="lf"><span>Passwort wiederholen</span><input id="accPw2" class="txtin" type="password" maxlength="40" autocomplete="new-password"></label>' : ''}
        <label class="chk"><input type="checkbox" id="accRem" checked> Auf diesem Gerät angemeldet bleiben</label>
        <p class="lerr" id="accErr" role="alert"></p>
        <button class="btn" id="accGo" type="submit" style="width:100%">${tab === 'new' ? '🚀 Account erstellen' : '🔑 Einloggen'}</button>
        ${tab === 'new' ? '<p class="sm" style="margin:10px 0 0">Tipp: Benutze kein echtes Passwort von anderen Seiten – das hier ist ein Spiel-Passwort.' + (S.xp > 0 ? ' Dein bisheriger Gast-Fortschritt wird in den neuen Account übernommen.' : '') + '</p>' : ''}
        ${ro ? '<p class="sm" style="margin:10px 0 0">⚠️ Du hast für dieses Spiel nur Lese-Zugriff. Zum Speichern muss dir die Lehrkraft Zugriff als „Mitwirkender“ geben.</p>' : ''}
      </form>`}
    </div>
    ${opt.loading ? '' : '<button class="linkbtn guest" id="guestBtn">Ohne Account als Gast spielen →</button>'}
  </div>`;
  window.scrollTo(0, 0);
  if (opt.loading) return;
  $('#guestBtn').onclick = playAsGuest;
  if (noDb) return;
  $$('.tabs button').forEach(b => b.onclick = () => showLogin({ tab: b.dataset.t, prefill: $('#accName').value }));
  const f = $('#accForm'), err = $('#accErr'), go = $('#accGo');
  setTimeout(() => (($('#accName').value ? $('#accPw') : $('#accName'))).focus({ preventScroll: true }), 50);
  f.addEventListener('submit', async e => {
    e.preventDefault(); Snd.init();
    err.textContent = '';
    const name = $('#accName').value.trim(), pw = $('#accPw').value, rem = $('#accRem').checked, key = nameKey(name);
    if (key.length < 3) { err.textContent = 'Der Spielername braucht mindestens 3 Buchstaben oder Ziffern.'; return; }
    if (pw.length < 4) { err.textContent = 'Das Passwort braucht mindestens 4 Zeichen.'; return; }
    if (tab === 'new' && pw !== $('#accPw2').value) { err.textContent = 'Die beiden Passwörter sind nicht gleich.'; return; }
    go.disabled = true; const old = go.textContent; go.textContent = '⏳ Einen Moment …';
    try { tab === 'new' ? await createAccount(name, key, pw, rem) : await login(key, pw, rem); }
    catch (ex) { err.textContent = typeof ex === 'string' ? ex : 'Das hat gerade nicht geklappt. Versuch es bitte gleich nochmal.'; go.disabled = false; go.textContent = old; Snd.bad(); }
  });
}
async function login(key, pw, rem) {
  const snap = await ACC.db.doc('accounts/' + key).get();
  if (!snap.exists) throw 'Diesen Spielernamen gibt es noch nicht. Erstelle zuerst einen Account.';
  const d = snap.data();
  if (d.alg === 'pbkdf2' && !hasSubtle()) throw 'Dieser Browser kann das Passwort nicht prüfen. Versuch es in einem anderen Browser.';
  if (await hashPw(pw, d.salt, d.alg) !== d.hash) throw 'Falsches Passwort.';
  enterAccount(key, d, rem);
}
async function createAccount(name, key, pw, rem) {
  const ref = ACC.db.doc('accounts/' + key);
  try { const l = await ref.acquire({ holder: 'new-' + randHex(6), ttlMs: 8000 }); if (!l.acquired) throw 'busy'; }
  catch (e) { if (e === 'busy') throw 'Dieser Name wird gerade vergeben. Wähle bitte einen anderen.'; }
  const snap = await ref.get();
  if (snap.exists && snap.data() && snap.data().hash) throw 'Diesen Spielernamen gibt es schon. Wähle einen anderen oder logge dich ein.';
  const alg = hasSubtle() ? 'pbkdf2' : 'simple', salt = randHex(12), hash = await hashPw(pw, salt, alg);
  const state = S.xp > 0 && !ACC.key ? JSON.parse(JSON.stringify(S)) : clone(DEF);
  state.name = name;
  const meta = { name, salt, hash, alg, created: Date.now() };
  try { await ref.set({ ...meta, state, updatedAt: Date.now() }); }
  catch (e) {
    if (e && e.code === 'invalid_argument') throw 'Du darfst hier leider keine Accounts anlegen. Bitte die Lehrkraft, dir Zugriff als „Mitwirkender“ zu geben.';
    if (e && e.code === 'quota_exceeded') throw 'Der Speicher ist voll – es können keine neuen Accounts mehr angelegt werden.';
    throw 'Der Account konnte nicht gespeichert werden. Versuch es bitte gleich nochmal.';
  }
  enterAccount(key, { ...meta, state }, rem);
  setTimeout(() => toast(`Account <b>${esc(name)}</b> erstellt! Dein Fortschritt wird jetzt online gespeichert.`, '🚀'), 400);
}
function enterAccount(key, d, rem, auto) {
  ACC.key = key;
  ACC.meta = { name: d.name, salt: d.salt, hash: d.hash, alg: d.alg, created: d.created || Date.now() };
  S = Object.assign(clone(DEF), JSON.parse(JSON.stringify(d.state || {})));
  S.name = S.name || d.name;
  ACC.lastSent = JSON.stringify(S);
  lsSet(LOGIN_KEY, JSON.stringify(rem ? { key, name: d.name, hash: d.hash } : { name: d.name }));
  $('.top').hidden = false;
  updateTop(); paintLogo(); paintAcc(); showMap();
  if (!auto) { Snd.win(); confetti(80); }
  toast(`${auto ? 'Willkommen zurück' : 'Hallo'}, <b>${esc(d.name)}</b>!`, '👽');
}
function playAsGuest() {
  ACC.key = null; ACC.meta = null;
  S = load();
  $('.top').hidden = false;
  updateTop(); paintLogo(); paintAcc(); showMap(); welcome();
}
async function logout() {
  await flushRemote();
  let saved = null; try { saved = JSON.parse(lsGet(LOGIN_KEY) || 'null'); } catch (e) { /* leer */ }
  lsSet(LOGIN_KEY, JSON.stringify({ name: saved && saved.name || (ACC.meta && ACC.meta.name) || '' }));
  ACC.key = null; ACC.meta = null; ACC.lastSent = '';
  S = load();
  showLogin({ prefill: saved && saved.name });
}
function accountMenu() {
  if (ACC.key) {
    modal(`<div class="pw">${pipiSvg()}</div><h2>${esc(ACC.meta.name)}</h2><p>Dein Fortschritt wird automatisch in deinem Account gespeichert. Du kannst dich auf jedem Gerät mit deinem Spielernamen und Passwort einloggen.</p>`,
      [{ label: 'Abmelden', cls: 'sec', fn: logout }, { label: 'Passwort ändern', cls: 'sec', fn: changePw }, { label: 'Weiterspielen' }]);
  } else {
    modal(`<div class="pw">${pipiSvg()}</div><h2>Du spielst als Gast</h2><p>${ACC.db ? 'Erstelle einen Account, damit dein Fortschritt gespeichert wird und du auf jedem Gerät weiterspielen kannst. Dein bisheriger Fortschritt wird übernommen.' : 'Accounts sind hier nicht verfügbar. Dein Fortschritt bleibt nur in diesem Browser.'}</p>`,
      ACC.db ? [{ label: 'Weiterspielen', cls: 'sec' }, { label: 'Account erstellen', fn: () => showLogin({ tab: 'new' }) }, { label: 'Einloggen', cls: 'sec', fn: () => showLogin({ tab: 'login' }) }] : [{ label: 'OK' }]);
  }
}
function changePw() {
  modal(`<h2>Passwort ändern</h2><input id="pwOld" class="txtin" type="password" placeholder="Altes Passwort" style="margin:6px 0"><input id="pwNew" class="txtin" type="password" placeholder="Neues Passwort (mind. 4 Zeichen)" style="margin:6px 0"><p class="lerr" id="pwErr"></p>`,
    [{ label: 'Abbrechen', cls: 'sec' }, { label: 'Speichern', keep: true, fn: async () => {
      const o = $('#pwOld').value, n = $('#pwNew').value, er = $('#pwErr');
      if (n.length < 4) { er.textContent = 'Das neue Passwort braucht mindestens 4 Zeichen.'; return; }
      if (await hashPw(o, ACC.meta.salt, ACC.meta.alg) !== ACC.meta.hash) { er.textContent = 'Das alte Passwort stimmt nicht.'; return; }
      const alg = hasSubtle() ? 'pbkdf2' : 'simple', salt = randHex(12);
      ACC.meta = { ...ACC.meta, alg, salt, hash: await hashPw(n, salt, alg) };
      ACC.lastSent = ''; await flushRemote();
      let saved = null; try { saved = JSON.parse(lsGet(LOGIN_KEY) || 'null'); } catch (e) { /* leer */ }
      if (saved && saved.hash) lsSet(LOGIN_KEY, JSON.stringify({ key: ACC.key, name: ACC.meta.name, hash: ACC.meta.hash }));
      $('#modal').hidden = true; toast('Passwort geändert.', '🔑');
    } }]);
}

/* ---------- Klassen-Übersicht (nur für die Besitzerin / den Besitzer) ---------- */
async function classOverview() {
  const box = $('#classBox'); if (!box || !ACC.db) return;
  box.innerHTML = '<p class="sm">Lade Accounts …</p>';
  try {
    const snap = await ACC.db.collection('accounts').get();
    const rows = snap.docs.map(d => d.data()).filter(d => d && d.state).map(d => {
      const st = d.state, stars = Object.values(st.stars || {}).reduce((a, b) => a + b, 0), bosses = Object.keys(st.boss || {}).length;
      const tot = Object.values(st.stats || {}).reduce((a, s) => a + s.c + s.w, 0), ok = Object.values(st.stats || {}).reduce((a, s) => a + s.c, 0);
      return { name: d.name, lv: levelOf(st.xp || 0).level, stars, bosses, tot, pc: tot ? Math.round(ok / tot * 100) : null, at: d.updatedAt };
    }).sort((a, b) => b.stars - a.stars);
    if (!rows.length) { box.innerHTML = '<p class="sm">Noch keine Accounts angelegt.</p>'; return; }
    box.innerHTML = `<div style="overflow-x:auto"><table class="ct"><tr><th>Spieler</th><th>Level</th><th>Sterne</th><th>Bosse</th><th>Aufgaben</th><th>richtig</th><th>zuletzt</th></tr>${rows.map(r => `<tr><td>${esc(r.name)}</td><td>${r.lv}</td><td>${r.stars}</td><td>${r.bosses}</td><td>${r.tot}</td><td>${r.pc == null ? '–' : r.pc + ' %'}</td><td>${r.at ? new Date(r.at).toLocaleDateString('de-AT') : '–'}</td></tr>`).join('')}</table></div>`;
  } catch (e) { box.innerHTML = '<p class="sm">Die Übersicht konnte gerade nicht geladen werden.</p>'; }
}
