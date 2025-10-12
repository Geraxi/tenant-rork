import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { UserPreferences } from '../types';
import { t } from '../utils/translations';
import Slider from '../components/Slider';

interface TenantPreferencesScreenProps {
  onComplete: (preferences: UserPreferences) => void;
  onBack: () => void;
}

export default function TenantPreferencesScreen({ onComplete, onBack }: TenantPreferencesScreenProps) {
  const [minBudget, setMinBudget] = useState(500);
  const [maxBudget, setMaxBudget] = useState(2000);
  const [bedrooms, setBedrooms] = useState(2);
  const [bathrooms, setBathrooms] = useState(1);
  const [minSquareMeters, setMinSquareMeters] = useState(50);
  const [maxSquareMeters, setMaxSquareMeters] = useState(150);
  const [balconyOrTerrace, setBalconyOrTerrace] = useState(false);
  const [speseCondominiali, setSpeseCondominiali] = useState(100);
  const [petFriendly, setPetFriendly] = useState(false);
  const [smoking, setSmoking] = useState(false);
  const [hasChildren, setHasChildren] = useState(false);
  const [furnished, setFurnished] = useState(false);
  const [parkingAvailable, setParkingAvailable] = useState(false);
  const [lookingForRoommate, setLookingForRoommate] = useState(false);

  const handleContinue = () => {
    const preferences: UserPreferences = {
      minBudget,
      maxBudget,
      bedrooms,
      bathrooms,
      minSquareMeters,
      maxSquareMeters,
      balconyOrTerrace,
      speseCondominiali,
      petFriendly,
      smoking,
      hasChildren,
      furnished,
      parkingAvailable,
    };
    
    onComplete(preferences);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <MaterialIcons name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('housingPreferences')}</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Slider
          label={t('priceRange')}
          value={minBudget}
          minValue={300}
          maxValue={5000}
          step={50}
          unit="€"
          onValueChange={setMinBudget}
        />

        <Slider
          label={`${t('max')} ${t('budget')}`}
          value={maxBudget}
          minValue={minBudget}
          maxValue={5000}
          step={50}
          unit="€"
          onValueChange={setMaxBudget}
        />

        <Slider
          label={t('bedrooms')}
          value={bedrooms}
          minValue={1}
          maxValue={5}
          step={1}
          unit=""
          onValueChange={setBedrooms}
        />

        <Slider
          label={t('bathrooms')}
          value={bathrooms}
          minValue={1}
          maxValue={3}
          step={1}
          unit=""
          onValueChange={setBathrooms}
        />

        <Slider
          label={`${t('min')} ${t('squareMeters')}`}
          value={minSquareMeters}
          minValue={20}
          maxValue={300}
          step={10}
          unit="m²"
          onValueChange={setMinSquareMeters}
        />

        <Slider
          label={`${t('max')} ${t('squareMeters')}`}
          value={maxSquareMeters}
          minValue={minSquareMeters}
          maxValue={300}
          step={10}
          unit="m²"
          onValueChange={setMaxSquareMeters}
        />

        <Slider
          label={t('speseCondominiali')}
          value={speseCondominiali}
          minValue={0}
          maxValue={500}
          step={10}
          unit="€"
          onValueChange={setSpeseCondominiali}
        />

        <View style={styles.switchContainer}>
          <View style={styles.switchRow}>
            <MaterialIcons name="balcony" size={24} color="#4ECDC4" />
            <Text style={styles.switchLabel}>{t('balconyOrTerrace')}</Text>
          </View>
          <Switch
            value={balconyOrTerrace}
            onValueChange={setBalconyOrTerrace}
            trackColor={{ false: '#E0E0E0', true: '#4ECDC4' }}
            thumbColor="#fff"
          />
        </View>

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

        <View style={styles.switchContainer}>
          <View style={styles.switchRow}>
            <MaterialIcons name="child-care" size={24} color="#4ECDC4" />
            <Text style={styles.switchLabel}>{t('hasChildren')}</Text>
          </View>
          <Switch
            value={hasChildren}
            onValueChange={setHasChildren}
            trackColor={{ false: '#E0E0E0', true: '#4ECDC4' }}
            thumbColor="#fff"
          />
        </View>

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

        <View style={styles.roommateSection}>
          <Text style={styles.roommateQuestion}>{t('lookingForRoommateQuestion')}</Text>
          <View style={styles.switchContainer}>
            <View style={styles.switchRow}>
              <MaterialIcons name="people" size={24} color="#4ECDC4" />
              <Text style={styles.switchLabel}>{t('lookingForRoommate')}</Text>
            </View>
            <Switch
              value={lookingForRoommate}
              onValueChange={setLookingForRoommate}
              trackColor={{ false: '#E0E0E0', true: '#4ECDC4' }}
              thumbColor="#fff"
            />
          </View>
        </View>

        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
        >
          <Text style={styles.continueButtonText}>{t('continue')}</Text>
          <MaterialIcons name="arrow-forward" size={24} color="#fff" />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
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
  roommateSection: {
    marginTop: 24,
    marginBottom: 24,
  },
  roommateQuestion: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
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