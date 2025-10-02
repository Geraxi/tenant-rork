import React, { useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { StyleSheet, PanResponder, Animated, useWindowDimensions, GestureResponderEvent, PanResponderGestureState } from 'react-native';
import UserCard from './UserCard';
import SwipeOverlay from './SwipeOverlay';
import { User } from '@/types';

interface SwipeUserCardProps {
  user: User;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  isTop: boolean;
}

export interface SwipeUserCardRef {
  swipeLeft: () => void;
  swipeRight: () => void;
}

const SwipeUserCard = forwardRef<SwipeUserCardRef, SwipeUserCardProps>(({ user, onSwipeLeft, onSwipeRight, isTop }, ref) => {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const SWIPE_THRESHOLD = screenWidth * 0.2; // 20% of screen width for easier swipe
  const VELOCITY_THRESHOLD = 0.2; // More sensitive velocity
  const SWIPE_OUT_DURATION = 200; // Faster swipe out animation

  const pan = useRef(new Animated.ValueXY()).current;
  const [overlayType, setOverlayType] = useState<'like' | 'nope' | null>(null);
  const overlayOpacityAnim = useRef(new Animated.Value(0)).current;

  const cardWidth = screenWidth - 48;
  const cardHeight = Math.min(screenHeight * 0.65, 600);

  const animateSwipe = (direction: 'left' | 'right', velocity?: number) => {
    const toValue = direction === 'right' ? screenWidth * 1.5 : -screenWidth * 1.5;
    const duration = velocity && Math.abs(velocity) > 0.5 ? 120 : SWIPE_OUT_DURATION;
    
    Animated.parallel([
      Animated.timing(pan, {
        toValue: { x: toValue, y: 0 },
        duration,
        useNativeDriver: false,
      }),
      Animated.timing(overlayOpacityAnim, {
        toValue: 0,
        duration: duration / 2,
        useNativeDriver: false,
      })
    ]).start(() => {
      if (direction === 'right') {
        onSwipeRight();
      } else {
        onSwipeLeft();
      }
      resetCard();
    });
  };

  const resetCard = () => {
    pan.setValue({ x: 0, y: 0 });
    overlayOpacityAnim.setValue(0);
    setOverlayType(null);
  };

  useImperativeHandle(ref, () => ({
    swipeLeft: () => animateSwipe('left'),
    swipeRight: () => animateSwipe('right'),
  }));

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => isTop,
    onMoveShouldSetPanResponder: (_, gestureState) => {
      // More sensitive to detect swipes immediately
      const { dx, dy } = gestureState;
      return isTop && (Math.abs(dx) > 0 || Math.abs(dy) > 0);
    },
    onPanResponderTerminationRequest: () => false,
    onShouldBlockNativeResponder: () => true,
    onPanResponderGrant: () => {
      // Stop any animations and extract offset
      pan.stopAnimation();
      pan.extractOffset();
    },
    onPanResponderMove: (event: GestureResponderEvent, gestureState: PanResponderGestureState) => {
      if (!isTop) return;
      
      const { dx, dy } = gestureState;
      
      // Update position
      pan.setValue({ x: dx, y: dy });
      
      // Update overlay based on drag distance
      const opacity = Math.min(Math.abs(dx) / (SWIPE_THRESHOLD * 0.8), 1);
      overlayOpacityAnim.setValue(opacity);
      
      if (dx > 10) {
        setOverlayType('like');
      } else if (dx < -10) {
        setOverlayType('nope');
      } else {
        setOverlayType(null);
      }
    },
    onPanResponderRelease: (_, gestureState) => {
      if (!isTop) return;
      
      pan.flattenOffset();
      const { dx, dy, vx } = gestureState;
      
      // Tinder-like swipe detection
      const absVx = Math.abs(vx);
      const velocityPass = absVx > VELOCITY_THRESHOLD;
      const distancePass = Math.abs(dx) > SWIPE_THRESHOLD;
      
      // Swipe if either velocity or distance threshold is met
      if ((velocityPass || distancePass) && Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0) {
          animateSwipe('right', vx);
        } else {
          animateSwipe('left', vx);
        }
      } else {
        // Spring back to center
        Animated.parallel([
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            tension: 40,
            friction: 8,
            useNativeDriver: false,
          }),
          Animated.timing(overlayOpacityAnim, {
            toValue: 0,
            duration: 150,
            useNativeDriver: false,
          })
        ]).start(() => {
          setOverlayType(null);
        });
      }
    },
  });

  // Tinder-like rotation based on drag position
  const rotate = pan.x.interpolate({
    inputRange: [-screenWidth / 2, 0, screenWidth / 2],
    outputRange: ['-15deg', '0deg', '15deg'],
    extrapolate: 'clamp',
  });

  // Scale and opacity for stacked cards effect
  const nextCardScale = pan.x.interpolate({
    inputRange: [-screenWidth / 2, 0, screenWidth / 2],
    outputRange: [1, 0.95, 1],
    extrapolate: 'clamp',
  });
  
  const scale = isTop ? 1 : nextCardScale;

  const animatedStyle = {
    transform: [
      { translateX: pan.x },
      { translateY: pan.y },
      { rotate },
      { scale },
    ],
  };

  return (
    <Animated.View
      style={[styles.container, { width: cardWidth, height: cardHeight }, animatedStyle]}
      {...(isTop ? panResponder.panHandlers : {})}
    >
      <UserCard user={user} />
      {isTop && overlayType && (
        <Animated.View style={[styles.overlayContainer, { opacity: overlayOpacityAnim }]}>
          <SwipeOverlay type={overlayType} opacity={1} />
        </Animated.View>
      )}
    </Animated.View>
  );
});

SwipeUserCard.displayName = 'SwipeUserCard';

export default SwipeUserCard;

const styles = StyleSheet.create({
  container: {
    position: 'absolute' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden' as const,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  overlayContainer: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});