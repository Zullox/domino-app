// ============================================================================
// PANTALLA DE TIENDA DE DIAMANTES (Coins / Moneda Premium)
// ============================================================================
// Dos formas de obtener Diamantes:
//   1. Comprar con dinero real (IAP)
//   2. Ver anuncios rewarded (gratis, limitado)
// ============================================================================

import React, { useState, useCallback, memo, useEffect } from 'react';
import { COIN_PACKS, purchaseCoinPack, isIAPAvailable } from '../services/purchases';
import { showRewardedAd, canShowRewarded } from '../services/ads';

const C = {
  bg: { deep: '#0a0a0f', surface: '#12121a', elevated: '#1a1a24' },
  text: { primary: '#ffffff', secondary: '#a0a0b0', muted: '#606070' },
  gold: { main: '#F59E0B', dark: '#D97706', light: '#FBBF24' },
  accent: { blue: '#3B82F6', green: '#10B981', purple: '#8B5CF6' }
};

const RARITY_GLOW = {
  popular: '#3B82F6',
  best: '#10B981',
  mega: '#8B5CF6'
};

// ============================================================================
// PACK DE COMPRA
// ============================================================================

const CoinPack = memo(({ pack, onPurchase, loading }) => {
  const isPopular = pack.popular;
  const borderColor = pack.tag === 'Mejor valor' ? RARITY_GLOW.best 
                    : pack.tag === 'Mega pack' ? RARITY_GLOW.mega
                    : isPopular ? RARITY_GLOW.popular : C.bg.elevated;

  return (
    <button
      onClick={() => onPurchase(pack.id)}
      disabled={loading}
      style={{
        width: '100%', padding: '16px', borderRadius: 14,
        background: C.bg.surface,
        border: `${isPopular || pack.tag ? '2px' : '1px'} solid ${borderColor}40`,
        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14,
        position: 'relative', overflow: 'hidden'
      }}
    >
      {/* Tag */}
      {pack.tag && (
        <div style={{
          position: 'absolute', top: 0, right: 0,
          background: borderColor, color: '#fff', fontSize: 10, fontWeight: 700,
          padding: '3px 10px', borderRadius: '0 12px 0 8px'
        }}>
          {pack.tag}
        </div>
      )}

      {/* Icon */}
      <div style={{
        width: 50, height: 50, borderRadius: 12,
        background: `${C.gold.main}15`, display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: 24, flexShrink: 0
      }}>
        {pack.icon}
      </div>

      {/* Info */}
      <div style={{ flex: 1, textAlign: 'left' }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: C.text.primary }}>
          {pack.coins.toLocaleString()} Diamantes
        </div>
        {pack.bonusCoins > 0 && (
          <div style={{ fontSize: 12, color: C.accent.green, fontWeight: 600 }}>
            +{pack.bonusCoins} BONUS
          </div>
        )}
      </div>

      {/* Price */}
      <div style={{
        background: `linear-gradient(135deg, ${C.gold.main}, ${C.gold.dark})`,
        borderRadius: 10, padding: '8px 16px', fontWeight: 700, fontSize: 15,
        color: '#000', flexShrink: 0
      }}>
        {pack.price}
      </div>
    </button>
  );
});

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

