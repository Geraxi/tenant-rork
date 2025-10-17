import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Utente } from '../src/types';
import TenantPreferencesScreen from './TenantPreferencesScreen';
import LandlordPreferencesScreen from './LandlordPreferencesScreen';
import PersonalDetailsScreen from './PersonalDetailsScreen';
import IDVerificationScreen from './IDVerificationScreen';
import OnboardingConfirmationScreen from './OnboardingConfirmationScreen';

interface OnboardingFlowScreenProps {
  user: Utente;
  onComplete: () => void;
}

type OnboardingStep = 
  | 'preferences' 
  | 'personal-details' 
  | 'id-verification' 
  | 'confirmation';

export default function OnboardingFlowScreen({ user, onComplete }: OnboardingFlowScreenProps) {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('preferences');
  const [onboardingData, setOnboardingData] = useState({
    preferences: {},
    personalDetails: {},
    idVerification: {},
  });

  const handlePreferencesComplete = (preferences: any) => {
    setOnboardingData(prev => ({ ...prev, preferences }));
    setCurrentStep('personal-details');
  };

  const handlePersonalDetailsComplete = (personalDetails: any) => {
    setOnboardingData(prev => ({ ...prev, personalDetails }));
    setCurrentStep('id-verification');
  };

  const handleIDVerificationComplete = (idVerification: any) => {
    setOnboardingData(prev => ({ ...prev, idVerification }));
    setCurrentStep('confirmation');
  };

  const handleConfirmationComplete = () => {
    // Save all onboarding data to Supabase
    // This would typically involve updating the user profile
    onComplete();
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'preferences':
        return (
          user.ruolo === 'tenant' ? (
            <TenantPreferencesScreen
              onComplete={handlePreferencesComplete}
              onSkip={() => setCurrentStep('personal-details')}
            />
          ) : (
            <LandlordPreferencesScreen
              onComplete={handlePreferencesComplete}
              onSkip={() => setCurrentStep('personal-details')}
            />
          )
        );
      
      case 'personal-details':
        return (
          <PersonalDetailsScreen
            user={user}
            onComplete={handlePersonalDetailsComplete}
            onBack={() => setCurrentStep('preferences')}
          />
        );
      
      case 'id-verification':
        return (
          <IDVerificationScreen
            user={user}
            onComplete={handleIDVerificationComplete}
            onBack={() => setCurrentStep('personal-details')}
          />
        );
      
      case 'confirmation':
        return (
          <OnboardingConfirmationScreen
            user={user}
            onboardingData={onboardingData}
            onComplete={handleConfirmationComplete}
            onBack={() => setCurrentStep('id-verification')}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {user.ruolo === 'tenant' ? 'Configura il tuo profilo' : 'Configura il tuo profilo'}
        </Text>
        <Text style={styles.subtitle}>
          {user.ruolo === 'tenant' 
            ? 'Aiutaci a trovare la casa perfetta per te'
            : 'Aiutaci a trovare gli inquilini ideali'
          }
        </Text>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${((getStepNumber(currentStep) + 1) / 4) * 100}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          Passo {getStepNumber(currentStep) + 1} di 4
        </Text>
      </View>

      {renderCurrentStep()}
    </SafeAreaView>
  );
}

const getStepNumber = (step: OnboardingStep): number => {
  switch (step) {
    case 'preferences': return 0;
    case 'personal-details': return 1;
    case 'id-verification': return 2;
    case 'confirmation': return 3;
    default: return 0;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2196F3',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});




