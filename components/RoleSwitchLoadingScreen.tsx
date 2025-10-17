import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

interface RoleSwitchLoadingScreenProps {
  newRole: 'tenant' | 'landlord';
  onTimeout?: () => void;
}

export default function RoleSwitchLoadingScreen({ newRole, onTimeout }: RoleSwitchLoadingScreenProps) {
  const [showTimeout, setShowTimeout] = useState(false);
  const [dots, setDots] = useState('');
  
  const roleText = newRole === 'tenant' ? 'Inquilino' : 'Proprietario';

  useEffect(() => {
    // Show timeout message after 3 seconds
    const timeout = setTimeout(() => {
      setShowTimeout(true);
    }, 3000);

    // Animate dots
    const dotsInterval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);

    return () => {
      clearTimeout(timeout);
      clearInterval(dotsInterval);
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>🏠</Text>
        </View>
        
        <Text style={styles.title}>Cambio Account</Text>
        <Text style={styles.subtitle}>
          Stai passando a {roleText}
        </Text>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>
            Ricaricamento dell'app{dots}
          </Text>
        </View>
        
        {showTimeout && (
          <View style={styles.timeoutContainer}>
            <Text style={styles.timeoutText}>
              Il caricamento sta impiegando più tempo del previsto
            </Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={onTimeout}
            >
              <MaterialIcons name="refresh" size={20} color="white" />
              <Text style={styles.retryButtonText}>Riprova</Text>
            </TouchableOpacity>
          </View>
        )}
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            L'app si ricaricherà automaticamente
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  logoContainer: {
    marginBottom: 32,
  },
  logo: {
    fontSize: 64,
    textAlign: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 48,
  },
  loadingContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  timeoutContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  timeoutText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
