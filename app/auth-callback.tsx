import { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AuthCallbackScreen() {
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const hash = window.location.hash;
    console.log('🔄 Auth callback received, hash:', hash);

    if (hash && hash.includes('access_token')) {
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get('access_token');
      const error = params.get('error');

      if (accessToken) {
        console.log('✅ Access token found:', accessToken.substring(0, 20) + '...');
        
        if (window.opener) {
          window.opener.postMessage(
            {
              type: 'google-auth-success',
              accessToken,
            },
            window.location.origin
          );
          console.log('✅ Posted message to opener window');
        } else {
          console.error('❌ No opener window found');
        }
        
        setTimeout(() => {
          window.close();
        }, 500);
      } else if (error) {
        console.error('❌ Auth error:', error);
        
        if (window.opener) {
          window.opener.postMessage(
            {
              type: 'google-auth-error',
              error,
            },
            window.location.origin
          );
        }
        
        setTimeout(() => {
          window.close();
        }, 1000);
      }
    } else {
      console.log('⏳ Waiting for redirect...');
    }
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <ActivityIndicator size="large" color="#6B8FE8" />
      <Text style={styles.text}>Completamento autenticazione...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    gap: 16,
  },
  text: {
    fontSize: 16,
    color: '#333333',
  },
});
