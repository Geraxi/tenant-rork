import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, MapPin, Euro, Home, Users, Camera } from 'lucide-react-native';
import { Colors, Typography, BorderRadius, Spacing } from '@/constants/theme';
import { useUser } from '@/store/user-store';

interface ListingForm {
  title: string;
  description: string;
  address: string;
  city: string;
  price: string;
  rooms: string;
  bathrooms: string;
  size: string;
  propertyType: 'apartment' | 'house' | 'studio' | 'room';
  furnished: boolean;
  petsAllowed: boolean;
  smokingAllowed: boolean;
  photos: string[];
}

const PROPERTY_TYPES = [
  { key: 'apartment', label: 'Appartamento' },
  { key: 'house', label: 'Casa' },
  { key: 'studio', label: 'Monolocale' },
  { key: 'room', label: 'Stanza' },
] as const;

export default function AddListingScreen() {
  const { user } = useUser();
  const insets = useSafeAreaInsets();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [form, setForm] = useState<ListingForm>({
    title: '',
    description: '',
    address: '',
    city: '',
    price: '',
    rooms: '',
    bathrooms: '',
    size: '',
    propertyType: 'apartment',
    furnished: false,
    petsAllowed: false,
    smokingAllowed: false,
    photos: [],
  });

  const updateForm = (field: keyof ListingForm, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (!form.title.trim()) {
      Alert.alert('Errore', 'Il titolo è obbligatorio');
      return false;
    }
    if (!form.description.trim()) {
      Alert.alert('Errore', 'La descrizione è obbligatoria');
      return false;
    }
    if (!form.address.trim()) {
      Alert.alert('Errore', 'L\'indirizzo è obbligatorio');
      return false;
    }
    if (!form.city.trim()) {
      Alert.alert('Errore', 'La città è obbligatoria');
      return false;
    }
    if (!form.price.trim() || isNaN(Number(form.price))) {
      Alert.alert('Errore', 'Inserisci un prezzo valido');
      return false;
    }
    if (!form.rooms.trim() || isNaN(Number(form.rooms))) {
      Alert.alert('Errore', 'Inserisci il numero di stanze');
      return false;
    }
    if (!form.bathrooms.trim() || isNaN(Number(form.bathrooms))) {
      Alert.alert('Errore', 'Inserisci il numero di bagni');
      return false;
    }
    if (!form.size.trim() || isNaN(Number(form.size))) {
      Alert.alert('Errore', 'Inserisci la superficie in mq');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // Here you would normally send the data to your backend
      console.log('Submitting listing:', form);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      Alert.alert(
        'Successo!',
        'Il tuo annuncio è stato pubblicato con successo.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/my-listings'),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Errore', 'Si è verificato un errore durante la pubblicazione dell\'annuncio.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addPhoto = () => {
    // This would normally open image picker
    Alert.alert('Foto', 'Funzionalità di caricamento foto in arrivo!');
  };

  if (!user || user.current_mode !== 'landlord') {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.errorMessage}>
          Devi essere in modalità proprietario per aggiungere annunci
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Stack.Screen 
        options={{
          title: 'Nuovo Annuncio',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color={Colors.text} />
            </TouchableOpacity>
          ),
        }} 
      />
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 20) }}
      >
        <View style={styles.content}>
          {/* Basic Info Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informazioni di base</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Titolo annuncio *</Text>
              <TextInput
                style={styles.input}
                value={form.title}
                onChangeText={(text) => updateForm('title', text)}
                placeholder="es. Bellissimo appartamento in centro"
                placeholderTextColor={Colors.textSecondary}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Descrizione *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={form.description}
                onChangeText={(text) => updateForm('description', text)}
                placeholder="Descrivi la tua proprietà..."
                placeholderTextColor={Colors.textSecondary}
                multiline
                numberOfLines={4}
              />
            </View>
          </View>

          {/* Location Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <MapPin size={20} color={Colors.primary} /> Posizione
            </Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Indirizzo *</Text>
              <TextInput
                style={styles.input}
                value={form.address}
                onChangeText={(text) => updateForm('address', text)}
                placeholder="Via Roma, 123"
                placeholderTextColor={Colors.textSecondary}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Città *</Text>
              <TextInput
                style={styles.input}
                value={form.city}
                onChangeText={(text) => updateForm('city', text)}
                placeholder="Milano"
                placeholderTextColor={Colors.textSecondary}
              />
            </View>
          </View>

          {/* Property Details Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Home size={20} color={Colors.primary} /> Dettagli proprietà
            </Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tipo di proprietà</Text>
              <View style={styles.propertyTypeGrid}>
                {PROPERTY_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type.key}
                    style={[
                      styles.propertyTypeButton,
                      form.propertyType === type.key && styles.propertyTypeButtonActive,
                    ]}
                    onPress={() => updateForm('propertyType', type.key)}
                  >
                    <Text
                      style={[
                        styles.propertyTypeText,
                        form.propertyType === type.key && styles.propertyTypeTextActive,
                      ]}
                    >
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.flex1]}>
                <Text style={styles.label}>Stanze *</Text>
                <TextInput
                  style={styles.input}
                  value={form.rooms}
                  onChangeText={(text) => updateForm('rooms', text)}
                  placeholder="2"
                  placeholderTextColor={Colors.textSecondary}
                  keyboardType="numeric"
                />
              </View>
              
              <View style={[styles.inputGroup, styles.flex1]}>
                <Text style={styles.label}>Bagni *</Text>
                <TextInput
                  style={styles.input}
                  value={form.bathrooms}
                  onChangeText={(text) => updateForm('bathrooms', text)}
                  placeholder="1"
                  placeholderTextColor={Colors.textSecondary}
                  keyboardType="numeric"
                />
              </View>
            </View>
            
            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.flex1]}>
                <Text style={styles.label}>Superficie (mq) *</Text>
                <TextInput
                  style={styles.input}
                  value={form.size}
                  onChangeText={(text) => updateForm('size', text)}
                  placeholder="80"
                  placeholderTextColor={Colors.textSecondary}
                  keyboardType="numeric"
                />
              </View>
              
              <View style={[styles.inputGroup, styles.flex1]}>
                <Text style={styles.label}>Prezzo mensile (€) *</Text>
                <TextInput
                  style={styles.input}
                  value={form.price}
                  onChangeText={(text) => updateForm('price', text)}
                  placeholder="800"
                  placeholderTextColor={Colors.textSecondary}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          {/* Features Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Caratteristiche</Text>
            
            <View style={styles.checkboxGroup}>
              <TouchableOpacity
                style={styles.checkbox}
                onPress={() => updateForm('furnished', !form.furnished)}
              >
                <View style={[styles.checkboxBox, form.furnished && styles.checkboxBoxActive]}>
                  {form.furnished && <Text style={styles.checkboxCheck}>✓</Text>}
                </View>
                <Text style={styles.checkboxLabel}>Arredato</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.checkbox}
                onPress={() => updateForm('petsAllowed', !form.petsAllowed)}
              >
                <View style={[styles.checkboxBox, form.petsAllowed && styles.checkboxBoxActive]}>
                  {form.petsAllowed && <Text style={styles.checkboxCheck}>✓</Text>}
                </View>
                <Text style={styles.checkboxLabel}>Animali ammessi</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.checkbox}
                onPress={() => updateForm('smokingAllowed', !form.smokingAllowed)}
              >
                <View style={[styles.checkboxBox, form.smokingAllowed && styles.checkboxBoxActive]}>
                  {form.smokingAllowed && <Text style={styles.checkboxCheck}>✓</Text>}
                </View>
                <Text style={styles.checkboxLabel}>Fumatori ammessi</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Photos Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Camera size={20} color={Colors.primary} /> Foto
            </Text>
            
            <TouchableOpacity style={styles.addPhotoButton} onPress={addPhoto}>
              <Camera size={32} color={Colors.primary} />
              <Text style={styles.addPhotoText}>Aggiungi foto</Text>
              <Text style={styles.addPhotoSubtext}>Minimo 4 foto richieste</Text>
            </TouchableOpacity>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Pubblicazione...' : 'Pubblica Annuncio'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
  },
  backButton: {
    padding: Spacing.sm,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  label: {
    ...Typography.caption,
    color: Colors.text,
    marginBottom: Spacing.xs,
    fontWeight: '600',
  },
  input: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    ...Typography.body,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  flex1: {
    flex: 1,
  },
  propertyTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  propertyTypeButton: {
    backgroundColor: Colors.background,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  propertyTypeButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  propertyTypeText: {
    ...Typography.caption,
    color: Colors.text,
    fontWeight: '600',
  },
  propertyTypeTextActive: {
    color: Colors.background,
  },
  checkboxGroup: {
    gap: Spacing.md,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  checkboxBox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxBoxActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkboxCheck: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    ...Typography.body,
    color: Colors.text,
  },
  addPhotoButton: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  addPhotoText: {
    ...Typography.body,
    color: Colors.primary,
    fontWeight: '600',
    marginTop: Spacing.sm,
  },
  addPhotoSubtext: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  submitButtonDisabled: {
    backgroundColor: Colors.textSecondary,
  },
  submitButtonText: {
    ...Typography.body,
    color: Colors.background,
    fontWeight: '600',
  },
  errorMessage: {
    ...Typography.body,
    textAlign: 'center',
    color: Colors.textSecondary,
    margin: Spacing.lg,
  },
});