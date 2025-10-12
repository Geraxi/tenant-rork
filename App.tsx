import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View, StyleSheet, Alert } from 'react-native';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import ProfileSetupScreen, { ProfileData } from './screens/ProfileSetupScreen';
import IDVerificationScreen from './screens/IDVerificationScreen';
import TenantPreferencesScreen from './screens/TenantPreferencesScreen';
import PreferencesScreen from './screens/PreferencesScreen';
import HomeScreen from './screens/HomeScreen';
import MatchesScreen from './screens/MatchesScreen';
import ChatScreen from './screens/ChatScreen';
import ProfileScreen from './screens/ProfileScreen';
import VerificationScreen from './screens/VerificationScreen';
import ContractsScreen from './screens/ContractsScreen';
import CreateContractScreen from './screens/CreateContractScreen';
import BottomNavigation from './components/BottomNavigation';
import { User, UserType } from './types';

type Screen = 
  | 'login'
  | 'signup'
  | 'onboarding' 
  | 'profileSetup'
  | 'idVerification'
  | 'preferences' 
  | 'home' 
  | 'matches' 
  | 'chat'
  | 'profile' 
  | 'verification'
  | 'contracts'
  | 'createContract';

type NavScreen = 'browse' | 'matches' | 'messages' | 'contracts' | 'profile';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedUserType, setSelectedUserType] = useState<UserType | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<User | null>(null);
  const [tempProfileData, setTempProfileData] = useState<ProfileData | null>(null);
  const [tempIdData, setTempIdData] = useState<{ idDocument: string; selfie: string } | null>(null);

  const handleLogin = (email: string, password: string) => {
    // Simulate login
    Alert.alert('Successo', 'Login effettuato con successo!');
    setCurrentScreen('onboarding');
  };

  const handleSignup = (email: string, password: string) => {
    // Simulate signup
    Alert.alert('Successo', 'Registrazione completata!');
    setCurrentScreen('onboarding');
  };

  const handleSocialAuth = (provider: string) => {
    Alert.alert('Info', `${provider} auth sarà disponibile presto!`);
  };

  const handleOnboardingComplete = (userType: UserType) => {
    setSelectedUserType(userType);
    setCurrentScreen('profileSetup');
  };

  const handleProfileSetupComplete = (profileData: ProfileData) => {
    setTempProfileData(profileData);
    setCurrentScreen('idVerification');
  };

  const handleIDVerificationComplete = (idDocument: string, selfie: string) => {
    setTempIdData({ idDocument, selfie });
    setCurrentScreen('preferences');
  };

  // Helper function to calculate age from date of birth
  const calculateAge = (dateOfBirth: string): number => {
    // dateOfBirth format: DD/MM/YYYY
    const parts = dateOfBirth.split('/');
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
    const year = parseInt(parts[2], 10);
    
    const birthDate = new Date(year, month, day);
    const today = new Date();
    
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const handlePreferencesComplete = (preferences: any) => {
    if (tempProfileData && tempIdData && selectedUserType) {
      const age = calculateAge(tempProfileData.dateOfBirth);
      
      const newUser: User = {
        id: 'current-user',
        name: tempProfileData.name,
        email: 'user@example.com',
        phone: tempProfileData.phone,
        userType: selectedUserType,
        age: age,
        dateOfBirth: tempProfileData.dateOfBirth,
        bio: tempProfileData.bio,
        photos: tempProfileData.photos,
        location: tempProfileData.location,
        verified: 'verified',
        idVerified: true,
        backgroundCheckPassed: true,
        preferences,
        idDocument: tempIdData.idDocument,
        selfiePhoto: tempIdData.selfie,
        createdAt: Date.now(),
      };
      setCurrentUser(newUser);
      setCurrentScreen('home');
    }
  };

  const handleVerificationComplete = () => {
    if (currentUser) {
      setCurrentUser({
        ...currentUser,
        verified: 'verified',
        idVerified: true,
        backgroundCheckPassed: true,
      });
    }
    setCurrentScreen('profile');
  };

  const handleNavigation = (screen: NavScreen) => {
    const screenMap: Record<NavScreen, Screen> = {
      browse: 'home',
      matches: 'matches',
      messages: 'matches',
      contracts: 'contracts',
      profile: 'profile',
    };
    setCurrentScreen(screenMap[screen]);
  };

  const getCurrentNavScreen = (): NavScreen => {
    if (currentScreen === 'home') return 'browse';
    if (currentScreen === 'matches' || currentScreen === 'chat') return 'matches';
    if (currentScreen === 'contracts' || currentScreen === 'createContract') return 'contracts';
    if (currentScreen === 'profile' || currentScreen === 'verification') return 'profile';
    return 'browse';
  };

  const showBottomNav = currentUser && !['login', 'signup', 'onboarding', 'profileSetup', 'idVerification', 'preferences', 'chat', 'verification', 'createContract'].includes(currentScreen);

  const renderScreen = () => {
    switch (currentScreen) {
      case 'login':
        return (
          <LoginScreen
            onLogin={handleLogin}
            onGoogleLogin={() => handleSocialAuth('Google')}
            onAppleLogin={() => handleSocialAuth('Apple')}
            onNavigateToSignup={() => setCurrentScreen('signup')}
          />
        );
      
      case 'signup':
        return (
          <SignupScreen
            onSignup={handleSignup}
            onGoogleSignup={() => handleSocialAuth('Google')}
            onAppleSignup={() => handleSocialAuth('Apple')}
            onNavigateToLogin={() => setCurrentScreen('login')}
          />
        );
      
      case 'onboarding':
        return <OnboardingScreen onComplete={handleOnboardingComplete} />;
      
      case 'profileSetup':
        return selectedUserType ? (
          <ProfileSetupScreen
            userType={selectedUserType}
            onComplete={handleProfileSetupComplete}
            onBack={() => setCurrentScreen('onboarding')}
          />
        ) : null;
      
      case 'idVerification':
        return (
          <IDVerificationScreen
            onComplete={handleIDVerificationComplete}
            onBack={() => setCurrentScreen('profileSetup')}
          />
        );
      
      case 'preferences':
        return selectedUserType === 'tenant' ? (
          <TenantPreferencesScreen
            onComplete={handlePreferencesComplete}
            onBack={() => setCurrentScreen('idVerification')}
          />
        ) : selectedUserType ? (
          <PreferencesScreen 
            userType={selectedUserType}
            onComplete={handlePreferencesComplete}
          />
        ) : null;
      
      case 'home':
        return currentUser ? (
          <HomeScreen
            currentUser={currentUser}
            onNavigateToMatches={() => setCurrentScreen('matches')}
            onNavigateToProfile={() => setCurrentScreen('profile')}
            onNavigateToContracts={() => setCurrentScreen('contracts')}
          />
        ) : null;
      
      case 'matches':
        return (
          <MatchesScreen
            onBack={() => setCurrentScreen('home')}
            onSelectMatch={(match) => {
              setSelectedMatch(match.user);
              setCurrentScreen('chat');
            }}
          />
        );
      
      case 'chat':
        return selectedMatch && currentUser ? (
          <ChatScreen
            match={selectedMatch}
            currentUserId={currentUser.id}
            onBack={() => setCurrentScreen('matches')}
          />
        ) : null;
      
      case 'profile':
        return currentUser ? (
          <ProfileScreen
            user={currentUser}
            onBack={() => setCurrentScreen('home')}
            onVerification={() => setCurrentScreen('verification')}
          />
        ) : null;
      
      case 'verification':
        return (
          <VerificationScreen
            onBack={() => setCurrentScreen('profile')}
            onComplete={handleVerificationComplete}
          />
        );
      
      case 'contracts':
        return (
          <ContractsScreen
            onBack={() => setCurrentScreen('home')}
            onCreateContract={() => setCurrentScreen('createContract')}
            onViewContract={() => {}}
          />
        );
      
      case 'createContract':
        return (
          <CreateContractScreen
            onBack={() => setCurrentScreen('contracts')}
            onSave={() => setCurrentScreen('contracts')}
          />
        );
      
      default:
        return (
          <LoginScreen
            onLogin={handleLogin}
            onGoogleLogin={() => handleSocialAuth('Google')}
            onAppleLogin={() => handleSocialAuth('Apple')}
            onNavigateToSignup={() => setCurrentScreen('signup')}
          />
        );
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <View style={styles.container}>
          {renderScreen()}
          {showBottomNav && (
            <BottomNavigation
              currentScreen={getCurrentNavScreen()}
              onNavigate={handleNavigation}
              showContracts={currentUser?.userType === 'homeowner'}
            />
          )}
        </View>
        <StatusBar style="dark" />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
