import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { User, UserMode, SubscriptionPlan } from '@/types';
import { trpcClient } from '@/lib/trpc';

const STORAGE_KEY = 'tenant_user';
const TOKEN_KEY = 'tenant_auth_token';

export const [UserProvider, useUser] = createContextHook(() => {
  const [user, setUser] = useState<User | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const [storedUser, storedToken] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEY),
        AsyncStorage.getItem(TOKEN_KEY),
      ]);
      
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      
      if (storedToken) {
        setAuthToken(storedToken);
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveUser = async (userData: User, token?: string) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
      setUser(userData);
      
      if (token) {
        await AsyncStorage.setItem(TOKEN_KEY, token);
        setAuthToken(token);
      }
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  const signIn = async (
    provider: 'google' | 'apple',
    providerId: string,
    email: string,
    name: string,
    userMode: UserMode,
    accessToken?: string,
    idToken?: string
  ) => {
    try {
      console.log('Signing in with backend...', { provider, email, userMode });
      
      const result = await trpcClient.auth.signin.mutate({
        provider,
        providerId,
        email,
        name,
        userMode,
        accessToken,
        idToken,
      });
      
      console.log('Backend sign-in result:', result);
      
      if (result.success && result.user && result.token) {
        await saveUser(result.user, result.token);
        return { success: true, isNewUser: result.isNewUser };
      }
      
      throw new Error('Sign-in failed');
    } catch (error) {
      console.error('Sign-in error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEY),
        AsyncStorage.removeItem(TOKEN_KEY),
      ]);
      setUser(null);
      setAuthToken(null);
      router.replace('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const deleteAccount = async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEY),
        AsyncStorage.removeItem(TOKEN_KEY),
      ]);
      setUser(null);
      setAuthToken(null);
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
    authToken,
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