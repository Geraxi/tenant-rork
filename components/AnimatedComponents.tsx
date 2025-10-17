import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, ViewStyle, TextStyle, Animated } from 'react-native';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable } from 'react-native';

// Animated Button Component
interface AnimatedButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  style,
  textStyle,
}) => {
  const scale = useRef(new Animated.Value(1)).current;

  const animatedStyle = {
    transform: [{ scale }],
  };

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const getButtonStyle = () => {
    const baseStyle = {
      paddingHorizontal: size === 'sm' ? 16 : size === 'lg' ? 24 : 20,
      paddingVertical: size === 'sm' ? 8 : size === 'lg' ? 16 : 12,
      borderRadius: 12,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    };

    // If custom style is provided, only return base style (no background colors)
    if (style) {
      return baseStyle;
    }

    switch (variant) {
      case 'gradient':
        return baseStyle;
      case 'secondary':
        return {
          ...baseStyle,
          backgroundColor: '#f3f4f6',
          borderWidth: 1,
          borderColor: '#d1d5db',
        };
      case 'primary':
        // For primary variant without custom style, return base style only
        return baseStyle;
      default:
        return {
          ...baseStyle,
          backgroundColor: '#10b981',
        };
    }
  };

  const getTextStyle = () => {
    const baseStyle = {
      fontWeight: '600' as const,
      color: variant === 'secondary' ? '#374151' : '#ffffff',
    };

    switch (size) {
      case 'sm':
        return { ...baseStyle, fontSize: 14 };
      case 'lg':
        return { ...baseStyle, fontSize: 18 };
      default:
        return { ...baseStyle, fontSize: 16 };
    }
  };

  const ButtonContent = () => (
    <Text style={[getTextStyle(), textStyle]}>{title}</Text>
  );

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={({ pressed }) => [
          { opacity: disabled ? 0.5 : pressed ? 0.8 : 1 },
          getButtonStyle(),
          style, // Apply custom style last to override defaults
        ]}
      >
        {variant === 'gradient' ? (
          <LinearGradient
            colors={['#10b981', '#06b6d4']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={getButtonStyle()}
          >
            <ButtonContent />
          </LinearGradient>
        ) : (
          <ButtonContent />
        )}
      </Pressable>
    </Animated.View>
  );
};

// Fade In Animation Component
interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  from?: 'top' | 'bottom' | 'left' | 'right';
  style?: ViewStyle;
}

export const FadeIn: React.FC<FadeInProps> = ({
  children,
  delay = 0,
  duration = 600,
  from = 'bottom',
  style,
}) => {
  const getTranslateY = () => {
    switch (from) {
      case 'top':
        return -50;
      case 'bottom':
        return 50;
      default:
        return 0;
    }
  };

  const getTranslateX = () => {
    switch (from) {
      case 'left':
        return -50;
      case 'right':
        return 50;
      default:
        return 0;
    }
  };

  return (
    <MotiView
      from={{
        opacity: 0,
        translateY: getTranslateY(),
        translateX: getTranslateX(),
      }}
      animate={{
        opacity: 1,
        translateY: 0,
        translateX: 0,
      }}
      transition={{
        type: 'timing',
        duration,
        delay,
      }}
      style={style}
    >
      {children}
    </MotiView>
  );
};

// Scale In Animation Component
interface ScaleInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  style?: ViewStyle;
}

export const ScaleIn: React.FC<ScaleInProps> = ({
  children,
  delay = 0,
  duration = 400,
  style,
}) => {
  return (
    <MotiView
      from={{
        scale: 0,
        opacity: 0,
      }}
      animate={{
        scale: 1,
        opacity: 1,
      }}
      transition={{
        type: 'spring',
        duration,
        delay,
      }}
      style={style}
    >
      {children}
    </MotiView>
  );
};

// Slide In Animation Component
interface SlideInProps {
  children: React.ReactNode;
  direction?: 'left' | 'right' | 'up' | 'down';
  delay?: number;
  duration?: number;
  style?: ViewStyle;
}

export const SlideIn: React.FC<SlideInProps> = ({
  children,
  direction = 'left',
  delay = 0,
  duration = 500,
  style,
}) => {
  const getTranslateX = () => {
    switch (direction) {
      case 'left':
        return -300;
      case 'right':
        return 300;
      default:
        return 0;
    }
  };

  const getTranslateY = () => {
    switch (direction) {
      case 'up':
        return -300;
      case 'down':
        return 300;
      default:
        return 0;
    }
  };

  return (
    <MotiView
      from={{
        translateX: getTranslateX(),
        translateY: getTranslateY(),
        opacity: 0,
      }}
      animate={{
        translateX: 0,
        translateY: 0,
        opacity: 1,
      }}
      transition={{
        type: 'spring',
        duration,
        delay,
      }}
      style={style}
    >
      {children}
    </MotiView>
  );
};

// Pulse Animation Component
interface PulseProps {
  children: React.ReactNode;
  delay?: number;
  style?: ViewStyle;
}

export const Pulse: React.FC<PulseProps> = ({
  children,
  delay = 0,
  style,
}) => {
  return (
    <MotiView
      from={{
        scale: 1,
      }}
      animate={{
        scale: [1, 1.05, 1],
      }}
      transition={{
        type: 'timing',
        duration: 2000,
        delay,
        loop: true,
      }}
      style={style}
    >
      {children}
    </MotiView>
  );
};

// Shimmer Loading Component
interface ShimmerProps {
  width?: number;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const Shimmer: React.FC<ShimmerProps> = ({
  width = 200,
  height = 20,
  borderRadius = 8,
  style,
}) => {
  return (
    <MotiView
      from={{
        opacity: 0.3,
      }}
      animate={{
        opacity: [0.3, 0.7, 0.3],
      }}
      transition={{
        type: 'timing',
        duration: 1500,
        loop: true,
      }}
      style={[
        {
          width,
          height,
          backgroundColor: '#e5e7eb',
          borderRadius,
        },
        style,
      ]}
    />
  );
};

// Gradient Card Component
interface GradientCardProps {
  children: React.ReactNode;
  colors?: string[];
  style?: ViewStyle;
}

export const GradientCard: React.FC<GradientCardProps> = ({
  children,
  colors = ['#10b981', '#06b6d4'],
  style,
}) => {
  return (
    <LinearGradient
      colors={colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        {
          borderRadius: 16,
          padding: 20,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 4,
          },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 5,
        },
        style,
      ]}
    >
      {children}
    </LinearGradient>
  );
};
