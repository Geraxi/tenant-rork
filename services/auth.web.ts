export interface AuthUser {
  id: string;
  email: string;
  name: string;
  provider: 'apple' | 'google';
}

export const useGoogleAuth = () => {
  const noop = async () => {
    console.log('Google Sign-In not available on web in this environment');
    alert('Google Sign-In is not available on web. Please use the mobile app or sign in with email.');
  };

  return {
    request: null,
    response: null,
    promptAsync: noop,
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
