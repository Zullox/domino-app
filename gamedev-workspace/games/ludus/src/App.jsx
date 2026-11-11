import { useEffect, useState } from 'react';
import { BUILDINGS, CLASSES, DIFFICULTIES, LADDER, RIVAL_LANISTA, STAT_NAMES, TRAINING, TRAITS, SCARS } from './game/data.js';
import { newGame, endDay, buyRecruit, upgradeBuilding, setTraining, grantRudis, resolveEvent, applyCombatResult, ladderSource, dailyCost, canFight } from './game/ludus.js';
import { effectiveStats, maxHp, power, xpToNext } from './game/gladiator.js';
import { EVENTS } from './game/events.js';
import { LudusView, Portrait } from './ui/art.jsx';
import Combat from './ui/Combat.jsx';

const SAVE_KEY = 'ludus-save-v1';

function load() {
  try { const raw = localStorage.getItem(SAVE_KEY); return raw ? JSON.parse(raw) : null; } catch { return null; }
}
function save(game) {
  try { if (game) localStorage.setItem(SAVE_KEY, JSON.stringify(game)); else localStorage.removeItem(SAVE_KEY); } catch { /* sin almacenamiento */ }
}

function StatRow({ label, value }) {
  return (
    <div className="stat">
      <span>{label}</span>
      <div className="stat-bar"><div style={{ width: `${value * 5}%` }} /></div>
      <b>{value}</b>
    </div>
  );
}

function GladiatorCard({ g, children, compact }) {
  const s = effectiveStats(g);
  return (
    <article className={`gcard ${g.injuryDays > 0 ? 'injured' : ''}`}>
      <div className="gcard-head">
        <Portrait cls={g.cls} dim={g.injuryDays > 0} />
        <div>
          <h3>{g.name} <small>Nv {g.level}</small></h3>
          <p className="muted">{CLASSES[g.cls].name} · {g.origin} · {g.age} años</p>
          <p className="muted">{g.wins}V – {g.losses}D{g.kills ? ` · ${g.kills} muertes` : ''} · Vida {maxHp(g)}</p>
        </div>
      </div>
      {!compact && (
        <>
          {Object.entries(STAT_NAMES).map(([k, n]) => <StatRow key={k} label={n} value={s[k]} />)}
          <div className="xp"><div style={{ width: `${(g.xp / xpToNext(g.level)) * 100}%` }} /></div>
        </>
      )}
      <div className="tags">
        {g.traits.map((t) => <span key={t} className="tag" title={TRAITS[t].desc}>{TRAITS[t].name}</span>)}
        {g.scars.map((t) => <span key={t} className="tag scar">{SCARS[t].name}</span>)}
        {g.injuryDays > 0 && <span className="tag scar">Herido {Math.ceil(g.injuryDays)} d</span>}
      </div>
      {children}
    </article>
  );
}

function StartScreen({ onStart, hasSave, onContinue }) {
  const [diff, setDiff] = useState('veteranus');
  return (
    <div className="start">
      <h1>LVDVS</h1>
      <p className="subtitle">Blood and Glory</p>
      <p className="intro">Capua, año 70 d. C. Compras un viejo ludus con dos hombres y un puñado de denarios. Entrénalos, llévalos a la arena y derrota al campeón de {RIVAL_LANISTA}.</p>
      {hasSave && <button className="primary" onClick={onContinue}>Continuar partida</button>}
      <h2>Nueva partida</h2>
      <div className="choices vertical">
        {Object.entries(DIFFICULTIES).map(([k, d]) => (
          <button key={k} className={`choice ${diff === k ? 'selected' : ''}`} onClick={() => setDiff(k)} aria-pressed={diff === k}>
            <strong>{d.name} <small>· {d.sub}</small></strong>
            <small>{d.desc} Empiezas con {d.startGold} denarios.</small>
          </button>
        ))}
      </div>
      <button className="primary" onClick={() => onStart(diff)}>Comprar el ludus</button>
    </div>
  );
}

