import { useEffect, useRef, useState } from 'react';
import { CLASSES, STANCES, TACTICS } from '../game/data.js';
import { startCombat, chooseStance, stepRound, chooseTactic, resolveMissio, missioChance } from '../game/combat.js';
import { GladiatorFigure } from './art.jsx';

function Bar({ value, max, kind }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className={`bar bar-${kind}`} role="meter" aria-valuenow={value} aria-valuemax={max}>
      <div style={{ width: `${pct}%` }} />
    </div>
  );
}

function FighterPanel({ f, side, flash }) {
  return (
    <div className={`fighter fighter-${side} ${flash ? 'flash' : ''}`}>
      <GladiatorFigure cls={f.cls} flip={side === 'b'} hurt={f.hp <= 0} size={96} />
      <strong>{f.name}</strong>
      <small>{CLASSES[f.cls].name}</small>
      <Bar value={f.hp} max={f.maxHp} kind="hp" />
      <span className="bar-label">Vida {f.hp}/{f.maxHp}</span>
      <Bar value={f.morale} max={Math.max(f.maxMorale, 1)} kind="morale" />
      <span className="bar-label">Moral {f.morale}</span>
    </div>
  );
}

export default function Combat({ player, enemy, difficulty, favor, seed, title, onFinish }) {
  const [st, setSt] = useState(() => startCombat(player, enemy, { seed, difficulty }));
  const [speed, setSpeed] = useState(1);
  const [flash, setFlash] = useState({});
  const timer = useRef(null);

  useEffect(() => {
    if (st.phase !== 'fight') return undefined;
    timer.current = setTimeout(() => {
      const next = stepRound(st);
      const hits = {};
      for (const e of next.events) if (e.type === 'hit') hits[e.side === 'a' ? 'b' : 'a'] = true;
      setFlash(hits);
      if (navigator.vibrate && hits.a) navigator.vibrate(30);
      setSt(next);
    }, 750 / speed);
    return () => clearTimeout(timer.current);
  }, [st, speed]);

  const adv = CLASSES[player.cls].beats === enemy.cls ? 'ventaja' : CLASSES[enemy.cls].beats === player.cls ? 'desventaja' : null;

  return (
    <div className="combat">
      <header className="combat-head">
        <h2>{title}</h2>
        {st.phase === 'fight' && (
          <button className="chip" onClick={() => setSpeed(speed === 1 ? 2 : 1)}>×{speed === 1 ? 2 : 1}</button>
        )}
      </header>

      <div className="arena">
        <FighterPanel f={st.a} side="a" flash={flash.a} />
        <div className="versus">VS</div>
        <FighterPanel f={st.b} side="b" flash={flash.b} />
      </div>

      <ol className="combat-log" aria-live="polite">
        {st.log.slice(-4).reverse().map((l, i) => <li key={st.log.length - i}>{l}</li>)}
      </ol>

      {st.phase === 'stance' && (
        <div className="panel">
          {adv && <p className={`hint ${adv}`}>{adv === 'ventaja' ? `Tu ${CLASSES[player.cls].name.toLowerCase()} tiene ventaja contra el ${CLASSES[enemy.cls].name.toLowerCase()}.` : `Cuidado: el ${CLASSES[enemy.cls].name.toLowerCase()} tiene ventaja sobre tu ${CLASSES[player.cls].name.toLowerCase()}.`}</p>}
          <h3>Elige la postura</h3>
          <div className="choices">
            {Object.entries(STANCES).map(([k, s]) => (
              <button key={k} className="choice" onClick={() => setSt(chooseStance(st, k))}>
                <strong>{s.name}</strong><small>{s.desc}</small>
              </button>
            ))}
          </div>
        </div>
      )}

      {st.phase === 'tactic' && (
        <div className="panel">
          <h3>¡Momento clave! Elige una táctica</h3>
          <div className="choices">
            {st.tacticOffered.map((k) => (
              <button key={k} className="choice card" onClick={() => setSt(chooseTactic(st, k))}>
                <strong>{TACTICS[k].name}</strong><small>{TACTICS[k].desc}</small>
              </button>
            ))}
          </div>
        </div>
      )}

      {st.phase === 'missio' && st.fallen === 'a' && (
        <div className="panel danger">
          <h3>{st.a.name} ha caído</h3>
          {st.deathAllowed ? (
            <>
              <p>El editor mira a la grada. Probabilidad de <em>missio</em>: <b>{Math.round(missioChance(st, favor) * 100)} %</b></p>
              <div className="choices">
                <button className="choice" disabled={favor < 20} onClick={() => setSt(resolveMissio(st, 'suplicar', favor))}>
                  <strong>Suplicar al editor</strong><small>−20 de favor · {Math.round(missioChance(st, favor, true) * 100)} %</small>
                </button>
                <button className="choice" onClick={() => setSt(resolveMissio(st, 'aceptar', favor))}>
                  <strong>Aceptar el veredicto</strong><small>Que decida el público</small>
                </button>
              </div>
            </>
          ) : (
            <button className="primary" onClick={() => setSt(resolveMissio(st, 'aceptar', favor))}>Retirarse herido</button>
          )}
        </div>
      )}

      {st.phase === 'missio' && st.fallen === 'b' && (
        <div className="panel">
          <h3>{st.b.name} {st.surrendered ? 'se rinde' : 'yace en la arena'}</h3>
          <p>El público espera tu gesto.</p>
          <div className="choices">
            <button className="choice" onClick={() => setSt(resolveMissio(st, 'perdonar', favor))}>
              <strong>Perdonar</strong><small>+10 de favor</small>
            </button>
            <button className="choice" onClick={() => setSt(resolveMissio(st, 'rematar', favor))}>
              <strong>Rematar</strong><small>+50 % de premio · −10 de favor</small>
            </button>
          </div>
        </div>
      )}

      {st.phase === 'done' && (
        <div className={`panel ${st.result.won ? 'win' : 'danger'}`}>
          <h3>{st.result.won ? '¡Victoria!' : st.result.died ? `${player.name} ha muerto` : 'Derrota'}</h3>
          <p>{st.log[st.log.length - 1]}</p>
          <button className="primary" onClick={() => onFinish(st.result)}>Volver al ludus</button>
        </div>
      )}
    </div>
  );
}

