import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Pressable } from 'react-native';
import { ChevronDown, Home, Users, Building2, Check } from 'lucide-react-native';
import { UserMode } from '@/types';
import { Colors, Typography, BorderRadius, Spacing } from '@/constants/theme';

interface AccountSwitcherProps {
  currentMode: UserMode;
  availableModes: UserMode[];
  onModeChange: (mode: UserMode) => void;
}

const modeConfig: Record<UserMode, { label: string; icon: React.ComponentType<any>; description: string; color: string }> = {
  tenant: {
    label: 'Inquilino',
    icon: Home,
    description: 'Cerca case e appartamenti',
    color: Colors.primary,
  },
  roommate: {
    label: 'Coinquilino',
    icon: Users,
    description: 'Trova coinquilini perfetti',
    color: Colors.secondary,
  },
  landlord: {
    label: 'Proprietario',
    icon: Building2,
    description: 'Affitta le tue proprietà',
    color: Colors.accent,
  },
};

export default function AccountSwitcher({ currentMode, availableModes, onModeChange }: AccountSwitcherProps) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  
  const currentConfig = modeConfig[currentMode];
  const CurrentIcon = currentConfig.icon;

  const handleModeSelect = (mode: UserMode) => {
    if (!mode || typeof mode !== 'string' || !mode.trim()) return;
    if (mode.length > 20) return;
    const sanitizedMode = mode.trim() as UserMode;
    onModeChange(sanitizedMode);
    setIsModalVisible(false);
  };

  return (
    <>
      <TouchableOpacity 
        style={styles.switcher}
        onPress={() => setIsModalVisible(true)}
        activeOpacity={0.7}
      >
        <View style={styles.switcherContent}>
          <View style={[styles.iconContainer, { backgroundColor: currentConfig.color }]}>
            <CurrentIcon size={20} color={Colors.background} />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.modeLabel}>{currentConfig.label}</Text>
            <Text style={styles.modeDescription}>{currentConfig.description}</Text>
          </View>
          <ChevronDown size={20} color={Colors.textSecondary} />
        </View>
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setIsModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Cambia Modalità</Text>
              <Text style={styles.modalSubtitle}>Seleziona come vuoi utilizzare l&apos;app. Puoi cambiare in qualsiasi momento.</Text>
            </View>
            
            {Object.entries(modeConfig).map(([mode, config]) => {
              const Icon = config.icon;
              const isSelected = mode === currentMode;
              const isAvailable = availableModes.includes(mode as UserMode);
              
              return (
                <TouchableOpacity
                  key={mode}
                  style={[
                    styles.modeOption,
                    isSelected && styles.selectedModeOption,
                    !isAvailable && styles.disabledModeOption,
                  ]}
                  onPress={() => handleModeSelect(mode as UserMode)}
                  disabled={!isAvailable}
                  activeOpacity={0.7}
                >
                  <View style={styles.modeOptionContent}>
                    <View style={[styles.modeIconContainer, { backgroundColor: config.color }]}>
                      <Icon size={24} color={Colors.background} />
                    </View>
                    <View style={styles.modeTextContainer}>
                      <Text style={[
                        styles.modeOptionLabel,
                        !isAvailable && styles.disabledText
                      ]}>
                        {config.label}
                      </Text>
                      <Text style={[
                        styles.modeOptionDescription,
                        !isAvailable && styles.disabledText
                      ]}>
                        {config.description}
                      </Text>
                      {isSelected && (
                        <Text style={styles.currentModeText}>Modalità attuale</Text>
                      )}
                      {!isAvailable && (
                        <Text style={styles.unavailableText}>Non disponibile</Text>
                      )}
                    </View>
                    {isSelected && (
                      <View style={styles.checkContainer}>
                        <Check size={20} color={Colors.primary} />
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
            
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => setIsModalVisible(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>Annulla</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  switcher: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  switcherContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  modeLabel: {
    ...Typography.body,
    color: Colors.text,
    fontWeight: '600',
    marginBottom: 2,
  },
  modeDescription: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  modalTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  modalSubtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  modeOption: {
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  selectedModeOption: {
    borderColor: Colors.primary,
    backgroundColor: Colors.backgroundSecondary,
  },
  disabledModeOption: {
    opacity: 0.5,
  },
  modeOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  modeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modeTextContainer: {
    flex: 1,
  },
  modeOptionLabel: {
    ...Typography.body,
    color: Colors.text,
    fontWeight: '600',
    marginBottom: 4,
  },
  modeOptionDescription: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  currentModeText: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: '600',
    marginTop: 4,
  },
  unavailableText: {
    ...Typography.caption,
    color: Colors.error,
    fontStyle: 'italic',
    marginTop: 4,
  },
  disabledText: {
    color: Colors.textSecondary,
    opacity: 0.6,
  },
  checkContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  cancelButtonText: {
    ...Typography.body,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
});