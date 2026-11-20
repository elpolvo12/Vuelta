'use strict';
/* Vuelta – GTS Super 125 (2022). Alle Daten bleiben lokal im Browser (localStorage). */
const KEY = 'vespa.logbuch.v1';
const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const nf = (n, d = 1) => (Number.isFinite(n) ? n : 0).toLocaleString('de-DE', { minimumFractionDigits: d, maximumFractionDigits: d });
const today = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
const WD = ['SO', 'MO', 'DI', 'MI', 'DO', 'FR', 'SA'], MO = ['JAN', 'FEB', 'MÄR', 'APR', 'MAI', 'JUN', 'JUL', 'AUG', 'SEP', 'OKT', 'NOV', 'DEZ'];
const fmtDate = s => { const d = new Date(s); return isNaN(d) ? '' : String(d.getDate()).padStart(2, '0') + '.' + String(d.getMonth() + 1).padStart(2, '0') + '.' + String(d.getFullYear()).slice(2); };
const fmtDay = s => { const d = new Date(s); return isNaN(d) ? '' : WD[d.getDay()] + ' ' + d.getDate() + '. ' + MO[d.getMonth()]; };
const fmtTime = s => new Date(s).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
const fmtDur = sec => { const m = Math.round(sec / 60); return m >= 60 ? Math.floor(m / 60) + ' h ' + (m % 60) + ' min' : m + ' min'; };
const DIRS = ['N', 'NO', 'O', 'SO', 'S', 'SW', 'W', 'NW'];
const dirName = d => DIRS[Math.round(((d % 360) + 360) % 360 / 45) % 8];

/* ---------- Icons (weiß, minimal) ---------- */
const IP = {
  fuel: '<path d="M5 21V4h9v17M3 21h13M14 9h3l2 2v7a1.5 1.5 0 0 0 3 0V8l-3-3"/>',
  cloud: '<path d="M7 18a4 4 0 0 1-.5-8A6 6 0 0 1 18 9.5 4 4 0 0 1 17 18z"/>',
  rain: '<path d="M7 15a4 4 0 0 1-.5-8A6 6 0 0 1 18 6.5 4 4 0 0 1 17 15zM8 19l-1 2M12 19l-1 2M16 19l-1 2"/>',
  drop: '<path d="M12 3s-6 7-6 11a6 6 0 0 0 12 0c0-4-6-11-6-11z"/>',
  flake: '<path d="M12 2v20M3.3 7l17.4 10M3.3 17L20.7 7"/>',
  pin: '<path d="M12 21s-6-6-6-11a6 6 0 0 1 12 0c0 5-6 11-6 11zM12 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  light: '<rect x="7.5" y="2.5" width="9" height="19" rx="4.5"/><circle cx="12" cy="7" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="12" cy="17" r="1.6"/>',
  route: '<circle cx="6" cy="19" r="2.6"/><path d="M8.6 19h8.4a3.5 3.5 0 0 0 0-7H7a3.5 3.5 0 0 1 0-7h8.4"/><circle cx="18" cy="5" r="2.6"/>',
  speed: '<path d="M6.84 20.37A9 9 0 1 1 17.16 20.37"/><path d="M12 13l4.3-4.4"/><circle cx="12" cy="13" r="1.2" fill="#fff" stroke="none"/>',
  grid: '<rect x="4" y="4" width="6.5" height="6.5" rx="1.6"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.6"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.6"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.6"/>',
  locarrow: '<path d="M20 4L4 11l7 2 2 7z"/>',
  cal: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>',
  bolt: '<path d="M13 2L5 14h6l-1 8 8-12h-6z"/>',
  navi: '<path d="M12 3l7 17-7-4-7 4z"/>',
  city: '<path d="M4 21V9l6-3v15M10 21V4l8 3v14M3 21h18M13 10h2M13 14h2M7 12h1M7 16h1"/>',
  land: '<path d="M12 3l5 8h-3l4 6H6l4-6H7zM12 17v4"/>',
  oil: '<path d="M2 10.5h4.2l1.8 1.2h6.5L21 8.5l-4.6 8H7.6L6 13.7H2z"/><path d="M9.5 11.7V9h3.5v2.7"/><path d="M20.6 16.2c.7 1 1 1.6 1 2.1a1 1 0 0 1-2 0c0-.5.3-1.1 1-2.1z"/>',
  bab: '<path d="M3 4.5h18M3 8.5h18"/><path d="M9.5 8.5 4 21M14.5 8.5 20 21"/><path d="M12 11.5v2M12 16.5v3"/>',
  wrench: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.8-3.8a6 6 0 0 1-7.9 7.9l-6.9 6.9a2.1 2.1 0 0 1-3-3l6.9-6.9a6 6 0 0 1 7.9-7.9z"/>',
  tire: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3.5"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/>',
  note: '<path d="M6 3h9l4 4v14H6zM9 12h7M9 16h7"/>',
  wind: '<path d="M3 9h11a3 3 0 1 0-3-3M3 15h14a3 3 0 1 1-3 3"/>',
  vespa: '<circle cx="5.5" cy="17.8" r="2.3"/><circle cx="18.5" cy="17.8" r="2.3"/><path d="M5.2 15.4C6.4 11.6 7.3 8.3 7.9 5.6M6.2 5.6h3.4M8.2 15.6h5c.2-3 2.1-5.1 5-5.1h1.4c.9 0 1.4.8 1.1 1.6l-1.2 3"/><path d="M12.8 8.6h5.6"/>',
  play: '<path d="M8 5.2v13.6a.8.8 0 0 0 1.2.7l10.6-6.8a.8.8 0 0 0 0-1.4L9.2 4.5A.8.8 0 0 0 8 5.2z"/>',
  back: '<path d="M15 5l-7 7 7 7"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  work: '<rect x="3" y="7.5" width="18" height="12.5" rx="2"/><path d="M9 7.5V5.5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 5.5v2M3 13h18M11 13v1.5h2V13"/>',
  home: '<path d="M3.5 11L12 4l8.5 7M6 9.5V20h12V9.5M10 20v-5.5h4V20"/>'
};
const ic = (n, s = 15) => (s -= 1,  `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${IP[n]}</svg>`);

/* ---------- Daten ---------- */
function defaults() {
  return {
    trips: [], logs: [],
    settings: { pendelKm: 9, odoBase: 0, odoDate: new Date().toISOString(), tank: 7, needle: true, work: null, home: null, parked: null, tkKey: '', lastPos: null, voice: false },
    reminders: [
      { id: uid(), name: 'Ölwechsel', everyKm: 10000, everyMonths: 12, lastOdo: 0, lastDate: today() },
      { id: uid(), name: 'Inspektion', everyKm: 10000, everyMonths: 12, lastOdo: 0, lastDate: today() },
      { id: uid(), name: 'Variator / Riemen', everyKm: 20000, everyMonths: 0, lastOdo: 0, lastDate: today() },
      { id: uid(), name: 'HU / TÜV', everyKm: 0, everyMonths: 0, dueDate: '' }
    ]
  };
}
const isCom = t => t.cat ? t.cat === 'pendel' : !!t.commute;
let db;
function load() {
  try { db = JSON.parse(localStorage.getItem(KEY)) || defaults(); } catch (e) { db = defaults(); }
  db.trips = db.trips || []; db.logs = db.logs || []; db.reminders = db.reminders || [];
  db.settings = Object.assign(defaults().settings, db.settings || {});
  const op = db.settings.odoPhoto; if (op && (!op.t || Date.now() - new Date(op.t) > 864e5)) { delete db.settings.odoPhoto; try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) { } }
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) { toast('Speichern fehlgeschlagen'); } }

