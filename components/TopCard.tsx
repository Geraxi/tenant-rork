import React, { useRef } from "react";
import {
  Animated,
  PanResponder,
  TouchableWithoutFeedback,
  View,
  Text,
  StyleSheet,
  Platform,
  useWindowDimensions,
} from "react-native";
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import PropertyCard from './PropertyCard';
import UserCard from './UserCard';
import { Property, User } from '@/types';
import { Colors } from '@/constants/theme';

const SWIPE_OUT_DURATION = 300;

interface TopCardProps {
  item: Property | User;
  type: 'property' | 'user';
  onSwipeComplete: (direction: 'left' | 'right') => void;
  onPress?: (item: Property | User) => void;
}

export interface TopCardRef {
  forceSwipe: (direction: 'left' | 'right') => void;
}

const TopCard = React.forwardRef<TopCardRef, TopCardProps>(({ item, type, onSwipeComplete, onPress }, ref) => {
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25; // 25%
  const SWIPE_OUT_X = SCREEN_WIDTH * 1.2;
  
  const position = useRef(new Animated.ValueXY()).current;
  const likeOpacity = useRef(new Animated.Value(0)).current;
  const nopeOpacity = useRef(new Animated.Value(0)).current;
  const isAnimating = useRef(false);
  
  // Cleanup effect to reset animation state when component unmounts
  React.useEffect(() => {
    return () => {
      // Reset all animated values when component unmounts
      position.setValue({ x: 0, y: 0 });
      likeOpacity.setValue(0);
      nopeOpacity.setValue(0);
      isAnimating.current = false;
    };
  }, [position, likeOpacity, nopeOpacity]);

  const panResponder = useRef(
    PanResponder.create({
      // Allow taps to go through: only start pan when movement is significant
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        const should = Math.abs(gestureState.dx) > 6 || Math.abs(gestureState.dy) > 6;
        return should;
      },
      onPanResponderMove: (_, gesture) => {
        if (isAnimating.current) return; // Don't update position while animating
        
        // Move the card with the finger
        position.setValue({ x: gesture.dx, y: gesture.dy });
        
        // Update overlay opacity based on horizontal movement
        const absX = Math.abs(gesture.dx);
        const opacity = Math.min(absX / (SWIPE_THRESHOLD * 0.7), 1);
        
        if (gesture.dx > 20) {
          likeOpacity.setValue(opacity);
          nopeOpacity.setValue(0);
        } else if (gesture.dx < -20) {
          nopeOpacity.setValue(opacity);
          likeOpacity.setValue(0);
        } else {
          likeOpacity.setValue(0);
          nopeOpacity.setValue(0);
        }
      },
      onPanResponderRelease: (_, gesture) => {
        console.log("Pan release dx:", gesture.dx, "dy:", gesture.dy);
        if (isAnimating.current) {
          // Ignore extra releases while animating
          return;
        }
        if (gesture.dx > SWIPE_THRESHOLD) {
          forceSwipe("right");
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          forceSwipe("left");
        } else {
          resetPosition();
        }
      },
    })
  ).current;

  const forceSwipe = (direction: 'left' | 'right') => {
    if (isAnimating.current) return; // Prevent multiple swipes
    
    isAnimating.current = true;
    const x = direction === "right" ? SWIPE_OUT_X : -SWIPE_OUT_X;
    
    // Haptic feedback
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    // Show overlay with full opacity
    const targetOpacity = direction === 'right' ? likeOpacity : nopeOpacity;
    targetOpacity.setValue(1);
    
    Animated.timing(position, {
      toValue: { x, y: 0 },
      duration: SWIPE_OUT_DURATION,
      useNativeDriver: true,
    }).start((finished) => {
      if (!finished) {
        // Animation was interrupted, reset state
        isAnimating.current = false;
        return;
      }
      
      // Notify parent to remove the card from the array
      onSwipeComplete && onSwipeComplete(direction);
      
      // Don't reset here - let the component unmount naturally
      // The next card will have its own fresh animated values
    });
  };

  React.useImperativeHandle(ref, () => ({
    forceSwipe: (direction: 'left' | 'right') => {
      if (!isAnimating.current) {
        forceSwipe(direction);
      }
    },
  }));

  const resetPosition = () => {
    Animated.parallel([
      Animated.spring(position, {
        toValue: { x: 0, y: 0 },
        tension: 120,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(likeOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(nopeOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start();
  };

  const handlePress = () => {
    // Ignore press when animating to avoid accidental navigation
    if (isAnimating.current) return;
    
    if (onPress) {
      onPress(item);
    } else {
      // Default navigation
      const itemType = 'rent' in item ? 'property' : 'user';
      router.push({
        pathname: '/card-detail',
        params: { id: item.id, type: itemType },
      });
    }
  };

  const rotate = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH * 1.5, 0, SCREEN_WIDTH * 1.5],
    outputRange: ["-20deg", "0deg", "20deg"],
    extrapolate: "clamp",
  });

  // Removed scale animation to prevent glitching during swipe transitions
  // Cards maintain consistent size throughout the animation
  // All cards use the same dimensions as PropertyCard/UserCard

  const cardOpacity = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH * 0.8, 0, SCREEN_WIDTH * 0.8],
    outputRange: [0.8, 1, 0.8],
    extrapolate: "clamp",
  });

  const animatedStyle = {
    transform: [...position.getTranslateTransform(), { rotate }],
    opacity: cardOpacity,
  };

  return (
    <Animated.View
      style={[styles.card, animatedStyle]}
      {...panResponder.panHandlers}
    >
      {/* Use TouchableWithoutFeedback so tap is distinct from pan */}
      <TouchableWithoutFeedback onPress={handlePress}>
        <View style={styles.inner}>
          {type === 'property' ? (
            <PropertyCard property={item as Property} />
          ) : (
            <UserCard user={item as User} />
          )}
        </View>
      </TouchableWithoutFeedback>
      
      {/* Like/Nope Overlays */}
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
    </Animated.View>
  );
});

TopCard.displayName = 'TopCard';

export default TopCard;

const styles = StyleSheet.create({
  card: {
    width: "100%",
    paddingHorizontal: 4,
    alignItems: 'center',
  },
  inner: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOpacity: 0.15, // Match other card components
    shadowRadius: 12, // Match other card components
    shadowOffset: {
      width: 0,
      height: 4, // Match other card components
    },
    elevation: 8, // Match other card components
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