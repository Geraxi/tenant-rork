import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface RangeSliderProps {
  label: string;
  minValue: number;
  maxValue: number;
  currentMin: number;
  currentMax: number;
  step?: number;
  unit?: string;
  onMinChange: (value: number) => void;
  onMaxChange: (value: number) => void;
}

export default function RangeSlider({
  label,
  minValue,
  maxValue,
  currentMin,
  currentMax,
  step = 1,
  unit = '',
  onMinChange,
  onMaxChange,
}: RangeSliderProps) {
  const [pressedButton, setPressedButton] = useState<string | null>(null);
  const handleMinIncrease = () => {
    console.log('Min increase clicked, currentMin:', currentMin, 'currentMax:', currentMax);
    if (currentMin < currentMax - step) {
      const newValue = Math.min(currentMin + step, currentMax - step);
      console.log('Setting min to:', newValue);
      onMinChange(newValue);
    }
  };

  const handleMinDecrease = () => {
    console.log('Min decrease clicked, currentMin:', currentMin, 'minValue:', minValue);
    if (currentMin > minValue) {
      const newValue = Math.max(currentMin - step, minValue);
      console.log('Setting min to:', newValue);
      onMinChange(newValue);
    }
  };

  const handleMaxIncrease = () => {
    console.log('Max increase clicked, currentMax:', currentMax, 'maxValue:', maxValue);
    if (currentMax < maxValue) {
      const newValue = Math.min(currentMax + step, maxValue);
      console.log('Setting max to:', newValue);
      onMaxChange(newValue);
    }
  };

  const handleMaxDecrease = () => {
    console.log('Max decrease clicked, currentMax:', currentMax, 'currentMin:', currentMin);
    if (currentMax > currentMin + step) {
      const newValue = Math.max(currentMax - step, currentMin + step);
      console.log('Setting max to:', newValue);
      onMaxChange(newValue);
    }
  };

  const getMinProgress = () => {
    return ((currentMin - minValue) / (maxValue - minValue)) * 100;
  };

  const getMaxProgress = () => {
    return ((currentMax - minValue) / (maxValue - minValue)) * 100;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.sliderContainer}>
        {/* Min Value Controls */}
        <View style={styles.rangeContainer}>
          <Text style={styles.rangeLabel}>Da</Text>
          <View style={styles.valueContainer}>
            <TouchableOpacity
              style={[styles.button, currentMin <= minValue && styles.buttonDisabled]}
              onPress={handleMinDecrease}
              disabled={currentMin <= minValue}
            >
              <MaterialIcons
                name="remove-circle-outline"
                size={28}
                color={currentMin > minValue ? '#2196F3' : '#CCC'}
              />
            </TouchableOpacity>
            <Text style={styles.value}>
              {currentMin}{unit}
            </Text>
            <TouchableOpacity
              style={[styles.button, currentMin >= currentMax - step && styles.buttonDisabled]}
              onPress={handleMinIncrease}
              disabled={currentMin >= currentMax - step}
            >
              <MaterialIcons
                name="add-circle-outline"
                size={28}
                color={currentMin < currentMax - step ? '#2196F3' : '#CCC'}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  left: `${getMinProgress()}%`,
                  width: `${getMaxProgress() - getMinProgress()}%`,
                },
              ]}
            />
          </View>
          <View style={styles.progressLabels}>
            <Text style={styles.progressLabel}>{minValue}{unit}</Text>
            <Text style={styles.progressLabel}>{maxValue}{unit}</Text>
          </View>
        </View>

        {/* Max Value Controls */}
        <View style={styles.rangeContainer}>
          <Text style={styles.rangeLabel}>A</Text>
          <View style={styles.valueContainer}>
            <TouchableOpacity
              style={[styles.button, currentMax <= currentMin + step && styles.buttonDisabled]}
              onPress={handleMaxDecrease}
              disabled={currentMax <= currentMin + step}
            >
              <MaterialIcons
                name="remove-circle-outline"
                size={28}
                color={currentMax > currentMin + step ? '#2196F3' : '#CCC'}
              />
            </TouchableOpacity>
            <Text style={styles.value}>
              {currentMax}{unit}
            </Text>
            <TouchableOpacity
              style={[styles.button, currentMax >= maxValue && styles.buttonDisabled]}
              onPress={handleMaxIncrease}
              disabled={currentMax >= maxValue}
            >
              <MaterialIcons
                name="add-circle-outline"
                size={28}
                color={currentMax < maxValue ? '#2196F3' : '#CCC'}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  sliderContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  rangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  rangeLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    minWidth: 20,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  button: {
    padding: 8,
    borderRadius: 20,
    minWidth: 40,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.3,
  },
  value: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2196F3',
    minWidth: 60,
    textAlign: 'center',
  },
  progressBarContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
    position: 'relative',
  },
  progressFill: {
    position: 'absolute',
    top: 0,
    height: '100%',
    backgroundColor: '#2196F3',
    borderRadius: 3,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  progressLabel: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
});
