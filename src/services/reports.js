// ============================================================================
// SISTEMA DE REPORTES Y MODERACIÓN
// ============================================================================
// Permite reportar jugadores por comportamiento inapropiado
// Los reportes se guardan en Firestore y se procesan en servidor
// ============================================================================

import { getApps } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp
} from 'firebase/firestore';

const db = getFirestore(getApps()[0]);

// ============================================================================
// RAZONES DE REPORTE
// ============================================================================

export const REPORT_REASONS = {
  TOXIC_BEHAVIOR: {
    id: 'toxic_behavior',
    label: { es: 'Comportamiento tóxico', en: 'Toxic behavior', pt: 'Comportamento tóxico', fr: 'Comportement toxique' },
    icon: '😡',
    severity: 'medium'
  },
  CHEATING: {
    id: 'cheating',
    label: { es: 'Trampas', en: 'Cheating', pt: 'Trapaça', fr: 'Triche' },
    icon: '🚫',
    severity: 'high'
  },
  ABANDONMENT: {
    id: 'abandonment',
    label: { es: 'Abandono intencional', en: 'Intentional abandonment', pt: 'Abandono intencional', fr: 'Abandon intentionnel' },
    icon: '🚪',
    severity: 'medium'
  },
  EMOTE_ABUSE: {
    id: 'emote_abuse',
    label: { es: 'Abuso de emotes', en: 'Emote abuse', pt: 'Abuso de emotes', fr: 'Abus d\'emotes' },
    icon: '🗯️',
    severity: 'low'
  },
  INAPPROPRIATE_NAME: {
    id: 'inappropriate_name',
    label: { es: 'Nombre inapropiado', en: 'Inappropriate name', pt: 'Nome inadequado', fr: 'Nom inapproprié' },
    icon: '✏️',
    severity: 'medium'
  },
  OTHER: {
    id: 'other',
    label: { es: 'Otro', en: 'Other', pt: 'Outro', fr: 'Autre' },
    icon: '📝',
    severity: 'low'
  }
};

// ============================================================================
// ENVIAR REPORTE
// ============================================================================

/**
 * Enviar un reporte de jugador
 * @param {string} reporterId - UID del que reporta
 * @param {string} reportedId - UID del reportado
 * @param {string} reason - ID de la razón (de REPORT_REASONS)
 * @param {string} details - Detalles adicionales (opcional)
 * @param {string} gameId - ID de la partida donde ocurrió (opcional)
 */
export const submitReport = async (reporterId, reportedId, reason, details = '', gameId = null) => {
  // Validaciones
  if (!reporterId || !reportedId) {
    return { success: false, error: 'IDs requeridos' };
  }
  
  if (reporterId === reportedId) {
    return { success: false, error: 'No puedes reportarte a ti mismo' };
  }
  
  if (!REPORT_REASONS[reason.toUpperCase()]) {
    return { success: false, error: 'Razón inválida' };
  }
  
  try {
    // Verificar cooldown (máx 3 reportes por hora por usuario)
    const cooldownCheck = await checkReportCooldown(reporterId);
    if (!cooldownCheck.allowed) {
      return { success: false, error: cooldownCheck.error };
    }
    
    // Verificar que no haya reportado al mismo usuario recientemente
    const duplicateCheck = await checkDuplicateReport(reporterId, reportedId);
    if (duplicateCheck.exists) {
      return { success: false, error: 'Ya reportaste a este jugador recientemente' };
    }
    
    // Crear reporte
    const reportsRef = collection(db, 'reports');
    await addDoc(reportsRef, {
      reporterId,
      reportedId,
      reason: reason.toLowerCase(),
      details: (details || '').substring(0, 500), // Limitar longitud
      gameId,
      severity: REPORT_REASONS[reason.toUpperCase()]?.severity || 'low',
      status: 'pending', // pending, reviewed, resolved, dismissed
      createdAt: serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    console.error('[Reports] Error:', error);
    return { success: false, error: 'Error al enviar reporte' };
  }
};

// ============================================================================
// COOLDOWN Y ANTI-SPAM
// ============================================================================

const checkReportCooldown = async (reporterId) => {
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const reportsRef = collection(db, 'reports');
    const q = query(
      reportsRef,
      where('reporterId', '==', reporterId),
      where('createdAt', '>=', oneHourAgo)
    );
    
    const snapshot = await getDocs(q);
    
    if (snapshot.size >= 3) {
      return { allowed: false, error: 'Máximo 3 reportes por hora. Intenta más tarde.' };
    }
    
    return { allowed: true };
  } catch (e) {
    // Si falla el check, permitir el reporte
    return { allowed: true };
  }
};

const checkDuplicateReport = async (reporterId, reportedId) => {
  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const reportsRef = collection(db, 'reports');
    const q = query(
      reportsRef,
      where('reporterId', '==', reporterId),
      where('reportedId', '==', reportedId),
      where('createdAt', '>=', oneDayAgo)
    );
    
    const snapshot = await getDocs(q);
    return { exists: snapshot.size > 0 };
  } catch (e) {
    return { exists: false };
  }
};

export default {
  REPORT_REASONS,
  submitReport
};
