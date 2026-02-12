// ============================================================================
// PANTALLA DE TUTORIAL / ONBOARDING
// ============================================================================
// Tutorial interactivo para nuevos jugadores
// Se muestra al primer inicio y se puede acceder desde Ajustes
// ============================================================================

import React, { useState, useCallback, memo } from 'react';
import { getTranslation } from '../constants/i18n';

const C = {
  bg: { deep: '#0a0a0f', surface: '#12121a', elevated: '#1a1a24', card: '#1e1e2a' },
  text: { primary: '#ffffff', secondary: '#a0a0b0', muted: '#606070' },
  gold: { main: '#F59E0B', dark: '#D97706', light: '#FBBF24' },
  accent: { blue: '#3B82F6', green: '#10B981', purple: '#8B5CF6' }
};

// ============================================================================
// CONTENIDO DEL TUTORIAL
// ============================================================================

const TUTORIAL_STEPS = {
  es: [
    {
      title: '¡Bienvenido a Dominó Ranked!',
      subtitle: 'Dominó cubano competitivo online',
      content: 'Juega dominó cubano en equipos de 2 contra 2. Sube de rango, desbloquea cosméticos y demuestra que eres el mejor.',
      icon: '🎲',
      visual: 'welcome'
    },
    {
      title: 'Las fichas',
      subtitle: 'Dominó cubano doble 9',
      content: 'Se juega con 55 fichas (del doble blanco al doble 9). Cada jugador recibe 10 fichas. Las 15 restantes quedan fuera del juego.',
      icon: '🁣',
      visual: 'tiles',
      tip: '¡Nadie sabe cuáles son las 15 fichas fuera!'
    },
    {
      title: 'Equipos',
      subtitle: 'Tú y tu compañero vs. los rivales',
      content: 'Los jugadores sentados frente a frente son compañeros de equipo. Jugador 1 y 3 contra Jugador 2 y 4. ¡La comunicación es clave!',
      icon: '🤝',
      visual: 'teams',
      tip: 'Presta atención a las fichas que juega tu compañero'
    },
    {
      title: 'Cómo jugar',
      subtitle: 'Coloca fichas en los extremos',
      content: 'En tu turno, coloca una ficha que coincida con un extremo del tablero. Si no puedes jugar, pasas. El primer equipo en llegar a 200 puntos gana.',
      icon: '🎯',
      visual: 'gameplay',
      tip: 'Toca una ficha y luego el lado del tablero donde quieres jugarla'
    },
    {
      title: 'Formas de ganar una ronda',
      subtitle: 'Dominó, Tranca y más',
      content: 'Dominó: un jugador se queda sin fichas. Tranca: nadie puede jugar (gana el equipo con menos puntos en mano). Capicúa: cerrar con el mismo número en ambos extremos. ¡Pollona: ganar sin que el rival anote!',
      icon: '🏆',
      visual: 'scoring',
      tip: 'La capicúa y la pollona dan bonificaciones extra'
    },
    {
      title: 'Sistema de rangos',
      subtitle: 'De Bronce V a Leyenda',
      content: 'Gana partidas ranked para subir tu MMR (rating). Pasa por Bronce, Plata, Oro, Platino, Diamante, Maestro, Gran Maestro y Leyenda. Tu rango se muestra a todos.',
      icon: '⭐',
      visual: 'ranks'
    },
    {
      title: 'Tienda y cosméticos',
      subtitle: 'Personaliza tu estilo',
      content: 'Gana tokens jugando y úsalos para desbloquear skins de fichas, tableros, avatares y marcos. ¡Destaca en el campo de juego!',
      icon: '🛒',
      visual: 'shop'
    },
    {
      title: '¡Listo para jugar!',
      subtitle: 'Tu primera partida te espera',
      content: 'Empieza con una partida contra la IA para practicar, o lánzate directamente a una partida online ranked. ¡Buena suerte!',
      icon: '🚀',
      visual: 'ready',
      cta: 'Jugar ahora'
    }
  ],
  en: [
    {
      title: 'Welcome to Dominó Ranked!',
      subtitle: 'Competitive online Cuban domino',
      content: 'Play Cuban domino in 2v2 teams. Climb the ranks, unlock cosmetics, and prove you\'re the best.',
      icon: '🎲',
      visual: 'welcome'
    },
    {
      title: 'The tiles',
      subtitle: 'Cuban double-9 domino',
      content: '55 tiles are used (from double blank to double 9). Each player gets 10 tiles. The remaining 15 are out of the game.',
      icon: '🁣',
      visual: 'tiles',
      tip: 'Nobody knows which 15 tiles are out!'
    },
    {
      title: 'Teams',
      subtitle: 'You and your partner vs. opponents',
      content: 'Players sitting across from each other are teammates. Player 1 & 3 vs Player 2 & 4. Communication is key!',
      icon: '🤝',
      visual: 'teams',
      tip: 'Pay attention to what your partner plays'
    },
    {
      title: 'How to play',
      subtitle: 'Place tiles on the ends',
      content: 'On your turn, place a tile matching one end of the board. If you can\'t play, you pass. First team to 200 points wins.',
      icon: '🎯',
      visual: 'gameplay',
      tip: 'Tap a tile then tap the board side where you want to play it'
    },
    {
      title: 'Ways to win a round',
      subtitle: 'Domino, Tranca and more',
      content: 'Domino: a player runs out of tiles. Tranca: nobody can play (lowest hand total wins). Capicúa: close with same number on both ends. Pollona: win without opponent scoring!',
      icon: '🏆',
      visual: 'scoring',
      tip: 'Capicúa and pollona give bonus rewards'
    },
    {
      title: 'Ranking system',
      subtitle: 'From Bronze V to Legend',
      content: 'Win ranked games to increase your MMR. Progress through Bronze, Silver, Gold, Platinum, Diamond, Master, Grandmaster, and Legend.',
      icon: '⭐',
      visual: 'ranks'
    },
    {
      title: 'Shop & cosmetics',
      subtitle: 'Customize your style',
      content: 'Earn tokens by playing and use them to unlock tile skins, boards, avatars, and frames. Stand out on the battlefield!',
      icon: '🛒',
      visual: 'shop'
    },
    {
      title: 'Ready to play!',
      subtitle: 'Your first match awaits',
      content: 'Start with an AI match to practice, or jump straight into ranked online play. Good luck!',
      icon: '🚀',
      visual: 'ready',
      cta: 'Play now'
    }
  ]
};

