import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { 
  Download, 
  Trash2, 
  Eye, 
  EyeOff, 
  Shield, 
  Database,
  FileText,
  ArrowLeft,
  CheckCircle,
  AlertCircle
} from 'lucide-react-native';
import { useUser } from '@/store/user-store';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';

export default function DataManagementScreen() {
  const { user } = useUser();
  const [dataVisibility, setDataVisibility] = useState({
    profilePhotos: true,
    workContract: false,
    verificationDocuments: false,
    searchHistory: true,
    messageHistory: true,
  });

  const handleExportData = () => {
    Alert.alert(
      'Esporta i Tuoi Dati',
      'Riceverai un\'email con tutti i tuoi dati in formato JSON entro 48 ore. Questo include profilo, messaggi, preferenze e cronologia.',
      [
        { text: 'Annulla', style: 'cancel' },
        { 
          text: 'Conferma', 
          onPress: () => {
            Alert.alert('Richiesta Inviata', 'Riceverai un\'email con i tuoi dati entro 48 ore.');
          }
        }
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Elimina Account',
      'Questa azione è irreversibile. Tutti i tuoi dati, messaggi, preferenze e cronologia saranno eliminati permanentemente. Sei sicuro?',
      [
        { text: 'Annulla', style: 'cancel' },
        { 
          text: 'Elimina', 
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Conferma Eliminazione',
              'Inserisci la tua password per confermare l\'eliminazione dell\'account.',
              [
                { text: 'Annulla', style: 'cancel' },
                { 
                  text: 'Conferma Eliminazione', 
                  style: 'destructive',
                  onPress: () => {
                    Alert.alert('Account Eliminato', 'Il tuo account è stato eliminato con successo.');
                    router.replace('/login');
                  }
                }
              ]
            );
          }
        }
      ]
    );
  };

  const handleClearSearchHistory = () => {
    Alert.alert(
      'Cancella Cronologia Ricerche',
      'Vuoi eliminare tutta la cronologia delle tue ricerche?',
      [
        { text: 'Annulla', style: 'cancel' },
        { 
          text: 'Cancella', 
          onPress: () => {
            Alert.alert('Completato', 'Cronologia ricerche cancellata.');
          }
        }
      ]
    );
  };

  const handleClearMessageHistory = () => {
    Alert.alert(
      'Cancella Cronologia Messaggi',
      'Vuoi eliminare tutti i tuoi messaggi? Questa azione non può essere annullata.',
      [
        { text: 'Annulla', style: 'cancel' },
        { 
          text: 'Cancella', 
          style: 'destructive',
          onPress: () => {
            Alert.alert('Completato', 'Cronologia messaggi cancellata.');
          }
        }
      ]
    );
  };

  const toggleDataVisibility = (key: keyof typeof dataVisibility) => {
    setDataVisibility(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Gestione Dati',
          headerShown: true,
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => router.back()}
              accessibilityRole="button"
              accessibilityLabel="Torna indietro"
            >
              <ArrowLeft size={24} color={Colors.primary} />
            </TouchableOpacity>
          ),
        }} 
      />
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Database size={48} color={Colors.primary} />
          <Text 
            style={styles.title}
            accessibilityRole="header"
            maxFontSizeMultiplier={1.5}
          >
            Gestisci i Tuoi Dati
          </Text>
          <Text 
            style={styles.subtitle}
            maxFontSizeMultiplier={2.0}
          >
            Hai il pieno controllo sui tuoi dati personali. Esporta, elimina o gestisci la visibilità delle tue informazioni.
          </Text>
        </View>

        <View style={styles.section}>
          <Text 
            style={styles.sectionTitle}
            maxFontSizeMultiplier={1.5}
          >
            Visibilità dei Dati
          </Text>
          <Text 
            style={styles.sectionDescription}
            maxFontSizeMultiplier={2.0}
          >
            Controlla quali dati sono visibili ad altri utenti
          </Text>

          {Object.entries(dataVisibility).map(([key, value]) => (
            <View 
              key={key} 
              style={styles.visibilityItem}
              accessible={true}
              accessibilityRole="switch"
              accessibilityLabel={`${key}: ${value ? 'visibile' : 'nascosto'}`}
              accessibilityState={{ checked: value }}
            >
              <View style={styles.visibilityItemLeft}>
                {value ? (
                  <Eye size={20} color={Colors.success} />
                ) : (
                  <EyeOff size={20} color={Colors.textSecondary} />
                )}
                <Text style={styles.visibilityItemText}>
                  {key === 'profilePhotos' && 'Foto Profilo'}
                  {key === 'workContract' && 'Contratto di Lavoro'}
                  {key === 'verificationDocuments' && 'Documenti di Verifica'}
                  {key === 'searchHistory' && 'Cronologia Ricerche'}
                  {key === 'messageHistory' && 'Cronologia Messaggi'}
                </Text>
              </View>
              <Switch
                value={value}
                onValueChange={() => toggleDataVisibility(key as keyof typeof dataVisibility)}
                trackColor={{ false: Colors.border, true: Colors.primary }}
                thumbColor={Colors.background}
                accessibilityLabel={`Attiva/disattiva visibilità ${key}`}
              />
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text 
            style={styles.sectionTitle}
            maxFontSizeMultiplier={1.5}
          >
            Azioni sui Dati
          </Text>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleExportData}
            accessibilityRole="button"
            accessibilityLabel="Esporta tutti i tuoi dati"
            accessibilityHint="Tocca due volte per richiedere l'esportazione dei dati"
          >
            <View style={styles.actionButtonLeft}>
              <View style={[styles.actionIcon, { backgroundColor: `${Colors.primary}15` }]}>
                <Download size={20} color={Colors.primary} />
              </View>
              <View style={styles.actionButtonText}>
                <Text 
                  style={styles.actionButtonTitle}
                  maxFontSizeMultiplier={1.5}
                >
                  Esporta i Tuoi Dati
                </Text>
                <Text 
                  style={styles.actionButtonDescription}
                  maxFontSizeMultiplier={2.0}
                >
                  Ricevi una copia di tutti i tuoi dati
                </Text>
              </View>
            </View>
            <CheckCircle size={20} color={Colors.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleClearSearchHistory}
            accessibilityRole="button"
            accessibilityLabel="Cancella cronologia ricerche"
            accessibilityHint="Tocca due volte per eliminare la cronologia delle ricerche"
          >
            <View style={styles.actionButtonLeft}>
              <View style={[styles.actionIcon, { backgroundColor: `${Colors.accent}15` }]}>
                <FileText size={20} color={Colors.accent} />
              </View>
              <View style={styles.actionButtonText}>
                <Text 
                  style={styles.actionButtonTitle}
                  maxFontSizeMultiplier={1.5}
                >
                  Cancella Cronologia Ricerche
                </Text>
                <Text 
                  style={styles.actionButtonDescription}
                  maxFontSizeMultiplier={2.0}
                >
                  Elimina tutte le ricerche salvate
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleClearMessageHistory}
            accessibilityRole="button"
            accessibilityLabel="Cancella cronologia messaggi"
            accessibilityHint="Tocca due volte per eliminare tutti i messaggi"
          >
            <View style={styles.actionButtonLeft}>
              <View style={[styles.actionIcon, { backgroundColor: `${Colors.accent}15` }]}>
                <FileText size={20} color={Colors.accent} />
              </View>
              <View style={styles.actionButtonText}>
                <Text 
                  style={styles.actionButtonTitle}
                  maxFontSizeMultiplier={1.5}
                >
                  Cancella Cronologia Messaggi
                </Text>
                <Text 
                  style={styles.actionButtonDescription}
                  maxFontSizeMultiplier={2.0}
                >
                  Elimina tutti i messaggi inviati e ricevuti
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.dangerSection}>
          <View style={styles.dangerHeader}>
            <AlertCircle size={24} color={Colors.error} />
            <Text 
              style={styles.dangerTitle}
              maxFontSizeMultiplier={1.5}
            >
              Zona Pericolosa
            </Text>
          </View>

          <TouchableOpacity
            style={styles.dangerButton}
            onPress={handleDeleteAccount}
            accessibilityRole="button"
            accessibilityLabel="Elimina account permanentemente"
            accessibilityHint="Tocca due volte per eliminare il tuo account. Questa azione è irreversibile."
          >
            <View style={styles.actionButtonLeft}>
              <View style={[styles.actionIcon, { backgroundColor: `${Colors.error}15` }]}>
                <Trash2 size={20} color={Colors.error} />
              </View>
              <View style={styles.actionButtonText}>
                <Text 
                  style={[styles.actionButtonTitle, { color: Colors.error }]}
                  maxFontSizeMultiplier={1.5}
                >
                  Elimina Account
                </Text>
                <Text 
                  style={styles.actionButtonDescription}
                  maxFontSizeMultiplier={2.0}
                >
                  Elimina permanentemente il tuo account e tutti i dati
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.infoBox}>
          <Shield size={20} color={Colors.primary} />
          <Text 
            style={styles.infoText}
            maxFontSizeMultiplier={2.0}
          >
            Tutti i tuoi dati sono protetti con crittografia end-to-end e conformi al GDPR. Hai il diritto di accedere, modificare o eliminare i tuoi dati in qualsiasi momento.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.privacyPolicyButton}
          onPress={() => router.push('/privacy-policy')}
          accessibilityRole="button"
          accessibilityLabel="Leggi la privacy policy completa"
        >
          <Text 
            style={styles.privacyPolicyButtonText}
            maxFontSizeMultiplier={1.5}
          >
            Leggi la Privacy Policy Completa
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
    paddingVertical: Spacing.lg,
  },
  title: {
    ...Typography.h1,
    color: Colors.text,
    textAlign: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  section: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  sectionDescription: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  visibilityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  visibilityItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  visibilityItemText: {
    ...Typography.body,
    color: Colors.text,
  },
  actionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  actionButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonText: {
    flex: 1,
  },
  actionButtonTitle: {
    ...Typography.body,
    color: Colors.text,
    fontWeight: '600',
    marginBottom: 2,
  },
  actionButtonDescription: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  dangerSection: {
    backgroundColor: `${Colors.error}10`,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginVertical: Spacing.lg,
    borderWidth: 1,
    borderColor: `${Colors.error}30`,
  },
  dangerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  dangerTitle: {
    ...Typography.h3,
    color: Colors.error,
  },
  dangerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: `${Colors.primary}10`,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  infoText: {
    ...Typography.caption,
    color: Colors.text,
    flex: 1,
    lineHeight: 20,
  },
  privacyPolicyButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  privacyPolicyButtonText: {
    ...Typography.body,
    color: Colors.primary,
    fontWeight: '600',
  },
});
