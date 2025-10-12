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
import { UserType, UserPreferences, JobType } from '../types';
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
  const [hasChildren, setHasChildren] = useState(false);
  const [furnished, setFurnished] = useState(false);
  const [parkingAvailable, setParkingAvailable] = useState(false);
  const [requiresEmployed, setRequiresEmployed] = useState(false);
  const [minimumIncome, setMinimumIncome] = useState('');
  const [selectedJobTypes, setSelectedJobTypes] = useState<JobType[]>([]);

  const jobTypes: { value: JobType; label: string }[] = [
    { value: 'professional', label: t('professional') },
    { value: 'cabin-crew', label: t('cabinCrew') },
    { value: 'pilot', label: t('pilot') },
    { value: 'healthcare', label: t('healthcare') },
    { value: 'tech', label: t('tech') },
    { value: 'finance', label: t('finance') },
    { value: 'education', label: t('education') },
    { value: 'hospitality', label: t('hospitality') },
    { value: 'retail', label: t('retail') },
    { value: 'student', label: t('student') },
  ];

  const toggleJobType = (jobType: JobType) => {
    setSelectedJobTypes(prev => 
      prev.includes(jobType) 
        ? prev.filter(j => j !== jobType)
        : [...prev, jobType]
    );
  };

  const handleContinue = () => {
    const preferences: UserPreferences = {};
    
    if (userType === 'tenant') {
      if (budget) preferences.budget = parseInt(budget);
      preferences.petFriendly = petFriendly;
      preferences.smoking = smoking;
      preferences.hasChildren = hasChildren;
      preferences.furnished = furnished;
      preferences.parkingAvailable = parkingAvailable;
    } else if (userType === 'homeowner') {
      if (rent) preferences.rent = parseInt(rent);
      if (bedrooms) preferences.bedrooms = parseInt(bedrooms);
      if (bathrooms) preferences.bathrooms = parseInt(bathrooms);
      preferences.petsAllowed = petFriendly;
      preferences.childrenAllowed = hasChildren;
      preferences.nearAirport = nearAirport;
      preferences.furnished = furnished;
      preferences.parkingAvailable = parkingAvailable;
      preferences.requiresEmployed = requiresEmployed;
      if (minimumIncome) preferences.minimumIncome = parseInt(minimumIncome);
      preferences.acceptedJobTypes = selectedJobTypes;
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

              <View style={styles.switchContainer}>
                <View style={styles.switchRow}>
                  <MaterialIcons name="work" size={24} color="#4ECDC4" />
                  <Text style={styles.switchLabel}>{t('requiresEmployed')}</Text>
                </View>
                <Switch
                  value={requiresEmployed}
                  onValueChange={setRequiresEmployed}
                  trackColor={{ false: '#E0E0E0', true: '#4ECDC4' }}
                  thumbColor="#fff"
                />
              </View>

              {requiresEmployed && (
                <>
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>{t('minimumIncome')} (€/mese)</Text>
                    <TextInput
                      style={styles.input}
                      value={minimumIncome}
                      onChangeText={setMinimumIncome}
                      placeholder="2000"
                      keyboardType="number-pad"
                      placeholderTextColor="#999"
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>{t('acceptedJobTypes')}</Text>
                    <View style={styles.jobTypesContainer}>
                      {jobTypes.map((job) => (
                        <TouchableOpacity
                          key={job.value}
                          style={[
                            styles.jobTypeChip,
                            selectedJobTypes.includes(job.value) && styles.jobTypeChipSelected
                          ]}
                          onPress={() => toggleJobType(job.value)}
                        >
                          <Text style={[
                            styles.jobTypeText,
                            selectedJobTypes.includes(job.value) && styles.jobTypeTextSelected
                          ]}>
                            {job.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </>
              )}
            </>
          )}

          <View style={styles.switchContainer}>
            <View style={styles.switchRow}>
              <MaterialIcons name="pets" size={24} color="#4ECDC4" />
              <Text style={styles.switchLabel}>
                {userType === 'homeowner' ? t('petsAllowed') : t('petFriendly')}
              </Text>
            </View>
            <Switch
              value={petFriendly}
              onValueChange={setPetFriendly}
              trackColor={{ false: '#E0E0E0', true: '#4ECDC4' }}
              thumbColor="#fff"
            />
          </View>

          <View style={styles.switchContainer}>
            <View style={styles.switchRow}>
              <MaterialIcons name="child-care" size={24} color="#4ECDC4" />
              <Text style={styles.switchLabel}>
                {userType === 'homeowner' ? t('childrenAllowed') : t('hasChildren')}
              </Text>
            </View>
            <Switch
              value={hasChildren}
              onValueChange={setHasChildren}
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

          <View style={styles.switchContainer}>
            <View style={styles.switchRow}>
              <MaterialIcons name="weekend" size={24} color="#4ECDC4" />
              <Text style={styles.switchLabel}>{t('furnished')}</Text>
            </View>
            <Switch
              value={furnished}
              onValueChange={setFurnished}
              trackColor={{ false: '#E0E0E0', true: '#4ECDC4' }}
              thumbColor="#fff"
            />
          </View>

          <View style={styles.switchContainer}>
            <View style={styles.switchRow}>
              <MaterialIcons name="local-parking" size={24} color="#4ECDC4" />
              <Text style={styles.switchLabel}>{t('parkingAvailable')}</Text>
            </View>
            <Switch
              value={parkingAvailable}
              onValueChange={setParkingAvailable}
              trackColor={{ false: '#E0E0E0', true: '#4ECDC4' }}
              thumbColor="#fff"
            />
          </View>
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
  jobTypesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  jobTypeChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  jobTypeChipSelected: {
    backgroundColor: '#4ECDC4',
    borderColor: '#4ECDC4',
  },
  jobTypeText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  jobTypeTextSelected: {
    color: '#fff',
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