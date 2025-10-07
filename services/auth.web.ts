import { useState } from 'react';

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

let googleAuthCallback: ((response: GoogleAuthResponse) => void) | null = null;

if (typeof window !== 'undefined') {
  (window as any).handleGoogleCallback = (response: any) => {
    if (googleAuthCallback) {
      if (response.access_token) {
        googleAuthCallback({
          type: 'success',
          authentication: {
            accessToken: response.access_token,
          },
        });
      } else if (response.error) {
        googleAuthCallback({
          type: 'error',
          error: response.error,
        });
      }
      googleAuthCallback = null;
    }
  };
}

export const useGoogleAuth = () => {
  const [response, setResponse] = useState<GoogleAuthResponse | null>(null);

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

        console.log('Starting Google auth with Client ID:', GOOGLE_CLIENT_ID.substring(0, 20) + '...');

        const redirectUri = window.location.origin;
        const scope = 'openid profile email';
        const responseType = 'token';
        
        const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
          `client_id=${encodeURIComponent(GOOGLE_CLIENT_ID)}&` +
          `redirect_uri=${encodeURIComponent(redirectUri)}&` +
          `response_type=${responseType}&` +
          `scope=${encodeURIComponent(scope)}&` +
          `prompt=select_account`;

        console.log('Opening Google auth URL:', authUrl);

        const width = 500;
        const height = 600;
        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;

        const popup = window.open(
          authUrl,
          'Google Sign-In',
          `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,location=yes`
        );

        if (!popup) {
          console.error('Popup blocked');
          setResponse({
            type: 'error',
            error: 'Popup bloccato. Abilita i popup per questo sito.',
          });
          reject(new Error('Popup blocked'));
          return;
        }

        let checkCount = 0;
        const maxChecks = 600;

        const checkPopup = setInterval(() => {
          checkCount++;

          if (checkCount > maxChecks) {
            clearInterval(checkPopup);
            console.log('Auth timeout');
            setResponse({ type: 'cancel' });
            if (popup && !popup.closed) {
              popup.close();
            }
            resolve();
            return;
          }

          if (popup.closed) {
            clearInterval(checkPopup);
            console.log('Popup closed by user');
            setResponse({ type: 'cancel' });
            resolve();
            return;
          }

          try {
            const popupUrl = popup.location.href;
            
            if (popupUrl && popupUrl.includes(window.location.origin)) {
              const hash = popup.location.hash;
              console.log('Popup redirected back, hash:', hash);
              
              if (hash && hash.includes('access_token')) {
                const params = new URLSearchParams(hash.substring(1));
                const accessToken = params.get('access_token');
                
                if (accessToken) {
                  console.log('Access token received:', accessToken.substring(0, 20) + '...');
                  clearInterval(checkPopup);
                  popup.close();
                  
                  setResponse({
                    type: 'success',
                    authentication: { accessToken },
                  });
                  resolve();
                  return;
                }
              } else if (hash && hash.includes('error')) {
                const params = new URLSearchParams(hash.substring(1));
                const error = params.get('error');
                console.error('Auth error from Google:', error);
                clearInterval(checkPopup);
                popup.close();
                
                setResponse({
                  type: 'error',
                  error: error || 'Authentication failed',
                });
                reject(new Error(error || 'Authentication failed'));
                return;
              }
            }
          } catch {
            // Cross-origin error, popup is still on Google's domain
          }
        }, 100);

      } catch (error) {
        console.error('Google auth error:', error);
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
