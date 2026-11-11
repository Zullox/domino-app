# LUDUS — Documento de diseño (v0.1)

> Título provisional. Alternativas: *Ludus: Sangre y Gloria*, *Lanista*, *Arena de Hierro*.

## 1. Pitch
Eres un **lanista** que compra esclavos y voluntarios, los entrena en tu ludus y los lleva a la arena: partidas de **30–60 segundos**, decisiones simples y un ludus que crece ante tus ojos.

**Pilares**
1. **Fácil de jugar:** todo con una mano, 1–3 toques por decisión, sin menús profundos.
2. **Apego a tus gladiadores:** cada uno tiene nombre, rasgos, cicatrices e historia. Perderlo duele.
3. **Ver crecer tu ludus:** cada mejora se ve en pantalla (de barracón de madera a escuela de mármol).

## 2. Core loop
| Ciclo | El jugador… |
|---|---|
| **30 s** — Combate | Elige postura → ve el combate automático → juega 1 carta de táctica en el momento clave → decide con el público si hay *missio* (perdón) |
| **5 min** — Día en el ludus | Asigna entrenamientos, cura heridos, compra en el mercado, acepta un contrato, resuelve un evento |
| **1 semana** — Temporada | Sube de arena (aldea → ciudad provincial → capital), gana fama, vence al lanista rival, retira leyendas al Salón de la Fama |

## 3. Gladiadores
**Atributos (1–20):** Fuerza (daño), Agilidad (esquiva/iniciativa), Resistencia (vida y aguante), Valor (moral: si cae a 0, se rinde).

**Clases (MVP: 4)** — inspiradas en las clases históricas:
| Clase | Equipo | Estilo | Fuerte contra |
|---|---|---|---|
| Murmillo | Escudo grande, espada | Tanque, aguanta | Tracio |
| Tracio | Escudo pequeño, sica | Rápido, críticos | Reciario |
| Reciario | Red y tridente | Control, inmoviliza | Murmillo |
| Dimachaerus | Dos espadas | Agresivo, frágil | — (comodín) |

Triángulo piedra-papel-tijera: +15 % de ventaja contra su clase débil.

**Rasgos** (1–2 aleatorios al reclutar, otros se ganan en combate). Ejemplos:
- *Favorito de la plebe* — +25 % de favor del público.
- *Zurdo* — +10 % de esquiva el primer turno.
- *Sanguinario* — +daño, pero el público le perdona menos.
- *Veterano del ejército* — +Valor.
- *Cicatriz en el ojo* (ganado al sobrevivir a una herida grave) — −Agilidad, +Valor.

**Progresión:** XP por combate → nivel → +1 punto de atributo. Edad: a los ~35 años pierde stats; puede **retirarse con honores** (pasa al Salón de la Fama y da un bonus permanente al ludus).

**Muerte:** posible solo si pierde **y** el público pide muerte. El jugador puede gastar Favor para pedir clemencia. Muertes poco frecuentes pero reales = tensión.

## 4. Combate (auto-battler con 3 decisiones)
1. **Antes:** postura → *Agresivo* (+daño, −defensa) / *Equilibrado* / *Defensivo* (+defensa, gana por aguante).
2. **Durante:** a mitad del combate aparecen **3 cartas de táctica** (ej. *Golpe al escudo*, *Arena a los ojos*, *Provocar al público*) → eliges 1.
3. **Final:** si alguien cae, el público vota:
   - Si **tu** gladiador cae → gastas Favor para pedir *missio* (perdón).
   - Si cae **el rival** → eliges *perdonar* (+Fama, +Favor) o *rematar* (+Oro, −Favor, el rival guarda rencor).

Duración objetivo: 30–45 s, con botón ×2 de velocidad. Resolución por turnos con RNG con semilla (reproducible y testeable).

**Fórmulas iniciales (para equilibrar después):**
- Vida = 20 + Resistencia × 4
- Daño = 2 + Fuerza × 0,6 × (postura) × (ventaja de clase) ± 20 %
- Esquiva = 5 % + Agilidad × 1,5 % (máx. 40 %)
- Valor baja 1 por cada 15 % de vida perdida; a 0 → se rinde.

## 5. El ludus (la "base")
| Edificio | Efecto | Niveles |
|---|---|---|
| Barracones | Nº máximo de gladiadores (3 → 12) | 4 |
| Patio de entrenamiento | XP por entrenamiento | 5 |
| Enfermería | Días de recuperación de heridas | 4 |
| Herrería | Mejoras de equipo por clase | 4 |
| Termas | Recupera Valor más rápido | 3 |
| Palco de mecenas | Contratos mejor pagados | 3 |

