# 🚀 Guía de Setup: Dominó Ranked para Android

## Requisitos previos

- **Node.js 18+** (recomendado 20 LTS)
- **Android Studio** (última versión) con Android SDK 34+
- **Java 17** (viene con Android Studio)
- **Firebase CLI**: `npm install -g firebase-tools`
- **Git**

---

## 1. Configuración inicial

### 1.1 Instalar dependencias

```bash
cd domino-app
npm install
```

### 1.2 Configurar variables de entorno

```bash
# Copiar el template
cp .env.example .env

# Editar con tus valores reales de Firebase
# (los valores que antes estaban hardcodeados en firebase.js)
nano .env
```

Tu `.env` debe verse así:
```
VITE_SERVER_URL=http://localhost:3001
VITE_FIREBASE_API_KEY=AIzaSyBISfbvWeqKxnqIXOJdYPBoGRsSMqdqJvU
VITE_FIREBASE_AUTH_DOMAIN=domino-online-4cc5f.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=domino-online-4cc5f
VITE_FIREBASE_STORAGE_BUCKET=domino-online-4cc5f.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=329019462538
VITE_FIREBASE_APP_ID=1:329019462538:web:bf249ae218bee3b1dbee73
```

### 1.3 Verificar que la web funciona

```bash
npm run dev
# Abrir http://localhost:3000
```

---

## 2. Desplegar Firestore Security Rules

**⚠️ IMPORTANTE: Hacer esto ANTES de publicar la app**

```bash
# Login en Firebase
firebase login

# Inicializar (seleccionar Firestore y Hosting)
firebase init
# Cuando pregunte por proyecto, seleccionar: domino-online-4cc5f
# Cuando pregunte por rules file: firestore.rules (ya existe)
# Cuando pregunte por public directory: dist

# Desplegar solo las reglas
firebase deploy --only firestore:rules

# Verificar que se desplegaron
firebase firestore:rules --project domino-online-4cc5f
```

---

## 3. Configurar Capacitor para Android

### 3.1 Generar el build web

```bash
npm run build
```

### 3.2 Agregar plataforma Android

```bash
# Inicializar Capacitor (si no se hizo aún)
npx cap init "Dominó Ranked" com.dominoranked.app --web-dir dist

# Agregar Android
npx cap add android

# Sincronizar archivos web → Android
npx cap sync android
```

### 3.3 Abrir en Android Studio

```bash
npx cap open android
```

### 3.4 Configurar en Android Studio

1. **Verificar SDK**: File → Project Structure → SDK Location
   - Android SDK debe estar configurado
   - Compilar con SDK 34 o superior

2. **Cambiar nombre de app** (si es necesario):
   - `android/app/src/main/res/values/strings.xml`
   ```xml
   <string name="app_name">Dominó Ranked</string>
   ```

3. **Configurar colores de la app**:
   - `android/app/src/main/res/values/colors.xml`
   ```xml
   <color name="colorPrimary">#F59E0B</color>
   <color name="colorPrimaryDark">#D97706</color>
   <color name="colorAccent">#3B82F6</color>
   ```

4. **Configurar splash screen** oscuro:
   - `android/app/src/main/res/values/styles.xml`
   ```xml
   <style name="AppTheme.NoActionBar" parent="Theme.AppCompat.NoActionBar">
       <item name="android:background">#0a0a0f</item>
       <item name="android:statusBarColor">#0a0a0f</item>
       <item name="android:navigationBarColor">#0a0a0f</item>
   </style>
   ```

### 3.5 Generar íconos

1. Ve a https://icon.kitchen/
2. Sube `public/favicon.svg`
3. Descarga los íconos generados
4. Copia a `android/app/src/main/res/mipmap-*`

### 3.6 Probar en emulador o dispositivo

```bash
# Con dispositivo USB conectado (USB debugging habilitado)
npx cap run android

# O desde Android Studio: Run → Run 'app'
```

---

## 4. Configurar Push Notifications (FCM)

