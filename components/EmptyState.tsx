import React, { useRef, useEffect, useState } from "react";
import { View, Text, StyleSheet, Animated, TouchableOpacity } from "react-native";
import { Colors, Typography, Spacing } from '@/constants/theme';
import TenantLogo from './TenantLogo';
import FilterScreen, { FilterOptions } from './FilterScreen';

interface EmptyStateProps {
  message?: string;
  onReload?: () => void;
  onPreferences?: () => void;
}



export default function EmptyState({ 
  message = "No more listings", 
  onReload, 
  onPreferences 
}: EmptyStateProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [showFilterModal, setShowFilterModal] = useState<boolean>(false);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleFiltersApply = (filters: FilterOptions) => {
    console.log('Applied filters:', filters);
    onPreferences && onPreferences();
  };

  // If preferences callback is provided, show enhanced version
  if (onPreferences) {
    return (
      <>
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
          <TenantLogo size={80} />
          <Text style={styles.title}>No more listings</Text>
          <Text style={styles.subtitle}>
            Try adjusting your preferences to see more properties.
          </Text>

          <View style={styles.buttonsContainer}>
            <TouchableOpacity 
              style={styles.button} 
              onPress={() => setShowFilterModal(true)}
            >
              <Text style={styles.buttonText}>Change preferences</Text>
            </TouchableOpacity>

            {onReload && (
              <TouchableOpacity style={[styles.button, styles.reload]} onPress={onReload}>
                <Text style={styles.buttonText}>Reload listings</Text>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
        
        <FilterScreen
          visible={showFilterModal}
          onClose={() => setShowFilterModal(false)}
          onApply={handleFiltersApply}
        />
      </>
    );
  }

  // Original simple version
  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <TenantLogo size={80} />
      <Text style={styles.message}>{message}</Text>

      {onReload && (
        <TouchableOpacity style={styles.button} onPress={onReload}>
          <Text style={styles.buttonText}>Reload listings</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.lg,
  },
  message: {
    ...Typography.h2,
    color: Colors.text,
    marginBottom: Spacing.lg,
    marginTop: Spacing.lg,
    textAlign: "center",
  },
  title: {
    ...Typography.h1,
    color: Colors.text,
    marginBottom: Spacing.sm,
    marginTop: Spacing.lg,
    textAlign: "center",
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
    textAlign: "center",
  },
  buttonsContainer: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: 10,
  },
  reload: {
    backgroundColor: Colors.secondary,
  },
  buttonText: {
    color: Colors.background,
    fontWeight: "600",
    fontSize: 16,
  },

});