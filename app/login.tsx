import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, useWindowDimensions, Alert, ActivityIndicator, TextInput } from 'react-native';
import { Stack, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Apple, Mail, Lock, User } from 'lucide-react-native';
import TenantLogo from '@/components/TenantLogo';
import { useAuth } from '@/store/auth-store';
import { AuthService, useGoogleAuth } from '@/services/auth';
import { trpcClient } from '@/lib/trpc';
import type { AuthSessionResult } from 'expo-auth-session';

export default function LoginScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [appleAvailable, setAppleAvailable] = useState(false);
  const [showEmailAuth, setShowEmailAuth] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const { signIn } = useAuth();
  const insets = useSafeAreaInsets();
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

  const handleEmailAuth = async () => {
    try {
      if (!email || !password) {
        Alert.alert('Errore', 'Inserisci email e password');
        return;
      }

      if (isSignUp && !name) {
        Alert.alert('Errore', 'Inserisci il tuo nome');
        return;
      }

      setIsLoading(true);

      const result = await trpcClient.auth.signin.mutate({
        provider: 'email',
        email,
        password,
        name: isSignUp ? name : undefined,
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
      console.error('Email auth error:', error);
      Alert.alert('Errore', error.message || 'Impossibile completare l\'autenticazione.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <Stack.Screen options={{ headerShown: false }} />
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

              {!showEmailAuth ? (
                <>
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

                  <View style={styles.divider}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>oppure</Text>
                    <View style={styles.dividerLine} />
                  </View>

                  <TouchableOpacity 
                    style={styles.emailButton} 
                    onPress={() => {
                      setShowEmailAuth(true);
                      setIsSignUp(false);
                    }}
                    disabled={isLoading}
                    accessibilityRole="button"
                    accessibilityLabel="Accedi al tuo account"
                  >
                    <Mail size={24} color="#6B8FE8" strokeWidth={2} />
                    <Text style={styles.emailButtonText}>Accedi al tuo account</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.signUpButton} 
                    onPress={() => {
                      setShowEmailAuth(true);
                      setIsSignUp(true);
                    }}
                    disabled={isLoading}
                    accessibilityRole="button"
                    accessibilityLabel="Registrati"
                  >
                    <User size={24} color="#FFFFFF" strokeWidth={2} />
                    <Text style={styles.signUpButtonText}>Registrati</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={styles.sectionLabel}>{isSignUp ? 'Crea Account' : 'Accedi'}</Text>

                  {isSignUp && (
                    <View style={styles.inputContainer}>
                      <User size={20} color="#6B8FE8" strokeWidth={2} />
                      <TextInput
                        style={styles.input}
                        placeholder="Nome completo"
                        placeholderTextColor="rgba(255, 255, 255, 0.6)"
                        value={name}
                        onChangeText={setName}
                        autoCapitalize="words"
                        editable={!isLoading}
                      />
                    </View>
                  )}

                  <View style={styles.inputContainer}>
                    <Mail size={20} color="#6B8FE8" strokeWidth={2} />
                    <TextInput
                      style={styles.input}
                      placeholder="Email"
                      placeholderTextColor="rgba(255, 255, 255, 0.6)"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoComplete="email"
                      editable={!isLoading}
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Lock size={20} color="#6B8FE8" strokeWidth={2} />
                    <TextInput
                      style={styles.input}
                      placeholder="Password"
                      placeholderTextColor="rgba(255, 255, 255, 0.6)"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry
                      autoCapitalize="none"
                      autoComplete="password"
                      editable={!isLoading}
                    />
                  </View>

                  <TouchableOpacity 
                    style={styles.primaryButton} 
                    onPress={handleEmailAuth}
                    disabled={isLoading}
                    accessibilityRole="button"
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#6B8FE8" />
                    ) : (
                      <Text style={styles.primaryButtonText}>
                        {isSignUp ? 'Registrati' : 'Accedi'}
                      </Text>
                    )}
                  </TouchableOpacity>

                  <View style={styles.switchContainer}>
                    <Text style={styles.switchText}>
                      {isSignUp ? 'Hai già un account?' : 'Non hai un account?'}
                    </Text>
                    <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)} disabled={isLoading}>
                      <Text style={styles.switchLink}>
                        {isSignUp ? 'Accedi' : 'Registrati'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity 
                    style={styles.backButton} 
                    onPress={() => setShowEmailAuth(false)}
                    disabled={isLoading}
                  >
                    <Text style={styles.backButtonText}>← Torna indietro</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#6B8FE8',
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
    marginBottom: 16,
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
    marginBottom: 16,
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
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    maxWidth: 420,
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  dividerText: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.8,
    marginHorizontal: 16,
  },
  emailButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 50,
    width: '100%',
    maxWidth: 420,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    minHeight: 56,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  signUpButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 50,
    width: '100%',
    maxWidth: 420,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    minHeight: 56,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  signUpButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600' as const,
  },
  emailButtonText: {
    color: '#6B8FE8',
    fontSize: 17,
    fontWeight: '600' as const,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 50,
    paddingHorizontal: 20,
    paddingVertical: 4,
    width: '100%',
    maxWidth: 420,
    marginBottom: 16,
    gap: 12,
    minHeight: 56,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    paddingVertical: 12,
  },
  primaryButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 50,
    width: '100%',
    maxWidth: 420,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 24,
    minHeight: 56,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButtonText: {
    color: '#6B8FE8',
    fontSize: 17,
    fontWeight: '700' as const,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  switchText: {
    color: '#FFFFFF',
    fontSize: 15,
    opacity: 0.9,
  },
  switchLink: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700' as const,
    textDecorationLine: 'underline',
  },
  backButton: {
    paddingVertical: 12,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    opacity: 0.9,
  },
});
