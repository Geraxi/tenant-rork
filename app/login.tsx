import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import { Stack, router } from 'expo-router';
import { Home, Users, Key } from 'lucide-react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useUser } from '@/store/user-store';
import { AuthService, useGoogleAuth } from '@/services/auth';
import TenantLogo from '@/components/TenantLogo';
import { UserMode } from '@/types';

export default function LoginScreen() {
  const { signIn } = useUser();
  const { response: googleResponse, promptAsync: googlePromptAsync } = useGoogleAuth();
  const [isAppleSignInAvailable, setIsAppleSignInAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginStatus, setLoginStatus] = useState<string>('');
  const [showUserTypeSelection, setShowUserTypeSelection] = useState(false);
  const [pendingAuthData, setPendingAuthData] = useState<{
    provider: 'google' | 'apple';
    providerId: string;
    email: string;
    name: string;
    accessToken?: string;
    idToken?: string;
  } | null>(null);
  const [selectedUserType, setSelectedUserType] = useState<UserMode>('tenant');

  useEffect(() => {
    checkAppleSignInAvailability();
  }, []);

  useEffect(() => {
    if (googleResponse) {
      handleGoogleResponse();
    }
  }, [googleResponse]);

  const checkAppleSignInAvailability = async () => {
    const available = await AuthService.isAppleSignInAvailable();
    setIsAppleSignInAvailable(available);
  };

  const handleGoogleResponse = async () => {
    if (googleResponse?.type === 'success') {
      try {
        setIsLoading(true);
        setLoginStatus('Retrieving Google account information...');
        
        const { authentication } = googleResponse;
        if (authentication?.accessToken) {
          const user = await AuthService.getUserInfoFromGoogle(authentication.accessToken);
          
          setLoginStatus('Select your role');
          setPendingAuthData({
            provider: 'google',
            providerId: user.id,
            email: user.email,
            name: user.name,
            accessToken: authentication.accessToken,
          });
          setShowUserTypeSelection(true);
        }
      } catch (error: any) {
        console.error('Google user info error:', error);
        const errorMessage = error?.message || 'Failed to retrieve account information';
        setLoginStatus(errorMessage);
        Alert.alert('Error', errorMessage);
        setTimeout(() => setLoginStatus(''), 5000);
      } finally {
        setIsLoading(false);
      }
    } else if (googleResponse?.type === 'cancel') {
      setLoginStatus('Sign-in canceled');
      setTimeout(() => setLoginStatus(''), 3000);
    } else if (googleResponse?.type === 'error') {
      console.error('Google auth error:', googleResponse.error);
      const errorMsg = googleResponse.error?.message || 'Authentication error';
      setLoginStatus(errorMsg);
      Alert.alert('Error', errorMsg);
      setTimeout(() => setLoginStatus(''), 5000);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      setLoginStatus('Checking configuration...');
      
      if (!AuthService.isConfigured()) {
        const message = 'Google Sign-In is not configured. Please add your Google OAuth credentials to the .env file. See GOOGLE_OAUTH_SETUP.md for instructions.';
        console.warn(message);
        setLoginStatus(message);
        Alert.alert(
          'Configuration Required',
          'Google Sign-In requires OAuth credentials. Please check the console for setup instructions.',
          [{ text: 'OK' }]
        );
        setTimeout(() => setLoginStatus(''), 6000);
        setIsLoading(false);
        return;
      }
      
      setLoginStatus('Opening Google Sign-In...');
      await googlePromptAsync();
    } catch (error) {
      console.error('Google login error:', error);
      setLoginStatus('Error opening Google Sign-In');
      Alert.alert('Error', 'Failed to open Google Sign-In');
      setTimeout(() => setLoginStatus(''), 3000);
      setIsLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    try {
      setIsLoading(true);
      setLoginStatus('Connecting with Apple...');
      
      const user = await AuthService.signInWithApple();
      
      if (user) {
        setLoginStatus('Select your role');
        setPendingAuthData({
          provider: 'apple',
          providerId: user.id,
          email: user.email,
          name: user.name,
          idToken: user.idToken,
        });
        setShowUserTypeSelection(true);
      } else {
        setLoginStatus('Sign-in canceled by user');
        setTimeout(() => setLoginStatus(''), 3000);
      }
    } catch (error: any) {
      console.error('Apple login error:', error);
      const message = error?.message || 'Apple Sign-In is not available on this platform';
      setLoginStatus(message);
      Alert.alert('Error', message);
      setTimeout(() => setLoginStatus(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const completeSignIn = async () => {
    if (!pendingAuthData) return;
    
    try {
      setIsLoading(true);
      setLoginStatus('Completing registration...');
      
      const result = await signIn(
        pendingAuthData.provider,
        pendingAuthData.providerId,
        pendingAuthData.email,
        pendingAuthData.name,
        selectedUserType,
        pendingAuthData.accessToken,
        pendingAuthData.idToken
      );
      
      setLoginStatus('Sign-in complete! Welcome!');
      
      setTimeout(() => {
        if (result.isNewUser) {
          router.replace('/profile-setup');
        } else {
          router.replace('/(tabs)/dashboard');
        }
      }, 1000);
    } catch (error: any) {
      console.error('Complete sign-in error:', error);
      const message = error?.message || 'Failed to complete sign-in';
      setLoginStatus(message);
      Alert.alert('Error', message);
      setTimeout(() => setLoginStatus(''), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  const getUserTypeInfo = (type: UserMode) => {
    switch (type) {
      case 'tenant':
        return {
          icon: Home,
          title: 'Tenant',
          description: 'Looking for a place to rent'
        };
      case 'landlord':
        return {
          icon: Key,
          title: 'Landlord',
          description: 'Renting out your property'
        };
      case 'roommate':
        return {
          icon: Users,
          title: 'Roommate',
          description: 'Looking for roommates'
        };
    }
  };

  if (showUserTypeSelection) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.safeArea}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.content}>
              <View style={styles.logoContainer}>
                <TenantLogo size={100} />
              </View>

              <Text style={styles.title}>Choose your role</Text>
              <Text style={styles.subtitle}>How do you want to use Tenant?</Text>

              {loginStatus ? (
                <Text style={styles.statusMessage}>{loginStatus}</Text>
              ) : null}

              <View style={styles.userTypeContainer}>
                {(['tenant', 'landlord', 'roommate'] as UserMode[]).map((type) => {
                  const info = getUserTypeInfo(type);
                  const IconComponent = info.icon;
                  const isSelected = selectedUserType === type;
                  
                  return (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.userTypeCard,
                        isSelected && styles.userTypeCardSelected
                      ]}
                      onPress={() => setSelectedUserType(type)}
                      disabled={isLoading}
                      accessibilityRole="radio"
                      accessibilityLabel={`${info.title}: ${info.description}`}
                      accessibilityState={{ 
                        selected: isSelected,
                        disabled: isLoading 
                      }}
                      accessibilityHint="Double tap to select this role"
                    >
                      <View style={[
                        styles.userTypeIcon,
                        isSelected && styles.userTypeIconSelected
                      ]}>
                        <IconComponent 
                          size={32} 
                          color={isSelected ? '#4A7FE5' : '#FFFFFF'} 
                          strokeWidth={2} 
                        />
                      </View>
                      <Text style={[
                        styles.userTypeTitle,
                        isSelected && styles.userTypeTitleSelected
                      ]}>
                        {info.title}
                      </Text>
                      <Text style={[
                        styles.userTypeDescription,
                        isSelected && styles.userTypeDescriptionSelected
                      ]}>
                        {info.description}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TouchableOpacity 
                style={[styles.continueButton, isLoading && styles.continueButtonDisabled]} 
                onPress={completeSignIn}
                disabled={isLoading}
                accessibilityRole="button"
                accessibilityLabel="Continue with selected role"
                accessibilityHint="Double tap to complete registration"
                accessibilityState={{ disabled: isLoading }}
              >
                <Text 
                  style={styles.continueButtonText}
                  maxFontSizeMultiplier={1.5}
                >
                  Continue
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.backButton} 
                onPress={() => {
                  setShowUserTypeSelection(false);
                  setPendingAuthData(null);
                  setLoginStatus('');
                }}
                disabled={isLoading}
              >
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            <View style={styles.logoContainer}>
              <TenantLogo size={120} />
            </View>

            <Text 
              style={styles.title}
              accessibilityRole="header"
              maxFontSizeMultiplier={1.5}
            >
              Welcome to Tenant
            </Text>
            <Text 
              style={styles.subtitle}
              maxFontSizeMultiplier={2.0}
            >
              Find your perfect rental match
            </Text>

            {loginStatus ? (
              <Text 
                style={styles.statusMessage}
                accessibilityLiveRegion="polite"
                accessibilityRole="alert"
                maxFontSizeMultiplier={2.0}
              >
                {loginStatus}
              </Text>
            ) : null}

            <Text style={styles.loginLabel}>Sign in to continue</Text>

            {isAppleSignInAvailable && (
              <AppleAuthentication.AppleAuthenticationButton
                buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE}
                cornerRadius={25}
                style={styles.appleButton}
                onPress={handleAppleLogin}
              />
            )}

            <TouchableOpacity 
              style={[styles.authButton, styles.googleButton]} 
              onPress={handleGoogleLogin}
              disabled={isLoading}
              accessibilityRole="button"
              accessibilityLabel="Sign in with Google"
              accessibilityHint="Double tap to sign in with your Google account"
              accessibilityState={{ disabled: isLoading }}
            >
              <View style={styles.googleIconContainer}>
                <Text style={styles.googleG}>G</Text>
              </View>
              <Text style={styles.googleButtonText}>Sign in with Google</Text>
            </TouchableOpacity>

            {!AuthService.isConfigured() && (
              <View style={styles.infoSection}>
                <Text style={styles.infoTitle}>⚙️ Setup Required</Text>
                <Text style={styles.infoText}>
                  To use Google Sign-In, you need to configure OAuth credentials.
                </Text>
                <Text style={styles.infoText}>
                  📖 See GOOGLE_OAUTH_SETUP.md for step-by-step instructions.
                </Text>
                <Text style={[styles.infoText, { marginTop: 8, fontWeight: '600' }]}>
                  Quick start:
                </Text>
                <Text style={styles.infoText}>
                  1. Create Google Cloud project
                </Text>
                <Text style={styles.infoText}>
                  2. Generate OAuth credentials
                </Text>
                <Text style={styles.infoText}>
                  3. Copy .env.example to .env
                </Text>
                <Text style={styles.infoText}>
                  4. Add your Client IDs to .env
                </Text>
                <Text style={styles.infoText}>
                  5. Restart Expo server
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4A7FE5',
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  logoContainer: {
    marginBottom: 40,
  },
  title: {
    fontSize: 38,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 40,
    opacity: 0.95,
    paddingHorizontal: 30,
    lineHeight: 24,
  },
  loginLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 20,
    opacity: 0.95,
  },
  authButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 50,
    width: '100%',
    maxWidth: 340,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    gap: 12,
    minHeight: 50,
  },
  appleButton: {
    width: '100%',
    maxWidth: 340,
    height: 50,
    marginBottom: 12,
  },
  googleButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#DADCE0',
  },
  googleButtonText: {
    color: '#3C4043',
    fontSize: 18,
    fontWeight: '600',
  },
  googleIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4285F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleG: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statusMessage: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
    opacity: 0.95,
    fontWeight: '500',
  },
  userTypeContainer: {
    width: '100%',
    maxWidth: 340,
    marginBottom: 30,
  },
  userTypeCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
  },
  userTypeCardSelected: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  userTypeIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  userTypeIconSelected: {
    backgroundColor: 'rgba(74, 127, 229, 0.1)',
  },
  userTypeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  userTypeTitleSelected: {
    color: '#4A7FE5',
  },
  userTypeDescription: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.9,
    lineHeight: 20,
  },
  userTypeDescriptionSelected: {
    color: '#666666',
    opacity: 1,
  },
  continueButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 50,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    marginBottom: 16,
    minHeight: 50,
  },
  continueButtonDisabled: {
    opacity: 0.6,
  },
  continueButtonText: {
    color: '#4A7FE5',
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    opacity: 0.8,
  },
  infoSection: {
    marginTop: 30,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    width: '100%',
    maxWidth: 340,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    lineHeight: 20,
    marginBottom: 8,
  },
});
