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
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Property } from '../types';
import { t } from '../utils/translations';

interface CreateListingScreenProps {
  onBack: () => void;
  onSave: (property: Omit<Property, 'id' | 'ownerId' | 'createdAt'>) => void;
}

export default function CreateListingScreen({ onBack, onSave }: CreateListingScreenProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [location, setLocation] = useState('');
  const [rent, setRent] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [squareMeters, setSquareMeters] = useState('');
  const [speseCondominiali, setSpeseCondominiali] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [furnished, setFurnished] = useState(false);
  const [balconyOrTerrace, setBalconyOrTerrace] = useState(false);
  const [nearAirport, setNearAirport] = useState(false);
  const [available, setAvailable] = useState(true);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  const minPhotos = 5;

  const amenitiesList = [
    { icon: 'wifi', label: 'WiFi' },
    { icon: 'local-parking', label: 'Parcheggio' },
    { icon: 'fitness-center', label: 'Palestra' },
    { icon: 'pool', label: 'Piscina' },
    { icon: 'elevator', label: 'Ascensore' },
    { icon: 'security', label: 'Sicurezza 24/7' },
    { icon: 'local-laundry-service', label: 'Lavanderia' },
    { icon: 'ac-unit', label: 'Aria Condizionata' },
    { icon: 'kitchen', label: 'Cucina Attrezzata' },
    { icon: 'pets', label: 'Animali Ammessi' },
  ];

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev =>
      prev.includes(amenity)
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    );
  };

  const handleAddPhoto = () => {
    Alert.alert(
      t('addPhoto'),
      t('chooseFromLibrary'),
      [
        {
          text: t('takePhoto'),
          onPress: () => {
            const newPhoto = `https://images.unsplash.com/photo-${Date.now()}?w=800`;
            setPhotos([...photos, newPhoto]);
            Alert.alert(t('success'), t('uploadSuccess'));
          },
        },
        {
          text: t('chooseFromLibrary'),
          onPress: () => {
            const propertyPhotos = [
              'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
              'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
              'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
              'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=800',
              'https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=800',
            ];
            const randomPhoto = propertyPhotos[Math.floor(Math.random() * propertyPhotos.length)];
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

  const handleSave = () => {
    if (!title.trim() || !description.trim() || !address.trim() || !location.trim() || !rent.trim() || !bedrooms.trim() || !bathrooms.trim() || !squareMeters.trim()) {
      Alert.alert(t('error'), t('fillAllFields'));
      return;
    }

    if (photos.length < minPhotos) {
      Alert.alert(t('error'), `Carica almeno ${minPhotos} foto della proprietà`);
      return;
    }

    const property: Omit<Property, 'id' | 'ownerId' | 'createdAt'> = {
      title,
      description,
      address,
      location,
      rent: parseInt(rent),
      bedrooms: parseInt(bedrooms),
      bathrooms: parseInt(bathrooms),
      squareMeters: parseInt(squareMeters),
      speseCondominiali: speseCondominiali ? parseInt(speseCondominiali) : undefined,
      photos,
      amenities: selectedAmenities,
      furnished,
      balconyOrTerrace,
      nearAirport,
      available,
    };

    onSave(property);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <MaterialIcons name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Crea Annuncio</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📸 Foto Proprietà</Text>
          <Text style={styles.sectionSubtitle}>
            Carica almeno {minPhotos} foto di alta qualità ({photos.length}/{minPhotos})
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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 Informazioni Base</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Titolo Annuncio *</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="es. Appartamento luminoso in centro"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Descrizione *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Descrivi la tua proprietà in dettaglio..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Indirizzo Completo *</Text>
            <TextInput
              style={styles.input}
              value={address}
              onChangeText={setAddress}
              placeholder="Via Roma 123, Milano"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Città *</Text>
            <TextInput
              style={styles.input}
              value={location}
              onChangeText={setLocation}
              placeholder="Milano, Italia"
              placeholderTextColor="#999"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💰 Dettagli Finanziari</Text>
          
          <View style={styles.row}>
            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={styles.label}>Affitto Mensile (€) *</Text>
              <TextInput
                style={styles.input}
                value={rent}
                onChangeText={setRent}
                placeholder="1500"
                keyboardType="number-pad"
                placeholderTextColor="#999"
              />
            </View>

            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={styles.label}>Spese Condominiali (€)</Text>
              <TextInput
                style={styles.input}
                value={speseCondominiali}
                onChangeText={setSpeseCondominiali}
                placeholder="100"
                keyboardType="number-pad"
                placeholderTextColor="#999"
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏠 Caratteristiche</Text>
          
          <View style={styles.row}>
            <View style={[styles.inputContainer, styles.thirdWidth]}>
              <Text style={styles.label}>Camere *</Text>
              <TextInput
                style={styles.input}
                value={bedrooms}
                onChangeText={setBedrooms}
                placeholder="2"
                keyboardType="number-pad"
                placeholderTextColor="#999"
              />
            </View>

            <View style={[styles.inputContainer, styles.thirdWidth]}>
              <Text style={styles.label}>Bagni *</Text>
              <TextInput
                style={styles.input}
                value={bathrooms}
                onChangeText={setBathrooms}
                placeholder="1"
                keyboardType="number-pad"
                placeholderTextColor="#999"
              />
            </View>

            <View style={[styles.inputContainer, styles.thirdWidth]}>
              <Text style={styles.label}>m² *</Text>
              <TextInput
                style={styles.input}
                value={squareMeters}
                onChangeText={setSquareMeters}
                placeholder="80"
                keyboardType="number-pad"
                placeholderTextColor="#999"
              />
            </View>
          </View>

          <View style={styles.switchContainer}>
            <View style={styles.switchRow}>
              <MaterialIcons name="weekend" size={24} color="#4ECDC4" />
              <Text style={styles.switchLabel}>Arredato</Text>
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
              <MaterialIcons name="deck" size={24} color="#4ECDC4" />
              <Text style={styles.switchLabel}>Balcone/Terrazza</Text>
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
              <MaterialIcons name="flight" size={24} color="#4ECDC4" />
              <Text style={styles.switchLabel}>Vicino Aeroporto</Text>
            </View>
            <Switch
              value={nearAirport}
              onValueChange={setNearAirport}
              trackColor={{ false: '#E0E0E0', true: '#4ECDC4' }}
              thumbColor="#fff"
            />
          </View>

          <View style={styles.switchContainer}>
            <View style={styles.switchRow}>
              <MaterialIcons name="check-circle" size={24} color="#4ECDC4" />
              <Text style={styles.switchLabel}>Disponibile Ora</Text>
            </View>
            <Switch
              value={available}
              onValueChange={setAvailable}
              trackColor={{ false: '#E0E0E0', true: '#4ECDC4' }}
              thumbColor="#fff"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>✨ Servizi</Text>
          <View style={styles.amenitiesGrid}>
            {amenitiesList.map((amenity) => (
              <TouchableOpacity
                key={amenity.label}
                style={[
                  styles.amenityButton,
                  selectedAmenities.includes(amenity.label) && styles.amenityButtonSelected
                ]}
                onPress={() => toggleAmenity(amenity.label)}
              >
                <MaterialIcons
                  name={amenity.icon as any}
                  size={24}
                  color={selectedAmenities.includes(amenity.label) ? '#fff' : '#4ECDC4'}
                />
                <Text style={[
                  styles.amenityButtonText,
                  selectedAmenities.includes(amenity.label) && styles.amenityButtonTextSelected
                ]}>
                  {amenity.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.saveButton,
            (photos.length < minPhotos || !title || !description || !address || !location || !rent || !bedrooms || !bathrooms || !squareMeters) && styles.saveButtonDisabled
          ]}
          onPress={handleSave}
          disabled={photos.length < minPhotos || !title || !description || !address || !location || !rent || !bedrooms || !bathrooms || !squareMeters}
        >
          <MaterialIcons name="check" size={24} color="#fff" />
          <Text style={styles.saveButtonText}>Pubblica Annuncio</Text>
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
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  photosScroll: {
    marginTop: 12,
  },
  photoContainer: {
    marginRight: 12,
    position: 'relative',
  },
  photo: {
    width: 150,
    height: 150,
    borderRadius: 12,
  },
  removePhotoButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    padding: 4,
  },
  addPhotoButton: {
    width: 150,
    height: 150,
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
    marginTop: 8,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  inputContainer: {
    marginBottom: 16,
  },
  halfWidth: {
    flex: 1,
  },
  thirdWidth: {
    flex: 1,
  },
  label: {
    fontSize: 14,
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
  textArea: {
    height: 120,
    paddingTop: 16,
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
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  amenityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#4ECDC4',
    minWidth: '45%',
  },
  amenityButtonSelected: {
    backgroundColor: '#4ECDC4',
    borderColor: '#4ECDC4',
  },
  amenityButtonText: {
    fontSize: 14,
    color: '#4ECDC4',
    fontWeight: '600',
  },
  amenityButtonTextSelected: {
    color: '#fff',
  },
  saveButton: {
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
    marginTop: 20,
  },
  saveButtonDisabled: {
    backgroundColor: '#CCC',
    shadowOpacity: 0,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});