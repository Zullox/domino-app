// Eventos del día: una situación histórica con dos opciones.
// Cada opción tiene un texto y una función apply(game, ctx) que devuelve el juego modificado y un mensaje.

const best = (game) => game.gladiators.slice().sort((a, b) => b.level - a.level || b.wins - a.wins)[0];

export const EVENTS = [
  {
    id: 'senador',
    title: 'Un senador en el ludus',
    text: (g) => `El senador Lucio Aurelio admira a ${best(g)?.name} y ofrece comprarlo por una bolsa de denarios.`,
    when: (g) => g.gladiators.length >= 2,
    options: [
      {
        label: 'Vender (precio generoso)',
        apply: (g) => {
          const b = best(g);
          const price = 150 + b.level * 80;
          return [{ ...g, denarii: g.denarii + price, gladiators: g.gladiators.filter((x) => x.id !== b.id) }, `Vendes a ${b.name} por ${price} denarios.`];
        },
      },
      { label: 'Rechazar con cortesía', apply: (g) => [{ ...g, fama: g.fama + 3 }, 'El senador respeta tu orgullo. +3 de fama.'] },
    ],
  },
  {
    id: 'medico',
    title: 'Un medicus griego',
    text: () => 'Un médico de Alejandría ofrece sus servicios durante una semana a cambio de 60 denarios.',
    when: (g) => g.gladiators.some((x) => x.injuryDays > 0),
    options: [
      {
        label: 'Contratarlo (−60)',
        apply: (g) => [{ ...g, denarii: g.denarii - 60, gladiators: g.gladiators.map((x) => ({ ...x, injuryDays: Math.max(0, x.injuryDays - 3) })) }, 'Los heridos sanan 3 días antes.'],
      },
      { label: 'No hace falta', apply: (g) => [g, 'El médico se marcha a Neápolis.'] },
    ],
  },
  {
    id: 'motin',
    title: 'Rumores de motín',
    text: () => 'Los guardias oyen susurros en los barracones. Algunos hablan de Espartaco.',
    when: (g) => g.gladiators.length >= 3,
    options: [
      {
        label: 'Mejor comida y vino (−40)',
        apply: (g) => [{ ...g, denarii: g.denarii - 40, gladiators: g.gladiators.map((x) => ({ ...x, stats: { ...x.stats, val: Math.min(20, x.stats.val + 1) } })) }, 'Los ánimos se calman. +1 de Valor a todos.'],
      },
      {
        label: 'Castigar a los cabecillas',
        apply: (g) => [{ ...g, gladiators: g.gladiators.map((x) => ({ ...x, stats: { ...x.stats, val: Math.max(1, x.stats.val - 1) } })) }, 'El miedo reina en el ludus. −1 de Valor a todos.'],
      },
    ],
  },
  {
    id: 'edil',
    title: 'Los juegos del edil',
    text: () => 'El edil de Capua organiza unos munera y busca un lanista que patrocine el banquete previo.',
    options: [
      { label: 'Patrocinar (−80)', apply: (g) => [{ ...g, denarii: g.denarii - 80, fama: g.fama + 10, favor: Math.min(100, g.favor + 10) }, 'Tu nombre corre por Capua. +10 de fama y +10 de favor.'] },
      { label: 'Declinar', apply: (g) => [g, 'Otro lanista se lleva el honor.'] },
    ],
  },
  {
    id: 'augur',
    title: 'Los auspicios',
    text: () => 'Un augur ofrece leer el vuelo de las aves antes de los próximos juegos.',
    options: [
      { label: 'Pagar al augur (−20)', apply: (g) => [{ ...g, denarii: g.denarii - 20, favor: Math.min(100, g.favor + 8) }, 'Los auspicios son favorables y el pueblo lo sabe. +8 de favor.'] },
      { label: 'No creer en augurios', apply: (g) => [{ ...g, favor: Math.max(0, g.favor - 3) }, 'Algunos lo consideran impío. −3 de favor.'] },
    ],
  },
  {
    id: 'mercader',
    title: 'Un mercader de armas',
    text: () => 'Un herrero de Puteoli vende hierro nórico de calidad para entrenar con armas más pesadas.',
    options: [
      { label: 'Comprar (−70)', apply: (g) => [{ ...g, denarii: g.denarii - 70, gladiators: g.gladiators.map((x) => ({ ...x, stats: { ...x.stats, str: Math.min(20, x.stats.str + (x.injuryDays ? 0 : 1)) } })) }, 'Los sanos ganan +1 de Fuerza.'] },
      { label: 'Ahorrar', apply: (g) => [g, 'El mercader sigue su camino.'] },
    ],
  },
  {
    id: 'rival',
    title: 'Provocación de Cornelio Rufo',
    text: () => 'El lanista rival Cneo Cornelio Rufo se burla de tu ludus en el foro.',
    options: [
      { label: 'Responder en público', apply: (g) => [{ ...g, fama: g.fama + 4, favor: Math.max(0, g.favor - 4) }, 'Ganas fama, pero pareces arrogante. +4 de fama, −4 de favor.'] },
      { label: 'Ignorarlo', apply: (g) => [{ ...g, favor: Math.min(100, g.favor + 3) }, 'El pueblo aprecia tu dignidad. +3 de favor.'] },
    ],
  },
  {
    id: 'fiebre',
    title: 'Fiebres en los barracones',
    text: () => 'Las aguas estancadas traen fiebres. Varios hombres tiemblan en sus jergones.',
    when: (g) => g.gladiators.length >= 2,
    options: [
      { label: 'Limpiar y purgar (−50)', apply: (g) => [{ ...g, denarii: g.denarii - 50 }, 'La enfermedad no se extiende.'] },
      {
        label: 'Esperar a que pase',
        apply: (g, rng) => {
          const v = rng.pick(g.gladiators);
          return [{ ...g, gladiators: g.gladiators.map((x) => (x.id === v.id ? { ...x, injuryDays: x.injuryDays + 3 } : x)) }, `${v.name} cae enfermo 3 días.`];
        },
      },
    ],
  },
  {
    id: 'voluntario',
    title: 'Un auctoratus',
    text: () => 'Un ciudadano arruinado se ofrece como gladiador voluntario a cambio de deudas pagadas.',
    when: (g) => g.gladiators.length < g.capacity,
    options: [
      { label: 'Aceptarlo (−50)', apply: (g, rng, ctx) => { const r = ctx.recruit(); return [{ ...g, denarii: g.denarii - 50, gladiators: [...g.gladiators, r] }, `${r.name} (${r.origin}) se une a tu ludus.`]; } },
      { label: 'Rechazarlo', apply: (g) => [g, 'El hombre se aleja cabizbajo.'] },
    ],
  },
  {
    id: 'nemesis',
    title: 'Ofrenda a Némesis',
    text: () => 'Los gladiadores piden dinero para una ofrenda a Némesis, diosa de la arena.',
    options: [
      { label: 'Dar la ofrenda (−30)', apply: (g) => [{ ...g, denarii: g.denarii - 30, gladiators: g.gladiators.map((x) => ({ ...x, stats: { ...x.stats, val: Math.min(20, x.stats.val + 1) } })) }, 'Los hombres combaten con fe. +1 de Valor a todos.'] },
      { label: 'Negarla', apply: (g) => [{ ...g, favor: Math.max(0, g.favor - 2) }, 'Los hombres murmuran. −2 de favor.'] },
    ],
  },
];
