import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  SafeAreaView,
  Image,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import {
  Camera,
  Upload,
  Briefcase,
  Heart,
  DollarSign,
  Users,
  CheckCircle,
  AlertCircle,
  Plus,
  X,
  ArrowLeft,
  MapPin,
  Calendar,
  Save,
} from 'lucide-react-native';
import DropdownMenu from '@/components/DropdownMenu';
import { useUser } from '@/store/user-store';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';
import { User } from '@/types';
import { 
  INTERESTS_OPTIONS, 
  PROFESSION_CATEGORIES, 
  CITIES 
} from '@/constants/profile-options';

export default function EditProfileScreen() {
  const { user, updateProfile } = useUser();
  const [formData, setFormData] = useState<Partial<User>>({
    full_name: '',
    bio: '',
    age: 0,
    profession: '',
    preferred_location: '',
    profile_photos: [],
    interests: [],
    budget_min: 0,
    budget_max: 0,
    lifestyle_tags: [],
    work_contract_url: '',
    wants_roommate: false,
    roommate_same_interests: false,
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [customProfession, setCustomProfession] = useState('');
  const [customLocation, setCustomLocation] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        bio: user.bio || '',
        age: user.age || 0,
        profession: user.profession || '',
        preferred_location: user.preferred_location || '',
        profile_photos: user.profile_photos || [],
        interests: user.interests || [],
        budget_min: user.budget_min || 0,
        budget_max: user.budget_max || 0,
        lifestyle_tags: user.lifestyle_tags || [],
        work_contract_url: user.work_contract_url || '',
        wants_roommate: user.wants_roommate || false,
        roommate_same_interests: user.roommate_same_interests || false,
      });
      
      // Check if profession is custom
      if (user.profession && !PROFESSION_CATEGORIES.includes(user.profession)) {
        setCustomProfession(user.profession);
        setFormData(prev => ({ ...prev, profession: 'Altro' }));
      }
      
      // Check if location is custom
      if (user.preferred_location && !CITIES.includes(user.preferred_location)) {
        setCustomLocation(user.preferred_location);
        setFormData(prev => ({ ...prev, preferred_location: 'Altro' }));
      }
    }
  }, [user]);

  const handleSave = async () => {
    console.log('handleSave called');
    setIsLoading(true);
    setErrors([]);

    try {
      // Prepare data for update
      const dataToUpdate = { ...formData };
      
      // Handle custom profession
      if (formData.profession === 'Altro' && customProfession) {
        dataToUpdate.profession = customProfession;
      }
      
      // Handle custom location
      if (formData.preferred_location === 'Altro' && customLocation) {
        dataToUpdate.preferred_location = customLocation;
      }
      
      console.log('Data to update:', dataToUpdate);
      
      const result = await updateProfile(dataToUpdate);
      console.log('Update profile result:', result);
      
      if (result.success) {
        console.log('Profile updated successfully');
        Alert.alert('Successo', 'Profilo aggiornato con successo', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      } else {
        console.log('Profile validation errors:', result.errors);
        setErrors(result.errors);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setErrors(['Errore durante il salvataggio del profilo']);
    } finally {
      setIsLoading(false);
    }
  };

  const addPhoto = async () => {
    console.log('addPhoto called');
    if (formData.profile_photos && formData.profile_photos.length >= 6) {
      Alert.alert('Limite raggiunto', 'Puoi caricare massimo 6 foto');
      return;
    }

    try {
      console.log('Requesting media library permissions...');
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      console.log('Permission result:', permissionResult);
      
      if (permissionResult.granted === false) {
        Alert.alert('Permesso richiesto', 'È necessario il permesso per accedere alla galleria');
        return;
      }

      console.log('Launching image picker...');
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      console.log('Image picker result:', result);
      if (!result.canceled && result.assets && result.assets[0]) {
        const newPhoto = result.assets[0].uri;
        console.log('Adding new photo:', newPhoto);
        setFormData(prev => ({
          ...prev,
          profile_photos: [...(prev.profile_photos || []), newPhoto]
        }));
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Errore', 'Impossibile selezionare l\'immagine');
    }
  };

  const removePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      profile_photos: prev.profile_photos?.filter((_, i) => i !== index) || []
    }));
  };

  const toggleInterest = (interest: string) => {
    console.log('toggleInterest called with:', interest);
    setFormData(prev => {
      const interests = prev.interests || [];
      const newInterests = interests.includes(interest)
        ? interests.filter(i => i !== interest)
        : [...interests, interest];
      console.log('Updated interests:', newInterests);
      return { ...prev, interests: newInterests };
    });
  };

  const toggleLifestyleTag = (tag: string) => {
    setFormData(prev => {
      const tags = prev.lifestyle_tags || [];
      const newTags = tags.includes(tag)
        ? tags.filter(t => t !== tag)
        : [...tags, tag];
      return { ...prev, lifestyle_tags: newTags };
    });
  };

  const lifestyleTags = [
    'Non fumatore', 'Fumatore', 'Animali domestici OK', 'No animali',
    'Studente', 'Lavoratore', 'Socievole', 'Tranquillo', 'Pulito',
    'Rispettoso', 'Flessibile', 'Mattiniero', 'Nottambulo'
  ];

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Utente non trovato</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <LinearGradient
        colors={[Colors.primary, Colors.accent]}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={Colors.background} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Modifica Profilo</Text>
            <Text style={styles.headerSubtitle}>
              Aggiorna le tue informazioni
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.saveButton} 
            onPress={handleSave}
            disabled={isLoading}
          >
            <Save size={24} color={Colors.background} />
          </TouchableOpacity>
        </View>
      </LinearGradient>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Photos Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Foto Profilo</Text>
          <View style={styles.photosGrid}>
            {Array.from({ length: 6 }).map((_, index) => {
              const photo = formData.profile_photos?.[index];
              return (
                <TouchableOpacity
                  key={index}
                  style={[styles.photoSlot, photo && styles.photoSlotFilled]}
                  onPress={() => {
                    console.log('Photo slot pressed, index:', index, 'has photo:', !!photo);
                    if (photo) {
                      removePhoto(index);
                    } else {
                      addPhoto();
                    }
                  }}
                  activeOpacity={0.7}
                >
                  {photo ? (
                    <>
                      <Image source={{ uri: photo }} style={styles.photoImage} />
                      <TouchableOpacity 
                        style={styles.removePhotoButton} 
                        onPress={(e) => {
                          e.stopPropagation();
                          console.log('Remove photo button pressed for index:', index);
                          removePhoto(index);
                        }}
                        activeOpacity={0.7}
                      >
                        <X size={16} color={Colors.background} />
                      </TouchableOpacity>
                    </>
                  ) : (
                    <Plus size={24} color={Colors.textSecondary} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
          <Text style={styles.photoCount}>
            {formData.profile_photos?.length || 0}/6 foto caricate
          </Text>
        </View>

        {/* Basic Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informazioni di Base</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nome completo</Text>
            <TextInput
              style={styles.input}
              value={formData.full_name}
              placeholder="Il tuo nome completo"
              onChangeText={(text) => {
                setFormData(prev => ({ ...prev, full_name: text }));
              }}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Bio</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.bio}
              placeholder="Racconta qualcosa di te..."
              multiline
              numberOfLines={4}
              onChangeText={(text) => {
                setFormData(prev => ({ ...prev, bio: text }));
              }}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Età</Text>
            <TextInput
              style={styles.input}
              value={formData.age?.toString() || ''}
              placeholder="25"
              keyboardType="numeric"
              onChangeText={(text) => {
                const age = parseInt(text) || 0;
                setFormData(prev => ({ ...prev, age }));
              }}
            />
          </View>
        </View>

        {/* Profession Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Professione</Text>
          
          <DropdownMenu
            label="Professione"
            placeholder="Seleziona la tua professione"
            options={PROFESSION_CATEGORIES}
            selectedValue={formData.profession}
            onSelect={(profession) => {
              console.log('Profession selected:', profession);
              setFormData(prev => ({ ...prev, profession }));
              if (profession !== 'Altro') {
                setCustomProfession('');
              }
            }}
          />
          
          {formData.profession === 'Altro' && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Specifica la tua professione</Text>
              <TextInput
                style={styles.input}
                value={customProfession}
                placeholder="Inserisci la tua professione"
                onChangeText={setCustomProfession}
              />
            </View>
          )}
        </View>

        {/* Location Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Località Preferita</Text>
          
          <DropdownMenu
            label="Località"
            placeholder="Seleziona la tua località preferita"
            options={[...CITIES, 'Altro']}
            selectedValue={formData.preferred_location}
            onSelect={(city) => {
              console.log('City selected:', city);
              setFormData(prev => ({ ...prev, preferred_location: city }));
              if (city !== 'Altro') {
                setCustomLocation('');
              }
            }}
          />
          
          {formData.preferred_location === 'Altro' && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Specifica la località</Text>
              <TextInput
                style={styles.input}
                value={customLocation}
                placeholder="Inserisci la località"
                onChangeText={setCustomLocation}
              />
            </View>
          )}
        </View>

        {/* Interests Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Interessi</Text>
          
          <DropdownMenu
            label="Interessi"
            placeholder="Seleziona i tuoi interessi"
            options={INTERESTS_OPTIONS}
            multiSelect={true}
            selectedValues={formData.interests || []}
            onMultiSelect={(interests) => {
              console.log('Interests selected:', interests);
              setFormData(prev => ({ ...prev, interests }));
            }}
          />
          
          <Text style={styles.selectionCount}>
            {formData.interests?.length || 0} interessi selezionati
          </Text>
        </View>

        {/* Lifestyle Tags Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Stile di Vita</Text>
          
          <DropdownMenu
            label="Tag Stile di Vita"
            placeholder="Seleziona i tag che ti descrivono"
            options={lifestyleTags}
            multiSelect={true}
            selectedValues={formData.lifestyle_tags || []}
            onMultiSelect={(tags) => {
              console.log('Lifestyle tags selected:', tags);
              setFormData(prev => ({ ...prev, lifestyle_tags: tags }));
            }}
          />
        </View>

        {/* Budget Section - Only for tenants/roommates */}
        {user.current_mode !== 'landlord' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Budget</Text>
            <View style={styles.budgetContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Budget minimo (€/mese)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.budget_min?.toString() || ''}
                  placeholder="500"
                  keyboardType="numeric"
                  onChangeText={(text) => {
                    const budget_min = parseInt(text) || 0;
                    setFormData(prev => ({ ...prev, budget_min }));
                  }}
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Budget massimo (€/mese)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.budget_max?.toString() || ''}
                  placeholder="1200"
                  keyboardType="numeric"
                  onChangeText={(text) => {
                    const budget_max = parseInt(text) || 0;
                    setFormData(prev => ({ ...prev, budget_max }));
                  }}
                />
              </View>
            </View>
            
            {formData.budget_min && formData.budget_max && (
              <Text style={styles.budgetRange}>
                Range: €{formData.budget_min} - €{formData.budget_max}/mese
              </Text>
            )}
          </View>
        )}

        {/* Contract Section - Only for tenants */}
        {user.current_mode === 'tenant' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contratto di Lavoro</Text>
            <TouchableOpacity 
              style={styles.uploadButton}
              onPress={() => {
                console.log('Upload contract button pressed');
                // Simulate file upload
                setFormData(prev => ({ 
                  ...prev, 
                  work_contract_url: 'https://example.com/contract.pdf' 
                }));
              }}
              activeOpacity={0.7}
            >
              <Upload size={24} color={Colors.primary} />
              <Text style={styles.uploadButtonText}>Carica contratto di lavoro</Text>
            </TouchableOpacity>
            
            {formData.work_contract_url && (
              <View style={styles.uploadedFile}>
                <CheckCircle size={20} color={Colors.success} />
                <Text style={styles.uploadedFileText}>Contratto caricato con successo</Text>
              </View>
            )}
          </View>
        )}

        {/* Roommate Preferences - Only for tenants/roommates */}
        {user.current_mode !== 'landlord' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Coinquilini</Text>
            <View style={styles.optionsContainer}>
              <TouchableOpacity
                style={[
                  styles.optionCard,
                  formData.wants_roommate && styles.optionCardSelected
                ]}
                onPress={() => {
                  console.log('Wants roommate: true');
                  setFormData(prev => ({ ...prev, wants_roommate: true }));
                }}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.optionText,
                  formData.wants_roommate && styles.optionTextSelected
                ]}>
                  Sì, voglio un coinquilino
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.optionCard,
                  !formData.wants_roommate && styles.optionCardSelected
                ]}
                onPress={() => {
                  console.log('Wants roommate: false');
                  setFormData(prev => ({ ...prev, wants_roommate: false }));
                }}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.optionText,
                  !formData.wants_roommate && styles.optionTextSelected
                ]}>
                  No, preferisco vivere da solo
                </Text>
              </TouchableOpacity>
            </View>
            
            {formData.wants_roommate && (
              <View style={styles.suboption}>
                <Text style={styles.suboptionTitle}>Preferenze coinquilino</Text>
                <TouchableOpacity
                  style={styles.checkboxContainer}
                  onPress={() => {
                    console.log('Roommate same interests checkbox pressed');
                    setFormData(prev => ({ ...prev, roommate_same_interests: !prev.roommate_same_interests }));
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.checkbox}>
                    {formData.roommate_same_interests && (
                      <CheckCircle size={20} color={Colors.primary} />
                    )}
                  </View>
                  <Text style={styles.checkboxLabel}>
                    Preferisco coinquilini con i miei stessi interessi
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
        
        {errors.length > 0 && (
          <View style={styles.errorsContainer}>
            {errors.map((error, index) => (
              <View key={index} style={styles.errorItem}>
                <AlertCircle size={16} color={Colors.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
  },
  header: {
    padding: Spacing.xl,
    paddingTop: Platform.OS === 'ios' ? Spacing.xxl : Spacing.xl,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: Spacing.sm,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    ...Typography.h2,
    color: Colors.background,
    marginBottom: Spacing.xs,
  },
  headerSubtitle: {
    ...Typography.body,
    color: Colors.background,
    opacity: 0.9,
  },
  saveButton: {
    padding: Spacing.sm,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
  section: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.lg,
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  photoSlot: {
    width: 100,
    height: 100,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.backgroundSecondary,
  },
  photoSlotFilled: {
    borderStyle: 'solid',
    borderColor: Colors.primary,
    position: 'relative',
  },
  photoImage: {
    width: '100%',
    height: '100%',
    borderRadius: BorderRadius.sm,
  },
  removePhotoButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: Colors.error,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoCount: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  inputLabel: {
    ...Typography.body,
    color: Colors.text,
    marginBottom: Spacing.sm,
    fontWeight: '600',
  },
  input: {
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    ...Typography.body,
    color: Colors.text,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  optionCard: {
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    minWidth: '45%',
    alignItems: 'center',
  },
  optionCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  optionText: {
    ...Typography.body,
    color: Colors.text,
  },
  optionTextSelected: {
    color: Colors.primary,
    fontWeight: '600',
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  interestTag: {
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  interestTagSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  interestText: {
    ...Typography.caption,
    color: Colors.text,
  },
  interestTextSelected: {
    color: Colors.background,
  },
  selectionCount: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  budgetContainer: {
    gap: Spacing.lg,
  },
  budgetRange: {
    ...Typography.h3,
    color: Colors.primary,
    textAlign: 'center',
    marginTop: Spacing.lg,
  },
  uploadButton: {
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    borderRadius: BorderRadius.md,
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  uploadButtonText: {
    ...Typography.body,
    color: Colors.primary,
    fontWeight: '600',
  },
  uploadedFile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.success + '20',
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  uploadedFileText: {
    ...Typography.body,
    color: Colors.success,
  },
  optionsContainer: {
    gap: Spacing.md,
  },
  suboption: {
    marginTop: Spacing.lg,
    padding: Spacing.lg,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.md,
  },
  suboptionTitle: {
    ...Typography.body,
    color: Colors.text,
    fontWeight: '600',
    marginBottom: Spacing.md,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxLabel: {
    ...Typography.body,
    color: Colors.text,
    flex: 1,
  },
  errorsContainer: {
    backgroundColor: Colors.error + '20',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: Spacing.lg,
  },
  errorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  errorText: {
    ...Typography.body,
    color: Colors.error,
    flex: 1,
  },
  message: {
    ...Typography.body,
    textAlign: 'center',
    color: Colors.textSecondary,
    margin: Spacing.lg,
  },
});