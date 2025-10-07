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
    try {
      if (!GOOGLE_CLIENT_ID) {
        setResponse({
          type: 'error',
          error: 'Google Client ID not configured',
        });
        return;
      }

      const redirectUri = window.location.origin + window.location.pathname;
      const scope = 'openid profile email';
      const responseType = 'token';
      
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${encodeURIComponent(GOOGLE_CLIENT_ID)}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=${responseType}&` +
        `scope=${encodeURIComponent(scope)}&` +
        `prompt=select_account`;

      const width = 500;
      const height = 600;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;

      const popup = window.open(
        authUrl,
        'Google Sign-In',
        `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no`
      );

      if (!popup) {
        setResponse({
          type: 'error',
          error: 'Popup blocked. Please allow popups for this site.',
        });
        return;
      }

      googleAuthCallback = (authResponse: GoogleAuthResponse) => {
        setResponse(authResponse);
        if (popup && !popup.closed) {
          popup.close();
        }
      };

      const checkPopup = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkPopup);
          if (googleAuthCallback) {
            setResponse({ type: 'cancel' });
            googleAuthCallback = null;
          }
        }

        try {
          if (popup.location.href.includes(window.location.origin)) {
            const hash = popup.location.hash;
            if (hash) {
              const params = new URLSearchParams(hash.substring(1));
              const accessToken = params.get('access_token');
              
              if (accessToken && googleAuthCallback) {
                googleAuthCallback({
                  type: 'success',
                  authentication: { accessToken },
                });
                clearInterval(checkPopup);
                popup.close();
              }
            }
          }
        } catch {
          // Cross-origin error, popup is still on Google's domain
        }
      }, 500);

    } catch (error) {
      console.error('Google auth error:', error);
      setResponse({
        type: 'error',
        error,
      });
    }
  };

  return {
    request: null,
    response,
    promptAsync,
  };
};

export class AuthService {
  static isConfigured(): boolean {
    return !!GOOGLE_CLIENT_ID;
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
