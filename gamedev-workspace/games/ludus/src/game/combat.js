import { CLASSES, STANCES, TACTICS } from './data.js';
import { createRng } from './rng.js';
import { effectiveStats, maxHp, hasTrait } from './gladiator.js';

// Combate por asaltos como máquina de estados pura:
// stance → fight → (tactic → fight) → missio → done

function fighter(g, side) {
  const s = effectiveStats(g);
  const hp = maxHp(g);
  return {
    side, id: g.id, name: g.name, cls: g.cls, traits: g.traits, stats: s,
    hp, maxHp: hp, morale: s.val, maxMorale: s.val,
    stance: 'equilibrado', buffs: {}, netted: 0, damageDealt: 0,
  };
}

export function startCombat(player, enemy, { seed = 1, difficulty }) {
  return {
    phase: 'stance', round: 0, seed,
    a: fighter(player, 'a'), b: fighter(enemy, 'b'),
    tacticOffered: null, tacticDone: false,
    fallen: null, surrendered: false, favorDelta: 0,
    missioBase: difficulty.missioBase, deathAllowed: difficulty.death,
    log: [], events: [], result: null,
  };
}

function clone(st) {
  return { ...st, a: { ...st.a, buffs: { ...st.a.buffs } }, b: { ...st.b, buffs: { ...st.b.buffs } }, log: st.log.slice(), events: [] };
}

export function chooseStance(state, stance, rngSeed) {
  const st = clone(state);
  const rng = createRng(rngSeed ?? st.seed);
  st.a.stance = stance;
  // La IA elige postura según su vida relativa.
  st.b.stance = rng.pick(['agresivo', 'equilibrado', 'equilibrado', 'defensivo']);
  st.seed = rng.seed;
  st.phase = 'fight';
  st.log.push(`${st.a.name} adopta postura ${STANCES[stance].name.toLowerCase()}; ${st.b.name}, ${STANCES[st.b.stance].name.toLowerCase()}.`);
  return st;
}

function dodgeChance(f) {
  let d = 0.05 + f.stats.agi * 0.015;
  if (hasTrait(f, 'zurdo')) d += 0.1;
  if (hasTrait(f, 'cobarde')) d += 0.05;
  return Math.min(d, 0.4);
}

function attack(st, att, def, rng, mult = 1) {
  if (att.netted > 0) {
    att.netted -= 1;
    st.log.push(`${att.name} forcejea con la red.`);
    st.events.push({ type: 'netted', side: att.side });
    return;
  }
  const guaranteed = att.buffs.finta;
  let missChance = dodgeChance(def) + (att.buffs.arenaVs || 0);
  if (guaranteed) missChance = 0;
  if (rng.chance(missChance)) {
    st.log.push(`${def.name} esquiva el golpe de ${att.name}.`);
    st.events.push({ type: 'miss', side: att.side });
    return;
  }
  const cls = CLASSES[att.cls];
  let dmg = (2 + att.stats.str * 0.6) * rng.range(0.8, 1.2) * mult;
  dmg *= STANCES[att.stance].dealt * STANCES[def.stance].taken;
  if (cls.beats === def.cls) dmg *= 1.25;
  if (CLASSES[def.cls].beats === att.cls) dmg *= 0.9;
  if (hasTrait(att, 'sanguinario')) dmg *= 1.1;
  if (att.buffs.brutal) { dmg *= 2; delete att.buffs.brutal; }
  if (def.buffs.muro) dmg *= 0.5;
  const crit = guaranteed || rng.chance(0.05 + (cls.crit || 0));
  if (crit) dmg *= 1.5;
  if (guaranteed) delete att.buffs.finta;
  dmg = Math.max(1, Math.round(dmg));

  const before = def.hp;
  def.hp = Math.max(0, def.hp - dmg);
  att.damageDealt += dmg;
  // La moral cae 1 punto por cada 20 % de vida perdida.
  const step = def.maxHp * 0.2;
  let lost = Math.floor((def.maxHp - def.hp) / step) - Math.floor((def.maxHp - before) / step);
  if (hasTrait(def, 'inquebrantable')) lost = Math.floor(lost / 2 + (rng.chance(0.5) ? 0.5 : 0));
  def.morale = Math.max(0, def.morale - lost);

  st.log.push(`${att.name} ${crit ? '¡golpe crítico!' : 'golpea'} a ${def.name}: −${dmg}.`);
  st.events.push({ type: 'hit', side: att.side, dmg, crit });

  if (cls.net && def.hp > 0 && rng.chance(cls.net)) {
    def.netted = 1;
    st.log.push(`¡La red de ${att.name} atrapa a ${def.name}!`);
  }
}

function decayBuffs(f) {
  for (const k of ['arenaVs', 'muro']) {
    if (f.buffs[k + 'Turns'] > 0) {
      f.buffs[k + 'Turns'] -= 1;
      if (f.buffs[k + 'Turns'] === 0) { delete f.buffs[k]; delete f.buffs[k + 'Turns']; }
    }
  }
}

function checkEnd(st) {
  for (const f of [st.a, st.b]) {
    if (f.hp <= 0 || f.morale <= 0) {
      st.fallen = f.side;
      st.surrendered = f.hp > 0;
      st.phase = 'missio';
      st.log.push(st.surrendered ? `${f.name} levanta el dedo: se rinde.` : `${f.name} cae a la arena.`);
      return true;
    }
  }
  return false;
}

