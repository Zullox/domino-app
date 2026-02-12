# Configuración Android Adicional

Después de ejecutar `npx cap add android`, agregar estas configuraciones al
archivo `android/app/src/main/AndroidManifest.xml`:

## 1. Dentro del tag `<activity>` principal, agregar intent filters para deep links:

```xml
<!-- Deep Links con custom scheme -->
<intent-filter>
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="dominoranked" />
</intent-filter>

<!-- App Links con HTTPS -->
<intent-filter android:autoVerify="true">
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="https" android:host="tu-servidor.railway.app" android:pathPrefix="/join" />
</intent-filter>
```

## 2. Permisos (agregar antes de `<application>`):

```xml
<!-- Notificaciones Push (Android 13+) -->
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />

<!-- Internet (ya incluido por Capacitor) -->
<uses-permission android:name="android.permission.INTERNET" />

<!-- Vibración para haptics -->
<uses-permission android:name="android.permission.VIBRATE" />

<!-- Mantener despierto durante partida (opcional) -->
<uses-permission android:name="android.permission.WAKE_LOCK" />
```

## 3. Para AdMob, agregar dentro de `<application>`:

```xml
<meta-data
    android:name="com.google.android.gms.ads.APPLICATION_ID"
    android:value="ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY" />
```

## 4. Para FCM/Push, agregar `google-services.json`:

1. Ir a Firebase Console > Project Settings > General
2. Descargar `google-services.json`
3. Copiar a `android/app/google-services.json`

## 5. Verificar que `android/app/build.gradle` incluya:

```gradle
apply plugin: 'com.google.gms.google-services'
```

Y en `android/build.gradle` (raíz):

```gradle
classpath 'com.google.gms:google-services:4.4.0'
```
