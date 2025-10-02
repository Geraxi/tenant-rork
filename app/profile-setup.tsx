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
  Shield,
  Eye,
} from 'lucide-react-native';
import DropdownMenu from '@/components/DropdownMenu';
import { useUser } from '@/store/user-store';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';
import { User, TenantPreference } from '@/types';
import { 
  INTERESTS_OPTIONS, 
  PROFESSION_CATEGORIES, 
  TENANT_PREFERENCE_OPTIONS,
  CITIES 
} from '@/constants/profile-options';

type SetupStep = 'photos' | 'basic' | 'profession' | 'interests' | 'contract' | 'budget' | 'roommate' | 'preferences' | 'identity_verification' | 'background_check' | 'virtual_tour';

export default function ProfileSetupScreen() {
  const { user, updateProfile, isOnboardingComplete } = useUser();
  const [currentStep, setCurrentStep] = useState<SetupStep>('photos');
  const [formData, setFormData] = useState<Partial<User>>({
    profile_photos: [],
    profession: '',
    interests: [],
    budget_min: 0,
    budget_max: 0,
    work_contract_url: '',
    wants_roommate: false,
    roommate_same_interests: false,
    tenant_preferences: [],
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        profile_photos: user.profile_photos || [],
        profession: user.profession || '',
        interests: user.interests || [],
        budget_min: user.budget_min || 0,
        budget_max: user.budget_max || 0,
        work_contract_url: user.work_contract_url || '',
        wants_roommate: user.wants_roommate || false,
        roommate_same_interests: user.roommate_same_interests || false,
        tenant_preferences: user.tenant_preferences || [],
      });
    }
  }, [user]);

  const steps: SetupStep[] = user?.current_mode === 'landlord' 
    ? ['photos', 'basic', 'preferences', 'identity_verification', 'virtual_tour']
    : [
        'photos',
        'basic', 
        'profession',
        'interests',
        'contract',
        'budget',
        'roommate',
        'identity_verification',
        'background_check'
      ];

  const currentStepIndex = steps.indexOf(currentStep);
  const isLastStep = currentStepIndex === steps.length - 1;

  const handleNext = async () => {
    if (isLastStep) {
      await handleSubmit();
    } else {
      const nextStep = steps[currentStepIndex + 1];
      setCurrentStep(nextStep);
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      const prevStep = steps[currentStepIndex - 1];
      setCurrentStep(prevStep);
    }
  };

  const handleSubmit = async () => {
    console.log('handleSubmit called');
    console.log('Current user mode:', user?.current_mode);
    console.log('Form data:', formData);
    
    setIsLoading(true);
    setErrors([]);

    try {
      // For landlords, only send relevant data
      const dataToUpdate = user?.current_mode === 'landlord' 
        ? {
            profile_photos: formData.profile_photos,
            tenant_preferences: formData.tenant_preferences || []
          }
        : formData;
      
      console.log('Data to update:', dataToUpdate);
      
      // For landlords, check minimum photos requirement before calling updateProfile
      if (user?.current_mode === 'landlord' && (!formData.profile_photos || formData.profile_photos.length < 5)) {
        setErrors(['Devi caricare almeno 5 foto della proprieta']);
        setIsLoading(false);
        return;
      }
      
      const result = await updateProfile(dataToUpdate);
      console.log('Update profile result:', result);
      
      if (result.success) {
        console.log('Profile completed successfully');
        
        // Check if all onboarding is complete
        if (isOnboardingComplete()) {
          console.log('Full onboarding complete, navigating to dashboard');
          router.replace('/(tabs)/dashboard');
        } else {
          console.log('Profile setup complete but onboarding not finished');
          // Show completion message but stay in onboarding flow
          setErrors(['Profilo completato! Ora completa la verifica dell\'identità.']);
        }
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
      // Request permission
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      console.log('Permission result:', permissionResult);
      
      if (permissionResult.granted === false) {
        Alert.alert('Permesso richiesto', 'E necessario il permesso per accedere alla galleria');
        return;
      }

      console.log('Launching image picker...');
      // Launch image picker
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
      Alert.alert('Errore', 'Impossibile selezionare immagine');
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

  const addTenantPreference = (category: keyof typeof TENANT_PREFERENCE_OPTIONS, value: string) => {
    console.log('addTenantPreference called with:', category, value);
    const newPreference: TenantPreference = {
      id: Date.now().toString(),
      category,
      value,
      required: true,
    };
    
    setFormData(prev => {
      const updated = {
        ...prev,
        tenant_preferences: [...(prev.tenant_preferences || []), newPreference]
      };
      console.log('Updated tenant preferences:', updated.tenant_preferences);
      return updated;
    });
  };

  const removeTenantPreference = (id: string) => {
    setFormData(prev => ({
      ...prev,
      tenant_preferences: prev.tenant_preferences?.filter(p => p.id !== id) || []
    }));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'photos':
        return (
          <View style={styles.stepContent}>
            <View style={styles.stepHeader}>
              <Camera size={32} color={Colors.primary} />
              <Text style={styles.stepTitle}>Aggiungi le tue foto</Text>
              <Text style={styles.stepSubtitle}>
                {user?.current_mode === 'landlord' 
                  ? 'Carica almeno 5 foto della tua proprieta'
                  : 'Carica almeno 4 foto per completare il profilo'
                }
              </Text>
            </View>
            
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
            {user?.current_mode === 'landlord' ? (
              (formData.profile_photos?.length || 0) < 5 && (
                <Text style={styles.warningText}>Minimo 5 foto richieste</Text>
              )
            ) : (
              (formData.profile_photos?.length || 0) < 4 && (
                <Text style={styles.warningText}>Minimo 4 foto richieste</Text>
              )
            )}
          </View>
        );

      case 'basic':
        return (
          <View style={styles.stepContent}>
            <View style={styles.stepHeader}>
              <Briefcase size={32} color={Colors.primary} />
              <Text style={styles.stepTitle}>
                {user?.current_mode === 'landlord' ? 'Informazioni proprieta' : 'Informazioni di base'}
              </Text>
              <Text style={styles.stepSubtitle}>
                {user?.current_mode === 'landlord' 
                  ? 'Conferma i tuoi dati di base'
                  : 'Completa le tue informazioni personali'
                }
              </Text>
            </View>
            
            <View style={styles.landlordBasicInfo}>
              <Text style={styles.infoText}>
                {user?.current_mode === 'landlord' 
                  ? 'Come proprietario, hai accesso a tutte le funzionalita per gestire le tue proprieta e trovare inquilini ideali.'
                  : 'Perfetto! Il tuo profilo di base e pronto. Procediamo con le informazioni aggiuntive.'
                }
              </Text>
              <View style={styles.infoItem}>
                <CheckCircle size={20} color={Colors.success} />
                <Text style={styles.infoItemText}>
                  {user?.current_mode === 'landlord' 
                    ? 'Pubblica annunci illimitati'
                    : 'Profilo verificato'
                  }
                </Text>
              </View>
              <View style={styles.infoItem}>
                <CheckCircle size={20} color={Colors.success} />
                <Text style={styles.infoItemText}>
                  {user?.current_mode === 'landlord' 
                    ? 'Visualizza profili degli inquilini'
                    : 'Accesso completo alle funzionalita'
                  }
                </Text>
              </View>
              <View style={styles.infoItem}>
                <CheckCircle size={20} color={Colors.success} />
                <Text style={styles.infoItemText}>
                  {user?.current_mode === 'landlord' 
                    ? 'Imposta preferenze per gli inquilini'
                    : 'Pronto per iniziare la ricerca'
                  }
                </Text>
              </View>
            </View>
          </View>
        );

      case 'profession':
        return (
          <View style={styles.stepContent}>
            <View style={styles.stepHeader}>
              <Briefcase size={32} color={Colors.primary} />
              <Text style={styles.stepTitle}>La tua professione</Text>
              <Text style={styles.stepSubtitle}>Seleziona la tua categoria professionale</Text>
            </View>
            
            <DropdownMenu
              label="Professione"
              placeholder="Seleziona la tua professione"
              options={PROFESSION_CATEGORIES}
              selectedValue={formData.profession}
              onSelect={(profession) => {
                console.log('Profession selected:', profession);
                setFormData(prev => ({ ...prev, profession }));
              }}
            />
            
            {formData.profession === 'Altro' && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Specifica la tua professione</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Inserisci la tua professione"
                  onChangeText={(text) => {
                    setFormData(prev => ({ ...prev, profession: text }));
                  }}
                />
              </View>
            )}
          </View>
        );

      case 'interests':
        return (
          <View style={styles.stepContent}>
            <View style={styles.stepHeader}>
              <Heart size={32} color={Colors.primary} />
              <Text style={styles.stepTitle}>I tuoi interessi</Text>
              <Text style={styles.stepSubtitle}>Seleziona almeno 3 interessi</Text>
            </View>
            
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
              {formData.interests?.length || 0} interessi selezionati (minimo 3)
            </Text>
          </View>
        );

      case 'contract':
        return (
          <View style={styles.stepContent}>
            <View style={styles.stepHeader}>
              <Upload size={32} color={Colors.primary} />
              <Text style={styles.stepTitle}>Contratto di lavoro</Text>
              <Text style={styles.stepSubtitle}>Carica il tuo contratto per verificare la tua situazione lavorativa</Text>
            </View>
            
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
            
            <View style={styles.checkboxContainer}>
              <TouchableOpacity
                style={styles.checkbox}
                onPress={() => {
                  console.log('Contract sharing checkbox pressed');
                  setFormData(prev => ({ ...prev, work_contract_shared: !prev.work_contract_shared }));
                }}
                activeOpacity={0.7}
              >
                {formData.work_contract_shared && (
                  <CheckCircle size={20} color={Colors.primary} />
                )}
              </TouchableOpacity>
              <Text style={styles.checkboxLabel}>
                Acconsento a condividere il mio contratto con i proprietari
              </Text>
            </View>
          </View>
        );

      case 'budget':
        return (
          <View style={styles.stepContent}>
            <View style={styles.stepHeader}>
              <DollarSign size={32} color={Colors.primary} />
              <Text style={styles.stepTitle}>Il tuo budget</Text>
              <Text style={styles.stepSubtitle}>Indica la fascia di prezzo che puoi permetterti</Text>
            </View>
            
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
        );

      case 'roommate':
        return (
          <View style={styles.stepContent}>
            <View style={styles.stepHeader}>
              <Users size={32} color={Colors.primary} />
              <Text style={styles.stepTitle}>Coinquilini</Text>
              <Text style={styles.stepSubtitle}>Vuoi anche un coinquilino?</Text>
            </View>
            
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
        );

      case 'preferences':
        return (
          <View style={styles.stepContent}>
            <View style={styles.stepHeader}>
              <Users size={32} color={Colors.primary} />
              <Text style={styles.stepTitle}>Preferenze inquilini</Text>
              <Text style={styles.stepSubtitle}>Seleziona le tue preferenze per gli inquilini</Text>
            </View>
            
            {Object.entries(TENANT_PREFERENCE_OPTIONS).map(([category, options]) => (
              <DropdownMenu
                key={category}
                label={category === 'profession' ? 'Professione Preferita' :
                       category === 'lifestyle' ? 'Stile di Vita' :
                       category === 'age_range' ? 'Fascia di Età' : 'Altre Preferenze'}
                placeholder={`Seleziona ${category === 'profession' ? 'professione' :
                             category === 'lifestyle' ? 'stile di vita' :
                             category === 'age_range' ? 'età' : 'preferenze'}`}
                options={options}
                multiSelect={true}
                selectedValues={formData.tenant_preferences?.filter(p => p.category === category).map(p => p.value) || []}
                onMultiSelect={(values) => {
                  console.log(`${category} preferences selected:`, values);
                  // Remove existing preferences for this category
                  const otherPreferences = formData.tenant_preferences?.filter(p => p.category !== category) || [];
                  // Add new preferences for this category
                  const newPreferences = values.map(value => ({
                    id: `${category}_${value}_${Date.now()}`,
                    category: category as keyof typeof TENANT_PREFERENCE_OPTIONS,
                    value,
                    required: true,
                  }));
                  setFormData(prev => ({
                    ...prev,
                    tenant_preferences: [...otherPreferences, ...newPreferences]
                  }));
                }}
              />
            ))}
            
            {formData.tenant_preferences && formData.tenant_preferences.length > 0 && (
              <View style={styles.selectedPreferences}>
                <Text style={styles.selectedPreferencesTitle}>Riepilogo preferenze selezionate:</Text>
                {formData.tenant_preferences.map((pref) => (
                  <View key={pref.id} style={styles.selectedPreference}>
                    <Text style={styles.selectedPreferenceText}>{pref.value}</Text>
                    <TouchableOpacity 
                      onPress={() => {
                        console.log('Removing tenant preference:', pref.id);
                        removeTenantPreference(pref.id);
                      }}
                      activeOpacity={0.7}
                    >
                      <X size={16} color={Colors.error} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        );

      case 'identity_verification':
        return (
          <View style={styles.stepContent}>
            <View style={styles.stepHeader}>
              <Shield size={32} color={Colors.primary} />
              <Text style={styles.stepTitle}>Verifica la tua identità</Text>
              <Text style={styles.stepSubtitle}>
                Per la sicurezza della community, è necessario verificare la tua identità
              </Text>
            </View>
            
            <View style={styles.verificationInfo}>
              <Text style={styles.infoText}>
                La verifica dell'identità è obbligatoria per tutti gli utenti e include:
              </Text>
              <View style={styles.infoItem}>
                <CheckCircle size={20} color={Colors.primary} />
                <Text style={styles.infoItemText}>Caricamento documento d'identità</Text>
              </View>
              <View style={styles.infoItem}>
                <CheckCircle size={20} color={Colors.primary} />
                <Text style={styles.infoItemText}>Selfie per verifica facciale</Text>
              </View>
              <View style={styles.infoItem}>
                <CheckCircle size={20} color={Colors.primary} />
                <Text style={styles.infoItemText}>Controllo automatico dei documenti</Text>
              </View>
            </View>
            
            <TouchableOpacity
              style={styles.verificationButton}
              onPress={() => {
                console.log('Starting identity verification');
                router.push('/verification');
              }}
              activeOpacity={0.7}
            >
              <Shield size={24} color={Colors.background} />
              <Text style={styles.verificationButtonText}>Inizia verifica identità</Text>
            </TouchableOpacity>
            
            <Text style={styles.privacyNote}>
              I tuoi dati sono protetti e utilizzati solo per la verifica. 
              Non vengono memorizzati sul dispositivo.
            </Text>
          </View>
        );

      case 'background_check':
        return (
          <View style={styles.stepContent}>
            <View style={styles.stepHeader}>
              <Shield size={32} color={Colors.primary} />
              <Text style={styles.stepTitle}>Background Check</Text>
              <Text style={styles.stepSubtitle}>
                {user?.current_mode === 'tenant' 
                  ? 'Verifica la tua affidabilità per i proprietari'
                  : 'Configura le verifiche per i tuoi inquilini'
                }
              </Text>
            </View>
            
            <View style={styles.backgroundCheckInfo}>
              <Text style={styles.infoText}>
                {user?.current_mode === 'tenant' 
                  ? 'Il background check include verifiche su:'
                  : 'Potrai richiedere verifiche su:'
                }
              </Text>
              <View style={styles.infoItem}>
                <CheckCircle size={20} color={Colors.success} />
                <Text style={styles.infoItemText}>Situazione creditizia</Text>
              </View>
              <View style={styles.infoItem}>
                <CheckCircle size={20} color={Colors.success} />
                <Text style={styles.infoItemText}>Precedenti penali</Text>
              </View>
              <View style={styles.infoItem}>
                <CheckCircle size={20} color={Colors.success} />
                <Text style={styles.infoItemText}>Referenze lavorative</Text>
              </View>
            </View>
            
            <TouchableOpacity
              style={styles.backgroundCheckButton}
              onPress={() => {
                console.log('Starting background check');
                // For tenants, start their own background check
                // For landlords, just acknowledge the feature
                if (user?.current_mode === 'tenant') {
                  router.push('/advanced-features');
                } else {
                  // Just continue for landlords
                  handleNext();
                }
              }}
              activeOpacity={0.7}
            >
              <Shield size={24} color={Colors.background} />
              <Text style={styles.backgroundCheckButtonText}>
                {user?.current_mode === 'tenant' 
                  ? 'Inizia background check'
                  : 'Configura verifiche'
                }
              </Text>
            </TouchableOpacity>
          </View>
        );

      case 'virtual_tour':
        return (
          <View style={styles.stepContent}>
            <View style={styles.stepHeader}>
              <Eye size={32} color={Colors.primary} />
              <Text style={styles.stepTitle}>Tour Virtuali</Text>
              <Text style={styles.stepSubtitle}>
                Aggiungi tour virtuali 360° alle tue proprietà per attirare più inquilini
              </Text>
            </View>
            
            <View style={styles.virtualTourInfo}>
              <Text style={styles.infoText}>
                I tour virtuali aumentano le visualizzazioni del 300% e includono:
              </Text>
              <View style={styles.infoItem}>
                <CheckCircle size={20} color={Colors.primary} />
                <Text style={styles.infoItemText}>Esperienza immersiva 360°</Text>
              </View>
              <View style={styles.infoItem}>
                <CheckCircle size={20} color={Colors.primary} />
                <Text style={styles.infoItemText}>Hotspot interattivi</Text>
              </View>
              <View style={styles.infoItem}>
                <CheckCircle size={20} color={Colors.primary} />
                <Text style={styles.infoItemText}>Compatibilità Matterport/Kuula</Text>
              </View>
            </View>
            
            <TouchableOpacity
              style={styles.virtualTourButton}
              onPress={() => {
                console.log('Setting up virtual tours');
                router.push('/advanced-features');
              }}
              activeOpacity={0.7}
            >
              <Eye size={24} color={Colors.background} />
              <Text style={styles.virtualTourButtonText}>Configura tour virtuali</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.skipButton}
              onPress={() => {
                console.log('Skipping virtual tour setup');
                handleNext();
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.skipButtonText}>Salta per ora</Text>
            </TouchableOpacity>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ 
        headerShown: false,
        gestureEnabled: false
      }} />
      
      <LinearGradient
        colors={[Colors.primary, Colors.accent]}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Completa il profilo</Text>
            <Text style={styles.headerSubtitle}>
              Passo {currentStepIndex + 1} di {steps.length}
            </Text>
          </View>
        </View>
        
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill,
              { width: `${((currentStepIndex + 1) / steps.length) * 100}%` }
            ]}
          />
        </View>
      </LinearGradient>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderStepContent()}
        
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
      
      <View style={styles.footer}>
        {currentStepIndex > 0 && (
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => {
              console.log('Back button pressed');
              handleBack();
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.backButtonText}>Indietro</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={[styles.nextButton, isLoading && styles.nextButtonDisabled]} 
          onPress={() => {
            console.log('Next/Complete button pressed, isLastStep:', isLastStep, 'isLoading:', isLoading);
            console.log('Current form data:', formData);
            if (!isLoading) {
              handleNext();
            }
          }}
          disabled={isLoading}
          activeOpacity={0.7}
        >
          <Text style={styles.nextButtonText}>
            {isLastStep ? 'Completa profilo' : 'Avanti'}
          </Text>
        </TouchableOpacity>
      </View>
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
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
  },
  backToHomeButton: {
    padding: Spacing.sm,
    marginRight: Spacing.md,
    marginTop: -Spacing.sm,
  },
  headerContent: {
    flex: 1,
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
    marginBottom: Spacing.lg,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.background,
    borderRadius: 2,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
  stepContent: {
    marginBottom: Spacing.xl,
  },
  stepHeader: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  stepTitle: {
    ...Typography.h2,
    color: Colors.text,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  stepSubtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
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
    backgroundColor: Colors.background,
  },
  photoSlotFilled: {
    borderStyle: 'solid',
    borderColor: Colors.primary,
    position: 'relative',
  },
  photoPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
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
    marginBottom: Spacing.sm,
  },
  warningText: {
    ...Typography.caption,
    color: Colors.error,
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
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    ...Typography.body,
    color: Colors.text,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  optionCard: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    minWidth: '45%',
    alignItems: 'center',
  },
  optionCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: `${Colors.primary}10`,
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
    backgroundColor: Colors.background,
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
  uploadButton: {
    backgroundColor: Colors.background,
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
    backgroundColor: `${Colors.success}20`,
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.lg,
  },
  uploadedFileText: {
    ...Typography.body,
    color: Colors.success,
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
  budgetContainer: {
    gap: Spacing.lg,
  },
  budgetRange: {
    ...Typography.h3,
    color: Colors.primary,
    textAlign: 'center',
    marginTop: Spacing.lg,
  },
  optionsContainer: {
    gap: Spacing.md,
  },
  suboption: {
    marginTop: Spacing.lg,
    padding: Spacing.lg,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
  },
  suboptionTitle: {
    ...Typography.body,
    color: Colors.text,
    fontWeight: '600',
    marginBottom: Spacing.md,
  },
  preferenceCategory: {
    marginBottom: Spacing.lg,
  },
  preferenceCategoryTitle: {
    ...Typography.body,
    color: Colors.text,
    fontWeight: '600',
    marginBottom: Spacing.md,
  },
  preferenceOptions: {
    gap: Spacing.sm,
  },
  preferenceOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  preferenceOptionText: {
    ...Typography.body,
    color: Colors.text,
  },
  selectedPreferences: {
    marginTop: Spacing.lg,
  },
  selectedPreferencesTitle: {
    ...Typography.body,
    color: Colors.text,
    fontWeight: '600',
    marginBottom: Spacing.md,
  },
  selectedPreference: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: `${Colors.primary}20`,
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.sm,
  },
  selectedPreferenceText: {
    ...Typography.body,
    color: Colors.primary,
  },
  errorsContainer: {
    backgroundColor: `${Colors.error}20`,
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
  footer: {
    flexDirection: 'row',
    padding: Spacing.lg,
    gap: Spacing.md,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  backButton: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
  },
  backButtonText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  nextButton: {
    flex: 2,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
  },
  nextButtonDisabled: {
    opacity: 0.6,
  },
  nextButtonText: {
    ...Typography.body,
    color: Colors.background,
    fontWeight: '600',
  },
  citiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  cityOption: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  cityOptionSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  cityOptionText: {
    ...Typography.caption,
    color: Colors.text,
  },
  cityOptionTextSelected: {
    color: Colors.background,
  },
  landlordBasicInfo: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
  },
  infoText: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    lineHeight: 24,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  infoItemText: {
    ...Typography.body,
    color: Colors.text,
    flex: 1,
  },
  verificationInfo: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  verificationButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  verificationButtonText: {
    ...Typography.body,
    color: Colors.background,
    fontWeight: '600',
  },
  privacyNote: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  backgroundCheckInfo: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  backgroundCheckButton: {
    backgroundColor: Colors.success,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  backgroundCheckButtonText: {
    ...Typography.body,
    color: Colors.background,
    fontWeight: '600',
  },
  virtualTourInfo: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  virtualTourButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  virtualTourButtonText: {
    ...Typography.body,
    color: Colors.background,
    fontWeight: '600',
  },
  skipButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    alignItems: 'center',
  },
  skipButtonText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
});