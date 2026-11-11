// Arte vectorial estilo fresco pompeyano: siluetas planas sobre terracota.

const INK = 'var(--ink)';
const BONE = 'var(--bone)';
const OCHRE = 'var(--ochre)';

function Helmet({ cls }) {
  switch (cls) {
    case 'murmillo':
      return (
        <g>
          <path d="M38 22 q12 -16 24 0 v14 h-24z" fill={INK} />
          <path d="M40 14 q10 -14 22 -4 q-6 2 -10 8z" fill={OCHRE} />
          <rect x="41" y="26" width="18" height="2" fill={BONE} />
        </g>
      );
    case 'thraex':
      return (
        <g>
          <path d="M38 24 q12 -14 24 0 v12 h-24z" fill={INK} />
          <path d="M50 10 q14 -4 12 10 q-4 -6 -10 -4z" fill={OCHRE} />
          <rect x="41" y="27" width="18" height="2" fill={BONE} />
        </g>
      );
    case 'dimachaerus':
      return <path d="M39 22 q11 -12 22 0 v10 h-22z" fill={INK} />;
    default:
      return null; // el reciario combate sin casco
  }
}

export function GladiatorFigure({ cls, flip = false, hurt = false, size = 120 }) {
  return (
    <svg viewBox="0 0 100 120" width={size} height={size * 1.2} style={{ transform: flip ? 'scaleX(-1)' : undefined, overflow: 'visible' }} aria-hidden>
      <g opacity={hurt ? 0.55 : 1}>
        <ellipse cx="50" cy="116" rx="26" ry="4" fill="rgba(0,0,0,.25)" />
        {/* cabeza y cuerpo */}
        <circle cx="50" cy="30" r="10" fill={INK} />
        <Helmet cls={cls} />
        <path d="M40 42 h20 l4 34 h-28z" fill={INK} />
        <path d="M36 74 h28 l-2 8 h-24z" fill={OCHRE} />
        <path d="M40 82 l-6 32 h7 l6 -26 h6 l6 26 h7 l-6 -32z" fill={INK} />
        {/* brazo de arma */}
        <path d="M60 46 l16 10 l-3 5 l-15 -8z" fill={INK} />
        {cls === 'retiarius' && (
          <g>
            <line x1="74" y1="20" x2="78" y2="100" stroke={INK} strokeWidth="3" />
            <path d="M70 14 l4 8 l4 -9 l4 9 l-2 -10" stroke={INK} strokeWidth="2.5" fill="none" />
            <path d="M22 60 q10 -14 20 -4 q-6 20 -22 14z" fill="none" stroke={INK} strokeWidth="1.5" strokeDasharray="3 2" />
            <path d="M40 42 l-8 4 l2 6 l8 -4z" fill={OCHRE} />
          </g>
        )}
        {cls === 'murmillo' && (
          <g>
            <rect x="18" y="44" width="22" height="40" rx="4" fill={OCHRE} stroke={INK} strokeWidth="2.5" />
            <circle cx="29" cy="64" r="4" fill={INK} />
            <path d="M74 56 l14 -16 l3 3 l-14 16z" fill={BONE} stroke={INK} strokeWidth="1.5" />
          </g>
        )}
        {cls === 'thraex' && (
          <g>
            <rect x="22" y="48" width="16" height="22" rx="2" fill={OCHRE} stroke={INK} strokeWidth="2.5" />
            <path d="M74 56 q16 -6 14 -22 q-2 12 -16 18z" fill={BONE} stroke={INK} strokeWidth="1.5" />
          </g>
        )}
        {cls === 'dimachaerus' && (
          <g>
            <path d="M74 56 l14 -16 l3 3 l-14 16z" fill={BONE} stroke={INK} strokeWidth="1.5" />
            <path d="M40 46 l-14 10 l2 4 l14 -8z" fill={INK} />
            <path d="M27 58 l-14 -14 l3 -3 l14 14z" fill={BONE} stroke={INK} strokeWidth="1.5" />
          </g>
        )}
      </g>
    </svg>
  );
}

export function Portrait({ cls, size = 56, dim = false }) {
  return (
    <div className="portrait" style={{ width: size, height: size, opacity: dim ? 0.5 : 1 }}>
      <svg viewBox="22 4 56 56" width={size} height={size} aria-hidden>
        <circle cx="50" cy="30" r="10" fill="var(--ink)" />
        <Helmet cls={cls} />
        <path d="M34 60 q16 -22 32 0z" fill="var(--ink)" />
      </svg>
    </div>
  );
}

// Vista del ludus: crece con los edificios.
export function LudusView({ buildings }) {
  const { barracones, patio, enfermeria } = buildings;
  const stone = barracones >= 3 ? 'var(--bone)' : 'var(--wood)';
  return (
    <svg viewBox="0 0 320 170" className="ludus-view" role="img" aria-label="Vista del ludus">
      <rect x="0" y="0" width="320" height="170" fill="var(--sky)" />
      <path d="M0 120 L60 90 L120 110 L200 80 L320 112 V170 H0z" fill="var(--hill)" />
      <rect x="10" y="100" width="300" height="62" fill="var(--sand)" />
      {/* muralla */}
      <rect x="10" y="96" width="300" height="8" fill={stone} stroke="var(--ink)" strokeWidth="1.5" />
      {/* barracones */}
      {Array.from({ length: barracones }, (_, i) => (
        <g key={i} transform={`translate(${16 + i * 30} 112)`}>
          <rect width="26" height="34" fill={stone} stroke="var(--ink)" strokeWidth="1.5" />
          <path d="M-3 0 L13 -10 L29 0z" fill="var(--terra)" stroke="var(--ink)" strokeWidth="1.5" />
          <rect x="9" y="16" width="8" height="18" fill="var(--ink)" />
        </g>
      ))}
      {/* patio con palus */}
      <ellipse cx="200" cy="138" rx="56" ry="16" fill="var(--sand-dark)" />
      {Array.from({ length: patio }, (_, i) => (
        <g key={i} transform={`translate(${168 + i * 16} 118)`}>
          <rect width="5" height="22" fill="var(--wood)" stroke="var(--ink)" strokeWidth="1" />
        </g>
      ))}
      {/* valetudinarium */}
      <g transform="translate(262 108)">
        <rect width="42" height="38" fill="var(--bone)" stroke="var(--ink)" strokeWidth="1.5" />
        <path d="M-4 0 L21 -12 L46 0z" fill="var(--terra)" stroke="var(--ink)" strokeWidth="1.5" />
        {Array.from({ length: enfermeria + 1 }, (_, i) => (
          <rect key={i} x={4 + i * (34 / (enfermeria + 1))} y="6" width="3" height="32" fill="var(--ochre)" />
        ))}
      </g>
    </svg>
  );
}
