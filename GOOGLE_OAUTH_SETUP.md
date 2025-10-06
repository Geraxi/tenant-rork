# 🔐 Google OAuth Setup Guide for Tenant App

## 📋 Overview

This guide will help you set up Google OAuth authentication for the Tenant app. You'll need to create OAuth credentials in Google Cloud Console and configure them in your app.

---

## 🚨 Current Issue

The **404 error** when clicking "Sign in with Google" occurs because the app is using placeholder Google Client IDs instead of real ones.

**To fix this, you need to:**
1. Create a Google Cloud project
2. Generate OAuth 2.0 credentials
3. Configure environment variables
4. Restart the Expo server

---

## 📝 Step-by-Step Setup

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"Select a project"** → **"New Project"**
3. Enter project name (e.g., "Tenant App")
4. Click **"Create"**
5. Wait for the project to be created and select it

### Step 2: Enable Required APIs

1. In your project, go to **"APIs & Services"** → **"Library"**
2. Search for **"Google+ API"** or **"Google Identity Services"**
3. Click on it and press **"Enable"**

### Step 3: Configure OAuth Consent Screen

1. Go to **"APIs & Services"** → **"OAuth consent screen"**
2. Select **"External"** user type
3. Click **"Create"**
4. Fill in required fields:
   - **App name**: Tenant
   - **User support email**: Your email
   - **Developer contact**: Your email
5. Click **"Save and Continue"**
6. Skip **"Scopes"** (click "Save and Continue")
7. Add test users if needed (your email)
8. Click **"Save and Continue"**

### Step 4: Create OAuth 2.0 Credentials

You need to create **3 different Client IDs** for Web, iOS, and Android:

#### A. 🌐 Web Client ID (for Expo Web)

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
3. Select **"Web application"**
4. Name: `Tenant Web Client`
5. **Authorized JavaScript origins**:
   ```
   http://localhost:8081
   http://localhost:19006
   https://your-production-domain.com
   ```
6. **Authorized redirect URIs**:
   ```
   http://localhost:8081
   http://localhost:19006
   https://your-production-domain.com
   https://auth.expo.io/@your-username/tenant
   ```
7. Click **"Create"**
8. **Copy the Client ID** (format: `xxxxx.apps.googleusercontent.com`)

#### B. 📱 iOS Client ID (for native iOS app)

1. Click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
2. Select **"iOS"**
3. Name: `Tenant iOS Client`
4. **Bundle ID**: `app.rork.tenant-app` (from `app.json` → `ios.bundleIdentifier`)
5. Click **"Create"**
6. **Copy the Client ID**

#### C. 🤖 Android Client ID (for native Android app)

1. Click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
2. Select **"Android"**
3. Name: `Tenant Android Client`
4. **Package name**: `app.rork.tenant-app` (from `app.json` → `android.package`)
5. **SHA-1 certificate fingerprint**: Get it by running:
   ```bash
   # For development (debug keystore)
   keytool -keystore ~/.android/debug.keystore -list -v -alias androiddebugkey
   ```
   - Default password: `android`
   - Copy the **SHA-1** value (format: `AA:BB:CC:...`)
6. Click **"Create"**
7. **Copy the Client ID**

---

### Step 5: Configure Environment Variables

1. In your project root, copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and replace the placeholder values with your actual Client IDs:
   ```env
   EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-web-client-id.apps.googleusercontent.com
   EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your-ios-client-id.apps.googleusercontent.com
   EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=your-android-client-id.apps.googleusercontent.com
   ```

3. **Important**: Make sure `.env` is in your `.gitignore` to keep credentials secure

---

### Step 6: Restart Expo Server

After configuring environment variables, **restart the Expo development server**:

```bash
# Stop the current server (Ctrl+C or Cmd+C)
# Then restart
bun expo start
# or
bun start
```

---

## ✅ Verify Configuration

### Test on Web:
1. Open the app in your browser
2. Click **"Sign in with Google"**
3. You should see the Google sign-in popup
4. Select your Google account
5. Grant permissions
6. You should be redirected back to the app

### Test on Mobile (iOS/Android):
1. Scan the QR code with Expo Go
2. Click **"Sign in with Google"**
3. Complete the Google sign-in flow
4. You should be logged in

### Check Console Logs:
- ✅ **Success**: You'll see "Google user info: {...}" in the console
- ❌ **Error**: Check the error message:
  - `"Google Client ID not configured"` → Environment variables not loaded
  - `"Invalid client"` → Wrong Client ID or not configured in Google Cloud
  - `"Redirect URI mismatch"` → Add the redirect URI to Google Cloud Console

---

## 🔧 Troubleshooting

### Issue: "Google Client ID not configured"
**Solution**: 
- Make sure `.env` file exists in project root
- Verify environment variables are set correctly
- Restart Expo server after creating `.env`

### Issue: "404 Error" or "Invalid Client"
**Solution**:
- Verify Client IDs are correct in `.env`
- Make sure you're using the right Client ID for each platform
- Check that OAuth consent screen is configured

### Issue: "Redirect URI mismatch"
**Solution**:
- Add all redirect URIs to Google Cloud Console
- For Expo Go, add: `https://auth.expo.io/@your-username/tenant`
- For local development, add: `http://localhost:8081` and `http://localhost:19006`

### Issue: "Access blocked: This app's request is invalid"
**Solution**:
- Make sure OAuth consent screen is configured
- Add your email as a test user
- Verify all required fields are filled

### Issue: Works on one platform but not others
**Solution**:
- Verify you created separate Client IDs for Web, iOS, and Android
- Check that each Client ID is configured correctly
- For Android, verify SHA-1 fingerprint is correct

---

## 🍎 Apple Sign-In Setup (iOS Only)

Apple Sign-In is already configured in `app.json` but requires:

1. **Apple Developer Account** (paid)
2. **App ID** with Sign in with Apple capability enabled
3. **Physical iOS device** (doesn't work in simulator)

**Note**: Apple Sign-In is not available on web or Android.

---

## 🔒 Security Best Practices

1. **Never commit `.env` to Git**
   - Add `.env` to `.gitignore`
   - Use `.env.example` as a template

2. **Use different credentials for production**
   - Create separate OAuth clients for production
   - Use environment-specific redirect URIs

3. **Restrict API keys**
   - In Google Cloud Console, restrict Client IDs to specific domains/apps
   - Enable only necessary APIs

4. **Rotate credentials regularly**
   - Update OAuth credentials periodically
   - Revoke old credentials when no longer needed

---

## 📚 Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Expo AuthSession Guide](https://docs.expo.dev/guides/authentication/)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Expo Apple Authentication](https://docs.expo.dev/versions/latest/sdk/apple-authentication/)

---

## 🆘 Still Having Issues?

If you're still experiencing problems:

1. Check the browser console for detailed error messages
2. Verify all steps were completed correctly
3. Try creating new OAuth credentials
4. Make sure your Google Cloud project is active
5. Check that APIs are enabled

---

## 📞 Support

For additional help:
- Check Expo documentation
- Review Google OAuth troubleshooting guides
- Verify your Google Cloud project settings

---

**Good luck! 🚀**
