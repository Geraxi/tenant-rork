import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { UserType } from '../types';
import { t } from '../utils/translations';

export interface ProfileData {
  name: string;
  age: string;
  phone: string;
  location: string;
  bio: string;
  photos: string[];
}

interface ProfileSetupScreenProps {
  userType: UserType;
  onComplete: (data: ProfileData) => void;
  onBack: () => void;
}

export default function ProfileSetupScreen({ userType, onComplete, onBack }: ProfileSetupScreenProps) {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);

  const minPhotos = 3;

  const handleAddPhoto = () => {
    Alert.alert(
      t('addPhoto'),
      t('chooseFromLibrary'),
      [
        {
          text: t('takePhoto'),
          onPress: () => {
            // Simulate photo capture
            const newPhoto = `https://images.unsplash.com/photo-${Date.now()}?w=400`;
            setPhotos([...photos, newPhoto]);
            Alert.alert(t('success'), t('uploadSuccess'));
          },
        },
        {
          text: t('chooseFromLibrary'),
          onPress: () => {
            // Simulate photo selection
            const photoUrls = [
              'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
              'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
              'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
              'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
            ];
            const randomPhoto = photoUrls[Math.floor(Math.random() * photoUrls.length)];
            setPhotos([...photos, randomPhoto]);
            Alert.alert(t('success'), t('uploadSuccess'));
          },
        },
        { text: t('cancel'), style: 'cancel' },
      ]
    );
  };

  const handleRemovePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    setPhotos(newPhotos);
  };

  const handleContinue = () => {
    if (!name.trim() || !age.trim() || !phone.trim() || !location.trim()) {
      Alert.alert(t('error'), t('fillAllFields'));
      return;
    }

    if (photos.length < minPhotos) {
      Alert.alert(t('error'), t('uploadMinPhotos', { min: minPhotos.toString() }));
      return;
    }

    onComplete({
      name,
      age,
      phone,
      location,
      bio,
      photos,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <MaterialIcons name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('personalInfo')}</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t('fullName')}</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Mario Rossi"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={styles.label}>{t('age')}</Text>
              <TextInput
                style={styles.input}
                value={age}
                onChangeText={setAge}
                placeholder="25"
                keyboardType="number-pad"
                placeholderTextColor="#999"
              />
            </View>

            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={styles.label}>{t('phone')}</Text>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="+39 123 456 7890"
                keyboardType="phone-pad"
                placeholderTextColor="#999"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t('location')}</Text>
            <TextInput
              style={styles.input}
              value={location}
              onChangeText={setLocation}
              placeholder="Milano, Italia"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t('bio')}</Text>
            <TextInput
              style={[styles.input, styles.bioInput]}
              value={bio}
              onChangeText={setBio}
              placeholder={t('bioPlaceholder')}
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.photosSection}>
            <Text style={styles.label}>
              {t('uploadProfilePhotos')} ({photos.length}/{minPhotos} min)
            </Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.photosScroll}
            >
              {photos.map((photo, index) => (
                <View key={index} style={styles.photoContainer}>
                  <Image source={{ uri: photo }} style={styles.photo} />
                  <TouchableOpacity
                    style={styles.removePhotoButton}
                    onPress={() => handleRemovePhoto(index)}
                  >
                    <MaterialIcons name="close" size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity style={styles.addPhotoButton} onPress={handleAddPhoto}>
                <MaterialIcons name="add-a-photo" size={32} color="#4ECDC4" />
                <Text style={styles.addPhotoText}>{t('addPhoto')}</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.continueButton, (photos.length < minPhotos || !name || !age || !phone || !location) && styles.continueButtonDisabled]}
          onPress={handleContinue}
          disabled={photos.length < minPhotos || !name || !age || !phone || !location}
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
  bioInput: {
    height: 100,
    paddingTop: 16,
  },
  photosSection: {
    marginTop: 8,
  },
  photosScroll: {
    marginTop: 12,
  },
  photoContainer: {
    marginRight: 12,
    position: 'relative',
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  removePhotoButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    padding: 4,
  },
  addPhotoButton: {
    width: 100,
    height: 100,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#4ECDC4',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F9F7',
  },
  addPhotoText: {
    fontSize: 12,
    color: '#4ECDC4',
    marginTop: 4,
    fontWeight: '600',
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
  continueButtonDisabled: {
    backgroundColor: '#CCC',
    shadowOpacity: 0,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});