const CoinStoreScreen = ({ user, onBack, onBalanceUpdate, t }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // { type: 'success'|'error', message }
  const [adInfo, setAdInfo] = useState({ available: false, remaining: 0 });

  useEffect(() => {
    setAdInfo(canShowRewarded());
    const interval = setInterval(() => setAdInfo(canShowRewarded()), 10000);
    return () => clearInterval(interval);
  }, []);

  // ══════════════════════════════════════════════════════════════════════════
  // COMPRAR CON DINERO REAL
  // ══════════════════════════════════════════════════════════════════════════

  const handlePurchase = useCallback(async (packId) => {
    if (loading || !user?.uid) return;
    setLoading(true);
    setResult(null);

    const res = await purchaseCoinPack(packId, user.uid);
    setLoading(false);

    if (res.success) {
      setResult({ type: 'success', message: `+${res.coinsAdded} 💎 Diamantes` });
      onBalanceUpdate?.({ coins: res.newBalance });
    } else if (res.error === 'cancelled') {
      // No mostrar nada
    } else {
      setResult({ type: 'error', message: res.error || 'Error en la compra' });
    }
  }, [loading, user, onBalanceUpdate]);

  // ══════════════════════════════════════════════════════════════════════════
  // VER ANUNCIO REWARDED
  // ══════════════════════════════════════════════════════════════════════════

  const handleWatchAd = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    setResult(null);

    const res = await showRewardedAd({ tokens: 50 });
    setLoading(false);

    if (res.success) {
      setResult({ type: 'success', message: `+${res.reward.tokens} 🪙 Tokens gratis` });
      setAdInfo(canShowRewarded());
    } else if (res.error === 'daily_limit') {
      setResult({ type: 'error', message: 'Límite diario alcanzado. Vuelve mañana.' });
    } else if (res.error === 'cooldown') {
      setResult({ type: 'error', message: res.message });
    }
  }, [loading]);

  return (
    <div style={{ background: C.bg.deep, minHeight: '100vh', padding: '20px 16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button onClick={onBack} style={{
          background: C.bg.elevated, border: 'none', borderRadius: 10,
          width: 40, height: 40, color: C.text.secondary, fontSize: 18, cursor: 'pointer'
        }}>←</button>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: C.text.primary, margin: 0 }}>
          💎 Tienda de Diamantes
        </h1>
        <div style={{
          marginLeft: 'auto', background: C.bg.elevated, borderRadius: 20,
          padding: '6px 14px', fontSize: 14, fontWeight: 600, color: C.gold.main
        }}>
          💎 {(user?.coins || 0).toLocaleString()}
        </div>
      </div>

      {/* Balance actual */}
      <div style={{
        background: `linear-gradient(135deg, ${C.gold.main}15, ${C.accent.purple}15)`,
        border: `1px solid ${C.gold.main}20`, borderRadius: 16,
        padding: '16px 20px', marginBottom: 24, textAlign: 'center'
      }}>
        <div style={{ fontSize: 12, color: C.text.muted, marginBottom: 4 }}>Tu balance</div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24 }}>
          <div>
            <span style={{ fontSize: 24, fontWeight: 800, color: C.gold.main }}>
              {(user?.coins || 0).toLocaleString()}
            </span>
            <span style={{ fontSize: 13, color: C.text.muted, marginLeft: 4 }}>💎</span>
          </div>
          <div style={{ width: 1, background: C.bg.elevated }} />
          <div>
            <span style={{ fontSize: 24, fontWeight: 800, color: C.text.primary }}>
              {(user?.tokens || 0).toLocaleString()}
            </span>
            <span style={{ fontSize: 13, color: C.text.muted, marginLeft: 4 }}>🪙</span>
          </div>
        </div>
      </div>

      {/* Resultado de compra */}
      {result && (
        <div style={{
          padding: '12px 16px', borderRadius: 12, marginBottom: 16, textAlign: 'center',
          background: result.type === 'success' ? `${C.accent.green}15` : `${C.accent.red || '#EF4444'}15`,
          border: `1px solid ${result.type === 'success' ? C.accent.green : '#EF4444'}30`,
          color: result.type === 'success' ? C.accent.green : '#EF4444',
          fontSize: 15, fontWeight: 600
        }}>
          {result.message}
        </div>
      )}

      {/* Packs de compra */}
      <div style={{ fontSize: 13, color: C.text.muted, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>
        Paquetes de Diamantes
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
        {COIN_PACKS.map(pack => (
          <CoinPack key={pack.id} pack={pack} onPurchase={handlePurchase} loading={loading} />
        ))}
      </div>

      {/* Tokens gratis con anuncio */}
      <div style={{ fontSize: 13, color: C.text.muted, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>
        Tokens gratis
      </div>
      <button
        onClick={handleWatchAd}
        disabled={loading || !adInfo.available}
        style={{
          width: '100%', padding: '16px', borderRadius: 14,
          background: adInfo.available
            ? `linear-gradient(135deg, ${C.accent.green}20, ${C.accent.blue}20)`
            : C.bg.surface,
          border: `1px solid ${adInfo.available ? C.accent.green : C.bg.elevated}40`,
          cursor: adInfo.available ? 'pointer' : 'default',
          display: 'flex', alignItems: 'center', gap: 14
        }}
      >
        <div style={{
          width: 50, height: 50, borderRadius: 12,
          background: `${C.accent.green}15`, display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: 24
        }}>
          🎬
        </div>
        <div style={{ flex: 1, textAlign: 'left' }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.text.primary }}>
            Ver anuncio → 50 Tokens
          </div>
          <div style={{ fontSize: 12, color: C.text.muted }}>
            {adInfo.available 
              ? `${adInfo.remaining} restantes hoy`
              : 'Disponible pronto'}
          </div>
        </div>
        <div style={{
          background: adInfo.available ? C.accent.green : C.bg.elevated,
          borderRadius: 10, padding: '8px 16px', fontWeight: 700, fontSize: 14,
          color: adInfo.available ? '#fff' : C.text.muted
        }}>
          GRATIS
        </div>
      </button>

      {/* Nota */}
      <div style={{
        marginTop: 24, textAlign: 'center', fontSize: 11, color: C.text.muted, lineHeight: 1.5
      }}>
        Los Diamantes 💎 son moneda premium para cosméticos exclusivos.
        Los Tokens 🪙 se ganan jugando y con anuncios.
      </div>
    </div>
  );
};

export default memo(CoinStoreScreen);
