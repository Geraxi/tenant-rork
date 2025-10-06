import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { Stack, router } from 'expo-router';
import { User, Home, Users, Key } from 'lucide-react-native';
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
  const [pendingAuthData, setPendingAuthData] = useState<{email: string, name: string} | null>(null);
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
        setLoginStatus('Recupero informazioni account Google...');
        
        const { authentication } = googleResponse;
        if (authentication?.accessToken) {
          const user = await AuthService.getUserInfoFromGoogle(authentication.accessToken);
          
          setLoginStatus('Seleziona il tuo ruolo');
          setPendingAuthData({ email: user.email, name: user.name });
          setShowUserTypeSelection(true);
        }
      } catch (error) {
        console.error('Google user info error:', error);
        setLoginStatus('Errore nel recupero delle informazioni');
        setTimeout(() => setLoginStatus(''), 3000);
      } finally {
        setIsLoading(false);
      }
    } else if (googleResponse?.type === 'cancel') {
      setLoginStatus('Accesso annullato');
      setTimeout(() => setLoginStatus(''), 3000);
    } else if (googleResponse?.type === 'error') {
      console.error('Google auth error:', googleResponse.error);
      setLoginStatus('Errore durante l\'autenticazione');
      setTimeout(() => setLoginStatus(''), 3000);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      setLoginStatus('Apertura Google Sign-In...');
      
      await googlePromptAsync();
    } catch (error) {
      console.error('Google login error:', error);
      setLoginStatus('Errore durante l\'apertura di Google Sign-In');
      setTimeout(() => setLoginStatus(''), 3000);
      setIsLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    try {
      setIsLoading(true);
      setLoginStatus('Connessione con Apple in corso...');
      
      const user = await AuthService.signInWithApple();
      
      if (user) {
        setLoginStatus('Seleziona il tuo ruolo');
        setPendingAuthData({ email: user.email, name: user.name });
        setShowUserTypeSelection(true);
      } else {
        setLoginStatus('Accesso annullato dall\'utente');
        setTimeout(() => setLoginStatus(''), 3000);
      }
    } catch (error) {
      console.error('Apple login error:', error);
      setLoginStatus('Apple Sign-In non disponibile su questa piattaforma');
      setTimeout(() => setLoginStatus(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExistingAccount = async () => {
    try {
      setIsLoading(true);
      setLoginStatus('Seleziona il tuo ruolo');
      
      setPendingAuthData({ email: 'user@example.com', name: 'Marco Rossi' });
      setShowUserTypeSelection(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAccount = async () => {
    try {
      setIsLoading(true);
      setLoginStatus('Seleziona il tuo ruolo');
      
      setPendingAuthData({ email: 'newuser@example.com', name: 'Nuovo Utente' });
      setShowUserTypeSelection(true);
    } finally {
      setIsLoading(false);
    }
  };

  const completeSignIn = async () => {
    if (!pendingAuthData) return;
    
    try {
      setIsLoading(true);
      setLoginStatus('Completamento registrazione...');
      
      await signIn(pendingAuthData.email, pendingAuthData.name, selectedUserType);
      setLoginStatus('Accesso completato! Benvenuto!');
      
      setTimeout(() => {
        // Check if profile is completed, if not redirect to profile setup
        if (pendingAuthData && selectedUserType) {
          router.replace('/profile-setup');
        } else {
          router.replace('/(tabs)/dashboard');
        }
      }, 1000);
    } finally {
      setIsLoading(false);
    }
  };

  const getUserTypeInfo = (type: UserMode) => {
    switch (type) {
      case 'tenant':
        return {
          icon: Home,
          title: 'Inquilino',
          description: 'Cerco una casa in affitto - Vedrò annunci di proprietari'
        };
      case 'landlord':
        return {
          icon: Key,
          title: 'Proprietario',
          description: 'Affitto la mia proprietà - Vedrò profili di inquilini'
        };
      case 'roommate':
        return {
          icon: Users,
          title: 'Coinquilino',
          description: 'Cerco coinquilini - Vedrò altri che cercano coinquilini'
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
              {/* Logo */}
              <View style={styles.logoContainer}>
                <TenantLogo size={100} />
              </View>

              {/* Title */}
              <Text style={styles.title}>Seleziona il tuo ruolo</Text>
              <Text style={styles.subtitle}>Come vuoi utilizzare Tenant?</Text>

              {/* Status Message */}
              {loginStatus ? (
                <Text style={styles.statusMessage}>{loginStatus}</Text>
              ) : null}

              {/* User Type Selection */}
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

              {/* Continue Button */}
              <TouchableOpacity 
                style={[styles.continueButton, isLoading && styles.continueButtonDisabled]} 
                onPress={completeSignIn}
                disabled={isLoading}
              >
                <Text style={styles.continueButtonText}>Continua</Text>
              </TouchableOpacity>

              {/* Back Button */}
              <TouchableOpacity 
                style={styles.backButton} 
                onPress={() => {
                  setShowUserTypeSelection(false);
                  setPendingAuthData(null);
                  setLoginStatus('');
                }}
                disabled={isLoading}
              >
                <Text style={styles.backButtonText}>Indietro</Text>
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
            {/* Logo */}
            <View style={styles.logoContainer}>
              <TenantLogo size={120} />
            </View>

            {/* Title */}
            <Text style={styles.title}>Benvenuto su Tenant</Text>
            <Text style={styles.subtitle}>Trova la tua corrispondenza perfetta nel mercato degli affitti</Text>

            {/* Status Message */}
            {loginStatus ? (
              <Text style={styles.statusMessage}>{loginStatus}</Text>
            ) : null}

            {/* Login Options */}
            <Text style={styles.loginLabel}>Accedi con:</Text>

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
            >
              <View style={styles.googleIconContainer}>
                <Text style={styles.googleG}>G</Text>
              </View>
              <Text style={styles.googleButtonText}>Accedi con Google Account</Text>
            </TouchableOpacity>

            {/* Existing Account */}
            <Text style={styles.sectionLabel}>Hai già un account?</Text>

            <TouchableOpacity 
              style={styles.authButton} 
              onPress={handleExistingAccount}
              disabled={isLoading}
            >
              <User size={20} color="#FFFFFF" strokeWidth={2} />
              <Text style={styles.buttonText}>Accedi al tuo account</Text>
            </TouchableOpacity>

            {/* Create Account */}
            <Text style={styles.sectionLabel}>Oppure registrati:</Text>

            <TouchableOpacity 
              style={styles.authButton} 
              onPress={handleCreateAccount}
              disabled={isLoading}
            >
              <User size={20} color="#FFFFFF" strokeWidth={2} />
              <Text style={styles.buttonText}>Crea un nuovo account</Text>
            </TouchableOpacity>
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
  sectionLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    marginTop: 24,
    marginBottom: 16,
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
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
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
  // User Type Selection Styles
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
});