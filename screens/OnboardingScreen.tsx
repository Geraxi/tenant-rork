import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { UserType } from '../types';

const { width } = Dimensions.get('window');

interface OnboardingScreenProps {
  onComplete: (userType: UserType) => void;
}

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [selectedType, setSelectedType] = useState<UserType | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleContinue = () => {
    if (selectedType) {
      onComplete(selectedType);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View 
        style={[
          styles.content,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
        ]}
      >
        <Image 
          source={require('../assets/images/tenant-logo.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
        
        <Text style={styles.title}>Welcome to Tenant</Text>
        <Text style={styles.subtitle}>
          Find your perfect match - whether you\'re looking for a home, a tenant, or a roommate
        </Text>

        <View style={styles.typesContainer}>
          <TouchableOpacity
            style={[
              styles.typeCard,
              selectedType === 'tenant' && styles.typeCardSelected,
            ]}
            onPress={() => setSelectedType('tenant')}
          >
            <MaterialIcons 
              name="person-search" 
              size={48} 
              color={selectedType === 'tenant' ? '#4ECDC4' : '#666'} 
            />
            <Text style={[
              styles.typeTitle,
              selectedType === 'tenant' && styles.typeTitleSelected,
            ]}>
              I\'m a Tenant
            </Text>
            <Text style={styles.typeDescription}>
              Looking for a place to rent
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.typeCard,
              selectedType === 'homeowner' && styles.typeCardSelected,
            ]}
            onPress={() => setSelectedType('homeowner')}
          >
            <MaterialIcons 
              name="home" 
              size={48} 
              color={selectedType === 'homeowner' ? '#4ECDC4' : '#666'} 
            />
            <Text style={[
              styles.typeTitle,
              selectedType === 'homeowner' && styles.typeTitleSelected,
            ]}>
              I\'m a Homeowner
            </Text>
            <Text style={styles.typeDescription}>
              I have a property to rent
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.typeCard,
              selectedType === 'roommate' && styles.typeCardSelected,
            ]}
            onPress={() => setSelectedType('roommate')}
          >
            <MaterialIcons 
              name="people" 
              size={48} 
              color={selectedType === 'roommate' ? '#4ECDC4' : '#666'} 
            />
            <Text style={[
              styles.typeTitle,
              selectedType === 'roommate' && styles.typeTitleSelected,
            ]}>
              Looking for Roommate
            </Text>
            <Text style={styles.typeDescription}>
              Find someone to share with
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[
            styles.continueButton,
            !selectedType && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={!selectedType}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
          <MaterialIcons name="arrow-forward" size={24} color="#fff" />
        </TouchableOpacity>

        <View style={styles.featuresContainer}>
          <View style={styles.feature}>
            <MaterialIcons name="verified-user" size={20} color="#4ECDC4" />
            <Text style={styles.featureText}>ID Verification</Text>
          </View>
          <View style={styles.feature}>
            <MaterialIcons name="security" size={20} color="#4ECDC4" />
            <Text style={styles.featureText}>Background Checks</Text>
          </View>
          <View style={styles.feature}>
            <MaterialIcons name="shield" size={20} color="#4ECDC4" />
            <Text style={styles.featureText}>Scam-Free</Text>
          </View>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    marginTop: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  typesContainer: {
    width: '100%',
    gap: 16,
    marginBottom: 30,
  },
  typeCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  typeCardSelected: {
    borderColor: '#4ECDC4',
    backgroundColor: '#E8F9F7',
  },
  typeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 12,
    marginBottom: 4,
  },
  typeTitleSelected: {
    color: '#4ECDC4',
  },
  typeDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  continueButton: {
    flexDirection: 'row',
    backgroundColor: '#4ECDC4',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    alignItems: 'center',
    gap: 8,
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  continueButtonDisabled: {
    backgroundColor: '#CCC',
    shadowOpacity: 0,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 40,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  feature: {
    alignItems: 'center',
    gap: 6,
  },
  featureText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
});