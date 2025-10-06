import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { Stack, router } from 'expo-router';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DeckWithButtons, { DeckWithButtonsRef } from '@/components/DeckWithButtons';
import OnboardingOverlay from '@/components/OnboardingOverlay';
import FilterScreen, { FilterOptions } from '@/components/FilterScreen';
import { useUser } from '@/store/user-store';
import { mockProperties } from '@/mocks/properties';
import { mockTenants, mockRoommates } from '@/mocks/users';
import { Property, User } from '@/types';
import { Colors, Typography, Spacing } from '@/constants/theme';

export default function BrowseScreen() {
  const { user, isLoading, canSwipe, incrementSwipeCount, saveUser } = useUser();
  const [properties, setProperties] = useState<Property[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [filters, setFilters] = useState<FilterOptions>({
    priceRange: { min: 0, max: 3000 },
    propertyType: [],
    bedrooms: 'any',
    location: 'any',
    distance: 50,
    amenities: [],
    verified: false,
    featured: false,
  });
  const insets = useSafeAreaInsets();
  const deckRef = useRef<DeckWithButtonsRef>(null);

  useEffect(() => {
    console.log('BrowseScreen: useEffect triggered, user:', user?.full_name, 'mode:', user?.current_mode, 'profile_completed:', user?.profile_completed);
    if (!user) return;
    
    // Auto-complete profile for testing if not completed
    if (!user.profile_completed) {
      console.log('BrowseScreen: Auto-completing profile for testing');
      const updatedUser = {
        ...user,
        profile_photos: [
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
          'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400'
        ],
        profile_completed: true,
        photos_count: 4,
        age: 28,
        profession: 'Software Developer',
        preferred_location: 'Milano',
        budget_min: 500,
        budget_max: 1200,
        interests: ['Sport', 'Musica', 'Viaggi']
      };
      saveUser(updatedUser);
      return;
    }
    
    // Show onboarding for first-time users
    if (user.profile_completed && user.matches_used_today === 0) {
      setShowOnboarding(true);
    }
    
    // Load appropriate content based on user mode
    if (user.current_mode === 'tenant') {
      // Tenants see properties
      console.log('BrowseScreen: Loading properties for tenant, count:', mockProperties.length);
      setProperties(mockProperties);
      setUsers([]);
    } else if (user.current_mode === 'landlord') {
      // Landlords see tenants looking for houses
      console.log('BrowseScreen: Loading tenants for landlord, count:', mockTenants.length);
      setUsers(mockTenants);
      setProperties([]);
    } else if (user.current_mode === 'roommate') {
      // Roommates see other roommates
      console.log('BrowseScreen: Loading roommates, count:', mockRoommates.length);
      setUsers(mockRoommates);
      setProperties([]);
    }
  }, [user, saveUser]);

  const handleSwipe = async (liked: boolean) => {
    if (!canSwipe()) {
      if (!user?.profile_completed) {
        if (Platform.OS === 'web') {
          console.log('Profilo incompleto: Completa il tuo profilo per iniziare a fare swipe!');
        }
        return;
      }
      if (Platform.OS === 'web') {
        console.log('Limite raggiunto: Hai raggiunto il limite giornaliero di swipe. Passa a Premium per swipe illimitati!');
      }
      return;
    }

    // Handle the swipe logic
    incrementSwipeCount();
    
    if (liked) {
      if (user?.current_mode === 'tenant') {
        console.log('Liked property');
      } else {
        console.log('Liked user');
      }
    }
  };

  const handleOpenItem = (item: Property | User) => {
    const itemType = 'rent' in item ? 'property' : 'user';
    router.push({
      pathname: '/card-detail',
      params: { id: item.id, type: itemType },
    });
  };

  const handlePreferences = () => {
    setShowFilters(true);
  };

  const handleFiltersApply = (newFilters: FilterOptions) => {
    setFilters(newFilters);
    console.log('Applied filters:', newFilters);
    // Here you would typically filter the properties/users based on the filters
    // For now, we'll just log them
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  if (isLoading) {
    return (
      <View
        style={[styles.container, { paddingTop: insets.top, backgroundColor: '#FFFFFF' }]}
      >
        <Text 
          style={[styles.message, { color: Colors.text }]}
          accessibilityRole="text"
          accessibilityLiveRegion="polite"
        >
          Loading...
        </Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View
        style={[styles.container, { paddingTop: insets.top, backgroundColor: '#FFFFFF' }]}
      >
        <View style={styles.emptyContainer}>
          <Text 
            style={[styles.message, { color: Colors.text }]}
            accessibilityRole="header"
          >
            Sign in to get started
          </Text>
          <TouchableOpacity 
            style={styles.completeProfileButton}
            onPress={() => router.push('/login')}
            accessibilityRole="button"
            accessibilityLabel="Go to sign in page"
            accessibilityHint="Double tap to sign in to your account"
          >
            <Text style={styles.completeProfileButtonText}>Go to sign in</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!user.profile_completed) {
    return (
      <View
        style={[styles.container, { paddingTop: insets.top, backgroundColor: '#FFFFFF' }]}
      >
        <Stack.Screen options={{ title: 'Browse' }} />
        <View style={styles.emptyContainer}>
          <Text 
            style={[styles.emptyTitle, { color: Colors.text }]}
            accessibilityRole="header"
          >
            Complete your profile
          </Text>
          <Text 
            style={[styles.emptyText, { color: Colors.textSecondary }]}
            accessibilityRole="text"
          >
            Before you start browsing, complete your profile with photos, profession, interests, and budget.
          </Text>
          <TouchableOpacity 
            style={styles.completeProfileButton}
            onPress={() => router.push('/profile-setup')}
            accessibilityRole="button"
            accessibilityLabel="Complete your profile"
            accessibilityHint="Double tap to add your personal information"
          >
            <Text style={styles.completeProfileButtonText}>Complete profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const getEmptyMessage = () => {
    if (user?.current_mode === 'tenant') {
      return {
        title: 'No more properties',
        text: 'You\'ve seen all available properties. As a tenant, you see properties posted by landlords. Check back later for new opportunities!'
      };
    } else if (user?.current_mode === 'landlord') {
      return {
        title: 'No more tenants',
        text: 'You\'ve seen all available tenants. As a landlord, you see profiles of people looking for housing. Check back later for new profiles!'
      };
    } else {
      return {
        title: 'No more roommates',
        text: 'You\'ve seen all available roommates. As a roommate, you see others looking for roommates. Check back later for new profiles!'
      };
    }
  };

  const getCurrentItems = () => {
    return user?.current_mode === 'tenant' ? properties : users;
  };

  const currentItems = getCurrentItems();

  if (currentItems.length === 0) {
    const emptyMessage = getEmptyMessage();
    return (
      <View
        style={[styles.container, { paddingTop: insets.top, backgroundColor: '#FFFFFF' }]}
      >
        <Stack.Screen options={{ title: 'Browse' }} />
        <View style={styles.emptyContainer}>
          <Text 
            style={[styles.emptyTitle, { color: Colors.text }]}
            accessibilityRole="header"
          >
            {emptyMessage.title}
          </Text>
          <Text 
            style={[styles.emptyText, { color: Colors.textSecondary }]}
            accessibilityRole="text"
          >
            {emptyMessage.text}
          </Text>
        </View>
      </View>
    );
  }

  const getModeTitle = () => {
    if (user?.current_mode === 'tenant') {
      return 'Browse - Properties';
    } else if (user?.current_mode === 'landlord') {
      return 'Browse - Tenants';
    } else {
      return 'Browse - Roommates';
    }
  };

  return (
    <View
      style={[styles.container, { paddingTop: insets.top, backgroundColor: '#FFFFFF' }]}
    >
      <Stack.Screen options={{ title: getModeTitle() }} />
      
      <View style={styles.cardContainer}>
        <DeckWithButtons
          ref={deckRef}
          initialCards={getCurrentItems()}
          type={user?.current_mode === 'tenant' ? 'property' : 'user'}
          onOpenItem={handleOpenItem}
          onSwipe={handleSwipe}
          onPreferences={handlePreferences}
        />
      </View>
      
      <OnboardingOverlay
        visible={showOnboarding}
        onComplete={handleOnboardingComplete}
      />
      
      <FilterScreen
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        onApply={handleFiltersApply}
        currentFilters={filters}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  cardContainer: {
    flex: 1,
    paddingTop: 40,
    paddingBottom: 20,
  },
  limitText: {
    ...Typography.small,
    color: Colors.textLight,
    marginTop: Spacing.xs,
    opacity: 0.9,
  },
  message: {
    ...Typography.body,
    textAlign: 'center',
    color: Colors.textLight,
    margin: Spacing.lg,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  emptyTitle: {
    ...Typography.h2,
    color: Colors.textLight,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  emptyText: {
    ...Typography.body,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing.xl,
    opacity: 0.9,
  },
  completeProfileButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: 25,
    alignItems: 'center',
    minHeight: 44,
    minWidth: 44,
    justifyContent: 'center',
  },
  completeProfileButtonText: {
    ...Typography.body,
    color: Colors.textLight,
    fontWeight: '600',
  },
});