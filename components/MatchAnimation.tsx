import React, { useEffect, useRef, useCallback } from 'react';
import { View, StyleSheet, Animated, Text, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TenantLogo from './TenantLogo';

interface MatchAnimationProps {
  visible: boolean;
  onAnimationComplete: () => void;
  user1Name?: string;
  user2Name?: string;
}

const LOGO_COUNT = 15;

export default function MatchAnimation({ 
  visible, 
  onAnimationComplete, 
  user1Name = 'You', 
  user2Name = 'Match' 
}: MatchAnimationProps) {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const logoAnimations = useRef(
    Array.from({ length: LOGO_COUNT }, (_, index) => ({
      id: `logo-${index}`,
      translateX: new Animated.Value(0),
      translateY: new Animated.Value(0),
      scale: new Animated.Value(0),
      rotate: new Animated.Value(0),
      opacity: new Animated.Value(0),
    }))
  ).current;

  const resetAnimation = useCallback(() => {
    fadeAnim.setValue(0);
    scaleAnim.setValue(0.5);
    logoAnimations.forEach((logoAnim) => {
      logoAnim.translateX.setValue(0);
      logoAnim.translateY.setValue(0);
      logoAnim.scale.setValue(0);
      logoAnim.rotate.setValue(0);
      logoAnim.opacity.setValue(0);
    });
  }, [fadeAnim, scaleAnim, logoAnimations]);

  const startAnimation = useCallback(() => {
    // Main container fade in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Animate logos with staggered timing
    const logoAnimationPromises = logoAnimations.map((logoAnim, index) => {
      const delay = index * 150; // Stagger the animations
      
      // Random end positions around the screen
      const endX = (Math.random() - 0.5) * screenWidth * 1.5;
      const endY = (Math.random() - 0.5) * screenHeight * 1.5;
      
      // Random rotation
      const endRotation = (Math.random() - 0.5) * 720; // Up to 2 full rotations
      
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          Animated.parallel([
            // Fade in and scale up
            Animated.timing(logoAnim.opacity, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.spring(logoAnim.scale, {
              toValue: Math.random() * 0.5 + 0.5, // Random size between 0.5 and 1
              tension: 100,
              friction: 8,
              useNativeDriver: true,
            }),
            // Move to random position
            Animated.timing(logoAnim.translateX, {
              toValue: endX,
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.timing(logoAnim.translateY, {
              toValue: endY,
              duration: 2000,
              useNativeDriver: true,
            }),
            // Rotate
            Animated.timing(logoAnim.rotate, {
              toValue: endRotation,
              duration: 2000,
              useNativeDriver: true,
            }),
          ]).start(() => {
            // Fade out
            Animated.timing(logoAnim.opacity, {
              toValue: 0,
              duration: 500,
              useNativeDriver: true,
            }).start(() => resolve());
          });
        }, delay);
      });
    });

    // Complete animation after all logos finish
    Promise.all(logoAnimationPromises).then(() => {
      setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start(onAnimationComplete);
      }, 500);
    });
  }, [screenWidth, screenHeight, fadeAnim, scaleAnim, logoAnimations, onAnimationComplete]);

  useEffect(() => {
    if (visible) {
      startAnimation();
    } else {
      resetAnimation();
    }
  }, [visible, startAnimation, resetAnimation]);

  if (!visible) return null;

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Floating logos */}
        {logoAnimations.map((logoAnim) => (
          <Animated.View
            key={logoAnim.id}
            style={[
              styles.floatingLogo,
              {
                opacity: logoAnim.opacity,
                transform: [
                  { translateX: logoAnim.translateX },
                  { translateY: logoAnim.translateY },
                  { scale: logoAnim.scale },
                  {
                    rotate: logoAnim.rotate.interpolate({
                      inputRange: [0, 360],
                      outputRange: ['0deg', '360deg'],
                    }),
                  },
                ],
              },
            ]}
          >
            <TenantLogo size={60} />
          </Animated.View>
        ))}

        {/* Match text */}
        <View style={styles.matchContent}>
          <Text style={styles.matchTitle}>It&apos;s a Match!</Text>
          <Text style={styles.matchSubtitle}>
            {user1Name} and {user2Name} liked each other
          </Text>
          <View style={styles.userContainer}>
            <View style={styles.userCircle}>
              <Text style={styles.userInitial}>
                {user1Name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.heartContainer}>
              <Text style={styles.heartEmoji}>💕</Text>
            </View>
            <View style={styles.userCircle}>
              <Text style={styles.userInitial}>
                {user2Name.charAt(0).toUpperCase()}
              </Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    zIndex: 1000,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingLogo: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -30,
    marginLeft: -30,
  },
  matchContent: {
    alignItems: 'center',
    zIndex: 10,
  },
  matchTitle: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FF6B6B',
    textAlign: 'center',
    marginBottom: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  matchSubtitle: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 40,
    opacity: 0.9,
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  userCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#fff',
  },
  userInitial: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  heartContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  heartEmoji: {
    fontSize: 40,
  },
});