import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSupabaseAuth } from '../src/hooks/useSupabaseAuth';
import { usePayments } from '../src/hooks/usePayments';
import { creaPagamento, ottieniMetodiPagamento, formattaValuta } from '../src/api/pagopa';

interface PagamentoScreenProps {
  billId: string;
  importo: number;
  categoria: string;
  onPaymentSuccess: () => void;
  onBack: () => void;
}

interface MetodoPagamento {
  id: string;
  nome: string;
  descrizione: string;
  icona: string;
  disponibile: boolean;
}

export default function PagamentoScreen({
  billId,
  importo,
  categoria,
  onPaymentSuccess,
  onBack,
}: PagamentoScreenProps) {
  const { user } = useSupabaseAuth();
  const { createPayment, updatePaymentStatus } = usePayments(user?.id || '');
  
  const isLandlord = user?.ruolo === 'landlord';
  
  const [metodiPagamento, setMetodiPagamento] = useState<MetodoPagamento[]>([]);
  const [metodoSelezionato, setMetodoSelezionato] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [loadingMethods, setLoadingMethods] = useState(true);
  const [paymentCreated, setPaymentCreated] = useState(false);
  const [paymentData, setPaymentData] = useState<any>(null);

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      setLoadingMethods(true);
      const result = await ottieniMetodiPagamento();
      if (result.success && result.data) {
        setMetodiPagamento(result.data);
        // Select first available method by default
        const firstAvailable = result.data.find(m => m.disponibile);
        if (firstAvailable) {
          setMetodoSelezionato(firstAvailable.id);
        }
      }
    } catch (error) {
      console.error('Error loading payment methods:', error);
      Alert.alert('Errore', 'Impossibile caricare i metodi di pagamento');
    } finally {
      setLoadingMethods(false);
    }
  };

  const handleCreatePayment = async () => {
    if (!metodoSelezionato) {
      Alert.alert('Errore', 'Seleziona un metodo di pagamento');
      return;
    }

    try {
      setLoading(true);
      
      // Create payment in our database
      const paymentResult = await createPayment(billId, metodoSelezionato as any);
      
      if (!paymentResult.success) {
        Alert.alert('Errore', paymentResult.error || 'Errore durante la creazione del pagamento');
        return;
      }

      // Create Pagopa payment
      const pagopaResult = await creaPagamento(
        importo,
        categoria,
        user?.id || '',
        `Pagamento ${categoria}`
      );

      if (!pagopaResult.success) {
        Alert.alert('Errore', pagopaResult.error || 'Errore durante la creazione del pagamento Pagopa');
        return;
      }

      setPaymentData(pagopaResult.data);
      setPaymentCreated(true);

      // Update payment with Pagopa data
      if (paymentResult.payment) {
        await updatePaymentStatus(paymentResult.payment.id, 'in_attesa');
      }

    } catch (error) {
      console.error('Error creating payment:', error);
      Alert.alert('Errore', 'Errore durante la creazione del pagamento');
    } finally {
      setLoading(false);
    }
  };

  const handleSimulatePayment = async () => {
    if (!paymentData) return;

    try {
      setLoading(true);
      
      // Simulate payment completion after 3 seconds
      setTimeout(async () => {
        try {
          // Update payment status to completed
          if (paymentData.id) {
            await updatePaymentStatus(paymentData.id, 'completato');
          }
          
          Alert.alert(
            'Pagamento Completato!',
            `Il pagamento di ${formattaValuta(importo)} è stato elaborato con successo.`,
            [
              {
                text: 'OK',
                onPress: onPaymentSuccess,
              },
            ]
          );
        } catch (error) {
          console.error('Error completing payment:', error);
          Alert.alert('Errore', 'Errore durante il completamento del pagamento');
        } finally {
          setLoading(false);
        }
      }, 3000);

    } catch (error) {
      console.error('Error simulating payment:', error);
      Alert.alert('Errore', 'Errore durante la simulazione del pagamento');
      setLoading(false);
    }
  };

  const getMethodIcon = (metodo: string) => {
    switch (metodo) {
      case 'carta_credito':
        return 'credit-card';
      case 'carta_debito':
        return 'account-balance';
      case 'bonifico':
        return 'account-balance-wallet';
      case 'paypal':
        return 'account-balance-wallet';
      case 'apple_pay':
        return 'apple';
      case 'google_pay':
        return 'payment';
      default:
        return 'payment';
    }
  };

  const getMethodColor = (metodo: string) => {
    switch (metodo) {
      case 'carta_credito':
        return '#2196F3';
      case 'carta_debito':
        return '#4CAF50';
      case 'bonifico':
        return '#FF9800';
      case 'paypal':
        return '#0070BA';
      case 'apple_pay':
        return '#000';
      case 'google_pay':
        return '#4285F4';
      default:
        return '#666';
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

  if (paymentCreated && paymentData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <MaterialIcons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isLandlord ? 'Riscossione Configurata' : 'Pagamento Creato'}
          </Text>
        </View>

        <ScrollView style={styles.scrollView}>
          <View style={styles.successContainer}>
            <MaterialIcons name="check-circle" size={64} color="#4CAF50" />
            <Text style={styles.successTitle}>
              {isLandlord ? 'Riscossione Configurata!' : 'Pagamento Creato!'}
            </Text>
            <Text style={styles.successText}>
              {isLandlord 
                ? 'Il tuo metodo di riscossione è stato configurato con successo. Ora puoi ricevere pagamenti dagli inquilini.'
                : 'Il tuo pagamento è stato creato con successo. Puoi procedere con il pagamento tramite il link fornito.'
              }
            </Text>
          </View>

          <View style={styles.paymentDetails}>
            <Text style={styles.detailsTitle}>
              {isLandlord ? 'Dettagli Riscossione' : 'Dettagli Pagamento'}
            </Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>
                {isLandlord ? 'Importo Ricevuto:' : 'Importo:'}
              </Text>
              <Text style={styles.detailValue}>{formattaValuta(importo)}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Categoria:</Text>
              <Text style={styles.detailValue}>
                {isLandlord ? 'Affitto Ricevuto' : categoria}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Stato:</Text>
              <Text style={[styles.detailValue, { color: isLandlord ? '#4CAF50' : '#FF9800' }]}>
                {isLandlord ? 'Configurato' : 'In attesa'}
              </Text>
            </View>
          </View>

          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.simulateButton}
              onPress={handleSimulatePayment}
              disabled={loading}
            >
              <LinearGradient
                colors={['#4CAF50', '#45a049']}
                style={styles.simulateButtonGradient}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <MaterialIcons name="payment" size={20} color="#fff" />
                    <Text style={styles.simulateButtonText}>
                      Simula Pagamento (Test)
                    </Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.linkButton}>
              <MaterialIcons name="open-in-new" size={20} color="#2196F3" />
              <Text style={styles.linkButtonText}>
                Apri Link Pagopa
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <MaterialIcons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isLandlord ? 'Riscossione Pagamento' : 'Pagamento'}
          </Text>
        </View>

      <ScrollView style={styles.scrollView}>
        {/* Payment Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>
            {isLandlord ? 'Riepilogo Riscossione' : 'Riepilogo Pagamento'}
          </Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Categoria:</Text>
            <Text style={styles.summaryValue}>
              {isLandlord ? 'Affitto Ricevuto' : categoria}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              {isLandlord ? 'Importo Ricevuto:' : 'Importo:'}
            </Text>
            <Text style={[styles.summaryValue, styles.amountText]}>
              {formattaValuta(importo)}
            </Text>
          </View>
        </View>

        {/* Payment Methods */}
        <View style={styles.methodsContainer}>
          <Text style={styles.methodsTitle}>
            {isLandlord ? 'Metodi di Riscossione' : 'Seleziona Metodo di Pagamento'}
          </Text>
          
          {isLandlord ? (
            // Landlord collection methods
            <>
              <TouchableOpacity
                style={[styles.methodCard, styles.methodCardSelected]}
                onPress={() => setMetodoSelezionato('bank_transfer')}
              >
                <View style={styles.methodIcon}>
                  <MaterialIcons name="account-balance" size={24} color="#2196F3" />
                </View>
                <View style={styles.methodInfo}>
                  <Text style={styles.methodName}>Bonifico Bancario</Text>
                  <Text style={styles.methodDescription}>Ricevi pagamenti diretti sul tuo conto</Text>
                </View>
                <View style={styles.methodRadio}>
                  <MaterialIcons name="radio-button-checked" size={24} color="#2196F3" />
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.methodCard}
                onPress={() => setMetodoSelezionato('stripe')}
              >
                <View style={styles.methodIcon}>
                  <MaterialIcons name="payment" size={24} color="#6366F1" />
                </View>
                <View style={styles.methodInfo}>
                  <Text style={styles.methodName}>Stripe</Text>
                  <Text style={styles.methodDescription}>Piattaforma di pagamento online</Text>
                </View>
                <View style={styles.methodRadio}>
                  <MaterialIcons 
                    name={metodoSelezionato === 'stripe' ? "radio-button-checked" : "radio-button-unchecked"} 
                    size={24} 
                    color="#2196F3" 
                  />
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.methodCard}
                onPress={() => setMetodoSelezionato('paypal')}
              >
                <View style={styles.methodIcon}>
                  <MaterialIcons name="account-balance-wallet" size={24} color="#0070BA" />
                </View>
                <View style={styles.methodInfo}>
                  <Text style={styles.methodName}>PayPal</Text>
                  <Text style={styles.methodDescription}>Ricevi pagamenti via PayPal</Text>
                </View>
                <View style={styles.methodRadio}>
                  <MaterialIcons 
                    name={metodoSelezionato === 'paypal' ? "radio-button-checked" : "radio-button-unchecked"} 
                    size={24} 
                    color="#2196F3" 
                  />
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.methodCard, styles.methodCardDisabled]}
                disabled={true}
              >
                <View style={styles.methodIcon}>
                  <MaterialIcons name="money" size={24} color="#ccc" />
                </View>
                <View style={styles.methodInfo}>
                  <Text style={[styles.methodName, styles.methodNameDisabled]}>Contanti</Text>
                  <Text style={[styles.methodDescription, styles.methodDescriptionDisabled]}>
                    Pagamento in contanti (presto disponibile)
                  </Text>
                </View>
                <View style={styles.methodRadio}>
                  <MaterialIcons name="radio-button-unchecked" size={24} color="#ccc" />
                </View>
              </TouchableOpacity>
            </>
          ) : (
            // Tenant payment methods
            metodiPagamento.map((metodo) => (
              <TouchableOpacity
                key={metodo.id}
                style={[
                  styles.methodCard,
                  metodoSelezionato === metodo.id && styles.methodCardSelected,
                  !metodo.disponibile && styles.methodCardDisabled
                ]}
                onPress={() => metodo.disponibile && setMetodoSelezionato(metodo.id)}
                disabled={!metodo.disponibile}
              >
                <View style={styles.methodIcon}>
                  <MaterialIcons 
                    name={getMethodIcon(metodo.id)} 
                    size={24} 
                    color={metodo.disponibile ? getMethodColor(metodo.id) : '#ccc'} 
                  />
                </View>
                <View style={styles.methodInfo}>
                  <Text style={[
                    styles.methodName,
                    !metodo.disponibile && styles.methodNameDisabled
                  ]}>
                    {metodo.nome}
                  </Text>
                  <Text style={[
                    styles.methodDescription,
                    !metodo.disponibile && styles.methodDescriptionDisabled
                  ]}>
                    {metodo.descrizione}
                  </Text>
                </View>
                <View style={styles.methodRadio}>
                  <MaterialIcons 
                    name={metodoSelezionato === metodo.id ? "radio-button-checked" : "radio-button-unchecked"} 
                    size={24} 
                    color={metodo.disponibile ? "#2196F3" : "#ccc"} 
                  />
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Security Notice */}
        <View style={styles.securityNotice}>
          <MaterialIcons name="security" size={20} color="#4CAF50" />
          <Text style={styles.securityText}>
            {isLandlord 
              ? 'I tuoi metodi di riscossione sono sicuri e protetti'
              : 'I tuoi pagamenti sono protetti con crittografia SSL e conformi agli standard PCI DSS'
            }
          </Text>
        </View>
      </ScrollView>

      {/* Payment Button */}
      <View style={styles.paymentButtonContainer}>
        <TouchableOpacity
          style={[styles.paymentButton, loading && styles.paymentButtonDisabled]}
          onPress={handleCreatePayment}
          disabled={loading || !metodoSelezionato}
        >
          <LinearGradient
            colors={['#2196F3', '#1976D2']}
            style={styles.paymentButtonGradient}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <MaterialIcons 
                  name={isLandlord ? "account-balance" : "payment"} 
                  size={20} 
                  color="#fff" 
                />
                <Text style={styles.paymentButtonText}>
                  {isLandlord 
                    ? `Ricevi ${formattaValuta(importo)}`
                    : `Paga ${formattaValuta(importo)}`
                  }
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
    padding: 20,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  scrollView: {
    flex: 1,
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
  summaryCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#666',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  amountText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  methodsContainer: {
    margin: 16,
  },
  methodsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  methodCardSelected: {
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  methodCardDisabled: {
    opacity: 0.5,
  },
  methodIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  methodInfo: {
    flex: 1,
  },
  methodName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  methodNameDisabled: {
    color: '#ccc',
  },
  methodDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  methodDescriptionDisabled: {
    color: '#ccc',
  },
  methodRadio: {
    marginLeft: 16,
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  securityText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#2E7D32',
    lineHeight: 20,
  },
  paymentButtonContainer: {
    padding: 20,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  paymentButton: {
    borderRadius: 12,
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  paymentButtonDisabled: {
    opacity: 0.6,
  },
  paymentButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  paymentButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  successContainer: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
  },
  successText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
  paymentDetails: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 16,
    color: '#666',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  actionsContainer: {
    padding: 16,
  },
  simulateButton: {
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  simulateButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  simulateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  linkButtonText: {
    color: '#2196F3',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
