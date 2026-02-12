// ============================================================================
// SETTINGS MODAL - Modal de configuración durante el juego
// ============================================================================

import React, { useState, memo } from 'react';
import { THEME } from '../../constants/game';
import { getDefaultSettings } from '../../constants/gameConfig';

const C = THEME.colors;

// ============================================================================
// SETTING ROW COMPONENT
// ============================================================================
const SettingRow = memo(({ icon, label, description, children }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 0',
    borderBottom: `1px solid ${C.bg.border}`,
    gap: 12
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
      <span style={{ fontSize: 20 }}>{icon}</span>
      <div>
        <div style={{ color: C.text.primary, fontWeight: 600, fontSize: 14 }}>{label}</div>
        {description && (
          <div style={{ color: C.text.muted, fontSize: 12, marginTop: 2 }}>{description}</div>
        )}
      </div>
    </div>
    {children}
  </div>
));

// ============================================================================
// TOGGLE SWITCH
// ============================================================================
const Toggle = memo(({ value, onChange }) => (
  <button
    onClick={() => onChange(!value)}
    style={{
      width: 52,
      height: 28,
      borderRadius: 14,
      background: value ? C.accent.green : C.bg.card,
      border: `2px solid ${value ? C.accent.green : C.bg.border}`,
      cursor: 'pointer',
      position: 'relative',
      transition: 'all 0.2s ease',
      flexShrink: 0
    }}
  >
    <div style={{
      width: 20,
      height: 20,
      borderRadius: '50%',
      background: '#fff',
      position: 'absolute',
      top: 2,
      left: value ? 26 : 2,
      transition: 'all 0.2s ease',
      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
    }} />
  </button>
));

// ============================================================================
// SELECT DROPDOWN
// ============================================================================
const Select = memo(({ value, onChange, options }) => (
  <select
    value={value}
    onChange={e => onChange(e.target.value)}
    style={{
      background: C.bg.card,
      color: C.text.primary,
      border: `1px solid ${C.bg.border}`,
      borderRadius: 8,
      padding: '8px 12px',
      fontSize: 14,
      cursor: 'pointer',
      minWidth: 120
    }}
  >
    {options.map(opt => (
      <option key={opt.value} value={opt.value}>{opt.label}</option>
    ))}
  </select>
));