/* ---------- Berechnungen ---------- */
function currentOdo() {
  const since = db.settings.odoDate;
  return db.settings.odoBase + db.trips.filter(t => t.start >= since).reduce((a, t) => a + t.km, 0);
}
function reminderStatus(r) {
  const odo = currentOdo(); const now = new Date(); const parts = []; let level = 0;
  const upd = (lv, txt) => { level = Math.max(level, lv); parts.push(txt); };
  if (r.everyKm) {
    const left = r.lastOdo + r.everyKm - odo;
    upd(left < 0 ? 2 : left < 500 ? 1 : 0, left < 0 ? Math.round(-left) + ' km überfällig' : 'in ' + nf(Math.round(left), 0) + ' km');
  }
  if (r.everyMonths && r.lastDate) {
    const due = new Date(r.lastDate); due.setMonth(due.getMonth() + r.everyMonths);
    const days = Math.round((due - now) / 864e5);
    upd(days < 0 ? 2 : days < 30 ? 1 : 0, days < 0 ? -days + ' Tage überfällig' : 'in ' + days + ' Tagen');
  }
  if (r.dueDate) {
    const days = Math.round((new Date(r.dueDate) - now) / 864e5);
    upd(days < 0 ? 2 : days < 45 ? 1 : 0, (days < 0 ? -days + ' Tage überfällig' : 'in ' + days + ' Tagen') + ' (' + fmtDate(r.dueDate) + ')');
  }
  if (!parts.length) { level = 1; parts.push('Datum eintragen'); }
  return { level, text: parts.join(' · ') };
}
function consumption() {
  const tanks = db.logs.filter(l => l.type === 'tank' && l.odo && l.liters).sort((a, b) => a.odo - b.odo);
  const out = []; let last = null;
  tanks.forEach(t => {
    if (last && t.full && last.full !== false && t.odo > last.odo) out.push({ date: t.date, l100: t.liters / (t.odo - last.odo) * 100 });
    if (t.full) last = t;
  });
  return out;
}
const avgCons = () => { const c = consumption(); return c.length ? c.reduce((a, x) => a + x.l100, 0) / c.length : null; };
/* Tankstand: letzte volle Tankung + Verbrauch × gefahrene km (Schätzung) */
function tankState(extraKm = 0) {
  const full = db.logs.filter(l => l.type === 'tank' && l.full && l.odo).sort((a, b) => b.odo - a.odo)[0];
  if (!full) return null;
  const used = Math.max(0, currentOdo() + extraKm - full.odo), l100 = avgCons() || 3.1, cap = db.settings.tank || 7;
  const left = Math.max(0, cap - used * l100 / 100);
  return { frac: left / cap, liters: left, range: left / l100 * 100 };
}
function weatherInfo(code) {
  if (code == null) return { t: '', wet: false };
  const m = [[0, 'klar', 0], [3, 'bewölkt', 0], [48, 'Nebel', 0], [57, 'Nieselregen', 1], [67, 'Regen', 1], [77, 'Schnee', 1], [82, 'Schauer', 1], [86, 'Schneeschauer', 1], [99, 'Gewitter', 1]];
  const e = m.find(x => code <= x[0]) || m[0];
  return { t: e[1], wet: !!e[2] };
}
async function fetchWeather(lat, lon) {
  try {
    const r = await fetch('https://api.open-meteo.com/v1/forecast?latitude=' + lat + '&longitude=' + lon + '&current=temperature_2m,weather_code,wind_speed_10m,wind_gusts_10m,wind_direction_10m&wind_speed_unit=kmh');
    const j = await r.json();
    const c = j.current; return { temp: c.temperature_2m, code: c.weather_code, wind: Math.round(c.wind_speed_10m), gust: Math.round(c.wind_gusts_10m), wdir: c.wind_direction_10m };
  } catch (e) { return null; }
}
async function fetchAqi(lat, lon) {
  try {
    const r = await fetch('https://air-quality-api.open-meteo.com/v1/air-quality?latitude=' + lat + '&longitude=' + lon + '&current=european_aqi');
    const j = await r.json(); return Math.round(j.current.european_aqi);
  } catch (e) { return null; }
}
/* Vorhersage für die nächsten Stunden: Regen- und Glätte-Warnung */
let fc = null;
async function fetchForecast() {
  if (fc && Date.now() - fc.at < 15 * 60e3) return;
  const p = db.settings.lastPos || { lat: 52.52, lon: 13.4 };
  try {
    const r = await fetch('https://api.open-meteo.com/v1/forecast?latitude=' + p.lat + '&longitude=' + p.lon + '&current=temperature_2m,weather_code,wind_speed_10m,wind_gusts_10m,wind_direction_10m&hourly=temperature_2m,precipitation,wind_gusts_10m&forecast_hours=40&wind_speed_unit=kmh&timezone=auto');
    const j = await r.json();
    const warns = [], cur = j.current, hh = j.hourly;
    const h = { time: hh.time.slice(0, 4), precipitation: hh.precipitation.slice(0, 4), temperature_2m: hh.temperature_2m.slice(0, 4) };
    const wet = weatherInfo(cur.weather_code).wet;
    const ri = h.precipitation.findIndex(x => x >= 0.2);
    if (ri >= 0) {
      const t = h.time[ri].slice(11, 16), end = h.precipitation.slice(ri).findIndex(x => x < 0.2);
      warns.push({ lv: 'warn', icon: 'rain', t: ri === 0 && wet ? 'Regen jetzt' : 'Regen ab ' + t, d: nf(h.precipitation[ri], 1) + ' mm/h' + (end > 0 ? ' · bis ' + h.time[ri + end].slice(11, 16) : '') });
    }
    const minT = Math.min(cur.temperature_2m, ...h.temperature_2m);
    const anyWet = wet || h.precipitation.some(x => x >= 0.1);
    if (minT <= 3 && anyWet) warns.push({ lv: 'warn', icon: 'flake', t: 'Glättegefahr', d: nf(minT, 0) + ' °C · nasse Fahrbahn' });
    else if (minT <= 0) warns.push({ lv: 'warn', icon: 'flake', t: 'Frost', d: nf(minT, 0) + ' °C · Glätte möglich' });
    /* Pendel-Hinweise: Regen zur Heimfahrt, Glätte morgen früh */
    const nowD = new Date(), hr = nowD.getHours(), wd = nowD.getDay() >= 1 && nowD.getDay() <= 5;
    const L = hh.time.map((t, i) => ({ t, hr: +t.slice(11, 13), d: t.slice(0, 10), p: hh.precipitation[i], T: hh.temperature_2m[i] }));
    const today0 = hh.time[0].slice(0, 10);
    if (wd && hr < 16 && !warns.some(w => w.icon === 'rain')) {
      const ev = L.find(x => x.d === today0 && x.hr >= 16 && x.hr <= 19 && x.p >= 0.2);
      if (ev) warns.push({ lv: 'warn', icon: 'rain', t: 'Heimfahrt: Regen ab ' + ev.t.slice(11, 16), d: 'Lieber früher losfahren oder Regenkombi mitnehmen' });
    }
    if (hr >= 17) {
      const mo = L.filter(x => x.d !== today0 && x.hr >= 6 && x.hr <= 9);
      if (mo.length) { const mt = Math.min(...mo.map(x => x.T)), mw = mo.some(x => x.p >= 0.1); if (mt <= 1 || (mt <= 3 && mw)) warns.push({ lv: 'warn', icon: 'flake', t: 'Morgen früh ' + nf(mt, 0) + ' °C', d: mw ? 'Nasse Fahrbahn · Glättegefahr' : 'Glätte möglich' }); }
    }
    const gMax = Math.max(cur.wind_gusts_10m, ...hh.wind_gusts_10m.slice(0, 4));
    if (gMax >= 45) warns.push({ lv: 'warn', icon: 'wind', t: 'Starker Wind', d: 'Böen bis ' + Math.round(gMax) + ' km/h · vorsichtig fahren' });
    const slot = (d, a, b) => { const x = L.filter(y => y.d === d && y.hr >= a && y.hr <= b); if (!x.length) return null; return { hr: x[Math.floor(x.length / 2)].hr, T: Math.min(...x.map(y => y.T)), p: Math.max(...x.map(y => y.p)) }; };
    const tmr = L.find(x => x.d !== today0) ? L.find(x => x.d !== today0).d : today0, goD = hr < 10 ? today0 : tmr, bkD = hr < 19 ? today0 : tmr;
    const commute = { go: slot(goD, 7, 9), back: slot(bkD, 17, 19), goTmr: goD !== today0, backTmr: bkD !== today0 };
    fc = { at: Date.now(), commute, warns, temp: cur.temperature_2m, code: cur.weather_code, wind: Math.round(cur.wind_speed_10m), gust: Math.round(cur.wind_gusts_10m), wdir: cur.wind_direction_10m };
    if (tab === 'fahrt' && !sub && !rec) render();
  } catch (e) { }
}
/* Tankstellen (Tankerkönig, eigener kostenloser Schlüssel nötig) */
/* Preisverlauf selbst sammeln: je Tankstelle höchstens ein Wert pro halbe Stunde */
function logPrices(list) {
  const P = db.prices || (db.prices = []), now = Date.now();
  list.forEach(x => { if (!x.id) return; const l = P.findLast ? P.findLast(p => p.id === x.id) : null; if (l && now - l.t < 30 * 60000) return; P.push({ id: x.id, t: now, p: x.price }); });
  if (P.length > 6000) P.splice(0, P.length - 6000); save();
}
async function pricePing() {
  const k = db.settings.tkKey; if (!k) return; if (pricePing.last && Date.now() - pricePing.last < 5 * 60e3) return; pricePing.last = Date.now(); const p = db.settings.lastPos; if (!p) return;
  try { const r = await fetch('https://creativecommons.tankerkoenig.de/json/list.php?lat=' + p.lat + '&lng=' + p.lon + '&rad=5&sort=dist&type=e5&apikey=' + encodeURIComponent(k)); const j = await r.json(); if (j.ok) logPrices((j.stations || []).filter(s => s.isOpen && s.price).map(s => ({ id: s.id, price: s.price }))); } catch (e) { }
}
/* Abweichung vom Tagesmittel je Stunde (ct). Allgemein: einmalige Erhöhung um 12 Uhr, danach nur Senkungen */
const GEN_H = [-1, -1, -1, -1, -1, -1.5, -1.8, -2.2, -2.6, -3, -3.4, -3.8, 5, 4.5, 4, 3.5, 3, 2.2, 1.6, 1, .5, 0, -.3, -.6];
function priceProfile(id) {
  const P = (db.prices || []).filter(p => !id || p.id === id), byDay = {};
  P.forEach(p => { const d = new Date(p.t), k = p.id + d.toDateString(); (byDay[k] = byDay[k] || []).push(p); });
  const sum = Array(24).fill(0), cnt = Array(24).fill(0); let days = 0;
  Object.values(byDay).forEach(a => { if (a.length < 2) return; days++; const m = a.reduce((s, p) => s + p.p, 0) / a.length; a.forEach(p => { const h = new Date(p.t).getHours(); sum[h] += (p.p - m) * 100; cnt[h]++; }); });
  const hrs = cnt.filter(c => c).length;
  if (days < 7 || hrs < 10) return { v: GEN_H, own: false };
  return { v: sum.map((x, h) => cnt[h] ? x / cnt[h] : GEN_H[h]), own: true, days };
}
function bestTimeCard(id, title) {
  const pf = priceProfile(id), v = pf.v, h0 = new Date().getHours();
  const mn = Math.min(...v), best = v.map((x, h) => x <= mn + 1 ? h : -1).filter(h => h >= 0), b0 = best[0], b1 = best[best.length - 1] + 1;
  const W = 326, H = 120, x0 = 8, x1 = 318, lo = Math.min(...v) - 1, hi = Math.max(...v) + 1, X = h => x0 + h * (x1 - x0) / 23, Y = c => 92 - (c - lo) / (hi - lo) * 80;
  const pts = v.map((c, h) => [X(h), Y(c)]);
  let s = `<svg viewBox="0 0 ${W} ${H}" width="100%" class="ch"><rect x="${X(b0) - 4}" y="6" width="${X(b1 - 1) - X(b0) + 8}" height="90" rx="6" fill="rgba(255,214,90,.10)"/>`;
  s += `<line x1="${x0}" y1="${Y(0)}" x2="${x1}" y2="${Y(0)}" stroke="rgba(255,255,255,.12)" stroke-dasharray="3 4"/>`;
  const pa = bez(pts.slice(0, 12).concat([[X(11.92), Y(v[11])]])), pb = bez(pts.slice(12));
  s += `<path d="${pa} L${pts[12][0]},${pts[12][1]} ${pb.replace(/^M/, 'L')}" fill="none" stroke="#efbb3c" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`;
  s += `<circle cx="${X(h0)}" cy="${Y(v[h0])}" r="4.5" fill="#fff" stroke="rgba(8,18,14,.9)" stroke-width="2"/>`;
  [0, 6, 12, 18, 23].forEach(h => s += `<text x="${X(h)}" y="114" text-anchor="${h === 0 ? 'start' : h === 23 ? 'end' : 'middle'}" font-size="10" fill="#8e8e93" ${FF}>${h === 23 ? 24 : h}</text>`);
  s += '</svg>';
  const now = v[h0], d = Math.round(now - mn);
  const say = d <= 1 ? 'Jetzt günstig' : h0 >= b1 ? `Jetzt etwa ${d} ct über dem Tief · morgen ab ${b0} Uhr günstiger` : `Jetzt etwa ${d} ct über dem Tief · ab ${b0} Uhr günstiger`;
  return `<div class="card btz">${kh('clock', title || 'Beste Zeit', pf.own ? 'eigene Messung · ' + pf.days + ' Tage' : 'allgemein')}<div class="rt"><b>${b0}–${b1} Uhr</b> am günstigsten</div>${s}<div class="info">${say}</div></div>`;
}
let stations = null;
async function fetchStations() {
  const k = db.settings.tkKey;
  if (!k) { stations = { err: 'key' }; return; }
  if (fetchStations.at && Date.now() - fetchStations.at < 60e3 && stations && stations.list) { render(); return; } fetchStations.at = Date.now();
  if (fetchStations.last && Date.now() - fetchStations.last < 60e3 && stations && stations.list) return; fetchStations.last = Date.now();
  stations = { loading: true }; render();
  const pos = await new Promise(res => navigator.geolocation ? navigator.geolocation.getCurrentPosition(p => res({ lat: p.coords.latitude, lon: p.coords.longitude }), () => res(null), { timeout: 8000, maximumAge: 60000 }) : res(null));
  const p = pos || db.settings.lastPos || { lat: 52.52, lon: 13.4 };
  try {
    const r = await fetch('https://creativecommons.tankerkoenig.de/json/list.php?lat=' + p.lat + '&lng=' + p.lon + '&rad=5&sort=dist&type=e5&apikey=' + encodeURIComponent(k));
    const j = await r.json();
    if (!j.ok) throw 0;
    stations = { at: Date.now(), list: (j.stations || []).filter(s => s.isOpen && s.price).map(s => ({ id: s.id, n: s.brand || s.name, st: s.street || '', price: s.price, dist: s.dist, lat: s.lat, lon: s.lng })) }; stations.list.sort((a, b) => a.dist - b.dist); logPrices(stations.list);
  } catch (e) { stations = { err: 'net' }; }
  render();
}
const hav = (a, b) => {
  const R = 6371000, rad = x => x * Math.PI / 180;
  const dLa = rad(b.lat - a.lat), dLo = rad(b.lon - a.lon);
  const h = Math.sin(dLa / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLo / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};
const bearing = (a, b) => {
  const rad = x => x * Math.PI / 180, y = Math.sin(rad(b.lon - a.lon)) * Math.cos(rad(b.lat));
  const x = Math.cos(rad(a.lat)) * Math.sin(rad(b.lat)) - Math.sin(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.cos(rad(b.lon - a.lon));
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
};
/* Zonen: bis 60 Stadt, bis 80 Land, ab 80 Autobahn */
const zoneOf = v => v < 60 ? 0 : v < 80 ? 1 : 2;
const ZCOL = ['#ffa94d', '#ff5a1f', '#ff2d2d'];
const zcol = v => ZCOL[zoneOf(v)];

/* ---------- Fahrt-Aufzeichnung ---------- */
let rec = null, watchId = null, wake = null, lastWeather = null, drv = null;
function onPos(p) {
  if (!rec) return;
  const c = p.coords, pt = { lat: c.latitude, lon: c.longitude, t: p.timestamp || Date.now() };
  rec.acc = c.accuracy; rec.upd = Date.now();
  if (c.heading != null && !isNaN(c.heading) && c.heading >= 0) rec.heading = c.heading;
  if (c.accuracy > 40) return;
  rec.pos = { lat: pt.lat, lon: pt.lon };
  if (!rec.wFetching) {
    rec.wFetching = true;
    fetchWeather(pt.lat, pt.lon).then(w => { if (rec) { rec.weather = w; if (w) lastWeather = w; } });
  }
  if (!rec.last) { rec.last = pt; return; }
  const d = hav(rec.last, pt), dt = (pt.t - rec.last.t) / 1000;
  if (dt <= 0) return;
  const raw = d / dt * 3.6;
  const v = c.speed != null && c.speed >= 0 ? c.speed * 3.6 : raw;
  /* Bereit: erst losfahren, wenn mehrere Messungen > 10 km/h (zu Fuß zur Vespa zählt nicht) */
  if (rec.state === 'ready') {
    rec.speed = v < 4 ? 0 : v; rec.last = pt;
    if (v >= 10 && c.accuracy <= 30 && raw < 130) { rec.goN = (rec.goN || 0) + 1; if (rec.goN >= 3) goTrip(pt); } else rec.goN = 0;
    return;
  }
  if (v >= 8) { rec.stillSince = null; if (rec.state === 'pause') { rec.state = 'go'; hap(1); } }
  if (d < 5) { rec.speed = v < 4 ? 0 : v; return; }
  if (raw > 130) return;
  if (c.heading == null || isNaN(c.heading)) rec.heading = bearing(rec.last, pt);
  if (!rec.lastRt || hav(rec.lastRt, pt) >= 15) { rec.route.push([+pt.lat.toFixed(5), +pt.lon.toFixed(5)]); rec.lastRt = pt; }
  rec.m += d; rec.zm[zoneOf(v)] += d; rec.speed = v; rec.max = Math.max(rec.max, v); rec.last = pt;
}
async function startTrip() {
  if (!navigator.geolocation) return toast('Kein GPS verfügbar');
  rec = { state: 'ready', route: [], lastRt: null, stop: 0, start: new Date().toISOString(), m: 0, zm: [0, 0, 0], speed: 0, max: 0, last: null, weather: null, acc: null, hist: [], heading: null, upd: 0, aqi: null, stillSince: null, target: null };
  clearInterval(autoT); autoT = setInterval(autoTick, 1000); setTimeout(pricePing, 4000);
  watchId = navigator.geolocation.watchPosition(onPos, e => toast('GPS: ' + (e.code === 1 ? 'Zugriff verweigert' : 'kein Signal')), { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 });
  try { if (navigator.wakeLock) wake = await navigator.wakeLock.request('screen'); } catch (e) { }
  document.addEventListener('visibilitychange', reWake);
  mountDrive();
  render();
}
/* Losfahren erkannt: Aufnahme beginnt hier */
function say(txt) {
  try { if (!db.settings.voice || !('speechSynthesis' in window)) return; const u = new SpeechSynthesisUtterance(txt); u.lang = 'de-DE'; speechSynthesis.cancel(); speechSynthesis.speak(u); } catch (e) { }
}
function goTrip(pt) {
  rec.state = 'go'; rec.start = new Date(Date.now() - 4000).toISOString(); rec.m = 0; rec.zm = [0, 0, 0]; rec.route = []; rec.hist = []; rec.lastRt = null; rec.max = 0; rec.stop = 0; rec.stillSince = null;
  rec.startPos = { lat: pt.lat, lon: pt.lon };
  const w = db.settings.work, h = db.settings.home, near = q => q && hav(rec.startPos, q) < 1500;
  rec.target = near(h) && w ? w : near(w) && h ? h : (w && !h && !near(w)) ? w : (h && !w && !near(h)) ? h : null;
  hap(2); toast('Aufnahme läuft'); say('Fahrt gestartet');
}
/* Stillstand: nach 1 min Pause, nach weiteren 5 min automatisch beenden (Ende = Zeitpunkt des Anhaltens) */
let autoT = null;
function autoTick() {
  if (!rec || rec.state === 'ready') return;
  const now = Date.now(), stale = now - (rec.upd || 0) > 7000, slow = stale || rec.speed < 3;
  if (slow) { if (!rec.stillSince) rec.stillSince = now; } else { if (rec.stillSince && rec.state === 'go' && rec.pos) { const d = (now - rec.stillSince) / 1000; if (d >= 8 && d < 60) (rec.stops = rec.stops || []).push([+rec.pos.lat.toFixed(5), +rec.pos.lon.toFixed(5), Math.round(d)]); } rec.stillSince = null; }
  if (!rec.stillSince) return;
  const s = (now - rec.stillSince) / 1000;
  if (rec.state === 'go' && s >= 60) { rec.state = 'pause'; hap(1); }
  if (s >= 360) { hap(3); const at = new Date(rec.stillSince); stopTrip(at); toast('Fahrt automatisch beendet'); }
}
function etaText() {
  if (!rec || rec.state === 'ready' || !rec.pos || !rec.target) return '';
  const rem = hav(rec.pos, rec.target) * 1.25 / 1000; if (rem < 0.15) return '';
  const cm = db.trips.filter(t => isCom(t) && t.dur > 120 && t.km > 1), sd = cm.reduce((a, t) => a + t.dur, 0);
  const v = sd ? cm.reduce((a, t) => a + t.km, 0) / sd * 3600 : 24;
  return 'Ankunft ' + fmtTime(new Date(Date.now() + rem / Math.max(8, v) * 3600e3));
}
async function reWake() {
  if (document.visibilityState === 'visible' && rec && navigator.wakeLock) { try { wake = await navigator.wakeLock.request('screen'); } catch (e) { } }
}
function stopTrip(endAt) {
  if (!rec) return;
  clearInterval(autoT);
  navigator.geolocation.clearWatch(watchId);
  try { wake && wake.release(); } catch (e) { }
  document.removeEventListener('visibilitychange', reWake);
  unmountDrive();
  const auto = endAt instanceof Date, end = auto ? endAt : new Date(), dur = Math.max(1, (end - new Date(rec.start)) / 1000), km = rec.m / 1000;
  const r = rec; rec = null;
  if (r.state === 'ready') { if (r.pos) db.settings.lastPos = r.pos; notice('Keine Fahrt aufgezeichnet', 'Du bist nicht schneller als 10 km/h gefahren – die Aufnahme hat nicht begonnen.'); save(); return render(); }
  if (auto) { r.stop = Math.max(0, r.stop - (Date.now() - +end) / 1000); r.hist = r.hist.filter(x => x.t <= +end); }
  if (r.pos) { db.settings.lastPos = r.pos; if (km >= 0.1) db.settings.parked = { lat: r.pos.lat, lon: r.pos.lon, t: end.toISOString() }; }
  if (km < 0.1) { notice('Fahrt nicht gespeichert', 'Die Strecke war kürzer als 100 m (' + Math.round(km * 1000) + ' m).'); save(); return render(); }
  const pk = db.settings.pendelKm, B = 24, sp = [];
  if (r.hist.length) for (let i = 0; i < B; i++) {
    const a = Math.floor(i * r.hist.length / B), b = Math.max(a + 1, Math.floor((i + 1) * r.hist.length / B));
    const s = r.hist.slice(a, b); sp.push(Math.round(s.reduce((x, y) => x + y.v, 0) / s.length));
  }
  const ds = (a, n) => { if (a.length <= n) return a.slice(); const o = []; for (let i = 0; i < n; i++) { const x = Math.floor(i * a.length / n), y = Math.max(x + 1, Math.floor((i + 1) * a.length / n)); o.push(a.slice(x, y)); } return o; };
  const ser = ds(r.hist.map(x => x.v), 120).map(x => Array.isArray(x) ? Math.round(x.reduce((a, b) => a + b, 0) / x.length) : x);
  const trip = {
    ser, route: ds(r.route, 150).map(x => Array.isArray(x[0]) ? x[Math.floor(x.length / 2)] : x), stop: r.stop, wind: r.weather ? r.weather.wind : null, gust: r.weather ? r.weather.gust : null,
    id: uid(), start: r.start, end: end.toISOString(), km: Math.round(km * 100) / 100, dur: Math.round(dur),
    max: Math.round(r.max), avg: Math.round(km / (dur / 3600)), temp: r.weather ? r.weather.temp : null, code: r.weather ? r.weather.code : null,
    commute: km > pk * 0.6 && km < pk * 1.6, zk: r.zm.map(x => Math.round(x / 10) / 100), stops: (r.stops || []).slice(0, 200), spark: sp
  };
  db.trips.unshift(trip); save(); toast('Fahrt gespeichert: ' + nf(km) + ' km'); render();
  nameTrip(trip).then(() => render());
}
/* Start/Ziel benennen: Zuhause, Arbeit oder Stadtteil (OpenStreetMap, ohne Schlüssel) */
const geoC = {}; let geoQ = Promise.resolve();
function placeName(p) {
  if (!p) return Promise.resolve(null);
  const near = q => q && hav(p, q) < 350;
  if (near(db.settings.home)) return Promise.resolve('Zuhause');
  if (near(db.settings.work)) return Promise.resolve('Arbeit');
  const k = p.lat.toFixed(3) + ',' + p.lon.toFixed(3); if (geoC[k]) return Promise.resolve(geoC[k]);
  geoQ = geoQ.then(() => new Promise(r => setTimeout(r, 1100))).then(() => fetch('https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=14&accept-language=de&lat=' + p.lat + '&lon=' + p.lon).then(r => r.json()).then(j => { const a = j.address || {}; return geoC[k] = a.suburb || a.quarter || a.city_district || a.neighbourhood || a.town || a.village || a.city || null; }).catch(() => null));
  return geoQ;
}
/* Straßenname einer Ampel (Kreuzung), einmal geholt und gespeichert */
function streetName(p, key) {
  if (streetName.busy && streetName.busy[key]) return; (streetName.busy = streetName.busy || {})[key] = 1;
  geoQ = geoQ.then(() => new Promise(r => setTimeout(r, 1100))).then(() => fetch('https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=17&accept-language=de&lat=' + p.lat + '&lon=' + p.lon).then(r => r.json()).then(j => { const a = j.address || {}, n = a.road || a.square || a.neighbourhood; if (n) { (db.settings.spotNames = db.settings.spotNames || {})[key] = n; save(); if (tab === 'fahrten' && !sub) render(); } }).catch(() => { }));
}
function nameTrip(t) {
  if (!t.route || t.route.length < 2 || (t.from && t.to)) return Promise.resolve();
  const a = { lat: t.route[0][0], lon: t.route[0][1] }, b = { lat: t.route[t.route.length - 1][0], lon: t.route[t.route.length - 1][1] };
  return placeName(a).then(f => placeName(b).then(e => { if (f) t.from = f; if (e) t.to = e; if (f || e) save(); }));
}
const ftLabel = t => t.from || t.to ? `${esc(t.from || '?')} → ${esc(t.to || '?')}` : '';
let named = false;
function nameOldTrips() { if (named) return; named = true; db.trips.filter(t => !t.from && t.route && t.route.length > 1).slice(0, 40).reduce((pr, t) => pr.then(() => nameTrip(t)), Promise.resolve()).then(() => { if (tab === 'fahrten' && !sub) render(); }); }
const liveKm = () => rec ? rec.m / 1000 : 0;

/* ---------- Fahrmodus (Vollbild, Touch-Sperre, 2 s halten zum Beenden) ---------- */
const P = (r, deg) => { const a = deg * Math.PI / 180; return [170 + r * Math.cos(a), 170 + r * Math.sin(a)]; };
const arcd = (r, d1, d2) => { const [x1, y1] = P(r, d1), [x2, y2] = P(r, d2); return `M${x1.toFixed(1)} ${y1.toFixed(1)} A${r} ${r} 0 ${Math.abs(d2 - d1) > 180 ? 1 : 0} 1 ${x2.toFixed(1)} ${y2.toFixed(1)}`; };
const ease = x => x < 0 ? 0 : x > 1 ? 1 : x * x * (3 - 2 * x);
function dialSVG(hi) {
  let s = `<svg id="dsv" viewBox="-14 -12 368 356"><defs>
  <linearGradient id="bz" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5a5c60"/><stop offset=".18" stop-color="#2a2b2e"/><stop offset=".4" stop-color="#101113"/><stop offset=".62" stop-color="#3a3b3f"/><stop offset=".8" stop-color="#141517"/><stop offset="1" stop-color="#4a4b4f"/></linearGradient>
  <linearGradient id="bz2" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#050505"/><stop offset=".5" stop-color="#1b1c1e"/><stop offset="1" stop-color="#060606"/></linearGradient>
  <filter id="gl" filterUnits="userSpaceOnUse" x="-14" y="-12" width="368" height="356"><feGaussianBlur stdDeviation="7" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
  <linearGradient id="gA" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fbe8bb"/><stop offset=".2" stop-color="#d7ba87"/><stop offset=".45" stop-color="#a88e60"/><stop offset=".7" stop-color="#6a522e"/><stop offset="1" stop-color="#3e2f18"/></linearGradient><filter id="sat" x="-.1" y="-.1" width="1.2" height="1.2"><feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed="3" stitchTiles="stitch" result="n"/><feColorMatrix in="n" type="saturate" values="0" result="g"/><feComposite in="SourceGraphic" in2="g" operator="arithmetic" k1="0" k2="1" k3=".09" k4="-.045" result="c"/><feComposite in="c" in2="SourceGraphic" operator="in"/></filter><radialGradient id="eo" gradientUnits="userSpaceOnUse" cx="170" cy="170" r="159"><stop offset="0.9836" stop-color="#000" stop-opacity="0"/><stop offset="0.9918" stop-color="#fff4d6" stop-opacity=".55"/><stop offset="1" stop-color="#000" stop-opacity=".5"/></radialGradient><radialGradient id="ei" gradientUnits="userSpaceOnUse" cx="170" cy="170" r="143.6"><stop offset="0.9819" stop-color="#000" stop-opacity=".5"/><stop offset="0.9909" stop-color="#fff4d6" stop-opacity=".55"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient><g filter="url(#sat)"><circle cx="170" cy="170" r="150" fill="none" stroke="url(#gA)" stroke-width="18"/></g><circle cx="170" cy="170" r="157.7" fill="none" stroke="url(#eo)" stroke-width="2.6"/><circle cx="170" cy="170" r="142.3" fill="none" stroke="url(#ei)" stroke-width="2.6"/><circle cx="170" cy="170" r="141" fill="#050505"/><circle cx="170" cy="170" r="140.3" fill="none" stroke="#000" stroke-width="1.4"/>`;
  for (let v = 0; v < hi; v += 10) {
    const d1 = 135 + 270 * v / hi + 1.3, d2 = 135 + 270 * (v + 10) / hi - 1.3;
    s += `<path id="sg${v}" d="${arcd(170, d1, d2)}" stroke="rgba(255,255,255,.13)" stroke-width="12" fill="none"/><path id="sf${v}" d="" stroke="#ff3a1c" stroke-width="12" fill="none"/><path id="sa${v}" d="${arcd(179, d1, d2)}" stroke="#fff" stroke-width="2" fill="none" opacity="0"/>`;
  }
  for (let v = 0; v <= hi; v++) {
    const ang = 135 + 270 * v / hi, maj = v % 10 === 0, mid = v % 5 === 0 && !maj;
    const [r1, r2] = maj ? [114, 134] : mid ? [122, 134] : [128, 134];
    const [x1, y1] = P(r1, ang), [x2, y2] = P(r2, ang);
    s += `<line id="tk${v}" x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${maj ? '#d8d8d8' : '#555'}" stroke-width="${maj ? 3.4 : mid ? 1.8 : 1}" opacity="0"/>`;
  }
  for (let v = 0; v <= hi; v += 20) { const [x, y] = P(92, 135 + 270 * v / hi); s += `<text id="nm${v}" x="${x.toFixed(1)}" y="${(y + 7).toFixed(1)}" fill="#cfcfcf" font-size="20" text-anchor="middle" font-family="-apple-system,BlinkMacSystemFont,Helvetica Neue,sans-serif" opacity="0">${v}</text>`; }
  s += ``;
  for (let i = 0; i <= 60; i++) { const a = 120 - i, [x1, y1] = P(116, a), [x2, y2] = P(124, a); s += `<line id="fu${i}" x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#2a2a2a" stroke-width="1.1"/>`; }
  [[0, '#e0242c'], [.5, '#ddd'], [1, '#ddd']].forEach(([f, c]) => { const a = 120 - 60 * f, [x1, y1] = P(112, a), [x2, y2] = P(128, a); s += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${c}" stroke-width="1.6"/>`; });
  const ff = 'font-family="-apple-system,BlinkMacSystemFont,Helvetica Neue,sans-serif"';
  let [ex, ey] = P(96, 115), [fx, fy] = P(96, 65);
  s += `<text x="${ex.toFixed(0)}" y="${(ey + 4).toFixed(0)}" fill="#8c8c8c" font-size="11" text-anchor="middle" ${ff}>E</text><text x="${fx.toFixed(0)}" y="${(fy + 4).toFixed(0)}" fill="#8c8c8c" font-size="11" text-anchor="middle" ${ff}>F</text>`;
  s += `<text id="rng" x="170" y="240" fill="#8c8c8c" font-size="11" text-anchor="middle" ${ff}></text>`;
  s += `<path id="holdR" d="" fill="none" stroke="#ff2d2d" stroke-width="18"/>`;
  s += `<g id="ndl" transform="rotate(135 170 170)" opacity="0"><path d="M208 163.8 L292.6 166.68 L292.6 173.32 L208 176.2Z" fill="#ffffff"/><path d="M292.6 166.68 L302 167.0 A3.0 3.0 0 0 1 302 173.0 L292.6 173.32Z" fill="#ff5a1f"/></g>`;
  s += `<circle cx="170" cy="170" r="48" fill="#050505" stroke="rgba(255,255,255,.16)" stroke-width="1.2"/>`;
  s += `<text id="spd" x="170" y="188" fill="#fff" font-size="60" text-anchor="middle" letter-spacing="-1" ${ff} opacity="0">0</text><text id="kmh" x="170" y="208" fill="#8c8c8c" font-size="14" text-anchor="middle" ${ff} opacity="0">km/h</text>`;
  return s + '</svg>';
}
function buildDial() {
  const box = $('#dBox'); const logo = box.querySelector('.logo');
  box.querySelector('svg') && box.querySelector('svg').remove();
  box.insertAdjacentHTML('afterbegin', dialSVG(drv.hi));
  drv.last = null; drv.el = {};
  drv.fuel = null;
}
const G = id => document.getElementById(id);
function paintDial(dv, reach, avg) {
  const hi = drv.hi, sa = 135 + 270 * dv / hi;
  G('ndl').setAttribute('transform', `rotate(${sa.toFixed(2)} 170 170)`);
  const key = Math.round(dv * 4) + '|' + reach + '|' + hi;
  if (drv.last === key) return; drv.last = key;
  for (let v = 0; v < hi; v += 10) {
    const d1 = 135 + 270 * v / hi + 1.3, d2 = 135 + 270 * (v + 10) / hi - 1.3;
    const f = G('sf' + v), vis = v <= reach;
    const e = Math.min(d2, sa);
    f.setAttribute('d', vis && dv > v && e > d1 ? arcd(170, d1, e) : '');
    G('sg' + v).setAttribute('opacity', vis ? 1 : 0);
    G('sa' + v).setAttribute('opacity', avg != null && vis && avg >= v && avg < v + 10 ? 1 : 0);
  }
  for (let v = 0; v <= hi; v++) {
    const t = G('tk' + v), vis = v <= reach;
    t.setAttribute('opacity', vis ? 1 : 0);
    if (vis) t.setAttribute('stroke', v <= dv ? '#ff3a1c' : (v % 10 === 0 ? '#d8d8d8' : '#555'));
  }
  for (let v = 0; v <= hi; v += 20) { const n = G('nm' + v); n.setAttribute('opacity', v <= reach ? 1 : 0); n.setAttribute('fill', v <= dv ? '#ff3a1c' : '#cfcfcf'); }
}
function bez(pts) {
  if (pts.length < 2) return '';
  let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(i - 1, 0)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(i + 2, pts.length - 1)];
    d += ` C${(p1[0] + (p2[0] - p0[0]) / 6).toFixed(1)} ${(p1[1] + (p2[1] - p0[1]) / 6).toFixed(1)} ${(p2[0] - (p3[0] - p1[0]) / 6).toFixed(1)} ${(p2[1] - (p3[1] - p1[1]) / 6).toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d;
}
function curveSVG(avg) {
  const W = 220, H = 64, x0 = 2, x1 = 216, now = Date.now(), span = 1800000;
  const h = rec.hist.filter(x => now - x.t <= span);
  const X = t => x1 - (now - t) / span * (x1 - x0);
  const vmax = Math.max(60, ...h.map(x => x.v)), yv = v => 28 - 24 * v / vmax, ya = a => 48 - 11 * Math.max(-22, Math.min(22, a)) / 22;
  const grid = (a, b) => { let s = ''; for (let y = a; y < b; y += 6) s += `<line x1="${x0}" y1="${y}" x2="${x1}" y2="${y}" stroke="rgba(255,255,255,.12)"/>`; return s; };
  let s = `<svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 ${W} ${H}">${grid(4, 28)}${grid(38, 62)}<line x1="${x0}" y1="28" x2="${x1}" y2="28" stroke="#444" stroke-width="1.2"/><line x1="${x0}" y1="48" x2="${x1}" y2="48" stroke="#555" stroke-width="1"/>`;
  const sp = h.map(x => [X(x.t), yv(x.v)]), ac = h.map((x, i) => [X(x.t), ya(i ? x.v - h[i - 1].v : 0)]);
  if (sp.length > 1) {
    s += `<path d="${bez(sp)}" fill="none" stroke="#efbb3c" stroke-width="2.2" stroke-linejoin="round"/>`;
    s += `<defs><clipPath id="neg"><rect x="${x0}" y="48" width="${x1 - x0}" height="16"/></clipPath></defs><path d="${bez(ac)}" fill="none" stroke="rgba(255,255,255,.6)" stroke-width="2"/><path d="${bez(ac)}" fill="none" stroke="#4fae80" stroke-width="2.4" clip-path="url(#neg)"/>`;
  }
  if (avg != null) s += `<line x1="${x0}" y1="${yv(avg).toFixed(1)}" x2="${x1}" y2="${yv(avg).toFixed(1)}" stroke="rgba(255,255,255,.6)" stroke-width="1.1" stroke-dasharray="4 4"/>`;
  return s + `<line x1="${x1}" y1="1" x2="${x1}" y2="63" stroke="#b3202a" stroke-width="1.4"/></svg>`;
}
const commuteTime = () => { const d = new Date(), h = d.getHours(), wk = d.getDay() >= 1 && d.getDay() <= 5; return wk && ((h >= 5 && h < 10) || (h >= 15 && h < 20)); };
function svcInfo(nm) {
  const r = db.reminders.find(x => x.name.toLowerCase().startsWith(nm.toLowerCase().slice(0, 5))); if (!r) return null;
  const s = reminderStatus(r), parts = [];
  let lv = s.level;
  if (r.everyKm) { const left = r.lastOdo + r.everyKm - currentOdo() - (rec ? liveKm() : 0); lv = Math.max(left < 0 ? 2 : left < 500 ? 1 : 0, 0); parts.push(left < 0 ? Math.round(-left) + ' km überfällig' : 'in ' + nf(Math.round(left), 0) + ' km'); }
  const mo = s.text.split(' · ')[r.everyKm ? 1 : 0]; if (r.everyMonths && mo) { parts.push(mo); lv = Math.max(lv, s.level); }
  return { level: lv, text: parts.join(' · ') || s.text };
}
/* Haptik: Android per vibrate, iOS (Safari ab 17.4) per Schalter-Trick */
function hap(n = 1) {
  try { if (navigator.vibrate) navigator.vibrate(n === 1 ? 14 : n === 2 ? [24, 50, 24] : [40, 60, 40, 60, 70]); } catch (e) { }
  try { let l = document.getElementById('hapL'); if (!l) { l = document.createElement('label'); l.id = 'hapL'; l.style.cssText = 'position:fixed;left:-50px;top:-50px;width:1px;height:1px;opacity:0;pointer-events:none'; l.innerHTML = '<input type="checkbox" switch>'; document.body.appendChild(l); } for (let i = 0; i < n; i++) setTimeout(() => l.click(), i * 70); } catch (e) { }
}
function fitDrive() {
  const el = $('#drive'), s = $('#dsv'); if (!s) return;
  let w = innerWidth - 4; s.style.width = w + 'px'; s.style.height = 'auto';
  for (let i = 0; i < 12 && el.scrollHeight > el.clientHeight + 1 && w > 220; i++) { w -= Math.max(6, Math.ceil((el.scrollHeight - el.clientHeight) * 1.05)); s.style.width = w + 'px'; }
}
function mountDrive() {
  const el = $('#drive'); el.hidden = false; document.body.style.overflow = 'hidden';
  drv = { hi: 100, dv: 0, reach: -1, t0: performance.now(), introDone: false, last: null, sec: 0, hold: 0, faded: false, avgKm: 0 };
  el.innerHTML = `<div class="dbg"></div><div class="top"><div><b class="tm" id="dClock"></b><span id="dDate"></span><span class="eta" id="dEta"></span></div><span class="rec" id="dRec"><i></i>BEREIT</span></div>
  <div class="chrow"><div class="chips fade" id="dChips"></div><span class="svc" id="dSvc"><button class="ib" data-sv="Ölwechsel"></button><button class="ib" data-sv="Inspektion"></button></span></div>
  <div class="pop" id="dPop" hidden></div>
  <div class="dialbox" id="dBox"><img class="logo" id="dLogo" src="vuelta-logo.png" alt=""></div>
  <div id="holdOv"><svg viewBox="0 0 240 240" width="240" height="240"><circle cx="120" cy="120" r="100" fill="rgba(0,0,0,.82)" stroke="#2a2a2a" stroke-width="10"/><circle id="holdP" cx="120" cy="120" r="100" fill="none" stroke="#e0242c" stroke-width="10" stroke-linecap="round" stroke-dasharray="628" stroke-dashoffset="628" transform="rotate(-90 120 120)"/><text x="120" y="112" text-anchor="middle" fill="#fff" font-size="44" font-family="-apple-system,Helvetica Neue,sans-serif" id="holdT">2,0 s</text><text x="120" y="146" text-anchor="middle" fill="#8c8c8c" font-size="15" letter-spacing="2" font-family="-apple-system,Helvetica Neue,sans-serif">FAHRT BEENDEN</text></svg></div>
  <div class="foot fade"><div class="kmc" id="tA"><span class="l">GESAMT</span><span class="r"><b id="oA"></b><span class="u">km</span></span></div><div class="kmc" id="mA"><span class="l" id="mL"></span><span class="r"><b id="mK"></b><span class="u">km</span></span></div><span class="c" id="dAqi"></span></div>
  <div class="mid"><div class="cv fade"><div class="ch"><span>Tempo · 30 Min</span><b>Ø <span id="dAvg" style="font-size:22px;color:inherit;letter-spacing:0">0</span> <small>km/h</small></b></div><div id="dCv"></div></div>
  <div class="tiles fade" id="dTiles"></div></div>
<div class="endw endb"><div id="endBtn"><svg viewBox="0 0 54 54"><circle cx="27" cy="27" r="25" fill="none" stroke="#333" stroke-width="3"/><circle id="endP" cx="27" cy="27" r="25" fill="none" stroke="#e0242c" stroke-width="3" stroke-linecap="round" stroke-dasharray="157" stroke-dashoffset="157" transform="rotate(-90 27 27)"/></svg><svg class="haz" viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#ff2d2d" stroke-width="2.2" stroke-linejoin="round"><path d="M12 3.2 22 20.5H2z"/><path d="M12 9.5 16.6 17.6H7.4z" stroke-width="1.6"/></svg></div><small>2 S HALTEN · BEENDEN</small></div>
  <img class="dlogo" src="vuelta-logo.png" alt="Vuelta">
`;
  $('#dSvc').addEventListener('click', e => { const b = e.target.closest('.ib'); if (!b) return; const nm = b.dataset.sv, pop = $('#dPop'); clearTimeout(drv.pt); if (drv.pop === nm) { drv.pop = null; pop.hidden = true; return; } drv.pop = nm; const inf = svcInfo(nm); pop.innerHTML = `<b>${nm}</b><span>${inf ? inf.text : ''}</span>`; pop.hidden = false; drv.pt = setTimeout(() => { drv.pop = null; pop.hidden = true; }, 6000); });
  $('#dBox').appendChild($('#dSvc'));
  buildDial(); fitDrive(); setTimeout(fitDrive, 400); setTimeout(fitDrive, 1500); window.onresize = fitDrive;
  const btn = $('#endBtn'), off = () => { if (drv.hold) { drv.hold = 0; drv.hs = 0; $('#endBtn').style.transform = ''; } };
  btn.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); drv.hold = performance.now(); drv.hs = 0; hap(1); });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(n => btn.addEventListener(n, off));
  el.addEventListener('pointerdown', () => { if (!drv.introDone) drv.t0 -= 10000; });
  drv.raf = requestAnimationFrame(driveFrame);
}
function unmountDrive() {
  if (drv) cancelAnimationFrame(drv.raf);
  drv = null; const el = $('#drive'); el.hidden = true; el.innerHTML = ''; document.body.style.overflow = '';
}
function driveFrame(ts) {
  if (!rec || !drv) return;
  drv.raf = requestAnimationFrame(driveFrame);
  const t = (ts - drv.t0) / 1000, now = Date.now();
  const stale = now - (rec.upd || 0) > 7000, target = stale ? 0 : rec.speed;
  let dv, reach;
  if (!drv.introDone) {
    const hi = 100;
    dv = t < 3.3 ? 0 : t < 4.6 ? hi * ease((t - 3.3) / 1.3) : t < 4.7 ? hi : t < 5.6 ? hi * (1 - ease((t - 4.7) / .9)) : 0;
    drv.reach = t < 3.0 ? -1 : Math.max(drv.reach, dv); reach = drv.reach;
    if (t >= 5.6) { drv.introDone = true; drv.dv = 0; }
    const lg = G('dLogo');
    if (t < 3.6) {
      const pin = ease((t - .5) / 1.2), pout = ease((t - 2.6) / .9);
      lg.style.opacity = t > .5 ? 1 : 0;
      lg.style.clipPath = t < 2.6 ? `inset(0 ${(100 - pin * 100).toFixed(1)}% 0 0)` : `inset(0 0 0 ${(pout * 100).toFixed(1)}%)`;
    } else lg.style.opacity = 0;
    G('ndl').setAttribute('opacity', db.settings.needle ? ease((t - 3.0) / .3) : 0);
    const nOp = ease((t - 4.9) / .6);
    G('spd').setAttribute('opacity', nOp); G('kmh').setAttribute('opacity', nOp);
    if (t >= 5.5 && !drv.faded) { drv.faded = true; document.querySelectorAll('#drive .fade').forEach(x => x.classList.add('in')); }
  } else {
    const want = target > 100 || (drv.hi === 120 && target > 90) ? 120 : 100;
    if (want !== drv.hi) { drv.hi = want; buildDial(); G('ndl').setAttribute('opacity', db.settings.needle ? 1 : 0); G('spd').setAttribute('opacity', 1); G('kmh').setAttribute('opacity', 1); drv.sec = 0; }
    drv.dv += (target - drv.dv) * .12; if (Math.abs(target - drv.dv) < .05) drv.dv = target;
    dv = drv.dv; reach = 1e9;
  }
  const el = rec.m > 0 ? rec.m / ((now - new Date(rec.start)) / 1000) * 3.6 : null;
  /* Beim Halten läuft die Nadel gegen den Uhrzeigersinn von 100 auf 0, der rote Ring folgt ihr */
  const ph = drv.hold ? Math.min(1, (performance.now() - drv.hold) / 2000) : 0;
  if (ph > 0) { const k = ease(Math.min(1, ph / .15)), down = drv.hi * (1 - ease(ph)); dv = dv + (down - dv) * k; G('ndl').setAttribute('opacity', 1); }
  paintDial(dv, reach, el);
  /* 2 s halten zum Beenden: roter Ring wächst über den Goldrahmen, Mitte zählt runter */
  const p = drv.hold ? Math.min(1, (performance.now() - drv.hold) / 2000) : 0;
  const sp = G('spd'), txt = p > 0 ? (p >= 1 ? 'ENDE' : (2 - 2 * p).toFixed(1).replace('.', ',')) : String(drv.introDone ? Math.round(target) : 0);
  if (sp.textContent !== txt) { sp.textContent = txt; const big = p > 0 || Math.round(target) >= 100; sp.setAttribute('font-size', p > 0 ? 52 : big ? 48 : 60); sp.setAttribute('y', big ? 186 : 188); sp.setAttribute('fill', p > 0 ? '#ff2d2d' : '#fff'); G('kmh').textContent = p > 0 ? 'FAHRT BEENDEN' : 'km/h'; }
  const hide = p > 0 ? 'hidden' : 'visible'; for (let v = 0; v <= drv.hi; v += 20) { const n = G('nm' + v); if (n) n.style.visibility = hide; } const rg2 = G('rng'); if (rg2) rg2.style.visibility = hide;
  const hr = G('holdR'); if (hr) hr.setAttribute('d', p > 0.002 ? arcd(150, 135 + 270 * (1 - ease(p)), 405) : '');
  if (!p && drv.introDone && !db.settings.needle) G('ndl').setAttribute('opacity', 0);
  G('endP').setAttribute('stroke-dashoffset', 157 * (1 - p));
  $('#endBtn').style.transform = 'scale(' + (1 + .14 * p).toFixed(3) + ')';
  const ov = G('holdOv'); ov.style.opacity = 0; G('holdP').setAttribute('stroke-dashoffset', 628 * (1 - p)); G('holdT').textContent = p >= 1 ? 'ENDE' : (2 - 2 * p).toFixed(1).replace('.', ',') + ' s';
  const st = p >= 1 ? 4 : p >= .75 ? 3 : p >= .5 ? 2 : p >= .25 ? 1 : 0;
  if (drv.hold && st > (drv.hs || 0)) { drv.hs = st; if (st < 4) hap(st === 3 ? 2 : 1); }
  if (p >= 1) { drv.hold = 0; hap(3); stopTrip(); return; }
  if (ts - drv.sec >= 1000) { drv.sec = ts; driveSecond(stale); }
}
/* Tacho an der Ampel: Ringe mit heute (weiß, außen), Bestzeit (gold, Rahmen) und weiteren Routen (fein) */
function refTime(t, km) { /* Zeit (s) und Stand (s), bis eine frühere Fahrt km erreicht hatte */
  const S = t.ser || []; if (S.length < 6) return null; const dt = t.dur / S.length; let d = 0, st = 0, sum = S.reduce((a, v) => a + v, 0) * dt / 3600 || 1; const k = t.km / sum;
  for (let i = 0; i < S.length; i++) { const dd = S[i] * dt / 3600 * k; if (S[i] < 1) st += dt; if (d + dd >= km) return { t: i * dt + (dd ? (km - d) / dd * dt : 0), st }; d += dd; }
  return { t: t.dur, st };
}
let rg = null;
function ringGeo() {
  const sv = G('dsv'); if (!sv) return null; if (rg && rg.sv === sv) return rg;
  const c = [...sv.children].find(e => e.tagName === 'circle'), cx = +c.getAttribute('cx'), cy = +c.getAttribute('cy');
  const pt = (d, last) => { const n = d.match(/-?[\d.]+/g).map(Number); return last ? [n[n.length - 2], n[n.length - 1]] : [n[0], n[1]]; };
  const s0 = pt(G('sg0').getAttribute('d')), s1 = pt(G('sg90').getAttribute('d'), 1);
  const a0 = Math.atan2(s0[1] - cy, s0[0] - cx); let a1 = Math.atan2(s1[1] - cy, s1[0] - cx); while (a1 <= a0) a1 += 2 * Math.PI;
  const nm = G('nm20'); let rN = 112; try { const b = nm.getBBox(); if (b.width > 0) rN = Math.hypot(b.x + b.width / 2 - cx, b.y + b.height / 2 - cy); } catch (e) { }
  rg = { sv, cx, cy, a0, span: a1 - a0, rN }; return rg;
}
function ringTick() {
  const sv = G('dsv'); if (!sv || !rec) return;
  const still = rec.state !== 'ready' && rec.stillSince && Date.now() - rec.stillSince >= 3000;
  const dir = still && db.settings.home && db.settings.work && rec.route.length > 3 ? commuteDir({ route: rec.route }) : null;
  const V = dir ? routeVariants().filter(v => v.dir === dir).sort((x, y) => x.m - y.m).slice(0, 3) : [];
  const km = rec.m / 1000, E = (Date.now() - new Date(rec.start)) / 1000;
  const R = V.map(v => { const t = v.trips.filter(t => t.ser && t.ser.length > 5).sort((a, b) => Math.abs(a.dur / 60 - v.m) - Math.abs(b.dur / 60 - v.m))[0]; const r = t && refTime(t, km); return r ? { v, r, end: v.m * 60 } : null; }).filter(Boolean);
  const on = still && R.length && km > .3;
  if (on && !sv.classList.contains('rm')) ringGeo();
  sv.classList.toggle('rm', !!on); let g = G('rgx');
  if (!on) { if (g) g.remove(); return; }
  const geo = ringGeo(); if (!geo) return; const { cx, cy, a0, span, rN } = geo;
  const best = R[0], prog = E + Math.max(0, best.end - best.r.t), MAX = Math.ceil(Math.max(prog, ...R.map(x => x.end)) / 300) * 300;
  const ang = f => a0 + span * Math.min(1, Math.max(0, f)), P = (r, a) => [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  const arc = (r, f0, f1) => { if (f1 - f0 < .002) return ''; const b0 = ang(f0), b1 = ang(f1), p = P(r, b0), q = P(r, b1); return `M${p[0].toFixed(1)},${p[1].toFixed(1)} A${r},${r} 0 ${b1 - b0 > Math.PI ? 1 : 0} 1 ${q[0].toFixed(1)},${q[1].toFixed(1)}`; };
  const ring = (r, sw, t, st, end, c, track) => (track ? `<path d="${arc(r, 0, 1)}" fill="none" stroke="${track}" stroke-width="${sw}"/>` : '') + (end ? `<path d="${arc(r, t / MAX, end / MAX)}" fill="none" stroke="${c}" stroke-width="${sw}" opacity=".16"/>` : '') + `<path d="${arc(r, 0, st / MAX)}" fill="none" stroke="#ff7a1a" stroke-width="${sw}"/><path d="${arc(r, st / MAX, t / MAX)}" fill="none" stroke="${c}" stroke-width="${sw}"/>`;
  const mmss = x => (x < 0 ? '−' : '') + Math.floor(Math.abs(x) / 60) + ':' + String(Math.round(Math.abs(x) % 60)).padStart(2, '0');
  let o = ring(170, 12, E, rec.stop, prog, '#ffffff', '#1c1c1c') + ring(150, 12, best.r.t, best.r.st, best.end, '#a88e60', '#17140f');
  const IC = ['#98989f', '#6e6e73'];
  R.slice(1).forEach((x, i) => { const r = [86, 79][i]; o += `<path d="${arc(r, 0, 1)}" fill="none" stroke="rgba(255,255,255,.12)" stroke-width="2.4"/>` + ring(r, 2.4, x.r.t, x.r.st, 0, IC[i]); });
  for (let m = 0; m * 60 <= MAX; m += MAX > 1800 ? 10 : 5) { const p = P(rN + 11, ang(m * 60 / MAX)); o += `<text x="${p[0].toFixed(1)}" y="${(p[1] + 4).toFixed(1)}" text-anchor="middle" font-size="13" fill="#cfcfcf" ${FF}>${m}</text>`; }
  const an = ang(E / MAX), pa = P(110, an), pb = P(160, an), pm = P(150, an), nx = -Math.sin(an), ny = Math.cos(an);
  o += `<path d="M${pa[0] + nx * 3.2},${pa[1] + ny * 3.2} L${pm[0] + nx * 1.8},${pm[1] + ny * 1.8} L${pm[0] - nx * 1.8},${pm[1] - ny * 1.8} L${pa[0] - nx * 3.2},${pa[1] - ny * 3.2}Z" fill="#fff"/><path d="M${pm[0] + nx * 1.8},${pm[1] + ny * 1.8} L${pb[0]},${pb[1]} L${pm[0] - nx * 1.8},${pm[1] - ny * 1.8}Z" fill="#ff5a1f"/>`;
  const arr = new Date(Date.now() + Math.max(0, best.end - best.r.t) * 1000);
  o += `<text x="${cx}" y="${cy - 26}" text-anchor="middle" font-size="12" font-weight="600" fill="#ff7a1a" ${FF}>Ampel ${mmss((Date.now() - rec.stillSince) / 1000)}</text>`;
  const d = E - best.r.t; o += `<text x="${cx}" y="${cy + 12}" text-anchor="middle" font-size="36" font-weight="500" fill="#fff" ${FF}>${d >= 0 ? '+' : ''}${mmss(d)}</text>`;
  o += `<text x="${cx}" y="${cy + 29}" text-anchor="middle" font-size="10.5" fill="#a8a8ae" ${FF}>Ankunft ≈ ${fmtTime(arr.toISOString())}</text>`;
  [['#ffffff', 'Heute', E], ...R.map((x, i) => [i ? IC[i - 1] : '#a88e60', routeName(x.v, V.indexOf(x.v)), x.r.t])].forEach(([c, n, t], i) => o += `<text x="${cx - 52}" y="${cy + 68 + i * 13}" font-size="10" font-weight="600" fill="${c}" ${FF}>${esc(n).slice(0, 18)}</text><text x="${cx + 52}" y="${cy + 68 + i * 13}" text-anchor="end" font-size="10" fill="#8e8e93" ${FF}>${mmss(t)}</text>`);
  if (!g) { g = document.createElementNS('http://www.w3.org/2000/svg', 'g'); g.id = 'rgx'; sv.appendChild(g); }
  g.innerHTML = o;
}
function driveSecond(stale) {
  try { ringTick(); } catch (e) { }
  const now = new Date(), sec = rec.state === 'ready' ? 0 : (now - new Date(rec.start)) / 1000;
  const rl = G('dRec'); if (rl) { const st = rec.state === 'ready' ? 'BEREIT' : rec.state === 'pause' ? 'PAUSE' : 'AUFN.'; if (rl.dataset.s !== st) { rl.dataset.s = st; rl.className = 'rec ' + rec.state; rl.innerHTML = '<i></i>' + st; } }
  const et = G('dEta'); if (et) et.textContent = etaText();
  if (rec.state !== 'ready' && now - (rec.lastSample || 0) >= 5000) { rec.lastSample = +now; rec.hist.push({ t: +now, v: Math.round(stale ? 0 : rec.speed) }); if (stale || rec.speed < 3) rec.stop += 5; }
  const avg = rec.m > 0 ? Math.round(rec.m / sec * 3.6) : 0;
  G('dClock').textContent = now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  G('dDate').textContent = WD[now.getDay()] + ' ' + now.getDate() + '. ' + MO[now.getMonth()];
  const w = rec.weather, wi = w ? weatherInfo(w.code) : { wet: false }, ice = w && (w.temp <= 0 || (w.temp <= 3 && wi.wet));
  let chips = `<span class="info">${ic(commuteTime() ? 'work' : 'route', 13)} ${commuteTime() ? 'Pendeln' : 'Freizeit'}</span>`;
  if (wi.wet) chips += `<span class="info">${ic('drop', 13)} Nass</span>`; else if (w) chips += `<span class="info">${ic('cloud', 13)} Trocken</span>`;
  if (ice) chips += `<span class="info">${lamp(1).replace('bald', 'Glätte')}</span>`;
  if (w && w.wind != null) chips += `<span class="info${w.gust >= 45 ? ' gw' : ''}">${ic('wind', 13)} ${w.wind} km/h · Böen ${w.gust}</span>`;
  if (G('dChips').innerHTML !== chips) G('dChips').innerHTML = chips;
  const odo = Math.floor((currentOdo() + liveKm()) / 10) * 10, os = nf(odo, 0);
  G('oA').textContent = os;
  const mk0 = new Date(now.getFullYear(), now.getMonth(), 1), mkm = db.trips.filter(t => new Date(t.start) >= mk0).reduce((a, t) => a + (t.km || 0), 0) + liveKm();
  G('mL').textContent = MO[now.getMonth()]; G('mK').textContent = nf(Math.floor(mkm / 10) * 10, 0);
  G('dAvg').textContent = avg;
  G('dCv').innerHTML = curveSVG(rec.m > 0 ? avg : null);
  const h = rec.heading;
  G('dTiles').innerHTML = `<div><b>${nf(liveKm(), 1)}</b><span>km</span></div><div><b>${Math.floor(sec / 60)}</b><span>min</span></div><div><b>${w ? nf(w.temp, 0) : '–'}</b><span>°C</span></div><div>${h != null ? `<svg width="13" height="13" viewBox="0 0 24 24" style="transform:rotate(${Math.round(h)}deg)" fill="none" stroke="#fff" stroke-width="1.7" stroke-linejoin="round"><path d="M12 3l7 17-7-4-7 4z"/></svg><b>${Math.round(h)}°</b><span>${dirName(h)}</span>` : '<b>–</b>'}</div>`;
  const ts = tankState(liveKm()), col = !ts ? '#2a2a2a' : ts.frac > .5 ? '#3a9466' : ts.frac < .25 ? '#ff7a1a' : '#f2c14e';
  for (let i = 0; i <= 60; i++) { const e = G('fu' + i); if (e) e.setAttribute('stroke', ts && i / 60 <= ts.frac ? col : '#2a2a2a'); }
  const rg = G('rng'); if (rg) { rg.textContent = ts ? '≈ ' + Math.round(ts.range) + ' km' : 'TANK ?'; rg.setAttribute('fill', ts ? col : '#8c8c8c'); rg.setAttribute('opacity', drv.introDone ? 1 : ease((performance.now() - drv.t0) / 1000 - 5.0)); }
  ['Ölwechsel', 'Inspektion'].forEach((nm, i) => { const bt = G('dSvc').children[i], inf = svcInfo(nm); bt.style.display = ''; if (!inf) { bt.className = 'ib'; if (!bt.firstChild) bt.innerHTML = ic(i ? 'wrench' : 'oil', 22); return; } bt.className = 'ib' + (inf.level === 2 ? ' e' : inf.level === 1 ? ' w' : ''); if (!bt.firstChild) bt.innerHTML = ic(i ? 'wrench' : 'oil', 22); if (drv.pop === nm) G('dPop').innerHTML = `<b>${nm}</b><span>${inf.text}</span>`; });
  const wd = false; G('dAqi').style.display = 'none';
  if (wd) { G('dAqi').innerHTML = ic('wind', 13) + ' ' + rec.weather.wind + ' km/h · Böen ' + rec.weather.gust; G('dAqi').className = 'info' + (rec.weather.gust >= 45 ? ' gw' : ''); }
}

/* ---------- Auswertungen ---------- */
function weekStart(off) { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - ((d.getDay() + 6) % 7) - off * 7); return d; }
function weekKm(off) {
  const a = weekStart(off), b = new Date(a); b.setDate(b.getDate() + 7);
  return db.trips.filter(t => { const d = new Date(t.start); return d >= a && d < b; }).reduce((s, t) => s + t.km, 0);
}
function monthSeries() {
  const out = [], n = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(n.getFullYear(), n.getMonth() - i, 1), k = d.getFullYear() * 12 + d.getMonth();
    const ts = db.trips.filter(t => { const x = new Date(t.start); return x.getFullYear() * 12 + x.getMonth() === k; });
    const z = [0, 0, 0]; ts.forEach(t => { if (t.zk) t.zk.forEach((v, j) => z[j] += v); });
    out.push({ l: MO[d.getMonth()], km: ts.reduce((a, t) => a + t.km, 0), z });
  }
  return out;
}
function records() {
  const T = db.trips, r = {};
  const cm = T.filter(t => isCom(t) && t.dur > 60).sort((a, b) => a.dur - b.dur)[0];
  r.fast = cm ? { v: Math.round(cm.dur / 60), d: fmtDate(cm.start) } : null;
  const lg = T.slice().sort((a, b) => b.km - a.km)[0];
  r.long = lg ? { v: nf(lg.km, 0), d: fmtDay(lg.start) } : null;
  const mx = T.slice().sort((a, b) => b.max - a.max)[0];
  r.top = mx && mx.max ? { v: mx.max, d: fmtDate(mx.start) } : null;
  const wk = {}; T.forEach(t => { const d = new Date(t.start); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); const k = +d; wk[k] = (wk[k] || 0) + t.km; });
  const bk = Object.keys(wk).sort((a, b) => wk[b] - wk[a])[0];
  r.week = bk ? { v: nf(wk[bk], 0), d: 'WOCHE ' + fmtDate(+bk) } : null;
  const days = [...new Set(T.map(t => t.start.slice(0, 10)))].sort();
  let best = 0, cur = 0, prev = null, end = '';
  days.forEach(s => { const d = new Date(s + 'T12:00:00'); cur = prev && Math.round((d - prev) / 864e5) === 1 ? cur + 1 : 1; if (cur > best) { best = cur; end = s; } prev = d; });
  r.streak = best ? { v: best, d: fmtDate(end) } : null;
  const c = consumption().sort((a, b) => a.l100 - b.l100)[0];
  r.cons = c ? { v: nf(c.l100, 1), d: fmtDate(c.date) } : null;
  return r;
}
const zb = z => { const s = (z[0] + z[1] + z[2]) || 1; return `<div class="zb">${z.map((x, i) => `<i style="flex:${Math.max(x / s, .001)};background:${ZCOL[i]}"></i>`).join('')}</div>`; };
function spark(a, w = 120, h = 30) {
  if (!a || a.length < 2) return '';
  const m = Math.max(...a, 1);
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><path d="${bez(a.map((v, i) => [i * w / (a.length - 1), h - 2 - (h - 4) * v / m]))}" fill="none" stroke="#fff" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"/></svg>`;
}
function monthChart(ms) {
  const W = 326, H = 130, v = ms.map(m => Math.round(m.km)), lo = Math.min(...v, 0), hi = Math.max(...v, 1);
  const X = i => 18 + (W - 40) * i / (v.length - 1), Y = x => 92 - 66 * (x - lo) / (hi - lo || 1);
  const pts = v.map((x, i) => [X(i), Y(x)]);
  let s = `<svg width="100%" viewBox="0 0 ${W} ${H}"><defs><linearGradient id="ma" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f2c14e" stop-opacity=".45"/><stop offset="1" stop-color="#f2c14e" stop-opacity="0"/></linearGradient></defs>`;
  [22, 52, 82].forEach(y => s += `<line x1="6" y1="${y}" x2="${W - 6}" y2="${y}" stroke="rgba(255,255,255,.12)"/>`);
  s += `<path d="${bez(pts)} L${X(v.length - 1)} 100 L${X(0)} 100 Z" fill="url(#ma)"/><path d="${bez(pts)}" fill="none" stroke="#f2c14e" stroke-width="2.4"/>`;
  v.forEach((x, i) => { const last = i === v.length - 1; s += `<circle cx="${X(i)}" cy="${Y(x).toFixed(1)}" r="${last ? 3.4 : 2.2}" fill="${last ? '#0e1110' : '#f2c14e'}" stroke="#f2c14e" stroke-width="${last ? 2.4 : 0}"/><text x="${X(i)}" y="124" fill="${last ? '#fff' : '#8c8c8c'}" font-size="10" text-anchor="middle" letter-spacing="1">${ms[i].l}</text>`; });
  return s + `<text x="${X(v.length - 1)}" y="${(Y(v[v.length - 1]) - 12).toFixed(1)}" fill="#fff" font-size="13" text-anchor="middle" paint-order="stroke" stroke="rgba(8,18,14,.55)" stroke-width="4">${v[v.length - 1]}</text></svg>`;
}
function typeChart(ms) {
  const W = 326, H = 120, mx = Math.max(1, ...ms.flatMap(m => m.z));
  let s = `<svg width="100%" viewBox="0 0 ${W} ${H}">`;
  [14, 44, 74].forEach(y => s += `<line x1="6" y1="${y}" x2="${W - 6}" y2="${y}" stroke="rgba(255,255,255,.12)"/>`);
  const ends = [];
  [0, 1, 2].forEach(k => {
    const pts = ms.map((m, i) => [14 + (W - 56) * i / (ms.length - 1), 92 - 82 * m.z[k] / mx]), e = pts[pts.length - 1];
    s += `<path d="${bez(pts)}" fill="none" stroke="${ZCOL[k]}" stroke-width="2.4"/><circle cx="${e[0]}" cy="${e[1].toFixed(1)}" r="3.4" fill="rgba(8,18,14,.9)" stroke="${ZCOL[k]}" stroke-width="2.4"/>`;
    ends.push({ y: e[1], k, x: e[0] });
  });
  ends.sort((a, b) => a.y - b.y); for (let i = 1; i < ends.length; i++) if (ends[i].y - ends[i - 1].y < 14) ends[i].y = ends[i - 1].y + 14;
  ends.forEach(e => s += `<text x="${e.x + 10}" y="${(e.y + 4).toFixed(1)}" fill="${ZCOL[e.k]}" font-size="11" paint-order="stroke" stroke="rgba(8,18,14,.55)" stroke-width="4" stroke-linejoin="round">${Math.round(ms[ms.length - 1].z[e.k])}</text>`);
  ms.forEach((m, i) => s += `<text x="${14 + (W - 56) * i / (ms.length - 1)}" y="114" fill="#8c8c8c" font-size="10" text-anchor="middle" letter-spacing="1">${m.l}</text>`);
  return s + '</svg>';
}

