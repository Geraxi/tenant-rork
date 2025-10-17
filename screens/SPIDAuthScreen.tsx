import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Dimensions
} from 'react-native';
import Logo from '../components/Logo';
import { SPID_PROVIDERS, authenticateWithSPID, initializeSPIDAuth } from '../utils/spidAuth';

const { width } = Dimensions.get('window');

interface SPIDAuthScreenProps {
  onAuthSuccess: (user: any) => void;
  onBack: () => void;
  purpose: 'contract' | 'general';
}

export const SPIDAuthScreen: React.FC<SPIDAuthScreenProps> = ({
  onAuthSuccess,
  onBack,
  purpose
}) => {
  const [loading, setLoading] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);

  useEffect(() => {
    initializeSPIDAuth();
  }, []);

  const handleProviderSelect = async (providerId: string) => {
    setSelectedProvider(providerId);
    setLoading(true);

    try {
      const result = await authenticateWithSPID(providerId);
      
      if (result.success && result.user) {
        onAuthSuccess(result.user);
      } else {
        Alert.alert(
          'Errore Autenticazione',
          result.error || 'Errore durante l\'autenticazione SPID',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Errore',
        'Si è verificato un errore durante l\'autenticazione',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
      setSelectedProvider(null);
    }
  };

  const getPurposeText = () => {
    if (purpose === 'contract') {
      return {
        title: 'Autenticazione SPID Richiesta',
        subtitle: 'Per pubblicare il contratto di affitto all\'Agenzia delle Entrate, è necessario autenticarsi con SPID',
        description: 'SPID (Sistema Pubblico di Identità Digitale) è il sistema di identità digitale della Pubblica Amministrazione italiana.'
      };
    }
    return {
      title: 'Accedi con SPID',
      subtitle: 'Scegli il tuo provider SPID per accedere',
      description: 'SPID ti permette di accedere ai servizi della Pubblica Amministrazione in modo sicuro e semplice.'
    };
  };

  const purposeText = getPurposeText();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Indietro</Text>
          </TouchableOpacity>
          <Logo size="medium" showBackground={false} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.title}>{purposeText.title}</Text>
          <Text style={styles.subtitle}>{purposeText.subtitle}</Text>
          <Text style={styles.description}>{purposeText.description}</Text>

          {/* SPID Providers */}
          <View style={styles.providersContainer}>
            <Text style={styles.providersTitle}>Seleziona il tuo provider SPID:</Text>
            
            {SPID_PROVIDERS.map((provider) => (
              <TouchableOpacity
                key={provider.id}
                style={[
                  styles.providerButton,
                  selectedProvider === provider.id && styles.providerButtonSelected
                ]}
                onPress={() => handleProviderSelect(provider.id)}
                disabled={loading}
              >
                <View style={styles.providerContent}>
                  <View style={styles.providerLogoContainer}>
                    <Text style={styles.providerLogoText}>
                      {provider.name.charAt(0)}
                    </Text>
                  </View>
                  <Text style={styles.providerName}>{provider.name}</Text>
                  {selectedProvider === provider.id && loading && (
                    <ActivityIndicator size="small" color="#2196F3" />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Info Section */}
          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>Cos'è SPID?</Text>
            <Text style={styles.infoText}>
              SPID è il sistema unico di accesso con identità digitale ai servizi online della Pubblica Amministrazione e dei privati aderenti.
            </Text>
            <Text style={styles.infoText}>
              Se non hai ancora SPID, puoi richiederlo gratuitamente presso uno dei provider autorizzati.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#2196F3',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 15,
    lineHeight: 24,
  },
  description: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  providersContainer: {
    marginBottom: 30,
  },
  providersTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  providerButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  providerButtonSelected: {
    borderColor: '#2196F3',
    backgroundColor: '#f0f8ff',
  },
  providerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  providerLogoContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  providerLogoText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  providerName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
  infoSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
});
