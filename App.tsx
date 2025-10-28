import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
// import { GestureHandlerRootView } from 'react-native-gesture-handler'; // Temporarily disabled
import { View, StyleSheet, Alert, AppState, ActivityIndicator, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Updates from 'expo-updates';
import { BackHandler } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-reanimated';
import './global.css';
import { useSupabaseAuth } from './src/hooks/useSupabaseAuth';
import { Utente } from './src/types';
import { initializeStripe } from './src/config/stripe';
import { logger } from './src/utils/logger';
import { StripeProvider } from '@stripe/stripe-react-native';

// Import screens
import LoginScreen from './screens/LoginScreen';
import OnboardingFlowScreen from './screens/OnboardingFlowScreen';
import RoleSwitchOnboardingScreen from './screens/RoleSwitchOnboardingScreen';
import HomeScreen from './screens/HomeScreen';
import LandlordHomeScreen from './screens/LandlordHomeScreen';
import PropertySwipeScreen from './screens/PropertySwipeScreen';

// Test if PropertySwipeScreen is imported correctly
console.log('🔍 App.tsx - PropertySwipeScreen imported:', typeof PropertySwipeScreen);
import LandlordSwipeScreen from './screens/LandlordSwipeScreen';
import MatchesScreen from './screens/MatchesScreen';
import MessagesScreen from './screens/MessagesScreen';
import LeMieBolletteScreen from './screens/LeMieBolletteScreen';
import PagamentoScreen from './screens/PagamentoScreen';
import GestioneImmobiliScreen from './screens/GestioneImmobiliScreen';
import DocumentiScreen from './screens/DocumentiScreen';
import ProfiloScreen from './screens/ProfiloScreen';
import SettingsScreen from './screens/SettingsScreen';
import EditProfileScreen from './screens/EditProfileScreen';
import HelpCenterScreen from './screens/HelpCenterScreen';
import HomeownerOnboardingScreen from './screens/HomeownerOnboardingScreen';
import ContractSignatureScreen from './screens/ContractSignatureScreen';
import PreferencesScreen from './screens/PreferencesScreen';
import FiltersScreen from './screens/FiltersScreen';
import BottomNavigation from './components/BottomNavigation';
import SplashScreen from './components/SplashScreen';
import RoleSwitchLoadingScreen from './components/RoleSwitchLoadingScreen';

type Screen = 
  | 'login'
  | 'onboarding'
  | 'homeownerOnboarding'
  | 'home'
  | 'discover'
  | 'matches'
  | 'bollette'
  | 'pagamento'
  | 'immobili'
  | 'documenti'
  | 'profilo'
  | 'settings'
  | 'editProfile'
  | 'help'
  | 'preferences'
  | 'filters'
  | 'contractSignature';

type NavScreen = 'home' | 'discover' | 'matches' | 'bollette' | 'immobili' | 'profilo';

interface PaymentData {
  billId: string;
  importo: number;
  categoria: string;
}

export default function App() {
  const { user, loading: authLoading, signIn, signUp, signOut, switchRole, completeOnboarding } = useSupabaseAuth();
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Debug user loading and role changes
  useEffect(() => {
    console.log('🔍 App.tsx - User state changed:', user);
    console.log('🔍 App.tsx - Auth loading:', authLoading);
    if (user) {
      const userRole = user.userType || user.ruolo;
      console.log('🔍 App.tsx - User role from userType:', user.userType);
      console.log('🔍 App.tsx - User role from ruolo:', user.ruolo);
      console.log('🔍 App.tsx - Final user role:', userRole);
      console.log('🔍 App.tsx - Current screen:', currentScreen);
    }
  }, [user?.userType, user?.ruolo, authLoading, currentScreen]);
  const [showHomeownerOnboarding, setShowHomeownerOnboarding] = useState(false);
  const [forceNavbar, setForceNavbar] = useState(false);
  const [roleSwitchTarget, setRoleSwitchTarget] = useState<'tenant' | 'landlord' | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isRoleSwitching, setIsRoleSwitching] = useState(false);
  const [appRefreshKey, setAppRefreshKey] = useState(0);
  const [roleSwitchLoading, setRoleSwitchLoading] = useState(false);
  const [switchingToRole, setSwitchingToRole] = useState<'tenant' | 'landlord' | null>(null);
  
  // NEW: Centralized role state management - derive from user directly
  const currentRole = user ? (
    user.userType === 'homeowner' || user.ruolo === 'homeowner' ? 'landlord' : 
    user.userType || user.ruolo
  ) : null;

  // Debug user state changes in App
  useEffect(() => {
    console.log('App - User state changed:', user);
    console.log('App - Derived currentRole:', currentRole);
  }, [user, currentRole]);

  useEffect(() => {
    // Initialize app
    initializeApp();
  }, []);

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  const initializeApp = async () => {
    try {
      // Wait for auth to load
      if (authLoading) {
        return;
      }

      // Check if user has completed onboarding from AsyncStorage
      const onboardingCompleted = await AsyncStorage.getItem('onboarding_completed');
      const hasCompleted = onboardingCompleted === 'true';
      setHasCompletedOnboarding(hasCompleted);

      console.log('Initializing app with user:', !!user);

      if (user) {
        // User is logged in, check if they need onboarding
        console.log('User found, checking onboarding status:', hasCompleted);
        if (!hasCompleted) {
          setCurrentScreen('onboarding');
        } else {
          setCurrentScreen('home');
        }
      } else {
        // No user, show login
        console.log('No user found, showing login');
        setCurrentScreen('login');
      }
    } catch (error) {
      console.error('Error initializing app:', error);
      setCurrentScreen('login');
    } finally {
      setIsLoading(false);
      setIsInitialized(true);
    }
  };

  // Re-initialize when auth state changes
  useEffect(() => {
    if (isInitialized) {
      initializeApp();
    }
  }, [user, authLoading]);

  const handleLogin = async (email: string, password: string) => {
    try {
      const result = await signIn(email, password);
      if (result.success) {
        // Check if user has completed onboarding
        const onboardingCompleted = await AsyncStorage.getItem('onboarding_completed');
        const hasCompleted = onboardingCompleted === 'true';
        
        if (hasCompleted) {
          setCurrentScreen('home');
        } else {
          setCurrentScreen('onboarding');
        }
      } else {
        Alert.alert('Errore', result.error || 'Email o password non corretti');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Errore', 'Errore durante il login. Riprova.');
    }
  };

  const handleSignup = async (email: string, password: string, nome: string, ruolo: 'tenant' | 'landlord') => {
    try {
      const result = await signUp(email, password, nome, ruolo);
      if (result.success) {
        setCurrentScreen('onboarding');
      } else {
        Alert.alert('Errore', result.error || 'Errore durante la registrazione');
      }
    } catch (error) {
      console.error('Signup error:', error);
      Alert.alert('Errore', 'Errore durante la registrazione. Riprova.');
    }
  };

  const handleLogout = async () => {
    try {
      console.log('Starting logout process...');
      await signOut();
      
      // Clear all local state
      setHasCompletedOnboarding(false);
      setPaymentData(null);
      setCurrentScreen('login');
      
      console.log('Logout completed successfully');
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Errore', 'Errore durante il logout');
    }
  };

  const handleRoleSwitch = async (newRole: 'tenant' | 'landlord') => {
    try {
      console.log('🔄 Starting role switch to:', newRole);
      
      // Switch the role in the user object
      const result = await switchRole(newRole);
      console.log('🔄 switchRole result:', result.success ? 'success' : 'failed');
      
      if (result.success) {
        console.log('✅ Role switch successful');
        
        // Force refresh to ensure UI updates
        setRefreshKey(prev => prev + 1);
        setAppRefreshKey(prev => prev + 1);
        
        // Navigate to home to see the changes
        setCurrentScreen('home');
        
      } else {
        console.error('❌ Role switch failed:', result.error);
        Alert.alert('Errore', result.error || 'Impossibile cambiare account');
      }
    } catch (error) {
      console.error('❌ Role switch error:', error);
      Alert.alert('Errore', 'Impossibile cambiare account');
    }
  };

  const handleRoleSwitchTimeout = () => {
    console.log('🔄 Role switch timeout, using fast refresh...');
    setAppRefreshKey(prev => prev + 10000);
    setRefreshKey(prev => prev + 10000);
    setRoleSwitchLoading(false);
    setSwitchingToRole(null);
    setIsRoleSwitching(false);
  };

  const handleHomeownerOnboardingComplete = async (preferences: any, filters: any, firstListing: any) => {
    try {
      // Complete the onboarding
      const result = await completeOnboarding('landlord');
      if (result.success) {
        setShowHomeownerOnboarding(false);
        setCurrentScreen('home');
        // TODO: Save preferences, filters, and create first listing
        console.log('Homeowner onboarding completed with:', { preferences, filters, firstListing });
      }
    } catch (error) {
      console.error('Homeowner onboarding completion error:', error);
    }
  };

  const handleNavigation = (screen: NavScreen) => {
    console.log('🚀 handleNavigation called with screen:', screen);
    console.log('🚀 Current currentScreen state:', currentScreen);
    console.log('🚀 User exists:', !!user);
    console.log('🚀 User role:', user?.userType || user?.ruolo);
    console.log('🚀 User object:', user);
    console.log('🚀 handleNavigation - About to set currentScreen to:', screen);
    
    // Prevent tenants from accessing landlord-only screens
    const userRole = user?.userType || user?.ruolo;
    if (screen === 'immobili' && userRole !== 'landlord' && userRole !== 'homeowner') {
      console.log('🚫 Tenant attempted to access Immobili screen - blocked');
      return;
    }
    
    switch (screen) {
      case 'home':
        setCurrentScreen('home');
        break;
      case 'discover':
        console.log('🔄 NAVIGATING TO DISCOVER SCREEN');
        console.log('🔄 Current role:', currentRole);
        console.log('🔄 User exists:', !!user);
        
        // Reset role switching states when navigating to discover
        setIsRoleSwitching(false);
        setRoleSwitchLoading(false);
        setSwitchingToRole(null);
        
        // Force refresh to ensure UI updates
        setRefreshKey(prev => prev + 1);
        setAppRefreshKey(prev => prev + 1);
        
        setCurrentScreen('discover');
        break;
      case 'matches':
        setCurrentScreen('matches');
        break;
      case 'messages':
        setCurrentScreen('messages');
        break;
      case 'bollette':
        setCurrentScreen('bollette');
        break;
      case 'immobili':
        setCurrentScreen('immobili');
        break;
      case 'profilo':
        setCurrentScreen('profilo');
        break;
      case 'filters':
        setCurrentScreen('filters');
        break;
    }
  };

  const getCurrentNavScreen = (): NavScreen => {
    switch (currentScreen) {
      case 'home':
        return 'home';
      case 'discover':
        return 'discover';
      case 'matches':
        return 'matches';
      case 'messages':
        return 'messages';
      case 'bollette':
      case 'pagamento':
        return 'bollette';
      case 'immobili':
        return 'immobili';
      case 'profilo':
      case 'documenti':
        return 'profilo';
      default:
        return 'home';
    }
  };

  const showBottomNav = user && !['login', 'settings', 'editProfile', 'help', 'preferences', 'filters'].includes(currentScreen);
  
  // Additional check for home screen
  const shouldShowNavbar = showBottomNav || (currentScreen === 'home' && user) || forceNavbar;
  console.log('App - Should show navbar:', shouldShowNavbar);
  
  // Simplified user state monitoring (no more complex refresh logic)
  useEffect(() => {
    console.log('App - User state changed:', { 
      user: !!user, 
      currentRole,
      userName: user?.name || user?.nome,
      currentScreen
    });
  }, [user, currentRole, currentScreen]);
  
  // Force refresh when currentRole changes - DISABLED TO PREVENT INFINITE LOOP
  // useEffect(() => {
  //   if (currentRole) {
  //     console.log('🔄 currentRole changed to:', currentRole, '- forcing refresh');
  //     setRefreshKey(prev => prev + 1);
  //     setAppRefreshKey(prev => prev + 1);
  //   }
  // }, [currentRole]);
  
  // Debug logging
  console.log('App - Current screen:', currentScreen);
  console.log('App - User state:', !!user);
  console.log('App - Current role:', currentRole);
  console.log('App - Show bottom nav:', showBottomNav);
  console.log('App - Excluded screens check:', ['login', 'matches', 'settings', 'editProfile', 'help', 'preferences', 'filters'].includes(currentScreen));

  // Show loading screen while initializing
  if (showSplash) {
    return <SplashScreen onAnimationFinish={handleSplashFinish} />;
  }

    // Show role switch loading screen
    if (roleSwitchLoading && switchingToRole) {
      return <RoleSwitchLoadingScreen newRole={switchingToRole} onTimeout={handleRoleSwitchTimeout} />;
    }

  if (isLoading || authLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Caricamento...</Text>
      </View>
    );
  }

  const renderScreen = () => {
    console.log('🔍 RENDERSCREEN - Current screen:', currentScreen);
    console.log('🔍 RENDERSCREEN - User exists:', !!user);
    console.log('🔍 RENDERSCREEN - Current role:', currentRole);
    console.log('🔍 RENDERSCREEN - About to switch on currentScreen:', currentScreen);
    switch (currentScreen) {
      case 'login':
        return (
          <LoginScreen
            onLoginSuccess={async () => {
              console.log('Login success - checking onboarding status');
              setForceNavbar(true);
              // Check if user has completed onboarding
              const onboardingCompleted = await AsyncStorage.getItem('onboarding_completed');
              const hasCompleted = onboardingCompleted === 'true';
              
              // Small delay to ensure user state is set
              setTimeout(() => {
                if (hasCompleted) {
                  console.log('Onboarding completed, navigating to home');
                  setCurrentScreen('home');
                } else {
                  console.log('Onboarding not completed, navigating to onboarding');
                  setCurrentScreen('onboarding');
                }
              }, 100);
            }}
            onNavigateToSignup={() => Alert.alert('Info', 'Registrazione sarà disponibile presto')}
          />
        );

      case 'onboarding':
        return user ? (
          roleSwitchTarget ? (
            <RoleSwitchOnboardingScreen
              user={user}
              targetRole={roleSwitchTarget}
              onComplete={async () => {
                try {
                  // Mark role-specific onboarding as completed
                  await AsyncStorage.setItem(`${roleSwitchTarget}_onboarding_completed`, 'true');
                  setRoleSwitchTarget(null);
                  setCurrentScreen('discover');
                } catch (error) {
                  console.error('Error saving role switch onboarding completion:', error);
                  setRoleSwitchTarget(null);
                  setCurrentScreen('discover');
                }
              }}
              onSkip={() => {
                setRoleSwitchTarget(null);
                setCurrentScreen('discover');
              }}
            />
          ) : (
            <OnboardingFlowScreen
              user={user}
              onComplete={async () => {
                try {
                  // Save onboarding completion to AsyncStorage
                  await AsyncStorage.setItem('onboarding_completed', 'true');
                  setHasCompletedOnboarding(true);
                  setCurrentScreen('home');
                } catch (error) {
                  console.error('Error saving onboarding completion:', error);
                  setHasCompletedOnboarding(true);
                  setCurrentScreen('home');
                }
              }}
            />
          )
        ) : (
          <LoginScreen
            onLoginSuccess={async () => {
              console.log('Login success - checking onboarding status');
              setForceNavbar(true);
              // Check if user has completed onboarding
              const onboardingCompleted = await AsyncStorage.getItem('onboarding_completed');
              const hasCompleted = onboardingCompleted === 'true';
              
              // Small delay to ensure user state is set
              setTimeout(() => {
                if (hasCompleted) {
                  console.log('Onboarding completed, navigating to home');
                  setCurrentScreen('home');
                } else {
                  console.log('Onboarding not completed, navigating to onboarding');
                  setCurrentScreen('onboarding');
                }
              }, 100);
            }}
            onNavigateToSignup={() => Alert.alert('Info', 'Registrazione sarà disponibile presto')}
          />
        );

      case 'homeownerOnboarding':
        return user ? (
          <HomeownerOnboardingScreen
            user={user}
            onComplete={handleHomeownerOnboardingComplete}
            onBack={() => {
              setShowHomeownerOnboarding(false);
              setCurrentScreen('home');
            }}
          />
        ) : null;

      case 'home':
        // Use LandlordHomeScreen for landlords, HomeScreen for tenants
        if (currentRole === 'landlord' || currentRole === 'homeowner') {
          return (
            <View style={{ flex: 1 }}>
              <LandlordHomeScreen
                onNavigateToBills={() => setCurrentScreen('bollette')}
                onNavigateToPayments={() => setCurrentScreen('bollette')}
                onNavigateToProfile={() => setCurrentScreen('profilo')}
                onNavigateToNotifications={() => {
                  // TODO: Implement notifications screen
                  Alert.alert('Info', 'Schermata notifiche in arrivo');
                }}
                onNavigateToHelp={() => setCurrentScreen('help')}
                onNavigateToContracts={() => setCurrentScreen('documenti')}
                onNavigateToContractSignature={() => setCurrentScreen('contractSignature')}
                onNavigateToProperties={() => setCurrentScreen('properties')}
                onNavigateToTenants={() => setCurrentScreen('tenants')}
                onNavigateToIncome={() => setCurrentScreen('income')}
              />
            </View>
          );
        } else {
          return (
            <View style={{ flex: 1 }}>
              <HomeScreen
                onNavigateToBills={() => setCurrentScreen('bollette')}
                onNavigateToPayments={() => setCurrentScreen('bollette')}
                onNavigateToProfile={() => setCurrentScreen('profilo')}
                onNavigateToNotifications={() => {
                  // TODO: Implement notifications screen
                  Alert.alert('Info', 'Schermata notifiche in arrivo');
                }}
                onNavigateToHelp={() => setCurrentScreen('help')}
                onNavigateToContracts={() => setCurrentScreen('documenti')}
                onNavigateToContractSignature={() => setCurrentScreen('contractSignature')}
              />
            </View>
          );
        }

      case 'discover':
        console.log('🔍 DISCOVER CASE - About to render discover screen');
        console.log('🔍 DISCOVER CASE - Current role:', currentRole);
        console.log('🔍 DISCOVER CASE - User exists:', !!user);
        
        // Show loading if auth is still loading or user is not available
        if (authLoading || !user) {
          console.log('🔍 DISCOVER CASE - Showing loading screen');
          return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }}>
              <ActivityIndicator size="large" color="#2196F3" />
              <Text style={{ fontSize: 16, color: '#666', marginTop: 20 }}>
                Caricamento...
              </Text>
            </View>
          );
        }

        // Show appropriate content based on centralized role
        console.log('🔍 DISCOVER CASE - Using currentRole:', currentRole);
        
        if (currentRole === 'tenant') {
          console.log('🔍 DISCOVER CASE - Rendering PropertySwipeScreen for tenant');
          
          return (
            <PropertySwipeScreen
              key={`property-swipe-${currentRole}-${user?.id}-${refreshKey}`}
              onNavigateToMatches={() => setCurrentScreen('matches')}
              onNavigateToProfile={() => setCurrentScreen('profilo')}
              onNavigateToDiscover={() => setCurrentScreen('discover')}
              onNavigateToOnboarding={(role) => setCurrentScreen('onboarding')}
              onRoleSwitch={handleRoleSwitch}
            />
          );
        } else if (currentRole === 'landlord') {
          console.log('🔍 DISCOVER CASE - Rendering LandlordSwipeScreen for landlord');
          
          return (
            <LandlordSwipeScreen
              key={`landlord-swipe-${currentRole}-${user?.id}-${refreshKey}`}
              onNavigateToMatches={() => setCurrentScreen('matches')}
              onNavigateToProfile={() => setCurrentScreen('profilo')}
              onNavigateToDiscover={() => setCurrentScreen('discover')}
              onNavigateToOnboarding={(role) => setCurrentScreen('onboarding')}
              onRoleSwitch={handleRoleSwitch}
            />
          );
        } else {
          console.log('🔍 DISCOVER CASE - Unknown role, showing fallback');
          console.log('🔍 DISCOVER CASE - currentRole value:', currentRole);
          console.log('🔍 DISCOVER CASE - currentRole === undefined:', currentRole === undefined);
          console.log('🔍 DISCOVER CASE - currentRole === null:', currentRole === null);
          
          // Show a simple fallback screen
          return (
            <SafeAreaView style={{ flex: 1, backgroundColor: '#fff3cd' }}>
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: 24, color: '#856404', marginBottom: 20 }}>
                  ⚠️ FALLBACK SCREEN
                </Text>
                <Text style={{ fontSize: 16, color: '#666', marginBottom: 10 }}>
                  Current role: {currentRole || 'undefined'}
                </Text>
                <Text style={{ fontSize: 14, color: '#666', marginBottom: 10 }}>
                  This is a fallback screen
                </Text>
                <TouchableOpacity 
                  style={{ backgroundColor: '#ffc107', padding: 15, borderRadius: 8, marginTop: 20 }}
                  onPress={() => {
                    console.log('🔍 FALLBACK - Button pressed');
                    Alert.alert('Fallback', 'Fallback screen is working!');
                  }}
                >
                  <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
                    Fallback Button
                  </Text>
                </TouchableOpacity>
              </View>
            </SafeAreaView>
          );
        }

      case 'matches':
        return (
          <MatchesScreen
            onNavigateBack={() => setCurrentScreen('discover')}
          />
        );

      case 'messages':
        return (
          <MessagesScreen
            onNavigateBack={() => setCurrentScreen('home')}
          />
        );

      case 'bollette':
        return (
          <LeMieBolletteScreen
            onNavigateToPayment={(billId, importo, categoria) => {
              setPaymentData({ billId, importo, categoria });
              setCurrentScreen('pagamento');
            }}
            onBack={() => setCurrentScreen('home')}
          />
        );

      case 'pagamento':
        return paymentData ? (
          <PagamentoScreen
            billId={paymentData.billId}
            importo={paymentData.importo}
            categoria={paymentData.categoria}
            onPaymentSuccess={() => {
              setPaymentData(null);
              setCurrentScreen('bollette');
            }}
            onBack={() => {
              setPaymentData(null);
              setCurrentScreen('bollette');
            }}
          />
        ) : (
          <HomeScreen
            onNavigateToBills={() => setCurrentScreen('bollette')}
            onNavigateToPayments={() => setCurrentScreen('bollette')}
            onNavigateToProfile={() => setCurrentScreen('profilo')}
            onNavigateToNotifications={() => {
              Alert.alert('Info', 'Schermata notifiche in arrivo');
            }}
            onNavigateToHelp={() => setCurrentScreen('help')}
            onNavigateToContracts={() => setCurrentScreen('documenti')}
            onNavigateToContractSignature={() => setCurrentScreen('contractSignature')}
          />
        );

      case 'immobili':
        return (
          <GestioneImmobiliScreen
            onNavigateToPropertyDetails={(propertyId) => {
              // TODO: Implement property details screen
              Alert.alert('Info', `Dettagli immobile ${propertyId} in arrivo`);
            }}
            onNavigateToAddProperty={() => {
              // TODO: Implement add property screen
              Alert.alert('Info', 'Aggiungi immobile in arrivo');
            }}
            onBack={() => setCurrentScreen('home')}
          />
        );

      case 'documenti':
        return (
          <DocumentiScreen
            onBack={() => setCurrentScreen('profilo')}
          />
        );

      case 'profilo':
        return (
          <ProfiloScreen
            onNavigateToEditProfile={() => setCurrentScreen('editProfile')}
            onNavigateToVerification={() => {
              // TODO: Implement verification screen
              Alert.alert('Info', 'Verifica identità in arrivo');
            }}
            onNavigateToDocuments={() => setCurrentScreen('documenti')}
            onNavigateToSettings={() => setCurrentScreen('settings')}
            onLogout={handleLogout}
            onBack={() => setCurrentScreen('home')}
            onRoleSwitch={handleRoleSwitch}
          />
        );

      case 'settings':
        return (
          <SettingsScreen
            onNavigateBack={() => setCurrentScreen('profilo')}
            onLogout={handleLogout}
          />
        );

      case 'editProfile':
        return (
          <EditProfileScreen
            onNavigateBack={() => setCurrentScreen('profilo')}
          />
        );

      case 'help':
        return (
          <HelpCenterScreen
            onNavigateBack={() => setCurrentScreen('home')}
          />
        );

      case 'contractSignature':
        return (
          <ContractSignatureScreen
            onBack={() => setCurrentScreen('home')}
            contractId="contract-123"
          />
        );

      case 'preferences':
        return (
          <PreferencesScreen
            onNavigateBack={() => setCurrentScreen('profilo')}
          />
        );

      case 'filters':
        return (
          <FiltersScreen
            onNavigateBack={() => setCurrentScreen('discover')}
          />
        );

      case 'properties':
        return (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }}>
            <MaterialIcons name="business" size={64} color="#2196F3" />
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#333', marginTop: 20 }}>
              Gestione Proprietà
            </Text>
            <Text style={{ fontSize: 16, color: '#666', marginTop: 10, textAlign: 'center', paddingHorizontal: 20 }}>
              Questa schermata sarà disponibile presto per gestire le tue proprietà.
            </Text>
            <TouchableOpacity 
              style={{ backgroundColor: '#2196F3', padding: 15, borderRadius: 8, marginTop: 30 }}
              onPress={() => setCurrentScreen('home')}
            >
              <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
                Torna alla Home
              </Text>
            </TouchableOpacity>
          </View>
        );

      case 'tenants':
        return (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }}>
            <MaterialIcons name="people" size={64} color="#2196F3" />
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#333', marginTop: 20 }}>
              Gestione Inquilini
            </Text>
            <Text style={{ fontSize: 16, color: '#666', marginTop: 10, textAlign: 'center', paddingHorizontal: 20 }}>
              Questa schermata sarà disponibile presto per gestire i tuoi inquilini.
            </Text>
            <TouchableOpacity 
              style={{ backgroundColor: '#2196F3', padding: 15, borderRadius: 8, marginTop: 30 }}
              onPress={() => setCurrentScreen('home')}
            >
              <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
                Torna alla Home
              </Text>
            </TouchableOpacity>
          </View>
        );

      case 'income':
        return (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }}>
            <MaterialIcons name="receipt" size={64} color="#2196F3" />
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#333', marginTop: 20 }}>
              Gestione Entrate
            </Text>
            <Text style={{ fontSize: 16, color: '#666', marginTop: 10, textAlign: 'center', paddingHorizontal: 20 }}>
              Questa schermata sarà disponibile presto per visualizzare le tue entrate.
            </Text>
            <TouchableOpacity 
              style={{ backgroundColor: '#2196F3', padding: 15, borderRadius: 8, marginTop: 30 }}
              onPress={() => setCurrentScreen('home')}
            >
              <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
                Torna alla Home
              </Text>
            </TouchableOpacity>
          </View>
        );

      default:
        return (
          <LoginScreen
            onLoginSuccess={async () => {
              console.log('Login success - checking onboarding status');
              setForceNavbar(true);
              // Check if user has completed onboarding
              const onboardingCompleted = await AsyncStorage.getItem('onboarding_completed');
              const hasCompleted = onboardingCompleted === 'true';
              
              // Small delay to ensure user state is set
              setTimeout(() => {
                if (hasCompleted) {
                  console.log('Onboarding completed, navigating to home');
                  setCurrentScreen('home');
                } else {
                  console.log('Onboarding not completed, navigating to onboarding');
                  setCurrentScreen('onboarding');
                }
              }, 100);
            }}
            onNavigateToSignup={() => Alert.alert('Info', 'Registrazione sarà disponibile presto')}
          />
        );
    }
  };

  return (
    <StripeProvider
      publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY!}
      merchantIdentifier="merchant.com.mytenant.tenantapp"
      urlScheme="tenant"
    >
      <SafeAreaProvider key={`app-${appRefreshKey}`}>
        <View style={styles.container} key={`container-${appRefreshKey}`}>
          {showHomeownerOnboarding ? (
            <HomeownerOnboardingScreen
              user={user!}
              onComplete={handleHomeownerOnboardingComplete}
              onBack={() => {
                setShowHomeownerOnboarding(false);
                setCurrentScreen('home');
              }}
            />
          ) : (
            <>
              {renderScreen()}
              {shouldShowNavbar && (
                <BottomNavigation
                  key={`navbar-${currentRole}-${refreshKey}`}
                  currentScreen={getCurrentNavScreen()}
                  onNavigate={handleNavigation}
                  showContracts={currentRole === 'landlord'}
                  userRole={currentRole || 'tenant'}
                />
              )}
            </>
          )}
        </View>
        <StatusBar style="dark" />
      </SafeAreaProvider>
    </StripeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
});
