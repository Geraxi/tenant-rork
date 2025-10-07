# 🚀 Setup Rapido Google OAuth

## ⚠️ Problema Attuale

Il pulsante "Accedi con Google" **non funziona** perché le credenziali OAuth non sono configurate nel file `.env`.

## ✅ Soluzione Rapida (5 minuti)

### 1️⃣ Vai su Google Cloud Console
👉 https://console.cloud.google.com/apis/credentials

### 2️⃣ Crea un nuovo progetto
- Clicca "Select a project" → "NEW PROJECT"
- Nome: "Tenant App"
- Clicca "CREATE"

### 3️⃣ Configura OAuth Consent Screen
- Vai su "APIs & Services" → "OAuth consent screen"
- Seleziona "External" → Compila i campi obbligatori
- Aggiungi scopes: `userinfo.email`, `userinfo.profile`, `openid`
- Aggiungi la tua email come test user

### 4️⃣ Crea Web Client ID
- Vai su "APIs & Services" → "Credentials"
- Clicca "CREATE CREDENTIALS" → "OAuth client ID"
- Tipo: **Web application**
- Nome: "Tenant Web Client"

**Authorized JavaScript origins:**
```
http://localhost:8081
https://localhost:8081
```

**Authorized redirect URIs** (⚠️ IMPORTANTE - include `/auth-callback`):
```
http://localhost:8081/auth-callback
https://localhost:8081/auth-callback
```

- Clicca "CREATE"
- **Copia il Client ID** (es. `123456789-abc123.apps.googleusercontent.com`)

### 5️⃣ Crea iOS Client ID (opzionale - solo per iOS)
- Tipo: **iOS**
- Bundle ID: `app.rork.tenant-app`
- Copia il Client ID

### 6️⃣ Crea Android Client ID (opzionale - solo per Android)
Prima ottieni il SHA-1 fingerprint:
```bash
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

- Tipo: **Android**
- Package name: `app.rork.tenant-app`
- SHA-1: incolla il valore ottenuto
- Copia il Client ID

### 7️⃣ Configura il file .env
Apri il file `.env` nella root del progetto e sostituisci i placeholder:

```env
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=IL-TUO-WEB-CLIENT-ID.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=IL-TUO-IOS-CLIENT-ID.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=IL-TUO-ANDROID-CLIENT-ID.apps.googleusercontent.com
```

### 8️⃣ Riavvia il server
```bash
# Ferma il server (Ctrl+C)
bun expo start
```

## 🎉 Test

1. Apri l'app nel browser
2. Clicca "Accedi con Google"
3. Dovrebbe aprirsi un popup di Google
4. Seleziona il tuo account
5. Autorizza l'app
6. ✅ Dovresti essere autenticato!

## 🐛 Problemi Comuni

### ❌ "Popup bloccato"
**Soluzione:** Abilita i popup per `localhost:8081` nelle impostazioni del browser

### ❌ "redirect_uri_mismatch"
**Soluzione:** Verifica che gli "Authorized redirect URIs" includano esattamente:
- `http://localhost:8081/auth-callback`
- `https://localhost:8081/auth-callback`

### ❌ "invalid_client"
**Soluzione:** Verifica che il Client ID nel file `.env` sia corretto (copia-incolla da Google Cloud Console)

### ❌ "Google Client ID not configured"
**Soluzione:** Hai dimenticato di sostituire i placeholder nel file `.env` o non hai riavviato il server

## 📚 Documentazione Completa

Per istruzioni dettagliate, vedi: [GOOGLE_OAUTH_CONFIGURATION.md](./GOOGLE_OAUTH_CONFIGURATION.md)

## 💡 Note

- **Solo Web:** Se vuoi testare solo su web, devi configurare solo il Web Client ID
- **Mobile:** Per iOS/Android, devi configurare anche i rispettivi Client ID
- **Produzione:** Quando pubblichi l'app, dovrai aggiornare gli Authorized URIs con il tuo dominio di produzione
