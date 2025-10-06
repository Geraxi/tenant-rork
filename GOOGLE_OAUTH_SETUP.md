# Google OAuth Setup Guide

## Il problema attuale

L'errore 404 che vedi quando clicchi su "Sign in with Google" è causato dal fatto che l'app sta usando un Google Client ID placeholder (fittizio) invece di un vero Client ID.

## Come risolvere

Per far funzionare Google Sign-In, devi configurare un progetto Google Cloud e ottenere i veri Client ID:

### 1. Crea un progetto Google Cloud

1. Vai su [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuovo progetto o seleziona uno esistente
3. Abilita la **Google+ API** (o **Google Identity Services**)

### 2. Crea le credenziali OAuth 2.0

Vai su [APIs & Credentials](https://console.cloud.google.com/apis/credentials) e crea 3 Client ID OAuth 2.0:

#### A. Web Client ID (per Expo Web)
- Tipo: **Web application**
- Authorized JavaScript origins:
  - `http://localhost:8081`
  - `https://tuodominio.com` (quando vai in produzione)
- Authorized redirect URIs:
  - `http://localhost:8081`
  - `https://tuodominio.com` (quando vai in produzione)

#### B. iOS Client ID (per app iOS)
- Tipo: **iOS**
- Bundle ID: Prendi il valore da `app.json` → `ios.bundleIdentifier`

#### C. Android Client ID (per app Android)
- Tipo: **Android**
- Package name: Prendi il valore da `app.json` → `android.package`
- SHA-1 certificate fingerprint: Ottienilo con:
  ```bash
  keytool -keystore ~/.android/debug.keystore -list -v
  ```
  (Password di default: `android`)

### 3. Configura le variabili d'ambiente

Crea un file `.env` nella root del progetto:

```env
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-web-client-id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your-ios-client-id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=your-android-client-id.apps.googleusercontent.com
```

### 4. Riavvia il server

Dopo aver configurato le variabili d'ambiente, riavvia il server Expo:

```bash
# Ferma il server corrente (Ctrl+C)
# Poi riavvia
bun expo start
```

## Modalità Demo

Se non vuoi configurare Google OAuth subito, puoi usare la modalità demo:

1. Clicca su **"Create account"** invece di "Sign in with Google"
2. Seleziona il tuo ruolo (Tenant, Landlord, o Roommate)
3. Completa il profilo

## Note importanti

- **Web**: Google Sign-In su web richiede che l'app sia servita da un dominio autorizzato
- **iOS**: Apple Sign-In funziona solo su dispositivi iOS fisici (non su simulatore)
- **Android**: Richiede la configurazione del SHA-1 fingerprint

## Verifica configurazione

Per verificare se la configurazione è corretta, controlla i log della console:
- Se vedi "Google Client ID not configured", significa che devi ancora configurare le variabili d'ambiente
- Se vedi errori 404, verifica che i redirect URIs siano configurati correttamente su Google Cloud Console
