import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Dimensions,
} from 'react-native';
import { ChevronDown, Check } from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';

interface DropdownMenuProps {
  label: string;
  placeholder?: string;
  options: string[];
  selectedValue?: string;
  onSelect?: (value: string) => void;
  multiSelect?: boolean;
  selectedValues?: string[];
  onMultiSelect?: (values: string[]) => void;
  maxHeight?: number;
}

const { height: screenHeight } = Dimensions.get('window');

export default function DropdownMenu({
  label,
  placeholder = 'Seleziona un\'opzione',
  options,
  selectedValue,
  onSelect,
  multiSelect = false,
  selectedValues = [],
  onMultiSelect,
  maxHeight = screenHeight * 0.4,
}: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (value: string) => {
    if (multiSelect && onMultiSelect) {
      const newValues = selectedValues.includes(value)
        ? selectedValues.filter(v => v !== value)
        : [...selectedValues, value];
      onMultiSelect(newValues);
    } else if (onSelect) {
      onSelect(value);
      setIsOpen(false);
    }
  };

  const getDisplayText = () => {
    if (multiSelect) {
      if (selectedValues.length === 0) return placeholder;
      if (selectedValues.length === 1) return selectedValues[0];
      return `${selectedValues.length} opzioni selezionate`;
    }
    return selectedValue || placeholder;
  };

  const isSelected = (value: string) => {
    if (multiSelect) {
      return selectedValues.includes(value);
    }
    return selectedValue === value;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      
      <TouchableOpacity
        style={[
          styles.selector,
          isOpen && styles.selectorOpen
        ]}
        onPress={() => setIsOpen(true)}
        activeOpacity={0.7}
      >
        <Text style={[
          styles.selectorText,
          (!selectedValue && !selectedValues.length) && styles.placeholderText
        ]}>
          {getDisplayText()}
        </Text>
        <ChevronDown 
          size={20} 
          color={Colors.textSecondary} 
          style={[styles.chevron, isOpen && styles.chevronOpen]}
        />
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View style={styles.dropdown}>
            <View style={styles.dropdownHeader}>
              <Text style={styles.dropdownTitle}>{label}</Text>
              {multiSelect && (
                <TouchableOpacity
                  style={styles.doneButton}
                  onPress={() => setIsOpen(false)}
                >
                  <Text style={styles.doneButtonText}>Fatto</Text>
                </TouchableOpacity>
              )}
            </View>
            
            <ScrollView 
              style={[styles.optionsList, { maxHeight }]}
              showsVerticalScrollIndicator={true}
              bounces={false}
            >
              {options.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.option,
                    isSelected(option) && styles.optionSelected,
                    index === options.length - 1 && styles.lastOption
                  ]}
                  onPress={() => handleSelect(option)}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.optionText,
                    isSelected(option) && styles.optionTextSelected
                  ]}>
                    {option}
                  </Text>
                  {isSelected(option) && (
                    <Check size={18} color={Colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  label: {
    ...Typography.body,
    color: Colors.text,
    marginBottom: Spacing.sm,
    fontWeight: '600',
  },
  selector: {
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 48,
  },
  selectorOpen: {
    borderColor: Colors.primary,
  },
  selectorText: {
    ...Typography.body,
    color: Colors.text,
    flex: 1,
  },
  placeholderText: {
    color: Colors.textSecondary,
  },
  chevron: {
    marginLeft: Spacing.sm,
  },
  chevronOpen: {
    transform: [{ rotate: '180deg' }],
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  dropdown: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  dropdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  dropdownTitle: {
    ...Typography.h3,
    color: Colors.text,
  },
  doneButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  doneButtonText: {
    ...Typography.caption,
    color: Colors.background,
    fontWeight: '600',
  },
  optionsList: {
    maxHeight: screenHeight * 0.4,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  lastOption: {
    borderBottomWidth: 0,
  },
  optionSelected: {
    backgroundColor: Colors.primary + '10',
  },
  optionText: {
    ...Typography.body,
    color: Colors.text,
    flex: 1,
  },
  optionTextSelected: {
    color: Colors.primary,
    fontWeight: '600',
  },
});