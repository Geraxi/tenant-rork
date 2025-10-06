import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, Modal, Pressable } from 'react-native';
import { Stack, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Edit3, MapPin, Briefcase, Calendar, LogOut, Shield, Trash2, ChevronRight, Database, Bell } from 'lucide-react-native';
import { useUser } from '@/store/user-store';
import { Colors, Typography, BorderRadius, Spacing } from '@/constants/theme';
import AccountSwitcher from '@/components/AccountSwitcher';

export default function ProfileScreen() {
  const { user, signOut, switchMode, deleteAccount } = useUser();
  const insets = useSafeAreaInsets();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const handleSignOut = () => {
    Alert.alert(
      'Esci dall\'account',
      'Sei sicuro di voler uscire? Potrai accedere nuovamente in qualsiasi momento.',
      [
        {
          text: 'Annulla',
          style: 'cancel',
        },
        {
          text: 'Esci',
          style: 'destructive',
          onPress: signOut,
        },
      ],
      { cancelable: true }
    );
  };

  const handleDeleteAccount = () => {
    setShowDeleteModal(true);
  };

  const confirmDeleteAccount = () => {
    Alert.alert(
      'Elimina account',
      'Questa azione è permanente e non può essere annullata. Tutti i tuoi dati verranno eliminati definitivamente.',
      [
        {
          text: 'Annulla',
          style: 'cancel',
          onPress: () => setShowDeleteModal(false),
        },
        {
          text: 'Elimina',
          style: 'destructive',
          onPress: async () => {
            setShowDeleteModal(false);
            if (deleteAccount) {
              await deleteAccount();
            }
          },
        },
      ]
    );
  };

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
              <Edit3 size={20} color={Colors.textSecondary} />
              <View style={styles.actionButtonContent}>
                <Text style={styles.actionButtonText}>Modifica Profilo</Text>
                <Text style={styles.actionButtonSubtext}>Aggiorna le tue informazioni</Text>
              </View>
              <ChevronRight size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push('/notification-settings')}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Notifiche"
              accessibilityHint="Tocca per gestire le preferenze di notifica"
            >
              <Bell size={20} color={Colors.textSecondary} />
              <View style={styles.actionButtonContent}>
                <Text style={styles.actionButtonText}>Notifiche</Text>
                <Text style={styles.actionButtonSubtext}>Gestisci le tue preferenze</Text>
              </View>
              <ChevronRight size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => setShowPrivacyModal(true)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Privacy e dati"
              accessibilityHint="Tocca per gestire le impostazioni sulla privacy"
            >
              <Shield size={20} color={Colors.textSecondary} />
              <View style={styles.actionButtonContent}>
                <Text style={styles.actionButtonText}>Privacy e Dati</Text>
                <Text style={styles.actionButtonSubtext}>Gestisci le tue informazioni</Text>
              </View>
              <ChevronRight size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push('/data-management')}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Gestione dati"
              accessibilityHint="Tocca per scaricare o eliminare i tuoi dati"
            >
              <Database size={20} color={Colors.textSecondary} />
              <View style={styles.actionButtonContent}>
                <Text style={styles.actionButtonText}>Gestione Dati</Text>
                <Text style={styles.actionButtonSubtext}>Scarica o elimina i tuoi dati</Text>
              </View>
              <ChevronRight size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={handleSignOut}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Esci dall'account"
              accessibilityHint="Tocca per disconnetterti dall'applicazione"
            >
              <LogOut size={20} color={Colors.textSecondary} />
              <View style={styles.actionButtonContent}>
                <Text style={styles.actionButtonText}>Esci</Text>
                <Text style={styles.actionButtonSubtext}>Disconnettiti dall&apos;app</Text>
              </View>
              <ChevronRight size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.deleteButton]} 
              onPress={handleDeleteAccount}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Elimina account"
              accessibilityHint="Tocca per eliminare permanentemente il tuo account"
            >
              <Trash2 size={20} color={Colors.error} />
              <View style={styles.actionButtonContent}>
                <Text style={[styles.actionButtonText, { color: Colors.error }]}>Elimina Account</Text>
                <Text style={[styles.actionButtonSubtext, { color: Colors.error }]}>Azione permanente</Text>
              </View>
              <ChevronRight size={20} color={Colors.error} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Privacy Modal */}
      <Modal
        visible={showPrivacyModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPrivacyModal(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setShowPrivacyModal(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Shield size={32} color={Colors.primary} />
              <Text style={styles.modalTitle}>Privacy e Dati</Text>
              <Text style={styles.modalSubtitle}>Controlla le tue informazioni</Text>
            </View>
            
            <View style={styles.privacySection}>
              <Text style={styles.privacySectionTitle}>Dati memorizzati</Text>
              <Text style={styles.privacyText}>• Informazioni del profilo</Text>
              <Text style={styles.privacyText}>• Foto e documenti</Text>
              <Text style={styles.privacyText}>• Preferenze e impostazioni</Text>
              <Text style={styles.privacyText}>• Cronologia delle interazioni</Text>
            </View>
            
            <View style={styles.privacySection}>
              <Text style={styles.privacySectionTitle}>I tuoi diritti</Text>
              <Text style={styles.privacyText}>• Accedere ai tuoi dati</Text>
              <Text style={styles.privacyText}>• Correggere informazioni errate</Text>
              <Text style={styles.privacyText}>• Scaricare i tuoi dati</Text>
              <Text style={styles.privacyText}>• Eliminare il tuo account</Text>
            </View>
            
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setShowPrivacyModal(false);
                router.push('/privacy-policy');
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.modalButtonText}>Leggi l&apos;informativa completa</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowPrivacyModal(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.modalCloseButtonText}>Chiudi</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* Delete Account Modal */}
      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.deleteModalOverlay}>
          <View style={styles.deleteModalContent}>
            <View style={styles.deleteModalHeader}>
              <Trash2 size={48} color={Colors.error} />
              <Text style={styles.deleteModalTitle}>Elimina Account</Text>
            </View>
            
            <Text style={styles.deleteModalText}>
              Sei sicuro di voler eliminare il tuo account?
            </Text>
            
            <View style={styles.deleteWarningBox}>
              <Text style={styles.deleteWarningTitle}>Questa azione:</Text>
              <Text style={styles.deleteWarningText}>• Eliminerà tutti i tuoi dati</Text>
              <Text style={styles.deleteWarningText}>• Rimuoverà tutte le tue foto</Text>
              <Text style={styles.deleteWarningText}>• Cancellerà le tue conversazioni</Text>
              <Text style={styles.deleteWarningText}>• Non può essere annullata</Text>
            </View>
            
            <View style={styles.deleteModalButtons}>
              <TouchableOpacity
                style={styles.deleteCancelButton}
                onPress={() => setShowDeleteModal(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.deleteCancelButtonText}>Annulla</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.deleteConfirmButton}
                onPress={confirmDeleteAccount}
                activeOpacity={0.7}
              >
                <Text style={styles.deleteConfirmButtonText}>Elimina</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    minHeight: 60,
  },
  actionButtonContent: {
    flex: 1,
  },
  actionButtonText: {
    ...Typography.body,
    color: Colors.text,
    fontWeight: '600',
    marginBottom: 2,
  },
  actionButtonSubtext: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  deleteButton: {
    borderBottomWidth: 0,
  },
  message: {
    ...Typography.body,
    textAlign: 'center',
    color: Colors.text,
    margin: Spacing.lg,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.xl,
    maxHeight: '80%',
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  modalTitle: {
    ...Typography.h2,
    color: Colors.text,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  modalSubtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  privacySection: {
    marginBottom: Spacing.xl,
  },
  privacySectionTitle: {
    ...Typography.body,
    color: Colors.text,
    fontWeight: '600',
    marginBottom: Spacing.md,
  },
  privacyText: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    lineHeight: 22,
  },
  modalButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    marginBottom: Spacing.md,
    minHeight: 44,
    justifyContent: 'center',
  },
  modalButtonText: {
    ...Typography.body,
    color: Colors.background,
    fontWeight: '600',
  },
  modalCloseButton: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  modalCloseButtonText: {
    ...Typography.body,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  deleteModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  deleteModalContent: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    width: '100%',
    maxWidth: 400,
  },
  deleteModalHeader: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  deleteModalTitle: {
    ...Typography.h2,
    color: Colors.error,
    marginTop: Spacing.md,
  },
  deleteModalText: {
    ...Typography.body,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    lineHeight: 24,
  },
  deleteWarningBox: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  deleteWarningTitle: {
    ...Typography.body,
    color: Colors.text,
    fontWeight: '600',
    marginBottom: Spacing.md,
  },
  deleteWarningText: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    lineHeight: 22,
  },
  deleteModalButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  deleteCancelButton: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  deleteCancelButtonText: {
    ...Typography.body,
    color: Colors.text,
    fontWeight: '600',
  },
  deleteConfirmButton: {
    flex: 1,
    backgroundColor: Colors.error,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  deleteConfirmButtonText: {
    ...Typography.body,
    color: Colors.background,
    fontWeight: '600',
  },
});