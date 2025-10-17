import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import * as Updates from 'expo-updates';
import SwipeCard from '../components/SwipeCard';
import PropertyDetailModal from '../components/PropertyDetailModal';
import NoMoreListingsScreen from '../components/NoMoreListingsScreen';
import { Property, User } from '../types';
import { MatchingService } from '../src/services/matchingService';
import { useSupabaseAuth } from '../src/hooks/useSupabaseAuth';

const { width, height } = Dimensions.get('window');

interface PropertySwipeScreenProps {
  onNavigateToMatches: () => void;
  onNavigateToProfile: () => void;
  onNavigateToPreferences: () => void;
  onNavigateToFilters: () => void;
  onNavigateToOnboarding?: (role: 'tenant' | 'landlord') => void;
  onNavigateToDiscover?: () => void;
}

export default function PropertySwipeScreen({ onNavigateToMatches, onNavigateToProfile, onNavigateToPreferences, onNavigateToFilters, onNavigateToOnboarding, onNavigateToDiscover }: PropertySwipeScreenProps) {
  const { user, switchRole } = useSupabaseAuth();
  console.log('🏠 PropertySwipeScreen - Component rendered');
  console.log('🏠 PropertySwipeScreen - User role:', user?.ruolo);
  console.log('🏠 PropertySwipeScreen - User ID:', user?.id);
  console.log('🏠 PropertySwipeScreen - User name:', user?.nome);
  const [properties, setProperties] = useState<Property[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [matches, setMatches] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [roleSwitchLoading, setRoleSwitchLoading] = useState(false);

  // Mock property data - in real app, this would come from Supabase
  const mockProperties: Property[] = [
    {
      id: '1',
      title: 'Appartamento Moderno nel Centro',
      description: 'Bellissimo appartamento di 2 camere nel cuore della città, completamente ristrutturato con design moderno.',
      location: 'Milano, Centro',
      rent: 1200,
      bedrooms: 2,
      bathrooms: 1,
      squareMeters: 65,
      photos: [
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500',
        'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=500',
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500'
      ],
      amenities: ['WiFi', 'Riscaldamento', 'Balcone'],
      ownerId: 'owner1',
      available: true,
      createdAt: Date.now(),
    },
    {
      id: '2',
      title: 'Casa con Giardino',
      description: 'Casa indipendente con giardino privato, perfetta per chi cerca tranquillità e spazi verdi.',
      location: 'Roma, Trastevere',
      rent: 1800,
      bedrooms: 3,
      bathrooms: 2,
      squareMeters: 120,
      photos: [
        'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=500',
        'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=500',
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500'
      ],
      amenities: ['Giardino', 'Parcheggio', 'Cantina'],
      ownerId: 'owner2',
      available: true,
      createdAt: Date.now(),
    },
    {
      id: '3',
      title: 'Loft Industriale Ristrutturato',
      description: 'Spazioso loft in ex fabbrica, caratterizzato da soffitti alti e grandi finestre.',
      location: 'Torino, San Salvario',
      rent: 950,
      bedrooms: 1,
      bathrooms: 1,
      squareMeters: 80,
      photos: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500'],
      amenities: ['Open Space', 'Soffitti Alti', 'Ascensore'],
      ownerId: 'owner3',
      available: true,
      createdAt: Date.now(),
    },
    {
      id: '4',
      title: 'Villa con Vista Mare',
      description: 'Elegante villa con vista panoramica sul mare, ideale per chi ama il lusso e la tranquillità.',
      location: 'Napoli, Posillipo',
      rent: 2500,
      bedrooms: 4,
      bathrooms: 3,
      squareMeters: 200,
      photos: ['https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=500'],
      amenities: ['Vista Mare', 'Piscina', 'Terrazza'],
      ownerId: 'owner4',
      available: true,
      createdAt: Date.now(),
    },
    {
      id: '5',
      title: 'Monolocale nel Quartiere Universitario',
      description: 'Piccolo ma funzionale monolocale, perfetto per studenti o giovani professionisti.',
      location: 'Bologna, Università',
      rent: 600,
      bedrooms: 1,
      bathrooms: 1,
      squareMeters: 35,
      photos: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500'],
      amenities: ['WiFi', 'Riscaldamento', 'Vicino Università'],
      ownerId: 'owner5',
      available: true,
      createdAt: Date.now(),
    },
  ];

  // Mock owner data
  const mockOwners: { [key: string]: User } = {
    owner1: {
      id: 'owner1',
      name: 'Marco Rossi',
      age: 35,
      location: 'Milano',
      bio: 'Proprietario di immobili da 10 anni',
      photos: [
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500',
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=500',
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500'
      ],
      userType: 'homeowner',
      verified: 'verified' as const,
      idVerified: true,
      backgroundCheckPassed: true,
      preferences: { rent: 1200 },
      createdAt: Date.now(),
    },
    owner2: {
      id: 'owner2',
      name: 'Giulia Bianchi',
      age: 42,
      location: 'Roma',
      bio: 'Architetto specializzata in ristrutturazioni',
      photos: [
        'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=500',
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=500',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500'
      ],
      userType: 'homeowner',
      verified: 'verified' as const,
      idVerified: true,
      backgroundCheckPassed: true,
      preferences: { rent: 1800 },
      createdAt: Date.now(),
    },
    owner3: {
      id: 'owner3',
      name: 'Alessandro Verdi',
      age: 28,
      location: 'Torino',
      bio: 'Imprenditore nel settore immobiliare',
      photos: ['https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100'],
      userType: 'homeowner',
      verified: 'verified' as const,
      idVerified: true,
      backgroundCheckPassed: true,
      preferences: { rent: 950 },
      createdAt: Date.now(),
    },
    owner4: {
      id: 'owner4',
      name: 'Francesca Neri',
      age: 50,
      location: 'Napoli',
      bio: 'Proprietaria di lussuose ville sul mare',
      photos: ['https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100'],
      userType: 'homeowner',
      verified: 'verified' as const,
      idVerified: true,
      backgroundCheckPassed: true,
      preferences: { rent: 2500 },
      createdAt: Date.now(),
    },
    owner5: {
      id: 'owner5',
      name: 'Luca Gialli',
      age: 31,
      location: 'Bologna',
      bio: 'Gestisco diversi immobili per studenti',
      photos: ['https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100'],
      userType: 'homeowner',
      verified: 'verified' as const,
      idVerified: true,
      backgroundCheckPassed: true,
      preferences: { rent: 600 },
      createdAt: Date.now(),
    },
  };

  useEffect(() => {
    // Simulate loading properties from API
    const loadProperties = async () => {
      console.log('PropertySwipeScreen - Loading properties...');
      setLoading(true);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('PropertySwipeScreen - Properties loaded:', mockProperties.length);
      console.log('PropertySwipeScreen - First property:', mockProperties[0]);
      setProperties(mockProperties);
      setLoading(false);
    };

    loadProperties();
  }, []);

  const handleSwipeLeft = () => {
    // Pass - move to next property
    setCurrentIndex(prev => prev + 1);
  };

  const handleSwipeRight = async () => {
    const currentProperty = properties[currentIndex];
    if (currentProperty && user) {
      try {
        const result = await MatchingService.likeProperty(user.id, currentProperty.id);
        
        if (result.success) {
          if (result.match) {
            // It's a match! Show celebration
            setMatches(prev => [...prev, currentProperty]);
            Alert.alert(
              '🎉 È un Match!',
              `Hai trovato un match per "${currentProperty.title}"! Il proprietario ha anche espresso interesse. Potete iniziare a comunicare.`,
              [{ text: 'Fantastico!' }]
            );
          } else {
            // Just liked, no popup - silent like
            // The like is recorded but no alert is shown
          }
        } else {
          Alert.alert('Errore', 'Impossibile inviare il like. Riprova.');
        }
      } catch (error) {
        console.error('Error liking property:', error);
        Alert.alert('Errore', 'Si è verificato un errore. Riprova.');
      }
    }
    setCurrentIndex(prev => prev + 1);
  };

  const handleCardPress = () => {
    const currentProperty = properties[currentIndex];
    if (currentProperty) {
      setSelectedProperty(currentProperty);
      setShowDetailModal(true);
    }
  };

  const handleRoleSwitch = async () => {
    try {
      setRoleSwitchLoading(true);
      console.log('🔄 Role switch - Current user:', user);
      console.log('🔄 Role switch - User role:', user?.ruolo);
      console.log('🔄 Role switch - User ID:', user?.id);
      
      if (!user) {
        console.log('🔄 Role switch - No user found, showing error');
        Alert.alert('Errore', 'Utente non trovato. Effettua il login prima di cambiare account.');
        return;
      }
      
      if (!user.id) {
        console.log('🔄 Role switch - User has no ID, showing error');
        Alert.alert('Errore', 'ID utente non valido. Effettua il login nuovamente.');
        return;
      }
      
      const newRole = user.ruolo === 'tenant' ? 'landlord' : 'tenant';
      console.log('🔄 Role switch - Switching to:', newRole);
      
      const result = await switchRole(newRole);
      console.log('🔄 Role switch - Result:', result);
      
      if (result.success) {
        if (result.needsOnboarding && onNavigateToOnboarding) {
          // Navigate to onboarding for first-time role switch
          onNavigateToOnboarding(newRole);
        } else {
          Alert.alert(
            'Account Cambiato',
            `Ora stai utilizzando l'app come ${newRole === 'tenant' ? 'Inquilino' : 'Proprietario'}. L'app si aggiornerà automaticamente.`,
            [{ 
              text: 'OK', 
              onPress: () => {
                console.log('🔄 Role switch - Navigating to discover...');
                // Navigate to discover screen for immediate feedback
                if (onNavigateToDiscover) {
                  onNavigateToDiscover();
                }
              }
            }]
          );
        }
      } else {
        Alert.alert('Errore', result.error || 'Impossibile cambiare account');
      }
    } catch (error) {
      console.error('Error switching role:', error);
      Alert.alert('Errore', 'Impossibile cambiare account');
    } finally {
      setRoleSwitchLoading(false);
    }
  };

  const resetCards = () => {
    setCurrentIndex(0);
    setMatches([]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={styles.loadingText}>Caricamento proprietà...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (currentIndex >= properties.length) {
    // Create a mock user object for the NoMoreListingsScreen
    const mockUser: User = {
      id: user?.id || 'current-user',
      name: user?.nome || 'Utente',
      age: 25,
      location: 'Milano',
      bio: 'Utente attivo',
      photos: [],
      userType: 'tenant',
      verified: 'verified' as const,
      idVerified: true,
      backgroundCheckPassed: true,
      preferences: { rent: 1200 },
      createdAt: Date.now(),
    };

    return (
      <SafeAreaView style={styles.container}>
        <NoMoreListingsScreen
          currentUser={mockUser}
          onEditPreferences={onNavigateToPreferences}
          onEditFilters={onNavigateToFilters}
          onRefresh={resetCards}
          onViewMatches={onNavigateToMatches}
          onViewProfile={onNavigateToProfile}
        />
      </SafeAreaView>
    );
  }

  const currentProperty = properties[currentIndex];
  const nextProperty = properties[currentIndex + 1];
  const propertyOwner = currentProperty ? mockOwners[currentProperty.ownerId] : null;
  
  console.log('🏠 PropertySwipeScreen - Current property:', currentProperty);
  console.log('🏠 PropertySwipeScreen - Current property type:', typeof currentProperty);
  console.log('🏠 PropertySwipeScreen - Current property title:', currentProperty?.title);
  
  console.log('🏠 PropertySwipeScreen - RENDERED!');
  console.log('PropertySwipeScreen - Current property:', currentProperty);
  console.log('PropertySwipeScreen - Properties count:', properties.length);
  console.log('PropertySwipeScreen - Current index:', currentIndex);
  console.log('PropertySwipeScreen - Properties array:', properties);
  console.log('PropertySwipeScreen - Loading state:', loading);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onNavigateToProfile}>
          <MaterialIcons name="person" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scopri Proprietà</Text>
        <TouchableOpacity onPress={onNavigateToMatches}>
          <MaterialIcons name="favorite" size={24} color="#E91E63" />
          {matches.length > 0 && (
            <View style={styles.matchBadge}>
              <Text style={styles.matchBadgeText}>{matches.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Cards Container */}
      <View style={styles.cardsContainer}>
        {/* Next card (background) */}
        {nextProperty && (
          <SwipeCard
            item={nextProperty}
            isPropertyView={true}
            propertyOwner={mockOwners[nextProperty.ownerId]}
            onSwipeLeft={() => {}}
            onSwipeRight={() => {}}
            onPress={() => {}}
            isFirst={false}
          />
        )}

        {/* Current card (foreground) */}
        {currentProperty && (
          <SwipeCard
            item={currentProperty}
            isPropertyView={true}
            propertyOwner={propertyOwner || undefined}
            onSwipeLeft={handleSwipeLeft}
            onSwipeRight={handleSwipeRight}
            onPress={handleCardPress}
            isFirst={true}
          />
        )}
      </View>

      {/* Property Detail Modal */}
      <PropertyDetailModal
        visible={showDetailModal}
        property={selectedProperty}
        owner={selectedProperty ? mockOwners[selectedProperty.ownerId] : null}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedProperty(null);
        }}
      />

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.passButton} onPress={handleSwipeLeft}>
          <MaterialIcons name="close" size={32} color="#F44336" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.likeButton} onPress={handleSwipeRight}>
          <MaterialIcons name="favorite" size={32} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          {currentIndex + 1} di {properties.length}
        </Text>
      </View>

      {/* Role Switch Button */}
       <View style={styles.roleSwitchContainer}>
         <TouchableOpacity
           style={[styles.roleSwitchButton, (!user || roleSwitchLoading) && styles.roleSwitchButtonDisabled]}
           onPress={handleRoleSwitch}
           disabled={!user || roleSwitchLoading}
         >
           <MaterialIcons
             name={user?.ruolo === 'tenant' ? 'business' : 'home'}
             size={16}
             color="#2196F3"
           />
           <Text style={styles.roleSwitchText}>
             {roleSwitchLoading ? '...' :
              user?.ruolo === 'tenant' ? 'Proprietario' : 'Inquilino'}
           </Text>
         </TouchableOpacity>
       </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
    textAlign: 'center',
    lineHeight: 22,
  },
  resetButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 20,
  },
  resetButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  matchBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#E91E63',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  matchBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardsContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 120, // Add bottom padding to prevent overlap
  },
  actionButtons: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 20,
  },
  passButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  likeButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  progressContainer: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  roleSwitchContainer: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
  },
  roleSwitchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  roleSwitchText: {
    color: '#2196F3',
    fontSize: 12,
    fontWeight: '600',
  },
  roleSwitchButtonDisabled: {
    opacity: 0.5,
    backgroundColor: '#f5f5f5',
  },
});
