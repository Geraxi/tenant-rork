import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';
import { 
  X, 
  Crown, 
  Heart, 
  MessageCircle, 
  Eye, 
  Zap,
  Check,
  Star
} from 'lucide-react-native';

interface SubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
  onSubscribe: (plan: 'premium' | 'gold') => void;
  feature?: string;
}

interface SubscriptionPlan {
  id: 'premium' | 'gold';
  name: string;
  price: string;
  period: string;
  originalPrice?: string;
  discount?: string;
  features: string[];
  popular?: boolean;
  color: string;
  icon: React.ComponentType<any>;
}

const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'premium',
    name: 'Premium',
    price: '€9.99',
    period: '/mese',
    features: [
      'Swipe illimitati',
      'Vedi chi ti ha messo "Mi piace"',
      'Boost mensile gratuito',
      'Messaggi prioritari',
      'Filtri avanzati'
    ],
    color: Colors.primary,
    icon: Crown,
  },
  {
    id: 'gold',
    name: 'Gold',
    price: '€19.99',
    period: '/mese',
    originalPrice: '€29.99',
    discount: '33% OFF',
    features: [
      'Tutto di Premium',
      'Super Like illimitati',
      'Rewind illimitati',
      'Boost settimanali',
      'Profilo in evidenza',
      'Lettura messaggi senza match',
      'Supporto prioritario'
    ],
    popular: true,
    color: '#FFD700',
    icon: Star,
  },
];

const featureDescriptions: Record<string, { title: string; description: string; icon: React.ComponentType<any> }> = {
  unlimited_swipes: {
    title: 'Swipe Illimitati',
    description: 'Scorri senza limiti e trova più match ogni giorno.',
    icon: Heart,
  },
  see_likes: {
    title: 'Vedi Chi Ti Piace',
    description: 'Scopri chi ti ha già messo "Mi piace" e fai match istantanei.',
    icon: Eye,
  },
  priority_messages: {
    title: 'Messaggi Prioritari',
    description: 'I tuoi messaggi appaiono per primi nella lista chat.',
    icon: MessageCircle,
  },
  boost: {
    title: 'Boost Profilo',
    description: 'Aumenta la visibilità del tuo profilo per 30 minuti.',
    icon: Zap,
  },
};

