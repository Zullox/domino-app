import React from 'react'
import ReactDOM from 'react-dom/client'
// Usar la versión modular en lugar del monolítico DominoR.jsx
import App from './App.modular.jsx'
import './App.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
