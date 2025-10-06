import { Tabs } from 'expo-router';
import React from 'react';
import { Home, Search, Heart, MessageCircle, User, FileText } from 'lucide-react-native';
import { Colors } from '@/constants/theme';

export default function TabLayout() {
  return (
    <Tabs
      initialRouteName="browse"
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.background,
          borderTopColor: Colors.border,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="browse"
        options={{
          title: 'Sfoglia',
          tabBarIcon: ({ color, size }) => <Search size={size} color={color} />,
          tabBarAccessibilityLabel: 'Sfoglia immobili',
        }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
          tabBarAccessibilityLabel: 'Dashboard principale',
        }}
      />
      <Tabs.Screen
        name="matches"
        options={{
          title: 'Match',
          tabBarIcon: ({ color, size }) => <Heart size={size} color={color} />,
          tabBarAccessibilityLabel: 'I tuoi match',
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messaggi',
          tabBarIcon: ({ color, size }) => <MessageCircle size={size} color={color} />,
          tabBarAccessibilityLabel: 'Messaggi e conversazioni',
        }}
      />
      <Tabs.Screen
        name="contracts"
        options={{
          title: 'Contratti',
          tabBarIcon: ({ color, size }) => <FileText size={size} color={color} />,
          tabBarAccessibilityLabel: 'Gestione contratti',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profilo',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
          tabBarAccessibilityLabel: 'Il tuo profilo',
        }}
      />
    </Tabs>
  );
}