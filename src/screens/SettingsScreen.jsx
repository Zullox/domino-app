// ============================================================================
// PANTALLA: CONFIGURACIONES
// ============================================================================
import React, { useState, memo, useCallback } from 'react';
import { Button, Card, Modal } from '../components/ui';
import { getTranslation, LANGUAGES } from '../constants/i18n';

const C = {
  bg: { deep: '#0a0a0f', surface: '#12121a', elevated: '#1a1a24', border: '#2a2a3a' },
  text: { primary: '#ffffff', secondary: '#a0a0b0', muted: '#606070' },
  gold: { main: '#F59E0B' },
  accent: { green: '#10B981', red: '#EF4444' }
};

// Toggle switch
const Toggle = memo(({ value, onChange, disabled }) => (
  <button
    onClick={() => !disabled && onChange(!value)}
    disabled={disabled}
    style={{
      width: 52,
      height: 28,
      borderRadius: 14,
      border: 'none',
      background: value ? C.accent.green : C.bg.elevated,
      position: 'relative',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      transition: 'background 200ms ease'
    }}
  >
    <div style={{
      width: 22,
      height: 22,
      borderRadius: '50%',
      background: '#fff',
      position: 'absolute',
      top: 3,
      left: value ? 27 : 3,
      transition: 'left 200ms ease',
      boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
    }} />
  </button>
));

// Slider
const Slider = memo(({ value, min = 0, max = 100, onChange }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
    <input
      type="range"
      min={min}
      max={max}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      style={{
        flex: 1,
        height: 6,
        borderRadius: 3,
        appearance: 'none',
        background: `linear-gradient(to right, ${C.gold.main} 0%, ${C.gold.main} ${(value / max) * 100}%, ${C.bg.elevated} ${(value / max) * 100}%, ${C.bg.elevated} 100%)`,
        cursor: 'pointer'
      }}
    />
    <span style={{ color: C.text.primary, fontSize: 14, fontWeight: 600, minWidth: 40, textAlign: 'right' }}>
      {Math.round(value * 100)}%
    </span>
  </div>
));

// Selector de opciones
const OptionSelector = memo(({ options, value, onChange }) => (
  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
    {options.map(opt => (
      <button
        key={opt.value}
        onClick={() => onChange(opt.value)}
        style={{
          padding: '8px 16px',
          borderRadius: 8,
          border: value === opt.value ? 'none' : `1px solid ${C.bg.border}`,
          background: value === opt.value 
            ? `linear-gradient(135deg, ${C.gold.main}, #D97706)`
            : C.bg.elevated,
          color: value === opt.value ? '#000' : C.text.primary,
          fontSize: 13,
          fontWeight: 600,
          cursor: 'pointer'
        }}
      >
        {opt.icon && <span style={{ marginRight: 6 }}>{opt.icon}</span>}
        {opt.label}
      </button>
    ))}
  </div>
));

// Item de configuración
const SettingItem = memo(({ icon, title, description, children }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 0',
    borderBottom: `1px solid ${C.bg.border}`
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
      {icon && <span style={{ fontSize: 20 }}>{icon}</span>}
      <div>
        <div style={{ color: C.text.primary, fontSize: 14, fontWeight: 600 }}>{title}</div>
        {description && (
          <div style={{ color: C.text.muted, fontSize: 12, marginTop: 2 }}>{description}</div>
        )}
      </div>
    </div>
    <div style={{ flexShrink: 0 }}>
      {children}
    </div>
  </div>
));

// Sección de configuración
const SettingSection = memo(({ title, children }) => (
  <div style={{ marginBottom: 24 }}>
    <h3 style={{
      color: C.gold.main,
      fontSize: 12,
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: 12
    }}>
      {title}
    </h3>
    <div style={{
      background: C.bg.surface,
      borderRadius: 16,
      padding: '0 16px',
      border: `1px solid ${C.bg.border}`
    }}>
      {children}
    </div>
  </div>
));

