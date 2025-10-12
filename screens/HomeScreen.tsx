import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import SwipeCard from '../components/SwipeCard';
import MatchAnimation from '../components/MatchAnimation';
import CardDetailModal from '../components/CardDetailModal';
import { User } from '../types';
import { t } from '../utils/translations';

// Mock data - includes both tenants and homeowners
const mockHomeowners: User[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    userType: 'homeowner',
    age: 32,
    bio: 'Renting out a cozy 2BR apartment near downtown. Pet-friendly and close to public transport.',
    photos: [
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400',
    ],
    location: 'Milano, Italia',
    verified: 'verified',
    idVerified: true,
    backgroundCheckPassed: true,
    preferences: {
      rent: 1800,
      bedrooms: 2,
      bathrooms: 1,
      amenities: ['Parcheggio', 'Palestra', 'Animali ammessi'],
      nearAirport: false,
      preferredTenantTypes: ['professionals', 'students'],
    },
    createdAt: Date.now(),
  },
  {
    id: '2',
    name: 'Michael Chen',
    email: 'michael@example.com',
    userType: 'homeowner',
    age: 45,
    bio: 'Monolocale moderno vicino all\'aeroporto. Perfetto per equipaggio di cabina e piloti.',
    photos: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=400',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400',
    ],
    location: 'Roma, Italia',
    verified: 'verified',
    idVerified: true,
    backgroundCheckPassed: true,
    preferences: {
      rent: 1500,
      bedrooms: 1,
      bathrooms: 1,
      amenities: ['WiFi', 'Arredato', 'Parcheggio'],
      nearAirport: true,
      preferredTenantTypes: ['cabin crew', 'pilots'],
    },
    createdAt: Date.now(),
  },
  {
    id: '3',
    name: 'Emma Davis',
    email: 'emma@example.com',
    userType: 'homeowner',
    age: 38,
    bio: 'Bellissima casa con 3 camere e giardino. Quartiere adatto alle famiglie.',
    photos: [
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
      'https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=400',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400',
    ],
    location: 'Firenze, Italia',
    verified: 'verified',
    idVerified: true,
    backgroundCheckPassed: true,
    preferences: {
      rent: 2500,
      bedrooms: 3,
      bathrooms: 2,
      amenities: ['Giardino', 'Garage', 'Animali ammessi'],
      nearAirport: false,
      preferredTenantTypes: ['families', 'professionals'],
    },
    createdAt: Date.now(),
  },
];

const mockTenants: User[] = [
  {
    id: '4',
    name: 'Marco Rossi',
    email: 'marco@example.com',
    userType: 'tenant',
    age: 28,
    bio: 'Software engineer looking for a quiet place near the city center. Non-smoker, no pets.',
    photos: [
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    ],
    location: 'Milano, Italia',
    verified: 'verified',
    idVerified: true,
    backgroundCheckPassed: true,
    employmentStatus: 'employed',
    jobType: 'tech',
    preferences: {
      budget: 1500,
      petFriendly: false,
      smoking: false,
    },
    createdAt: Date.now(),
  },
  {
    id: '5',
    name: 'Laura Bianchi',
    email: 'laura@example.com',
    userType: 'tenant',
    age: 24,
    bio: 'University student studying architecture. Looking for a cozy place with good natural light.',
    photos: [
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
    ],
    location: 'Roma, Italia',
    verified: 'verified',
    idVerified: true,
    backgroundCheckPassed: true,
    employmentStatus: 'student',
    jobType: 'student',
    preferences: {
      budget: 1200,
      petFriendly: false,
      smoking: false,
    },
    createdAt: Date.now(),
  },
  {
    id: '6',
    name: 'Alessandro Conti',
    email: 'alessandro@example.com',
    userType: 'tenant',
    age: 35,
    bio: 'Airline pilot seeking accommodation near the airport. Flexible schedule, clean and responsible.',
    photos: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
    ],
    location: 'Roma, Italia',
    verified: 'verified',
    idVerified: true,
    backgroundCheckPassed: true,
    employmentStatus: 'employed',
    jobType: 'pilot',
    preferences: {
      budget: 1600,
      petFriendly: false,
      smoking: false,
      nearAirport: true,
    },
    createdAt: Date.now(),
  },
];

interface HomeScreenProps {
  currentUser: User;
  onNavigateToMatches: () => void;
  onNavigateToProfile: () => void;
  onNavigateToContracts: () => void;
}

