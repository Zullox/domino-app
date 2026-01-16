// ============================================================================
// APP PRINCIPAL - DOMINÓ CUBANO ONLINE
// ============================================================================
// Versión modular del juego
// Para usar la versión monolítica, descomentar DominoRanked y comentar AppModular

import React from 'react';
import './App.css';

// Versión modular (recomendada)
import AppModular from './App.modular.jsx';

// Versión monolítica (legacy)
// import { AuthProvider } from './AuthContext.jsx';
// import DominoRanked from './DominoR.jsx';

function App() {
  // Versión modular
  return <AppModular />;
  
  // Versión monolítica (legacy)
  // return (
  //   <AuthProvider>
  //     <DominoRanked />
  //   </AuthProvider>
  // );
}

export default App;
