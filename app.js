'use strict';
/* Q'vuelta – GTS Super 125 (2022). Alle Daten bleiben lokal im Browser (localStorage). */
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
  route: '<path d="M5 19V5M5 5l-2 3M5 5l2 3M19 19V9M7 19h10"/>',
  speed: '<path d="M4 17a8 8 0 1 1 16 0M12 17l4-6"/>',
  cal: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>',
  bolt: '<path d="M13 2L5 14h6l-1 8 8-12h-6z"/>',
  navi: '<path d="M12 3l7 17-7-4-7 4z"/>',
  city: '<path d="M4 21V9l6-3v15M10 21V4l8 3v14M3 21h18M13 10h2M13 14h2M7 12h1M7 16h1"/>',
  land: '<path d="M12 3l5 8h-3l4 6H6l4-6H7zM12 17v4"/>',
  oil: '<path d="M3 12h11v7H3zM14 14h3l4-4M6 12V9h6v3M20 15c.9 1.3 1.4 2 1.4 2.7a1.4 1.4 0 0 1-2.8 0c0-.7.5-1.4 1.4-2.7z"/>',
  bab: '<path d="M2.5 21L8.5 3M21.5 21L15.5 3M12 3.5v3.5M12 10v4M12 17v4"/>',
  wrench: '<path d="M14.5 6.5a4 4 0 0 0-5 5L3 18l3 3 6.5-6.5a4 4 0 0 0 5-5l-3 3-2-2z"/>',
  tire: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/><path d="M12 3v6M12 15v6M3 12h6M15 12h6"/>',
  note: '<path d="M6 3h9l4 4v14H6zM9 12h7M9 16h7"/>',
  wind: '<path d="M3 9h11a3 3 0 1 0-3-3M3 15h14a3 3 0 1 1-3 3"/>'
};
const ic = (n, s = 15) => (s -= 1,  `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${IP[n]}</svg>`);

/* ---------- Daten ---------- */
function defaults() {
  return {
    trips: [], logs: [],
    settings: { pendelKm: 9, odoBase: 0, odoDate: new Date().toISOString(), tank: 7, needle: true, work: null, home: null, parked: null, tkKey: '', lastPos: null },
    reminders: [
      { id: uid(), name: 'Ölwechsel', everyKm: 10000, everyMonths: 12, lastOdo: 0, lastDate: today() },
      { id: uid(), name: 'Inspektion', everyKm: 10000, everyMonths: 12, lastOdo: 0, lastDate: today() },
      { id: uid(), name: 'Variator / Riemen', everyKm: 20000, everyMonths: 0, lastOdo: 0, lastDate: today() },
      { id: uid(), name: 'HU / TÜV', everyKm: 0, everyMonths: 0, dueDate: '' }
    ]
  };
}
let db;
function load() {
  try { db = JSON.parse(localStorage.getItem(KEY)) || defaults(); } catch (e) { db = defaults(); }
  db.trips = db.trips || []; db.logs = db.logs || []; db.reminders = db.reminders || [];
  db.settings = Object.assign(defaults().settings, db.settings || {});
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
    const r = await fetch('https://api.open-meteo.com/v1/forecast?latitude=' + lat + '&longitude=' + lon + '&current=temperature_2m,weather_code');
    const j = await r.json();
    return { temp: j.current.temperature_2m, code: j.current.weather_code };
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
    const r = await fetch('https://api.open-meteo.com/v1/forecast?latitude=' + p.lat + '&longitude=' + p.lon + '&current=temperature_2m,weather_code&hourly=temperature_2m,precipitation&forecast_hours=4&timezone=auto');
    const j = await r.json();
    const warns = [], cur = j.current, h = j.hourly;
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
    fc = { at: Date.now(), warns, temp: cur.temperature_2m, code: cur.weather_code };
    if (tab === 'fahrt' && !sub && !rec) render();
  } catch (e) { }
}
/* Tankstellen (Tankerkönig, eigener kostenloser Schlüssel nötig) */
let stations = null;
async function fetchStations() {
  const k = db.settings.tkKey;
  if (!k) { stations = { err: 'key' }; return; }
  stations = { loading: true }; render();
  const pos = await new Promise(res => navigator.geolocation ? navigator.geolocation.getCurrentPosition(p => res({ lat: p.coords.latitude, lon: p.coords.longitude }), () => res(null), { timeout: 8000, maximumAge: 60000 }) : res(null));
  const p = pos || db.settings.lastPos || { lat: 52.52, lon: 13.4 };
  try {
    const r = await fetch('https://creativecommons.tankerkoenig.de/json/list.php?lat=' + p.lat + '&lng=' + p.lon + '&rad=5&sort=price&type=e10&apikey=' + encodeURIComponent(k));
    const j = await r.json();
    if (!j.ok) throw 0;
    stations = { at: Date.now(), list: (j.stations || []).filter(s => s.isOpen && s.price).slice(0, 3).map(s => ({ n: s.brand || s.name, price: s.price, dist: s.dist, lat: s.lat, lon: s.lng })) };
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
const ZCOL = ['#f2c14e', '#ff7a1a', '#e0242c'];
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
    fetchAqi(pt.lat, pt.lon).then(a => { if (rec) rec.aqi = a; });
  }
  if (!rec.last) { rec.last = pt; return; }
  const d = hav(rec.last, pt), dt = (pt.t - rec.last.t) / 1000;
  if (dt <= 0) return;
  const raw = d / dt * 3.6;
  const v = c.speed != null && c.speed >= 0 ? c.speed * 3.6 : raw;
  if (d < 5) { rec.speed = v < 4 ? 0 : v; return; }
  if (raw > 130) return;
  if (c.heading == null || isNaN(c.heading)) rec.heading = bearing(rec.last, pt);
  if (!rec.lastRt || hav(rec.lastRt, pt) >= 15) { rec.route.push([+pt.lat.toFixed(5), +pt.lon.toFixed(5)]); rec.lastRt = pt; }
  rec.m += d; rec.zm[zoneOf(v)] += d; rec.speed = v; rec.max = Math.max(rec.max, v); rec.last = pt;
}
async function startTrip() {
  if (!navigator.geolocation) return toast('Kein GPS verfügbar');
  rec = { route: [], lastRt: null, stop: 0, start: new Date().toISOString(), m: 0, zm: [0, 0, 0], speed: 0, max: 0, last: null, weather: null, acc: null, hist: [], heading: null, upd: 0, aqi: null };
  watchId = navigator.geolocation.watchPosition(onPos, e => toast('GPS: ' + (e.code === 1 ? 'Zugriff verweigert' : 'kein Signal')), { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 });
  try { if (navigator.wakeLock) wake = await navigator.wakeLock.request('screen'); } catch (e) { }
  document.addEventListener('visibilitychange', reWake);
  mountDrive();
  render();
}
async function reWake() {
  if (document.visibilityState === 'visible' && rec && navigator.wakeLock) { try { wake = await navigator.wakeLock.request('screen'); } catch (e) { } }
}
function stopTrip() {
  if (!rec) return;
  navigator.geolocation.clearWatch(watchId);
  try { wake && wake.release(); } catch (e) { }
  document.removeEventListener('visibilitychange', reWake);
  unmountDrive();
  const end = new Date(), dur = (end - new Date(rec.start)) / 1000, km = rec.m / 1000;
  const r = rec; rec = null;
  if (r.pos) { db.settings.lastPos = r.pos; if (km >= 0.1) db.settings.parked = { lat: r.pos.lat, lon: r.pos.lon, t: end.toISOString() }; }
  if (km < 0.1) { save(); toast('Zu kurz – nicht gespeichert'); return render(); }
  const pk = db.settings.pendelKm, B = 24, sp = [];
  if (r.hist.length) for (let i = 0; i < B; i++) {
    const a = Math.floor(i * r.hist.length / B), b = Math.max(a + 1, Math.floor((i + 1) * r.hist.length / B));
    const s = r.hist.slice(a, b); sp.push(Math.round(s.reduce((x, y) => x + y.v, 0) / s.length));
  }
  const ds = (a, n) => { if (a.length <= n) return a.slice(); const o = []; for (let i = 0; i < n; i++) { const x = Math.floor(i * a.length / n), y = Math.max(x + 1, Math.floor((i + 1) * a.length / n)); o.push(a.slice(x, y)); } return o; };
  const ser = ds(r.hist.map(x => x.v), 120).map(x => Array.isArray(x) ? Math.round(x.reduce((a, b) => a + b, 0) / x.length) : x);
  const trip = {
    ser, route: ds(r.route, 150).map(x => Array.isArray(x[0]) ? x[Math.floor(x.length / 2)] : x), stop: r.stop, aqi: r.aqi,
    id: uid(), start: r.start, end: end.toISOString(), km: Math.round(km * 100) / 100, dur: Math.round(dur),
    max: Math.round(r.max), avg: Math.round(km / (dur / 3600)), temp: r.weather ? r.weather.temp : null, code: r.weather ? r.weather.code : null,
    commute: km > pk * 0.6 && km < pk * 1.6, zk: r.zm.map(x => Math.round(x / 10) / 100), spark: sp
  };
  db.trips.unshift(trip); save(); toast('Fahrt gespeichert: ' + nf(km) + ' km'); render();
}
const liveKm = () => rec ? rec.m / 1000 : 0;

