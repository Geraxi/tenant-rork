import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { UserMode } from '@/types';
import { Colors, Typography, BorderRadius, Spacing } from '@/constants/theme';

interface ModeSwitchProps {
  currentMode: UserMode;
  availableModes: UserMode[];
  onModeChange: (mode: UserMode) => void;
}

const modeLabels: Record<UserMode, string> = {
  tenant: 'Inquilino',
  landlord: 'Proprietario',
  roommate: 'Coinquilino',
};

export default function ModeSwitch({ currentMode, availableModes, onModeChange }: ModeSwitchProps) {
  return (
    <View style={styles.container}>
      {availableModes.map((mode) => (
        <TouchableOpacity
          key={mode}
          style={[
            styles.button,
            currentMode === mode && styles.activeButton,
          ]}
          onPress={() => onModeChange(mode)}
        >
          <Text
            style={[
              styles.buttonText,
              currentMode === mode && styles.activeButtonText,
            ]}
          >
            {modeLabels[mode]}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.md,
    padding: Spacing.xs,
  },
  button: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
  },
  activeButton: {
    backgroundColor: Colors.primary,
  },
  buttonText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  activeButtonText: {
    color: Colors.background,
  },
});