import { useState, useEffect } from 'react';

const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  provider: 'apple' | 'google';
  accessToken?: string;
  idToken?: string;
}

interface GoogleAuthResponse {
  type: 'success' | 'error' | 'cancel';
  authentication?: {
    accessToken: string;
  };
  error?: any;
}

export const useGoogleAuth = () => {
  const [response, setResponse] = useState<GoogleAuthResponse | null>(null);
  const [popupWindow, setPopupWindow] = useState<Window | null>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) {
        return;
      }

      if (event.data.type === 'google-auth-success' && event.data.accessToken) {
        console.log('✅ Received access token via postMessage');
        setResponse({
          type: 'success',
          authentication: { accessToken: event.data.accessToken },
        });
        if (popupWindow && !popupWindow.closed) {
          popupWindow.close();
        }
        setPopupWindow(null);
      } else if (event.data.type === 'google-auth-error') {
        console.error('❌ Auth error via postMessage:', event.data.error);
        setResponse({
          type: 'error',
          error: event.data.error,
        });
        if (popupWindow && !popupWindow.closed) {
          popupWindow.close();
        }
        setPopupWindow(null);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [popupWindow]);

  useEffect(() => {
    if (!popupWindow) return;

    const checkPopupClosed = setInterval(() => {
      if (popupWindow.closed) {
        console.log('Popup closed by user');
        clearInterval(checkPopupClosed);
        setResponse({ type: 'cancel' });
        setPopupWindow(null);
      }
    }, 500);

    return () => clearInterval(checkPopupClosed);
  }, [popupWindow]);

  const promptAsync = async () => {
    return new Promise<void>((resolve, reject) => {
      try {
        if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID.includes('your-web-client-id')) {
          console.error('❌ Google OAuth not configured');
          console.error('📝 You need to set up Google OAuth credentials in the .env file');
          console.error('📖 See GOOGLE_OAUTH_CONFIGURATION.md for detailed instructions');
          console.error('🔗 Go to: https://console.cloud.google.com/apis/credentials');
          
          const errorMsg = 'Google OAuth non è configurato.\n\n' +
            '1. Vai su Google Cloud Console:\n' +
            '   https://console.cloud.google.com/apis/credentials\n\n' +
            '2. Crea un OAuth 2.0 Client ID per Web\n\n' +
            '3. Aggiungi il Client ID al file .env\n\n' +
            'Vedi GOOGLE_OAUTH_CONFIGURATION.md per istruzioni dettagliate.';
          
          setResponse({
            type: 'error',
            error: errorMsg,
          });
          reject(new Error('Google Client ID not configured'));
          return;
        }

        console.log('🚀 Starting Google auth with Client ID:', GOOGLE_CLIENT_ID.substring(0, 20) + '...');

        const redirectUri = window.location.origin + '/auth-callback';
        const scope = 'openid profile email';
        const responseType = 'token';
        const state = Math.random().toString(36).substring(7);
        
        const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
          `client_id=${encodeURIComponent(GOOGLE_CLIENT_ID)}&` +
          `redirect_uri=${encodeURIComponent(redirectUri)}&` +
          `response_type=${responseType}&` +
          `scope=${encodeURIComponent(scope)}&` +
          `state=${state}&` +
          `prompt=select_account`;

        console.log('🔗 Opening Google auth URL');
        console.log('📍 Redirect URI:', redirectUri);
        console.log('🔗 Full Auth URL:', authUrl);

        const width = 500;
        const height = 600;
        const left = Math.max(0, window.screen.width / 2 - width / 2);
        const top = Math.max(0, window.screen.height / 2 - height / 2);

        const windowFeatures = `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,location=yes,scrollbars=yes,status=yes,resizable=yes`;
        
        console.log('🪟 Opening popup with features:', windowFeatures);

        const popup = window.open(
          authUrl,
          'GoogleSignIn',
          windowFeatures
        );

        console.log('🔍 Popup result:', popup);

        if (!popup || popup.closed || typeof popup.closed === 'undefined') {
          console.error('❌ Popup blocked or failed to open');
          console.error('🔍 Popup object:', popup);
          console.error('🔍 Popup closed:', popup?.closed);
          
          setResponse({
            type: 'error',
            error: 'Il popup è stato bloccato dal browser.\n\nPer favore:\n1. Abilita i popup per questo sito\n2. Clicca sull\'icona del popup nella barra degli indirizzi\n3. Riprova',
          });
          reject(new Error('Popup blocked'));
          return;
        }

        try {
          popup.focus();
          console.log('✅ Popup focused');
        } catch (e) {
          console.warn('⚠️ Could not focus popup:', e);
        }

        setPopupWindow(popup);
        console.log('✅ Popup opened successfully');
        resolve();

      } catch (error) {
        console.error('❌ Google auth error:', error);
        setResponse({
          type: 'error',
          error,
        });
        reject(error);
      }
    });
  };

  return {
    request: null,
    response,
    promptAsync,
  };
};

export class AuthService {
  static isConfigured(): boolean {
    return !!GOOGLE_CLIENT_ID && !GOOGLE_CLIENT_ID.includes('your-web-client-id');
  }

  static async signInWithApple(): Promise<AuthUser | null> {
    throw new Error('Apple Sign-In su web richiede una configurazione Service ID su Apple Developer Portal. Per favore usa l\'app mobile iOS per accedere con Apple, oppure usa Google o l\'autenticazione email su web.');
  }

  static async getUserInfoFromGoogle(accessToken: string): Promise<AuthUser> {
    const userInfoResponse = await fetch(
      'https://www.googleapis.com/oauth2/v3/userinfo',
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!userInfoResponse.ok) {
      throw new Error('Failed to fetch Google user info');
    }

    const userInfo = await userInfoResponse.json();
    console.log('Google user info:', userInfo);

    return {
      id: userInfo.sub,
      email: userInfo.email,
      name: userInfo.name || 'Google User',
      provider: 'google',
      accessToken,
    };
  }

  static async isAppleSignInAvailable(): Promise<boolean> {
    return false;
  }
}
