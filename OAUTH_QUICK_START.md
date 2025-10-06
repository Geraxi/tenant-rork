# 🚀 Quick Start: Google OAuth Setup

## ⚡ 5-Minute Setup Guide

Follow these steps to get Google Sign-In working in your Tenant app:

---

## 📋 Prerequisites

- Google account
- Access to [Google Cloud Console](https://console.cloud.google.com/)
- Terminal access to your project

---

## 🎯 Quick Steps

### 1️⃣ Create Google Cloud Project (2 min)

1. Go to https://console.cloud.google.com/
2. Click **"New Project"** → Name it "Tenant App" → **Create**
3. Wait for project creation, then select it

### 2️⃣ Enable Google+ API (30 sec)

1. Go to **"APIs & Services"** → **"Library"**
2. Search **"Google+ API"** → Click it → **"Enable"**

### 3️⃣ Configure OAuth Consent Screen (1 min)

1. Go to **"APIs & Services"** → **"OAuth consent screen"**
2. Select **"External"** → **"Create"**
3. Fill in:
   - App name: **Tenant**
   - User support email: **your-email@example.com**
   - Developer contact: **your-email@example.com**
4. Click **"Save and Continue"** → **"Save and Continue"** → **"Save and Continue"**

### 4️⃣ Create OAuth Credentials (2 min)

#### For Web (Required):
1. Go to **"APIs & Services"** → **"Credentials"**
2. **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
3. Type: **"Web application"**
4. Name: **Tenant Web**
5. Authorized JavaScript origins:
   ```
   http://localhost:8081
   http://localhost:19006
   ```
6. Authorized redirect URIs:
   ```
   http://localhost:8081
   http://localhost:19006
   ```
7. **"Create"** → **Copy the Client ID**

#### For iOS (Optional - if testing on iOS):
1. **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
2. Type: **"iOS"**
3. Name: **Tenant iOS**
4. Bundle ID: **app.rork.tenant-app**
5. **"Create"** → **Copy the Client ID**

#### For Android (Optional - if testing on Android):
1. Get SHA-1 fingerprint:
   ```bash
   keytool -keystore ~/.android/debug.keystore -list -v -alias androiddebugkey
   ```
   Password: `android`
   
2. **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
3. Type: **"Android"**
4. Name: **Tenant Android**
5. Package name: **app.rork.tenant-app**
6. SHA-1: **Paste the SHA-1 from step 1**
7. **"Create"** → **Copy the Client ID**

### 5️⃣ Configure Your App (1 min)

1. In your project root, create `.env` file:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and add your Client IDs:
   ```env
   EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=YOUR_WEB_CLIENT_ID.apps.googleusercontent.com
   EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=YOUR_IOS_CLIENT_ID.apps.googleusercontent.com
   EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com
   ```

3. **Restart Expo server**:
   ```bash
   # Press Ctrl+C to stop
   bun start
   ```

---

## ✅ Test It!

1. Open your app in browser or mobile
2. Click **"Sign in with Google"**
3. Select your Google account
4. Choose your role (Tenant/Landlord/Roommate)
5. You're in! 🎉

---

## 🐛 Troubleshooting

### "Google Client ID not configured"
- Make sure `.env` file exists
- Verify Client IDs are correct
- Restart Expo server

### "404 Error" or "Invalid Client"
- Check Client IDs in `.env`
- Verify OAuth consent screen is configured
- Make sure you're using the correct Client ID for your platform

### "Redirect URI mismatch"
- Add `http://localhost:8081` to Authorized redirect URIs
- Add `http://localhost:19006` to Authorized redirect URIs

### Still not working?
- Check browser console for detailed errors
- Verify all steps were completed
- See [GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md) for detailed guide

---

## 📚 Need More Help?

- **Detailed Guide**: [GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md)
- **Google OAuth Docs**: https://developers.google.com/identity/protocols/oauth2
- **Expo Auth Guide**: https://docs.expo.dev/guides/authentication/

---

**That's it! You're ready to use Google Sign-In! 🚀**
