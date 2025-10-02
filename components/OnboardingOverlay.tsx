import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors, Typography, Spacing } from '@/constants/theme';
import { Heart, X, Filter, Info } from 'lucide-react-native';



interface OnboardingOverlayProps {
  visible: boolean;
  onComplete: () => void;
}

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  position: { x: number; y: number };
  highlight?: { x: number; y: number; width: number; height: number };
}



export default function OnboardingOverlay({ visible, onComplete }: OnboardingOverlayProps) {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const [currentStep, setCurrentStep] = useState<number>(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const highlightAnim = useRef(new Animated.Value(0)).current;

  const onboardingSteps: OnboardingStep[] = [
    {
      id: 'swipe',
      title: 'Scorri per Scegliere',
      description: 'Scorri a destra per mettere "Mi piace" o a sinistra per passare oltre. Puoi anche usare i pulsanti in basso!',
      icon: Heart,
      position: { x: screenWidth * 0.5, y: screenHeight * 0.4 },
      highlight: { x: 20, y: screenHeight * 0.2, width: screenWidth - 40, height: screenHeight * 0.5 },
    },
    {
      id: 'details',
      title: 'Tocca per i Dettagli',
      description: 'Tocca una carta per vedere tutti i dettagli della proprietà o del profilo.',
      icon: Info,
      position: { x: screenWidth * 0.5, y: screenHeight * 0.3 },
    },
    {
      id: 'filters',
      title: 'Usa i Filtri',
      description: 'Personalizza la tua ricerca con filtri per prezzo, tipo di proprietà e posizione.',
      icon: Filter,
      position: { x: screenWidth * 0.5, y: Math.min(screenHeight * 0.5, screenHeight - 200) },
    },
  ];

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.loop(
          Animated.sequence([
            Animated.timing(highlightAnim, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(highlightAnim, {
              toValue: 0.3,
              duration: 1000,
              useNativeDriver: true,
            }),
          ])
        ),
      ]).start();
    }
  }, [visible, fadeAnim, scaleAnim, highlightAnim]);

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    onComplete();
  };

  const currentStepData = onboardingSteps[currentStep];
  const IconComponent = currentStepData?.icon;

  if (!visible || !currentStepData) return null;

  const BlurComponent = Platform.OS === 'web' ? View : BlurView;
  const blurProps = Platform.OS === 'web' 
    ? { style: [styles.overlay, { backgroundColor: 'rgba(0, 0, 0, 0.7)' }] }
    : { style: styles.overlay, intensity: 50, tint: 'dark' as const };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <BlurComponent {...blurProps}>
        {/* Highlight area */}
        {currentStepData.highlight && (
          <Animated.View
            style={[
              styles.highlight,
              {
                left: currentStepData.highlight.x,
                top: currentStepData.highlight.y,
                width: currentStepData.highlight.width,
                height: currentStepData.highlight.height,
                opacity: highlightAnim,
              },
            ]}
          />
        )}

        {/* Tooltip */}
        <Animated.View
          style={[
            styles.tooltip,
            {
              left: Math.max(20, Math.min(currentStepData.position.x - 150, screenWidth - 320)),
              top: Math.max(100, Math.min(currentStepData.position.y, screenHeight - 300)),
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.tooltipContent}>
            <View style={styles.iconContainer}>
              <IconComponent size={24} color={Colors.primary} />
            </View>
            <Text style={styles.tooltipTitle}>{currentStepData.title}</Text>
            <Text style={styles.tooltipDescription}>{currentStepData.description}</Text>
            
            <View style={styles.tooltipActions}>
              <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                <Text style={styles.skipButtonText}>Salta</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                <Text style={styles.nextButtonText}>
                  {currentStep === onboardingSteps.length - 1 ? 'Inizia!' : 'Avanti'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Arrow pointing to highlight */}
          {currentStepData.highlight && (
            <View style={styles.arrow} />
          )}
        </Animated.View>

        {/* Progress indicator */}
        <View style={styles.progressContainer}>
          {onboardingSteps.map((step, index) => (
            <View
              key={step.id}
              style={[
                styles.progressDot,
                index === currentStep && styles.progressDotActive,
              ]}
            />
          ))}
        </View>

        {/* Skip button in top right */}
        <TouchableOpacity style={styles.closeButton} onPress={handleSkip}>
          <X size={24} color={Colors.textLight} />
        </TouchableOpacity>
      </BlurComponent>
    </Modal>
  );
}



const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  highlight: {
    position: 'absolute',
    borderRadius: 16,
    borderWidth: 3,
    borderColor: Colors.primary,
    backgroundColor: 'transparent',
  },
  tooltip: {
    position: 'absolute',
    width: 300,
    maxWidth: '90%',
    maxHeight: '80%',
  },
  tooltipContent: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
    maxHeight: '100%',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  tooltipTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  tooltipDescription: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
    lineHeight: 22,
  },
  tooltipActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skipButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  skipButtonText: {
    ...Typography.body,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  nextButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: 8,
  },
  nextButtonText: {
    ...Typography.body,
    color: Colors.textLight,
    fontWeight: '600',
  },
  arrow: {
    position: 'absolute',
    bottom: -8,
    left: '50%',
    marginLeft: -8,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: Colors.background,
  },
  progressContainer: {
    position: 'absolute',
    bottom: 60,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 4,
  },
  progressDotActive: {
    backgroundColor: Colors.textLight,
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    padding: Spacing.sm,
  },
});