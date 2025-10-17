import { Platform } from 'react-native';
import { User } from '../types';

// Only import Google Sign-In if not in Expo Go
let GoogleSignin: any = null;
let statusCodes: any = null;

try {
  if (Platform.OS !== 'web') {
    const googleSigninModule = require('@react-native-google-signin/google-signin');
    GoogleSignin = googleSigninModule.GoogleSignin;
    statusCodes = googleSigninModule.statusCodes;
    
    // Configure Google Sign-In only if available
    GoogleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || 'YOUR_WEB_CLIENT_ID',
      offlineAccess: true,
      hostedDomain: '',
      forceCodeForRefreshToken: true,
    });
  }
} catch (error) {
  if (__DEV__) {
    console.log('Google Sign-In not available in Expo Go');
  }
}

export interface GoogleAuthResult {
  success: boolean;
  user?: User;
  error?: string;
}

export const initializeGoogleAuth = async (): Promise<void> => {
  if (!GoogleSignin) {
    if (__DEV__) {
      console.log('Google Sign-In not available - requires development build');
    }
    return;
  }
  
  try {
    await GoogleSignin.hasPlayServices();
  } catch (error) {
    if (__DEV__) {
      console.error('Google Play Services error:', error);
    }
  }
};

export const signInWithGoogle = async (): Promise<GoogleAuthResult> => {
  if (!GoogleSignin) {
    return {
      success: false,
      error: 'Google Sign-In not available in Expo Go. Please use a development build.',
    };
  }
  
  try {
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();
    
    if (userInfo.user) {
      const user: User = {
        id: userInfo.user.id,
        name: userInfo.user.name || '',
        email: userInfo.user.email,
        userType: 'tenant', // Default to tenant, can be changed later
        age: 25, // Default age, can be updated in profile
        dateOfBirth: '01/01/1999', // Default date, can be updated
        bio: '',
        photos: userInfo.user.photo ? [userInfo.user.photo] : [],
        location: '',
        verified: 'verified',
        idVerified: true,
        backgroundCheckPassed: false,
        employmentStatus: 'employed',
        jobType: 'other',
        preferences: {
          budget: 1500,
          petFriendly: false,
          smoking: false,
        },
        createdAt: Date.now(),
      };

      return {
        success: true,
        user,
      };
    }

    return {
      success: false,
      error: 'No user information received from Google',
    };
  } catch (error: any) {
    if (__DEV__) {
      console.error('Google Sign-In error:', error);
    }
    
    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      return {
        success: false,
        error: 'Sign-in was cancelled',
      };
    } else if (error.code === statusCodes.IN_PROGRESS) {
      return {
        success: false,
        error: 'Sign-in is already in progress',
      };
    } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      return {
        success: false,
        error: 'Google Play Services not available',
      };
    }

    return {
      success: false,
      error: 'An error occurred during Google Sign-In',
    };
  }
};

export const signOutGoogle = async (): Promise<void> => {
  if (!GoogleSignin) {
    if (__DEV__) {
      console.log('Google Sign-In not available - cannot sign out');
    }
    return;
  }
  
  try {
    await GoogleSignin.signOut();
  } catch (error) {
    if (__DEV__) {
      console.error('Google Sign-Out error:', error);
    }
  }
};
