import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
// import { GestureHandlerRootView } from 'react-native-gesture-handler'; // Temporarily disabled
import { View, StyleSheet, Alert, AppState, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import * as Updates from 'expo-updates';
import { BackHandler } from 'react-native';
// import 'react-native-reanimated'; // Temporarily disabled
import './global.css';
import { useSupabaseAuth } from './src/hooks/useSupabaseAuth';
import { Utente } from './src/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import screens
import LoginScreen from './screens/LoginScreen';
import OnboardingFlowScreen from './screens/OnboardingFlowScreen';
import RoleSwitchOnboardingScreen from './screens/RoleSwitchOnboardingScreen';
import HomeScreen from './screens/HomeScreen';
import PropertySwipeScreen from './screens/PropertySwipeScreen';
import LandlordSwipeScreen from './screens/LandlordSwipeScreen';
import MatchesScreen from './screens/MatchesScreen';
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
      
      // Force re-render of discover screen when role changes
      if (currentScreen === 'discover') {
        console.log('🔍 App.tsx - User role changed while on discover screen - forcing refresh');
        // Force a complete re-render by updating refresh key multiple times
        setRefreshKey(prev => prev + 1);
        setAppRefreshKey(prev => prev + 1);
        
        // Force multiple refreshes to ensure component re-renders
        setTimeout(() => {
          setRefreshKey(prev => prev + 1);
          setAppRefreshKey(prev => prev + 1);
        }, 50);
        setTimeout(() => {
          setRefreshKey(prev => prev + 1);
          setAppRefreshKey(prev => prev + 1);
        }, 100);
        setTimeout(() => {
          setRefreshKey(prev => prev + 1);
          setAppRefreshKey(prev => prev + 1);
        }, 200);
      }
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

  // Debug user state changes in App
  useEffect(() => {
    console.log('App - User state changed:', user);
  }, [user]);

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
      console.log('🔄 Current user before switch:', user);
      console.log('🔄 Current user role before switch:', user?.ruolo);
      
      // Show branded loading screen immediately
      setRoleSwitchLoading(true);
      setSwitchingToRole(newRole);
      setIsRoleSwitching(true);
      
      // Switch the role
      const result = await switchRole(newRole);
      if (result.success) {
        console.log('✅ Role switch successful, using hard reload...');
        console.log('✅ New user after switch:', result.user);
        console.log('✅ New user role after switch:', result.user?.ruolo);
        
        // Wait for state to propagate
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Force immediate refresh
        console.log('🔄 Performing immediate refresh...');
        setAppRefreshKey(prev => prev + 10000);
        setRefreshKey(prev => prev + 10000);
        
        // Reset loading states
        setRoleSwitchLoading(false);
        setSwitchingToRole(null);
        setIsRoleSwitching(false);
        
        // Force hard reload after a short delay
        setTimeout(async () => {
          try {
            console.log('🔄 Attempting hard reload...');
            await Updates.reloadAsync();
          } catch (error) {
            console.log('Hard reload failed, using fast refresh');
            // Force another refresh if hard reload fails
            setAppRefreshKey(prev => prev + 10000);
            setRefreshKey(prev => prev + 10000);
          }
        }, 1000);
      } else {
        console.error('Role switch failed:', result.error);
        // Reset loading states on failure
        setRoleSwitchLoading(false);
        setSwitchingToRole(null);
        setIsRoleSwitching(false);
      }
    } catch (error) {
      console.error('Role switch error:', error);
      // Reset loading states on error
      setRoleSwitchLoading(false);
      setSwitchingToRole(null);
      setIsRoleSwitching(false);
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
        console.log('🔄 Current user role before navigation:', user?.userType || user?.ruolo);
        console.log('🔄 Current user object before navigation:', user);
        console.log('🔄 Auth loading state:', authLoading);
        console.log('🔄 User exists:', !!user);
        
        // Reset role switching states when navigating to discover
        setIsRoleSwitching(false);
        setRoleSwitchLoading(false);
        setSwitchingToRole(null);
        
        // Set screen first
        console.log('🔄 Setting currentScreen to discover');
        setCurrentScreen('discover');
        console.log('🔄 Current screen after setCurrentScreen:', currentScreen);
        
        // Force multiple refreshes
        setRefreshKey(prev => prev + 1000);
        setAppRefreshKey(prev => prev + 1000);
        
        // Force additional refreshes after navigation
        setTimeout(() => {
          console.log('🔄 First timeout refresh');
          setRefreshKey(prev => prev + 1000);
          setAppRefreshKey(prev => prev + 1000);
        }, 50);
        
        setTimeout(() => {
          console.log('🔄 Second timeout refresh');
          setRefreshKey(prev => prev + 1000);
          setAppRefreshKey(prev => prev + 1000);
        }, 100);
        
        setTimeout(() => {
          console.log('🔄 Third timeout refresh');
          setRefreshKey(prev => prev + 1000);
          setAppRefreshKey(prev => prev + 1000);
        }, 200);
        break;
      case 'matches':
        setCurrentScreen('matches');
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
  
  // Monitor user state changes
  useEffect(() => {
    console.log('App - User state changed:', { 
      user: !!user, 
      userRole: user?.userType || user?.ruolo,
      userName: user?.name || user?.nome,
      currentScreen, 
      shouldShowNavbar 
    });
    
    // Check if user role is correct
    if (user) {
      const userRole = user.userType || user.ruolo;
      console.log('🔍 User role check:', {
        userType: user.userType,
        ruolo: user.ruolo,
        finalRole: userRole,
        isTenant: userRole === 'tenant',
        isLandlord: userRole === 'landlord' || userRole === 'homeowner',
        roleType: typeof userRole
      });
      
      // Force refresh when role changes and we're on discover screen
      if (currentScreen === 'discover') {
        console.log('🔄 Role change detected on discover screen - forcing refresh');
        setRefreshKey(prev => prev + 1);
        setAppRefreshKey(prev => prev + 1);
      }
    }
  }, [user, currentScreen, shouldShowNavbar]);
  
  // Additional effect to force refresh when user role changes
  useEffect(() => {
    if (user && currentScreen === 'discover') {
      console.log('🔄 User role change detected - forcing complete refresh');
      console.log('🔄 New role:', user.ruolo);
      setRefreshKey(prev => prev + 1000);
      setAppRefreshKey(prev => prev + 1000);
      
      // Force additional refreshes
      setTimeout(() => {
        console.log('🔄 First role change refresh');
        setRefreshKey(prev => prev + 1000);
        setAppRefreshKey(prev => prev + 1000);
      }, 50);
      
      setTimeout(() => {
        console.log('🔄 Second role change refresh');
        setRefreshKey(prev => prev + 1000);
        setAppRefreshKey(prev => prev + 1000);
      }, 100);
    }
  }, [user?.ruolo, currentScreen]);
  
  // Debug logging
  console.log('App - Current screen:', currentScreen);
  console.log('App - User state:', !!user);
  console.log('App - User object:', user);
  console.log('App - Show bottom nav:', showBottomNav);
  console.log('App - Excluded screens check:', ['login', 'matches', 'settings', 'editProfile', 'help', 'preferences', 'filters'].includes(currentScreen));
  console.log('App - User role:', user?.ruolo);
  console.log('App - User name:', user?.nome);

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
    console.log('🔍 RENDERSCREEN - User role:', user?.userType || user?.ruolo);
    console.log('🔍 RENDERSCREEN - About to switch on currentScreen:', currentScreen);
    switch (currentScreen) {
      case 'login':
        return (
          <LoginScreen
            onLoginSuccess={async () => {
              console.log('Login success - navigating to home');
              setForceNavbar(true);
              // Small delay to ensure user state is set
              setTimeout(() => {
                setCurrentScreen('home');
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
            onLoginSuccess={() => {
              console.log('Login success - navigating to home');
              setForceNavbar(true);
              // Small delay to ensure user state is set
              setTimeout(() => {
                setCurrentScreen('home');
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
        return (
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
        );

      case 'discover':
        console.log('🔍 DISCOVER CASE - About to render discover screen');
        console.log('🔍 DISCOVER CASE - User role:', user?.userType || user?.ruolo);
        console.log('🔍 DISCOVER CASE - User exists:', !!user);
        console.log('🔍 DISCOVER CASE - User object:', user);
        console.log('🔍 DISCOVER CASE - Current screen state:', currentScreen);
        
        // SUPER SIMPLE TEST FIRST - Just return a basic screen
        return (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'green' }}>
            <Text style={{ fontSize: 30, color: 'white' }}>DISCOVER WORKS!</Text>
            <Text style={{ fontSize: 16, color: 'white', marginTop: 10 }}>
              User: {user?.name || 'No name'}
            </Text>
            <Text style={{ fontSize: 16, color: 'white', marginTop: 5 }}>
              Role: {user?.userType || user?.ruolo || 'No role'}
            </Text>
            <Text style={{ fontSize: 16, color: 'white', marginTop: 5 }}>
              Screen: {currentScreen}
            </Text>
            <TouchableOpacity 
              style={{ backgroundColor: 'white', padding: 10, marginTop: 20, borderRadius: 5 }}
              onPress={() => setCurrentScreen('home')}
            >
              <Text style={{ color: 'black' }}>Go to Home</Text>
            </TouchableOpacity>
          </View>
        );

      case 'matches':
        return (
          <MatchesScreen
            onNavigateBack={() => setCurrentScreen('discover')}
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

      default:
        return (
          <LoginScreen
            onLoginSuccess={() => {
              console.log('Login success - navigating to home');
              setForceNavbar(true);
              // Small delay to ensure user state is set
              setTimeout(() => {
                setCurrentScreen('home');
              }, 100);
            }}
            onNavigateToSignup={() => Alert.alert('Info', 'Registrazione sarà disponibile presto')}
          />
        );
    }
  };

  return (
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
              <>
                {console.log('Rendering BottomNavigation with:', { 
                  currentScreen: getCurrentNavScreen(), 
                  userRole: user?.userType || user?.ruolo, 
                  showContracts: (user?.userType || user?.ruolo) === 'landlord' || (user?.userType || user?.ruolo) === 'homeowner'
                })}
                <BottomNavigation
                  key={`navbar-${appRefreshKey}`}
                  currentScreen={getCurrentNavScreen()}
                  onNavigate={handleNavigation}
                  showContracts={(user?.userType || user?.ruolo) === 'landlord' || (user?.userType || user?.ruolo) === 'homeowner'}
                  userRole={user?.userType || user?.ruolo}
                />
              </>
            )}
          </>
        )}
      </View>
      <StatusBar style="dark" />
    </SafeAreaProvider>
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