export function stepRound(state) {
  if (state.phase !== 'fight') return state;
  const st = clone(state);
  const rng = createRng(st.seed);
  st.round += 1;

  const aFirst = hasTrait(st.a, 'veloz') !== hasTrait(st.b, 'veloz')
    ? hasTrait(st.a, 'veloz')
    : st.a.stats.agi + rng.int(0, 4) >= st.b.stats.agi + rng.int(0, 4);
  const order = aFirst ? [st.a, st.b] : [st.b, st.a];

  for (const att of order) {
    const def = att === st.a ? st.b : st.a;
    if (CLASSES[att.cls].twin) { attack(st, att, def, rng, 0.6); if (def.hp > 0) attack(st, att, def, rng, 0.6); }
    else attack(st, att, def, rng);
    if (checkEnd(st)) break;
  }
  decayBuffs(st.a); decayBuffs(st.b);

  // Momento clave: la primera vez que alguien baja del 60 % de vida.
  if (st.phase === 'fight' && !st.tacticDone && (st.a.hp <= st.a.maxHp * 0.6 || st.b.hp <= st.b.maxHp * 0.6)) {
    st.phase = 'tactic';
    st.tacticOffered = rng.shuffle(Object.keys(TACTICS)).slice(0, 3);
  }
  // Límite de seguridad: tras 30 asaltos se rinde quien tenga menos vida relativa.
  if (st.phase === 'fight' && st.round >= 30) {
    const loser = st.a.hp / st.a.maxHp <= st.b.hp / st.b.maxHp ? st.a : st.b;
    loser.morale = 0;
    checkEnd(st);
  }
  st.seed = rng.seed;
  return st;
}

function applyTactic(st, f, foe, key) {
  switch (key) {
    case 'brutal': f.buffs.brutal = true; break;
    case 'finta': f.buffs.finta = true; break;
    case 'arena': f.buffs.arenaVs = 0; foe.buffs.arenaVs = 0.3; foe.buffs.arenaVsTurns = 2; break;
    case 'muro': f.buffs.muro = true; f.buffs.muroTurns = 2; break;
    case 'aliento': f.hp = Math.min(f.maxHp, f.hp + Math.round(f.maxHp * 0.15)); break;
    case 'publico': f.morale = Math.min(f.maxMorale + 2, f.morale + 2); if (f.side === 'a') st.favorDelta += 15; break;
    default: break;
  }
  st.log.push(`${f.name}: ${TACTICS[key].name}.`);
}

export function chooseTactic(state, key) {
  if (state.phase !== 'tactic') return state;
  const st = clone(state);
  const rng = createRng(st.seed);
  applyTactic(st, st.a, st.b, key);
  applyTactic(st, st.b, st.a, rng.pick(Object.keys(TACTICS)));
  st.tacticDone = true;
  st.tacticOffered = null;
  st.phase = 'fight';
  st.seed = rng.seed;
  return st;
}

// Probabilidad de que el público conceda la missio al caído.
export function missioChance(state, favor, plead = false) {
  const f = state.fallen === 'a' ? state.a : state.b;
  const winner = state.fallen === 'a' ? state.b : state.a;
  let p = state.missioBase;
  // Un combate reñido y valiente gusta al público.
  p += Math.min(0.2, (f.damageDealt / winner.maxHp) * 0.3);
  if (state.surrendered) p -= 0.15;
  if (hasTrait(f, 'favorito')) p += 0.15;
  if (hasTrait(f, 'sanguinario')) p -= 0.1;
  if (f.side === 'a') p += favor / 400;
  if (plead) p += 0.3;
  return Math.max(0.05, Math.min(0.97, p));
}

// choice: si cae el jugador → 'suplicar' | 'aceptar'; si cae el rival → 'perdonar' | 'rematar'.
export function resolveMissio(state, choice, favor) {
  if (state.phase !== 'missio') return state;
  const st = clone(state);
  const rng = createRng(st.seed);
  const playerFell = st.fallen === 'a';
  let died = false;
  let enemyKilled = false;
  let favorDelta = st.favorDelta;

  if (playerFell) {
    const plead = choice === 'suplicar';
    if (plead) favorDelta -= 20;
    const spared = !st.deathAllowed || rng.chance(missioChance(st, favor, plead));
    died = !spared;
    st.log.push(spared ? 'El editor alza el pulgar: ¡missio!' : 'El público pide sangre. El editor lo condena.');
  } else if (choice === 'rematar') {
    enemyKilled = true;
    favorDelta -= 10;
    st.log.push(`${st.a.name} remata a ${st.b.name}. La plebe murmura.`);
  } else {
    favorDelta += 10;
    st.log.push(`${st.a.name} perdona a ${st.b.name}. ¡La grada aplaude!`);
  }
  if (hasTrait(st.a, 'favorito') && favorDelta > 0) favorDelta = Math.round(favorDelta * 1.25);

  st.phase = 'done';
  st.seed = rng.seed;
  st.result = {
    won: !playerFell, died, enemyKilled, favorDelta,
    hpLeft: st.a.hp, hpRatio: st.a.hp / st.a.maxHp, rounds: st.round,
  };
  return st;
}
