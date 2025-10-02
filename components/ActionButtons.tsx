import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { X, Heart } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing } from '@/constants/theme';

interface ActionButtonsProps {
  onNope: () => void;
  onLike: () => void;
}

export default function ActionButtons({ onNope, onLike }: ActionButtonsProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={onNope}>
        <LinearGradient
          colors={['#FFFFFF', '#F8F9FA']}
          style={[styles.buttonGradient, styles.nopeButton]}
        >
          <X size={32} color={Colors.nope} />
        </LinearGradient>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.button} onPress={onLike}>
        <LinearGradient
          colors={[Colors.primary, Colors.primaryLight]}
          style={[styles.buttonGradient, styles.likeButton]}
        >
          <Heart size={32} color={Colors.textLight} fill={Colors.textLight} />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.xxl,
    paddingVertical: Spacing.lg,
  },
  button: {
    width: 64,
    height: 64,
    borderRadius: 32,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nopeButton: {
    borderWidth: 2,
    borderColor: Colors.nope,
  },
  likeButton: {
    borderWidth: 0,
  },
});