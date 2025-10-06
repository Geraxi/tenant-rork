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
          Caricamento...
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
            Effettua l&apos;accesso per iniziare
          </Text>
          <TouchableOpacity 
            style={styles.completeProfileButton}
            onPress={() => router.push('/login')}
            accessibilityRole="button"
            accessibilityLabel="Vai alla pagina di login"
            accessibilityHint="Tocca per accedere al tuo account"
          >
            <Text style={styles.completeProfileButtonText}>Vai al Login</Text>
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
        <Stack.Screen options={{ title: 'Sfoglia' }} />
        <View style={styles.emptyContainer}>
          <Text 
            style={[styles.emptyTitle, { color: Colors.text }]}
            accessibilityRole="header"
          >
            Completa il tuo profilo
          </Text>
          <Text 
            style={[styles.emptyText, { color: Colors.textSecondary }]}
            accessibilityRole="text"
          >
            Prima di iniziare a sfogliare gli immobili, completa il tuo profilo con foto, professione, interessi e budget.
          </Text>
          <TouchableOpacity 
            style={styles.completeProfileButton}
            onPress={() => router.push('/profile-setup')}
            accessibilityRole="button"
            accessibilityLabel="Completa il tuo profilo"
            accessibilityHint="Tocca per aggiungere le tue informazioni personali"
          >
            <Text style={styles.completeProfileButtonText}>Completa profilo</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const getEmptyMessage = () => {
    if (user?.current_mode === 'tenant') {
      return {
        title: 'Nessun altro immobile',
        text: 'Hai visto tutti gli immobili disponibili. Come inquilino, vedi le proprietà pubblicate dai proprietari. Torna più tardi per nuove opportunità!'
      };
    } else if (user?.current_mode === 'landlord') {
      return {
        title: 'Nessun altro inquilino',
        text: 'Hai visto tutti gli inquilini disponibili. Come proprietario, vedi i profili di persone che cercano casa. Torna più tardi per nuovi profili!'
      };
    } else {
      return {
        title: 'Nessun altro coinquilino',
        text: 'Hai visto tutti i coinquilini disponibili. Come coinquilino, vedi altri che cercano coinquilini. Torna più tardi per nuovi profili!'
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
        <Stack.Screen options={{ title: 'Sfoglia' }} />
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
      return 'Sfoglia - Immobili';
    } else if (user?.current_mode === 'landlord') {
      return 'Sfoglia - Inquilini';
    } else {
      return 'Sfoglia - Coinquilini';
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