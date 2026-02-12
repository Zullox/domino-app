// ============================================================================
// MODAL DE REPORTE DE JUGADOR
// ============================================================================
// Se muestra desde la pantalla de resultado o desde el perfil del jugador
// ============================================================================

import React, { useState, useCallback, memo } from 'react';
import { REPORT_REASONS, submitReport } from '../services/reports';

const C = {
  bg: { deep: '#0a0a0f', surface: '#12121a', elevated: '#1a1a24' },
  text: { primary: '#ffffff', secondary: '#a0a0b0', muted: '#606070' },
  accent: { red: '#EF4444', green: '#10B981' }
};

const ReportPlayerModal = ({ visible, reporterId, reportedId, reportedName, gameId, onClose, language = 'es' }) => {
  const [selectedReason, setSelectedReason] = useState(null);
  const [details, setDetails] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = useCallback(async () => {
    if (!selectedReason || sending) return;
    setSending(true);

    const res = await submitReport(reporterId, reportedId, selectedReason, details, gameId);
    setSending(false);

    if (res.success) {
      setResult('success');
      setTimeout(() => {
        onClose?.();
        setResult(null);
        setSelectedReason(null);
        setDetails('');
      }, 1500);
    } else {
      setResult(res.error);
    }
  }, [selectedReason, details, sending, reporterId, reportedId, gameId, onClose]);

  if (!visible) return null;

  const reasons = Object.values(REPORT_REASONS);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 10000,
      background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'flex-end',
      justifyContent: 'center'
    }} onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}>
      <div style={{
        background: C.bg.surface, borderRadius: '20px 20px 0 0', width: '100%',
        maxWidth: 420, maxHeight: '80vh', overflow: 'auto', padding: '24px 20px 32px'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: C.text.primary, margin: 0 }}>
            🚩 Reportar jugador
          </h2>
          <button onClick={onClose} style={{
            background: C.bg.elevated, border: 'none', borderRadius: 8,
            width: 32, height: 32, color: C.text.muted, cursor: 'pointer', fontSize: 14
          }}>✕</button>
        </div>

        <div style={{ fontSize: 13, color: C.text.muted, marginBottom: 16 }}>
          Reportando a <strong style={{ color: C.text.primary }}>{reportedName || 'jugador'}</strong>
        </div>

        {/* Razones */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
          {reasons.map(reason => (
            <button
              key={reason.id}
              onClick={() => setSelectedReason(reason.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '12px 14px', borderRadius: 10,
                background: selectedReason === reason.id ? `${C.accent.red}15` : C.bg.elevated,
                border: `1px solid ${selectedReason === reason.id ? C.accent.red + '50' : 'transparent'}`,
                color: C.text.primary, cursor: 'pointer', textAlign: 'left'
              }}
            >
              <span style={{ fontSize: 18 }}>{reason.icon}</span>
              <span style={{ fontSize: 14, fontWeight: 500 }}>
                {reason.label[language] || reason.label.es}
              </span>
            </button>
          ))}
        </div>

        {/* Detalles */}
        <textarea
          value={details}
          onChange={(e) => setDetails(e.target.value.slice(0, 200))}
          placeholder={language === 'es' ? 'Detalles adicionales (opcional)' : 'Additional details (optional)'}
          maxLength={200}
          rows={2}
          style={{
            width: '100%', background: C.bg.elevated, border: `1px solid ${C.bg.deep}`,
            borderRadius: 10, padding: '10px 12px', color: C.text.primary,
            fontSize: 13, resize: 'none', outline: 'none', boxSizing: 'border-box',
            marginBottom: 16
          }}
        />

        {/* Resultado */}
        {result && result !== 'success' && (
          <div style={{
            padding: '10px', borderRadius: 8, marginBottom: 12, textAlign: 'center',
            background: `${C.accent.red}15`, color: C.accent.red, fontSize: 12
          }}>
            {result}
          </div>
        )}

        {result === 'success' && (
          <div style={{
            padding: '10px', borderRadius: 8, marginBottom: 12, textAlign: 'center',
            background: `${C.accent.green}15`, color: C.accent.green, fontSize: 13, fontWeight: 600
          }}>
            ✅ Reporte enviado. Gracias por ayudar.
          </div>
        )}

        {/* Enviar */}
        <button
          onClick={handleSubmit}
          disabled={!selectedReason || sending || result === 'success'}
          style={{
            width: '100%', padding: '14px', borderRadius: 12, border: 'none',
            background: selectedReason && !sending ? C.accent.red : C.bg.elevated,
            color: selectedReason ? '#fff' : C.text.muted,
            fontSize: 15, fontWeight: 700, cursor: selectedReason ? 'pointer' : 'default'
          }}
        >
          {sending ? 'Enviando...' : 'Enviar reporte'}
        </button>
      </div>
    </div>
  );
};

export default memo(ReportPlayerModal);
