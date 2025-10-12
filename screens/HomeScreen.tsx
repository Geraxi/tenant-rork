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
import { User } from '../types';
import { t } from '../utils/translations';

// Mock data for demonstration
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    userType: 'homeowner',
    age: 32,
    bio: 'Renting out a cozy 2BR apartment near downtown. Pet-friendly and close to public transport.',
    photos: ['https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400'],
    location: 'Downtown, Seattle',
    verified: 'verified',
    idVerified: true,
    backgroundCheckPassed: true,
    preferences: {
      rent: 1800,
      bedrooms: 2,
      bathrooms: 1,
      amenities: ['Parking', 'Gym', 'Pet-friendly'],
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
    bio: 'Modern studio near airport. Perfect for cabin crew and pilots. Flexible lease terms available.',
    photos: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'],
    location: 'Airport District, Seattle',
    verified: 'verified',
    idVerified: true,
    backgroundCheckPassed: true,
    preferences: {
      rent: 1500,
      bedrooms: 1,
      bathrooms: 1,
      amenities: ['WiFi', 'Furnished', 'Parking'],
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
    bio: 'Beautiful 3BR house with backyard. Family-friendly neighborhood, great schools nearby.',
    photos: ['https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400'],
    location: 'Suburbs, Seattle',
    verified: 'verified',
    idVerified: true,
    backgroundCheckPassed: true,
    preferences: {
      rent: 2500,
      bedrooms: 3,
      bathrooms: 2,
      amenities: ['Backyard', 'Garage', 'Pet-friendly'],
      nearAirport: false,
      preferredTenantTypes: ['families', 'professionals'],
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
  const [users] = useState<User[]>(mockUsers);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMatchAnimation, setShowMatchAnimation] = useState(false);

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

  if (currentIndex >= users.length) {
    return (
      <SafeAreaView style={styles.container}>
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
    <SafeAreaView style={styles.container}>
      {showMatchAnimation && (
        <MatchAnimation onComplete={handleMatchAnimationComplete} />
      )}

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

      <View style={styles.cardContainer}>
        {users.slice(currentIndex, currentIndex + 2).map((user, index) => (
          <SwipeCard
            key={user.id}
            user={user}
            onSwipeLeft={handleSwipeLeft}
            onSwipeRight={handleSwipeRight}
            isFirst={index === 0}
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
            Alert.alert('Super Like!', 'This feature is coming soon!');
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
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4ECDC4',
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
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 20,
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    alignItems: 'center',
    gap: 8,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