/* ---------- Fahrmodus (Vollbild, Touch-Sperre, 2 s halten zum Beenden) ---------- */
const P = (r, deg) => { const a = deg * Math.PI / 180; return [170 + r * Math.cos(a), 170 + r * Math.sin(a)]; };
const arcd = (r, d1, d2) => { const [x1, y1] = P(r, d1), [x2, y2] = P(r, d2); return `M${x1.toFixed(1)} ${y1.toFixed(1)} A${r} ${r} 0 ${Math.abs(d2 - d1) > 180 ? 1 : 0} 1 ${x2.toFixed(1)} ${y2.toFixed(1)}`; };
const ease = x => x < 0 ? 0 : x > 1 ? 1 : x * x * (3 - 2 * x);
function dialSVG(hi) {
  let s = `<svg id="dsv" viewBox="-10 -10 360 330"><defs>
  <linearGradient id="bz" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5a5c60"/><stop offset=".18" stop-color="#2a2b2e"/><stop offset=".4" stop-color="#101113"/><stop offset=".62" stop-color="#3a3b3f"/><stop offset=".8" stop-color="#141517"/><stop offset="1" stop-color="#4a4b4f"/></linearGradient>
  <linearGradient id="bz2" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#050505"/><stop offset=".5" stop-color="#1b1c1e"/><stop offset="1" stop-color="#060606"/></linearGradient>
  <filter id="gl" filterUnits="userSpaceOnUse" x="-10" y="-10" width="360" height="330"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
  <circle cx="170" cy="170" r="150" fill="url(#bz)"/><circle cx="170" cy="170" r="149" fill="none" stroke="#7a7c80" stroke-width="1" opacity=".55"/><circle cx="170" cy="170" r="144" fill="url(#bz2)"/><circle cx="170" cy="170" r="139.5" fill="none" stroke="#000" stroke-width="3"/><circle cx="170" cy="170" r="138" fill="#050505"/>`;
  for (let v = 0; v < hi; v += 10) {
    const d1 = 135 + 270 * v / hi + 1.3, d2 = 135 + 270 * (v + 10) / hi - 1.3;
    s += `<path id="sg${v}" d="${arcd(162, d1, d2)}" stroke="#1c1c1c" stroke-width="9" fill="none"/><path id="sf${v}" d="" stroke="${zcol(v)}" stroke-width="9" fill="none"/><path id="sa${v}" d="${arcd(168, d1, d2)}" stroke="#fff" stroke-width="2" fill="none" opacity="0"/>`;
  }
  for (let v = 0; v <= hi; v++) {
    const ang = 135 + 270 * v / hi, maj = v % 10 === 0, mid = v % 5 === 0 && !maj;
    const [r1, r2] = maj ? [114, 134] : mid ? [122, 134] : [128, 134];
    const [x1, y1] = P(r1, ang), [x2, y2] = P(r2, ang);
    s += `<line id="tk${v}" x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${maj ? '#d8d8d8' : '#555'}" stroke-width="${maj ? 3.4 : mid ? 1.8 : 1}" opacity="0"/>`;
  }
  for (let v = 0; v <= hi; v += 20) { const [x, y] = P(92, 135 + 270 * v / hi); s += `<text id="nm${v}" x="${x.toFixed(1)}" y="${(y + 7).toFixed(1)}" fill="#cfcfcf" font-size="20" text-anchor="middle" font-family="-apple-system,BlinkMacSystemFont,Helvetica Neue,sans-serif" opacity="0">${v}</text>`; }
  s += `<circle cx="170" cy="170" r="58" fill="none" stroke="#2a2a2a" stroke-width="1.5"/>`;
  for (let i = 0; i <= 60; i++) { const a = 120 - i, [x1, y1] = P(116, a), [x2, y2] = P(124, a); s += `<line id="fu${i}" x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#2a2a2a" stroke-width="1.1"/>`; }
  [[0, '#e0242c'], [.5, '#ddd'], [1, '#ddd']].forEach(([f, c]) => { const a = 120 - 60 * f, [x1, y1] = P(112, a), [x2, y2] = P(128, a); s += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${c}" stroke-width="1.6"/>`; });
  const ff = 'font-family="-apple-system,BlinkMacSystemFont,Helvetica Neue,sans-serif"';
  let [ex, ey] = P(96, 115), [fx, fy] = P(96, 65);
  s += `<text x="${ex.toFixed(0)}" y="${(ey + 4).toFixed(0)}" fill="#8c8c8c" font-size="11" text-anchor="middle" ${ff}>E</text><text x="${fx.toFixed(0)}" y="${(fy + 4).toFixed(0)}" fill="#8c8c8c" font-size="11" text-anchor="middle" ${ff}>F</text>`;
  s += `<text id="rng" x="170" y="240" fill="#8c8c8c" font-size="11" text-anchor="middle" ${ff}></text>`;
  s += `<g id="ndl" transform="rotate(135 170 170)" opacity="0"><line x1="232" y1="170" x2="304" y2="170" stroke="rgba(255,150,30,.55)" stroke-width="11" stroke-linecap="round" filter="url(#gl)"/><line x1="232" y1="170" x2="304" y2="170" stroke="#ffbb33" stroke-width="9" stroke-linecap="round"/><line x1="232" y1="170" x2="304" y2="170" stroke="#ffe08a" stroke-width="2.5" stroke-linecap="round" opacity=".55"/></g>`;
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
    f.setAttribute('d', vis && dv > v && e > d1 ? arcd(162, d1, e) : '');
    G('sg' + v).setAttribute('opacity', vis ? 1 : 0);
    G('sa' + v).setAttribute('opacity', avg != null && vis && avg >= v && avg < v + 10 ? 1 : 0);
  }
  for (let v = 0; v <= hi; v++) {
    const t = G('tk' + v), vis = v <= reach;
    t.setAttribute('opacity', vis ? 1 : 0);
    if (vis) t.setAttribute('stroke', v <= dv ? zcol(v) : (v % 10 === 0 ? '#d8d8d8' : '#555'));
  }
  for (let v = 0; v <= hi; v += 20) { const n = G('nm' + v); n.setAttribute('opacity', v <= reach ? 1 : 0); n.setAttribute('fill', v <= dv ? zcol(v) : '#cfcfcf'); }
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
  const grid = (a, b) => { let s = ''; for (let y = a; y < b; y += 6) s += `<line x1="${x0}" y1="${y}" x2="${x1}" y2="${y}" stroke="#1d1d1d"/>`; return s; };
  let s = `<svg width="100%" viewBox="0 0 ${W} ${H}">${grid(4, 28)}${grid(38, 62)}<line x1="${x0}" y1="28" x2="${x1}" y2="28" stroke="#444" stroke-width="1.2"/><line x1="${x0}" y1="48" x2="${x1}" y2="48" stroke="#555" stroke-width="1"/>`;
  const sp = h.map(x => [X(x.t), yv(x.v)]), ac = h.map((x, i) => [X(x.t), ya(i ? x.v - h[i - 1].v : 0)]);
  if (sp.length > 1) {
    s += `<path d="${bez(sp)}" fill="none" stroke="#f2f2f2" stroke-width="2.2" stroke-linejoin="round"/>`;
    s += `<defs><clipPath id="neg"><rect x="${x0}" y="48" width="${x1 - x0}" height="16"/></clipPath></defs><path d="${bez(ac)}" fill="none" stroke="#f2c14e" stroke-width="2"/><path d="${bez(ac)}" fill="none" stroke="#4fae80" stroke-width="2.4" clip-path="url(#neg)"/>`;
  }
  if (avg != null) s += `<line x1="${x0}" y1="${yv(avg).toFixed(1)}" x2="${x1}" y2="${yv(avg).toFixed(1)}" stroke="#f2c14e" stroke-width="1.1" stroke-dasharray="4 4"/>`;
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
  let w = Math.min(360, innerWidth - 24); s.style.width = w + 'px'; s.style.height = 'auto';
  for (let i = 0; i < 12 && el.scrollHeight > el.clientHeight + 1 && w > 220; i++) { w -= Math.max(6, Math.ceil((el.scrollHeight - el.clientHeight) * 1.05)); s.style.width = w + 'px'; }
}
function mountDrive() {
  const el = $('#drive'); el.hidden = false; document.body.style.overflow = 'hidden';
  drv = { hi: 100, dv: 0, reach: -1, t0: performance.now(), introDone: false, last: null, sec: 0, hold: 0, faded: false, avgKm: 0 };
  el.innerHTML = `<div class="top"><div><b class="tm" id="dClock"></b><span id="dDate"></span></div><span class="rec"><i></i>AUFN.</span></div>
  <div class="chrow"><div class="chips fade" id="dChips"></div><span class="svc" id="dSvc"><button class="ib" data-sv="Ölwechsel"></button><button class="ib" data-sv="Inspektion"></button></span></div>
  <div class="pop" id="dPop" hidden></div>
  <div class="dialbox" id="dBox"><img class="logo" id="dLogo" src="logo.png" alt=""></div>
  <div id="holdOv"><svg viewBox="0 0 240 240" width="240" height="240"><circle cx="120" cy="120" r="100" fill="rgba(0,0,0,.82)" stroke="#2a2a2a" stroke-width="10"/><circle id="holdP" cx="120" cy="120" r="100" fill="none" stroke="#e0242c" stroke-width="10" stroke-linecap="round" stroke-dasharray="628" stroke-dashoffset="628" transform="rotate(-90 120 120)"/><text x="120" y="112" text-anchor="middle" fill="#fff" font-size="44" font-family="-apple-system,Helvetica Neue,sans-serif" id="holdT">2,0 s</text><text x="120" y="146" text-anchor="middle" fill="#8c8c8c" font-size="15" letter-spacing="2" font-family="-apple-system,Helvetica Neue,sans-serif">FAHRT BEENDEN</text></svg></div>
  <div class="foot fade"><b id="oA"></b><span class="c" id="dAqi"></span><div class="endw"><div id="endBtn"><svg viewBox="0 0 54 54"><circle cx="27" cy="27" r="25" fill="none" stroke="#333" stroke-width="3"/><circle id="endP" cx="27" cy="27" r="25" fill="none" stroke="#e0242c" stroke-width="3" stroke-linecap="round" stroke-dasharray="157" stroke-dashoffset="157" transform="rotate(-90 27 27)"/></svg><i></i></div><small>2 S HALTEN</small></div></div>
  <div class="mid"><div class="cv fade"><div class="ch"><span>TEMPO · 30 MIN</span><b>Ø <span id="dAvg" style="font-size:22px;color:inherit;letter-spacing:0">0</span> <small>km/h</small></b></div><div id="dCv"></div></div>
  <div class="tiles fade" id="dTiles"></div></div>
`;
  $('#dSvc').addEventListener('click', e => { const b = e.target.closest('.ib'); if (!b) return; const nm = b.dataset.sv, pop = $('#dPop'); clearTimeout(drv.pt); if (drv.pop === nm) { drv.pop = null; pop.hidden = true; return; } drv.pop = nm; const inf = svcInfo(nm); pop.innerHTML = `<b>${nm}</b><span>${inf ? inf.text : ''}</span>`; pop.hidden = false; drv.pt = setTimeout(() => { drv.pop = null; pop.hidden = true; }, 6000); });
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
  paintDial(dv, reach, el);
  const sp = G('spd'), txt = String(drv.introDone ? Math.round(target) : 0);
  if (sp.textContent !== txt) { sp.textContent = txt; sp.setAttribute('font-size', Math.round(target) >= 100 ? 48 : 60); sp.setAttribute('y', Math.round(target) >= 100 ? 186 : 188); }
  /* 2 s halten zum Beenden */
  const p = drv.hold ? Math.min(1, (performance.now() - drv.hold) / 2000) : 0;
  G('endP').setAttribute('stroke-dashoffset', 157 * (1 - p));
  $('#endBtn').style.transform = 'scale(' + (1 + .14 * p).toFixed(3) + ')';
  const ov = G('holdOv'); ov.style.opacity = p > 0 ? 1 : 0; G('holdP').setAttribute('stroke-dashoffset', 628 * (1 - p)); G('holdT').textContent = p >= 1 ? 'ENDE' : (2 - 2 * p).toFixed(1).replace('.', ',') + ' s';
  const st = p >= 1 ? 4 : p >= .75 ? 3 : p >= .5 ? 2 : p >= .25 ? 1 : 0;
  if (drv.hold && st > (drv.hs || 0)) { drv.hs = st; if (st < 4) hap(st === 3 ? 2 : 1); }
  if (p >= 1) { drv.hold = 0; hap(3); stopTrip(); return; }
  if (ts - drv.sec >= 1000) { drv.sec = ts; driveSecond(stale); }
}
function driveSecond(stale) {
  const now = new Date(), sec = (now - new Date(rec.start)) / 1000;
  if (now - (rec.lastSample || 0) >= 5000) { rec.lastSample = +now; rec.hist.push({ t: +now, v: Math.round(stale ? 0 : rec.speed) }); if (stale || rec.speed < 3) rec.stop += 5; }
  const avg = rec.m > 0 ? Math.round(rec.m / sec * 3.6) : 0;
  G('dClock').textContent = now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  G('dDate').textContent = WD[now.getDay()] + ' ' + now.getDate() + '. ' + MO[now.getMonth()];
  const w = rec.weather, wi = w ? weatherInfo(w.code) : { wet: false }, ice = w && (w.temp <= 0 || (w.temp <= 3 && wi.wet));
  let chips = `<span class="c md">${commuteTime() ? 'Pendeln' : 'Freizeit'}</span>`;
  if (wi.wet) chips += `<span class="c on">${ic('drop', 14)} Nass</span>`; else if (w) chips += `<span class="c ok">Trocken</span>`;
  if (ice) chips += `<span class="c w">${ic('flake', 14)} Glatteisgefahr</span>`;
  if (G('dChips').innerHTML !== chips) G('dChips').innerHTML = chips;
  const odo = Math.floor(currentOdo() + liveKm()), os = nf(odo, 0);
  G('oA').textContent = os;
  G('dAvg').textContent = avg;
  G('dCv').innerHTML = curveSVG(rec.m > 0 ? avg : null);
  const h = rec.heading;
  G('dTiles').innerHTML = `<div><b>${nf(liveKm(), 1)}</b><span>km</span></div><div><b>${Math.floor(sec / 60)}</b><span>min</span></div><div><b>${w ? nf(w.temp, 0) + '°' : '–'}</b><span>°C</span></div><div>${h != null ? `<svg width="16" height="16" viewBox="0 0 24 24" style="transform:rotate(${Math.round(h)}deg)" fill="none" stroke="#fff" stroke-width="1.7" stroke-linejoin="round"><path d="M12 3l7 17-7-4-7 4z"/></svg><b>${Math.round(h)}°</b><span>${dirName(h)}</span>` : '<b>–</b>'}</div>`;
  const ts = tankState(liveKm()), col = !ts ? '#2a2a2a' : ts.frac > .5 ? '#4fae80' : ts.frac < .25 ? '#ff7a1a' : '#f2c14e';
  for (let i = 0; i <= 60; i++) { const e = G('fu' + i); if (e) e.setAttribute('stroke', ts && i / 60 <= ts.frac ? col : '#2a2a2a'); }
  const rg = G('rng'); if (rg) { rg.textContent = ts ? '≈ ' + Math.round(ts.range) + ' km' : 'TANK ?'; rg.setAttribute('fill', ts ? col : '#8c8c8c'); rg.setAttribute('opacity', drv.introDone ? 1 : ease((performance.now() - drv.t0) / 1000 - 5.0)); }
  ['Ölwechsel', 'Inspektion'].forEach((nm, i) => { const bt = G('dSvc').children[i], inf = svcInfo(nm); bt.style.display = inf ? '' : 'none'; if (!inf) return; bt.className = 'ib' + (inf.level === 2 ? ' e' : inf.level === 1 ? ' w' : ''); if (!bt.firstChild) bt.innerHTML = ic(i ? 'wrench' : 'oil', 22); if (drv.pop === nm) G('dPop').innerHTML = `<b>${nm}</b><span>${inf.text}</span>`; });
  G('dAqi').style.display = rec.aqi != null ? '' : 'none';
  if (rec.aqi != null) G('dAqi').textContent = 'Luft ' + rec.aqi;
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
  const cm = T.filter(t => t.commute && t.dur > 60).sort((a, b) => a.dur - b.dur)[0];
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
  [22, 52, 82].forEach(y => s += `<line x1="6" y1="${y}" x2="${W - 6}" y2="${y}" stroke="#1d1d1d"/>`);
  s += `<path d="${bez(pts)} L${X(v.length - 1)} 100 L${X(0)} 100 Z" fill="url(#ma)"/><path d="${bez(pts)}" fill="none" stroke="#f2c14e" stroke-width="2.6"/>`;
  v.forEach((x, i) => { const last = i === v.length - 1; s += `<circle cx="${X(i)}" cy="${Y(x).toFixed(1)}" r="${last ? 5 : 3.6}" fill="${last ? '#f2c14e' : '#000'}" stroke="#f2c14e" stroke-width="2"/><text x="${X(i)}" y="124" fill="${last ? '#fff' : '#8c8c8c'}" font-size="10" text-anchor="middle" letter-spacing="1">${ms[i].l}</text>`; });
  return s + `<text x="${X(v.length - 1)}" y="${(Y(v[v.length - 1]) - 10).toFixed(1)}" fill="#fff" font-size="13" text-anchor="middle">${v[v.length - 1]}</text></svg>`;
}
function typeChart(ms) {
  const W = 326, H = 120, mx = Math.max(1, ...ms.flatMap(m => m.z));
  let s = `<svg width="100%" viewBox="0 0 ${W} ${H}">`;
  [14, 44, 74].forEach(y => s += `<line x1="6" y1="${y}" x2="${W - 6}" y2="${y}" stroke="#1d1d1d"/>`);
  [0, 1, 2].forEach(k => {
    const pts = ms.map((m, i) => [14 + (W - 44) * i / (ms.length - 1), 92 - 82 * m.z[k] / mx]);
    s += `<path d="${bez(pts)}" fill="none" stroke="${ZCOL[k]}" stroke-width="2.6"/><circle cx="${pts[pts.length - 1][0]}" cy="${pts[pts.length - 1][1].toFixed(1)}" r="4.5" fill="${ZCOL[k]}"/><text x="${W - 6}" y="${(pts[pts.length - 1][1] + 4).toFixed(1)}" fill="${ZCOL[k]}" font-size="11" text-anchor="end">${Math.round(ms[ms.length - 1].z[k])}</text>`;
  });
  ms.forEach((m, i) => s += `<text x="${14 + (W - 44) * i / (ms.length - 1)}" y="114" fill="#8c8c8c" font-size="10" text-anchor="middle" letter-spacing="1">${m.l}</text>`);
  return s + '</svg>';
}

/* ---------- Views ---------- */
let tripSel = null, dueSel = null, tab = 'fahrt', sub = null, fFilter = 'all', lFilter = 'all';
function viewFahrt() {
  if (sub === 'finden') return viewFinden();
  if (sub === 'tanken') return viewTanken();
  fetchForecast();
  const odo = currentOdo(), due = db.reminders.map(r => ({ r, s: reminderStatus(r) })).filter(x => x.s.level > 0), ts = tankState(), pk = db.settings.parked;
  let h = `<div class="h">Q'vuelta</div>`;
  (fc ? fc.warns : []).forEach(w => h += `<div class="card warn"><b>${ic(w.icon, 16)} ${esc(w.t)}</b><span class="l">${esc(w.d)}</span></div>`);
  if (ts && ts.frac < .25) h += `<button class="card btn warn" data-a="opentank"><div class="r"><div><b>Tank ${Math.round(ts.frac * 100)} %</b><span class="l">≈ ${Math.round(ts.range)} km · ${nf(ts.liters, 1)} l</span></div>${ic('fuel', 22)}</div></button>`;
  h += `<div class="g2"><div class="t"><b>${nf(odo, 0)}</b><span>km gesamt</span></div><div class="t"><b>${nf(weekKm(0), 0)}</b><span>km diese Woche</span></div></div>`;
  const fuelTile = `<button class="ib2 ${ts && ts.frac < .25 ? 'w' : ''}" data-a="opentank" aria-label="Tanken">${ic('fuel', 24)}</button>`;
  if (due.length) {
    const icn = n => /öl/i.test(n) ? 'oil' : /insp/i.test(n) ? 'wrench' : /hu|tüv/i.test(n) ? 'note' : /reif/i.test(n) ? 'tire' : /variator|riemen/i.test(n) ? 'bolt' : 'wrench';
    const sel = due.find(x => x.r.id === dueSel);
    h += `<div class="sec">Tanken · Fällig</div><div class="dueRow">${fuelTile}` + due.map(x => `<button class="ib2 ${x.s.level === 2 ? 'e' : 'w'} ${sel && sel.r.id === x.r.id ? 'on' : ''}" data-a="duesel" data-id="${x.r.id}" aria-label="${esc(x.r.name)}">${ic(icn(x.r.name), 24)}</button>`).join('') + `</div>`;
    if (sel) h += `<div class="card ${sel.s.level === 2 ? 'danger' : 'warn'}"><b>${esc(sel.r.name)}</b><span class="l">${esc(sel.s.text)}</span><div class="r" style="margin-top:10px;gap:8px"><button class="sm" data-a="donerem" data-id="${sel.r.id}">Erledigt</button><button class="sm" data-a="editrem" data-id="${sel.r.id}">Bearbeiten</button></div></div>`;
  }
  else h += `<div class="sec">Tanken</div><div class="dueRow">${fuelTile}</div>`;
  if (pk) h += `<div class="sec">Roller</div><button class="card btn" data-a="finden"><div class="r"><div><b>Roller finden</b><span class="l">geparkt ${fmtDay(pk.t)} · ${fmtTime(pk.t)}</span></div>${ic('pin', 22)}</div></button>`;
  return h;
}
/* Roller finden */
let fnd = null;
function viewFinden() {
  const pk = db.settings.parked;
  let h = `<div class="h">Roller finden</div>`;
  if (!pk) return h + `<p class="mu">Noch kein Standort gespeichert. Er wird beim Beenden einer Fahrt automatisch gemerkt – oder jetzt von Hand:</p><button class="pill" data-a="parknow">${ic('pin', 14)} Standort jetzt merken</button>`;
  let ticks = '';
  for (let a = 0; a < 360; a += 6) { const r2 = a % 30 === 0 ? 130 : 124, c = Math.cos(a * Math.PI / 180), s = Math.sin(a * Math.PI / 180); ticks += `<line x1="${(150 + 118 * c).toFixed(1)}" y1="${(150 + 118 * s).toFixed(1)}" x2="${(150 + r2 * c).toFixed(1)}" y2="${(150 + r2 * s).toFixed(1)}" stroke="${a % 30 === 0 ? '#d8d8d8' : '#555'}" stroke-width="${a % 30 === 0 ? 2.4 : 1}"/>`; }
  h += `<div class="finder"><svg width="300" height="300" viewBox="0 0 300 300"><circle cx="150" cy="150" r="138" fill="#050505" stroke="#2e2e2e" stroke-width="3"/>${ticks}<text x="150" y="62" fill="#fff" font-size="15" text-anchor="middle">N</text><g id="fArrow" transform="rotate(0 150 150)"><path d="M150 52 L176 128 L150 112 L124 128 Z" fill="none" stroke="#fff" stroke-width="3" stroke-linejoin="round"/></g></svg></div>
  <div class="dist"><b id="fDist">–</b><small id="fUnit"> m</small><span class="l" id="fInfo">${ic('clock', 13)} Geparkt ${fmtTime(pk.t)} · ${fmtDay(pk.t)}</span></div>
  <div class="g2" style="margin-top:14px"><div class="t"><b id="fDir">–</b><span>Richtung</span></div><div class="t"><b id="fWalk">–</b><span>zu Fuß</span></div></div>
  <p class="mu" id="fHint">Der Pfeil zeigt relativ zu deiner Gehrichtung. Tipp „Kompass erlauben“, damit er auch im Stand stimmt.</p>
  <div class="g2"><button class="pill" data-a="compass">Kompass erlauben</button><button class="pill" data-a="parknow">Neu merken</button></div>`;
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
}
/* Tanken */
function viewTanken() {
  const ts = tankState(); let h = `<div class="h">Tanken</div>`;
  h += ts ? `<div class="card ${ts.frac < .25 ? 'warn' : ''}"><div class="r"><div><b>Tank ${Math.round(ts.frac * 100)} %</b><span class="l">≈ ${Math.round(ts.range)} km · ${nf(ts.liters, 1)} l (geschätzt)</span></div>${ic('fuel', 22)}</div></div>` : `<div class="card"><b>Tankstand unbekannt</b><span class="l">Volle Tankung mit Kilometerstand eintragen</span></div>`;
  h += `<div class="sec">Günstig in der Nähe</div>`;
  if (!db.settings.tkKey) h += `<div class="card"><b>Schlüssel fehlt</b><span class="l">Kostenlos auf creativecommons.tankerkoenig.de anfordern und unter Mehr → Einstellungen eintragen.</span></div>`;
  else if (!stations || stations.loading) h += `<p class="mu">Lade Preise …</p>`;
  else if (stations.err) h += `<div class="card warn"><b>Preise nicht erreichbar</b><span class="l">Netz oder Schlüssel prüfen</span></div>`;
  else if (!stations.list.length) h += `<p class="mu">Keine geöffnete Tankstelle gefunden.</p>`;
  else stations.list.forEach((s, i) => h += `<button class="card btn ${i === 0 ? 'good' : ''}" data-a="route" data-i="${i}"><div class="r"><div><b>${esc(s.n)}</b><span class="l">${ic('pin', 12)} ${nf(s.dist, 1)} km</span></div><div style="text-align:right"><b class="big" style="${i === 0 ? 'color:var(--g)' : ''}">${nf(s.price, 2)}</b><span class="l">E10 · €/l</span></div></div></button>`);
  return h + (stations && stations.list ? '<p class="mu">Preise: Tankerkönig (CC BY 4.0)</p>' : '');
}
function viewFahrten() {
  const all = db.trips, total = all.reduce((a, x) => a + x.km, 0);
  const f = { all: () => true, commute: t => t.commute, free: t => !t.commute, cold: t => t.temp != null && t.temp <= 5 }[fFilter];
  const t = all.filter(f), chip = (k, l, c = 'on') => `<button class="c ${fFilter === k ? c : ''}" data-a="ff" data-f="${k}">${l}</button>`;
  return `<div class="h">Fahrten</div>
  <div class="g2"><div class="t"><b>${all.length}</b><span>Fahrten</span></div><div class="t"><b>${nf(total, 0)}</b><span>km gefahren</span></div></div>
  <div class="chips" style="margin-top:12px">${chip('all', 'Alle')}${chip('commute', 'Pendeln')}${chip('free', 'Freizeit')}${chip('cold', 'Kalt ≤ 5°', 'w')}</div>
  ${t.length ? t.map(x => {
    const w = weatherInfo(x.code);
    return `<div class="card tripc" data-a="opentrip" data-id="${x.id}"><div class="r"><div><b class="big">${nf(x.km, 1)}<small> km</small></b><span class="l">${fmtDay(x.start)} · ${fmtTime(x.start)}</span></div>${spark(x.spark)}</div>
    <div class="r2"><span>${Math.round(x.dur / 60)} min</span><span class="y">Ø ${x.avg}</span>${x.temp != null ? `<span>${ic(w.wet ? 'drop' : 'cloud', 13)} ${nf(x.temp, 0)}°C</span>` : ''}<span>${x.commute ? 'Pendeln' : 'Freizeit'}</span><button class="ghost" style="margin-left:auto;font-size:11px;letter-spacing:.14em" data-a="deltrip" data-id="${x.id}">LÖSCHEN</button></div>${x.zk ? zb(x.zk) : ''}</div>`;
  }).join('') : '<p class="mu">Keine Fahrten in dieser Ansicht.</p>'}`;
}
function tripMap(rt) {
  const W = 326, H = 210, pad = 26;
  if (!rt || rt.length < 2) return '';
  const lon2x = (lo, z) => (lo + 180) / 360 * 256 * 2 ** z, lat2y = (la, z) => (1 - Math.log(Math.tan(la * Math.PI / 180) + 1 / Math.cos(la * Math.PI / 180)) / Math.PI) / 2 * 256 * 2 ** z;
  const las = rt.map(x => x[0]), los = rt.map(x => x[1]), a = Math.min(...las), b = Math.max(...las), c = Math.min(...los), d = Math.max(...los);
  let z = 17; for (; z > 3; z--) { if (lon2x(d, z) - lon2x(c, z) <= W - 2 * pad && lat2y(a, z) - lat2y(b, z) <= H - 2 * pad) break; }
  const ox = (lon2x(c, z) + lon2x(d, z)) / 2 - W / 2, oy = (lat2y(a, z) + lat2y(b, z)) / 2 - H / 2;
  let im = ''; for (let tx = Math.floor(ox / 256); tx <= Math.floor((ox + W) / 256); tx++) for (let ty = Math.floor(oy / 256); ty <= Math.floor((oy + H) / 256); ty++) im += `<image href="https://a.basemaps.cartocdn.com/dark_all/${z}/${tx}/${ty}.png" x="${(tx * 256 - ox).toFixed(1)}" y="${(ty * 256 - oy).toFixed(1)}" width="256" height="256"/>`;
  const pt = rt.map(x => [lon2x(x[1], z) - ox, lat2y(x[0], z) - oy]), s = pt[0], e = pt[pt.length - 1];
  return `<svg viewBox="0 0 ${W} ${H}" width="100%" style="display:block;border-radius:12px;background:#0b0b0b"><rect width="${W}" height="${H}" fill="#0b0b0b"/>${im}<path d="${bez(pt)}" fill="none" stroke="#000" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" opacity=".6"/><path d="${bez(pt)}" fill="none" stroke="#f2c14e" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/><circle cx="${s[0]}" cy="${s[1]}" r="5.5" fill="#4fae80" stroke="#000" stroke-width="2"/><circle cx="${e[0]}" cy="${e[1]}" r="5.5" fill="#e0242c" stroke="#000" stroke-width="2"/><text x="${W - 6}" y="${H - 5}" text-anchor="end" font-size="8" fill="#777" font-family="-apple-system,Helvetica Neue,sans-serif">© OpenStreetMap · © CARTO</text></svg>`;
}
function tripCurve(ser, avg, dur) {
  const W = 326, H = 170, x0 = 6, x1 = 320, n = ser.length; if (n < 2) return '';
  const vmax = Math.max(60, ...ser), X = i => x0 + i * (x1 - x0) / (n - 1), yv = v => 98 - 90 * v / vmax;
  const ac = ser.map((v, i) => i ? v - ser[i - 1] : 0), amax = Math.max(8, ...ac.map(Math.abs)), ya = v => 140 - 22 * v / amax;
  let g = ''; for (let y = 8; y <= 98; y += 15) g += `<line x1="${x0}" y1="${y}" x2="${x1}" y2="${y}" stroke="#1d1d1d"/>`; for (let y = 120; y <= 162; y += 11) g += `<line x1="${x0}" y1="${y}" x2="${x1}" y2="${y}" stroke="#1d1d1d"/>`;
  const sp = ser.map((v, i) => [X(i), yv(v)]), as = ac.map((v, i) => [X(i), ya(v)]), mi = ser.indexOf(Math.max(...ser));
  const lab = s => { const m = Math.round(s / 60); return m + ' min'; };
  return `<svg viewBox="0 0 ${W} ${H}" width="100%" style="display:block"><defs><clipPath id="tneg"><rect x="${x0}" y="140" width="${x1 - x0}" height="30"/></clipPath></defs>${g}<line x1="${x0}" y1="98" x2="${x1}" y2="98" stroke="#444" stroke-width="1.2"/><line x1="${x0}" y1="140" x2="${x1}" y2="140" stroke="#555"/>
  <path d="${bez(sp)}" fill="none" stroke="#f2f2f2" stroke-width="2.6" stroke-linejoin="round"/>
  <line x1="${x0}" y1="${yv(avg).toFixed(1)}" x2="${x1}" y2="${yv(avg).toFixed(1)}" stroke="#f2c14e" stroke-width="1.2" stroke-dasharray="5 4"/>
  <circle cx="${X(mi).toFixed(1)}" cy="${yv(ser[mi]).toFixed(1)}" r="3.6" fill="#f2c14e"/>
  <path d="${bez(as)}" fill="none" stroke="#f2c14e" stroke-width="2"/><path d="${bez(as)}" fill="none" stroke="#4fae80" stroke-width="2.4" clip-path="url(#tneg)"/>
  <text x="${x0}" y="${H - 1}" font-size="9" fill="#777" font-family="-apple-system,Helvetica Neue,sans-serif">0</text><text x="${x1}" y="${H - 1}" text-anchor="end" font-size="9" fill="#777" font-family="-apple-system,Helvetica Neue,sans-serif">${lab(dur)}</text></svg>`;
}
function viewTrip() {
  const t = db.trips.find(x => x.id === tripSel); if (!t) { sub = null; return viewFahrten(); }
  const w = weatherInfo(t.code), ser = (t.ser && t.ser.length > 1) ? t.ser : (t.spark || []), zk = t.zk || [0, 0, 0], zs = (zk[0] + zk[1] + zk[2]) || 1;
  const mvT = Math.max(60, t.dur - (t.stop || 0)), mvAvg = Math.round(t.km / (mvT / 3600)), cons = avgCons() || 3.1;
  const tile = (v, l, c) => `<div class="t"><b${c ? ` class="${c}"` : ''}>${v}</b><span>${l}</span></div>`;
  const zr = [['city', 'Stadt', '< 60'], ['land', 'Land', '60–80'], ['bab', 'Autobahn', '> 80']].map((z, i) => `<div class="zr"><span>${ic(z[0], 17)}</span><i style="flex:1"><u style="width:${Math.round(zk[i] / zs * 100)}%;background:${ZCOL[i]}"></u></i><b>${nf(zk[i], 1)} km</b><small>${Math.round(zk[i] / zs * 100)} %</small></div>`).join('');
  const map = tripMap(t.route);
  return `<div class="h">Fahrt</div>
  <div class="chips"><span class="c md">${fmtDay(t.start)}</span><span class="c md">${fmtTime(t.start)} – ${fmtTime(t.end)}</span><span class="c ${t.commute ? 'on' : ''}">${t.commute ? 'Pendeln' : 'Freizeit'}</span></div>
  <div class="g2">${tile(nf(t.km, 1) + '<small> km</small>', 'Strecke', 'big')}${tile(fmtDur(t.dur), 'Dauer', 'big')}</div>
  <div class="g2" style="margin-top:10px">${tile(t.avg + '<small> km/h</small>', 'Ø gesamt', 'big y')}${tile(t.max + '<small> km/h</small>', 'Höchstes Tempo', 'big')}</div>
  <div class="card" style="margin-top:10px"><div class="r"><span class="l">Tempo · Beschleunigung</span><span class="l y">Ø ${t.avg} km/h</span></div>${tripCurve(ser, t.avg, t.dur)}</div>
  ${map ? `<div class="sec">Route</div><div class="card mapc">${map}</div>` : ''}
  <div class="sec">Strecke nach Tempo</div><div class="card">${zr}</div>
  <div class="sec">Sonst noch</div>
  <div class="g2">${tile(t.stop != null ? Math.round(t.stop / 60) + '<small> min</small>' : '–', 'Stillstand')}${tile(mvAvg + '<small> km/h</small>', 'Ø in Bewegung')}</div>
  <div class="g2" style="margin-top:10px">${tile(t.temp != null ? nf(t.temp, 0) + '<small> °C</small>' : '–', w.t || 'Temperatur')}${tile('≈ ' + nf(t.km * cons / 100, 2) + '<small> l</small>', 'Verbrauch ≈')}</div>
  ${t.aqi != null ? `<div class="g2" style="margin-top:10px">${tile(t.aqi, 'Luftqualität (AQI)')}${tile(nf(t.km / (t.dur / 3600), 0) + '<small> km/h</small>', 'Ø inkl. Stopps')}</div>` : ''}
  <button class="ghost" style="margin-top:18px;font-size:11px;letter-spacing:.14em" data-a="deltrip" data-id="${t.id}">FAHRT LÖSCHEN</button>`;
}
const LT = { tank: ['Tanken', 'fuel'], service: ['Service', 'wrench'], reifen: ['Reifendruck', 'tire'], notiz: ['Notiz', 'note'] };
function viewLogbuch() {
  const cons = consumption(), avgC = cons.length ? cons.reduce((a, c) => a + c.l100, 0) / cons.length : null;
  const tk = db.logs.filter(l => l.type === 'tank' && l.odo).sort((a, b) => a.odo - b.odo);
  const km = tk.length > 1 ? tk[tk.length - 1].odo - tk[0].odo : 0, spent = tk.slice(1).reduce((a, l) => a + (l.eur || 0), 0);
  const logs = db.logs.filter(l => lFilter === 'all' || l.type === lFilter).sort((a, b) => b.date.localeCompare(a.date) || (b.odo || 0) - (a.odo || 0));
  const chip = (k, l) => `<button class="c ${lFilter === k ? 'on' : ''}" data-a="lf" data-f="${k}">${l}</button>`;
  return `<div class="h">Logbuch</div>
  <div class="chips">${chip('all', 'Alle')}${chip('tank', 'Tanken')}${chip('service', 'Service')}${chip('reifen', 'Reifen')}${chip('notiz', 'Notiz')}</div>
  <div class="g2"><div class="t"><b>${avgC ? nf(avgC, 1) : '–'}</b><span>l / 100 km Ø</span></div><div class="t"><b>${km && spent ? nf(spent / km * 100, 2) : '–'}</b><span>€ / 100 km</span></div></div>
  <div style="height:10px"></div>
  ${logs.length ? logs.map(l => {
    let d = '', right = '';
    if (l.type === 'tank') { d = `${nf(l.liters, 2)} l${l.full ? '' : ' · nicht voll'}`; right = l.eur ? nf(l.eur, 2) + ' €' : ''; if (l.eur && l.liters) d += ' · ' + nf(l.eur / l.liters, 3) + ' €/l'; }
    if (l.type === 'service') { d = esc(l.text); right = l.eur ? nf(l.eur, 2) + ' €' : ''; }
    if (l.type === 'reifen') d = `vorne ${nf(l.front, 1)} bar · hinten ${nf(l.rear, 1)} bar`;
    if (l.type === 'notiz') d = esc(l.text);
    return `<div class="card"><div class="r"><div><b>${ic(LT[l.type][1], 16)} ${LT[l.type][0]}</b><span class="l">${fmtDate(l.date)}${l.odo ? ' · ' + nf(l.odo, 0) + ' km' : ''}</span></div><b class="y" style="font-size:22px">${right}</b></div><div style="margin-top:6px;font-size:14px;letter-spacing:.04em">${d}</div><div style="text-align:right"><button class="ghost" style="font-size:11px;letter-spacing:.14em" data-a="dellog" data-id="${l.id}">LÖSCHEN</button></div></div>`;
  }).join('') : '<p class="mu">Noch keine Einträge.</p>'}`;
}
function viewMehr() {
  const ms = monthSeries(), avgM = ms.filter(m => m.km).length ? Math.round(ms.reduce((a, m) => a + m.km, 0) / ms.filter(m => m.km).length) : 0;
  const R = records(), rt = (i, v, u, l, d) => `<div class="t rk">${ic(i, 18)}<b>${v ? v.v : '–'}<small> ${v ? u : ''}</small></b><span>${l}</span><span class="d">${v ? v.d : ''}</span></div>`;
  return `<div class="h">Mehr</div><div class="sec" style="margin-top:0">Analyse</div>
  <div class="card gr1"><div class="r"><span class="l">Kilometer pro Monat</span><b class="y">Ø ${avgM}</b></div>${monthChart(ms)}</div>
  <div class="card gr2"><div class="r"><span class="l">Strecke pro Typ</span><span class="l" style="display:flex;gap:12px;margin:0">${['city', 'land', 'bab'].map((n, i) => `<span style="color:${ZCOL[i]}">${ic(n, 18)} ●</span>`).join('')}</span></div>${typeChart(ms)}</div>
  <div class="sec">Rekorde</div>
  <div class="g2">${rt('clock', R.fast, 'min', 'Schnellste Pendelfahrt')}${rt('route', R.long, 'km', 'Längste Tour')}${rt('speed', R.top, 'km/h', 'Höchstes Tempo')}${rt('cal', R.week, 'km', 'Beste Woche')}${rt('bolt', R.streak, 'Tage', 'Längste Serie')}${rt('fuel', R.cons, 'l/100', 'Bester Verbrauch')}</div>
  <div class="sec">Erinnerungen</div>
  ${db.reminders.map(r => { const s = reminderStatus(r); return `<div class="card ${['', 'warn', 'danger'][s.level]}"><div class="r"><div><b>${esc(r.name)}</b><span class="l">${esc(s.text)}</span></div><span class="c ${['', 'w', 'e'][s.level]}">${s.level === 2 ? 'fällig' : s.level === 1 ? 'bald' : 'ok'}</span></div><div class="r" style="margin-top:10px"><button class="sm" data-a="editrem" data-id="${r.id}">Bearbeiten</button><button class="sm pri" data-a="donerem" data-id="${r.id}">Erledigt</button></div></div>`; }).join('')}
  <button class="sm" data-a="newrem">+ Erinnerung</button>
  <div class="sec">Einstellungen</div>
  <div class="card">
    <div class="r"><span class="l" style="margin:0">Kilometerstand</span><b>${nf(currentOdo(), 0)} km</b></div>
    <div class="r" style="margin-top:8px"><span class="l" style="margin:0">Pendelstrecke</span><b>${nf(db.settings.pendelKm, 1)} km</b></div>
    <div class="r" style="margin-top:8px"><span class="l" style="margin:0">Tank</span><b>${nf(db.settings.tank, 1)} l</b></div>
    <div class="r" style="margin-top:8px"><span class="l" style="margin:0">Nadel im Tacho</span><b>${db.settings.needle ? 'an' : 'aus'}</b></div>
    <div class="r" style="margin-top:8px"><span class="l" style="margin:0">Tankerkönig-Schlüssel</span><b>${db.settings.tkKey ? 'gesetzt' : '–'}</b></div>
    <div style="margin-top:12px"><button class="sm" data-a="settings">Ändern</button></div>
  </div>
  <div class="g2"><button class="pill" data-a="setwork">${ic('navi', 14)} Arbeit ${db.settings.work ? '✓' : ''}<br><span class="l" style="margin-top:4px">hier speichern</span></button><button class="pill" data-a="sethome">${ic('navi', 14)} Zuhause ${db.settings.home ? '✓' : ''}<br><span class="l" style="margin-top:4px">hier speichern</span></button></div>
  <div class="sec">Daten</div>
  <div class="g2"><button class="pill" data-a="export">Sichern</button><button class="pill" data-a="import">Wiederherstellen</button></div>
  <input type="file" id="imp" accept="application/json" hidden>
  <p class="mu">Alle Daten liegen nur auf diesem iPhone. Sichere sie regelmäßig – Safari kann Website-Daten löschen.</p>
  <p class="mu" style="text-align:center;margin-top:18px">Q'vuelta · Version 10 · 18.11.2026</p>`;
}
function dockHTML() {
  if (tab === 'fahrt') {
    if (sub === 'finden') return `<button class="pill" style="background:#000" data-a="maps">In Karten öffnen</button><button class="cta" data-a="back">Zurück</button>`;
    if (sub === 'tanken') return stations && stations.list && stations.list.length ? `<button class="cta" data-a="route" data-i="0">Route zu Station 1</button>` : `<button class="cta" data-a="back">Zurück</button>`;
    return `<div class="navrow"><button class="pill" data-a="navwork">${ic('navi', 15)} Arbeit</button><button class="pill" data-a="navhome">${ic('navi', 15)} Zuhause</button></div><button class="cta" data-a="start">Fahrt starten</button>`;
  }
  if (tab === 'fahrten' && sub === 'trip') return `<button class="cta" data-a="back">Zurück</button>`;
  if (tab === 'fahrten') return `<button class="cta" data-a="manualtrip">+ Fahrt nachtragen</button>`;
  if (tab === 'logbuch') return `<button class="cta" data-a="chooser">+ Eintrag</button>`;
  return '';
}
function render() {
  const v = $('#view'), y = window.scrollY;
  v.innerHTML = ({ fahrt: viewFahrt, fahrten: () => sub === 'trip' ? viewTrip() : viewFahrten(), logbuch: viewLogbuch, mehr: viewMehr })[tab]();
  $('#dock').innerHTML = dockHTML();
  const nd = $('#dock').children.length; $('#view').style.paddingBottom = nd ? (nd > 1 ? '210px' : '130px') : '90px';
  document.querySelectorAll('#tabs button').forEach(b => b.classList.toggle('on', b.dataset.t === tab));
  if (tab === 'fahrt' && sub === 'finden') { finderStart(); finderUpdate(); } else finderStop();
  window.scrollTo(0, y);
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
  duesel(el) { dueSel = dueSel === el.dataset.id ? null : el.dataset.id; render(); },
  parknow() { here(p => { db.settings.parked = { lat: p.lat, lon: p.lon, t: new Date().toISOString() }; save(); render(); toast('Standort gemerkt'); }); },
  compass() {
    if (window.DeviceOrientationEvent && typeof DeviceOrientationEvent.requestPermission === 'function') DeviceOrientationEvent.requestPermission().then(r => toast(r === 'granted' ? 'Kompass aktiv' : 'Kompass abgelehnt')).catch(() => toast('Kompass nicht verfügbar'));
    else toast('Kompass ist aktiv');
  },
  maps() { const p = db.settings.parked; if (p) location.href = 'https://maps.apple.com/?daddr=' + p.lat + ',' + p.lon + '&dirflg=w'; },
  opentank() { sub = 'tanken'; stations = null; render(); if (db.settings.tkKey) fetchStations(); },
  route(el) { const s = stations && stations.list && stations.list[+el.dataset.i || 0]; if (s) location.href = 'https://maps.apple.com/?daddr=' + s.lat + ',' + s.lon + '&dirflg=d'; },
  navwork() { navTo('work', 'Arbeit'); }, navhome() { navTo('home', 'Zuhause'); },
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
  settings() { openSheet('Einstellungen', [{ n: 'odo', l: 'Aktueller Kilometerstand (Tacho)', type: 'number', v: Math.round(currentOdo()) }, { n: 'pk', l: 'Pendelstrecke einfach (km)', type: 'number', v: db.settings.pendelKm }, { n: 'tank', l: 'Tankgröße (Liter)', type: 'number', v: db.settings.tank }, { n: 'tk', l: 'Tankerkönig-Schlüssel (optional)', v: db.settings.tkKey }, { n: 'needle', l: 'Nadel im Tacho anzeigen', type: 'check', v: db.settings.needle }],
    o => { setOdo(o.odo); if (o.pk) db.settings.pendelKm = o.pk; if (o.tank) db.settings.tank = o.tank; db.settings.tkKey = o.tk || ''; db.settings.needle = o.needle; stations = null; }); },
  newrem() { remForm({ id: uid(), name: '', everyKm: 0, everyMonths: 0, lastOdo: Math.round(currentOdo()), lastDate: today() }, true); },
  editrem(el) { remForm(db.reminders.find(r => r.id === el.dataset.id)); },
  donerem(el) {
    const r = db.reminders.find(x => x.id === el.dataset.id);
    if (r.dueDate !== undefined && !r.everyKm && !r.everyMonths) return remForm(r);
    r.lastOdo = Math.round(currentOdo()); r.lastDate = today(); save(); render(); toast(r.name + ' erledigt');
  },
  export() {
    const b = new Blob([JSON.stringify(db, null, 1)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'vespa-logbuch-' + today() + '.json'; a.click();
  },
  import() { $('#imp').click(); }
};
function remForm(r, isNew) {
  const fields = [{ n: 'name', l: 'Name', v: r.name }, { n: 'everyKm', l: 'Alle … km (0 = aus)', type: 'number', v: r.everyKm || 0 }, { n: 'everyMonths', l: 'Alle … Monate (0 = aus)', type: 'number', v: r.everyMonths || 0 }, { n: 'dueDate', l: 'Oder festes Fälligkeitsdatum', type: 'date', v: r.dueDate || '' }];
  openSheet(isNew ? 'Neue Erinnerung' : r.name, fields, o => {
    r.name = o.name || 'Erinnerung'; r.everyKm = o.everyKm || 0; r.everyMonths = o.everyMonths || 0; r.dueDate = o.dueDate || (r.dueDate !== undefined && !r.everyKm && !r.everyMonths ? '' : undefined);
    if (!o.dueDate) delete r.dueDate;
    if (isNew) db.reminders.push(r);
  });
}

/* ---------- Start ---------- */
function init() {
  load(); save();
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-t]'); if (t && t.closest('#tabs')) { tab = t.dataset.t; sub = null; render(); window.scrollTo(0, 0); return; }
    if (e.target.dataset.x === 'cancel' || e.target.classList.contains('sheet-bg')) return closeSheet();
    const a = e.target.closest('[data-a]'); if (a && actions[a.dataset.a]) { if (a.dataset.a === 'start') hap(2); if (['tank', 'service', 'reifen', 'notiz'].includes(a.dataset.a)) closeSheet(); actions[a.dataset.a](a); }
  });
  document.addEventListener('change', e => {
    if (e.target.id !== 'imp' || !e.target.files[0]) return;
    const rd = new FileReader();
    rd.onload = () => { try { const j = JSON.parse(rd.result); if (!j.trips || !j.logs) throw 0; db = j; load2(); toast('Wiederhergestellt'); } catch (x) { toast('Datei ungültig'); } };
    rd.readAsText(e.target.files[0]);
  });
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && !rec) { fetchForecast(); render(); } });
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => { });
  render();
}
function load2() { db.reminders = db.reminders || []; db.settings = Object.assign(defaults().settings, db.settings || {}); save(); render(); }
init();
