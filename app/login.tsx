import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, useWindowDimensions } from 'react-native';
import { Stack, router } from 'expo-router';
import { UserCircle } from 'lucide-react-native';
import TenantLogo from '@/components/TenantLogo';

export default function LoginScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const handleGoogleSignIn = () => {
    setIsLoading(true);
    setTimeout(() => {
      router.replace('/profile-setup');
    }, 500);
  };

  const handleExistingAccount = () => {
    setIsLoading(true);
    setTimeout(() => {
      router.replace('/profile-setup');
    }, 500);
  };

  const handleCreateAccount = () => {
    setIsLoading(true);
    setTimeout(() => {
      router.replace('/profile-setup');
    }, 500);
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
                <View style={styles.googleIconContainer}>
                  <Text style={styles.googleG}>G</Text>
                </View>
                <Text style={styles.googleButtonText}>Accedi con Google Account</Text>
              </TouchableOpacity>

              <Text style={styles.sectionLabel}>Hai già un account?</Text>

              <TouchableOpacity 
                style={styles.secondaryButton} 
                onPress={handleExistingAccount}
                disabled={isLoading}
                accessibilityRole="button"
                accessibilityLabel="Accedi al tuo account"
              >
                <UserCircle size={24} color="#FFFFFF" strokeWidth={2} />
                <Text style={styles.secondaryButtonText}>Accedi al tuo account</Text>
              </TouchableOpacity>

              <Text style={styles.sectionLabel}>Oppure registrati:</Text>

              <TouchableOpacity 
                style={styles.secondaryButton} 
                onPress={handleCreateAccount}
                disabled={isLoading}
                accessibilityRole="button"
                accessibilityLabel="Crea un nuovo account"
              >
                <UserCircle size={24} color="#FFFFFF" strokeWidth={2} />
                <Text style={styles.secondaryButtonText}>Crea un nuovo account</Text>
              </TouchableOpacity>
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
    fontWeight: 'bold',
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
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
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
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
});