Cada mejora cambia el dibujo del ludus en la pantalla principal.

## 6. Un día en el ludus
- **Entrenar:** arrastra a cada gladiador a una actividad (Fuerza, Agilidad, Resistencia, Descanso). Se resuelve al pasar el día.
- **Mercado de esclavos:** 3 reclutas aleatorios al día con rasgos visibles (y 1 oculto, sorpresa).
- **Contratos:** 2–3 ofertas (ej. *"Fiesta del edil: combate contra un murmillo nivel 4 — 120 denarios"*).
- **Evento del día:** una carta con 2 opciones (ej. *"Un senador quiere comprar a tu mejor tracio por 500"*; *"Motín en los barracones"*; *"Un médico griego ofrece sus servicios"*). Son decisiones con consecuencias que crean historias.

## 7. Economía
| Fuentes | Sumideros |
|---|---|
| Premios de combate, contratos, venta de gladiadores, mecenas | Comida diaria (5/gladiador), medicina, reclutas, mejoras, equipo |

- **Denarios** (moneda), **Fama** (desbloquea arenas y contratos), **Favor del público** (se gasta en *missio* y bonus de combate).
- Regla: el jugador debe poder permitirse **1 mejora cada 2–3 días** de juego.

## 8. Enganche (sin trucos abusivos)
- **Rival con nombre:** un lanista rival (ej. *Cornelio el Gordo*) que te provoca, roba reclutas y al que vences al final de cada arena.
- **Historias emergentes:** rasgos + cicatrices + rencores → "mi reciario tuerto que se vengó del tipo que lo dejó ciego".
- **Salón de la Fama:** las leyendas retiradas dan bonus permanentes → ganas de una "siguiente generación".
- **Reto diario:** un combate especial con condiciones (ej. *"solo reciarios"*) y recompensa.
- **Coleccionismo:** completar el *Códice* de clases, rasgos y eventos vistos.
- **Sesiones cortas:** un día = ~3–5 min. Se juega en el bus.

## 9. Controles y UX
- Móvil vertical, una mano, botones grandes (≥ 48 px).
- Pantallas: **Ludus** (principal) · **Gladiadores** · **Mercado** · **Arena** · **Códice**.
- Feedback en cada acción: vibración, sonido metálico, números de daño, rugido del público.

## 10. Arte y sonido
- Estilo **fresco pompeyano**: siluetas planas, paleta terracota, ocre, negro y blanco hueso; texturas de pared desgastada. Barato de producir en SVG y muy reconocible.
- Gladiadores modulares: cuerpo + casco + arma + escudo por clase (combinaciones = variedad).
- Sonido: choques metálicos, público (murmullo → rugido), tambores. Música: percusión y cuerdas, en bucle.

## 11. Tecnología
- **React + Vite** (UI de gestión), igual que domino-app; combate dibujado en Canvas (o Phaser si crece).
- Lógica pura en `src/game/` (combate, economía, eventos) con tests vitest y RNG con semilla.
- Guardado local (localStorage → Firebase más adelante).
- Android con Capacitor (reutilizando la configuración del dominó).
- Ubicación: `games/ludus/` en domino-app.

## 12. Alcance
**MVP (prototipo de 1–2 días):**
- 4 clases, 12 rasgos, 3 edificios (Barracones, Patio, Enfermería).
- Combate auto con postura + 1 carta + missio.
- Mercado, entrenamiento, 10 eventos, 1 arena con escalera de 8 rivales + jefe rival.
- Guardado local. Arte provisional en SVG.

**v1:** 3 arenas, 6 edificios, herrería y equipo, Salón de la Fama, reto diario, sonido y música.

**Futuro:** combates 2v2 y contra bestias, torneos online entre ludus de jugadores (reutilizando domino-server), temporadas, aspectos.

## 13. Métricas
- Duración media de sesión (objetivo 5–10 min).
- % que llega al día 7 de juego en la primera sesión.
- % de combates en los que se usa la carta de táctica.
- Retención D1 / D7.

## 14. Preguntas abiertas
- ¿Muerte permanente activada por defecto o modo "clemente"?
- ¿Monetización? (Propuesta: ninguna en el MVP; después, solo cosméticos, nunca pagar para ganar.)