/* ---------- Views ---------- */
let tripSel = null, dueSel = null, tab = 'fahrt', sub = null, fFilter = 'all', lFilter = 'all';
/* ---------- Grafiken im Health-Stil ---------- */
const FF = 'font-family="-apple-system,BlinkMacSystemFont,Helvetica Neue,sans-serif"';
const kh = (i, t, m = '') => `<div class="kh">${i ? ic(i, 15) : ''}<span>${t}</span>${m ? `<em>${m}</em>` : ''}</div>`;
const lamp = lv => `<span class="lamp ${['off', 'w', 'e'][lv]}">${['ok', 'bald', 'fällig'][lv]}</span>`;
function weekBars(dd, td, avg) {
  const W = 326, H = 120, b = 22, gap = (W - 7 * b) / 7, m = Math.max(avg || 0, ...dd, 1), y = v => 96 - 84 * v / m;
  let s = `<svg viewBox="0 0 ${W} ${H}" width="100%" class="ch">`;
  dd.forEach((v, i) => { const x = gap / 2 + i * (b + gap), fut = i > td; s += `<rect x="${x}" y="${fut ? 92 : Math.min(92, y(v))}" width="${b}" height="${fut ? 4 : Math.max(4, 96 - y(v))}" rx="5" fill="${fut ? '#1d1d1d' : i === td ? '#efbb3c' : '#d8d8d8'}"/>`; s += `<text x="${x + b / 2}" y="114" text-anchor="middle" font-size="10" fill="${i === td ? '#efbb3c' : '#8e8e93'}" ${FF}>${['M', 'D', 'M', 'D', 'F', 'S', 'S'][i]}</text>`; });
  if (avg) s += `<line x1="0" x2="${W}" y1="${y(avg).toFixed(1)}" y2="${y(avg).toFixed(1)}" stroke="#8e8e93" stroke-dasharray="4 4"/><text x="${W}" y="${(y(avg) - 4).toFixed(1)}" text-anchor="end" font-size="9" fill="#8e8e93" ${FF}>Ø ${nf(avg, 0)}</text>`;
  return s + '</svg>';
}
function weekLine(dd, td, avg) {
  const W = 326, H = 112, x0 = 10, x1 = 316, m = Math.max(avg || 0, ...dd, 1), X = i => x0 + i * (x1 - x0) / 6, Y = v => 92 - 78 * v / m;
  const pts = dd.slice(0, td + 1).map((v, i) => [X(i), Y(v)]);
  let s = `<svg viewBox="0 0 ${W} ${H}" width="100%" class="ch"><line x1="${x0}" x2="${x1}" y1="92" y2="92" stroke="rgba(255,255,255,.12)"/>`;
  if (avg) s += `<line x1="${x0}" x2="${x1}" y1="${Y(avg).toFixed(1)}" y2="${Y(avg).toFixed(1)}" stroke="rgba(255,255,255,.35)" stroke-width="1" stroke-dasharray="3 4"/><text x="${x1}" y="${(Y(avg) - 7).toFixed(1)}" text-anchor="end" font-size="9" fill="#9aa8a5" paint-order="stroke" stroke="#16211f" stroke-width="4" ${FF}>Ø ${nf(avg, 0)}</text>`;
  if (pts.length > 1) s += `<path d="${bez(pts)}" fill="none" stroke="#efbb3c" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`;
  pts.forEach((p, i) => s += i === td ? `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="3.2" fill="rgba(8,18,14,.9)" stroke="#efbb3c" stroke-width="2.4"/>` : `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="2" fill="#efbb3c"/>`);
  for (let i = td + 1; i < 7; i++) s += `<circle cx="${X(i)}" cy="92" r="1.6" fill="rgba(255,255,255,.25)"/>`;
  ['M', 'D', 'M', 'D', 'F', 'S', 'S'].forEach((d, i) => s += `<text x="${X(i)}" y="108" text-anchor="middle" font-size="10" fill="${i === td ? '#efbb3c' : '#9aa8a5'}" ${FF}>${d}</text>`);
  return s + '</svg>';
}
/* Bereich wie Health: dünne graue Kapseln (min–max), Durchschnitt als farbige Linie mit Wert */
function rangeChart(g, avg, unit, title) {
  const v = g.filter(x => x.hi > 0); if (!v.length) return '<p class="mu">Noch zu wenige Daten.</p>';
  const lo = Math.min(...v.map(x => x.lo)), hi = Math.max(...v.map(x => x.hi));
  const top = Math.ceil(hi * 1.15 / 10) * 10 || 10, W = 326, H = 150, x0 = 4, x1 = 290, n = g.length, bw = Math.min(9, (x1 - x0) / n - 5), Y = y => 128 - y / top * 118;
  let s = `<div class="rg"><span>${title || 'Bereich'}</span><b>${nf(lo, 0)}–${nf(hi, 0)}<small> ${unit}</small></b></div><svg viewBox="0 0 ${W} ${H}" width="100%" class="ch">`;
  [0, top / 2, top].forEach(t => s += `<line x1="${x0}" x2="${x1 + 8}" y1="${Y(t)}" y2="${Y(t)}" stroke="rgba(255,255,255,.12)"/><text x="${W}" y="${Y(t) + 4}" text-anchor="end" font-size="10" fill="#8e8e93" ${FF}>${nf(t, 0)}</text>`);
  g.forEach((x, i) => { const cx = x0 + (i + .5) * (x1 - x0) / n; if (x.l) s += `<line x1="${cx - (x1 - x0) / n / 2}" x2="${cx - (x1 - x0) / n / 2}" y1="8" y2="${H - 4}" stroke="rgba(255,255,255,.12)" stroke-dasharray="2 3"/><text x="${cx - (x1 - x0) / n / 2 + 3}" y="${H - 2}" font-size="10" fill="#8e8e93" ${FF}>${x.l}</text>`;
    if (x.hi > 0) s += `<rect x="${cx - bw / 2}" y="${Y(x.hi)}" width="${bw}" height="${Math.max(bw, Y(x.lo) - Y(x.hi))}" rx="${bw / 2}" fill="#3a3a3c"/>`; });
  if (avg) s += `<line x1="${x0}" x2="${x1}" y1="${Y(avg)}" y2="${Y(avg)}" stroke="#efbb3c" stroke-width="2.4" stroke-linecap="round"/><text x="${x1}" y="${Y(avg) - 9}" text-anchor="end" font-size="13" font-weight="600" fill="#efbb3c" paint-order="stroke" stroke="rgba(8,18,14,.55)" stroke-width="4" stroke-linejoin="round" ${FF}>${nf(avg, 0)} ${unit}</text>`;
  return s + '</svg>';
}
const wkGroups = (ts, f, nW = 8) => { const out = []; for (let i = nW - 1; i >= 0; i--) { const a = weekStart(i), b = new Date(+a + 7 * 864e5), xs = ts.filter(t => { const d = new Date(t.start); return d >= a && d < b; }).map(f).filter(x => x != null); out.push({ lo: xs.length ? Math.min(...xs) : 0, hi: xs.length ? Math.max(...xs) : 0, l: a.getDate() <= 7 ? MO[a.getMonth()].charAt(0) + MO[a.getMonth()].slice(1, 3).toLowerCase() : '' }); } return out; };
function ring(frac, col, sz = 64) {
  const r = sz / 2 - 6, c = 2 * Math.PI * r;
  return `<svg width="${sz}" height="${sz}" viewBox="0 0 ${sz} ${sz}"><circle cx="${sz / 2}" cy="${sz / 2}" r="${r}" fill="none" stroke="rgba(255,255,255,.1)" stroke-width="2.4"/><circle cx="${sz / 2}" cy="${sz / 2}" r="${r}" fill="none" stroke="${col}" stroke-width="2.4" stroke-linecap="round" stroke-dasharray="${(c * Math.max(.02, frac)).toFixed(1)} ${c.toFixed(1)}" transform="rotate(-90 ${sz / 2} ${sz / 2})"/><circle cx="${(sz / 2 + r * Math.sin(2 * Math.PI * Math.max(.02, frac))).toFixed(1)}" cy="${(sz / 2 - r * Math.cos(2 * Math.PI * Math.max(.02, frac))).toFixed(1)}" r="3.4" fill="rgba(8,18,14,.9)" stroke="${col}" stroke-width="2.4"/></svg>`;
}
function cmpBars(a, b, la, lb) {
  const m = Math.max(a, b, 1);
  return `<div class="cmp"><div><i style="width:${Math.max(4, a / m * 100)}%;background:#efbb3c"></i><span>${la}</span></div><div><i style="width:${Math.max(4, b / m * 100)}%;background:#5a5a5e"></i><span>${lb}</span></div></div>`;
}
function scatter(pts, opt = {}) {
  const W = 326, H = 130, x0 = 6, x1 = 320; if (pts.length < 2) return '<p class="mu">Noch zu wenige Daten.</p>';
  const xs = pts.map(p => p.x), ys = pts.map(p => p.y), xa = Math.min(...xs), xb = Math.max(...xs) || 1, ya = Math.min(...ys), yb = Math.max(...ys);
  const lo = Math.floor(ya - 2), hi = Math.ceil(yb + 2), X = x => x0 + (x - xa) / ((xb - xa) || 1) * (x1 - x0), Y = y => 110 - (y - lo) / ((hi - lo) || 1) * 100;
  let s = `<svg viewBox="0 0 ${W} ${H}" width="100%" class="ch">`;
  [lo, hi].forEach(v => s += `<line x1="${x0}" x2="${x1}" y1="${Y(v)}" y2="${Y(v)}" stroke="rgba(255,255,255,.12)"/><text x="${x1}" y="${Y(v) - 3}" text-anchor="end" font-size="9" fill="#8e8e93" ${FF}>${v}${opt.u || ''}</text>`);
  if (opt.trend) { const n = pts.length, mx = xs.reduce((a, b) => a + b) / n, my = ys.reduce((a, b) => a + b) / n, k = pts.reduce((a, p) => a + (p.x - mx) * (p.y - my), 0) / (pts.reduce((a, p) => a + (p.x - mx) ** 2, 0) || 1); s += `<line x1="${X(xa)}" y1="${Y(my + k * (xa - mx))}" x2="${X(xb)}" y2="${Y(my + k * (xb - mx))}" stroke="#efbb3c" stroke-width="1.6" stroke-dasharray="5 4"/>`; }
  pts.forEach(p => s += `<circle cx="${X(p.x).toFixed(1)}" cy="${Y(p.y).toFixed(1)}" r="3.4" fill="${p.c || '#fff'}"/>`);
  return s + '</svg>';
}
function rangeBars(days) {
  const W = 326, H = 130, n = days.length, bw = Math.min(14, (W - 10) / n - 6), m = Math.max(60, ...days.map(d => d.hi)), Y = v => 110 - v / m * 100;
  let s = `<svg viewBox="0 0 ${W} ${H}" width="100%" class="ch"><defs>${days.map((d, i) => `<linearGradient id="rg${i}" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#6a6a6e"/><stop offset="1" stop-color="${zcol(d.hi)}"/></linearGradient>`).join('')}</defs>`;
  [0, 50, 100].filter(v => v <= m).forEach(v => s += `<line x1="0" x2="${W}" y1="${Y(v)}" y2="${Y(v)}" stroke="rgba(255,255,255,.12)"/><text x="${W}" y="${Y(v) - 3}" text-anchor="end" font-size="9" fill="#8e8e93" ${FF}>${v}</text>`);
  days.forEach((d, i) => { const x = 4 + i * (W - 30) / n; if (d.hi) s += `<rect x="${x}" y="${Y(d.hi)}" width="${bw}" height="${Math.max(bw, Y(d.lo) - Y(d.hi))}" rx="${bw / 2}" fill="url(#rg${i})"/>`; s += `<text x="${x + bw / 2}" y="126" text-anchor="middle" font-size="9" fill="#8e8e93" ${FF}>${d.l}</text>`; });
  return s + '</svg>';
}
function zoneCols(ts) {
  const W = 326, H = 120, n = ts.length, bw = Math.min(18, (W - 10) / n - 8), m = Math.max(1, ...ts.map(t => (t.zk || [0, 0, 0]).reduce((a, b) => a + b, 0)));
  let s = `<svg viewBox="0 0 ${W} ${H}" width="100%" class="ch">`;
  ts.forEach((t, i) => { let y = 104; const x = 6 + i * (W - 12) / n; (t.zk || [t.km, 0, 0]).forEach((v, k) => { const h = v / m * 96; if (h > .5) { y -= h; s += `<rect x="${x}" y="${y.toFixed(1)}" width="${bw}" height="${h.toFixed(1)}" fill="${ZCOL[k]}"/>`; } }); s += `<text x="${x + bw / 2}" y="117" text-anchor="middle" font-size="9" fill="#8e8e93" ${FF}>${new Date(t.start).getDate()}.</text>`; });
  return s + '</svg>';
}
function lineChart(vals, labels, u) {
  const W = 326, H = 120, x0 = 8, x1 = 282; if (vals.length < 2) return '<p class="mu">Ab zwei vollen Tankungen sichtbar.</p>';
  const lo = Math.min(...vals) * .9, hi = Math.max(...vals) * 1.1, X = i => x0 + i * (x1 - x0) / (vals.length - 1), Y = v => 100 - (v - lo) / ((hi - lo) || 1) * 88;
  const pts = vals.map((v, i) => [X(i), Y(v)]);
  let s = `<svg viewBox="0 0 ${W} ${H}" width="100%" class="ch"><path d="${bez(pts)}" fill="none" stroke="#efbb3c" stroke-width="2.4" stroke-linecap="round"/>`;
  pts.forEach((p, i) => s += i === pts.length - 1 ? `<circle cx="${p[0]}" cy="${p[1]}" r="3.2" fill="rgba(8,18,14,.9)" stroke="#efbb3c" stroke-width="2.4"/>` : `<circle cx="${p[0]}" cy="${p[1]}" r="2.2" fill="#efbb3c"/>`);
  s += `<text x="${x1 + 10}" y="${Y(vals[vals.length - 1]) + 4}" font-size="11" fill="#efbb3c" paint-order="stroke" stroke="rgba(8,18,14,.55)" stroke-width="4" stroke-linejoin="round" ${FF}>${nf(vals[vals.length - 1], 1)}${u || ''}</text>`;
  if (labels) labels.forEach((l, i) => { if (i === 0 || i === labels.length - 1) s += `<text x="${X(i)}" y="116" text-anchor="${i ? 'end' : 'start'}" font-size="9" fill="#8e8e93" ${FF}>${l}</text>`; });
  return s + '</svg>';
}
function monthBars(vals, labels, u) {
  const W = 326, H = 120, n = vals.length, bw = 22, m = Math.max(1, ...vals);
  let s = `<svg viewBox="0 0 ${W} ${H}" width="100%" class="ch">`;
  vals.forEach((v, i) => { const x = 8 + i * (W - 16 - bw) / (n - 1), h = Math.max(3, v / m * 84); s += `<rect x="${x}" y="${100 - h}" width="${bw}" height="${h}" rx="5" fill="${i === n - 1 ? '#efbb3c' : '#d8d8d8'}"/><text x="${x + bw / 2}" y="116" text-anchor="middle" font-size="9" fill="#8e8e93" ${FF}>${labels[i]}</text>`; if (v) s += `<text x="${x + bw / 2}" y="${96 - h}" text-anchor="middle" font-size="9" fill="#bbb" ${FF}>${nf(v, 0)}${u || ''}</text>`; });
  return s + '</svg>';
}
function calMonth() {
  const n = new Date(), y = n.getFullYear(), mo = n.getMonth(), first = new Date(y, mo, 1), off = (first.getDay() + 6) % 7, days = new Date(y, mo + 1, 0).getDate();
  const set = new Set(db.trips.map(t => t.start.slice(0, 10)));
  let s = '<div class="cal">' + ['M', 'D', 'M', 'D', 'F', 'S', 'S'].map(d => `<b>${d}</b>`).join('');
  for (let i = 0; i < off; i++) s += '<i></i>';
  for (let d = 1; d <= days; d++) { const k = y + '-' + String(mo + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0'); s += `<i class="${set.has(k) ? 'on' : ''} ${d === n.getDate() ? 'td' : ''} ${d > n.getDate() ? 'fu' : ''}">${d}</i>`; }
  return s + '</div>';
}
const tcol = t => { const k = Math.max(0, Math.min(1, (t + 2) / 24)); const a = [127, 154, 168], b = [245, 245, 240]; return `rgb(${a.map((x, i) => Math.round(x + (b[i] - x) * k)).join(',')})`; };
function trendTile(i, l, v, d, good) {
  const up = d > 0, col = d === 0 ? '#8e8e93' : (good ? '#d8d8d8' : '#ff8a4d');
  return `<div class="t trd">${kh(i, l)}<b>${v}</b><span style="color:${col}">${d === 0 ? '→ gleich' : (up ? '↑ ' : '↓ ') + Math.abs(d)}</span></div>`;
}
const HDR = '<div class="hdr"><img src="vuelta-logo.png" alt="Vuelta"></div><div class="vst"><u></u><i></i><i></i></div>';
function miniCurve(a, w, h) {
  if (a.length < 2) a = [0, ...a];
  const m = Math.max(1, ...a), pts = a.map((x, i) => [4 + i * (w - 8) / (a.length - 1), h - 4 - (h - 10) * x / m]);
  let s = `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><path d="${bez(pts)}" fill="none" stroke="#efbb3c" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`;
  pts.forEach((p, i) => s += i === pts.length - 1 ? `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="3.2" fill="rgba(8,18,14,.9)" stroke="#efbb3c" stroke-width="2.4"/>` : `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="2" fill="#efbb3c"/>`);
  return s + '</svg>';
}
const daysAgo = s => s ? (Date.now() - new Date(s)) / 864e5 : 1e9;
const icn = n => /öl/i.test(n) ? 'oil' : /insp/i.test(n) ? 'wrench' : /hu|tüv/i.test(n) ? 'note' : /reif/i.test(n) ? 'tire' : /variator|riemen/i.test(n) ? 'bolt' : 'wrench';
const remCard = (r, s2) => `<div class="card rem">${kh(icn(r.name), esc(r.name), lamp(s2.level))}<div class="rt">${esc(s2.text)}</div>${svcForecast(r)}<div class="r" style="margin-top:12px;gap:8px"><button class="sm" data-a="editrem" data-id="${r.id}">Bearbeiten</button><button class="ghost lnk" data-a="donerem" data-id="${r.id}">Erledigt</button></div></div>`;
/* Wichtige Hinweise: eigene Kachel ganz oben, bleibt bis zum Wegtippen (max. 12 h) */
function notice(t, d) { db.settings.notice = { t, d, at: new Date().toISOString() }; save(); hap(2); }
/* Eigene Fahrzeit: aus deinen Fahrten (Tempo inkl. Ampeln), sonst eigener Faktor */
function mySpeed(hr) {
  const T = db.trips.filter(t => t.dur > 180 && t.km > 1 && Date.now() - new Date(t.start) < 120 * 864e5), near = hr == null ? T : T.filter(t => Math.abs(new Date(t.start).getHours() - hr) <= 1);
  const use = near.length >= 5 ? near : T; if (use.length < 5) return { v: 25 / (db.settings.etaF || 1), own: false };
  return { v: use.reduce((a, t) => a + t.km, 0) / (use.reduce((a, t) => a + t.dur, 0) / 3600), own: true, n: use.length };
}
const myMin = (km, hr) => Math.max(1, Math.round(km / mySpeed(hr).v * 60));
function etaLine() {
  const c = db.settings.pendelKm; if (!c) return '';
  const h = new Date().getHours(), dir = h < 12 ? 'zur Arbeit' : 'nach Hause', ms = mySpeed(h);
  const cm = db.trips.filter(t => isCom(t) && t.dur > 120 && Math.abs(new Date(t.start).getHours() - h) <= 1 && Date.now() - new Date(t.start) < 120 * 864e5).map(t => t.dur / 60).sort((a, b) => a - b);
  const m = cm.length >= 4 ? Math.round(cm[Math.floor(cm.length / 2)]) : myMin(c * 1.15, h), lo = cm.length >= 4 ? Math.round(cm[Math.floor(cm.length * .2)]) : null, hi = cm.length >= 4 ? Math.round(cm[Math.floor(cm.length * .8)]) : null;
  return `<div class="eta">${ic('clock', 14)} Jetzt ${dir}: <b>${m} min</b>${lo != null && hi > lo ? ` <span>(${lo}–${hi})</span>` : ''}<small>${cm.length >= 4 ? 'aus deinen ' + cm.length + ' Fahrten um diese Uhrzeit' : ms.own ? 'aus deinem Ø von ' + Math.round(ms.v) + ' km/h' : 'mit deinem Faktor ' + nf(db.settings.etaF || 1, 2)}</small></div>`;
}
/* Pendel-Wetter: Hin- und Rückweg */
function commuteCard() {
  if (!fc || !fc.commute || !fc.commute.go || !fc.commute.back) return '';
  const c = fc.commute, d = new Date().getDay(); if (d === 0 || d === 6) return '';
  const col = (lab, x, tmr) => { const wet = x.p >= 0.2, ice = x.T <= 1 || (x.T <= 3 && x.p >= 0.1); const v = 45 + (fc.wind || 0) * .5, wc = x.T <= 12 ? 13.12 + .6215 * x.T - 11.37 * v ** .16 + .3965 * x.T * v ** .16 : x.T; return `<div class="pw ${wet || ice ? 'bad' : ''}"><span class="l">${lab}${tmr ? ' · morgen' : ''} · ${x.hr} Uhr</span><b>${ic(wet ? 'rain' : ice ? 'flake' : 'cloud', 18)} ${nf(x.T, 0)}°</b><span class="fz">gefühlt ${nf(wc, 0)}° bei 45 km/h</span><span class="s">${ice ? 'Glätte möglich' : wet ? 'Regen ' + nf(x.p, 1) + ' mm' : 'Trocken'}</span></div>`; };
  const bad = [c.go, c.back].some(x => x.p >= 0.2 || x.T <= 1);
  return `<div class="card pwc">${kh('work', 'Pendeln', bad ? lamp(1).replace('bald', 'Achtung') : '')}${etaLine()}<div class="pwr">${col('Hinweg', c.go, c.goTmr)}${col('Rückweg', c.back, c.backTmr)}</div></div>`;
}
/* Tanken auf dem Arbeitsweg: günstigste Tankstelle nahe der Linie Zuhause–Arbeit */
let routeSt = null;
const segDist = (p, a, b) => { const k = Math.cos(a.lat * Math.PI / 180), ax = a.lon * k, ay = a.lat, bx = b.lon * k, by = b.lat, px = p.lon * k, py = p.lat, dx = bx - ax, dy = by - ay, t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy || 1))); return Math.hypot(px - ax - t * dx, py - ay - t * dy) * 111.2; };
async function fetchRouteStations() {
  const k = db.settings.tkKey, a = db.settings.home, b = db.settings.work; if (!k || !a || !b) return;
  if (routeSt && Date.now() - routeSt.at < 30 * 60e3) return;
  if (fetchRouteStations.tried && Date.now() - fetchRouteStations.tried < 5 * 60e3) return; fetchRouteStations.tried = Date.now();
  if (fetchRouteStations.last && Date.now() - fetchRouteStations.last < 5 * 60e3) return; fetchRouteStations.last = Date.now();
  const m = { lat: (a.lat + b.lat) / 2, lon: (a.lon + b.lon) / 2 }, L0 = hav(a, b) / 1000, rad = Math.min(25, Math.ceil(L0 / 2 + 1));
  try { const r = await fetch('https://creativecommons.tankerkoenig.de/json/list.php?lat=' + m.lat + '&lng=' + m.lon + '&rad=' + rad + '&sort=dist&type=e5&apikey=' + encodeURIComponent(k)); const j = await r.json(); if (!j.ok) return;
    const L = (j.stations || []).filter(s => s.isOpen && s.price).map(s => ({ id: s.id, n: s.brand || s.name, st: s.street || '', price: s.price, lat: s.lat, lon: s.lng, off: segDist({ lat: s.lat, lon: s.lng }, a, b) })).filter(s => s.off <= 0.8);
    logPrices(L); routeSt = { at: Date.now(), list: L.sort((x, y) => x.price - y.price) }; if (tab === 'fahrt' && !sub && !rec) render(); } catch (e) { }
}
function routeTankCard(ts) {
  if (!ts || ts.frac >= 0.3 || !db.settings.home || !db.settings.work) return '';
  fetchRouteStations(); if (!routeSt || !routeSt.list.length) return '';
  const x = routeSt.list[0], det = myMin(x.off * 2, new Date().getHours()), h = new Date().getHours(), i = 'rs';
  const tip = h < 12 ? 'vor 12 Uhr günstig' : 'morgen früh günstiger';
  return `<button class="card btn rtk" data-a="rtroute">${kh('fuel', 'Tanken auf dem Weg', Math.round(ts.frac * 100) + ' %')}<div class="r"><div class="tn"><b>${esc(x.n)}</b><span>${esc(x.st)} · +${det} min Umweg</span></div><b class="big tpx" style="color:var(--rg)">${(v => { const t = v.toFixed(3); return t.slice(0, -1).replace('.', ',') + '<sup>' + t.slice(-1) + '</sup>'; })(x.price)}<small> €/l</small></b></div><div class="info">${tip}</div></button>`;
}
/* Service-Prognose aus dem Kilometerschnitt der letzten 8 Wochen */
function svcForecast(r) {
  if (!r.everyKm) return '';
  const T = db.trips.filter(t => Date.now() - new Date(t.start) < 56 * 864e5), kmW = T.reduce((a, t) => a + t.km, 0) / 8; if (kmW < 5) return '';
  const left = r.lastOdo + r.everyKm - currentOdo(); if (left <= 0) return '';
  let d = new Date(Date.now() + left / kmW * 7 * 864e5);
  if (r.everyMonths && r.lastDate) { const d2 = new Date(r.lastDate); d2.setMonth(d2.getMonth() + r.everyMonths); if (d2 < d) d = d2; }
  const M = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'], q = d.getDate() <= 10 ? 'Anfang' : d.getDate() <= 20 ? 'Mitte' : 'Ende';
  return `<div class="svf">${ic('cal', 13)} Voraussichtlich ${q} ${M[d.getMonth()]}${d.getFullYear() !== new Date().getFullYear() ? ' ' + d.getFullYear() : ''} · bei ${Math.round(kmW)} km pro Woche</div>`;
}
/* Pendelrouten vergleichen: Fahrten nach Richtung und Weg gruppieren */
/* Routenerkennung: gleiche Route, wenn ≥ 85 % der Punkte in einem 120-m-Korridor um die andere liegen */
const LL = q => ({ lat: q[0], lon: q[1] });
function distToRoute(p, r) { let m = 1e9; for (let i = 1; i < r.length; i++) { const d = segDist(p, LL(r[i - 1]), LL(r[i])); if (d < m) m = d; } return m; }
function routeShare(r1, r2, km) { let n = 0; const st = Math.max(1, Math.floor(r1.length / 60)); let c = 0; for (let i = 0; i < r1.length; i += st) { c++; if (distToRoute(LL(r1[i]), r2) <= km) n++; } return c ? n / c : 0; }
const sameRoute = (r1, r2) => routeShare(r1, r2, .12) >= .85 && routeShare(r2, r1, .12) >= .85;
function commuteDir(t) { const a = db.settings.home, b = db.settings.work; if (!a || !b || !t.route || !t.route.length) return null; const p0 = LL(t.route[0]); return hav(p0, a) < hav(p0, b) ? 'go' : 'back'; }
let rvCache = null;
function routeVariants() {
  const a = db.settings.home, b = db.settings.work; if (!a || !b) return [];
  const T = db.trips.filter(t => isCom(t) && t.route && t.route.length > 8 && t.dur > 120 && Date.now() - new Date(t.start) < 120 * 864e5);
  const sig = T.length + '|' + (T[0] ? T[0].id : '') + '|' + a.lat + b.lat; if (rvCache && rvCache.sig === sig) return rvCache.v;
  const G = [];
  T.slice().sort((x, y) => new Date(y.start) - new Date(x.start)).forEach(t => {
    const dir = commuteDir(t); let g = G.find(g => g.dir === dir && sameRoute(t.route, g.route));
    if (!g) { g = { dir, trips: [], route: t.route }; G.push(g); } g.trips.push(t);
  });
  const V = G.filter(g => g.trips.length >= 2).map(g => { const d = g.trips.map(t => t.dur / 60), m = d.reduce((x, y) => x + y, 0) / d.length, sd = Math.sqrt(d.reduce((x, y) => x + (y - m) ** 2, 0) / d.length), st = g.trips.reduce((x, t) => x + (t.stop || 0), 0) / g.trips.length / 60; return { ...g, n: g.trips.length, m, sd, st }; });
  /* Name: Straße am Punkt, der am weitesten von den anderen Routen derselben Richtung entfernt ist */
  V.forEach(v => { const oth = V.filter(o => o !== v && o.dir === v.dir); let bi = Math.floor(v.route.length / 2), bd = -1;
    if (oth.length) v.route.forEach((q, i) => { if (i < v.route.length * .1 || i > v.route.length * .9) return; const d = Math.min(...oth.map(o => distToRoute(LL(q), o.route))); if (d > bd) { bd = d; bi = i; } });
    const p = LL(v.route[bi]); v.key = p.lat.toFixed(3) + ',' + p.lon.toFixed(3); v.pt = p; });
  rvCache = { sig, v: V }; return V;
}
function routeName(v, i) { const nm = (db.settings.routeNames || {})[v.key] || (db.settings.spotNames || {})[v.key]; if (!nm) streetName(v.pt, v.key); return nm || 'Weg ' + String.fromCharCode(65 + i); }
function lightsYearCard() {
  const y = new Date().getFullYear(), T = db.trips.filter(t => new Date(t.start).getFullYear() === y), s = T.reduce((a, t) => a + (t.stop || 0), 0);
  if (s < 600) return '';
  const hh = s / 3600, cm = T.filter(t => isCom(t)), sc = cm.reduce((a, t) => a + (t.stop || 0), 0), dur = T.reduce((a, t) => a + t.dur, 0);
  const wk = []; for (let i = 7; i >= 0; i--) { const a0 = Date.now() - (i + 1) * 7 * 864e5, a1 = a0 + 7 * 864e5, x = db.trips.filter(t => { const q = +new Date(t.start); return isCom(t) && q >= a0 && q < a1; }); wk.push(x.length ? x.reduce((a, t) => a + (t.stop || 0), 0) / x.length / 60 : 0); }
  return `<div class="g2"><div class="t hero lgt">${kh('light', 'An Ampeln', String(y))}<div class="hv"><b>${nf(hh, hh < 10 ? 1 : 0)}</b><small>Stunden</small></div><div class="hx">${miniCurve(wk, 150, 44)}<div class="hxl"><span>8 WO.</span><span>JETZT</span></div></div><div class="info">${Math.round(s / dur * 100)} % deiner Fahrzeit · Pendeln Ø ${Math.round(sc / Math.max(1, cm.length) / 60)} min pro Fahrt</div></div></div>`;
}
/* Pendlerpauschale: Arbeitstage mit Pendelfahrt × einfache Entfernung × 0,38 € (seit 2026 ab dem ersten Kilometer) */
function commuteDays(y) { const S = new Set(); db.trips.forEach(t => { const d = new Date(t.start); if (isCom(t) && d.getFullYear() === y) S.add(t.start.slice(0, 10)); }); return [...S].sort(); }
function pauschaleCard() {
  const y = new Date().getFullYear(), D = commuteDays(y), km = Math.round(db.settings.pendelKm || 0); if (!D.length || !km) return '';
  const eur = D.length * km * 0.38, m = new Date().getMonth() + 1, proj = Math.round(D.length / Math.max(1, (Date.now() - new Date(y, 0, 1)) / 864e5) * 365 * km * .38);
  return `<div class="card pps">${kh('note', 'Pendlerpauschale ' + y, '0,38 € / km')}<div class="hv"><b>${nf(eur, 0)}</b><small>€</small></div><div class="ppr"><span><b>${D.length}</b> Arbeitstage</span><span><b>${km}</b> km einfach</span><span>≈ <b>${nf(proj, 0)} €</b> im Jahr</span></div><div class="r" style="margin-top:12px;gap:8px"><button class="sm" data-a="ppexport">${ic('note', 13)} Liste für die Steuer</button></div><p class="mu" style="margin:10px 0 0">Gezählt wird jeder Tag mit mindestens einer Pendelfahrt. Keine Steuerberatung.</p></div>`;
}
/* Analyse wie Schlafanalyse: vier Tempo-Ebenen statt Messwerte */
const LVL = [{ n: 'Flott', c: '#efbb3c' }, { n: 'Zügig', c: '#a88e60' }, { n: 'Zäh', c: '#98989f' }, { n: 'Stand', c: '#ff7a1a' }];
const lvOf = v => v < 1 ? 3 : v < 20 ? 2 : v < 35 ? 1 : 0;
function tripSegs(t) {
  const S = (t.ser || []), bt = S.length ? t.dur / S.length : 0, G = [];
  S.forEach(v => { const l = lvOf(v); if (G.length && G[G.length - 1].l === l) G[G.length - 1].n++; else G.push({ l, n: 1 }); });
  let ch = true; while (ch) { ch = false;
    for (let j = 1; j < G.length - 1; j++) if (G[j].n * bt < 10 && G[j].l !== 3) { G[j - 1].n += G[j].n; G.splice(j, 1); ch = true; break; }
    for (let j = 1; j < G.length; j++) if (G[j].l === G[j - 1].l) { G[j - 1].n += G[j].n; G.splice(j, 1); ch = true; break; } }
  let x = 0; G.forEach(g => { g.t0 = x; x += g.n * bt; g.t1 = x; }); return G;
}
const rvSel = { go: 0, back: 0 };
function stagesCard() {
  const V = routeVariants(); if (!V.length) return '';
  const mmss = s => Math.floor(s / 60) + ':' + String(Math.round(s % 60)).padStart(2, '0');
  let h = '';
  ['go', 'back'].forEach(dir => {
    const v = V.filter(x => x.dir === dir).sort((x, y) => x.m - y.m).slice(0, 4); if (!v.length) return;
    const si = Math.min(rvSel[dir], v.length - 1), sv = v[si];
    const rep = sv.trips.filter(t => t.ser && t.ser.length > 5).sort((a, b) => Math.abs(a.dur / 60 - sv.m) - Math.abs(b.dur / 60 - sv.m))[0]; if (!rep) return;
    const sg = tripSegs(rep), T = rep.dur;
    const W = 326, H = 172, x0 = 48, x1 = 318, rowH = 36, tp = 8, X = t => x0 + t / T * (x1 - x0), YL = l => tp + l * rowH + rowH / 2;
    let s = `<svg viewBox="0 0 ${W} ${H}" width="100%">`;
    LVL.forEach((L, l) => s += `<rect x="${x0}" y="${tp + l * rowH + 2}" width="${x1 - x0}" height="${rowH - 4}" rx="8" fill="rgba(255,255,255,.025)"/><text x="0" y="${YL(l) + 4}" font-size="11" font-weight="600" fill="${L.c}" ${FF}>${L.n}</text>`);
    for (let j = 1; j < sg.length; j++) { const x = X(sg[j].t0); s += `<line x1="${x.toFixed(1)}" y1="${YL(sg[j - 1].l)}" x2="${x.toFixed(1)}" y2="${YL(sg[j].l)}" stroke="rgba(255,255,255,.28)" stroke-width="1.2"/>`; }
    sg.forEach(g => { const a = X(g.t0), b = X(g.t1), w = Math.max(4, b - a); s += `<rect x="${a.toFixed(1)}" y="${YL(g.l) - 7}" width="${w.toFixed(1)}" height="14" rx="${Math.min(3, w / 2)}" fill="${LVL[g.l].c}"/>`; });
    for (let m = 0; m * 60 <= T; m += 5) s += `<text x="${X(m * 60).toFixed(1)}" y="${H - 4}" text-anchor="middle" font-size="9" fill="#8e8e93" ${FF}>${m}</text>`;
    s += '</svg>';
    /* Anteile je Route (Mittel über ihre Fahrten) */
    const sh = v.map(x => { const a = [0, 0, 0, 0]; let k = 0, ns = 0; x.trips.forEach(t => { if (!t.ser || t.ser.length < 6) return; k++; const G = tripSegs(t); G.forEach(g => a[g.l] += g.t1 - g.t0); ns += t.stops ? t.stops.length : G.filter(g => g.l === 3).length; }); return { a: a.map(y => k ? y / k : 0), n: k ? Math.round(ns / k) : 0 }; });
    const tm = Math.max(...v.map(x => x.m * 60)), tot = sh[si].a.reduce((x, y) => x + y, 0) || 1;
    const row = (x, i) => { const w = 200, hh = 30, yl = 19, lw = 2.4, st = sh[i].a[3]; let o = `<circle cx="8" cy="${yl}" r="7.5" fill="rgba(8,18,14,.9)" stroke="#ff7a1a" stroke-width="${lw}"/><text x="8" y="${yl + 3.3}" text-anchor="middle" font-size="9" font-weight="700" fill="#ff7a1a" ${FF}>${sh[i].n}</text>`, xx = 17.2, ox = 0, ol = 0;
      [3, 0, 1, 2].forEach(l => { const len = sh[i].a[l] / tm * 150; if (len < .5) return; if (l === 3) { ox = xx; ol = len; } o += `<line x1="${xx.toFixed(1)}" y1="${yl}" x2="${(xx + len).toFixed(1)}" y2="${yl}" stroke="${LVL[l].c}" stroke-width="${lw}"/>`; xx += len + 1.2; });
      o += `<text x="${ol >= 26 ? ox + ol / 2 : ox}" y="${yl - 7}" ${ol >= 26 ? 'text-anchor="middle" ' : ''}font-size="10" fill="#8e8e93" ${FF}>${mmss(st)}</text>`;
      return `<div class="rw"><span class="rn" style="color:${['#efbb3c', '#d0d0d0', '#a88e60', '#98989f'][i]}">${esc(routeName(x, i))}</span><svg viewBox="0 0 ${w} ${hh}" style="height:${hh}px">${o}</svg><span class="rtm">${Math.round(x.m)} min</span></div>`; };
    h += `<div class="card stg">${kh('route', dir === 'go' ? 'Weg zur Arbeit' : 'Weg nach Hause', 'Ø der letzten Fahrten')}
     ${v.length > 1 ? `<div class="sgp">${v.map((x, i) => `<button class="${i === si ? 'on' : ''}" data-a="rvs" data-d="${dir}" data-i="${i}">${esc(routeName(x, i))}</button>`).join('')}</div>` : ''}
     <div class="big"><b>${Math.round(sv.m)}</b><small>min · ${Math.round(sh[si].a[0] / tot * 100)} % flott · ${Math.round(sh[si].a[3] / tot * 100)} % Stand</small></div>${s}
     <div class="rows">${v.map(row).join('')}</div></div>`;
  });
  return h;
}
function routeCompareCard() {
  const V = routeVariants(); if (!V.length) return '';
  const COL = ['#efbb3c', '#d0d0d0', '#a88e60', '#98989f'];
  let h = '';
  ['go', 'back'].forEach(dir => {
    const v = V.filter(x => x.dir === dir).sort((x, y) => x.m - y.m).slice(0, 3); if (v.length < 2) return;
    const all = v.flatMap(x => x.route), la = all.map(p => p[0]), lo = all.map(p => p[1]), k = Math.cos(la[0] * Math.PI / 180);
    const x0 = Math.min(...lo), x1 = Math.max(...lo), y0 = Math.min(...la), y1 = Math.max(...la), W = 326, H = 128, PX = 34, PY = 20, sc = Math.min((W - 2 * PX) / ((x1 - x0) * k || 1e-6), (H - 2 * PY) / ((y1 - y0) || 1e-6));
    const ox = (W - (x1 - x0) * k * sc) / 2, oy = (H - (y1 - y0) * sc) / 2, P = p => [ox + (p[1] - x0) * k * sc, H - oy - (p[0] - y0) * sc];
    let svg = `<svg viewBox="0 0 ${W} ${H}" width="100%" class="ch">`;
    v.slice().reverse().forEach((x, j) => { const i = v.length - 1 - j; svg += `<polyline points="${x.route.map(p => P(p).map(n => n.toFixed(1)).join(',')).join(' ')}" fill="none" stroke="${COL[i]}" stroke-width="${i ? 1.8 : 2.4}" stroke-linecap="round" stroke-linejoin="round" opacity="${i ? .7 : 1}"/>`; });
    /* Ampeln: Querstriche wie Tacho-Teilstriche, Länge = Wartezeit, in der Farbe der Route */
    const hot = [];
    v.forEach((x, i) => x.trips.forEach(t => (t.stops || []).forEach(p => { let c = hot.find(c => c.i === i && hav({ lat: c.lat, lon: c.lon }, { lat: p[0], lon: p[1] }) < 60); if (!c) { c = { i, lat: p[0], lon: p[1], n: 0, s: 0 }; hot.push(c); } c.n++; c.s += p[2]; })));
    const hs = hot.filter(c => c.n >= 3).map(c => ({ ...c, avg: c.s / c.n })), amx = Math.max(1, ...hs.map(c => c.avg)), worst = hs.slice().sort((a, b) => b.s - a.s)[0];
    hs.forEach(c => {
      const r = v[c.i].route, ni = r.reduce((m, p, j) => hav({ lat: p[0], lon: p[1] }, c) < hav({ lat: r[m][0], lon: r[m][1] }, c) ? j : m, 0), a0 = P(r[Math.max(0, ni - 1)]), a1 = P(r[Math.min(r.length - 1, ni + 1)]), q = P([c.lat, c.lon]);
      let dx = a1[0] - a0[0], dy = a1[1] - a0[1]; const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l; const L = 3 + 7 * c.avg / amx;
      svg += `<line x1="${(q[0] - dy * L).toFixed(1)}" y1="${(q[1] + dx * L).toFixed(1)}" x2="${(q[0] + dy * L).toFixed(1)}" y2="${(q[1] - dx * L).toFixed(1)}" stroke="${COL[c.i]}" stroke-width="1.6" stroke-linecap="round"/>`;
    });
    if (worst) { const q = P([worst.lat, worst.lon]); svg += `<circle cx="${q[0].toFixed(1)}" cy="${q[1].toFixed(1)}" r="4.6" fill="rgba(8,18,14,.9)" stroke="var(--o)" stroke-width="2.2"/>`; }
    /* Start und Ziel als Endringe wie bei den Kurven */
    const s0 = P(v[0].route[0]), s1 = P(v[0].route[v[0].route.length - 1]), lab = dir === 'go' ? ['Zuhause', 'Arbeit'] : ['Arbeit', 'Zuhause'];
    [[s0, lab[0]], [s1, lab[1]]].forEach(([q, t]) => { const left = q[0] < W / 2; svg += `<circle cx="${q[0].toFixed(1)}" cy="${q[1].toFixed(1)}" r="3.4" fill="rgba(8,18,14,.9)" stroke="#98989f" stroke-width="1.8"/><text x="${(q[0] + (left ? -8 : 8)).toFixed(1)}" y="${(q[1] + 16).toFixed(1)}" text-anchor="${left ? 'start' : 'end'}" font-size="10" fill="#8e8e93" ${FF}>${t}</text>`; });
    svg = '<div class="zm">' + svg + '</svg></div>';
    let wl = '';
    if (worst) { const key = worst.lat.toFixed(4) + ',' + worst.lon.toFixed(4), nm = (db.settings.spotNames || {})[key]; if (!nm) streetName(worst, key); wl = `<div class="info wl"><svg width="12" height="12" viewBox="0 0 12 12"><circle cx="6" cy="6" r="4" fill="none" stroke="var(--o)" stroke-width="2"/></svg> Längster Halt${nm ? ': ' + esc(nm) : ''} · Ø ${Math.round(worst.avg)} s</div>`; }
    const rows = v.map((x, i) => { const ns = x.trips.reduce((a, t) => a + (t.stops ? t.stops.length : 0), 0) / x.n; return `<div class="rv"><i style="background:${COL[i]}"></i><span class="nm">Weg ${String.fromCharCode(65 + i)}<small>${x.n} Fahrten</small></span><b>${Math.round(x.m)}<small> min</small></b><span class="sd">± ${Math.round(x.sd)} min · Ampeln Ø ${Math.round(x.st)} min${ns ? ' · ' + Math.round(ns) + ' Stopps' : ''}</span></div>`; }).join('');
    const gain = Math.round(v[v.length - 1].m - v[0].m);
    h += `<div class="card rvc">${kh('route', dir === 'go' ? 'Weg zur Arbeit' : 'Weg nach Hause', 'letzte 4 Monate')}${svg}${rows}${gain >= 1 ? `<div class="info">Weg A ist im Schnitt ${gain} min schneller</div>` : ''}${wl}</div>`;
  });
  return h;
}
function maintTiles() {
  const odo = currentOdo(), L = db.reminders.filter(r => r.everyKm && /öl|insp/i.test(r.name)).slice(0, 2); if (!L.length) return '';
  const tiles = L.map(r => {
    const left = r.lastOdo + r.everyKm - odo, lv = left < 0 ? 2 : left < 500 ? 1 : 0, col = ['#ffffff', '#ff7a1a', '#e0242c'][lv];
    const icon = ic(icn(r.name), 15).replace('stroke="#fff"', 'stroke="' + col + '"');
    return `<div class="t mt"><div class="kh">${icon}<span>${esc(r.name)}</span></div><b${lv ? ` style="color:${col}"` : ''}>${left < 0 ? '−' : ''}${nf(Math.abs(Math.round(left)), 0)}<small> km</small></b><span class="d">${left < 0 ? 'überfällig' : 'noch'}</span></div>`;
  }).join('');
  return `<div class="sec">Wartung</div><div class="g2">${tiles}</div>`;
}
function costTiles() {
  const L = db.logs.filter(l => (l.type === 'tank' || l.type === 'service') && l.eur > 0); if (!L.length) return '';
  const first = L.map(l => l.date).sort()[0], inM = (d, m) => d.slice(0, 7) === m, m0 = today().slice(0, 7);
  const eurA = L.reduce((a, l) => a + l.eur, 0), kmA = db.trips.filter(t => t.start.slice(0, 10) >= first).reduce((a, t) => a + t.km, 0);
  const eurM = L.filter(l => inM(l.date, m0)).reduce((a, l) => a + l.eur, 0), kmM = db.trips.filter(t => inM(t.start, m0)).reduce((a, t) => a + t.km, 0);
  const tile = (l, e, k) => `<div class="t">${kh('fuel', l)}<b>${k > 1 ? nf(e / k, 2) : '–'}<small> €/km</small></b><span class="d">${nf(e, 0)} € · ${nf(k, 0)} km</span></div>`;
  return `<div class="sec">Kosten</div><div class="g2">${tile('Kosten pro km', eurA, kmA)}${tile('Dieser Monat', eurM, kmM)}</div>`;
}
function viewFahrt() {
  if (sub === 'finden') return viewFinden();
  if (sub === 'tanken') return viewTanken();
  fetchForecast();
  const odo = currentOdo(), due = db.reminders.map(r => ({ r, s: reminderStatus(r) })).filter(x => x.s.level > 0), ts = tankState(), pk = db.settings.parked;
  let h = '';
  const nt = db.settings.notice; if (nt && daysAgo(nt.at) < .5) h += `<div class="card note">${kh('note', esc(nt.t), fmtTime(nt.at))}<div class="rt">${esc(nt.d)}</div><div class="r" style="margin-top:10px"><span></span><button class="ghost lnk" data-a="dismiss">Ok</button></div></div>`;
  h += commuteCard() + routeTankCard(ts);
  (fc ? fc.warns : []).forEach(w => h += `<div class="card wx">${kh(w.icon, esc(w.t), lamp(1).replace('bald', 'Achtung'))}<div class="rt">${esc(w.d)}</div></div>`);
  if (daysAgo(db.settings.odoCheck || db.settings.odoDate) > 30) h += `<button class="actb" data-a="odophoto"><span>Kilometerstand abgleichen</span>${ic('speed', 17)}</button>`;
  if (db.trips.length && daysAgo(db.settings.lastBackup) > 7) h += `<button class="actb" data-a="export"><span>Daten sichern <small>· ${db.settings.lastBackup ? 'vor ' + Math.floor(daysAgo(db.settings.lastBackup)) + ' Tagen' : 'nie gesichert'}</small></span>${ic('note', 17)}</button>`;
  const ws = weekStart(0), dd = [0, 0, 0, 0, 0, 0, 0]; db.trips.forEach(t => { const i = Math.floor((new Date(t.start) - ws) / 864e5); if (i >= 0 && i < 7) dd[i] += t.km; });
  const td = (new Date().getDay() + 6) % 7, ps = weekStart(1), pe = new Date(+ps + (td + 1) * 864e5);
  const prev = db.trips.filter(x => { const d = new Date(x.start); return d >= ps && d < pe; }).reduce((a, x) => a + x.km, 0), cur = weekKm(0);
  const avgDay = [1, 2, 3, 4].map(weekKm).reduce((a, b) => a + b, 0) / 28;
  h += `<div class="g2"><div class="t hero">${kh('route', 'Diese Woche', 'Ø ' + nf(avgDay, 0) + ' km / Tag')}<div class="hv"><b>${nf(cur, 0)}</b><small>km</small></div>${weekLine(dd, td, avgDay)}</div>
  <div class="t">${kh('speed', 'Gesamt')}<b>${nf(odo, 0)}</b><span>km</span></div>
  <button class="t tk ${ts && ts.frac < .25 ? 'low' : ''}" data-a="opentank">${kh('fuel', 'Tank')}<div class="tv"><div><b>${ts ? Math.round(ts.frac * 100) + ' %' : '–'}</b><span>${ts ? '≈ ' + Math.round(ts.range) + ' km' : 'tippen'}</span></div>${ts ? ring(ts.frac, ts.frac < .25 ? '#ff7a1a' : '#3a9466', 52) : ''}</div></button></div>`;
  if (fc && fc.wind != null) h += `<div class="card now">${kh('wind', 'Jetzt draußen', fc.gust >= 45 ? lamp(1).replace('bald', 'Böen') : '')}<div class="nw"><div><b>${fc.wind}<small> km/h</small></b><span class="info">Wind aus ${dirName(fc.wdir)} <svg width="13" height="13" viewBox="0 0 24 24" style="transform:rotate(${Math.round(fc.wdir + 180)}deg)" fill="none" stroke="#a8a8ae" stroke-width="2" stroke-linejoin="round"><path d="M12 3l7 17-7-4-7 4z"/></svg></span></div><div><b>${fc.gust}<small> km/h</small></b><span class="info">Böen</span></div><div><b>${nf(fc.temp, 0)}<small> °C</small></b><span class="info">${weatherInfo(fc.code).t}</span></div></div></div>`;
  if (prev || cur) {
    const pc = prev ? Math.round((cur - prev) / prev * 100) : 0;
    h += `<div class="sec">Highlights</div><div class="card hl">${kh('route', 'Kilometer')}<p>${prev ? (pc >= 0 ? `Diese Woche bist du bisher <b>${pc} % mehr</b> gefahren als bis zum gleichen Tag letzter Woche.` : `Diese Woche bist du bisher <b>${-pc} % weniger</b> gefahren als bis zum gleichen Tag letzter Woche.`) : 'Erste Woche mit Fahrten – weiter so.'}</p>${cmpBars(cur, prev, nf(cur, 0) + ' km · diese Woche', nf(prev, 0) + ' km · letzte Woche')}</div>`;
  }
  h += maintTiles();
  if (due.length) { h += `<div class="sec">Fällig</div>`; due.forEach(x => h += remCard(x.r, x.s)); }
  const lt = db.trips.slice().sort((a, b) => b.start.localeCompare(a.start))[0];
  if (lt) h += `<div class="sec">Letzte Fahrt</div><button class="card btn last" data-a="lasttrip" data-id="${lt.id}">${kh('speed', ftLabel(lt) || fmtDay(lt.start), (ftLabel(lt) ? fmtDay(lt.start) + ' · ' : '') + fmtTime(lt.start))}<div class="r"><b class="big">${nf(lt.km, 1)}<small> km</small></b></div><div class="r2"><span>${Math.round(lt.dur / 60)} min</span><span class="y">Ø ${lt.avg}</span><span>${lt.commute ? 'Pendeln' : 'Freizeit'}</span></div>${lt.zk ? zb(lt.zk) : ''}<span class="chev">›</span></button>`;
  if (pk) h += `<div class="sec">Roller</div><button class="card btn" data-a="finden">${kh('pin', 'Roller finden', fmtTime(pk.t))}<span class="rt">geparkt ${fmtDay(pk.t)}</span><span class="chev">›</span></button>`;
  return h;
}
/* Roller finden */
let fnd = null;
function viewFinden() {
  const pk = db.settings.parked;
  let h = '';
  if (!pk) return h + `<p class="mu">Noch kein Standort gespeichert. Er wird beim Beenden einer Fahrt automatisch gemerkt – oder jetzt von Hand:</p><button class="pill" data-a="parknow">${ic('pin', 14)} Standort jetzt merken</button>`;
  /* Präzisionssuche wie AirTag: großer Pfeil, große Entfernung, Hinweis in Worten, Punktefeld */
  let dots = ''; for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) { const x = 30 + c * 30, y = 30 + r * 30, dd = Math.hypot(x - 150, y - 150); if (dd < 135 && dd > 70) dots += `<circle cx="${x}" cy="${y}" r="2.2" fill="#fff" opacity="${(.32 - dd / 600).toFixed(2)}"/>`; }
  h += `<div class="pf" id="pf"><div class="pfd"><b id="fDist">–</b><small id="fUnit"> m</small></div><div class="pfh" id="fTxt">Bewege dein iPhone</div>
  <svg class="pfa" viewBox="0 0 300 300" width="280" height="280">${dots}<g id="fArrow" transform="rotate(0 150 150)"><path d="M150 58 L196 160 Q200 170 190 168 L162 160 L162 236 Q162 246 150 246 Q138 246 138 236 L138 160 L110 168 Q100 170 104 160 Z" fill="#fff" stroke="#fff" stroke-width="10" stroke-linejoin="round"/></g></svg>
  <div class="pfi"><span class="info">${ic('clock', 13)} geparkt ${fmtTime(pk.t)} · ${fmtDay(pk.t)}</span><span class="info"><b id="fDir">–</b> · <b id="fWalk">–</b> zu Fuß</span></div></div>
  <p class="mu" id="fHint" style="text-align:center">Für die Richtung im Stand: „Kompass erlauben“.</p>
  <div class="g2"><button class="pill" data-a="compass">Kompass erlauben</button><button class="pill" data-a="parknow">Neu merken</button></div>
  <button class="pill" style="margin-top:10px;width:100%" data-a="maps">${ic('navi', 14)} In Karten öffnen</button>`;
  return h;
}
function finderStart() {
  if (fnd || !navigator.geolocation) return;
  fnd = { me: null, comp: null, gps: null };
  fnd.watch = navigator.geolocation.watchPosition(p => { fnd.me = { lat: p.coords.latitude, lon: p.coords.longitude }; if (p.coords.heading != null && !isNaN(p.coords.heading)) fnd.gps = p.coords.heading; finderUpdate(); }, () => { const e = $('#fHint'); if (e) e.textContent = 'Kein GPS-Signal oder Zugriff verweigert.'; }, { enableHighAccuracy: true, maximumAge: 2000, timeout: 20000 });
  fnd.ori = e => { const h = e.webkitCompassHeading != null ? e.webkitCompassHeading : (e.absolute && e.alpha != null ? 360 - e.alpha : null); if (h != null) { fnd.comp = h; finderUpdate(); } };
  window.addEventListener('deviceorientationabsolute', fnd.ori); window.addEventListener('deviceorientation', fnd.ori);
}
function finderStop() {
  if (!fnd) return; navigator.geolocation.clearWatch(fnd.watch);
  window.removeEventListener('deviceorientationabsolute', fnd.ori); window.removeEventListener('deviceorientation', fnd.ori); fnd = null;
}
function finderUpdate() {
  const pk = db.settings.parked; if (!fnd || !fnd.me || !pk || !G('fArrow')) return;
  const d = hav(fnd.me, pk), b = bearing(fnd.me, pk), hd = fnd.comp != null ? fnd.comp : fnd.gps != null ? fnd.gps : 0;
  G('fArrow').setAttribute('transform', `rotate(${((b - hd + 360) % 360).toFixed(1)} 150 150)`);
  G('fDist').textContent = d < 1000 ? Math.round(d) : nf(d / 1000, 1); G('fUnit').textContent = d < 1000 ? ' m' : ' km';
  G('fDir').textContent = dirName(b); G('fWalk').textContent = Math.max(1, Math.round(d / 80)) + ' min';
  const rel = ((b - hd + 540) % 360) - 180, ok = Math.abs(rel) < 18, pf = G('pf');
  if (pf) pf.classList.toggle('on', ok);
  const tx = G('fTxt'); if (tx) tx.textContent = d < 8 ? 'Hier' : ok ? 'Vor dir' : Math.abs(rel) > 150 ? 'Hinter dir' : rel < 0 ? 'Links' : 'Rechts';
}
/* Tanken */
function viewTanken() {
  const ts = tankState(); let h = '';
  h += `<div class="card tkh ${ts && ts.frac < .25 ? 'low' : ''}">${kh('fuel', 'Tank', ts ? 'geschätzt' : '')}<div class="tkm"><div><b>${ts ? Math.round(ts.frac * 100) : '–'}<small>${ts ? ' %' : ''}</small></b><span>${ts ? '≈ ' + Math.round(ts.range) + ' km Reichweite · ' + nf(ts.liters, 1) + ' l' : 'Volle Tankung eintragen'}</span></div>${ts ? ring(ts.frac, ts.frac < .25 ? '#ff7a1a' : '#3a9466', 58) : ''}</div></div>`;
  h += bestTimeCard();
  const srt = db.settings.tkSort || 'price';
  h += `<div class="sec">Tankstellen in der Nähe</div>`;
  if (!db.settings.tkKey) h += `<button class="actb" data-a="settings"><span>Tankerkönig-Schlüssel eintragen</span>${ic('fuel', 17)}</button><p class="mu">Kostenlos auf creativecommons.tankerkoenig.de</p>`;
  else if (!stations || stations.loading) h += `<p class="mu">Lade Preise …</p>`;
  else if (stations.err) h += `<div class="card">${kh('fuel', 'Preise nicht erreichbar', lamp(1))}<div class="rt">Netz oder Schlüssel prüfen</div></div>`;
  else if (!stations.list.length) h += `<p class="mu">Keine geöffnete Tankstelle gefunden.</p>`;
  else {
    const L = stations.list, minP = Math.min(...L.map(x => x.price)), cheap = L.find(x => x.price === minP), near = L.reduce((a, x) => x.dist < a.dist ? x : a, L[0]);
    const S = L.slice().sort(srt === 'dist' ? (a, b) => a.dist - b.dist : (a, b) => a.price - b.price || a.dist - b.dist), N = stations.all ? S.length : Math.min(10, S.length);
    h += `<div class="chips tks"><button class="c ${srt === 'price' ? 'on' : ''}" data-a="tks" data-f="price">Preis</button><button class="c ${srt === 'dist' ? 'on' : ''}" data-a="tks" data-f="dist">Nähe</button></div>`;
    const pr = v => { const t = v.toFixed(3); return t.slice(0, -1).replace('.', ',') + '<sup>' + t.slice(-1) + '</sup>'; };
    h += '<div class="card tkl">' + S.slice(0, N).map(x => {
      const i = L.indexOf(x), d = Math.round((x.price - minP) * 100);
      const tag = x === cheap ? '<em class="tg">Günstigste</em>' : x === near ? '<em class="ty">Nächste</em>' : '';
      const tag2 = x === cheap && x === near ? '<em class="ty">Nächste</em>' : '';
      return `<button class="tkr" data-a="route" data-i="${i}"><div class="tn"><b>${esc(x.n)}</b><span>${nf(x.dist, 1)} km${x.st ? ' · ' + esc(x.st) : ''}</span>${tag || tag2 ? `<div class="tt">${tag}${tag2}</div>` : ''}</div><div class="tp"><b class="${x === cheap ? 'g' : ''}">${pr(x.price)}</b><span>${d > 0 ? '+' + d + ' ct' : 'E5'}</span></div></button>`;
    }).join('') + '</div>';
    if (S.length > N) h += `<button class="actb" data-a="tkmore"><span>Alle ${S.length} anzeigen</span><span class="chev">›</span></button>`;
    h += `<p class="mu">Super E5 · Preise: Tankerkönig (CC BY 4.0)</p>`;
  }
  return h;
}
function viewFahrten() {
  nameOldTrips();
  const all = db.trips, total = all.reduce((a, x) => a + x.km, 0);
  const f = { all: () => true, commute: t => isCom(t), free: t => !isCom(t), cold: t => t.temp != null && t.temp <= 5 }[fFilter];
  const t = all.filter(f), chip = (k, l, c = 'on') => `<button class="c ${fFilter === k ? c : ''}" data-a="ff" data-f="${k}">${l}</button>`;
  const wk = [7, 6, 5, 4, 3, 2, 1, 0].map(i => weekKm(i));
  const t0 = Date.now() - 56 * 864e5, cm = all.filter(x => x.commute && x.dur > 120 && new Date(x.start) > t0).map(x => ({ x: (new Date(x.start) - t0) / 864e5, y: Math.round(x.dur / 60) }));
  const dl = []; for (let i = 13; i >= 0; i--) { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - i); const k = d.toISOString().slice(0, 10), ts2 = all.filter(x => new Date(x.start).toDateString() === d.toDateString()); dl.push({ l: i % 2 ? '' : d.getDate() + '.', lo: ts2.length ? Math.min(...ts2.map(x => x.avg || 0)) : 0, hi: ts2.length ? Math.max(...ts2.map(x => x.max || x.avg || 0)) : 0 }); }
  const last10 = all.slice().sort((a, b) => a.start.localeCompare(b.start)).slice(-10);
  return `<div class="g2"><div class="t hero">${kh('route', 'Gefahren', '8 Wochen')}<div class="hv"><b>${nf(total, 0)}</b><small>km</small></div><div class="hx">${miniCurve(wk, 150, 44)}<div class="hxl"><span>8 WO.</span><span>JETZT</span></div></div></div>
  <div class="t">${kh('navi', 'Fahrten')}<b>${all.length}</b></div><div class="t">${kh('speed', 'Ø pro Fahrt')}<b>${all.length ? nf(total / all.length, 1) : '–'}</b><span>km</span></div></div>
  <div class="sec">Auswertung</div>
  <div class="card">${kh('clock', 'Pendelzeit', '8 Wochen')}${rangeChart(wkGroups(all.filter(x => x.commute && x.dur > 120), x => Math.round(x.dur / 60)), cm.length ? cm.reduce((a, p) => a + p.y, 0) / cm.length : 0, 'min')}</div>
  <div class="card">${kh('speed', 'Tempo', 'Ø bis Höchstwert · 8 Wochen')}${rangeChart(wkGroups(all, x => x.max || x.avg).map((g, i) => ({ ...g, lo: wkGroups(all, x => x.avg)[i].lo })), all.length ? all.reduce((a, x) => a + (x.avg || 0), 0) / all.length : 0, 'km/h')}</div>
  <div class="card">${kh('bab', 'Zonen', '4 Wochen')}${(() => { const z = [0, 0, 0]; all.filter(x => Date.now() - new Date(x.start) < 28 * 864e5).forEach(x => (x.zk || [x.km, 0, 0]).forEach((v, k) => z[k] += v)); const S = z[0] + z[1] + z[2] || 1; return `<div class="zl">${z.map((v, k) => `<i style="flex:${Math.max(v / S, .002)};background:${ZCOL[k]}"></i>`).join('')}</div><div class="lg">${['Stadt', 'Land', 'Autobahn'].map((n, k) => `<span><i style="background:${ZCOL[k]}"></i>${n} ${Math.round(z[k] / S * 100)} %</span>`).join('')}</div>`; })()}</div>
  ${lightsYearCard()}${stagesCard()}
  <div class="sec">Alle Fahrten</div>
  <div class="chips">${chip('all', 'Alle')}${chip('commute', 'Pendeln')}${chip('free', 'Freizeit')}${chip('cold', 'Kalt ≤ 5°', 'w')}</div>
  ${t.length ? t.map(x => {
    const w = weatherInfo(x.code);
    return `<div class="card tripc" data-a="opentrip" data-id="${x.id}"><div class="r"><div><b class="big">${nf(x.km, 1)}<small> km</small></b><span class="l">${fmtDay(x.start)} · ${fmtTime(x.start)}</span></div><span class="ft">${ftLabel(x)}</span></div>
    <div class="r2"><span>${Math.round(x.dur / 60)} min</span><span class="y">Ø ${x.avg}</span>${x.temp != null ? `<span>${ic(w.wet ? 'drop' : 'cloud', 13)} ${nf(x.temp, 0)}°C</span>` : ''}<span>${x.commute ? 'Pendeln' : 'Freizeit'}</span></div>${x.zk ? zb(x.zk) : ''}<span class="chev">›</span></div>`;
  }).join('') : '<p class="mu">Keine Fahrten in dieser Ansicht.</p>'}`;
}
function tripMap(rt) {
  if (!rt || rt.length < 2) return '';
  return `<div class="tmap" id="tmap">${routeSVG(rt)}</div><span class="mapattr">© OpenFreeMap · © OpenStreetMap</span>`;
}
/* Fallback/Platzhalter: Route ohne Kartenkacheln */
function routeSVG(rt) {
  const W = 326, H = 210, pad = 22, las = rt.map(x => x[0]), los = rt.map(x => x[1]);
  const a = Math.min(...las), b = Math.max(...las), c = Math.min(...los), d = Math.max(...los), k = Math.cos(a * Math.PI / 180);
  const sx = (d - c) * k || 1e-6, sy = (b - a) || 1e-6, sc = Math.min((W - 2 * pad) / sx, (H - 2 * pad) / sy);
  const pt = rt.map(x => [W / 2 + ((x[1] - (c + d) / 2) * k) * sc, H / 2 - (x[0] - (a + b) / 2) * sc]), s0 = pt[0], e = pt[pt.length - 1];
  return `<svg class="rsvg" viewBox="0 0 ${W} ${H}" width="100%"><path d="${bez(pt)}" fill="none" stroke="#000" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" opacity=".6"/><path d="${bez(pt)}" fill="none" stroke="#efbb3c" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/><circle cx="${s0[0]}" cy="${s0[1]}" r="5.5" fill="#3a9466" stroke="#000" stroke-width="2"/><circle cx="${e[0]}" cy="${e[1]}" r="5.5" fill="#ff2d2d" stroke="#000" stroke-width="2"/></svg>`;
}
let mlP = null;
function loadMapLibre() {
  if (window.maplibregl) return Promise.resolve();
  if (mlP) return mlP;
  mlP = new Promise((res, rej) => {
    const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css'; document.head.appendChild(l);
    const sc = document.createElement('script'); sc.src = 'https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js'; sc.onload = res; sc.onerror = () => { mlP = null; rej(); }; document.head.appendChild(sc);
  });
  return mlP;
}
function initTripMap() {
  const t = db.trips.find(x => x.id === tripSel), box = G('tmap'); if (!t || !box || !t.route || t.route.length < 2) return;
  loadMapLibre().then(() => {
    if (!document.body.contains(box)) return;
    const co = t.route.map(x => [x[1], x[0]]), bb = co.reduce((m, p) => [Math.min(m[0], p[0]), Math.min(m[1], p[1]), Math.max(m[2], p[0]), Math.max(m[3], p[1])], [180, 90, -180, -90]);
    const div = document.createElement('div'); div.className = 'mlmap'; box.appendChild(div);
    const map = new maplibregl.Map({ container: div, style: 'https://tiles.openfreemap.org/styles/dark', bounds: [[bb[0], bb[1]], [bb[2], bb[3]]], fitBoundsOptions: { padding: 28 }, cooperativeGestures: true, dragRotate: false, pitchWithRotate: false, touchPitch: false, doubleClickZoom: true, locale: { 'CooperativeGesturesHandler.MobileHelpText': 'Mit zwei Fingern verschieben und zoomen', 'CooperativeGesturesHandler.MacHelpText': '⌘ + Scrollen zum Zoomen', 'CooperativeGesturesHandler.WindowsHelpText': 'Strg + Scrollen zum Zoomen' }, attributionControl: false, fadeDuration: 0 });
    map.touchZoomRotate.disableRotation(); map.keyboard.disable();
    map.on('dblclick', () => {}); div.addEventListener('dblclick', e => { e.preventDefault(); map.fitBounds([[bb[0], bb[1]], [bb[2], bb[3]]], { padding: 28 }); });
    map.on('load', () => {
      /* Orientierung: Wasser, Grünflächen, Sehenswürdigkeiten dezent hervorheben */
      try { map.getStyle().layers.forEach(L => {
        const sl = L['source-layer'] || '', id = L.id, set = (k, v) => { try { map.setPaintProperty(id, k, v); } catch (e) { } };
        if (sl === 'water' && L.type === 'fill') set('fill-color', '#163a3a');
        if (sl === 'waterway' && L.type === 'line') set('line-color', '#1f5250');
        if ((sl === 'park' || /park|wood|grass|forest|landcover/.test(id)) && L.type === 'fill') { set('fill-color', '#16301f'); set('fill-opacity', .9); }
        if (sl === 'water_name' && L.type === 'symbol') set('text-color', '#6fb3a6');
        if (sl === 'poi' && L.type === 'symbol') { set('text-color', '#d7c08f'); set('text-halo-color', '#000'); set('icon-opacity', .8); try { map.setFilter(id, ['<=', ['get', 'rank'], 12]); } catch (e) { } }
        if (sl === 'transportation_name' && L.type === 'symbol') set('text-color', '#9a9a9e');
      }); } catch (e) { }
      map.addSource('r', { type: 'geojson', data: { type: 'Feature', geometry: { type: 'LineString', coordinates: co } } });
      map.addLayer({ id: 'rc', type: 'line', source: 'r', paint: { 'line-color': '#000', 'line-width': 7, 'line-opacity': .6 }, layout: { 'line-cap': 'round', 'line-join': 'round' } });
      map.addLayer({ id: 'rl', type: 'line', source: 'r', paint: { 'line-color': '#efbb3c', 'line-width': 3.4 }, layout: { 'line-cap': 'round', 'line-join': 'round' } });
      map.addSource('se', { type: 'geojson', data: { type: 'FeatureCollection', features: [{ type: 'Feature', properties: { c: '#3a9466' }, geometry: { type: 'Point', coordinates: co[0] } }, { type: 'Feature', properties: { c: '#ff2d2d' }, geometry: { type: 'Point', coordinates: co[co.length - 1] } }] } });
      const stp = (t.stops || []).filter(q => q && q.length >= 2).map(q => ({ type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: [q[1], q[0]] } }));
      if (stp.length) { map.addSource('st', { type: 'geojson', data: { type: 'FeatureCollection', features: stp } }); map.addLayer({ id: 'st', type: 'circle', source: 'st', paint: { 'circle-radius': 4.2, 'circle-color': '#000', 'circle-stroke-color': '#fed11a', 'circle-stroke-width': 1.8 } }); }
      map.addLayer({ id: 'se', type: 'circle', source: 'se', paint: { 'circle-radius': 5.5, 'circle-color': ['get', 'c'], 'circle-stroke-color': '#000', 'circle-stroke-width': 2 } });
      box.classList.add('ok');
    });
  }).catch(() => { });
}
function tripCurve(ser, avg, dur) {
  const W = 326, H = 170, x0 = 6, x1 = 320, n = ser.length; if (n < 2) return '';
  const vmax = Math.max(60, ...ser), X = i => x0 + i * (x1 - x0) / (n - 1), yv = v => 98 - 90 * v / vmax;
  const ac = ser.map((v, i) => i ? v - ser[i - 1] : 0), amax = Math.max(8, ...ac.map(Math.abs)), ya = v => 140 - 22 * v / amax;
  let g = ''; for (let y = 8; y <= 98; y += 15) g += `<line x1="${x0}" y1="${y}" x2="${x1}" y2="${y}" stroke="rgba(255,255,255,.12)"/>`; for (let y = 120; y <= 162; y += 11) g += `<line x1="${x0}" y1="${y}" x2="${x1}" y2="${y}" stroke="rgba(255,255,255,.12)"/>`;
  const sp = ser.map((v, i) => [X(i), yv(v)]), as = ac.map((v, i) => [X(i), ya(v)]), mi = ser.indexOf(Math.max(...ser));
  const lab = s => { const m = Math.round(s / 60); return m + ' min'; };
  return `<svg viewBox="0 0 ${W} ${H}" width="100%" style="display:block"><defs><clipPath id="tneg"><rect x="${x0}" y="140" width="${x1 - x0}" height="30"/></clipPath></defs>${g}<line x1="${x0}" y1="98" x2="${x1}" y2="98" stroke="#444" stroke-width="1.2"/><line x1="${x0}" y1="140" x2="${x1}" y2="140" stroke="#555"/>
  <path d="${bez(sp)}" fill="none" stroke="#efbb3c" stroke-width="2.4" stroke-linejoin="round"/>
  <line x1="${x0}" y1="${yv(avg).toFixed(1)}" x2="${x1}" y2="${yv(avg).toFixed(1)}" stroke="rgba(255,255,255,.6)" stroke-width="1.2" stroke-dasharray="5 4"/>
  <circle cx="${X(mi).toFixed(1)}" cy="${yv(ser[mi]).toFixed(1)}" r="3.4" fill="rgba(8,18,14,.9)" stroke="#efbb3c" stroke-width="2.4"/>
  <path d="${bez(as)}" fill="none" stroke="#8e8e93" stroke-width="2"/><path d="${bez(as)}" fill="none" stroke="#4fae80" stroke-width="2.4" clip-path="url(#tneg)"/>
  <text x="${x0}" y="${H - 1}" font-size="9" fill="#777" font-family="-apple-system,Helvetica Neue,sans-serif">0</text><text x="${x1}" y="${H - 1}" text-anchor="end" font-size="9" fill="#777" font-family="-apple-system,Helvetica Neue,sans-serif">${lab(dur)}</text></svg>`;
}
function viewTrip() {
  const t = db.trips.find(x => x.id === tripSel); if (!t) { sub = null; return viewFahrten(); }
  const w = weatherInfo(t.code), ser = (t.ser && t.ser.length > 1) ? t.ser : (t.spark || []), zk = t.zk || [0, 0, 0], zs = (zk[0] + zk[1] + zk[2]) || 1;
  const mvT = Math.max(60, t.dur - (t.stop || 0)), mvAvg = Math.round(t.km / (mvT / 3600)), cons = avgCons() || 3.1;
  const tile = (i, l, v, u) => `<div class="t">${kh(i, l)}<b>${v}${u ? `<small> ${u}</small>` : ''}</b></div>`;
  const zr = [['city', 'Stadt'], ['land', 'Land'], ['bab', 'Autobahn']].map((z, i) => `<div class="zr"><span>${ic(z[0], 17)}</span><i style="flex:1"><u style="width:${Math.round(zk[i] / zs * 100)}%;background:${ZCOL[i]}"></u></i><b>${nf(zk[i], 1)} km</b><small>${Math.round(zk[i] / zs * 100)} %</small></div>`).join('');
  const map = tripMap(t.route);
  return `<div class="g2"><div class="t hero">${kh('speed', ftLabel(t) || fmtDay(t.start), (ftLabel(t) ? fmtDay(t.start) + ' · ' : '') + fmtTime(t.start) + ' – ' + fmtTime(t.end))}<div class="hv"><b>${nf(t.km, 1)}</b><small>km · ${fmtDur(t.dur)}</small></div><div class="info">${ic(isCom(t) ? 'work' : 'route', 13)} ${isCom(t) ? 'Pendeln' : 'Freizeit'}${t.temp != null ? ` · ${ic(w.wet ? 'drop' : 'cloud', 13)} ${nf(t.temp, 0)} °C ${w.t}` : ''}</div></div>
  ${tile('speed', 'Ø Tempo', t.avg, 'km/h')}${tile('bolt', 'Höchstes Tempo', t.max, 'km/h')}</div>
  <div class="sec">Verlauf</div><div class="card">${kh('speed', 'Tempo & Beschleunigung', 'Ø ' + t.avg + ' km/h')}${tripCurve(ser, t.avg, t.dur)}</div>
  ${map ? `<div class="sec">Route</div><div class="card mapc">${map}</div>` : ''}
  <div class="sec">Strecke nach Tempo</div><div class="card">${zr}</div>
  <div class="sec">Sonst noch</div>
  <div class="g2">${tile('clock', 'Stillstand', t.stop != null ? Math.round(t.stop / 60) : '–', 'min')}${tile('speed', 'Ø in Bewegung', mvAvg, 'km/h')}${tile('drop', 'Verbrauch ≈', nf(t.km * cons / 100, 2), 'l')}${t.wind != null ? tile('wind', 'Wind · Böen ' + t.gust, t.wind, 'km/h') : tile('route', 'Ø inkl. Stopps', nf(t.km / (t.dur / 3600), 0), 'km/h')}</div>
  <div class="sec">Kategorie</div>
  <div class="g2"><button class="pill${isCom(t) ? ' sel' : ''}" data-a="setcat" data-id="${t.id}" data-v="pendel">${ic('work', 15)} Pendel</button><button class="pill${isCom(t) ? '' : ' sel'}" data-a="setcat" data-id="${t.id}" data-v="freizeit">${ic('route', 15)} Freizeit</button></div>
  <button class="ghost" style="margin-top:18px;font-size:11px;letter-spacing:.14em" data-a="deltrip" data-id="${t.id}">Fahrt löschen</button>`;
}
const LT = { tank: ['Tanken', 'fuel'], service: ['Service', 'wrench'], reifen: ['Reifendruck', 'tire'], notiz: ['Notiz', 'note'] };
function viewLogbuch() {
  const cons = consumption(), avgC = cons.length ? cons.reduce((a, c) => a + c.l100, 0) / cons.length : null;
  const tk = db.logs.filter(l => l.type === 'tank' && l.odo).sort((a, b) => a.odo - b.odo);
  const km = tk.length > 1 ? tk[tk.length - 1].odo - tk[0].odo : 0, spent = tk.slice(1).reduce((a, l) => a + (l.eur || 0), 0);
  const logs = db.logs.filter(l => lFilter === 'all' || l.type === lFilter).sort((a, b) => b.date.localeCompare(a.date) || (b.odo || 0) - (a.odo || 0));
  const chip = (k, l) => `<button class="c ${lFilter === k ? 'on' : ''}" data-a="lf" data-f="${k}">${l}</button>`;
  const ts = tankState();
  return `  <div class="g2"><div class="t hero">${kh('fuel', 'Kosten')}<div class="hv"><b>${km && spent ? nf(spent / km * 100, 2) : '–'}</b><small>€ / 100 km</small></div></div><div class="t">${kh('drop', 'Verbrauch')}<b>${avgC ? nf(avgC, 1) : '–'}</b><span>l / 100 km</span></div><button class="t tk ${ts && ts.frac < .25 ? 'low' : ''}" data-a="opentank">${kh('fuel', 'Tank')}<div class="tv"><div><b>${ts ? Math.round(ts.frac * 100) + ' %' : '–'}</b></div>${ts ? ring(ts.frac, ts.frac < .25 ? '#ff7a1a' : '#3a9466', 46) : ''}</div></button></div>
  <div class="sec">Auswertung</div>
  <div class="card">${kh('drop', 'Verbrauch', 'l / 100 km')}${lineChart(cons.map(c => c.l100), cons.map(c => fmtDate(c.date)), '')}</div>
  <div class="card">${kh('fuel', 'Kosten pro Monat', '€')}${(() => { const v = [], l = [], n0 = new Date(); for (let i = 5; i >= 0; i--) { const d = new Date(n0.getFullYear(), n0.getMonth() - i, 1); l.push(MO[d.getMonth()].slice(0, 3)); v.push(db.logs.filter(x => x.eur && x.date && +x.date.slice(0, 4) === d.getFullYear() && +x.date.slice(5, 7) === d.getMonth() + 1).reduce((a, x) => a + x.eur, 0)); } return lineChart(v, l, ' €'); })()}</div>
  <div class="sec">Einträge</div><div class="chips">${chip('all', 'Alle')}${chip('tank', 'Tanken')}${chip('service', 'Service')}${chip('reifen', 'Reifen')}${chip('notiz', 'Notiz')}</div>
  ${logs.length ? logs.map(l => {
    let d = '', right = '';
    if (l.type === 'tank') { d = `${nf(l.liters, 2)} l${l.full ? '' : ' · nicht voll'}`; right = l.eur ? nf(l.eur, 2) + ' €' : ''; if (l.eur && l.liters) d += ' · ' + nf(l.eur / l.liters, 3) + ' €/l'; }
    if (l.type === 'service') { d = esc(l.text); right = l.eur ? nf(l.eur, 2) + ' €' : ''; }
    if (l.type === 'reifen') d = `vorne ${nf(l.front, 1)} bar · hinten ${nf(l.rear, 1)} bar`;
    if (l.type === 'notiz') d = esc(l.text);
    return `<div class="card">${kh(LT[l.type][1], LT[l.type][0], fmtDate(l.date) + (l.odo ? ' · ' + nf(l.odo, 0) + ' km' : ''))}<div class="r"><b style="font-size:22px">${right}</b></div><div style="margin-top:6px;font-size:14px;letter-spacing:.04em">${d}</div><div style="text-align:right"><button class="ghost" style="font-size:11px;letter-spacing:.14em" data-a="dellog" data-id="${l.id}">Löschen</button></div></div>`;
  }).join('') : '<p class="mu">Noch keine Einträge.</p>'}`;
}
function viewMehr() {
  const ms = monthSeries(), avgM = ms.filter(m => m.km).length ? Math.round(ms.reduce((a, m) => a + m.km, 0) / ms.filter(m => m.km).length) : 0;
  const R = records(), rt = (i, v, u, l, hero) => `<div class="t rk${hero ? ' hero' : ''}">${kh(i, l)}<b>${v ? v.v : '–'}<small> ${v ? u : ''}</small></b><span class="d">${v ? v.d : ''}</span></div>`;
  const op = db.settings.odoPhoto;
  const T = db.trips, d28 = Date.now() - 28 * 864e5, d56 = Date.now() - 56 * 864e5, inR = (t, a, b) => { const x = +new Date(t.start); return x >= a && x < b; };
  const cmA = T.filter(t => isCom(t) && t.dur > 120 && inR(t, d28, Infinity)), cmB = T.filter(t => isCom(t) && t.dur > 120 && inR(t, d56, d28)), am = a => a.length ? Math.round(a.reduce((x, t) => x + t.dur, 0) / a.length / 60) : 0;
  const kA = T.filter(t => inR(t, d28, Infinity)).reduce((a, t) => a + t.km, 0) / 4, kB = T.filter(t => inR(t, d56, d28)).reduce((a, t) => a + t.km, 0) / 4;
  const vA = T.filter(t => inR(t, d28, Infinity) && t.avg), vB = T.filter(t => inR(t, d56, d28) && t.avg), av = a => a.length ? Math.round(a.reduce((x, t) => x + t.avg, 0) / a.length) : 0;
  const cs = consumption(), cL = cs.length ? cs[cs.length - 1].l100 : 0, cP = cs.length > 1 ? cs[cs.length - 2].l100 : cL;
  const temps = T.filter(t => t.temp != null && inR(t, d56, Infinity)).map(t => ({ x: (new Date(t.start) - d56) / 864e5, y: Math.round(t.temp), c: tcol(t.temp) }));
  return `<div class="sec" style="margin-top:0">Trends</div><div class="g2">
  ${trendTile('clock', 'Pendelzeit', am(cmA) ? am(cmA) + '<small> min</small>' : '–', cmB.length && cmA.length ? am(cmA) - am(cmB) : 0, am(cmA) <= am(cmB))}
  ${trendTile('route', 'km / Woche', nf(kA, 0), kB ? Math.round(kA - kB) : 0, true)}
  ${trendTile('drop', 'Verbrauch', cL ? nf(cL, 1) + '<small> l</small>' : '–', cs.length > 1 ? Math.round((cL - cP) * 10) / 10 : 0, cL <= cP)}
  ${trendTile('speed', 'Ø Tempo', av(vA) ? av(vA) + '<small> km/h</small>' : '–', vB.length && vA.length ? av(vA) - av(vB) : 0, true)}</div>
  <div class="sec">Analyse</div>
  <div class="card">${kh('route', 'Kilometer pro Monat', 'Ø ' + avgM)}${monthChart(ms)}</div>
  <div class="card">${kh('bab', 'Strecke pro Typ')}${typeChart(ms)}<div class="lg"><span><i style="background:${ZCOL[0]}"></i>Stadt</span><span><i style="background:${ZCOL[1]}"></i>Land</span><span><i style="background:${ZCOL[2]}"></i>Autobahn</span></div></div>
  <div class="card">${kh('cloud', 'Temperatur', '8 Wochen')}${rangeChart(wkGroups(T, x => x.temp != null ? Math.round(x.temp) : null), temps.length ? temps.reduce((a, p) => a + p.y, 0) / temps.length : 0, '°C')}</div>
  <div class="sec">Rekorde</div>
  <div class="g2">${rt('clock', R.fast, 'min', 'Schnellste Pendelfahrt')}${rt('route', R.long, 'km', 'Längste Tour', 1)}${rt('speed', R.top, 'km/h', 'Höchstes Tempo')}${rt('cal', R.week, 'km', 'Beste Woche')}${rt('bolt', R.streak, 'Tage', 'Längste Serie')}${rt('fuel', R.cons, 'l/100', 'Bester Verbrauch')}</div>
  ${costTiles()}<div class="sec">Erinnerungen</div>
  ${db.reminders.map(r => remCard(r, reminderStatus(r))).join('')}
  <button class="sm" data-a="newrem">+ Erinnerung</button>
  <div class="sec">Steuer</div>
  ${pauschaleCard()}
  <div class="sec">Schnellstart</div>
  <div class="card nfc">${kh('vespa', 'Fahrt per NFC starten')}<div class="rt">iPhone an den Sticker halten, und der Fahrmodus startet.</div><ol class="stp"><li>NFC-Sticker an Lenker oder Helmfach kleben</li><li>Kurzbefehle › Automation › NFC › Sticker scannen</li><li>Aktion „URL öffnen“ mit dem Link unten, „Sofort ausführen“ an</li></ol><div class="r" style="margin-top:12px;gap:8px"><button class="sm" data-a="nfccopy">${ic('note', 13)} Link kopieren</button></div></div>
  <div class="sec">Einstellungen</div>
  <div class="card">
    <div class="srow"><span>Kilometerstand</span><em>${nf(currentOdo(), 0)} km</em></div><div class="srow"><span>Pendelstrecke</span><em>${nf(db.settings.pendelKm, 1)} km</em></div><div class="srow"><span>Tankgröße</span><em>${nf(db.settings.tank, 1)} l</em></div><div class="srow"><span>Nadel im Tacho</span><em>${db.settings.needle ? 'An' : 'Aus'}</em></div><div class="srow"><span>Tankerkönig-Schlüssel</span><em>${db.settings.tkKey ? 'Gesetzt' : '–'}</em></div>
    <div class="srow"><span>Sprachansage beim Start</span><button class="sm" data-a="voice">${db.settings.voice ? 'An' : 'Aus'}</button></div>
    <div style="margin-top:12px;display:flex;gap:8px"><button class="sm" data-a="settings">Ändern</button><button class="sm" data-a="odophoto">${ic('speed', 13)} Tacho fotografieren</button></div>
    ${op ? `<div class="odoph"><img src="${op.img}" alt="Tacho"><span class="l">Abgleich ${fmtDate(op.t)} · ${nf(op.odo || 0, 0)} km</span></div>` : ''}
  </div>
  <input type="file" id="odoimg" accept="image/*" capture="environment" hidden>
  <div class="g2"><button class="pill" data-a="setwork">${ic('work', 15)} Arbeit hier ${db.settings.work ? '✓' : ''}</button><button class="pill" data-a="sethome">${ic('home', 15)} Zuhause hier ${db.settings.home ? '✓' : ''}</button></div>
  <div class="sec">Daten</div>
  <div class="g2"><button class="pill" data-a="export">Sichern</button><button class="pill" data-a="import">Wiederherstellen</button></div>
  <input type="file" id="imp" accept="application/json" hidden>
  <p class="mu">Alle Daten liegen nur auf diesem iPhone. Sichern öffnet das Teilen-Menü → „In Dateien sichern“ → iCloud Drive.${db.settings.lastBackup ? ' Letzte Sicherung: ' + fmtDate(db.settings.lastBackup) + '.' : ''}</p>
  <p class="mu" style="text-align:center;margin-top:18px">Vuelta · Version 19 · 20.11.2026</p>`;
}
function dockHTML() {
  /* Wie Fotos: links Gruppe, rechts eine Hauptaktion */
  const row = (left, a, label, icon, cls = '') => `<div class="drow">${left || '<span></span>'}<button class="cta ${cls}" data-a="${a}">${ic(icon, 18)}<span>${label}</span></button></div>`;
  const back = row('', 'back', 'Zurück', 'back', 'sec2');
  if (tab === 'fahrt') {
    if (sub === 'finden') return back;
    if (sub === 'tanken') return stations && stations.list && stations.list.length ? row(`<div class="grp"><button data-a="back">${ic('back', 18)}<span>Zurück</span></button></div>`, 'route', 'Route', 'navi') : back;
    return row(`<div class="rb"><button data-a="navwork" aria-label="Arbeit">${ic('work', 23)}</button><button data-a="navhome" aria-label="Zuhause">${ic('home', 23)}</button><button data-a="navfree" aria-label="Navi">${ic('locarrow', 23)}</button></div>`, 'start', 'Starten', 'vespa', 'go');
  }
  if (tab === 'fahrten' && sub === 'trip') return back;
  if (tab === 'fahrten') return row('', 'manualtrip', 'Nachtragen', 'plus');
  if (tab === 'logbuch') return row('', 'chooser', 'Eintrag', 'plus');
  return '';
}
/* Neue Version verfügbar: Hinweis oben mit Neu-laden-Button */
function updBar() {
  try { if (rec && rec.state === 'go') return; } catch (e) { }
  if (document.getElementById('upd')) return;
  const b = document.createElement('div'); b.id = 'upd';
  b.innerHTML = '<span>Neue Version verfügbar</span><button type="button">Neu laden</button>';
  b.querySelector('button').onclick = () => location.reload();
  document.body.appendChild(b);
}
const ORD = ['fahrt', 'fahrten', 'logbuch', 'mehr']; let sliding = false;
function slideTo(nt, dir, back) {
  const v = $('#view'), d = $('#dock'); if (sliding) return; sliding = true;
  v.style.transition = 'transform .17s cubic-bezier(.4,0,1,1), opacity .17s'; v.style.transform = `translateX(${-dir * 55}%)`; v.style.opacity = '0'; d.style.transition = 'opacity .17s'; d.style.opacity = '0';
  setTimeout(() => {
    tab = nt; sub = null; render(); window.scrollTo(0, 0);
    v.style.transition = 'none'; v.style.transform = `translateX(${dir * 45}%)`; v.offsetWidth;
    v.style.transition = 'transform .28s cubic-bezier(.15,.85,.25,1), opacity .28s'; v.style.transform = ''; v.style.opacity = ''; d.style.opacity = '';
    setTimeout(() => { sliding = false; }, 280);
  }, 170);
}
/* Goldene Glaskapsel unter dem gewählten Tab, gleitet beim Wechsel */
function moveInd() {
  const nav = $('#tabs'), on = nav && nav.querySelector('button.on'); if (!on) return;
  let ind = nav.querySelector('.ind'); if (!ind) { ind = document.createElement('i'); ind.className = 'ind'; nav.prepend(ind); }
  ind.style.left = on.offsetLeft + 'px'; ind.style.width = on.offsetWidth + 'px';
}
/* Aufbau-Animation: Linien zeichnen sich, Balken wachsen, Karten blenden ein.
   Nur bei Seiten-/Tabwechsel und wenn ein Element ins Bild scrollt, jeweils einmal. */
