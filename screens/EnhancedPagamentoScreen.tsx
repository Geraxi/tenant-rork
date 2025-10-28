import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSupabaseAuth } from '../src/hooks/useSupabaseAuth';
import { usePayments } from '../src/hooks/usePayments';
import { useStripeService, PaymentRequest } from '../src/services/stripeService';
import { qrService, BillData as QRBillData } from '../src/services/qrService';
import { ocrService, BillData as OCRBillData } from '../src/services/ocrService';

interface EnhancedPagamentoScreenProps {
  billId: string;
  importo: number;
  categoria: string;
  onPaymentSuccess: () => void;
  onBack: () => void;
}

interface PaymentMethod {
  id: string;
  name: string;
  type: 'apple_pay' | 'google_pay' | 'card' | 'saved_card';
  icon: string;
  available: boolean;
  last4?: string;
  brand?: string;
}

export default function EnhancedPagamentoScreen({
  billId,
  importo,
  categoria,
  onPaymentSuccess,
  onBack,
}: EnhancedPagamentoScreenProps) {
  const { user } = useSupabaseAuth();
  const { createPayment, updatePaymentStatus } = usePayments(user?.id || '');
  const stripeService = useStripeService();
  
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [loadingMethods, setLoadingMethods] = useState(true);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showOCRScanner, setShowOCRScanner] = useState(false);
  const [parsedBillData, setParsedBillData] = useState<QRBillData | OCRBillData | null>(null);

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      setLoadingMethods(true);
      
      // Check availability of payment methods
      const [applePayAvailable, googlePayAvailable] = await Promise.all([
        stripeService.isApplePayAvailable(),
        stripeService.isGooglePayAvailable(),
      ]);

      const methods: PaymentMethod[] = [
        {
          id: 'apple_pay',
          name: 'Apple Pay',
          type: 'apple_pay',
          icon: 'apple',
          available: applePayAvailable,
        },
        {
          id: 'google_pay',
          name: 'Google Pay',
          type: 'google_pay',
          icon: 'google',
          available: googlePayAvailable,
        },
        {
          id: 'card',
          name: 'Carta di Credito',
          type: 'card',
          icon: 'credit-card',
          available: true,
        },
        {
          id: 'saved_card',
          name: 'Carta Salvata',
          type: 'saved_card',
          icon: 'credit-card',
          available: true,
          last4: '4242',
          brand: 'Visa',
        },
      ];

      setPaymentMethods(methods);
      
      // Select first available method
      const firstAvailable = methods.find(m => m.available);
      if (firstAvailable) {
        setSelectedMethod(firstAvailable.id);
      }
    } catch (error) {
      console.error('Error loading payment methods:', error);
      Alert.alert('Errore', 'Impossibile caricare i metodi di pagamento');
    } finally {
      setLoadingMethods(false);
    }
  };

  const handlePayment = async () => {
    if (!selectedMethod) {
      Alert.alert('Errore', 'Seleziona un metodo di pagamento');
      return;
    }

    try {
      setLoading(true);
      
      const paymentRequest: PaymentRequest = {
        amount: importo * 100, // Convert to cents
        currency: 'eur',
        description: `Pagamento ${categoria}`,
        billId,
        userId: user?.id || '',
      };

      let result;

      switch (selectedMethod) {
        case 'apple_pay':
          result = await stripeService.processApplePayPayment(paymentRequest);
          break;
        case 'google_pay':
          result = await stripeService.processGooglePayPayment(paymentRequest);
          break;
        case 'card':
        case 'saved_card':
          // For demo purposes, we'll simulate a successful payment
          result = { success: true, paymentIntentId: 'pi_demo_123' };
          break;
        default:
          throw new Error('Metodo di pagamento non supportato');
      }

      if (result.success) {
        // Create payment in our database
        const paymentResult = await createPayment(billId, selectedMethod as any);
        
        if (paymentResult.success) {
          Alert.alert(
            'Pagamento Completato',
            'Il pagamento è stato elaborato con successo!',
            [
              {
                text: 'OK',
                onPress: onPaymentSuccess,
              },
            ]
          );
        } else {
          Alert.alert('Errore', paymentResult.error || 'Errore durante il salvataggio del pagamento');
        }
      } else {
        Alert.alert('Errore', result.error || 'Pagamento fallito');
      }
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert('Errore', 'Errore durante il pagamento');
    } finally {
      setLoading(false);
    }
  };

  const handleQRScan = async () => {
    try {
      const result = await qrService.showScanOptions();
      
      if (result.success && result.data) {
        const billData = qrService.parseQRData(result.data);
        if (billData) {
          setParsedBillData(billData);
          Alert.alert(
            'Bolletta Scansionata',
            `Importo: €${billData.amount}\nCreditor: ${billData.creditor}\nCategoria: ${billData.category}`,
            [
              {
                text: 'Usa Questi Dati',
                onPress: () => {
                  // Update the bill with scanned data
                  setImporto(billData.amount);
                  setCategoria(billData.category);
                },
              },
              {
                text: 'Annulla',
                style: 'cancel',
              },
            ]
          );
        } else {
          Alert.alert('Errore', 'Impossibile analizzare i dati della bolletta');
        }
      }
    } catch (error) {
      console.error('QR scan error:', error);
      Alert.alert('Errore', 'Errore durante la scansione');
    }
  };

  const handleOCRScan = async () => {
    try {
      const result = await ocrService.showOCROptions();
      
      if (result.success && result.text) {
        const billData = ocrService.parseBillText(result.text);
        if (billData) {
          setParsedBillData(billData);
          Alert.alert(
            'Testo Estratto',
            `Importo: €${billData.amount}\nCreditor: ${billData.creditor}\nCategoria: ${billData.category}`,
            [
              {
                text: 'Usa Questi Dati',
                onPress: () => {
                  // Update the bill with OCR data
                  setImporto(billData.amount);
                  setCategoria(billData.category);
                },
              },
              {
                text: 'Annulla',
                style: 'cancel',
              },
            ]
          );
        } else {
          Alert.alert('Errore', 'Impossibile analizzare il testo della bolletta');
        }
      }
    } catch (error) {
      console.error('OCR error:', error);
      Alert.alert('Errore', 'Errore durante l\'estrazione del testo');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const getPaymentMethodIcon = (type: string) => {
    switch (type) {
      case 'apple_pay':
        return 'apple';
      case 'google_pay':
        return 'google';
      case 'card':
      case 'saved_card':
        return 'credit-card';
      default:
        return 'payment';
    }
  };

  if (loadingMethods) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Caricamento metodi di pagamento...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pagamento</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Bill Information */}
        <View style={styles.billInfo}>
          <Text style={styles.billTitle}>Dettagli Bolletta</Text>
          <View style={styles.billDetails}>
            <Text style={styles.billCategory}>{categoria}</Text>
            <Text style={styles.billAmount}>{formatCurrency(importo)}</Text>
            <Text style={styles.billId}>ID: {billId}</Text>
          </View>
        </View>

        {/* Scan Options */}
        <View style={styles.scanSection}>
          <Text style={styles.sectionTitle}>Scansiona Bolletta</Text>
          <View style={styles.scanButtons}>
            <TouchableOpacity style={styles.scanButton} onPress={handleQRScan}>
              <MaterialIcons name="qr-code-scanner" size={24} color="#2196F3" />
              <Text style={styles.scanButtonText}>QR Code</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.scanButton} onPress={handleOCRScan}>
              <MaterialIcons name="text-fields" size={24} color="#2196F3" />
              <Text style={styles.scanButtonText}>OCR</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Payment Methods */}
        <View style={styles.paymentSection}>
          <Text style={styles.sectionTitle}>Metodo di Pagamento</Text>
          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.paymentMethod,
                selectedMethod === method.id && styles.selectedPaymentMethod,
                !method.available && styles.disabledPaymentMethod,
              ]}
              onPress={() => method.available && setSelectedMethod(method.id)}
              disabled={!method.available}
            >
              <View style={styles.paymentMethodInfo}>
                <MaterialIcons 
                  name={getPaymentMethodIcon(method.type)} 
                  size={24} 
                  color={method.available ? "#333" : "#ccc"} 
                />
                <View style={styles.paymentMethodDetails}>
                  <Text style={[
                    styles.paymentMethodName,
                    !method.available && styles.disabledText
                  ]}>
                    {method.name}
                  </Text>
                  {method.last4 && (
                    <Text style={styles.paymentMethodDetails}>
                      {method.brand} •••• {method.last4}
                    </Text>
                  )}
                </View>
              </View>
              {selectedMethod === method.id && (
                <MaterialIcons name="check-circle" size={24} color="#2196F3" />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Parsed Bill Data */}
        {parsedBillData && (
          <View style={styles.parsedDataSection}>
            <Text style={styles.sectionTitle}>Dati Estratti</Text>
            <View style={styles.parsedData}>
              <Text style={styles.parsedDataText}>
                <Text style={styles.parsedDataLabel}>Importo: </Text>
                {formatCurrency(parsedBillData.amount)}
              </Text>
              <Text style={styles.parsedDataText}>
                <Text style={styles.parsedDataLabel}>Creditor: </Text>
                {parsedBillData.creditor}
              </Text>
              <Text style={styles.parsedDataText}>
                <Text style={styles.parsedDataLabel}>Categoria: </Text>
                {parsedBillData.category}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Pay Button */}
      <View style={styles.payButtonContainer}>
        <TouchableOpacity
          style={[styles.payButton, loading && styles.disabledButton]}
          onPress={handlePayment}
          disabled={loading}
        >
          <LinearGradient
            colors={['#2196F3', '#1976D2']}
            style={styles.payButtonGradient}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <MaterialIcons name="payment" size={24} color="#fff" />
                <Text style={styles.payButtonText}>
                  Paga {formatCurrency(importo)}
                </Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  billInfo: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  billTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  billDetails: {
    alignItems: 'center',
  },
  billCategory: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  billAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 8,
  },
  billId: {
    fontSize: 14,
    color: '#999',
  },
  scanSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  scanButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  scanButton: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f0f8ff',
    borderRadius: 12,
    minWidth: 100,
  },
  scanButtonText: {
    marginTop: 8,
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '500',
  },
  paymentSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    marginBottom: 12,
  },
  selectedPaymentMethod: {
    borderColor: '#2196F3',
    backgroundColor: '#f0f8ff',
  },
  disabledPaymentMethod: {
    opacity: 0.5,
  },
  paymentMethodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentMethodDetails: {
    marginLeft: 12,
    flex: 1,
  },
  paymentMethodName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  disabledText: {
    color: '#ccc',
  },
  parsedDataSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  parsedData: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
  },
  parsedDataText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  parsedDataLabel: {
    fontWeight: '600',
    color: '#666',
  },
  payButtonContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  payButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  disabledButton: {
    opacity: 0.6,
  },
  payButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  payButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