// Pantalla principal de configuraciones
const SettingsScreen = ({
  settings,
  onUpdateSetting,
  onResetSettings,
  onClose,
  onLogout,
  language = 'es'
}) => {
  const t = (path) => getTranslation(path, language);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  const languageOptions = [
    { value: 'es', label: 'Español', icon: '🇪🇸' },
    { value: 'en', label: 'English', icon: '🇺🇸' },
    { value: 'pt', label: 'Português', icon: '🇧🇷' },
    { value: 'fr', label: 'Français', icon: '🇫🇷' }
  ];
  
  const difficultyOptions = [
    { value: 'easy', label: t('settings.easy') },
    { value: 'medium', label: t('settings.medium') },
    { value: 'hard', label: t('settings.hard') }
  ];
  
  const turnTimeOptions = [
    { value: 15, label: '15s' },
    { value: 30, label: '30s' },
    { value: 45, label: '45s' },
    { value: 60, label: '60s' }
  ];
  
  const targetScoreOptions = [
    { value: 100, label: '100' },
    { value: 150, label: '150' },
    { value: 200, label: '200' }
  ];

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: C.bg.deep,
      zIndex: 100,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: `1px solid ${C.bg.border}`,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        flexShrink: 0
      }}>
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: C.text.secondary,
            fontSize: 24,
            cursor: 'pointer',
            padding: 4
          }}
        >
          ←
        </button>
        <h1 style={{ color: C.text.primary, fontSize: 20, fontWeight: 800, margin: 0 }}>
          ⚙️ {t('settings.title')}
        </h1>
      </div>
      
      {/* Contenido scrolleable */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: 16
      }}>
        {/* Audio */}
        <SettingSection title={t('settings.audio')}>
          <SettingItem
            icon="🔊"
            title={t('settings.sound')}
            description={t('settings.soundDesc')}
          >
            <Toggle
              value={settings.soundEnabled}
              onChange={(v) => onUpdateSetting('soundEnabled', v)}
            />
          </SettingItem>
          
          {settings.soundEnabled && (
            <SettingItem
              icon="🎚️"
              title={t('settings.soundVolume')}
            >
              <Slider
                value={settings.soundVolume}
                min={0}
                max={1}
                onChange={(v) => onUpdateSetting('soundVolume', v)}
              />
            </SettingItem>
          )}
          
          <SettingItem
            icon="🎵"
            title={t('settings.music')}
            description={t('settings.musicDesc')}
          >
            <Toggle
              value={settings.musicEnabled}
              onChange={(v) => onUpdateSetting('musicEnabled', v)}
            />
          </SettingItem>
          
          <SettingItem
            icon="📳"
            title={t('settings.vibration')}
          >
            <Toggle
              value={settings.vibrationEnabled}
              onChange={(v) => onUpdateSetting('vibrationEnabled', v)}
            />
          </SettingItem>
        </SettingSection>
        
        {/* Visual */}
        <SettingSection title={t('settings.visual')}>
          <SettingItem
            icon="🌐"
            title={t('settings.language')}
          >
            <div /> {/* Placeholder para el flex */}
          </SettingItem>
          <div style={{ padding: '0 0 14px' }}>
            <OptionSelector
              options={languageOptions}
              value={settings.language}
              onChange={(v) => onUpdateSetting('language', v)}
            />
          </div>
          
          <SettingItem
            icon="💡"
            title={t('settings.showHints')}
            description={t('settings.showHintsDesc')}
          >
            <Toggle
              value={settings.showHints}
              onChange={(v) => onUpdateSetting('showHints', v)}
            />
          </SettingItem>
          
          <SettingItem
            icon="✨"
            title={t('settings.animations')}
          >
            <Toggle
              value={settings.animationsEnabled}
              onChange={(v) => onUpdateSetting('animationsEnabled', v)}
            />
          </SettingItem>
          
          <SettingItem
            icon="👁️"
            title={t('settings.colorBlind')}
            description={t('settings.colorBlindDesc')}
          >
            <Toggle
              value={settings.colorBlindMode}
              onChange={(v) => onUpdateSetting('colorBlindMode', v)}
            />
          </SettingItem>
        </SettingSection>
        
        {/* Juego */}
        <SettingSection title={t('settings.game')}>
          <SettingItem
            icon="🤖"
            title={t('settings.aiDifficulty')}
          >
            <div />
          </SettingItem>
          <div style={{ padding: '0 0 14px' }}>
            <OptionSelector
              options={difficultyOptions}
              value={settings.aiDifficulty}
              onChange={(v) => onUpdateSetting('aiDifficulty', v)}
            />
          </div>
          
          <SettingItem
            icon="⏱️"
            title={t('settings.turnTime')}
          >
            <div />
          </SettingItem>
          <div style={{ padding: '0 0 14px' }}>
            <OptionSelector
              options={turnTimeOptions}
              value={settings.turnTime}
              onChange={(v) => onUpdateSetting('turnTime', v)}
            />
          </div>
          
          <SettingItem
            icon="🎯"
            title={t('settings.targetScore')}
          >
            <div />
          </SettingItem>
          <div style={{ padding: '0 0 14px' }}>
            <OptionSelector
              options={targetScoreOptions}
              value={settings.targetScore}
              onChange={(v) => onUpdateSetting('targetScore', v)}
            />
          </div>
          
          <SettingItem
            icon="⏭️"
            title={t('settings.autoPass')}
            description={t('settings.autoPassDesc')}
          >
            <Toggle
              value={settings.autoPass}
              onChange={(v) => onUpdateSetting('autoPass', v)}
            />
          </SettingItem>
        </SettingSection>
        
        {/* Cuenta */}
        <SettingSection title={t('settings.account')}>
          <SettingItem
            icon="🔄"
            title={t('settings.resetSettings')}
            description={t('settings.resetSettingsDesc')}
          >
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowResetModal(true)}
            >
              {t('settings.reset')}
            </Button>
          </SettingItem>
          
          <SettingItem
            icon="🚪"
            title={t('settings.logout')}
          >
            <Button 
              variant="danger" 
              size="sm"
              onClick={() => setShowLogoutModal(true)}
            >
              {t('settings.logout')}
            </Button>
          </SettingItem>
        </SettingSection>
        
        {/* Info */}
        <div style={{
          textAlign: 'center',
          padding: '20px 0',
          color: C.text.muted,
          fontSize: 12
        }}>
          <p>Dominó Cubano v2.1.0</p>
          <p style={{ marginTop: 4 }}>© 2024 - Todos los derechos reservados</p>
        </div>
      </div>
      
      {/* Modal de reset */}
      <Modal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        title={t('settings.confirmReset')}
        size="sm"
      >
        <p style={{ color: C.text.secondary, marginBottom: 20 }}>
          {t('settings.resetConfirmMessage')}
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button 
            variant="ghost" 
            fullWidth 
            onClick={() => setShowResetModal(false)}
          >
            {t('common.cancel')}
          </Button>
          <Button 
            variant="danger" 
            fullWidth 
            onClick={() => {
              onResetSettings();
              setShowResetModal(false);
            }}
          >
            {t('settings.reset')}
          </Button>
        </div>
      </Modal>
      
      {/* Modal de logout */}
      <Modal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title={t('settings.confirmLogout')}
        size="sm"
      >
        <p style={{ color: C.text.secondary, marginBottom: 20 }}>
          {t('settings.logoutConfirmMessage')}
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button 
            variant="ghost" 
            fullWidth 
            onClick={() => setShowLogoutModal(false)}
          >
            {t('common.cancel')}
          </Button>
          <Button 
            variant="danger" 
            fullWidth 
            onClick={() => {
              setShowLogoutModal(false);
              onLogout?.();
            }}
          >
            {t('settings.logout')}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default memo(SettingsScreen);
