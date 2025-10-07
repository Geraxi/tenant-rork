# Configurazione Google OAuth

Questa guida ti aiuterà a configurare l'autenticazione Google per la tua app Tenant.

## Problema Attuale

Il pulsante "Accedi con Google" non funziona perché le credenziali OAuth non sono configurate. Vedrai un errore simile a:
```
Google OAuth non è configurato. Controlla il file .env e aggiungi le credenziali Google.
```

## Soluzione: Configurare Google OAuth

### Passo 1: Creare un Progetto su Google Cloud Console

1. Vai su [Google Cloud Console](https://console.cloud.google.com/)
2. Clicca su "Select a project" in alto
3. Clicca su "NEW PROJECT"
4. Inserisci un nome per il progetto (es. "Tenant App")
5. Clicca su "CREATE"

### Passo 2: Abilitare Google+ API

1. Nel menu laterale, vai su "APIs & Services" > "Library"
2. Cerca "Google+ API"
3. Clicca su "Google+ API"
4. Clicca su "ENABLE"

### Passo 3: Configurare OAuth Consent Screen

1. Nel menu laterale, vai su "APIs & Services" > "OAuth consent screen"
2. Seleziona "External" (o "Internal" se hai un Google Workspace)
3. Clicca su "CREATE"
4. Compila i campi obbligatori:
   - **App name**: Tenant
   - **User support email**: la tua email
   - **Developer contact information**: la tua email
5. Clicca su "SAVE AND CONTINUE"
6. Nella sezione "Scopes", clicca su "ADD OR REMOVE SCOPES"
7. Seleziona:
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
   - `openid`
8. Clicca su "UPDATE" e poi "SAVE AND CONTINUE"
9. Nella sezione "Test users", aggiungi il tuo indirizzo email per testare
10. Clicca su "SAVE AND CONTINUE"

### Passo 4: Creare le Credenziali OAuth

Devi creare **3 OAuth Client ID** separati: uno per Web, uno per iOS e uno per Android.

#### 4.1 - Web Client ID

1. Nel menu laterale, vai su "APIs & Services" > "Credentials"
2. Clicca su "CREATE CREDENTIALS" > "OAuth client ID"
3. Seleziona "Web application"
4. Nome: "Tenant Web Client"
5. In "Authorized JavaScript origins", aggiungi:
   ```
   http://localhost:8081
   https://localhost:8081
   ```
   (Aggiungi anche il tuo dominio di produzione se ne hai uno)
6. In "Authorized redirect URIs", aggiungi:
   ```
   http://localhost:8081/auth-callback
   https://localhost:8081/auth-callback
   ```
   **IMPORTANTE**: Devi includere `/auth-callback` alla fine dell'URL!
   (Aggiungi anche il tuo dominio di produzione se ne hai uno, es. `https://tuodominio.com/auth-callback`)
7. Clicca su "CREATE"
8. **Copia il Client ID** (sarà simile a `123456789-abc123.apps.googleusercontent.com`)

#### 4.2 - iOS Client ID

1. Clicca su "CREATE CREDENTIALS" > "OAuth client ID"
2. Seleziona "iOS"
3. Nome: "Tenant iOS Client"
4. Bundle ID: `app.rork.tenant-app` (deve corrispondere a quello in `app.json`)
5. Clicca su "CREATE"
6. **Copia il Client ID**

#### 4.3 - Android Client ID

1. Prima devi ottenere il SHA-1 fingerprint del tuo keystore di debug:
   ```bash
   # Su macOS/Linux
   keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
   
   # Su Windows
   keytool -list -v -keystore %USERPROFILE%\.android\debug.keystore -alias androiddebugkey -storepass android -keypass android
   ```
   Copia il valore SHA-1 (sarà simile a `A1:B2:C3:D4:...`)

2. Clicca su "CREATE CREDENTIALS" > "OAuth client ID"
3. Seleziona "Android"
4. Nome: "Tenant Android Client"
5. Package name: `app.rork.tenant-app` (deve corrispondere a quello in `app.json`)
6. SHA-1 certificate fingerprint: incolla il valore copiato prima
7. Clicca su "CREATE"
8. **Copia il Client ID**

### Passo 5: Configurare il File .env

1. Apri il file `.env` nella root del progetto
2. Sostituisci i valori placeholder con i tuoi Client ID:

```env
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=TUO-WEB-CLIENT-ID.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=TUO-IOS-CLIENT-ID.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=TUO-ANDROID-CLIENT-ID.apps.googleusercontent.com
```

### Passo 6: Riavviare l'App

1. Ferma il server di sviluppo (Ctrl+C)
2. Riavvia con:
   ```bash
   npm start
   # oppure
   bun start
   ```

## Test

1. Apri l'app nel browser o sul dispositivo mobile
2. Clicca su "Accedi con Google"
3. Dovrebbe aprirsi un popup (web) o una schermata di autenticazione (mobile)
4. Seleziona il tuo account Google
5. Autorizza l'app
6. Dovresti essere reindirizzato all'app e autenticato

## Troubleshooting

### Errore: "Popup bloccato"
- **Soluzione**: Abilita i popup per il sito nelle impostazioni del browser

### Errore: "redirect_uri_mismatch"
- **Causa**: L'URL di redirect non è autorizzato
- **Soluzione**: Verifica che l'URL in "Authorized redirect URIs" corrisponda esattamente all'URL dell'app

### Errore: "invalid_client"
- **Causa**: Il Client ID non è corretto o non è configurato
- **Soluzione**: Verifica che i Client ID nel file `.env` siano corretti

### L'autenticazione funziona su web ma non su mobile
- **Causa**: I Client ID per iOS/Android non sono configurati correttamente
- **Soluzione**: Verifica che:
  - Il Bundle ID (iOS) corrisponda a quello in `app.json`
  - Il Package name (Android) corrisponda a quello in `app.json`
  - Il SHA-1 fingerprint (Android) sia corretto

## Note Importanti

1. **Non committare il file .env**: Il file `.env` è già nel `.gitignore` per evitare di esporre le credenziali
2. **Ambiente di produzione**: Quando pubblichi l'app, dovrai:
   - Creare un nuovo progetto Google Cloud per produzione
   - Aggiornare gli Authorized origins/redirect URIs con i domini di produzione
   - Ottenere il SHA-1 del keystore di produzione per Android
3. **Limiti di quota**: Google ha limiti di quota per le API. Per un'app in produzione, potresti dover richiedere quote più alte

## Link Utili

- [Google Cloud Console](https://console.cloud.google.com/)
- [Documentazione OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [Expo Auth Session](https://docs.expo.dev/versions/latest/sdk/auth-session/)
