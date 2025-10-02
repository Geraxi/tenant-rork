import React, { useRef } from "react";
import { Animated, PanResponder, View, TouchableOpacity, StyleSheet, useWindowDimensions } from "react-native";
import { router } from 'expo-router';
import PropertyCard from './PropertyCard';
import { Property } from '@/types';

const SWIPE_THRESHOLD = 120; // Fixed 120px threshold as requested
const SWIPE_OUT_DURATION = 250;

interface SwipeCardProps {
  property: Property;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onPress?: (property: Property) => void;
  isTop: boolean;
}

export interface SwipeCardRef {
  swipeLeft: () => void;
  swipeRight: () => void;
}

const SwipeCard = React.forwardRef<SwipeCardRef, SwipeCardProps>(({ property, onSwipeLeft, onSwipeRight, onPress, isTop }, ref) => {
  const { width: screenWidth } = useWindowDimensions();
  const position = useRef(new Animated.ValueXY()).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => isTop,
      onPanResponderMove: (_, gesture) => {
        if (!isTop) return;
        position.setValue({ x: gesture.dx, y: gesture.dy });
      },
      onPanResponderRelease: (_, gesture) => {
        if (!isTop) return;
        
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

  const forceSwipe = (direction: "right" | "left") => {
    const x = direction === "right" ? screenWidth : -screenWidth;
    Animated.timing(position, {
      toValue: { x, y: 0 },
      duration: SWIPE_OUT_DURATION,
      useNativeDriver: false,
    }).start(() => onSwipeComplete(direction));
  };

  const onSwipeComplete = (direction: "right" | "left") => {
    if (direction === "right" && onSwipeRight) {
      onSwipeRight();
    } else if (direction === "left" && onSwipeLeft) {
      onSwipeLeft();
    }
    // Don't reset position here - let parent handle card removal
  };

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: false,
    }).start();
  };

  const handlePress = () => {
    if (onPress) {
      onPress(property);
    } else {
      // Default navigation to card detail
      router.push({
        pathname: '/card-detail',
        params: { id: property.id, type: 'property' },
      });
    }
  };

  React.useImperativeHandle(ref, () => ({
    swipeLeft: () => forceSwipe("left"),
    swipeRight: () => forceSwipe("right"),
  }));

  const rotate = position.x.interpolate({
    inputRange: [-screenWidth * 1.5, 0, screenWidth * 1.5],
    outputRange: ["-30deg", "0deg", "30deg"],
  });

  const cardStyle = {
    transform: [{ rotate }, ...position.getTranslateTransform()],
  };

  return (
    <Animated.View
      style={[
        styles.container, 
        { width: screenWidth - 32, height: 500 },
        cardStyle
      ]}
      {...(isTop ? panResponder.panHandlers : {})}
    >
      <TouchableOpacity onPress={handlePress} activeOpacity={0.9}>
        <View style={styles.cardContent}>
          <PropertyCard property={property} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
});

SwipeCard.displayName = 'SwipeCard';

export default SwipeCard;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  cardContent: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});