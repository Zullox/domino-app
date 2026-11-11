import { BUILDINGS, DIFFICULTIES, LADDER, TRAINING, SCARS } from './data.js';
import { createRng } from './rng.js';
import { createGladiator, addXp, recruitPrice, canFight, hasTrait } from './gladiator.js';
import { EVENTS } from './events.js';

// Toda la partida es un objeto serializable. Cada función devuelve un estado nuevo.

const FOOD = 5;
const DAYS_PER_YEAR = 30;

function withRng(game, fn) {
  const rng = createRng(game.seed);
  const out = fn(rng);
  return { ...out, seed: rng.seed };
}

function capacityOf(buildings) {
  return BUILDINGS.barracones.values[buildings.barracones - 1];
}

function makeMarket(rng, game) {
  const avg = game.gladiators.length ? Math.round(game.gladiators.reduce((a, g) => a + g.level, 0) / game.gladiators.length) : 1;
  return Array.from({ length: 3 }, () => {
    const g = createGladiator(rng, { level: Math.max(1, avg - 1 + rng.int(0, 1)) });
    return { ...g, price: recruitPrice(g) };
  });
}

function makeContracts(rng, game) {
  const d = DIFFICULTIES[game.difficulty];
  const avg = game.gladiators.length ? Math.round(game.gladiators.reduce((a, g) => a + g.level, 0) / game.gladiators.length) : 1;
  const hosts = ['Fiesta del edil', 'Funeral de un magistrado', 'Banquete de un mercader', 'Juegos de la Vinalia', 'Munus privado'];
  return Array.from({ length: 2 }, (_, i) => {
    const level = Math.max(1, avg + rng.int(-1, 1));
    const enemy = createGladiator(rng, { level, statMult: d.rivalMult });
    return { id: `c${game.day}-${i}`, host: rng.pick(hosts), enemy, reward: 40 + level * 30 + rng.int(0, 20), fame: 2 + level * 2 };
  });
}

export function newGame(difficulty = 'veteranus', seed = Date.now() % 2147483647) {
  const d = DIFFICULTIES[difficulty];
  const base = {
    version: 1, difficulty, day: 1, denarii: d.startGold, fama: 0, favor: 20,
    buildings: { barracones: 1, patio: 1, enfermeria: 1 },
    gladiators: [], market: [], contracts: [], ladder: 0, ladderEnemy: null,
    hallOfFame: [], fallen: [], log: [], pendingEvent: null, debtDays: 0,
    gameOver: null, victory: false, seed,
  };
  return withRng(base, (rng) => {
    // Empiezas con dos gladiadores de clases distintas.
    const first = createGladiator(rng, { cls: 'murmillo' });
    const second = createGladiator(rng, { cls: rng.pick(['thraex', 'retiarius']) });
    const g = { ...base, gladiators: [first, second], capacity: capacityOf(base.buildings) };
    return {
      ...g,
      market: makeMarket(rng, g),
      contracts: makeContracts(rng, g),
      ladderEnemy: makeLadderEnemy(rng, g),
      log: [`Día 1. Compras un viejo ludus en las afueras de Capua con dos hombres: ${first.name} y ${second.name}.`],
    };
  });
}

function makeLadderEnemy(rng, game) {
  const step = LADDER[game.ladder];
  if (!step) return null;
  const d = DIFFICULTIES[game.difficulty];
  const e = createGladiator(rng, { level: step.level, statMult: d.rivalMult * (step.boss ? 1.1 : 1), name: step.name });
  return step.boss ? { ...e, cls: 'murmillo', traits: ['veterano', 'coloso'] } : e;
}

export function addLog(game, msg) {
  return { ...game, log: [`Día ${game.day}. ${msg}`, ...game.log].slice(0, 60) };
}

export function setTraining(game, id, training) {
  if (!TRAINING[training]) return game;
  return { ...game, gladiators: game.gladiators.map((g) => (g.id === id ? { ...g, training } : g)) };
}