let animKey = '', animIO = null;
const reduceMotion = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
function animEl(card, delay) {
  if (card.dataset.an) return; card.dataset.an = '1';
  card.style.opacity = ''; card.style.animationDelay = delay + 'ms'; card.classList.add('an-in');
  card.querySelectorAll('svg path, svg polyline, svg line').forEach((p, i) => {
    const sw = p.getAttribute('stroke'), da = p.getAttribute('stroke-dasharray') || p.style.strokeDasharray;
    if (!sw || sw === 'none' || da || p.closest('.ic, .rl, button.c')) return;
    let L = 0; try { L = p.getTotalLength(); } catch (e) { } if (!L || L < 6) return;
    p.style.transition = 'none'; p.style.strokeDasharray = L + 'px ' + L + 'px'; p.style.strokeDashoffset = L + 'px'; void getComputedStyle(p).strokeDashoffset;
    const tr = `stroke-dashoffset ${Math.min(1700, 750 + L * 2.2)}ms cubic-bezier(.3,.7,.2,1) ${delay + 120 + Math.min(i, 12) * 45}ms`;
    requestAnimationFrame(() => { p.style.transition = tr; p.style.strokeDashoffset = '0px'; });
    setTimeout(() => { p.style.strokeDasharray = ''; p.style.strokeDashoffset = ''; p.style.transition = ''; }, delay + 3000);
  });
  card.querySelectorAll('svg rect').forEach((r, i) => { const h = +r.getAttribute('height'), w = +r.getAttribute('width'); if (!(h > 2 && w > 2) || r.getAttribute('fill') === 'none' || /rgba\(255,255,255,\.0/.test(r.getAttribute('fill') || '')) return;
    r.style.transition = 'none'; r.style.transformBox = 'fill-box'; r.style.transformOrigin = h > w ? '50% 100%' : '0 50%'; r.style.transform = h > w ? 'scaleY(0)' : 'scaleX(0)'; void getComputedStyle(r).transform;
    const tr = `transform 1050ms cubic-bezier(.3,.7,.2,1) ${delay + 140 + Math.min(i, 16) * 40}ms`; requestAnimationFrame(() => { r.style.transition = tr; r.style.transform = ''; }); });
}
function animView() {
  const key = tab + '|' + (sub || '') + '|' + (sub === 'trip' ? tripSel : '');
  const cards = [...document.querySelectorAll('#view .card, #view .t, #view .tiles > div')];
  if (reduceMotion() || (key === animKey && Date.now() - animView.at > 1500)) { cards.forEach(c => { c.dataset.an = '1'; c.style.opacity = ''; }); return; }
  /* noch nicht erschienene Elemente sind unsichtbar, bis sie ins Bild kommen */
  cards.forEach(c => { if (!c.dataset.an) c.style.opacity = '0'; });
  clearTimeout(animView.w);
  if (sliding) { animView.w = setTimeout(animView, 90); return; }   /* erst nach dem Seitenwechsel */
  if (key !== animKey) animView.at = Date.now(); animKey = key; if (animIO) animIO.disconnect();
  let n = 0;
  const base = 0;
  animIO = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { animIO.unobserve(e.target); animEl(e.target, base + (n++ % 5) * 90); } }), { rootMargin: '0px 0px -6% 0px' }) : null;
  cards.forEach(c => animIO ? animIO.observe(c) : animEl(c, 0));
  setTimeout(() => { n = 0; }, 1000);
}
function render() {
  const v = $('#view'), y = window.scrollY;
  v.innerHTML = ({ fahrt: viewFahrt, fahrten: () => sub === 'trip' ? viewTrip() : viewFahrten(), logbuch: viewLogbuch, mehr: viewMehr })[tab]();
  if (tab === 'fahrten' && sub === 'trip') initTripMap();
  /* Abschnitte gruppieren: Titel bleibt oben kleben, bis der nächste ihn hochschiebt */
  [...v.querySelectorAll(':scope > .sec')].forEach(h => { const sc = document.createElement('section'); sc.className = 'grp'; h.before(sc); let n = h; const list = []; while (n && (n === h || !n.classList || !n.classList.contains('sec'))) { list.push(n); n = n.nextSibling; } list.forEach(x => sc.appendChild(x)); });
  $('#dock').innerHTML = dockHTML();
  const nd = $('#dock').children.length; $('#view').style.paddingBottom = nd ? (nd > 1 ? '260px' : '190px') : '120px';
  document.querySelectorAll('#tabs button').forEach(b => b.classList.toggle('on', b.dataset.t === tab));
  moveInd(); requestAnimationFrame(() => window.dispatchEvent(new Event('scroll')));
  if (tab === 'fahrt' && sub === 'finden') { finderStart(); finderUpdate(); } else finderStop();
  window.scrollTo(0, y);
  animView();
}

