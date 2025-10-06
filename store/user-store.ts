import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { User, UserMode, SubscriptionPlan } from '@/types';

const STORAGE_KEY = 'tenant_user';

export const [UserProvider, useUser] = createContextHook(() => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveUser = async (userData: User) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  const signIn = async (email: string, name: string, userMode: UserMode = 'tenant') => {
    const getBioByMode = (mode: UserMode): string => {
      switch (mode) {
        case 'tenant':
          return 'Ciao! Sto cercando il posto perfetto dove vivere.';
        case 'landlord':
          return 'Ciao! Sono un proprietario e affitto la mia proprieta.';
        case 'roommate':
          return 'Ciao! Sto cercando coinquilini fantastici!';
        default:
          return 'Ciao! Benvenuto su Tenant!';
      }
    };

    const getTagsByMode = (mode: UserMode): string[] => {
      switch (mode) {
        case 'tenant':
          return ['Non fumatore', 'Animali domestici OK', 'Studente'];
        case 'landlord':
          return ['Proprietario verificato', 'Risposta rapida', 'Flessibile'];
        case 'roommate':
          return ['Socievole', 'Pulito', 'Rispettoso'];
        default:
          return ['Nuovo utente'];
      }
    };

    const newUser: User = {
      id: Math.random().toString(36).substring(2, 11),
      full_name: name,
      email,
      profile_photos: [],
      bio: getBioByMode(userMode),
      age: 0,
      profession: '',
      phone: '+39 123 456 7890',
      current_mode: userMode,
      account_modes: [userMode],
      subscription_plan: 'free',
      matches_used_today: 0,
      last_match_date: new Date().toISOString().split('T')[0],
      budget_min: 0,
      budget_max: 0,
      preferred_location: '',
      lifestyle_tags: getTagsByMode(userMode),
      interests: [],
      work_contract_shared: false,
      wants_roommate: false,
      roommate_same_interests: false,
      tenant_preferences: [],
      profile_completed: false,
      photos_count: 0,
      verified: false,
      verification_status: 'not_started' as 'not_started' | 'pending' | 'approved' | 'rejected',
      verification_submitted_at: null as string | null,
      background_check_completed: false,
      virtual_tour_setup: false,
    };
    
    await saveUser(newUser);
  };

  const signOut = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      setUser(null);
      router.replace('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const deleteAccount = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      setUser(null);
      router.replace('/login');
    } catch (error) {
      console.error('Error deleting account:', error);
    }
  };

  const switchMode = async (mode: UserMode) => {
    if (!user) return;
    
    const updatedUser = { ...user, current_mode: mode };
    if (!user.account_modes.includes(mode)) {
      updatedUser.account_modes = [...user.account_modes, mode];
    }
    
    await saveUser(updatedUser);
  };

  const updateSubscription = async (plan: SubscriptionPlan) => {
    if (!user) return;
    
    const updatedUser = { ...user, subscription_plan: plan };
    await saveUser(updatedUser);
  };

  const canSwipe = () => {
    if (!user) return false;
    if (!user.profile_completed) return false;
    if (user.subscription_plan !== 'free') return true;
    
    const today = new Date().toISOString().split('T')[0];
    if (user.last_match_date !== today) {
      return true;
    }
    
    return user.matches_used_today < 10;
  };

  const validateProfile = (userData: User): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (userData.current_mode === 'landlord') {
      // Landlord validation: minimum 5 photos only
      if (userData.profile_photos.length < 5) {
        errors.push('Devi caricare almeno 5 foto della proprieta');
      }
      
      // For landlords, only photos are required
      // Age, location, profession, interests, budget, etc. are NOT required
    } else {
      // Tenant/roommate validation: only photos are required
      if (userData.profile_photos.length < 4) {
        errors.push('Devi caricare almeno 4 foto del profilo');
      }
      
      // Age, location, profession, interests, budget, contract are NOT required
      // Users can complete profile with just photos
      
      // Optional budget validation - only if both values are provided
      if (userData.budget_min && userData.budget_max && userData.budget_min >= userData.budget_max) {
        errors.push('Il budget massimo deve essere maggiore del minimo');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return { success: false, errors: ['Utente non trovato'] };
    
    const updatedUser = { ...user, ...updates };
    
    // Check if this is the final profile completion
    const isCompletingProfile = !user.profile_completed && updates.profile_completed;
    
    // Always mark profile as completed when updating
    // Users can modify any field at any time
    updatedUser.profile_completed = true;
    updatedUser.photos_count = updatedUser.profile_photos.length;
    
    await saveUser(updatedUser);
    
    return {
      success: true,
      errors: [],
      isCompletingProfile
    };
  };

  const isOnboardingComplete = () => {
    if (!user) return false;
    
    const baseRequirements = [
      user.profile_completed,
      user.verified || user.verification_status === 'pending'
    ];
    
    if (user.current_mode === 'landlord') {
      return baseRequirements.every(Boolean);
    } else {
      // For tenants, also check background check
      return [...baseRequirements, user.background_check_completed].every(Boolean);
    }
  };

  const incrementSwipeCount = async () => {
    if (!user) return;
    
    const today = new Date().toISOString().split('T')[0];
    const updatedUser = {
      ...user,
      matches_used_today: user.last_match_date === today ? user.matches_used_today + 1 : 1,
      last_match_date: today,
    };
    
    await saveUser(updatedUser);
  };

  return {
    user,
    isLoading,
    signIn,
    signOut,
    deleteAccount,
    switchMode,
    updateSubscription,
    canSwipe,
    incrementSwipeCount,
    saveUser,
    validateProfile,
    updateProfile,
    isOnboardingComplete,
  };
});