export default function SubscriptionModal({ 
  visible, 
  onClose, 
  onSubscribe, 
  feature 
}: SubscriptionModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<'premium' | 'gold'>('premium');

  const featureInfo = feature ? featureDescriptions[feature] : null;

  const handleSubscribe = () => {
    onSubscribe(selectedPlan);
    onClose();
  };

  const BlurComponent = Platform.OS === 'web' ? View : BlurView;
  const blurProps = Platform.OS === 'web' 
    ? { style: [styles.overlay, { backgroundColor: 'rgba(0, 0, 0, 0.8)' }] }
    : { style: styles.overlay, intensity: 80, tint: 'dark' as const };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
    >
      <BlurComponent {...blurProps}>
        <View style={styles.container}>
          <ScrollView 
            style={styles.content}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <X size={24} color={Colors.textLight} />
              </TouchableOpacity>
            </View>

            {/* Feature Highlight */}
            {featureInfo && (
              <View style={styles.featureHighlight}>
                <View style={styles.featureIcon}>
                  <featureInfo.icon size={32} color={Colors.primary} />
                </View>
                <Text style={styles.featureTitle}>{featureInfo.title}</Text>
                <Text style={styles.featureDescription}>{featureInfo.description}</Text>
              </View>
            )}

            {/* Main Title */}
            <View style={styles.titleSection}>
              <Text style={styles.mainTitle}>Sblocca Tutto il Potenziale</Text>
              <Text style={styles.subtitle}>
                Ottieni più match e trova la casa perfetta più velocemente
              </Text>
            </View>

            {/* Plans */}
            <View style={styles.plansContainer}>
              {subscriptionPlans.map((plan) => {
                const isSelected = selectedPlan === plan.id;
                const IconComponent = plan.icon;
                
                return (
                  <TouchableOpacity
                    key={plan.id}
                    style={[
                      styles.planCard,
                      isSelected && styles.planCardSelected,
                      plan.popular && styles.planCardPopular,
                    ]}
                    onPress={() => setSelectedPlan(plan.id)}
                  >
                    {plan.popular && (
                      <View style={styles.popularBadge}>
                        <Text style={styles.popularText}>PIÙ POPOLARE</Text>
                      </View>
                    )}
                    
                    {plan.discount && (
                      <View style={styles.discountBadge}>
                        <Text style={styles.discountText}>{plan.discount}</Text>
                      </View>
                    )}

                    <View style={styles.planHeader}>
                      <View style={[styles.planIcon, { backgroundColor: plan.color + '20' }]}>
                        <IconComponent size={24} color={plan.color} />
                      </View>
                      <View style={styles.planInfo}>
                        <Text style={styles.planName}>{plan.name}</Text>
                        <View style={styles.priceContainer}>
                          <Text style={styles.planPrice}>{plan.price}</Text>
                          <Text style={styles.planPeriod}>{plan.period}</Text>
                          {plan.originalPrice && (
                            <Text style={styles.originalPrice}>{plan.originalPrice}</Text>
                          )}
                        </View>
                      </View>
                    </View>

                    <View style={styles.featuresContainer}>
                      {plan.features.map((feature, index) => (
                        <View key={index} style={styles.featureRow}>
                          <Check size={16} color={Colors.success} />
                          <Text style={styles.featureText}>{feature}</Text>
                        </View>
                      ))}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Benefits */}
            <View style={styles.benefitsSection}>
              <Text style={styles.benefitsTitle}>Perché scegliere Premium?</Text>
              <View style={styles.benefitsList}>
                <View style={styles.benefitItem}>
                  <Heart size={20} color={Colors.primary} />
                  <Text style={styles.benefitText}>3x più match in media</Text>
                </View>
                <View style={styles.benefitItem}>
                  <Zap size={20} color={Colors.primary} />
                  <Text style={styles.benefitText}>Trova casa 50% più velocemente</Text>
                </View>
                <View style={styles.benefitItem}>
                  <Crown size={20} color={Colors.primary} />
                  <Text style={styles.benefitText}>Accesso a funzioni esclusive</Text>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.subscribeButton} onPress={handleSubscribe}>
              <Text style={styles.subscribeButtonText}>
                Inizia con {subscriptionPlans.find(p => p.id === selectedPlan)?.name}
              </Text>
            </TouchableOpacity>
            
            <Text style={styles.disclaimer}>
              Cancella in qualsiasi momento. Rinnovo automatico.
            </Text>
          </View>
        </View>
      </BlurComponent>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    minHeight: '60%',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  closeButton: {
    padding: Spacing.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 20,
  },
  featureHighlight: {
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  featureIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  featureTitle: {
    ...Typography.h2,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  featureDescription: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  titleSection: {
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  mainTitle: {
    ...Typography.h1,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  plansContainer: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  planCard: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  planCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.background,
  },
  planCardPopular: {
    borderColor: '#FFD700',
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    left: Spacing.lg,
    backgroundColor: '#FFD700',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    ...Typography.small,
    color: Colors.text,
    fontWeight: '700',
    fontSize: 10,
  },
  discountBadge: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: Colors.error,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 8,
  },
  discountText: {
    ...Typography.small,
    color: Colors.textLight,
    fontWeight: '600',
    fontSize: 10,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  planIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  planInfo: {
    flex: 1,
  },
  planName: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  planPrice: {
    ...Typography.h2,
    color: Colors.text,
    fontSize: 20,
  },
  planPeriod: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  originalPrice: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textDecorationLine: 'line-through',
    marginLeft: Spacing.sm,
  },
  featuresContainer: {
    gap: Spacing.sm,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    ...Typography.body,
    color: Colors.text,
    marginLeft: Spacing.sm,
    flex: 1,
  },
  benefitsSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  benefitsTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  benefitsList: {
    gap: Spacing.md,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundSecondary,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  benefitText: {
    ...Typography.body,
    color: Colors.text,
    marginLeft: Spacing.sm,
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  subscribeButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  subscribeButtonText: {
    ...Typography.body,
    color: Colors.textLight,
    fontWeight: '600',
    fontSize: 16,
  },
  disclaimer: {
    ...Typography.small,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
});