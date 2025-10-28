import { 
  useStripe, 
  useApplePay, 
  useGooglePay,
  PaymentMethod,
} from '@stripe/stripe-react-native';
import { STRIPE_CONFIG, PAYMENT_METHOD_TYPES, PaymentMethodType } from '../config/stripe';

export interface PaymentRequest {
  amount: number;
  currency: string;
  description: string;
  billId: string;
  userId: string;
}

export interface PaymentResult {
  success: boolean;
  paymentIntentId?: string;
  error?: string;
  paymentMethod?: PaymentMethod;
}

// Hook-based service functions
export const useStripeService = () => {
  const stripe = useStripe();
  const applePay = useApplePay();
  const googlePay = useGooglePay();

  /**
   * Check if Apple Pay is available on the device
   */
  const isApplePayAvailable = async (): Promise<boolean> => {
    try {
      return await applePay.isApplePaySupported();
    } catch (error) {
      console.error('Error checking Apple Pay availability:', error);
      return false;
    }
  };

  /**
   * Check if Google Pay is available on the device
   */
  const isGooglePayAvailable = async (): Promise<boolean> => {
    try {
      return await googlePay.isGooglePaySupported();
    } catch (error) {
      console.error('Error checking Google Pay availability:', error);
      return false;
    }
  };

  /**
   * Process payment with Apple Pay
   */
  const processApplePayPayment = async (request: PaymentRequest): Promise<PaymentResult> => {
    try {
      if (!stripe) {
        throw new Error('Stripe not initialized');
      }

      // Create PaymentIntent on your backend
      const paymentIntent = await createPaymentIntent(request);
      if (!paymentIntent.success || !paymentIntent.paymentIntentId) {
        throw new Error(paymentIntent.error || 'Failed to create payment intent');
      }

      // Present Apple Pay sheet
      const { error: presentError } = await applePay.presentApplePay({
        cartItems: [
          {
            label: request.description,
            amount: request.amount.toString(),
            type: 'final',
          },
        ],
        country: 'IT',
        currency: request.currency,
      });

      if (presentError) {
        throw new Error(presentError.message);
      }

      // Confirm payment with Apple Pay
      const { error: confirmError } = await stripe.confirmApplePayPayment(
        paymentIntent.paymentIntentId
      );

      if (confirmError) {
        throw new Error(confirmError.message);
      }

      return {
        success: true,
        paymentIntentId: paymentIntent.paymentIntentId,
      };
    } catch (error) {
      console.error('Apple Pay payment error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Apple Pay payment failed',
      };
    }
  };

  /**
   * Process payment with Google Pay
   */
  const processGooglePayPayment = async (request: PaymentRequest): Promise<PaymentResult> => {
    try {
      if (!stripe) {
        throw new Error('Stripe not initialized');
      }

      // Create PaymentIntent on your backend
      const paymentIntent = await createPaymentIntent(request);
      if (!paymentIntent.success || !paymentIntent.paymentIntentId) {
        throw new Error(paymentIntent.error || 'Failed to create payment intent');
      }

      // Present Google Pay sheet
      const { error: presentError } = await googlePay.presentGooglePay({
        forPaymentIntent: paymentIntent.paymentIntentId,
        currencyCode: request.currency,
        countryCode: 'IT',
      });

      if (presentError) {
        throw new Error(presentError.message);
      }

      return {
        success: true,
        paymentIntentId: paymentIntent.paymentIntentId,
      };
    } catch (error) {
      console.error('Google Pay payment error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Google Pay payment failed',
      };
    }
  };

  /**
   * Process payment with saved card
   */
  const processCardPayment = async (request: PaymentRequest, paymentMethodId: string): Promise<PaymentResult> => {
    try {
      if (!stripe) {
        throw new Error('Stripe not initialized');
      }

      // Create PaymentIntent on your backend
      const paymentIntent = await createPaymentIntent(request);
      if (!paymentIntent.success || !paymentIntent.paymentIntentId) {
        throw new Error(paymentIntent.error || 'Failed to create payment intent');
      }

      // Confirm payment with saved card
      const { error } = await stripe.confirmPayment(
        paymentIntent.paymentIntentId,
        {
          paymentMethodId,
        }
      );

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        paymentIntentId: paymentIntent.paymentIntentId,
      };
    } catch (error) {
      console.error('Card payment error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Card payment failed',
      };
    }
  };

  /**
   * Create a PaymentIntent on the backend
   */
  const createPaymentIntent = async (request: PaymentRequest): Promise<{
    success: boolean;
    paymentIntentId?: string;
    error?: string;
  }> => {
    try {
      // This would typically call your backend API
      // For now, we'll simulate it
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      const data = await response.json();
      return {
        success: true,
        paymentIntentId: data.paymentIntentId,
      };
    } catch (error) {
      console.error('Error creating payment intent:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create payment intent',
      };
    }
  };

  /**
   * Get available payment methods for the user
   */
  const getPaymentMethods = async (userId: string): Promise<PaymentMethod[]> => {
    try {
      if (!stripe) {
        throw new Error('Stripe not initialized');
      }

      // This would typically call your backend API to get saved payment methods
      const response = await fetch(`/api/payment-methods/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch payment methods');
      }

      const data = await response.json();
      return data.paymentMethods || [];
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      return [];
    }
  };

  /**
   * Save a payment method for future use
   */
  const savePaymentMethod = async (paymentMethodId: string, userId: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/save-payment-method', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentMethodId,
          userId,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Error saving payment method:', error);
      return false;
    }
  };

  return {
    isApplePayAvailable,
    isGooglePayAvailable,
    processApplePayPayment,
    processGooglePayPayment,
    processCardPayment,
    getPaymentMethods,
    savePaymentMethod,
  };
};