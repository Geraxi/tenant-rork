import { useState, useEffect } from 'react';
import { supabase } from '../../utils/src/supabaseClient';
import { Utente } from '../types';
import { Session } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useSupabaseAuth = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<Utente | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAppleSignIn, setIsAppleSignIn] = useState(false);

  useEffect(() => {
    // Add some test users for development
    addTestUsers();
    
    // Load current user from local storage first
    loadCurrentUserFromStorage().then((loadedUser) => {
      if (loadedUser) {
        // User was loaded from storage, we're done
        console.log('✅ User loaded from storage, skipping session check');
        return;
      }
      
      // Only check session if no user was loaded from storage
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        if (session?.user) {
          fetchUserProfile(session.user.id, session.user.email);
        } else {
          setLoading(false);
        }
      });
    });

    // Listen for auth changes - disabled for local storage auth
    // const { data: { subscription } } = supabase.auth.onAuthStateChange(
    //   async (event, session) => {
    //     console.log('Auth state change:', { event, hasSession: !!session, isAppleSignIn, currentUser: !!user });
    //     setSession(session);
    //     if (session?.user) {
    //       await fetchUserProfile(session.user.id, session.user.email);
    //     } else if (!isAppleSignIn && event !== 'INITIAL_SESSION' && event !== 'SIGNED_OUT') {
    //       // Only reset user if it's not an Apple Sign In, not initial session, and not a sign out event
    //       // Also check if we have a user in local storage before resetting
    //       const hasLocalUser = await checkIfUserExists('any@email.com'); // This will check if any users exist
    //       if (!hasLocalUser) {
    //         console.log('Resetting user state (no local users found)');
    //         setUser(null);
    //       } else {
    //         console.log('Keeping user state (local users exist)');
    //       }
    //       setLoading(false);
    //     } else {
    //       console.log('Skipping user reset (Apple Sign In in progress, initial session, or sign out)');
    //     }
    //   }
    // );

    // return () => subscription.unsubscribe();
  }, [isAppleSignIn]);

  // Debug user state changes
  useEffect(() => {
    const userRole = user?.userType || user?.ruolo;
    console.log('useSupabaseAuth - User state changed:', { 
      user: !!user, 
      userData: user,
      userType: user?.userType,
      ruolo: user?.ruolo,
      finalRole: userRole,
      name: user?.name || user?.nome,
      roleType: typeof userRole,
      roleEqualsTenant: userRole === 'tenant',
      roleEqualsLandlord: userRole === 'landlord' || userRole === 'homeowner'
    });
    
    // Force update the role in the user object if it's missing
    if (user && user.userType && !user.ruolo) {
      console.log('🔧 Fixing user role - adding ruolo field');
      const updatedUser = { ...user, ruolo: user.userType };
      setUser(updatedUser);
      // Also save to storage
      AsyncStorage.setItem('current_user', JSON.stringify(updatedUser));
    }
    
    // Also ensure userType is set if only ruolo exists
    if (user && user.ruolo && !user.userType) {
      console.log('🔧 Fixing user type - adding userType field');
      const updatedUser = { 
        ...user, 
        userType: user.ruolo === 'landlord' ? 'homeowner' : user.ruolo 
      };
      setUser(updatedUser);
      // Also save to storage
      AsyncStorage.setItem('current_user', JSON.stringify(updatedUser));
    }
  }, [user]);

  const fetchUserProfile = async (userId: string, userEmail?: string) => {
    try {
      // Don't use stored role preference here - use default tenant role
      console.log('🔍 fetchUserProfile called - not using stored role preference');

      // Try to fetch from utenti table, but handle case when it doesn't exist
      const { data, error } = await supabase
        .from('utenti')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.log('utenti table not found, creating mock user profile');
        // Create a mock user profile for now - use tenant as default
        const email = userEmail || session?.user?.email || '';
        const mockUser: Utente = {
          id: userId,
          ruolo: 'tenant', // Always use tenant as default
          nome: email.split('@')[0] || 'Utente',
          email: email,
          verificato: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setUser(mockUser);
        setLoading(false);
        return;
      }

      // Use database role, don't override with stored preference
      console.log('🔍 Using database role:', data.ruolo);
      setUser(data);
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      // Create a mock user profile as fallback - use tenant as default
      const email = userEmail || session?.user?.email || '';
      const mockUser: Utente = {
        id: userId,
        ruolo: 'tenant', // Always use tenant as default
        userType: 'tenant',
        nome: email.split('@')[0] || 'Utente',
        email: email,
        verificato: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setUser(mockUser);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, nome: string, ruolo: 'tenant' | 'landlord') => {
    try {
      setLoading(true);
      
      // Validate input
      if (!email || !password || !nome) {
        return { success: false, error: 'Tutti i campi sono obbligatori' };
      }

      if (!email.includes('@')) {
        return { success: false, error: 'Inserisci un indirizzo email valido' };
      }

      if (password.length < 6) {
        return { success: false, error: 'La password deve essere di almeno 6 caratteri' };
      }

      if (nome.trim().length < 2) {
        return { success: false, error: 'Il nome deve essere di almeno 2 caratteri' };
      }
      
      console.log('Attempting to sign up with:', { email: email.trim().toLowerCase(), nome, ruolo });
      
      // Check if user already exists
      const existingUser = await checkIfUserExists(email.trim().toLowerCase());
      if (existingUser) {
        return { success: false, error: 'Utente già registrato. Prova ad accedere.' };
      }
      
      // Create new user (simplified approach)
      const newUser: Utente = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ruolo,
        nome,
        email: email.trim().toLowerCase(),
        verificato: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      // Save user to local storage
      await saveRegularUser(newUser);
      
      // Set user and sign them in immediately
      setUser(newUser);
      // Save current user to storage for persistence
      await AsyncStorage.setItem('current_user', JSON.stringify(newUser));
      console.log('New user created and signed in:', newUser);
      
      return { success: true, user: newUser };
    } catch (error: any) {
      console.error('Signup error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // Clear any stored role preference to use the user's actual role
      await AsyncStorage.removeItem('user_role_preference');
      console.log('🔍 Cleared stored role preference');
      
      // Validate input
      if (!email || !password) {
        return { success: false, error: 'Email e password sono obbligatori' };
      }

      if (!email.includes('@')) {
        return { success: false, error: 'Inserisci un indirizzo email valido' };
      }

      if (password.length < 6) {
        return { success: false, error: 'La password deve essere di almeno 6 caratteri' };
      }
      
      console.log('Attempting to sign in with:', { email: email.trim().toLowerCase() });
      
      // First, try to find user in our local storage
      const existingUser = await checkIfUserExists(email.trim().toLowerCase());
      console.log('Checking for existing user:', email.trim().toLowerCase());
      console.log('Found user:', existingUser);
      
      if (existingUser) {
        console.log('Found existing user in local storage:', existingUser);
        console.log('🔍 User role from storage:', existingUser.ruolo);
        console.log('🔍 User role type:', typeof existingUser.ruolo);
        console.log('🔍 User role === "tenant":', existingUser.ruolo === 'tenant');
        console.log('🔍 User role === "landlord":', existingUser.ruolo === 'landlord');
        
        // Use the user's actual role from storage, don't override with stored preference
        console.log('🔍 Using user role from storage:', existingUser.ruolo);
        
        setUser(existingUser);
        // Save current user to storage for persistence
        await AsyncStorage.setItem('current_user', JSON.stringify(existingUser));
        setLoading(false);
        return { success: true, user: existingUser };
      }
      
      // If not found locally, return error (user needs to sign up first)
      console.log('No existing user found, need to sign up first');
      return { success: false, error: 'Utente non trovato. Crea un account prima di accedere.' };
    } catch (error: any) {
      console.error('Signin error:', error);
      return { success: false, error: 'Errore durante l\'accesso. Riprova.' };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear all user data
      setUser(null);
      setSession(null);
      setIsAppleSignIn(false);
      
      // Clear AsyncStorage
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('session');
      await AsyncStorage.removeItem('userRole');
      await AsyncStorage.removeItem('current_user');
      await AsyncStorage.removeItem('onboarding_completed');
      await AsyncStorage.removeItem('tenant_onboarding_completed');
      await AsyncStorage.removeItem('landlord_onboarding_completed');
      
      console.log('User logged out successfully');
    } catch (error) {
      console.error('Signout error:', error);
      throw error; // Re-throw to handle in calling function
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Utente>) => {
    try {
      if (!user) return { success: false, error: 'No user logged in' };

      // Try to update in database, but don't fail if table doesn't exist
      try {
        const { error } = await supabase
          .from('utenti')
          .update(updates)
          .eq('id', user.id);

        if (error) throw error;
      } catch (dbError) {
        console.log('Could not update user profile in database, table may not exist');
      }

      // Update local state
      const updatedUser = user ? { ...user, ...updates } : null;
      setUser(updatedUser);
      
      // Save updated user to AsyncStorage for persistence
      if (updatedUser) {
        await AsyncStorage.setItem('current_user', JSON.stringify(updatedUser));
        console.log('✅ Profile updated and saved to storage:', updatedUser);
      }
      
      return { success: true };
    } catch (error: any) {
      console.error('Update profile error:', error);
      return { success: false, error: error.message };
    }
  };

  const uploadProfilePhoto = async (photo: any) => {
    try {
      if (!user) return { success: false, error: 'No user logged in' };

      // Create a mock URL for the uploaded photo
      const photoUrl = `https://via.placeholder.com/300x300/2196F3/FFFFFF?text=${user.nome.charAt(0)}`;
      
      // Update user profile with new photo
      const updatedUser = { ...user, foto: photoUrl };
      setUser(updatedUser);
      
      // Save updated user to AsyncStorage for persistence
      await AsyncStorage.setItem('current_user', JSON.stringify(updatedUser));
      console.log('✅ Profile photo updated and saved to storage');

      // Try to update in database
      try {
        await supabase
          .from('utenti')
          .update({ foto: photoUrl })
          .eq('id', user.id);
      } catch (dbError) {
        console.log('Could not update photo in database, table may not exist');
      }

      return { success: true, url: photoUrl };
    } catch (error: any) {
      console.error('Upload photo error:', error);
      return { success: false, error: error.message };
    }
  };

  const switchRole = async (newRole: 'tenant' | 'landlord') => {
    try {
      console.log('🔄 switchRole called with newRole:', newRole);
      
      if (!user) {
        console.log('❌ No user logged in');
        return { success: false, error: 'No user logged in' };
      }

      console.log('🔄 Switching role from', user.ruolo, 'to', newRole);

      // Check if this is the first time switching to this role
      const isFirstTimeSwitch = !user[`${newRole}_onboarding_completed`];

      // Update local user state immediately
      const updatedUser = { 
        ...user, 
        ruolo: newRole,
        userType: newRole === 'tenant' ? 'tenant' as const : 'homeowner' as const
      };
      
      // Set user state first
      setUser(updatedUser);
      
      // Wait for state to propagate
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Save updated user to storage for persistence
      await AsyncStorage.setItem('current_user', JSON.stringify(updatedUser));
      
      // Save role preference to AsyncStorage
      await AsyncStorage.setItem('user_role_preference', newRole);
      
      // Force a complete refresh by clearing any cached data
      await AsyncStorage.removeItem('user_role_preference');
      await AsyncStorage.setItem('user_role_preference', newRole);
      
      // Force multiple state updates to ensure propagation
      setTimeout(() => {
        setUser(updatedUser);
      }, 50);
      
      setTimeout(() => {
        setUser(updatedUser);
      }, 100);
      
      console.log('✅ Role switched successfully to:', newRole);

      // Try to update in database, but don't fail if table doesn't exist
      try {
        await supabase
          .from('utenti')
          .update({ ruolo: newRole })
          .eq('id', user.id);
      } catch (dbError) {
        console.log('Could not update role in database, table may not exist');
      }

      return { 
        success: true, 
        user: updatedUser,
        needsOnboarding: isFirstTimeSwitch,
        newRole 
      };
    } catch (error: any) {
      console.error('❌ Switch role error:', error);
      return { success: false, error: error.message };
    }
  };

  const getStoredRolePreference = async (): Promise<'tenant' | 'landlord'> => {
    try {
      const storedRole = await AsyncStorage.getItem('user_role_preference');
      console.log('🔍 Stored role preference:', storedRole);
      return (storedRole as 'tenant' | 'landlord') || 'tenant';
    } catch (error) {
      console.error('Error getting stored role preference:', error);
      return 'tenant';
    }
  };

  const completeOnboarding = async (role: 'tenant' | 'landlord') => {
    try {
      if (!user) return { success: false, error: 'No user logged in' };

      const onboardingKey = role === 'tenant' ? 'tenant_onboarding_completed' : 'landlord_onboarding_completed';
      const updatedUser = { ...user, [onboardingKey]: true };
      setUser(updatedUser);

      // Store in AsyncStorage
      await AsyncStorage.setItem(onboardingKey, 'true');
      await AsyncStorage.setItem('current_user', JSON.stringify(updatedUser));
      console.log('✅ Onboarding completed and user saved to storage');

      // Try to update in database, but don't fail if table doesn't exist
      try {
        await supabase
          .from('utenti')
          .update({ [onboardingKey]: true })
          .eq('id', user.id);
      } catch (dbError) {
        console.log('Could not update onboarding status in database, table may not exist');
      }

      console.log(`${role} onboarding completed`);
      return { success: true, user: updatedUser };
    } catch (error: any) {
      console.error('Complete onboarding error:', error);
      return { success: false, error: error.message };
    }
  };

  const checkExistingUsers = async () => {
    try {
      console.log('Checking existing users...');
      // Note: This requires admin privileges, so it might not work in client-side code
      // For now, we'll just log that we're checking
      console.log('Note: Checking users requires admin access');
      return [];
    } catch (error) {
      console.log('Error checking users:', error);
      return [];
    }
  };

  const signInWithApple = async (identityToken: string, user: any) => {
    try {
      setLoading(true);
      setIsAppleSignIn(true);
      console.log('Signing in with Apple:', { identityToken, user });
      
      // Check if user already exists in our system
      const existingUser = await checkIfUserExists(user.email || `${user.id}@privaterelay.appleid.com`);
      
      if (existingUser) {
        // User exists, sign them in
        console.log('Existing Apple user found:', existingUser);
        setUser(existingUser);
        // Save current user to storage for persistence
        await AsyncStorage.setItem('current_user', JSON.stringify(existingUser));
        setLoading(false);
        
        // Reset the Apple Sign In flag after a delay to ensure state is properly set
        setTimeout(() => {
          setIsAppleSignIn(false);
        }, 2000);
        
        return { success: true, user: existingUser, isNewUser: false };
      } else {
        // New user, create account and trigger onboarding
        console.log('New Apple user, creating account...');
        const newUser: Utente = {
          id: user.id,
          ruolo: 'tenant', // Default role
          nome: user.name || 'Apple User',
          email: user.email || `${user.id}@privaterelay.appleid.com`,
          verificato: true, // Apple users are considered verified
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        
        // Save the new user to AsyncStorage
        await saveAppleUser(newUser);
        
        // For new users, ensure onboarding is not marked as completed
        await AsyncStorage.removeItem('onboarding_completed');
        
        setUser(newUser);
        // Save current user to storage for persistence
        await AsyncStorage.setItem('current_user', JSON.stringify(newUser));
        console.log('Apple user created:', newUser);
        setLoading(false);
        
        // Reset the Apple Sign In flag after a delay to ensure state is properly set
        setTimeout(() => {
          setIsAppleSignIn(false);
        }, 2000);
        
        return { success: true, user: newUser, isNewUser: true };
      }
    } catch (error: any) {
      console.error('Apple sign in error:', error);
      setLoading(false);
      setIsAppleSignIn(false); // Reset flag on error
      return { success: false, error: error.message };
    }
  };

  const checkIfUserExists = async (email: string) => {
    try {
      // Check both Apple users and regular users
      const appleUsers = await AsyncStorage.getItem('apple_users');
      const regularUsers = await AsyncStorage.getItem('regular_users');
      
      let allUsers = [];
      
      if (appleUsers) {
        allUsers = [...allUsers, ...JSON.parse(appleUsers)];
      }
      
      if (regularUsers) {
        allUsers = [...allUsers, ...JSON.parse(regularUsers)];
      }
      
      return allUsers.find((u: any) => u.email === email);
    } catch (error) {
      console.error('Error checking if user exists:', error);
      return null;
    }
  };

  const saveAppleUser = async (user: Utente) => {
    try {
      const existingUsers = await AsyncStorage.getItem('apple_users');
      let users = existingUsers ? JSON.parse(existingUsers) : [];
      
      // Check if user already exists and update, otherwise add new
      const existingIndex = users.findIndex((u: any) => u.email === user.email);
      if (existingIndex >= 0) {
        users[existingIndex] = user;
      } else {
        users.push(user);
      }
      
      await AsyncStorage.setItem('apple_users', JSON.stringify(users));
      console.log('Apple user saved to AsyncStorage');
    } catch (error) {
      console.error('Error saving Apple user:', error);
    }
  };

  const saveRegularUser = async (user: Utente) => {
    try {
      const existingUsers = await AsyncStorage.getItem('regular_users');
      let users = existingUsers ? JSON.parse(existingUsers) : [];
      
      // Check if user already exists and update, otherwise add new
      const existingIndex = users.findIndex((u: any) => u.email === user.email);
      if (existingIndex >= 0) {
        users[existingIndex] = user;
      } else {
        users.push(user);
      }
      
      await AsyncStorage.setItem('regular_users', JSON.stringify(users));
      console.log('Regular user saved to AsyncStorage');
    } catch (error) {
      console.error('Error saving regular user:', error);
    }
  };

  const loadCurrentUserFromStorage = async () => {
    try {
      console.log('🔄 Loading current user from storage...');
      const currentUser = await AsyncStorage.getItem('current_user');
      if (currentUser) {
        const userData = JSON.parse(currentUser);
        console.log('🔄 Found user in storage:', userData);
        console.log('🔄 User userType from storage:', userData.userType);
        console.log('🔄 User ruolo from storage:', userData.ruolo);
        console.log('🔄 Final role (userType || ruolo):', userData.userType || userData.ruolo);
        console.log('🔄 User name from storage:', userData.name || userData.nome);
        
        // ALWAYS ensure both fields are set
        let needsUpdate = false;
        
        // Fix the role if userType exists but ruolo doesn't
        if (userData.userType && !userData.ruolo) {
          console.log('🔧 Fixing stored user role - adding ruolo field');
          userData.ruolo = userData.userType;
          needsUpdate = true;
        }
        
        // Also ensure userType is set if only ruolo exists
        if (userData.ruolo && !userData.userType) {
          console.log('🔧 Fixing stored user type - adding userType field');
          userData.userType = userData.ruolo === 'landlord' ? 'homeowner' : userData.ruolo;
          needsUpdate = true;
        }
        
        // If neither field exists, set both to tenant
        if (!userData.userType && !userData.ruolo) {
          console.log('🔧 No role fields found - setting both to tenant');
          userData.userType = 'tenant';
          userData.ruolo = 'tenant';
          needsUpdate = true;
        }
        
        // Save the fixed user back to storage if needed
        if (needsUpdate) {
          await AsyncStorage.setItem('current_user', JSON.stringify(userData));
          console.log('🔧 User data updated and saved to storage');
        }
        
        setUser(userData);
        setLoading(false);
        return userData; // Return the user data
      } else {
        console.log('🔄 No user found in storage');
        setLoading(false);
        return null;
      }
    } catch (error) {
      console.error('Error loading user from storage:', error);
      setLoading(false);
      return null;
    }
  };

  const addTestUsers = async () => {
    try {
      // Check if test users already exist
      const existingUsers = await AsyncStorage.getItem('regular_users');
      if (existingUsers) {
        const users = JSON.parse(existingUsers);
        if (users.length > 0) {
          console.log('Test users already exist, skipping...');
          return;
        }
      }

      // Create test users
      const testUsers: Utente[] = [
        {
          id: 'test_user_1',
          ruolo: 'tenant',
          nome: 'Test User',
          email: 'test@example.com',
          verificato: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'test_user_2',
          ruolo: 'landlord',
          nome: 'Test Landlord',
          email: 'landlord@example.com',
          verificato: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ];

      await AsyncStorage.setItem('regular_users', JSON.stringify(testUsers));
      console.log('Test users created successfully');
    } catch (error) {
      console.error('Error creating test users:', error);
    }
  };

  // const signInWithGoogle = async (user: any) => {
  //   try {
  //     setLoading(true);
  //     console.log('Signing in with Google:', user);
      
  //     // For now, we'll create a mock user since Supabase Google auth requires backend configuration
  //     const mockUser: Utente = {
  //       id: user.id,
  //       ruolo: 'tenant', // Default role
  //       nome: user.name || 'Google User',
  //       email: user.email || `${user.id}@gmail.com`,
  //       verificato: true, // Google users are considered verified
  //       created_at: new Date().toISOString(),
  //       updated_at: new Date().toISOString(),
  //     };
      
  //     setUser(mockUser);
  //     console.log('Google user created:', mockUser);
      
  //     return { success: true, user: mockUser };
  //   } catch (error: any) {
  //     console.error('Google sign in error:', error);
  //     return { success: false, error: error.message };
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  return {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    uploadProfilePhoto,
    switchRole,
    completeOnboarding,
    getStoredRolePreference,
    checkExistingUsers,
    signInWithApple,
  };
};