import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Stack, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Edit3, MapPin, Briefcase, Calendar, Settings, LogOut } from 'lucide-react-native';
import { useUser } from '@/store/user-store';
import { Colors, Typography, BorderRadius, Spacing } from '@/constants/theme';
import AccountSwitcher from '@/components/AccountSwitcher';

export default function ProfileScreen() {
  const { user, signOut, switchMode } = useUser();
  const insets = useSafeAreaInsets();

  if (!user) {
    return (
      <View
        style={[styles.container, { paddingTop: insets.top }]}
      >
        <Text style={[styles.message, { color: Colors.text }]}>Effettua l&apos;accesso per vedere il profilo</Text>
      </View>
    );
  }

  const profileSections = [
    {
      title: 'Informazioni personali',
      items: [
        { label: 'Età', value: `${user.age} anni`, icon: Calendar },
        { label: 'Professione', value: user.profession, icon: Briefcase },
        { label: 'Località preferita', value: user.preferred_location, icon: MapPin },
      ],
    },
    {
      title: 'Preferenze budget',
      items: [
        { label: 'Budget minimo', value: `€${user.budget_min}`, icon: null },
        { label: 'Budget massimo', value: `€${user.budget_max}`, icon: null },
      ],
    },
  ];

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Profilo' }} />
      
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 20) }}
      >
        <LinearGradient
          colors={[Colors.backgroundGradientStart, Colors.backgroundGradientEnd]}
          style={[styles.header, { paddingTop: insets.top + Spacing.xl }]}
        >
          <View style={styles.profileImageContainer}>
            <Image
              source={{ uri: user.profile_photos[0] }}
              style={styles.profileImage}
            />
            <TouchableOpacity 
              style={styles.editImageButton}
              onPress={() => router.push('/edit-profile')}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Modifica foto profilo"
              accessibilityHint="Tocca per cambiare la tua foto del profilo"
            >
              <Edit3 size={16} color={Colors.textLight} />
            </TouchableOpacity>
          </View>
          
          <Text 
            style={styles.name}
            accessibilityRole="header"
          >
            {user.full_name}
          </Text>
          <Text 
            style={styles.email}
            accessibilityRole="text"
          >
            {user.email}
          </Text>
          
          <View style={styles.subscriptionBadge}>
            <Text style={styles.subscriptionText}>
              {user.subscription_plan.toUpperCase()}
            </Text>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          <AccountSwitcher
            currentMode={user.current_mode}
            availableModes={['tenant', 'roommate', 'landlord']}
            onModeChange={switchMode}
          />
          
          <View style={styles.bioSection}>
            <Text 
              style={styles.sectionTitle}
              accessibilityRole="header"
            >
              Bio
            </Text>
            <Text 
              style={styles.bioText}
              accessibilityRole="text"
            >
              {user.bio}
            </Text>
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => router.push('/edit-profile')}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Modifica biografia"
              accessibilityHint="Tocca per modificare la tua biografia"
            >
              <Edit3 size={16} color={Colors.primary} />
              <Text style={styles.editButtonText}>Modifica</Text>
            </TouchableOpacity>
          </View>

          {profileSections.map((section) => (
            <View key={section.title} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              {section.items.map((item) => (
                <View key={item.label} style={styles.infoItem}>
                  {item.icon && <item.icon size={20} color={Colors.textSecondary} />}
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>{item.label}</Text>
                    <Text style={styles.infoValue}>{item.value}</Text>
                  </View>
                </View>
              ))}
            </View>
          ))}

          <View style={styles.tagsSection}>
            <Text style={styles.sectionTitle}>Stile di vita</Text>
            <View style={styles.tagsContainer}>
              {user.lifestyle_tags.map((tag) => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.actionsSection}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push('/edit-profile')}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Modifica profilo"
              accessibilityHint="Tocca per modificare le informazioni del tuo profilo"
            >
              <Settings size={20} color={Colors.textSecondary} />
              <Text style={styles.actionButtonText}>Modifica Profilo</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={signOut}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Esci dall'account"
              accessibilityHint="Tocca per disconnetterti dall'applicazione"
            >
              <LogOut size={20} color={Colors.error} />
              <Text style={[styles.actionButtonText, { color: Colors.error }]}>
                Esci
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
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
  header: {
    alignItems: 'center',
    padding: Spacing.xl,
    paddingTop: Spacing.xxl,
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: Spacing.md,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: Colors.textLight,
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.secondary,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.textLight,
  },
  name: {
    ...Typography.h2,
    color: Colors.textLight,
    marginBottom: Spacing.xs,
  },
  email: {
    ...Typography.body,
    color: Colors.textLight,
    opacity: 0.9,
    marginBottom: Spacing.md,
  },
  subscriptionBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  subscriptionText: {
    ...Typography.caption,
    color: Colors.textLight,
    fontWeight: '600',
  },
  content: {
    padding: Spacing.lg,
  },
  bioSection: {
    backgroundColor: Colors.backgroundSecondary,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
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
  sectionTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  bioText: {
    ...Typography.body,
    color: Colors.textSecondary,
    lineHeight: 24,
    marginBottom: Spacing.md,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  editButtonText: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: '600',
  },
  section: {
    backgroundColor: Colors.backgroundSecondary,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
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
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  infoValue: {
    ...Typography.body,
    color: Colors.text,
    fontWeight: '600',
  },
  tagsSection: {
    backgroundColor: Colors.backgroundSecondary,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
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
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  tag: {
    backgroundColor: Colors.backgroundSecondary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  tagText: {
    ...Typography.caption,
    color: Colors.text,
  },
  actionsSection: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    gap: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    minHeight: 44,
  },
  actionButtonText: {
    ...Typography.body,
    color: Colors.text,
  },
  message: {
    ...Typography.body,
    textAlign: 'center',
    color: Colors.text,
    margin: Spacing.lg,
  },
});