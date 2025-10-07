# Configurazione OAuth per Google e Apple Sign-In

Questa guida spiega come configurare l'autenticazione con Google e Apple ID per l'app Tenant.

## Google Sign-In

### 1. Creare un progetto Google Cloud

1. Vai su [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuovo progetto o seleziona uno esistente
3. Abilita l'API "Google+ API" o "Google Identity"

### 2. Configurare OAuth 2.0

1. Vai su **APIs & Services** > **Credentials**
2. Clicca su **Create Credentials** > **OAuth client ID**

#### Per Web (React Native Web)
- Tipo applicazione: **Web application**
- Authorized JavaScript origins: `http://localhost:8081`, `https://tuodominio.com`
- Authorized redirect URIs: `http://localhost:8081`, `https://tuodominio.com`
- Copia il **Client ID** generato

#### Per iOS
- Tipo applicazione: **iOS**
- Bundle ID: `app.rork.tenant-app` (deve corrispondere a quello in app.json)
- Copia il **Client ID** generato

#### Per Android
- Tipo applicazione: **Android**
- Package name: `app.rork.tenant-app` (deve corrispondere a quello in app.json)
- SHA-1 certificate fingerprint: Ottienilo con:
  ```bash
  # Per debug keystore
  keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
  
  # Per release keystore
  keytool -list -v -keystore /path/to/your/keystore -alias your-key-alias
  ```
- Copia il **Client ID** generato

### 3. Configurare le variabili d'ambiente

Crea un file `.env` nella root del progetto:

```env
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-web-client-id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your-ios-client-id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=your-android-client-id.apps.googleusercontent.com
```

**IMPORTANTE**: Non committare il file `.env` nel repository. Aggiungi `.env` al `.gitignore`.

### 4. Configurare app.json (già fatto)

Il file `app.json` è già configurato con:
- iOS: `bundleIdentifier: "app.rork.tenant-app"`
- Android: `package: "app.rork.tenant-app"`
- iOS: `scheme: "myapp"` per deep linking

## Apple Sign-In

### 1. Configurare Apple Developer Account

1. Vai su [Apple Developer Portal](https://developer.apple.com/account/)
2. Seleziona **Certificates, Identifiers & Profiles**
3. Vai su **Identifiers** e seleziona il tuo App ID (`app.rork.tenant-app`)
4. Abilita **Sign In with Apple** capability
5. Salva le modifiche

### 2. Configurare Xcode (per build nativi)

1. Apri il progetto in Xcode
2. Seleziona il target dell'app
3. Vai su **Signing & Capabilities**
4. Clicca su **+ Capability**
5. Aggiungi **Sign In with Apple**

### 3. Configurazione app.json (già fatto)

Il file `app.json` è già configurato con:
```json
{
  "ios": {
    "usesAppleSignIn": true,
    "bundleIdentifier": "app.rork.tenant-app"
  }
}
```

### 4. Note importanti

- **Apple Sign-In è disponibile solo su iOS 13+**
- **Non funziona su web** - l'app mostrerà solo il pulsante Google su web
- **Richiede un Apple Developer Account a pagamento** ($99/anno)
- **Email privacy**: Gli utenti possono scegliere di nascondere la loro email reale. Apple fornirà un relay email (`@privaterelay.appleid.com`)

## Testing

### Google Sign-In
- **Web**: Funziona immediatamente con il Web Client ID
- **iOS**: Richiede un build nativo con Xcode o EAS Build
- **Android**: Richiede un build nativo con Android Studio o EAS Build

### Apple Sign-In
- **iOS**: Richiede un dispositivo fisico iOS 13+ o simulatore con iOS 13+
- **Non disponibile su Expo Go** - richiede un development build

## Troubleshooting

### Google Sign-In

**Errore: "Invalid client ID"**
- Verifica che i Client ID siano corretti nel file `.env`
- Assicurati che il Bundle ID/Package name corrisponda a quello configurato in Google Cloud Console

**Errore: "Redirect URI mismatch"**
- Verifica che gli Authorized redirect URIs in Google Cloud Console includano l'URL corrente
- Per Expo, usa il formato: `https://auth.expo.io/@your-username/your-app-slug`

**Popup bloccato (Web)**
- Assicurati che il browser non blocchi i popup
- L'app gestisce automaticamente questo caso mostrando un messaggio

### Apple Sign-In

**Errore: "Apple Sign-In is not available"**
- Verifica di essere su iOS 13+
- Assicurati che `usesAppleSignIn: true` sia in app.json
- Verifica che la capability sia abilitata in Xcode

**Errore: "Invalid client"**
- Verifica che il Bundle ID corrisponda a quello configurato in Apple Developer Portal
- Assicurati che Sign In with Apple sia abilitato per il tuo App ID

## Sicurezza

1. **Non committare mai le credenziali OAuth nel repository**
2. **Usa variabili d'ambiente** per tutti i Client ID e Secret
3. **Valida sempre i token sul backend** - il file `backend/trpc/routes/auth/signin/route.ts` già implementa la validazione
4. **Usa HTTPS in produzione** per tutti gli endpoint
5. **Implementa rate limiting** per prevenire abusi

## Backend

Il backend è già configurato per gestire l'autenticazione:

- **Endpoint**: `backend/trpc/routes/auth/signin/route.ts`
- **Validazione token**: Verifica i token Google e Apple
- **Creazione utente**: Crea automaticamente nuovi utenti o aggiorna quelli esistenti
- **Gestione sessione**: Restituisce un token di sessione per le richieste successive

## Prossimi passi

1. Configura i Client ID in Google Cloud Console
2. Crea il file `.env` con i tuoi Client ID
3. (Opzionale) Configura Apple Sign-In se hai un Apple Developer Account
4. Testa l'autenticazione su web e mobile
5. Implementa il logout (già disponibile tramite `useAuth().signOut()`)
