import React, { useRef, useImperativeHandle, forwardRef, useState } from 'react';
import { 
  StyleSheet, 
  PanResponder, 
  Animated, 
  useWindowDimensions,
  View,
  Text,
  Platform,
  TouchableWithoutFeedback
} from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import PropertyCard from './PropertyCard';
import UserCard from './UserCard';
import { Property, User } from '@/types';
import { Colors } from '@/constants/theme';

interface TinderSwipeCardProps {
  item: Property | User;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  isTop: boolean;
  type: 'property' | 'user';
}

export interface TinderSwipeCardRef {
  swipeLeft: () => void;
  swipeRight: () => void;
}

const TinderSwipeCard = forwardRef<TinderSwipeCardRef, TinderSwipeCardProps>(
  ({ item, onSwipeLeft, onSwipeRight, isTop, type }, ref) => {
    const { width: screenWidth, height: screenHeight } = useWindowDimensions();
    const [isDragging, setIsDragging] = useState(false);
    const [startTime, setStartTime] = useState(0);

    // Swipe thresholds - 25% of screen width as requested
    const SWIPE_THRESHOLD = screenWidth * 0.25;
    const SWIPE_OUT_DURATION = 250;
    const ROTATION_STRENGTH = 15;
    const TAP_THRESHOLD = 10;
    const TAP_TIME_THRESHOLD = 200;
    
    // Animation values
    const position = useRef(new Animated.ValueXY()).current;
    const likeOpacity = useRef(new Animated.Value(0)).current;
    const nopeOpacity = useRef(new Animated.Value(0)).current;
    
    // Card dimensions - consistent with PropertyCard/UserCard
    const cardWidth = screenWidth - 80; // Match PropertyCard sizing
    const cardHeight = Math.min(screenHeight * 0.65, 620); // Match PropertyCard sizing

    const resetPosition = () => {
      console.log('Resetting card position to center');
      setIsDragging(false);
      
      Animated.parallel([
        Animated.spring(position, {
          toValue: { x: 0, y: 0 },
          tension: 120,
          friction: 8,
          useNativeDriver: false,
        }),
        Animated.timing(likeOpacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: false,
        }),
        Animated.timing(nopeOpacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: false,
        })
      ]).start();
    };

    const forceSwipe = (direction: 'right' | 'left') => {
      if (!isTop) return;
      
      console.log(`Force swiping ${direction}`);
      setIsDragging(false);
      
      const x = direction === 'right' ? screenWidth * 1.5 : -screenWidth * 1.5;
      
      // Haptic feedback
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      
      // Show overlay with full opacity
      const targetOpacity = direction === 'right' ? likeOpacity : nopeOpacity;
      targetOpacity.setValue(1);
      
      // Animate card off screen FIRST
      Animated.timing(position, {
        toValue: { x, y: 0 },
        duration: SWIPE_OUT_DURATION,
        useNativeDriver: false,
      }).start(() => {
        console.log(`Swipe ${direction} animation completed`);
        
        // AFTER animation completes, trigger callback to remove card from stack
        if (direction === 'right') {
          onSwipeRight();
        } else {
          onSwipeLeft();
        }
        
        // Reset position for next card that will be rendered
        position.setValue({ x: 0, y: 0 });
        likeOpacity.setValue(0);
        nopeOpacity.setValue(0);
      });
    };

    useImperativeHandle(ref, () => ({
      swipeLeft: () => forceSwipe('left'),
      swipeRight: () => forceSwipe('right'),
    }));

    const handleCardPress = () => {
      if (!isTop || isDragging) return;
      
      // Add haptic feedback for tap
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      
      // Navigate to card detail page
      const itemType = 'rent' in item ? 'property' : 'user';
      router.push({
        pathname: '/card-detail',
        params: { id: item.id, type: itemType },
      });
    };

    const panResponder = useRef(
      PanResponder.create({
        onStartShouldSetPanResponder: () => isTop,
        onMoveShouldSetPanResponder: (evt, gestureState) => {
          if (!isTop) return false;
          const { dx, dy } = gestureState;
          return Math.abs(dx) > 3 || Math.abs(dy) > 3;
        },
        onPanResponderGrant: (evt, gestureState) => {
          if (!isTop) return;
          
          setStartTime(Date.now());
          setIsDragging(false);
          
          if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
        },
        onPanResponderMove: (evt, gestureState) => {
          if (!isTop) return;
          
          const { dx, dy } = gestureState;
          
          if (!isDragging && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
            setIsDragging(true);
          }
          
          // Update position - follow finger movement
          position.setValue({ x: dx, y: dy });
          
          // Calculate overlay opacity based on horizontal movement
          const absX = Math.abs(dx);
          const opacity = Math.min(absX / (SWIPE_THRESHOLD * 0.7), 1);
          
          if (dx > 20) {
            likeOpacity.setValue(opacity);
            nopeOpacity.setValue(0);
          } else if (dx < -20) {
            nopeOpacity.setValue(opacity);
            likeOpacity.setValue(0);
          } else {
            likeOpacity.setValue(0);
            nopeOpacity.setValue(0);
          }
        },
        onPanResponderRelease: (evt, gestureState) => {
          if (!isTop) return;
          
          const { dx, dy } = gestureState;
          const duration = Date.now() - startTime;
          
          console.log(`Pan release: dx=${dx}, duration=${duration}, isDragging=${isDragging}`);
          
          // Check if this was a tap
          const isTap = duration < TAP_TIME_THRESHOLD && Math.abs(dx) < TAP_THRESHOLD && Math.abs(dy) < TAP_THRESHOLD && !isDragging;
          
          if (isTap) {
            console.log('Detected tap - opening card');
            resetPosition();
            setTimeout(() => {
              handleCardPress();
            }, 100);
            return;
          }
          
          // Check swipe threshold - 25% of screen width
          if (dx > SWIPE_THRESHOLD) {
            console.log('Swipe right detected - removing card');
            forceSwipe('right');
          } else if (dx < -SWIPE_THRESHOLD) {
            console.log('Swipe left detected - removing card');
            forceSwipe('left');
          } else {
            console.log('Not enough movement - resetting to center');
            resetPosition();
          }
        },
        onPanResponderTerminationRequest: () => false,
        onShouldBlockNativeResponder: () => true,
      })
    ).current;

    // Tinder-style rotation based on X position
    const rotate = position.x.interpolate({
      inputRange: [-screenWidth / 2, 0, screenWidth / 2],
      outputRange: [`-${ROTATION_STRENGTH}deg`, '0deg', `${ROTATION_STRENGTH}deg`],
      extrapolate: 'clamp',
    });

    // Removed problematic scale effect that caused glitching
    // Cards behind the top card maintain consistent size
    // All cards use the same dimensions to prevent layout shifts
    
    // Opacity effect for top card when swiping
    const cardOpacity = position.x.interpolate({
      inputRange: [-screenWidth * 0.8, 0, screenWidth * 0.8],
      outputRange: [0.7, 1, 0.7],
      extrapolate: 'clamp',
    });

    const animatedCardStyle = {
      transform: [
        { translateX: position.x },
        { translateY: position.y },
        { rotate: isTop ? rotate : '0deg' },
        { scale: 1 }, // Consistent scale for all cards to prevent glitching
      ],
      opacity: isTop ? cardOpacity : 1,
    };

    return (
      <Animated.View
        style={[
          styles.card,
          { width: cardWidth, height: cardHeight },
          animatedCardStyle,
          !isTop && styles.nextCard,
        ]}
        {...(isTop ? panResponder.panHandlers : {})}
      >
        <TouchableWithoutFeedback 
          onPress={isTop && !isDragging ? handleCardPress : undefined}
          disabled={!isTop || isDragging}
        >
          <View style={styles.cardContent}>
            {type === 'property' ? (
              <PropertyCard property={item as Property} />
            ) : (
              <UserCard user={item as User} />
            )}
          </View>
        </TouchableWithoutFeedback>
        
        {isTop && (
          <>
            <Animated.View 
              style={[
                styles.likeOverlay,
                { opacity: likeOpacity }
              ]}
              pointerEvents="none"
            >
              <View style={styles.likeTextContainer}>
                <Text style={styles.likeText}>LIKE</Text>
              </View>
            </Animated.View>
            
            <Animated.View 
              style={[
                styles.nopeOverlay,
                { opacity: nopeOpacity }
              ]}
              pointerEvents="none"
            >
              <View style={styles.nopeTextContainer}>
                <Text style={styles.nopeText}>NOPE</Text>
              </View>
            </Animated.View>
          </>
        )}
      </Animated.View>
    );
  }
);

TinderSwipeCard.displayName = 'TinderSwipeCard';

export default TinderSwipeCard;

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    backgroundColor: Colors.background,
    borderRadius: 20, // Match other card components
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  nextCard: {
    zIndex: -1,
  },
  cardContent: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  likeOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 60,
    paddingRight: 30,
    zIndex: 100,
  },
  nopeOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    paddingTop: 60,
    paddingLeft: 30,
    zIndex: 100,
  },
  likeTextContainer: {
    borderWidth: 4,
    borderColor: '#4CD964',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    transform: [{ rotate: '-15deg' }],
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 6,
  },
  likeText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#4CD964',
    letterSpacing: 2,
    textAlign: 'center',
  },
  nopeTextContainer: {
    borderWidth: 4,
    borderColor: '#FF3B30',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    transform: [{ rotate: '15deg' }],
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 6,
  },
  nopeText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FF3B30',
    letterSpacing: 2,
    textAlign: 'center',
  },
});