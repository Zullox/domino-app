# 🎲 Dominó Cubano Online - Cliente Completo

Este es el cliente del juego con la interfaz completa y conexión al servidor.

---

## 📋 INSTRUCCIONES DE INSTALACIÓN

### Requisitos:
- Node.js instalado 
- El servidor corriendo (domino-server)

---

## PASO 1: Descomprime este archivo

Extráelo en tu carpeta de Documentos.

## PASO 2: Abre una NUEVA terminal

⚠️ **IMPORTANTE**: Deja el servidor corriendo en su terminal. Abre una terminal NUEVA.

1. Abre la carpeta `domino-app` en el Explorador
2. Haz clic en la barra de direcciones
3. Escribe `cmd` y presiona Enter

## PASO 3: Instala las dependencias

```
npm install
```

## PASO 4: Inicia el juego

```
npm run dev
```

## PASO 5: Abre en el navegador

Ve a: **http://localhost:3000**

---

## 🎮 CÓMO FUNCIONA

### Si el servidor está corriendo (localhost:3001):
- Verás "🌐 Servidor Online" en verde
- El botón dirá "JUGAR ONLINE"
- Necesitas 4 jugadores para iniciar (abre 4 pestañas)

### Si el servidor NO está corriendo:
- Verás "📴 Modo Offline" en rojo
- El botón dirá "JUGAR vs IA"  
- Puedes jugar contra la IA sin servidor

---

## 📁 ARCHIVOS

```
domino-app/
├── src/
│   ├── DominoR.jsx     ← Juego completo con conexión online
│   ├── App.jsx         ← Carga el juego
│   ├── App.css         ← Estilos
│   └── main.jsx        ← Entrada
├── index.html
├── package.json
└── vite.config.js
```

---

## 🔧 SOLUCIÓN DE PROBLEMAS

### "Cannot find module 'socket.io-client'"
Ejecuta: `npm install socket.io-client`

### Pantalla en blanco
Abre F12 (DevTools) y revisa la consola por errores.

### No conecta al servidor
Verifica que el servidor esté corriendo en otra terminal.
