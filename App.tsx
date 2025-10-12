import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import OnboardingScreen from './screens/OnboardingScreen';
import HomeScreen from './screens/HomeScreen';
import MatchesScreen from './screens/MatchesScreen';
import ProfileScreen from './screens/ProfileScreen';
import VerificationScreen from './screens/VerificationScreen';
import { User, UserType } from './types';

type Screen = 'onboarding' | 'home' | 'matches' | 'profile' | 'verification';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('onboarding');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Mock current user for demo
  const mockCurrentUser: User = {
    id: 'current-user',
    name: 'John Doe',
    email: 'john@example.com',
    userType: 'tenant',
    age: 28,
    bio: 'Looking for a cozy place near downtown. Non-smoker, no pets. Working professional.',
    photos: ['https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400'],
    location: 'Seattle, WA',
    verified: 'unverified',
    idVerified: false,
    backgroundCheckPassed: false,
    preferences: {
      budget: 1800,
      moveInDate: '2024-02-01',
      leaseDuration: '12 months',
      petFriendly: false,
      smoking: false,
      ageRange: { min: 25, max: 45 },
    },
    createdAt: Date.now(),
  };

  const handleOnboardingComplete = (userType: UserType) => {
    setCurrentUser({
      ...mockCurrentUser,
      userType,
    });
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
      
      case 'home':
        return currentUser ? (
          <HomeScreen
            currentUser={currentUser}
            onNavigateToMatches={() => setCurrentScreen('matches')}
            onNavigateToProfile={() => setCurrentScreen('profile')}
          />
        ) : null;
      
      case 'matches':
        return (
          <MatchesScreen
            onBack={() => setCurrentScreen('home')}
            onSelectMatch={() => {}}
          />
        );
      
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