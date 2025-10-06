import { Platform } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_WEB_CLIENT_ID = '1234567890-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com';
const GOOGLE_IOS_CLIENT_ID = '1234567890-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com';
const GOOGLE_ANDROID_CLIENT_ID = '1234567890-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  provider: 'apple' | 'google';
}

export const useGoogleAuth = () => {
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    iosClientId: GOOGLE_IOS_CLIENT_ID,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID,
  });

  return { request, response, promptAsync };
};

export class AuthService {
  static async signInWithApple(): Promise<AuthUser | null> {
    try {
      if (Platform.OS !== 'ios') {
        throw new Error('Apple Sign-In è disponibile solo su iOS');
      }

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      console.log('Apple credential received:', credential);

      if (credential.identityToken) {
        const { user, email, fullName } = credential;
        
        const userName = fullName 
          ? `${fullName.givenName || ''} ${fullName.familyName || ''}`.trim() 
          : 'Utente Apple';
        
        return {
          id: user,
          email: email || `${user}@privaterelay.appleid.com`,
          name: userName || 'Utente Apple',
          provider: 'apple',
        };
      }
      
      return null;
    } catch (error: any) {
      if (error.code === 'ERR_REQUEST_CANCELED') {
        console.log('Apple Sign-In cancellato dall\'utente');
        return null;
      }
      console.error('Apple Sign-In Error:', error);
      throw error;
    }
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
    if (Platform.OS !== 'ios') return false;
    
    try {
      return await AppleAuthentication.isAvailableAsync();
    } catch {
      return false;
    }
  }
}
