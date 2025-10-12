import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { UserType, UserPreferences } from '../types';
import { t } from '../utils/translations';

interface PreferencesScreenProps {
  userType: UserType;
  onComplete: (preferences: UserPreferences) => void;
}

export default function PreferencesScreen({ userType, onComplete }: PreferencesScreenProps) {
  const [budget, setBudget] = useState('');
  const [rent, setRent] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [petFriendly, setPetFriendly] = useState(false);
  const [smoking, setSmoking] = useState(false);
  const [nearAirport, setNearAirport] = useState(false);

  const handleContinue = () => {
    const preferences: UserPreferences = {};
    
    if (userType === 'tenant') {
      if (budget) preferences.budget = parseInt(budget);
      preferences.petFriendly = petFriendly;
      preferences.smoking = smoking;
    } else if (userType === 'homeowner') {
      if (rent) preferences.rent = parseInt(rent);
      if (bedrooms) preferences.bedrooms = parseInt(bedrooms);
      if (bathrooms) preferences.bathrooms = parseInt(bathrooms);
      preferences.petFriendly = petFriendly;
      preferences.nearAirport = nearAirport;
      preferences.amenities = [];
      preferences.preferredTenantTypes = [];
    }
    
    onComplete(preferences);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <MaterialIcons name="tune" size={64} color="#4ECDC4" />
          <Text style={styles.title}>{t('setPreferences')}</Text>
          <Text style={styles.subtitle}>{t('preferencesSubtitle')}</Text>
        </View>

        <View style={styles.form}>
          {userType === 'tenant' && (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>{t('budget')} (€)</Text>
              <TextInput
                style={styles.input}
                value={budget}
                onChangeText={setBudget}
                placeholder="1500"
                keyboardType="number-pad"
                placeholderTextColor="#999"
              />
            </View>
          )}

          {userType === 'homeowner' && (
            <>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>{t('rent')} (€)</Text>
                <TextInput
                  style={styles.input}
                  value={rent}
                  onChangeText={setRent}
                  placeholder="1500"
                  keyboardType="number-pad"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.row}>
                <View style={[styles.inputContainer, styles.halfWidth]}>
                  <Text style={styles.label}>{t('bedrooms')}</Text>
                  <TextInput
                    style={styles.input}
                    value={bedrooms}
                    onChangeText={setBedrooms}
                    placeholder="2"
                    keyboardType="number-pad"
                    placeholderTextColor="#999"
                  />
                </View>

                <View style={[styles.inputContainer, styles.halfWidth]}>
                  <Text style={styles.label}>{t('bathrooms')}</Text>
                  <TextInput
                    style={styles.input}
                    value={bathrooms}
                    onChangeText={setBathrooms}
                    placeholder="1"
                    keyboardType="number-pad"
                    placeholderTextColor="#999"
                  />
                </View>
              </View>
            </>
          )}

          <View style={styles.switchContainer}>
            <View style={styles.switchRow}>
              <MaterialIcons name="pets" size={24} color="#4ECDC4" />
              <Text style={styles.switchLabel}>{t('petFriendly')}</Text>
            </View>
            <Switch
              value={petFriendly}
              onValueChange={setPetFriendly}
              trackColor={{ false: '#E0E0E0', true: '#4ECDC4' }}
              thumbColor="#fff"
            />
          </View>

          {userType === 'tenant' && (
            <View style={styles.switchContainer}>
              <View style={styles.switchRow}>
                <MaterialIcons name="smoking-rooms" size={24} color="#4ECDC4" />
                <Text style={styles.switchLabel}>{t('smoking')}</Text>
              </View>
              <Switch
                value={smoking}
                onValueChange={setSmoking}
                trackColor={{ false: '#E0E0E0', true: '#4ECDC4' }}
                thumbColor="#fff"
              />
            </View>
          )}

          {userType === 'homeowner' && (
            <View style={styles.switchContainer}>
              <View style={styles.switchRow}>
                <MaterialIcons name="flight" size={24} color="#4ECDC4" />
                <Text style={styles.switchLabel}>{t('nearAirport')}</Text>
              </View>
              <Switch
                value={nearAirport}
                onValueChange={setNearAirport}
                trackColor={{ false: '#E0E0E0', true: '#4ECDC4' }}
                thumbColor="#fff"
              />
            </View>
          )}
        </View>

        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
        >
          <Text style={styles.continueButtonText}>{t('done')}</Text>
          <MaterialIcons name="check" size={24} color="#fff" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  form: {
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  inputContainer: {
    marginBottom: 20,
  },
  halfWidth: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  switchLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  continueButton: {
    flexDirection: 'row',
    backgroundColor: '#4ECDC4',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});