function LudusTab({ game, update }) {
  return (
    <section>
      <LudusView buildings={game.buildings} />
      <div className="day-bar">
        <span>Gasto diario: <b>{dailyCost(game)}</b> denarios</span>
        <button className="primary" onClick={() => update(endDay(game))}>Terminar el día</button>
      </div>
      <h2>Edificios</h2>
      {Object.entries(BUILDINGS).map(([k, b]) => {
        const lvl = game.buildings[k];
        const max = lvl >= b.values.length;
        return (
          <div key={k} className="row">
            <div>
              <strong>{b.name} <small>Nv {lvl}</small></strong>
              <p className="muted">{b.desc} Ahora: {b.values[lvl - 1]} {b.unit}{max ? '' : ` → ${b.values[lvl]}`}</p>
            </div>
            <button disabled={max || game.denarii < b.costs[lvl]} onClick={() => update(upgradeBuilding(game, k))}>
              {max ? 'Máx.' : `${b.costs[lvl]} ◉`}
            </button>
          </div>
        );
      })}
      <h2>Crónica</h2>
      <ul className="chronicle">{game.log.slice(0, 12).map((l, i) => <li key={i}>{l}</li>)}</ul>
      {(game.hallOfFame.length > 0 || game.fallen.length > 0) && (
        <>
          <h2>Memoria del ludus</h2>
          {game.hallOfFame.map((h, i) => <p key={`h${i}`} className="muted">🏛 {h.name}, {CLASSES[h.cls].name} — {h.wins} victorias. Liberado el día {h.day}.</p>)}
          {game.fallen.map((h, i) => <p key={`f${i}`} className="muted">✝ {h.name}, {CLASSES[h.cls].name} — {h.wins} victorias. Cayó el día {h.day}.</p>)}
        </>
      )}
    </section>
  );
}

function GladiatorsTab({ game, update }) {
  return (
    <section>
      <p className="muted">Plazas: {game.gladiators.length}/{game.capacity}. El entrenamiento se aplica al terminar el día.</p>
      {game.gladiators.map((g) => (
        <GladiatorCard key={g.id} g={g}>
          <div className="train">
            {Object.entries(TRAINING).map(([k, t]) => (
              <button key={k} className={`chip ${g.training === k ? 'selected' : ''}`} onClick={() => update(setTraining(game, g.id, k))} aria-pressed={g.training === k}>
                {k === 'descanso' ? 'Descanso' : STAT_NAMES[t.stat]}
              </button>
            ))}
          </div>
          {g.wins >= 5 && (
            <button className="ghost" onClick={() => update(grantRudis(game, g.id))}>Conceder la rudis (liberar como leyenda)</button>
          )}
        </GladiatorCard>
      ))}
    </section>
  );
}

function MarketTab({ game, update }) {
  const full = game.gladiators.length >= game.capacity;
  return (
    <section>
      <p className="muted">Mercado de esclavos de Capua. Nuevos reclutas cada día.{full ? ' Tus barracones están llenos.' : ''}</p>
      {game.market.length === 0 && <p>No quedan reclutas hoy.</p>}
      {game.market.map((r) => (
        <GladiatorCard key={r.id} g={r}>
          <button className="primary" disabled={full || game.denarii < r.price} onClick={() => update(buyRecruit(game, r.id))}>
            Comprar · {r.price} ◉
          </button>
        </GladiatorCard>
      ))}
    </section>
  );
}

function ArenaTab({ game, onFight }) {
  const [pick, setPick] = useState(null);
  const ready = game.gladiators.filter(canFight);
  const src = ladderSource(game);
  const offers = [
    ...(src && game.ladderEnemy ? [{ key: 'ladder', label: src.boss ? `Combate final: ${game.ladderEnemy.name}, ${src.title}` : `Arena de Capua · combate ${game.ladder + 1} de ${LADDER.length}`, enemy: game.ladderEnemy, source: src }] : []),
    ...game.contracts.map((c) => ({ key: c.id, label: c.host, enemy: c.enemy, source: { type: 'contract', id: c.id, reward: c.reward, fame: c.fame } })),
  ];
  return (
    <section>
      {game.victory && <p className="hint ventaja">Has vencido al campeón de {RIVAL_LANISTA}. Sigue haciendo crecer tu leyenda con contratos.</p>}
      <h2>1. Elige a tu gladiador</h2>
      {ready.length === 0 && <p className="muted">Nadie puede combatir hoy (heridos o ya combatieron). Termina el día.</p>}
      <div className="picker">
        {ready.map((g) => (
          <button key={g.id} className={`pick ${pick === g.id ? 'selected' : ''}`} onClick={() => setPick(g.id)} aria-pressed={pick === g.id}>
            <Portrait cls={g.cls} size={44} />
            <span>{g.name}<small>Nv {g.level} · {power(g)} poder</small></span>
          </button>
        ))}
      </div>
      <h2>2. Elige el combate</h2>
      {offers.map((o) => (
        <div key={o.key} className="row offer">
          <Portrait cls={o.enemy.cls} size={44} />
          <div>
            <strong>{o.label}</strong>
            <p className="muted">{o.enemy.name} · {CLASSES[o.enemy.cls].name} Nv {o.enemy.level} · {power(o.enemy)} poder</p>
            <p className="muted">Premio {o.source.reward} ◉ · +{o.source.fame} fama</p>
          </div>
          <button className="primary" disabled={!pick} onClick={() => onFight(pick, o)}>Luchar</button>
        </div>
      ))}
    </section>
  );
}