// ============================================================================
// INDICADOR DE PASO
// ============================================================================

const StepDots = memo(({ total, current }) => (
  <div style={{
    display: 'flex',
    gap: 8,
    justifyContent: 'center',
    padding: '16px 0'
  }}>
    {Array.from({ length: total }, (_, i) => (
      <div
        key={i}
        style={{
          width: i === current ? 24 : 8,
          height: 8,
          borderRadius: 4,
          background: i === current ? C.gold.main : i < current ? C.accent.green : C.bg.elevated,
          transition: 'all 0.3s ease'
        }}
      />
    ))}
  </div>
));

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

const TutorialScreen = ({ onComplete, onSkip, language = 'es' }) => {
  const [step, setStep] = useState(0);
  
  const steps = TUTORIAL_STEPS[language] || TUTORIAL_STEPS.es;
  const current = steps[step];
  const isLast = step === steps.length - 1;
  
  const handleNext = useCallback(() => {
    if (isLast) {
      // Marcar tutorial como completado
      try {
        localStorage.setItem('dominoTutorialComplete', 'true');
      } catch (e) {}
      onComplete?.();
    } else {
      setStep(s => s + 1);
    }
  }, [isLast, onComplete]);
  
  const handlePrev = useCallback(() => {
    if (step > 0) setStep(s => s - 1);
  }, [step]);
  
  const handleSkip = useCallback(() => {
    try {
      localStorage.setItem('dominoTutorialComplete', 'true');
    } catch (e) {}
    onSkip?.();
  }, [onSkip]);
  
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: C.bg.deep,
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Skip */}
      {!isLast && (
        <div style={{
          position: 'absolute',
          top: 16,
          right: 16,
          zIndex: 10
        }}>
          <button
            onClick={handleSkip}
            style={{
              background: 'none',
              border: 'none',
              color: C.text.muted,
              fontSize: 14,
              cursor: 'pointer',
              padding: '8px 16px'
            }}
          >
            {language === 'es' ? 'Saltar' : 'Skip'} →
          </button>
        </div>
      )}
      
      {/* Contenido */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '40px 24px 20px',
        textAlign: 'center'
      }}>
        {/* Icono */}
        <div style={{
          fontSize: 80,
          marginBottom: 24,
          filter: 'drop-shadow(0 4px 20px rgba(245, 158, 11, 0.3))',
          animation: 'pulse 2s infinite'
        }}>
          {current.icon}
        </div>
        
        {/* Título */}
        <h1 style={{
          fontSize: 28,
          fontWeight: 800,
          color: C.text.primary,
          margin: '0 0 8px',
          lineHeight: 1.2
        }}>
          {current.title}
        </h1>
        
        {/* Subtítulo */}
        <p style={{
          fontSize: 14,
          color: C.gold.main,
          fontWeight: 600,
          margin: '0 0 20px',
          textTransform: 'uppercase',
          letterSpacing: 1
        }}>
          {current.subtitle}
        </p>
        
        {/* Contenido */}
        <p style={{
          fontSize: 16,
          color: C.text.secondary,
          lineHeight: 1.6,
          margin: '0 0 20px',
          maxWidth: 340
        }}>
          {current.content}
        </p>
        
        {/* Tip */}
        {current.tip && (
          <div style={{
            background: `${C.gold.main}15`,
            border: `1px solid ${C.gold.main}30`,
            borderRadius: 12,
            padding: '12px 16px',
            maxWidth: 320,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 8
          }}>
            <span style={{ fontSize: 16 }}>💡</span>
            <span style={{ fontSize: 13, color: C.gold.light, lineHeight: 1.4 }}>
              {current.tip}
            </span>
          </div>
        )}
      </div>
      
      {/* Dots + Navegación */}
      <div style={{ padding: '0 24px 40px' }}>
        <StepDots total={steps.length} current={step} />
        
        <div style={{
          display: 'flex',
          gap: 12,
          marginTop: 16
        }}>
          {/* Atrás */}
          {step > 0 && (
            <button
              onClick={handlePrev}
              style={{
                flex: 0,
                padding: '14px 24px',
                borderRadius: 12,
                border: `1px solid ${C.bg.elevated}`,
                background: C.bg.surface,
                color: C.text.secondary,
                fontSize: 15,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              ←
            </button>
          )}
          
          {/* Siguiente / Jugar */}
          <button
            onClick={handleNext}
            style={{
              flex: 1,
              padding: '14px 24px',
              borderRadius: 12,
              border: 'none',
              background: isLast
                ? `linear-gradient(135deg, ${C.gold.main}, ${C.gold.dark})`
                : `linear-gradient(135deg, ${C.accent.blue}, ${C.accent.purple})`,
              color: '#fff',
              fontSize: 16,
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: isLast
                ? '0 4px 20px rgba(245, 158, 11, 0.3)'
                : '0 4px 20px rgba(59, 130, 246, 0.3)'
            }}
          >
            {isLast
              ? (current.cta || 'Jugar ahora')
              : (language === 'es' ? 'Siguiente' : 'Next')
            }
          </button>
        </div>
      </div>
      
      {/* CSS Animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
};

// ============================================================================
// CHECK IF TUTORIAL NEEDED
// ============================================================================

export const isTutorialComplete = () => {
  try {
    return localStorage.getItem('dominoTutorialComplete') === 'true';
  } catch {
    return false;
  }
};

export default memo(TutorialScreen);
