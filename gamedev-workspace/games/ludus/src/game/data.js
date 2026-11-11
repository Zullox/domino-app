// Datos del juego. Tono histórico: Capua, siglo I d. C.

export const STATS = ['str', 'agi', 'end', 'val'];
export const STAT_NAMES = { str: 'Fuerza', agi: 'Agilidad', end: 'Resistencia', val: 'Valor' };

export const CLASSES = {
  murmillo: {
    name: 'Murmillo', mods: { str: 1, agi: -2, end: 2, val: 1 }, beats: 'thraex',
    gear: 'Scutum y gladius', desc: 'Pesado y paciente. Aguanta castigo y desgasta al rival.',
  },
  thraex: {
    name: 'Tracio', mods: { str: 1, agi: 2, end: 0, val: 0 }, beats: 'retiarius', crit: 0.12,
    gear: 'Parmula y sica', desc: 'Rápido y letal. Sus golpes curvos buscan el crítico.',
  },
  retiarius: {
    name: 'Reciario', mods: { str: 0, agi: 2, end: 0, val: 1 }, beats: 'murmillo', net: 0.2,
    gear: 'Rete y tridente', desc: 'Sin casco ni escudo. Su red puede inmovilizar al rival.',
  },
  dimachaerus: {
    name: 'Dimachaerus', mods: { str: 1, agi: 1, end: -1, val: 0 }, beats: null, twin: true,
    gear: 'Dos gladii', desc: 'Ataca dos veces con cada embestida, pero es frágil.',
  },
};

export const TRAITS = {
  favorito: { name: 'Favorito de la plebe', desc: '+25 % de favor ganado y más probabilidad de missio.' },
  zurdo: { name: 'Zurdo', desc: '+10 % de esquiva.' },
  sanguinario: { name: 'Sanguinario', desc: '+10 % de daño, pero el público le perdona menos.' },
  veterano: { name: 'Veterano de las legiones', desc: '+3 de Valor.' },
  cobarde: { name: 'Cobarde', desc: '−3 de Valor, +5 % de esquiva.' },
  coloso: { name: 'Coloso', desc: '+15 % de vida.' },
  veloz: { name: 'Veloz', desc: 'Siempre ataca primero.' },
  fragil: { name: 'Huesos frágiles', desc: '−10 % de vida.' },
  inquebrantable: { name: 'Inquebrantable', desc: 'Pierde Valor a la mitad de ritmo.' },
  gloria: { name: 'Sediento de gloria', desc: '+50 % de fama ganada.' },
  gloton: { name: 'Glotón', desc: 'Come el doble.' },
  aprendiz: { name: 'Aprende rápido', desc: '+50 % de experiencia.' },
};

export const SCARS = {
  tuerto: { name: 'Tuerto', mods: { agi: -2, val: 1 } },
  cojera: { name: 'Cojera', mods: { agi: -2 } },
  brazo: { name: 'Brazo malherido', mods: { str: -2 } },
  costillas: { name: 'Costillas rotas mal soldadas', mods: { end: -2 } },
};

export const STANCES = {
  agresivo: { name: 'Agresivo', dealt: 1.25, taken: 1.15, desc: 'Más daño, peor defensa.' },
  equilibrado: { name: 'Equilibrado', dealt: 1, taken: 1, desc: 'Sin ventajas ni riesgos.' },
  defensivo: { name: 'Defensivo', dealt: 0.85, taken: 0.75, desc: 'Gana por desgaste.' },
};

export const TACTICS = {
  brutal: { name: 'Golpe brutal', desc: 'El próximo ataque hace el doble de daño.' },
  arena: { name: 'Arena a los ojos', desc: 'El rival falla más durante 2 asaltos.' },
  publico: { name: 'Provocar al público', desc: '+15 de favor y +2 de moral.' },
  aliento: { name: 'Segundo aliento', desc: 'Recupera el 15 % de la vida.' },
  finta: { name: 'Finta', desc: 'El próximo ataque no se puede esquivar y es crítico.' },
  muro: { name: 'Muro de escudo', desc: 'Recibe la mitad de daño durante 2 asaltos.' },
};

export const DIFFICULTIES = {
  tiro: {
    name: 'Tiro', sub: 'Fácil', startGold: 400, death: false, missioBase: 0.8,
    rivalMult: 0.85, foodMult: 1, bankruptcy: false,
    desc: 'Nadie muere: los caídos quedan heridos. Para aprender.',
  },
  veteranus: {
    name: 'Veteranus', sub: 'Normal', startGold: 250, death: true, missioBase: 0.55,
    rivalMult: 1, foodMult: 1, bankruptcy: false,
    desc: 'La muerte es posible si el público no concede la missio.',
  },
  legendario: {
    name: 'Lanista Legendario', sub: 'Difícil', startGold: 150, death: true, missioBase: 0.35,
    rivalMult: 1.15, foodMult: 1.5, bankruptcy: true,
    desc: 'Público cruel, rivales duros y la bancarrota acaba la partida.',
  },
};

export const BUILDINGS = {
  barracones: { name: 'Barracones', desc: 'Plazas para gladiadores.', values: [3, 5, 8, 12], costs: [0, 150, 400, 900], unit: 'plazas' },
  patio: { name: 'Patio de entrenamiento', desc: 'Multiplica el progreso del entrenamiento.', values: [1, 1.5, 2, 2.5, 3], costs: [0, 120, 300, 600, 1000], unit: '× entreno' },
  enfermeria: { name: 'Valetudinarium', desc: 'Enfermería: acelera la curación.', values: [1, 1.5, 2, 3], costs: [0, 100, 300, 700], unit: '× curación' },
};

export const TRAINING = {
  str: { name: 'Pesas y palus', stat: 'str' },
  agi: { name: 'Carreras y esquivas', stat: 'agi' },
  end: { name: 'Marchas con carga', stat: 'end' },
  descanso: { name: 'Descanso', stat: null },
};

export const NAMES = [
  'Priscus', 'Verus', 'Flamma', 'Spiculus', 'Carpophorus', 'Tetraites', 'Crixus', 'Oenomaus',
  'Gannicus', 'Celadus', 'Hermes', 'Triumphus', 'Marcus Attilius', 'Asteropaeus', 'Amandus',
  'Felix', 'Calamus', 'Columbus', 'Ursius', 'Bato', 'Dacicus', 'Thrax', 'Barbarus', 'Lucius',
  'Cassius', 'Durio', 'Faustus', 'Maximus', 'Niger', 'Rufus', 'Silvanus', 'Taurus', 'Vitalis',
];

export const ORIGINS = ['Tracia', 'Galia', 'Germania', 'Hispania', 'Dacia', 'Britania', 'Numidia', 'Grecia', 'Siria', 'Roma'];

// Escalera de la arena de Capua: 8 rivales + el campeón del lanista rival.
export const RIVAL_LANISTA = 'Cneo Cornelio Rufo';
export const LADDER = [
  { level: 1, reward: 60, fame: 5 },
  { level: 1, reward: 70, fame: 6 },
  { level: 2, reward: 90, fame: 8 },
  { level: 2, reward: 100, fame: 9 },
  { level: 3, reward: 130, fame: 11 },
  { level: 3, reward: 150, fame: 12 },
  { level: 4, reward: 180, fame: 15 },
  { level: 5, reward: 220, fame: 18 },
  { level: 6, reward: 400, fame: 40, boss: true, name: 'Ferox', title: `campeón de ${RIVAL_LANISTA}` },
];