function EventModal({ game, update }) {
  const ev = EVENTS.find((e) => e.id === game.pendingEvent);
  if (!ev) return null;
  return (
    <div className="modal" role="dialog" aria-modal="true" aria-labelledby="ev-title">
      <div className="modal-box">
        <h2 id="ev-title">{ev.title}</h2>
        <p>{ev.text(game)}</p>
        <div className="choices vertical">
          {ev.options.map((o, i) => (
            <button key={i} className="choice" onClick={() => update(resolveEvent(game, i))}><strong>{o.label}</strong></button>
          ))}
        </div>
      </div>
    </div>
  );
}

const TABS = [
  ['ludus', 'Ludus'],
  ['gladiators', 'Gladiadores'],
  ['market', 'Mercado'],
  ['arena', 'Arena'],
];

export default function App() {
  const [game, setGame] = useState(load);
  const [started, setStarted] = useState(false);
  const [tab, setTab] = useState('ludus');
  const [fight, setFight] = useState(null);

  useEffect(() => { save(game); }, [game]);

  if (!started || !game) {
    return (
      <StartScreen
        hasSave={!!game && !game.gameOver}
        onContinue={() => setStarted(true)}
        onStart={(d) => { setGame(newGame(d)); setTab('ludus'); setStarted(true); }}
      />
    );
  }

  if (fight) {
    const player = game.gladiators.find((g) => g.id === fight.gid);
    return (
      <Combat
        player={player}
        enemy={fight.offer.enemy}
        difficulty={DIFFICULTIES[game.difficulty]}
        favor={game.favor}
        seed={(game.seed ^ (game.day * 7919)) >>> 0 || 1}
        title={fight.offer.label}
        onFinish={(result) => { setGame(applyCombatResult(game, fight.gid, result, fight.offer.source)); setFight(null); setTab('ludus'); }}
      />
    );
  }

  return (
    <div className="app">
      <header className="topbar">
        <div><small>Día</small><b>{game.day}</b></div>
        <div><small>Denarios</small><b className={game.denarii < 0 ? 'neg' : ''}>{game.denarii}</b></div>
        <div><small>Fama</small><b>{game.fama}</b></div>
        <div><small>Favor</small><b>{game.favor}</b></div>
      </header>

      <main>
        {tab === 'ludus' && <LudusTab game={game} update={setGame} />}
        {tab === 'gladiators' && <GladiatorsTab game={game} update={setGame} />}
        {tab === 'market' && <MarketTab game={game} update={setGame} />}
        {tab === 'arena' && <ArenaTab game={game} onFight={(gid, offer) => setFight({ gid, offer })} />}
      </main>

      <nav className="tabs">
        {TABS.map(([k, n]) => (
          <button key={k} className={tab === k ? 'active' : ''} onClick={() => setTab(k)} aria-current={tab === k}>{n}</button>
        ))}
      </nav>

      <EventModal game={game} update={setGame} />

      {game.gameOver && (
        <div className="modal" role="alertdialog">
          <div className="modal-box">
            <h2>Fin de tu ludus</h2>
            <p>{game.gameOver}</p>
            <p className="muted">Sobreviviste {game.day} días y alcanzaste {game.fama} de fama.</p>
            <button className="primary" onClick={() => { setGame(null); setStarted(false); }}>Empezar de nuevo</button>
          </div>
        </div>
      )}
    </div>
  );
}
