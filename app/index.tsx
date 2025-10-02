import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useUser } from '@/store/user-store';
import { Colors } from '@/constants/theme';

export default function IndexScreen() {
  const { user, isLoading, isOnboardingComplete } = useUser();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        // Check if onboarding is complete
        if (!isOnboardingComplete()) {
          router.replace('/profile-setup');
        } else {
          router.replace('/(tabs)/browse');
        }
      } else {
        router.replace('/login');
      }
    }
  }, [user, isLoading, isOnboardingComplete]);

  return <View style={styles.container} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
});