// ============================================================================
// SETTINGS MODAL
// ============================================================================
const SettingsModal = ({ 
  settings, 
  onSettingsChange, 
  onClose,
  onSurrender,
  onLeaveGame,
  isPlaying = false,
  t = (key) => key 
}) => {
  const [activeTab, setActiveTab] = useState('game');
  const [confirmSurrender, setConfirmSurrender] = useState(false);
  
  const tabs = [
    { id: 'game', label: 'Juego', icon: '🎮' },
    { id: 'audio', label: 'Audio', icon: '🔊' },
    { id: 'visual', label: 'Visual', icon: '🎨' },
    { id: 'controls', label: 'Controles', icon: '👆' }
  ];
  
  const updateSetting = (key, value) => {
    onSettingsChange({ ...settings, [key]: value });
  };
  
  const handleSurrender = () => {
    if (confirmSurrender) {
      onSurrender?.();
      onClose();
    } else {
      setConfirmSurrender(true);
      setTimeout(() => setConfirmSurrender(false), 3000);
    }
  };
  
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: 16
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: C.bg.surface,
          borderRadius: 16,
          width: '100%',
          maxWidth: 420,
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: `1px solid ${C.bg.border}`
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 16px',
          borderBottom: `1px solid ${C.bg.border}`
        }}>
          <h2 style={{ color: '#fff', fontSize: 18, fontWeight: 800, margin: 0 }}>
            ⚙️ Configuración
          </h2>
          <button
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: C.bg.card,
              border: 'none',
              color: '#fff',
              fontSize: 16,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ✕
          </button>
        </div>
        
        {/* Tabs */}
        <div style={{
          display: 'flex',
          borderBottom: `1px solid ${C.bg.border}`,
          overflowX: 'auto'
        }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                minWidth: 70,
                padding: '10px 8px',
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === tab.id 
                  ? `2px solid ${C.accent.gold}` 
                  : '2px solid transparent',
                color: activeTab === tab.id ? C.accent.gold : C.text.secondary,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                fontSize: 11,
                fontWeight: 600,
                transition: 'all 0.2s'
              }}
            >
              <span style={{ fontSize: 18 }}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
        
        {/* Content */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: 16
        }}>
          {/* GAME TAB */}
          {activeTab === 'game' && (
            <>
              <SettingRow
                icon="⏱️"
                label="Tiempo por turno"
                description="Segundos para jugar cada turno"
              >
                <Select
                  value={settings.turnTime || 30}
                  onChange={v => updateSetting('turnTime', parseInt(v))}
                  options={[
                    { value: 15, label: '15 seg' },
                    { value: 30, label: '30 seg' },
                    { value: 45, label: '45 seg' },
                    { value: 60, label: '60 seg' }
                  ]}
                />
              </SettingRow>
              
              <SettingRow
                icon="🎯"
                label="Puntos para ganar"
                description="Meta de puntos por partida"
              >
                <Select
                  value={settings.targetScore || 200}
                  onChange={v => updateSetting('targetScore', parseInt(v))}
                  options={[
                    { value: 100, label: '100 pts' },
                    { value: 150, label: '150 pts' },
                    { value: 200, label: '200 pts' },
                    { value: 300, label: '300 pts' }
                  ]}
                />
              </SettingRow>
              
              <SettingRow
                icon="🤖"
                label="Dificultad IA"
                description="Nivel de la inteligencia artificial"
              >
                <Select
                  value={settings.aiDifficulty || 'medium'}
                  onChange={v => updateSetting('aiDifficulty', v)}
                  options={[
                    { value: 'easy', label: 'Fácil' },
                    { value: 'medium', label: 'Normal' },
                    { value: 'hard', label: 'Difícil' },
                    { value: 'expert', label: 'Experto' }
                  ]}
                />
              </SettingRow>
              
              <SettingRow
                icon="⚡"
                label="Velocidad IA"
                description="Rapidez de respuesta de la IA"
              >
                <Select
                  value={settings.aiSpeed || 'normal'}
                  onChange={v => updateSetting('aiSpeed', v)}
                  options={[
                    { value: 'fast', label: 'Rápido' },
                    { value: 'normal', label: 'Normal' },
                    { value: 'slow', label: 'Lento' }
                  ]}
                />
              </SettingRow>
              
              <SettingRow
                icon="📊"
                label="Mostrar contadores"
                description="Ver fichas restantes de oponentes"
              >
                <Toggle
                  value={settings.showTileCount !== false}
                  onChange={v => updateSetting('showTileCount', v)}
                />
              </SettingRow>
              
              <SettingRow
                icon="💡"
                label="Sugerir jugadas"
                description="Resaltar fichas jugables"
              >
                <Toggle
                  value={settings.suggestMoves !== false}
                  onChange={v => updateSetting('suggestMoves', v)}
                />
              </SettingRow>
            </>
          )}
          
          {/* AUDIO TAB */}
          {activeTab === 'audio' && (
            <>
              <SettingRow
                icon="🔊"
                label="Sonido"
                description="Activar efectos de sonido"
              >
                <Toggle
                  value={settings.sound !== false}
                  onChange={v => updateSetting('sound', v)}
                />
              </SettingRow>
              
              <SettingRow
                icon="🎵"
                label="Música"
                description="Música de fondo"
              >
                <Toggle
                  value={settings.music === true}
                  onChange={v => updateSetting('music', v)}
                />
              </SettingRow>
              
              <SettingRow
                icon="📳"
                label="Vibración"
                description="Feedback háptico al jugar"
              >
                <Toggle
                  value={settings.vibration !== false}
                  onChange={v => updateSetting('vibration', v)}
                />
              </SettingRow>
              
              <SettingRow
                icon="🔔"
                label="Notificaciones de turno"
                description="Sonido cuando es tu turno"
              >
                <Toggle
                  value={settings.turnNotification !== false}
                  onChange={v => updateSetting('turnNotification', v)}
                />
              </SettingRow>
            </>
          )}
          
          {/* VISUAL TAB */}
          {activeTab === 'visual' && (
            <>
              <SettingRow
                icon="🌙"
                label="Tema oscuro"
                description="Modo oscuro activado"
              >
                <Toggle
                  value={settings.darkMode !== false}
                  onChange={v => updateSetting('darkMode', v)}
                />
              </SettingRow>
              
              <SettingRow
                icon="✨"
                label="Animaciones"
                description="Efectos visuales y animaciones"
              >
                <Toggle
                  value={settings.animations !== false}
                  onChange={v => updateSetting('animations', v)}
                />
              </SettingRow>
              
              <SettingRow
                icon="🎆"
                label="Confeti"
                description="Celebración al ganar"
              >
                <Toggle
                  value={settings.confetti !== false}
                  onChange={v => updateSetting('confetti', v)}
                />
              </SettingRow>
              
              <SettingRow
                icon="📱"
                label="Tamaño de fichas"
                description="Ajustar tamaño de las fichas"
              >
                <Select
                  value={settings.tileSize || 'medium'}
                  onChange={v => updateSetting('tileSize', v)}
                  options={[
                    { value: 'small', label: 'Pequeño' },
                    { value: 'medium', label: 'Mediano' },
                    { value: 'large', label: 'Grande' }
                  ]}
                />
              </SettingRow>
            </>
          )}
          
          {/* CONTROLS TAB */}
          {activeTab === 'controls' && (
            <>
              <SettingRow
                icon="👆"
                label="Confirmar jugada"
                description="Pedir confirmación antes de jugar"
              >
                <Toggle
                  value={settings.confirmPlay === true}
                  onChange={v => updateSetting('confirmPlay', v)}
                />
              </SettingRow>
              
              <SettingRow
                icon="🔄"
                label="Voltear con tap"
                description="Doble tap para voltear ficha"
              >
                <Toggle
                  value={settings.doubleTapFlip !== false}
                  onChange={v => updateSetting('doubleTapFlip', v)}
                />
              </SettingRow>
              
              <SettingRow
                icon="↔️"
                label="Arrastrar fichas"
                description="Reorganizar fichas arrastrando"
              >
                <Toggle
                  value={settings.dragToReorder !== false}
                  onChange={v => updateSetting('dragToReorder', v)}
                />
              </SettingRow>
              
              <SettingRow
                icon="🎯"
                label="Auto-pasar"
                description="Pasar automáticamente si no puedes jugar"
              >
                <Toggle
                  value={settings.autoPass === true}
                  onChange={v => updateSetting('autoPass', v)}
                />
              </SettingRow>
            </>
          )}
        </div>
        
        {/* Actions (only during game) */}
        {isPlaying && (
          <div style={{
            padding: 16,
            borderTop: `1px solid ${C.bg.border}`,
            display: 'flex',
            gap: 12
          }}>
            <button
              onClick={handleSurrender}
              style={{
                flex: 1,
                padding: '12px 16px',
                borderRadius: 10,
                border: 'none',
                background: confirmSurrender ? '#ef4444' : C.bg.card,
                color: confirmSurrender ? '#fff' : C.text.secondary,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8
              }}
            >
              🏳️ {confirmSurrender ? 'Confirmar rendirse' : 'Rendirse'}
            </button>
            
            <button
              onClick={onLeaveGame}
              style={{
                flex: 1,
                padding: '12px 16px',
                borderRadius: 10,
                border: `1px solid ${C.bg.border}`,
                background: 'transparent',
                color: C.text.secondary,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8
              }}
            >
              🚪 Salir al menú
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(SettingsModal);
