import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions, Image } from 'react-native';

const { width, height } = Dimensions.get('window');

interface Particle {
  x: Animated.Value;
  y: Animated.Value;
  rotation: Animated.Value;
  scale: Animated.Value;
  type: 'house' | 'logo';
}

interface MatchAnimationProps {
  onComplete?: () => void;
}

export default function MatchAnimation({ onComplete }: MatchAnimationProps) {
  const particles = useRef<Particle[]>([]);

  useEffect(() => {
    // Create 30 particles
    const particleCount = 30;
    const newParticles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      const particle: Particle = {
        x: new Animated.Value(width / 2),
        y: new Animated.Value(height / 2),
        rotation: new Animated.Value(0),
        scale: new Animated.Value(1),
        type: i % 3 === 0 ? 'logo' : 'house',
      };
      newParticles.push(particle);
    }

    particles.current = newParticles;

    // Animate particles
    const animations = newParticles.map((particle, index) => {
      const angle = (index / particleCount) * Math.PI * 2;
      const velocity = 200 + Math.random() * 300;
      const endX = width / 2 + Math.cos(angle) * velocity;
      const endY = height / 2 + Math.sin(angle) * velocity - 200;

      return Animated.parallel([
        Animated.timing(particle.x, {
          toValue: endX,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(particle.y, {
          toValue: endY,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(particle.rotation, {
          toValue: Math.random() * 720 - 360,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(particle.scale, {
            toValue: 1.2,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(particle.scale, {
            toValue: 0,
            duration: 1200,
            useNativeDriver: true,
          }),
        ]),
      ]);
    });

    Animated.parallel(animations).start(() => {
      if (onComplete) {
        setTimeout(onComplete, 500);
      }
    });
  }, []);

  return (
    <View style={styles.container} pointerEvents="none">
      {particles.current.map((particle, index) => (
        <Animated.View
          key={index}
          style={[
            styles.particle,
            {
              transform: [
                { translateX: particle.x },
                { translateY: particle.y },
                { 
                  rotate: particle.rotation.interpolate({
                    inputRange: [-360, 360],
                    outputRange: ['-360deg', '360deg'],
                  }),
                },
                { scale: particle.scale },
              ],
            },
          ]}
        >
          {particle.type === 'house' ? (
            <View style={styles.house}>
              <View style={styles.roof} />
              <View style={styles.houseBody} />
            </View>
          ) : (
            <Image 
              source={require('../assets/images/tenant-logo.png')} 
              style={styles.logo}
              resizeMode="contain"
            />
          )}
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  particle: {
    position: 'absolute',
    width: 30,
    height: 30,
  },
  house: {
    width: 30,
    height: 30,
    alignItems: 'center',
  },
  roof: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 15,
    borderRightWidth: 15,
    borderBottomWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#FF6B6B',
  },
  houseBody: {
    width: 20,
    height: 18,
    backgroundColor: '#4ECDC4',
    borderRadius: 2,
  },
  logo: {
    width: 30,
    height: 30,
  },
});