export function buyRecruit(game, id) {
  const r = game.market.find((m) => m.id === id);
  if (!r) return game;
  if (game.gladiators.length >= game.capacity) return addLog(game, 'No hay plazas libres en los barracones.');
  if (game.denarii < r.price) return addLog(game, 'No tienes denarios suficientes.');
  const { price, ...glad } = r;
  return addLog(
    { ...game, denarii: game.denarii - price, gladiators: [...game.gladiators, glad], market: game.market.filter((m) => m.id !== id) },
    `Compras a ${glad.name} (${glad.origin}) por ${price} denarios.`,
  );
}

export function upgradeBuilding(game, key) {
  const b = BUILDINGS[key];
  const lvl = game.buildings[key];
  if (lvl >= b.values.length) return game;
  const cost = b.costs[lvl];
  if (game.denarii < cost) return addLog(game, 'No tienes denarios suficientes.');
  const buildings = { ...game.buildings, [key]: lvl + 1 };
  return addLog({ ...game, denarii: game.denarii - cost, buildings, capacity: capacityOf(buildings) }, `Mejoras ${b.name} a nivel ${lvl + 1}.`);
}

// Liberar con la rudis: el gladiador pasa al Salón de la Fama.
export function grantRudis(game, id) {
  const g = game.gladiators.find((x) => x.id === id);
  if (!g || g.wins < 5) return game;
  const fama = 10 * g.level;
  return addLog(
    { ...game, fama: game.fama + fama, gladiators: game.gladiators.filter((x) => x.id !== id), hallOfFame: [...game.hallOfFame, { name: g.name, cls: g.cls, wins: g.wins, kills: g.kills, day: game.day }] },
    `${g.name} recibe la rudis y es libre. Su leyenda queda en el Salón de la Fama. +${fama} de fama.`,
  );
}

export function dailyCost(game) {
  const d = DIFFICULTIES[game.difficulty];
  return Math.round(game.gladiators.reduce((a, g) => a + FOOD * (hasTrait(g, 'gloton') ? 2 : 1), 0) * d.foodMult);
}

export function endDay(game) {
  if (game.gameOver) return game;
  return withRng(game, (rng) => {
    const d = DIFFICULTIES[game.difficulty];
    const patio = BUILDINGS.patio.values[game.buildings.patio - 1];
    const heal = BUILDINGS.enfermeria.values[game.buildings.enfermeria - 1];
    const notes = [];

    const gladiators = game.gladiators.map((g) => {
      const out = { ...g, stats: { ...g.stats }, trainProgress: { ...g.trainProgress }, foughtToday: false };
      if (out.injuryDays > 0) {
        out.injuryDays = Math.max(0, Math.round((out.injuryDays - heal * (out.training === 'descanso' ? 1.5 : 1)) * 10) / 10);
        if (out.injuryDays <= 0) { out.injuryDays = 0; notes.push(`${out.name} se ha recuperado.`); }
      } else if (TRAINING[out.training].stat) {
        const k = TRAINING[out.training].stat;
        out.trainProgress[k] += patio * rng.range(2.5, 4) * (hasTrait(g, 'aprendiz') ? 1.5 : 1);
        const cost = 8 + out.stats[k] * 1.2;
        if (out.trainProgress[k] >= cost && out.stats[k] < 20) {
          out.trainProgress[k] -= cost;
          out.stats[k] += 1;
          notes.push(`${out.name} mejora su ${TRAINING[out.training].name.toLowerCase()} (+1).`);
        }
      }
      if ((game.day + 1) % DAYS_PER_YEAR === 0) out.age += 1;
      return out;
    });

    let next = { ...game, day: game.day + 1, gladiators };
    const cost = dailyCost(next);
    next.denarii -= cost;
    next.debtDays = next.denarii < 0 ? next.debtDays + 1 : 0;
    next = addLog(next, `Comida y cuidados: −${cost} denarios.${notes.length ? ' ' + notes.join(' ') : ''}`);

    if (next.denarii < 0) {
      if (d.bankruptcy && next.debtDays >= 3) next.gameOver = 'Los acreedores embargan tu ludus. Bancarrota.';
      else next = addLog(next, `¡Estás en deudas! (${next.debtDays} día/s)`);
    }
    if (next.gladiators.length === 0 && next.denarii < 40) next.gameOver = 'Sin gladiadores ni dinero para comprarlos, tu ludus cierra sus puertas.';

    next.market = makeMarket(rng, next);
    next.contracts = makeContracts(rng, next);

    // Evento del día (40 %).
    const pool = EVENTS.filter((e) => !e.when || e.when(next));
    next.pendingEvent = pool.length && rng.chance(0.4) ? rng.pick(pool).id : null;
    return next;
  });
}

