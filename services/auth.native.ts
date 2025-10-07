import { Platform } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '';
const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || '';
const GOOGLE_ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || '';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  provider: 'apple' | 'google';
  accessToken?: string;
  idToken?: string;
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
  static isConfigured(): boolean {
    const hasValidWebId = GOOGLE_WEB_CLIENT_ID && !GOOGLE_WEB_CLIENT_ID.includes('your-web-client-id');
    const hasValidIosId = GOOGLE_IOS_CLIENT_ID && !GOOGLE_IOS_CLIENT_ID.includes('your-ios-client-id');
    const hasValidAndroidId = GOOGLE_ANDROID_CLIENT_ID && !GOOGLE_ANDROID_CLIENT_ID.includes('your-android-client-id');
    return !!(hasValidWebId && hasValidIosId && hasValidAndroidId);
  }

  static async signInWithApple(): Promise<AuthUser | null> {
    try {
      if (Platform.OS !== 'ios') {
        throw new Error('Apple Sign-In is only available on iOS');
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
          : 'Apple User';
        
        return {
          id: user,
          email: email || `${user}@privaterelay.appleid.com`,
          name: userName || 'Apple User',
          provider: 'apple',
          idToken: credential.identityToken,
        };
      }
      
      return null;
    } catch (error: any) {
      if (error.code === 'ERR_REQUEST_CANCELED') {
        console.log('Apple Sign-In canceled by user');
        return null;
      }
      console.error('Apple Sign-In Error:', error);
      throw error;
    }
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
    if (Platform.OS !== 'ios') return false;
    
    try {
      return await AppleAuthentication.isAvailableAsync();
    } catch {
      return false;
    }
  }
}
