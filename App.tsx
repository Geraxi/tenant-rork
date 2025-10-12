import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import OnboardingScreen from './screens/OnboardingScreen';
import ProfileSetupScreen, { ProfileData } from './screens/ProfileSetupScreen';
import PreferencesScreen from './screens/PreferencesScreen';
import HomeScreen from './screens/HomeScreen';
import MatchesScreen from './screens/MatchesScreen';
import ChatScreen from './screens/ChatScreen';
import ProfileScreen from './screens/ProfileScreen';
import VerificationScreen from './screens/VerificationScreen';
import ContractsScreen from './screens/ContractsScreen';
import CreateContractScreen from './screens/CreateContractScreen';
import { User, UserType } from './types';

type Screen = 
  | 'onboarding' 
  | 'profileSetup' 
  | 'preferences' 
  | 'home' 
  | 'matches' 
  | 'chat'
  | 'profile' 
  | 'verification'
  | 'contracts'
  | 'createContract';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('onboarding');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedUserType, setSelectedUserType] = useState<UserType | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<User | null>(null);

  const handleOnboardingComplete = (userType: UserType) => {
    setSelectedUserType(userType);
    setCurrentScreen('profileSetup');
  };

  const handleProfileSetupComplete = (profileData: ProfileData) => {
    const newUser: User = {
      id: 'current-user',
      name: profileData.name,
      email: 'user@example.com',
      userType: selectedUserType!,
      age: parseInt(profileData.age),
      bio: profileData.bio,
      photos: ['https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400'],
      location: profileData.location,
      verified: 'unverified',
      idVerified: false,
      backgroundCheckPassed: false,
      preferences: {},
      createdAt: Date.now(),
    };
    setCurrentUser(newUser);
    setCurrentScreen('preferences');
  };

  const handlePreferencesComplete = (preferences: any) => {
    if (currentUser) {
      setCurrentUser({
        ...currentUser,
        preferences,
      });
    }
    setCurrentScreen('home');
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

  const renderScreen = () => {
    switch (currentScreen) {
      case 'onboarding':
        return <OnboardingScreen onComplete={handleOnboardingComplete} />;
      
      case 'profileSetup':
        return <ProfileSetupScreen onComplete={handleProfileSetupComplete} />;
      
      case 'preferences':
        return selectedUserType ? (
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
        return <OnboardingScreen onComplete={handleOnboardingComplete} />;
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        {renderScreen()}
        <StatusBar style="dark" />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}