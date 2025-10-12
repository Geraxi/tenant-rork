import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface SliderProps {
  label: string;
  value: number;
  minValue: number;
  maxValue: number;
  step?: number;
  unit?: string;
  onValueChange: (value: number) => void;
}

export default function Slider({
  label,
  value,
  minValue,
  maxValue,
  step = 1,
  unit = '',
  onValueChange,
}: SliderProps) {
  const handleIncrease = () => {
    if (value < maxValue) {
      onValueChange(Math.min(value + step, maxValue));
    }
  };

  const handleDecrease = () => {
    if (value > minValue) {
      onValueChange(Math.max(value - step, minValue));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.sliderContainer}>
        <View style={styles.controls}>
          <Text style={styles.minMax}>
            {minValue}{unit}
          </Text>
          <View style={styles.valueContainer}>
            <MaterialIcons
              name="remove-circle-outline"
              size={32}
              color={value > minValue ? '#4ECDC4' : '#CCC'}
              onPress={handleDecrease}
            />
            <Text style={styles.value}>
              {value}{unit}
            </Text>
            <MaterialIcons
              name="add-circle-outline"
              size={32}
              color={value < maxValue ? '#4ECDC4' : '#CCC'}
              onPress={handleIncrease}
            />
          </View>
          <Text style={styles.minMax}>
            {maxValue}{unit}
          </Text>
        </View>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${((value - minValue) / (maxValue - minValue)) * 100}%`,
              },
            ]}
          />
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
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  minMax: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4ECDC4',
    minWidth: 80,
    textAlign: 'center',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4ECDC4',
    borderRadius: 3,
  },
});