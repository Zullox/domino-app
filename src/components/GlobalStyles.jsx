// ============================================================================
// GLOBAL STYLES - Estilos CSS globales optimizados para móvil
// ============================================================================
import React from 'react';

const GlobalStyles = () => (
  <style>{`
    /* ============================================
       RESET Y BASE - Optimizado para Android
       ============================================ */
    * {
      -webkit-tap-highlight-color: transparent;
      -webkit-touch-callout: none;
      -webkit-user-select: none;
      user-select: none;
      box-sizing: border-box;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    
    html {
      height: 100%;
      height: -webkit-fill-available;
    }
    
    body {
      height: 100%;
      min-height: 100vh;
      min-height: -webkit-fill-available;
      margin: 0;
      padding: 0;
      overflow: hidden;
      position: fixed;
      width: 100%;
      overscroll-behavior-y: contain;
    }
    
    #root {
      height: 100%;
      width: 100%;
      height: 100dvh;
      height: -webkit-fill-available;
      overflow: hidden;
      position: fixed;
      inset: 0;
      touch-action: manipulation;
      overscroll-behavior: none;
      background: #0d1117;
      transform: translateZ(0);
      -webkit-transform: translateZ(0);
      contain: layout style paint;
    }
    
    input, select, textarea, button {
      font-size: 16px !important;
      touch-action: manipulation;
    }
    
    /* ============================================
       GPU ACCELERATION
       ============================================ */
    .gpu-layer {
      transform: translate3d(0, 0, 0);
      -webkit-transform: translate3d(0, 0, 0);
      backface-visibility: hidden;
      -webkit-backface-visibility: hidden;
      perspective: 1000px;
      -webkit-perspective: 1000px;
    }
    
    .will-animate {
      will-change: transform, opacity;
    }
    
    .will-animate-transform {
      will-change: transform;
    }
    
    .contain-paint { contain: paint; }
    .contain-layout { contain: layout; }
    .contain-strict { contain: strict; }
    
    /* ============================================
       SAFE AREAS - iOS/Android notch
       ============================================ */
    .safe-top { padding-top: max(env(safe-area-inset-top, 0px), 8px); }
    .safe-bottom { padding-bottom: max(env(safe-area-inset-bottom, 0px), 8px); }
    .safe-left { padding-left: env(safe-area-inset-left, 0px); }
    .safe-right { padding-right: env(safe-area-inset-right, 0px); }
    .safe-all { 
      padding: max(env(safe-area-inset-top, 0px), 8px) 
               env(safe-area-inset-right, 0px) 
               max(env(safe-area-inset-bottom, 0px), 8px) 
               env(safe-area-inset-left, 0px);
    }
    
    /* ============================================
       TOUCH FEEDBACK - 60fps optimizado
       ============================================ */
    .touch-feedback {
      transform: translate3d(0, 0, 0) scale(1);
      -webkit-transform: translate3d(0, 0, 0) scale(1);
      transition: transform 80ms ease-out, opacity 80ms ease-out;
    }
    
    .touch-feedback:active {
      transform: translate3d(0, 0, 0) scale(0.96);
      -webkit-transform: translate3d(0, 0, 0) scale(0.96);
      opacity: 0.85;
    }
    
    @media (prefers-reduced-motion: reduce) {
      .touch-feedback {
        transition: opacity 50ms ease-out;
      }
      .touch-feedback:active {
        transform: none;
        opacity: 0.7;
      }
    }
    
    /* ============================================
       DRAG & DROP
       ============================================ */
    .draggable-item {
      touch-action: none;
      -webkit-user-drag: none;
      user-drag: none;
    }
    
    .drag-container {
      touch-action: pan-y;
      overscroll-behavior: contain;
    }
    
    .no-scroll-during-drag {
      touch-action: none;
      overflow: hidden !important;
    }
    
    .dragging {
      position: fixed;
      z-index: 9999;
      pointer-events: none;
      transform: translate3d(0, 0, 0);
      will-change: transform;
    }
    
    .draggable {
      touch-action: none;
      cursor: grab;
      transform: translate3d(0, 0, 0);
      -webkit-transform: translate3d(0, 0, 0);
      will-change: transform;
    }
    
    .drop-zone {
      transition: transform 0.15s cubic-bezier(0.4, 0, 0.2, 1),
                  background-color 0.15s ease,
                  box-shadow 0.15s ease;
      transform: translate3d(0, 0, 0);
    }
    
    .drop-zone-active {
      transform: scale3d(1.1, 1.1, 1);
    }
    
    /* ============================================
       SCROLL CONTAINERS
       ============================================ */
    .mobile-scroll {
      overflow-y: auto;
      overflow-x: hidden;
      -webkit-overflow-scrolling: touch;
      overscroll-behavior-y: contain;
      scrollbar-width: thin;
      scrollbar-color: rgba(247,179,43,0.3) transparent;
      transform: translateZ(0);
    }
    
    .mobile-scroll::-webkit-scrollbar { width: 4px; }
    .mobile-scroll::-webkit-scrollbar-track { background: transparent; }
    .mobile-scroll::-webkit-scrollbar-thumb { 
      background: rgba(247,179,43,0.3); 
      border-radius: 4px; 
    }
    
    .tile-scroll {
      display: flex;
      overflow-x: auto;
      overflow-y: hidden;
      scroll-snap-type: x mandatory;
      scroll-behavior: smooth;
      -webkit-overflow-scrolling: touch;
      gap: 6px;
      padding: 4px;
      overscroll-behavior-x: contain;
    }
    
    .tile-scroll-item {
      scroll-snap-align: center;
      flex-shrink: 0;
    }
    
    .hide-scrollbar {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
    .hide-scrollbar::-webkit-scrollbar { display: none; }
    
    /* ============================================
       ANIMACIONES GPU-ACELERADAS
       ============================================ */
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    
    @keyframes float-gpu {
      0%, 100% { transform: translate3d(0, 0, 0); }
      50% { transform: translate3d(0, -5px, 0); }
    }
    
    @keyframes slide-up-gpu {
      from { transform: translate3d(0, 20px, 0); opacity: 0; }
      to { transform: translate3d(0, 0, 0); opacity: 1; }
    }
    
    @keyframes slide-down-gpu {
      from { transform: translate3d(0, -20px, 0); opacity: 0; }
      to { transform: translate3d(0, 0, 0); opacity: 1; }
    }
    
    @keyframes pop-in-gpu {
      0% { transform: translate3d(0, 0, 0) scale(0.8); opacity: 0; }
      60% { transform: translate3d(0, 0, 0) scale(1.05); }
      100% { transform: translate3d(0, 0, 0) scale(1); opacity: 1; }
    }
    
    @keyframes shake-gpu {
      0%, 100% { transform: translate3d(0, 0, 0); }
      20% { transform: translate3d(-4px, 0, 0); }
      40% { transform: translate3d(4px, 0, 0); }
      60% { transform: translate3d(-4px, 0, 0); }
      80% { transform: translate3d(4px, 0, 0); }
    }
    
    @keyframes pulse-scale {
      0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
      50% { transform: translate3d(0, 0, 0) scale(1.05); }
    }
    
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    
    @keyframes fade-in-gpu {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes bounce-in-gpu {
      0% { transform: translate3d(0, 0, 0) scale(0.3); opacity: 0; }
      50% { transform: scale3d(1.05, 1.05, 1); }
      70% { transform: scale3d(0.9, 0.9, 1); }
      100% { transform: scale3d(1, 1, 1); opacity: 1; }
    }
    
    @keyframes glow-pulse {
      0%, 100% { box-shadow: 0 0 5px rgba(247,179,43,0.3); }
      50% { box-shadow: 0 0 15px rgba(247,179,43,0.5); }
    }
    
    @keyframes slideDown {
      from { opacity: 0; transform: translateX(-50%) translateY(-30px); }
      to { opacity: 1; transform: translateX(-50%) translateY(0); }
    }
    
    /* Clases de animación */
    .animate-shimmer { background-size: 200% 100%; animation: shimmer 2s infinite linear; }
    .animate-float { animation: float-gpu 3s ease-in-out infinite; }
    .animate-slide-up { animation: slide-up-gpu 200ms ease-out forwards; }
    .animate-slide-down { animation: slide-down-gpu 200ms ease-out forwards; }
    .animate-pop-in { animation: pop-in-gpu 250ms ease-out forwards; }
    .animate-shake { animation: shake-gpu 400ms ease-in-out; }
    .animate-pulse { animation: pulse-scale 1s ease-in-out infinite; }
    .animate-fade-in { animation: fade-in-gpu 200ms ease-out forwards; }
    .animate-bounce-in { animation: bounce-in-gpu 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards; }
    .animate-glow-pulse { animation: glow-pulse 2s ease-in-out infinite; }
    
    @media (prefers-reduced-motion: reduce) {
      .animate-float,
      .animate-slide-up,
      .animate-slide-down,
      .animate-pop-in,
      .animate-shake,
      .animate-pulse,
      .animate-bounce-in,
      .animate-glow-pulse {
        animation: none !important;
      }
      .animate-fade-in {
        animation: fade-in-gpu 100ms ease-out forwards;
      }
    }
    
    /* ============================================
       PORTRAIT / LANDSCAPE
       ============================================ */
    @media (orientation: portrait) {
      .portrait-only { display: flex !important; }
      .landscape-only { display: none !important; }
      .portrait-compact {
        transform: scale(0.85);
        transform-origin: center center;
      }
      .tile-portrait {
        width: 24px !important;
        height: 48px !important;
      }
    }
    
    @media (orientation: landscape) {
      .portrait-only { display: none !important; }
      .landscape-only { display: flex !important; }
    }
    
    @media (max-height: 400px) and (orientation: landscape) {
      .landscape-warning { display: flex !important; }
      .game-content { display: none !important; }
    }
    
    /* ============================================
       LOW-END DEVICE OPTIMIZATIONS
       ============================================ */
    .low-end-mode .animated-element {
      animation: none !important;
      transition: none !important;
    }
    
    .low-end-mode .gpu-layer {
      will-change: auto;
    }
    
    .low-end-mode .shadow-heavy {
      box-shadow: none !important;
    }
    
    .low-end-mode .blur-effect {
      backdrop-filter: none !important;
      -webkit-backdrop-filter: none !important;
    }
    
    /* ============================================
       BOTONES TÁCTILES - Mínimo 44px
       ============================================ */
    .btn-touch {
      min-height: 44px;
      min-width: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      transform: translate3d(0, 0, 0);
    }
    
    /* ============================================
       SCROLLBAR - Oculto en móvil
       ============================================ */
    @media (min-width: 768px) {
      ::-webkit-scrollbar { width: 6px; height: 6px; }
      ::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); border-radius: 4px; }
      ::-webkit-scrollbar-thumb { background: rgba(247,179,43,0.3); border-radius: 4px; }
      ::-webkit-scrollbar-thumb:hover { background: rgba(247,179,43,0.5); }
    }
    
    /* ============================================
       PERFORMANCE HINTS
       ============================================ */
    .virtualized-list > * {
      contain: layout style;
    }
    
    /* Reducir animaciones globalmente si el usuario lo prefiere */
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    }
  `}</style>
);

export default GlobalStyles;
