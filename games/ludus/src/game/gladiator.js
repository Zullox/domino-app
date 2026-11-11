import { CLASSES, TRAITS, SCARS, NAMES, ORIGINS, STATS } from './data.js';

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

export function createGladiator(rng, { level = 1, cls, name, statMult = 1, id } = {}) {
  const c = cls || rng.pick(Object.keys(CLASSES));
  const mods = CLASSES[c].mods;
  const bonus = (level - 1) * 1.2;
  const stats = {};
  for (const s of STATS) {
    stats[s] = clamp(Math.round((rng.int(4, 8) + mods[s] + bonus) * statMult), 1, 20);
  }
  const traitKeys = Object.keys(TRAITS);
  const traits = rng.shuffle(traitKeys).slice(0, rng.chance(0.4) ? 2 : 1);
  return {
    id: id || `g${Math.floor(rng.next() * 1e9).toString(36)}`,
    name: name || rng.pick(NAMES),
    origin: rng.pick(ORIGINS),
    cls: c,
    age: rng.int(19, 28),
    level,
    xp: 0,
    stats,
    traits,
    scars: [],
    training: 'descanso',
    trainProgress: { str: 0, agi: 0, end: 0 },
    injuryDays: 0,
    wins: 0,
    losses: 0,
    kills: 0,
    foughtToday: false,
  };
}

export function hasTrait(g, t) {
  return g.traits.includes(t);
}

// Atributos efectivos: base + cicatrices + rasgos.
export function effectiveStats(g) {
  const s = { ...g.stats };
  for (const sc of g.scars) for (const [k, v] of Object.entries(SCARS[sc].mods)) s[k] += v;
  if (hasTrait(g, 'veterano')) s.val += 3;
  if (hasTrait(g, 'cobarde')) s.val -= 3;
  for (const k of STATS) s[k] = clamp(s[k], 1, 20);
  return s;
}

export function maxHp(g) {
  const s = effectiveStats(g);
  let hp = 20 + s.end * 4;
  if (hasTrait(g, 'coloso')) hp *= 1.15;
  if (hasTrait(g, 'fragil')) hp *= 0.9;
  return Math.round(hp);
}

export function power(g) {
  const s = effectiveStats(g);
  return s.str + s.agi + s.end + s.val;
}

export function xpToNext(level) {
  return 40 + level * 30;
}

// Añade experiencia; devuelve [gladiador, nº de niveles subidos].
export function addXp(g, amount, rng) {
  const out = { ...g, stats: { ...g.stats } };
  out.xp += Math.round(amount * (hasTrait(g, 'aprendiz') ? 1.5 : 1));
  let ups = 0;
  while (out.xp >= xpToNext(out.level)) {
    out.xp -= xpToNext(out.level);
    out.level += 1;
    ups += 1;
    // La clase decide qué atributo mejora con más probabilidad.
    const mods = CLASSES[out.cls].mods;
    const weighted = ['str', 'agi', 'end'].flatMap((k) => Array(Math.max(1, 2 + mods[k])).fill(k));
    const k = rng.pick(weighted);
    out.stats[k] = clamp(out.stats[k] + 1, 1, 20);
    if (out.level % 2 === 0) out.stats.val = clamp(out.stats.val + 1, 1, 20);
  }
  return [out, ups];
}

export function recruitPrice(g) {
  const base = 40 + power(g) * 3 + (g.level - 1) * 25;
  const good = ['favorito', 'veterano', 'coloso', 'veloz', 'inquebrantable', 'aprendiz', 'gloria'];
  const bad = ['cobarde', 'fragil', 'gloton'];
  const adj = g.traits.reduce((a, t) => a + (good.includes(t) ? 20 : bad.includes(t) ? -15 : 0), 0);
  return Math.max(30, Math.round(base + adj));
}

export function canFight(g) {
  return g.injuryDays <= 0 && !g.foughtToday;
}