/* ---------- Formulare ---------- */
function toast(t) { const e = $('#toast'); e.textContent = t; e.hidden = false; clearTimeout(toast.h); toast.h = setTimeout(() => e.hidden = true, 2400); }
function openSheet(title, fields, onOk, okText = 'Speichern') {
  const f = $('#sheetForm');
  f.innerHTML = `<h1>${esc(title)}</h1>` + fields.map(x => {
    if (x.type === 'check') return `<label class="chk"><input type="checkbox" name="${x.n}" ${x.v ? 'checked' : ''}>${esc(x.l)}</label>`;
    if (x.type === 'area') return `<label>${esc(x.l)}</label><textarea name="${x.n}" rows="3">${esc(x.v || '')}</textarea>`;
    return `<label>${esc(x.l)}</label><input name="${x.n}" type="${x.type || 'text'}" ${x.type === 'number' ? 'inputmode="decimal" step="any"' : ''} value="${esc(x.v == null ? '' : x.v)}">`;
  }).join('') + `<div class="grid" style="margin-top:20px"><button type="button" data-x="cancel">Abbrechen</button><button class="pri" type="submit">${okText}</button></div>`;
  $('#sheet').hidden = false;
  f.onsubmit = e => {
    e.preventDefault();
    const o = {};
    fields.forEach(x => { const el = f.elements[x.n]; o[x.n] = x.type === 'check' ? el.checked : x.type === 'number' ? (el.value === '' ? null : parseFloat(String(el.value).replace(',', '.'))) : el.value.trim(); });
    $('#sheet').hidden = true; onOk(o); save(); render();
  };
}
const closeSheet = () => $('#sheet').hidden = true;
const odoField = () => ({ n: 'odo', l: 'Kilometerstand (optional)', type: 'number', v: Math.round(currentOdo()) || '' });
function setOdo(o) { if (o != null && o > 0) { db.settings.odoBase = o; db.settings.odoDate = new Date().toISOString(); } }
function here(cb) {
  if (!navigator.geolocation) return toast('Kein GPS verfügbar');
  toast('Suche Standort …');
  navigator.geolocation.getCurrentPosition(p => cb({ lat: p.coords.latitude, lon: p.coords.longitude }), () => toast('Standort nicht verfügbar'), { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 });
}
function setPlace(k, label) { here(p => { db.settings[k] = p; db.settings.lastPos = p; save(); render(); toast(label + ' gespeichert'); }); }
function navTo(k, label) {
  const p = db.settings[k];
  if (!p) { if (confirm(label + ' ist noch nicht gespeichert. Jetzt den aktuellen Ort speichern?')) setPlace(k, label); return; }
  location.href = 'https://maps.apple.com/?daddr=' + p.lat + ',' + p.lon + '&dirflg=d';
}

