/* =====================================================================
   ACCOUNTS – Login ist Pflicht. Zwei Speicher-Varianten:
   · claude   – Artifact-Speicher (db) in der Claude-Version
   · firebase – Firebase Auth + Firestore auf der öffentlichen Website
   ===================================================================== */
const ACC = { be: null, acct: null, timer: null, chain: Promise.resolve(), lastSent: '', errShown: false, unavailable: '' };
const LOGIN_KEY = 'mathe-galaxie-login';
const PW_MIN = 6;
function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
function lsSet(k, v) { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch (e) { /* ignorieren */ } }
function lsJson(k) { try { return JSON.parse(lsGet(k) || 'null'); } catch (e) { return null; } }
function nameKey(n) { return n.trim().toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss').replace(/\s+/g, '-').replace(/[^a-z0-9_-]/g, ''); }
function randHex(n) { const a = new Uint8Array(n); try { crypto.getRandomValues(a); } catch (e) { for (let i = 0; i < n; i++) a[i] = Math.random() * 256; } return [...a].map(b => b.toString(16).padStart(2, '0')).join(''); }
const hasSubtle = () => { try { return !!(window.crypto && crypto.subtle && crypto.subtle.deriveBits); } catch (e) { return false; } };
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
const freshState = name => { const s = clone(DEF); s.name = name; return s; };

/* ---------- Variante 1: Claude-Artifact-Speicher ---------- */
function claudeBackend(db, user) {
  const ref = key => db.doc('accounts/' + key);
  const toAcct = (key, d) => ({ key, name: d.name, state: d.state, meta: { name: d.name, salt: d.salt, hash: d.hash, alg: d.alg, created: d.created || Date.now() } });
  return {
    kind: 'claude', canWrite: null, isOwner: false,
    async init() {
      if (user) { try { this.canWrite = await user.can('data.write'); } catch (e) { /* unbekannt */ } try { this.isOwner = !!user.isOwner(); } catch (e) { /* nein */ } }
    },
    async restore() {
      const s = lsJson(LOGIN_KEY);
      if (!s || !s.key || !s.hash) return null;
      try { const snap = await ref(s.key).get(); const d = snap.exists ? snap.data() : null; if (d && d.hash === s.hash) return toAcct(s.key, d); } catch (e) { /* normal einloggen */ }
      return null;
    },
    async login(name, key, pw, rem) {
      const snap = await ref(key).get();
      if (!snap.exists) throw 'Diesen Benutzernamen gibt es noch nicht. Erstelle zuerst einen Account.';
      const d = snap.data();
      if (d.alg === 'pbkdf2' && !hasSubtle()) throw 'Dieser Browser kann das Passwort nicht prüfen. Versuch es in einem anderen Browser.';
      if (await hashPw(pw, d.salt, d.alg) !== d.hash) throw 'Falsches Passwort.';
      lsSet(LOGIN_KEY, JSON.stringify(rem ? { key, name: d.name, hash: d.hash } : { name: d.name }));
      return toAcct(key, d);
    },
    async create(name, key, pw, rem) {
      const r = ref(key);
      try { const l = await r.acquire({ holder: 'new-' + randHex(6), ttlMs: 8000 }); if (!l.acquired) throw 'busy'; }
      catch (e) { if (e === 'busy') throw 'Dieser Name wird gerade vergeben. Wähle bitte einen anderen.'; }
      const snap = await r.get();
      if (snap.exists && snap.data() && snap.data().hash) throw 'Diesen Benutzernamen gibt es schon. Wähle einen anderen oder logge dich ein.';
      const alg = hasSubtle() ? 'pbkdf2' : 'simple', salt = randHex(12), hash = await hashPw(pw, salt, alg);
      const d = { name, salt, hash, alg, created: Date.now(), state: freshState(name), updatedAt: Date.now() };
      try { await r.set(d); }
      catch (e) {
        if (e && e.code === 'invalid_argument') throw 'Du darfst hier leider keine Accounts anlegen. Bitte um Zugriff als „Mitwirkender“.';
        if (e && e.code === 'quota_exceeded') throw 'Der Speicher ist voll – es können keine neuen Accounts mehr angelegt werden.';
        throw 'Der Account konnte nicht gespeichert werden. Versuch es bitte gleich nochmal.';
      }
      lsSet(LOGIN_KEY, JSON.stringify(rem ? { key, name, hash } : { name }));
      return toAcct(key, d);
    },
    async save(acct, state) { await ref(acct.key).set({ ...acct.meta, state, updatedAt: Date.now() }); },
    async logout(acct) { lsSet(LOGIN_KEY, JSON.stringify({ name: acct ? acct.name : '' })); },
    async changePw(acct, oldPw, newPw) {
      if (await hashPw(oldPw, acct.meta.salt, acct.meta.alg) !== acct.meta.hash) throw 'Das alte Passwort stimmt nicht.';
      const alg = hasSubtle() ? 'pbkdf2' : 'simple', salt = randHex(12);
      acct.meta = { ...acct.meta, alg, salt, hash: await hashPw(newPw, salt, alg) };
      const s = lsJson(LOGIN_KEY); if (s && s.hash) lsSet(LOGIN_KEY, JSON.stringify({ key: acct.key, name: acct.name, hash: acct.meta.hash }));
    },
    async listAll() {
      const snap = await db.collection('accounts').get();
      return snap.docs.map(d => d.data()).filter(d => d && d.state);
    },
    errText(e) { return e && e.code === 'invalid_argument' ? 'Speichern nicht erlaubt. Bitte um Zugriff als „Mitwirkender“.' : ''; }
  };
}

/* ---------- Variante 2: Firebase (öffentliche Website) ---------- */
const FB_DOMAIN = '@spieler.mathe-galaxie.app';
function firebaseBackend(fb, cfg) {
  try { if (!(fb.apps && fb.apps.length)) fb.initializeApp(cfg); } catch (e) { return null; }
  const auth = fb.auth(), store = fb.firestore();
  const ref = uid => store.collection('accounts').doc(uid);
  const fbErr = (e, fallback) => {
    const c = (e && e.code) || '';
    if (/invalid-credential|wrong-password|user-not-found|invalid-login|invalid-email/.test(c)) return 'Benutzername oder Passwort ist falsch.';
    if (/email-already-in-use/.test(c)) return 'Diesen Benutzernamen gibt es schon. Wähle einen anderen oder logge dich ein.';
    if (/weak-password/.test(c)) return `Das Passwort braucht mindestens ${PW_MIN} Zeichen.`;
    if (/too-many-requests/.test(c)) return 'Zu viele Versuche. Warte bitte ein paar Minuten.';
    if (/network-request-failed|unavailable/.test(c)) return 'Keine Internetverbindung. Prüfe dein Internet und versuch es nochmal.';
    if (/permission-denied/.test(c)) return 'Speichern nicht erlaubt – die Datenbank-Regeln sind noch nicht richtig eingerichtet.';
    if (/operation-not-allowed|configuration-not-found|api-key|unauthorized-domain/.test(c)) return 'Der Login ist noch nicht fertig eingerichtet.';
    return fallback;
  };
  const load = async (u) => {
    const snap = await ref(u.uid).get();
    const d = snap.exists ? snap.data() : null;
    const name = (d && d.name) || u.displayName || (u.email || '').replace(FB_DOMAIN, '');
    return { key: u.uid, name, state: d && d.state ? d.state : freshState(name), meta: { name, key: nameKey(name) } };
  };
  return {
    kind: 'firebase', canWrite: true, isOwner: false,
    async init() { },
    async restore() {
      const u = await new Promise(res => { const off = auth.onAuthStateChanged(x => { off(); res(x); }); setTimeout(() => res(null), 8000); });
      if (!u) return null;
      try { return await load(u); } catch (e) { return null; }
    },
    async login(name, key, pw, rem) {
      try {
        await auth.setPersistence(rem ? fb.auth.Auth.Persistence.LOCAL : fb.auth.Auth.Persistence.SESSION);
        const cr = await auth.signInWithEmailAndPassword(key + FB_DOMAIN, pw);
        lsSet(LOGIN_KEY, JSON.stringify({ name }));
        return await load(cr.user);
      } catch (e) { if (typeof e === 'string') throw e; throw fbErr(e, 'Einloggen hat nicht geklappt. Versuch es bitte nochmal.'); }
    },
    async create(name, key, pw, rem) {
      let cr;
      try {
        await auth.setPersistence(rem ? fb.auth.Auth.Persistence.LOCAL : fb.auth.Auth.Persistence.SESSION);
        cr = await auth.createUserWithEmailAndPassword(key + FB_DOMAIN, pw);
      } catch (e) { throw fbErr(e, 'Der Account konnte nicht erstellt werden. Versuch es bitte nochmal.'); }
      try { await cr.user.updateProfile({ displayName: name }); } catch (e) { /* nicht wichtig */ }
      const state = freshState(name);
      try { await ref(cr.user.uid).set({ name, key, state, created: Date.now(), updatedAt: Date.now() }); }
      catch (e) { throw fbErr(e, 'Der Account wurde erstellt, aber der Spielstand konnte nicht gespeichert werden. Logge dich bitte nochmal ein.'); }
      lsSet(LOGIN_KEY, JSON.stringify({ name }));
      return { key: cr.user.uid, name, state, meta: { name, key } };
    },
    async save(acct, state) { await ref(acct.key).set({ name: acct.name, key: acct.meta.key, state, updatedAt: Date.now() }); },
    async logout() { try { await auth.signOut(); } catch (e) { /* egal */ } },
    async changePw(acct, oldPw, newPw) {
      const u = auth.currentUser; if (!u) throw 'Bitte melde dich zuerst neu an.';
      try { await u.reauthenticateWithCredential(fb.auth.EmailAuthProvider.credential(u.email, oldPw)); }
      catch (e) { throw 'Das alte Passwort stimmt nicht.'; }
      try { await u.updatePassword(newPw); } catch (e) { throw fbErr(e, 'Das Passwort konnte nicht geändert werden.'); }
    },
    async listAll() { return []; },
    errText(e) { return fbErr(e, ''); }
  };
}

/* ---------- Speichern ---------- */
function save() {
  if (ACC.acct) { lsSet(KEY + ':' + ACC.acct.key, JSON.stringify(S)); queueRemote(); }
}
function queueRemote() { clearTimeout(ACC.timer); ACC.timer = setTimeout(flushRemote, 1800); setSync('wait'); }
function flushRemote() {
  clearTimeout(ACC.timer);
  const acct = ACC.acct, be = ACC.be;
  if (!acct || !be) return ACC.chain;
  const body = JSON.stringify(S);
  if (body === ACC.lastSent) { setSync('ok'); return ACC.chain; }
  ACC.chain = ACC.chain.then(async () => {
    for (let attempt = 0; attempt < 2; attempt++) {
      try { await be.save(acct, JSON.parse(body)); if (ACC.acct === acct) { ACC.lastSent = body; setSync('ok'); } return; }
      catch (e) {
        if (e && /unavailable/.test(e.code || '') && attempt === 0) { await new Promise(r => setTimeout(r, 800 + Math.random() * 1200)); continue; }
        setSync('err', be.errText(e)); return;
      }
    }
  });
  return ACC.chain;
}
function setSync(st, msg) {
  const b = $('#accBtn'); if (!b) return;
  b.dataset.sync = ACC.acct ? st : 'guest';
  b.title = st === 'ok' ? 'Gespeichert in deinem Account' : st === 'wait' ? 'Wird gespeichert …' : 'Speichern fehlgeschlagen';
  if (st === 'err' && !ACC.errShown) { ACC.errShown = true; toast(msg || 'Speichern hat gerade nicht geklappt. Ich versuche es beim nächsten Fortschritt wieder.', '⚠️'); }
  if (st === 'ok') ACC.errShown = false;
}
addEventListener('pagehide', () => { if (ACC.acct) flushRemote(); });
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden' && ACC.acct) flushRemote(); });

function paintAcc() {
  const b = $('#accBtn'); if (!b) return;
  const n = ACC.acct ? ACC.acct.name : '';
  b.innerHTML = n ? `<span class="acc-av">${esc(n.slice(0, 1).toUpperCase())}</span>` : '👤';
  b.setAttribute('aria-label', n ? `Account ${n}` : 'Account');
  setSync(n ? 'ok' : 'guest');
}

/* ---------- Start ---------- */
async function initAccounts() {
  showLogin({ loading: true });
  let be = null;
  const cfg = window.GALAXIE_FIREBASE;
  if (cfg && cfg.apiKey) {
    if (window.firebase && window.firebase.initializeApp) be = firebaseBackend(window.firebase, cfg);
    if (!be) ACC.unavailable = 'Der Login-Server ist gerade nicht erreichbar. Prüfe deine Internetverbindung und lade die Seite neu.';
  } else if (window.claude && typeof window.claude.use === 'function') {
    let db = null, user = null;
    try { [db, user] = await Promise.all([window.claude.use('db'), window.claude.use('user')]); } catch (e) { db = null; }
    if (db) be = claudeBackend(db, user);
    else ACC.unavailable = 'Um zu spielen, musst du bei Claude angemeldet sein und Zugriff auf dieses Spiel haben.';
  } else if (window.GALAXIE_PUBLIC) {
    ACC.unavailable = 'Der Login wird gerade eingerichtet. Schau bitte bald wieder vorbei!';
  } else {
    ACC.unavailable = 'Der Login ist hier nicht verfügbar.';
  }
  ACC.be = be;
  if (be) {
    await be.init();
    let acct = null;
    try { acct = await be.restore(); } catch (e) { acct = null; }
    if (acct) return enterAccount(acct, true);
  }
  const s = lsJson(LOGIN_KEY);
  showLogin({ prefill: s && s.name });
}

function showLogin(opt = {}) {
  stopGame();
  $('.top').hidden = true;
  const be = ACC.be;
  const noBe = !opt.loading && !be;
  const ro = !opt.loading && be && be.canWrite === false;
  const tab = opt.tab || 'login';
  app.innerHTML = `<div class="screen login">
    <div class="login-hero"><div class="pw">${pipiSvg('happy')}</div><h1><span>Mission Genial</span>Mathe-Galaxie</h1></div>
    <div class="panel login-box">
    ${opt.loading ? '<p class="center" style="margin:18px 0;font-weight:800">📡 Verbinde mit der Raumstation …</p>' : noBe ? `
      <h2>Login nicht möglich</h2>
      <p class="sm">${esc(ACC.unavailable)}</p>` : `
      <div class="tabs" role="tablist"><button role="tab" aria-selected="${tab === 'login'}" data-t="login">Einloggen</button><button role="tab" aria-selected="${tab === 'new'}" data-t="new">Neuer Account</button></div>
      <p class="sm" style="margin:0 0 12px">${tab === 'new' ? 'Erstelle deinen Piloten-Account. Dein Fortschritt wird darin gespeichert – du kannst dich auf jedem Gerät einloggen.' : 'Logge dich ein, um zu spielen.'}</p>
      <form id="accForm" autocomplete="on" novalidate>
        <label class="lf"><span>Benutzername</span><input id="accName" name="username" class="txtin" maxlength="20" autocomplete="username" autocapitalize="off" spellcheck="false" value="${esc(opt.prefill || '')}" placeholder="z. B. Mathe-Max"></label>
        <label class="lf"><span>Passwort</span><input id="accPw" name="password" class="txtin" type="password" maxlength="40" autocomplete="${tab === 'new' ? 'new-password' : 'current-password'}" placeholder="${tab === 'new' ? `mindestens ${PW_MIN} Zeichen` : ''}"></label>
        ${tab === 'new' ? '<label class="lf"><span>Passwort wiederholen</span><input id="accPw2" class="txtin" type="password" maxlength="40" autocomplete="new-password"></label>' : ''}
        <label class="chk"><input type="checkbox" id="accRem" checked> Auf diesem Gerät angemeldet bleiben</label>
        <p class="lerr" id="accErr" role="alert"></p>
        <button class="btn" id="accGo" type="submit" style="width:100%">${tab === 'new' ? '🚀 Account erstellen' : '🔑 Einloggen'}</button>
        ${tab === 'new' ? '<p class="sm" style="margin:10px 0 0">Tipp: Benutze kein echtes Passwort von anderen Seiten – das hier ist ein Spiel-Passwort. Merk dir Benutzername und Passwort gut!</p>' : '<p class="sm" style="margin:10px 0 0">Noch keinen Account? Tippe oben auf „Neuer Account“.</p>'}
        ${ro ? '<p class="sm" style="margin:10px 0 0">⚠️ Du hast für dieses Spiel nur Lese-Zugriff. Zum Speichern brauchst du Zugriff als „Mitwirkender“.</p>' : ''}
      </form>`}
    </div>
  </div>`;
  window.scrollTo(0, 0);
  if (opt.loading || noBe) return;
  $$('.tabs button').forEach(b => b.onclick = () => showLogin({ tab: b.dataset.t, prefill: $('#accName').value }));
  const f = $('#accForm'), err = $('#accErr'), go = $('#accGo');
  setTimeout(() => { const n = $('#accName'), p = $('#accPw'); if (n && p) (n.value ? p : n).focus({ preventScroll: true }); }, 50);
  f.addEventListener('submit', async e => {
    e.preventDefault(); Snd.init();
    err.textContent = '';
    const name = $('#accName').value.trim().replace(/\s+/g, ' '), pw = $('#accPw').value, rem = $('#accRem').checked, key = nameKey(name);
    if (key.length < 3) { err.textContent = 'Der Benutzername braucht mindestens 3 Buchstaben oder Ziffern.'; return; }
    if (!pw) { err.textContent = 'Bitte gib dein Passwort ein.'; return; }
    if (tab === 'new' && pw.length < PW_MIN) { err.textContent = `Das Passwort braucht mindestens ${PW_MIN} Zeichen.`; return; }
    if (tab === 'new' && pw !== $('#accPw2').value) { err.textContent = 'Die beiden Passwörter sind nicht gleich.'; return; }
    go.disabled = true; const old = go.textContent; go.textContent = '⏳ Einen Moment …';
    try {
      const acct = tab === 'new' ? await be.create(name, key, pw, rem) : await be.login(name, key, pw, rem);
      enterAccount(acct, false, tab === 'new');
    } catch (ex) { err.textContent = typeof ex === 'string' ? ex : 'Das hat gerade nicht geklappt. Versuch es bitte gleich nochmal.'; go.disabled = false; go.textContent = old; Snd.bad(); }
  });
}
function enterAccount(acct, auto, isNew) {
  ACC.acct = acct;
  S = Object.assign(clone(DEF), JSON.parse(JSON.stringify(acct.state || {})));
  S.name = S.name || acct.name;
  ACC.lastSent = JSON.stringify(S);
  $('.top').hidden = false;
  updateTop(); paintLogo(); paintAcc(); showMap();
  if (!auto) { Snd.win(); confetti(80); }
  toast(isNew ? `Account <b>${esc(acct.name)}</b> erstellt! Dein Fortschritt wird jetzt gespeichert.` : `${auto ? 'Willkommen zurück' : 'Hallo'}, <b>${esc(acct.name)}</b>!`, isNew ? '🚀' : '👽');
}
async function logout() {
  await flushRemote();
  const acct = ACC.acct;
  try { await ACC.be.logout(acct); } catch (e) { /* egal */ }
  ACC.acct = null; ACC.lastSent = '';
  S = clone(DEF);
  showLogin({ prefill: acct && acct.name });
}
function accountMenu() {
  if (!ACC.acct) return showLogin();
  modal(`<div class="pw">${pipiSvg()}</div><h2>${esc(ACC.acct.name)}</h2><p>Dein Fortschritt wird automatisch in deinem Account gespeichert. Du kannst dich auf jedem Gerät mit deinem Benutzernamen und Passwort einloggen.</p>`,
    [{ label: 'Abmelden', cls: 'sec', fn: logout }, { label: 'Passwort ändern', cls: 'sec', fn: changePw }, { label: 'Weiterspielen' }]);
}
function changePw() {
  modal(`<h2>Passwort ändern</h2><input id="pwOld" class="txtin" type="password" placeholder="Altes Passwort" autocomplete="current-password" style="margin:6px 0"><input id="pwNew" class="txtin" type="password" placeholder="Neues Passwort (mind. ${PW_MIN} Zeichen)" autocomplete="new-password" style="margin:6px 0"><p class="lerr" id="pwErr"></p>`,
    [{ label: 'Abbrechen', cls: 'sec' }, { label: 'Speichern', keep: true, fn: async () => {
      const o = $('#pwOld').value, n = $('#pwNew').value, er = $('#pwErr');
      if (n.length < PW_MIN) { er.textContent = `Das neue Passwort braucht mindestens ${PW_MIN} Zeichen.`; return; }
      try { await ACC.be.changePw(ACC.acct, o, n); } catch (e) { er.textContent = typeof e === 'string' ? e : 'Das hat nicht geklappt.'; return; }
      ACC.lastSent = ''; await flushRemote();
      $('#modal').hidden = true; toast('Passwort geändert.', '🔑');
    } }]);
}

/* ---------- Klassen-Übersicht (nur Besitzer der Claude-Version) ---------- */
async function classOverview() {
  const box = $('#classBox'); if (!box || !ACC.be) return;
  box.innerHTML = '<p class="sm">Lade Accounts …</p>';
  try {
    const list = await ACC.be.listAll();
    const rows = list.map(d => {
      const st = d.state, stars = Object.values(st.stars || {}).reduce((a, b) => a + b, 0), bosses = Object.keys(st.boss || {}).length;
      const tot = Object.values(st.stats || {}).reduce((a, s) => a + s.c + s.w, 0), ok = Object.values(st.stats || {}).reduce((a, s) => a + s.c, 0);
      return { name: d.name, lv: levelOf(st.xp || 0).level, stars, bosses, tot, pc: tot ? Math.round(ok / tot * 100) : null, at: d.updatedAt };
    }).sort((a, b) => b.stars - a.stars);
    if (!rows.length) { box.innerHTML = '<p class="sm">Noch keine Accounts angelegt.</p>'; return; }
    box.innerHTML = `<div style="overflow-x:auto"><table class="ct"><tr><th>Spieler</th><th>Level</th><th>Sterne</th><th>Bosse</th><th>Aufgaben</th><th>richtig</th><th>zuletzt</th></tr>${rows.map(r => `<tr><td>${esc(r.name)}</td><td>${r.lv}</td><td>${r.stars}</td><td>${r.bosses}</td><td>${r.tot}</td><td>${r.pc == null ? '–' : r.pc + ' %'}</td><td>${r.at ? new Date(r.at).toLocaleDateString('de-AT') : '–'}</td></tr>`).join('')}</table></div>`;
  } catch (e) { box.innerHTML = '<p class="sm">Die Übersicht konnte gerade nicht geladen werden.</p>'; }
}
