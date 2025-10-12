import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions, Alert, ActivityIndicator, TextInput } from 'react-native';
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
    checkBackendHealth();
  }, []);

  const checkBackendHealth = async () => {
    try {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      const healthUrl = `${baseUrl}/api`;
      console.log('Checking backend health at:', healthUrl);
      
      const response = await fetch(healthUrl);
      console.log('Backend health check response:', response.status, response.ok);
      
      if (response.ok) {
        try {
          const data = await response.json();
          console.log('Backend health check data:', data);
        } catch (jsonError) {
          console.warn('Backend responded but could not parse JSON:', jsonError);
        }
      } else {
        console.warn('Backend health check failed:', response.status);
      }
    } catch (error) {
      console.error('Backend health check error:', error);
    }
  };

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
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      
      let errorMessage = 'Impossibile completare l\'autenticazione Google.';
      if (error?.message?.includes('404') || error?.message?.includes('Not found')) {
        errorMessage = 'Backend non disponibile. Verifica che il server sia in esecuzione.';
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Errore', errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [googleResponse, signIn]);

  useEffect(() => {
    if (googleResponse?.type === 'success') {
      handleGoogleSuccess();
    } else if (googleResponse?.type === 'error') {
      setIsLoading(false);
      const errorMsg = typeof googleResponse.error === 'string' 
        ? googleResponse.error 
        : 'Autenticazione Google fallita. Riprova.';
      Alert.alert('Errore', errorMsg);
    } else if (googleResponse?.type === 'cancel') {
      setIsLoading(false);
      console.log('Google auth cancelled by user');
    }
  }, [googleResponse, handleGoogleSuccess]);

  const handleGoogleSignIn = async () => {
    console.log('🎯 handleGoogleSignIn called');
    
    if (!AuthService.isConfigured()) {
      console.log('⚠️ Google OAuth not configured');
      Alert.alert(
        '⚙️ Configurazione Richiesta',
        'Google OAuth non è ancora configurato.\n\n' +
        'Per abilitare l\'accesso con Google:\n\n' +
        '1. Apri il file .env nella root del progetto\n' +
        '2. Segui le istruzioni per ottenere le credenziali Google\n' +
        '3. Sostituisci i valori placeholder\n' +
        '4. Riavvia il server\n\n' +
        'Vedi GOOGLE_OAUTH_CONFIGURATION.md per la guida completa.\n\n' +
        'Nel frattempo, puoi usare l\'autenticazione email.',
        [
          { text: 'Usa Email', onPress: () => setShowEmailAuth(true) },
          { text: 'OK', style: 'cancel' }
        ]
      );
      return;
    }

    try {
      setIsLoading(true);
      console.log('🚀 Initiating Google sign-in...');
      console.log('📱 User agent:', navigator.userAgent);
      console.log('🌐 Window location:', window.location.href);
      
      promptGoogleAsync();
      console.log('✅ promptGoogleAsync called');
    } catch (error: any) {
      console.error('❌ Google sign-in error:', error);
      console.error('📋 Error details:', {
        message: error?.message,
        stack: error?.stack,
        name: error?.name
      });
      setIsLoading(false);
      
      let errorMessage = 'Impossibile avviare l\'autenticazione Google.';
      let errorDetails = '';
      
      if (error?.message?.includes('not configured')) {
        errorMessage = 'Google OAuth non è configurato correttamente.';
        errorDetails = 'Verifica il file .env e riavvia il server.';
      } else if (error?.message?.includes('Popup blocked') || error?.message?.includes('popup')) {
        errorMessage = 'Il popup è stato bloccato dal browser.';
        errorDetails = 'Abilita i popup per questo sito:\n\n' +
          '1. Clicca sull\'icona del lucchetto/popup nella barra degli indirizzi\n' +
          '2. Consenti i popup per questo sito\n' +
          '3. Ricarica la pagina e riprova';
      } else {
        errorDetails = error?.message || 'Errore sconosciuto';
      }
      
      Alert.alert(
        'Errore Google Sign-In',
        errorMessage + (errorDetails ? '\n\n' + errorDetails : ''),
        [
          { text: 'Usa Email', onPress: () => setShowEmailAuth(true) },
          { text: 'Riprova', style: 'cancel' }
        ]
      );
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
      Alert.alert(
        'Errore Apple Sign-In', 
        'Al momento Apple Sign-In richiede una configurazione aggiuntiva. Per favore usa Google o l\'autenticazione email.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async () => {
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const trimmedName = name.trim();

    if (!trimmedEmail || !trimmedPassword) {
      Alert.alert('Errore', 'Inserisci email e password');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      Alert.alert('Errore', 'Inserisci un indirizzo email valido');
      return;
    }

    if (isSignUp && !trimmedName) {
      Alert.alert('Errore', 'Inserisci il tuo nome per registrarti');
      return;
    }

    setIsLoading(true);
    console.log('Attempting email auth with:', { email: trimmedEmail, isSignUp, hasName: !!trimmedName });

    try {
      const result = await trpcClient.auth.signin.mutate({
        provider: 'email',
        email: trimmedEmail,
        password: trimmedPassword,
        name: isSignUp ? trimmedName : undefined,
        userMode: 'tenant',
      });

      console.log('Auth result:', result);

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
      console.error('Error details:', {
        message: error?.message,
        data: error?.data,
        shape: error?.shape,
        cause: error?.cause,
      });
      
      let errorMessage = 'Impossibile completare l\'autenticazione.';
      let errorDetails = '';
      
      if (error?.message?.includes('404') || error?.message?.includes('Not found') || error?.message?.includes('Not Found')) {
        errorMessage = 'Backend non disponibile';
        errorDetails = 'Il server backend non risponde. Questo può accadere se:\n\n' +
          '1. Il server non è stato avviato\n' +
          '2. La configurazione del backend non è corretta\n' +
          '3. Problemi di rete\n\n' +
          'Verifica i log del server per maggiori dettagli.';
      } else if (error?.message?.includes('JSON Parse error') || error?.message?.includes('Unexpected character')) {
        errorMessage = 'Errore di comunicazione con il server';
        errorDetails = 'Il server ha restituito una risposta non valida. Verifica che il backend sia configurato correttamente.';
      } else if (error?.message?.includes('Network request failed') || error?.message?.includes('Failed to fetch')) {
        errorMessage = 'Errore di rete';
        errorDetails = 'Impossibile connettersi al server. Verifica la connessione internet e che il server sia in esecuzione.';
      } else if (error?.message) {
        if (error.message.includes('Invalid email') || error.message.includes('invalid_format')) {
          errorMessage = 'Indirizzo email non valido';
        } else if (error.message.includes('Password')) {
          errorMessage = 'Password non valida';
        } else if (error.message.includes('Nome richiesto')) {
          Alert.alert(
            'Account non trovato', 
            'Questa email non è registrata. Vuoi creare un nuovo account?',
            [
              { 
                text: 'Sì, registrati', 
                onPress: () => setIsSignUp(true)
              },
              { 
                text: 'Annulla', 
                style: 'cancel' 
              }
            ]
          );
          setIsLoading(false);
          return;
        } else {
          errorMessage = error.message;
        }
      }
      
      Alert.alert(
        'Errore', 
        errorMessage + (errorDetails ? '\n\n' + errorDetails : '')
      );
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.content, isDesktop && styles.contentDesktop]}>
        <View style={[styles.card, isDesktop && styles.cardDesktop]}>
          <View style={styles.logoContainer}>
            <TenantLogo size={isDesktop ? 100 : 70} />
          </View>

          <Text style={[styles.title, isDesktop && styles.titleDesktop]}>Benvenuto su Tenant</Text>
          <Text style={[styles.subtitle, isDesktop && styles.subtitleDesktop]}>
            Trova la tua corrispondenza perfetta
          </Text>

          {!showEmailAuth ? (
            <>
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

              {appleAvailable && (
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
                      <Apple size={20} color="#FFFFFF" strokeWidth={2} />
                      <Text style={styles.appleButtonText}>Accedi con Apple</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}

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
                <Mail size={20} color="#6B8FE8" strokeWidth={2} />
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
                <User size={20} color="#FFFFFF" strokeWidth={2} />
                <Text style={styles.signUpButtonText}>Registrati</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              {isSignUp && (
                <View style={styles.inputContainer}>
                  <User size={18} color="#6B8FE8" strokeWidth={2} />
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
                <Mail size={18} color="#6B8FE8" strokeWidth={2} />
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
                <Lock size={18} color="#6B8FE8" strokeWidth={2} />
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#6B8FE8',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  contentDesktop: {
    paddingHorizontal: 64,
  },
  card: {
    width: '100%',
    alignItems: 'center',
  },
  cardDesktop: {
    maxWidth: 480,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 24,
    paddingHorizontal: 40,
    paddingVertical: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  logoContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold' as const,
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  titleDesktop: {
    fontSize: 36,
  },
  subtitle: {
    fontSize: 15,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 32,
    opacity: 0.95,
    paddingHorizontal: 16,
    lineHeight: 20,
  },
  subtitleDesktop: {
    fontSize: 17,
    lineHeight: 24,
  },
  googleButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 50,
    width: '100%',
    maxWidth: 380,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    gap: 10,
    minHeight: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  googleButtonText: {
    color: '#3C4043',
    fontSize: 15,
    fontWeight: '600' as const,
  },
  googleIconContainer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4285F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleG: {
    fontSize: 14,
    fontWeight: 'bold' as const,
    color: '#FFFFFF',
  },
  appleButton: {
    backgroundColor: '#000000',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 50,
    width: '100%',
    maxWidth: 380,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    gap: 10,
    minHeight: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  appleButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600' as const,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    maxWidth: 380,
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  dividerText: {
    color: '#FFFFFF',
    fontSize: 13,
    opacity: 0.8,
    marginHorizontal: 12,
  },
  emailButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 50,
    width: '100%',
    maxWidth: 380,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    minHeight: 48,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  signUpButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 50,
    width: '100%',
    maxWidth: 380,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    minHeight: 48,
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
    fontSize: 15,
    fontWeight: '600' as const,
  },
  emailButtonText: {
    color: '#6B8FE8',
    fontSize: 15,
    fontWeight: '600' as const,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 50,
    paddingHorizontal: 16,
    paddingVertical: 4,
    width: '100%',
    maxWidth: 380,
    marginBottom: 10,
    gap: 10,
    minHeight: 48,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 15,
    paddingVertical: 10,
  },
  primaryButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 50,
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    marginBottom: 16,
    minHeight: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButtonText: {
    color: '#6B8FE8',
    fontSize: 15,
    fontWeight: '700' as const,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 12,
  },
  switchText: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.9,
  },
  switchLink: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700' as const,
    textDecorationLine: 'underline',
  },
  backButton: {
    paddingVertical: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.9,
  },
});
