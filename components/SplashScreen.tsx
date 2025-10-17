import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import { FadeIn, ScaleIn } from './AnimatedComponents';
import Logo from './Logo';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
  onAnimationFinish: () => void;
}

export default function SplashScreen({ onAnimationFinish }: SplashScreenProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Simulate app initialization time
    const timer = setTimeout(() => {
      onAnimationFinish();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onAnimationFinish]);

  useEffect(() => {
    // Create pulsing animation
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    return () => pulse.stop();
  }, [pulseAnim]);

  return (
    <LinearGradient
      colors={['#1e40af', '#3b82f6', '#60a5fa']}
      style={styles.container}
    >
      <FadeIn delay={200}>
        <View style={styles.content}>
          <ScaleIn delay={400}>
            <Animated.View 
              style={[
                {
                  transform: [{ scale: pulseAnim }]
                }
              ]}
            >
              <Logo size="large" showText={false} />
            </Animated.View>
          </ScaleIn>
          
          <FadeIn delay={800}>
            <View style={styles.textContainer}>
              <Text style={styles.appName}>Tenant</Text>
              <Text style={styles.tagline}>Trova la tua casa perfetta</Text>
            </View>
          </FadeIn>
        </View>
      </FadeIn>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    alignItems: 'center',
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontWeight: '300',
  },
});

