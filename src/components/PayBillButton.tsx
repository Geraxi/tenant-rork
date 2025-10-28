import React, { useCallback, useState } from 'react';
import { 
  Platform, 
  TouchableOpacity, 
  Text, 
  ActivityIndicator, 
  View, 
  StyleSheet,
  Alert 
} from 'react-native';
import { 
  useStripe, 
  initPaymentSheet, 
  presentPaymentSheet, 
  presentApplePay, 
  confirmApplePayPayment, 
  isApplePaySupported 
} from '@stripe/stripe-react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { billsApi, transactionsApi, Bill } from '../lib/supabase';

interface PayBillButtonProps {
  billId: string;
  amountCents: number;
  label?: string;
  onPaymentSuccess?: () => void;
  onPaymentError?: (error: string) => void;
  bill?: Bill; // Optional bill data for better payment context
}

export default function PayBillButton({
  billId,
  amountCents,
  label = 'Paga',
  onPaymentSuccess,
  onPaymentError,
  bill
}: PayBillButtonProps) {
  const stripe = useStripe();
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(true);

  const payWithApplePay = useCallback(async () => {
    try {
      const supported = await isApplePaySupported();
      if (!supported) {
        console.log('Apple Pay not supported');
        return false;
      }

      // Get tax type display name
      const taxTypeNames = {
        'IMU': 'IMU - Imposta Municipale',
        'TARI': 'TARI - Tassa Rifiuti',
        'TASI': 'TASI - Tassa Servizi',
        'CONSORZIO': 'Consorzio di Bonifica',
        'CONDOMINIO': 'Spese Condominiali',
        'CANONE_UNICO': 'Canone Unico',
        'OTHER': 'Altro'
      };

      const taxDisplayName = taxTypeNames[bill?.tax_type || 'OTHER'] || 'Bolletta';
      const providerName = bill?.provider_name || 'Ente';

      const res = await presentApplePay({
        cartItems: [{ 
          label: `${taxDisplayName} - ${providerName}`, 
          amount: (amountCents / 100).toFixed(2) 
        }],
        country: 'IT',
        currency: 'EUR',
        requiredBillingAddressFields: ['emailAddress', 'name']
      });

      if (res.error) {
        console.log('Apple Pay presentation error:', res.error);
        return false;
      }

      // Confirm on server: create a PI, then confirm with ApplePay token
      const response = await fetch(`${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/pay-bill`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}` 
        },
        body: JSON.stringify({ 
          billId, 
          amountCents,
          paymentMethod: 'apple_pay',
          taxType: bill?.tax_type,
          providerName: bill?.provider_name
        })
      });
      
      const json = await response.json();
      if (!json?.clientSecret) {
        console.log('No client secret received');
        return false;
      }

      const confirmResult = await confirmApplePayPayment(json.clientSecret);
      
      if (!confirmResult.error) {
        // Update bill status
        await billsApi.updateBillStatus(billId, 'paid');
        
        // Create transaction record
        await transactionsApi.createTransaction({
          bill_id: billId,
          amount: amountCents / 100,
          provider: 'stripe',
          status: 'paid',
          stripe_payment_intent: json.clientSecret
        });
      }
      
      return !confirmResult.error;
    } catch (error: any) {
      console.log('Apple Pay error:', error);
      return false;
    }
  }, [billId, amountCents, bill]);

  const payWithSavedCard = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/create-payment-sheet`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}` 
        },
        body: JSON.stringify({ 
          billId, 
          amountCents,
          taxType: bill?.tax_type,
          providerName: bill?.provider_name
        })
      });
      
      const json = await response.json();
      if (!json?.paymentIntent || !json?.ephemeralKey || !json?.customer) {
        Alert.alert('Errore', 'Inizializzazione pagamento fallita');
        return false;
      }

      const initResult = await initPaymentSheet({
        merchantDisplayName: 'MyTenant - Pagamenti Fiscali',
        customerId: json.customer,
        customerEphemeralKeySecret: json.ephemeralKey,
        paymentIntentClientSecret: json.paymentIntent,
        allowsDelayedPaymentMethods: false,
        defaultBillingDetails: {
          name: 'Cliente',
        },
      });
      
      if (initResult.error) {
        console.log('Payment sheet init error:', initResult.error);
        return false;
      }

      const presentResult = await presentPaymentSheet();
      if (presentResult.error) {
        console.log('Payment sheet present error:', presentResult.error);
        return false;
      }

      // Update bill status
      await billsApi.updateBillStatus(billId, 'paid');
      
      // Create transaction record
      await transactionsApi.createTransaction({
        bill_id: billId,
        amount: amountCents / 100,
        provider: 'stripe',
        status: 'paid',
        stripe_payment_intent: json.paymentIntent
      });

      return true;
    } catch (error: any) {
      console.log('Payment sheet error:', error);
      return false;
    }
  }, [billId, amountCents, bill]);

  const onPress = async () => {
    if (!ready || loading) return;
    
    setLoading(true);
    let success = false;
    
    try {
      // Try Apple Pay first on iOS
      if (Platform.OS === 'ios') {
        const applePaySupported = await isApplePaySupported();
        if (applePaySupported) {
          console.log('Attempting Apple Pay...');
          success = await payWithApplePay();
        }
      }
      
      // Fallback to Payment Sheet if Apple Pay failed or not available
      if (!success) {
        console.log('Attempting Payment Sheet...');
        success = await payWithSavedCard();
      }
      
      if (success) {
        const taxTypeNames = {
          'IMU': 'IMU',
          'TARI': 'TARI',
          'TASI': 'TASI',
          'CONSORZIO': 'Consorzio',
          'CONDOMINIO': 'Condominio',
          'CANONE_UNICO': 'Canone',
          'OTHER': 'Bolletta'
        };
        const taxDisplayName = taxTypeNames[bill?.tax_type || 'OTHER'] || 'Bolletta';
        
        Alert.alert('Pagamento Completato', `${taxDisplayName} pagata con successo! ✅`, [
          { text: 'OK', onPress: onPaymentSuccess }
        ]);
      } else {
        Alert.alert('Errore', 'Pagamento fallito. Riprova. ❌');
        onPaymentError?.('Payment failed');
      }
    } catch (error: any) {
      console.log('Payment error:', error);
      Alert.alert('Errore', error.message || 'Pagamento fallito');
      onPaymentError?.(error.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (cents: number) => {
    return (cents / 100).toFixed(2);
  };

  const getTaxTypeIcon = () => {
    switch (bill?.tax_type) {
      case 'IMU':
        return 'home';
      case 'TARI':
        return 'delete';
      case 'TASI':
        return 'build';
      case 'CONSORZIO':
        return 'water';
      case 'CONDOMINIO':
        return 'apartment';
      case 'CANONE_UNICO':
        return 'account-balance';
      default:
        return 'payment';
    }
  };

  const getTaxTypeColor = () => {
    switch (bill?.tax_type) {
      case 'IMU':
        return '#FF5722';
      case 'TARI':
        return '#4CAF50';
      case 'TASI':
        return '#2196F3';
      case 'CONSORZIO':
        return '#00BCD4';
      case 'CONDOMINIO':
        return '#9C27B0';
      case 'CANONE_UNICO':
        return '#FF9800';
      default:
        return '#4CAF50';
    }
  };

  return (
    <TouchableOpacity 
      onPress={onPress} 
      disabled={!ready || loading} 
      style={[
        styles.button,
        { backgroundColor: getTaxTypeColor() },
        (!ready || loading) && styles.buttonDisabled
      ]}
    >
      {loading ? (
        <ActivityIndicator color="white" />
      ) : (
        <>
          <MaterialIcons name={getTaxTypeIcon()} size={20} color="white" />
          <Text style={styles.buttonText}>
            {label} (€{formatAmount(amountCents)})
          </Text>
          {Platform.OS === 'ios' && (
            <MaterialIcons name="apple" size={16} color="white" style={styles.appleIcon} />
          )}
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  appleIcon: {
    marginLeft: 4,
  },
});
