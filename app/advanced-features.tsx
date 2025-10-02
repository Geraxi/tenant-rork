import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { Shield, FileText, Eye, CheckCircle, ArrowRight } from 'lucide-react-native';
import VirtualTourViewer from '@/components/VirtualTourViewer';
import BackgroundCheckForm from '@/components/BackgroundCheckForm';
import ContractRegistration from '@/components/ContractRegistration';
import { useUser } from '@/store/user-store';

type FeatureType = 'overview' | 'virtual-tours' | 'background-check' | 'contract-registration' | 'verification';

export default function AdvancedFeaturesScreen() {
  const [activeFeature, setActiveFeature] = useState<FeatureType>('overview');
  const { user } = useUser();

  const features = [
    {
      id: 'virtual-tours' as FeatureType,
      title: 'Tour Virtuali 360°',
      description: 'Aggiungi tour virtuali immersivi alle tue proprietà',
      icon: Eye,
      color: '#007AFF',
      available: true,
    },
    {
      id: 'background-check' as FeatureType,
      title: 'Background Check',
      description: 'Verifica affidabilità creditizia e penale degli inquilini',
      icon: Shield,
      color: '#34C759',
      available: user?.current_mode === 'landlord',
    },
    {
      id: 'contract-registration' as FeatureType,
      title: 'Registrazione Automatica',
      description: 'Registra contratti all\'Agenzia delle Entrate automaticamente',
      icon: FileText,
      color: '#FF9500',
      available: user?.current_mode === 'landlord',
    },
    {
      id: 'verification' as FeatureType,
      title: 'Verifica Identità Avanzata',
      description: 'Verifica identità con riconoscimento facciale e documenti',
      icon: CheckCircle,
      color: '#FF3B30',
      available: true,
    },
  ];

  const renderOverview = () => (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Funzionalità Avanzate</Text>
        <Text style={styles.subtitle}>
          Strumenti professionali per proprietari e inquilini
        </Text>
      </View>

      <View style={styles.featuresGrid}>
        {features.map((feature) => {
          const IconComponent = feature.icon;
          return (
            <TouchableOpacity
              key={feature.id}
              style={[
                styles.featureCard,
                !feature.available && styles.featureCardDisabled
              ]}
              onPress={() => feature.available && setActiveFeature(feature.id)}
              disabled={!feature.available}
            >
              <View style={[styles.featureIcon, { backgroundColor: feature.color }]}>
                <IconComponent size={24} color="#fff" />
              </View>
              
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
                
                {!feature.available && (
                  <Text style={styles.unavailableText}>
                    Disponibile solo per {user?.current_mode === 'tenant' ? 'proprietari' : 'inquilini'}
                  </Text>
                )}
              </View>
              
              {feature.available && (
                <ArrowRight size={20} color="#666" />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>Conformità e Sicurezza</Text>
        <Text style={styles.infoText}>
          Tutte le funzionalità sono conformi al GDPR e utilizzano le migliori pratiche 
          di sicurezza per proteggere i tuoi dati personali.
        </Text>
        
        <View style={styles.complianceList}>
          <Text style={styles.complianceItem}>✓ Crittografia end-to-end</Text>
          <Text style={styles.complianceItem}>✓ Conformità GDPR</Text>
          <Text style={styles.complianceItem}>✓ Audit di sicurezza regolari</Text>
          <Text style={styles.complianceItem}>✓ Cancellazione automatica dei dati</Text>
        </View>
      </View>
    </ScrollView>
  );

  const renderVirtualTours = () => (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.featureHeader}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => setActiveFeature('overview')}
        >
          <Text style={styles.backButtonText}>← Indietro</Text>
        </TouchableOpacity>
        <Text style={styles.featureTitle}>Tour Virtuali 360°</Text>
      </View>

      <VirtualTourViewer
        tourUrl="https://my.matterport.com/show/?m=example123"
        tourType="matterport"
        title="Appartamento Moderno - Centro Roma"
        description="Tour completo di tutte le stanze con hotspot interattivi"
      />

      <VirtualTourViewer
        tourUrl="https://kuula.co/post/example456"
        tourType="kuula"
        title="Villa con Giardino - Trastevere"
        description="Esperienza immersiva 360° di villa e spazi esterni"
      />

      <View style={styles.addTourSection}>
        <Text style={styles.sectionTitle}>Aggiungi Nuovo Tour</Text>
        <Text style={styles.sectionDescription}>
          Carica i tuoi tour virtuali da Matterport, Kuula o altri servizi 360°
        </Text>
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>+ Aggiungi Tour Virtuale</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderBackgroundCheck = () => (
    <View style={styles.container}>
      <View style={styles.featureHeader}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => setActiveFeature('overview')}
        >
          <Text style={styles.backButtonText}>← Indietro</Text>
        </TouchableOpacity>
      </View>
      
      <BackgroundCheckForm
        userId={user?.id || ''}
        onComplete={(result) => {
          console.log('Background check completed:', result);
        }}
      />
    </View>
  );

  const renderContractRegistration = () => (
    <View style={styles.container}>
      <View style={styles.featureHeader}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => setActiveFeature('overview')}
        >
          <Text style={styles.backButtonText}>← Indietro</Text>
        </TouchableOpacity>
      </View>
      
      <ContractRegistration
        contractId="contract_123"
        onComplete={(result) => {
          console.log('Contract registration completed:', result);
        }}
      />
    </View>
  );

  const renderContent = () => {
    switch (activeFeature) {
      case 'virtual-tours':
        return renderVirtualTours();
      case 'background-check':
        return renderBackgroundCheck();
      case 'contract-registration':
        return renderContractRegistration();
      case 'verification':
        return (
          <View style={styles.container}>
            <View style={styles.featureHeader}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => setActiveFeature('overview')}
              >
                <Text style={styles.backButtonText}>← Indietro</Text>
              </TouchableOpacity>
              <Text style={styles.featureTitle}>Verifica Identità</Text>
            </View>
            <View style={styles.comingSoon}>
              <CheckCircle size={48} color="#ccc" />
              <Text style={styles.comingSoonText}>
                La verifica identità avanzata è già disponibile nella sezione Verifica del profilo
              </Text>
            </View>
          </View>
        );
      default:
        return renderOverview();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen 
        options={{ 
          title: 'Funzionalità Avanzate',
          headerShown: true,
        }} 
      />
      {renderContent()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  featuresGrid: {
    padding: 16,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureCardDisabled: {
    opacity: 0.6,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  unavailableText: {
    fontSize: 12,
    color: '#FF3B30',
    marginTop: 4,
    fontStyle: 'italic',
  },
  infoSection: {
    backgroundColor: '#fff',
    padding: 20,
    margin: 16,
    borderRadius: 12,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  complianceList: {
    marginTop: 8,
  },
  complianceItem: {
    fontSize: 14,
    color: '#34C759',
    marginBottom: 4,
  },
  featureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  backButton: {
    marginRight: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  addTourSection: {
    backgroundColor: '#fff',
    padding: 20,
    margin: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  comingSoon: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  comingSoonText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
  },
});