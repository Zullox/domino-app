// ============================================================================
// APP PRINCIPAL - DOMINÓ CUBANO ONLINE
// ============================================================================
// Versión modular completa
// ============================================================================

import React from 'react';
import './App.css';

// Componentes
import { GlobalStyles } from './components';
import { LoginModal } from './components/auth';
import { DominoRanked } from './game';

// Hooks
import { useAuth } from './hooks';

// Context
import { LanguageProvider } from './hooks/useTranslation';

// ============================================================================
// APP COMPONENT
// ============================================================================
function App() {
  const {
    authUser,
    showLogin,
    authLoading,
    handleLoginSuccess,
    handleLogout,
    handlePlayAsGuest,
    requestLogin,
    closeLogin
  } = useAuth();

  return (
    <LanguageProvider>
      <GlobalStyles />
      <DominoRanked 
        authUser={authUser}
        onRequestLogin={requestLogin}
        onLogout={handleLogout}
      />
      {showLogin && (
        <LoginModal 
          onClose={closeLogin}
          onSuccess={handleLoginSuccess}
          onPlayAsGuest={handlePlayAsGuest}
        />
      )}
    </LanguageProvider>
  );
}

export default App;
