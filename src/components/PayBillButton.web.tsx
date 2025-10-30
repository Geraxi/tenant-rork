import React, { useState } from 'react';
import { 
  TouchableOpacity, 
  Text, 
  ActivityIndicator, 
  StyleSheet,
  Alert 
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Bill } from '../lib/supabase';

interface PayBillButtonProps {
  billId: string;
  amountCents: number;
  label?: string;
  onPaymentSuccess?: () => void;
  onPaymentError?: (error: string) => void;
  bill?: Bill;
}

export default function PayBillButton({
  billId,
  amountCents,
  label = 'Paga',
  onPaymentSuccess,
  onPaymentError,
  bill
}: PayBillButtonProps) {
  const [loading, setLoading] = useState(false);
  const [ready] = useState(true);

  const onPress = async () => {
    if (!ready || loading) return;
    
    setLoading(true);
    
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
      if (!json?.paymentIntent) {
        Alert.alert('Errore', 'Inizializzazione pagamento fallita');
        onPaymentError?.('Payment initialization failed');
        return;
      }

      Alert.alert(
        'Pagamento Web',
        'Il pagamento web completo sarà implementato presto. Per ora, puoi utilizzare l\'app mobile per i pagamenti.',
        [{ text: 'OK' }]
      );
      
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
});
