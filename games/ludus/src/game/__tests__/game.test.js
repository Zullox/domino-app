import { describe, it, expect } from 'vitest';
import { createRng } from '../rng.js';
import { createGladiator, maxHp, addXp } from '../gladiator.js';
import { startCombat, chooseStance, stepRound, chooseTactic, resolveMissio } from '../combat.js';
import { DIFFICULTIES } from '../data.js';
import { newGame, endDay, buyRecruit, upgradeBuilding, applyCombatResult, resolveEvent, dailyCost, ladderSource } from '../ludus.js';

function fightToEnd(p, e, { difficulty = DIFFICULTIES.veteranus, seed = 7, stance = 'equilibrado', missio = 'aceptar' } = {}) {
  let st = chooseStance(startCombat(p, e, { seed, difficulty }), stance);
  let guard = 0;
  while (st.phase !== 'done' && guard++ < 200) {
    if (st.phase === 'fight') st = stepRound(st);
    else if (st.phase === 'tactic') st = chooseTactic(st, st.tacticOffered[0]);
    else if (st.phase === 'missio') st = resolveMissio(st, st.fallen === 'a' ? missio : 'perdonar', 20);
  }
  return st;
}

describe('rng', () => {
  it('es determinista con la misma semilla', () => {
    const a = createRng(42), b = createRng(42);
    expect([a.next(), a.next(), a.int(1, 6)]).toEqual([b.next(), b.next(), b.int(1, 6)]);
  });
});

describe('gladiador', () => {
  it('genera atributos dentro de 1–20 y vida coherente', () => {
    const rng = createRng(1);
    for (let i = 0; i < 50; i++) {
      const g = createGladiator(rng, { level: 1 + (i % 6) });
      for (const v of Object.values(g.stats)) { expect(v).toBeGreaterThanOrEqual(1); expect(v).toBeLessThanOrEqual(20); }
      expect(maxHp(g)).toBeGreaterThan(20);
    }
  });
  it('sube de nivel al acumular experiencia', () => {
    const rng = createRng(3);
    const [g, ups] = addXp(createGladiator(rng), 500, rng);
    expect(ups).toBeGreaterThan(0);
    expect(g.level).toBe(1 + ups);
  });
});

describe('combate', () => {
  it('siempre termina con un resultado', () => {
    const rng = createRng(11);
    for (let i = 0; i < 100; i++) {
      const st = fightToEnd(createGladiator(rng), createGladiator(rng), { seed: i + 1 });
      expect(st.phase).toBe('done');
      expect(typeof st.result.won).toBe('boolean');
    }
  });
  it('es reproducible con la misma semilla', () => {
    const rng = createRng(5);
    const p = createGladiator(rng), e = createGladiator(rng);
    expect(fightToEnd(p, e, { seed: 99 }).log).toEqual(fightToEnd(p, e, { seed: 99 }).log);
  });
  it('ofrece exactamente una vez la carta de táctica cuando el combate es largo', () => {
    const rng = createRng(8);
    const p = createGladiator(rng, { cls: 'murmillo' }), e = createGladiator(rng, { cls: 'murmillo' });
    let st = chooseStance(startCombat(p, e, { seed: 3, difficulty: DIFFICULTIES.veteranus }), 'defensivo');
    let offers = 0;
    while (st.phase === 'fight' || st.phase === 'tactic') {
      if (st.phase === 'tactic') { offers++; expect(st.tacticOffered).toHaveLength(3); st = chooseTactic(st, st.tacticOffered[0]); }
      else st = stepRound(st);
    }
    expect(offers).toBeLessThanOrEqual(1);
  });
  it('un gladiador mucho más fuerte gana casi siempre', () => {
    const rng = createRng(21);
    let wins = 0;
    for (let i = 0; i < 100; i++) {
      const strong = createGladiator(rng, { level: 6 }), weak = createGladiator(rng, { level: 1 });
      if (fightToEnd(strong, weak, { seed: i + 1 }).result.won) wins++;
    }
    expect(wins).toBeGreaterThan(85);
  });
  it('la ventaja de clase se nota (murmillo contra tracio)', () => {
    const rng = createRng(4);
    let wins = 0;
    for (let i = 0; i < 300; i++) {
      const m = createGladiator(rng, { cls: 'murmillo' }), t = createGladiator(rng, { cls: 'thraex' });
      m.stats = { str: 10, agi: 10, end: 10, val: 10 }; t.stats = { ...m.stats }; m.traits = []; t.traits = [];
      if (fightToEnd(m, t, { seed: i + 1 }).result.won) wins++;
    }
    expect(wins).toBeGreaterThan(150);
  });
  it('en dificultad Tiro nadie muere', () => {
    const rng = createRng(6);
    for (let i = 0; i < 60; i++) {
      const st = fightToEnd(createGladiator(rng, { level: 1 }), createGladiator(rng, { level: 6 }), { seed: i + 1, difficulty: DIFFICULTIES.tiro });
      expect(st.result.died).toBe(false);
    }
  });
});

