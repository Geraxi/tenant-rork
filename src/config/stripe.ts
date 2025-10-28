import { initStripe } from '@stripe/stripe-react-native';

// Stripe configuration
export const STRIPE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_51234567890abcdef'; // Replace with your actual publishable key

// Initialize Stripe
export const initializeStripe = async () => {
  try {
    await initStripe({
      publishableKey: STRIPE_PUBLISHABLE_KEY,
      merchantIdentifier: 'merchant.com.rentflow.app',
      urlScheme: 'rentflow',
    });
    console.log('✅ Stripe initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing Stripe:', error);
  }
};

// Stripe configuration for payments
export const STRIPE_CONFIG = {
  publishableKey: STRIPE_PUBLISHABLE_KEY,
  merchantIdentifier: 'merchant.com.rentflow.app',
  urlScheme: 'rentflow',
  // Enable Apple Pay and Google Pay
  enableApplePay: true,
  enableGooglePay: true,
  // Set up automatic payment methods
  automaticPaymentMethods: {
    enabled: true,
    allowRedirects: 'never',
  },
};

// Payment method types
export const PAYMENT_METHOD_TYPES = {
  APPLE_PAY: 'apple_pay',
  GOOGLE_PAY: 'google_pay',
  CARD: 'card',
  SAVED_CARD: 'saved_card',
} as const;

export type PaymentMethodType = typeof PAYMENT_METHOD_TYPES[keyof typeof PAYMENT_METHOD_TYPES];