export default function HomeScreen({ 
  currentUser, 
  onNavigateToMatches,
  onNavigateToProfile,
  onNavigateToContracts
}: HomeScreenProps) {
  // Filter users based on current user type
  // Tenants see homeowners, homeowners see tenants
  const getFilteredUsers = (): User[] => {
    if (currentUser.userType === 'tenant') {
      return mockHomeowners;
    } else if (currentUser.userType === 'homeowner') {
      return mockTenants;
    }
    // For roommates, show other roommates (not implemented in mock data yet)
    return [];
  };

  const [users] = useState<User[]>(getFilteredUsers());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMatchAnimation, setShowMatchAnimation] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const handleSwipeLeft = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCurrentIndex(prev => prev + 1);
  };

  const handleSwipeRight = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // Simulate match (50% chance)
    const isMatch = Math.random() > 0.5;
    
    if (isMatch) {
      setShowMatchAnimation(true);
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleMatchAnimationComplete = () => {
    setShowMatchAnimation(false);
    setCurrentIndex(prev => prev + 1);
    Alert.alert(
      t('itsAMatch'),
      t('canStartChatting'),
      [
        { text: t('keepSwipingButton'), style: 'cancel' },
        { text: t('viewMatches'), onPress: onNavigateToMatches },
      ]
    );
  };

  const handleCardPress = (user: User) => {
    setSelectedUser(user);
    setShowDetailModal(true);
  };

  // Get browsing context text
  const getBrowsingText = () => {
    if (currentUser.userType === 'tenant') {
      return 'Sfoglia Proprietà';
    } else if (currentUser.userType === 'homeowner') {
      return 'Sfoglia Inquilini';
    }
    return 'Sfoglia';
  };

  if (currentIndex >= users.length) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onNavigateToProfile}>
            <MaterialIcons name="person" size={28} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tenant</Text>
          <View style={styles.headerRight}>
            {currentUser.userType === 'homeowner' && (
              <TouchableOpacity onPress={onNavigateToContracts} style={styles.headerButton}>
                <MaterialIcons name="description" size={28} color="#333" />
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={onNavigateToMatches}>
              <MaterialIcons name="chat-bubble" size={28} color="#333" />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.emptyContainer}>
          <MaterialIcons name="check-circle" size={80} color="#4ECDC4" />
          <Text style={styles.emptyTitle}>{t('allCaughtUp')}</Text>
          <Text style={styles.emptySubtitle}>
            {t('checkBackLater')}
          </Text>
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={() => setCurrentIndex(0)}
          >
            <MaterialIcons name="refresh" size={24} color="#fff" />
            <Text style={styles.refreshButtonText}>{t('startOver')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {showMatchAnimation && (
        <MatchAnimation onComplete={handleMatchAnimationComplete} />
      )}

      {selectedUser && (
        <CardDetailModal
          visible={showDetailModal}
          user={selectedUser}
          onClose={() => setShowDetailModal(false)}
        />
      )}

      <View style={styles.header}>
        <TouchableOpacity onPress={onNavigateToProfile}>
          <MaterialIcons name="person" size={28} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Tenant</Text>
          <Text style={styles.headerSubtitle}>{getBrowsingText()}</Text>
        </View>
        <View style={styles.headerRight}>
          {currentUser.userType === 'homeowner' && (
            <TouchableOpacity onPress={onNavigateToContracts} style={styles.headerButton}>
              <MaterialIcons name="description" size={28} color="#333" />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={onNavigateToMatches}>
            <MaterialIcons name="chat-bubble" size={28} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.cardContainer}>
        {users.slice(currentIndex, currentIndex + 2).reverse().map((user, index) => (
          <SwipeCard
            key={`${user.id}-${currentIndex}`}
            user={user}
            onSwipeLeft={handleSwipeLeft}
            onSwipeRight={handleSwipeRight}
            onPress={() => handleCardPress(user)}
            isFirst={index === 1}
          />
        ))}
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.nopeButton]}
          onPress={handleSwipeLeft}
        >
          <MaterialIcons name="close" size={32} color="#F44336" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, styles.superLikeButton]}
          onPress={() => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert('Super Like!', 'Questa funzione sarà presto disponibile!');
          }}
        >
          <MaterialIcons name="star" size={28} color="#2196F3" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, styles.likeButton]}
          onPress={handleSwipeRight}
        >
          <MaterialIcons name="favorite" size={32} color="#4CAF50" />
        </TouchableOpacity>
      </View>
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
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    zIndex: 10,
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4ECDC4',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerButton: {
    marginRight: 0,
  },
  cardContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    paddingBottom: 30,
    gap: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  nopeButton: {
    borderWidth: 2,
    borderColor: '#F44336',
  },
  likeButton: {
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  superLikeButton: {
    width: 50,
    height: 50,
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  refreshButton: {
    flexDirection: 'row',
    backgroundColor: '#4ECDC4',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 30,
    alignItems: 'center',
    gap: 8,
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
