import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { t } from '../utils/translations';

type NavScreen = 'browse' | 'matches' | 'messages' | 'contracts' | 'profile';

interface BottomNavigationProps {
  currentScreen: NavScreen;
  onNavigate: (screen: NavScreen) => void;
  showContracts: boolean;
}

export default function BottomNavigation({ 
  currentScreen, 
  onNavigate,
  showContracts 
}: BottomNavigationProps) {
  const navItems: { screen: NavScreen; icon: string; label: string }[] = [
    { screen: 'browse', icon: 'explore', label: t('browse') },
    { screen: 'matches', icon: 'favorite', label: t('matches') },
    { screen: 'messages', icon: 'chat', label: t('messages') },
    ...(showContracts ? [{ screen: 'contracts' as NavScreen, icon: 'description', label: t('contracts') }] : []),
    { screen: 'profile', icon: 'person', label: t('profile') },
  ];

  return (
    <View style={styles.container}>
      {navItems.map((item) => {
        const isActive = currentScreen === item.screen;
        return (
          <TouchableOpacity
            key={item.screen}
            style={styles.navItem}
            onPress={() => onNavigate(item.screen)}
          >
            <MaterialIcons
              name={item.icon as any}
              size={24}
              color={isActive ? '#4ECDC4' : '#999'}
            />
            <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingBottom: 8,
    paddingTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 10,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  navLabel: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
    fontWeight: '500',
  },
  navLabelActive: {
    color: '#4ECDC4',
    fontWeight: '600',
  },
});