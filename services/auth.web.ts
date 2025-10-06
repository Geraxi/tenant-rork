import { useState } from 'react';

const GOOGLE_CLIENT_ID = '1234567890-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  provider: 'apple' | 'google';
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
  static async signInWithApple(): Promise<AuthUser | null> {
    console.log('Apple Sign-In not available on web');
    alert('Apple Sign-In is not available on web. Please use the mobile app or sign in with email.');
    return null;
  }

  static async getUserInfoFromGoogle(accessToken: string): Promise<AuthUser> {
    const userInfoResponse = await fetch(
      'https://www.googleapis.com/userinfo/v2/me',
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    const userInfo = await userInfoResponse.json();
    console.log('Google user info:', userInfo);

    return {
      id: userInfo.id,
      email: userInfo.email,
      name: userInfo.name || 'Utente Google',
      provider: 'google',
    };
  }

  static async isAppleSignInAvailable(): Promise<boolean> {
    return false;
  }
}
