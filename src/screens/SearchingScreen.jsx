// ============================================================================
// PANTALLA: BUSCANDO PARTIDA
// ============================================================================
import React, { memo, useEffect, useState } from 'react';
import { Button } from '../components/ui';
import { getTranslation } from '../constants/i18n';
import { getRank, TIER_COLORS } from '../constants/game';

const C = {
  bg: { deep: '#0a0a0f', surface: '#12121a', elevated: '#1a1a24', border: '#2a2a3a' },
  text: { primary: '#ffffff', secondary: '#a0a0b0', muted: '#606070' },
  gold: { main: '#F59E0B', dark: '#D97706' }
};

// Animación de puntos de carga
const LoadingDots = memo(() => {
  const [dots, setDots] = useState('');
  
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    return () => clearInterval(interval);
  }, []);
  
  return <span style={{ width: 20, display: 'inline-block' }}>{dots}</span>;
});

// Anillo de búsqueda animado
const SearchRing = memo(({ rank }) => {
  const tierColor = TIER_COLORS[rank?.tier]?.primary || C.gold.main;
  
  return (
    <div style={{
      position: 'relative',
      width: 200,
      height: 200,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {/* Anillo exterior animado */}
      <div style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        border: `4px solid transparent`,
        borderTopColor: tierColor,
        animation: 'spin 1.5s linear infinite'
      }} />
      
      {/* Anillo medio */}
      <div style={{
        position: 'absolute',
        width: '85%',
        height: '85%',
        borderRadius: '50%',
        border: `3px solid transparent`,
        borderRightColor: `${tierColor}80`,
        animation: 'spin 2s linear infinite reverse'
      }} />
      
      {/* Anillo interior */}
      <div style={{
        position: 'absolute',
        width: '70%',
        height: '70%',
        borderRadius: '50%',
        border: `2px solid ${C.bg.border}`,
        background: C.bg.surface
      }} />
      
      {/* Contenido central */}
      <div style={{
        position: 'relative',
        textAlign: 'center',
        zIndex: 1
      }}>
        <div style={{ fontSize: 48 }}>{rank?.icon || '🎲'}</div>
        <div style={{ 
          color: tierColor, 
          fontSize: 14, 
          fontWeight: 700,
          marginTop: 4
        }}>
          {rank?.name || 'Buscando'}
        </div>
      </div>
      
      {/* Partículas flotantes */}
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: tierColor,
            opacity: 0.6,
            animation: `float ${2 + i * 0.3}s ease-in-out infinite`,
            animationDelay: `${i * 0.2}s`,
            top: '50%',
            left: '50%',
            transform: `rotate(${i * 60}deg) translateY(-80px)`
          }}
        />
      ))}
    </div>
  );
});

// Tips durante la espera
const TIPS = [
  { icon: '💡', text: 'Los dobles se pueden jugar en cualquier momento' },
  { icon: '🎯', text: 'Intenta memorizar las fichas que ya se jugaron' },
  { icon: '🤝', text: 'Coordina con tu compañero para bloquear al rival' },
  { icon: '🔢', text: 'Guarda las fichas bajas para el final' },
  { icon: '🏆', text: 'Una tranca puede cambiar el juego a tu favor' },
  { icon: '⚡', text: 'Los dobles altos son difíciles de jugar tarde' }
];

const SearchingScreen = ({
  user = {},
  searchTime = 0,
  queuePosition = 0,
  onCancel,
  language = 'es'
}) => {
  const t = (path) => getTranslation(path, language);
  const rank = getRank(user.rating || 1500);
  const [tipIndex, setTipIndex] = useState(0);
  
  // Rotar tips cada 5 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex(prev => (prev + 1) % TIPS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);
  
  // Formatear tiempo
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${secs}s`;
  };
  
  const currentTip = TIPS[tipIndex];

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: C.bg.deep,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
      zIndex: 100
    }}>
      {/* Anillo de búsqueda */}
      <SearchRing rank={rank} />
      
      {/* Texto de búsqueda */}
      <div style={{
        textAlign: 'center',
        marginTop: 32
      }}>
        <h2 style={{
          color: C.text.primary,
          fontSize: 22,
          fontWeight: 800,
          margin: 0
        }}>
          {t('search.searching')}<LoadingDots />
        </h2>
        
        <p style={{
          color: C.text.secondary,
          fontSize: 14,
          marginTop: 8
        }}>
          {t('search.lookingForPlayers')}
        </p>
        
        {/* Tiempo de búsqueda */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 20,
          marginTop: 20
        }}>
          <div style={{
            padding: '10px 20px',
            background: C.bg.surface,
            borderRadius: 12,
            border: `1px solid ${C.bg.border}`
          }}>
            <div style={{ color: C.text.muted, fontSize: 11, marginBottom: 2 }}>
              {t('search.time')}
            </div>
            <div style={{ 
              color: C.text.primary, 
              fontSize: 20, 
              fontWeight: 700,
              fontFamily: 'monospace'
            }}>
              {formatTime(searchTime)}
            </div>
          </div>
          
          {queuePosition > 0 && (
            <div style={{
              padding: '10px 20px',
              background: C.bg.surface,
              borderRadius: 12,
              border: `1px solid ${C.bg.border}`
            }}>
              <div style={{ color: C.text.muted, fontSize: 11, marginBottom: 2 }}>
                {t('search.position')}
              </div>
              <div style={{ 
                color: C.gold.main, 
                fontSize: 20, 
                fontWeight: 700 
              }}>
                #{queuePosition}
              </div>
            </div>
          )}
        </div>
        
        {/* Rango de búsqueda */}
        <div style={{
          marginTop: 16,
          padding: '8px 16px',
          background: 'rgba(59, 130, 246, 0.1)',
          borderRadius: 8,
          border: '1px solid rgba(59, 130, 246, 0.2)',
          display: 'inline-block'
        }}>
          <span style={{ color: '#60A5FA', fontSize: 12 }}>
            🎯 {t('search.ratingRange')}: {Math.max(0, (user.rating || 1500) - 200)} - {(user.rating || 1500) + 200}
          </span>
        </div>
      </div>
      
      {/* Tip del día */}
      <div style={{
        position: 'absolute',
        bottom: 120,
        left: 20,
        right: 20,
        padding: 16,
        background: C.bg.surface,
        borderRadius: 12,
        border: `1px solid ${C.bg.border}`,
        display: 'flex',
        alignItems: 'center',
        gap: 12
      }}>
        <span style={{ fontSize: 28 }}>{currentTip.icon}</span>
        <div>
          <div style={{ color: C.gold.main, fontSize: 11, fontWeight: 600, marginBottom: 2 }}>
            {t('search.tip')}
          </div>
          <div style={{ color: C.text.secondary, fontSize: 13 }}>
            {currentTip.text}
          </div>
        </div>
      </div>
      
      {/* Botón cancelar */}
      <div style={{
        position: 'absolute',
        bottom: 40,
        left: 20,
        right: 20
      }}>
        <Button
          variant="ghost"
          fullWidth
          size="lg"
          onClick={onCancel}
        >
          ✕ {t('search.cancel')}
        </Button>
      </div>
      
      {/* CSS para animaciones */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes float {
          0%, 100% { opacity: 0.3; transform: rotate(var(--rotation, 0deg)) translateY(-80px) scale(0.8); }
          50% { opacity: 0.8; transform: rotate(var(--rotation, 0deg)) translateY(-90px) scale(1.2); }
        }
      `}</style>
    </div>
  );
};

export default memo(SearchingScreen);
