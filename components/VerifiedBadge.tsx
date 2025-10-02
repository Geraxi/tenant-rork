import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CheckCircle } from 'lucide-react-native';

interface VerifiedBadgeProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
}

export default function VerifiedBadge({ size = 'medium', showText = true }: VerifiedBadgeProps) {
  const iconSize = size === 'small' ? 16 : size === 'medium' ? 20 : 24;
  const fontSize = size === 'small' ? 12 : size === 'medium' ? 14 : 16;
  
  return (
    <View style={[styles.container, styles[size]]}>
      <CheckCircle size={iconSize} color="#34C759" />
      {showText && (
        <Text style={[styles.text, { fontSize }]}>
          Verified
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  small: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  medium: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  large: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  text: {
    color: '#34C759',
    fontWeight: '600',
    marginLeft: 4,
  },
});