const actions = {
  start: startTrip, stop: stopTrip,
  finden() { sub = 'finden'; render(); },
  back() { sub = null; render(); },
  opentrip(el) { tripSel = el.dataset.id; sub = 'trip'; render(); window.scrollTo(0, 0); },
  dismiss() { db.settings.notice = null; save(); render(); },
  lasttrip(el) { tab = 'fahrten'; tripSel = el.dataset.id; sub = 'trip'; render(); window.scrollTo(0, 0); },
  odophoto() { const i = $('#odoimg') || Object.assign(document.body.appendChild(document.createElement('input')), { type: 'file', id: 'odoimg', accept: 'image/*', hidden: true }); i.setAttribute('capture', 'environment'); i.value = ''; i.click(); },
  duesel(el) { dueSel = dueSel === el.dataset.id ? null : el.dataset.id; render(); },
  parknow() { here(p => { db.settings.parked = { lat: p.lat, lon: p.lon, t: new Date().toISOString() }; save(); render(); toast('Standort gemerkt'); }); },
  compass() {
    if (window.DeviceOrientationEvent && typeof DeviceOrientationEvent.requestPermission === 'function') DeviceOrientationEvent.requestPermission().then(r => toast(r === 'granted' ? 'Kompass aktiv' : 'Kompass abgelehnt')).catch(() => toast('Kompass nicht verfügbar'));
    else toast('Kompass ist aktiv');
  },
  maps() { const p = db.settings.parked; if (p) location.href = 'https://maps.apple.com/?daddr=' + p.lat + ',' + p.lon + '&dirflg=w'; },
  opentank() { sub = 'tanken'; stations = null; render(); if (db.settings.tkKey) fetchStations(); },
  async ppexport() {
    const y = new Date().getFullYear(), D = commuteDays(y), km = Math.round(db.settings.pendelKm || 0);
    const txt = 'Datum;Entfernung einfach (km);Pauschale (EUR)\n' + D.map(d => d.split('-').reverse().join('.') + ';' + km + ';' + (km * .38).toFixed(2).replace('.', ',')).join('\n') + '\nSumme;' + D.length + ' Tage;' + (D.length * km * .38).toFixed(2).replace('.', ',');
    const name = 'pendlerpauschale-' + y + '.csv';
    try { const f = new File([txt], name, { type: 'text/csv' }); if (navigator.canShare && navigator.canShare({ files: [f] })) { await navigator.share({ files: [f], title: 'Pendlerpauschale ' + y }); return; } } catch (e) { if (e && e.name === 'AbortError') return; }
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([txt], { type: 'text/csv' })); a.download = name; a.click();
  },
  rvs(el) { rvSel[el.dataset.d] = +el.dataset.i; render(); },
  rtroute() { const x = routeSt && routeSt.list[0]; if (x) location.href = 'https://maps.apple.com/?daddr=' + x.lat + ',' + x.lon + '&dirflg=d'; },
  nfccopy() { const u = location.origin + location.pathname + '?start'; try { navigator.clipboard.writeText(u); toast('Link kopiert'); } catch (e) { toast(u); } },
  tks(el) { db.settings.tkSort = el.dataset.f; save(); render(); },
  tkmore() { if (stations) stations.all = true; render(); },
  route(el) { const s = stations && stations.list && stations.list[+el.dataset.i || 0]; if (s) location.href = 'https://maps.apple.com/?daddr=' + s.lat + ',' + s.lon + '&dirflg=d'; },
  navwork() { navTo('work', 'Arbeit'); }, navhome() { navTo('home', 'Zuhause'); },
  navfree() { openSheet('Navigation', [{ n: 'dest', l: 'Ziel (Adresse oder Ort), Start ist dein Standort', v: '' }], o => { const q = (o.dest || '').trim(); if (!q) return toast('Ziel fehlt'); location.href = 'https://maps.apple.com/?dirflg=d&daddr=' + encodeURIComponent(q); }, 'Los'); },
  setcat(el) { const t = db.trips.find(x => x.id === el.dataset.id); if (!t) return; t.cat = el.dataset.v; save(); hap(1); render(); toast(t.cat === 'pendel' ? 'Pendel' : 'Freizeit'); },
  voice() { db.settings.voice = !db.settings.voice; save(); if (db.settings.voice) say('Sprachansage an'); render(); },
  setwork() { setPlace('work', 'Arbeit'); }, sethome() { setPlace('home', 'Zuhause'); },
  ff(el) { fFilter = el.dataset.f; render(); }, lf(el) { lFilter = el.dataset.f; render(); },
  chooser() {
    const f = $('#sheetForm');
    f.innerHTML = `<h1>Neuer Eintrag</h1><div style="display:grid;gap:10px;margin-top:14px">${['tank', 'service', 'reifen', 'notiz'].map(k => `<button type="button" data-a="${k}" style="text-align:left;display:flex;gap:12px;align-items:center">${ic(LT[k][1], 20)} ${LT[k][0]}</button>`).join('')}</div><div class="grid" style="margin-top:16px"><button type="button" data-x="cancel">Abbrechen</button></div>`;
    f.onsubmit = e => e.preventDefault(); $('#sheet').hidden = false;
  },
  tank() { openSheet('Tanken', [{ n: 'date', l: 'Datum', type: 'date', v: today() }, { n: 'liters', l: 'Liter', type: 'number' }, { n: 'eur', l: 'Betrag (€)', type: 'number' }, odoField(), { n: 'full', l: 'Voll getankt', type: 'check', v: true }],
    o => { if (!o.liters) return toast('Liter fehlen'); db.logs.push({ id: uid(), type: 'tank', date: o.date || today(), liters: o.liters, eur: o.eur || 0, odo: o.odo, full: o.full }); setOdo(o.odo); toast('Gespeichert'); }); },
  service() { openSheet('Service / Reparatur', [{ n: 'date', l: 'Datum', type: 'date', v: today() }, { n: 'text', l: 'Was wurde gemacht?', type: 'area' }, { n: 'eur', l: 'Kosten (€)', type: 'number' }, odoField()],
    o => { db.logs.push({ id: uid(), type: 'service', date: o.date || today(), text: o.text, eur: o.eur || 0, odo: o.odo }); setOdo(o.odo); }); },
  reifen() { openSheet('Reifendruck', [{ n: 'date', l: 'Datum', type: 'date', v: today() }, { n: 'front', l: 'Vorne (bar)', type: 'number' }, { n: 'rear', l: 'Hinten (bar)', type: 'number' }],
    o => { db.logs.push({ id: uid(), type: 'reifen', date: o.date || today(), front: o.front, rear: o.rear }); toast('Gespeichert'); }); },
  notiz() { openSheet('Notiz', [{ n: 'date', l: 'Datum', type: 'date', v: today() }, { n: 'text', l: 'Notiz', type: 'area' }], o => { if (o.text) db.logs.push({ id: uid(), type: 'notiz', date: o.date || today(), text: o.text }); }); },
  dellog(el) { if (confirm('Eintrag löschen?')) { db.logs = db.logs.filter(l => l.id !== el.dataset.id); save(); render(); } },
  deltrip(el) { if (confirm('Fahrt löschen?')) { db.trips = db.trips.filter(l => l.id !== el.dataset.id); sub = null; save(); render(); } },
  manualtrip() { openSheet('Fahrt nachtragen', [{ n: 'date', l: 'Datum', type: 'date', v: today() }, { n: 'km', l: 'Kilometer', type: 'number', v: db.settings.pendelKm }, { n: 'min', l: 'Dauer (Minuten)', type: 'number', v: 25 }],
    o => { if (!o.km) return; const s = new Date((o.date || today()) + 'T08:00:00'); const dur = (o.min || 20) * 60;
      db.trips.push({ id: uid(), start: s.toISOString(), end: new Date(+s + dur * 1000).toISOString(), km: o.km, dur, max: 0, avg: Math.round(o.km / (dur / 3600)), temp: null, code: null, commute: true });
      db.trips.sort((a, b) => b.start.localeCompare(a.start)); }); },
  settings() { openSheet('Einstellungen', [{ n: 'odo', l: 'Aktueller Kilometerstand (Tacho)', type: 'number', v: Math.round(currentOdo()) }, { n: 'pk', l: 'Pendelstrecke einfach (km)', type: 'number', v: db.settings.pendelKm }, { n: 'tank', l: 'Tankgröße (Liter)', type: 'number', v: db.settings.tank }, { n: 'tk', l: 'Tankerkönig-Schlüssel (optional)', v: db.settings.tkKey }, { n: 'etaF', l: 'Eigener Zeitfaktor (1 = 25 km/h, nur ohne genug eigene Fahrten)', type: 'number', v: db.settings.etaF || 1 }, { n: 'needle', l: 'Nadel im Tacho anzeigen', type: 'check', v: db.settings.needle }],
    o => { setOdo(o.odo); if (o.pk) db.settings.pendelKm = o.pk; if (o.tank) db.settings.tank = o.tank; db.settings.tkKey = o.tk || ''; db.settings.needle = o.needle; if (+o.etaF > 0) db.settings.etaF = +String(o.etaF).replace(',', '.'); stations = null; }); },
  newrem() { remForm({ id: uid(), name: '', everyKm: 0, everyMonths: 0, lastOdo: Math.round(currentOdo()), lastDate: today() }, true); },
  editrem(el) { remForm(db.reminders.find(r => r.id === el.dataset.id)); },
  donerem(el) {
    const r = db.reminders.find(x => x.id === el.dataset.id);
    if (r.dueDate !== undefined && !r.everyKm && !r.everyMonths) return remForm(r);
    r.lastOdo = Math.round(currentOdo()); r.lastDate = today(); save(); render(); toast(r.name + ' erledigt');
  },
  async export() {
    const name = 'vuelta-sicherung-' + today() + '.json', txt = JSON.stringify(db, null, 1);
    const done = () => { db.settings.lastBackup = new Date().toISOString(); save(); render(); };
    try {
      const f = new File([txt], name, { type: 'application/json' });
      if (navigator.canShare && navigator.canShare({ files: [f] })) { await navigator.share({ files: [f], title: 'Vuelta Sicherung' }); toast('Gesichert'); return done(); }
    } catch (e) { if (e && e.name === 'AbortError') return; }
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([txt], { type: 'application/json' })); a.download = name; a.click(); done();
  },
  import() { $('#imp').click(); }
};
/* Tacho-Foto: verkleinert speichern, Zahl per Texterkennung vorschlagen, bestätigen */
async function odoFromPhoto(file) {
  const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = URL.createObjectURL(file); });
  const sc = Math.min(1, 900 / Math.max(img.width, img.height)), cv = document.createElement('canvas');
  cv.width = Math.round(img.width * sc); cv.height = Math.round(img.height * sc); cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
  const data = cv.toDataURL('image/jpeg', .72), cur = Math.round(currentOdo());
  let guess = null;
  toast('Lese Kilometerstand …');
  try {
    if (!window.Tesseract) await new Promise((res, rej) => { const s = document.createElement('script'); s.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js'; s.onload = res; s.onerror = rej; document.head.appendChild(s); });
    const g = document.createElement('canvas'); g.width = cv.width; g.height = cv.height; const x = g.getContext('2d'); x.filter = 'grayscale(1) contrast(1.8)'; x.drawImage(cv, 0, 0);
    const r = await Tesseract.recognize(g, 'eng', { tessedit_char_whitelist: '0123456789' });
    const nums = (r.data.text.match(/\d{3,6}/g) || []).map(Number).filter(n => n >= 100);
    if (nums.length) guess = nums.sort((a, b) => Math.abs(a - cur) - Math.abs(b - cur))[0];
  } catch (e) { }
  openSheet('Kilometerstand', [{ n: 'odo', l: guess ? 'Erkannt – bitte prüfen' : 'Nicht erkannt – bitte eintippen', type: 'number', v: guess || cur }], o => {
    if (!o.odo) return;
    setOdo(o.odo); db.settings.odoCheck = new Date().toISOString(); db.settings.odoPhoto = { t: new Date().toISOString(), odo: o.odo, img: data };
    toast('Kilometerstand angeglichen');
  }, 'Übernehmen');
}
function remForm(r, isNew) {
  const fields = [{ n: 'name', l: 'Name', v: r.name }, { n: 'everyKm', l: 'Alle … km (0 = aus)', type: 'number', v: r.everyKm || 0 }, { n: 'everyMonths', l: 'Alle … Monate (0 = aus)', type: 'number', v: r.everyMonths || 0 }, { n: 'dueDate', l: 'Oder festes Fälligkeitsdatum', type: 'date', v: r.dueDate || '' }];
  openSheet(isNew ? 'Neue Erinnerung' : r.name, fields, o => {
    r.name = o.name || 'Erinnerung'; r.everyKm = o.everyKm || 0; r.everyMonths = o.everyMonths || 0; r.dueDate = o.dueDate || (r.dueDate !== undefined && !r.everyKm && !r.everyMonths ? '' : undefined);
    if (!o.dueDate) delete r.dueDate;
    if (isNew) db.reminders.push(r);
  });
}

/* ---------- Start ---------- */
/* Zwei-Finger-Zoom und -Verschieben für SVG-Karten (.zm), Doppeltipp setzt zurück */
function zoomable() {
  let z = null;
  document.addEventListener('touchstart', e => { const el = e.target.closest('.zm'); if (!el || e.touches.length !== 2) return; const g = el.firstElementChild, a = e.touches[0], b = e.touches[1], st = el._z || { s: 1, x: 0, y: 0 }; z = { el, g, st: { ...st }, d0: Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY), c0: [(a.clientX + b.clientX) / 2, (a.clientY + b.clientY) / 2], r: el.getBoundingClientRect() }; }, { passive: true });
  document.addEventListener('touchmove', e => { if (!z || e.touches.length !== 2) return; e.preventDefault(); const a = e.touches[0], b = e.touches[1], d = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY), c = [(a.clientX + b.clientX) / 2, (a.clientY + b.clientY) / 2];
    const s = Math.max(1, Math.min(6, z.st.s * d / z.d0)), px = z.c0[0] - z.r.left, py = z.c0[1] - z.r.top, k = s / z.st.s;
    let x = px - (px - z.st.x) * k + (c[0] - z.c0[0]), y = py - (py - z.st.y) * k + (c[1] - z.c0[1]); const w = z.r.width, h = z.r.height; x = Math.min(0, Math.max(w - w * s, x)); y = Math.min(0, Math.max(h - h * s, y));
    z.el._z = { s, x, y }; z.g.style.transform = `translate(${x}px,${y}px) scale(${s})`; }, { passive: false });
  document.addEventListener('touchend', e => { if (z && e.touches.length < 2) z = null; }, { passive: true });
  let lt = 0; document.addEventListener('touchend', e => { const el = e.target.closest('.zm'); if (!el || e.changedTouches.length !== 1) return; const n = Date.now(); if (n - lt < 300) { el._z = null; el.firstElementChild.style.transition = 'transform .25s'; el.firstElementChild.style.transform = ''; setTimeout(() => el.firstElementChild.style.transition = '', 260); } lt = n; }, { passive: true });
}
function init() {
  load(); save(); zoomable();
  if (/[?&#]start\b/.test(location.search + location.hash)) { history.replaceState(null, '', location.pathname); setTimeout(() => { if (!rec) startTrip(); }, 400); }
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-t]'); if (t && t.closest('#tabs')) { const a = ORD.indexOf(tab), b = ORD.indexOf(t.dataset.t); if (a === b && !sub) return; slideTo(t.dataset.t, b >= a ? 1 : -1); return; }
    if (e.target.dataset.x === 'cancel' || e.target.classList.contains('sheet-bg')) return closeSheet();
    const a = e.target.closest('[data-a]'); if (a && actions[a.dataset.a]) { if (a.dataset.a === 'start') hap(2); if (['tank', 'service', 'reifen', 'notiz'].includes(a.dataset.a)) closeSheet(); actions[a.dataset.a](a); }
  });
  document.addEventListener('change', e => {
    if (e.target.id === 'odoimg' && e.target.files[0]) return odoFromPhoto(e.target.files[0]);
    if (e.target.id !== 'imp' || !e.target.files[0]) return;
    const rd = new FileReader();
    rd.onload = () => { try { const j = JSON.parse(rd.result); if (!j.trips || !j.logs) throw 0; db = j; load2(); toast('Wiederhergestellt'); } catch (x) { toast('Datei ungültig'); } };
    rd.readAsText(e.target.files[0]);
  });
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && !rec) { fetchForecast(); render(); } });
  $('#view').insertAdjacentHTML('beforebegin', '<div id="hdrbox">' + HDR + '</div>');
  document.body.insertAdjacentHTML('beforeend', '<div id="topblur"></div>');
  /* Hauptbutton wird beim Scrollen zu Glas */
  const lg = $('#hdrbox img');
  const onSc = () => { const y = window.scrollY, was = document.body.classList.contains('scrolled'); document.body.classList.toggle('scrolled', y > 8); if (was !== (y > 8)) { moveInd(); setTimeout(moveInd, 160); setTimeout(moveInd, 340); } document.body.classList.toggle('scr2', y > 30); if (lg) { lg.style.filter = `blur(${Math.min(10, y / 10).toFixed(1)}px)`; lg.style.opacity = Math.max(.25, 1 - y / 220).toFixed(2); } }; window.addEventListener('scroll', onSc, { passive: true }); window.addEventListener('resize', moveInd); $('#tabs').addEventListener('transitionend', moveInd);
  document.querySelectorAll('#tabs button').forEach(b => { const t = b.textContent.trim(); b.innerHTML = '<span>' + t + '</span>'; });
  const TI = { fahrt: 'speed', fahrten: 'route', logbuch: 'note' };
  document.querySelectorAll('#tabs button').forEach(b => b.insertAdjacentHTML('afterbegin', TI[b.dataset.t] ? ic(TI[b.dataset.t], 20) : ic('grid', 20)));
  /* Wischen zwischen den Seiten: Inhalt folgt dem Finger (nur Mitte, nicht im Fahrmodus) */
  let sw = null; const V = $('#view');
  document.addEventListener('touchstart', e => { const t = e.touches[0]; sw = (e.touches.length === 1 && !e.target.closest('.mlmap,.zm') && !rec && !sliding && $('#sheet').hidden && t.clientX > 28 && t.clientX < innerWidth - 28) ? { x: t.clientX, y: t.clientY, at: Date.now(), h: null } : null; }, { passive: true });
  document.addEventListener('touchmove', e => {
    if (!sw) return; const t = e.touches[0], dx = t.clientX - sw.x, dy = t.clientY - sw.y;
    if (sw.h === null && (Math.abs(dx) > 10 || Math.abs(dy) > 10)) sw.h = Math.abs(dx) > Math.abs(dy) * 1.3;
    if (!sw.h) return;
    const i = ORD.indexOf(tab) + (dx < 0 ? 1 : -1), edge = !sub && (i < 0 || i >= ORD.length);
    const x = edge ? dx * .25 : dx; V.style.transition = 'none'; V.style.transform = `translateX(${x}px)`; V.style.opacity = String(1 - Math.min(.5, Math.abs(x) / innerWidth));
  }, { passive: true });
  document.addEventListener('touchend', e => {
    if (!sw) return; const t = e.changedTouches[0], dx = t.clientX - sw.x, h = sw.h, fast = Date.now() - sw.at < 300; sw = null;
    if (!h) return;
    const go = Math.abs(dx) > innerWidth * .28 || (fast && Math.abs(dx) > 50);
    if (go && sub && dx > 0) { slideTo(tab, -1, true); return; }
    const i = ORD.indexOf(tab) + (dx < 0 ? 1 : -1);
    if (go && !sub && i >= 0 && i < ORD.length) return slideTo(ORD[i], dx < 0 ? 1 : -1);
    V.style.transition = 'transform .25s cubic-bezier(.2,.8,.2,1), opacity .25s'; V.style.transform = ''; V.style.opacity = '';
  }, { passive: true });
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    const hadSw = !!navigator.serviceWorker.controller;
    navigator.serviceWorker.register('sw.js').then(reg => {
      if (hadSw) navigator.serviceWorker.addEventListener('controllerchange', updBar);
      document.addEventListener('visibilitychange', () => { if (!document.hidden) reg.update().catch(() => { }); });
    }).catch(() => { });
  }
  render();
}
function load2() { db.reminders = db.reminders || []; db.settings = Object.assign(defaults().settings, db.settings || {}); save(); render(); }
init();
