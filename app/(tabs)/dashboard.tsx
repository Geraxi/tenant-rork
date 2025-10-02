import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Stack, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  Heart, MessageCircle, Home, Plus, Eye, List, Users, Filter, 
  Zap, Shield, Smartphone, Code, Star, ArrowRight, QrCode,
  Play, Clock, MapPin, BarChart3,
  Rocket, Sparkles, User, Settings
} from 'lucide-react-native';
import { useUser } from '@/store/user-store';
import ModeSwitch from '@/components/ModeSwitch';
import TenantLogo from '@/components/TenantLogo';
import { Colors, Typography, BorderRadius, Spacing } from '@/constants/theme';

export default function DashboardScreen() {
  const { user, switchMode } = useUser();
  const insets = useSafeAreaInsets();

  const appMetrics = [
    { label: 'Annunci Attivi', value: '500+', icon: Home, color: Colors.primary },
    { label: 'Utenti Felici', value: '2.5K', icon: Users, color: Colors.success },
    { label: 'Risposta Media', value: '< 30min', icon: Clock, color: Colors.accent },
    { label: 'Città', value: '15+', icon: MapPin, color: Colors.warning },
  ];

  const coreFeatures = [
    {
      id: 'swipe-browsing',
      title: 'Navigazione con Swipe',
      description: 'Interfaccia stile Tinder per scoprire proprietà in modo velocissimo',
      icon: Heart,
      color: Colors.primary,
    },
    {
      id: 'real-time-chat',
      title: 'Chat in Tempo Reale',
      description: 'Messaggistica istantanea con proprietari e coinquilini',
      icon: MessageCircle,
      color: Colors.success,
    },
    {
      id: 'smart-filters',
      title: 'Filtri Intelligenti',
      description: 'Filtraggio avanzato per prezzo, posizione, servizi e altro',
      icon: Filter,
      color: Colors.accent,
    },
  ];

  const additionalFeatures = [
    { id: 'premium', title: 'Abbonamenti Premium', icon: Star },
    { id: 'multi-mode', title: 'Esperienza Multi-Modalità', icon: Users },
    { id: 'verified', title: 'Profili Verificati', icon: Shield },
    { id: 'offline', title: 'Supporto Offline', icon: Smartphone },
    { id: 'matching', title: 'Matching Intelligente', icon: Zap },
    { id: 'cross-platform', title: 'Cross-Platform', icon: Code },
  ];





  const userStats = user ? [
    { label: 'I Tuoi Match', value: '12', icon: Heart, color: Colors.primary },
    { label: 'Messaggi', value: '8', icon: MessageCircle, color: Colors.primaryLight },
    { label: 'Annunci', value: user.current_mode === 'landlord' ? '3' : '0', icon: Home, color: Colors.accent },
  ] : [];

  const quickActions = user && user.current_mode === 'landlord' 
    ? [
        { label: 'I Miei Annunci', icon: List, action: () => router.push('/my-listings') },
        { label: 'Aggiungi Annuncio', icon: Plus, action: () => router.push('/add-listing') },
        { label: 'Funzioni Avanzate', icon: Settings, action: () => router.push('/advanced-features') },
        { label: 'Vedi Match', icon: Eye, action: () => router.push('/matches') },
      ]
    : [
        { label: 'Inizia a Navigare', icon: Eye, action: () => router.push('/browse') },
        { label: 'Vedi Match', icon: Heart, action: () => router.push('/matches') },
      ];

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Tenant — Panoramica Progetto', headerShown: false }} />
      
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 20) }}
      >
        {/* Hero Section */}
        <LinearGradient
          colors={[Colors.backgroundGradientStart, Colors.backgroundGradientEnd]}
          style={[styles.heroSection, { paddingTop: insets.top + Spacing.lg }]}
        >
          <View style={styles.heroContent}>
            <TenantLogo size={80} />
            <Text style={styles.appName}>Tenant</Text>
            <Text style={styles.tagline}>Trova la casa dei tuoi sogni con uno swipe</Text>
            <Text style={styles.heroDescription}>
              Basta scorrere all&apos;infinito. Scorri tra annunci di affitto selezionati con l&apos;esperienza intuitiva delle moderne app di incontri.
            </Text>
            
            <View style={styles.heroButtons}>
              <TouchableOpacity style={styles.primaryButton} onPress={() => router.push('/browse')}>
                <Play size={20} color={Colors.textLight} />
                <Text style={styles.primaryButtonText}>Prova Demo</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.secondaryButton}>
                <QrCode size={20} color={Colors.textLight} />
                <Text style={styles.secondaryButtonText}>Scansiona QR</Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          {/* Key Metrics */}
          <View style={styles.section}>
            <View style={styles.sectionTitleContainer}>
              <BarChart3 size={20} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Metriche Live</Text>
            </View>
            <View style={styles.metricsGrid}>
              {appMetrics.map((metric) => (
                <View key={metric.label} style={styles.metricCard}>
                  <View style={[styles.metricIcon, { backgroundColor: metric.color }]}>
                    <metric.icon size={20} color={Colors.background} />
                  </View>
                  <Text style={styles.metricValue}>{metric.value}</Text>
                  <Text style={styles.metricLabel}>{metric.label}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Core Features */}
          <View style={styles.section}>
            <View style={styles.sectionTitleContainer}>
              <Rocket size={20} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Funzionalità Principali</Text>
            </View>
            {coreFeatures.map((feature) => (
              <View key={feature.id} style={styles.featureCard}>
                <View style={[styles.featureIcon, { backgroundColor: feature.color }]}>
                  <feature.icon size={24} color={Colors.background} />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
                <ArrowRight size={20} color={Colors.textSecondary} />
              </View>
            ))}
          </View>

          {/* Additional Features */}
          <View style={styles.section}>
            <View style={styles.sectionTitleContainer}>
              <Sparkles size={20} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Funzionalità Aggiuntive</Text>
            </View>
            <View style={styles.additionalFeaturesGrid}>
              {additionalFeatures.map((feature) => (
                <View key={feature.id} style={styles.additionalFeatureCard}>
                  <feature.icon size={20} color={Colors.primary} />
                  <Text style={styles.additionalFeatureText}>{feature.title}</Text>
                </View>
              ))}
            </View>
          </View>



          {/* Advanced Features */}
          <View style={styles.section}>
            <View style={styles.sectionTitleContainer}>
              <Settings size={20} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Funzionalità Avanzate</Text>
            </View>
            <TouchableOpacity 
              style={styles.advancedFeaturesCard}
              onPress={() => router.push('/advanced-features')}
            >
              <View style={styles.advancedFeaturesContent}>
                <Text style={styles.advancedFeaturesTitle}>Strumenti Professionali</Text>
                <Text style={styles.advancedFeaturesDescription}>
                  • Registrazione automatica Agenzia delle Entrate{"\n"}
                  • Background check inquilini{"\n"}
                  • Tour virtuali 360°{"\n"}
                  • Verifica identità avanzata
                </Text>
              </View>
              <ArrowRight size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* User Dashboard (if logged in) */}
          {user && (
            <>
              <View style={styles.section}>
                <View style={styles.sectionTitleContainer}>
                  <User size={20} color={Colors.primary} />
                  <Text style={styles.sectionTitle}>La Tua Dashboard</Text>
                </View>
                <View style={styles.userHeader}>
                  <Text style={styles.userName}>Bentornato, {user.full_name}!</Text>
                  <ModeSwitch
                    currentMode={user.current_mode}
                    availableModes={user.account_modes}
                    onModeChange={switchMode}
                  />
                </View>
                
                <View style={styles.userStatsGrid}>
                  {userStats.map((stat) => (
                    <View key={stat.label} style={styles.userStatCard}>
                      <View style={[styles.userStatIcon, { backgroundColor: stat.color }]}>
                        <stat.icon size={20} color={Colors.background} />
                      </View>
                      <Text style={styles.userStatValue}>{stat.value}</Text>
                      <Text style={styles.userStatLabel}>{stat.label}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.quickActionsGrid}>
                  {quickActions.map((action) => (
                    <TouchableOpacity
                      key={action.label}
                      style={styles.quickActionCard}
                      onPress={action.action}
                    >
                      <action.icon size={24} color={Colors.primary} />
                      <Text style={styles.quickActionLabel}>{action.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </>
          )}



          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Costruito con <Text>❤️</Text> usando React Native, Expo e le migliori pratiche di sviluppo mobile moderno.
            </Text>
            <Text style={styles.footerSubtext}>
              Smetti di scorrere. Inizia a swipare.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  
  // Hero Section
  heroSection: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  heroContent: {
    alignItems: 'center',
  },
  appName: {
    ...Typography.h1,
    fontSize: 48,
    color: Colors.textLight,
    fontWeight: 'bold' as const,
    marginBottom: Spacing.sm,
  },
  tagline: {
    ...Typography.h3,
    color: Colors.textLight,
    opacity: 0.9,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  heroDescription: {
    ...Typography.body,
    color: Colors.textLight,
    opacity: 0.8,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.md,
  },
  heroButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  primaryButton: {
    backgroundColor: Colors.textLight,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  primaryButtonText: {
    ...Typography.body,
    color: Colors.primary,
    fontWeight: '600' as const,
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  secondaryButtonText: {
    ...Typography.body,
    color: Colors.textLight,
    fontWeight: '600' as const,
  },

  // Content
  content: {
    padding: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.text,
  },

  // Metrics
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#2563eb',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  metricIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  metricValue: {
    ...Typography.h3,
    color: Colors.textLight,
    marginBottom: Spacing.xs,
  },
  metricLabel: {
    ...Typography.small,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },

  // Features
  featureCard: {
    backgroundColor: '#2563eb',
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    ...Typography.body,
    fontWeight: '600' as const,
    color: Colors.textLight,
    marginBottom: Spacing.xs,
  },
  featureDescription: {
    ...Typography.caption,
    color: 'rgba(255, 255, 255, 0.8)',
  },

  // Additional Features
  additionalFeaturesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  additionalFeatureCard: {
    backgroundColor: Colors.backgroundSecondary,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  additionalFeatureText: {
    ...Typography.caption,
    color: Colors.text,
    fontWeight: '500' as const,
  },



  // Advanced Features
  advancedFeaturesCard: {
    backgroundColor: '#2563eb',
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  advancedFeaturesContent: {
    flex: 1,
  },
  advancedFeaturesTitle: {
    ...Typography.body,
    fontWeight: '600' as const,
    color: Colors.textLight,
    marginBottom: Spacing.sm,
  },
  advancedFeaturesDescription: {
    ...Typography.caption,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 18,
  },

  // User Dashboard
  userHeader: {
    marginBottom: Spacing.lg,
  },
  userName: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  userStatsGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  userStatCard: {
    flex: 1,
    backgroundColor: '#2563eb',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  userStatIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  userStatValue: {
    ...Typography.body,
    fontWeight: 'bold' as const,
    color: Colors.textLight,
    marginBottom: Spacing.xs,
  },
  userStatLabel: {
    ...Typography.small,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: '#2563eb',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActionLabel: {
    ...Typography.caption,
    color: Colors.textLight,
    marginTop: Spacing.sm,
    textAlign: 'center',
    fontWeight: '600' as const,
  },



  // Footer
  footer: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    marginTop: Spacing.lg,
  },
  footerText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  footerSubtext: {
    ...Typography.body,
    fontWeight: '600' as const,
    color: Colors.primary,
    textAlign: 'center',
  },
});