export function resolveEvent(game, optionIndex) {
  const ev = EVENTS.find((e) => e.id === game.pendingEvent);
  if (!ev) return { ...game, pendingEvent: null };
  return withRng(game, (rng) => {
    const ctx = { recruit: () => createGladiator(rng, { level: 1 }) };
    const [g, msg] = ev.options[optionIndex].apply(game, rng, ctx);
    return addLog({ ...g, pendingEvent: null }, `${ev.title}: ${msg}`);
  });
}

// Aplica el resultado de un combate (de la escalera o de un contrato).
export function applyCombatResult(game, gladiatorId, result, source) {
  return withRng(game, (rng) => {
    const d = DIFFICULTIES[game.difficulty];
    let g = game.gladiators.find((x) => x.id === gladiatorId);
    if (!g) return game;
    const reward = source.reward;
    const fameGain = Math.round(source.fame * (hasTrait(g, 'gloria') ? 1.5 : 1));
    let next = { ...game, favor: Math.max(0, Math.min(100, game.favor + result.favorDelta)) };
    let msg;

    g = { ...g, foughtToday: true };
    if (result.won) {
      const gold = Math.round(reward * (result.enemyKilled ? 1.5 : 1));
      next.denarii += gold;
      next.fama += fameGain;
      g.wins += 1;
      if (result.enemyKilled) g.kills += 1;
      const [lv, ups] = addXp(g, 30, rng);
      g = lv;
      msg = `${g.name} vence${result.enemyKilled ? ' y remata a su rival' : ''}. +${gold} denarios, +${fameGain} de fama.${ups ? ` ¡Sube a nivel ${g.level}!` : ''}`;
      if (result.hpRatio < 0.5) g.injuryDays = Math.max(g.injuryDays, 1 + Math.round((0.5 - result.hpRatio) * 6));
    } else {
      g.losses += 1;
      const [lv] = addXp(g, 12, rng);
      g = lv;
      if (result.died) {
        next.gladiators = next.gladiators.filter((x) => x.id !== g.id);
        next.fallen = [...next.fallen, { name: g.name, cls: g.cls, wins: g.wins, day: game.day }];
        next = addLog(next, `${g.name} muere en la arena. Su nombre se graba en el muro de los caídos.`);
        return finishSource(next, source, false, rng);
      }
      g.injuryDays = rng.int(2, 5);
      // Herida grave: puede dejar secuela permanente.
      if (rng.chance(d.death ? 0.25 : 0.15)) {
        const free = Object.keys(SCARS).filter((s) => !g.scars.includes(s));
        if (free.length) {
          const sc = rng.pick(free);
          g.scars = [...g.scars, sc];
          msg = `${g.name} pierde, pero el público concede la missio. Queda marcado: ${SCARS[sc].name}. ${g.injuryDays} días de recuperación.`;
        }
      }
      msg = msg || `${g.name} pierde, pero salva la vida. ${g.injuryDays} días de recuperación.`;
    }
    next.gladiators = next.gladiators.map((x) => (x.id === g.id ? g : x));
    next = addLog(next, msg);
    return finishSource(next, source, result.won, rng);
  });
}

function finishSource(game, source, won, rng) {
  if (source.type === 'contract') {
    return { ...game, contracts: game.contracts.filter((c) => c.id !== source.id) };
  }
  if (source.type === 'ladder' && won) {
    const step = LADDER[game.ladder];
    const next = { ...game, ladder: game.ladder + 1 };
    if (step.boss) {
      return addLog({ ...next, victory: true, ladderEnemy: null }, `¡Tu ludus derrota al campeón de Cornelio Rufo! Eres el lanista más famoso de Capua.`);
    }
    return { ...next, ladderEnemy: makeLadderEnemy(rng, next) };
  }
  return game;
}

export function ladderSource(game) {
  const step = LADDER[game.ladder];
  return step ? { type: 'ladder', reward: step.reward, fame: step.fame, boss: !!step.boss, title: step.title } : null;
}

export { canFight };
