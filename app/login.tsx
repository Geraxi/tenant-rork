import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, useWindowDimensions, Platform, Alert, ActivityIndicator } from 'react-native';
import { Stack, router } from 'expo-router';
import { Apple } from 'lucide-react-native';
import TenantLogo from '@/components/TenantLogo';
import { useAuth } from '@/store/auth-store';
import { AuthService, useGoogleAuth } from '@/services/auth';
import { trpcClient } from '@/lib/trpc';
import type { AuthSessionResult } from 'expo-auth-session';

export default function LoginScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [appleAvailable, setAppleAvailable] = useState(false);
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const { signIn } = useAuth();
  const { response: googleResponse, promptAsync: promptGoogleAsync } = useGoogleAuth();

  useEffect(() => {
    checkAppleAvailability();
  }, []);

  const checkAppleAvailability = async () => {
    const available = await AuthService.isAppleSignInAvailable();
    setAppleAvailable(available);
  };

  const handleGoogleSuccess = useCallback(async () => {
    try {
      const response = googleResponse as AuthSessionResult & {
        authentication?: { accessToken: string };
      };

      if (!response?.authentication?.accessToken) {
        throw new Error('No access token received');
      }

      const userInfo = await AuthService.getUserInfoFromGoogle(
        response.authentication.accessToken
      );

      console.log('Google user info:', userInfo);

      const result = await trpcClient.auth.signin.mutate({
        provider: 'google',
        accessToken: userInfo.accessToken,
        email: userInfo.email,
        name: userInfo.name,
        providerId: userInfo.id,
        userMode: 'tenant',
      });

      if (result.success && result.user) {
        await signIn(result.user, result.token);
        
        if (result.isNewUser || !result.user.profile_completed) {
          router.replace('/profile-setup');
        } else {
          router.replace('/(tabs)/browse');
        }
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      Alert.alert('Errore', 'Impossibile completare l\'autenticazione. Riprova.');
    } finally {
      setIsLoading(false);
    }
  }, [googleResponse, signIn]);

  useEffect(() => {
    if (googleResponse?.type === 'success') {
      handleGoogleSuccess();
    } else if (googleResponse?.type === 'error') {
      setIsLoading(false);
      Alert.alert('Errore', 'Autenticazione Google fallita. Riprova.');
    }
  }, [googleResponse, handleGoogleSuccess]);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      await promptGoogleAsync();
    } catch (error) {
      console.error('Google sign-in error:', error);
      setIsLoading(false);
      Alert.alert('Errore', 'Impossibile avviare l\'autenticazione Google.');
    }
  };

  const handleAppleSignIn = async () => {
    try {
      setIsLoading(true);
      const userInfo = await AuthService.signInWithApple();
      
      if (!userInfo) {
        setIsLoading(false);
        return;
      }

      console.log('Apple user info:', userInfo);

      const result = await trpcClient.auth.signin.mutate({
        provider: 'apple',
        idToken: userInfo.idToken,
        email: userInfo.email,
        name: userInfo.name,
        providerId: userInfo.id,
        userMode: 'tenant',
      });

      if (result.success && result.user) {
        await signIn(result.user, result.token);
        
        if (result.isNewUser || !result.user.profile_completed) {
          router.replace('/profile-setup');
        } else {
          router.replace('/(tabs)/browse');
        }
      }
    } catch (error: any) {
      console.error('Apple sign-in error:', error);
      if (error.message !== 'Apple Sign-In is only available on iOS') {
        Alert.alert('Errore', 'Impossibile completare l\'autenticazione Apple.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={[styles.content, isDesktop && styles.contentDesktop]}>
            <View style={[styles.card, isDesktop && styles.cardDesktop]}>
              <View style={styles.logoContainer}>
                <TenantLogo size={isDesktop ? 140 : 120} />
              </View>

              <Text style={[styles.title, isDesktop && styles.titleDesktop]}>Benvenuto su Tenant</Text>
              <Text style={[styles.subtitle, isDesktop && styles.subtitleDesktop]}>
                Trova la tua corrispondenza perfetta nel mercato degli affitti
              </Text>

              <Text style={styles.sectionLabel}>Accedi con:</Text>

              <TouchableOpacity 
                style={styles.googleButton} 
                onPress={handleGoogleSignIn}
                disabled={isLoading}
                accessibilityRole="button"
                accessibilityLabel="Accedi con Google Account"
              >
                {isLoading ? (
                  <ActivityIndicator color="#3C4043" />
                ) : (
                  <>
                    <View style={styles.googleIconContainer}>
                      <Text style={styles.googleG}>G</Text>
                    </View>
                    <Text style={styles.googleButtonText}>Accedi con Google</Text>
                  </>
                )}
              </TouchableOpacity>

              {appleAvailable && Platform.OS === 'ios' && (
                <TouchableOpacity 
                  style={styles.appleButton} 
                  onPress={handleAppleSignIn}
                  disabled={isLoading}
                  accessibilityRole="button"
                  accessibilityLabel="Accedi con Apple"
                >
                  {isLoading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <>
                      <Apple size={24} color="#FFFFFF" strokeWidth={2} />
                      <Text style={styles.appleButtonText}>Accedi con Apple</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#6B8FE8',
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
    paddingHorizontal: 32,
    paddingVertical: 40,
  },
  contentDesktop: {
    paddingHorizontal: 64,
  },
  card: {
    width: '100%',
    alignItems: 'center',
  },
  cardDesktop: {
    maxWidth: 520,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 32,
    paddingHorizontal: 48,
    paddingVertical: 64,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  logoContainer: {
    marginBottom: 48,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold' as const,
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  titleDesktop: {
    fontSize: 42,
  },
  subtitle: {
    fontSize: 17,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 60,
    opacity: 0.95,
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  subtitleDesktop: {
    fontSize: 19,
    lineHeight: 28,
  },
  sectionLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 16,
    marginTop: 8,
    opacity: 0.95,
    alignSelf: 'flex-start',
    width: '100%',
    maxWidth: 420,
  },
  googleButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 50,
    width: '100%',
    maxWidth: 420,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    gap: 12,
    minHeight: 56,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  googleButtonText: {
    color: '#3C4043',
    fontSize: 17,
    fontWeight: '600' as const,
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
    fontWeight: 'bold' as const,
    color: '#FFFFFF',
  },
  appleButton: {
    backgroundColor: '#000000',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 50,
    width: '100%',
    maxWidth: 420,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    gap: 12,
    minHeight: 56,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  appleButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600' as const,
  },
});