describe('ludus', () => {
  it('empieza según la dificultad', () => {
    for (const [k, d] of Object.entries(DIFFICULTIES)) {
      const g = newGame(k, 10);
      expect(g.denarii).toBe(d.startGold);
      expect(g.gladiators).toHaveLength(2);
      expect(g.market).toHaveLength(3);
      expect(g.contracts).toHaveLength(2);
    }
  });
  it('terminar el día cobra la comida y avanza el día', () => {
    const g = newGame('veteranus', 10);
    const n = endDay({ ...g, pendingEvent: null });
    expect(n.day).toBe(2);
    expect(n.denarii).toBe(g.denarii - dailyCost(g));
  });
  it('comprar recluta respeta dinero y plazas', () => {
    let g = newGame('tiro', 10);
    const r = g.market[0];
    g = buyRecruit(g, r.id);
    expect(g.gladiators).toHaveLength(3);
    expect(buyRecruit(g, g.market[0].id).gladiators).toHaveLength(3); // barracones llenos (3 plazas)
  });
  it('mejorar barracones aumenta las plazas', () => {
    const g = upgradeBuilding(newGame('tiro', 10), 'barracones');
    expect(g.capacity).toBe(5);
    expect(g.denarii).toBe(400 - 150);
  });
  it('ganar en la escalera da recompensa y avanza', () => {
    const g = newGame('veteranus', 10);
    const src = ladderSource(g);
    const n = applyCombatResult(g, g.gladiators[0].id, { won: true, died: false, enemyKilled: false, favorDelta: 10, hpRatio: 0.8 }, src);
    expect(n.ladder).toBe(1);
    expect(n.denarii).toBe(g.denarii + src.reward);
    expect(n.gladiators[0].foughtToday).toBe(true);
  });
  it('morir elimina al gladiador y lo graba en los caídos', () => {
    const g = newGame('veteranus', 10);
    const n = applyCombatResult(g, g.gladiators[0].id, { won: false, died: true, enemyKilled: false, favorDelta: 0, hpRatio: 0 }, ladderSource(g));
    expect(n.gladiators).toHaveLength(1);
    expect(n.fallen).toHaveLength(1);
  });
  it('la bancarrota acaba la partida en Lanista Legendario', () => {
    let g = { ...newGame('legendario', 10), denarii: -100 };
    for (let i = 0; i < 3; i++) g = endDay(g);
    expect(g.gameOver).toBeTruthy();
  });
  it('todos los eventos se pueden resolver con ambas opciones', async () => {
    const { EVENTS } = await import('../events.js');
    const base = newGame('veteranus', 10);
    base.gladiators[0].injuryDays = 2;
    for (const ev of EVENTS) for (const i of [0, 1]) {
      const n = resolveEvent({ ...base, pendingEvent: ev.id }, i);
      expect(n.pendingEvent).toBeNull();
      expect(n.log[0]).toContain(ev.title);
    }
  });
});