### 4.1 En Firebase Console

1. Ve a **Project Settings** → **Cloud Messaging**
2. Descarga `google-services.json`
3. Cópialo a `android/app/google-services.json`

### 4.2 Verificar que el plugin está en AndroidManifest

Capacitor agrega esto automáticamente, pero verifica que exista en
`android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
```

---

## 5. Workflow de desarrollo diario

```bash
# 1. Desarrollar en web (hot reload)
npm run dev

# 2. Cuando quieras probar en Android
npm run build
npx cap sync android
npx cap run android

# Atajo (todo junto):
npm run android
```

---

## 6. Build para producción (Google Play)

### 6.1 Generar keystore de firma

```bash
keytool -genkey -v -keystore domino-ranked.keystore -alias domino -keyalg RSA -keysize 2048 -validity 10000
# ⚠️ GUARDAR la contraseña en lugar seguro. Si la pierdes, no puedes actualizar la app.
```

### 6.2 Configurar firma en Android Studio

1. Build → Generate Signed Bundle / APK
2. Seleccionar **Android App Bundle** (.aab) para Google Play
3. Usar el keystore que generaste
4. Build type: **release**

### 6.3 Antes de subir a Google Play

Checklist:
- [ ] Íconos en todas las resoluciones
- [ ] Screenshots (mínimo 2 por tipo de dispositivo)
- [ ] Descripción de la app (corta y larga)
- [ ] Política de privacidad (URL)
- [ ] Clasificación de contenido (rellenar cuestionario)
- [ ] Configurar países y precios
- [ ] Cuenta de desarrollador de Google Play ($25 una sola vez)

---

## 7. Estructura de archivos añadidos/modificados

```
domino-app/
├── .env                           # Variables de entorno (NO subir a git)
├── .env.example                   # Template
├── .gitignore                     # Protege .env y builds
├── capacitor.config.ts            # Config de Capacitor + deep links
├── firebase.json                  # Firebase CLI config
├── firestore.rules                # Reglas de seguridad Firestore
├── firestore.indexes.json         # Índices de Firestore
├── vite.config.js                 # PWA plugin + code splitting
├── index.html                     # Meta tags móvil/PWA/OG
├── package.json                   # Capacitor + AdMob + RevenueCat
├── SETUP.md                       # Esta guía
├── ANDROID_CONFIG.md              # Config adicional de Android
├── public/
│   ├── favicon.svg                # Ícono SVG de ficha de dominó
│   └── icons/README.md            # Guía para generar PNGs
├── src/
│   ├── firebase.js                # ARREGLADO - Usa env vars
│   ├── firestore.js               # ARREGLADO - Usa env vars
│   ├── constants/serverConfig.js  # ARREGLADO - import.meta.env (Vite)
│   ├── screens/
│   │   ├── TutorialScreen.jsx     # Onboarding 8 pasos (ES/EN)
│   │   ├── PrivateRoomScreen.jsx  # Crear/unirse salas privadas
│   │   ├── CoinStoreScreen.jsx    # Comprar coins + ads rewarded
│   │   └── SeasonPassScreen.jsx   # Pase de temporada free/premium
│   ├── components/modals/
│   │   └── ReportPlayerModal.jsx  # Reportar jugadores
│   └── services/
│       ├── native.js              # Bridge Capacitor ↔ Web
│       ├── analytics.js           # Firebase Analytics (20+ eventos)
│       ├── reports.js             # Sistema de reportes + cooldown
│       ├── ads.js                 # AdMob (rewarded + interstitial)
│       ├── purchases.js           # In-app purchases (Google Play)
│       └── deepLinks.js           # Deep linking handler

domino-server/src/
├── index.js                       # ACTUALIZADO - Nuevos REST + socket events
└── services/
    ├── notifications.js           # FCM push notifications (8 tipos)
    ├── purchases.js               # Verificación compras server-side
    ├── seasons.js                 # Temporadas + rewards + soft reset
    └── privateRooms.js            # Salas privadas con código
```
