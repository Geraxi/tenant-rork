import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography } from '@/constants/theme';

interface SwipeOverlayProps {
  type: 'like' | 'nope';
  opacity: number;
}

export default function SwipeOverlay({ type, opacity }: SwipeOverlayProps) {
  const isLike = type === 'like';
  
  return (
    <View style={[
      styles.container,
      { opacity },
      isLike ? styles.likeContainer : styles.nopeContainer
    ]}>
      <View style={[
        styles.textContainer,
        isLike ? styles.likeTextContainer : styles.nopeTextContainer
      ]}>
        <Text style={[
          styles.text,
          isLike ? styles.likeText : styles.nopeText
        ]}>
          {isLike ? 'LIKE' : 'NOPE'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 24,
  },
  likeContainer: {
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    borderWidth: 3,
    borderColor: Colors.like,
  },
  nopeContainer: {
    backgroundColor: 'rgba(244, 67, 54, 0.15)',
    borderWidth: 3,
    borderColor: Colors.nope,
  },
  textContainer: {
    position: 'absolute',
    top: '30%',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 3,
    transform: [{ rotate: '-15deg' }],
  },
  likeTextContainer: {
    right: 20,
    backgroundColor: 'rgba(76, 175, 80, 0.9)',
    borderColor: Colors.like,
  },
  nopeTextContainer: {
    left: 20,
    backgroundColor: 'rgba(244, 67, 54, 0.9)',
    borderColor: Colors.nope,
  },
  text: {
    ...Typography.h1,
    fontWeight: 'bold',
    fontSize: 32,
    letterSpacing: 2,
  },
  likeText: {
    color: '#FFFFFF',
  },
  nopeText: {
    color: '#FFFFFF',
  },
});