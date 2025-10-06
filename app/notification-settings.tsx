import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import { Bell, MessageSquare, Home, Calendar, Shield } from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';

type NotificationCategory = {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  enabled: boolean;
  subcategories?: {
    id: string;
    title: string;
    description: string;
    enabled: boolean;
  }[];
};

export default function NotificationSettingsScreen() {
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'undetermined'>('undetermined');
  const [categories, setCategories] = useState<NotificationCategory[]>([
    {
      id: 'messages',
      title: 'Messages',
      description: 'New messages from matches and landlords',
      icon: MessageSquare,
      enabled: true,
      subcategories: [
        {
          id: 'new_message',
          title: 'New Messages',
          description: 'When someone sends you a message',
          enabled: true,
        },
        {
          id: 'message_reply',
          title: 'Message Replies',
          description: 'When someone replies to your message',
          enabled: true,
        },
      ],
    },
    {
      id: 'matches',
      title: 'Matches',
      description: 'New matches and match updates',
      icon: Home,
      enabled: true,
      subcategories: [
        {
          id: 'new_match',
          title: 'New Matches',
          description: 'When you get a new match',
          enabled: true,
        },
        {
          id: 'match_expired',
          title: 'Match Expiring',
          description: 'When a match is about to expire',
          enabled: false,
        },
      ],
    },
    {
      id: 'viewings',
      title: 'Viewings & Appointments',
      description: 'Reminders for scheduled viewings',
      icon: Calendar,
      enabled: true,
      subcategories: [
        {
          id: 'viewing_reminder',
          title: 'Viewing Reminders',
          description: '1 hour before scheduled viewing',
          enabled: true,
        },
        {
          id: 'viewing_confirmed',
          title: 'Viewing Confirmed',
          description: 'When a viewing is confirmed',
          enabled: true,
        },
      ],
    },
    {
      id: 'security',
      title: 'Security & Account',
      description: 'Important account and security updates',
      icon: Shield,
      enabled: true,
      subcategories: [
        {
          id: 'login_alert',
          title: 'Login Alerts',
          description: 'When someone logs into your account',
          enabled: true,
        },
        {
          id: 'verification_status',
          title: 'Verification Updates',
          description: 'Updates on identity verification',
          enabled: true,
        },
      ],
    },
  ]);

  useEffect(() => {
    checkNotificationPermissions();
  }, []);

  const checkNotificationPermissions = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    setPermissionStatus(status);
  };

  const requestNotificationPermissions = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    setPermissionStatus(status);
    
    if (status === 'granted') {
      Alert.alert(
        'Notifications Enabled',
        'You will now receive notifications based on your preferences.',
        [{ text: 'OK' }]
      );
    } else if (status === 'denied') {
      Alert.alert(
        'Notifications Disabled',
        'To enable notifications, please go to your device settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Open Settings', 
            onPress: () => {
              Alert.alert(
                'Open Settings',
                'Please open your device settings and enable notifications for Tenant.',
                [{ text: 'OK' }]
              );
            }
          },
        ]
      );
    }
  };

  const toggleCategory = (categoryId: string) => {
    setCategories(prev =>
      prev.map(cat =>
        cat.id === categoryId
          ? { ...cat, enabled: !cat.enabled }
          : cat
      )
    );
  };

  const toggleSubcategory = (categoryId: string, subcategoryId: string) => {
    setCategories(prev =>
      prev.map(cat =>
        cat.id === categoryId
          ? {
              ...cat,
              subcategories: cat.subcategories?.map(sub =>
                sub.id === subcategoryId
                  ? { ...sub, enabled: !sub.enabled }
                  : sub
              ),
            }
          : cat
      )
    );
  };

  const renderPermissionBanner = () => {
    if (permissionStatus === 'granted') return null;

    return (
      <View style={styles.permissionBanner}>
        <View style={styles.permissionContent}>
          <Bell size={24} color={Colors.primary} />
          <View style={styles.permissionText}>
            <Text style={styles.permissionTitle}>
              {permissionStatus === 'denied' 
                ? 'Notifications Are Disabled' 
                : 'Enable Notifications'}
            </Text>
            <Text style={styles.permissionDescription}>
              {permissionStatus === 'denied'
                ? 'Go to Settings to enable notifications for this app'
                : 'Stay updated with messages, matches, and important updates'}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={requestNotificationPermissions}
          accessibilityRole="button"
          accessibilityLabel={permissionStatus === 'denied' ? 'Open settings' : 'Enable notifications'}
          accessibilityHint="Double tap to enable notifications"
        >
          <Text style={styles.permissionButtonText}>
            {permissionStatus === 'denied' ? 'Open Settings' : 'Enable'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen 
        options={{ 
          title: 'Notifications',
          headerBackTitle: 'Back',
        }} 
      />
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {renderPermissionBanner()}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Preferences</Text>
          <Text style={styles.sectionDescription}>
            Choose which notifications you want to receive. You can always change these later.
          </Text>
        </View>

        {categories.map((category) => {
          const IconComponent = category.icon;
          const isDisabled = permissionStatus !== 'granted';
          
          return (
            <View key={category.id} style={styles.categoryContainer}>
              <View style={styles.categoryHeader}>
                <View style={styles.categoryInfo}>
                  <View style={styles.categoryIconContainer}>
                    <IconComponent 
                      size={24} 
                      color={isDisabled ? Colors.textSecondary : Colors.primary} 
                    />
                  </View>
                  <View style={styles.categoryTextContainer}>
                    <Text 
                      style={[
                        styles.categoryTitle,
                        isDisabled && styles.disabledText
                      ]}
                    >
                      {category.title}
                    </Text>
                    <Text 
                      style={[
                        styles.categoryDescription,
                        isDisabled && styles.disabledText
                      ]}
                    >
                      {category.description}
                    </Text>
                  </View>
                </View>
                <Switch
                  value={category.enabled && !isDisabled}
                  onValueChange={() => toggleCategory(category.id)}
                  disabled={isDisabled}
                  trackColor={{ 
                    false: Colors.border, 
                    true: Colors.primary 
                  }}
                  thumbColor={Colors.background}
                  accessibilityRole="switch"
                  accessibilityLabel={`${category.title} notifications`}
                  accessibilityState={{ 
                    checked: category.enabled && !isDisabled,
                    disabled: isDisabled 
                  }}
                />
              </View>

              {category.enabled && !isDisabled && category.subcategories && (
                <View style={styles.subcategoriesContainer}>
                  {category.subcategories.map((sub) => (
                    <View key={sub.id} style={styles.subcategoryItem}>
                      <View style={styles.subcategoryInfo}>
                        <Text style={styles.subcategoryTitle}>{sub.title}</Text>
                        <Text style={styles.subcategoryDescription}>
                          {sub.description}
                        </Text>
                      </View>
                      <Switch
                        value={sub.enabled}
                        onValueChange={() => toggleSubcategory(category.id, sub.id)}
                        trackColor={{ 
                          false: Colors.border, 
                          true: Colors.primary 
                        }}
                        thumbColor={Colors.background}
                        accessibilityRole="switch"
                        accessibilityLabel={`${sub.title} notifications`}
                        accessibilityState={{ checked: sub.enabled }}
                      />
                    </View>
                  ))}
                </View>
              )}
            </View>
          );
        })}

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>About Notifications</Text>
          <Text style={styles.infoText}>
            • Notifications help you stay connected with matches and landlords
          </Text>
          <Text style={styles.infoText}>
            • You can customize each type of notification
          </Text>
          <Text style={styles.infoText}>
            • Critical security alerts are always enabled
          </Text>
          <Text style={styles.infoText}>
            • Quiet hours: 10 PM - 8 AM (configurable in settings)
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xl,
  },
  permissionBanner: {
    backgroundColor: Colors.backgroundSecondary,
    margin: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  permissionContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  permissionText: {
    flex: 1,
  },
  permissionTitle: {
    ...Typography.body,
    color: Colors.text,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  permissionDescription: {
    ...Typography.caption,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  permissionButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  permissionButtonText: {
    ...Typography.body,
    color: Colors.background,
    fontWeight: '600',
  },
  section: {
    padding: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  sectionDescription: {
    ...Typography.body,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  categoryContainer: {
    backgroundColor: Colors.backgroundSecondary,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    minHeight: 72,
  },
  categoryInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginRight: Spacing.md,
  },
  categoryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryTextContainer: {
    flex: 1,
  },
  categoryTitle: {
    ...Typography.body,
    color: Colors.text,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  categoryDescription: {
    ...Typography.caption,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  disabledText: {
    opacity: 0.5,
  },
  subcategoriesContainer: {
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  subcategoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    minHeight: 60,
  },
  subcategoryInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },
  subcategoryTitle: {
    ...Typography.body,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  subcategoryDescription: {
    ...Typography.caption,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  infoSection: {
    margin: Spacing.lg,
    padding: Spacing.lg,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.md,
  },
  infoTitle: {
    ...Typography.body,
    color: Colors.text,
    fontWeight: '600',
    marginBottom: Spacing.md,
  },
  infoText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.xs,
  },
});
