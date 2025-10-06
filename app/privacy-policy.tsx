import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { Shield, Lock, Eye, Database, UserCheck, FileText, ArrowLeft } from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';

export default function PrivacyPolicyScreen() {
  const sections = [
    {
      icon: Shield,
      title: 'Raccolta dei Dati',
      content: 'Raccogliamo solo i dati necessari per fornire i nostri servizi. Questo include informazioni del profilo, foto, preferenze di ricerca e dati di verifica dell\'identità. Tutti i dati sono raccolti con il tuo esplicito consenso.'
    },
    {
      icon: Lock,
      title: 'Sicurezza dei Dati',
      content: 'I tuoi dati sono protetti con crittografia end-to-end. Le informazioni sensibili come documenti d\'identità sono elaborate da partner di verifica certificati e non vengono mai memorizzate sui nostri server.'
    },
    {
      icon: Eye,
      title: 'Utilizzo dei Dati',
      content: 'Utilizziamo i tuoi dati esclusivamente per: mostrarti proprietà rilevanti, facilitare la comunicazione con proprietari/inquilini, verificare la tua identità e migliorare i nostri servizi. Non vendiamo mai i tuoi dati a terze parti.'
    },
    {
      icon: Database,
      title: 'Conservazione dei Dati',
      content: 'Conserviamo i tuoi dati solo per il tempo necessario a fornire i nostri servizi. Puoi richiedere l\'eliminazione del tuo account e di tutti i dati associati in qualsiasi momento dalle impostazioni del profilo.'
    },
    {
      icon: UserCheck,
      title: 'I Tuoi Diritti',
      content: 'Hai il diritto di: accedere ai tuoi dati, richiedere correzioni, eliminare il tuo account, esportare i tuoi dati, revocare il consenso in qualsiasi momento. Contattaci per esercitare questi diritti.'
    },
    {
      icon: FileText,
      title: 'Condivisione dei Dati',
      content: 'Condividiamo i tuoi dati solo quando: tu dai esplicito consenso, è richiesto dalla legge, è necessario per fornire il servizio (es. mostrare il tuo profilo ai proprietari). Hai sempre il controllo su cosa condividere.'
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Privacy Policy',
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
          <Shield size={48} color={Colors.primary} />
          <Text 
            style={styles.title}
            accessibilityRole="header"
            maxFontSizeMultiplier={1.5}
          >
            La Tua Privacy è la Nostra Priorità
          </Text>
          <Text 
            style={styles.subtitle}
            maxFontSizeMultiplier={2.0}
          >
            Siamo trasparenti su come raccogliamo, utilizziamo e proteggiamo i tuoi dati personali.
          </Text>
          <Text 
            style={styles.lastUpdated}
            maxFontSizeMultiplier={2.0}
          >
            Ultimo aggiornamento: {new Date().toLocaleDateString('it-IT')}
          </Text>
        </View>

        {sections.map((section, index) => {
          const IconComponent = section.icon;
          return (
            <View 
              key={index} 
              style={styles.section}
              accessible={true}
              accessibilityRole="text"
            >
              <View style={styles.sectionHeader}>
                <View style={styles.iconContainer}>
                  <IconComponent size={24} color={Colors.primary} />
                </View>
                <Text 
                  style={styles.sectionTitle}
                  maxFontSizeMultiplier={1.5}
                >
                  {section.title}
                </Text>
              </View>
              <Text 
                style={styles.sectionContent}
                maxFontSizeMultiplier={2.0}
              >
                {section.content}
              </Text>
            </View>
          );
        })}

        <View style={styles.gdprSection}>
          <Text 
            style={styles.gdprTitle}
            maxFontSizeMultiplier={1.5}
          >
            Conformità GDPR
          </Text>
          <Text 
            style={styles.gdprText}
            maxFontSizeMultiplier={2.0}
          >
            Tenant è pienamente conforme al Regolamento Generale sulla Protezione dei Dati (GDPR) dell&apos;Unione Europea. Rispettiamo tutti i tuoi diritti sulla privacy e garantiamo la massima trasparenza nel trattamento dei dati personali.
          </Text>
        </View>

        <View style={styles.contactSection}>
          <Text 
            style={styles.contactTitle}
            maxFontSizeMultiplier={1.5}
          >
            Hai Domande sulla Privacy?
          </Text>
          <Text 
            style={styles.contactText}
            maxFontSizeMultiplier={2.0}
          >
            Contatta il nostro Data Protection Officer:
          </Text>
          <Text 
            style={styles.contactEmail}
            maxFontSizeMultiplier={2.0}
          >
            privacy@tenant.app
          </Text>
        </View>

        <TouchableOpacity
          style={styles.manageDataButton}
          onPress={() => router.push('/data-management' as any)}
          accessibilityRole="button"
          accessibilityLabel="Gestisci i tuoi dati"
          accessibilityHint="Tocca due volte per accedere alle opzioni di gestione dei dati"
        >
          <Database size={20} color={Colors.background} />
          <Text 
            style={styles.manageDataButtonText}
            maxFontSizeMultiplier={1.5}
          >
            Gestisci i Tuoi Dati
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
    marginBottom: Spacing.sm,
  },
  lastUpdated: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  section: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${Colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.text,
    flex: 1,
  },
  sectionContent: {
    ...Typography.body,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  gdprSection: {
    backgroundColor: `${Colors.success}15`,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginVertical: Spacing.lg,
    borderWidth: 1,
    borderColor: `${Colors.success}30`,
  },
  gdprTitle: {
    ...Typography.h3,
    color: Colors.success,
    marginBottom: Spacing.sm,
  },
  gdprText: {
    ...Typography.body,
    color: Colors.text,
    lineHeight: 24,
  },
  contactSection: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    alignItems: 'center',
  },
  contactTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  contactText: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  contactEmail: {
    ...Typography.body,
    color: Colors.primary,
    fontWeight: '600',
    textAlign: 'center',
  },
  manageDataButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  manageDataButtonText: {
    ...Typography.body,
    color: Colors.background,
    fontWeight: '600',
  },
});
