import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

type NavScreen = 'home' | 'discover' | 'matches' | 'bollette' | 'immobili' | 'profilo';

interface BottomNavigationProps {
  currentScreen: NavScreen;
  onNavigate: (screen: NavScreen) => void;
  showContracts: boolean;
  userRole?: 'tenant' | 'landlord';
}

export default function BottomNavigation({ 
  currentScreen, 
  onNavigate,
  showContracts,
  userRole = 'tenant'
}: BottomNavigationProps) {
  console.log('🔵 BottomNavigation - Rendering with:', { currentScreen, showContracts, userRole });
  console.log('🔵 BottomNavigation - Component is being rendered!');
  const navItems: { screen: NavScreen; icon: string; label: string }[] = [
    { screen: 'home', icon: 'home', label: 'Home' },
    { 
      screen: 'discover', 
      icon: userRole === 'tenant' ? 'search' : 'people', 
      label: userRole === 'tenant' ? 'Scopri' : 'Inquilini' 
    },
    { 
      screen: 'matches', 
      icon: 'favorite', 
      label: 'Match' 
    },
    { 
      screen: 'bollette', 
      icon: 'receipt', 
      label: userRole === 'tenant' ? 'Bollette' : 'Entrate' 
    },
    // Only show Immobili tab for landlords
    ...(userRole === 'landlord' ? [{ screen: 'immobili' as NavScreen, icon: 'business', label: 'Immobili' }] : []),
    { screen: 'profilo', icon: 'person', label: 'Profilo' },
  ];

  return (
    <View style={styles.container}>
      {navItems.map((item) => {
        const isActive = currentScreen === item.screen;
        return (
          <TouchableOpacity
            key={item.screen}
            style={styles.navItem}
            onPress={() => {
              console.log('🔘 BottomNavigation - Button pressed:', item.screen);
              console.log('🔘 BottomNavigation - Calling onNavigate with:', item.screen);
              console.log('🔘 BottomNavigation - onNavigate function exists:', !!onNavigate);
              if (onNavigate) {
                onNavigate(item.screen);
                console.log('🔘 BottomNavigation - onNavigate called successfully');
              } else {
                console.log('🔘 BottomNavigation - onNavigate is null/undefined');
              }
            }}
          >
            <MaterialIcons
              name={item.icon as any}
              size={24}
              color={isActive ? '#2196F3' : '#999'}
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
    borderTopColor: '#e0e0e0',
    paddingBottom: 8,
    paddingTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  navLabel: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    fontWeight: '500',
  },
  navLabelActive: {
    color: '#2196F3',
    fontWeight: '600',
  },
});